import { useTranslation } from 'react-i18next';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthScoreCard({ score, size = 'md' }: Props) {
  const { t } = useTranslation();
  const clampedScore = Math.max(0, Math.min(100, score));

  const color =
    clampedScore >= 75 ? 'text-green-600' :
    clampedScore >= 50 ? 'text-yellow-600' :
    'text-red-600';

  const bgColor =
    clampedScore >= 75 ? 'bg-green-50 border-green-200' :
    clampedScore >= 50 ? 'bg-yellow-50 border-yellow-200' :
    'bg-red-50 border-red-200';

  const label =
    clampedScore >= 75 ? 'Good' :
    clampedScore >= 50 ? 'Fair' :
    'Needs Attention';

  const radius = size === 'sm' ? 30 : size === 'lg' ? 52 : 40;
  const strokeWidth = size === 'sm' ? 5 : 7;
  const svgSize = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  const strokeColor =
    clampedScore >= 75 ? '#16a34a' :
    clampedScore >= 50 ? '#ca8a04' :
    '#dc2626';

  return (
    <div className={`rounded-2xl border p-4 ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg width={svgSize} height={svgSize} className="-rotate-90">
            <circle cx={svgSize/2} cy={svgSize/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
            <circle
              cx={svgSize/2} cy={svgSize/2} r={radius}
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
          <div className="font-bold text-gray-800">{t('health.healthScore')}</div>
          <div className={`font-semibold ${color}`}>{label}</div>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">{t('health.scoreDisclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
