import React, { useState, useRef, useEffect } from 'react';
import { classifyMedicalWaste } from '../ai/inference/wasteVisionClassifier';
import { checkImageQuality } from '../ai/preprocessing/imageQualityChecker';
import { InferenceResult } from '../ai/types';
import { determineSegregationStream, SegregationDecision } from '../services/segregationEngine';
import { medicalWasteDbService } from '../services/medicalWasteDbService';
import { INITIAL_COLLECTION_LOCATIONS } from '../data/initialLocations';
import { INITIAL_CONTAINERS } from '../data/initialContainers';
import { WasteContainerRecord } from '../types/wasteTypes';
import { db } from '../../../db/db';

interface ScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSaved?: (wasteItemId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export const WasteScannerModal: React.FC<ScannerProps> = ({
  isOpen,
  onClose,
  onItemSaved,
  currentUserId = 'STAFF-01',
  currentUserName = 'Sister V. Latha',
  currentUserRole = 'facility_staff'
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCapturingLive, setIsCapturingLive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [inferenceMode, setInferenceMode] = useState<
    'REAL_VISION_AI' | 'LOCAL_EDGE_MODEL' | 'DEMO_SIMULATION' | 'MODEL_NOT_CONNECTED'
  >('REAL_VISION_AI');
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<InferenceResult | null>(null);
  const [decision, setDecision] = useState<SegregationDecision | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState(INITIAL_COLLECTION_LOCATIONS[0].locationId);
  const [selectedContainerId, setSelectedContainerId] = useState(INITIAL_CONTAINERS[0].containerId);
  const [availableContainers, setAvailableContainers] = useState<WasteContainerRecord[]>(INITIAL_CONTAINERS);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      db.wasteContainers.toArray().then((conts) => {
        if (conts.length > 0) setAvailableContainers(conts);
      });
    } else {
      stopCamera();
      resetState();
    }
    return () => stopCamera();
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCapturingLive(false);
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCapturingLive(true);
      setQualityWarning(null);
    } catch (err) {
      console.warn('Camera access error:', err);
      setQualityWarning('Could not access device camera. Please upload an image file instead.');
    }
  };

  const captureFrameFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageUri(dataUrl);
      stopCamera();
      evaluateImageQuality(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUri(dataUrl);
      evaluateImageQuality(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const evaluateImageQuality = async (base64: string) => {
    const q = await checkImageQuality(base64);
    if (!q.passed) {
      setQualityWarning(q.message);
    } else {
      setQualityWarning(null);
    }
  };

  const runAnalysis = async () => {
    if (!imageUri) return;
    setAnalyzing(true);
    setQualityWarning(null);
    setAnalysisResult(null);
    setDecision(null);

    try {
      const res = await classifyMedicalWaste({
        imageBase64: imageUri,
        locationId: selectedLocationId,
        forceMode: inferenceMode
      });

      setAnalysisResult(res);

      if (!res.qualityAssessment.passed) {
        setQualityWarning(res.qualityAssessment.message);
      } else {
        const dec = determineSegregationStream(
          res.wasteCategory,
          res.confidence,
          res.detectedObjects,
          res.visibleIndicators
        );
        setDecision(dec);

        // Auto select appropriate container based on stream
        const matchingContainer = availableContainers.find((c) => c.stream === dec.recommendedStream);
        if (matchingContainer) {
          setSelectedContainerId(matchingContainer.containerId);
        }
      }
    } catch (err) {
      console.error(err);
      setQualityWarning('Analysis encountered an unexpected error. Please retake the image.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analysisResult || !decision || !imageUri) return;
    setSaving(true);
    try {
      const scanId = `SCN-${Date.now().toString().slice(-6)}`;
      const loc = INITIAL_COLLECTION_LOCATIONS.find((l) => l.locationId === selectedLocationId);

      const { wasteItemId } = await medicalWasteDbService.createWasteScanAndItem({
        scan: {
          scanId,
          operatorId: currentUserId,
          operatorName: currentUserName,
          locationId: selectedLocationId,
          locationName: loc?.name || selectedLocationId,
          timestamp: new Date().toISOString(),
          imageUri,
          qualityAssessment: analysisResult.qualityAssessment,
          status: 'ACCEPTED',
          syncStatus: navigator.onLine ? 'SYNCED' : 'PENDING_SYNC'
        },
        prediction: {
          scanId,
          wasteCategory: analysisResult.wasteCategory,
          detectedObjects: analysisResult.detectedObjects,
          visibleIndicators: analysisResult.visibleIndicators,
          confidence: analysisResult.confidence,
          confidenceTier: analysisResult.confidence >= 0.85 ? 'HIGH' : analysisResult.confidence >= 0.70 ? 'MEDIUM' : 'LOW',
          reviewRequired: analysisResult.reviewRequired,
          recommendedStream: decision.recommendedStream,
          modelVersion: analysisResult.modelVersion,
          isDemo: analysisResult.isDemo,
          createdAt: new Date().toISOString(),
          inferenceMode: analysisResult.inferenceMode
        },
        stream: decision.recommendedStream,
        containerId: selectedContainerId,
        estimatedWeightKg: 0.35,
        userId: currentUserId,
        userName: currentUserName,
        userRole: currentUserRole
      });

      setSavedSuccessId(wasteItemId);
      if (onItemSaved) onItemSaved(wasteItemId);
    } catch (err) {
      console.error('Failed to save waste record:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setImageUri(null);
    setAnalysisResult(null);
    setDecision(null);
    setQualityWarning(null);
    setSavedSuccessId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-teal-700/80 border border-teal-500/50 flex items-center justify-center text-lg">
              📷
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-none">
                Scan Medical Waste
              </h2>
              <p className="text-[11px] text-teal-200 mt-1">
                Visual Inspection, Image Quality Check &amp; Real-time AI Segregation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Mode Selector Pill (Real vs Edge vs Demo vs Disconnected) */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">
                Inference Mode Selection:
              </span>
              <span className="text-[10px] text-slate-400">Strictly Non-Fabricated AI Policy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setInferenceMode('REAL_VISION_AI')}
                className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                  inferenceMode === 'REAL_VISION_AI'
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌐 Multimodal Vision
              </button>

              <button
                type="button"
                onClick={() => setInferenceMode('LOCAL_EDGE_MODEL')}
                className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                  inferenceMode === 'LOCAL_EDGE_MODEL'
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚡ Offline Edge Model
              </button>

              <button
                type="button"
                onClick={() => setInferenceMode('DEMO_SIMULATION')}
                className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                  inferenceMode === 'DEMO_SIMULATION'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                ⚠️ Demo Simulation
              </button>

              <button
                type="button"
                onClick={() => setInferenceMode('MODEL_NOT_CONNECTED')}
                className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                  inferenceMode === 'MODEL_NOT_CONNECTED'
                    ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔌 Disconnected
              </button>
            </div>

            {inferenceMode === 'DEMO_SIMULATION' && (
              <div className="bg-amber-100 border border-amber-300 text-amber-950 p-2 rounded-xl text-[11px] font-bold text-center">
                DEMO — NOT A REAL AI PREDICTION. Simulated for testing/demonstration only.
              </div>
            )}
            {inferenceMode === 'MODEL_NOT_CONNECTED' && (
              <div className="bg-slate-200 border border-slate-300 text-slate-800 p-2 rounded-xl text-[11px] font-bold text-center">
                AI model not yet connected. All classifications will require manual review.
              </div>
            )}
          </div>

          {/* Location & Container Preset Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Collection Location:
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
              >
                {INITIAL_COLLECTION_LOCATIONS.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Target Bio-Container:
              </label>
              <select
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
              >
                {availableContainers.map((c) => (
                  <option key={c.containerId} value={c.containerId}>
                    [{c.stream}] {c.containerId} ({c.currentFillLevelPercent}% Full)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Camera / Image Viewport */}
          <div className="relative rounded-3xl bg-slate-900 border-2 border-dashed border-slate-300 overflow-hidden min-h-[220px] flex items-center justify-center text-center p-3">
            {isCapturingLive ? (
              <div className="w-full flex flex-col items-center">
                <video ref={videoRef} className="w-full max-h-64 object-contain rounded-2xl" autoPlay playsInline />
                <button
                  type="button"
                  onClick={captureFrameFromVideo}
                  className="mt-3 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-full text-xs shadow-lg animate-pulse"
                >
                  Snap Photo
                </button>
              </div>
            ) : imageUri ? (
              <div className="relative w-full flex flex-col items-center">
                <img
                  src={imageUri}
                  alt="Scanned medical waste"
                  className="max-h-64 object-contain rounded-2xl border border-white/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={resetState}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-xl hover:bg-slate-900"
                >
                  🔄 Retake
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center mx-auto">
                  📷
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Capture or upload medical waste photo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Clear lighting, object centered, avoidance of heavy shadows
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-black px-4 py-2 rounded-2xl text-xs shadow-sm cursor-pointer"
                  >
                    Open Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-2xl text-xs border border-white/20 cursor-pointer"
                  >
                    Upload Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quality Warning Alert */}
          {qualityWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-black block">Image Quality Notice</span>
                <span className="leading-relaxed">{qualityWarning}</span>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {imageUri && !analysisResult && (
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing}
              className="w-full bg-[#0F766E] hover:bg-teal-600 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking Quality &amp; Running Vision AI Model...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Analyze Medical Waste</span>
                </>
              )}
            </button>
          )}

          {/* ANALYSIS RESULTS CARD */}
          {analysisResult && decision && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
              {/* Category & Confidence Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500">Predicted Class:</span>
                  <div className="text-lg font-black text-slate-900 capitalize">
                    {analysisResult.wasteCategory.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-500">Model Confidence:</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span
                      className={`text-base font-black ${
                        analysisResult.confidence >= 0.85
                          ? 'text-emerald-700'
                          : analysisResult.confidence >= 0.70
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {Math.round(analysisResult.confidence * 100)}%
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        analysisResult.confidence >= 0.85
                          ? 'bg-emerald-100 text-emerald-800'
                          : analysisResult.confidence >= 0.70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysisResult.confidence >= 0.85 ? 'HIGH' : analysisResult.confidence >= 0.70 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Objects & Visual Indicators */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Detected Objects:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedObjects.length > 0 ? (
                      analysisResult.detectedObjects.map((obj, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium">
                          {obj.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None visually detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Visible Indicators &amp; Hazard Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.visibleIndicators.length > 0 ? (
                      analysisResult.visibleIndicators.map((ind, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-800 rounded-lg font-bold">
                          ⚠️ {ind.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No visible puncture or leakage flags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Segregation Stream Callout */}
              <div
                className="p-4 rounded-2xl border text-xs space-y-1"
                style={{
                  backgroundColor: decision.recommendedStream === 'SHARPS' ? '#f0f9ff' : decision.recommendedStream === 'INFECTIOUS' ? '#fefce8' : decision.recommendedStream === 'PHARMACEUTICAL' ? '#fffbeb' : '#f8fafc',
                  borderColor: decision.recommendedStream === 'SHARPS' ? '#bae6fd' : decision.recommendedStream === 'INFECTIOUS' ? '#fde047' : decision.recommendedStream === 'PHARMACEUTICAL' ? '#fde68a' : '#cbd5e1'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-600">
                    Recommended Segregation Stream:
                  </span>
                  <span className="font-black text-sm text-slate-900 tracking-wide">
                    [{decision.recommendedStream}]
                  </span>
                </div>
                <p className="font-bold text-slate-800">{decision.containerType}</p>
                <p className="text-[11px] text-slate-600">{decision.handlingProtocol}</p>
              </div>

              {/* Safety Directive */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-[11px] text-red-900">
                <span className="font-black block mb-0.5">⚠️ Mandatory Safety Protocol:</span>
                <span className="whitespace-pre-line leading-relaxed">{decision.safetyWarning}</span>
              </div>

              {/* Save & Confirm Action */}
              {!savedSuccessId ? (
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Writing to Database &amp; Creating Audit Event...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Confirm Segregation &amp; Save Record</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold text-center">
                  ✓ Successfully saved record: {savedSuccessId}!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Model: <strong className="font-mono text-slate-800">{analysisResult?.modelVersion || 'Ready'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
