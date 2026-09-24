import React from 'react';
import { X, Navigation, MapPin, Bus, Car, Bike, Footprints, ExternalLink, Info } from 'lucide-react';
import { Hospital, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DirectionsModalProps {
  hospital: Hospital | null;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  hospital,
  onClose,
  currentLang,
}) => {
  if (!hospital) return null;
  const t = TRANSLATIONS[currentLang];

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.mapCoordinates.lat},${hospital.mapCoordinates.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              DEMO TRANSIT MAP
            </span>
            <span className="text-xs text-slate-300 font-medium">{t.directionsTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Destination Header */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Destination Healthcare Center
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {hospital.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 flex items-start gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{hospital.address}</span>
            </p>
            <p className="text-xs font-semibold text-blue-700 mt-1">
              📍 Landmark: {hospital.landmark}
            </p>
          </div>

          {/* Interactive Visual Map Demonstration Graphic */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner">
            {/* SVG Rural Road Map Mockup */}
            <svg viewBox="0 0 600 280" className="w-full h-56 sm:h-64 object-cover bg-emerald-50/40">
              {/* Contours and Rural Terrain */}
              <path d="M0,80 Q150,120 300,70 T600,100 L600,280 L0,280 Z" fill="#ecfdf5" opacity="0.6" />
              <path d="M0,190 Q200,160 400,210 T600,180 L600,280 L0,280 Z" fill="#d1fae5" opacity="0.5" />

              {/* Village Cluster 1 (Origin) */}
              <circle cx="80" cy="190" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="80" cy="190" r="14" fill="#10b981" />
              <text x="80" y="235" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">Your Village (Rampur)</text>

              {/* Connecting Rural Road Highway */}
              <path
                d="M80,190 C180,190 220,90 320,110 S460,170 510,90"
                fill="none"
                stroke="#d97706"
                strokeWidth="6"
                strokeDasharray="8 6"
              />
              <path
                d="M80,190 C180,190 220,90 320,110 S460,170 510,90"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />

              {/* Transit Stop / Milestone */}
              <circle cx="280" cy="102" r="12" fill="#3b82f6" />
              <text x="280" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e3a8a">Bus Stop (Mile 6)</text>

              {/* Hospital Pinpoint Destination */}
              <g transform="translate(510, 90)">
                <circle cx="0" cy="0" r="24" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" className="animate-ping opacity-75" />
                <circle cx="0" cy="0" r="18" fill="#dc2626" />
                <text x="0" y="6" textAnchor="middle" fontSize="16" fill="white">🏥</text>
                <text x="0" y="42" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#991b1b">Hospital</text>
              </g>

              {/* Distance Tag Overlay */}
              <rect x="220" y="145" width="130" height="28" rx="8" fill="#1e293b" opacity="0.9" />
              <text x="285" y="164" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#f8fafc">
                🛣️ {hospital.distanceKm} km direct route
              </text>
            </svg>

            {/* Simulated Live Notice */}
            <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-400" />
              <span>Simulated Rural Transit Route (Hackathon Demo)</span>
            </div>
          </div>

          {/* Travel Modes Breakdown */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Recommended Rural Transport Modes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
                  <Bus className="w-4 h-4 text-blue-600" />
                  <span>State Bus</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  {hospital.travelTime.includes('bus') ? hospital.travelTime.split('/')[0] : 'Approx 30 mins'}
                </span>
                <span className="text-[10px] text-slate-500">Every 45 mins</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Auto / Taxi</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  {Math.round(hospital.distanceKm * 2.2)} mins
                </span>
                <span className="text-[10px] text-slate-500">Fastest transit</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Two-Wheeler</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  {Math.round(hospital.distanceKm * 2.0)} mins
                </span>
                <span className="text-[10px] text-slate-500">Via state highway</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
                  <Footprints className="w-4 h-4 text-amber-600" />
                  <span>Walking</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  {hospital.distanceKm < 5 ? `${hospital.distanceKm * 15} mins` : 'Bus advised'}
                </span>
                <span className="text-[10px] text-slate-500">Paved shoulder</span>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Rural Landmark Steps */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-[11px]">
              Landmark Navigation Steps from Village
            </h4>
            <ol className="space-y-1.5 text-slate-700 list-decimal list-inside leading-relaxed">
              <li>Head East out of Rampur Village towards the State Highway bus shelter (800 meters).</li>
              <li>At the Panchayat Sahakari bank junction, take the paved branch road toward Taluk West.</li>
              <li>Pass Mile 6 bus stop near the APMC agricultural market.</li>
              <li>Arrival: <strong>{hospital.name}</strong> located {hospital.landmark.toLowerCase()}.</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-slate-500">
            For live satellite GPS turn-by-turn navigation:
          </p>
          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
            <button
              onClick={onClose}
              className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
