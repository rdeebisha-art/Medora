import { describe, it, expect } from 'vitest';
import {
  classifyAuditAction,
  exportAuditLogsAsCsv,
  exportAuditLogsAsJson,
  AuditLog,
} from './auditLoggerService';
import { FICTIONAL_20_DEMO_PATIENTS } from './patientSeederService';

describe('AuditLoggerService & Classification Unit Tests', () => {
  it('correctly classifies patient record updates', () => {
    expect(classifyAuditAction('PATIENT_RECORD_UPDATED: Ramesh Patel', 'patient')).toBe('patient_update');
    expect(classifyAuditAction('PATIENT_DEMOGRAPHICS_MODIFIED: Baby Arjun', 'patient')).toBe('patient_update');
    expect(classifyAuditAction('Vitals updated for villager', 'patient')).toBe('patient_update');
    expect(classifyAuditAction('Weight measurement recorded: 66kg', 'weight')).toBe('patient_update');
  });

  it('correctly classifies medicine adherence logs', () => {
    expect(classifyAuditAction('MEDICINE_TAKEN: Amlodipine 5mg', 'medicine')).toBe('medicine_adherence');
    expect(classifyAuditAction('MEDICINE_MISSED: Telmisartan 40mg', 'medicine')).toBe('medicine_adherence');
    expect(classifyAuditAction('Confirmed morning pill dose taken', 'medicine')).toBe('medicine_adherence');
    expect(classifyAuditAction('Medicine adherence log confirmed', 'adherence')).toBe('medicine_adherence');
  });

  it('correctly classifies deletion events', () => {
    expect(classifyAuditAction('SOFT_DELETE_ARCHIVED: PATIENT [Test Profile]', 'patient')).toBe('deletion');
    expect(classifyAuditAction('PERMANENT_DELETION: RECORD [Consultation #402]', 'consultation')).toBe('deletion');
    expect(classifyAuditAction('Archived duplicate clinical draft', 'clinical')).toBe('deletion');
    expect(classifyAuditAction('Removed obsolete temporary entry', 'system')).toBe('deletion');
  });

  it('correctly classifies authentication and administrative events', () => {
    expect(classifyAuditAction('ADMIN_PASSWORD_CHANGED', 'user')).toBe('auth');
    expect(classifyAuditAction('DOCTOR_REGISTRATION_APPROVED: Dr. Kavitha Rao', 'doctor')).toBe('auth');
    expect(classifyAuditAction('User login authenticated via SHA-256', 'user')).toBe('auth');
  });

  it('exports logs to CSV format with correct header and quoted values', () => {
    const mockLogs: AuditLog[] = [
      {
        logId: 'AUD-TEST-1',
        action: 'PATIENT_RECORD_UPDATED',
        details: 'Updated phone number',
        entityType: 'patient',
        recordId: 'P-1001',
        userId: 'ADMIN-01',
        userName: 'Admin User',
        userRole: 'admin',
        timestamp: '2026-09-27T10:00:00.000Z',
      },
    ];

    const csv = exportAuditLogsAsCsv(mockLogs);
    expect(csv).toContain('Timestamp,Log ID,Action,Category,Entity Type,Record ID,User,Role,Details');
    expect(csv).toContain('"AUD-TEST-1"');
    expect(csv).toContain('"patient_update"');
    expect(csv).toContain('"P-1001"');
  });

  it('exports logs to formatted JSON', () => {
    const mockLogs: AuditLog[] = [
      {
        logId: 'AUD-TEST-2',
        action: 'MEDICINE_TAKEN: Metformin',
        details: 'Taken on schedule',
        entityType: 'medicine',
        recordId: 'P-1002',
        userId: 'P-1002',
        userName: 'Ramesh Patel',
        userRole: 'patient',
        timestamp: '2026-09-27T11:00:00.000Z',
      },
    ];

    const json = exportAuditLogsAsJson(mockLogs);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].logId).toBe('AUD-TEST-2');
    expect(parsed[0].action).toBe('MEDICINE_TAKEN: Metformin');
  });
});

describe('20 Fictional Demo Patients Dataset Integrity Tests', () => {
  it('contains exactly 20 unique fictional demo patients', () => {
    expect(FICTIONAL_20_DEMO_PATIENTS.length).toBe(20);
  });

  it('guarantees unique Patient IDs (P-1001 through P-1020) with no duplicates', () => {
    const ids = FICTIONAL_20_DEMO_PATIENTS.map((p) => p.patientCode);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);
    expect(ids).toContain('P-1001');
    expect(ids).toContain('P-1020');
  });

  it('guarantees unique phone numbers across all 20 demo patients', () => {
    const phones = FICTIONAL_20_DEMO_PATIENTS.map((p) => p.phone);
    const uniquePhones = new Set(phones);
    expect(uniquePhones.size).toBe(20);
  });

  it('ensures each patient record has required clinical and demographic data', () => {
    for (const patient of FICTIONAL_20_DEMO_PATIENTS) {
      expect(patient.name).toBeTruthy();
      expect(patient.age).toBeGreaterThanOrEqual(0);
      expect(['male', 'female', 'other']).toContain(patient.gender);
      expect(patient.village).toBeTruthy();
      expect(patient.bloodGroup).toBeTruthy();
      expect(Array.isArray(patient.conditions)).toBe(true);
      expect(patient.weight).toBeGreaterThan(0);
      expect(patient.emergencyContact).toBeTruthy();
      expect(patient.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(patient.prescribedMedicines)).toBe(true);
      expect(Array.isArray(patient.appointments)).toBe(true);
    }
  });

  it('covers specialized cohorts: elderly, maternity, newborn, and child', () => {
    const elderly = FICTIONAL_20_DEMO_PATIENTS.filter((p) => p.isElderly);
    const pregnant = FICTIONAL_20_DEMO_PATIENTS.filter((p) => p.isPregnant);
    const newborn = FICTIONAL_20_DEMO_PATIENTS.filter((p) => p.isNewborn);
    const children = FICTIONAL_20_DEMO_PATIENTS.filter((p) => p.isChild);

    expect(elderly.length).toBeGreaterThanOrEqual(4);
    expect(pregnant.length).toBeGreaterThanOrEqual(2);
    expect(newborn.length).toBeGreaterThanOrEqual(1);
    expect(children.length).toBeGreaterThanOrEqual(2);
  });
});
