import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
  emergencyVoiceTriggerService,
  EmergencyTriggerEvent,
  EmergencyActionType,
} from '../services/voice/emergencyVoiceTriggerService';
import {
  ShieldAlert,
  Mic,
  MicOff,
  PhoneCall,
  AlertTriangle,
  X,
  Volume2,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const GlobalEmergencyVoiceListener: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, appLanguage } = useAppStore();

  const [isEnabled, setIsEnabled] = useState<boolean>(emergencyVoiceTriggerService.getIsEnabled());
  const [isListening, setIsListening] = useState<boolean>(emergencyVoiceTriggerService.getIsListening());
  const [pendingEmergency, setPendingEmergency] = useState<EmergencyTriggerEvent | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState<boolean>(false);
  const countdownIntervalRef = useRef<any>(null);

  // Sync language with current user setting
  useEffect(() => {
    emergencyVoiceTriggerService.setLanguage(appLanguage || language || 'en');
  }, [appLanguage, language]);

  // Start background listener on mount if enabled
  useEffect(() => {
    if (emergencyVoiceTriggerService.isSupported() && isEnabled) {
      emergencyVoiceTriggerService.startListening();
    }

    // Subscribe to emergency trigger events
    const unsubscribe = emergencyVoiceTriggerService.addListener((event: EmergencyTriggerEvent) => {
      handleEmergencyDetected(event);
    });

    // Check listening state periodically
    const stateInterval = setInterval(() => {
      setIsListening(emergencyVoiceTriggerService.getIsListening());
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(stateInterval);
    };
  }, [isEnabled]);

  // Play urgent alert chime using browser Web Audio API
  const playEmergencyChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Dual tone emergency beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const handleEmergencyDetected = (event: EmergencyTriggerEvent) => {
    playEmergencyChime();
    setPendingEmergency(event);
    setCountdown(3);

    // If already on EmergencyPage, navigate or update URL params immediately
    if (location.pathname === '/emergency') {
      executeEmergencyNavigation(event);
      return;
    }

    // 3-second safety window allowing user to abort if accidental
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          executeEmergencyNavigation(event);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeEmergencyNavigation = (event: EmergencyTriggerEvent) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setPendingEmergency(null);

    const query = new URLSearchParams({
      trigger: 'voice_trigger',
      phrase: event.detectedPhrase,
      action: event.action,
      time: event.timestamp,
    }).toString();

    navigate(`/emergency?${query}`);
  };

  const handleCancelEmergency = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setPendingEmergency(null);
  };

  const handleToggleEnable = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    emergencyVoiceTriggerService.setEnabled(next);
  };

  const handleTestTrigger = (phrase: string, action: EmergencyActionType) => {
    emergencyVoiceTriggerService.simulateTrigger(phrase, action);
  };

  const isSupported = emergencyVoiceTriggerService.isSupported();

  return (
    <>
      {/* ======================================================== */}
      {/* 1. URGENT EMERGENCY TRIGGER MODAL (COUNTDOWN CONFIRMATION) */}
      {/* ======================================================== */}
      {pendingEmergency && (
        <div className="fixed inset-0 z-[9999] bg-red-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-red-600 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4 relative overflow-hidden animate-bounce-subtle">
            {/* Pulsing red top banner */}
            <div className="bg-red-600 text-white -mx-6 -mt-6 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 animate-pulse text-white" />
                <span className="font-black text-sm tracking-wide uppercase">
                  🚨 Voice Emergency Detected!
                </span>
              </div>
              <span className="bg-white/20 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                Auto-connecting in {countdown}s
              </span>
            </div>

            {/* Emergency Details */}
            <div className="space-y-2 text-center py-2">
              <div className="text-3xl font-black text-red-600 font-mono animate-pulse">
                {countdown}
              </div>
              <h2 className="text-base font-black text-slate-900">
                Initiating Emergency Protocol
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-900 space-y-1">
                <div>
                  <span className="font-bold text-slate-500">Spoken Phrase: </span>
                  <span className="font-black text-red-700 uppercase">"{pendingEmergency.detectedPhrase}"</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Action: </span>
                  <span className="font-black text-slate-900">
                    {pendingEmergency.action === 'call108'
                      ? '🚑 Emergency 108 Ambulance Hotline'
                      : pendingEmergency.action === 'doctor'
                      ? '🩺 Primary On-Call Emergency Doctor'
                      : '🚨 Family SOS Alert & Emergency Dispatch'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Automatically directing to Emergency page with priority protocol.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEmergency}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 px-3 rounded-xl transition-colors cursor-pointer border border-slate-300"
              >
                ✕ Cancel (False Alarm)
              </button>
              <button
                type="button"
                onClick={() => executeEmergencyNavigation(pendingEmergency)}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Proceed Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FLOATING ACCESSIBLE EMERGENCY TRIGGER STATUS PILL     */}
      {/* ======================================================== */}
      {isSupported && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
          {/* Expanded settings menu */}
          {isWidgetExpanded && (
            <div className="bg-white border-2 border-red-500/40 rounded-3xl p-4 shadow-2xl max-w-xs w-72 text-slate-900 space-y-3 animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-black text-xs text-red-700">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Emergency Voice Trigger</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWidgetExpanded(false)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Listens continuously for critical emergency voice triggers in your language to immediately call 108 or alert family.
              </p>

              {/* Status Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                  <span className="text-xs font-bold text-slate-800">
                    {isEnabled ? 'Voice Trigger Active' : 'Voice Trigger Off'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEnable}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isEnabled
                      ? 'bg-red-100 hover:bg-red-200 text-red-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {/* Recognized Phrases List */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Supported Phrases:
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                    "Help Medora"
                  </span>
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                    "Call 108"
                  </span>
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                    "Call Doctor"
                  </span>
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                    "உதவி"
                  </span>
                  <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-bold border border-red-200">
                    "मदद करो"
                  </span>
                </div>
              </div>

              {/* Test Simulation Buttons (Useful for evaluation & quick emergency test) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Test Triggers:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTestTrigger('help medora', 'alert')}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-black py-1.5 px-2 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Test "Help Medora"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestTrigger('call 108', 'call108')}
                    className="bg-red-100 hover:bg-red-200 text-red-900 text-[10px] font-black py-1.5 px-2 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Test "Call 108"
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Floating Button */}
          <button
            type="button"
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-xs shadow-lg transition-all cursor-pointer border ${
              isEnabled
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 hover:scale-105'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Global Voice Trigger Status & Settings"
          >
            {isEnabled ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <Mic className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline font-black text-[11px]">
                  Emergency Voice: Active
                </span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  Voice Trigger Off
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
