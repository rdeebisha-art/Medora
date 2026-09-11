import React, { useState } from 'react';
import { Bot, UserCheck, Stethoscope, Bell, ArrowRight, Play, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, Volume2, Pill, Heart, AlertTriangle } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

interface A2AWorkflowProps {
  onNavigateToReferral: () => void;
  onNavigateToDoctorHandoff: () => void;
  currentLang: LanguageCode;
}

export const A2AWorkflow: React.FC<A2AWorkflowProps> = ({
  onNavigateToReferral,
  onNavigateToDoctorHandoff,
  currentLang,
}) => {
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  const specialistAgents = [
    {
      id: 'agent-gp',
      name: 'General Medicine Specialist Agent',
      domain: 'Physician Core',
      avatarBg: 'bg-blue-600',
      dialogue: 'Patient Ramesh Kumar (Age 68) presents with Stage 2 Hypertension (158/92 mmHg) and Fasting Glucose 142 mg/dL. I propose continuing Telmisartan 40mg and adding Metformin 500mg. Requesting Pharmacist and Geriatric clearance.',
      status: 'Proposed Initial Plan',
    },
    {
      id: 'agent-geriatric',
      name: 'Geriatric Specialist Agent',
      domain: 'Elderly Care Specialist',
      avatarBg: 'bg-amber-600',
      dialogue: 'Reviewed patient age (68) and fall risk. Caution: blood pressure should not drop precipitously below 120/70 to avoid orthostatic dizziness and bathroom falls. Ensure morning administration after breakfast, never on empty stomach.',
      status: 'Fall Safety Verified',
    },
    {
      id: 'agent-maternal',
      name: 'Maternal & Family Health Agent',
      domain: 'Cross-Family Safety',
      avatarBg: 'bg-rose-600',
      dialogue: 'Checked household cross-inventory. Household has 24-week pregnant mother Sunita and 4-year-old Aarav. Verified that no ACE/ARB medicines are accessible to Sunita (contraindicated in pregnancy). Medicine storage segregation confirmed.',
      status: 'Household Safety Cleared',
    },
    {
      id: 'agent-pharma',
      name: 'Clinical Pharmacist Agent',
      domain: 'Drug-Drug Interaction Specialist',
      avatarBg: 'bg-emerald-600',
      dialogue: 'Cross-checked Telmisartan 40mg with Metformin 500mg: Zero dangerous interaction. Warned against simultaneous OTC Ibuprofen / Diclofenac painkiller use, which can induce acute kidney strain with Telmisartan. Prescribing Paracetamol for joint pain.',
      status: 'Interactions Vetted',
    },
    {
      id: 'agent-consensus',
      name: 'Consensus Medical Report Agent',
      domain: 'Finalized Clinical Protocol',
      avatarBg: 'bg-purple-600',
      dialogue: 'All 4 hospital specialists have reached consensus. Finalized clinical prescription formatted in simple village language with zero jargon, complete with emergency red flags and dietary salt limits.',
      status: 'Consensus Finalized',
    },
  ];

  const runSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < specialistAgents.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const finalizedReports: Record<LanguageCode, string> = {
    en: 'Finalized medical report for Ramesh Kumar. Take Telmisartan 40 milligrams after breakfast and Metformin 500 milligrams after dinner only as prescribed. Use Paracetamol for joint pain only after professional advice. Reduce salt and pickles. Contact a healthcare professional urgently for severe dizziness, chest pain, breathing difficulty, or persistently high blood pressure.',
    hi: 'Finalized medical report for Ramesh Kumar. Take prescribed medicines only after professional advice. Reduce salt and seek urgent care for severe symptoms.',
    te: 'Finalized medical report for Ramesh Kumar. Take prescribed medicines only after professional advice. Reduce salt and seek urgent care for severe symptoms.',
    ml: 'Finalized medical report for Ramesh Kumar. Take prescribed medicines only after professional advice. Reduce salt and seek urgent care for severe symptoms.',
    ta: 'Finalized medical report for Ramesh Kumar. Take prescribed medicines only after professional advice. Reduce salt and seek urgent care for severe symptoms.',
    kn: 'Finalized medical report for Ramesh Kumar. Take prescribed medicines only after professional advice. Reduce salt and seek urgent care for severe symptoms.',
  };
  const finalizedReportText = finalizedReports[currentLang];

  const readFinalReport = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    voiceService.speak(finalizedReportText, currentLang, undefined, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-purple-400/20 border border-purple-300/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold">
              <Bot className="w-4 h-4 text-purple-300" />
              <span>Multi-Agent Autonomous Hospital Case Conference</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Agent-to-Agent (A2A) Multi-Specialist Deliberation
            </h1>
            <p className="text-sm text-purple-100/90 leading-relaxed">
              Just like doctors and specialists gather at a hospital case conference before finalizing complex treatments, Medora’s domain-specialist AI agents deliberate with each other, eliminate drug interactions, and produce an easily understandable final report.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Deliberating Across Agents...' : 'Run Live Specialist Deliberation'}</span>
          </button>
        </div>
      </div>

      {/* Specialist Agents Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <span>Hospital Domain Specialists Live Dialogue</span>
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            5 Specialists Active
          </span>
        </div>

        <div className="space-y-4">
          {specialistAgents.map((agent, idx) => {
            const isDeliberated = activeStep >= idx;
            const isCurrentlySpeaking = activeStep === idx && isSimulating;

            return (
              <div
                key={agent.id}
                className={`p-5 rounded-2xl border transition-all space-y-2 ${
                  isCurrentlySpeaking
                    ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-300 shadow-md'
                    : isDeliberated
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-50/40 border-slate-200 opacity-40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${agent.avatarBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{agent.name}</h4>
                      <span className="text-[10px] text-purple-700 font-bold">{agent.domain}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-center ${
                    isDeliberated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pl-11">
                  "{agent.dialogue}"
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Finalized Consensus Medical Report */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Consensus Medical Plan Finalized</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Finalized Consensus Medical Report
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified by all hospital specialists without confusing medical jargon so the family can understand clearly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={readFinalReport}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow ${
                speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? 'Stop Voice' : '🔊 Listen in Native Language'}</span>
            </button>
            <button
              onClick={onNavigateToDoctorHandoff}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1"
            >
              <span>Doctor Handoff Slip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/30 space-y-2">
            <h4 className="font-black text-emerald-300 text-sm">Daily Safe Medications:</h4>
            <ul className="space-y-1.5 text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Telmisartan 40mg:</strong> 1 tablet after breakfast as prescribed for blood pressure.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Metformin 500mg SR:</strong> 1 tablet after dinner as prescribed for blood sugar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Paracetamol 650mg:</strong> For knee pain only after professional advice.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/30 space-y-2">
            <h4 className="font-black text-amber-300 text-sm">Important Precautions:</h4>
            <ul className="space-y-1.5 text-slate-200">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Avoid Ibuprofen or Diclofenac unless prescribed because they may strain the kidneys.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Rise slowly from bed to reduce dizziness and fall risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Use very little salt, pickles, papad, and fried food.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
