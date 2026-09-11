import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Activity, Search, Volume2, Pill, Heart, CheckCircle2, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

interface DiseaseDirectoryPageProps {
  currentLang: LanguageCode;
  onNavigateToAI: () => void;
  onNavigateToCameraScanner: () => void;
}

export const DiseaseDirectoryPage: React.FC<DiseaseDirectoryPageProps> = ({
  currentLang,
  onNavigateToAI,
  onNavigateToCameraScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [speakingDiseaseId, setSpeakingDiseaseId] = useState<string | null>(null);

  const diseases = [
        {
          id: 'dis-fever', category: 'Common Infections', name: 'Fever',
          commonSigns: 'Raised temperature, chills, sweating, body aches, weakness, or headache.',
          howToControl: 'Drink safe fluids, rest, monitor temperature, and seek a clinician review when fever is persistent or severe.',
          medicines: 'Use only medicines recommended for the person by a healthcare professional. Avoid antibiotics without a prescription.',
          redFlags: 'Confusion, seizure, severe breathing difficulty, stiff neck, dehydration, or fever in a very young baby requires urgent care.',
        },
        {
          id: 'dis-cold', category: 'Respiratory', name: 'Common Cold',
          commonSigns: 'Blocked or runny nose, sneezing, sore throat, cough, and mild fever.',
          howToControl: 'Rest, drink warm fluids, wash hands, and avoid smoke. Most common colds improve with supportive care.',
          medicines: 'Ask a pharmacist or clinician about age-appropriate symptom relief. Do not give aspirin to children.',
          redFlags: 'Breathing difficulty, blue lips, chest pain, dehydration, or symptoms lasting longer than expected needs medical review.',
        },
        {
          id: 'dis-typhoid', category: 'Vector & Infectious', name: 'Typhoid Fever',
          commonSigns: 'Persistent fever, headache, weakness, stomach pain, loss of appetite, or diarrhea/constipation.',
          howToControl: 'Use safe water and food, wash hands, and obtain laboratory testing and treatment from a clinician.',
          medicines: 'Antibiotics must be selected and prescribed by a clinician after evaluation. Do not self-medicate.',
          redFlags: 'Severe abdominal pain, confusion, persistent vomiting, bleeding, or inability to drink requires urgent care.',
        },
        {
          id: 'dis-chikungunya', category: 'Vector & Infectious', name: 'Chikungunya',
          commonSigns: 'Sudden fever, severe joint pain, rash, headache, muscle pain, and tiredness.',
          howToControl: 'Prevent mosquito bites, rest, drink fluids, and obtain a clinical assessment to distinguish it from dengue.',
          medicines: 'Use only clinician-approved fever relief. Avoid aspirin or ibuprofen until dengue has been ruled out.',
          redFlags: 'Bleeding, severe weakness, breathing difficulty, persistent vomiting, or reduced urine requires urgent care.',
        },
        {
          id: 'dis-cancer', category: 'Chronic Lifestyle', name: 'Cancer Warning Signs',
          commonSigns: 'An unexplained lump, persistent bleeding, unexplained weight loss, a changing mole, or a cough that does not improve.',
          howToControl: 'Do not delay evaluation. Screening and early specialist assessment improve treatment choices.',
          medicines: 'Cancer treatment must be planned by an oncology team. Avoid unverified cures or stopping prescribed treatment.',
          redFlags: 'Heavy bleeding, severe pain, breathing difficulty, confusion, or rapidly worsening symptoms requires urgent care.',
        },
    {
      id: 'dis-1',
      category: 'Chronic Lifestyle',
      name: 'High Blood Pressure (  / )',
      commonSigns: 'Morning occipital headaches, dizziness, pounding in chest, blurred vision, ringing in ears.',
      howToControl: 'Reduce salt to less than 1 teaspoon per day. Eliminate pickles, papad, and smoking. Take daily brisk 30-minute walks.',
      medicines: 'Telmisartan 40mg or Amlodipine 5mg once daily as prescribed by PHC doctor. Never stop suddenly.',
      redFlags: 'Chest tightness radiating to arm, sudden facial drooping, severe breathlessness -> Dial 108 Ambulance immediately.',
    },
    {
      id: 'dis-2',
      category: 'Chronic Lifestyle',
      name: 'Type 2 Diabetes Mellitus ( /   )',
      commonSigns: 'Excessive thirst, frequent night urination, unexplained weight loss, slow-healing wounds, tingling in feet.',
      howToControl: 'Replace white polished rice with finger millet (Ragi) and whole grains. Avoid sweets, sugarcane juice, and jaggery in excess.',
      medicines: 'Metformin 500mg with or after meals. Check fasting sugar monthly at Anganwadi / PHC.',
      redFlags: 'Deep rapid breathing, fruity breath odor, persistent vomiting, or extreme drowsiness (Ketoacidosis risk).',
    },
    {
      id: 'dis-3',
      category: 'Maternal & Child',
      name: 'Maternal Nutritional Anemia (  )',
      commonSigns: 'Extreme fatigue, pale inner eyelids and tongue, breathlessness when climbing village steps, spoon-shaped nails.',
      howToControl: 'Eat iron-rich green drumstick (Moringa) leaves, roasted black chana, jaggery, and sesame. Cook in cast-iron kadai.',
      medicines: 'One red Iron & Folic Acid (IFA) tablet daily with lemon water. In severe cases (Hb <7), IV iron sucrose infusion at CHC.',
      redFlags: 'Severe breathlessness at rest, swollen feet, fainting episodes during pregnancy.',
    },
    {
      id: 'dis-4',
      category: 'Maternal & Child',
      name: 'Acute Pediatric Diarrhea & Dehydration (  )',
      commonSigns: 'Watery stools more than 3 times a day, sunken eyes, dry lips, crying without tears, loss of skin pinch elasticity.',
      howToControl: 'Continue uninterrupted breastfeeding. Mix 1 packet ORS in 1 liter clean boiled water; give sips after every loose stool.',
      medicines: 'Oral Rehydration Solution (ORS) + Zinc sulfate tablets (20mg daily for 14 days). Avoid antibiotics without prescription.',
      redFlags: 'Blood in stool, uncontrollable vomiting, extreme lethargy, or convulsions.',
    },
    {
      id: 'dis-5',
      category: 'Vector & Infectious',
      name: 'Dengue & Malarial Fever (   )',
      commonSigns: 'High sudden fever with chills, severe pain behind eyeballs, bone-breaking body aches, rash on skin.',
      howToControl: 'Empty stagnant water from coolers and discarded tires. Sleep under insecticide-treated mosquito nets (ITNs).',
      medicines: 'Paracetamol 500-650mg for fever. Plentiful fluid intake (ORS, coconut water). STRICTLY AVOID Aspirin / Ibuprofen.',
      redFlags: 'Bleeding gums, nosebleeds, black stools, persistent abdominal pain (Platelet crash warning).',
    },
    {
      id: 'dis-6',
      category: 'Skin & Contact',
      name: 'Scabies & Fungal Ringworm (-  )',
      commonSigns: 'Severe intense itching especially at night, circular red scaling rings on groin, armpits, or web spaces of fingers.',
      howToControl: 'Boil bedding and clothes in hot water. Sun-dry thoroughly. Do not share towels or clothes with infected family members.',
      medicines: 'Permethrin 5% lotion for scabies applied from neck down overnight; Clotrimazole 1% cream applied twice daily for ringworm.',
      redFlags: 'Secondary bacterial honey-colored crusts (impetigo), swelling with fever, widespread pus pustules.',
    },
    {
      id: 'dis-7',
      category: 'Respiratory',
      name: 'Tuberculosis ( /  )',
      commonSigns: 'Cough lasting more than 2 weeks, evening low-grade fever with night sweats, chest pain, coughing up blood-stained sputum.',
      howToControl: 'Cover mouth while coughing. Ensure cross-ventilation in rooms. Free sputum testing available at all Primary Health Centres.',
      medicines: 'Government free 6-month Nikshay DOTS regimen. Never stop medicine midway to prevent Drug-Resistant TB.',
      redFlags: 'Coughing up fresh red blood, severe suffocating shortness of breath, rapid wasting.',
    },
    {
      id: 'dis-8',
      category: 'Chronic Lifestyle',
      name: 'Knee Osteoarthritis (   / )',
      commonSigns: 'Severe knee pain on standing, morning joint stiffness lasting under 30 minutes, cracking grating sound (crepitus).',
      howToControl: 'Avoid squatting on floor; use a raised chair or Western toilet adapter. Maintain healthy weight. Seated leg-raise exercises.',
      medicines: 'Paracetamol for mild pain, topical diclofenac gel. Calcium 500mg + Vitamin D3 supplements.',
      redFlags: 'Hot, red, acutely swollen joint with fever (Septic arthritis alert).',
    },
  ];

  const filteredDiseases = diseases.filter((d) => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.commonSigns.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.howToControl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSpeakDisease = (disease: typeof diseases[0]) => {
    if (speakingDiseaseId === disease.id) {
      voiceService.stop();
      setSpeakingDiseaseId(null);
      return;
    }
    const text = `${disease.name}. Common signs: ${disease.commonSigns}. How to control: ${disease.howToControl}. Safe medicines: ${disease.medicines}. Red flags: ${disease.redFlags}.`;
    setSpeakingDiseaseId(disease.id);
    voiceService.speak(text, currentLang, () => setSpeakingDiseaseId(null));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Village Health Encyclopedia & Preventive Measures</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Rural Diseases & Village Prevention Guide
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Understand all common rural diseases, early symptoms, home preventive remedies, safe first-line medicines, and when to rush to the hospital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToCameraScanner}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>📷 Open AI Camera Scanner</span>
            </button>
            <button
              onClick={onNavigateToAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs shadow transition-all"
            >
              <span>Ask AI Any Symptom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any disease, symptom (e.g. fever, blood pressure, rash, cough)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', 'Chronic Lifestyle', 'Maternal & Child', 'Vector & Infectious', 'Skin & Contact', 'Respiratory'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disease Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDiseases.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1">
                    {d.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {d.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleSpeakDisease(d)}
                  className={`p-2 rounded-xl border transition-all ${
                    speakingDiseaseId === d.id
                      ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Listen in Native Language"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Signs */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Common Warning Signs:</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{d.commonSigns}</p>
              </div>

              {/* How to Control */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-950 block">How to Control & Prevent at Home:</span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">{d.howToControl}</p>
              </div>

              {/* Medicines to take */}
              <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200 text-xs space-y-1">
                <span className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-sky-600" />
                  <span>Safe First-Line Medicines & Protocol:</span>
                </span>
                <p className="text-sky-900 leading-relaxed text-[11px]">{d.medicines}</p>
              </div>

              {/* Red Flags */}
              <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200 text-xs space-y-1">
                <span className="font-bold text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>When to Rush to Hospital (Red Flags):</span>
                </span>
                <p className="text-rose-900 leading-relaxed text-[11px]">{d.redFlags}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Verified for Rural PHC Protocols</span>
              <button
                onClick={onNavigateToAI}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Ask AI Specialist</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
