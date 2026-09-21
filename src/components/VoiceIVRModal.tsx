import React, { useState } from 'react';
import { PhoneCall, PhoneOff, Volume2, X, Mic, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

interface VoiceIVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const VoiceIVRModal: React.FC<VoiceIVRModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [ivrStep, setIvrStep] = useState<number>(1);
  const [spokenText, setSpokenText] = useState<string>(
    'Welcome to Medora Health Voice. Press 1 for My Health. Press 2 to report symptoms. Press 3 for lab reports. Press 4 to talk to doctor. Press 5 for emergency.'
  );

  if (!isOpen) return null;

  const startCall = () => {
    setCallActive(true);
    setIvrStep(1);
    const text = 'Welcome to Medora Health Voice service. Press 1 for My Health. Press 2 to report symptoms. Press 3 for lab reports. Press 4 to talk to a doctor. Press 5 for emergency.';
    setSpokenText(text);
    voiceService.speak(text, currentLang);
  };

  const endCall = () => {
    setCallActive(false);
    voiceService.stop();
  };

  const handleKeyPress = (num: number) => {
    let text = '';
    if (num === 1) {
      text = 'My Health: Your blood pressure is 158 over 96. Your fasting blood sugar is elevated. Your hemoglobin is 10.2.';
    } else if (num === 2) {
      text = 'Symptom Report: Please speak your symptoms after the tone or select option 1 for fever, option 2 for dizziness.';
    } else if (num === 3) {
      text = 'Report Status: Routine blood test extracted. Elevated glucose and blood pressure findings logged.';
    } else if (num === 4) {
      text = 'Doctor Connect: Transferring your health summary to Dr. Patil at Rampur Primary Health Center.';
    } else if (num === 5) {
      text = 'Emergency Help: For immediate ambulance dial 1 0 8. Do not delay.';
    } else {
      text = 'Main Menu: Press 1 for Health, Press 2 for Symptoms, Press 3 for Reports, Press 4 for Doctor, Press 5 for Emergency.';
    }
    setIvrStep(num);
    setSpokenText(text);
    voiceService.speak(text, currentLang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-white text-sm">Voice / IVR Phone Call</h3>
          </div>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
            VOICE / IVR DEMO
          </span>
          <button onClick={() => { endCall(); onClose(); }} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IVR Call Status Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
          <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all ${
            callActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
          }`}>
            <Volume2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white">Toll-Free Medora IVR</h4>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${callActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              {callActive ? '🔊 CALL CONNECTED (1800-MEDORA)' : 'DISCONNECTED'}
            </span>
          </div>

          {callActive && (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 leading-relaxed font-medium">
              "{spokenText}"
            </div>
          )}
        </div>

        {/* Interactive Keypad */}
        {callActive ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => handleKeyPress(n)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold py-2.5 rounded-xl border border-slate-700 text-sm shadow-sm"
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={endCall}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl shadow flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        ) : (
          <button
            onClick={startCall}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 fill-slate-950" />
            <span>Simulate Toll-Free IVR Call (1800-MEDORA)</span>
          </button>
        )}
      </div>
    </div>
  );
};
