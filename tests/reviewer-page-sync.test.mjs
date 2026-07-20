import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pairs = [
  ['index.html', 'output/html/圣农经营智能中枢_Aily叙事副本.html'],
  ['圣农经营智能中枢_Aily叙事副本.js', 'output/html/圣农经营智能中枢_Aily叙事副本.js'],
  ['shengnong-nodes/approval-execution.js', 'output/html/shengnong-nodes/approval-execution.js'],
  ['shengnong-nodes/data-evidence.js', 'output/html/shengnong-nodes/data-evidence.js'],
  ['shengnong-nodes/narrative-core.css', 'output/html/shengnong-nodes/narrative-core.css'],
  ['shengnong-nodes/risk-review.js', 'output/html/shengnong-nodes/risk-review.js'],
];

test('main website sources and reviewer output copies stay byte-for-byte aligned', async () => {
  for (const [publishedPath, outputPath] of pairs) {
    const [published, output] = await Promise.all([
      readFile(new URL(`../${publishedPath}`, import.meta.url)),
      readFile(new URL(`../${outputPath}`, import.meta.url)),
    ]);
    assert.deepEqual(output, published, `${outputPath} must match ${publishedPath}`);
  }
});

test('main carries the latest published investigation narrative', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /调查范围随新事实推进/);
  assert.match(html, /信息要求和费用上限/);
  assert.match(html, /原因已经查清，循环立即结束/);
});
