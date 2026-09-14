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
    [['snake bite', 'snakebite', 'snake venom'], 'SNAKE BITE FIRST AID\nDo: Move away from the snake, keep the person calm and still, keep the bitten limb supported and below heart level if possible, remove rings or tight items, note the time and snake appearance from a safe distance, and call emergency services or reach the nearest hospital immediately for antivenom assessment.\nDo not: Do not cut or suck the wound, apply a tourniquet, ice, electric shock, alcohol, chemicals, herbs, paste, or tight bandages. Do not chase or handle the snake and do not give food, drink, or medicine unless a professional advises it.\nHerbal medicine: No herb can safely replace emergency assessment or antivenom. Do not delay transport for herbal treatment. Warning signs include swelling, bleeding, vomiting, weakness, drooping eyelids, difficulty breathing, or collapse.'],
    [['dog bite', 'dogbite'], 'DOG BITE FIRST AID\nDo: Move to safety, wash the wound under running water with soap for 15 minutes, control bleeding with clean pressure if safe, cover loosely with a clean dressing, and go to a healthcare facility urgently for rabies vaccination assessment, tetanus review, and wound care. Record the animal details only from a safe distance.\nDo not: Do not apply herbs, chili, oil, ash, soil, toothpaste, or other substances. Do not close a deep bite yourself and do not wait for symptoms; rabies prevention must start promptly when indicated.\nHerbal medicine: Herbs cannot prevent rabies or replace vaccines, immunoglobulin, antibiotics, or professional wound care.'],
    [['animal bite', 'animal scratch', 'cat bite', 'monkey bite'], 'ANIMAL BITE OR SCRATCH FIRST AID\nDo: Wash the wound with soap and running water for 15 minutes, apply gentle clean pressure for bleeding, and seek urgent professional care for rabies and tetanus assessment. Mention the animal, location, time, and whether the skin was broken.\nDo not: Do not use herbs, ash, soil, oil, chemicals, or tight coverings, and do not wait for the animal to become sick before seeking advice. Do not handle or capture the animal.\nHerbal medicine: No herbal remedy prevents rabies. Vaccination and professional assessment are the safe next steps.'],
    [['insect bite', 'insect sting', 'bee sting', 'wasp sting', 'scorpion sting'], 'INSECT BITE OR STING FIRST AID\nDo: Move away from the insect, wash the area, use a cool clean compress, remove a visible bee stinger by gently scraping without squeezing, and monitor the person. Seek urgent emergency care for trouble breathing, face or tongue swelling, faintness, widespread hives, repeated vomiting, or multiple stings.\nDo not: Do not scratch, cut, suck, burn, or apply unknown herbs, oils, mud, or chemicals. Do not delay emergency care for a home remedy.\nHerbal medicine: Herbs are not a substitute for emergency treatment. Ask a pharmacist or clinician about age-appropriate symptom relief, especially for children, pregnancy, or allergies.'],
    [['elderly prevention', 'elder prevention', 'senior prevention', 'old age prevention', 'prevent illness for elderly', 'elderly', 'senior citizen'], 'ELDERLY CARE PLAN\nPrevention: Check blood pressure and blood sugar as advised, keep vaccinations and checkups current, reduce tobacco and excess salt, and reduce fall risks with good lighting, safe floors, and support rails.\nDaily care: Take prescribed medicines on schedule, stay hydrated, sleep regularly, move safely, and keep an updated medicine and emergency-contact list.\nFoods: Prefer vegetables, pulses, whole grains, fruit, nuts, and adequate water; follow a clinician plan for diabetes, kidney disease, or heart disease.\nHerbs and home foods: Normal food amounts of ginger, turmeric, garlic, or cumin may be used if tolerated, but they are not replacements for medicines and can interact with treatment. Ask a clinician before concentrated herbal products.\nWarning signs: Chest pain, sudden weakness, confusion, severe breathlessness, repeated falls, or rapidly worsening symptoms require urgent care. Next step: arrange a routine elderly-care review.'],
    [['pregnancy prevention', 'pregnant prevention', 'pregnancy care', 'prevent illness in pregnancy', 'pregnant woman', 'pregnancy', 'pregnant'], 'PREGNANCY CARE PLAN\nPrevention: Attend antenatal checkups, take only clinician-approved iron, folic acid, or calcium supplements, use safe food and water, avoid tobacco and alcohol, and discuss every medicine or herb before taking it.\nDaily care: Rest, track appointments and fetal movement as advised, sleep comfortably, use safe activity, and keep transport and emergency contacts ready.\nFoods: Choose balanced meals with pulses, vegetables, fruit, whole grains, safe dairy, and protein; use only pasteurized or properly cooked foods and follow the maternity team for anemia or diabetes.\nHerbs and home foods: Do not use herbal teas, raw remedies, or concentrated turmeric, ginger, or other supplements to induce labor or treat illness without maternity-team advice.\nWarning signs: Heavy bleeding, severe headache or vision changes, seizures, severe abdominal pain, breathing difficulty, fluid leakage, or reduced fetal movement require urgent care. Next step: contact the maternity team or nearest facility.'],
    [['child prevention', 'children prevention', 'prevent illness in child', 'child health prevention', 'pediatric prevention', 'child', 'children'], 'CHILD CARE PLAN\nPrevention: Keep vaccinations current, use safe water and handwashing, keep medicines and chemicals locked away, prevent burns and falls, and use mosquito protection.\nDaily care: Provide age-appropriate meals, sleep, play, supervision, dental hygiene, and early review for persistent fever, diarrhea, cough, rash, or poor feeding.\nFoods: Offer varied age-appropriate foods including vegetables, fruit, pulses, eggs or other safe protein, and clean water; continue breastfeeding when appropriate. Avoid choking hazards and unprescribed medicines.\nHerbs and home foods: Do not give herbal preparations, honey, or adult remedies to infants or children without professional advice; some products can be contaminated or unsafe.\nWarning signs: Breathing difficulty, convulsions, severe dehydration, unusual sleepiness, blood in stool, or inability to drink require urgent care. Next step: arrange a child-health checkup.'],
    [['newborn prevention', 'new born prevention', 'newborn care', 'prevent illness in newborn', 'baby prevention', 'newborn', 'new born'], 'NEWBORN CARE PLAN\nPrevention: Keep the baby warm, support skin-to-skin care, start breastfeeding as advised, keep the cord clean and dry, attend newborn checkups and immunizations, and keep smoke away.\nDaily care: Watch feeding, wet diapers, breathing, temperature, skin color, and activity; wash hands before handling the baby and keep the sleeping area safe.\nFoods: Use breast milk as advised by the newborn-care professional. Do not give water, honey, herbal drinks, gripe water, or animal milk to a young newborn unless a qualified professional specifically directs it.\nHerbs and home foods: Do not apply oil, ash, turmeric, herbs, or other substances to the cord, skin, eyes, or mouth without professional advice.\nWarning signs: Fever or cold skin, fast or difficult breathing, inability to feed, unusual sleepiness, convulsions, or worsening jaundice require immediate medical care. Next step: contact a newborn-care professional or emergency facility.'],
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
