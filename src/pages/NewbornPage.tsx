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
          <h1 className="text-xl font-black text-[#14B8A6]">🍼 {t('newborn.title')}</h1>
          <DemoDataBadge />
        </div>

        {newborn ? (
          <div className="bg-[#F0FDFA] border border-[#14B8A6]/20 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-4xl">👶</span>
              <div>
                <div className="font-extrabold text-[#0F766E] text-base">{newborn.name}</div>
                <div className="text-xs text-[#475569]">Born: {newborn.dateOfBirth || 'Recently'}</div>
                {newborn.motherPatientId && <div className="text-[11px] text-[#64748B]">Mother Patient ID: {newborn.motherPatientId}</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#F0FDFA] border border-[#14B8A6]/20 rounded-2xl p-4 text-center text-xs text-[#0F766E] font-bold shadow-2xs">
            <div className="text-4xl mb-2">🍼</div>
            No newborn profile found. Register newborn via Admin Portal.
          </div>
        )}

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-xs mb-3">🤱 {t('newborn.feeding')}</h2>
          {FEEDING.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#475569] py-1">
              <span className="text-[#16A34A] font-bold flex-shrink-0">✓</span> {f}
            </div>
          ))}
        </div>

        {vaccinations.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <h2 className="font-extrabold text-[#0F172A] text-xs mb-3">💉 {t('newborn.vaccination')}</h2>
            {vaccinations.map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0">
                <span className="text-xs font-bold text-[#0F172A]">{v.vaccineName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.status === 'given' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20' : 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30'}`}>
                  {v.status === 'given' ? '✅ Given' : '📅 Due: ' + v.dueDate}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-2xl p-4 shadow-2xs">
          <h2 className="font-extrabold text-[#DC2626] text-xs mb-3">⚠️ {t('newborn.warningSigns')}</h2>
          {WARNINGS.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#0F172A] py-1">
              <span className="flex-shrink-0 text-[#DC2626]">🔴</span> {w}
            </div>
          ))}
          <Link to="/emergency" className="block mt-3 bg-[#DC2626] hover:bg-red-700 text-white text-center py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-colors">🚨 Emergency Help</Link>
        </div>
      </div>
    </Layout>
  );
}
