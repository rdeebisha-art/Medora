export interface OfflineQueueItem {
  id: string;
  type: 'SYMPTOM_CHECK' | 'REPORT_ASSISTANCE' | 'DOCTOR_MESSAGE';
  payload: Record<string, any>;
  timestamp: string;
  status: 'QUEUED' | 'SYNCED';
}

const QUEUE_KEY = 'medora_offline_queue';

export const getOfflineQueue = (): OfflineQueueItem[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (type: OfflineQueueItem['type'], payload: Record<string, any>): OfflineQueueItem => {
  const item: OfflineQueueItem = {
    id: `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    status: 'QUEUED',
  };

  const current = getOfflineQueue();
  current.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
  return item;
};

export const clearOfflineQueue = (): void => {
  localStorage.removeItem(QUEUE_KEY);
};

export const syncOfflineQueue = (onProcessItem: (item: OfflineQueueItem) => void): number => {
  const current = getOfflineQueue();
  if (current.length === 0) return 0;

  current.forEach((item) => {
    onProcessItem(item);
  });

  clearOfflineQueue();
  return current.length;
};
