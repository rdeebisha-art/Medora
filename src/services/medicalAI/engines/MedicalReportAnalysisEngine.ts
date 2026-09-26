/**
 * Medora Medical Report Analysis Engine
 *
 * Modular clinical laboratory and report analysis engine.
 * Accurately parses clinical biomarkers, verifies standard reference ranges,
 * flags critical values, and preserves numeric units.
 */

import {
  ReportAnalysisInput,
  ReportAnalysisResult,
  LabParameterObservation,
} from './mlInterfaces';
import { UncertaintyEngine } from './UncertaintyEngine';

interface ReferenceConfig {
  name: string;
  aliases: string[];
  unit: string;
  min: number;
  max: number;
  criticalMin?: number;
  criticalMax?: number;
}

const STANDARD_LAB_REFERENCES: ReferenceConfig[] = [
  {
    name: 'Hemoglobin',
    aliases: ['hb', 'hemoglobin', 'haemoglobin'],
    unit: 'g/dL',
    min: 12.0,
    max: 17.5,
    criticalMin: 7.0,
    criticalMax: 20.0,
  },
  {
    name: 'Fasting Blood Glucose',
    aliases: ['fbs', 'fasting blood sugar', 'fasting blood glucose', 'fasting sugar'],
    unit: 'mg/dL',
    min: 70,
    max: 100,
    criticalMin: 50,
    criticalMax: 300,
  },
  {
    name: 'Postprandial Blood Glucose',
    aliases: ['ppbs', 'postprandial glucose', 'post meal sugar', 'post prandial blood sugar'],
    unit: 'mg/dL',
    min: 90,
    max: 140,
    criticalMin: 50,
    criticalMax: 350,
  },
  {
    name: 'HbA1c',
    aliases: ['hba1c', 'glycated hemoglobin', 'a1c'],
    unit: '%',
    min: 4.0,
    max: 5.6,
    criticalMax: 10.0,
  },
  {
    name: 'Platelet Count',
    aliases: ['platelets', 'platelet count', 'plt'],
    unit: 'x10^3/mcL',
    min: 150,
    max: 450,
    criticalMin: 50,
    criticalMax: 1000,
  },
  {
    name: 'Serum Creatinine',
    aliases: ['creatinine', 'serum creatinine', 'sr creatinine'],
    unit: 'mg/dL',
    min: 0.6,
    max: 1.2,
    criticalMax: 4.0,
  },
  {
    name: 'Total Bilirubin',
    aliases: ['total bilirubin', 'bilirubin total', 't. bilirubin'],
    unit: 'mg/dL',
    min: 0.2,
    max: 1.2,
    criticalMax: 5.0,
  },
  {
    name: 'Systolic Blood Pressure',
    aliases: ['systolic bp', 'systolic blood pressure', 'bp systolic'],
    unit: 'mmHg',
    min: 90,
    max: 120,
    criticalMin: 80,
    criticalMax: 180,
  },
  {
    name: 'Diastolic Blood Pressure',
    aliases: ['diastolic bp', 'diastolic blood pressure', 'bp diastolic'],
    unit: 'mmHg',
    min: 60,
    max: 80,
    criticalMin: 50,
    criticalMax: 120,
  },
  {
    name: 'Oxygen Saturation (SpO2)',
    aliases: ['spo2', 'oxygen saturation', 'pulse oximetry', 'o2 sat'],
    unit: '%',
    min: 95,
    max: 100,
    criticalMin: 90,
  },
];

export class MedicalReportAnalysisEngine {
  public static analyzeReport(input: ReportAnalysisInput): ReportAnalysisResult {
    const text = input.reportText || '';
    const observations: LabParameterObservation[] = [];
    const criticalAlerts: string[] = [];

    // Parse standard lab biomarkers
    for (const ref of STANDARD_LAB_REFERENCES) {
      for (const alias of ref.aliases) {
        const regex = new RegExp(`(?:${alias})\\s*[:=-]?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*([a-zA-Z/%^0-9]+)?`, 'i');
        const match = text.match(regex);
        if (match) {
          const numVal = parseFloat(match[1]);
          const rawUnit = match[2] || ref.unit;
          let status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' = 'NORMAL';

          if (ref.criticalMin !== undefined && numVal < ref.criticalMin) {
            status = 'CRITICAL';
            criticalAlerts.push(`Critical Low: ${ref.name} ${numVal} ${ref.unit} (< ${ref.criticalMin})`);
          } else if (ref.criticalMax !== undefined && numVal > ref.criticalMax) {
            status = 'CRITICAL';
            criticalAlerts.push(`Critical High: ${ref.name} ${numVal} ${ref.unit} (> ${ref.criticalMax})`);
          } else if (numVal < ref.min) {
            status = 'LOW';
          } else if (numVal > ref.max) {
            status = 'HIGH';
          }

          observations.push({
            parameterName: ref.name,
            rawValue: `${match[1]} ${rawUnit}`,
            numericValue: numVal,
            unit: ref.unit,
            referenceRange: {
              min: ref.min,
              max: ref.max,
              text: `${ref.min} - ${ref.max} ${ref.unit}`,
            },
            status,
            clinicalContext: status === 'NORMAL' ? 'Within normal physiological range' : `${status} relative to standard adult reference limits.`,
          });
          break; // alias matched
        }
      }
    }

    // Special composite: Blood Pressure 120/80
    const bpMatch = text.match(/(?:bp|blood pressure)\s*[:=-]?\s*([0-9]{2,3})\s*[/]\s*([0-9]{2,3})/i);
    if (bpMatch && !observations.some(o => o.parameterName.includes('Blood Pressure'))) {
      const sys = parseInt(bpMatch[1], 10);
      const dia = parseInt(bpMatch[2], 10);
      const isCritical = sys >= 180 || dia >= 120 || sys < 80;
      const isHigh = sys > 120 || dia > 80;

      observations.push({
        parameterName: 'Blood Pressure',
        rawValue: `${sys}/${dia} mmHg`,
        numericValue: sys,
        unit: 'mmHg',
        referenceRange: { text: '<120/<80 mmHg' },
        status: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'NORMAL',
        clinicalContext: isCritical ? 'Urgent attention required: Hypertensive urgency/crisis or hypotension.' : isHigh ? 'Elevated blood pressure.' : 'Optimal blood pressure.',
      });
      if (isCritical) {
        criticalAlerts.push(`Critical Blood Pressure: ${sys}/${dia} mmHg`);
      }
    }

    const abnormalCount = observations.filter(o => o.status !== 'NORMAL').length;
    const normalCount = observations.filter(o => o.status === 'NORMAL').length;

    // Uncertainty estimation for report extraction
    const uncertainty = UncertaintyEngine.calculateUncertainty({
      rawPredictionScore: observations.length > 0 ? 0.90 : 0.40,
      numReportedSymptoms: observations.length,
      hasVitalMeasurements: observations.length > 0,
      hasClinicalDuration: false,
      hasPatientHistory: false,
      isAmbiguousQuery: observations.length === 0,
    });

    const summaryFindings = observations.length > 0
      ? `Extracted ${observations.length} clinical parameter(s): ${normalCount} normal, ${abnormalCount} abnormal/critical.`
      : 'No standard laboratory parameters identified in the provided text.';

    return {
      engine: 'MedoraMedicalReportAnalysisEngine',
      reportType: input.reportType || 'LABORATORY',
      extractedParameters: observations,
      criticalAlerts,
      abnormalCount,
      normalCount,
      summaryFindings,
      uncertainty,
      requiresPhysicianReview: true,
      timestamp: new Date().toISOString(),
    };
  }
}
