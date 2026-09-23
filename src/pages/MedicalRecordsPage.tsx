import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const TYPES = ['vitals', 'reports', 'consultations'];

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [activeType, setActiveType] = useState('vitals');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ type: 'vitals', date: new Date().toISOString().split('T')[0], data: '' });

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    if (!pid) { db.medicalRecords.toArray().then(setRecords); return; }
    db.medicalRecords.where({ patientId: pid, type: activeType }).toArray().then(setRecords);
  }, [currentUser, activeType, refresh]);

  const handleAdd = async () => {
    if (!form.data || !currentUser?.id) return;
    await db.medicalRecords.add({
      patientId: currentUser.id,
      type: form.type as 'vitals' | 'report' | 'vaccination' | 'consultation' | 'prescription',
      date: form.date,
      data: { note: form.data },
    });
    setShowAdd(false);
    setForm({ type: 'vitals', date: new Date().toISOString().split('T')[0], data: '' });
    setRefresh(r => r + 1);
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">📋 {t('records.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowAdd(true)} className="bg-sky-600 text-white text-sm px-3 py-1.5 rounded-xl font-medium">
              + {t('records.addRecord')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeType === type ? 'bg-sky-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t(`records.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
            </button>
          ))}
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>{t('records.noRecords')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-sky-100 text-sky-700 font-medium px-2 py-0.5 rounded-full capitalize">{r.type}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                {typeof r.data === 'object' && (
                  <div className="space-y-1">
                    {Object.entries(r.data as Record<string, unknown>).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium text-gray-900">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {r.doctorId && <div className="text-xs text-gray-400 mt-2">Doctor ID: {r.doctorId}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6">
              <h2 className="font-bold text-lg mb-4">{t('records.addRecord')}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('records.type')}</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('records.date')}</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Data</label>
                  <textarea value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    rows={3} placeholder="Enter record details..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium">{t('common.cancel')}</button>
                <button onClick={handleAdd} className="flex-1 bg-sky-600 text-white py-3 rounded-xl font-bold">{t('common.save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
