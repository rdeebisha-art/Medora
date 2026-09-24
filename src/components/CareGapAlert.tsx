import { AlertCircle, Clock, Syringe, Pill, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Gap {
  type: 'vaccination' | 'medicine' | 'followup' | 'appointment' | 'checkup';
  message: string;
  link?: string;
}

interface Props { gaps: Gap[]; }

const typeConfig = {
  vaccination: { icon: <Syringe size={16} />, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  medicine: { icon: <Pill size={16} />, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  followup: { icon: <Clock size={16} />, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  appointment: { icon: <Calendar size={16} />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  checkup: { icon: <AlertCircle size={16} />, color: 'bg-red-50 border-red-200 text-red-700' },
};

export default function CareGapAlert({ gaps }: Props) {
  if (!gaps || gaps.length === 0) return null;
  return (
    <div className="space-y-2">
      {gaps.map((gap, i) => {
        const cfg = typeConfig[gap.type];
        const content = (
          <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${cfg.color}`}>
            <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
            <span>{gap.message}</span>
          </div>
        );
        return gap.link ? <Link key={i} to={gap.link}>{content}</Link> : content;
      })}
    </div>
  );
}
