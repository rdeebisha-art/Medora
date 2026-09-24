import { MedicalCondition } from '../types';
import { MEDICAL_CONDITIONS } from './conditionList';
import { MORE_MEDICAL_CONDITIONS } from './moreConditions';

export const ALL_CONDITIONS: Record<string, MedicalCondition> = {
  ...MEDICAL_CONDITIONS,
  ...MORE_MEDICAL_CONDITIONS
};

export function getConditionById(id: string): MedicalCondition | undefined {
  return ALL_CONDITIONS[id];
}

export function searchConditionsBySymptom(symptomConcept: string): MedicalCondition[] {
  return Object.values(ALL_CONDITIONS).filter(
    (c) => c.commonSymptoms.includes(symptomConcept) || c.associatedSymptoms.includes(symptomConcept)
  );
}
