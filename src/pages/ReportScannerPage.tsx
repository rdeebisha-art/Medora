import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const REPORT_TYPES = ['Blood Test', 'Urine Test', 'X-Ray Report', 'Ultrasound', 'ECG', 'Blood Pressure', 'Blood Sugar', 'Prescription', 'Other'];

export default function ReportScannerPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'Blood Test', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    await db.medicalRecords.add({
      patientId: currentUser.id,
      type: 'report' as const,
      date: form.date,
      data: { reportType: form.type, notes: form.notes, hasImage: !!preview, demoNote: 'Image stored locally (demo)' },
    });
    setSaved(true);
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">📷 {t('reportScanner.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-700">
          📷 {t('reportScanner.ocrNote')}
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center bg-sky-50 border-2 border-sky-300 border-dashed rounded-2xl p-5 hover:bg-sky-100 transition-all">
            <span className="text-3xl mb-2">📂</span>
            <span className="text-sm font-bold text-sky-700">{t('reportScanner.upload')}</span>
          </button>
          <button onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center bg-green-50 border-2 border-green-300 border-dashed rounded-2xl p-5 hover:bg-green-100 transition-all">
            <span className="text-3xl mb-2">📷</span>
            <span className="text-sm font-bold text-green-700">{t('reportScanner.capture')}</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        {preview && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-gray-300">
            <img src={preview} alt="Report preview" className="w-full object-contain max-h-64" />
          </div>
        )}

        {/* Manual Entry */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-800">{t('reportScanner.manualEntry')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportScanner.reportType')}</label>
            <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5">
              {REPORT_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportScanner.reportDate')}</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportScanner.results')}</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
              placeholder="Enter key results, values, or doctor's notes..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 resize-none text-sm" />
          </div>
          <button onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-sky-600 text-white hover:bg-sky-700'}`}>
            {saved ? '✅ Saved to Records' : t('reportScanner.save')}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">{t('reportScanner.disclaimer')}</p>
      </div>
    </Layout>
  );
}
