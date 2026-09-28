import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Brain,
  Share2,
} from 'lucide-react';
import { healthInsightService, WeeklyHealthInsight } from '../services/ai/healthInsightService';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';

export const WeeklyHealthInsightCard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();
  const [insight, setInsight] = useState<WeeklyHealthInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const patientId = currentUser?.role === 'patient' && currentUser.id ? currentUser.id : 1;
  const patientName = currentUser?.name || 'Ramesh Kumar';

  const fetchInsight = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await healthInsightService.generateWeeklyInsight(
        patientId,
        patientName,
        language || 'en',
        force
      );
      setInsight(data);
    } catch (e) {
      console.error('Failed to generate weekly health insight:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsight(false);
  }, [patientId, patientName, language]);

  const handleShareToSms = async () => {
    if (!insight) return;
    const text = `MEDORA WEEKLY HEALTH INSIGHT (${insight.periodLabel})\nPatient: ${patientName}\nStatus: ${insight.riskLevel}\nHeadline: ${insight.headline}\nSummary: ${insight.summary.slice(0, 160)}...\n[Medora AI]`;

    try {
      await db.smsOutbox.add({
        toPhone: currentUser?.phone || '9800001111 (Doctor/Family)',
        message: text,
        type: 'medical_record',
        language: language || 'en',
        status: 'OFFLINE_OUTBOX' as any,
        createdAt: new Date().toISOString(),
        info: 'Weekly AI health insight summary saved to SMS Outbox.',
      });
      setShareFeedback('✓ Summary saved to SMS Outbox for offline sharing!');
      setTimeout(() => setShareFeedback(null), 3500);
    } catch {}
  };

  const riskColors = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      border: 'border-emerald-300',
      icon: <CheckCircle2 size={16} className="text-emerald-600" />,
      label: 'Stable & Low Risk',
    },
    MODERATE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      badge: 'bg-amber-600 text-white',
      border: 'border-amber-300',
      icon: <Activity size={16} className="text-amber-600" />,
      label: 'Moderate Vigilance Advised',
    },
    ATTENTION_NEEDED: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      badge: 'bg-rose-600 text-white',
      border: 'border-rose-300',
      icon: <AlertTriangle size={16} className="text-rose-600" />,
      label: 'Clinical Attention Needed',
    },
  };

  const currentRisk = insight ? riskColors[insight.riskLevel] || riskColors.LOW : riskColors.LOW;

  return (
    <div className="bg-gradient-to-br from-white via-teal-50/20 to-indigo-50/30 border-2 border-teal-500/30 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
            <Brain size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <Sparkles size={11} className="text-teal-700" />
                AI Health Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {insight?.periodLabel || 'Past 7 Days'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              Weekly AI Health Insight Summary
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {shareFeedback && (
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 animate-fade-in">
              {shareFeedback}
            </span>
          )}
          <button
            type="button"
            onClick={handleShareToSms}
            disabled={!insight || isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Share Weekly Summary to SMS Outbox"
          >
            <Share2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => fetchInsight(true)}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Re-run AI clinical analysis on recent symptoms and health tests"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Analyzing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <RefreshCw size={24} className="animate-spin text-teal-600" />
          <p className="font-semibold">Synthesizing weekly symptoms and health tests with AI engine...</p>
        </div>
      ) : insight ? (
        <div className="space-y-4">
          {/* Status & Headline Banner */}
          <div className={`p-4 rounded-2xl border ${currentRisk.bg} ${currentRisk.border} space-y-2`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${currentRisk.badge}`}>
                {currentRisk.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Model: {insight.modelUsed}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              {insight.headline}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {insight.summary}
            </p>
          </div>

          {/* Vitals Assessment & Symptom Trajectory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Vitals Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Activity size={15} className="text-teal-600" />
                <span>Recorded Vital Indicators Assessment</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {insight.vitalsAssessment.map((vital, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{vital.metric}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          vital.status === 'normal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vital.status === 'borderline'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {vital.value} • {vital.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{vital.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptom Trajectory Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 mb-2">
                  <TrendingUp size={15} className="text-indigo-600" />
                  <span>Symptom Trajectory &amp; Pattern Analysis</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                  {insight.symptomTrajectory}
                </div>
              </div>

              {/* Red Flags / Warning Signs */}
              {insight.redFlags && insight.redFlags.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1 text-rose-900 font-bold text-[11px] uppercase">
                    <AlertTriangle size={13} className="text-rose-600" />
                    <span>Watch for Emergency Warning Signs:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-950 font-medium">
                    {insight.redFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* AI Clinical Recommendations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-black text-slate-800 block">
              💡 Actionable Clinical Recommendations for Rural Wellness:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {insight.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-50/50 border border-teal-100 text-slate-800"
                >
                  <CheckCircle2 size={15} className="text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-slate-500">
          No insight available. Click Regenerate to calculate.
        </div>
      )}
    </div>
  );
};

export default WeeklyHealthInsightCard;
