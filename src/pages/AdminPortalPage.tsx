import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function AdminPortalPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tab, setTab] = useState<'stats' | 'patients' | 'register'>('stats');
  const [stats, setStats] = useState({ patients: 0, families: 0, doctors: 0, admins: 0 });
  const [form, setForm] = useState({ name: '', age: '', gender: 'Female', phone: '', village: 'Kodaikanal', motherName: '', weight: '' });
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    db.patients.toArray().then(setPatients);
    Promise.all([db.patients.count(), db.families.count(), db.doctors.count(), db.admins.count()])
      .then(([p, f, d, a]) => setStats({ patients: p, families: f, doctors: d, admins: a }));
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
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {[{key:'stats',label:'📊 Stats'},{key:'patients',label:'👥 Patients'},{key:'register',label:'🍼 Register Newborn'}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.key ? 'bg-white shadow font-bold text-sky-700' : 'text-gray-500'}`}>
              {t.label}
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
      </div>
    </Layout>
  );
}
