import { db, InAppMessageRecord, OfflineOutboxItem } from '../../db/db';
import { translateString } from '../../i18n/pageTranslator';

export type MessageListener = (messages: InAppMessageRecord[]) => void;

class InAppMessagingService {
  private ws: WebSocket | null = null;
  private currentUserId = '';
  private currentUserName = '';
  private currentUserRole = '';
  private listeners: Map<string, Set<MessageListener>> = new Map();
  private globalListeners: Set<(message: InAppMessageRecord) => void> = new Set();
  private syncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processOfflineOutbox();
      });
    }
  }

  public init(userId: string, userName: string, role: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentUserRole = role;

    this.connectWebSocket();
    this.processOfflineOutbox();
  }

  private connectWebSocket() {
    if (!this.currentUserId) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/webrtc`;

      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'REGISTER',
            userId: this.currentUserId,
            name: this.currentUserName,
            role: this.currentUserRole,
          })
        );
        this.processOfflineOutbox();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingSocketMessage(data);
        } catch (err) {
          console.error('[InAppMessaging] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setTimeout(() => {
          if (this.currentUserId) this.connectWebSocket();
        }, 4000);
      };
    } catch {}
  }

  private async handleIncomingSocketMessage(data: Record<string, any>) {
    if (data.type === 'NEW_IN_APP_MESSAGE' && data.message) {
      const msg: InAppMessageRecord = data.message;
      // Save to local IndexedDB
      await db.inAppMessages.add(msg);
      // Notify conversation listeners
      this.notifyListeners(msg.conversationId);
      // Notify global listeners (e.g. badges / notification bell)
      for (const listener of this.globalListeners) {
        listener(msg);
      }
      // Send read receipt if active
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'MESSAGE_DELIVERED',
            messageId: msg.messageId,
            conversationId: msg.conversationId,
            recipientId: this.currentUserId,
          })
        );
      }
    } else if (data.type === 'MESSAGE_STATUS_UPDATE') {
      const { messageId, status } = data;
      const existing = await db.inAppMessages.where({ messageId }).first();
      if (existing && existing.id) {
        await db.inAppMessages.update(existing.id, { status });
        this.notifyListeners(existing.conversationId);
      }
    }
  }

  public subscribeConversation(conversationId: string, listener: MessageListener): () => void {
    if (!this.listeners.has(conversationId)) {
      this.listeners.set(conversationId, new Set());
    }
    this.listeners.get(conversationId)!.add(listener);

    // Initial load
    this.getConversationMessages(conversationId).then(listener);

    return () => {
      const set = this.listeners.get(conversationId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.listeners.delete(conversationId);
      }
    };
  }

  public subscribeGlobal(listener: (message: InAppMessageRecord) => void): () => void {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  private async notifyListeners(conversationId: string) {
    const set = this.listeners.get(conversationId);
    if (!set || set.size === 0) return;
    const messages = await this.getConversationMessages(conversationId);
    for (const listener of set) {
      listener(messages);
    }
  }

  public async getConversationMessages(conversationId: string): Promise<InAppMessageRecord[]> {
    try {
      const local = await db.inAppMessages.where({ conversationId }).sortBy('timestamp');
      return local;
    } catch {
      return [];
    }
  }

  public getConversationId(userId1: string, userId2: string): string {
    const sorted = [userId1, userId2].sort();
    return `conv_${sorted[0]}_${sorted[1]}`;
  }

  /**
   * Send a real in-app message
   */
  public async sendMessage(params: {
    receiverId: string;
    receiverName: string;
    text: string;
    language?: string;
    isEmergency?: boolean;
  }): Promise<InAppMessageRecord> {
    const conversationId = this.getConversationId(this.currentUserId, params.receiverId);
    const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const originalLanguage = params.language || 'en';

    // Auto translate if destination doctor is English and patient is regional
    let translatedText = params.text;
    if (originalLanguage !== 'en') {
      try {
        translatedText = translateString(params.text, 'en');
      } catch {}
    }

    const isOnline = navigator.onLine;

    const messageRecord: InAppMessageRecord = {
      messageId,
      conversationId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      senderRole: (this.currentUserRole as any) || 'patient',
      receiverId: params.receiverId,
      receiverName: params.receiverName,
      originalLanguage,
      originalText: params.text,
      translatedText,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'SENDING' : 'PENDING_OFFLINE',
      isEmergency: params.isEmergency,
    };

    // Store in local DB first
    await db.inAppMessages.add(messageRecord);
    this.notifyListeners(conversationId);

    // If completely offline, queue in offline outbox
    if (!isOnline) {
      await db.offlineOutboxMessages.add({
        messageId,
        conversationId,
        senderId: this.currentUserId,
        senderName: this.currentUserName,
        senderRole: (this.currentUserRole as any) || 'patient',
        receiverId: params.receiverId,
        receiverName: params.receiverName,
        originalLanguage,
        originalText: params.text,
        translatedText,
        timestamp: messageRecord.timestamp,
        status: 'PENDING_OFFLINE',
        retryCount: 0,
      });
      return messageRecord;
    }

    // Attempt real-time delivery via WebSocket or HTTP fallback
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'SEND_IN_APP_MESSAGE',
            message: messageRecord,
          })
        );
        // Optimistically set to SENT
        const saved = await db.inAppMessages.where({ messageId }).first();
        if (saved && saved.id) {
          await db.inAppMessages.update(saved.id, { status: 'SENT' });
          this.notifyListeners(conversationId);
        }
      } else {
        // HTTP fallback
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageRecord),
        });
        if (res.ok) {
          const saved = await db.inAppMessages.where({ messageId }).first();
          if (saved && saved.id) {
            await db.inAppMessages.update(saved.id, { status: 'SENT' });
            this.notifyListeners(conversationId);
          }
        } else {
          throw new Error('Server delivery rejected');
        }
      }
    } catch {
      // Put in offline outbox if transmission failed
      await db.offlineOutboxMessages.add({
        messageId,
        conversationId,
        senderId: this.currentUserId,
        senderName: this.currentUserName,
        senderRole: (this.currentUserRole as any) || 'patient',
        receiverId: params.receiverId,
        receiverName: params.receiverName,
        originalLanguage,
        originalText: params.text,
        translatedText,
        timestamp: messageRecord.timestamp,
        status: 'PENDING_OFFLINE',
        retryCount: 0,
      });
    }

    return messageRecord;
  }

  /**
   * Process and flush queued offline messages when network returns
   */
  public async processOfflineOutbox(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const pendingItems = await db.offlineOutboxMessages.where({ status: 'PENDING_OFFLINE' }).toArray();
      if (pendingItems.length === 0) {
        this.syncInProgress = false;
        return;
      }

      for (const item of pendingItems) {
        try {
          const res = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageId: item.messageId,
              conversationId: item.conversationId,
              senderId: item.senderId,
              senderName: item.senderName,
              senderRole: item.senderRole,
              receiverId: item.receiverId,
              receiverName: item.receiverName,
              originalLanguage: item.originalLanguage,
              originalText: item.originalText,
              translatedText: item.translatedText,
              timestamp: item.timestamp,
              status: 'SENT',
            }),
          });

          if (res.ok) {
            // Remove from outbox
            if (item.id) await db.offlineOutboxMessages.delete(item.id);

            // Update inAppMessages status to SENT
            const existing = await db.inAppMessages.where({ messageId: item.messageId }).first();
            if (existing && existing.id) {
              await db.inAppMessages.update(existing.id, { status: 'SENT' });
              this.notifyListeners(item.conversationId);
            }
          }
        } catch (err) {
          console.warn('[Offline Outbox] Retry failed for message:', item.messageId, err);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }
}

export const inAppMessagingService = new InAppMessagingService();
