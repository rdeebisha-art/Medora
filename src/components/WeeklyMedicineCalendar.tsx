import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Printer,
  Sparkles,
  Sun,
  Sunrise,
  Moon,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { db, Medicine, MedicineAdherence } from '../db/db';
import { localNotificationScheduler } from '../services/notifications/localNotificationScheduler';
import { medicationPushNotificationService } from '../services/medications/medicationPushNotificationService';

interface WeeklyMedicineCalendarProps {
  patientId: number;
  medicines: Medicine[];
  onRefresh?: () => void;
}

interface DaySlot {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue...
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
}

interface DoseItem {
  medicineId: number;
  medicineName: string;
  dose: string;
  slot: 'morning' | 'afternoon' | 'night';
  timeStr: string;
  mealTiming?: string;
  instructions?: string;
  isTaken: boolean;
  takenAt?: string;
  adherenceId?: number;
}

export const WeeklyMedicineCalendar: React.FC<WeeklyMedicineCalendarProps> = ({
  patientId,
  medicines,
  onRefresh,
}) => {
  // Current week offset: 0 = current week, -1 = last week, +1 = next week
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [adherenceLogs, setAdherenceLogs] = useState<MedicineAdherence[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Calculate the 7 days of the selected week (Monday to Sunday)
  const weekDays = useMemo<DaySlot[]>(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    // Adjust to Monday as start of week:
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const todayStr = now.toISOString().split('T')[0];

    const days: DaySlot[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      days.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }
    return days;
  }, [weekOffset]);

  // Load adherence records from Dexie for this patient
  const loadAdherence = async () => {
    try {
      const records = await db.medicineAdherence
        .where('patientId')
        .equals(patientId)
        .toArray();
      setAdherenceLogs(records);
    } catch {
      setAdherenceLogs([]);
    }
  };

  useEffect(() => {
    loadAdherence();
  }, [patientId, medicines]);

  // Format week range label (e.g. "22 Sep – 28 Sep 2026")
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = weekDays[6].date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} – ${end}`;
  }, [weekDays]);

  // Active medicines for scheduling
  const activeMeds = useMemo(() => {
    return medicines.filter((m) => m.status === 'active' || !m.status);
  }, [medicines]);

  // Compute scheduled doses for each day
  const getDosesForDay = (day: DaySlot): { morning: DoseItem[]; afternoon: DoseItem[]; night: DoseItem[] } => {
    const morning: DoseItem[] = [];
    const afternoon: DoseItem[] = [];
    const night: DoseItem[] = [];

    activeMeds.forEach((med) => {
      // Check date bounds if provided
      if (med.startDate && day.dateStr < med.startDate) return;
      if (med.endDate && day.dateStr > med.endDate) return;

      const hasMorning = med.morning || (med.times && med.times.some((t) => t.includes('AM') || parseInt(t) < 12)) || med.frequency.toLowerCase().includes('daily');
      const hasAfternoon = med.afternoon || (med.times && med.times.some((t) => t.includes('01:') || t.includes('02:') || t.includes('03:') || t.includes('04:')));
      const hasNight = med.night || (med.times && med.times.some((t) => t.includes('PM') && !t.includes('01:') && !t.includes('02:'))) || med.frequency.toLowerCase().includes('twice');

      // Meal timing note
      let mealTiming = 'After food';
      if (med.instructions && med.instructions.toLowerCase().includes('before food')) {
        mealTiming = 'Before food';
      } else if (med.instructions && med.instructions.toLowerCase().includes('with food')) {
        mealTiming = 'With food';
      }

      // Check adherence logs for this day & med
      const checkAdherence = (slotTime: string) => {
        const match = adherenceLogs.find(
          (l) =>
            l.patientId === patientId &&
            l.date === day.dateStr &&
            (l.medicineId === med.id || l.medicineName.toLowerCase() === med.name.toLowerCase()) &&
            (l.status === 'taken')
        );
        return {
          isTaken: !!match,
          takenAt: match?.actualTakenTime || match?.takenAt,
          adherenceId: match?.id,
        };
      };

      if (hasMorning) {
        const adh = checkAdherence('08:00 AM');
        morning.push({
          medicineId: med.id || 0,
          medicineName: med.name,
          dose: med.dose,
          slot: 'morning',
          timeStr: '08:00 AM',
          mealTiming,
          instructions: med.instructions,
          ...adh,
        });
      }

      if (hasAfternoon) {
        const adh = checkAdherence('01:30 PM');
        afternoon.push({
          medicineId: med.id || 0,
          medicineName: med.name,
          dose: med.dose,
          slot: 'afternoon',
          timeStr: '01:30 PM',
          mealTiming,
          instructions: med.instructions,
          ...adh,
        });
      }

      if (hasNight) {
        const adh = checkAdherence('08:00 PM');
        night.push({
          medicineId: med.id || 0,
          medicineName: med.name,
          dose: med.dose,
          slot: 'night',
          timeStr: '08:00 PM',
          mealTiming,
          instructions: med.instructions,
          ...adh,
        });
      }
    });

    return { morning, afternoon, night };
  };

  // Toggle dose taken state
  const handleToggleDoseTaken = async (dayStr: string, dose: DoseItem) => {
    try {
      if (dose.isTaken && dose.adherenceId) {
        // Untake
        await db.medicineAdherence.delete(dose.adherenceId);
        setFeedbackToast(`Marked ${dose.medicineName} as pending for ${dayStr}.`);
      } else {
        // Mark taken
        const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await db.medicineAdherence.add({
          patientId,
          medicineId: dose.medicineId,
          medicineName: dose.medicineName,
          date: dayStr,
          status: 'taken',
          dosagePrescribed: dose.dose,
          scheduledTime: dose.timeStr,
          actualTakenTime: nowTimeStr,
          takenAt: new Date().toISOString(),
          recordedBy: 'patient',
          notes: 'Marked in visual weekly calendar view',
        });

        // Trigger pleasant audio feedback chime
        medicationPushNotificationService.playMedicationAlertAudio('chime').catch(() => {});
        setFeedbackToast(`✅ ${dose.medicineName} (${dose.dose}) marked taken at ${nowTimeStr}!`);
      }
      await loadAdherence();
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch (e) {
      console.error('Failed to toggle dose:', e);
    }
  };

  // Compute Weekly Statistics
  const weeklyStats = useMemo(() => {
    let totalScheduled = 0;
    let totalTaken = 0;

    weekDays.forEach((day) => {
      const { morning, afternoon, night } = getDosesForDay(day);
      const allDoses = [...morning, ...afternoon, ...night];
      totalScheduled += allDoses.length;
      totalTaken += allDoses.filter((d) => d.isTaken).length;
    });

    const adherencePct = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;
    return { totalScheduled, totalTaken, adherencePct };
  }, [weekDays, activeMeds, adherenceLogs]);

  return (
    <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Navigation and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200 shrink-0">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Weekly Medication Schedule
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Calendar View
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Week of {weekRangeLabel} • {activeMeds.length} active prescriptions
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1 text-xs font-black rounded-xl transition-colors cursor-pointer ${
                weekOffset === 0
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Print weekly schedule for refrigerator or village health card"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print Schedule</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <span>{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Weekly Adherence Progress Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-300 flex flex-col items-center justify-center shrink-0 shadow-2xs">
            <span className="text-base font-black text-emerald-700 leading-tight">
              {weeklyStats.adherencePct}%
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold">Adherence</span>
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">
              Weekly Dose Adherence: {weeklyStats.totalTaken} of {weeklyStats.totalScheduled} Doses Taken
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Taking your doses on time helps stabilize blood pressure and glycemic markers.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Taken</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Scheduled</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending/Due</span>
          </span>
        </div>
      </div>

      {/* 7-Day Visual Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
        {weekDays.map((day) => {
          const { morning, afternoon, night } = getDosesForDay(day);
          const totalDayDoses = morning.length + afternoon.length + night.length;
          const takenDayDoses = [...morning, ...afternoon, ...night].filter((d) => d.isTaken).length;

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border transition-all flex flex-col min-w-[130px] ${
                day.isToday
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-400/40'
                  : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-2.5 border-b rounded-t-2xl flex items-center justify-between text-xs ${
                  day.isToday
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white text-slate-700 font-bold border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="uppercase text-[11px]">{day.dayName}</span>
                  <span className="text-sm font-black">{day.dayNumber}</span>
                </div>
                {day.isToday && (
                  <span className="text-[9px] bg-white text-emerald-800 uppercase px-1.5 py-0.2 rounded font-black tracking-wider">
                    Today
                  </span>
                )}
                {!day.isToday && totalDayDoses > 0 && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {takenDayDoses}/{totalDayDoses}
                  </span>
                )}
              </div>

              {/* Doses by Time of Day */}
              <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
                {totalDayDoses === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    No medicines
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Morning Section */}
                    {morning.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700">
                          <Sunrise size={11} />
                          <span>Morning (8 AM)</span>
                        </div>
                        {morning.map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleDoseTaken(day.dateStr, d)}
                            className={`w-full text-left p-1.5 rounded-xl border text-[11px] transition-all cursor-pointer flex flex-col gap-0.5 ${
                              d.isTaken
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                                : day.isPast
                                ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                            }`}
                            title={`Click to mark ${d.medicineName} as ${d.isTaken ? 'pending' : 'taken'}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black truncate max-w-[90px]">{d.medicineName}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                                  d.isTaken
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-400'
                                }`}
                              >
                                {d.isTaken ? '✓' : ''}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {d.dose} · {d.mealTiming}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Afternoon Section */}
                    {afternoon.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600">
                          <Sun size={11} />
                          <span>Noon (1:30 PM)</span>
                        </div>
                        {afternoon.map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleDoseTaken(day.dateStr, d)}
                            className={`w-full text-left p-1.5 rounded-xl border text-[11px] transition-all cursor-pointer flex flex-col gap-0.5 ${
                              d.isTaken
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                                : day.isPast
                                ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                            }`}
                            title={`Click to mark ${d.medicineName} as ${d.isTaken ? 'pending' : 'taken'}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black truncate max-w-[90px]">{d.medicineName}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                                  d.isTaken
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-400'
                                }`}
                              >
                                {d.isTaken ? '✓' : ''}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {d.dose} · {d.mealTiming}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Night Section */}
                    {night.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700">
                          <Moon size={11} />
                          <span>Night (8 PM)</span>
                        </div>
                        {night.map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleDoseTaken(day.dateStr, d)}
                            className={`w-full text-left p-1.5 rounded-xl border text-[11px] transition-all cursor-pointer flex flex-col gap-0.5 ${
                              d.isTaken
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                                : day.isPast
                                ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                            }`}
                            title={`Click to mark ${d.medicineName} as ${d.isTaken ? 'pending' : 'taken'}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black truncate max-w-[90px]">{d.medicineName}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                                  d.isTaken
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-400'
                                }`}
                              >
                                {d.isTaken ? '✓' : ''}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {d.dose} · {d.mealTiming}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Day completion pill */}
                {totalDayDoses > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Doses:</span>
                    <span className={takenDayDoses === totalDayDoses ? 'text-emerald-700 font-bold' : 'font-mono'}>
                      {takenDayDoses === totalDayDoses ? 'All taken ✓' : `${takenDayDoses}/${totalDayDoses}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyMedicineCalendar;
