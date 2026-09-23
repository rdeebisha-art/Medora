import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Notification } from '../db/db';
import Layout from '../components/Layout';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    db.notifications.where({ userId: currentUser.id }).reverse().toArray().then(setNotifications);
  }, [currentUser, refresh]);

  const markRead = async (id: number) => {
    await db.notifications.update(id, { isRead: true });
    setRefresh(r => r + 1);
  };

  const markAllRead = async () => {
    await Promise.all(notifications.map(n => n.id ? db.notifications.update(n.id, { isRead: true }) : Promise.resolve()));
    setRefresh(r => r + 1);
  };

  const typeIcon: Record<string, string> = {
    vaccination: '💉', medicine: '💊', appointment: '📅',
    checkup: '🩺', emergency: '🚨', general: '🔔',
  };

  const today = new Date().toDateString();
  const todayItems = notifications.filter(n => new Date(n.createdAt).toDateString() === today);
  const earlierItems = notifications.filter(n => new Date(n.createdAt).toDateString() !== today);

  const NotifItem = ({ n }: { n: Notification }) => (
    <div className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
      <span className="text-2xl mt-0.5 flex-shrink-0">{typeIcon[n.type] || '🔔'}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{n.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{n.createdAt?.slice(0, 16)}</p>
      </div>
      {!n.isRead && (
        <button onClick={() => n.id && markRead(n.id)} className="text-xs text-sky-600 font-medium whitespace-nowrap hover:underline">
          {t('notifications.markRead')}
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🔔 {t('notifications.title')}</h1>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} className="text-sm text-sky-600 font-medium hover:underline">
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🔔</div>
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayItems.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{t('notifications.today')}</h2>
                <div className="space-y-2">
                  {todayItems.map(n => <NotifItem key={n.id} n={n} />)}
                </div>
              </div>
            )}
            {earlierItems.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{t('notifications.earlier')}</h2>
                <div className="space-y-2">
                  {earlierItems.map(n => <NotifItem key={n.id} n={n} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
