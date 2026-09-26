import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { db, Hospital } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';

export default function HospitalsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedRouteNotice, setSelectedRouteNotice] = useState<string | null>(null);

  useEffect(() => { db.hospitals.toArray().then(setHospitals); }, []);

  useEffect(() => {
    const urlQ = searchParams.get('search') || searchParams.get('q');
    if (urlQ) {
      setSearch(urlQ);
    }
  }, [searchParams]);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-[#2563EB]">🏥 {t('hospitals.title')}</h1>
          <DemoDataBadge />
        </div>

        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search') + ' hospitals...'}
          className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] mb-3 focus:border-[#2563EB] focus:outline-none shadow-2xs"
        />

        {selectedRouteNotice && (
          <div className="bg-[#EFF6FF] border border-[#2563EB]/30 rounded-xl p-3 mb-3 text-xs text-[#2563EB] flex items-center justify-between">
            <span>🗺️ {selectedRouteNotice}</span>
            <button onClick={() => setSelectedRouteNotice(null)} className="font-bold text-xs ml-2">✕</button>
          </div>
        )}

        <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-xl p-3 mb-4 text-xs text-[#D97706]">
          ℹ️ {t('hospitals.demoNote')}
        </div>

        <div className="space-y-4">
          {filtered.map(h => (
            <div key={h.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-extrabold text-[#0F172A] text-base">{h.name}</div>
                  <div className="text-xs text-[#2563EB] font-bold capitalize mt-0.5">
                    {t(`hospitals.types.${h.type.replace(' ', '_')}`, h.type)}
                  </div>
                  <div className="text-xs text-[#475569] mt-1">{h.address}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-[#0F172A] text-xs">{h.distance} km</div>
                  {h.hasEmergency && (
                    <span className="bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Emergency</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {h.services?.map((s, i) => (
                  <span key={i} className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#2563EB]/20">{s}</span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                <span>🕐 {h.openHours}</span>
                <span>📞 {h.phone}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => callPhoneNumber(h.phone || '04542-241200', h.name, 'HOSPITAL', h.address)}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white text-center text-xs font-bold py-2.5 rounded-xl shadow-2xs transition-colors">
                  📞 {t('hospitals.call')}
                </button>
                <button
                  onClick={() => setSelectedRouteNotice(`Offline route cached for ${h.name} (${h.address})`)}
                  className="bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-[#E2E8F0] text-xs font-bold py-2.5 rounded-xl transition-colors">
                  🗺️ {t('hospitals.route')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748B]">
            <div className="text-5xl mb-3">🏥</div>
            <p>No hospitals found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
