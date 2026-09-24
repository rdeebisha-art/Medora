import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';

const FIRST_AID = [
  {
    id: 'fever', title: '🌡️ High Fever', steps: [
      'Give Paracetamol (not Aspirin for children)',
      'Apply cool, wet cloth on forehead',
      'Drink plenty of fluids — water, ORS, coconut water',
      'Do not wrap in heavy blankets',
      'Seek help if fever >104°F (40°C) or lasts >3 days',
    ]
  },
  {
    id: 'bleeding', title: '🩸 Severe Bleeding', steps: [
      'Press firmly on wound with clean cloth',
      'Do not remove the cloth — add more if soaked',
      'Keep the injured part raised above heart level',
      'Do not apply a tourniquet unless trained',
      'Call 108 immediately',
    ]
  },
  {
    id: 'choking', title: '😮‍💨 Choking', steps: [
      'Ask: "Are you choking?" — if they can speak, encourage coughing',
      'If silent: stand behind them, arms around waist',
      'Give 5 firm back blows between shoulder blades',
      'Give 5 abdominal thrusts (Heimlich)',
      'Alternate until object is expelled or help arrives',
    ]
  },
  {
    id: 'snakebite', title: '🐍 Snake Bite', steps: [
      'Keep patient calm and still — immobilize the bitten limb',
      'Remove jewellery near the bite',
      'Do NOT suck the venom, cut the wound, or apply ice',
      'Keep bitten limb BELOW heart level',
      'Rush to hospital immediately — anti-venom is only at hospitals',
    ]
  },
  {
    id: 'burn', title: '🔥 Burns', steps: [
      'Cool immediately under running cold water for 10–20 minutes',
      'Do NOT use ice, butter, or toothpaste',
      'Remove jewellery but NOT clothing stuck to the burn',
      'Cover with clean cling film or plastic bag loosely',
      'Seek medical help for burns larger than palm or on face/genitals',
    ]
  },
  {
    id: 'heartattack', title: '❤️ Chest Pain / Heart Attack', steps: [
      'Help them sit or lie in comfortable position',
      'Loosen tight clothing',
      'If they have aspirin and are not allergic: give 300mg to chew',
      'Call 108 immediately — do NOT drive yourself',
      'Be ready to perform CPR if they stop breathing',
    ]
  },
];

export default function EmergencyPage() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [ambulanceCalled, setAmbulanceCalled] = useState(false);

  const handleFamilyAlert = async () => {
    await db.smsOutbox.add({
      toPhone: 'Family Emergency Contact',
      message: '🚨 EMERGENCY ALERT from MEDORA: Your family member may need urgent help. Please call them immediately. [DEMO — queued in local outbox, not actually sent]',
      type: 'emergency_alert',
      language: 'en',
      status: 'PENDING_OFFLINE',
      createdAt: new Date().toISOString(),
    });
    setAlertSent(true);
  };

  const handleAmbulanceCall = async () => {
    await db.smsOutbox.add({
      toPhone: '108',
      message: 'EMERGENCY: Requesting ambulance from Kodaikanal area. [DEMO — queued in local outbox, not actually sent. Please call 108 directly.]',
      type: 'emergency_alert',
      language: 'en',
      status: 'PENDING_OFFLINE',
      createdAt: new Date().toISOString(),
    });
    setAmbulanceCalled(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#DC2626] text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-black">🚨 {t('emergency.title')}</h1>
            <p className="text-xs text-red-100 mt-0.5">No login required — always accessible</p>
          </div>
          <Link
            to="/dashboard"
            className="bg-white/20 hover:bg-white/30 text-white text-xs px-3.5 py-2 rounded-full font-bold transition-colors min-h-11 inline-flex items-center"
          >
            ← Home
          </Link>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-3 pb-16">
        {/* Demo Notice */}
        <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-3 text-xs text-[#D97706]">
          ⚠️ <strong>{t('common.demoData')}:</strong> {t('emergency.demoNote')}
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAmbulanceCall}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl font-bold text-center transition-all shadow-sm active:scale-95 ${ambulanceCalled ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'}`}
          >
            <span className="text-3xl mb-2">🚑</span>
            <span className="text-base font-black">{t('emergency.callAmbulance')}</span>
            {ambulanceCalled && <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">Queued in SMS Outbox (Demo)</span>}
          </button>
          <button
            onClick={handleFamilyAlert}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl font-bold text-center transition-all shadow-sm active:scale-95 ${alertSent ? 'bg-[#16A34A] text-white' : 'bg-[#EA580C] text-white hover:bg-orange-600'}`}
          >
            <span className="text-3xl mb-2">👪</span>
            <span className="text-base font-black">{t('emergency.familyAlert')}</span>
            {alertSent && <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">Queued (Demo)</span>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/hospitals" className="flex flex-col items-center justify-center p-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-bold text-center shadow-xs active:scale-95 transition-colors">
            <span className="text-2xl mb-1">🏥</span>
            <span className="text-xs font-black">{t('emergency.nearestHospital')}</span>
          </Link>
          <Link to="/transport" className="flex flex-col items-center justify-center p-4 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-2xl font-bold text-center shadow-xs active:scale-95 transition-colors">
            <span className="text-2xl mb-1">🚗</span>
            <span className="text-xs font-black">{t('emergency.transportHelp')}</span>
          </Link>
        </div>

        {/* Hospital Quick Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">🏥 Nearest Emergency Hospitals</h2>
          {[
            { name: 'Kodaikanal Govt Hospital', phone: '04542-241234', dist: '5 km', emergency: true },
            { name: 'CHC Palani', phone: '04545-241000', dist: '25 km', emergency: true },
            { name: 'AIIMS Madurai', phone: '0452-2530000', dist: '120 km', emergency: true },
          ].map(h => (
            <div key={h.name} className="flex items-center justify-between py-2 border-b border-[#E2E8F0] last:border-0">
              <div>
                <div className="font-bold text-[#0F172A] text-xs">{h.name}</div>
                <div className="text-[11px] text-[#64748B]">{h.dist} · {h.phone}</div>
              </div>
              <span className="bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-[10px] px-2 py-0.5 rounded-full font-bold">Emergency ✓</span>
            </div>
          ))}
        </div>

        {/* First Aid Guides */}
        <h2 className="font-extrabold text-[#0F172A] text-sm pt-1">🩹 {t('emergency.firstAid')}</h2>
        <div className="space-y-2">
          {FIRST_AID.map(item => (
            <div key={item.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 font-bold text-xs text-[#0F172A] text-left hover:bg-slate-50 transition-colors"
              >
                <span>{item.title}</span>
                <span className="text-[#94A3B8]">{expandedId === item.id ? '▲' : '▼'}</span>
              </button>
              {expandedId === item.id && (
                <div className="px-4 pb-4 space-y-2 border-t border-[#E2E8F0] pt-3">
                  {item.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                      <span className="font-bold text-[#DC2626] flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/ai" className="block w-full bg-[#7C3AED] hover:bg-purple-700 text-white text-center py-3.5 rounded-2xl font-bold text-sm shadow-xs active:scale-95 transition-colors">
          🤖 {t('emergency.callDoctor')} via Medora AI
        </Link>

        <p className="text-[11px] text-center text-[#64748B] pb-4">{t('common.disclaimer')}</p>
      </div>
    </div>
  );
}
