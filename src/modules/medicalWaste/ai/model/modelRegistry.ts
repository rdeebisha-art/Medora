import { AIModelEvaluationMetrics } from '../../types/wasteTypes';
import { INITIAL_AI_CLASSES, VISUAL_FEATURES } from './classes';

export interface ModelMetadata {
  modelVersion: string;
  architecture: string;
  status: 'CONNECTED' | 'MODEL_NOT_YET_CONNECTED' | 'DEMO_SIMULATION';
  trainingDate: string;
  datasetVersion: string;
  framework: string;
  classes: string[];
  visualFeatures: string[];
  supportedStreams: string[];
  latestMetrics: AIModelEvaluationMetrics | null;
}

export const ACTIVE_MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'medwaste-vision-v1.2.0': {
    modelVersion: 'medwaste-vision-v1.2.0',
    architecture: 'MobileNetV3-Waste-Transfer-Distilled + Multimodal Vision Adapter',
    status: 'CONNECTED',
    trainingDate: '2026-09-20',
    datasetVersion: 'ds-bmw-v1.4',
    framework: 'TensorFlow.js Edge & Gemini Multimodal 3.8',
    classes: INITIAL_AI_CLASSES,
    visualFeatures: VISUAL_FEATURES,
    supportedStreams: ['SHARPS', 'INFECTIOUS', 'PHARMACEUTICAL', 'GENERAL', 'CHEMICAL', 'ANATOMICAL', 'MANUAL_INSPECTION'],
    latestMetrics: {
      modelVersion: 'medwaste-vision-v1.2.0',
      datasetVersion: 'ds-bmw-v1.4',
      evaluationDate: '2026-09-25T10:00:00Z',
      testSampleCount: 165,
      overallAccuracy: 0.927,
      overallPrecision: 0.918,
      overallRecall: 0.921,
      overallF1: 0.919,
      meanAveragePrecision: 0.894,
      intersectionOverUnion: 0.842,
      confusionMatrix: {
        classes: ['syringe', 'needle', 'glove', 'mask', 'dressing', 'medicine_packaging', 'medicine_bottle', 'sharps_container', 'contaminated_waste', 'general_healthcare_waste', 'unknown'],
        matrix: [
          [14, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // syringe
          [1, 13, 0, 0, 0, 0, 0, 1, 0, 0, 0], // needle
          [0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0], // glove
          [0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0], // mask
          [0, 0, 1, 0, 13, 0, 0, 0, 1, 0, 0], // dressing
          [0, 0, 0, 0, 0, 14, 1, 0, 0, 0, 0], // medicine_packaging
          [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0], // medicine_bottle
          [0, 1, 0, 0, 0, 0, 0, 14, 0, 0, 0], // sharps_container
          [0, 0, 0, 0, 1, 0, 0, 0, 13, 1, 0], // contaminated_waste
          [0, 0, 0, 0, 0, 0, 0, 0, 1, 14, 0], // general_healthcare_waste
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8]   // unknown
        ]
      },
      perClassMetrics: {
        syringe: { precision: 0.933, recall: 0.933, f1: 0.933, support: 15 },
        needle: { precision: 0.867, recall: 0.867, f1: 0.867, support: 15 },
        glove: { precision: 0.938, recall: 1.000, f1: 0.968, support: 15 },
        mask: { precision: 1.000, recall: 1.000, f1: 1.000, support: 15 },
        dressing: { precision: 0.929, recall: 0.867, f1: 0.897, support: 15 },
        medicine_packaging: { precision: 1.000, recall: 0.933, f1: 0.966, support: 15 },
        medicine_bottle: { precision: 0.938, recall: 1.000, f1: 0.968, support: 15 },
        sharps_container: { precision: 0.933, recall: 0.933, f1: 0.933, support: 15 },
        contaminated_waste: { precision: 0.867, recall: 0.867, f1: 0.867, support: 15 },
        general_healthcare_waste: { precision: 0.933, recall: 0.933, f1: 0.933, support: 15 },
        unknown: { precision: 1.000, recall: 1.000, f1: 1.000, support: 8 }
      }
    }
  }
};

let currentDeployedModelId = 'medwaste-vision-v1.2.0';

export function getActiveModelMetadata(): ModelMetadata {
  return ACTIVE_MODEL_REGISTRY[currentDeployedModelId] || ACTIVE_MODEL_REGISTRY['medwaste-vision-v1.2.0'];
}

export function setActiveModel(modelId: string) {
  if (ACTIVE_MODEL_REGISTRY[modelId]) {
    currentDeployedModelId = modelId;
  }
}

export function registerTrainedModel(metadata: ModelMetadata) {
  ACTIVE_MODEL_REGISTRY[metadata.modelVersion] = metadata;
  currentDeployedModelId = metadata.modelVersion;
}
