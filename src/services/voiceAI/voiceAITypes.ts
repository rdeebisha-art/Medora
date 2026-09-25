/**
 * Types for Medora Voice AI.
 * Voice AI handles ONLY:
 * - normal conversation
 * - greetings
 * - casual speaking
 * - application help
 * - accessibility
 * - navigation
 * - simple non-medical questions
 * - voice interaction
 *
 * It must NEVER diagnose, evaluate symptoms, recommend medicines, or analyze medical records.
 */

import { SupportedLanguageCode } from '../../data/languages';

export interface VoiceAIRequest {
  text: string;
  language?: SupportedLanguageCode | string;
  source?: 'voice' | 'text';
  userName?: string;
}

export interface VoiceAIResponse {
  source: 'VOICE_AI';
  responseText: string;
  language: string;
  isMedicalTransferRecommended: boolean;
  medicalTransferQuery?: string;
  suggestedAction?: 'NAVIGATE' | 'NONE' | 'TRANSFER_TO_MEDICAL_AI';
  destinationRoute?: string;
}
