import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, AlertCircle, CheckCircle2, RotateCcw, Sparkles, Volume2, ShieldAlert, ArrowRight } from 'lucide-react';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { parseSpokenSymptoms, ParsedVoiceTriage } from '../services/voice/speechTriageParser';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { useAppStore } from '../store/useAppStore';

interface HandsFreeVoiceTriageProps {
  onTriageExtracted: (result: ParsedVoiceTriage) => void;
  onEmergencyDetected?: (reason: string) => void;
  initialLanguage?: SupportedLanguageCode;
  compact?: boolean;
}

const VOICE_LANG_OPTIONS: Array<{ code: SupportedLanguageCode; label: string }> = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
];

export const HandsFreeVoiceTriage: React.FC<HandsFreeVoiceTriageProps> = ({
  onTriageExtracted,
  onEmergencyDetected,
  initialLanguage,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();

  const getDefaultLang = (): SupportedLanguageCode => {
    if (initialLanguage) return initialLanguage;
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-IN';
    }
  };

  const [selectedLang, setSelectedLang] = useState<SupportedLanguageCode>(getDefaultLang());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceTriage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  useEffect(() => {
    setIsSupported(speechRecognitionService.isSupported());
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setIsSuccessFeedback(false);
    setTranscript('');
    setParsedResult(null);

    const started = speechRecognitionService.startListening(selectedLang, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (text: string, isFinal: boolean) => {
        setTranscript(text);
        const parsed = parseSpokenSymptoms(text);
        setParsedResult(parsed);

        if (parsed.isEmergency && onEmergencyDetected && parsed.emergencyReason) {
          onEmergencyDetected(parsed.emergencyReason);
        }

        if (isFinal) {
          setIsListening(false);
          setIsSuccessFeedback(true);
          onTriageExtracted(parsed);
        }
      },
      onError: (errMsg: string, errCode?: string) => {
        setIsListening(false);
        if (errCode !== 'aborted') {
          setErrorMessage(errMsg);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    setIsListening(false);

    if (transcript.trim()) {
      const parsed = parseSpokenSymptoms(transcript);
      setParsedResult(parsed);
      setIsSuccessFeedback(true);
      onTriageExtracted(parsed);
    }
  };

  const handleApplyManually = () => {
    if (parsedResult) {
      setIsSuccessFeedback(true);
      onTriageExtracted(parsedResult);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="flex-1">
          <span className="font-bold">Browser Web Speech API Notice:</span> Speech recognition is not supported in this browser. You can type your symptoms directly in the form below.
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
          }`}
          title="Speak symptoms using Web Speech API"
        >
          {isListening ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <MicOff className="w-3.5 h-3.5" />
              <span>Stop Speaking</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-purple-700" />
              <span>Speak Symptoms</span>
            </>
          )}
        </button>

        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value as SupportedLanguageCode)}
          disabled={isListening}
          className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-700 cursor-pointer"
        >
          {VOICE_LANG_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>

        {isListening && (
          <span className="text-[11px] text-red-600 font-semibold animate-pulse truncate max-w-[200px]">
            {transcript || 'Listening... speak symptoms'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      isListening
        ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-200'
        : 'bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-teal-50/70 border-purple-200 shadow-2xs'
    } p-3.5 sm:p-4 space-y-3`}>
      {/* Header bar with Voice Control & Language selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
            isListening
              ? 'bg-red-600 text-white shadow-md animate-bounce'
              : 'bg-purple-700 text-white shadow-xs'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <span>Hands-Free Voice Triage</span>
              <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                Web Speech API
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Speak your symptoms naturally in your language for automatic triage &amp; reasoning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Language selector */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as SupportedLanguageCode)}
            disabled={isListening}
            className="bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
          >
            {VOICE_LANG_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mic Action Button */}
          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[36px] ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-2 ring-red-300'
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Speak Symptoms</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Listening Wave / Pulse State */}
      {isListening && (
        <div className="bg-white/90 border border-purple-300 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-600 font-extrabold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Listening via Browser Web Speech...
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Silence auto-submits triage
            </span>
          </div>

          <div className="text-xs text-slate-800 bg-purple-50/50 p-2.5 rounded-lg min-h-[40px] italic border border-purple-100 font-medium">
            {transcript ? `"${transcript}"` : 'Listening for your symptoms (e.g. "I have high fever, dry cough and headache since 3 days")...'}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-end">
            <span>Tip: Speak symptoms, duration (e.g. "3 days"), and severity clearly.</span>
          </div>
        </div>
      )}

      {/* Real-time Parsed Preview if transcript exists */}
      {!isListening && transcript && parsedResult && (
        <div className="bg-white border border-purple-200 rounded-xl p-3 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Spoken Transcript Extracted
            </span>
            {isSuccessFeedback && (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Applied to Triage Form
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg italic">
            "{transcript}"
          </p>

          {/* Detected Symptom Badges */}
          <div className="flex flex-wrap gap-1.5 items-center pt-1">
            <span className="text-[11px] font-bold text-slate-500">Recognized:</span>
            {parsedResult.detectedSymptoms.length > 0 ? (
              parsedResult.detectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  className="text-[11px] bg-purple-100 text-purple-900 border border-purple-300 font-black px-2 py-0.5 rounded-md"
                >
                  ✓ {sym}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">Chief complaint text recorded</span>
            )}

            {parsedResult.detectedDuration && (
              <span className="text-[11px] bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded-md">
                ⏱ {parsedResult.detectedDuration}
              </span>
            )}

            {parsedResult.detectedSeverity && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                parsedResult.detectedSeverity === 'Severe' || parsedResult.detectedSeverity === 'Critical'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                ⚡ {parsedResult.detectedSeverity}
              </span>
            )}
          </div>

          {/* Re-apply button if user wants to refresh triage form with transcript */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleStartListening}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
              <RotateCcw className="w-3 h-3" />
              Speak Again
            </button>
            <button
              type="button"
              onClick={handleApplyManually}
              className="text-[11px] bg-purple-700 hover:bg-purple-800 text-white font-black flex items-center gap-1 px-3 py-1 rounded-lg shadow-2xs"
            >
              <span>Refresh Form</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Emergency Red Flag Alert */}
      {parsedResult?.isEmergency && parsedResult.emergencyReason && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 text-red-900 flex items-start gap-2.5 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-extrabold text-red-800">
              Emergency Warning Detected from Speech
            </div>
            <p className="font-semibold">{parsedResult.emergencyReason}</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-800 hover:text-amber-950 font-bold text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
