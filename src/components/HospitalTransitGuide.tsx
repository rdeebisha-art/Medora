import React from 'react';
import { Navigation, Bus, Phone, MapPin, Ambulance, ArrowRight, ShieldCheck, Car, Bike, Clock } from 'lucide-react';
import { Hospital, LanguageCode } from '../types';

interface HospitalTransitGuideProps {
  hospitals: Hospital[];
  onOpenDirections: (hospital: Hospital) => void;
  onOpenEmergency: () => void;
  currentLang: LanguageCode;
}

export const HospitalTransitGuide: React.FC<HospitalTransitGuideProps> = ({
  hospitals,
  onOpenDirections,
  onOpenEmergency,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Immediate Hospital Contact Hotlines (Speed Dial) */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-300 animate-bounce" />
            <h3 className="text-lg sm:text-xl font-black">
              Immediate Hospital Contacts & Emergency Speed-Dial
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-full text-white">
            24x7 Verified Lines
          </span>
        </div>
        <p className="text-xs text-rose-100 leading-relaxed max-w-2xl">
          Tap any button to instantly connect your phone call. Free emergency services under National Health Mission.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <a
            href="tel:108"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-white text-red-700 hover:bg-red-50 font-black rounded-2xl shadow-sm transition-all"
          >
            <Ambulance className="w-4 h-4 text-red-600" />
            <span>108 Ambulance</span>
          </a>

          <a
            href="tel:102"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-sm transition-all"
          >
            <Phone className="w-4 h-4 text-rose-600" />
            <span>102 Maternal</span>
          </a>

          <a
            href="tel:+911123456780"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-900/90 text-white hover:bg-slate-950 font-bold rounded-2xl border border-white/20 transition-all text-center"
          >
            <span>Civil Hospital Desk</span>
          </a>

          <a
            href="tel:+918028123450"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-900/90 text-white hover:bg-slate-950 font-bold rounded-2xl border border-white/20 transition-all text-center"
          >
            <span>Local PHC Rampur</span>
          </a>
        </div>
      </div>

      {/* How Can Villagers Go to Hospital Easily */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                How Can Villagers Go to Hospital Easily? (  )
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Affordable rural transit options, bus departure schedules, auto stands, and wheelchair accessibility.
            </p>
          </div>
        </div>

        {/* 4 Transport Modes for Rural Patients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Mode 1: State Bus */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Bus className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">₹15 Fare</span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-2">
                Rural State Bus (Route 14)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Departs Rampur Village Stand every 45 mins. Direct drop at District Civil Hospital Gate 2.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-blue-700 pt-2 border-t border-slate-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Next bus: 09:15 AM & 10:00 AM</span>
            </div>
          </div>

          {/* Mode 2: Shared Auto / Taxi */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Car className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">₹30 - ₹50</span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-2">
                Gram Panchayat Auto Stand
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Available near Village Coop Bank. Accommodates elderly patients unable to climb bus steps.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 pt-2 border-t border-slate-200 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Auto Driver: +91 94481 99881</span>
            </div>
          </div>

          {/* Mode 3: Two Wheeler / Bicycle */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <Bike className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">15 - 25 Mins</span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-2">
                Paved Branch Highway Route
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Direct asphalt road via Mile Marker 6. Smooth ride avoiding dirt potholes for knee pain patients.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-purple-700 pt-2 border-t border-slate-200">
              <span>Follow State Highway 14 signs</span>
            </div>
          </div>

          {/* Mode 4: Free Ambulance */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-red-600 text-white rounded-xl">
                  <Ambulance className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold text-red-700">100% Free</span>
              </div>
              <h4 className="font-black text-red-950 text-sm mt-2">
                108 / 102 Emergency Dispatch
              </h4>
              <p className="text-[11px] text-red-900 mt-1">
                For labor pain, unconsciousness, severe trauma, or heart attack. Ambulance reaches village in 12-18 mins.
              </p>
            </div>
            <button
              onClick={onOpenEmergency}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold w-full"
            >
              Call Free Ambulance
            </button>
          </div>
        </div>

        {/* Quick Facility Distance Cards */}
        <div className="pt-2">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Nearby Facilities & Quick Route Guides
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {hospitals.slice(0, 3).map((hosp) => (
              <div
                key={hosp.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 truncate block">{hosp.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {hosp.distanceKm} km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{hosp.landmark}</p>
                </div>
                <button
                  onClick={() => onOpenDirections(hosp)}
                  className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Show Route & Bus Guide</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
