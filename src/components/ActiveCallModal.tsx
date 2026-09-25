import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, PhoneCall, Volume2, VolumeX, Mic, MicOff,
  Building2, Ambulance, ShieldAlert, User, CheckCircle2,
  ExternalLink, Hash, Clock, MapPin, Radio
} from 'lucide-react';
import { db } from '../db/db';

export interface ActiveCallInfo {
  name: string;
  phone: string;
  category: 'EMERGENCY' | 'AMBULANCE' | 'HOSPITAL' | 'DOCTOR' | 'FAMILY' | 'SUPPORT';
  location?: string;
  notes?: string;
}

interface ActiveCallModalProps {
  callInfo: ActiveCallInfo | null;
  onClose: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ callInfo, onClose }) => {
  const [callState, setCallState] = useState<'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('DIALING');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!callInfo) return;

    // Reset state
    setCallState('DIALING');
    setSeconds(0);
    setIsMuted(false);
    setShowKeypad(false);
    setKeypadInput('');

    // Trigger system tel: dialer automatically
    try {
      const cleanDigits = callInfo.phone.replace(/[^\d+]/g, '');
      if (cleanDigits) {
        window.location.href = `tel:${cleanDigits}`;
      }
    } catch {
      // Ignore if browser restricts auto-navigation
    }

    // Dialing -> Ringing transition
    const t1 = setTimeout(() => {
      setCallState('RINGING');
    }, 1200);

    // Ringing -> Connected transition
    const t2 = setTimeout(() => {
      setCallState('CONNECTED');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callInfo]);

  // Call duration timer when connected
  useEffect(() => {
    if (callState === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!callInfo) return null;

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    setCallState('ENDED');
    // Save to local call history
    try {
      await db.callHistory.add({
        phoneNumber: callInfo.phone,
        contactName: callInfo.name,
        contactType: callInfo.category === 'EMERGENCY' || callInfo.category === 'AMBULANCE' ? 'EMERGENCY' : callInfo.category === 'HOSPITAL' ? 'HOSPITAL' : 'PERSON',
        action: 'CALL_COMPLETED',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleRedial = () => {
    const cleanDigits = callInfo.phone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanDigits}`;
    setCallState('DIALING');
    setSeconds(0);
  };

  const getCategoryIcon = () => {
    switch (callInfo.category) {
      case 'EMERGENCY':
        return <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />;
      case 'AMBULANCE':
        return <Ambulance className="w-8 h-8 text-red-500 animate-bounce" />;
      case 'HOSPITAL':
        return <Building2 className="w-8 h-8 text-blue-400" />;
      case 'DOCTOR':
        return <PhoneCall className="w-8 h-8 text-emerald-400" />;
      default:
        return <User className="w-8 h-8 text-indigo-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (callState) {
      case 'DIALING':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            DIALING NETWORK...
          </span>
        );
      case 'RINGING':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            LINE RINGING...
          </span>
        );
      case 'CONNECTED':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            CALL IN PROGRESS • {formatDuration(seconds)}
          </span>
        );
      case 'ENDED':
        return (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full">
            CALL ENDED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white flex flex-col items-center space-y-5 overflow-hidden">
        
        {/* Glow ambient background based on call category */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            callInfo.category === 'EMERGENCY' || callInfo.category === 'AMBULANCE'
              ? 'bg-red-500'
              : callInfo.category === 'HOSPITAL'
              ? 'bg-blue-500'
              : 'bg-emerald-500'
          }`}
        />

        {/* Top Status */}
        <div className="flex flex-col items-center space-y-2">
          {getStatusBadge()}
          <span className="text-[11px] text-slate-400 font-mono">
            Direct Telephony Dispatch
          </span>
        </div>

        {/* Destination Card - CLEARLY SHOWS WHERE THE CALL HAS GONE */}
        <div className="flex flex-col items-center text-center space-y-3 w-full bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-lg">
            {getCategoryIcon()}
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {callInfo.name}
            </h2>
            <div className="text-sm font-black font-mono text-emerald-400 mt-0.5 tracking-wider">
              {callInfo.phone}
            </div>
            {callInfo.location && (
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{callInfo.location}</span>
              </p>
            )}
          </div>

          <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-left text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Destination:</span>
              <span className="font-bold text-white uppercase">{callInfo.category}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Routing:</span>
              <span className="text-emerald-400 font-semibold">Priority Telecom Line</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Native Protocol:</span>
              <span className="font-mono text-teal-300">tel:{callInfo.phone.replace(/[^\d+]/g, '')}</span>
            </div>
          </div>
        </div>

        {/* Audio Waveform Indicator */}
        {callState === 'CONNECTED' && (
          <div className="flex items-center gap-1 h-6">
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-3" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-6" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-4" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:450ms] h-5" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:200ms] h-3" />
          </div>
        )}

        {/* In-Call Keypad (if opened) */}
        {showKeypad && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="text-center font-mono text-sm tracking-widest text-emerald-400 min-h-[24px]">
              {keypadInput || '—'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm font-bold">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => setKeypadInput((p) => p + k)}
                  className="bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-slate-200 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            <span>{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              showKeypad
                ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Hash className="w-5 h-5" />
            <span>Keypad</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              isSpeaker
                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5 text-blue-400" /> : <VolumeX className="w-5 h-5" />}
            <span>Speaker</span>
          </button>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full pt-1">
          {/* Direct Native Dialer Launcher Link */}
          <button
            onClick={handleRedial}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Launch Phone App ({callInfo.phone})</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
            <span>END CALL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
