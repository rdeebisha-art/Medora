import { activeSmsProvider } from './smsProvider';
import { SmsSendPayload, SmsResponseData } from './smsStatus';

export interface IndianSmsTemplate {
  id: string;
  name: string;
  templateText: string;
  category: 'MEDICATION' | 'APPOINTMENT' | 'EMERGENCY' | 'DOCTOR_SUMMARY' | 'VACCINATION';
}

export const APPROVED_INDIAN_TEMPLATES: IndianSmsTemplate[] = [
  {
    id: 'TMPL_MED_ALERT',
    name: 'Medication Adherence Alert',
    templateText: 'Medora Health: {patientName}, your medicine {medName} ({dose}) is due at {time}. Please take with water.',
    category: 'MEDICATION',
  },
  {
    id: 'TMPL_APPT_REMINDER',
    name: 'Appointment Reminder',
    templateText: 'Medora Health: Appointment confirmed with {doctorName} on {date}. Location: {location}. Please bring previous records.',
    category: 'APPOINTMENT',
  },
  {
    id: 'TMPL_EMERGENCY_ALERT',
    name: 'Emergency Medical Alert',
    templateText: 'MEDORA EMERGENCY: Patient {patientName} reported emergency ({symptom}) at {village}. Contact immediate medical aid or 108.',
    category: 'EMERGENCY',
  },
  {
    id: 'TMPL_DOCTOR_SUMMARY',
    name: 'Doctor Handoff Summary',
    templateText: 'Medora Clinic Summary for {patientName}: Complaint: {complaint}. Next Step: {nextStep}. Follow up: {followUp}.',
    category: 'DOCTOR_SUMMARY',
  },
];

export class SmsService {
  public async sendSms(payload: SmsSendPayload): Promise<SmsResponseData> {
    return activeSmsProvider.send(payload);
  }

  public async getMessageStatus(messageId: string): Promise<SmsResponseData | null> {
    return activeSmsProvider.getStatus(messageId);
  }

  public async getOutboxLogs(): Promise<SmsResponseData[]> {
    return activeSmsProvider.getHistory();
  }
}

export const smsService = new SmsService();
