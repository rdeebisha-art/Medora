import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';

const WARNING_SIGNS = ['Heavy vaginal bleeding', 'Severe headache or blurred vision', 'Sudden swelling of hands/face/legs', 'No fetal movement for 12+ hours', 'High fever above 101°F', 'Severe abdominal pain'];
const WEEKLY_TIPS: Record<number, string> = {
  1: 'Take Folic Acid 400–800 mcg daily to prevent neural tube defects.',
  8: 'First trimester checkup due. Confirm pregnancy with your doctor.',
  12: 'End of first trimester. Nausea may ease. Blood tests needed.',
  16: 'Baby can hear sounds. Talk and sing to your baby.',
  20: "Anomaly scan recommended. Baby's gender may be visible.",
  24: 'Glucose tolerance test for gestational diabetes.',
  28: 'Third trimester begins. Fetal movements should be felt daily.',
  32: 'Start counting fetal kicks. At least 10 per 2 hours.',
  36: 'Birth preparation. Pack hospital bag. Know signs of labour.',
  38: 'Baby is full term. Anytime now! Watch for contractions.',
};

export default function MaternityPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'patient') db.patients.get(currentUser.id).then(p => setPatient(p || null));
  }, [currentUser]);

  const weeks = patient?.pregnancyWeeks || 28;
  const trimester = weeks <= 12 ? '1st' : weeks <= 26 ? '2nd' : '3rd';
  const tip = Object.entries(WEEKLY_TIPS).filter(([w]) => parseInt(w) <= weeks).pop()?.[1] || WEEKLY_TIPS[28];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">🤰 {t('maternity.title')}</h1>
          <DemoDataBadge />
        </div>

        {patient?.isPregnant && (
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤰</span>
              <div>
                <div className="font-bold text-pink-800">{patient.name}</div>
                <div className="text-pink-600 font-medium">Week {weeks} · {trimester} Trimester</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${(weeks / 40) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{40 - weeks} weeks remaining</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h2 className="font-bold text-blue-800 mb-1">💡 Week {weeks} Tip</h2>
          <p className="text-sm text-blue-700">{tip}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">🥗 {t('maternity.nutrition')}</h2>
          {['Iron-rich: Spinach, dal, jaggery, meat', 'Folic acid: Green leafy vegetables, lentils', 'Calcium: Milk, curd, paneer, ragi', 'Protein: Eggs, fish, pulses, nuts', 'Avoid: Raw meat, papaya, alcohol, excess caffeine'].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 py-1">
              <span className="text-green-500 flex-shrink-0">✓</span> {item}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">📅 {t('maternity.antenatal')}</h2>
          {[
            { label: 'First Visit (< 12 weeks)', done: weeks > 12 },
            { label: 'Blood Tests + Weight (16w)', done: weeks > 16 },
            { label: 'Anomaly Scan (20w)', done: weeks > 20 },
            { label: 'Glucose Test (24-28w)', done: weeks > 28 },
            { label: 'Birth Plan Discussion (36w)', done: weeks > 36 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <span>{item.done ? '✅' : '📅'}</span>
              <span className={`text-sm ${item.done ? 'text-green-700 line-through' : 'text-gray-700'}`}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h2 className="font-bold text-red-800 mb-3">⚠️ {t('maternity.warningSigns')}</h2>
          {WARNING_SIGNS.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700 py-1">
              <span className="flex-shrink-0">🔴</span> {s}
            </div>
          ))}
          <Link to="/emergency" className="block w-full mt-3 bg-red-600 text-white text-center py-3 rounded-xl font-bold">🚨 Emergency Help</Link>
        </div>
      </div>
    </Layout>
  );
}
