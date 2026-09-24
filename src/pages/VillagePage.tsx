import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, Heart, Pill, Activity, FileText, Stethoscope, Building2, ShieldCheck } from 'lucide-react';

interface VillageStats {
  totalPatients: number;
  families: number;
  children: number;
  elderly: number;
  pregnant: number;
  newborns: number;
  vaccinated: number;
  totalVacc: number;
  medicinesCount: number;
  testsCount: number;
  recordsCount: number;
  doctorsCount: number;
  hospitalsCount: number;
  conditionCounts: Array<{ name: string; count: number }>;
}

export default function VillagePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<VillageStats>({
    totalPatients: 0,
    families: 0,
    children: 0,
    elderly: 0,
    pregnant: 0,
    newborns: 0,
    vaccinated: 0,
    totalVacc: 0,
    medicinesCount: 0,
    testsCount: 0,
    recordsCount: 0,
    doctorsCount: 0,
    hospitalsCount: 0,
    conditionCounts: []
  });

  useEffect(() => {
    const loadDynamicData = async () => {
      const patients = await db.patients.toArray();
      const families = await db.families.count();
      const vaccinations = await db.vaccinations.toArray();
      const medicinesCount = await db.medicines.count();
      const testsCount = await db.healthTests.count();
      const recordsCount = await db.medicalRecords.count();
      const doctorsCount = await db.doctors.count();
      const hospitalsCount = await db.hospitals.count();

      // Dynamically calculate condition frequencies from patient records
      const countsMap = new Map<string, number>();
      for (const p of patients) {
        if (p.conditions && Array.isArray(p.conditions)) {
          for (const c of p.conditions) {
            const clean = c.trim();
            if (clean) {
              countsMap.set(clean, (countsMap.get(clean) || 0) + 1);
            }
          }
        }
      }

      const conditionCounts = Array.from(countsMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalPatients: patients.length,
        families,
        children: patients.filter((p) => p.isChild).length,
        elderly: patients.filter((p) => p.isElderly).length,
        pregnant: patients.filter((p) => p.isPregnant).length,
        newborns: patients.filter((p) => p.isNewborn).length,
        vaccinated: vaccinations.filter((v) => v.status === 'given').length,
        totalVacc: vaccinations.length,
        medicinesCount,
        testsCount,
        recordsCount,
        doctorsCount,
        hospitalsCount,
        conditionCounts
      });
    };

    loadDynamicData();
  }, []);

  const chartData = [
    { name: 'Children', value: stats.children, color: '#f59e0b' },
    { name: 'Elderly', value: stats.elderly, color: '#8b5cf6' },
    { name: 'Pregnant', value: stats.pregnant, color: '#ec4899' },
    { name: 'Newborns', value: stats.newborns, color: '#10b981' }
  ];

  const vaccPct = stats.totalVacc > 0 ? Math.round((stats.vaccinated / stats.totalVacc) * 100) : 0;

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-100">🏘️ {t('village.title')}</h1>
            <p className="text-xs text-slate-400">Live Village Health Registry • IndexedDB Ground Truth</p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black text-teal-400">{stats.totalPatients}</div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">👥 Total Patients</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black text-purple-400">{stats.families}</div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">👪 Families</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black text-pink-400">{stats.pregnant}</div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">🤰 Pregnant</div>
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <div className="text-xl font-black text-amber-400">{stats.children}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">👶 Children</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <div className="text-xl font-black text-indigo-400">{stats.elderly}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">👴 Elderly (60+)</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <div className="text-xl font-black text-emerald-400">{stats.newborns}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">🍼 Newborns</div>
          </div>
        </div>

        {/* Clinical Resource Inventory (Dynamic from IndexedDB) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-300">CLINICAL DATABASE RECORDS</div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
              <div className="font-black text-teal-300">{stats.medicinesCount}</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Pill size={11} /> Meds
              </div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
              <div className="font-black text-blue-300">{stats.testsCount}</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Activity size={11} /> Tests
              </div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
              <div className="font-black text-purple-300">{stats.recordsCount}</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <FileText size={11} /> Reports
              </div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
              <div className="font-black text-amber-300">{stats.doctorsCount + stats.hospitalsCount}</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Building2 size={11} /> Facilities
              </div>
            </div>
          </div>
        </div>

        {/* Vaccination Coverage Gauge */}
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h2 className="font-bold text-sm text-emerald-300">{t('village.vaccination')}</h2>
            </div>
            <span className="text-2xl font-black text-emerald-300">{vaccPct}%</span>
          </div>
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
            <div className="bg-emerald-500 h-3 rounded-full transition-all duration-700" style={{ width: `${vaccPct}%` }} />
          </div>
          <p className="text-xs text-emerald-400 mt-1.5">{stats.vaccinated} of {stats.totalVacc} scheduled vaccinations administered</p>
        </div>

        {/* Demographics Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-xs text-slate-300 mb-3 uppercase tracking-wider">Demographic Breakdown (Patients)</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Chronic Conditions Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            Common Diagnosed Conditions ({stats.conditionCounts.length})
          </h2>

          {stats.conditionCounts.length === 0 ? (
            <p className="text-xs text-slate-500">No active chronic conditions registered.</p>
          ) : (
            <div className="space-y-2">
              {stats.conditionCounts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-rose-400" />
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <span className="bg-rose-950/80 text-rose-300 border border-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {item.count} {item.count === 1 ? 'patient' : 'patients'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
