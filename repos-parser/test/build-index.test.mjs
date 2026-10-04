import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildIndex } from '../src/build-index.mjs';
import { shiftDate } from '../src/lib/starHistory.js';

// 测试一律不联网：翻译走离线路径，并指向临时缓存（不读仓库里已提交的真实缓存）
process.env.TRANSLATION_OFFLINE = '1';
process.env.TRANSLATION_CACHE_PATH = path.join(os.tmpdir(), `cityu-hub-test-cache-${process.pid}.json`);

test('buildIndex 把项目 Markdown 构建成前端直接可读的静态 JSON', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cityu-hub-build-'));
  const inputDir = path.join(root, 'repos');
  const outputDir = path.join(root, 'output');
  await fs.mkdir(inputDir);
  await fs.writeFile(
    path.join(inputDir, 'demo.md'),
    [
      '---',
      'id: demo-project',
      'title: Demo Project',
      'author: demo-owner',
      'authorName: Demo Student',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/demo-project',
      'tags: [react, showcase]',
      'category: web',
      'featured: true',
      '---',
      '',
      '# Demo Project',
      '',
      '一个用于展示学生作品的示例项目，支持在线浏览项目介绍和文档内容。',
      '',
      '## Features',
      '',
      '- README 驱动',
    ].join('\n'),
    'utf8',
  );

  try {
    const result = await buildIndex({ inputDir, outputPath: outputDir, useOffline: true });
    assert.equal(result.projects.length, 1);

    const project = result.projects[0];
    assert.equal(project.id, 'demo-project');
    assert.equal(project.name, 'Demo Project');
    assert.equal(project.author, 'demo-owner');
    assert.equal(project.authorName, 'Demo Student');
    assert.equal(project.major, 'Computer Science');
    assert.equal(project.enrollmentYear, 2024);
    assert.equal(project.repo, 'demo-owner/demo-project');
    assert.equal(project.githubUrl, 'https://github.com/demo-owner/demo-project');
    assert.equal(project.demoUrl, null);
    // 离线构建拿不到 Release 信息，降级为 false
    assert.equal(project.hasRelease, false);
    assert.equal(project.language, '');
    assert.equal(project.stars, 0);
    // 离线构建拿不到 GitHub 时间戳，回退到文档自身的修改时间
    assert.match(project.createdAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(project.updatedAt, project.createdAt);
    assert.match(project.description, /示例项目/);
    assert.match(project.readmeHtml, /README 驱动/);
    assert.match(project.readmeHtml, /<h2>Features<\/h2>/);
    // 三语字段：zh-CN 恒为原文；离线无缓存时 en/zh-TW 回退原文而非报错
    assert.equal(project.i18n['zh-CN'].name, 'Demo Project');
    assert.equal(project.i18n.en.name, 'Demo Project');
    assert.equal(project.i18n['zh-TW'].major, 'Computer Science');
    // category 复用 categoryLabels，zh-CN 恒为 canonical 原文
    assert.equal(project.i18n['zh-CN'].category, 'web');
    assert.equal(project.i18n.en.category, 'web');
    assert.equal(project.readmeHtmlByLang['zh-CN'], project.readmeHtml);
    assert.match(project.readmeHtmlByLang.en, /README 驱动/);
    assert.deepEqual(result.aggregates.tags, [
      { name: 'react', count: 1 },
      { name: 'showcase', count: 1 },
    ]);

    const list = JSON.parse(await fs.readFile(path.join(outputDir, 'projects.json'), 'utf8'));
    assert.equal(list.total, 1);
    assert.equal(list.projects.length, 1);
    assert.deepEqual(list.authors, [{ name: 'demo-owner', count: 1 }]);
    assert.deepEqual(list.categories, [{ name: 'web', count: 1 }]);
    assert.equal(list.categoryLabels['zh-CN'].web, 'web');
    // 列表保持轻量：正文 HTML 与内部字段只出现在详情文件里
    assert.equal(list.projects[0].readmeHtml, undefined);
    assert.equal(list.projects[0].readmeHtmlByLang, undefined);
    assert.equal(list.projects[0].status, undefined);

    const detail = JSON.parse(
      await fs.readFile(path.join(outputDir, 'projects', 'demo-project.json'), 'utf8'),
    );
    assert.match(detail.readmeHtml, /README 驱动/);
    assert.match(detail.readmeHtmlByLang['zh-TW'], /README 驱动/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('buildIndex 按 front matter 的 language 决定源语言槽位', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cityu-hub-lang-'));
  const inputDir = path.join(root, 'repos');
  const outputDir = path.join(root, 'output');
  await fs.mkdir(inputDir);
  // 英文母语仓库：en 槽位应是原文，另两语在离线无缓存时回退原文
  await fs.writeFile(
    path.join(inputDir, 'english.md'),
    [
      '---',
      'id: english-project',
      'title: English Project',
      'author: demo-owner',
      'authorName: Demo Owner',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/english-project',
      'category: web',
      'language: en',
      '---',
      '',
      '# English Project',
      '',
      'A short introduction written in English for the demo project.',
    ].join('\n'),
    'utf8',
  );

  try {
    const result = await buildIndex({ inputDir, outputPath: outputDir, useOffline: true });
    const project = result.projects[0];
    assert.equal(project.i18n.en.major, 'Computer Science');
    assert.equal(project.i18n.en.name, 'English Project');
    assert.match(project.i18n.en.description, /written in English/);
    // 源语言槽位的正文 HTML 直接复用原文渲染结果
    assert.equal(project.readmeHtmlByLang.en, project.readmeHtml);
    assert.match(project.readmeHtml, /written in English/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('buildIndex 不补齐 Features：留空或不写都不展示，也不使用仓库简介', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cityu-hub-features-'));
  const inputDir = path.join(root, 'repos');
  const outputDir = path.join(root, 'output');
  await fs.mkdir(inputDir);
  await fs.writeFile(
    path.join(inputDir, 'empty-features.md'),
    [
      '---',
      'id: empty-features',
      'title: Empty Features',
      'author: demo-owner',
      'authorName: Demo Owner',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/empty-features',
      'category: other',
      'featured: false',
      '---',
      '',
      '## Features',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    path.join(inputDir, 'no-features.md'),
    [
      '---',
      'id: no-features',
      'title: No Features',
      'author: demo-owner',
      'authorName: Demo Owner',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/no-features',
      'category: other',
      'featured: false',
      '---',
      '',
      '只写了项目介绍，没有写 Features 段落。',
    ].join('\n'),
    'utf8',
  );

  try {
    const result = await buildIndex({
      inputDir,
      outputPath: outputDir,
      githubClient: {
        fetchRepoMeta: async () => ({
          repo: 'demo-project',
          owner: 'demo-owner',
          description: '来自 GitHub 的仓库简介。',
          defaultBranch: 'main',
        }),
        fetchReadme: async () => '# Remote Project\n\n来自 GitHub README 的项目介绍。',
        fetchHasRelease: async () => false,
      },
    });

    const withEmptyFeatures = result.projects.find((p) => p.id === 'empty-features');
    assert.match(withEmptyFeatures.readmeHtml, /来自 GitHub README 的项目介绍/);
    assert.doesNotMatch(withEmptyFeatures.readmeHtml, /来自 GitHub 的仓库简介/);
    assert.doesNotMatch(withEmptyFeatures.readmeHtml, /Features/);

    const withoutFeatures = result.projects.find((p) => p.id === 'no-features');
    assert.match(withoutFeatures.readmeHtml, /没有写 Features 段落/);
    assert.doesNotMatch(withoutFeatures.readmeHtml, /<h2[^>]*>Features<\/h2>/);
    assert.doesNotMatch(withoutFeatures.readmeHtml, /来自 GitHub 的仓库简介/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('buildIndex 用自建 star 快照算近 7 天涨星，历史不足时留空', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cityu-hub-stars-'));
  const inputDir = path.join(root, 'repos');
  const outputDir = path.join(root, 'output');
  const historyPath = path.join(root, 'star-history.json');
  const repo = 'demo-owner/demo-project';
  await fs.mkdir(inputDir);
  await fs.writeFile(
    path.join(inputDir, 'demo.md'),
    [
      '---',
      'id: demo-project',
      'title: Demo Project',
      'author: demo-owner',
      'authorName: Demo Student',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/demo-project',
      'category: web',
      '---',
      '',
      '演示用的项目介绍。',
    ].join('\n'),
    'utf8',
  );

  const githubClient = {
    fetchRepoMeta: async () => ({ repo: 'demo-project', owner: 'demo-owner', stars: 28, forks: 3 }),
    fetchReadme: async () => '',
    fetchHasRelease: async () => false,
  };
  const today = new Date().toISOString().slice(0, 10);
  const writeHistory = (daysAgo, stars) =>
    fs.writeFile(
      historyPath,
      JSON.stringify({ version: 1, snapshots: [{ date: shiftDate(today, -daysAgo), stars: { [repo]: stars } }] }),
      'utf8',
    );

  const previousPath = process.env.STAR_HISTORY_PATH;
  try {
    process.env.STAR_HISTORY_PATH = historyPath;

    await writeHistory(8, 20);
    const withBaseline = await buildIndex({ inputDir, outputPath: outputDir, githubClient });
    assert.equal(withBaseline.projects[0].starsGained7d, 8);

    await writeHistory(3, 27);
    const tooShort = await buildIndex({ inputDir, outputPath: outputDir, githubClient });
    assert.equal(tooShort.projects[0].starsGained7d, null);
  } finally {
    if (previousPath === undefined) delete process.env.STAR_HISTORY_PATH;
    else process.env.STAR_HISTORY_PATH = previousPath;
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('buildIndex 采集 Release 标记，取不到时降级为 false', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cityu-hub-release-'));
  const inputDir = path.join(root, 'repos');
  const outputDir = path.join(root, 'output');
  await fs.mkdir(inputDir);
  await fs.writeFile(
    path.join(inputDir, 'demo.md'),
    [
      '---',
      'id: demo-project',
      'title: Demo Project',
      'author: demo-owner',
      'authorName: Demo Owner',
      'major: Computer Science',
      'enrollmentYear: 2024',
      'repoUrl: https://github.com/demo-owner/demo-project',
      'category: web',
      'featured: false',
      '---',
      '',
      '演示用的项目介绍。',
    ].join('\n'),
    'utf8',
  );

  const meta = async () => ({
    repo: 'demo-project',
    owner: 'demo-owner',
    pushedAt: '2026-09-27T10:20:30Z',
  });
  try {
    const withRelease = await buildIndex({
      inputDir,
      outputPath: outputDir,
      githubClient: {
        fetchRepoMeta: meta,
        fetchReadme: async () => '',
        fetchHasRelease: async () => true,
      },
    });
    assert.equal(withRelease.projects[0].hasRelease, true);
    // 最近更新要保留完整时分秒，截到日期会让新项目显示成「昨天」
    assert.equal(withRelease.projects[0].updatedAt, '2026-09-27T10:20:30Z');

    // 采集失败（限流 / 网络问题）不阻断构建，按没有 Release 处理
    const failed = await buildIndex({
      inputDir,
      outputPath: outputDir,
      githubClient: {
        fetchRepoMeta: meta,
        fetchReadme: async () => '',
        fetchHasRelease: async () => {
          throw new Error('rate limited');
        },
      },
    });
    assert.equal(failed.projects[0].hasRelease, false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
