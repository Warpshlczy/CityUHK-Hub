import type { ProjectStats } from '../api/stats';

// 六维加权（stars/growth/views/clicks/forks/freshness），各维先归一化到 0–1 再乘权重求和，满分 100。
// 权重是拍脑袋定的，分数拿来排序和分级够用，别当成客观指标。
const WEIGHTS = {
  stars: 35,
  growth: 25,
  views: 15,
  clicks: 15,
  forks: 5,
  freshness: 5,
} as const;

export interface HeatDimensions {
  stars: number;
  growth: number;
  views: number;
  clicks: number;
  forks: number;
  freshness: number;
}

export interface HeatResult {
  score: number;
  level: 1 | 2 | 3;
  // raw 是真实数量，points 是乘权重后的得分；对外一律展示 raw，
  // 否则 28 个 star 会显示成 26，看着像统计错了。raw 为 null 表示这一维还没有数据。
  parts: Array<{
    key: keyof HeatDimensions;
    /** 维度名的词条 key，实际文案由组件层 t() 取 */
    labelKey: string;
    ratio: number;
    points: number;
    raw: number | null;
  }>;
}

const LABEL_KEYS: Record<keyof HeatDimensions, string> = {
  stars: 'heat.stars',
  growth: 'heat.growth',
  views: 'heat.views',
  clicks: 'heat.clicks',
  forks: 'heat.forks',
  freshness: 'heat.freshness',
};

// 取对数，避免大仓库一家独大
function starsRatio(stars: number) {
  return Math.min(1, Math.log10(Math.max(0, stars) + 1) / Math.log10(101));
}

function ratio(value: number, full: number) {
  return Math.min(1, Math.max(0, value) / full);
}

export interface HeatInput {
  stars: number;
  /** 缺省或 null 表示历史快照还没攒够 7 天，这一维无从计算 */
  starsGained7d?: number | null;
  forks: number;
  updatedAt?: string;
  stats?: ProjectStats;
}

export function computeHeat(input: HeatInput, now = Date.now()): HeatResult {
  // updatedAt 可能是完整 ISO（联网构建）或纯日期（离线兜底），new Date 两种都能解析
  const updatedAt = input.updatedAt ? new Date(input.updatedAt).getTime() : NaN;
  const days = Number.isNaN(updatedAt) ? 999 : Math.max(0, (now - updatedAt) / 86_400_000);

  const dimensions: HeatDimensions = {
    stars: starsRatio(input.stars),
    growth: ratio(input.starsGained7d ?? 0, 5),
    views: ratio(input.stats?.views ?? 0, 100),
    clicks: ratio(input.stats?.clicks ?? 0, 25),
    forks: ratio(input.forks, 20),
    // 90 天内线性衰减
    freshness: Math.max(0, 1 - days / 90),
  };

  const rawValues: { [K in keyof HeatDimensions]: number | null } = {
    stars: input.stars,
    growth: input.starsGained7d ?? null,
    views: input.stats?.views ?? 0,
    clicks: input.stats?.clicks ?? 0,
    forks: input.forks,
    freshness: days,
  };

  const parts = (Object.keys(WEIGHTS) as Array<keyof HeatDimensions>).map((key) => ({
    key,
    labelKey: LABEL_KEYS[key],
    ratio: dimensions[key],
    points: dimensions[key] * WEIGHTS[key],
    raw: rawValues[key],
  }));

  const score = Math.round(parts.reduce((sum, part) => sum + part.points, 0) * 10) / 10;
  const level: HeatResult['level'] = score >= 55 ? 3 : score >= 25 ? 2 : 1;

  return { score, level, parts };
}

/** 热度分级的词条 key */
export const HEAT_LEVEL_KEYS: Record<1 | 2 | 3, string> = {
  1: 'heat.level.1',
  2: 'heat.level.2',
  3: 'heat.level.3',
};
