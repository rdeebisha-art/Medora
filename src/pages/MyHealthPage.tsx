import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Medicine, HealthTest, Vaccination, Appointment } from '../db/db';
import Layout from '../components/Layout';
import HealthScoreCard from '../components/HealthScoreCard';
import CareGapAlert from '../components/CareGapAlert';
import MedicineCard from '../components/MedicineCard';
import DemoDataBadge from '../components/DemoDataBadge';

export default function MyHealthPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [vitals, setVitals] = useState<HealthTest[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'patient') return;
    db.patients.get(currentUser.id).then(p => setPatient(p || null));
    db.medicines.where({ patientId: currentUser.id, status: 'active' }).toArray().then(setMedicines);
    db.healthTests.where('patientId').equals(currentUser.id).reverse().limit(6).toArray().then(setVitals);
    db.vaccinations.where('patientId').equals(currentUser.id).toArray().then(setVaccinations);
    db.appointments.where({ patientId: currentUser.id }).toArray().then(setAppointments);
  }, [currentUser, refresh]);

  const score = (() => {
    let s = 60;
    if (vaccinations.filter(v => v.status === 'given').length >= 3) s += 10;
    if (medicines.filter(m => (m.missedCount || 0) === 0).length > 0) s += 10;
    if (appointments.some(a => a.status === 'scheduled')) s += 5;
    if (vitals.length > 0) s += 5;
    return Math.min(100, s);
  })();

  const careGaps = [
    ...vaccinations.filter(v => v.status === 'due' || v.status === 'overdue').map(v => ({
      type: 'vaccination' as const,
      message: `${v.vaccineName} – ${v.status === 'overdue' ? t('vaccination.overdue') : t('vaccination.due')}`,
      link: '/vaccination',
    })),
    ...medicines.filter(m => (m.missedCount || 0) > 0).map(m => ({
      type: 'medicine' as const,
      message: `${m.name} – ${m.missedCount} dose(s) missed`,
      link: '/medicines',
    })),
  ];

  if (currentUser?.role !== 'patient') {
    return (
      <Layout>
        <div className="p-6 text-center text-gray-500">
          <div className="text-4xl mb-2">👤</div>
          <p>This section is for patient accounts. Please log in as a patient.</p>
          <Link to="/login" className="mt-3 inline-block bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Switch Account</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t('health.myHealth')}</h1>
          <DemoDataBadge />
        </div>

        {/* Patient Profile */}
        {patient && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-sky-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                {patient.name[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">{patient.name}</div>
                <div className="text-sm text-gray-600">
                  {patient.age} {t('common.years')} · {t(`common.${patient.gender}`)} · {patient.village}
                </div>
                <div className="text-xs text-sky-700 font-medium">
                  {patient.bloodGroup && `🩸 ${patient.bloodGroup} · `}
                  {patient.isPregnant && `🤰 ${patient.pregnancyWeeks}w pregnant · `}
                  {patient.isElderly && '👴 Elderly · '}
                  {patient.isChild && '👶 Child'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Score */}
        <HealthScoreCard score={score} />

        {/* Conditions & Allergies */}
        {patient && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <h3 className="font-bold text-red-800 text-sm mb-2">⚠️ {t('health.conditions')}</h3>
              {patient.conditions?.length ? patient.conditions.map((c, i) => (
                <div key={i} className="text-sm text-red-700">• {c}</div>
              )) : <div className="text-sm text-gray-400">{t('health.noConditions')}</div>}
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3">
              <h3 className="font-bold text-orange-800 text-sm mb-2">🚫 {t('health.allergies')}</h3>
              {patient.allergies?.length ? patient.allergies.map((a, i) => (
                <div key={i} className="text-sm text-orange-700">• {a}</div>
              )) : <div className="text-sm text-gray-400">{t('health.noAllergies')}</div>}
            </div>
          </div>
        )}

        {/* Care Gaps */}
        {careGaps.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-2">⚠️ {t('health.careGaps')}</h2>
            <CareGapAlert gaps={careGaps} />
          </div>
        )}

        {/* Recent Vitals */}
        {vitals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-800">📊 {t('health.vitals')}</h2>
              <Link to="/health-tests" className="text-xs text-sky-600 font-medium">{t('common.viewAll')}</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vitals.slice(0, 4).map(v => (
                <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                  <div className="text-xs text-gray-500 capitalize">{v.type.replace('_', ' ')}</div>
                  <div className="font-bold text-gray-900 text-lg">{v.value} <span className="text-sm font-normal text-gray-500">{v.unit}</span></div>
                  <div className="text-xs text-gray-400">{v.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicines */}
        {medicines.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-800">💊 {t('health.medicines')}</h2>
              <Link to="/medicines" className="text-xs text-sky-600 font-medium">{t('common.viewAll')}</Link>
            </div>
            <div className="space-y-3">
              {medicines.slice(0, 2).map(m => (
                <MedicineCard key={m.id} medicine={m} onUpdate={() => setRefresh(r => r + 1)} />
              ))}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {vaccinations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-800">💉 {t('health.vaccinations')}</h2>
              <Link to="/vaccination" className="text-xs text-sky-600 font-medium">{t('common.viewAll')}</Link>
            </div>
            <div className="space-y-2">
              {vaccinations.slice(0, 3).map(v => (
                <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border text-sm
                  ${v.status === 'given' ? 'bg-green-50 border-green-200' : v.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <span className="font-medium">{v.vaccineName}</span>
                  <span>{v.status === 'given' ? '✅' : v.status === 'overdue' ? '⚠️' : '📅'} {v.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {appointments.filter(a => a.status === 'scheduled').length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-2">📅 {t('dashboard.upcomingAppts')}</h2>
            {appointments.filter(a => a.status === 'scheduled').map(a => (
              <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm mb-2">
                <div className="font-bold text-blue-800">{a.reason}</div>
                <div className="text-blue-600">{a.date}</div>
                {a.notes && <div className="text-blue-500 text-xs mt-1">{a.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          <Link to="/ai" className="bg-violet-600 text-white rounded-2xl p-3 text-center font-bold text-sm">🤖 Ask Medora AI</Link>
          <Link to="/doctor-summary" className="bg-cyan-600 text-white rounded-2xl p-3 text-center font-bold text-sm">📄 Doctor Summary</Link>
        </div>
      </div>
    </Layout>
  );
}
