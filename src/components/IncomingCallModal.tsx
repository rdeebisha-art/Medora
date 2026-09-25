import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, ShieldAlert, User, AlertTriangle } from 'lucide-react';
import { IncomingCallInfo, useAppStore } from '../store/useAppStore';
import { webrtcCallingService } from '../services/webrtc/webrtcCallingService';

interface IncomingCallModalProps {
  incomingCall: IncomingCallInfo;
  onClose: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ incomingCall, onClose }) => {
  const { startDirectCall } = useAppStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play ringing sound in browser speaker while call is incoming
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const playRingBurst = () => {
          if (!audioCtxRef.current) return;
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);
          osc1.type = 'sine';
          osc2.type = 'sine';

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
          gain.gain.setValueAtTime(0.12, now + 1.2);
          gain.gain.linearRampToValueAtTime(0, now + 1.3);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.35);
          osc2.stop(now + 1.35);
        };

        playRingBurst();
        ringIntervalRef.current = setInterval(playRingBurst, 3000);
      }
    } catch {}

    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  const handleAccept = async () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }

    onClose();

    // Start direct call modal in UI
    startDirectCall({
      callId: incomingCall.callId,
      name: incomingCall.callerName,
      phone: incomingCall.callerId,
      category: incomingCall.callerRole === 'doctor' ? 'DOCTOR' : 'PATIENT' as any,
      targetUserId: incomingCall.callerId,
      callerId: incomingCall.callerId,
      callerName: incomingCall.callerName,
      callerRole: incomingCall.callerRole,
      isIncoming: true,
      emergency: incomingCall.emergency,
      emergencyType: incomingCall.emergencyType,
      symptoms: incomingCall.symptoms,
      sdpOffer: incomingCall.sdpOffer,
    });

    // Accept WebRTC call in service
    await webrtcCallingService.acceptCall({
      callId: incomingCall.callId,
      callerId: incomingCall.callerId,
      callerName: incomingCall.callerName,
      callerRole: incomingCall.callerRole,
      sdpOffer: incomingCall.sdpOffer,
      emergency: incomingCall.emergency,
      emergencyType: incomingCall.emergencyType,
      symptoms: incomingCall.symptoms,
    });
  };

  const handleReject = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }
    webrtcCallingService.rejectCall(incomingCall.callId, incomingCall.callerId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Incoming Medora Call"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col p-6 text-center space-y-5">
        
        {/* Banner */}
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-3 shadow-lg ${
            incomingCall.emergency
              ? 'bg-rose-600/30 text-rose-400 ring-4 ring-rose-500/50 animate-bounce'
              : 'bg-teal-600/30 text-teal-400 ring-4 ring-teal-500/40 animate-pulse'
          }`}>
            {incomingCall.emergency ? (
              <ShieldAlert className="w-12 h-12 text-rose-400" />
            ) : (
              <Phone className="w-12 h-12 text-teal-400" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 bg-black/40">
            {incomingCall.emergency ? (
              <span className="text-rose-400 font-black">🚨 EMERGENCY INCOMING CALL</span>
            ) : (
              <span className="text-teal-300 font-bold">Incoming Medora Voice Call</span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mt-1">{incomingCall.callerName}</h2>
          <p className="text-xs text-slate-400 font-mono">ID: {incomingCall.callerId}</p>
        </div>

        {/* Emergency details if reported */}
        {incomingCall.emergency && (
          <div className="bg-rose-950/80 border border-rose-800 rounded-2xl p-3 text-left space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{incomingCall.emergencyType || 'Urgent Medical Attention'}</span>
            </div>
            {incomingCall.symptoms && (
              <p className="text-rose-200 text-[11px] leading-relaxed">
                Symptoms: {incomingCall.symptoms}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-slate-300">
          Real-time human voice call inside Medora. Zero carrier fees or phone apps.
        </p>

        {/* Action Buttons: Accept / Reject */}
        <div className="flex items-center justify-around gap-4 pt-2">
          
          {/* Reject Button */}
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Reject</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition scale-105 active:scale-95 cursor-pointer"
          >
            <Phone className="w-5 h-5 animate-pulse" />
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
