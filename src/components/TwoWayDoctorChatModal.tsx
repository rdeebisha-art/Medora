import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope, X, Send, User, Check, CheckCheck, Clock,
  WifiOff, AlertCircle, Languages, ShieldCheck, PhoneCall
} from 'lucide-react';
import { UserRole } from '../types';
import { inAppMessagingService } from '../services/messaging/inAppMessagingService';
import { InAppMessageRecord } from '../db/db';
import { useAppStore } from '../store/useAppStore';

interface TwoWayDoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  userRole: UserRole;
  doctorId?: string;
  doctorName?: string;
  onStartCall?: () => void;
}

export const TwoWayDoctorChatModal: React.FC<TwoWayDoctorChatModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  userRole,
  doctorId = 'DOC-01',
  doctorName = 'Dr. Arjun Mehta',
  onStartCall,
}) => {
  const { currentUser, language } = useAppStore();
  const [messages, setMessages] = useState<InAppMessageRecord[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const effectiveUserId = currentUser
    ? currentUser.role === 'doctor'
      ? `DOC-0${currentUser.id || 1}`
      : `P00${currentUser.id || 1}`
    : patientId || 'P001';

  const receiverId = userRole === 'doctor' ? patientId : doctorId;
  const receiverName = userRole === 'doctor' ? patientName : doctorName;
  const conversationId = inAppMessagingService.getConversationId(effectiveUserId, receiverId);

  // Subscribe to real-time conversation messages
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = inAppMessagingService.subscribeConversation(conversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || isSending) return;

    setInputVal('');
    setIsSending(true);

    try {
      await inAppMessagingService.sendMessage({
        receiverId,
        receiverName,
        text,
        language,
      });
    } catch (err) {
      console.error('[In-App Messaging] Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: InAppMessageRecord['status']) => {
    switch (status) {
      case 'PENDING_OFFLINE':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Waiting for connection</span>
          </span>
        );
      case 'SENDING':
        return <Clock className="w-3 h-3 text-slate-400" />;
      case 'SENT':
        return <Check className="w-3 h-3 text-slate-400" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3 h-3 text-teal-600" />;
      case 'READ':
        return <CheckCheck className="w-3 h-3 text-blue-600" />;
      case 'FAILED':
        return <AlertCircle className="w-3 h-3 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Medora Doctor-Patient Chat"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              {userRole === 'doctor' ? (
                <User className="w-5 h-5 text-teal-700" />
              ) : (
                <Stethoscope className="w-5 h-5 text-teal-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{receiverName}</h3>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {userRole === 'doctor' ? `Patient ID: ${receiverId}` : 'Medora Verified Medical Officer'} • In-App Zero Carrier Charge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onStartCall && (
              <button
                type="button"
                onClick={onStartCall}
                title="Start Medora WebRTC Voice Call"
                className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Status Notice Banner */}
        <div className="bg-teal-50/70 border-b border-teal-100 px-4 py-2 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>End-to-End In-App Medora Connection</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-teal-200 shadow-xs"
          >
            <Languages className="w-3 h-3" />
            <span>{showTranslation ? 'Translations: ON' : 'Translations: OFF'}</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-600">No previous messages in this consultation</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Send a clinical query or update your vitals. Messages are transmitted in real-time across Medora devices.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === effectiveUserId;
              return (
                <div key={m.messageId} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 shadow-xs ${
                      isMine
                        ? 'bg-teal-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/80 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{m.originalText}</p>

                    {/* Multilingual Translation Subtitle if different */}
                    {showTranslation && m.translatedText && m.translatedText !== m.originalText && (
                      <div
                        className={`mt-1.5 pt-1.5 border-t text-[11px] leading-snug ${
                          isMine ? 'border-teal-500/60 text-teal-100' : 'border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-bold text-[9px] uppercase tracking-wider block opacity-75">
                          Auxiliary Translation:
                        </span>
                        {m.translatedText}
                      </div>
                    )}

                    {/* Metadata & Status */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                        isMine ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && getStatusIcon(m.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <textarea
            rows={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your healthcare message..."
            className="flex-1 bg-slate-100/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none max-h-24"
          />

          <button
            type="button"
            disabled={!inputVal.trim() || isSending}
            onClick={handleSend}
            className={`p-3 rounded-2xl bg-teal-600 text-white shadow-md transition ${
              !inputVal.trim() || isSending
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-teal-500 active:scale-95 cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
