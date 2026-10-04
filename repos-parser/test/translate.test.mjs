import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createTranslator } from '../src/lib/translate.js';

const cachePath = (name) => path.join(os.tmpdir(), `cityu-hub-translate-${process.pid}-${name}.json`);

/** 假 fetch：按 URL 片段命中对应响应，并记录请求顺序 */
function fakeFetch(routes) {
  const calls = [];
  const impl = async (url) => {
    calls.push(String(url));
    for (const [match, body] of routes) {
      if (String(url).includes(match)) return { ok: true, status: 200, json: async () => body };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  return { impl, calls };
}

test('translate：源语言槽位直接复制原文，不出网', async () => {
  const { impl, calls } = fakeFetch([]);
  const translator = await createTranslator({ cachePath: cachePath('src'), fetchImpl: impl, delayMs: 0 });
  assert.equal(await translator.translate('商业信息系统', 'zh-CN', 'zh-CN'), '商业信息系统');
  assert.equal(calls.length, 0);
});

test('translate：简中→英优先用 Youdao', async () => {
  const { impl, calls } = fakeFetch([
    ['aidemo.youdao.com', { errorCode: '0', translation: ['Business Information Systems'] }],
  ]);
  const translator = await createTranslator({ cachePath: cachePath('youdao'), fetchImpl: impl, delayMs: 0 });
  assert.equal(await translator.translate('商业信息系统', 'en', 'zh-CN'), 'Business Information Systems');
  assert.ok(calls[0].includes('aidemo.youdao.com'));
});

test('translate：非简中↔英的语向优先走 Google gtx，并拼接多段译文', async () => {
  const { impl, calls } = fakeFetch([
    ['translate.googleapis.com', [[['商業資訊系統', '商业信息系统']]]],
  ]);
  const translator = await createTranslator({ cachePath: cachePath('gtx'), fetchImpl: impl, delayMs: 0 });
  assert.equal(await translator.translate('商业信息系统', 'zh-TW', 'zh-CN'), '商業資訊系統');
  assert.ok(calls[0].includes('translate.googleapis.com'));
});

test('translate：Youdao 失败时退到 Google gtx', async () => {
  const { impl, calls } = fakeFetch([
    ['aidemo.youdao.com', { errorCode: '411' }],
    ['translate.googleapis.com', [[['Business Information Systems', '商业信息系统']]]],
  ]);
  const translator = await createTranslator({ cachePath: cachePath('fallback'), fetchImpl: impl, delayMs: 0 });
  assert.equal(await translator.translate('商业信息系统', 'en', 'zh-CN'), 'Business Information Systems');
  assert.ok(calls.some((url) => url.includes('translate.googleapis.com')));
});
