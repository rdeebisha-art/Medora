import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Medicine } from '../db/db';
import Layout from '../components/Layout';
import MedicineCard from '../components/MedicineCard';
import DemoDataBadge from '../components/DemoDataBadge';

type FilterType = 'all' | 'active' | 'completed';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filter, setFilter] = useState<FilterType>('active');
  const [refresh, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: 'Once daily', times: '8:00 AM', instructions: '', doctor: '' });

  useEffect(() => {
    if (!currentUser?.id) return;
    const patId = currentUser.role === 'patient' ? currentUser.id : 0;
    const q = filter === 'all' ? db.medicines.where('patientId').equals(patId) :
              db.medicines.where({ patientId: patId, status: filter });
    q.toArray().then(setMedicines).catch(() => {
      db.medicines.toArray().then(setMedicines);
    });
  }, [currentUser, filter, refresh]);

  const handleAdd = async () => {
    if (!newMed.name || !currentUser?.id) return;
    await db.medicines.add({
      patientId: currentUser.id,
      name: newMed.name,
      dose: newMed.dose,
      frequency: newMed.frequency,
      times: newMed.times.split(',').map(t => t.trim()),
      instructions: newMed.instructions,
      doctor: newMed.doctor,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      missedCount: 0,
    });
    setNewMed({ name: '', dose: '', frequency: 'Once daily', times: '8:00 AM', instructions: '', doctor: '' });
    setShowAdd(false);
    setRefresh(r => r + 1);
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-[#16A34A]">💊 {t('medicines.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowAdd(true)} className="bg-[#16A34A] text-white text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-green-700 shadow-2xs transition-colors">
              + {t('medicines.addMedicine')}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-4 border border-[#E2E8F0]">
          {(['all', 'active', 'completed'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-[#16A34A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              {t(`medicines.${f}`, f.charAt(0).toUpperCase() + f.slice(1))}
            </button>
          ))}
        </div>

        {/* Add Medicine Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="font-extrabold text-[#0F172A] text-base mb-4">{t('medicines.addMedicine')}</h2>
              <div className="space-y-3">
                {[
                  { key: 'name', label: t('medicines.name'), type: 'text', placeholder: 'e.g. Paracetamol 500mg' },
                  { key: 'dose', label: t('medicines.dose'), type: 'text', placeholder: 'e.g. 500mg' },
                  { key: 'frequency', label: t('medicines.frequency'), type: 'text', placeholder: 'e.g. Twice daily' },
                  { key: 'times', label: t('medicines.times'), type: 'text', placeholder: 'e.g. 8:00 AM, 8:00 PM' },
                  { key: 'doctor', label: t('medicines.doctor'), type: 'text', placeholder: 'Doctor name' },
                  { key: 'instructions', label: t('medicines.instructions'), type: 'text', placeholder: 'After meals' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-[#475569] mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={(newMed as any)[field.key]}
                      onChange={e => setNewMed(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">
                  {t('common.cancel')}
                </button>
                <button onClick={handleAdd} className="flex-1 bg-[#16A34A] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-green-700 shadow-2xs">
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">💊</div>
            <p>{t('medicines.noMedicines')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map(m => (
              <MedicineCard key={m.id} medicine={m} onUpdate={() => setRefresh(r => r + 1)} />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">{t('common.demoData')} · {t('common.disclaimer')}</p>
      </div>
    </Layout>
  );
}
