import { describe, it, expect } from 'vitest';
import { voiceCommandMatcher } from './voiceCommandMatcher';

describe('Voice Navigation Command Matcher', () => {
  describe('English (en-IN)', () => {
    const medicineCases = [
      'go to medicines',
      'open medicines',
      'show medicines',
      'open medication',
      'show my medicines',
      'medicine reminders',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches English medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'en');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('en-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'open dashboard',
      'go to dashboard',
      'show dashboard',
      'open home',
      'go home',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches English dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'en');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('en-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'open emergency',
      'go to emergency',
      'show emergency',
      'open emergency help',
      'emergency',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches English emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'en');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('en-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Tamil (ta-IN)', () => {
    const medicineCases = [
      'மருந்துகளுக்கு செல்',
      'மருந்துகளை திற',
      'மருந்துகளை காட்டு',
      'என் மருந்துகளை காட்டு',
      'மருந்து நினைவூட்டல்கள்',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches Tamil medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ta');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('ta-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'டாஷ்போர்டை திற',
      'டாஷ்போர்டுக்கு செல்',
      'முகப்பை திற',
      'முகப்புக்கு செல்',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches Tamil dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ta');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('ta-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'அவசரநிலையை திற',
      'அவசர உதவிக்கு செல்',
      'அவசர உதவி',
      'அவசரநிலையை காட்டு',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches Tamil emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ta');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('ta-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Hindi (hi-IN)', () => {
    const medicineCases = [
      'दवाइयों पर जाएं',
      'दवाइयां खोलो',
      'मेरी दवाइयां दिखाओ',
      'दवा रिमाइंडर खोलो',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches Hindi medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'hi');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('hi-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'डैशबोर्ड खोलो',
      'डैशबोर्ड पर जाएं',
      'होम खोलो',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches Hindi dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'hi');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('hi-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'आपातकाल खोलो',
      'आपातकाल पर जाएं',
      'आपातकालीन सहायता खोलो',
      'आपातकाल',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches Hindi emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'hi');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('hi-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Telugu (te-IN)', () => {
    const medicineCases = [
      'మందులకు వెళ్ళండి',
      'మందులను తెరవండి',
      'నా మందులను చూపించండి',
      'మందుల రిమైండర్లు',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches Telugu medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'te');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('te-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'డాష్‌బోర్డ్ తెరవండి',
      'డాష్‌బోర్డ్‌కు వెళ్ళండి',
      'హోమ్ తెరవండి',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches Telugu dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'te');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('te-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'అత్యవసర పరిస్థితిని తెరవండి',
      'అత్యవసర సహాయానికి వెళ్ళండి',
      'అత్యవసర సహాయం',
      'అత్యవసర పరిస్థితిని చూపించండి',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches Telugu emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'te');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('te-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Malayalam (ml-IN)', () => {
    const medicineCases = [
      'മരുന്നുകളിലേക്ക് പോകുക',
      'മരുന്നുകൾ തുറക്കുക',
      'എന്റെ മരുന്നുകൾ കാണിക്കുക',
      'മരുന്ന് റിമൈൻഡറുകൾ',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches Malayalam medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ml');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('ml-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'ഡാഷ്ബോർഡ് തുറക്കുക',
      'ഡാഷ്ബോർഡിലേക്ക് പോകുക',
      'ഹോം തുറക്കുക',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches Malayalam dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ml');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('ml-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'അടിയന്തരാവസ്ഥ തുറക്കുക',
      'അടിയന്തര സഹായത്തിലേക്ക് പോകുക',
      'അടിയന്തര സഹായം',
      'അടിയന്തരാവസ്ഥ കാണിക്കുക',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches Malayalam emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'ml');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('ml-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Kannada (kn-IN)', () => {
    const medicineCases = [
      'ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ',
      'ಔಷಧಿಗಳನ್ನು ತೆರೆಯಿರಿ',
      'ನನ್ನ ಔಷಧಿಗಳನ್ನು ತೋರಿಸಿ',
      'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
    ];

    medicineCases.forEach((cmd) => {
      it(`matches Kannada medicine command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'kn');
        expect(result.intent).toBe('MEDICINES');
        expect(result.language).toBe('kn-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const dashboardCases = [
      'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
      'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
      'ಹೋಮ್ ತೆರೆಯಿರಿ',
    ];

    dashboardCases.forEach((cmd) => {
      it(`matches Kannada dashboard command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'kn');
        expect(result.intent).toBe('DASHBOARD');
        expect(result.language).toBe('kn-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    const emergencyCases = [
      'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ತೆರೆಯಿರಿ',
      'ತುರ್ತು ಸಹಾಯಕ್ಕೆ ಹೋಗಿ',
      'ತುರ್ತು ಸಹಾಯ',
      'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ತೋರಿಸಿ',
    ];

    emergencyCases.forEach((cmd) => {
      it(`matches Kannada emergency command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'kn');
        expect(result.intent).toBe('EMERGENCY');
        expect(result.language).toBe('kn-IN');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('normalization', () => {
    it('normalizes spaces and casing: " go to medicines "', () => {
      const result = voiceCommandMatcher.matchCommand(' go to medicines ', 'en');
      expect(result.intent).toBe('MEDICINES');
    });

    it('normalizes uppercase: "GO TO MEDICINES"', () => {
      const result = voiceCommandMatcher.matchCommand('GO TO MEDICINES', 'en');
      expect(result.intent).toBe('MEDICINES');
    });

    it('normalizes title case: "Go To Medicines"', () => {
      const result = voiceCommandMatcher.matchCommand('Go To Medicines', 'en');
      expect(result.intent).toBe('MEDICINES');
    });

    it('normalizes punctuation exclamation mark: "open dashboard!"', () => {
      const result = voiceCommandMatcher.matchCommand('open dashboard!', 'en');
      expect(result.intent).toBe('DASHBOARD');
    });

    it('normalizes punctuation period: "open emergency."', () => {
      const result = voiceCommandMatcher.matchCommand('open emergency.', 'en');
      expect(result.intent).toBe('EMERGENCY');
    });
  });

  describe('unknown commands', () => {
    const unknownCases = [
      'tell me a joke',
      'what is the weather',
      'play music',
      'hello',
      'random unknown command',
    ];

    unknownCases.forEach((cmd) => {
      it(`does not match unknown command: "${cmd}"`, () => {
        const result = voiceCommandMatcher.matchCommand(cmd, 'en');
        expect(result.intent).toBeNull();
        expect(result.matched).toBe(false);
      });
    });
  });

  describe('ambiguous commands', () => {
    it('does not route ambiguous single word "health" as MEDICINES', () => {
      const result = voiceCommandMatcher.matchCommand('health', 'en');
      // "health" should match MY_HEALTH, not MEDICINES
      expect(result.intent).not.toBe('MEDICINES');
    });
  });
});
