import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const TYPES = ['vitals', 'report', 'consultation'];

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const str = JSON.stringify(r.data).toLowerCase();
    return str.includes(searchQuery.toLowerCase());
  });

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
          <h1 className="text-xl font-black text-[#2563EB]">📋 {t('records.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowAdd(true)} className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-2xs transition-colors">
              + {t('records.addRecord')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeType === type ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'}`}
            >
              {t(`records.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <input 
            type="text" 
            placeholder="Search reports or values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-2xs"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <div className="text-5xl mb-3">📋</div>
            <p>{t('records.noRecords')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map(r => (
              <div key={r.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 font-bold px-2 py-0.5 rounded-full capitalize">{r.type}</span>
                  <span className="text-[11px] text-[#94A3B8]">{r.date}</span>
                </div>
                {r.type === 'report' ? (
                  <div className="space-y-3 mt-2">
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-[#0F172A]">{(r.data as any).reportName || 'Medical Report'}</span>
                      <span className="text-xs text-[#64748B]">{(r.data as any).lab || 'Unknown Lab'}</span>
                    </div>
                    {r.notes && (
                      <div className="text-[10px] bg-[#FFFBEB] text-[#D97706] p-2 rounded-xl border border-[#D97706]/30 font-bold uppercase tracking-wider">
                        {r.notes}
                      </div>
                    )}
                    
                    {(r.data as any).parameters && (
                      <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[#475569]">
                            <tr>
                              <th className="px-3 py-2 font-bold">Parameter</th>
                              <th className="px-3 py-2 font-bold">Result</th>
                              <th className="px-3 py-2 font-bold">Ref Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0] bg-white">
                            {((r.data as any).parameters as any[]).map((p, idx) => (
                              <tr key={idx} className={p.status !== 'NORMAL' ? 'bg-[#FEF2F2]/50' : ''}>
                                <td className="px-3 py-2 font-medium text-[#0F172A]">{p.name}</td>
                                <td className="px-3 py-2">
                                  <span className={`font-bold ${p.status === 'HIGH' ? 'text-[#DC2626]' : p.status === 'LOW' ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                                    {p.result}
                                  </span>
                                  <span className="text-[10px] text-[#64748B] ml-1">{p.unit}</span>
                                </td>
                                <td className="px-3 py-2 text-[#64748B]">{p.ref}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-[#EFF6FF] text-[#2563EB] py-2 rounded-xl text-xs font-bold border border-[#2563EB]/30 hover:bg-blue-100 transition-colors">View Full PDF</button>
                      <button className="flex-1 bg-slate-50 text-[#475569] py-2 rounded-xl text-xs font-bold border border-[#E2E8F0] hover:bg-slate-100 transition-colors">Share</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {typeof r.data === 'object' && (
                      <div className="space-y-1">
                        {Object.entries(r.data as Record<string, unknown>).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-xs py-1 border-b border-[#E2E8F0] last:border-0">
                            <span className="text-[#64748B] capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-bold text-[#0F172A]">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {r.doctorId && <div className="text-[11px] text-[#94A3B8] mt-2">Doctor ID: {r.doctorId}</div>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6">
              <h2 className="font-extrabold text-[#0F172A] text-base mb-4">{t('records.addRecord')}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">{t('records.type')}</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">{t('records.date')}</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Notes / Data</label>
                  <textarea value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    rows={3} placeholder="Enter record details..."
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">{t('common.cancel')}</button>
                <button onClick={handleAdd} className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-2xs">{t('common.save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
