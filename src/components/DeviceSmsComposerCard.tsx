import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Eye,
  Copy,
  Check,
  Smartphone,
  AlertTriangle,
  Info,
  Archive,
  RefreshCw,
} from 'lucide-react';
import {
  openExternalSmsApp,
  buildSmsUri,
  SmsAppLaunchStatus,
  isIosDevice,
} from '../services/sms/smsAppLauncher';
import { normalizePhoneNumber } from '../services/calling/phoneNumberUtils';

interface DeviceSmsComposerCardProps {
  initialRecipient?: string;
  initialMessage?: string;
  recipientName?: string;
  onSmsRequested?: (phone: string, text: string) => void;
  compact?: boolean;
}

export const DeviceSmsComposerCard: React.FC<DeviceSmsComposerCardProps> = ({
  initialRecipient = '',
  initialMessage = '',
  recipientName,
  onSmsRequested,
  compact = false,
}) => {
  const [recipientPhone, setRecipientPhone] = useState(initialRecipient);
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState<SmsAppLaunchStatus>('DRAFT');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const isIos = isIosDevice();

  const handleOpenSmsApp = async () => {
    const cleanPhone = recipientPhone.trim();
    const cleanMsg = message.trim();

    if (!cleanPhone) {
      setStatus('FAILED_TO_OPEN');
      setStatusMessage('Please enter a recipient phone number.');
      return;
    }

    if (!cleanMsg) {
      setStatus('FAILED_TO_OPEN');
      setStatusMessage('Please enter message text before opening the SMS app.');
      return;
    }

    const norm = normalizePhoneNumber(cleanPhone);
    const targetPhone = norm.isValid ? norm.normalized : cleanPhone;

    setStatus('SMS_APP_OPEN_REQUESTED');
    const result = await openExternalSmsApp(targetPhone, cleanMsg);

    setStatus(result.status);
    setStatusMessage(result.message);

    if (onSmsRequested) {
      onSmsRequested(targetPhone, cleanMsg);
    }
  };

  const handleCopyMessage = () => {
    if (!message) return;
    navigator.clipboard?.writeText(message);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleCopyPhone = () => {
    if (!recipientPhone) return;
    navigator.clipboard?.writeText(recipientPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center text-lg font-bold">
            <MessageSquare className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {recipientName ? `Send SMS to ${recipientName}` : 'Send SMS via Phone App'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Prefills message in your device's external SMS app for review before sending
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            status === 'SMS_APP_OPEN_REQUESTED' || status === 'USER_MUST_SEND'
              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
              : status === 'FAILED_TO_OPEN'
              ? 'bg-red-100 text-red-900 border-red-300'
              : status === 'READY_TO_OPEN'
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {status === 'SMS_APP_OPEN_REQUESTED'
            ? 'SMS App Requested'
            : status === 'USER_MUST_SEND'
            ? 'User Must Send'
            : status === 'FAILED_TO_OPEN'
            ? 'Failed to Open'
            : status}
        </span>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Recipient phone number:
          </label>
          <input
            type="tel"
            value={recipientPhone}
            onChange={(e) => {
              setRecipientPhone(e.target.value);
              setStatus('DRAFT');
            }}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 min-h-[48px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Message:
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {message.length} characters (Unicode supported)
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setStatus('DRAFT');
            }}
            rows={3}
            placeholder="Type your message in Tamil, Telugu, Hindi, Malayalam, Kannada, or English..."
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 resize-none min-h-[80px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>{showPreview ? 'Hide Preview' : 'Preview SMS'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSmsApp}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[44px] shrink-0 active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open SMS App</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-2xl text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[44px]"
            title="Copy Message Text"
          >
            {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMsg ? 'Message Copied' : 'Copy Message'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPhone}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-2xl text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[44px]"
            title="Copy Recipient Number"
          >
            {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPhone ? 'Phone Copied' : 'Copy Phone'}</span>
          </button>
        </div>
      </div>

      {/* SMS Preview Card */}
      {showPreview && (
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-slate-700 text-[11px] border-b border-slate-200 pb-1.5">
            <span>SMS Preview (Ready for external app)</span>
            <span className="font-mono text-indigo-700">Scheme: {isIos ? 'iOS sms:&body=' : 'Android/RFC 5724 sms:?body='}</span>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">To: <span className="font-mono font-bold text-slate-900">{recipientPhone || 'Not entered'}</span></div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-sans leading-relaxed whitespace-pre-wrap text-slate-800">
              {message || '(Empty message)'}
            </div>
          </div>
        </div>
      )}

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-2xl border text-xs space-y-1.5 animate-in fade-in ${
            status === 'SMS_APP_OPEN_REQUESTED' || status === 'USER_MUST_SEND'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : status === 'FAILED_TO_OPEN'
              ? 'bg-red-50 border-red-300 text-red-950'
              : 'bg-indigo-50 border-indigo-300 text-indigo-950'
          }`}
        >
          <div className="flex items-start gap-2">
            {status === 'FAILED_TO_OPEN' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold">{statusMessage}</div>
              <div className="text-[11px] text-slate-600">
                Draft preserved in local SMS Outbox. You must press Send in your device's SMS app.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Advice */}
      <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
        <Archive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Medora never transmits private medical data without your review. You remain in complete control before pressing Send.
        </span>
      </div>
    </div>
  );
};
