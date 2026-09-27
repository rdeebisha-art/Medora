import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Clock,
  Smartphone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  normalizePhoneNumber,
  openDeviceDialer,
  DeviceCallStatus,
  isMobileBrowser,
} from '../services/calling/phoneNumberUtils';
import { db } from '../db/db';

interface DevicePhoneCallCardProps {
  initialPhone?: string;
  recipientName?: string;
  onCallRequested?: (phone: string) => void;
  compact?: boolean;
}

export const DevicePhoneCallCard: React.FC<DevicePhoneCallCardProps> = ({
  initialPhone = '',
  recipientName,
  onCallRequested,
  compact = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [callStatus, setCallStatus] = useState<DeviceCallStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastDialedNumber, setLastDialedNumber] = useState<string>('');
  const isMobile = isMobileBrowser();

  const handleCall = (overridePhone?: string) => {
    const target = (overridePhone || phoneNumber).trim();
    if (!target) {
      setCallStatus('CALL_FAILED');
      setStatusMessage('Please enter a phone number to place a call.');
      return;
    }

    const norm = normalizePhoneNumber(target);
    if (!norm.isValid) {
      setCallStatus('CALL_FAILED');
      setStatusMessage(norm.error || 'Please enter a valid telephone number.');
      return;
    }

    setLastDialedNumber(norm.normalized);
    setCallStatus('DIALER_OPEN_REQUESTED');

    // Record audit entry in local Dexie database
    try {
      db.callHistory.add({
        phoneNumber: norm.normalized,
        contactName: recipientName || 'Direct Dial Number',
        contactType: target === '108' || target === '112' || target === '102' ? 'EMERGENCY' : 'PERSON',
        action: 'DIALER_OPEN_REQUESTED',
        timestamp: new Date().toISOString(),
      });
    } catch {}

    const result = openDeviceDialer(norm.normalized, recipientName);
    setStatusMessage(result.message);

    if (onCallRequested) {
      onCallRequested(norm.normalized);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSetCallEnded = () => {
    setCallStatus('CALL_ENDED');
    setStatusMessage('Call session finished.');
  };

  const handleReset = () => {
    setCallStatus('IDLE');
    setStatusMessage(null);
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-lg font-bold">
            <Phone className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {recipientName ? `Call ${recipientName}` : 'Call Any Phone Number'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Opens device's native telephone dialer with prefilled number
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            callStatus === 'DIALER_OPEN_REQUESTED' || callStatus === 'CALL_INITIATED_BY_DEVICE'
              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
              : callStatus === 'CALL_IN_PROGRESS'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : callStatus === 'CALL_FAILED'
              ? 'bg-red-100 text-red-900 border-red-300'
              : callStatus === 'CALL_ENDED'
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}
        >
          {callStatus === 'DIALER_OPEN_REQUESTED'
            ? 'Dialer Requested'
            : callStatus === 'CALL_FAILED'
            ? 'Call Failed'
            : callStatus === 'CALL_ENDED'
            ? 'Call Ended'
            : callStatus}
        </span>
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCall();
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Phone number:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +91 98765 43210 or 108"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 min-h-[48px]"
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[48px] shrink-0 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call</span>
            </button>
          </div>
        </div>

        {/* Quick Emergency Numbers */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Quick:</span>
          {[
            { num: '108', label: '108 Ambulance' },
            { num: '102', label: '102 Maternity' },
            { num: '112', label: '112 Police/Emergency' },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => {
                setPhoneNumber(item.num);
                handleCall(item.num);
              }}
              className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer min-h-[32px]"
            >
              🚨 {item.label}
            </button>
          ))}
        </div>
      </form>

      {/* Status & Feedback Notice */}
      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
            callStatus === 'DIALER_OPEN_REQUESTED'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : callStatus === 'CALL_FAILED'
              ? 'bg-red-50 border-red-300 text-red-950'
              : callStatus === 'CALL_ENDED'
              ? 'bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-teal-50 border-teal-300 text-teal-950'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              {callStatus === 'CALL_FAILED' ? (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : callStatus === 'DIALER_OPEN_REQUESTED' ? (
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">{statusMessage}</div>
                {lastDialedNumber && (
                  <div className="text-[11px] font-mono text-slate-600">
                    Target: <span className="font-bold text-slate-900">{lastDialedNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {lastDialedNumber && (
              <button
                type="button"
                onClick={() => handleCopy(lastDialedNumber)}
                className="bg-white/80 hover:bg-white text-slate-700 border border-slate-300 rounded-xl px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer min-h-[32px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {callStatus === 'DIALER_OPEN_REQUESTED' && (
            <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[11px]">
              <span className="text-amber-800">
                A website cannot detect when an external call finishes.
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSetCallEnded}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Mark Ended
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform & Transparency Notice */}
      <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Calls are placed through your carrier network using the phone app. Standard call rates may apply.
        </span>
      </div>
    </div>
  );
};
