import React, { useState } from 'react';
import { Activity, Target, Calendar, Clock, Bell, Stethoscope, CheckCircle2, AlertTriangle, Volume2, Phone, Sparkles, ArrowRight, Check } from 'lucide-react';
import { PersonalizedProfile } from '../data/personalizedProfiles';
import { voiceService } from '../services/voiceService';
import { LanguageCode } from '../types';
import { useAppStore } from '../store/useAppStore';

interface PersonalizedHealthAnalyzerProps {
  profile: PersonalizedProfile;
  currentLang: LanguageCode;
  onNavigateToDoctors: () => void;
  onNavigateToTransit: () => void;
  onShowToast: (msg: string) => void;
}

export const PersonalizedHealthAnalyzer: React.FC<PersonalizedHealthAnalyzerProps> = ({
  profile,
  currentLang,
  onNavigateToDoctors,
  onNavigateToTransit,
  onShowToast,
}) => {
  const [medicines, setMedicines] = useState(profile.medicines);
  const [desiredCheckupDate, setDesiredCheckupDate] = useState(profile.whenToCheckup.recommendedDate);
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>({});
  const [smsSent, setSmsSent] = useState(false);

  // Sync medicines when profile switches
  React.useEffect(() => {
    setMedicines(profile.medicines);
    setDesiredCheckupDate(profile.whenToCheckup.recommendedDate);
  }, [profile]);

  const toggleMedicine = (id: string) => {
    setMedicines(prev =>
      prev.map(m => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
    const updated = medicines.find(m => m.id === id);
    if (updated && !updated.taken) {
      onShowToast(`Dose marked as taken: ${updated.name}`);
    }
  };

  const toggleGoal = (goal: string) => {
    setCompletedGoals(prev => ({ ...prev, [goal]: !prev[goal] }));
  };

  const handleVoiceListen = (text: string) => {
    voiceService.speak(text, currentLang);
  };

  const handleSendSmsReminder = () => {
    setSmsSent(true);
    onShowToast(`SMS reminder scheduled for ${profile.name.split('(')[0]}`);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handleSaveDesiredDate = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`Desired checkup date set to ${desiredCheckupDate} for ${profile.name.split('(')[0]}!`);
  };

  const takenCount = medicines.filter(m => m.taken).length;
  const adherencePct = Math.round((takenCount / medicines.length) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 stroke-emerald-500';
    if (score >= 65) return 'text-amber-600 stroke-amber-500';
    return 'text-rose-600 stroke-rose-500';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-xl space-y-8">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
              INDIVIDUAL HEALTH ASSESSMENT & WANTS
            </span>
            <span className="text-xs text-slate-400 font-bold">Personalized Clinical Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {profile.relationship} • {profile.age} Years • {profile.gender}
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-black border ${profile.statusBadgeColor}`}>
            {profile.healthStatusText}
          </span>
          <button
            onClick={() => handleVoiceListen(`${profile.name}. Health status: ${profile.healthStatusText}. ${profile.summarySentence}`)}
            className="p-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 border border-emerald-200"
            title="Read analysis aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. HOW HEALTHY IS THE PERSON? (Health Score & Vitals Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-slate-50 p-6 rounded-3xl border border-slate-200">
        {/* Circular Health Gauge */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 lg:border-r lg:border-slate-200 lg:pr-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(profile.healthScore)}
                strokeDasharray={`${profile.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{profile.healthScore}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Health Score</span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-slate-700">
            Out of 100 Wellness Index
          </span>
        </div>

        {/* Detailed Assessment & Vitals Grid */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            Clinical Health Determination (  )
          </h4>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-2xl border border-slate-200">
            {profile.summarySentence}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {profile.vitalsBreakdown.map((vital) => (
              <div key={vital.label} className="p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block font-medium truncate">{vital.label}</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">{vital.value}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                  vital.status === 'High' ? 'bg-rose-100 text-rose-800' :
                  vital.status === 'Due' ? 'bg-amber-100 text-amber-800' :
                  vital.status === 'Borderline' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {vital.status} ({vital.target})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. WHAT THEY WANT & HEALTH GOALS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            What {profile.name.split('(')[0]} Wants & Needs (   )
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Personal Goals */}
          <div className="p-5 bg-emerald-50/40 border border-emerald-200 rounded-3xl space-y-3">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center justify-between">
              <span>Personal Health Goals (   )</span>
              <span className="text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                Tap to check off
              </span>
            </h4>
            <div className="space-y-2 text-xs">
              {profile.whatTheyWant.goals.map((goal, idx) => {
                const isChecked = !!completedGoals[goal];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 line-through opacity-75'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-400 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-semibold leading-relaxed">{goal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Care Needs */}
          <div className="p-5 bg-blue-50/40 border border-blue-200 rounded-3xl space-y-3">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">
              Medical Care Interventions Needed (  )
            </h4>
            <div className="space-y-2 text-xs">
              {profile.whatTheyWant.careNeeds.map((need, idx) => (
                <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-semibold leading-relaxed">{need}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. WHEN THEY WANT TO CHECKUP */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Optimal Timing Engine
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              When Should {profile.name.split('(')[0]} Go for a Checkup?
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-xl text-xs font-black">
              {profile.whenToCheckup.urgencyText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* AI Recommended Optimal Window */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">
              Clinical Recommendation & Reason
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {profile.whenToCheckup.reason}
            </p>
            <div className="pt-2 border-t border-slate-700 space-y-1 text-[11px]">
              <div className="text-emerald-300 font-bold">
                Next Routine PHC Vitals: {profile.whenToCheckup.nextRoutineScreening}
              </div>
              <div className="text-rose-300 font-bold">
                Pending Actions: {profile.whenToCheckup.overdueTasks.join(' • ')}
              </div>
            </div>
          </div>

          {/* User Desired Checkup Scheduler Form */}
          <form onSubmit={handleSaveDesiredDate} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-[11px] text-amber-300 uppercase font-bold block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              When The Person Wants Their Checkup (   )
            </span>
            <div>
              <label className="text-slate-300 block text-[11px] mb-1">
                Select preferred checkup date with doctor or PHC:
              </label>
              <input
                type="date"
                value={desiredCheckupDate}
                onChange={(e) => setDesiredCheckupDate(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white font-bold text-xs focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDesiredCheckupDate('2026-09-11')}
                className="flex-1 py-1.5 px-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-bold text-slate-200 text-center"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDesiredCheckupDate('2026-09-12')}
                className="flex-1 py-1.5 px-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-bold text-slate-200 text-center"
              >
                This Weekend
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[11px] shadow-sm"
              >
                Save Date
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. REMINDER TO GO TO DOCTOR CONSULTATION */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <Stethoscope className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                CONSULTATION REMINDER
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Upcoming Doctor Consultation with {profile.consultationReminder.doctorName}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-amber-300 block">
              {profile.consultationReminder.daysAway === 1 ? 'Tomorrow' : `In ${profile.consultationReminder.daysAway} Days`}
            </span>
            <span className="text-xs text-blue-200 font-bold">Confirmed OPD Slot</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-blue-200 font-medium block">Date & Time</span>
            <strong className="text-white text-sm block mt-0.5">
              {profile.consultationReminder.date}
            </strong>
            <span className="text-amber-300 font-bold block">{profile.consultationReminder.time}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-blue-200 font-medium block">Hospital / OPD Facility</span>
            <strong className="text-white text-sm block mt-0.5">
              {profile.consultationReminder.hospitalName}
            </strong>
            <span className="text-blue-200 block">{profile.consultationReminder.specialty}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-blue-200 font-medium block">Preparation</span>
            <strong className="text-white block mt-0.5">
              Bring Past 30-Day Vitals Log
            </strong>
            <span className="text-emerald-300 font-bold block">Doctor-Ready Handoff Synced</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => useAppStore.getState().startDirectCall({
              name: `Dr. ${profile.consultationReminder.specialty} Clinic`,
              phone: profile.consultationReminder.phone,
              category: 'DOCTOR',
              targetUserId: 'DOC-01',
              location: profile.consultationReminder.hospitalName,
              emergency: false,
            })}
            className="py-2.5 px-4 bg-white text-slate-900 font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Doctor Clinic ({profile.consultationReminder.phone})</span>
          </button>

          <button
            onClick={onNavigateToTransit}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>View Hospital Bus & Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSendSmsReminder}
            className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl flex items-center gap-1.5 border border-white/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span>{smsSent ? 'SMS Sent to +91 94481 00223' : 'Send Phone SMS Alert'}</span>
          </button>
        </div>
      </div>

      {/* 5. REMINDER TO TAKE MEDICINE (Personalized for this patient) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Personalized Medicine Reminders for {profile.name.split('(')[0]}
              </h3>
              <p className="text-xs text-slate-500">
                Mark each dose when taken. Listen to speech instructions in selected language.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Today's Progress:</span>
            <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl">
              {adherencePct}% ({takenCount}/{medicines.length} Doses)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {medicines.map((med) => (
            <div
              key={med.id}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                med.taken
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {med.slot}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {med.time}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 leading-tight">
                  {med.name}
                </h4>
                <p className="text-xs font-bold text-emerald-800 mt-0.5">
                  {med.dosage}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Purpose: {med.purpose}
                </p>
                <div className="mt-2 text-[11px] bg-white/90 p-2 rounded-lg border border-slate-200 text-slate-700">
                  💡 {med.instructions}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleVoiceListen(`Reminder for ${profile.name.split('(')[0]}. Take ${med.name}, ${med.dosage}. ${med.instructions}.`)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  title="Listen to medicine instructions"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                </button>

                <button
                  onClick={() => toggleMedicine(med.id)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    med.taken
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm animate-pulse'
                  }`}
                >
                  {med.taken ? (
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
    </div>
  );
};
