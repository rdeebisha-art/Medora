import React, { useState } from 'react';
import { Pill, Check, Clock, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { LanguageCode } from '../types';

interface PillScheduleItem {
  id: string;
  slot: 'Morning ()' | 'Afternoon ()' | 'Evening ()';
  time: string;
  medicine: string;
  dose: string;
  purpose: string;
  instructions: string;
  taken: boolean;
}

interface MedicineReminderProps {
  currentLang: LanguageCode;
}

export const MedicineReminder: React.FC<MedicineReminderProps> = ({ currentLang }) => {
  const [schedule, setSchedule] = useState<PillScheduleItem[]>([
    {
      id: 'p-1',
      slot: 'Morning ()',
      time: '08:00 AM',
      medicine: 'Amlodipine 5mg',
      dose: '1 tablet with warm water',
      purpose: 'Blood Pressure Control',
      instructions: 'Take after breakfast',
      taken: true,
    },
    {
      id: 'p-2',
      slot: 'Afternoon ()',
      time: '01:30 PM',
      medicine: 'Calcium + Vitamin D3 500mg',
      dose: '1 tablet post meal',
      purpose: 'Bone & Joint Strength (Osteoarthritis)',
      instructions: 'Take after lunch',
      taken: true,
    },
    {
      id: 'p-3',
      slot: 'Evening ()',
      time: '07:30 PM',
      medicine: 'Telmisartan 40mg',
      dose: '1 tablet consistently',
      purpose: 'Vascular Protection & Overnight BP Control',
      instructions: 'Take before dinner; do not skip',
      taken: false,
    },
  ]);

  const toggleTaken = (id: string) => {
    setSchedule(prev =>
      prev.map(item => (item.id === id ? { ...item, taken: !item.taken } : item))
    );
  };

  const takenCount = schedule.filter(s => s.taken).length;
  const adherencePct = Math.round((takenCount / schedule.length) * 100);

  const handleVoiceRemind = (item: PillScheduleItem) => {
    const text = `Medicine Reminder. Time for ${item.medicine}, ${item.dose}. ${item.instructions}.`;
    voiceService.speak(text, currentLang);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Daily Medication Reminder (   )
            </h3>
            <p className="text-xs text-slate-500">
              Simple daily schedule for village patients. Mark each dose when swallowed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Today's Adherence
            </span>
            <span className="text-base font-black text-emerald-700">
              {adherencePct}% ({takenCount}/{schedule.length} Taken)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center font-black text-xs text-emerald-800">
            {takenCount}/{schedule.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {schedule.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
              item.taken
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {item.slot}
                </span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                  {item.time}
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 leading-tight">
                {item.medicine}
              </h4>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                {item.dose}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Indication: {item.purpose}
              </p>
              <div className="mt-2 text-[11px] bg-white/80 p-2 rounded-lg border border-slate-200 text-slate-700">
                💡 {item.instructions}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
              <button
                onClick={() => handleVoiceRemind(item)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                title="Listen to medicine instructions"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                onClick={() => toggleTaken(item.id)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  item.taken
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm animate-pulse'
                }`}
              >
                {item.taken ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dose Taken</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Taken</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
