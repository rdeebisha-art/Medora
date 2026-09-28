import { db, Medicine, Notification } from '../../db/db';
import { twilioSmsService, TwilioSmsResult } from '../sms/twilioSmsService';
import { medicationPushNotificationService } from './medicationPushNotificationService';
import { logAuditEvent } from '../auditLoggerService';

export type SupplyLevelStatus = 'adequate' | 'low' | 'critical' | 'out_of_stock';

export interface MedicineSupplyAnalysis {
  medicineId: number;
  medicineName: string;
  dose: string;
  currentSupply: number;
  initialSupply: number;
  supplyUnit: string;
  refillThreshold: number;
  dailyDoseCount: number;
  daysRemaining: number;
  percentageRemaining: number;
  status: SupplyLevelStatus;
  statusLabel: string;
  clinicName: string;
  clinicPhone: string;
  healthWorkerName: string;
  healthWorkerPhone: string;
  lastRefillRequestDate?: string;
  lastRefillDate?: string;
}

export interface RefillSmsRequest {
  patientId: number;
  patientName: string;
  patientPhone?: string;
  patientCode?: string;
  village?: string;
  medicine: Medicine;
  recipientType: 'clinic' | 'health_worker' | 'doctor' | 'custom';
  recipientName: string;
  recipientPhone: string;
  additionalNotes?: string;
  isDemoMode?: boolean;
}

export interface RefillSmsResult {
  success: boolean;
  messageId: string;
  smsResult: TwilioSmsResult;
  deviceSmsUrl: string;
  messageText: string;
  recipientPhone: string;
  recipientName: string;
  timestamp: string;
}

class MedicationSupplyService {
  private static instance: MedicationSupplyService;

  public static getInstance(): MedicationSupplyService {
    if (!MedicationSupplyService.instance) {
      MedicationSupplyService.instance = new MedicationSupplyService();
    }
    return MedicationSupplyService.instance;
  }

  /**
   * Estimate daily dosage count based on frequency or times array
   */
  public estimateDailyDoseCount(medicine: Partial<Medicine>): number {
    if (medicine.dailyDoseCount && medicine.dailyDoseCount > 0) {
      return medicine.dailyDoseCount;
    }

    if (Array.isArray(medicine.times) && medicine.times.length > 0) {
      return medicine.times.length;
    }

    const freq = (medicine.frequency || '').toLowerCase();
    if (freq.includes('four') || freq.includes('4 times') || freq.includes('qid')) return 4;
    if (freq.includes('thrice') || freq.includes('3 times') || freq.includes('tid')) return 3;
    if (freq.includes('twice') || freq.includes('2 times') || freq.includes('bid')) return 2;
    if (freq.includes('once') || freq.includes('1 time') || freq.includes('qd') || freq.includes('od')) return 1;
    if (freq.includes('alternate') || freq.includes('every other')) return 0.5;

    // Check morning/afternoon/night toggles
    let count = 0;
    if (medicine.morning) count++;
    if (medicine.afternoon) count++;
    if (medicine.night) count++;

    return count > 0 ? count : 1;
  }

  /**
   * Analyze supply health for a medicine
   */
  public analyzeSupply(medicine: Medicine): MedicineSupplyAnalysis {
    const medicineId = medicine.id || 0;
    const initialSupply = medicine.initialSupply && medicine.initialSupply > 0 ? medicine.initialSupply : 30;
    const currentSupply = typeof medicine.currentSupply === 'number' ? Math.max(0, medicine.currentSupply) : 10;
    const refillThreshold = medicine.refillThreshold && medicine.refillThreshold > 0 ? medicine.refillThreshold : 5;
    const supplyUnit = medicine.supplyUnit || 'tablets';
    const dailyDose = this.estimateDailyDoseCount(medicine);

    const daysRemaining = dailyDose > 0 ? Math.floor(currentSupply / dailyDose) : currentSupply;
    const percentageRemaining = Math.min(100, Math.max(0, Math.round((currentSupply / initialSupply) * 100)));

    let status: SupplyLevelStatus = 'adequate';
    let statusLabel = 'Supply Adequate';

    if (currentSupply <= 0) {
      status = 'out_of_stock';
      statusLabel = 'Out of Stock';
    } else if (currentSupply <= 2 || daysRemaining <= 2) {
      status = 'critical';
      statusLabel = 'Critical Low Supply';
    } else if (currentSupply <= refillThreshold || daysRemaining <= 5) {
      status = 'low';
      statusLabel = 'Low Supply Alert';
    }

    return {
      medicineId,
      medicineName: medicine.name,
      dose: medicine.dose,
      currentSupply,
      initialSupply,
      supplyUnit,
      refillThreshold,
      dailyDoseCount: dailyDose,
      daysRemaining,
      percentageRemaining,
      status,
      statusLabel,
      clinicName: medicine.clinicName || 'Kodaikanal Primary Health Centre (PHC)',
      clinicPhone: medicine.clinicPhone || '+919800001111',
      healthWorkerName: medicine.healthWorkerName || 'ASHA Worker Anjali Sharma',
      healthWorkerPhone: medicine.healthWorkerPhone || '+919876543210',
      lastRefillRequestDate: medicine.lastRefillRequestDate,
      lastRefillDate: medicine.lastRefillDate,
    };
  }

  /**
   * Ensures all active medicines have populated supply fields.
   * If a medicine was created without supply fields, this provides smart defaults.
   */
  public async ensureSupplyMetadata(patientId: number): Promise<Medicine[]> {
    const meds = await db.medicines.where('patientId').equals(patientId).toArray();
    let updatedAny = false;

    for (const med of meds) {
      if (typeof med.currentSupply !== 'number' || !med.refillThreshold) {
        const daily = this.estimateDailyDoseCount(med);
        const defaultSupply = 14 * daily; // 2 weeks supply default
        const defaultThreshold = Math.max(3, Math.round(5 * daily)); // 5 days supply threshold

        const updates: Partial<Medicine> = {
          currentSupply: typeof med.currentSupply === 'number' ? med.currentSupply : defaultSupply,
          initialSupply: med.initialSupply || 30,
          refillThreshold: med.refillThreshold || defaultThreshold,
          supplyUnit: med.supplyUnit || 'tablets',
          dailyDoseCount: daily,
          clinicName: med.clinicName || 'Kodaikanal Primary Health Centre (PHC)',
          clinicPhone: med.clinicPhone || '+919800001111',
          healthWorkerName: med.healthWorkerName || 'ASHA Worker Anjali Sharma',
          healthWorkerPhone: med.healthWorkerPhone || '+919876543210',
        };

        if (med.id) {
          await db.medicines.update(med.id, updates);
          Object.assign(med, updates);
          updatedAny = true;
        }
      }
    }

    return updatedAny ? await db.medicines.where('patientId').equals(patientId).toArray() : meds;
  }

  /**
   * Returns all active medicines running low or out of stock
   */
  public async getLowSupplyMedicines(patientId: number): Promise<MedicineSupplyAnalysis[]> {
    const meds = await this.ensureSupplyMetadata(patientId);
    const activeMeds = meds.filter((m) => m.status === 'active');

    return activeMeds
      .map((m) => this.analyzeSupply(m))
      .filter((analysis) => analysis.status === 'low' || analysis.status === 'critical' || analysis.status === 'out_of_stock')
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Deduct supply when user takes their medicine
   */
  public async decrementSupplyOnTaken(medicineId: number, count: number = 1): Promise<MedicineSupplyAnalysis | null> {
    const med = await db.medicines.get(medicineId);
    if (!med) return null;

    const current = typeof med.currentSupply === 'number' ? med.currentSupply : 10;
    const newSupply = Math.max(0, current - count);

    await db.medicines.update(medicineId, {
      currentSupply: newSupply,
      lastTaken: new Date().toISOString(),
    });

    const updatedMed = { ...med, currentSupply: newSupply };
    const analysis = this.analyzeSupply(updatedMed);

    // If supply has crossed into low or critical, trigger push & in-app notification
    if (analysis.status === 'low' || analysis.status === 'critical' || analysis.status === 'out_of_stock') {
      await this.createLowSupplyNotification(updatedMed, analysis);
      await medicationPushNotificationService.playMedicationAlertAudio(
        analysis.status === 'critical' || analysis.status === 'out_of_stock' ? 'urgent' : 'chime'
      );
    }

    return analysis;
  }

  /**
   * Restock / Refill medication supply
   */
  public async restockMedicine(medicineId: number, addedQuantity: number): Promise<MedicineSupplyAnalysis | null> {
    const med = await db.medicines.get(medicineId);
    if (!med) return null;

    const current = typeof med.currentSupply === 'number' ? med.currentSupply : 0;
    const newSupply = current + addedQuantity;
    const now = new Date().toISOString();

    await db.medicines.update(medicineId, {
      currentSupply: newSupply,
      initialSupply: Math.max(med.initialSupply || 30, newSupply),
      lastRefillDate: now,
    });

    // Record audit log
    await logAuditEvent({
      entityType: 'medicine',
      userId: `PAT-${med.patientId}`,
      userName: `Patient ${med.patientId}`,
      userRole: 'patient',
      action: 'MEDICINE_RESTOCKED',
      details: `Restocked ${med.name} by +${addedQuantity} ${med.supplyUnit || 'tablets'}. New balance: ${newSupply}.`,
    }).catch(console.error);

    return this.analyzeSupply({ ...med, currentSupply: newSupply, lastRefillDate: now });
  }

  /**
   * Update supply configuration (e.g. adjust stock or threshold)
   */
  public async updateSupplyConfig(
    medicineId: number,
    data: {
      currentSupply?: number;
      initialSupply?: number;
      refillThreshold?: number;
      supplyUnit?: string;
      clinicName?: string;
      clinicPhone?: string;
      healthWorkerName?: string;
      healthWorkerPhone?: string;
    }
  ): Promise<MedicineSupplyAnalysis | null> {
    await db.medicines.update(medicineId, data);
    const updated = await db.medicines.get(medicineId);
    return updated ? this.analyzeSupply(updated) : null;
  }

  /**
   * Create an in-app notification and native browser alert if supply is low
   */
  public async createLowSupplyNotification(medicine: Medicine, analysis: MedicineSupplyAnalysis): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Check if an alert was already logged today for this medicine
    const existing = await db.notifications
      .where('userId')
      .equals(medicine.patientId)
      .toArray();

    const alreadyNotifiedToday = existing.some(
      (n) => n.createdAt.startsWith(today) && n.message.includes(medicine.name) && n.message.includes('Refill')
    );

    if (alreadyNotifiedToday) return;

    const urgencyEmoji = analysis.status === 'out_of_stock' ? '🚨' : analysis.status === 'critical' ? '⚠️' : '🔔';
    const messageEn = `${urgencyEmoji} Low Supply Alert: ${medicine.name} has only ${analysis.currentSupply} ${analysis.supplyUnit} left (~${analysis.daysRemaining} days remaining). Please request a refill from ${analysis.clinicName || 'your primary clinic'}.`;
    const messageHi = `${urgencyEmoji} दवा की कमी चेतावनी: ${medicine.name} में केवल ${analysis.currentSupply} गोलियां बची हैं (~${analysis.daysRemaining} दिन)। कृपया स्वास्थ्य केंद्र से तुरंत रिफिल का अनुरोध करें।`;
    const messageTa = `${urgencyEmoji} மருந்து இருப்பு எச்சரிக்கை: ${medicine.name} மருந்தில் ${analysis.currentSupply} மட்டுமே மீதமுள்ளது (~${analysis.daysRemaining} நாட்கள்). உங்கள் ஆரம்ப சுகாதார நிலையத்தை தொடர்பு கொள்ளவும்.`;

    const notificationRecord: Notification = {
      userId: medicine.patientId,
      userRole: 'patient',
      type: 'medicine',
      message: messageEn,
      messageHi,
      messageTa,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await db.notifications.add(notificationRecord);

    // Browser Notification API if enabled
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Medora: ${medicine.name} Low Supply`, {
          body: `Only ${analysis.currentSupply} ${analysis.supplyUnit} left (~${analysis.daysRemaining} days). Request refill now.`,
          icon: '/favicon.ico',
        });
      } catch {}
    }
  }

  /**
   * Run full check of all patient medications and alert user
   */
  public async checkAndNotifyAllLowSupplies(patientId: number): Promise<{
    lowSupplies: MedicineSupplyAnalysis[];
    alertCount: number;
  }> {
    const lowSupplies = await this.getLowSupplyMedicines(patientId);

    for (const item of lowSupplies) {
      const med = await db.medicines.get(item.medicineId);
      if (med) {
        await this.createLowSupplyNotification(med, item);
      }
    }

    if (lowSupplies.length > 0) {
      await medicationPushNotificationService.playMedicationAlertAudio(
        lowSupplies.some((s) => s.status === 'critical' || s.status === 'out_of_stock') ? 'urgent' : 'chime'
      );
    }

    return {
      lowSupplies,
      alertCount: lowSupplies.length,
    };
  }

  /**
   * Generates formatted SMS text for the refill request
   */
  public buildRefillSmsMessage(req: RefillSmsRequest, analysis: MedicineSupplyAnalysis): string {
    const patientName = req.patientName || `Patient #${req.patientId}`;
    const patientPhone = req.patientPhone ? ` | Ph: ${req.patientPhone}` : '';
    const village = req.village ? ` | Village: ${req.village}` : '';
    const patientCode = req.patientCode ? ` [${req.patientCode}]` : '';

    const lines = [
      `MEDORA PRESCRIPTION REFILL REQUEST`,
      `Patient: ${patientName}${patientCode}${village}${patientPhone}`,
      `Medication: ${analysis.medicineName} (${analysis.dose})`,
      `Remaining Stock: ${analysis.currentSupply} ${analysis.supplyUnit} (~${analysis.daysRemaining} days left)`,
      `Prescribed by: ${req.medicine.doctor || 'Primary Doctor'}`,
    ];

    if (req.additionalNotes && req.additionalNotes.trim()) {
      lines.push(`Notes: ${req.additionalNotes.trim()}`);
    }

    lines.push(`Please prepare or dispatch refill pack. Thank you.`);

    return lines.join('\n');
  }

  /**
   * Quick 'Request Refill' action: Sends SMS to Primary Clinic or Health Worker
   */
  public async sendRefillSmsRequest(req: RefillSmsRequest): Promise<RefillSmsResult> {
    const analysis = this.analyzeSupply(req.medicine);
    const messageText = this.buildRefillSmsMessage(req, analysis);
    const now = new Date().toISOString();

    // 1. Send SMS via Twilio / Server SMS Gateway
    const twilioResult = await twilioSmsService.sendSms({
      to: req.recipientPhone,
      message: messageText,
      patientId: req.patientId,
      alertType: 'MEDICINE_REFILL',
      senderId: 'MEDORA',
      isDemoMode: req.isDemoMode,
    });

    // 2. Update medicine record with lastRefillRequestDate
    if (req.medicine.id) {
      await db.medicines.update(req.medicine.id, {
        lastRefillRequestDate: now,
      });
    }

    // 3. Create in-app audit record & notification
    await db.notifications.add({
      userId: req.patientId,
      userRole: 'patient',
      type: 'medicine',
      message: `✓ Refill request SMS dispatched to ${req.recipientName} (${req.recipientPhone}) for ${req.medicine.name}.`,
      isRead: false,
      createdAt: now,
    });

    await logAuditEvent({
      entityType: 'medicine',
      userId: `PAT-${req.patientId}`,
      userName: req.patientName || `Patient ${req.patientId}`,
      userRole: 'patient',
      action: 'REFILL_SMS_REQUESTED',
      details: `Dispatched Refill SMS for ${req.medicine.name} to ${req.recipientName} (${req.recipientPhone}). Status: ${twilioResult.status}.`,
    }).catch(console.error);

    // 4. Construct native device SMS fallback URL (E.g. sms:+919876543210?body=...)
    const cleanPhone = req.recipientPhone.replace(/[^0-9+]/g, '');
    const deviceSmsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`;

    return {
      success: twilioResult.success,
      messageId: twilioResult.messageId,
      smsResult: twilioResult,
      deviceSmsUrl,
      messageText,
      recipientPhone: req.recipientPhone,
      recipientName: req.recipientName,
      timestamp: now,
    };
  }
}

export const medicationSupplyService = MedicationSupplyService.getInstance();
