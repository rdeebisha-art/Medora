import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, DoctorSummary, Medicine } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function DoctorPortalPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<DoctorSummary | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.patients.toArray().then(setPatients);
  }, []);

  const selectPatient = async (p: Patient) => {
    setSelected(p);
    setSaved(false);
    setNotes('');
    const summ = await db.doctorSummaries.where({ patientId: p.id! }).last();
    setSummary(summ || null);
    const meds = await db.medicines.where({ patientId: p.id!, status: 'active' }).toArray();
    setMedicines(meds);
  };

  const saveNotes = async () => {
    if (!selected || !notes) return;
    if (summary?.id) {
      await db.doctorSummaries.update(summary.id, { doctorNotes: notes });
    } else {
      await db.doctorSummaries.add({
        patientId: selected.id!,
        doctorId: currentUser?.id || 1,
        complaint: 'Doctor review',
        symptoms: [],
        duration: '',
        history: selected.conditions?.join(', ') || '',
        medicines: medicines.map(m => m.name).join(', '),
        allergies: selected.allergies?.join(', ') || '',
        vitals: '',
        observations: '',
        warningSigns: [],
        nextStep: notes,
        doctorNotes: notes,
        createdAt: new Date().toISOString(),
      });
    }
    setSaved(true);
  };

  if (currentUser?.role !== 'doctor') {
    return <Layout><div className="p-6 text-center text-gray-500"><div className="text-4xl mb-2">🔒</div><p>Doctor login required.</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-[#2563EB]">👨‍⚕️ {t('doctor.portal')}</h1>
            <p className="text-xs text-[#64748B] font-medium">Dr. {currentUser.name}</p>
          </div>
          <DemoDataBadge />
        </div>

        {!selected ? (
          <>
            <h2 className="font-extrabold text-[#0F172A] text-sm mb-3">{t('doctor.patients')}</h2>
            <div className="space-y-2">
              {patients.map(p => (
                <button key={p.id} onClick={() => selectPatient(p)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 text-left hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/40 transition-all shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#2563EB] text-white rounded-full w-10 h-10 flex items-center justify-center font-black shadow-2xs">{p.name[0]}</div>
                    <div className="flex-1">
                      <div className="font-bold text-[#0F172A] text-sm">{p.name}</div>
                      <div className="text-xs text-[#64748B]">{p.age} {t('common.years')} · {p.gender} · {p.village}</div>
                      {p.conditions?.length > 0 && <div className="text-xs text-[#DC2626] font-medium">{p.conditions.join(', ')}</div>}
                    </div>
                    {p.isPregnant && <span className="ml-auto text-[#DB2777] text-xl">🤰</span>}
                    {p.isElderly && <span className="ml-auto text-[#EA580C] text-xl">👴</span>}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-[#0F766E] font-bold text-xs mb-4 hover:underline">← {t('common.back')}</button>

            {/* Patient Summary */}
            <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl p-4 mb-4 shadow-2xs">
              <div className="font-extrabold text-[#0F172A] text-base">{selected.name}</div>
              <div className="text-xs text-[#475569] mt-0.5">{selected.age} {t('common.years')} · {selected.gender} · {selected.bloodGroup} · {selected.village}</div>
              {selected.allergies?.length > 0 && (
                <div className="mt-2 text-xs text-[#DC2626] font-semibold">🚫 Allergies: {selected.allergies.join(', ')}</div>
              )}
              {selected.conditions?.length > 0 && (
                <div className="mt-1 text-xs text-[#EA580C] font-semibold">⚠️ Conditions: {selected.conditions.join(', ')}</div>
              )}
              {selected.isPregnant && (
                <div className="mt-1 text-xs text-[#DB2777] font-semibold">🤰 Pregnant: {selected.pregnancyWeeks}w</div>
              )}
            </div>

            {/* Current Medicines */}
            {medicines.length > 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-4 shadow-xs">
                <h3 className="font-extrabold text-[#0F172A] text-xs mb-2">💊 Current Medicines</h3>
                {medicines.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-[#E2E8F0] last:border-0">
                    <span className="text-xs font-bold text-[#0F172A]">{m.name} {m.dose}</span>
                    <span className="text-xs text-[#16A34A] font-semibold">{m.frequency}</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Summary */}
            {summary && (
              <div className="bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-2xl p-4 mb-4 shadow-2xs">
                <h3 className="font-extrabold text-[#7C3AED] text-xs mb-2">📄 AI Patient Summary</h3>
                {summary.complaint && <div className="text-xs text-[#0F172A]"><strong>Complaint:</strong> {summary.complaint}</div>}
                {summary.observations && <div className="text-xs text-[#475569] mt-1"><strong>Observations:</strong> {summary.observations.slice(0, 200)}...</div>}
                {summary.warningSigns && <div className="text-xs text-[#DC2626] font-semibold mt-1"><strong>Warning Signs:</strong> {summary.warningSigns}</div>}
                {summary.nextStep && <div className="text-xs text-[#0F766E] font-medium mt-1"><strong>Suggested Next Step:</strong> {summary.nextStep}</div>}
                <p className="text-[10px] text-[#94A3B8] mt-2">Created: {summary.createdAt?.slice(0, 10)}</p>
              </div>
            )}

            {/* Doctor Notes */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
              <h3 className="font-extrabold text-[#0F172A] text-xs mb-2">📝 {t('doctor.notes')}</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Add clinical notes, diagnosis, prescription, follow-up instructions..."
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#0F172A] resize-none focus:border-[#2563EB] focus:outline-none"
              />
              <button onClick={saveNotes} className={`mt-2 w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs ${saved ? 'bg-[#16A34A] text-white' : 'bg-[#2563EB] hover:bg-blue-700 text-white'}`}>
                {saved ? '✅ Notes Saved' : t('doctor.saveNotes')}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
