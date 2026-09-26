import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, MedicalRecord, HealthTest } from '../db/db';
import { medicalService } from '../services/ai/medicalService';
import { StructuredMedicalResponse } from '../services/ai/types';
import { OfflineDiagnosticInterface } from './OfflineDiagnosticInterface';
import {
  Stethoscope,
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
  ArrowLeft,
  Wifi,
  WifiOff,
  User,
  Heart,
  Droplets,
  Thermometer,
  ShieldAlert,
  RotateCcw,
  Save,
  Plus,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MedicalAIPanelProps {
  onReturnToVoiceAI?: () => void;
  initialQuery?: string;
}

const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Stomach pain',
  'Chest pain',
  'Breathing difficulty',
  'Vomiting',
  'Diarrhea',
  'Dizziness',
  'Bleeding',
  'Allergy',
  'Fatigue',
  'Body ache',
  'Sore throat',
  'High BP',
  'High Blood Sugar',
];

export const MedicalAIPanel: React.FC<MedicalAIPanelProps> = ({
  onReturnToVoiceAI,
  initialQuery = '',
}) => {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(currentUser?.id || 1);
  const [patient, setPatient] = useState<Patient | null>(null);

  // Form Fields as specified in Requirement 23
  const [chiefComplaint, setChiefComplaint] = useState(initialQuery || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('3 days');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');

  // Exact clinical measurements (Requirement 26)
  const [temperature, setTemperature] = useState('102°F');
  const [bp, setBp] = useState('120/80');
  const [bloodSugar, setBloodSugar] = useState('180 mg/dL');
  const [spo2, setSpo2] = useState('94%');
  const [weight, setWeight] = useState('55 kg');

  // Medical context
  const [medicalHistory, setMedicalHistory] = useState('None known');
  const [currentMedicines, setCurrentMedicines] = useState('Paracetamol 500mg');
  const [allergies, setAllergies] = useState('None reported');
  const [pregnancyStatus, setPregnancyStatus] = useState<string>('Not pregnant');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Attachments
  const [attachedReportName, setAttachedReportName] = useState<string>('');
  const [attachedImageName, setAttachedImageName] = useState<string>('');

  // Processing & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<StructuredMedicalResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  // Load patients list and selected patient profile
  useEffect(() => {
    db.patients.toArray().then((list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        const defaultId = currentUser?.role === 'patient' && currentUser.id ? currentUser.id : list[0].id || 1;
        setSelectedPatientId(defaultId);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (selectedPatientId) {
      db.patients.get(selectedPatientId).then((p) => {
        if (p) {
          setPatient(p);
          if (p.conditions && p.conditions.length > 0) {
            setMedicalHistory(p.conditions.join(', '));
          }
          if (p.allergies && p.allergies.length > 0) {
            setAllergies(p.allergies.join(', '));
          }
          if (p.isPregnant) {
            setPregnancyStatus(`Pregnant (${p.pregnancyWeeks || 28} weeks)`);
          }
        }
      });
    }
  }, [selectedPatientId]);

  // Check emergency symptoms immediately
  useEffect(() => {
    const combined = `${chiefComplaint} ${selectedSymptoms.join(' ')} ${additionalNotes}`.toLowerCase();
    const hasEmergency =
      /\b(chest pain|cannot breathe|can't breathe|breathing difficulty|severe bleeding|unconscious|fainted|loss of consciousness|seizure|stroke)\b/i.test(
        combined
      ) ||
      selectedSymptoms.includes('Chest pain') ||
      selectedSymptoms.includes('Breathing difficulty') ||
      severity === 'Critical';

    if (hasEmergency) {
      setEmergencyAlert(
        '⚠️ CRITICAL EMERGENCY SYMPTOMS DETECTED: Symptoms like chest pain, severe breathing difficulty, or critical severity require immediate emergency medical care. Please contact emergency services (108) or reach the nearest hospital immediately.'
      );
    } else {
      setEmergencyAlert(null);
    }
  }, [chiefComplaint, selectedSymptoms, additionalNotes, severity]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCustomSymptom = () => {
    const s = customSymptom.trim();
    if (s && !selectedSymptoms.includes(s)) {
      setSelectedSymptoms((prev) => [...prev, s]);
      setCustomSymptom('');
    }
  };

  const handleClear = () => {
    setChiefComplaint('');
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setDuration('');
    setSeverity('Mild');
    setTemperature('');
    setBp('');
    setBloodSugar('');
    setSpo2('');
    setWeight('');
    setAdditionalNotes('');
    setAttachedReportName('');
    setAttachedImageName('');
    setCurrentResponse(null);
    setStatusMessage(null);
    setSaveSuccessMessage(null);
    setEmergencyAlert(null);
  };

  const handleAnalyze = async () => {
    const combinedSymptomText = [
      chiefComplaint.trim(),
      selectedSymptoms.length > 0 ? `Symptoms: ${selectedSymptoms.join(', ')}` : '',
      duration ? `Duration: ${duration}` : '',
      severity ? `Severity: ${severity}` : '',
      temperature ? `Temperature: ${temperature}` : '',
      bp ? `BP: ${bp}` : '',
      bloodSugar ? `Blood sugar: ${bloodSugar}` : '',
      spo2 ? `SpO2: ${spo2}` : '',
      weight ? `Weight: ${weight}` : '',
      medicalHistory !== 'None known' ? `Medical history: ${medicalHistory}` : '',
      currentMedicines ? `Current medications: ${currentMedicines}` : '',
      allergies !== 'None reported' ? `Allergies: ${allergies}` : '',
      pregnancyStatus !== 'Not pregnant' ? `Pregnancy: ${pregnancyStatus}` : '',
      attachedReportName ? `Attached Report: ${attachedReportName}` : '',
      attachedImageName ? `Attached Image: ${attachedImageName}` : '',
      additionalNotes.trim() ? `Notes: ${additionalNotes.trim()}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    if (!combinedSymptomText.trim()) {
      setStatusMessage('Please enter symptoms or a chief complaint to analyze.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    setSaveSuccessMessage(null);

    try {
      const response = await medicalService.analyzeMedicalRequest({
        patientInput: combinedSymptomText,
        patientId: selectedPatientId,
        duration: duration.trim() || undefined,
        temperature: temperature.trim() || undefined,
        language: patient?.language || language || 'en',
      });

      setCurrentResponse(response);

      // Save turn to Dexie DB as clinical AI interaction
      if (selectedPatientId) {
        await db.aiConversations.add({
          patientId: selectedPatientId,
          messages: [
            { role: 'user', content: combinedSymptomText, timestamp: new Date().toISOString() },
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
      setStatusMessage('Medical reasoning error: ' + (err?.message || 'Please retry.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToMedicalRecord = async () => {
    if (!selectedPatientId) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Build structured record
      const recordEntry: Omit<MedicalRecord, 'id'> = {
        patientId: selectedPatientId,
        type: 'consultation',
        date: todayStr,
        data: {
          title: chiefComplaint || (selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'Clinical AI Assessment'),
          chiefComplaint: chiefComplaint || selectedSymptoms.join(', '),
          symptoms: selectedSymptoms,
          duration,
          severity,
          vitals: {
            temperature,
            bloodPressure: bp,
            bloodSugar,
            spo2,
            weight,
          },
          measurements: [
            temperature ? `Temp: ${temperature}` : '',
            bp ? `BP: ${bp}` : '',
            bloodSugar ? `Sugar: ${bloodSugar}` : '',
            spo2 ? `SpO2: ${spo2}` : '',
            weight ? `Weight: ${weight}` : '',
          ].filter(Boolean).join(', '),
          medicalHistory,
          medications: currentMedicines,
          allergies,
          pregnancyStatus,
          attachedReport: attachedReportName || undefined,
          attachedImage: attachedImageName || undefined,
          aiFindings:
            (typeof currentResponse?.diagnosticAssessment?.mostLikelyCondition === 'string'
              ? currentResponse.diagnosticAssessment.mostLikelyCondition
              : (currentResponse?.diagnosticAssessment?.mostLikelyCondition as any)?.conditionName) ||
            currentResponse?.possibleConditions?.[0]?.condition ||
            'Assessment Completed',
          differentials:
            currentResponse?.diagnosticAssessment?.differentialDiagnoses?.map((d: any) => d.condition || d.conditionName || String(d)) ||
            currentResponse?.possibleConditions?.map((p) => p.condition) ||
            [],
          recommendedNextStep: currentResponse?.recommendedNextStep || 'Review with healthcare professional',
          requiresDoctorReview: true,
          status: 'AI_ASSESSMENT_PENDING_DOCTOR_CONFIRMATION',
          recordedAt: `${todayStr} ${nowStr}`,
        },
        notes: `Medora Medical AI Clinical Input: ${chiefComplaint || selectedSymptoms.join(', ')}. Assessment: ${
          (typeof currentResponse?.diagnosticAssessment?.mostLikelyCondition === 'string'
            ? currentResponse.diagnosticAssessment.mostLikelyCondition
            : (currentResponse?.diagnosticAssessment?.mostLikelyCondition as any)?.conditionName) ||
          currentResponse?.possibleConditions?.[0]?.condition ||
          'Clinical symptoms evaluated'
        }. Note: All automated evaluations require clinical verification by a registered clinician.`,
      };

      await db.medicalRecords.add(recordEntry as any);

      // Also record vitals into healthTests table if entered so they flow to charts
      if (bp && bp.includes('/')) {
        await db.healthTests.add({
          patientId: selectedPatientId,
          type: 'blood_pressure',
          value: bp,
          unit: 'mmHg',
          date: todayStr,
          notes: 'Entered via Medical AI evaluation',
        });
      }

      if (temperature) {
        await db.healthTests.add({
          patientId: selectedPatientId,
          type: 'temperature',
          value: temperature.replace(/[^\d.]/g, '') || temperature,
          unit: '°F',
          date: todayStr,
          notes: 'Entered via Medical AI evaluation',
        });
      }

      if (bloodSugar) {
        await db.healthTests.add({
          patientId: selectedPatientId,
          type: 'blood_sugar',
          value: bloodSugar.replace(/[^\d.]/g, '') || bloodSugar,
          unit: 'mg/dL',
          date: todayStr,
          notes: 'Entered via Medical AI evaluation',
        });
      }

      if (spo2) {
        await db.healthTests.add({
          patientId: selectedPatientId,
          type: 'spo2',
          value: spo2.replace(/[^\d.]/g, '') || spo2,
          unit: '%',
          date: todayStr,
          notes: 'Entered via Medical AI evaluation',
        });
      }

      if (weight) {
        await db.healthTests.add({
          patientId: selectedPatientId,
          type: 'weight',
          value: weight.replace(/[^\d.]/g, '') || weight,
          unit: 'kg',
          date: todayStr,
          notes: 'Entered via Medical AI evaluation',
        });
      }

      setSaveSuccessMessage(
        '✓ Saved to Medical Records! This evaluation is now available in Medical Records, Health Charts, and Doctor Clinical Summary.'
      );
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage('Error saving record: ' + (err?.message || 'Please retry.'));
    }
  };

  const isNetworkOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-5">
      {/* Return to Voice AI / Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        {onReturnToVoiceAI ? (
          <button
            onClick={onReturnToVoiceAI}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Return to Voice AI</span>
          </button>
        ) : (
          <Link
            to="/ai?tab=voice"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Return to Voice AI</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-purple-100 border border-purple-200 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
            Clinical Decision Support
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {isNetworkOnline ? 'Hybrid Offline + Cloud' : '100% Offline Engine'}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
            🩺
          </div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>Medora Medical AI</span>
              <span className="text-[10px] bg-purple-400/30 text-purple-200 px-2 py-0.5 rounded-md font-bold">
                Clinical Workflow
              </span>
            </div>
            <p className="text-[11px] text-purple-200 mt-0.5">
              Structured clinical evaluation, vital monitoring, differential reasoning &amp; safety checks.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-[9px] text-purple-200 flex items-center gap-1 font-mono">
            {isNetworkOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-300" />}
            <span>{isNetworkOnline ? 'Cloud Synced' : 'Local Rules'}</span>
          </span>
        </div>
      </div>

      {/* Emergency Alert Banner (Checked First!) */}
      {emergencyAlert && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-red-900 space-y-2 animate-pulse">
          <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>EMERGENCY ALERT: Immediate Medical Care Required</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed">{emergencyAlert}</p>
          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/emergency"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <span>Call Emergency Ambulance (108)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Success Feedback Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 p-1 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Status Warning / Errors */}
      {statusMessage && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 rounded-2xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-amber-700 hover:text-amber-900 p-1 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Comprehensive Medical Input Form (Requirement 23) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Section 1: Patient Profile Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Patient Profile</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id ? `P00${p.id}` : 'Patient'}) · Age {p.age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Age &amp; Sex</label>
            <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium">
              {patient ? `${patient.age} yrs · ${patient.gender.toUpperCase()}` : '42 yrs · FEMALE'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Patient Language</label>
            <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium uppercase font-mono">
              {patient?.language || language || 'ta'} ({patient?.language === 'ta' ? 'Tamil' : patient?.language === 'hi' ? 'Hindi' : patient?.language === 'te' ? 'Telugu' : 'English'})
            </div>
          </div>
        </div>

        {/* Section 2: Chief Complaint & Symptoms */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            Chief Complaint <span className="text-red-500">*</span>
          </label>
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            rows={2}
            placeholder="Primary reason for evaluation (e.g. 'Patient has fever for 3 days with cough, throat irritation, and headache')..."
            className="w-full bg-white border border-purple-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Quick Symptoms Multi-Select */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Select Recognized Symptoms
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              const isCrit = sym === 'Chest pain' || sym === 'Breathing difficulty' || sym === 'Bleeding';
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    isSelected
                      ? isCrit
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {isSelected && '✓ '}
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Add custom symptom */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="Add other symptom (e.g. skin rash, chills)..."
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSymptom();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomSymptom}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded-xl font-bold"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Section 3: Duration & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 days, 12 hours, 1 week"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="Mild">Mild (Tolerable, normal activity)</option>
              <option value="Moderate">Moderate (Interferes with tasks)</option>
              <option value="Severe">Severe (Incapacitating, significant distress)</option>
              <option value="Critical">Critical (Immediate emergency danger)</option>
            </select>
          </div>
        </div>

        {/* Section 4: Exact Clinical Measurements / Vitals */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-700" />
              <span>Exact Clinical Measurements &amp; Vitals</span>
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Exact numeric preservation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Temperature</span>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="102°F"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Blood Pressure</span>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Blood Sugar</span>
              <input
                type="text"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="180 mg/dL"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Oxygen SpO2</span>
              <input
                type="text"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="94%"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Weight</span>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="55 kg"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Medical History, Medicines & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Medical History</label>
            <input
              type="text"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Type 2 Diabetes, Hypertension"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Medicines</label>
            <input
              type="text"
              value={currentMedicines}
              onChange={(e) => setCurrentMedicines(e.target.value)}
              placeholder="e.g. Paracetamol 500mg, Metformin"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Known Allergies</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Section 6: Pregnancy Status & Additional Clinical Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Pregnancy Status</label>
            <select
              value={pregnancyStatus}
              onChange={(e) => setPregnancyStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
            >
              <option value="Not pregnant">Not pregnant / Not applicable</option>
              <option value="First trimester (1-12 weeks)">First trimester (1–12 weeks)</option>
              <option value="Second trimester (13-27 weeks)">Second trimester (13–27 weeks)</option>
              <option value="Third trimester (28-40 weeks)">Third trimester (28–40 weeks)</option>
              <option value="Postpartum (Lactating)">Postpartum (Lactating / New Mother)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Additional Clinical Notes</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any other clinical context, previous surgeries, or observations..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Section 7: Reports & Images Attachment Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
              <span>Attach Lab / Diagnostic Report</span>
            </label>
            <input
              type="text"
              value={attachedReportName}
              onChange={(e) => setAttachedReportName(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC) - 01 Sep"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Attach Medical Image / X-Ray</span>
            </label>
            <input
              type="text"
              value={attachedImageName}
              onChange={(e) => setAttachedImageName(e.target.value)}
              placeholder="e.g. Chest X-Ray PA View - 20 Jul"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* 3 Explicit Action Buttons: [Analyze] [Clear] [Save to Medical Record] */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToMedicalRecord}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Medical Record</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Analyze</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Clinical Reasoning Output Card */}
      {currentResponse && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Clinical Assessment &amp; Reasoning Results
            </h4>
            <button
              type="button"
              onClick={handleSaveToMedicalRecord}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              <span>Save this assessment to patient record</span>
            </button>
          </div>

          <OfflineDiagnosticInterface
            response={currentResponse}
            onClear={() => setCurrentResponse(null)}
          />
        </div>
      )}
    </div>
  );
};
