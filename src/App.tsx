import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { DirectorySearchFilter } from './components/DirectorySearchFilter';
import { DoctorDirectory } from './components/DoctorDirectory';
import { HospitalDirectory } from './components/HospitalDirectory';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { HospitalProfileModal } from './components/HospitalProfileModal';
import { DirectionsModal } from './components/DirectionsModal';
import { SmartReferralTracker } from './components/SmartReferralTracker';
import { DoctorHandoffSummary } from './components/DoctorHandoffSummary';
import { HospitalContactCenter } from './components/HospitalContactCenter';
import { FamilyHealthSelector } from './components/FamilyHealthSelector';
import { HealthJourneyWorkflow } from './components/HealthJourneyWorkflow';
import { SimpleModeView } from './components/SimpleModeView';
import { EmergencyModal } from './components/EmergencyModal';
import { DashboardPage } from './components/DashboardPage';
import { A2AWorkflow } from './components/A2AWorkflow';
import { AskMedoraAI } from './components/AskMedoraAI';
import { ChildrenCarePage } from './components/ChildrenCarePage';
import { MaternityCarePage } from './components/MaternityCarePage';
import { ElderlyCarePage } from './components/ElderlyCarePage';
import { DiseaseDirectoryPage } from './components/DiseaseDirectoryPage';
import { AICameraScanner } from './components/AICameraScanner';
import { MedicineScanner } from './components/MedicineScanner';
import { MedicalReportScanner } from './components/MedicalReportScanner';
import { HospitalVillagePortal } from './components/HospitalVillagePortal';
import { GovernmentSchemesPage } from './components/GovernmentSchemesPage';
import { EmergencyMapPage } from './components/EmergencyMapPage';
import { AddNewReportModal } from './components/AddNewReportModal';

import { MOCK_DOCTORS, MOCK_HOSPITALS, MOCK_REFERRALS, MOCK_HEALTH_SUMMARY, MOCK_FAMILY_MEMBERS, MOCK_CARE_GAPS } from './data/mockData';
import { Doctor, Hospital, Referral, ReferralStatus, Specialization, LanguageCode, CareGap } from './types';
import { ShieldCheck, Heart, Info, Check, Sparkles } from 'lucide-react';
import { translatePage } from './i18n/pageTranslator';

export function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dataset.language = currentLang;
    void translatePage(currentLang, lowDataMode);
  }, [currentLang, lowDataMode]);
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'children'
    | 'maternity'
    | 'elderly'
    | 'diseases'
    | 'camera'
    | 'medicine'
    | 'reports'
    | 'ai'
    | 'a2a'
    | 'handoff'
    | 'portal'
    | 'schemes'
    | 'emergency'
    | 'hospitals'
    | 'referrals'
    | 'journey'
  >('dashboard');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState<boolean>(false);
  const [customReports, setCustomReports] = useState<any[]>([]);
  const [clinicalHealthSummary, setClinicalHealthSummary] = useState(MOCK_HEALTH_SUMMARY);

  // Directory Filter States
  const [filters, setFilters] = useState({
    query: '',
    specialty: '',
    hospitalType: '',
    language: '',
    consultationType: '',
    location: '',
    isGovernmentOnly: false,
    isEmergencyOnly: false,
  });

  // Data Collections (Reactive State)
  const [doctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [hospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [activeReferralId, setActiveReferralId] = useState<string>(MOCK_REFERRALS[0].id);
  const [familyMembers] = useState(MOCK_FAMILY_MEMBERS);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(MOCK_FAMILY_MEMBERS[0].id);
  const [careGaps] = useState<CareGap[]>(MOCK_CARE_GAPS);

  // Active Modals State
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null);
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState<Hospital | null>(null);
  const [hospitalForDirections, setHospitalForDirections] = useState<Hospital | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpec = doc.specialization.toLowerCase().includes(q);
        const matchesHosp = doc.hospitalName.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesHosp) return false;
      }
      if (filters.specialty && doc.specialization !== filters.specialty) return false;
      if (filters.language && !doc.languages.includes(filters.language)) return false;
      if (filters.consultationType) {
        if (filters.consultationType === 'In-person' && doc.consultationType === 'Teleconsultation') return false;
        if (filters.consultationType === 'Teleconsultation' && doc.consultationType === 'In-person') return false;
      }
      if (filters.location && !doc.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
  }, [doctors, filters]);

  // Filtered Hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hosp) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesName = hosp.name.toLowerCase().includes(q);
        const matchesType = hosp.type.toLowerCase().includes(q);
        const matchesDepts = hosp.departments.some(d => d.toLowerCase().includes(q));
        if (!matchesName && !matchesType && !matchesDepts) return false;
      }
      if (filters.hospitalType && hosp.type !== filters.hospitalType) return false;
      if (filters.isGovernmentOnly && !hosp.ayushmanBharatEmpanelled && hosp.type !== 'Government Hospital' && hosp.type !== 'Primary Health Centre' && hosp.type !== 'Community Health Centre') return false;
      if (filters.isEmergencyOnly && !hosp.verifiedEmergency && hosp.type !== 'Emergency Care') return false;
      if (filters.location && !hosp.address.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
  }, [hospitals, filters]);

  // Active Referral
  const activeReferral = referrals.find(r => r.id === activeReferralId) || referrals[0];

  // Referral Handlers
  const handleConnectDoctorToReferral = (doctor: Doctor) => {
    setReferrals(prev => prev.map(ref => {
      if (ref.id === activeReferralId) {
        return {
          ...ref,
          selectedDoctorId: doctor.id,
          selectedDoctorName: doctor.name,
          specialty: doctor.specialization,
          contactInfo: doctor.contactPhone,
          status: ref.status === 'Pending' ? 'Facility Selected' : ref.status,
          lastUpdated: '2026-09-10'
        };
      }
      return ref;
    }));
    showToast(`Connected ${doctor.name} to referral for ${activeReferral?.patientName}!`);
  };

  const handleSelectHospitalForReferral = (hospital: Hospital) => {
    setReferrals(prev => prev.map(ref => {
      if (ref.id === activeReferralId) {
        return {
          ...ref,
          selectedHospitalId: hospital.id,
          selectedHospitalName: hospital.name,
          status: 'Facility Selected',
          lastUpdated: '2026-09-10'
        };
      }
      return ref;
    }));
    showToast(`Selected ${hospital.name} for referral!`);
  };

  const handleUpdateReferralStatus = (id: string, newStatus: ReferralStatus) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, lastUpdated: '2026-09-10' } : r));
    showToast(`Referral status updated to: ${newStatus}`);
  };

  const handleCreateReferral = (newRef: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const id = `ref-${Date.now().toString().slice(-4)}`;
    const created: Referral = {
      ...newRef,
      id,
      createdAt: '2026-09-10',
      lastUpdated: '2026-09-10'
    };
    setReferrals(prev => [created, ...prev]);
    setActiveReferralId(id);
    setActiveTab('referrals');
    showToast(`Created new referral for ${created.patientName}`);
  };

  // 1-Click Family Health Filter Trigger
  const handleFilterByFamilyCategory = (cat: Specialization, memberId: string) => {
    setSelectedFamilyId(memberId);
    setFilters(prev => ({ ...prev, specialty: cat, query: '' }));
    setActiveTab('dashboard');
    showToast(`Filtered doctors for ${cat}`);
  };

  const handleFindHospitalForFamilyMember = (memberId: string) => {
    setSelectedFamilyId(memberId);
    setActiveTab('hospitals');
    showToast('Browsing empanelled healthcare facilities');
  };

  // Care Gap to Referral Trigger
  const handleTriggerReferralFromGap = (gap: CareGap) => {
    handleCreateReferral({
      patientId: gap.patientId,
      patientName: gap.patientName,
      patientAge: 68,
      patientGender: 'Male',
      reason: `${gap.title}: ${gap.description}`,
      specialty: gap.specialtyNeeded,
      priority: gap.severity === 'Immediate' ? 'Immediate' : 'Urgent',
      contactInfo: '+91 94481 00223',
      status: 'Pending',
      careGapId: gap.id,
      notes: `Automated care gap conversion. Action required: ${gap.recommendedAction}`
    });
  };

  const handleSaveReport = (report: any) => {
    setCustomReports(prev => [report, ...prev]);
    showToast(`Diagnostic report "${report.title}" saved to ${report.patientName}'s profile!`);
  };

  const handleSaveScanToProfile = (scan: any) => {
    setCustomReports(prev => [scan, ...prev]);
    showToast(`AI Camera Scan for ${scan.diseaseName} added to ${scan.patientName}'s medical record!`);
  };

  const handleUpdateDoctorSummaryWithReport = (report: any) => {
    setClinicalHealthSummary(prev => ({
      ...prev,
      testInfo: {
        ...prev.testInfo,
        importantFollowUpItems: [
          `Verified Recent Test: ${report.title} (${report.date}) at ${report.hospital}. No repeat scan needed.`,
          ...prev.testInfo.importantFollowUpItems,
        ]
      }
    }));
    showToast(`Doctor Summary updated with ${report.title} to prevent repeat scan costs!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        simpleMode={simpleMode}
        onToggleSimpleMode={() => setSimpleMode(!simpleMode)}
        lowDataMode={lowDataMode}
        onToggleLowDataMode={() => setLowDataMode(!lowDataMode)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        activeTab={activeTab}
        onSelectTab={(t: any) => setActiveTab(t)}
        familyMembers={familyMembers}
        selectedFamilyId={selectedFamilyId}
        onSelectFamilyMember={setSelectedFamilyId}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {simpleMode ? (
          /* Simple Mode View */
          <SimpleModeView
            onFindDoctor={() => {
              setSimpleMode(false);
              setActiveTab('dashboard');
            }}
            onFindHospital={() => {
              setSimpleMode(false);
              setActiveTab('hospitals');
            }}
            onCallQuick={() => {
              window.location.href = 'tel:+918029876540';
            }}
            onOpenDirections={() => {
              setHospitalForDirections(hospitals[0]);
            }}
            onOpenWebsite={() => {
              window.open('https://demo-mohfw.gov.in', '_blank');
            }}
            onOpenReferral={() => {
              setSimpleMode(false);
              setActiveTab('referrals');
            }}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            currentLang={currentLang}
          />
        ) : (
          /* Standard Full Experience */
          <>
            {/* 1. Dedicated Master Dashboard Page (Includes All Contents) */}
            {activeTab === 'dashboard' && (
              <DashboardPage
                doctors={doctors}
                hospitals={hospitals}
                referrals={referrals}
                activeReferralId={activeReferralId}
                onSelectActiveReferral={setActiveReferralId}
                onUpdateReferralStatus={handleUpdateReferralStatus}
                onCreateReferral={handleCreateReferral}
                healthSummary={clinicalHealthSummary}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onSelectDoctor={setSelectedDoctorForModal}
                onSelectHospital={setSelectedHospitalForModal}
                onOpenDirections={(hosp) => setHospitalForDirections(hosp)}
                onConnectDoctorToReferral={handleConnectDoctorToReferral}
                onSelectHospitalForReferral={handleSelectHospitalForReferral}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onShowToast={showToast}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToChildren={() => setActiveTab('children')}
                onNavigateToMaternity={() => setActiveTab('maternity')}
                onNavigateToElderly={() => setActiveTab('elderly')}
                onNavigateToDiseases={() => setActiveTab('diseases')}
                onNavigateToCameraScanner={() => setActiveTab('camera')}
                onNavigateToReportScanner={() => setActiveTab('reports')}
                onNavigateToHospitalPortal={() => setActiveTab('portal')}
                onNavigateToGovtSchemes={() => setActiveTab('schemes')}
                onNavigateToEmergencyMap={() => setActiveTab('emergency')}
                onNavigateToA2A={() => setActiveTab('a2a')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenAddReportModal={() => setIsAddReportModalOpen(true)}
                currentLang={currentLang}
              />
            )}

            {/* Children Care Hub */}
            {activeTab === 'children' && (
              <ChildrenCarePage
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenReportScanner={() => setActiveTab('reports')}
              />
            )}

            {/* Maternity & Newborn Care Hub */}
            {activeTab === 'maternity' && (
              <MaternityCarePage
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenReportScanner={() => setActiveTab('reports')}
              />
            )}

            {/* Elderly Care Hub */}
            {activeTab === 'elderly' && (
              <ElderlyCarePage
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenReportScanner={() => setActiveTab('reports')}
              />
            )}

            {/* Rural Diseases Guide */}
            {activeTab === 'diseases' && (
              <DiseaseDirectoryPage
                currentLang={currentLang}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToCameraScanner={() => setActiveTab('camera')}
              />
            )}

            {/* AI Camera Disease Scanner */}
            {activeTab === 'camera' && (
              <AICameraScanner
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onSaveScanToProfile={handleSaveScanToProfile}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onNavigateToAI={() => setActiveTab('ai')}
              />
            )}

            {/* Offline Medicine Label Checker */}
            {activeTab === 'medicine' && (
              <MedicineScanner
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
              />
            )}

            {/* Medical Report & X-Ray Analyser */}
            {activeTab === 'reports' && (
              <MedicalReportScanner
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onUpdatePatientProfile={handleSaveReport}
                onUpdateDoctorSummary={handleUpdateDoctorSummaryWithReport}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onNavigateToAI={() => setActiveTab('ai')}
              />
            )}

            {/* Hospital Portal & Village Registry */}
            {activeTab === 'portal' && (
              <HospitalVillagePortal
                currentLang={currentLang}
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                onSelectFamilyMember={setSelectedFamilyId}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
              />
            )}

            {/* Government Health Schemes & Funding */}
            {activeTab === 'schemes' && (
              <GovernmentSchemesPage
                currentLang={currentLang}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToEmergencyMap={() => setActiveTab('emergency')}
              />
            )}

            {/* Emergency & Hospital Transit Maps */}
            {activeTab === 'emergency' && (
              <EmergencyMapPage
                currentLang={currentLang}
                hospitals={hospitals}
                onSelectHospital={setSelectedHospitalForModal}
                onOpenDirections={setHospitalForDirections}
                onNavigateToAI={() => setActiveTab('ai')}
              />
            )}

            {/* 2. A2A (Agent-to-Agent) Multi-Agent Workflow Tab */}
            {activeTab === 'a2a' && (
              <A2AWorkflow
                onNavigateToReferral={() => setActiveTab('referrals')}
                onNavigateToDoctorHandoff={() => setActiveTab('handoff')}
                currentLang={currentLang}
              />
            )}

            {/* Ask Medora AI Tab */}
            {activeTab === 'ai' && (
              <AskMedoraAI
                familyMembers={familyMembers}
                selectedFamilyId={selectedFamilyId}
                currentLang={currentLang}
                onNavigateToDoctor={() => setActiveTab('dashboard')}
                onNavigateToHospital={() => setActiveTab('hospitals')}
                onNavigateToReferral={() => setActiveTab('referrals')}
                onNavigateToHandoff={() => setActiveTab('handoff')}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                lowDataMode={lowDataMode}
              />
            )}

            {/* Health Journey Workflow Tab */}
            {activeTab === 'journey' && (
              <HealthJourneyWorkflow
                careGaps={careGaps}
                onTriggerReferralFromGap={handleTriggerReferralFromGap}
                onNavigateToFindDoctor={() => setActiveTab('dashboard')}
                onNavigateToFindHospital={() => setActiveTab('hospitals')}
                onOpenDoctorHandoff={() => setActiveTab('handoff')}
                currentLang={currentLang}
              />
            )}

            {/* Referrals Manager Tab */}
            {activeTab === 'referrals' && (
              <SmartReferralTracker
                referrals={referrals}
                activeReferralId={activeReferralId}
                onSelectActiveReferral={setActiveReferralId}
                onUpdateReferralStatus={handleUpdateReferralStatus}
                onCreateReferral={handleCreateReferral}
                onBrowseDoctorsForSpecialty={(spec) => {
                  setFilters(prev => ({ ...prev, specialty: spec }));
                  setActiveTab('dashboard');
                }}
                onBrowseHospitals={() => setActiveTab('hospitals')}
                onOpenDoctorHandoff={() => setActiveTab('handoff')}
                doctors={doctors}
                hospitals={hospitals}
                familyMembers={familyMembers}
                currentLang={currentLang}
              />
            )}

            {/* Doctor Handoff Tab */}
            {activeTab === 'handoff' && (
              <DoctorHandoffSummary
                summary={clinicalHealthSummary}
                currentLang={currentLang}
              />
            )}

            {/* Hospitals Directory Tab */}
            {activeTab === 'hospitals' && (
              <div className="space-y-6">
                {/* Family Health Selector Quick-Navigation Strip */}
                <FamilyHealthSelector
                  familyMembers={familyMembers}
                  selectedFamilyId={selectedFamilyId}
                  onSelectFamilyMember={setSelectedFamilyId}
                  onFilterByMemberCategory={handleFilterByFamilyCategory}
                  onFindHospitalForMember={handleFindHospitalForFamilyMember}
                  currentLang={currentLang}
                />

                {/* Search & Multi-Filter Component */}
                <DirectorySearchFilter
                  filters={filters}
                  onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
                  onResetFilters={() => setFilters({
                    query: '',
                    specialty: '',
                    hospitalType: '',
                    language: '',
                    consultationType: '',
                    location: '',
                    isGovernmentOnly: false,
                    isEmergencyOnly: false,
                  })}
                  currentLang={currentLang}
                  totalDoctors={filteredDoctors.length}
                  totalHospitals={filteredHospitals.length}
                  activeTab="hospitals"
                  onSelectTab={(tab: any) => setActiveTab(tab)}
                />

                {/* Directory Content: Hospitals */}
                <HospitalDirectory
                  hospitals={filteredHospitals}
                  onSelectHospital={setSelectedHospitalForModal}
                  onViewDoctorsAtHospital={(hospId) => {
                    const hosp = hospitals.find(h => h.id === hospId);
                    if (hosp) {
                      setFilters(prev => ({ ...prev, query: hosp.name }));
                      setActiveTab('dashboard');
                    }
                  }}
                  onOpenDirections={setHospitalForDirections}
                  onPlanReferralWithHospital={handleSelectHospitalForReferral}
                  currentLang={currentLang}
                  selectedReferralHospitalId={activeReferral?.selectedHospitalId}
                />

                {/* Hospital Contact Center Hub */}
                <HospitalContactCenter
                  onCallHospitalQuick={() => {
                    window.location.href = 'tel:+918029876540';
                  }}
                  onContactDoctorQuick={() => {
                    setSelectedDoctorForModal(doctors[0]);
                  }}
                  onEmergencySupport={() => setIsEmergencyOpen(true)}
                  onViewReferral={() => setActiveTab('referrals')}
                  onViewHealthSummary={() => setActiveTab('handoff')}
                  hospitals={hospitals}
                  currentLang={currentLang}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating AI Assistant Quick Action Button */}
      {activeTab !== 'ai' && (
        <button
          onClick={() => setActiveTab('ai')}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
          title="Ask Medora AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-200"></span>
          </span>
          <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-black tracking-wide pr-1">🤖 Ask Medora AI</span>
        </button>
      )}

      {/* Mandatory Safety & Privacy Notice Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">
                  Privacy, Medical Disclaimer & Data Architecture Notice
                </strong>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Medora helps users organize healthcare information and connect with healthcare resources. It does not replace doctors, provide medical diagnosis, or prescribe treatment. Use verified healthcare-provider information when contacting real doctors or hospitals. All demonstration records are labeled <strong>DEMO DATA</strong>.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold shrink-0">
              MEDORA v2.4 RURAL
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© 2026 Medora – Rural Health Continuity Platform. Designed for underserved rural communities.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Heart className="w-3.5 h-3.5 fill-emerald-600" />
                Continuity of Care
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Info className="w-3.5 h-3.5" />
                ABHA & PM-JAY Empanelled
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        hospitals={hospitals}
        currentLang={currentLang}
        onSelectHospital={(hosp) => {
          setSelectedHospitalForModal(hosp);
        }}
      />

      <DoctorProfileModal
        doctor={selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onConnectToReferral={handleConnectDoctorToReferral}
        onViewHospital={(hospId) => {
          const hosp = hospitals.find(h => h.id === hospId);
          if (hosp) setSelectedHospitalForModal(hosp);
        }}
        currentLang={currentLang}
        isConnectedToReferral={activeReferral?.selectedDoctorId === selectedDoctorForModal?.id}
      />

      <HospitalProfileModal
        hospital={selectedHospitalForModal}
        doctorsAtHospital={doctors.filter(d => d.hospitalId === selectedHospitalForModal?.id)}
        onClose={() => setSelectedHospitalForModal(null)}
        onOpenDirections={(hosp) => setHospitalForDirections(hosp)}
        onSelectDoctor={setSelectedDoctorForModal}
        onPlanReferral={handleSelectHospitalForReferral}
        currentLang={currentLang}
        isSelectedForReferral={activeReferral?.selectedHospitalId === selectedHospitalForModal?.id}
      />

      <DirectionsModal
        hospital={hospitalForDirections}
        onClose={() => setHospitalForDirections(null)}
        currentLang={currentLang}
      />

      {/* Add New Diagnostic Report Modal */}
      <AddNewReportModal
        isOpen={isAddReportModalOpen}
        onClose={() => setIsAddReportModalOpen(false)}
        familyMembers={familyMembers}
        selectedFamilyId={selectedFamilyId}
        onSaveReport={handleSaveReport}
      />
    </div>
  );
}

export default App;
