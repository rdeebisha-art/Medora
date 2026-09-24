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
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="bg-[#F0FDF4] border border-[#16A34A]/20 p-2.5 rounded-xl flex-shrink-0">
          <Pill className="text-[#16A34A]" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[#0F172A] truncate text-base">{medicine.name}</div>
          <div className="text-xs text-[#475569]">{medicine.dose} · {medicine.frequency}</div>
          {medicine.times?.length > 0 && (
            <div className="text-xs text-[#16A34A] font-bold mt-1">
              🕐 {medicine.times.join(', ')}
            </div>
          )}
          {medicine.instructions && (
            <div className="text-xs text-[#64748B] mt-1 italic">{medicine.instructions}</div>
          )}
          {medicine.doctor && (
            <div className="text-[11px] text-[#94A3B8] mt-0.5">Prescribed by: {medicine.doctor}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleAction('taken')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-[#16A34A] text-white text-xs font-bold py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-2xs"
        >
          <Check size={14} />
          {loading === 'taken' ? '...' : t('medicines.taken')}
        </button>
        <button
          onClick={() => handleAction('snooze')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30 text-xs font-bold py-2 rounded-xl hover:bg-amber-100 disabled:opacity-50 transition-colors"
        >
          <Clock size={14} />
          {t('medicines.snooze')}
        </button>
        <button
          onClick={() => handleAction('missed')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-1 bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 text-xs font-bold py-2 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
          {t('medicines.missed')}
        </button>
      </div>
    </div>
  );
}
