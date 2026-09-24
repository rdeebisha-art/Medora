import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Vaccination, Medicine } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function ChildcarePage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [child, setChild] = useState<Patient | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await db.patients.where({ isChild: true }).toArray();
      if (all.length > 0) {
        setChild(all[0]);
        const [vacc, meds] = await Promise.all([
          db.vaccinations.where({ patientId: all[0].id! }).toArray(),
          db.medicines.where({ patientId: all[0].id!, status: 'active' }).toArray(),
        ]);
        setVaccinations(vacc);
        setMedicines(meds);
      }
    };
    load();
  }, [currentUser]);

  const NUTRITION = ['Balanced diet: rice/roti + dal + vegetables + milk', 'Avoid junk food and excess sugar', '3 meals + 2 healthy snacks daily', 'Iron-rich foods prevent anaemia', 'Ensure adequate protein for growth'];
  const ILLNESS = [{ name: 'Fever', action: 'Paracetamol, cool compress, fluids. Doctor if >3 days.' }, { name: 'Diarrhoea', action: 'ORS immediately. Continue feeding. Doctor if blood in stool.' }, { name: 'Cough/Cold', action: 'Steam, honey+ginger. Avoid cold drinks. Doctor if >7 days.' }, { name: 'Vomiting', action: 'Small sips of ORS. Rest. Doctor if continuous.' }];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#2563EB]">👶 {t('childcare.title')}</h1>
          <DemoDataBadge />
        </div>

        {child ? (
          <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <span className="text-4xl">🧒</span>
            <div>
              <div className="font-extrabold text-[#2563EB] text-base">{child.name}</div>
              <div className="text-xs text-[#475569]">{child.age} years · {child.gender} · {child.village}</div>
            </div>
          </div>
        ) : (
          <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl p-4 text-center text-xs text-[#2563EB] font-bold">
            Demo child profile: Meena Sharma, 8 years, Kodaikanal
          </div>
        )}

        {medicines.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <h2 className="font-extrabold text-[#0F172A] text-xs mb-2">💊 {t('childcare.medicines')}</h2>
            {medicines.map(m => (
              <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0] last:border-0 text-xs">
                <span className="font-bold text-[#0F172A]">{m.name} {m.dose}</span>
                <span className="text-[#16A34A] font-semibold">{m.times?.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {vaccinations.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <h2 className="font-extrabold text-[#0F172A] text-xs mb-2">💉 {t('childcare.vaccinations')}</h2>
            {vaccinations.map(v => (
              <div key={v.id} className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0] last:border-0 text-xs">
                <span className="font-bold text-[#0F172A]">{v.vaccineName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.status === 'given' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20' : 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30'}`}>{v.status}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">🥗 {t('childcare.nutrition')}</h2>
          {NUTRITION.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#475569] py-1"><span className="text-[#16A34A] font-bold">✓</span> {n}</div>
          ))}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">🩺 {t('childcare.commonIllness')}</h2>
          {ILLNESS.map((ill, i) => (
            <div key={i} className="py-2 border-b border-[#E2E8F0] last:border-0">
              <div className="font-bold text-[#0F172A] text-xs">{ill.name}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{ill.action}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
