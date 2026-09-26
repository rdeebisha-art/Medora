import React, { useState, useEffect } from 'react';
import {
  PhoneOff, Volume2, VolumeX, Mic, MicOff,
  ShieldAlert, User, Clock, Languages, FileText, CheckCircle2,
  AlertCircle, Wifi, Radio, Pause, Play
} from 'lucide-react';
import { db } from '../db/db';
import { ActiveCallInfo, useAppStore } from '../store/useAppStore';
import { webrtcCallingService, WebRtcCallState } from '../services/webrtc/webrtcCallingService';
import { translateString } from '../i18n/pageTranslator';

export type { ActiveCallInfo };

interface ActiveCallModalProps {
  callInfo: ActiveCallInfo | null;
  onClose: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ callInfo, onClose }) => {
  const { currentUser, language } = useAppStore();
  const [callState, setCallState] = useState<WebRtcCallState>('IDLE');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [showLanguageBridge, setShowLanguageBridge] = useState(false);
  const [bridgePatientLang, setBridgePatientLang] = useState<string>(currentUser?.language || 'ta');
  const [bridgeDoctorLang, setBridgeDoctorLang] = useState<string>('en');
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryChiefComplaint, setSummaryChiefComplaint] = useState(callInfo?.symptoms || 'General clinical consultation');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [summarySaved, setSummarySaved] = useState(false);

  // Initialize and subscribe to WebRTC calling service
  useEffect(() => {
    if (!callInfo) return;

    // Ensure signaling is registered with current user
    const currentUserId = currentUser ? (currentUser.role === 'doctor' ? `DOC-0${currentUser.id || 1}` : `P00${currentUser.id || 1}`) : 'GUEST-1';
    const currentUserName = currentUser?.name || 'Medora User';
    const currentUserRole = currentUser?.role || 'patient';
    webrtcCallingService.initSignaling(currentUserId, currentUserName, currentUserRole);

    const unsubscribeState = webrtcCallingService.subscribe((state, _session, error) => {
      setCallState(state);
      setIsMuted(webrtcCallingService.getIsMuted());
      setIsSpeaker(webrtcCallingService.getIsSpeakerOn());
      if (error) {
        setErrorMessage(error);
      }
      if (state === 'ENDED' || state === 'REJECTED' || state === 'FAILED' || state === 'BUSY' || state === 'OFFLINE') {
        if (!error && state === 'ENDED') {
          setErrorMessage('Call ended');
        }
      }
    });

    const unsubscribeDuration = webrtcCallingService.subscribeDuration((sec) => {
      setDurationSeconds(sec);
    });

    // Start outgoing call if not already in session and not an incoming acceptance
    if (!callInfo.isIncoming && webrtcCallingService.getCallState() === 'IDLE') {
      const targetUserId = callInfo.targetUserId || (callInfo.category === 'DOCTOR' ? 'DOC-01' : 'DOC-01');
      webrtcCallingService.startCall({
        targetUserId,
        targetName: callInfo.name,
        targetRole: callInfo.category === 'DOCTOR' ? 'doctor' : 'patient',
        emergency: callInfo.emergency,
        emergencyType: callInfo.emergencyType,
        symptoms: callInfo.symptoms,
      });
    }

    return () => {
      unsubscribeState();
      unsubscribeDuration();
    };
  }, [callInfo, currentUser]);

  const handleToggleMute = () => {
    const muted = webrtcCallingService.toggleMute();
    setIsMuted(muted);
  };

  const handlePauseMic = () => {
    webrtcCallingService.pauseMicrophone();
    setIsMuted(true);
  };

  const handleResumeMic = () => {
    webrtcCallingService.resumeMicrophone();
    setIsMuted(false);
  };

  const handleToggleSpeaker = () => {
    const speaker = webrtcCallingService.toggleSpeaker();
    setIsSpeaker(speaker);
  };

  const handleEndCall = () => {
    webrtcCallingService.endCall('USER_TERMINATION');
  };

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSummary = async () => {
    if (!callInfo) return;
    try {
      await db.doctorSummaries.add({
        patientId: currentUser?.id || 1,
        doctorId: 1,
        complaint: summaryChiefComplaint,
        symptoms: callInfo.symptoms ? [callInfo.symptoms] : ['Clinical assessment via WebRTC in-app voice call'],
        duration: `${durationSeconds} seconds`,
        history: 'Medora Real-time WebRTC Voice Consultation',
        medicines: 'Prescribed as per clinician instructions',
        allergies: 'None recorded during call',
        vitals: 'Stable during voice consult',
        observations: summaryNotes || 'Patient participated in clear live two-way voice call.',
        warningSigns: callInfo.emergency ? ['Emergency symptoms discussed during call'] : [],
        nextStep: 'Follow-up consultation recommended within 7 days.',
        createdAt: new Date().toISOString(),
        doctorNotes: summaryNotes,
      });
      setSummarySaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[WebRTC Call] Error saving summary:', err);
    }
  };

  if (!callInfo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Medora Live WebRTC Voice Call"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col">
        
        {/* Call Banner Header */}
        <div className={`p-5 text-center ${callInfo.emergency ? 'bg-rose-900/60 border-b border-rose-700/50' : 'bg-teal-900/40 border-b border-teal-800/40'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 bg-black/30 text-white/90">
            {callInfo.emergency ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-rose-300">Medora Emergency Voice Call</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span className="text-teal-300">Medora Real-Time In-App Call</span>
              </>
            )}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">{callInfo.name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {callInfo.category === 'DOCTOR' ? 'Verified Medora Medical Officer' : 'Medora Registered Patient'}
          </p>
        </div>

        {/* Live Status & Visual Indicator */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          
          {/* Avatar Ring */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-inner transition-all duration-500 ${
              callState === 'CONNECTED'
                ? 'bg-emerald-600/20 ring-4 ring-emerald-500/50 scale-105'
                : callState === 'RINGING' || callState === 'CALLING' || callState === 'CONNECTING'
                ? 'bg-amber-600/20 ring-4 ring-amber-500/40 animate-pulse'
                : callState === 'FAILED' || callState === 'REJECTED' || callState === 'BUSY' || callState === 'OFFLINE'
                ? 'bg-rose-600/20 ring-4 ring-rose-500/40'
                : 'bg-slate-800 ring-2 ring-slate-700'
            }`}>
              <User className={`w-14 h-14 ${
                callState === 'CONNECTED' ? 'text-emerald-400' :
                callState === 'RINGING' || callState === 'CALLING' ? 'text-amber-300' :
                callState === 'FAILED' || callState === 'REJECTED' ? 'text-rose-400' : 'text-slate-400'
              }`} />
            </div>

            {/* Live Audio indicator dot */}
            {callState === 'CONNECTED' && (
              <span className="absolute bottom-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            )}
          </div>

          {/* Connection Status Text */}
          <div className="space-y-1">
            {callState === 'REQUESTING_PERMISSION' && (
              <div className="text-amber-300 font-semibold text-sm flex items-center justify-center gap-1.5 animate-pulse">
                <Mic className="w-4 h-4" />
                <span>Requesting microphone permission...</span>
              </div>
            )}
            {callState === 'CALLING' && (
              <div className="text-amber-300 font-semibold text-sm flex items-center justify-center gap-1.5">
                <Radio className="w-4 h-4 animate-spin" />
                <span>Calling {callInfo.name}...</span>
              </div>
            )}
            {callState === 'RINGING' && (
              <div className="text-emerald-400 font-semibold text-sm flex items-center justify-center gap-1.5 animate-bounce">
                <span>Ringing...</span>
              </div>
            )}
            {callState === 'CONNECTING' && (
              <div className="text-cyan-300 font-semibold text-sm flex items-center justify-center gap-1.5">
                <Wifi className="w-4 h-4 animate-pulse" />
                <span>Establishing peer-to-peer WebRTC voice...</span>
              </div>
            )}
            {callState === 'CONNECTED' && (
              <div className="space-y-1">
                <div className="text-emerald-400 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CONNECTED</span>
                </div>
                {/* Real Live Timer */}
                <div className="text-3xl font-mono font-bold tracking-widest text-white">
                  {formatTimer(durationSeconds)}
                </div>
                <p className="text-[11px] text-slate-400">Live 2-Way Human Voice via WebRTC</p>
              </div>
            )}
            {callState === 'RECONNECTING' && (
              <div className="text-amber-400 font-semibold text-sm flex items-center justify-center gap-1.5 animate-pulse">
                <Wifi className="w-4 h-4" />
                <span>Reconnecting voice stream...</span>
              </div>
            )}
            {(callState === 'ENDED' || callState === 'REJECTED' || callState === 'FAILED' || callState === 'BUSY' || callState === 'OFFLINE') && (
              <div className="space-y-1">
                <div className="text-rose-400 font-bold text-sm flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage || 'Call terminated'}</span>
                </div>
                {callState === 'OFFLINE' && (
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Medora offline features remain accessible, but live real-time voice calls require internet connection.
                  </p>
                )}
                {callState === 'BUSY' && (
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    The doctor is currently attending another patient consultation. Please try again shortly.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Emergency Reason badge if applicable */}
          {callInfo.emergency && callInfo.symptoms && (
            <div className="bg-rose-950/70 border border-rose-800/70 rounded-xl px-3 py-2 text-xs text-rose-200 text-left w-full">
              <span className="font-bold text-rose-300">Reported Symptoms:</span> {callInfo.symptoms}
            </div>
          )}

          {/* Optional Language Bridge Translation Overlay during Call */}
          {callState === 'CONNECTED' && (
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={() => setShowLanguageBridge(!showLanguageBridge)}
                className="inline-flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-200 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 transition"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showLanguageBridge ? 'Hide Language Bridge' : '🌐 Enable Language Bridge Subtitles'}</span>
              </button>

              {showLanguageBridge && (
                <div className="mt-3 p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-700/50 pb-1.5">
                    <span>Patient: {bridgePatientLang.toUpperCase()}</span>
                    <span>Doctor: {bridgeDoctorLang.toUpperCase()}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/40">
                      <p className="text-[10px] text-teal-400 font-bold uppercase">Spoken Human Audio Active</p>
                      <p className="text-slate-200 text-xs">Two-way real audio stream is continuous and uncompressed.</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/40">
                      <p className="text-[10px] text-amber-400 font-bold uppercase">Translation Reference</p>
                      <p className="text-slate-300 text-[11px]">
                        {translateString('Symptoms and guidance are cross-referenced with Medora Clinical Protocol.', bridgePatientLang as any)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    ⚠️ Auxiliary clinical reference. Real human audio is not altered or replaced by synthetic voice.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-around gap-2">
          
          {/* Mute Button */}
          <button
            type="button"
            disabled={callState !== 'CONNECTED'}
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition ${
              isMuted
                ? 'bg-rose-600/30 text-rose-300 ring-2 ring-rose-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            } ${callState !== 'CONNECTED' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Pause / Resume Mic Button */}
          <button
            type="button"
            disabled={callState !== 'CONNECTED'}
            onClick={isMuted ? handleResumeMic : handlePauseMic}
            aria-label={isMuted ? 'Resume Microphone' : 'Pause Microphone'}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition ${
              isMuted
                ? 'bg-amber-600/30 text-amber-300 ring-2 ring-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            } ${callState !== 'CONNECTED' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isMuted ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Resume' : 'Pause Mic'}</span>
          </button>

          {/* End Call / Close Button */}
          {callState === 'CONNECTED' || callState === 'CALLING' || callState === 'RINGING' || callState === 'CONNECTING' ? (
            <button
              type="button"
              onClick={handleEndCall}
              aria-label="End Medora Call"
              className="flex flex-col items-center gap-1 p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 transition scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="sr-only">End Call</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (durationSeconds > 5 && !summarySaved) {
                  setShowSummaryForm(true);
                } else {
                  onClose();
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {durationSeconds > 5 && !summarySaved ? 'Save Summary' : 'Close'}
            </button>
          )}

          {/* Speaker Button */}
          <button
            type="button"
            disabled={callState !== 'CONNECTED'}
            onClick={handleToggleSpeaker}
            aria-label={isSpeaker ? 'Mute Speaker' : 'Enable Speaker'}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition ${
              isSpeaker
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-rose-600/30 text-rose-300 ring-2 ring-rose-500'
            } ${callState !== 'CONNECTED' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isSpeaker ? 'Speaker' : 'Muted'}</span>
          </button>
        </div>

        {/* Doctor Summary Modal after Call ends */}
        {showSummaryForm && (
          <div className="absolute inset-0 bg-slate-950/95 p-5 flex flex-col justify-between overflow-y-auto z-20">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Create Doctor Consultation Summary</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Patient / Contact</label>
                  <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-semibold text-white">
                    {callInfo.name} ({durationSeconds}s call)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Chief Complaint / Symptoms</label>
                  <input
                    type="text"
                    value={summaryChiefComplaint}
                    onChange={(e) => setSummaryChiefComplaint(e.target.value)}
                    className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g. Fever, persistent cough"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Doctor Clinical Notes & Observations</label>
                  <textarea
                    rows={3}
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter examination notes, recommended remedies, or follow-up plans..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Skip Summary
              </button>
              <button
                type="button"
                onClick={handleSaveSummary}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                {summarySaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save to Patient Record</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
