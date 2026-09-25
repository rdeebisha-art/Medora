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
import { HealthTrendsChart } from '../components/HealthTrendsChart';

export default function MyHealthPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [vitals, setVitals] = useState<HealthTest[]>([]);
  const [allVitals, setAllVitals] = useState<HealthTest[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'patient') return;
    db.patients.get(currentUser.id).then(p => setPatient(p || null));
    db.medicines.where({ patientId: currentUser.id, status: 'active' }).toArray().then(setMedicines);
    db.healthTests.where('patientId').equals(currentUser.id).reverse().limit(6).toArray().then(setVitals);
    db.healthTests.where('patientId').equals(currentUser.id).toArray().then(setAllVitals);
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
          <h1 className="text-xl font-black text-[#0F766E]">{t('health.myHealth')}</h1>
          <DemoDataBadge />
        </div>

        {/* Patient Profile */}
        {patient && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="bg-[#0F766E] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-xs">
                {patient.name[0]}
              </div>
              <div>
                <div className="font-extrabold text-[#0F172A]">{patient.name}</div>
                <div className="text-xs text-[#475569]">
                  {patient.age} {t('common.years')} · {t(`common.${patient.gender}`)} · {patient.village}
                </div>
                <div className="text-xs text-[#0F766E] font-bold mt-0.5">
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
            <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-2xl p-3.5 shadow-2xs">
              <h3 className="font-bold text-[#DC2626] text-xs mb-2">⚠️ {t('health.conditions')}</h3>
              {patient.conditions?.length ? patient.conditions.map((c, i) => (
                <div key={i} className="text-xs font-medium text-[#0F172A]">• {c}</div>
              )) : <div className="text-xs text-[#64748B]">{t('health.noConditions')}</div>}
            </div>
            <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-3.5 shadow-2xs">
              <h3 className="font-bold text-[#D97706] text-xs mb-2">🚫 {t('health.allergies')}</h3>
              {patient.allergies?.length ? patient.allergies.map((a, i) => (
                <div key={i} className="text-xs font-medium text-[#0F172A]">• {a}</div>
              )) : <div className="text-xs text-[#64748B]">{t('health.noAllergies')}</div>}
            </div>
          </div>
        )}

        {/* Care Gaps */}
        {careGaps.length > 0 && (
          <div>
            <h2 className="font-extrabold text-sm text-[#0F172A] mb-2">⚠️ {t('health.careGaps')}</h2>
            <CareGapAlert gaps={careGaps} />
          </div>
        )}

        {/* Health Trends (30 Days) */}
        <HealthTrendsChart tests={allVitals} />

        {/* Recent Vitals */}
        {vitals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-sm text-[#0F172A]">📊 {t('health.vitals')}</h2>
              <Link to="/health-tests" className="text-xs text-[#0F766E] font-bold hover:underline">{t('common.viewAll')}</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vitals.slice(0, 4).map(v => (
                <div key={v.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xs">
                  <div className="text-xs text-[#64748B] capitalize">{v.type.replace('_', ' ')}</div>
                  <div className="font-black text-[#0F172A] text-lg">{v.value} <span className="text-xs font-normal text-[#64748B]">{v.unit}</span></div>
                  <div className="text-[10px] text-[#94A3B8]">{v.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicines */}
        {medicines.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-sm text-[#0F172A]">💊 {t('health.medicines')}</h2>
              <Link to="/medicines" className="text-xs text-[#16A34A] font-bold hover:underline">{t('common.viewAll')}</Link>
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
              <h2 className="font-extrabold text-sm text-[#0F172A]">💉 {t('health.vaccinations')}</h2>
              <Link to="/vaccination" className="text-xs text-[#16A34A] font-bold hover:underline">{t('common.viewAll')}</Link>
            </div>
            <div className="space-y-2">
              {vaccinations.slice(0, 3).map(v => (
                <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold
                  ${v.status === 'given' ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]' : v.status === 'overdue' ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]' : 'bg-[#FFFBEB] border-[#D97706]/30 text-[#D97706]'}`}>
                  <span className="text-[#0F172A]">{v.vaccineName}</span>
                  <span className="font-bold">{v.status === 'given' ? '✅ Given' : v.status === 'overdue' ? '⚠️ Overdue' : '📅 Due'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-sm text-[#0F172A]">📅 {t('dashboard.upcomingAppts', 'Upcoming Appointments')}</h2>
            <Link to="/appointments" className="text-xs text-[#0F766E] font-bold hover:underline">
              {t('appointments.viewAll', 'Manage All →')}
            </Link>
          </div>
          {appointments.filter(a => a.status === 'scheduled').length > 0 ? (
            appointments.filter(a => a.status === 'scheduled').map(a => (
              <div key={a.id} className="bg-[#FFF7ED] border border-[#EA580C]/30 rounded-xl p-3 text-xs mb-2 last:mb-0">
                <div className="font-bold text-[#EA580C]">{a.reason}</div>
                <div className="text-[#475569] mt-0.5 font-mono">{a.date}</div>
                {a.notes && <div className="text-[#64748B] text-[11px] mt-1">{a.notes}</div>}
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-xs text-slate-500">
              <span>No upcoming appointments. </span>
              <Link to="/appointments" className="text-[#0F766E] font-bold underline">
                Book with a doctor
              </Link>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          <Link to="/ai" className="bg-[#7C3AED] hover:bg-purple-700 text-white rounded-2xl p-3 text-center font-bold text-xs shadow-xs transition-colors">🤖 Ask Medora AI</Link>
          <Link to="/doctor-summary" className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl p-3 text-center font-bold text-xs shadow-xs transition-colors">📄 Doctor Summary</Link>
        </div>
      </div>
    </Layout>
  );
}
