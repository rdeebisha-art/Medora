import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, DoctorSummary, Medicine, Doctor, Appointment } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { TwoWayDoctorChatModal } from '../components/TwoWayDoctorChatModal';
import {
  Stethoscope, User, Calendar, Pill, FileText, AlertTriangle,
  CheckCircle2, Plus, ArrowLeft, Printer, Phone, Clock,
  Check, ChevronRight, Search, ShieldAlert, MessageSquare, PhoneCall
} from 'lucide-react';

export default function DoctorPortalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, login, language, startDirectCall } = useAppStore();
  const [showChatModal, setShowChatModal] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<DoctorSummary | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Prescription Form State
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('1 tablet');
  const [newMedFreq, setNewMedFreq] = useState('Twice daily');
  const [newMedInstructions, setNewMedInstructions] = useState('Take with water after meals');
  const [medSavedToast, setMedSavedToast] = useState(false);

  // Status feedback
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    db.doctors.toArray().then(setDoctors);
    db.patients.toArray().then(setPatients);
  }, []);

  const isDoctor = currentUser?.role === 'doctor';

  const selectPatient = async (p: Patient) => {
    setSelected(p);
    setSaved(false);
    setNotes('');
    setShowAddMed(false);

    const summ = await db.doctorSummaries.where({ patientId: p.id! }).last();
    setSummary(summ || null);
    if (summ?.doctorNotes) {
      setNotes(summ.doctorNotes);
    }

    const meds = await db.medicines.where({ patientId: p.id!, status: 'active' }).toArray();
    setMedicines(meds);

    const appts = await db.appointments.where({ patientId: p.id! }).toArray();
    setAppointments(appts);
  };

  const handleSwitchToDoctor = (doc: Doctor) => {
    login({
      id: doc.id || 1,
      name: doc.name,
      role: 'doctor',
      phone: doc.phone,
      village: doc.village,
      specialty: doc.specialty,
      ...doc
    });
    setActionMessage(`Switched view to ${doc.name} (${doc.specialty})`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const saveConsultation = async () => {
    if (!selected) return;
    const docId = currentUser?.id || 1;
    const docName = currentUser?.name || 'Dr. Arjun Mehta';

    if (summary?.id) {
      await db.doctorSummaries.update(summary.id, {
        doctorId: docId,
        doctorNotes: notes,
        nextStep: notes || summary.nextStep,
      });
    } else {
      const newSummId = await db.doctorSummaries.add({
        patientId: selected.id!,
        doctorId: docId,
        complaint: 'Outpatient clinical consultation',
        symptoms: selected.conditions || ['General checkup'],
        duration: 'Current presentation',
        history: selected.conditions?.join(', ') || 'No chronic history recorded',
        medicines: medicines.map(m => m.name).join(', ') || 'None',
        allergies: selected.allergies?.join(', ') || 'None documented',
        vitals: 'Vitals stable',
        observations: notes || 'Clinical assessment conducted offline in Medora.',
        warningSigns: ['Sudden high fever', 'Chest pain', 'Breathing difficulty'],
        nextStep: notes || 'Review in 2 weeks or if symptoms worsen.',
        doctorNotes: notes,
        createdAt: new Date().toISOString(),
        patientLanguage: selected.language || 'ta',
        doctorLanguage: 'en',
      });
      const updated = await db.doctorSummaries.get(newSummId);
      setSummary(updated || null);
    }

    // Also record in medical records
    await db.medicalRecords.add({
      patientId: selected.id!,
      type: 'consultation',
      doctorId: docId,
      date: new Date().toISOString().split('T')[0],
      data: {
        doctor: docName,
        notes: notes || 'Consultation completed.',
        complaint: summary?.complaint || 'Clinical review',
        prescribedMeds: medicines.map(m => m.name)
      }
    });

    setSaved(true);
    setActionMessage('Consultation notes & diagnosis saved to patient medical record.');
    setTimeout(() => {
      setSaved(false);
      setActionMessage(null);
    }, 4000);
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id || !newMedName.trim()) return;

    const docName = currentUser?.name || 'Dr. Arjun Mehta';
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const newMed: Medicine = {
      patientId: selected.id,
      name: newMedName.trim(),
      dose: newMedDose.trim(),
      frequency: newMedFreq,
      times: ['08:00', '20:00'],
      startDate: today,
      endDate: nextMonth,
      doctor: docName,
      instructions: newMedInstructions.trim(),
      status: 'active',
      missedCount: 0,
    };

    const medId = await db.medicines.add(newMed);
    setMedicines(prev => [...prev, { ...newMed, id: medId }]);

    // Add notification for patient
    await db.notifications.add({
      userId: selected.id,
      userRole: 'patient',
      message: `New medicine prescribed by ${docName}: ${newMed.name} (${newMed.dose}) - ${newMed.frequency}.`,
      messageTa: `${docName} புதிய மருந்து பரிந்துரைத்துள்ளார்: ${newMed.name} (${newMed.dose}).`,
      messageHi: `${docName} द्वारा नई दवा निर्धारित: ${newMed.name} (${newMed.dose})।`,
      type: 'medicine',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setShowAddMed(false);
    setNewMedName('');
    setMedSavedToast(true);
    setTimeout(() => setMedSavedToast(false), 3500);
  };

  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.village?.toLowerCase().includes(q) || p.phone?.includes(q);
  });

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Banner if logged in as Patient / Evaluator */}
        {!isDoctor && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-3xl border border-blue-400/40 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                👨‍⚕️ Clinician Portal View (Demo Switcher)
              </span>
              <span className="text-xs text-blue-200">
                Current: {currentUser?.name} ({currentUser?.role})
              </span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Explore the Doctor Consultation workflow. Switch below to any of the 10 rural health doctors to access patient clinical records, language bridge transcripts, and add prescriptions:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {doctors.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSwitchToDoctor(d)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  <span>👨‍⚕️</span>
                  <span>{d.name.replace('Dr. ', '')}</span>
                  <span className="text-[10px] text-blue-300">({d.specialty.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action message feedback */}
        {actionMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span>✓ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center text-2xl flex-shrink-0">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                  {t('doctor.portal', 'Doctor Consultation Portal')}
                </h1>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  {currentUser?.role === 'doctor' ? `Dr. ${currentUser.name}` : 'Doctor Console'}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Review patient records, diagnose symptoms, translate language, and prescribe medications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Link
              to="/appointments"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
            >
              📅 Appointments
            </Link>
          </div>
        </div>

        {/* MAIN BODY: Patient Directory OR Patient Consultation View */}
        {!selected ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-extrabold text-[#0F172A] text-sm">
                Registered Patients ({patients.length})
              </h2>
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search by name, village, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPatient(p)}
                  className="bg-white border border-[#E2E8F0] hover:border-blue-400 rounded-2xl p-4 text-left transition-all shadow-xs hover:shadow-md flex flex-col justify-between group min-h-[110px]"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center font-black text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] truncate group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {p.age} yrs · {p.gender} · {p.village}
                      </div>
                      {p.conditions && p.conditions.length > 0 && (
                        <div className="text-[11px] text-[#DC2626] font-semibold truncate mt-1">
                          ⚠️ {p.conditions.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {p.isPregnant && <span title="Pregnant" className="text-base">🤰</span>}
                      {p.isElderly && <span title="Elderly" className="text-base ml-1">👴</span>}
                      {p.isChild && <span title="Child" className="text-base ml-1">🧒</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full pt-3 border-t border-slate-100 mt-2 text-[11px]">
                    <span className="text-slate-500 font-mono">ID: #{p.id} · Lang: {p.language?.toUpperCase() || 'TA'}</span>
                    <span className="font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Open Consultation →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-[#0F766E] font-bold text-xs hover:underline py-1"
            >
              <ArrowLeft size={14} />
              <span>Back to Patient List</span>
            </button>

            {/* Patient Header Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-lg flex-shrink-0">
                    {selected.name[0]}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">{selected.name}</h2>
                    <p className="text-xs text-slate-500">
                      Patient ID #{selected.id} · {selected.age} yrs · {selected.gender} · Blood Group: {selected.bloodGroup || 'O+'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold">
                    📍 {selected.village}
                  </span>
                  <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-xl font-bold uppercase">
                    Language: {selected.language || 'ta'}
                  </span>
                </div>
              </div>

              {/* Patient Flags */}
              <div className="flex flex-wrap gap-2 text-xs">
                {selected.allergies && selected.allergies.length > 0 && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    🚫 Allergy: {selected.allergies.join(', ')}
                  </span>
                )}
                {selected.conditions && selected.conditions.length > 0 && (
                  <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    ⚠️ History: {selected.conditions.join(', ')}
                  </span>
                )}
                {selected.isPregnant && (
                  <span className="bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    🤰 Pregnant: {selected.pregnancyWeeks} weeks
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-mono text-[11px]">
                  📞 Emergency: {selected.emergencyContact || '108'}
                </span>
              </div>

              {/* Direct Doctor-Patient In-App Communication Action Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    startDirectCall({
                      name: selected.name,
                      phone: selected.phone || selected.emergencyContact || '9876543210',
                      category: 'PATIENT' as any,
                      targetUserId: `P00${selected.id || 1}`,
                      location: selected.village,
                      emergency: false,
                    });
                  }}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Start Live WebRTC Voice Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowChatModal(true)}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-800 rounded-xl font-bold text-xs border border-teal-200 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span>In-App Message Patient</span>
                </button>
              </div>
            </div>

            {/* In-App Two-Way Chat Modal for Doctor */}
            {showChatModal && selected && (
              <TwoWayDoctorChatModal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                patientId={`P00${selected.id || 1}`}
                patientName={selected.name}
                userRole="doctor"
                doctorId={currentUser ? `DOC-0${currentUser.id || 1}` : 'DOC-01'}
                doctorName={currentUser?.name || 'Dr. Arjun Mehta'}
                onStartCall={() => {
                  setShowChatModal(false);
                  startDirectCall({
                    name: selected.name,
                    phone: selected.phone || selected.emergencyContact || '9876543210',
                    category: 'PATIENT' as any,
                    targetUserId: `P00${selected.id || 1}`,
                    location: selected.village,
                    emergency: false,
                  });
                }}
              />
            )}

            {/* AI Triage / Language Bridge Consultation Summary */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={17} className="text-[#2563EB]" />
                  <h3 className="font-black text-sm text-[#0F172A]">
                    Triage & Language Bridge Case History
                  </h3>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Offline Rule Engine
                </span>
              </div>

              {summary ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Chief Complaint:</span>
                    <p className="text-slate-700">{summary.complaint}</p>
                  </div>

                  {summary.languageBridgeUsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl space-y-1">
                        <span className="font-bold text-amber-900 block">Original Patient Statements ({summary.patientLanguage || 'Tamil'}):</span>
                        <p className="text-amber-950 font-medium whitespace-pre-line">{summary.originalPatientStatements || summary.complaint}</p>
                      </div>
                      <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl space-y-1">
                        <span className="font-bold text-blue-900 block">Translated Doctor English:</span>
                        <p className="text-blue-950 font-medium whitespace-pre-line">{summary.translatedPatientStatements || summary.complaint}</p>
                      </div>
                    </div>
                  )}

                  {summary.warningSigns && summary.warningSigns.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-2xl">
                      <span className="font-extrabold text-red-700 flex items-center gap-1 mb-1">
                        <AlertTriangle size={14} /> Red Flag Warnings:
                      </span>
                      <p className="text-red-800 font-medium">
                        {Array.isArray(summary.warningSigns) ? summary.warningSigns.join(', ') : summary.warningSigns}
                      </p>
                    </div>
                  )}

                  {summary.observations && (
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Clinical Assessment / Suggested Steps:</span>
                      <p className="text-slate-700 whitespace-pre-line">{summary.observations}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No prior AI triage case found for this patient. You can enter diagnosis notes and prescriptions below.
                </div>
              )}
            </div>

            {/* Prescriptions & Medications */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill size={17} className="text-[#16A34A]" />
                  <h3 className="font-black text-sm text-[#0F172A]">
                    Active Medications & Prescriptions
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="flex items-center gap-1 text-xs bg-[#16A34A] hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  <Plus size={14} />
                  <span>{showAddMed ? 'Cancel' : 'Add Medicine'}</span>
                </button>
              </div>

              {medSavedToast && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold">
                  ✓ Medicine prescribed and added to patient schedule!
                </div>
              )}

              {/* Add Prescription Inline Form */}
              {showAddMed && (
                <form onSubmit={handleAddPrescription} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 text-xs">
                  <div className="font-bold text-slate-800">Prescribe New Medicine:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Medicine Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                        value={newMedName}
                        onChange={e => setNewMedName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Dose:</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 tablet, 5 mL"
                        value={newMedDose}
                        onChange={e => setNewMedDose(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Frequency:</label>
                      <select
                        value={newMedFreq}
                        onChange={e => setNewMedFreq(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Once daily">Once daily (morning)</option>
                        <option value="Twice daily">Twice daily (morning & night)</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="As needed (SOS)">As needed (SOS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Instructions:</label>
                      <input
                        type="text"
                        placeholder="e.g. Take after food with warm water"
                        value={newMedInstructions}
                        onChange={e => setNewMedInstructions(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMed(false)}
                      className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#16A34A] hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl font-bold shadow-xs"
                    >
                      Save & Add to Patient Schedule
                    </button>
                  </div>
                </form>
              )}

              {/* Medicines List */}
              <div className="space-y-2">
                {medicines.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active medicines recorded for this patient.</p>
                ) : (
                  medicines.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900">{m.name} ({m.dose})</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.instructions} · Prescribed by {m.doctor}</div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-200">
                        {m.frequency}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Doctor Clinical Notes & Save */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-[#2563EB]" />
                <h3 className="font-black text-sm text-[#0F172A]">
                  Doctor Clinical Notes, Diagnosis & Instructions
                </h3>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Enter formal clinical evaluation, physical exam findings, differential diagnosis, dietary advice, follow-up date..."
                className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 resize-none focus:outline-none focus:border-blue-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Link
                  to="/doctor-summary"
                  className="text-xs text-blue-600 font-bold hover:underline py-1 flex items-center gap-1"
                >
                  <FileText size={14} />
                  <span>View Printable Doctor Summary Slip</span>
                </Link>

                <button
                  onClick={saveConsultation}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                    saved ? 'bg-emerald-600 text-white' : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                  }`}
                >
                  {saved ? '✓ Consultation Saved' : 'Save Consultation Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
