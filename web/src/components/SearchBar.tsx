import { useEffect, useRef, useState } from 'react';
import { HelpCircle, Search, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { parseQuery, removeQualifier, toQualifierChips } from '../utils/searchParser';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

/** 点问号后展开的规则，前缀与 searchParser 支持的一致 */
const RULES = [
  { syntax: 'author:alice', labelKey: 'search.rule.author' },
  { syntax: 'tag:NLP', labelKey: 'search.rule.tag' },
  { syntax: 'lang:Python', labelKey: 'search.rule.lang' },
  { syntax: 'category:机器学习', labelKey: 'search.rule.category' },
];

const TIP_KEYS = ['search.tip.combine', 'search.tip.stack', 'search.tip.free'];

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useI18n();
  const [text, setText] = useState(value);
  const [helpOpen, setHelpOpen] = useState(false);
  const committed = useRef(value);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (!helpOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setHelpOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [helpOpen]);

  useEffect(() => {
    if (text === committed.current) return;
    const timer = window.setTimeout(() => {
      committed.current = text;
      onChange(text);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [text, onChange]);

  const commit = (next: string) => {
    committed.current = next;
    setText(next);
    onChange(next);
  };

  const qualifierChips = toQualifierChips(text);
  const { freeText } = parseQuery(text);

  return (
    <div ref={rootRef} className="w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand" />
        {/* 清空与问号两个按钮都贴在输入框右侧，窄屏也能留出足够的输入宽度 */}
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              setHelpOpen(false);
              commit(text);
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              // 规则面板开着时，Esc 先收面板，别顺手把查询也清了
              if (helpOpen) setHelpOpen(false);
              else commit('');
            }
          }}
          placeholder={placeholder ?? t('search.placeholder')}
          aria-label={t('search.label')}
          className={`input-brutal h-11 w-full pl-9 text-sm ${text.length > 0 ? 'pr-[4.5rem]' : 'pr-11'}`}
        />

        {text.length > 0 && (
          <button
            type="button"
            onClick={() => commit('')}
            aria-label={t('search.clear')}
            className="absolute top-1/2 right-10 grid size-7 -translate-y-1/2 place-items-center border-2 border-line text-muted transition-colors hover:border-brand hover:text-brand"
          >
            <X className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setHelpOpen((prev) => !prev)}
          aria-label={t('search.rules')}
          aria-expanded={helpOpen}
          title={t('search.rules')}
          className={`absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center border-2 transition-colors ${
            helpOpen ? 'border-brand text-brand' : 'border-line text-muted hover:border-brand hover:text-brand'
          }`}
        >
          <HelpCircle className="size-3.5" />
        </button>

        {helpOpen && (
          <div className="panel-brutal absolute top-full right-0 z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] p-3 shadow-[6px_6px_0_var(--c-shadow)]">
            <p className="pixel text-[9px] text-muted">{t('search.rules')}</p>
            <dl className="mono mt-2 grid gap-1.5 text-[11px]">
              {RULES.map((rule) => (
                <div key={rule.syntax} className="flex items-baseline gap-2">
                  <dt className="text-brand">{rule.syntax}</dt>
                  <dd className="text-muted">{t(rule.labelKey)}</dd>
                </div>
              ))}
            </dl>
            <ul className="mono mt-2 grid gap-1 border-t-2 border-line pt-2 text-[11px] leading-5 text-muted">
              {TIP_KEYS.map((key) => (
                <li key={key}>· {t(key)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(qualifierChips.length > 0 || freeText) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {qualifierChips.map((chip) => (
            <button
              key={`${chip.key}:${chip.value}`}
              type="button"
              onClick={() => commit(removeQualifier(text, chip.key, chip.value))}
              title={t('search.removeQualifier')}
              className="chip-brutal is-active px-2 py-0.5 text-[11px]"
            >
              <span className="font-bold">
                {chip.key}:{chip.value}
              </span>
              <X className="size-3" />
            </button>
          ))}
          {freeText && (
            <span className="mono text-[11px] text-muted">{t('search.keyword', { value: freeText })}</span>
          )}
        </div>
      )}
    </div>
  );
}
