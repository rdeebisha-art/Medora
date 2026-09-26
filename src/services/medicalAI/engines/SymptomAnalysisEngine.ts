/**
 * Medora Symptom Analysis Engine
 *
 * Modular clinical symptom analyzer.
 * Extracts symptom entities, duration, severity, and flags potential
 * differential considerations while enforcing strict clinical safety.
 */

import {
  SymptomAnalysisInput,
  SymptomAnalysisResult,
  SymptomEntity,
} from './mlInterfaces';
import { EmergencyTriageEngine } from './EmergencyTriageEngine';
import { UncertaintyEngine } from './UncertaintyEngine';
import { protectMedicalValues } from '../../medicalSafety/medicalValueProtection';

const COMMON_SYMPTOMS_CATALOG = [
  { name: 'Fever', patterns: ['fever', 'high temp', 'chills', 'காய்ச்சல்', 'बुखार', 'జ్వరం', 'പനി', 'ಜ್ವರ'] },
  { name: 'Cough', patterns: ['cough', 'coughing', 'phlegm', 'இருமல்', 'खांसी', 'దగ్గు', 'ചുമ', 'ಕೆಮ್ಮು'] },
  { name: 'Headache', patterns: ['headache', 'migraine', 'head pain', 'தலைவலி', 'सिरदर्द', 'తలనొప్పి', 'തലവേദന', 'ತಲೆನೋವು'] },
  { name: 'Sore throat', patterns: ['sore throat', 'throat pain', 'difficulty swallowing', 'தொண்டை வலி', 'गले में दर्द'] },
  { name: 'Abdominal pain', patterns: ['abdominal pain', 'stomach pain', 'cramps', 'belly pain', 'வயிற்று வலி', 'पेट दर्द', 'కడుపు నొప్పి', 'വയറുവേദന', 'ಹೊಟ್ಟೆ ನೋವು'] },
  { name: 'Chest pain', patterns: ['chest pain', 'chest tightness', 'heaviness in chest', 'நெஞ்சு வலி', 'सीने में दर्द', 'ఛాతీ నొప్పి', 'നെഞ്ചുവേദന', 'ಎದೆ ನೋವು'] },
  { name: 'Dyspnea / Breathlessness', patterns: ['shortness of breath', 'breathless', 'breathing difficulty', 'dyspnea', 'மூச்சுத்திணறல்', 'सांस फूलना', 'శ్వాస ఆడకపోవడం'] },
  { name: 'Nausea & Vomiting', patterns: ['vomiting', 'nausea', 'vomit', 'throwing up', 'வாந்தி', 'उल्टी', 'వాంతులు', 'ഛർദ്ദി'] },
  { name: 'Diarrhea', patterns: ['diarrhea', 'loose stools', 'loose motion', 'வயிற்றுப்போக்கு', 'दस्त', 'విరేచనాలు', 'വയറിളക്കം'] },
  { name: 'Fatigue', patterns: ['fatigue', 'tiredness', 'weakness', 'exhaustion', 'சோர்வு', 'थकान', 'నీరసం', 'ക്ഷീണം'] },
];

export class SymptomAnalysisEngine {
  public static analyzeSymptoms(input: SymptomAnalysisInput): SymptomAnalysisResult {
    const rawText = input.patientInput || '';
    const { protectedText, values } = protectMedicalValues(rawText);

    // 1. Deterministic Emergency check
    const triage = EmergencyTriageEngine.evaluateTriage({
      patientStatement: rawText,
      vitalSigns: {
        temperatureF: input.reportedVitals?.temperature ? parseFloat(input.reportedVitals.temperature) : undefined,
        spo2: input.reportedVitals?.spo2 ? parseFloat(input.reportedVitals.spo2) : undefined,
      },
    });

    // 2. Extract symptom entities
    const extractedSymptoms: SymptomEntity[] = [];
    const lower = rawText.toLowerCase();

    for (const sym of COMMON_SYMPTOMS_CATALOG) {
      for (const pat of sym.patterns) {
        if (lower.includes(pat.toLowerCase())) {
          let severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN' = 'UNKNOWN';
          if (lower.includes('severe') || lower.includes('acute') || lower.includes('extreme') || lower.includes('கடுமையான') || lower.includes('तेज')) {
            severity = 'SEVERE';
          } else if (lower.includes('mild') || lower.includes('slight') || lower.includes('லேசான') || lower.includes('हल्का')) {
            severity = 'MILD';
          } else {
            severity = 'MODERATE';
          }

          extractedSymptoms.push({
            name: sym.name,
            rawMention: pat,
            severity,
          });
          break;
        }
      }
    }

    // 3. Extract duration
    let duration: string | null = input.duration || null;
    if (!duration) {
      const durationMatch = rawText.match(/(\d+\s*(?:days?|hours?|weeks?|months?|நாட்கள்|நாட்களாக|दिन|రోజులు|ദിവസം|ದಿನ))/i);
      if (durationMatch) {
        duration = durationMatch[1];
      }
    }

    // 4. Extract vitals from input or reported vitals
    const extractedVitals: Record<string, string> = { ...(input.reportedVitals || {}) };
    for (const v of values) {
      if (v.type === 'temperature') extractedVitals.temperature = v.original;
      if (v.type === 'blood_pressure') extractedVitals.bloodPressure = v.original;
      if (v.type === 'blood_sugar') extractedVitals.bloodSugar = v.original;
      if (v.type === 'spo2') extractedVitals.spo2 = v.original;
      if (v.type === 'weight') extractedVitals.weight = v.original;
    }

    // 5. Differential Considerations (Provisional only, never definitive)
    const considerations: Array<{
      condition: string;
      supportingClues: string[];
      missingInfo: string[];
      provisionalConfidence: number;
    }> = [];

    const hasFever = extractedSymptoms.some(s => s.name === 'Fever');
    const hasCough = extractedSymptoms.some(s => s.name === 'Cough');
    const hasBreathless = extractedSymptoms.some(s => s.name.includes('Breathlessness'));

    if (hasFever && hasCough && hasBreathless) {
      considerations.push({
        condition: 'Lower Respiratory Tract Infection / Pneumonia',
        supportingClues: ['Fever', 'Cough', 'Dyspnea / Breathlessness'],
        missingInfo: ['Chest Auscultation', 'SpO2 saturation', 'Chest radiograph (requires physician order)'],
        provisionalConfidence: 0.65,
      });
    } else if (hasFever && hasCough) {
      considerations.push({
        condition: 'Acute Upper Respiratory Tract Infection',
        supportingClues: ['Fever', 'Cough'],
        missingInfo: ['Throat exam', 'Temperature curve', 'Hydration status'],
        provisionalConfidence: 0.70,
      });
    } else if (hasFever) {
      considerations.push({
        condition: 'Acute Febrile Illness',
        supportingClues: ['Fever', duration ? `Duration ${duration}` : 'Acute presentation'],
        missingInfo: ['Complete Blood Count', 'Peripheral smear / rapid antigen test', 'Physical examination'],
        provisionalConfidence: 0.60,
      });
    }

    // 6. Calibrated Uncertainty Assessment
    const uncertainty = UncertaintyEngine.calculateUncertainty({
      rawPredictionScore: considerations.length > 0 ? considerations[0].provisionalConfidence : 0.40,
      numReportedSymptoms: extractedSymptoms.length,
      hasVitalMeasurements: Object.keys(extractedVitals).length > 0,
      hasClinicalDuration: Boolean(duration),
      hasPatientHistory: Boolean(input.knownConditions && input.knownConditions.length > 0),
      isAmbiguousQuery: extractedSymptoms.length === 0,
    });

    const chiefComplaint = extractedSymptoms.length > 0
      ? extractedSymptoms.map(s => s.name).join(', ')
      : 'Unspecified symptoms reported';

    return {
      engine: 'MedoraSymptomAnalysisEngine',
      symptoms: extractedSymptoms,
      chiefComplaint,
      extractedDuration: duration,
      extractedVitals,
      possibleConsiderations: considerations,
      redFlags: triage.activeRedFlags,
      requiresEmergencyCare: triage.isEmergency,
      requiresPhysicianReview: true,
      uncertainty,
      timestamp: new Date().toISOString(),
    };
  }
}
