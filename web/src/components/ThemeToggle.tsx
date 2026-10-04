import { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n';
import { useUrlState } from '../hooks/useUrlState';

export const THEME_STORAGE_KEY = 'cityu-hub-theme';

function readStoredTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

/** 亮暗模式切换：写入 localStorage，同时同步到 URL ?theme= */
export function ThemeToggle() {
  const { t } = useI18n();
  // 默认值必须是常量，否则 localStorage 变化会让默认值漂移
  const [themeParam, setThemeParam] = useUrlState('theme');
  const storedTheme = useRef(readStoredTheme()).current;
  const theme = themeParam || storedTheme;
  const isDark = theme !== 'light';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const label = isDark ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      onClick={() => setThemeParam(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className="btn-brutal btn-brutal-secondary !p-0 size-11"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
