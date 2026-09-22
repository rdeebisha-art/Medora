import React from 'react';
import { useMedora } from '../context/MedoraContext';
import { LanguageCode, Doctor, Hospital, Referral, HealthSummaryReport } from '../types';
import { Stethoscope, Users, FileText, MessageSquare, AlertTriangle, ClipboardList, Phone, CheckCircle2 } from 'lucide-react';

interface DoctorDashboardProps {
  currentLang: LanguageCode;
  onNavigateToHandoff?: () => void;
  onNavigateToAI?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenCommunicationCenter?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentLang,
  onNavigateToHandoff,
  onNavigateToAI,
  onShowToast,
  onOpenCommunicationCenter,
}) => {
  const { patients, activeRole } = useMedora();
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">DOCTOR VIEW</span>
            </div>
            <h1 className="text-2xl font-black">Dr. Rajeshwar Patil</h1>
            <p className="text-blue-100 font-medium">MBBS, MD Geriatric Medicine • Civil Hospital</p>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-xs bg-red-500 text-white font-bold px-2 py-1 rounded shadow-sm">🔵 DOCTOR DEMO VIEW – Fictional demonstration data. Not connected to a real medical system.</span>
          </div>
        </div>
        <Stethoscope className="absolute right-4 -bottom-6 w-32 h-32 text-blue-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> My Assigned Patients
            </h2>
          </div>
          <div className="space-y-3">
            {patients.slice(0, 3).map(p => (
              <div key={p.patientId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-sm">{p.name} <span className="text-xs font-normal text-slate-500">({p.age}y, {p.gender})</span></div>
                  <div className="text-xs text-slate-600">{p.chronicConditions[0] || 'Routine monitoring'}</div>
                </div>
                {p.hasCareGap && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded">URGENT</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Pending Medical Requests
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm">
              <span className="font-bold text-amber-800">Ramesh Kumar (P-1001)</span>
              <p className="text-amber-700 text-xs mt-1">Hypertension Follow-Up & Blood Pressure Spike (158/96 mmHg)</p>
            </div>
            <button onClick={onNavigateToHandoff} className="w-full mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-2 rounded-xl text-sm transition-colors">
              View All Doctor Handoffs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
