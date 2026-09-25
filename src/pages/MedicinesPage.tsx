import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filter, setFilter] = useState<FilterType>('active');
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [selectedMedIdForLabel, setSelectedMedIdForLabel] = useState<number | undefined>(undefined);
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    frequency: 'Once daily',
    times: '8:00 AM',
    instructions: '',
    doctor: '',
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

  // 1. Load medicines and trigger Automated Push Notification Scheduling WITHOUT requiring manual input
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

  const handleAdd = async () => {
    if (!newMed.name || !currentUser?.id) return;
    const patId = currentUser.role === 'patient' ? currentUser.id : 1;

    await db.medicines.add({
      patientId: patId,
      name: newMed.name,
      dose: newMed.dose,
      frequency: newMed.frequency,
      times: newMed.times.split(',').map((t) => t.trim()),
      instructions: newMed.instructions,
      doctor: newMed.doctor,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      missedCount: 0,
    });

    // Automatically re-sync notifications for the new medication without manual user steps
    await localNotificationScheduler.autoScheduleAllForPatient(patId);
    const updatedReminders = localNotificationScheduler.getReminders(patId);
    setScheduledReminders(updatedReminders);

    setNewMed({
      name: '',
      dose: '',
      frequency: 'Once daily',
      times: '8:00 AM',
      instructions: '',
      doctor: '',
    });
    setShowAdd(false);
    setRefresh((r) => r + 1);
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
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#16A34A] flex items-center gap-2">
              <span>💊</span>
              <span>{t('medicines.title')}</span>
            </h1>
            <p className="text-xs text-[#64748B]">Automated Push Notifications & Low-Literacy Dispensing</p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => {
                setSelectedMedIdForLabel(undefined);
                setIsLabelsModalOpen(true);
              }}
              className="bg-teal-700 hover:bg-teal-600 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              title="Generate printable, simplified image-based labels for low-literacy users"
            >
              <Printer size={13} />
              <span>Print Visual Labels</span>
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-[#16A34A] text-white text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-green-700 shadow-2xs transition-colors"
            >
              + {t('medicines.addMedicine')}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTOMATED SCHEDULING SYSTEM: PUSH NOTIFICATIONS FOR PILLS, VACCINES, THERAPY */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border border-indigo-400/40 rounded-2xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Automated Push Notification System</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                    Zero Manual Input
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">
                  Push notifications automatically configured for all prescribed pills, upcoming vaccinations, and clinical therapy sessions directly from your health records.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRemindersTray(!showRemindersTray)}
              className="shrink-0 bg-white/10 hover:bg-white/20 text-white font-bold text-xs p-2 rounded-xl border border-white/20 flex items-center gap-1 transition-colors"
              title="Expand automated schedule list"
            >
              {showRemindersTray ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Quick Stats Badges for Auto-Scheduled Categories */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/10 border border-white/10 rounded-xl p-2 text-center">
              <span className="text-[10px] text-indigo-200 block font-bold">💊 Daily Pills</span>
              <span className="text-sm font-black text-white">{autoScheduleStats.pillsCount || 3} Active</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-2 text-center">
              <span className="text-[10px] text-indigo-200 block font-bold">💉 Vaccinations</span>
              <span className="text-sm font-black text-white">{autoScheduleStats.vaccinesCount || 1} Queued</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl p-2 text-center">
              <span className="text-[10px] text-indigo-200 block font-bold">🧘 Therapy Sessions</span>
              <span className="text-sm font-black text-white">{autoScheduleStats.therapyCount || 2} Scheduled</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px]">
              <CheckCircle2 size={13} />
              <span>Native Push + Multilingual Voice Alarms active</span>
            </div>
            <button
              type="button"
              onClick={() => handleTestNotification()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Volume2 size={13} />
              <span>Test Push Alarm Now</span>
            </button>
          </div>

          {/* Feedback message */}
          {notificationFeedback && (
            <div className="bg-emerald-950/80 border border-emerald-400 text-emerald-200 p-2.5 rounded-xl text-xs font-semibold animate-in fade-in">
              {notificationFeedback}
            </div>
          )}

          {/* Expandable Automated Schedule Tray */}
          {showRemindersTray && (
            <div className="pt-2 border-t border-indigo-500/30 space-y-2">
              <div className="text-[11px] font-black uppercase text-indigo-200 tracking-wider">
                Current Auto-Scheduled Notification Queues ({scheduledReminders.length})
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {scheduledReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-white/10 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {rem.type === 'medication' ? '💊' : rem.type === 'vaccination' ? '💉' : '🧘'}
                        </span>
                        <span className="font-bold text-white truncate">{rem.title}</span>
                        <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.2 rounded-md font-mono shrink-0">
                          {rem.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {rem.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestNotification(rem)}
                        className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                        title="Trigger this notification immediately"
                      >
                        <Volume2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(rem.id, rem.enabled)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                          rem.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}
                      >
                        {rem.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Low-Literacy Visual Prescription Banner */}
        <div className="bg-gradient-to-r from-teal-900/90 to-emerald-950/90 border border-teal-500/40 rounded-2xl p-3.5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 text-base">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-teal-300 uppercase tracking-wide">
                  Low-Literacy Accessible Labels
                </span>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 px-2 py-0.2 rounded-full font-bold">
                  Print Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Generate simplified stickers & daily wall posters with sun/moon symbols, meal icons, and pill counts for patients who cannot read prescription text.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedMedIdForLabel(undefined);
              setIsLabelsModalOpen(true);
            }}
            className="shrink-0 bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Tag size={13} />
            <span>Generate Labels</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-[#E2E8F0]">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t(`medicines.${f}`, f.charAt(0).toUpperCase() + f.slice(1))}
            </button>
          ))}
        </div>

        {/* Add Medicine Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="font-extrabold text-[#0F172A] text-base mb-4">{t('medicines.addMedicine')}</h2>
              <div className="space-y-3">
                {[
                  { key: 'name', label: t('medicines.name'), type: 'text', placeholder: 'e.g. Paracetamol 500mg' },
                  { key: 'dose', label: t('medicines.dose'), type: 'text', placeholder: 'e.g. 500mg (1 tablet)' },
                  { key: 'frequency', label: t('medicines.frequency'), type: 'text', placeholder: 'e.g. Twice daily' },
                  { key: 'times', label: t('medicines.times'), type: 'text', placeholder: 'e.g. 8:00 AM, 8:00 PM' },
                  { key: 'doctor', label: t('medicines.doctor'), type: 'text', placeholder: 'Doctor name' },
                  { key: 'instructions', label: t('medicines.instructions'), type: 'text', placeholder: 'After meals with warm water' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-[#475569] mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={(newMed as any)[field.key]}
                      onChange={(e) => setNewMed((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#16A34A] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-green-700 shadow-2xs"
                >
                  {t('common.save')} & Auto-Schedule Push
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">💊</div>
            <p>{t('medicines.noMedicines')}</p>
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
