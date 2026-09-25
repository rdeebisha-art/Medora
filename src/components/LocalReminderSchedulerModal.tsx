import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Pill,
  Syringe,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  X,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';
import {
  localNotificationScheduler,
  ScheduledReminder,
  ReminderType,
} from '../services/notifications/localNotificationScheduler';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';

interface LocalReminderSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ReminderType;
}

export const LocalReminderSchedulerModal: React.FC<LocalReminderSchedulerModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'medication',
}) => {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Form state
  const [reminderType, setReminderType] = useState<ReminderType>(defaultType);
  const [title, setTitle] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('1 tablet');
  const [instructions, setInstructions] = useState('After food with warm water');
  const [time, setTime] = useState('08:00 AM');
  const [vaccineName, setVaccineName] = useState('Pentavalent-1');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [childName, setChildName] = useState('Baby');

  const refreshReminders = () => {
    setReminders(localNotificationScheduler.getReminders(currentUser?.id));
  };

  useEffect(() => {
    if (isOpen) {
      refreshReminders();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await localNotificationScheduler.requestNotificationPermission();
    setPermissionGranted(granted);
  };

  const handleToggle = (id: string, currentState: boolean) => {
    localNotificationScheduler.toggleReminder(id, !currentState);
    refreshReminders();
  };

  const handleDelete = (id: string) => {
    localNotificationScheduler.deleteReminder(id);
    refreshReminders();
  };

  const handleTestNow = (reminder: ScheduledReminder) => {
    localNotificationScheduler.fireReminder(reminder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reminderType === 'medication') {
      const medTitle = medicineName.trim() || title.trim() || 'Daily Medicine';
      localNotificationScheduler.addReminder({
        patientId: currentUser?.id || 1,
        patientName: currentUser?.name || 'Patient',
        type: 'medication',
        title: `${medTitle} Reminder`,
        medicineName: medTitle,
        dose,
        instructions,
        time,
        recurrence: 'daily',
        enabled: true,
        language: (language as any) || 'en',
        details: `Take ${dose}. ${instructions}`,
      });
    } else {
      const vacTitle = vaccineName.trim() || 'Vaccination';
      localNotificationScheduler.addReminder({
        patientId: currentUser?.id || 1,
        patientName: childName.trim() || currentUser?.name || 'Child',
        type: 'vaccination',
        title: `${vacTitle} Due Date`,
        vaccineName: vacTitle,
        time,
        dueDate,
        recurrence: 'once',
        enabled: true,
        language: (language as any) || 'en',
        details: `Vaccination due on ${dueDate} at ${time} for ${childName}. Visit Village PHC.`,
      });
    }

    setIsAdding(false);
    setTitle('');
    setMedicineName('');
    refreshReminders();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Bell className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">Offline Reminder Scheduler</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  Local Alarm
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Daily medicine alarms & vaccination appointments stored locally on this phone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Permission banner if not yet allowed */}
          {!permissionGranted && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold block">Enable Native Screen Alerts</span>
                  Allow device notifications so reminders pop up even when the app is minimized.
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 whitespace-nowrap"
              >
                Enable Alerts
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Works 100% Offline without Internet</span>
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </button>
            )}
          </div>

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  New Scheduled Reminder
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderType('medication')}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    reminderType === 'medication'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Pill className="w-4 h-4" />
                  Daily Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setReminderType('vaccination')}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    reminderType === 'vaccination'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Syringe className="w-4 h-4" />
                  Vaccination Appointment
                </button>
              </div>

              {reminderType === 'medication' ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amlodipine 5mg, Paracetamol"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Dose
                      </label>
                      <input
                        type="text"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        placeholder="e.g. 1 tablet"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Daily Time
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="08:00 AM"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Take after breakfast with warm water"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Vaccine Name
                      </label>
                      <input
                        type="text"
                        required
                        value={vaccineName}
                        onChange={(e) => setVaccineName(e.target.value)}
                        placeholder="e.g. Pentavalent, BCG"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Child / Patient Name
                      </label>
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="e.g. Baby Aarav"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Appointment Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Reminder Time
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="09:30 AM"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-teal-600 bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-sm"
              >
                Save Local Reminder
              </button>
            </form>
          )}

          {/* List of active reminders */}
          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No local reminders scheduled yet.</p>
              </div>
            ) : (
              reminders.map((r) => {
                const isMed = r.type === 'medication';
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      r.enabled
                        ? isMed
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-blue-50/50 border-blue-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl mt-0.5 ${
                            isMed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isMed ? <Pill className="w-4 h-4" /> : <Syringe className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {r.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                              {r.time}
                            </span>
                            {r.dueDate && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                Due: {r.dueDate}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1">
                            {r.details || (r.instructions ? `${r.dose} · ${r.instructions}` : '')}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                            <span className="capitalize">Recurrence: {r.recurrence}</span>
                            <span>·</span>
                            <span>Patient: {r.patientName || 'Self'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Audio test button */}
                        <button
                          title="Test Voice Announcement"
                          onClick={() => handleTestNow(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-white transition-all"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Toggle switch */}
                        <button
                          onClick={() => handleToggle(r.id, r.enabled)}
                          className="p-1 rounded-lg transition-all"
                        >
                          {r.enabled ? (
                            <ToggleRight className="w-6 h-6 text-teal-700" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          title="Delete reminder"
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{reminders.filter((r) => r.enabled).length} active offline alarms</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalReminderSchedulerModal;
