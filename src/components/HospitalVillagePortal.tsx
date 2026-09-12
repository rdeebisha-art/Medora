import React, { useState } from 'react';
import { Building2, Activity, AlertTriangle, Bell, CheckCircle2, UserCheck, Send, Sparkles, Volume2, ShieldAlert, Users, MapPin, ArrowRight, Clock } from 'lucide-react';
import { LanguageCode, FamilyMember, Doctor, Hospital } from '../types';
import { voiceService } from '../services/voiceService';
import { PresentationReadinessSections } from './PresentationReadinessSections';

interface HospitalVillagePortalProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToAI: () => void;
  onNavigateToDoctorSummary: () => void;
}

interface VillageProfile {
  id: string;
  name: string;
  panchayat: string;
  population: number;
  vulnerableStats: {
    elderly: number;
    pregnant: number;
    childrenUnderFive: number;
    chronicPatients: number;
  };
  cleanWaterPercent: number;
  primaryASHA: string;
  ashaPhone: string;
  distanceToHospitalKm: number;
}

interface EarlyDetectionAlert {
  id: string;
  villageName: string;
  title: string;
  detectedBy: string;
  timeline: string;
  riskLevel: 'Immediate Warning' | 'Moderate Concern' | 'Watchlist';
  description: string;
  earlySignsDetected: string[];
  recommendedEarlyTreatment: string;
  actionStatus: 'Pending Doctor Review' | 'Notification Dispatched' | 'ASHA Dispatched';
}

export const HospitalVillagePortal: React.FC<HospitalVillagePortalProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToAI,
  onNavigateToDoctorSummary,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vil-1');
  const [alerts, setAlerts] = useState<EarlyDetectionAlert[]>([
    {
      id: 'alt-1',
      villageName: 'Rampur Village',
      title: 'Vector-Borne Dengue/Malaria Cluster Detected ( 2 )',
      detectedBy: 'Prototype AI risk-assessment workflow',
      timeline: '2 hours ago (Detected 48 hours before official hospital admission)',
      riskLevel: 'Immediate Warning',
      description: 'AI detected 4 patient reports presenting with sudden high fever (>102°F), retro-orbital pain, and borderline platelet decreases (1.4L) clustered in North Hamlet within 48 hours.',
      earlySignsDetected: ['Platelet dip from 2.2L to 1.4L', 'Retro-orbital headache complaints', 'Common water cooler breeding vector'],
      recommendedEarlyTreatment: 'Dispatch ASHA worker with paracetamol 650mg, ORS packets, and initiate village fogging. Advise against Aspirin/Brufen.',
      actionStatus: 'Pending Doctor Review',
    },
    {
      id: 'alt-2',
      villageName: 'Belur Village',
      title: 'Maternal Iron Deficiency Anemia Spike (  )',
      detectedBy: 'Prototype maternal care-gap analyzer',
      timeline: 'Yesterday',
      riskLevel: 'Moderate Concern',
      description: '3 pregnant women between 20-26 gestational weeks registered hemoglobin levels under 9.5 g/dL with missed IFA tablet adherence over the past 14 days.',
      earlySignsDetected: ['Hb drops < 9.5 g/dL', 'Missed ASHA IFA pickup', 'Reported fatigue in field work'],
      recommendedEarlyTreatment: 'Notify ANM Sunita to deliver fresh 30-day supply of red IFA tablets and schedule nutritional counselling at Anganwadi.',
      actionStatus: 'Notification Dispatched',
    },
    {
      id: 'alt-3',
      villageName: 'Shivajinagar Village',
      title: 'Pediatric Waterborne Diarrhea & Dehydration Warning',
      detectedBy: 'Prototype village water-health correlator',
      timeline: '3 days ago',
      riskLevel: 'Watchlist',
      description: 'Following monsoon runoff into the open well, 5 children under age 4 reported watery diarrhea within 36 hours.',
      earlySignsDetected: ['Loose watery stools x 4 episodes', 'Reduced skin turgor in toddlers', 'Contaminated well chlorination gap'],
      recommendedEarlyTreatment: 'Direct Panchayat water chlorinated bleaching; distribute ORS sachets and 14-day Zinc sulfate 20mg tablets to all affected households.',
      actionStatus: 'ASHA Dispatched',
    }
  ]);

  const [dispatchLog, setDispatchLog] = useState<string[]>([
    'Demo: Hospital-village workflow shown with sample data; no live telemetry connection.',
    'Demo: Sample family summaries are displayed for workflow illustration only.',
  ]);

  const villages: VillageProfile[] = [
    {
      id: 'vil-1',
      name: 'Rampur Village ()',
      panchayat: 'Rampur Gram Panchayat',
      population: 1250,
      vulnerableStats: { elderly: 48, pregnant: 14, childrenUnderFive: 38, chronicPatients: 76 },
      cleanWaterPercent: 78,
      primaryASHA: 'Sunita Devi (ANM/ASHA)',
      ashaPhone: '+91 94481 00223',
      distanceToHospitalKm: 8.5,
    },
    {
      id: 'vil-2',
      name: 'Belur Village ()',
      panchayat: 'Belur Gram Panchayat',
      population: 890,
      vulnerableStats: { elderly: 32, pregnant: 9, childrenUnderFive: 24, chronicPatients: 49 },
      cleanWaterPercent: 65,
      primaryASHA: 'Kavita Kumari (ASHA)',
      ashaPhone: '+91 94481 00445',
      distanceToHospitalKm: 14.2,
    },
    {
      id: 'vil-3',
      name: 'Shivajinagar Village ()',
      panchayat: 'Shivajinagar Gram Panchayat',
      population: 1620,
      vulnerableStats: { elderly: 62, pregnant: 18, childrenUnderFive: 52, chronicPatients: 104 },
      cleanWaterPercent: 84,
      primaryASHA: 'Meena Sharma (ASHA)',
      ashaPhone: '+91 94481 00778',
      distanceToHospitalKm: 4.8,
    },
  ];

  const activeVillage = villages.find(v => v.id === selectedVillageId) || villages[0];

  const handleDispatchDoctorAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, actionStatus: 'Notification Dispatched' };
      }
      return a;
    }));

    const alertItem = alerts.find(a => a.id === alertId);
    setDispatchLog(prev => [
      `🚨 [DISPATCHED] Doctor verified notification sent via SMS & Voice Call to ${alertItem?.villageName} ASHA Worker (${activeVillage.primaryASHA}) and affected patients to commence early treatment immediately.`,
      ...prev
    ]);
  };

  const readPortalVoice = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `Hospital Village Portal. Currently viewing ${activeVillage.name}, population ${activeVillage.population}. This prototype displays sample risk signals for professional review.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-400/20 border border-blue-300/30 text-blue-200 px-3 py-1 rounded-full text-xs font-bold">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>Hospital Health Network & Village Surveillance Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Hospital Portal & Village Health Registry
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              This prototype demonstrates how village health workflows could support authorized healthcare teams. It does not currently connect to government databases, live hospital systems, or real-time telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={readPortalVoice}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? 'Stop Voice' : '🔊 Listen in Native Language'}</span>
            </button>
            <button
              onClick={onNavigateToDoctorSummary}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <span>View Clinical Summaries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Village Selector Strip */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">Select Village Health Registry Profile:</h3>
          </div>
          <span className="text-xs font-bold text-amber-700">Prototype / Demonstration Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {villages.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVillageId(v.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedVillageId === v.id
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="font-black text-slate-900 text-sm block mb-1">{v.name}</span>
              <div className="space-y-0.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Population:</span>
                  <span className="font-bold text-slate-900">{v.population}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance to Hospital:</span>
                  <span className="font-bold text-slate-900">{v.distanceToHospitalKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Lead ASHA:</span>
                  <span className="font-bold text-blue-700">{v.primaryASHA}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Village Demographic Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Seniors (60+ yrs)</span>
          <span className="text-2xl font-black text-amber-600 block">{activeVillage.vulnerableStats.elderly}</span>
          <span className="text-[10px] text-slate-400">Regular BP & Sugar Monitoring</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pregnant Women</span>
          <span className="text-2xl font-black text-rose-600 block">{activeVillage.vulnerableStats.pregnant}</span>
          <span className="text-[10px] text-slate-400">ANC Trimester Tracking Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Children (&lt;5 yrs)</span>
          <span className="text-2xl font-black text-sky-600 block">{activeVillage.vulnerableStats.childrenUnderFive}</span>
          <span className="text-[10px] text-slate-400">Immunization Schedule Sync</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Clean Water Access</span>
          <span className="text-2xl font-black text-emerald-600 block">{activeVillage.cleanWaterPercent}%</span>
          <span className="text-[10px] text-slate-400">Waterborne Outbreak Watch</span>
        </div>
      </div>

      {/* AI EARLY OUTBREAK & DISEASE DETECTION SYSTEM (Detects before doctor sees) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-0.5 rounded-full text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>AI Risk Assessment Workflow (Prototype)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Early Risk Signals for Professional Review
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sample alerts illustrate how aggregated signals could support prioritization. They are not diagnoses, outbreak confirmations, or validated predictions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                alt.riskLevel === 'Immediate Warning'
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                  : alt.riskLevel === 'Moderate Concern'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        alt.riskLevel === 'Immediate Warning'
                          ? 'bg-rose-600 text-white'
                          : alt.riskLevel === 'Moderate Concern'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {alt.riskLevel}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{alt.villageName}</span>
                    <span className="text-xs text-slate-400">• {alt.timeline}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{alt.title}</h3>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-center ${
                    alt.actionStatus === 'Notification Dispatched'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : alt.actionStatus === 'ASHA Dispatched'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  }`}
                >
                  {alt.actionStatus}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{alt.description}</p>

              {/* Early signs */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">Early Clinical Signals Detected by AI:</span>
                <div className="flex flex-wrap gap-2">
                  {alt.earlySignsDetected.map((sign, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                      • {sign}
                    </span>
                  ))}
                </div>
              </div>

              {/* Immediate Treatment Protocol */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Recommended Immediate Action & Early Treatment:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{alt.recommendedEarlyTreatment}</p>
              </div>

              {/* Action Button for Doctor */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-500">
                  Recommended Next Step: Professional review and authorized local follow-up.
                </span>
                <button
                  onClick={() => handleDispatchDoctorAlert(alt.id)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Record Demo Follow-Up</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital-Village Prototype Workflow Log */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-black text-white">Prototype Workflow Log</h3>
        </div>
        <div className="space-y-2 font-mono text-xs">
          {dispatchLog.map((log, idx) => (
            <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>

      <PresentationReadinessSections />
    </div>
  );
};
