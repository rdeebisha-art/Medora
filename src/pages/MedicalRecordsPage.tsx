import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
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
  Paperclip,
  Camera,
  Image as ImageIcon,
  Clock,
  Filter,
} from 'lucide-react';

export type MedicalRecordType =
  | 'diagnosis'
  | 'symptom'
  | 'consultation'
  | 'prescription'
  | 'lab_result'
  | 'vital'
  | 'medical_history'
  | 'allergy'
  | 'procedure'
  | 'hospital_visit'
  | 'other';

export const ALL_RECORD_TYPES: Array<{
  id: MedicalRecordType;
  label: string;
  icon: string;
  badgeColor: string;
}> = [
  { id: 'diagnosis', label: 'Diagnosis', icon: '🩺', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'symptom', label: 'Symptom', icon: '🌡️', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'consultation', label: 'Consultation', icon: '👨‍⚕️', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'prescription', label: 'Prescription', icon: '💊', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'lab_result', label: 'Lab Result', icon: '🔬', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'vital', label: 'Vital', icon: '📊', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'medical_history', label: 'Medical History', icon: '📜', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'allergy', label: 'Allergy', icon: '⚠️', badgeColor: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'procedure', label: 'Procedure', icon: '🩹', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'hospital_visit', label: 'Hospital Visit', icon: '🏥', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'other', label: 'Other', icon: '📋', badgeColor: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<'all' | MedicalRecordType>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Modals state
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [sharingRecord, setSharingRecord] = useState<MedicalRecord | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Comprehensive Add Record Form State (Requirement 5)
  const [formType, setFormType] = useState<MedicalRecordType>('consultation');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [formDoctor, setFormDoctor] = useState('Dr. Suresh Balakrishnan');
  const [formHospital, setFormHospital] = useState('Kodaikanal Government Hospital');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMeasurements, setFormMeasurements] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileData, setAttachedFileData] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check ?add=true and ?search= query params on load
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAdd(true);
    }
    const urlQ = searchParams.get('search') || searchParams.get('q');
    if (urlQ) {
      setSearchQuery(urlQ);
    }
  }, [searchParams]);

  // Load records
  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;

    const query = pid
      ? db.medicalRecords.where('patientId').equals(pid)
      : db.medicalRecords;

    query.toArray().then((items) => {
      // Sort newest first
      const sorted = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(sorted);
    }).catch(() => {
      db.medicalRecords.toArray().then((all) => setRecords(all));
    });
  }, [currentUser, refresh]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFileName(file.name);
    if (!formTitle) {
      setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFileData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : 1;

    const newRecord: Omit<MedicalRecord, 'id'> = {
      patientId: pid,
      type: formType as any,
      date: formDate,
      time: formTime,
      doctor: formDoctor.trim() || undefined,
      hospital: formHospital.trim() || undefined,
      title: formTitle.trim() || `${formType.toUpperCase()} Record`,
      notes: formNotes.trim() || formDescription.trim() || undefined,
      measurements: formMeasurements.trim() || undefined,
      fileData: attachedFileData || undefined,
      data: {
        reportName: formTitle.trim() || `${formType.toUpperCase()} Entry`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        doctor: formDoctor.trim(),
        hospital: formHospital.trim(),
        time: formTime,
        measurements: formMeasurements.trim(),
        attachedFileName: attachedFileName || undefined,
      },
    };

    const id = await db.medicalRecords.add(newRecord as any);

    // Immediate update of state so it appears without page reload
    const createdWithId: MedicalRecord = {
      ...(newRecord as any),
      id: Number(id),
    };
    setRecords((prev) => [createdWithId, ...prev]);

    // Also add to notification log
    try {
      await db.notifications.add({
        userId: pid,
        userRole: 'patient',
        message: `New ${formType.toUpperCase()} record added: ${formTitle || formType}`,
        type: 'report',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Ignore
    }

    // Reset form
    setShowAdd(false);
    setFormTitle('');
    setFormDescription('');
    setFormMeasurements('');
    setFormNotes('');
    setAttachedFileName('');
    setAttachedFileData(null);
    setRefresh((r) => r + 1);

    // Clear add param if present
    if (searchParams.get('add') === 'true') {
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  };

  const handleShareToSms = async (rec: MedicalRecord) => {
    const reportTitle = (rec.data as any)?.reportName || rec.title || rec.type;
    const text = `MEDORA MEDICAL RECORD\nPatient ID: ${rec.patientId}\nType: ${rec.type.toUpperCase()}\nTitle: ${reportTitle}\nDate: ${rec.date} ${rec.time || ''}\nDoctor: ${rec.doctor || (rec.data as any)?.doctor || 'Medora Clinic'}\nNotes: ${rec.notes || 'Recorded in Medora'}\n[SMS Outbox]`;

    await db.smsOutbox.add({
      toPhone: '9800001111 (Doctor/Family)',
      message: text,
      type: 'medical_record',
      language: language || 'en',
      status: 'OFFLINE_OUTBOX' as any,
      createdAt: new Date().toISOString(),
      info: 'Saved to SMS Outbox for later transmission.',
    });

    setShareFeedback('✓ Medical record summary saved in SMS Outbox for transmission!');
    setTimeout(() => {
      setShareFeedback(null);
      setSharingRecord(null);
    }, 2500);
  };

  // Filter records by search query and type
  const filteredRecords = records.filter((r) => {
    const rType = String(r.type);
    const filterStr = String(activeFilter);
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : rType === filterStr ||
          (filterStr === 'vitals' && rType === 'vital') ||
          (filterStr === 'vital' && rType === 'vitals') ||
          (filterStr === 'lab_result' && rType === 'report') ||
          (filterStr === 'report' && rType === 'lab_result');

    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const searchTarget = (
      JSON.stringify(r.data) +
      ' ' +
      (r.notes || '') +
      ' ' +
      (r.title || '') +
      ' ' +
      (r.doctor || '') +
      ' ' +
      (r.hospital || '') +
      ' ' +
      r.date +
      ' ' +
      r.type
    ).toLowerCase();

    return searchTarget.includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Header with [+ Add Record] Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
              📋
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                {t('records.title', 'Medical Records')}
              </h1>
              <p className="text-xs text-[#64748B]">
                Diagnoses, Symptoms, Consultations, Prescriptions, Lab Results, Vitals &amp; Medical History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => setShowAdd(true)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>+ Add Record</span>
            </button>
          </div>
        </div>

        {/* 11 Record Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Records ({records.length})
          </button>
          {ALL_RECORD_TYPES.map((tDef) => {
            const count = records.filter(
              (r) =>
                r.type === tDef.id ||
                (tDef.id === 'vital' && r.type === 'vitals') ||
                (tDef.id === 'lab_result' && r.type === 'report')
            ).length;
            const isSelected = activeFilter === tDef.id;
            return (
              <button
                key={tDef.id}
                onClick={() => setActiveFilter(tDef.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tDef.icon}</span>
                <span>{tDef.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search medical records, diagnoses, symptoms, doctors, hospitals, or measurements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-2xs"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Records Listing */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-2">
            <div className="text-4xl">📋</div>
            <p className="font-bold text-sm text-slate-700">No medical records found</p>
            <p className="text-xs text-slate-500">
              Click &quot;+ Add Record&quot; to log a diagnosis, symptom, consultation, prescription, or lab result.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((r) => {
              const data = (r.data || {}) as any;
              const title = r.title || data.title || data.reportName || r.type;
              const typeConfig = ALL_RECORD_TYPES.find(
                (tDef) =>
                  tDef.id === r.type ||
                  (tDef.id === 'vital' && r.type === 'vitals') ||
                  (tDef.id === 'lab_result' && r.type === 'report')
              ) || ALL_RECORD_TYPES[10];

              return (
                <div
                  key={r.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${typeConfig.badgeColor}`}>
                        <span>{typeConfig.icon}</span>
                        <span>{typeConfig.label}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {r.date} {r.time ? `· ${r.time}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSharingRecord(r)}
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Share via SMS Outbox"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={() => setViewingRecord(r)}
                        className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-bold"
                      >
                        View Full
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-slate-900">{title}</h3>
                    {(r.doctor || data.doctor || data.doctorName) && (
                      <p className="text-xs text-slate-600 font-medium">
                        Doctor: {r.doctor || data.doctor || data.doctorName}{' '}
                        {(r.hospital || data.hospital || data.facility) && (
                          <span className="text-slate-400">· {r.hospital || data.hospital || data.facility}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {(r.measurements || data.measurements) && (
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-700">
                      <strong>Measurements:</strong>{' '}
                      {typeof (r.measurements || data.measurements) === 'string'
                        ? String(r.measurements || data.measurements)
                        : JSON.stringify(r.measurements || data.measurements)}
                    </div>
                  )}

                  {(r.notes || data.description) && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {r.notes || data.description}
                    </p>
                  )}

                  {r.fileData && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold pt-0.5">
                      <Paperclip size={12} />
                      <span>Attachment included</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD MEDICAL RECORD MODAL (Requirement 5) */}
        {/* ========================================================================= */}
        {showAdd && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    +
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Add Medical Record
                  </h2>
                </div>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
                {/* 1. Record Type (11 Types) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Record Type: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-blue-600"
                  >
                    {ALL_RECORD_TYPES.map((tDef) => (
                      <option key={tDef.id} value={tDef.id}>
                        {tDef.icon} {tDef.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date:</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time:</label>
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                {/* 3. Doctor & Hospital/Clinic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Doctor / Clinician:</label>
                    <input
                      type="text"
                      value={formDoctor}
                      onChange={(e) => setFormDoctor(e.target.value)}
                      placeholder="e.g. Dr. Arjun Mehta"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hospital / Clinic:</label>
                    <input
                      type="text"
                      value={formHospital}
                      onChange={(e) => setFormHospital(e.target.value)}
                      placeholder="e.g. Kodaikanal Government Hospital"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* 4. Title */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Title / Subject: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Routine Hypertension Review / Complete Blood Count"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>

                {/* 5. Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description:</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter clinical description, symptoms, or findings..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                {/* 6. Measurements */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Measurements (BP, Sugar, Temp, etc.):</label>
                  <input
                    type="text"
                    value={formMeasurements}
                    onChange={(e) => setFormMeasurements(e.target.value)}
                    placeholder="e.g. BP: 120/80 mmHg, Sugar: 110 mg/dL, Temp: 98.6°F, SpO2: 98%"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                {/* 7. Notes */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notes / Instructions:</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Additional doctor notes or patient care advice..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                {/* 8. Attachments (Upload file, Take/select image) */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 block">Attachments (Optional):</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Paperclip size={14} />
                      <span>Upload File / PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>Take / Select Image</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {attachedFileName && (
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>{attachedFileName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Buttons: [Cancel], [Save Record] */}
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Record Modal */}
        {viewingRecord && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                    {viewingRecord.type.toUpperCase()} CLINICAL RECORD
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {viewingRecord.title || (viewingRecord.data as any)?.reportName || viewingRecord.type}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono font-bold text-slate-800">MED-REC-#{viewingRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Time:</span>
                  <span className="font-mono font-bold">{viewingRecord.date} {viewingRecord.time || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor / Hospital:</span>
                  <span className="font-bold text-slate-800">
                    {viewingRecord.doctor || (viewingRecord.data as any)?.doctorName || 'Rural Healthcare Facility'}
                    {viewingRecord.hospital ? ` · ${viewingRecord.hospital}` : ''}
                  </span>
                </div>
              </div>

              {viewingRecord.measurements && (
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 text-xs">
                  <span className="font-bold text-blue-900 block">Measurements:</span>
                  <p className="font-mono text-blue-950 mt-1">
                    {typeof viewingRecord.measurements === 'string'
                      ? viewingRecord.measurements
                      : JSON.stringify(viewingRecord.measurements)}
                  </p>
                </div>
              )}

              {viewingRecord.notes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">Clinical Notes:</span>
                  <p className="text-slate-700 mt-1 whitespace-pre-wrap">{viewingRecord.notes}</p>
                </div>
              )}

              {viewingRecord.fileData && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-800 block">Attachment Preview:</span>
                  {viewingRecord.fileData.startsWith('data:image') ? (
                    <img
                      src={viewingRecord.fileData}
                      alt="Attachment"
                      className="max-h-60 rounded-lg object-contain mx-auto border"
                    />
                  ) : (
                    <div className="text-slate-600 font-mono">Attachment file attached.</div>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print Record</span>
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
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
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                Send this clinical summary to your registered family contact or doctor via Medora&apos;s offline SMS dispatch queue:
              </p>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700 space-y-1">
                <div><strong>Record:</strong> {sharingRecord.title || sharingRecord.type}</div>
                <div><strong>Date:</strong> {sharingRecord.date}</div>
                <div><strong>Summary:</strong> {sharingRecord.notes || 'Recorded in Medora'}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSharingRecord(null)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareToSms(sharingRecord)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer"
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
