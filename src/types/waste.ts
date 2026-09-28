export type WasteCategory = 'SHARPS' | 'INFECTIOUS' | 'PLASTIC' | 'GLASS' | 'GENERAL';

export type WasteSafetyStatus = 'VERIFIED_AUTO' | 'REQUIRES_HUMAN_VERIFICATION' | 'ISOLATED' | 'DISPOSED';

export type CollectionFleetType = 'MANUAL' | 'SMART_CART' | 'AUTONOMOUS_ROBOT';

export type PriorityLevel = 'P0_EMERGENCY' | 'P1_CRITICAL' | 'P2_NORMAL' | 'P3_DEFERRED';

export interface SmartWasteBin {
  id?: number;
  binId: string; // e.g. "BIN-PHC01-01"
  facility: string; // e.g. "PHC Kodaikanal"
  ward: string; // e.g. "Emergency & Minor OT"
  wasteCategory: WasteCategory;
  fillLevelPercent: number; // 0 - 100
  weightKg: number;
  maxWeightCapacityKg: number;
  temperatureC: number;
  gasStatus: 'NORMAL' | 'ELEVATED' | 'HAZARDOUS_ALERT';
  batteryPercent: number;
  connectivity: 'ONLINE' | '2G_LOW_BANDWIDTH' | 'OFFLINE';
  lastSyncTime: string;
  status: 'NORMAL' | 'COLLECTION_RECOMMENDED' | 'OVERFLOW_ALERT' | 'HAZARD_ISOLATED';
  historicalFill: { timestamp: string; fillPercent: number; weightKg: number }[];
}

export interface WasteClassificationItem {
  id?: number;
  wasteId: string; // e.g. "MWP-2026-00128"
  imageUrl?: string;
  itemName: string;
  predictedCategory: WasteCategory;
  confidenceScore: number; // 0.0 - 1.0 (e.g. 0.94)
  decision: 'AUTOMATIC_SEGREGATION' | 'ISOLATE_HUMAN_VERIFY';
  safetyStatus: WasteSafetyStatus;
  detectedAt: string;
  facility: string;
  binAssigned: string;
  verifiedBy?: string;
  notes?: string;
}

export interface WasteVerificationQueueItem {
  id?: number;
  verificationId: string;
  wasteId: string;
  itemName: string;
  imageUrl?: string;
  predictedCategory: WasteCategory;
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BIOHAZARD';
  facility: string;
  timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'RECLASSIFIED' | 'ISOLATED';
  verifiedCategory?: WasteCategory;
  operatorNotes?: string;
}

export interface WasteCollectionRequest {
  id?: number;
  requestId: string;
  batchId: string;
  sourceFacility: string;
  destinationFacility: string;
  wasteCategory: WasteCategory;
  estimatedWeightKg: number;
  priority: PriorityLevel;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'COLLECTED' | 'DISPOSED';
  assignedFleet: CollectionFleetType;
  collectorName: string;
  etaMinutes: number;
  scheduledAt: string;
  completedAt?: string;
  qrCodeUrl?: string;
}

export interface ChainOfCustodyEntry {
  step: 'GENERATION' | 'SEGREGATION' | 'COLLECTION' | 'TRANSPORT' | 'HANDOVER' | 'DISPOSAL';
  timestamp: string;
  facility: string;
  actor: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  notes: string;
  gpsCoordinates?: string;
}

export interface DigitalWastePassport {
  id?: number;
  passportId: string; // e.g. "MWP-2026-000184"
  sourceFacility: string;
  wasteCategory: WasteCategory;
  weightKg: number;
  binOrigin: string;
  generatedAt: string;
  segregatedAt?: string;
  collectedAt?: string;
  transportedAt?: string;
  handedOverAt?: string;
  disposedAt?: string;
  disposalFacility: string;
  disposalMethod: 'AUTOCLAVE_SHRED' | 'HIGH_TEMP_INCINERATION' | 'ENCAPSULATION' | 'SECURE_LANDFILL';
  complianceStatus: 'COMPLIANT_CPCB_MOHFW' | 'AUDIT_FLAGGED';
  qrCodeData: string;
  chainOfCustody: ChainOfCustodyEntry[];
}

export interface A2AMessage {
  id?: number;
  messageId: string;
  timestamp: string;
  senderAgent: string;
  recipientAgent: string;
  category: 'HEALTHCARE' | 'BIOMEDICAL_WASTE' | 'EMERGENCY' | 'SYNC';
  action: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  confidence?: number;
  status: 'ACTIVE' | 'PROCESSED' | 'DISPATCHED' | 'ACKNOWLEDGED';
}
