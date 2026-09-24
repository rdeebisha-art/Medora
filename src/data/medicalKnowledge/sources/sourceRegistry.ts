import { MedicalSourceReference } from '../types';

export const MEDICAL_SOURCES: Record<string, MedicalSourceReference> = {
  MOHFW_STG_HYPERTENSION: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Standard Treatment Guidelines: Hypertension & Cardiovascular Risk Assessment in Primary Care',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2023-01',
    lastReviewed: '2026-01-15',
    sourceType: 'clinical_protocol'
  },
  MOHFW_STG_DIABETES: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Standard Treatment Guidelines: Type 2 Diabetes Mellitus Management at PHC/CHC',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2022-11',
    lastReviewed: '2026-02-01',
    sourceType: 'clinical_protocol'
  },
  MOHFW_STG_SNAKEBITE: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'National Action Plan for Prevention and Control of Snakebite Envenoming & Standard Treatment Guidelines',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2024-03',
    lastReviewed: '2026-02-10',
    sourceType: 'guideline'
  },
  MOHFW_STG_TRAUMA: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Standard Treatment Guidelines: Major Trauma and Pre-hospital Care in Rural Setup',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2023-08',
    lastReviewed: '2026-01-20',
    sourceType: 'guideline'
  },
  MOHFW_STG_PEDIATRIC_ARI: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Standard Treatment Guidelines: Acute Respiratory Infections in Children at Primary & Community Health Centres',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2023-05',
    lastReviewed: '2026-01-18',
    sourceType: 'clinical_protocol'
  },
  MOHFW_MATERNAL_CARE: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) & Maternal Health Clinical Protocols',
    url: 'https://pmsma.mohfw.gov.in',
    publicationDate: '2023-04',
    lastReviewed: '2026-02-05',
    sourceType: 'programme'
  },
  MOHFW_NEWBORN_HBNC: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Home Based Newborn Care (HBNC) Operational Guidelines and Danger Signs Protocol',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2023-06',
    lastReviewed: '2026-02-12',
    sourceType: 'guideline'
  },
  MOHFW_IMMUNIZATION_UIP: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'Universal Immunization Programme (UIP) National Immunization Schedule',
    url: 'https://main.mohfw.gov.in',
    publicationDate: '2024-01',
    lastReviewed: '2026-01-10',
    sourceType: 'policy'
  },
  MOHFW_RNTCP_TB: {
    organization: 'National Tuberculosis Elimination Program (NTEP), MoHFW India',
    title: 'NTEP Guidelines on Diagnosis and Management of Tuberculosis in India',
    url: 'https://tbcindia.gov.in',
    publicationDate: '2023-09',
    lastReviewed: '2026-02-01',
    sourceType: 'guideline'
  },
  MOHFW_VECTOR_BORNE: {
    organization: 'National Centre for Vector Borne Diseases Control (NCVBDC), MoHFW',
    title: 'National Guidelines for Clinical Management of Dengue and Malaria Fever',
    url: 'https://ncvbdc.mohfw.gov.in',
    publicationDate: '2023-07',
    lastReviewed: '2026-02-15',
    sourceType: 'guideline'
  },
  WHO_IMCI_PEDIATRIC: {
    organization: 'World Health Organization (WHO)',
    title: 'Integrated Management of Childhood Illness (IMCI) Clinical Chart Booklet',
    url: 'https://www.who.int/teams/maternal-newborn-child-adolescent-health',
    publicationDate: '2022-10',
    lastReviewed: '2025-11-20',
    sourceType: 'clinical_protocol'
  },
  WHO_ESSENTIAL_MEDS: {
    organization: 'World Health Organization (WHO)',
    title: 'WHO Model List of Essential Medicines (23rd List) & Medication Safety Protocols',
    url: 'https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines',
    publicationDate: '2023-07',
    lastReviewed: '2026-01-08',
    sourceType: 'guideline'
  },
  WHO_DIARRHOEA_ORS: {
    organization: 'World Health Organization (WHO)',
    title: 'The Treatment of Diarrhoea: A manual for physicians and other senior health workers (4th rev.)',
    url: 'https://www.who.int/publications/i/item/9241593180',
    publicationDate: '2022-03',
    lastReviewed: '2025-12-10',
    sourceType: 'clinical_protocol'
  },
  NHA_AB_PMJAY: {
    organization: 'National Health Authority (NHA), Govt of India',
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana Standard Treatment Protocols',
    url: 'https://pmjay.gov.in',
    publicationDate: '2023-12',
    lastReviewed: '2026-01-12',
    sourceType: 'policy'
  }
};
