import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { db, CallSessionRecord } from '../db/db';
import { useAppStore } from '../store/useAppStore';
import {
  PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  ShieldAlert, Clock, Calendar, CheckCircle2, XCircle,
  RefreshCw, Stethoscope, User, Search, Filter, ShieldCheck
} from 'lucide-react';

export default function CallHistoryPage() {
  const { t } = useTranslation();
  const { currentUser, startDirectCall } = useAppStore();
  const [calls, setCalls] = useState<CallSessionRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'doctor' | 'patient'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      // 1. Load locally persisted WebRTC call sessions from IndexedDB
      const localCalls = await db.callSessions.toArray();

      // 2. Fetch server records if available
      let serverCalls: CallSessionRecord[] = [];
      try {
        const userId = currentUser ? (currentUser.role === 'doctor' ? `DOC-0${currentUser.id || 1}` : `P00${currentUser.id || 1}`) : '';
        const res = await fetch(`/api/calls/history${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`);
        if (res.ok) {
          const remote = await res.json();
          if (Array.isArray(remote)) {
            serverCalls = remote.map((r: any) => ({
              callId: r.callId,
              callerId: r.callerId,
              callerName: r.callerName,
              callerRole: r.callerRole,
              receiverId: r.receiverId,
              receiverName: r.receiverName,
              receiverRole: r.receiverRole,
              status: r.status,
              createdAt: r.createdAt || r.startedAt || new Date().toISOString(),
              acceptedAt: r.acceptedAt,
              endedAt: r.endedAt,
              durationSeconds: r.durationSeconds || 0,
              emergency: Boolean(r.emergency),
              emergencyType: r.emergencyType,
              consultationId: r.consultationId,
            }));
          }
        }
      } catch {
        // Offline fallback to IndexedDB only
      }

      // Merge and deduplicate by callId
      const map = new Map<string, CallSessionRecord>();
      [...localCalls, ...serverCalls].forEach((c) => {
        if (c.callId) {
          map.set(c.callId, { ...map.get(c.callId), ...c });
        }
      });

      // Sort newest first
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // If empty in demo environment, provide realistic initial demonstration history records
      if (merged.length === 0) {
        const initialDemoCalls: CallSessionRecord[] = [
          {
            callId: 'CALL-2026-0925-01',
            callerId: 'P001',
            callerName: 'Anitha Devi',
            callerRole: 'patient',
            receiverId: 'DOC-01',
            receiverName: 'Dr. Priya Sharma',
            receiverRole: 'doctor',
            status: 'ENDED',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            acceptedAt: new Date(Date.now() - 3600000 * 2 + 5000).toISOString(),
            endedAt: new Date(Date.now() - 3600000 * 2 + 385000).toISOString(),
            durationSeconds: 380,
            emergency: false,
            consultationId: 'CONS-2026-041',
            doctorNotes: 'Reviewed blood pressure management and routine medication adherence.',
          },
          {
            callId: 'CALL-2026-0925-02',
            callerId: 'P003',
            callerName: 'Ramu Patel',
            callerRole: 'patient',
            receiverId: 'DOC-01',
            receiverName: 'Dr. Priya Sharma',
            receiverRole: 'doctor',
            status: 'ENDED',
            createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            acceptedAt: new Date(Date.now() - 3600000 * 6 + 3000).toISOString(),
            endedAt: new Date(Date.now() - 3600000 * 6 + 180000).toISOString(),
            durationSeconds: 177,
            emergency: true,
            emergencyType: 'Breathing Difficulty',
            consultationId: 'EMERG-CONS-089',
            doctorNotes: 'Patient advised to sit upright. Oxygen saturation triage arranged at Rampur PHC.',
          },
          {
            callId: 'CALL-2026-0924-03',
            callerId: 'P002',
            callerName: 'Murugan Selvam',
            callerRole: 'patient',
            receiverId: 'DOC-02',
            receiverName: 'Dr. Rajesh Patel',
            receiverRole: 'doctor',
            status: 'ENDED',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            acceptedAt: new Date(Date.now() - 86400000 + 7000).toISOString(),
            endedAt: new Date(Date.now() - 86400000 + 490000).toISOString(),
            durationSeconds: 483,
            emergency: false,
            consultationId: 'CONS-2026-039',
            doctorNotes: 'Follow-up on fever and hydration. Oral rehydration advised.',
          },
          {
            callId: 'CALL-2026-0924-04',
            callerId: 'P005',
            callerName: 'Sunita Mehra',
            callerRole: 'patient',
            receiverId: 'DOC-01',
            receiverName: 'Dr. Priya Sharma',
            receiverRole: 'doctor',
            status: 'MISSED',
            createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
            durationSeconds: 0,
            emergency: false,
            consultationId: 'CONS-2026-035',
          },
        ];

        for (const item of initialDemoCalls) {
          try {
            await db.callSessions.add(item);
          } catch {}
        }
        setCalls(initialDemoCalls);
      } else {
        setCalls(merged);
      }
    } catch (e) {
      console.error('[CallHistory] Error loading calls:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [currentUser]);

  const filteredCalls = calls.filter((c) => {
    if (filter === 'emergency' && !c.emergency) return false;
    if (filter === 'doctor' && c.receiverRole !== 'doctor' && c.callerRole !== 'doctor') return false;
    if (filter === 'patient' && c.receiverRole !== 'patient' && c.callerRole !== 'patient') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName =
        c.callerName.toLowerCase().includes(q) ||
        c.receiverName.toLowerCase().includes(q) ||
        c.callId.toLowerCase().includes(q) ||
        (c.consultationId && c.consultationId.toLowerCase().includes(q));
      if (!matchName) return false;
    }
    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} />
            Connected
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Clock size={12} />
            Completed
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <PhoneMissed size={12} />
            Missed
          </span>
        );
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle size={12} />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const handleCallBack = (call: CallSessionRecord) => {
    const isCaller = currentUser?.name === call.callerName;
    const targetUserId = isCaller ? call.receiverId : call.callerId;
    const targetName = isCaller ? call.receiverName : call.callerName;
    const targetRole = isCaller ? call.receiverRole : call.callerRole;

    startDirectCall({
      name: targetName,
      phone: '',
      category: targetRole === 'doctor' ? 'DOCTOR' : 'EMERGENCY',
      targetUserId,
      callerId: currentUser ? (currentUser.role === 'doctor' ? `DOC-0${currentUser.id || 1}` : `P00${currentUser.id || 1}`) : 'P001',
      callerName: currentUser?.name || 'Medora User',
      callerRole: currentUser?.role === 'doctor' ? 'doctor' : currentUser?.role === 'admin' ? 'admin' : 'patient',
      receiverId: targetUserId,
      emergency: call.emergency,
      emergencyType: call.emergencyType,
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/50 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-teal-600/30">
                <PhoneCall size={13} />
                <span>WebRTC Voice Records</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Medora Call History</h1>
              <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
                Persistent log of real peer-to-peer audio calls between authenticated patients and clinicians.
              </p>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={fetchCalls}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Sync Calls</span>
              </button>
              <DemoDataBadge />
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 pt-4 border-t border-teal-700/60 flex items-center gap-2 text-xs text-teal-200/90 font-medium">
            <ShieldCheck size={14} className="text-emerald-300 flex-shrink-0" />
            <span>
              Privacy Guarantee: Voice calls connect directly via WebRTC peer connection. Call audio is never recorded, uploaded, or stored.
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient, doctor, or consultation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Calls ({calls.length})
            </button>
            <button
              onClick={() => setFilter('emergency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'emergency' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <ShieldAlert size={12} />
              Emergency
            </button>
            <button
              onClick={() => setFilter('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'doctor' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope size={12} />
              Doctors
            </button>
            <button
              onClick={() => setFilter('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'patient' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User size={12} />
              Patients
            </button>
          </div>
        </div>

        {/* Calls List Table/Cards */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading call records...</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <PhoneMissed className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No calls found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No recorded WebRTC voice sessions matching the current criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const startDate = new Date(call.createdAt);
              const dateStr = startDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = startDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={call.callId}
                  className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all hover:shadow-md ${
                    call.emergency ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Caller & Receiver Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                          call.emergency
                            ? 'bg-rose-100 text-rose-700'
                            : call.status === 'MISSED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {call.emergency ? (
                          <ShieldAlert className="w-5 h-5 animate-pulse" />
                        ) : call.status === 'MISSED' ? (
                          <PhoneMissed className="w-5 h-5" />
                        ) : (
                          <PhoneCall className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                            {call.callerName} → {call.receiverName}
                          </span>
                          {call.emergency && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                              🚨 EMERGENCY {call.emergencyType ? `(${call.emergencyType})` : ''}
                            </span>
                          )}
                          {getStatusBadge(call.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400" />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            {timeStr}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            Duration: {formatDuration(call.durationSeconds)}
                          </span>
                          {call.consultationId && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-500">ID: {call.consultationId}</span>
                            </>
                          )}
                        </div>

                        {call.doctorNotes && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                            <strong className="text-slate-800">Clinical Notes:</strong> {call.doctorNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleCallBack(call)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                          call.emergency
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-teal-700 hover:bg-teal-800 text-white'
                        }`}
                      >
                        <PhoneCall size={13} />
                        <span>Call Back</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
