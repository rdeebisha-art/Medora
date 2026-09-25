import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
  db, Patient, Family, Medicine, HealthTest, Vaccination,
  MedicalRecord, DoctorSummary, FamilyAlertOutbox
} from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { patientIsolationGuard } from '../services/patientIsolation/patientIsolationGuard';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';
import {
  User, Heart, Pill, Activity, ShieldCheck, FileText,
  Stethoscope, Phone, AlertTriangle, ChevronRight, X, Users,
  Send, Eye, CheckCircle2
} from 'lucide-react';

export default function FamilyPage() {
  const { t } = useTranslation();
  const { currentUser, appLanguage } = useAppStore();

  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number>(1);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Patient[]>([]);

  // Selected Patient Details State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'vitals' | 'medicines' | 'vaccines' | 'reports' | 'notes'>('profile');
  const [patientMeds, setPatientMeds] = useState<Medicine[]>([]);
  const [patientVitals, setPatientVitals] = useState<HealthTest[]>([]);
  const [patientVaccines, setPatientVaccines] = useState<Vaccination[]>([]);
  const [patientReports, setPatientReports] = useState<MedicalRecord[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<DoctorSummary[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Family Alert Test State
  const [alertSuccessList, setAlertSuccessList] = useState<string[]>([]);
  const [outboxCount, setOutboxCount] = useState<number>(0);
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [familyAlerts, setFamilyAlerts] = useState<FamilyAlertOutbox[]>([]);

  // Load all 10 families on mount
  useEffect(() => {
    const loadFamilies = async () => {
      const fams = await db.families.toArray();
      setAllFamilies(fams);

      let initialFamId = 1;
      if (currentUser?.role === 'family' && currentUser.id) {
        initialFamId = currentUser.id;
      } else if (currentUser?.role === 'patient' && currentUser.familyId) {
        initialFamId = currentUser.familyId;
      }

      setSelectedFamilyId(initialFamId);

      const count = await db.familyAlertOutbox.count();
      setOutboxCount(count);
    };
    loadFamilies();
  }, [currentUser]);

  // Load members whenever selectedFamilyId changes
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!selectedFamilyId) return;
      const fam = await db.families.get(selectedFamilyId);
      setSelectedFamily(fam || null);

      if (fam?.memberIds && fam.memberIds.length > 0) {
        const mems = await db.patients.bulkGet(fam.memberIds);
        setMembers(mems.filter(Boolean) as Patient[]);
      } else {
        const famPatients = await db.patients.where({ familyId: selectedFamilyId }).toArray();
        setMembers(famPatients);
      }
    };
    loadFamilyMembers();
  }, [selectedFamilyId]);

  const handleSelectPatient = async (p: Patient) => {
    if (!p.id) return;
    setSelectedPatient(p);
    setActiveTab('profile');
    setIsLoadingDetails(true);

    try {
      const bundle = await patientIsolationGuard.getIsolatedPatientBundle(p.id);
      setPatientMeds(bundle.medicines);
      setPatientVitals(bundle.healthTests);
      setPatientVaccines(bundle.vaccinations);
      setPatientReports(bundle.medicalRecords);
      setPatientSummaries(bundle.doctorSummaries);
    } catch (e) {
      console.error('Failed to load patient bundle:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // STEP 10: "Send Family Alert" Test Feature
  const handleSendFamilyAlert = async () => {
    const patient = selectedPatient || members[0];
    if (!patient || !selectedFamily) return;

    const contactsToAlert = members.filter(m => m.id !== patient.id);
    const recipients = contactsToAlert.length > 0 ? contactsToAlert : [
      { id: 99, name: 'Family Primary Contact', phone: patient.emergencyContact || '9876500001' } as any
    ];

    const successSummary: string[] = [];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (const rec of recipients) {
      const alertRecord: FamilyAlertOutbox = {
        alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        familyId: selectedFamily.id || 1,
        patientId: patient.id || 1,
        recipientId: rec.id,
        recipientName: rec.name,
        recipientPhone: rec.phone,
        message: `🚨 Emergency alert from Medora: ${patient.name} may need immediate assistance at ${timestamp}.`,
        language: appLanguage,
        timestamp: new Date().toISOString(),
        status: 'PENDING_OFFLINE',
      };

      await db.familyAlertOutbox.add(alertRecord);
      successSummary.push(`✓ ${rec.name} (${rec.phone}) — Alert prepared in offline outbox`);
    }

    setAlertSuccessList(successSummary);
    const newCount = await db.familyAlertOutbox.count();
    setOutboxCount(newCount);
  };

  const handleViewOutbox = async () => {
    const list = await db.familyAlertOutbox.reverse().toArray();
    setFamilyAlerts(list);
    setShowOutboxModal(true);
  };

  const getBadge = (p: Patient) => {
    if (p.isPregnant) return '🤰 Pregnant (28w)';
    if (p.isNewborn) return '🍼 Newborn';
    if (p.isChild) return '👶 Child';
    if (p.isElderly) return '👴 Elderly';
    if (p.isNewMother) return '👩 New Mother';
    return '';
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="text-teal-700" size={24} />
              <span>{t('family.title', 'Family Healthcare Hub')}</span>
            </h1>
            <p className="text-xs text-slate-500">
              10 Complete Fictional Village Families · Connected Longitudinal Records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewOutbox}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Eye size={13} className="text-teal-700" />
              <span>Family Alerts ({outboxCount})</span>
            </button>
            <DemoDataBadge />
          </div>
        </div>

        {/* 10 Families Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Village Household ({allFamilies.length} Registered Families):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {allFamilies.map((fam) => (
              <button
                key={fam.id}
                onClick={() => {
                  setSelectedFamilyId(fam.id!);
                  setSelectedPatient(null);
                  setAlertSuccessList([]);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  selectedFamilyId === fam.id
                    ? 'border-teal-600 bg-teal-50/80 font-bold text-teal-900 shadow-2xs'
                    : 'border-slate-200 hover:border-teal-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="truncate font-black">{fam.familyName.split('(')[0].trim()}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {fam.memberIds ? `${fam.memberIds.length} members` : 'Members'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Family Card & Quick Actions */}
        {selectedFamily && (
          <div className="bg-gradient-to-br from-teal-800 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-700/60 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Village Household
                </span>
                <h2 className="text-lg font-black mt-1">{selectedFamily.familyName}</h2>
                <p className="text-xs text-teal-200">
                  Location: {selectedFamily.village} · PIN: {selectedFamily.pin}
                </p>
              </div>

              {/* TEST 10: "Send Family Alert" Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendFamilyAlert}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Send Family Alert</span>
                </button>
              </div>
            </div>

            {/* Alert Result Preview */}
            {alertSuccessList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-teal-700/50 bg-teal-900/60 p-3 rounded-xl">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 size={14} />
                  <span>Family Alert Prepared (SMS Demo / Offline Outbox):</span>
                </div>
                <div className="space-y-1">
                  {alertSuccessList.map((res, i) => (
                    <div key={i} className="text-[11px] text-teal-100 font-mono">
                      {res}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Family Members List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Household Members ({members.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Tap a member to inspect records</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => handleSelectPatient(member)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPatient?.id === member.id
                    ? 'border-teal-600 bg-teal-50/90 shadow-xs'
                    : 'border-slate-200 hover:border-teal-400 bg-white shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-teal-800 flex-shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900 truncate">{member.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {member.age} yrs · {member.gender} · {member.bloodGroup || 'Blood Type Unrecorded'}
                    </div>
                    {getBadge(member) && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {getBadge(member)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {/* Call Family Member via native tel: */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      callPhoneNumber(member.phone);
                    }}
                    className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-colors"
                    title={`Call ${member.name} (${member.phone})`}
                  >
                    <Phone size={14} />
                  </button>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Longitudinal Record Inspection Drawer / Detail */}
        {selectedPatient && (
          <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Patient Health Records
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500">
                  Phone: {selectedPatient.phone} · Emergency Contact: {selectedPatient.emergencyContact || '108'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Record Tabs */}
            <div className="flex gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto text-xs">
              {[
                { id: 'profile', label: 'Conditions' },
                { id: 'medicines', label: `Medicines (${patientMeds.length})` },
                { id: 'vitals', label: `Vitals (${patientVitals.length})` },
                { id: 'vaccines', label: `Vaccines (${patientVaccines.length})` },
                { id: 'reports', label: `Reports (${patientReports.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {isLoadingDetails ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Loading clinical records from IndexedDB...
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700">
                {activeTab === 'profile' && (
                  <div>
                    <div className="font-bold text-slate-800 mb-1">Active Conditions:</div>
                    {selectedPatient.conditions && selectedPatient.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPatient.conditions.map((c, i) => (
                          <span key={i} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No chronic health conditions recorded.</p>
                    )}
                  </div>
                )}

                {activeTab === 'medicines' && (
                  <div className="space-y-2">
                    {patientMeds.length === 0 ? (
                      <p className="text-slate-400">No active medicines recorded.</p>
                    ) : (
                      patientMeds.map(m => (
                        <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{m.name} ({m.dose})</div>
                            <div className="text-[11px] text-slate-500">{m.frequency} · Times: {m.times?.join(', ')}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {m.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'vitals' && (
                  <div className="space-y-1.5">
                    {patientVitals.length === 0 ? (
                      <p className="text-slate-400">No vitals readings recorded.</p>
                    ) : (
                      patientVitals.map(v => (
                        <div key={v.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                          <span className="capitalize font-bold text-slate-800">{v.type.replace('_', ' ')}</span>
                          <span className="font-mono font-bold text-teal-800">{v.value} {v.unit}</span>
                          <span className="text-[10px] text-slate-400">{v.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'vaccines' && (
                  <div className="space-y-1.5">
                    {patientVaccines.length === 0 ? (
                      <p className="text-slate-400">No vaccinations recorded.</p>
                    ) : (
                      patientVaccines.map(v => (
                        <div key={v.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                          <span className="font-bold text-slate-800">{v.vaccineName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
                            {v.status}
                          </span>
                          <span className="text-[10px] text-slate-400">Due: {v.dueDate}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-2">
                    {patientReports.length === 0 ? (
                      <p className="text-slate-400">No lab reports recorded.</p>
                    ) : (
                      patientReports.map(r => (
                        <div key={r.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex justify-between items-center font-bold text-slate-900">
                            <span>{(r.data as any)?.reportName || 'Diagnostic Report'}</span>
                            <span className="text-[10px] text-slate-400">{r.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">{r.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Outbox Modal */}
      {showOutboxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">Family Alert Outbox (Offline)</h3>
              </div>
              <button onClick={() => setShowOutboxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="py-2 text-[11px] text-slate-500">
              SMS DEMO / OFFLINE OUTBOX · Stored locally in IndexedDB
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 my-2">
              {familyAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No alerts prepared yet.
                </div>
              ) : (
                familyAlerts.map(alert => (
                  <div key={alert.id || alert.alertId} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>To: {alert.recipientName} ({alert.recipientPhone})</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-mono">
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] mt-1.5 bg-white p-2 rounded-lg border border-slate-200 font-mono">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowOutboxModal(false)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
