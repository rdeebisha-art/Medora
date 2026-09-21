import React from 'react';
import { ShieldCheck, X, Users, FileText, Info, CheckCircle2, Lock, Phone } from 'lucide-react';
import { Contact, maskPhoneNumber } from '../services/communicationService';

interface MultiContactShareConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  manualPhoneNumber?: string;
  sharedDataItems: { label: string; key: string }[];
  onConfirmSend: () => void;
}

export const MultiContactShareConsentModal: React.FC<MultiContactShareConsentModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  manualPhoneNumber,
  sharedDataItems,
  onConfirmSend,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Confirm Health Data Sharing</h3>
              <p className="text-xs text-slate-500">Review recipient details and privacy permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Recipients & Manual Number */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Recipients:</span>
          </span>

          <ul className="space-y-1.5 text-slate-800 font-medium">
            {manualPhoneNumber && (
              <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-teal-200 bg-teal-50/40">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-black text-slate-900">{manualPhoneNumber}</span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Masked: {maskPhoneNumber(manualPhoneNumber)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded font-extrabold">
                  Manual Entry
                </span>
              </li>
            )}

            {selectedContacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="font-extrabold text-slate-900">{c.name}</span>
                  {c.phone && <p className="text-[10px] text-slate-400 font-mono">{maskPhoneNumber(c.phone)}</p>}
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {c.role}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Health Items */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Information to be shared:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sharedDataItems.map((item) => (
              <span key={item.key} className="bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-blue-200">
                ✓ {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Permission Privacy Statement */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center gap-2 font-semibold">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Permission Note: The recipient will receive only the selected information.</span>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>AI-generated information — professional review recommended.</span>
        </div>

        {/* Actions: [ Cancel ] [ Confirm & Send ] */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmSend}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Confirm & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
