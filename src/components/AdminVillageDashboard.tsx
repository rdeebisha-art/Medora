import React, { useState, useMemo } from 'react';
import { useMedora } from '../context/MedoraContext';
import { LanguageCode, PatientCategory, PatientProfile, VillageFamily } from '../types';
import { AdminEditPatientModal } from './AdminEditPatientModal';
import { AdminPasswordChangeModal } from './AdminPasswordChangeModal';
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
  KeyRound,
  Archive,
  RotateCcw,
  Edit,
  History,
  Lock,
  LockKeyhole,
  Check,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface AdminVillageDashboardProps {
  currentLang: LanguageCode;
  onNavigateToAI?: () => void;
  onSelectPatientFile?: (patientId: string) => void;
  onOpenLoginModal?: () => void;
}

type AdminSubTab = 'dashboard' | 'patients' | 'families' | 'population' | 'settings';

export const AdminVillageDashboard: React.FC<AdminVillageDashboardProps> = ({
  currentLang,
  onNavigateToAI,
  onSelectPatientFile,
  onOpenLoginModal,
}) => {
  const {
    village,
    families,
    patients,
    activeRole,
    addPatient,
    archivePatient,
    restorePatient,
    permanentDeletePatient,
    editPatient,
    addFamily,
    removeFamily,
    selectPatient,
    addVitalReading,
    addClinicalNote,
    auditLogs,
    networkStatus,
    adminPassword,
  } = useMedora();

  // Active Admin Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('dashboard');

  // Search & Filters for Patient Registry
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('ALL');
  const [registryView, setRegistryView] = useState<'active' | 'archived'>('active');

  // Modals
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [deleteConfirmPatient, setDeleteConfirmPatient] = useState<PatientProfile | null>(null);
  const [archiveConfirmPatient, setArchiveConfirmPatient] = useState<PatientProfile | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
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
    rationCardType: 'BPL (Priority)' as 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL',
    address: '',
    primaryPhone: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Strict Role Protection Guard
  if (activeRole !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-lg border border-red-200 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Access Restricted — Admin Permissions Required</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The Village Population, Demographic Registry, and Gram Panchayat Health Administration tools require verified <strong>Administrator</strong> credentials. You are currently browsing in <strong>{activeRole.toUpperCase()}</strong> mode.
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 max-w-md mx-auto">
          <span>Demo Account Credentials:</span>
          <div className="mt-1 font-mono font-bold text-slate-800">
            Username: <span className="text-emerald-700">admin</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Please log out or switch role to Administrator to proceed.
          </div>
        </div>
        <div>
          <button
            onClick={onOpenLoginModal}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In as Admin</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Dynamic Population Calculations
  const activePatients = useMemo(() => patients.filter(p => !p.isArchived), [patients]);
  const archivedPatients = useMemo(() => patients.filter(p => p.isArchived), [patients]);

  const stats = useMemo(() => {
    return {
      totalPopulation: activePatients.length,
      totalFamilies: families.length,
      totalPatients: patients.length,
      activeCount: activePatients.length,
      archivedCount: archivedPatients.length,
      adults: activePatients.filter(p => p.category === 'adult').length,
      children: activePatients.filter(p => p.category === 'child').length,
      elderly: activePatients.filter(p => p.category === 'elderly').length,
      maternal: activePatients.filter(p => p.category === 'maternity').length,
      highRiskCount: activePatients.filter(p => p.hasCareGap || p.chronicConditions.length > 1).length,
      recentRegistrations: activePatients.slice(0, 4),
    };
  }, [activePatients, archivedPatients, families, patients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    const list = registryView === 'active' ? activePatients : archivedPatients;
    return list.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.patientId.toLowerCase().includes(q) || 
        p.healthId.toLowerCase().includes(q);
      const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
      const matchesFamily = selectedFamilyFilter === 'ALL' || p.familyId === selectedFamilyFilter;
      return matchesSearch && matchesCategory && matchesFamily;
    });
  }, [registryView, activePatients, archivedPatients, searchQuery, selectedCategoryFilter, selectedFamilyFilter]);

  // Handle Add Patient Submit
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim() || !newPatientForm.age) return;

    const created = addPatient({
      name: newPatientForm.name.trim(),
      age: parseInt(newPatientForm.age, 10),
      gender: newPatientForm.gender,
      category: newPatientForm.category,
      relationship: newPatientForm.relationship,
      familyId: newPatientForm.familyId,
      bloodGroup: newPatientForm.bloodGroup,
      chronicConditions: newPatientForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      allergies: newPatientForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      initialBpSys: newPatientForm.initialBpSys ? parseInt(newPatientForm.initialBpSys, 10) : undefined,
      initialBpDia: newPatientForm.initialBpDia ? parseInt(newPatientForm.initialBpDia, 10) : undefined,
      initialSugar: newPatientForm.initialSugar ? parseInt(newPatientForm.initialSugar, 10) : undefined,
      notes: newPatientForm.notes.trim() || undefined,
    });

    setIsAddPatientModalOpen(false);
    showToast(`Villager ${created.name} (${created.patientId}) registered successfully. Population incremented.`);
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

  // Handle Add Family Submit
  const handleAddFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyForm.familyName.trim() || !newFamilyForm.headOfFamily.trim()) return;

    const created = addFamily(newFamilyForm);
    setIsAddFamilyModalOpen(false);
    showToast(`Household ${created.familyName} (${created.familyId}) created successfully.`);
    setNewFamilyForm({
      familyName: '',
      headOfFamily: '',
      rationCardNumber: '',
      rationCardType: 'BPL (Priority)',
      address: '',
      primaryPhone: '',
    });
  };

  // Handle Archive Confirm
  const handleArchiveConfirm = () => {
    if (!archiveConfirmPatient) return;
    archivePatient(archiveConfirmPatient.patientId, archiveReason);
    showToast(`Patient ${archiveConfirmPatient.name} (${archiveConfirmPatient.patientId}) moved to archived registry.`);
    setArchiveConfirmPatient(null);
    setArchiveReason('');
  };

  // Handle Permanent Delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmPatient) return;
    permanentDeletePatient(deleteConfirmPatient.patientId);
    showToast(`Patient record ${deleteConfirmPatient.patientId} permanently removed.`);
    setDeleteConfirmPatient(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Suite Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 transform skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gram Panchayat Health Administration Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Village Health & Population Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Longitudinal demographic census, household management, vulnerability oversight, and patient archival for <strong>{village.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
            <button
              onClick={() => setIsAddFamilyModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Household</span>
            </button>
            <button
              onClick={() => setIsPasswordChangeModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Change administrator prototype password"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('patients')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'patients'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Registry ({stats.activeCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('families')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'families'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Households ({stats.totalFamilies})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('population')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'population'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Census Demographics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs & Settings</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Dashboard Overview */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Real-time Dynamic Population Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Active Population</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-700">{stats.totalPopulation}</span>
                <span className="text-[10px] text-slate-500 font-bold">Villagers</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Live dynamic count</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Households</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-teal-700">{stats.totalFamilies}</span>
                <span className="text-[10px] text-slate-500 font-bold">Families</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Gram Panchayat</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Elderly (60+)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-amber-600">{stats.elderly}</span>
                <span className="text-[10px] text-slate-500 font-bold">Seniors</span>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold block mt-1">BP & mobility review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Maternal Care</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-rose-600">{stats.maternal}</span>
                <span className="text-[10px] text-slate-500 font-bold">Mothers</span>
              </div>
              <span className="text-[10px] text-rose-700 font-semibold block mt-1">ANC tracking</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Children (0-14)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-sky-600">{stats.children}</span>
                <span className="text-[10px] text-slate-500 font-bold">Infants/Kids</span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold block mt-1">UIP vaccination</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Archived</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-500">{stats.archivedCount}</span>
                <span className="text-[10px] text-slate-400 font-bold">Inactive</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Restorable registry</span>
            </div>
          </div>

          {/* Quick Activity Overview & Recent Registrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Recent Villager Registrations</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('patients')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All Registry →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.recentRegistrations.map((pat) => (
                  <div key={pat.patientId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${pat.avatarBg}`}>
                        {pat.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{pat.name}</span>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            {pat.patientId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {pat.gender}, {pat.age}y • {pat.category.toUpperCase()} • {pat.familyId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPatient(pat);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs"
                        title="Edit Demographics"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          selectPatient(pat.patientId);
                          onSelectPatientFile?.(pat.patientId);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                      >
                        View File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>Recent Administrative Audit Events</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('settings')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View Full Audit Log →
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{log.timestamp.slice(5)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{log.details || `User: ${log.user}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Patients Registry */}
      {activeSubTab === 'patients' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Gram Panchayat Patient Registry</h2>
              <p className="text-xs text-slate-500">
                Official village health records. Search by Patient ID, Name, or ABHA Health ID.
              </p>
            </div>

            {/* Active vs Archived Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setRegistryView('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  registryView === 'active'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Registry ({stats.activeCount})
              </button>
              <button
                onClick={() => setRegistryView('archived')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  registryView === 'archived'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Archived ({stats.archivedCount})
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Patient ID (e.g. P-1001) or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="ALL">All Categories (Maternal, Child, Elderly, Adult)</option>
                <option value="maternity">Maternity Only</option>
                <option value="child">Children (0-14y)</option>
                <option value="elderly">Elderly (60+)</option>
                <option value="adult">Adult</option>
              </select>
            </div>

            <div>
              <select
                value={selectedFamilyFilter}
                onChange={(e) => setSelectedFamilyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="ALL">All Village Households</option>
                {families.map((f) => (
                  <option key={f.familyId} value={f.familyId}>
                    {f.familyName} ({f.familyId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registry Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Patient ID & Name</th>
                  <th className="px-4 py-3">Demographics</th>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">ABHA Health ID</th>
                  <th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No villagers match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((pat) => (
                    <tr key={pat.patientId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${pat.avatarBg}`}>
                            {pat.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{pat.name}</span>
                            <span className="font-mono text-[10px] text-emerald-700 font-bold">{pat.patientId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span>{pat.age} yrs, {pat.gender}</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{pat.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{pat.familyId}</span>
                        <span className="text-[10px] text-slate-500 block">{pat.relationship}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {pat.healthId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {pat.chronicConditions.slice(0, 2).map((c, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingPatient(pat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Demographic Information"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {registryView === 'active' ? (
                            <button
                              onClick={() => setArchiveConfirmPatient(pat)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Archive Patient"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                restorePatient(pat.patientId);
                                showToast(`Patient ${pat.name} (${pat.patientId}) restored to active registry.`);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Restore to Active Registry"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteConfirmPatient(pat)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Permanent Deletion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Households */}
      {activeSubTab === 'families' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Gram Panchayat Household Records</h2>
            <button
              onClick={() => setIsAddFamilyModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Household</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map((fam) => {
              const members = patients.filter(p => fam.memberIds.includes(p.patientId) && !p.isArchived);
              return (
                <div key={fam.familyId} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {fam.familyId}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {members.length} Active Members
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{fam.familyName}</h3>
                    <p className="text-xs text-slate-500">Head: <strong>{fam.headOfFamily}</strong></p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <div>Ration Card: <span className="font-mono font-bold">{fam.rationCardNumber}</span> ({fam.rationCardType})</div>
                    <div>Phone: <span className="font-bold">{fam.primaryPhone}</span></div>
                    <div className="truncate text-slate-500">{fam.address}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Household Members:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((m) => (
                        <button
                          key={m.patientId}
                          onClick={() => {
                            selectPatient(m.patientId);
                            onSelectPatientFile?.(m.patientId);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium"
                        >
                          {m.name} ({m.patientId})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Census Demographics */}
      {activeSubTab === 'population' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Gram Panchayat Population Demographics</h2>
            <p className="text-xs text-slate-500">Census breakdown of registered villagers across Rampur village.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Age & Life-Stage Segregation</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Elderly Population (60+ Years)</span>
                  <span className="font-black text-amber-700">{stats.elderly} ({Math.round((stats.elderly / (stats.totalPopulation || 1)) * 100)}%)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Maternal (Pregnant / Postpartum)</span>
                  <span className="font-black text-rose-700">{stats.maternal} ({Math.round((stats.maternal / (stats.totalPopulation || 1)) * 100)}%)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Children (0 - 14 Years)</span>
                  <span className="font-black text-sky-700">{stats.children} ({Math.round((stats.children / (stats.totalPopulation || 1)) * 100)}%)</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-medium text-slate-700">Adult Working Population</span>
                  <span className="font-black text-emerald-700">{stats.adults} ({Math.round((stats.adults / (stats.totalPopulation || 1)) * 100)}%)</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Vulnerability & Healthcare Gaps</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Vulnerable / Chronic Condition Villagers</span>
                  <span className="font-black text-red-600">{stats.highRiskCount}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Total Households under BPL Cover</span>
                  <span className="font-black text-slate-800">{families.filter(f => f.rationCardType.startsWith('BPL')).length} of {families.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-medium text-slate-700">Primary Health Centre (PHC) Distance</span>
                  <span className="font-bold text-emerald-700">1.4 km (Rampur PHC)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Audit Logs & Settings */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Administrator Security & Password</h2>
              <p className="text-xs text-slate-500">Update prototype admin credentials. Requires verification of current password.</p>
            </div>
            <button
              onClick={() => setIsPasswordChangeModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Admin Password</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Gram Panchayat Administrative Audit Log</h2>
              <p className="text-xs text-slate-500">
                Tamper-evident log of demographic additions, modifications, password updates, and archival events.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">User & Role</th>
                    <th className="px-4 py-3">Affected ID</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <span>{log.user}</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{log.role}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-700">
                        {log.affectedPatientId || log.affectedFamilyId || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-md">
                        {log.details || 'System routine check'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Register New Villager</h3>
                  <p className="text-xs text-slate-500">Auto-generates unique Patient ID & links to Household</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPatientModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Gowda"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="125"
                    placeholder="e.g. 34"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Care Category *</label>
                  <select
                    value={newPatientForm.category}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, category: e.target.value as PatientCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child (0-14y)</option>
                    <option value="elderly">Elderly (60+)</option>
                    <option value="maternity">Maternal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Household *</label>
                  <select
                    value={newPatientForm.familyId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, familyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {families.map((f) => (
                      <option key={f.familyId} value={f.familyId}>
                        {f.familyName} ({f.familyId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={newPatientForm.allergies}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Villager</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Village Household</h3>
                  <p className="text-xs text-slate-500">Register new family into Gram Panchayat</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFamilyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFamilySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Household Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shettigar Household"
                  value={newFamilyForm.familyName}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, familyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Family *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjunath Shettigar"
                  value={newFamilyForm.headOfFamily}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, headOfFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ration Card No.</label>
                  <input
                    type="text"
                    placeholder="e.g. RC-KA-112233"
                    value={newFamilyForm.rationCardNumber}
                    onChange={(e) => setNewFamilyForm({ ...newFamilyForm, rationCardNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Type</label>
                  <select
                    value={newFamilyForm.rationCardType}
                    onChange={(e) => setNewFamilyForm({ ...newFamilyForm, rationCardType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="BPL (Priority)">BPL (Priority)</option>
                    <option value="BPL (Antyodaya)">BPL (Antyodaya)</option>
                    <option value="APL">APL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  placeholder="+91 94481 00000"
                  value={newFamilyForm.primaryPhone}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, primaryPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near Milk Dairy, Sector 3"
                  value={newFamilyForm.address}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Household</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Demographic Modal */}
      <AdminEditPatientModal
        isOpen={editingPatient !== null}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        families={families}
        onSave={editPatient}
        onShowToast={showToast}
      />

      {/* Admin Password Change Modal */}
      <AdminPasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Archive Patient Confirmation Modal */}
      {archiveConfirmPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <Archive className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Archive Patient Record</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to archive <strong>{archiveConfirmPatient.name} ({archiveConfirmPatient.patientId})</strong>?
              Archiving hides the patient from the active village population count while safely preserving their longitudinal medical records in the archived registry.
            </p>
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Reason for Archiving</label>
              <input
                type="text"
                placeholder="e.g. Relocated to city, Temporary out of village"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setArchiveConfirmPatient(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveConfirm}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Archive Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Deletion Confirmation Modal */}
      {deleteConfirmPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Permanent Record Deletion</h3>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-relaxed">
              <strong>WARNING:</strong> Are you sure you want to permanently delete <strong>{deleteConfirmPatient.name} ({deleteConfirmPatient.patientId})</strong>? This action cannot be undone and permanently deletes the patient's identity file from the local registry.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPatient(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
