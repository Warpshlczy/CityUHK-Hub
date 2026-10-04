import * as yaml from 'js-yaml';

function invalid(message, details) {
  const error = new Error(message);
  error.details = details;
  return error;
}

function requireString(value, name, max) {
  if (typeof value !== 'string' || !value.trim()) throw invalid(`${name} 必须是非空字符串`);
  if (value.trim().length > max) throw invalid(`${name} 长度不能超过 ${max} 个字符`);
  return value.trim();
}

function optionalString(value, name, max) {
  if (value === undefined || value === null || value === '') return undefined;
  return requireString(value, name, max);
}

function optionalHttpUrl(value, name) {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = requireString(value, name, 2048);
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw invalid(`${name} 不是合法的 URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw invalid(`${name} 只支持 http/https 协议`);
  return url.toString();
}

function normalizeTags(value) {
  if (value === undefined || value === null) return [];
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : null;
  if (!values) throw invalid('tags 必须是字符串或字符串数组');
  const tags = [...new Set(values.map((tag) => requireString(tag, 'tags 元素', 16).toLowerCase()))];
  if (tags.length > 12) throw invalid('tags 最多 12 个');
  return tags;
}

function optionalEnum(value, allowed, name) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!allowed.includes(value)) throw invalid(`${name} 只能是：${allowed.join(' | ')}`);
  return value;
}

function requireBoolean(value, name) {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw invalid(`${name} 必须是布尔值`);
  return value;
}

function requireEnrollmentYear(value) {
  if (!Number.isInteger(value) || value < 1960 || value > 2100) {
    throw invalid('enrollmentYear 必须是 1960 到 2100 之间的年份');
  }
  return value;
}

const ALLOWED_FIELDS = [
  'id',
  'title',
  'summary',
  'author',
  'authorName',
  'major',
  'enrollmentYear',
  'repoUrl',
  'homepageUrl',
  'tags',
  'category',
  'language',
  'featured',
  'status',
];
const STATUSES = ['active', 'hidden', 'archived'];
/** 仓库母语：决定翻译的源语言槽位（源语言用原文，另两语才送去翻译） */
const LANGUAGES = ['zh-CN', 'zh-TW', 'en'];
const FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

export function parseFrontmatterDocument(content, fileName = 'document.md') {
  const text = String(content ?? '').replace(/\r\n?/g, '\n');
  const match = text.match(FRONTMATTER_RE);
  if (!match) throw invalid(`${fileName} 缺少 YAML front matter（文件开头需要 ---）`);

  let data;
  try {
    data = yaml.load(match[1]) ?? {};
  } catch (err) {
    throw invalid(`${fileName} 的 front matter 不是合法 YAML：${err.message}`);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw invalid(`${fileName} 的 front matter 必须是对象`);
  }

  const unknown = Object.keys(data).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (unknown.length > 0) {
    throw invalid(`${fileName} 包含未支持的字段：${unknown.join(', ')}`, { allowed: ALLOWED_FIELDS, unknown });
  }

  const meta = {
    id: optionalString(data.id, 'id', 80),
    title: requireString(data.title, 'title', 200),
    summary: optionalString(data.summary, 'summary', 600),
    author: requireString(data.author, 'author', 120),
    authorName: requireString(data.authorName, 'authorName', 120),
    major: requireString(data.major, 'major', 120),
    enrollmentYear: requireEnrollmentYear(data.enrollmentYear),
    repoUrl: optionalHttpUrl(data.repoUrl, 'repoUrl'),
    homepageUrl: optionalHttpUrl(data.homepageUrl, 'homepageUrl') ?? '',
    tags: normalizeTags(data.tags, 'tags') ?? [],
    category: optionalString(data.category, 'category', 80) ?? 'other',
    // 仓库母语；默认简中，老文档不写也能照常构建
    language: optionalEnum(data.language, LANGUAGES, 'language') ?? 'zh-CN',
    featured: requireBoolean(data.featured, 'featured') ?? false,
    status: optionalEnum(data.status, STATUSES, 'status') ?? 'active',
  };

  if (!meta.repoUrl) throw invalid(`${fileName} 必须填写 repoUrl`);
  return { meta, body: text.slice(match[0].length).trimStart() };
}

export { ALLOWED_FIELDS, STATUSES };
