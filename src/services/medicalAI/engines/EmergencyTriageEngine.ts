/**
 * Medora Emergency Triage Engine
 *
 * Deterministic triage rule engine prioritizing clinical safety.
 * Evaluates patient symptoms and vitals for acute red-flag criteria
 * to trigger immediate hospital/emergency dispatch advice.
 */

import { EmergencyTriageInput, EmergencyTriageResult, ClinicalUrgencyLevel } from './mlInterfaces';

export class EmergencyTriageEngine {
  public static evaluateTriage(input: EmergencyTriageInput): EmergencyTriageResult {
    const raw = (input.patientStatement || '').toLowerCase();
    const flags: string[] = [];

    // 1. Respiratory emergencies
    if (
      /\b(cannot breathe|can't breathe|choking|gasping|severe breathlessness|blue lips|gasping for air)\b/i.test(raw) ||
      /(மூச்சு விட முடியவில்லை|மூச்சுத்திணறல்|सांस नहीं आ रही|శ్వాస ఆడటం లేదు|ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല|ಉಸಿರಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ)/.test(raw)
    ) {
      flags.push('Respiratory distress: Inability to breathe or severe dyspnea');
    }
    if (input.vitalSigns?.spo2 && input.vitalSigns.spo2 < 90) {
      flags.push(`Critical hypoxemia: SpO2 ${input.vitalSigns.spo2}% (<90%)`);
    }

    // 2. Cardiovascular emergencies
    if (
      /\b(severe chest pain|crushing chest pain|chest tightness radiating|heart attack)\b/i.test(raw) ||
      /(கடுமையான நெஞ்சு வலி|सीने में तेज दर्द|గుండె నొప్పి|നെഞ്ചുവേദന|ಎದೆ ನೋವು)/.test(raw)
    ) {
      flags.push('Cardiac alert: Acute crushing chest pain / suspected acute coronary syndrome');
    }
    if (input.vitalSigns?.systolicBp && input.vitalSigns.systolicBp > 190) {
      flags.push(`Hypertensive crisis: Systolic BP ${input.vitalSigns.systolicBp} mmHg`);
    }

    // 3. Neurological emergencies (Stroke / F.A.S.T / Seizure)
    if (
      /\b(slurred speech|face drooping|sudden paralysis|arm weakness|loss of consciousness|seizure|convulsions|fits)\b/i.test(raw) ||
      /(மயக்கம்|வலிப்பு|बेहोश|दौरा|మూర్ఛ|ഫിറ്റ്സ്)/.test(raw)
    ) {
      flags.push('Neurological emergency: Altered consciousness, convulsions, or stroke indicators');
    }

    // 4. Hemorrhage / Shock
    if (
      /\b(coughing blood|vomiting blood|severe bleeding|uncontrolled bleeding|blood in stool)\b/i.test(raw) ||
      /(இரத்தப்போக்கு|खून की उल्टी|రక్తం వాంతులు)/.test(raw)
    ) {
      flags.push('Acute hemorrhage: Severe or gastrointestinal bleeding');
    }

    // 5. Pediatric / Maternity red flags
    if (input.isChild && /\b(lethargic|inability to drink|inconsolable crying|sunken eyes)\b/i.test(raw)) {
      flags.push('Pediatric red flag: Inability to feed or severe dehydration');
    }
    if (input.isPregnant && /\b(heavy bleeding|severe headache with blurry vision|fluid leaking)\b/i.test(raw)) {
      flags.push('Obstetric emergency: Severe bleeding or pre-eclampsia signs in pregnancy');
    }

    const isEmergency = flags.length > 0;
    const urgencyLevel: ClinicalUrgencyLevel = isEmergency
      ? 'CRITICAL_EMERGENCY'
      : (/\b(high fever|persistent vomiting|severe pain)\b/i.test(raw) ? 'URGENT_EVALUATION' : 'ROUTINE_CARE');

    const recommendedAction = isEmergency
      ? 'Immediate emergency medical dispatch required. Call 108 (Ambulance) or proceed to nearest emergency department.'
      : urgencyLevel === 'URGENT_EVALUATION'
      ? 'Same-day clinical evaluation recommended with a physician or primary health center.'
      : 'Routine clinical consultation and health tracking.';

    const dispatchAdvice = isEmergency
      ? 'Do not delay transport. Keep the patient calm, ensure clear airway, and dial 108 or local emergency services immediately.'
      : 'Maintain hydration, monitor vital signs, and consult your healthcare provider if symptoms persist.';

    return {
      engine: 'MedoraEmergencyTriageEngine',
      urgencyLevel,
      isEmergency,
      activeRedFlags: flags,
      recommendedAction,
      dispatchAdvice,
      timestamp: new Date().toISOString(),
    };
  }
}
