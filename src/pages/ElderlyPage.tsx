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
          <h1 className="text-xl font-bold text-gray-900">👴 {t('elderly.title')}</h1>
          <DemoDataBadge />
        </div>

        {patient ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-4xl">👴</span>
            <div>
              <div className="font-bold text-orange-800 text-lg">{patient.name}</div>
              <div className="text-orange-600">{patient.age} years · {patient.village}</div>
              {patient.conditions?.length > 0 && (
                <div className="text-sm text-red-600 mt-1">{patient.conditions.join(', ')}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center text-orange-700">Demo: Ramesh Patel, 67yr, Diabetes + Hypertension</div>
        )}

        {/* Key Vitals */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 border ${lastBP ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-sm font-bold text-gray-700">🩺 {t('elderly.bp')}</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{lastBP ? lastBP.value : '---'}</div>
            <div className="text-xs text-gray-500">{lastBP ? 'mmHg · ' + lastBP.date?.slice(0, 10) : 'No data'}</div>
          </div>
          <div className={`rounded-2xl p-4 border ${lastSugar ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-sm font-bold text-gray-700">🍬 {t('elderly.sugar')}</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{lastSugar ? lastSugar.value : '---'}</div>
            <div className="text-xs text-gray-500">{lastSugar ? 'mg/dL · ' + lastSugar.date?.slice(0, 10) : 'No data'}</div>
          </div>
        </div>

        <Link to="/health-tests" className="block w-full bg-sky-600 text-white text-center py-3 rounded-2xl font-bold text-sm">
          📊 Add Today's BP / Blood Sugar Reading
        </Link>

        {/* Medicines */}
        {medicines.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">💊 {t('elderly.medicines')}</h2>
            {medicines.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-bold text-gray-900">{m.name} {m.dose}</div>
                  <div className="text-xs text-gray-500">{m.times?.join(', ')}</div>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{m.frequency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Fall Prevention */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h2 className="font-bold text-yellow-800 mb-3">⚠️ {t('elderly.fallRisk')}</h2>
          {FALL_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-yellow-800 py-1">
              <span className="flex-shrink-0">🔹</span> {tip}
            </div>
          ))}
        </div>

        {/* Alert Family */}
        <button
          onClick={async () => {
            await db.smsOutbox.add({ toPhone: 'Family', message: `Elderly care alert: ${patient?.name || 'Patient'} may need assistance. Please check on them. [Demo SMS]`, type: 'family_alert', language: 'en', status: 'pending', createdAt: new Date().toISOString() });
            alert('Family alert added to SMS Outbox (Demo)');
          }}
          className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600"
        >
          👪 {t('elderly.alertFamily')} (Demo SMS)
        </button>
      </div>
    </Layout>
  );
}
