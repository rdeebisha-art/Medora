import React from 'react';
import { MedicalWasteRole } from '../types/wasteTypes';
import { getActiveModelMetadata } from '../ai/model/modelRegistry';

export type MedicalWasteTab =
  | 'dashboard'
  | 'scanner'
  | 'workflow'
  | 'review'
  | 'ai_performance'
  | 'audit_logs';

interface NavigationProps {
  activeTab: MedicalWasteTab;
  onTabChange: (tab: MedicalWasteTab) => void;
  activeRole: MedicalWasteRole;
  onRoleChange: (role: MedicalWasteRole) => void;
  pendingSyncCount: number;
  onSync: () => void;
  isSyncing: boolean;
}

export const MedicalWasteNavigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  onRoleChange,
  pendingSyncCount,
  onSync,
  isSyncing
}) => {
  const activeModel = getActiveModelMetadata();

  const tabs: { id: MedicalWasteTab; label: string; icon: string; minRole: MedicalWasteRole[] }[] = [
    { id: 'dashboard', label: 'MIS Dashboard', icon: '📊', minRole: ['admin', 'facility_staff'] },
    { id: 'scanner', label: 'Scan Waste', icon: '📷', minRole: ['admin', 'facility_staff', 'waste_worker'] },
    { id: 'workflow', label: 'Collection Flow', icon: '📦', minRole: ['admin', 'facility_staff', 'waste_worker'] },
    { id: 'review', label: 'Manual Review', icon: '🔍', minRole: ['admin', 'facility_staff'] },
    { id: 'ai_performance', label: 'AI Performance', icon: '🧠', minRole: ['admin'] },
    { id: 'audit_logs', label: 'Audit Logs', icon: '📋', minRole: ['admin'] }
  ];

  const visibleTabs = tabs.filter((t) => t.minRole.includes(activeRole));

  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Module Title & Role Switcher */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ☣️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-none">
                  Medical Waste Management
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  SIH 2026 PS26115
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Smart Mobile Segregation, Collection &amp; Tracking System
              </p>
            </div>
          </div>

          {/* Role Selector Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase px-2">Role:</span>
            {(['admin', 'facility_staff', 'waste_worker', 'patient_family'] as MedicalWasteRole[]).map((r) => {
              const roleLabels: Record<MedicalWasteRole, string> = {
                admin: 'Admin',
                facility_staff: 'Facility Staff',
                waste_worker: 'Collector',
                patient_family: 'Patient / Public'
              };
              const isSelected = activeRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {roleLabels[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Indicators & Sync */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active AI Model Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700">Model:</span>
            <span className="font-mono text-teal-800 font-bold">{activeModel.modelVersion}</span>
          </div>

          {/* Offline / Pending Sync Badge */}
          {pendingSyncCount > 0 ? (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition-colors"
              title="Click to synchronize offline records"
            >
              <span>🔄</span>
              <span>{pendingSyncCount} Pending Sync</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span>✓</span>
              <span>Synced</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex gap-1 overflow-x-auto scrollbar-hide border-t border-slate-100 pt-1">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#0F766E] text-[#0F766E] bg-teal-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
