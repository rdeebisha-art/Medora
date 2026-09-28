import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Footprints,
  Moon,
  Target,
  Sliders,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Check,
  X,
  Edit3,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import {
  DailyHealthTargets,
  DailyHealthProgress,
  GoalSummary,
  DayHistoryItem,
  GOAL_PRESETS,
  DEFAULT_TARGETS,
  getGoalSummary,
  saveDailyTargets,
  logQuickProgress,
  setExactProgress,
  resetDailyProgress,
  getWeeklyGoalHistory,
  subscribeHealthGoals,
  getTodayDateString
} from '../services/healthGoalsService';

interface HealthGoalsSectionProps {
  userId?: number | string;
  userName?: string;
}

export const HealthGoalsSection: React.FC<HealthGoalsSectionProps> = ({
  userId = 1,
  userName = 'Villager'
}) => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [summary, setSummary] = useState<GoalSummary>(() => getGoalSummary(userId, selectedDate));
  const [weekHistory, setWeekHistory] = useState<DayHistoryItem[]>(() =>
    getWeeklyGoalHistory(userId, selectedDate)
  );

  // Modals state
  const [isEditTargetsOpen, setIsEditTargetsOpen] = useState(false);
  const [isCustomLogOpen, setIsCustomLogOpen] = useState(false);
  const [customMetric, setCustomMetric] = useState<'hydration' | 'steps' | 'rest'>('hydration');
  const [customValue, setCustomValue] = useState<string>('');

  // Editing targets draft state
  const [draftTargets, setDraftTargets] = useState<DailyHealthTargets>({
    hydrationMl: summary.targets.hydrationMl,
    steps: summary.targets.steps,
    restHours: summary.targets.restHours,
  });
  const [targetSaveSuccess, setTargetSaveSuccess] = useState(false);

  // Sync state whenever userId or selectedDate changes or background storage updates
  useEffect(() => {
    const update = () => {
      const current = getGoalSummary(userId, selectedDate);
      setSummary(current);
      setWeekHistory(getWeeklyGoalHistory(userId, selectedDate));
    };

    update();
    const unsubscribe = subscribeHealthGoals(() => {
      update();
    });

    return () => {
      unsubscribe();
    };
  }, [userId, selectedDate]);

  // Open Edit Targets modal
  const handleOpenEditTargets = () => {
    setDraftTargets({ ...summary.targets });
    setTargetSaveSuccess(false);
    setIsEditTargetsOpen(true);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyTargets(userId, draftTargets);
    setTargetSaveSuccess(true);
    setTimeout(() => {
      setTargetSaveSuccess(false);
      setIsEditTargetsOpen(false);
    }, 800);
  };

  const handleSelectPreset = (presetTargets: DailyHealthTargets) => {
    setDraftTargets({ ...presetTargets });
  };

  // Quick logging helpers
  const handleQuickAdd = (metric: 'hydration' | 'steps' | 'rest', delta: number) => {
    logQuickProgress(userId, metric, delta, selectedDate);
  };

  const handleOpenCustomLog = (metric: 'hydration' | 'steps' | 'rest') => {
    setCustomMetric(metric);
    if (metric === 'hydration') {
      setCustomValue(String(summary.progress.hydrationMl));
    } else if (metric === 'steps') {
      setCustomValue(String(summary.progress.steps));
    } else {
      setCustomValue(String(summary.progress.restHours));
    }
    setIsCustomLogOpen(true);
  };

  const handleSaveCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customValue);
    if (!isNaN(val) && val >= 0) {
      setExactProgress(userId, customMetric, val, selectedDate);
      setIsCustomLogOpen(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset logged progress for this day? Your daily targets will remain saved.')) {
      resetDailyProgress(userId, selectedDate);
    }
  };

  // Glass calculation (approx 250 mL per glass)
  const currentGlasses = Math.round((summary.progress.hydrationMl / 250) * 10) / 10;
  const targetGlasses = Math.round((summary.targets.hydrationMl / 250) * 10) / 10;

  const isToday = selectedDate === getTodayDateString();

  return (
    <section className="bg-white border-2 border-teal-600/30 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200/60 shadow-2xs">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Health Goals &amp; Daily Targets
              </h2>
              <span className="text-[10px] bg-teal-100/80 text-teal-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-teal-200">
                Daily Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized daily targets for hydration, steps, and rest with live progress tracking
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Active streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold"
            title="Consistent days achieving health targets"
          >
            <Flame size={15} className="text-amber-500 fill-amber-500" />
            <span>{summary.streakDays}-Day Streak</span>
          </div>

          {/* Set / Edit Targets Button */}
          <button
            type="button"
            onClick={handleOpenEditTargets}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer min-h-[38px]"
          >
            <Sliders size={14} className="text-teal-700" />
            <span>Set Targets</span>
          </button>

          {/* Reset progress */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset today's logged progress"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-2xl transition-all shadow-2xs active:scale-95 cursor-pointer min-h-[38px] flex items-center justify-center"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Daily Achievement Summary Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        summary.allGoalsMet
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-300'
          : 'bg-slate-50 border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
              summary.allGoalsMet ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {summary.allGoalsMet ? <Trophy size={16} /> : <Target size={16} />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Today's Target Achievement</span>
                <span className="text-xs font-black text-teal-700">
                  {summary.goalsMetCount} of 3 Targets Met
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {summary.allGoalsMet
                  ? '🎉 Outstanding! All 3 daily targets accomplished today.'
                  : `${3 - summary.goalsMetCount} target(s) remaining for today. Keep up the healthy momentum!`}
              </p>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-lg font-black text-slate-900">{summary.overallPct}%</span>
            <span className="text-[10px] text-slate-500 block">Overall Target Fill</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden shadow-inner relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              summary.allGoalsMet
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                : 'bg-gradient-to-r from-teal-600 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, summary.overallPct)}%` }}
          />
        </div>
      </div>

      {/* The 3 Core Health Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* ============================================================ */}
        {/* 1. HYDRATION TARGET CARD                                      */}
        {/* ============================================================ */}
        <div className="bg-sky-50/50 border border-sky-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-300/60 shadow-2xs">
                  <Droplets size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Daily Hydration
                  </h3>
                  <span className="text-[10px] text-sky-700 font-semibold">
                    Target: {summary.targets.hydrationMl.toLocaleString()} mL ({targetGlasses} glasses)
                  </span>
                </div>
              </div>

              {summary.progress.hydrationMl >= summary.targets.hydrationMl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Check size={11} /> Goal Met
                </span>
              ) : (
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  {summary.hydrationPct}%
                </span>
              )}
            </div>

            {/* Current vs Target metric */}
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {summary.progress.hydrationMl.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ {summary.targets.hydrationMl.toLocaleString()} mL</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-sky-800">
                  {currentGlasses} glasses
                </span>
              </div>
            </div>

            {/* Hydration Progress Bar */}
            <div className="w-full bg-sky-100 rounded-full h-2.5 mt-2 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.progress.hydrationMl >= summary.targets.hydrationMl
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-sky-400 to-blue-600'
                }`}
                style={{ width: `${Math.min(100, summary.hydrationPct)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              {summary.progress.hydrationMl >= summary.targets.hydrationMl
                ? '🌟 Hydration target achieved! Vital for high altitudes and metabolic balance.'
                : 'Drink adequate clean water to avoid dehydration and altitude headaches.'}
            </p>
          </div>

          {/* Quick Log Controls */}
          <div className="mt-4 pt-3 border-t border-sky-200/70 flex items-center justify-between gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickAdd('hydration', 250)}
              className="flex-1 bg-white hover:bg-sky-100/80 active:scale-95 text-sky-900 border border-sky-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 1 glass of water (250 mL)"
            >
              <Plus size={13} />
              <span>+1 Glass</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('hydration', 500)}
              className="flex-1 bg-white hover:bg-sky-100/80 active:scale-95 text-sky-900 border border-sky-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 1 water bottle (500 mL)"
            >
              <Plus size={13} />
              <span>+500 mL</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('hydration', -250)}
              disabled={summary.progress.hydrationMl <= 0}
              className="p-1.5 bg-white hover:bg-rose-50 active:scale-95 text-slate-500 hover:text-rose-600 disabled:opacity-30 border border-sky-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Subtract 250 mL"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenCustomLog('hydration')}
              className="p-1.5 bg-white hover:bg-sky-50 active:scale-95 text-sky-700 border border-sky-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Enter custom water amount"
            >
              <Edit3 size={13} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. DAILY STEPS TARGET CARD                                   */}
        {/* ============================================================ */}
        <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300/60 shadow-2xs">
                  <Footprints size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Daily Steps
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Target: {summary.targets.steps.toLocaleString()} steps
                  </span>
                </div>
              </div>

              {summary.progress.steps >= summary.targets.steps ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Check size={11} /> Goal Met
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  {summary.stepsPct}%
                </span>
              )}
            </div>

            {/* Current vs Target metric */}
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {summary.progress.steps.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ {summary.targets.steps.toLocaleString()}</span>
              </div>
              <div className="text-right text-[11px] font-semibold text-emerald-800">
                <span>~{summary.distanceKm} km</span> · <span>~{summary.caloriesBurned} kcal</span>
              </div>
            </div>

            {/* Steps Progress Bar */}
            <div className="w-full bg-emerald-100 rounded-full h-2.5 mt-2 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.progress.steps >= summary.targets.steps
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-600'
                }`}
                style={{ width: `${Math.min(100, summary.stepsPct)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              {summary.progress.steps >= summary.targets.steps
                ? '🏆 Superb activity level! Daily brisk movement strengthens cardiac muscle.'
                : 'Walking up village slopes or errands contributes directly to healthy blood pressure.'}
            </p>
          </div>

          {/* Quick Log Controls */}
          <div className="mt-4 pt-3 border-t border-emerald-200/70 flex items-center justify-between gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickAdd('steps', 500)}
              className="flex-1 bg-white hover:bg-emerald-100/80 active:scale-95 text-emerald-900 border border-emerald-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 500 steps (short stroll)"
            >
              <Plus size={13} />
              <span>+500</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('steps', 1000)}
              className="flex-1 bg-white hover:bg-emerald-100/80 active:scale-95 text-emerald-900 border border-emerald-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 1,000 steps (brisk walk)"
            >
              <Plus size={13} />
              <span>+1,000</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('steps', -500)}
              disabled={summary.progress.steps <= 0}
              className="p-1.5 bg-white hover:bg-rose-50 active:scale-95 text-slate-500 hover:text-rose-600 disabled:opacity-30 border border-emerald-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Subtract 500 steps"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenCustomLog('steps')}
              className="p-1.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 border border-emerald-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Enter custom step count"
            >
              <Edit3 size={13} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. DAILY REST / SLEEP TARGET CARD                            */}
        {/* ============================================================ */}
        <div className="bg-indigo-50/50 border border-indigo-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-300/60 shadow-2xs">
                  <Moon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Daily Rest &amp; Sleep
                  </h3>
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    Target: {summary.targets.restHours} hours
                  </span>
                </div>
              </div>

              {summary.progress.restHours >= summary.targets.restHours ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Check size={11} /> Goal Met
                </span>
              ) : (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                  {summary.restPct}%
                </span>
              )}
            </div>

            {/* Current vs Target metric */}
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {summary.progress.restHours}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ {summary.targets.restHours} hrs</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-800">
                  {summary.progress.restHours >= 7 ? 'Deep Recovery' : 'Rest Needed'}
                </span>
              </div>
            </div>

            {/* Rest Progress Bar */}
            <div className="w-full bg-indigo-100 rounded-full h-2.5 mt-2 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.progress.restHours >= summary.targets.restHours
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-600'
                }`}
                style={{ width: `${Math.min(100, summary.restPct)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              {summary.progress.restHours >= summary.targets.restHours
                ? '😴 Excellent restorative sleep! Essential for immune defense & mental focus.'
                : 'Target 7-8 hours of uninterrupted nocturnal rest for optimal healing.'}
            </p>
          </div>

          {/* Quick Log Controls */}
          <div className="mt-4 pt-3 border-t border-indigo-200/70 flex items-center justify-between gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickAdd('rest', 0.5)}
              className="flex-1 bg-white hover:bg-indigo-100/80 active:scale-95 text-indigo-900 border border-indigo-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 30 minutes rest / nap"
            >
              <Plus size={13} />
              <span>+0.5 hr</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('rest', 1.0)}
              className="flex-1 bg-white hover:bg-indigo-100/80 active:scale-95 text-indigo-900 border border-indigo-300 rounded-xl py-1.5 px-2 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
              title="Add 1 hour sleep"
            >
              <Plus size={13} />
              <span>+1.0 hr</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('rest', -0.5)}
              disabled={summary.progress.restHours <= 0}
              className="p-1.5 bg-white hover:bg-rose-50 active:scale-95 text-slate-500 hover:text-rose-600 disabled:opacity-30 border border-indigo-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Subtract 0.5 hour"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenCustomLog('rest')}
              className="p-1.5 bg-white hover:bg-indigo-50 active:scale-95 text-indigo-700 border border-indigo-200 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer min-h-[34px]"
              title="Enter exact hours slept"
            >
              <Edit3 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Consistency Micro-Tracker */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Calendar size={14} className="text-teal-700" />
            <span>Past 7-Day Habit Consistency</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {weekHistory.filter((d) => d.metCount >= 2).length} of 7 days on track
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekHistory.map((item, idx) => {
            const isSelected = item.date === selectedDate;
            const isTodayItem = item.date === getTodayDateString();

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(item.date)}
                className={`py-2 px-1 rounded-xl transition-all border text-center flex flex-col items-center justify-between gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                    : 'bg-white hover:bg-teal-50/60 border-slate-200 text-slate-700'
                }`}
                title={`${item.date}: ${item.metCount} targets met (${item.overallPct}%)`}
              >
                <span className={`text-[10px] font-black uppercase ${
                  isSelected ? 'text-teal-100' : 'text-slate-400'
                }`}>
                  {item.dayLabel}
                </span>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  item.allMet
                    ? isSelected ? 'bg-white text-teal-800' : 'bg-emerald-100 text-emerald-800'
                    : item.metCount >= 2
                    ? isSelected ? 'bg-white/80 text-teal-900' : 'bg-teal-100 text-teal-800'
                    : isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.allMet ? '✓' : `${item.metCount}/3`}
                </div>

                <span className={`text-[9px] font-medium leading-none ${
                  isSelected ? 'text-teal-100' : 'text-slate-500'
                }`}>
                  {isTodayItem ? 'Today' : item.date.slice(8)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SET / CUSTOMIZE DAILY TARGETS                       */}
      {/* ============================================================ */}
      {isEditTargetsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Set Daily Health Targets</h3>
                  <p className="text-xs text-slate-500">Customize targets suited to your daily routine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTargetsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Lifestyle Presets */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Quick Rural Lifestyle Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOAL_PRESETS.map((preset) => {
                  const isCurrent =
                    draftTargets.hydrationMl === preset.targets.hydrationMl &&
                    draftTargets.steps === preset.targets.steps &&
                    draftTargets.restHours === preset.targets.restHours;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.targets)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400/40'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{preset.emoji}</span>
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {preset.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="text-[10px] font-semibold text-teal-800 flex gap-2">
                        <span>💧 {preset.targets.hydrationMl} mL</span>
                        <span>👟 {preset.targets.steps.toLocaleString()}</span>
                        <span>🌙 {preset.targets.restHours}h</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Sliders & Numeric Inputs */}
            <form onSubmit={handleSaveTargets} className="space-y-4 pt-2 border-t border-slate-100">
              {/* 1. Hydration Target */}
              <div className="bg-sky-50/60 border border-sky-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                    <Droplets size={14} className="text-sky-700" />
                    Target Water Intake (mL)
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-black text-sky-950">
                      {draftTargets.hydrationMl.toLocaleString()} mL
                    </span>
                    <span className="text-[11px] text-sky-700 font-semibold ml-1">
                      (~{Math.round((draftTargets.hydrationMl / 250) * 10) / 10} glasses)
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4500"
                  step="250"
                  value={draftTargets.hydrationMl}
                  onChange={(e) =>
                    setDraftTargets({
                      ...draftTargets,
                      hydrationMl: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>1,000 mL</span>
                  <span>2,500 mL (Recommended)</span>
                  <span>4,500 mL</span>
                </div>
              </div>

              {/* 2. Steps Target */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Footprints size={14} className="text-emerald-700" />
                    Target Daily Steps
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-950">
                      {draftTargets.steps.toLocaleString()} steps
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold ml-1">
                      (~{Math.round(draftTargets.steps * 0.00075 * 10) / 10} km)
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={draftTargets.steps}
                  onChange={(e) =>
                    setDraftTargets({
                      ...draftTargets,
                      steps: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>2,000</span>
                  <span>8,000 (Recommended)</span>
                  <span>20,000</span>
                </div>
              </div>

              {/* 3. Rest Hours Target */}
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Moon size={14} className="text-indigo-700" />
                    Target Sleep &amp; Rest (Hours)
                  </span>
                  <span className="text-sm font-black text-indigo-950">
                    {draftTargets.restHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="12.0"
                  step="0.5"
                  value={draftTargets.restHours}
                  onChange={(e) =>
                    setDraftTargets({
                      ...draftTargets,
                      restHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>5.0 hrs</span>
                  <span>8.0 hrs (Optimal)</span>
                  <span>12.0 hrs</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTargetsOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 min-h-[42px]"
                >
                  {targetSaveSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Targets Saved!</span>
                    </>
                  ) : (
                    <span>Save Daily Targets</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CUSTOM NUMERIC ENTRY MODAL                          */}
      {/* ============================================================ */}
      {isCustomLogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Edit3 size={16} className="text-teal-700" />
                <span>
                  Log Exact{' '}
                  {customMetric === 'hydration'
                    ? 'Water (mL)'
                    : customMetric === 'steps'
                    ? 'Steps Count'
                    : 'Rest Hours'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomLogOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {customMetric === 'hydration'
                    ? 'Total Water Consumed Today (mL):'
                    : customMetric === 'steps'
                    ? 'Total Steps Walked Today:'
                    : 'Total Hours Slept / Rested:'}
                </label>
                <input
                  type="number"
                  step={customMetric === 'rest' ? '0.1' : '1'}
                  min="0"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter number..."
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomLogOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer min-h-[38px]"
                >
                  Update Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
