import React from 'react';
import { Phone, Stethoscope, Ambulance, ArrowRight, FileText, BookOpen, ShieldAlert } from 'lucide-react';
import { LanguageCode, Hospital } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface HospitalContactCenterProps {
  onCallHospitalQuick: () => void;
  onContactDoctorQuick: () => void;
  onEmergencySupport: () => void;
  onViewReferral: () => void;
  onViewHealthSummary: () => void;
  hospitals: Hospital[];
  currentLang: LanguageCode;
}

export const HospitalContactCenter: React.FC<HospitalContactCenterProps> = ({
  onCallHospitalQuick,
  onContactDoctorQuick,
  onEmergencySupport,
  onViewReferral,
  onViewHealthSummary,
  hospitals,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];
  const primaryHosp = hospitals[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              DEMO CONTACT CENTER
            </span>
            <span className="text-xs text-slate-400">Rural Communication Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            {t.needMedicalHelp}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Immediate touch-friendly hotlines, clinic triage, and patient record access for rural households.
          </p>
        </div>

        <button
          onClick={onEmergencySupport}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all"
        >
          <ShieldAlert className="w-4 h-4 animate-ping" />
          <span>{t.emergencySupport} (108 / 112)</span>
        </button>
      </div>

      {/* Grid of 6 Big Accessible Rural Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. Call Hospital */}
        <button
          onClick={onCallHospitalQuick}
          className="flex flex-col items-center justify-center p-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 rounded-2xl border border-slate-700 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">{t.callHospital}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Civil Hospital Desk</span>
          <span className="mt-2 text-[9px] bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded">
            DEMO CONTACT
          </span>
        </button>

        {/* 2. Contact Doctor */}
        <button
          onClick={onContactDoctorQuick}
          className="flex flex-col items-center justify-center p-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 rounded-2xl border border-slate-700 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">{t.contactDoctor}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Teleconsultation / OPD</span>
          <span className="mt-2 text-[9px] bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded">
            DEMO CONTACT
          </span>
        </button>

        {/* 3. Emergency Support */}
        <button
          onClick={onEmergencySupport}
          className="flex flex-col items-center justify-center p-4 bg-red-950/40 hover:bg-red-900/40 active:scale-95 rounded-2xl border border-red-500/50 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
            <Ambulance className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">{t.emergencySupport}</span>
          <span className="text-[10px] text-red-300 mt-0.5">Dial 108 / 112 / 102</span>
          <span className="mt-2 text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
            24x7 HOTLINE
          </span>
        </button>

        {/* 4. View Referral */}
        <button
          onClick={onViewReferral}
          className="flex flex-col items-center justify-center p-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 rounded-2xl border border-slate-700 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">View Referral</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Check Status & Date</span>
          <span className="mt-2 text-[9px] bg-emerald-900/80 text-emerald-200 font-bold px-2 py-0.5 rounded">
            Active Tracker
          </span>
        </button>

        {/* 5. View Health Summary */}
        <button
          onClick={onViewHealthSummary}
          className="flex flex-col items-center justify-center p-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 rounded-2xl border border-slate-700 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">Health Summary</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Doctor-Ready Packet</span>
          <span className="mt-2 text-[9px] bg-purple-900/80 text-purple-200 font-bold px-2 py-0.5 rounded">
            PDF / Print Ready
          </span>
        </button>

        {/* 6. Emergency Instructions */}
        <button
          onClick={onEmergencySupport}
          className="flex flex-col items-center justify-center p-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 rounded-2xl border border-slate-700 transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white">{t.emergencyInstructions}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">First Aid & Triage</span>
          <span className="mt-2 text-[9px] bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded">
            Visual Guide
          </span>
        </button>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] text-slate-400 flex items-center justify-between gap-2">
        <span>
          Hospital Contact: <strong>{primaryHosp?.name}</strong> • Phone: {primaryHosp?.phone}
        </span>
        <span className="text-amber-400 font-bold">
          Always confirm details locally before long-distance travel.
        </span>
      </div>
    </div>
  );
};
