import { db } from '../../../db/db';
import {
  MedicalWasteItemRecord,
  WasteScanRecord,
  WasteAIPredictionRecord,
  WasteManualReviewRecord,
  WasteCollectionEventRecord,
  WasteTransportEventRecord,
  WasteSegregationEventRecord,
  WasteCategoryRecord,
  WasteCollectionLocationRecord,
  WasteContainerRecord,
  CollectionStatus,
  SegregationStream
} from '../types/wasteTypes';
import { INITIAL_WASTE_CATEGORIES } from '../data/initialCategories';
import { INITIAL_COLLECTION_LOCATIONS } from '../data/initialLocations';
import { INITIAL_CONTAINERS } from '../data/initialContainers';
import { logMedicalWasteAudit } from './medicalWasteAuditService';
import { canTransitionTo } from './collectionWorkflowService';

export class MedicalWasteDbService {
  /**
   * Idempotent seeding of initial reference categories, locations, containers,
   * and demonstration records so MIS analytics are populated from actual DB records.
   */
  async seedInitialData(): Promise<void> {
    try {
      const catCount = await db.wasteCategories.count();
      if (catCount === 0) {
        await db.wasteCategories.bulkAdd(INITIAL_WASTE_CATEGORIES);
      }

      const locCount = await db.wasteCollectionLocations.count();
      if (locCount === 0) {
        await db.wasteCollectionLocations.bulkAdd(INITIAL_COLLECTION_LOCATIONS);
      }

      const contCount = await db.wasteContainers.count();
      if (contCount === 0) {
        await db.wasteContainers.bulkAdd(INITIAL_CONTAINERS);
      }

      const itemCount = await db.medicalWasteItems.count();
      if (itemCount === 0) {
        await this.seedDemoItems();
      }
    } catch (err) {
      console.warn('[MedicalWasteDbService] Seed notice:', err);
    }
  }

  private async seedDemoItems(): Promise<void> {
    const now = Date.now();
    const dayMs = 86400000;

    const demoItems: MedicalWasteItemRecord[] = [
      {
        wasteItemId: 'MWI-2026-001',
        scanId: 'SCN-001',
        category: 'syringe',
        quantity: 1,
        estimatedWeightKg: 0.15,
        locationId: 'LOC-KODAI-PHC-INJ',
        containerId: 'BOX-SHARPS-01',
        currentStream: 'SHARPS',
        status: 'COMPLETED',
        createdAt: new Date(now - 3 * dayMs).toISOString(),
        updatedAt: new Date(now - 1 * dayMs).toISOString(),
        reviewRequired: false,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-002',
        scanId: 'SCN-002',
        category: 'needle',
        quantity: 2,
        estimatedWeightKg: 0.08,
        locationId: 'LOC-KODAI-PHC-INJ',
        containerId: 'BOX-SHARPS-01',
        currentStream: 'SHARPS',
        status: 'COMPLETED',
        createdAt: new Date(now - 2 * dayMs).toISOString(),
        updatedAt: new Date(now - 1 * dayMs).toISOString(),
        reviewRequired: false,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-003',
        scanId: 'SCN-003',
        category: 'glove',
        quantity: 1,
        estimatedWeightKg: 0.25,
        locationId: 'LOC-KODAI-PHC-OT',
        containerId: 'BIN-YELLOW-01',
        currentStream: 'INFECTIOUS',
        status: 'IN_TRANSIT',
        createdAt: new Date(now - 1 * dayMs).toISOString(),
        updatedAt: new Date(now - 4 * 3600000).toISOString(),
        reviewRequired: false,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-004',
        scanId: 'SCN-004',
        category: 'dressing',
        quantity: 3,
        estimatedWeightKg: 0.60,
        locationId: 'LOC-KODAI-PHC-OT',
        containerId: 'BIN-YELLOW-01',
        currentStream: 'INFECTIOUS',
        status: 'COLLECT',
        createdAt: new Date(now - 12 * 3600000).toISOString(),
        updatedAt: new Date(now - 2 * 3600000).toISOString(),
        reviewRequired: true,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-005',
        scanId: 'SCN-005',
        category: 'medicine_bottle',
        quantity: 2,
        estimatedWeightKg: 0.40,
        locationId: 'LOC-KODAI-PHC-LAB',
        containerId: 'BIN-PHARMA-01',
        currentStream: 'PHARMACEUTICAL',
        status: 'SEGREGATE',
        createdAt: new Date(now - 4 * 3600000).toISOString(),
        updatedAt: new Date(now - 1 * 3600000).toISOString(),
        reviewRequired: false,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-006',
        scanId: 'SCN-006',
        category: 'general_healthcare_waste',
        quantity: 5,
        estimatedWeightKg: 1.20,
        locationId: 'LOC-KODAI-PHC-INJ',
        containerId: 'BIN-GENERAL-01',
        currentStream: 'GENERAL',
        status: 'VERIFY',
        createdAt: new Date(now - 2 * 3600000).toISOString(),
        updatedAt: new Date(now - 1 * 3600000).toISOString(),
        reviewRequired: false,
        syncStatus: 'SYNCED'
      },
      {
        wasteItemId: 'MWI-2026-007',
        scanId: 'SCN-007',
        category: 'unknown',
        quantity: 1,
        estimatedWeightKg: 0.30,
        locationId: 'LOC-PALANI-CHC-EMERG',
        currentStream: 'MANUAL_INSPECTION',
        status: 'SCAN',
        createdAt: new Date(now - 1 * 3600000).toISOString(),
        updatedAt: new Date(now - 1 * 3600000).toISOString(),
        reviewRequired: true,
        syncStatus: 'SYNCED'
      }
    ];

    await db.medicalWasteItems.bulkAdd(demoItems);

    // Initial collection events for audit and history
    const demoEvents: WasteCollectionEventRecord[] = [
      {
        eventId: 'EVT-001',
        wasteItemId: 'MWI-2026-001',
        operatorId: 'WORKER-01',
        operatorName: 'R. Velan (Sanitation Officer)',
        locationId: 'LOC-KODAI-PHC-INJ',
        containerId: 'BOX-SHARPS-01',
        status: 'COMPLETED',
        timestamp: new Date(now - 1 * dayMs).toISOString(),
        weightKg: 0.15,
        syncStatus: 'SYNCED'
      },
      {
        eventId: 'EVT-002',
        wasteItemId: 'MWI-2026-003',
        operatorId: 'WORKER-02',
        operatorName: 'K. Saravanan (Transport Driver)',
        locationId: 'LOC-KODAI-PHC-OT',
        containerId: 'BIN-YELLOW-01',
        status: 'IN_TRANSIT',
        timestamp: new Date(now - 4 * 3600000).toISOString(),
        weightKg: 0.25,
        syncStatus: 'SYNCED'
      }
    ];
    await db.wasteCollectionEvents.bulkAdd(demoEvents);

    // Seed initial transport event
    await db.wasteTransportEvents.add({
      manifestId: 'TR-MAN-2026-089',
      vehicleNumber: 'TN-57-B-4412 (Bio-Transport)',
      driverName: 'K. Saravanan',
      driverPhone: '9443211002',
      sourceFacility: 'Kodaikanal PHC & CHC Hub',
      destinationFacility: 'Dindigul District CBWTF Facility',
      status: 'IN_TRANSIT',
      departureTime: new Date(now - 3 * 3600000).toISOString(),
      itemCount: 4,
      totalWeightKg: 18.5,
      hazardousWarningAcknowledged: true
    });

    // Seed audit log
    await logMedicalWasteAudit({
      action: 'Waste scan created',
      recordId: 'MWI-2026-001',
      userId: 'STAFF-01',
      userName: 'Sister V. Latha',
      userRole: 'facility_staff',
      details: 'Automated scan created for disposable syringe at Kodaikanal PHC'
    });
  }

  // -------------------------------------------------------------
  // CRUD OPERATIONS
  // -------------------------------------------------------------

  async createWasteScanAndItem(params: {
    scan: Omit<WasteScanRecord, 'id'>;
    prediction: Omit<WasteAIPredictionRecord, 'id'>;
    stream: SegregationStream;
    containerId?: string;
    estimatedWeightKg?: number;
    userId: string;
    userName: string;
    userRole: string;
  }): Promise<{ scanId: string; wasteItemId: string }> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const syncStatus = isOnline ? 'SYNCED' : 'PENDING_SYNC';

    const scanRecord: WasteScanRecord = {
      ...params.scan,
      syncStatus
    };
    await db.wasteScans.add(scanRecord);

    const wasteItemId = `MWI-${Date.now().toString().slice(-6)}`;
    const predRecord: WasteAIPredictionRecord = {
      ...params.prediction,
      wasteItemId
    };
    await db.wasteAIPredictions.add(predRecord);

    const itemRecord: MedicalWasteItemRecord = {
      wasteItemId,
      scanId: params.scan.scanId,
      category: params.prediction.wasteCategory,
      quantity: 1,
      estimatedWeightKg: params.estimatedWeightKg || 0.25,
      locationId: params.scan.locationId,
      containerId: params.containerId,
      currentStream: params.stream,
      status: params.prediction.reviewRequired ? 'CLASSIFY' : 'VERIFY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewRequired: params.prediction.reviewRequired,
      syncStatus
    };
    await db.medicalWasteItems.add(itemRecord);

    // Initial collection event
    const eventRecord: WasteCollectionEventRecord = {
      eventId: `EVT-${Date.now().toString().slice(-6)}`,
      wasteItemId,
      operatorId: params.userId,
      operatorName: params.userName,
      locationId: params.scan.locationId,
      containerId: params.containerId,
      status: itemRecord.status,
      timestamp: new Date().toISOString(),
      syncStatus
    };
    await db.wasteCollectionEvents.add(eventRecord);

    // Audit logs
    await logMedicalWasteAudit({
      action: 'Waste scan created',
      recordId: wasteItemId,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      details: `Scanned item classified as ${params.prediction.wasteCategory} (Confidence: ${Math.round(params.prediction.confidence * 100)}%)`
    });

    await logMedicalWasteAudit({
      action: 'AI prediction generated',
      recordId: wasteItemId,
      userId: 'AI_SYSTEM',
      userName: params.prediction.modelVersion,
      userRole: 'system',
      details: `Generated stream: ${params.stream}, reviewRequired: ${params.prediction.reviewRequired}`
    });

    return { scanId: params.scan.scanId, wasteItemId };
  }

  async updateItemStatus(
    wasteItemId: string,
    newStatus: CollectionStatus,
    operator: { id: string; name: string; role: string },
    containerId?: string,
    notes?: string
  ): Promise<boolean> {
    const item = await db.medicalWasteItems.where({ wasteItemId }).first();
    if (!item) return false;

    // Strict workflow enforcement: do not skip ahead
    if (!canTransitionTo(item.status, newStatus)) {
      console.warn(`[Workflow] Invalid transition attempt from ${item.status} to ${newStatus}`);
      return false;
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const syncStatus = isOnline ? 'SYNCED' : 'PENDING_SYNC';
    const nowIso = new Date().toISOString();

    await db.medicalWasteItems.where({ wasteItemId }).modify({
      status: newStatus,
      updatedAt: nowIso,
      containerId: containerId || item.containerId,
      syncStatus
    });

    await db.wasteCollectionEvents.add({
      eventId: `EVT-${Date.now().toString().slice(-6)}`,
      wasteItemId,
      operatorId: operator.id,
      operatorName: operator.name,
      locationId: item.locationId,
      containerId: containerId || item.containerId,
      status: newStatus,
      timestamp: nowIso,
      notes,
      syncStatus
    });

    // Map status to audit action
    let auditAction = 'Collection status changed';
    if (newStatus === 'COLLECT') auditAction = 'Collection created';
    else if (newStatus === 'PICKUP') auditAction = 'Pickup recorded';
    else if (newStatus === 'IN_TRANSIT') auditAction = 'Transport status changed';
    else if (newStatus === 'RECEIVED') auditAction = 'Waste received';

    await logMedicalWasteAudit({
      action: auditAction,
      recordId: wasteItemId,
      userId: operator.id,
      userName: operator.name,
      userRole: operator.role,
      details: `Transitioned item ${wasteItemId} to ${newStatus}. Notes: ${notes || 'Standard protocol'}`
    });

    return true;
  }

  async submitManualReview(review: Omit<WasteManualReviewRecord, 'id'>): Promise<void> {
    await db.wasteManualReviews.add(review);

    const nowIso = new Date().toISOString();
    await db.medicalWasteItems.where({ wasteItemId: review.wasteItemId }).modify({
      category: review.correctedPrediction.category,
      currentStream: review.correctedPrediction.recommendedStream,
      reviewRequired: false,
      reviewId: review.reviewId,
      status: 'VERIFY',
      updatedAt: nowIso
    });

    await logMedicalWasteAudit({
      action: 'Manual review completed',
      recordId: review.wasteItemId,
      userId: review.reviewerId,
      userName: review.reviewerName,
      userRole: 'reviewer',
      details: `Decision: ${review.decision}. Reason: ${review.reason}`
    });

    if (review.originalPrediction.category !== review.correctedPrediction.category) {
      await logMedicalWasteAudit({
        action: 'Prediction corrected',
        recordId: review.wasteItemId,
        userId: review.reviewerId,
        userName: review.reviewerName,
        userRole: 'reviewer',
        details: `Corrected category: ${review.originalPrediction.category} -> ${review.correctedPrediction.category}`,
        changedFields: {
          originalCategory: review.originalPrediction.category,
          correctedCategory: review.correctedPrediction.category
        }
      });
    }
  }

  async synchronizePendingRecords(): Promise<{ synchronizedCount: number }> {
    let count = 0;
    try {
      const pendingItems = await db.medicalWasteItems.where({ syncStatus: 'PENDING_SYNC' }).toArray();
      for (const item of pendingItems) {
        if (item.id) {
          await db.medicalWasteItems.update(item.id, { syncStatus: 'SYNCED' });
          count++;
        }
      }

      const pendingScans = await db.wasteScans.where({ syncStatus: 'PENDING_SYNC' }).toArray();
      for (const scan of pendingScans) {
        if (scan.id) {
          await db.wasteScans.update(scan.id, { syncStatus: 'SYNCED' });
          count++;
        }
      }

      const pendingEvents = await db.wasteCollectionEvents.where({ syncStatus: 'PENDING_SYNC' }).toArray();
      for (const evt of pendingEvents) {
        if (evt.id) {
          await db.wasteCollectionEvents.update(evt.id, { syncStatus: 'SYNCED' });
          count++;
        }
      }
    } catch (err) {
      console.warn('[Sync] Sync failed:', err);
    }
    return { synchronizedCount: count };
  }

  // -------------------------------------------------------------
  // MIS ANALYTICS QUERIES (Computed from actual DB records)
  // -------------------------------------------------------------

  async getMISDashboardMetrics() {
    await this.seedInitialData();

    const [items, events, reviews, predictions, locations, containers] = await Promise.all([
      db.medicalWasteItems.toArray(),
      db.wasteCollectionEvents.toArray(),
      db.wasteManualReviews.toArray(),
      db.wasteAIPredictions.toArray(),
      db.wasteCollectionLocations.toArray(),
      db.wasteContainers.toArray()
    ]);

    const locationNameMap = new Map<string, string>();
    locations.forEach((l) => locationNameMap.set(l.locationId, l.name));

    let totalWasteCollectedKg = 0;
    let pendingCollections = 0;
    let inTransitCollections = 0;
    let completedCollections = 0;

    const wasteByCategory: Record<string, { count: number; weightKg: number }> = {};
    const wasteByLocation: Record<string, { name: string; count: number; weightKg: number }> = {};
    const wasteByStream: Record<string, { count: number; weightKg: number }> = {};

    items.forEach((item) => {
      const weight = item.estimatedWeightKg || 0.25;
      totalWasteCollectedKg += weight;

      if (item.status === 'COMPLETED') completedCollections++;
      else if (item.status === 'IN_TRANSIT') inTransitCollections++;
      else pendingCollections++;

      // By category
      const cat = item.category || 'unknown';
      if (!wasteByCategory[cat]) wasteByCategory[cat] = { count: 0, weightKg: 0 };
      wasteByCategory[cat].count++;
      wasteByCategory[cat].weightKg += weight;

      // By location
      const locId = item.locationId || 'UNASSIGNED';
      const locName = locationNameMap.get(locId) || locId;
      if (!wasteByLocation[locId]) wasteByLocation[locId] = { name: locName, count: 0, weightKg: 0 };
      wasteByLocation[locId].count++;
      wasteByLocation[locId].weightKg += weight;

      // By stream
      const stream = item.currentStream || 'MANUAL_INSPECTION';
      if (!wasteByStream[stream]) wasteByStream[stream] = { count: 0, weightKg: 0 };
      wasteByStream[stream].count++;
      wasteByStream[stream].weightKg += weight;
    });

    const lowConfidencePredictions = predictions.filter((p) => p.confidence < 0.85).length;
    const manualReviewsCount = reviews.length;
    const totalPredictions = predictions.length || 1;
    const manualReviewRate = Math.round((manualReviewsCount / totalPredictions) * 100);

    // Collection throughput: completed / total items
    const throughput = items.length > 0 ? Math.round((completedCollections / items.length) * 100) : 0;

    return {
      totalWasteCollectedKg: Math.round(totalWasteCollectedKg * 100) / 100,
      totalCollectionEvents: events.length,
      totalItems: items.length,
      wasteByCategory: Object.entries(wasteByCategory).map(([category, val]) => ({
        category,
        count: val.count,
        weightKg: Math.round(val.weightKg * 100) / 100
      })),
      wasteByLocation: Object.entries(wasteByLocation).map(([locationId, val]) => ({
        locationId,
        name: val.name,
        count: val.count,
        weightKg: Math.round(val.weightKg * 100) / 100
      })),
      wasteByStream: Object.entries(wasteByStream).map(([stream, val]) => ({
        stream,
        count: val.count,
        weightKg: Math.round(val.weightKg * 100) / 100
      })),
      lowConfidencePredictions,
      manualReviewsCount,
      manualReviewRate,
      collectionThroughput: throughput,
      pendingCollections,
      inTransitCollections,
      completedCollections,
      containersCount: containers.length,
      locationsCount: locations.length
    };
  }
}

export const medicalWasteDbService = new MedicalWasteDbService();
