import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { useAppStore } from '../store/useAppStore';
import { db, CallHistoryRecord } from '../db/db';
import { callPhoneNumber, normalizePhoneNumber } from '../services/calling/phoneNumberUtils';
import {
  Phone, PhoneCall, Building2, User, Ambulance, ShieldAlert,
  AlertTriangle, Mic, Clock, ArrowRight, CheckCircle2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IvrPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOffline, currentUser } = useAppStore();

  const [enteredPhone, setEnteredPhone] = useState('+91 ');
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryRecord[]>([]);

  // Load local call history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await db.callHistory.reverse().limit(10).toArray();
        setCallHistory(history);
      } catch {}
    };
    loadHistory();
  }, []);

  const handleMakeCall = async (phoneToCall?: string, contactName?: string, contactType: CallHistoryRecord['contactType'] = 'PERSON') => {
    const target = phoneToCall || enteredPhone;
    const norm = normalizePhoneNumber(target);

    if (!norm.isValid) {
      setCallNotice(norm.error || 'Please enter a valid phone number.');
      return;
    }

    // Hand off to device native dialer via tel: URI
    const res = callPhoneNumber(norm.normalized);
    setCallNotice(res.message);

    // Save call initiation attempt in IndexedDB (truthful record: call initiated only)
    try {
      const record: CallHistoryRecord = {
        phoneNumber: norm.normalized,
        contactName: contactName || 'Custom Number',
        contactType,
        action: 'CALL_INITIATED',
        timestamp: new Date().toISOString(),
      };
      await db.callHistory.add(record);
      setCallHistory(prev => [record, ...prev.slice(0, 9)]);
    } catch {}
  };

  const SAVED_CONTACTS = [
    {
      name: 'Rampur PHC Emergency Duty Desk',
      role: 'Healthcare Center',
      phone: '+918232241108',
      displayPhone: '+91 82322 41108',
      type: 'HOSPITAL' as const,
      icon: Building2,
    },
    {
      name: 'Dr. Arjun Mehta (General Medicine)',
      role: 'Village Primary Doctor',
      phone: '+919800001111',
      displayPhone: '+91 98000 01111',
      type: 'DOCTOR' as const,
      icon: User,
    },
    {
      name: 'Sister Lakshmi Devi (ASHA #4402)',
      role: 'Community Health Worker',
      phone: '+919448100223',
      displayPhone: '+91 94481 00223',
      type: 'PERSON' as const,
      icon: User,
    },
    {
      name: '108 Rural Emergency Ambulance',
      role: 'Govt Emergency Service',
      phone: '108',
      displayPhone: '108 (Toll-Free)',
      type: 'EMERGENCY' as const,
      icon: Ambulance,
    },
  ];

  return (
    <Layout>
      <div className="px-4 py-5 max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <PhoneCall size={22} className="text-teal-700" />
              <span>{t('telephone.title', 'Medora Telephone & Calling')}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Native Cellular Calling · Works Offline · No Fake Simulations
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {callNotice && (
          <div className="bg-teal-50 border border-teal-300 rounded-2xl p-3 text-xs text-teal-900 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-teal-700" />
              <span className="font-semibold">{callNotice}</span>
            </div>
            <button onClick={() => setCallNotice(null)} className="text-teal-700 hover:text-teal-900">
              <X size={14} />
            </button>
          </div>
        )}

        {/* CARD 1: CALL ANY PERSON */}
        <div className="bg-white border-2 border-teal-600/30 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-800 text-lg">
              📞
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">CALL ANY PERSON</h2>
              <p className="text-xs text-slate-500">Uses your phone's normal cellular calling system</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Enter Phone Number:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                inputMode="tel"
                value={enteredPhone}
                onChange={e => setEnteredPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base sm:text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                onClick={() => handleMakeCall()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[50px]"
              >
                <Phone size={18} />
                <span>CALL</span>
              </button>
            </div>
          </div>

          {/* Offline & Desktop Clarity Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <p>
              • <strong>Offline Ready:</strong> Internet is not required for Medora to launch the phone dialer. A cellular SIM is required for the phone call itself.
            </p>
            <p>
              • <strong>Desktop Devices:</strong> On laptops/PCs, phone calling is available if your operating system has a supported calling app (FaceTime, Skype, Phone Link).
            </p>
          </div>
        </div>

        {/* CARD 2: MEDORA AI TELEPHONE */}
        <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-900/60 flex items-center justify-center text-purple-300 text-lg border border-purple-700/50">
                🤖
              </div>
              <div>
                <h2 className="text-base font-black text-white">MEDORA AI TELEPHONE</h2>
                <p className="text-xs text-slate-400">Toll-free conversational health assistance</p>
              </div>
            </div>

            <span className="text-[10px] font-bold font-mono bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Not Connected
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            A real toll-free telephony connection requires telecom carrier carrier-grade telephony gateway provisioning. For immediate voice assistance within your browser:
          </p>

          <button
            onClick={() => navigate('/ai')}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Mic size={16} />
            <span>🎤 Use Medora Browser Voice AI</span>
          </button>
        </div>

        {/* Saved Healthcare Contacts (Direct Native Call) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Emergency & Village Contacts:
          </h3>
          <div className="space-y-2">
            {SAVED_CONTACTS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  className="p-3 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-800">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.role} · {c.displayPhone}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMakeCall(c.phone, c.name, c.type)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Call History */}
        {callHistory.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} />
              <span>Recent Call Attempts (Logged Locally in IndexedDB)</span>
            </h3>
            <div className="divide-y divide-slate-100">
              {callHistory.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{item.contactName || item.phoneNumber}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">{item.phoneNumber}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
