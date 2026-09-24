import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, Scheme } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function SchemesPage() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [smsSent, setSmsSent] = useState(false);

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
          <h1 className="text-xl font-black text-[#4F46E5]">🏛️ {t('schemes.title')}</h1>
          <DemoDataBadge />
        </div>

        {smsSent && (
          <div className="bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold p-3 rounded-xl mb-4">
            ✅ Application request added to SMS Outbox (Demo)
          </div>
        )}

        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-3 mb-4 text-xs text-[#16A34A] font-bold">
          ℹ️ {t('schemes.disclaimer')}
        </div>

        <div className="space-y-3">
          {schemes.map(scheme => (
            <div key={scheme.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id!)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-2xl">{SCHEME_ICONS[scheme.name] || '🏛️'}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-[#0F172A] text-sm">{scheme.name}</div>
                  <div className="text-xs text-[#64748B] line-clamp-1">{scheme.description}</div>
                </div>
                <span className="text-[#94A3B8] text-xs">{expanded === scheme.id ? '▲' : '▼'}</span>
              </button>

              {expanded === scheme.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#E2E8F0] pt-3">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs mb-1">📋 {t('schemes.eligibility')}</h4>
                    <p className="text-xs text-[#475569]">{scheme.eligibility}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs mb-1">✅ {t('schemes.benefits')}</h4>
                    <p className="text-xs text-[#475569]">{scheme.benefits}</p>
                  </div>
                  {scheme.documents?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-xs mb-1">📄 {t('schemes.documents')}</h4>
                      <ul className="space-y-1">
                        {scheme.documents.map((doc, i) => (
                          <li key={i} className="text-xs text-[#475569] flex items-center gap-1">
                            <span className="text-[#16A34A] font-bold">•</span> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs mb-1">🔗 {t('schemes.howToApply')}</h4>
                    <p className="text-xs text-[#475569]">{scheme.source}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await db.smsOutbox.add({
                        toPhone: 'ASHA Worker',
                        message: `Please help me apply for: ${scheme.name}. [Demo message]`,
                        type: 'doctor_summary',
                        language: 'en',
                        status: 'PENDING_OFFLINE',
                        createdAt: new Date().toISOString(),
                      });
                      setSmsSent(true);
                    }}
                    className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-2xs transition-colors"
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
