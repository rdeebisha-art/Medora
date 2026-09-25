import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine, Notification, Appointment, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import HealthScoreCard from '../components/HealthScoreCard';
import CareGapAlert from '../components/CareGapAlert';
import DemoDataBadge from '../components/DemoDataBadge';
import SpeakToMedoraCard from '../components/SpeakToMedoraCard';
import MedoraHealthcareTeam from '../components/MedoraHealthcareTeam';
import { RecentHealthActivitySection } from '../components/RecentHealthActivitySection';
import {
  TriangleAlert as AlertTriangle,
  Sparkles,
  Heart,
  Users,
  Pill,
  FileText,
  Activity,
  Shield,
  Camera,
  Image,
  Stethoscope,
  Bot,
  Building as Building2,
  Syringe,
  BookOpen,
  Landmark,
  Radio,
  Smartphone,
  Check
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, language, isSimpleMode, toggleSimpleMode } = useAppStore();
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
      ? [{ type: 'checkup' as const, message: t('dashboard.noCheckupAlert'), link: '/appointments' }]
      : [])
  ];

  const handleQuickEmergencyAlert = async () => {
    try {
      const pId = currentUser?.id || 1;
      const famId = (currentUser as any)?.familyId || 1;
      const patientName = currentUser?.name || 'Patient';
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await db.emergencyIncidents.add({
        incidentId: `INC-${Date.now()}`,
        patientId: pId,
        timestamp: new Date().toISOString(),
        detectedLanguage: language,
        emergencyType: 'DASHBOARD_QUICK_ALERT',
        severity: 'HIGH',
        source: 'MANUAL_BUTTON',
        status: 'LOCAL_ONLY',
        dispatchStatus: 'LOCAL_ONLY',
        createdAt: new Date().toISOString(),
      });

      await db.familyAlertOutbox.add({
        alertId: `ALT-${Date.now()}`,
        familyId: famId,
        patientId: pId,
        recipientName: 'Family Contacts',
        recipientPhone: currentUser?.phone || 'Emergency Contact',
        message: `🚨 EMERGENCY ALERT from MEDORA: Urgent medical help requested for ${patientName} at ${timestamp}.`,
        language,
        timestamp: new Date().toISOString(),
        status: 'PENDING_OFFLINE',
      });

      await db.smsOutbox.add({
        toPhone: '108 & Family Contact',
        message: `EMERGENCY ALERT from MEDORA: Urgent medical help requested for ${patientName} in Kodaikanal.`,
        type: 'emergency_alert',
        language,
        status: 'PENDING_OFFLINE',
        createdAt: new Date().toISOString()
      });
      setEmergencyAlertSent(true);
      setTimeout(() => setEmergencyAlertSent(false), 4000);
    } catch (e) {
      console.error(e);
    }
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

  const getLocalizedFrequency = (freq?: string) => {
    if (!freq) return '';
    const lower = freq.toLowerCase();
    if (lower.includes('once')) return t('medicineFreq.onceDaily', 'Once daily');
    if (lower.includes('twice')) return t('medicineFreq.twiceDaily', 'Twice daily');
    if (lower.includes('three') || lower.includes('thrice')) return t('medicineFreq.thriceDaily', 'Three times daily');
    return freq;
  };

  const getLocalizedNotification = (n: Notification) => {
    if (language === 'ta' && n.messageTa) return n.messageTa;
    if (language === 'hi' && n.messageHi) return n.messageHi;

    const msg = n.message || '';
    if (msg.includes('TT Booster')) {
      return language === 'ta'
        ? 'உங்கள் டிடி பூஸ்டர் தடுப்பூசி அடுத்த வாரம் செலுத்தப்பட வேண்டும்'
        : language === 'te'
        ? 'మీ TT బూస్టర్ టీకా వచ్చే వారం వేయించుకోవాల్సి ఉంది'
        : language === 'ml'
        ? 'നിങ്ങളുടെ ടിടി ബൂസ്റ്റർ വാക്സിനേഷൻ അടുത്ത ആഴ്ച എടുക്കേണ്ടതാണ്'
        : language === 'kn'
        ? 'ನಿಮ್ಮ ಟಿಟಿ ಬೂಸ್ಟರ್ ಲಸಿಕೆ ಮುಂದಿನ ವಾರ ಬಾಕಿಯಿದೆ'
        : language === 'hi'
        ? 'आपका टीटी बूस्टर टीकाकरण अगले सप्ताह देय है'
        : msg;
    }
    if (msg.includes('Antenatal checkup')) {
      return language === 'ta'
        ? 'டாக்டர் அர்ஜுன் மேத்தாவுடன் அடுத்த வாரம் மகப்பேறு பரிசோதனை திட்டமிடப்பட்டுள்ளது'
        : language === 'te'
        ? 'డాక్టర్ అర్జున్ మెహతాతో వచ్చే వారం ప్రసవపూర్వ తనిఖీ షెడ్యూల్ చేయబడింది'
        : language === 'ml'
        ? 'ഡോ. അർജുൻ മെഹ്തയുമായി അടുത്ത ആഴ്ച പ്രസവപൂർവ്വ പരിശോധന നിശ്ചയിച്ചിട്ടുണ്ട്'
        : language === 'kn'
        ? 'ಡಾ. ಅರ್ಜುನ್ ಮೆಹ್ತಾ ಅವರೊಂದಿಗೆ ಮುಂದಿನ ವಾರ ಪ್ರಸವಪೂರ್ವ ತಪಾಸಣೆ ನಿಗದಿಯಾಗಿದೆ'
        : language === 'hi'
        ? 'डॉ. अर्जुन मेहता के साथ अगले सप्ताह प्रसवपूर्व जाँच निर्धारित है'
        : msg;
    }
    if (msg.includes('Metformin')) {
      return language === 'ta'
        ? 'மெட்ஃபோர்மின் 500 மி.கி இன்று மாலை 7:30 மணிக்கு உட்கொள்ள வேண்டும்'
        : language === 'te'
        ? 'మెట్‌ఫార్మిన్ 500mg ఈరోజు రాత్రి 7:30 గంటలకు తీసుకోవాల్సి ఉంది'
        : language === 'ml'
        ? 'മെറ്റ്ഫോർമിൻ 500mg ഇന്ന് വൈകുന്നേരം 7:30 ന് കഴിക്കേണ്ടതാണ്'
        : language === 'kn'
        ? 'ಮೆಟ್‌ಫಾರ್ಮಿನ್ 500mg ಇಂದು ಸಂಜೆ 7:30 ಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾಗಿದೆ'
        : language === 'hi'
        ? 'मेटफॉर्मिन 500mg आज शाम 7:30 बजे देय है'
        : msg;
    }
    if (msg.includes('Influenza')) {
      return language === 'ta'
        ? 'இன்ஃப்ளூயன்ஸா தடுப்பூசி நவம்பர் மாதம் செலுத்தப்பட வேண்டும்'
        : language === 'te'
        ? 'ఇన్‌ఫ్లుయెంజా వ్యాక్సిన్ నవంబర్‌లో వేయించుకోవాలి'
        : language === 'ml'
        ? 'ഇൻഫ്ലുവൻസ വാക്സിൻ നവംബറിൽ എടുക്കേണ്ടതാണ്'
        : language === 'kn'
        ? 'ಇನ್ಫ್ಲುಯೆಂಜಾ ಲಸಿಕೆ ನವೆಂಬರ್‌ನಲ್ಲಿ ಬಾಕಿಯಿದೆ'
        : language === 'hi'
        ? 'इन्फ्लूएंजा टीका नवंबर में देय है'
        : msg;
    }
    if (msg.includes('Hepatitis B') || msg.includes('Baby Arjun')) {
      return language === 'ta'
        ? 'குழந்தை அர்ஜுன் – ஹெபடைடிஸ் பி பிறப்பு டோஸ் செலுத்தப்பட வேண்டும்'
        : language === 'te'
        ? 'బేబీ అర్జున్ – హెపటైటిస్ బి జనన డోస్ వేయించాల్సి ఉంది'
        : language === 'ml'
        ? 'ബേബി അർജുൻ – ഹെപ്പറ്റൈറ്റിസ് ബി ജനന ഡോസ് നൽകേണ്ടതുണ്ട്'
        : language === 'kn'
        ? 'ಬೇಬಿ ಅರ್ಜುನ್ – ಹೆಪಟೈಟಿಸ್ ಬಿ ಜನನ ಡೋಸ್ ಬಾಕಿಯಿದೆ'
        : language === 'hi'
        ? 'बेबी अर्जुन – हेपेटाइटिस बी जन्म खुराक देय है'
        : msg;
    }

    return msg;
  };

  const [basicPhoneCursor, setBasicPhoneCursor] = useState<number>(1);

  const basicPhoneMenu = [
    { num: 1, label: t('nav.myHealth', 'My Health'), path: '/health', desc: 'Blood pressure, Sugar & Vitals' },
    { num: 2, label: t('nav.family', 'Family Health'), path: '/family', desc: 'Household Members & Care' },
    { num: 3, label: t('nav.medicines', 'Medicines & Reminders'), path: '/medicines', desc: 'Active Doses & Schedule' },
    { num: 4, label: t('dashboard.hfDoctorConsultTitle', 'Doctor Consultation'), path: '/doctor-portal', desc: 'PHC Doctors & Consultations' },
    { num: 5, label: t('dashboard.hfNearbyHospitalsTitle', 'Hospital Directory'), path: '/hospitals', desc: 'Local PHCs, CHCs & Ambulance' },
    { num: 6, label: `🚨 ${t('nav.emergency', 'Emergency Help')} (108)`, path: '/emergency', desc: 'Instant First Aid & 108 Dispatch' },
    { num: 7, label: t('nav.education', 'Health Advice / Education'), path: '/education', desc: 'Prevention, Nutrition & Hygiene' },
    { num: 8, label: t('common.interfaceLanguage', 'Change Language'), path: '/settings', desc: 'Tamil, Telugu, Hindi, Kannada, Malayalam, English' }
  ];

  // Physical keyboard support for button-phone simulation
  useEffect(() => {
    if (!isSimpleMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        navigate(basicPhoneMenu[num - 1].path);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBasicPhoneCursor(prev => (prev > 1 ? prev - 1 : 8));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBasicPhoneCursor(prev => (prev < 8 ? prev + 1 : 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        navigate(basicPhoneMenu[basicPhoneCursor - 1].path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimpleMode, basicPhoneCursor, navigate]);

  // BASIC PHONE MODE SIMULATION (Section 5)
  if (isSimpleMode) {
    return (
      <Layout>
        <div className="px-3 sm:px-4 py-5 max-w-xl mx-auto space-y-4">
          {/* Basic Phone Mode Header */}
          <div className="bg-[#111827] text-white p-5 rounded-3xl border-4 border-[#0F766E] shadow-xl">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="bg-[#0F766E] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                📟 BASIC PHONE MODE [SIMULATION]
              </span>
              <button
                onClick={toggleSimpleMode}
                className="text-xs bg-white text-[#111827] font-bold px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors min-h-8"
              >
                ✕ Switch to Standard View
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-teal-400">
              MEDORA BASIC PHONE
            </h1>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Browser simulation of basic button phone interface demonstrating USSD text menu and keypad navigation for rural low-bandwidth areas. (Simulated experience; does not run on physical legacy phones).
            </p>
          </div>

          {/* High-Contrast LCD Screen Display */}
          <div className="bg-[#0D1B1E] border-4 border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl text-[#5EFC82] font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2 text-xs text-[#8EFEC2]">
              <span>[BAT: 100%] [📶 2G]</span>
              <span>MEDORA OS v1.0</span>
            </div>

            <div className="text-xs text-slate-400 uppercase tracking-wider font-sans font-bold">
              {t('common.simpleMode', 'Select option (Press 1-8 or use keys below):')}
            </div>

            <div className="space-y-1.5 divide-y divide-slate-800/80 font-sans">
              {basicPhoneMenu.map((item) => {
                const isSelected = basicPhoneCursor === item.num;
                return (
                  <button
                    key={item.num}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setBasicPhoneCursor(item.num)}
                    className={`w-full pt-2 pb-2 px-3 flex items-center gap-3 text-left rounded-xl transition-all min-h-12 ${
                      isSelected
                        ? 'bg-[#0F766E] text-white shadow-md ring-2 ring-teal-400'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center flex-shrink-0 font-mono ${
                      isSelected ? 'bg-white text-[#0F766E]' : 'bg-slate-800 text-teal-300 border border-slate-700'
                    }`}>
                      {item.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black truncate">
                        {item.label}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <span className="text-sm font-black">
                      {isSelected ? '▶' : '→'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Phone Keypad Simulation Controls */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-4 shadow-xl text-white">
            <div className="text-center text-[11px] text-slate-400 font-bold mb-3 uppercase tracking-wider">
              🎮 Button Phone Keypad Controls
            </div>

            {/* Directional & Select Pad */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setBasicPhoneCursor(prev => (prev > 1 ? prev - 1 : 8))}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 min-h-11 shadow-sm border border-slate-600"
              >
                ▲ UP
              </button>
              <button
                onClick={() => navigate(basicPhoneMenu[basicPhoneCursor - 1].path)}
                className="px-6 py-3 bg-[#0F766E] hover:bg-teal-600 active:scale-95 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 min-h-11 shadow-md border border-teal-500"
              >
                OK [SELECT]
              </button>
              <button
                onClick={() => setBasicPhoneCursor(prev => (prev < 8 ? prev + 1 : 1))}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 min-h-11 shadow-sm border border-slate-600"
              >
                ▼ DOWN
              </button>
            </div>

            {/* Number Keypad Grid 1-9, *, 0, # */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => navigate(basicPhoneMenu[num - 1].path)}
                  className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-xl text-center border border-slate-600 min-h-11 transition-all"
                >
                  <span className="block font-black text-sm text-teal-300">{num}</span>
                  <span className="block text-[9px] text-slate-400 truncate px-1">
                    {basicPhoneMenu[num - 1].label.split(' ')[0]}
                  </span>
                </button>
              ))}
              <Link
                to="/emergency"
                className="bg-red-700 hover:bg-red-600 active:scale-95 py-2.5 rounded-xl text-center border border-red-500 min-h-11 transition-all flex flex-col items-center justify-center"
              >
                <span className="block font-black text-sm text-white">9 / SOS</span>
                <span className="block text-[9px] text-red-200">108 Help</span>
              </Link>
              <Link
                to="/ussd"
                className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-xl text-center border border-slate-600 min-h-11 transition-all flex flex-col items-center justify-center"
              >
                <span className="block font-black text-sm text-amber-400">*</span>
                <span className="block text-[9px] text-slate-400">USSD</span>
              </Link>
              <Link
                to="/ivr"
                className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-xl text-center border border-slate-600 min-h-11 transition-all flex flex-col items-center justify-center"
              >
                <span className="block font-black text-sm text-teal-300">0</span>
                <span className="block text-[9px] text-slate-400">Voice IVR</span>
              </Link>
              <Link
                to="/sms"
                className="bg-slate-700 hover:bg-slate-600 active:scale-95 py-2.5 rounded-xl text-center border border-slate-600 min-h-11 transition-all flex flex-col items-center justify-center"
              >
                <span className="block font-black text-sm text-sky-400">#</span>
                <span className="block text-[9px] text-slate-400">SMS Outbox</span>
              </Link>
            </div>
          </div>

          {/* Simulated USSD dialing shortcut */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 text-center text-xs text-[#64748B]">
            <span className="font-semibold text-[#0F172A]">Demo USSD Code: </span>
            <code className="bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#0F766E]/30 font-mono text-[#0F766E] font-bold">
              *141*9999#
            </code>
            <p className="text-[10px] text-[#94A3B8] mt-1">
              Simulated browser demonstration representing telecommunications protocols in low-bandwidth rural health environments.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // STANDARD MODE DASHBOARD
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden min-w-0 break-words">
        {/* ========================================================= */}
        {/* 1. WELCOME SECTION                                        */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-[#F0FDFA] via-[#EFF6FF]/60 to-[#F0FDFA] border border-[#E2E8F0] rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-[#0F766E] border border-[#E2E8F0]">
                  📍 {currentUser?.village || t('dashboard.kodaikanalVillage')}
                </span>
                <span className="text-xs text-[#64748B] font-medium">🗓️ {currentDateFormatted}</span>
                <DemoDataBadge />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0F766E] tracking-tight">
                {t('dashboard.greeting', { name: currentUser?.name || t('dashboard.villager') })} 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-xl leading-relaxed">
                {t('app.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={toggleSimpleMode}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#0F766E] border border-[#E2E8F0] text-xs font-bold px-3 py-2 rounded-2xl shadow-xs min-h-11"
                title="Switch to Basic Phone Mode"
              >
                <Smartphone size={14} />
                <span>Basic Phone Mode</span>
              </button>
              <Link
                to="/ai"
                className="flex items-center gap-1.5 bg-[#14B8A6] hover:bg-[#0F766E] text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-sm min-h-11"
              >
                <span>🎙️ {t('ai.speak')}</span>
              </Link>
              <Link
                to="/profile"
                className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] text-[#0F766E] flex items-center justify-center font-bold text-sm shadow-xs"
                title={t('dashboard.viewProfile')}
              >
                {currentUser?.name ? currentUser.name[0] : '👤'}
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. EMERGENCY SECTION (Prominent Red Callout)             */}
        {/* ========================================================= */}
        <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg border border-[#E2E8F0] flex-shrink-0 shadow-2xs">
                🚨
              </div>
              <div>
                <h2 className="text-base font-black text-[#B91C1C] tracking-tight">{t('dashboard.emergencyTitle')}</h2>
                <p className="text-[11px] text-[#475569]">{t('dashboard.emergencySubtitle')}</p>
              </div>
            </div>
            <span className="self-start sm:self-auto bg-white text-[#B91C1C] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
              {t('dashboard.noLoginRequired')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
            <Link
              to="/emergency"
              className="bg-[#DC2626] hover:bg-[#B91C1C] rounded-2xl p-3 text-center text-xs font-bold text-white min-h-14 flex flex-col items-center justify-center shadow-xs active:scale-95 transition-all"
            >
              <span className="text-base sm:text-lg mb-0.5">🩹</span>
              <span>🚨 {t('nav.emergency')}</span>
            </Link>

            <Link
              to="/emergency"
              className="bg-white hover:bg-[#FEF2F2] rounded-2xl p-3 text-center text-xs font-bold text-[#B91C1C] border border-[#E2E8F0] min-h-14 flex flex-col items-center justify-center shadow-2xs active:scale-95 transition-all"
            >
              <span className="text-base sm:text-lg mb-0.5">🩺</span>
              <span>{t('dashboard.firstAidSteps')}</span>
            </Link>

            <Link
              to="/hospitals"
              className="bg-white hover:bg-[#EFF6FF] rounded-2xl p-3 text-center text-xs font-bold text-[#2563EB] border border-[#E2E8F0] min-h-14 flex flex-col items-center justify-center shadow-2xs active:scale-95 transition-all"
            >
              <span className="text-base sm:text-lg mb-0.5">🏥</span>
              <span>{t('dashboard.nearbyHealthcare')}</span>
            </Link>

            <Link
              to="/transport"
              className="bg-white hover:bg-[#FFF7ED] rounded-2xl p-3 text-center text-xs font-bold text-[#EA580C] border border-[#E2E8F0] min-h-14 flex flex-col items-center justify-center shadow-2xs active:scale-95 transition-all"
            >
              <span className="text-base sm:text-lg mb-0.5">🚑</span>
              <span>{t('dashboard.transportHelp')}</span>
            </Link>

            <button
              onClick={handleQuickEmergencyAlert}
              className={`rounded-2xl p-3 text-center text-xs font-bold transition-all border border-[#E2E8F0] min-h-14 flex flex-col items-center justify-center col-span-2 sm:col-span-1 shadow-2xs active:scale-95 ${
                emergencyAlertSent ? 'bg-[#16A34A] text-white' : 'bg-white text-[#DC2626] hover:bg-[#FEF2F2]'
              }`}
            >
              <span className="text-base sm:text-lg mb-0.5">{emergencyAlertSent ? '✅' : '🔔'}</span>
              <span>{emergencyAlertSent ? t('dashboard.alertQueued') : t('dashboard.familyAlertDemo')}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. STAY CONNECTED — RURAL TELECOM INTEGRATION SECTION     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center border border-[#14B8A6]/20 flex-shrink-0">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <Link
              to="/ai"
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#14B8A6]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
              className="bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#2563EB]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
              className="bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#14B8A6]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
              className="bg-[#F8FAFC] hover:bg-[#F0FDFA] border border-[#E2E8F0] hover:border-[#0F766E]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
              className="bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#16A34A]/40 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs min-h-24"
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
        {/* 4. SPEAK TO MEDORA (Multi-lingual Voice Interface)        */}
        {/* ========================================================= */}
        <SpeakToMedoraCard />

        {/* ========================================================= */}
        {/* 5. QUICK ACTIONS ROW                                      */}
        {/* ========================================================= */}
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
            ⚡ {t('dashboard.quickActionsTitle')}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { path: '/appointments', label: t('appointments.title', 'Appointments'), emoji: '📅', color: 'bg-white border-[#E2E8F0] text-[#0F766E]' },
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
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap shadow-xs hover:shadow-md min-h-11 transition-all ${action.color}`}
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
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#0F172A]">{t('dashboard.healthOverviewTitle')}</h2>
              <p className="text-xs text-[#64748B]">{t('dashboard.healthOverviewSubtitle')}</p>
            </div>
            <Link to="/health" className="text-xs font-bold text-[#0F766E] hover:underline min-h-9 flex items-center">
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
                        • {m.name} ({m.dose}) – {getLocalizedFrequency(m.frequency)}
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

            {/* Recent Vitals Monitor (100% Localized) */}
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
                        • <span>{t('vitals.' + tItem.type, tItem.type.replace('_', ' '))}</span>: <strong>{tItem.value} {tItem.unit}</strong>
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

          {/* Recent Health Activity Timeline */}
          <RecentHealthActivitySection />
        </div>

        {/* ========================================================= */}
        {/* 7. MAIN HEALTHCARE FEATURE GRID (17 Core Cards)          */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-[#0F172A]">{t('dashboard.healthcareFeaturesTitle')}</h2>
              <p className="text-xs text-[#64748B]">{t('dashboard.healthcareFeaturesSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { path: '/a2a-simulation', icon: <Sparkles size={22} className="text-[#0F766E]" />, iconBg: 'bg-[#F0FDFA]', title: '🤖 Agent Simulation', desc: 'Multi-specialist clinical reasoning & safe diagnostic triage simulation' },
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
                className="bg-white border border-[#E2E8F0] hover:border-teal-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-36"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs mb-2.5 border border-black/5 group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] leading-snug break-words">{card.title}</h3>
                  <p className="text-[11px] text-[#475569] mt-1 leading-normal break-words">{card.desc}</p>
                </div>
                <span className="text-[10px] font-extrabold text-[#0F766E] mt-3 block group-hover:translate-x-0.5 transition-transform">
                  {t('dashboard.openCard')}
                </span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                className="bg-white border border-[#E2E8F0] hover:border-teal-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-36"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${care.iconBg} flex items-center justify-center text-xl mb-2.5 border border-black/5 group-hover:scale-105 transition-transform`}>
                    {care.emoji}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#0F172A] mb-1 break-words">{care.title}</h3>
                  <p className="text-[11px] text-[#475569] leading-normal break-words">{care.desc}</p>
                </div>
                <span className={`text-[10px] font-extrabold mt-3 block ${care.textColor}`}>
                  {t('dashboard.viewCareHub')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MEDORA HEALTHCARE TEAM (10 Dedicated Rural Doctors)       */}
        {/* ========================================================= */}
        <MedoraHealthcareTeam />

        {/* ========================================================= */}
        {/* 9. RECENT HEALTH ACTIVITY (100% Localized Database Data)  */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F172A] break-words">{getLocalizedNotification(n)}</p>
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
        <div className="text-center py-3 text-[11px] text-[#64748B] space-y-1">
          <p className="font-semibold text-[#0F172A]">{t('dashboard.footerTagline')}</p>
          <p className="text-[10px] text-[#64748B]">{t('dashboard.footerDemoDisclaimer')}</p>
        </div>
      </div>
    </Layout>
  );
}
