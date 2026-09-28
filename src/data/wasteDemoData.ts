import { SmartWasteBin, WasteClassificationItem, WasteVerificationQueueItem, WasteCollectionRequest, DigitalWastePassport, A2AMessage } from '../types/waste';

export const initialSmartBins: SmartWasteBin[] = [
  {
    id: 1,
    binId: 'BIN-PHC01-01',
    facility: 'Medora PHC Kodaikanal',
    ward: 'Minor OT & Casualty',
    wasteCategory: 'SHARPS',
    fillLevelPercent: 78,
    weightKg: 4.6,
    maxWeightCapacityKg: 6.0,
    temperatureC: 22.4,
    gasStatus: 'NORMAL',
    batteryPercent: 92,
    connectivity: 'ONLINE',
    lastSyncTime: '2 mins ago',
    status: 'COLLECTION_RECOMMENDED',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 20, weightKg: 1.2 },
      { timestamp: '11:00', fillPercent: 45, weightKg: 2.8 },
      { timestamp: '14:00', fillPercent: 62, weightKg: 3.7 },
      { timestamp: '17:00', fillPercent: 78, weightKg: 4.6 },
    ]
  },
  {
    id: 2,
    binId: 'BIN-PHC01-02',
    facility: 'Medora PHC Kodaikanal',
    ward: 'Labor Room / Maternity',
    wasteCategory: 'INFECTIOUS',
    fillLevelPercent: 88,
    weightKg: 8.4,
    maxWeightCapacityKg: 10.0,
    temperatureC: 23.1,
    gasStatus: 'ELEVATED',
    batteryPercent: 84,
    connectivity: 'ONLINE',
    lastSyncTime: 'Just now',
    status: 'OVERFLOW_ALERT',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 30, weightKg: 2.8 },
      { timestamp: '11:00', fillPercent: 55, weightKg: 5.1 },
      { timestamp: '14:00', fillPercent: 74, weightKg: 6.9 },
      { timestamp: '17:00', fillPercent: 88, weightKg: 8.4 },
    ]
  },
  {
    id: 3,
    binId: 'BIN-PHC02-03',
    facility: 'Medora Sub-Center Vilpatti',
    ward: 'Immunization Room',
    wasteCategory: 'PLASTIC',
    fillLevelPercent: 42,
    weightKg: 2.9,
    maxWeightCapacityKg: 8.0,
    temperatureC: 21.0,
    gasStatus: 'NORMAL',
    batteryPercent: 79,
    connectivity: '2G_LOW_BANDWIDTH',
    lastSyncTime: '12 mins ago',
    status: 'NORMAL',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 15, weightKg: 0.9 },
      { timestamp: '11:00', fillPercent: 25, weightKg: 1.6 },
      { timestamp: '14:00', fillPercent: 35, weightKg: 2.3 },
      { timestamp: '17:00', fillPercent: 42, weightKg: 2.9 },
    ]
  },
  {
    id: 4,
    binId: 'BIN-PHC02-04',
    facility: 'Medora Sub-Center Vilpatti',
    ward: 'General OPD',
    wasteCategory: 'GLASS',
    fillLevelPercent: 34,
    weightKg: 3.1,
    maxWeightCapacityKg: 10.0,
    temperatureC: 20.8,
    gasStatus: 'NORMAL',
    batteryPercent: 88,
    connectivity: 'OFFLINE',
    lastSyncTime: 'Saved Locally (45 min)',
    status: 'NORMAL',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 10, weightKg: 1.0 },
      { timestamp: '11:00', fillPercent: 18, weightKg: 1.8 },
      { timestamp: '14:00', fillPercent: 28, weightKg: 2.6 },
      { timestamp: '17:00', fillPercent: 34, weightKg: 3.1 },
    ]
  },
  {
    id: 5,
    binId: 'BIN-PHC03-05',
    facility: 'Medora PHC Poombarai',
    ward: 'Dental & Diagnostic',
    wasteCategory: 'SHARPS',
    fillLevelPercent: 65,
    weightKg: 3.8,
    maxWeightCapacityKg: 6.0,
    temperatureC: 22.0,
    gasStatus: 'NORMAL',
    batteryPercent: 67,
    connectivity: 'ONLINE',
    lastSyncTime: '5 mins ago',
    status: 'NORMAL',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 20, weightKg: 1.1 },
      { timestamp: '11:00', fillPercent: 38, weightKg: 2.2 },
      { timestamp: '14:00', fillPercent: 52, weightKg: 3.0 },
      { timestamp: '17:00', fillPercent: 65, weightKg: 3.8 },
    ]
  },
  {
    id: 6,
    binId: 'BIN-DH01-06',
    facility: 'District Hospital Dindigul Central',
    ward: 'ICU & Isolation Ward',
    wasteCategory: 'INFECTIOUS',
    fillLevelPercent: 91,
    weightKg: 12.8,
    maxWeightCapacityKg: 15.0,
    temperatureC: 24.2,
    gasStatus: 'HAZARDOUS_ALERT',
    batteryPercent: 95,
    connectivity: 'ONLINE',
    lastSyncTime: 'Just now',
    status: 'HAZARD_ISOLATED',
    historicalFill: [
      { timestamp: '08:00', fillPercent: 40, weightKg: 5.5 },
      { timestamp: '11:00', fillPercent: 68, weightKg: 9.2 },
      { timestamp: '14:00', fillPercent: 82, weightKg: 11.4 },
      { timestamp: '17:00', fillPercent: 91, weightKg: 12.8 },
    ]
  }
];

export const initialWasteClassifications: WasteClassificationItem[] = [
  {
    id: 1,
    wasteId: 'MWP-2026-00128',
    itemName: 'Contaminated Blood Tubing & Gauze',
    predictedCategory: 'INFECTIOUS',
    confidenceScore: 0.94,
    decision: 'AUTOMATIC_SEGREGATION',
    safetyStatus: 'VERIFIED_AUTO',
    detectedAt: 'Today, 17:15',
    facility: 'Medora PHC Kodaikanal',
    binAssigned: 'BIN-PHC01-02',
    verifiedBy: 'AI Safety Agent (Autonomous)'
  },
  {
    id: 2,
    wasteId: 'MWP-2026-00129',
    itemName: 'Used Disposable Syringe with Fixed Needle',
    predictedCategory: 'SHARPS',
    confidenceScore: 0.98,
    decision: 'AUTOMATIC_SEGREGATION',
    safetyStatus: 'VERIFIED_AUTO',
    detectedAt: 'Today, 16:45',
    facility: 'Medora PHC Kodaikanal',
    binAssigned: 'BIN-PHC01-01',
    verifiedBy: 'AI Safety Agent (Autonomous)'
  },
  {
    id: 3,
    wasteId: 'MWP-2026-00130',
    itemName: 'Unknown Multi-layer Fluid Pouch & Glass Ampoule mix',
    predictedCategory: 'INFECTIOUS',
    confidenceScore: 0.54,
    decision: 'ISOLATE_HUMAN_VERIFY',
    safetyStatus: 'REQUIRES_HUMAN_VERIFICATION',
    detectedAt: 'Today, 16:30',
    facility: 'Medora Sub-Center Vilpatti',
    binAssigned: 'ISOLATION_CHAMBER_01',
    notes: 'Low visual certainty (54%). Sharps vs infectious ambiguity.'
  },
  {
    id: 4,
    wasteId: 'MWP-2026-00131',
    itemName: 'Surgical Gloves & Dialysis Tubing',
    predictedCategory: 'PLASTIC',
    confidenceScore: 0.92,
    decision: 'AUTOMATIC_SEGREGATION',
    safetyStatus: 'VERIFIED_AUTO',
    detectedAt: 'Today, 15:50',
    facility: 'Medora Sub-Center Vilpatti',
    binAssigned: 'BIN-PHC02-03'
  },
  {
    id: 5,
    wasteId: 'MWP-2026-00132',
    itemName: 'Discarded Normal Saline Bottle (Rigid Plastic)',
    predictedCategory: 'PLASTIC',
    confidenceScore: 0.96,
    decision: 'AUTOMATIC_SEGREGATION',
    safetyStatus: 'VERIFIED_AUTO',
    detectedAt: 'Today, 15:10',
    facility: 'Medora PHC Poombarai',
    binAssigned: 'BIN-PHC03-05'
  }
];

export const initialVerificationQueue: WasteVerificationQueueItem[] = [
  {
    id: 1,
    verificationId: 'VER-2026-042',
    wasteId: 'MWP-2026-00130',
    itemName: 'Multi-layer Fluid Pouch with embedded needle hub',
    predictedCategory: 'INFECTIOUS',
    confidenceScore: 0.54,
    riskLevel: 'HIGH',
    facility: 'Medora Sub-Center Vilpatti',
    timestamp: 'Today, 16:30',
    status: 'PENDING',
    operatorNotes: 'AI safety boundary flagged low confidence (54%). Visual inspection needed before container routing.'
  },
  {
    id: 2,
    verificationId: 'VER-2026-043',
    wasteId: 'MWP-2026-00133',
    itemName: 'Crushed Antibiotic Glass Vial with residual powder',
    predictedCategory: 'GLASS',
    confidenceScore: 0.62,
    riskLevel: 'MEDIUM',
    facility: 'District Hospital Dindigul Central',
    timestamp: 'Today, 14:15',
    status: 'PENDING',
    operatorNotes: 'Possible cytotoxic chemical residue. Verify decontamination code.'
  }
];

export const initialCollectionRequests: WasteCollectionRequest[] = [
  {
    id: 1,
    requestId: 'REQ-COL-0091',
    batchId: 'BATCH-2026-INF-088',
    sourceFacility: 'Medora PHC Kodaikanal (Labor Room)',
    destinationFacility: 'Dindigul District Central Bio-Disposal Facility',
    wasteCategory: 'INFECTIOUS',
    estimatedWeightKg: 8.4,
    priority: 'P1_CRITICAL',
    status: 'ASSIGNED',
    assignedFleet: 'SMART_CART',
    collectorName: 'Smart Cart Unit Alpha-02 (Operator: Ramesh M.)',
    etaMinutes: 18,
    scheduledAt: '17:30 Today'
  },
  {
    id: 2,
    requestId: 'REQ-COL-0092',
    batchId: 'BATCH-2026-SHP-044',
    sourceFacility: 'District Hospital Dindigul Central (ICU Isolation)',
    destinationFacility: 'High-Temperature Incinerator Unit #3',
    wasteCategory: 'SHARPS',
    estimatedWeightKg: 12.8,
    priority: 'P0_EMERGENCY',
    status: 'IN_TRANSIT',
    assignedFleet: 'AUTONOMOUS_ROBOT',
    collectorName: 'Autonomous AGV Rover Medora-Robo 01',
    etaMinutes: 6,
    scheduledAt: '17:10 Today'
  },
  {
    id: 3,
    requestId: 'REQ-COL-0093',
    batchId: 'BATCH-2026-PLS-019',
    sourceFacility: 'Medora Sub-Center Vilpatti',
    destinationFacility: 'Recycling Autoclave Facility',
    wasteCategory: 'PLASTIC',
    estimatedWeightKg: 6.2,
    priority: 'P2_NORMAL',
    status: 'PENDING',
    assignedFleet: 'MANUAL',
    collectorName: 'Regional Waste Transit Van #4',
    etaMinutes: 90,
    scheduledAt: 'Tomorrow 08:30'
  }
];

export const initialWastePassports: DigitalWastePassport[] = [
  {
    id: 1,
    passportId: 'MWP-2026-000184',
    sourceFacility: 'Medora PHC Kodaikanal (OT & Ward)',
    wasteCategory: 'INFECTIOUS',
    weightKg: 8.4,
    binOrigin: 'BIN-PHC01-02',
    generatedAt: '2026-09-28T14:30:00Z',
    segregatedAt: '2026-09-28T14:32:00Z',
    collectedAt: '2026-09-28T16:00:00Z',
    transportedAt: '2026-09-28T16:45:00Z',
    disposalFacility: 'Central Common Bio-medical Waste Treatment Facility (CBWTF) Dindigul',
    disposalMethod: 'HIGH_TEMP_INCINERATION',
    complianceStatus: 'COMPLIANT_CPCB_MOHFW',
    qrCodeData: 'MEDORA-PASSPORT|MWP-2026-000184|INFECTIOUS|8.4KG|PHC-KODAIKANAL|HASH:a94b8e21',
    chainOfCustody: [
      {
        step: 'GENERATION',
        timestamp: '14:30 Today',
        facility: 'Medora PHC Kodaikanal',
        actor: 'Staff Nurse Anitha R.',
        status: 'COMPLETED',
        notes: 'Yellow color-coded double liner bag sealed with barcode.'
      },
      {
        step: 'SEGREGATION',
        timestamp: '14:32 Today',
        facility: 'Medora PHC Kodaikanal',
        actor: 'AI Classification Agent + Smart Bin #02',
        status: 'COMPLETED',
        notes: 'Autonomous visual verification (94% confidence score).'
      },
      {
        step: 'COLLECTION',
        timestamp: '16:00 Today',
        facility: 'Medora PHC Collection Bay',
        actor: 'Smart Cart Unit Alpha-02',
        status: 'COMPLETED',
        notes: 'Tare weight verified at 8.4 kg. Digital manifest signed.'
      },
      {
        step: 'TRANSPORT',
        timestamp: '16:45 Today',
        facility: 'In Transit — GPS Tracked GPS-TN-57-B-9912',
        actor: 'Driver Murugan K. / GPS Monitor Agent',
        status: 'IN_PROGRESS',
        notes: 'En route to Dindigul CBWTF. Temp kept at 4°C ambient.'
      },
      {
        step: 'HANDOVER',
        timestamp: 'Pending (~18:00)',
        facility: 'Dindigul CBWTF Entry Weighbridge',
        actor: 'CBWTF Gate Officer',
        status: 'PENDING',
        notes: 'Awaiting biometric & barcode scan at plant gate.'
      },
      {
        step: 'DISPOSAL',
        timestamp: 'Pending (~19:30)',
        facility: 'Dual Chamber Incinerator #02 (1050°C)',
        actor: 'Plant Engineer S. Sundaram',
        status: 'PENDING',
        notes: 'Emission monitoring linked with CPCB server.'
      }
    ]
  },
  {
    id: 2,
    passportId: 'MWP-2026-000185',
    sourceFacility: 'Medora PHC Kodaikanal',
    wasteCategory: 'SHARPS',
    weightKg: 4.6,
    binOrigin: 'BIN-PHC01-01',
    generatedAt: '2026-09-28T11:15:00Z',
    segregatedAt: '2026-09-28T11:16:00Z',
    collectedAt: '2026-09-28T14:00:00Z',
    transportedAt: '2026-09-28T15:00:00Z',
    handedOverAt: '2026-09-28T16:15:00Z',
    disposedAt: '2026-09-28T17:00:00Z',
    disposalFacility: 'Dindigul CBWTF Sharps Autoclave & Shredder',
    disposalMethod: 'AUTOCLAVE_SHRED',
    complianceStatus: 'COMPLIANT_CPCB_MOHFW',
    qrCodeData: 'MEDORA-PASSPORT|MWP-2026-000185|SHARPS|4.6KG|PHC-KODAIKANAL|HASH:c77e11f0',
    chainOfCustody: [
      {
        step: 'GENERATION',
        timestamp: '11:15 Today',
        facility: 'Medora PHC Kodaikanal',
        actor: 'Duty MO Dr. Kavitha',
        status: 'COMPLETED',
        notes: 'Puncture-proof translucent white sharps container.'
      },
      {
        step: 'SEGREGATION',
        timestamp: '11:16 Today',
        facility: 'Medora PHC Kodaikanal',
        actor: 'AI Classification Agent (98% confidence)',
        status: 'COMPLETED',
        notes: 'Sharps safely deposited and auto-locked lid.'
      },
      {
        step: 'COLLECTION',
        timestamp: '14:00 Today',
        facility: 'Medora PHC Collection Point',
        actor: 'Smart Cart Unit Alpha-02',
        status: 'COMPLETED',
        notes: 'Weight verified 4.6 kg.'
      },
      {
        step: 'TRANSPORT',
        timestamp: '15:00 Today',
        facility: 'Regional Transit',
        actor: 'Secure Logistics TN-57-B-9912',
        status: 'COMPLETED',
        notes: 'GPS route logged with zero deviations.'
      },
      {
        step: 'HANDOVER',
        timestamp: '16:15 Today',
        facility: 'CBWTF Dindigul',
        actor: 'CBWTF Operator',
        status: 'COMPLETED',
        notes: 'Manifest verified and accepted.'
      },
      {
        step: 'DISPOSAL',
        timestamp: '17:00 Today',
        facility: 'Autoclave Shredder Unit 1',
        actor: 'Chief Plant Officer',
        status: 'COMPLETED',
        notes: 'Mutilation & sterilization complete. Residue encapsulated.'
      }
    ]
  }
];

export const initialA2AMessages: A2AMessage[] = [
  {
    id: 1,
    messageId: 'A2A-MSG-1001',
    timestamp: '17:15:02',
    senderAgent: 'Waste Classification Agent',
    recipientAgent: 'Safety Verification Agent',
    category: 'BIOMEDICAL_WASTE',
    action: 'CLASSIFICATION_DISPATCH',
    inputPayload: { imageId: 'FRAME_78291', facility: 'PHC-01', camera: 'OPTICAL_TOP' },
    outputPayload: { category: 'INFECTIOUS', confidence: 0.94, recommendation: 'AUTO_SEGREGATE' },
    confidence: 0.94,
    status: 'PROCESSED'
  },
  {
    id: 2,
    messageId: 'A2A-MSG-1002',
    timestamp: '17:15:03',
    senderAgent: 'Safety Verification Agent',
    recipientAgent: 'IoT Monitoring Agent',
    category: 'BIOMEDICAL_WASTE',
    action: 'VERIFY_SAFETY_STATUS',
    inputPayload: { category: 'INFECTIOUS', confidence: 0.94 },
    outputPayload: { status: 'SAFETY_CONFIRMED', action: 'OPEN_YELLOW_BIN_LID' },
    confidence: 0.99,
    status: 'PROCESSED'
  },
  {
    id: 3,
    messageId: 'A2A-MSG-1003',
    timestamp: '17:15:04',
    senderAgent: 'IoT Monitoring Agent',
    recipientAgent: 'Prediction Agent',
    category: 'BIOMEDICAL_WASTE',
    action: 'TELEMETRY_SYNC',
    inputPayload: { binId: 'BIN-PHC01-02', currentFill: 88, weightKg: 8.4 },
    outputPayload: { thresholdBreached: true, fillRatePerHour: '4.2%' },
    status: 'PROCESSED'
  },
  {
    id: 4,
    messageId: 'A2A-MSG-1004',
    timestamp: '17:15:05',
    senderAgent: 'Prediction Agent',
    recipientAgent: 'Collection Agent',
    category: 'BIOMEDICAL_WASTE',
    action: 'FORECAST_CAPACITY_EXHAUSTION',
    inputPayload: { fillLevel: 88, historicalTrend: 'SURGE_EVENING_OT' },
    outputPayload: { estimatedHoursRemaining: 1.8, recommendation: 'DISPATCH_COLLECTION_P1' },
    status: 'PROCESSED'
  },
  {
    id: 5,
    messageId: 'A2A-MSG-1005',
    timestamp: '17:15:06',
    senderAgent: 'Collection Agent',
    recipientAgent: 'Traceability Agent',
    category: 'BIOMEDICAL_WASTE',
    action: 'DISPATCH_SMART_CART',
    inputPayload: { priority: 'P1_CRITICAL', batchId: 'BATCH-2026-INF-088', eta: 18 },
    outputPayload: { passportCreated: 'MWP-2026-000184', qrGenerated: true },
    status: 'ACTIVE'
  },
  {
    id: 6,
    messageId: 'A2A-MSG-1006',
    timestamp: '17:16:10',
    senderAgent: 'Medical Report Agent',
    recipientAgent: 'Patient Health Agent',
    category: 'HEALTHCARE',
    action: 'REPORT_PARSED',
    inputPayload: { patientId: 'P001', reportType: 'CBC_LAB_REPORT', source: 'KODAI_PHC_LAB' },
    outputPayload: { hemoglobin: '10.2 g/dL', rbc: '4.1 mil/uL', status: 'MILD_ANEMIA_MONITOR' },
    confidence: 0.98,
    status: 'PROCESSED'
  },
  {
    id: 7,
    messageId: 'A2A-MSG-1007',
    timestamp: '17:16:12',
    senderAgent: 'Patient Health Agent',
    recipientAgent: 'Clinical Summary Agent',
    category: 'HEALTHCARE',
    action: 'UPDATE_PATIENT_CHART',
    inputPayload: { patientId: 'P001', pregnancyWeek: 28, newHb: 10.2 },
    outputPayload: { summaryUpdated: true, flaggedForDoctorReview: true },
    status: 'PROCESSED'
  },
  {
    id: 8,
    messageId: 'A2A-MSG-1008',
    timestamp: '17:16:15',
    senderAgent: 'Clinical Summary Agent',
    recipientAgent: 'Doctor Portal Coordinator',
    category: 'HEALTHCARE',
    action: 'DOCTOR_SUMMARY_SYNCHRONIZED',
    inputPayload: { patientId: 'P001', doctorId: 'DOC01' },
    outputPayload: { badge: 'NEW_REPORT_READY', suggestedAction: 'IRON_SUPPLEMENT_ADVICE' },
    status: 'ACTIVE'
  }
];
