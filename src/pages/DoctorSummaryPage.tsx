import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, DoctorSummary } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';

export default function DoctorSummaryPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [summary, setSummary] = useState<DoctorSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    if (pid) {
      db.doctorSummaries.where({ patientId: pid }).last().then(s => setSummary(s || null));
    } else {
      db.doctorSummaries.orderBy('createdAt').last().then(s => setSummary(s || null));
    }
  }, [currentUser]);

  const handlePrint = () => window.print();

  const addToSms = async () => {
    if (!summary) return;
    const text = `MEDORA DOCTOR SUMMARY\nPatient ID: ${summary.patientId}\nComplaint: ${summary.complaint}\nMedicines: ${summary.medicines}\nAllergies: ${summary.allergies}\nNext Step: ${summary.nextStep}\n[Demo — recorded locally in Medora outbox]`;
    await db.smsOutbox.add({
      toPhone: 'Doctor',
      message: text,
      type: 'doctor_summary',
      language: 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setToastMessage('✓ Doctor summary added to SMS Outbox (Demo)');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const Section = ({ title, content }: { title: string; content?: string }) => {
    if (!content) return null;
    return (
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</div>
        <div className="text-sm text-gray-800 whitespace-pre-line">{content}</div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">📄 {t('doctorSummary.title')}</h1>
          <DemoDataBadge />
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-semibold mb-4 shadow-2xs">
            {toastMessage}
          </div>
        )}

        {!summary ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-gray-500 mb-4">{t('doctorSummary.noSummary')}</p>
            <Link to="/ai" className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold inline-block">
              🤖 {t('doctorSummary.goToAI')}
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-sky-600 text-white px-4 py-3">
                <div className="font-bold text-lg">{t('doctorSummary.title')}</div>
                <div className="text-xs opacity-80">{t('doctorSummary.disclaimer')}</div>
                <div className="text-xs opacity-70 mt-0.5">{t('doctorSummary.createdAt')}: {summary.createdAt?.slice(0, 16)}</div>
              </div>

              <div className="p-4 space-y-3">
                <Section title={t('doctorSummary.complaint')} content={summary.complaint} />
                <Section title={t('doctorSummary.symptoms')} content={Array.isArray(summary.symptoms) ? summary.symptoms.join(', ') : summary.symptoms} />
                <Section title={t('doctorSummary.history')} content={summary.history} />

                <div className="grid grid-cols-2 gap-3">
                  <Section title={t('doctorSummary.medicines')} content={summary.medicines} />
                  <Section title={t('doctorSummary.allergies')} content={summary.allergies || 'None known'} />
                </div>

                {summary.vitals && <Section title={t('doctorSummary.vitals')} content={summary.vitals} />}

                {summary.observations && (
                  <div className="bg-violet-50 rounded-xl p-3">
                    <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1">🤖 {t('doctorSummary.observations')} (Offline AI)</div>
                    <div className="text-sm text-gray-800 whitespace-pre-line line-clamp-4">{summary.observations}</div>
                  </div>
                )}

                {summary.warningSigns && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">⚠️ {t('doctorSummary.warningSigns')}</div>
                    <div className="text-sm text-red-700">{Array.isArray(summary.warningSigns) ? summary.warningSigns.join(', ') : summary.warningSigns}</div>
                  </div>
                )}

                {summary.nextStep && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">✅ {t('doctorSummary.nextStep')}</div>
                    <div className="text-sm text-green-800">{summary.nextStep}</div>
                  </div>
                )}

                {summary.doctorNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">👨‍⚕️ {t('doctorSummary.doctorNotes')}</div>
                    <div className="text-sm text-amber-800">{summary.doctorNotes}</div>
                  </div>
                )}

                {summary.languageBridgeUsed && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-1">
                      🌐 {t('doctorSummary.bridgeUsed')}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-sky-100">
                      <div>
                        <span className="font-semibold text-slate-800">{t('doctorSummary.patientLanguage')}:</span>{' '}
                        {summary.patientLanguage || 'Local Language'}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">{t('doctorSummary.doctorLanguage')}:</span>{' '}
                        {summary.doctorLanguage || 'Clinical Language'}
                      </div>
                    </div>
                    {summary.originalPatientStatements && (
                      <div className="text-xs bg-white p-2 rounded-lg border border-sky-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">{t('doctorSummary.originalPatient')}:</span>
                        <span className="text-slate-700 whitespace-pre-line">{summary.originalPatientStatements}</span>
                      </div>
                    )}
                    {summary.translatedPatientStatements && (
                      <div className="text-xs bg-white p-2 rounded-lg border border-sky-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">{t('doctorSummary.translatedPatient')}:</span>
                        <span className="text-slate-700 whitespace-pre-line">{summary.translatedPatientStatements}</span>
                      </div>
                    )}
                    {summary.doctorResponseOriginal && (
                      <div className="text-xs bg-white p-2 rounded-lg border border-sky-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">{t('doctorSummary.doctorResponse')}:</span>
                        <span className="text-slate-700 whitespace-pre-line">{summary.doctorResponseOriginal}</span>
                      </div>
                    )}
                    {summary.doctorResponseTranslated && (
                      <div className="text-xs bg-white p-2 rounded-lg border border-sky-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">{t('doctorSummary.patientTranslation')}:</span>
                        <span className="text-slate-700 whitespace-pre-line">{summary.doctorResponseTranslated}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                <button onClick={handlePrint} className="bg-gray-700 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800">
                  🖨️ {t('doctorSummary.print')}
                </button>
                <button onClick={addToSms} className="bg-sky-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-sky-700">
                  📱 {t('doctorSummary.addToSms')}
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link to="/ai" className="flex-1 bg-violet-100 text-violet-700 text-center py-3 rounded-2xl font-medium text-sm">
                🤖 Update via AI
              </Link>
              <Link to="/sms" className="flex-1 bg-sky-100 text-sky-700 text-center py-3 rounded-2xl font-medium text-sm">
                📱 SMS Outbox
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
