import React, { useState } from 'react';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

const FAQS = [
  {
    q: 'What is MEDORA?',
    a: 'MEDORA is an offline-first, multilingual, voice-first rural healthcare platform designed to help villagers, mothers, children, and elderly people access health guidance with less cost, less complexity, and zero cloud dependencies.'
  },
  {
    q: 'Does MEDORA work without an internet connection?',
    a: 'Yes. Once loaded or installed as a PWA, all core Medora features—including patient records, family health tracking, medicine schedules, health tests, government schemes, and offline rule-based AI—run 100% locally from IndexedDB on your device.'
  },
  {
    q: 'Can I speak to Medora in my own language?',
    a: 'Yes! Medora features natural-language voice conversation supporting Tamil (தமிழ்), Telugu (తెలుగు), Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), and English. Medora automatically detects your language without forcing you through complicated numeric menus and responds in the same language.'
  },
  {
    q: 'Which languages are supported for voice?',
    a: 'Medora officially supports 5 languages: Tamil (ta-IN), Telugu (te-IN), Malayalam (ml-IN), Kannada (kn-IN), and English (en-IN).'
  },
  {
    q: 'Does MEDORA make medical diagnoses?',
    a: 'No. Medora does not replace a qualified doctor. It provides safe first-level health guidance, triage, preventive care checklists, and structured handoff summaries for licensed medical practitioners.'
  },
  {
    q: 'Can Medora change my medicine dosage?',
    a: 'No. Medora will never modify your prescribed medicine dosage or timing. It only displays prescriptions recorded by your authorized healthcare professional.'
  },
  {
    q: 'How does the Doctor Handoff Summary work?',
    a: 'When you discuss your symptoms with Medora, it organizes your complaints, duration, vitals, and medications into a structured summary that you can print or present to a doctor during your consultation.'
  },
  {
    q: 'Is the Telephone / Toll-Free feature real right now?',
    a: 'The current prototype features a browser-based Telephone Simulation that runs the exact same conversation engine. In the future, this engine will connect to a real telecom gateway and toll-free number (1800-XXX-XXXX) for users with basic feature phones.'
  },
  {
    q: 'Is my health data sent to any third-party cloud servers?',
    a: 'No. All patient data, vitals, prescriptions, and conversation transcripts remain strictly on your device inside browser IndexedDB.'
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <HelpCircle size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Frequently Asked Questions</h1>
              <p className="text-xs text-slate-500">Everything you need to know about MEDORA</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp size={16} className="text-teal-600" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-teal-900">
          <ShieldCheck size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Healthcare Integrity:</strong> Medora operates under strict safety guidelines. In any critical health emergency, always seek immediate care at the nearest Primary Health Centre or dial 108.
          </p>
        </div>
      </div>
    </Layout>
  );
}
