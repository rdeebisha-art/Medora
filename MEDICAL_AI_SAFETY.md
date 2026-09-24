# Medora — Medical AI Safety Architecture

## 1. Decision-Support Boundary
Medora is an evidence-based clinical decision-support and health navigation tool.
- It does **NOT** provide a definitive medical diagnosis.
- It does **NOT** replace a licensed healthcare professional.
- It explicitly frames potential conditions as **"Possible Causes (Not a Confirmed Diagnosis)"** and directs users to confirmatory clinical assessment or laboratory testing.

---

## 2. Medical Answer Safety Engine (`medicalSafetyEngine.ts`)
Before any response reaches the user, it passes through `validateSafety()`:
1. **Definitive Diagnosis Check**: Rejects phrases claiming confirmed diagnoses.
2. **Prescribing Safety Check**: Rejects generated dosages, prescription instructions, or recommendations to stop medication.
3. **Unsupported Remedy Check**: Blocks unverified folk or miracle remedies not present in the vetted database.
4. **Source Verification**: Verifies that every guidance item carries a valid public health citation (e.g., WHO, MoHFW, ICMR).
5. **Emergency Escalation**: Instantly overrides standard guidance if red-flag symptoms (chest pain, breathlessness, newborn lethargy) are present.

---

## 3. Patient Data Isolation Guard (`patientIsolationGuard.ts`)
Strict boundaries ensure zero cross-contamination of patient records:
- All database queries filter strictly by authenticated `patientId`.
- Automated isolation tests assert that records belonging to Patient `P-1` can never be accessed by Patient `P-2`.
- Memory caches and conversation history are scoped to the active patient session and cleared on logout.

---

## 4. Multilingual & Voice Safety
- **Same-Language Speech Synthesis**: If the user speaks in Tamil, Telugu, Hindi, Malayalam, or Kannada, speech output is locked to that exact language.
- **No English Audio Leakage**: If an Indic voice pack is unavailable on a client device, the speech synthesizer halts audio playback and provides readable text on screen rather than speaking in English.
- **Multilingual Unicode Detection**: Recognizes Indic scripts directly and preserves clinical context even when English medical loanwords appear.

---

## 5. Telephony and SMS Transparency
- **Real Phone Numbers**: Use native `tel:+91...` URIs allowing standard device cellular dialing.
- **Toll-Free Simulation**: Clearly marked as **"AI Telephone Service – Demo"** without deceptive claims of live cellular connection when running offline.
- **SMS Statuses**: Accurately shows `Queued`, `Sending`, `Sent`, `Delivered`, `Failed`, or `Pending Sync` rather than falsely claiming instant cellular delivery.
