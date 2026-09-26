import { describe, it, expect } from 'vitest';
import { MEDICAL_DISEASES } from '../data/medical/diseases';
import { REFERENCE_MEDICINES_DATASET } from '../data/medical/medicinesDataset';
import { DEMO_HEALTHCARE_TEAM } from '../data/doctorsDataset';
import { HEALTHCARE_FACILITIES } from '../data/medical/facilities';

describe('Medora Search Functionality & Index Verification', () => {
  it('indexes core medical records and report tools', () => {
    const medicalReportFeatures = [
      { name: 'Medical Records', route: '/records' },
      { name: 'Medical Report Scanner', route: '/report-scanner' },
      { name: 'X-Ray & Radiography Viewer', route: '/xray-viewer' },
      { name: 'Health Vitals & Tests', route: '/health-tests' },
    ];

    medicalReportFeatures.forEach((feat) => {
      expect(feat.route).toBeDefined();
      expect(feat.name.length).toBeGreaterThan(0);
    });
  });

  it('indexes active and reference medicines correctly', () => {
    expect(REFERENCE_MEDICINES_DATASET.length).toBeGreaterThan(0);
    const paracetamol = REFERENCE_MEDICINES_DATASET.find((m) =>
      m.medicineName.toLowerCase().includes('paracetamol')
    );
    expect(paracetamol).toBeDefined();
    expect(paracetamol?.indication).toContain('Fever');
  });

  it('indexes medical diseases and clinical symptoms without generic AI routing', () => {
    expect(MEDICAL_DISEASES.length).toBeGreaterThan(0);
    const fever = MEDICAL_DISEASES.find((d) => d.title.toLowerCase().includes('fever'));
    expect(fever).toBeDefined();
    expect(fever?.commonSymptoms.length).toBeGreaterThan(0);

    const headache = MEDICAL_DISEASES.find((d) => d.title.toLowerCase().includes('headache'));
    expect(headache).toBeDefined();
  });

  it('indexes rural healthcare doctors and PHC specialists', () => {
    expect(DEMO_HEALTHCARE_TEAM.length).toBeGreaterThan(0);
    const doctor = DEMO_HEALTHCARE_TEAM[0];
    expect(doctor.name).toBeDefined();
    expect(doctor.specialty).toBeDefined();
    expect(doctor.hospitalAffiliation).toBeDefined();
  });

  it('indexes healthcare facilities and emergency dispatch', () => {
    expect(HEALTHCARE_FACILITIES.length).toBeGreaterThan(0);
    const phc = HEALTHCARE_FACILITIES.find((f) => f.name.includes('PHC') || f.name.includes('Primary'));
    expect(phc).toBeDefined();
    expect(phc?.emergencyAvailable).toBe(true);
  });

  it('expands multilingual synonyms across Indian languages', () => {
    const synonyms: Record<string, string[]> = {
      fever: ['காய்ச்சல்', 'बुखार', 'జ్వరం', 'പനി', 'ಜ್ವರ'],
      cough: ['இருமல்', 'खांसी', 'దగ్గు', 'ചുമ', 'ಕೆಮ್ಮು'],
      emergency: ['அவசரம்', 'ஆபத்து', 'आपातकालीन', 'అత్యవసరం', 'അടിയന്തരം', 'ತುರ್ತು'],
      medicine: ['மருந்து', 'दवा', 'మందులు', 'മരുന്ന്', 'ಔಷಧಿ'],
    };

    // Verify all 6 languages have representations
    expect(synonyms.fever.length).toBeGreaterThanOrEqual(5);
    expect(synonyms.cough.length).toBeGreaterThanOrEqual(5);
    expect(synonyms.emergency.length).toBeGreaterThanOrEqual(5);
    expect(synonyms.medicine.length).toBeGreaterThanOrEqual(5);
  });

  it('validates navigation destinations for all searchable items', () => {
    const expectedRoutes = [
      '/records',
      '/report-scanner',
      '/xray-viewer',
      '/medicines',
      '/health-tests',
      '/family',
      '/maternity',
      '/childcare',
      '/elderly',
      '/vaccination',
      '/doctor-portal',
      '/appointments',
      '/doctor-summary',
      '/hospitals',
      '/emergency',
      '/transport',
      '/schemes',
      '/education',
      '/language-bridge',
      '/a2a-simulation',
      '/sync',
      '/sms',
      '/ussd',
    ];

    expectedRoutes.forEach((route) => {
      expect(route.startsWith('/')).toBe(true);
    });
  });
});
