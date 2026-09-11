import React, { useState } from 'react';
import { X, Phone, Calendar, Building2, MapPin, Award, CheckCircle, Video, Clock, DollarSign, Send, Check } from 'lucide-react';
import { Doctor, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onConnectToReferral: (doctor: Doctor) => void;
  onViewHospital: (hospitalId: string) => void;
  currentLang: LanguageCode;
  isConnectedToReferral: boolean;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onConnectToReferral,
  onViewHospital,
  currentLang,
  isConnectedToReferral,
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [consultationMode, setConsultationMode] = useState<'In-person' | 'Teleconsultation'>('In-person');
  const [preferredDate, setPreferredDate] = useState('2026-09-12');
  const [reason, setReason] = useState('');

  if (!doctor) return null;
  const t = TRANSLATIONS[currentLang];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestForm(false);
      setRequestSubmitted(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              {t.demoDataBadge}
            </span>
            <span className="text-xs text-slate-300 font-medium">Doctor Profile</span>
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
          {/* Main Doctor Bio Block */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0 bg-slate-100"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {doctor.name}
                </h3>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {doctor.availabilityStatus}
                </span>
              </div>

              <p className="text-sm font-bold text-emerald-700 mt-1">
                {doctor.specialization} • {doctor.education}
              </p>

              <button
                onClick={() => onViewHospital(doctor.hospitalId)}
                className="text-xs text-slate-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 mt-1 underline"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{doctor.hospitalName}</span>
              </button>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium block">{t.experienceYears}</span>
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {doctor.experienceYears} Years
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">{t.languagesSpoken}</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">
                {doctor.languages.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">{t.consultationType}</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                {doctor.consultationType}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Consultation Fee</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                <DollarSign className="w-3.5 h-3.5" />
                {doctor.consultationFee.split('(')[0]}
              </span>
            </div>
          </div>

          {/* About Doctor */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
              About the Healthcare Professional
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {doctor.about}
            </p>
          </div>

          {/* Clinical Services */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Clinical Services & Focus Areas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctor.services.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs font-medium text-emerald-900"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OPD Schedule */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">OPD & Consultation Hours:</span>
              <p className="text-slate-600">{doctor.opdTimings}</p>
            </div>
          </div>

          {/* Consultation Request Form (Toggle) */}
          {showRequestForm && (
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-400 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Request Consultation with {doctor.name}
                </h4>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              {requestSubmitted ? (
                <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-emerald-700" />
                  <span>Consultation request registered! Facility will contact via SMS/Phone.</span>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Consultation Mode</label>
                      <select
                        value={consultationMode}
                        onChange={(e) => setConsultationMode(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="In-person">In-person at Hospital OPD</option>
                        <option value="Teleconsultation">Teleconsultation (Audio/Video Call)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Primary Concern</label>
                      <input
                        type="text"
                        placeholder="e.g. Blood pressure spikes / Joint pain"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Consultation Booking</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <a
              href={`tel:${doctor.contactPhone.replace(/[^0-9]/g, '')}`}
              className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.callDoctor}</span>
            </a>

            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.requestConsultation}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onViewHospital(doctor.hospitalId);
              }}
              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>View Hospital</span>
            </button>

            <button
              onClick={() => {
                onConnectToReferral(doctor);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isConnectedToReferral
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isConnectedToReferral ? 'Connected' : t.addToReferral}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
