import { VoiceServiceRequest, VoiceServiceResponse } from './types';
import { medicalService } from './medicalService';
import { voiceCommandMatcher } from '../voiceNavigation/voiceCommandMatcher';
import { medicationPushNotificationService } from '../medications/medicationPushNotificationService';

export class VoiceService {
  /**
   * Processes conversational user speech or text.
   * STRICT SAFETY BOUNDARY:
   * 1. Handles emergency triage first.
   * 2. Routes calling, messaging, app help, and navigation explicitly.
   * 3. NEVER diagnoses or interprets symptoms as a condition in voice mode.
   * 4. NEVER treats app help questions like "How do I upload a report?" as medical symptoms.
   * 5. If a medical query or symptom is received, strictly routes to Medora Medical AI.
   */
  public async processVoiceRequest(request: VoiceServiceRequest): Promise<VoiceServiceResponse> {
    const raw = (request.text || '').trim();
    const lower = raw.toLowerCase();
    const lang = (request.language || 'en').slice(0, 2) as 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
    const langKey = ['en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(lang) ? lang : 'en';

    // 1. EMERGENCY TRIAGE FIRST (Immediate life-safety red flags)
    const isEmergency =
      /\b(cannot breathe|can't breathe|choking|gasping|severe chest pain|chest pain|unconscious|fainted|loss of consciousness|seizure|severe bleeding|stroke|anaphylaxis)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|கடுமையான நெஞ்சு வலி|நெஞ்சு வலி|அதிக இரத்தப்போக்கு|மயக்கம்|வலிப்பு)/.test(raw) ||
      /(सांस नहीं आ रही|सीने में तेज दर्द|सीने में दर्द|खून की उल्टी|बेहोश|दौरा)/.test(raw);

    if (isEmergency) {
      const medicalHandoff = await medicalService.analyzeMedicalRequest({
        patientInput: raw,
        language: langKey,
      });

      const emergMessages: Record<string, string> = {
        en: 'This sounds like an urgent medical concern. Please seek immediate professional medical attention or call 108. Opening Emergency Triage now.',
        ta: 'இது அவசர மருத்துவ நிலையாகத் தெரிகிறது. தயவுசெய்து உடனடியாக 108-ஐ அழைக்கவும் அல்லது மருத்துவமனைக்குச் செல்லவும். அவசர சிகிச்சை பக்கத்தைத் திறக்கிறேன்.',
        hi: 'यह एक गंभीर या आपातकालीन लक्षण प्रतीत होता है। कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं। आपातकालीन पेज खोल रहा हूँ।',
        te: 'ఇది అత్యవసర పరిస్థితి కావచ్చు. దయచేసి వెంటనే 108 కి కాల్ చేయండి. అత్యవసర పేజీని తెరుస్తున్నాను.',
        ml: 'ഇതൊരു അടിയന്തിര സാഹചര്യമാകാം. ദയവായി ഉടൻ 108-ൽ വിളിക്കുക അല്ലെങ്കിൽ ആശുപത്രിയിൽ എത്തുക.',
        kn: 'ಇದು ತುರ್ತು ವೈದ್ಯಕೀಯ ಸ್ಥಿತಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ 108 ಕರೆ ಮಾಡಿ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: emergMessages[langKey] || emergMessages.en,
        language: langKey,
        isMedicalQuery: true,
        medicalHandoff,
        destinationRoute: '/emergency',
        suggestedAction: 'TRANSFER_TO_MEDICAL_AI',
      };
    }

    // 2. CALLING WORKFLOW ("Call doctor", "call ambulance", "phone doctor")
    if (/\b(?:call|phone|dial|ring)\s+(?:the\s+)?(?:doctor|dr|ambulance|hospital|clinic)\b/i.test(lower) || /மருத்துவரை அழைக்கவும்|डॉक्टर को कॉल|డాక్టర్‌కు కాల్|ഡോക്ടറെ വിളിക്കുക|ವೈದ್ಯರಿಗೆ ಕರೆ/.test(raw)) {
      const callMsg: Record<string, string> = {
        en: 'Opening doctor calling and appointments directory.',
        ta: 'மருத்துவர் அழைப்பு மற்றும் சந்திப்பு முன்பதிவு பக்கத்தைத் திறக்கிறேன்.',
        hi: 'डॉक्टर कॉलिंग और अपॉइंटमेंट डायरेक्टरी खोल रहा हूँ।',
        te: 'డాక్టర్ కాలింగ్ మరియు అపాయింట్‌మెంట్ల పేజీని తెరుస్తున్నాను.',
        ml: 'ഡോക്ടറെ വിളിക്കാനുള്ള അപ്പോയിന്റ്മെന്റ് പേജ് തുറക്കുന്നു.',
        kn: 'ವೈದ್ಯರ ಕರೆ ಮತ್ತು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಪಟ್ಟಿಯನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: callMsg[langKey] || callMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/appointments',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 3. SMS / MESSAGE WORKFLOW ("Send this to doctor", "message doctor")
    if (/\b(?:send\s+(?:this\s+)?to\s+doctor|message\s+doctor|text\s+doctor|send\s+sms|sms\s+doctor)\b/i.test(lower) || /மருத்துவருக்கு அனுப்பு|डॉक्टर को भेजें|డాక్టర్‌కు సందేశం|ഡോക്ടർക്ക് സന്ദേശം|ವೈದ್ಯರಿಗೆ ಸಂದೇಶ/.test(raw)) {
      const smsMsg: Record<string, string> = {
        en: 'Opening SMS & communications center to message your doctor.',
        ta: 'மருத்துவருக்கு செய்தி அனுப்ப எஸ்.எம்.எஸ் பக்கத்தைத் திறக்கிறேன்.',
        hi: 'डॉक्टर को संदेश भेजने के लिए एसएमएस केंद्र खोल रहा हूँ।',
        te: 'డాక్టర్‌కు సందేశం పంపడానికి SMS కేంద్రాన్ని తెరుస్తున్నాను.',
        ml: 'ഡോക്ടർക്ക് സന്ദേശം അയക്കാൻ എസ്.എം.എസ് പേജ് തുറക്കുന്നു.',
        kn: 'ವೈದ್ಯರಿಗೆ ಸಂದೇಶ ಕಳುಹಿಸಲು SMS ವಿಭಾಗವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: smsMsg[langKey] || smsMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/sms',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 4. APP HELP / REPORT UPLOAD ("How do I upload a report?", "How to scan report", "How do I use Medora")
    const isAppHelp =
      /^(?:how\s+(?:do\s+i|to)\s+(?:upload|scan|attach)|how\s+do\s+i\s+use|what\s+is\s+medora|who\s+are\s+you|help\b)/i.test(lower) ||
      /\bhow\s+(?:do\s+i|to)\s+upload\s+(?:a\s+)?report\b/i.test(lower) ||
      /அறிக்கையை எவ்வாறு பதிவேற்றுவது|रिपोर्ट कैसे अपलोड करें|రిపోర్ట్ ఎలా అప్‌లోడ్ చేయాలి|റിപ്പോർട്ട് എങ്ങനെ അപ്‌ലോഡ് ചെയ്യാം|ವರದಿಯನ್ನು ಹೇಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದು/.test(raw);

    if (isAppHelp) {
      const helpMsg: Record<string, string> = {
        en: 'To upload a report, go to the Report Scanner or Medical Records tab. You can take a photo with your camera or select an existing image or PDF from your device. Opening Report Scanner now.',
        ta: 'மருத்துவ அறிக்கையை பதிவேற்ற, ரிப்போர்ட் ஸ்கேனர் அல்லது மெடிக்கல் ரெக்கார்ட்ஸ் பக்கத்தில் கேமரா மூலம் புகைப்படம் எடுக்கலாம் அல்லது கோப்பைத் தேர்ந்தெடுக்கலாம். ஸ்கேனர் பக்கத்தைத் திறக்கிறேன்.',
        hi: 'रिपोर्ट अपलोड करने के लिए रिपोर्ट स्कैनर या मेडिकल रिकॉर्ड्स पर जाएं। आप कैमरा से फोटो ले सकते हैं या फाइल चुन सकते हैं। स्कैनर खोल रहा हूँ।',
        te: 'రిపోర్టును అప్‌లోడ్ చేయడానికి రిపోర్ట్ స్కానర్ లేదా మెడికల్ రికార్డ్స్‌కి వెళ్లి ఫోటో తీయవచ్చు లేదా ఫైల్‌ను ఎంచుకోవచ్చు. స్కానర్‌ను తెరుస్తున్నాను.',
        ml: 'റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യാൻ റിപ്പോർട്ട് സ്കാനറിലോ മെഡിക്കൽ റെക്കോർഡുകളിലോ പോയി ഫോട്ടോ എടുക്കുകയോ ഫയൽ തിരഞ്ഞെടുക്കുകയോ ചെയ്യാം. സ്കാനർ തുറക്കുന്നു.',
        kn: 'ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ರಿಪೋರ್ಟ್ ಸ್ಕ್ಯಾನರ್‌ಗೆ ಹೋಗಿ ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಬಹುದು அல்லது ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಬಹುದು. ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: helpMsg[langKey] || helpMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/report-scanner',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 5. HEALTH RECORD INPUT & CREATION (e.g. "Add a blood pressure reading", "Add medicine", "Add vital")
    if (/\b(?:add|record|enter|log)\s+(?:a\s+)?(?:blood\s+pressure|bp)(?:\s+reading)?\b/i.test(lower) || /\b(?:add|enter)\s+(?:a\s+)?(?:vital|vitals)\b/i.test(lower)) {
      const bpMsg: Record<string, string> = {
        en: 'Opening Health Tests to add your blood pressure reading.',
        ta: 'இரத்த அழுத்த அளவைச் சேர்க்க உடல்நலப் பரிசோதனைப் பக்கத்தைத் திறக்கிறேன்.',
        hi: 'रक्तचाप माप दर्ज करने के लिए स्वास्थ्य परीक्षण पृष्ठ खोल रहा हूँ।',
        te: 'రక్తపోటు కొలతను నమోదు చేయడానికి ఆరోగ్య పరీక్షల పేజీని తెరుస్తున్నాను.',
        ml: 'രക്തസമ്മർദ്ദം രേഖപ്പെടുത്താൻ ആരോഗ്യ പരിശോധന പേജ് തുറക്കുന്നു.',
        kn: 'ರಕ್ತದೊತ್ತಡದ ವಿವರ ನಮೂದಿಸಲು ಆರೋಗ್ಯ ಪರೀಕ್ಷೆಗಳ ಪುಟವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: bpMsg[langKey] || bpMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/health-tests?add=true',
        suggestedAction: 'NAVIGATE',
      };
    }

    if (/\b(?:add|new|enter)\s+(?:a\s+)?medicine\b/i.test(lower)) {
      const medMsg: Record<string, string> = {
        en: 'Opening Medicine entry form to add your medication.',
        ta: 'மருந்து சேர்க்கும் படிவத்தைத் திறக்கிறேன்.',
        hi: 'दवा जोड़ने का फ़ॉर्म खोल रहा हूँ।',
        te: 'మందులు జోడించే ఫారమ్‌ను తెరుస్తున్నాను.',
        ml: 'മരുന്ന് ചേർക്കാനുള്ള ഫോം തുറക്കുന്നു.',
        kn: 'ಔಷಧಿ ಸೇರಿಸುವ ಫಾರಂ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: medMsg[langKey] || medMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/medicines?add=true',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 5.5 NEXT DOSE LOOKUP ("When is my next dose?", "What is my next dose?", "When to take medicine")
    const isNextDoseQuery =
      /\b(?:when\s+is\s+(?:my\s+)?next\s+(?:dose|medicine|pill)|what\s+is\s+(?:my\s+)?next\s+(?:dose|medicine)|next\s+dose|upcoming\s+dose|when\s+to\s+take\s+(?:my\s+)?medicine)\b/i.test(
        lower
      ) ||
      /(அடுத்த மருந்து எப்போது|मेरी अगली खुराक कब है|నా తదుపరి డోస్ ఎప్పుడు|അടുത്ത മരുന്ന് എപ്പോൾ|ನನ್ನ ಮುಂದಿನ ಡೋಸ್ ಯಾವಾಗ)/.test(
        raw
      );

    if (isNextDoseQuery) {
      const pid = request.patientId || 1;
      const nextDose = await medicationPushNotificationService.getNextUpcomingDose(pid);

      if (nextDose) {
        const timeFormatted = nextDose.scheduledTime;
        const timeDiffDesc = nextDose.isToday
          ? nextDose.minutesUntilDose <= 15
            ? 'due right now'
            : `in ${Math.floor(nextDose.minutesUntilDose / 60)}h ${nextDose.minutesUntilDose % 60}m`
          : 'tomorrow morning';

        const responses: Record<string, string> = {
          en: `Your next scheduled dose is ${nextDose.medicineName} (${nextDose.dose}) at ${timeFormatted} (${timeDiffDesc}). Doctor's note: ${nextDose.instructions || 'Take as prescribed with water.'}`,
          ta: `உங்கள் அடுத்த மருந்து: ${nextDose.medicineName} (${nextDose.dose}), நேரம்: ${timeFormatted} (${timeDiffDesc}). குறிப்பு: ${nextDose.instructions || 'மருத்துவரின் அறிவுரைப்படி உட்கொள்ளவும்.'}`,
          hi: `आपकी अगली खुराक ${nextDose.medicineName} (${nextDose.dose}) समय ${timeFormatted} (${timeDiffDesc}) पर निर्धारित है। निर्देश: ${nextDose.instructions || 'पानी के साथ लें।'}`,
          te: `మీ తదుపరి మందుల మోతాదు ${nextDose.medicineName} (${nextDose.dose}) సమయం ${timeFormatted} (${timeDiffDesc}). సూచన: ${nextDose.instructions || 'డాక్టర్ సూచించినట్లు తీసుకోండి.'}`,
          ml: `നിങ്ങളുടെ അടുത്ത ഡോസ് ${nextDose.medicineName} (${nextDose.dose}) സമയം ${timeFormatted} (${timeDiffDesc}) ആണ്. നിർദ്ദേശം: ${nextDose.instructions || 'വെള്ളത്തോടൊപ്പം കഴിക്കുക.'}`,
          kn: `ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿಯ ಡೋಸ್ ${nextDose.medicineName} (${nextDose.dose}) ಸಮಯ ${timeFormatted} (${timeDiffDesc}) ಆಗಿದೆ. ಸೂಚನೆ: ${nextDose.instructions || 'ವೈದ್ಯರ ಸಲಹೆಯಂತೆ ಸೇವಿಸಿ.'}`,
        };

        return {
          source: 'VOICE_AI',
          responseText: responses[langKey] || responses.en,
          language: langKey,
          isMedicalQuery: false,
          destinationRoute: '/medicines',
          suggestedAction: 'NAVIGATE',
          medicationData: {
            type: 'NEXT_DOSE',
            title: `Next Dose: ${nextDose.medicineName} (${nextDose.dose})`,
            details: `Scheduled at ${nextDose.scheduledTime} · ${timeDiffDesc}`,
            medicineName: nextDose.medicineName,
            dose: nextDose.dose,
            scheduledTime: nextDose.scheduledTime,
            instructions: nextDose.instructions,
          },
        };
      } else {
        const noMedsMsg: Record<string, string> = {
          en: 'You do not have any active medication doses scheduled in your diary. Opening your medicines list now.',
          ta: 'உங்களிடம் தற்போது தீவிர மருந்து அட்டவணை எதுவும் இல்லை. மருந்துகள் பக்கத்தைத் திறக்கிறேன்.',
          hi: 'आपके पास वर्तमान में कोई निर्धारित दवा की खुराक नहीं है। दवाइयों का पृष्ठ खोल रहा हूँ।',
          te: 'మీకు ప్రస్తుతానికి ఎలాంటి మందుల షెడ్యూల్ లేదు. మందుల పేజీని తెరుస్తున్నాను.',
          ml: 'നിലവിൽ ഷെഡ്യൂൾ ചെയ്ത മരുന്നുകളൊന്നും ഇല്ല. മരുന്നുകളുടെ പേജ് തുറക്കുന്നു.',
          kn: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಔಷಧಿ ಡೋಸ್ ನಿಗದಿಯಾಗಿಲ್ಲ. ಔಷಧಿಗಳ ಪುಟವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
        };

        return {
          source: 'VOICE_AI',
          responseText: noMedsMsg[langKey] || noMedsMsg.en,
          language: langKey,
          isMedicalQuery: false,
          destinationRoute: '/medicines',
          suggestedAction: 'NAVIGATE',
        };
      }
    }

    // 5.6 ADHERENCE LOOKUP ("Did I take my medicine?", "Have I taken my pills?")
    const isDidITakeQuery =
      /\b(?:did\s+i\s+take\s+(?:my\s+)?(?:medicine|pill|pills|medication|dose)|have\s+i\s+taken\s+(?:my\s+)?(?:medicine|pill|pills|medication)|taken\s+my\s+medicine|did\s+i\s+take\s+medicine)\b/i.test(
        lower
      ) ||
      /(நான் மருந்து சாப்பிட்டேனா|क्या मैंने अपनी दवा ली|నేను నా మందులు వేసుకున్నానా|ഞാൻ മരുന്ന് കഴിച്ചോ|ನಾನು ಔಷಧಿ ತೆಗೆದುಕೊಂಡೆನಾ)/.test(
        raw
      );

    if (isDidITakeQuery) {
      const pid = request.patientId || 1;
      const todayStatus = await medicationPushNotificationService.getTodaysAdherence(pid);

      let summaryText = '';
      if (todayStatus.dosesTakenCount > 0 && todayStatus.pendingDosesCount === 0) {
        const responses: Record<string, string> = {
          en: `Yes! You have taken all ${todayStatus.dosesTakenCount} of your scheduled medication doses for today (${todayStatus.adherencePercentage}% adherence). Excellent adherence!`,
          ta: `ஆம்! இன்றைய அனைத்து (${todayStatus.dosesTakenCount}) மருந்து டோஸ்களையும் நீங்கள் உட்கொண்டுவிட்டீர்கள் (${todayStatus.adherencePercentage}% நிறைவு). மிகச் சிறந்தது!`,
          hi: `हाँ! आपने आज की अपनी सभी ${todayStatus.dosesTakenCount} निर्धारित खुराकें ले ली हैं (${todayStatus.adherencePercentage}% पूर्ण)। बहुत अच्छा!`,
          te: `అవును! మీరు ఈరోజు మీ అన్ని (${todayStatus.dosesTakenCount}) మందుల మోతాదులను తీసుకున్నారు (${todayStatus.adherencePercentage}% పూర్తి). చాలా బాగుంది!`,
          ml: `അതെ! ഇന്നത്തെ എല്ലാ (${todayStatus.dosesTakenCount}) ഡോസ് മരുന്നുകളും നിങ്ങൾ കഴിച്ചു കഴിഞ്ഞു (${todayStatus.adherencePercentage}% പൂർത്തിയായി). വളരെ നല്ലത്!`,
          kn: `ಹೌದು! ನೀವು ಇಂದಿನ ಎಲ್ಲಾ (${todayStatus.dosesTakenCount}) ಔಷಧಿ ಡೋಸ್‌ಗಳನ್ನು ಸೇವಿಸಿದ್ದೀರಿ (${todayStatus.adherencePercentage}% ಪೂರ್ಣಗೊಂಡಿದೆ). ಅತ್ಯುತ್ತಮ!`,
        };
        summaryText = responses[langKey] || responses.en;
      } else if (todayStatus.dosesTakenCount > 0 && todayStatus.pendingDosesCount > 0) {
        const responses: Record<string, string> = {
          en: `According to your health records: You have taken ${todayStatus.dosesTakenCount} dose(s) today. You still have ${todayStatus.pendingDosesCount} pending dose(s) scheduled. Opening Medicines to review.`,
          ta: `பதிவேட்டின்படி: இன்று ${todayStatus.dosesTakenCount} டோஸ் உட்கொண்டுள்ளீர்கள். இன்னும் ${todayStatus.pendingDosesCount} டோஸ் மீதமுள்ளது. மருந்துகள் பக்கத்தைத் திறக்கிறேன்.`,
          hi: `रिकॉर्ड्स के अनुसार: आपने आज ${todayStatus.dosesTakenCount} खुराक ली है। अभी भी ${todayStatus.pendingDosesCount} खुराक बाकी है। दवा सूची खोल रहा हूँ।`,
          te: `రికార్డుల ప్రకారం: మీరు ఈరోజు ${todayStatus.dosesTakenCount} మోతాదు తీసుకున్నారు. ఇంకా ${todayStatus.pendingDosesCount} మోతాదు(లు) తీసుకోవాల్సి ఉంది.`,
          ml: `റെക്കോർഡുകൾ പ്രകാരം: നിങ്ങൾ ഇന്ന് ${todayStatus.dosesTakenCount} ഡോസ് കഴിച്ചു. ഇനിയും ${todayStatus.pendingDosesCount} ഡോസ് കഴിക്കാനുണ്ട്.`,
          kn: `ದಾಖಲೆಗಳ ಪ್ರಕಾರ: ನೀವು ಇಂದು ${todayStatus.dosesTakenCount} ಡೋಸ್ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ. ಇನ್ನೂ ${todayStatus.pendingDosesCount} ಡೋಸ್ ಬಾಕಿಯಿದೆ.`,
        };
        summaryText = responses[langKey] || responses.en;
      } else {
        const responses: Record<string, string> = {
          en: `According to your records today, you have not marked any medication doses as taken yet. You have ${todayStatus.totalDosesScheduled} scheduled dose(s) today. Opening Medicines to mark as taken.`,
          ta: `இன்றைய பதிவுகளின்படி, நீங்கள் எந்த மருந்தையும் உட்கொண்டதாக பதிவு செய்யவில்லை. இன்று ${todayStatus.totalDosesScheduled} டோஸ் உள்ளது. குறிக்க மருந்துகள் பக்கத்தைத் திறக்கிறேன்.`,
          hi: `आज के रिकॉर्ड के अनुसार, आपने अभी तक कोई दवा नहीं ली है। आज आपकी ${todayStatus.totalDosesScheduled} खुराकें निर्धारित हैं। मार्क करने के लिए पेज खोल रहा हूँ।`,
          te: `ఈరోజు రికార్డుల ప్రకారం, మీరు ఇంకా ఏ మందూ తీసుకోలేదు. ఈరోజు మీకు ${todayStatus.totalDosesScheduled} మోతాదులు ఉన్నాయి.`,
          ml: `ഇന്നത്തെ രേഖകൾ പ്രകാരം, നിങ്ങൾ ഇതുവരെ മരുന്നുകളൊന്നും കഴിച്ചതായി അടയാളപ്പെടുത്തിയിട്ടില്ല. ഇന്ന് ${todayStatus.totalDosesScheduled} ഡോസ് ഉണ്ട്.`,
          kn: `ಇಂದಿನ ದಾಖಲೆಗಳ ಪ್ರಕಾರ, ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಂಡಿಲ್ಲ. ಇಂದು ${todayStatus.totalDosesScheduled} ಡೋಸ್ ನಿಗದಿಯಾಗಿದೆ.`,
        };
        summaryText = responses[langKey] || responses.en;
      }

      return {
        source: 'VOICE_AI',
        responseText: summaryText,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/medicines',
        suggestedAction: 'NAVIGATE',
        medicationData: {
          type: 'TODAY_ADHERENCE',
          title: `Today's Adherence: ${todayStatus.dosesTakenCount}/${todayStatus.totalDosesScheduled} Taken (${todayStatus.adherencePercentage}%)`,
          details: `${todayStatus.pendingDosesCount} pending dose(s)`,
          adherenceRate: todayStatus.adherencePercentage,
          doses: todayStatus.doses,
        },
      };
    }

    // 6. MEDICAL RECORDS NAVIGATION ("Show my medical records", "Open medicines")
    if (/\b(?:show|open|view|display)\s+(?:my\s+)?medical\s+records\b/i.test(lower) || lower === 'medical records' || lower === 'open records') {
      const recMsg: Record<string, string> = {
        en: 'Opening your Medical Records.',
        ta: 'உங்கள் மருத்துவப் பதிவேடுகளைத் திறக்கிறேன்.',
        hi: 'आपके मेडिकल रिकॉर्ड्स खोल रहा हूँ।',
        te: 'మీ వైద్య రికార్డులను తెరుస్తున్నాను.',
        ml: 'നിങ്ങളുടെ മെഡിക്കൽ രേഖകൾ തുറക്കുന്നു.',
        kn: 'ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: recMsg[langKey] || recMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/records',
        suggestedAction: 'NAVIGATE',
      };
    }

    if (/\b(?:open|show|view)\s+medicines\b/i.test(lower) || lower === 'medicines') {
      const medsMsg: Record<string, string> = {
        en: 'Opening your medicines list and schedule.',
        ta: 'உங்கள் மருந்துகள் பட்டியல் மற்றும் அட்டவணையைத் திறக்கிறேன்.',
        hi: 'आपकी दवाइयों की सूची और समय-सारणी खोल रहा हूँ।',
        te: 'మీ మందుల జాబితా మరియు షెడ్యూల్‌ను తెరుస్తున్నాను.',
        ml: 'നിങ്ങളുടെ മരുന്നുകളുടെ പട്ടിക തുറക്കുന്നു.',
        kn: 'ನಿಮ್ಮ ಔಷಧಿಗಳ ಪಟ್ಟಿಯನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: medsMsg[langKey] || medsMsg.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/medicines',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 7. GREETINGS & CASUAL CONVERSATION
    if (/^(hi|hello|hey|namaste|vanakkam|namaskaram|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
      const greetings: Record<string, string> = {
        en: 'Hello! I am Medora Voice AI. How can I help you navigate or use the application today?',
        ta: 'வணக்கம்! நான் மெடோரா வாய்ஸ் AI. பயன்பாட்டைப் பயன்படுத்த இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
        hi: 'नमस्ते! मैं मेडोरा वॉयस एआई हूँ। मैं आज ऐप का उपयोग करने में आपकी क्या सहायता कर सकता हूँ?',
        te: 'నమస్కారం! నేను మెడోరా వాయిస్ AI. మీకు ఎలా సహాయపడగలను?',
        ml: 'നമസ്കാരം! ഞാൻ മെഡോറ വോയ്സ് AI ആണ്. ഞാൻ എങ്ങനെ സഹായിക്കണം?',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ಮೆಡೋರಾ ವಾಯ್ಸ್ AI. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      };

      return {
        source: 'VOICE_AI',
        responseText: greetings[langKey] || greetings.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 8. How are you?
    if (/how are you|how do you do/i.test(lower) || /எப்படி இருக்கிறீர்கள்|कैसे हैं|ఎలా ఉన్నారు|ఎങ്ങനെയുണ്ട്|ಹೇಗಿದ್ದೀರಿ/.test(raw)) {
      const howAreYou: Record<string, string> = {
        en: 'I am doing well, thank you for asking! I am ready to help you navigate Medora or answer questions about how to use the app.',
        ta: 'நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! மெடோரா பயன்பாட்டை இயக்க நான் தயாராக இருக்கிறேன்.',
        hi: 'मैं ठीक हूँ, पूछने के लिए धन्यवाद! मैं मेडोरा को संचालित करने में आपकी सहायता के लिए तैयार हूँ।',
        te: 'నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.',
        ml: 'എനിക്ക് സുഖമാണ്, ചോദിച്ചതിന് നന്ദി! മെഡോറ ഉപയോഗിക്കാൻ സഹായിക്കാൻ ഞാൻ തയ്യാറാണ്.',
        kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: howAreYou[langKey] || howAreYou.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 9. Thank you
    if (/thank|thanks|dhanyawad|nandri/i.test(lower) || /நன்றி|धन्यवाद|ధన్యవాదాలు|നന്ദി|ಧನ್ಯವಾದಗಳು/.test(raw)) {
      const thankYou: Record<string, string> = {
        en: 'You are very welcome! Let me know if you need anything else.',
        ta: 'மிக்க மகிழ்ச்சி! மேலும் உதவி தேவைப்பட்டால் கேட்கவும்.',
        hi: 'आपका बहुत स्वागत है! किसी भी अन्य सहायता के लिए मुझे बताएं।',
        te: 'మీకు స్వాగతం! మరేదైనా అవసరమైతే చెప్పండి.',
        ml: 'സ്വാഗതം! മറ്റെന്തെങ്കിലും ആവശ്യമുണ്ടെങ്കിൽ അറിയിക്കുക.',
        kn: 'ನಿಮಗೆ ಸ್ವಾಗತ! ಬೇರೆ ಸಹಾಯ ಬೇಕಾದರೆ ತಿಳಿಸಿ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: thankYou[langKey] || thankYou.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 10. Navigation Commands (Deterministic offline pattern matching)
    const navMatch = voiceCommandMatcher.matchCommand(raw, 'auto');
    if (navMatch.matched && navMatch.route) {
      const routeKey = navMatch.route.replace('/', '');
      const routeNames: Record<string, Record<string, string>> = {
        medicines: {
          en: 'medicines',
          ta: 'மருந்துகள்',
          hi: 'दवाइयों',
          te: 'మందుల',
          ml: 'മരുന്നുകൾ',
          kn: 'ಔಷಧಿಗಳ',
        },
        records: {
          en: 'medical records',
          ta: 'மருத்துவ ஆவணங்கள்',
          hi: 'मेडिकल रिकॉर्ड्स',
          te: 'వైద్య రికార్డుల',
          ml: 'മെഡിക്കൽ രേഖകൾ',
          kn: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳ',
        },
        emergency: {
          en: 'emergency triage',
          ta: 'அவசர சிகிச்சை',
          hi: 'आपातकालीन सहायता',
          te: 'అత్యవసర చికిత్స',
          ml: 'അടിയന്തര ചികിത്സ',
          kn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ',
        },
        appointments: {
          en: 'appointments',
          ta: 'மருத்துவர் சந்திப்புகள்',
          hi: 'अपॉइंटमेंट',
          te: 'అపాయింట్‌మెంట్ల',
          ml: 'അപ്പോയിന്റ്മെന്റുകൾ',
          kn: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳ',
        },
        'report-scanner': {
          en: 'report scanner',
          ta: 'அறிக்கை ஸ்கேனர்',
          hi: 'रिपोर्ट स्कैनर',
          te: 'రిపోర్ట్ స్కానర్',
          ml: 'റിപ്പോർട്ട് സ്കാനർ',
          kn: 'ವರದಿ ಸ್ಕ್ಯಾನರ್',
        },
        dashboard: {
          en: 'dashboard',
          ta: 'முதன்மை பக்கம்',
          hi: 'डैशबोर्ड',
          te: 'డ్యాష్‌బోర్డ్',
          ml: 'ഡാഷ്‌ബോർഡ്',
          kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        },
      };

      const localizedRoute = routeNames[routeKey]?.[langKey] || routeKey;

      const navMessages: Record<string, string> = {
        en: `Opening ${localizedRoute} for you now.`,
        ta: `${localizedRoute} பக்கத்தைத் திறக்கிறேன்.`,
        hi: `${localizedRoute} पृष्ठ खोल रहा हूँ।`,
        te: `${localizedRoute} పేజీని తెరుస్తున్నాను.`,
        ml: `${localizedRoute} പേജ് തുറക്കുന്നു.`,
        kn: `${localizedRoute} ಪುಟವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.`,
      };

      return {
        source: 'VOICE_AI',
        responseText: navMessages[langKey] || navMessages.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: navMatch.route,
        suggestedAction: 'NAVIGATE',
      };
    }

    // 11. MEDICAL QUERIES & CLINICAL SYMPTOMS (e.g. "I have fever", "cough", "headache", "stomach pain")
    const isMedicalQuery =
      /\b(fever|cough|headache|pain|stomach pain|vomit|vomiting|diarrhea|dizzy|dizziness|bleeding|sore throat|blood sugar|sugar|glucose|disease|diagnosis|prescribe|symptom|not helping|medicine is not helping)\b/i.test(
        lower
      ) ||
      /\b(what could cause|what disease do i have|can i take|how much dose|analyze my report|is my bp high|explain my report)\b/i.test(
        lower
      ) ||
      /(காய்ச்சல்|இருமல்|தலைவலி|வயிற்று வலி|வாந்தி|ரத்தம்|நோய்)/.test(raw) ||
      /(बुखार|खांसी|सिरदर्द|पेट दर्द|उल्टी|रक्त|बीमारी)/.test(raw) ||
      /(జ్వరం|దగ్గు|తలనొప్పి|కడుపు నొప్పి|వాంతులు|రక్తం)/.test(raw) ||
      /(പനി|ചുമ|തലവേദന|വയറുവേദന|ഛർദ്ദി|രക്തം)/.test(raw) ||
      /(ಜ್ವರ|ಕೆಮ್ಮು|ತಲೆನೋವು|ಹೊಟ್ಟೆ ನೋವು|ವಾಂತಿ|ರಕ್ತ)/.test(raw);

    if (isMedicalQuery) {
      const medicalHandoff = await medicalService.analyzeMedicalRequest({
        patientInput: raw,
        language: langKey,
      });

      const transferMessages: Record<string, string> = {
        en: 'I noticed you mentioned medical symptoms or health questions. I have routed your query to Medora Medical AI for structured clinical assessment.',
        ta: 'நீங்கள் மருத்துவ அறிகுறிகள் அல்லது உடல்நலக் கேள்விகளைக் குறிப்பிட்டுள்ளீர்கள். மருத்துவ பகுப்பாய்விற்காக இதை மெடோரா மெடிக்கல் AI-க்கு மாற்றியுள்ளேன்.',
        hi: 'आपने स्वास्थ्य संबंधी लक्षणों या चिकित्सा प्रश्न का उल्लेख किया है। मैंने आपके अनुरोध को मेडोरा मेडिकल एआई को स्थानांतरित कर दिया है।',
        te: 'మీరు వైద్య లక్షణాలు లేదా ఆరోగ్య ప్రశ్నలను ప్రస్తావించారు. నేను మీ అభ్యర్థనను మెడోరా మెడికల్ AI కి పంపించాను.',
        ml: 'നിങ്ങൾ ആരോഗ്യ ലക്ഷണങ്ങളെക്കുറിച്ചാണ് ചോദിക്കുന്നത്. ശരിയായ പരിശോധനയ്ക്കായി ഇത് മെഡോറ മെഡിക്കൽ AI-ലേക്ക് കൈമാറിയിരിക്കുന്നു.',
        kn: 'ನೀವು ವೈದ್ಯಕೀಯ ಲಕ್ಷಣಗಳ ಕುರಿತು ತಿಳಿಸಿದ್ದೀರಿ. ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಇದನ್ನು ಮೆಡೋರಾ ಮೆಡಿಕಲ್ AI ಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: transferMessages[langKey] || transferMessages.en,
        language: langKey,
        isMedicalQuery: true,
        medicalHandoff,
        suggestedAction: 'TRANSFER_TO_MEDICAL_AI',
        destinationRoute: '/ai?tab=medical',
      };
    }

    // Default polite conversational voice response
    const defaultResponses: Record<string, string> = {
      en: 'I am Medora Voice AI. I can assist with navigation, greetings, and app help. If you have medical symptoms or health inquiries, please ask Medora Medical AI.',
      ta: 'நான் மெடோரா வாய்ஸ் AI. பக்கங்களை திறக்கவும், பொதுவான உரையாடல்களுக்கும் உதவ முடியும். மருத்துவ கேள்விகளுக்கு மெடிக்கல் AI-யிடம் கேட்கவும்.',
      hi: 'मैं मेडोरा वॉयस एआई हूँ। मैं नेविगेशन और ऐप सहायता में मदद कर सकता हूँ। चिकित्सा लक्षणों के लिए कृपया मेडिकल एआई से पूछें।',
      te: 'నేను మెడోరా వాయిస్ AI. నావిగేషన్ మరియు సాధారణ సహాయం చేయగలను. ఆరోగ్య లక్షణాల కోసం దయచేసి మెడికల్ AI ని అడగండి.',
      ml: 'ഞാൻ മെഡോറ വോയ്സ് AI ആണ്. ആപ്പ് ഉപയോഗിക്കാൻ സഹായിക്കാം. ലക്ഷണങ്ങൾക്ക് മെഡിക്കൽ AI ഉപയോഗിക്കുക.',
      kn: 'ನಾನು ಮೆಡೋರಾ ವಾಯ್ಸ್ AI. ನ್ಯಾವಿಗೇಷನ್ ಮತ್ತು ಆ್ಯಪ್ ಸಹಾಯಕ್ಕೆ ನಾನು ಸಿದ್ಧ. ವೈದ್ಯಕೀಯ ಲಕ್ಷಣಗಳಿಗೆ ಮೆಡಿಕಲ್ AI ಬಳಸಿ.',
    };

    return {
      source: 'VOICE_AI',
      responseText: defaultResponses[langKey] || defaultResponses.en,
      language: langKey,
      isMedicalQuery: false,
      suggestedAction: 'NONE',
    };
  }
}

export const voiceService = new VoiceService();
