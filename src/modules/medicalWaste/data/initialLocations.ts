import { WasteCollectionLocationRecord } from '../types/wasteTypes';

export const INITIAL_COLLECTION_LOCATIONS: WasteCollectionLocationRecord[] = [
  {
    locationId: 'LOC-KODAI-PHC-OT',
    name: 'Kodaikanal PHC - Minor OT & Procedure Suite',
    facilityType: 'PHC',
    building: 'Main Clinical Block',
    ward: 'Surgical Wing',
    room: 'Room 102',
    contactPerson: 'Sister V. Latha',
    contactPhone: '9840011223'
  },
  {
    locationId: 'LOC-KODAI-PHC-INJ',
    name: 'Kodaikanal PHC - Immunization & Injection Room',
    facilityType: 'PHC',
    building: 'Outpatient Block',
    ward: 'Immunization Hub',
    room: 'Room 04',
    contactPerson: 'Staff Nurse R. Selvi',
    contactPhone: '9840011224'
  },
  {
    locationId: 'LOC-KODAI-PHC-LAB',
    name: 'Kodaikanal PHC - Diagnostic Pathology Lab',
    facilityType: 'LAB',
    building: 'Diagnostics Block',
    ward: 'Pathology & Serology',
    room: 'Lab-A',
    contactPerson: 'Mr. K. Manickam (Lab Tech)',
    contactPhone: '9840011225'
  },
  {
    locationId: 'LOC-KODAI-GH-MAT',
    name: 'Kodaikanal GH - Maternity & Labor Room',
    facilityType: 'HOSPITAL',
    building: 'Maternal Wing',
    ward: 'Labor & Delivery',
    room: 'Labor Suite 1',
    contactPerson: 'Dr. Ananya Iyer',
    contactPhone: '9840011226'
  },
  {
    locationId: 'LOC-PALANI-CHC-EMERG',
    name: 'Palani CHC - Emergency & Trauma Bay',
    facilityType: 'CHC',
    building: 'Trauma Care Unit',
    ward: 'Emergency Triage',
    room: 'Bay 3',
    contactPerson: 'Dr. Suresh Balakrishnan',
    contactPhone: '9840011227'
  }
];
