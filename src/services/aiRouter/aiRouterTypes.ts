export type AIRequestType =
  | 'VOICE'
  | 'MEDICAL'
  | 'NAVIGATION'
  | 'EMERGENCY';

export type AIResponseSource =
  | 'VOICE_AI'
  | 'MEDICAL_AI'
  | 'LOCAL_NAVIGATION'
  | 'EMERGENCY_TRIAGE';

export interface AIRouterDecision {
  targetSystem: AIResponseSource;
  requestType: AIRequestType;
  reason: string;
  isEmergency: boolean;
  requiresDoctorReview: boolean;
  destinationRoute?: string;
}
