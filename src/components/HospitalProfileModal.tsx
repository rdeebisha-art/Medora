import React, { useState } from 'react';
import { X, Building2, Phone, ExternalLink, Navigation, CheckCircle, Stethoscope, HeartPulse, ShieldCheck, MapPin } from 'lucide-react';
import { Hospital, Doctor, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { initiatePhoneCall } from '../services/telephony/phoneCallHelper';

interface HospitalProfileModalProps {
  hospital: Hospital | null;
  doctorsAtHospital: Doctor[];
  onClose: () => void;
  onOpenDirections: (hospital: Hospital) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onPlanReferral: (hospital: Hospital) => void;
  currentLang: LanguageCode;
  isSelectedForReferral: boolean;
}

export const HospitalProfileModal: React.FC<HospitalProfileModalProps> = ({
  hospital,
  doctorsAtHospital,
  onClose,
  onOpenDirections,
  onSelectDoctor,
  onPlanReferral,
  currentLang,
  isSelectedForReferral,
}) => {
  const [callFeedback, setCallFeedback] = useState<string | null>(null);
  if (!hospital) return null;
  const t = TRANSLATIONS[currentLang];

  const handleCall = async () => {
    if (!hospital.phone) return;
    const res = await initiatePhoneCall(hospital.phone, hospital.name, { contactType: 'HOSPITAL' });
    setCallFeedback(res.message);
    setTimeout(() => setCallFeedback(null), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              {t.demoDataBadge}
            </span>
            <span className="text-xs text-slate-300 font-medium">Healthcare Facility Profile</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Facility Name & Overview */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                {hospital.type}
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                {hospital.status}
              </span>
              {hospital.ayushmanBharatEmpanelled && (
                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                  Ayushman Bharat Empanelled
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {hospital.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 flex items-start gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{hospital.address}</span>
            </p>

            <p className="text-xs font-semibold text-blue-700 mt-1">
              Landmark: {hospital.landmark}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium block">{t.distanceAway}</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                {hospital.distanceKm} km
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">{t.estimatedTravel}</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {hospital.travelTime.split('/')[0]}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Bed Capacity</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                {hospital.bedCapacity} Inpatient Beds
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Ambulance</span>
              <span className="font-semibold text-emerald-700 block mt-0.5">
                {hospital.ambulanceAvailable ? 'Available 24x7' : 'Arranged via 108'}
              </span>
            </div>
          </div>

          {/* Referral Suitability */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Clinical Suitability & Referral Role
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs">
              {hospital.referralSuitability}
            </p>
          </div>

          {/* Clinical Departments */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Clinical Departments & Diagnostics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hospital.departments.map((dept) => (
                <div
                  key={dept}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{dept}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors associated with this hospital */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Healthcare Professionals on Staff ({doctorsAtHospital.length})</span>
            </h4>

            {doctorsAtHospital.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg">
                No individual doctors currently indexed for this facility. Staff physicians attend during OPD hours.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctorsAtHospital.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white transition-all shadow-sm"
                  >
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                        {doc.name}
                      </h5>
                      <p className="text-[11px] font-bold text-emerald-700 truncate">
                        {doc.specialization}
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectDoctor(doc);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-bold mt-0.5"
                      >
                        View Full Profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call Feedback Banner */}
        {callFeedback && (
          <div className="bg-emerald-900 text-emerald-100 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-emerald-700 animate-in fade-in">
            <span>{callFeedback}</span>
            <button onClick={() => setCallFeedback(null)} className="text-emerald-300 hover:text-white text-xs font-bold ml-2">Dismiss</button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Call */}
            <button
              onClick={handleCall}
              className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.callHospital}</span>
            </button>

            {/* Official Website */}
            {hospital.website ? (
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.officialWebsite}</span>
              </a>
            ) : (
              <span className="py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-center text-[11px] flex items-center justify-center">
                {t.officialWebsiteUnavailable}
              </span>
            )}

            {/* Route */}
            <button
              onClick={() => {
                onClose();
                onOpenDirections(hospital);
              }}
              className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.getDirections}</span>
            </button>

            {/* Plan Referral */}
            <button
              onClick={() => {
                onPlanReferral(hospital);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isSelectedForReferral
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
              <span>{isSelectedForReferral ? 'Selected' : 'Select Facility'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
