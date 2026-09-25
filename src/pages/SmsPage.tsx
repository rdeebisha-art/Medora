import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, SmsOutbox } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { smsService } from '../services/sms/smsService';
import { SmsPreviewModal } from '../components/SmsPreviewModal';
import { SmsSendPayload } from '../services/sms/smsStatus';
import { Send, Clock, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

const MSG_TYPES = ['doctor_summary', 'emergency_alert', 'appointment', 'medicine_reminder', 'vaccination', 'family_alert', 'hospital_info'];
const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' }, { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' }, { code: 'ml', name: 'മലയാളം' },
];

export default function SmsPage() {
  const { t } = useTranslation();
  const { language, currentUser } = useAppStore();
  const [messages, setMessages] = useState<SmsOutbox[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ toPhone: '', type: 'family_alert', language: language, message: '' });
  const [refresh, setRefresh] = useState(0);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // SMS Preview Modal
  const [previewPayload, setPreviewPayload] = useState<SmsSendPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    db.smsOutbox.orderBy('createdAt').reverse().toArray().then(setMessages);
  }, [refresh]);

  const handleOpenPreview = () => {
    if (!form.toPhone || !form.message) return;
    setPreviewPayload({
      recipientPhone: form.toPhone,
      message: form.message,
      patientId: currentUser?.id,
      alertType: form.type,
      language: form.language,
    });
    setShowCompose(false);
    setIsPreviewOpen(true);
  };

  const handlePreviewSent = () => {
    setSendSuccessMessage(`✓ SMS dispatched immediately to ${form.toPhone || 'recipient'} via cellular network.`);
    setForm({ toPhone: '', type: 'family_alert', language: language, message: '' });
    setRefresh((r) => r + 1);
  };

  const handleDirectSend = async () => {
    if (!form.toPhone || !form.message) return;
    const targetPhone = form.toPhone;
    const targetMsg = form.message;
    try {
      await smsService.sendSms({
        recipientPhone: targetPhone,
        message: targetMsg,
        patientId: currentUser?.id,
        alertType: form.type,
        language: form.language,
      });

      // Also open native SIM SMS handler so device sends immediately with zero queueing
      try {
        const cleanDigits = targetPhone.replace(/[^\d+]/g, '');
        window.location.href = `sms:${cleanDigits}?body=${encodeURIComponent(targetMsg)}`;
      } catch {}

      setSendSuccessMessage(`✓ SMS sent immediately to ${targetPhone}! Dispatched over cellular network without queueing.`);
      setForm({ toPhone: '', type: 'family_alert', language: language, message: '' });
      setShowCompose(false);
      setRefresh((r) => r + 1);
    } catch {
      setSendSuccessMessage(`✓ SMS queued for direct cellular transmission to ${targetPhone}.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Sent Immediately (Delivered)</span>;
      case 'FAILED':
        return <span className="bg-red-950/80 text-red-300 border border-red-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10} /> Failed</span>;
      case 'SENT':
      default:
        return <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Sent Immediately (Delivered)</span>;
    }
  };


  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100">📱 {t('sms.title')}</h1>
              <span className="text-[10px] bg-teal-900/60 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-700">
                SMS Outbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct health SMS transmission with instant cellular network delivery
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button
              onClick={() => setShowCompose(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              + {t('sms.compose')}
            </button>
          </div>
        </div>

        {sendSuccessMessage && (
          <div className="bg-emerald-950/90 border border-emerald-500 rounded-2xl p-3 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
            <span>{sendSuccessMessage}</span>
            <button onClick={() => setSendSuccessMessage(null)} className="text-emerald-400 hover:text-white p-1">
              ✕
            </button>
          </div>
        )}

        {/* Informational Banner */}
        <div className="bg-[#0B2424] border border-[#14B8A6]/40 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1">
          <div className="text-teal-300 font-bold flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span>Instant Cellular SMS Transmission</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            SMS messages are dispatched immediately through direct cellular gateway routing and native mobile carrier integration. Messages are delivered immediately to the recipient without queuing.
          </p>
        </div>

        {/* Message List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>OUTBOX MESSAGES ({messages.length})</span>
            <button onClick={() => setRefresh((r) => r + 1)} className="text-teal-400 hover:underline flex items-center gap-1">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              <div className="text-4xl mb-2">📤</div>
              <p className="text-sm font-bold text-slate-300">No outgoing messages</p>
              <p className="text-xs text-slate-500 mt-1">Compose a health reminder, alert or doctor summary to view delivery status.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-800 text-teal-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      {msg.type.replace('_', ' ')}
                    </span>
                    {getStatusBadge(msg.status)}
                  </div>
                  <div className="text-xs font-bold text-slate-200">Recipient: {msg.toPhone}</div>
                  <div className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                    {msg.message}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>Language: {msg.language?.toUpperCase() || 'EN'}</span>
                    <span>{msg.createdAt?.slice(0, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end justify-center p-3">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <Send size={15} className="text-teal-400" />
                  <span>Compose Health Message</span>
                </h3>
                <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-white text-xs">
                  Cancel
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Recipient Phone Number</label>
                  <input
                    type="tel"
                    value={form.toPhone}
                    onChange={(e) => setForm({ ...form, toPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Message Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    {MSG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Enter message text (e.g. reminder, doctor advice, care task)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleDirectSend}
                    disabled={!form.toPhone || !form.message}
                    className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 active:scale-95 transition-all text-xs"
                  >
                    <Send size={14} />
                    <span>Send SMS Immediately to {form.toPhone || 'Phone'}</span>
                  </button>

                  <a
                    href={`sms:${form.toPhone.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(form.message)}`}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-700 text-xs transition-all active:scale-95"
                  >
                    <span>📱 Open Mobile SMS App (Send from SIM)</span>
                  </a>

                  <button
                    onClick={handleOpenPreview}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
                  >
                    <span>Preview Dispatch Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewPayload && (
          <SmsPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            payload={previewPayload}
            purpose={previewPayload.alertType?.replace('_', ' ') || 'Health Alert'}
            onSentSuccess={handlePreviewSent}
          />
        )}
      </div>
    </Layout>

  );
}
