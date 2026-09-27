import { db, Medicine, MedicineAdherence } from '../../db/db';
import { localNotificationScheduler, ScheduledReminder } from '../notifications/localNotificationScheduler';
import { voiceService } from '../voiceService';
import { LanguageCode } from '../../types';

export interface NextDoseInfo {
  medicineId?: number;
  medicineName: string;
  dose: string;
  scheduledTime: string; // e.g. "08:00 AM" or "20:00"
  time24: string; // "08:00"
  instructions?: string;
  minutesUntilDose: number;
  isToday: boolean;
  status: 'upcoming_soon' | 'scheduled_today' | 'tomorrow' | 'past_due';
}

export interface TodayAdherenceSummary {
  date: string;
  totalPrescriptions: number;
  totalDosesScheduled: number;
  dosesTakenCount: number;
  dosesMissedCount: number;
  pendingDosesCount: number;
  adherencePercentage: number;
  doses: Array<{
    medicineId: number;
    medicineName: string;
    dose: string;
    scheduledTime: string;
    time24: string;
    status: 'taken' | 'missed' | 'pending';
    takenAt?: string;
    instructions?: string;
  }>;
}

class MedicationPushNotificationService {
  private watcherTimer: ReturnType<typeof setInterval> | null = null;
  private notifiedDoseKeys: Set<string> = new Set();

  /**
   * Request native browser Web Push Notification permissions.
   */
  public async requestPushPermission(): Promise<boolean> {
    return await localNotificationScheduler.requestNotificationPermission();
  }

  /**
   * Schedules offline and native push notifications for all active medications
   * of the given patient using localNotificationScheduler.
   */
  public async scheduleMedicationPushNotifications(patientId: number): Promise<number> {
    const pid = Number(patientId) || 1;
    const result = await localNotificationScheduler.autoScheduleAllForPatient(pid);
    return result.pillsCount;
  }

  /**
   * Computes the nearest upcoming medication dose for a patient.
   */
  public async getNextUpcomingDose(patientId: number): Promise<NextDoseInfo | null> {
    const pid = Number(patientId) || 1;
    let medicines = await db.medicines.where('patientId').equals(pid).toArray().catch(() => [] as Medicine[]);
    if (medicines.length === 0) {
      medicines = await db.medicines.where({ status: 'active' }).toArray().catch(() => [] as Medicine[]);
    }
    const activeMeds = medicines.filter((m) => m.status === 'active' || !m.status);
    if (activeMeds.length === 0) {
      return null;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    interface DoseCandidate {
      med: Medicine;
      timeStr: string;
      time24: string;
      minutesFromMidnight: number;
      diffMinutes: number;
      isTomorrow: boolean;
    }

    const candidates: DoseCandidate[] = [];

    for (const med of activeMeds) {
      const times = med.times && med.times.length > 0 ? med.times : ['08:00 AM'];
      for (const tStr of times) {
        const time24 = localNotificationScheduler.normalizeTimeTo24h(tStr);
        const [h, m] = time24.split(':').map((x) => parseInt(x, 10) || 0);
        const doseMinutes = h * 60 + m;

        if (doseMinutes >= currentMinutes) {
          candidates.push({
            med,
            timeStr: tStr,
            time24,
            minutesFromMidnight: doseMinutes,
            diffMinutes: doseMinutes - currentMinutes,
            isTomorrow: false,
          });
        } else {
          // Scheduled for tomorrow morning
          candidates.push({
            med,
            timeStr: tStr,
            time24,
            minutesFromMidnight: doseMinutes,
            diffMinutes: 1440 - currentMinutes + doseMinutes,
            isTomorrow: true,
          });
        }
      }
    }

    if (candidates.length === 0) return null;

    // Sort by smallest difference in minutes
    candidates.sort((a, b) => a.diffMinutes - b.diffMinutes);
    const nearest = candidates[0];

    let status: NextDoseInfo['status'] = 'scheduled_today';
    if (nearest.isTomorrow) {
      status = 'tomorrow';
    } else if (nearest.diffMinutes <= 30) {
      status = 'upcoming_soon';
    }

    return {
      medicineId: nearest.med.id,
      medicineName: nearest.med.name,
      dose: nearest.med.dose,
      scheduledTime: nearest.timeStr,
      time24: nearest.time24,
      instructions: nearest.med.instructions,
      minutesUntilDose: nearest.diffMinutes,
      isToday: !nearest.isTomorrow,
      status,
    };
  }

  /**
   * Retrieves today's adherence summary, checking whether user has taken their medicine today.
   */
  public async getTodaysAdherence(patientId: number): Promise<TodayAdherenceSummary> {
    const pid = Number(patientId) || 1;
    const todayStr = new Date().toISOString().split('T')[0];

    // Get active medicines
    let medicines = await db.medicines.where('patientId').equals(pid).toArray().catch(() => [] as Medicine[]);
    if (medicines.length === 0) {
      medicines = await db.medicines.where({ status: 'active' }).toArray().catch(() => [] as Medicine[]);
    }
    const activeMeds = medicines.filter((m) => m.status === 'active' || !m.status);

    // Get today's adherence records from db.medicineAdherence
    const adherenceRecords = await db.medicineAdherence
      .where('patientId')
      .equals(pid)
      .toArray()
      .catch(() => [] as MedicineAdherence[]);

    const todaysLogs = adherenceRecords.filter((r) => r.date === todayStr);

    const dosesList: TodayAdherenceSummary['doses'] = [];
    let takenCount = 0;
    let missedCount = 0;
    let pendingCount = 0;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const med of activeMeds) {
      const times = med.times && med.times.length > 0 ? med.times : ['08:00 AM'];
      for (const tStr of times) {
        const time24 = localNotificationScheduler.normalizeTimeTo24h(tStr);
        const [h, m] = time24.split(':').map((x) => parseInt(x, 10) || 0);
        const doseMinutes = h * 60 + m;

        // Check if logged in db.medicineAdherence
        const matchedLog = todaysLogs.find(
          (l) =>
            (l.medicineId === med.id || l.medicineName?.toLowerCase() === med.name.toLowerCase()) &&
            (l.scheduledTime === tStr || l.scheduledTime === time24)
        );

        if (matchedLog) {
          if (matchedLog.status === 'taken') {
            takenCount++;
            dosesList.push({
              medicineId: med.id || 0,
              medicineName: med.name,
              dose: med.dose,
              scheduledTime: tStr,
              time24,
              status: 'taken',
              takenAt: matchedLog.actualTakenTime || matchedLog.takenAt,
              instructions: med.instructions,
            });
          } else {
            missedCount++;
            dosesList.push({
              medicineId: med.id || 0,
              medicineName: med.name,
              dose: med.dose,
              scheduledTime: tStr,
              time24,
              status: 'missed',
              instructions: med.instructions,
            });
          }
        } else {
          // If past dose time by >60 mins and not logged, consider pending or missed
          const isPast = currentMinutes > doseMinutes + 60;
          if (isPast) {
            // Unmarked past dose
            pendingCount++;
            dosesList.push({
              medicineId: med.id || 0,
              medicineName: med.name,
              dose: med.dose,
              scheduledTime: tStr,
              time24,
              status: 'pending',
              instructions: med.instructions,
            });
          } else {
            pendingCount++;
            dosesList.push({
              medicineId: med.id || 0,
              medicineName: med.name,
              dose: med.dose,
              scheduledTime: tStr,
              time24,
              status: 'pending',
              instructions: med.instructions,
            });
          }
        }
      }
    }

    const totalScheduled = dosesList.length;
    const adherencePercentage = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100;

    return {
      date: todayStr,
      totalPrescriptions: activeMeds.length,
      totalDosesScheduled: totalScheduled,
      dosesTakenCount: takenCount,
      dosesMissedCount: missedCount,
      pendingDosesCount: pendingCount,
      adherencePercentage,
      doses: dosesList,
    };
  }

  /**
   * Marks a scheduled medication dose as taken in db.medicineAdherence and updates db.medicines.
   */
  public async markDoseAsTaken(
    patientId: number,
    medicineId: number,
    scheduledTime: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const pid = Number(patientId) || 1;
      const todayStr = new Date().toISOString().split('T')[0];
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const med = await db.medicines.get(medicineId);

      const entry: MedicineAdherence = {
        medicineId,
        medicineName: med?.name || 'Prescribed Medicine',
        patientId: pid,
        date: todayStr,
        takenAt: new Date().toISOString(),
        status: 'taken',
        recordedBy: 'patient',
        dosagePrescribed: med?.dose || '1 dose',
        scheduledTime,
        actualTakenTime: nowTimeStr,
        delayMinutes: 0,
        notes: notes || 'Taken as prescribed',
      };

      await db.medicineAdherence.add(entry);

      if (med) {
        await db.medicines.update(medicineId, {
          lastTaken: new Date().toISOString(),
        });
      }

      // Add positive feedback notification in db.notifications
      await db.notifications.add({
        userId: pid,
        userRole: 'patient',
        message: `✅ Dose logged: ${med?.name || 'Medicine'} taken at ${nowTimeStr}. Keep up your adherence streak!`,
        type: 'medicine',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (e) {
      console.error('[MedicationPushService] Failed to mark dose taken:', e);
      return false;
    }
  }

  /**
   * Sends an immediate push notification for an upcoming or due medication dose.
   */
  public async sendUpcomingDosePushNotification(
    reminder: ScheduledReminder,
    minutesAhead = 15
  ): Promise<void> {
    const title = `💊 Upcoming Medication Dose: ${reminder.medicineName || reminder.title}`;
    const timingNotice = minutesAhead > 0 ? `Due in ${minutesAhead} minutes (${reminder.time})` : `Due now at ${reminder.time}`;
    const body = `${reminder.dose ? `Dose: ${reminder.dose}. ` : ''}${timingNotice}. ${reminder.instructions || 'Please take on time with water.'}`;

    // 1. Browser Native Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `upcoming_${reminder.id}_${new Date().toISOString().split('T')[0]}`,
        });
      } catch (err) {
        console.warn('[MedicationPushService] Native push error:', err);
      }
    }

    // 2. Local DB Notification
    try {
      await db.notifications.add({
        userId: reminder.patientId || 1,
        userRole: 'patient',
        message: `${title} — ${body}`,
        type: 'medicine',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[MedicationPushService] DB notification save error:', err);
    }

    // 3. Spoken voice announcement
    try {
      voiceService.speak(
        `Medora upcoming medication reminder. Your dose of ${reminder.medicineName || reminder.title} is ${timingNotice}. ${reminder.instructions || ''}`,
        reminder.language || 'en'
      );
    } catch {}
  }

  /**
   * Sends a test push notification to verify permissions and system readiness.
   */
  public async sendTestDoseNotification(medicineName = 'Metformin 500mg'): Promise<boolean> {
    await this.requestPushPermission();

    const mockReminder: ScheduledReminder = {
      id: `test_push_${Date.now()}`,
      patientId: 1,
      patientName: 'Ramesh Kumar',
      type: 'medication',
      title: `Take ${medicineName} (1 tablet)`,
      medicineName,
      dose: '1 tablet',
      instructions: 'Take after meal with warm water',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      time24: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      recurrence: 'daily',
      enabled: true,
      language: 'en',
      createdAt: new Date().toISOString(),
      details: 'Daily prescribed dose. Regular adherence helps keep blood markers stable.',
    };

    await this.sendUpcomingDosePushNotification(mockReminder, 0);
    return true;
  }

  /**
   * Checks upcoming doses due in the next 15-30 minutes and dispatches push notifications.
   */
  public async checkAndNotifyUpcomingDoses(patientId?: number): Promise<void> {
    const reminders = localNotificationScheduler.getReminders(patientId);
    const medReminders = reminders.filter((r) => r.enabled && r.type === 'medication');

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    for (const rem of medReminders) {
      const [h, m] = (rem.time24 || '08:00').split(':').map((x) => parseInt(x, 10) || 0);
      const doseMinutes = h * 60 + m;
      const diff = doseMinutes - currentMinutes;

      // Notify if due in 15 minutes or due right now (0-15 minute window)
      if (diff >= 0 && diff <= 15) {
        const key = `${todayStr}_${rem.id}_${doseMinutes}`;
        if (!this.notifiedDoseKeys.has(key)) {
          this.notifiedDoseKeys.add(key);
          await this.sendUpcomingDosePushNotification(rem, diff);
        }
      }
    }
  }

  /**
   * Initializes background watcher to check upcoming doses periodically.
   */
  public init(patientId = 1): () => void {
    // Run initial schedule check
    this.scheduleMedicationPushNotifications(patientId).catch(() => {});
    this.checkAndNotifyUpcomingDoses(patientId).catch(() => {});

    // Check every 60 seconds for upcoming doses
    if (!this.watcherTimer) {
      this.watcherTimer = setInterval(() => {
        this.checkAndNotifyUpcomingDoses(patientId).catch(() => {});
      }, 60000);
    }

    return () => {
      if (this.watcherTimer) {
        clearInterval(this.watcherTimer);
        this.watcherTimer = null;
      }
    };
  }
}

export const medicationPushNotificationService = new MedicationPushNotificationService();
