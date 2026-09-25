# Medora Real-Time In-App Voice Calling & Messaging Setup

This document provides complete instructions for operating, configuring, and verifying the **Real-Time In-App WebRTC Voice Calling** and **Zero-Charge In-App Messaging** between Medora patients and healthcare professionals.

---

## 1. Architecture Overview

Medora provides native, in-browser, peer-to-peer audio calling and real-time messaging between authenticated Medora accounts:

```
PATIENT MEDORA                           DOCTOR MEDORA
      │                                       │
      ├── [REGISTER / WebSocket Signaling] ───┤
      │            (Express Server)           │
      │                                       │
      ├── [CALL_OFFER / CALL_ACCEPT] ─────────┤
      │                                       │
      └──═══════════[ REAL WEBRTC ]═══════════┘
                (2-Way Human Audio Stream)
```

- **Audio Transport**: Native WebRTC (`RTCPeerConnection` + `navigator.mediaDevices.getUserMedia`)
- **Signaling**: Multiplexed WebSocket on `/ws/webrtc` with REST fallback (`/api/signaling/*`)
- **NAT Traversal**: STUN (`stun:stun.l.google.com:19302`) with configurable TURN relay support
- **Cost**: **Zero per-call or per-message charge** to users. Operates over packet data without using phone apps, carrier SMS, PSTN cellular, or `tel:` links.

---

## 2. Signaling Server Setup

The signaling server is integrated directly into Medora's Node.js Express full-stack server (`server.ts`):
- Runs on port `3000` (`httpServer`).
- WebSocket path: `/ws/webrtc`.
- REST Fallbacks:
  - `POST /api/signaling/message`: Exchange SDP offers, answers, and ICE candidates.
  - `GET /api/signaling/poll/:userId`: Poll queued signaling packets.
  - `POST /api/messages/send`: Send in-app direct messages.
  - `GET /api/messages/conversation/:conversationId`: Retrieve stored in-app conversation history.
  - `GET /api/presence/all`: Real-time user availability status (`AVAILABLE`, `BUSY`, `OFFLINE`).

---

## 3. STUN Configuration

By default, Medora uses Google's public, free, zero-config STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

To specify a custom STUN server, set:
```bash
STUN_SERVER_URL=stun:your-stun-server.org:3478
VITE_WEBRTC_STUN_URL=stun:your-stun-server.org:3478
```

---

## 4. TURN Configuration (Fallback for Symmetric NAT)

For restrictive institutional firewalls, cellular carrier-grade NAT (CGNAT), or symmetric NATs, a TURN server relays media packets when direct P2P connection cannot be negotiated:

Supported open-source TURN servers:
- **coturn** (self-hostable on Linux VPS / cloud)
- Any RFC 5766 / RFC 6156 compliant TURN provider

Configuration in `.env`:
```bash
TURN_SERVER_URL=turn:turn.example.com:3478?transport=udp
TURN_USERNAME=medora_user
TURN_CREDENTIAL=medora_turn_secret_token
```

The server dynamically exposes these servers via `GET /api/webrtc/config` so secrets remain protected and never hardcoded in frontend source bundles.

---

## 5. Environment Variables Summary

| Variable | Required | Description |
|---|---|---|
| `PORT` | Optional (default: 3000) | Express & WebSocket dev/prod server port |
| `HOST` | Optional (default: 0.0.0.0) | Bind address |
| `GEMINI_API_KEY` | Optional | Server-side Gemini for medical imaging & OCR |
| `STUN_SERVER_URL` | Optional | Custom STUN server URL |
| `VITE_WEBRTC_STUN_URL` | Optional | Client Vite STUN URL |
| `TURN_SERVER_URL` | Optional | Custom TURN server URL |
| `TURN_USERNAME` | Optional | TURN username credential |
| `TURN_CREDENTIAL` | Optional | TURN password credential |

---

## 6. Authentication & User Roles

Every caller and receiver is identified by a unique ID:
- **Patients**: `P001` (Anitha Kumar), `P002` (Ramesh Patel), etc.
- **Doctors**: `DOC-01` (Dr. Arjun Mehta), `DOC-02` (Dr. Kavitha Rao), etc.

Calls cannot be placed to arbitrary random numbers. The server validates:
1. `callerId` authenticity.
2. `receiverId` registration.
3. Receiver availability (if doctor is already attending another call, caller receives `BUSY`).

---

## 7. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in two browser windows or separate profiles (e.g. Incognito for Doctor, Normal for Patient).

---

## 8. Two-Device Verification Workflow

### Device 1: Patient (Android Phone or Laptop)
1. Navigate to `/dashboard` or `/login`.
2. Login as **Patient** (e.g. Anitha Kumar, `P001`).
3. Open **Doctors** or **Emergency**.
4. Tap **📞 Call Doctor** or **🚨 CALL DOCTOR NOW**.
5. Grant browser microphone permission when prompted.
6. The state transitions: `Calling...` → `Ringing...`.

### Device 2: Doctor (Second Phone, Tablet, or Laptop)
1. Open Medora on the second device.
2. Login as **Doctor** (e.g. Dr. Arjun Mehta, `DOC-01`).
3. Doctor immediately receives the **Incoming Call Modal**:
   - Patient Name & ID: `Anitha Kumar (P001)`.
   - Emergency Status: `YES` or `NO`.
   - Reported symptoms if emergency.
4. Tap **✅ Accept Call**.
5. Grant microphone permission.

### Real Voice Verification
1. Both devices transition to **CONNECTED**.
2. Live call duration timer starts (e.g. `00:01`, `00:02`...).
3. Patient speaks into Device 1 microphone → Doctor hears clear voice on Device 2 speaker.
4. Doctor speaks into Device 2 microphone → Patient hears clear voice on Device 1 speaker.
5. Tap **🎤 Mute** on Device 1 → Verify Device 2 no longer hears audio.
6. Tap **🎤 Unmute** → Verify audio resumes.
7. Tap **⏹ End Call** on Device 2 → Both devices see `Call ended`, media tracks close, and session is saved to IndexedDB `callSessions`.
8. Doctor has option to create and save clinical **Doctor Summary**.

---

## 9. Mobile Browser Compatibility

| Platform | Browser | Supported | Notes |
|---|---|---|---|
| Android | Google Chrome | ✅ Full Support | Requires HTTPS in production (or localhost in dev) |
| Android | Firefox / Edge | ✅ Full Support | Native WebRTC audio supported |
| iOS | Safari (iOS 14.3+) | ✅ Full Support | User gesture required to start audio context |
| Desktop | Chrome / Edge / Firefox / Safari | ✅ Full Support | Full WebRTC audio supported |

---

## 10. Troubleshooting

### "Microphone permission is required for a voice call"
- Cause: The user clicked "Block" or system permissions disabled mic access for the browser.
- Fix: Click the padlock icon in the browser address bar, set **Microphone** to **Allow**, and refresh.

### "Internet connection is required for an in-app Medora voice call"
- Cause: Device network is disconnected (`navigator.onLine === false`).
- Fix: Connect to Wi-Fi or mobile data. Medora's offline records remain functional without internet, but real-time voice and live messaging require data connectivity.

### "Doctor is currently on another Medora call"
- Cause: The recipient doctor is attending another active consultation (`status: BUSY`).
- Fix: Wait for the consultation to conclude, or send an In-App message via **💬 Message Doctor**.
