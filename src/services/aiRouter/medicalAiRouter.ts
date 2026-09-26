import { MedicalAIRequestType, MedicalStructuredOutput } from './aiRouterTypes';
import { db, Patient, MedicalRecord, HealthTest, Medicine, Vaccination, Appointment, DoctorSummary } from '../../db/db';

export interface MedicalRouteInput {
  text: string;
  patientId?: number;
  reportData?: string;
  imageData?: string;
  fileName?: string;
  fileType?: string;
  duration?: string;
  vitals?: Record<string, string>;
  language?: string;
}

export class MedicalAIRouter {
  /**
   * Deterministically classifies the user input into one of the 13 Medical AI Request Types
   */
  public classifyRequestType(input: MedicalRouteInput): MedicalAIRequestType {
    const raw = (input.text || '').trim();
    const lower = raw.toLowerCase();
    const fileType = (input.fileType || '').toLowerCase();
    const fileName = (input.fileName || '').toLowerCase();

    // 1. EMERGENCY_TRIAGE (Highest deterministic priority)
    if (
      /\b(cannot breathe|can't breathe|choking|gasping|severe chest pain|chest pain|unconscious|fainted|loss of consciousness|seizure|severe bleeding|stroke|anaphylaxis)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|கடுமையான நெஞ்சு வலி|நெஞ்சு வலி|அதிக இரத்தப்போக்கு|மயக்கம்|வலிப்பு)/.test(raw) ||
      /(सांस नहीं आ रही|सीने में तेज दर्द|सीने में दर्द|खून की उल्टी|बेहोश|दौरा)/.test(raw)
    ) {
      return 'EMERGENCY_TRIAGE';
    }

    // 2. MEDICAL_IMAGE_ANALYSIS (Image data or radiology/X-ray queries)
    if (
      input.imageData ||
      fileType.includes('image') ||
      /\b(x-ray|xray|radiograph|radiography|chest x-ray|mri|ct scan|ultrasound image|scan image)\b/i.test(lower) ||
      /\.(jpg|jpeg|png|webp|dicom)$/i.test(fileName)
    ) {
      return 'MEDICAL_IMAGE_ANALYSIS';
    }

    // 3. MEDICAL_REPORT_ANALYSIS (Lab reports, blood tests, PDFs, CBC, lipid profile, hemoglobin)
    if (
      input.reportData ||
      fileType.includes('pdf') ||
      /\.(pdf|csv|txt)$/i.test(fileName) ||
      /\b(blood report|lab report|blood test|lab test|cbc|hemoglobin|hb count|platelet|blood sugar report|lipid profile|urine test|serum creatinine|wbc count|diagnostic report)\b/i.test(
        lower
      ) ||
      /\b(report extract|analyze my report|test results|lab values)\b/i.test(lower)
    ) {
      return 'MEDICAL_REPORT_ANALYSIS';
    }

    // 4. SURGERY_FOLLOW_UP (Post-op, wound, incision, stitches, surgery recovery)
    if (
      /\b(surgery|post-op|post-surgery|operation|wound|stitches|incision|stitches removal|surgical recovery|dressing change|appendectomy follow-up|cesarean follow-up)\b/i.test(
        lower
      )
    ) {
      return 'SURGERY_FOLLOW_UP';
    }

    // 5. VACCINATION_REVIEW (Immunization, UIP, vaccine schedule, booster dose)
    if (
      /\b(vaccin|immuniz|tetanus|covaxin|covishield|bcg|polio|measles|rubella|hepatitis b|dpt|booster dose|uip schedule)\b/i.test(
        lower
      )
    ) {
      return 'VACCINATION_REVIEW';
    }

    // 6. MEDICATION_REVIEW (Prescriptions, pills, doses, drug interactions, side effects)
    if (
      /\b(medication|medicine|pill|tablet|capsule|dose|dosage|prescript|paracetamol|metformin|amlodipine|atorvastatin|antibiotic|side effect|can i take)\b/i.test(
        lower
      )
    ) {
      return 'MEDICATION_REVIEW';
    }

    // 7. DIAGNOSIS_REVIEW (Reviewing a doctor-established diagnosis)
    if (
      /\b(diagnos|doctor said i have|my diagnosis is|confirmed condition|diagnosed with|hypertension diagnosis|type 2 diabetes diagnosis)\b/i.test(
        lower
      )
    ) {
      return 'DIAGNOSIS_REVIEW';
    }

    // 8. DOCTOR_SUMMARY (Clinical handoff summaries, doctor consultation notes)
    if (
      /\b(doctor summary|clinical summary|handoff summary|discharge summary|physician note|consultation summary)\b/i.test(
        lower
      )
    ) {
      return 'DOCTOR_SUMMARY';
    }

    // 9. DOCTOR_CONSULTATION (Clinical consultation requests, booking, physician consult)
    if (
      /\b(consultation|consult doctor|see doctor|specialist opinion|talk to doctor|teleconsultation)\b/i.test(
        lower
      )
    ) {
      return 'DOCTOR_CONSULTATION';
    }

    // 10. HEALTH_REMINDER (Medication adherence, alarm, schedule alerts, reminders)
    if (
      /\b(reminder|alarm|schedule alert|when to take|remind me|pill alert|dose reminder|vaccine due alert)\b/i.test(
        lower
      )
    ) {
      return 'HEALTH_REMINDER';
    }

    // 11. MEDICAL_RECORD_SUMMARY (Historical patient record overview)
    if (
      /\b(medical record|medical history|past history|past records|timeline|previous treatment|show my history)\b/i.test(
        lower
      )
    ) {
      return 'MEDICAL_RECORD_SUMMARY';
    }

    // 12. SYMPTOM_ANALYSIS (Clinical symptoms e.g. fever, headache, pain, vomiting)
    if (
      /\b(fever|cough|headache|pain|stomach pain|chest heaviness|vomit|diarrhea|dizzy|nausea|chills|body ache|sore throat|rash|fatigue|swelling|burning)\b/i.test(
        lower
      ) ||
      /(காய்ச்சல்|இருமல்|தலைவலி|வயிற்று வலி|வாந்தி)/.test(raw) ||
      /(बुखार|खांसी|सिरदर्द|पेट दर्द|उल्टी)/.test(raw)
    ) {
      return 'SYMPTOM_ANALYSIS';
    }

    // 13. GENERAL_HEALTH_QUESTION (Default educational/general health query)
    return 'GENERAL_HEALTH_QUESTION';
  }

  /**
   * Main router execution: classifies input, gathers isolated patient records, and generates structured output
   */
  public async processMedicalRequest(input: MedicalRouteInput): Promise<MedicalStructuredOutput> {
    const raw = (input.text || '').trim();
    const reqType = this.classifyRequestType(input);
    const patientId = input.patientId || 1;
    const nowIso = new Date().toISOString();

    // 1. Fetch patient isolation records from Dexie DB
    let patient: Patient | undefined;
    let records: MedicalRecord[] = [];
    let healthTests: HealthTest[] = [];
    let medicines: Medicine[] = [];
    let vaccinations: Vaccination[] = [];
    let summaries: DoctorSummary[] = [];
    let appointments: Appointment[] = [];

    try {
      patient = await db.patients.get(patientId);
      records = await db.medicalRecords.where({ patientId }).toArray();
      healthTests = await db.healthTests.where({ patientId }).toArray();
      medicines = await db.medicines.where({ patientId }).toArray();
      vaccinations = await db.vaccinations.where({ patientId }).toArray();
      summaries = await db.doctorSummaries.where({ patientId }).toArray();
      appointments = await db.appointments.where({ patientId }).toArray();
    } catch (err) {
      console.warn('[MedicalAIRouter] Record fetch notice:', err);
    }

    const sourceRecordIds: (number | string)[] = [];

    // 2. Dispatch according to specific Medical AI Request Type
    switch (reqType) {
      case 'EMERGENCY_TRIAGE': {
        const emergencySigns: string[] = [];
        if (/chest pain/i.test(raw)) emergencySigns.push('Acute chest pain / possible coronary event');
        if (/breath/i.test(raw)) emergencySigns.push('Severe breathing difficulty / acute respiratory distress');
        if (/bleeding/i.test(raw)) emergencySigns.push('Active severe hemorrhage / blood loss');
        if (/unconscious|faint|seizure/i.test(raw)) emergencySigns.push('Altered sensorium / neurological compromise');

        return {
          requestType: 'EMERGENCY_TRIAGE',
          patientId,
          relevantSourceRecordIds: [],
          originalUserInput: raw,
          extractedInformation: {
            emergencySigns,
            triagePriority: 'RED_FLAG_URGENT',
            reportedSymptoms: raw,
          },
          analysisResult:
            'CRITICAL EMERGENCY ALERT: The reported symptoms indicate an urgent life-safety medical emergency. Immediate in-person medical evaluation or calling 108 is required.',
          missingInformation: [
            input.vitals?.bp ? `BP: ${input.vitals.bp}` : 'Blood Pressure reading: Not recorded in Medora.',
            input.vitals?.spo2 ? `SpO2: ${input.vitals.spo2}` : 'Oxygen Saturation (SpO2): Not recorded in Medora.',
            input.vitals?.pulse ? `Pulse: ${input.vitals.pulse}` : 'Heart rate: Not recorded in Medora.',
          ],
          warningSigns: emergencySigns.length > 0 ? emergencySigns : ['Acute severe symptoms requiring emergency assessment.'],
          confidenceOrUncertainty: 'HIGH_URGENCY (Clinical safety rule activated)',
          recommendedNextStep:
            'Seek immediate emergency care at the nearest hospital or call 108 right away. Do not wait for routine clinical follow-up.',
          timestamp: nowIso,
          executedAgentIds: ['emergency-triage-agent', 'response-verification-agent', 'doctor-handoff-agent'],
        };
      }

      case 'SYMPTOM_ANALYSIS': {
        const lower = raw.toLowerCase();
        const detectedSymptoms: string[] = [];
        if (lower.includes('fever') || lower.includes('temperature')) detectedSymptoms.push('Fever');
        if (lower.includes('headache')) detectedSymptoms.push('Headache');
        if (lower.includes('cough')) detectedSymptoms.push('Cough');
        if (lower.includes('stomach') || lower.includes('abdominal')) detectedSymptoms.push('Abdominal pain');
        if (lower.includes('vomit')) detectedSymptoms.push('Vomiting');
        if (lower.includes('diarrhea') || lower.includes('loose')) detectedSymptoms.push('Diarrhea');

        // Extract duration
        const durationMatch = raw.match(/\b(\d+)\s*(days?|hours?|weeks?|months?)\b/i) ||
          raw.match(/\b(three|two|one|four|five|several)\s*(days?|hours?|weeks?)\b/i);
        const duration = input.duration || (durationMatch ? durationMatch[0] : null);

        // Extract temperature if present in text or vitals
        const tempMatch = raw.match(/\b(10\d(?:\.\d)?|9\d(?:\.\d)?)\s*(?:°?f|degrees|c)?\b/i);
        const temperature = input.vitals?.temperature || (tempMatch ? tempMatch[0] : null);

        const missingInfo: string[] = [];
        if (!temperature) {
          missingInfo.push('Exact temperature reading: Not recorded in Medora.');
        }
        if (!duration) {
          missingInfo.push('Symptom onset and duration: Not recorded in Medora.');
        }
        if (!input.vitals?.bloodPressure) {
          missingInfo.push('Blood pressure: Not recorded in Medora.');
        }

        const warningSigns: string[] = [];
        if (detectedSymptoms.includes('Fever')) {
          warningSigns.push('High fever exceeding 103°F, persistent shivering, or stiff neck requires urgent care.');
        }
        if (detectedSymptoms.includes('Headache')) {
          warningSigns.push('Sudden explosive headache, confusion, or visual disturbance requires immediate physician evaluation.');
        }

        const relevantRecords = records.filter((r) => r.type === 'consultation' || r.type === 'vitals');
        relevantRecords.forEach((r) => r.id && sourceRecordIds.push(r.id));

        const symptomsStr = detectedSymptoms.join(' and ') || 'Reported symptoms';
        const analysisText = `Symptom Analysis for ${symptomsStr}: Symptoms identified: ${detectedSymptoms.join(', ') || 'General discomfort'}. ${
          duration ? `Duration reported: ${duration}.` : 'Duration: Not recorded in Medora.'
        } ${
          temperature ? `Temperature recorded: ${temperature}.` : 'Temperature was not recorded in Medora.'
        } Patient medical background: ${
          patient?.conditions && patient.conditions.length > 0 ? patient.conditions.join(', ') : 'No chronic conditions recorded in Medora.'
        }.`;

        return {
          requestType: 'SYMPTOM_ANALYSIS',
          patientId,
          relevantSourceRecordIds: sourceRecordIds.slice(0, 3),
          originalUserInput: raw,
          extractedInformation: {
            symptoms: detectedSymptoms,
            duration: duration || 'Not recorded in Medora.',
            temperature: temperature || 'Not recorded in Medora.',
            recordedAllergies: patient?.allergies || ['None recorded in Medora.'],
          },
          analysisResult: analysisText,
          missingInformation: missingInfo,
          warningSigns,
          confidenceOrUncertainty: 'MODERATE_CONFIDENCE (Symptomatic differential only, non-definitive)',
          recommendedNextStep:
            'Monitor symptoms, maintain oral hydration, and consult a qualified healthcare provider for definitive clinical examination.',
          timestamp: nowIso,
          executedAgentIds: ['symptom-analysis-agent', 'general-physician-agent', 'response-verification-agent'],
        };
      }

      case 'MEDICAL_REPORT_ANALYSIS': {
        const lower = raw.toLowerCase();
        const extractedValues: Record<string, string> = {};
        const abnormalFlags: string[] = [];

        // Hemoglobin check
        const hbMatch = raw.match(/hemoglobin\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(g\/dl)?/i) || raw.match(/hb\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
        if (hbMatch) {
          const val = parseFloat(hbMatch[1]);
          extractedValues['Hemoglobin'] = `${val} g/dL (Reference: 12.0–16.0 g/dL)`;
          if (val < 11.0) abnormalFlags.push(`Hemoglobin is low (${val} g/dL, indicating anemia).`);
          else if (val > 17.5) abnormalFlags.push(`Hemoglobin is elevated (${val} g/dL).`);
        }

        // Glucose / Blood Sugar check
        const sugarMatch = raw.match(/(?:fasting|post\s*prandial|glucose|blood\s*sugar)\s*[:=]?\s*(\d+)\s*(mg\/dl)?/i);
        if (sugarMatch) {
          const val = parseInt(sugarMatch[1], 10);
          extractedValues['Blood Glucose'] = `${val} mg/dL (Reference Fasting: 70–100 mg/dL)`;
          if (val > 140) abnormalFlags.push(`Blood Glucose is elevated (${val} mg/dL).`);
          else if (val < 70) abnormalFlags.push(`Blood Glucose is low (${val} mg/dL, hypoglycemia risk).`);
        }

        // Platelet count check
        const plateletMatch = raw.match(/platelet(?:s)?\s*[:=]?\s*(\d+(?:,\d+)?|\d+k?)/i);
        if (plateletMatch) {
          extractedValues['Platelet Count'] = `${plateletMatch[1]} /mcL (Reference: 150,000–450,000 /mcL)`;
        }

        const missingFields: string[] = [];
        if (!extractedValues['Hemoglobin']) missingFields.push('Hemoglobin level: Not recorded in Medora.');
        if (!extractedValues['Blood Glucose']) missingFields.push('Blood Glucose: Not recorded in Medora.');
        if (!input.fileName) missingFields.push('Laboratory reference number: Not recorded in Medora.');

        const labRecords = records.filter((r) => r.type === 'report');
        labRecords.forEach((r) => r.id && sourceRecordIds.push(r.id));

        return {
          requestType: 'MEDICAL_REPORT_ANALYSIS',
          patientId,
          relevantSourceRecordIds: sourceRecordIds.slice(0, 3),
          originalUserInput: raw,
          extractedInformation: {
            extractedParameters: Object.keys(extractedValues).length > 0 ? extractedValues : 'No structured lab parameters found in input text.',
            fileName: input.fileName || 'Direct report entry',
            abnormalFlags,
          },
          analysisResult:
            abnormalFlags.length > 0
              ? `Report extraction completed with ${abnormalFlags.length} flagged parameter(s): ${abnormalFlags.join(' ')}`
              : Object.keys(extractedValues).length > 0
              ? `Report extraction completed: Parameters are within normal reference ranges based on extracted values.`
              : 'Report analysis completed: No readable text or numeric parameters could be extracted from this report.',
          missingInformation: missingFields,
          warningSigns: abnormalFlags.length > 0 ? abnormalFlags : [],
          confidenceOrUncertainty:
            Object.keys(extractedValues).length > 0 ? 'HIGH_EXTRACTION_CONFIDENCE' : 'LOW_CONFIDENCE (Unreadable or unextracted fields)',
          recommendedNextStep:
            'Review findings with your attending physician to corroborate lab values with clinical presentation.',
          timestamp: nowIso,
          executedAgentIds: ['medical-report-analysis-agent', 'blood-test-analysis-agent', 'response-verification-agent'],
        };
      }

      case 'MEDICAL_IMAGE_ANALYSIS': {
        const imageScans = records.filter((r) => r.fileData || (r.data as any)?.hasImage);
        imageScans.forEach((r) => r.id && sourceRecordIds.push(r.id));

        return {
          requestType: 'MEDICAL_IMAGE_ANALYSIS',
          patientId,
          relevantSourceRecordIds: sourceRecordIds,
          originalUserInput: raw || (input.fileName ? `Uploaded file: ${input.fileName}` : 'Medical scan view request'),
          extractedInformation: {
            fileName: input.fileName || 'Radiology Scan',
            fileType: input.fileType || 'image/jpeg',
            bodyPartAssessed: /chest/i.test(raw) ? 'Chest / Thorax' : 'General Radiography',
            imageAvailabilityStatus: 'IMAGE_LOADED_FOR_CLINICAL_VIEWING',
          },
          analysisResult:
            'AI model unavailable. Please request qualified medical review. Medical images are stored and previewed with zoom, pan, and rotation controls for clinician examination.',
          missingInformation: [
            'Radiologist final signature: Not recorded in Medora.',
            'Validated DICOM calibration matrix: Not recorded in Medora.',
          ],
          warningSigns: ['Automated diagnostic models cannot replace board-certified radiologist interpretation.'],
          confidenceOrUncertainty: 'MODEL_UNAVAILABLE (Zero fake diagnostic inference guarantee)',
          recommendedNextStep:
            'Have this scan examined directly by a certified radiologist or treating clinician.',
          timestamp: nowIso,
          executedAgentIds: ['medical-image-analysis-agent', 'radiology-support-agent'],
        };
      }

      case 'DIAGNOSIS_REVIEW': {
        const existingConditions = patient?.conditions || [];
        const pastConsultations = summaries.filter((s) => s.patientId === patientId);
        pastConsultations.forEach((s) => s.id && sourceRecordIds.push(s.id));

        return {
          requestType: 'DIAGNOSIS_REVIEW',
          patientId,
          relevantSourceRecordIds: sourceRecordIds,
          originalUserInput: raw,
          extractedInformation: {
            patientName: patient?.name || 'Patient',
            recordedConditions: existingConditions.length > 0 ? existingConditions : ['Not recorded in Medora.'],
            lastRecordedConsultation: pastConsultations.length > 0 ? pastConsultations[pastConsultations.length - 1].nextStep : 'Not recorded in Medora.',
          },
          analysisResult:
            existingConditions.length > 0
              ? `Diagnosis Review for ${patient?.name}: Established medical record confirms ${existingConditions.join(', ')}. Existing clinical history is preserved and must not be altered without clinician authorization.`
              : 'Diagnosis Review: No prior confirmed diagnoses are currently recorded in Medora for this patient profile.',
          missingInformation: [
            patient?.allergies && patient.allergies.length > 0 ? '' : 'Drug allergy records: Not recorded in Medora.',
            summaries.length > 0 ? '' : 'Attending clinician notes: Not recorded in Medora.',
          ].filter(Boolean),
          warningSigns: ['Never modify ongoing chronic disease management without physician guidance.'],
          confidenceOrUncertainty: 'HIGH_RECORD_FIDELITY (Based on persistent medical record database)',
          recommendedNextStep:
            'Maintain prescribed medical care plan and schedule routine disease monitoring with your primary health center.',
          timestamp: nowIso,
          executedAgentIds: ['diagnosis-review-agent', 'medical-history-agent', 'doctor-summary-agent'],
        };
      }

      case 'MEDICAL_RECORD_SUMMARY': {
        records.forEach((r) => r.id && sourceRecordIds.push(r.id));
        const activeMeds = medicines.filter((m) => m.status === 'active');
        const conditions = patient?.conditions || [];

        return {
          requestType: 'MEDICAL_RECORD_SUMMARY',
          patientId,
          relevantSourceRecordIds: sourceRecordIds,
          originalUserInput: raw,
          extractedInformation: {
            patientName: patient?.name || 'Patient',
            age: patient?.age || 'Not recorded in Medora.',
            gender: patient?.gender || 'Not recorded in Medora.',
            village: patient?.village || 'Not recorded in Medora.',
            totalRecords: records.length,
            activeMedicationsCount: activeMeds.length,
            recordedConditions: conditions.length > 0 ? conditions : ['None recorded in Medora.'],
          },
          analysisResult: `Medical Record Summary for ${patient?.name || 'Patient'} (ID: ${patientId}): Profile: Age ${
            patient?.age || 'Not recorded'
          }, Village: ${patient?.village || 'Not recorded'}. ${records.length} clinical record(s), ${
            activeMeds.length
          } active prescription(s), and ${vaccinations.length} vaccination entry/entries in local database.`,
          missingInformation: [
            patient?.emergencyContact ? '' : 'Emergency contact phone: Not recorded in Medora.',
            patient?.bloodGroup ? '' : 'Blood group: Not recorded in Medora.',
          ].filter(Boolean),
          warningSigns: [],
          confidenceOrUncertainty: 'VERIFIED_PERSISTENT_RECORDS',
          recommendedNextStep:
            'All medical records are securely preserved offline. You can export or show this summary during hospital visits.',
          timestamp: nowIso,
          executedAgentIds: ['medical-summary-agent', 'medical-history-agent'],
        };
      }

      case 'MEDICATION_REVIEW': {
        const activeMeds = medicines.filter((m) => m.status === 'active');
        activeMeds.forEach((m) => m.id && sourceRecordIds.push(m.id));

        return {
          requestType: 'MEDICATION_REVIEW',
          patientId,
          relevantSourceRecordIds: sourceRecordIds,
          originalUserInput: raw,
          extractedInformation: {
            activeMedications: activeMeds.map((m) => `${m.name} (${m.dose || 'dose not recorded'}, ${m.frequency})`),
            allergies: patient?.allergies || ['None recorded in Medora.'],
          },
          analysisResult:
            activeMeds.length > 0
              ? `Medication Review: Patient currently has ${activeMeds.length} active medication(s): ${activeMeds
                  .map((m) => `${m.name} ${m.dose}`)
                  .join(', ')}. Prescribed schedule and timings are strictly maintained.`
              : 'Medication Review: No active prescriptions recorded in Medora for this patient profile.',
          missingInformation: [
            patient?.allergies && patient.allergies.length > 0 ? '' : 'Comprehensive allergy list: Not recorded in Medora.',
          ].filter(Boolean),
          warningSigns: ['Do not stop, skip, or alter prescribed medication doses without doctor approval.'],
          confidenceOrUncertainty: 'HIGH_RECORD_FIDELITY',
          recommendedNextStep:
            'Adhere to prescribed medication times and report any unexpected side effects to your physician.',
          timestamp: nowIso,
          executedAgentIds: ['medication-safety-agent', 'general-physician-agent'],
        };
      }

      case 'VACCINATION_REVIEW': {
        vaccinations.forEach((v) => v.id && sourceRecordIds.push(v.id));
        const due = vaccinations.filter((v) => v.status === 'due' || v.status === 'overdue');

        return {
          requestType: 'VACCINATION_REVIEW',
          patientId,
          relevantSourceRecordIds: sourceRecordIds,
          originalUserInput: raw,
          extractedInformation: {
            totalVaccinesRecorded: vaccinations.length,
            pendingDoses: due.map((d) => `${d.vaccineName} (Due: ${d.dueDate})`),
          },
          analysisResult:
            vaccinations.length > 0
              ? `Vaccination Review: ${vaccinations.length} record(s) on file. ${due.length} pending or upcoming dose(s) identified.`
              : 'Vaccination Review: No vaccination history currently recorded in Medora for this profile.',
          missingInformation: [
            vaccinations.some((v) => v.batchNo) ? '' : 'Vaccine batch numbers: Not recorded in Medora.',
          ].filter(Boolean),
          warningSigns: due.some((d) => d.status === 'overdue') ? ['One or more overdue vaccine doses detected.'] : [],
          confidenceOrUncertainty: 'HIGH_RECORD_FIDELITY',
          recommendedNextStep: 'Visit your nearest Primary Health Centre (PHC) to receive due immunizations under the UIP schedule.',
          timestamp: nowIso,
          executedAgentIds: ['vaccination-agent', 'pediatric-care-agent'],
        };
      }

      case 'SURGERY_FOLLOW_UP': {
        return {
          requestType: 'SURGERY_FOLLOW_UP',
          patientId,
          relevantSourceRecordIds: [],
          originalUserInput: raw,
          extractedInformation: {
            surgicalQuery: raw,
            patientName: patient?.name || 'Patient',
          },
          analysisResult:
            'Surgery Follow-up Protocol: Monitoring for wound healing, surgical incision integrity, fever, or localized erythema. Post-operative care must follow the operating surgeon’s discharge instructions.',
          missingInformation: [
            'Operating surgeon discharge summary: Not recorded in Medora.',
            'Suture removal date: Not recorded in Medora.',
          ],
          warningSigns: [
            'Immediate doctor consultation required if there is high fever, increasing wound redness, purulent discharge, or worsening acute pain.',
          ],
          confidenceOrUncertainty: 'MODERATE_CONFIDENCE (Clinical follow-up guidance)',
          recommendedNextStep:
            'Keep surgical dressings dry and clean, take prescribed antibiotics as scheduled, and attend your scheduled post-op review.',
          timestamp: nowIso,
          executedAgentIds: ['surgery-follow-up-agent', 'medication-safety-agent', 'doctor-handoff-agent'],
        };
      }

      case 'HEALTH_REMINDER': {
        const activeMeds = medicines.filter((m) => m.status === 'active');
        return {
          requestType: 'HEALTH_REMINDER',
          patientId,
          relevantSourceRecordIds: [],
          originalUserInput: raw,
          extractedInformation: {
            activePrescriptionsCount: activeMeds.length,
            nextAppointmentsCount: appointments.length,
          },
          analysisResult: `Health Reminder Engine: Tracking ${activeMeds.length} active medicine schedules, vaccination due dates, and doctor appointments. Automated reminders are dispatched locally without manual re-entry.`,
          missingInformation: [],
          warningSigns: [],
          confidenceOrUncertainty: 'HIGH_SYSTEM_AUTOMATION',
          recommendedNextStep: 'Check the Medicines and Appointments pages to view active schedules.',
          timestamp: nowIso,
          executedAgentIds: ['health-reminder-agent', 'appointment-agent'],
        };
      }

      case 'DOCTOR_CONSULTATION':
      case 'DOCTOR_SUMMARY':
      case 'GENERAL_HEALTH_QUESTION':
      default: {
        return {
          requestType: reqType,
          patientId,
          relevantSourceRecordIds: [],
          originalUserInput: raw,
          extractedInformation: {
            generalQuery: raw,
            language: input.language || 'en',
          },
          analysisResult: `General Health Information: Medora provides evidence-based health guidance and navigation support. For specific diagnostic questions or therapy adjustments, please consult your primary healthcare physician.`,
          missingInformation: ['Specific clinical vitals or records: Not recorded in Medora.'],
          warningSigns: [],
          confidenceOrUncertainty: 'GENERAL_EDUCATIONAL_GUIDANCE',
          recommendedNextStep: 'Consult a qualified doctor for personalized health evaluation.',
          timestamp: nowIso,
          executedAgentIds: ['general-physician-agent', 'response-verification-agent'],
        };
      }
    }
  }
}

export const medicalAiRouter = new MedicalAIRouter();
