import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, MedicalRecord } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import {
  FileText, Plus, Search, Printer, Share2,
  X, CheckCircle, AlertTriangle, Calendar, Building2
} from 'lucide-react';

const TYPES = ['report', 'vitals', 'consultation', 'prescription'];

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('report');
  const [showAdd, setShowAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Modals state
  const [viewingReport, setViewingReport] = useState<MedicalRecord | null>(null);
  const [sharingRecord, setSharingRecord] = useState<MedicalRecord | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    type: 'report',
    title: '',
    labOrDoctor: '',
    date: new Date().toISOString().split('T')[0],
    data: '',
    status: 'NORMAL'
  });

  useEffect(() => {
    if (!currentUser?.id) return;
    const pid = currentUser.role === 'patient' ? currentUser.id : undefined;
    if (!pid) {
      db.medicalRecords.where({ type: activeType }).toArray().then(setRecords);
      return;
    }
    db.medicalRecords.where({ patientId: pid, type: activeType }).toArray().then(setRecords);
  }, [currentUser, activeType, refresh]);

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const str = (JSON.stringify(r.data) + ' ' + (r.notes || '')).toLowerCase();
    return str.includes(searchQuery.toLowerCase());
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const recordData: Record<string, unknown> = {
      reportName: form.title.trim() || `${form.type.toUpperCase()} Record`,
      lab: form.labOrDoctor.trim() || 'Kodaikanal Primary Health Centre',
      note: form.data,
      status: form.status,
    };

    await db.medicalRecords.add({
      patientId: currentUser.id,
      type: form.type as 'vitals' | 'report' | 'vaccination' | 'consultation' | 'prescription',
      date: form.date,
      data: recordData,
      notes: form.data,
    });

    setShowAdd(false);
    setForm({
      type: 'report',
      title: '',
      labOrDoctor: '',
      date: new Date().toISOString().split('T')[0],
      data: '',
      status: 'NORMAL'
    });
    setRefresh(r => r + 1);
  };

  const handleShareToSms = async (rec: MedicalRecord) => {
    const reportTitle = (rec.data as any)?.reportName || rec.type;
    const text = `MEDORA MEDICAL RECORD\nPatient ID: ${rec.patientId}\nType: ${rec.type}\nTitle: ${reportTitle}\nDate: ${rec.date}\nNotes: ${rec.notes || 'Recorded in Medora'}\n[Local Demo Outbox]`;

    await db.smsOutbox.add({
      toPhone: '9800001111 (Doctor/Family)',
      message: text,
      type: 'medical_record',
      language: language || 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setShareFeedback('✓ Medical report summary added to SMS Outbox!');
    setTimeout(() => {
      setShareFeedback(null);
      setSharingRecord(null);
    }, 2500);
  };

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center text-2xl flex-shrink-0">
              📋
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                {t('records.title', 'Medical Records & Diagnostic Reports')}
              </h1>
              <p className="text-xs text-[#64748B]">
                {t('records.subtitle', 'Secure, on-device health documentation and lab reports')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => setShowAdd(true)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>{t('records.addRecord', 'Add Record')}</span>
            </button>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeType === type
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                {t(`records.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports, parameters, labs, or clinical notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-2xs"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-2">
            <div className="text-4xl">📋</div>
            <p className="font-bold text-sm text-slate-700">{t('records.noRecords', 'No medical records found in this category')}</p>
            <p className="text-xs text-slate-500">Add a new record or scan a report using the camera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map(r => {
              const data = (r.data || {}) as any;
              const isReport = r.type === 'report';
              const reportName = data.reportName || (data.note ? 'Clinical Record' : 'Lab Test');
              const lab = data.lab || (r.doctorId ? `Doctor Consultation #${r.doctorId}` : 'Rural Health Centre');

              return (
                <div key={r.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 font-bold px-2.5 py-0.5 rounded-full capitalize">
                        {r.type}
                      </span>
                      {data.status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          data.status === 'ABNORMAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {data.status}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B] font-mono">{r.date}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">{reportName}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">{lab}</p>
                  </div>

                  {r.notes && (
                    <div className="text-xs bg-[#FFFBEB] text-[#92400E] p-2.5 rounded-xl border border-[#FDE68A]">
                      {r.notes}
                    </div>
                  )}

                  {/* Parameters Table if available */}
                  {data.parameters && Array.isArray(data.parameters) && (
                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[#475569]">
                          <tr>
                            <th className="px-3 py-2 font-bold">Parameter</th>
                            <th className="px-3 py-2 font-bold">Result</th>
                            <th className="px-3 py-2 font-bold">Ref Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] bg-white">
                          {data.parameters.map((p: any, idx: number) => (
                            <tr key={idx} className={p.status !== 'NORMAL' ? 'bg-[#FEF2F2]/40' : ''}>
                              <td className="px-3 py-2 font-medium text-[#0F172A]">{p.name}</td>
                              <td className="px-3 py-2">
                                <span className={`font-bold ${p.status === 'HIGH' ? 'text-[#DC2626]' : p.status === 'LOW' ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                                  {p.result}
                                </span>
                                <span className="text-[10px] text-[#64748B] ml-1">{p.unit}</span>
                              </td>
                              <td className="px-3 py-2 text-[#64748B]">{p.ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setViewingReport(r)}
                      className="flex-1 bg-[#EFF6FF] text-[#2563EB] py-2 rounded-xl text-xs font-bold border border-[#2563EB]/30 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText size={14} />
                      <span>View Full Sheet / PDF</span>
                    </button>
                    <button
                      onClick={() => setSharingRecord(r)}
                      className="flex-1 bg-slate-50 text-[#475569] py-2 rounded-xl text-xs font-bold border border-[#E2E8F0] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Share2 size={14} />
                      <span>Share Record</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW FULL REPORT MODAL */}
        {viewingReport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Diagnostic Report Sheet
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {(viewingReport.data as any)?.reportName || viewingReport.type}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingReport(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Lab & Patient Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility / Laboratory:</span>
                  <span className="font-bold text-slate-800">{(viewingReport.data as any)?.lab || 'Kodaikanal Government Hospital'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date of Examination:</span>
                  <span className="font-mono font-bold">{viewingReport.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono text-slate-600">MED-REC-{viewingReport.id}</span>
                </div>
              </div>

              {/* Parameters Breakdown */}
              {(viewingReport.data as any)?.parameters && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Test Parameters & Measured Values:
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="px-3 py-2 font-bold">Parameter</th>
                          <th className="px-3 py-2 font-bold">Observed</th>
                          <th className="px-3 py-2 font-bold">Reference</th>
                          <th className="px-3 py-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {((viewingReport.data as any).parameters as any[]).map((p, i) => (
                          <tr key={i} className={p.status !== 'NORMAL' ? 'bg-red-50/40' : ''}>
                            <td className="px-3 py-2 font-semibold text-slate-900">{p.name}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{p.result} {p.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{p.ref}</td>
                            <td className="px-3 py-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                p.status === 'HIGH' ? 'bg-red-100 text-red-700' : p.status === 'LOW' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clinical Notes / Interpretation */}
              {viewingReport.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">Interpretation / Doctor Notes:</span>
                  <p className="text-amber-800">{viewingReport.notes}</p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer size={15} />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE MODAL */}
        {sharingRecord && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-blue-600" />
                  <h3 className="font-black text-sm text-slate-900">Share Medical Record</h3>
                </div>
                <button
                  onClick={() => setSharingRecord(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {shareFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold">
                  {shareFeedback}
                </div>
              )}

              <p className="text-xs text-slate-600">
                Send this diagnostic summary to your registered family contact or doctor via Medora's offline SMS dispatch queue:
              </p>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700 space-y-1">
                <div><strong>Record:</strong> {(sharingRecord.data as any)?.reportName || sharingRecord.type}</div>
                <div><strong>Date:</strong> {sharingRecord.date}</div>
                <div><strong>Summary:</strong> {sharingRecord.notes || 'Recorded in Medora'}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSharingRecord(null)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareToSms(sharingRecord)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Send via SMS Outbox
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD RECORD MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-black text-base text-[#0F172A]">
                  {t('records.addRecord', 'Add New Medical Record')}
                </h2>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#475569] mb-1">{t('records.type', 'Record Type')}</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-500"
                  >
                    {TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#475569] mb-1">Title / Test Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Blood Count, Fasting Blood Sugar, Prescription"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#475569] mb-1">{t('records.date', 'Date')}</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#475569] mb-1">Facility / Doctor</label>
                    <input
                      type="text"
                      placeholder="e.g. Kodaikanal Govt Hospital"
                      value={form.labOrDoctor}
                      onChange={e => setForm(p => ({ ...p, labOrDoctor: e.target.value }))}
                      className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#475569] mb-1">Clinical Findings / Notes</label>
                  <textarea
                    value={form.data}
                    onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    rows={3}
                    placeholder="Enter observations, test values, dosages, or physician directions..."
                    className="w-full border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    {t('common.save', 'Save Record')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
