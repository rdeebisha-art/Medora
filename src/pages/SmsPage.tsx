import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, SmsOutbox } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

const MSG_TYPES = ['doctor_summary', 'emergency_alert', 'appointment', 'medicine_reminder', 'vaccination', 'family_alert', 'hospital_info'];
const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' }, { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' }, { code: 'ml', name: 'മലയാളം' },
];

export default function SmsPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [messages, setMessages] = useState<SmsOutbox[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ toPhone: '', type: 'family_alert', language: language, message: '' });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    db.smsOutbox.orderBy('createdAt').reverse().toArray().then(setMessages);
  }, [refresh]);

  const handleSend = async () => {
    if (!form.toPhone || !form.message) return;
    
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    
    if (isMobile) {
      // MODE A: Opens native SMS composer — actual delivery depends on user sending from their phone app
      window.open(`sms:${form.toPhone}?body=${encodeURIComponent(form.message)}`, '_blank');
      await db.smsOutbox.add({ ...form, status: 'PENDING_USER_SEND', createdAt: new Date().toISOString() });
    } else {
      // MODE B: No SMS provider configured — save to local outbox only
      await db.smsOutbox.add({ ...form, status: 'PENDING_OFFLINE', createdAt: new Date().toISOString() });
    }
    
    setForm({ toPhone: '', type: 'family_alert', language: language, message: '' });
    setShowCompose(false);
    setRefresh(r => r + 1);
  };

  const statusColor = (s: string) => s === 'sent' ? 'bg-green-100 text-green-700' : s === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  const statusLabel = (s: string) => {
    if (s === 'sent') return 'Sent';
    if (s === 'PENDING_OFFLINE') return 'PENDING OFFLINE — Provider Not Configured';
    if (s === 'PENDING_USER_SEND') return 'PENDING — Opened in phone app, not yet confirmed sent';
    if (s === 'pending') return 'PENDING — Queued in local outbox';
    if (s === 'failed') return 'Failed';
    return s;
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">📱 {t('sms.title')}</h1>
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <button onClick={() => setShowCompose(true)} className="bg-sky-600 text-white text-sm px-3 py-1.5 rounded-xl font-medium">
              + {t('sms.compose')}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
          📱 {t('sms.demoNote')}
        </div>

        {/* Message List */}
        <h2 className="font-semibold text-gray-700 mb-3">{t('sms.outbox')}</h2>
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📤</div>
            <p>No messages yet. Compose a message or use Emergency/Transport features.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">{msg.type.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(msg.status)}`}>{statusLabel(msg.status)}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">To: {msg.toPhone}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.message}</div>
                <div className="text-xs text-gray-400 mt-1">{msg.createdAt?.slice(0, 16)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg mb-4">{t('sms.compose')}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sms.to')}</label>
                  <input type="tel" value={form.toPhone} onChange={e => setForm(p => ({ ...p, toPhone: e.target.value }))}
                    placeholder="e.g. 9876543210 or ASHA Worker" className="w-full border border-gray-300 rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sms.type')}</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5">
                    {MSG_TYPES.map(mt => <option key={mt} value={mt}>{t(`sms.types.${mt}`, mt)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sms.language')}</label>
                  <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5">
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sms.message')}</label>
                  <textarea rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Type your message..." className="w-full border border-gray-300 rounded-xl px-3 py-2.5 resize-none" />
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
                  <strong>{t('sms.preview')}:</strong> To: {form.toPhone || '...'} | {form.message.slice(0, 50) || '...'}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCompose(false)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium">{t('common.cancel')}</button>
                <button onClick={handleSend} className="flex-1 bg-sky-600 text-white py-3 rounded-xl font-bold">{t('sms.addToOutbox')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
