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
  const { currentUser, language, isOffline, isSimpleMode } = useAppStore();
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
      ? [{ type: 'medicine' as const, message: t('dashboard.missedDoseAlert'), link: '/medicines' }]
      : []),
    ...(appointments.length === 0
      ? [{ type: 'checkup' as const, message: t('dashboard.noCheckupAlert'), link: '/doctor-summary' }]
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

  const dateLocale =
    language === 'ta' ? 'ta-IN' :
    language === 'te' ? 'te-IN' :
    language === 'hi' ? 'hi-IN' :
    language === 'kn' ? 'kn-IN' :
    language === 'ml' ? 'ml-IN' : 'en-IN';

  const currentDateFormatted = new Date().toLocaleDateString(dateLocale, {
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
                  📍 {currentUser?.village || t('dashboard.kodaikanalVillage')}
                </span>
                <span className="text-xs text-[#64748B] font-medium">🗓️ {currentDateFormatted}</span>
                <DemoDataBadge />
              </div>
              <h1 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {t('dashboard.greeting', { name: currentUser?.name || t('dashboard.villager') })} 👋
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
                title={t('dashboard.viewProfile')}
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
                <h2 className="text-base font-black text-[#B91C1C] tracking-tight">{t('dashboard.emergencyTitle')}</h2>
                <p className="text-[11px] text-[#475569]">{t('dashboard.emergencySubtitle')}</p>
              </div>
            </div>
            <span className="bg-white text-[#B91C1C] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
              {t('dashboard.noLoginRequired')}
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
              <span>{t('dashboard.firstAidSteps')}</span>
            </Link>

            <Link
              to="/hospitals"
              className="bg-white hover:bg-[#EFF6FF] rounded-2xl p-2.5 text-center text-xs font-bold text-[#2563EB] border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🏥</span>
              <span>{t('dashboard.nearbyHealthcare')}</span>
            </Link>

            <Link
              to="/transport"
              className="bg-white hover:bg-[#FFF7ED] rounded-2xl p-2.5 text-center text-xs font-bold text-[#EA580C] border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🚑</span>
              <span>{t('dashboard.transportHelp')}</span>
            </Link>

            <button
              onClick={handleQuickEmergencyAlert}
              className={`rounded-2xl p-2.5 text-center text-xs font-bold transition-all border border-[#E2E8F0] min-h-16 flex flex-col items-center justify-center ${
                emergencyAlertSent ? 'bg-[#16A34A] text-white' : 'bg-white text-[#DC2626] hover:bg-[#FEF2F2] shadow-2xs'
              }`}
            >
              <span className="text-lg mb-1">{emergencyAlertSent ? '✅' : '🔔'}</span>
              <span>{emergencyAlertSent ? t('dashboard.alertQueued') : t('dashboard.familyAlertDemo')}</span>
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
                <h2 className="font-extrabold text-sm text-[#0F172A]">{t('dashboard.stayConnectedTitle')}</h2>
                <p className="text-[11px] text-[#64748B]">
                  {t('dashboard.stayConnectedSubtitle')}
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
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.voiceComm')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.voiceCommDesc')}</p>
              </div>
              <span className="text-[9px] text-[#0F766E] font-bold mt-2">{t('dashboard.statusActive')}</span>
            </Link>

            <Link
              to="/sms"
              className="bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2 border border-[#2563EB]/20">
                  📱
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.smsOutbox')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.smsOutboxDesc')}</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">{t('dashboard.demoSimulation')}</span>
            </Link>

            <Link
              to="/ussd"
              className="bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#475569] flex items-center justify-center mb-2 border border-slate-200">
                  🔢
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.ussd')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.ussdDesc')}</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">{t('dashboard.demoSimulation')}</span>
            </Link>

            <Link
              to="/ivr"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#14B8A6]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center mb-2 border border-[#14B8A6]/20">
                  ☎️
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.telephoneSim')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.telephoneSimDesc')}</p>
              </div>
              <span className="text-[9px] text-[#D97706] font-bold mt-2">{t('dashboard.demoSimulation')}</span>
            </Link>

            <Link
              to="/sync"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#0F766E]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mb-2 border border-[#0F766E]/20">
                  🔄
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.syncCenter')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.syncCenterDesc')}</p>
              </div>
              <span className="text-[9px] text-[#0F766E] font-bold mt-2">{t('dashboard.statusActive')}</span>
            </Link>

            <Link
              to="/village"
              className="bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#16A34A]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mb-2 border border-[#16A34A]/20">
                  🏘️
                </div>
                <div className="font-bold text-xs text-[#0F172A]">{t('dashboard.villageDash')}</div>
                <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.villageDashDesc')}</p>
              </div>
              <span className="text-[9px] text-[#16A34A] font-bold mt-2">{t('dashboard.statusActive')}</span>
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
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">⚡ {t('dashboard.quickActionsTitle')}</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { path: '/health-tests', label: t('dashboard.qaRecordTest'), emoji: '🧪', color: 'bg-white border-[#E2E8F0] text-[#0F766E]' },
              { path: '/records', label: t('dashboard.qaAddRecord'), emoji: '📋', color: 'bg-white border-[#E2E8F0] text-[#2563EB]' },
              { path: '/medicines', label: t('dashboard.qaAddMedicine'), emoji: '💊', color: 'bg-white border-[#E2E8F0] text-[#16A34A]' },
              { path: '/language-bridge', label: t('dashboard.qaLanguageBridge'), emoji: '🌐', color: 'bg-white border-[#E2E8F0] text-[#0F766E]' },
              { path: '/doctor-summary', label: t('dashboard.qaDoctorSummary'), emoji: '📄', color: 'bg-white border-[#E2E8F0] text-[#2563EB]' },
              { path: '/emergency', label: t('dashboard.qaEmergencyHelp'), emoji: '🚨', color: 'bg-white border-[#E2E8F0] text-[#DC2626]' }
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
        {/* 6. HEALTH OVERVIEW SECTION                                */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#0F172A]">{t('dashboard.healthOverviewTitle')}</h2>
              <p className="text-xs text-[#64748B]">{t('dashboard.healthOverviewSubtitle')}</p>
            </div>
            <Link to="/health" className="text-xs font-bold text-[#0F766E] hover:underline">
              {t('dashboard.viewFullHealth')}
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
                    <Pill size={15} className="text-[#16A34A]" /> {t('dashboard.activeMedicines')}
                  </span>
                  <Link to="/medicines" className="text-[11px] font-bold text-[#16A34A] hover:underline">
                    {t('dashboard.manage')}
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
                  <p className="text-xs text-[#475569] mt-1">{t('dashboard.noActivePrescriptions')}</p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-[#16A34A]/20 text-[10px] text-[#16A34A]">
                {medicines.filter((m) => (m.missedCount || 0) === 0).length} {t('dashboard.ofCount')} {medicines.length} {t('dashboard.takenOnSchedule')}
              </div>
            </div>

            {/* Recent Vitals Monitor */}
            <div className="bg-[#EFF6FF] border border-[#2563EB]/30 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1.5">
                    <Activity size={15} className="text-[#2563EB]" /> {t('dashboard.recentVitals')}
                  </span>
                  <Link to="/health-tests" className="text-[11px] font-bold text-[#2563EB] hover:underline">
                    {t('dashboard.trends')}
                  </Link>
                </div>
                {recentTests.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {recentTests.slice(0, 2).map((tItem) => (
                      <div key={tItem.id} className="text-xs text-[#0F172A] font-medium">
                        • <span className="capitalize">{tItem.type.replace('_', ' ')}</span>: <strong>{tItem.value} {tItem.unit}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#475569] mt-1">{t('dashboard.noRecentTests')}</p>
                )}
              </div>
              <Link to="/health-tests" className="mt-3 pt-2 border-t border-[#2563EB]/20 text-[10px] text-[#2563EB] font-bold block">
                {t('dashboard.recordNewTest')}
              </Link>
            </div>
          </div>

          {/* Care Gap Alerts */}
          {careGaps.length > 0 && <CareGapAlert gaps={careGaps} />}
        </div>

        {/* ========================================================= */}
        {/* 7. MAIN HEALTHCARE FEATURE GRID (16 Core Cards)          */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-[#0F172A]">{t('dashboard.healthcareFeaturesTitle')}</h2>
              <p className="text-xs text-[#64748B]">{t('dashboard.healthcareFeaturesSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/health', icon: <Heart size={22} className="text-[#0F766E]" />, iconBg: 'bg-[#F0FDFA]', title: t('dashboard.hfMyHealthTitle'), desc: t('dashboard.hfMyHealthDesc') },
              { path: '/family', icon: <Users size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: t('dashboard.hfFamilyTitle'), desc: t('dashboard.hfFamilyDesc') },
              { path: '/records', icon: <FileText size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: t('dashboard.hfRecordsTitle'), desc: t('dashboard.hfRecordsDesc') },
              { path: '/medicines', icon: <Pill size={22} className="text-[#16A34A]" />, iconBg: 'bg-[#F0FDF4]', title: t('dashboard.hfMedicinesTitle'), desc: t('dashboard.hfMedicinesDesc') },
              { path: '/health-tests', icon: <Activity size={22} className="text-[#14B8A6]" />, iconBg: 'bg-[#F0FDFA]', title: t('dashboard.hfTestsTitle'), desc: t('dashboard.hfTestsDesc') },
              { path: '/records', icon: <Shield size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: t('dashboard.hfReportsTitle'), desc: t('dashboard.hfReportsDesc') },
              { path: '/report-scanner', icon: <Camera size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: t('dashboard.hfReportScannerTitle'), desc: t('dashboard.hfReportScannerDesc') },
              { path: '/xray-viewer', icon: <Image size={22} className="text-[#475569]" />, iconBg: 'bg-[#F1F5F9]', title: t('dashboard.hfXrayTitle'), desc: t('dashboard.hfXrayDesc') },
              { path: '/doctor-portal', icon: <Stethoscope size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: t('dashboard.hfDoctorConsultTitle'), desc: t('dashboard.hfDoctorConsultDesc') },
              { path: '/doctor-summary', icon: <FileText size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: t('dashboard.hfDoctorSummaryTitle'), desc: t('dashboard.hfDoctorSummaryDesc') },
              { path: '/ai', icon: <Bot size={22} className="text-[#7C3AED]" />, iconBg: 'bg-[#F5F3FF]', title: t('dashboard.hfAiAssistantTitle'), desc: t('dashboard.hfAiAssistantDesc') },
              { path: '/hospitals', icon: <Building2 size={22} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', title: t('dashboard.hfNearbyHospitalsTitle'), desc: t('dashboard.hfNearbyHospitalsDesc') },
              { path: '/vaccination', icon: <Syringe size={22} className="text-[#16A34A]" />, iconBg: 'bg-[#F0FDF4]', title: t('dashboard.hfVaccinationsTitle'), desc: t('dashboard.hfVaccinationsDesc') },
              { path: '/education', icon: <BookOpen size={22} className="text-[#0F766E]" />, iconBg: 'bg-[#F0FDFA]', title: t('dashboard.hfEducationTitle'), desc: t('dashboard.hfEducationDesc') },
              { path: '/schemes', icon: <Landmark size={22} className="text-[#4F46E5]" />, iconBg: 'bg-[#EEF2FF]', title: t('dashboard.hfGovtSchemesTitle'), desc: t('dashboard.hfGovtSchemesDesc') },
              { path: '/emergency', icon: <AlertTriangle size={22} className="text-[#DC2626]" />, iconBg: 'bg-[#FEF2F2]', title: t('dashboard.hfEmergencyHelpTitle'), desc: t('dashboard.hfEmergencyHelpDesc') }
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
                <span className="text-[10px] font-extrabold text-[#0F766E] mt-3 block group-hover:translate-x-0.5 transition-transform">{t('dashboard.openCard')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 8. SPECIALIZED FAMILY CARE SECTION                        */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-[#0F172A]">{t('dashboard.familyCareTitle')}</h2>
              <p className="text-xs text-[#64748B]">{t('dashboard.familyCareSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { path: '/childcare', emoji: '👶', title: t('dashboard.fcChildTitle'), desc: t('dashboard.fcChildDesc'), iconBg: 'bg-[#EFF6FF]', textColor: 'text-[#2563EB]' },
              { path: '/maternity', emoji: '🤰', title: t('dashboard.fcMaternityTitle'), desc: t('dashboard.fcMaternityDesc'), iconBg: 'bg-[#FDF2F8]', textColor: 'text-[#DB2777]' },
              { path: '/newborn', emoji: '🍼', title: t('dashboard.fcNewbornTitle'), desc: t('dashboard.fcNewbornDesc'), iconBg: 'bg-[#F0FDFA]', textColor: 'text-[#14B8A6]' },
              { path: '/maternity', emoji: '🌸', title: t('dashboard.fcNewMotherTitle'), desc: t('dashboard.fcNewMotherDesc'), iconBg: 'bg-[#FDF2F8]', textColor: 'text-[#DB2777]' },
              { path: '/elderly', emoji: '👵', title: t('dashboard.fcElderlyTitle'), desc: t('dashboard.fcElderlyDesc'), iconBg: 'bg-[#EEF2FF]', textColor: 'text-[#4F46E5]' },
              { path: '/health-tests', emoji: '🩺', title: t('dashboard.fcDiabetesTitle'), desc: t('dashboard.fcDiabetesDesc'), iconBg: 'bg-[#FFF7ED]', textColor: 'text-[#EA580C]' },
              { path: '/education', emoji: '🥗', title: t('dashboard.fcNutritionTitle'), desc: t('dashboard.fcNutritionDesc'), iconBg: 'bg-[#F0FDF4]', textColor: 'text-[#16A34A]' }
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
                <span className={`text-[10px] font-extrabold mt-3 block ${care.textColor}`}>{t('dashboard.viewCareHub')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9. RECENT HEALTH ACTIVITY (Real Local IndexedDB Data)    */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-[#0F172A]">{t('dashboard.recentActivityTitle')}</h2>
            <span className="text-[11px] text-[#64748B]">{t('dashboard.fromLocalDb')}</span>
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
                {t('dashboard.noRecentAlerts')}
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-2 text-[11px] text-[#64748B] space-y-1">
          <p className="font-semibold text-[#0F172A]">{t('dashboard.footerTagline')}</p>
          <p className="text-[10px] text-[#64748B]">{t('dashboard.footerDemoDisclaimer')}</p>
        </div>
      </div>
    </Layout>
  );
}
