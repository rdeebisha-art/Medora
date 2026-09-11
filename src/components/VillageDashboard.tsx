import React from 'react';
import { CareTiersHeader } from './CareTiersHeader';
import { MedicineReminder } from './MedicineReminder';
import { DiseaseGuide } from './DiseaseGuide';
import { HospitalTransitGuide } from './HospitalTransitGuide';
import { DoctorHandoffChart } from './DoctorHandoffChart';
import { Hospital, Specialization, LanguageCode, VitalMeasurement } from '../types';

interface VillageDashboardProps {
  hospitals: Hospital[];
  vitalTrends: VitalMeasurement[];
  adherenceHistory: { month: string; rate: number }[];
  onSelectCategory: (category: Specialization) => void;
  onOpenDirections: (hospital: Hospital) => void;
  onOpenEmergency: () => void;
  currentLang: LanguageCode;
}

export const VillageDashboard: React.FC<VillageDashboardProps> = ({
  hospitals,
  vitalTrends,
  adherenceHistory,
  onSelectCategory,
  onOpenDirections,
  onOpenEmergency,
  currentLang,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. At the very starting: Elderly, Maternity, Child Care */}
      <CareTiersHeader
        onSelectCategory={onSelectCategory}
        onOpenEmergency={onOpenEmergency}
        currentLang={currentLang}
      />

      {/* 2. Immediate Hospital Contacts & How Can Villagers Go to Hospital Easily */}
      <HospitalTransitGuide
        hospitals={hospitals}
        onOpenDirections={onOpenDirections}
        onOpenEmergency={onOpenEmergency}
        currentLang={currentLang}
      />

      {/* 3. Daily Medication Reminder with dosage and take-now action */}
      <MedicineReminder currentLang={currentLang} />

      {/* 4. Graphs for the Medicinal Condition */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Medicinal Condition & Vital Sign Trends (  )
            </h3>
            <p className="text-xs text-slate-500">
              Longitudinal tracking of Blood Pressure spikes, Fasting Sugar, and Medication Adherence.
            </p>
          </div>
        </div>

        <DoctorHandoffChart
          vitalTrends={vitalTrends}
          adherenceHistory={adherenceHistory}
        />
      </div>

      {/* 5. Comprehensive Disease Guide & Prevention Measures for Villagers */}
      <DiseaseGuide
        onFindSpecialist={onSelectCategory}
        currentLang={currentLang}
      />
    </div>
  );
};
