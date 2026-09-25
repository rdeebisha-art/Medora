import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { WifiOff, CheckCircle2, X } from 'lucide-react';

export default function OfflineToast() {
  const isOffline = useAppStore((state) => state.isOffline);
  const [toastState, setToastState] = useState<'idle' | 'offline' | 'online'>(() => {
    // Check initial state when the application loads using navigator.onLine
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return 'idle';
  });

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOfflineRef = useRef<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const wasOffline = prevOfflineRef.current;
    prevOfflineRef.current = isOffline;

    // Clear any pending dismissal timer
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (isOffline) {
      // Offline mode: persistent, do NOT auto-dismiss
      setToastState('offline');
    } else if (wasOffline && !isOffline) {
      // Reconnected: show Back Online notification for a short confirmation period
      setToastState('online');
      dismissTimerRef.current = setTimeout(() => {
        setToastState('idle');
      }, 4500);
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isOffline]);

  if (toastState === 'idle') {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-50 pointer-events-none transition-all duration-300 ease-out"
    >
      {toastState === 'offline' && (
        <div className="pointer-events-auto bg-amber-50/95 border-2 border-amber-500/80 text-amber-950 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 backdrop-blur-md">
          <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl flex-shrink-0 mt-0.5 shadow-xs">
            <WifiOff className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900">
              <span aria-hidden="true">⚠️</span>
              <span>Offline Mode</span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed font-medium">
              You are currently offline. Your local Medora data is still available.
            </p>
          </div>
        </div>
      )}

      {toastState === 'online' && (
        <div className="pointer-events-auto bg-emerald-50/95 border-2 border-emerald-500/80 text-emerald-950 rounded-2xl p-4 shadow-xl flex items-start justify-between gap-3.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 bg-emerald-200 text-emerald-900 rounded-xl flex-shrink-0 mt-0.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                <span aria-hidden="true">🟢</span>
                <span>Back Online</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-medium">
                Internet connection restored. Syncing pending data...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastState('idle')}
            className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Dismiss back online notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
