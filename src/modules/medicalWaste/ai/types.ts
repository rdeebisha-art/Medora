import { ImageQualityAssessment, SegregationStream, WasteAIPredictionRecord } from '../types/wasteTypes';

export type AIClass =
  | 'syringe'
  | 'needle'
  | 'glove'
  | 'mask'
  | 'dressing'
  | 'medicine_packaging'
  | 'medicine_bottle'
  | 'sharps_container'
  | 'contaminated_waste'
  | 'general_healthcare_waste'
  | 'unknown';

export type VisualFeature =
  | 'needle'
  | 'syringe'
  | 'sharp_object'
  | 'used_glove'
  | 'used_mask'
  | 'dressing'
  | 'medicine_packaging'
  | 'medicine_bottle'
  | 'sharps_container'
  | 'waste_bag'
  | 'biohazard_symbol'
  | 'warning_label'
  | 'open_container'
  | 'overflowing_container'
  | 'damaged_container'
  | 'visible_leakage_indicator';

export interface InferenceRequest {
  imageBase64: string;
  locationId?: string;
  operatorId?: string;
  forceMode?: 'REAL_VISION_AI' | 'LOCAL_EDGE_MODEL' | 'DEMO_SIMULATION' | 'MODEL_NOT_CONNECTED';
}

export interface InferenceResult {
  wasteCategory: string;
  detectedObjects: string[];
  visibleIndicators: string[];
  confidence: number;
  reviewRequired: boolean;
  recommendedStream: SegregationStream;
  modelVersion: string;
  isDemo: boolean;
  inferenceMode: WasteAIPredictionRecord['inferenceMode'];
  qualityAssessment: ImageQualityAssessment;
  latencyMs: number;
  safetyNotice: string;
}

export interface GroundTruthSample {
  sampleId: string;
  trueClass: AIClass;
  trueFeatures: VisualFeature[];
  expectedStream: SegregationStream;
  imagePath?: string;
  sampleName: string;
  split: 'train' | 'validation' | 'test';
  source: 'MANUAL_ANNOTATION' | 'BENCHMARK_LABELED' | 'VERIFIED_CLINICAL';
  metadata?: Record<string, any>;
}
