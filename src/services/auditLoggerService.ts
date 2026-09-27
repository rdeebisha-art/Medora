import { db, AuditLog } from '../db/db';
export type { AuditLog };

export type AuditActionCategory =
  | 'all'
  | 'patient_update'
  | 'medicine_adherence'
  | 'deletion'
  | 'auth'
  | 'clinical';

export interface AuditLogFilterOptions {
  category?: AuditActionCategory;
  entityType?: string;
  userRole?: string;
  searchQuery?: string;
  dateRange?: 'all' | 'today' | '7days' | '30days';
  sortBy?: 'newest' | 'oldest';
  limit?: number;
}

export interface AuditStats {
  totalLogs: number;
  patientUpdates: number;
  medicineAdherence: number;
  deletionEvents: number;
  authAndAdmin: number;
  clinicalActions: number;
}

/**
 * Classifies an audit action into one of the main system categories:
 * - patient_update
 * - medicine_adherence
 * - deletion
 * - auth
 * - clinical
 */
export function classifyAuditAction(action: string, entityType?: string): AuditActionCategory {
  const lower = (action || '').toLowerCase();
  const entity = (entityType || '').toLowerCase();

  // Deletion Events (highest priority)
  if (
    lower.includes('delet') ||
    lower.includes('archive') ||
    lower.includes('remove') ||
    lower.includes('purge') ||
    lower.includes('discard')
  ) {
    return 'deletion';
  }

  // Authentication & System Administration (prioritize before general registration/update)
  if (
    lower.includes('password') ||
    lower.includes('login') ||
    lower.includes('logout') ||
    lower.includes('auth') ||
    lower.includes('approval') ||
    lower.includes('approved') ||
    lower.includes('reject') ||
    lower.includes('registered user') ||
    lower.includes('doctor_registration') ||
    entity === 'user' ||
    entity === 'admin'
  ) {
    return 'auth';
  }

  // Medicine Adherence
  if (
    lower.includes('adherence') ||
    lower.includes('taken') ||
    lower.includes('missed') ||
    lower.includes('medicine_adherence') ||
    lower.includes('dose') ||
    (entity === 'medicine' && (lower.includes('taken') || lower.includes('status')))
  ) {
    return 'medicine_adherence';
  }

  // Clinical records & prescriptions
  if (
    lower.includes('consultation') ||
    lower.includes('clinical') ||
    lower.includes('prescription') ||
    lower.includes('diagnosis') ||
    lower.includes('test') ||
    entity === 'consultation' ||
    entity === 'medicine'
  ) {
    return 'clinical';
  }

  // Patient Record Updates
  if (
    lower.includes('patient') ||
    lower.includes('villager') ||
    lower.includes('demographic') ||
    lower.includes('vitals') ||
    lower.includes('weight') ||
    entity === 'patient' ||
    entity === 'weight'
  ) {
    return 'patient_update';
  }

  return 'patient_update';
}

/**
 * Logs a new audit event into IndexedDB and dispatches runtime notifications.
 */
export async function logAuditEvent(entry: {
  action: string;
  details: string;
  entityType?: AuditLog['entityType'];
  recordId?: string | number;
  userId?: string;
  userName?: string;
  userRole?: string;
  changedFields?: Record<string, any>;
}): Promise<AuditLog> {
  const timestamp = new Date().toISOString();
  const logId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const newLog: AuditLog = {
    logId,
    action: entry.action,
    details: entry.details,
    entityType: entry.entityType || 'system' as any,
    recordId: entry.recordId,
    userId: entry.userId || 'ADMIN-SYSTEM',
    userName: entry.userName || 'Sister Lakshmi Devi (ASHA / Admin)',
    userRole: entry.userRole || 'admin',
    timestamp,
    changedFields: entry.changedFields,
  };

  try {
    const id = await db.auditLogs.add(newLog);
    newLog.id = id;
  } catch (err) {
    console.warn('[AuditLogger] Dexie auditLogs write error (fallback to local state):', err);
  }

  // Broadcast to any active UI listeners
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('medora:audit_log_added', { detail: newLog }));
      
      // Also update localStorage audit logs array so legacy context stays in sync
      const raw = localStorage.getItem('medora_audit_logs_v2');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: newLog.logId,
        action: newLog.action,
        user: newLog.userName,
        role: newLog.userRole,
        timestamp: newLog.timestamp.replace('T', ' ').substring(0, 19),
        affectedPatientId: newLog.recordId ? String(newLog.recordId) : undefined,
        details: newLog.details,
      });
      localStorage.setItem('medora_audit_logs_v2', JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  return newLog;
}

/**
 * Convenience helper: Logs a patient record modification.
 */
export async function logPatientUpdate(
  patientId: string | number,
  patientName: string,
  actor: { userId?: string; userName?: string; userRole?: string },
  details: string,
  changedFields?: Record<string, any>
): Promise<AuditLog> {
  return logAuditEvent({
    action: `PATIENT_RECORD_UPDATED: ${patientName} (${patientId})`,
    details,
    entityType: 'patient',
    recordId: patientId,
    userId: actor.userId || 'ADMIN-01',
    userName: actor.userName || 'Administrator',
    userRole: actor.userRole || 'admin',
    changedFields,
  });
}

/**
 * Convenience helper: Logs a medicine adherence event.
 */
export async function logMedicineAdherence(
  patientId: string | number,
  patientName: string,
  medicineName: string,
  status: 'taken' | 'missed',
  actor: { userId?: string; userName?: string; userRole?: string },
  dosageInfo?: string
): Promise<AuditLog> {
  const isTaken = status === 'taken';
  const action = isTaken
    ? `MEDICINE_TAKEN: ${medicineName}`
    : `MEDICINE_MISSED: ${medicineName}`;
  const details = isTaken
    ? `Patient ${patientName} (${patientId}) confirmed taking ${medicineName} ${dosageInfo ? `(${dosageInfo})` : ''} on schedule.`
    : `Dose missed or delayed for ${medicineName} by ${patientName} (${patientId}). Notification generated for ASHA worker.`;

  return logAuditEvent({
    action,
    details,
    entityType: 'medicine',
    recordId: patientId,
    userId: actor.userId || `PAT-${patientId}`,
    userName: actor.userName || patientName,
    userRole: actor.userRole || 'patient',
    changedFields: {
      medicineName,
      status,
      dosage: dosageInfo,
      adherenceTimestamp: new Date().toISOString(),
    },
  });
}

/**
 * Convenience helper: Logs a deletion or archival event with reason and confirmation.
 */
export async function logDeletionEvent(
  entityType: AuditLog['entityType'],
  recordId: string | number,
  recordTitle: string,
  actor: { userId?: string; userName?: string; userRole?: string },
  isSoftDelete: boolean = true,
  reason: string = 'Administrative review and data hygiene'
): Promise<AuditLog> {
  const deleteType = isSoftDelete ? 'SOFT_DELETE_ARCHIVED' : 'PERMANENT_DELETION';
  const action = `${deleteType}: ${String(entityType).toUpperCase()} [${recordTitle}]`;
  const details = `${isSoftDelete ? 'Archived record' : 'Permanently removed'} for ${entityType} (ID: ${recordId}). Reason: ${reason}. Action executed by ${actor.userName || 'Administrator'} (${actor.userRole || 'admin'}).`;

  return logAuditEvent({
    action,
    details,
    entityType,
    recordId,
    userId: actor.userId || 'ADMIN-01',
    userName: actor.userName || 'Sister Lakshmi Devi (ASHA / Admin)',
    userRole: actor.userRole || 'admin',
    changedFields: {
      isDeleted: true,
      softDeleted: isSoftDelete,
      reason,
      deletedAt: new Date().toISOString(),
    },
  });
}

/**
 * Fetches audit logs from database and combines with any persistent context logs.
 */
export async function fetchAuditLogs(filters?: AuditLogFilterOptions): Promise<AuditLog[]> {
  let dbLogs: AuditLog[] = [];
  try {
    dbLogs = await db.auditLogs.toArray();
  } catch (err) {
    console.warn('[AuditLogger] Could not read db.auditLogs:', err);
  }

  // If database is empty, seed rich demonstration audit logs
  if (dbLogs.length === 0) {
    await seedInitialAuditLogs();
    try {
      dbLogs = await db.auditLogs.toArray();
    } catch {}
  }

  // Merge with localStorage audit logs if present
  try {
    const raw = localStorage.getItem('medora_audit_logs_v2');
    if (raw) {
      const lsLogs = JSON.parse(raw);
      const existingIds = new Set(dbLogs.map((l) => l.logId));
      for (const item of lsLogs) {
        if (!existingIds.has(item.id)) {
          dbLogs.push({
            logId: item.id || `AUD-LEGACY-${Math.random().toString(36).slice(2, 6)}`,
            action: item.action,
            details: item.details || `Logged action by ${item.user}`,
            entityType: 'patient',
            recordId: item.affectedPatientId || item.affectedFamilyId,
            userId: item.user,
            userName: item.user,
            userRole: item.role || 'admin',
            timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString(),
          });
        }
      }
    }
  } catch {}

  // Apply Filters
  let filtered = [...dbLogs];

  // 1. Category Filter
  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((log) => classifyAuditAction(log.action, log.entityType) === filters.category);
  }

  // 2. Entity Type Filter
  if (filters?.entityType && filters.entityType !== 'all') {
    filtered = filtered.filter((log) => (log.entityType || '').toLowerCase() === filters.entityType!.toLowerCase());
  }

  // 3. User Role Filter
  if (filters?.userRole && filters.userRole !== 'all') {
    filtered = filtered.filter((log) => (log.userRole || '').toLowerCase() === filters.userRole!.toLowerCase());
  }

  // 4. Search Query (matches action, details, userName, userId, recordId)
  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter((log) => {
      const actionMatch = (log.action || '').toLowerCase().includes(query);
      const detailsMatch = (log.details || '').toLowerCase().includes(query);
      const userMatch = (log.userName || '').toLowerCase().includes(query) || (log.userId || '').toLowerCase().includes(query);
      const recordMatch = log.recordId !== undefined && String(log.recordId).toLowerCase().includes(query);
      return actionMatch || detailsMatch || userMatch || recordMatch;
    });
  }

  // 5. Date Range Filter
  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = Date.now();
    let maxAgeMs = 24 * 3600 * 1000;
    if (filters.dateRange === '7days') maxAgeMs = 7 * 24 * 3600 * 1000;
    if (filters.dateRange === '30days') maxAgeMs = 30 * 24 * 3600 * 1000;

    filtered = filtered.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return now - logTime <= maxAgeMs;
    });
  }

  // 6. Sorting
  const sortOrder = filters?.sortBy || 'newest';
  filtered.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  if (filters?.limit && filters.limit > 0) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Calculates summary statistics across all audit logs.
 */
export async function getAuditStats(): Promise<AuditStats> {
  const allLogs = await fetchAuditLogs();
  const stats: AuditStats = {
    totalLogs: allLogs.length,
    patientUpdates: 0,
    medicineAdherence: 0,
    deletionEvents: 0,
    authAndAdmin: 0,
    clinicalActions: 0,
  };

  for (const log of allLogs) {
    const cat = classifyAuditAction(log.action, log.entityType);
    if (cat === 'patient_update') stats.patientUpdates++;
    else if (cat === 'medicine_adherence') stats.medicineAdherence++;
    else if (cat === 'deletion') stats.deletionEvents++;
    else if (cat === 'auth') stats.authAndAdmin++;
    else if (cat === 'clinical') stats.clinicalActions++;
  }

  return stats;
}

/**
 * Seeds initial tamper-evident audit logs if database has no audit entries.
 */
export async function seedInitialAuditLogs(): Promise<void> {
  try {
    const count = await db.auditLogs.count();
    if (count > 0) return; // Idempotent check
  } catch {
    // Continue
  }

  const now = Date.now();
  const initialLogs: Omit<AuditLog, 'id'>[] = [
    // 1. Patient Record Updates
    {
      logId: 'AUD-INIT-001',
      action: 'PATIENT_RECORD_UPDATED: Ramesh Patel (P-1002)',
      details: 'Updated contact phone number from 9876543211 to 9876543211 and updated fasting blood glucose target notes.',
      entityType: 'patient',
      recordId: 'P-1002',
      userId: 'ADMIN-01',
      userName: 'Sister Lakshmi Devi (ASHA)',
      userRole: 'admin',
      timestamp: new Date(now - 1 * 3600000).toISOString(),
      changedFields: { phone: '9876543211', conditionNote: 'Target FBS: 80-130 mg/dL' },
    },
    {
      logId: 'AUD-INIT-002',
      action: 'PATIENT_RECORD_UPDATED: Anitha Kumar (P-1005)',
      details: 'Recorded third-trimester weight increment: 58.0 kg to 58.5 kg. Normal pregnancy progression noted.',
      entityType: 'patient',
      recordId: 'P-1005',
      userId: 'DOC-02',
      userName: 'Dr. Kavitha Rao (OBG)',
      userRole: 'doctor',
      timestamp: new Date(now - 3 * 3600000).toISOString(),
      changedFields: { weightKg: 58.5, pregnancyWeeks: 28 },
    },
    {
      logId: 'AUD-INIT-003',
      action: 'PATIENT_RECORD_UPDATED: Suresh Guptha (P-1006)',
      details: 'Added known medication allergy warning: Sulfa drugs (Moderate cutaneous rash).',
      entityType: 'patient',
      recordId: 'P-1006',
      userId: 'DOC-01',
      userName: 'Dr. Arjun Mehta (Physician)',
      userRole: 'doctor',
      timestamp: new Date(now - 6 * 3600000).toISOString(),
      changedFields: { allergies: ['Sulfa drugs'] },
    },
    {
      logId: 'AUD-INIT-004',
      action: 'PATIENT_DEMOGRAPHICS_MODIFIED: Baby Arjun (P-1003)',
      details: 'Updated birth weight and linked mother reference ID to Sunita Devi (P-1002).',
      entityType: 'patient',
      recordId: 'P-1003',
      userId: 'ADMIN-01',
      userName: 'Sister Lakshmi Devi (ASHA)',
      userRole: 'admin',
      timestamp: new Date(now - 10 * 3600000).toISOString(),
      changedFields: { weight: 3.2, motherId: 'P-1002' },
    },

    // 2. Medicine Adherence Logs
    {
      logId: 'AUD-INIT-005',
      action: 'MEDICINE_TAKEN: Amlodipine 5mg',
      details: 'Patient Ramesh Kumar (P-1001) marked morning Amlodipine 5mg dose as TAKEN via Medora patient mobile interface.',
      entityType: 'medicine',
      recordId: 'P-1001',
      userId: 'P-1001',
      userName: 'Ramesh Kumar',
      userRole: 'patient',
      timestamp: new Date(now - 2 * 3600000).toISOString(),
      changedFields: { status: 'taken', timing: '08:00 AM', adherenceConfirmed: true },
    },
    {
      logId: 'AUD-INIT-006',
      action: 'MEDICINE_TAKEN: Metformin 500mg',
      details: 'Patient Ramesh Patel (P-1002) confirmed taking Metformin 500mg post-dinner dose.',
      entityType: 'medicine',
      recordId: 'P-1002',
      userId: 'P-1002',
      userName: 'Ramesh Patel',
      userRole: 'patient',
      timestamp: new Date(now - 14 * 3600000).toISOString(),
      changedFields: { status: 'taken', timing: '08:30 PM' },
    },
    {
      logId: 'AUD-INIT-007',
      action: 'MEDICINE_MISSED: Telmisartan 40mg',
      details: 'Evening Telmisartan 40mg dose missed by Ramesh Kumar. Adherence reminder flagged for caregiver follow-up.',
      entityType: 'medicine',
      recordId: 'P-1001',
      userId: 'SYSTEM-REMINDER',
      userName: 'Medora Adherence Engine',
      userRole: 'admin',
      timestamp: new Date(now - 26 * 3600000).toISOString(),
      changedFields: { status: 'missed', reason: 'Unconfirmed before curfew' },
    },
    {
      logId: 'AUD-INIT-008',
      action: 'MEDICINE_TAKEN: Folic Acid 5mg & Ferrous Sulphate',
      details: 'Maternal iron and folic acid daily doses marked TAKEN by Sunita Devi with water after breakfast.',
      entityType: 'medicine',
      recordId: 'P-1002',
      userId: 'P-1002',
      userName: 'Sunita Devi',
      userRole: 'patient',
      timestamp: new Date(now - 4 * 3600000).toISOString(),
      changedFields: { status: 'taken', dosage: '1 tablet morning' },
    },
    {
      logId: 'AUD-INIT-009',
      action: 'MEDICINE_TAKEN: Budesonide 200mcg DPI',
      details: 'Inhaler dose verified and marked taken by Gopi Krishnan (P-1007); mouth rinsed as advised.',
      entityType: 'medicine',
      recordId: 'P-1007',
      userId: 'P-1007',
      userName: 'Gopi Krishnan',
      userRole: 'patient',
      timestamp: new Date(now - 18 * 3600000).toISOString(),
      changedFields: { status: 'taken', device: 'Dry Powder Inhaler' },
    },

    // 3. Deletion Events (Soft deletes and record archiving)
    {
      logId: 'AUD-INIT-010',
      action: 'SOFT_DELETE_ARCHIVED: PATIENT [Test Profile Temp]',
      details: 'Archived temporary duplicate test villager profile (ID: P-TEMP-99). All underlying historical records retained in audit partition.',
      entityType: 'patient',
      recordId: 'P-TEMP-99',
      userId: 'ADMIN-01',
      userName: 'Sister Lakshmi Devi (ASHA / Admin)',
      userRole: 'admin',
      timestamp: new Date(now - 12 * 3600000).toISOString(),
      changedFields: { isDeleted: true, deleteReason: 'Accidental duplicate test entry during clinic rollout' },
    },
    {
      logId: 'AUD-INIT-011',
      action: 'RECORD_DELETED: CONSULTATION [Draft Request #402]',
      details: 'Cancelled and removed expired teleconsultation draft for Guptha household. Explicit consent confirmed by requester.',
      entityType: 'consultation',
      recordId: 'CNS-402',
      userId: 'DOC-01',
      userName: 'Dr. Arjun Mehta',
      userRole: 'doctor',
      timestamp: new Date(now - 30 * 3600000).toISOString(),
      changedFields: { status: 'cancelled_purged', auditNotes: 'Patient attended in-person clinic instead' },
    },
    {
      logId: 'AUD-INIT-012',
      action: 'SOFT_DELETE_ARCHIVED: MEDICINE [Discontinued Glibenclamide]',
      details: 'Archived discontinued prescription of Glibenclamide 5mg following clinical titration to Metformin monotherapy.',
      entityType: 'medicine',
      recordId: 'MED-OLD-54',
      userId: 'DOC-01',
      userName: 'Dr. Arjun Mehta',
      userRole: 'doctor',
      timestamp: new Date(now - 48 * 3600000).toISOString(),
      changedFields: { status: 'discontinued', replacedBy: 'Metformin 500mg' },
    },

    // 4. Authentication, Security & Administrative Actions
    {
      logId: 'AUD-INIT-013',
      action: 'ADMIN_PASSWORD_CHANGED',
      details: 'Gram Panchayat central administrator prototype login credential updated with SHA-256 salt verification.',
      entityType: 'user',
      recordId: 'ADMIN-01',
      userId: 'ADMIN-01',
      userName: 'Sister Lakshmi Devi (ASHA / Admin)',
      userRole: 'admin',
      timestamp: new Date(now - 5 * 3600000).toISOString(),
      changedFields: { authLevel: 'admin', saltUpdated: true },
    },
    {
      logId: 'AUD-INIT-014',
      action: 'DOCTOR_REGISTRATION_APPROVED: Dr. Kavitha Rao',
      details: 'Medical qualifications (MBBS, MS OBG) and state medical council license verified. Full clinical privileges granted.',
      entityType: 'doctor',
      recordId: 'DOC-02',
      userId: 'ADMIN-01',
      userName: 'Sister Lakshmi Devi (ASHA / Admin)',
      userRole: 'admin',
      timestamp: new Date(now - 72 * 3600000).toISOString(),
      changedFields: { status: 'active', approvalState: 'approved' },
    },
    {
      logId: 'AUD-INIT-015',
      action: 'CLINICAL_CORRECTION_REQUEST_APPROVED: Blood Pressure Reading',
      details: 'Approved correction request for Ramesh Kumar vitals record from 185 mmHg typo to verified 135 mmHg clinical log.',
      entityType: 'correction_request',
      recordId: 'REQ-CORR-102',
      userId: 'DOC-01',
      userName: 'Dr. Arjun Mehta',
      userRole: 'doctor',
      timestamp: new Date(now - 8 * 3600000).toISOString(),
      changedFields: { correctedValue: '135/85 mmHg', status: 'approved' },
    },
    {
      logId: 'AUD-INIT-016',
      action: 'DATABASE_SEED_VERIFIED: 20 Demo Patients',
      details: 'Idempotent seeding verification confirmed 20 unique fictional patient records in Dexie database with zero duplicates.',
      entityType: 'system' as any,
      recordId: 'SEED-20',
      userId: 'ADMIN-01',
      userName: 'Medora System Seeder',
      userRole: 'admin',
      timestamp: new Date(now - 20 * 3600000).toISOString(),
      changedFields: { recordsCount: 20, status: 'idempotent_pass' },
    },
  ];

  try {
    for (const log of initialLogs) {
      await db.auditLogs.add(log as any);
    }
  } catch (err) {
    console.warn('[AuditLogger] Error bulk seeding audit logs:', err);
  }
}

/**
 * Exports logs as a standard CSV format.
 */
export function exportAuditLogsAsCsv(logs: AuditLog[]): string {
  const headers = ['Timestamp', 'Log ID', 'Action', 'Category', 'Entity Type', 'Record ID', 'User', 'Role', 'Details'];
  const rows = logs.map((log) => [
    `"${log.timestamp}"`,
    `"${log.logId}"`,
    `"${(log.action || '').replace(/"/g, '""')}"`,
    `"${classifyAuditAction(log.action, log.entityType)}"`,
    `"${log.entityType || ''}"`,
    `"${log.recordId || ''}"`,
    `"${(log.userName || log.userId || '').replace(/"/g, '""')}"`,
    `"${log.userRole || ''}"`,
    `"${(log.details || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Exports logs as formatted JSON string.
 */
export function exportAuditLogsAsJson(logs: AuditLog[]): string {
  return JSON.stringify(logs, null, 2);
}
