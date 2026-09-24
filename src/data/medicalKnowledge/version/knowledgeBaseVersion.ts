import { KnowledgeBaseVersion, MedicalSourceReference } from '../types';

export const MEDICAL_SOURCES: Record<string, MedicalSourceReference> = {
  WHO_MALARIA_2023: {
    organization: 'World Health Organization (WHO)',
    title: 'WHO Guidelines for Malaria (2023 Update)',
    url: 'https://www.who.int/publications/i/item/guidelines-for-malaria',
    publicationDate: '2023-03-14',
    lastReviewed: '2026-01-15',
    sourceType: 'guideline'
  },
  MOHFW_NVBDCP: {
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    title: 'National Vector Borne Disease Control Programme — Malaria & Dengue Diagnosis and Management Guidelines',
    url: 'https://nvbdcp.gov.in/index4.php?lang=1&level=0&linkid=418',
    publicationDate: '2022-08-10',
    lastReviewed: '2026-02-01',
    sourceType: 'guideline'
  },
  WHO_DENGUE_CLINICAL: {
    organization: 'World Health Organization (WHO)',
    title: 'Comprehensive Guidelines for Prevention and Control of Dengue and Dengue Haemorrhagic Fever',
    url: 'https://www.who.int/publications/i/item/9789290223870',
    publicationDate: '2021-06-20',
    lastReviewed: '2026-01-20',
    sourceType: 'guideline'
  },
  ICMR_DIABETES_2023: {
    organization: 'Indian Council of Medical Research (ICMR)',
    title: 'ICMR Guidelines for Management of Type 2 Diabetes',
    url: 'https://main.icmr.nic.in/content/guidelines-management-type-2-diabetes',
    publicationDate: '2023-04-18',
    lastReviewed: '2026-02-10',
    sourceType: 'clinical_protocol'
  },
  MOHFW_NPCDCS_HYPERTENSION: {
    organization: 'MoHFW / India Hypertension Control Initiative (IHCI)',
    title: 'Standard Treatment Guidelines for Hypertension in Primary Healthcare',
    url: 'https://www.ihci.in/resources',
    publicationDate: '2022-11-05',
    lastReviewed: '2026-01-28',
    sourceType: 'guideline'
  },
  WHO_IMCI_PEDIATRIC: {
    organization: 'World Health Organization & UNICEF',
    title: 'Integrated Management of Childhood Illness (IMCI) Chart Booklet',
    url: 'https://www.who.int/publications/i/item/9789241506823',
    publicationDate: '2021-09-12',
    lastReviewed: '2026-02-15',
    sourceType: 'clinical_protocol'
  },
  MOHFW_MATERNAL_CARE: {
    organization: 'National Health Mission (NHM), MoHFW Govt of India',
    title: 'Guidelines for Antenatal Care and Skilled Attendance at Birth (Dakshata / LaQshya)',
    url: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1020&lid=365',
    publicationDate: '2022-04-10',
    lastReviewed: '2026-02-12',
    sourceType: 'programme'
  },
  NTEP_TB_INDIA: {
    organization: 'National Tuberculosis Elimination Programme (NTEP), MoHFW',
    title: 'Training Module for Medical Practitioners on TB Diagnosis and Care',
    url: 'https://tbcindia.gov.in/index1.php?lang=1&level=1&sublinkid=4572&lid=3177',
    publicationDate: '2023-01-10',
    lastReviewed: '2026-01-30',
    sourceType: 'programme'
  },
  WHO_DIARRHOEA_ORS: {
    organization: 'World Health Organization (WHO)',
    title: 'The Treatment of Diarrhoea: A manual for physicians and other senior health workers',
    url: 'https://www.who.int/publications/i/item/9241593180',
    publicationDate: '2020-05-18',
    lastReviewed: '2026-01-10',
    sourceType: 'guideline'
  }
};

export const CURRENT_KNOWLEDGE_BASE_VERSION: KnowledgeBaseVersion = {
  knowledgeBaseVersion: '1.2.0',
  lastUpdated: '2026-03-01',
  lastReviewed: '2026-02-28',
  reviewStatus: 'approved',
  languageCoverage: ['en', 'hi', 'ta', 'te', 'ml', 'kn'],
  sourceOrganizations: [
    'World Health Organization (WHO)',
    'Ministry of Health and Family Welfare (MoHFW), Govt of India',
    'Indian Council of Medical Research (ICMR)',
    'National Vector Borne Disease Control Programme (NVBDCP)',
    'National Tuberculosis Elimination Programme (NTEP)',
    'India Hypertension Control Initiative (IHCI)'
  ],
  conditionsCount: 19,
  emergencyRulesCount: 14,
  evidenceBasis: 'Curated clinical protocols from WHO, MoHFW India, ICMR and recognized public health authorities.'
};
