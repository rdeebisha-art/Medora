import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine, Patient, HealthTest } from '../db/db';
import Layout from '../components/Layout';

interface Message { role: 'user' | 'ai'; text: string; agent?: string; }

// Rule-based AI engine
const AGENTS = {
  emergency: { name: 'Emergency Triage Agent', keywords: ['emergency','unconscious','not breathing','heart attack','chest pain','stroke','accident','bleeding heavily','fainted','choking'] },
  maternal: { name: 'Maternal Care Agent', keywords: ['pregnant','pregnancy','baby kick','contractions','delivery','antenatal','prenatal','morning sickness','folic acid','iron deficiency'] },
  newborn: { name: 'Newborn Care Agent', keywords: ['newborn','infant','baby','breastfeeding','jaundice','umbilical','nappy','crying baby','formula milk'] },
  pediatric: { name: 'Pediatric Care Agent', keywords: ['child','kid','fever in child','cough child','vaccination','growth','school','malnutrition'] },
  elderly: { name: 'Elderly Care Agent', keywords: ['elderly','old person','senior','arthritis','fall','memory loss','dementia','bp medicine','blood pressure elderly'] },
  diabetes: { name: 'Diabetes Care Agent', keywords: ['diabetes','blood sugar','insulin','glucose','HbA1c','sugar level','diabetic','metformin','sweet urine'] },
  nutrition: { name: 'Nutrition Agent', keywords: ['diet','nutrition','food','eat','weight','BMI','protein','vitamin','iron','anaemia','calcium'] },
  general: { name: 'General Physician Agent', keywords: [] },
};

const RESPONSES: Record<string, (input: string, ctx: { medicines?: Medicine[]; patient?: Patient; vitals?: HealthTest[] }) => string> = {
  emergency: () => `🚨 EMERGENCY ALERT\n\nThis sounds like a medical emergency. Please:\n\n1. Call 108 (ambulance) immediately\n2. Keep the person calm and still\n3. Do not give food or water\n4. Go to Emergency page for first aid guides\n\n⚠️ Demo: Real ambulance booking requires network/telecom integration.`,
  maternal: (input, ctx) => `🤰 Maternal Care Advice\n\n${ctx.patient?.isPregnant ? `You are ${ctx.patient.pregnancyWeeks || '?'} weeks pregnant. ` : ''}Here is relevant guidance:\n\n• Take Folic Acid daily (400–800 mcg)\n• Iron supplements as prescribed\n• Attend all antenatal check-ups\n• Stay hydrated, eat iron-rich foods (spinach, dal, meat)\n• Watch for warning signs: heavy bleeding, severe headache, no fetal movement\n\nIf you have specific concerns: ${input}, consult your ASHA worker or doctor immediately.\n\n📋 Disclaimer: This is rule-based offline AI guidance, not a medical diagnosis.`,
  newborn: () => `🍼 Newborn Care Guidance\n\n• Breastfeed every 2–3 hours (8–12 times/day)\n• Keep warm, skin-to-skin contact\n• Check for jaundice (yellow skin/eyes) — seek help if severe\n• Umbilical cord: keep clean and dry\n• BCG, OPV, Hepatitis B vaccines at birth\n• Warning signs: not feeding, high fever, difficulty breathing\n\n📋 Disclaimer: Offline rule-based guidance only. Consult your doctor.`,
  pediatric: (input) => `👶 Child Health Guidance\n\nFor your concern: "${input}"\n\n• For fever in children: give paracetamol (not aspirin), ensure fluids\n• Keep vaccination schedule up-to-date (UIP schedule)\n• Watch for malnutrition: weight-for-age charts\n• Seek help if: high fever >3 days, difficulty breathing, convulsions, not eating\n\n📋 Disclaimer: Offline rule-based guidance. Always consult a pediatrician.`,
  elderly: (input, ctx) => `👴 Elderly Care Guidance\n\nFor concern: "${input}"\n\n${ctx.medicines?.length ? `Current medicines noted: ${ctx.medicines.map(m => m.name).join(', ')}\n\n` : ''}• Take medicines at the same time every day\n• Monitor blood pressure daily if prescribed\n• Avoid falls: use handrails, non-slip mats\n• Stay active with gentle walking\n• Alert family if feeling unwell\n\n📋 Disclaimer: Offline rule-based guidance. Consult your doctor.`,
  diabetes: (input, ctx) => {
    const lastSugar = ctx.vitals?.find(v => v.type === 'blood_sugar');
    return `🩺 Diabetes Care Guidance\n\n${lastSugar ? `Last recorded blood sugar: ${lastSugar.value} ${lastSugar.unit}\n\n` : ''}For concern: "${input}"\n\n• Target blood sugar: 80–130 mg/dL (fasting), <180 mg/dL (2hr after meals)\n• Take medicines (Metformin etc.) as prescribed\n• Low-sugar diet: avoid rice, sweets, white bread\n• Check feet daily for wounds\n• Regular HbA1c test every 3 months\n\n📋 Disclaimer: Offline rule-based guidance. Monitor regularly and consult your doctor.`;
  },
  nutrition: (input) => `🥗 Nutrition Guidance\n\nFor concern: "${input}"\n\n• Eat 3 meals and 2 snacks daily\n• Include: dal, vegetables, fruits, milk, eggs\n• Iron-rich foods: spinach, beets, jaggery, meat\n• Vitamin C helps iron absorption\n• Avoid: excess salt, sugar, oily fried food\n• Drink 8–10 glasses of water daily\n\n📋 Disclaimer: Offline rule-based nutrition guidance. Consult a nutritionist for personal advice.`,
  general: (input) => `🩺 General Health Guidance\n\nI understood your concern: "${input}"\n\nHere is general advice:\n• Rest well and stay hydrated\n• For fever: Paracetamol 500mg (adults), cool compresses\n• For mild stomach pain: light diet, avoid spicy food, oral rehydration\n• For cough/cold: steam inhalation, honey + ginger tea\n• Seek immediate care for: difficulty breathing, severe chest pain, high fever >104°F, unconsciousness\n\n📋 This is offline rule-based health information, not a diagnosis. Please consult a doctor for proper treatment.`,
};

function detectAgent(input: string): keyof typeof AGENTS {
  const lower = input.toLowerCase();
  for (const [key, agent] of Object.entries(AGENTS)) {
    if (key === 'general') continue;
    if (agent.keywords.some(k => lower.includes(k))) return key as keyof typeof AGENTS;
  }
  return 'general';
}

function getResponse(agentKey: keyof typeof AGENTS, input: string, ctx: Parameters<typeof RESPONSES.general>[1]): string {
  const fn = RESPONSES[agentKey] || RESPONSES.general;
  return fn(input, ctx);
}

export default function AiAssistantPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: t('ai.greeting') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ctx, setCtx] = useState<{ medicines?: Medicine[]; patient?: Patient; vitals?: HealthTest[] }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    if (pid) {
      db.patients.get(pid).then(p => setCtx(c => ({ ...c, patient: p })));
      db.medicines.where({ patientId: pid, status: 'active' }).toArray().then(m => setCtx(c => ({ ...c, medicines: m })));
      db.healthTests.where('patientId').equals(pid).reverse().limit(5).toArray().then(v => setCtx(c => ({ ...c, vitals: v })));
    }
  }, [currentUser]);

  const sendMessage = async (text?: string) => {
    const userInput = (text || input).trim();
    if (!userInput) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userInput }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const agentKey = detectAgent(userInput);
    const agent = AGENTS[agentKey];
    const response = getResponse(agentKey, userInput, ctx);
    setMessages(prev => [...prev, { role: 'ai', text: response, agent: agent.name }]);

    // Save to conversation history
    if (currentUser?.id) {
      await db.aiConversations.add({
        patientId: currentUser.id,
        messages: [
          { role: 'user', content: userInput, timestamp: new Date().toISOString() },
          { role: 'assistant', content: response, agentType: agentKey, timestamp: new Date().toISOString() }
        ],
        agentType: agentKey,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }
    setLoading(false);
  };

  const startListening = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert(t('ai.noSpeech'));
      return;
    }
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const generateDoctorSummary = async () => {
    if (!currentUser?.id) return;
    const complaint = messages.filter(m => m.role === 'user').map(m => m.text).join('; ');
    const agentResponses = messages.filter(m => m.role === 'ai').map(m => m.text).join('\n\n');
    await db.doctorSummaries.add({
      patientId: currentUser.id,
      doctorId: 1,
      complaint: complaint.slice(0, 200),
      symptoms: [complaint],
      duration: 'As reported',
      history: ctx.patient?.conditions?.join(', ') || '',
      medicines: ctx.medicines?.map(m => m.name).join(', ') || '',
      allergies: ctx.patient?.allergies?.join(', ') || '',
      vitals: ctx.vitals ? `Last BP/Sugar: ${ctx.vitals[0]?.value || 'N/A'}` : '',
      observations: agentResponses.slice(0, 500),
      warningSigns: ['As identified by AI agent'],
      nextStep: 'Consult treating physician',
      createdAt: new Date().toISOString(),
    });
    setMessages(prev => [...prev, { role: 'ai', text: '✅ ' + t('ai.summaryGenerated') + '. Go to Doctor Summary page to view and print it.' }]);
  };

  const QUICK_QUESTIONS = [
    'I have a fever and headache',
    'I missed my medicine today',
    'I am pregnant and feeling dizzy',
    'My blood sugar is high',
    'My child has a cough',
    'I need first aid for a cut',
  ];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 py-3 bg-violet-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="font-bold">{t('ai.title')}</div>
              <div className="text-xs opacity-75">{t('ai.disclaimer')}</div>
            </div>
          </div>
          <div className="bg-violet-700 rounded-xl px-3 py-1.5 mt-2 text-xs text-violet-200">
            🔒 Offline rule-based AI simulation — No data sent to any server
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}`}>
                {msg.agent && <div className="text-xs font-bold text-violet-600 mb-1">🤖 {msg.agent}</div>}
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500 shadow-sm">
                <span className="animate-pulse">{t('ai.thinking')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 py-2 bg-white border-t overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="whitespace-nowrap text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 font-medium">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Summary Button */}
        {messages.length > 2 && (
          <div className="px-4 py-1 bg-white">
            <button onClick={generateDoctorSummary}
              className="w-full text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 py-2 rounded-xl font-medium hover:bg-cyan-100">
              📄 {t('ai.generateSummary')}
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-3 bg-white border-t flex gap-2 items-end">
          <button
            onClick={listening ? stopListening : startListening}
            className={`p-3 rounded-xl flex-shrink-0 transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}
          >
            🎤
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={listening ? t('ai.listening') : t('ai.typeMessage')}
            rows={2}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:border-violet-400 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-violet-600 text-white p-3 rounded-xl disabled:opacity-40 hover:bg-violet-700 flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </Layout>
  );
}
