import React, { useState, useEffect } from 'react';
import { MedoraGlobalHeader } from '../components/layout/MedoraGlobalHeader';
import { useWasteStore } from '../store/useWasteStore';
import { useAppStore } from '../store/useAppStore';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Trash2,
  FileText,
  Stethoscope,
  Wifi,
  WifiOff,
  Radio,
  QrCode,
  ShieldCheck,
  Activity,
  Layers,
  Zap,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoStep {
  stepNumber: number;
  title: string;
  pillar: 'PATIENT_HEALTH' | 'A2A_AI' | 'DOCTOR_CLINICAL' | 'SMART_WASTE' | 'OFFLINE_2G_SYNC';
  agentInvolved: string;
  description: string;
  systemAction: string;
  stateBadge: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Patient Login (Rural Continuity)',
    pillar: 'PATIENT_HEALTH',
    agentInvolved: 'Voice/Language Agent',
    description: 'Meena Kumar (28 weeks pregnant, Kodaikanal) logs in using Tamil voice-assisted biometric authentication.',
    systemAction: 'Loaded patient profile P001, gestational age 28wks, medical records, and local language preference (Tamil).',
    stateBadge: 'Patient Authenticated'
  },
  {
    stepNumber: 2,
    title: 'Medical Report Upload',
    pillar: 'PATIENT_HEALTH',
    agentInvolved: 'Medical Report Agent',
    description: 'Patient uploads fresh Complete Blood Count (CBC) lab report via camera scan at Village Health Sub-Center.',
    systemAction: 'Extracted PDF/Image payload -> dispatched to A2A Medical Parser.',
    stateBadge: 'Report Queued'
  },
  {
    stepNumber: 3,
    title: 'A2A Report Analysis Agent Processing',
    pillar: 'A2A_AI',
    agentInvolved: 'Medical Report Agent',
    description: 'AI model extracts Hemoglobin (10.2 g/dL), RBC count, and identifies mild gestational anemia.',
    systemAction: 'Generated structured clinical JSON: Hb 10.2 g/dL [FLAG: MILD_ANEMIA].',
    stateBadge: 'AI Parsing (98% Conf)'
  },
  {
    stepNumber: 4,
    title: 'Patient Health Agent Synchronizes Profile',
    pillar: 'A2A_AI',
    agentInvolved: 'Patient Health Agent',
    description: 'Receives extracted report data and appends to local IndexedDB patient timeline and care gap monitor.',
    systemAction: 'Updated patient record P001: Iron & Folic Acid guidance flagged for Week 28 review.',
    stateBadge: 'Record Updated'
  },
  {
    stepNumber: 5,
    title: 'Clinical Summary Agent Formulates Handoff',
    pillar: 'A2A_AI',
    agentInvolved: 'Clinical Summary Agent',
    description: 'Synthesizes chief complaints, 28-week vitals, report highlights, and suggested clinical questions into doctor brief.',
    systemAction: 'Generated Doctor Brief with 1-click consultation review packet.',
    stateBadge: 'Doctor Brief Ready'
  },
  {
    stepNumber: 6,
    title: 'Doctor Sees Live Updated Summary',
    pillar: 'DOCTOR_CLINICAL',
    agentInvolved: 'Doctor Portal Coordinator',
    description: 'Duty Medical Officer Dr. Kavitha reviews the consolidated summary without needing to parse raw multi-page lab sheets.',
    systemAction: 'Prescribes Tab Ferrous Ascorbate 100mg OD -> immediately pushed to Patient Active Medicines.',
    stateBadge: 'Prescription Synchronized'
  },
  {
    stepNumber: 7,
    title: 'Smart Bin Detects Biomedical Waste',
    pillar: 'SMART_WASTE',
    agentInvolved: 'IoT Monitoring Agent',
    description: 'In the PHC Minor OT, contaminated infusion tubing & blood gauze is placed in front of Smart Bin BIN-PHC01-02.',
    systemAction: 'Ultrasonic + optical trigger activated. Captured high-res frame FRAME_78291.',
    stateBadge: 'Sensor Triggered'
  },
  {
    stepNumber: 8,
    title: 'Waste Classification Agent Identifies Item',
    pillar: 'A2A_AI',
    agentInvolved: 'Waste Classification Agent',
    description: 'Optical multi-spectral classifier detects contaminated blood-soaked tubing -> predicted class: INFECTIOUS.',
    systemAction: 'Calculated classification confidence: 94% (Threshold: 75%).',
    stateBadge: 'Infectious Waste (94%)'
  },
  {
    stepNumber: 9,
    title: 'Safety Verification Agent Verifies Safety',
    pillar: 'A2A_AI',
    agentInvolved: 'Safety Verification Agent',
    description: 'Validates confidence score against CPCB hazardous waste standards for touchless segregation.',
    systemAction: 'Safety score 0.99. Verified autonomous route: Safe for Yellow Biohazard bin deposition.',
    stateBadge: 'Safety Verified'
  },
  {
    stepNumber: 10,
    title: 'Waste is Automatically Segregated',
    pillar: 'SMART_WASTE',
    agentInvolved: 'IoT Monitoring Agent',
    description: 'Servo motor unlocks Yellow Biohazard lid; touchless optical deposit completes with 0% staff needle contact.',
    systemAction: 'Lid opened for 4.5s -> closed and sealed. Weight tare logged: +0.8 kg.',
    stateBadge: 'Segregated (Touchless)'
  },
  {
    stepNumber: 11,
    title: 'IoT Agent Updates Bin Telemetry',
    pillar: 'SMART_WASTE',
    agentInvolved: 'IoT Monitoring Agent',
    description: 'Smart Bin BIN-PHC01-02 fill level reaches 88% (8.4 kg / 10.0 kg max capacity). Gas sensors normal.',
    systemAction: 'Status updated from NORMAL -> OVERFLOW_ALERT.',
    stateBadge: 'Fill Level: 88%'
  },
  {
    stepNumber: 12,
    title: 'Prediction Agent Forecasts Capacity Exhaustion',
    pillar: 'A2A_AI',
    agentInvolved: 'Prediction Agent',
    description: 'Surge predictive model calculates capacity exhaustion in 1.8 hours based on evening OT schedule.',
    systemAction: 'Auto-triggered P1 Critical Collection Work Order.',
    stateBadge: 'Capacity Limit: 1.8 hrs'
  },
  {
    stepNumber: 13,
    title: 'Collection Agent Creates Work Order',
    pillar: 'A2A_AI',
    agentInvolved: 'Collection Agent',
    description: 'Work order REQ-COL-0091 created for Batch BATCH-2026-INF-088 (8.4 kg Infectious).',
    systemAction: 'Evaluated fleet availability: Smart Cart Unit Alpha-02 in range.',
    stateBadge: 'Work Order Generated'
  },
  {
    stepNumber: 14,
    title: 'Smart Cart / Autonomous Robot Assigned',
    pillar: 'SMART_WASTE',
    agentInvolved: 'Collection Agent',
    description: 'Dispatches Smart Cart Unit Alpha-02 (Operator: Ramesh M.) with digital tare scale to Kodaikanal PHC OT.',
    systemAction: 'Fleet assigned. ETA: 18 minutes. Navigation beacon locked.',
    stateBadge: 'Fleet En Route'
  },
  {
    stepNumber: 15,
    title: 'Digital Waste Passport Generated',
    pillar: 'SMART_WASTE',
    agentInvolved: 'Traceability Agent',
    description: 'Unique digital passport MWP-2026-000184 generated with embedded CPCB compliance QR code.',
    systemAction: 'Generation & Segregation milestones permanently locked with SHA-256 integrity hash.',
    stateBadge: 'Passport MWP-000184'
  },
  {
    stepNumber: 16,
    title: 'Collection & Transport Handover Logged',
    pillar: 'SMART_WASTE',
    agentInvolved: 'Traceability Agent',
    description: 'Staff nurse scans QR manifest; waste transferred to GPS-tracked vehicle TN-57-B-9912.',
    systemAction: 'Chain-of-custody milestone 3 (Collection) and 4 (Transport) marked COMPLETED.',
    stateBadge: 'In Transit to CBWTF'
  },
  {
    stepNumber: 17,
    title: 'Hospital Operational Dashboard Updates',
    pillar: 'DOCTOR_CLINICAL',
    agentInvolved: 'Hospital Central Coordinator',
    description: 'Hospital Command Center shows updated smart bin capacity, resolved alert, and verified manifest.',
    systemAction: 'Hospital KPIs synchronized: 36.8 kg total waste managed today.',
    stateBadge: 'Dashboard Synced'
  },
  {
    stepNumber: 18,
    title: 'System Switches to Offline Mode (Simulated Power/Cell Cut)',
    pillar: 'OFFLINE_2G_SYNC',
    agentInvolved: 'Offline Sync Engine',
    description: 'Rural cellular tower drops due to monsoon rain. System seamlessly falls back to local IndexedDB Dexie.',
    systemAction: 'Network state changed to OFFLINE. Offline banners activated across all portals.',
    stateBadge: 'Offline Active'
  },
  {
    stepNumber: 19,
    title: 'Emergency Patient Vitals & Waste Drop Recorded Locally',
    pillar: 'OFFLINE_2G_SYNC',
    agentInvolved: 'Offline Sync Engine',
    description: 'Nurse records Patient BP 142/90 and drops new sharps container while offline.',
    systemAction: 'Stored in local Dexie mutation queue with P0 Emergency priority. Zero data loss.',
    stateBadge: 'Saved in Local Queue'
  },
  {
    stepNumber: 20,
    title: '2G Minimal-Bandwidth Mode Activates',
    pillar: 'OFFLINE_2G_SYNC',
    agentInvolved: 'Priority Sync Engine',
    description: 'Weak 2G edge signal detected (12 kbps). Heavy image assets deferred; compressed binary payloads prioritized.',
    systemAction: 'Activated 2G compression engine. Payload reduced from 2.4 MB -> 4.8 KB.',
    stateBadge: '2G Low Bandwidth (4.8 KB)'
  },
  {
    stepNumber: 21,
    title: 'Priority Sync Sends P0/P1 Critical Data First',
    pillar: 'OFFLINE_2G_SYNC',
    agentInvolved: 'Priority Sync Engine',
    description: 'Sync order: P0 Emergency BP Alert -> P1 Waste Alert -> P2 Clinical Rx. Heavy PDF deferred.',
    systemAction: 'Transmitted P0 emergency & P1 waste batches over 2G socket in 340ms.',
    stateBadge: 'P0/P1 Synced First'
  },
  {
    stepNumber: 22,
    title: 'Ecosystem Fully Synchronized & Audited',
    pillar: 'A2A_AI',
    agentInvolved: 'Medora A2A Orchestrator',
    description: 'Full continuity achieved: Patient portal, doctor records, smart bins, and waste passports 100% synchronized.',
    systemAction: 'Audit log entry logged: "ALL 22 STEPS VALIDATED - PROTOTYPE VERIFIED".',
    stateBadge: 'Complete Continuity'
  }
];

export default function FullDemoScenarioPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState(2500);

  const { setOffline, toggle2GMode, isOffline, is2GMode } = useAppStore();
  const { simulateWasteDrop, simulateOverflow, syncBinNow } = useWasteStore();

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Auto-play effect
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= DEMO_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeedMs]);

  // Execute system side-effects per step
  useEffect(() => {
    if (currentStepIndex === 17) {
      setOffline(true);
    } else if (currentStepIndex === 19) {
      setOffline(false);
      if (!is2GMode) toggle2GMode();
    } else if (currentStepIndex === 21) {
      if (is2GMode) toggle2GMode();
      setOffline(false);
    }
  }, [currentStepIndex]);

  const getPillarColor = (pillar: DemoStep['pillar']) => {
    switch (pillar) {
      case 'PATIENT_HEALTH':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'A2A_AI':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'DOCTOR_CLINICAL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SMART_WASTE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'OFFLINE_2G_SYNC':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <MedoraGlobalHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 border border-teal-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Hackathon Judge Demonstration
              </span>
              <span className="bg-teal-500/20 text-teal-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-teal-500/30">
                22-Step Automated Simulation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Full Ecosystem Walkthrough (Rural Health + Smart Waste + A2A)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Witness the end-to-end connected intelligence of Medora: from rural patient report upload, AI doctor synthesis, and touchless smart bin segregation to autonomous robotic fleet dispatch, digital waste passport generation, and 2G priority synchronization.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-700 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Demo' : 'Run Full Demo'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Step Showcase Card */}
        <div className="bg-slate-900 border-2 border-teal-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                {currentStep.stepNumber}
              </span>
              <div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${getPillarColor(currentStep.pillar)}`}>
                  {currentStep.pillar.replace(/_/g, ' ')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-teal-300 text-xs font-mono font-bold px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-teal-400" />
                {currentStep.agentInvolved}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30">
                {currentStep.stateBadge}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clinical / Operational Event:
              </p>
              <p className="text-slate-200 text-base leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                {currentStep.description}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Reactive System Mutation & A2A State Change:
              </p>
              <div className="text-teal-300 font-mono text-xs leading-relaxed bg-teal-950/30 p-4 rounded-2xl border border-teal-800/40">
                {currentStep.systemAction}
              </div>
            </div>
          </div>

          {/* Step Progress Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              ← Previous Step
            </button>

            <span className="text-xs text-slate-400 font-bold">
              Step {currentStepIndex + 1} of {DEMO_STEPS.length}
            </span>

            <button
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              onClick={() => setCurrentStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 22-Step Timeline Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              Complete 22-Step Ecosystem Matrix
            </h3>
            <span className="text-xs text-slate-400">Click any step to inspect state directly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DEMO_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <div
                  key={step.stepNumber}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                    isCurrent
                      ? 'bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10'
                      : isPast
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-900 border-slate-800/80 text-slate-500 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent
                        ? 'bg-teal-400 text-slate-950'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isPast ? '✓' : step.stepNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPillarColor(step.pillar)}`}>
                      {step.pillar.split('_')[0]}
                    </span>
                  </div>

                  <h4 className={`font-bold text-xs line-clamp-1 ${isCurrent ? 'text-teal-300' : isPast ? 'text-slate-200' : 'text-slate-400'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
