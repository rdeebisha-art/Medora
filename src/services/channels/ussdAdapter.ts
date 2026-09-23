import { USSDSessionState } from './channelTypes';
import { processA2ARequest } from '../a2aOrchestrator';

export const initialUSSDSession = (patientId: string): USSDSessionState => ({
  sessionId: `USSD-${Date.now()}`,
  currentMenu: 'MAIN',
  patientId,
  language: 'en',
});

export const handleUSSDInput = (
  session: USSDSessionState,
  input: string,
  patientContext: Record<string, any>
): { nextSession: USSDSessionState; displayText: string } => {
  const cleanInput = input.trim();

  if (session.currentMenu === 'MAIN') {
    switch (cleanInput) {
      case '1':
        return {
          nextSession: { ...session, currentMenu: 'HEALTH' },
          displayText: `MEDORA USSD HEALTH (DEMO)\nPatient: ${patientContext.name || session.patientId}\n1. Recent Vitals\n2. Active Medicines\n0. Back`,
        };
      case '2':
        return {
          nextSession: { ...session, currentMenu: 'SYMPTOMS' },
          displayText: `MEDORA SYMPTOM INTAKE\nSelect main symptom:\n1. Fever\n2. Cough / Cold\n3. Dizziness / BP\n4. Stomach pain\n0. Back`,
        };
      case '3':
        return {
          nextSession: { ...session, currentMenu: 'REPORT_STATUS' },
          displayText: `MEDORA REPORT ASSISTANCE\nStatus: REPORT EXTRACTED (RPT-DEMO-001)\nFindings: BP 158/96, Glucose Elevated, Hb 10.2.\n0. Back`,
        };
      case '4':
        return {
          nextSession: { ...session, currentMenu: 'DOCTOR' },
          displayText: `MEDORA DOCTOR CONNECT\nStatus: Dr. Patil (AVAILABLE)\nPress 1 to request callback.\n0. Back`,
        };
      case '5':
        return {
          nextSession: { ...session, currentMenu: 'EMERGENCY' },
          displayText: `🚨 RURAL EMERGENCY\nDial 108 for Ambulance immediately!\nPress 1 for snakebite guidance\nPress 2 for chest pain\n0. Back`,
        };
      default:
        return {
          nextSession: session,
          displayText: `MEDORA USSD (*123#)\n1. My Health\n2. Report Symptoms\n3. Report Status\n4. Contact Doctor\n5. Emergency (108)\nSelect option (1-5):`,
        };
    }
  }

  if (session.currentMenu === 'SYMPTOMS') {
    let sym = 'Fever';
    if (cleanInput === '2') sym = 'Cough';
    if (cleanInput === '3') sym = 'Dizziness';
    if (cleanInput === '4') sym = 'Stomach pain';

    return {
      nextSession: { ...session, currentMenu: 'SYMPTOM_DURATION', enteredSymptom: sym },
      displayText: `SYMPTOM: ${sym}\nHow long have you had this?\n1. 1 day\n2. 2-3 days\n3. More than 3 days\n0. Back`,
    };
  }

  if (session.currentMenu === 'SYMPTOM_DURATION') {
    let dur = '1 day';
    if (cleanInput === '2') dur = '2-3 days';
    if (cleanInput === '3') dur = 'More than 3 days';

    // Route to A2A Orchestrator
    const a2aResult = processA2ARequest(
      `${session.enteredSymptom} for ${dur}`,
      patientContext,
      {
        patientId: session.patientId,
        familyId: patientContext.familyId || 'FAM-01',
        userId: 'USSD_USER',
        userRole: 'patient',
        language: session.language,
        networkStatus: 'LIMITED',
      }
    );

    return {
      nextSession: { ...session, currentMenu: 'MAIN' },
      displayText: `MEDORA A2A GUIDANCE\n${a2aResult.synthesizedResponse.slice(0, 140)}...\n\nSMS sent to your phone.\n0. Main Menu`,
    };
  }

  return {
    nextSession: { ...session, currentMenu: 'MAIN' },
    displayText: `MEDORA USSD (*123#)\n1. My Health\n2. Report Symptoms\n3. Report Status\n4. Contact Doctor\n5. Emergency (108)`,
  };
};
