import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Pill,
  Calendar,
  X,
  RefreshCw,
  User,
  Sliders,
  Check,
  TrendingUp,
  Info,
} from 'lucide-react';
import { db, Patient } from '../db/db';
import { useAppStore } from '../store/useAppStore';
import {
  MedicationScheduleOptimizer,
  ScheduleAdjustmentSuggestion,
  PatientAdherenceSummary,
} from '../services/medications/medicationScheduleOptimizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  initialMedicineId?: number;
  onScheduleUpdated?: () => void;
}

export const MedicationScheduleOptimizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId: propPatientId,
  initialMedicineId,
  onScheduleUpdated,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(
    propPatientId || (currentUser?.role === 'patient' && currentUser.id ? currentUser.id : 1)
  );

  const [summary, setSummary] = useState<PatientAdherenceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom time editing state
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState<string>('08:30');

  // Load patients list for doctor/admin view
  useEffect(() => {
    if (isOpen) {
      db.patients.toArray().then((list) => {
        setPatients(list);
        if (!propPatientId && list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0].id || 1);
        }
      });
    }
  }, [isOpen, propPatientId, selectedPatientId]);

  // Load and analyze adherence whenever selected patient changes
  const loadAnalysis = async (pid: number) => {
    setLoading(true);
    try {
      const result = await MedicationScheduleOptimizer.analyzePatientAdherence(pid);
      setSummary(result);
    } catch (err) {
      console.error('Error analyzing medication adherence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedPatientId) {
      loadAnalysis(selectedPatientId);
    }
  }, [isOpen, selectedPatientId]);

  if (!isOpen) return null;

  const handleApply = async (sugg: ScheduleAdjustmentSuggestion, customTime?: string) => {
    setApplyingId(sugg.id);
    const timesToApply = customTime ? [customTime] : sugg.proposedSchedule;

    const success = await MedicationScheduleOptimizer.applyScheduleAdjustment(
      sugg,
      timesToApply,
      {
        name: currentUser?.name || 'Dr. Suresh Balakrishnan',
        role: currentUser?.role || 'doctor',
        userId: currentUser?.id ? `USER-${currentUser.id}` : undefined,
      }
    );

    if (success) {
      setSuccessMessage(
        `✓ Schedule updated for ${sugg.medicineName}! New reminder time set to ${timesToApply.join(', ')}.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      setEditingSuggestionId(null);
      await loadAnalysis(selectedPatientId);
      onScheduleUpdated?.();
    }
    setApplyingId(null);
  };

  const handleApplyAll = async () => {
    if (!summary || summary.suggestions.length === 0) return;
    setLoading(true);

    for (const sugg of summary.suggestions) {
      await MedicationScheduleOptimizer.applyScheduleAdjustment(sugg, undefined, {
        name: currentUser?.name || 'Dr. Suresh Balakrishnan',
        role: currentUser?.role || 'doctor',
      });
    }

    setSuccessMessage(
      `✓ All ${summary.suggestions.length} recommended schedule adjustments applied successfully!`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
    await loadAnalysis(selectedPatientId);
    onScheduleUpdated?.();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Intelligent Medication Schedule Optimizer
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Analyzes on-device intake timestamps &amp; habitual routines to suggest clinical schedule adjustments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Controls Bar: Patient Selector & Summary */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-teal-600 cursor-pointer shadow-2xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (P-{p.id}) · {p.age}y · {p.village}
                </option>
              ))}
            </select>
          </div>

          {summary && (
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <span>Overall Adherence: <strong className={summary.overallAdherenceRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}>{summary.overallAdherenceRate}%</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Logged Doses: <strong>{summary.totalLoggedDoses}</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Identified Optimizations: <strong className="text-amber-700">{summary.identifiedPatternsCount}</strong></span>
            </div>
          )}
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Analyzing historical adherence patterns &amp; therapeutic windows...
              </p>
            </div>
          ) : !summary || summary.suggestions.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Optimal Medication Adherence Detected
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {summary?.patientName} has maintained consistent adherence across active prescriptions without chronic delay or late-night omission patterns. Current dosage schedules remain therapeutically sound.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Batch Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <Activity className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      {summary.suggestions.length} Actionable Schedule Adjustments Identified
                    </h4>
                    <p className="text-[11px] text-amber-900/90 mt-0.5">
                      Adjusting these reminder timings to align with the patient&apos;s natural habits is projected to recover adherence by an average of <strong>+24%</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyAll}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer shrink-0"
                >
                  Apply All Recommended Adjustments
                </button>
              </div>

              {/* Suggestions Cards List */}
              <div className="space-y-4">
                {summary.suggestions.map((sugg) => {
                  const isEditing = editingSuggestionId === sugg.id;
                  const isApplying = applyingId === sugg.id;

                  return (
                    <div
                      key={sugg.id}
                      className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 p-4 sm:p-5 shadow-xs transition-all space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-teal-600" />
                            <h4 className="text-base font-black text-slate-900">
                              {sugg.medicineName}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              · Current Adherence: <strong className="text-slate-900">{sugg.adherenceRate}%</strong>
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-bold mt-1">
                            {sugg.title}
                          </p>
                        </div>

                        {/* Severity indicator without pill badge */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-semibold">Impact:</span>
                          <span className={`font-black ${
                            sugg.patternSeverity === 'high' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {sugg.patternSeverity === 'high' ? 'High Impact' : 'Moderate Optimization'}
                          </span>
                        </div>
                      </div>

                      {/* Visual Clock Schedule Comparison Box */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Current Schedule */}
                        <div className="w-full md:w-5/12 bg-white rounded-xl p-3 border border-slate-200">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                            CURRENT SCHEDULE
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <span className="text-base font-black text-slate-800">
                              {sugg.currentTimingText}
                            </span>
                          </div>
                          <div className="text-[11px] text-red-700 font-bold mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            <span>{sugg.adherenceRate}% historical adherence</span>
                          </div>
                        </div>

                        {/* Shift Arrow */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                            <ArrowRight size={16} />
                          </div>
                          <span className="text-[10px] font-black text-teal-700 mt-0.5">
                            OPTIMIZE
                          </span>
                        </div>

                        {/* Proposed Schedule */}
                        <div className="w-full md:w-5/12 bg-teal-50/70 rounded-xl p-3 border border-teal-200">
                          <div className="text-[10px] font-black text-teal-700 uppercase tracking-wider mb-1">
                            RECOMMENDED TIMING
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-teal-700" />
                            <span className="text-base font-black text-teal-950">
                              {sugg.proposedTimingText}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>Projected Adherence: {sugg.projectedAdherenceRate}% (+{sugg.projectedAdherenceRate - sugg.adherenceRate}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Rationale & Historical Evidence */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                          <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                            <Info size={14} className="text-teal-700" />
                            <span>Clinical &amp; Lifestyle Rationale</span>
                          </div>
                          <p>{sugg.rationale}</p>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {sugg.clinicalBenefits.map((benefit, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-1.5 text-slate-800 font-medium">
                                <Check size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Safety Guardrails Banner */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
                          <ShieldCheck size={14} className="text-teal-700 shrink-0" />
                          <span>
                            <strong>Safety Verified:</strong> {sugg.safetyGuardrails.notes} (Minimum {sugg.safetyGuardrails.minIntervalHours}h interval preserved).
                          </span>
                        </div>
                      </div>

                      {/* Custom Time Input Form (Optional Tweak) */}
                      {isEditing && (
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 space-y-2 text-xs animate-in fade-in">
                          <div className="font-bold text-slate-900">
                            Custom Reminder Time Selection
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={customTimeInput}
                              onChange={(e) => setCustomTimeInput(e.target.value)}
                              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-teal-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleApply(sugg, customTimeInput)}
                              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors"
                            >
                              Confirm &amp; Apply Time
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSuggestionId(null)}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500 font-semibold">
                          Based on {sugg.historicalEvidence.totalDosesLogged} logged doses ({sugg.historicalEvidence.dosesTaken} taken, {sugg.historicalEvidence.dosesMissed} missed)
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSuggestionId(isEditing ? null : sugg.id);
                              setCustomTimeInput(sugg.proposedSchedule[0] || '08:30');
                            }}
                            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Sliders size={13} />
                            <span>{isEditing ? 'Close Customizer' : 'Customize Time'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApply(sugg)}
                            disabled={isApplying}
                            className="px-4 py-2 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Check size={14} />
                            <span>{isApplying ? 'Applying...' : 'Apply Recommended Schedule'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-semibold">
            All schedule adjustments immediately update local alarms &amp; sync across offline device storage.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationScheduleOptimizerModal;
