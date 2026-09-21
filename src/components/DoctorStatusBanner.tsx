import React from 'react';
import { Stethoscope, UserCheck, AlertCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { DoctorAvailabilityStatus } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';

interface Props {
  status: DoctorAvailabilityStatus;
  onStatusChange?: (newStatus: DoctorAvailabilityStatus) => void;
  onSelectDoctor?: (doctorId: string) => void;
}

export const DoctorStatusBanner: React.FC<Props> = ({ status, onStatusChange, onSelectDoctor }) => {
  const primaryDoc = MOCK_DOCTORS.find(d => d.id === 'doc-4') || MOCK_DOCTORS[0]; // Dr. Rajeshwar Patil
  const substituteDoc = MOCK_DOCTORS.find(d => d.id === 'doc-8') || MOCK_DOCTORS[1]; // Dr. Sunita Rao

  const isUnavailable = status === 'IN_SURGERY' || status === 'ON_LEAVE' || status === 'UNAVAILABLE' || status === 'SICK_LEAVE';

  const statusColors: Record<DoctorAvailabilityStatus, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ON_DUTY: 'bg-blue-100 text-blue-800 border-blue-300',
    BUSY: 'bg-amber-100 text-amber-800 border-amber-300',
    IN_SURGERY: 'bg-purple-100 text-purple-800 border-purple-300',
    ON_LEAVE: 'bg-rose-100 text-rose-800 border-rose-300',
    SICK_LEAVE: 'bg-rose-100 text-rose-800 border-rose-300',
    UNAVAILABLE: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-100 text-cyan-800">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Primary Doctor Availability & Substitutes</h3>
            <p className="text-xs text-slate-500">Live roster status for Gram Panchayat duty physician</p>
          </div>
        </div>

        {/* Status selector (for admin/demo testing) */}
        {onStatusChange && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Simulate Status:</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as DoctorAvailabilityStatus)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="AVAILABLE">AVAILABLE (On Duty)</option>
              <option value="BUSY">BUSY (In OPD)</option>
              <option value="IN_SURGERY">IN SURGERY (Emergency OT)</option>
              <option value="ON_LEAVE">ON LEAVE (Annual Leave)</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Primary Doctor Card */}
        <div className={`rounded-2xl p-4 border transition-all ${isUnavailable ? 'bg-slate-50 border-slate-300' : 'bg-emerald-50/60 border-emerald-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={primaryDoc.photoUrl}
                alt={primaryDoc.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">Primary Physician</span>
                <h4 className="font-extrabold text-slate-900 text-sm">{primaryDoc.name}</h4>
                <p className="text-xs text-slate-600">{primaryDoc.specialization} • {primaryDoc.hospitalName}</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusColors[status] || statusColors.AVAILABLE}`}>
              ● {status.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
            <span>OPD: {primaryDoc.opdTimings}</span>
            {onSelectDoctor && (
              <button
                onClick={() => onSelectDoctor(primaryDoc.id)}
                className="text-cyan-700 font-bold hover:underline flex items-center gap-1 text-xs"
              >
                View Profile <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Substitute Doctor Card (Shown prominently if primary is unavailable) */}
        <div className={`rounded-2xl p-4 border transition-all ${isUnavailable ? 'bg-amber-50/80 border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={substituteDoc.photoUrl}
                alt={substituteDoc.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                  {isUnavailable ? '⚡ Qualified Duty Substitute' : 'Backup Duty Physician'}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">{substituteDoc.name}</h4>
                <p className="text-xs text-slate-600">{substituteDoc.specialization} • {substituteDoc.hospitalName}</p>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
              ● AVAILABLE TODAY
            </span>
          </div>

          {isUnavailable ? (
            <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
              ℹ️ {primaryDoc.name} is currently <strong>{status.replace('_', ' ')}</strong>. Consultations automatically routed to {substituteDoc.name}.
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
              Available as secondary referral specialist for Geriatric & Complex cases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
