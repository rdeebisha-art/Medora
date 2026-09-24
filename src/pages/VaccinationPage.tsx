import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Vaccination } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const UIP_SCHEDULE = [
  { name: 'BCG', when: 'At Birth' }, { name: 'OPV-0', when: 'At Birth' }, { name: 'Hep B-1', when: 'At Birth' },
  { name: 'OPV-1, DPT-1, Hep B-2, Hib-1, IPV-1', when: '6 Weeks' }, { name: 'OPV-2, DPT-2, Hib-2', when: '10 Weeks' },
  { name: 'OPV-3, DPT-3, Hib-3, IPV-2, Hep B-3', when: '14 Weeks' },
  { name: 'Measles-Rubella-1, JE-1 (selected districts)', when: '9-12 Months' },
  { name: 'Vitamin A-1', when: '9 Months' }, { name: 'OPV-Booster, DPT-Booster-1', when: '16-24 Months' },
  { name: 'Measles-Rubella-2, JE-2 (selected districts)', when: '16-24 Months' },
  { name: 'DPT-Booster-2, Td', when: '5–6 Years' }, { name: 'Td', when: '10 Years' }, { name: 'Td', when: '16 Years' },
];

export default function VaccinationPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ vaccineName: '', dueDate: '', givenDate: '', status: 'due' as 'due' | 'given' | 'overdue' });
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<'records' | 'schedule'>('records');

  useEffect(() => {
    const pid = currentUser?.role === 'patient' ? currentUser.id : undefined;
    const q = pid ? db.vaccinations.where('patientId').equals(pid) : db.vaccinations;
    q.toArray().then(setVaccinations);
  }, [currentUser, refresh]);

  const handleAdd = async () => {
    if (!form.vaccineName || !currentUser?.id) return;
    await db.vaccinations.add({ patientId: currentUser.id, ...form });
    setShowAdd(false);
    setRefresh(r => r + 1);
  };

  const statusBadge = (s: string) => s === 'given' ? '✅ Given' : s === 'overdue' ? '⚠️ Overdue' : '📅 Due';
  const statusColor = (s: string) => s === 'given' ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]' : s === 'overdue' ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]' : 'bg-[#FFFBEB] border-[#D97706]/30 text-[#D97706]';

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-[#16A34A]">💉 {t('vaccination.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowAdd(true)} className="bg-[#16A34A] hover:bg-green-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-2xs transition-colors">+ Add</button>
          </div>
        </div>

        <div className="flex bg-slate-100 border border-[#E2E8F0] rounded-xl p-1 mb-4">
          {[{k:'records',l:'My Records'},{k:'schedule',l:'UIP Schedule'}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.k ? 'bg-white shadow-xs text-[#16A34A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'records' && (
          <>
            {vaccinations.length === 0 ? (
              <div className="text-center py-12 text-[#64748B]"><div className="text-5xl mb-3">💉</div><p>No vaccination records</p></div>
            ) : (
              <div className="space-y-2">
                {vaccinations.map(v => (
                  <div key={v.id} className={`border rounded-2xl p-3.5 shadow-2xs ${statusColor(v.status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0F172A] text-xs">{v.vaccineName}</span>
                      <span className="text-xs font-bold">{statusBadge(v.status)}</span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-1">
                      {v.dueDate && `Due: ${v.dueDate}`}
                      {v.givenDate && ` · Given: ${v.givenDate}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'schedule' && (
          <div className="space-y-2">
            <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-3 text-xs text-[#16A34A] font-bold mb-2">
              🇮🇳 Universal Immunisation Programme (UIP) — All vaccines are FREE at govt facilities
            </div>
            {UIP_SCHEDULE.map((s, i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-[#0F172A]">{s.name}</span>
                <span className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full font-bold">{s.when}</span>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6">
              <h2 className="font-extrabold text-[#0F172A] text-base mb-4">{t('vaccination.addRecord')}</h2>
              <div className="space-y-3">
                <input value={form.vaccineName} onChange={e => setForm(p => ({...p, vaccineName: e.target.value}))}
                  placeholder={t('vaccination.vaccine')} className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5" />
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))}
                  className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5" placeholder="Due Date" />
                <input type="date" value={form.givenDate} onChange={e => setForm(p => ({...p, givenDate: e.target.value}))}
                  className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5" placeholder="Given Date (if done)" />
                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value as any}))}
                  className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5">
                  <option value="due">Due</option>
                  <option value="given">Given</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">{t('common.cancel')}</button>
                <button onClick={handleAdd} className="flex-1 bg-[#16A34A] hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-2xs">{t('common.save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
