import { useMemo } from 'react';
import { useI18n, localizeProject, type Lang } from '../i18n';
import type { Project, SortKey } from '../types';
import { parseQuery, type Qualifiers } from '../utils/searchParser';

// 匹配权重：项目名 > 标签 > 作者 > 描述/分类/语言
const WEIGHT = {
  exactName: 10,
  name: 6,
  exactTag: 4,
  tag: 3,
  author: 2,
  description: 1,
  other: 1,
  none: 0,
} as const;

const lower = (value: string | undefined) => (value ?? '').toLowerCase();

// 不同限定符之间是「与」；tag: 写多个也是「与」，author:/lang:/category: 写多个按「任意命中」；
// author: 同时匹配 GitHub 用户名与作者实名。
function matchesQualifiers(project: Project, qualifiers: Qualifiers): boolean {
  const authors = qualifiers.author.map((value) => value.toLowerCase());
  if (authors.length > 0) {
    const names = [lower(project.author), lower(project.authorName)];
    if (!authors.some((value) => names.includes(value))) return false;
  }

  const languages = qualifiers.lang.map((value) => value.toLowerCase());
  if (languages.length > 0 && !languages.includes(lower(project.language))) return false;

  const categories = qualifiers.category.map((value) => value.toLowerCase());
  if (categories.length > 0 && !categories.includes(lower(project.category))) return false;

  return qualifiers.tag.every((tag) =>
    project.tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  );
}

/** 搜索要同时命中原文与当前语言的译文，所以先按项目摊平出一个可比对的词组 */
interface Haystack {
  names: string[];
  tags: string[];
  authors: string[];
  descriptions: string[];
  other: string[];
}

function buildHaystack(project: Project, lang: Lang): Haystack {
  const text = localizeProject(project, lang);
  return {
    names: [project.name, text.name],
    tags: project.tags,
    authors: [project.author, project.authorName ?? ''],
    descriptions: [
      project.description,
      text.description,
      project.about,
      text.about,
      project.major ?? '',
      text.major,
    ],
    other: [project.category, text.category, project.language, project.repo],
  };
}

const anyEquals = (values: string[], term: string) =>
  values.some((value) => lower(value) === term);
const anyIncludes = (values: string[], term: string) =>
  values.some((value) => lower(value).includes(term));

function termScore(hay: Haystack, term: string): number {
  if (anyEquals(hay.names, term)) return WEIGHT.exactName;
  if (anyIncludes(hay.names, term)) return WEIGHT.name;

  if (anyEquals(hay.tags, term)) return WEIGHT.exactTag;
  if (anyIncludes(hay.tags, term)) return WEIGHT.tag;

  if (anyIncludes(hay.authors, term)) return WEIGHT.author;
  if (anyIncludes(hay.descriptions, term)) return WEIGHT.description;
  if (anyIncludes(hay.other, term)) return WEIGHT.other;

  return WEIGHT.none;
}

/** 名称排序按当前语言的拼音/字母序，不要固定用简中 */
const COLLATOR_LOCALE: Record<Lang, string> = {
  en: 'en',
  'zh-CN': 'zh-Hans-CN',
  'zh-TW': 'zh-Hant-TW',
};

function compareBy(
  sort: SortKey,
  a: Project,
  b: Project,
  lang: Lang,
  heatScores?: Map<string, number>,
): number {
  switch (sort) {
    case 'heat':
      // 热力值由调用方算好（要等站内统计到位），拿不到时退回按 star 排
      return (heatScores?.get(b.id) ?? 0) - (heatScores?.get(a.id) ?? 0) || b.stars - a.stars;
    case 'stars':
      return b.stars - a.stars;
    case 'name':
      return a.name.localeCompare(b.name, COLLATOR_LOCALE[lang]);
    case 'updated':
    default:
      return b.updatedAt.localeCompare(a.updatedAt);
  }
}

export function useSearch(
  projects: Project[],
  query: string,
  sort: SortKey = 'updated',
  heatScores?: Map<string, number>,
): Project[] {
  const { lang } = useI18n();

  return useMemo(() => {
    const { qualifiers, terms } = parseQuery(query);

    const scored: Array<{ project: Project; score: number }> = [];

    for (const project of projects) {
      if (!matchesQualifiers(project, qualifiers)) continue;

      const hay = buildHaystack(project, lang);
      let score = 0;
      let matchedAll = true;
      for (const term of terms) {
        const weight = termScore(hay, term);
        if (weight === WEIGHT.none) {
          matchedAll = false;
          break;
        }
        score += weight;
      }
      if (!matchedAll) continue;

      scored.push({ project, score });
    }

    scored.sort((a, b) => b.score - a.score || compareBy(sort, a.project, b.project, lang, heatScores));

    return scored.map((item) => item.project);
  }, [projects, query, sort, lang, heatScores]);
}
