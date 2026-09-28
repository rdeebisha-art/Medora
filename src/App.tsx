import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import './i18n/config';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyHealthPage from './pages/MyHealthPage';
import FamilyPage from './pages/FamilyPage';
import MedicinesPage from './pages/MedicinesPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import HealthTestsPage from './pages/HealthTestsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import EmergencyPage from './pages/EmergencyPage';
import HospitalsPage from './pages/HospitalsPage';
import TransportPage from './pages/TransportPage';
import SchemesPage from './pages/SchemesPage';
import EducationPage from './pages/EducationPage';
import SmsPage from './pages/SmsPage';
import IvrPage from './pages/IvrPage';
import UssdPage from './pages/UssdPage';
import VillagePage from './pages/VillagePage';
import DoctorPortalPage from './pages/DoctorPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DoctorSummaryPage from './pages/DoctorSummaryPage';
import NotificationsPage from './pages/NotificationsPage';
import SyncPage from './pages/SyncPage';
import MaternityPage from './pages/MaternityPage';
import NewbornPage from './pages/NewbornPage';
import ChildcarePage from './pages/ChildcarePage';
import ElderlyPage from './pages/ElderlyPage';
import VaccinationPage from './pages/VaccinationPage';
import ReportScannerPage from './pages/ReportScannerPage';
import XrayViewerPage from './pages/XrayViewerPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FaqPage from './pages/FaqPage';
import HelpPage from './pages/HelpPage';
import LanguageBridgePage from './pages/LanguageBridgePage';
import AppointmentsPage from './pages/AppointmentsPage';
import CallHistoryPage from './pages/CallHistoryPage';
import AgentSimulationPage from './pages/AgentSimulationPage';
import BiomedicalWastePage from './pages/BiomedicalWastePage';
import FullDemoScenarioPage from './pages/FullDemoScenarioPage';
import MedicalWasteManagementPage from './modules/medicalWaste/pages/MedicalWasteManagementPage';
import PillIdentifierPage from './pages/PillIdentifierPage';

import MedicalHospitalBackground from './components/layout/MedicalHospitalBackground';
import { ActiveCallModal } from './components/ActiveCallModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import OfflineToast from './components/OfflineToast';
import VoiceNavigationModal from './components/VoiceNavigationModal';
import { GlobalEmergencyVoiceListener } from './components/GlobalEmergencyVoiceListener';
import { webrtcCallingService } from './services/webrtc/webrtcCallingService';
import { inAppMessagingService } from './services/messaging/inAppMessagingService';
import { localNotificationScheduler } from './services/notifications/localNotificationScheduler';
import { medicationPushNotificationService } from './services/medications/medicationPushNotificationService';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { activeDirectCall, endDirectCall, incomingCall, setIncomingCall, currentUser } = useAppStore();

  useEffect(() => {
    const cleanupScheduler = localNotificationScheduler.initScheduler();
    const targetPatientId = (currentUser?.role === 'patient' ? currentUser.id : undefined) || 1;
    const cleanupMedPush = medicationPushNotificationService.init(targetPatientId);
    return () => {
      cleanupScheduler();
      cleanupMedPush();
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.role === 'doctor' ? `DOC-0${currentUser.id || 1}` : `P00${currentUser.id || 1}`;
      webrtcCallingService.initSignaling(userId, currentUser.name, currentUser.role);
      inAppMessagingService.init(userId, currentUser.name, currentUser.role);
    }
  }, [currentUser]);

  return (
    <MedicalHospitalBackground>
      <OfflineToast />
      <VoiceNavigationModal />
      <GlobalEmergencyVoiceListener />
      {incomingCall && (
        <IncomingCallModal incomingCall={incomingCall} onClose={() => setIncomingCall(null)} />
      )}
      {activeDirectCall && (
        <ActiveCallModal callInfo={activeDirectCall} onClose={endDirectCall} />
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/welcome" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Protected Core Dashboard & Patient Portals */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/patient" element={<Navigate to="/health" replace />} />
        <Route path="/health" element={<ProtectedRoute><MyHealthPage /></ProtectedRoute>} />
        <Route path="/family" element={<ProtectedRoute><FamilyPage /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute><MedicinesPage /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><MedicalRecordsPage /></ProtectedRoute>} />
        <Route path="/health-tests" element={<ProtectedRoute><HealthTestsPage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
        <Route path="/medical-ai" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
        <Route path="/pill-identifier" element={<ProtectedRoute><PillIdentifierPage /></ProtectedRoute>} />

        {/* A2A & Simulation */}
        <Route path="/a2a" element={<Navigate to="/a2a-simulation" replace />} />
        <Route path="/a2a-simulation" element={<ProtectedRoute><AgentSimulationPage /></ProtectedRoute>} />
        <Route path="/demo" element={<Navigate to="/demo-scenario" replace />} />
        <Route path="/demo-scenario" element={<ProtectedRoute><FullDemoScenarioPage /></ProtectedRoute>} />

        {/* Biomedical Waste Management (Hospital & Operations Modules) */}
        <Route path="/waste" element={<Navigate to="/biomedical-waste" replace />} />
        <Route path="/biomedical-waste" element={<ProtectedRoute><BiomedicalWastePage /></ProtectedRoute>} />
        <Route path="/smart-bin" element={<ProtectedRoute><BiomedicalWastePage /></ProtectedRoute>} />
        <Route path="/passport" element={<ProtectedRoute><BiomedicalWastePage /></ProtectedRoute>} />
        <Route path="/collection" element={<ProtectedRoute><BiomedicalWastePage /></ProtectedRoute>} />
        <Route path="/medical-waste" element={<ProtectedRoute><MedicalWasteManagementPage /></ProtectedRoute>} />

        {/* Clinical Care Areas */}
        <Route path="/maternity" element={<ProtectedRoute><MaternityPage /></ProtectedRoute>} />
        <Route path="/newborn" element={<ProtectedRoute><NewbornPage /></ProtectedRoute>} />
        <Route path="/childcare" element={<ProtectedRoute><ChildcarePage /></ProtectedRoute>} />
        <Route path="/children" element={<Navigate to="/childcare" replace />} />
        <Route path="/elderly" element={<ProtectedRoute><ElderlyPage /></ProtectedRoute>} />
        <Route path="/vaccination" element={<ProtectedRoute><VaccinationPage /></ProtectedRoute>} />
        <Route path="/report-scanner" element={<ProtectedRoute><ReportScannerPage /></ProtectedRoute>} />
        <Route path="/reports" element={<Navigate to="/report-scanner" replace />} />
        <Route path="/xray-viewer" element={<ProtectedRoute><XrayViewerPage /></ProtectedRoute>} />

        {/* Hospital & Doctor Portals */}
        <Route path="/hospital" element={<Navigate to="/admin-portal" replace />} />
        <Route path="/doctor" element={<Navigate to="/doctor-portal" replace />} />
        <Route path="/doctor-portal" element={<ProtectedRoute><DoctorPortalPage /></ProtectedRoute>} />
        <Route path="/admin-portal" element={<ProtectedRoute><AdminPortalPage /></ProtectedRoute>} />
        <Route path="/doctor-summary" element={<ProtectedRoute><DoctorSummaryPage /></ProtectedRoute>} />

        {/* Operations, Channels & Settings */}
        <Route path="/language-bridge" element={<ProtectedRoute><LanguageBridgePage /></ProtectedRoute>} />
        <Route path="/hospitals" element={<ProtectedRoute><HospitalsPage /></ProtectedRoute>} />
        <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
        <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
        <Route path="/sms" element={<ProtectedRoute><SmsPage /></ProtectedRoute>} />
        <Route path="/ivr" element={<ProtectedRoute><IvrPage /></ProtectedRoute>} />
        <Route path="/ussd" element={<ProtectedRoute><UssdPage /></ProtectedRoute>} />
        <Route path="/village" element={<ProtectedRoute><VillagePage /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/call-history" element={<ProtectedRoute><CallHistoryPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/sync" element={<ProtectedRoute><SyncPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MedicalHospitalBackground>
  );
}
