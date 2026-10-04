#!/usr/bin/env node
/**
 * 预渲染：给每个路由生成一份静态 HTML，供搜索引擎收录。
 *
 * SPA 只靠前端渲染的话，不执行 JS 的爬虫读不到任何内容，所以在构建期把每个项目的
 * head 标签与正文写进静态 HTML；用户侧 React 加载后再接管渲染。
 * 产物写入 web/dist：首页 index.html，project/<id>/index.html，以及 sitemap.xml、robots.txt。
 *
 * 数据来自解析器产出的 public/data/*.json，必须在 vite build 之后运行。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const webDir = path.join(projectRoot, 'web');
const distDir = path.resolve(process.env.OUTPUT_DIR ?? path.join(webDir, 'dist'));
const dataDir = path.resolve(process.env.DATA_DIR ?? path.join(webDir, 'public', 'data'));
/** 与 web/src/utils/seo.ts 里的 SITE_ORIGIN 保持一致 */
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://cityu-hub.bond';
/** 部署在子路径时才需要改（默认部署在域名根路径） */
const BASE_PATH = (process.env.BASE_PATH ?? '/').replace(/\/+$/, '');
const SITE_NAME = 'CityUHK Hub';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** 截断，避免 meta description 过长被搜索引擎丢弃 */
function clamp(value, max = 150) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** readmeHtml → 纯文本，给爬虫一段可索引的正文 */
function htmlToText(html, max = 2400) {
  const text = String(html ?? '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** 粗略估宽：CJK 1em、其余 0.62em，画徽章够用 */
function textWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) units += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.62;
  return Math.round(units * fontSize);
}

/**
 * 生成 shields 风格徽章 SVG。文字只用 ASCII 与 ★ —— GitHub 的 camo 用 librsvg 渲染，
 * 未必带中文字体，写中文会变成方框。
 */
function badgeSvg({ label, message }) {
  const fontSize = 11;
  const pad = 10;
  const height = 20;
  const labelW = textWidth(label, fontSize) + pad * 2;
  const messageW = textWidth(message, fontSize) + pad * 2;
  const total = labelW + messageW;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${height}" role="img" aria-label="${escapeHtml(`${label}: ${message}`)}">
  <linearGradient id="g" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".12" />
    <stop offset="1" stop-opacity=".12" />
  </linearGradient>
  <clipPath id="c"><rect width="${total}" height="${height}" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#c)">
    <rect width="${labelW}" height="${height}" fill="#f47c94" />
    <rect x="${labelW}" width="${messageW}" height="${height}" fill="#101014" />
    <rect width="${total}" height="${height}" fill="url(#g)" />
  </g>
  <g font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="${fontSize}" text-anchor="middle">
    <text x="${labelW / 2}" y="14" fill="#180a0f">${escapeHtml(label)}</text>
    <text x="${labelW + messageW / 2}" y="14" fill="#fff">${escapeHtml(message)}</text>
  </g>
</svg>
`;
}

/** 替换 head 里已有的标签（没有就补），避免出现两个 description */
function upsertHead(html, { title, description, canonical, type = 'website', image }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  const tags = [
    ['name', 'description', description],
    ['property', 'og:type', type],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', canonical],
    ['name', 'twitter:card', 'summary'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
  ];
  if (image) {
    tags.push(['property', 'og:image', image], ['name', 'twitter:image', image]);
  }

  const markup = [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...tags.map(([attr, key, content]) =>
      attr === 'property'
        ? `<meta property="${key}" content="${escapeHtml(content)}" />`
        : `<meta name="${key}" content="${escapeHtml(content)}" />`,
    ),
  ].join('\n    ');

  // 旧的 description 先删掉，再由上面的整组标签统一插入
  out = out.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '');
  out = out.replace(/\s*<link\s+rel="canonical"[\s\S]*?\/>/, '');
  return out.replace('</head>', `  ${markup}\n  </head>`);
}

function injectJsonLd(html, data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return html.replace(
    '</head>',
    `  <script type="application/ld+json">${json}</script>\n  </head>`,
  );
}

/** 预渲染占位正文，React 挂载后会替换 #root */
function injectCrawlBody(html, bodyHtml) {
  return html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root"><div style="max-width:72rem;margin:0 auto;padding:24px 16px">${bodyHtml}</div></div>`,
  );
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * 站点首要语言是英语，静态页只预渲染英文一份；项目文案优先取构建期翻译的
 * i18n.en / readmeHtmlByLang.en，翻译缺失时回退原文，保证爬虫一定读得到内容。
 */
function pickEn(detail) {
  const en = detail.i18n?.en;
  return {
    name: en?.name || detail.name,
    description: en?.description || detail.description,
    about: en?.about || detail.about,
    major: en?.major || detail.major,
    category: en?.category || detail.category,
    readmeHtml: detail.readmeHtmlByLang?.en || detail.readmeHtml,
  };
}

const shell = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
const list = await readJson(path.join(dataDir, 'projects.json'));
if (!list) {
  console.error(`[prerender] 读不到 ${path.join(dataDir, 'projects.json')}，跳过预渲染`);
  process.exit(0);
}

const projects = list.projects ?? [];
const urls = [];

{
  let html = upsertHead(shell, {
    title: `${SITE_NAME} · CityUHK Open-Source Hub`,
    description: `A navigation site for open-source projects built by students of City University of Hong Kong (CityUHK): ${projects.length} projects listed, filterable by author, major, tag, language and category, with one-click links to the GitHub repositories.`,
    canonical: `${SITE_ORIGIN}/`,
  });
  html = injectJsonLd(html, {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'CityUHK Open-Source Hub',
    url: `${SITE_ORIGIN}/`,
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  const items = projects
    .slice(0, 30)
    .map((project) => {
      const en = pickEn(project);
      const summary = clamp(en.about || en.description || '', 90);
      return `<li><a href="${BASE_PATH}/project/${encodeURIComponent(project.id)}">${escapeHtml(en.name)}</a> — ${escapeHtml(summary)}</li>`;
    })
    .join('\n      ');
  html = injectCrawlBody(
    html,
    `<h1>${escapeHtml(SITE_NAME)} · CityUHK Open-Source Hub</h1>
      <p>A navigation site for open-source projects built by students of City University of Hong Kong: ${projects.length} projects listed.</p>
      <ul>
      ${items}
      </ul>`,
  );

  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8');
  urls.push({ loc: `${SITE_ORIGIN}/`, lastmod: (list.generatedAt ?? '').slice(0, 10), priority: '1.0' });
}

for (const project of projects) {
  const detail =
    (await readJson(path.join(dataDir, 'projects', `${project.id}.json`))) ?? project;
  const en = pickEn(detail);
  const name = en.name ?? project.name;
  const about = (en.about ?? '').trim();
  const description = clamp(about || en.description || `${name} — an open-source project at CityUHK`, 150);
  const url = `${SITE_ORIGIN}/project/${encodeURIComponent(project.id)}`;

  let html = upsertHead(shell, {
    title: `${name} · ${SITE_NAME}`,
    description,
    canonical: url,
    type: 'article',
  });
  html = injectJsonLd(html, {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name,
    description,
    codeRepository: detail.githubUrl,
    url,
    author: { '@type': 'Person', name: detail.authorName || detail.author },
    programmingLanguage: detail.language || undefined,
    keywords: (detail.tags ?? []).join(', ') || undefined,
    dateModified: detail.updatedAt || undefined,
  });

  const metaLine = [
    detail.authorName && detail.authorName !== detail.author ? `${detail.author} (${detail.authorName})` : detail.author,
    en.major,
    detail.enrollmentYear ? `Intake ${detail.enrollmentYear}` : '',
    en.category,
  ]
    .filter(Boolean)
    .join(' · ');

  const body = [
    `<article>`,
    `  <h1>${escapeHtml(name)}</h1>`,
    `  <p>${escapeHtml(metaLine)}</p>`,
    `  <p>Repository: <a href="${escapeHtml(detail.githubUrl)}">${escapeHtml(detail.repo)}</a></p>`,
    about ? `  <p>${escapeHtml(about)}</p>` : '',
    en.description ? `  <p>${escapeHtml(en.description)}</p>` : '',
    (detail.tags ?? []).length
      ? `  <ul>${(detail.tags ?? []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`
      : '',
    `  <h2>Project overview</h2>`,
    `  <p>${escapeHtml(htmlToText(en.readmeHtml))}</p>`,
    `</article>`,
  ]
    .filter(Boolean)
    .join('\n  ');

  const outDir = path.join(distDir, 'project', project.id);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.html'), injectCrawlBody(html, body), 'utf8');

  // 徽章贴到作者仓库 README，既是被收录标记，也带来一条反向链接与点击回流
  const badgeDir = path.join(distDir, 'badge');
  await fs.mkdir(badgeDir, { recursive: true });
  await fs.writeFile(
    path.join(badgeDir, `${project.id}.svg`),
    badgeSvg({ label: SITE_NAME, message: `listed ★ ${detail.stars ?? 0}` }),
    'utf8',
  );

  urls.push({
    loc: url,
    lastmod: detail.updatedAt ?? '',
    priority: '0.8',
  });
}

{
  const entries = urls
    .map(
      ({ loc, lastmod, priority }) =>
        `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
  await fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8');
}

console.log(`[prerender] 已生成 ${projects.length + 1} 个页面、sitemap.xml 与 robots.txt → ${distDir}`);
