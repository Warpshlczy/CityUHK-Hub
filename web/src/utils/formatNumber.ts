import type { Lang, TFunction } from '../i18n';

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${trim(value / 1000)}k`;
  return `${trim(value / 1_000_000)}M`;
}

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 相对时间要按语言取词条，所以把 t 传进来（跨语言时元/复数由词条各自处理） */
export function formatRelativeTime(
  date: string | Date,
  t: TFunction,
  now: Date = new Date(),
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const time = target.getTime();
  if (Number.isNaN(time)) return t('time.unknown');

  const diff = now.getTime() - time;
  if (diff < MINUTE) return t('time.justNow');
  if (diff < HOUR) return t('time.minutesAgo', { count: Math.floor(diff / MINUTE) });
  if (diff < DAY) return t('time.hoursAgo', { count: Math.floor(diff / HOUR) });

  const days = Math.floor(diff / DAY);
  if (days < 30) return t('time.daysAgo', { count: days });
  if (days < 365) return t('time.monthsAgo', { count: Math.floor(days / 30) });
  return t('time.yearsAgo', { count: Math.floor(days / 365) });
}

/** 语言对应的 Intl locale；英语走 en-GB，日月顺序比 en-US 更接近香港习惯 */
const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

export function formatDateTime(value: string | Date, lang: Lang): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
