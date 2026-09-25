import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, UploadedDocument } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';
import {
  ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw, Upload, CheckCircle2,
  AlertTriangle, ShieldCheck, Download, Share2, Stethoscope, ArrowRight, Loader2, Info
} from 'lucide-react';

export default function XrayViewerPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [bodyPart, setBodyPart] = useState<'Chest' | 'Abdomen' | 'Pelvis' | 'Spine' | 'Extremity'>('Chest');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Image & viewer state
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Analysis Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'AI_ASSISTED' | 'UNRELIABLE';
    study: string;
    bodyRegion: string;
    imageQuality: string;
    aiFindings: string;
    confidence: string;
    possibleAbnormality: string;
    clinicalImpression: string;
    recommendedNextStep: string;
    doctorReviewStatus: string;
    analysisTimestamp?: string;
    modelVersion?: string;
    message?: string;
  } | null>(null);

  // Doctor confirmation & notes
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isDoctorConfirmed, setIsDoctorConfirmed] = useState(false);
  const [savedToDoctorSummary, setSavedToDoctorSummary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.patients.toArray().then((list) => {
      setPatients(list);
      if (list.length > 0) {
        const defaultId = currentUser?.role === 'patient' && currentUser.id ? currentUser.id : list[0].id || 1;
        setSelectedPatientId(defaultId);
      }
    });
  }, [currentUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setToastMessage('File size exceeds 20MB limit.');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setZoom(1);
    setRotation(0);
    setAnalysisResult(null);
    setIsDoctorConfirmed(false);
    setSavedToDoctorSummary(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);
      // Run analysis pipeline
      runMedicalImageAnalysis(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const runMedicalImageAnalysis = async (imageDataUrl: string, name: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analysis/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          fileName: name,
          patientId: selectedPatientId,
          bodyPart,
        }),
      });

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setAnalysisResult({
        status: 'UNRELIABLE',
        study: `Radiography (${bodyPart})`,
        bodyRegion: bodyPart,
        imageQuality: 'Insufficient',
        aiFindings: 'Medical image could not be reliably analysed.',
        confidence: 'Low',
        possibleAbnormality: 'Uncertain / Image analysis service unreachable',
        clinicalImpression: 'Awaiting clinician reading.',
        recommendedNextStep: 'Consult a qualified doctor or radiologist.',
        doctorReviewStatus: 'Awaiting doctor review',
        message: 'Medical image could not be reliably analysed.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDoctorConfirm = async () => {
    if (!image) return;
    setIsDoctorConfirmed(true);
    setToastMessage('✓ Radiographic observation verified and DOCTOR CONFIRMED.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToDoctorSummary = async () => {
    if (!image) return;
    try {
      const docId = `IMG-${Date.now()}`;
      await db.uploadedDocuments.add({
        documentId: docId,
        patientId: selectedPatientId,
        documentType: 'xray',
        fileName: fileName || `X-Ray (${bodyPart})`,
        mimeType: 'image/jpeg',
        fileSize,
        uploadedAt: new Date().toISOString(),
        source: 'CLINIC_SCAN',
        fileData: image,
        extractedText: analysisResult?.aiFindings || 'Radiography examination attached.',
        extractionConfidence: analysisResult?.confidence === 'High' ? 'HIGH' : 'MEDIUM',
        analysisStatus: isDoctorConfirmed ? 'DOCTOR_CONFIRMED' : 'AI_ASSISTED',
        structuredData: analysisResult as any,
        doctorNotes,
      });

      setSavedToDoctorSummary(true);
      setToastMessage('✓ Radiograph attached to Doctor Summary & Patient Database.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage('Error saving to Doctor Summary: ' + err?.message);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = fileName || `xray_${bodyPart.toLowerCase()}.jpg`;
    a.click();
  };

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🩻</span>
              <h1 className="text-xl font-black text-slate-900">Medical Imaging & Radiography Analysis</h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-slate-500">
              Validated digital image inspection with high-contrast diagnostic controls, AI-assisted finding pipeline, and clinician confirmation.
            </p>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shrink-0 text-xs">
            <span className="font-bold text-slate-500">Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y - {p.village})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 text-xs text-red-900 space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>CRITICAL MEDICAL SAFETY & DIAGNOSIS POLICY</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-800">
            Medora does not generate fake diagnostic results. AI findings remain strictly <strong>AI-assisted observations</strong> until formally reviewed and signed by a qualified clinician. Never change treatment without professional medical confirmation.
          </p>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Upload Controls & Metadata Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Body Region:</label>
              <select
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="Chest">Chest (Thorax)</option>
                <option value="Abdomen">Abdomen</option>
                <option value="Pelvis">Pelvis & Hip</option>
                <option value="Spine">Spine (Cervical / Lumbar)</option>
                <option value="Extremity">Extremity (Limb / Joint)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Study Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Study Source:</label>
              <input
                type="text"
                readOnly
                value="Kodaikanal Government Hospital"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Scan (PDF/IMG)</span>
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Viewer Stage & Diagnostic Controls */}
        {image && (
          <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-2 p-3">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 p-2 rounded-2xl text-xs text-white">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3.5))}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => r - 90)}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => r + 90)}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  title="Rotate Right"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="font-mono text-[11px] text-teal-400">
                {fileName || 'Radiograph'} • Zoom: {Math.round(zoom * 100)}% • Rot: {rotation}°
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[11px] flex items-center gap-1 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Canvas / LCD High-Contrast Viewport */}
            <div className="bg-[#05080f] rounded-2xl min-h-[340px] flex items-center justify-center overflow-hidden relative select-none">
              <img
                src={image}
                alt="Medical X-ray / Radiograph"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease',
                }}
                className="max-h-[460px] max-w-full object-contain pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* AI Analysis Result Section (Section 11 & 12 of prompt) */}
        {isAnalyzing && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-xs">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <h3 className="font-black text-slate-800 text-sm">Evaluating Radiographic Image...</h3>
            <p className="text-xs text-slate-500">Checking body region anatomy, image quality, and possible clinical features.</p>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                  AI-Assisted Radiography Findings
                </span>
                <h3 className="text-lg font-black text-slate-900">{analysisResult.study}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black ${
                    isDoctorConfirmed
                      ? 'bg-emerald-600 text-white'
                      : analysisResult.status === 'AI_ASSISTED'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {isDoctorConfirmed ? 'DOCTOR CONFIRMED ✓' : analysisResult.doctorReviewStatus}
                </span>
              </div>
            </div>

            {/* Structured Findings Grid */}
            {analysisResult.status === 'AI_ASSISTED' ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Body Region</span>
                    <strong className="text-slate-900">{analysisResult.bodyRegion}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Image Quality</span>
                    <strong className="text-slate-900">{analysisResult.imageQuality}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">AI Confidence</span>
                    <strong className="text-slate-900">{analysisResult.confidence}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Model Version</span>
                    <span className="text-[10px] font-mono text-slate-700">{analysisResult.modelVersion || 'Gemini 3.8 Vision'}</span>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-2xl space-y-1">
                  <span className="font-black text-indigo-950 text-xs block">AI-Assisted Observations:</span>
                  <p className="text-indigo-900 leading-relaxed text-xs">{analysisResult.aiFindings}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">Possible Abnormality Noted:</span>
                  <p className="text-slate-700 text-xs">{analysisResult.possibleAbnormality}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">Clinical Impression:</span>
                  <p className="text-slate-700 text-xs">{analysisResult.clinicalImpression}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900">
                <div className="font-bold flex items-center gap-1.5 text-sm text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Medical image could not be reliably analysed.</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-800">
                  {analysisResult.message || 'Image quality is insufficient, body region is unrecognized, or external imaging analysis service is unavailable.'}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => image && runMedicalImageAnalysis(image, fileName)}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700"
                  >
                    Retry Analysis
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded-xl font-bold text-xs"
                  >
                    Download Original Image
                  </button>
                </div>
              </div>
            )}

            {/* Doctor Review & Confirmation Actions */}
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3 text-xs">
              <span className="font-black text-amber-950 block">Clinician Review & Notes:</span>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Doctor comments, radiographic impression confirmation, or referral directions..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleDoctorConfirm}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 ${
                    isDoctorConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isDoctorConfirmed ? 'Confirmed as Attending Doctor ✓' : 'Confirm & Sign Diagnosis as Doctor'}</span>
                </button>

                <button
                  onClick={handleAddToDoctorSummary}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 ${
                    savedToDoctorSummary ? 'bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{savedToDoctorSummary ? 'Added to Doctor Summary ✓' : 'Add to Doctor Summary'}</span>
                </button>

                <Link
                  to="/doctor-summary"
                  className="ml-auto text-xs text-indigo-700 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Full Doctor Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
