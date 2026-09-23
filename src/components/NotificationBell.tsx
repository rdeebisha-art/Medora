import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { db } from '../db/db';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { currentUser } = useAppStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    db.notifications
      .where({ userId: currentUser.id, isRead: false })
      .count()
      .then(setCount)
      .catch(() => setCount(0));
  }, [currentUser]);

  return (
    <Link to="/notifications" className="relative bg-white/20 p-1.5 rounded-full">
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
