import { describe, it, expect, vi } from 'vitest';
import {
  emergencyVoiceTriggerService,
  EMERGENCY_TRIGGER_PHRASES,
} from './emergencyVoiceTriggerService';

describe('Global Emergency Voice Trigger Service', () => {
  it('detects "help medora" and maps to emergency alert', () => {
    const event = emergencyVoiceTriggerService.evaluateTranscript('Please help medora right now');
    expect(event).not.toBeNull();
    expect(event?.action).toBe('alert');
    expect(event?.detectedPhrase).toBe('help medora');
  });

  it('detects "call 108" and maps to ambulance call', () => {
    // Fast-forward cooldown
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const event = emergencyVoiceTriggerService.evaluateTranscript('Quickly call 108 immediately');
    expect(event).not.toBeNull();
    expect(event?.action).toBe('call108');
  });

  it('detects "call doctor" and maps to doctor call', () => {
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const event = emergencyVoiceTriggerService.evaluateTranscript('Patient collapsed call doctor');
    expect(event).not.toBeNull();
    expect(event?.action).toBe('doctor');
  });

  it('detects Tamil trigger phrases', () => {
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const event = emergencyVoiceTriggerService.evaluateTranscript('எனக்கு அவசர உதவி வேண்டும்');
    expect(event).not.toBeNull();
    expect(event?.action).toBe('alert');
  });

  it('detects Hindi trigger phrases', () => {
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const event = emergencyVoiceTriggerService.evaluateTranscript('जल्दी 108 बुलाओ');
    expect(event).not.toBeNull();
    expect(event?.action).toBe('call108');
  });

  it('ignores non-emergency conversational speech', () => {
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const event = emergencyVoiceTriggerService.evaluateTranscript('I want to check my appointments tomorrow');
    expect(event).toBeNull();
  });

  it('notifies registered listeners upon trigger detection', () => {
    (emergencyVoiceTriggerService as any).lastTriggerTimestamp = 0;
    const mockListener = vi.fn();
    const unsubscribe = emergencyVoiceTriggerService.addListener(mockListener);

    emergencyVoiceTriggerService.evaluateTranscript('Medora Emergency');
    expect(mockListener).toHaveBeenCalled();
    const callArg = mockListener.mock.calls[0][0];
    expect(callArg.action).toBe('alert');

    unsubscribe();
  });
});
