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
import { MobileBottomBar } from './components/MobileBottomBar';
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
import { AdminVillageDashboard } from './components/AdminVillageDashboard';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { NetworkSimulatorBar } from './components/NetworkSimulatorBar';
import { LoginPage } from './components/LoginPage';
import { FirstTimeOnboarding } from './components/FirstTimeOnboarding';
import { WhatShouldIDoGuideModal } from './components/WhatShouldIDoGuideModal';
import { HelpModal } from './components/HelpModal';
import { USSDSimulatorModal } from './components/USSDSimulatorModal';
import { VoiceIVRModal } from './components/VoiceIVRModal';
import { VoiceMessageModal } from './components/VoiceMessageModal';
import { BluetoothModal } from './components/BluetoothModal';
import { TwoWayDoctorChatModal } from './components/TwoWayDoctorChatModal';
import { CommunicationCenterModal } from './components/CommunicationCenterModal';
import { OutboxNetworkMonitorBar } from './components/OutboxNetworkMonitorBar';
import { FamilyPage } from './components/FamilyPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { FamilyDashboard } from './components/FamilyDashboard';

import { MedoraProvider, useMedora } from './context/MedoraContext';
import { MOCK_DOCTORS, MOCK_HOSPITALS } from './data/mockData';
import { Doctor, Hospital, Referral, ReferralStatus, Specialization, LanguageCode, CareGap, HealthSummaryReport } from './types';
import { ShieldCheck, Heart, Info, Check, Sparkles } from 'lucide-react';
import { translatePage } from './i18n/pageTranslator';

function MedoraAppContent() {
  const {
    village,
    families,
    patients,
    authSession,
    activeRole,
    switchRole,
    selectedPatientId,
    selectedPatient,
    selectPatient,
    accessibleFamilyMembers,
    referrals,
    activeReferralId,
    setActiveReferralId,
    createReferral,
    updateReferralStatus,
    networkStatus,
    setNetworkStatus,
    isAuthenticated,
    logout,
  } = useMedora();

  const [currentLang, setCurrentLangState] = useState<LanguageCode>(() => {
    try {
      const saved = window.localStorage.getItem('medora_lang') as LanguageCode;
      if (saved && ['en', 'hi', 'te', 'ml', 'ta', 'kn'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setCurrentLang = (lang: LanguageCode) => {
    setCurrentLangState(lang);
    try {
      window.localStorage.setItem('medora_lang', lang);
    } catch {}
  };

  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);
  const [offlineDemoMode, setOfflineDemoMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('medora-offline-demo') === 'true';
    } catch {
      return false;
    }
  });
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  const useOfflineMode = offlineDemoMode || !isOnline || networkStatus === 'OFFLINE';

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dataset.language = currentLang;
    void translatePage(currentLang, lowDataMode || useOfflineMode);
  }, [currentLang, lowDataMode, useOfflineMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'family'
    | 'admin'
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

  // Enforce RBAC boundary: If active role is not 'admin' and tab is 'admin', redirect to 'dashboard'
  useEffect(() => {
    if (activeRole !== 'admin' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeRole, activeTab]);

  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [customReports, setCustomReports] = useState<any[]>([]);

  // Guided Workflow & Simulator Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('medora_has_onboarded') !== 'true';
    } catch {
      return false;
    }
  });
  const [isWhatShouldIDoOpen, setIsWhatShouldIDoOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isUSSDOpen, setIsUSSDOpen] = useState<boolean>(false);
  const [isVoiceIVROpen, setIsVoiceIVROpen] = useState<boolean>(false);
  const [isVoiceMessageOpen, setIsVoiceMessageOpen] = useState<boolean>(false);
  const [isBluetoothOpen, setIsBluetoothOpen] = useState<boolean>(false);
  const [isDoctorChatOpen, setIsDoctorChatOpen] = useState<boolean>(false);
  const [isCommunicationCenterOpen, setIsCommunicationCenterOpen] = useState<boolean>(false);

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

  // Dynamic Clinical Health Summary from centralized patient profile
  const clinicalHealthSummary = useMemo<HealthSummaryReport>(() => {
    const latestVital = selectedPatient.vitals[0] || {
      date: '2026-09-09',
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      bloodSugarFasting: 100,
      bloodSugarPostPrandial: 130,
      pulseRate: 74,
      weightKg: 64,
      bmi: 23,
      spo2: 98,
    };

    return {
      patientInfo: {
        name: selectedPatient.name,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
        healthId: selectedPatient.healthId,
        village: village.name,
        district: `${village.district}, ${village.state}`,
        bloodGroup: selectedPatient.bloodGroup,
        allergies: selectedPatient.allergies,
        contactPhone: '+91 94481 00223',
        emergencyContact: village.emergencyContacts[0] ? `${village.emergencyContacts[0].service} (${village.emergencyContacts[0].number})` : '+91 80298 76540',
      },
      medicalInfo: {
        medicalHistory: selectedPatient.chronicConditions.map(c => `Diagnosed ${c}`),
        existingConditions: selectedPatient.chronicConditions,
        currentMedicines: selectedPatient.medicines,
        overallAdherence: selectedPatient.medicines.length ? Math.round(selectedPatient.medicines.reduce((acc, m) => acc + m.adherenceRate, 0) / selectedPatient.medicines.length) : 90,
        recentSymptoms: selectedPatient.category === 'elderly' ? ['Morning occipital headache', 'Right knee stiffness'] : ['None acutely reported'],
        recentMeasurements: latestVital,
      },
      testInfo: {
        recentTests: selectedPatient.labTests,
        historicalTrendsSummary: `${selectedPatient.labTests.length} clinical laboratory evaluations documented in Medora registry.`,
        importantFollowUpItems: selectedPatient.preventiveTasks.map(t => `${t.title} (${t.status})`),
      },
      preventiveHealthcare: {
        vaccinationStatus: selectedPatient.category === 'child' ? (selectedPatient.childDetails?.immunizationStatus || 'Routine Schedule') : 'Up to date with seasonal guidelines.',
        preventiveTasks: selectedPatient.preventiveTasks,
        missedOverdueActions: selectedPatient.careGaps.map(g => g.title),
      },
      referralInfo: {
        currentReferral: referrals.find(r => r.patientId === selectedPatient.patientId) || referrals[0],
        previousReferrals: [],
        referralStatus: selectedPatient.referrals[0]?.status || 'Standard Monitoring',
        followUpRequirements: selectedPatient.careGaps[0]?.recommendedAction || 'Maintain regular rural PHC visits.',
      },
      healthAnalytics: {
        vitalTrends: selectedPatient.vitals,
        adherenceHistory: [
          { month: 'May', rate: 94 },
          { month: 'Jun', rate: 91 },
          { month: 'Jul', rate: 88 },
          { month: 'Aug', rate: 84 },
          { month: 'Sep', rate: 82 },
        ],
        healthManagementScore: selectedPatient.hasCareGap ? 72 : 94,
      },
      aiSummary: {
        keyObservations: selectedPatient.careGaps.map(g => g.description),
        careGaps: selectedPatient.careGaps.map(g => g.title),
        medicationAdherenceIssues: selectedPatient.medicines.filter(m => m.status === 'Missed Dosage').map(m => `Missed dosage reported for ${m.name}`),
        preventiveCareGaps: selectedPatient.preventiveTasks.filter(t => t.status === 'Overdue').map(t => t.title),
        suggestedDoctorQuestions: [
          `What is the recommended next step for ${selectedPatient.name}'s ${selectedPatient.primaryCategory} care?`,
          'Are there lifestyle adjustments suitable for rural conditions?',
        ],
        disclaimer: 'AI-GENERATED DECISION SUPPORT â€” NOT A MEDICAL DIAGNOSIS. The AI must never claim to diagnose the patient. Clinical evaluation by a qualified doctor is required.',
      },
    };
  }, [selectedPatient, village, referrals]);

  // Care gaps for journey workflow
  const careGaps: CareGap[] = useMemo(() => {
    return selectedPatient.careGaps;
  }, [selectedPatient]);

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
    updateReferralStatus(activeReferralId, 'Facility Selected');
    showToast(`Connected ${doctor.name} to referral for ${activeReferral?.patientName}!`);
  };

  const handleSelectHospitalForReferral = (hospital: Hospital) => {
    updateReferralStatus(activeReferralId, 'Facility Selected');
    showToast(`Selected ${hospital.name} for referral!`);
  };

  const handleUpdateReferralStatus = (id: string, newStatus: ReferralStatus) => {
    updateReferralStatus(id, newStatus);
    showToast(`Referral status updated to: ${newStatus}`);
  };

  const handleCreateReferral = (newRef: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const created = createReferral(newRef);
    setActiveReferralId(created.id);
    setActiveTab('referrals');
    showToast(`Created new referral for ${created.patientName}`);
  };

  // 1-Click Family Health Filter Trigger
  const handleFilterByFamilyCategory = (cat: Specialization, memberId: string) => {
    selectPatient(memberId);
    setFilters(prev => ({ ...prev, specialty: cat, query: '' }));
    setActiveTab('dashboard');
    showToast(`Filtered doctors for ${cat}`);
  };

  const handleFindHospitalForFamilyMember = (memberId: string) => {
    selectPatient(memberId);
    setActiveTab('hospitals');
    showToast('Browsing empanelled healthcare facilities');
  };

  // Care Gap to Referral Trigger
  const handleTriggerReferralFromGap = (gap: CareGap) => {
    handleCreateReferral({
      patientId: gap.patientId,
      patientName: gap.patientName,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      reason: `${gap.title}: ${gap.description}`,
      specialty: gap.specialtyNeeded,
      priority: gap.severity === 'Immediate' ? 'Immediate' : 'Urgent',
      contactInfo: '+91 94481 00223',
      status: 'Pending',
      careGapId: gap.id,
      notes: `Automated care gap conversion. Action required: ${gap.recommendedAction}`,
    });
  };

  const handleSaveReport = (report: any) => {
    setCustomReports(prev => [report, ...prev]);
    showToast(`Diagnostic report "${report.title}" saved to ${report.patientName || selectedPatient.name}'s profile!`);
  };

  const handleSaveScanToProfile = (scan: any) => {
    setCustomReports(prev => [scan, ...prev]);
    showToast(`AI Camera Scan for ${scan.diseaseName} added to ${scan.patientName || selectedPatient.name}'s medical record!`);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
          hospitals={hospitals}
          currentLang={currentLang}
          onSelectHospital={(hosp) => setSelectedHospitalForModal(hosp)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-4 border border-emerald-400/30">
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
        offlineDemoMode={offlineDemoMode}
        onToggleOfflineDemoMode={() => {
          setOfflineDemoMode(!offlineDemoMode);
          try {
            window.localStorage.setItem('medora-offline-demo', String(!offlineDemoMode));
          } catch {}
          setSimpleMode(!offlineDemoMode);
          setLowDataMode(!offlineDemoMode);
        }}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        activeTab={activeTab}
        onSelectTab={(t: any) => setActiveTab(t)}
        familyMembers={accessibleFamilyMembers}
        selectedFamilyId={selectedPatientId}
        onSelectFamilyMember={selectPatient}
        activeRole={activeRole}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onLogout={logout}
        isMoreMenuOpen={isMoreMenuOpen}
        setIsMoreMenuOpen={setIsMoreMenuOpen}
        onOpenUSSD={() => setIsUSSDOpen(true)}
        onOpenVoiceIVR={() => setIsVoiceIVROpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDoctorChat={() => setIsDoctorChatOpen(true)}
        onOpenCommunicationCenter={() => setIsCommunicationCenterOpen(true)}
      />

      {/* Outbox & Network Delivery Monitor Bar */}
      <OutboxNetworkMonitorBar
        isOffline={useOfflineMode}
        onOpenCommunicationCenter={() => setIsCommunicationCenterOpen(true)}
      />

      {/* Network Simulator Bar */}
      <NetworkSimulatorBar />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {(offlineDemoMode || !isOnline || networkStatus === 'OFFLINE') && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-950 flex items-center justify-between" role="status">
            <div>
              <strong>{networkStatus === 'OFFLINE' ? 'Offline Storage Mode' : 'Connection unavailable'}:</strong> Local demo navigation and cached records in <code className="font-mono bg-amber-200/60 px-1 rounded">localStorage</code> are fully available. Actions will be queued in the pending sync queue.
            </div>
          </div>
        )}

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
            {/* 0. Admin Village Demographics & Population Command Center */}
            {activeTab === 'admin' && activeRole === 'admin' && (
              <AdminVillageDashboard
                currentLang={currentLang}
                onNavigateToAI={() => setActiveTab('ai')}
                onSelectPatientFile={(pid) => {
                  selectPatient(pid);
                  setActiveTab('dashboard');
                }}
              />
            )}

            {/* 1. Dedicated Master Dashboard Page (Includes All Contents) */}
            {activeTab === 'dashboard' && activeRole === 'doctor' && (
              <DoctorDashboard
                currentLang={currentLang}
                onNavigateToHandoff={() => setActiveTab('handoff')}
                onNavigateToAI={() => setActiveTab('ai')}
                onShowToast={showToast}
                onOpenCommunicationCenter={() => setIsCommunicationCenterOpen(true)}
              />
            )}

            {activeTab === 'dashboard' && activeRole === 'family' && (
              <FamilyDashboard
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onNavigateToAI={() => setActiveTab('ai')}
                onOpenCommunicationCenter={() => setIsCommunicationCenterOpen(true)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'dashboard' && (activeRole === 'patient' || activeRole === 'admin') && (
              <DashboardPage
                doctors={doctors}
                hospitals={hospitals}
                referrals={referrals}
                activeReferralId={activeReferralId}
                onSelectActiveReferral={setActiveReferralId}
                onUpdateReferralStatus={handleUpdateReferralStatus}
                onCreateReferral={handleCreateReferral}
                healthSummary={clinicalHealthSummary}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
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
                onOpenWhatShouldIDo={() => setIsWhatShouldIDoOpen(true)}
                onOpenUSSD={() => setIsUSSDOpen(true)}
                onOpenVoiceIVR={() => setIsVoiceIVROpen(true)}
                onOpenHelp={() => setIsHelpOpen(true)}
                onOpenDoctorChat={() => setIsDoctorChatOpen(true)}
                onOpenCommunicationCenter={() => setIsCommunicationCenterOpen(true)}
                onOpenCommunicationCenterForPatient={(pid) => {
                  selectPatient(pid);
                  setIsCommunicationCenterOpen(true);
                }}
                isSimpleMode={simpleMode}
                currentLang={currentLang}
              />
            )}

            {/* Dedicated Family Page */}
            {activeTab === 'family' && (
              <FamilyPage
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
                onOpenCommunicationCenterForPatient={(pid) => {
                  selectPatient(pid);
                  setIsCommunicationCenterOpen(true);
                }}
              />
            )}

            {/* Children Care Hub */}
            {activeTab === 'children' && (
              <ChildrenCarePage
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenReportScanner={() => setActiveTab('reports')}
              />
            )}

            {/* Maternity & Newborn Care Hub */}
            {activeTab === 'maternity' && (
              <MaternityCarePage
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onOpenReportScanner={() => setActiveTab('reports')}
              />
            )}

            {/* Elderly Care Hub */}
            {activeTab === 'elderly' && (
              <ElderlyCarePage
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
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
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onSaveScanToProfile={handleSaveScanToProfile}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onNavigateToAI={() => setActiveTab('ai')}
              />
            )}

            {/* Offline Medicine Label Checker */}
            {activeTab === 'medicine' && (
              <MedicineScanner
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
              />
            )}

            {/* Medical Report & X-Ray Analyser */}
            {activeTab === 'reports' && (
              <MedicalReportScanner
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
                onUpdatePatientProfile={handleSaveReport}
                onUpdateDoctorSummary={() => {}}
                onNavigateToDoctorSummary={() => setActiveTab('handoff')}
                onNavigateToAI={() => setActiveTab('ai')}
                onOpenCommunicationCenterForPatient={(pid) => {
                  selectPatient(pid);
                  setIsCommunicationCenterOpen(true);
                }}
              />
            )}

            {/* Hospital Portal & Village Registry */}
            {activeTab === 'portal' && (
              <HospitalVillagePortal
                currentLang={currentLang}
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                onSelectFamilyMember={selectPatient}
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

            {/* A2A (Agent-to-Agent) Multi-Agent Workflow Tab */}
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
                familyMembers={accessibleFamilyMembers}
                selectedFamilyId={selectedPatientId}
                currentLang={currentLang}
                onNavigateToDoctor={() => setActiveTab('dashboard')}
                onNavigateToHospital={() => setActiveTab('hospitals')}
                onNavigateToReferral={() => setActiveTab('referrals')}
                onNavigateToHandoff={() => setActiveTab('handoff')}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                lowDataMode={lowDataMode || useOfflineMode}
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
                familyMembers={accessibleFamilyMembers}
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
                <FamilyHealthSelector
                  familyMembers={accessibleFamilyMembers}
                  selectedFamilyId={selectedPatientId}
                  onSelectFamilyMember={selectPatient}
                  onFilterByMemberCategory={handleFilterByFamilyCategory}
                  onFindHospitalForMember={handleFindHospitalForFamilyMember}
                  currentLang={currentLang}
                />

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
          <span className="text-sm font-black tracking-wide pr-1">ðŸ¤– Ask Medora AI</span>
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
                  Privacy, Medical Disclaimer & Strict ID Data Architecture Notice
                </strong>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Medora helps users organize healthcare continuity and connect with verified medical resources. All records are indexed by unique Patient IDs (P-XXXX) and Family IDs (FAM-XX). All emergency dispatches, notifications, and telemetry are simulated demonstrations labeled <strong>DEMO / SIMULATION DATA</strong>.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold shrink-0">
              MEDORA v2.5 ENTERPRISE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>Â© 2026 Medora â€“ Rural Health Continuity Platform. Designed for underserved rural communities.</p>
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

      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        onShowToast={showToast}
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
        familyMembers={accessibleFamilyMembers}
        selectedFamilyId={selectedPatientId}
        onSaveReport={handleSaveReport}
      />

      {/* 1. First-Time Onboarding Modal */}
      {isOnboardingOpen && (
        <FirstTimeOnboarding
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onComplete={() => {
            setIsOnboardingOpen(false);
            try {
              localStorage.setItem('medora_has_onboarded', 'true');
            } catch {}
          }}
        />
      )}

      {/* 2. "What Should I Do?" Launcher Modal */}
      <WhatShouldIDoGuideModal
        isOpen={isWhatShouldIDoOpen}
        onClose={() => setIsWhatShouldIDoOpen(false)}
        onSelectAction={(tabKey, payload) => {
          setActiveTab(tabKey as any);
          if (payload?.initialQuery) {
            // handle initial query if needed
          }
        }}
      />

      {/* 3. Rural Q&A Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 4. USSD Simulator (*123#) Modal */}
      <USSDSimulatorModal
        isOpen={isUSSDOpen}
        onClose={() => setIsUSSDOpen(false)}
      />

      {/* 5. Voice / IVR Phone Call Simulator Modal */}
      <VoiceIVRModal
        isOpen={isVoiceIVROpen}
        onClose={() => setIsVoiceIVROpen(false)}
        currentLang={currentLang}
      />

      {/* 6. Two-Way Doctor Communication Chat Modal */}
      <TwoWayDoctorChatModal
        isOpen={isDoctorChatOpen}
        onClose={() => setIsDoctorChatOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatient?.name || 'Ramesh Kumar'}
        userRole={activeRole}
      />

      {/* 7. Central Communication Center Modal */}
      <CommunicationCenterModal
        isOpen={isCommunicationCenterOpen}
        onClose={() => setIsCommunicationCenterOpen(false)}
        patientId={selectedPatientId}
        patientName={selectedPatient?.name || 'Ramesh Kumar'}
        isOffline={useOfflineMode}
      />

      {/* Mobile Bottom Navigation Bar (<768px) */}
      <MobileBottomBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          setIsMoreMenuOpen(false);
        }}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenMoreMenu={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
      />
    </div>
  );
}

export function App() {
  return (
    <MedoraProvider>
      <MedoraAppContent />
    </MedoraProvider>
  );
}

export default App;


