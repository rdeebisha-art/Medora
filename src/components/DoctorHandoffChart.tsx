import React, { useState } from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { VitalMeasurement } from '../types';

interface DoctorHandoffChartProps {
  vitalTrends: VitalMeasurement[];
  adherenceHistory: { month: string; rate: number }[];
}

export const DoctorHandoffChart: React.FC<DoctorHandoffChartProps> = ({
  vitalTrends,
  adherenceHistory,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'bp' | 'sugar' | 'adherence'>('bp');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
          4. Longitudinal Health Analytics & Trend Graphs
        </h3>
        <div className="flex items-center gap-1 no-print">
          <button
            onClick={() => setActiveChartTab('bp')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeChartTab === 'bp' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveChartTab('sugar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeChartTab === 'sugar' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Blood Sugar
          </button>
          <button
            onClick={() => setActiveChartTab('adherence')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeChartTab === 'adherence' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Adherence
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        {activeChartTab === 'bp' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-black text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                Blood Pressure Trend (Last 5 Readings)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Systolic
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Diastolic
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500" /> Target (120/80)
                </span>
              </div>
            </div>

            <div className="h-44 sm:h-52 w-full">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />

                <polyline
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="3"
                  points="60,42 160,37 260,40 360,30 460,22"
                />
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  points="60,110 160,107 260,109 360,103 460,100"
                />

                {vitalTrends.map((v, i) => {
                  const x = 60 + i * 100;
                  const sysY = 20 + (160 - v.bloodPressureSys) * 1.25;
                  const diaY = 100 + (100 - v.bloodPressureDia) * 1.25;

                  return (
                    <g key={v.date}>
                      <circle cx={x} cy={sysY} r="5" fill="#dc2626" />
                      <text x={x} y={sysY - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">
                        {v.bloodPressureSys}
                      </text>

                      <circle cx={x} cy={diaY} r="5" fill="#2563eb" />
                      <text x={x} y={diaY + 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">
                        {v.bloodPressureDia}
                      </text>

                      <text x={x} y="155" textAnchor="middle" fontSize="10" fill="#64748b">
                        {v.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {activeChartTab === 'sugar' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-black text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Blood Glucose Profile (Fasting vs Post-Prandial)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Fasting
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Post-Prandial
                </span>
              </div>
            </div>

            <div className="h-44 sm:h-52 w-full">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" />

                <polyline
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="3"
                  points="60,50 160,46 260,48 360,44 460,42"
                />
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  points="60,95 160,90 260,92 360,88 460,86"
                />

                {vitalTrends.map((v, i) => {
                  const x = 60 + i * 100;
                  return (
                    <g key={v.date}>
                      <circle cx={x} cy={50 - (v.bloodSugarPostPrandial - 140) * 0.8} r="4" fill="#9333ea" />
                      <text x={x} y={42 - (v.bloodSugarPostPrandial - 140) * 0.8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#9333ea">
                        {v.bloodSugarPostPrandial}
                      </text>

                      <circle cx={x} cy={95 - (v.bloodSugarFasting - 110) * 0.8} r="4" fill="#d97706" />
                      <text x={x} y={110 - (v.bloodSugarFasting - 110) * 0.8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#d97706">
                        {v.bloodSugarFasting}
                      </text>

                      <text x={x} y="155" textAnchor="middle" fontSize="10" fill="#64748b">
                        {v.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {activeChartTab === 'adherence' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-black text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Monthly Medication Adherence Rate (%)
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Current Score: 82%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-2">
              {adherenceHistory.map((adh) => (
                <div key={adh.month} className="space-y-1">
                  <div className="h-28 bg-slate-200 rounded-xl relative overflow-hidden flex items-end justify-center">
                    <div
                      className={`w-full transition-all ${
                        adh.rate >= 90 ? 'bg-emerald-500' : adh.rate >= 80 ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ height: `${adh.rate}%` }}
                    />
                    <span className="absolute top-2 text-[11px] font-black text-slate-800">
                      {adh.rate}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 block">{adh.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
