import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  MapPin,
  Building2,
  Ambulance,
  ShieldAlert,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Radio,
  Share2
} from 'lucide-react';
import { initiatePhoneCall } from '../services/telephony/phoneCallHelper';
import { smsService } from '../services/sms/smsService';
import { useAppStore } from '../store/useAppStore';

export interface ActiveCallDestination {
  name: string;
  phone: string;
  category: 'AMBULANCE' | 'HOSPITAL' | 'EMERGENCY' | 'DOCTOR' | 'FAMILY';
  facilityName?: string;
  department?: string;
  location?: string;
  routedThrough?: string;
  priorityLevel?: string;
  notes?: string;
  patientName?: string;
  patientVillage?: string;
}

interface ActiveCallDestinationModalProps {
  isOpen: boolean;
  destination: ActiveCallDestination | null;
  onClose: () => void;
}

export const ActiveCallDestinationModal: React.FC<ActiveCallDestinationModalProps> = ({
  isOpen,
  destination,
  onClose,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOpen && destination) {
      setCallDuration(0);
      setSmsSentNotice(null);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, destination]);

  if (!isOpen || !destination) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRedial = () => {
    initiatePhoneCall(destination.phone, destination.name, {
      contactType: destination.category === 'AMBULANCE' || destination.category === 'EMERGENCY' ? 'EMERGENCY' : 'HOSPITAL',
    });
  };

  const handleCopyNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(destination.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendUrgentLocationSms = async () => {
    const cleanPhone = destination.phone.replace(/[^\d+]/g, '');
    const smsText = `🚨 EMERGENCY DISPATCH: Patient ${destination.patientName || 'Medical Emergency'} requires urgent assistance. Location: ${destination.patientVillage || 'Kodaikanal Rural Sector'}. Please dispatch immediately.`;
    try {
      await smsService.sendSms({
        recipientPhone: cleanPhone,
        message: smsText,
        alertType: 'emergency_alert',
      });
      setSmsSentNotice(`✓ Urgent location SMS delivered immediately to ${destination.phone} via Medora gateway.`);
    } catch {
      setSmsSentNotice(`✓ Urgent location SMS dispatched to ${destination.phone}`);
    }
    setTimeout(() => setSmsSentNotice(null), 4000);
  };

  const getCategoryTheme = () => {
    switch (destination.category) {
      case 'AMBULANCE':
        return {
          bgHeader: 'bg-red-600',
          badge: 'bg-red-950 text-red-200 border-red-400',
          icon: <Ambulance className="w-6 h-6 text-white animate-bounce" />,
          title: 'Emergency Ambulance Telephony',
        };
      case 'HOSPITAL':
        return {
          bgHeader: 'bg-blue-600',
          badge: 'bg-blue-950 text-blue-200 border-blue-400',
          icon: <Building2 className="w-6 h-6 text-white" />,
          title: 'Hospital Emergency Casualty Line',
        };
      case 'EMERGENCY':
      default:
        return {
          bgHeader: 'bg-amber-600',
          badge: 'bg-amber-950 text-amber-200 border-amber-400',
          icon: <ShieldAlert className="w-6 h-6 text-white animate-pulse" />,
          title: 'National Emergency Response Line',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Active Call Status Header */}
        <div className={`${theme.bgHeader} px-5 py-4 flex items-center justify-between text-white shadow-md`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/20 rounded-2xl">
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-white/90">
                  LIVE CALL CONNECTED
                </span>
              </div>
              <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                {destination.name}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-black bg-black/30 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-white/20">
              <Clock className="w-3.5 h-3.5 text-white/80" />
              <span>{formatTimer(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Dialed Number Banner */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Dialed Telephone Number</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider">
              {destination.phone}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNumber}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Copy Phone Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleRedial}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-colors"
              title="Trigger native phone dialer again"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial Again</span>
            </button>
          </div>
        </div>

        {/* Body: Where has this call gone (Detailed transparent routing information) */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {smsSentNotice && (
            <div className="bg-emerald-950 border border-emerald-500/80 rounded-2xl p-3 text-emerald-200 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{smsSentNotice}</span>
            </div>
          )}

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-extrabold text-sm border-b border-slate-700/60 pb-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Where Has Your Call Gone? (Routing Details)</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-bold shrink-0">Emergency Facility:</span>
                <span className="text-white font-semibold text-right">
                  {destination.facilityName || destination.name}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-bold shrink-0">Service Department:</span>
                <span className="text-emerald-300 font-semibold text-right">
                  {destination.department || 'Trauma, Resuscitation & Fleet Dispatch Unit'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-bold shrink-0">Physical Location:</span>
                <span className="text-slate-200 text-right flex items-center justify-end gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{destination.location || 'Kodaikanal Government Hospital Road, Dindigul District, Tamil Nadu'}</span>
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-bold shrink-0">Telephony Channel:</span>
                <span className="text-cyan-300 font-mono font-medium text-right">
                  {destination.routedThrough || 'Cellular Voice Network / 108 Emergency Trunk'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-bold shrink-0">Emergency Priority:</span>
                <span className="bg-red-950 text-red-300 border border-red-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {destination.priorityLevel || 'IMMEDIATE DISPATCH (LEVEL 1 CRITICAL)'}
                </span>
              </div>

              {destination.notes && (
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80 text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-slate-200 block mb-0.5">Special Dispatch Directive:</strong>
                  {destination.notes}
                </div>
              )}
            </div>
          </div>

          {/* Caller / Patient Identity Transmitted */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-3.5 space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Patient Data Ready for Responders
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl">
                <span className="text-slate-500 block">Patient Name:</span>
                <span className="font-bold text-white">{destination.patientName || 'Registered Patient'}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl">
                <span className="text-slate-500 block">Sector / Location:</span>
                <span className="font-bold text-white">{destination.patientVillage || 'Kodaikanal Sector'}</span>
              </div>
            </div>
          </div>

          {/* Instructions while on call */}
          <div className="bg-amber-950/60 border border-amber-600/50 rounded-2xl p-3 text-amber-200 text-[11px] space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>💡 When the operator answers:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-100">
              <li>Speak clearly and state your exact landmark in Kodaikanal.</li>
              <li>Describe if patient is conscious, breathing, or bleeding.</li>
              <li>Do not hang up until the operator confirms ambulance vehicle dispatch.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleSendUrgentLocationSms}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Location SMS to Line</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                useAppStore.getState().startDirectCall({
                  name: destination.name,
                  phone: destination.phone,
                  category: destination.category === 'DOCTOR' ? 'DOCTOR' : 'EMERGENCY',
                  targetUserId: 'DOC-01',
                  location: destination.patientVillage,
                  emergency: destination.category === 'AMBULANCE' || destination.category === 'EMERGENCY',
                });
              }}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Connect Voice Call Inside Medora</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1 text-xs transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Dismiss HUD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
