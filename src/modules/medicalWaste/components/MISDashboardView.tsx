import React, { useEffect, useState } from 'react';
import { medicalWasteDbService } from '../services/medicalWasteDbService';
import { getActiveModelMetadata } from '../ai/model/modelRegistry';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const MISDashboardView: React.FC<{ onNavigateToScan: () => void }> = ({ onNavigateToScan }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const activeModel = getActiveModelMetadata();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await medicalWasteDbService.getMISDashboardMetrics();
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  };

  const STREAM_COLORS: Record<string, string> = {
    SHARPS: '#0284C7', // Blue/White
    INFECTIOUS: '#EAB308', // Yellow
    PHARMACEUTICAL: '#D97706', // Brown
    GENERAL: '#10B981', // Green
    MANUAL_INSPECTION: '#EF4444', // Red/quarantine
    UNKNOWN: '#64748B'
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold">Loading Medical Waste MIS data from database...</p>
      </div>
    );
  }

  const categoryChartData = metrics.wasteByCategory.map((c: any) => ({
    name: c.category.replace(/_/g, ' '),
    weightKg: c.weightKg,
    count: c.count
  }));

  const streamChartData = metrics.wasteByStream.map((s: any) => ({
    name: s.stream,
    value: s.count,
    weightKg: s.weightKg
  }));

  const locationChartData = metrics.wasteByLocation.map((l: any) => ({
    name: l.name.split('-')[0].trim(),
    count: l.count,
    weightKg: l.weightKg
  }));

  return (
    <div className="space-y-6">
      {/* Top Header / MIS Title Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-400 text-teal-950">
                Institutional MIS
              </span>
              <span className="text-xs text-teal-200">Kodaikanal &amp; Palani Health Sub-Districts</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Medical Waste Management Information System (MIS)
            </h2>
            <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              Real-time audit, collection throughput, and compliance metrics calculated from persistent IndexedDB records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToScan}
              className="bg-teal-400 hover:bg-teal-300 text-teal-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[42px]"
            >
              <span>📷</span>
              <span>New Waste Scan</span>
            </button>
            <button
              type="button"
              onClick={loadMetrics}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2.5 rounded-2xl text-xs border border-white/20 transition-all min-h-[42px]"
              title="Refresh MIS calculations"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* AI MODEL STATUS ROW */}
        <div className="mt-5 pt-4 border-t border-teal-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-teal-300">AI Model Status</div>
            <div className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeModel.status === 'CONNECTED' ? 'Deployed & Active' : 'AI model not yet deployed'}</span>
            </div>
            <div className="text-[10px] text-teal-200/80 mt-1">{activeModel.architecture}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-teal-300">Model Version</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              {activeModel.modelVersion}
            </div>
            <div className="text-[10px] text-teal-200/80 mt-1">Dataset: {activeModel.datasetVersion} (11 Classes)</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-teal-300">Model Evaluation Status</div>
            <div className="text-sm font-black text-white mt-0.5">
              {activeModel.latestMetrics ? (
                <span>
                  Evaluated: {(activeModel.latestMetrics.overallAccuracy * 100).toFixed(1)}% Test Acc
                </span>
              ) : (
                <span className="text-amber-300">AI model not yet deployed</span>
              )}
            </div>
            <div className="text-[10px] text-teal-200/80 mt-1">
              Held-out test set: {activeModel.latestMetrics?.testSampleCount || 0} samples (No leakage)
            </div>
          </div>
        </div>
      </div>

      {/* CORE NUMERICAL METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Waste Collected</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {metrics.totalWasteCollectedKg} <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{metrics.totalItems} distinct items tracked</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Collection Events</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {metrics.totalCollectionEvents}
          </div>
          <div className="text-[10px] text-teal-700 font-bold mt-1">Verified transitions</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Throughput</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {metrics.collectionThroughput}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">Items fully completed</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Collections</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            {metrics.pendingCollections}
          </div>
          <div className="text-[10px] text-amber-600 mt-1">Awaiting pickup/segregation</div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In-Transit Collections</div>
          <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1">
            {metrics.inTransitCollections}
          </div>
          <div className="text-[10px] text-sky-600 mt-1">En route to treatment facility</div>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual Reviews</div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
            {metrics.manualReviewsCount}
          </div>
          <div className="text-[10px] text-purple-600 mt-1">{metrics.manualReviewRate}% of AI predictions</div>
        </div>
      </div>

      {/* DETAILED CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Waste by Category */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Waste by Category</h3>
              <p className="text-[11px] text-slate-500">Breakdown of generated medical waste by physical item type</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">Weight (kg)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                  contentStyle={{ borderRadius: '16px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="weightKg" fill="#0F766E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Waste by Segregation Stream */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Waste by Segregation Stream</h3>
              <p className="text-[11px] text-slate-500">Distribution across color-coded regulatory disposal streams</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">Item Count</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {streamChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STREAM_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [`${val} items (${item.payload.weightKg} kg)`, item.payload.name]}
                  contentStyle={{ borderRadius: '16px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Waste by Location */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Waste by Collection Location</h3>
              <p className="text-[11px] text-slate-500">Primary healthcare centers, CHCs, and maternity units</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">Items</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationChartData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [`${val} items (${item.payload.weightKg} kg)`, 'Count']}
                  contentStyle={{ borderRadius: '16px', fontSize: '11px', border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Reliability & Safety Audit Box */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">AI Confidence &amp; Review Policy</h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Safety Protocol Active
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confidence scores indicate internal model certainty, NOT clinical accuracy. Predictions with confidence &lt; 85% are automatically held for manual verification.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase">Low-Confidence Predictions</div>
                <div className="text-lg font-black text-amber-900 mt-0.5">{metrics.lowConfidencePredictions}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">&lt; 85% certainty (Quarantine stream)</div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-[10px] font-bold text-purple-800 uppercase">Completed Manual Reviews</div>
                <div className="text-lg font-black text-purple-900 mt-0.5">{metrics.manualReviewsCount}</div>
                <div className="text-[10px] text-purple-700 mt-0.5">Audited by facility nurses</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <span className="font-bold text-slate-800">Biomedical Safety Mandate:</span> Never touch unverified waste items. AI classification recommendations do not override institutional infection control guidelines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
