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
import { Activity, Heart, Droplets, Calendar, Sparkles, Scale, Thermometer } from 'lucide-react';

interface HealthTrendsProps {
  tests: HealthTest[];
}

export type TrendMetric = 'bp' | 'sugar' | 'pulse' | 'weight' | 'temperature';

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
        weight?: number;
        temperature?: number;
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
      } else if (t.type === 'weight') {
        const weightVal = parseFloat(t.value);
        if (!isNaN(weightVal)) entry.weight = weightVal;
      } else if (t.type === 'temperature') {
        const tempVal = parseFloat(t.value);
        if (!isNaN(tempVal)) entry.temperature = tempVal;
      }
    });

    return Array.from(dayMap.values());
  }, [tests]);

  // Compute latest readings and summary stats
  const stats = useMemo(() => {
    const bpEntries = chartData.filter((d) => d.systolic !== undefined);
    const sugarEntries = chartData.filter((d) => d.sugar !== undefined);
    const pulseEntries = chartData.filter((d) => d.pulse !== undefined);
    const weightEntries = chartData.filter((d) => d.weight !== undefined);
    const tempEntries = chartData.filter((d) => d.temperature !== undefined);

    const latestBp = bpEntries[bpEntries.length - 1];
    const latestSugar = sugarEntries[sugarEntries.length - 1];
    const latestPulse = pulseEntries[pulseEntries.length - 1];
    const latestWeight = weightEntries[weightEntries.length - 1];
    const latestTemp = tempEntries[tempEntries.length - 1];

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
    const avgWeight = weightEntries.length
      ? (weightEntries.reduce((acc, c) => acc + (c.weight || 0), 0) / weightEntries.length).toFixed(1)
      : null;
    const avgTemp = tempEntries.length
      ? (tempEntries.reduce((acc, c) => acc + (c.temperature || 0), 0) / tempEntries.length).toFixed(1)
      : null;

    return {
      latestBp: latestBp ? `${latestBp.systolic}/${latestBp.diastolic} mmHg` : 'Not recorded',
      avgBp: avgSys && avgDia ? `${avgSys}/${avgDia} mmHg` : '—',
      latestSugar: latestSugar ? `${latestSugar.sugar} mg/dL` : 'Not recorded',
      avgSugar: avgSugar ? `${avgSugar} mg/dL` : '—',
      latestPulse: latestPulse ? `${latestPulse.pulse} bpm` : 'Not recorded',
      avgPulse: avgPulse ? `${avgPulse} bpm` : '—',
      latestWeight: latestWeight ? `${latestWeight.weight} kg` : 'Not recorded',
      avgWeight: avgWeight ? `${avgWeight} kg` : '—',
      latestTemp: latestTemp ? `${latestTemp.temperature} °F` : 'Not recorded',
      avgTemp: avgTemp ? `${avgTemp} °F` : '—',
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
            Continuous local trends for all 5 core health metrics
          </p>
        </div>

        {/* Metric Selector Buttons (5 Requested Metrics) */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedMetric('bp')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
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
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
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
            onClick={() => setSelectedMetric('weight')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'weight'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weight</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('temperature')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'temperature'
                ? 'bg-white text-purple-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('pulse')}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === 'pulse'
                ? 'bg-white text-rose-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Pulse</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards for 5 Health Tracking Features */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        <div
          onClick={() => setSelectedMetric('bp')}
          className={`cursor-pointer rounded-xl p-2.5 transition-all border ${
            selectedMetric === 'bp' ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-400' : 'bg-slate-50 border-slate-200 hover:bg-teal-50/40'
          }`}
        >
          <div className="text-[10px] font-bold text-teal-800 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Blood Pressure
          </div>
          <div className="text-xs font-black text-[#0F172A] mt-0.5">{stats.latestBp}</div>
          <div className="text-[9px] text-teal-700">30d Avg: {stats.avgBp}</div>
        </div>

        <div
          onClick={() => setSelectedMetric('sugar')}
          className={`cursor-pointer rounded-xl p-2.5 transition-all border ${
            selectedMetric === 'sugar' ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-400' : 'bg-slate-50 border-slate-200 hover:bg-orange-50/40'
          }`}
        >
          <div className="text-[10px] font-bold text-orange-800 flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Blood Sugar
          </div>
          <div className="text-xs font-black text-[#0F172A] mt-0.5">{stats.latestSugar}</div>
          <div className="text-[9px] text-orange-700">30d Avg: {stats.avgSugar}</div>
        </div>

        <div
          onClick={() => setSelectedMetric('weight')}
          className={`cursor-pointer rounded-xl p-2.5 transition-all border ${
            selectedMetric === 'weight' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400' : 'bg-slate-50 border-slate-200 hover:bg-blue-50/40'
          }`}
        >
          <div className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
            <Scale className="w-3 h-3" /> Weight
          </div>
          <div className="text-xs font-black text-[#0F172A] mt-0.5">{stats.latestWeight}</div>
          <div className="text-[9px] text-blue-700">30d Avg: {stats.avgWeight}</div>
        </div>

        <div
          onClick={() => setSelectedMetric('temperature')}
          className={`cursor-pointer rounded-xl p-2.5 transition-all border ${
            selectedMetric === 'temperature' ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400' : 'bg-slate-50 border-slate-200 hover:bg-purple-50/40'
          }`}
        >
          <div className="text-[10px] font-bold text-purple-800 flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> Temperature
          </div>
          <div className="text-xs font-black text-[#0F172A] mt-0.5">{stats.latestTemp}</div>
          <div className="text-[9px] text-purple-700">30d Avg: {stats.avgTemp}</div>
        </div>

        <div
          onClick={() => setSelectedMetric('pulse')}
          className={`cursor-pointer col-span-2 sm:col-span-1 rounded-xl p-2.5 transition-all border ${
            selectedMetric === 'pulse' ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400' : 'bg-slate-50 border-slate-200 hover:bg-rose-50/40'
          }`}
        >
          <div className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
            <Heart className="w-3 h-3" /> Pulse
          </div>
          <div className="text-xs font-black text-[#0F172A] mt-0.5">{stats.latestPulse}</div>
          <div className="text-[9px] text-rose-700">30d Avg: {stats.avgPulse}</div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {selectedMetric === 'bp' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis domain={[60, 180]} tick={{ fontSize: 10, fill: '#64748B' }} />
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
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis domain={[70, 220]} tick={{ fontSize: 10, fill: '#64748B' }} />
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
          ) : selectedMetric === 'weight' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748B' }} />
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
                dataKey="weight"
                name="Weight (kg)"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB' }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          ) : selectedMetric === 'temperature' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis domain={[96, 104]} tick={{ fontSize: 10, fill: '#64748B' }} />
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
                dataKey="temperature"
                name="Temperature (°F)"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#7C3AED' }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
              <YAxis domain={[50, 110]} tick={{ fontSize: 10, fill: '#64748B' }} />
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
          <Sparkles className="w-3 h-3" /> 5 Core Vitals Tracked Offline in IndexedDB
        </span>
      </div>
    </div>
  );
};
