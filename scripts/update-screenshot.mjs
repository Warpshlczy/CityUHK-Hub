#!/usr/bin/env node
/**
 * 抓取首页截图写入 web/public/screenshot.png，并把截图时间与截图者写回 README 的
 * <!-- screenshot:start -->…<!-- screenshot:end --> 区块。
 *
 * 桌面视口 1440×900、2 倍密度、只截首屏；站点是纯静态页，等动画与字体就绪再拍，
 * 免得拍到淡入中的卡片。只有截图真的变了才写盘并刷新时间，否则整体跳过，
 * 避免时间戳频繁变动带来无意义的提交。
 *
 * 用法：node scripts/update-screenshot.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const SITE_URL = process.env.SITE_URL ?? 'https://cityu-hub.bond/';
const OUT_PATH = path.resolve(process.env.OUT_PATH ?? 'web/public/screenshot.png');
const README_PATH = process.env.README_PATH ?? 'README.md';
const START = '<!-- screenshot:start -->';
const END = '<!-- screenshot:end -->';
/** 截图由 CI 里的机器人完成并提交，标注固定写它 */
const CAPTURED_BY = 'github-actions[bot]';
const VIEWPORT = { width: 1440, height: 900 };
/** 2 倍密度：桌面高分屏下文字与边框不糊 */
const DEVICE_SCALE_FACTOR = 2;
/** 卡片有 stagger 淡入（最多 400ms 延迟 + 动画时长），多等一会再拍 */
const SETTLE_MS = 1500;
/** 欢迎弹窗的「不再提示」标记：全新上下文 localStorage 为空，不预置就会拍到弹窗；须与 WelcomeDialog.tsx 的 DISMISS_KEY 保持一致 */
const WELCOME_DISMISS_KEY = 'cityu-hub:welcome-dismissed';

function formatCapturedAt(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** 从 PNG 的 IHDR 块读宽高，用于日志里对比新旧尺寸 */
function pngSize(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;
}

async function readIfExists(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

/** 标记区块内容；GitHub 会剥掉 <small> 只保留 <sub>/<sup>，所以缩小字号用 <sub> */
function renderBlock(capturedAt) {
  const src = path.relative(process.cwd(), OUT_PATH).split(path.sep).join('/');
  return [
    START,
    `<img src="${src}" alt="CityUHK Hub 首页截图 / homepage screenshot" width="920" />`,
    '',
    `<sub>截图时间 / 截圖時間 / captured at: ${capturedAt} (UTC+8) · 截图者 / 截圖者 / by: @${CAPTURED_BY}</sub>`,
    '',
    '**站点一览 · Homepage at a glance**',
    END,
  ].join('\n');
}

const browser = await chromium.launch();
let shot;
try {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    // 站点按本地时区渲染相对时间，固定成北京时间让产物稳定
    timezoneId: 'Asia/Shanghai',
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  // 预置「已看过」，截到主站而非欢迎弹窗
  await context.addInitScript((key) => {
    try {
      window.localStorage.setItem(key, '1');
    } catch {
      /* 存不进去也不影响截图 */
    }
  }, WELCOME_DISMISS_KEY);

  console.log(`打开 ${SITE_URL}`);
  const response = await page.goto(SITE_URL, { waitUntil: 'load' });
  if (response && !response.ok()) {
    throw new Error(`站点返回 HTTP ${response.status()}`);
  }
  // 前端会异步向 GitHub 补语言 / stars，等网络静默；超时不算失败
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);

  shot = await page.screenshot({ type: 'png' });
} finally {
  await browser.close();
}

let previousShot = null;
try {
  previousShot = await fs.readFile(OUT_PATH);
} catch {
  previousShot = null;
}

if (previousShot && previousShot.equals(shot)) {
  console.log(`截图无变化（${pngSize(shot)}），跳过写入与标注刷新`);
  process.exit(0);
}

await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
await fs.writeFile(OUT_PATH, shot);
console.log(`已更新 ${OUT_PATH}：${previousShot ? pngSize(previousShot) : '无'} → ${pngSize(shot)}（${shot.length} 字节）`);

const capturedAt = formatCapturedAt(new Date());
const readme = await readIfExists(README_PATH);
if (readme === null) {
  console.warn(`未找到 ${README_PATH}，跳过截图标注`);
  process.exit(0);
}

const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(readme)) {
  console.warn(`${README_PATH} 里没有找到 ${START} / ${END} 标记区块，跳过截图标注`);
  process.exit(0);
}

const next = readme.replace(pattern, renderBlock(capturedAt));
if (next === readme) {
  console.log('截图标注无变化');
} else {
  await fs.writeFile(README_PATH, next, 'utf8');
  console.log(`已在 ${README_PATH} 标注：${capturedAt} (UTC+8) · @${CAPTURED_BY}`);
}
