import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';

export default function ConnectivityStatusIndicator() {
  const { t } = useTranslation();
  const { isOffline, setOffline, is2GMode } = useAppStore();
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setOffline(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const handleOffline = () => {
      setOnline(false);
      setOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined') {
      const isCurrentlyOnline = navigator.onLine;
      setOnline(isCurrentlyOnline);
      setOffline(!isCurrentlyOnline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  const effectiveOffline = isOffline || !online;

  return (
    <div className="w-full relative z-40 transition-all">
      {/* Global Status Strip */}
      <div
        className={`w-full py-1.5 px-3 sm:px-4 text-xs font-semibold flex items-center justify-between border-b shadow-2xs transition-colors ${
          effectiveOffline
            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
            : 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
              effectiveOffline ? 'bg-[#D97706]' : 'bg-[#16A34A]'
            }`}
          />
          <div className="flex items-center gap-1.5 truncate">
            {effectiveOffline ? (
              <>
                <WifiOff size={13} className="text-[#D97706] flex-shrink-0" />
                <span className="font-bold">{t('common.offline', 'Offline Mode')}:</span>
                <span className="truncate">
                  {t('common.offlineNotice', 'Operating with local database. Changes will sync when online.')}
                </span>
              </>
            ) : (
              <>
                <Wifi size={13} className="text-[#16A34A] flex-shrink-0" />
                <span className="font-bold">{t('common.online', 'Online')}:</span>
                <span className="truncate">
                  {is2GMode
                    ? t('common.2gSyncReady', '2G Optimized Mode · Low-data sync active')
                    : t('common.syncReady', 'Real-time sync ready · Local data secured')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Sync Capability & Details Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="hidden md:inline text-[11px] opacity-80">
            {effectiveOffline ? 'Offline Cache Active' : `Synced at ${lastSyncTime}`}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] font-bold uppercase tracking-wider underline hover:opacity-100 opacity-90 px-1.5 py-0.5 rounded transition-colors"
          >
            {showDetails ? 'Hide' : 'Sync Info'}
          </button>
        </div>
      </div>

      {/* Expanded Sync Capabilities Drawer / Details */}
      {showDetails && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-md text-xs text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                {effectiveOffline ? (
                  <AlertCircle size={14} className="text-amber-600" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-600" />
                )}
                <span>Data Synchronization Status</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {effectiveOffline
                  ? 'Medora is operating offline using on-device IndexedDB storage. You can view records, track medicines, consult AI triage, and prepare emergency alerts. Outbox actions will be queued and synchronized automatically upon reconnection.'
                  : 'Your device has an active internet connection. All local health records, emergency logs, and medical reminders are synchronized with the safe local cache and ready for bidirectional updates.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-[11px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                Storage: IndexedDB (Local-First)
              </div>
              <button
                onClick={() => {
                  setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  setShowDetails(false);
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
              >
                <RefreshCw size={11} />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
