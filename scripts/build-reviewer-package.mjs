#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { access, copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const website = 'https://lil-bobcn.github.io/feishu-ai-talent-competition/';
const repository = 'Lil-BobCN/feishu-ai-talent-competition';

function parseArgs(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error('Usage: build-reviewer-package --source-root PATH --output PATH --commit SHA --timestamp ISO');
    }
    values[key.slice(2)] = value;
  }

  for (const key of ['source-root', 'output', 'commit', 'timestamp']) {
    if (!values[key]) {
      throw new Error(`Missing required argument: --${key}`);
    }
  }

  return values;
}

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push(path.relative(root, absolute).split(path.sep).join('/'));
    }
  }

  return files.sort();
}

async function fileMetadata(root, relativePath) {
  const absolute = path.join(root, relativePath);
  const [contents, details] = await Promise.all([readFile(absolute), stat(absolute)]);
  return {
    path: relativePath,
    size: details.size,
    sha256: createHash('sha256').update(contents).digest('hex'),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = path.resolve(args['source-root']);
  const output = path.resolve(args.output);

  if (sourceRoot === output || sourceRoot.startsWith(`${output}${path.sep}`)) {
    throw new Error('Output directory must not contain the source root');
  }

  const sources = [
    '评委阅览指南.md',
    '圣农经营智能中枢_评委版母方案.pdf',
    '圣农经营智能中枢_完整方案母稿.pdf',
    path.join('docs', '圣农经营智能中枢_完整方案母稿.md'),
    'index.html',
    'shengnong-nodes',
  ];

  for (const relativePath of sources) {
    try {
      await access(path.join(sourceRoot, relativePath));
    } catch {
      throw new Error(`Missing required reviewer source: ${relativePath.split(path.sep).join('/')}`);
    }
  }

  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'demo'), { recursive: true });

  const copies = [
    ['评委阅览指南.md', '01-评委阅览指南.md'],
    ['圣农经营智能中枢_评委版母方案.pdf', '02-圣农经营智能中枢_评委版母方案.pdf'],
    ['圣农经营智能中枢_完整方案母稿.pdf', '03-圣农经营智能中枢_完整方案母稿.pdf'],
    [path.join('docs', '圣农经营智能中枢_完整方案母稿.md'), '04-圣农经营智能中枢_完整方案母稿.md'],
    ['index.html', path.join('demo', 'index.html')],
  ];

  for (const [source, destination] of copies) {
    await copyFile(path.join(sourceRoot, source), path.join(output, destination));
  }

  await cp(
    path.join(sourceRoot, 'shengnong-nodes'),
    path.join(output, 'demo', 'shengnong-nodes'),
    { recursive: true },
  );

  const startPage = `# 圣农经营智能中枢｜评委交付包

本包用于集中审阅和离线转交，请优先阅读 \`01-评委阅览指南.md\` 与 \`02-圣农经营智能中枢_评委版母方案.pdf\`。

在线演示：${website}

对应仓库版本：\`${args.commit}\`

完整性信息与文件哈希见 \`manifest.json\`。
`;
  await writeFile(path.join(output, '00-请先阅读.md'), startPage, 'utf8');

  const relativeFiles = await listFiles(output);
  const files = await Promise.all(relativeFiles.map((relativePath) => fileMetadata(output, relativePath)));
  const manifest = {
    schemaVersion: 1,
    repository,
    commit: args.commit,
    generatedAt: args.timestamp,
    website,
    files,
  };

  await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
