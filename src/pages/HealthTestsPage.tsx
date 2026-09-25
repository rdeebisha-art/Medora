import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, HealthTest } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Droplets, Scale, Thermometer, Heart, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';

const TEST_TYPES = [
  { key: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', color: '#f59e0b', normal: '70–140 mg/dL', icon: Droplets },
  { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', color: '#ef4444', normal: '90/60–120/80 mmHg', icon: Activity },
  { key: 'weight', label: 'Weight', unit: 'kg', color: '#3b82f6', normal: 'Healthy BMI 18.5–24.9', icon: Scale },
  { key: 'temperature', label: 'Temperature', unit: '°F', color: '#8b5cf6', normal: '97.8–99.0 °F', icon: Thermometer },
  { key: 'pulse', label: 'Pulse', unit: 'bpm', color: '#ec4899', normal: '60–100 bpm', icon: Heart },
  { key: 'spo2', label: 'SpO2', unit: '%', color: '#10b981', normal: '95–100 %', icon: Activity },
];

export default function HealthTestsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [tests, setTests] = useState<HealthTest[]>([]);
  const [selectedType, setSelectedType] = useState('blood_sugar');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Form State
  const [form, setForm] = useState({
    type: 'blood_sugar',
    value: '',
    bpSys: '120',
    bpDia: '80',
    context: 'Fasting',
    date: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    const q = pid
      ? db.healthTests.where({ patientId: pid, type: selectedType })
      : db.healthTests.where('type').equals(selectedType);
    q.reverse().limit(30).toArray().then(setTests);
  }, [currentUser, selectedType, refresh]);

  const handleAdd = async () => {
    if (!currentUser?.id) return;
    const cfg = TEST_TYPES.find((t) => t.key === form.type)!;

    let finalVal = form.value.trim();
    let finalNotes = form.notes.trim();

    if (form.type === 'blood_pressure') {
      finalVal = `${form.bpSys.trim() || '120'}/${form.bpDia.trim() || '80'}`;
    } else if (form.type === 'blood_sugar') {
      if (!finalVal) return;
      if (form.context) {
        finalNotes = finalNotes ? `${form.context} · ${finalNotes}` : form.context;
      }
    } else {
      if (!finalVal) return;
    }

    await db.healthTests.add({
      patientId: currentUser.id,
      type: form.type as any,
      value: finalVal,
      unit: cfg.unit,
      date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      notes: finalNotes || undefined,
    });

    // Add activity notification
    await db.notifications.add({
      userId: currentUser.id,
      userRole: 'patient',
      message: `${cfg.label} reading logged: ${finalVal} ${cfg.unit}${finalNotes ? ` (${finalNotes})` : ''}`,
      type: 'general',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setShowAdd(false);
    setForm({
      type: selectedType,
      value: '',
      bpSys: '120',
      bpDia: '80',
      context: 'Fasting',
      date: new Date().toISOString().slice(0, 16),
      notes: '',
    });
    setRefresh((r) => r + 1);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Delete this health test record?')) {
      await db.healthTests.delete(id);
      setRefresh((r) => r + 1);
    }
  };

  const cfg = TEST_TYPES.find((t) => t.key === selectedType)!;

  // Chart data preparation
  const chartData = [...tests].reverse().map((t) => {
    const dStr = t.date ? t.date.slice(0, 10) : '';
    if (t.type === 'blood_pressure') {
      const parts = t.value.split('/');
      return {
        date: dStr,
        systolic: parseInt(parts[0], 10) || 0,
        diastolic: parseInt(parts[1], 10) || 0,
      };
    }
    return {
      date: dStr,
      value: parseFloat(String(t.value)) || 0,
    };
  });

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🧪 {t('healthTests.title')}</h1>
            <p className="text-xs text-gray-500">Track and review all 5 core health metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => {
                setForm((p) => ({ ...p, type: selectedType }));
                setShowAdd(true);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('healthTests.addTest')}</span>
            </button>
          </div>
        </div>

        {/* Test Type Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {TEST_TYPES.map((tt) => {
            const Icon = tt.icon;
            const isSelected = selectedType === tt.key;
            return (
              <button
                key={tt.key}
                onClick={() => setSelectedType(tt.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#FFFFFF' : tt.color }} />
                <span>{tt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Normal Range Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800 flex items-center justify-between shadow-2xs">
          <span className="font-bold flex items-center gap-1.5">
            <span>📊 {cfg.label} ({cfg.unit})</span>
          </span>
          <span className="font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-sky-200">
            Target Range: {cfg.normal}
          </span>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center justify-between">
              <span>📈 {cfg.label} Trend ({chartData.length} Readings)</span>
              <span className="text-[10px] text-gray-400 font-normal">Offline IndexedDB Data</span>
            </h3>
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {selectedType === 'blood_pressure' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[60, 180]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" name={`${cfg.label} (${cfg.unit})`} stroke={cfg.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List */}
        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
            <div className="text-3xl mb-2">📈</div>
            <p>No {cfg.label} readings recorded yet.</p>
            <button
              onClick={() => {
                setForm((p) => ({ ...p, type: selectedType }));
                setShowAdd(true);
              }}
              className="mt-2 text-sky-600 font-bold underline"
            >
              + Add first reading
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-600 px-1">
              Retrieved History ({tests.length} records):
            </div>
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="font-extrabold text-sm text-gray-900" style={{ color: cfg.color }}>
                    {test.value} <span className="text-xs font-semibold text-gray-500">{test.unit}</span>
                  </div>
                  {test.notes && <div className="text-xs text-gray-600 mt-0.5">{test.notes}</div>}
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{test.date ? test.date.replace('T', ' ').slice(0, 16) : ''}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(test.id)}
                  className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                  title="Delete reading"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          ⚠️ {t('healthTests.disclaimer')} Always consult a certified healthcare professional or medical officer for clinical diagnosis.
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
              <h2 className="font-black text-base text-gray-900 mb-3 flex items-center gap-2">
                <span>➕</span>
                <span>{t('healthTests.addTest')}</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('healthTests.selectType')}
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold bg-gray-50 focus:bg-white"
                  >
                    {TEST_TYPES.map((tt) => (
                      <option key={tt.key} value={tt.key}>
                        {tt.label} ({tt.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form fields based on selected vital type */}
                {form.type === 'blood_pressure' ? (
                  <div className="grid grid-cols-2 gap-2 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Systolic (mmHg)</label>
                      <input
                        type="number"
                        min="50"
                        max="260"
                        value={form.bpSys}
                        onChange={(e) => setForm((p) => ({ ...p, bpSys: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-black bg-white"
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Diastolic (mmHg)</label>
                      <input
                        type="number"
                        min="30"
                        max="160"
                        value={form.bpDia}
                        onChange={(e) => setForm((p) => ({ ...p, bpDia: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-black bg-white"
                        placeholder="80"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('healthTests.value')} ({TEST_TYPES.find((t) => t.key === form.type)?.unit})
                    </label>
                    <input
                      type="number"
                      step={form.type === 'weight' || form.type === 'temperature' ? '0.1' : '1'}
                      value={form.value}
                      onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                      placeholder={
                        form.type === 'blood_sugar'
                          ? 'e.g. 105'
                          : form.type === 'weight'
                          ? 'e.g. 68.5'
                          : form.type === 'temperature'
                          ? 'e.g. 98.6'
                          : 'e.g. 72'
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-black bg-white"
                    />
                  </div>
                )}

                {form.type === 'blood_sugar' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Timing / Condition</label>
                    <select
                      value={form.context}
                      onChange={(e) => setForm((p) => ({ ...p, context: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-gray-50"
                    >
                      <option value="Fasting">Fasting (Overnight)</option>
                      <option value="Post-Breakfast">Post-Breakfast (2 hrs)</option>
                      <option value="Post-Lunch">Post-Lunch (2 hrs)</option>
                      <option value="Random">Random</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('healthTests.date')}</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('healthTests.notes')}</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="e.g. After morning walk, resting"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
