import { medicalAIService, MedicalAnalysisRequest } from './medicalAIService';
import { MedicalAIResponse } from './medicalAITypes';

export function routeMedicalAI(request: MedicalAnalysisRequest): Promise<MedicalAIResponse> {
  return medicalAIService.analyzeMedicalRequest(request);
}

export { medicalAIService };
export * from './medicalAITypes';
export * from './medicalAIPrompt';
