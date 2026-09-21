import React, { useState } from 'react';
import { Smartphone, X, Send, RotateCcw, ShieldAlert, Bot } from 'lucide-react';
import { handleUSSDInput, initialUSSDSession } from '../services/channels/ussdAdapter';
import { USSDSessionState } from '../services/channels/channelTypes';

interface USSDSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientContext: Record<string, any>;
}

export const USSDSimulatorModal: React.FC<USSDSimulatorModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientContext,
}) => {
  const [session, setSession] = useState<USSDSessionState>(initialUSSDSession(patientId));
  const [inputVal, setInputVal] = useState<string>('');
  const [screenText, setScreenText] = useState<string>(
    `MEDORA USSD (*123#)\n1. My Health\n2. Report Symptoms\n3. Report Status\n4. Contact Doctor\n5. Emergency (108)\n\nSelect option (1-5):`
  );

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const { nextSession, displayText } = handleUSSDInput(session, inputVal, patientContext);
    setSession(nextSession);
    setScreenText(displayText);
    setInputVal('');
  };

  const handleReset = () => {
    const s = initialUSSDSession(patientId);
    setSession(s);
    setScreenText(`MEDORA USSD (*123#)\n1. My Health\n2. Report Symptoms\n3. Report Status\n4. Contact Doctor\n5. Emergency (108)\n\nSelect option (1-5):`);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-sm">USSD Simulator (*123#)</h3>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
            PROTOTYPE CONCEPT
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Phone Screen Mockup */}
        <div className="bg-emerald-950 border-2 border-slate-700 rounded-2xl p-4 font-mono text-emerald-300 text-xs min-h-[180px] whitespace-pre-line shadow-inner relative overflow-hidden">
          <div className="text-[9px] text-emerald-600 border-b border-emerald-900 pb-1 mb-2 flex items-center justify-between">
            <span>NETWORK: 2G / EDGE</span>
            <span>SIM1</span>
          </div>
          {screenText}
        </div>

        {/* Numeric Keypad Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter number (e.g. 1)..."
              className="bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl w-full focus:outline-none focus:border-amber-400 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button
              onClick={handleSend}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shrink-0 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button onClick={handleReset} className="text-slate-400 hover:text-white flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Reset Dial *123#</span>
            </button>
            <span className="text-slate-500 text-[10px]">Button Phone USSD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
