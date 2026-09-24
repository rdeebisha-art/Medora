import { MedicalCondition } from '../types';
import { MEDICAL_CONDITIONS } from './conditionList';
import { MORE_MEDICAL_CONDITIONS } from './moreConditions';
import { RURAL_CONDITIONS } from './ruralConditions';
import { RURAL_CONDITIONS_TWO } from './ruralConditionsTwo';
import { RURAL_CONDITIONS_THREE } from './ruralConditionsThree';

export const ALL_CONDITIONS: Record<string, MedicalCondition> = {
  ...MEDICAL_CONDITIONS,
  ...MORE_MEDICAL_CONDITIONS,
  ...RURAL_CONDITIONS,
  ...RURAL_CONDITIONS_TWO,
  ...RURAL_CONDITIONS_THREE
};

export function getConditionById(id: string): MedicalCondition | undefined {
  return ALL_CONDITIONS[id];
}

export function searchConditionsBySymptom(symptomConcept: string): MedicalCondition[] {
  return Object.values(ALL_CONDITIONS).filter(
    (c) => c.commonSymptoms.includes(symptomConcept) || c.associatedSymptoms.includes(symptomConcept)
  );
}
