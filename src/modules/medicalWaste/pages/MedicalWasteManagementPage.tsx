import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useAppStore } from '../../../store/useAppStore';
import { MedicalWasteRole } from '../types/wasteTypes';
import {
  MedicalWasteNavigation,
  MedicalWasteTab
} from '../components/MedicalWasteNavigation';
import { MISDashboardView } from '../components/MISDashboardView';
import { WasteScannerModal } from '../components/WasteScannerModal';
import { CollectionWorkflowView } from '../components/CollectionWorkflowView';
import { ManualReviewView } from '../components/ManualReviewView';
import { AIPerformanceView } from '../components/AIPerformanceView';
import { WasteAuditLogsView } from '../components/WasteAuditLogsView';
import { medicalWasteDbService } from '../services/medicalWasteDbService';
import { db } from '../../../db/db';

export default function MedicalWasteManagementPage() {
  const { currentUser } = useAppStore();

  // Map initial app role to medical waste role
  const mapInitialRole = (): MedicalWasteRole => {
    if (currentUser?.role === 'admin') return 'admin';
    if (currentUser?.role === 'doctor') return 'facility_staff';
    return 'facility_staff'; // Default to facility staff for module demonstration
  };

  const [activeRole, setActiveRole] = useState<MedicalWasteRole>(mapInitialRole());
  const [activeTab, setActiveTab] = useState<MedicalWasteTab>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    checkPendingSync();
    // Seed initial demo data in case DB is fresh
    medicalWasteDbService.seedInitialData();
  }, []);

  const checkPendingSync = async () => {
    try {
      const pendingItems = await db.medicalWasteItems.where({ syncStatus: 'PENDING_SYNC' }).count();
      const pendingScans = await db.wasteScans.where({ syncStatus: 'PENDING_SYNC' }).count();
      setPendingSyncCount(pendingItems + pendingScans);
    } catch {
      setPendingSyncCount(0);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await medicalWasteDbService.synchronizePendingRecords();
      setSyncToast(`✓ Synchronized ${res.synchronizedCount} pending records with server.`);
      await checkPendingSync();
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRoleChange = (newRole: MedicalWasteRole) => {
    setActiveRole(newRole);
    // If switching to worker or patient, adjust tabs if current tab is restricted
    if (newRole === 'waste_worker' && (activeTab === 'dashboard' || activeTab === 'review' || activeTab === 'ai_performance' || activeTab === 'audit_logs')) {
      setActiveTab('workflow');
    }
    if (newRole === 'patient_family') {
      setActiveTab('dashboard');
    }
  };

  return (
    <Layout>
      <div className="w-full min-h-screen bg-slate-50/50 pb-16">
        {/* Module Header & Subnavigation */}
        <MedicalWasteNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'scanner') {
              setIsScannerOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          pendingSyncCount={pendingSyncCount}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        {/* Sync Toast */}
        {syncToast && (
          <div className="max-w-7xl mx-auto px-4 pt-3">
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-between">
              <span>{syncToast}</span>
              <button onClick={() => setSyncToast(null)} className="text-emerald-800 font-bold ml-2">✕</button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6">
          {/* PATIENT / FAMILY RESTRICTED VIEW */}
          {activeRole === 'patient_family' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl border border-amber-200">
                    ℹ️
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Community Biomedical Waste Safety &amp; Disposal Guidelines
                    </h2>
                    <p className="text-xs text-slate-500">
                      Institutional Waste Management Portal is restricted to authorized hospital staff &amp; sanitary workers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                    <h3 className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                      <span>💉</span> Household Insulin Needles &amp; Sharps Protocol
                    </h3>
                    <p className="text-xs text-teal-800 leading-relaxed">
                      Never throw needles or syringes directly into household garbage. Collect them in a rigid plastic container (thick detergent bottle) with a secure lid and hand them over to your village health sub-center or ASHA worker for safe disposal.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                    <h3 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <span>🚨</span> Report Biohazard Waste Spills
                    </h3>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      If you spot discarded medical waste, open sharps, or biological hazards in public village areas or near drinking water sources, contact the Kodaikanal Public Health Control Office immediately: <strong>04542-241234</strong> or <strong>108</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-slate-600">
                    Are you a hospital staff member, sanitary inspector, or collection worker?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('facility_staff')}
                    className="bg-[#0F766E] hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs self-start sm:self-auto cursor-pointer"
                  >
                    Switch to Authorized Staff View
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STAFF / WORKER / ADMIN TAB CONTENT */}
              {activeTab === 'dashboard' && (
                <MISDashboardView onNavigateToScan={() => setIsScannerOpen(true)} />
              )}

              {activeTab === 'workflow' && (
                <CollectionWorkflowView
                  currentRole={activeRole}
                  onOpenScan={() => setIsScannerOpen(true)}
                />
              )}

              {activeTab === 'review' && (
                <ManualReviewView
                  currentUserId={currentUser ? `USR-${currentUser.id}` : 'STAFF-01'}
                  currentUserName={currentUser?.name || 'Authorized Staff'}
                />
              )}

              {activeTab === 'ai_performance' && <AIPerformanceView />}

              {activeTab === 'audit_logs' && (
                <WasteAuditLogsView isAdmin={activeRole === 'admin'} />
              )}
            </>
          )}
        </div>

        {/* Global Scanner Modal */}
        <WasteScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onItemSaved={(_id) => {
            checkPendingSync();
          }}
          currentUserId={currentUser ? `USR-${currentUser.id}` : 'STAFF-01'}
          currentUserName={currentUser?.name || 'Sister V. Latha'}
          currentUserRole={activeRole}
        />
      </div>
    </Layout>
  );
}
