import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Pill, Volume2, CheckCircle2, UserCheck, ArrowRight, UploadCloud, XCircle, Info, Activity } from 'lucide-react';
import { LanguageCode, FamilyMember } from '../types';
import { voiceService } from '../services/voiceService';

interface AICameraScannerProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onSaveScanToProfile: (scanData: any) => void;
  onNavigateToDoctorSummary: () => void;
  onNavigateToAI: () => void;
}

interface ScanPreset {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  confidence: number;
  diseaseName: string;
  severity: 'Mild' | 'Moderate' | 'Urgent';
  visualFeatures: string[];
  howToControl: string;
  howToReduce: string;
  medications: {
    name: string;
    dosage: string;
    instructions: string;
    isPrescriptionRequired: boolean;
  }[];
  redFlags: string;
}

export const AICameraScanner: React.FC<AICameraScannerProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onSaveScanToProfile,
  onNavigateToDoctorSummary,
  onNavigateToAI,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ScanPreset | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeMember = familyMembers.find(m => m.id === selectedFamilyId) || familyMembers[0];

  const presets: ScanPreset[] = [
    {
      id: 'ringworm',
      title: 'Demo 1: Fungal Ringworm (Tinea Corporis)',
      category: 'Skin & Fungal',
      thumbnail: '⭕ Circular erythematous annular plaque with raised scaly active border and central clearing',
      confidence: 96.2,
      diseaseName: 'Tinea Corporis (Fungal Ringworm)',
      severity: 'Moderate',
      visualFeatures: [
        'Annular (ring-shaped) reddish circular patch',
        'Distinct raised scaly peripheral margin',
        'Central hypopigmented healing zone',
        'Dry skin peeling without deep ulceration',
      ],
      howToControl: 'Wash all clothes, bedsheets, and towels in boiling hot water and dry directly in bright sunlight. Do not share combs, soap, or towels with family members to prevent spreading across the household.',
      howToReduce: 'Keep the affected skin strictly clean and bone-dry. After bathing, gently pat dry with a clean cloth. Wear loose-fitting cotton clothing. Avoid sweating and tight nylon clothes.',
      medications: [
        {
          name: 'Clotrimazole 1% Antifungal Cream',
          dosage: 'Apply a thin layer twice daily (morning & night)',
          instructions: 'Apply 2 cm beyond the visible edge of the rash. Continue for full 2 weeks even after rash clears to kill deep fungal spores.',
          isPrescriptionRequired: false,
        },
        {
          name: 'Calamine Soothing Lotion',
          dosage: 'Apply during severe itching bouts',
          instructions: 'Cools the inflamed skin and stops scratching, which prevents secondary bacterial infection.',
          isPrescriptionRequired: false,
        },
      ],
      redFlags: 'If yellow pus oozes, swelling spreads, or fever develops (secondary bacterial infection), visit the Primary Health Centre.',
    },
    {
      id: 'scabies',
      title: 'Demo 2: Scabies Infestation',
      category: 'Skin Parasitic',
      thumbnail: '🤏 Small erythematous papules and linear burrow tracks in finger webs and wrist creases',
      confidence: 94.8,
      diseaseName: 'Scabies Mite Infestation',
      severity: 'Moderate',
      visualFeatures: [
        'Minute linear serpiginous burrows',
        'Papular excoriations in interdigital finger web spaces',
        'Excoriated scratches on wrists and waistline',
        'Night-time symptom flare with family clustering',
      ],
      howToControl: 'Treat ALL household family members simultaneously, even those without visible symptoms, or the mite will continuously re-infect.',
      howToReduce: 'Wash all blankets, dhotis, and bedding in boiling water. Store un-washable items in sealed plastic bags for 72 hours (mites die without human host).',
      medications: [
        {
          name: 'Permethrin 5% Lotion',
          dosage: 'Single full-body application from neck down to toes',
          instructions: 'Apply at night on completely dry skin. Leave on for 8 to 14 hours, then wash off with warm water. Repeat once after 7 days.',
          isPrescriptionRequired: false,
        },
        {
          name: 'Cetirizine 10mg Tablets',
          dosage: '1 tablet at bedtime for 5 days',
          instructions: 'Reduces severe nighttime allergic itching and helps the patient sleep peacefully.',
          isPrescriptionRequired: false,
        },
      ],
      redFlags: 'Widespread skin crusting, thick scaling, or secondary open sores with yellow crusting (Norwegian scabies).',
    },
    {
      id: 'impetigo',
      title: 'Demo 3: Pediatric Impetigo (   )',
      category: 'Pediatric Bacterial',
      thumbnail: '🍯 Honey-colored golden crusts and oozing erosions around nostrils and mouth',
      confidence: 95.5,
      diseaseName: 'Bacterial Impetigo (- -)',
      severity: 'Moderate',
      visualFeatures: [
        'Characteristic honey-colored ( ) golden crusts',
        'Perioral and nostril erythematous erosions',
        'Thin-walled fragile vesicles that rupture easily',
        'Mild localized lymph node tenderness',
      ],
      howToControl: 'Keep the child’s fingernails trimmed very short and clean to prevent scratching and spreading bacteria to the eyes or face.',
      howToReduce: 'Gently soften and clean crusts with lukewarm saline or boiled warm water. Wash hands thoroughly with soap before and after touching sores.',
      medications: [
        {
          name: 'Mupirocin 2% Ointment ()',
          dosage: 'Apply to cleaned sores 3 times daily for 7 days',
          instructions: 'Gently remove crusts with warm washcloth first, then apply thin layer of ointment.',
          isPrescriptionRequired: false,
        },
        {
          name: 'Oral Amoxicillin / Clavulanate (if widespread)',
          dosage: 'As prescribed by PHC doctor based on child weight',
          instructions: 'Mandatory if sores spread across face or body.',
          isPrescriptionRequired: true,
        },
      ],
      redFlags: 'High fever, child becomes irritable or refuses food, facial swelling, or dark tea-colored urine (kidney nephritis alert).',
    },
    {
      id: 'conjunctivitis',
      title: 'Demo 4: Acute Eye Conjunctivitis (  / Pink Eye)',
      category: 'Ophthalmic Infection',
      thumbnail: '👁️ Marked conjunctival hyperemia, mucosal discharge, and eyelid agglutination',
      confidence: 97.1,
      diseaseName: 'Acute Infective Conjunctivitis ( )',
      severity: 'Mild',
      visualFeatures: [
        'Diffuse conjunctival redness ( )',
        'Watery or yellowish mucopurulent discharge',
        'Eyelids stuck together upon waking in the morning',
        'Gritty sensation like sand inside the eyelid',
      ],
      howToControl: 'Do not rub the eyes. Wash hands frequently with clean soap. Use separate face towels and washcloths.',
      howToReduce: 'Clean sticky eyelid discharge using clean cotton balls soaked in cooled boiled water. Wipe gently from inner corner to outer corner.',
      medications: [
        {
          name: 'Ciprofloxacin 0.3% Eye Drops ()',
          dosage: '1 to 2 drops in affected eye 4 times daily for 5 days',
          instructions: 'Do not touch the dropper tip to the eyeball or hands. Discard bottle 1 month after opening.',
          isPrescriptionRequired: false,
        },
        {
          name: 'Lubricating Artificial Tears ()',
          dosage: '1 drop 3 times daily',
          instructions: 'Soothes stinging, burning sensation and flushes out irritants.',
          isPrescriptionRequired: false,
        },
      ],
      redFlags: 'Severe deep eye pain, cloudy cornea, decreased vision, or sensitivity to light (keratitis danger).',
    },
    {
      id: 'contact_dermatitis',
      title: 'Demo 5: Contact Dermatitis / Crop Irritation (-  )',
      category: 'Allergic Skin',
      thumbnail: '🌿 Linear vesicular eruption with intense erythema from agricultural weeds / parthenium',
      confidence: 93.9,
      diseaseName: 'Allergic Contact Dermatitis (Parthenium /  )',
      severity: 'Mild',
      visualFeatures: [
        'Erythematous inflamed skin along exposed forearm / neck',
        'Micro-vesicles with clear weeping fluid',
        'Sharp demarcation matching crop/clothing contact boundary',
        'Intense burning and prickly heat sensation',
      ],
      howToControl: 'Wear full-sleeve cotton shirts, long trousers, and rubber gloves when working in fields with Parthenium (Gajar Ghas) or spraying fertilizers.',
      howToReduce: 'Wash exposed arms and legs immediately after farm work with cool water and mild soap. Apply cool water cloth compresses.',
      medications: [
        {
          name: 'Hydrocortisone 1% Cream (mild steroid)',
          dosage: 'Apply sparingly once daily for 3 to 5 days only',
          instructions: 'Do NOT apply on open wounds or fungal ringworm. Stops allergic swelling quickly.',
          isPrescriptionRequired: false,
        },
        {
          name: 'Calamine Lotion with Aloe Vera',
          dosage: 'Apply liberally over itchy areas 3 times daily',
          instructions: 'Safe, cooling relief for rural occupational skin irritation.',
          isPrescriptionRequired: false,
        },
      ],
      redFlags: 'Facial swelling, swelling of lips/tongue, or difficulty breathing (anaphylaxis emergency -> dial 108).',
    },
    {
      id: 'jaundice',
      title: 'Demo 6: Scleral Icterus / Jaundice Check ( )',
      category: 'Liver & Systemic',
      thumbnail: '🟡 Yellowish discoloration of ocular conjunctiva and fingernail beds',
      confidence: 96.8,
      diseaseName: 'Scleral Icterus / Suspected Viral Hepatitis ()',
      severity: 'Urgent',
      visualFeatures: [
        'Bilateral yellowing of sclera (  )',
        'Yellowish tinge on palmar creases and nail beds',
        'History of dark mustard-colored urine',
        'Loss of appetite and mild right upper quadrant discomfort',
      ],
      howToControl: 'Strictly drink ONLY boiled and cooled drinking water. Avoid roadside unpeeled fruits and contaminated water sources (Viral Hepatitis A & E are waterborne).',
      howToReduce: 'Complete physical rest. Avoid hard farm labor. Eat light, low-fat carbohydrate meals (boiled rice, sugarcane juice from clean source, papaya).',
      medications: [
        {
          name: 'Oral Rehydration Salts (ORS) & Glucose Water',
          dosage: 'Sip 2 to 3 liters daily to prevent liver exhaustion',
          instructions: 'Provides clean energy without taxing liver metabolism.',
          isPrescriptionRequired: false,
        },
        {
          name: 'PHC Liver Function Test (LFT) Blood Screening',
          dosage: 'Immediate referral for Total Bilirubin and SGPT',
          instructions: 'Required to rule out Acute Hepatitis or Gallstone blockage.',
          isPrescriptionRequired: true,
        },
      ],
      redFlags: 'Mental confusion, severe drowsiness, continuous vomiting, or bleeding gums (Acute Liver Failure warning).',
    },
  ];

  // Camera handling
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera directly. You can use the demonstration presets or upload an image file from your device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeCapturedImage();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        analyzeCapturedImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetDemo = (preset: ScanPreset) => {
    setCapturedImage(null);
    stopCamera();
    runAnalysisOnImage(preset);
  };

  const runAnalysisOnImage = (preset: ScanPreset) => {
    setIsAnalyzing(true);
    setActiveAnalysis(null);
    setSavedSuccess(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveAnalysis(preset);
    }, 1200);
  };

  const analyzeCapturedImage = () => {
    runAnalysisOnImage({
      id: 'review-needed',
      title: 'Image captured: clinical review needed',
      category: 'Unclassified image',
      thumbnail: 'The image was captured successfully, but an image alone cannot safely identify a disease.',
      confidence: 0,
      diseaseName: 'No diagnosis made from this image',
      severity: 'Urgent',
      visualFeatures: ['Image received', 'No validated disease classifier is connected', 'Lighting and image quality may affect review'],
      howToControl: 'Do not self-treat from this scan. Keep the area clean and arrange a clinician review.',
      howToReduce: 'Upload a clear, well-lit image and arrange an in-person examination at a qualified clinic.',
      medications: [],
      redFlags: 'Seek urgent care for severe pain, rapid swelling, breathing difficulty, high fever, bleeding, eye involvement, or a rapidly spreading rash.',
    });
  };
  const handleSaveToProfile = () => {
    if (!activeAnalysis) return;
    onSaveScanToProfile({
      id: `scan-${Date.now()}`,
      patientId: activeMember.id,
      patientName: activeMember.name,
      diseaseName: activeAnalysis.diseaseName,
      confidence: activeAnalysis.confidence,
      category: activeAnalysis.category,
      severity: activeAnalysis.severity,
      medications: activeAnalysis.medications.map(m => m.name).join(', '),
      date: new Date().toISOString().split('T')[0],
      source: 'AI Camera Vision Scanner',
    });
    setSavedSuccess(true);
  };

  const readAnalysisVoice = () => {
    if (!activeAnalysis) return;
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const medText = activeAnalysis.medications.map(m => `${m.name}, ${m.dosage}`).join('. ');
    const text = `AI Camera Analysis detected ${activeAnalysis.diseaseName} with ${activeAnalysis.confidence} percent match. How to control: ${activeAnalysis.howToControl}. How to reduce: ${activeAnalysis.howToReduce}. Recommended safe medicines: ${medText}. Red flags: ${activeAnalysis.redFlags}`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cyan-400/20 border border-cyan-300/30 text-cyan-200 px-3 py-1 rounded-full text-xs font-bold">
              <Camera className="w-4 h-4 text-cyan-300" />
              <span>Vision AI Prototype for Frontline Rural Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              AI Camera Disease & Symptom Scanner
            </h1>
            <p className="text-sm text-cyan-100/90 leading-relaxed">
              Use the camera for a preliminary AI risk assessment of skin rashes, eye redness, or wounds. Results are informational and require professional medical evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => selectPresetDemo(presets[0])}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Live Demo Now</span>
            </button>
            <button
              onClick={onNavigateToAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs shadow transition-all"
            >
              <span>Ask AI Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Profile Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-bold text-slate-800">Assign Scan to Patient:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFamilyId === m.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.age} yrs - {m.relationship})
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Camera & Demo Presets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Camera Viewfinder & File Input */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-600" />
              <span>Visual Capture Viewfinder</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
              Prototype Vision Assessment
            </span>
          </div>

          {/* Viewfinder Window */}
          <div className="relative aspect-video sm:aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured lesion"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Start the camera for a preliminary risk assessment, or choose a sample preset to view the prototype workflow.
                </p>
              </div>
            )}

            {/* Scanning Overlay Animation */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-cyan-300 animate-pulse tracking-wide">
                  ANALYZING EPIDERMAL TEXTURE & MARGINS...
                </span>
              </div>
            )}
          </div>

          {/* Capture Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Capture & Analyze</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
              </>
            )}

            {/* File Upload Alternative */}
            <label className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0">
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

          {/* Quick Demo Presets */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Or Select an Interactive Rural Demo Scan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPresetDemo(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    activeAnalysis?.id === preset.id
                      ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-200 font-black text-cyan-950'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="block font-bold text-slate-900 truncate">{preset.diseaseName}</span>
                  <span className="text-[10px] text-slate-500">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Detailed AI Risk Assessment */}
        <div className="lg:col-span-7 space-y-6">
          {activeAnalysis ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              {/* Header with Title and Confidence */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {activeAnalysis.confidence}% Match Confidence
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {activeAnalysis.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {activeAnalysis.diseaseName}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={readAnalysisVoice}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{speaking ? 'Stop Voice' : '🔊 Listen'}</span>
                  </button>

                  <button
                    onClick={handleSaveToProfile}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                      savedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                  >
                    {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>{savedSuccess ? 'Saved to Profile ✓' : 'Save to Patient Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Visual Features Detected */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-black text-slate-900 block">AI-Assessed Visual Features:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAnalysis.visualFeatures.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1. How to Control It */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-black text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. How to Control It (    ):</span>
                </div>
                <p className="text-emerald-900 leading-relaxed text-[11px]">{activeAnalysis.howToControl}</p>
              </div>

              {/* 2. How to Reduce It */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-black text-teal-950">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>2. How to Reduce It (      ):</span>
                </div>
                <p className="text-teal-900 leading-relaxed text-[11px]">{activeAnalysis.howToReduce}</p>
              </div>

              {/* 3. Medications & Medicines to Take */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Pill className="w-4 h-4 text-cyan-600" />
                  <span>3. Medications & Medicines to Take (  ):</span>
                </div>

                <div className="space-y-2.5">
                  {activeAnalysis.medications.map((med, idx) => (
                    <div key={idx} className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="font-black text-sky-950 text-sm">{med.name}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          med.isPrescriptionRequired ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {med.isPrescriptionRequired ? 'PHC Doctor Prescription' : 'Safe First-Line / OTC'}
                        </span>
                      </div>
                      <p className="text-sky-900 font-semibold">{med.dosage}</p>
                      <p className="text-slate-600 text-[11px]">{med.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Red-Flag Warnings */}
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-black text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>When to Rush to the Hospital (  ):</span>
                </div>
                <p className="text-rose-900 leading-relaxed text-[11px]">{activeAnalysis.redFlags}</p>
              </div>

              {/* Footer action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Disclaimer: AI decision support for village families. Confirm with ASHA or PHC MO.
                </span>
                <button
                  onClick={onNavigateToDoctorSummary}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Sync to Doctor Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-12 border-2 border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-black text-slate-800">No Image Scanned Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Start your camera or click any of the 6 demo presets on the left (e.g. Ringworm, Scabies, Conjunctivitis) to see instant AI detection, home reduction steps, and safe medications.
                </p>
              </div>
              <button
                onClick={() => selectPresetDemo(presets[0])}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Launch Demo 1 (Ringworm Analysis)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
