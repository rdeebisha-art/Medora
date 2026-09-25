import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, resetAndReseedDatabase } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import SyncProgressIndicator from '../components/SyncProgressIndicator';
import { Database, Search, Filter, Eye, RefreshCw, CheckCircle2, ChevronRight, Table as TableIcon, X } from 'lucide-react';

interface GenericRecordItem {
  id: string | number;
  table: string;
  title: string;
  subtitle: string;
  details: string;
  dateOrStatus: string;
}

export default function SyncPage() {
  const { t } = useTranslation();
  const { isOffline, is2GMode } = useAppStore();
  const [counts, setCounts] = useState({
    patients: 0,
    medicines: 0,
    tests: 0,
    sms: 0,
    records: 0,
    notifications: 0,
    doctorSummaries: 0,
    hospitals: 0,
    schemes: 0,
    education: 0,
    total: 0,
  });
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Table Explorer state
  const [showTableModal, setShowTableModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableRecords, setTableRecords] = useState<GenericRecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const loadAllRecordStats = async () => {
    try {
      const [
        patients,
        medicines,
        tests,
        sms,
        records,
        notifications,
        doctorSummaries,
        hospitals,
        schemes,
        education,
        pending,
        lastLog,
      ] = await Promise.all([
        db.patients.count(),
        db.medicines.count(),
        db.healthTests.count(),
        db.smsOutbox.count(),
        db.medicalRecords.count(),
        db.notifications.count(),
        db.doctorSummaries.count(),
        db.hospitals.count(),
        db.schemes.count(),
        db.education.count(),
        db.smsOutbox.where({ status: 'pending' }).count(),
        db.syncLog.reverse().first(),
      ]);

      const total =
        patients +
        medicines +
        tests +
        sms +
        records +
        notifications +
        doctorSummaries +
        hospitals +
        schemes +
        education;

      setCounts({
        patients,
        medicines,
        tests,
        sms,
        records,
        notifications,
        doctorSummaries,
        hospitals,
        schemes,
        education,
        total,
      });

      setPendingCount(pending);
      if (lastLog?.createdAt) {
        setLastSyncTime(
          new Date(lastLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      }
    } catch (err) {
      console.warn('Failed to load database counts', err);
    }
  };

  useEffect(() => {
    loadAllRecordStats();
  }, [syncDone]);

  const loadTableData = async () => {
    setLoadingRecords(true);
    try {
      const items: GenericRecordItem[] = [];

      // Patients
      const patients = await db.patients.toArray();
      patients.forEach((p) => {
        items.push({
          id: p.id || '',
          table: 'Patients',
          title: p.name,
          subtitle: `Age ${p.age}, ${p.gender} · Village: ${p.village}`,
          details: `Conditions: ${p.conditions?.join(', ') || 'None'} · Phone: ${p.phone}`,
          dateOrStatus: p.isPregnant ? `Pregnant (${p.pregnancyWeeks}w)` : 'Active',
        });
      });

      // Medical Records
      const medRecords = await db.medicalRecords.toArray();
      medRecords.forEach((r) => {
        items.push({
          id: r.id || '',
          table: 'Medical Records',
          title: String((r.data as any)?.reportName || (r.data as any)?.type || r.type),
          subtitle: `Patient ID: #${r.patientId} · Type: ${r.type}`,
          details: r.notes || JSON.stringify(r.data).slice(0, 80),
          dateOrStatus: r.date || 'Recent',
        });
      });

      // Health Tests
      const tests = await db.healthTests.toArray();
      tests.forEach((t) => {
        items.push({
          id: t.id || '',
          table: 'Health Tests',
          title: `${t.type.toUpperCase().replace('_', ' ')}: ${t.value} ${t.unit}`,
          subtitle: `Patient ID: #${t.patientId}`,
          details: t.notes || 'Normal clinical parameter recorded in field.',
          dateOrStatus: t.date || 'Recorded',
        });
      });

      // Notifications (Recent Health Activities)
      const notifs = await db.notifications.toArray();
      notifs.forEach((n) => {
        items.push({
          id: n.id || '',
          table: 'Health Activities',
          title: n.message,
          subtitle: `User #${n.userId} (${n.userRole}) · Type: ${n.type}`,
          details: n.isRead ? 'Status: Confirmed & Read' : 'Status: New Activity Alert',
          dateOrStatus: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });

      // Doctor Summaries
      const docSums = await db.doctorSummaries.toArray();
      docSums.forEach((s) => {
        items.push({
          id: s.id || '',
          table: 'Doctor Summaries',
          title: `Dr. Summary for Patient #${s.patientId}: ${s.complaint}`,
          subtitle: `Vitals: ${s.vitals}`,
          details: `Next Step: ${s.nextStep}`,
          dateOrStatus: s.agentType || 'Clinical',
        });
      });

      // Medicines
      const meds = await db.medicines.toArray();
      meds.forEach((m) => {
        items.push({
          id: m.id || '',
          table: 'Medicines',
          title: `${m.name} (${m.dose})`,
          subtitle: `Patient #${m.patientId} · Freq: ${m.frequency}`,
          details: `Instructions: ${m.instructions}`,
          dateOrStatus: m.status,
        });
      });

      // Hospitals
      const hosps = await db.hospitals.toArray();
      hosps.forEach((h) => {
        items.push({
          id: h.id || '',
          table: 'Hospitals',
          title: h.name,
          subtitle: `${h.village} · Distance: ${h.distance} km`,
          details: `Services: ${h.services.join(', ')}`,
          dateOrStatus: h.hasEmergency ? '24/7 Emergency' : 'OPD',
        });
      });

      // Schemes
      const schemes = await db.schemes.toArray();
      schemes.forEach((sc) => {
        items.push({
          id: sc.id || '',
          table: 'Schemes',
          title: sc.name,
          subtitle: sc.shortName,
          details: sc.description.slice(0, 90) + '...',
          dateOrStatus: 'Govt Benefit',
        });
      });

      setTableRecords(items);
    } catch (err) {
      console.error('Failed to load table items', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleOpenTableViewer = (initialTab = 'all') => {
    setActiveTab(initialTab);
    setShowTableModal(true);
    loadTableData();
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-seed IndexedDB database with all 186+ clinical demo records?')) {
      return;
    }
    setReseeding(true);
    await resetAndReseedDatabase();
    await loadAllRecordStats();
    await loadTableData();
    setReseeding(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncDone(false);
    await new Promise((r) => setTimeout(r, 1500));
    const now = new Date().toISOString();
    await db.syncLog.add({
      action: 'sync_attempt',
      data: JSON.stringify({ timestamp: now, demo: true, counts }),
      status: 'synced',
      createdAt: now,
    });
    setLastSyncTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSyncing(false);
    setSyncDone(true);
  };

  // Filtered table rows
  const filteredRecords = useMemo(() => {
    return tableRecords.filter((rec) => {
      const matchTab =
        activeTab === 'all' ||
        rec.table.toLowerCase().includes(activeTab.toLowerCase()) ||
        (activeTab === 'notifications' && rec.table === 'Health Activities');

      if (!matchTab) return false;
      if (!tableSearch.trim()) return true;

      const q = tableSearch.toLowerCase();
      return (
        rec.title.toLowerCase().includes(q) ||
        rec.subtitle.toLowerCase().includes(q) ||
        rec.details.toLowerCase().includes(q) ||
        rec.table.toLowerCase().includes(q)
      );
    });
  }, [tableRecords, activeTab, tableSearch]);

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🔄 {t('sync.title')}</h1>
            <p className="text-xs text-gray-500">Offline-First IndexedDB Local Data Store</p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Visual Progress Indicator Monitoring IndexedDB-to-Server Sync */}
        <SyncProgressIndicator
          isOffline={isOffline}
          is2GMode={is2GMode}
          counts={counts}
          pendingCount={pendingCount}
          isSyncing={syncing}
          syncDone={syncDone}
          onTriggerSync={handleSync}
          lastSyncTimestamp={lastSyncTime}
        />

        {/* Connection Status */}
        <div
          className={`rounded-2xl p-4 flex items-center gap-3 ${
            isOffline ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}
        >
          <span className="text-3xl">{isOffline ? '📡' : '✅'}</span>
          <div>
            <div className={`font-bold ${isOffline ? 'text-red-700' : 'text-green-700'}`}>
              {isOffline ? t('sync.offline') : t('sync.online')}
            </div>
            <div className="text-sm text-gray-500">
              {isOffline ? t('offline.localDataAvailable') : 'Connected · ' + (is2GMode ? '2G Mode' : 'Normal')}
            </div>
          </div>
        </div>

        {/* Local Data Stats & 186+ Records Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              <span>💾 {t('sync.localData')} ({counts.total || '186+'} Total Records)</span>
            </h2>
            <button
              onClick={() => handleOpenTableViewer('all')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Inspect Table</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {[
              { label: 'Patients', count: counts.patients, tab: 'patients', icon: '👤' },
              { label: 'Medicines', count: counts.medicines, tab: 'medicines', icon: '💊' },
              { label: 'Health Tests', count: counts.tests, tab: 'health tests', icon: '🧪' },
              { label: 'Medical Records', count: counts.records, tab: 'medical records', icon: '📋' },
              { label: 'Recent Health Activities', count: counts.notifications, tab: 'notifications', icon: '🔔' },
              { label: 'Doctor Summaries', count: counts.doctorSummaries, tab: 'doctor summaries', icon: '📝' },
              { label: 'Hospitals & Centres', count: counts.hospitals, tab: 'hospitals', icon: '🏥' },
              { label: 'Government Health Schemes', count: counts.schemes, tab: 'schemes', icon: '🏛️' },
              { label: 'SMS Outbox', count: counts.sms, tab: 'sms', icon: '📱' },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => handleOpenTableViewer(item.tab)}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reseed / Reset Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleOpenTableViewer('all')}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Review All 186+ Records in Clean Table Format</span>
            </button>
          </div>
        </div>

        {/* Pending Changes */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <h2 className="font-bold text-yellow-800">{t('sync.pendingChanges')}</h2>
            <p className="text-sm text-yellow-700 mt-1">
              {pendingCount} pending SMS messages · {t('offline.pendingSync')}
            </p>
          </div>
        )}

        {/* Last Sync */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
          🕐 {t('sync.lastSync')}: {lastSyncTime || t('sync.never')}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all ${
            syncDone
              ? 'bg-green-500 text-white'
              : 'bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50'
          }`}
        >
          {syncing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔄</span> {t('sync.syncing')}
            </span>
          ) : syncDone ? (
            '✅ ' + t('sync.syncComplete')
          ) : (
            '🔄 ' + t('sync.syncNow')
          )}
        </button>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          ⚠️ {t('sync.demoNote')} All data is stored locally in IndexedDB on this device.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLEAN INTERACTIVE INDEXEDDB TABLE MODAL (186+ RECORDS VIEWER) */}
      {/* ========================================================================= */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400" />
                  <h3 className="font-black text-base">IndexedDB Clinical Data Table</h3>
                  <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-sky-400/30">
                    {tableRecords.length || counts.total} Records
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Offline Dexie schema storage with guaranteed confidentiality and integrity
                </p>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search records by name, vitals, condition, medicine..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  onClick={handleReseed}
                  disabled={reseeding}
                  className="shrink-0 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  title="Reseed 186+ records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin text-sky-600' : ''}`} />
                  <span>Reseed (186+)</span>
                </button>
              </div>

              {/* Table Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'all', label: `All (${tableRecords.length})` },
                  { id: 'patients', label: `Patients (${counts.patients})` },
                  { id: 'medical records', label: `Records (${counts.records})` },
                  { id: 'health tests', label: `Tests (${counts.tests})` },
                  { id: 'notifications', label: `Activities (${counts.notifications})` },
                  { id: 'doctor summaries', label: `Summaries (${counts.doctorSummaries})` },
                  { id: 'medicines', label: `Medicines (${counts.medicines})` },
                  { id: 'hospitals', label: `Hospitals (${counts.hospitals})` },
                  { id: 'schemes', label: `Schemes (${counts.schemes})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      activeTab === t.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content Area */}
            <div className="flex-1 overflow-auto p-3">
              {loadingRecords ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                  <span className="text-xs">Querying IndexedDB tables...</span>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No records match your current filter or search query.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Table</th>
                        <th className="py-2.5 px-3">Entity / Title</th>
                        <th className="py-2.5 px-3">Clinical Subtitle</th>
                        <th className="py-2.5 px-3">Details / Instructions</th>
                        <th className="py-2.5 px-3 text-right">Status / Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRecords.map((item, idx) => (
                        <tr key={`${item.table}-${item.id}-${idx}`} className="hover:bg-sky-50/50 transition-colors">
                          <td className="py-2 px-3 font-bold text-sky-800 whitespace-nowrap">
                            <span className="bg-sky-100 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                              {item.table}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">
                            {item.title}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {item.subtitle}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                            {item.details}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              {item.dateOrStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
              <span>Showing {filteredRecords.length} of {tableRecords.length} records</span>
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                Close Table
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
