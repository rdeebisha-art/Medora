import React, { useState } from 'react';
import { Heart, Activity, Calendar, Baby, AlertTriangle, Apple, Volume2, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, PhoneCall, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { LanguageCode, FamilyMember } from '../types';
import { voiceService } from '../services/voiceService';
import { useAppStore } from '../store/useAppStore';

interface MaternityCarePageProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToAI: () => void;
  onNavigateToDoctorSummary: () => void;
  onOpenReportScanner: () => void;
}

export const MaternityCarePage: React.FC<MaternityCarePageProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToAI,
  onNavigateToDoctorSummary,
  onOpenReportScanner,
}) => {
  const [speaking, setSpeaking] = useState(false);
  // Default to 24 weeks as specifically highlighted by the user
  const [gestationWeek, setGestationWeek] = useState<number>(24);
  const [currentHb, setCurrentHb] = useState<number>(11.4);
  const [tookIFAIronToday, setTookIFAIronToday] = useState<boolean>(true);
  const [newbornTab, setNewbornTab] = useState<'feeding' | 'cord' | 'warmth' | 'danger'>('feeding');
  const [birthRecord, setBirthRecord] = useState({ babyCount: 1, birthDate: '', birthTime: '', birthWeight: '', lengthCm: '', bloodGroup: '', breathing: 'Normal', checkupStatus: 'Due within 24 hours' });

  // Determine Trimester
  const trimester = gestationWeek <= 12 ? 1 : gestationWeek <= 27 ? 2 : 3;

  const readPageOverview = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `Maternal and Newborn Care Hub. Currently set to ${gestationWeek} weeks in the second trimester. Your hemoglobin target is at least 11 grams per deciliter. At 24 weeks, ensure adequate calcium, iron from moringa and jaggery, and daily IFA tablet intake. Also review our newborn care guide.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  // Trimester specific dynamic data
  const getTrimesterData = (week: number) => {
    if (week <= 12) {
      return {
        name: '1st Trimester (Months 1–3: Conception to 12 Weeks)',
        focus: 'Early organ development, neural tube closure, and preventing early miscarriage.',
        hbTarget: 'Target Hb ≥ 11.0 g/dL. (Take Folic Acid 5mg daily)',
        nutrition: {
          highlight: 'Folic Acid, Citrus Fruits, Easy Digestible Energy',
          items: [
            'Fresh Green Leafy Greens (Palak, Methi) — rich in natural folates',
            'Sprouted Green Gram (Moong) & Lentils for basic cellular growth',
            'Citrus fruits (Lemon, Oranges, Amla) for morning sickness & iron absorption',
            'Light home-cooked khichdi and ginger tea for nausea relief',
          ],
          avoid: 'Raw papaya, unpasteurized milk, excessive tea/coffee, oily fried snacks',
        },
        procedures: [
          { name: 'Dating Ultrasound Scan (8-11 weeks)', status: 'Completed', note: 'Confirms single live intrauterine pregnancy' },
          { name: 'Tetanus Toxoid Injection 1 (TT-1)', status: 'Due now', note: 'Administered at PHC Rampur' },
          { name: 'Baseline Blood Tests (Hb, Blood Group, HIV, VDRL)', status: 'Verified', note: 'Recorded in MCP card' },
        ],
        tips: 'Avoid lifting heavy farm weights, take 8 hours of sleep + 2 hours afternoon rest, and drink boiled water.',
      };
    } else if (week <= 27) {
      return {
        name: `2nd Trimester (Months 4–6: Weeks 13–27 — Current: Week ${week})`,
        focus: 'Rapid fetal bone ossification, fetal movements (quickening), and maternal blood volume surge.',
        hbTarget: 'Target Hb ≥ 11.0 g/dL. (Critical surge in maternal blood volume — prevent nutritional anemia)',
        nutrition: {
          highlight: 'High Calcium, Organic Iron, Quality Protein & Healthy Fats',
          items: [
            'Ragi (Finger Millet) & Milk / Curd daily for fetal bone and tooth buds',
            'Moringa (Drumstick leaves) & Jaggery (Gur) for boosting red blood cells',
            'Roasted chickpeas, peanuts, and boiled pulses (Dal) for fetal muscle tissue',
            'Coconut water & buttermilk (2-3 liters fluids daily) to maintain amniotic fluid index',
          ],
          avoid: 'Excess salt (prevents swollen ankles/edema), artificial sweeteners, street junk, raw eggs',
        },
        procedures: [
          { name: 'Level II Ultrasound Anomaly Scan (18-22 weeks)', status: 'Mandatory', note: 'Evaluates fetal spine, kidneys, heart, and placenta location' },
          { name: 'Tetanus Toxoid Booster (TT-2 / Td-2)', status: 'Completed at 20w', note: 'Protects against neonatal tetanus' },
          { name: 'Oral Glucose Tolerance Test (OGTT 24-28w)', status: 'Due this week', note: 'Screens for Gestational Diabetes Mellitus (GDM)' },
          { name: 'Regular BP & Urine Albumin Check', status: 'Every 2 Weeks', note: 'Prevents sudden Pre-eclampsia spikes' },
        ],
        tips: `At week ${week}, you should feel regular fetal kicks (at least 10 movements over a 2-hour relaxed period). Sleep strictly on your left side to maximize blood flow through the placenta.`,
      };
    } else if (week <= 40) {
      return {
        name: '3rd Trimester (Months 7–9: Weeks 28–40 — Delivery Preparation)',
        focus: 'Fetal lung maturity, maternal birth preparedness, and emergency delivery transit planning.',
        hbTarget: 'Target Hb ≥ 11.0 g/dL. (Prevents postpartum hemorrhage and low birth weight)',
        nutrition: {
          highlight: 'Caloric Density, Fiber for Digestion, Optimal Hydration',
          items: [
            'Frequent smaller meals (5-6 times daily) to prevent acidity & reflux',
            'High fiber: Whole grains, papaya (ripe only), guava, carrots to prevent constipation',
            'Clarified butter (Ghee) in moderation, soaked almonds, dates (Khajoor)',
            'Warm milk with turmeric at bedtime for deep restorative rest',
          ],
          avoid: 'Very salty pickles, lying flat on your back, strenuous manual labor in the fields',
        },
        procedures: [
          { name: 'Growth & Doppler Ultrasound Scan (32-34 weeks)', status: 'Recommended', note: 'Monitors fetal growth curve and umbilical blood flow' },
          { name: 'Pre-delivery Hemoglobin check', status: 'Crucial', note: 'Blood matching ready in case of emergency transfusion' },
          { name: 'Institutional Delivery Registration at CHC', status: 'Registered', note: 'Janani Suraksha Yojana (JSY) cash transfer confirmed' },
        ],
        tips: 'Keep your hospital delivery bag packed with baby clothes, clean towels, MCP card, and Aadhaar card. Dial 102 ambulance if water breaks or contractions start.',
      };
    } else {
      return {
        name: `Post-due-date monitoring (Week ${week})`,
        focus: 'Pregnancy is beyond 40 weeks. Mother and baby need prompt clinical assessment and an individualized delivery plan.',
        hbTarget: 'Check blood pressure, urine, fetal movement, fetal heart rate, and other tests as advised by the maternity team.',
        nutrition: {
          highlight: 'Hydration, balanced meals, and clinician-guided monitoring',
          items: ['Attend the maternity unit today for an assessment', 'Track fetal movement and report a clear reduction immediately', 'Keep transport, blood-group information, and emergency contacts ready'],
          avoid: 'Do not attempt home induction, take unprescribed medicines, or delay care after reduced movements, bleeding, fluid leakage, or severe pain',
        },
        procedures: [
          { name: 'Same-day maternal and fetal assessment', status: 'Due now', note: 'The maternity team will decide monitoring, induction, or delivery timing.' },
          { name: 'Blood pressure, urine, and fetal heart check', status: 'Required', note: 'Screens for pre-eclampsia and fetal compromise.' },
          { name: 'Delivery and newborn preparedness review', status: 'Required', note: 'Confirm hospital, transport, blood group, support person, and baby supplies.' },
        ],
        tips: 'Contact the maternity unit today. Call 102 or 108 for heavy bleeding, severe abdominal pain, seizures, breathing difficulty, fluid leakage with concern, or reduced fetal movement.',
      };
    }
  };

  const currentTrimesterData = getTrimesterData(gestationWeek);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-pink-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-400/20 border border-rose-300/30 text-rose-200 px-3 py-1 rounded-full text-xs font-bold">
              <Heart className="w-4 h-4 text-rose-300" />
              <span>Full 9 Months Trimester & Newborn Life Continuity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Maternity & Newborn Care Hub (   )
            </h1>
            <p className="text-sm text-rose-100/90 leading-relaxed">
              Step-by-step trimester progression: monitor hemoglobin levels, dynamic food intake modified by gestational week, mandatory checkups, pre-eclampsia prevention, and golden-hour newborn care.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={readPageOverview}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? 'Stop Voice' : '🔊 Listen in Native Language'}</span>
            </button>
            <button
              onClick={() => useAppStore.getState().startDirectCall({
                name: '102 Janani Shishu Ambulance',
                phone: '102',
                category: 'AMBULANCE',
                targetUserId: 'DOC-01',
                location: 'Maternal Emergency Dispatch',
                emergency: true,
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black text-xs shadow-lg transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 102 (Janani Ambulance Inside Medora)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Profile Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-rose-600" />
          <span className="text-sm font-bold text-slate-800">Maternal Patient Profile:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFamilyId === m.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.age} yrs - {m.relationship})
            </button>
          ))}
        </div>
      </div>

      {/* 1. DYNAMIC TRIMESTER SCALE & WEEK-BY-WEEK SLIDER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-black text-slate-900">Interactive Trimester & Pregnancy Week Scale</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Move the slider to adjust gestational age across all 40 weeks (9 full months) to see customized nutrition and medical tips.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
            <span className="text-xs font-bold text-rose-700 uppercase">Selected Gestation:</span>
            <span className="text-xl font-black text-rose-900">{gestationWeek} Weeks</span>
            <span className="text-xs font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
              Trimester {trimester}
            </span>
          </div>
        </div>

        {/* The Interactive Slider */}
        <div className="space-y-4">
          <input
            type="range"
            min={1}
            max={42}
            value={gestationWeek}
            onChange={(e) => setGestationWeek(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />

          {/* Scale Labels */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              onClick={() => setGestationWeek(8)}
              className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                trimester === 1 ? 'bg-rose-50 border-rose-300 font-black text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block font-bold">1st Trimester</span>
              <span className="text-[11px] opacity-80">Weeks 1 – 12</span>
            </div>
            <div
              onClick={() => setGestationWeek(24)}
              className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                trimester === 2 ? 'bg-rose-50 border-rose-300 font-black text-rose-900 ring-2 ring-rose-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block font-bold">2nd Trimester (24 Weeks)</span>
              <span className="text-[11px] opacity-80">Weeks 13 – 27</span>
            </div>
            <div
              onClick={() => setGestationWeek(34)}
              className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                trimester === 3 ? 'bg-rose-50 border-rose-300 font-black text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block font-bold">3rd Trimester</span>
              <span className="text-[11px] opacity-80">Weeks 28 – 42</span>
            </div>
          </div>
        </div>

        {/* Current Trimester Header Summary */}
        <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-rose-950">{currentTrimesterData.name}</h3>
            <p className="text-xs text-rose-800 mt-0.5">{currentTrimesterData.focus}</p>
          </div>
          <button
            onClick={onNavigateToAI}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI About Week {gestationWeek}</span>
          </button>
        </div>
      </div>

      {/* 2A. BIRTH RECORD AND SIX-MONTH NEWBORN FOLLOW-UP */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Baby className="w-5 h-5 text-teal-600" /> Birth Record & Six-Month Baby Checkups</h2>
          <p className="text-xs text-slate-500 mt-1">Record details for one baby or multiple babies and review follow-up through six months.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            ['Baby count', 'babyCount', 'number'], ['Birth date', 'birthDate', 'date'], ['Birth time', 'birthTime', 'time'], ['Birth weight (kg)', 'birthWeight', 'text'],
            ['Length (cm)', 'lengthCm', 'text'], ['Blood group', 'bloodGroup', 'text'], ['Breathing at birth', 'breathing', 'text'], ['First checkup', 'checkupStatus', 'text'],
          ].map(([label, key, type]) => (
            <label key={key} className="space-y-1 font-bold text-slate-700">
              <span>{label}</span>
              <input type={type} value={String(birthRecord[key as keyof typeof birthRecord])} onChange={(event) => setBirthRecord((previous) => ({ ...previous, [key]: type === 'number' ? Number(event.target.value) : event.target.value }))} className="w-full rounded-lg border border-slate-300 px-2.5 py-2 font-normal" />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[11px]">
          {['Within 24 hours', '3-5 days', '2 weeks', '6 weeks', '3 months', '6 months'].map((checkup) => <div key={checkup} className="rounded-xl border border-teal-200 bg-teal-50 p-2 text-teal-900 font-bold">{checkup}<br /><span className="font-normal">Exam, feeding, growth, breathing, and immunization review</span></div>)}
        </div>
      </div>

      {/* 2. HEMOGLOBIN LEVEL MAINTENANCE & IFA TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-black text-slate-900">Hemoglobin (Hb) Target Level</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Target: ≥ 11.0 g/dL
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">Current Mother Hb:</span>
              <span className="text-xl font-black text-slate-900">{currentHb} g/dL</span>
            </div>

            {/* Hb Progress Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex">
              <div className="h-full bg-rose-500 rounded-l-full" style={{ width: '30%' }} title="Severe Anemia (<7)" />
              <div className="h-full bg-amber-400" style={{ width: '30%' }} title="Moderate Anemia (7-10)" />
              <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: '40%' }} title="Normal (11+)" />
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Severe (&lt;7)</span>
              <span>Moderate (7-10)</span>
              <span className="text-emerald-700 font-black">Normal Target (11.0 - 13.0)</span>
            </div>
          </div>

          {/* Daily IFA Iron Tablet Card */}
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-950">Daily Iron & Folic Acid (IFA) Red Tablet</span>
              <button
                onClick={() => setTookIFAIronToday(!tookIFAIronToday)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  tookIFAIronToday
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-rose-700 border border-rose-300'
                }`}
              >
                {tookIFAIronToday ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span>{tookIFAIronToday ? 'Taken Today ✓' : 'Mark as Taken'}</span>
              </button>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Take 1 red IFA tablet daily starting from 14 weeks till 6 months after delivery. Take it with fresh lemon water or amla for better absorption. <strong>Never take iron with tea or milk</strong> as it blocks absorption.
            </p>
          </div>
        </div>

        {/* 3. DYNAMIC FOOD INTAKE CUSTOMIZED FOR WEEK 24 */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Apple className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-black text-slate-900">Customized Food Intake for Week {gestationWeek}</h3>
              <p className="text-xs text-slate-500">Modified dynamically according to fetal development requirements</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
              Priority Nutrients: {currentTrimesterData.nutrition.highlight}
            </span>
            <div className="space-y-2 pt-1">
              {currentTrimesterData.nutrition.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-800 font-semibold">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mt-2">
              <span className="font-bold text-amber-900 block mb-0.5">Strictly Avoid During This Period:</span>
              <p className="text-amber-800 text-[11px]">{currentTrimesterData.nutrition.avoid}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. NECESSARY MATERNAL CARE TIPS & PROCEDURES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              <span>Necessary Clinical Procedures & Diagnostic Scans for Trimester {trimester}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Government mandated Antenatal Care (ANC) checkups under Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA).
            </p>
          </div>
          <button
            onClick={onOpenReportScanner}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-xl font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-colors self-start"
          >
            <span>Scan Ultrasound / Lab Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTrimesterData.procedures.map((proc, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">{proc.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {proc.status}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{proc.note}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs space-y-1">
          <span className="font-black text-rose-950 block">Essential Village Maternal Advice:</span>
          <p className="text-rose-900 leading-relaxed">{currentTrimesterData.tips}</p>
        </div>
      </div>

      {/* 5. NEWBORN BABY CARE GUIDE (  ) */}
      <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-400/20 text-teal-300 px-3 py-0.5 rounded-full text-xs font-bold mb-2">
              <Baby className="w-4 h-4" />
              <span>Golden-Hour to 6 Months</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Complete Newborn Baby Care Guide (  )
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Crucial guidelines for rural families: saving newborn lives through immediate warmth, exclusive feeding, and infection control.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setNewbornTab('feeding')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                newbornTab === 'feeding' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Breastfeeding
            </button>
            <button
              onClick={() => setNewbornTab('cord')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                newbornTab === 'cord' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Umbilical Cord
            </button>
            <button
              onClick={() => setNewbornTab('warmth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                newbornTab === 'warmth' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Warmth & KMC
            </button>
            <button
              onClick={() => setNewbornTab('danger')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                newbornTab === 'danger' ? 'bg-rose-500 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Danger Signs
            </button>
          </div>
        </div>

        {/* Subtab Content */}
        {newbornTab === 'feeding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-teal-500/20 space-y-2">
              <h4 className="text-sm font-black text-teal-300">1. Golden Hour First Feed (Colostrum)</h4>
              <p className="text-slate-300 leading-relaxed">
                Feed baby within <strong>1 hour of birth</strong>. The first thick yellow milk (Colostrum / ) is the baby’s first natural vaccination, packed with life-saving antibodies. Never discard it.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-teal-500/20 space-y-2">
              <h4 className="text-sm font-black text-teal-300">2. Exclusive Breastfeeding for 6 Months</h4>
              <p className="text-slate-300 leading-relaxed">
                Give <strong>ONLY breastmilk</strong> for the first 6 full months. Do NOT give water, cow milk, goat milk, honey (ghutti), or gripe water. Breastmilk provides all water and nutrition needed.
              </p>
            </div>
          </div>
        )}

        {newbornTab === 'cord' && (
          <div className="p-4 bg-white/5 rounded-2xl border border-teal-500/20 text-xs space-y-2">
            <h4 className="text-sm font-black text-teal-300">Clean & Dry Umbilical Cord Care (  )</h4>
            <p className="text-slate-300 leading-relaxed">
              Keep the cord stump clean, dry, and loosely exposed to air. <strong>STRICT WARNING:</strong> Never apply cow dung, ash, oil, turmeric, or surma to the cord, as this is the leading cause of fatal neonatal tetanus in rural areas.
            </p>
          </div>
        )}

        {newbornTab === 'warmth' && (
          <div className="p-4 bg-white/5 rounded-2xl border border-teal-500/20 text-xs space-y-2">
            <h4 className="text-sm font-black text-teal-300">Kangaroo Mother Care (KMC) & Warmth</h4>
            <p className="text-slate-300 leading-relaxed">
              Keep the baby skin-to-skin against the mother’s bare chest. Cover both with a warm blanket. Wear cap and socks. Delay baby’s first bath until after 48 hours to prevent life-threatening hypothermia (cold stress).
            </p>
          </div>
        )}

        {newbornTab === 'danger' && (
          <div className="p-4 bg-rose-950/60 rounded-2xl border border-rose-500/40 text-xs space-y-2">
            <h4 className="text-sm font-black text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Immediate Newborn Danger Signs (Call 102/108 Ambulance)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
              <div className="p-2 bg-black/20 rounded-lg">• Unable to suckle / too weak to feed</div>
              <div className="p-2 bg-black/20 rounded-lg">• Fast breathing (&gt;60 breaths/min) or deep chest indrawing</div>
              <div className="p-2 bg-black/20 rounded-lg">• Baby feels very cold or has high fever</div>
              <div className="p-2 bg-black/20 rounded-lg">• Yellow palms & soles within first 24 hours (severe jaundice)</div>
              <div className="p-2 bg-black/20 rounded-lg">• Bleeding or pus discharge from umbilical cord</div>
              <div className="p-2 bg-black/20 rounded-lg">• Convulsions, fits, or abnormal lethargy</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            Have lab ultrasound reports or blood test results?
          </span>
          <button
            onClick={onNavigateToDoctorSummary}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>View Doctor Clinical Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
