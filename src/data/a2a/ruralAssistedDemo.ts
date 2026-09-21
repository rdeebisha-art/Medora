export interface DemoPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  accessMethod: string;
  location: string;
  isDemo: boolean;
}

export interface DemoReportFinding {
  parameter: string;
  value: string;
  unit?: string;
  flag: 'Normal' | 'Elevated' | 'Borderline' | 'High';
  extractedTag: string;
}

export interface DemoMedicalReport {
  reportId: string;
  type: string;
  date: string;
  patientId: string;
  disclaimer: string;
  findings: DemoReportFinding[];
}

export interface A2AAgentConfig {
  id: string;
  name: string;
  domain: string;
  avatarBg: string;
  iconName: string;
  purpose: string;
  selectionReason: string;
  initialMessage: string;
  processingMessage: string;
  completedMessage: string;
}

export interface SimulationStage {
  stageNumber: number;
  title: string;
  description: string;
  activeAgentId?: string;
}

// 1. DEMO PATIENT
export const DEMO_RURAL_PATIENT: DemoPatient = {
  id: 'P-DEMO-001',
  name: 'Rural Demo Patient',
  age: 45,
  gender: 'Female',
  accessMethod: 'Basic / Button Phone',
  location: 'Demo Rural Village',
  isDemo: true,
};

// 2. DEMO MEDICAL REPORT
export const DEMO_MEDICAL_REPORT: DemoMedicalReport = {
  reportId: 'RPT-DEMO-001',
  type: 'Routine Blood Test',
  date: '2026-09-20',
  patientId: 'P-DEMO-001',
  disclaimer: 'DEMO DATA — NOT A REAL MEDICAL REPORT',
  findings: [
    {
      parameter: 'Blood Pressure',
      value: '158/96',
      unit: 'mmHg',
      flag: 'Elevated',
      extractedTag: 'Extracted from demo report',
    },
    {
      parameter: 'Blood Glucose',
      value: 'Elevated',
      unit: '',
      flag: 'Elevated',
      extractedTag: 'Extracted from demo report',
    },
    {
      parameter: 'Hemoglobin',
      value: '10.2',
      unit: 'g/dL',
      flag: 'Borderline',
      extractedTag: 'Extracted from demo report',
    },
  ],
};

// 3. DEMO SYMPTOMS
export const INITIAL_DEMO_SYMPTOMS = [
  'Dizziness',
  'Weakness',
  'Increased thirst',
];

// 4. SPECIALIST AGENTS DEFINITION WITH SELECTION REASON
export const A2A_SPECIALIST_AGENTS: A2AAgentConfig[] = [
  {
    id: 'agent-gh',
    name: 'General Health AI',
    domain: 'Primary Symptom Assessor',
    avatarBg: 'bg-emerald-600',
    iconName: 'Stethoscope',
    purpose: 'Reviews the overall symptom pattern and general clinical context.',
    selectionReason: 'Multiple non-specific symptoms (dizziness, weakness, thirst) were reported by patient.',
    initialMessage: 'Waiting for report extraction...',
    processingMessage: 'Analyzing overall symptom pattern of dizziness, weakness, and thirst...',
    completedMessage: 'Symptom review completed. Symptoms are non-specific and overlap between cardiovascular and metabolic considerations. Professional evaluation advised.',
  },
  {
    id: 'agent-db',
    name: 'Diabetes AI',
    domain: 'Metabolic & Glycaemic Specialist',
    avatarBg: 'bg-purple-600',
    iconName: 'Pill',
    purpose: 'Reviews elevated blood glucose findings, increased thirst, and fatigue.',
    selectionReason: 'Elevated blood glucose information (162 mg/dL) and increased thirst were extracted from demo data.',
    initialMessage: 'Waiting for metabolic data...',
    processingMessage: 'Evaluating elevated blood glucose finding alongside increased thirst and weakness...',
    completedMessage: 'Metabolic review completed. Findings may be associated with blood sugar regulation concerns. Full diagnostic lab evaluation recommended.',
  },
  {
    id: 'agent-bp',
    name: 'Blood Pressure AI',
    domain: 'Cardiovascular Specialist',
    avatarBg: 'bg-rose-600',
    iconName: 'Heart',
    purpose: 'Reviews recorded BP reading (158/96 mmHg) and related dizziness.',
    selectionReason: 'Demo report contained an elevated blood pressure reading (158/96 mmHg) and dizziness was reported.',
    initialMessage: 'Waiting for vitals telemetry...',
    processingMessage: 'Analyzing 158/96 mmHg blood pressure reading in relation to dizziness and fatigue...',
    completedMessage: 'Cardiovascular review completed. BP reading of 158/96 mmHg requires clinical review and repeated monitoring. Orthostatic symptoms noted.',
  },
  {
    id: 'agent-nu',
    name: 'Nutrition AI',
    domain: 'Dietary & Lifestyle Guidance',
    avatarBg: 'bg-teal-600',
    iconName: 'Apple',
    purpose: 'Provides general nutrition and hydration health education.',
    selectionReason: 'General health education regarding hydration and low-salt/low-sugar diet is relevant.',
    initialMessage: 'Waiting for dietary context...',
    processingMessage: 'Formulating general hydration and dietary awareness considerations...',
    completedMessage: 'Nutrition considerations formulated: emphasize safe hydration, reduced sodium, and balanced whole foods. No custom treatment plan prescribed.',
  },
  {
    id: 'agent-et',
    name: 'Emergency Triage AI',
    domain: 'Urgency & Safety Evaluator',
    avatarBg: 'bg-amber-600',
    iconName: 'ShieldAlert',
    purpose: 'Checks whether reported symptoms include immediate emergency red flags.',
    selectionReason: 'Dizziness and weakness require a formal urgency and safety check to rule out emergency flags.',
    initialMessage: 'Waiting for emergency screening...',
    processingMessage: 'Screening for acute red flags (loss of consciousness, chest pain, stroke signs)...',
    completedMessage: 'Urgency check completed: No acute emergency conclusion established from available demo data. Routine clinician review recommended within 48 hours.',
  },
];

// 5. 12 SEQUENTIAL EXECUTION STAGES
export const SIMULATION_STAGES: SimulationStage[] = [
  { stageNumber: 1, title: 'Patient Request Received', description: 'Patient reports having a medical report and symptoms but cannot read complex medical terms.' },
  { stageNumber: 2, title: 'Medora AI Initiated', description: 'Understanding patient context and preparing A2A dispatch pipeline.' },
  { stageNumber: 3, title: 'A2A Orchestrator Activated', description: 'Analyzing patient context, report telemetry, and reported symptoms.' },
  { stageNumber: 4, title: 'Report Data Analysis', description: 'Extracting Blood Pressure (158/96), Glucose (Elevated), and Hb (10.2).' },
  { stageNumber: 5, title: 'General Health AI Executing', description: 'Reviewing overall symptom pattern.', activeAgentId: 'agent-gh' },
  { stageNumber: 6, title: 'Diabetes AI Executing', description: 'Reviewing blood-sugar findings and increased thirst.', activeAgentId: 'agent-db' },
  { stageNumber: 7, title: 'Blood Pressure AI Executing', description: 'Reviewing 158/96 mmHg BP reading and dizziness.', activeAgentId: 'agent-bp' },
  { stageNumber: 8, title: 'Nutrition AI Executing', description: 'Reviewing general hydration and nutritional awareness.', activeAgentId: 'agent-nu' },
  { stageNumber: 9, title: 'Emergency Triage AI Executing', description: 'Screening for immediate warning red flags.', activeAgentId: 'agent-et' },
  { stageNumber: 10, title: 'Response Synthesizer', description: 'Combining specialist findings into unified non-diagnostic summary.' },
  { stageNumber: 11, title: 'Medora AI Formatting', description: 'Translating synthesis into simple rural-friendly language.' },
  { stageNumber: 12, title: 'Final Response Unlocked', description: 'A2A workflow complete. Results and Doctor Handoff ready.' },
];
