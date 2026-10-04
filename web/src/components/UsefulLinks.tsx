import { useEffect, useState } from 'react';
import { ExternalLink, Link2, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface UsefulLink {
  nameKey: string;
  url: string;
  descKey: string;
}

const USEFUL_LINKS: UsefulLink[] = [
  { nameKey: 'links.aims.name', url: 'https://banweb.cityu.edu.hk/', descKey: 'links.aims.desc' },
  { nameKey: 'links.canvas.name', url: 'https://canvas.cityu.edu.hk/', descKey: 'links.canvas.desc' },
  { nameKey: 'links.website.name', url: 'https://www.cityu.edu.hk/', descKey: 'links.website.desc' },
  {
    nameKey: 'links.portal.name',
    url: 'https://www.cityu.edu.hk/portal/dashboard',
    descKey: 'links.portal.desc',
  },
];

/** 顶栏按钮 + 右侧抽屉：城大常用站点导航 */
export function UsefulLinks() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-label={t('links.button')}
          aria-expanded={open}
          className="chip-brutal flex h-11 items-center gap-2 px-3 text-[9px]"
        >
          <Link2 className="size-4 text-brand" />
          <span className="pixel hidden sm:inline">LINKS</span>
        </button>

        <span
          role="tooltip"
          className={`pixel pointer-events-none absolute top-full right-0 z-50 mt-2 border-[3px] border-line bg-surface px-3 py-2 text-[9px] whitespace-nowrap text-ink shadow-[4px_4px_0_var(--c-shadow),0_0_18px_var(--glow-brand)] transition-opacity duration-100 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {t('links.subtitle')}
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 right-0 w-80 max-w-[86%] overflow-y-auto border-l-[3px] border-line bg-canvas p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="pixel flex items-center gap-2 text-[10px] text-ink">
                  <span className="size-3 shrink-0 bg-brand" />
                  {t('links.heading')}
                </h2>
                <p className="mono mt-2 text-[11px] text-muted">{t('links.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('links.close')}
                className="btn-brutal btn-brutal-secondary !p-0 size-9"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-5 space-y-2">
              {USEFUL_LINKS.map((link) => (
                <li key={link.nameKey}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full items-center justify-between gap-3 border-2 border-line bg-surface px-3 py-2.5 transition-colors hover:border-brand hover:text-brand hover:shadow-[0_0_16px_var(--glow-brand)]"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="pixel text-[10px] text-ink">{t(link.nameKey)}</span>
                      <span className="mono truncate text-[11px] text-muted">
                        {t(link.descKey)}
                      </span>
                    </span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
