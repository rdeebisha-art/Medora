import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { VoiceAIPanel } from '../components/VoiceAIPanel';
import { MedicalAIPanel } from '../components/MedicalAIPanel';
import { A2AWorkflow } from '../components/A2AWorkflow';
import { MedicalAIErrorBoundary } from '../components/MedicalAIErrorBoundary';
import { LanguageCode } from '../types';
import { Stethoscope, Mic, ShieldAlert, FileText, Bot } from 'lucide-react';

export default function AiAssistantPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [activeSystem, setActiveSystem] = useState<'medical' | 'voice' | 'a2a'>('medical');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'medical' || location.pathname === '/medical-ai') {
      setActiveSystem('medical');
    } else if (tab === 'voice') {
      setActiveSystem('voice');
    } else if (tab === 'a2a') {
      setActiveSystem('a2a');
    }
  }, [searchParams, location.pathname]);

  const handleSelectTab = (tab: 'medical' | 'voice' | 'a2a') => {
    setActiveSystem(tab);
    setSearchParams({ tab });
  };

  const currentLang = (currentUser?.language as LanguageCode) || 'en';

  return (
    <Layout>
      <div className="flex flex-col max-w-3xl mx-auto px-3 py-3 space-y-3">
        {/* Banner with system distinction */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-teal-900 text-white p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {activeSystem === 'medical' ? '🩺' : activeSystem === 'voice' ? '🗣️' : '🤖'}
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-2">
                <span>Medora Multi-Agent &amp; AI Architecture</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {activeSystem === 'medical'
                    ? 'Clinical Reasoning'
                    : activeSystem === 'voice'
                    ? 'Voice Navigation'
                    : 'Specialist Simulation'}
                </span>
              </div>
              <p className="text-[11px] text-purple-100 mt-0.5">
                {activeSystem === 'medical'
                  ? 'Medora Medical AI: Symptom reasoning, differential diagnosis & doctor support.'
                  : activeSystem === 'voice'
                  ? 'Medora Voice AI: Natural conversation, application guidance & accessibility.'
                  : 'A2A Simulation: Multi-agent collaborative consultation across 5 specialist doctors.'}
              </p>
            </div>
          </div>

          <DemoDataBadge />
        </div>

        {/* Primary Toggle for the AI Systems */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => handleSelectTab('medical')}
            className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSystem === 'medical'
                ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-purple-200 shrink-0" />
            <span className="truncate">🩺 Medical AI</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('voice')}
            className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSystem === 'voice'
                ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-300'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Mic className="w-4 h-4 text-teal-200 shrink-0" />
            <span className="truncate">🗣️ Voice AI</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('a2a')}
            className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSystem === 'a2a'
                ? 'bg-indigo-700 text-white shadow-md ring-2 ring-indigo-300'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-200 shrink-0" />
            <span className="truncate">🤖 A2A Sim</span>
          </button>
        </div>

        {/* System Active View */}
        {activeSystem === 'medical' ? (
          <MedicalAIErrorBoundary onBack={() => handleSelectTab('voice')}>
            <MedicalAIPanel onReturnToVoiceAI={() => handleSelectTab('voice')} />
          </MedicalAIErrorBoundary>
        ) : activeSystem === 'voice' ? (
          <VoiceAIPanel onSwitchToMedicalAI={() => handleSelectTab('medical')} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
            <A2AWorkflow currentLang={currentLang} />
          </div>
        )}

        {/* Quick Diagnostic / Summary Links */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
          <Link
            to="/doctor-summary"
            className="text-purple-700 font-bold hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Doctor Clinical Summary Page</span>
          </Link>
          <Link
            to="/emergency"
            className="text-red-600 font-bold hover:underline flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Services (108)</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
