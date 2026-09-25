import React from 'react';
import { Building2, Phone, ExternalLink, Navigation, Users, ArrowRight, ShieldCheck, HeartPulse, MapPin } from 'lucide-react';
import { Hospital, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';

interface HospitalDirectoryProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onViewDoctorsAtHospital: (hospitalId: string) => void;
  onOpenDirections: (hospital: Hospital) => void;
  onPlanReferralWithHospital: (hospital: Hospital) => void;
  currentLang: LanguageCode;
  selectedReferralHospitalId?: string;
}

export const HospitalDirectory: React.FC<HospitalDirectoryProps> = ({
  hospitals,
  onSelectHospital,
  onViewDoctorsAtHospital,
  onOpenDirections,
  onPlanReferralWithHospital,
  currentLang,
  selectedReferralHospitalId,
}) => {
  const t = TRANSLATIONS[currentLang];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Government Hospital': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Primary Health Centre': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Community Health Centre': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Maternal Care': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Child Care': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Specialty Hospital': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Emergency Care': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Healthcare Facilities & Referral Centers</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300">
              {hospitals.length} Hospitals
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Government PHCs, Community Health Centers, and empanelled hospitals mapped for rural connectivity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {hospitals.map((hospital) => {
          const isConnected = selectedReferralHospitalId === hospital.id;

          return (
            <div
              key={hospital.id}
              className={`bg-white rounded-2xl border-2 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isConnected
                  ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Header: DEMO DATA badge & Hospital Type */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      {t.demoDataBadge}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTypeColor(hospital.type)}`}>
                      {hospital.type}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    hospital.status === 'Open 24/7' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {hospital.status}
                  </span>
                </div>

                {/* Hospital Name & Landmark */}
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {hospital.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}</span>
                  </p>
                  <p className="text-xs font-semibold text-blue-700 mt-1">
                    Landmark: {hospital.landmark}
                  </p>
                </div>

                {/* Distance & Badges Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">{t.distanceAway}</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {hospital.distanceKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">{t.estimatedTravel}</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {hospital.travelTime.split('/')[0]}
                    </span>
                  </div>
                </div>

                {/* Referral Suitability */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-900 mb-3">
                  <strong className="font-bold flex items-center gap-1 text-emerald-800 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Referral Suitability:
                  </strong>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {hospital.referralSuitability}
                  </p>
                </div>

                {/* Departments */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Key Departments & Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {hospital.departments.slice(0, 4).map((dept) => (
                      <span
                        key={dept}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {dept}
                      </span>
                    ))}
                    {hospital.departments.length > 4 && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        +{hospital.departments.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Emergency & Ayushman Badges */}
                <div className="flex flex-wrap items-center gap-2 pb-2 text-[11px]">
                  {hospital.verifiedEmergency && (
                    <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      <HeartPulse className="w-3 h-3 text-red-600" />
                      Verified 24/7 Emergency
                    </span>
                  )}
                  {hospital.ayushmanBharatEmpanelled && (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Ayushman Bharat PM-JAY
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Call Hospital */}
                  <button
                    onClick={() => callPhoneNumber(hospital.phone || '04542-241200', hospital.name, 'HOSPITAL', hospital.address)}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl font-bold transition-colors text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </button>

                  {/* Official Website */}
                  {hospital.website ? (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl font-bold transition-colors text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Website</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center justify-center text-center p-1 bg-slate-50 rounded-xl">
                      Website N/A
                    </span>
                  )}

                  {/* Get Directions */}
                  <button
                    onClick={() => onOpenDirections(hospital)}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-200 rounded-xl font-bold transition-colors text-center"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>Route</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* View Associated Doctors */}
                  <button
                    onClick={() => onViewDoctorsAtHospital(hospital.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.viewDoctors}</span>
                  </button>

                  {/* Plan Referral */}
                  <button
                    onClick={() => onPlanReferralWithHospital(hospital)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-colors ${
                      isConnected
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{isConnected ? 'Selected' : t.planReferral}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
