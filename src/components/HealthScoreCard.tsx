import { useTranslation } from 'react-i18next';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthScoreCard({ score, size = 'md' }: Props) {
  const { t } = useTranslation();
  const clampedScore = Math.max(0, Math.min(100, score));

  const color =
    clampedScore >= 75 ? 'text-[#16A34A]' :
    clampedScore >= 50 ? 'text-[#D97706]' :
    'text-[#DC2626]';

  const badgeBg =
    clampedScore >= 75 ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30' :
    clampedScore >= 50 ? 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30' :
    'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30';

  const label =
    clampedScore >= 75 ? 'Good Tracking' :
    clampedScore >= 50 ? 'Needs Review' :
    'Attention Required';

  const radius = size === 'sm' ? 30 : size === 'lg' ? 52 : 40;
  const strokeWidth = size === 'sm' ? 5 : 7;
  const svgSize = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  const strokeColor =
    clampedScore >= 75 ? '#16A34A' :
    clampedScore >= 50 ? '#D97706' :
    '#DC2626';

  return (
    <div className="rounded-2xl border border-[#E2E8F0] p-4 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width={svgSize} height={svgSize} className="-rotate-90">
            <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
            <circle
              cx={svgSize / 2} cy={svgSize / 2} r={radius}
              fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" className="transition-all duration-700"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center font-black ${color} ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {clampedScore}
          </div>
        </div>
        <div>
          <div className="font-extrabold text-[#0F172A] text-sm tracking-tight">Medora Health Score</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
              {label}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5 leading-snug">
            This is a health-tracking indicator, not a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}
