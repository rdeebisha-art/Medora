export interface EmergencyKeyword {
  phrases: string[];
  severity: 'CRITICAL' | 'URGENT';
  callNumber: string;
  quickResponse: string;
}

export const EMERGENCY_KEYWORDS: EmergencyKeyword[] = [
  {
    phrases: ['snake bite', 'snakebite', 'bitten by snake', 'snake venom'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'SNAKE BITE — Call 108 NOW. Keep victim still. DO NOT cut, suck, or apply anything to wound.',
  },
  {
    phrases: ['chest pain', 'heart attack', 'cannot breathe', 'difficulty breathing', 'breathless', 'not breathing'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'CARDIAC/RESPIRATORY EMERGENCY — Call 108 IMMEDIATELY. Loosen tight clothing. Do not give food or water.',
  },
  {
    phrases: ['unconscious', 'unresponsive', 'not waking', 'collapsed', 'fainted', 'blacked out'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'UNCONSCIOUS PERSON — Call 108. Place in recovery position (left side). Check breathing.',
  },
  {
    phrases: ['severe bleeding', 'blood not stopping', 'heavy bleeding', 'bleeding a lot', 'bleeding badly'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'SEVERE BLEEDING — Apply FIRM pressure with clean cloth. Do NOT remove cloth. Call 108.',
  },
  {
    phrases: ['seizure', 'convulsion', 'fits', 'shaking uncontrollably'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'SEIZURE — Do NOT restrain. Clear area. Time the seizure. Call 108 if >5 minutes.',
  },
  {
    phrases: ['poisoning', 'swallowed chemicals', 'drank pesticide', 'ate poison', 'overdose'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'POISONING — Call 108. Do NOT induce vomiting unless told by doctor. Bring the container to hospital.',
  },
  {
    phrases: ['allergic reaction', 'throat swelling', 'anaphylaxis', 'cannot swallow', 'lips swollen', 'tongue swollen'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'SEVERE ALLERGIC REACTION — Call 108 immediately. This can be life-threatening within minutes.',
  },
  {
    phrases: ['stroke', 'face drooping', 'arm weak', 'speech slurred', 'sudden numbness one side', 'sudden weakness'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'POSSIBLE STROKE — FAST: Face drooping, Arm weak, Speech slurred, Time to call 108 NOW.',
  },
  {
    phrases: ['baby not breathing', 'newborn not breathing', 'baby limp', 'infant not responding', 'newborn blue'],
    severity: 'CRITICAL',
    callNumber: '108',
    quickResponse: 'NEWBORN EMERGENCY — Call 108 or rush to nearest SNCU immediately. Keep baby warm.',
  },
  {
    phrases: ['heavy bleeding pregnancy', 'bleeding pregnant', 'water broke', 'labour pain severe', 'delivery emergency'],
    severity: 'CRITICAL',
    callNumber: '102',
    quickResponse: 'OBSTETRIC EMERGENCY — Call 102 (Janani Express) or 108. Do NOT delay. Institutional delivery only.',
  },
];

export const isEmergencyQuery = (query: string): { isEmergency: boolean; emergency?: EmergencyKeyword } => {
  const q = (query || '').toLowerCase().trim();
  if (!q) return { isEmergency: false };

  // Explicit greeting bypass: Greetings like "hi", "hello", "hey", or typo "high" are never emergencies
  if (/^(hi|hello|hey|high|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening|day))\b/i.test(q) || q === 'hi' || q === 'high' || q === 'hello') {
    return { isEmergency: false };
  }

  const found = EMERGENCY_KEYWORDS.find(e => e.phrases.some(phrase => {
    // Exact word or boundary match to prevent partial collisions
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    return regex.test(q) || q.includes(phrase);
  }));
  return { isEmergency: !!found, emergency: found };
};

export const EMERGENCY_DISCLAIMER =
  '⚠️ DEMO EDUCATIONAL GUIDANCE ONLY. For real emergencies, call 108 (Ambulance) or 112 (National Emergency). Medora AI is NOT a substitute for emergency medical services.';
