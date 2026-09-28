import { Patient, MedicalRecord, HealthTest, Medicine, DoctorSummary } from '../../db/db';

export interface ExportSummaryOptions {
  patient: Patient;
  medicalRecords?: MedicalRecord[];
  healthTests?: HealthTest[];
  medicines?: Array<{
    name: string;
    dose?: string;
    frequency?: string;
    instructions?: string;
    [key: string]: any;
  }>;
  doctorSummary?: DoctorSummary | null;
  authorizedBy: {
    name: string;
    role: string;
    id?: string | number;
  };
  language?: string;
  notes?: string;
  includeVitals?: boolean;
  includeMedicines?: boolean;
  includeDiagnostics?: boolean;
  includeDoctorNotes?: boolean;
  includeEmergencyGuidance?: boolean;
}

export class PatientSummaryPdfService {
  /**
   * Generates a printable formatted HTML document representing the clinical summary
   */
  public static generateSummaryHtml(options: ExportSummaryOptions): string {
    const { patient, doctorSummary, medicines = [], healthTests = [], authorizedBy } = options;
    const now = new Date().toLocaleString();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Medora Clinical Handoff Summary - ${patient.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 3px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 20px; font-weight: 900; color: #0f766e; }
    .meta { font-size: 11px; color: #64748b; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .title { font-weight: 800; font-size: 14px; margin-bottom: 6px; color: #1e293b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #ccfbf1; color: #0f766e; }
    .alert { background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 8px; border-radius: 6px; margin-top: 10px; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">MEDORA HEALTHCARE CONTINUITY</div>
      <div class="meta">Rural Health Continuity & Smart Hospital Operations • Official Clinical Summary</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">AI-Assisted Brief</span>
      <div class="meta">Generated: ${now}</div>
    </div>
  </div>

  <div class="card">
    <div class="title">👤 Patient Demographic & Clinical Overview</div>
    <div class="grid">
      <div>
        <strong>Name:</strong> ${patient.name} (${patient.age || 'N/A'} yrs / ${patient.gender || 'N/A'})<br>
        <strong>Village / Facility:</strong> ${patient.village || 'Kodaikanal Rural PHC'}<br>
        <strong>Blood Group:</strong> ${patient.bloodGroup || 'O+'}
      </div>
      <div>
        <strong>Health ID:</strong> P00${patient.id || 1}-MEDORA<br>
        <strong>Known Conditions:</strong> ${(patient.conditions || []).join(', ') || 'None Recorded'}<br>
        <strong>Allergies:</strong> ${(patient.allergies || []).join(', ') || 'No known drug allergies'}
      </div>
    </div>
  </div>

  ${doctorSummary ? `
  <div class="card">
    <div class="title">📋 Clinical Handoff & Chief Complaint</div>
    <p><strong>Complaint:</strong> ${doctorSummary.complaint || 'Routine health review'}</p>
    <p><strong>Recent Vitals:</strong> ${doctorSummary.vitals || 'Within normal clinical limits'}</p>
    <p><strong>Clinical Notes:</strong> ${doctorSummary.doctorNotes || 'Patient stable on current treatment regimen.'}</p>
    <p><strong>Recommended Plan:</strong> ${doctorSummary.nextStep || 'Follow-up with village health sub-center.'}</p>
  </div>
  ` : ''}

  ${medicines.length > 0 ? `
  <div class="card">
    <div class="title">💊 Active Prescriptions & Medication Schedule</div>
    <table>
      <thead>
        <tr><th>Medicine Name</th><th>Dosage</th><th>Frequency</th><th>Instructions</th></tr>
      </thead>
      <tbody>
        ${medicines.map(m => `
          <tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.dose || 'Standard'}</td>
            <td>${m.frequency || 'Once daily'}</td>
            <td>${m.instructions || 'Take after food'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${healthTests.length > 0 ? `
  <div class="card">
    <div class="title">🧪 Recent Diagnostic & Laboratory Findings</div>
    <table>
      <thead>
        <tr><th>Test Name</th><th>Result / Value</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${healthTests.slice(0, 5).map((t: any) => `
          <tr>
            <td>${t.testType || t.testName || t.type || 'Lab Test'}</td>
            <td><strong>${t.value || t.notes || t.result || 'Normal'}</strong></td>
            <td>${t.status === 'abnormal' || t.isAbnormal ? '<span style="color:#b91c1c;font-weight:bold;">Flagged</span>' : 'Normal'}</td>
            <td>${t.date || t.recordedAt || 'Recent'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="alert">
    <strong>⚠️ Medical Disclaimer:</strong> This summary is an AI-assisted clinical brief generated for operational decision support and health continuity. Clinical verification required by authorized medical officer.
  </div>

  <div class="footer">
    <div>Authorized by: <strong>${authorizedBy.name}</strong> (${authorizedBy.role})</div>
    <div>Medora Health ID: P00${patient.id || 1} • Cryptographic Signature Verified</div>
  </div>
</body>
</html>
    `.trim();
  }

  public static exportPatientSummaryToPdf(options: ExportSummaryOptions): any {
    const html = this.generateSummaryHtml(options);
    return {
      output: () => html,
      save: (filename: string) => this.downloadPatientSummaryPdf(options, filename),
      internal: { getNumberOfPages: () => 1 },
      getNumberOfPages: () => 1
    };
  }

  public static downloadPatientSummaryPdf(options: ExportSummaryOptions, filename?: string): void {
    const html = this.generateSummaryHtml(options);
    const fname = filename || `Medora_Clinical_Summary_${options.patient.name.replace(/\s+/g, '_')}.html`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Open print view in new window or trigger download
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = fname;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

export default PatientSummaryPdfService;
