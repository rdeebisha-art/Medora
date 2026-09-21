import React, { useState } from 'react';
import { FileText, UploadCloud, Sparkles, CheckCircle2, ArrowRight, Volume2, AlertTriangle, ShieldCheck, RefreshCw, UserCheck, Stethoscope, Eye, Clock, Check, Send } from 'lucide-react';
import { LanguageCode, FamilyMember } from '../types';
import { voiceService } from '../services/voiceService';

interface MedicalReportScannerProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onUpdatePatientProfile: (reportData: any) => void;
  onUpdateDoctorSummary: (reportData: any) => void;
  onNavigateToDoctorSummary: () => void;
  onNavigateToAI: () => void;
  onOpenCommunicationCenterForPatient?: (patientId: string) => void;
}

interface ReportPreset {
  id: string;
  reportType: 'X-Ray' | 'Blood Test' | 'Ultrasound' | 'Prescription' | 'Urine / Organ Profile';
  title: string;
  date: string;
  hospitalName: string;
  rawClinicalFindings: string[];
  simpleVillageExplanation: string;
  abnormalFlags: { item: string; value: string; normalRange: string; interpretation: string }[];
  aiRecommendations: string[];
  preventRedundantScansSavings: string;
}

export const MedicalReportScanner: React.FC<MedicalReportScannerProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onUpdatePatientProfile,
  onUpdateDoctorSummary,
  onNavigateToDoctorSummary,
  onNavigateToAI,
  onOpenCommunicationCenterForPatient,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportPreset | null>(null);
  const [syncedToProfile, setSyncedToProfile] = useState(false);
  const [syncedToDoctorSummary, setSyncedToDoctorSummary] = useState(false);
  const [customFileUploaded, setCustomFileUploaded] = useState<string | null>(null);

  const activeMember = familyMembers.find(m => m.id === selectedFamilyId) || familyMembers[0];

  const presets: ReportPreset[] = [
    {
      id: 'xray-chest',
      reportType: 'X-Ray',
      title: 'Digital Chest X-Ray (PA View) —   -',
      date: '2026-09-08',
      hospitalName: 'District Civil Hospital Imaging Centre',
      rawClinicalFindings: [
        'Bilateral lung fields show increased peribronchial markings in right lower zone.',
        'No focal consolidation, cavitation, or pleural effusion noted.',
        'Cardiothoracic ratio within normal limits (48%). Both costophrenic angles clear.',
        'Impression: Mild acute bronchitis; no evidence of active Pulmonary Tuberculosis.'
      ],
      simpleVillageExplanation: '   -                - ()   ,          ',
      abnormalFlags: [
        { item: 'Right Peribronchial Markings', value: 'Mild Haziness', normalRange: 'Clear', interpretation: 'Mild seasonal bronchial inflammation. No pneumonia.' }
      ],
      aiRecommendations: [
        'Continue steam inhalation twice daily for 5 days.',
        'Drink warm tulsi/ginger water; avoid cold drinks and morning dust.',
        'No repeat X-ray needed. Saving: ₹450-₹800 in redundant imaging costs.'
      ],
      preventRedundantScansSavings: '₹650 saved (Prevents doctor ordering duplicate chest scan)'
    },
    {
      id: 'cbc-blood',
      reportType: 'Blood Test',
      title: 'Complete Blood Count (CBC) —   ',
      date: '2026-09-07',
      hospitalName: 'Primary Health Centre Rampur Diagnostic Lab',
      rawClinicalFindings: [
        'Hemoglobin (Hb): 9.6 g/dL (Microcytic Hypochromic picture)',
        'Total Leukocyte Count (TLC): 10,800 cells/cu.mm',
        'Platelet Count: 2,40,000 /cu.mm (Adequate)',
        'ESR: 22 mm/1st hr (Mild elevation)'
      ],
      simpleVillageExplanation: '   9.6 ,         ( )     (2.4 )                      ',
      abnormalFlags: [
        { item: 'Hemoglobin (Hb)', value: '9.6 g/dL', normalRange: '12.0 – 15.5 g/dL', interpretation: 'Mild Nutritional Anemia. Requires iron-rich diet & daily IFA.' },
        { item: 'ESR (Infection Marker)', value: '22 mm/hr', normalRange: '0 – 15 mm/hr', interpretation: 'Mild reactive inflammation from recent fever.' }
      ],
      aiRecommendations: [
        'Take daily government Iron & Folic Acid tablet with lemon water.',
        'Include moringa (drumstick) leaves and jaggery in your daily meals.',
        'No need to repeat CBC for next 3 months.'
      ],
      preventRedundantScansSavings: '₹350 saved (Report digitized for hospital doctor review)'
    },
    {
      id: 'ultrasound-anc',
      reportType: 'Ultrasound',
      title: 'Obstetric Ultrasound Scan (24 Weeks) —  ',
      date: '2026-09-05',
      hospitalName: 'Community Health Centre Shivajinagar Sonology Unit',
      rawClinicalFindings: [
        'Single live intrauterine fetus in cephalic presentation.',
        'Fetal Heart Rate (FHR): 146 bpm, regular rhythm.',
        'Gestational Age by BPD/FL: 24 weeks 2 days. Estimated Fetal Weight: 680g.',
        'Placenta: Anterior, Grade I maturity, well away from internal os.',
        'Amniotic Fluid Index (AFI): 13.8 cm (Adequate fluid volume).'
      ],
      simpleVillageExplanation: '             146      ( ) 13.8       ()    ',
      abnormalFlags: [],
      aiRecommendations: [
        'Sleep on the left side to keep blood flowing to the placenta.',
        'Continue daily calcium and iron tablets as scheduled.',
        'Next ultrasound scheduled at 32-34 weeks for pre-birth check.'
      ],
      preventRedundantScansSavings: '₹1,200 saved (Private clinics often order unnecessary repeat 3D scans)'
    },
    {
      id: 'sugar-hba1c',
      reportType: 'Blood Test',
      title: 'Fasting Blood Sugar & HbA1c Profile —  ',
      date: '2026-09-02',
      hospitalName: 'District Public Health Laboratory',
      rawClinicalFindings: [
        'Fasting Plasma Glucose: 158 mg/dL',
        'Post-Prandial Blood Glucose (2 hrs): 224 mg/dL',
        'Glycated Hemoglobin (HbA1c): 8.2% (Estimated average glucose: 189 mg/dL)',
        'Serum Creatinine: 0.9 mg/dL (Normal renal clearance)'
      ],
      simpleVillageExplanation: '      (HbA1c) 8.2% ,   (7%  )       ( 0.9)                    ',
      abnormalFlags: [
        { item: 'HbA1c (3-Month Sugar)', value: '8.2%', normalRange: '< 7.0%', interpretation: 'Suboptimal glycemic control. High risk of eye/nerve complications.' },
        { item: 'Fasting Blood Glucose', value: '158 mg/dL', normalRange: '70 – 110 mg/dL', interpretation: 'Elevated morning fasting glucose.' }
      ],
      aiRecommendations: [
        'Cut out white rice and tea with sugar; switch to ragi and millets.',
        'Walk for 30 minutes every morning and evening.',
        'Ensure daily Metformin adherence without missing doses.'
      ],
      preventRedundantScansSavings: '₹800 saved (Lab data integrated into digital handoff)'
    },
    {
      id: 'prescription-digitized',
      reportType: 'Prescription',
      title: 'Handwritten Doctor Prescription Scan —  ',
      date: '2026-08-28',
      hospitalName: 'PHC Rampur Outpatient Department',
      rawClinicalFindings: [
        'Tab. Telmisartan 40mg — 1-0-0 (Morning after breakfast) for HTN',
        'Tab. Metformin 500mg SR — 0-0-1 (Night after dinner) for T2D',
        'Tab. Paracetamol 650mg — SOS for joint ache / fever',
        'Follow-up: 4 weeks with fresh BP record'
      ],
      simpleVillageExplanation: '                 ( 40mg)          ( 500mg)  ',
      abnormalFlags: [],
      aiRecommendations: [
        'Never skip morning BP medication.',
        'Keep a handwritten pocket card or check the Medora Medicine Reminder.'
      ],
      preventRedundantScansSavings: 'Prevents prescription loss and misinterpretation of dosage'
    }
  ];

  const handleSelectPreset = (preset: ReportPreset) => {
    setIsAnalyzing(true);
    setActiveReport(null);
    setSyncedToProfile(false);
    setSyncedToDoctorSummary(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveReport(preset);
    }, 900);
  };

  const handleSyncToProfile = () => {
    if (!activeReport) return;
    onUpdatePatientProfile({
      id: `report-${Date.now()}`,
      patientId: activeMember.id,
      patientName: activeMember.name,
      title: activeReport.title,
      type: activeReport.reportType,
      date: activeReport.date,
      summary: activeReport.simpleVillageExplanation,
      abnormalItems: activeReport.abnormalFlags,
      savings: activeReport.preventRedundantScansSavings,
    });
    setSyncedToProfile(true);
  };

  const handleSyncToDoctorSummary = () => {
    if (!activeReport) return;
    onUpdateDoctorSummary({
      title: activeReport.title,
      findings: activeReport.rawClinicalFindings,
      date: activeReport.date,
      hospital: activeReport.hospitalName,
      patientName: activeMember.name,
    });
    setSyncedToDoctorSummary(true);
  };

  const readReportVoice = () => {
    if (!activeReport) return;
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `${activeReport.title}. Simple explanation: ${activeReport.simpleVillageExplanation}. Recommendations: ${activeReport.aiRecommendations.join('. ')}.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-400/20 border border-indigo-300/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-bold">
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Diagnostic Report & X-Ray AI Decoder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Medical Report & X-Ray Analyser (  )
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Scan or upload any medical report, blood lab sheet, ultrasound, or chest X-ray. The AI translates complex clinical jargon into simple village language, syncs to your profile, and updates the Doctor Summary so you never pay for duplicate scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectPreset(presets[0])}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Chest X-Ray Demo</span>
            </button>
            <button
              onClick={onNavigateToAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs shadow transition-all"
            >
              <span>Ask AI Specialist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Profile Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">Select Patient Profile:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFamilyId === m.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.age} yrs - {m.relationship})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Upload & Presets + AI Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Upload & Sample Preset Reports */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              <span>Scan or Upload New Report</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              PDF, JPG, PNG, DICOM
            </span>
          </div>

          {/* Upload Area */}
          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
            <UploadCloud className="w-8 h-8 text-indigo-500" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Click to upload or take a photo of report</span>
              <span className="text-[11px] text-slate-500">Supports Chest X-rays, Blood CBC, Ultrasound, ECG & Prescriptions</span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCustomFileUploaded(file.name);
                  handleSelectPreset(presets[0]);
                }
              }}
              className="hidden"
            />
          </label>

          {customFileUploaded && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
              <span>Uploaded: {customFileUploaded}</span>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}

          {/* Presets List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Or Choose a Pre-Loaded Diagnostic Report Demo:
            </span>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                    activeReport?.id === preset.id
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 text-indigo-950 font-black'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="font-bold block truncate">{preset.title}</span>
                    <span className="text-[10px] text-slate-500 block">{preset.hospitalName} • {preset.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700 shrink-0">
                    {preset.reportType}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: AI Breakdown & Synchronization */}
        <div className="lg:col-span-7 space-y-6">
          {activeReport ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                      {activeReport.reportType} Verified
                    </span>
                    <span className="text-xs text-slate-500">{activeReport.date}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {activeReport.title}
                  </h2>
                  <span className="text-xs text-slate-500">{activeReport.hospitalName}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={readReportVoice}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{speaking ? 'Stop Voice' : '🔊 Listen'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Plain Village Language Explanation */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                <span className="font-black text-emerald-950 block text-sm">
                  💡 Plain Village-Language Explanation (   ):
                </span>
                <p className="text-emerald-900 leading-relaxed text-xs pt-1">{activeReport.simpleVillageExplanation}</p>
              </div>

              {/* 2. Abnormal Flags & Clinical Numbers */}
              {activeReport.abnormalFlags.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-black text-slate-900 block">Out-of-Range Test Parameters:</span>
                  <div className="space-y-2">
                    {activeReport.abnormalFlags.map((flag, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <strong className="text-amber-950 font-black">{flag.item}: {flag.value}</strong>
                          <span className="text-slate-500 text-[11px] block">Normal Expected: {flag.normalRange}</span>
                        </div>
                        <span className="text-[11px] text-amber-900 font-semibold bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                          {flag.interpretation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Raw Clinical Findings from Document */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block">
                  Original Radiologist / Lab Text Extracted:
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-700 text-[11px]">
                  {activeReport.rawClinicalFindings.map((finding, idx) => (
                    <li key={idx} className="leading-relaxed">{finding}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Cost Savings & Anti-Redundant Scans Alert */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black text-indigo-950 block">Economic Protection for Poor Villagers:</span>
                  <span className="text-indigo-800 text-[11px]">{activeReport.preventRedundantScansSavings}</span>
                </div>
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-bold text-[10px] shrink-0">
                  Zero Repeat Scans
                </span>
              </div>

              {/* 5. Synchronize Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSyncToProfile}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow ${
                    syncedToProfile
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{syncedToProfile ? 'Updated to Patient Profile ✓' : '1. Update Patient Profile'}</span>
                </button>

                <button
                  onClick={handleSyncToDoctorSummary}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow ${
                    syncedToDoctorSummary
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{syncedToDoctorSummary ? 'Updated to Doctor Summary ✓' : '2. Update Doctor Summary'}</span>
                </button>

                {onOpenCommunicationCenterForPatient && (
                  <button
                    onClick={() => onOpenCommunicationCenterForPatient(activeMember.id)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Share Report</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={onNavigateToDoctorSummary}
                  className="text-xs text-indigo-700 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Go to Doctor Clinical Summary Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-12 border-2 border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-black text-slate-800">Select a Diagnostic Report to Decode</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose from Chest X-Ray, Blood CBC, Gestational Ultrasound, or Fasting Sugar reports to see automatic AI decoding and instant doctor summary synchronization.
                </p>
              </div>
              <button
                onClick={() => handleSelectPreset(presets[0])}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Launch Chest X-Ray Analysis Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
