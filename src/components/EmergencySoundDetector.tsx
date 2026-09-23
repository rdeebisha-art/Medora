import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { EmergencySoundEvent } from '../types';

interface Props {
  onTriggerEmergencyModal: () => void;
  patientName?: string;
}

export const EmergencySoundDetector: React.FC<Props> = ({ onTriggerEmergencyModal, patientName = 'Patient' }) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedEvent, setDetectedEvent] = useState<EmergencySoundEvent | null>(null);
  const [simulatedScore, setSimulatedScore] = useState<number>(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        // Simulated audio energy / confidence score fluctuation
        const randomScore = Math.floor(Math.random() * 45) + 10;
        setSimulatedScore(randomScore);
      }, 1000);
    } else {
      setSimulatedScore(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const requestMicPermission = async () => {
    setShowPermissionModal(true);
  };

  const confirmPermission = async () => {
    setShowPermissionModal(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stream acquired for permission check
        stream.getTracks().forEach(t => t.stop());
        setHasPermission(true);
        setIsListening(true);
      } else {
        setHasPermission(true);
        setIsListening(true);
      }
    } catch (err) {
      // Fallback for simulation mode even if real mic is denied
      setHasPermission(true);
      setIsListening(true);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setDetectedEvent(null);
    } else {
      if (!hasPermission) {
        requestMicPermission();
      } else {
        setIsListening(true);
      }
    }
  };

  const triggerSimulatedSound = (type: EmergencySoundEvent['category']) => {
    const event: EmergencySoundEvent = {
      id: `snd-${Date.now()}`,
      category: type,
      confidence: 88,
      detectedAt: new Date().toLocaleTimeString(),
      status: 'detected',
    };
    setDetectedEvent(event);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isListening ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Emergency Sound Detection</span>
              <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                DEMO SIMULATION
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Acoustic monitoring for distress calls, screams, or falls near household
            </p>
          </div>
        </div>

        <button
          onClick={toggleListening}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            isListening
              ? 'bg-rose-600 text-white shadow-md hover:bg-rose-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Enable Detector</span>
            </>
          )}
        </button>
      </div>

      {/* Live Monitor Bar */}
      {isListening && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              🎙️ Ambient Acoustic Sensor Active
            </span>
            <span className="font-mono text-slate-500">Audio Level: {simulatedScore}%</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                simulatedScore > 70 ? 'bg-rose-500' : simulatedScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${simulatedScore}%` }}
            />
          </div>

          {/* Test Trigger Buttons for Simulation */}
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">Simulate Sound Event (Demo Test):</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => triggerSimulatedSound('scream_distress')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-lg font-semibold"
              >
                😱 Distress Scream (88%)
              </button>
              <button
                onClick={() => triggerSimulatedSound('fall_impact')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-lg font-semibold"
              >
                💥 Fall Impact (82%)
              </button>
              <button
                onClick={() => triggerSimulatedSound('help_call')}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs px-2.5 py-1 rounded-lg font-semibold"
              >
                🗣️ "Help" Call (91%)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detection Event Alert Card */}
      {detectedEvent && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>⚠️ Possible Emergency Sound Detected ({detectedEvent.detectedAt})</span>
            </div>
            <span className="bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
              Confidence: {detectedEvent.confidence}%
            </span>
          </div>

          <p className="text-xs text-rose-900 leading-relaxed">
            The acoustic detector flagged a pattern consistent with <strong>{detectedEvent.category.replace('_', ' ').toUpperCase()}</strong> near {patientName}.
            This confidence score is an estimation and NOT medical proof of danger.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTriggerEmergencyModal}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <ShieldAlert className="w-4 h-4" />
              Open Emergency Escalation (108)
            </button>
            <button
              onClick={() => setDetectedEvent(null)}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3 py-2 rounded-xl"
            >
              Dismiss / False Alarm
            </button>
          </div>
        </div>
      )}

      {/* Mic Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Mic className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Microphone Access Request</h3>
                <p className="text-xs text-slate-500">Medora Emergency Sound Detection</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Privacy & Safety Notice</span>
              </div>
              <p>
                Medora listens locally on your device for emergency acoustic frequencies (screams, heavy falls, call for help).
                Audio data is <strong>never uploaded or recorded</strong> to any cloud server.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmPermission}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
              >
                Allow Microphone & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
