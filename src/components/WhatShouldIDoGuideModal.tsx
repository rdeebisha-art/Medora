import React from 'react';
import {
  HelpCircle,
  X,
  Stethoscope,
  FileText,
  Pill,
  Calendar,
  Syringe,
  Baby,
  Heart,
  UserCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface WhatShouldIDoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tabKey: string, payload?: any) => void;
}

export const WhatShouldIDoGuideModal: React.FC<WhatShouldIDoGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const options = [
    {
      id: 'unwell',
      icon: <Stethoscope className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200 text-rose-950',
      title: '🤒 I am feeling unwell',
      description: 'Check symptoms, analyze severity, and receive guidance.',
      action: () => {
        onSelectAction('ai', { initialQuery: 'I am feeling unwell and have symptoms.' });
        onClose();
      },
    },
    {
      id: 'report',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200 text-blue-950',
      title: '📄 I have a medical report',
      description: 'Scan or upload your report to understand lab values in simple words.',
      action: () => {
        onSelectAction('a2a');
        onClose();
      },
    },
    {
      id: 'medicines',
      icon: <Pill className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200 text-purple-950',
      title: '💊 I need help with medicines',
      description: 'View daily medicine schedules, doses, and set reminders.',
      action: () => {
        onSelectAction('medicines');
        onClose();
      },
    },
    {
      id: 'appointment',
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200 text-amber-950',
      title: '📅 I have an appointment',
      description: 'Check upcoming doctor visits, dates, and clinic locations.',
      action: () => {
        onSelectAction('hospitals');
        onClose();
      },
    },
    {
      id: 'vaccination',
      icon: <Syringe className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200 text-teal-950',
      title: '💉 I want to check vaccination',
      description: 'Track immunization schedules for children and family.',
      action: () => {
        onSelectAction('children');
        onClose();
      },
    },
    {
      id: 'child',
      icon: <Baby className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-200 text-cyan-950',
      title: '👶 Child health',
      description: 'Pediatric care, fever guidance, and growth tracking.',
      action: () => {
        onSelectAction('children');
        onClose();
      },
    },
    {
      id: 'pregnancy',
      icon: <Heart className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50 border-pink-200 text-pink-950',
      title: '🤰 Pregnancy care',
      description: 'Maternal care, trimester checkups, and nutritional tips.',
      action: () => {
        onSelectAction('maternity');
        onClose();
      },
    },
    {
      id: 'elderly',
      icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      title: '👴 Elderly care',
      description: 'Senior health, hypertension, and arthritis care.',
      action: () => {
        onSelectAction('elderly');
        onClose();
      },
    },
    {
      id: 'emergency',
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
      bg: 'bg-red-100 border-red-300 text-red-950 font-black',
      title: '🚨 Emergency',
      description: 'Immediate 108 ambulance contacts & first aid steps.',
      action: () => {
        onSelectAction('emergency');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">❓ WHAT SHOULD I DO?</h2>
              <p className="text-xs text-slate-500">Select what you need help with right now</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={opt.action}
              className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all hover:shadow-md active:scale-98 flex items-start justify-between gap-3 ${opt.bg}`}
            >
              <div className="space-y-1">
                <div className="font-extrabold text-sm flex items-center gap-2">
                  <span>{opt.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug font-medium">{opt.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-400 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
