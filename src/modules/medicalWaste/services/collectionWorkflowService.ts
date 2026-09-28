import { CollectionStatus } from '../types/wasteTypes';

export const WORKFLOW_STAGES_ORDER: CollectionStatus[] = [
  'SCAN',
  'CLASSIFY',
  'VERIFY',
  'SEGREGATE',
  'COLLECT',
  'PICKUP',
  'IN_TRANSIT',
  'RECEIVED',
  'COMPLETED'
];

export const WORKFLOW_STAGE_LABELS: Record<CollectionStatus, { label: string; icon: string; description: string }> = {
  SCAN: {
    label: '1. Scan & Capture',
    icon: '📷',
    description: 'Image captured via mobile scanner with visual quality check.'
  },
  CLASSIFY: {
    label: '2. AI Classification',
    icon: '🤖',
    description: 'Waste category, visual features, and confidence score computed.'
  },
  VERIFY: {
    label: '3. Clinical Verification',
    icon: '🩺',
    description: 'Healthcare staff confirms or corrects AI recommendation.'
  },
  SEGREGATE: {
    label: '4. Physical Segregation',
    icon: '🗑️',
    description: 'Deposited into designated color-coded container (White/Yellow/Red/Black).'
  },
  COLLECT: {
    label: '5. Collection & Weighing',
    icon: '⚖️',
    description: 'Waste collected by authorized worker, barcoded, and weighed.'
  },
  PICKUP: {
    label: '6. Vehicle Pickup',
    icon: '🚚',
    description: 'Loaded into specialized biomedical transport vehicle manifest.'
  },
  IN_TRANSIT: {
    label: '7. In-Transit GPS',
    icon: '🛣️',
    description: 'Transported under temperature and safety protocols to treatment facility.'
  },
  RECEIVED: {
    label: '8. Facility Received',
    icon: '🏢',
    description: 'Common Bio-medical Waste Treatment Facility (CBWTF) arrival logged.'
  },
  COMPLETED: {
    label: '9. Completed & Treated',
    icon: '✅',
    description: 'Autoclaving, shredding, or incineration completed with disposal certificate.'
  }
};

export function canTransitionTo(currentStatus: CollectionStatus, nextStatus: CollectionStatus): boolean {
  const currentIdx = WORKFLOW_STAGES_ORDER.indexOf(currentStatus);
  const nextIdx = WORKFLOW_STAGES_ORDER.indexOf(nextStatus);

  if (currentIdx === -1 || nextIdx === -1) return false;
  // Strictly enforce forward progression by exactly 1 step (or same step for edits)
  return nextIdx === currentIdx + 1;
}

export function getNextWorkflowStatus(currentStatus: CollectionStatus): CollectionStatus | null {
  const currentIdx = WORKFLOW_STAGES_ORDER.indexOf(currentStatus);
  if (currentIdx === -1 || currentIdx >= WORKFLOW_STAGES_ORDER.length - 1) {
    return null;
  }
  return WORKFLOW_STAGES_ORDER[currentIdx + 1];
}

export function isStageReached(currentStatus: CollectionStatus, stageToCheck: CollectionStatus): boolean {
  const currentIdx = WORKFLOW_STAGES_ORDER.indexOf(currentStatus);
  const checkIdx = WORKFLOW_STAGES_ORDER.indexOf(stageToCheck);
  return checkIdx <= currentIdx;
}
