import React from 'react';
import { HeartPulse, Baby, Shield, ArrowRight, Phone, CheckCircle, Calendar } from 'lucide-react';
import { Specialization, LanguageCode } from '../types';

interface CareTiersHeaderProps {
  onSelectCategory: (category: Specialization) => void;
  onOpenEmergency: () => void;
  currentLang: LanguageCode;
}

export const CareTiersHeader: React.FC<CareTiersHeaderProps> = ({
  onSelectCategory,
  onOpenEmergency,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Priority Rural Care Tiers
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Essential Care for Vulnerable Family Members
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Elderly Care (Geriatric) */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-15">
            <Shield className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-white/20 rounded-2xl backdrop-blur">
                <Shield className="w-6 h-6 text-white" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/60 px-2.5 py-1 rounded-full text-amber-200">
                Ages 60+
              </span>
            </div>

            <h3 className="text-xl font-black text-white">
              👵 Elderly Care ( )
            </h3>
            <p className="text-xs text-amber-100 mt-1 leading-relaxed">
              Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-amber-50">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-200" />
                <span>Daily BP logging (Morning & Evening)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-200" />
                <span>Joint mobility & warm compress routine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-200" />
                <span>Geriatric OPD at District Civil Hospital</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center gap-2">
            <button
              onClick={() => onSelectCategory('Geriatric Care')}
              className="flex-1 py-2 px-3 bg-white hover:bg-amber-50 active:scale-95 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>Find Senior Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="tel:108"
              className="p-2 bg-amber-900/80 hover:bg-amber-950 text-white rounded-xl text-xs font-bold"
              title="Emergency"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 2. Maternal Care (Maternity & Pregnancy) */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-15">
            <HeartPulse className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-white/20 rounded-2xl backdrop-blur">
                <HeartPulse className="w-6 h-6 text-white" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-900/60 px-2.5 py-1 rounded-full text-rose-200">
                ANC & Delivery
              </span>
            </div>

            <h3 className="text-xl font-black text-white">
              🤰 Maternal Care ( )
            </h3>
            <p className="text-xs text-rose-100 mt-1 leading-relaxed">
              Safe institutional delivery tracking, IFA tablets for anemia, antenatal ultrasounds, and free 102 ambulance.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-rose-50">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-rose-200" />
                <span>Trimester 2 Checkup & Fetal Ultrasound</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-rose-200" />
                <span>Iron & Folic Acid (IFA) daily supplementation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-rose-200" />
                <span>Janani Suraksha Yojana (JSY) assistance</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center gap-2">
            <button
              onClick={() => onSelectCategory('Gynecologist / Obstetrician')}
              className="flex-1 py-2 px-3 bg-white hover:bg-rose-50 active:scale-95 text-rose-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>Find Gynecologist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="tel:102"
              className="p-2 bg-rose-900/80 hover:bg-rose-950 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              title="Janani Shishu 102"
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px] font-mono">102</span>
            </a>
          </div>
        </div>

        {/* 3. Child Care (Pediatric) */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-15">
            <Baby className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-white/20 rounded-2xl backdrop-blur">
                <Baby className="w-6 h-6 text-white" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-900/60 px-2.5 py-1 rounded-full text-sky-200">
                Ages 0 - 12
              </span>
            </div>

            <h3 className="text-xl font-black text-white">
              👶 Child Care (   )
            </h3>
            <p className="text-xs text-sky-100 mt-1 leading-relaxed">
              Booster immunizations, growth monitoring for stunting/wasting, diarrhea ORS kits, and acute fever care.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-sky-50">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-sky-200" />
                <span>DPT Booster 2 catch-up vaccination</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-sky-200" />
                <span>ORS + Zinc packet guidance for diarrhea</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-sky-200" />
                <span>Monthly Anganwadi growth weight check</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center gap-2">
            <button
              onClick={() => onSelectCategory('Pediatrician')}
              className="flex-1 py-2 px-3 bg-white hover:bg-sky-50 active:scale-95 text-sky-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>Find Pediatrician</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="tel:108"
              className="p-2 bg-sky-900/80 hover:bg-sky-950 text-white rounded-xl text-xs font-bold"
              title="Emergency"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
