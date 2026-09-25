import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { db, HealthTest, MedicalRecord, Vaccination, Medicine, Appointment } from '../db/db';
import {
  Activity,
  FileText,
  Syringe,
  Pill,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface HealthActivityItem {
  id: string;
  type: 'vital' | 'consultation' | 'report' | 'vaccination' | 'medicine' | 'appointment';
  title: string;
  subtitle: string;
  date: string;
  statusBadge: {
    label: string;
    color: string;
  };
  details?: Record<string, any>;
  linkPath: string;
}

export const RecentHealthActivitySection: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activities, setActivities] = useState<HealthActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'vital' | 'consultation' | 'report' | 'vaccination' | 'medicine'>('all');
  const [selectedActivity, setSelectedActivity] = useState<HealthActivityItem | null>(null);

  useEffect(() => {
    loadRecentActivities();
  }, [currentUser]);

  const loadRecentActivities = async () => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : 1;

    try {
      const items: HealthActivityItem[] = [];

      // 1. Health Tests / Vitals
      const tests = await db.healthTests.where({ patientId: pid }).reverse().limit(10).toArray();
      tests.forEach((t) => {
        let label = t.type.replace('_', ' ').toUpperCase();
        let statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
        let statusLabel = 'Logged';

        if (t.type === 'blood_pressure') {
          label = 'Blood Pressure';
          const sys = parseInt(t.value.split('/')[0], 10);
          if (sys >= 140) {
            statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
            statusLabel = 'Stage 1 HTN';
          } else {
            statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            statusLabel = 'Optimal';
          }
        } else if (t.type === 'blood_sugar') {
          label = 'Blood Glucose';
          const val = parseFloat(t.value);
          if (val > 140) {
            statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
            statusLabel = 'Elevated';
          } else {
            statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            statusLabel = 'In Range';
          }
        }

        items.push({
          id: `test-${t.id}`,
          type: 'vital',
          title: `${label}: ${t.value} ${t.unit}`,
          subtitle: t.notes ? `${t.notes} · Home / Clinic measurement` : 'Recorded in Health Diary',
          date: t.date || new Date().toISOString(),
          statusBadge: { label: statusLabel, color: statusColor },
          details: { ...t },
          linkPath: '/health-tests',
        });
      });

      // 2. Medical Records (Consultations, Reports, Prescriptions)
      const records = await db.medicalRecords.where({ patientId: pid }).reverse().limit(10).toArray();
      records.forEach((r) => {
        const reportData = (r.data || {}) as any;
        if (r.type === 'consultation') {
          items.push({
            id: `rec-c-${r.id}`,
            type: 'consultation',
            title: reportData.reportName || 'Doctor Consultation Note',
            subtitle: `${reportData.doctorName || 'Attending Physician'} · ${reportData.specialty || 'General Care'}`,
            date: r.date,
            statusBadge: { label: 'Consulted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            details: { ...r, ...reportData },
            linkPath: '/records',
          });
        } else if (r.type === 'report') {
          const isAbnormal = reportData.status === 'ABNORMAL';
          items.push({
            id: `rec-r-${r.id}`,
            type: 'report',
            title: reportData.reportName || 'Laboratory Diagnostic Report',
            subtitle: `${reportData.lab || 'Clinical Laboratory'} · ${r.notes || 'Routine diagnostic screen'}`,
            date: r.date,
            statusBadge: {
              label: isAbnormal ? 'Flagged / Review' : 'Verified Normal',
              color: isAbnormal
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            details: { ...r, ...reportData },
            linkPath: '/records',
          });
        } else if (r.type === 'prescription') {
          items.push({
            id: `rec-p-${r.id}`,
            type: 'medicine',
            title: reportData.reportName || 'Medical Prescription Slip',
            subtitle: `${reportData.doctorName || 'Prescribing Doctor'} · ${reportData.diagnosis || 'Clinical Indication'}`,
            date: r.date,
            statusBadge: { label: 'Active Regimen', color: 'bg-teal-50 text-teal-700 border-teal-200' },
            details: { ...r, ...reportData },
            linkPath: '/medicines',
          });
        }
      });

      // 3. Vaccinations
      const vaccs = await db.vaccinations.where({ patientId: pid }).reverse().limit(6).toArray();
      vaccs.forEach((v) => {
        const isGiven = v.status === 'given' || v.status === 'completed';
        items.push({
          id: `vac-${v.id}`,
          type: 'vaccination',
          title: `Vaccine: ${v.vaccineName}`,
          subtitle: isGiven
            ? `Administered by ${v.givenBy || 'Primary Health Centre'} (${v.givenDate || v.dueDate})`
            : `Scheduled under UIP National Schedule for ${v.dueDate}`,
          date: isGiven ? v.givenDate || v.dueDate : v.dueDate,
          statusBadge: {
            label: isGiven ? 'Administered' : 'Due / Upcoming',
            color: isGiven
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-purple-50 text-purple-700 border-purple-200',
          },
          details: { ...v },
          linkPath: '/vaccination',
        });
      });

      // 4. Appointments
      const appts = await db.appointments.where({ patientId: pid }).reverse().limit(5).toArray();
      appts.forEach((a) => {
        items.push({
          id: `apt-${a.id}`,
          type: 'appointment',
          title: `Appointment: ${a.reason}`,
          subtitle: `Scheduled for ${a.date} at Primary Health Centre`,
          date: a.date,
          statusBadge: {
            label: a.status === 'completed' ? 'Completed' : 'Confirmed',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
          },
          details: { ...a },
          linkPath: '/appointments',
        });
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(items);
    } catch (err) {
      console.warn('[Recent Health Activity] Error loading records:', err);
    }
  };

  const filteredItems = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.type === filter;
  });

  const getIcon = (type: HealthActivityItem['type']) => {
    switch (type) {
      case 'vital':
        return <Activity size={17} className="text-blue-600" />;
      case 'consultation':
        return <FileText size={17} className="text-indigo-600" />;
      case 'report':
        return <FileText size={17} className="text-amber-600" />;
      case 'vaccination':
        return <Syringe size={17} className="text-emerald-600" />;
      case 'medicine':
        return <Pill size={17} className="text-teal-600" />;
      case 'appointment':
        return <Calendar size={17} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
            <Activity className="text-teal-600" size={19} />
            <span>Recent Health Activity & Clinical Timeline</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Synchronized timeline of vitals, doctor notes, diagnostic lab tests, vaccines & medication doses
          </p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { k: 'all', l: 'All Activity' },
            { k: 'vital', l: 'Vitals & Tests' },
            { k: 'consultation', l: 'Consultations' },
            { k: 'report', l: 'Lab Reports' },
            { k: 'vaccination', l: 'Vaccines' },
          ].map((tab) => (
            <button
              key={tab.k}
              onClick={() => setFilter(tab.k as any)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                filter === tab.k
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredItems.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {filteredItems.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#0F172A] truncate">{act.title}</p>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${act.statusBadge.color}`}
                    >
                      {act.statusBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{act.subtitle}</p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    <span>
                      {new Date(act.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center">
                <button
                  onClick={() => setSelectedActivity(act)}
                  className="text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Details
                </button>
                <Link
                  to={act.linkPath}
                  className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 p-1.5 rounded-lg transition-colors"
                  title="Open in module"
                >
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No recent health activity matching the selected filter.
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedActivity.statusBadge.color}`}
                >
                  {selectedActivity.statusBadge.label}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                  {selectedActivity.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedActivity.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-500">Record Timestamp:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedActivity.date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-500">Clinical Category:</span>
                <span className="font-bold text-slate-800 uppercase">{selectedActivity.type}</span>
              </div>
              {selectedActivity.details?.notes && (
                <div className="pt-1">
                  <span className="font-bold text-slate-500 block mb-0.5">Clinical Notes:</span>
                  <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    {selectedActivity.details.notes}
                  </p>
                </div>
              )}
              {selectedActivity.details?.assessment && (
                <div className="pt-1">
                  <span className="font-bold text-slate-500 block mb-0.5">Physician Assessment:</span>
                  <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    {selectedActivity.details.assessment}
                  </p>
                </div>
              )}
              {selectedActivity.details?.clinicalAdvice && (
                <div className="pt-1">
                  <span className="font-bold text-slate-500 block mb-0.5">Doctor Advice:</span>
                  <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    {selectedActivity.details.clinicalAdvice}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
              <Link
                to={selectedActivity.linkPath}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Open in Module</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
