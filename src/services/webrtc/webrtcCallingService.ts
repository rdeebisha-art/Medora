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

/**
 * Formal WebRTC Calling State Machine
 * Primary formal states: IDLE, CALLING, CONNECTING, CONNECTED, RECONNECTING, ENDED, REJECTED, FAILED
 */
export const FORMAL_CALL_STATES = [
  'IDLE',
  'CALLING',
  'CONNECTING',
  'CONNECTED',
  'RECONNECTING',
  'ENDED',
  'REJECTED',
  'FAILED',
] as const;

export type FormalWebRtcCallState = (typeof FORMAL_CALL_STATES)[number];

export const VALID_CALL_STATE_TRANSITIONS: Record<WebRtcCallState, WebRtcCallState[]> = {
  IDLE: ['REQUESTING_PERMISSION', 'CALLING', 'CONNECTING', 'RINGING'],
  REQUESTING_PERMISSION: ['CALLING', 'CONNECTING', 'FAILED', 'ENDED', 'IDLE'],
  CALLING: ['RINGING', 'CONNECTING', 'CONNECTED', 'REJECTED', 'BUSY', 'OFFLINE', 'FAILED', 'ENDED', 'IDLE'],
  RINGING: ['CONNECTING', 'CONNECTED', 'REJECTED', 'BUSY', 'FAILED', 'ENDED', 'IDLE'],
  CONNECTING: ['CONNECTED', 'RECONNECTING', 'FAILED', 'ENDED', 'REJECTED', 'IDLE'],
  CONNECTED: ['RECONNECTING', 'ENDED', 'FAILED', 'IDLE'],
  RECONNECTING: ['CONNECTED', 'FAILED', 'ENDED', 'IDLE'],
  ENDED: ['IDLE'],
  REJECTED: ['IDLE'],
  FAILED: ['IDLE'],
  BUSY: ['IDLE'],
  OFFLINE: ['IDLE'],
};

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
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private idleResetTimer: ReturnType<typeof setTimeout> | null = null;
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

  /**
   * Validates whether a state transition is permitted by the formal state machine.
   */
  public isValidTransition(from: WebRtcCallState, to: WebRtcCallState): boolean {
    if (from === to) return true;
    const allowed = VALID_CALL_STATE_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  /**
   * Returns true only when ICE negotiation is successfully established ('connected' or 'completed').
   */
  public isIceComplete(): boolean {
    if (!this.pc) return false;
    const ice = this.pc.iceConnectionState;
    return ice === 'connected' || ice === 'completed';
  }

  public getIceConnectionState(): RTCIceConnectionState | null {
    return this.pc ? this.pc.iceConnectionState : null;
  }

  /**
   * Checks if transition to target state is allowed by current state and preconditions.
   */
  public canTransitionTo(targetState: WebRtcCallState): boolean {
    if (this.callState === targetState) return true;
    if (!this.isValidTransition(this.callState, targetState)) return false;

    // Invariant: CONNECTED requires successful ICE completion
    if (targetState === 'CONNECTED') {
      if (this.pc && !this.isIceComplete()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Formal state machine transition method.
   * Enforces valid state graph and ensures CONNECTED is only emitted upon successful ICE completion.
   */
  public transitionTo(targetState: WebRtcCallState, error?: string): boolean {
    if (this.callState === targetState) return true;

    if (!this.isValidTransition(this.callState, targetState)) {
      console.warn(`[WebRTC State Machine] Blocked invalid transition: ${this.callState} -> ${targetState}`);
      return false;
    }

    // STRICT INVARIANT: CONNECTED is only emitted upon successful ICE completion
    if (targetState === 'CONNECTED') {
      if (this.pc && !this.isIceComplete()) {
        console.warn(
          `[WebRTC State Machine] Blocked transition to CONNECTED: ICE connection state is "${this.pc.iceConnectionState}". Remaining in CONNECTING until ICE completes.`
        );
        if (this.callState !== 'CONNECTING') {
          this.transitionTo('CONNECTING');
        }
        return false;
      }
    }

    this.notifyState(targetState, error);
    return true;
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

  public getConnectionState(): WebRtcCallState {
    return this.callState;
  }

  public isCallActive(): boolean {
    return this.callState === 'CONNECTED' || this.callState === 'CONNECTING' || this.callState === 'CALLING';
  }

  public hasActiveMediaStreams(): boolean {
    const hasLocal = Boolean(this.localStream && this.localStream.getTracks().some((t) => t.readyState === 'live'));
    const hasRemote = Boolean(this.remoteStream && this.remoteStream.getTracks().some((t) => t.readyState === 'live'));
    return hasLocal || hasRemote;
  }

  public isPeerConnectionActive(): boolean {
    return Boolean(this.pc && this.pc.signalingState !== 'closed');
  }

  private startConnectionTimeout(timeoutMs: number = 30000) {
    this.clearConnectionTimeout();
    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.callState === 'CALLING' || this.callState === 'CONNECTING' || this.callState === 'REQUESTING_PERMISSION') {
        console.warn('[WebRTC] Connection timeout reached without establishing peer connection.');
        this.cleanupCall('FAILED', 'Call timed out. Remote user did not connect.');
      }
    }, timeoutMs);
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
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

    // Strictly enforce IDLE state before starting a call
    if (this.callState !== 'IDLE') {
      console.warn(`[WebRTC] Cannot start call from non-IDLE state: ${this.callState}. Performing cleanup first.`);
      this.cleanupCall('IDLE');
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

    // Step 1: Request Microphone Permission and start connection timeout
    this.startConnectionTimeout(30000);
    this.transitionTo('REQUESTING_PERMISSION');

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

      // Real Connection State & ICE Tracking
      pc.onconnectionstatechange = () => {
        this.handleConnectionStateChange();
      };

      pc.oniceconnectionstatechange = () => {
        this.handleIceConnectionStateChange();
      };

      // Step 3: Create SDP Offer
      this.transitionTo('CALLING');

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
    if (this.callState !== 'IDLE' && this.callState !== 'RINGING') {
      console.warn(`[WebRTC] Cannot accept call while in state: ${this.callState}`);
      return;
    }

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

    // Step 1: Request Microphone and start connection timeout
    this.startConnectionTimeout(30000);
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
    this.transitionTo('CONNECTING');

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

      pc.oniceconnectionstatechange = () => {
        this.handleIceConnectionStateChange();
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
      this.transitionTo('CONNECTING');
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

  private handleIceConnectionStateChange() {
    if (!this.pc) return;
    const iceState = this.pc.iceConnectionState;
    console.log('[WebRTC State Machine] ICE state changed:', iceState);

    if (iceState === 'connected' || iceState === 'completed') {
      this.handleIceCompletion();
    } else if (iceState === 'disconnected') {
      this.transitionTo('RECONNECTING');
    } else if (iceState === 'failed') {
      console.warn('[WebRTC State Machine] ICE connection failed, attempting ICE restart...');
      this.transitionTo('RECONNECTING');
      try {
        this.pc.restartIce();
      } catch {
        this.cleanupCall('FAILED', 'ICE connection failed and could not be restarted.');
      }
    } else if (iceState === 'closed') {
      this.cleanupCall('ENDED');
    }
  }

  private handleIceCompletion() {
    if (!this.pc) return;
    const ice = this.pc.iceConnectionState;
    // STRICT INVARIANT: Only emit CONNECTED upon successful ICE completion
    if (ice !== 'connected' && ice !== 'completed') {
      return;
    }

    this.clearConnectionTimeout();
    if (this.callState !== 'CONNECTED') {
      if (this.activeSession) {
        this.activeSession.connectedTime = Date.now();
      }
      this.startDurationTimer();
      this.transitionTo('CONNECTED');
    }
  }

  private handleConnectionStateChange() {
    if (!this.pc) return;
    const state = this.pc.connectionState;
    console.log('[WebRTC State Machine] Peer connection state changed:', state);

    if (state === 'connected') {
      // Only emit CONNECTED if ICE completion has also succeeded
      if (this.isIceComplete()) {
        this.handleIceCompletion();
      } else {
        // Still waiting for ICE negotiation to reach connected/completed
        if (this.callState !== 'CONNECTING') {
          this.transitionTo('CONNECTING');
        }
      }
    } else if (state === 'connecting') {
      if (this.callState !== 'CONNECTED') {
        this.transitionTo('CONNECTING');
      }
    } else if (state === 'disconnected') {
      this.transitionTo('RECONNECTING');
    } else if (state === 'failed') {
      this.cleanupCall('FAILED', 'Call could not be connected.');
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
   * Pause microphone stream
   */
  public pauseMicrophone(): boolean {
    if (!this.localStream) return false;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    this.isMuted = true;
    return true;
  }

  /**
   * Resume microphone stream
   */
  public resumeMicrophone(): boolean {
    if (!this.localStream) return false;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    this.isMuted = false;
    return true;
  }

  public isMicrophonePaused(): boolean {
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

  /**
   * Public robust cleanup method to terminate RTCPeerConnection and release all media streams,
   * clearing timers and freeing resources to strictly prevent memory leaks.
   */
  public cleanup(finalState: WebRtcCallState = 'IDLE', reason?: string): void {
    this.cleanupCall(finalState, reason);
  }

  private cleanupCall(finalState: WebRtcCallState, error?: string) {
    this.stopDurationTimer();
    this.clearConnectionTimeout();

    if (this.idleResetTimer) {
      clearTimeout(this.idleResetTimer);
      this.idleResetTimer = null;
    }

    // 1. Release Local Media Stream Tracks
    if (this.localStream) {
      try {
        this.localStream.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch {}
          try {
            this.localStream?.removeTrack(track);
          } catch {}
        });
      } catch (err) {
        console.warn('[WebRTC] Error releasing local stream tracks:', err);
      }
      this.localStream = null;
    }

    // 2. Release Remote Media Stream Tracks
    if (this.remoteStream) {
      try {
        this.remoteStream.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch {}
          try {
            this.remoteStream?.removeTrack(track);
          } catch {}
        });
      } catch (err) {
        console.warn('[WebRTC] Error releasing remote stream tracks:', err);
      }
      this.remoteStream = null;
    }

    // 3. Reset Remote Audio Element Playback
    if (this.remoteAudio) {
      try {
        this.remoteAudio.pause();
        this.remoteAudio.srcObject = null;
        this.remoteAudio.removeAttribute('src');
        this.remoteAudio.load();
      } catch (err) {
        console.warn('[WebRTC] Error releasing remote audio element:', err);
      }
    }

    // 4. Terminate RTCPeerConnection and detach all event listeners
    if (this.pc) {
      try {
        // Detach all listener handlers to prevent memory leaks and dangling closures
        this.pc.ontrack = null;
        this.pc.onicecandidate = null;
        this.pc.onconnectionstatechange = null;
        this.pc.oniceconnectionstatechange = null;
        this.pc.onsignalingstatechange = null;

        // Stop all transceiver senders
        if (typeof this.pc.getSenders === 'function') {
          this.pc.getSenders().forEach((sender) => {
            if (sender.track) {
              try {
                sender.track.stop();
              } catch {}
            }
            try {
              this.pc?.removeTrack(sender);
            } catch {}
          });
        }

        // Stop all transceiver receivers
        if (typeof this.pc.getReceivers === 'function') {
          this.pc.getReceivers().forEach((receiver) => {
            if (receiver.track) {
              try {
                receiver.track.stop();
              } catch {}
            }
          });
        }

        if (this.pc.signalingState !== 'closed') {
          this.pc.close();
        }
      } catch (err) {
        console.warn('[WebRTC] Error closing RTCPeerConnection:', err);
      }
      this.pc = null;
    }

    this.pendingIceCandidates = [];
    this.isMuted = false;

    // 5. Save Call Record in Dexie
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

      try {
        db.callSessions.add(record).catch((err) => console.warn('[WebRTC] Save call session error:', err));
      } catch {}
    }

    this.activeSession = null;
    this.notifyState(finalState, error);

    // Return to IDLE after a short pause so user sees final state
    if (finalState !== 'IDLE') {
      this.idleResetTimer = setTimeout(() => {
        if (this.callState === finalState) {
          this.notifyState('IDLE');
          this.durationSeconds = 0;
          this.notifyDuration(0);
        }
      }, 2500);
    } else {
      this.durationSeconds = 0;
      this.notifyDuration(0);
    }
  }
}

export const webrtcCallingService = new WebRtcCallingService();
