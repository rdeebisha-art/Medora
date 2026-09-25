/**
 * Medical Value Protection Layer for Medora
 * Ensures critical medical numbers, units, dosages, dates, and medicine names
 * are never altered, translated, or hallucinated during language or AI processing.
 */

export interface ProtectedMedicalValue {
  placeholder: string;
  original: string;
  type: 'temperature' | 'blood_pressure' | 'blood_sugar' | 'spo2' | 'weight' | 'duration' | 'date_time' | 'medicine' | 'unit_number';
}

export interface ProtectionResult {
  protectedText: string;
  values: ProtectedMedicalValue[];
}

export interface ValidationResult {
  isValid: boolean;
  missingValues: string[];
  safeOutput: string;
}

// Common essential medicine names in rural healthcare that must never be translated into ordinary words
export const PROTECTED_MEDICINES = [
  'Paracetamol',
  'Amoxicillin',
  'Metformin',
  'Amlodipine',
  'Aspirin',
  'Folic Acid',
  'Ferrous Sulphate',
  'Insulin',
  'Atorvastatin',
  'Azithromycin',
  'Ciprofloxacin',
  'Omeprazole',
  'Pantoprazole',
  'Cetirizine',
  'ORS',
  'Oral Rehydration Salts',
  'Ibuprofen',
  'Albendazole',
  'Doxycycline',
  'BCG',
  'OPV',
  'DPT',
  'Pentavalent',
  'Rotavirus',
  'PCV',
  'Measles',
  'Rubella',
  'Vitamin A',
  'Iron Folic Acid'
];

/**
 * Replaces numbers, units, and medicine names with protected placeholders
 */
export function protectMedicalValues(text: string): ProtectionResult {
  if (!text) return { protectedText: '', values: [] };

  const values: ProtectedMedicalValue[] = [];
  let protectedText = text;
  let counter = 0;

  const registerValue = (original: string, type: ProtectedMedicalValue['type']) => {
    // Avoid double-protecting existing placeholders
    if (original.startsWith('__MED_VAL_')) return original;
    const placeholder = `__MED_VAL_${counter++}__`;
    values.push({ placeholder, original, type });
    return placeholder;
  };

  // 1. Temperature: e.g. 102°F, 102 F, 38.5°C, 39 C
  protectedText = protectedText.replace(/(\b\d+(\.\d+)?\s*(°\s*[FCfc]|[FfCc]\b))/g, (match) => {
    return registerValue(match.trim(), 'temperature');
  });

  // 2. Blood Pressure: e.g. 120/80, 140/90 mmHg
  protectedText = protectedText.replace(/(\b\d{2,3}\s*\/\s*\d{2,3}(\s*mmHg)?\b)/gi, (match) => {
    return registerValue(match.trim(), 'blood_pressure');
  });

  // 3. Blood Sugar: e.g. 180 mg/dL, 142 mg/dl
  protectedText = protectedText.replace(/(\b\d{2,3}(\.\d+)?\s*mg\s*\/\s*d[Ll]\b)/gi, (match) => {
    return registerValue(match.trim(), 'blood_sugar');
  });

  // 4. SpO2 & Percentages: e.g. 94%, 98 %
  protectedText = protectedText.replace(/(\b\d+(\.\d+)?\s*%\b)/g, (match) => {
    return registerValue(match.trim(), 'spo2');
  });

  // 5. Weight & Measurement Units: e.g. 55 kg, 250 mg, 5 mL
  protectedText = protectedText.replace(/(\b\d+(\.\d+)?\s*(kg|g|mg|mcg|ml|mL|L|cm|mm)\b)/gi, (match) => {
    return registerValue(match.trim(), 'weight');
  });

  // 6. Durations: e.g. 3 days, 2 weeks, 6 months, 48 hours, 3 நாட்களாக, 3 நாட்கள், 3 రోజులు, 3 दिन, 3 ദിവസമായി, 3 ದಿನ
  protectedText = protectedText.replace(/(\b\d+\s*(days?|weeks?|months?|hours?|years?|நாட்கள்|நாட்களாக|రోజులు|दिन|ദിവസം|ದಿನ)\b)/gi, (match) => {
    return registerValue(match.trim(), 'duration');
  });

  // 7. Time and Dates: e.g. 8:30 AM, 10:00 PM, 23 September 2026
  protectedText = protectedText.replace(/(\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)?\b)/g, (match) => {
    return registerValue(match.trim(), 'date_time');
  });

  // 8. Medicine Names
  for (const med of PROTECTED_MEDICINES) {
    const regex = new RegExp(`\\b${med}\\b`, 'gi');
    protectedText = protectedText.replace(regex, (match) => {
      return registerValue(match, 'medicine');
    });
  }

  return { protectedText, values };
}

/**
 * Restores original medical values from placeholders
 */
export function restoreMedicalValues(text: string, values: ProtectedMedicalValue[]): string {
  if (!text) return '';
  let restored = text;
  for (const item of values) {
    restored = restored.replace(new RegExp(item.placeholder, 'g'), item.original);
  }
  return restored;
}

/**
 * Validates that all critical medical values from input are preserved in output
 */
export function validatePreservedMedicalValues(
  originalInput: string,
  processedOutput: string
): ValidationResult {
  const { values } = protectMedicalValues(originalInput);
  const missing: string[] = [];

  for (const val of values) {
    // Check if the exact original value or its numeric core is present in output
    const cleanOrig = val.original.replace(/\s+/g, '');
    const cleanOutput = processedOutput.replace(/\s+/g, '');

    if (!cleanOutput.includes(cleanOrig)) {
      missing.push(val.original);
    }
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      missingValues: missing,
      safeOutput: `Medical information could not be safely preserved. Please verify the original message: "${originalInput}"`,
    };
  }

  return {
    isValid: true,
    missingValues: [],
    safeOutput: processedOutput,
  };
}
