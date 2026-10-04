import { useEffect, useRef, useState } from 'react';
import { LANGS, useI18n } from '../i18n';
import type { Lang } from '../i18n';

/** 方钮里只放得下两三个字符，短码与控制面板的完整名称分工 */
const SHORT_LABEL: Record<Lang, string> = {
  en: 'EN',
  'zh-CN': '简',
  'zh-TW': '繁',
};

const OPTION_LABEL_KEY: Record<Lang, string> = {
  en: 'lang.en',
  'zh-CN': 'lang.zhCN',
  'zh-TW': 'lang.zhTW',
};

/** 三语切换：写入 localStorage 并同步到 URL ?lang= */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('lang.switchTo')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('lang.switchTo')}
        className="btn-brutal btn-brutal-secondary !p-0 size-11"
      >
        <span className="pixel text-[9px]">{SHORT_LABEL[lang]}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('lang.label')}
          className="panel-brutal absolute top-full right-0 z-50 mt-2 w-36 p-1 shadow-[6px_6px_0_var(--c-shadow)]"
        >
          {LANGS.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={option === lang}
              onClick={() => {
                setLang(option);
                setOpen(false);
              }}
              className={[
                'mono flex w-full items-center justify-between px-2 py-1.5 text-left text-[12px] transition-colors',
                option === lang ? 'text-brand' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {t(OPTION_LABEL_KEY[option])}
              {option === lang && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
