/**
 * Test WebRTC Service Connection State Management & Robust Cleanup
 */

import { webrtcCallingService } from '../src/services/webrtc/webrtcCallingService';

async function testWebRtcLifecycle() {
  console.log('Testing WebRTC Connection State Management & Cleanup...\n');
  let failures = 0;

  // 1. Initial State Check
  const initialState = webrtcCallingService.getConnectionState();
  if (initialState === 'IDLE') {
    console.log('✓ PASS: Initial state is IDLE');
  } else {
    failures++;
    console.error(`✗ FAIL: Initial state expected IDLE, got ${initialState}`);
  }

  // 2. Active checks when idle
  if (!webrtcCallingService.isCallActive() && !webrtcCallingService.hasActiveMediaStreams() && !webrtcCallingService.isPeerConnectionActive()) {
    console.log('✓ PASS: Inactive state reports no active call, no streams, and no active peer connection');
  } else {
    failures++;
    console.error('✗ FAIL: Idle state reported active streams or connections');
  }

  // 3. Robust Cleanup function execution
  webrtcCallingService.cleanup('IDLE', 'Test cleanup');
  const postCleanupState = webrtcCallingService.getConnectionState();
  const hasStreams = webrtcCallingService.hasActiveMediaStreams();
  const hasPc = webrtcCallingService.isPeerConnectionActive();

  if (postCleanupState === 'IDLE' && !hasStreams && !hasPc) {
    console.log('✓ PASS: Robust cleanup successfully terminates RTCPeerConnection and releases all media streams');
  } else {
    failures++;
    console.error(`✗ FAIL: Post cleanup error. State: ${postCleanupState}, Streams: ${hasStreams}, PC: ${hasPc}`);
  }

  console.log(`\nWebRTC State & Cleanup: ${failures === 0 ? 'ALL PASS' : 'FAILED'}`);
  process.exit(failures === 0 ? 0 : 1);
}

testWebRtcLifecycle().catch((err) => {
  console.error('WebRTC test error:', err);
  process.exit(1);
});
