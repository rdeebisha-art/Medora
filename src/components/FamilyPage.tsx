import React, { useState } from 'react';
import {
  Users,
  Search,
  Heart,
  Pill,
  FileText,
  Syringe,
  Stethoscope,
  ChevronRight,
  Send,
  UserCheck,
  ShieldCheck,
  Calendar,
  Activity,
  User,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { FamilyMember, LanguageCode } from '../types';

interface FamilyPageProps {
  currentLang: LanguageCode;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onNavigateToDashboard: () => void;
  onOpenCommunicationCenterForPatient: (patientId: string) => void;
}

export const FamilyPage: React.FC<FamilyPageProps> = ({
  currentLang,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onNavigateToDashboard,
  onOpenCommunicationCenterForPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 5 Canonical Demo Family Members
  const canonicalFamilyData = [
    {
      id: 'P-1001',
      name: 'Ramesh Kumar',
      age: 68,
      relationship: 'Grandfather',
      healthCategory: 'Elderly Care',
      healthId: 'ABHA-9901-2281-01',
      avatarBg: 'bg-amber-600 text-white',
      avatarIcon: '👴',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      activeConditions: ['Hypertension (158/96)', 'Mild Anaemia (Hb 10.2)'],
    },
    {
      id: 'P-1002',
      name: 'Lakshmi Kumar',
      age: 62,
      relationship: 'Grandmother',
      healthCategory: 'General Care',
      healthId: 'ABHA-9901-2281-02',
      avatarBg: 'bg-rose-600 text-white',
      avatarIcon: '👵',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      activeConditions: ['Joint Pain / Arthritis'],
    },
    {
      id: 'P-1003',
      name: 'Arun Kumar',
      age: 38,
      relationship: 'Son',
      healthCategory: 'General Care',
      healthId: 'ABHA-9901-2281-03',
      avatarBg: 'bg-blue-600 text-white',
      avatarIcon: '👨',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      activeConditions: ['Routine Health Tracking'],
    },
    {
      id: 'P-1004',
      name: 'Meena Kumar',
      age: 34,
      relationship: 'Daughter-in-law',
      healthCategory: 'General Care',
      healthId: 'ABHA-9901-2281-04',
      avatarBg: 'bg-teal-600 text-white',
      avatarIcon: '👩',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      activeConditions: ['Wellness & Nutrition'],
    },
    {
      id: 'P-1005',
      name: 'Priya Kumar',
      age: 12,
      relationship: 'Granddaughter',
      healthCategory: 'Child Care',
      healthId: 'ABHA-9901-2281-05',
      avatarBg: 'bg-purple-600 text-white',
      avatarIcon: '👧',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      activeConditions: ['Upcoming Vaccination'],
    },
  ];

  const filteredMembers = canonicalFamilyData.filter((member) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.relationship.toLowerCase().includes(q) ||
      member.healthId.toLowerCase().includes(q) ||
      member.healthCategory.toLowerCase().includes(q)
    );
  });

  const recentActivityLogs = [
    { text: 'Ramesh Kumar uploaded a medical report (Hb 10.2 g/dL)', time: '2 hours ago', icon: '📄' },
    { text: 'Lakshmi Kumar has a medicine reminder (Amlodipine 5mg)', time: '4 hours ago', icon: '💊' },
    { text: 'Arun Kumar requested health assistance from ASHA Kavitha', time: '1 day ago', icon: '📞' },
    { text: 'Priya Kumar has an upcoming vaccination scheduled', time: '2 days ago', icon: '💉' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-teal-400/20 text-teal-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
                MY FAMILY
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
                FAM1001
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Kumar Family Profile</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
              <span>📍 Village: <strong>Demo Village</strong></span>
              <span>•</span>
              <span>Sub-district: <strong>Demo Rural Taluk</strong></span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 text-center shrink-0">
            <div>
              <p className="text-2xl font-black text-teal-300">5</p>
              <p className="text-[10px] uppercase font-bold text-slate-300">Family Members</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-black text-amber-300">2</p>
              <p className="text-[10px] uppercase font-bold text-slate-300">Active Reminders</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Family Health Overview Summary Cards */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          Family Health Overview
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 text-center space-y-1">
            <span className="text-2xl">👨‍👩‍👧</span>
            <p className="font-black text-lg text-teal-950">5</p>
            <p className="text-[11px] font-bold text-teal-800">Family Members</p>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-center space-y-1">
            <span className="text-2xl">💊</span>
            <p className="font-black text-lg text-amber-950">2</p>
            <p className="text-[11px] font-bold text-amber-800">Medicine Reminders</p>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-center space-y-1">
            <span className="text-2xl">📄</span>
            <p className="font-black text-lg text-blue-950">1</p>
            <p className="text-[11px] font-bold text-blue-800">Recent Report</p>
          </div>

          <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 text-center space-y-1">
            <span className="text-2xl">💉</span>
            <p className="font-black text-lg text-purple-950">1</p>
            <p className="text-[11px] font-bold text-purple-800">Upcoming Vaccination</p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-center space-y-1 col-span-2 sm:col-span-1">
            <span className="text-2xl">👨‍⚕️</span>
            <p className="font-black text-lg text-emerald-950">1</p>
            <p className="text-[11px] font-bold text-emerald-800">Doctor Follow-up</p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search family member by Name, Relationship, or Patient ABHA ID..."
          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Family Member Cards (5 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Family Members ({filteredMembers.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click card or action buttons</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isSelected = member.id === selectedFamilyId;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-3xl p-5 border-2 shadow-sm transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isSelected
                    ? 'border-teal-600 ring-2 ring-teal-100 bg-teal-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {member.avatarIcon}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          {member.age} years • {member.relationship}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="bg-teal-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Category & ID Badge */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${member.badgeBg}`}>
                      🩺 {member.healthCategory}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {member.healthId}
                    </span>
                  </div>

                  {/* Active Conditions */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Health Focus:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.activeConditions.map((cond) => (
                        <span key={cond} className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: [ View Health ] & [ Share Details ] */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onSelectFamilyMember(member.id);
                      onNavigateToDashboard();
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Health</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectFamilyMember(member.id);
                      onOpenCommunicationCenterForPatient(member.id);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-extrabold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Family Activity */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Recent Family Activity
        </h3>

        <div className="space-y-2">
          {recentActivityLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{log.icon}</span>
                <span className="font-bold text-slate-800">{log.text}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
