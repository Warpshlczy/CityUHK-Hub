/**
 * 构建期翻译：为每个项目补出 en / zh-CN / zh-TW 三语文本，结果落盘缓存。
 * - 离线（--offline / parse）只读缓存，缺了就回退原文，绝不出网。
 * - 在线（parse:online，Vercel 构建）补齐缺失条目并写回缓存。
 * 任何网络错误都不抛出，只告警并回退原文，避免中断构建。
 *
 * ponytail: 免费接口不稳定（Youdao 会 411 限流、MyMemory 有匿名日配额且单请求约 500 字节），
 * 繁体只有 MyMemory 真支持，因此缓存是必须的；失败即回退原文，不追求一次成功。
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const parserRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resolveCachePath = () =>
  path.resolve(process.env.TRANSLATION_CACHE_PATH ?? path.join(parserRoot, 'data', 'translation-cache.json'));
/** 缓存随仓库提交，保证线上/离线构建可复现 */
export const defaultCachePath = resolveCachePath();

const LANGS = ['en', 'zh-CN', 'zh-TW'];
const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const LETTER_RE = /\p{L}/u;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha1 = (text) => createHash('sha1').update(text, 'utf8').digest('hex');

// 受保护片段（原样保留，不送去翻译）：围栏代码块 / 行内代码 / 整条链接或图片 / 裸 URL /
// HTML 标签 / 行首结构符号（# > - * 1.）/ 强调符号（* _）。否则代码、URL、粗体都会被翻译器改坏。
const PROTECT_RE =
  /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`|!?\[[^\]]*\]\([^)]*\)|https?:\/\/[^\s<>()"']+|<[^<>\n]+>|^[ \t]*(?:#{1,6}|>|[-*+]|\d+\.)[ \t]+|\*{1,3}|_{1,3})/gm;

/** MyMemory 会把换行等转义成 HTML 实体，这里还原一次（只还原一次，源里本就是实体也能保住） */
function decodeEntities(text) {
  return text
    .replace(/&#10;/g, '\n')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Youdao 官方 demo，实测支持 zh-CHS ↔ en，单请求可带较长文本；411 = 请求过快需退避 */
async function youdaoOnce(text, from, to, fetchImpl) {
  const response = await fetchImpl('https://aidemo.youdao.com/trans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ q: text, from, to }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (data.errorCode === '0' && typeof data.translation?.[0] === 'string' && data.translation[0]) {
    return data.translation[0];
  }
  const error = new Error(`youdao errorCode=${data.errorCode}`);
  error.retryable = data.errorCode === '411'; // 其它错误码（如 102 语种不支持）直接放弃
  throw error;
}

async function youdaoTranslate(text, from, to, fetchImpl, delayMs) {
  return translateChunks(text, 1800, (s) => s.length, async (chunk) => {
    let translated = null;
    for (let attempt = 0; attempt < 3 && translated === null; attempt += 1) {
      try {
        translated = await youdaoOnce(chunk, from, to, fetchImpl);
      } catch (error) {
        if (!error.retryable) return null;
        await sleep(delayMs * 2 ** attempt); // 指数退避
      }
    }
    return translated;
  }, delayMs);
}

/** MyMemory：支持 zh-CN|zh-TW 真繁体，但单请求约 500 字节上限，必须分段后拼接 */
async function myMemoryOnce(text, from, to, fetchImpl) {
  const pair = encodeURIComponent(`${from}|${to}`);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  if (data.quotaFinished) return null; // 匿名日配额耗尽
  const translated = data.responseData?.translatedText;
  if (response.status !== 200 || typeof translated !== 'string' || !translated) return null;
  return decodeEntities(translated);
}

async function myMemoryTranslate(text, from, to, fetchImpl, delayMs) {
  return translateChunks(text, 450, (s) => Buffer.byteLength(s, 'utf8'), (chunk) => myMemoryOnce(chunk, from, to, fetchImpl), delayMs);
}

/** 按上限切段逐段翻译后拼接；任何一段失败就整段判失败，避免产出半截译文 */
async function translateChunks(text, limit, measure, translateOne, delayMs) {
  const chunks = splitText(text, limit, measure);
  let result = '';
  for (const chunk of chunks) {
    if (!chunk.trim() || !LETTER_RE.test(chunk)) {
      result += chunk;
      continue;
    }
    const translated = await translateOne(chunk);
    if (translated === null) return null;
    result += translated;
    await sleep(delayMs);
  }
  return result;
}

/** 按行优先切分，超长行再按 code point 硬切，保证每段不超过 limit */
function splitText(text, limit, measure) {
  const chunks = [];
  let current = '';
  let size = 0;
  const flush = () => {
    if (current) chunks.push(current);
    current = '';
    size = 0;
  };
  for (const part of text.split(/(\n+)/)) {
    const partSize = measure(part);
    if (partSize > limit) {
      flush();
      for (const ch of part) {
        const chSize = measure(ch);
        if (size + chSize > limit) {
          chunks.push(current);
          current = '';
          size = 0;
        }
        current += ch;
        size += chSize;
      }
      continue;
    }
    if (size + partSize > limit) flush();
    current += part;
    size += partSize;
  }
  flush();
  return chunks;
}

async function readCache(cachePath) {
  try {
    const parsed = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * 创建翻译器。离线只读缓存；在线补齐缺失并写回缓存（flush）。
 * `offline` 为真或未提供 fetch 时绝不联网。
 */
export async function createTranslator({
  offline = false,
  cachePath = resolveCachePath(),
  fetchImpl = globalThis.fetch,
  delayMs = 400,
} = {}) {
  const cache = await readCache(cachePath);
  let dirty = false;

  async function translateRaw(text, target) {
    const src = String(text ?? '');
    // zh-CN 即原文本身，直接复制；纯符号/数字也不必翻译
    if (!src.trim() || target === 'zh-CN' || !LETTER_RE.test(src)) return src;
    const chinese = CJK_RE.test(src);
    if (target === 'en' && !chinese) return src; // 本来就是英文，无需翻译

    const key = sha1(src);
    const cached = cache[key]?.[target];
    if (typeof cached === 'string' && cached) return cached;
    // 离线只认缓存；缺了就原样返回，不联网也不告警（dev/CI 会大面积缺）
    if (offline || typeof fetchImpl !== 'function') return src;

    const translated = await translateByProviders(src, target, { fetchImpl, delayMs });
    if (translated === null) {
      console.warn(`[translate] ${target} 翻译失败，回退原文：${src.slice(0, 40)}…`);
      return src;
    }
    cache[key] = { ...(cache[key] ?? {}), [target]: translated };
    dirty = true;
    return translated;
  }

  async function translate(text, target) {
    try {
      return await translateRaw(text, target);
    } catch (error) {
      console.warn(`[translate] 意外错误，回退原文：${error.message}`);
      return String(text ?? '');
    }
  }

  /** 翻译 README 正文：切出受保护片段原样保留，只翻自然语言，再按原顺序拼回 */
  async function translateMarkdown(markdown, target) {
    const src = String(markdown ?? '');
    if (target === 'zh-CN' || !src) return src;
    const parts = src.split(PROTECT_RE);
    let result = '';
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (i % 2 === 1 || !part.trim()) {
        result += part; // 奇数索引是受保护片段
        continue;
      }
      const lead = part.match(/^\s*/)[0];
      const trail = part.match(/\s*$/)[0];
      result += lead + (await translate(part.slice(lead.length, part.length - trail.length), target)) + trail;
    }
    return result;
  }

  async function flush() {
    if (!dirty) return;
    const sorted = {};
    for (const key of Object.keys(cache).sort()) {
      sorted[key] = Object.fromEntries(LANGS.filter((lang) => lang in cache[key]).map((lang) => [lang, cache[key][lang]]));
    }
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
    dirty = false;
  }

  return { translate, translateMarkdown, flush };
}

/** provider 链：中文→英优先 Youdao，失败退 MyMemory；繁体只有 MyMemory */
async function translateByProviders(text, target, { fetchImpl, delayMs }) {
  const chinese = CJK_RE.test(text);
  if (target === 'en') {
    const viaYoudao = await youdaoTranslate(text, 'zh-CHS', 'en', fetchImpl, delayMs);
    if (viaYoudao !== null) return viaYoudao;
    return myMemoryTranslate(text, 'zh-CN', 'en', fetchImpl, delayMs);
  }
  if (target === 'zh-TW') {
    return myMemoryTranslate(text, chinese ? 'zh-CN' : 'en', 'zh-TW', fetchImpl, delayMs);
  }
  return null;
}
