import { AIClass, VisualFeature } from '../types';
import { SegregationStream } from '../../types/wasteTypes';

export const INITIAL_AI_CLASSES: AIClass[] = [
  'syringe',
  'needle',
  'glove',
  'mask',
  'dressing',
  'medicine_packaging',
  'medicine_bottle',
  'sharps_container',
  'contaminated_waste',
  'general_healthcare_waste',
  'unknown'
];

export const VISUAL_FEATURES: VisualFeature[] = [
  'needle',
  'syringe',
  'sharp_object',
  'used_glove',
  'used_mask',
  'dressing',
  'medicine_packaging',
  'medicine_bottle',
  'sharps_container',
  'waste_bag',
  'biohazard_symbol',
  'warning_label',
  'open_container',
  'overflowing_container',
  'damaged_container',
  'visible_leakage_indicator'
];

export const CLASS_DEFAULT_STREAMS: Record<AIClass, SegregationStream> = {
  syringe: 'SHARPS',
  needle: 'SHARPS',
  sharps_container: 'SHARPS',
  glove: 'INFECTIOUS',
  mask: 'INFECTIOUS',
  dressing: 'INFECTIOUS',
  contaminated_waste: 'INFECTIOUS',
  medicine_packaging: 'PHARMACEUTICAL',
  medicine_bottle: 'PHARMACEUTICAL',
  general_healthcare_waste: 'GENERAL',
  unknown: 'MANUAL_INSPECTION'
};

export const CLASS_FRIENDLY_NAMES: Record<AIClass, string> = {
  syringe: 'Syringe / Plunger Assembly',
  needle: 'Hypodermic Needle',
  glove: 'Used Examination / Surgical Glove',
  mask: 'Used Medical / Surgical Mask',
  dressing: 'Soiled Cotton Gauze / Bandage',
  medicine_packaging: 'Blister Pack / Drug Packaging',
  medicine_bottle: 'Vial / Ampoule / Medicine Bottle',
  sharps_container: 'Puncture-Proof Sharps Container',
  contaminated_waste: 'Blood / Fluid Soiled Waste',
  general_healthcare_waste: 'Non-Contaminated General Waste',
  unknown: 'Unclassified / Ambiguous Object'
};

export const SAFETY_MANDATE = `SAFETY DIRECTIVE (Biomedical Waste Handling Rules):
- Visual classification is AI-ASSISTED only.
- Never declare waste "safe to touch" based only on an image.
- Never claim "not hazardous" without physical verification.
- Any object with needle/blade/glass exposure must be treated as SHARPS.
- Wear PPE (gloves, eye protection, apron) before touching waste items.`;
