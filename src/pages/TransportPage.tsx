import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, Transport } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function TransportPage() {
  const { t } = useTranslation();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [requested, setRequested] = useState<number[]>([]);

  useEffect(() => { db.transport.toArray().then(setTransports); }, []);

  const handleRequest = async (transport: Transport) => {
    await db.smsOutbox.add({
      toPhone: transport.phone,
      message: `Transport Request: Need ${transport.name} from ${transport.from} to ${transport.to}. Please call me. [Demo — not actually sent]`,
      type: 'emergency_alert',
      language: 'en',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setRequested(prev => [...prev, transport.id!]);
  };

  const ICONS: Record<string, string> = { ambulance: '🚑', auto: '🛺', bus: '🚌', community: '🚐' };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🚑 {t('transport.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
          ⚠️ {t('transport.demoNote')}
        </div>

        <div className="space-y-3">
          {transports.map(tr => (
            <div key={tr.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${tr.available ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ICONS[tr.type] || '🚗'}</span>
                  <div>
                    <div className="font-bold text-gray-900">{tr.name}</div>
                    <div className="text-sm text-gray-600">{tr.from} → {tr.to}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${tr.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tr.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-900">{tr.estimatedMinutes} min</div>
                  <div className="text-xs text-gray-500">{t('transport.estimatedTime')}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-900">{tr.phone}</div>
                  <div className="text-xs text-gray-500">{t('transport.contact')}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-900 capitalize">{tr.type}</div>
                  <div className="text-xs text-gray-500">Type</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={`tel:${tr.phone}`} className="bg-sky-600 text-white text-center text-sm font-medium py-2.5 rounded-xl hover:bg-sky-700">
                  📞 Call
                </a>
                <button
                  onClick={() => handleRequest(tr)}
                  disabled={!tr.available || requested.includes(tr.id!)}
                  className={`text-sm font-medium py-2.5 rounded-xl transition-all ${requested.includes(tr.id!) ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40'}`}
                >
                  {requested.includes(tr.id!) ? '✅ Requested' : t('transport.book')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
