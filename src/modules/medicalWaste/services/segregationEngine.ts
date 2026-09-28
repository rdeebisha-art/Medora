import { SegregationStream, WasteCategoryRecord } from '../types/wasteTypes';
import { SAFETY_MANDATE } from '../ai/model/classes';
import { INITIAL_WASTE_CATEGORIES } from '../data/initialCategories';

export interface SegregationDecision {
  recommendedStream: SegregationStream;
  bagColor: string;
  containerType: string;
  handlingProtocol: string;
  isHighRisk: boolean;
  requiresSpecialHandling: boolean;
  manualReviewMandatory: boolean;
  explanation: string;
  safetyWarning: string;
}

export function determineSegregationStream(
  categoryCodeOrClass: string,
  confidence: number,
  detectedObjects: string[] = [],
  visibleIndicators: string[] = [],
  categories: WasteCategoryRecord[] = INITIAL_WASTE_CATEGORIES
): SegregationDecision {
  const normCategory = (categoryCodeOrClass || '').toLowerCase().trim();
  const hasSharps =
    visibleIndicators.includes('sharp_object') ||
    detectedObjects.includes('needle') ||
    detectedObjects.includes('syringe') ||
    normCategory.includes('sharp') ||
    normCategory.includes('needle') ||
    normCategory.includes('syringe');

  // Hard safety constraint: Confidence < 70% or unclassified object triggers mandatory manual review
  if (confidence < 0.70 || normCategory === 'unknown' || normCategory === '') {
    return {
      recommendedStream: 'MANUAL_INSPECTION',
      bagColor: 'ORANGE_HOLDING',
      containerType: 'Secured Quarantine Bin (Awaiting Authorized Staff Verification)',
      handlingProtocol: 'DO NOT MOVE. Request facility verification nurse or biohazard officer.',
      isHighRisk: true,
      requiresSpecialHandling: true,
      manualReviewMandatory: true,
      explanation: `Low AI confidence (${Math.round(confidence * 100)}% < 70% threshold) or ambiguous object. Direct segregation is prohibited by institutional protocol.`,
      safetyWarning: `⚠ STOP — MANUAL VERIFICATION REQUIRED.\n${SAFETY_MANDATE}`
    };
  }

  // 1. Sharps stream (Priority: White puncture-resistant container)
  if (hasSharps) {
    return {
      recommendedStream: 'SHARPS',
      bagColor: 'WHITE',
      containerType: 'Puncture-proof translucent sharps container with needle-cutter lid',
      handlingProtocol: 'Deposit directly. Never recap, bend, or break needles by hand. Seal when 3/4 full.',
      isHighRisk: true,
      requiresSpecialHandling: true,
      manualReviewMandatory: confidence < 0.85,
      explanation: 'Item exhibits sharp metallic or puncture hazards requiring dedicated white container protocol.',
      safetyWarning: `CRITICAL SHARPS HAZARD: Risk of percutaneous needle-stick injury and blood-borne pathogen transmission.\n${SAFETY_MANDATE}`
    };
  }

  // 2. Anatomical / Pathological / Blood-soaked (Yellow stream)
  if (
    normCategory.includes('anatomical') ||
    normCategory.includes('patholog') ||
    normCategory.includes('dress') ||
    normCategory.includes('blood') ||
    visibleIndicators.includes('visible_leakage_indicator') ||
    visibleIndicators.includes('biohazard_symbol')
  ) {
    return {
      recommendedStream: 'INFECTIOUS',
      bagColor: 'YELLOW',
      containerType: 'Heavy-duty non-chlorinated yellow biohazard plastic bag',
      handlingProtocol: 'Double-bagged. Securely knot with biohazard label. Destined for controlled incineration/autoclaving.',
      isHighRisk: true,
      requiresSpecialHandling: true,
      manualReviewMandatory: confidence < 0.85,
      explanation: 'Potentially infectious biological waste, blood-contaminated gauze, or body fluids.',
      safetyWarning: `BIOHAZARD WARNING: Pathogenic biological fluid risk. Wear double latex/nitrile gloves and protective apron.`
    };
  }

  // 3. Contaminated Plastics / Gloves / Masks (Red / Yellow stream)
  if (
    normCategory.includes('glove') ||
    normCategory.includes('mask') ||
    normCategory.includes('plastic') ||
    detectedObjects.includes('used_glove') ||
    detectedObjects.includes('used_mask')
  ) {
    return {
      recommendedStream: 'INFECTIOUS',
      bagColor: 'RED',
      containerType: 'Autoclavable Red Biohazard Bag (Plastic Recyclable Stream)',
      handlingProtocol: 'Disinfect by chemical soaking or autoclaving before shredding and recycling.',
      isHighRisk: false,
      requiresSpecialHandling: true,
      manualReviewMandatory: confidence < 0.85,
      explanation: 'Contaminated recyclable medical polymer/plastic item.',
      safetyWarning: 'Infectious surface hazard. Do not mix with general municipal waste.'
    };
  }

  // 4. Pharmaceutical / Cytotoxic (Brown or Cardboard Box stream)
  if (
    normCategory.includes('pharma') ||
    normCategory.includes('medicine') ||
    normCategory.includes('drug') ||
    normCategory.includes('bottle') ||
    normCategory.includes('vial') ||
    detectedObjects.includes('medicine_bottle') ||
    detectedObjects.includes('medicine_packaging')
  ) {
    return {
      recommendedStream: 'PHARMACEUTICAL',
      bagColor: 'BROWN_OR_CARDBOARD',
      containerType: 'Rigid cardboard box / brown container with pharmaceutical liner',
      handlingProtocol: 'Return to pharmacy inventory or high-temperature incineration/encapsulation.',
      isHighRisk: true,
      requiresSpecialHandling: true,
      manualReviewMandatory: confidence < 0.85,
      explanation: 'Discarded medicinal formulations, expired pharmaceuticals, or cytotoxic residuals.',
      safetyWarning: 'Chemical toxicity hazard. Do not pour into municipal drains or throw into municipal dumpsters.'
    };
  }

  // 5. General Healthcare Waste (Black / Green municipal stream)
  if (
    normCategory.includes('general') ||
    normCategory.includes('paper') ||
    normCategory.includes('food') ||
    normCategory.includes('office')
  ) {
    return {
      recommendedStream: 'GENERAL',
      bagColor: 'BLACK',
      containerType: 'Standard municipal black waste bin',
      handlingProtocol: 'Safe for municipal solid waste disposal and composting.',
      isHighRisk: false,
      requiresSpecialHandling: false,
      manualReviewMandatory: false,
      explanation: 'Non-contaminated paper, packaging, or canteen waste from non-clinical zones.',
      safetyWarning: 'Verify that this item has had zero contact with blood, secretions, or clinical reagents.'
    };
  }

  // Default fallback to manual review
  return {
    recommendedStream: 'UNKNOWN',
    bagColor: 'ORANGE_HOLDING',
    containerType: 'Quarantine Holding Unit',
    handlingProtocol: 'Awaiting manual inspection by biomedical waste supervisor.',
    isHighRisk: true,
    requiresSpecialHandling: true,
    manualReviewMandatory: true,
    explanation: 'Unspecified category classification requires clinical inspection.',
    safetyWarning: 'Follow institutional biomedical waste protocols.'
  };
}
