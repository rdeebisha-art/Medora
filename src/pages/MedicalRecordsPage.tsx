import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Share2,
  Stethoscope,
  Activity,
  Pill,
  ClipboardList,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Heart,
  Droplets,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  User,
} from 'lucide-react';

export type MedicalRecordType = 'consultation' | 'vitals' | 'prescription' | 'report';

const RECORD_TYPES: Array<{
  id: MedicalRecordType;
  label: string;
  icon: string;
  badgeColor: string;
}> = [
  { id: 'consultation', label: 'Consultation Notes', icon: '🩺', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'vitals', label: 'Vitals Logs', icon: '📊', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'prescription', label: 'Prescription History', icon: '💊', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'report', label: 'Diagnostic & Lab Reports', icon: '📄', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
];

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<MedicalRecordType>('consultation');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Modals state
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [sharingRecord, setSharingRecord] = useState<MedicalRecord | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Form state with explicit fields for consultation notes, vitals logs, and prescription history
  const [formType, setFormType] = useState<MedicalRecordType>('consultation');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Consultation fields
  const [consultDoctor, setConsultDoctor] = useState('Dr. Suresh Balakrishnan, MBBS, MD, DM');
  const [consultRegNumber, setConsultRegNumber] = useState('TN-MC-18754');
  const [consultSpecialty, setConsultSpecialty] = useState('Cardiology & General Medicine');
  const [consultFacility, setConsultFacility] = useState('Kodaikanal Government Hospital');
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [consultAssessment, setConsultAssessment] = useState('');
  const [consultAdvice, setConsultAdvice] = useState('');
  const [consultFollowup, setConsultFollowup] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );

  // Vitals logs fields
  const [vitalsBP, setVitalsBP] = useState('120/80');
  const [vitalsSugar, setVitalsSugar] = useState('110');
  const [vitalsSugarContext, setVitalsSugarContext] = useState('Fasting');
  const [vitalsPulse, setVitalsPulse] = useState('74');
  const [vitalsTemp, setVitalsTemp] = useState('98.6');
  const [vitalsSpo2, setVitalsSpo2] = useState('98');
  const [vitalsWeight, setVitalsWeight] = useState('68');
  const [vitalsRecordedBy, setVitalsRecordedBy] = useState('Primary Health Centre Staff Nurse');
  const [vitalsNotes, setVitalsNotes] = useState('');

  // Prescription history fields
  const [prescDoctor, setPrescDoctor] = useState('Dr. Kavitha Rao, MBBS, MS (OBG)');
  const [prescRegNumber, setPrescRegNumber] = useState('TN-MC-44912');
  const [prescDiagnosis, setPrescDiagnosis] = useState('');
  const [prescMedName, setPrescMedName] = useState('');
  const [prescMedDose, setPrescMedDose] = useState('1 tablet');
  const [prescMedTiming, setPrescMedTiming] = useState('Twice daily (08:00 AM, 08:00 PM)');
  const [prescMedDuration, setPrescMedDuration] = useState('30 days');
  const [prescMedInstructions, setPrescMedInstructions] = useState('Take with warm water after meals');
  const [prescNotes, setPrescNotes] = useState('');

  // Lab Report fields
  const [reportTitle, setReportTitle] = useState('');
  const [reportLab, setReportLab] = useState('Kodaikanal Government Hospital Diagnostic Centre');
  const [reportStatus, setReportStatus] = useState<'NORMAL' | 'ABNORMAL' | 'CRITICAL'>('NORMAL');
  const [reportFindings, setReportFindings] = useState('');

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;

    const query = pid
      ? db.medicalRecords.where({ patientId: pid, type: activeType })
      : db.medicalRecords.where({ type: activeType });

    query.toArray().then((items) => {
      // Sort newest first
      const sorted = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(sorted);
    }).catch(() => {
      db.medicalRecords.toArray().then((all) => {
        setRecords(all.filter((r) => r.type === activeType));
      });
    });
  }, [currentUser, activeType, refresh]);

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const str = (
      JSON.stringify(r.data) +
      ' ' +
      (r.notes || '') +
      ' ' +
      r.date +
      ' ' +
      r.type
    ).toLowerCase();
    return str.includes(searchQuery.toLowerCase());
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : 1;

    let recordData: Record<string, unknown> = {};
    let finalNotes = '';

    if (formType === 'consultation') {
      recordData = {
        reportName: `Physician Consultation Notes: ${consultDiagnosis || 'General Clinical Review'}`,
        doctorName: consultDoctor,
        regNumber: consultRegNumber,
        specialty: consultSpecialty,
        facility: consultFacility,
        diagnosis: consultDiagnosis || 'Clinical Assessment Completed',
        assessment: consultAssessment || 'Patient examined, vitals stable.',
        clinicalAdvice: consultAdvice || 'Continue regular medication and maintain lifestyle hydration.',
        followUpDate: consultFollowup,
      };
      finalNotes = consultAdvice || consultAssessment || 'Physician consultation recorded';
    } else if (formType === 'vitals') {
      recordData = {
        reportName: `Vitals Log (${vitalsBP} mmHg, ${vitalsSugar} mg/dL)`,
        bloodPressure: `${vitalsBP} mmHg`,
        pulseRate: `${vitalsPulse} bpm`,
        temperature: `${vitalsTemp} °F`,
        spo2: `${vitalsSpo2} %`,
        weight: `${vitalsWeight} kg`,
        fastingBloodSugar: vitalsSugarContext === 'Fasting' ? `${vitalsSugar} mg/dL` : undefined,
        postPrandialSugar: vitalsSugarContext !== 'Fasting' ? `${vitalsSugar} mg/dL` : undefined,
        sugarContext: vitalsSugarContext,
        recordedBy: vitalsRecordedBy,
      };
      finalNotes = vitalsNotes || `BP: ${vitalsBP}, Glucose: ${vitalsSugar} (${vitalsSugarContext}), Pulse: ${vitalsPulse} bpm`;
    } else if (formType === 'prescription') {
      recordData = {
        reportName: `Prescription: ${prescDiagnosis || prescMedName || 'Medical Prescription Slip'}`,
        doctorName: prescDoctor,
        regNumber: prescRegNumber,
        diagnosis: prescDiagnosis || 'Prescribed Therapy',
        medicationsList: [
          {
            name: prescMedName || 'Prescribed Medication',
            dose: prescMedDose,
            timing: prescMedTiming,
            duration: prescMedDuration,
            instructions: prescMedInstructions,
          },
        ],
      };
      finalNotes = prescNotes || `${prescMedName} ${prescMedDose} - ${prescMedTiming}`;
    } else {
      recordData = {
        reportName: reportTitle.trim() || 'Laboratory Diagnostic Report',
        lab: reportLab,
        status: reportStatus,
        findings: reportFindings,
      };
      finalNotes = reportFindings || 'Diagnostic laboratory report registered';
    }

    await db.medicalRecords.add({
      patientId: pid,
      type: formType,
      date: formDate,
      data: recordData,
      notes: finalNotes,
    });

    // Also log notification alert
    try {
      await db.notifications.add({
        userId: pid,
        userRole: 'patient',
        message: `New ${formType.toUpperCase()} record logged: ${(recordData as any).reportName}`,
        type: formType === 'prescription' ? 'medicine' : 'report',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Ignore
    }

    setShowAdd(false);
    setActiveType(formType);
    setRefresh((r) => r + 1);
  };

  const handleShareToSms = async (rec: MedicalRecord) => {
    const reportTitle = (rec.data as any)?.reportName || rec.type;
    const text = `MEDORA MEDICAL RECORD\nPatient ID: ${rec.patientId}\nType: ${rec.type.toUpperCase()}\nTitle: ${reportTitle}\nDate: ${rec.date}\nNotes: ${rec.notes || 'Recorded in Medora'}\n[Local Demo Outbox]`;

    await db.smsOutbox.add({
      toPhone: '9800001111 (Doctor/Family)',
      message: text,
      type: 'medical_record',
      language: language || 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setShareFeedback('✓ Medical record summary queued in SMS Outbox for doctor/family transmission!');
    setTimeout(() => {
      setShareFeedback(null);
      setSharingRecord(null);
    }, 2500);
  };

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center text-2xl flex-shrink-0">
              📋
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                {t('records.title', 'Medical Records Module')}
              </h1>
              <p className="text-xs text-[#64748B]">
                Consultation Notes, Vitals Logs, Prescription History & Lab Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => {
                setFormType(activeType);
                setShowAdd(true);
              }}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add {activeType === 'consultation' ? 'Consultation Note' : activeType === 'vitals' ? 'Vitals Log' : activeType === 'prescription' ? 'Prescription' : 'Report'}</span>
            </button>
          </div>
        </div>

        {/* 4 Explicit Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECORD_TYPES.map((type) => {
            const isSelected = activeType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all text-left flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{type.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  )}
                </div>
                <span className="font-extrabold text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeType === 'consultation' ? 'consultation notes, doctors, or diagnoses' : activeType === 'vitals' ? 'blood pressure, blood sugar, or pulse logs' : activeType === 'prescription' ? 'medicines, dosages, or instructions' : 'diagnostic reports and parameters'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-2xs"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Records Listing */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-2">
            <div className="text-4xl">
              {activeType === 'consultation' ? '🩺' : activeType === 'vitals' ? '📊' : activeType === 'prescription' ? '💊' : '📄'}
            </div>
            <p className="font-bold text-sm text-slate-700">
              No {RECORD_TYPES.find((t) => t.id === activeType)?.label} found
            </p>
            <p className="text-xs text-slate-500">
              Click the button above to record a new entry for your health profile.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((r) => {
              const data = (r.data || {}) as any;

              return (
                <div
                  key={r.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                >
                  {/* Top Meta Line */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1">
                        <span>{r.type === 'consultation' ? '🩺 Consultation' : r.type === 'vitals' ? '📊 Vitals Log' : r.type === 'prescription' ? '💊 Prescription' : '📄 Report'}</span>
                      </span>
                      {data.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            data.status === 'ABNORMAL' || data.status === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {data.status}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B] font-mono flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{r.date}</span>
                    </span>
                  </div>

                  {/* 1. CONSULTATION NOTES SPECIFIC VIEW */}
                  {r.type === 'consultation' && (
                    <div className="space-y-2.5">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">
                          {data.reportName || 'Physician Consultation Notes'}
                        </h3>
                        <p className="text-xs text-[#2563EB] font-bold mt-0.5">
                          {data.doctorName || 'Consulting Physician'} · {data.specialty || 'General Medicine'}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {data.facility || 'Primary Health Centre'} {data.regNumber ? `· Reg: ${data.regNumber}` : ''}
                        </p>
                      </div>

                      {data.assessment && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                          <span className="font-bold text-slate-800 block">Clinical Assessment & Diagnosis:</span>
                          <p className="text-slate-700 leading-relaxed">{data.assessment}</p>
                        </div>
                      )}

                      {data.clinicalAdvice && (
                        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
                          <span className="font-bold text-blue-900 block">Physician Directives & Advice:</span>
                          <p className="text-blue-800 leading-relaxed">{data.clinicalAdvice}</p>
                        </div>
                      )}

                      {data.followUpDate && (
                        <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                          <Calendar size={13} />
                          <span>Recommended Follow-up Date: {data.followUpDate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. VITALS LOGS SPECIFIC VIEW */}
                  {r.type === 'vitals' && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">
                          {data.reportName || 'Physiological Vitals Record'}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          Recorded by: {data.recordedBy || 'Health Worker'}
                        </p>
                      </div>

                      {/* Vitals Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {data.bloodPressure && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-rose-700 font-bold block">Blood Pressure</span>
                            <span className="font-black text-sm text-rose-900">{data.bloodPressure}</span>
                          </div>
                        )}
                        {(data.fastingBloodSugar || data.postPrandialSugar || data.sugar) && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-purple-700 font-bold block">
                              Blood Glucose ({data.sugarContext || (data.fastingBloodSugar ? 'Fasting' : 'Post-Meal')})
                            </span>
                            <span className="font-black text-sm text-purple-900">
                              {data.fastingBloodSugar || data.postPrandialSugar || data.sugar}
                            </span>
                          </div>
                        )}
                        {data.pulseRate && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-blue-700 font-bold block">Pulse Rate</span>
                            <span className="font-black text-sm text-blue-900">{data.pulseRate}</span>
                          </div>
                        )}
                        {data.temperature && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-amber-700 font-bold block">Temperature</span>
                            <span className="font-black text-sm text-amber-900">{data.temperature}</span>
                          </div>
                        )}
                        {data.spo2 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-emerald-700 font-bold block">SpO2 Saturation</span>
                            <span className="font-black text-sm text-emerald-900">{data.spo2}</span>
                          </div>
                        )}
                        {data.weight && (
                          <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-center">
                            <span className="text-[10px] text-slate-700 font-bold block">Weight</span>
                            <span className="font-black text-sm text-slate-900">{data.weight}</span>
                          </div>
                        )}
                      </div>

                      {r.notes && (
                        <div className="text-xs bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. PRESCRIPTION HISTORY SPECIFIC VIEW */}
                  {r.type === 'prescription' && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">
                          {data.reportName || 'Medical Prescription Record'}
                        </h3>
                        <p className="text-xs text-[#2563EB] font-bold">
                          {data.doctorName || 'Prescribing Physician'} {data.regNumber ? `(Reg: ${data.regNumber})` : ''}
                        </p>
                        {data.diagnosis && (
                          <p className="text-xs text-[#64748B] mt-0.5">
                            Indication: <strong>{data.diagnosis}</strong>
                          </p>
                        )}
                      </div>

                      {/* Prescribed Medications Table */}
                      {data.medicationsList && Array.isArray(data.medicationsList) && (
                        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold">
                              <tr>
                                <th className="px-3 py-2">Medicine & Dosage</th>
                                <th className="px-3 py-2">Timing / Frequency</th>
                                <th className="px-3 py-2">Duration</th>
                                <th className="px-3 py-2">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] bg-white">
                              {data.medicationsList.map((med: any, mIdx: number) => (
                                <tr key={mIdx}>
                                  <td className="px-3 py-2 font-bold text-slate-900">
                                    {med.name} <span className="text-slate-500 font-normal">({med.dose})</span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">{med.timing}</td>
                                  <td className="px-3 py-2 text-slate-600">{med.duration}</td>
                                  <td className="px-3 py-2 text-slate-500 italic">{med.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {r.notes && (
                        <div className="text-xs bg-blue-50 text-blue-900 p-2.5 rounded-xl border border-blue-200">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. DIAGNOSTIC REPORT SPECIFIC VIEW */}
                  {r.type === 'report' && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">
                          {data.reportName || 'Diagnostic Report'}
                        </h3>
                        <p className="text-xs text-[#64748B]">{data.lab || 'Clinical Laboratory'}</p>
                      </div>

                      {data.parameters && Array.isArray(data.parameters) && (
                        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[#475569]">
                              <tr>
                                <th className="px-3 py-2 font-bold">Parameter</th>
                                <th className="px-3 py-2 font-bold">Result</th>
                                <th className="px-3 py-2 font-bold">Ref Range</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] bg-white">
                              {data.parameters.map((p: any, idx: number) => (
                                <tr key={idx} className={p.status !== 'NORMAL' ? 'bg-[#FEF2F2]/40' : ''}>
                                  <td className="px-3 py-2 font-medium text-[#0F172A]">{p.name}</td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`font-bold ${
                                        p.status === 'HIGH'
                                          ? 'text-[#DC2626]'
                                          : p.status === 'LOW'
                                          ? 'text-[#2563EB]'
                                          : 'text-[#0F172A]'
                                      }`}
                                    >
                                      {p.result}
                                    </span>
                                    <span className="text-[10px] text-[#64748B] ml-1">{p.unit}</span>
                                  </td>
                                  <td className="px-3 py-2 text-[#64748B]">{p.ref}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {r.notes && (
                        <div className="text-xs bg-[#FFFBEB] text-[#92400E] p-2.5 rounded-xl border border-[#FDE68A]">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setViewingRecord(r)}
                      className="flex-1 bg-[#EFF6FF] text-[#2563EB] py-2 rounded-xl text-xs font-bold border border-[#2563EB]/30 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText size={14} />
                      <span>View Full Sheet / PDF</span>
                    </button>
                    <button
                      onClick={() => setSharingRecord(r)}
                      className="flex-1 bg-slate-50 text-[#475569] py-2 rounded-xl text-xs font-bold border border-[#E2E8F0] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Share2 size={14} />
                      <span>Share Record</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD RECORD MODAL (WITH EXPLICIT FIELDS FOR CONSULTATIONS, VITALS, PRESC) */}
        {/* ========================================================================= */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {formType === 'consultation' ? '🩺' : formType === 'vitals' ? '📊' : formType === 'prescription' ? '💊' : '📄'}
                  </span>
                  <div>
                    <h2 className="font-black text-base text-[#0F172A]">
                      Add {formType === 'consultation' ? 'Consultation Note' : formType === 'vitals' ? 'Vitals Log' : formType === 'prescription' ? 'Prescription Record' : 'Diagnostic Report'}
                    </h2>
                    <p className="text-[11px] text-slate-500">Record clinical information into patient health profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Record Type Switcher within Modal */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                {RECORD_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormType(t.id)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                      formType === t.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.id === 'consultation' ? 'Consult' : t.id === 'vitals' ? 'Vitals' : t.id === 'prescription' ? 'Prescription' : 'Report'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
                {/* Date Picker */}
                <div>
                  <label className="block font-bold text-[#475569] mb-1">Date of Record</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* 1. CONSULTATION NOTES EXPLICIT FIELDS */}
                {formType === 'consultation' && (
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Consulting Doctor Name</label>
                        <input
                          type="text"
                          value={consultDoctor}
                          onChange={(e) => setConsultDoctor(e.target.value)}
                          placeholder="e.g. Dr. Suresh Balakrishnan, MD"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Medical Reg Number</label>
                        <input
                          type="text"
                          value={consultRegNumber}
                          onChange={(e) => setConsultRegNumber(e.target.value)}
                          placeholder="e.g. TN-MC-18754"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Specialty</label>
                        <input
                          type="text"
                          value={consultSpecialty}
                          onChange={(e) => setConsultSpecialty(e.target.value)}
                          placeholder="e.g. Cardiology, General Medicine"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Hospital / Clinic</label>
                        <input
                          type="text"
                          value={consultFacility}
                          onChange={(e) => setConsultFacility(e.target.value)}
                          placeholder="e.g. Kodaikanal Govt Hospital"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Chief Complaint & Diagnosis</label>
                      <input
                        type="text"
                        value={consultDiagnosis}
                        onChange={(e) => setConsultDiagnosis(e.target.value)}
                        placeholder="e.g. Essential Hypertension Grade 1 with mild exertional fatigue"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Clinical Assessment Notes</label>
                      <textarea
                        value={consultAssessment}
                        onChange={(e) => setConsultAssessment(e.target.value)}
                        rows={2}
                        placeholder="Physical examination observations, heart sounds, chest clear, abdomen soft..."
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Physician Advice & Treatment Directives</label>
                      <textarea
                        value={consultAdvice}
                        onChange={(e) => setConsultAdvice(e.target.value)}
                        rows={2}
                        placeholder="Dietary salt restriction, 30 min daily walking, take prescribed antihypertensive..."
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Next Follow-Up Date</label>
                      <input
                        type="date"
                        value={consultFollowup}
                        onChange={(e) => setConsultFollowup(e.target.value)}
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* 2. VITALS LOGS EXPLICIT FIELDS */}
                {formType === 'vitals' && (
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Blood Pressure (mmHg)</label>
                        <input
                          type="text"
                          value={vitalsBP}
                          onChange={(e) => setVitalsBP(e.target.value)}
                          placeholder="e.g. 120/80"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Pulse Rate (bpm)</label>
                        <input
                          type="number"
                          value={vitalsPulse}
                          onChange={(e) => setVitalsPulse(e.target.value)}
                          placeholder="e.g. 74"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Blood Sugar (mg/dL)</label>
                        <input
                          type="number"
                          value={vitalsSugar}
                          onChange={(e) => setVitalsSugar(e.target.value)}
                          placeholder="e.g. 110"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Sugar Timing</label>
                        <select
                          value={vitalsSugarContext}
                          onChange={(e) => setVitalsSugarContext(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Fasting">Fasting (Before Breakfast)</option>
                          <option value="Post-Prandial">Post-Prandial (2 hrs after meal)</option>
                          <option value="Random">Random Glucose Check</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Temp (°F)</label>
                        <input
                          type="text"
                          value={vitalsTemp}
                          onChange={(e) => setVitalsTemp(e.target.value)}
                          placeholder="98.6"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">SpO2 (%)</label>
                        <input
                          type="number"
                          value={vitalsSpo2}
                          onChange={(e) => setVitalsSpo2(e.target.value)}
                          placeholder="98"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={vitalsWeight}
                          onChange={(e) => setVitalsWeight(e.target.value)}
                          placeholder="68"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Recorded By</label>
                      <input
                        type="text"
                        value={vitalsRecordedBy}
                        onChange={(e) => setVitalsRecordedBy(e.target.value)}
                        placeholder="e.g. Sister Mary, Staff Nurse / ASHA Worker / Patient Self-Log"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. PRESCRIPTION HISTORY EXPLICIT FIELDS */}
                {formType === 'prescription' && (
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Prescribing Doctor</label>
                        <input
                          type="text"
                          value={prescDoctor}
                          onChange={(e) => setPrescDoctor(e.target.value)}
                          placeholder="e.g. Dr. Rajeshwari Patel, MD"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Medical Reg #</label>
                        <input
                          type="text"
                          value={prescRegNumber}
                          onChange={(e) => setPrescRegNumber(e.target.value)}
                          placeholder="e.g. TN-MC-51092"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Diagnosis / Indication</label>
                      <input
                        type="text"
                        value={prescDiagnosis}
                        onChange={(e) => setPrescDiagnosis(e.target.value)}
                        placeholder="e.g. Chronic Bronchitis, Type 2 Diabetes"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Medication Name</label>
                        <input
                          type="text"
                          value={prescMedName}
                          onChange={(e) => setPrescMedName(e.target.value)}
                          placeholder="e.g. Tab. Telmisartan 40mg"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Dose</label>
                        <input
                          type="text"
                          value={prescMedDose}
                          onChange={(e) => setPrescMedDose(e.target.value)}
                          placeholder="e.g. 1 tablet / 2 puffs"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Timing / Frequency</label>
                        <input
                          type="text"
                          value={prescMedTiming}
                          onChange={(e) => setPrescMedTiming(e.target.value)}
                          placeholder="e.g. Once daily (08:00 AM)"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Duration</label>
                        <input
                          type="text"
                          value={prescMedDuration}
                          onChange={(e) => setPrescMedDuration(e.target.value)}
                          placeholder="e.g. 60 days"
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Patient Instructions</label>
                      <input
                        type="text"
                        value={prescMedInstructions}
                        onChange={(e) => setPrescMedInstructions(e.target.value)}
                        placeholder="e.g. Take morning before food with water; rinse mouth after use"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* 4. DIAGNOSTIC REPORT EXPLICIT FIELDS */}
                {formType === 'report' && (
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Report / Test Name</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder="e.g. Complete Blood Count (CBC) with Platelets"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Laboratory / Hospital</label>
                        <input
                          type="text"
                          value={reportLab}
                          onChange={(e) => setReportLab(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#475569] mb-1">Status</label>
                        <select
                          value={reportStatus}
                          onChange={(e) => setReportStatus(e.target.value as any)}
                          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="ABNORMAL">ABNORMAL</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#475569] mb-1">Findings / Summary</label>
                      <textarea
                        value={reportFindings}
                        onChange={(e) => setReportFindings(e.target.value)}
                        rows={3}
                        placeholder="Observed hemoglobin 11.4 g/dL, normal platelet count, no active malaria parasites seen..."
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW FULL RECORD MODAL */}
        {/* ========================================================================= */}
        {viewingRecord && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                    {viewingRecord.type.toUpperCase()} CLINICAL RECORD
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {(viewingRecord.data as any)?.reportName || viewingRecord.type}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Patient & Facility Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono font-bold text-slate-800">MED-REC-#{viewingRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Recorded:</span>
                  <span className="font-mono font-bold">{viewingRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medical Professional / Lab:</span>
                  <span className="font-bold text-slate-800">
                    {(viewingRecord.data as any)?.doctorName || (viewingRecord.data as any)?.lab || (viewingRecord.data as any)?.recordedBy || 'Rural Healthcare Facility'}
                  </span>
                </div>
              </div>

              {/* Consultation Details */}
              {viewingRecord.type === 'consultation' && (
                <div className="space-y-2 text-xs">
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block">Clinical Assessment:</span>
                    <p className="text-blue-800 mt-1">{(viewingRecord.data as any)?.assessment || viewingRecord.notes}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">Doctor's Directives & Advice:</span>
                    <p className="text-slate-700 mt-1">{(viewingRecord.data as any)?.clinicalAdvice || 'Continue prescribed therapy.'}</p>
                  </div>
                </div>
              )}

              {/* Prescription Details */}
              {viewingRecord.type === 'prescription' && (
                <div className="space-y-2 text-xs">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Medicine</th>
                          <th className="p-2.5">Schedule</th>
                          <th className="p-2.5">Duration</th>
                          <th className="p-2.5">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {((viewingRecord.data as any)?.medicationsList || []).map((m: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2.5 font-bold">{m.name} ({m.dose})</td>
                            <td className="p-2.5">{m.timing}</td>
                            <td className="p-2.5">{m.duration}</td>
                            <td className="p-2.5 text-slate-600">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Parameters Breakdown for Reports */}
              {viewingRecord.type === 'report' && (viewingRecord.data as any)?.parameters && (
                <div className="space-y-2">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="px-3 py-2 font-bold">Parameter</th>
                          <th className="px-3 py-2 font-bold">Observed</th>
                          <th className="px-3 py-2 font-bold">Reference</th>
                          <th className="px-3 py-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {((viewingRecord.data as any).parameters as any[]).map((p, i) => (
                          <tr key={i} className={p.status !== 'NORMAL' ? 'bg-red-50/40' : ''}>
                            <td className="px-3 py-2 font-semibold text-slate-900">{p.name}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{p.result} {p.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{p.ref}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  p.status === 'HIGH'
                                    ? 'bg-red-100 text-red-700'
                                    : p.status === 'LOW'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer size={15} />
                  <span>Print Record</span>
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE MODAL */}
        {sharingRecord && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-blue-600" />
                  <h3 className="font-black text-sm text-slate-900">Share Medical Record</h3>
                </div>
                <button
                  onClick={() => setSharingRecord(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {shareFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold">
                  {shareFeedback}
                </div>
              )}

              <p className="text-xs text-slate-600">
                Send this clinical summary to your registered family contact or doctor via Medora's offline SMS dispatch queue:
              </p>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700 space-y-1">
                <div><strong>Record:</strong> {(sharingRecord.data as any)?.reportName || sharingRecord.type}</div>
                <div><strong>Date:</strong> {sharingRecord.date}</div>
                <div><strong>Summary:</strong> {sharingRecord.notes || 'Recorded in Medora'}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSharingRecord(null)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareToSms(sharingRecord)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Send via SMS Outbox
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
