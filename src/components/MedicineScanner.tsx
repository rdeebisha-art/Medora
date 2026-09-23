import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Pill, Search, ShieldAlert, UploadCloud } from 'lucide-react';
import { FamilyMember, LanguageCode } from '../types';

interface MedicineScannerProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
}

type MedicineProfile = {
  keywords: string[];
  genericName: string;
  medicineClass: string;
  commonUses: string;
  importantWarnings: string;
  conditionKeywords: string[];
};

const MEDICINE_PROFILES: MedicineProfile[] = [
  { keywords: ['paracetamol', 'acetaminophen'], genericName: 'Paracetamol / Acetaminophen', medicineClass: 'Pain and fever reducer', commonUses: 'Pain or fever relief when appropriate for the person.', importantWarnings: 'Check the label strength and total daily amount. Avoid duplicate paracetamol products and seek advice for liver disease.', conditionKeywords: ['fever', 'pain'] },
  { keywords: ['metformin'], genericName: 'Metformin', medicineClass: 'Blood sugar medicine', commonUses: 'Type 2 diabetes management when prescribed.', importantWarnings: 'Take only as prescribed. A clinician should review kidney function, pregnancy, dehydration, and severe illness.', conditionKeywords: ['diabetes', 'sugar'] },
  { keywords: ['telmisartan', 'amlodipine', 'losartan'], genericName: 'Blood pressure medicine', medicineClass: 'Antihypertensive', commonUses: 'Blood pressure control when prescribed.', importantWarnings: 'Do not start, stop, or change the dose without a clinician. Pregnancy, dizziness, kidney disease, and low blood pressure require review.', conditionKeywords: ['bp', 'blood pressure', 'hypertension', 'pressure'] },
  { keywords: ['cetirizine', 'loratadine'], genericName: 'Antihistamine', medicineClass: 'Allergy symptom medicine', commonUses: 'Allergy symptoms such as sneezing or itching.', importantWarnings: 'May cause drowsiness. Confirm child dose, pregnancy safety, and interactions with sedatives.', conditionKeywords: ['allergy', 'itching', 'rash'] },
  { keywords: ['ibuprofen', 'diclofenac', 'aspirin'], genericName: 'NSAID pain medicine', medicineClass: 'Anti-inflammatory pain medicine', commonUses: 'Some pain or inflammation conditions when specifically advised.', importantWarnings: 'Can worsen stomach bleeding, kidney disease, blood pressure, and some pregnancy risks. Avoid in suspected dengue unless a clinician says otherwise.', conditionKeywords: ['pain', 'inflammation'] },
  { keywords: ['amoxicillin', 'azithromycin', 'doxycycline'], genericName: 'Antibiotic', medicineClass: 'Prescription antimicrobial', commonUses: 'Only specific bacterial infections diagnosed or assessed by a clinician.', importantWarnings: 'Do not self-start, share, or stop early. It does not treat ordinary viral colds and may cause allergy or resistance.', conditionKeywords: ['bacterial infection'] },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

export const MedicineScanner: React.FC<MedicineScannerProps> = ({ currentLang, familyMembers, selectedFamilyId }) => {
  const [labelText, setLabelText] = useState('');
  const [fileName, setFileName] = useState('');
  const [scanResult, setScanResult] = useState<MedicineProfile | null>(null);
  const [isUnclear, setIsUnclear] = useState(false);
  const activeMember = familyMembers.find((member) => member.id === selectedFamilyId) ?? familyMembers[0];
  const conditionText = normalize(activeMember?.activeConditions.join(' ') ?? '');

  const matchedForPatient = useMemo(() => {
    if (!scanResult) return false;
    return scanResult.conditionKeywords.some((keyword) => conditionText.includes(normalize(keyword)));
  }, [conditionText, scanResult]);

  const scanMedicine = () => {
    const searchableText = normalize(`${labelText} ${fileName}`);
    const match = MEDICINE_PROFILES.find((profile) => profile.keywords.some((keyword) => searchableText.includes(normalize(keyword))));
    setScanResult(match ?? null);
    setIsUnclear(!match);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsUnclear(false);
    setScanResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-950 via-cyan-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-start gap-3">
          <Pill className="w-8 h-8 text-cyan-300 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">AI Medicine Label Checker</h1>
            <p className="mt-2 text-sm text-cyan-100 max-w-3xl">Scan or enter a medicine label to identify its medicine class, common use, safety warnings, and whether it matches the selected patient record. This checker does not prescribe a replacement medicine.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black text-slate-900">Check medicine for {activeMember?.name}</h2>
          <span className="text-xs font-bold text-slate-500">Language: {currentLang}</span>
        </div>
        <textarea value={labelText} onChange={(event) => setLabelText(event.target.value)} placeholder="Enter the medicine name or active ingredient from the package..." className="w-full min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none" />
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold cursor-pointer">
            <UploadCloud className="w-4 h-4" /> Upload label photo
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <button onClick={scanMedicine} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold"><Search className="w-4 h-4" /> Check label</button>
        </div>
        {fileName && <p className="text-xs text-slate-500">Selected file: {fileName}. For reliable identification, also type the printed medicine name because this offline checker does not claim to perform OCR.</p>}
      </div>

      {scanResult && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div><span className="text-xs font-black uppercase text-emerald-700">Label match found</span><h2 className="text-2xl font-black text-slate-900">{scanResult.genericName}</h2><p className="text-sm text-slate-600">Class: {scanResult.medicineClass}</p></div>
            {matchedForPatient ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <AlertTriangle className="w-8 h-8 text-amber-500" />}
          </div>
          <div className={`rounded-2xl p-4 text-sm ${matchedForPatient ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
            {matchedForPatient ? 'This medicine class appears related to a condition recorded for this patient, but a clinician must confirm the exact medicine, dose, and suitability.' : 'This medicine class does not clearly match a recorded condition, or the record is incomplete. Do not call it wrong or replace it without a pharmacist or clinician review.'}
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm"><div className="rounded-2xl bg-slate-50 p-4"><strong>Common use</strong><p className="mt-1 text-slate-700">{scanResult.commonUses}</p></div><div className="rounded-2xl bg-rose-50 p-4"><strong className="text-rose-900">Safety warnings</strong><p className="mt-1 text-rose-800">{scanResult.importantWarnings}</p></div></div>
          <p className="flex items-start gap-2 text-xs text-slate-600"><ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />Never use this result to change a prescription. Show the package, prescription, allergies, pregnancy status, and current medicines to a qualified pharmacist or doctor.</p>
        </div>
      )}

      {isUnclear && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"><strong>Medicine not identified.</strong> The label is unclear or not in the offline reference list. Do not guess the medicine or take a suggested replacement. Ask a pharmacist to verify the package and prescription.</div>}
    </div>
  );
};
