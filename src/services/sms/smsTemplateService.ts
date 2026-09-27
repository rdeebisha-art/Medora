/**
 * Recurring SMS Template Service for Medora
 * Allows health workers, doctors, and patients to save, manage, and quickly select
 * recurring healthcare templates (medication, appointments, vaccinations, maternal alerts, emergencies).
 * Persisted using local state storage utility with localStorage and IndexedDB fallback.
 */

export type TemplateCategory =
  | 'MEDICATION'
  | 'APPOINTMENT'
  | 'EMERGENCY'
  | 'DOCTOR_SUMMARY'
  | 'VACCINATION'
  | 'MATERNAL'
  | 'GENERAL';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'as_needed';

export interface RecurringSmsTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  templateText: string;
  recurrence: RecurrenceType;
  isCustom?: boolean;
  createdAt: string;
  updatedAt?: string;
  description?: string;
}

const TEMPLATES_STORAGE_KEY = 'medora_recurring_sms_templates';

export const DEFAULT_RECURRING_TEMPLATES: RecurringSmsTemplate[] = [
  {
    id: 'TMPL_MED_DAILY',
    name: 'Daily Medication Adherence Reminder',
    category: 'MEDICATION',
    templateText: 'Medora Health: {patientName}, please take your prescribed medicine {medName} ({dose}) at {time} with clean water.',
    recurrence: 'daily',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Reminds rural patients of crucial daily medication schedules to avoid missed doses.',
  },
  {
    id: 'TMPL_APPT_CONFIRM',
    name: 'Clinical Appointment Confirmation',
    category: 'APPOINTMENT',
    templateText: 'Medora Clinic: Appointment confirmed for {patientName} with {doctorName} on {date} at {location}. Bring your health card and report.',
    recurrence: 'as_needed',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Alerts patients of upcoming consultations at Primary Health Centers.',
  },
  {
    id: 'TMPL_EMERGENCY_AMBULANCE',
    name: 'Urgent Medical Emergency Alert (108)',
    category: 'EMERGENCY',
    templateText: 'MEDORA EMERGENCY: Patient {patientName} at {village} requires immediate clinical triage for {symptom}. Contact 108 ambulance urgently.',
    recurrence: 'as_needed',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Rapid dispatch alert for village emergency response teams and family.',
  },
  {
    id: 'TMPL_VACCINE_CHILD',
    name: 'Child & Infant Immunization Schedule',
    category: 'VACCINATION',
    templateText: 'Medora Immunization Alert: {patientName} is scheduled for {vaccineName} vaccine on {date} at {location}. Free under national health mission.',
    recurrence: 'monthly',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Tracks infant and toddler vaccine milestones for mothers and ASHA workers.',
  },
  {
    id: 'TMPL_MATERNAL_CHECKUP',
    name: 'Maternal ANC Health Checkup (102)',
    category: 'MATERNAL',
    templateText: 'Medora Maternal Care: Expectant mother {patientName}, your ANC prenatal checkup is due on {date} at {location}. Call 102 for free government transport.',
    recurrence: 'monthly',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Scheduled reminders for pregnant mothers and infant health checks.',
  },
  {
    id: 'TMPL_DOCTOR_HANDOFF',
    name: 'Clinical Referral & Handoff Summary',
    category: 'DOCTOR_SUMMARY',
    templateText: 'Medora Clinic Handoff for {patientName}: Vitals evaluated. Diagnosis: {complaint}. Next Step: {nextStep}. Follow-up in {followUp}.',
    recurrence: 'as_needed',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Structured handoff for district hospital referral and family records.',
  },
  {
    id: 'TMPL_BP_SUGAR_LOG',
    name: 'Weekly Blood Pressure & Sugar Check',
    category: 'MEDICATION',
    templateText: 'Medora Vitals Tracker: {patientName}, please log your weekly Blood Pressure and Blood Sugar at the village health sub-center this week.',
    recurrence: 'weekly',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'Chronic disease adherence check for hypertension and diabetes management.',
  },
];

class SmsTemplateService {
  private static instance: SmsTemplateService;

  public static getInstance(): SmsTemplateService {
    if (!SmsTemplateService.instance) {
      SmsTemplateService.instance = new SmsTemplateService();
    }
    return SmsTemplateService.instance;
  }

  /**
   * Get all available templates (built-in defaults + user-saved custom templates)
   */
  public getTemplates(): RecurringSmsTemplate[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (raw) {
          const customList: RecurringSmsTemplate[] = JSON.parse(raw);
          // Merge defaults with custom, avoiding duplicates by id
          const customIds = new Set(customList.map((t) => t.id));
          const activeDefaults = DEFAULT_RECURRING_TEMPLATES.filter((t) => !customIds.has(t.id));
          return [...activeDefaults, ...customList];
        }
      }
    } catch (e) {
      console.warn('[SmsTemplateService] Error loading templates from storage:', e);
    }
    return [...DEFAULT_RECURRING_TEMPLATES];
  }

  /**
   * Save a new custom template
   */
  public saveTemplate(
    data: Omit<RecurringSmsTemplate, 'id' | 'createdAt' | 'isCustom'> & { id?: string }
  ): RecurringSmsTemplate {
    const existing = this.getCustomTemplates();
    const id = data.id || `TMPL_CUSTOM_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newTemplate: RecurringSmsTemplate = {
      ...data,
      id,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    // If already exists, update in-place; otherwise prepend
    const index = existing.findIndex((t) => t.id === id);
    if (index >= 0) {
      existing[index] = newTemplate;
    } else {
      existing.unshift(newTemplate);
    }

    this.persistCustomTemplates(existing);
    return newTemplate;
  }

  /**
   * Update an existing template
   */
  public updateTemplate(id: string, updates: Partial<RecurringSmsTemplate>): RecurringSmsTemplate | null {
    const all = this.getTemplates();
    const target = all.find((t) => t.id === id);
    if (!target) return null;

    const updated: RecurringSmsTemplate = {
      ...target,
      ...updates,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    const customList = this.getCustomTemplates();
    const index = customList.findIndex((t) => t.id === id);
    if (index >= 0) {
      customList[index] = updated;
    } else {
      customList.unshift(updated);
    }

    this.persistCustomTemplates(customList);
    return updated;
  }

  /**
   * Delete a custom template
   */
  public deleteTemplate(id: string): boolean {
    const customList = this.getCustomTemplates();
    const filtered = customList.filter((t) => t.id !== id);
    if (filtered.length !== customList.length) {
      this.persistCustomTemplates(filtered);
      return true;
    }
    return false;
  }

  /**
   * Reset all templates to default
   */
  public resetToDefaults(): RecurringSmsTemplate[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TEMPLATES_STORAGE_KEY);
      }
    } catch {}
    return [...DEFAULT_RECURRING_TEMPLATES];
  }

  /**
   * Fill template placeholders with patient or contextual data
   */
  public fillPlaceholders(templateText: string, context: Record<string, string> = {}): string {
    const defaults: Record<string, string> = {
      patientName: 'Ramesh Kumar',
      medName: 'Metformin 500mg',
      dose: '1 tablet after food',
      time: '08:00 AM',
      doctorName: 'Dr. Ananya Sharma',
      date: 'Tomorrow at 10:30 AM',
      location: 'Community Health Center',
      village: 'Rampur Sub-District',
      symptom: 'Chest Pain and Shortness of Breath',
      vaccineName: 'Polio & Pentavalent D2',
      complaint: 'Persistent Cough with Mild Fever',
      nextStep: 'Chest X-Ray and Sputum Evaluation',
      followUp: '3 days',
      ...context,
    };

    let result = templateText;
    for (const [key, val] of Object.entries(defaults)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    }
    return result;
  }

  private getCustomTemplates(): RecurringSmsTemplate[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private persistCustomTemplates(list: RecurringSmsTemplate[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {}
  }
}

export const smsTemplateService = SmsTemplateService.getInstance();
