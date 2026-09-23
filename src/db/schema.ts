import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  role: 'patient' | 'family' | 'doctor' | 'admin';
  name: string;
  age?: number;
  gender?: string;
  phone: string;
  pin: string;
  village?: string;
  language?: string;
  familyId?: number;
}

export interface Family {
  id?: number;
  name: string;
  pin: string;
}

export interface MedicalRecord {
  id?: number;
  patientId: number;
  date: string;
  type: 'vitals' | 'report' | 'vaccination' | 'prescription';
  data: any;
}

export interface Medicine {
  id?: number;
  patientId: number;
  name: string;
  dose: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate: string;
  instructions: string;
}

export class MedoraDB extends Dexie {
  users!: Table<User, number>;
  families!: Table<Family, number>;
  records!: Table<MedicalRecord, number>;
  medicines!: Table<Medicine, number>;

  constructor() {
    super('MedoraDB');
    this.version(1).stores({
      users: '++id, role, phone, familyId',
      families: '++id, name',
      records: '++id, patientId, date, type',
      medicines: '++id, patientId, name'
    });
  }
}

export const db = new MedoraDB();
