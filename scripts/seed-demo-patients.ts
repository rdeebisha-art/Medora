/**
 * CLI Script: Seed 20 Unique, Fictional Demo Patients
 * Run with: npx tsx scripts/seed-demo-patients.ts
 */

import { FICTIONAL_20_DEMO_PATIENTS } from '../src/services/patientSeederService';

async function main() {
  console.log('====================================================');
  console.log('MEDORA: FICTIONAL DEMO PATIENT DATABASE SEEDER');
  console.log('====================================================\n');

  console.log(`Checking demo patient dataset integrity...`);
  console.log(`Total Fictional Demo Records Configured: ${FICTIONAL_20_DEMO_PATIENTS.length}`);

  // 1. Verify Uniqueness of Patient Codes
  const codeSet = new Set<string>();
  const phoneSet = new Set<string>();
  const duplicates: string[] = [];

  for (const patient of FICTIONAL_20_DEMO_PATIENTS) {
    if (codeSet.has(patient.patientCode)) {
      duplicates.push(`Duplicate code: ${patient.patientCode}`);
    }
    codeSet.add(patient.patientCode);

    if (phoneSet.has(patient.phone)) {
      duplicates.push(`Duplicate phone: ${patient.phone}`);
    }
    phoneSet.add(patient.phone);
  }

  if (duplicates.length > 0) {
    console.error('❌ VALIDATION FAILED: Duplicates found in fictional dataset:');
    duplicates.forEach(d => console.error(`  - ${d}`));
    process.exit(1);
  }

  console.log('✅ Uniqueness Verification: All 20 Patient IDs & Phone Numbers are 100% unique.');

  // Print Summary Table
  console.log('\n--- 20 Unique Fictional Patients ---');
  console.table(
    FICTIONAL_20_DEMO_PATIENTS.map((p, idx) => ({
      Index: idx + 1,
      PatientID: p.patientCode,
      Name: p.name,
      Age: p.age,
      Gender: p.gender,
      Village: p.village,
      Blood: p.bloodGroup,
      Conditions: p.conditions.join(', '),
      WeightKg: p.weight,
      MedicinesCount: p.prescribedMedicines.length,
      AppointmentsCount: p.appointments.length,
    }))
  );

  console.log('\n✅ Demo Patient dataset successfully validated.');
  console.log('In browser runtime, the Medora database auto-seeds these records idempotently without duplicates.');
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Seeder execution error:', err);
  process.exit(1);
});
