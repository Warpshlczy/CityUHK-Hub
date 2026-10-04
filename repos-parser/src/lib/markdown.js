/** 零依赖 README 解析：从 Markdown 提取标题、摘要、目录、图片 */

const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const BADGE_PATTERN =
  /(shields\.io|badgen\.net|badge\.fury\.io|travis-ci|appveyor|circleci|codecov|coveralls|codeclimate|snyk\.io|david-dm|isitmaintained|opencollective|buymeacoffee|ko-fi\.com|hits\.seeyoufarm|visitor-badge|profile-counter|star-history|nodei\.co)/i;

export function toPlainText(markdown) {
  return String(markdown ?? '')
    .replace(HTML_COMMENT, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^<>]+>/g, ' ')
    .replace(/^\s{0,3}>\s?/gm, ' ')
    .replace(/[`*_~]+/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugOfHeading(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractTitle(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    const atx = lines[i].match(/^\s{0,3}#\s+(\S.*?)\s*#*\s*$/);
    if (atx) return { title: atx[1].replace(/[*_`]/g, '').trim(), index: i };
  }
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (lines[i].trim() && /^\s{0,3}={3,}\s*$/.test(lines[i + 1])) {
      return { title: lines[i].replace(/[*_`]/g, '').trim(), index: i };
    }
  }
  const firstTextLine = lines.find((l) => l.trim() && toPlainText(l).length >= 2);
  const fallbackTitle = firstTextLine ? toPlainText(firstTextLine).slice(0, 120) : '';
  return { title: fallbackTitle, index: -1 };
}

function extractHeadings(lines) {
  const headings = [];
  for (const line of lines) {
    const m = line.match(/^\s{0,3}(#{1,6})\s+(\S.*?)\s*#*\s*$/);
    if (!m) continue;
    const text = toPlainText(m[2]);
    if (!text) continue;
    headings.push({ level: m[1].length, text, slug: slugOfHeading(text) });
  }
  return headings;
}

function extractImages(markdown) {
  const images = [];
  const re = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const url = m[2];
    images.push({ alt: (m[1] ?? '').trim(), url, isBadge: BADGE_PATTERN.test(url) });
  }
  return images;
}

function isNoisyBlock(block, title = '') {
  const meaningful = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((line) => {
      if (/^!\[[^\]]*\]\([^)]*\)\s*$/.test(line)) return false; // 纯图片行
      if (/^<[^>]+>\s*$/.test(line)) return false; // 纯 HTML 标签行
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) return false; // 分隔线
      if (/^\s*\[!\[/.test(line)) return false; // 徽章行
      if (/^\|/.test(line)) return false; // 表格行
      if (/^<p[^>]*>[\s\S]*<\/p>$/.test(line) && !/[\p{L}\p{N}]{12,}/u.test(toPlainText(line))) return false;
      return true;
    });

  if (meaningful.length === 0) return true;

  const plain = toPlainText(meaningful.join(' '));
  if (plain.length < 20) return true;
  if (title && plain.replace(/\s+/g, '') === String(title).replace(/\s+/g, '')) return true;
  if (BADGE_PATTERN.test(plain)) return true;
  const lettersOrCjk = plain.replace(/[^\p{L}\p{N}]/gu, '').length;
  return lettersOrCjk < 8;
}

function truncate(text, max = 220) {
  if (text.length <= max) return text;
  const window = text.slice(0, max);
  const sentenceEnd = Math.max(
    window.lastIndexOf('。'),
    window.lastIndexOf('！'),
    window.lastIndexOf('？'),
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? '),
  );
  if (sentenceEnd > max * 0.5) return window.slice(0, sentenceEnd + 1).trim();
  const space = window.lastIndexOf(' ');
  return `${(space > max * 0.5 ? window.slice(0, space) : window).trim()}…`;
}

function extractSummary(body, title = '') {
  for (const block of body.split(/\n\s*\n/)) {
    if (isNoisyBlock(block, title)) continue;
    const plain = toPlainText(block);
    if (!plain) continue;
    if (/^(table of contents|目录|安装|install|usage|使用|license|许可|contributing|贡献)/i.test(plain)) continue;
    return truncate(plain);
  }
  return '';
}

function textStats(plain) {
  const cjk = (plain.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const words = (plain.replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? [])
    .length;
  return {
    charCount: plain.replace(/\s+/g, '').length,
    wordCount: words,
    cjkCount: cjk,
    readingMinutes: Math.max(1, Math.round(cjk / 350 + words / 220)),
  };
}

export function analyzeReadme(markdown) {
  const text = String(markdown ?? '').replace(/\r\n?/g, '\n').replace(HTML_COMMENT, '');
  const lines = text.split('\n');
  const { title, index } = extractTitle(lines);
  const bodyLines = index >= 0 ? [...lines.slice(0, index), ...lines.slice(index + 1)] : lines;
  const body = bodyLines.join('\n');

  const headings = extractHeadings(lines);
  const images = extractImages(text);

  return {
    title: title || '',
    // 标题是从正文首行兜底推出来的时候，body 里还留着同一段文本，不能再拿去去重，
    // 否则纯正文的介绍会被判成「与标题重复」而丢掉摘要
    summary: extractSummary(body, index >= 0 ? title : ''),
    headings,
    images,
    firstImage: images.find((img) => !img.isBadge) ?? null,
    hasBadges: images.some((img) => img.isBadge),
    hasCodeBlock: /```[\s\S]*?```/.test(text),
    stats: textStats(toPlainText(body)),
  };
}

// 「功能 / 特点」等中文小标题与英文 Features 等价：简中仓库正文不写英文标题
const FEATURES_HEADING = /^\s{0,3}##\s+(?:Features|功能|特点|特點)\s*#*\s*$/im;
const NEXT_HEADING = /^\s{0,3}#{1,6}\s+/;

function featuresSectionBody(text, heading) {
  const lines = text.slice(heading.index + heading[0].length).split('\n');
  const body = [];
  for (const line of lines) {
    if (NEXT_HEADING.test(line)) break;
    body.push(line);
  }
  return body.join('\n').trim();
}

function dropEmptyFeaturesSection(text) {
  const heading = FEATURES_HEADING.exec(text);
  if (!heading || featuresSectionBody(text, heading)) return text;
  const before = text.slice(0, heading.index).trim();
  const after = text.slice(heading.index + heading[0].length).trim();
  return [before, after].filter(Boolean).join('\n\n');
}

export function extractIntroduction(markdown) {
  const text = String(markdown ?? '').replace(/\r\n?/g, '\n');
  const heading = FEATURES_HEADING.exec(text);
  return (heading ? text.slice(0, heading.index) : text).trim();
}

/**
 * 介绍留空时回退到 GitHub README。
 * `## Features` 由作者决定：写空或不写都不展示，也不用仓库简介补齐。
 */
export function fillProjectContent(markdown, { readme = '' } = {}) {
  const text = String(markdown ?? '').replace(/\r\n?/g, '\n');
  const heading = FEATURES_HEADING.exec(text);
  const intro = extractIntroduction(text);
  const rest = heading ? text.slice(heading.index).trim() : '';
  const head = !intro && String(readme).trim() ? String(readme).trim() : intro;
  return dropEmptyFeaturesSection([head, rest].filter(Boolean).join('\n\n'));
}

export function guessTagsFromReadme(markdown, { language, topics = [] } = {}) {
  const lower = String(markdown ?? '').toLowerCase();
  const dictionary = [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'vite', 'tailwindcss', 'typescript', 'javascript',
    'node.js', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'spring boot', 'go', 'rust',
    'docker', 'kubernetes', 'mysql', 'postgresql', 'mongodb', 'redis', 'machine learning', 'deep learning',
    'pytorch', 'tensorflow', 'llm',
  ];

  const found = new Set();
  for (const t of topics) found.add(String(t).toLowerCase());
  if (language) found.add(String(language).toLowerCase());
  for (const key of dictionary) {
    if (lower.includes(key)) found.add(key);
  }
  return [...found].slice(0, 12);
}
