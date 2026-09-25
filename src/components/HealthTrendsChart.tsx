import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HealthTest } from '../db/db';
import { Activity, Heart, Droplets, Calendar, Sparkles } from 'lucide-react';

interface HealthTrendsProps {
  tests: HealthTest[];
}

export type TrendMetric = 'bp' | 'sugar' | 'pulse';

export const HealthTrendsChart: React.FC<HealthTrendsProps> = ({ tests }) => {
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('bp');

  // Process data for the last 30 days
  const chartData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Create a map by day string (YYYY-MM-DD)
    const dayMap = new Map<
      string,
      {
        date: string;
        displayDate: string;
        systolic?: number;
        diastolic?: number;
        sugar?: number;
        pulse?: number;
      }
    >();

    // Initialize all 30 days so the timeline is continuous
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const display = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      dayMap.set(iso, { date: iso, displayDate: display });
    }

    // Populate readings from IndexedDB health tests
    tests.forEach((t) => {
      if (!t.date) return;
      const dStr = t.date.split('T')[0];
      const entry = dayMap.get(dStr);
      if (!entry) return;

      if (t.type === 'blood_pressure') {
        const parts = t.value.split('/');
        if (parts.length === 2) {
          const sys = parseInt(parts[0], 10);
          const dia = parseInt(parts[1], 10);
          if (!isNaN(sys)) entry.systolic = sys;
          if (!isNaN(dia)) entry.diastolic = dia;
        }
      } else if (t.type === 'blood_sugar') {
        const sugarVal = parseFloat(t.value);
        if (!isNaN(sugarVal)) entry.sugar = sugarVal;
      } else if (t.type === 'pulse') {
        const pulseVal = parseFloat(t.value);
        if (!isNaN(pulseVal)) entry.pulse = pulseVal;
      }
    });

    return Array.from(dayMap.values());
  }, [tests]);

  // Compute latest readings and summary stats
  const stats = useMemo(() => {
    const bpEntries = chartData.filter((d) => d.systolic !== undefined);
    const sugarEntries = chartData.filter((d) => d.sugar !== undefined);
    const pulseEntries = chartData.filter((d) => d.pulse !== undefined);

    const latestBp = bpEntries[bpEntries.length - 1];
    const latestSugar = sugarEntries[sugarEntries.length - 1];
    const latestPulse = pulseEntries[pulseEntries.length - 1];

    const avgSys = bpEntries.length
      ? Math.round(bpEntries.reduce((acc, c) => acc + (c.systolic || 0), 0) / bpEntries.length)
      : null;
    const avgDia = bpEntries.length
      ? Math.round(bpEntries.reduce((acc, c) => acc + (c.diastolic || 0), 0) / bpEntries.length)
      : null;
    const avgSugar = sugarEntries.length
      ? Math.round(sugarEntries.reduce((acc, c) => acc + (c.sugar || 0), 0) / sugarEntries.length)
      : null;
    const avgPulse = pulseEntries.length
      ? Math.round(pulseEntries.reduce((acc, c) => acc + (c.pulse || 0), 0) / pulseEntries.length)
      : null;

    return {
      latestBp: latestBp ? `${latestBp.systolic}/${latestBp.diastolic} mmHg` : 'Not recorded',
      avgBp: avgSys && avgDia ? `${avgSys}/${avgDia} mmHg` : '—',
      latestSugar: latestSugar ? `${latestSugar.sugar} mg/dL` : 'Not recorded',
      avgSugar: avgSugar ? `${avgSugar} mg/dL` : '—',
      latestPulse: latestPulse ? `${latestPulse.pulse} bpm` : 'Not recorded',
      avgPulse: avgPulse ? `${avgPulse} bpm` : '—',
      totalReadings: tests.length,
    };
  }, [chartData, tests]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E]">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="font-extrabold text-sm text-[#0F172A]">Health Trends (Last 30 Days)</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Offline-accessible vitals logged in IndexedDB &amp; LocalStorage
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedMetric('bp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'bp'
                ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Blood Pressure</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('sugar')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'sugar'
                ? 'bg-white text-orange-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Blood Sugar</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('pulse')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'pulse'
                ? 'bg-white text-rose-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Heart Rate</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-2.5">
          <div className="text-[11px] font-semibold text-teal-800">Latest BP</div>
          <div className="text-sm font-black text-[#0F172A]">{stats.latestBp}</div>
          <div className="text-[10px] text-teal-700">30d Avg: {stats.avgBp}</div>
        </div>
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-2.5">
          <div className="text-[11px] font-semibold text-orange-800">Latest Sugar</div>
          <div className="text-sm font-black text-[#0F172A]">{stats.latestSugar}</div>
          <div className="text-[10px] text-orange-700">30d Avg: {stats.avgSugar}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-rose-50/60 border border-rose-100 rounded-xl p-2.5">
          <div className="text-[11px] font-semibold text-rose-800">Latest Heart Rate</div>
          <div className="text-sm font-black text-[#0F172A]">{stats.latestPulse}</div>
          <div className="text-[10px] text-rose-700">30d Avg: {stats.avgPulse}</div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {selectedMetric === 'bp' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#64748B' }}
                interval={4}
              />
              <YAxis
                domain={[60, 180]}
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic (mmHg)"
                stroke="#0F766E"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic (mmHg)"
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          ) : selectedMetric === 'sugar' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#64748B' }}
                interval={4}
              />
              <YAxis
                domain={[70, 220]}
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Line
                type="monotone"
                dataKey="sugar"
                name="Blood Glucose (mg/dL)"
                stroke="#EA580C"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#EA580C' }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#64748B' }}
                interval={4}
              />
              <YAxis
                domain={[50, 110]}
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Line
                type="monotone"
                dataKey="pulse"
                name="Pulse (bpm)"
                stroke="#E11D48"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#E11D48' }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-slate-100 mt-2">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Real-time 30-day window
        </span>
        <span className="text-[#0F766E] font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> IndexedDB Offline Storage Active
        </span>
      </div>
    </div>
  );
};
