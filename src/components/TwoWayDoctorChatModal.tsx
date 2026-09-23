import React, { useState } from 'react';
import { Stethoscope, X, Send, User, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface Message {
  id: string;
  sender: 'PATIENT' | 'DOCTOR';
  text: string;
  timestamp: string;
}

interface TwoWayDoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  userRole: UserRole;
}

export const TwoWayDoctorChatModal: React.FC<TwoWayDoctorChatModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  userRole,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'PATIENT',
      text: 'Hello Dr. Patil, I have been experiencing dizziness and increased thirst for 2 days. My BP reading was 158/96 mmHg.',
      timestamp: '10:15 AM',
    },
    {
      id: 'm2',
      sender: 'DOCTOR',
      text: 'Hello Ramesh. I have reviewed your Extracted Demo Report findings (BP 158/96, Glucose Elevated). Please monitor your temperature and tell me if you have any breathing difficulty.',
      timestamp: '10:18 AM',
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: userRole === 'doctor' ? 'DOCTOR' : 'PATIENT',
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulated Auto Reply if sent as Patient
    if (userRole !== 'doctor') {
      setTimeout(() => {
        const docReply: Message = {
          id: `m-reply-${Date.now()}`,
          sender: 'DOCTOR',
          text: 'Thank you for updating your vitals. Continue monitoring. If severe chest pain or shortness of breath occurs, call 108 immediately. (DEMO DOCTOR RESPONSE)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, docReply]);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Dr. Rajeshwar Patil</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                  AVAILABLE (ON DUTY)
                </span>
              </div>
              <p className="text-xs text-slate-500">District Civil Hospital • Patient: {patientName} ({patientId})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinician Review Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-xs text-amber-950 flex items-center justify-between">
          <span className="font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI-generated summary — clinician review required.</span>
          </span>
          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
            DEMO COMMUNICATION
          </span>
        </div>

        {/* Message History Window */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-64 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'PATIENT' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] p-3 rounded-2xl space-y-1 ${
                  m.sender === 'PATIENT'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="font-bold text-[10px] opacity-75 flex items-center justify-between gap-4 border-b border-white/10 pb-0.5 mb-1">
                  <span>{m.sender === 'PATIENT' ? `👤 ${patientName}` : '👨‍⚕️ Dr. Rajeshwar Patil'}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="leading-relaxed font-medium">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={userRole === 'doctor' ? 'Reply as Dr. Patil...' : 'Type message to doctor...'}
            className="text-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 bg-slate-50 w-full focus:outline-none focus:border-blue-500 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
