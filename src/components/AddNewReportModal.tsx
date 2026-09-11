import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { FamilyMember } from '../types';

interface AddNewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSaveReport: (report: any) => void;
}

export const AddNewReportModal: React.FC<AddNewReportModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  selectedFamilyId,
  onSaveReport,
}) => {
  const [patientId, setPatientId] = useState(selectedFamilyId);
  const [reportType, setReportType] = useState('Blood Test (CBC / Sugar)');
  const [title, setTitle] = useState('');
  const [facilityName, setFacilityName] = useState('PHC Rampur Lab');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = familyMembers.find(m => m.id === patientId) || familyMembers[0];
    onSaveReport({
      id: `rep-${Date.now()}`,
      patientId,
      patientName: selectedMember.name,
      reportType,
      title: title || `${reportType} — ${selectedMember.name}`,
      facilityName,
      date,
      notes,
      fileName: fileName || 'Scanned_Report.pdf',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900">Add New Diagnostic Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Patient Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Patient:</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relationship} • {m.age} yrs)
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Report Category:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Blood Test (CBC / Sugar / HbA1c)">Blood Test (CBC / Sugar / HbA1c)</option>
              <option value="Digital Chest X-Ray">Digital Chest X-Ray</option>
              <option value="Obstetric Ultrasound (USG)">Obstetric Ultrasound (USG)</option>
              <option value="Doctor Prescription Scan">Doctor Prescription Scan</option>
              <option value="Urine & Kidney Function (KFT)">Urine & Kidney Function (KFT)</option>
              <option value="ECG Heart Rhythm Strip">ECG Heart Rhythm Strip</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Report Title / Test Name:</label>
            <input
              type="text"
              placeholder="e.g. Fasting Blood Glucose & HbA1c"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Facility & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Hospital / Clinic:</label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Test Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Doctor Remarks / Key Numbers:</label>
            <textarea
              rows={2}
              placeholder="e.g. Blood sugar 158, advised to continue Metformin 500mg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Attach Scan Photo / PDF:</label>
            <label className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">{fileName || 'Choose image or scan document'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
