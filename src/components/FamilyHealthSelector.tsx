import React from 'react';
import { Users, AlertTriangle, Stethoscope, Building2, ChevronRight, HeartPulse } from 'lucide-react';
import { FamilyMember, Specialization, LanguageCode } from '../types';

interface FamilyHealthSelectorProps {
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onFilterByMemberCategory: (category: Specialization, memberId: string) => void;
  onFindHospitalForMember: (memberId: string) => void;
  currentLang: LanguageCode;
}

export const FamilyHealthSelector: React.FC<FamilyHealthSelectorProps> = ({
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onFilterByMemberCategory,
  onFindHospitalForMember,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Family Health & Care Category Navigation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a family member to view their care profile or automatically navigate the directory to their recommended clinical specialty.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {familyMembers.map((member) => {
          const isSelected = member.id === selectedFamilyId;

          return (
            <div
              key={member.id}
              onClick={() => onSelectFamilyMember(member.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-100'
                  : 'border-slate-200 hover:border-emerald-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${member.avatarBg}`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                        {member.name.split('(')[0]}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {member.relationship} • {member.age} yrs
                      </span>
                    </div>
                  </div>

                  {member.hasCareGap && (
                    <span
                      title="Care Gap Detected"
                      className="p-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Gap
                    </span>
                  )}
                </div>

                {/* Primary Category Tag */}
                <div className="mt-2 py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Recommended Care
                  </span>
                  <span className="font-extrabold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    {member.primaryCategory}
                  </span>
                </div>

                {/* Conditions Chips */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {member.activeConditions.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick 1-Click Directory Discovery Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterByMemberCategory(member.primaryCategory, member.id);
                  }}
                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Doctors</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFindHospitalForMember(member.id);
                  }}
                  className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Hospitals</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
