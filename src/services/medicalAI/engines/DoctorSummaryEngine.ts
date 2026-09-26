/**
 * Medora Doctor Summary Engine
 *
 * Enforces strict architectural segregation between:
 * 1. Provisional AI Observations (strictly unverified until signed)
 * 2. Objective clinical metrics (vitals, lab extracts)
 * 3. Physician Clinical Records (the authoritative medical chart)
 *
 * Adheres to medical liability and safety guidelines:
 * - AI observations must never overwrite or masquerade as verified clinical notes.
 * - Requires explicit physician sign-off for confirmed diagnoses and prescriptions.
 */

import { DoctorSummaryInput, DoctorSummaryResult } from './mlInterfaces';

export class DoctorSummaryEngine {
  public static generateHandoffSummary(input: DoctorSummaryInput): DoctorSummaryResult {
    const symptomRes = input.symptomResults;
    const reportRes = input.reportResults;
    const triageRes = input.triageResults;

    // 1. Provisional AI Observations (Unverified)
    const provisionalObservations: string[] = [];
    if (symptomRes) {
      provisionalObservations.push(
        `Reported Symptoms: ${symptomRes.chiefComplaint}${symptomRes.extractedDuration ? ` (Duration: ${symptomRes.extractedDuration})` : ''}`
      );
    }
    if (triageRes && triageRes.isEmergency) {
      provisionalObservations.push(`TRIAGE ALERT: Critical Red Flags detected: ${triageRes.activeRedFlags.join('; ')}`);
    }
    if (reportRes && reportRes.criticalAlerts.length > 0) {
      provisionalObservations.push(`CRITICAL LAB ALERTS: ${reportRes.criticalAlerts.join('; ')}`);
    }

    const potentialDifferentials = symptomRes?.possibleConsiderations?.map(
      c => `${c.condition} (AI Clues: ${c.supportingClues.join(', ')}; Missing: ${c.missingInfo.join(', ')})`
    ) || [];

    // 2. Objective Clinical Data
    const vitals: Record<string, string> = symptomRes?.extractedVitals || {};
    const labValues: Array<{ name: string; value: string; status: string }> = (
      reportRes?.extractedParameters || []
    ).map(p => ({
      name: p.parameterName,
      value: p.rawValue,
      status: p.status,
    }));

    return {
      engine: 'MedoraDoctorSummaryEngine',
      patientHeader: {
        id: input.patientId,
        name: input.patientName,
        age: input.age,
        gender: input.gender,
      },
      provisionalAiSection: {
        disclaimer: 'PROVISIONAL AI OBSERVATIONS: Not verified by a medical doctor. Must be reviewed and verified by a licensed clinician before clinical action.',
        observations: provisionalObservations,
        potentialDifferentials,
        uncertaintyNotice: symptomRes?.uncertainty?.disclaimer || 'Awaiting physician clinical correlation.',
        isVerifiedByDoctor: false,
      },
      objectiveClinicalData: {
        vitals,
        labValues,
      },
      physicianClinicalRecordSection: {
        isVerifiedByDoctor: false,
        attendingPhysician: null,
        verifiedDiagnosis: null,
        clinicalOrders: [],
        prescriptions: [],
        physicianNotes: null,
        verificationTimestamp: null,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Applies explicit physician sign-off to produce a verified clinical record.
   */
  public static verifyByPhysician(
    summary: DoctorSummaryResult,
    physicianName: string,
    verifiedDiagnosis: string,
    orders: string[],
    prescriptions: string[],
    notes?: string
  ): DoctorSummaryResult {
    return {
      ...summary,
      physicianClinicalRecordSection: {
        isVerifiedByDoctor: true,
        attendingPhysician: physicianName,
        verifiedDiagnosis,
        clinicalOrders: orders,
        prescriptions,
        physicianNotes: notes || null,
        verificationTimestamp: new Date().toISOString(),
      },
    };
  }
}
