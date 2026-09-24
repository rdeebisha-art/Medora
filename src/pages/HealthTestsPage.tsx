import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TEST_TYPES = [
  { key: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', color: '#f59e0b', normal: '70–140' },
  { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', color: '#ef4444', normal: '90/60–120/80' },
  { key: 'weight', label: 'Weight', unit: 'kg', color: '#3b82f6', normal: 'Varies' },
  { key: 'temperature', label: 'Temperature', unit: '°F', color: '#8b5cf6', normal: '98–100.4' },
  { key: 'pulse', label: 'Pulse', unit: 'bpm', color: '#ec4899', normal: '60–100' },
  { key: 'spo2', label: 'SpO2', unit: '%', color: '#10b981', normal: '95–100' },
];

export default function HealthTestsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [tests, setTests] = useState<HealthTest[]>([]);
  const [selectedType, setSelectedType] = useState('blood_sugar');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ type: 'blood_sugar', value: '', date: new Date().toISOString().slice(0, 16), notes: '' });

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    const q = pid
      ? db.healthTests.where({ patientId: pid, type: selectedType })
      : db.healthTests.where('type').equals(selectedType);
    q.reverse().limit(14).toArray().then(setTests);
  }, [currentUser, selectedType, refresh]);

  const handleAdd = async () => {
    if (!form.value || !currentUser?.id) return;
    const cfg = TEST_TYPES.find(t => t.key === form.type)!;
    await db.healthTests.add({
      patientId: currentUser.id,
      type: form.type as any,
      value: form.value,
      unit: cfg.unit,
      date: form.date,
      notes: form.notes,
    });
    setShowAdd(false);
    setForm({ type: 'blood_sugar', value: '', date: new Date().toISOString().slice(0, 16), notes: '' });
    setRefresh(r => r + 1);
  };

  const cfg = TEST_TYPES.find(t => t.key === selectedType)!;
  const chartData = [...tests].reverse().map(t => ({ date: t.date.slice(0, 10), value: parseFloat(String(t.value)) || 0 }));

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🧪 {t('healthTests.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowAdd(true)} className="bg-sky-600 text-white text-sm px-3 py-1.5 rounded-xl font-medium">
              + {t('healthTests.addTest')}
            </button>
          </div>
        </div>

        {/* Test Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {TEST_TYPES.map(tt => (
            <button
              key={tt.key}
              onClick={() => setSelectedType(tt.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedType === tt.key ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
              style={selectedType === tt.key ? { backgroundColor: tt.color } : {}}
            >
              {tt.label}
            </button>
          ))}
        </div>

        {/* Normal Range Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 mb-4 text-sm text-blue-700 flex items-center justify-between">
          <span>📊 {cfg.label} ({cfg.unit})</span>
          <span className="font-medium">Normal: {cfg.normal}</span>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">{t('healthTests.trend')}</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History List */}
        {tests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📈</div>
            <p>No {cfg.label} readings yet. Add your first reading!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map(test => (
              <div key={test.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-bold text-gray-900" style={{ color: cfg.color }}>
                    {test.value} <span className="text-sm font-normal text-gray-500">{test.unit}</span>
                  </div>
                  {test.notes && <div className="text-xs text-gray-400 mt-0.5">{test.notes}</div>}
                </div>
                <div className="text-xs text-gray-400">{test.date.slice(0, 16)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
          ⚠️ {t('healthTests.disclaimer')}
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6">
              <h2 className="font-bold text-lg mb-4">{t('healthTests.addTest')}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('healthTests.selectType')}</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5">
                    {TEST_TYPES.map(tt => <option key={tt.key} value={tt.key}>{tt.label} ({tt.unit})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('healthTests.value')} ({TEST_TYPES.find(t => t.key === form.type)?.unit})
                  </label>
                  <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder="e.g. 120" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('healthTests.date')}</label>
                  <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('healthTests.notes')}</label>
                  <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="After meals, fasting, etc." className="w-full border border-gray-300 rounded-xl px-3 py-2.5" />
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
