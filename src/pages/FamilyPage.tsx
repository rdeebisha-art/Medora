import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Family, Medicine, HealthTest, Vaccination, MedicalRecord, DoctorSummary } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { patientIsolationGuard } from '../services/patientIsolation/patientIsolationGuard';
import { User, Heart, Pill, Activity, ShieldCheck, FileText, Stethoscope, Phone, AlertTriangle, ChevronRight, X } from 'lucide-react';

export default function FamilyPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [members, setMembers] = useState<Patient[]>([]);
  const [family, setFamily] = useState<Family | null>(null);

  // Selected Patient Modal / View State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'vitals' | 'medicines' | 'vaccines' | 'reports' | 'notes'>('profile');
  const [patientMeds, setPatientMeds] = useState<Medicine[]>([]);
  const [patientVitals, setPatientVitals] = useState<HealthTest[]>([]);
  const [patientVaccines, setPatientVaccines] = useState<Vaccination[]>([]);
  const [patientReports, setPatientReports] = useState<MedicalRecord[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<DoctorSummary[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const load = async () => {
      let familyId: number | undefined;
      if (currentUser?.role === 'family') familyId = currentUser.id;
      else if (currentUser?.role === 'patient') familyId = (currentUser as any).familyId;

      if (!familyId) {
        // Retrieve all 8 fictional village patients
        const all = await db.patients.toArray();
        setMembers(all);
        return;
      }

      const fam = await db.families.get(familyId);
      setFamily(fam || null);
      if (fam?.memberIds?.length) {
        const mems = await db.patients.bulkGet(fam.memberIds);
        setMembers(mems.filter(Boolean) as Patient[]);
      }
    };
    load();
  }, [currentUser]);

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

  const getBadge = (p: Patient) => {
    if (p.isPregnant) return '🤰 Pregnant';
    if (p.isNewborn) return '🍼 Newborn';
    if (p.isChild) return '👶 Child';
    if (p.isElderly) return '👴 Elderly';
    if (p.isNewMother) return '👩 New Mother';
    return '';
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-100">👪 {t('family.title')}</h1>
            <p className="text-xs text-slate-400">
              {family ? `${family.familyName} • ${family.village}` : 'Select any registered patient to view complete health records'}
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Patient Selectable List */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Patients ({members.length})
          </div>

          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => handleSelectPatient(member)}
              className="bg-slate-900 border border-slate-800 hover:border-teal-700/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-teal-900/60 text-teal-300 border border-teal-700 w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                  {member.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>{member.name}</span>
                    {getBadge(member) && (
                      <span className="text-[10px] bg-pink-950/80 text-pink-300 border border-pink-800 px-1.5 py-0.2 rounded-full">
                        {getBadge(member)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {member.age} yrs • {member.gender} • Blood Group: <span className="text-teal-400 font-bold">{member.bloodGroup || 'Not Tested'}</span>
                  </div>
                  {member.conditions && member.conditions.length > 0 && (
                    <div className="text-[11px] text-rose-400 font-medium mt-0.5">
                      ⚠️ {member.conditions.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 hidden sm:inline">View Dossier</span>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Selected Patient Full Dossier Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg">
                    {selectedPatient.name[0]}
                  </div>
                  <div>
                    <h2 className="font-black text-base text-slate-100">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-400">
                      ID: P-{selectedPatient.id} • {selectedPatient.village} • Preferred: {selectedPatient.language?.toUpperCase() || 'EN'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs scrollbar-none px-2">
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'vitals', label: `Vitals (${patientVitals.length})` },
                  { id: 'medicines', label: `Meds (${patientMeds.length})` },
                  { id: 'vaccines', label: `Vaccines (${patientVaccines.length})` },
                  { id: 'reports', label: `Reports (${patientReports.length})` },
                  { id: 'notes', label: `Notes (${patientSummaries.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-400 text-teal-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Body */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                {isLoadingDetails ? (
                  <div className="py-12 text-center text-slate-400">Loading isolated patient records...</div>
                ) : (
                  <>
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-400 font-bold">AGE & GENDER</div>
                            <div className="text-sm font-black text-slate-200 mt-0.5">{selectedPatient.age} yrs • {selectedPatient.gender}</div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-400 font-bold">BLOOD GROUP</div>
                            <div className="text-sm font-black text-rose-400 mt-0.5">{selectedPatient.bloodGroup || 'Not recorded'}</div>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold">EMERGENCY CONTACT</div>
                          <div className="text-sm font-bold text-slate-200 flex items-center justify-between">
                            <span>Phone: {selectedPatient.emergencyContact || selectedPatient.phone}</span>
                            <a href={`tel:${selectedPatient.emergencyContact || selectedPatient.phone}`} className="text-teal-400 hover:underline flex items-center gap-1 text-xs">
                              <Phone size={12} /> Call
                            </a>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold">KNOWN CONDITIONS</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPatient.conditions && selectedPatient.conditions.length > 0 ? (
                              selectedPatient.conditions.map((c, i) => (
                                <span key={i} className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">None registered</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold">ALLERGIES</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                              selectedPatient.allergies.map((a, i) => (
                                <span key={i} className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                  ⚠️ {a}
                                </span>
                              ))
                            ) : (
                              <span className="text-emerald-400 font-semibold">No known drug allergies</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VITALS TAB */}
                    {activeTab === 'vitals' && (
                      <div className="space-y-2">
                        {patientVitals.length === 0 ? (
                          <p className="text-slate-400 text-center py-6">No recent vital measurements.</p>
                        ) : (
                          patientVitals.map((v) => (
                            <div key={v.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-200 capitalize">{v.type.replace('_', ' ')}</span>
                                <div className="text-[10px] text-slate-400">{v.date} {v.notes ? `• ${v.notes}` : ''}</div>
                              </div>
                              <div className="text-sm font-black text-teal-400">
                                {v.value} <span className="text-xs text-slate-400">{v.unit}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* MEDICINES TAB */}
                    {activeTab === 'medicines' && (
                      <div className="space-y-2">
                        {patientMeds.length === 0 ? (
                          <p className="text-slate-400 text-center py-6">No active prescribed medicines.</p>
                        ) : (
                          patientMeds.map((m) => (
                            <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm text-teal-300">{m.name}</span>
                                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">{m.status}</span>
                              </div>
                              <div className="text-slate-300">Dose: {m.dose} • {m.frequency}</div>
                              <div className="text-[11px] text-slate-400 italic">Instructions: {m.instructions}</div>
                              <div className="text-[10px] text-slate-500">Prescribing Doctor: {m.doctor}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* VACCINES TAB */}
                    {activeTab === 'vaccines' && (
                      <div className="space-y-2">
                        {patientVaccines.length === 0 ? (
                          <p className="text-slate-400 text-center py-6">No vaccination schedule recorded.</p>
                        ) : (
                          patientVaccines.map((vac) => (
                            <div key={vac.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-200">{vac.vaccineName}</div>
                                <div className="text-[10px] text-slate-400">
                                  {vac.status === 'given' ? `Given on: ${vac.givenDate || 'Recorded'}` : `Due: ${vac.dueDate}`}
                                </div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                vac.status === 'given' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {vac.status.toUpperCase()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* REPORTS TAB */}
                    {activeTab === 'reports' && (
                      <div className="space-y-2">
                        {patientReports.length === 0 ? (
                          <p className="text-slate-400 text-center py-6">No diagnostic lab reports uploaded.</p>
                        ) : (
                          patientReports.map((rep) => {
                            const repData = (rep.data as any) || {};
                            return (
                              <div key={rep.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200">{repData.reportName || rep.type}</span>
                                  <span className="text-[10px] text-slate-400">{rep.date}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Facility: {repData.lab || 'Clinical Diagnostics'}</div>
                                {rep.notes && <div className="text-[11px] text-slate-300 italic">{rep.notes}</div>}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                      <div className="space-y-2">
                        {patientSummaries.length === 0 ? (
                          <p className="text-slate-400 text-center py-6">No consultation handoff notes.</p>
                        ) : (
                          patientSummaries.map((note) => (
                            <div key={note.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-teal-400">Consultation Summary</span>
                                <span className="text-[10px] text-slate-500">{note.createdAt?.slice(0, 10)}</span>
                              </div>
                              <div className="text-slate-300"><strong>Complaint:</strong> {note.complaint}</div>
                              {note.observations && <div className="text-slate-300"><strong>Observations:</strong> {note.observations}</div>}
                              {note.nextStep && <div className="text-teal-300"><strong>Next Step:</strong> {note.nextStep}</div>}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
