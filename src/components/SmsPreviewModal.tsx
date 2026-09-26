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
            className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
              result.status === 'DEMO_ONLY'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : result.status === 'SUBMITTED' || result.status === 'DELIVERED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : result.status === 'FAILED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            {result.status === 'DEMO_ONLY' ? (
              <>
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>DEMO ONLY — NOT SENT TO PHONE</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-0.5 pl-5">
                  <div>To: <span className="font-mono font-bold">{payload.recipientPhone}</span></div>
                  <div>Status: <span className="font-bold">DEMO ONLY — NOT SENT TO PHONE</span></div>
                  <div>Message ID: <span className="font-mono">{result.messageId}</span></div>
                  <div className="mt-1 text-slate-600 italic">
                    This was rendered in SMS Demo / Test Mode for review and workflow verification.
                  </div>
                </div>
              </>
            ) : result.status === 'SUBMITTED' ? (
              <>
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SMS submitted successfully</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 pl-5">
                  <div>Provider ID: <span className="font-mono font-bold text-slate-800">{result.providerMessageId || result.messageId}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">SUBMITTED</span></div>
                </div>
              </>
            ) : result.status === 'DELIVERED' ? (
              <>
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SMS Delivered</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 pl-5">
                  <div>Provider ID: <span className="font-mono font-bold text-slate-800">{result.providerMessageId || result.messageId}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">DELIVERED</span></div>
                </div>
              </>
            ) : result.status === 'FAILED' ? (
              <>
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Transmission Failed</span>
                </div>
                <div className="text-[11px] text-rose-700 pl-5">
                  {result.error || 'Provider rejected message submission.'}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Saved to SMS Outbox for later sending</span>
                </div>
                <div className="text-[11px] text-blue-800 space-y-0.5 pl-5">
                  <div>Real SMS sending is not configured.</div>
                  <div>Status: <span className="font-bold text-blue-900">OFFLINE_OUTBOX</span></div>
                  <div>Saved locally for transmission once a cellular provider is active.</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Now...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{result ? 'Send Again' : 'Send Immediately from Medora'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
