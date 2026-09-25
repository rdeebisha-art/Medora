import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredMedicalResponse } from '../services/ai/types';
import { validateMedicalSchema, MedicalSchemaValidationResult } from '../services/ai/medicalSchemaValidation';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Activity,
  PhoneCall,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Thermometer,
  Pill,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfflineDiagnosticInterfaceProps {
  response: StructuredMedicalResponse | null;
  onClear?: () => void;
  className?: string;
  showRawJsonToggle?: boolean;
}

export const OfflineDiagnosticInterface: React.FC<OfflineDiagnosticInterfaceProps> = ({
  response,
  onClear,
  className = '',
  showRawJsonToggle = true,
}) => {
  const { t } = useTranslation();
  const [expandedConditionIndex, setExpandedConditionIndex] = useState<number | null>(0);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!response) {
    return null;
  }

  // Schema Validation Check
  const validation: MedicalSchemaValidationResult = validateMedicalSchema(response);

  // If the schema is invalid, display a safety fallback warning
  if (!validation.isValid) {
    return (
      <div className={`p-4 bg-amber-50 border border-amber-300 rounded-xl ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-amber-900">
              Schema Validation Guard Notice
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              The diagnostic response received did not meet Medora's strict JSON schema rules.
              For clinical safety, only verified outputs are rendered.
            </p>
            <ul className="mt-2 text-xs list-disc list-inside text-amber-800 space-y-0.5 font-mono">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const isEmergency = Boolean(response.emergencyDetected || response.requiresUrgentCare);
  const isInsufficient = response.confidenceStatus === 'INSUFFICIENT_INFORMATION';

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isEmergency
          ? 'bg-rose-50/60 border-rose-200'
          : 'bg-white border-slate-200'
      } ${className}`}
      data-testid="offline-diagnostic-interface"
    >
      {/* 1. TOP HEADER & METADATA BANNER */}
      <div
        className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isEmergency
            ? 'bg-rose-100/70 border-rose-200 text-rose-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isEmergency ? (
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">
                {isEmergency
                  ? 'High-Priority Emergency Alert'
                  : isInsufficient
                  ? 'More Clinical Information Needed'
                  : 'Diagnostic Clinical Evaluation'}
              </h3>
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                  response.mode === 'OFFLINE'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : response.mode === 'ONLINE_FALLBACK'
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-sky-100 border-sky-300 text-sky-800'
                }`}
              >
                {response.mode === 'OFFLINE'
                  ? '100% Offline Engine'
                  : response.mode === 'ONLINE_FALLBACK'
                  ? 'Offline Fallback'
                  : 'Online'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Source: <span className="font-mono text-slate-700">{response.source}</span>
            </p>
          </div>
        </div>

        {/* Action badges / Doctor requirement */}
        <div className="flex items-center gap-2">
          {response.requiresDoctorReview && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Doctor Review Mandatory</span>
            </div>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-200/50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 2. EMERGENCY RED FLAGS BANNER (PRIORITY 1) */}
        {isEmergency && (
          <div
            className="p-4 rounded-xl bg-rose-600 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            role="alert"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide uppercase text-rose-100">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Immediate Medical Emergency Detected</span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed max-w-xl font-medium">
                {response.recommendedNextStep ||
                  'Dial 108 immediately or proceed directly to the nearest hospital casualty emergency room.'}
              </p>
              {response.redFlags.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 text-white bg-rose-700/60 p-2.5 rounded-lg border border-rose-500/50">
                  {response.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-semibold">
                      <span className="text-rose-200 mt-0.5">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="tel:108"
                className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 108 Ambulance</span>
              </a>
              <Link
                to="/emergency-map"
                className="px-3.5 py-2.5 bg-rose-700/80 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Nearest ER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 3. CHIEF COMPLAINT & SYMPTOM SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Chief Complaint
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
              {response.chiefComplaint || 'Clinical evaluation'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Reported Symptoms
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {response.symptoms.length > 0 ? (
                response.symptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-teal-50 border border-teal-200 text-teal-800 font-semibold px-2 py-0.5 rounded-md"
                  >
                    {sym}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Duration & Severity
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {response.duration || 'Not recorded'}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  response.severity.toLowerCase().includes('severe')
                    ? 'bg-rose-100 text-rose-800'
                    : response.severity.toLowerCase().includes('moderate')
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {response.severity}
              </span>
            </div>
          </div>
        </div>

        {/* 4. CLINICAL MEASUREMENTS (IF RECORDED) */}
        {response.measurements.length > 0 && (
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 shrink-0">
              <Thermometer className="w-4 h-4 text-sky-700" />
              <span>Preserved Measurements:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {response.measurements.map((meas, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2.5 py-1 bg-white border border-sky-200 text-sky-900 rounded-lg shadow-2xs font-mono"
                >
                  {meas}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5. POTENTIAL CONDITIONS & DIFFERENTIAL DIAGNOSES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Potential Differential Diagnoses ({response.possibleConditions.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              Click condition to review reasoning & evidence
            </span>
          </div>

          {response.possibleConditions.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
              <p className="text-xs text-slate-500">
                {isInsufficient
                  ? 'No specific condition could be differentiated with the reported information.'
                  : 'No immediate pattern match in local clinical database. Direct clinician examination advised.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {response.possibleConditions.map((cond, idx) => {
                const isExpanded = expandedConditionIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl transition-all duration-150 overflow-hidden ${
                      isExpanded
                        ? 'border-teal-300 bg-teal-50/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedConditionIndex(isExpanded ? null : idx)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="text-sm font-bold text-slate-800 tracking-tight">
                            {cond.condition}
                          </span>
                          {idx === 0 && (
                            <span className="ml-2 text-[10px] uppercase font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                              Most Likely
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Expanded Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs space-y-3">
                        {cond.reasoning && (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Clinical Reasoning
                            </span>
                            <p className="text-slate-700 leading-relaxed font-medium">
                              {cond.reasoning}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Supporting Evidence */}
                          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Supporting Findings
                            </span>
                            <ul className="space-y-1 text-emerald-950 font-medium">
                              {cond.supportingEvidence.length > 0 ? (
                                cond.supportingEvidence.map((ev, eIdx) => (
                                  <li key={eIdx} className="flex items-start gap-1">
                                    <span className="text-emerald-500">•</span>
                                    <span>{ev}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400 italic">None noted</li>
                              )}
                            </ul>
                          </div>

                          {/* Contradicting Evidence */}
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <HelpCircle className="w-3 h-3 text-amber-600" />
                              Differentiating / Contradicting
                            </span>
                            <ul className="space-y-1 text-amber-950 font-medium">
                              {cond.contradictingEvidence.length > 0 ? (
                                cond.contradictingEvidence.map((ev, eIdx) => (
                                  <li key={eIdx} className="flex items-start gap-1">
                                    <span className="text-amber-500">•</span>
                                    <span>{ev}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400 italic">None noted</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Missing Information Required to Confirm */}
                        {Array.isArray(cond.missingInformation) && cond.missingInformation.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Clinical Information Needed to Confirm
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cond.missingInformation.map((info, iIdx) => (
                                <span
                                  key={iIdx}
                                  className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                                >
                                  {info}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. RECOMMENDED NEXT STEPS */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Recommended Clinical Next Steps
            </h4>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {response.recommendedNextStep ||
              'Present this summary to a registered medical practitioner at your local PHC or clinic.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <span>Consult PHC Doctor</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            >
              <span>Find Nearby Clinic</span>
            </Link>
          </div>
        </div>

        {/* 7. RAW JSON TOGGLE (DEBUG / SCHEMA AUDITING) */}
        {showRawJsonToggle && (
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="self-start text-[11px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Structured Medical JSON' : 'Inspect Structured Medical JSON'}</span>
            </button>

            {showRawJson && (
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineDiagnosticInterface;
