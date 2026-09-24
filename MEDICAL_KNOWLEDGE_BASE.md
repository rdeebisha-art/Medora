# Medora — Evidence-Based Medical Knowledge Base

## Overview
Medora's medical decision-support knowledge base is a curated, offline-first clinical repository specifically structured for primary healthcare in rural Indian communities. It provides traceable, evidence-grounded health information without hallucinations or unauthorized treatment prescriptions.

---

## 1. Database Architecture & Directory Structure
```
src/data/medicalKnowledge/
├── types.ts                      # Core TypeScript clinical interfaces & schemas
├── conditions/
│   ├── conditionList.ts          # Common conditions (Fever, Malaria, Dengue, Diabetes, Hypertension)
│   ├── moreConditions.ts         # Respiratory & GI conditions (TB, Pneumonia, Diarrhea, etc.)
│   └── index.ts                  # Centralized conditions registry & lookup
├── emergency/
│   └── redFlags.ts               # Clinically critical emergency red-flag triggers
├── symptoms/
│   └── symptomDatabase.ts        # Multilingual symptom concept extraction & mappings
├── version/
│   └── knowledgeBaseVersion.ts   # Authoritative sources, versioning & review governance
└── tests/
    └── medicalAiEvaluationCases.ts # 100+ clinical test cases across 6 Indian languages
```

---

## 2. Conditions Covered
1. **Fever (Pyrexia)**: Assessment, temperature thresholds, hydration, danger signs.
2. **Malaria (Plasmodium)**: Chills, cyclic fever, mandatory RDT/microscopy testing, LLIN prevention.
3. **Dengue Fever**: Platelet & hematocrit monitoring, fluid support, NSAID contraindications.
4. **Type 2 Diabetes Mellitus**: Glucose targets, HbA1c, diet/walking, hypoglycemia emergency.
5. **Hypertension**: BP monitoring, salt reduction, stroke warning signs, adherence.
6. **Diarrhea & Dehydration**: WHO ORS protocols, Zinc supplementation, dehydration grading.
7. **Tuberculosis (TB)**: Cough >2 weeks, CBNAAT/sputum testing, 6-month DOTS regimen, Nikshay Poshan.
8. **Pneumonia**: Fast breathing thresholds, chest in-drawing red flag, pulse oximetry (SpO2).

---

## 3. Emergency Rules & Priority
Emergency red flags supersede regular conversational flows:
- **Severe Breathlessness**: Immediate 108 dispatch; upright positioning.
- **Radiating Chest Pain**: Suspected Acute Coronary Syndrome; immediate ICU/ECG referral.
- **Pregnancy Danger Signs**: Pre-eclampsia/eclampsia, vaginal bleeding, Janani Shishu 102 transport.
- **Newborn Danger Signs**: Unable to feed, grunting, chest indrawing, SNCU referral.
- **Seizure / Unconsciousness**: Recovery position, airway maintenance, emergency transport.

---

## 4. Medicine Safety Rules
- **No Prescriptions**: Medora never generates prescription drug regimens from symptoms.
- **No Dose Alterations**: Explicit prohibitions against doubling or stopping prescribed tablets.
- **No Empirical Antibiotics**: Antibiotics are restricted to clinician-confirmed bacterial diagnoses.
- **No Aspirin/NSAIDs in Dengue**: Strict contraindications against antiplatelet agents during bleeding risks.

---

## 5. Authoritative Source Organizations
Every clinical entry links to authoritative, non-blog public health guidance:
- **World Health Organization (WHO)**
- **Ministry of Health and Family Welfare (MoHFW), Govt of India**
- **Indian Council of Medical Research (ICMR)**
- **National Vector Borne Disease Control Programme (NVBDCP)**
- **National Tuberculosis Elimination Programme (NTEP)**
- **India Hypertension Control Initiative (IHCI)**

---

## 6. Supported Languages
Complete native terminology and response coverage across:
- **English (`en-IN`)**
- **Hindi (`hi-IN`)**
- **Tamil (`ta-IN`)**
- **Telugu (`te-IN`)**
- **Malayalam (`ml-IN`)**
- **Kannada (`kn-IN`)**

---

## 7. Versioning & Governance
- **Current Version**: `1.2.0`
- **Review Status**: `approved`
- **Clinical Lifecycle**: `draft` → `reviewed` → `approved` → `retired`

---

## 8. Offline Operation
The complete medical knowledge base is bundled as local typed constants and JSON structures within the client bundle and Dexie IndexedDB cache. No internet connection is required for symptom evaluation, emergency alerts, or clinical information retrieval.
