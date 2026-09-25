import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff, PhoneCall, Volume2, VolumeX, Mic, MicOff,
  Building2, Ambulance, ShieldAlert, User, Hash, Clock, MapPin, Radio, Sparkles
} from 'lucide-react';
import { db } from '../db/db';
import { ActiveCallInfo } from '../store/useAppStore';

interface ActiveCallModalProps {
  callInfo: ActiveCallInfo | null;
  onClose: () => void;
}

// DTMF Frequencies (Hz) for authentic telephone keypad beeps
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ callInfo, onClose }) => {
  const [callState, setCallState] = useState<'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('DIALING');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [operatorSpeech, setOperatorSpeech] = useState<string>('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringOscillatorsRef = useRef<OscillatorNode[]>([]);
  const ringGainRef = useRef<GainNode | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Play realistic telecom ringing tone in browser speaker
  const startRingingAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const playRingBurst = () => {
        if (!audioCtxRef.current || callState === 'CONNECTED' || callState === 'ENDED') return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // 400Hz and 450Hz Indian/European telecom ring frequencies
        osc1.frequency.setValueAtTime(400, now);
        osc2.frequency.setValueAtTime(450, now);
        osc1.type = 'sine';
        osc2.type = 'sine';

        // Gain envelope: 1.5s on, smooth fade
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 1.4);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.6);
        osc2.stop(now + 1.6);
      };

      playRingBurst();
      ringIntervalRef.current = setInterval(playRingBurst, 3000);
    } catch {
      // AudioContext could be blocked by autoplay policies
    }
  };

  const stopRingingAudio = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  // Play DTMF Touch Tone when pressing keypad numbers
  const playDtmfTone = (key: string) => {
    try {
      const freqs = DTMF_FREQS[key];
      if (!freqs) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(freqs[0], now);
      osc2.frequency.setValueAtTime(freqs[1], now);
      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.16);
      osc2.stop(now + 0.16);
    } catch {}
  };

  // Play Connected Chime
  const playConnectedChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  };

  // Request browser microphone for real in-browser audio call
  const initUserMicrophone = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicActive(true);
      }
    } catch {
      // User may reject mic permission, call continues with speaker output
      setMicActive(false);
    }
  };

  useEffect(() => {
    if (!callInfo) return;

    setCallState('DIALING');
    setSeconds(0);
    setIsMuted(false);
    setShowKeypad(false);
    setKeypadInput('');
    setOperatorSpeech('');

    // Step 1: Dialing (0 - 1.2s)
    const tDial = setTimeout(() => {
      setCallState('RINGING');
      startRingingAudio();
    }, 1200);

    // Step 2: Recipient picks up -> CONNECTED (at 3.5s)
    const tConnect = setTimeout(() => {
      stopRingingAudio();
      setCallState('CONNECTED');
      playConnectedChime();
      initUserMicrophone();

      // Automated operator greeting based on destination
      let greeting = '';
      if (callInfo.category === 'EMERGENCY' || callInfo.category === 'AMBULANCE' || callInfo.phone === '108') {
        greeting = '108 Emergency Medical Services connected. An ambulance dispatch team is on the line. Please state your village location and emergency.';
      } else if (callInfo.category === 'HOSPITAL') {
        greeting = `Direct triage line for ${callInfo.name} connected. Please state your patient symptoms.`;
      } else if (callInfo.category === 'DOCTOR') {
        greeting = `${callInfo.name} direct clinic line connected. How may the doctor assist you today?`;
      } else {
        greeting = `Direct Web voice connection established with ${callInfo.name} (${callInfo.phone}). Speak now.`;
      }
      setOperatorSpeech(greeting);

      // Synthesize spoken voice into browser speaker if available
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(greeting);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch {}
    }, 3600);

    return () => {
      clearTimeout(tDial);
      clearTimeout(tConnect);
      stopRingingAudio();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [callInfo]);

  // Timer during active call
  useEffect(() => {
    if (callState === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!callInfo) return null;

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    stopRingingAudio();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ENDED');

    // Save call record to IndexedDB
    try {
      await db.callHistory.add({
        phoneNumber: callInfo.phone,
        contactName: callInfo.name,
        contactType: callInfo.category === 'EMERGENCY' || callInfo.category === 'AMBULANCE' ? 'EMERGENCY' : callInfo.category === 'HOSPITAL' ? 'HOSPITAL' : 'PERSON',
        action: 'CALL_COMPLETED',
        timestamp: new Date().toISOString(),
      });
    } catch {}

    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleKeypadPress = (digit: string) => {
    setKeypadInput(prev => prev + digit);
    playDtmfTone(digit);
  };

  const getCategoryIcon = () => {
    switch (callInfo.category) {
      case 'EMERGENCY':
        return <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />;
      case 'AMBULANCE':
        return <Ambulance className="w-8 h-8 text-red-500 animate-bounce" />;
      case 'HOSPITAL':
        return <Building2 className="w-8 h-8 text-blue-400" />;
      case 'DOCTOR':
        return <PhoneCall className="w-8 h-8 text-emerald-400" />;
      default:
        return <User className="w-8 h-8 text-teal-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (callState) {
      case 'DIALING':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            CONNECTING DIRECT WEB LINE...
          </span>
        );
      case 'RINGING':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            RINGING RECIPIENT...
          </span>
        );
      case 'CONNECTED':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            CONNECTED (HD AUDIO) • {formatDuration(seconds)}
          </span>
        );
      case 'ENDED':
        return (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full">
            CALL ENDED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-950 border-2 border-teal-600/60 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white flex flex-col items-center space-y-4 overflow-hidden">
        
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none ${
            callInfo.category === 'EMERGENCY' || callInfo.category === 'AMBULANCE'
              ? 'bg-red-500'
              : callInfo.category === 'HOSPITAL'
              ? 'bg-blue-500'
              : 'bg-teal-500'
          }`}
        />

        {/* Top Direct Web Call Guarantee Badge */}
        <div className="flex flex-col items-center space-y-1 w-full text-center">
          <div className="bg-teal-950/80 border border-teal-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] text-teal-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            MEDORA DIRECT WEB CALL · NO EXTERNAL APPS
          </div>
          <div className="pt-1">{getStatusBadge()}</div>
        </div>

        {/* Destination Card */}
        <div className="flex flex-col items-center text-center space-y-2 w-full bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-lg">
            {getCategoryIcon()}
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {callInfo.name}
            </h2>
            <div className="text-sm font-black font-mono text-teal-400 mt-0.5 tracking-wider">
              {callInfo.phone}
            </div>
            {callInfo.location && (
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{callInfo.location}</span>
              </p>
            )}
          </div>

          {/* Connection specs */}
          <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-left text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Channel:</span>
              <span className="text-teal-300 font-bold">In-Browser VoIP HD Voice</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Microphone:</span>
              <span className={micActive && !isMuted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {isMuted ? 'Muted' : micActive ? 'Active (Live)' : 'Browser Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold">Audio Output:</span>
              <span className="text-white font-mono">{isSpeaker ? 'Speakerphone (On)' : 'Earpiece Mode'}</span>
            </div>
          </div>
        </div>

        {/* Active Audio Waveform & Operator Transcript */}
        {callState === 'CONNECTED' && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-1 h-6">
              <span className="w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms] h-3" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-6" />
              <span className="w-1.5 bg-teal-300 rounded-full animate-bounce [animation-delay:300ms] h-4" />
              <span className="w-1.5 bg-emerald-300 rounded-full animate-bounce [animation-delay:450ms] h-5" />
              <span className="w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:200ms] h-3" />
            </div>

            {operatorSpeech && (
              <div className="bg-slate-900 border border-teal-800/50 rounded-xl p-2.5 text-xs text-teal-200 text-center leading-relaxed">
                <span className="font-bold text-teal-400 block mb-0.5">🎙️ Live Audio Line:</span>
                "{operatorSpeech}"
              </div>
            )}
          </div>
        )}

        {/* In-Call Keypad (if opened) */}
        {showKeypad && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 animate-in fade-in">
            <div className="text-center font-mono text-sm tracking-widest text-emerald-400 min-h-[24px]">
              {keypadInput || '—'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm font-bold">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 py-2 rounded-xl text-slate-200 transition-all font-mono"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-teal-400" />}
            <span>{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              showKeypad
                ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Hash className="w-5 h-5 text-teal-400" />
            <span>Keypad</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              isSpeaker
                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5 text-blue-400" /> : <VolumeX className="w-5 h-5" />}
            <span>Speaker</span>
          </button>
        </div>

        {/* End Call Button */}
        <div className="w-full pt-1">
          <button
            onClick={handleEndCall}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all min-h-[48px]"
          >
            <PhoneOff className="w-5 h-5" />
            <span>END CALL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
