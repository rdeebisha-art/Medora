import { WasteCategoryRecord } from '../types/wasteTypes';

export const INITIAL_WASTE_CATEGORIES: WasteCategoryRecord[] = [
  {
    code: 'CAT_SHARPS',
    name: 'Sharps (Needles, Syringes, Scalpels)',
    colorCode: '#0284C7', // Blue / White
    defaultStream: 'SHARPS',
    bagColor: 'WHITE',
    requiresSpecialHandling: true,
    description: 'Puncture-resistant translucent container with tamper-proof lid for all metallic & glass sharps.',
    handlingProtocol: 'Must be deposited directly into puncture-proof sharps boxes. Never recap needles by hand.',
    examples: ['Hypodermic needles', 'Scalpels', 'Suture needles', 'Glass ampoules', 'Blades']
  },
  {
    code: 'CAT_INFECTIOUS',
    name: 'Infectious & Contaminated Waste',
    colorCode: '#EAB308', // Yellow
    defaultStream: 'INFECTIOUS',
    bagColor: 'YELLOW',
    requiresSpecialHandling: true,
    description: 'Yellow biohazard bag for anatomical items, blood-soiled dressings, contaminated cotton/linen.',
    handlingProtocol: 'Double-bagged yellow biohazard bags. Incineration or deep burial / plasma pyrolysis.',
    examples: ['Blood-soaked gauze', 'Cotton dressings', 'Plaster casts', 'Pathological specimens', 'Used PPE']
  },
  {
    code: 'CAT_CONTAMINATED_PLASTIC',
    name: 'Contaminated Recyclable Plastics',
    colorCode: '#EF4444', // Red
    defaultStream: 'INFECTIOUS',
    bagColor: 'RED',
    requiresSpecialHandling: true,
    description: 'Red bag for contaminated disposable items like tubing, bottles, intravenous tubes, catheters.',
    handlingProtocol: 'Autoclaving, microwaving, or chemical treatment followed by authorized recycling shredding.',
    examples: ['IV tubes', 'Catheters', 'Urine bags', 'Dialysis kits', 'Vacutainers']
  },
  {
    code: 'CAT_PHARMA',
    name: 'Pharmaceutical & Cytotoxic Waste',
    colorCode: '#D97706', // Brown / Amber
    defaultStream: 'PHARMACEUTICAL',
    bagColor: 'YELLOW',
    requiresSpecialHandling: true,
    description: 'Expired medicines, contaminated drug packaging, and chemical reagents.',
    handlingProtocol: 'High-temperature incineration or encapsulation in tamper-resistant drums.',
    examples: ['Expired tablets', 'Discarded syrups', 'Cytotoxic vials', 'Disinfectants']
  },
  {
    code: 'CAT_GENERAL',
    name: 'General Healthcare Municipal Waste',
    colorCode: '#10B981', // Black / Green
    defaultStream: 'GENERAL',
    bagColor: 'BLACK',
    requiresSpecialHandling: false,
    description: 'Non-hazardous, non-infectious administrative waste from clinics and waiting halls.',
    handlingProtocol: 'Segregated into compostable vs recyclable streams and collected by municipal authority.',
    examples: ['Stationery', 'Paper wrappers', 'Clean cardboard', 'Food waste', 'Plastic water bottles']
  }
];
