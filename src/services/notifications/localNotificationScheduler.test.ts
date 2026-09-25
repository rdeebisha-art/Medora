import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  localNotificationScheduler,
  ScheduledReminder,
} from './localNotificationScheduler';

describe('LocalNotificationSchedulerService - Offline Reminders', () => {
  beforeEach(() => {
    // Clear reminders before test
    const all = localNotificationScheduler.getReminders();
    for (const r of all) {
      localNotificationScheduler.deleteReminder(r.id);
    }
  });

  afterEach(() => {
    localNotificationScheduler.stopScheduler();
  });

  it('normalizes 12-hour and 24-hour time strings correctly', () => {
    expect(localNotificationScheduler.normalizeTimeTo24h('08:00 AM')).toBe('08:00');
    expect(localNotificationScheduler.normalizeTimeTo24h('8:30 am')).toBe('08:30');
    expect(localNotificationScheduler.normalizeTimeTo24h('12:00 PM')).toBe('12:00');
    expect(localNotificationScheduler.normalizeTimeTo24h('08:00 PM')).toBe('20:00');
    expect(localNotificationScheduler.normalizeTimeTo24h('11:45 pm')).toBe('23:45');
    expect(localNotificationScheduler.normalizeTimeTo24h('14:15')).toBe('14:15');
    expect(localNotificationScheduler.normalizeTimeTo24h('09:05')).toBe('09:05');
  });

  it('allows scheduling recurring daily medication reminders offline', () => {
    const reminder = localNotificationScheduler.addReminder({
      patientId: 101,
      patientName: 'Kavitha Devi',
      type: 'medication',
      title: 'Metformin 500mg (Daily Morning)',
      medicineName: 'Metformin 500mg',
      dose: '1 tablet after breakfast',
      instructions: 'Take with warm water',
      time: '08:30 AM',
      recurrence: 'daily',
      enabled: true,
      language: 'en',
      details: 'Daily diabetes medication',
    });

    expect(reminder.id).toBeDefined();
    expect(reminder.time24).toBe('08:30');
    expect(reminder.recurrence).toBe('daily');
    expect(reminder.enabled).toBe(true);

    const patientReminders = localNotificationScheduler.getReminders(101);
    expect(patientReminders.some((r) => r.id === reminder.id)).toBe(true);
  });

  it('allows scheduling upcoming child / maternal vaccination appointments offline', () => {
    const vaccineReminder = localNotificationScheduler.addReminder({
      patientId: 102,
      patientName: 'Baby Ananya',
      type: 'vaccination',
      title: 'Pentavalent-1 & Rotavirus Vaccine Due',
      vaccineName: 'Pentavalent-1',
      time: '10:00 AM',
      dueDate: '2026-10-15',
      recurrence: 'once',
      enabled: true,
      language: 'ta',
      details: 'Primary immunization at Village Sub-centre',
      instructions: 'Bring MCP card / immunization booklet',
    });

    expect(vaccineReminder.id).toBeDefined();
    expect(vaccineReminder.type).toBe('vaccination');
    expect(vaccineReminder.dueDate).toBe('2026-10-15');
    expect(vaccineReminder.time24).toBe('10:00');

    const patientReminders = localNotificationScheduler.getReminders(102);
    expect(patientReminders.some((r) => r.vaccineName === 'Pentavalent-1')).toBe(true);
  });

  it('allows toggling reminders active and inactive', () => {
    const reminder = localNotificationScheduler.addReminder({
      patientId: 103,
      type: 'medication',
      title: 'Amlodipine 5mg',
      time: '09:00 AM',
      recurrence: 'daily',
      enabled: true,
      language: 'en',
      details: 'Hypertension control',
    });

    expect(reminder.enabled).toBe(true);
    localNotificationScheduler.toggleReminder(reminder.id, false);

    const updated = localNotificationScheduler.getReminders(103).find((r) => r.id === reminder.id);
    expect(updated?.enabled).toBe(false);

    localNotificationScheduler.toggleReminder(reminder.id, true);
    const reEnabled = localNotificationScheduler.getReminders(103).find((r) => r.id === reminder.id);
    expect(reEnabled?.enabled).toBe(true);
  });

  it('allows deleting scheduled reminders', () => {
    const reminder = localNotificationScheduler.addReminder({
      patientId: 104,
      type: 'appointment',
      title: 'PHC Doctor Follow-up',
      time: '11:00 AM',
      recurrence: 'once',
      enabled: true,
      language: 'en',
      details: 'Monthly checkup',
    });

    const deleted = localNotificationScheduler.deleteReminder(reminder.id);
    expect(deleted).toBe(true);

    const list = localNotificationScheduler.getReminders(104);
    expect(list.some((r) => r.id === reminder.id)).toBe(false);
  });

  it('triggers fireReminder and dispatches notification safely', async () => {
    const reminder = localNotificationScheduler.addReminder({
      patientId: 105,
      type: 'medication',
      title: 'Paracetamol 650mg',
      medicineName: 'Paracetamol 650mg',
      time: '02:00 PM',
      recurrence: 'daily',
      enabled: true,
      language: 'en',
      details: 'Fever management',
    });

    // Verify fireReminder runs without throwing even offline
    await expect(localNotificationScheduler.fireReminder(reminder)).resolves.not.toThrow();
  });

  it('automatically sets push notifications for pills, vaccinations, and therapy sessions without manual user input', async () => {
    const result = await localNotificationScheduler.autoScheduleAllForPatient(201, { force: true });

    expect(result).toBeDefined();
    expect(result.pillsCount).toBeGreaterThan(0);
    expect(result.vaccinesCount).toBeGreaterThan(0);
    expect(result.therapyCount).toBeGreaterThan(0);
    expect(result.totalScheduled).toBe(result.pillsCount + result.vaccinesCount + result.therapyCount);

    const scheduled = localNotificationScheduler.getReminders(201);
    expect(scheduled.length).toBeGreaterThanOrEqual(result.totalScheduled);

    // Verify pills scheduled
    const pillReminders = scheduled.filter((r) => r.type === 'medication');
    expect(pillReminders.length).toBeGreaterThan(0);
    expect(pillReminders.some((r) => r.autoScheduled)).toBe(true);

    // Verify vaccination scheduled
    const vaccineReminders = scheduled.filter((r) => r.type === 'vaccination');
    expect(vaccineReminders.length).toBeGreaterThan(0);

    // Verify therapy sessions scheduled
    const therapyReminders = scheduled.filter((r) => r.type === 'therapy');
    expect(therapyReminders.length).toBeGreaterThan(0);
    expect(therapyReminders[0].therapyName).toBeDefined();
    expect(therapyReminders[0].time24).toBeDefined();
  });

  it('does not duplicate automated schedules on subsequent runs', async () => {
    const firstRun = await localNotificationScheduler.autoScheduleAllForPatient(202, { force: true });
    expect(firstRun.newlyAdded).toBeGreaterThan(0);

    const secondRun = await localNotificationScheduler.autoScheduleAllForPatient(202, { force: false });
    expect(secondRun.newlyAdded).toBe(0);
  });
});

