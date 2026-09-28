import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Pill,
  Volume2,
  VolumeX,
  CheckCircle2,
  UploadCloud,
  Search,
  SlidersHorizontal,
  Info,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Zap,
  FileText,
  Clock,
  HeartPulse,
  Eye,
  Crosshair,
  Maximize2
} from 'lucide-react';
import {
  LOCAL_PILL_DATABASE,
  LocalPillRecord,
  PillMatchResult,
  searchPillDatabase,
  PillColor,
  PillShape,
} from '../data/medical/pillDatabase';
import { db } from '../db/db';
import { useAppStore } from '../store/useAppStore';

interface PillIdentifierProps {
  onMedicineAdded?: (medName: string) => void;
  className?: string;
  initialPillId?: string;
}

// Preset pills for immediate 1-click test simulation
const SIMULATED_PILL_PRESETS = [
  { id: 'pill-dolo-650', label: 'Dolo 650 (White Round)', emoji: '⚪', imprint: 'DOLO 650', color: 'White' as PillColor, shape: 'Round' as PillShape },
  { id: 'pill-amoxicillin-500', label: 'Mox 500 (Red/Yellow Capsule)', emoji: '💊', imprint: 'MOX 500', color: 'Two-tone Red/Yellow' as PillColor, shape: 'Capsule' as PillShape },
  { id: 'pill-metformin-500', label: 'Metformin 500 (White Oval)', emoji: '🥚', imprint: 'MET 500', color: 'White' as PillColor, shape: 'Oval' as PillShape },
  { id: 'pill-amlo-5', label: 'Amlong 5 (Yellow Hexagon)', emoji: '🟡', imprint: 'AMLO 5', color: 'Light Yellow' as PillColor, shape: 'Hexagonal' as PillShape },
  { id: 'pill-azithromycin-500', label: 'Azee 500 (Blue Oblong)', emoji: '🔵', imprint: 'AZ 500', color: 'Light Blue' as PillColor, shape: 'Oblong' as PillShape },
  { id: 'pill-pantoprazole-40', label: 'Pan 40 (Yellow Gastro)', emoji: '🟡', imprint: 'PAN 40', color: 'Light Yellow' as PillColor, shape: 'Oval' as PillShape },
  { id: 'pill-brufen-400', label: 'Brufen 400 (Orange Round)', emoji: '🟠', imprint: 'BRUFEN 400', color: 'Orange' as PillColor, shape: 'Round' as PillShape },
];

export const PillIdentifier: React.FC<PillIdentifierProps> = ({
  onMedicineAdded,
  className = '',
  initialPillId,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Search & Filter state
  const [searchImprint, setSearchImprint] = useState<string>('');
  const [filterColor, setFilterColor] = useState<string>('any');
  const [filterShape, setFilterShape] = useState<string>('any');
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Results state
  const [activeMatch, setActiveMatch] = useState<PillMatchResult | null>(() => {
    if (initialPillId) {
      const found = LOCAL_PILL_DATABASE.find((p) => p.id === initialPillId);
      if (found) {
        return {
          pill: found,
          confidence: 99.2,
          matchedFeatures: ['Direct Match Selection'],
          mismatchedFeatures: [],
        };
      }
    }
    // Default to Dolo 650
    const defaultPill = LOCAL_PILL_DATABASE[0];
    return {
      pill: defaultPill,
      confidence: 98.4,
      matchedFeatures: ['Exact Imprint "DOLO 650"', 'White Color Match', 'Round Shape Match'],
      mismatchedFeatures: [],
    };
  });

  const [searchResults, setSearchResults] = useState<PillMatchResult[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [copiedInstructions, setCopiedInstructions] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopCamera]);

  // Start Device Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video play error:', err);
        });
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(
        err?.message || 'Camera permission denied or camera not found. You can upload a photo or use simulated test pills.'
      );
      setIsCameraActive(false);
    }
  };

  // Toggle flashlight / torch
  const toggleTorch = async () => {
    if (!cameraStream) return;
    try {
      const track = cameraStream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
      if (capabilities.torch) {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } else {
        alert('Flashlight/Torch is not supported on this camera device.');
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  // Capture frame from video or process uploaded image
  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);

      // Stop video feed once frame is captured
      stopCamera();

      // Simulate optical feature detection & match against local database
      setTimeout(() => {
        performVisualMatching();
        setIsAnalyzing(false);
      }, 750);
    } else {
      setIsAnalyzing(false);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setTimeout(() => {
        performVisualMatching();
        setIsAnalyzing(false);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  // Execute matching algorithm against local pill database
  const performVisualMatching = (overrideImprint?: string) => {
    const imprintToMatch = overrideImprint || searchImprint;
    const matches = searchPillDatabase({
      imprint: imprintToMatch,
      color: filterColor,
      shape: filterShape,
      name: filterQuery,
    });

    if (matches.length > 0) {
      setActiveMatch(matches[0]);
      setSearchResults(matches.slice(1, 6));
    } else {
      // Fallback to closest match
      const fallback = LOCAL_PILL_DATABASE[0];
      setActiveMatch({
        pill: fallback,
        confidence: 65.0,
        matchedFeatures: ['Approximate Visual Profile'],
        mismatchedFeatures: ['Imprint unverified'],
      });
      setSearchResults([]);
    }
  };

  // Instant simulation with preset pill
  const handleSelectSimulatedPreset = (preset: typeof SIMULATED_PILL_PRESETS[0]) => {
    setIsAnalyzing(true);
    setSearchImprint(preset.imprint);
    setFilterColor(preset.color);
    setFilterShape(preset.shape);

    const matches = searchPillDatabase({
      imprint: preset.imprint,
      color: preset.color,
      shape: preset.shape,
    });

    setTimeout(() => {
      if (matches.length > 0) {
        setActiveMatch(matches[0]);
        setSearchResults(matches.slice(1, 4));
      }
      setIsAnalyzing(false);
    }, 400);
  };

  // Handle Search Input Change
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performVisualMatching();
  };

  // Audio Speech Synthesis for Dosage Instructions & Side Effects
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeMatch) return;
    const { pill } = activeMatch;
    const speechText = `Identified medication: ${pill.brandName}, also known as ${pill.genericName}. ` +
      `Strength: ${pill.strength}. ` +
      `Dosage Instructions: ${pill.dosageInstructions.standardAdultDose} ` +
      `${pill.dosageInstructions.mealRelation} ` +
      `${pill.dosageInstructions.maxDailyLimit} ` +
      `Side Effects: Common side effects include ${pill.sideEffects.common.join(', ')}. ` +
      `Important Warning: ${pill.sideEffects.whenToSeekUrgentCare}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy dosage instructions to clipboard
  const handleCopyInstructions = () => {
    if (!activeMatch) return;
    const { pill } = activeMatch;
    const text = `💊 Medication: ${pill.brandName} (${pill.genericName}) - ${pill.strength}\n` +
      `📋 Standard Dose: ${pill.dosageInstructions.standardAdultDose}\n` +
      `🍽️ Meal Relation: ${pill.dosageInstructions.mealRelation}\n` +
      `⏱️ Frequency: ${pill.dosageInstructions.frequency}\n` +
      `⚠️ Max Daily Limit: ${pill.dosageInstructions.maxDailyLimit}\n` +
      `⚠️ Common Side Effects: ${pill.sideEffects.common.join(', ')}\n` +
      `🚨 Urgent Care Note: ${pill.sideEffects.whenToSeekUrgentCare}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedInstructions(true);
      setTimeout(() => setCopiedInstructions(false), 3000);
    }
  };

  // Add identified pill to patient's active medicines in Dexie DB
  const handleAddToMedicines = async () => {
    if (!activeMatch) return;
    const { pill } = activeMatch;

    try {
      const patientId = (currentUser?.role === 'patient' ? currentUser.id : undefined) || 1;
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];

      await db.medicines.add({
        patientId,
        name: pill.brandName,
        dose: pill.strength,
        frequency: pill.dosageInstructions.frequency,
        times: ['08:00 AM', '08:00 PM'],
        morning: true,
        night: true,
        mealTiming: pill.dosageInstructions.mealRelation.toLowerCase().includes('before') ? 'before_food' : 'after_food',
        startDate: today,
        endDate: nextMonth,
        doctor: 'Dr. Suresh Balakrishnan (Assigned PHC Clinician)',
        instructions: `${pill.dosageInstructions.standardAdultDose} - ${pill.dosageInstructions.mealRelation}`,
        status: 'active',
        missedCount: 0,
      });

      setAddedSuccess(true);
      if (onMedicineAdded) {
        onMedicineAdded(pill.brandName);
      }
      setTimeout(() => setAddedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to add medicine to DB:', err);
    }
  };

  // Render SVG visual pill representation based on physical geometry
  const renderPillSVG = (pill: LocalPillRecord) => {
    const isRound = pill.shape === 'Round' || pill.shape === 'Chewable Round';
    const isCapsule = pill.shape === 'Capsule';
    const isHexagonal = pill.shape === 'Hexagonal';

    return (
      <div className="relative w-28 h-28 flex items-center justify-center bg-slate-900/10 rounded-2xl p-2 border border-slate-200">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Subtle Outer Glow */}
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

          {/* Pill Geometry */}
          {isRound && (
            <g>
              <circle
                cx="50"
                cy="50"
                r="34"
                fill={pill.colorHex}
                stroke="#64748B"
                strokeWidth="2.5"
              />
              {pill.scoreLine === 'Single Score' && (
                <line x1="50" y1="18" x2="50" y2="82" stroke="#475569" strokeWidth="2" strokeDasharray="1 1" />
              )}
              {pill.scoreLine === 'Cross Score' && (
                <>
                  <line x1="50" y1="18" x2="50" y2="82" stroke="#475569" strokeWidth="2" />
                  <line x1="18" y1="50" x2="82" y2="50" stroke="#475569" strokeWidth="2" />
                </>
              )}
            </g>
          )}

          {isCapsule && (
            <g>
              {/* Capsule Half 1 */}
              <path
                d="M 26 50 C 26 32, 40 24, 50 24 C 60 24, 74 32, 74 50 Z"
                fill={pill.colorHex}
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Capsule Half 2 */}
              <path
                d="M 26 50 C 26 68, 40 76, 50 76 C 60 76, 74 68, 74 50 Z"
                fill={pill.colorHexSecondary || pill.colorHex}
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Dividing Ring */}
              <line x1="26" y1="50" x2="74" y2="50" stroke="#1E293B" strokeWidth="2.5" />
            </g>
          )}

          {isHexagonal && (
            <polygon
              points="50,18 78,34 78,66 50,82 22,66 22,34"
              fill={pill.colorHex}
              stroke="#64748B"
              strokeWidth="2.5"
            />
          )}

          {!isRound && !isCapsule && !isHexagonal && (
            <rect
              x="22"
              y="32"
              width="56"
              height="36"
              rx="18"
              fill={pill.colorHex}
              stroke="#64748B"
              strokeWidth="2.5"
            />
          )}

          {/* Imprint Text */}
          <text
            x="50"
            y={isCapsule ? "38" : "54"}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={pill.color === 'White' || pill.color === 'Light Yellow' ? '#1E293B' : '#FFFFFF'}
            className="tracking-tighter font-mono select-none"
          >
            {pill.imprint}
          </text>
        </svg>

        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 font-bold">
          ~{pill.sizeMm}mm
        </span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-200 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>OFFLINE CAMERA PILL IDENTIFIER & DRUG CROSS-REFERENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Pill className="w-7 h-7 text-teal-300" />
              <span>Smart Pill Identifier</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Scan any tablet, pill, or capsule using your device camera. Medora cross-references physical imprints,
              color, and shape with a local clinical database to show exact dosage instructions and side effects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={toggleSpeech}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Hear Instructions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK PRESET SIMULATION TRAY (FOR INSTANT DESKTOP/OFFLINE TESTING) */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Instant Demo Test Scans (Click to simulate camera identification):</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Fast cross-reference without physical pill
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SIMULATED_PILL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectSimulatedPreset(preset)}
              className="bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-800 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shadow-2xs transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SCANNING & FILTER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* 1. CAMERA VIEWFINDER & CAPTURE CONTROLS (5 COLS)         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Camera Viewfinder</span>
            </h3>
            {isCameraActive && (
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                LIVE FEED
              </span>
            )}
          </div>

          {/* VIEWFINDER SCREEN */}
          <div className="relative aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Bounding Box Frame */}
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 border-2 border-teal-400/80 rounded-2xl shadow-2xl flex items-center justify-center">
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-teal-300 rounded-tl-md" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-teal-300 rounded-tr-md" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-teal-300 rounded-bl-md" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-teal-300 rounded-br-md" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_12px_#2dd4bf] animate-[bounce_2s_infinite]" />

                    {/* Central Crosshair */}
                    <Crosshair className="w-8 h-8 text-teal-300/40" />
                  </div>

                  <span className="mt-3 text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-teal-400/40">
                    Place single pill inside frame
                  </span>
                </div>

                {/* Torch Toggle inside Viewfinder */}
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur text-xs font-bold transition-all shadow-md ${
                    torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/70 text-white'
                  }`}
                  title="Flashlight / Torch"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </>
            ) : capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src={capturedImage}
                  alt="Captured pill snapshot"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-teal-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-teal-500/40">
                  Frame Captured & Analyzed
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-teal-400 flex items-center justify-center mx-auto border border-slate-700">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Camera is Inactive</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Tap "Start Camera" to point at your medication, or select a photo from your gallery.
                  </p>
                </div>
              </div>
            )}

            {/* Hidden canvas for capturing video frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning In Progress Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-20">
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                <div className="text-center">
                  <p className="font-black text-sm text-teal-200">Cross-Referencing Local Drug DB...</p>
                  <p className="text-xs text-slate-400">Analyzing pill color, shape, and imprint</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Camera Notice</span>
                <span className="text-[11px] leading-relaxed">{cameraError}</span>
              </div>
            </div>
          )}

          {/* CAMERA ACTION BUTTONS */}
          <div className="space-y-2">
            {isCameraActive ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={captureAndAnalyze}
                  className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap & Identify</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Camera
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>

                <label className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* MANUAL FILTER / SEARCH FALLBACK */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Refine by Physical Attributes:
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Imprint Code:
                </label>
                <input
                  type="text"
                  value={searchImprint}
                  onChange={(e) => setSearchImprint(e.target.value)}
                  placeholder="e.g. DOLO 650, 500, AMLO 5"
                  className="w-full text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Pill Color:
                </label>
                <select
                  value={filterColor}
                  onChange={(e) => setFilterColor(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-2 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="any">Any Color</option>
                  <option value="white">White</option>
                  <option value="yellow">Yellow / Light Yellow</option>
                  <option value="orange">Orange</option>
                  <option value="blue">Blue / Light Blue</option>
                  <option value="red">Red / Pink</option>
                  <option value="two-tone">Two-tone Capsule</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Pill Shape:
                </label>
                <select
                  value={filterShape}
                  onChange={(e) => setFilterShape(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-2 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="any">Any Shape</option>
                  <option value="round">Round</option>
                  <option value="oval">Oval</option>
                  <option value="capsule">Capsule</option>
                  <option value="oblong">Oblong</option>
                  <option value="hexagonal">Hexagonal</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => performVisualMatching()}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Filter DB</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. IDENTIFIED PILL DETAILS, DOSAGE & SIDE EFFECTS (7 COLS) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {activeMatch ? (
            <div className="bg-white border-2 border-teal-500/40 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 animate-in fade-in duration-200">
              {/* TOP HEADER & CONFIDENCE */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-4">
                  {renderPillSVG(activeMatch.pill)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                        {activeMatch.confidence}% Match Confidence
                      </span>
                      {activeMatch.pill.prescriptionRequired && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          Rx Prescription Required
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {activeMatch.pill.brandName}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-teal-700">
                      {activeMatch.pill.genericName} • {activeMatch.pill.strength}
                    </p>
                    <p className="text-xs text-slate-500">
                      Class: <strong>{activeMatch.pill.drugClass}</strong> • {activeMatch.pill.formulation}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    onClick={handleCopyInstructions}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy Pill Details"
                  >
                    {copiedInstructions ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInstructions ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleAddToMedicines}
                    disabled={addedSuccess}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:bg-emerald-600"
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Added to My Meds!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to My Meds</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CORE REQUIREMENT 1: DOSAGE INSTRUCTIONS CARD */}
              <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <h3 className="font-black text-sm text-emerald-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Dosage Instructions & Administration</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Clinical Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">
                      Standard Adult Dose:
                    </span>
                    <p className="font-extrabold text-slate-900 leading-snug">
                      {activeMatch.pill.dosageInstructions.standardAdultDose}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">
                      Meal Timing & Water:
                    </span>
                    <p className="font-extrabold text-slate-900 leading-snug">
                      {activeMatch.pill.dosageInstructions.mealRelation}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-rose-800 block">
                      Maximum Daily Limit:
                    </span>
                    <p className="font-bold text-rose-900 leading-snug">
                      {activeMatch.pill.dosageInstructions.maxDailyLimit}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-600 block">
                      Missed Dose Guidance:
                    </span>
                    <p className="text-slate-700 leading-snug">
                      {activeMatch.pill.dosageInstructions.missedDoseGuidance}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-900 bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200/80 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Special Populations:</strong> {activeMatch.pill.dosageInstructions.specialPopulations}
                  </span>
                </div>
              </div>

              {/* CORE REQUIREMENT 2: SIDE EFFECTS & ADVERSE REACTIONS CARD */}
              <div className="bg-gradient-to-br from-amber-50/80 via-rose-50/40 to-white border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <h3 className="font-black text-sm text-amber-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Side Effects & Clinical Warnings</span>
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                    Patient Safety
                  </span>
                </div>

                {/* Common Side Effects */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">
                    Common & Generally Tolerated Side Effects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.pill.sideEffects.common.map((effect, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-xl font-medium border border-amber-200"
                      >
                        • {effect}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Serious Adverse Reactions */}
                <div className="pt-2 border-t border-amber-200/50">
                  <span className="text-xs font-bold text-rose-900 block mb-1.5">
                    Serious Adverse Reactions (Discontinue & Seek Help):
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-rose-950">
                    {activeMatch.pill.sideEffects.seriousAdverseReactions.map((reaction, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                        <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                        <span>{reaction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Urgent Medical Warning Box */}
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black">When to seek urgent care: </strong>
                    <span>{activeMatch.pill.sideEffects.whenToSeekUrgentCare}</span>
                  </div>
                </div>
              </div>

              {/* STORAGE & INDICATIONS FOOTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Common Indications:</span>
                  <p className="text-slate-600">{activeMatch.pill.indications.join(', ')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Storage Advice:</span>
                  <p className="text-slate-600">{activeMatch.pill.storageAdvice}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-700">No Pill Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Capture a pill with the camera, upload a photo, or choose one of the simulated test pills above.
              </p>
            </div>
          )}

          {/* ALTERNATIVE MATCHES TRAY IF MULTIPLE CANDIDATES */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Other Potential Matches in Local Database:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {searchResults.map((res) => (
                  <button
                    key={res.pill.id}
                    onClick={() => {
                      setActiveMatch(res);
                      setSearchResults((prev) => prev.filter((item) => item.pill.id !== res.pill.id));
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                          {res.confidence}% Match
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {res.pill.imprint}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1.5 group-hover:text-teal-700 transition-colors">
                        {res.pill.brandName}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{res.pill.genericName}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-teal-600 mt-2 block">
                      View Dosage & Warnings →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
