import type { ProjectStats } from '../api/stats';
import type { Project } from '../types';
import { useI18n, type TFunction } from '../i18n';
import { computeHeat, HEAT_LEVEL_KEYS } from '../utils/heat';
import type { HeatDimensions } from '../utils/heat';
import { formatNumber } from '../utils/formatNumber';
import { HeatFlames } from './HeatFlames';

/** 显示真实数量，热度高低交给进度条；null 表示这一维还没数据 */
const RAW_FORMAT: Record<keyof HeatDimensions, (value: number | null, t: TFunction) => string> = {
  stars: (value) => (value === null ? '—' : formatNumber(value)),
  growth: (value) => (value === null ? '—' : `+${formatNumber(value)}`),
  views: (value) => (value === null ? '—' : formatNumber(value)),
  clicks: (value) => (value === null ? '—' : formatNumber(value)),
  forks: (value) => (value === null ? '—' : formatNumber(value)),
  freshness: (value, t) =>
    value === null || value >= 999 ? '—' : t('heat.days', { count: Math.round(value) }),
};

/** 详情页热度拆解：把各维度摊开，说明等级怎么来的。 */
export function HeatPanel({ project, stats }: { project: Project; stats?: ProjectStats }) {
  const { t } = useI18n();
  const heat = computeHeat({ ...project, stats });

  return (
    <section className="panel-brutal mt-6 p-6">
      <h2 className="pixel flex items-center gap-3 text-[10px] text-muted">
        <span className="size-3 shrink-0 bg-brand" />
        {t('heat.heading')}
      </h2>

      <div className="mt-3 flex items-baseline gap-3">
        <HeatFlames level={heat.level} className="text-lg" />
        <span className="pixel text-[10px] text-ink">{t(HEAT_LEVEL_KEYS[heat.level])}</span>
        <span className="mono ml-auto flex items-baseline gap-1 text-muted">
          <span className="pixel text-[15px] text-brand tabular-nums">{heat.score}</span>
          <span className="text-[10px]">/ 100</span>
        </span>
      </div>

      <ul className="mt-5 space-y-2.5">
        {heat.parts.map((part) => (
          <li key={part.key} className="flex items-center gap-3">
            <span className="mono w-24 shrink-0 text-[11px] text-muted">{t(part.labelKey)}</span>
            <span className="h-2.5 min-w-0 flex-1 border-2 border-line bg-elevated">
              <span
                className="block h-full bg-brand transition-[width] duration-500"
                style={{ width: `${Math.round(part.ratio * 100)}%` }}
              />
            </span>
            <span className="mono w-12 shrink-0 text-right text-[10px] text-muted tabular-nums">
              {RAW_FORMAT[part.key](part.raw, t)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mono mt-4 text-[10px] leading-5 text-muted">{t('heat.note')}</p>
    </section>
  );
}
