import React from 'react';
import { useMedora } from '../context/MedoraContext';
import { LanguageCode } from '../types';
import { Users, Heart, Pill, Phone, AlertTriangle, UserCheck, Baby, Footprints } from 'lucide-react';

interface FamilyDashboardProps {
  currentLang: LanguageCode;
  familyMembers: any[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToAI?: () => void;
  onOpenCommunicationCenter?: () => void;
  onShowToast?: (msg: string) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToAI,
  onOpenCommunicationCenter,
  onShowToast,
}) => {
  const { patients } = useMedora();
  const family = patients.filter(p => p.familyId === 'FAM-01');
  
  return (
    <div className="space-y-6">
      <div className="bg-teal-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">FAMILY VIEW</span>
            </div>
            <h1 className="text-2xl font-black">Kumar Household (FAM-01)</h1>
            <p className="text-teal-100 font-medium">Family Health Dashboard</p>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-xs bg-red-500 text-white font-bold px-2 py-1 rounded shadow-sm">🟢 FAMILY DEMO VIEW – Fictional household data.</span>
          </div>
        </div>
        <Users className="absolute right-4 -bottom-6 w-32 h-32 text-teal-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {family.map(member => (
          <div key={member.patientId} className={`bg-white p-4 rounded-2xl shadow-sm border ${member.patientId === selectedFamilyId ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${member.avatarBg}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              {member.hasCareGap && <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" title="Needs Attention"></span>}
            </div>
            <h3 className="font-bold text-slate-800">{member.name}</h3>
            <p className="text-xs text-slate-500">{member.age} yrs • {member.primaryCategory}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => onSelectFamilyMember(member.patientId)} className="flex-1 bg-teal-50 text-teal-700 hover:bg-teal-100 py-1.5 rounded-lg text-xs font-bold transition-colors">View Health</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
