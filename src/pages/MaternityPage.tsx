import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Link } from 'react-router-dom';
import { Apple, Search, Calendar, AlertCircle, Droplets, CheckCircle2, ChevronRight, Sparkles, Utensils } from 'lucide-react';

const WARNING_SIGNS = [
  'Heavy vaginal bleeding or spotting',
  'Severe persistent headache or blurred vision (pre-eclampsia indicator)',
  'Sudden swelling of face, hands, or ankles',
  'No fetal movement for 12+ hours (from week 26 onwards)',
  'High fever above 101°F with chills',
  'Severe sharp abdominal or pelvic pain',
  'Sudden leakage of fluid (premature rupture of membranes)',
];

const WEEKLY_TIPS: Record<number, string> = {
  1: 'Take Folic Acid 400–800 mcg daily to prevent neural tube defects.',
  4: 'Implantation stage. Ensure clean boiled water and fresh green vegetables.',
  8: 'First trimester checkup due. Confirm pregnancy with your doctor; take ginger tea for morning sickness.',
  12: 'End of first trimester. Fetal organs are formed. Nausea usually begins to ease.',
  16: 'Baby can hear sounds. Talk and sing to your baby. Iron requirements increase.',
  20: 'Anomaly scan recommended. Rapid bone ossification requires high dietary calcium.',
  24: 'Glucose tolerance test for gestational diabetes. Baby develops sleep-wake cycles.',
  28: 'Third trimester begins. Fetal movements should be felt daily. Count kicks after meals.',
  32: 'Start counting fetal kicks: at least 10 kicks in 2 hours. Eat small frequent meals to prevent heartburn.',
  36: 'Birth preparation. Pack hospital bag. Know signs of true labour vs false contractions.',
  38: 'Baby is full term. Anytime now! Watch for contractions and keep emergency transport ready.',
  40: 'Due date reached. Keep 108 contact ready, stay calm, and rest well with warm fluids.',
};

export interface WeekNutritionDetail {
  weekRange: string;
  trimester: '1st Trimester' | '2nd Trimester' | '3rd Trimester';
  babyMilestone: string;
  babySize: string;
  keyNutrients: string[];
  whatToEat: {
    breakfast: string;
    midMorning: string;
    lunch: string;
    eveningSnack: string;
    dinner: string;
  };
  ruralSuperfoods: string[];
  foodsToAvoid: string[];
  motherWellnessTip: string;
}

export const PREGNANCY_NUTRITION_BY_WEEK: Record<number, WeekNutritionDetail> = {
  // Trimester 1 (Weeks 1-12)
  1: {
    weekRange: 'Weeks 1–4',
    trimester: '1st Trimester',
    babyMilestone: 'Conception, blastocyst implantation, and early embryonic disk formation.',
    babySize: 'Poppy seed (< 1 mm)',
    keyNutrients: ['Folic Acid (400–800 mcg)', 'Zinc', 'Vitamin B6', 'Clean Hydration'],
    whatToEat: {
      breakfast: 'Warm whole wheat idli or oats porridge with warm milk and a pinch of cardamom.',
      midMorning: 'Fresh seasonal fruit (sweet orange, pomegranate or ripe banana) with water.',
      lunch: 'Steamed rice with yellow moong dal, boiled spinach (palak), and homemade curd.',
      eveningSnack: 'Roasted groundnuts or chana with warm water.',
      dinner: 'Soft phulkas/chapati with bottle gourd or pumpkin subzi and light vegetable soup.',
    },
    ruralSuperfoods: ['Sprouted Moong Dal', 'Fresh Drumstick leaves soup', 'Curd/Lassi', 'Tender coconut water'],
    foodsToAvoid: ['Raw or unripe green papaya', 'Unpasteurized milk', 'Excess tea or coffee (>2 cups)', 'Alcohol & smoking completely'],
    motherWellnessTip: 'Start daily Folic Acid tablet immediately to protect your baby’s spine and brain development.',
  },
  5: {
    weekRange: 'Weeks 5–8',
    trimester: '1st Trimester',
    babyMilestone: 'Embryonic heart starts beating; neural tube closes; arm and leg buds emerge.',
    babySize: 'Blueberry to Raspberry (1.5 cm)',
    keyNutrients: ['Vitamin B6 (combats nausea)', 'Folate', 'Magnesium', 'Electrolytes'],
    whatToEat: {
      breakfast: 'Dry toast or warm poha with lemon and roasted peanuts; ginger tea for morning nausea.',
      midMorning: 'A small bowl of fresh curd or coconut water to soothe stomach acidity.',
      lunch: 'Khichdi made with rice, yellow dal, carrots, and cumin ghee, paired with cucumber slices.',
      eveningSnack: 'Roasted makhana (fox nuts) or plain dry biscuits to prevent an empty stomach.',
      dinner: 'Light vegetable dalia (cracked wheat) with stewed ridge gourd and buttermilk.',
    },
    ruralSuperfoods: ['Ginger & Lemon warm water', 'Sprouted lentils', 'Amla (Indian gooseberry)', 'Tender coconut'],
    foodsToAvoid: ['Oily, spicy deep-fried foods', 'Re-heated roadside street food', 'Raw eggs or uncooked meat', 'Chinese salt (Ajinomoto)'],
    motherWellnessTip: 'Eat small, frequent meals every 2 hours to avoid an empty stomach, which triggers morning nausea.',
  },
  9: {
    weekRange: 'Weeks 9–12',
    trimester: '1st Trimester',
    babyMilestone: 'All essential organs and limbs are formed; tiny fingers and facial features appear.',
    babySize: 'Lime or Plum (5.4 cm)',
    keyNutrients: ['Natural Iron + Vitamin C pairing', 'Protein', 'Calcium', 'Phosphorus'],
    whatToEat: {
      breakfast: 'Ragi (Finger Millet) malt or porridge with milk, jaggery, and crushed soaked almonds.',
      midMorning: 'Guava or sweet lime (rich in Vitamin C to maximize iron absorption).',
      lunch: 'Brown or parboiled rice, sambar with drumsticks, cabbage stir-fry, and fresh curd.',
      eveningSnack: 'Boiled sundal (chickpeas/kala chana) seasoned with mustard and curry leaves.',
      dinner: 'Whole wheat chapati with paneer or soya chunk bhurji and warm vegetable broth.',
    },
    ruralSuperfoods: ['Ragi porridge', 'Drumstick (Murungai) sambar', 'Soaked almonds & walnuts', 'Homemade buttermilk'],
    foodsToAvoid: ['Processed canned food', 'High-mercury fish', 'Raw pineapple in excessive amounts', 'Unboiled water'],
    motherWellnessTip: 'Pair iron-rich foods with Vitamin C (like amla or lemon) to enhance natural iron uptake.',
  },
  // Trimester 2 (Weeks 13-27)
  13: {
    weekRange: 'Weeks 13–16',
    trimester: '2nd Trimester',
    babyMilestone: 'Baby begins facial expressions; skeleton starts hardening; mother enters the energy surge stage.',
    babySize: 'Avocado (11 cm)',
    keyNutrients: ['Calcium (1000 mg)', 'High Protein (65–70g)', 'Dietary Fiber', 'Vitamin D'],
    whatToEat: {
      breakfast: 'Moong dal chilla or dosa with mint coriander chutney and boiled egg (or paneer).',
      midMorning: 'Mixed nuts: 4 almonds, 2 walnuts, and 2 dried dates.',
      lunch: 'Mixed millet rice (Thinai or Samai) with rajma or chana curry and beetroot poriyal.',
      eveningSnack: 'Steamed corn cob with lime juice or roasted groundnut chikki.',
      dinner: '2 multi-grain rotis with mixed vegetable dal and a glass of warm milk with turmeric.',
    },
    ruralSuperfoods: ['Finger millet (Ragi)', 'Drumstick leaves (Moringa)', 'Roasted chana', 'Sesame seeds (til)'],
    foodsToAvoid: ['Excess refined sugar and sweets', 'Unwashed raw salad leaves from street vendors', 'Caffeinated sodas'],
    motherWellnessTip: 'Nausea usually subsides now; focus on calcium-rich meals to support your baby’s rapidly hardening bones.',
  },
  17: {
    weekRange: 'Weeks 17–20',
    trimester: '2nd Trimester',
    babyMilestone: 'Baby develops sense of hearing; vernix caseosa protective coating forms; quickening movements felt.',
    babySize: 'Banana / Sweet Potato (16–25 cm)',
    keyNutrients: ['DHA / Omega-3 Fatty Acids', 'Choline', 'Iron', 'Folate'],
    whatToEat: {
      breakfast: 'Vegetable upma with peas, carrots, and peanuts, accompanied by fresh buttermilk.',
      midMorning: 'Fresh pomegranate seeds (rich in iron and antioxidants) or ripe papaya.',
      lunch: 'Rice with horsegram (kollu/kulthi) dal, fenugreek greens (methi subzi), and curd.',
      eveningSnack: 'Sprouted green gram salad with tomato, lemon, and a pinch of roasted jeera.',
      dinner: 'Chapati with egg curry (or tofu paneer for vegetarians) and bottle gourd soup.',
    },
    ruralSuperfoods: ['Walnuts & groundnuts', 'Methi (fenugreek) leaves', 'Horsegram soup', 'Curd & lassi'],
    foodsToAvoid: ['Raw sprouted pulses that are not freshly boiled', 'Trans fats and vanaspati', 'Excess salt'],
    motherWellnessTip: 'Talk and play soothing music to your belly—baby’s auditory nerves are actively responding to sound!',
  },
  21: {
    weekRange: 'Weeks 21–24',
    trimester: '2nd Trimester',
    babyMilestone: 'Baby’s taste buds developing; rapid lung surfactant preparation; mother needs glucose screening test.',
    babySize: 'Ear of Corn / Papaya (30 cm, ~600g)',
    keyNutrients: ['Low Glycemic Index Complex Carbohydrates', 'Iron', 'Calcium', 'Water & Fiber'],
    whatToEat: {
      breakfast: 'Ragi idli or whole wheat paratha stuffed with grated radish/paneer and homemade curd.',
      midMorning: 'Tender coconut water and a small handful of roasted pumpkin seeds.',
      lunch: 'Steamed brown rice with spinach dal, snake gourd kootu, and a glass of spiced chaas.',
      eveningSnack: 'Boiled sweet potato with black salt and lemon juice.',
      dinner: '2 bajra or jowar rotis with dal tadka and stewed green beans.',
    },
    ruralSuperfoods: ['Moringa leaf soup', 'Tender coconut water', 'Sweet potato', 'Buttermilk with cumin'],
    foodsToAvoid: ['Sugary sweets, jalebi, bakery biscuits (prevents gestational diabetes spikes)', 'Refined maida products'],
    motherWellnessTip: 'Drink 2.5 to 3 litres of clean boiled water daily to maintain healthy amniotic fluid levels.',
  },
  25: {
    weekRange: 'Weeks 25–28',
    trimester: '2nd Trimester',
    babyMilestone: 'Baby opens eyes; brain wave activity begins; transitions into the third trimester.',
    babySize: 'Eggplant / Cauliflower (37 cm, ~1 kg)',
    keyNutrients: ['Magnesium & Potassium (prevents leg cramps)', 'Iron', 'Fiber (prevents constipation)'],
    whatToEat: {
      breakfast: 'Oats or broken wheat kheer cooked with milk and jaggery, topped with crushed chia seeds.',
      midMorning: 'Ripe banana (high potassium to prevent nighttime calf cramps) and a glass of water.',
      lunch: 'Rice with toor dal, moringa drumstick curry, raw banana fry, and thick curd.',
      eveningSnack: 'Puffed rice (bhel) with chopped tomatoes, coriander, boiled peas, and lemon.',
      dinner: 'Soft chapatis with mixed vegetable stew and a warm turmeric-cinnamon milk cup.',
    },
    ruralSuperfoods: ['Banana with milk', 'Drumstick pods', 'Chia / Flax seeds', 'Curd and homemade butter'],
    foodsToAvoid: ['Excess table salt (to avoid swollen feet and high blood pressure)', 'Carbonated drinks'],
    motherWellnessTip: 'If experiencing leg cramps, stretch your calves before bed and stay well-hydrated throughout the day.',
  },
  // Trimester 3 (Weeks 29-40)
  29: {
    weekRange: 'Weeks 29–32',
    trimester: '3rd Trimester',
    babyMilestone: 'Rapid weight gain; bones absorb massive amounts of maternal calcium; baby turns head-down.',
    babySize: 'Butternut Squash / Pineapple (42 cm, ~1.7 kg)',
    keyNutrients: ['Calcium (1200 mg/day)', 'Iron (IFA tablet daily)', 'High Protein', 'DHA'],
    whatToEat: {
      breakfast: 'Ragi adai or vegetable stuffed cheela with tomato chutney and 1 boiled egg or paneer.',
      midMorning: 'Seasonal apple or pear slices with a cup of warm milk.',
      lunch: 'Whole grain rice, dal with palak, ladies finger (okra) stir-fry, and fresh curd.',
      eveningSnack: 'Til (sesame) ladoo with jaggery or roasted flax seeds with peanuts.',
      dinner: 'Light moong dal khichdi with ghee and steamed bottle gourd.',
    },
    ruralSuperfoods: ['Ragi Mudde (Finger Millet Ball)', 'Til (Sesame) Chikki', 'Sundal', 'Fresh Cow Milk'],
    foodsToAvoid: ['Heavy oily meals late at night (causes acid reflux / heartburn)', 'Raw unboiled milk'],
    motherWellnessTip: 'Eat 5 to 6 small mini-meals rather than 3 large heavy meals to reduce stomach compression and heartburn.',
  },
  33: {
    weekRange: 'Weeks 33–36',
    trimester: '3rd Trimester',
    babyMilestone: 'Baby’s lungs mature; immune antibodies pass from mother; skull bones remain soft for delivery.',
    babySize: 'Cantaloupe / Papaya (47 cm, ~2.5 kg)',
    keyNutrients: ['Vitamin K', 'Zinc', 'Protein', 'Electrolytes'],
    whatToEat: {
      breakfast: 'Steamed idlis with coconut chutney and sambar loaded with vegetables.',
      midMorning: 'Fresh tender coconut water with pulp or ripe pomegranate.',
      lunch: 'Parboiled rice with fish curry (or soya-paneer curry), drumstick leaves thoran, and curd.',
      eveningSnack: 'Makhana roasted in ghee or boiled sweet corn.',
      dinner: '2 phulkas with dal palak, raw carrot sticks, and warm cardamom milk.',
    },
    ruralSuperfoods: ['Fresh Moringa leaves', 'Tender coconut pulp', 'Ghee in moderation', 'Soaked dates'],
    foodsToAvoid: ['Processed packaged salty snacks', 'Gas-inducing cabbage/radish in excessive amounts at night'],
    motherWellnessTip: 'Count baby kicks daily: you should feel at least 10 active kicks/movements within a 2-hour window.',
  },
  37: {
    weekRange: 'Weeks 37–40',
    trimester: '3rd Trimester',
    babyMilestone: 'Full term pregnancy! Baby descends into pelvic canal; ready for labor and childbirth.',
    babySize: 'Watermelon (50 cm, ~3.2 kg)',
    keyNutrients: ['Easily Digestible Carbohydrates', 'Iron Reserves', 'Adequate Hydration', 'Fiber'],
    whatToEat: {
      breakfast: 'Warm soft rice kanji (porridge) with a teaspoon of ghee and light dal.',
      midMorning: '2 to 3 soft soaked dates (scientifically shown to aid cervical ripening) and warm water.',
      lunch: 'Steamed rice with rasam, yellow moong dal, snake gourd, and fresh buttermilk.',
      eveningSnack: 'Steamed banana or light vegetable soup.',
      dinner: 'Soft phulkas or idli with mild vegetable broth and warm milk with dry ginger.',
    },
    ruralSuperfoods: ['Warm Rice Kanji with Ghee', 'Dry Dates (Khajoor)', 'Pepper Rasam for digestion', 'Curd & Buttermilk'],
    foodsToAvoid: ['Heavy non-vegetarian or oily feasts', 'Constipation-causing dry foods', 'Excess chili'],
    motherWellnessTip: 'Keep your hospital bag, Mother-Child Protection (MCP) card, and 108 emergency ambulance contact readily accessible!',
  },
};

export default function MaternityPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);

  // Default to patient's recorded pregnancy weeks, or 24 as a representative mid-pregnancy baseline
  const [typedWeek, setTypedWeek] = useState<number>(24);
  const [searchFilter, setSearchFilter] = useState<string>('');

  useEffect(() => {
    if (currentUser?.role === 'patient') {
      db.patients.get(currentUser.id).then((p) => {
        if (p) {
          setPatient(p);
          if (p.pregnancyWeeks && p.pregnancyWeeks >= 1 && p.pregnancyWeeks <= 40) {
            setTypedWeek(p.pregnancyWeeks);
          }
        }
      });
    }
  }, [currentUser]);

  const patientWeeks = patient?.pregnancyWeeks || 28;
  const patientTrimester = patientWeeks <= 12 ? '1st' : patientWeeks <= 26 ? '2nd' : '3rd';
  const tip =
    Object.entries(WEEKLY_TIPS)
      .filter(([w]) => parseInt(w) <= patientWeeks)
      .pop()?.[1] || WEEKLY_TIPS[28];

  // Resolve nutrition data based on typedWeek (find closest matched key bracket)
  const currentNutrition = useMemo(() => {
    const validWeek = Math.max(1, Math.min(40, typedWeek || 1));
    const sortedKeys = Object.keys(PREGNANCY_NUTRITION_BY_WEEK)
      .map(Number)
      .sort((a, b) => a - b);
    let matchedKey = sortedKeys[0];
    for (const key of sortedKeys) {
      if (key <= validWeek) {
        matchedKey = key;
      } else {
        break;
      }
    }
    return PREGNANCY_NUTRITION_BY_WEEK[matchedKey] || PREGNANCY_NUTRITION_BY_WEEK[1];
  }, [typedWeek]);

  const handleWeekChange = (val: number) => {
    const clamped = Math.max(1, Math.min(40, val || 1));
    setTypedWeek(clamped);
  };

  const quickWeekButtons = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#DB2777] flex items-center gap-2">
              <span>🤰</span>
              <span>{t('maternity.title')} & Nutrition Guide</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comprehensive Maternal & Fetal Nutrition for Rural Indian Families
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Patient Pregnancy Card */}
        {patient?.isPregnant && (
          <div className="bg-[#FDF2F8] border border-[#DB2777]/30 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤰</span>
              <div className="flex-1">
                <div className="font-extrabold text-[#DB2777] text-base">{patient.name}</div>
                <div className="text-xs text-[#0F172A] font-medium">
                  Week {patientWeeks} · {patientTrimester} Trimester
                </div>
                <div className="w-full bg-pink-100 rounded-full h-2.5 mt-2 overflow-hidden border border-pink-200">
                  <div
                    className="bg-[#DB2777] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(patientWeeks / 40) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
                  <span>{40 - patientWeeks} weeks remaining</span>
                  <button
                    onClick={() => handleWeekChange(patientWeeks)}
                    className="text-[#DB2777] font-bold underline hover:opacity-80"
                  >
                    View My Current Week Nutrition
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Tip Banner */}
        <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl p-4 shadow-2xs">
          <h2 className="font-extrabold text-[#2563EB] text-xs mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Week {patientWeeks} Clinical Milestone</span>
          </h2>
          <p className="text-xs text-[#0F172A] leading-relaxed">{tip}</p>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE WEEK-BY-WEEK DIETARY & NUTRITION FINDER */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-[#DB2777]/30 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-2">
            <div>
              <h2 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#DB2777]" />
                <span>What to Eat: Weekly Nutrition Finder</span>
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Type any pregnancy week (1–40) or tap quick weeks to see what to eat
              </p>
            </div>
            <span className="text-xs bg-pink-100 text-[#DB2777] font-extrabold px-2.5 py-1 rounded-full">
              Week {typedWeek} of 40
            </span>
          </div>

          {/* Quick Week Search & Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Type or select pregnancy week:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Week</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={typedWeek}
                  onChange={(e) => handleWeekChange(parseInt(e.target.value, 10))}
                  placeholder="Enter week (1-40)"
                  className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DB2777] focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleWeekChange(typedWeek - 1)}
                disabled={typedWeek <= 1}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs disabled:opacity-40"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                onClick={() => handleWeekChange(typedWeek + 1)}
                disabled={typedWeek >= 40}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs disabled:opacity-40"
              >
                Next ▶
              </button>
            </div>

            {/* Quick Week Tap Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
              <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">Quick Weeks:</span>
              {quickWeekButtons.map((wk) => (
                <button
                  key={wk}
                  type="button"
                  onClick={() => handleWeekChange(wk)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 transition-all ${
                    typedWeek === wk
                      ? 'bg-[#DB2777] text-white shadow-xs'
                      : 'bg-pink-50 text-[#DB2777] hover:bg-pink-100 border border-pink-200'
                  }`}
                >
                  W{wk}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Nutritional Card for the Selected Week */}
          <div className="bg-gradient-to-br from-pink-50/60 via-purple-50/30 to-rose-50/50 rounded-xl p-3.5 border border-pink-200/80 space-y-3">
            {/* Stage & Milestone Summary */}
            <div className="flex items-start justify-between gap-2 border-b border-pink-200/60 pb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full">
                  {currentNutrition.trimester} · {currentNutrition.weekRange}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Baby Size: {currentNutrition.babySize}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  {currentNutrition.babyMilestone}
                </p>
              </div>
            </div>

            {/* Key Nutrients Needed */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <span>🌟 Key Essential Nutrients for Week {typedWeek}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentNutrition.keyNutrients.map((nut, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-white border border-pink-200 text-pink-800 font-semibold px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    {nut}
                  </span>
                ))}
              </div>
            </div>

            {/* Meal Plan: What to Eat Throughout the Day */}
            <div className="bg-white/80 rounded-xl p-3 border border-pink-100 space-y-2">
              <div className="text-xs font-black text-[#DB2777] flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>Recommended Daily What to Eat Menu (Week {typedWeek}):</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">🌅 Breakfast:</span>
                  <span className="text-slate-600">{currentNutrition.whatToEat.breakfast}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">🍎 Mid-Morning:</span>
                  <span className="text-slate-600">{currentNutrition.whatToEat.midMorning}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">🍛 Lunch:</span>
                  <span className="text-slate-600">{currentNutrition.whatToEat.lunch}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">☕ Evening Snack:</span>
                  <span className="text-slate-600">{currentNutrition.whatToEat.eveningSnack}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">🌙 Dinner:</span>
                  <span className="text-slate-600">{currentNutrition.whatToEat.dinner}</span>
                </div>
              </div>
            </div>

            {/* Rural Indian Wholesome Superfoods */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
              <div className="text-xs font-black text-emerald-800 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Wholesome Village Superfoods for Week {typedWeek}:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-emerald-900">
                {currentNutrition.ruralSuperfoods.map((food, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to Avoid & Mother's Health Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5">
                <span className="font-bold text-red-700 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Foods to Avoid:</span>
                </span>
                <ul className="space-y-1 text-red-900 text-[11px]">
                  {currentNutrition.foodsToAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-red-500">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mother's Daily Tip:</span>
                </span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  {currentNutrition.motherWellnessTip}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Antenatal Checkup Milestones */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#0F172A] text-sm mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>📅 {t('maternity.antenatal')}</span>
          </h2>
          {[
            { label: 'First Visit (< 12 weeks): Blood, Urine, Dating Scan, TT-1', done: patientWeeks > 12 },
            { label: 'Second Visit (14–26 weeks): Anomaly Scan, Weight & BP check', done: patientWeeks > 20 },
            { label: 'Third Visit (28–34 weeks): Glucose Tolerance & TT Booster', done: patientWeeks > 28 },
            { label: 'Fourth Visit (36+ weeks): Fetal Presentation & Birth Planning', done: patientWeeks > 36 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#E2E8F0] last:border-0">
              <span>{item.done ? '✅' : '📅'}</span>
              <span
                className={`text-xs ${
                  item.done ? 'text-[#16A34A] font-semibold line-through' : 'text-[#0F172A]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Red Flag Warning Signs */}
        <div className="bg-[#FEF2F2] border border-[#DC2626]/30 rounded-2xl p-4 shadow-xs">
          <h2 className="font-extrabold text-[#DC2626] text-sm mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>⚠️ {t('maternity.warningSigns')}</span>
          </h2>
          <div className="space-y-1">
            {WARNING_SIGNS.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#B91C1C] py-0.5">
                <span className="flex-shrink-0 text-red-500 font-bold">🔴</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <Link
            to="/emergency"
            className="block w-full mt-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-center py-3 rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            🚨 Immediate 108 Emergency Medical Assistance
          </Link>
        </div>
      </div>
    </Layout>
  );
}
