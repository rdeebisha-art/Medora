import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Medicine, HealthTest, Vaccination, Appointment } from '../db/db';
import Layout from '../components/Layout';
import HealthScoreCard from '../components/HealthScoreCard';
import CareGapAlert from '../components/CareGapAlert';
import MedicineCard from '../components/MedicineCard';
import DemoDataBadge from '../components/DemoDataBadge';
import { HealthTrendsChart } from '../components/HealthTrendsChart';
import {
  Activity,
  Droplets,
  Scale,
  Thermometer,
  Heart,
  Plus,
  History,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
} from 'lucide-react';

export type VitalType = 'blood_sugar' | 'blood_pressure' | 'weight' | 'temperature' | 'pulse';

export interface VitalConfig {
  key: VitalType;
  label: string;
  unit: string;
  normalRange: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const VITAL_CONFIGS: Record<VitalType, VitalConfig> = {
  blood_sugar: {
    key: 'blood_sugar',
    label: 'Blood Sugar',
    unit: 'mg/dL',
    normalRange: '70–140 mg/dL',
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Droplets,
    description: 'Fasting: 70–99 mg/dL · Post-meal: <140 mg/dL',
  },
  blood_pressure: {
    key: 'blood_pressure',
    label: 'Blood Pressure',
    unit: 'mmHg',
    normalRange: '90/60–120/80 mmHg',
    color: '#0F766E',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: Activity,
    description: 'Normal systolic <120, diastolic <80',
  },
  weight: {
    key: 'weight',
    label: 'Weight',
    unit: 'kg',
    normalRange: 'Healthy BMI 18.5–24.9',
    color: '#2563EB',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Scale,
    description: 'Body mass tracking for nutrition & pregnancy',
  },
  temperature: {
    key: 'temperature',
    label: 'Temperature',
    unit: '°F',
    normalRange: '97.8–99.0 °F',
    color: '#7C3AED',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Thermometer,
    description: 'Normal 98.6 °F · Fever alert >100.4 °F',
  },
  pulse: {
    key: 'pulse',
    label: 'Pulse Rate',
    unit: 'bpm',
    normalRange: '60–100 bpm',
    color: '#E11D48',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: Heart,
    description: 'Resting heart rate in beats per minute',
  },
};

export function getVitalClassification(type: VitalType, value: string): { label: string; tone: 'green' | 'amber' | 'red' | 'blue' } {
  if (!value) return { label: 'No data', tone: 'blue' };

  if (type === 'blood_sugar') {
    const num = parseFloat(value);
    if (isNaN(num)) return { label: 'Logged', tone: 'blue' };
    if (num < 70) return { label: 'Low (<70)', tone: 'amber' };
    if (num <= 100) return { label: 'Normal Fasting', tone: 'green' };
    if (num <= 140) return { label: 'Normal Post-Meal', tone: 'green' };
    if (num <= 199) return { label: 'Elevated', tone: 'amber' };
    return { label: 'High (≥200)', tone: 'red' };
  }

  if (type === 'blood_pressure') {
    const parts = value.split('/');
    if (parts.length === 2) {
      const sys = parseInt(parts[0], 10);
      const dia = parseInt(parts[1], 10);
      if (!isNaN(sys) && !isNaN(dia)) {
        if (sys < 90 || dia < 60) return { label: 'Low BP', tone: 'amber' };
        if (sys < 120 && dia < 80) return { label: 'Normal BP', tone: 'green' };
        if (sys <= 129 && dia < 80) return { label: 'Elevated BP', tone: 'amber' };
        if (sys <= 139 || dia <= 89) return { label: 'Stage 1 HTN', tone: 'amber' };
        if (sys >= 180 || dia >= 120) return { label: 'Hypertensive Crisis', tone: 'red' };
        return { label: 'Stage 2 HTN', tone: 'red' };
      }
    }
    return { label: 'Recorded', tone: 'blue' };
  }

  if (type === 'temperature') {
    const num = parseFloat(value);
    if (isNaN(num)) return { label: 'Logged', tone: 'blue' };
    if (num < 97.0) return { label: 'Low Temp', tone: 'amber' };
    if (num <= 99.0) return { label: 'Normal (Afebrile)', tone: 'green' };
    if (num <= 100.4) return { label: 'Low-Grade Fever', tone: 'amber' };
    return { label: 'High Fever (>100.4)', tone: 'red' };
  }

  if (type === 'pulse') {
    const num = parseFloat(value);
    if (isNaN(num)) return { label: 'Logged', tone: 'blue' };
    if (num < 60) return { label: 'Bradycardia (<60)', tone: 'amber' };
    if (num <= 100) return { label: 'Normal Rhythm', tone: 'green' };
    return { label: 'Tachycardia (>100)', tone: 'red' };
  }

  if (type === 'weight') {
    const num = parseFloat(value);
    if (isNaN(num)) return { label: 'Logged', tone: 'blue' };
    return { label: 'Tracked', tone: 'green' };
  }

  return { label: 'Recorded', tone: 'green' };
}

export default function MyHealthPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allVitals, setAllVitals] = useState<HealthTest[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refresh, setRefresh] = useState(0);

  // Health Tracking Modals State
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [activeLogType, setActiveLogType] = useState<VitalType>('blood_sugar');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyType, setHistoryType] = useState<VitalType>('blood_sugar');

  // Log Form State
  const [formValue, setFormValue] = useState<string>('');
  const [formBpSys, setFormBpSys] = useState<string>('120');
  const [formBpDia, setFormBpDia] = useState<string>('80');
  const [formContext, setFormContext] = useState<string>('Fasting');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [formNotes, setFormNotes] = useState<string>('');
  const [savingVital, setSavingVital] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'patient') return;
    db.patients.get(currentUser.id).then((p) => setPatient(p || null));
    db.medicines.where({ patientId: currentUser.id, status: 'active' }).toArray().then(setMedicines);
    db.healthTests.where('patientId').equals(currentUser.id).toArray().then(setAllVitals);
    db.vaccinations.where('patientId').equals(currentUser.id).toArray().then(setVaccinations);
    db.appointments.where({ patientId: currentUser.id }).toArray().then(setAppointments);
  }, [currentUser, refresh]);

  // Compute latest reading for each of the 5 requested vitals
  const latestVitalsMap = useMemo(() => {
    const map: Record<VitalType, HealthTest | null> = {
      blood_sugar: null,
      blood_pressure: null,
      weight: null,
      temperature: null,
      pulse: null,
    };

    const keys: VitalType[] = ['blood_sugar', 'blood_pressure', 'weight', 'temperature', 'pulse'];
    for (const k of keys) {
      const matching = allVitals
        .filter((v) => v.type === k)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (matching.length > 0) {
        map[k] = matching[0];
      }
    }
    return map;
  }, [allVitals]);

  const score = (() => {
    let s = 60;
    if (vaccinations.filter((v) => v.status === 'given').length >= 3) s += 10;
    if (medicines.filter((m) => (m.missedCount || 0) === 0).length > 0) s += 10;
    if (appointments.some((a) => a.status === 'scheduled')) s += 5;
    if (allVitals.length > 0) s += 5;
    return Math.min(100, s);
  })();

  const careGaps = [
    ...vaccinations
      .filter((v) => v.status === 'due' || v.status === 'overdue')
      .map((v) => ({
        type: 'vaccination' as const,
        message: `${v.vaccineName} – ${
          v.status === 'overdue' ? t('vaccination.overdue') : t('vaccination.due')
        }`,
        link: '/vaccination',
      })),
    ...medicines
      .filter((m) => (m.missedCount || 0) > 0)
      .map((m) => ({
        type: 'medicine' as const,
        message: `${m.name} – ${m.missedCount} dose(s) missed`,
        link: '/medicines',
      })),
  ];

  const openLogModal = (type: VitalType) => {
    setActiveLogType(type);
    setFormDate(new Date().toISOString().slice(0, 16));
    setFormNotes('');
    if (type === 'blood_pressure') {
      const latest = latestVitalsMap.blood_pressure;
      if (latest && latest.value.includes('/')) {
        const [s, d] = latest.value.split('/');
        setFormBpSys(s);
        setFormBpDia(d);
      } else {
        setFormBpSys('120');
        setFormBpDia('80');
      }
    } else if (type === 'blood_sugar') {
      setFormValue(latestVitalsMap.blood_sugar?.value || '105');
      setFormContext('Fasting');
    } else if (type === 'weight') {
      setFormValue(latestVitalsMap.weight?.value || '65');
    } else if (type === 'temperature') {
      setFormValue(latestVitalsMap.temperature?.value || '98.6');
    } else if (type === 'pulse') {
      setFormValue(latestVitalsMap.pulse?.value || '72');
    }
    setShowLogModal(true);
  };

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setSavingVital(true);

    try {
      let finalValue = formValue.trim();
      let extraNotes = formNotes.trim();

      if (activeLogType === 'blood_pressure') {
        finalValue = `${formBpSys.trim() || '120'}/${formBpDia.trim() || '80'}`;
      } else if (activeLogType === 'blood_sugar') {
        if (formContext) {
          extraNotes = extraNotes ? `${formContext} · ${extraNotes}` : formContext;
        }
      }

      const cfg = VITAL_CONFIGS[activeLogType];

      // 1. Add to Health Tests
      await db.healthTests.add({
        patientId: currentUser.id,
        type: activeLogType,
        value: finalValue,
        unit: cfg.unit,
        date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
        notes: extraNotes || undefined,
      });

      // 2. Add Notification Log for recent activity tracking
      await db.notifications.add({
        userId: currentUser.id,
        userRole: 'patient',
        message: `${cfg.label} reading logged: ${finalValue} ${cfg.unit}${
          extraNotes ? ` (${extraNotes})` : ''
        }`,
        type: 'general',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      setShowLogModal(false);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error('Failed to save health vital', err);
    } finally {
      setSavingVital(false);
    }
  };

  const openHistoryModal = (type: VitalType) => {
    setHistoryType(type);
    setShowHistoryModal(true);
  };

  const handleDeleteVital = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Delete this health reading?')) {
      await db.healthTests.delete(id);
      setRefresh((r) => r + 1);
    }
  };

  const historyList = useMemo(() => {
    return allVitals
      .filter((v) => v.type === historyType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allVitals, historyType]);

  if (currentUser?.role !== 'patient') {
    return (
      <Layout>
        <div className="p-6 text-center text-gray-500">
          <div className="text-4xl mb-2">👤</div>
          <p>This section is for patient accounts. Please log in as a patient.</p>
          <Link
            to="/login"
            className="mt-3 inline-block bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            Switch Account
          </Link>
        </div>
      </Layout>
    );
  }

  const requestedVitalKeys: VitalType[] = [
    'blood_sugar',
    'blood_pressure',
    'weight',
    'temperature',
    'pulse',
  ];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0F766E] flex items-center gap-2">
              <span>🩺</span>
              <span>{t('health.myHealth')}</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Personalized health records &amp; vitals tracking
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Patient Profile Card */}
        {patient && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="bg-[#0F766E] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                {patient.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-[#0F172A]">{patient.name}</div>
                <div className="text-xs text-[#475569]">
                  {patient.age} {t('common.years')} · {t(`common.${patient.gender}`)} · {patient.village}
                </div>
                <div className="text-xs text-[#0F766E] font-bold mt-0.5">
                  {patient.bloodGroup && `🩸 ${patient.bloodGroup} · `}
                  {patient.isPregnant && `🤰 ${patient.pregnancyWeeks}w pregnant · `}
                  {patient.isElderly && '👴 Senior Citizen · '}
                  {patient.isChild && '👶 Child'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Score */}
        <HealthScoreCard score={score} />

        {/* ========================================================================= */}
        {/* 5 REQUESTED HEALTH TRACKING FEATURES SUITE */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-teal-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0F766E]" />
                <span>5 Core Health Tracking Vitals</span>
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Blood Sugar, Blood Pressure, Weight, Temperature &amp; Pulse
              </p>
            </div>
            <button
              type="button"
              onClick={() => openLogModal('blood_sugar')}
              className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Reading</span>
            </button>
          </div>

          {/* 5 Vitals Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {requestedVitalKeys.map((k) => {
              const cfg = VITAL_CONFIGS[k];
              const Icon = cfg.icon;
              const latest = latestVitalsMap[k];
              const classification = latest
                ? getVitalClassification(k, latest.value)
                : { label: 'Not Logged', tone: 'blue' as const };

              const badgeColor =
                classification.tone === 'green'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : classification.tone === 'amber'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : classification.tone === 'red'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300';

              return (
                <div
                  key={k}
                  className={`rounded-2xl p-3 border transition-all ${cfg.bgColor} ${cfg.borderColor} shadow-2xs hover:shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="p-1.5 rounded-xl bg-white shadow-2xs"
                        style={{ color: cfg.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="font-extrabold text-xs text-slate-900">{cfg.label}</h3>
                        <span className="text-[10px] text-slate-500">{cfg.description}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeColor}`}
                    >
                      {classification.label}
                    </span>
                  </div>

                  {/* Value Presentation */}
                  <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-200/50">
                    <div>
                      {latest ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-xl text-slate-900">{latest.value}</span>
                          <span className="text-xs font-semibold text-slate-500">{latest.unit}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No entry yet</span>
                      )}
                      {latest && (
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{latest.date ? latest.date.slice(0, 10) : 'Today'}</span>
                          {latest.notes && <span className="truncate max-w-[120px]">· {latest.notes}</span>}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openHistoryModal(k)}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1"
                        title="View Historical Readings"
                      >
                        <History className="w-3 h-3 text-slate-500" />
                        <span>History</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openLogModal(k)}
                        className="text-[11px] font-bold text-white px-2 py-1 rounded-lg shadow-2xs flex items-center gap-1"
                        style={{ backgroundColor: cfg.color }}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditions & Allergies */}
        {patient && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-2xl p-3.5 shadow-2xs">
              <h3 className="font-bold text-[#DC2626] text-xs mb-2">⚠️ {t('health.conditions')}</h3>
              {patient.conditions?.length ? (
                patient.conditions.map((c, i) => (
                  <div key={i} className="text-xs font-medium text-[#0F172A]">
                    • {c}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#64748B]">{t('health.noConditions')}</div>
              )}
            </div>
            <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-3.5 shadow-2xs">
              <h3 className="font-bold text-[#D97706] text-xs mb-2">🚫 {t('health.allergies')}</h3>
              {patient.allergies?.length ? (
                patient.allergies.map((a, i) => (
                  <div key={i} className="text-xs font-medium text-[#0F172A]">
                    • {a}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#64748B]">{t('health.noAllergies')}</div>
              )}
            </div>
          </div>
        )}

        {/* Care Gaps */}
        {careGaps.length > 0 && (
          <div>
            <h2 className="font-extrabold text-sm text-[#0F172A] mb-2">⚠️ {t('health.careGaps')}</h2>
            <CareGapAlert gaps={careGaps} />
          </div>
        )}

        {/* Health Trends (30 Days with all 5 metrics) */}
        <HealthTrendsChart tests={allVitals} />

        {/* Medicines */}
        {medicines.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-sm text-[#0F172A]">💊 {t('health.medicines')}</h2>
              <Link to="/medicines" className="text-xs text-[#16A34A] font-bold hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="space-y-3">
              {medicines.slice(0, 2).map((m) => (
                <MedicineCard key={m.id} medicine={m} onUpdate={() => setRefresh((r) => r + 1)} />
              ))}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {vaccinations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-sm text-[#0F172A]">💉 {t('health.vaccinations')}</h2>
              <Link to="/vaccination" className="text-xs text-[#16A34A] font-bold hover:underline">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="space-y-2">
              {vaccinations.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                    v.status === 'given'
                      ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]'
                      : v.status === 'overdue'
                      ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]'
                      : 'bg-[#FFFBEB] border-[#D97706]/30 text-[#D97706]'
                  }`}
                >
                  <span className="text-[#0F172A]">{v.vaccineName}</span>
                  <span className="font-bold">
                    {v.status === 'given'
                      ? '✅ Given'
                      : v.status === 'overdue'
                      ? '⚠️ Overdue'
                      : '📅 Due'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-sm text-[#0F172A]">
              📅 {t('dashboard.upcomingAppts', 'Upcoming Appointments')}
            </h2>
            <Link to="/appointments" className="text-xs text-[#0F766E] font-bold hover:underline">
              {t('appointments.viewAll', 'Manage All →')}
            </Link>
          </div>
          {appointments.filter((a) => a.status === 'scheduled').length > 0 ? (
            appointments
              .filter((a) => a.status === 'scheduled')
              .map((a) => (
                <div
                  key={a.id}
                  className="bg-[#FFF7ED] border border-[#EA580C]/30 rounded-xl p-3 text-xs mb-2 last:mb-0"
                >
                  <div className="font-bold text-[#EA580C]">{a.reason}</div>
                  <div className="text-[#475569] mt-0.5 font-mono">{a.date}</div>
                  {a.notes && <div className="text-[#64748B] text-[11px] mt-1">{a.notes}</div>}
                </div>
              ))
          ) : (
            <div className="text-center py-3 text-xs text-slate-500">
              <span>No upcoming appointments. </span>
              <Link to="/appointments" className="text-[#0F766E] font-bold underline">
                Book with a doctor
              </Link>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          <Link
            to="/ai"
            className="bg-[#7C3AED] hover:bg-purple-700 text-white rounded-2xl p-3 text-center font-bold text-xs shadow-xs transition-colors"
          >
            🤖 Ask Medora AI
          </Link>
          <Link
            to="/doctor-summary"
            className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl p-3 text-center font-bold text-xs shadow-xs transition-colors"
          >
            📄 Doctor Summary
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOG VITAL MODAL (SAVES TO INDEXEDDB) */}
      {/* ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-400" />
                  <span>Log Health Vital Reading</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Instantly saved to your local offline medical profile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="p-4 space-y-3.5">
              {/* Vital Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Health Feature:
                </label>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
                  {requestedVitalKeys.map((vk) => {
                    const cfg = VITAL_CONFIGS[vk];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={vk}
                        type="button"
                        onClick={() => openLogModal(vk)}
                        className={`p-2 rounded-xl text-center border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                          activeLogType === vk
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-teal-400'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate w-full">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type-Specific Inputs */}
              {activeLogType === 'blood_pressure' ? (
                <div className="space-y-2 bg-teal-50/60 border border-teal-100 rounded-2xl p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-900">Blood Pressure (mmHg):</span>
                    <span className="text-[10px] text-teal-700">Target &lt;120/80</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Systolic (Upper)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="260"
                        value={formBpSys}
                        onChange={(e) => setFormBpSys(e.target.value)}
                        placeholder="120"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Diastolic (Lower)
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="160"
                        value={formBpDia}
                        onChange={(e) => setFormBpDia(e.target.value)}
                        placeholder="80"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-teal-800 flex items-center justify-between pt-1">
                    <span>Reading: {formBpSys || '—'}/{formBpDia || '—'} mmHg</span>
                    <span>
                      Status: {getVitalClassification('blood_pressure', `${formBpSys}/${formBpDia}`).label}
                    </span>
                  </div>
                </div>
              ) : activeLogType === 'blood_sugar' ? (
                <div className="space-y-2 bg-amber-50/60 border border-amber-100 rounded-2xl p-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Glucose Value (mg/dL):
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="20"
                      max="600"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="e.g. 105"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Test Context / Timing:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {['Fasting', 'Post-Breakfast', 'Post-Lunch', 'Random'].map((ctx) => (
                        <button
                          key={ctx}
                          type="button"
                          onClick={() => setFormContext(ctx)}
                          className={`py-1.5 px-2 rounded-lg font-bold border text-left transition-all ${
                            formContext === ctx
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {ctx}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeLogType === 'weight' ? (
                <div className="space-y-2 bg-blue-50/60 border border-blue-100 rounded-2xl p-3">
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Weight Value (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="300"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. 68.5"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[10px] text-blue-700">
                    Enter weight in kilograms. Regular weight tracking helps monitor fluid retention, pregnancy progress, and metabolic health.
                  </p>
                </div>
              ) : activeLogType === 'temperature' ? (
                <div className="space-y-2 bg-purple-50/60 border border-purple-100 rounded-2xl p-3">
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Body Temperature (°F):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="110"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. 98.6"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['98.4', '98.6', '99.5', '100.4', '101.5'].map((tVal) => (
                      <button
                        key={tVal}
                        type="button"
                        onClick={() => setFormValue(tVal)}
                        className="text-[10px] bg-white border border-purple-200 text-purple-800 font-bold px-2 py-1 rounded-md hover:bg-purple-100"
                      >
                        {tVal} °F
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-rose-50/60 border border-rose-100 rounded-2xl p-3">
                  <label className="block text-xs font-bold text-rose-900 mb-1">
                    Pulse / Heart Rate (bpm):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="30"
                    max="220"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. 72"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['64', '72', '80', '92'].map((pVal) => (
                      <button
                        key={pVal}
                        type="button"
                        onClick={() => setFormValue(pVal)}
                        className="text-[10px] bg-white border border-rose-200 text-rose-800 font-bold px-2 py-1 rounded-md hover:bg-rose-100"
                      >
                        {pVal} bpm
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date &amp; Time:</label>
                <input
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Clinical Notes:
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. After 30-min walk, before evening medication, resting"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVital}
                  className="flex-1 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white font-black rounded-xl text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {savingVital ? 'Saving...' : 'Save to Health Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETRIEVABLE HEALTH HISTORY DRAWER / MODAL */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" />
                  <span>{VITAL_CONFIGS[historyType].label} Historical Readings</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Retrieved from your local IndexedDB health profile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter Tabs inside History */}
            <div className="p-2 bg-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200">
              {requestedVitalKeys.map((vk) => (
                <button
                  key={vk}
                  type="button"
                  onClick={() => setHistoryType(vk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    historyType === vk
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {VITAL_CONFIGS[vk].label}
                </button>
              ))}
            </div>

            {/* Readings List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {historyList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <p>No historical {VITAL_CONFIGS[historyType].label} readings recorded yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHistoryModal(false);
                      openLogModal(historyType);
                    }}
                    className="mt-2 text-teal-700 font-bold underline"
                  >
                    + Record your first reading now
                  </button>
                </div>
              ) : (
                historyList.map((item) => {
                  const classification = getVitalClassification(historyType, item.value);
                  const badgeColor =
                    classification.tone === 'green'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : classification.tone === 'amber'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : classification.tone === 'red'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300';

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-base text-slate-900">{item.value}</span>
                          <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                          >
                            {classification.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{item.date ? item.date.replace('T', ' ').slice(0, 16) : 'Recorded'}</span>
                          {item.notes && <span className="text-slate-700 font-medium">· {item.notes}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteVital(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete reading"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">{historyList.length} readings retrieved</span>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  openLogModal(historyType);
                }}
                className="bg-[#0F766E] text-white font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Reading</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
