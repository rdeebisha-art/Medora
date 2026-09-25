import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, MedicalRecord, Medicine, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  User,
  Heart,
  Shield,
  Phone,
  MapPin,
  Globe,
  Save,
  CheckCircle,
  Stethoscope,
  Activity,
  Pill,
  ClipboardList,
  Calendar,
  ExternalLink,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ProfileRecordTab = 'consultation' | 'vitals' | 'prescription';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { currentUser, language, setLanguage } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    village: '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Medical Records for this User Profile
  const [activeTab, setActiveTab] = useState<ProfileRecordTab>('consultation');
  const [consultations, setConsultations] = useState<MedicalRecord[]>([]);
  const [vitalsLogs, setVitalsLogs] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<MedicalRecord[]>([]);
  const [activeMeds, setActiveMeds] = useState<Medicine[]>([]);
  const [recentTests, setRecentTests] = useState<HealthTest[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : 1;

    // Load Patient Profile
    db.patients.get(pid).then((p) => {
      if (p) {
        setPatient(p);
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          emergencyContact: p.emergencyContact || '',
          bloodGroup: p.bloodGroup || '',
          village: p.village || '',
        });
      }
    });

    // Load Consultation Notes for this profile
    db.medicalRecords
      .where({ patientId: pid, type: 'consultation' })
      .toArray()
      .then((records) => {
        setConsultations(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });

    // Load Vitals Logs for this profile
    db.medicalRecords
      .where({ patientId: pid, type: 'vitals' })
      .toArray()
      .then((records) => {
        setVitalsLogs(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });

    // Load Prescription History for this profile
    db.medicalRecords
      .where({ patientId: pid, type: 'prescription' })
      .toArray()
      .then((records) => {
        setPrescriptions(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });

    // Load active medications & recent vitals tests
    db.medicines
      .where('patientId')
      .equals(pid)
      .toArray()
      .then(setActiveMeds);

    db.healthTests
      .where('patientId')
      .equals(pid)
      .toArray()
      .then((tests) => {
        setRecentTests(tests.slice(-4));
      });
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : 1;

    await db.patients.update(pid, {
      name: formData.name,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      bloodGroup: formData.bloodGroup,
      village: formData.village,
    });
    setPatient((prev) => (prev ? { ...prev, ...formData } : null));
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center font-bold shadow-2xs">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0F172A]">Patient Health Profile</h1>
              <p className="text-xs text-[#64748B]">
                Medical records, consultation notes, vitals & prescriptions
              </p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* Primary Profile Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F766E] to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-xs">
              {patient?.name ? patient.name[0] : 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {patient?.name || currentUser?.name || 'Patient'}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 capitalize">
                  {currentUser?.role || 'Patient'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                ID: #{currentUser?.id || '1'} · {patient?.age || '32'} yrs · {patient?.gender || 'Female'} · Blood: {patient?.bloodGroup || 'O+'}
              </p>
            </div>
          </div>

          {/* Form & Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2">
                  {patient?.name || 'Not set'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#64748B]" />
                    <span>{patient?.phone || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Shield size={13} className="text-[#DC2626]" />
                    <span>{patient?.emergencyContact || '108'}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Blood Group</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Heart size={13} className="text-[#DC2626]" />
                    <span>{patient?.bloodGroup || 'O+'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Village / Region</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData((p) => ({ ...p, village: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#0F766E]" />
                    <span>{patient?.village || 'Kodaikanal'}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Save size={14} /> Save Profile
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl bg-[#F0FDFA] hover:bg-teal-100 text-[#0F766E] border border-[#0F766E]/30 text-xs font-bold transition-colors shadow-2xs"
              >
                ✏️ Edit Profile Details
              </button>
            )}
          </div>

          {savedSuccess && (
            <div className="mt-3 bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold">
              <CheckCircle size={14} className="text-[#16A34A]" />
              <span>Profile updated successfully in local storage.</span>
            </div>
          )}
        </div>

        {/* Clinical Baseline (Conditions & Allergies) */}
        {patient && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-extrabold text-[#DC2626] uppercase tracking-wide mb-1.5">
                Known Conditions
              </div>
              {patient.conditions && patient.conditions.length > 0 ? (
                <ul className="space-y-1">
                  {patient.conditions.map((c, i) => (
                    <li key={i} className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                      <span className="text-[#DC2626]">•</span> {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#94A3B8]">None recorded</p>
              )}
            </div>

            <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wide mb-1.5">
                Allergies
              </div>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="space-y-1">
                  {patient.allergies.map((a, i) => (
                    <li key={i} className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                      <span className="text-[#D97706]">•</span> {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#94A3B8]">None recorded</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EXPLICIT CLINICAL SECTIONS FOR USER PROFILE: */}
        {/* 1. CONSULTATION NOTES */}
        {/* 2. VITALS LOGS */}
        {/* 3. PRESCRIPTION HISTORY */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[#2563EB]" />
                <span>Clinical Profile Records</span>
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Explicit medical records integrated directly into user profile
              </p>
            </div>
            <Link
              to="/records"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>Manage in Records</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* 3 Dedicated Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('consultation')}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                activeTab === 'consultation'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🩺 Consultations ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                activeTab === 'vitals'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Vitals Logs ({vitalsLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('prescription')}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                activeTab === 'prescription'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💊 Prescriptions ({prescriptions.length})
            </button>
          </div>

          {/* 1. CONSULTATION NOTES HISTORY VIEW */}
          {activeTab === 'consultation' && (
            <div className="space-y-3 animate-in fade-in">
              {consultations.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No consultation notes recorded yet for this profile.
                </div>
              ) : (
                consultations.map((c) => {
                  const data = (c.data || {}) as any;
                  return (
                    <div
                      key={c.id}
                      className="bg-purple-50/40 border border-purple-200/80 rounded-xl p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                        <span className="font-extrabold text-purple-900">
                          {data.doctorName || 'Doctor Consultation'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{c.date}</span>
                      </div>
                      <div className="text-slate-800 font-semibold">
                        Diagnosis: {data.diagnosis || data.reportName || 'Routine Follow-Up'}
                      </div>
                      {data.assessment && (
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          <strong>Assessment:</strong> {data.assessment}
                        </p>
                      )}
                      {data.clinicalAdvice && (
                        <p className="text-purple-800 text-[11px] leading-relaxed bg-white/70 p-2 rounded-lg border border-purple-100">
                          <strong>Doctor Advice:</strong> {data.clinicalAdvice}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. VITALS LOGS VIEW */}
          {activeTab === 'vitals' && (
            <div className="space-y-3 animate-in fade-in">
              {vitalsLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No vitals logs recorded yet for this profile.
                </div>
              ) : (
                vitalsLogs.map((v) => {
                  const data = (v.data || {}) as any;
                  return (
                    <div
                      key={v.id}
                      className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                        <span className="font-extrabold text-emerald-900">
                          {data.reportName || 'Vitals Examination'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{v.date}</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-[11px]">
                        {data.bloodPressure && (
                          <div className="bg-white rounded-lg p-1.5 border border-emerald-100">
                            <span className="text-[9px] text-slate-500 block">BP</span>
                            <span className="font-bold text-slate-800">{data.bloodPressure}</span>
                          </div>
                        )}
                        {(data.fastingBloodSugar || data.postPrandialSugar || data.sugar) && (
                          <div className="bg-white rounded-lg p-1.5 border border-emerald-100">
                            <span className="text-[9px] text-slate-500 block">Glucose</span>
                            <span className="font-bold text-slate-800">
                              {data.fastingBloodSugar || data.postPrandialSugar || data.sugar}
                            </span>
                          </div>
                        )}
                        {data.pulseRate && (
                          <div className="bg-white rounded-lg p-1.5 border border-emerald-100">
                            <span className="text-[9px] text-slate-500 block">Pulse</span>
                            <span className="font-bold text-slate-800">{data.pulseRate}</span>
                          </div>
                        )}
                        {data.temperature && (
                          <div className="bg-white rounded-lg p-1.5 border border-emerald-100">
                            <span className="text-[9px] text-slate-500 block">Temp</span>
                            <span className="font-bold text-slate-800">{data.temperature}</span>
                          </div>
                        )}
                        {data.spo2 && (
                          <div className="bg-white rounded-lg p-1.5 border border-emerald-100">
                            <span className="text-[9px] text-slate-500 block">SpO2</span>
                            <span className="font-bold text-slate-800">{data.spo2}</span>
                          </div>
                        )}
                      </div>

                      {v.notes && (
                        <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-emerald-100">
                          {v.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. PRESCRIPTION HISTORY VIEW */}
          {activeTab === 'prescription' && (
            <div className="space-y-3 animate-in fade-in">
              {prescriptions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No prescription history records found for this profile.
                </div>
              ) : (
                prescriptions.map((p) => {
                  const data = (p.data || {}) as any;
                  return (
                    <div
                      key={p.id}
                      className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                        <span className="font-extrabold text-blue-900">
                          {data.doctorName || 'Prescribing Doctor'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{p.date}</span>
                      </div>
                      <div className="text-slate-800 font-semibold">
                        Diagnosis: {data.diagnosis || 'Medical Prescription'}
                      </div>

                      {/* Medications list */}
                      {data.medicationsList && Array.isArray(data.medicationsList) && (
                        <div className="space-y-1">
                          {data.medicationsList.map((m: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-white/80 p-2 rounded-lg border border-blue-100 flex items-center justify-between text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <span className="text-slate-500 ml-1">({m.dose})</span>
                                <span className="text-slate-600 block text-[10px]">
                                  {m.timing} · {m.instructions}
                                </span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                {m.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
