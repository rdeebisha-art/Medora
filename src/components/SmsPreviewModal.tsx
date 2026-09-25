import React, { useState } from 'react';
import { Send, X, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { smsService } from '../services/sms/smsService';
import { SmsSendPayload, SmsResponseData } from '../services/sms/smsStatus';

interface SmsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SmsSendPayload;
  recipientName?: string;
  purpose?: string;
  onSentSuccess?: (res: SmsResponseData) => void;
}

export const SmsPreviewModal: React.FC<SmsPreviewModalProps> = ({
  isOpen,
  onClose,
  payload,
  recipientName = 'Patient / Family',
  purpose = 'Medical notification',
  onSentSuccess,
}) => {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SmsResponseData | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await smsService.sendSms(payload);
      setResult(res);
      if (res.status === 'SENT' || res.status === 'DELIVERED') {
        if (onSentSuccess) onSentSuccess(res);
      }
    } catch (e: any) {
      setResult({
        messageId: `ERR-${Date.now()}`,
        status: 'FAILED',
        recipientPhone: payload.recipientPhone,
        messageText: payload.message,
        error: e?.message || 'Network error sending SMS.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Send className="w-5 h-5" />
            <h3 className="font-black text-slate-900 text-base">SMS Dispatch Preview</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details preview */}
        <div className="space-y-2.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Recipient:</span>
              <span className="text-slate-900 font-bold">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Phone Number:</span>
              <span className="text-slate-900 font-mono font-bold">{payload.recipientPhone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Purpose:</span>
              <span className="text-slate-900 font-medium">{purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Language:</span>
              <span className="text-indigo-700 uppercase font-bold">{payload.language || 'en'}</span>
            </div>
            {payload.senderId && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Sender ID:</span>
                <span className="text-slate-800 font-mono">{payload.senderId}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-semibold block mb-1">Message Content:</label>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 text-slate-800 font-sans leading-relaxed whitespace-pre-wrap text-xs shadow-inner">
              {payload.message}
            </div>
          </div>
        </div>

        {/* Live response / Status feedback */}
        {result && (
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              result.status === 'SENT' || result.status === 'DELIVERED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : result.status === 'NOT_CONFIGURED'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : result.status === 'PENDING_SYNC'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {result.status === 'SENT' || result.status === 'DELIVERED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SMS Dispatched Successfully (Twilio SID: {result.providerMessageId})</span>
                </>
              ) : result.status === 'NOT_CONFIGURED' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Real SMS Gateway Not Configured</span>
                </>
              ) : result.status === 'PENDING_SYNC' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Offline — Saved to Local Outbox Queue</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>SMS Dispatch Failed</span>
                </>
              )}
            </div>
            {result.error && <p className="text-[11px] leading-relaxed opacity-90">{result.error}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Contacting Gateway...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Send SMS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
