import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, Hospital } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function HospitalsPage() {
  const { t } = useTranslation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { db.hospitals.toArray().then(setHospitals); }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🏥 {t('hospitals.title')}</h1>
          <DemoDataBadge />
        </div>

        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search') + ' hospitals...'}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-4 focus:border-sky-400 focus:outline-none"
        />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
          ℹ️ {t('hospitals.demoNote')}
        </div>

        <div className="space-y-4">
          {filtered.map(h => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{h.name}</div>
                  <div className="text-sm text-sky-600 font-medium capitalize mt-0.5">
                    {t(`hospitals.types.${h.type.replace(' ', '_')}`, h.type)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{h.address}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-gray-700">{h.distance} km</div>
                  {h.hasEmergency && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Emergency</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {h.services?.map((s, i) => (
                  <span key={i} className="bg-sky-50 text-sky-700 text-xs px-2 py-1 rounded-full border border-sky-200">{s}</span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">🕐 {h.openHours}</span>
                <span className="text-gray-500">📞 {h.phone}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${h.phone}`}
                  className="bg-sky-600 text-white text-center text-sm font-medium py-2.5 rounded-xl hover:bg-sky-700">
                  📞 {t('hospitals.call')}
                </a>
                <button
                  onClick={() => alert('Offline route: ' + h.name + '\n' + h.address + '\n\nDemo: Real GPS navigation requires internet.')}
                  className="bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200">
                  🗺️ {t('hospitals.route')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🏥</div>
            <p>No hospitals found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
