import React from 'react';
import { X, PhoneCall, AlertTriangle, Ambulance, ShieldAlert, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';
import { Hospital, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  currentLang: LanguageCode;
  onSelectHospital: (hospital: Hospital) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  currentLang,
  onSelectHospital,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[currentLang];

  const emergencyHospital = hospitals.find(h => h.type === 'Emergency Care') || hospitals[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-4 border-red-500 overflow-hidden">
        {/* Emergency Header Bar */}
        <div className="bg-red-600 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-red-800 px-2 py-0.5 rounded text-red-200">
                24x7 Immediate Emergency
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                {t.emergencyTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Critical Mandatory Safety Alert */}
          <div className="bg-red-50 border-2 border-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-red-950">
              <h4 className="font-bold text-sm sm:text-base">CRITICAL SAFETY INSTRUCTION</h4>
              <p className="text-xs sm:text-sm font-semibold mt-1 leading-relaxed text-red-900">
                "{t.emergencyNotice}"
              </p>
              <p className="text-[11px] text-red-700 mt-1">
                Medora is an informational health continuity platform. The AI does not diagnose emergency conditions and must never be used to delay calling professional emergency services.
              </p>
            </div>
          </div>

          {/* Large One-Touch Dial Emergency Buttons */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Instant Verified Emergency Hotlines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:108"
                className="flex flex-col items-center justify-center p-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl shadow-md transition-all group"
              >
                <Ambulance className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black tracking-tight">108</span>
                <span className="text-xs font-semibold text-red-100 text-center">
                  Rural Ambulance & Trauma
                </span>
                <span className="mt-2 text-[10px] bg-red-800 px-2 py-0.5 rounded font-bold">
                  TAP TO CALL
                </span>
              </a>

              <a
                href="tel:112"
                className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl shadow-md transition-all group"
              >
                <PhoneCall className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform text-amber-400" />
                <span className="text-2xl font-black tracking-tight">112</span>
                <span className="text-xs font-semibold text-slate-300 text-center">
                  National Unified Emergency
                </span>
                <span className="mt-2 text-[10px] bg-slate-700 px-2 py-0.5 rounded font-bold">
                  TAP TO CALL
                </span>
              </a>

              <a
                href="tel:102"
                className="flex flex-col items-center justify-center p-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-md transition-all group"
              >
                <HeartPulse className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black tracking-tight">102</span>
                <span className="text-xs font-semibold text-rose-100 text-center">
                  Janani Shishu (Maternal/Child)
                </span>
                <span className="mt-2 text-[10px] bg-rose-800 px-2 py-0.5 rounded font-bold">
                  TAP TO CALL
                </span>
              </a>
            </div>
          </div>

          {/* Nearest Emergency Hospital Card */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                Nearest 24x7 Emergency Facility
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                {emergencyHospital.distanceKm} km away
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {emergencyHospital.name}
                </h4>
                <p className="text-xs text-slate-500">{emergencyHospital.address}</p>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  🚑 24x7 Resuscitation & Trauma Bay • Blood Storage Available
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${emergencyHospital.emergencyPhone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 sm:flex-none text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg"
                >
                  📞 Direct Hotline
                </a>
                <button
                  onClick={() => {
                    onClose();
                    onSelectHospital(emergencyHospital);
                  }}
                  className="flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Rural First-Aid Emergency Guidelines */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Immediate Rural First-Aid Guidance (While Help Arrives)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <strong className="text-amber-900 block font-bold">🫀 Chest Pain / Suspected Heart Attack:</strong>
                Keep patient calm and seated upright. Do not walk. Loosen tight collar. Call 108 immediately.
              </div>
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <strong className="text-red-900 block font-bold">🩸 Severe Bleeding / Trauma:</strong>
                Apply continuous firm direct pressure with a clean cloth. Elevate injured limb. Do not wash open deep wounds.
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <strong className="text-blue-900 block font-bold">😵 Unconsciousness / Fainting:</strong>
                Turn patient gently onto their left side (recovery position). Ensure throat and breathing airway are clear.
              </div>
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                <strong className="text-purple-900 block font-bold">👶 Child High Fever / Fits:</strong>
                Sponge forehead and neck with room-temperature water. Never force water or food into the mouth during convulsions.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 text-center border-t border-slate-200">
          <p className="text-[11px] text-slate-600 font-medium">
            Demo contact information provided for demonstration purposes. In real emergencies, always use state emergency services <strong>108</strong> / <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
