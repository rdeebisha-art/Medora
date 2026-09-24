import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, Scheme } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function SchemesPage() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { db.schemes.toArray().then(setSchemes); }, []);

  const SCHEME_ICONS: Record<string, string> = {
    'Ayushman Bharat (PM-JAY)': '💛',
    'Janani Suraksha Yojana (JSY)': '🤰',
    'PMMVY': '👶',
    'Universal Immunisation Programme (UIP)': '💉',
    'Ayushman Arogya Mandir': '🏥',
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🏛️ {t('schemes.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs text-green-700">
          ℹ️ {t('schemes.disclaimer')}
        </div>

        <div className="space-y-3">
          {schemes.map(scheme => (
            <div key={scheme.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id!)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className="text-2xl">{SCHEME_ICONS[scheme.name] || '🏛️'}</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{scheme.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{scheme.description}</div>
                </div>
                <span className="text-gray-400">{expanded === scheme.id ? '▲' : '▼'}</span>
              </button>

              {expanded === scheme.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">📋 {t('schemes.eligibility')}</h4>
                    <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">✅ {t('schemes.benefits')}</h4>
                    <p className="text-sm text-gray-600">{scheme.benefits}</p>
                  </div>
                  {scheme.documents?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 text-sm mb-1">📄 {t('schemes.documents')}</h4>
                      <ul className="space-y-1">
                        {scheme.documents.map((doc, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-1">
                            <span className="text-green-500">•</span> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">🔗 {t('schemes.howToApply')}</h4>
                    <p className="text-sm text-gray-600">{scheme.source}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await db.smsOutbox.add({
                        toPhone: 'ASHA Worker',
                        message: `Please help me apply for: ${scheme.name}. [Demo message]`,
                        type: 'doctor_summary',
                        language: 'en',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                      });
                      alert('Application request added to SMS Outbox (Demo)');
                    }}
                    className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700"
                  >
                    📱 Request Help via SMS (Demo)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
