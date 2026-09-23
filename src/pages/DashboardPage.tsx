import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine, Notification, Appointment, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import HealthScoreCard from '../components/HealthScoreCard';
import CareGapAlert from '../components/CareGapAlert';
import DemoDataBadge from '../components/DemoDataBadge';
import SpeakToMedoraCard from '../components/SpeakToMedoraCard';
import {
  AlertTriangle, Heart, Users, Pill, FileText, Activity, Shield, PhoneCall,
  Camera, Image, Stethoscope, Bot, Building2, Syringe, BookOpen, Landmark,
  Baby, Sparkles, UserCheck, Flame, Apple, Radio, MessageSquare, PhoneForwarded,
  RefreshCw, CheckCircle2, Clock, PlusCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { currentUser, isOffline, isSimpleMode } = useAppStore();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentTests, setRecentTests] = useState<HealthTest[]>([]);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    const patId = currentUser.role === 'patient' ? currentUser.id : undefined;

    if (patId) {
      db.medicines.where({ patientId: patId, status: 'active' }).toArray().then(setMedicines);
      db.appointments.where({ patientId: patId }).toArray().then(setAppointments);
      db.healthTests.where('patientId').equals(patId).reverse().limit(4).toArray().then(setRecentTests);
    } else {
      db.medicines.limit(3).toArray().then(setMedicines);
      db.healthTests.reverse().limit(4).toArray().then(setRecentTests);
    }

    db.notifications.where({ userId: currentUser.id, isRead: false }).limit(4).toArray().then(setNotifications);
  }, [currentUser]);

  const healthScore = (() => {
    if (!currentUser) return 72;
    const patient = currentUser as any;
    let score = 65;
    if (patient.conditions?.length === 0) score += 10;
    if (medicines.every((m) => (m.missedCount || 0) === 0)) score += 10;
    if (recentTests.length > 0) score += 5;
    return Math.min(100, Math.max(0, score));
  })();

  const careGaps = [
    ...(medicines.some((m) => (m.missedCount || 0) > 0)
      ? [{ type: 'medicine' as const, message: 'Missed dose recorded. Please review your active medicine schedule.', link: '/medicines' }]
      : []),
    ...(appointments.length === 0
      ? [{ type: 'checkup' as const, message: 'No regular checkup scheduled this month.', link: '/doctor-summary' }]
      : [])
  ];

  const handleQuickEmergencyAlert = async () => {
    await db.smsOutbox.add({
      toPhone: '108 & Family Contact',
      message: `EMERGENCY ALERT from MEDORA: Urgent medical help requested for ${currentUser?.name || 'Patient'} in Kodaikanal. [DEMO SIMULATION]`,
      type: 'emergency_alert',
      language: 'en',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    setEmergencyAlertSent(true);
    setTimeout(() => setEmergencyAlertSent(false), 4000);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Layout>
      <div className="px-4 py-5 max-w-4xl mx-auto space-y-6">
        {/* ========================================================= */}
        {/* 1. WELCOME SECTION                                        */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  📍 {currentUser?.village || 'Kodaikanal Village'}
                </span>
                <span className="text-xs text-slate-500 font-medium">🗓️ {currentDateFormatted}</span>
                <DemoDataBadge />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {currentUser?.name || 'Villager'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Healthcare that reaches the village — even when the internet doesn't.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/ai"
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-sm transition-all"
              >
                <span>🎙️ Speak Now</span>
              </Link>
              <Link
                to="/profile"
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
                title="View Profile"
              >
                {currentUser?.name ? currentUser.name[0] : '👤'}
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. EMERGENCY SECTION (Prominently Near Top)               */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white rounded-3xl p-5 shadow-lg border border-red-500 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg animate-pulse">
                🚨
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">Emergency Help</h2>
                <p className="text-[11px] text-red-100/90">Immediate offline first aid & emergency simulation</p>
              </div>
            </div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              No Login Required
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <Link
              to="/emergency"
              className="bg-white/15 hover:bg-white/25 rounded-2xl p-2.5 text-center text-xs font-bold text-white transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🩹</span>
              <span>Emergency Guidance</span>
            </Link>

            <Link
              to="/emergency"
              className="bg-white/15 hover:bg-white/25 rounded-2xl p-2.5 text-center text-xs font-bold text-white transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🩺</span>
              <span>First Aid Steps</span>
            </Link>

            <Link
              to="/hospitals"
              className="bg-white/15 hover:bg-white/25 rounded-2xl p-2.5 text-center text-xs font-bold text-white transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🏥</span>
              <span>Nearby Healthcare</span>
            </Link>

            <Link
              to="/transport"
              className="bg-white/15 hover:bg-white/25 rounded-2xl p-2.5 text-center text-xs font-bold text-white transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🚑</span>
              <span>Transport Help</span>
            </Link>

            <button
              onClick={handleQuickEmergencyAlert}
              className={`rounded-2xl p-2.5 text-center text-xs font-bold transition-all flex flex-col items-center justify-center ${
                emergencyAlertSent ? 'bg-emerald-500 text-white' : 'bg-white text-red-700 hover:bg-red-50 shadow'
              }`}
            >
              <span className="text-lg mb-1">{emergencyAlertSent ? '✅' : '🔔'}</span>
              <span>{emergencyAlertSent ? 'Alert Queued!' : 'Family Alert DEMO'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SPEAK TO MEDORA (Direct on front page)                 */}
        {/* ========================================================= */}
        <SpeakToMedoraCard />

        {/* ========================================================= */}
        {/* 4. QUICK ACTIONS ROW                                      */}
        {/* ========================================================= */}
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">⚡ Quick Actions</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { path: '/health-tests', label: 'Record Health Test', emoji: '🧪', color: 'bg-teal-50 border-teal-200 text-teal-800' },
              { path: '/records', label: 'Add Medical Record', emoji: '📋', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { path: '/medicines', label: 'Add Medicine', emoji: '💊', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
              { path: '/report-scanner', label: 'Upload Report', emoji: '📷', color: 'bg-purple-50 border-purple-200 text-purple-800' },
              { path: '/doctor-summary', label: 'Doctor Summary', emoji: '📄', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
              { path: '/emergency', label: 'Emergency Help', emoji: '🚨', color: 'bg-red-50 border-red-200 text-red-800' }
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap shadow-sm hover:scale-102 transition-all ${action.color}`}
              >
                <span>{action.emoji}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. HEALTH OVERVIEW SECTION                                */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Health Overview</h2>
              <p className="text-xs text-slate-500">Medora Health Tracking Score & local monitoring indicators</p>
            </div>
            <Link to="/health" className="text-xs font-bold text-teal-700 hover:text-teal-800">
              View Full Health →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Health Score Component */}
            <div className="md:col-span-1">
              <HealthScoreCard score={healthScore} size="sm" />
            </div>

            {/* Medicine adherence & reminders */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Pill size={15} className="text-emerald-600" /> Active Medicines
                  </span>
                  <Link to="/medicines" className="text-[11px] font-bold text-emerald-700 hover:underline">
                    Manage
                  </Link>
                </div>
                {medicines.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {medicines.slice(0, 2).map((m) => (
                      <div key={m.id} className="text-xs text-emerald-800 font-medium truncate">
                        • {m.name} ({m.dose}) – {m.frequency}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 mt-1">No active prescriptions currently recorded.</p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-700">
                {medicines.filter((m) => (m.missedCount || 0) === 0).length} of {medicines.length} taken on schedule
              </div>
            </div>

            {/* Recent Vitals Monitor */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Activity size={15} className="text-blue-600" /> Recent Vitals
                  </span>
                  <Link to="/health-tests" className="text-[11px] font-bold text-blue-700 hover:underline">
                    Trends
                  </Link>
                </div>
                {recentTests.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {recentTests.slice(0, 2).map((t) => (
                      <div key={t.id} className="text-xs text-blue-800 font-medium">
                        • <span className="capitalize">{t.type.replace('_', ' ')}</span>: <strong>{t.value} {t.unit}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-blue-700 mt-1">No recent test records. Tap to add BP or blood sugar.</p>
                )}
              </div>
              <Link to="/health-tests" className="mt-3 pt-2 border-t border-blue-200/60 text-[10px] text-blue-700 font-bold block">
                + Record new health test reading
              </Link>
            </div>
          </div>

          {/* Care Gap Alerts */}
          {careGaps.length > 0 && <CareGapAlert gaps={careGaps} />}
        </div>

        {/* ========================================================= */}
        {/* 6. MAIN HEALTHCARE FEATURE GRID (16 Core Cards)          */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Healthcare Features</h2>
              <p className="text-xs text-slate-500">All services directly accessible on your home dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/health', icon: <Heart size={22} className="text-teal-600" />, title: '1. My Health', desc: 'View your health info, measurements & journey.', bg: 'bg-teal-50 border-teal-200' },
              { path: '/family', icon: <Users size={22} className="text-purple-600" />, title: '2. Family Health', desc: 'Manage health information for your family.', bg: 'bg-purple-50 border-purple-200' },
              { path: '/records', icon: <FileText size={22} className="text-blue-600" />, title: '3. Medical Records', desc: 'View and manage your medical history.', bg: 'bg-blue-50 border-blue-200' },
              { path: '/medicines', icon: <Pill size={22} className="text-emerald-600" />, title: '4. Medicines & Reminders', desc: 'Track schedules, taken & missed doses.', bg: 'bg-emerald-50 border-emerald-200' },
              { path: '/health-tests', icon: <Activity size={22} className="text-amber-600" />, title: '5. Health Tests', desc: 'Record BP, sugar, weight, pulse & SpO2.', bg: 'bg-amber-50 border-amber-200' },
              { path: '/records', icon: <Shield size={22} className="text-indigo-600" />, title: '6. Medical Reports', desc: 'Store and view your lab & clinical reports.', bg: 'bg-indigo-50 border-indigo-200' },
              { path: '/report-scanner', icon: <Camera size={22} className="text-fuchsia-600" />, title: '7. Report Scanner', desc: 'Capture or upload reports for organized filing.', bg: 'bg-fuchsia-50 border-fuchsia-200' },
              { path: '/xray-viewer', icon: <Image size={22} className="text-slate-700" />, title: '8. X-Ray / Image Viewer', desc: 'View and annotate stored medical images.', bg: 'bg-slate-100 border-slate-300' },
              { path: '/doctor-portal', icon: <Stethoscope size={22} className="text-cyan-600" />, title: '9. Doctor Consultation', desc: 'Prepare and review clinical consultations.', bg: 'bg-cyan-50 border-cyan-200' },
              { path: '/doctor-summary', icon: <FileText size={22} className="text-teal-700" />, title: '10. Doctor Summary', desc: 'Create clear patient summary for doctor handoff.', bg: 'bg-teal-50 border-teal-200' },
              { path: '/ai', icon: <Bot size={22} className="text-violet-600" />, title: '11. AI Health Assistant', desc: 'Get safe guidance from specialized assistants.', bg: 'bg-violet-50 border-violet-200' },
              { path: '/hospitals', icon: <Building2 size={22} className="text-rose-600" />, title: '12. Nearby Healthcare', desc: 'View locally stored healthcare facilities & PHCs.', bg: 'bg-rose-50 border-rose-200' },
              { path: '/vaccination', icon: <Syringe size={22} className="text-lime-600" />, title: '13. Vaccinations', desc: 'Track immunization history & UIP schedules.', bg: 'bg-lime-50 border-lime-200' },
              { path: '/education', icon: <BookOpen size={22} className="text-sky-600" />, title: '14. Health Education', desc: 'Learn about nutrition, hygiene & prevention.', bg: 'bg-sky-50 border-sky-200' },
              { path: '/schemes', icon: <Landmark size={22} className="text-emerald-700" />, title: '15. Govt Health Schemes', desc: 'Learn about Ayushman Bharat, JSY & PMMVY.', bg: 'bg-emerald-50 border-emerald-200' },
              { path: '/emergency', icon: <AlertTriangle size={22} className="text-red-600" />, title: '16. Emergency Help', desc: 'Access first aid & stored emergency contacts.', bg: 'bg-red-50 border-red-200' }
            ].map((card, i) => (
              <Link
                key={i}
                to={card.path}
                className={`border rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-102 transition-all flex flex-col justify-between ${card.bg}`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs mb-2.5">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{card.title}</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">{card.desc}</p>
                </div>
                <span className="text-[10px] font-extrabold text-slate-800 mt-3 block">Open →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. SPECIALIZED FAMILY CARE SECTION                        */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Specialized Family Care</h2>
              <p className="text-xs text-slate-500">Dedicated health hubs across every stage of family life</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/childcare', emoji: '👶', title: 'Child Care', desc: 'Growth, nutrition & common illness', color: 'bg-orange-50 border-orange-200 text-orange-900' },
              { path: '/maternity', emoji: '🤰', title: 'Maternity Care', desc: 'Trimesters, nutrition & danger signs', color: 'bg-pink-50 border-pink-200 text-pink-900' },
              { path: '/newborn', emoji: '🍼', title: 'Newborn Care', desc: 'Feeding, umbilical cord & birth doses', color: 'bg-rose-50 border-rose-200 text-rose-900' },
              { path: '/maternity', emoji: '🌸', title: 'New Mother Care', desc: 'Postpartum recovery & maternal wellness', color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900' },
              { path: '/elderly', emoji: '👵', title: 'Elderly Care', desc: 'BP, fall safety & senior health alerts', color: 'bg-purple-50 border-purple-200 text-purple-900' },
              { path: '/health-tests', emoji: '🩺', title: 'Diabetes Care', desc: 'Blood sugar trends & diet guidance', color: 'bg-teal-50 border-teal-200 text-teal-900' },
              { path: '/education', emoji: '🥗', title: 'Nutrition Care', desc: 'Anemia prevention & wholesome diet', color: 'bg-green-50 border-green-200 text-green-900' }
            ].map((care, i) => (
              <Link
                key={i}
                to={care.path}
                className={`border rounded-2xl p-4 shadow-sm hover:scale-102 transition-all flex flex-col justify-between ${care.color}`}
              >
                <div>
                  <span className="text-3xl mb-2 block">{care.emoji}</span>
                  <h3 className="font-extrabold text-xs mb-1">{care.title}</h3>
                  <p className="text-[11px] opacity-80 leading-normal">{care.desc}</p>
                </div>
                <span className="text-[10px] font-extrabold mt-3 block">View Care Hub →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 8. RURAL COMMUNICATION SECTION                            */}
        {/* ========================================================= */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-teal-400" />
              <h2 className="font-extrabold text-sm text-white">Stay Connected — Even With Limited Internet</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulated rural telecom integrations demonstrating offline and low-bandwidth capabilities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Link
              to="/ai"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">🎙️</span>
                <div className="font-bold text-xs text-white">Voice Communication</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Natural voice in 5 languages</p>
              </div>
              <span className="text-[9px] text-teal-400 font-bold mt-2">Active</span>
            </Link>

            <Link
              to="/sms"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">📱</span>
                <div className="font-bold text-xs text-white">SMS Outbox</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Local queue for low coverage</p>
              </div>
              <span className="text-[9px] text-amber-400 font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/ussd"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">🔢</span>
                <div className="font-bold text-xs text-white">Basic Phone / USSD</div>
                <p className="text-[10px] text-slate-400 mt-0.5">*141*9999# text menu</p>
              </div>
              <span className="text-[9px] text-amber-400 font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/ivr"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">☎️</span>
                <div className="font-bold text-xs text-white">Telephone Simulation</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Future toll-free voice engine</p>
              </div>
              <span className="text-[9px] text-amber-400 font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/sync"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">🔄</span>
                <div className="font-bold text-xs text-white">Sync Center</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Inspect local IndexedDB data</p>
              </div>
              <span className="text-[9px] text-teal-400 font-bold mt-2">Active</span>
            </Link>

            <Link
              to="/village"
              className="bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all"
            >
              <div>
                <span className="text-xl mb-1 block">🏘️</span>
                <div className="font-bold text-xs text-white">Village Dashboard</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Community health analytics</p>
              </div>
              <span className="text-[9px] text-teal-400 font-bold mt-2">Active</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9. RECENT HEALTH ACTIVITY (Real Local IndexedDB Data)    */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900">Recent Health Activity</h2>
            <span className="text-[11px] text-slate-400">From local database</span>
          </div>

          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold">
                    🔔
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{n.message}</p>
                    <span className="text-[10px] text-slate-400">{n.createdAt?.slice(0, 16)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No recent health alerts. All scheduled medicines and vitals are up to date.
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-2 text-[11px] text-slate-400 space-y-1">
          <p>MEDORA — Rural Health Companion • Offline-First Healthcare Platform</p>
          <p className="text-[10px] text-slate-400/80">All demo data is fictional. Real telecom integrations are represented as simulations.</p>
        </div>
      </div>
    </Layout>
  );
}
