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
          <h1 className="text-xl font-black text-[#DB2777]">🤰 {t('maternity.title')}</h1>
          <DemoDataBadge />
        </div>

        {patient?.isPregnant && (
          <div className="bg-[#FDF2F8] border border-[#DB2777]/30 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤰</span>
              <div className="flex-1">
                <div className="font-extrabold text-[#DB2777] text-base">{patient.name}</div>
                <div className="text-xs text-[#0F172A] font-medium">Week {weeks} · {trimester} Trimester</div>
                <div className="w-full bg-pink-100 rounded-full h-2.5 mt-2 overflow-hidden border border-pink-200">
                  <div className="bg-[#DB2777] h-2.5 rounded-full" style={{ width: `${(weeks / 40) * 100}%` }} />
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">{40 - weeks} weeks remaining</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl p-4 shadow-2xs">
          <h2 className="font-extrabold text-[#2563EB] text-xs mb-1">💡 Week {weeks} Tip</h2>
          <p className="text-xs text-[#0F172A] leading-relaxed">{tip}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">🥗 {t('maternity.nutrition')}</h2>
          {['Iron-rich: Spinach, dal, jaggery, meat', 'Folic acid: Green leafy vegetables, lentils', 'Calcium: Milk, curd, paneer, ragi', 'Protein: Eggs, fish, pulses, nuts', 'Avoid: Raw meat, papaya, alcohol, excess caffeine'].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#475569] py-1">
              <span className="text-[#16A34A] font-bold flex-shrink-0">✓</span> {item}
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">📅 {t('maternity.antenatal')}</h2>
          {[
            { label: 'First Visit (< 12 weeks)', done: weeks > 12 },
            { label: 'Blood Tests + Weight (16w)', done: weeks > 16 },
            { label: 'Anomaly Scan (20w)', done: weeks > 20 },
            { label: 'Glucose Test (24-28w)', done: weeks > 28 },
            { label: 'Birth Plan Discussion (36w)', done: weeks > 36 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#E2E8F0] last:border-0">
              <span>{item.done ? '✅' : '📅'}</span>
              <span className={`text-xs ${item.done ? 'text-[#16A34A] font-semibold line-through' : 'text-[#0F172A]'}`}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#DC2626] text-sm mb-3">⚠️ {t('maternity.warningSigns')}</h2>
          {WARNING_SIGNS.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#B91C1C] py-1">
              <span className="flex-shrink-0">🔴</span> {s}
            </div>
          ))}
          <Link to="/emergency" className="block w-full mt-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-center py-3 rounded-xl font-bold text-xs shadow-sm transition-colors">🚨 Emergency Help</Link>
        </div>
      </div>
    </Layout>
  );
}
