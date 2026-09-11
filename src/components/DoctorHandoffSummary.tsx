import React, { useState } from 'react';
import { Printer, Download, MessageSquare, AlertTriangle, Activity, Heart, Pill, Sparkles } from 'lucide-react';
import { HealthSummaryReport, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DoctorHandoffChart } from './DoctorHandoffChart';

interface DoctorHandoffSummaryProps {
  summary: HealthSummaryReport;
  currentLang: LanguageCode;
}

export const DoctorHandoffSummary: React.FC<DoctorHandoffSummaryProps> = ({
  summary,
  currentLang,
}) => {
  const [showReport, setShowReport] = useState(false);
  const t = TRANSLATIONS[currentLang];

  const handlePrint = () => {
    window.print();
  };

  const buildHospitalReport = () => {
    const patient = summary.patientInfo;
    const medical = summary.medicalInfo;
    const tests = summary.testInfo;
    const medicines = medical.currentMedicines.length
      ? medical.currentMedicines.map((medicine) => `- ${medicine.name}: ${medicine.dosage}, ${medicine.frequency}. Purpose: ${medicine.purpose}.`).join('\n')
      : '- No current medicines recorded.';
    return `MEDORA HOSPITAL HEALTH REPORT
================================
Patient: ${patient.name}
Health ID: ${patient.healthId}
Age: ${patient.age}
Gender: ${patient.gender}
Blood group: ${patient.bloodGroup}
Report date: ${new Date().toLocaleDateString('en-IN')}

REASON AND CURRENT HEALTH STATUS
--------------------------------
Existing conditions: ${medical.existingConditions.join(', ') || 'None recorded'}
Recent symptoms: ${medical.recentSymptoms.join(', ') || 'None recorded'}
Recent measurements: Blood pressure ${medical.recentMeasurements.bloodPressureSys}/${medical.recentMeasurements.bloodPressureDia} mmHg; fasting sugar ${medical.recentMeasurements.bloodSugarFasting} mg/dL; oxygen saturation ${medical.recentMeasurements.spo2}%.

POSSIBLE CAUSES AND CLINICAL CONTEXT
------------------------------------
${summary.aiSummary.keyObservations.join('\n') || 'Review the recorded symptoms, measurements, medical history, and test results with a qualified clinician.'}

MEDICATIONS AND CARE PLAN
-------------------------
${medicines}
Do not start, stop, or change any medicine without a qualified clinician.

WHAT TO DO NOW
--------------
${summary.aiSummary.suggestedDoctorQuestions.join('\n') || 'Arrange a professional medical review and bring this report and all test results.'}

HOW TO REDUCE RISK
------------------
${medical.medicalHistory.join('\n') || 'Follow the clinician care plan, take prescribed medicines as directed, use safe food and water, avoid tobacco, and attend follow-up visits.'}

TESTS AND FOLLOW-UP
-------------------
${tests.importantFollowUpItems.join('\n') || 'No pending follow-up items recorded.'}

EMERGENCY WARNING
-----------------
Seek immediate emergency care for chest pain, severe breathing difficulty, confusion, seizure, heavy bleeding, sudden weakness, or rapidly worsening symptoms.

MEDICAL DISCLAIMER
------------------
This is a health information and continuity report, not a diagnosis or prescription. Final decisions must be made by a licensed healthcare professional.
`;
  };

  const handleExportReport = () => {
    setShowReport(true);
    const report = buildHospitalReport();
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(report);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Medora_Hospital_Report_${summary.patientInfo.name.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSms = () => {
    const report = buildHospitalReport();
    window.location.href = `sms:?body=${encodeURIComponent(report)}`;
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card (Non-print) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono">
              CLINICAL CONTINUITY PACKET
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {summary.patientInfo.healthId}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.shareWithDoctor}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Auto-compiled clinical handoff for OPD physicians, visiting specialists, and rural healthcare workers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{t.printReport}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>{t.exportDemoReport}</span>
          </button>

          <button
            onClick={handleSms}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send by SMS</span>
          </button>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center no-print" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-black text-slate-900">Medical Report Preview</h3>
              <button onClick={() => setShowReport(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">Close</button>
            </div>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">{buildHospitalReport()}</pre>
          </div>
        </div>
      )}

      {/* Printable Comprehensive Medical Document */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-sm space-y-8 print:border-0 print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  MEDORA
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                  HEALTH CONTINUITY PLATFORM
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Doctor-Ready Health Summary
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized Clinical Handoff for Rural & Sub-district Consultations
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <p className="text-slate-500">Date Generated: <strong>10-Sep-2026</strong></p>
              <p className="text-slate-500">Status: <strong className="text-emerald-700">Verified Patient Profile</strong></p>
              <p className="text-slate-500">ABHA: <strong>{summary.patientInfo.healthId}</strong></p>
            </div>
          </div>

          {/* Critical Economic Protection & AI Decision Support Banner */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold uppercase tracking-wide block">
                  {t.aiDisclaimer}
                </strong>
                <span className="text-[11px] text-amber-900">
                  This report synthesizes patient-recorded home vitals, adherence logs, and lab results for clinical decision support. Final diagnostic decisions rest solely with the licensed physician.
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold uppercase tracking-wide block text-emerald-900">
                  RURAL ECONOMIC PROTECTION: RECENT SCANS ATTACHED
                </strong>
                <span className="text-[11px] text-emerald-900">
                  To protect this rural family from unaffordable redundant imaging and tests, recent Chest X-Ray (08-Sep-2026) and CBC Lab panels are verified below.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Patient Demographic & Basic Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            1. Patient Demographics & Identification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Full Name</span>
              <strong className="text-slate-900 text-sm block">{summary.patientInfo.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age / Gender</span>
              <strong className="text-slate-900 text-sm block">{summary.patientInfo.age} Years / {summary.patientInfo.gender}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Blood Group</span>
              <strong className="text-emerald-700 text-sm block font-black">{summary.patientInfo.bloodGroup}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ABHA Health ID</span>
              <strong className="text-slate-900 font-mono text-xs block">{summary.patientInfo.healthId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Village / Gram Panchayat</span>
              <strong className="text-slate-800 text-xs block">{summary.patientInfo.village}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">District / State</span>
              <strong className="text-slate-800 text-xs block">{summary.patientInfo.district}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block font-medium">Known Allergies</span>
              <strong className="text-rose-700 text-xs block">
                {summary.patientInfo.allergies.join(' • ')}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 2: Medical Profile, Chronic Conditions & Active Medicines */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            2. Medical Profile, Chronic Conditions & Active Medicines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Existing Conditions */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Active Medical Conditions & History
              </strong>
              <ul className="space-y-1 text-slate-700">
                {summary.medicalInfo.existingConditions.map((cond) => (
                  <li key={cond} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Past History:</span>
                <p className="text-[11px] text-slate-600">{summary.medicalInfo.medicalHistory.join(', ')}</p>
              </div>
            </div>

            {/* Recent Symptoms & Recent Vitals */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <strong className="text-slate-800 font-bold block flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                Latest Vital Signs (Recorded {summary.medicalInfo.recentMeasurements.date})
              </strong>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
                  <span className="text-sm font-black text-rose-700">
                    {summary.medicalInfo.recentMeasurements.bloodPressureSys}/{summary.medicalInfo.recentMeasurements.bloodPressureDia}
                  </span>
                  <span className="text-[9px] text-rose-600 block">Stage 2</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Fasting Sugar</span>
                  <span className="text-sm font-black text-slate-800">
                    {summary.medicalInfo.recentMeasurements.bloodSugarFasting}
                  </span>
                  <span className="text-[9px] text-slate-500 block">mg/dL</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Pulse / SpO2</span>
                  <span className="text-sm font-black text-slate-800">
                    {summary.medicalInfo.recentMeasurements.pulseRate} / {summary.medicalInfo.recentMeasurements.spo2}%
                  </span>
                  <span className="text-[9px] text-emerald-600 block">Normal</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Reported Symptoms:</span>
                <p className="text-[11px] text-slate-700">{summary.medicalInfo.recentSymptoms.join(' • ')}</p>
              </div>
            </div>
          </div>

          {/* Current Medicines Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                Current Prescribed Regimen & Adherence Rate
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Overall Adherence: {summary.medicalInfo.overallAdherence}%
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Medicine & Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Clinical Indication</th>
                    <th className="p-3">Adherence</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.medicalInfo.currentMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{med.name} ({med.dosage})</td>
                      <td className="p-3 text-slate-600">{med.frequency}</td>
                      <td className="p-3 text-slate-600">{med.purpose}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{med.adherenceRate}%</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          med.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic Lab Tests */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            3. Recent Lab Diagnostics & Trend Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {summary.testInfo.recentTests.map((test) => (
              <div key={test.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">{test.testName}</span>
                <span className="text-base font-black text-slate-900 block">{test.result}</span>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Ref: {test.normalRange}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded ${
                    test.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Health Analytics Chart Component */}
        <DoctorHandoffChart
          vitalTrends={summary.healthAnalytics.vitalTrends}
          adherenceHistory={summary.healthAnalytics.adherenceHistory}
        />

        {/* Section 5: AI Decision Support & Care Gaps */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                5. AI Decision Support & Care Gap Insights
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
              NON-DIAGNOSTIC TRIAGE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <strong className="font-bold text-amber-300 block">
                Key Observations from Longitudinal Data:
              </strong>
              <ul className="space-y-1.5 text-slate-300">
                {summary.aiSummary.keyObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <strong className="font-bold text-rose-300 block">
                Identified Care Gaps & Medication Lapses:
              </strong>
              <ul className="space-y-1.5 text-slate-300">
                {summary.aiSummary.careGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">!</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <strong className="font-bold text-slate-200 block text-xs mb-2">
              Suggested Questions for Doctor Consultation (Formulated for Rural Patient):
            </strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {summary.aiSummary.suggestedDoctorQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-slate-200">
                  <span className="text-emerald-400 font-bold mr-1">Q{idx + 1}:</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Preventive Health & Immunization Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            6. Preventive Healthcare, Screening & Next Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {summary.preventiveHealthcare.preventiveTasks.map((task) => (
              <div key={task.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  task.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </span>
                <h4 className="font-bold text-slate-800">{task.title}</h4>
                <p className="text-[11px] text-slate-500">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Sign-off block for consulting doctor */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-500">
          <div>
            <span className="block font-medium">Community Health Worker (ASHA/ANM):</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
            <span className="text-[10px] mt-1 block">Signature & Date</span>
          </div>
          <div>
            <span className="block font-medium">Consulting Doctor / Medical Officer:</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
            <span className="text-[10px] mt-1 block">Registration No. & Hospital Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
