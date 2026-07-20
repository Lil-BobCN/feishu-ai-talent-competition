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
const timestamp = '2026-07-21T00:00:00.000Z';

async function createFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'reviewer-release-'));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');

  await mkdir(path.join(source, 'docs', 'superpowers'), { recursive: true });
  await mkdir(path.join(source, 'shengnong-nodes'), { recursive: true });
  await mkdir(path.join(source, 'tests'), { recursive: true });

  await writeFile(path.join(source, 'README.md'), '# Repository\n');
  await writeFile(path.join(source, '评委阅览指南.md'), '# Guide\n');
  await writeFile(path.join(source, '圣农经营智能中枢_评委版母方案.pdf'), 'judge-pdf');
  await writeFile(path.join(source, '圣农经营智能中枢_完整方案母稿.pdf'), 'full-pdf');
  await writeFile(path.join(source, 'docs', '圣农经营智能中枢_完整方案母稿.md'), '# Full plan\n');
  await writeFile(path.join(source, 'index.html'), '<!doctype html><title>Demo</title>');
  await writeFile(path.join(source, '圣农经营智能中枢_Aily叙事副本.js'), 'console.log("narrative");\n');
  await writeFile(path.join(source, 'shengnong-nodes', 'app.js'), 'console.log("demo");\n');
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
    '02-圣农经营智能中枢_评委版母方案.pdf',
    '03-圣农经营智能中枢_完整方案母稿.pdf',
    '04-圣农经营智能中枢_完整方案母稿.md',
    'demo/index.html',
    'demo/圣农经营智能中枢_Aily叙事副本.js',
    'demo/shengnong-nodes/app.js',
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

  const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.commit, commit);
  assert.equal(manifest.generatedAt, timestamp);
  assert.equal(manifest.website, 'https://lil-bobcn.github.io/feishu-ai-talent-competition/');
  assert.deepEqual(manifest.files.map((file) => file.path), manifest.files.map((file) => file.path).toSorted());
  assert.ok(manifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
});

test('fails without publishing a partial package when a required source is missing', async (t) => {
  const { source, output } = await createFixture(t);
  await unlink(path.join(source, '圣农经营智能中枢_评委版母方案.pdf'));

  const result = runBuilder(source, output);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing required reviewer source: 圣农经营智能中枢_评委版母方案\.pdf/);
  await assert.rejects(access(output));
});
