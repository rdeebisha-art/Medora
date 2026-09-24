export type EvidenceLevel = 'LEVEL_A' | 'LEVEL_B' | 'LEVEL_C' | 'EXPERT_CONSENSUS';
export type ReviewStatus = 'draft' | 'reviewed' | 'approved' | 'retired';

export interface LocalizedString {
  en: string;
  hi: string;
  ta: string;
  te: string;
  ml: string;
  kn: string;
}

export interface MedicalSourceReference {
  organization: string;
  title: string;
  url: string;
  publicationDate: string;
  lastReviewed: string;
  sourceType: 'guideline' | 'programme' | 'clinical_protocol' | 'policy';
}

export interface MedicalCondition {
  id: string;
  names: LocalizedString;
  category: 'infectious' | 'chronic' | 'respiratory' | 'gastrointestinal' | 'emergency' | 'general';
  description: LocalizedString;
  commonSymptoms: string[]; // Concept IDs (e.g., 'FEVER', 'COUGH')
  associatedSymptoms: string[];
  warningSigns: LocalizedString[];
  riskFactors: LocalizedString[];
  recommendedAssessment: LocalizedString[];
  tests: string[]; // Test IDs
  supportiveCare: LocalizedString[];
  treatmentInformation: LocalizedString[];
  prevention: LocalizedString[];
  whenToSeekMedicalCare: LocalizedString[];
  emergencyCriteria: LocalizedString[];
  contraindications: LocalizedString[];
  sourceReferences: MedicalSourceReference[];
  lastReviewed: string;
  evidenceLevel: EvidenceLevel;
  reviewStatus: ReviewStatus;
}

export interface EmergencyRedFlag {
  id: string;
  concept: string;
  symptoms: LocalizedString;
  severity: 'CRITICAL_EMERGENCY' | 'URGENT_EVALUATION';
  immediateActions: LocalizedString[];
  warningNote: LocalizedString;
  recommendedFacility: 'nearest_phc_chc' | 'district_hospital_icu' | 'maternity_emergency';
  source: MedicalSourceReference;
}

export interface MedicineGuideline {
  id: string;
  genericName: string;
  category: string;
  generalIndications: LocalizedString;
  prescribingWarning: LocalizedString;
  commonContraindications: LocalizedString[];
  monitoringGuidance: LocalizedString[];
  safetyRules: {
    neverStopPrescribed: boolean;
    neverDoubleDose: boolean;
    requirePrescription: boolean;
    requireDiagnosticConfirmation: boolean;
  };
  sources: MedicalSourceReference[];
}

export interface TestGuideline {
  testId: string;
  name: LocalizedString;
  purpose: LocalizedString;
  conditionsAssociated: string[];
  whenConsidered: LocalizedString[];
  limitations: LocalizedString[];
  interpretationNotice: LocalizedString;
  sourceReferences: MedicalSourceReference[];
}

export interface FamilyCareGuideline {
  id: string;
  targetGroup: 'pregnancy' | 'postnatal' | 'newborn' | 'child' | 'elderly' | 'vaccination' | 'nutrition';
  title: LocalizedString;
  keyPractices: LocalizedString[];
  dangerSigns: LocalizedString[];
  whenToSeekCare: LocalizedString[];
  nutritionAdvice: LocalizedString[];
  safetyNotes: LocalizedString[];
  sources: MedicalSourceReference[];
}

export interface PreventionGuideline {
  id: string;
  topic: string;
  title: LocalizedString;
  evidenceBasedSteps: LocalizedString[];
  highRiskPrecautions: LocalizedString[];
  communityMeasures: LocalizedString[];
  sources: MedicalSourceReference[];
}

export interface SymptomDefinition {
  conceptId: string;
  name: LocalizedString;
  multilingualAliases: {
    en: string[];
    hi: string[];
    ta: string[];
    te: string[];
    ml: string[];
    kn: string[];
  };
  isRedFlag: boolean;
  associatedConditionIds: string[];
}

export interface MedicalRule {
  ruleId: string;
  triggerSymptoms: string[];
  requiredRedFlags?: string[];
  possibleConditions: string[];
  action: 'EMERGENCY_ESCALATION' | 'ASSESS_WARNING_SIGNS' | 'SUPPORTIVE_AND_REFERRAL' | 'PREVENTIVE_EDUCATION';
  followUpQuestions: LocalizedString[];
  sourceReferences: MedicalSourceReference[];
}

export interface MedicalSafetyValidationResult {
  isSafe: boolean;
  blockedReason?: string;
  emergencyDetected: boolean;
  containsPrescriptionViolation: boolean;
  containsUnsupportedRemedy: boolean;
  hasVerifiedSource: boolean;
  languageConsistent: boolean;
  patientIsolated: boolean;
}

export interface KnowledgeBaseVersion {
  knowledgeBaseVersion: string;
  lastUpdated: string;
  lastReviewed: string;
  reviewStatus: ReviewStatus;
  languageCoverage: string[];
  sourceOrganizations: string[];
  conditionsCount: number;
  emergencyRulesCount: number;
  evidenceBasis: string;
}
