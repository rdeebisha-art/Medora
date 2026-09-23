export interface FirstAidCard {
  id: string;
  title: string;
  category: 'emergency' | 'injury' | 'medical' | 'poison' | 'environmental';
  severity: 'CRITICAL' | 'URGENT' | 'REVIEW';
  doSteps: string[];
  doNotSteps: string[];
  callNumber: string | null;
  timeToAct: string;
  source: string;
}

export const FIRST_AID_CARDS: FirstAidCard[] = [
  {
    id: 'fa-snakebite',
    title: 'Snake Bite',
    category: 'emergency',
    severity: 'CRITICAL',
    doSteps: [
      'Move victim away from snake immediately',
      'Keep victim completely still — movement speeds venom absorption',
      'Keep bitten limb below heart level, supported',
      'Remove rings, bangles, watches near bite site before swelling starts',
      'Note time of bite and snake description if safely possible',
      'Call 108 immediately and head to nearest hospital with Anti-Snake Venom (ASV)',
    ],
    doNotSteps: [
      'DO NOT cut, slice, or make incisions in the wound',
      'DO NOT suck or squeeze venom out',
      'DO NOT apply tourniquet, tight rope, or rubber band',
      'DO NOT apply ice, herbs, mud, cow dung, chili, or electrical shock',
      'DO NOT give food, water, or alcohol',
      'DO NOT ask victim to walk — carry them',
    ],
    callNumber: '108',
    timeToAct: 'IMMEDIATE — reach hospital within 2 hours',
    source: 'AIIMS Snake Bite Management Protocol / MoHFW',
  },
  {
    id: 'fa-dogbite',
    title: 'Dog or Animal Bite',
    category: 'emergency',
    severity: 'URGENT',
    doSteps: [
      'Wash wound immediately under running tap water with soap for 15 FULL MINUTES',
      'Apply povidone iodine or antiseptic if available',
      'Cover loosely with clean cloth',
      'Go to nearest PHC or hospital within 24 hours for Anti-Rabies Vaccine (ARV)',
      'For deep bites: also get Rabies Immunoglobulin (RIG) injected around wound',
    ],
    doNotSteps: [
      'DO NOT apply chili powder, turmeric, kerosene, or lime',
      'DO NOT bandage tightly without washing',
      'DO NOT delay going to PHC even if wound looks minor',
    ],
    callNumber: null,
    timeToAct: 'Wash IMMEDIATELY. Reach PHC within 24 hours',
    source: 'National Rabies Control Programme (NRCP), MoHFW',
  },
  {
    id: 'fa-bleeding',
    title: 'Severe Bleeding / Wound',
    category: 'injury',
    severity: 'CRITICAL',
    doSteps: [
      'Apply firm, direct pressure with cleanest cloth available',
      'Do NOT remove cloth — add more on top if soaked through',
      'Elevate injured limb above heart level if possible',
      'Keep victim lying down, calm, and warm',
      'Call 108 if bleeding is severe or does not slow in 10 minutes',
    ],
    doNotSteps: [
      'DO NOT remove embedded objects — stabilize around them',
      'DO NOT apply tourniquet unless limb is completely amputated',
    ],
    callNumber: '108',
    timeToAct: 'Apply pressure IMMEDIATELY',
    source: 'WHO First Aid Guidelines / National Trauma Protocol',
  },
  {
    id: 'fa-burns',
    title: 'Burns (Fire / Hot Liquid)',
    category: 'injury',
    severity: 'URGENT',
    doSteps: [
      'Remove person from burn source immediately',
      'Cool burn under RUNNING COOL water for minimum 20 minutes',
      'Remove jewellery and clothing near burn before swelling',
      'Cover with clean damp cloth',
      'Head to PHC/hospital for burns larger than palm size',
    ],
    doNotSteps: [
      'DO NOT apply toothpaste, oil, ghee, or turmeric (cause infection)',
      'DO NOT use ice (worsens tissue damage)',
      'DO NOT burst blisters',
    ],
    callNumber: '108',
    timeToAct: 'Cool immediately — burns worsen for minutes after heat removed',
    source: 'National Burns Registry / WHO Burn Care Guidelines',
  },
  {
    id: 'fa-unconscious',
    title: 'Unconscious / Unresponsive Person',
    category: 'emergency',
    severity: 'CRITICAL',
    doSteps: [
      'Check response: Call name loudly, tap shoulder',
      'Call 108 immediately',
      'Check breathing: Look for chest rise, feel for breath on cheek',
      'If breathing: Recovery position — roll gently onto left side, tilt head back',
      'Do NOT leave person alone — send someone else for help',
    ],
    doNotSteps: [
      'DO NOT give food or water to unconscious person',
      'DO NOT shake or slap vigorously',
      'DO NOT leave face-down',
    ],
    callNumber: '108',
    timeToAct: 'IMMEDIATE — every minute without oxygen causes brain damage',
    source: 'Indian Resuscitation Council / WHO Emergency Care Guidelines',
  },
  {
    id: 'fa-seizure',
    title: 'Seizure / Convulsions / Fits',
    category: 'medical',
    severity: 'CRITICAL',
    doSteps: [
      'Stay calm — most seizures stop on their own in 1–2 minutes',
      'Clear area of hard objects to prevent injury',
      'Ease person to ground and turn on their side',
      'Time the seizure from start',
      'After seizure: Stay with person, speak calmly, check breathing',
      'Call 108 if: First ever seizure, lasts >5 minutes, or person does not recover',
    ],
    doNotSteps: [
      'DO NOT hold person down or restrain',
      'DO NOT put anything in mouth',
      'DO NOT give water or medicine until fully awake',
    ],
    callNumber: '108',
    timeToAct: 'Do NOT restrain. Protect. Time. Call if >5 minutes.',
    source: 'Epilepsy India / WHO Epilepsy Factsheet',
  },
  {
    id: 'fa-heatstroke',
    title: 'Heat Stroke / Sun Stroke',
    category: 'environmental',
    severity: 'CRITICAL',
    doSteps: [
      'Move person immediately to shade or cool area',
      'Remove excess clothing',
      'Apply cool (not ice-cold) wet cloths to skin — especially neck, armpits, groin',
      'Fan person to increase evaporation cooling',
      'If conscious: Give cool clean water or ORS sip by sip',
      'Call 108 if confused, unconscious, or temperature >104°F',
    ],
    doNotSteps: [
      'DO NOT give full glass of water at once (causes vomiting)',
      'DO NOT give alcohol or caffeine drinks',
      'DO NOT leave in sun',
    ],
    callNumber: '108',
    timeToAct: 'Cool IMMEDIATELY — heat stroke is fatal if untreated within minutes',
    source: 'National Disaster Management Authority (NDMA) Heat Action Plan',
  },
];

export const getFirstAidCard = (id: string): FirstAidCard | undefined =>
  FIRST_AID_CARDS.find(c => c.id === id);

export const getFirstAidByKeyword = (keyword: string): FirstAidCard | undefined => {
  const q = keyword.toLowerCase();
  if (q.includes('snake') || q.includes('venom')) return getFirstAidCard('fa-snakebite');
  if (q.includes('dog') || q.includes('animal') || q.includes('rabies')) return getFirstAidCard('fa-dogbite');
  if (q.includes('bleed') || q.includes('wound') || q.includes('cut')) return getFirstAidCard('fa-bleeding');
  if (q.includes('burn') || q.includes('fire') || q.includes('scald')) return getFirstAidCard('fa-burns');
  if (q.includes('unconscious') || q.includes('unrespons') || q.includes('faint')) return getFirstAidCard('fa-unconscious');
  if (q.includes('seizure') || q.includes('convuls') || q.includes(' fit')) return getFirstAidCard('fa-seizure');
  if (q.includes('heat') || q.includes('sunstroke') || q.includes('sun stroke')) return getFirstAidCard('fa-heatstroke');
  return undefined;
};
