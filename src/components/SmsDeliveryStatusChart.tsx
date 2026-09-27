import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SmsOutbox } from '../db/db';
import { CheckCircle2, AlertCircle, Archive, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface SmsDeliveryStatusChartProps {
  messages: SmsOutbox[];
}

type ChartType = 'bar' | 'area';
type TimeRange = '7d' | '14d' | '30d' | 'all';

interface TimePointData {
  key: string;
  label: string;
  Sent: number;
  Failed: number;
  Pending: number;
  total: number;
}

export const SmsDeliveryStatusChart: React.FC<SmsDeliveryStatusChartProps> = ({ messages }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Overall metric counters
  const totals = useMemo(() => {
    let sent = 0;
    let failed = 0;
    let pending = 0;

    messages.forEach((m) => {
      const s = (m.status || '').toUpperCase();
      if (['DELIVERED', 'SUBMITTED', 'SENT'].includes(s)) {
        sent++;
      } else if (['FAILED', 'FAIL'].includes(s)) {
        failed++;
      } else {
        // OFFLINE_OUTBOX, PENDING, PENDING_OFFLINE, QUEUED, DEMO_ONLY
        pending++;
      }
    });

    const total = messages.length;
    const sentRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return { sent, failed, pending, total, sentRate };
  }, [messages]);

  // Aggregate messages over time
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 60;
    const now = new Date();
    const map = new Map<string, TimePointData>();

    // Initialize consecutive dates ending at today
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map.set(isoDate, {
        key: isoDate,
        label,
        Sent: 0,
        Failed: 0,
        Pending: 0,
        total: 0,
      });
    }

    // Populate counts from messages
    messages.forEach((m) => {
      const dateKey = m.createdAt ? m.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const s = (m.status || '').toUpperCase();

      let point = map.get(dateKey);
      if (!point) {
        if (timeRange === 'all') {
          const d = new Date(m.createdAt || Date.now());
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          point = { key: dateKey, label, Sent: 0, Failed: 0, Pending: 0, total: 0 };
          map.set(dateKey, point);
        } else {
          return;
        }
      }

      if (['DELIVERED', 'SUBMITTED', 'SENT'].includes(s)) {
        point.Sent += 1;
      } else if (['FAILED', 'FAIL'].includes(s)) {
        point.Failed += 1;
      } else {
        point.Pending += 1;
      }
      point.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [messages, timeRange]);

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sentVal = payload.find((p: any) => p.dataKey === 'Sent')?.value || 0;
      const failedVal = payload.find((p: any) => p.dataKey === 'Failed')?.value || 0;
      const pendingVal = payload.find((p: any) => p.dataKey === 'Pending')?.value || 0;
      const dayTotal = sentVal + failedVal + pendingVal;

      return (
        <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[150px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400">{dayTotal} Total</span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Sent
              </span>
              <span>{sentVal}</span>
            </div>

            <div className="flex items-center justify-between text-rose-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Failed
              </span>
              <span>{failedVal}</span>
            </div>

            <div className="flex items-center justify-between text-sky-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                Pending
              </span>
              <span>{pendingVal}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-400" />
            <span>SMS Delivery Status Distribution Over Time</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time visual breakdown of Sent, Failed, and Pending message dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range toggle */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px] font-bold text-slate-400">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === range ? 'bg-slate-800 text-teal-300 font-black shadow-xs' : 'hover:text-slate-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart style toggle */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-slate-800 text-teal-300' : 'hover:text-slate-200'
              }`}
              title="Stacked Bar Chart"
            >
              <BarChart3 size={13} />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-slate-800 text-teal-300' : 'hover:text-slate-200'
              }`}
              title="Smooth Area Chart"
            >
              <TrendingUp size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sent</div>
            <div className="text-lg font-black text-emerald-400">{totals.sent}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed</div>
            <div className="text-lg font-black text-rose-400">{totals.failed}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertCircle size={16} />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending / Outbox</div>
            <div className="text-lg font-black text-sky-400">{totals.pending}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Archive size={16} />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</div>
            <div className="text-lg font-black text-teal-300">{totals.sentRate}%</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
            %
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="h-56 sm:h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />
              <Bar dataKey="Sent" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Sent" />
              <Bar dataKey="Pending" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} name="Pending" />
              <Bar dataKey="Failed" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failed" />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="Sent"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSent)"
                name="Sent"
              />
              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPending)"
                name="Pending"
              />
              <Area
                type="monotone"
                dataKey="Failed"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFailed)"
                name="Failed"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Calendar size={11} /> Distribution over {timeRange === '7d' ? '7 days' : timeRange === '14d' ? '14 days' : '30 days'}
        </span>
        <span>Green = Delivered/Submitted • Blue = Outbox/Pending • Red = Failed</span>
      </div>
    </div>
  );
};
