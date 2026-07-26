import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const builder = path.join(repoRoot, 'scripts', 'build-reviewer-package.mjs');
const commit = '0123456789abcdef0123456789abcdef01234567';
const timestamp = '2026-07-26T00:00:00.000Z';

const RESEARCH_FILES = [
  'README.md',
  'RULES.md',
  'SCORING.md',
  'TOP-CANDIDATES.md',
  '108-CHALLENGE-MAP.md',
  'FEISHU-AGENT-INTEGRATION.md',
  '108-challenge-map.csv',
  'data/official-challenges.json',
  'data/challenge-screening-draft.json',
];

async function createFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'reviewer-release-'));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');

  await mkdir(path.join(source, 'docs', '评委材料'), { recursive: true });
  await mkdir(path.join(source, 'docs', 'superpowers'), { recursive: true });
  await mkdir(path.join(source, 'output', '方案图_2026-07-23'), { recursive: true });
  await mkdir(path.join(source, 'report', '02'), { recursive: true });
  await mkdir(path.join(source, 'report', '03'), { recursive: true });
  await mkdir(path.join(source, 'dashboard', 'report'), { recursive: true });
  await mkdir(path.join(source, 'research', 'data'), { recursive: true });
  await mkdir(path.join(source, 'tests'), { recursive: true });

  await writeFile(path.join(source, 'README.md'), '# Repository\n');
  await writeFile(path.join(source, '评委阅览指南.md'), '# Guide\n[详细版](docs/评委阅览指南.md)\n[总览](docs/评委材料/00_方案薄总览.md)\n');
  await writeFile(path.join(source, 'docs', '评委阅览指南.md'), '# Detailed guide\n[01](评委材料/01_经营事件循环_评委文案.md)\n');
  await writeFile(path.join(source, 'docs', '评委材料', '00_方案薄总览.md'), '# 总览\n[01](./01_经营事件循环_评委文案.md)\n[图](output/方案图_2026-07-23/README.md)\n');
  await writeFile(
    path.join(source, 'docs', '评委材料', '01_经营事件循环_评委文案.md'),
    '# 01\n![图](../../output/方案图_2026-07-23/01_x.png)\n[索引](./80_证据与参考资料索引.md)\n[赛题](../../research/data/official-challenges.json)\n',
  );
  await writeFile(path.join(source, 'docs', '评委材料', '02_能力进化循环_评委文案.md'), '# 02\n[01](./01_经营事件循环_评委文案.md#anchor)\n');
  await writeFile(path.join(source, 'docs', '评委材料', '03_业务扩域循环_评委薄稿.md'), '# 03\n');
  await writeFile(path.join(source, 'docs', '评委材料', '80_证据与参考资料索引.md'), '# 80\n[01](./01_经营事件循环_评委文案.md)\n');
  await writeFile(path.join(source, 'output', '方案图_2026-07-23', 'README.md'), '# 方案图\n[01](../../docs/评委材料/01_经营事件循环_评委文案.md)\n');
  await writeFile(path.join(source, 'output', '方案图_2026-07-23', '01_x.png'), 'png');
  for (const name of RESEARCH_FILES) {
    await writeFile(path.join(source, 'research', name), `${name}\n`);
  }
  await writeFile(path.join(source, 'index.html'), '<!doctype html><title>Demo</title>');
  await writeFile(path.join(source, 'report', 'index.html'), '<!doctype html><title>01 经营事件循环</title>');
  await writeFile(path.join(source, 'report', '02', 'index.html'), '<!doctype html><title>02 能力进化循环</title>');
  await writeFile(path.join(source, 'report', '03', 'index.html'), '<!doctype html><title>03 业务扩域循环</title>');
  await writeFile(path.join(source, 'dashboard', 'index.html'), '<!doctype html><title>看板</title>');
  await writeFile(path.join(source, 'dashboard', 'report', 'index.html'), '<!doctype html><title>透视</title>');
  await writeFile(path.join(source, 'docs', 'superpowers', 'internal.md'), 'internal');
  await writeFile(path.join(source, 'tests', 'internal.test.mjs'), 'internal');

  t.after(() => rm(root, { recursive: true, force: true }));
  return { source, output };
}

function runBuilder(source, output) {
  return spawnSync(process.execPath, [
    builder,
    '--source-root', source,
    '--output', output,
    '--commit', commit,
    '--timestamp', timestamp,
  ], { encoding: 'utf8' });
}

test('builds a complete reviewer-only package with a traceable manifest', async (t) => {
  const { source, output } = await createFixture(t);
  const result = runBuilder(source, output);

  assert.equal(result.status, 0, result.stderr);

  const expected = [
    '00-请先阅读.md',
    '01-评委阅览指南.md',
    '01a-评委阅览指南_详细版.md',
    '02-方案薄总览.md',
    '03-经营事件循环_评委文案.md',
    '04-能力进化循环_评委文案.md',
    '05-业务扩域循环_评委薄稿.md',
    '06-证据与参考资料索引.md',
    '07-方案图/README.md',
    '07-方案图/01_x.png',
    '08-选题研究/README.md',
    '08-选题研究/data/official-challenges.json',
    'demo/index.html',
    'demo/report/index.html',
    'demo/report/02/index.html',
    'demo/report/03/index.html',
    'demo/dashboard/index.html',
    'demo/dashboard/report/index.html',
    'manifest.json',
  ];

  for (const relativePath of expected) {
    await access(path.join(output, relativePath));
  }

  await assert.rejects(access(path.join(output, 'docs', 'superpowers', 'internal.md')));
  await assert.rejects(access(path.join(output, 'tests', 'internal.test.mjs')));

  const start = await readFile(path.join(output, '00-请先阅读.md'), 'utf8');
  assert.match(start, /https:\/\/lil-bobcn\.github\.io\/feishu-ai-talent-competition\//);
  assert.match(start, new RegExp(commit));
  assert.match(start, /2026 年 7 月 17 日/);

  const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.commit, commit);
  assert.equal(manifest.generatedAt, timestamp);
  assert.equal(manifest.website, 'https://lil-bobcn.github.io/feishu-ai-talent-competition/');
  assert.deepEqual(manifest.files.map((file) => file.path), manifest.files.map((file) => file.path).toSorted());
  assert.ok(manifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
});

test('rewrites repository-relative links to packaged paths', async (t) => {
  const { source, output } = await createFixture(t);
  const result = runBuilder(source, output);
  assert.equal(result.status, 0, result.stderr);

  const narrative = await readFile(path.join(output, '03-经营事件循环_评委文案.md'), 'utf8');
  assert.match(narrative, /07-方案图\/01_x\.png/);
  assert.match(narrative, /06-证据与参考资料索引\.md/);
  assert.match(narrative, /08-选题研究\/data\/official-challenges\.json/);
  assert.doesNotMatch(narrative, /\.\.\/\.\.\/output/);
  assert.doesNotMatch(narrative, /\.\.\/\.\.\/research/);

  const evolution = await readFile(path.join(output, '04-能力进化循环_评委文案.md'), 'utf8');
  assert.match(evolution, /03-经营事件循环_评委文案\.md#anchor/);

  const overview = await readFile(path.join(output, '02-方案薄总览.md'), 'utf8');
  assert.match(overview, /03-经营事件循环_评委文案\.md/);
  assert.match(overview, /07-方案图\/README\.md/);

  const guide = await readFile(path.join(output, '01-评委阅览指南.md'), 'utf8');
  assert.match(guide, /01a-评委阅览指南_详细版\.md/);
  assert.match(guide, /02-方案薄总览\.md/);

  const diagramReadme = await readFile(path.join(output, '07-方案图', 'README.md'), 'utf8');
  assert.match(diagramReadme, /03-经营事件循环_评委文案\.md/);
  assert.doesNotMatch(diagramReadme, /docs\/评委材料/);

  const packagedMarkdown = [
    '01-评委阅览指南.md',
    '01a-评委阅览指南_详细版.md',
    '02-方案薄总览.md',
    '03-经营事件循环_评委文案.md',
    '04-能力进化循环_评委文案.md',
    '05-业务扩域循环_评委薄稿.md',
    '06-证据与参考资料索引.md',
    '07-方案图/README.md',
  ];
  for (const file of packagedMarkdown) {
    const content = await readFile(path.join(output, file), 'utf8');
    assert.doesNotMatch(content, /\]\(\.+\//, `${file} must not keep relative parent links`);
  }
});

test('fails without publishing a partial package when a required source is missing', async (t) => {
  const { source, output } = await createFixture(t);
  await unlink(path.join(source, 'docs', '评委材料', '00_方案薄总览.md'));

  const result = runBuilder(source, output);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing required reviewer source: docs\/评委材料\/00_方案薄总览\.md/);
  await assert.rejects(access(output));
});
