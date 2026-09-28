import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Smile,
  Heart,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  Edit3,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sun,
  Flame
} from 'lucide-react';
import {
  MoodLevel,
  PhysicalComfortLevel,
  MOOD_DEFINITIONS,
  COMFORT_DEFINITIONS,
  DailyWellnessEntry,
  logDailyWellness,
  getTodayCheckin,
  getPastWeekWellnessChartData,
  subscribeWellnessCheckins,
  PastWeekChartPoint,
} from '../services/wellnessCheckinService';

interface DailyWellnessCheckinProps {
  userId?: number | string;
  userName?: string;
  className?: string;
}

const COMMON_TAGS = [
  'Feeling energetic',
  'Pain-free',
  'Mild back stiffness',
  'Headache',
  'Joint/Knee ache',
  'Fatigue',
  'Digestive ease',
  'Calm & relaxed',
];

export const DailyWellnessCheckin: React.FC<DailyWellnessCheckinProps> = ({
  userId = 1,
  userName = 'Villager',
  className = '',
}) => {
  const { t } = useTranslation();

  // State
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(4);
  const [selectedComfort, setSelectedComfort] = useState<PhysicalComfortLevel>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Feeling energetic']);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [chartView, setChartView] = useState<'combined' | 'mood' | 'comfort'>('combined');

  // Load today's checkin and past week trends
  const [todayEntry, setTodayEntry] = useState<DailyWellnessEntry | null>(() => getTodayCheckin(userId));
  const [trendData, setTrendData] = useState(() => getPastWeekWellnessChartData(userId, 7));

  // Sync state if already logged today
  useEffect(() => {
    if (todayEntry) {
      setSelectedMood(todayEntry.mood);
      setSelectedComfort(todayEntry.physicalComfort);
      setEnergyLevel(todayEntry.energyLevel);
      setSelectedTags(todayEntry.symptomsNoted || []);
      setNotes(todayEntry.notes || '');
    }
  }, [todayEntry]);

  // Subscribe to changes
  useEffect(() => {
    const unsub = subscribeWellnessCheckins(() => {
      setTodayEntry(getTodayCheckin(userId));
      setTrendData(getPastWeekWellnessChartData(userId, 7));
    });
    return unsub;
  }, [userId]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const saved = logDailyWellness(userId, {
        mood: selectedMood,
        physicalComfort: selectedComfort,
        energyLevel,
        symptomsNoted: selectedTags,
        notes,
      });
      setTodayEntry(saved);
      setTrendData(getPastWeekWellnessChartData(userId, 7));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 4000);
    } catch (err) {
      console.error('Failed to log wellness checkin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Dot for Recharts to show mood emoji
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.hasEntry || !cx || !cy) return null;
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} className="overflow-visible pointer-events-none">
        <circle cx={10} cy={10} r={9} fill="#FFFFFF" stroke="#0D9488" strokeWidth={2} />
        <text x={10} y={14} textAnchor="middle" fontSize={10}>
          {payload.moodEmoji}
        </text>
      </svg>
    );
  };

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: PastWeekChartPoint = payload[0].payload;
      if (!data.hasEntry) {
        return (
          <div className="bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-700 text-xs">
            <p className="font-bold text-slate-300">{data.dayLabel} ({data.date})</p>
            <p className="text-slate-400 mt-1">No check-in recorded for this day</p>
          </div>
        );
      }

      return (
        <div className="bg-slate-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-teal-500/40 text-xs min-w-52 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-black text-teal-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {data.dayLabel} {data.isToday ? '(Today)' : ''}
            </span>
            <span className="text-[10px] text-slate-400">{data.date}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-teal-400" /> Mood:
              </span>
              <span className="font-bold text-teal-300">
                {data.moodEmoji} {data.moodLabel} ({data.mood}/5)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-400" /> Comfort:
              </span>
              <span className="font-bold text-amber-300">
                {data.comfortLabel} ({data.comfortPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" /> Energy:
              </span>
              <span className="font-bold text-yellow-300">{data.energy}/5</span>
            </div>
          </div>

          {data.symptoms && data.symptoms.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800">
              <div className="text-[10px] text-slate-400">Notes & Sensations:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.symptoms.map((s, idx) => (
                  <span key={idx} className="bg-slate-800 text-teal-200 text-[10px] px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.notes && (
            <p className="text-[11px] italic text-slate-300 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
              "{data.notes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const { chartPoints, summary } = trendData;

  return (
    <div
      id="wellness-checkin"
      className={`bg-white border-2 border-teal-500/30 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 ${className}`}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200/80 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>DAILY WELLNESS CHECK-IN & RECHARTS TRENDS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Holistic Mood & Physical Comfort Tracker</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log your daily emotional and physical comfort levels to visualize 7-day health patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {todayEntry ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Logged Today: {todayEntry.moodEmoji} {todayEntry.comfortLabel}</span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-pulse">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Today's Check-in Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID: LEFT = CHECK-IN FORM, RIGHT = RECHARTS TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* 1. CHECK-IN FORM (5 COLS)                                 */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-teal-600" />
              <span>{todayEntry ? "Update Today's Check-in" : "Log Today's Check-in"}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              📅 Today
            </span>
          </div>

          {/* 1. MOOD SELECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-teal-600" />
                <span>How is your mood today?</span>
              </label>
              <span className="text-xs font-bold text-teal-700">
                {MOOD_DEFINITIONS[selectedMood].label}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => {
                const meta = MOOD_DEFINITIONS[level];
                const isSelected = selectedMood === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedMood(level)}
                    className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105 font-black ring-2 ring-teal-400'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{meta.emoji}</span>
                    <span className="text-[10px] font-bold mt-1 line-clamp-1 text-center">
                      {level === 5 ? 'Great' : level === 4 ? 'Good' : level === 3 ? 'Okay' : level === 2 ? 'Low' : 'Sad'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {MOOD_DEFINITIONS[selectedMood].description}
            </p>
          </div>

          {/* 2. PHYSICAL COMFORT LEVEL SELECTION */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
                <span>Physical Comfort & Body Ease:</span>
              </label>
              <span className="text-xs font-bold text-amber-800">
                {COMFORT_DEFINITIONS[selectedComfort].label} ({COMFORT_DEFINITIONS[selectedComfort].scorePercent}%)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {([5, 4, 3, 2, 1] as PhysicalComfortLevel[]).map((level) => {
                const meta = COMFORT_DEFINITIONS[level];
                const isSelected = selectedComfort === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedComfort(level)}
                    className={`py-2 px-1 rounded-xl text-center transition-all border text-xs font-extrabold cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105 ring-2 ring-amber-300'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-black">{level}/5</div>
                    <div className="text-[9px] font-medium mt-0.5 line-clamp-1">
                      {level === 5 ? 'Pain-Free' : level === 4 ? 'Comfy' : level === 3 ? 'Mild' : level === 2 ? 'Mod Pain' : 'Severe'}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {COMFORT_DEFINITIONS[selectedComfort].description}
            </p>
          </div>

          {/* 3. ENERGY LEVEL (1 to 5) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-200" />
                <span>Energy & Vitality:</span>
              </label>
              <span className="text-xs font-bold text-slate-700">{energyLevel} / 5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEnergyLevel(star)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    energyLevel >= star
                      ? 'bg-yellow-400 text-yellow-950 border-yellow-500 font-black'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  ⚡ {star}
                </button>
              ))}
            </div>
          </div>

          {/* 4. COMMON TAGS / SENSATIONS */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
            <label className="text-xs font-black text-slate-800 block">
              Quick Tags & Sensations:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      active
                        ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. NOTES TEXTAREA */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              Personal Remarks (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slept 8 hours, slight knee soreness after harvesting, took prescribed medicines on time..."
              rows={2}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : justSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Check-in Saved!</span>
              </>
            ) : todayEntry ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Today's Check-in</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Save Today's Wellness Check-in</span>
              </>
            )}
          </button>
        </form>

        {/* ========================================================= */}
        {/* 2. RECHARTS TRENDS VISUALIZATION (7 COLS)                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Past 7 Days Wellness Trends (Recharts)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualizing daily mood and physical comfort trajectory
              </p>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold self-start sm:self-center">
              <button
                type="button"
                onClick={() => setChartView('combined')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartView === 'combined'
                    ? 'bg-white text-teal-900 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Combined
              </button>
              <button
                type="button"
                onClick={() => setChartView('mood')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartView === 'mood'
                    ? 'bg-teal-600 text-white font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mood Only
              </button>
              <button
                type="button"
                onClick={() => setChartView('comfort')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartView === 'comfort'
                    ? 'bg-amber-500 text-white font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comfort Only
              </button>
            </div>
          </div>

          {/* 7-DAY SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 space-y-0.5">
              <span className="text-[10px] font-bold text-teal-700 uppercase block">Avg Mood</span>
              <div className="text-lg font-black text-teal-950 flex items-center gap-1">
                <span>{summary.averageMood} / 5</span>
              </div>
              <span className="text-[10px] text-teal-700 font-medium line-clamp-1">{summary.dominantMood}</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 space-y-0.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Avg Comfort</span>
              <div className="text-lg font-black text-amber-950 flex items-center gap-1">
                <span>{summary.averageComfortPercent}%</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium">({summary.averageComfort}/5 score)</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Weekly Trend</span>
              <div className="text-sm font-black text-slate-800 flex items-center gap-1">
                {summary.weeklyTrendMood === 'improving' ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Improving</span>
                  </>
                ) : summary.weeklyTrendMood === 'declining' ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-700">Variable</span>
                  </>
                ) : (
                  <span className="text-slate-700">Stable ↔</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Over 7 days</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Consistency</span>
              <div className="text-lg font-black text-emerald-950 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
                <span>{summary.streakDays} / 7 Days</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Active habit</span>
            </div>
          </div>

          {/* RECHARTS RESPONSIVE CONTAINER */}
          <div className="w-full h-64 sm:h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartPoints}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              >
                <defs>
                  {/* Mood Teal Gradient */}
                  <linearGradient id="wellnessMoodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Comfort Amber Gradient */}
                  <linearGradient id="wellnessComfortGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                />

                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                  tickFormatter={(val) =>
                    val === 5 ? '5 Great' : val === 3 ? '3 Okay' : val === 1 ? '1 Low' : `${val}`
                  }
                />

                <Tooltip content={<CustomChartTooltip />} />

                <ReferenceLine
                  y={3}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  label={{ value: 'Baseline', position: 'insideTopRight', fill: '#94A3B8', fontSize: 10 }}
                />

                {(chartView === 'combined' || chartView === 'mood') && (
                  <Area
                    type="monotone"
                    dataKey="mood"
                    name="Mood Level"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#wellnessMoodGradient)"
                    dot={renderCustomDot}
                    activeDot={{ r: 6, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}

                {(chartView === 'combined' || chartView === 'comfort') && (
                  <Area
                    type="monotone"
                    dataKey="comfort"
                    name="Physical Comfort"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#wellnessComfortGradient)"
                    dot={{ r: 4, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* RECHARTS CHART LEGEND & HEALTH ADVICE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4 text-slate-600 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
                <span>Mood (1-5)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Physical Comfort (1-5)</span>
              </span>
            </div>

            {summary.alertRecommended ? (
              <div className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Elevated discomfort recorded over multiple days — consult a doctor.</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">
                ✨ Healthy resilience pattern observed this past week.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
