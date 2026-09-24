import React from 'react';
import { PhoneCall, Users, Hospital, Truck, Mic, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';

interface EmergencyOverlayProps {
  onClose: () => void;
}

export default function EmergencyOverlay({ onClose }: EmergencyOverlayProps) {
  const navigate = useNavigate();

  const handleAction = (path: string, speakText?: string) => {
    if (speakText) {
      speechSynthesisService.speakResponse(speakText, 'en-IN', 'en-IN');
    }
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col z-10 animate-slide-up">
        <div className="bg-red-600 text-white p-4 rounded-t-3xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🚨</span>
            <span className="font-black text-xl tracking-tight">EMERGENCY MODE</span>
          </div>
          <button onClick={onClose} className="p-2 bg-red-700 hover:bg-red-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3 bg-red-50">
          <button 
            onClick={() => handleAction('/ivr', 'Dialing emergency services')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <PhoneCall size={24} />
            <span className="text-lg">CALL EMERGENCY (108)</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleAction('/sms', 'Alerting family members')}
              className="bg-white border-2 border-red-200 hover:border-red-400 text-red-700 font-bold py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Users size={24} className="text-red-500" />
              <span className="text-xs text-center">Alert Family</span>
            </button>

            <button 
              onClick={() => handleAction('/hospitals')}
              className="bg-white border-2 border-red-200 hover:border-red-400 text-red-700 font-bold py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Hospital size={24} className="text-red-500" />
              <span className="text-xs text-center">Nearest Hospital</span>
            </button>

            <button 
              onClick={() => handleAction('/transport')}
              className="bg-white border-2 border-red-200 hover:border-red-400 text-red-700 font-bold py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Truck size={24} className="text-red-500" />
              <span className="text-xs text-center">Transport Help</span>
            </button>

            <button 
              onClick={() => handleAction('/ai', 'How can I help with the emergency?')}
              className="bg-red-100 border-2 border-red-300 hover:border-red-400 text-red-800 font-black py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Mic size={24} className="text-red-600" />
              <span className="text-xs text-center">Speak Emergency</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
