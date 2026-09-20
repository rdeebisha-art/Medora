import React, { useState, useMemo } from 'react';
import { useMedora } from '../context/MedoraContext';
import { LanguageCode, PatientCategory } from '../types';
import {
  Users,
  Home,
  Baby,
  Heart,
  Activity,
  AlertTriangle,
  UserPlus,
  PlusCircle,
  Search,
  Trash2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Calendar,
  X,
  Plus,
} from 'lucide-react';

interface AdminVillageDashboardProps {
  currentLang: LanguageCode;
  onNavigateToAI?: () => void;
  onSelectPatientFile?: (patientId: string) => void;
}

export const AdminVillageDashboard: React.FC<AdminVillageDashboardProps> = ({
  currentLang,
  onNavigateToAI,
  onSelectPatientFile,
}) => {
  const {
    village,
    families,
    patients,
    addPatient,
    removePatient,
    addFamily,
    removeFamily,
    selectPatient,
    addVitalReading,
    addClinicalNote,
    networkStatus,
  } = useMedora();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('ALL');

  // Modals & Forms
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [quickVitalPatientId, setQuickVitalPatientId] = useState<string | null>(null);
  const [quickNotePatientId, setQuickNotePatientId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    category: 'adult' as PatientCategory,
    relationship: 'Family Member',
    familyId: families[0]?.familyId || 'FAM-01',
    bloodGroup: 'B Positive (B+)',
    chronicConditions: '',
    allergies: '',
    initialBpSys: '',
    initialBpDia: '',
    initialSugar: '',
    notes: '',
  });

  // New Family Form State
  const [newFamilyForm, setNewFamilyForm] = useState({
    familyName: '',
    headOfFamily: '',
    rationCardNumber: '',
    rationCardType: 'BPL (Antyodaya)' as 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL',
    address: '',
    primaryPhone: '+91 ',
  });

  // Quick Vital Form State
  const [vitalForm, setVitalForm] = useState({
    bpSys: 120,
    bpDia: 80,
    sugar: 105,
    spo2: 98,
  });

  // Quick Note State
  const [noteText, setNoteText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-Time Dynamic Village Demographics
  const stats = useMemo(() => {
    const totalPop = patients.length;
    const totalFams = families.length;
    const childrenCount = patients.filter(p => p.category === 'child' || p.age < 12).length;
    const maternalCount = patients.filter(p => p.category === 'maternity').length;
    const elderlyCount = patients.filter(p => p.category === 'elderly' || p.age >= 60).length;
    const chronicCount = patients.filter(p => p.chronicConditions.length > 0 && !p.chronicConditions.includes('None recorded')).length;
    const careGapsCount = patients.reduce((acc, p) => acc + p.careGaps.length, 0);

    return {
      totalPop,
      totalFams,
      childrenCount,
      maternalCount,
      elderlyCount,
      chronicCount,
      careGapsCount,
    };
  }, [patients, families]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.patientId.toLowerCase().includes(q);
        const matchesHealthId = p.healthId.toLowerCase().includes(q);
        const matchesFamId = p.familyId.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesHealthId && !matchesFamId) return false;
      }
      if (selectedCategoryFilter !== 'ALL' && p.category !== selectedCategoryFilter) return false;
      if (selectedFamilyFilter !== 'ALL' && p.familyId !== selectedFamilyFilter) return false;
      return true;
    });
  }, [patients, searchQuery, selectedCategoryFilter, selectedFamilyFilter]);

  // Submit New Patient
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.age) {
      alert('Please fill in required fields: Name and Age');
      return;
    }

    const created = addPatient({
      name: newPatientForm.name,
      age: parseInt(newPatientForm.age, 10),
      gender: newPatientForm.gender,
      category: newPatientForm.category,
      relationship: newPatientForm.relationship,
      familyId: newPatientForm.familyId,
      bloodGroup: newPatientForm.bloodGroup,
      chronicConditions: newPatientForm.chronicConditions ? newPatientForm.chronicConditions.split(',').map(s => s.trim()) : [],
      allergies: newPatientForm.allergies ? newPatientForm.allergies.split(',').map(s => s.trim()) : [],
      initialBpSys: newPatientForm.initialBpSys ? parseInt(newPatientForm.initialBpSys, 10) : undefined,
      initialBpDia: newPatientForm.initialBpDia ? parseInt(newPatientForm.initialBpDia, 10) : undefined,
      initialSugar: newPatientForm.initialSugar ? parseInt(newPatientForm.initialSugar, 10) : undefined,
      notes: newPatientForm.notes,
    });

    setIsAddPatientModalOpen(false);
    showToast(`Registered ${created.name} (${created.patientId})! Village population updated to ${patients.length + 1}.`);

    // Reset Form
    setNewPatientForm({
      name: '',
      age: '',
      gender: 'Male',
      category: 'adult',
      relationship: 'Family Member',
      familyId: families[0]?.familyId || 'FAM-01',
      bloodGroup: 'B Positive (B+)',
      chronicConditions: '',
      allergies: '',
      initialBpSys: '',
      initialBpDia: '',
      initialSugar: '',
      notes: '',
    });
  };

  // Submit New Family
  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyForm.familyName || !newFamilyForm.headOfFamily) {
      alert('Please provide Family Name and Head of Family');
      return;
    }

    const created = addFamily(newFamilyForm);
    setIsAddFamilyModalOpen(false);
    showToast(`Household "${created.familyName}" registered with ID ${created.familyId}!`);

    setNewFamilyForm({
      familyName: '',
      headOfFamily: '',
      rationCardNumber: '',
      rationCardType: 'BPL (Antyodaya)',
      address: '',
      primaryPhone: '+91 ',
    });
  };

  // Handle Delete Patient
  const handleDeletePatient = (patientId: string, name: string) => {
    if (window.confirm(`Are you sure you want to unregister ${name} (${patientId}) from the Gram Panchayat registry?`)) {
      removePatient(patientId);
      showToast(`Removed ${name}. Village population updated to ${patients.length - 1}.`);
    }
  };

  // Handle Quick Vital Log
  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVitalPatientId) return;

    addVitalReading(quickVitalPatientId, {
      date: new Date().toISOString().split('T')[0],
      bloodPressureSys: Number(vitalForm.bpSys),
      bloodPressureDia: Number(vitalForm.bpDia),
      bloodSugarFasting: Number(vitalForm.sugar),
      bloodSugarPostPrandial: Number(vitalForm.sugar) + 35,
      pulseRate: 74,
      weightKg: 64,
      bmi: 23,
      spo2: Number(vitalForm.spo2),
    });

    setQuickVitalPatientId(null);
    showToast(`New vital screening recorded for ${quickVitalPatientId}!`);
  };

  // Handle Quick Clinical Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNotePatientId || !noteText.trim()) return;

    addClinicalNote(quickNotePatientId, noteText.trim());
    setQuickNotePatientId(null);
    setNoteText('');
    showToast(`ASHA clinical progress note recorded!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-4 border border-emerald-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
              <ShieldCheck className="w-4 h-4" />
              <span>Gram Panchayat Health Administration Command</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {village.name} — Population & Demographics
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Real-time rural community healthcare register. Track high-risk maternity cases, pediatric immunization gaps, elderly chronic conditions, and household rosters.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200 font-medium">
              <span>📍 Sub-District: <strong>{village.subDistrict}</strong></span>
              <span>•</span>
              <span>🏥 Primary Centre: <strong>{village.phcName}</strong></span>
              <span>•</span>
              <span>👩‍⚕️ ASHA: <strong>{village.ashaWorker}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register Villager</span>
            </button>
            <button
              onClick={() => setIsAddFamilyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Household</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Demographic Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Population */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>Total Villagers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalPop}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">
            Live Population
          </div>
        </div>

        {/* Households */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>Households</span>
            <Home className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalFams}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Registered Families
          </div>
        </div>

        {/* Children */}
        <div className="bg-white rounded-2xl p-4 border border-sky-200 bg-sky-50/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold mb-1">
            <span>Children & Infants</span>
            <Baby className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-950">
            {stats.childrenCount}
          </div>
          <div className="text-[10px] text-sky-700 font-semibold mt-1">
            Pediatric Cohort
          </div>
        </div>

        {/* Maternal Cases */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold mb-1">
            <span>Maternal / ANC</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-950">
            {stats.maternalCount}
          </div>
          <div className="text-[10px] text-rose-700 font-semibold mt-1">
            Expectant Mothers
          </div>
        </div>

        {/* Elderly */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-1">
            <span>Senior Citizens</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {stats.elderlyCount}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">
            60+ Years Cohort
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="bg-white rounded-2xl p-4 border border-purple-200 bg-purple-50/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-800 text-xs font-bold mb-1">
            <span>NCD Chronic</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950">
            {stats.chronicCount}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">
            HTN / Diabetes / COPD
          </div>
        </div>

        {/* Care Gaps */}
        <div className="bg-white rounded-2xl p-4 border border-red-200 bg-red-50/40 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-red-800 text-xs font-bold mb-1">
            <span>Care Gaps</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-950">
            {stats.careGapsCount}
          </div>
          <div className="text-[10px] text-red-700 font-bold mt-1">
            Action Required
          </div>
        </div>
      </div>

      {/* Search, Filter & Registry Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Gram Panchayat Villagers Registry</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredPatients.length} Active Records
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Strictly indexed by unique IDs (`P-XXXX`) and Family IDs (`FAM-XX`). Zero cross-patient record contamination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Name or Health ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="child">👶 Children (0-12y)</option>
              <option value="maternity">🤰 Maternity / Expectant</option>
              <option value="elderly">👵 Elderly (60+y)</option>
              <option value="adult">🧑 Adults</option>
            </select>

            {/* Family Filter */}
            <select
              value={selectedFamilyFilter}
              onChange={e => setSelectedFamilyFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Households</option>
              {families.map(f => (
                <option key={f.familyId} value={f.familyId}>
                  {f.familyName} ({f.familyId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-3">Villager Name & Age</th>
                <th className="py-3 px-3">Household</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Latest Vitals</th>
                <th className="py-3 px-3">Active Care Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(patient => {
                const latestVital = patient.vitals[0];
                const family = families.find(f => f.familyId === patient.familyId);

                return (
                  <tr key={patient.patientId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Patient ID */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                      <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {patient.patientId}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{patient.healthId}</div>
                    </td>

                    {/* Name & Age */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.hasCareGap ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span>{patient.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {patient.age} yrs • {patient.gender} • {patient.relationship}
                      </div>
                    </td>

                    {/* Household */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{family?.familyName || patient.familyId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{patient.familyId}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          patient.category === 'maternity'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : patient.category === 'child'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : patient.category === 'elderly'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {patient.category === 'maternity' && '🤰 Maternity'}
                        {patient.category === 'child' && '👶 Pediatric'}
                        {patient.category === 'elderly' && '👵 Geriatric'}
                        {patient.category === 'adult' && '🧑 Adult'}
                      </span>
                    </td>

                    {/* Latest Vitals */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {latestVital ? (
                        <div>
                          <span className={latestVital.bloodPressureSys >= 140 ? 'text-amber-700 font-bold' : 'text-slate-800 font-bold'}>
                            BP: {latestVital.bloodPressureSys}/{latestVital.bloodPressureDia}
                          </span>
                          <span className="text-slate-400 ml-1.5">Sugar: {latestVital.bloodSugarFasting}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No vitals recorded</span>
                      )}
                    </td>

                    {/* Active Care Status */}
                    <td className="py-3 px-3">
                      {patient.hasCareGap ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{patient.careGaps[0]?.title || 'Care Gap Detected'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Stable / Up to Date</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          selectPatient(patient.patientId);
                          setQuickVitalPatientId(patient.patientId);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors"
                        title="Log Vitals"
                      >
                        + Vitals
                      </button>

                      <button
                        onClick={() => {
                          selectPatient(patient.patientId);
                          setQuickNotePatientId(patient.patientId);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors"
                        title="Add Note"
                      >
                        + Note
                      </button>

                      <button
                        onClick={() => {
                          selectPatient(patient.patientId);
                          if (onSelectPatientFile) onSelectPatientFile(patient.patientId);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold border border-emerald-200 transition-colors"
                        title="View Medical File"
                      >
                        File
                      </button>

                      <button
                        onClick={() => handleDeletePatient(patient.patientId, patient.name)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Unregister Villager"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Household Register Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Registered Households & Ration Cards</span>
            </h3>
            <p className="text-xs text-slate-500">
              Families mapped to Rampur Gram Panchayat sector blocks.
            </p>
          </div>
          <button
            onClick={() => setIsAddFamilyModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Household</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {families.map(fam => (
            <div key={fam.familyId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{fam.familyName}</span>
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {fam.familyId}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>Head: <strong>{fam.headOfFamily}</strong></div>
                <div>Ration Card: <span className="font-mono text-emerald-700 font-bold">{fam.rationCardNumber}</span> ({fam.rationCardType})</div>
                <div>Address: {fam.address}</div>
                <div>Phone: {fam.primaryPhone}</div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Members: <strong>{fam.memberIds.length}</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedFamilyFilter(fam.familyId);
                    showToast(`Filtered registry for ${fam.familyName}`);
                  }}
                  className="text-emerald-700 hover:underline font-bold text-[11px]"
                >
                  View Members &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register New Villager */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Register New Villager</h3>
                  <p className="text-xs text-slate-500">Auto-generates unique ID and updates village population instantly.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPatientModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientForm.name}
                    onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    placeholder="e.g. Kamala Gowda"
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="115"
                    value={newPatientForm.age}
                    onChange={e => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    placeholder="e.g. 28"
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Care Category</label>
                  <select
                    value={newPatientForm.category}
                    onChange={e => setNewPatientForm({ ...newPatientForm, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="adult">🧑 Adult</option>
                    <option value="maternity">🤰 Maternity (Pregnancy)</option>
                    <option value="child">👶 Child (0-12y)</option>
                    <option value="elderly">👵 Elderly (60+y)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Household</label>
                  <select
                    value={newPatientForm.familyId}
                    onChange={e => setNewPatientForm({ ...newPatientForm, familyId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {families.map(f => (
                      <option key={f.familyId} value={f.familyId}>
                        {f.familyName} ({f.familyId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship in Household</label>
                  <input
                    type="text"
                    value={newPatientForm.relationship}
                    onChange={e => setNewPatientForm({ ...newPatientForm, relationship: e.target.value })}
                    placeholder="e.g. Mother, Son, Grandfather"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={e => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="A Positive (A+)">A Positive (A+)</option>
                    <option value="A Negative (A-)">A Negative (A-)</option>
                    <option value="B Positive (B+)">B Positive (B+)</option>
                    <option value="B Negative (B-)">B Negative (B-)</option>
                    <option value="O Positive (O+)">O Positive (O+)</option>
                    <option value="O Negative (O-)">O Negative (O-)</option>
                    <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                    <option value="AB Negative (AB-)">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Chronic Conditions (Comma-separated)</label>
                <input
                  type="text"
                  value={newPatientForm.chronicConditions}
                  onChange={e => setNewPatientForm({ ...newPatientForm, chronicConditions: e.target.value })}
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Initial Screening Vitals (Optional)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">BP Sys (mmHg)</span>
                    <input
                      type="number"
                      value={newPatientForm.initialBpSys}
                      onChange={e => setNewPatientForm({ ...newPatientForm, initialBpSys: e.target.value })}
                      placeholder="120"
                      className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">BP Dia (mmHg)</span>
                    <input
                      type="number"
                      value={newPatientForm.initialBpDia}
                      onChange={e => setNewPatientForm({ ...newPatientForm, initialBpDia: e.target.value })}
                      placeholder="80"
                      className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Fasting Sugar (mg/dL)</span>
                    <input
                      type="number"
                      value={newPatientForm.initialSugar}
                      onChange={e => setNewPatientForm({ ...newPatientForm, initialSugar: e.target.value })}
                      placeholder="95"
                      className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ASHA Clinical / Intake Note</label>
                <textarea
                  rows={2}
                  value={newPatientForm.notes}
                  onChange={e => setNewPatientForm({ ...newPatientForm, notes: e.target.value })}
                  placeholder="e.g. Initial intake during village door-to-door health survey..."
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Register Villager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Household */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Add New Household</h3>
              </div>
              <button
                onClick={() => setIsAddFamilyModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Household / Family Name *</label>
                <input
                  type="text"
                  required
                  value={newFamilyForm.familyName}
                  onChange={e => setNewFamilyForm({ ...newFamilyForm, familyName: e.target.value })}
                  placeholder="e.g. Hegde Household"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Family *</label>
                <input
                  type="text"
                  required
                  value={newFamilyForm.headOfFamily}
                  onChange={e => setNewFamilyForm({ ...newFamilyForm, headOfFamily: e.target.value })}
                  placeholder="e.g. Manjunath Hegde"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ration Card Number</label>
                  <input
                    type="text"
                    value={newFamilyForm.rationCardNumber}
                    onChange={e => setNewFamilyForm({ ...newFamilyForm, rationCardNumber: e.target.value })}
                    placeholder="RC-KA-XXXXXX"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Type</label>
                  <select
                    value={newFamilyForm.rationCardType}
                    onChange={e => setNewFamilyForm({ ...newFamilyForm, rationCardType: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  >
                    <option value="BPL (Antyodaya)">BPL (Antyodaya)</option>
                    <option value="BPL (Priority)">BPL (Priority)</option>
                    <option value="APL">APL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village Sector / Address</label>
                <input
                  type="text"
                  value={newFamilyForm.address}
                  onChange={e => setNewFamilyForm({ ...newFamilyForm, address: e.target.value })}
                  placeholder="e.g. Near Community Well, Sector 3"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Contact Phone</label>
                <input
                  type="text"
                  value={newFamilyForm.primaryPhone}
                  onChange={e => setNewFamilyForm({ ...newFamilyForm, primaryPhone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Vital Log Modal */}
      {quickVitalPatientId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">
                Record Vitals: {quickVitalPatientId}
              </h3>
              <button onClick={() => setQuickVitalPatientId(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">BP Systolic</label>
                  <input
                    type="number"
                    value={vitalForm.bpSys}
                    onChange={e => setVitalForm({ ...vitalForm, bpSys: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">BP Diastolic</label>
                  <input
                    type="number"
                    value={vitalForm.bpDia}
                    onChange={e => setVitalForm({ ...vitalForm, bpDia: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fasting Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={vitalForm.sugar}
                    onChange={e => setVitalForm({ ...vitalForm, sugar: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitalForm.spo2}
                    onChange={e => setVitalForm({ ...vitalForm, spo2: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md mt-2"
              >
                Save Vital Screening
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {quickNotePatientId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">
                Add Clinical Note: {quickNotePatientId}
              </h3>
              <button onClick={() => setQuickNotePatientId(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Enter community observation, adherence check or symptom report..."
                className="w-full p-2 border rounded-xl"
              />

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
              >
                Save Clinical Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
