import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  FileText,
  Pill,
  Stethoscope,
  Building2,
  Activity,
  Users,
  PhoneCall,
  ArrowRight,
  Sparkles,
  Calendar,
  ShieldAlert,
  Syringe,
  Globe,
  Radio,
  Image,
  Clock,
  Landmark,
  BookOpen,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import { MEDICAL_DISEASES } from '../data/medical/diseases';
import { REFERENCE_MEDICINES_DATASET } from '../data/medical/medicinesDataset';
import { DEMO_HEALTHCARE_TEAM } from '../data/doctorsDataset';
import { HEALTHCARE_FACILITIES } from '../data/medical/facilities';

export type SearchCategory =
  | 'record'
  | 'medicine'
  | 'symptom'
  | 'doctor'
  | 'hospital'
  | 'family'
  | 'feature'
  | 'emergency';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  categoryLabel: string;
  route: string;
  icon: React.ReactNode;
  keywords: string[];
  badge?: string;
  badgeColor?: string;
}

interface MedoraSearchBarProps {
  variant?: 'header' | 'mobile' | 'hero' | 'standalone';
  className?: string;
  showChips?: boolean;
}

export const MedoraSearchBar: React.FC<MedoraSearchBarProps> = ({
  variant = 'header',
  className = '',
  showChips = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, currentUser } = useAppStore();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [userRecords, setUserRecords] = useState<SearchResultItem[]>([]);
  const [userMedicines, setUserMedicines] = useState<SearchResultItem[]>([]);
  const [userAppointments, setUserAppointments] = useState<SearchResultItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Fetch local IndexedDB patient records & medicines for current session
  useEffect(() => {
    let isMounted = true;
    async function loadLocalDbData() {
      try {
        const patId = currentUser?.role === 'patient' ? currentUser.id : undefined;

        // 1. User Prescribed Medicines
        const dbMeds = patId
          ? await db.medicines.where({ patientId: patId }).toArray()
          : await db.medicines.limit(5).toArray();

        const medItems: SearchResultItem[] = dbMeds.map((m) => ({
          id: `db-med-${m.id}`,
          title: `${m.name} (${m.dose})`,
          subtitle: `${m.frequency} • Prescribed by ${m.doctor} • Status: ${m.status}`,
          category: 'medicine',
          categoryLabel: t('nav.medicines', 'Medicines & Reminders'),
          route: `/medicines?search=${encodeURIComponent(m.name)}`,
          icon: <Pill size={16} className="text-emerald-600" />,
          keywords: [m.name, m.dose, m.doctor, 'medicine', 'prescription', 'pill', 'tablet'],
          badge: m.status === 'active' ? 'Active Dose' : 'Paused',
          badgeColor: m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700',
        }));

        // 2. User Medical Records
        const dbRecs = patId
          ? await db.medicalRecords.where({ patientId: patId }).toArray()
          : await db.medicalRecords.limit(6).toArray();

        const recordItems: SearchResultItem[] = dbRecs.map((r) => {
          const d = (r.data || {}) as Record<string, any>;
          const diagnosis = d.diagnosis || d.title || d.testType || r.type;
          const doctorName = d.doctor || d.facility || 'Clinical Team';
          return {
            id: `db-rec-${r.id}`,
            title: String(diagnosis),
            subtitle: `${r.date} • ${doctorName} • Type: ${r.type}`,
            category: 'record',
            categoryLabel: t('records.title', 'Medical Records'),
            route: `/records?search=${encodeURIComponent(String(diagnosis))}`,
            icon: <FileText size={16} className="text-blue-600" />,
            keywords: [String(diagnosis), String(doctorName), r.type, 'record', 'report', 'lab'],
            badge: r.type.toUpperCase(),
            badgeColor: 'bg-blue-100 text-blue-800',
          };
        });

        // 3. User Appointments
        const dbAppts = patId
          ? await db.appointments.where({ patientId: patId }).toArray()
          : await db.appointments.limit(4).toArray();

        const docMap = new Map(DEMO_HEALTHCARE_TEAM.map((d) => [Number(d.id.replace(/\D/g, '')) || 1, d]));

        const apptItems: SearchResultItem[] = dbAppts.map((a) => {
          const doc = docMap.get(a.doctorId) || DEMO_HEALTHCARE_TEAM[0];
          const doctorName = doc?.name || `Doctor #${a.doctorId}`;
          const specialty = doc?.specialty || 'General Medicine';
          return {
            id: `db-appt-${a.id}`,
            title: `Appointment with ${doctorName}`,
            subtitle: `${a.date} • ${specialty} • Reason: ${a.reason || 'Routine Checkup'}`,
            category: 'doctor',
            categoryLabel: t('appointments.title', 'Appointments'),
            route: '/appointments',
            icon: <Calendar size={16} className="text-indigo-600" />,
            keywords: [doctorName, specialty, a.reason || '', 'appointment', 'visit', 'doctor'],
            badge: a.status.toUpperCase(),
            badgeColor: a.status === 'scheduled' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800',
          };
        });

        if (isMounted) {
          setUserMedicines(medItems);
          setUserRecords(recordItems);
          setUserAppointments(apptItems);
        }
      } catch (err) {
        console.error('Error loading search DB data:', err);
      }
    }

    loadLocalDbData();
    return () => {
      isMounted = false;
    };
  }, [currentUser, t]);

  // Static searchable dataset across all Medora modules
  const staticIndex: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // --- 1. CORE EXISTING MEDORA FEATURES & TOOLS ---
    const features = [
      {
        id: 'feat-records',
        title: 'Medical Records & History',
        subtitle: 'View clinical records, lab results, prescriptions, and vital histories',
        category: 'record' as const,
        route: '/records',
        icon: <FileText size={16} className="text-blue-600" />,
        keywords: ['records', 'medical records', 'history', 'prescriptions', 'reports', 'lab test', 'மருத்துவ பதிவுகள்', 'मेडिकल रिकॉर्ड'],
        badge: 'Records',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        id: 'feat-report-scanner',
        title: 'Medical Report Scanner',
        subtitle: 'Scan blood tests, discharge summaries, and lab papers with OCR',
        category: 'record' as const,
        route: '/report-scanner',
        icon: <FileText size={16} className="text-purple-600" />,
        keywords: ['report scanner', 'scan report', 'ocr', 'blood test', 'lab report', 'அறிக்கை ஸ்கேனர்', 'रिपोर्ट स्कैनर'],
        badge: 'Tool',
        badgeColor: 'bg-purple-100 text-purple-800',
      },
      {
        id: 'feat-xray-viewer',
        title: 'X-Ray & Radiography Viewer',
        subtitle: 'Inspect chest PA views, fractures, and radiographic findings',
        category: 'record' as const,
        route: '/xray-viewer',
        icon: <Image size={16} className="text-slate-600" />,
        keywords: ['xray', 'x-ray', 'radiology', 'chest scan', 'fracture', 'எக்ஸ்ரே', 'एक्स-रे'],
        badge: 'Imaging',
        badgeColor: 'bg-slate-100 text-slate-800',
      },
      {
        id: 'feat-medicines',
        title: 'Medicines & Pill Reminders',
        subtitle: 'Prescribed medications, schedules, missed dosage alerts, and refill timings',
        category: 'medicine' as const,
        route: '/medicines',
        icon: <Pill size={16} className="text-emerald-600" />,
        keywords: ['medicines', 'pills', 'reminders', 'dosage', 'drugs', 'prescriptions', 'doses', 'மருந்துகள்', 'दवाएं'],
        badge: 'Medication',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        id: 'feat-health-tests',
        title: 'Health Vitals & Tests',
        subtitle: 'Log Blood Pressure, Blood Sugar, SpO2, Temperature, and Pulse',
        category: 'record' as const,
        route: '/health-tests',
        icon: <Activity size={16} className="text-teal-600" />,
        keywords: ['vitals', 'blood pressure', 'bp', 'sugar', 'glucose', 'spo2', 'pulse', 'tests', 'உடல் நலம்', 'स्वास्थ्य परीक्षण'],
        badge: 'Vitals',
        badgeColor: 'bg-teal-100 text-teal-800',
      },
      {
        id: 'feat-family',
        title: 'Family Health Portal',
        subtitle: 'Household health tracking for children, pregnant mothers, and elderly members',
        category: 'family' as const,
        route: '/family',
        icon: <Users size={16} className="text-indigo-600" />,
        keywords: ['family', 'household', 'children', 'mother', 'elderly', 'members', 'குடும்பம்', 'परिवार'],
        badge: 'Family',
        badgeColor: 'bg-indigo-100 text-indigo-800',
      },
      {
        id: 'feat-maternity',
        title: 'Maternity Care (Janani Hub)',
        subtitle: 'Trimester checkups, ANC visits, iron supplements, and delivery planning',
        category: 'family' as const,
        route: '/maternity',
        icon: <Users size={16} className="text-rose-600" />,
        keywords: ['maternity', 'pregnancy', 'pregnant', 'anc', 'trimester', 'baby', 'delivery', 'கர்ப்பம்', 'मातृत्व'],
        badge: 'Maternal',
        badgeColor: 'bg-rose-100 text-rose-800',
      },
      {
        id: 'feat-childcare',
        title: 'Child Care & Growth Tracking',
        subtitle: 'Pediatric nutrition, milestones, dehydration, and wellness checks',
        category: 'family' as const,
        route: '/childcare',
        icon: <Users size={16} className="text-sky-600" />,
        keywords: ['child', 'childcare', 'pediatric', 'baby', 'growth', 'குழந்தை நலம்', 'बाल देखभाल'],
        badge: 'Pediatric',
        badgeColor: 'bg-sky-100 text-sky-800',
      },
      {
        id: 'feat-elderly',
        title: 'Elderly Care & Chronic Monitoring',
        subtitle: 'Hypertension, mobility, geriatric support, arthritis, and routine care',
        category: 'family' as const,
        route: '/elderly',
        icon: <Users size={16} className="text-amber-600" />,
        keywords: ['elderly', 'geriatric', 'grandparents', 'seniors', 'chronic', 'மூத்தோர் நலம்', 'बुजुर्ग देखभाल'],
        badge: 'Geriatric',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        id: 'feat-vaccination',
        title: 'UIP Immunization & Vaccines',
        subtitle: 'Universal Immunization Programme schedule, Polio, BCG, Hepatitis B, TT',
        category: 'feature' as const,
        route: '/vaccination',
        icon: <Syringe size={16} className="text-teal-600" />,
        keywords: ['vaccination', 'vaccine', 'immunization', 'polio', 'bcg', 'pentavalent', 'tt booster', 'தடுப்பூசி', 'टीकाकरण'],
        badge: 'Immunization',
        badgeColor: 'bg-teal-100 text-teal-800',
      },
      {
        id: 'feat-doctors',
        title: 'Doctor Directory & Teleconsultation',
        subtitle: 'PHC medical officers, community specialists, and consultation bookings',
        category: 'doctor' as const,
        route: '/doctor-portal',
        icon: <Stethoscope size={16} className="text-blue-600" />,
        keywords: ['doctor', 'physician', 'specialist', 'consultation', 'telemedicine', 'மருத்துவர்', 'डॉक्टर'],
        badge: 'Doctors',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        id: 'feat-appointments',
        title: 'Book & View Appointments',
        subtitle: 'Schedule visits with primary health centre and taluk hospital doctors',
        category: 'doctor' as const,
        route: '/appointments',
        icon: <Calendar size={16} className="text-emerald-600" />,
        keywords: ['appointments', 'booking', 'schedule', 'doctor visit', 'opd', 'நேர நியமனம்', 'अपॉइंटमेंट'],
        badge: 'Appointments',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        id: 'feat-doctor-summary',
        title: 'Doctor Consultation Summary',
        subtitle: 'Clinical handoff summaries, doctor verification notes, and referrals',
        category: 'doctor' as const,
        route: '/doctor-summary',
        icon: <FileText size={16} className="text-blue-600" />,
        keywords: ['doctor summary', 'clinical handoff', 'doctor notes', 'referral', 'மருத்துவர் சுருக்கம்', 'डॉक्टर सारांश'],
        badge: 'Clinical',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        id: 'feat-hospitals',
        title: 'Hospitals & Emergency Directory',
        subtitle: 'Local Primary Health Centres (PHCs), Taluk CHCs, and District Hospitals',
        category: 'hospital' as const,
        route: '/hospitals',
        icon: <Building2 size={16} className="text-blue-600" />,
        keywords: ['hospital', 'clinic', 'phc', 'chc', 'medical centre', 'district hospital', 'மருத்துவமனை', 'अस्पताल'],
        badge: 'Hospitals',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        id: 'feat-emergency',
        title: 'Emergency Help & 108 Ambulance Dispatch',
        subtitle: 'Immediate red-flag life safety, 108 calling guide, and emergency first aid',
        category: 'emergency' as const,
        route: '/emergency',
        icon: <ShieldAlert size={16} className="text-red-600 animate-pulse" />,
        keywords: ['emergency', 'ambulance', '108', '112', 'accident', 'first aid', 'bleeding', 'choking', 'அவசர உதவி', 'आपातकाल'],
        badge: 'EMERGENCY',
        badgeColor: 'bg-red-600 text-white font-black',
      },
      {
        id: 'feat-transport',
        title: 'Medical Transport & Ambulance Transit',
        subtitle: 'Rural ambulance coordination, distance to facilities, and transit routes',
        category: 'hospital' as const,
        route: '/transport',
        icon: <Building2 size={16} className="text-amber-600" />,
        keywords: ['transport', 'ambulance transit', 'van', 'vehicle', 'evacuation', 'போக்குவரத்து', 'परिवहन'],
        badge: 'Transport',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        id: 'feat-schemes',
        title: 'Government Health Schemes',
        subtitle: 'Ayushman Bharat PM-JAY, Janani Suraksha Yojana, state subsidies, and benefits',
        category: 'feature' as const,
        route: '/schemes',
        icon: <Landmark size={16} className="text-indigo-600" />,
        keywords: ['schemes', 'government', 'pm-jay', 'ayushman bharat', 'insurance', 'subsidy', 'அரசு திட்டங்கள்', 'सरकारी योजनाएं'],
        badge: 'Govt Schemes',
        badgeColor: 'bg-indigo-100 text-indigo-800',
      },
      {
        id: 'feat-education',
        title: 'Health Education & Disease Guides',
        subtitle: 'Preventive healthcare, sanitation, nutrition, clean water, and fever care',
        category: 'feature' as const,
        route: '/education',
        icon: <BookOpen size={16} className="text-teal-600" />,
        keywords: ['education', 'guide', 'disease prevention', 'nutrition', 'hygiene', 'diet', 'சுகாதார வழிகாட்டி', 'स्वास्थ्य शिक्षा'],
        badge: 'Education',
        badgeColor: 'bg-teal-100 text-teal-800',
      },
      {
        id: 'feat-language-bridge',
        title: 'Multilingual Clinical Language Bridge',
        subtitle: 'Doctor-patient translation between Tamil, Telugu, Hindi, Malayalam, Kannada, English',
        category: 'feature' as const,
        route: '/language-bridge',
        icon: <Globe size={16} className="text-teal-600" />,
        keywords: ['language bridge', 'translate', 'interpreter', 'tamil', 'hindi', 'telugu', 'மொழிபெயர்ப்பு', 'भाषा अनुवाद'],
        badge: 'Languages',
        badgeColor: 'bg-teal-100 text-teal-800',
      },
      {
        id: 'feat-a2a',
        title: 'Multi-Agent Clinical Simulation',
        subtitle: 'Specialist collaboration between Triage, Diagnostic, and Safety verification agents',
        category: 'feature' as const,
        route: '/a2a-simulation',
        icon: <Sparkles size={16} className="text-purple-600" />,
        keywords: ['agent simulation', 'a2a', 'clinical reasoning', 'specialist', 'ஏஜென்ட் சிமுலேஷன்', 'एजेंट सिमुलेशन'],
        badge: 'Clinical AI',
        badgeColor: 'bg-purple-100 text-purple-800',
      },
      {
        id: 'feat-sync',
        title: 'Offline Sync & Outbox Center',
        subtitle: 'View queued offline records, pending sync items, and network status',
        category: 'feature' as const,
        route: '/sync',
        icon: <Radio size={16} className="text-emerald-600" />,
        keywords: ['sync', 'offline', 'outbox', 'pending', 'network', 'ஒத்திசைவு', 'सिंक'],
        badge: 'Offline System',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        id: 'feat-sms',
        title: 'SMS Health Updates & Outbox',
        subtitle: 'Rural text-message alerts, appointment reminders, and outbox logs',
        category: 'feature' as const,
        route: '/sms',
        icon: <Radio size={16} className="text-sky-600" />,
        keywords: ['sms', 'text message', 'outbox', 'phone alert', 'குறுஞ்செய்தி', 'एसएमएस'],
        badge: 'Telecom',
        badgeColor: 'bg-sky-100 text-sky-800',
      },
      {
        id: 'feat-ussd',
        title: 'USSD Menu Simulator (*141*9999#)',
        subtitle: 'Basic phone telecommunications protocol simulation for zero-internet areas',
        category: 'feature' as const,
        route: '/ussd',
        icon: <Radio size={16} className="text-slate-600" />,
        keywords: ['ussd', 'menu', 'button phone', 'feature phone', 'keypad', '*141*9999#', 'யூஎஸ்எஸ்டி', 'यूएसएसडी'],
        badge: 'Basic Phone',
        badgeColor: 'bg-slate-100 text-slate-800',
      },
      {
        id: 'feat-call-history',
        title: 'Telemedicine Call History',
        subtitle: 'Audio and video consultation call logs with primary care doctors',
        category: 'doctor' as const,
        route: '/call-history',
        icon: <PhoneCall size={16} className="text-blue-600" />,
        keywords: ['calls', 'call history', 'teleconsultation', 'doctor call', 'அழைப்பு வரலாறு', 'कॉल इतिहास'],
        badge: 'Calls',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
    ];

    items.push(
      ...features.map((f) => ({
        ...f,
        categoryLabel:
          f.category === 'emergency'
            ? '🚨 Immediate Emergency'
            : f.category === 'doctor'
            ? '👨‍⚕️ Doctors & Appointments'
            : f.category === 'hospital'
            ? '🏥 Hospitals & Facilities'
            : f.category === 'medicine'
            ? '💊 Medicines & Prescriptions'
            : f.category === 'family'
            ? '👥 Family Health'
            : f.category === 'record'
            ? '📋 Medical Records'
            : '⚡ Medora Feature',
      }))
    );

    // --- 2. CLINICAL SYMPTOMS & HEALTH CONDITIONS ---
    MEDICAL_DISEASES.forEach((d) => {
      items.push({
        id: `symptom-${d.id}`,
        title: `${d.title}`,
        subtitle: `${d.simpleExplanation.slice(0, 85)}...`,
        category: 'symptom',
        categoryLabel: '🩺 Symptoms & Health Guide',
        route: `/ai?tab=medical&query=${encodeURIComponent(d.title)}`,
        icon: <Activity size={16} className="text-purple-600" />,
        keywords: [
          d.title,
          d.category,
          ...d.commonSymptoms,
          ...d.warningSigns,
          'symptom',
          'illness',
          'condition',
          'disease',
          'pain',
          'fever',
        ],
        badge: 'Clinical Symptom',
        badgeColor: 'bg-purple-100 text-purple-800',
      });
    });

    // --- 3. REFERENCE MEDICINES DATASET ---
    REFERENCE_MEDICINES_DATASET.slice(0, 15).forEach((m) => {
      items.push({
        id: `ref-med-${m.id}`,
        title: `${m.medicineName} (${m.strength})`,
        subtitle: `${m.indication} • ${m.mealRelation}`,
        category: 'medicine',
        categoryLabel: '💊 Medicines & Drug Reference',
        route: `/medicines?search=${encodeURIComponent(m.medicineName)}`,
        icon: <Pill size={16} className="text-emerald-600" />,
        keywords: [
          m.medicineName,
          m.genericName,
          m.brandName,
          m.strength,
          m.indication,
          'medicine',
          'tablet',
          'dose',
        ],
        badge: 'Medicine',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      });
    });

    // --- 4. DOCTORS & HEALTHCARE TEAM ---
    DEMO_HEALTHCARE_TEAM.forEach((doc) => {
      items.push({
        id: `doc-${doc.id}`,
        title: `${doc.name} (${doc.specialty})`,
        subtitle: `${doc.hospitalAffiliation} • ${doc.availabilityStatus}`,
        category: 'doctor',
        categoryLabel: '👨‍⚕️ Doctors & Specialists',
        route: `/doctor-portal?search=${encodeURIComponent(doc.name)}`,
        icon: <Stethoscope size={16} className="text-blue-600" />,
        keywords: [
          doc.name,
          doc.specialty,
          doc.hospitalAffiliation,
          doc.ruralCareFocus,
          'doctor',
          'specialist',
          'physician',
        ],
        badge: doc.availabilityStatus.includes('Available') ? 'Available' : 'Visiting',
        badgeColor: doc.availabilityStatus.includes('Available')
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-amber-100 text-amber-800',
      });
    });

    // --- 5. HOSPITALS & HEALTHCARE FACILITIES ---
    HEALTHCARE_FACILITIES.forEach((fac) => {
      items.push({
        id: `fac-${fac.facilityId}`,
        title: fac.name,
        subtitle: `${fac.location} • ${fac.availabilityStatus} (${fac.distanceKm} km away)`,
        category: 'hospital',
        categoryLabel: '🏥 Hospitals & Facilities',
        route: `/hospitals?search=${encodeURIComponent(fac.name)}`,
        icon: <Building2 size={16} className="text-teal-600" />,
        keywords: [
          fac.name,
          fac.location,
          ...fac.specialties,
          'hospital',
          'phc',
          'chc',
          'clinic',
          'health centre',
        ],
        badge: `${fac.distanceKm} km`,
        badgeColor: 'bg-teal-100 text-teal-800',
      });
    });

    return items;
  }, []);

  // Multilingual query synonyms lookup
  const queryTranslations: Record<string, string[]> = useMemo(
    () => ({
      fever: ['காய்ச்சல்', 'बुखार', 'జ్వరం', 'പനി', 'ಜ್ವರ'],
      cough: ['இருமல்', 'खांसी', 'దగ్గు', 'ചുമ', 'ಕೆಮ್ಮು'],
      headache: ['தலைவலி', 'सिरदर्द', 'తలనొప్పి', 'തലവേദന', 'ತಲೆನೋವು'],
      medicine: ['மருந்து', 'दवा', 'మందులు', 'മരുന്ന്', 'ಔಷಧಿ'],
      doctor: ['மருத்துவர்', 'डॉक्टर', 'వైద్యుడు', 'ഡോക്ടർ', 'ವೈದ್ಯ'],
      hospital: ['மருத்துவமனை', 'अस्पताल', 'ఆసుపత్రి', 'ആശുപത്രി', 'ಆಸ್ಪತ್ರೆ'],
      emergency: ['அவசரம்', 'ஆபத்து', 'आपातकालीन', 'అత్యవసరం', 'അടിയന്തരം', 'ತುರ್ತು'],
      records: ['பதிவுகள்', 'ரிப்போர்ட்', 'रिपोर्ट', 'నివేదికలు', 'രേഖകൾ', 'ದಾಖಲೆಗಳು'],
      family: ['குடும்பம்', 'परिवार', 'కుటుంబం', 'കുടുംബം', 'ಕುಟುಂಬ'],
      baby: ['குழந்தை', 'बच्चा', 'పిల్లలు', 'കുഞ്ഞ്', 'ಮಗು'],
      pregnancy: ['கர்ப்பம்', 'गर्भावस्था', 'గర్భధారణ', 'ഗർഭാവസ്ഥ', 'ಗರ್ಭಧಾರಣೆ'],
      vaccine: ['தடுப்பூசி', 'टीका', 'టీకా', 'വാക്സിൻ', 'ಲಸಿಕೆ'],
      appointment: ['நேர நியமனம்', 'अपॉइंटमेंट', 'అపాయింట్‌మెంట్', 'അപ്പോയിന്റ്മെന്റ്', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್'],
      heart: ['இதயம்', 'दिल', 'గుండె', 'ഹൃദയം', 'ಹೃದಯ'],
      sugar: ['சர்க்கரை', 'शुगर', 'షుగర్', 'ഷുഗർ', 'ಸಕ್ಕರೆ'],
      pressure: ['இரத்த அழுத்தம்', 'रक्तचाप', 'రక్తపోటు', 'രക്തസമ്മർദ്ദം', 'ರಕ್ತದೊತ್ತಡ'],
    }),
    []
  );

  // Filtered search results
  const searchResults: SearchResultItem[] = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];

    // Check for multilingual synonyms
    const matchedTokens = [raw];
    Object.entries(queryTranslations).forEach(([eng, locals]) => {
      if (locals.some((loc) => loc.toLowerCase().includes(raw) || raw.includes(loc.toLowerCase()))) {
        matchedTokens.push(eng);
      }
      if (raw.includes(eng)) {
        matchedTokens.push(...locals);
      }
    });

    const matchesQuery = (item: SearchResultItem) => {
      return matchedTokens.some((tok) => {
        if (item.title.toLowerCase().includes(tok)) return true;
        if (item.subtitle.toLowerCase().includes(tok)) return true;
        return item.keywords.some((k) => k.toLowerCase().includes(tok));
      });
    };

    // Combine user private db data + static dataset
    const allItems = [...userMedicines, ...userRecords, ...userAppointments, ...staticIndex];

    // Priority weighting:
    // 1. Exact title match
    // 2. Starts with title
    // 3. User records / active medicines
    // 4. Emergency items if searching emergency terms
    const matched = allItems.filter(matchesQuery);

    const sorted = matched.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(raw) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().includes(raw) ? 1 : 0;
      if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch;

      // Emergency first if emergency
      if (a.category === 'emergency' && b.category !== 'emergency') return -1;
      if (b.category === 'emergency' && a.category !== 'emergency') return 1;

      return 0;
    });

    // Unique by id, top 12 items
    const seen = new Set<string>();
    const unique: SearchResultItem[] = [];
    for (const item of sorted) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
      if (unique.length >= 10) break;
    }

    return unique;
  }, [query, staticIndex, userMedicines, userRecords, userAppointments, queryTranslations]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        // If query is symptom or medical term, route to symptom analysis; else to records
        const isSymptom = /fever|cough|headache|pain|vomit|rash|sugar|bp/i.test(query);
        if (isSymptom) {
          navigate(`/ai?tab=medical&query=${encodeURIComponent(query)}`);
        } else {
          navigate(`/records?search=${encodeURIComponent(query)}`);
        }
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.route);
  };

  const getPlaceholder = () => {
    switch (language) {
      case 'ta':
        return 'மெடோராவில் தேடவும் (பதிவுகள், மருந்துகள், மருத்துவர்கள்)...';
      case 'hi':
        return 'मेडोरा में खोजें (रिकॉर्ड, दवाएं, डॉक्टर)...';
      case 'te':
        return 'మెడోరాలో శోధించండి (రికార్డులు, మందులు)...';
      case 'ml':
        return 'മെഡോറയിൽ തിരയുക (രേഖകൾ, മരുന്നുകൾ)...';
      case 'kn':
        return 'ಮೆಡೋರಾದಲ್ಲಿ ಹುಡುಕಿ (ದಾಖಲೆಗಳು, ಔಷಧಿಗಳು)...';
      default:
        return 'Search Medora (records, medicines, doctors, symptoms)...';
    }
  };

  // Quick suggestion chips
  const suggestionChips = [
    { label: '🩺 Fever & Cough', query: 'fever' },
    { label: '💊 Paracetamol', query: 'paracetamol' },
    { label: '📅 Appointments', query: 'appointment' },
    { label: '🚨 108 Emergency', query: 'emergency' },
    { label: '📋 Medical Records', query: 'records' },
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <div className={`absolute left-3.5 flex items-center pointer-events-none ${
          variant === 'hero' ? 'text-teal-700' : 'text-teal-700'
        }`}>
          <Search size={variant === 'hero' ? 18 : 16} className="text-teal-700 font-bold" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          aria-label="Search Medora"
          aria-expanded={isOpen}
          className={`w-full text-slate-900 placeholder-slate-400 font-medium transition-all focus:outline-none ${
            variant === 'hero'
              ? 'pl-11 pr-24 py-3 rounded-2xl text-sm bg-white border-2 border-teal-500 shadow-md focus:border-teal-700 focus:ring-4 focus:ring-teal-500/20 min-h-[48px]'
              : variant === 'header'
              ? 'pl-10 pr-16 py-2 rounded-2xl text-xs sm:text-sm bg-white border-2 border-teal-300 shadow-xs focus:border-teal-600 focus:ring-2 focus:ring-teal-400/40 min-h-[38px] sm:min-h-[40px]'
              : variant === 'mobile'
              ? 'pl-10 pr-16 py-2 rounded-2xl text-xs bg-white border-2 border-teal-300 shadow-xs focus:border-teal-600 min-h-[38px]'
              : 'pl-10 pr-16 py-2.5 rounded-2xl text-xs sm:text-sm bg-white border border-slate-300 shadow-xs focus:border-teal-600 min-h-[40px]'
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (query.trim()) {
                const isSymptom = /fever|cough|headache|pain|vomit|rash|sugar|bp/i.test(query);
                if (isSymptom) {
                  navigate(`/ai?tab=medical&query=${encodeURIComponent(query)}`);
                } else {
                  navigate(`/records?search=${encodeURIComponent(query)}`);
                }
                setIsOpen(false);
              } else {
                setIsOpen(true);
                inputRef.current?.focus();
              }
            }}
            className={`flex items-center gap-1 font-black rounded-xl transition-all shadow-xs cursor-pointer ${
              variant === 'hero'
                ? 'bg-teal-700 hover:bg-teal-800 text-white text-xs px-3 py-1.5'
                : 'bg-teal-700 hover:bg-teal-800 text-white text-[11px] px-2.5 py-1'
            }`}
          >
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Optional Quick Suggestion Chips below search input (for hero mode) */}
      {showChips && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles size={12} className="text-teal-600" />
            Quick:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(chip.query);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-[80vh] sm:max-h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Top Status Header */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>
              {query.trim()
                ? `Results for "${query}" (${searchResults.length})`
                : 'Quick Suggestions & Medora Directory'}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              [↑/↓ to navigate • ↵ to open • Esc to close]
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100 p-1.5 flex-1">
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all min-h-[54px] cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-950 ring-1 ring-teal-500/30'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Icon container */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      {item.icon}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                      <span className="text-[10px] font-semibold text-teal-700 block mt-1">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Arrow action */}
                    <div className="self-center flex-shrink-0 text-slate-400 hover:text-teal-700">
                      <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })
            ) : query.trim() ? (
              /* No Results State */
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center text-xl shadow-xs">
                  🔍
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    No results found for "{query}"
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Try searching for symptoms like <em>"fever"</em>, medications like{' '}
                    <em>"paracetamol"</em>, <em>"appointments"</em>, or <em>"108 emergency"</em>.
                  </p>
                </div>

                {/* Helpful Suggestion Chips */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Try searching for:
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(chip.query);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Initial Suggestion Panel */
              <div className="p-4 space-y-3">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Popular Categories & Shortcuts
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '📋 Medical Records', q: 'records' },
                    { label: '💊 Active Medicines', q: 'medicines' },
                    { label: '🩺 Symptoms & Illnesses', q: 'fever' },
                    { label: '👨‍⚕️ Doctors Directory', q: 'doctor' },
                    { label: '🏥 PHCs & Hospitals', q: 'hospital' },
                    { label: '🚨 108 Emergency', q: 'emergency' },
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(cat.q);
                        inputRef.current?.focus();
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/70 text-xs font-bold text-slate-700 transition-all flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                      <ArrowRight size={12} className="opacity-40" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>🔒 Medora Offline-First Local Search</span>
            <span>Zero paid APIs • Instant Navigation</span>
          </div>
        </div>
      )}
    </div>
  );
};
