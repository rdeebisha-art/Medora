import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';
import {
  FileText, Upload, Camera, CheckCircle2, AlertTriangle, Sparkles,
  Stethoscope, ArrowRight, Loader2, Save, User
} from 'lucide-react';

const REPORT_TYPES = [
  'Complete Blood Count (CBC)',
  'Fasting Blood Sugar / HbA1c',
  'Lipid Profile',
  'Thyroid Profile (TFT)',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Ultrasound Report',
  'Prescription',
  'Other Diagnostic Report'
];

export default function ReportScannerPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({
    type: REPORT_TYPES[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    status?: string;
    patientName?: string;
    testName?: string;
    date?: string;
    hospital?: string;
    parameters?: Array<{ name: string; result: string; unit: string; referenceRange: string; status: string }>;
    abnormalFlags?: string[];
    statedDiagnosis?: string;
    medicines?: string[];
    measurements?: string[];
    message?: string;
  } | null>(null);

  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.patients.toArray().then((list) => {
      setPatients(list);
      if (list.length > 0) {
        const defaultId = currentUser?.role === 'patient' && currentUser.id ? currentUser.id : list[0].id || 1;
        setSelectedPatientId(defaultId);
      }
    });
  }, [currentUser]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSaved(false);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      runOcrExtraction(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const runOcrExtraction = async (reportDataUrl: string, name: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analysis/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: reportDataUrl,
          fileName: name,
          reportType: form.type,
          patientId: selectedPatientId,
        }),
      });

      const data = await res.json();
      setExtractedData(data);
      if (data.statedDiagnosis && !form.notes) {
        setForm((prev) => ({ ...prev, notes: data.statedDiagnosis }));
      }
    } catch {
      setExtractedData({
        status: 'UNRELIABLE',
        message: 'Some text could not be reliably read. Please verify the original report.',
        parameters: [],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;

    try {
      const now = new Date().toISOString();
      const docId = `DOC-${Date.now()}`;

      // 1. Save to uploadedDocuments
      await db.uploadedDocuments.add({
        documentId: docId,
        patientId: selectedPatientId,
        documentType: 'report',
        fileName: fileName || form.type,
        mimeType: preview?.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        fileSize: preview ? preview.length : 0,
        uploadedAt: now,
        source: 'PATIENT_UPLOAD',
        fileData: preview || undefined,
        extractedText: extractedData?.statedDiagnosis || form.notes,
        extractionConfidence: extractedData?.status === 'EXTRACTED' ? 'HIGH' : 'MEDIUM',
        analysisStatus: 'AI_ASSISTED',
        structuredData: extractedData || undefined,
        doctorNotes: form.notes,
      });

      // 2. Save to medicalRecords
      await db.medicalRecords.add({
        patientId: selectedPatientId,
        type: 'report',
        date: form.date,
        data: {
          reportName: form.type,
          hasImage: !!preview,
          parameters: extractedData?.parameters || [],
          abnormalFlags: extractedData?.abnormalFlags || [],
          status: extractedData?.abnormalFlags && extractedData.abnormalFlags.length > 0 ? 'ABNORMAL' : 'NORMAL',
        },
        notes: form.notes || extractedData?.statedDiagnosis || 'Laboratory report uploaded.',
        fileData: preview?.slice(0, 1500),
      });

      setSaved(true);
      setToastMessage('✓ Medical report saved and synchronized with Doctor Summary.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage('Error saving record: ' + err?.message);
    }
  };

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📷</span>
              <h1 className="text-xl font-black text-slate-900">{t('reportScanner.title', 'Medical Report Scanner & OCR')}</h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-slate-500">
              Upload blood tests, prescriptions, or clinical sheets for automated structured data extraction and value protection.
            </p>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shrink-0 text-xs">
            <User className="w-4 h-4 text-slate-500" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* OCR Note & Value Protection Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI-Assisted Optical Character Recognition (OCR)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Clinical numbers, units (mg/dL, %, g/dL), and medicine names are strictly preserved during extraction. Some text may require original report review.
          </p>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center bg-white border-2 border-indigo-200 hover:border-indigo-400 border-dashed rounded-3xl p-5 sm:p-6 transition-all shadow-xs group min-h-[100px]"
          >
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-indigo-950">Upload Report File (PDF/Image)</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Select image or document file</span>
          </button>

          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center bg-white border-2 border-emerald-200 hover:border-emerald-400 border-dashed rounded-3xl p-5 sm:p-6 transition-all shadow-xs group min-h-[100px]"
          >
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-emerald-950">Take Camera Photo</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Capture printed lab sheet</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        {/* Preview image */}
        {preview && (
          <div className="rounded-3xl overflow-hidden border border-slate-300 bg-slate-950 flex items-center justify-center max-h-72 p-2">
            <img src={preview} alt="Report preview" className="max-h-68 object-contain" />
          </div>
        )}

        {/* Loading OCR */}
        {isAnalyzing && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-xs">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-800 text-xs">Extracting Laboratory Parameters & Medical Text...</h4>
            <p className="text-[11px] text-slate-500">Applying Medical Value Protection to safeguard numbers and units.</p>
          </div>
        )}

        {/* Extracted Structured Data Table */}
        {extractedData && extractedData.parameters && extractedData.parameters.length > 0 && (
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-indigo-950 text-xs">Extracted Test Parameters & Normal Ranges:</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                AI-Extracted • Awaiting Clinician Verification
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="pb-1.5 font-bold">Parameter</th>
                    <th className="pb-1.5 font-bold">Result Value</th>
                    <th className="pb-1.5 font-bold">Reference Range</th>
                    <th className="pb-1.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedData.parameters.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 font-bold text-slate-900">{p.name}</td>
                      <td className="py-1.5 font-mono font-bold text-slate-800">{p.result} {p.unit}</td>
                      <td className="py-1.5 text-slate-500 text-[11px]">{p.referenceRange || '-'}</td>
                      <td className="py-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'HIGH' || p.status === 'ABNORMAL'
                              ? 'bg-rose-100 text-rose-800'
                              : p.status === 'LOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
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

            {extractedData.statedDiagnosis && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Stated Impression / Diagnosis in Report:</span>
                <p className="text-slate-800 font-medium">{extractedData.statedDiagnosis}</p>
              </div>
            )}
          </div>
        )}

        {/* Manual Details & Verification Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-black text-slate-900 text-sm">Report Details & Clinician Verification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Report Classification:</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Test:</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Results & Notes to Include in Doctor Summary:</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Enter verified values, lab findings, or notes from physician..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleSave}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${
                saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Patient Records & Doctor Summary ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Report to Database</span>
                </>
              )}
            </button>

            <Link
              to="/doctor-summary"
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <span>View in Doctor Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
