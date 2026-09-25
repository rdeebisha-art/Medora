/**
 * Medora Local Offline Notification Scheduler Service
 * 
 * Works 100% OFFLINE without any external push server, Firebase, or internet connectivity.
 * Allows patients and rural health workers to set:
 * - Recurring daily medication intake reminders (Morning, Afternoon, Evening)
 * - Upcoming child / maternal vaccination appointments
 * - Doctor clinic follow-ups
 * 
 * Channels:
 * 1. Web Notifications API (native browser notification)
 * 2. Dexie IndexedDB Notification log (db.notifications table)
 * 3. Text-to-Speech audio announcement via Medora voice service (multilingual)
 */

import { db } from '../../db/db';
import type { Notification as DbNotification } from '../../db/db';
import { voiceService } from '../voiceService';
import { LanguageCode } from '../../types';

export type ReminderType = 'medication' | 'vaccination' | 'appointment' | 'general';
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
      await db.notifications.add({
        userId: reminder.patientId || 1,
        userRole: 'patient',
        message: `${title} — ${body}`,
        type: reminder.type === 'medication' ? 'medicine' : reminder.type === 'vaccination' ? 'vaccination' : 'appointment',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
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
          },
          {
            id: 'default_vac_1',
            patientId: 1,
            patientName: 'Baby Aarav',
            type: 'vaccination',
            title: 'Pentavalent-2 Booster Due',
            vaccineName: 'Pentavalent-2',
            time: '10:00 AM',
            time24: '10:00',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            recurrence: 'once',
            enabled: true,
            language: 'en',
            createdAt: new Date().toISOString(),
            details: 'Visit Village Primary Health Centre for child immunization schedule.',
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
