import { useI18n } from '../i18n';
import { HEAT_LEVEL_KEYS } from '../utils/heat';

/** 热度火焰图标。每朵火苗的相位要错开，不然整排同步闪动像在打拍子。 */
export function HeatFlames({ level, className = '' }: { level: 1 | 2 | 3; className?: string }) {
  const { t } = useI18n();
  const label = t(HEAT_LEVEL_KEYS[level]);

  return (
    <span
      className={`heat-flames ${className}`}
      data-level={level}
      title={t('heat.flamesTitle', { label })}
      role="img"
      aria-label={t('heat.flamesTitle', { label })}
    >
      {Array.from({ length: level }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className="heat-flame"
          style={{ animationDelay: `${index * 0.23}s` }}
        >
          🔥
        </span>
      ))}
    </span>
  );
}
