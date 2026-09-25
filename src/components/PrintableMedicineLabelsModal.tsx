import React, { useState, useRef } from 'react';
import {
  X, Printer, Volume2, Sun, Moon, Sunrise, Sunset, Utensils,
  Pill, Heart, Activity, Thermometer, Shield, Sparkles, Check,
  Sliders, Grid, FileText, Info
} from 'lucide-react';
import { Medicine } from '../db/db';
import { useAppStore } from '../store/useAppStore';

export interface VisualMedicineConfig {
  id: string | number;
  medicineName: string;
  doseText: string;
  pillShape: 'round' | 'capsule' | 'oval' | 'syrup' | 'drops';
  pillColor: string;
  pillCount: number; // 0.5, 1, 2, 3
  timingSlots: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  mealRelation: 'before_meal' | 'after_meal' | 'with_meal';
  bodyCondition: 'fever' | 'heart' | 'sugar' | 'stomach' | 'lungs' | 'vitamins' | 'general';
  warningNote?: string;
  doctorName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  initialSelectedMedicineId?: number;
}

// Helper to deduce initial visual traits from text
export function deduceVisualTraits(med: Medicine): VisualMedicineConfig {
  const nameLower = med.name.toLowerCase();
  const instLower = (med.instructions || '').toLowerCase();
  const freqLower = (med.frequency || '').toLowerCase();
  const doseLower = (med.dose || '').toLowerCase();

  // Deduce condition
  let bodyCondition: VisualMedicineConfig['bodyCondition'] = 'general';
  if (/paracetamol|dolo|crocin|calpol|fever|headache|pain|pcm/i.test(nameLower)) {
    bodyCondition = 'fever';
  } else if (/amlodipine|telmisartan|atenolol|bp|heart|hypertension|cardio/i.test(nameLower)) {
    bodyCondition = 'heart';
  } else if (/metformin|glimepiride|insulin|sugar|diabetes/i.test(nameLower)) {
    bodyCondition = 'sugar';
  } else if (/pantoprazole|omeprazole|antacid|gelusil|acidity|gas|digestion/i.test(nameLower)) {
    bodyCondition = 'stomach';
  } else if (/cetirizine|cough|ascoril|cold|lungs|asthma|inhaler/i.test(nameLower)) {
    bodyCondition = 'lungs';
  } else if (/iron|folic|ferrous|calcium|vitamin|becosules|zinc/i.test(nameLower)) {
    bodyCondition = 'vitamins';
  }

  // Deduce shape
  let pillShape: VisualMedicineConfig['pillShape'] = 'round';
  if (/syrup|suspension|tonic|liquid|ml/i.test(nameLower) || /syrup|ml/i.test(doseLower)) {
    pillShape = 'syrup';
  } else if (/drops|eye drops|ear drops/i.test(nameLower)) {
    pillShape = 'drops';
  } else if (/capsule|cap|amoxicillin|omeprazole/i.test(nameLower)) {
    pillShape = 'capsule';
  } else if (/metformin|paracetamol|telmisartan/i.test(nameLower)) {
    pillShape = 'oval';
  }

  // Deduce color
  let pillColor = '#EF4444'; // Red default
  if (bodyCondition === 'fever') pillColor = '#EF4444'; // Red
  else if (bodyCondition === 'heart') pillColor = '#3B82F6'; // Blue
  else if (bodyCondition === 'sugar') pillColor = '#F59E0B'; // Amber
  else if (bodyCondition === 'stomach') pillColor = '#EC4899'; // Pink
  else if (bodyCondition === 'vitamins') pillColor = '#10B981'; // Green
  else if (bodyCondition === 'lungs') pillColor = '#06B6D4'; // Cyan
  else pillColor = '#6366F1'; // Indigo

  // Deduce pill count
  let pillCount = 1;
  if (/half|1\/2|0\.5/i.test(doseLower) || /half|1\/2/i.test(instLower)) {
    pillCount = 0.5;
  } else if (/2 tablet|2 pill|two|2 tab/i.test(doseLower) || /2 tab|2 pill/i.test(instLower)) {
    pillCount = 2;
  } else if (/3 tab|3 pill|three/i.test(doseLower)) {
    pillCount = 3;
  }

  // Deduce meal relation
  let mealRelation: VisualMedicineConfig['mealRelation'] = 'after_meal';
  if (/before|empty stomach|empty|prior/i.test(instLower) || /before/i.test(nameLower)) {
    mealRelation = 'before_meal';
  } else if (/with meal|with food|during/i.test(instLower)) {
    mealRelation = 'with_meal';
  }

  // Deduce timing slots
  const morning = /morning|breakfast|once|daily|twice|thrice|8:00 am|9:00 am/i.test(freqLower) ||
    /morning/i.test(instLower) ||
    (med.times && med.times.some(t => /am/i.test(t)));

  const afternoon = /afternoon|lunch|thrice|midday|1:00 pm|2:00 pm/i.test(freqLower) ||
    /afternoon|lunch/i.test(instLower);

  const evening = /evening|tea|5:00 pm|6:00 pm/i.test(freqLower) ||
    /evening/i.test(instLower);

  const night = /night|bedtime|dinner|twice|thrice|8:00 pm|9:00 pm/i.test(freqLower) ||
    /night|bed/i.test(instLower) ||
    (med.times && med.times.some(t => /pm/i.test(t) && !/12:|1:|2:/i.test(t)));

  return {
    id: med.id || Math.random(),
    medicineName: med.name,
    doseText: med.dose || '1 dose',
    pillShape,
    pillColor,
    pillCount,
    timingSlots: {
      morning: morning || (!afternoon && !evening && !night),
      afternoon,
      evening,
      night: night || /twice|thrice/i.test(freqLower),
    },
    mealRelation,
    bodyCondition,
    warningNote: med.instructions || 'Take as advised by clinic',
    doctorName: med.doctor || 'Primary Health Centre',
  };
}

export default function PrintableMedicineLabelsModal({
  isOpen,
  onClose,
  medicines,
  initialSelectedMedicineId,
}: Props) {
  const { language, currentUser } = useAppStore();
  const [viewMode, setViewMode] = useState<'stickers' | 'chart' | 'customizer'>('stickers');
  const [configs, setConfigs] = useState<VisualMedicineConfig[]>([]);
  const [activeEditIndex, setActiveEditIndex] = useState<number>(0);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Initialize configs from medicines list
  React.useEffect(() => {
    if (medicines.length > 0) {
      const parsed = medicines.map(deduceVisualTraits);
      setConfigs(parsed);
      if (initialSelectedMedicineId) {
        const foundIdx = parsed.findIndex(p => p.id === initialSelectedMedicineId);
        if (foundIdx >= 0) setActiveEditIndex(foundIdx);
      }
    }
  }, [medicines, initialSelectedMedicineId]);

  if (!isOpen) return null;

  // Speak low-literacy instructions in patient's language
  const handleSpeakInstruction = (cfg: VisualMedicineConfig) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    let timePhrases: string[] = [];
    if (cfg.timingSlots.morning) timePhrases.push('Morning');
    if (cfg.timingSlots.afternoon) timePhrases.push('Afternoon');
    if (cfg.timingSlots.evening) timePhrases.push('Evening');
    if (cfg.timingSlots.night) timePhrases.push('Night');

    const mealText = cfg.mealRelation === 'before_meal' ? 'before food' : cfg.mealRelation === 'after_meal' ? 'after food' : 'with food';
    const doseDesc = cfg.pillCount === 0.5 ? 'half tablet' : `${cfg.pillCount} ${cfg.pillShape}`;

    let speechText = '';
    let voiceLang = 'en-IN';

    if (language === 'ta') {
      voiceLang = 'ta-IN';
      const timesTa = timePhrases.map(t => t === 'Morning' ? 'காலையில்' : t === 'Afternoon' ? 'மதியத்தில்' : t === 'Evening' ? 'மாலையில்' : 'இரவில்').join(', ');
      const mealTa = cfg.mealRelation === 'before_meal' ? 'சாப்பாட்டிற்கு முன்' : 'சாப்பிட்ட பிறகு';
      speechText = `${cfg.medicineName}. ${timesTa}, ${mealTa}, ${cfg.pillCount === 0.5 ? 'அரை மாத்திரை' : cfg.pillCount + ' மாத்திரை'} சாப்பிடவும்.`;
    } else if (language === 'hi') {
      voiceLang = 'hi-IN';
      const timesHi = timePhrases.map(t => t === 'Morning' ? 'सुबह' : t === 'Afternoon' ? 'दोपहर' : t === 'Evening' ? 'शाम' : 'रात को').join(', ');
      const mealHi = cfg.mealRelation === 'before_meal' ? 'खाने से पहले' : 'खाने के बाद';
      speechText = `${cfg.medicineName}. ${timesHi}, ${mealHi}, ${cfg.pillCount === 0.5 ? 'आधी गोली' : cfg.pillCount + ' गोली'} लें.`;
    } else if (language === 'te') {
      voiceLang = 'te-IN';
      const timesTe = timePhrases.map(t => t === 'Morning' ? 'ఉదయం' : t === 'Afternoon' ? 'మధ్యాహ్నం' : t === 'Evening' ? 'సాయంత్రం' : 'రాత్రి').join(', ');
      const mealTe = cfg.mealRelation === 'before_meal' ? 'భోజనానికి ముందు' : 'భోజనం తర్వాత';
      speechText = `${cfg.medicineName}. ${timesTe}, ${mealTe}, ${cfg.pillCount === 0.5 ? 'సగం మాత్ర' : cfg.pillCount + ' మాత్ర'} వేసుకోండి.`;
    } else {
      speechText = `Medicine: ${cfg.medicineName}. Take ${doseDesc} ${mealText}, in the ${timePhrases.join(' and ')}.`;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = voiceLang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const activeConfig = configs[activeEditIndex] || configs[0];

  const updateActiveConfig = (updates: Partial<VisualMedicineConfig>) => {
    setConfigs(prev => prev.map((cfg, idx) => idx === activeEditIndex ? { ...cfg, ...updates } : cfg));
  };

  // Render Visual Pill Graphics
  const renderPillGraphic = (cfg: VisualMedicineConfig) => {
    const { pillShape, pillColor, pillCount } = cfg;

    if (pillShape === 'syrup') {
      return (
        <div className="flex items-center gap-2">
          {/* Bottle */}
          <div className="relative w-8 h-12 bg-amber-100 border-2 border-amber-800 rounded-b-lg flex flex-col items-center justify-end overflow-hidden shadow-xs">
            <div className="absolute top-0 w-4 h-2 bg-amber-800 rounded-t-xs" />
            <div className="w-full bg-amber-500/80 h-3/4 rounded-b-sm border-t border-amber-600 flex items-center justify-center">
              <span className="text-[7px] font-black text-white">SYRUP</span>
            </div>
          </div>
          {/* Spoon with liquid */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-4 rounded-full border-2 border-slate-600 bg-amber-400 relative shadow-2xs">
              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-amber-950">5ml</span>
            </div>
            <div className="w-1.5 h-6 bg-slate-500 rounded-b-md -mt-1" />
          </div>
        </div>
      );
    }

    if (pillShape === 'drops') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-11 bg-cyan-100 border-2 border-cyan-800 rounded-b-lg flex flex-col items-center relative">
            <div className="w-3 h-3 bg-cyan-800 rounded-t-full -top-1.5 absolute" />
            <div className="w-full bg-cyan-500 h-2/3 mt-auto rounded-b-sm flex items-center justify-center">
              <span className="text-[7px] text-white font-bold">DROPS</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-cyan-600">
            <div className="w-2.5 h-3.5 bg-cyan-500 rounded-t-full rounded-b-full shadow-2xs animate-pulse" />
            <span className="text-[9px] font-black text-slate-700 mt-1">2 drops</span>
          </div>
        </div>
      );
    }

    // Render 0.5, 1, 2, or 3 tablets / capsules
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {pillCount === 0.5 ? (
          <div className="relative group">
            {/* Half split pill */}
            <div
              className="w-8 h-4 rounded-t-full border-2 border-slate-900 shadow-xs flex items-center justify-center"
              style={{ backgroundColor: pillColor }}
            >
              <span className="text-[8px] font-black text-white">½</span>
            </div>
            <div className="border-t-2 border-dashed border-red-600 w-8" />
            <span className="text-[8px] font-extrabold text-slate-800 block text-center mt-0.5">HALF</span>
          </div>
        ) : (
          Array.from({ length: Math.min(3, Math.max(1, pillCount)) }).map((_, i) => (
            <div
              key={i}
              className={`border-2 border-slate-900 shadow-sm flex items-center justify-center transition-transform ${
                pillShape === 'capsule'
                  ? 'w-10 h-5 rounded-full'
                  : pillShape === 'oval'
                  ? 'w-9 h-6 rounded-2xl'
                  : 'w-7 h-7 rounded-full'
              }`}
              style={{ backgroundColor: pillColor }}
            >
              {pillShape === 'capsule' ? (
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full rounded-l-full bg-white/40 border-r border-slate-900/40" />
                  <div className="w-1/2 h-full rounded-r-full" />
                </div>
              ) : (
                <div className="w-full h-0.5 bg-slate-900/30" />
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  // Render Target Condition Visual Icon
  const renderConditionIcon = (cond: VisualMedicineConfig['bodyCondition']) => {
    switch (cond) {
      case 'fever':
        return (
          <div className="flex items-center gap-1 bg-red-100 border border-red-300 text-red-800 px-2 py-1 rounded-lg">
            <Thermometer className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-black uppercase">Fever / Pain</span>
          </div>
        );
      case 'heart':
        return (
          <div className="flex items-center gap-1 bg-blue-100 border border-blue-300 text-blue-800 px-2 py-1 rounded-lg">
            <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span className="text-[10px] font-black uppercase">BP / Heart</span>
          </div>
        );
      case 'sugar':
        return (
          <div className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-800 px-2 py-1 rounded-lg">
            <Activity className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-black uppercase">Sugar / Diabetes</span>
          </div>
        );
      case 'stomach':
        return (
          <div className="flex items-center gap-1 bg-pink-100 border border-pink-300 text-pink-800 px-2 py-1 rounded-lg">
            <Shield className="w-4 h-4 text-pink-600" />
            <span className="text-[10px] font-black uppercase">Acidity / Stomach</span>
          </div>
        );
      case 'lungs':
        return (
          <div className="flex items-center gap-1 bg-cyan-100 border border-cyan-300 text-cyan-800 px-2 py-1 rounded-lg">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px] font-black uppercase">Cough / Breathing</span>
          </div>
        );
      case 'vitamins':
        return (
          <div className="flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-1 rounded-lg">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase">Vitamins / Strength</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-purple-100 border border-purple-300 text-purple-800 px-2 py-1 rounded-lg">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-black uppercase">Health Care</span>
          </div>
        );
    }
  };

  // Render Visual Meal Icon
  const renderMealTimingIcon = (timing: VisualMedicineConfig['mealRelation']) => {
    if (timing === 'before_meal') {
      return (
        <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-400 text-amber-950 px-2.5 py-1.5 rounded-xl">
          {/* Pill THEN plate */}
          <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-900" />
          <span className="text-xs font-black">➔</span>
          <Utensils className="w-4 h-4 text-slate-700" />
          <div className="leading-tight">
            <span className="text-[10px] font-black uppercase block text-amber-900">BEFORE FOOD</span>
            <span className="text-[8px] text-amber-700">Empty stomach / 30m prior</span>
          </div>
        </div>
      );
    }

    if (timing === 'with_meal') {
      return (
        <div className="flex items-center gap-1.5 bg-blue-50 border-2 border-blue-400 text-blue-950 px-2.5 py-1.5 rounded-xl">
          <Utensils className="w-4 h-4 text-blue-700" />
          <span className="text-xs font-black">+</span>
          <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-900" />
          <div className="leading-tight">
            <span className="text-[10px] font-black uppercase block text-blue-900">WITH MEAL</span>
            <span className="text-[8px] text-blue-700">Eat together with food</span>
          </div>
        </div>
      );
    }

    // Default: After meal
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 px-2.5 py-1.5 rounded-xl">
        <Utensils className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-black">➔</span>
        <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-950" />
        <div className="leading-tight">
          <span className="text-[10px] font-black uppercase block text-emerald-900">AFTER FOOD</span>
          <span className="text-[8px] text-emerald-700">Full stomach / post-meal</span>
        </div>
      </div>
    );
  };

  // Render Time-of-Day Visual Indicators (Sunrise, Midday Sun, Sunset, Bedtime Moon)
  const renderTimeDials = (slots: VisualMedicineConfig['timingSlots']) => {
    return (
      <div className="grid grid-cols-4 gap-1 w-full text-center">
        {/* Morning */}
        <div
          className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            slots.morning
              ? 'bg-amber-100 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
              : 'bg-slate-100/60 border-slate-200 text-slate-300 opacity-40'
          }`}
        >
          <Sunrise className={`w-5 h-5 mb-0.5 ${slots.morning ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="text-[9px] font-black tracking-tight leading-tight">MORNING</span>
          <span className="text-[7px]">🌅 7-9 AM</span>
          {slots.morning && <Check className="w-3 h-3 text-amber-700 mt-0.5 stroke-[3]" />}
        </div>

        {/* Afternoon */}
        <div
          className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            slots.afternoon
              ? 'bg-orange-100 border-orange-500 text-orange-950 font-black shadow-xs ring-2 ring-orange-300'
              : 'bg-slate-100/60 border-slate-200 text-slate-300 opacity-40'
          }`}
        >
          <Sun className={`w-5 h-5 mb-0.5 ${slots.afternoon ? 'text-orange-600' : 'text-slate-400'}`} />
          <span className="text-[9px] font-black tracking-tight leading-tight">AFTERNOON</span>
          <span className="text-[7px]">☀️ 1-2 PM</span>
          {slots.afternoon && <Check className="w-3 h-3 text-orange-700 mt-0.5 stroke-[3]" />}
        </div>

        {/* Evening */}
        <div
          className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            slots.evening
              ? 'bg-rose-100 border-rose-500 text-rose-950 font-black shadow-xs ring-2 ring-rose-300'
              : 'bg-slate-100/60 border-slate-200 text-slate-300 opacity-40'
          }`}
        >
          <Sunset className={`w-5 h-5 mb-0.5 ${slots.evening ? 'text-rose-600' : 'text-slate-400'}`} />
          <span className="text-[9px] font-black tracking-tight leading-tight">EVENING</span>
          <span className="text-[7px]">🌇 5-6 PM</span>
          {slots.evening && <Check className="w-3 h-3 text-rose-700 mt-0.5 stroke-[3]" />}
        </div>

        {/* Night */}
        <div
          className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            slots.night
              ? 'bg-indigo-100 border-indigo-600 text-indigo-950 font-black shadow-xs ring-2 ring-indigo-300'
              : 'bg-slate-100/60 border-slate-200 text-slate-300 opacity-40'
          }`}
        >
          <Moon className={`w-5 h-5 mb-0.5 ${slots.night ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className="text-[9px] font-black tracking-tight leading-tight">NIGHT</span>
          <span className="text-[7px]">🌙 8-10 PM</span>
          {slots.night && <Check className="w-3 h-3 text-indigo-700 mt-0.5 stroke-[3]" />}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Global Print Style for Low-Literacy Medicine Labels */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-labels-container, #printable-labels-container * {
            visibility: visible !important;
          }
          #printable-labels-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .label-cut-box {
            border: 2px dashed #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Modal Top Bar (Screen Only) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  Visual Medicine Label Generator
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LOW-LITERACY ACCESSIBLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Universal image-based pictograms, sun/moon dials, meal markers, and pill counts for rural patients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Labels</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Screen Only) */}
        <div className="no-print bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('stickers')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'stickers'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Bottle & Strip Stickers</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'chart'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Daily Routine Wall Chart</span>
            </button>
            <button
              onClick={() => setViewMode('customizer')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'customizer'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visual Cue Customizer</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Prescription labels auto-deduced from clinical records</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60">
          
          {/* CUSTOMIZER MODE (Allows modifying colors, pill shape, pill count, time dials) */}
          {viewMode === 'customizer' && (
            <div className="space-y-6">
              {/* Medicine Selector */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Medicine to Customize Visual Pictograms:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {configs.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveEditIndex(i)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 shrink-0 ${
                        activeEditIndex === i
                          ? 'bg-teal-600 border-teal-400 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.pillColor }} />
                      <span>{c.medicineName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeConfig && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 border border-slate-800 p-5 rounded-3xl">
                  {/* Controls */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Target Health Condition (Icon)</label>
                      <select
                        value={activeConfig.bodyCondition}
                        onChange={(e) => updateActiveConfig({ bodyCondition: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="fever">🌡️ Fever / Headache / Pain</option>
                        <option value="heart">❤️ Heart / Blood Pressure (BP)</option>
                        <option value="sugar">🩸 Sugar / Diabetes</option>
                        <option value="stomach">🥣 Stomach / Acidity / Gas</option>
                        <option value="lungs">🫁 Lungs / Cough / Breathing</option>
                        <option value="vitamins">💊 Vitamins / Calcium / Strength</option>
                        <option value="general">🛡️ General Health Care</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Physical Form / Shape</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'round', label: 'Round Tablet' },
                          { val: 'capsule', label: 'Capsule' },
                          { val: 'oval', label: 'Oval Tablet' },
                          { val: 'syrup', label: 'Liquid / Syrup' },
                          { val: 'drops', label: 'Drops' },
                        ].map((s) => (
                          <button
                            key={s.val}
                            type="button"
                            onClick={() => updateActiveConfig({ pillShape: s.val as any })}
                            className={`p-2 rounded-xl border text-center font-bold transition-all ${
                              activeConfig.pillShape === s.val
                                ? 'bg-teal-600 border-teal-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Physical Pill Color</label>
                      <div className="flex gap-2 items-center flex-wrap">
                        {[
                          { col: '#EF4444', name: 'Red' },
                          { col: '#3B82F6', name: 'Blue' },
                          { col: '#F59E0B', name: 'Yellow' },
                          { col: '#10B981', name: 'Green' },
                          { col: '#EC4899', name: 'Pink' },
                          { col: '#8B5CF6', name: 'Purple' },
                          { col: '#FFFFFF', name: 'White' },
                          { col: '#F97316', name: 'Orange' },
                        ].map((c) => (
                          <button
                            key={c.col}
                            type="button"
                            onClick={() => updateActiveConfig({ pillColor: c.col })}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform ${
                              activeConfig.pillColor === c.col ? 'scale-125 border-white ring-2 ring-teal-400' : 'border-slate-600'
                            }`}
                            style={{ backgroundColor: c.col }}
                            title={c.name}
                          >
                            {activeConfig.pillColor === c.col && (
                              <Check className={`w-3.5 h-3.5 ${c.col === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Dose Count (Pills to Take)</label>
                      <div className="flex gap-2">
                        {[0.5, 1, 2, 3].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => updateActiveConfig({ pillCount: cnt })}
                            className={`flex-1 py-2 rounded-xl font-black border text-center transition-all ${
                              activeConfig.pillCount === cnt
                                ? 'bg-teal-600 border-teal-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cnt === 0.5 ? '½ (Half)' : `${cnt} ${cnt > 1 ? 'Pills' : 'Pill'}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Meal Relationship</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'before_meal', label: 'Before Food' },
                          { val: 'after_meal', label: 'After Food' },
                          { val: 'with_meal', label: 'With Meal' },
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => updateActiveConfig({ mealRelation: m.val as any })}
                            className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                              activeConfig.mealRelation === m.val
                                ? 'bg-teal-600 border-teal-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Times of Day (Tap to Toggle)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: 'morning', label: '🌅 Morning' },
                          { key: 'afternoon', label: '☀️ Noon' },
                          { key: 'evening', label: '🌇 Evening' },
                          { key: 'night', label: '🌙 Night' },
                        ].map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() =>
                              updateActiveConfig({
                                timingSlots: {
                                  ...activeConfig.timingSlots,
                                  [t.key]: !(activeConfig.timingSlots as any)[t.key],
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-center font-bold text-[10px] transition-all ${
                              (activeConfig.timingSlots as any)[t.key]
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-teal-400 font-bold mb-3 uppercase tracking-wider">
                      Live Label Preview
                    </span>
                    <div className="w-full max-w-sm bg-white text-slate-950 p-4 rounded-2xl shadow-xl border-4 border-slate-800">
                      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
                        <div>
                          <h4 className="font-black text-base text-slate-900 leading-tight">
                            {activeConfig.medicineName}
                          </h4>
                          <span className="text-xs text-slate-600 font-bold">
                            {activeConfig.doseText}
                          </span>
                        </div>
                        {renderConditionIcon(activeConfig.bodyCondition)}
                      </div>

                      <div className="flex items-center justify-between gap-4 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-500">Pills to take:</span>
                          <div className="mt-1">{renderPillGraphic(activeConfig)}</div>
                        </div>
                        <div>{renderMealTimingIcon(activeConfig.mealRelation)}</div>
                      </div>

                      {renderTimeDials(activeConfig.timingSlots)}
                    </div>

                    <button
                      onClick={() => handleSpeakInstruction(activeConfig)}
                      className="mt-4 flex items-center gap-1.5 text-xs text-teal-300 hover:text-white font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700"
                    >
                      <Volume2 className="w-4 h-4 text-teal-400" />
                      <span>Test Speech Readout (Audio)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRINTABLE CONTAINER (Stickers & Daily Wall Chart) */}
          <div ref={printAreaRef} id="printable-labels-container" className="space-y-6">
            
            {/* Header info for printed sheet */}
            <div className="bg-white text-slate-900 p-4 rounded-2xl border-2 border-slate-900 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏥</span>
                  <h1 className="text-lg font-black tracking-tight">MEDORA RURAL HEALTHCARE • PRESCRIPTION VISUAL AID</h1>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Patient: <span className="text-slate-950 font-black">{currentUser?.name || 'Primary Beneficiary'}</span> • Village: {currentUser?.village || 'Rampur'} • Issued: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-md border border-emerald-300 block">
                  IMAGE-BASED PRESCRIPTION
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">Cut along dashed borders & stick on packaging</span>
              </div>
            </div>

            {/* STICKERS VIEW: Grid of Individual Medicine Labels */}
            {viewMode === 'stickers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="label-cut-box bg-white text-slate-950 rounded-2xl p-4 border-2 border-dashed border-slate-400 shadow-sm relative flex flex-col justify-between"
                  >
                    {/* Cut Marker indicator */}
                    <div className="no-print absolute -top-2.5 right-4 bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-700">
                      ✂️ Cut & Paste onto medicine box
                    </div>

                    {/* Top: Medicine Name & Target Condition */}
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b-2 border-slate-900 pb-2 mb-2.5">
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {cfg.medicineName}
                          </h3>
                          <span className="text-xs text-slate-600 font-bold">
                            Dose: {cfg.doseText}
                          </span>
                        </div>
                        {renderConditionIcon(cfg.bodyCondition)}
                      </div>

                      {/* Middle: Pill Graphic Count & Meal Relation */}
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-slate-500">TAKE THIS AMOUNT:</span>
                          <div className="mt-1 flex items-center gap-2">
                            {renderPillGraphic(cfg)}
                            <span className="text-xs font-black text-slate-800">
                              {cfg.pillCount === 0.5 ? '½ tablet' : `${cfg.pillCount} pill`}
                            </span>
                          </div>
                        </div>
                        <div>
                          {renderMealTimingIcon(cfg.mealRelation)}
                        </div>
                      </div>

                      {/* Bottom: Sun/Moon dials */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-500 block mb-1">WHEN TO TAKE:</span>
                        {renderTimeDials(cfg.timingSlots)}
                      </div>
                    </div>

                    {/* Footer strip: Audio reader & Doctor note */}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Prescribed by: {cfg.doctorName}</span>
                      <button
                        onClick={() => handleSpeakInstruction(cfg)}
                        className="no-print text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                        title="Listen to instructions in your language"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen Audio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DAILY ROUTINE WALL CHART: A Full-Page Matrix Divided into Morning / Noon / Evening / Night */}
            {viewMode === 'chart' && (
              <div className="bg-white text-slate-950 p-4 rounded-2xl border-2 border-slate-900 shadow-sm space-y-4">
                <div className="text-center border-b-2 border-slate-900 pb-2">
                  <h3 className="text-lg font-black tracking-tight text-slate-900">
                    DAILY MEDICINE WALL TIMETABLE (दैनिक दवा चार्ट)
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Hang on the kitchen or bedroom wall • Follow the sun & moon symbols
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* 1. MORNING COLUMN */}
                  <div className="border-2 border-amber-400 bg-amber-50/50 rounded-2xl p-3 flex flex-col space-y-3">
                    <div className="text-center border-b-2 border-amber-300 pb-2 bg-amber-100 rounded-xl p-2">
                      <Sunrise className="w-7 h-7 text-amber-700 mx-auto mb-1" />
                      <h4 className="font-black text-sm text-amber-950">1. MORNING (सुबह)</h4>
                      <span className="text-[10px] font-bold text-amber-800">🌅 7:00 AM - 9:00 AM</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {configs.filter(c => c.timingSlots.morning).length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          No morning medicines
                        </div>
                      ) : (
                        configs.filter(c => c.timingSlots.morning).map(c => (
                          <div key={c.id} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 truncate">{c.medicineName}</span>
                              {renderPillGraphic(c)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Take: {c.pillCount} pill</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                                {c.mealRelation === 'before_meal' ? 'Before Food' : 'After Food'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 2. AFTERNOON COLUMN */}
                  <div className="border-2 border-orange-400 bg-orange-50/50 rounded-2xl p-3 flex flex-col space-y-3">
                    <div className="text-center border-b-2 border-orange-300 pb-2 bg-orange-100 rounded-xl p-2">
                      <Sun className="w-7 h-7 text-orange-600 mx-auto mb-1" />
                      <h4 className="font-black text-sm text-orange-950">2. NOON (दोपहर)</h4>
                      <span className="text-[10px] font-bold text-orange-800">☀️ 1:00 PM - 2:00 PM</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {configs.filter(c => c.timingSlots.afternoon).length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          No afternoon medicines
                        </div>
                      ) : (
                        configs.filter(c => c.timingSlots.afternoon).map(c => (
                          <div key={c.id} className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 truncate">{c.medicineName}</span>
                              {renderPillGraphic(c)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Take: {c.pillCount} pill</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                                {c.mealRelation === 'before_meal' ? 'Before Food' : 'After Food'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 3. EVENING COLUMN */}
                  <div className="border-2 border-rose-400 bg-rose-50/50 rounded-2xl p-3 flex flex-col space-y-3">
                    <div className="text-center border-b-2 border-rose-300 pb-2 bg-rose-100 rounded-xl p-2">
                      <Sunset className="w-7 h-7 text-rose-600 mx-auto mb-1" />
                      <h4 className="font-black text-sm text-rose-950">3. EVENING (शाम)</h4>
                      <span className="text-[10px] font-bold text-rose-800">🌇 5:00 PM - 6:00 PM</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {configs.filter(c => c.timingSlots.evening).length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          No evening medicines
                        </div>
                      ) : (
                        configs.filter(c => c.timingSlots.evening).map(c => (
                          <div key={c.id} className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 truncate">{c.medicineName}</span>
                              {renderPillGraphic(c)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Take: {c.pillCount} pill</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                                {c.mealRelation === 'before_meal' ? 'Before Food' : 'After Food'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 4. NIGHT COLUMN */}
                  <div className="border-2 border-indigo-400 bg-indigo-50/50 rounded-2xl p-3 flex flex-col space-y-3">
                    <div className="text-center border-b-2 border-indigo-300 pb-2 bg-indigo-100 rounded-xl p-2">
                      <Moon className="w-7 h-7 text-indigo-700 mx-auto mb-1" />
                      <h4 className="font-black text-sm text-indigo-950">4. NIGHT (रात)</h4>
                      <span className="text-[10px] font-bold text-indigo-800">🌙 8:00 PM - 10:00 PM</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {configs.filter(c => c.timingSlots.night).length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          No night medicines
                        </div>
                      ) : (
                        configs.filter(c => c.timingSlots.night).map(c => (
                          <div key={c.id} className="bg-white p-2.5 rounded-xl border border-indigo-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 truncate">{c.medicineName}</span>
                              {renderPillGraphic(c)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Take: {c.pillCount} pill</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                                {c.mealRelation === 'before_meal' ? 'Before Food' : 'After Food'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Important safety warning footer */}
                <div className="border-t border-slate-300 pt-3 text-center text-[10px] text-slate-600 font-bold">
                  ⚠️ Always take medicines with clean drinking water. If severe rash, swelling, or breathing difficulty occurs, contact emergency 108 immediately.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Action Bar (Screen Only) */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Labels ready for: <strong className="text-white">{configs.length} prescription(s)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stickers & Timetable</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
