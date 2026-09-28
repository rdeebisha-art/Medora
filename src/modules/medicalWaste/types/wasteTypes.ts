export type MedicalWasteRole = 'admin' | 'facility_staff' | 'waste_worker' | 'patient_family';

export type SegregationStream =
  | 'SHARPS'
  | 'INFECTIOUS'
  | 'PHARMACEUTICAL'
  | 'GENERAL'
  | 'CHEMICAL'
  | 'ANATOMICAL'
  | 'MANUAL_INSPECTION'
  | 'UNKNOWN';

export type CollectionStatus =
  | 'SCAN'
  | 'CLASSIFY'
  | 'VERIFY'
  | 'SEGREGATE'
  | 'COLLECT'
  | 'PICKUP'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'COMPLETED';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReviewDecision = 'CORRECT' | 'INCORRECT' | 'UNKNOWN' | 'SPECIALIST_REQUIRED';

export interface WasteCategoryRecord {
  id?: number;
  code: string;
  name: string;
  colorCode: string;
  defaultStream: SegregationStream;
  bagColor: 'WHITE' | 'YELLOW' | 'RED' | 'BLUE' | 'BLACK';
  requiresSpecialHandling: boolean;
  description: string;
  handlingProtocol: string;
  examples: string[];
}

export interface WasteCollectionLocationRecord {
  id?: number;
  locationId: string;
  name: string;
  facilityType: 'PHC' | 'CHC' | 'HOSPITAL' | 'SUB_CENTER' | 'LAB';
  building: string;
  ward: string;
  room?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface WasteContainerRecord {
  id?: number;
  containerId: string;
  qrCode: string;
  wasteCategory: string;
  stream: SegregationStream;
  locationId: string;
  colorCode: string;
  status: 'ACTIVE' | 'FULL' | 'IN_TRANSIT' | 'MAINTENANCE';
  currentFillLevelPercent: number;
  maxCapacityKg: number;
  currentWeightKg: number;
  lastEmptiedAt?: string;
}

export interface ImageQualityAssessment {
  passed: boolean;
  score: number; // 0.0 - 1.0
  isBlurry: boolean;
  isDark: boolean;
  isOverexposed: boolean;
  objectTooSmall: boolean;
  noRelevantObject: boolean;
  multipleUnrelatedObjects: boolean;
  poorFraming: boolean;
  message: string;
}

export interface WasteScanRecord {
  id?: number;
  scanId: string;
  operatorId: string;
  operatorName: string;
  locationId: string;
  locationName: string;
  timestamp: string;
  imageUri: string; // Base64 or object URL
  qualityAssessment: ImageQualityAssessment;
  status: 'ACCEPTED' | 'REJECTED_QUALITY' | 'PENDING_REVIEW' | 'PROCESSED';
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
}

export interface WasteAIPredictionRecord {
  id?: number;
  wasteItemId?: string;
  scanId: string;
  wasteCategory: string;
  detectedObjects: string[];
  visibleIndicators: string[];
  confidence: number; // 0.0 to 1.0 (e.g. 0.91)
  confidenceTier: ConfidenceTier;
  reviewRequired: boolean;
  recommendedStream: SegregationStream;
  modelVersion: string;
  isDemo: boolean;
  createdAt: string;
  inferenceMode: 'REAL_VISION_AI' | 'LOCAL_EDGE_MODEL' | 'DEMO_SIMULATION' | 'MODEL_NOT_CONNECTED';
}

export interface WasteDetectedFeatureRecord {
  id?: number;
  scanId: string;
  featureName: string;
  isPresent: boolean;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WasteManualReviewRecord {
  id?: number;
  reviewId: string;
  scanId: string;
  wasteItemId: string;
  reviewerId: string;
  reviewerName: string;
  originalPrediction: {
    category: string;
    detectedObjects: string[];
    recommendedStream: SegregationStream;
    confidence: number;
  };
  correctedPrediction: {
    category: string;
    detectedObjects: string[];
    recommendedStream: SegregationStream;
  };
  decision: ReviewDecision;
  reason: string;
  timestamp: string;
  modelVersion: string;
  isTrainingEligible: boolean;
}

export interface MedicalWasteItemRecord {
  id?: number;
  wasteItemId: string; // Stable ID e.g. MWI-2026-0001
  scanId: string;
  category: string;
  quantity: number;
  estimatedWeightKg: number;
  locationId: string;
  containerId?: string;
  currentStream: SegregationStream;
  status: CollectionStatus;
  createdAt: string;
  updatedAt: string;
  reviewRequired: boolean;
  reviewId?: string;
  notes?: string;
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
}

export interface WasteCollectionEventRecord {
  id?: number;
  eventId: string;
  wasteItemId: string;
  operatorId: string;
  operatorName: string;
  locationId: string;
  containerId?: string;
  status: CollectionStatus;
  timestamp: string;
  notes?: string;
  weightKg?: number;
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
}

export interface WasteTransportEventRecord {
  id?: number;
  manifestId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  sourceFacility: string;
  destinationFacility: string;
  status: 'SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  departureTime?: string;
  arrivalTime?: string;
  itemCount: number;
  totalWeightKg: number;
  hazardousWarningAcknowledged: boolean;
}

export interface WasteSegregationEventRecord {
  id?: number;
  eventId: string;
  wasteItemId: string;
  scanId: string;
  stream: SegregationStream;
  verifiedBy: string;
  verifierRole: string;
  bagColor: string;
  containerId?: string;
  timestamp: string;
  specialHandlingRequired: boolean;
  notes?: string;
}

export interface AIModelEvaluationMetrics {
  modelVersion: string;
  datasetVersion: string;
  evaluationDate: string;
  testSampleCount: number;
  overallAccuracy: number;
  overallPrecision: number;
  overallRecall: number;
  overallF1: number;
  meanAveragePrecision: number;
  intersectionOverUnion: number;
  confusionMatrix: {
    classes: string[];
    matrix: number[][]; // rows: true, cols: predicted
  };
  perClassMetrics: Record<
    string,
    {
      precision: number;
      recall: number;
      f1: number;
      support: number;
    }
  >;
}
