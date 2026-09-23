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
      message: '🚨 EMERGENCY ALERT from MEDORA: Your family member may need urgent help. Please call them immediately. [Demo SMS — not actually sent]',
      type: 'emergency_alert',
      language: 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setAlertSent(true);
  };

  const handleAmbulanceCall = async () => {
    await db.smsOutbox.add({
      toPhone: '108',
      message: 'EMERGENCY: Requesting ambulance from Kodaikanal area. [Demo — not actually sent]',
      type: 'emergency_alert',
      language: 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setAmbulanceCalled(true);
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-black">🚨 {t('emergency.title')}</h1>
            <p className="text-xs text-red-200 mt-0.5">No login required — always accessible</p>
          </div>
          <Link to="/dashboard" className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">← Home</Link>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-3">
        {/* Demo Notice */}
        <div className="bg-amber-100 border border-amber-300 rounded-2xl p-3 text-sm text-amber-800">
          ⚠️ <strong>{t('common.demoData')}:</strong> {t('emergency.demoNote')}
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAmbulanceCall}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl font-bold text-center transition-all shadow-lg active:scale-95 ${ambulanceCalled ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <span className="text-3xl mb-2">🚑</span>
            <span className="text-base">{t('emergency.callAmbulance')}</span>
            {ambulanceCalled && <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">Added to SMS Outbox</span>}
          </button>
          <button
            onClick={handleFamilyAlert}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl font-bold text-center transition-all shadow-lg active:scale-95 ${alertSent ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            <span className="text-3xl mb-2">👪</span>
            <span className="text-base">{t('emergency.familyAlert')}</span>
            {alertSent && <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">{t('emergency.alertSent')}</span>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/hospitals" className="flex flex-col items-center justify-center p-4 bg-sky-600 text-white rounded-2xl font-bold text-center shadow-md hover:bg-sky-700 active:scale-95">
            <span className="text-2xl mb-1">🏥</span>
            <span className="text-sm">{t('emergency.nearestHospital')}</span>
          </Link>
          <Link to="/transport" className="flex flex-col items-center justify-center p-4 bg-purple-600 text-white rounded-2xl font-bold text-center shadow-md hover:bg-purple-700 active:scale-95">
            <span className="text-2xl mb-1">🚗</span>
            <span className="text-sm">{t('emergency.transportHelp')}</span>
          </Link>
        </div>

        {/* Hospital Quick Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">🏥 Nearest Emergency Hospitals</h2>
          {[
            { name: 'Kodaikanal Govt Hospital', phone: '04542-241234', dist: '5 km', emergency: true },
            { name: 'CHC Palani', phone: '04545-241000', dist: '25 km', emergency: true },
            { name: 'AIIMS Madurai', phone: '0452-2530000', dist: '120 km', emergency: true },
          ].map(h => (
            <div key={h.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-gray-900 text-sm">{h.name}</div>
                <div className="text-xs text-gray-500">{h.dist} · {h.phone}</div>
              </div>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Emergency ✓</span>
            </div>
          ))}
        </div>

        {/* First Aid Guides */}
        <h2 className="font-bold text-gray-900">🩹 {t('emergency.firstAid')}</h2>
        <div className="space-y-2">
          {FIRST_AID.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-4 font-bold text-gray-900 text-left"
              >
                <span>{item.title}</span>
                <span className="text-gray-400">{expandedId === item.id ? '▲' : '▼'}</span>
              </button>
              {expandedId === item.id && (
                <div className="px-4 pb-4 space-y-2">
                  {item.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="font-bold text-red-600 flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/ai" className="block w-full bg-violet-600 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-violet-700 active:scale-95">
          🤖 {t('emergency.callDoctor')} via Medora AI
        </Link>

        <p className="text-xs text-center text-gray-400 pb-4">{t('common.disclaimer')}</p>
      </div>
    </div>
  );
}
