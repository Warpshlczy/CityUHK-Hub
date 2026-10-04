// 组件层只认这份契约，数据来自 public/data 下 repos-parser 生成的静态 JSON。

import type { Lang } from '../i18n/messages';

/** 项目条目里会被翻译的字段 */
export interface LocalizedText {
  name: string;
  description: string;
  about: string;
  major: string;
  /** 分类显示名；构建期顺带写入，缺的时候组件层用 categoryLabels 兜底 */
  category?: string;
}

/**
 * 三语文本由 repos-parser 构建期产出，结果落盘缓存（data/translation-cache.json）。
 * zh-CN 是原始原文，en / zh-TW 是机器翻译结果。
 */
export type LocalizedTextByLang = Record<Lang, LocalizedText>;

/** 详情页 README：三份渲染好的 HTML */
export type ReadmeHtmlByLang = Record<Lang, string>;

/** 分类名是中文自由文本，用 canonical 原文做 key，映射到三语显示名 */
export type CategoryLabels = Record<string, Record<Lang, string>>;

export interface Project {
  id: string;
  name: string;
  author: string;
  // 作者实名；GitHub 用户名是 author
  authorName?: string;
  major?: string;
  enrollmentYear?: number;
  authorAvatar: string;
  repo: string;
  // 仓库的 About，没写就是空字符串
  about: string;
  // 取 repos/<id>.md 正文 Features 之前的部分，只在卡片上显示
  description: string;
  tags: string[];
  category: string;
  githubUrl: string;
  demoUrl: string | null;
  // 仓库是否发布过 Release；构建期采集，拿不到时降级为 false
  hasRelease?: boolean;
  stars: number;
  // 近 7 天新增 star，取自自建快照；null 表示站内历史还没攒够 7 天
  starsGained7d?: number | null;
  forks: number;
  language: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  // 被本站收录的日期（YYYY-MM-DD）
  addedAt?: string;
  // 三语条目；老数据没有这个字段，读取时退回原文字段
  i18n?: LocalizedTextByLang;
  // 详情页按需加载，列表接口不含该字段
  readmeHtml?: string;
  // 详情页三语 README；缺语言时退回 readmeHtml
  readmeHtmlByLang?: ReadmeHtmlByLang;
}

export interface CountItem {
  name: string;
  count: number;
}

export interface AuthorItem extends CountItem {
  avatar?: string;
  realName?: string;
  // 取仓库 owner，比 front matter 里的 author 可靠
  githubUser?: string;
}

export interface ProjectsResponse {
  generatedAt: string;
  total: number;
  projects: Project[];
  tags: CountItem[];
  authors: CountItem[];
  categories: CountItem[];
  // 分类的三语显示名；老数据没有这个字段
  categoryLabels?: CategoryLabels;
}

export type SortKey = 'heat' | 'stars' | 'updated' | 'name';
