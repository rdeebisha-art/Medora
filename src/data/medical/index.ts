/**
 * Medora Offline Local Medical Knowledge Base
 * 
 * Bundles JSON-based:
 * 1. Emergency rule definitions & red flags
 * 2. Symptom-to-condition differential diagnostic mappings
 * 3. Multilingual phrase dictionaries (en, ta, hi, te, ml, kn)
 */

import emergencyRulesData from './emergencyRules.json';
import symptomConditionMappingsData from './symptomConditionMappings.json';
import multilingualPhrasesData from './multilingualPhrases.json';
import dictionaryData from './dictionary.json';
import conditionsData from './conditions.json';

export interface EmergencyRule {
  id: string;
  concept: string;
  severity: 'CRITICAL' | 'URGENT' | 'HIGH';
  title: string;
  keywords: Record<string, string[]>;
  redFlags: string[];
  actionGuidance: string;
}

export interface ConditionMapping {
  id: string;
  name: string;
  category: string;
  primarySymptoms: string[];
  secondarySymptoms: string[];
  contradictingSymptoms: string[];
  typicalDuration: string;
  typicalSeverity: string;
  missingInformation: string[];
  reasoning: string;
  recommendedNextStep: string;
}

export interface SymptomDefinition {
  concept: string;
  canonical: string;
  translations: Record<string, string>;
  aliases: Record<string, string[]>;
}

export const EMERGENCY_RULES: EmergencyRule[] = emergencyRulesData.rules as EmergencyRule[];
export const CONDITION_MAPPINGS: ConditionMapping[] = symptomConditionMappingsData.conditions as ConditionMapping[];
export const MULTILINGUAL_SYMPTOMS: Record<string, SymptomDefinition> = multilingualPhrasesData.symptoms as Record<string, SymptomDefinition>;
export const INSUFFICIENT_INFO_MESSAGES = multilingualPhrasesData.insufficientInformationMessages as Record<string, string>;
export const SAFETY_DISCLAIMER = multilingualPhrasesData.safetyDisclaimer;

export {
  emergencyRulesData,
  symptomConditionMappingsData,
  multilingualPhrasesData,
  dictionaryData,
  conditionsData,
};
