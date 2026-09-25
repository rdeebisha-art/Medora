import React from 'react';
import { PhoneCall, X, Info, Phone, Radio } from 'lucide-react';
import { LanguageCode } from '../types';
import { useAppStore } from '../store/useAppStore';

interface VoiceIVRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const VoiceIVRModal: React.FC<VoiceIVRModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { startDirectCall } = useAppStore();
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
            <h3 className="text-lg font-black text-slate-900">Medora Voice Call</h3>
            <p className="text-xs text-slate-500">Real-Time In-App Calling</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6 flex gap-3">
          <Radio className="w-5 h-5 text-teal-600 shrink-0" />
          <p className="text-sm text-teal-900">
            Real peer-to-peer WebRTC voice call directly within Medora. No phone app or external dialer needed.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              startDirectCall({
                name: 'Medora Health Telehealth Support',
                phone: '18001234567',
                category: 'SUPPORT',
                targetUserId: 'DOC-01',
                emergency: false,
              });
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold transition-all cursor-pointer shadow-md"
          >
            <Phone className="w-5 h-5" />
            <span>Call Inside Medora (1800-123-4567)</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
