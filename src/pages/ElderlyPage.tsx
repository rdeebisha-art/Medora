import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Medicine, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';

export default function ElderlyPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [vitals, setVitals] = useState<HealthTest[]>([]);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      const all = await db.patients.where({ isElderly: true }).toArray();
      if (all.length > 0) {
        const p = all[0];
        setPatient(p);
        const [meds, vits] = await Promise.all([
          db.medicines.where({ patientId: p.id!, status: 'active' }).toArray(),
          db.healthTests.where('patientId').equals(p.id!).reverse().limit(6).toArray(),
        ]);
        setMedicines(meds);
        setVitals(vits);
      }
    };
    load();
  }, [currentUser]);

  const FALL_TIPS = ['Use handrails on stairs and in bathroom', 'Wear non-slip footwear', 'Keep floors dry and clear of obstacles', 'Use a walking stick if needed', 'Adequate lighting in all rooms'];

  const lastBP = vitals.find(v => v.type === 'blood_pressure');
  const lastSugar = vitals.find(v => v.type === 'blood_sugar');

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#4F46E5]">👴 {t('elderly.title')}</h1>
          <DemoDataBadge />
        </div>

        {alertSent && (
          <div className="bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold p-3 rounded-xl">
            ✅ Family alert added to SMS Outbox (Demo)
          </div>
        )}

        {patient ? (
          <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <span className="text-4xl">👴</span>
            <div>
              <div className="font-extrabold text-[#4F46E5] text-base">{patient.name}</div>
              <div className="text-xs text-[#475569]">{patient.age} years · {patient.village}</div>
              {patient.conditions?.length > 0 && (
                <div className="text-xs text-[#DC2626] font-medium mt-1">{patient.conditions.join(', ')}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-2xl p-3 text-center text-xs text-[#4F46E5] font-bold">Demo: Ramesh Patel, 67yr, Diabetes + Hypertension</div>
        )}

        {/* Key Vitals */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 border shadow-2xs ${lastBP ? 'bg-[#EFF6FF] border-[#2563EB]/20' : 'bg-white border-[#E2E8F0]'}`}>
            <div className="text-xs font-bold text-[#475569]">🩺 {t('elderly.bp')}</div>
            <div className="text-2xl font-black text-[#2563EB] mt-1">{lastBP ? lastBP.value : '---'}</div>
            <div className="text-[11px] text-[#64748B]">{lastBP ? 'mmHg · ' + lastBP.date?.slice(0, 10) : 'No data'}</div>
          </div>
          <div className={`rounded-2xl p-4 border shadow-2xs ${lastSugar ? 'bg-[#FFF7ED] border-[#EA580C]/20' : 'bg-white border-[#E2E8F0]'}`}>
            <div className="text-xs font-bold text-[#475569]">🍬 {t('elderly.sugar')}</div>
            <div className="text-2xl font-black text-[#EA580C] mt-1">{lastSugar ? lastSugar.value : '---'}</div>
            <div className="text-[11px] text-[#64748B]">{lastSugar ? 'mg/dL · ' + lastSugar.date?.slice(0, 10) : 'No data'}</div>
          </div>
        </div>

        <Link to="/health-tests" className="block w-full bg-[#4F46E5] hover:bg-indigo-700 text-white text-center py-2.5 rounded-2xl font-bold text-xs shadow-2xs transition-colors">
          📊 Add Today's BP / Blood Sugar Reading
        </Link>

        {/* Medicines */}
        {medicines.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <h2 className="font-extrabold text-[#0F172A] text-xs mb-3">💊 {t('elderly.medicines')}</h2>
            {medicines.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{m.name} {m.dose}</div>
                  <div className="text-[11px] text-[#64748B]">{m.times?.join(', ')}</div>
                </div>
                <span className="text-[11px] bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.5 rounded-full font-bold">{m.frequency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Fall Prevention */}
        <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-4 shadow-2xs">
          <h2 className="font-extrabold text-[#D97706] text-xs mb-3">⚠️ {t('elderly.fallRisk')}</h2>
          {FALL_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#0F172A] py-1">
              <span className="text-[#D97706] font-bold flex-shrink-0">🔹</span> {tip}
            </div>
          ))}
        </div>

        {/* Alert Family */}
        <button
          onClick={async () => {
            await db.smsOutbox.add({ toPhone: 'Family', message: `Elderly care alert: ${patient?.name || 'Patient'} may need assistance. Please check on them. [Demo SMS]`, type: 'family_alert', language: 'en', status: 'PENDING_OFFLINE', createdAt: new Date().toISOString() });
            setAlertSent(true);
          }}
          className="w-full bg-[#EA580C] hover:bg-orange-600 text-white py-2.5 rounded-2xl font-bold text-xs shadow-2xs transition-colors"
        >
          👪 {t('elderly.alertFamily')} (Demo SMS)
        </button>
      </div>
    </Layout>
  );
}
