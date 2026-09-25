import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Appointment, Doctor, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  Calendar, Clock, User, Stethoscope, CheckCircle2,
  XCircle, AlertCircle, Plus, ChevronRight, Phone,
  MapPin, Printer, ArrowLeft, RefreshCw
} from 'lucide-react';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [familyMembers, setFamilyMembers] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(currentUser?.id || 1);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('In-person at PHC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Reschedule Modal State
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('10:00 AM');

  // Selected Doctor Profile Modal
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  // Confirmation Slip Modal
  const [confirmedAppt, setConfirmedAppt] = useState<{ appt: Appointment; doctor?: Doctor } | null>(null);

  const loadData = async () => {
    // Load Doctors
    const docs = await db.doctors.toArray();
    setDoctors(docs);
    if (docs.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(docs[0].id || 1);
    }

    // Load Appointments for current user
    if (currentUser?.id) {
      if (currentUser.role === 'doctor') {
        const docAppts = await db.appointments.where({ doctorId: currentUser.id }).toArray();
        setAppointments(docAppts);
      } else {
        const patAppts = await db.appointments.where({ patientId: currentUser.id }).toArray();
        setAppointments(patAppts);
      }
    } else {
      const allAppts = await db.appointments.toArray();
      setAppointments(allAppts);
    }

    // Load family members if applicable
    if (currentUser?.familyId) {
      const famPatients = await db.patients.where({ familyId: currentUser.familyId }).toArray();
      setFamilyMembers(famPatients);
    } else {
      const pat = await db.patients.get(currentUser?.id || 1);
      if (pat) setFamilyMembers([pat]);
    }
  };

  useEffect(() => {
    loadData();
    // Default appointment date to tomorrow
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setAppointmentDate(tomorrow);
    setRescheduleDate(tomorrow);
  }, [currentUser]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !appointmentDate || !appointmentReason.trim()) {
      setStatusMessage('Please select a doctor, date, and enter reason for appointment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const doc = doctors.find((d) => d.id === selectedDoctorId);
      const patId = selectedPatientId || currentUser?.id || 1;

      const newAppt: Appointment = {
        patientId: patId,
        doctorId: selectedDoctorId,
        date: `${appointmentDate} ${appointmentTime}`,
        reason: `${appointmentReason.trim()} (${consultationType})`,
        status: 'scheduled',
        notes: `Booked via Medora Portal · ${consultationType}`,
      };

      const newId = await db.appointments.add(newAppt);
      const createdAppt = { ...newAppt, id: newId };

      // Add Notification
      await db.notifications.add({
        userId: patId,
        userRole: 'patient',
        message: `Appointment confirmed with ${doc?.name || 'Doctor'} on ${appointmentDate} at ${appointmentTime}.`,
        messageTa: `${appointmentDate} அன்று ${doc?.name || 'மருத்துவருடன்'} அப்பாயின்மென்ட் உறுதிசெய்யப்பட்டது.`,
        messageHi: `${appointmentDate} को ${doc?.name || 'डॉक्टर'} के साथ अपॉइंटमेंट की पुष्टि की गई।`,
        type: 'appointment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      setShowBookModal(false);
      setAppointmentReason('');
      setConfirmedAppt({ appt: createdAppt, doctor: doc });
      setStatusMessage('Appointment successfully booked and recorded in local database!');
      await loadData();
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (apptId: number) => {
    await db.appointments.update(apptId, { status: 'cancelled' });
    setStatusMessage('Appointment cancelled.');
    await loadData();
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt?.id || !rescheduleDate) return;

    await db.appointments.update(reschedulingAppt.id, {
      date: `${rescheduleDate} ${rescheduleTime}`,
      status: 'scheduled',
      notes: `Rescheduled to ${rescheduleDate} ${rescheduleTime}`,
    });

    setReschedulingAppt(null);
    setStatusMessage('Appointment successfully rescheduled!');
    await loadData();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((appt) => {
    if (activeTab === 'upcoming') {
      return appt.status === 'scheduled';
    }
    if (activeTab === 'past') {
      return appt.status === 'completed' || appt.status === 'cancelled';
    }
    return true;
  });

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">
              📅
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                {t('appointments.title', 'Clinical Appointments')}
              </h1>
              <p className="text-xs text-[#64748B]">
                {t('appointments.subtitle', 'Book, manage, and view rural doctor consultations')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>{t('appointments.bookNew', 'Book Appointment')}</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'upcoming' as const, label: `${t('appointments.upcoming', 'Upcoming')} (${appointments.filter((a) => a.status === 'scheduled').length})` },
            { id: 'past' as const, label: `${t('appointments.past', 'Past / Completed')} (${appointments.filter((a) => a.status !== 'scheduled').length})` },
            { id: 'all' as const, label: `${t('appointments.all', 'All Records')} (${appointments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 text-center space-y-3">
            <div className="text-4xl">🗓️</div>
            <h3 className="font-extrabold text-sm text-slate-800">
              {activeTab === 'upcoming'
                ? t('appointments.noUpcoming', 'No upcoming appointments scheduled')
                : t('appointments.noPast', 'No past appointments found')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Schedule a consultation with one of our 10 dedicated rural healthcare specialists. Works 100% offline.
            </p>
            <button
              onClick={() => setShowBookModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#0F766E] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span>{t('appointments.bookNow', 'Book an Appointment Now')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => {
              const doc = doctors.find((d) => d.id === appt.doctorId);
              const isScheduled = appt.status === 'scheduled';
              const isCancelled = appt.status === 'cancelled';

              return (
                <div
                  key={appt.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-teal-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] font-extrabold flex items-center justify-center border border-teal-200 flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
                          <span>{doc?.name || `Doctor #${appt.doctorId}`}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isScheduled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCancelled
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#0F766E] font-medium">
                          {doc?.specialty || 'General Practitioner'} · {doc?.location || 'Kodaikanal PHC'}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-extrabold text-xs text-slate-800 flex items-center sm:justify-end gap-1">
                        <Clock size={13} className="text-[#0F766E]" />
                        <span>{appt.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Appt #{appt.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Reason / Complaint: </span>
                    <span>{appt.reason}</span>
                    {appt.notes && (
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        Note: {appt.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {doc && (
                        <button
                          onClick={() => setViewingDoctor(doc)}
                          className="text-xs text-[#0F766E] font-bold hover:underline py-1 flex items-center gap-1"
                        >
                          <User size={13} />
                          <span>View Doctor Profile</span>
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmedAppt({ appt, doctor: doc })}
                        className="text-xs text-slate-600 font-bold hover:underline py-1 flex items-center gap-1"
                      >
                        <Printer size={13} />
                        <span>Print Slip</span>
                      </button>
                    </div>

                    {isScheduled && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReschedulingAppt(appt);
                            setRescheduleDate(appt.date.split(' ')[0] || todayStr);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => appt.id && handleCancelAppointment(appt.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOOK APPOINTMENT MODAL */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <h2 className="font-black text-base text-slate-900">
                    Book Doctor Appointment
                  </h2>
                </div>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs">
                {/* 1. Patient Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Patient / Family Member:
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-500"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.age} yrs · {m.gender})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Doctor Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Doctor (10 Specialists Available):
                  </label>
                  <select
                    value={selectedDoctorId || ''}
                    onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-500"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialty} ({d.availability})
                      </option>
                    ))}
                  </select>

                  {/* Doctor Info Card Preview */}
                  {selectedDoctorId && (
                    <div className="mt-2 p-3 bg-teal-50/60 border border-teal-200/70 rounded-xl space-y-1">
                      {(() => {
                        const doc = doctors.find((d) => d.id === selectedDoctorId);
                        if (!doc) return null;
                        return (
                          <>
                            <div className="font-bold text-[#0F766E]">{doc.name}</div>
                            <div className="text-[11px] text-slate-600">
                              🎓 {doc.qualifications} · ⏱️ {doc.experience || 'Experienced'}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              📍 {doc.location || 'Kodaikanal PHC'}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              🗣️ Languages: {doc.languages?.join(', ') || 'English, Tamil'}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 3. Consultation Mode */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Consultation Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['In-person at PHC', 'Teleconsultation / Voice'].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setConsultationType(mode)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                          consultationType === mode
                            ? 'bg-[#0F766E] text-white border-teal-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Date & Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Appointment Date:
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Time Slot:
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* 5. Reason for Visit */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Reason for Consultation / Symptoms:
                  </label>
                  <textarea
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    rows={3}
                    placeholder="Describe main symptoms, fever, checkup requirement..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 resize-none focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#0F766E] hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        {reschedulingAppt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Reschedule Appointment #{reschedulingAppt.id}
                </h3>
                <button
                  onClick={() => setReschedulingAppt(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select New Date:
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select New Time Slot:
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReschedulingAppt(null)}
                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0F766E] hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold shadow-md"
                  >
                    Update Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW DOCTOR PROFILE MODAL */}
        {viewingDoctor && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] font-black flex items-center justify-center border border-teal-200">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{viewingDoctor.name}</h3>
                    <p className="text-xs text-[#0F766E] font-bold">{viewingDoctor.specialty}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoctor(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div><strong>Qualifications:</strong> {viewingDoctor.qualifications}</div>
                  <div><strong>Experience:</strong> {viewingDoctor.experience || '10+ years in rural health'}</div>
                  <div><strong>Facility:</strong> {viewingDoctor.location || 'Kodaikanal Government Hospital'}</div>
                  <div><strong>Availability:</strong> {viewingDoctor.availability}</div>
                  <div><strong>Mode:</strong> {viewingDoctor.consultationType || 'Both In-Person & Teleconsultation'}</div>
                  <div><strong>Languages:</strong> {viewingDoctor.languages?.join(', ') || 'English, Tamil'}</div>
                  <div><strong>Phone:</strong> {viewingDoctor.phone}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingDoctor(null)}
                  className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION SLIP MODAL */}
        {confirmedAppt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="font-black text-base text-slate-900">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded in local Medora database. Show this slip at the clinic.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                  <span>Appt Token:</span>
                  <span className="text-[#0F766E]">MED-APT-{confirmedAppt.appt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-bold text-slate-800">{confirmedAppt.doctor?.name || 'Doctor'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialty:</span>
                  <span>{confirmedAppt.doctor?.specialty || 'General Practitioner'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-bold text-slate-800">{confirmedAppt.appt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility:</span>
                  <span>{confirmedAppt.doctor?.location || 'Kodaikanal PHC'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reason:</span>
                  <span className="truncate max-w-[180px]">{confirmedAppt.appt.reason}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setConfirmedAppt(null)}
                  className="flex-1 bg-[#0F766E] hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
