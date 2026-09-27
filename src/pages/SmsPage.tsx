import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { SmsOutbox } from '../db/db';
import Layout from '../components/Layout';
import { twilioSmsService, TwilioSmsResult } from '../services/sms/twilioSmsService';
import { smsTemplateService, RecurringSmsTemplate } from '../services/sms/smsTemplateService';
import { SmsDeliveryStatusChart } from '../components/SmsDeliveryStatusChart';
import { SmsTemplateManagerModal } from '../components/SmsTemplateManagerModal';
import { SmsPreviewModal } from '../components/SmsPreviewModal';
import { DeviceSmsComposerCard } from '../components/DeviceSmsComposerCard';
import { SmsSendPayload, SmsResponseData } from '../services/sms/smsStatus';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  FlaskConical,
  Archive,
  Eye,
  Trash2,
  Copy,
  Check,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BarChart3,
  Plus,
} from 'lucide-react';

const MSG_TYPES = [
  { id: 'family_alert', label: 'Family Medical Alert' },
  { id: 'emergency_alert', label: 'Emergency Alert (108 / Urgent)' },
  { id: 'doctor_summary', label: 'Doctor Clinical Handoff' },
  { id: 'appointment', label: 'Clinic Appointment Reminder' },
  { id: 'medicine_reminder', label: 'Medication Adherence' },
  { id: 'vaccination', label: 'Child / Maternal Vaccination' },
  { id: 'maternal', label: 'Maternal ANC Care (102)' },
  { id: 'hospital_info', label: 'Hospital Transit / Info' },
];

const QUICK_CONTACTS = [
  { label: 'Emergency (108)', phone: '+919876510800', note: 'Ambulance & Urgent Response' },
  { label: 'Maternal (102)', phone: '+919876510200', note: 'Free Transport for Pregnancy & Infants' },
  { label: 'Health Helpline (104)', phone: '+919876510400', note: 'Medical Advice Hotline' },
  { label: 'Sample Indian Mobile', phone: '+919876543210', note: 'Standard E.164 Cellular Test' },
];

export default function SmsPage() {
  const { t } = useTranslation();
  const { language, currentUser } = useAppStore();
  const [messages, setMessages] = useState<SmsOutbox[]>([]);
  const [templates, setTemplates] = useState<RecurringSmsTemplate[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPollingId, setIsPollingId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  // Direct Twilio SMS Form
  const [form, setForm] = useState({
    toPhone: currentUser?.phone || '',
    type: 'family_alert',
    language: language || 'en',
    message: '',
  });

  // Provider configuration state
  const [isProviderConfigured, setIsProviderConfigured] = useState(false);
  const [providerName, setProviderName] = useState('Twilio');
  const [fromNumber, setFromNumber] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string>('MEDORA');
  const [checkingConfig, setCheckingConfig] = useState(true);

  // SMS Demo / Test Mode state
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Show native device app launcher fallback
  const [showNativeAppLauncher, setShowNativeAppLauncher] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'demo' | 'outbox' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  // Active filter tab: 'all' | 'submitted' | 'outbox' | 'demo'
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'outbox' | 'demo'>('all');

  // Preview Modal
  const [previewPayload, setPreviewPayload] = useState<SmsSendPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check backend Twilio provider status on mount
  useEffect(() => {
    twilioSmsService
      .checkConfig()
      .then((cfg) => {
        setIsProviderConfigured(cfg.configured);
        setProviderName(cfg.provider || 'Twilio');
        setFromNumber(cfg.fromNumber || null);
        setSenderId(cfg.senderId || 'MEDORA');
        if (cfg.configured) {
          setIsDemoMode(false);
        } else {
          setIsDemoMode(false);
        }
      })
      .catch(() => {
        setIsProviderConfigured(false);
        setProviderName('Twilio');
      })
      .finally(() => {
        setCheckingConfig(false);
      });
  }, []);

  // Load recurring templates
  useEffect(() => {
    setTemplates(smsTemplateService.getTemplates());
  }, [isTemplateModalOpen]);

  // Load and synchronize SMS records from local persistence mechanism (db.smsOutbox)
  useEffect(() => {
    twilioSmsService.getHistory().then((items) => {
      setMessages(items);
    });
  }, [refresh]);

  // Handle direct SMS submission via Twilio API
  const handleSendTwilioSms = async () => {
    const rawPhone = form.toPhone.trim();
    const rawMsg = form.message.trim();

    if (!rawPhone || !rawMsg) {
      setFeedback({
        type: 'error',
        text: 'Please provide both recipient phone number and message content.',
      });
      return;
    }

    const norm = twilioSmsService.normalizePhone(rawPhone);
    if (!norm.isValid) {
      setFeedback({
        type: 'error',
        text: `Invalid phone format: "${rawPhone}". Please provide a 10-digit Indian number or international E.164 number.`,
      });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      const res: TwilioSmsResult = await twilioSmsService.sendSms({
        to: norm.normalized,
        message: rawMsg,
        alertType: form.type,
        language: form.language,
        patientId: currentUser?.id,
        isDemoMode: isDemoMode,
        senderId: senderId,
      });

      if (res.status === 'DEMO_ONLY') {
        setFeedback({
          type: 'demo',
          text: 'SMS Demo Mode: Verified preview generated.',
          details: 'Status: DEMO ONLY — NOT SENT TO PHONE. Record stored in local history.',
        });
      } else if (res.status === 'SUBMITTED' || res.status === 'DELIVERED') {
        setFeedback({
          type: 'success',
          text: `✅ SMS dispatched to ${norm.formatted} via Twilio API!`,
          details: res.providerMessageId
            ? `Twilio Message SID: ${res.providerMessageId} • Status: ${res.status}`
            : `Status: ${res.status}`,
        });
      } else if (res.status === 'OFFLINE_OUTBOX' || !res.configured) {
        setFeedback({
          type: 'outbox',
          text: `📦 SMS saved to local Outbox for ${norm.formatted}.`,
          details:
            'Twilio credentials in .env are awaiting live network dispatch. Record safely stored in local IndexedDB storage.',
        });
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to dispatch SMS via Twilio.',
          details: res.info,
        });
      }

      setForm((prev) => ({ ...prev, message: '' }));
      setRefresh((r) => r + 1);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: 'Unexpected error sending SMS message.',
        details: err?.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Poll live status from Twilio
  const handlePollStatus = async (messageId: string) => {
    setIsPollingId(messageId);
    try {
      const updated = await twilioSmsService.pollStatus(messageId);
      if (updated) {
        setFeedback({
          type: updated.status === 'failed' ? 'error' : 'success',
          text: `Status updated for ${updated.recipientPhone}: ${updated.status}`,
          details: updated.providerMessageId ? `Twilio SID: ${updated.providerMessageId}` : undefined,
        });
        setRefresh((r) => r + 1);
      }
    } catch {
      // Ignore
    } finally {
      setIsPollingId(null);
    }
  };

  // Resend an SMS message
  const handleResend = async (record: SmsOutbox) => {
    setIsSending(true);
    try {
      const res = await twilioSmsService.resend(record);
      setFeedback({
        type: res.status === 'SUBMITTED' || res.status === 'DELIVERED' ? 'success' : 'outbox',
        text: `Resend processed for ${record.toPhone}. Status: ${res.status}`,
        details: res.providerMessageId ? `Twilio SID: ${res.providerMessageId}` : undefined,
      });
      setRefresh((r) => r + 1);
    } catch (e: any) {
      setFeedback({
        type: 'error',
        text: 'Failed to resend SMS.',
        details: e?.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Delete record from storage
  const handleDeleteRecord = async (id: number) => {
    if (!id) return;
    await twilioSmsService.deleteRecord(id);
    setRefresh((r) => r + 1);
  };

  // Clear all history
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all sent SMS history from local storage?')) {
      await twilioSmsService.clearHistory();
      setRefresh((r) => r + 1);
    }
  };

  // Select a template from the quick bar or template manager modal
  const handleApplyTemplate = (tmpl: RecurringSmsTemplate, populatedText?: string) => {
    const filled =
      populatedText ||
      smsTemplateService.fillPlaceholders(tmpl.templateText, {
        patientName: currentUser?.name || 'Patient',
        village: currentUser?.village || 'Rampur',
      });

    setForm((prev) => ({
      ...prev,
      type: tmpl.category.toLowerCase(),
      message: filled,
    }));
  };

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
    setIsPreviewOpen(true);
  };

  const handlePreviewDone = (res: SmsResponseData) => {
    if (res.status === 'DEMO_ONLY') {
      setFeedback({
        type: 'demo',
        text: 'SMS Demo Mode: Saved for preview. Status: DEMO ONLY — NOT SENT TO PHONE.',
      });
    } else if (res.status === 'SUBMITTED' || res.status === 'DELIVERED') {
      setFeedback({
        type: 'success',
        text: 'SMS submitted successfully to cellular carrier network.',
        details: res.providerMessageId ? `Twilio SID: ${res.providerMessageId}` : undefined,
      });
    } else {
      setFeedback({
        type: 'outbox',
        text: 'Message saved to local SMS Outbox for later cellular sending.',
      });
    }

    setForm((prev) => ({ ...prev, message: '' }));
    setRefresh((r) => r + 1);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> DELIVERED
          </span>
        );
      case 'SUBMITTED':
      case 'SENT':
        return (
          <span className="bg-teal-950/80 text-teal-300 border border-teal-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> SUBMITTED TO TWILIO
          </span>
        );
      case 'DEMO_ONLY':
        return (
          <span className="bg-amber-950/80 text-amber-300 border border-amber-600/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <FlaskConical size={10} /> DEMO ONLY
          </span>
        );
      case 'FAILED':
        return (
          <span className="bg-red-950/80 text-red-300 border border-red-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={10} /> FAILED
          </span>
        );
      case 'OFFLINE_OUTBOX':
      case 'PENDING_OFFLINE':
      case 'PENDING':
      default:
        return (
          <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Archive size={10} /> OFFLINE OUTBOX
          </span>
        );
    }
  };

  const filteredMessages = messages.filter((m) => {
    const s = (m.status || '').toUpperCase();
    if (activeTab === 'submitted') {
      return s === 'SUBMITTED' || s === 'DELIVERED' || s === 'SENT';
    }
    if (activeTab === 'outbox') {
      return s === 'OFFLINE_OUTBOX' || s === 'PENDING_OFFLINE' || s === 'PENDING' || s === 'FAILED';
    }
    if (activeTab === 'demo') {
      return s === 'DEMO_ONLY';
    }
    return true;
  });

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header & Provider Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <span>📱 {t('sms.title')}</span>
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  checkingConfig
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : isProviderConfigured
                    ? 'bg-teal-900/60 text-teal-300 border-teal-700'
                    : 'bg-amber-900/60 text-amber-300 border-amber-700'
                }`}
              >
                {checkingConfig
                  ? 'Connecting Twilio...'
                  : isProviderConfigured
                  ? 'Twilio API Connected'
                  : 'Twilio API Ready (.env)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct cellular SMS dispatch powered by {providerName} API{' '}
              {fromNumber && <span className="text-teal-400 font-mono">({fromNumber})</span>}{' '}
              with local state persistence and outbox tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Toggle between live cellular dispatch and Demo Mode preview"
            >
              <FlaskConical size={13} />
              <span>{isDemoMode ? 'Demo Mode: ON' : 'Live SMS Mode'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-2xl p-3.5 text-xs flex items-start justify-between shadow-lg border animate-in fade-in duration-200 ${
              feedback.type === 'demo'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : feedback.type === 'outbox'
                ? 'bg-blue-950/90 border-blue-500 text-blue-200'
                : feedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-red-950/90 border-red-500 text-red-200'
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                {feedback.type === 'success' && <CheckCircle2 size={14} className="text-emerald-400" />}
                {feedback.type === 'error' && <AlertCircle size={14} className="text-red-400" />}
                {feedback.type === 'demo' && <FlaskConical size={14} className="text-amber-400" />}
                {feedback.type === 'outbox' && <Archive size={14} className="text-blue-400" />}
                <span>{feedback.text}</span>
              </div>
              {feedback.details && <p className="text-[11px] opacity-90 pl-5">{feedback.details}</p>}
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:opacity-75 text-slate-300 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Twilio SMS Direct Composer (Primary Action - In Website) */}
        <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                <Send size={15} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-100">Send Actual SMS (Twilio Service)</h2>
                <p className="text-[11px] text-slate-400">
                  Transmits SMS directly to the recipient phone within the website using Twilio API credentials.
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] bg-slate-800 text-teal-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                Sender ID: {senderId}
              </span>
            </div>
          </div>

          {/* Quick Recipient Selectors */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              Quick Recipient Selector / Emergency Contacts:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CONTACTS.map((qc) => (
                <button
                  key={qc.phone}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, toPhone: qc.phone }))}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all border cursor-pointer ${
                    form.toPhone === qc.phone
                      ? 'bg-teal-600 text-white border-teal-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={qc.note}
                >
                  {qc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Recipient Phone Number <span className="text-teal-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={form.toPhone}
                onChange={(e) => setForm({ ...form, toPhone: e.target.value })}
                placeholder="+91 98765 43210 (10-digit Indian or international E.164)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
              {form.toPhone && (
                <div className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400">
                  {twilioSmsService.normalizePhone(form.toPhone).isValid ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check size={11} /> Valid E.164
                    </span>
                  ) : (
                    <span className="text-amber-400">Standardizing format</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Alert Category</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
            >
              {MSG_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring SMS Templates Quick Selector & Manager */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Bookmark size={13} className="text-teal-400" />
                <span>Recurring Healthcare SMS Templates:</span>
              </label>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700 transition-all"
              >
                <Plus size={11} />
                <span>Manage / Create Templates</span>
              </button>
            </div>

            {/* Quick Template Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {templates.slice(0, 8).map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-teal-500/60 text-[10px] p-2 rounded-xl text-slate-300 text-left font-medium cursor-pointer transition-all flex flex-col justify-between gap-1 group active:scale-95"
                  title={`${tmpl.name} (${tmpl.recurrence}): ${tmpl.templateText}`}
                >
                  <div className="font-bold text-slate-200 group-hover:text-teal-300 truncate flex items-center gap-1">
                    <span>⚡</span>
                    <span className="truncate">{tmpl.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span className="capitalize">{tmpl.recurrence.replace('_', ' ')}</span>
                    {tmpl.isCustom && <span className="text-teal-400 font-bold">Custom</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Content Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Message Content <span className="text-teal-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.message.length} chars (
                {Math.ceil((form.message.length || 1) / 160)} SMS segment)
              </span>
            </div>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Enter health alert, prescription details, emergency guidance or care notice..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Send and Preview Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleSendTwilioSms}
              disabled={isSending || !form.toPhone.trim() || !form.message.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 active:scale-95 transition-all text-xs cursor-pointer"
            >
              {isSending ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Transmitting via Twilio API...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>
                    {isDemoMode
                      ? 'Save Verified Demo SMS'
                      : 'Send Actual SMS via Twilio API'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={!form.toPhone.trim() || !form.message.trim()}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-300 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
              title="Preview simulated carrier dispatch envelope"
            >
              <Eye size={13} />
              <span>Preview Dispatch</span>
            </button>
          </div>
        </div>

        {/* Secondary Collapsible: Native Device Messaging App (sms: scheme) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 shadow-xs">
          <button
            type="button"
            onClick={() => setShowNativeAppLauncher(!showNativeAppLauncher)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-indigo-400" />
              <span>Alternative Option: Open Phone's Native Messaging App (sms: link)</span>
            </div>
            {showNativeAppLauncher ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showNativeAppLauncher && (
            <div className="pt-3 border-t border-slate-800 mt-2">
              <DeviceSmsComposerCard
                initialRecipient={form.toPhone}
                initialMessage={form.message}
                onSmsRequested={() => setRefresh((r) => r + 1)}
                compact
              />
            </div>
          )}
        </div>

        {/* Recharts SMS Delivery Status Distribution Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="text-xs font-bold text-slate-300 hover:text-teal-300 flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart3 size={14} className="text-teal-400" />
              <span>Message Delivery Analytics &amp; Trends</span>
              {showChart ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {showChart && <SmsDeliveryStatusChart messages={messages} />}
        </div>

        {/* Sent SMS History Tracking & Local State Persistence Section */}
        <div className="space-y-3 pt-2">
          {/* Section Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-200 flex items-center gap-2">
                <span>Sent SMS History &amp; Delivery Tracking</span>
                <span className="text-[10px] bg-slate-800 text-teal-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {messages.length} Records Persisted
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Tracked locally in IndexedDB storage (<code className="text-teal-400">db.smsOutbox</code>) with offline resilience.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefresh((r) => r + 1)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Refresh SMS records"
              >
                <RefreshCw size={11} /> Refresh
              </button>

              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="bg-slate-800/80 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Clear history from local storage"
                >
                  <Trash2 size={11} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold text-slate-400">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-slate-800 text-teal-300 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'submitted' ? 'bg-slate-800 text-emerald-300 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              Delivered / Sent ({messages.filter((m) => ['SUBMITTED', 'DELIVERED', 'SENT'].includes(m.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'outbox' ? 'bg-slate-800 text-blue-300 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              SMS Outbox ({messages.filter((m) => ['OFFLINE_OUTBOX', 'PENDING_OFFLINE', 'PENDING', 'failed'].includes(m.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'demo' ? 'bg-slate-800 text-amber-300 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              Demo Mode ({messages.filter((m) => m.status === 'DEMO_ONLY').length})
            </button>
          </div>

          {/* List of Sent SMS Records */}
          {filteredMessages.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No SMS Messages in this category</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the composer above to send an actual SMS to any mobile number via Twilio API. It will appear here with full delivery tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMessages.map((msg, idx) => {
                const norm = twilioSmsService.normalizePhone(msg.toPhone);
                const isPolling = isPollingId === msg.messageId;

                return (
                  <div
                    key={msg.id ?? msg.messageId ?? idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-2.5 transition-all"
                  >
                    {/* Top Row: Type, Status, & Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-800 text-teal-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          {(msg.type || 'HEALTH_ALERT').replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.provider || 'Twilio'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(msg.status)}
                      </div>
                    </div>

                    {/* Recipient & Twilio SID */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                        <span>To: {norm.formatted || msg.toPhone}</span>
                        <button
                          onClick={() => copyText(msg.toPhone, `phone-${msg.id}`)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedId === `phone-${msg.id}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>

                      {msg.providerMessageId && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1">
                          <span>Twilio SID: {msg.providerMessageId}</span>
                          <button
                            onClick={() => copyText(msg.providerMessageId!, `sid-${msg.id}`)}
                            className="text-slate-500 hover:text-slate-300 cursor-pointer"
                            title="Copy SID"
                          >
                            {copiedId === `sid-${msg.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="text-xs text-slate-200 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 font-sans leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    {/* Info / Error Banner if present */}
                    {msg.info && (
                      <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 rounded-lg px-2.5 py-1">
                        ℹ️ {msg.info}
                      </div>
                    )}
                    {msg.error && (
                      <div className="text-[11px] text-red-300/90 bg-red-950/30 border border-red-800/40 rounded-lg px-2.5 py-1">
                        ⚠️ {msg.error}
                      </div>
                    )}

                    {/* Bottom Row: Timestamp, Language, & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Just now'}</span>
                        <span>•</span>
                        <span>Lang: {msg.language?.toUpperCase() || 'EN'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Check status button if message has ID */}
                        {msg.messageId && msg.status !== 'DEMO_ONLY' && (
                          <button
                            type="button"
                            onClick={() => handlePollStatus(msg.messageId!)}
                            disabled={isPolling}
                            className="bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                            title="Poll live delivery confirmation from Twilio"
                          >
                            <RotateCw size={10} className={isPolling ? 'animate-spin' : ''} />
                            <span>Check Status</span>
                          </button>
                        )}

                        {/* Resend button */}
                        <button
                          type="button"
                          onClick={() => handleResend(msg)}
                          disabled={isSending}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                          title="Resend this message via Twilio API"
                        >
                          <Send size={10} />
                          <span>Resend</span>
                        </button>

                        {/* Delete button */}
                        {msg.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(msg.id!)}
                            className="bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-[10px] font-bold p-1 rounded-lg border border-slate-700 cursor-pointer transition-all"
                            title="Remove from history"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recurring SMS Template Manager Modal */}
        <SmsTemplateManagerModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={(tmpl, populated) => handleApplyTemplate(tmpl, populated)}
          currentUserContext={{
            patientName: currentUser?.name || 'Patient',
            village: currentUser?.village || 'Rampur',
          }}
        />

        {/* Exact Carrier Dispatch Preview Modal */}
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
