import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

app.use(express.json());

const SUPPORTED_LANGUAGES = new Set(['en', 'hi', 'te', 'ml', 'ta', 'kn']);

const MEDORA_SYSTEM_PROMPT = `You are Medora AI, a healthcare information and organization assistant.

Use only the patient's provided health record.
Help the user understand their existing health information, medication schedule, reminders, preventive-care tasks, tests, consultations, referrals and follow-ups.

Do not diagnose diseases.
Do not prescribe treatment.
Do not change medication dosage.
Do not tell the user to stop medication.
Do not invent medical information.
Do not replace a qualified healthcare professional.

For concerning information, encourage appropriate professional medical evaluation.

For emergencies, tell the user to seek immediate professional medical help and not wait for Medora.

Use simple language suitable for rural users.

When possible, give clear next actions such as:
View Medicine,
View Reminder,
Find Doctor,
Find Hospital,
View Referral,
Doctor Handoff,
View Health Graph.`;

const normalizeQuestion = (value = '') => value.toLowerCase();

const createFallbackResponse = (question, patient) => {
  const q = normalizeQuestion(question);
  const appointment = patient.currentReferral || patient.appointments?.[0] || null;
  const dueTests = patient.dueTests || [];
  const tasks = patient.preventiveTasks || [];
  const medicines = patient.medicines || [];
  const vitals = patient.recentMeasurements;

  if (q.includes('emergency') || q.includes('chest pain') || q.includes('severe bleeding') || q.includes('difficulty breathing')) {
    return {
      response: 'If you believe this is an emergency, seek immediate professional medical help. Do not wait for Medora or an AI response.',
      actions: [{ label: 'Emergency Help', action: 'emergency' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('checkup') || q.includes('consultation') || q.includes('when should i go')) {
    const followUpDate = appointment?.appointmentDate || appointment?.date || 'Not available';
    const pendingText = dueTests.length ? `Your record shows ${dueTests.length} follow-up item(s), including ${dueTests[0]}.` : 'Your record does not show a major new follow-up item.';
    return {
      response: `${pendingText} A professional medical checkup may be appropriate soon. Your preferred checkup date is ${followUpDate}. You can: View Referral, Find Doctor, Find Hospital, View Doctor Handoff.`,
      actions: [{ label: 'View Referral', action: 'referral' }, { label: 'Find Doctor', action: 'doctor' }, { label: 'Find Hospital', action: 'hospital' }, { label: 'Doctor Handoff', action: 'handoff' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('did i take my medicine') || q.includes('did i take')) {
    if (!medicines.length) {
      return {
        response: 'I do not see a detailed medicine record for this patient in the current selected profile.',
        actions: [{ label: 'View Medicines', action: 'medicines' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: `Based on today’s medicine record, ${medicines.map((med) => `${med.name} is marked as ${med.status}`).join('. ')}. Please review the medicine schedule and medication reminders here. Never change dosage without a clinician’s guidance.`,
      actions: [{ label: '✓ Mark Taken', action: 'medicines' }, { label: '⏰ Remind Later', action: 'medicines' }, { label: '💊 View Medicines', action: 'medicines' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if ((q.includes('medicine') || q.includes('medicines')) && (q.includes('today') || q.includes('have') || q.includes('take'))) {
    const list = medicines.length ? medicines.map((med) => `${med.name} (${med.frequency})`).join('; ') : 'No detailed medicine list is available for the selected record.';
    return {
      response: `According to the current record, your medicines are: ${list}. Please check the medicine schedule and confirm with your healthcare professional before changing any medication or dose.`,
      actions: [{ label: '💊 View Medicines', action: 'medicines' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('bp') || q.includes('blood pressure') || q.includes('graph')) {
    if (!vitals) {
      return {
        response: 'No BP reading is available for the selected record.',
        actions: [{ label: '📊 View BP Graph', action: 'graph' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: 'Your recorded blood pressure readings have varied over the selected period. Medora cannot determine the cause of these readings. Please discuss persistent or concerning readings with a qualified healthcare professional.',
      actions: [{ label: '📊 View BP Graph', action: 'graph' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('test') || q.includes('which tests') || q.includes('pending')) {
    if (!dueTests.length) {
      return {
        response: 'I do not see an overdue laboratory test in the current record. Please confirm any required test with your healthcare provider.',
        actions: [{ label: '🧪 View Tests', action: 'tests' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: `Your health record shows that ${dueTests.join(' and ')} are follow-up items. Please confirm with your doctor or healthcare provider whether you still need to complete them.`,
      actions: [{ label: '🧪 View Tests', action: 'tests' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('appointment') || q.includes('coming up') || q.includes('next consultation')) {
    if (!appointment) {
      return {
        response: 'There is no upcoming appointment currently recorded for this patient in the selected record.',
        actions: [{ label: '📅 View Appointments', action: 'appointment' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: `Your next appointment is on ${appointment.date}. The visit is for ${appointment.specialty || 'your care plan'} and status is ${appointment.status}.`,
      actions: [{ label: '📅 View Appointments', action: 'appointment' }, { label: '👨‍⚕️ Find Doctor', action: 'doctor' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('referral') || q.includes('pending referral') || q.includes('follow-up')) {
    if (!patient.currentReferral) {
      return {
        response: 'There is no pending referral recorded for the selected patient in the current health record.',
        actions: [{ label: '➡️ View Referral', action: 'referral' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: `Your record shows a referral to ${patient.currentReferral.specialty}. Status: ${patient.currentReferral.status}. Appointment date: ${patient.currentReferral.appointmentDate || patient.currentReferral.followUpDate || 'Not scheduled yet'}.`,
      actions: [{ label: '➡️ View Referral', action: 'referral' }, { label: '📋 Doctor Handoff', action: 'handoff' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  const topicResponses = [
    [['elderly prevention', 'elder prevention', 'senior prevention', 'old age prevention', 'prevent illness for elderly'], 'Elderly prevention plan: check blood pressure and blood sugar as advised, take prescribed medicines on schedule, keep vaccinations and checkups current, reduce excess salt and tobacco, eat balanced meals, stay hydrated, and reduce fall risks with good lighting and safe floors. Seek professional care for chest pain, sudden weakness, confusion, severe breathlessness, repeated falls, or rapidly worsening symptoms. Recommended next step: arrange a routine elderly-care review.'],
    [['pregnancy prevention', 'pregnant prevention', 'pregnancy care', 'prevent illness in pregnancy', 'pregnant woman'], 'Pregnancy prevention and safety plan: attend antenatal checkups, take only clinician-approved supplements, monitor blood pressure and symptoms, use safe food and water, avoid tobacco and alcohol, and discuss every medicine before taking it. Urgent warning signs include heavy bleeding, severe headache or vision changes, seizures, severe abdominal pain, breathing difficulty, fluid leakage, or reduced fetal movement. Recommended next step: contact the maternity team or nearest facility.'],
    [['child prevention', 'children prevention', 'prevent illness in child', 'child health prevention', 'pediatric prevention'], 'Child prevention plan: keep vaccinations current, use safe water and handwashing, provide age-appropriate nutrition, keep medicines locked away, prevent burns and falls, and seek care early for persistent fever, diarrhea, cough, or poor feeding. Emergency signs include breathing difficulty, convulsions, severe dehydration, unusual sleepiness, or inability to drink. Recommended next step: arrange a child-health checkup.'],
    [['newborn prevention', 'new born prevention', 'newborn care', 'prevent illness in newborn', 'baby prevention'], 'Newborn prevention plan: keep the baby warm, support skin-to-skin care, start breastfeeding as advised, keep the cord clean and dry, attend newborn checkups and immunizations, and keep smoke away. A newborn who has fever or feels cold, breathes fast, cannot feed, becomes unusually sleepy, has convulsions, or develops worsening jaundice needs immediate professional medical care. Recommended next step: contact a newborn-care professional or emergency facility.'],
    [['tablet', 'which medicine', 'what medicine', 'medicine for'], 'The correct medicine depends on the confirmed condition, age, pregnancy status, allergies, kidney and liver function, current medicines, and test results. Common examples are paracetamol for selected fever or pain, prescribed antihypertensives for high blood pressure, metformin for some type 2 diabetes plans, and antibiotics only for a clinician-confirmed bacterial infection. Do not start a tablet or replace a medicine from an AI answer. Show the package and prescription to a pharmacist or doctor.'],
    [['fever'], 'For fever, rest, drink safe fluids, monitor temperature, and seek clinical advice if it is persistent or severe. Confusion, seizure, severe breathing difficulty, dehydration, or a very young baby with fever require urgent care.'],
    [['cold', 'cough'], 'For a common cold or mild cough, rest, drink warm fluids, avoid smoke, and wash hands. Seek medical advice for breathing difficulty, chest pain, dehydration, blue lips, or symptoms that do not improve.'],
    [['diabetes', 'sugar'], 'Diabetes needs regular blood-sugar checks, balanced meals, activity appropriate for the person, and medicines prescribed by a clinician. Do not change medicine or dose without professional advice.'],
    [['bp', 'blood pressure', 'pressure'], 'High blood pressure often has no symptoms. Record readings, reduce excess salt and tobacco, take prescribed medicine consistently, and discuss repeated high readings with a clinician. Chest pain, weakness on one side, confusion, or severe breathlessness is an emergency.'],
    [['cancer'], 'An unexplained lump, persistent bleeding, unexplained weight loss, a changing mole, or a cough that does not improve should be assessed by a clinician. Screening and early specialist review are important; avoid unverified cures.'],
    [['typhoid'], 'Typhoid requires clinical assessment and appropriate testing. Use safe food and water, wash hands, and take antibiotics only when prescribed. Severe abdominal pain, confusion, bleeding, or inability to drink needs urgent care.'],
    [['malaria', 'dengue', 'chikungunya', 'chickenpox', 'smallpox'], 'Fever with rash, chills, severe body or joint pain, bleeding, or mosquito exposure needs clinical assessment and testing. Drink safe fluids, prevent mosquito bites, and avoid aspirin or ibuprofen until dengue has been ruled out. Smallpox is rare but a suspected case needs immediate public-health and hospital assessment.'],
  ];
  const topicResponse = topicResponses.find(([keywords]) => keywords.some((keyword) => q.includes(keyword)));
  if (topicResponse) {
    return {
      response: topicResponse[1],
      actions: [{ label: 'Find Doctor', action: 'doctor' }, { label: 'Find Hospital', action: 'hospital' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('preventive') || q.includes('vaccination') || q.includes('due')) {
    if (!tasks.length) {
      return {
        response: 'There are no preventive-care tasks currently marked due in the selected record.',
        actions: [{ label: '❤️ Preventive Care', action: 'preventive' }],
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
      };
    }

    return {
      response: `The selected record includes: ${tasks.map((task) => `${task.title} (${task.status})`).join('; ')}. Please discuss any overdue items with your healthcare professional.`,
      actions: [{ label: '❤️ Preventive Care', action: 'preventive' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  if (q.includes('doctor') && (q.includes('should i see') || q.includes('find doctor') || q.includes('doctor for me'))) {
    return {
      response: 'Your record shows a pending follow-up consultation. It may be appropriate to contact your healthcare provider about this.',
      actions: [{ label: '👨‍⚕️ Find Doctor', action: 'doctor' }, { label: '🏥 Find Hospital', action: 'hospital' }, { label: '➡️ View Referral', action: 'referral' }, { label: '📋 Doctor Handoff', action: 'handoff' }],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
    };
  }

  return {
    response: `Based on the current Medora health record for ${patient.name}, I can help you understand the selected person’s medicines, upcoming checkups, tests, preventive tasks and referrals. Please ask about a specific area such as medicines, checkups, tests or BP trends.`,
    actions: [{ label: '📅 View Appointments', action: 'appointment' }, { label: '💊 View Medicines', action: 'medicines' }, { label: '👨‍⚕️ Find Doctor', action: 'doctor' }],
    workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response']
  };
};

app.post('/api/ask', async (req, res) => {
  try {
    const { patientId, question, relevantHealthData, language = 'en' } = req.body || {};
    const patient = relevantHealthData || { name: 'Patient', conditions: [], medicines: [], appointments: [], preventiveTasks: [], dueTests: [] };
    const systemPrompt = MEDORA_SYSTEM_PROMPT;

    if (!process.env.AI_API_KEY) {
      const result = createFallbackResponse(question || '', patient);
      return res.json({
        mode: 'DEMO/FALLBACK',
        systemPrompt,
        response: result.response,
        actions: result.actions,
        workflow: result.workflow,
        patientId,
      });
    }

    const modelResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        input: [
          { role: 'system', content: `${systemPrompt}\nRespond in the selected language code: ${language}. Keep medicine names, measurements, and emergency phone numbers unchanged. If translation quality is uncertain, use simple English rather than inventing medical facts.` },
          { role: 'user', content: JSON.stringify({ patientId, question, relevantHealthData: patient }) }
        ],
      }),
    });

    if (!modelResponse.ok) {
      const fallback = createFallbackResponse(question || '', patient);
      return res.json({ mode: 'DEMO/FALLBACK', ...fallback, patientId });
    }

    const data = await modelResponse.json();
    const text = data.output_text || data.output?.[0]?.content?.[0]?.text || 'I could not generate a response.';

    return res.json({
      mode: 'AI',
      response: text,
      actions: [],
      workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response'],
      patientId,
    });
  } catch {
    const fallback = createFallbackResponse(req.body?.question || '', req.body?.relevantHealthData || {});
    return res.json({ mode: 'DEMO/FALLBACK', ...fallback, patientId: req.body?.patientId || '' });
  }
});

app.post('/api/translate', async (req, res) => {
  const { texts = [], language = 'en' } = req.body || {};
  if (!SUPPORTED_LANGUAGES.has(language) || !Array.isArray(texts) || texts.length > 80) {
    return res.status(400).json({ error: 'Invalid translation request' });
  }
  if (language === 'en' || !process.env.AI_API_KEY) {
    return res.json({ translations: texts });
  }

  try {
    const modelResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        input: [{
          role: 'system',
          content: `Translate each input string into language code ${language}. Preserve medicine names, numbers, units, emergency numbers, and formatting. Return JSON only in the form {"translations":["..."]}. Do not add explanations.`,
        }, { role: 'user', content: JSON.stringify(texts) }],
      }),
    });
    if (!modelResponse.ok) return res.json({ translations: texts });
    const data = await modelResponse.json();
    const parsed = JSON.parse(data.output_text || '{}');
    if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length) {
      return res.json({ translations: texts });
    }
    return res.json({ translations: parsed.translations });
  } catch {
    return res.json({ translations: texts });
  }
});

app.listen(port, host, () => {
  console.log(`Medora AI server running on http://${host}:${port}`);
});
