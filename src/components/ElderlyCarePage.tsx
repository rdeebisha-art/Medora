import React, { useState } from 'react';
import { Activity, AlertTriangle, Heart, ShieldAlert, Sparkles, Volume2, CheckCircle2, XCircle, Pill, ArrowRight, UserCheck, Stethoscope, Footprints, Eye, Apple, HelpCircle } from 'lucide-react';
import { LanguageCode, FamilyMember } from '../types';
import { voiceService } from '../services/voiceService';

interface ElderlyCarePageProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToAI: () => void;
  onNavigateToDoctorSummary: () => void;
  onOpenReportScanner: () => void;
}

export const ElderlyCarePage: React.FC<ElderlyCarePageProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToAI,
  onNavigateToDoctorSummary,
  onOpenReportScanner,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [fastingSugar, setFastingSugar] = useState<number>(142);
  const [postPrandialSugar, setPostPrandialSugar] = useState<number>(210);
  const [bpSystolic, setBpSystolic] = useState<number>(154);
  const [bpDiastolic, setBpDiastolic] = useState<number>(92);
  const [simulatedReportCount, setSimulatedReportCount] = useState<number>(4);

  const elderMember = familyMembers.find(m => m.age >= 60) || familyMembers[0];

  const readPageOverview = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `Elderly Care Hub. For ${elderMember.name}, age ${elderMember.age}. Blood pressure is currently ${bpSystolic} over ${bpDiastolic}, indicating Stage 2 Hypertension. Fasting blood sugar is ${fastingSugar}. The AI summary recommends avoiding excess salt, pickles, and tobacco, while consuming soft ragi, steamed vegetables, and lentils. Fall risk precautions in bathrooms and night lighting are strongly advised.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 160 || dia >= 100) return { label: 'Stage 2 Hypertension (High Alert)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (sys >= 140 || dia >= 90) return { label: 'Stage 1 Hypertension (Requires Daily Med)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (sys >= 120 && dia < 80) return { label: 'Elevated BP (Monitor Salt Intake)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: 'Normal Healthy BP (Under 120/80)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const getSugarCategory = (fasting: number) => {
    if (fasting >= 160) return { label: 'High Hyperglycemia (Seek Doctor Review)', color: 'text-rose-700 bg-rose-50' };
    if (fasting >= 126) return { label: 'Diabetic Range (Take Metformin Regularly)', color: 'text-amber-800 bg-amber-50' };
    if (fasting >= 100) return { label: 'Impaired Fasting Glucose (Pre-diabetic)', color: 'text-yellow-800 bg-yellow-50' };
    return { label: 'Normal Fasting (70-99 mg/dL)', color: 'text-emerald-800 bg-emerald-50' };
  };

  const bpStatus = getBpCategory(bpSystolic, bpDiastolic);
  const sugarStatus = getSugarCategory(fastingSugar);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold">
              <Heart className="w-4 h-4 text-amber-300" />
              <span>Geriatric Village Longevity & Chronic Care</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Elderly Health Care Hub (  )
            </h1>
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Tailored for village elders: exact BP & blood sugar number tracking, unified AI report summarizer, home fall risk elimination, and dietary guidance on what to avoid and what to eat.
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
              onClick={onNavigateToAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Geriatric AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Profile Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-slate-800">Select Senior Member Profile:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFamilyId === m.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.age} yrs - {m.relationship})
            </button>
          ))}
        </div>
      </div>

      {/* 1. BLOOD SUGAR & BLOOD PRESSURE NUMBERS ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Blood Pressure Numbers & Risk Analysis */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-black text-slate-900">Blood Pressure ( )</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bpStatus.color}`}>
              {bpStatus.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
              <span className="text-xs font-bold text-rose-800 uppercase block mb-1">Systolic ( )</span>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(Number(e.target.value))}
                  className="text-3xl font-black text-rose-950 bg-transparent text-center w-24 border-b border-rose-300 focus:outline-none"
                />
                <span className="text-xs text-rose-700 font-bold">mmHg</span>
              </div>
              <span className="text-[10px] text-rose-700 mt-1 block">Normal: &lt;120 mmHg</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Diastolic ( )</span>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(Number(e.target.value))}
                  className="text-3xl font-black text-amber-950 bg-transparent text-center w-24 border-b border-amber-300 focus:outline-none"
                />
                <span className="text-xs text-amber-700 font-bold">mmHg</span>
              </div>
              <span className="text-[10px] text-amber-700 mt-1 block">Normal: &lt;80 mmHg</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>High BP Alert & Stroke () Danger Signs (FAST)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If BP stays above 160/100 and the elder experiences <strong>facial drooping, sudden arm weakness, or slurred speech</strong>, call <strong>108 Ambulance immediately</strong>. Never abruptly discontinue Telmisartan or Amlodipine tablets.
            </p>
          </div>
        </div>

        {/* Blood Sugar Analysis */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-black text-slate-900">Blood Sugar Analysis ( )</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 ${sugarStatus.color}`}>
              {sugarStatus.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-900 uppercase block mb-1">Fasting Sugar ( )</span>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={fastingSugar}
                  onChange={(e) => setFastingSugar(Number(e.target.value))}
                  className="text-3xl font-black text-amber-950 bg-transparent text-center w-24 border-b border-amber-300 focus:outline-none"
                />
                <span className="text-xs text-amber-700 font-bold">mg/dL</span>
              </div>
              <span className="text-[10px] text-amber-700 mt-1 block">Target: 70 – 120 mg/dL</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Post-Meal (  )</span>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={postPrandialSugar}
                  onChange={(e) => setPostPrandialSugar(Number(e.target.value))}
                  className="text-3xl font-black text-slate-900 bg-transparent text-center w-24 border-b border-slate-300 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-bold">mg/dL</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Target: &lt;160 mg/dL</span>
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-2">
            <span className="font-bold text-rose-900 block">Low Sugar (Hypoglycemia) First-Aid in Village:</span>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              If the elder suddenly feels <strong>shivering, dizziness, intense sweating, or disorientation</strong>, their sugar has dropped too low. Immediately feed them <strong>1 spoonful of sugar, jaggery (gur), or sweet tea</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 2. AI UNIFIED REPORT SUMMARY FOR ELDERS */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clinical Report Synthesizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              AI Summary of All Diagnostic Reports for {elderMember.name}
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated from {simulatedReportCount} recent lab reports, clinic prescriptions, and vital monitoring entries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportScanner}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
            >
              + Scan New Report
            </button>
            <button
              onClick={onNavigateToDoctorSummary}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1"
            >
              <span>View Doctor Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The AI synthesized findings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-extrabold text-amber-400 uppercase tracking-wider block">1. Cardiovascular & BP</span>
            <p className="text-slate-300 leading-relaxed">
              Consistently shows Systolic BP spikes (150-165 mmHg) during mornings. Left ventricular hypertrophy signs noted on last ECG. Daily Amlodipine 5mg adherence is at 92%.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-extrabold text-amber-400 uppercase tracking-wider block">2. Diabetes & Kidney Filter</span>
            <p className="text-slate-300 leading-relaxed">
              HbA1c of 7.8% indicates moderate chronic glycemic load. Serum Creatinine is 1.1 mg/dL (Normal). Urine microalbumin is negative. Continue Metformin 500mg after dinner.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-extrabold text-amber-400 uppercase tracking-wider block">3. Bone, Joint & Mobility</span>
            <p className="text-slate-300 leading-relaxed">
              Bilateral knee Osteoarthritis (Grade 2). High fall risk identified due to knee stiffness and reduced night vision. Daily Calcium + Vitamin D3 supplements recommended.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span>
            💡 <strong>Plain-Language Village Translation:</strong> "             ,     ,       "
          </span>
          <button
            onClick={() => voiceService.speak('Blood pressure and blood sugar are slightly high. Take medicines on schedule, reduce salt and tobacco, and use a light at night to prevent falls.', currentLang)}
            className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span> (Listen)</span>
          </button>
        </div>
      </div>

      {/* 3. HIGHEST FALLING RISKS INSTRUCTIONS & PREVENTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-rose-600" />
            <h3 className="text-xl font-black text-slate-900">Highest Falling Risks & Village Home Safety Instructions</h3>
          </div>
          <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full border border-rose-300">
            Crucial for Seniors 65+
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Falls in elderly village citizens cause fatal hip fractures, head trauma, and permanent bedridden disability. Follow these 5 essential village safety rules:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Bathroom Anti-Skid Mats</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Village wet-floor latrines cause 60% of senior falls. Install rough rubber mats and sturdy bamboo or metal wall-grab rails.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Night Torch / Bedside Lamp</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Elders waking up for night urination in the dark often trip over doorways. Keep a charging LED torch within arm's reach of the bed.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Proper Footwear & Dhoti Care</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Avoid slippery plastic slippers or walking in socks on smooth tiles. Ensure dhotis and sarees are tied above ankle level to prevent tripping.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Four-Legged Walking Cane</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Provide an affordable four-legged rubber-tipped walking stick for outdoor farm paths and unpaved village lanes.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>5. Eye Cataract Screening</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Get annual free cataract eye checks at the District Civil Hospital. Poor vision is the primary hidden reason for tripping.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>6. Gentle Seated Knee Stretches</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              10 minutes of seated leg lifts strengthens thigh quadriceps muscles, preventing sudden knee buckling while walking.
            </p>
          </div>
        </div>
      </div>

      {/* 4. ELDER DIET: WHAT TO AVOID VS WHAT TO EAT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* What to Avoid */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-black text-rose-950">Diet for Elders: WHAT TO AVOID (  )</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-start gap-2.5">
              <span className="font-black text-rose-700 shrink-0">❌</span>
              <div>
                <strong className="text-rose-900 font-bold block">Excess Salt, Pickles () & Papad:</strong>
                <span className="text-slate-600 text-[11px]">Directly causes dangerous surges in blood pressure and heart strain.</span>
              </div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-start gap-2.5">
              <span className="font-black text-rose-700 shrink-0">❌</span>
              <div>
                <strong className="text-rose-900 font-bold block">Deep-Fried Snacks (, ):</strong>
                <span className="text-slate-600 text-[11px]">Hard to digest, spikes cholesterol, and triggers severe acid reflux.</span>
              </div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-start gap-2.5">
              <span className="font-black text-rose-700 shrink-0">❌</span>
              <div>
                <strong className="text-rose-900 font-bold block">Refined Sugar Sweets (, ) & Sweet Tea:</strong>
                <span className="text-slate-600 text-[11px]">Causes acute hyperglycemia, blurry vision, and kidney overload.</span>
              </div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-start gap-2.5">
              <span className="font-black text-rose-700 shrink-0">❌</span>
              <div>
                <strong className="text-rose-900 font-bold block">Bidi, Hookah & Chewing Gutka/Khaini:</strong>
                <span className="text-slate-600 text-[11px]">Stiffens blood arteries and causes heart attacks, paralysis, and oral cancer.</span>
              </div>
            </div>
          </div>
        </div>

        {/* What to Eat */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-emerald-950">Diet for Elders: WHAT TO EAT ( )</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="font-black text-emerald-700 shrink-0">✅</span>
              <div>
                <strong className="text-emerald-900 font-bold block">Finger Millet Porridge (  / ):</strong>
                <span className="text-slate-600 text-[11px]">Extremely high in calcium for aging bones, low glycemic index for diabetes.</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="font-black text-emerald-700 shrink-0">✅</span>
              <div>
                <strong className="text-emerald-900 font-bold block">Soft Steamed Khichdi & Moong Dal:</strong>
                <span className="text-slate-600 text-[11px]">Gentle on older digestive tracts and teeth while providing restorative protein.</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="font-black text-emerald-700 shrink-0">✅</span>
              <div>
                <strong className="text-emerald-900 font-bold block">Boiled Bottle Gourd (), Pumpkin & Papaya:</strong>
                <span className="text-slate-600 text-[11px]">High natural water and soluble fiber prevents stubborn constipation.</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="font-black text-emerald-700 shrink-0">✅</span>
              <div>
                <strong className="text-emerald-900 font-bold block">Fresh Buttermilk () & Warm Boiled Water:</strong>
                <span className="text-slate-600 text-[11px]">Promotes healthy gut microbiome and prevents silent geriatric dehydration.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
