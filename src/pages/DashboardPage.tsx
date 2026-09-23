import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine, Notification, Appointment } from '../db/db';
import Layout from '../components/Layout';
import HealthScoreCard from '../components/HealthScoreCard';
import CareGapAlert from '../components/CareGapAlert';
import DemoDataBadge from '../components/DemoDataBadge';

const DASHBOARD_CARDS = [
  { path: '/health', emoji: '🩺', key: 'myHealth', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { path: '/family', emoji: '👪', key: 'family', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { path: '/elderly', emoji: '👴', key: 'elderly', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { path: '/childcare', emoji: '👶', key: 'child', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { path: '/maternity', emoji: '🤰', key: 'maternity', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { path: '/newborn', emoji: '🍼', key: 'newborn', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { path: '/medicines', emoji: '💊', key: 'medicines', color: 'bg-green-50 border-green-200 text-green-700' },
  { path: '/records', emoji: '📋', key: 'records', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { path: '/health-tests', emoji: '🧪', key: 'healthTests', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { path: '/report-scanner', emoji: '📷', key: 'reportScanner', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { path: '/xray-viewer', emoji: '🩻', key: 'xrayViewer', color: 'bg-gray-50 border-gray-300 text-gray-700' },
  { path: '/ai', emoji: '🤖', key: 'aiAssist', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { path: '/ai?mode=voice', emoji: '🎤', key: 'speakMedora', color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
  { path: '/doctor-summary', emoji: '📄', key: 'doctorSummary', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { path: '/hospitals', emoji: '🏥', key: 'hospitals', color: 'bg-red-50 border-red-200 text-red-700' },
  { path: '/emergency', emoji: '🚨', key: 'emergency', color: 'bg-red-100 border-red-300 text-red-800' },
  { path: '/transport', emoji: '🚑', key: 'transport', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { path: '/vaccination', emoji: '💉', key: 'vaccination', color: 'bg-lime-50 border-lime-200 text-lime-700' },
  { path: '/schemes', emoji: '🏛️', key: 'schemes', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { path: '/education', emoji: '📚', key: 'education', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { path: '/sms', emoji: '📱', key: 'sms', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { path: '/ivr', emoji: '☎️', key: 'ivr', color: 'bg-green-50 border-green-200 text-green-700' },
  { path: '/ussd', emoji: '🔢', key: 'ussd', color: 'bg-gray-50 border-gray-200 text-gray-700' },
  { path: '/village', emoji: '🏘️', key: 'village', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { path: '/sync', emoji: '🔄', key: 'sync', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { path: '/notifications', emoji: '🔔', key: 'notifications', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
];

const CARD_LABELS: Record<string, string> = {
  myHealth: 'My Health', family: 'Family', elderly: 'Elderly Care', child: 'Child Care',
  maternity: 'Maternity', newborn: 'Newborn', medicines: 'Medicines', records: 'Records',
  healthTests: 'Health Tests', reportScanner: 'Report Scanner', xrayViewer: 'X-Ray Viewer',
  aiAssist: 'Ask Medora', speakMedora: 'Speak to Medora', doctorSummary: 'Doctor Summary',
  hospitals: 'Hospitals', emergency: 'Emergency', transport: 'Transport',
  vaccination: 'Vaccination', schemes: 'Schemes', education: 'Education',
  sms: 'SMS Center', ivr: 'Voice Helpline', ussd: 'Basic Phone',
  village: 'Village Health', sync: 'Sync Center', notifications: 'Notifications',
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const healthScore = (() => {
    if (!currentUser) return 70;
    const patient = currentUser as any;
    let score = 60;
    if (patient.conditions?.length === 0) score += 10;
    if (patient.isPregnant) score -= 5;
    if (patient.vaccinations?.length > 0) score += 10;
    return Math.min(100, score);
  })();

  useEffect(() => {
    if (!currentUser?.id || currentUser.role === 'family') return;
    const patId = currentUser.role === 'patient' ? currentUser.id : undefined;
    if (patId) {
      db.medicines.where({ patientId: patId, status: 'active' }).limit(3).toArray().then(setMedicines);
      db.appointments.where({ patientId: patId }).toArray().then(setAppointments);
    }
    db.notifications.where({ userId: currentUser.id, isRead: false }).limit(3).toArray().then(setNotifications);
  }, [currentUser]);

  const careGaps = [
    ...(medicines.some(m => m.missedCount && m.missedCount > 0) ? [{ type: 'medicine' as const, message: t('health.careGaps') + ': Medicine missed', link: '/medicines' }] : []),
    ...(appointments.length === 0 ? [{ type: 'appointment' as const, message: 'No upcoming appointments scheduled', link: '/doctor-summary' }] : []),
  ];

  const cards = [
    ...DASHBOARD_CARDS,
    ...(currentUser?.role === 'doctor' ? [{ path: '/doctor-portal', emoji: '👨‍⚕️', key: 'doctorPortal', color: 'bg-sky-100 border-sky-300 text-sky-800' }] : []),
    ...(currentUser?.role === 'admin' ? [{ path: '/admin-portal', emoji: '🔑', key: 'adminPortal', color: 'bg-red-100 border-red-300 text-red-800' }] : []),
  ];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {t('dashboard.greeting', { name: currentUser?.name?.split(' ')[0] || 'User' })}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 capitalize">{currentUser?.role} · {currentUser?.village || 'Kodaikanal'}</span>
              <DemoDataBadge />
            </div>
          </div>
          <div className="text-3xl">{currentUser?.role === 'doctor' ? '👨‍⚕️' : currentUser?.role === 'admin' ? '🔑' : '👤'}</div>
        </div>

        {/* Health Score */}
        {currentUser?.role === 'patient' && (
          <div className="mb-4">
            <HealthScoreCard score={healthScore} />
          </div>
        )}

        {/* Care Gaps */}
        {careGaps.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-700 mb-2">{t('dashboard.careGaps')}</h2>
            <CareGapAlert gaps={careGaps} />
          </div>
        )}

        {/* Upcoming medicines */}
        {medicines.length > 0 && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-orange-800 text-sm">💊 {t('dashboard.medicinesDue')}</h2>
              <Link to="/medicines" className="text-xs text-orange-600 font-medium">{t('common.viewAll')}</Link>
            </div>
            {medicines.slice(0, 2).map(m => (
              <div key={m.id} className="text-sm text-orange-700 flex items-center gap-2 py-1">
                <span>•</span> {m.name} – {m.times?.join(', ')}
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-blue-800 text-sm">🔔 {t('nav.notifications')}</h2>
              <Link to="/notifications" className="text-xs text-blue-600 font-medium">{t('common.viewAll')}</Link>
            </div>
            {notifications.slice(0, 2).map(n => (
              <div key={n.id} className="text-sm text-blue-700 flex items-center gap-2 py-1">
                <span>•</span> {n.message}
              </div>
            ))}
          </div>
        )}

        {/* Feature Cards Grid */}
        <h2 className="font-bold text-gray-800 mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {cards.map(card => (
            <Link
              key={card.path + card.key}
              to={card.path}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center hover:opacity-80 active:scale-95 transition-all ${card.color}`}
            >
              <span className="text-2xl mb-1">{card.emoji}</span>
              <span className="text-xs font-semibold leading-tight">
                {t(`nav.${card.key}`, CARD_LABELS[card.key] || card.key)}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">{t('common.demoData')} · {t('common.disclaimer')}</p>
        </div>
      </div>

      {/* Emergency FAB */}
      <Link
        to="/emergency"
        className="fixed bottom-20 right-4 bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl text-2xl hover:bg-red-700 active:scale-95 transition-all z-30"
        title={t('nav.emergency')}
      >
        🚨
      </Link>
    </Layout>
  );
}
