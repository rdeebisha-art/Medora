/**
 * Medora Local Offline Notification Scheduler Service
 * 
 * Works 100% OFFLINE without any external push server, Firebase, or internet connectivity.
 * Allows patients and rural health workers to automatically set & receive:
 * - Recurring daily medication intake push notifications (Pills)
 * - Child and maternal vaccination schedule notifications
 * - Clinical therapy and rehabilitation sessions
 * 
 * Channels:
 * 1. Web Notifications API (native browser push notification)
 * 2. Dexie IndexedDB Notification log (db.notifications table)
 * 3. Text-to-Speech audio announcement via Medora voice service (multilingual)
 */

import { db } from '../../db/db';
import { voiceService } from '../voiceService';
import { LanguageCode } from '../../types';

export type ReminderType = 'medication' | 'vaccination' | 'appointment' | 'therapy' | 'general';
export type RecurrencePattern = 'daily' | 'weekly' | 'once';

export interface ScheduledReminder {
  id: string;
  patientId: number;
  patientName?: string;
  type: ReminderType;
  title: string;
  details: string;
  time: string; // "HH:MM" 24h or "08:00 AM"
  time24: string; // "08:00" normalized
  dueDate?: string; // "YYYY-MM-DD" for vaccination / appointment
  recurrence: RecurrencePattern;
  daysOfWeek?: number[]; // [0,1,2,3,4,5,6]
  enabled: boolean;
  language: LanguageCode;
  createdAt: string;
  lastTriggeredDate?: string; // "YYYY-MM-DD" to avoid multiple triggers on same day
  medicineName?: string;
  dose?: string;
  instructions?: string;
  vaccineName?: string;
  therapyName?: string;
  therapyType?: string;
  autoScheduled?: boolean;
}

export interface AutoScheduleResult {
  pillsCount: number;
  vaccinesCount: number;
  therapyCount: number;
  totalScheduled: number;
  newlyAdded: number;
}

const STORAGE_KEY = 'medora_offline_scheduled_reminders';

class LocalNotificationSchedulerService {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private memoryStore: Map<string, string> = new Map();

  constructor() {
    this.ensureDefaultReminders();
  }

  private getStorageItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // Fall through to memoryStore
    }
    return this.memoryStore.get(key) || null;
  }

  private setStorageItem(key: string, val: string): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, val);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
        return;
      }
    } catch {
      // Fall through to memoryStore
    }
    this.memoryStore.set(key, val);
  }

  /**
   * Initializes the offline ticker loop (runs once at app startup).
   */
  public initScheduler(): () => void {
    if (this.isInitialized && this.timerId) {
      return () => this.stopScheduler();
    }

    this.isInitialized = true;
    // Check immediately on startup
    this.checkAndTriggerDueReminders();

    // Check every 30 seconds
    this.timerId = setInterval(() => {
      this.checkAndTriggerDueReminders();
    }, 30000);

    return () => this.stopScheduler();
  }

  public stopScheduler(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isInitialized = false;
  }

  /**
   * Requests native Web Notification permission from user if available.
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get all scheduled reminders from persistent local storage.
   */
  public getReminders(patientId?: number): ScheduledReminder[] {
    try {
      const raw = this.getStorageItem(STORAGE_KEY);
      if (!raw) return [];
      const list: ScheduledReminder[] = JSON.parse(raw);
      if (patientId !== undefined) {
        return list.filter((r) => r.patientId === patientId || r.patientId === 1);
      }
      return list;
    } catch (e) {
      console.warn('[NotificationScheduler] Failed to read reminders:', e);
      return [];
    }
  }

  /**
   * Add a new scheduled reminder.
   */
  public addReminder(
    data: Omit<ScheduledReminder, 'id' | 'createdAt' | 'time24'> & { time: string }
  ): ScheduledReminder {
    const reminders = this.getReminders();
    const time24 = this.normalizeTimeTo24h(data.time);
    const newReminder: ScheduledReminder = {
      ...data,
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time24,
      createdAt: new Date().toISOString(),
    };

    reminders.unshift(newReminder);
    this.saveReminders(reminders);

    // Also request notification permission in background if not asked yet
    this.requestNotificationPermission().catch(() => {});

    return newReminder;
  }

  /**
   * Toggle a reminder active/inactive.
   */
  public toggleReminder(id: string, enabled: boolean): boolean {
    const reminders = this.getReminders();
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) return false;
    reminders[index].enabled = enabled;
    this.saveReminders(reminders);
    return true;
  }

  /**
   * Delete a scheduled reminder.
   */
  public deleteReminder(id: string): boolean {
    const reminders = this.getReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    if (filtered.length === reminders.length) return false;
    this.saveReminders(filtered);
    return true;
  }

  /**
   * AUTOMATED SCHEDULING ENGINE
   * 
   * Sets push notifications for:
   * 1. Pills / Medications (active medicines with scheduled dosage times)
   * 2. Vaccinations (due/scheduled childhood & maternal immunizations)
   * 3. Therapy Sessions (inhalation therapy, diabetic foot care, prenatal exercise, physical therapy)
   * 
   * Runs completely automatically without requiring manual user input.
   */
  public async autoScheduleAllForPatient(
    patientId: number,
    options: { force?: boolean } = {}
  ): Promise<AutoScheduleResult> {
    const pid = Number(patientId) || 1;
    let newlyAdded = 0;
    let existingList = this.getReminders();

    if (options.force) {
      existingList = existingList.filter((r) => !(r.patientId === pid && r.autoScheduled));
      this.saveReminders(existingList);
    }

    let patientName = 'Patient';
    let patientData: any = null;

    try {
      if (db.patients) {
        patientData = await db.patients.get(pid);
        if (patientData?.name) {
          patientName = patientData.name;
        }
      }
    } catch {
      // Safe fallback
    }

    // -------------------------------------------------------------------------
    // 1. AUTOMATED PILLS / MEDICATION SCHEDULING
    // -------------------------------------------------------------------------
    let pillsCount = 0;
    try {
      if (db.medicines) {
        const medicines = await db.medicines.where('patientId').equals(pid).toArray();
        const activeMeds = medicines.length > 0 
          ? medicines.filter((m) => m.status === 'active' || !m.status)
          : await db.medicines.where({ status: 'active' }).toArray();

        for (const med of activeMeds) {
          // Normalize times array or derive from frequency
          const times = med.times && med.times.length > 0
            ? med.times
            : this.inferDefaultTimesForFrequency(med.frequency);

          for (const timeStr of times) {
            const time24 = this.normalizeTimeTo24h(timeStr);
            const alreadyExists = existingList.some(
              (r) =>
                r.patientId === pid &&
                r.type === 'medication' &&
                (r.medicineName === med.name || r.title.includes(med.name)) &&
                r.time24 === time24
            );

            if (!alreadyExists) {
              const newRem: ScheduledReminder = {
                id: `auto_pill_${pid}_${med.id || Math.random().toString(36).slice(2, 6)}_${time24.replace(':', '')}`,
                patientId: pid,
                patientName,
                type: 'medication',
                title: `Take ${med.name} (${med.dose})`,
                medicineName: med.name,
                dose: med.dose,
                instructions: med.instructions || 'Take as prescribed by doctor',
                time: timeStr,
                time24,
                recurrence: 'daily',
                enabled: true,
                language: (patientData?.language as LanguageCode) || 'en',
                createdAt: new Date().toISOString(),
                details: `${med.dose} · ${med.frequency} · ${med.instructions || 'Take on time'}`,
                autoScheduled: true,
              };
              existingList.unshift(newRem);
              newlyAdded++;
            }
            pillsCount++;
          }
        }
      }
    } catch (err) {
      console.warn('[NotificationScheduler] Auto-scheduling pills error:', err);
    }

    // Fallback default pills if none in DB for this patient
    if (pillsCount === 0) {
      const defaultMeds = [
        { name: 'Metformin 500mg', dose: '1 tablet', time: '08:00 AM', time24: '08:00', inst: 'Take after breakfast for blood sugar' },
        { name: 'Amlodipine 5mg', dose: '1 tablet', time: '08:00 PM', time24: '20:00', inst: 'Take after dinner for blood pressure' },
      ];
      for (const dm of defaultMeds) {
        const alreadyExists = existingList.some(
          (r) => r.patientId === pid && r.type === 'medication' && r.time24 === dm.time24
        );
        if (!alreadyExists) {
          existingList.unshift({
            id: `auto_pill_${pid}_def_${dm.time24.replace(':', '')}`,
            patientId: pid,
            patientName,
            type: 'medication',
            title: `Take ${dm.name} (${dm.dose})`,
            medicineName: dm.name,
            dose: dm.dose,
            instructions: dm.inst,
            time: dm.time,
            time24: dm.time24,
            recurrence: 'daily',
            enabled: true,
            language: (patientData?.language as LanguageCode) || 'en',
            createdAt: new Date().toISOString(),
            details: `${dm.dose} · Daily schedule · ${dm.inst}`,
            autoScheduled: true,
          });
          newlyAdded++;
        }
        pillsCount++;
      }
    }

    // -------------------------------------------------------------------------
    // 2. AUTOMATED VACCINATIONS SCHEDULING
    // -------------------------------------------------------------------------
    let vaccinesCount = 0;
    try {
      if (db.vaccinations) {
        const vacs = await db.vaccinations.where('patientId').equals(pid).toArray();
        const dueVacs = vacs.filter((v) => v.status === 'due' || v.status === 'scheduled' || v.status === 'overdue');

        for (const vac of dueVacs) {
          const alreadyExists = existingList.some(
            (r) =>
              r.patientId === pid &&
              r.type === 'vaccination' &&
              (r.vaccineName === vac.vaccineName || r.title.includes(vac.vaccineName))
          );

          if (!alreadyExists) {
            existingList.unshift({
              id: `auto_vac_${pid}_${vac.id || Math.random().toString(36).slice(2, 6)}`,
              patientId: pid,
              patientName,
              type: 'vaccination',
              title: `Vaccination Due: ${vac.vaccineName}`,
              vaccineName: vac.vaccineName,
              time: '09:00 AM',
              time24: '09:00',
              dueDate: vac.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
              recurrence: 'once',
              enabled: true,
              language: (patientData?.language as LanguageCode) || 'en',
              createdAt: new Date().toISOString(),
              details: `Due on ${vac.dueDate || 'scheduled date'}. Visit nearest Primary Health Centre or Anganwadi.`,
              instructions: 'Carry Mother-Child Protection (MCP) card',
              autoScheduled: true,
            });
            newlyAdded++;
          }
          vaccinesCount++;
        }
      }
    } catch (err) {
      console.warn('[NotificationScheduler] Auto-scheduling vaccinations error:', err);
    }

    // Fallback default vaccination reminder if patient is maternal/child or has none
    if (vaccinesCount === 0) {
      const defaultVaccine = {
        name: patientData?.isPregnant ? 'Tetanus Toxoid (TT Booster)' : 'Annual Influenza Vaccine',
        dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      };
      const alreadyExists = existingList.some(
        (r) => r.patientId === pid && r.type === 'vaccination'
      );
      if (!alreadyExists) {
        existingList.unshift({
          id: `auto_vac_${pid}_def`,
          patientId: pid,
          patientName,
          type: 'vaccination',
          title: `Vaccination Due: ${defaultVaccine.name}`,
          vaccineName: defaultVaccine.name,
          time: '09:00 AM',
          time24: '09:00',
          dueDate: defaultVaccine.dueDate,
          recurrence: 'once',
          enabled: true,
          language: (patientData?.language as LanguageCode) || 'en',
          createdAt: new Date().toISOString(),
          details: `Scheduled at Village Health Sub-centre. Bring health card.`,
          autoScheduled: true,
        });
        newlyAdded++;
      }
      vaccinesCount++;
    }

    // -------------------------------------------------------------------------
    // 3. AUTOMATED THERAPY SESSIONS SCHEDULING
    // -------------------------------------------------------------------------
    let therapyCount = 0;
    const therapySessionsToSchedule: Array<{
      name: string;
      type: string;
      time: string;
      time24: string;
      details: string;
      instructions: string;
    }> = [];

    // Analyze patient characteristics to establish custom therapeutic sessions:
    const conditions = (patientData?.conditions || []).map((c: string) => c.toLowerCase());
    const isPregnant = Boolean(patientData?.isPregnant);
    const isElderly = Boolean(patientData?.isElderly || (patientData?.age && patientData.age >= 60));

    if (conditions.some((c: string) => c.includes('copd') || c.includes('asthma') || c.includes('respiratory'))) {
      therapySessionsToSchedule.push({
        name: 'Inhalation Therapy & Airway Clearance Session',
        type: 'Respiratory Rehabilitation',
        time: '07:30 AM',
        time24: '07:30',
        details: 'Daily dry powder inhaler / nebulizer therapy and gentle chest expansion exercises.',
        instructions: 'Rinse mouth thoroughly with clean water after inhaling.',
      });
      therapySessionsToSchedule.push({
        name: 'Evening Airway Clearance & Steam Inhalation Therapy',
        type: 'Respiratory Rehabilitation',
        time: '07:00 PM',
        time24: '19:00',
        details: 'Warm steam inhalation to clear airway secretions before sleeping.',
        instructions: 'Inhale steam gently for 10 minutes.',
      });
    }

    if (conditions.some((c: string) => c.includes('diabetes') || c.includes('sugar'))) {
      therapySessionsToSchedule.push({
        name: 'Diabetic Foot Inspection & Glucose Review Therapy',
        type: 'Endocrine Care & Diabetic Therapy',
        time: '08:30 PM',
        time24: '20:30',
        details: 'Inspect soles, heels, and between toes for cracks, blisters, or thorn pricks.',
        instructions: 'Wash with lukewarm water and dry with clean soft towel.',
      });
    }

    if (isPregnant) {
      therapySessionsToSchedule.push({
        name: 'Prenatal Hydration & Pelvic Floor Exercise Therapy',
        type: 'Maternal Antenatal Therapy',
        time: '05:00 PM',
        time24: '17:00',
        details: 'Gentle pelvic floor stretches, left-lateral resting posture, and kick counting.',
        instructions: 'Drink tender coconut water or fresh lime water; count fetal movements.',
      });
    }

    if (isElderly) {
      therapySessionsToSchedule.push({
        name: 'Geriatric Joint Mobility & Fall Prevention Therapy',
        type: 'Physical Physiotherapy',
        time: '07:00 AM',
        time24: '07:00',
        details: '15-minute gentle seated stretching and ankle rotation to prevent morning falls.',
        instructions: 'Wear sturdy non-slip footwear and keep walking stick near bed.',
      });
    }

    // Baseline default therapy session for every profile:
    if (therapySessionsToSchedule.length === 0) {
      therapySessionsToSchedule.push({
        name: 'Daily Vitals Tracking & Posture Therapy Session',
        type: 'Preventive Health Therapy',
        time: '09:30 AM',
        time24: '09:30',
        details: 'Scheduled deep breathing, resting pulse check, and posture realignment.',
        instructions: 'Sit comfortably with straight spine; take 10 slow diaphragmatic breaths.',
      });
      therapySessionsToSchedule.push({
        name: 'Evening Hydration & Stress Reduction Therapy',
        type: 'Lifestyle Wellness Therapy',
        time: '06:30 PM',
        time24: '18:30',
        details: 'Evening hydration reminder and 15-minute relaxing village farm walk.',
        instructions: 'Drink a glass of clean boiled water; avoid heavy digital screens.',
      });
    }

    for (const therapy of therapySessionsToSchedule) {
      const alreadyExists = existingList.some(
        (r) =>
          r.patientId === pid &&
          r.type === 'therapy' &&
          (r.therapyName === therapy.name || r.title.includes(therapy.name)) &&
          r.time24 === therapy.time24
      );

      if (!alreadyExists) {
        existingList.unshift({
          id: `auto_ther_${pid}_${Math.random().toString(36).slice(2, 6)}_${therapy.time24.replace(':', '')}`,
          patientId: pid,
          patientName,
          type: 'therapy',
          title: `Therapy Session: ${therapy.name}`,
          therapyName: therapy.name,
          therapyType: therapy.type,
          time: therapy.time,
          time24: therapy.time24,
          recurrence: 'daily',
          enabled: true,
          language: (patientData?.language as LanguageCode) || 'en',
          createdAt: new Date().toISOString(),
          details: `${therapy.type} · ${therapy.details}`,
          instructions: therapy.instructions,
          autoScheduled: true,
        });
        newlyAdded++;
      }
      therapyCount++;
    }

    // Save consolidated reminders
    this.saveReminders(existingList);

    // Request native Web Push permissions in background
    this.requestNotificationPermission().catch(() => {});

    return {
      pillsCount,
      vaccinesCount,
      therapyCount,
      totalScheduled: pillsCount + vaccinesCount + therapyCount,
      newlyAdded,
    };
  }

  /**
   * Helper to derive standard dosage times from frequency string.
   */
  private inferDefaultTimesForFrequency(frequency?: string): string[] {
    const f = (frequency || '').toLowerCase();
    if (f.includes('three') || f.includes('thrice') || f.includes('tds') || f.includes('tid')) {
      return ['08:00 AM', '01:00 PM', '08:00 PM'];
    }
    if (f.includes('two') || f.includes('twice') || f.includes('bd') || f.includes('bid')) {
      return ['08:00 AM', '08:00 PM'];
    }
    if (f.includes('night') || f.includes('bedtime') || f.includes('hs')) {
      return ['09:00 PM'];
    }
    // Default once daily in morning
    return ['08:00 AM'];
  }

  /**
   * Check current clock and fire due reminders.
   */
  public async checkAndTriggerDueReminders(): Promise<void> {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime24 = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().split('T')[0];
    const currentDayOfWeek = now.getDay();

    const reminders = this.getReminders();
    let hasUpdates = false;

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;

      // Check if already triggered today for daily recurrence
      if (reminder.lastTriggeredDate === todayDateStr && reminder.recurrence === 'daily') {
        continue;
      }

      // Check date match for one-off appointments/vaccinations
      if (reminder.dueDate && reminder.dueDate !== todayDateStr) {
        continue;
      }

      // Check day of week for weekly recurrence
      if (
        reminder.recurrence === 'weekly' &&
        reminder.daysOfWeek &&
        !reminder.daysOfWeek.includes(currentDayOfWeek)
      ) {
        continue;
      }

      // Check time match (allowing within current minute)
      if (reminder.time24 === currentTime24) {
        await this.fireReminder(reminder);
        reminder.lastTriggeredDate = todayDateStr;
        if (reminder.recurrence === 'once') {
          reminder.enabled = false;
        }
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      this.saveReminders(reminders);
    }
  }

  /**
   * Execute reminder alert across notification, IndexedDB, and voice synthesizer.
   */
  public async fireReminder(reminder: ScheduledReminder): Promise<void> {
    const title =
      reminder.type === 'medication'
        ? `💊 Medication Reminder: ${reminder.medicineName || reminder.title}`
        : reminder.type === 'vaccination'
        ? `💉 Vaccination Due: ${reminder.vaccineName || reminder.title}`
        : reminder.type === 'therapy'
        ? `🧘 Therapy Session: ${reminder.therapyName || reminder.title}`
        : `📅 Medical Reminder: ${reminder.title}`;

    const body = `${reminder.details || ''} ${reminder.instructions ? `(${reminder.instructions})` : ''}`.trim();

    // 1. Web Notification (Native OS / browser popup)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: reminder.id,
        });
      } catch (err) {
        console.warn('[NotificationScheduler] Native notification failed:', err);
      }
    }

    // 2. Persist to Dexie IndexedDB (db.notifications table)
    try {
      if (db.notifications) {
        await db.notifications.add({
          userId: reminder.patientId || 1,
          userRole: 'patient',
          message: `${title} — ${body}`,
          type:
            reminder.type === 'medication'
              ? 'medicine'
              : reminder.type === 'vaccination'
              ? 'vaccination'
              : reminder.type === 'therapy'
              ? 'general'
              : 'appointment',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[NotificationScheduler] Failed to add db.notification:', err);
    }

    // 3. Audio Voice Announcement (Offline Web Speech API)
    try {
      const voiceText =
        reminder.type === 'medication'
          ? `Medora Reminder. It is time for your medication: ${reminder.medicineName || reminder.title}. ${reminder.dose || ''}. ${reminder.instructions || 'Please take it on time.'}`
          : reminder.type === 'vaccination'
          ? `Medora Reminder. Vaccination appointment for ${reminder.vaccineName || reminder.title} is scheduled today.`
          : reminder.type === 'therapy'
          ? `Medora Reminder. Time for your scheduled therapy session: ${reminder.therapyName || reminder.title}. ${reminder.instructions || ''}`
          : `Medora Reminder. ${reminder.title}. ${reminder.details}`;

      voiceService.speak(voiceText, reminder.language || 'en');
    } catch {
      // Audio might be blocked if user has not interacted
    }
  }

  /**
   * Helper to convert 12-hour strings (e.g. "08:00 AM", "8:30 pm") to "08:00", "20:30"
   */
  public normalizeTimeTo24h(timeStr: string): string {
    const clean = (timeStr || '').trim();
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match12) {
      // If already HH:MM
      const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
      if (match24) {
        return `${match24[1].padStart(2, '0')}:${match24[2]}`;
      }
      return '08:00';
    }

    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const modifier = (match12[3] || '').toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  private saveReminders(list: ScheduledReminder[]): void {
    try {
      this.setStorageItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[NotificationScheduler] Failed to save reminders:', e);
    }
  }

  private ensureDefaultReminders(): void {
    try {
      const existing = this.getStorageItem(STORAGE_KEY);
      if (!existing || existing === '[]') {
        const defaultReminders: ScheduledReminder[] = [
          {
            id: 'default_med_1',
            patientId: 1,
            patientName: 'Ramesh Kumar',
            type: 'medication',
            title: 'Amlodipine 5mg (Morning)',
            medicineName: 'Amlodipine 5mg',
            dose: '1 tablet with warm water',
            instructions: 'Take after breakfast for Blood Pressure',
            time: '08:00 AM',
            time24: '08:00',
            recurrence: 'daily',
            enabled: true,
            language: 'en',
            createdAt: new Date().toISOString(),
            details: 'Take 1 tablet after breakfast. Blood pressure control.',
            autoScheduled: true,
          },
          {
            id: 'default_med_2',
            patientId: 1,
            patientName: 'Ramesh Kumar',
            type: 'medication',
            title: 'Metformin 500mg (Evening)',
            medicineName: 'Metformin 500mg',
            dose: '1 tablet with dinner',
            instructions: 'Take with warm meal for Blood Sugar',
            time: '08:00 PM',
            time24: '20:00',
            recurrence: 'daily',
            enabled: true,
            language: 'en',
            createdAt: new Date().toISOString(),
            details: 'Take 1 tablet with evening meal. Blood sugar control.',
            autoScheduled: true,
          },
          {
            id: 'default_vac_1',
            patientId: 1,
            patientName: 'Baby Aarav',
            type: 'vaccination',
            title: 'Pentavalent-2 Booster Due',
            vaccineName: 'Pentavalent-2',
            time: '09:00 AM',
            time24: '09:00',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            recurrence: 'once',
            enabled: true,
            language: 'en',
            createdAt: new Date().toISOString(),
            details: 'Visit Village Primary Health Centre for child immunization schedule.',
            autoScheduled: true,
          },
          {
            id: 'default_ther_1',
            patientId: 1,
            patientName: 'Ramesh Kumar',
            type: 'therapy',
            title: 'Therapy Session: Diabetic Foot Care & Vitals Check',
            therapyName: 'Diabetic Foot Care & Vitals Check',
            therapyType: 'Metabolic & Physical Therapy',
            time: '08:30 PM',
            time24: '20:30',
            recurrence: 'daily',
            enabled: true,
            language: 'en',
            createdAt: new Date().toISOString(),
            details: 'Inspect soles and feet; wash with lukewarm water; log resting vitals.',
            instructions: 'Inspect for cuts, ulcers or redness.',
            autoScheduled: true,
          },
        ];
        this.saveReminders(defaultReminders);
      }
    } catch {
      // Ignore
    }
  }
}

export const localNotificationScheduler = new LocalNotificationSchedulerService();
