import React from 'react';
import { Phone, Navigation, ExternalLink, ArrowRight, Ambulance, Stethoscope, Building2, Volume2, ShieldAlert } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { voiceService } from '../services/voiceService';

interface SimpleModeViewProps {
  onFindDoctor: () => void;
  onFindHospital: () => void;
  onCallQuick: () => void;
  onOpenDirections: () => void;
  onOpenWebsite: () => void;
  onOpenReferral: () => void;
  onOpenEmergency: () => void;
  currentLang: LanguageCode;
}

export const SimpleModeView: React.FC<SimpleModeViewProps> = ({
  onFindDoctor,
  onFindHospital,
  onCallQuick,
  onOpenDirections,
  onOpenWebsite,
  onOpenReferral,
  onOpenEmergency,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const playTileVoice = (text: string) => {
    voiceService.speak(text, currentLang);
  };

  return (
    <div className="space-y-6">
      {/* Friendly Simple Mode Header */}
      <div className="bg-amber-500 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-600/60 px-3 py-1 rounded-full text-xs font-black uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>{t.simpleMode} ( )</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          {t.appName} – {t.tagline}
        </h2>
        <p className="text-sm sm:text-base font-semibold text-amber-100">
          Touch any big button below to find a doctor, locate an ambulance, or call the hospital.
        </p>
      </div>

      {/* Grid of Giant High-Contrast Touch Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Find Doctor */}
        <button
          onClick={onFindDoctor}
          className="p-6 sm:p-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-10 h-10" />
          </div>
          <span className="text-xl sm:text-2xl font-black">{t.findDoctor}</span>
          <span className="text-xs sm:text-sm font-medium text-emerald-100 mt-1">
            General Physicians, Child & Senior Care
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice(t.findDoctor);
            }}
            className="mt-4 p-2 bg-emerald-800 rounded-full hover:bg-emerald-900"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>

        {/* 2. Find Hospital */}
        <button
          onClick={onFindHospital}
          className="p-6 sm:p-8 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-10 h-10" />
          </div>
          <span className="text-xl sm:text-2xl font-black">{t.findHospital}</span>
          <span className="text-xs sm:text-sm font-medium text-blue-100 mt-1">
            Government PHC, CHC & District Hospitals
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice(t.findHospital);
            }}
            className="mt-4 p-2 bg-blue-800 rounded-full hover:bg-blue-900"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>

        {/* 3. Call */}
        <button
          onClick={onCallQuick}
          className="p-6 sm:p-8 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Phone className="w-10 h-10 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black">Call ( )</span>
          <span className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
            Speak Directly with Clinic Reception
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice('Call hospital reception desk');
            }}
            className="mt-4 p-2 bg-slate-700 rounded-full hover:bg-slate-600"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>

        {/* 4. Directions & Route */}
        <button
          onClick={onOpenDirections}
          className="p-6 sm:p-8 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Navigation className="w-10 h-10" />
          </div>
          <span className="text-xl sm:text-2xl font-black">{t.getDirections}</span>
          <span className="text-xs sm:text-sm font-medium text-amber-100 mt-1">
            Rural Route & Landmark Bus Guides
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice(t.getDirections);
            }}
            className="mt-4 p-2 bg-amber-800 rounded-full hover:bg-amber-900"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>

        {/* 5. Hospital Website */}
        <button
          onClick={onOpenWebsite}
          className="p-6 sm:p-8 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ExternalLink className="w-10 h-10" />
          </div>
          <span className="text-xl sm:text-2xl font-black">{t.officialWebsite}</span>
          <span className="text-xs sm:text-sm font-medium text-indigo-100 mt-1">
            Verified National Health Portals
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice(t.officialWebsite);
            }}
            className="mt-4 p-2 bg-indigo-800 rounded-full hover:bg-indigo-900"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>

        {/* 6. My Referral & Follow-Up */}
        <button
          onClick={onOpenReferral}
          className="p-6 sm:p-8 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-3xl shadow-lg flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ArrowRight className="w-10 h-10" />
          </div>
          <span className="text-xl sm:text-2xl font-black">{t.referrals}</span>
          <span className="text-xs sm:text-sm font-medium text-teal-100 mt-1">
            Check Status & Follow-Up Dates
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTileVoice(t.referrals);
            }}
            className="mt-4 p-2 bg-teal-800 rounded-full hover:bg-teal-900"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </button>
      </div>

      {/* Persistent Big Emergency Red Banner */}
      <button
        onClick={onOpenEmergency}
        className="w-full p-6 sm:p-8 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-2xl animate-bounce">
            <Ambulance className="w-10 h-10" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-red-800 px-2.5 py-0.5 rounded text-red-200">
              URGENT MEDICAL HELP
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              {t.emergencyHelp} – Dial 108 / 112
            </h3>
            <p className="text-xs sm:text-sm text-red-100 mt-0.5 font-medium">
              Immediate Free Ambulance, Maternity & Police Help. Do not wait for AI.
            </p>
          </div>
        </div>

        <span className="px-6 py-3 bg-white text-red-600 font-black rounded-2xl text-base shadow-md">
          OPEN EMERGENCY
        </span>
      </button>
    </div>
  );
};
