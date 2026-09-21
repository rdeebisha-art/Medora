import React, { useState } from 'react';
import {
  Bot,
  Stethoscope,
  Play,
  Check,
  Lock,
  Unlock,
  Volume2,
  Smartphone,
  Users,
  FileText,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Heart,
  Pill,
  Apple,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';
import {
  DEMO_RURAL_PATIENT,
  DEMO_MEDICAL_REPORT,
  INITIAL_DEMO_SYMPTOMS,
  A2A_SPECIALIST_AGENTS,
  SIMULATION_STAGES,
} from '../data/a2a/ruralAssistedDemo';

interface A2AWorkflowProps {
  onNavigateToReferral?: () => void;
  onNavigateToDoctorHandoff?: () => void;
  currentLang: LanguageCode;
}

export const A2AWorkflow: React.FC<A2AWorkflowProps> = ({
  onNavigateToDoctorHandoff,
  currentLang,
}) => {
  // Report Scan States ('idle' | 'scanning' | 'reading' | 'completed')
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'reading' | 'completed'>('idle');
  
  // Symptoms Collection State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(INITIAL_DEMO_SYMPTOMS);
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');

  // Simulation Stages & Execution States
  const [currentStageNumber, setCurrentStageNumber] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  
  // Specialist Agent Status Map (id -> 'waiting' | 'processing' | 'completed')
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'processing' | 'completed'>>({
    'agent-gh': 'waiting',
    'agent-db': 'waiting',
    'agent-bp': 'waiting',
    'agent-nu': 'waiting',
    'agent-et': 'waiting',
  });

  // Final Response Lock State (LOCKED until stage 12 completes)
  const [isFinalResponseUnlocked, setIsFinalResponseUnlocked] = useState<boolean>(false);

  // Doctor Handoff Modal State
  const [showDoctorHandoffModal, setShowDoctorHandoffModal] = useState<boolean>(false);

  // Audio Speech State
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Toggle Symptom Selection
  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
      setCustomSymptomInput('');
    }
  };

  // Report Scan Trigger
  const handleStartScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('reading');
      setTimeout(() => {
        setScanState('completed');
      }, 800);
    }, 800);
  };

  // Run Sequential 12-Stage A2A Simulation
  const startSimulation = () => {
    if (scanState !== 'completed') {
      handleStartScan();
    }

    setIsSimulating(true);
    setIsFinalResponseUnlocked(false);
    setCurrentStageNumber(1);
    setCompletedStages([1]);

    // Reset Agent Statuses
    setAgentStatuses({
      'agent-gh': 'waiting',
      'agent-db': 'waiting',
      'agent-bp': 'waiting',
      'agent-nu': 'waiting',
      'agent-et': 'waiting',
    });

    let currentStage = 1;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage <= 12) {
        setCurrentStageNumber(currentStage);
        setCompletedStages((prev) => [...prev, currentStage]);

        // Map stage to agent status
        const stageConfig = SIMULATION_STAGES.find((s) => s.stageNumber === currentStage);
        if (stageConfig?.activeAgentId) {
          const agentId = stageConfig.activeAgentId;
          setAgentStatuses((prev) => ({
            ...prev,
            [agentId]: 'processing',
          }));

          setTimeout(() => {
            setAgentStatuses((prev) => ({
              ...prev,
              [agentId]: 'completed',
            }));
          }, 700);
        }
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setIsFinalResponseUnlocked(true); // Unlock final response strictly at stage 12
      }
    }, 1000);
  };

  // Reset Simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentStageNumber(0);
    setCompletedStages([]);
    setScanState('idle');
    setSelectedSymptoms(INITIAL_DEMO_SYMPTOMS);
    setIsFinalResponseUnlocked(false);
    setShowDoctorHandoffModal(false);
    setAgentStatuses({
      'agent-gh': 'waiting',
      'agent-db': 'waiting',
      'agent-bp': 'waiting',
      'agent-nu': 'waiting',
      'agent-et': 'waiting',
    });
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
    }
  };

  // Synthesized Final Response Text (Cautious Phrasing)
  const finalResponseText = `Your report contains findings that need medical attention, including elevated blood pressure and blood glucose information.

The dizziness, weakness and increased thirst may have several possible causes. These symptoms and report findings can be related to blood-sugar or blood-pressure problems, but they are not enough to confirm a diagnosis.

Please have the complete report reviewed by a qualified healthcare professional.

If severe symptoms such as difficulty breathing, severe chest pain, fainting/unresponsiveness, seizure, severe weakness on one side, or other emergency warning signs occur, seek emergency medical care immediately.

Medora provides health information and does not replace a doctor or confirm a diagnosis.`;

  const readFinalResponse = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    voiceService.speak(finalResponseText, currentLang, undefined, () => setSpeaking(false));
    setSpeaking(true);
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case 'Pill':
        return <Pill className="w-5 h-5 text-purple-600" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'Apple':
        return <Apple className="w-5 h-5 text-teal-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      default:
        return <Bot className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-black uppercase">
              <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>SIMULATION TITLE: Rural Patient — Report + Symptoms Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Assisted Access A2A Workflow
            </h1>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 max-w-3xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">User Scenario</span>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                "A rural patient has only a basic phone. The patient has received a medical report but does not understand it. The patient is also experiencing symptoms and wants to know what the report and symptoms may indicate."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetSimulation}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2 transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ASSISTED ACCESS WORKFLOW EXPLANATION CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Phone User Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">Target User</span>
              <h3 className="font-extrabold text-slate-900 text-base">📱 Basic / Button Phone User</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This patient uses a basic/button phone. The patient cannot open web applications or view complex digital reports directly.
          </p>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs space-y-1">
            <div className="font-bold text-amber-950 flex items-center justify-between">
              <span>Patient Profile (Fictional Demo)</span>
              <span className="bg-amber-200 text-amber-900 font-mono text-[10px] px-2 py-0.5 rounded font-extrabold">
                {DEMO_RURAL_PATIENT.id}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-amber-900 font-medium">
              <div><strong>Name:</strong> {DEMO_RURAL_PATIENT.name}</div>
              <div><strong>Age:</strong> {DEMO_RURAL_PATIENT.age}</div>
              <div><strong>Sex:</strong> {DEMO_RURAL_PATIENT.gender}</div>
              <div><strong>Location:</strong> {DEMO_RURAL_PATIENT.location}</div>
            </div>
          </div>
        </div>

        {/* Assisted Medora Access Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-800 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">Access Pathway</span>
              <h3 className="font-extrabold text-slate-900 text-base">🤝 Assisted Medora Access</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because the patient's phone cannot open the Medora web application, a family member, ASHA worker, or village health worker uses an assisted Medora device to scan the report and enter the patient's symptoms.
          </p>
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3 text-xs text-teal-950 font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-teal-900">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Assisted Workflow & Demo Label</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-snug">
              The basic phone remains the communication channel for the patient. This feature is clearly labeled as an <strong>ASSISTED / DEMO WORKFLOW</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. REPORT SCANNING SIMULATION (STEP 1) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">📄 Scan Medical Report</h3>
              <p className="text-xs text-slate-500">
                Report Type: {DEMO_MEDICAL_REPORT.type} • ID: {DEMO_MEDICAL_REPORT.reportId}
              </p>
            </div>
          </div>

          {scanState !== 'completed' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartScan}
                disabled={scanState !== 'idle'}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-transform disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {scanState === 'idle'
                    ? '[ Use Demo Report ]'
                    : scanState === 'scanning'
                    ? '📷 Scanning report...'
                    : '🔍 Reading report...'}
                </span>
              </button>
            </div>
          ) : (
            <span className="bg-emerald-100 text-emerald-900 font-black text-xs px-3.5 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              ✓ Report Information Extracted
            </span>
          )}
        </div>

        {/* Extracted Findings Display */}
        {scanState === 'completed' && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/80 pb-2">
              <h4 className="font-black text-blue-950 text-xs uppercase tracking-wider">
                Extracted Information
              </h4>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-md border border-amber-300">
                {DEMO_MEDICAL_REPORT.disclaimer}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_MEDICAL_REPORT.findings.map((f) => (
                <div key={f.parameter} className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-sm space-y-1.5">
                  <div className="text-slate-500 font-semibold text-xs">{f.parameter}</div>
                  <div className="font-mono font-black text-slate-900 text-base">
                    {f.value} {f.unit}
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      {f.extractedTag}
                    </span>
                    <span className={`font-bold ${f.flag === 'Elevated' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {f.flag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SYMPTOM COLLECTION (STEP 2) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">What symptoms is the patient experiencing?</h3>
            <p className="text-xs text-slate-500">
              Patient-reported symptoms (These are reported by the patient; not confirmed diagnoses).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 block">Selectable Symptoms:</span>
          <div className="flex flex-wrap gap-2">
            {['Dizziness', 'Weakness', 'Increased thirst', 'Blurry vision', 'Frequent urination', 'Headache'].map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4 text-white" /> : <span className="text-amber-500">🟠</span>}
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Symptom Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customSymptomInput}
            onChange={(e) => setCustomSymptomInput(e.target.value)}
            placeholder="Add another reported symptom..."
            className="text-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 bg-slate-50 w-full sm:w-80 focus:outline-none focus:border-teal-500 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomSymptom();
            }}
          />
          <button
            onClick={handleAddCustomSymptom}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shrink-0 transition-transform active:scale-95"
          >
            Add Symptom
          </button>
        </div>
      </div>

      {/* 5. A2A ROUTING VISUAL FLOW DIAGRAM */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-base">A2A Routing Architecture</h3>
          </div>
          <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded font-mono">
            MULTI-AGENT ORCHESTRATION
          </span>
        </div>

        {/* Animated Horizontal / Vertical Flow Pipeline */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-[850px] text-xs font-bold py-2 px-1">
            <div className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Assisted Access</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-teal-500/20 text-teal-300 border border-teal-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Medora AI</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>A2A Orchestrator</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Report Analysis</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>5 Specialist AIs</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Safety Check</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Response Synthesizer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simple Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. A2A SIMULATION CONTROLLER (STEP 3) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-purple-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-200 px-3 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>A2A SIMULATION TIMELINE</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {currentStageNumber === 0 ? 'A2A Simulation Ready' : `Executing Stage ${currentStageNumber} of 12...`}
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
              Medora will analyze the demo report and symptoms using multiple health specialist agents sequentially.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-transform disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isSimulating ? `Stage ${currentStageNumber}/12...` : 'Start Simulation'}</span>
            </button>
          </div>
        </div>

        {/* 12-Stage Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-purple-800/60">
          <div className="flex items-center justify-between text-xs text-purple-200 font-mono font-bold">
            <span>Simulation Progress: Stage {currentStageNumber} of 12</span>
            <span>{isFinalResponseUnlocked ? '🔓 FINAL RESPONSE UNLOCKED' : '🔒 FINAL RESPONSE LOCKED'}</span>
          </div>

          <div className="w-full bg-purple-950 rounded-full h-3 overflow-hidden p-0.5 border border-purple-800">
            <div
              className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStageNumber / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7. 12 SEQUENTIAL EXECUTION STAGES GRID */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span>Sequential Execution Stages (1–12)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIMULATION_STAGES.map((stage) => {
            const isCompleted = completedStages.includes(stage.stageNumber);
            const isCurrent = currentStageNumber === stage.stageNumber;

            return (
              <div
                key={stage.stageNumber}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
                  isCurrent
                    ? 'bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-300'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 font-extrabold">Stage {stage.stageNumber}: {stage.title}</span>
                  <span className="text-[10px]">
                    {isCurrent ? (
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded font-mono animate-pulse">⏳ Processing</span>
                    ) : isCompleted ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">✓ Completed</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">○ Waiting</span>
                    )}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. SPECIALIST AGENT CONSULTATION CARDS & SELECTION REASONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">
            Specialists Consulted (Agent-to-Agent Cards)
          </h3>
          <span className="text-xs text-slate-500 font-bold">5 Specialist Health AIs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {A2A_SPECIALIST_AGENTS.map((agent) => {
            const status = agentStatuses[agent.id];

            return (
              <div
                key={agent.id}
                className={`rounded-3xl border p-5 space-y-3 transition-all ${
                  status === 'processing'
                    ? 'bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-200'
                    : status === 'completed'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                      {getAgentIcon(agent.iconName)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{agent.name}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">{agent.domain}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      status === 'processing'
                        ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                        : status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {status === 'processing' ? '⏳ Processing' : status === 'completed' ? '✓ Completed' : '○ Waiting'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {status === 'completed'
                    ? agent.completedMessage
                    : status === 'processing'
                    ? agent.processingMessage
                    : agent.initialMessage}
                </p>

                {/* Selection Reason */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                  <strong className="text-slate-800 font-bold block">Selection Reason:</strong>
                  <p className="text-slate-500 italic">{agent.selectionReason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. LOCKED / UNLOCKED FINAL MEDORA RESPONSE */}
      <div
        className={`rounded-3xl border p-6 transition-all duration-300 ${
          isFinalResponseUnlocked
            ? 'bg-white border-teal-500 shadow-xl ring-2 ring-teal-200'
            : 'bg-slate-100 border-slate-300 opacity-90'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            {isFinalResponseUnlocked ? (
              <>
                <Unlock className="w-5 h-5 text-teal-600" />
                <span>💬 Medora AI — Final Response</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-slate-500" />
                <span>🔒 FINAL RESPONSE</span>
              </>
            )}
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isFinalResponseUnlocked
                ? 'bg-teal-100 text-teal-800 border-teal-300'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {isFinalResponseUnlocked ? '🔓 Unlocked (Stage 12 Complete)' : '🔒 Waiting for all A2A steps to complete...'}
          </span>
        </div>

        {isFinalResponseUnlocked ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {finalResponseText}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={readFinalResponse}
                className={`text-xs font-bold px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 ${
                  speaking
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{speaking ? 'Stop Audio' : 'Listen to Explanation'}</span>
              </button>

              <button
                onClick={() => {
                  setShowDoctorHandoffModal(true);
                  if (onNavigateToDoctorHandoff) {
                    // Also enable navigation if handler provided
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>👨‍⚕️ Generate Doctor Summary</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <Lock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Final Response is Locked</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Waiting for all A2A steps to complete... Click <strong>"Start Simulation"</strong> above to execute the 12 sequential A2A stages.
            </p>
          </div>
        )}
      </div>

      {/* 10. DOCTOR HANDOFF SUMMARY MODAL / CARD */}
      {(showDoctorHandoffModal || isFinalResponseUnlocked) && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">👨‍⚕️ Doctor Handoff Packet</h3>
                <p className="text-xs text-slate-500">
                  AI-generated summary — clinician review required.
                </p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-300">
              CLINICIAN REVIEW REQUIRED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left Column: Patient & Symptoms */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1">
                Patient Information & Intake
              </h4>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <div><strong>Patient ID:</strong> {DEMO_RURAL_PATIENT.id}</div>
                <div><strong>Age:</strong> {DEMO_RURAL_PATIENT.age}</div>
                <div><strong>Sex:</strong> {DEMO_RURAL_PATIENT.gender}</div>
                <div><strong>Access Method:</strong> {DEMO_RURAL_PATIENT.accessMethod}</div>
                <div><strong>Reported Symptoms:</strong> {selectedSymptoms.join(', ')}</div>
              </div>
            </div>

            {/* Right Column: Report & AI Observations */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1">
                Extracted Findings & AI Observations
              </h4>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <div><strong>Extracted Report Findings:</strong> BP 158/96 mmHg, Blood Glucose Elevated, Hb 10.2 g/dL</div>
                <div><strong>Important Warning Signs:</strong> No acute emergency flags, but elevated BP requires clinical evaluation.</div>
                <div><strong>AI Observations:</strong> Multi-agent synthesis indicates potential metabolic & cardiovascular overlap.</div>
                <div><strong>Missing Information:</strong> Past medical records, repeated lab test results.</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {onNavigateToDoctorHandoff && (
              <button
                onClick={onNavigateToDoctorHandoff}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Open Full Doctor Handoff Tab</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 11. 📱 FUTURE SMS / IVR CONCEPT CARD */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Future Integration / Prototype Concept
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
            FUTURE PATHWAY
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Optionally in future integrations, patients with basic feature phones could interact directly via SMS or IVR voice prompts.
        </p>

        <div className="p-3 bg-slate-950 rounded-2xl text-[11px] font-mono text-slate-300 border border-slate-800 flex items-center justify-between overflow-x-auto">
          <span>Button Phone ➔ SMS / IVR ➔ Medora Service ➔ Patient Information ➔ Medora AI</span>
        </div>
      </div>
    </div>
  );
};
