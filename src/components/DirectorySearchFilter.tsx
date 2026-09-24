import React from 'react';
import { Search, X, RotateCcw, Stethoscope, Building2, MapPin, Globe, Video, ShieldCheck, Siren } from 'lucide-react';
import { Specialization, HospitalType, ConsultationType, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SearchFilterState {
  query: string;
  specialty: string;
  hospitalType: string;
  language: string;
  consultationType: string;
  location: string;
  isGovernmentOnly: boolean;
  isEmergencyOnly: boolean;
}

interface DirectorySearchFilterProps {
  filters: SearchFilterState;
  onFilterChange: (updated: Partial<SearchFilterState>) => void;
  onResetFilters: () => void;
  currentLang: LanguageCode;
  totalDoctors: number;
  totalHospitals: number;
  activeTab: 'doctors' | 'hospitals' | 'referrals' | 'handoff' | 'journey';
  onSelectTab: (tab: string) => void;
}

export const DirectorySearchFilter: React.FC<DirectorySearchFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  currentLang,
  totalDoctors,
  totalHospitals,
  activeTab,
  onSelectTab,
}) => {
  const t = TRANSLATIONS[currentLang];

  const specialties: Specialization[] = [
    'General Physician',
    'Pediatrician',
    'Gynecologist / Obstetrician',
    'Geriatric Care',
    'Diabetologist',
    'Cardiologist',
    'Nutritionist',
    'Mental Wellness Professional',
  ];

  const hospitalTypes: HospitalType[] = [
    'Government Hospital',
    'General Hospital',
    'Primary Health Centre',
    'Community Health Centre',
    'Specialty Hospital',
    'Maternal Care',
    'Child Care',
    'Emergency Care',
  ];

  const languages = ['English', 'Hindi', 'Telugu', 'Malayalam', 'Tamil', 'Kannada'];

  const locations = [
    'All Locations',
    'Rampur Village',
    'Green Valley Rural Block',
    'Mandya Rural Hub',
    'Taluk West / Central',
    'Sector 3 Civil Station',
    'Highway Corridor Sector 9'
  ];

  const hasActiveFilters = 
    Boolean(filters.query) || 
    Boolean(filters.specialty) || 
    Boolean(filters.hospitalType) || 
    Boolean(filters.language) || 
    Boolean(filters.consultationType) || 
    Boolean(filters.location) ||
    filters.isGovernmentOnly ||
    filters.isEmergencyOnly;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
      {/* Tab Switcher: Doctors vs Hospitals */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onSelectTab('doctors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'doctors'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t.findDoctor}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === 'doctors' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalDoctors}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('hospitals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'hospitals'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t.findHospital}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === 'hospitals' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalHospitals}
            </span>
          </button>
        </div>

        {/* Quick Clear / Reset */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Primary Large Touch Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-emerald-600" />
        </div>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onFilterChange({ query: e.target.value })}
          placeholder={t.searchPlaceholder}
          className="block w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50 border-2 border-slate-200 hover:border-emerald-300 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all"
        />
        {filters.query && (
          <button
            onClick={() => onFilterChange({ query: '' })}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter Control Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Specialty Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-emerald-600" />
            Specialty
          </label>
          <select
            value={filters.specialty}
            onChange={(e) => onFilterChange({ specialty: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">{t.allSpecialties}</option>
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Hospital Type Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-blue-600" />
            Hospital Type
          </label>
          <select
            value={filters.hospitalType}
            onChange={(e) => onFilterChange({ hospitalType: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">{t.allHospitalTypes}</option>
            {hospitalTypes.map((ht) => (
              <option key={ht} value={ht}>
                {ht}
              </option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-600" />
            Language
          </label>
          <select
            value={filters.language}
            onChange={(e) => onFilterChange({ language: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">{t.allLanguages}</option>
            {languages.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>
        </div>

        {/* Consultation Mode */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Video className="w-3 h-3 text-purple-600" />
            Consultation Type
          </label>
          <select
            value={filters.consultationType}
            onChange={(e) => onFilterChange({ consultationType: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Modes</option>
            <option value="In-person">{t.inPerson}</option>
            <option value="Teleconsultation">{t.teleconsultation}</option>
            <option value="Both">{t.both}</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-500" />
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value === 'All Locations' ? '' : e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Toggles: Government / Ayushman & Emergency 24x7 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onFilterChange({ isGovernmentOnly: !filters.isGovernmentOnly })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-colors ${
              filters.isGovernmentOnly
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Government / Ayushman Empanelled</span>
          </button>

          <button
            onClick={() => onFilterChange({ isEmergencyOnly: !filters.isEmergencyOnly })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-colors ${
              filters.isEmergencyOnly
                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Emergency 24x7 Only</span>
          </button>
        </div>

        <button
          onClick={onResetFilters}
          className="text-emerald-700 hover:text-emerald-800 font-bold underline text-xs"
        >
          {t.viewAll}
        </button>
      </div>
    </div>
  );
};
