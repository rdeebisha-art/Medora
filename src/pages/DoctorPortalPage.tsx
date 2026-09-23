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
            <h1 className="text-xl font-bold text-gray-900">👨‍⚕️ {t('doctor.portal')}</h1>
            <p className="text-sm text-gray-500">Dr. {currentUser.name}</p>
          </div>
          <DemoDataBadge />
        </div>

        {!selected ? (
          <>
            <h2 className="font-semibold text-gray-700 mb-3">{t('doctor.patients')}</h2>
            <div className="space-y-2">
              {patients.map(p => (
                <button key={p.id} onClick={() => selectPatient(p)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-sky-400 hover:bg-sky-50 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">{p.name[0]}</div>
                    <div>
                      <div className="font-bold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.age} {t('common.years')} · {p.gender} · {p.village}</div>
                      {p.conditions?.length > 0 && <div className="text-xs text-red-600">{p.conditions.join(', ')}</div>}
                    </div>
                    {p.isPregnant && <span className="ml-auto text-pink-500 text-xl">🤰</span>}
                    {p.isElderly && <span className="ml-auto text-orange-500 text-xl">👴</span>}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sky-600 font-medium mb-4">← {t('common.back')}</button>

            {/* Patient Summary */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4">
              <div className="font-bold text-gray-900 text-lg">{selected.name}</div>
              <div className="text-sm text-gray-600">{selected.age} {t('common.years')} · {selected.gender} · {selected.bloodGroup} · {selected.village}</div>
              {selected.allergies?.length > 0 && (
                <div className="mt-2 text-sm text-red-600">🚫 Allergies: {selected.allergies.join(', ')}</div>
              )}
              {selected.conditions?.length > 0 && (
                <div className="mt-1 text-sm text-orange-600">⚠️ Conditions: {selected.conditions.join(', ')}</div>
              )}
              {selected.isPregnant && (
                <div className="mt-1 text-sm text-pink-600">🤰 Pregnant: {selected.pregnancyWeeks}w</div>
              )}
            </div>

            {/* Current Medicines */}
            {medicines.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">💊 Current Medicines</h3>
                {medicines.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium">{m.name} {m.dose}</span>
                    <span className="text-xs text-gray-500">{m.frequency}</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Summary */}
            {summary && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 mb-4 shadow-sm">
                <h3 className="font-bold text-cyan-800 mb-2">📄 AI Patient Summary</h3>
                {summary.complaint && <div className="text-sm"><strong>Complaint:</strong> {summary.complaint}</div>}
                {summary.observations && <div className="text-sm mt-1"><strong>Observations:</strong> {summary.observations.slice(0, 200)}...</div>}
                {summary.warningSigns && <div className="text-sm mt-1 text-red-600"><strong>Warning Signs:</strong> {summary.warningSigns}</div>}
                {summary.nextStep && <div className="text-sm mt-1"><strong>Suggested Next Step:</strong> {summary.nextStep}</div>}
                <p className="text-xs text-gray-400 mt-2">Created: {summary.createdAt?.slice(0, 10)}</p>
              </div>
            )}

            {/* Doctor Notes */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">📝 {t('doctor.notes')}</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Add clinical notes, diagnosis, prescription, follow-up instructions..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:border-sky-400 focus:outline-none"
              />
              <button onClick={saveNotes} className={`mt-2 w-full py-3 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-sky-600 text-white hover:bg-sky-700'}`}>
                {saved ? '✅ Notes Saved' : t('doctor.saveNotes')}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
