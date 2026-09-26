import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine } from '../db/db';
import Layout from '../components/Layout';
import MedicineCard from '../components/MedicineCard';
import DemoDataBadge from '../components/DemoDataBadge';
import PrintableMedicineLabelsModal from '../components/PrintableMedicineLabelsModal';
import {
  localNotificationScheduler,
  ScheduledReminder,
  AutoScheduleResult,
} from '../services/notifications/localNotificationScheduler';
import {
  Printer,
  Tag,
  Bell,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  Plus,
  Calendar,
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filter, setFilter] = useState<FilterType>('active');
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [selectedMedIdForLabel, setSelectedMedIdForLabel] = useState<number | undefined>(undefined);

  // Form State adhering to Requirement 6:
  // Name, Dosage, Frequency, Timing (morning/afternoon/night, before/after food), Start/End date, Doctor, Instructions, Reminder enabled
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '1 tablet',
    frequency: 'Twice daily',
    morning: true,
    afternoon: false,
    night: true,
    mealTiming: 'after_food' as 'before_food' | 'after_food',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    doctor: 'Dr. Suresh Balakrishnan',
    instructions: 'Take with warm water after meals',
    reminderEnabled: true,
  });

  // Automated Notification Scheduling State
  const [autoScheduleStats, setAutoScheduleStats] = useState<AutoScheduleResult>({
    pillsCount: 0,
    vaccinesCount: 0,
    therapyCount: 0,
    totalScheduled: 0,
    newlyAdded: 0,
  });
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [showRemindersTray, setShowRemindersTray] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  // Check ?add=true param
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAdd(true);
    }
  }, [searchParams]);

  // Load medicines and trigger Automated Push Notification Scheduling
  useEffect(() => {
    if (!currentUser?.id) return;
    const patId = currentUser.role === 'patient' ? currentUser.id : 1;

    const q =
      filter === 'all'
        ? db.medicines.where('patientId').equals(patId)
        : db.medicines.where({ patientId: patId, status: filter });

    q.toArray()
      .then((meds) => {
        setMedicines(meds);
      })
      .catch(() => {
        db.medicines.toArray().then(setMedicines);
      });

    // Run Automated Scheduling Engine for Pills, Vaccinations, and Therapy Sessions
    localNotificationScheduler.autoScheduleAllForPatient(patId).then((result) => {
      setAutoScheduleStats(result);
      const reminders = localNotificationScheduler.getReminders(patId);
      setScheduledReminders(reminders);
    });
  }, [currentUser, filter, refresh]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name.trim() || !currentUser?.id) return;
    const patId = currentUser.role === 'patient' ? currentUser.id : 1;

    // Build timing list
    const timingTimes: string[] = [];
    if (newMed.morning) timingTimes.push('08:00 AM');
    if (newMed.afternoon) timingTimes.push('01:00 PM');
    if (newMed.night) timingTimes.push('08:00 PM');
    if (timingTimes.length === 0) timingTimes.push('08:00 AM');

    const timingNote = newMed.mealTiming === 'before_food' ? 'Before food' : 'After food';
    const finalInstructions = `${timingNote}. ${newMed.instructions}`.trim();

    await db.medicines.add({
      patientId: patId,
      name: newMed.name.trim(),
      dose: newMed.dose.trim(),
      frequency: newMed.frequency,
      times: timingTimes,
      instructions: finalInstructions,
      doctor: newMed.doctor.trim(),
      startDate: newMed.startDate,
      endDate: newMed.endDate,
      status: 'active',
      missedCount: 0,
    });

    // Automatically re-sync notifications for the new medication
    if (newMed.reminderEnabled) {
      await localNotificationScheduler.autoScheduleAllForPatient(patId);
      const updatedReminders = localNotificationScheduler.getReminders(patId);
      setScheduledReminders(updatedReminders);
    }

    setNewMed({
      name: '',
      dose: '1 tablet',
      frequency: 'Twice daily',
      morning: true,
      afternoon: false,
      night: true,
      mealTiming: 'after_food',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      doctor: 'Dr. Suresh Balakrishnan',
      instructions: 'Take with warm water after meals',
      reminderEnabled: true,
    });
    setShowAdd(false);
    setRefresh((r) => r + 1);

    if (searchParams.get('add') === 'true') {
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  };

  const handleTestNotification = async (reminder?: ScheduledReminder) => {
    const target = reminder || scheduledReminders[0];
    if (!target) return;

    await localNotificationScheduler.fireReminder(target);
    setNotificationFeedback(
      `✓ Test alert dispatched: "${target.title}". Check your device notification & speaker audio.`
    );
    setTimeout(() => setNotificationFeedback(null), 4000);
  };

  const handleToggleReminder = (id: string, currentState: boolean) => {
    localNotificationScheduler.toggleReminder(id, !currentState);
    const patId = currentUser?.role === 'patient' ? currentUser.id : 1;
    setScheduledReminders(localNotificationScheduler.getReminders(patId));
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#16A34A]">{t('medicines.title', 'Prescribed Medicines')}</h1>
            <p className="text-xs text-[#64748B]">Active prescriptions &amp; automatic dose reminders</p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => {
                setSelectedMedIdForLabel(undefined);
                setIsLabelsModalOpen(true);
              }}
              className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-xs px-3 py-2 rounded-xl font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={13} className="text-[#16A34A]" />
              <span>{t('medicines.printableLabels', 'Labels')}</span>
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-[#16A34A] hover:bg-green-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} />
              <span>+ Add Medicine</span>
            </button>
          </div>
        </div>

        {/* Automated Push Notifications Status Card */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-4 shadow-sm border border-emerald-700/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <div>
                <div className="font-black text-xs flex items-center gap-1.5">
                  <span>Automated Dose Reminders Engine</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.2 rounded-full font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100">
                  {autoScheduleStats.totalScheduled} reminder schedules running locally without internet.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRemindersTray(!showRemindersTray)}
              className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl cursor-pointer"
            >
              <span>{showRemindersTray ? 'Hide Schedules' : 'View Schedules'}</span>
              {showRemindersTray ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {notificationFeedback && (
            <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-semibold">
              {notificationFeedback}
            </div>
          )}

          {/* Expandable Schedules Tray */}
          {showRemindersTray && (
            <div className="pt-2 border-t border-emerald-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-emerald-200">
                <span>Active schedules ({scheduledReminders.length}):</span>
                <button
                  onClick={() => handleTestNotification()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 size={12} />
                  <span>Test Audio Chime</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {scheduledReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-black/30 border border-emerald-700/40 p-2 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{rem.title}</p>
                      <p className="text-[10px] text-emerald-200/80">
                        {rem.time} · {rem.recurrence} {rem.instructions ? `· ${rem.instructions}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleReminder(rem.id, rem.enabled)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rem.enabled ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {rem.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 border border-[#E2E8F0] rounded-xl p-1">
          {(['active', 'all', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t(`medicines.${f}`, f.charAt(0).toUpperCase() + f.slice(1))}
            </button>
          ))}
        </div>

        {/* Add Medicine Modal (Requirement 6) */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="font-black text-[#0F172A] text-base flex items-center gap-2">
                  <span>💊</span>
                  <span>Add Prescribed Medicine</span>
                </h2>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3 text-xs">
                {/* Medicine Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicine Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg, Metformin, Amlodipine"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:border-[#16A34A] focus:outline-none"
                  />
                </div>

                {/* Dosage & Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dosage:</label>
                    <input
                      type="text"
                      value={newMed.dose}
                      onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                      placeholder="e.g. 1 tablet, 5ml, 500mg"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Frequency:</label>
                    <select
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:border-[#16A34A] focus:outline-none"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Thrice daily">Thrice daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed (SOS)">As needed (SOS)</option>
                    </select>
                  </div>
                </div>

                {/* Timing (Morning / Afternoon / Night, Before / After food) */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Dose Timing Schedule:</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={newMed.morning}
                        onChange={(e) => setNewMed({ ...newMed, morning: e.target.checked })}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span>Morning (08:00 AM)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={newMed.afternoon}
                        onChange={(e) => setNewMed({ ...newMed, afternoon: e.target.checked })}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span>Afternoon (01:00 PM)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={newMed.night}
                        onChange={(e) => setNewMed({ ...newMed, night: e.target.checked })}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span>Night (08:00 PM)</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-4">
                    <span className="font-bold text-slate-600 text-[11px]">Meal Relation:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="mealTiming"
                        checked={newMed.mealTiming === 'after_food'}
                        onChange={() => setNewMed({ ...newMed, mealTiming: 'after_food' })}
                      />
                      <span>After Food</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="mealTiming"
                        checked={newMed.mealTiming === 'before_food'}
                        onChange={() => setNewMed({ ...newMed, mealTiming: 'before_food' })}
                      />
                      <span>Before Food</span>
                    </label>
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date:</label>
                    <input
                      type="date"
                      value={newMed.startDate}
                      onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date:</label>
                    <input
                      type="date"
                      value={newMed.endDate}
                      onChange={(e) => setNewMed({ ...newMed, endDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* Doctor & Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prescribing Doctor:</label>
                  <input
                    type="text"
                    value={newMed.doctor}
                    onChange={(e) => setNewMed({ ...newMed, doctor: e.target.value })}
                    placeholder="Doctor name"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructions:</label>
                  <input
                    type="text"
                    value={newMed.instructions}
                    onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                    placeholder="Take with warm water after meals"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                {/* Reminder Enabled */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newMed.reminderEnabled}
                      onChange={(e) => setNewMed({ ...newMed, reminderEnabled: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span>Enable Automatic Dose Reminder Alerts (Push &amp; Audio)</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#16A34A] hover:bg-green-700 text-white py-2.5 rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Save &amp; Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">💊</div>
            <p>{t('medicines.noMedicines', 'No medicines recorded')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((m) => (
              <MedicineCard
                key={m.id}
                medicine={m}
                onUpdate={() => setRefresh((r) => r + 1)}
                onOpenLabel={(med) => {
                  setSelectedMedIdForLabel(med.id);
                  setIsLabelsModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          {t('common.demoData')} · {t('common.disclaimer')}
        </p>

        {/* Printable Low-Literacy Medicine Labels Modal */}
        <PrintableMedicineLabelsModal
          isOpen={isLabelsModalOpen}
          onClose={() => setIsLabelsModalOpen(false)}
          medicines={medicines}
          initialSelectedMedicineId={selectedMedIdForLabel}
        />
      </div>
    </Layout>
  );
}
