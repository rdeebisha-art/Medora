import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Check, X, Clock } from 'lucide-react';
import { db, Medicine } from '../db/db';

interface Props {
  medicine: Medicine;
  onUpdate?: () => void;
}

export default function MedicineCard({ medicine, onUpdate }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: 'taken' | 'missed' | 'snooze') => {
    if (!medicine.id) return;
    setLoading(action);
    try {
      if (action === 'taken') {
        await db.medicines.update(medicine.id, { lastTaken: new Date().toISOString() });
      } else if (action === 'missed') {
        const missed = (medicine.missedCount || 0) + 1;
        await db.medicines.update(medicine.id, { missedCount: missed });
      }
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-sky-100 p-2 rounded-xl flex-shrink-0">
          <Pill className="text-sky-600" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{medicine.name}</div>
          <div className="text-sm text-gray-600">{medicine.dose} · {medicine.frequency}</div>
          {medicine.times?.length > 0 && (
            <div className="text-xs text-sky-600 font-medium mt-1">
              🕐 {medicine.times.join(', ')}
            </div>
          )}
          {medicine.instructions && (
            <div className="text-xs text-gray-500 mt-1 italic">{medicine.instructions}</div>
          )}
          {medicine.doctor && (
            <div className="text-xs text-gray-400 mt-0.5">By: {medicine.doctor}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleAction('taken')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-sm font-medium py-2 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
          {loading === 'taken' ? '...' : t('medicines.taken')}
        </button>
        <button
          onClick={() => handleAction('snooze')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 text-white text-sm font-medium py-2 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
        >
          <Clock size={14} />
          {t('medicines.snooze')}
        </button>
        <button
          onClick={() => handleAction('missed')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 text-sm font-medium py-2 rounded-xl hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
          {t('medicines.missed')}
        </button>
      </div>
    </div>
  );
}
