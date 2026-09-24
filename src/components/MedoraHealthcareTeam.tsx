import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { 
  DEMO_HEALTHCARE_TEAM, 
  FictionalDoctorProfile, 
  getLocalizedDoctor,
  SPECIALTY_TRANSLATIONS 
} from '../data/doctorsDataset';
import { INITIAL_FICTIONAL_FAMILIES, FictionalFamilyMember } from '../data/familyDataset';
import { initiatePhoneCall } from '../services/telephony/phoneCallHelper';
import { LanguageCode } from '../types';
import { 
  Phone, Clock, Award, Languages, 
  FileText, Search, Filter, Stethoscope
} from 'lucide-react';

interface MedoraHealthcareTeamProps {
  selectedPatientMember?: FictionalFamilyMember | null;
  onNavigateToSummary?: () => void;
}

const SUMMARY_LABELS: Record<LanguageCode, Record<string, string>> = {
  en: {
    title: 'MEDORA CLINICAL CONSULTATION SUMMARY',
    generated: 'Generated',
    demoRecord: 'DEMO RECORD',
    doctor: 'Doctor',
    facility: 'Facility',
    demographics: 'PATIENT & HOUSEHOLD DEMOGRAPHICS',
    patientName: 'Patient Name',
    patientId: 'Patient ID',
    household: 'Household',
    ageGender: 'Age / Gender',
    primaryLang: 'Primary Language',
    emergencyContact: 'Emergency Contact',
    presentingComplaint: 'PRESENTING COMPLAINT',
    chiefComplaint: 'Chief Complaint',
    duration: 'Reported Duration',
    clinicalBackground: 'CLINICAL BACKGROUND & MEASUREMENTS',
    bloodGroup: 'Blood Group',
    allergies: 'Documented Allergies',
    activeConditions: 'Active Medical Conditions',
    currentRegimen: 'Current Regimen',
    recentVitals: 'Recent Measurements',
    relevantReports: 'RELEVANT REPORTS & CARE GAPS',
    activeCareGap: 'ACTIVE CARE GAP ALERT',
    suggestedQuestions: 'SUGGESTED QUESTIONS FOR CLINICIAN',
    q1: '1. Is an in-person diagnostic test or physical examination required at the PHC?',
    q2: '2. Are current medications and dosages appropriate, or does the regimen need adjustment?',
    q3: '3. What specific red-flag symptoms should trigger immediate hospital casualty transfer?',
    disclaimer: 'DISCLAIMER: This summary is generated from local offline Medora records for structured clinical communication. It was NOT automatically transmitted to any physician.'
  },
  ta: {
    title: 'மெடோரா மருத்துவ ஆலோசனைக் குறிப்புச் சுருக்கம்',
    generated: 'உருவாக்கப்பட்டது',
    demoRecord: 'மாதிரி மருத்துவப் பதிவு',
    doctor: 'மருத்துவர்',
    facility: 'மருத்துவ மையம்',
    demographics: 'நோயாளி மற்றும் குடும்ப விவரங்கள்',
    patientName: 'நோயாளி பெயர்',
    patientId: 'நோயாளி அடையாள எண்',
    household: 'குடும்பம்',
    ageGender: 'வயது / பாலினம்',
    primaryLang: 'முதன்மை மொழி',
    emergencyContact: 'அவசர தொடர்பு',
    presentingComplaint: 'முன்வைக்கப்பட்ட மருத்துவப் புகார்',
    chiefComplaint: 'முதன்மை புகார்',
    duration: 'அறிகுறிகள் காலம்',
    clinicalBackground: 'மருத்துவ பின்னணி மற்றும் அளவீடுகள்',
    bloodGroup: 'இரத்த வகை',
    allergies: 'பதிவு செய்யப்பட்ட ஒவ்வாமைகள்',
    activeConditions: 'தற்போதைய நோய்கள்',
    currentRegimen: 'தற்போதைய மருந்துகள்',
    recentVitals: 'சமீபத்திய மருத்துவ அளவீடுகள்',
    relevantReports: 'மருத்துவ அறிக்கைகள் மற்றும் விடுபட்ட பராமரிப்பு',
    activeCareGap: 'கவனிக்க வேண்டிய பராமரிப்பு எச்சரிக்கை',
    suggestedQuestions: 'மருத்துவரிடம் கேட்க வேண்டிய பரிந்துரைக்கப்பட்ட கேள்விகள்',
    q1: '1. ஆரம்ப சுகாதார நிலையத்தில் நேரடி இரத்தப் பரிசோதனை அல்லது உடல் பரிசோதனை தேவையா?',
    q2: '2. தற்போது உட்கொள்ளும் மருந்துகளின் அளவு போதுமானதா அல்லது மாற்றியமைக்கப்பட வேண்டுமா?',
    q3: '3. எந்தவொரு தீவிர எச்சரிக்கை அறிகுறிகள் தென்பட்டால் உடனடியாக அவசர சிகிச்சைப் பிரிவுக்குச் செல்ல வேண்டும்?',
    disclaimer: 'பொறுப்புத் துறப்பு: இந்த மருத்துவச் சுருக்கம் உள்ளூர் ஆஃப்லைன் மெடோரா பதிவுகளிலிருந்து மருத்துவப் பகிர்வுக்காக மட்டுமே உருவாக்கப்பட்டது. இது தானாக எந்த மருத்துவருக்கும் அனுப்பப்படவில்லை.'
  },
  te: {
    title: 'మెడోరా క్లినికల్ సంప్రదింపు సారాంశం',
    generated: 'రూపొందించబడింది',
    demoRecord: 'డెమో రికార్డు',
    doctor: 'వైద్యుడు',
    facility: 'ఆరోగ్య కేంద్రం',
    demographics: 'రోగి & కుటుంబ వివరాలు',
    patientName: 'రోగి పేరు',
    patientId: 'రోగి ఐడీ',
    household: 'కుటుంబం',
    ageGender: 'వయస్సు / లింగం',
    primaryLang: 'ప్రాథమిక భాష',
    emergencyContact: 'అత్యవసర పరిచయం',
    presentingComplaint: 'ప్రధాన సమస్య',
    chiefComplaint: 'ముఖ్య ఫిర్యాదు',
    duration: 'నివేదించబడిన వ్యవధి',
    clinicalBackground: 'క్లినికల్ నేపథ్యం & కొలతలు',
    bloodGroup: 'రక్త వర్గం',
    allergies: 'నమోదైన అలెర్జీలు',
    activeConditions: 'ప్రస్తుత ఆరోగ్య పరిస్థితులు',
    currentRegimen: 'ప్రస్తుత మందులు',
    recentVitals: 'ఇటీవలి కొలతలు',
    relevantReports: 'సంబంధిత నివేదికలు & కేర్ గ్యాప్స్',
    activeCareGap: 'యాక్టివ్ కేర్ గ్యాప్ హెచ్చరిక',
    suggestedQuestions: 'వైద్యుడిని అడగవలసిన ప్రశ్నలు',
    q1: '1. పీహెచ్‌సీలో ప్రత్యక్ష రోగ నిర్ధారణ పరీక్ష లేదా శారీరక పరీక్ష అవసరమా?',
    q2: '2. ప్రస్తుత మందులు మరియు మోతాదులు సరైనవేనా లేదా మార్పు చేయాలా?',
    q3: '3. రోగిని వెంటనే ఆసుపత్రి ఎమర్జెన్సీ విభాగానికి తరలించడానికి ఏ ప్రమాద సంకేతాలు పరిగణించాలి?',
    disclaimer: 'నిరాకరణ: ఈ సారాంశం వైద్యునితో స్పష్టమైన సంభాషణ కోసం స్థానిక ఆఫ్‌లైన్ మెడోరా రికార్డుల నుండి మాత్రమే రూపొందించబడింది.'
  },
  ml: {
    title: 'മെഡോറ ക്ലിനിക്കൽ കൺസൾട്ടേഷൻ സംഗ്രഹം',
    generated: 'തയ്യാറാക്കിയത്',
    demoRecord: 'ഡെമോ റെക്കോർഡ്',
    doctor: 'ഡോക്ടർ',
    facility: 'ആരോഗ്യ കേന്ദ്രം',
    demographics: 'രോഗിയുടെയും കുടുംബത്തിന്റെയും വിവരങ്ങൾ',
    patientName: 'രോഗിയുടെ പേര്',
    patientId: 'രോഗി ഐഡി',
    household: 'കുടുംബം',
    ageGender: 'പ്രായം / ലിംഗം',
    primaryLang: 'പ്രധാന ഭാഷ',
    emergencyContact: 'അടിയന്തര കോൺടാക്റ്റ്',
    presentingComplaint: 'രോഗവിവരം',
    chiefComplaint: 'പ്രധാന പരാതി',
    duration: 'ലക്ഷണങ്ങളുടെ ദൈർഘ്യം',
    clinicalBackground: 'ക്ലിനിക്കൽ പശ്ചാത്തലവും പരിശോധനാഫലങ്ങളും',
    bloodGroup: 'രക്തഗ്രൂപ്പ്',
    allergies: 'രേഖപ്പെടുത്തിയ അലർജികൾ',
    activeConditions: 'നിലവിലുള്ള രോഗങ്ങൾ',
    currentRegimen: 'കഴിക്കുന്ന മരുന്നുകൾ',
    recentVitals: 'സമീപകാല അളവുകൾ',
    relevantReports: 'മെഡിക്കൽ റിപ്പോർട്ടുകളും പരിചരണ വിടവുകളും',
    activeCareGap: 'ശ്രദ്ധിക്കേണ്ട പരിചരണ മുന്നറിയിപ്പ്',
    suggestedQuestions: 'ഡോക്ടറോട് ചോദിക്കാവുന്ന ചോദ്യങ്ങൾ',
    q1: '1. പി.എച്ച്.സിയിൽ നേരിട്ടുള്ള പരിശോധനയോ ലാബ് ടെസ്റ്റുകളോ ആവശ്യമുണ്ടോ?',
    q2: '2. നിലവിലെ മരുന്നുകളുടെ അളവ് പര്യാപ്തമാണോ, മാറ്റങ്ങൾ ആവശ്യമുണ്ടോ?',
    q3: '3. ഏതെല്ലാം അപകട ലക്ഷണങ്ങൾ കണ്ടാൽ ഉടനടി ആശുപത്രി അത്യാഹിത വിഭാഗത്തിലേക്ക് മാറ്റണം?',
    disclaimer: 'നിരാകരണം: ഈ ക്ലിനിക്കൽ സംഗ്രഹം പ്രാദേശിക ഓഫ്‌ലൈൻ റെക്കോർഡുകളിൽ നിന്ന് തയ്യാറാക്കിയതാണ്.'
  },
  kn: {
    title: 'ಮೆಡೋರಾ ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ',
    generated: 'ಸಿದ್ಧಪಡಿಸಿದ ದಿನಾಂಕ',
    demoRecord: 'ಡೆಮೊ ದಾಖಲೆ',
    doctor: 'ವೈದ್ಯರು',
    facility: 'ಆರೋಗ್ಯ ಕೇಂದ್ರ',
    demographics: 'ರೋಗಿ ಮತ್ತು ಕುಟುಂಬದ ವಿವರಗಳು',
    patientName: 'ರೋಗಿಯ ಹೆಸರು',
    patientId: 'ರೋಗಿಯ ಐಡಿ',
    household: 'ಕುಟುಂಬ',
    ageGender: 'ವಯಸ್ಸು / ಲಿಂಗ',
    primaryLang: 'ಪ್ರಾಥಮಿಕ ಭಾಷೆ',
    emergencyContact: 'ತುರ್ತು ಸಂಪರ್ಕ',
    presentingComplaint: 'ಮುಖ್ಯ ದೂರು',
    chiefComplaint: 'ಪ್ರಮುಖ ರೋಗಲಕ್ಷಣ',
    duration: 'ವರದಿಯಾದ ಅವಧಿ',
    clinicalBackground: 'ವೈದ್ಯಕೀಯ ಹಿನ್ನೆಲೆ ಮತ್ತು ಮಾಪನಗಳು',
    bloodGroup: 'ರಕ್ತದ ಗುಂಪು',
    allergies: 'ದಾಖಲಾದ ಅಲರ್ಜಿಗಳು',
    activeConditions: 'ಪ್ರಸ್ತುತ ರೋಗಸ್ಥಿತಿಗಳು',
    currentRegimen: 'ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು',
    recentVitals: 'ಇತ್ತೀಚಿನ ಮಾಪನಗಳು',
    relevantReports: 'ವರದಿಗಳು ಮತ್ತು ಆರೈಕೆ ಅಂತರಗಳು',
    activeCareGap: 'ಸಕ್ರಿಯ ಆರೈಕೆ ಅಂತರ ಎಚ್ಚರಿಕೆ',
    suggestedQuestions: 'ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು',
    q1: '1. ಪಿಎಚ್‌ಸಿಯಲ್ಲಿ ನೇರ ತಪಾಸಣೆ ಅಥವಾ ರಕ್ತ ಪರೀಕ್ಷೆಯ ಅಗತ್ಯವಿದೆಯೇ?',
    q2: '2. ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು ಮತ್ತು ಪ್ರಮಾಣಗಳು ಸೂಕ್ತವೇ ಅಥವಾ ಬದಲಾವಣೆಯ ಅಗತ್ಯವಿದೆಯೇ?',
    q3: '3. ರೋಗಿಯನ್ನು ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಯ ತುರ್ತು ವಿಭಾಗಕ್ಕೆ ಕರೆದೊಯ್ಯಲು ಯಾವ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳನ್ನು ಗಮನಿಸಬೇಕು?',
    disclaimer: 'ಹಕ್ಕು ನಿರಾಕರಣೆ: ಈ ಸಾರಾಂಶವನ್ನು ಸ್ಥಳೀಯ ಆಫ್‌ಲೈನ್ ದಾಖಲೆಗಳಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.'
  },
  hi: {
    title: 'मेडोरा नैदानिक परामर्श सारांश',
    generated: 'तैयार किया गया',
    demoRecord: 'डेमो रिकॉर्ड',
    doctor: 'चिकित्सक',
    facility: 'स्वास्थ्य केंद्र',
    demographics: 'रोगी एवं पारिवारिक विवरण',
    patientName: 'रोगी का नाम',
    patientId: 'रोगी आईडी',
    household: 'परिवार',
    ageGender: 'आयु / लिंग',
    primaryLang: 'प्राथमिक भाषा',
    emergencyContact: 'आपातकालीन संपर्क',
    presentingComplaint: 'मुख्य समस्या / शिकायत',
    chiefComplaint: 'प्रमुख शिकायत',
    duration: 'लक्षणों की अवधि',
    clinicalBackground: 'नैदानिक पृष्ठभूमि एवं माप (वाइटल्स)',
    bloodGroup: 'रक्त समूह',
    allergies: 'दर्ज एलर्जी',
    activeConditions: 'सक्रिय चिकित्सीय स्थितियां',
    currentRegimen: 'वर्तमान दवाइयां',
    recentVitals: 'हाल के माप',
    relevantReports: 'प्रासंगिक रिपोर्ट एवं देखभाल अंतराल',
    activeCareGap: 'सक्रिय देखभाल चेतावनी',
    suggestedQuestions: 'चिकित्सक से पूछे जाने वाले सुझावित प्रश्न',
    q1: '1. क्या प्राथमिक स्वास्थ्य केंद्र पर प्रत्यक्ष शारीरिक जांच या लैब परीक्षण आवश्यक है?',
    q2: '2. क्या वर्तमान दवाएं और उनकी खुराक सही हैं, या इनमें बदलाव की आवश्यकता है?',
    q3: '3. किन विशिष्ट खतरे के संकेतों के दिखने पर तुरंत अस्पताल आपातकालीन वार्ड में भर्ती करना चाहिए?',
    disclaimer: 'अस्वीकरण: यह सारांश स्थानीय ऑफ़लाइन मेडोरा रिकॉर्ड से संरचित नैदानिक संचार हेतु तैयार किया गया है।'
  }
};

export const MedoraHealthcareTeam: React.FC<MedoraHealthcareTeamProps> = ({
  selectedPatientMember
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const currentLang = (['en', 'ta', 'te', 'ml', 'kn', 'hi'].includes(language) ? language : 'en') as LanguageCode;

  const [selectedDoctor, setSelectedDoctor] = useState<FictionalDoctorProfile | null>(null);
  const [profileModalDoc, setProfileModalDoc] = useState<FictionalDoctorProfile | null>(null);
  const [consultModalDoc, setConsultModalDoc] = useState<FictionalDoctorProfile | null>(null);
  const [summaryModalDoc, setSummaryModalDoc] = useState<FictionalDoctorProfile | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');

  // Selected patient for consultation context
  const [consultPatient, setConsultPatient] = useState<FictionalFamilyMember>(
    selectedPatientMember || INITIAL_FICTIONAL_FAMILIES[0].members[0]
  );
  const [complaintText, setComplaintText] = useState('Feeling fatigued with mild throat irritation for 2 days.');
  const [durationText, setDurationText] = useState('2 days');
  const [phoneFeedback, setPhoneFeedback] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Localized string helper for labels
  const L = (key: string, fallback: string) => {
    const val = t(`doctorSection.${key}`);
    return val && val !== `doctorSection.${key}` ? val : fallback;
  };

  const handleCallDoctor = (doc: FictionalDoctorProfile) => {
    const loc = getLocalizedDoctor(doc, currentLang);
    if (!doc.contactPhone) {
      setPhoneFeedback(L('callingNotConfigured', 'Calling is not configured for this demo doctor.'));
      setTimeout(() => setPhoneFeedback(null), 4000);
      return;
    }
    const res = initiatePhoneCall(doc.contactPhone, loc.name);
    setPhoneFeedback(res.message);
    setTimeout(() => setPhoneFeedback(null), 5000);
  };

  const allAvailableMembers: FictionalFamilyMember[] = INITIAL_FICTIONAL_FAMILIES.flatMap(f => f.members);

  // Distinct specialties with translations
  const availableSpecialties = useMemo(() => {
    const specs = Array.from(new Set(DEMO_HEALTHCARE_TEAM.map(d => d.specialty)));
    return specs;
  }, []);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return DEMO_HEALTHCARE_TEAM.filter((doc) => {
      const loc = getLocalizedDoctor(doc, currentLang);
      const matchesSpec = selectedSpecialty === 'ALL' || doc.specialty === selectedSpecialty;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        loc.name.toLowerCase().includes(q) ||
        doc.name.toLowerCase().includes(q) ||
        loc.specialty.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        loc.hospitalAffiliation.toLowerCase().includes(q) ||
        loc.areasOfCare.some(a => a.toLowerCase().includes(q));

      return matchesSpec && matchesQuery;
    });
  }, [searchQuery, selectedSpecialty, currentLang]);

  // Generate localized summary text
  const generateSummaryDocument = (doc: FictionalDoctorProfile, patient: FictionalFamilyMember) => {
    const loc = getLocalizedDoctor(doc, currentLang);
    const lbl = SUMMARY_LABELS[currentLang] || SUMMARY_LABELS.en;
    const household = INITIAL_FICTIONAL_FAMILIES.find(f => f.familyId === patient.familyId)?.familyName || 'Kumar Family';

    const vitalsPart = [
      patient.recentVitals.bloodPressureSys ? `BP: ${patient.recentVitals.bloodPressureSys}/${patient.recentVitals.bloodPressureDia} mmHg` : '',
      `Weight: ${patient.recentVitals.weightKg} kg`,
      patient.recentVitals.bloodSugarFasting ? `Sugar: ${patient.recentVitals.bloodSugarFasting} mg/dL` : '',
      patient.recentVitals.spo2 ? `SpO2: ${patient.recentVitals.spo2}%` : ''
    ].filter(Boolean).join(' | ');

    return `========================================
${lbl.title}
${lbl.generated}: ${new Date().toLocaleString()} [${lbl.demoRecord}]
${lbl.doctor}: ${loc.name} (${loc.specialty})
${lbl.facility}: ${loc.hospitalAffiliation}
========================================

${lbl.demographics}:
- ${lbl.patientName}: ${patient.name}
- ${lbl.patientId}: ${patient.patientId}
- ${lbl.household}: ${household} (${patient.familyId})
- ${lbl.ageGender}: ${patient.age} ${L('years', 'years')} / ${patient.gender}
- ${lbl.primaryLang}: ${patient.preferredLanguage.toUpperCase()}
- ${lbl.emergencyContact}: ${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}

${lbl.presentingComplaint}:
- ${lbl.chiefComplaint}: ${complaintText}
- ${lbl.duration}: ${durationText}

${lbl.clinicalBackground}:
- ${lbl.bloodGroup}: ${patient.bloodGroup}
- ${lbl.allergies}: ${patient.allergies.join(', ') || L('noneKnown', 'None known')}
- ${lbl.activeConditions}: ${patient.currentConditions.join(', ') || L('noneDocumented', 'None documented')}
- ${lbl.currentRegimen}: ${patient.currentMedicines.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ') || L('noneDocumented', 'None documented')}
- ${lbl.recentVitals}: ${vitalsPart}

${lbl.relevantReports}:
${patient.medicalReports.map(r => `- ${r.title} (${r.date}): ${r.summary}`).join('\n') || `- ${L('noneDocumented', 'None documented')}`}
${patient.careGapDetails ? `\n${lbl.activeCareGap}:\n- ${patient.careGapDetails.title}: ${patient.careGapDetails.description}` : ''}

${lbl.suggestedQuestions}:
${lbl.q1}
${lbl.q2}
${lbl.q3}

========================================
${lbl.disclaimer}`;
  };

  return (
    <section className="my-8 space-y-4">
      {/* Phone Action Feedback Banner */}
      {phoneFeedback && (
        <div className="bg-[#EFF6FF] border border-[#2563EB]/40 text-[#1E40AF] px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-[#2563EB] flex-shrink-0" />
            <span>{phoneFeedback}</span>
          </div>
          <button onClick={() => setPhoneFeedback(null)} className="font-bold text-slate-500 hover:text-slate-800 ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border border-[#E2E8F0] p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                🩺
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                {L('sectionTitle', 'MEDORA HEALTHCARE TEAM')}
              </h2>
            </div>
            <p className="text-xs text-[#475569] mt-1 max-w-2xl leading-relaxed">
              {L('sectionSubtitle', '10 dedicated rural healthcare specialists serving Primary and Community Health Centres.')}
              <span className="font-semibold text-[#0F766E] ml-1">
                {L('fictionalNotice', 'Fictional Demo Profiles for Teleconsultation & Triage Simulation.')}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30 font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {L('demoBadge', '🟢 10 Demo Doctors Active')}
            </span>
          </div>
        </div>

        {/* Search & Specialty Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={L('searchDoctor', 'Search doctor by name or specialty...')}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
            />
          </div>
          <div className="sm:col-span-5 relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] font-semibold focus:outline-none focus:border-[#0F766E]"
            >
              <option value="ALL">{L('filterSpecialty', 'All Specialties')}</option>
              {availableSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {SPECIALTY_TRANSLATIONS[spec]?.[currentLang] || spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredDoctors.length === 0 && (
        <div className="bg-white/80 rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
          <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">{L('noDoctorsFound', 'No doctors match your filters')}</h3>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSpecialty('ALL'); }}
            className="text-xs text-[#0F766E] font-bold underline"
          >
            {L('filterSpecialty', 'Clear filters')}
          </button>
        </div>
      )}

      {/* Responsive Grid: 4-cols on lg/xl desktop, 2-cols on tablet (sm/md), 1-col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDoctors.map((doctor) => {
          const locDoc = getLocalizedDoctor(doctor, currentLang);
          const isSelected = selectedDoctor?.id === doctor.id;

          return (
            <div
              key={doctor.id}
              className={`bg-white/90 backdrop-blur-sm border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                isSelected ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20' : 'border-[#E2E8F0] hover:border-teal-300'
              }`}
            >
              <div>
                {/* Specialty Badge & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20 px-2.5 py-0.5 rounded-full">
                    {locDoc.specialty}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doctor.availabilityStatus.includes('Available Today')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : doctor.availabilityStatus.includes('Emergency')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {locDoc.availabilityStatus}
                  </span>
                </div>

                {/* Doctor Name & Details */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-base flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    {locDoc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight truncate">
                      {locDoc.name}
                    </h3>
                    <p className="text-[11px] text-[#0F766E] font-semibold mt-0.5 truncate">
                      {locDoc.hospitalAffiliation}
                    </p>
                  </div>
                </div>

                {/* Focus & Meta */}
                <p className="text-[11px] text-[#475569] line-clamp-2 mb-3 leading-relaxed">
                  {locDoc.ruralCareFocus}
                </p>

                <div className="space-y-1.5 text-[11px] text-[#64748B] border-t border-slate-100 pt-2.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Award size={13} className="text-[#0F766E] flex-shrink-0" />
                    <span><strong>{L('experience', 'Experience')}:</strong> {locDoc.experienceText}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Languages size={13} className="text-[#2563EB] flex-shrink-0" />
                    <span className="truncate"><strong>{L('languages', 'Languages')}:</strong> {locDoc.languagesSpokenText}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#EA580C] flex-shrink-0" />
                    <span className="truncate"><strong>{L('opdTimings', 'OPD')}:</strong> {locDoc.opdTimings}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setProfileModalDoc(doctor)}
                    className="bg-slate-50 hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-bold py-2 rounded-xl transition-colors text-center"
                  >
                    {L('viewProfile', 'View Profile')}
                  </button>
                  <button
                    onClick={() => {
                      setConsultModalDoc(doctor);
                      setSelectedDoctor(doctor);
                    }}
                    className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold py-2 rounded-xl shadow-xs transition-colors text-center"
                  >
                    {L('consultDemo', 'Consult (Demo)')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSummaryModalDoc(doctor);
                      setSelectedDoctor(doctor);
                    }}
                    className="bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] border border-[#2563EB]/20 font-bold py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText size={12} />
                    <span>{L('summary', 'Summary')}</span>
                  </button>

                  <button
                    onClick={() => handleCallDoctor(doctor)}
                    className="bg-[#F0FDF4] hover:bg-emerald-100 text-[#16A34A] border border-[#16A34A]/20 font-bold py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Phone size={12} />
                    <span>{L('callTel', 'Call (tel:)')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. DOCTOR PROFILE MODAL                                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {profileModalDoc && (() => {
        const loc = getLocalizedDoctor(profileModalDoc, currentLang);
        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E2E8F0] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#F0FDFA] text-[#0F766E] px-2 py-0.5 rounded">
                    {loc.specialty}
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A] mt-1">{loc.name}</h3>
                  <p className="text-xs text-[#475569]">{loc.hospitalAffiliation}</p>
                </div>
                <button
                  onClick={() => setProfileModalDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#475569]">
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                  <p className="font-medium leading-relaxed">{loc.shortBio}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-[#64748B] block">{L('experience', 'Experience')}</span>
                    <span className="font-extrabold text-[#0F172A]">{loc.experienceText}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-[#64748B] block">{L('consultationFee', 'Consultation Fee')}</span>
                    <span className="font-extrabold text-emerald-700">{loc.demoFee}</span>
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-[#0F172A] block mb-1">{L('keyAreasOfCare', 'Key Areas of Care:')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {loc.areasOfCare.map((area, idx) => (
                      <span key={idx} className="bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        ✓ {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{L('education', 'Education:')}</span>
                    <span className="font-semibold text-slate-800 text-right">{loc.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{L('opdTimings', 'OPD Timings:')}</span>
                    <span className="font-semibold text-slate-800">{loc.opdTimings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{L('languages', 'Languages:')}</span>
                    <span className="font-semibold text-slate-800">{loc.languagesSpokenText}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFFBEB] border border-[#D97706]/30 text-[#D97706] rounded-xl text-[11px] leading-relaxed">
                  {L('demoNotice', 'ℹ️ Demonstration Notice: This profile represents a fictional rural doctor model in Medora. Real medical consultations must be conducted via verified healthcare providers.')}
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setConsultModalDoc(profileModalDoc);
                    setProfileModalDoc(null);
                  }}
                  className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  {L('startDemoConsultation', 'Start Demo Consultation')}
                </button>
                <button
                  onClick={() => handleCallDoctor(profileModalDoc)}
                  className="bg-[#16A34A] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} />
                  <span>{L('callDoctor', 'Call Doctor')}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. DEMO CONSULTATION MODAL (Loaded with Patient Context)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {consultModalDoc && (() => {
        const loc = getLocalizedDoctor(consultModalDoc, currentLang);
        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E2E8F0] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase">{L('demoConsultationTitle', 'Demo Consultation')}</span>
                  <h3 className="text-xl font-black text-[#0F172A]">{loc.name}</h3>
                  <p className="text-xs text-[#475569]">{loc.specialty} • {loc.hospitalAffiliation}</p>
                </div>
                <button
                  onClick={() => setConsultModalDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Select Patient from Family Dataset */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F172A] block">
                  {L('selectFamilyMember', 'Select Family Member for Consultation:')}
                </label>
                <select
                  value={consultPatient.patientId}
                  onChange={(e) => {
                    const found = allAvailableMembers.find(m => m.patientId === e.target.value);
                    if (found) setConsultPatient(found);
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  {INITIAL_FICTIONAL_FAMILIES.map(fam => (
                    <optgroup key={fam.familyId} label={`${fam.familyName} (${fam.village})`}>
                      {fam.members.map(mem => (
                        <option key={mem.patientId} value={mem.patientId}>
                          {mem.name} ({mem.age}y, {mem.relationship}) - {mem.category}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Loaded Patient Clinical Context Box */}
              <div className="p-3.5 bg-[#F0FDFA] border border-[#0F766E]/20 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0F766E]">{L('loadedRecord', 'Loaded Patient Clinical Record:')}</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    {L('patientId', 'ID')}: {consultPatient.patientId} • {L('bloodGroup', 'Blood')}: {consultPatient.bloodGroup}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
                  <div>
                    <strong>{L('ageGender', 'Age / Gender')}:</strong> {consultPatient.age} {L('years', 'years')} • {consultPatient.gender}
                  </div>
                  <div>
                    <strong>{L('preferredLanguage', 'Preferred Lang')}:</strong> {consultPatient.preferredLanguage.toUpperCase()}
                  </div>
                  <div>
                    <strong>{L('activeConditions', 'Active Conditions')}:</strong> {consultPatient.currentConditions.join(', ') || L('noneDocumented', 'None documented')}
                  </div>
                  <div>
                    <strong>{L('allergies', 'Allergies')}:</strong> {consultPatient.allergies.join(', ') || L('noneKnown', 'None known')}
                  </div>
                </div>

                {consultPatient.currentMedicines.length > 0 && (
                  <div className="text-[11px] text-[#475569]">
                    <strong>{L('currentMedicines', 'Current Medicines')}:</strong>{' '}
                    {consultPatient.currentMedicines.map(m => `${m.name} (${m.status})`).join('; ')}
                  </div>
                )}

                {consultPatient.recentVitals && (
                  <div className="text-[10px] bg-white/80 p-2 rounded-xl border border-teal-100 flex flex-wrap gap-2 text-slate-700">
                    {consultPatient.recentVitals.bloodPressureSys && (
                      <span><strong>BP:</strong> {consultPatient.recentVitals.bloodPressureSys}/{consultPatient.recentVitals.bloodPressureDia} mmHg</span>
                    )}
                    {consultPatient.recentVitals.bloodSugarFasting && (
                      <span><strong>Sugar:</strong> {consultPatient.recentVitals.bloodSugarFasting} mg/dL</span>
                    )}
                    <span><strong>Weight:</strong> {consultPatient.recentVitals.weightKg} kg</span>
                    {consultPatient.recentVitals.spo2 && (
                      <span><strong>SpO2:</strong> {consultPatient.recentVitals.spo2}%</span>
                    )}
                  </div>
                )}
              </div>

              {/* Input chief complaint */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#0F172A] block">{L('chiefComplaint', 'Chief Complaint / Reason for Consultation:')}</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                  placeholder={L('chiefComplaintPlaceholder', 'Describe current symptoms...')}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">{L('durationOfSymptoms', 'Duration of Symptoms:')}</label>
                  <input
                    type="text"
                    value={durationText}
                    onChange={(e) => setDurationText(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A]"
                    placeholder={L('durationPlaceholder', 'e.g., 2 days')}
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">{L('action', 'Action:')}</label>
                  <button
                    onClick={() => {
                      setSummaryModalDoc(consultModalDoc);
                      setConsultModalDoc(null);
                    }}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 mt-0.5"
                  >
                    <FileText size={14} />
                    <span>{L('generateDoctorSummary', 'Generate Doctor Summary')}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] rounded-xl text-[11px] leading-relaxed">
                {L('emergencyWarning', '⚠️ Emergency Warning: If patient exhibits severe chest pain, breathing struggle, convulsions, or heavy bleeding, bypass online consultation and call 108 ambulance immediately.')}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. DOCTOR SUMMARY GENERATOR MODAL                            */}
      {/* ──────────────────────────────────────────────────────────── */}
      {summaryModalDoc && (() => {
        const loc = getLocalizedDoctor(summaryModalDoc, currentLang);
        const summaryText = generateSummaryDocument(summaryModalDoc, consultPatient);

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E2E8F0] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
                    {L('handoffDocument', 'Clinical Handoff Document')}
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A] mt-1">{L('doctorConsultationSummary', 'Doctor Consultation Summary')}</h3>
                  <p className="text-xs text-[#475569]">{L('preparedFor', 'Prepared for:')} {loc.name} ({loc.specialty})</p>
                </div>
                <button
                  onClick={() => setSummaryModalDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Generated Summary Document */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed select-all">
                {summaryText}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#64748B]">
                  {copiedSummary ? L('copiedToClipboard', '✓ Copied to clipboard!') : L('readyToPrint', 'Ready to print or save')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(summaryText);
                      setCopiedSummary(true);
                      setTimeout(() => setCopiedSummary(false), 3000);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    {L('copySummary', 'Copy Summary')}
                  </button>
                  <button
                    onClick={() => setSummaryModalDoc(null)}
                    className="bg-[#0F766E] hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    {L('done', 'Done')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default MedoraHealthcareTeam;
