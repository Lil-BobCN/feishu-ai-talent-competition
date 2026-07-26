import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 发布结构（2026-07-27 起）：根 index.html 为三循环新首页，report/ 为三份循环交互报告，
// dashboard/ 为飞书经营看板与数据与接口透视。
// output/html/ 保留 dashboard 页面的交付镜像，以及已归档的九节点主站副本（评委包历史演示）。

const read = (path) => readFile(new URL(`../${path}`, import.meta.url));

test('dashboard pages stay byte-for-byte aligned with their delivery mirrors', async () => {
  const pairs = [
    ['dashboard/index.html', 'output/html/圣农经营智能中枢_飞书经营看板.html'],
    ['dashboard/report/index.html', 'output/html/圣农经营智能中枢_飞书看板_数据与接口透视.html'],
  ];
  for (const [publishedPath, outputPath] of pairs) {
    const [published, output] = await Promise.all([read(publishedPath), read(outputPath)]);
    assert.deepEqual(output, published, `${outputPath} must match ${publishedPath}`);
  }
});

test('archived nine-node demo assets stay aligned with their output mirrors', async () => {
  const pairs = [
    ['圣农经营智能中枢_Aily叙事副本.js', 'output/html/圣农经营智能中枢_Aily叙事副本.js'],
    ['shengnong-nodes/approval-execution.js', 'output/html/shengnong-nodes/approval-execution.js'],
    ['shengnong-nodes/data-evidence.js', 'output/html/shengnong-nodes/data-evidence.js'],
    ['shengnong-nodes/narrative-core.css', 'output/html/shengnong-nodes/narrative-core.css'],
    ['shengnong-nodes/risk-review.js', 'output/html/shengnong-nodes/risk-review.js'],
  ];
  for (const [publishedPath, outputPath] of pairs) {
    const [published, output] = await Promise.all([read(publishedPath), read(outputPath)]);
    assert.deepEqual(output, published, `${outputPath} must match ${publishedPath}`);
  }
});

test('root index.html is the new three-loop homepage, not the archived nine-node copy', async () => {
  const [homepage, archived] = await Promise.all([
    read('index.html'),
    read('output/html/圣农经营智能中枢_Aily叙事副本.html'),
  ]);
  assert.notDeepEqual(homepage, archived);
  assert.match(homepage.toString(), /<title>圣农经营智能中枢<\/title>/);
  assert.match(homepage.toString(), /data-lv="1"/);
  assert.doesNotMatch(homepage.toString(), /hash-route-node/);
});
