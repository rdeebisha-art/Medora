import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  PhoneCall,
  Send,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  UserCheck,
  Building2,
  CheckCircle2,
  Radio,
  MapPin,
} from 'lucide-react';
import { db } from '../db/db';
import { useAppStore } from '../store/useAppStore';

const HOLD_DURATION_MS = 3000;

export const FloatingSosButton: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, language } = useAppStore();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [smsSentNotice, setSmsSentNotice] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenAudioCtxRef = useRef<AudioContext | null>(null);

  const patientId = currentUser?.role === 'patient' && currentUser.id ? currentUser.id : 1;
  const patientName = currentUser?.name || 'Ramesh Kumar';
  const villageName = currentUser?.village || 'Kodaikanal Hill Village';

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopSiren();
    };
  }, []);

  const stopSiren = useCallback(() => {
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch {}
      sirenOscRef.current = null;
    }
    if (sirenAudioCtxRef.current) {
      try {
        sirenAudioCtxRef.current.close();
      } catch {}
      sirenAudioCtxRef.current = null;
    }
    setIsSirenPlaying(false);
  }, []);

  const playSiren = useCallback(() => {
    if (isSirenPlaying) {
      stopSiren();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      sirenAudioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      // Modulate frequency between 600Hz and 1200Hz
      const now = ctx.currentTime;
      for (let i = 0; i < 30; i++) {
        osc.frequency.setValueAtTime(600, now + i * 0.8);
        osc.frequency.linearRampToValueAtTime(1200, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(600, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.35, now);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      sirenOscRef.current = osc;
      setIsSirenPlaying(true);
    } catch (e) {
      console.warn('Could not start siren audio:', e);
    }
  }, [isSirenPlaying, stopSiren]);

  const triggerEmergencyActions = useCallback(async () => {
    setIsHolding(false);
    setHoldProgress(100);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 500]);
      } catch {}
    }

    // Log incident in db.emergencyIncidents
    try {
      await db.emergencyIncidents.add({
        incidentId: `SOS-${Date.now()}`,
        patientId,
        timestamp: new Date().toISOString(),
        detectedLanguage: language || 'en',
        emergencyType: 'SOS_HOLD_3S_TRIGGERED',
        severity: 'CRITICAL',
        source: 'MANUAL_BUTTON',
        status: 'LOCAL_ONLY',
        dispatchStatus: 'LOCAL_ONLY',
        createdAt: new Date().toISOString(),
      });
    } catch {}

    // Open quick action emergency menu
    setIsMenuOpen(true);
  }, [patientId, language]);

  const updateHold = useCallback(() => {
    if (!holdStartRef.current) return;
    const elapsed = Date.now() - holdStartRef.current;
    const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
    setHoldProgress(pct);

    const remainingSecs = Math.max(1, Math.ceil((HOLD_DURATION_MS - elapsed) / 1000));
    setSecondsLeft(remainingSecs);

    if (elapsed >= HOLD_DURATION_MS) {
      triggerEmergencyActions();
    } else {
      animFrameRef.current = requestAnimationFrame(updateHold);
    }
  }, [triggerEmergencyActions]);

  const handleStartHold = (e: React.MouseEvent | React.TouchEvent) => {
    // Only primary button
    if ('button' in e && e.button !== 0) return;

    setIsHolding(true);
    setHoldProgress(0);
    setSecondsLeft(3);
    holdStartRef.current = Date.now();

    // Haptic buzz
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {}
    }

    animFrameRef.current = requestAnimationFrame(updateHold);
  };

  const handleCancelHold = () => {
    if (!isHolding) return;
    const elapsed = holdStartRef.current ? Date.now() - holdStartRef.current : 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);

    // If released prematurely, guide the user
    if (elapsed > 200 && elapsed < HOLD_DURATION_MS) {
      setToastMessage('Hold down for full 3 seconds to trigger emergency actions');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Immediate Emergency SMS Broadcast
  const handleBroadcastEmergencySms = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emergencyText = `🚨 MEDORA SOS ALERT! Urgent medical help requested for ${patientName} (ID: P-${patientId}) at ${villageName}. Timestamp: ${timeStr}. Please send ambulance or ASHA worker immediately!`;

    try {
      await db.smsOutbox.add({
        toPhone: '108 (Emergency) & Family Caregivers',
        message: emergencyText,
        type: 'emergency_alert',
        language: language || 'en',
        status: 'OFFLINE_OUTBOX' as any,
        createdAt: new Date().toISOString(),
        info: 'SOS 3-Second Hold Emergency Broadcast',
      });

      await db.familyAlertOutbox.add({
        alertId: `SOS-ALT-${Date.now()}`,
        familyId: (currentUser as any)?.familyId || 1,
        patientId,
        recipientName: 'Family & Emergency Contacts',
        recipientPhone: currentUser?.phone || '108 Emergency Helpline',
        message: emergencyText,
        language: language || 'en',
        timestamp: new Date().toISOString(),
        status: 'PENDING_OFFLINE',
      });

      setSmsSentNotice(true);
      setTimeout(() => setSmsSentNotice(false), 5000);
    } catch (e) {
      console.error('Failed to dispatch SOS SMS:', e);
    }
  };

  // SVG parameters for radial progress circle
  const size = 76;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <>
      {/* Toast feedback when user releases prematurely */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-50 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl border border-red-500/50 flex items-center gap-2 animate-bounce">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating SOS Button Container */}
      <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 flex flex-col items-center select-none touch-none">
        {/* Hold instructions label */}
        <div className="mb-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-white border border-red-500/40 shadow-xs pointer-events-none">
          {isHolding ? `Hold ${secondsLeft}s...` : 'Hold 3s SOS'}
        </div>

        <div className="relative flex items-center justify-center">
          {/* Radial progress ring SVG */}
          <svg className="absolute -rotate-90 pointer-events-none" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(239, 68, 68, 0.25)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: isHolding ? 'none' : 'stroke-dashoffset 0.2s ease-out' }}
            />
          </svg>

          {/* Actual Push-to-Hold Button */}
          <button
            type="button"
            onMouseDown={handleStartHold}
            onMouseUp={handleCancelHold}
            onMouseLeave={handleCancelHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleCancelHold}
            onTouchCancel={handleCancelHold}
            className={`w-16 h-16 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-600 text-white flex flex-col items-center justify-center font-black shadow-2xl transition-transform active:scale-95 cursor-pointer ring-4 ${
              isHolding
                ? 'ring-red-300 scale-105 shadow-red-600/60'
                : 'ring-red-400/40 hover:ring-red-400 animate-pulse'
            }`}
            title="Press and hold for 3 seconds to trigger emergency actions"
            aria-label="Emergency SOS button. Hold for 3 seconds to trigger emergency quick actions"
          >
            <ShieldAlert size={22} className="text-white drop-shadow-xs" />
            <span className="text-[11px] font-black tracking-wider leading-none mt-0.5">SOS</span>
          </button>
        </div>

        {/* Quick tap accessibility bypass */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="mt-1 text-[9px] text-slate-500 hover:text-red-700 underline font-semibold bg-white/70 px-1.5 py-0.5 rounded cursor-pointer"
        >
          tap to open
        </button>
      </div>

      {/* Emergency Quick-Action Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Urgent Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shrink-0 animate-bounce">
                  🚨
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-700 px-2 py-0.5 rounded-full">
                    3-Second SOS Triggered
                  </span>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                    Emergency Quick-Action Menu
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopSiren();
                  setIsMenuOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Content & Actions */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Patient context badge */}
              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center justify-between text-xs text-red-900">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">{patientName}</span> • <span>{villageName}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                  ID: P-{patientId}
                </span>
              </div>

              {smsSentNotice && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>✓ Emergency SOS SMS alert queued in offline outbox for transmission!</span>
                </div>
              )}

              {/* Primary Immediate Action Grid */}
              <div className="space-y-2.5">
                {/* 1. Call 108 Ambulance */}
                <a
                  href="tel:108"
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-2xl font-black text-sm flex items-center justify-between shadow-md transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                      🚑
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">Call 108 Ambulance</div>
                      <div className="text-[11px] text-red-100 font-normal">Free Government Emergency Medical Dispatch</div>
                    </div>
                  </div>
                  <span className="bg-white text-red-700 px-3 py-1 rounded-xl text-xs font-black shadow-xs">
                    Dial 108
                  </span>
                </a>

                {/* 2. Broadcast Emergency SMS Alert */}
                <button
                  type="button"
                  onClick={handleBroadcastEmergencySms}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-red-400 p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg">
                      📱
                    </div>
                    <div className="text-left">
                      <div className="font-black text-slate-900">Broadcast Emergency SMS Alert</div>
                      <div className="text-[11px] text-slate-500 font-normal">Dispatches distress SMS to family &amp; ASHA contacts</div>
                    </div>
                  </div>
                  <Send size={16} className="text-blue-600" />
                </button>

                {/* 3. Call 104 Doctor Consultation Helpline */}
                <a
                  href="tel:104"
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-teal-400 p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-2xs transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg">
                      👨‍⚕️
                    </div>
                    <div className="text-left">
                      <div className="font-black text-slate-900">Call 104 Health Helpline / PHC Doctor</div>
                      <div className="text-[11px] text-slate-500 font-normal">24/7 Free medical tele-consultation advice</div>
                    </div>
                  </div>
                  <PhoneCall size={16} className="text-teal-600" />
                </a>

                {/* 4. Call Village ASHA Lead */}
                <a
                  href="tel:9842100001"
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-purple-400 p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-2xs transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg">
                      👩‍⚕️
                    </div>
                    <div className="text-left">
                      <div className="font-black text-slate-900">Call Lakshmi Devi (ASHA Health Worker)</div>
                      <div className="text-[11px] text-slate-500 font-normal">Village Sub-centre frontline responder (+91 98421 00001)</div>
                    </div>
                  </div>
                  <PhoneCall size={16} className="text-purple-600" />
                </a>

                {/* 5. Audio Siren Alarm & First Aid Direct Link */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={playSiren}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      isSirenPlaying
                        ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {isSirenPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isSirenPlaying ? 'Stop Siren' : 'Sound Alarm Siren'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopSiren();
                      setIsMenuOpen(false);
                      navigate('/emergency');
                    }}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span>🩹 First Aid Steps</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
              Emergency contacts work offline via telecommunications dialer and SMS queue.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSosButton;
