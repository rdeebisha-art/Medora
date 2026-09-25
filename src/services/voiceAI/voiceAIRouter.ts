import { voiceAIService } from './voiceAIService';
import { VoiceAIRequest, VoiceAIResponse } from './voiceAITypes';

export function routeVoiceAI(request: VoiceAIRequest): Promise<VoiceAIResponse> {
  return voiceAIService.processVoiceRequest(request);
}

export { voiceAIService };
export * from './voiceAITypes';
export * from './voiceAIPrompt';
