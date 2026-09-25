import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import { medicalAIService, MedicalAIResponse } from '../services/medicalAI';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedicalAIPanel: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const [input, setInput] = useState('');
  const [duration, setDuration] = useState('');
  const [temperature, setTemperature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<MedicalAIResponse | null>(null);
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
      const response = await medicalAIService.analyzeMedicalRequest({
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
              content: response.summaryText,
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
                Clinical Reasoning &amp; Gemini
              </span>
            </div>
            <p className="text-[11px] text-purple-100">
              Symptom reasoning, differential diagnosis, red flag prioritization &amp; Doctor Summary.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] bg-purple-950/60 border border-purple-300/30 px-2 py-0.5 rounded-md font-mono text-purple-200">
            Gemini 3.8 Flash + Rules
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
        <div className="border border-purple-200 rounded-xl p-3.5 bg-white space-y-3 shadow-xs">
          {/* Emergency Alert Banner if detected */}
          {currentResponse.requiresUrgentCare && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 flex items-start gap-2.5 text-red-900 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-xs uppercase tracking-wide">Emergency Warning Signs Detected</div>
                <div className="text-xs font-medium mt-0.5">
                  {currentResponse.redFlags.join('; ') || 'Immediate medical attention required.'}
                </div>
                <div className="mt-1.5">
                  <Link
                    to="/emergency"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                  >
                    Open Emergency Hotline (108) →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Assessment Section */}
          <div>
            <div className="flex items-center justify-between border-b pb-1.5 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Diagnostic Assessment
              </span>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                {currentResponse.confidenceStatus}
              </span>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-purple-900">Possible diagnosis / Most likely condition:</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {currentResponse.diagnosticAssessment.mostLikelyCondition}
              </div>
            </div>
          </div>

          {/* Differential Diagnoses */}
          {currentResponse.diagnosticAssessment.differentialDiagnoses.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1.5">Differential Diagnoses:</div>
              <div className="space-y-2">
                {currentResponse.diagnosticAssessment.differentialDiagnoses.map((diff, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                    <div className="font-extrabold text-slate-900 flex items-center justify-between">
                      <span>• {diff.condition}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {diff.confidence === null ? 'Clinical review required' : `${diff.confidence}%`}
                      </span>
                    </div>
                    {diff.supportingEvidence.length > 0 && (
                      <div className="text-[11px] text-emerald-800 mt-1">
                        <span className="font-semibold">Supporting: </span>
                        {diff.supportingEvidence.join('; ')}
                      </div>
                    )}
                    {diff.contradictingEvidence.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold">Contradicting / Distinguishing: </span>
                        {diff.contradictingEvidence.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Information & Red Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5">
              <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Missing Clinical Information</span>
              </div>
              {currentResponse.missingInformation.length > 0 ? (
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-950">
                  {currentResponse.missingInformation.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-[11px] text-slate-500">None detected</div>
              )}
            </div>

            <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-2.5">
              <div className="font-bold text-teal-900 flex items-center gap-1 mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
                <span>Recommended Next Step</span>
              </div>
              <p className="text-[11px] text-teal-950 font-medium">
                {currentResponse.recommendedNextStep}
              </p>
            </div>
          </div>

          {/* Doctor Confirmation Disclaimer */}
          <div className="bg-slate-100 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              🔒 <strong>AI decision support:</strong> AI-generated assessment requires healthcare professional review.
            </span>
            <Link
              to="/doctor-summary"
              className="text-purple-700 font-bold hover:underline shrink-0 ml-2"
            >
              Export to Doctor Summary →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
