import { db } from '../../../db/db';

export type MedicalWasteAuditEvent =
  | 'Waste scan created'
  | 'AI prediction generated'
  | 'Manual review completed'
  | 'Prediction corrected'
  | 'Waste category changed'
  | 'Segregation changed'
  | 'Collection created'
  | 'Pickup recorded'
  | 'Transport status changed'
  | 'Waste received'
  | 'Record deleted';

export async function logMedicalWasteAudit(params: {
  action: MedicalWasteAuditEvent | string;
  recordId?: string | number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  changedFields?: Record<string, any>;
}): Promise<void> {
  try {
    const logId = `AUDIT-MW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.auditLogs.add({
      logId,
      recordId: params.recordId,
      entityType: 'medical_waste' as any,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      timestamp: new Date().toISOString(),
      details: params.details,
      changedFields: params.changedFields
    });
  } catch (err) {
    console.warn('[Medical Waste Audit] Failed to write audit entry:', err);
  }
}

export async function getMedicalWasteAuditLogs(limitCount = 100) {
  try {
    const all = await db.auditLogs
      .filter((l) => (l.entityType as string) === 'medical_waste' || (l.action && l.action.toLowerCase().includes('waste')))
      .reverse()
      .limit(limitCount)
      .toArray();
    return all;
  } catch {
    return [];
  }
}
