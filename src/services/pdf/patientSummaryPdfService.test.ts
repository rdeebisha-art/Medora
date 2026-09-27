import { describe, it, expect } from 'vitest';
import { PatientSummaryPdfService } from './patientSummaryPdfService';
import { Patient, MedicalRecord, HealthTest, Medicine } from '../../db/db';

describe('PatientSummaryPdfService - Offline Medical Summary PDF Generator', () => {
  const dummyPatient: Patient = {
    id: 1001,
    name: 'Anitha Devi',
    age: 38,
    gender: 'female',
    phone: '9876543210',
    pin: '1234',
    role: 'patient',
    village: 'Rampur',
    language: 'ta',
    bloodGroup: 'B Positive (B+)',
    conditions: ['Hypertension Stage 1', 'Osteoarthritis'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: '+91 94482 11334',
  };

  const dummyTests: HealthTest[] = [
    {
      id: 1,
      patientId: 1001,
      type: 'blood_pressure',
      value: '128/82',
      unit: 'mmHg',
      date: '2026-09-27',
    },
    {
      id: 2,
      patientId: 1001,
      type: 'blood_sugar',
      value: '110',
      unit: 'mg/dL',
      date: '2026-09-27',
    },
  ];

  const dummyMedicines: Medicine[] = [
    {
      id: 1,
      patientId: 1001,
      name: 'Amlodipine 5mg',
      dose: '1 tablet',
      frequency: 'Once Daily (Morning)',
      times: ['08:00 AM'],
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      doctor: 'Dr. Suresh Balakrishnan',
      instructions: 'Take with water after breakfast',
      status: 'active',
    },
  ];

  it('generates an A4 jsPDF instance with valid pages and metadata', () => {
    const doc = PatientSummaryPdfService.exportPatientSummaryToPdf({
      patient: dummyPatient,
      healthTests: dummyTests,
      medicines: dummyMedicines,
      doctorSummary: {
        id: 1,
        patientId: 1001,
        complaint: 'Routine follow-up for joint pain and blood pressure check',
        symptoms: ['Joint pain', 'Mild headache'],
        duration: '2 weeks',
        history: 'Known hypertension',
        medicines: 'Amlodipine 5mg OD',
        allergies: 'Penicillin',
        vitals: 'BP: 128/82 mmHg',
        observations: 'Stable resting vitals',
        warningSigns: [],
        nextStep: 'Continue current medication regimen. Maintain moderate sodium intake.',
        followUp: '4 weeks at Regional PHC',
        agentType: 'DOCTOR_CONFIRMED',
        createdAt: '2026-09-27T10:00:00Z',
      },
      authorizedBy: {
        name: 'Dr. Suresh Balakrishnan',
        role: 'Doctor / Attending Clinician',
        id: 201,
      },
      includeVitals: true,
      includeMedicines: true,
      includeDoctorNotes: true,
      includeEmergencyGuidance: true,
    });

    expect(doc).toBeDefined();
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 0);
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 0);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('generates a valid binary blob string without throwing errors in offline environment', () => {
    const doc = PatientSummaryPdfService.exportPatientSummaryToPdf({
      patient: dummyPatient,
      authorizedBy: {
        name: 'Sister Lakshmi Devi',
        role: 'Village Health Administrator (ASHA Lead)',
      },
      includeVitals: false,
      includeMedicines: false,
    });

    const outputDataUri = doc.output('datauristring');
    expect(outputDataUri).toContain('data:application/pdf');
  });
});
