import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { BookOpen, Mic, Activity, Pill, FileText, AlertTriangle, WifiOff, PhoneCall } from 'lucide-react';

const GUIDES = [
  {
    icon: <Mic size={20} className="text-teal-600" />,
    title: 'How to Speak to Medora',
    desc: 'Tap the large microphone button on the home page or AI Assistant. Speak naturally in Tamil, Telugu, Malayalam, Kannada, or English. Medora detects your language and responds in the same language.'
  },
  {
    icon: <Activity size={20} className="text-blue-600" />,
    title: 'How to Record a Health Test',
    desc: 'Go to Health Tests from the dashboard. Select Blood Pressure, Blood Sugar, Weight, or SpO2, enter the value, and tap Save. Medora visualizes your trends with charts.'
  },
  {
    icon: <Pill size={20} className="text-emerald-600" />,
    title: 'How to Track Medicines',
    desc: 'Under Medicines & Reminders, review active prescriptions. Tap "Taken" when you take your dose, "Snooze" for a 30-minute reminder, or "Missed" to track adherence.'
  },
  {
    icon: <FileText size={20} className="text-purple-600" />,
    title: 'How to Generate a Doctor Summary',
    desc: 'Discuss your symptoms with Medora AI or visit Doctor Summary. Tap "Generate Summary" to produce a clean printable briefing containing your vitals, complaints, and medications.'
  },
  {
    icon: <WifiOff size={20} className="text-amber-600" />,
    title: 'How Offline Mode Works',
    desc: 'All your data is saved in local IndexedDB. You can view records, track vitals, and receive rule-based healthcare guidance even when completely disconnected from the internet.'
  },
  {
    icon: <AlertTriangle size={20} className="text-red-600" />,
    title: 'Emergency Guidance',
    desc: 'In case of severe symptoms (chest pain, breathlessness, heavy bleeding), tap the Emergency button for instant first aid steps, nearby hospital contacts, and 108 ambulance booking simulation.'
  }
];

export default function HelpPage() {
  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">User Help & Guide</h1>
              <p className="text-xs text-slate-500">Step-by-step instructions for using MEDORA</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        <div className="space-y-3">
          {GUIDES.map((g, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                {g.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{g.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Help Navigation */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-sm">Need immediate guidance?</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/ai"
              className="bg-white/15 hover:bg-white/25 rounded-xl p-2.5 text-center text-xs font-bold transition-colors"
            >
              🤖 Ask Medora AI
            </Link>
            <Link
              to="/emergency"
              className="bg-red-500/80 hover:bg-red-500 rounded-xl p-2.5 text-center text-xs font-bold transition-colors"
            >
              🚨 Emergency Help
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
