import { useTranslation } from 'react-i18next';

export default function DemoDataBadge() {
  const { t } = useTranslation();
  return (
    <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full border border-amber-200">
      🧪 {t('common.demoData')}
    </div>
  );
}
