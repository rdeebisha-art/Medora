import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, SmsOutbox } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { smsService } from '../services/sms/smsService';
import { SmsPreviewModal } from '../components/SmsPreviewModal';
import { SmsSendPayload, SmsResponseData } from '../services/sms/smsStatus';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  FlaskConical,
  Radio,
  Archive,
  Eye,
  ShieldAlert,
} from 'lucide-react';

const MSG_TYPES = [
  'doctor_summary',
  'emergency_alert',
  'appointment',
  'medicine_reminder',
  'vaccination',
  'family_alert',
  'hospital_info',
];

export default function SmsPage() {
  const { t } = useTranslation();
  const { language, currentUser } = useAppStore();
  const [messages, setMessages] = useState<SmsOutbox[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({
    toPhone: '',
    type: 'family_alert',
    language: language || 'en',
    message: '',
  });
  const [refresh, setRefresh] = useState(0);

  // Provider configuration state
  const [isProviderConfigured, setIsProviderConfigured] = useState(false);
  const [providerName, setProviderName] = useState('None');
  const [checkingConfig, setCheckingConfig] = useState(true);

  // SMS Demo / Test Mode state
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'demo' | 'outbox' | 'error';
    text: string;
  } | null>(null);

  // Active filter tab: 'all' | 'outbox' | 'demo' | 'submitted'
  const [activeTab, setActiveTab] = useState<'all' | 'outbox' | 'demo' | 'submitted'>('all');

  // Preview Modal
  const [previewPayload, setPreviewPayload] = useState<SmsSendPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Check backend provider status on mount
  useEffect(() => {
    fetch('/api/sms/config')
      .then((res) => res.json())
      .then((data) => {
        setIsProviderConfigured(Boolean(data.configured));
        setProviderName(data.provider || 'None');
        // If real provider is configured, default demo mode to false
        if (data.configured) {
          setIsDemoMode(false);
        }
      })
      .catch(() => {
        setIsProviderConfigured(false);
        setProviderName('None');
      })
      .finally(() => {
        setCheckingConfig(false);
      });
  }, []);

  // Load SMS records from local DB
  useEffect(() => {
    db.smsOutbox
      .orderBy('createdAt')
      .reverse()
      .toArray()
      .then((items) => {
        setMessages(items);
      });
  }, [refresh]);

  const handleOpenPreview = () => {
    if (!form.toPhone.trim() || !form.message.trim()) return;
    setPreviewPayload({
      recipientPhone: form.toPhone.trim(),
      message: form.message.trim(),
      patientId: currentUser?.id,
      alertType: form.type,
      language: form.language,
      isDemoMode: isDemoMode,
    });
    setShowCompose(false);
    setIsPreviewOpen(true);
  };

  const handlePreviewDone = (res: SmsResponseData) => {
    if (res.status === 'DEMO_ONLY') {
      setFeedback({
        type: 'demo',
        text: 'SMS Demo / Test Mode: Saved for preview. Status: DEMO ONLY — NOT SENT TO PHONE.',
      });
    } else if (res.status === 'SUBMITTED' || res.status === 'DELIVERED') {
      setFeedback({
        type: 'success',
        text: 'SMS submitted successfully to cellular carrier network.',
      });
    } else if (res.status === 'OFFLINE_OUTBOX' || !res.configured) {
      setFeedback({
        type: 'outbox',
        text: 'Real SMS sending is not configured. Saved to SMS Outbox for later sending.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'SMS transmission failed.',
      });
    }

    setForm({ toPhone: '', type: 'family_alert', language: language || 'en', message: '' });
    setRefresh((r) => r + 1);
  };

  const handleSendAction = async () => {
    if (!form.toPhone.trim() || !form.message.trim()) return;
    const targetPhone = form.toPhone.trim();
    const targetMsg = form.message.trim();

    try {
      const response = await smsService.sendSms({
        recipientPhone: targetPhone,
        message: targetMsg,
        patientId: currentUser?.id,
        alertType: form.type,
        language: form.language,
        isDemoMode: isDemoMode,
      });

      if (response.status === 'DEMO_ONLY') {
        setFeedback({
          type: 'demo',
          text: `SMS Demo / Test Mode: Verified for ${targetPhone}. Status: DEMO ONLY — NOT SENT TO PHONE.`,
        });
      } else if (response.status === 'SUBMITTED') {
        setFeedback({
          type: 'success',
          text: `SMS submitted successfully for ${targetPhone}.`,
        });
      } else if (response.status === 'DELIVERED') {
        setFeedback({
          type: 'success',
          text: `SMS Delivered to ${targetPhone}.`,
        });
      } else if (response.status === 'OFFLINE_OUTBOX' || !response.configured) {
        setFeedback({
          type: 'outbox',
          text: 'Real SMS sending is not configured. Saved to SMS Outbox for later sending.',
        });
      } else {
        setFeedback({
          type: 'error',
          text: response.error || 'Failed to submit SMS.',
        });
      }

      setForm({ toPhone: '', type: 'family_alert', language: language || 'en', message: '' });
      setShowCompose(false);
      setRefresh((r) => r + 1);
    } catch {
      setFeedback({
        type: 'outbox',
        text: 'Saved to SMS Outbox for later sending (Network offline).',
      });
      setShowCompose(false);
      setRefresh((r) => r + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DEMO_ONLY':
        return (
          <span className="bg-amber-950/80 text-amber-300 border border-amber-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <FlaskConical size={10} /> DEMO ONLY — NOT SENT TO PHONE
          </span>
        );
      case 'OFFLINE_OUTBOX':
      case 'PENDING_OFFLINE':
      case 'PENDING':
        return (
          <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Archive size={10} /> OFFLINE OUTBOX
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="bg-teal-950/80 text-teal-300 border border-teal-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> SUBMITTED TO PROVIDER
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> DELIVERED
          </span>
        );
      case 'FAILED':
        return (
          <span className="bg-red-950/80 text-red-300 border border-red-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={10} /> FAILED
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {s || 'QUEUED'}
          </span>
        );
    }
  };

  const filteredMessages = messages.filter((m) => {
    const s = (m.status || '').toUpperCase();
    if (activeTab === 'outbox') {
      return s === 'OFFLINE_OUTBOX' || s === 'PENDING_OFFLINE' || s === 'PENDING';
    }
    if (activeTab === 'demo') {
      return s === 'DEMO_ONLY';
    }
    if (activeTab === 'submitted') {
      return s === 'SUBMITTED' || s === 'DELIVERED';
    }
    return true;
  });

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100">📱 {t('sms.title')}</h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isProviderConfigured
                    ? 'bg-teal-900/60 text-teal-300 border-teal-700'
                    : 'bg-amber-900/60 text-amber-300 border-amber-700'
                }`}
              >
                {isProviderConfigured ? `Real SMS Provider (${providerName})` : 'Prototype Mode (No Provider)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isProviderConfigured
                ? 'Real SMS dispatch enabled with live cellular gateway integration.'
                : 'Real SMS provider is not configured. Messages are stored locally in the SMS Outbox or tested via Demo Mode.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              + {t('sms.compose')}
            </button>
          </div>
        </div>

        {/* Demo / Test Mode Toggle Card (Requirement 4) */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDemoMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <FlaskConical size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <span>SMS Demo / Test Mode</span>
                {isDemoMode && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isDemoMode
                  ? 'Displays preview without cellular dispatch. Messages are stamped as DEMO ONLY — NOT SENT TO PHONE.'
                  : isProviderConfigured
                  ? 'Messages will be dispatched through the live SMS provider.'
                  : 'Real SMS provider is not configured. Messages will be stored in SMS Outbox.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isDemoMode
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
            }`}
          >
            {isDemoMode ? 'Demo Mode: ON' : 'Demo Mode: OFF'}
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-2xl p-3 text-xs flex items-center justify-between shadow-lg border ${
              feedback.type === 'demo'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : feedback.type === 'outbox'
                ? 'bg-blue-950/90 border-blue-500 text-blue-200'
                : feedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-red-950/90 border-red-500 text-red-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {/* Informational Status Banner */}
        {!isProviderConfigured && (
          <div className="bg-[#0B2424] border border-[#14B8A6]/40 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1">
            <div className="text-teal-300 font-bold flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span>Offline SMS Outbox &amp; Safety Notice</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Real SMS sending is not configured in this prototype environment. When messages are submitted, they are safely stored in your local <strong>SMS Outbox</strong> for later sending. Delivery is never falsely claimed.
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-slate-800 text-teal-300 shadow-xs' : 'hover:text-slate-200'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('outbox')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'outbox' ? 'bg-slate-800 text-blue-300 shadow-xs' : 'hover:text-slate-200'
            }`}
          >
            SMS Outbox ({messages.filter((m) => ['OFFLINE_OUTBOX', 'PENDING_OFFLINE', 'PENDING'].includes(m.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-slate-800 text-amber-300 shadow-xs' : 'hover:text-slate-200'
            }`}
          >
            Demo / Tests ({messages.filter((m) => m.status === 'DEMO_ONLY').length})
          </button>
          {isProviderConfigured && (
            <button
              onClick={() => setActiveTab('submitted')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'submitted' ? 'bg-slate-800 text-emerald-300 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              Submitted ({messages.filter((m) => ['SUBMITTED', 'DELIVERED'].includes(m.status)).length})
            </button>
          )}
        </div>

        {/* Message List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>
              {activeTab === 'outbox'
                ? 'OFFLINE SMS OUTBOX'
                : activeTab === 'demo'
                ? 'DEMO / TEST RECORDS'
                : activeTab === 'submitted'
                ? 'PROVIDER SUBMISSIONS'
                : 'ALL SMS RECORDS'}{' '}
              ({filteredMessages.length})
            </span>
            <button onClick={() => setRefresh((r) => r + 1)} className="text-teal-400 hover:underline flex items-center gap-1">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              <div className="text-4xl mb-2">📤</div>
              <p className="text-sm font-bold text-slate-300">No messages in this view</p>
              <p className="text-xs text-slate-500 mt-1">
                Compose an SMS or switch tabs to view saved outbox items and demo messages.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] bg-slate-800 text-teal-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      {msg.type.replace('_', ' ')}
                    </span>
                    {getStatusBadge(msg.status)}
                  </div>
                  <div className="text-xs font-bold text-slate-200">Recipient: {msg.toPhone}</div>
                  <div className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                    {msg.message}
                  </div>
                  {msg.info && (
                    <div className="text-[11px] text-amber-400/90 italic pl-1">
                      ℹ️ {msg.info}
                    </div>
                  )}
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3">
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

              {/* Mode indicator in Compose */}
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isDemoMode
                    ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                    : isProviderConfigured
                    ? 'bg-teal-950/60 border-teal-700/60 text-teal-300'
                    : 'bg-blue-950/60 border-blue-700/60 text-blue-300'
                }`}
              >
                {isDemoMode ? (
                  <>
                    <FlaskConical size={14} className="shrink-0" />
                    <span>Demo Mode Active: Preview will display &quot;DEMO ONLY — NOT SENT TO PHONE&quot;.</span>
                  </>
                ) : isProviderConfigured ? (
                  <>
                    <Radio size={14} className="shrink-0" />
                    <span>Real SMS Provider ({providerName}) configured for live submission.</span>
                  </>
                ) : (
                  <>
                    <Archive size={14} className="shrink-0" />
                    <span>No provider configured. Message will save to SMS Outbox for later sending.</span>
                  </>
                )}
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
                    onClick={handleSendAction}
                    disabled={!form.toPhone.trim() || !form.message.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 active:scale-95 transition-all text-xs cursor-pointer"
                  >
                    <Send size={14} />
                    <span>
                      {isDemoMode
                        ? 'Simulate in Demo Mode'
                        : isProviderConfigured
                        ? 'Submit to Real Provider'
                        : 'Save to SMS Outbox'}
                    </span>
                  </button>

                  <button
                    onClick={handleOpenPreview}
                    disabled={!form.toPhone.trim() || !form.message.trim()}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Preview SMS Exact Dispatch</span>
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
            onSentSuccess={handlePreviewDone}
          />
        )}
      </div>
    </Layout>
  );
}
