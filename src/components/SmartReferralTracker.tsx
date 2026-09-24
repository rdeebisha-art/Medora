import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, UserCheck, Calendar, Building2, Stethoscope, AlertCircle, Plus, FileText } from 'lucide-react';
import { Referral, ReferralStatus, ReferralPriority, Specialization, Doctor, Hospital, LanguageCode, FamilyMember } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SmartReferralTrackerProps {
  referrals: Referral[];
  activeReferralId: string;
  onSelectActiveReferral: (id: string) => void;
  onUpdateReferralStatus: (id: string, newStatus: ReferralStatus) => void;
  onCreateReferral: (newReferral: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onBrowseDoctorsForSpecialty: (specialty: Specialization) => void;
  onBrowseHospitals: () => void;
  onOpenDoctorHandoff: () => void;
  doctors: Doctor[];
  hospitals: Hospital[];
  familyMembers: FamilyMember[];
  currentLang: LanguageCode;
}

export const SmartReferralTracker: React.FC<SmartReferralTrackerProps> = ({
  referrals,
  activeReferralId,
  onSelectActiveReferral,
  onUpdateReferralStatus,
  onCreateReferral,
  onBrowseDoctorsForSpecialty,
  onBrowseHospitals,
  onOpenDoctorHandoff,
  doctors,
  hospitals,
  familyMembers,
  currentLang,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState(familyMembers[0]?.id || '');
  const [newReason, setNewReason] = useState('');
  const [newSpecialty, setNewSpecialty] = useState<Specialization>('General Physician');
  const [newPriority, setNewPriority] = useState<ReferralPriority>('Routine');

  const t = TRANSLATIONS[currentLang];
  const activeReferral = referrals.find(r => r.id === activeReferralId) || referrals[0];

  const statusStages: ReferralStatus[] = [
    'Pending',
    'Referred',
    'Facility Selected',
    'Appointment Scheduled',
    'Consultation Completed',
    'Follow-Up Required',
    'Follow-Up Completed'
  ];

  const getStatusIndex = (st: ReferralStatus) => statusStages.indexOf(st);

  const getPriorityBadge = (p: ReferralPriority) => {
    switch (p) {
      case 'Immediate': return 'bg-red-100 text-red-800 border-red-300';
      case 'Urgent': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = familyMembers.find(f => f.id === newPatientId) || familyMembers[0];
    onCreateReferral({
      patientId: patient.id,
      patientName: patient.name.split('(')[0].trim(),
      patientAge: patient.age,
      patientGender: patient.gender,
      reason: newReason,
      specialty: newSpecialty,
      priority: newPriority,
      contactInfo: '+91 94481 00223',
      status: 'Pending',
      notes: 'Initiated via Medora rural health continuity assessment.'
    });
    setShowCreateModal(false);
    setNewReason('');
  };

  const handleNextStage = () => {
    if (!activeReferral) return;
    const currentIdx = getStatusIndex(activeReferral.status);
    if (currentIdx < statusStages.length - 1) {
      onUpdateReferralStatus(activeReferral.id, statusStages[currentIdx + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-emerald-300 transform -skew-x-12" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Medora Continuity Protocol</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Smart Referral & Follow-Up System
          </h2>
          <p className="text-sm sm:text-base text-slate-200 mt-2 leading-relaxed">
            Bridging village health concerns with qualified specialists, local PHCs, and community follow-up. Automatically links selected doctors and hospitals to your health record.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Referral</span>
            </button>
            <button
              onClick={onOpenDoctorHandoff}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Generate Doctor Handoff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Selection Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {referrals.map((ref) => {
          const isSelected = ref.id === activeReferral?.id;
          return (
            <button
              key={ref.id}
              onClick={() => onSelectActiveReferral(ref.id)}
              className={`flex-shrink-0 p-4 rounded-2xl border-2 text-left transition-all min-w-[260px] ${
                isSelected
                  ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-100'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
                  {ref.patientName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(ref.priority)}`}>
                  {ref.priority}
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-700 truncate">
                {ref.specialty}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-1">
                Status: <strong className="text-slate-800">{ref.status}</strong>
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Referral Deep Dive Card */}
      {activeReferral && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Active Referral Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                  REF ID: {activeReferral.id}
                </span>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(activeReferral.priority)}`}>
                  {activeReferral.priority} Priority
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Logged: {activeReferral.createdAt}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {activeReferral.patientName} ({activeReferral.patientAge}y, {activeReferral.patientGender})
              </h3>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                Target Specialty: {activeReferral.specialty}
              </p>
            </div>

            {/* Current Status Pill & Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Current Pipeline Status
                </span>
                <span className="inline-block text-sm sm:text-base font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl">
                  {activeReferral.status}
                </span>
              </div>

              {getStatusIndex(activeReferral.status) < statusStages.length - 1 && (
                <button
                  onClick={handleNextStage}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 7-Stage Horizontal Pipeline Stepper */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Rural Continuity Stepper (Health Concern → Follow-Up)
            </h4>
            <div className="overflow-x-auto py-3">
              <div className="flex items-center min-w-[700px] justify-between relative">
                {/* Connecting Background Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />

                {statusStages.map((stage, idx) => {
                  const currentIdx = getStatusIndex(activeReferral.status);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stage}
                      onClick={() => onUpdateReferralStatus(activeReferral.id, stage)}
                      className="relative z-10 flex flex-col items-center cursor-pointer group px-2"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-lg scale-110'
                            : 'bg-white text-slate-400 border-2 border-slate-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5 animate-spin" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-extrabold text-center max-w-[85px] leading-tight ${
                          isCurrent
                            ? 'text-amber-800'
                            : isCompleted
                            ? 'text-emerald-800'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Referral Reason & Clinical Context */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              Reason for Clinical Referral
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {activeReferral.reason}
            </p>
            {activeReferral.notes && (
              <p className="text-xs text-slate-500 italic mt-1">
                Clinical Note: {activeReferral.notes}
              </p>
            )}
          </div>

          {/* Connected Doctor & Facility Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Connected Doctor Card */}
            <div className="border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 bg-white relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  Assigned Healthcare Professional
                </span>
                {activeReferral.selectedDoctorId ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Linked
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Not Selected
                  </span>
                )}
              </div>

              {activeReferral.selectedDoctorId ? (
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {activeReferral.selectedDoctorName}
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {activeReferral.specialty}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact: {activeReferral.contactInfo}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onBrowseDoctorsForSpecialty(activeReferral.specialty)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change Doctor
                    </button>
                    <a
                      href={`tel:${activeReferral.contactInfo.replace(/[^0-9]/g, '')}`}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      📞 Call Doctor
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No doctor is linked yet for this referral concern.
                  </p>
                  <button
                    onClick={() => onBrowseDoctorsForSpecialty(activeReferral.specialty)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Find {activeReferral.specialty} in Directory →
                  </button>
                </div>
              )}
            </div>

            {/* Connected Hospital Card */}
            <div className="border-2 border-blue-200 rounded-2xl p-4 sm:p-5 bg-white relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Selected Healthcare Facility
                </span>
                {activeReferral.selectedHospitalId ? (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Facility Set
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Facility Needed
                  </span>
                )}
              </div>

              {activeReferral.selectedHospitalId ? (
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {activeReferral.selectedHospitalName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    OPD Desk & Triage linked to referral profile.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={onBrowseHospitals}
                      className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Switch Facility
                    </button>
                    <button
                      onClick={onBrowseHospitals}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Facility Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Select an empanelled PHC, CHC, or District Hospital.
                  </p>
                  <button
                    onClick={onBrowseHospitals}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Browse Hospitals Directory →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Follow-Up Timetable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 font-bold block">Appointment Scheduled For:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {activeReferral.appointmentDate || 'Pending scheduling'} {activeReferral.appointmentTime ? `at ${activeReferral.appointmentTime}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-slate-500 font-bold block">Next Follow-Up Reminder:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {activeReferral.followUpDate || 'Set after consultation completion'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Referral */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                Initiate New Referral
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Family Member</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-emerald-500 focus:outline-none"
                >
                  {familyMembers.map((fam) => (
                    <option key={fam.id} value={fam.id}>
                      {fam.name} ({fam.age}y, {fam.primaryCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Medical Specialty</label>
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="General Physician">General Physician</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Gynecologist / Obstetrician">Gynecologist / Obstetrician</option>
                  <option value="Geriatric Care">Geriatric Care</option>
                  <option value="Diabetologist">Diabetologist</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Nutritionist">Nutritionist</option>
                  <option value="Mental Wellness Professional">Mental Wellness Professional</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Routine', 'Urgent', 'Immediate'] as ReferralPriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`py-2 rounded-xl font-bold border transition-colors ${
                        newPriority === p
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Health Concern & Reason</label>
                <textarea
                  required
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Describe recent symptoms, vitals spikes, or reason doctor consultation is needed..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
