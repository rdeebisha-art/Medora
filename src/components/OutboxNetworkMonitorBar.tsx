import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RotateCw,
  Signal,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  getStoredMessages,
  syncOfflineQueuedMessages,
  Message,
  RecipientDeliveryStatus
} from '../services/communicationService';

interface OutboxNetworkMonitorBarProps {
  isOffline: boolean;
  networkQuality?: '4G' | '3G' | '2G' | 'LIMITED' | 'OFFLINE';
  onOpenCommunicationCenter?: () => void;
}

export const OutboxNetworkMonitorBar: React.FC<OutboxNetworkMonitorBarProps> = ({
  isOffline,
  networkQuality = '4G',
  onOpenCommunicationCenter,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshStats = () => {
    setMessages(getStoredMessages());
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const count = syncOfflineQueuedMessages();
      setLastSyncCount(count);
      setIsSyncing(false);
      refreshStats();
      setTimeout(() => setLastSyncCount(null), 4000);
    }, 1200);
  };

  // Compute aggregated stats
  let pendingCount = 0;
  let sendingCount = 0;
  let deliveredCount = 0;
  let failedCount = 0;

  messages.forEach((m) => {
    m.recipientStatuses.forEach((rs: RecipientDeliveryStatus) => {
      if (rs.status === 'QUEUED' || rs.status === 'PENDING') pendingCount++;
      else if (rs.status === 'SENDING' || rs.status === 'RETRYING') sendingCount++;
      else if (rs.status === 'DELIVERED' || rs.status === 'SENT') deliveredCount++;
      else if (rs.status === 'FAILED') failedCount++;
    });
  });

  const getNetworkBadge = () => {
    if (isOffline) {
      return {
        label: 'OFFLINE MODE',
        bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <WifiOff className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    if (networkQuality === '2G' || networkQuality === 'LIMITED') {
      return {
        label: 'SLOW 2G INTERNET',
        bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <Signal className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    return {
      label: 'ONLINE CONNECTED',
      bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />,
    };
  };

  const statusInfo = getNetworkBadge();

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Network Status Badge & Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${statusInfo.bgColor}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </span>

            {isSyncing && (
              <span className="flex items-center gap-1 text-teal-400 text-xs font-bold animate-pulse">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Queue...</span>
              </span>
            )}

            {lastSyncCount !== null && (
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                <span>Synced {lastSyncCount} item(s)</span>
              </span>
            )}
          </div>

          {onOpenCommunicationCenter && (
            <button
              onClick={onOpenCommunicationCenter}
              className="md:hidden text-[11px] font-bold text-teal-400 underline"
            >
              Outbox & Status
            </button>
          )}
        </div>

        {/* Center: Delivery Counters */}
        <div className="flex items-center gap-3 text-[11px] font-medium overflow-x-auto w-full md:w-auto justify-center">
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Pending Queue:</span>
            <span className="font-black text-white bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
              {pendingCount}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Delivered:</span>
            <span className="font-black text-white bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              {deliveredCount}
            </span>
          </div>

          {failedCount > 0 && (
            <div className="flex items-center gap-1 bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-800">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 font-bold">Failed (Needs Retry):</span>
              <span className="font-black text-white bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                {failedCount}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {pendingCount > 0 && !isOffline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Pending Now</span>
            </button>
          )}

          {onOpenCommunicationCenter && (
            <button
              onClick={onOpenCommunicationCenter}
              className="hidden md:flex bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[11px] px-3 py-1 rounded-xl items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>Open Communication Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
