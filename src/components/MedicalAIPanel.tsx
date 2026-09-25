import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import { medicalService } from '../services/ai/medicalService';
import { StructuredMedicalResponse } from '../services/ai/types';
import { OfflineDiagnosticInterface } from './OfflineDiagnosticInterface';
import {
  Stethoscope,
  FileSearch,
  Activity,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedicalAIPanel: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const [input, setInput] = useState('');
  const [duration, setDuration] = useState('');
  const [temperature, setTemperature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<StructuredMedicalResponse | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      db.medicalRecords.where('patientId').equals(currentUser.id).toArray().then(setPatientRecords);
    }
  }, [currentUser]);

  const handleRunMedicalAnalysis = async (customPrompt?: string) => {
    const textToAnalyze = (customPrompt || input).trim();
    if (!textToAnalyze || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const response = await medicalService.analyzeMedicalRequest({
        patientInput: textToAnalyze,
        patientId: currentUser?.id,
        duration: duration.trim() || undefined,
        temperature: temperature.trim() || undefined,
        language,
      });

      setCurrentResponse(response);

      // Save turn to Dexie DB as clinical AI interaction
      if (currentUser?.id) {
        await db.aiConversations.add({
          patientId: currentUser.id,
          messages: [
            { role: 'user', content: textToAnalyze, timestamp: new Date().toISOString() },
            {
              role: 'assistant',
              content: response.summaryText || response.recommendedNextStep,
              agentType: 'medical_ai_reasoning',
              timestamp: new Date().toISOString(),
            },
          ],
          agentType: 'clinical_reasoning',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setStatusMessage('Medical analysis error: ' + (err?.message || 'Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const isNetworkOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col space-y-3 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-3.5 rounded-xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-2xs">
            🩺
          </div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>Medora Medical AI</span>
              <span className="text-[10px] bg-purple-500/40 text-purple-100 px-2 py-0.5 rounded-full font-bold">
                Offline-First Clinical Engine
              </span>
            </div>
            <p className="text-[11px] text-purple-100">
              Deterministic symptom reasoning, emergency triage &amp; differential assessment.
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-[10px] bg-purple-950/60 border border-purple-300/30 px-2 py-0.5 rounded-md font-mono text-purple-200">
            {isNetworkOnline ? 'Hybrid Offline + Gemini' : '100% Offline Mode'}
          </span>
          <span className="text-[9px] text-purple-200 flex items-center gap-1">
            {isNetworkOnline ? <Wifi className="w-2.5 h-2.5 text-emerald-400" /> : <WifiOff className="w-2.5 h-2.5 text-amber-300" />}
            <span>{isNetworkOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>
      </div>

      {/* Structured Clinical Input Form */}
      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 space-y-2.5">
        <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-700" />
          <span>Clinical Symptom &amp; Measurement Input</span>
        </div>

        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Describe clinical symptoms (e.g. 'I have had fever for 3 days, cough, and sore throat with temperature 102°F')..."
            className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 days, 12 hours"
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Temperature</label>
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 102°F or 38.8°C"
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Preserves exact medical numbers &amp; units</span>
          </div>

          <button
            onClick={() => handleRunMedicalAnalysis()}
            disabled={!input.trim() || isProcessing}
            className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run Medical Reasoning</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-2 rounded-xl">
          {statusMessage}
        </div>
      )}

      {/* Structured Diagnostic Assessment Output Card */}
      {currentResponse && (
        <OfflineDiagnosticInterface
          response={currentResponse}
          onClear={() => setCurrentResponse(null)}
        />
      )}
    </div>
  );
};
