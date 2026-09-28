import { db, HealthTest, MedicalRecord } from '../../db/db';

export interface VitalStatus {
  metric: string;
  status: 'normal' | 'borderline' | 'attention';
  value: string;
  note: string;
}

export interface WeeklyHealthInsight {
  id?: string;
  patientId: number;
  patientName: string;
  generatedAt: string;
  periodLabel: string;
  headline: string;
  summary: string;
  vitalsAssessment: VitalStatus[];
  symptomTrajectory: string;
  recommendations: string[];
  riskLevel: 'LOW' | 'MODERATE' | 'ATTENTION_NEEDED';
  redFlags: string[];
  modelUsed: string;
}

export class HealthInsightService {
  /**
   * Generates a weekly health insight summary for the specified patient based on
   * recorded symptoms (db.medicalRecords) and completed health tests (db.healthTests).
   */
  public async generateWeeklyInsight(
    patientId: number,
    patientName: string,
    language: string = 'en',
    forceRefresh: boolean = false
  ): Promise<WeeklyHealthInsight> {
    const cacheKey = `medora_weekly_insight_${patientId}_${language}`;

    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as WeeklyHealthInsight;
          const ageHours = (Date.now() - new Date(parsed.generatedAt).getTime()) / (1000 * 60 * 60);
          // Reuse cache if generated within last 12 hours
          if (ageHours < 12) {
            return parsed;
          }
        }
      } catch {}
    }

    // 1. Fetch recent symptom records (past 14 days)
    const records = await db.medicalRecords.where('patientId').equals(patientId).toArray();
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - 14);

    const recentRecords = records.filter((r) => {
      const d = new Date(r.date);
      return !isNaN(d.getTime()) && d >= cutoffDate;
    });

    const reportedSymptoms: string[] = [];
    const severities: string[] = [];

    recentRecords.forEach((r) => {
      const data = (r.data || {}) as any;
      if (Array.isArray(data.symptoms)) {
        reportedSymptoms.push(...data.symptoms);
      } else if (data.chiefComplaint) {
        reportedSymptoms.push(data.chiefComplaint);
      }
      if (data.severity) {
        severities.push(data.severity);
      }
    });

    // 2. Fetch completed health tests
    const healthTests = await db.healthTests.where('patientId').equals(patientId).reverse().limit(10).toArray();

    // Try calling server AI route if online
    try {
      const response = await fetch('/api/health-insights/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          patientName,
          language,
          reportedSymptoms,
          severities,
          healthTests,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.summary) {
          const insight: WeeklyHealthInsight = {
            ...data,
            patientId,
            patientName,
            generatedAt: new Date().toISOString(),
          };
          this.cacheInsight(cacheKey, insight);
          return insight;
        }
      }
    } catch {}

    // Local deterministic clinical engine fallback (100% offline-ready)
    const localInsight = this.buildLocalInsight(
      patientId,
      patientName,
      reportedSymptoms,
      severities,
      healthTests,
      language
    );

    this.cacheInsight(cacheKey, localInsight);
    return localInsight;
  }

  private cacheInsight(key: string, insight: WeeklyHealthInsight) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(insight));
      } catch {}
    }
  }

  private buildLocalInsight(
    patientId: number,
    patientName: string,
    symptoms: string[],
    severities: string[],
    tests: HealthTest[],
    language: string
  ): WeeklyHealthInsight {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const periodLabel = `${lastWeek.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Analyze vitals
    const vitalsAssessment: VitalStatus[] = [];
    let hasAbnormalVital = false;

    tests.forEach((t) => {
      const val = parseFloat(t.value);
      if (t.type === 'blood_pressure') {
        const [sys, dia] = t.value.split('/').map(Number);
        if (sys >= 140 || dia >= 90) {
          vitalsAssessment.push({
            metric: 'Blood Pressure',
            status: 'attention',
            value: `${t.value} ${t.unit}`,
            note: 'Stage 1/2 hypertension range. Monitor daily and reduce salt intake.',
          });
          hasAbnormalVital = true;
        } else if (sys >= 120 || dia >= 80) {
          vitalsAssessment.push({
            metric: 'Blood Pressure',
            status: 'borderline',
            value: `${t.value} ${t.unit}`,
            note: 'Pre-hypertension range. Regular walking and hydration advised.',
          });
        } else {
          vitalsAssessment.push({
            metric: 'Blood Pressure',
            status: 'normal',
            value: `${t.value} ${t.unit}`,
            note: 'Within optimal clinical target (<120/80 mmHg).',
          });
        }
      } else if (t.type === 'blood_sugar') {
        if (val > 180) {
          vitalsAssessment.push({
            metric: 'Blood Sugar',
            status: 'attention',
            value: `${t.value} ${t.unit}`,
            note: 'Elevated post-meal blood glucose. Check dietary carbohydrate intake and consult doctor.',
          });
          hasAbnormalVital = true;
        } else if (val > 140) {
          vitalsAssessment.push({
            metric: 'Blood Sugar',
            status: 'borderline',
            value: `${t.value} ${t.unit}`,
            note: 'Slightly high post-prandial level. Consistent meal timing recommended.',
          });
        } else {
          vitalsAssessment.push({
            metric: 'Blood Sugar',
            status: 'normal',
            value: `${t.value} ${t.unit}`,
            note: 'Within normal physiological range (70–140 mg/dL).',
          });
        }
      } else if (t.type === 'spo2') {
        if (val < 95) {
          vitalsAssessment.push({
            metric: 'Blood Oxygen (SpO2)',
            status: 'attention',
            value: `${t.value} ${t.unit}`,
            note: 'Sub-optimal oxygen saturation. Immediate clinician review required if accompanied by breathlessness.',
          });
          hasAbnormalVital = true;
        } else {
          vitalsAssessment.push({
            metric: 'Blood Oxygen (SpO2)',
            status: 'normal',
            value: `${t.value} ${t.unit}`,
            note: 'Healthy pulmonary oxygenation (≥95%).',
          });
        }
      } else if (t.type === 'temperature') {
        if (val > 100.4) {
          vitalsAssessment.push({
            metric: 'Body Temperature',
            status: 'attention',
            value: `${t.value} ${t.unit}`,
            note: 'Active fever. Rest, cool sponging, and paracetamol if prescribed.',
          });
          hasAbnormalVital = true;
        } else {
          vitalsAssessment.push({
            metric: 'Body Temperature',
            status: 'normal',
            value: `${t.value} ${t.unit}`,
            note: 'Afebrile, normal body temperature.',
          });
        }
      }
    });

    if (vitalsAssessment.length === 0) {
      vitalsAssessment.push({
        metric: 'General Vitals',
        status: 'normal',
        value: 'Baseline',
        note: 'No abnormal acute physiological fluctuations recorded in the test log.',
      });
    }

    // Analyze symptoms
    const uniqueSymptoms = Array.from(new Set(symptoms.filter(Boolean)));
    const hasSevereSymptom = severities.some((s) => s === 'Severe' || s === 'Critical');

    let riskLevel: 'LOW' | 'MODERATE' | 'ATTENTION_NEEDED' = 'LOW';
    if (hasSevereSymptom || hasAbnormalVital) {
      riskLevel = 'ATTENTION_NEEDED';
    } else if (uniqueSymptoms.length > 2 || severities.includes('Moderate')) {
      riskLevel = 'MODERATE';
    }

    const symptomTrajectory =
      uniqueSymptoms.length > 0
        ? `Patient experienced episodes of ${uniqueSymptoms.slice(0, 3).join(', ')}${
            hasSevereSymptom ? ' with notable peak severity' : ' generally trending towards stability'
          }.`
        : 'Zero acute clinical symptom exacerbations reported in recent days; health profile is clinically stable.';

    const headline =
      riskLevel === 'ATTENTION_NEEDED'
        ? 'Active Health Vigilance Recommended: Notable Vitals & Symptom Episodes'
        : riskLevel === 'MODERATE'
        ? 'Moderate Weekly Symptom Activity: Continued Hydration & Rest Advised'
        : 'Stable Weekly Health Overview: Vitals & Symptoms Within Healthy Margins';

    const summary = `${patientName}'s 7-day health trend demonstrates ${
      riskLevel === 'LOW'
        ? 'consistent physiological stability with well-controlled vitals.'
        : riskLevel === 'MODERATE'
        ? 'mild-to-moderate symptom fluctuations requiring routine adherence and rest.'
        : 'elevated clinical indicators that should be reviewed during the next PHC checkup or doctor consult.'
    } Regular monitoring of blood pressure, blood glucose, and prescribed medications remains critical for preventive care in the rural Kodaikanal region.`;

    const recommendations = [
      'Maintain daily hydration with 2.5 to 3 liters of boiled, safe drinking water or tender coconut water.',
      'Take all prescribed morning and evening medications consistently on time with meals.',
      'Check blood pressure and blood sugar at the local Health Sub-centre / ASHA post once every 10–14 days.',
      'Engage in 20–30 minutes of gentle morning walking in clean air, avoiding midday heat.',
    ];

    const redFlags = [
      'Sudden persistent chest heaviness radiating to left shoulder',
      'High fever (>102°F) accompanied by shivering or confusion',
      'Sudden shortness of breath or SpO2 dropping below 94%',
    ];

    return {
      patientId,
      patientName,
      generatedAt: new Date().toISOString(),
      periodLabel,
      headline,
      summary,
      vitalsAssessment,
      symptomTrajectory,
      recommendations,
      riskLevel,
      redFlags,
      modelUsed: 'medora-clinical-insight-engine-v2',
    };
  }
}

export const healthInsightService = new HealthInsightService();
