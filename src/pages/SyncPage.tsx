import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import SyncProgressIndicator from '../components/SyncProgressIndicator';

export default function SyncPage() {
  const { t } = useTranslation();
  const { isOffline, is2GMode } = useAppStore();
  const [counts, setCounts] = useState({ patients: 0, medicines: 0, tests: 0, sms: 0, records: 0 });
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      db.patients.count(),
      db.medicines.count(),
      db.healthTests.count(),
      db.smsOutbox.count(),
      db.medicalRecords.count(),
      db.smsOutbox.where({ status: 'pending' }).count(),
      db.syncLog.reverse().first(),
    ]).then(([patients, medicines, tests, sms, records, pending, lastLog]) => {
      setCounts({ patients, medicines, tests, sms, records });
      setPendingCount(pending);
      if (lastLog?.createdAt) {
        setLastSyncTime(new Date(lastLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  }, [syncDone]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncDone(false);
    await new Promise(r => setTimeout(r, 2000)); // demo delay
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

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🔄 {t('sync.title')}</h1>
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
        <div className={`rounded-2xl p-4 mb-4 flex items-center gap-3 ${isOffline ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
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

        {/* Local Data Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">💾 {t('sync.localData')}</h2>
          <div className="space-y-2">
            {[
              { label: 'Patients', count: counts.patients, icon: '👤' },
              { label: 'Medicines', count: counts.medicines, icon: '💊' },
              { label: 'Health Tests', count: counts.tests, icon: '🧪' },
              { label: 'Medical Records', count: counts.records, icon: '📋' },
              { label: 'SMS Outbox', count: counts.sms, icon: '📱' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.icon} {item.label}</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-sm">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Changes */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
            <h2 className="font-bold text-yellow-800">{t('sync.pendingChanges')}</h2>
            <p className="text-sm text-yellow-700 mt-1">{pendingCount} pending SMS messages · {t('offline.pendingSync')}</p>
          </div>
        )}

        {/* Last Sync */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 text-sm text-gray-600">
          🕐 {t('sync.lastSync')}: {lastSyncTime || t('sync.never')}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all ${syncDone ? 'bg-green-500 text-white' : 'bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50'}`}
        >
          {syncing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔄</span> {t('sync.syncing')}
            </span>
          ) : syncDone ? '✅ ' + t('sync.syncComplete') : '🔄 ' + t('sync.syncNow')}
        </button>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          ⚠️ {t('sync.demoNote')} All data is stored locally in IndexedDB on this device.
        </div>
      </div>
    </Layout>
  );
}
