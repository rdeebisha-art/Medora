import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, FileText, Smartphone, WifiOff, Stethoscope, PhoneCall } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [openTopicId, setOpenTopicId] = useState<string | null>('report');

  if (!isOpen) return null;

  const topics = [
    {
      id: 'report',
      question: 'What is a medical report?',
      answer: 'A medical report is a paper or digital document from a laboratory or hospital showing your test results, such as blood pressure, hemoglobin, blood glucose, or X-ray findings.',
    },
    {
      id: 'upload',
      question: 'How do I upload a report?',
      answer: 'Click on "My Reports" or "Scan Report", select a file (PDF, JPG, PNG) from your device, preview the file, and click "Extract Information".',
    },
    {
      id: 'scan',
      question: 'How do I scan a report?',
      answer: 'Open Medora on a smartphone or tablet, point your device camera at the printed lab report in good lighting, and tap "Scan Report".',
    },
    {
      id: 'share',
      question: 'How do I share health information with a doctor?',
      answer: 'Go to "Doctor Summary" or "Doctor Handoff", click "Generate Doctor Summary", and show or send the summary packet directly to your clinician.',
    },
    {
      id: 'offline',
      question: 'How does Offline Mode work?',
      answer: 'When internet is unavailable, Medora uses local caching to show your emergency profile, medicines, and offline guidance. Any new inputs are saved in an offline queue and synced automatically when you reconnect.',
    },
    {
      id: 'doctor',
      question: 'How do I contact a doctor?',
      answer: 'Use the "Contact Doctor" button on any health card or Ask Medora AI page to request a clinician handoff or callback.',
    },
    {
      id: 'ussd',
      question: 'What is USSD (*123#)?',
      answer: 'USSD allows basic button phone users to dial *123# from a feature phone without internet to check symptoms, report status, or request doctor callback via SMS menus.',
    },
    {
      id: 'lowband',
      question: 'What is Low Bandwidth (2G) Mode?',
      answer: 'Low Bandwidth Mode optimizes Medora for slow 2G internet connections by turning off large images/animations and transmitting plain-text health payloads.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">❓ MEDORA HELP & FAQ</h2>
              <p className="text-xs text-slate-500">Simple answers to common health platform questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {topics.map((t) => {
            const isOpen = openTopicId === t.id;
            return (
              <div key={t.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenTopicId(isOpen ? null : t.id)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-900"
                >
                  <span>{t.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-purple-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 animate-in fade-in duration-150">
                    {t.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
