import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Stethoscope, ArrowRight, Activity, Droplets, Heart, Baby, Sparkles, Search } from 'lucide-react';
import { Specialization, LanguageCode } from '../types';

interface DiseaseGuideProps {
  onFindSpecialist: (spec: Specialization) => void;
  currentLang: LanguageCode;
}

interface DiseaseInfo {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  specialty: Specialization;
  warningSigns: string[];
  preventiveMeasures: string[];
  diagnosedNote?: string;
  homeFirstAid: string;
  riskLevel: 'High' | 'Medium' | 'Routine';
}

export const DiseaseGuide: React.FC<DiseaseGuideProps> = ({ onFindSpecialist }) => {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('d-1');
  const [searchQuery, setSearchQuery] = useState('');

  const diseases: DiseaseInfo[] = [
    {
      id: 'd-1',
      name: 'High Blood Pressure (Hypertension)',
      hindiName: '  (High BP)',
      category: 'Cardiovascular / Elderly',
      specialty: 'Geriatric Care',
      riskLevel: 'High',
      diagnosedNote: 'Diagnosed in Ramesh Kumar (158/96 mmHg). Requires medication review.',
      warningSigns: [
        'Morning headache in back of the head (occipital)',
        'Dizziness when getting out of cot/bed',
        'Blurred vision or ear buzzing (tinnitus)',
        'Chest heaviness after walking to the field'
      ],
      preventiveMeasures: [
        'Reduce salt in pickles, papads, and curries (max 1 level tsp/day)',
        'Walk 30 minutes daily on flat rural paths',
        'Avoid tobacco chewing, beedi, and alcohol',
        'Never skip daily prescribed BP tablets even if feeling fine'
      ],
      homeFirstAid: 'Sit quietly in shade, loosen collar, drink lukewarm water, do not climb or carry heavy loads. Visit PHC immediately.'
    },
    {
      id: 'd-2',
      name: 'Diabetes & High Blood Sugar',
      hindiName: ' (Sugar  )',
      category: 'Metabolic',
      specialty: 'Diabetologist',
      riskLevel: 'High',
      diagnosedNote: 'Diagnosed in Priya Sharma (Fasting 192 mg/dL). High urgency.',
      warningSigns: [
        'Excessive frequent thirst and dry mouth',
        'Waking up 3+ times at night to urinate',
        'Slow healing of foot cuts, thorns, or boils',
        'Tingling or numbness in feet soles (pins & needles)'
      ],
      preventiveMeasures: [
        'Replace white polished ration rice with local millets (Ragi, Jowar, Bajra)',
        'Avoid sweetened chai, jalebi, and refined flour (maida)',
        'Inspect bare feet daily for hidden cuts or thorns',
        'Take Metformin/insulin at the exact recommended meal time'
      ],
      homeFirstAid: 'Drink plain water, check blood glucose at local ASHA/PHC, never walk barefoot on hot mud or sharp field ground.'
    },
    {
      id: 'd-3',
      name: 'Maternal Anemia & Antenatal Health',
      hindiName: '   (  )',
      category: 'Maternal Care',
      specialty: 'Gynecologist / Obstetrician',
      riskLevel: 'High',
      diagnosedNote: 'Active in Sunita Devi (Week 24 pregnancy, Hemoglobin 10.2 g/dL).',
      warningSigns: [
        'Pale inner lower eyelids, pale tongue, and nails',
        'Extreme exhaustion and breathlessness after minor chores',
        'Swelling in feet, ankles, and face (preeclampsia danger sign)',
        'Severe abdominal cramping or unexpected vaginal spotting'
      ],
      preventiveMeasures: [
        'Take 1 Iron & Folic Acid (IFA) tablet daily with lemon water or amla',
        'Eat green leafy vegetables (Palak, Methi, Moringa/Drumstick leaves)',
        'Include roasted chana, groundnuts, and jaggery (gud) in snacks',
        'Attend all 4 mandatory Antenatal Care (ANC) checkups at the PHC'
      ],
      homeFirstAid: 'Lie down on the left side, rest with feet elevated. Dial 102 Janani Shishu ambulance for any bleeding or severe headache.'
    },
    {
      id: 'd-4',
      name: 'Child Malnutrition & Acute Diarrhea',
      hindiName: '     ()',
      category: 'Pediatric Care',
      specialty: 'Pediatrician',
      riskLevel: 'High',
      diagnosedNote: 'Monitored in Aarav Kumar (Age 4, DPT Booster 2 due).',
      warningSigns: [
        'Watery stools more than 3 times in a single day',
        'Sunken soft spot on head, dry tongue, and crying without tears',
        'Extreme drowsiness or inability to drink water/breastmilk',
        'Loss of arm muscle thickness and swollen belly'
      ],
      preventiveMeasures: [
        'Boil all infant drinking water and let it cool naturally in a clean pot',
        'Wash hands with soap before preparing food and after using latrines',
        'Exclusive breastfeeding for first 6 months without even water',
        'Complete all routine vaccines (Measles, DPT, Polio, Rotavirus)'
      ],
      homeFirstAid: 'Prepare 1 packet ORS in 1 liter clean water; feed small sips after every loose stool. Give Zinc syrup daily for 14 days.'
    },
    {
      id: 'd-5',
      name: 'Seasonal Fevers (Dengue, Malaria, Typhoid)',
      hindiName: ',    ',
      category: 'Infectious',
      specialty: 'General Physician',
      riskLevel: 'Medium',
      diagnosedNote: 'Monitored under Village Panchayat seasonal prevention roster.',
      warningSigns: [
        'Sudden high fever with shaking chills and shivering',
        'Severe pain behind the eyeballs and deep joint aches (breakbone fever)',
        'Red pinpoint rashes on arms or bleeding gums (Dengue warning)',
        'Continuous high fever with stomach pain and tongue coating (Typhoid)'
      ],
      preventiveMeasures: [
        'Sleep under insecticide-treated bed nets every night',
        'Empty and scrub water storage drums and coolers once every week',
        'Fill stagnant puddles around handpumps with sand or spray kerosene',
        'Wear full-sleeve clothes while working in fields at dawn and dusk'
      ],
      homeFirstAid: 'Sponge body with room-temperature water. Take Paracetamol only (never Disprin or Brufen for unknown fevers). Rush to PHC for rapid blood test.'
    },
    {
      id: 'd-6',
      name: 'Osteoarthritis & Chronic Joint Pain',
      hindiName: '     ()',
      category: 'Geriatric Care',
      specialty: 'Geriatric Care',
      riskLevel: 'Routine',
      diagnosedNote: 'Active in Ramesh Kumar (Bilateral knee stiffness).',
      warningSigns: [
        'Cracking sound (crepitus) and stiffness in knees upon waking',
        'Inability to sit cross-legged or squat in Indian-style toilet',
        'Warmth, redness, and swelling around knee or ankle joints',
        'Limping or unsteady gait with fear of falling'
      ],
      preventiveMeasures: [
        'Use raised stool or Western toilet adapter to avoid deep squatting',
        'Gentle daily quadriceps exercises (straight leg raises while seated)',
        'Warm cloth or hot water bottle fomentation for 15 minutes daily',
        'Ensure Calcium and Vitamin D intake through milk, curd, and sunlight'
      ],
      homeFirstAid: 'Apply topical analgesic gel gently without vigorous rubbing. Rest knee; use walking stick for support when walking to the village market.'
    }
  ];

  const filteredDiseases = diseases.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.hindiName.includes(searchQuery) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDisease = diseases.find(d => d.id === selectedDiseaseId) || diseases[0];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Rural Disease Guide & Prevention Handbook (   )
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand common village illnesses, early danger signs, simple home prevention, and when to seek hospital care.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search illness / ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left List of Diseases */}
        <div className="space-y-2 lg:border-r lg:border-slate-100 lg:pr-4">
          {filteredDiseases.map((d) => {
            const isSelected = d.id === activeDisease.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDiseaseId(d.id)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                    {d.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                    {d.hindiName}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Category: {d.category}
                  </span>
                </div>

                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  d.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {d.riskLevel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Detailed Disease & Prevention Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                {activeDisease.category}
              </span>
              {activeDisease.diagnosedNote && (
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Active in Family Record
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {activeDisease.name}
            </h3>
            <p className="text-sm font-bold text-emerald-800 mt-0.5">
              {activeDisease.hindiName}
            </p>

            {activeDisease.diagnosedNote && (
              <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium">
                <strong>Patient Alert:</strong> {activeDisease.diagnosedNote}
              </div>
            )}
          </div>

          {/* Warning Signs */}
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 space-y-2 text-xs">
            <strong className="text-red-900 font-bold block flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Early Danger Warning Signs (  ):
            </strong>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
              {activeDisease.warningSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preventive Measures */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
            <strong className="text-emerald-900 font-bold block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Village & Home Preventive Measures (   ):
            </strong>
            <ul className="space-y-1.5 text-slate-700">
              {activeDisease.preventiveMeasures.map((measure, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* First Aid & Connect Button */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-slate-800 font-bold block mb-0.5">
                First Aid / Immediate Advice:
              </strong>
              <p className="text-slate-600 text-[11px] max-w-md">
                {activeDisease.homeFirstAid}
              </p>
            </div>

            <button
              onClick={() => onFindSpecialist(activeDisease.specialty)}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Find {activeDisease.specialty} →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
