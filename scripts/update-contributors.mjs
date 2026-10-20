#!/usr/bin/env node
/**
 * 刷新 README 里的贡献者头像墙，写入 <!-- contributors:start -->…<!-- contributors:end --> 区块。
 * 数据来自 GitHub contributors API（按提交次数排序），只渲染头像、不显示提交次数，过滤 xxx[bot]。
 *
 * 居中踩过的坑：GitHub 的 markdown 样式是 `table{display:block;width:max-content;…}` 且会剥掉
 * 内联 style，width="100%" 无效；用固定像素占位撑满整行也不行——内容一超列宽就被 overflow
 * 裁在右侧，头像整体偏右且窗口越窄偏得越多。改用完全自适应：给 <table> 加 align="center"
 * （GitHub 保留该属性，等价 margin auto），按内容宽收缩后居中；头像间用可断行间隙，放不下
 * 自动换行，每行再靠单元格 align="center" 居中。
 *
 * 用法：node scripts/update-contributors.mjs
 */
import fs from 'node:fs/promises';

const REPO = process.env.GITHUB_REPOSITORY ?? 'Warpshlczy/CityUHK-Hub';
const README_PATH = process.env.README_PATH ?? 'README.md';
const START = '<!-- contributors:start -->';
const END = '<!-- contributors:end -->';
const PER_PAGE = 100;
/** 展示尺寸 / 取图尺寸（取图放大，高分屏不糊）；显式写上 width × height，1:1 不会被拉变形 */
const AVATAR_WIDTH = 80;
const AVATAR_HEIGHT = 80;
const AVATAR_FILE_SIZE = 200;
/** 头像之间的间隙：&nbsp; 撑开约 9px，其后的空格提供换行机会，便于自动换行 */
const AVATAR_GAP_HTML = '&nbsp; ';
const THANKS_LINE = '✨Thank you all for your contributions to this repository✨';

const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? '';

async function fetchContributors() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contributors?per_page=${PER_PAGE}&anon=0`,
    {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'cityu-hub-contributors',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

  const list = await res.json();
  if (!Array.isArray(list)) throw new Error('GitHub API 返回了非预期的数据结构');

  return list.filter(
    (item) => item?.login && item.type !== 'Bot' && !item.login.endsWith('[bot]'),
  );
}

function avatarUrl(item, size = AVATAR_FILE_SIZE) {
  const url = item.avatar_url ?? `https://github.com/${item.login}.png`;
  return `${url}${url.includes('?') ? '&' : '?'}s=${size}`;
}

function renderAvatars(contributors) {
  if (contributors.length === 0) return '&nbsp;';
  return contributors
    .map(
      (item) =>
        `<a href="${item.html_url}" title="${item.login}">` +
        `<img src="${avatarUrl(item)}" width="${AVATAR_WIDTH}" height="${AVATAR_HEIGHT}" alt="${item.login}" /></a>`,
    )
    .join(AVATAR_GAP_HTML);
}

function renderPanel(contributors) {
  return [
    '<table border="1" cellspacing="0" cellpadding="14" align="center">',
    `<tr><td align="center">${renderAvatars(contributors)}</td></tr>`,
    '</table>',
    THANKS_LINE,
  ].join('\n');
}

const readme = await fs.readFile(README_PATH, 'utf8');
// 只替换 start / end 之间的内容，标记本身原样保留。\n
// （若把标记一起吃掉再补写，一旦不匹配就会越滚越多份，之前正是这么踩的坑。）
const pattern = new RegExp(`(${START})([\\s\\S]*?)(${END})`, 'g');
const blocks = readme.match(pattern) ?? [];
if (blocks.length === 0) {
  throw new Error(`${README_PATH} 里没有找到 ${START} / ${END} 标记区块`);
}

const contributors = await fetchContributors();
const next = readme.replace(pattern, `$1\n${renderPanel(contributors)}\n$3`);

if (next === readme) {
  console.log(`贡献者头像墙无变化（${contributors.length} 位）`);
} else {
  await fs.writeFile(README_PATH, next, 'utf8');
  console.log(`已更新 ${blocks.length} 处贡献者头像墙，共 ${contributors.length} 位贡献者`);
}
