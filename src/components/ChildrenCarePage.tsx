import React, { useState } from 'react';
import { Baby, Thermometer, ShieldAlert, Activity, Calendar, Heart, Volume2, CheckCircle2, AlertTriangle, Pill, ArrowRight, Sparkles, RefreshCw, UserCheck } from 'lucide-react';
import { LanguageCode, FamilyMember } from '../types';
import { voiceService } from '../services/voiceService';

interface ChildrenCarePageProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToAI: () => void;
  onNavigateToDoctorSummary: () => void;
  onOpenReportScanner: () => void;
}

export const ChildrenCarePage: React.FC<ChildrenCarePageProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToAI,
  onNavigateToDoctorSummary,
  onOpenReportScanner,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [feverLog] = useState([
    { date: 'Yesterday, 8:00 PM', temp: '101.4°F', remedy: 'Paracetamol syrup 5ml given, sponged forehead', status: 'Controlled' },
    { date: '3 Days Ago, 2:00 PM', temp: '102.1°F', remedy: 'High fever, visited Rampur PHC, oral rehydration started', status: 'Resolved' },
    { date: '10 Days Ago, 9:30 AM', temp: '100.8°F', remedy: 'Post-vaccination mild fever, plenty of fluids', status: 'Normal' },
  ]);
  const [childWeightKg, setChildWeightKg] = useState<number>(14);
  const [activeFeverTemp, setActiveFeverTemp] = useState<string>('101.2');
  const [feverDurationDays, setFeverDurationDays] = useState<number>(2);
  const [hasDangerSigns, setHasDangerSigns] = useState<{
    stiffNeck: boolean;
    convulsions: boolean;
    fastBreathing: boolean;
    unableToDrink: boolean;
  }>({
    stiffNeck: false,
    convulsions: false,
    fastBreathing: false,
    unableToDrink: false,
  });

  const [infectionRecords] = useState([
    { title: 'Recurrent Middle Ear Infection (Otitis)', date: 'Last month', status: 'Monitored', notes: 'Keep ears dry during bathing, completed Amoxicillin course' },
    { title: 'Acute Watery Diarrhea & Dehydration', date: '2 months ago', status: 'Treated', notes: 'ORS + 14-day Zinc sulfate (20mg daily) given. Fully recovered' },
    { title: 'Upper Respiratory Wheezing & Cough', date: '4 months ago', status: 'Seasonal', notes: 'Steam inhalation, warm fluids, no cold drinks during winter' },
  ]);

  const [vaccines] = useState([
    { age: 'At Birth', vaccine: 'BCG, OPV-0, Hepatitis B-1', status: 'Completed', date: 'Given at Rampur PHC' },
    { age: '6 Weeks', vaccine: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1', status: 'Completed', date: 'Administered by ANM Sunita' },
    { age: '10 Weeks', vaccine: 'Pentavalent-2, OPV-2, Rotavirus-2', status: 'Completed', date: 'Panchayat Health Sub-centre' },
    { age: '14 Weeks', vaccine: 'Pentavalent-3, OPV-3, Rotavirus-3, PCV-2', status: 'Completed', date: 'All 3 doses verified' },
    { age: '9 Months', vaccine: 'Measles & Rubella (MR-1), Vitamin A Dose 1', status: 'Completed', date: 'Recorded in MCP Card' },
    { age: '16-24 Months', vaccine: 'DPT Booster-1, MR-2, OPV Booster', status: 'Due This Month', date: 'Pending ANM Village Visit' },
    { age: '5-6 Years', vaccine: 'DPT Booster-2', status: 'Upcoming', date: 'Scheduled for next year' },
  ]);

  const readPageOverview = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = "Welcome to the Children Health Care Hub. Here you can track repeated fevers, calculate safe paracetamol dosage for child weight, manage recurrent infections, track immunizations, and spot danger signs like fast breathing or convulsions.";
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  const calculateParacetamolDose = (weight: number) => {
    // 15 mg/kg per dose, standard syrup is 120mg/5ml or 250mg/5ml
    const mg = Math.round(weight * 15);
    const ml120 = ((mg / 120) * 5).toFixed(1);
    const ml250 = ((mg / 250) * 5).toFixed(1);
    return { mg, ml120, ml250 };
  };

  const dosage = calculateParacetamolDose(childWeightKg);

  const handleSimulateFeverCheck = () => {
    const isDangerous = hasDangerSigns.stiffNeck || hasDangerSigns.convulsions || hasDangerSigns.fastBreathing || hasDangerSigns.unableToDrink || parseFloat(activeFeverTemp) >= 103 || feverDurationDays >= 3;
    if (isDangerous) {
      alert("⚠️ RED-FLAG DETECTED: This child has danger signs (high fever / convulsions / fast breathing). Please take the child immediately to the nearest Primary Health Centre or call 108 Ambulance.");
    } else {
      alert(`✅ Fever logged: ${activeFeverTemp}°F for ${feverDurationDays} days. Recommended Paracetamol: ${dosage.ml120} ml (120mg/5ml) every 6-8 hours with plenty of breastmilk/fluids and cool sponging. Consult ASHA worker if fever exceeds 3 days.`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-400/20 border border-sky-300/30 text-sky-200 px-3 py-1 rounded-full text-xs font-bold">
              <Baby className="w-4 h-4 text-sky-300" />
              <span>Pediatric Health & Repeated Fevers Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Children Health Care Hub ( )
            </h1>
            <p className="text-sm text-sky-100/90 leading-relaxed">
              Designed for rural mothers and families: track recurring fevers, avoid accidental medicine overdoses, monitor recurrent infections (ear, chest, diarrhea), and maintain national vaccination schedules.
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
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-300 hover:to-blue-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Child AI Specialist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-bold text-slate-800">Select Child Profile:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFamilyId === m.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.age} yrs - {m.relationship})
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Repeated Fevers & Paracetamol Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Repeated Fevers & Live Triage Calculator */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-black text-slate-900">Repeated Fevers Tracker & Red-Flag Triage</h2>
            </div>
            <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
              High Village Priority
            </span>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>When is Child Fever Dangerous? (Red Flags)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              If your child has fever accompanied by any of the following symptoms, <strong>do not wait at home</strong>. Take them to the nearest hospital or PHC immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
              <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDangerSigns.convulsions}
                  onChange={(e) => setHasDangerSigns({ ...hasDangerSigns, convulsions: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-slate-800">Convulsions / Fits ( )</span>
              </label>
              <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDangerSigns.stiffNeck}
                  onChange={(e) => setHasDangerSigns({ ...hasDangerSigns, stiffNeck: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-slate-800">Stiff Neck / Inability to bend neck</span>
              </label>
              <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDangerSigns.fastBreathing}
                  onChange={(e) => setHasDangerSigns({ ...hasDangerSigns, fastBreathing: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-slate-800">Rapid Chest Indrawing / Panting</span>
              </label>
              <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDangerSigns.unableToDrink}
                  onChange={(e) => setHasDangerSigns({ ...hasDangerSigns, unableToDrink: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-slate-800">Unable to Drink / Persistent Vomiting</span>
              </label>
            </div>
          </div>

          {/* Interactive Fever Entry & Paracetamol Dosage Tool */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>Safe Paracetamol Dosage Calculator by Weight</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Child Weight (kg):</label>
                <input
                  type="number"
                  value={childWeightKg}
                  onChange={(e) => setChildWeightKg(Math.max(3, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Current Temperature (°F):</label>
                <input
                  type="text"
                  value={activeFeverTemp}
                  onChange={(e) => setActiveFeverTemp(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Fever Duration (Days):</label>
                <input
                  type="number"
                  value={feverDurationDays}
                  onChange={(e) => setFeverDurationDays(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Calculated Dose Card */}
            <div className="p-4 bg-white rounded-xl border border-sky-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Safe Dose:</span>
                <span className="text-lg font-black text-sky-700">
                  {dosage.ml120} ml of 120mg/5ml syrup
                </span>
                <span className="text-xs text-slate-500 block">
                  (Or {dosage.ml250} ml of 250mg/5ml suspension) — Every 6 hours as needed. Never exceed 4 doses in 24 hours.
                </span>
              </div>
              <button
                onClick={handleSimulateFeverCheck}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
              >
                Log & Check Safety
              </button>
            </div>
          </div>

          {/* Past Fever Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Fever Episodes Log</h4>
            <div className="space-y-2">
              {feverLog.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{log.temp}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{log.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{log.remedy}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recurrent Infections & Watery Diarrhea Protocol */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recurrent Infections Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900">Recurrent Infection Tracker</h3>
            </div>
            <div className="space-y-3">
              {infectionRecords.map((inf, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{inf.title}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-bold">
                      {inf.date}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{inf.notes}</p>
                </div>
              ))}
            </div>

            {/* Acute Watery Diarrhea & ORS Protocol Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Village ORS & Zinc Protocol for Diarrhea</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Mix 1 packet of government ORS in <strong>1 liter of clean boiled drinking water</strong>. Give frequent sips after every loose stool. Continue Zinc tablets (20 mg daily) for full 14 days even after diarrhea stops to rebuild intestinal immunity.
              </p>
            </div>
          </div>

          {/* Quick Doctor Handoff Link */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sky-300 font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Visiting Doctor Soon?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Don't spend money on repeated scans. Medora automatically prepares a clinical summary of this child's fever history, antibiotics taken, and tests for the doctor to review instantly.
            </p>
            <button
              onClick={onNavigateToDoctorSummary}
              className="w-full py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>View Pediatric Doctor Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Complete Immunization & Growth Milestones Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>National Child Immunization Schedule ( )</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Government recommended immunization records as mandated under the Universal Immunization Programme (UIP).
            </p>
          </div>
          <button
            onClick={onOpenReportScanner}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors self-start"
          >
            <span>Scan Mother-Child Protection (MCP) Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaccines.map((v, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all ${
                v.status === 'Completed'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : v.status === 'Due This Month'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold text-slate-500 uppercase">{v.age}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    v.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'Due This Month'
                      ? 'bg-amber-200 text-amber-900 animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm">{v.vaccine}</h4>
              <p className="text-xs text-slate-600 mt-1">{v.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
