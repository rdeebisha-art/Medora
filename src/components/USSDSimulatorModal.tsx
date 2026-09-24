import React from 'react';
import { X, Hash, Info, Smartphone } from 'lucide-react';

interface USSDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const USSDSimulatorModal: React.FC<USSDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Hash className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">USSD Service</h3>
            <p className="text-xs text-slate-500">Real Telephony Integration</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            A normal web browser cannot directly execute carrier USSD sessions. 
            USSD requires a supported mobile/telephony integration.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="tel:*123%23"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
          >
            <Smartphone className="w-5 h-5" />
            Dial *123#
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
