import React, { useState } from 'react';
import { MapPin, Navigation, PhoneCall, Clock, ShieldCheck, AlertTriangle, Building2, Car, Bus, Volume2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { LanguageCode, Hospital } from '../types';
import { voiceService } from '../services/voiceService';

interface EmergencyMapPageProps {
  currentLang: LanguageCode;
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onOpenDirections: (hospital: Hospital) => void;
  onNavigateToAI: () => void;
}

export const EmergencyMapPage: React.FC<EmergencyMapPageProps> = ({
  currentLang,
  hospitals,
  onSelectHospital,
  onOpenDirections,
  onNavigateToAI,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');
  const [selectedTransitMode, setSelectedTransitMode] = useState<'ambulance' | 'bus' | 'auto'>('ambulance');

  const activeHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  const readPageVoice = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `Nearby Hospitals and Emergency Map. Closest facility is Primary Health Centre Rampur, 2.1 kilometers away, travel time 8 minutes. For emergency ambulance, dial 108. All government hospitals are Ayushman Bharat empanelled for free treatment.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 text-rose-200 px-3 py-1 rounded-full text-xs font-bold">
              <Navigation className="w-4 h-4 text-rose-300" />
              <span>Village Rapid Transit, Hospital Routing & Emergency Hotlines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Nearby Hospital Maps & Emergency Transit Guide
            </h1>
            <p className="text-sm text-rose-100/90 leading-relaxed">
              Find how to reach the nearest hospital easily from your village: live road distances, bus timings, shared auto stands, free 108 ambulance dispatch, and verified Ayushman Bharat beds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={readPageVoice}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? 'Stop Voice' : '🔊 Listen in Native Language'}</span>
            </button>
            <a
              href="tel:108"
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108 Ambulance</span>
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Canvas & Navigation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-black text-slate-900">Interactive Village-to-Hospital Road Map</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Route Clear
            </span>
          </div>

          {/* SVG Map Visualization */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex items-center justify-center">
            {/* SVG Roads & Node Network */}
            <svg className="w-full h-full" viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background Grid Lines */}
              <path d="M0 70 H600 M0 140 H600 M0 210 H600 M0 280 H600" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M100 0 V350 M200 0 V350 M300 0 V350 M400 0 V350 M500 0 V350" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              {/* State Highway Route (Main Paved Road) */}
              <path d="M 80 180 Q 220 140 340 190 T 520 100" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              {/* Village Bypass Road */}
              <path d="M 80 180 Q 150 260 280 270 T 480 240" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" strokeLinecap="round" />
              {/* Shortcut Trail */}
              <path d="M 280 270 L 340 190" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 3" />

              {/* Village Nodes */}
              {/* Node 1: Village Rampur (Start Point) */}
              <g className="cursor-pointer">
                <circle cx="80" cy="180" r="14" fill="#0284c7" />
                <circle cx="80" cy="180" r="22" stroke="#38bdf8" strokeWidth="2" opacity="0.6" className="animate-ping" />
                <text x="80" y="215" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Village Rampur (  )</text>
              </g>

              {/* Node 2: PHC Rampur */}
              <g className="cursor-pointer" onClick={() => setSelectedHospitalId('hosp-2')}>
                <circle cx="220" cy="155" r="10" fill="#10b981" />
                <text x="220" y="140" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">PHC Rampur (2.1 km)</text>
              </g>

              {/* Node 3: CHC Shivajinagar */}
              <g className="cursor-pointer" onClick={() => setSelectedHospitalId('hosp-3')}>
                <circle cx="340" cy="190" r="13" fill="#6366f1" />
                <text x="340" y="220" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle">CHC Shivajinagar (8.5 km)</text>
              </g>

              {/* Node 4: District Civil Hospital */}
              <g className="cursor-pointer" onClick={() => setSelectedHospitalId('hosp-1')}>
                <circle cx="520" cy="100" r="16" fill="#e11d48" />
                <circle cx="520" cy="100" r="24" stroke="#f43f5e" strokeWidth="2" opacity="0.4" />
                <text x="520" y="75" fill="#fda4af" fontSize="12" fontWeight="black" textAnchor="middle">District Hospital (18 km)</text>
              </g>

              {/* Transit Moving Pin */}
              <circle cx="150" cy="165" r="6" fill="#fbbf24">
                <animate attributeName="cx" from="80" to="520" dur="8s" repeatCount="indefinite" />
                <animate attributeName="cy" from="180" to="100" dur="8s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs p-2 rounded-xl border border-slate-800 text-[10px] space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-500 rounded" />
                <span>Paved State Highway (All-Weather)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-blue-500 rounded" />
                <span>Panchayat Rural Road</span>
              </div>
            </div>
          </div>

          {/* Transit Modes Toggle */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setSelectedTransitMode('ambulance')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedTransitMode === 'ambulance'
                  ? 'bg-rose-50 border-rose-400 font-black text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="block font-bold text-sm">🚑 108 Ambulance</span>
              <span className="text-[11px] text-slate-500">Free • 14 min dispatch</span>
            </button>

            <button
              onClick={() => setSelectedTransitMode('auto')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedTransitMode === 'auto'
                  ? 'bg-amber-50 border-amber-400 font-black text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="block font-bold text-sm">🛺 Shared Auto Stand</span>
              <span className="text-[11px] text-slate-500">₹20 fare • +91 94481 99881</span>
            </button>

            <button
              onClick={() => setSelectedTransitMode('bus')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedTransitMode === 'bus'
                  ? 'bg-emerald-50 border-emerald-400 font-black text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="block font-bold text-sm">🚌 Rural Bus Route 14</span>
              <span className="text-[11px] text-slate-500">₹15 fare • Every 45 mins</span>
            </button>
          </div>
        </div>

        {/* Selected Hospital Details (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                {activeHospital.type}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">{activeHospital.name}</h3>
            </div>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
              {activeHospital.distanceKm} km
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">Estimated Travel Time:</span>
              <span className="font-black text-slate-900">{activeHospital.travelTime}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">Ayushman Bharat Empanelled:</span>
              <span className="font-bold text-emerald-700">✓ 100% Free Cashless</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">Emergency Beds:</span>
              <span className="font-bold text-slate-900">{activeHospital.bedCapacity} Beds (ICU Active)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">Blood Bank on Site:</span>
              <span className="font-bold text-rose-700">O+, B+, A+, AB+ Available</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-950 block mb-0.5">Address & Landmark:</span>
              <span className="text-rose-900 text-[11px] block">{activeHospital.address}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Near {activeHospital.landmark}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`tel:${activeHospital.emergencyPhone || activeHospital.phone}`}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Hospital Desk: {activeHospital.emergencyPhone || activeHospital.phone}</span>
            </a>

            <button
              onClick={() => onOpenDirections(activeHospital)}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Open Turn-by-Turn GPS Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital List Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">All Nearby Empanelled Facilities Serving Village Rampur</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {hospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => setSelectedHospitalId(h.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedHospitalId === h.id
                  ? 'bg-rose-50/60 border-rose-400 ring-2 ring-rose-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500">{h.type}</span>
                <span className="font-black text-xs text-rose-700">{h.distanceKm} km</span>
              </div>
              <h4 className="font-black text-slate-900 text-sm">{h.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{h.travelTime} • {h.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
