import React from 'react';
import { PhoneCall, X, Info, Phone } from 'lucide-react';
import { LanguageCode } from '../types';

interface VoiceIVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const VoiceIVRModal: React.FC<VoiceIVRModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <PhoneCall className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Voice Call</h3>
            <p className="text-xs text-slate-500">Real Telephony Integration</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            A normal web browser cannot directly simulate phone calls natively.
            To place a real call, your device's actual phone dialer will be used.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="tel:18001234567"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
          >
            <Phone className="w-5 h-5" />
            Call Medora (1800-123-4567)
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
