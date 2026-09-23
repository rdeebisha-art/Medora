import React from 'react';
import { useMedora } from '../context/MedoraContext';
import { UserRole } from '../types';
import {
  User,
  Users,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Eye,
  KeyRound,
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { activeRole, switchRole, patients, families } = useMedora();

  if (!isOpen) return null;

  const roles: {
    role: UserRole;
    title: string;
    persona: string;
    idTag: string;
    description: string;
    permissions: string[];
    restrictions: string[];
    icon: React.ReactNode;
    colorClasses: string;
    targetPatientId?: string;
    targetFamilyId?: string;
  }[] = [
    {
      role: 'patient',
      title: 'Villager / Patient Persona',
      persona: 'Ramesh Kumar',
      idTag: 'Patient ID: P-1001',
      description: 'Personal, isolated health file view. Patients can only view their own vitals, medications, tests, and care continuity.',
      permissions: [
        'View own longitudinal records & vitals',
        'Mark daily medications taken/missed',
        'Receive personalized AI assistant guidance',
        'View personal appointment & referral schedule',
      ],
      restrictions: [
        'Strictly locked from viewing other villagers',
        'Cannot access Village Population Management or admin editing',
      ],
      icon: <User className="w-5 h-5 text-amber-700" />,
      colorClasses: 'border-amber-300 bg-amber-50/60 hover:bg-amber-50',
      targetPatientId: 'P-1001',
      targetFamilyId: 'FAM-01',
    },
    {
      role: 'family',
      title: 'Household / Family Head Persona',
      persona: 'Kumar Household Head',
      idTag: 'Family ID: FAM-01 (4 Members)',
      description: 'Authorized household view. Family head can toggle between registered members in their own household.',
      permissions: [
        'Switch between 4 Kumar family members (Ramesh, Sunita, Aarav, Priya)',
        'Monitor elder BP & maternal pregnancy week',
        'Track pediatric immunization dates',
      ],
      restrictions: [
        'Strictly locked from viewing other village families (FAM-02, FAM-03)',
        'Cannot access Gram Panchayat administrative registries',
      ],
      icon: <Users className="w-5 h-5 text-teal-700" />,
      colorClasses: 'border-teal-300 bg-teal-50/60 hover:bg-teal-50',
      targetPatientId: 'P-1001',
      targetFamilyId: 'FAM-01',
    },
    {
      role: 'doctor',
      title: 'Visiting Clinician / Doctor Persona',
      persona: 'Dr. Rajeshwar Patil',
      idTag: 'Geriatrician & Physician (Civil Hospital)',
      description: 'Medical officer view. Cross-village search by Patient ID, clinical progress notes, anti-redundant test verification, and referrals.',
      permissions: [
        'Search any villager across households by Patient ID or Name',
        'Enter professional clinical notes and handoff summaries',
        'Review recent lab/X-ray scans to prevent redundant tests',
        'Update clinical referral diagnosis and follow-up plans',
      ],
      restrictions: [
        'Focuses on clinical evaluations; does not modify household ration cards',
      ],
      icon: <Stethoscope className="w-5 h-5 text-blue-700" />,
      colorClasses: 'border-blue-300 bg-blue-50/60 hover:bg-blue-50',
      targetPatientId: 'P-1001',
    },
    {
      role: 'admin',
      title: 'Village Health Worker / ANM / ASHA Persona',
      persona: 'Sister Lakshmi Devi (ASHA #4402)',
      idTag: 'Rampur Gram Panchayat Health Desk',
      description: 'Full population management view. Real-time demographic stats, register/remove villagers and households, and epidemic tracking.',
      permissions: [
        'Full Village Demographics Command Center',
        'Register new villagers (auto-assigns P-XXXX and updates population in real-time)',
        'Create new households with ration card mapping',
        'Field vital screening entry and community outreach notes',
        'Archive / unregister villagers with instant population recalculation',
      ],
      restrictions: [
        'Demonstration environment; realistic fictional clinical records only',
      ],
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      colorClasses: 'border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50',
    },
  ];

  const handleSelectRole = (r: typeof roles[0]) => {
    switchRole(r.role, r.targetPatientId, r.targetFamilyId);
    if (onShowToast) {
      onShowToast(`Switched active role to: ${r.title} (${r.persona})`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-500">
                1-Click switch between 4 distinct personas to verify isolation and zero data leakage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-3">
          {roles.map(r => {
            const isActive = activeRole === r.role;

            return (
              <div
                key={r.role}
                onClick={() => handleSelectRole(r)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-200'
                    : r.colorClasses
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
                      {r.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                        <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                          {r.persona}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 font-bold">
                        {r.idTag}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions & Restrictions Pill Grid */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-600" /> Authorized View:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                      {r.permissions.map((perm, idx) => (
                        <li key={idx}>{perm}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-rose-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-600" /> Access Boundary:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                      {r.restrictions.map((restr, idx) => (
                        <li key={idx}>{restr}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Current Active Role: <strong className="text-slate-900 uppercase font-mono">{activeRole}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Close Switcher
          </button>
        </div>
      </div>
    </div>
  );
};
