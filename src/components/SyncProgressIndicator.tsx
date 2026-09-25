import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cloud,
  CloudOff,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Database,
  ArrowUpRight,
  Wifi,
  WifiOff,
  FileText,
  User,
  Pill,
  Activity,
  MessageSquare,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SyncProgressIndicatorProps {
  isOffline: boolean;
  is2GMode?: boolean;
  counts: {
    patients: number;
    medicines: number;
    tests: number;
    sms: number;
    records: number;
  };
  pendingCount: number;
  isSyncing: boolean;
  syncDone: boolean;
  onTriggerSync: () => Promise<void> | void;
  lastSyncTimestamp?: string | null;
}

export const SyncProgressIndicator: React.FC<SyncProgressIndicatorProps> = ({
  isOffline,
  is2GMode = false,
  counts,
  pendingCount,
  isSyncing,
  syncDone,
  onTriggerSync,
  lastSyncTimestamp,
}) => {
  const { t } = useTranslation();
  const [animatedProgress, setAnimatedProgress] = useState(syncDone ? 100 : isOffline ? 100 : 85);
  const [activeTab, setActiveTab] = useState<'status' | 'entities' | 'integrity'>('status');

  const totalLocalRecords =
    counts.patients + counts.medicines + counts.tests + counts.sms + counts.records;

  useEffect(() => {
    if (isSyncing) {
      setAnimatedProgress(15);
      const timer1 = setTimeout(() => setAnimatedProgress(45), 500);
      const timer2 = setTimeout(() => setAnimatedProgress(75), 1100);
      const timer3 = setTimeout(() => setAnimatedProgress(92), 1600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (syncDone) {
      setAnimatedProgress(100);
    } else if (isOffline) {
      setAnimatedProgress(100); // 100% stored locally in indexedDB
    } else {
      setAnimatedProgress(pendingCount > 0 ? 70 : 100);
    }
  }, [isSyncing, syncDone, isOffline, pendingCount]);

  const entityItems = [
    {
      label: 'Patient Profiles',
      count: counts.patients,
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      storageKey: 'db.patients',
      status: 'IndexedDB Secure',
    },
    {
      label: 'Medications & Doses',
      count: counts.medicines,
      icon: Pill,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      storageKey: 'db.medicines',
      status: 'IndexedDB Secure',
    },
    {
      label: 'Vitals & Lab Tests',
      count: counts.tests,
      icon: Activity,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      storageKey: 'db.healthTests',
      status: 'IndexedDB Secure',
    },
    {
      label: 'Medical Records & Scans',
      count: counts.records,
      icon: FileText,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      storageKey: 'db.medicalRecords',
      status: 'IndexedDB Secure',
    },
    {
      label: 'SMS & Triage Outbox',
      count: counts.sms,
      icon: MessageSquare,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      storageKey: 'db.smsOutbox',
      status: pendingCount > 0 ? `${pendingCount} Queued` : 'IndexedDB Secure',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Database className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">IndexedDB Storage & Sync Monitor</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Offline-First
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-0.5">
                Client-side IndexedDB persistence ensures health records remain 100% accessible without internet.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {isOffline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <WifiOff className="w-3.5 h-3.5" />
                Offline Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <Wifi className="w-3.5 h-3.5" />
                {is2GMode ? 'Online (2G Mode)' : 'Online (Connected)'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Status Message */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-100">
            <span className="flex items-center gap-1.5">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-300" />
                  <span>Synchronizing IndexedDB records with server...</span>
                </>
              ) : isOffline ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>All {totalLocalRecords} health records safely stored locally in IndexedDB</span>
                </>
              ) : syncDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>IndexedDB & remote server fully synchronized</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{pendingCount} changes waiting to sync when online</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                  <span>Local database verified and ready</span>
                </>
              )}
            </span>
            <span className="font-mono text-teal-200">{animatedProgress}%</span>
          </div>

          {/* Animated Progress Track */}
          <div className="w-full h-3 bg-teal-950/60 rounded-full overflow-hidden p-0.5 border border-teal-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOffline
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : syncDone
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                  : isSyncing
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-400'
              }`}
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'status'
              ? 'border-teal-700 text-teal-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Offline Safety Status
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'entities'
              ? 'border-teal-700 text-teal-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          IndexedDB Tables ({totalLocalRecords})
        </button>
        <button
          onClick={() => setActiveTab('integrity')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'integrity'
              ? 'border-teal-700 text-teal-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Zero-Loss Guarantee
        </button>
      </div>

      {/* Tab 1: Status Overview */}
      {activeTab === 'status' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Box 1: Storage Mode */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Storage Engine
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  IndexedDB (Dexie)
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Fully Persistent
                </span>
              </div>
            </div>

            {/* Box 2: Total Records */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-800 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Local Records
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  {totalLocalRecords} records
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Preserved across device restarts
                </span>
              </div>
            </div>

            {/* Box 3: Sync State */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  isOffline
                    ? 'bg-amber-100 text-amber-800'
                    : pendingCount > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOffline ? (
                  <CloudOff className="w-4 h-4" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Backup Status
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  {isOffline
                    ? 'Safeguarded Locally'
                    : syncDone
                    ? 'Server Synchronized'
                    : pendingCount > 0
                    ? `${pendingCount} Pending Sync`
                    : 'Up to Date'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {lastSyncTimestamp ? `Last sync: ${lastSyncTimestamp}` : 'Backed up in browser IndexedDB'}
                </span>
              </div>
            </div>
          </div>

          {/* Sync Trigger / Offline reassurance banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isOffline
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-teal-50/70 border-teal-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {isOffline
                    ? 'Offline Safeguard Active: Zero Data Loss'
                    : 'Automatic Synchronization Ready'}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isOffline
                    ? 'You can continue adding patient vitals, medical records, and scheduling reminders. Everything is stored in IndexedDB and will automatically push to the server when network connects.'
                    : 'All local changes are tracked. Click below to verify or synchronize records immediately.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onTriggerSync()}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0 ${
                isSyncing
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : syncDone
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : syncDone ? 'Re-Sync Now' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: IndexedDB Tables Breakdown */}
      {activeTab === 'entities' && (
        <div className="p-5 space-y-3">
          <div className="text-xs text-slate-500 font-medium">
            The following health record collections are stored directly on this device using client-side IndexedDB:
          </div>

          <div className="space-y-2">
            {entityItems.map((entity) => {
              const Icon = entity.icon;
              return (
                <div
                  key={entity.label}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${entity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {entity.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entity.storageKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white border border-slate-200 text-slate-900">
                      {entity.count} records
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {entity.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Zero-Loss Guarantee */}
      {activeTab === 'integrity' && (
        <div className="p-5 space-y-3">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-teal-950">
              <h4 className="font-black text-sm text-teal-900">
                Medora Offline-First Resilience Architecture
              </h4>
              <p>
                1. <strong>Local Write Authority:</strong> Every new patient, prescription, health test, or emergency triage record is saved to browser IndexedDB <em>before</em> any network call is attempted.
              </p>
              <p>
                2. <strong>Zero Loss on Network Drop:</strong> If 2G signal drops or connectivity is completely absent, no operations fail. Records remain safely cached in IndexedDB.
              </p>
              <p>
                3. <strong>Automatic Outbox Draining:</strong> Outbox messages, SMS requests, and telemetry logs queue in Dexie with status <code className="bg-teal-100 px-1 py-0.5 rounded font-mono text-[10px]">PENDING_OFFLINE</code> and automatically synchronize once network returns.
              </p>
              <p>
                4. <strong>Medical AI Continuity:</strong> The clinical decision support and emergency triage rules operate directly from local bundled databases, requiring no internet connectivity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncProgressIndicator;
