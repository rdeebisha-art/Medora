import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Vaccination } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';

export default function NewbornPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [newborn, setNewborn] = useState<Patient | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await db.patients.where({ isNewborn: true }).toArray();
      if (all.length > 0) {
        setNewborn(all[0]);
        const vacc = await db.vaccinations.where({ patientId: all[0].id! }).toArray();
        setVaccinations(vacc);
      }
    };
    load();
  }, [currentUser]);

  const FEEDING = ['Breastfeed every 2–3 hours (8–12 times/day)', 'Night feeds are normal and important', 'Burp baby after each feed', 'Do not give water or other drinks in first 6 months', 'Watch for signs of enough milk: 6+ wet nappies/day'];
  const WARNINGS = ['Not feeding for 4+ hours', 'Temperature above 100.4°F (38°C)', 'Yellowing skin or eyes (jaundice)', 'Difficulty breathing or blue lips', 'Redness/swelling around umbilical cord', 'Continuous crying that won\'t stop'];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">🍼 {t('newborn.title')}</h1>
          <DemoDataBadge />
        </div>

        {newborn ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">👶</span>
              <div>
                <div className="font-bold text-rose-800 text-lg">{newborn.name}</div>
                <div className="text-rose-600">Born: {newborn.dateOfBirth || 'Recently'}</div>
                {newborn.motherPatientId && <div className="text-xs text-gray-500">Mother Patient ID: {newborn.motherPatientId}</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-700">
            <div className="text-4xl mb-2">🍼</div>
            No newborn profile found. Register newborn via Admin Portal.
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">🤱 {t('newborn.feeding')}</h2>
          {FEEDING.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 py-1">
              <span className="text-green-500 flex-shrink-0">✓</span> {f}
            </div>
          ))}
        </div>

        {vaccinations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">💉 {t('newborn.vaccination')}</h2>
            {vaccinations.map(v => (
              <div key={v.id} className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0`}>
                <span className="text-sm font-medium text-gray-800">{v.vaccineName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'given' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {v.status === 'given' ? '✅ Given' : '📅 Due: ' + v.dueDate}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h2 className="font-bold text-red-800 mb-3">⚠️ {t('newborn.warningSigns')}</h2>
          {WARNINGS.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700 py-1">
              <span className="flex-shrink-0">🔴</span> {w}
            </div>
          ))}
          <Link to="/emergency" className="block mt-3 bg-red-600 text-white text-center py-3 rounded-xl font-bold">🚨 Emergency Help</Link>
        </div>
      </div>
    </Layout>
  );
}
