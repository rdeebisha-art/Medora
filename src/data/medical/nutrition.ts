export interface NutritionGuidance {
  category: 'pregnancy' | 'postpartum' | 'newborn' | 'infant' | 'child' | 'elderly' | 'diabetes' | 'hypertension' | 'general';
  title: string;
  keyFoods: string[];
  foodsToAvoid: string[];
  dailyTargets: string[];
  localFoodSuggestions: string[];
  warningSigns: string[];
  source: string;
  isDemo: boolean;
}

export const NUTRITION_GUIDANCE: NutritionGuidance[] = [
  {
    category: 'pregnancy',
    title: 'Pregnancy Nutrition (All Trimesters)',
    keyFoods: [
      'Iron-rich: Spinach (palak), moringa (drumstick leaves), horse gram, jaggery, dried dates',
      'Protein: Lentils (dal), chana, rajma, eggs, small fish (if non-vegetarian)',
      'Calcium: Milk, curd, ragi (finger millet), sesame seeds (til)',
      'Folic acid: Dark green leafy vegetables, groundnuts, banana',
      'Vitamin C (improves iron absorption): Amla, lemon, guava, tomato',
    ],
    foodsToAvoid: [
      'Raw or undercooked meat, fish, or eggs',
      'Unpasteurized milk or soft cheese',
      'Excess salt (risk of swelling and high BP)',
      'Papaya (raw), pineapple (large amounts)',
      'Tea or coffee immediately after IFA tablet (reduces iron absorption)',
      'Alcohol completely',
    ],
    dailyTargets: [
      'Additional 350 kcal/day in 2nd trimester, 450 kcal/day in 3rd trimester',
      'Protein: at least 78g/day during pregnancy',
      'Iron: 27mg/day (supplement with IFA tablet)',
      'Calcium: 1200mg/day',
      'Folate: 600mcg/day',
      'Water: at least 2.5 litres clean boiled water daily',
    ],
    localFoodSuggestions: [
      'Ragi mudde (finger millet balls) — excellent calcium source',
      'Moringa leaf chutney or dal — high iron and vitamin C',
      'Groundnut chikki (jaggery + groundnut) — protein and iron',
      'Banana + jaggery — quick energy and potassium',
      'Horsegram (hurali) soup — traditional iron-rich preparation',
    ],
    warningSigns: [
      'Unable to eat for more than 24 hours (hyperemesis)',
      'Significant weight loss during pregnancy',
      'Extreme swelling of feet and face (pre-eclampsia risk)',
    ],
    source: 'National Institute of Nutrition (NIN), Hyderabad / ICMR',
    isDemo: true,
  },
  {
    category: 'postpartum',
    title: 'New Mother Postpartum Nutrition',
    keyFoods: [
      'Galactagogues (increase breast milk): Fenugreek seeds, fennel, drumstick leaves, garlic in warm dal',
      'Iron recovery: Liver (if non-veg), dark leafy greens, ragi, jaggery',
      'Protein for tissue repair: Lentils, legumes, eggs, fish',
      'Calcium for lactation: Milk, curd, ragi, sesame',
      'Healthy fats: Ghee (1 tsp/day), groundnut, coconut',
    ],
    foodsToAvoid: [
      'Excess caffeine (>200mg/day): passes to breast milk',
      'Raw, cold, or contaminated food (risk of maternal infection)',
      'Strict fasting or crash dieting (reduces milk supply)',
    ],
    dailyTargets: [
      'Additional 500 kcal/day above pre-pregnancy intake during exclusive breastfeeding',
      'Protein: 78g/day',
      'Calcium: 1000mg/day',
      'Water: 3+ litres/day to support milk production',
      'Continue IFA + Calcium tablets for 6 months postpartum',
    ],
    localFoodSuggestions: [
      'Methi ladoo (fenugreek + jaggery + ghee) — traditional galactagogue',
      'Ragi porridge with milk and jaggery — calcium and energy',
      'Drumstick (moringa) sambar — iron, calcium, vitamin C',
      'Warm dal with garlic tadka — protein and lactation support',
    ],
    warningSigns: [
      'Breast pain, redness, or fever >100.4°F (mastitis)',
      'No breast milk after 3-4 days (refer to lactation counsellor)',
      'Extreme fatigue or inability to eat (postpartum depression risk)',
    ],
    source: 'National Institute of Nutrition (NIN) / WHO Postnatal Care Guidelines',
    isDemo: true,
  },
  {
    category: 'newborn',
    title: 'Newborn Feeding (0–28 Days)',
    keyFoods: [
      'EXCLUSIVE BREASTFEEDING ONLY for 0–6 months',
      'Colostrum (first yellow milk) — must NOT be discarded — most important feed',
      'Breastfeed on demand: 8–12 times per 24 hours minimum',
      'Both breasts at each feed',
      'No water, no formula, no honey, no animal milk in first 6 months',
    ],
    foodsToAvoid: [
      'Water (even in hot weather — breast milk provides all hydration)',
      'Formula milk (unless medically prescribed)',
      'Honey (risk of infant botulism)',
      'Animal milk before 12 months',
      'Solid food before 6 months',
      'Gripe water or homemade remedies',
    ],
    dailyTargets: [
      'Minimum 8 feeds per 24 hours',
      'At least 6 wet nappies per 24 hours = adequate hydration',
      'Normal weight gain: 20–30 grams/day after first week',
    ],
    localFoodSuggestions: [
      'No supplemental food for newborn — BREAST MILK ONLY',
      'For mother: warm fluids (dal water, coconut water) to support milk production',
    ],
    warningSigns: [
      'Baby unable to latch or suck',
      'Fewer than 6 wet nappies per day',
      'Baby not regaining birth weight by 2 weeks',
      'Bright yellow jaundice extending to palms and soles',
    ],
    source: 'UNICEF/WHO Baby-Friendly Hospital Initiative / IMNCI Guidelines',
    isDemo: true,
  },
  {
    category: 'child',
    title: 'Child Nutrition (6 months – 5 years)',
    keyFoods: [
      '6–9 months: Mashed dal-rice (khichdi), mashed banana, soft cooked vegetables',
      '1–5 years: Full family meals, milk/curd, eggs, dal, rice/roti, seasonal fruits',
      'Vitamin A sources: Orange/yellow fruits (mango, papaya), leafy vegetables',
      'Iron: Green leafy vegetables + lemon (vitamin C) to improve absorption',
    ],
    foodsToAvoid: [
      'Honey before 12 months',
      'High-salt processed food (chips, namkeen)',
      'High-sugar foods as main nutrition',
      'Choking hazards: Whole nuts for under-3s',
    ],
    dailyTargets: [
      '1–2 years: 3 meals + 2 snacks per day',
      'Vitamin A every 6 months (government supplementation at VHND)',
      'Iron deficiency anaemia screening annually',
    ],
    localFoodSuggestions: [
      'Ragi porridge (satva) — excellent calcium and iron for children',
      'Khichdi (dal + rice) — complete protein and carbohydrate',
      'Groundnut chutney powder — protein-dense condiment',
    ],
    warningSigns: [
      'Child not gaining weight (growth faltering)',
      'Repeated fever with no cause (possible anaemia)',
      'Swollen belly with thin limbs (severe acute malnutrition — emergency)',
    ],
    source: 'ICDS / National Nutrition Mission / MoHFW Infant & Young Child Feeding Guidelines',
    isDemo: true,
  },
  {
    category: 'elderly',
    title: 'Elderly Nutrition (60+ years)',
    keyFoods: [
      'Protein (prevent sarcopenia): Lentils, dal, curd, eggs, small fish, milk',
      'Calcium + Vitamin D: Milk, curd, ragi, til, outdoor sunlight (20 min morning)',
      'Fibre (prevent constipation): Whole grains, fruits, vegetables, plenty of water',
      'Potassium (BP control): Banana, coconut water, leafy greens',
      'Antioxidants: Amla, turmeric, ginger, garlic',
    ],
    foodsToAvoid: [
      'Excess salt (worsens hypertension)',
      'Fried food (worsens cholesterol)',
      'Alcohol (interacts with multiple medicines)',
      'Excess tea/coffee (reduces calcium absorption)',
    ],
    dailyTargets: [
      'Protein: 1.0–1.2g per kg body weight',
      'Calcium: 1200mg/day',
      'Water: 1.5–2L/day (elderly often have reduced thirst sensation)',
      'Smaller more frequent meals (3 meals + 2 small snacks)',
    ],
    localFoodSuggestions: [
      'Ragi mudde — soft, high calcium, easy to swallow',
      'Idli/dosa — soft, fermented, easy digestion',
      'Dal soup — high protein, soft, warming',
      'Tender coconut water — hydration and potassium',
    ],
    warningSigns: [
      'Unintended weight loss >5% in 3 months (malnutrition)',
      'No appetite for >48 hours',
      'Unable to swallow food or liquids (dysphagia)',
    ],
    source: 'National Programme for Health Care of the Elderly (NPHCE) / NIN Hyderabad',
    isDemo: true,
  },
  {
    category: 'diabetes',
    title: 'Diabetes-Friendly Nutrition',
    keyFoods: [
      'Low glycaemic index (GI) staples: Brown rice, whole wheat roti, millets (jowar, bajra, ragi)',
      'High-fibre vegetables: Bitter gourd (karela), drumstick, fenugreek leaves, spinach',
      'Lean protein: Dal, curd (plain), egg whites, fish, soya',
      'Low-sugar fruits (in moderation): Guava, jamun, apple, pear',
    ],
    foodsToAvoid: [
      'White rice in large quantities (high GI)',
      'Sugar, jaggery, honey, sweets, biscuits, cakes',
      'Fruit juices and sugary drinks',
      'Maida (refined flour) products — bread, noodles, poori',
      'Ripe mango, banana, grapes in large amounts',
    ],
    dailyTargets: [
      '3 main meals + 2 small snacks at fixed times daily',
      'Never skip breakfast (risk of hypoglycaemia with medicine)',
      'Portion control: Fill plate ½ vegetables, ¼ grain, ¼ protein',
      'Walk 30 minutes after each meal if possible',
    ],
    localFoodSuggestions: [
      'Ragi (finger millet) porridge — low GI, high fibre',
      'Bitter gourd (karela) sabzi — natural blood sugar reduction',
      'Jowar/bajra roti instead of white rice — lower glycaemic response',
      'Jamun (Indian blackberry) — low GI seasonal fruit',
    ],
    warningSigns: [
      'Shaking, sweating, confusion after skipping meal — low blood sugar',
      'Extreme thirst and frequent urination — high blood sugar',
      'Non-healing wounds on feet (diabetic neuropathy)',
    ],
    source: 'Indian Council of Medical Research (ICMR) Dietary Guidelines for Diabetics',
    isDemo: true,
  },
];

export const getNutritionGuidance = (category: string): NutritionGuidance | undefined => {
  return NUTRITION_GUIDANCE.find(g => g.category === category);
};
