import { db, CallSessionRecord } from '../../db/db';
import { useAppStore } from '../../store/useAppStore';

export type WebRtcCallState =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'CALLING'
  | 'RINGING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ENDED'
  | 'REJECTED'
  | 'FAILED'
  | 'BUSY'
  | 'OFFLINE';

export interface ActiveSession {
  callId: string;
  targetUserId: string;
  targetName: string;
  targetRole: 'patient' | 'doctor' | 'admin';
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor' | 'admin';
  isCaller: boolean;
  emergency: boolean;
  emergencyType?: string;
  symptoms?: string;
  startTime?: number;
  connectedTime?: number;
}

export type WebRtcEventListener = (state: WebRtcCallState, session: ActiveSession | null, error?: string) => void;

class WebRtcCallingService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private ws: WebSocket | null = null;
  private activeSession: ActiveSession | null = null;
  private callState: WebRtcCallState = 'IDLE';
  private durationSeconds = 0;
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  private isMuted = false;
  private isSpeakerOn = true;
  private listeners: Set<WebRtcEventListener> = new Set();
  private durationListeners: Set<(seconds: number) => void> = new Set();
  private doctorPresence: Map<string, 'AVAILABLE' | 'BUSY' | 'OFFLINE'> = new Map();
  private presenceListeners: Set<(presence: Map<string, 'AVAILABLE' | 'BUSY' | 'OFFLINE'>) => void> = new Set();
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private restPollingTimer: ReturnType<typeof setInterval> | null = null;
  private isConnectedToSignaling = false;
  private currentUserId = '';
  private currentUserName = '';
  private currentUserRole = '';

  constructor() {
    this.ensureAudioElement();
  }

  private ensureAudioElement() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!this.remoteAudio) {
      const audio = document.createElement('audio');
      audio.id = 'medora-remote-audio';
      audio.autoplay = true;
      audio.setAttribute('playsinline', 'true');
      // Do not append with display block to prevent UI clutter
      audio.style.display = 'none';
      document.body.appendChild(audio);
      this.remoteAudio = audio;
    }
  }

  public subscribe(listener: WebRtcEventListener): () => void {
    this.listeners.add(listener);
    listener(this.callState, this.activeSession);
    return () => this.listeners.delete(listener);
  }

  public subscribeDuration(listener: (seconds: number) => void): () => void {
    this.durationListeners.add(listener);
    listener(this.durationSeconds);
    return () => this.durationListeners.delete(listener);
  }

  public subscribePresence(listener: (presence: Map<string, 'AVAILABLE' | 'BUSY' | 'OFFLINE'>) => void): () => void {
    this.presenceListeners.add(listener);
    listener(new Map(this.doctorPresence));
    return () => this.presenceListeners.delete(listener);
  }

  private notifyState(state: WebRtcCallState, error?: string) {
    this.callState = state;
    for (const listener of this.listeners) {
      try {
        listener(state, this.activeSession, error);
      } catch (err) {
        console.error('[WebRTC] Listener error:', err);
      }
    }
  }

  private notifyDuration(sec: number) {
    this.durationSeconds = sec;
    for (const listener of this.durationListeners) {
      try {
        listener(sec);
      } catch (err) {
        console.error('[WebRTC] Duration listener error:', err);
      }
    }
  }

  private notifyPresence() {
    const copy = new Map(this.doctorPresence);
    for (const listener of this.presenceListeners) {
      try {
        listener(copy);
      } catch (err) {
        console.error('[WebRTC] Presence listener error:', err);
      }
    }
  }

  public getCallState(): WebRtcCallState {
    return this.callState;
  }

  public getActiveSession(): ActiveSession | null {
    return this.activeSession;
  }

  public getDuration(): number {
    return this.durationSeconds;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsSpeakerOn(): boolean {
    return this.isSpeakerOn;
  }

  public getPresence(userId: string): 'AVAILABLE' | 'BUSY' | 'OFFLINE' {
    return this.doctorPresence.get(userId) || 'OFFLINE';
  }

  /**
   * Connect to Real-time Signaling WebSocket
   */
  public initSignaling(userId: string, userName: string, role: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentUserRole = role;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      // Re-register if user changed
      if (this.ws.readyState === WebSocket.OPEN) {
        this.sendSignal({
          type: 'REGISTER',
          userId,
          name: userName,
          role,
        });
      }
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/webrtc`;

      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.isConnectedToSignaling = true;
        this.sendSignal({
          type: 'REGISTER',
          userId,
          name: userName,
          role,
        });
        // Stop REST polling if WebSocket is open
        if (this.restPollingTimer) {
          clearInterval(this.restPollingTimer);
          this.restPollingTimer = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSignalingMessage(data);
        } catch (err) {
          console.error('[WebRTC] Signaling parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebRTC] Signaling WebSocket notice:', err);
      };

      ws.onclose = () => {
        this.isConnectedToSignaling = false;
        // Start fallback REST polling for incoming calls if offline from WebSocket
        this.startRestPolling();
        // Reconnect after 3s
        setTimeout(() => {
          if (this.currentUserId) {
            this.initSignaling(this.currentUserId, this.currentUserName, this.currentUserRole);
          }
        }, 3000);
      };
    } catch {
      this.startRestPolling();
    }
  }

  private sendSignal(payload: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      // HTTP Fallback
      fetch('/api/signaling/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('[WebRTC Signaling] HTTP fallback send error:', err));
    }
  }

  private startRestPolling() {
    if (this.restPollingTimer) return;
    this.restPollingTimer = setInterval(async () => {
      if (!this.currentUserId) return;
      try {
        const res = await fetch(`/api/signaling/poll/${encodeURIComponent(this.currentUserId)}`);
        if (res.ok) {
          const messages = await res.json();
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              this.handleSignalingMessage(msg);
            }
          }
        }
      } catch {}
    }, 2000);
  }

  private handleSignalingMessage(data: Record<string, any>) {
    switch (data.type) {
      case 'PRESENCE_UPDATE': {
        if (data.presence && typeof data.presence === 'object') {
          for (const [uid, status] of Object.entries(data.presence)) {
            this.doctorPresence.set(uid, status as any);
          }
          this.notifyPresence();
        }
        break;
      }

      case 'INCOMING_CALL': {
        const { callId, callerId, callerName, callerRole, emergency, emergencyType, symptoms, sdpOffer, timestamp } = data;
        
        // If already in a call, reject with BUSY
        if (this.callState === 'CONNECTED' || this.callState === 'CONNECTING' || this.callState === 'CALLING') {
          this.sendSignal({
            type: 'CALL_REJECT',
            callId,
            targetUserId: callerId,
            reason: 'BUSY',
          });
          return;
        }

        // Notify App Store so doctor sees the incoming call banner
        useAppStore.getState().setIncomingCall({
          callId,
          callerId,
          callerName: callerName || 'Patient',
          callerRole: callerRole || 'patient',
          receiverId: this.currentUserId,
          emergency: Boolean(emergency),
          emergencyType,
          symptoms,
          sdpOffer,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;
      }

      case 'CALL_RINGING': {
        if (this.callState === 'CALLING') {
          this.notifyState('RINGING');
        }
        break;
      }

      case 'CALL_ACCEPTED': {
        this.handleCallAccepted(data.sdpAnswer);
        break;
      }

      case 'CALL_REJECTED': {
        const reason = data.reason === 'BUSY' ? 'Doctor is currently on another Medora call.' : 'Call was declined by doctor.';
        this.cleanupCall(data.reason === 'BUSY' ? 'BUSY' : 'REJECTED', reason);
        break;
      }

      case 'CALL_FAILED': {
        this.cleanupCall('FAILED', data.message || 'Unable to establish voice connection.');
        break;
      }

      case 'ICE_CANDIDATE': {
        this.handleRemoteIceCandidate(data.candidate);
        break;
      }

      case 'CALL_ENDED': {
        this.cleanupCall('ENDED', 'Call ended by remote user');
        break;
      }

      case 'CALL_MISSED': {
        this.cleanupCall('ENDED', 'Doctor was unavailable (Missed Call)');
        break;
      }
    }
  }

  private async getIceServers(): Promise<RTCIceServer[]> {
    const defaultServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ];

    try {
      const res = await fetch('/api/webrtc/config');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
          return data.iceServers;
        }
      }
    } catch {}

    const customStun = (import.meta as any).env?.VITE_WEBRTC_STUN_URL;
    if (customStun) {
      defaultServers.unshift({ urls: customStun });
    }

    return defaultServers;
  }

  /**
   * Start a real outgoing WebRTC voice call
   */
  public async startCall(params: {
    targetUserId: string;
    targetName: string;
    targetRole?: 'patient' | 'doctor' | 'admin';
    emergency?: boolean;
    emergencyType?: string;
    symptoms?: string;
  }): Promise<void> {
    if (!navigator.onLine) {
      this.notifyState('OFFLINE', 'Internet connection is required for an in-app Medora voice call.');
      return;
    }

    this.ensureAudioElement();
    const callId = `CALL-WEBRTC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    this.activeSession = {
      callId,
      targetUserId: params.targetUserId,
      targetName: params.targetName,
      targetRole: params.targetRole || 'doctor',
      callerId: this.currentUserId,
      callerName: this.currentUserName,
      callerRole: (this.currentUserRole as any) || 'patient',
      isCaller: true,
      emergency: Boolean(params.emergency),
      emergencyType: params.emergencyType,
      symptoms: params.symptoms,
      startTime: Date.now(),
    };

    // Step 1: Request Microphone Permission
    this.notifyState('REQUESTING_PERMISSION');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone audio capture.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      this.localStream = stream;
      this.isMuted = false;
    } catch (err: any) {
      const isPermissionDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isPermissionDenied
        ? 'Microphone permission is required for a voice call.'
        : `Microphone unavailable: ${err.message || 'Device error'}`;
      this.cleanupCall('FAILED', msg);
      return;
    }

    // Step 2: Initialize RTCPeerConnection
    try {
      const iceServers = await this.getIceServers();
      const pc = new RTCPeerConnection({ iceServers });
      this.pc = pc;

      // Add local audio tracks to peer connection
      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });

      // Handle remote audio stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.remoteAudio) {
            this.remoteAudio.srcObject = this.remoteStream;
            this.remoteAudio.play().catch((playErr) => console.warn('[WebRTC] Audio autoplay error:', playErr));
          }
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal({
            type: 'ICE_CANDIDATE',
            callId,
            targetUserId: params.targetUserId,
            candidate: event.candidate,
          });
        }
      };

      // Real Connection State Tracking
      pc.onconnectionstatechange = () => {
        this.handleConnectionStateChange();
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

      // Step 3: Create SDP Offer
      this.notifyState('CALLING');

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      // Step 4: Transmit CALL_OFFER to Doctor via Signaling
      this.sendSignal({
        type: 'CALL_OFFER',
        callId,
        callerId: this.currentUserId,
        callerName: this.currentUserName,
        callerRole: this.currentUserRole,
        receiverId: params.targetUserId,
        sdpOffer: offer,
        emergency: Boolean(params.emergency),
        emergencyType: params.emergencyType,
        symptoms: params.symptoms,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this.cleanupCall('FAILED', `Unable to establish voice connection: ${err.message}`);
    }
  }

  /**
   * Accept an incoming WebRTC call (Doctor accepts Patient)
   */
  public async acceptCall(incoming: {
    callId: string;
    callerId: string;
    callerName: string;
    callerRole: 'patient' | 'doctor' | 'admin';
    sdpOffer: RTCSessionDescriptionInit;
    emergency?: boolean;
    emergencyType?: string;
    symptoms?: string;
  }): Promise<void> {
    this.ensureAudioElement();

    this.activeSession = {
      callId: incoming.callId,
      targetUserId: incoming.callerId,
      targetName: incoming.callerName,
      targetRole: incoming.callerRole,
      callerId: incoming.callerId,
      callerName: incoming.callerName,
      callerRole: incoming.callerRole,
      isCaller: false,
      emergency: Boolean(incoming.emergency),
      emergencyType: incoming.emergencyType,
      symptoms: incoming.symptoms,
      startTime: Date.now(),
    };

    // Step 1: Request Microphone
    this.notifyState('REQUESTING_PERMISSION');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      this.localStream = stream;
      this.isMuted = false;
    } catch (err: any) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'Microphone permission is required for a voice call.'
        : 'Microphone unavailable on this device.';
      this.sendSignal({
        type: 'CALL_REJECT',
        callId: incoming.callId,
        targetUserId: incoming.callerId,
        reason: 'MIC_UNAVAILABLE',
      });
      this.cleanupCall('FAILED', msg);
      return;
    }

    // Step 2: Initialize RTCPeerConnection & Accept Offer
    this.notifyState('CONNECTING');

    try {
      const iceServers = await this.getIceServers();
      const pc = new RTCPeerConnection({ iceServers });
      this.pc = pc;

      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.remoteAudio) {
            this.remoteAudio.srcObject = this.remoteStream;
            this.remoteAudio.play().catch((err) => console.warn('[WebRTC] Remote audio play error:', err));
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal({
            type: 'ICE_CANDIDATE',
            callId: incoming.callId,
            targetUserId: incoming.callerId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        this.handleConnectionStateChange();
      };

      // Set Remote Description (SDP Offer)
      await pc.setRemoteDescription(new RTCSessionDescription(incoming.sdpOffer));

      // Process buffered candidates
      while (this.pendingIceCandidates.length > 0) {
        const cand = this.pendingIceCandidates.shift();
        if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

      // Create SDP Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Transmit answer back to caller
      this.sendSignal({
        type: 'CALL_ACCEPT',
        callId: incoming.callId,
        targetUserId: incoming.callerId,
        sdpAnswer: answer,
      });
    } catch (err: any) {
      this.cleanupCall('FAILED', `Unable to establish voice connection: ${err.message}`);
    }
  }

  /**
   * Reject an incoming call
   */
  public rejectCall(callId: string, callerId: string) {
    this.sendSignal({
      type: 'CALL_REJECT',
      callId,
      targetUserId: callerId,
      reason: 'REJECTED_BY_USER',
    });
    this.cleanupCall('REJECTED', 'Call rejected');
  }

  private async handleCallAccepted(sdpAnswer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    try {
      this.notifyState('CONNECTING');
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdpAnswer));

      // Flush any queued candidates
      while (this.pendingIceCandidates.length > 0) {
        const cand = this.pendingIceCandidates.shift();
        if (cand) await this.pc.addIceCandidate(new RTCIceCandidate(cand));
      }
    } catch (err: any) {
      this.cleanupCall('FAILED', `Error establishing peer connection: ${err.message}`);
    }
  }

  private async handleRemoteIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc || !this.pc.remoteDescription) {
      this.pendingIceCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTC] Ice candidate add error:', err);
    }
  }

  private handleConnectionStateChange() {
    if (!this.pc) return;
    const state = this.pc.connectionState;

    if (state === 'connected') {
      if (this.callState !== 'CONNECTED') {
        if (this.activeSession) {
          this.activeSession.connectedTime = Date.now();
        }
        this.startDurationTimer();
        this.notifyState('CONNECTED');
      }
    } else if (state === 'connecting') {
      if (this.callState !== 'CONNECTED') {
        this.notifyState('CONNECTING');
      }
    } else if (state === 'disconnected') {
      this.notifyState('RECONNECTING');
    } else if (state === 'failed') {
      this.cleanupCall('FAILED', 'Unable to establish the voice connection.');
    } else if (state === 'closed') {
      this.cleanupCall('ENDED');
    }
  }

  private startDurationTimer() {
    this.durationSeconds = 0;
    this.notifyDuration(0);
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = setInterval(() => {
      this.durationSeconds += 1;
      this.notifyDuration(this.durationSeconds);
    }, 1000);
  }

  private stopDurationTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  /**
   * Mute / Unmute microphone audio track
   */
  public toggleMute(): boolean {
    if (!this.localStream) return this.isMuted;
    const tracks = this.localStream.getAudioTracks();
    if (tracks.length === 0) return this.isMuted;

    this.isMuted = !this.isMuted;
    tracks.forEach((track) => {
      track.enabled = !this.isMuted;
    });
    return this.isMuted;
  }

  /**
   * Toggle speaker output
   */
  public toggleSpeaker(): boolean {
    this.isSpeakerOn = !this.isSpeakerOn;
    if (this.remoteAudio) {
      this.remoteAudio.muted = !this.isSpeakerOn;
    }
    return this.isSpeakerOn;
  }

  /**
   * End the current call session
   */
  public endCall(reason: string = 'NORMAL_TERMINATION') {
    if (this.activeSession) {
      this.sendSignal({
        type: 'CALL_END',
        callId: this.activeSession.callId,
        targetUserId: this.activeSession.targetUserId,
        reason,
        durationSeconds: this.durationSeconds,
      });
    }
    this.cleanupCall('ENDED', reason);
  }

  private cleanupCall(finalState: WebRtcCallState, error?: string) {
    this.stopDurationTimer();

    // Close and stop media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }
    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
    }

    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }

    this.pendingIceCandidates = [];

    // Save Call Record in Dexie
    if (this.activeSession) {
      const record: CallSessionRecord = {
        callId: this.activeSession.callId,
        callerId: this.activeSession.callerId,
        callerName: this.activeSession.callerName,
        callerRole: this.activeSession.callerRole,
        receiverId: this.activeSession.targetUserId,
        receiverName: this.activeSession.targetName,
        receiverRole: this.activeSession.targetRole,
        status: finalState as any,
        createdAt: new Date(this.activeSession.startTime || Date.now()).toISOString(),
        acceptedAt: this.activeSession.connectedTime ? new Date(this.activeSession.connectedTime).toISOString() : undefined,
        endedAt: new Date().toISOString(),
        durationSeconds: this.durationSeconds,
        emergency: this.activeSession.emergency,
        emergencyType: this.activeSession.emergencyType,
      };

      db.callSessions.add(record).catch((err) => console.warn('[WebRTC] Save call session error:', err));
    }

    this.activeSession = null;
    this.notifyState(finalState, error);

    // Return to IDLE after a short pause so user sees final state
    setTimeout(() => {
      if (this.callState === finalState) {
        this.notifyState('IDLE');
        this.durationSeconds = 0;
        this.notifyDuration(0);
      }
    }, 2500);
  }
}

export const webrtcCallingService = new WebRtcCallingService();
