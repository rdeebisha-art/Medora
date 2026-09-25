import React, { useState } from 'react';
import { Phone, User, Calendar, PlusCircle, CheckCircle, Video, MapPin, Award, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { Doctor, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';
import { useAppStore } from '../store/useAppStore';
import { TwoWayDoctorChatModal } from './TwoWayDoctorChatModal';
import {
  SPECIALTY_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  LANGUAGE_DISPLAY_NAMES,
  CONSULTATION_TYPE_TRANSLATIONS
} from '../data/doctorsDataset';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onRequestConsultation: (doctor: Doctor) => void;
  onConnectToReferral: (doctor: Doctor) => void;
  onViewHospitalById: (hospitalId: string) => void;
  currentLang: LanguageCode;
  selectedReferralDoctorId?: string;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  onSelectDoctor,
  onRequestConsultation,
  onConnectToReferral,
  onViewHospitalById,
  currentLang,
  selectedReferralDoctorId,
}) => {
  const t = TRANSLATIONS[currentLang];
  const { startDirectCall, currentUser } = useAppStore();
  const [chatDoctor, setChatDoctor] = useState<Doctor | null>(null);

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No doctors match your filters</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Try clearing some filters or searching for broader specialties like "General Physician" or "Cardiologist".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Available Medical Professionals</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              {doctors.length} Doctors
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Certified practitioners available for primary evaluation, specialist referral, and follow-up care.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {doctors.map((doctor) => {
          const isConnected = selectedReferralDoctorId === doctor.id;

          return (
            <div
              key={doctor.id}
              className={`bg-white rounded-2xl border-2 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isConnected
                  ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div>
                {/* Header: DEMO DATA badge and Availability */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    {t.demoDataBadge}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    doctor.availabilityStatus.includes('Today') || doctor.availabilityStatus.includes('Emergency')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      doctor.availabilityStatus.includes('Today') ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    {STATUS_TRANSLATIONS[doctor.availabilityStatus]?.[currentLang] || doctor.availabilityStatus}
                  </span>
                </div>

                {/* Doctor Core Info */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {doctor.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
                      {SPECIALTY_TRANSLATIONS[doctor.specialization]?.[currentLang] || doctor.specialization}
                    </p>
                    <button
                      onClick={() => onViewHospitalById(doctor.hospitalId)}
                      className="text-xs text-slate-600 hover:text-emerald-700 font-medium line-clamp-1 text-left mt-0.5 underline decoration-slate-300 hover:decoration-emerald-500"
                    >
                      🏥 {doctor.hospitalName}
                    </button>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {doctor.experienceYears} {t.experienceYears || 'yrs exp'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{doctor.location.split(',')[0]}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Languages & Consultation Mode Badges */}
                <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-500">{t.languagesSpoken}:</span>
                    <span className="font-semibold text-slate-800">
                      {doctor.languages.map(l => LANGUAGE_DISPLAY_NAMES[l]?.[currentLang] || l).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-500">{t.consultationType}:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      <Video className="w-3 h-3 text-emerald-600" />
                      {CONSULTATION_TYPE_TRANSLATIONS[doctor.consultationType]?.[currentLang] || doctor.consultationType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-500">Timings / OPD:</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {doctor.opdTimings.split(';')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-2 space-y-2">
                {/* Real In-App Communication Row */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      startDirectCall({
                        name: doctor.name,
                        phone: doctor.contactPhone || '9800001111',
                        category: 'DOCTOR',
                        targetUserId: 'DOC-01',
                        location: doctor.hospitalName,
                        emergency: false,
                      });
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>

                  <button
                    onClick={() => setChatDoctor(doctor)}
                    className="flex items-center justify-center gap-1 py-2 px-2.5 bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-800 rounded-xl font-bold text-xs border border-teal-200 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => {
                      startDirectCall({
                        name: doctor.name,
                        phone: doctor.contactPhone || '9800001111',
                        category: 'DOCTOR',
                        targetUserId: 'DOC-01',
                        location: doctor.hospitalName,
                        emergency: true,
                        emergencyType: 'Direct Emergency Call to Doctor',
                        symptoms: 'Urgent medical assistance requested via Emergency Call button',
                      });
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-800 rounded-xl font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Emergency</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDoctor(doctor)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.viewProfile}</span>
                  </button>

                  <button
                    onClick={() => onRequestConsultation(doctor)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.requestConsultation}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real In-App Two-Way Doctor Chat Modal */}
      {chatDoctor && (
        <TwoWayDoctorChatModal
          isOpen={Boolean(chatDoctor)}
          onClose={() => setChatDoctor(null)}
          patientId={currentUser ? `P00${currentUser.id || 1}` : 'P001'}
          patientName={currentUser?.name || 'Patient'}
          userRole={currentUser?.role || 'patient'}
          doctorId="DOC-01"
          doctorName={chatDoctor.name}
          onStartCall={() => {
            const doc = chatDoctor;
            setChatDoctor(null);
            startDirectCall({
              name: doc.name,
              phone: doc.contactPhone || '9800001111',
              category: 'DOCTOR',
              targetUserId: 'DOC-01',
              location: doc.hospitalName,
              emergency: false,
            });
          }}
        />
      )}
    </div>
  );
};
