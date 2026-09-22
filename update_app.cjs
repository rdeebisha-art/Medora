const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace(
  "import { FamilyPage } from './components/FamilyPage';",
  "import { FamilyPage } from './components/FamilyPage';\nimport { DoctorDashboard } from './components/DoctorDashboard';\nimport { FamilyDashboard } from './components/FamilyDashboard';"
);

// Replace activeTab === 'dashboard' logic
const dashboardRender =             {/* 1. Dedicated Master Dashboard Page (Includes All Contents) */}
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
;
content = content.replace(
  /            \{\/\* 1\. Dedicated Master Dashboard Page \(Includes All Contents\) \*\/\}\s*\{activeTab === 'dashboard' && \(\s*<DashboardPage/m,
  dashboardRender
);

fs.writeFileSync(file, content, 'utf8');
