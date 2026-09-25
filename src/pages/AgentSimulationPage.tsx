import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  agentSimulationCoordinator,
  AgentSimulationResult,
} from '../services/ai/agentSimulationService';
import {
  Bot,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Heart,
  Pill,
  Apple,
  ShieldCheck,
  HelpCircle,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Search,
} from 'lucide-react';

const SUGGESTED_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Acute Fever / Dengue',
  'Asthma / Cough',
  'Maternal Health / Pregnancy',
  'Childhood Diarrhea',
  'Newborn Care',
  'Elderly Fall / Joint Pain',
  'Nutritional Anemia',
];

export default function AgentSimulationPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [conditionInput, setConditionInput] = useState<string>('Diabetes');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<AgentSimulationResult | null>(null);

  // Auto-run once on mount for instant preview
  useEffect(() => {
    handleRunSimulation('Diabetes');
  }, []);

  const handleRunSimulation = async (queryToRun?: string) => {
    const targetQuery = queryToRun || conditionInput;
    if (!targetQuery.trim()) return;

    setIsRunning(true);
    setActiveAgentIndex(0);

    // Animate through agents for realistic simulation feedback
    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % 9);
    }, 180);

    try {
      // Simulate coordinated agent reasoning step (500ms)
      await new Promise((r) => setTimeout(r, 600));
      const res = await agentSimulationCoordinator.runSimulation(
        targetQuery,
        currentUser?.id
      );
      setSimulationResult(res);
    } finally {
      clearInterval(interval);
      setIsRunning(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F766E]">
                Agent-to-Agent Medical Simulation
              </h1>
            </div>
            <p className="text-xs text-[#64748B]">
              Multi-Specialist Collaborative Clinical Reasoning & Educational Triage (100% Offline)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => window.print()}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer size={13} />
              <span>Print Brief</span>
            </button>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Disease / Condition Input:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
                placeholder="Type a disease or medical condition... (e.g. Diabetes, Fever, Hypertension)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={() => handleRunSimulation()}
              disabled={isRunning || !conditionInput.trim()}
              className="bg-[#0F766E] hover:bg-[#115E59] active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Consulting Agents...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Agent Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Condition Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500">Quick Examples:</span>
            {SUGGESTED_CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setConditionInput(c);
                  handleRunSimulation(c);
                }}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                  conditionInput === c
                    ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Specialist Agents Status Bar */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bot size={15} className="text-teal-600" />
              <span>9 Simulated Specialist Agents (Local Multi-Agent Roster)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Educational Decision-Support Only</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { name: 'General Physician', icon: '🩺' },
              { name: 'Emergency Triage', icon: '🚨' },
              { name: 'Diabetes Specialist', icon: '🩸' },
              { name: 'Nutrition Expert', icon: '🥗' },
              { name: 'Pediatric Care', icon: '👶' },
              { name: 'Maternal Care', icon: '🤰' },
              { name: 'Newborn Care', icon: '🍼' },
              { name: 'Elderly Care', icon: '👴' },
              { name: 'Medication Safety', icon: '💊' },
            ].map((ag, i) => {
              const isActive = isRunning && activeAgentIndex === i;
              const isConsulted =
                simulationResult?.consultedAgents.some((ca) =>
                  ca.agentName.toLowerCase().includes(ag.name.toLowerCase().split(' ')[0])
                ) || false;

              return (
                <div
                  key={ag.name}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs scale-102 ring-2 ring-amber-300'
                      : isConsulted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 opacity-70'
                  }`}
                >
                  <span className="text-base">{ag.icon}</span>
                  <div className="truncate">
                    <p className="font-bold truncate text-[11px]">{ag.name}</p>
                    <p className="text-[9px] text-slate-500">
                      {isActive ? 'Processing...' : isConsulted ? '✓ Consulted' : 'Standby'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured Simulation Result Display */}
        {simulationResult && (
          <div className="space-y-4">
            {/* Condition Banner & Urgency */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Condition Evaluated:
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(simulationResult.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {simulationResult.condition}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">{simulationResult.urgencyReason}</p>
              </div>

              <div
                className={`px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 self-start sm:self-center ${
                  simulationResult.urgencyLevel === 'EMERGENCY'
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : simulationResult.urgencyLevel === 'ELEVATED'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}
              >
                <AlertTriangle size={15} />
                <span>Urgency: {simulationResult.urgencyLevel}</span>
              </div>
            </div>

            {/* Grid of Results: Concerns, Symptoms, Evidence, Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relevant Symptoms & Possible Concerns */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} className="text-teal-600" />
                  <span>Relevant Symptoms & Possible Concerns</span>
                </h3>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Symptoms to Note:</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {simulationResult.relevantSymptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Possible Clinical Concerns:</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {simulationResult.possibleConcerns.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Supporting Evidence & Tests Commonly Considered */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-600" />
                  <span>Supporting Evidence & Diagnostic Tests</span>
                </h3>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Supporting Clinical Evidence:</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {simulationResult.supportingEvidence.map((e, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Tests Commonly Considered by Doctors:</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {simulationResult.testsCommonlyConsidered.map((tItem, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{tItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Red Flags & Emergency Warning */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black text-red-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span>Emergency Red Flag Warning Signs (Seek Immediate Medical Care)</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-red-800 font-medium">
                {simulationResult.redFlags.map((rf, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-red-100">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifestyle, Supportive Suggestions & When to Consult Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple size={15} className="text-emerald-600" />
                  <span>Lifestyle & Supportive Home Care Suggestions</span>
                </h3>
                <ul className="text-xs text-emerald-800 space-y-1.5">
                  {simulationResult.lifestyleSupportiveSuggestions.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✦</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope size={15} className="text-amber-700" />
                  <span>When to Consult a Qualified Doctor</span>
                </h3>
                <ul className="text-xs text-amber-800 space-y-1.5">
                  {simulationResult.whenToConsultDoctor.map((wc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">→</span>
                      <span>{wc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Medication Information Section (Safe Non-Prescriptive) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill size={15} className="text-teal-600" />
                  <span>Medication Section (Prescribed & Reference Context)</span>
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  No Auto-Prescribing
                </span>
              </div>

              {simulationResult.currentPatientPrescribedMedications.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-600">
                    Existing Doctor Prescriptions Recorded for Current Patient:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {simulationResult.currentPatientPrescribedMedications.map((m) => (
                      <div
                        key={m.id}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs space-y-0.5"
                      >
                        <p className="font-extrabold text-slate-900">{m.name}</p>
                        <p className="text-[11px] text-slate-600">
                          {m.dose} · {m.frequency}
                        </p>
                        <p className="text-[10px] text-teal-700 font-medium">{m.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600">
                  <p className="font-bold text-slate-700">No active prescriptions stored for this patient.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    "Dosage information not available without clinician prescription. Do not self-administer."
                  </p>
                </div>
              )}

              <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-xs text-teal-800 font-medium">
                <ShieldCheck size={14} className="inline mr-1 text-teal-700" />
                {simulationResult.generalMedicationInfoNotice}
              </div>
            </div>

            {/* Questions to Ask Doctor */}
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={15} className="text-indigo-600" />
                <span>Questions for Your Doctor During Consultation</span>
              </h3>
              <ul className="text-xs text-indigo-800 space-y-1.5">
                {simulationResult.questionsForDoctor.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-500 text-center italic">
              {simulationResult.educationalDisclaimer}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
