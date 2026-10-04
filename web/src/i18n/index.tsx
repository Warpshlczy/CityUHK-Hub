import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useUrlState } from '../hooks/useUrlState';
import type { CategoryLabels, LocalizedText } from '../types';
import { DEFAULT_LANG, LANGS, MESSAGES, type Lang } from './messages';

export { DEFAULT_LANG, LANGS } from './messages';
export type { Lang } from './messages';

/** 与 theme 的 storage key 命名保持一致 */
export const LANG_STORAGE_KEY = 'cityu-hub-lang';

/** t 的签名：词条里用 {name} 占位，vars 提供替换值 */
export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export interface I18nValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLang(value: string | null | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value);
}

/** 默认值必须是常量，否则 localStorage 变化会让默认值漂移 */
function readStoredLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(stored) ? stored : DEFAULT_LANG;
  } catch {
    // 隐私模式下读不到，走默认
    return DEFAULT_LANG;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // URL ?lang= 优先，其次 localStorage，最后英语；与 theme 的取值顺序一致
  const [langParam, setLangParam] = useUrlState('lang');
  // 必须用 state 保存已选语言：点项目卡片导航会丢掉 ?lang=，若只在挂载时读一次
  // localStorage，langParam 变空后会回退到旧值，语言就被弹回去了。
  const [stored, setStored] = useState<Lang>(readStoredLang);
  const lang: Lang = isLang(langParam) ? langParam : stored;

  useEffect(() => {
    document.documentElement.lang = lang;
    setStored(lang); // 与 localStorage 保持同步（同值时 React 会跳过重渲染）
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* 写不进去也不影响本次浏览 */
    }
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      setStored(next);
      setLangParam(next);
    },
    [setLangParam],
  );

  const t = useCallback<TFunction>(
    (key, vars) => {
      const entry = MESSAGES[key];
      // 缺词条时退回英语，再缺就把 key 显示出来，方便发现遗漏
      const template = entry ? entry[lang] ?? entry.en : key;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        vars[name] === undefined ? match : String(vars[name]),
      );
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n 必须在 I18nProvider 内使用');
  return context;
}

/** 分类名是自由文本，用 canonical 原文换当前语言的显示名 */
export function categoryLabel(
  name: string,
  lang: Lang,
  labels?: CategoryLabels,
): string {
  return labels?.[name]?.[lang] ?? name;
}

/** 项目条目按当前语言摊平后的文本 */
export interface LocalizedProjectText {
  name: string;
  description: string;
  about: string;
  major: string;
  category: string;
  readmeHtml: string;
}

interface LocalizableProject {
  name: string;
  description: string;
  about: string;
  major?: string;
  category: string;
  i18n?: Record<Lang, LocalizedText>;
  readmeHtml?: string;
  readmeHtmlByLang?: Record<Lang, string>;
}

/**
 * 取项目在指定语言下的文本。三语由 repos-parser 构建期写入；
 * 老数据（没有 i18n 字段）或某语言缺失时一律退回 zh-CN 原文，函数始终安全。
 */
export function localizeProject(
  project: LocalizableProject,
  lang: Lang,
  categoryLabels?: CategoryLabels,
): LocalizedProjectText {
  const byLang = project.i18n;
  const source = byLang?.['zh-CN'];
  const pick = (key: keyof LocalizedText, fallback: string) =>
    byLang?.[lang]?.[key] ?? source?.[key] ?? fallback;

  return {
    name: pick('name', project.name),
    description: pick('description', project.description),
    about: pick('about', project.about),
    major: pick('major', project.major ?? ''),
    category:
      byLang?.[lang]?.category ??
      source?.category ??
      categoryLabel(project.category, lang, categoryLabels),
    readmeHtml:
      project.readmeHtmlByLang?.[lang] ??
      project.readmeHtmlByLang?.['zh-CN'] ??
      project.readmeHtml ??
      '',
  };
}
