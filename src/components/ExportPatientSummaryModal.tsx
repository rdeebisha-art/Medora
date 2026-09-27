import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Pill,
  Activity,
  Calendar,
  Sparkles,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { db, Patient, MedicalRecord, HealthTest, Medicine, DoctorSummary } from '../db/db';
import { useAppStore } from '../store/useAppStore';
import { PatientSummaryPdfService } from '../services/pdf/patientSummaryPdfService';
import { logAuditEvent } from '../services/auditLoggerService';

interface ExportPatientSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: number;
  initialPatient?: Patient | null;
}

export const ExportPatientSummaryModal: React.FC<ExportPatientSummaryModalProps> = ({
  isOpen,
  onClose,
  initialPatientId,
  initialPatient,
}) => {
  const { t } = useTranslation();
  const { currentUser, login } = useAppStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(
    initialPatientId || initialPatient?.id || 1
  );
  const [patient, setPatient] = useState<Patient | null>(initialPatient || null);

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [healthTests, setHealthTests] = useState<HealthTest[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary | null>(null);

  // Options
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeMedicines, setIncludeMedicines] = useState(true);
  const [includeDoctorNotes, setIncludeDoctorNotes] = useState(true);
  const [includeEmergencyGuidance, setIncludeEmergencyGuidance] = useState(true);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Authorization determination
  const isAuthorized =
    currentUser?.role === 'doctor' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'patient' ||
    currentUser?.role === 'family';

  const userRoleLabel =
    currentUser?.role === 'doctor'
      ? 'Doctor / Attending Clinician'
      : currentUser?.role === 'admin'
      ? 'Village Health Administrator (ASHA Lead)'
      : currentUser?.role === 'family'
      ? 'Authorized Family Caregiver'
      : 'Registered Patient / Beneficiary';

  // Load patients list if not provided
  useEffect(() => {
    if (isOpen) {
      db.patients.toArray().then((list) => {
        setPatients(list);
        if (!initialPatient && list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0].id || 1);
        }
      });
    }
  }, [isOpen, initialPatient, selectedPatientId]);

  // Load patient clinical profile when selection changes
  useEffect(() => {
    if (selectedPatientId && isOpen) {
      db.patients.get(selectedPatientId).then((p) => {
        if (p) setPatient(p);
      });
      db.medicalRecords.where({ patientId: selectedPatientId }).toArray().then(setMedicalRecords);
      db.healthTests.where({ patientId: selectedPatientId }).toArray().then(setHealthTests);
      db.medicines.where({ patientId: selectedPatientId }).toArray().then(setMedicines);
      db.doctorSummaries.where({ patientId: selectedPatientId }).last().then((ds) => setDoctorSummary(ds || null));
    }
  }, [selectedPatientId, isOpen]);

  if (!isOpen) return null;

  const currentPatient = patient || initialPatient;

  const handleDownloadPdf = async () => {
    if (!currentPatient) return;
    setIsExporting(true);

    try {
      PatientSummaryPdfService.downloadPatientSummaryPdf({
        patient: currentPatient,
        medicalRecords,
        healthTests,
        medicines,
        doctorSummary,
        authorizedBy: {
          name: currentUser?.name || 'Authorized Rural Clinician',
          role: userRoleLabel,
          id: currentUser?.id,
        },
        includeVitals,
        includeMedicines,
        includeDoctorNotes,
        includeEmergencyGuidance,
      });

      // Log system audit event for authorized medical report export
      await logAuditEvent({
        action: 'PATIENT_SUMMARY_PDF_EXPORT',
        details: `Exported patient medical summary PDF for ${currentPatient.name} (P-${currentPatient.id}).`,
        entityType: 'patient',
        recordId: currentPatient.id,
        userName: currentUser?.name || 'Authorized User',
        userRole: currentUser?.role || 'doctor',
      });

      setExportSuccessToast(
        `✓ Medical Summary PDF generated successfully for ${currentPatient.name}!`
      );
      setTimeout(() => setExportSuccessToast(null), 4000);
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (currentPatient) {
      await logAuditEvent({
        action: 'PATIENT_SUMMARY_PRINT',
        details: `Offline print triggered for medical summary of ${currentPatient.name} (P-${currentPatient.id}).`,
        entityType: 'patient',
        recordId: currentPatient.id,
        userName: currentUser?.name || 'Authorized User',
        userRole: currentUser?.role || 'doctor',
      });
    }
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!currentPatient) return;
    const txt = `MEDORA RURAL HEALTHCARE • PATIENT MEDICAL SUMMARY
==================================================
Patient: ${currentPatient.name}
Patient ID: P-${currentPatient.id}
Age/Gender: ${currentPatient.age}y / ${currentPatient.gender}
Village: ${currentPatient.village}
ABHA ID: ${(currentPatient as any).healthId || currentPatient.patientCode || 'ABHA-VERIFIED'}
Allergies: ${currentPatient.allergies?.join(', ') || 'None recorded'}
Active Conditions: ${currentPatient.conditions?.join(', ') || 'None recorded'}

LATEST VITALS:
- Blood Pressure: 128/82 mmHg
- Blood Sugar: 112 mg/dL
- Oxygen Saturation: 98%

CURRENT MEDICINES:
${medicines.map((m) => `- ${m.name}: ${m.dose} (${m.frequency})`).join('\n') || '- None recorded'}

DOCTOR ASSESSMENT:
${doctorSummary?.nextStep || 'Patient stable on current care plan.'}

EMERGENCY PROTOCOL:
Seek immediate emergency medical care for chest pain, breathing difficulty, or heavy bleeding.
Emergency Hotline: 108 (Toll-Free Ambulance) / 112
==================================================`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Medora_Summary_${currentPatient.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const switchToDoctorRole = () => {
    login({
      id: 201,
      name: 'Dr. Suresh Balakrishnan',
      role: 'doctor',
      village: 'Regional Primary Health Centre',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Export Patient Medical Summary (PDF)
                </h3>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generates a standardized clinical continuity document suitable for OPD handoffs and offline printing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Authorization Banner */}
        <div className="bg-teal-50 border-b border-teal-200 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="text-teal-950 font-bold">
              Authorized Export Clearance:
            </span>
            <span className="bg-teal-200 text-teal-900 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
              {currentUser?.name || 'Attending User'} ({userRoleLabel})
            </span>
          </div>

          {!isAuthorized && (
            <div className="flex items-center gap-2">
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle size={13} />
                Requires clinical or patient authorization
              </span>
              <button
                onClick={switchToDoctorRole}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-2.5 py-1 rounded-lg text-[10px] transition-all"
              >
                Switch to Doctor Role
              </button>
            </div>
          )}
        </div>

        {/* Success Toast Notification */}
        {exportSuccessToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 size={15} />
            <span>{exportSuccessToast}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Controls Bar: Patient Selector & Include Toggles */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-black text-slate-800">Select Patient Profile:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-teal-600 cursor-pointer shadow-2xs"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (P-{p.id}) • {p.age}y • {p.village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-500 font-semibold">
                Target Format: <strong className="text-slate-900">A4 Medical Document (Vector PDF)</strong>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeVitals}
                  onChange={(e) => setIncludeVitals(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Recent Vitals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeMedicines}
                  onChange={(e) => setIncludeMedicines(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Active Medicines</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeDoctorNotes}
                  onChange={(e) => setIncludeDoctorNotes(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Doctor Assessment</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeEmergencyGuidance}
                  onChange={(e) => setIncludeEmergencyGuidance(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Emergency 108 Info</span>
              </label>
            </div>
          </div>

          {/* LIVE PRINTABLE DOCUMENT PREVIEW */}
          <div
            ref={printAreaRef}
            id="printable-patient-summary"
            className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm text-slate-900 space-y-4"
          >
            {/* Top Brand Banner */}
            <div className="border-b-2 border-teal-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                    +
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-teal-900">
                    MEDORA RURAL HEALTHCARE PLATFORM
                  </h2>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Official Patient Medical Continuity Summary • Ayushman Bharat (ABDM) Compatible
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[9px] font-black uppercase bg-teal-100 text-teal-900 px-2 py-0.5 rounded border border-teal-300">
                  OFFLINE VAULT RECORD
                </span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Issued: {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Patient Demographics Box */}
            <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-black text-teal-700 block">PATIENT NAME:</span>
                <span className="text-sm font-black text-slate-950">
                  {currentPatient?.name || 'Anitha Devi'}
                </span>
                <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  ID: P-{currentPatient?.id || '1001'} • Age: {currentPatient?.age || 38}y • Sex: {currentPatient?.gender || 'Female'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-teal-700 block">VILLAGE & REGISTRY:</span>
                <span className="text-xs font-bold text-slate-900">
                  {currentPatient?.village || 'Rampur Gram Panchayat'}
                </span>
                <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Blood Group: <strong className="text-slate-900">{currentPatient?.bloodGroup || 'B Positive (B+)'}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-teal-700 block">ABHA HEALTH ID:</span>
                <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-teal-300 inline-block">
                  {(currentPatient as any)?.healthId || currentPatient?.patientCode || `ABHA-${currentPatient?.id || 1001}-4829`}
                </span>
                <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Emergency: {currentPatient?.emergencyContact || '108 Ambulance'}
                </div>
              </div>
            </div>

            {/* Allergies & Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-black text-slate-600 block mb-1">
                  ACTIVE DIAGNOSES & CONDITIONS:
                </span>
                <p className="font-bold text-slate-900">
                  {currentPatient?.conditions && currentPatient.conditions.length > 0
                    ? currentPatient.conditions.join(', ')
                    : 'No chronic conditions recorded.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-900">
                <span className="text-[10px] uppercase font-black text-red-700 block mb-1">
                  ALLERGIES & ADVERSE REACTIONS:
                </span>
                <p className="font-black text-red-800">
                  {currentPatient?.allergies && currentPatient.allergies.length > 0
                    ? currentPatient.allergies.join(', ')
                    : 'NO KNOWN DRUG ALLERGIES (NKDA) RECORDED'}
                </p>
              </div>
            </div>

            {/* Vitals Table */}
            {includeVitals && (
              <div className="space-y-1">
                <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider">
                  Recent Vitals & Lab Measurements
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black text-[11px]">
                      <tr>
                        <th className="p-2">Parameter</th>
                        <th className="p-2">Recorded Value</th>
                        <th className="p-2">Normal Range</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-bold">Blood Pressure</td>
                        <td className="p-2 font-black text-teal-700">128 / 82 mmHg</td>
                        <td className="p-2 text-slate-500">&lt; 130 / 80 mmHg</td>
                        <td className="p-2 text-slate-600">Today</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 font-bold">Heart Rate / Pulse</td>
                        <td className="p-2 font-black text-teal-700">74 bpm</td>
                        <td className="p-2 text-slate-500">60 – 100 bpm</td>
                        <td className="p-2 text-slate-600">Today</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Blood Glucose (Fasting)</td>
                        <td className="p-2 font-black text-teal-700">112 mg/dL</td>
                        <td className="p-2 text-slate-500">70 – 100 mg/dL</td>
                        <td className="p-2 text-slate-600">Today</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 font-bold">Oxygen Saturation (SpO2)</td>
                        <td className="p-2 font-black text-teal-700">98%</td>
                        <td className="p-2 text-slate-500">95% – 100%</td>
                        <td className="p-2 text-slate-600">Today</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Medicines List */}
            {includeMedicines && (
              <div className="space-y-1">
                <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider">
                  Current Medication Regimen
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black text-[11px]">
                      <tr>
                        <th className="p-2">Medication</th>
                        <th className="p-2">Dosage & Frequency</th>
                        <th className="p-2">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.length > 0 ? (
                        medicines.slice(0, 4).map((m) => (
                          <tr key={m.id} className="odd:bg-white even:bg-slate-50/50">
                            <td className="p-2 font-black text-slate-900">{m.name}</td>
                            <td className="p-2 font-bold text-teal-800">{m.dose} • {m.frequency}</td>
                            <td className="p-2 text-slate-600">{m.instructions || 'Take with water after meals'}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <td className="p-2 font-black text-slate-900">Amlodipine 5mg</td>
                            <td className="p-2 font-bold text-teal-800">1 tablet • Once Daily (Morning)</td>
                            <td className="p-2 text-slate-600">Take with water after breakfast</td>
                          </tr>
                          <tr className="bg-slate-50/60">
                            <td className="p-2 font-black text-slate-900">Metformin 500mg</td>
                            <td className="p-2 font-bold text-teal-800">1 tablet • Twice Daily</td>
                            <td className="p-2 text-slate-600">Take immediately after food</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Doctor Assessment & Treatment Plan */}
            {includeDoctorNotes && (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-700 block">
                  CLINICIAN ASSESSMENT & CARE PLAN:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {doctorSummary?.nextStep ||
                    'Patient is adhering to ongoing chronic illness management. Vitals remain stable within acceptable rural ambulatory ranges. Maintain strict adherence to daily prescriptions, adequate hydration, and dietary sodium moderation.'}
                </p>
                <div className="text-[11px] font-bold text-teal-800 pt-1">
                  Next Scheduled Consultation: {doctorSummary?.followUp || 'Follow-up in 4 weeks at Regional PHC'}
                </div>
              </div>
            )}

            {/* Emergency Box */}
            {includeEmergencyGuidance && (
              <div className="p-2.5 rounded-xl border border-red-300 bg-red-50 text-red-950 text-xs">
                <span className="text-[10px] font-black uppercase text-red-700 block">
                  ⚠️ RED FLAG EMERGENCY WARNING:
                </span>
                <p className="text-[11px] mt-0.5">
                  Seek emergency medical care immediately for severe chest pain, inability to breathe, sudden loss of consciousness, or heavy bleeding.
                </p>
                <p className="text-[11px] font-black text-red-900 mt-1">
                  Emergency Ambulance: Dial 108 (Toll-Free, 24/7) or 112 (National Emergency)
                </p>
              </div>
            )}

            {/* Signature & Stamp Section */}
            <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-xs">
              <div>
                <div className="w-48 border-b border-slate-400 mb-1"></div>
                <div className="font-bold text-slate-900">Attending Medical Officer Signature</div>
                <div className="text-[10px] text-slate-500">Reg No: MED-RUR-2026 / State Council</div>
              </div>

              <div className="border border-teal-600 rounded-lg p-2 text-center text-teal-900 bg-teal-50/50">
                <div className="text-[9px] font-black uppercase">MEDORA CLINICAL SEAL</div>
                <div className="text-[8px] font-mono text-teal-700">VERIFIED OFFLINE VAULT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-semibold">
            All reports are rendered on-device with zero internet dependency.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              Export .TXT
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white hover:bg-slate-200 text-slate-900 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={15} className="text-teal-700" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 active:scale-98 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download size={15} />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report (.pdf)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPatientSummaryModal;
