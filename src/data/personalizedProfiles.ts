import { LanguageCode } from '../types';

export interface PersonalizedProfile {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  healthScore: number; // 0 - 100
  healthStatusText: string;
  statusBadgeColor: string;
  summarySentence: string;
  whatTheyWant: {
    goals: string[];
    careNeeds: string[];
  };
  whenToCheckup: {
    urgencyText: string;
    recommendedDate: string;
    daysRemaining: number;
    reason: string;
    nextRoutineScreening: string;
    overdueTasks: string[];
  };
  consultationReminder: {
    doctorName: string;
    specialty: string;
    hospitalName: string;
    date: string;
    time: string;
    daysAway: number;
    phone: string;
    confirmed: boolean;
  };
  medicines: {
    id: string;
    slot: string;
    time: string;
    name: string;
    dosage: string;
    purpose: string;
    instructions: string;
    taken: boolean;
  }[];
  vitalsBreakdown: {
    label: string;
    value: string;
    target: string;
    status: 'High' | 'Normal' | 'Borderline' | 'Due';
  }[];
}

export const PERSONALIZED_PROFILES: Record<string, PersonalizedProfile> = {
  'fam-1': {
    id: 'fam-1',
    name: 'Ramesh Kumar (Grandfather)',
    relationship: 'Grandfather / Senior',
    age: 68,
    gender: 'Male',
    healthScore: 68,
    healthStatusText: 'Needs Medical Attention (  )',
    statusBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    summarySentence: 'Stage 2 Hypertension spike (158/96 mmHg) and missed evening doses. Bilateral knee stiffness limits morning mobility.',
    whatTheyWant: {
      goals: [
        'Bring morning blood pressure below 130/80 mmHg to stop occipital headaches',
        'Relieve bilateral knee osteoarthritis stiffness to walk to village field comfortably',
        'Never miss the evening Telmisartan anti-hypertensive pill after sunset'
      ],
      careNeeds: [
        'Physician dosage review or combination therapy for blood pressure',
        'Topical analgesic and non-weight bearing quadriceps strengthening guidance',
        'Urine microalbuminuria kidney protection lab screen'
      ]
    },
    whenToCheckup: {
      urgencyText: 'Within 2 Days (Immediate Priority)',
      recommendedDate: '2026-09-12',
      daysRemaining: 2,
      reason: 'Consecutive systolic BP readings above 150 mmHg + morning headache warrants doctor evaluation to prevent hypertensive crisis.',
      nextRoutineScreening: 'Blood pressure re-check in 7 days (Sep 17)',
      overdueTasks: ['Urine Microalbuminuria Lab Test (Overdue 10 days)', 'Annual Hypertensive Eye Retinopathy Check']
    },
    consultationReminder: {
      doctorName: 'Dr. Rajeshwar Patil',
      specialty: 'Geriatric Care & General Medicine',
      hospitalName: 'District Civil Hospital & Medical College',
      date: 'Saturday, Sep 12, 2026',
      time: '10:30 AM (Morning OPD)',
      daysAway: 2,
      phone: '+91 98765 43213',
      confirmed: true
    },
    medicines: [
      {
        id: 'r-1',
        slot: 'Morning ()',
        time: '08:00 AM',
        name: 'Amlodipine 5mg',
        dosage: '1 tablet with warm water',
        purpose: 'Vascular relaxation & BP control',
        instructions: 'Take 20 mins after morning roti/poha',
        taken: true
      },
      {
        id: 'r-2',
        slot: 'Afternoon ()',
        time: '01:30 PM',
        name: 'Calcium + Vitamin D3 500mg',
        dosage: '1 tablet post meal',
        purpose: 'Knee bone strength & joint cartilage',
        instructions: 'Take with curd or warm water after lunch',
        taken: true
      },
      {
        id: 'r-3',
        slot: 'Evening ()',
        time: '07:30 PM',
        name: 'Telmisartan 40mg',
        dosage: '1 tablet consistently',
        purpose: 'Overnight arterial protection & kidney safety',
        instructions: 'CRITICAL: Take before dinner; do not skip',
        taken: false
      }
    ],
    vitalsBreakdown: [
      { label: 'Blood Pressure', value: '158/96 mmHg', target: '< 130/80 mmHg', status: 'High' },
      { label: 'Fasting Glucose', value: '118 mg/dL', target: '< 110 mg/dL', status: 'Normal' },
      { label: 'Pulse Rate', value: '76 bpm', target: '60 - 90 bpm', status: 'Normal' },
      { label: 'Medication Adherence', value: '82%', target: '> 90%', status: 'Borderline' }
    ]
  },
  'fam-2': {
    id: 'fam-2',
    name: 'Sunita Devi (Mother)',
    relationship: 'Mother / Self',
    age: 31,
    gender: 'Female',
    healthScore: 88,
    healthStatusText: 'Stable & Progressing Well ()',
    statusBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    summarySentence: 'Week 24 pregnancy (2nd Trimester). Fetal heart sound normal; mild anemia (Hb 10.2 g/dL) actively treated with daily IFA.',
    whatTheyWant: {
      goals: [
        'Raise blood hemoglobin above 11.5 g/dL before entering 3rd trimester',
        'Ensure safe institutional childbirth at Taluk Maternal Centre under JSY scheme',
        'Maintain healthy fetal growth weight without gestational hypertension'
      ],
      careNeeds: [
        'Daily intake of Iron & Folic Acid with lime water / amla',
        'Ultrasound fetal anomaly scan follow-up',
        '2nd dose of Tetanus Toxoid (TT) vaccination'
      ]
    },
    whenToCheckup: {
      urgencyText: 'In 14 Days (Routine Antenatal Visit 3)',
      recommendedDate: '2026-09-24',
      daysRemaining: 14,
      reason: 'Scheduled 26-week gestational growth check and repeat hemoglobin test.',
      nextRoutineScreening: 'Blood pressure & urine protein check at Rampur PHC on Sep 18',
      overdueTasks: ['Dietary protein intake consultation']
    },
    consultationReminder: {
      doctorName: 'Dr. Meera Nambiar',
      specialty: 'Gynecologist / Obstetrician',
      hospitalName: 'Taluk Maternal & Neonatal Care Centre',
      date: 'Thursday, Sep 24, 2026',
      time: '11:15 AM (ANC OPD)',
      daysAway: 14,
      phone: '+91 98765 43212',
      confirmed: true
    },
    medicines: [
      {
        id: 's-1',
        slot: 'Morning ()',
        time: '09:00 AM',
        name: 'Iron & Folic Acid (IFA Red Tablet)',
        dosage: '1 tablet with lemon water',
        purpose: 'Hemoglobin builder & fetal neural protection',
        instructions: 'Never take with tea or milk (blocks absorption)',
        taken: true
      },
      {
        id: 's-2',
        slot: 'Afternoon ()',
        time: '02:00 PM',
        name: 'Calcium Carbonate 500mg',
        dosage: '1 tablet post lunch',
        purpose: 'Fetal skeletal bone development',
        instructions: 'Take 4 hours apart from Iron tablet',
        taken: true
      },
      {
        id: 's-3',
        slot: 'Evening ()',
        time: '08:00 PM',
        name: 'Maternal Micronutrient Supplement',
        dosage: '1 capsule',
        purpose: 'Vitamin B12 & Zinc for fetal vitality',
        instructions: 'Take after night meal',
        taken: true
      }
    ],
    vitalsBreakdown: [
      { label: 'Hemoglobin (Hb)', value: '10.2 g/dL', target: '> 11.5 g/dL', status: 'Borderline' },
      { label: 'Blood Pressure', value: '118/76 mmHg', target: '< 120/80 mmHg', status: 'Normal' },
      { label: 'Fetal Heart Rate', value: '144 bpm', target: '120 - 160 bpm', status: 'Normal' },
      { label: 'Weight Gain', value: '+5.5 kg (24w)', target: 'Normal Curve', status: 'Normal' }
    ]
  },
  'fam-3': {
    id: 'fam-3',
    name: 'Aarav Kumar (Son)',
    relationship: 'Son / Child',
    age: 4,
    gender: 'Male',
    healthScore: 82,
    healthStatusText: 'Healthy with Overdue Booster ( )',
    statusBadgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    summarySentence: 'Active child with normal growth height/weight. DPT Booster 2 vaccination is overdue by 45 days; mild seasonal cough.',
    whatTheyWant: {
      goals: [
        'Complete overdue DPT Booster 2 immunization without delay',
        'Protect from seasonal viral cough and water-borne monsoon diarrhea',
        'Reach Anganwadi green growth band for height and weight'
      ],
      careNeeds: [
        'Catch-up DPT + Polio drops administration at PHC or Anganwadi',
        'Deworming tablet (Albendazole 400mg single dose)',
        'Oral rehydration and Zinc awareness at home'
      ]
    },
    whenToCheckup: {
      urgencyText: 'Within 5 Days (Catch-Up Vaccine Due)',
      recommendedDate: '2026-09-15',
      daysRemaining: 5,
      reason: 'DPT Booster 2 protects against Diphtheria, Pertussis (whooping cough), and Tetanus.',
      nextRoutineScreening: 'Anganwadi monthly weight chart on Sep 20',
      overdueTasks: ['DPT Booster 2 Vaccine (Overdue 45 days)', 'Semi-Annual Vitamin A dose']
    },
    consultationReminder: {
      doctorName: 'Dr. Suresh Kumar',
      specialty: 'Pediatrician',
      hospitalName: 'Navjeevan Children & Maternity Hospital',
      date: 'Tuesday, Sep 15, 2026',
      time: '10:00 AM (Immunization Clinic)',
      daysAway: 5,
      phone: '+91 98765 43211',
      confirmed: true
    },
    medicines: [
      {
        id: 'a-1',
        slot: 'Morning ()',
        time: '08:30 AM',
        name: 'Pediatric Multivitamin Drops',
        dosage: '1 ml with breakfast',
        purpose: 'Immune defense & appetite stimulation',
        instructions: 'Give with breakfast milk/kanji',
        taken: true
      },
      {
        id: 'a-2',
        slot: 'Evening ()',
        time: '06:30 PM',
        name: 'Tulsi-Honey Herbal Cough Syrup',
        dosage: '2.5 ml warm',
        purpose: 'Soothes nighttime dry throat cough',
        instructions: 'Avoid cold water after taking syrup',
        taken: false
      }
    ],
    vitalsBreakdown: [
      { label: 'Weight', value: '15.2 kg', target: '14 - 17 kg (Age 4)', status: 'Normal' },
      { label: 'Height', value: '101 cm', target: '98 - 105 cm', status: 'Normal' },
      { label: 'Immunization Status', value: 'Booster Due', target: 'Up-to-date', status: 'Due' },
      { label: 'Temperature', value: '98.4 °F', target: 'Normal (Afebrile)', status: 'Normal' }
    ]
  },
  'fam-4': {
    id: 'fam-4',
    name: 'Priya Sharma (Aunt)',
    relationship: 'Aunt',
    age: 46,
    gender: 'Female',
    healthScore: 62,
    healthStatusText: 'Elevated Risk - High Sugar ( )',
    statusBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    summarySentence: 'Fasting blood sugar high at 192 mg/dL. 3 missed doses of Metformin this week with reported blurred vision and fatigue.',
    whatTheyWant: {
      goals: [
        'Reduce morning fasting blood sugar below 130 mg/dL',
        'Prevent diabetic eye complications and stop visual blurring',
        'Establish an unshakeable morning/night medicine routine linked to meals'
      ],
      careNeeds: [
        'Urgent Diabetology consultation for insulin or medication titration',
        'HbA1c 3-month average glucose blood test',
        'Diabetic dilated eye fundus screening'
      ]
    },
    whenToCheckup: {
      urgencyText: 'Within 24 - 48 Hours (High Urgency)',
      recommendedDate: '2026-09-11',
      daysRemaining: 1,
      reason: 'Fasting glucose > 180 mg/dL with blurred vision indicates uncontrolled hyperglycemia requiring prescription adjustment.',
      nextRoutineScreening: 'Daily glucometer morning checks',
      overdueTasks: ['HbA1c Blood Test (Due this week)', 'Diabetic Foot Monofilament Sensation Exam']
    },
    consultationReminder: {
      doctorName: 'Dr. Kavitha Reddy',
      specialty: 'Diabetologist',
      hospitalName: 'Mandya Community Health Centre (CHC)',
      date: 'Friday, Sep 11, 2026',
      time: '11:00 AM (Diabetes OPD)',
      daysAway: 1,
      phone: '+91 98765 43214',
      confirmed: true
    },
    medicines: [
      {
        id: 'pr-1',
        slot: 'Morning ()',
        time: '08:00 AM',
        name: 'Metformin 500mg (SR)',
        dosage: '1 tablet with meal',
        purpose: 'Insulin sensitization & glucose reduction',
        instructions: 'Take during or immediately after morning meal',
        taken: true
      },
      {
        id: 'pr-2',
        slot: 'Night ()',
        time: '08:00 PM',
        name: 'Glimepiride 1mg',
        dosage: '1 tablet pre-dinner',
        purpose: 'Stimulates pancreatic insulin secretion',
        instructions: 'Take 15 mins before dinner; eat immediately after',
        taken: false
      }
    ],
    vitalsBreakdown: [
      { label: 'Fasting Sugar', value: '192 mg/dL', target: '< 110 mg/dL', status: 'High' },
      { label: 'Post-Prandial Sugar', value: '248 mg/dL', target: '< 160 mg/dL', status: 'High' },
      { label: 'Blood Pressure', value: '134/86 mmHg', target: '< 130/80 mmHg', status: 'Borderline' },
      { label: 'Medication Adherence', value: '68%', target: '> 90%', status: 'Borderline' }
    ]
  }
};
