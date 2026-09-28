import { describe, it, expect } from 'vitest';
import { parseSpokenSymptoms } from './speechTriageParser';

describe('Speech Triage Parser - Web Speech API Integration', () => {
  it('parses English spoken symptoms with duration and severity', () => {
    const input = 'Patient has high fever and severe cough for 3 days with headache';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Fever');
    expect(result.detectedSymptoms).toContain('Cough');
    expect(result.detectedSymptoms).toContain('Headache');
    expect(result.detectedDuration).toBe('3 days');
    expect(result.detectedSeverity).toBe('Severe');
    expect(result.isEmergency).toBe(false);
  });

  it('detects emergency red flags in spoken speech', () => {
    const input = 'I have sudden crushing chest pain and breathing difficulty since morning';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Chest pain');
    expect(result.detectedSymptoms).toContain('Breathing difficulty');
    expect(result.isEmergency).toBe(true);
    expect(result.emergencyReason).toContain('Chest pain');
  });

  it('parses Tamil spoken symptoms correctly', () => {
    const input = 'எனக்கு மூன்று நாட்களாக கடுமையான காய்ச்சல் மற்றும் இருமல் உள்ளது';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Fever');
    expect(result.detectedSymptoms).toContain('Cough');
    expect(result.detectedSeverity).toBe('Severe');
  });

  it('parses Hindi spoken symptoms correctly', () => {
    const input = 'मुझे दो दिन से तेज बुखार और उल्टी है';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Fever');
    expect(result.detectedSymptoms).toContain('Vomiting');
    expect(result.detectedSeverity).toBe('Severe');
  });

  it('parses Telugu spoken symptoms correctly', () => {
    const input = 'నాకు జ్వరం మరియు దగ్గు ఉంది';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Fever');
    expect(result.detectedSymptoms).toContain('Cough');
  });

  it('extracts duration since yesterday', () => {
    const input = 'Loose motion and stomach pain since yesterday';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Diarrhea');
    expect(result.detectedSymptoms).toContain('Stomach pain');
    expect(result.detectedDuration).toBe('Since yesterday');
  });

  it('handles mild symptoms safely without false emergency alarms', () => {
    const input = 'I have mild throat irritation and slight cough';
    const result = parseSpokenSymptoms(input);

    expect(result.detectedSymptoms).toContain('Sore throat');
    expect(result.detectedSymptoms).toContain('Cough');
    expect(result.detectedSeverity).toBe('Mild');
    expect(result.isEmergency).toBe(false);
  });
});
