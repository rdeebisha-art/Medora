import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { APPROVED_INDIAN_TEMPLATES } from '../services/sms/smsService';
import { CheckCircle2, AlertTriangle, Radio, Wifi, Phone, MessageSquare, Eye, Cpu, RefreshCw } from 'lucide-react';

export default function AdminPortalPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tab, setTab] = useState<'stats' | 'patients' | 'register' | 'integrations'>('stats');
  const [stats, setStats] = useState({ patients: 0, families: 0, doctors: 0, admins: 0 });
  const [form, setForm] = useState({ name: '', age: '', gender: 'Female', phone: '', village: 'Kodaikanal', motherName: '', weight: '' });
  const [registered, setRegistered] = useState(false);

  // Live Integrations State
  const [integrations, setIntegrations] = useState<any>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const fetchIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch {
      // offline
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    db.patients.toArray().then(setPatients);
    Promise.all([db.patients.count(), db.families.count(), db.doctors.count(), db.admins.count()])
      .then(([p, f, d, a]) => setStats({ patients: p, families: f, doctors: d, admins: a }));

    fetchIntegrations();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const registerNewborn = async () => {
    if (!form.name || !form.motherName) return;
    const today = new Date().toISOString().split('T')[0];
    const id = await db.patients.add({
      name: form.name,
      age: 0,
      gender: form.gender.toLowerCase() as 'male' | 'female',
      phone: form.phone || '0000000000',
      pin: '1234',
      role: 'patient',
      village: form.village,
      language: 'ta',
      isNewborn: true,
      dateOfBirth: today,
      conditions: [],
      allergies: [],
    });
    // Add BCG vaccination due
    await db.vaccinations.add({ patientId: id as number, vaccineName: 'BCG', dueDate: today, status: 'due' });
    await db.vaccinations.add({ patientId: id as number, vaccineName: 'OPV-0 (Birth Dose)', dueDate: today, status: 'due' });
    await db.vaccinations.add({ patientId: id as number, vaccineName: 'Hepatitis B (Birth Dose)', dueDate: today, status: 'due' });
    await db.notifications.add({
      userId: id as number, userRole: 'patient',
      message: `Newborn ${form.name} registered. BCG, OPV, Hep B vaccinations are due.`,
      type: 'vaccination', isRead: false, createdAt: new Date().toISOString(),
    });
    setRegistered(true);
    db.patients.toArray().then(setPatients);
  };

  if (currentUser?.role !== 'admin') {
    return <Layout><div className="p-6 text-center text-gray-500"><div className="text-4xl mb-2">🔒</div><p>Admin login required.</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🔑 {t('admin.portal')}</h1>
            <p className="text-sm text-gray-500">{currentUser.name}</p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4 flex-wrap">
          {[
            { key: 'stats', label: '📊 Stats' },
            { key: 'patients', label: '👥 Patients' },
            { key: 'register', label: '🍼 Register Newborn' },
            { key: 'integrations', label: '🔌 Integrations & SMS' },
          ].map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key as any)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                tab === tItem.key ? 'bg-white shadow font-bold text-sky-700' : 'text-gray-500'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>


        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('admin.totalPatients'), value: stats.patients, emoji: '👤', color: 'bg-sky-50 text-sky-700' },
                { label: t('admin.totalFamilies'), value: stats.families, emoji: '👪', color: 'bg-purple-50 text-purple-700' },
                { label: t('admin.totalDoctors'), value: stats.doctors, emoji: '👨‍⚕️', color: 'bg-green-50 text-green-700' },
                { label: 'Admins', value: stats.admins, emoji: '🔑', color: 'bg-orange-50 text-orange-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                  <div className="text-4xl font-black">{s.value}</div>
                  <div className="text-sm font-medium mt-1">{s.emoji} {s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">🏥 Kodaikanal Village Summary</h3>
              {[
                { label: 'Pregnant Women', count: patients.filter(p => p.isPregnant).length, color: 'text-pink-600' },
                { label: 'Newborns', count: patients.filter(p => p.isNewborn).length, color: 'text-rose-600' },
                { label: 'Elderly Patients', count: patients.filter(p => p.isElderly).length, color: 'text-orange-600' },
                { label: 'Children', count: patients.filter(p => p.isChild).length, color: 'text-yellow-600' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{r.label}</span>
                  <span className={`font-bold ${r.color}`}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'patients' && (
          <div className="space-y-2">
            {patients.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">{p.name[0]}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.age} {t('common.years')} · {p.gender} · {p.village} · {p.phone}</div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {p.isPregnant && <span className="text-xs bg-pink-100 text-pink-700 px-1.5 rounded-full">Pregnant</span>}
                      {p.isElderly && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 rounded-full">Elderly</span>}
                      {p.isNewborn && <span className="text-xs bg-rose-100 text-rose-700 px-1.5 rounded-full">Newborn</span>}
                      {p.isChild && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded-full">Child</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'register' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">🍼 {t('admin.newborn')}</h2>
            {registered ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-bold text-green-700">{t('admin.newbornRegistered')}</div>
                <button onClick={() => { setRegistered(false); setForm({ name: '', age: '', gender: 'Female', phone: '', village: 'Kodaikanal', motherName: '', weight: '' }); }}
                  className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-xl font-medium">Register Another</button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'name', label: "Baby's Name", placeholder: "e.g. Baby Priya" },
                  { key: 'motherName', label: "Mother's Name", placeholder: "e.g. Lakshmi Devi" },
                  { key: 'weight', label: "Birth Weight (kg)", placeholder: "e.g. 2.9" },
                  { key: 'phone', label: "Mother's Phone", placeholder: "10-digit phone" },
                  { key: 'village', label: "Village", placeholder: "Kodaikanal" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <button onClick={registerNewborn} className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700">
                  {t('admin.register')} Newborn
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'integrations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">External Service Integrations & Telephony</h3>
                <p className="text-xs text-slate-500">Live configuration and connectivity audit across real service gateways.</p>
              </div>
              <button
                onClick={fetchIntegrations}
                disabled={loadingIntegrations}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingIntegrations ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Core Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* SMS Gateway Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">SMS Gateway (Twilio)</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      integrations?.sms?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {integrations?.sms?.configured ? 'CONNECTED ✓' : 'NOT CONFIGURED'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Sender ID:</span>
                    <span className="font-bold text-slate-800 font-mono">{integrations?.sms?.senderId || 'MEDORA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From Number:</span>
                    <span className="font-bold text-slate-800 font-mono">{integrations?.sms?.fromNumber || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved Templates:</span>
                    <span className="font-bold text-emerald-700">4 Indian Templates Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last SMS Dispatched:</span>
                    <span className="font-bold text-slate-800">
                      {integrations?.sms?.lastMessage?.status || 'No recent SMS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telephony Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-slate-900">Telephony & Voice Call</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      integrations?.telephony?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {integrations?.telephony?.configured ? 'CONNECTED ✓' : 'NOT CONFIGURED'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Outbound Calling:</span>
                    <span className="font-bold text-slate-800">
                      {integrations?.telephony?.configured ? 'Active on port 3000' : 'Mobile dialer fallback'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caller ID:</span>
                    <span className="font-bold text-slate-800 font-mono">{integrations?.telephony?.fromNumber || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Call Attempt:</span>
                    <span className="font-bold text-slate-800">
                      {integrations?.telephony?.lastCall?.status || 'No recent calls'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Imaging AI Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900">Medical Imaging (Gemini)</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      integrations?.medicalImaging?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {integrations?.medicalImaging?.configured ? 'ONLINE ✓' : 'NOT CONFIGURED'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Model Engine:</span>
                    <span className="font-bold text-slate-800 font-mono">gemini-3.8-flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Radiology Finding Status:</span>
                    <span className="font-bold text-purple-800">AI-Assisted (Doctor Review Required)</span>
                  </div>
                </div>
              </div>

              {/* Speech & TTS */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Voice Recognition & TTS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    AVAILABLE ✓
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Speech Synthesis:</span>
                    <span className="font-bold text-slate-800">6 Indian Languages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internet Status:</span>
                    <span className={`font-bold ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isOnline ? 'Online (Connected)' : 'Offline (Local Dexie Mode)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Indian SMS Templates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900">Approved DLT Templates (India Standard):</h4>
              <div className="space-y-2">
                {APPROVED_INDIAN_TEMPLATES.map((tmpl) => (
                  <div key={tmpl.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800">{tmpl.name}</strong>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {tmpl.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono leading-relaxed">{tmpl.templateText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
