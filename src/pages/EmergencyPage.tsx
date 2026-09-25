import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Family, FamilyAlertOutbox, EmergencyIncident } from '../db/db';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';
import {
  Phone, Users, Stethoscope, Building2, HeartPulse, FileText,
  AlertTriangle, CheckCircle, ShieldAlert, ArrowLeft, X, Eye
} from 'lucide-react';

const FIRST_AID = [
  {
    id: 'fever', title: '🌡️ High Fever', steps: [
      'Give Paracetamol as advised (not Aspirin for children)',
      'Apply cool, wet cloth on forehead',
      'Drink plenty of fluids — safe water, ORS, coconut water',
      'Do not wrap in heavy blankets',
      'Seek emergency help if fever >104°F (40°C) or lasts >3 days',
    ]
  },
  {
    id: 'bleeding', title: '🩸 Severe Bleeding', steps: [
      'Press firmly on wound with clean cloth',
      'Do not remove the cloth — add more if soaked',
      'Keep the injured part raised above heart level if possible',
      'Do not apply a tourniquet unless trained',
      'Call emergency 108 immediately',
    ]
  },
  {
    id: 'choking', title: '😮‍💨 Choking / Breathing Distress', steps: [
      'Ask: "Are you choking?" — if they can speak, encourage coughing',
      'If silent: stand behind them, arms around waist',
      'Give 5 firm back blows between shoulder blades',
      'Give 5 abdominal thrusts (Heimlich)',
      'Call emergency immediately if airway remains blocked',
    ]
  },
  {
    id: 'snakebite', title: '🐍 Snake Bite', steps: [
      'Keep patient calm and completely still — immobilize the bitten limb',
      'Remove rings, watches or tight items near the bite',
      'Do NOT cut or suck the wound, apply ice, chemicals or herbs',
      'Keep bitten limb BELOW heart level',
      'Transport to hospital immediately for antivenom assessment',
    ]
  },
  {
    id: 'burn', title: '🔥 Burns', steps: [
      'Cool immediately under running cold water for 10–20 minutes',
      'Do NOT use ice, butter, oil, or toothpaste',
      'Remove jewelry but NOT clothing stuck to the burn',
      'Cover with clean cling film or clean cloth loosely',
      'Seek urgent medical help for large burns or facial/hand burns',
    ]
  },
  {
    id: 'heartattack', title: '❤️ Chest Pain / Suspected Cardiac Event', steps: [
      'Help them sit comfortably on the floor with knees bent and back supported',
      'Loosen tight clothing around neck and waist',
      'If prescribed, take prescribed emergency medication',
      'Call emergency (108) immediately — do not drive yourself',
      'Prepare for CPR if person becomes unresponsive',
    ]
  },
];

export default function EmergencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, appLanguage } = useAppStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientFamily, setPatientFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Patient[]>([]);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [alertOutbox, setAlertOutbox] = useState<FamilyAlertOutbox[]>([]);
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);

  // Load patient, family, and existing alerts from IndexedDB
  useEffect(() => {
    const load = async () => {
      let pId = currentUser?.id || 1;
      let patient = await db.patients.get(pId);
      if (!patient) {
        const allPatients = await db.patients.toArray();
        patient = allPatients[0];
      }
      setCurrentPatient(patient || null);

      if (patient?.familyId) {
        const fam = await db.families.get(patient.familyId);
        setPatientFamily(fam || null);
        if (fam?.memberIds?.length) {
          const mems = await db.patients.bulkGet(fam.memberIds);
          setFamilyMembers((mems.filter(Boolean) as Patient[]).filter(m => m.id !== patient.id));
        }
      }

      // Load existing alerts
      const alerts = await db.familyAlertOutbox.reverse().toArray();
      setAlertOutbox(alerts);
    };
    load();
  }, [currentUser]);

  // Create Emergency Incident locally
  const createEmergencyIncident = async (type = 'GENERAL_EMERGENCY', severity: EmergencyIncident['severity'] = 'HIGH') => {
    const incident: EmergencyIncident = {
      incidentId: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId: currentPatient?.id || 1,
      timestamp: new Date().toISOString(),
      detectedLanguage: appLanguage,
      emergencyType: type,
      severity,
      locationIfAvailable: 'Kodaikanal Rural Sector, Tamil Nadu',
      source: 'MANUAL_BUTTON',
      status: 'LOCAL_ONLY',
      dispatchStatus: 'LOCAL_ONLY',
      createdAt: new Date().toISOString(),
    };

    try {
      const id = await db.emergencyIncidents.add(incident);
      setActiveIncident({ ...incident, id });
      setStatusMessage('Emergency incident created locally in Medora. External dispatch requires cellular connection.');
    } catch (e) {
      console.error('Failed to log emergency incident:', e);
    }
  };

  // Trigger Family Alert for each authorized family member
  const handleFamilyAlert = async () => {
    if (!currentPatient) return;
    setIsAlerting(true);

    try {
      await createEmergencyIncident('FAMILY_EMERGENCY_ALERT', 'HIGH');

      const recipients = familyMembers.length > 0
        ? familyMembers
        : [
            { id: 99, name: 'Family Contact (Mother)', phone: currentPatient.emergencyContact || '9876500001' },
            { id: 98, name: 'Family Contact (Father)', phone: '9876500002' },
          ];

      const newAlerts: FamilyAlertOutbox[] = [];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      for (const rec of recipients) {
        const alertRecord: FamilyAlertOutbox = {
          alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          familyId: currentPatient.familyId || 1,
          patientId: currentPatient.id || 1,
          recipientId: rec.id,
          recipientName: rec.name,
          recipientPhone: rec.phone,
          message: `🚨 EMERGENCY ALERT from MEDORA: ${currentPatient.name} may need urgent assistance at ${timestamp}. Location: Kodaikanal.`,
          language: appLanguage,
          timestamp: new Date().toISOString(),
          status: 'PENDING_OFFLINE',
        };

        const id = await db.familyAlertOutbox.add(alertRecord);
        newAlerts.push({ ...alertRecord, id });
      }

      setAlertOutbox(prev => [...newAlerts, ...prev]);
      setStatusMessage(`Family alert prepared in offline outbox for ${recipients.length} family member(s).`);
      setShowOutboxModal(true);
    } catch (e) {
      console.error('Failed to create family alerts:', e);
    } finally {
      setIsAlerting(false);
    }
  };

  const handleCallEmergencyContact = () => {
    const contactPhone = currentPatient?.emergencyContact || '108';
    callPhoneNumber(contactPhone);
  };

  const handleCallHospital = () => {
    callPhoneNumber('04542-241200'); // Kodaikanal Government Hospital
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Sticky High-Contrast Emergency Header */}
      <div className="bg-[#DC2626] px-4 py-3.5 sticky top-0 z-30 shadow-lg border-b border-red-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-white animate-pulse" />
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                🚨 {t('emergency.title', 'EMERGENCY MODE')}
              </h1>
              <p className="text-[11px] text-red-100 font-medium">
                Patient: {currentPatient?.name || 'Registered Patient'} · Offline Safe
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-black/30 hover:bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Truthful Dispatch Notice */}
        <div className="bg-amber-950/80 border border-amber-600/60 rounded-2xl p-3.5 text-xs text-amber-200">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle size={15} />
            <span>Offline Prototype Notice:</span>
          </div>
          <p className="mt-1 leading-relaxed">
            Emergency incidents and family alerts are recorded in your on-device local storage. External dispatch requires cellular calling or telephony network capabilities.
          </p>
        </div>

        {statusMessage && (
          <div className="bg-emerald-950/90 border border-emerald-600 rounded-2xl p-3 text-xs text-emerald-200 flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: Large Emergency Primary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Call Emergency Contact */}
          <button
            onClick={handleCallEmergencyContact}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-red-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              📞
            </div>
            <div>
              <div className="text-base font-black">Call Emergency Contact</div>
              <div className="text-xs text-red-100 font-mono mt-0.5">
                {currentPatient?.emergencyContact || '108 (National Ambulance)'}
              </div>
            </div>
          </button>

          {/* 2. Call Hospital */}
          <button
            onClick={handleCallHospital}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-blue-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              🏥
            </div>
            <div>
              <div className="text-base font-black">Call Nearest Hospital</div>
              <div className="text-xs text-blue-100 mt-0.5">
                Kodaikanal Govt Hospital (04542-241200)
              </div>
            </div>
          </button>

          {/* 3. Family Alert */}
          <button
            onClick={handleFamilyAlert}
            disabled={isAlerting}
            className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-orange-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              👪
            </div>
            <div>
              <div className="text-base font-black">Send Family Alert</div>
              <div className="text-xs text-orange-100 mt-0.5">
                Prepares alert for all authorized family contacts
              </div>
            </div>
          </button>

          {/* 4. Doctor Alert / Consultation */}
          <Link
            to="/ai"
            className="flex items-center gap-3 bg-purple-700 hover:bg-purple-800 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-purple-600 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              👨‍⚕️
            </div>
            <div>
              <div className="text-base font-black">Doctor Alert & AI Triage</div>
              <div className="text-xs text-purple-200 mt-0.5">
                Clinical guidance with Dr. Arjun Mehta
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Workflow Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setShowOutboxModal(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <Eye size={16} className="text-teal-400" />
            <span>View Family Alerts ({alertOutbox.length})</span>
          </button>

          <Link
            to="/hospitals"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <Building2 size={16} className="text-blue-400" />
            <span>Hospital Directory</span>
          </Link>

          <Link
            to="/doctor-summary"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <FileText size={16} className="text-emerald-400" />
            <span>Emergency Handoff</span>
          </Link>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-rose-400 flex flex-col items-center justify-center gap-1"
          >
            <X size={16} className="text-rose-400" />
            <span>Cancel Emergency</span>
          </button>
        </div>

        {/* First Aid Instructions */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse size={18} className="text-red-400" />
            <h2 className="font-extrabold text-sm text-white">
              Instant First Aid Protocols
            </h2>
          </div>

          <div className="space-y-2">
            {FIRST_AID.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-200 text-left hover:bg-slate-800/50"
                >
                  <span>{item.title}</span>
                  <span className="text-slate-400">{expandedId === item.id ? '▲' : '▼'}</span>
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-3.5 pt-1 space-y-1.5 text-xs text-slate-300 border-t border-slate-800">
                    {item.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-red-400 flex-shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family Alert Outbox Modal */}
      {showOutboxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-orange-400" />
                <h3 className="font-extrabold text-base text-white">Family Alert Outbox (Offline)</h3>
              </div>
              <button onClick={() => setShowOutboxModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="py-2 text-[11px] text-slate-400">
              SMS DEMO / OFFLINE OUTBOX · Recorded locally in IndexedDB
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 my-2">
              {alertOutbox.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No family alerts in outbox yet. Tap "Send Family Alert" to prepare alerts.
                </div>
              ) : (
                alertOutbox.map((alert) => (
                  <div key={alert.id || alert.alertId} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>To: {alert.recipientName} ({alert.recipientPhone})</span>
                      <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-full font-mono">
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed bg-slate-900/70 p-2 rounded-lg font-mono">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowOutboxModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
