import { WasteContainerRecord } from '../types/wasteTypes';

export const INITIAL_CONTAINERS: WasteContainerRecord[] = [
  {
    containerId: 'BOX-SHARPS-01',
    qrCode: 'MEDORA-CONT-SHARPS-001',
    wasteCategory: 'CAT_SHARPS',
    stream: 'SHARPS',
    locationId: 'LOC-KODAI-PHC-INJ',
    colorCode: '#0284C7',
    status: 'ACTIVE',
    currentFillLevelPercent: 65,
    maxCapacityKg: 5.0,
    currentWeightKg: 3.25,
    lastEmptiedAt: '2026-09-24T08:30:00Z'
  },
  {
    containerId: 'BIN-YELLOW-01',
    qrCode: 'MEDORA-CONT-YELLOW-001',
    wasteCategory: 'CAT_INFECTIOUS',
    stream: 'INFECTIOUS',
    locationId: 'LOC-KODAI-PHC-OT',
    colorCode: '#EAB308',
    status: 'ACTIVE',
    currentFillLevelPercent: 82,
    maxCapacityKg: 20.0,
    currentWeightKg: 16.4,
    lastEmptiedAt: '2026-09-25T07:15:00Z'
  },
  {
    containerId: 'BIN-RED-01',
    qrCode: 'MEDORA-CONT-RED-001',
    wasteCategory: 'CAT_CONTAMINATED_PLASTIC',
    stream: 'INFECTIOUS',
    locationId: 'LOC-KODAI-GH-MAT',
    colorCode: '#EF4444',
    status: 'ACTIVE',
    currentFillLevelPercent: 40,
    maxCapacityKg: 15.0,
    currentWeightKg: 6.0,
    lastEmptiedAt: '2026-09-26T09:00:00Z'
  },
  {
    containerId: 'BIN-PHARMA-01',
    qrCode: 'MEDORA-CONT-PHARMA-001',
    wasteCategory: 'CAT_PHARMA',
    stream: 'PHARMACEUTICAL',
    locationId: 'LOC-KODAI-PHC-LAB',
    colorCode: '#D97706',
    status: 'ACTIVE',
    currentFillLevelPercent: 28,
    maxCapacityKg: 10.0,
    currentWeightKg: 2.8,
    lastEmptiedAt: '2026-09-22T11:45:00Z'
  },
  {
    containerId: 'BIN-GENERAL-01',
    qrCode: 'MEDORA-CONT-GENERAL-001',
    wasteCategory: 'CAT_GENERAL',
    stream: 'GENERAL',
    locationId: 'LOC-KODAI-PHC-INJ',
    colorCode: '#10B981',
    status: 'ACTIVE',
    currentFillLevelPercent: 50,
    maxCapacityKg: 25.0,
    currentWeightKg: 12.5,
    lastEmptiedAt: '2026-09-26T16:00:00Z'
  }
];
