import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, CheckCircle2, HelpCircle, FileText, ArrowRight, Volume2, Sparkles, Building2, Heart, Award, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

interface GovernmentSchemesPageProps {
  currentLang: LanguageCode;
  onNavigateToAI: () => void;
  onNavigateToEmergencyMap: () => void;
}

export const GovernmentSchemesPage: React.FC<GovernmentSchemesPageProps> = ({
  currentLang,
  onNavigateToAI,
  onNavigateToEmergencyMap,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<string>('pmjay');
  const [eligibleCategory, setEligibleCategory] = useState<'bpl' | 'pregnant' | 'child' | 'senior'>('bpl');

  const schemes = [
    {
      id: 'pmjay',
      title: 'Ayushman Bharat PM-JAY (  )',
      fundingAmount: '₹5,00,000 / Year',
      benefitType: '100% Cashless Hospitalization Coverage',
      targetBeneficiary: 'Poor rural families & SECC BPL ration card holders',
      overview: 'The world’s largest government-funded health insurance program. Provides up to ₹5 Lakh cashless treatment per family per year across 27,000+ empanelled government and private hospitals across India.',
      coveredProcedures: [
        'Heart Bypass surgery, Angioplasty & Stents',
        'Knee & Hip Joint replacement surgery',
        'Cataract eye surgery with intraocular lenses',
        'Cancer chemotherapy, radiation & surgical oncology',
        'ICU critical care, brain trauma, and burn management',
      ],
      documentsNeeded: ['Ration Card (NFSA / BPL)', 'Aadhaar Card of all family members', 'Active mobile number'],
      helpline: '14555',
      website: 'https://mera.pmjay.gov.in',
    },
    {
      id: 'jsy',
      title: 'Janani Suraksha Yojana (JSY -   )',
      fundingAmount: '₹1,400 to ₹6,000 Cash Assistance',
      benefitType: 'Direct Benefit Cash Transfer to Mother’s Bank Account',
      targetBeneficiary: 'All rural pregnant women delivering in government PHC/CHC/Hospitals',
      overview: 'National safe motherhood mission under the National Health Mission (NHM). Encourages institutional delivery to reduce maternal and infant mortality in villages.',
      coveredProcedures: [
        '₹1,400 direct deposit for rural mothers in Low Performing States (LPS)',
        'Free transportation via 102 Janani Shishu Ambulance from home to hospital',
        'Completely free medicines, blood transfusions, food, and delivery stay',
        '₹600 cash incentive to village ASHA worker who assists the mother',
      ],
      documentsNeeded: ['Mother-Child Protection (MCP) Card', 'Aadhaar Card', 'Bank Passbook copy (linked to Aadhaar)'],
      helpline: '102 / 104',
      website: 'https://nhm.gov.in',
    },
    {
      id: 'pmmvy',
      title: 'Pradhan Mantri Matru Vandana Yojana (PMMVY -  )',
      fundingAmount: '₹5,000 in 3 Direct Installments',
      benefitType: 'Wage Loss Compensation & Nutrition Support',
      targetBeneficiary: 'Pregnant women and lactating mothers for first living child',
      overview: 'Compensates wage loss for rural working mothers and provides direct financial assistance to improve nutritional intake during pregnancy and lactation.',
      coveredProcedures: [
        'Installment 1 (₹1,000): On early registration of pregnancy at Anganwadi',
        'Installment 2 (₹2,000): After at least 1 Antenatal Check-up (ANC) at 6 months',
        'Installment 3 (₹2,000): After child birth registration and completion of first vaccine cycle',
      ],
      documentsNeeded: ['MCP Card registration copy', 'Aadhaar of Mother & Husband', 'Bank Account passbook'],
      helpline: '011-23382393',
      website: 'https://wcd.nic.in/pmmvy',
    },
    {
      id: 'rbsk',
      title: 'Rashtriya Bal Swasthya Karyakram (RBSK -  )',
      fundingAmount: '100% Free Specialized Surgeries',
      benefitType: 'Free Treatment for Birth Defects & Surgeries in Children',
      targetBeneficiary: 'Children from birth up to 18 years',
      overview: 'Comprehensive child screening and surgical intervention program covering 30 health conditions known as the 4Ds: Defects at birth, Deficiencies, Childhood Diseases, and Developmental delays.',
      coveredProcedures: [
        'Free surgery for Congenital Heart Disease (  )',
        'Cleft Lip and Cleft Palate correction surgeries',
        'Club foot (  ) correction and casting',
        'Free treatment for Severe Acute Malnutrition (SAM) at NRC centres',
        'Vision impairment, congenital cataract, and hearing aid implants',
      ],
      documentsNeeded: ['Birth certificate or Anganwadi record', 'Parents Aadhaar Card'],
      helpline: '1098 (Childline) / 104',
      website: 'https://rbsk.gov.in',
    },
    {
      id: 'vayoshri',
      title: 'Rashtriya Vayoshri Yojana (   )',
      fundingAmount: '100% Free Assistive Devices',
      benefitType: 'Free Physical Living Aids for Elderly (60+ yrs)',
      targetBeneficiary: 'Senior citizens belonging to BPL rural families',
      overview: 'Provides free certified physical aids and assisted living devices to senior citizens suffering from age-related disabilities to restore their mobility and dignity.',
      coveredProcedures: [
        'Free four-legged rubber-tipped Walking Sticks and Crutches',
        'Modern foldable Wheelchairs & Walkers',
        'High-grade Digital Hearing Aids (  )',
        'Tripods and Quadripods for arthritis patients',
        'Dentures ( ) and Spectacles for clear vision',
      ],
      documentsNeeded: ['Senior Citizen Age Proof (60+)', 'BPL Ration Card or Income Certificate', 'Aadhaar Card'],
      helpline: '1800-180-5125',
      website: 'https://socialjustice.gov.in',
    },
  ];

  const activeSchemeData = schemes.find(s => s.id === selectedScheme) || schemes[0];

  const readPageVoice = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    const text = `Government healthcare funding schemes. Ayushman Bharat PM-JAY provides 5 lakh rupees of free cashless hospital treatment per family per year. Janani Suraksha Yojana provides cash assistance for maternal delivery. Emergency police number is 112, ambulance is 108, and maternal helpline is 102.`;
    voiceService.speak(text, currentLang, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <Award className="w-4 h-4 text-emerald-300" />
              <span>Free Government Health Protection & Financial Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Government Schemes for Free Healthcare & Funding
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Poor villagers should never fall into debt for medical care. Learn about your rights: Ayushman Bharat ₹5 Lakh cashless coverage, Janani Suraksha maternal cash transfers, free child surgeries, and senior assistive aids.
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
            <button
              onClick={onNavigateToEmergencyMap}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <span>Emergency Numbers & Maps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EMERGENCY NUMBERS HIGHLIGHT BOX (Explicitly requested by user) */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-400/50 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-white animate-bounce" />
            <h2 className="text-xl font-black">24x7 Immediate Emergency Contacts & Hotlines</h2>
          </div>
          <span className="text-xs font-bold bg-white text-rose-700 px-3 py-1 rounded-full">
            All Numbers Toll-Free
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <a
            href="tel:108"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Free Ambulance</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">108</span>
            <span className="text-[10px] text-rose-100">Medical Emergencies</span>
          </a>

          <a
            href="tel:102"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Maternal Delivery</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">102</span>
            <span className="text-[10px] text-rose-100">Janani Shishu Ambulance</span>
          </a>

          <a
            href="tel:112"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Police Helpline</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">112</span>
            <span className="text-[10px] text-rose-100">Police & Disaster (100)</span>
          </a>

          <a
            href="tel:1091"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Women Helpline</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">1091</span>
            <span className="text-[10px] text-rose-100">Women Protection (181)</span>
          </a>

          <a
            href="tel:1098"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Childline</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">1098</span>
            <span className="text-[10px] text-rose-100">Child In Distress</span>
          </a>

          <a
            href="tel:14555"
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/20 text-center transition-all group"
          >
            <span className="text-[11px] font-extrabold text-rose-200 block uppercase">Ayushman PMJAY</span>
            <span className="text-2xl font-black text-white group-hover:scale-105 transition-transform block">14555</span>
            <span className="text-[10px] text-rose-100">Hospital Empanelled Desk</span>
          </a>
        </div>
      </div>

      {/* Schemes Selector & Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Schemes List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            Empanelled Government Schemes:
          </span>
          <div className="space-y-2">
            {schemes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScheme(s.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  selectedScheme === s.id
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {s.fundingAmount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Toll-Free: {s.helpline}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.overview}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Scheme Deep-Dive */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                {activeSchemeData.benefitType}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeSchemeData.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 block">{activeSchemeData.fundingAmount}</span>
              <span className="text-[11px] text-slate-500">{activeSchemeData.targetBeneficiary}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {activeSchemeData.overview}
          </p>

          {/* Covered procedures */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-black text-slate-900 block text-sm">
              Key Benefits & Covered Treatments:
            </span>
            <div className="space-y-1.5">
              {activeSchemeData.coveredProcedures.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents required */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
            <span className="font-black text-amber-950 block text-sm">
              Documents Required for Free Registration ( ):
            </span>
            <div className="flex flex-wrap gap-2">
              {activeSchemeData.documentsNeeded.map((doc, idx) => (
                <span key={idx} className="bg-white text-amber-900 px-3 py-1 rounded-xl border border-amber-300 font-bold">
                  📄 {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Need assistance? Dial National Helpline: <strong className="text-slate-900 font-mono font-bold">{activeSchemeData.helpline}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToAI}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all"
              >
                Ask AI Eligibility Check
              </button>
              <button
                onClick={onNavigateToEmergencyMap}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow"
              >
                Find Empanelled Hospital Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
