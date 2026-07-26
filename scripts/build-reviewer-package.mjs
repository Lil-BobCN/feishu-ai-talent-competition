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

// 仓库内相对链接 → 交付包内重排后的路径。
// 采用子串替换，同时覆盖 ./、../、../../、docs/ 等各种相对前缀写法；
// 顺序保证更长、更具体的模式先替换。
const PACKAGE_PATH_REWRITES = [
  ['output/方案图_2026-07-23/', '07-方案图/'],
  ['docs/评委阅览指南.md', '01a-评委阅览指南_详细版.md'],
  // 先剥掉指向评委材料目录的各种相对前缀，再由下面的文件名规则改到包内新名。
  ['../../docs/评委材料/', ''],
  ['docs/评委材料/', ''],
  ['评委材料/', ''],
  ['00_方案薄总览.md', '02-方案薄总览.md'],
  ['01_经营事件循环_评委文案.md', '03-经营事件循环_评委文案.md'],
  ['02_能力进化循环_评委文案.md', '04-能力进化循环_评委文案.md'],
  ['03_业务扩域循环_评委薄稿.md', '05-业务扩域循环_评委薄稿.md'],
  ['80_证据与参考资料索引.md', '06-证据与参考资料索引.md'],
  ['research/README.md', '08-选题研究/README.md'],
  ['research/RULES.md', '08-选题研究/RULES.md'],
  ['research/SCORING.md', '08-选题研究/SCORING.md'],
  ['research/TOP-CANDIDATES.md', '08-选题研究/TOP-CANDIDATES.md'],
  ['research/108-CHALLENGE-MAP.md', '08-选题研究/108-CHALLENGE-MAP.md'],
  ['research/FEISHU-AGENT-INTEGRATION.md', '08-选题研究/FEISHU-AGENT-INTEGRATION.md'],
  ['research/data/official-challenges.json', '08-选题研究/data/official-challenges.json'],
  ['research/data/challenge-screening-draft.json', '08-选题研究/data/challenge-screening-draft.json'],
];

function rewritePackageLinks(markdown) {
  let result = markdown;
  for (const [from, to] of PACKAGE_PATH_REWRITES) {
    result = result.split(from).join(to);
  }
  // 包内文件全部平铺在根目录（07-方案图/ 与 08-选题研究/ 为一级子目录），
  // 改写后剥掉链接路径开头残留的 ../ 或 ./ 上跳前缀。
  return result.replace(/(\]\()\s*(?:\.\.?\/)+\s*(?=(?:0[0-9][a-z]?-|demo\/))/g, '$1');
}

async function copyMarkdownWithRewrite(sourceRoot, outputRoot, source, destination) {
  const markdown = await readFile(path.join(sourceRoot, source), 'utf8');
  await writeFile(path.join(outputRoot, destination), rewritePackageLinks(markdown), 'utf8');
}

const RESEARCH_FILES = [
  'README.md',
  'RULES.md',
  'SCORING.md',
  'TOP-CANDIDATES.md',
  '108-CHALLENGE-MAP.md',
  'FEISHU-AGENT-INTEGRATION.md',
  '108-challenge-map.csv',
  path.join('data', 'official-challenges.json'),
  path.join('data', 'challenge-screening-draft.json'),
];

const JUDGE_MATERIAL_COPIES = [
  ['评委阅览指南.md', '01-评委阅览指南.md'],
  [path.join('docs', '评委阅览指南.md'), '01a-评委阅览指南_详细版.md'],
  [path.join('docs', '评委材料', '00_方案薄总览.md'), '02-方案薄总览.md'],
  [path.join('docs', '评委材料', '01_经营事件循环_评委文案.md'), '03-经营事件循环_评委文案.md'],
  [path.join('docs', '评委材料', '02_能力进化循环_评委文案.md'), '04-能力进化循环_评委文案.md'],
  [path.join('docs', '评委材料', '03_业务扩域循环_评委薄稿.md'), '05-业务扩域循环_评委薄稿.md'],
  [path.join('docs', '评委材料', '80_证据与参考资料索引.md'), '06-证据与参考资料索引.md'],
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = path.resolve(args['source-root']);
  const output = path.resolve(args.output);

  if (sourceRoot === output || sourceRoot.startsWith(`${output}${path.sep}`)) {
    throw new Error('Output directory must not contain the source root');
  }

  const sources = [
    ...JUDGE_MATERIAL_COPIES.map(([source]) => source),
    ...RESEARCH_FILES.map((name) => path.join('research', name)),
    path.join('output', '方案图_2026-07-23'),
    'index.html',
    '圣农经营智能中枢_Aily叙事副本.js',
    'shengnong-nodes',
    path.join('output', 'html', '圣农经营智能中枢_飞书经营看板.html'),
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
  await mkdir(path.join(output, '08-选题研究', 'data'), { recursive: true });

  for (const [source, destination] of JUDGE_MATERIAL_COPIES) {
    await copyMarkdownWithRewrite(sourceRoot, output, source, destination);
  }

  await cp(
    path.join(sourceRoot, 'output', '方案图_2026-07-23'),
    path.join(output, '07-方案图'),
    { recursive: true },
  );

  // 方案图目录内的 README.md 同样包含仓库相对链接，打包时一并改写。
  const diagramReadmePath = path.join(output, '07-方案图', 'README.md');
  await writeFile(diagramReadmePath, rewritePackageLinks(await readFile(diagramReadmePath, 'utf8')), 'utf8');

  for (const name of RESEARCH_FILES) {
    await copyFile(
      path.join(sourceRoot, 'research', name),
      path.join(output, '08-选题研究', name),
    );
  }

  const demoCopies = [
    ['index.html', 'index.html'],
    ['圣农经营智能中枢_Aily叙事副本.js', '圣农经营智能中枢_Aily叙事副本.js'],
    [path.join('output', 'html', '圣农经营智能中枢_飞书经营看板.html'), '圣农经营智能中枢_飞书经营看板.html'],
  ];

  for (const [source, destination] of demoCopies) {
    await copyFile(path.join(sourceRoot, source), path.join(output, 'demo', destination));
  }

  await cp(
    path.join(sourceRoot, 'shengnong-nodes'),
    path.join(output, 'demo', 'shengnong-nodes'),
    { recursive: true },
  );

  const startPage = `# 圣农经营智能中枢｜评委交付包

本包用于集中审阅和离线转交，请优先阅读 \`01-评委阅览指南.md\`，按其顺序从 \`02-方案薄总览.md\` 开始。

## 包内结构

- \`01-评委阅览指南.md\` / \`01a-评委阅览指南_详细版.md\`：阅读路径与资料清单
- \`02-方案薄总览.md\`：全局地图（约 10 分钟）
- \`03-经营事件循环_评委文案.md\`：让一次经营异常真正走到结果
- \`04-能力进化循环_评委文案.md\`：让一次案件留下下一次能力
- \`05-业务扩域循环_评委薄稿.md\`：试点之后，与企业共同决定下一步
- \`06-证据与参考资料索引.md\`：每条主张的事实状态与来源边界
- \`07-方案图/\`：五张正式方案图（PNG/SVG）
- \`08-选题研究/\`：赛事规则、108 项挑战适配、候选方向、评分与飞书集成研究
- \`demo/\`：在线演示离线副本与经营事件协作台（脱敏演示数据）

## 更新说明

本项目于 2026 年 7 月 17 日接到学校赛事通知后启动，并持续更新维护；在线演示的交互展示与补充说明会通过同一链接不断更新，欢迎评委关注网站最新内容，正式评审材料以最新 Release 评委交付包为准。

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
