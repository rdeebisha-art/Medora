const fs = require("fs");
let content = fs.readFileSync("src/data/healthKnowledge/knowledgeBase.ts", "utf8");

const hindiTemplates = {
  FEVER: { primaryText: "आपको बुखार है, यह समझ गया। खूब पानी और ओ.आर.एस (ORS) पिएं। आराम करें।", followUpQuestion: "बुखार कितने दिनों से है? तापमान कितना है?", safetyGuidance: "यदि बुखार 3 दिन से अधिक रहे या 102°F से ऊपर जाए, तो तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र जाएं।" },
  BREATHING_DIFFICULTY: { primaryText: "⚠️ सांस लेने में तकलीफ एक आपातकालीन स्थिति है। घबराए नहीं, सीधे बैठें और गहरी सांस लेने की कोशिश करें।", followUpQuestion: "क्या छाती में दर्द या होंठ नीले पड़ रहे हैं?", safetyGuidance: "तुरंत 108 एम्बुलेंस को कॉल करें या नजदीकी सरकारी अस्पताल जाएं।" },
  CHEST_PAIN: { primaryText: "🚨 छाती में दर्द एक गंभीर आपातकाल है। कोई भारी काम न करें, शांत बैठें।", followUpQuestion: "क्या दर्द बाएं हाथ, जबड़े या पीठ में फैल रहा है?", safetyGuidance: "तुरंत 108 एम्बुलेंस को कॉल करें। स्वयं गाड़ी न चलाएं।" },
  COUGH_COLD: { primaryText: "खांसी और जुकाम के लिए गुनगुना पानी पिएं। अदरक की चाय और भाप लेना फायदेमंद है।", followUpQuestion: "खांसी सूखी है या बलगम के साथ?", safetyGuidance: "यदि खांसी एक हफ्ते से अधिक रहे तो डॉक्टर से सलाह लें।" },
  STOMACH_PAIN: { primaryText: "पेट दर्द के लिए तीखा भोजन न करें। छाछ या गाजी जैसा हल्का भोजन लें।", followUpQuestion: "क्या उल्टी या दस्त भी हो रहे हैं?", safetyGuidance: "यदि दर्द बहुत तेज हो या मल में खून आए तो तुरंत अस्पताल जाएं।" },
  HEADACHE_DIZZINESS: { primaryText: "सिरदर्द और चक्कर के लिए शांत अंधेरे कमरे में आराम करें। ब्लड प्रेशर जांचें।", followUpQuestion: "क्या नजर धुंधली हो रही है या शरीर के एक तरफ कमजोरी है?", safetyGuidance: "अचानक तेज सिरदर्द या एक तरफ पक्षघात होने पर तुरंत इमरजेंसी जाएं।" },
  MEDICINE_INQUIRY: { primaryText: "दवाइयां डॉक्टर या आशा कार्यकर्ता की सलाह अनुसार समय पर लें।", followUpQuestion: "आप किस दवा के बारे में जानना चाहते हैं?", safetyGuidance: "डॉक्टर की सलाह के बिना दवा की खुराक न बदलें।" },
  PREGNANCY_CARE: { primaryText: "गर्भावस्था में फोलिक एसिड और आयरन की गोलियां नियमित लें। पौष्टिक भोजन और पर्याप्त आराम जरूरी है।", followUpQuestion: "गर्भ का कितना महीना या हफ्ता चल रहा है?", safetyGuidance: "अधिक खून बहना, तेज सिरदर्द, या बच्चे की हलचल कम होने पर तुरंत अस्पताल जाएं।" },
  NEWBORN_CARE: { primaryText: "पहले 6 महीने बच्चे को केवल मां का दूध दें। बच्चे को गर्म रखें।", followUpQuestion: "क्या बच्चा अच्छे से दूध पी रहा है? नाभि सूख रही है?", safetyGuidance: "बच्चा दूध न पीए, बुखार हो, या पीलिया दिखे तो तुरंत डॉक्टर को दिखाएं।" },
  CHILD_CARE: { primaryText: "बच्चों को संतुलित पौष्टिक आहार, स्वच्छ जल और समय पर टीकाकरण जरूरी है।", followUpQuestion: "बच्चे की उम्र क्या है? क्या समस्या है?", safetyGuidance: "लगातार उल्टी, निर्जलीकरण या तेज बुखार होने पर डॉक्टर से संपर्क करें।" },
  ELDERLY_CARE: { primaryText: "बुजुर्गों को ब्लड प्रेशर और शुगर नियमित जांचना चाहिए। घर में गिरने से बचें।", followUpQuestion: "उनकी उम्र क्या है? क्या नियमित दवाइयां ले रहे हैं?", safetyGuidance: "अचानक बेहोशी या पक्षघात जैसे लक्षण दिखें तो तुरंत इमरजेंसी जाएं।" },
  DIABETES_CARE: { primaryText: "मधुमेह के लिए कम कार्बोहाइड्रेट वाला भोजन, रोज टहलना और समय पर दवा जरूरी है।", followUpQuestion: "आखिरी बार जांचा गया ब्लड शुगर कितना था?", safetyGuidance: "शुगर 70 से नीचे या 300 से ऊपर होने पर तुरंत डॉक्टर से संपर्क करें।" },
  NUTRITION_CARE: { primaryText: "स्वस्थ शरीर के लिए हरी पत्तेदार सब्जियां, दाल, अंडा और पर्याप्त स्वच्छ जल जरूरी है।", followUpQuestion: "किसके लिए पोषण सलाह चाहिए (बच्चा / गर्भवती / वयस्क)?", safetyGuidance: "एनीमिया से बचने के लिए मूंगा की पत्तियां, गुड़, खजूर जैसे आयरन युक्त आहार लें।" },
  VACCINATION_INQUIRY: { primaryText: "सरकार के यूआईपी (UIP) कार्यक्रम के तहत सभी टीके सरकारी स्वास्थ्य केंद्रों में मुफ्त हैं।", followUpQuestion: "बच्चे की उम्र क्या है? अब तक कौन से टीके लगे हैं?", safetyGuidance: "जन्म के तुरंत बाद बीसीजी, पोलियो की बूंदें और हेपेटाइटिस बी टीका दिलाएं।" },
  EMERGENCY_TRIAGE: { primaryText: "🚨 यह एक आपातकालीन स्थिति प्रतीत होती है। तुरंत 108 एम्बुलेंस को कॉल करें या नजदीकी अस्पताल जाएं।", followUpQuestion: "क्या व्यक्ति होश में है? सांस ले रहा है?", safetyGuidance: "बेहोश व्यक्ति को खाना या पानी न दें। शांत रखें।" },
  GENERAL_HEALTH: { primaryText: "नमस्ते, आपकी स्वास्थ्य जानकारी नोट की गई। पर्याप्त आराम, स्वच्छ जल और पौष्टिक भोजन लें।", followUpQuestion: "कृपया अपने लक्षण या स्वास्थ्य समस्या के बारे में विस्तार से बताएं?", safetyGuidance: "यदि लक्षण कुछ दिनों तक रहें तो अपने गांव की आशा कार्यकर्ता या डॉक्टर से जांच कराएं।" }
};

for (const intent of Object.keys(hindiTemplates)) {
  const tmpl = hindiTemplates[intent];
  const hiBlock = "\n      'hi-IN': {\n        primaryText: '" + tmpl.primaryText.replace(/'/g, "\\'") + "',\n        followUpQuestion: '" + tmpl.followUpQuestion.replace(/'/g, "\\'") + "',\n        safetyGuidance: '" + tmpl.safetyGuidance.replace(/'/g, "\\'") + "'\n      }";
  
  const intentStart = content.indexOf(intent + ": {");
  if (intentStart === -1) continue;
  
  const enStart = content.indexOf("'en-IN': {", intentStart);
  if (enStart === -1) continue;
  
  let braceCount = 0;
  let i = enStart;
  let enEnd = -1;
  while (i < content.length) {
    if (content[i] === "{") braceCount++;
    if (content[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        enEnd = i + 1;
        break;
      }
    }
    i++;
  }
  if (enEnd === -1) continue;
  
  content = content.slice(0, enEnd) + "," + hiBlock + content.slice(enEnd);
}

fs.writeFileSync("src/data/healthKnowledge/knowledgeBase.ts", content);
console.log("Done - added Hindi templates to knowledge base");
