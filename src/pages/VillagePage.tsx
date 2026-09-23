import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function VillagePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total: 0, families: 0, children: 0, elderly: 0, pregnant: 0, newborns: 0,
    vaccinated: 0, totalVacc: 0,
  });

  useEffect(() => {
    const load = async () => {
      const patients = await db.patients.toArray();
      const families = await db.families.count();
      const vaccinations = await db.vaccinations.toArray();
      setStats({
        total: patients.length,
        families,
        children: patients.filter(p => p.isChild).length,
        elderly: patients.filter(p => p.isElderly).length,
        pregnant: patients.filter(p => p.isPregnant).length,
        newborns: patients.filter(p => p.isNewborn).length,
        vaccinated: vaccinations.filter(v => v.status === 'given').length,
        totalVacc: vaccinations.length,
      });
    };
    load();
  }, []);

  const chartData = [
    { name: 'Children', value: stats.children, color: '#f59e0b' },
    { name: 'Elderly', value: stats.elderly, color: '#8b5cf6' },
    { name: 'Pregnant', value: stats.pregnant, color: '#ec4899' },
    { name: 'Newborns', value: stats.newborns, color: '#10b981' },
  ];

  const vaccPct = stats.totalVacc > 0 ? Math.round((stats.vaccinated / stats.totalVacc) * 100) : 0;

  const CONDITIONS = [
    { condition: 'Anaemia', count: 2, color: 'bg-red-100 text-red-700' },
    { condition: 'Diabetes', count: 2, color: 'bg-orange-100 text-orange-700' },
    { condition: 'Hypertension', count: 2, color: 'bg-yellow-100 text-yellow-700' },
    { condition: 'COPD', count: 1, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🏘️ {t('village.title')}</h1>
            <p className="text-sm text-gray-500">Kodaikanal Village Health Overview</p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: t('village.population'), value: stats.total, emoji: '👥', color: 'bg-sky-50 text-sky-700' },
            { label: t('village.families'), value: stats.families, emoji: '👪', color: 'bg-purple-50 text-purple-700' },
            { label: t('village.pregnant'), value: stats.pregnant, emoji: '🤰', color: 'bg-pink-50 text-pink-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: t('village.children'), value: stats.children, emoji: '👶' },
            { label: t('village.elderly'), value: stats.elderly, emoji: '👴' },
            { label: t('village.newborns'), value: stats.newborns, emoji: '🍼' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>

        {/* Vaccination Coverage */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-green-800">💉 {t('village.vaccination')}</h2>
            <span className="text-2xl font-black text-green-700">{vaccPct}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-green-500 h-3 rounded-full transition-all duration-700" style={{ width: `${vaccPct}%` }} />
          </div>
          <p className="text-xs text-green-600 mt-1">{stats.vaccinated} of {stats.totalVacc} vaccinations given</p>
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">📊 {t('village.stats')}</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Common Conditions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">🩺 {t('village.commonConcerns')}</h2>
          <div className="space-y-2">
            {CONDITIONS.map(c => (
              <div key={c.condition} className="flex items-center justify-between">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${c.color}`}>{c.condition}</span>
                <span className="font-bold text-gray-700">{c.count} patients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Availability */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-sky-800 mb-2">👨‍⚕️ {t('village.doctor')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Dr. Arjun Mehta (General)</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Dr. Kavitha Rao (Gynec/Pediatrics)</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Available</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">{t('village.demoNote')}</p>
      </div>
    </Layout>
  );
}
