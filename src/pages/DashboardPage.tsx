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
import { TriangleAlert as AlertTriangle, Heart, Users, Pill, FileText, Activity, Shield, Camera, Image, Stethoscope, Bot, Building as Building2, Syringe, BookOpen, Landmark, Radio, Languages } from 'lucide-react';

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
        <div className="bg-gradient-to-r from-[#F0FDFA] to-[#EFF6FF] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-[#0F766E] border border-[#E2E8F0]">
                  📍 {currentUser?.village || 'Kodaikanal Village'}
                </span>
                <span className="text-xs text-[#64748B] font-medium">🗓️ {currentDateFormatted}</span>
                <DemoDataBadge />
              </div>
              <h1 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {t('dashboard.greeting', { name: currentUser?.name || 'Villager' })} 👋
              </h1>
              <p className="text-sm text-[#475569] mt-1 max-w-xl leading-relaxed">
                {t('app.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/ai"
                className="flex items-center gap-1.5 bg-[#14B8A6] hover:bg-[#0F766E] text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-sm min-h-11"
              >
                <span>🎙️ {t('ai.speak')}</span>
              </Link>
              <Link
                to="/profile"
                className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] text-[#0F766E] flex items-center justify-center font-bold text-sm"
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
        <div className="bg-[#FEF2F2] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg border border-[#E2E8F0]">
                🚨
              </div>
              <div>
                <h2 className="text-base font-black text-[#B91C1C] tracking-tight">{t('emergency.title')}</h2>
                <p className="text-[11px] text-[#475569]">Immediate offline first aid & emergency simulation</p>
              </div>
            </div>
            <span className="bg-white text-[#B91C1C] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
              No Login Required
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <Link
              to="/emergency"
              className="bg-[#DC2626] hover:bg-[#B91C1C] rounded-2xl p-2.5 text-center text-xs font-bold text-white min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🩹</span>
              <span>🚨 {t('nav.emergency')}</span>
            </Link>

            <Link
              to="/emergency"
              className="bg-white hover:bg-[#FEF2F2] rounded-2xl p-2.5 text-center text-xs font-bold text-[#B91C1C] border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🩺</span>
              <span>First Aid Steps</span>
            </Link>

            <Link
              to="/hospitals"
              className="bg-white hover:bg-[#EFF6FF] rounded-2xl p-2.5 text-center text-xs font-bold text-[#2563EB] border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🏥</span>
              <span>Nearby Healthcare</span>
            </Link>

            <Link
              to="/transport"
              className="bg-white hover:bg-[#FFF7ED] rounded-2xl p-2.5 text-center text-xs font-bold text-[#EA580C] border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🚑</span>
              <span>Transport Help</span>
            </Link>

            <button
              onClick={handleQuickEmergencyAlert}
              className={`rounded-2xl p-2.5 text-center text-xs font-bold transition-all border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center ${
                emergencyAlertSent ? 'bg-[#16A34A] text-white' : 'bg-white text-[#DC2626] hover:bg-[#FEF2F2] shadow-2xs'
              }`}
            >
              <span className="text-lg mb-1">{emergencyAlertSent ? '✅' : '🔔'}</span>
              <span>{emergencyAlertSent ? 'Alert Queued!' : 'Family Alert DEMO'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. STAY CONNECTED — RURAL COMMUNICATION SECTION           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center border border-[#14B8A6]/20">
                <Radio size={16} />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-[#0F172A]">Stay Connected — Even With Limited Internet</h2>
                <p className="text-[11px] text-[#64748B]">
                  Simulated rural telecom integrations demonstrating offline and low-bandwidth capabilities.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Link
              to="/ai"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#14B8A6]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center mb-2 border border-[#14B8A6]/20">
                  🎙️
                </div>
                <div className="font-bold text-xs text-[#0F172A]">Voice Communication</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">Natural voice in 6 languages</p>
              </div>
              <span className="text-[9px] text-[#0F766E] font-bold mt-2">Active</span>
            </Link>

            <Link
              to="/sms"
              className="bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2 border border-[#2563EB]/20">
                  📱
                </div>
                <div className="font-bold text-xs text-[#0F172A]">SMS Outbox</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">Local queue for low coverage</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/ussd"
              className="bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#475569] flex items-center justify-center mb-2 border border-slate-200">
                  🔢
                </div>
                <div className="font-bold text-xs text-[#0F172A]">Basic Phone / USSD</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">*141*9999# text menu</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/ivr"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#14B8A6]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center mb-2 border border-[#14B8A6]/20">
                  ☎️
                </div>
                <div className="font-bold text-xs text-[#0F172A]">Telephone Simulation</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">Future toll-free voice engine</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">DEMO SIMULATION</span>
            </Link>

            <Link
              to="/sync"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#0F766E]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mb-2 border border-[#0F766E]/20">
                  🔄
                </div>
                <div className="font-bold text-xs text-[#0F172A]">Sync Center</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">Inspect local IndexedDB data</p>
              </div>
              <span className="text-[9px] text-[#0F766E] font-bold mt-2">Active</span>
            </Link>

            <Link
              to="/village"
              className="bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#16A34A]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mb-2 border border-[#16A34A]/20">
                  🏘️
                </div>
                <div className="font-bold text-xs text-[#0F172A]">Village Dashboard</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">Community health analytics</p>
              </div>
              <span className="text-[9px] text-[#16A34A] font-bold mt-2">Active</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SPEAK TO MEDORA (Direct on front page)                 */}
        {/* ========================================================= */}
        <SpeakToMedoraCard />

        {/* ========================================================= */}
        {/* 5. QUICK ACTIONS ROW                                      */}
        {/* ========================================================= */}
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">⚡ Quick Actions</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { path: '/health-tests', label: 'Record Health Test', emoji: '🧪', color: 'bg-white border-[#E2E8F0] text-[#0F766E]' },
              { path: '/records', label: 'Add Medical Record', emoji: '📋', color: 'bg-white border-[#E2E8F0] text-[#2563EB]' },
              { path: '/medicines', label: 'Add Medicine', emoji: '💊', color: 'bg-white border-[#E2E8F0] text-[#16A34A]' },
              { path: '/language-bridge', label: 'Language Bridge', emoji: '🌐', color: 'bg-white border-[#E2E8F0] text-[#0F766E]' },
              { path: '/doctor-summary', label: 'Doctor Summary', emoji: '📄', color: 'bg-white border-[#E2E8F0] text-[#2563EB]' },
              { path: '/emergency', label: 'Emergency Help', emoji: '🚨', color: 'bg-white border-[#E2E8F0] text-[#DC2626]' }
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap shadow-sm hover:shadow-md min-h-11 ${action.color}`}
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
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#0F172A]">Health Overview</h2>
              <p className="text-xs text-[#64748B]">Medora Health Tracking Score & local monitoring indicators</p>
            </div>
            <Link to="/health" className="text-xs font-bold text-[#0F766E] hover:underline">
              View Full Health →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Health Score Component */}
            <div className="md:col-span-1">
              <HealthScoreCard score={healthScore} size="sm" />
            </div>

            {/* Medicine adherence & reminders */}
            <div className="bg-[#F0FDF4] border border-[#16A34A]/30 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <Pill size={15} className="text-[#16A34A]" /> Active Medicines
                  </span>
                  <Link to="/medicines" className="text-[11px] font-bold text-[#16A34A] hover:underline">
                    Manage
                  </Link>
                </div>
                {medicines.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {medicines.slice(0, 2).map((m) => (
                      <div key={m.id} className="text-xs text-[#0F172A] font-medium truncate">
                        • {m.name} ({m.dose}) – {m.frequency}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#475569] mt-1">No active prescriptions currently recorded.</p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-[#16A34A]/20 text-[10px] text-[#16A34A]">
                {medicines.filter((m) => (m.missedCount || 0) === 0).length} of {medicines.length} taken on schedule
              </div>
            </div>

            {/* Recent Vitals Monitor */}
            <div className="bg-[#EFF6FF] border border-[#2563EB]/30 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1.5">
                    <Activity size={15} className="text-[#2563EB]" /> Recent Vitals
                  </span>
                  <Link to="/health-tests" className="text-[11px] font-bold text-[#2563EB] hover:underline">
                    Trends
                  </Link>
                </div>
                {recentTests.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {recentTests.slice(0, 2).map((t) => (
                      <div key={t.id} className="text-xs text-[#0F172A] font-medium">
                        • <span className="capitalize">{t.type.replace('_', ' ')}</span>: <strong>{t.value} {t.unit}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#475569] mt-1">No recent test records. Tap to add BP or blood sugar.</p>
                )}
              </div>
              <Link to="/health-tests" className="mt-3 pt-2 border-t border-[#2563EB]/20 text-[10px] text-[#2563EB] font-bold block">
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
              <h2 className="text-base font-black text-[#0F172A]">Healthcare Features</h2>
              <p className="text-xs text-[#64748B]">All services directly accessible on your home dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/health', icon: <Heart size={22} className="text-[#0F766E]" />, iconBg: 'bg-[#F0FDFA]', title: '1. My Health', desc: 'View your health info, measurements & journey.' },
              { path: '/family', icon: <Users size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: '2. Family Health', desc: 'Manage health information for your family.' },
              { path: '/records', icon: <FileText size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: '3. Medical Records', desc: 'View and manage your medical history.' },
              { path: '/medicines', icon: <Pill size={22} className="text-[#16A34A]" />, iconBg: 'bg-[#F0FDF4]', title: '4. Medicines & Reminders', desc: 'Track schedules, taken & missed doses.' },
              { path: '/health-tests', icon: <Activity size={22} className="text-[#14B8A6]" />, iconBg: 'bg-[#F0FDFA]', title: '5. Health Tests', desc: 'Record BP, sugar, weight, pulse & SpO2.' },
              { path: '/records', icon: <Shield size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: '6. Medical Reports', desc: 'Store and view your lab & clinical reports.' },
              { path: '/report-scanner', icon: <Camera size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: '7. Report Scanner', desc: 'Capture or upload reports for organized filing.' },
              { path: '/xray-viewer', icon: <Image size={22} className="text-[#475569]" />, iconBg: 'bg-[#F1F5F9]', title: '8. X-Ray / Image Viewer', desc: 'View and annotate stored medical images.' },
              { path: '/doctor-portal', icon: <Stethoscope size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: '9. Doctor Consultation', desc: 'Prepare and review clinical consultations.' },
              { path: '/doctor-summary', icon: <FileText size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: '10. Doctor Summary', desc: 'Create clear patient summary for doctor handoff.' },
              { path: '/ai', icon: <Bot size={22} className="text-[#7C3AED]" />, iconBg: 'bg-[#F5F3FF]', title: '11. AI Health Assistant', desc: 'Get safe guidance from specialized assistants.' },
              { path: '/hospitals', icon: <Building2 size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: '12. Nearby Healthcare', desc: 'View locally stored healthcare facilities & PHCs.' },
              { path: '/vaccination', icon: <Syringe size={22} className="text-[#16A34A]" />, iconBg: 'bg-[#F0FDF4]', title: '13. Vaccinations', desc: 'Track immunization history & UIP schedules.' },
              { path: '/education', icon: <BookOpen size={22} className="text-[#0F766E]" />, iconBg: 'bg-[#F0FDFA]', title: '14. Health Education', desc: 'Learn about nutrition, hygiene & prevention.' },
              { path: '/schemes', icon: <Landmark size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: '15. Govt Health Schemes', desc: 'Learn about Ayushman Bharat, JSY & PMMVY.' },
              { path: '/emergency', icon: <AlertTriangle size={22} className="text-[#DC2626]" />, iconBg: 'bg-[#FEF2F2]', title: '16. Emergency Help', desc: 'Access first aid & stored emergency contacts.' }
            ].map((card, i) => (
              <Link
                key={i}
                to={card.path}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs mb-2.5 border border-black/5 group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-xs text-[#0F172A] leading-snug">{card.title}</h3>
                  <p className="text-[11px] text-[#475569] mt-1 leading-normal">{card.desc}</p>
                </div>
                <span className="text-[10px] font-extrabold text-[#0F766E] mt-3 block group-hover:translate-x-0.5 transition-transform">Open →</span>
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
              <h2 className="text-base font-black text-[#0F172A]">Specialized Family Care</h2>
              <p className="text-xs text-[#64748B]">Dedicated health hubs across every stage of family life</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/childcare', emoji: '👶', title: 'Child Care', desc: 'Growth, nutrition & common illness', iconBg: 'bg-[#EFF6FF]', textColor: 'text-[#2563EB]' },
              { path: '/maternity', emoji: '🤰', title: 'Maternity Care', desc: 'Trimesters, nutrition & danger signs', iconBg: 'bg-[#FDF2F8]', textColor: 'text-[#DB2777]' },
              { path: '/newborn', emoji: '🍼', title: 'Newborn Care', desc: 'Feeding, umbilical cord & birth doses', iconBg: 'bg-[#F0FDFA]', textColor: 'text-[#14B8A6]' },
              { path: '/maternity', emoji: '🌸', title: 'New Mother Care', desc: 'Postpartum recovery & maternal wellness', iconBg: 'bg-[#FDF2F8]', textColor: 'text-[#DB2777]' },
              { path: '/elderly', emoji: '👵', title: 'Elderly Care', desc: 'BP, fall safety & senior health alerts', iconBg: 'bg-[#EEF2FF]', textColor: 'text-[#4F46E5]' },
              { path: '/health-tests', emoji: '🩺', title: 'Diabetes Care', desc: 'Blood sugar trends & diet guidance', iconBg: 'bg-[#FFF7ED]', textColor: 'text-[#EA580C]' },
              { path: '/education', emoji: '🥗', title: 'Nutrition Care', desc: 'Anemia prevention & wholesome diet', iconBg: 'bg-[#F0FDF4]', textColor: 'text-[#16A34A]' }
            ].map((care, i) => (
              <Link
                key={i}
                to={care.path}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${care.iconBg} flex items-center justify-center text-xl mb-2.5 border border-black/5 group-hover:scale-105 transition-transform`}>
                    {care.emoji}
                  </div>
                  <h3 className="font-extrabold text-xs text-[#0F172A] mb-1">{care.title}</h3>
                  <p className="text-[11px] text-[#475569] leading-normal">{care.desc}</p>
                </div>
                <span className={`text-[10px] font-extrabold mt-3 block ${care.textColor}`}>View Care Hub →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9. RECENT HEALTH ACTIVITY (Real Local IndexedDB Data)    */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-[#0F172A]">Recent Health Activity</h2>
            <span className="text-[11px] text-[#64748B]">From local database</span>
          </div>

          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFFBEB]/60 border border-[#D97706]/20 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30 flex items-center justify-center flex-shrink-0 font-bold">
                    🔔
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#0F172A]">{n.message}</p>
                    <span className="text-[10px] text-[#64748B]">{n.createdAt?.slice(0, 16)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#64748B] bg-slate-50 border border-[#E2E8F0] rounded-2xl">
                No recent health alerts. All scheduled medicines and vitals are up to date.
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-2 text-[11px] text-[#64748B] space-y-1">
          <p className="font-semibold text-[#0F172A]">MEDORA — Rural Health Companion • Offline-First Healthcare Platform</p>
          <p className="text-[10px] text-[#64748B]">All demo data is fictional. Real telecom integrations are represented as simulations.</p>
        </div>
      </div>
    </Layout>
  );
}
