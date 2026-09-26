import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  agentSimulationCoordinator,
  AgentSimulationResult,
  SpecializedAgentDef,
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
  Filter,
} from 'lucide-react';

const SUGGESTED_CONDITIONS = [
  'Acute Fever and Headache',
  'Diabetes Mellitus & High Blood Sugar',
  'Hypertension & Chest Pain',
  'Asthma / Cough and Breathing',
  'Maternal Health & Pregnancy Care',
  'Childhood Diarrhea & Dehydration',
  'Newborn & Infant Care',
  'Elderly Fall / Joint Pain',
  'Nutritional Anemia & Blood Count',
  'Surgery Follow-up & Wound Review',
  'Medical Report Analysis',
  'Radiology & X-ray Scan',
];

export default function AgentSimulationPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [conditionInput, setConditionInput] = useState<string>('Acute Fever and Headache');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<AgentSimulationResult | null>(null);
  const [agentFilter, setAgentFilter] = useState<'all' | 'executed' | 'skipped'>('executed');

  // Auto-run once on mount for instant preview
  useEffect(() => {
    handleRunSimulation('Acute Fever and Headache');
  }, []);

  const handleRunSimulation = async (queryToRun?: string) => {
    const targetQuery = queryToRun || conditionInput;
    if (!targetQuery.trim()) return;

    setIsRunning(true);

    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = await agentSimulationCoordinator.runSimulation(
        targetQuery,
        currentUser?.id
      );
      setSimulationResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const displayedAgents = (simulationResult?.allAgents || []).filter((ag) => {
    if (agentFilter === 'executed') return ag.executionStatus === 'EXECUTED';
    if (agentFilter === 'skipped') return ag.executionStatus === 'SKIPPED';
    return true;
  });

  return (
    <Layout>
      <div className="px-4 py-4 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F766E]">
                26-Agent Multi-Specialist Medical Simulation
              </h1>
            </div>
            <p className="text-xs text-[#64748B]">
              Collaborative clinical reasoning across 26 specialized agents. Only relevant agents are executed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => window.print()}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Brief</span>
            </button>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Clinical Symptom or Condition Input:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
                placeholder="Enter condition, symptom, or test query (e.g. Fever, Blood Report, Pregnancy)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={() => handleRunSimulation()}
              disabled={isRunning || !conditionInput.trim()}
              className="bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing Agents...</span>
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
            <span className="text-[11px] font-bold text-slate-500">Quick Test Cases:</span>
            {SUGGESTED_CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setConditionInput(c);
                  handleRunSimulation(c);
                }}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
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

        {/* 26 Specialist Agents Roster & Filter */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-teal-600" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Specialized Agents Roster (26 Total)
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                {simulationResult?.executedAgents.length || 0} Executed
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {simulationResult?.skippedAgents.length || 0} Skipped
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-[11px]">
              <button
                onClick={() => setAgentFilter('executed')}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  agentFilter === 'executed' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Executed Only ({simulationResult?.executedAgents.length || 0})
              </button>
              <button
                onClick={() => setAgentFilter('all')}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  agentFilter === 'all' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 26 Agents
              </button>
              <button
                onClick={() => setAgentFilter('skipped')}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  agentFilter === 'skipped' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skipped ({simulationResult?.skippedAgents.length || 0})
              </button>
            </div>
          </div>

          {/* Grid of Agents */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {displayedAgents.map((ag) => {
              const isExecuted = ag.executionStatus === 'EXECUTED';
              return (
                <div
                  key={ag.id}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isExecuted
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ag.avatarIcon}</span>
                    <div className="truncate">
                      <p className="font-bold truncate text-[11px] text-slate-900">{ag.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{ag.purpose}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                    <span
                      className={`font-black ${
                        isExecuted ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {isExecuted ? '✓ EXECUTED' : 'SKIPPED (N/A)'}
                    </span>
                    <span className="text-slate-400 font-mono">#{ag.id.slice(0, 8)}</span>
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

            {/* Executed Agents Deep-Dive Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Active Agent Clinical Contributions ({simulationResult.executedAgents.length} Executed)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simulationResult.executedAgents.map((ag) => (
                  <div
                    key={ag.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ag.avatarIcon}</span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{ag.name}</p>
                          <p className="text-[10px] text-slate-500">{ag.purpose}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        EXECUTED
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Observations:</p>
                      <ul className="text-[11px] text-slate-700 space-y-0.5">
                        {ag.observations.map((obs, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {ag.recommendedTests.length > 0 && (
                      <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Recommended Tests:</p>
                        <p className="text-[11px] text-slate-600">{ag.recommendedTests.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid of Results: Concerns, Symptoms, Evidence, Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relevant Symptoms & Possible Concerns */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} className="text-teal-600" />
                  <span>Relevant Symptoms &amp; Possible Concerns</span>
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

              {/* Red Flags & Safety Warnings */}
              <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-red-600" />
                  <span>Emergency Triage &amp; Red Flags</span>
                </h3>
                <ul className="text-xs text-red-800 space-y-1.5">
                  {simulationResult.redFlags.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-600 font-bold">⚠️</span>
                      <span className="font-medium">{rf}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-white/80 border border-red-200 rounded-xl p-2.5 text-[11px] text-red-900 font-medium">
                  If any of the above warning signs emerge, do not wait. Contact 108 or reach the nearest hospital immediately.
                </div>
              </div>

              {/* Supportive Care & Nutrition Advice */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple size={15} className="text-emerald-600" />
                  <span>Supportive Care &amp; Nutrition Guidance</span>
                </h3>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {simulationResult.lifestyleSupportiveSuggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions for Doctor */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-indigo-600" />
                  <span>Questions to Ask Your Doctor</span>
                </h3>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {simulationResult.questionsForDoctor.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck size={16} className="text-teal-700 shrink-0 mt-0.5" />
              <span>{simulationResult.educationalDisclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
