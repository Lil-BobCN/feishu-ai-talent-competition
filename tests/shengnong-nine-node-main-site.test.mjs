import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

// 主站（2026-07-27 起）= 根 index.html（三循环新首页）+ report/ 三份循环交互报告
// + dashboard/ 飞书看板与数据与接口透视。
// LOOP01 经营事件循环为九节点轨道，延续本测试文件的 nine-node 语义。

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const homepage = await read('index.html');
const report01 = await read('report/index.html');
const report02 = await read('report/02/index.html');
const report03 = await read('report/03/index.html');
const allReports = [report01, report02, report03].join('\n');

test('homepage cover carries the approved product identity', () => {
  assert.match(homepage, /<title>圣农经营智能中枢<\/title>/);
  assert.match(homepage, /<h1 class="cover-title">圣农经营<span class="accent">智能中枢<\/span><\/h1>/);
  assert.match(homepage, /把分散的经营事实，持续转化为可追溯的经营行动/);
  assert.match(homepage, /class="brand">圣农经营智能中枢/);
});

test('homepage declares the three loops with their approved titles and sizes', () => {
  for (const token of ['lv-no">LOOP 01', 'lv-no">LOOP 02', 'lv-no">LOOP 03']) {
    assert.match(homepage, new RegExp(token));
  }
  assert.match(homepage, /lv-title">经营事件循环 · 事实 → 经营结果/);
  assert.match(homepage, /lv-title">能力进化循环 · 案件 → 可复用能力/);
  assert.match(homepage, /lv-title">业务扩域循环 · 试点经验 → 扩域建议/);
  assert.match(homepage, /lv-sub">9 个节点 · 点击看详情/);
  assert.match(homepage, /lv-sub">11 个环节 · 点击看详情/);
  assert.match(homepage, /lv-sub">5 个环节 · 点击看详情/);
});

test('LOOP01 keeps the approved nine-node operating flow in four phases', () => {
  assert.equal((homepage.match(/kicker: 'NODE \d{2} · /g) || []).length, 9);
  assert.match(homepage, /aria-label="经营事件循环九节点"/);
  for (const phase of ['阶段一 · 发现与成案', '阶段二 · 调查与补证', '阶段三 · 决策与执行', '阶段四 · 验证与沉淀']) {
    assert.match(homepage, new RegExp(phase));
  }
  const orderedTitles = [
    '候选异常识别',
    '事件解析',
    '经营事件包 v1 与原子建案',
    'Agent 选择领域 Skill',
    '按 Skill 渐进取证',
    '形成决策就绪包',
    '管理决策与责任执行',
    '按真实里程碑验证',
    '关闭、归档与交接 02',
  ];
  let cursor = -1;
  for (const title of orderedTitles) {
    const next = homepage.indexOf(`title: '${title}'`, cursor + 1);
    assert.ok(next > cursor, `${title} should appear in the LOOP01 data after the previous node`);
    cursor = next;
  }
});

test('homepage keeps the seven-section narrative order', () => {
  const sections = [
    '01 · 为什么需要',
    '02 · 三个循环（分）',
    '03 · 三个循环怎样接力（总）',
    '04 · 共同能力底座',
    '05 · 深入阅读与演示',
    '06 · 事实边界',
    '07 · 联系我们',
  ];
  let cursor = -1;
  for (const section of sections) {
    const next = homepage.indexOf(`sec-no">${section}`, cursor + 1);
    assert.ok(next > cursor, `${section} should follow the previous section`);
    cursor = next;
  }
});

test('top navigation links the three loop reports, the dashboard and its tech brief', () => {
  assert.match(homepage, /aria-label="详细方案三个循环入口"/);
  for (const href of ['href="report/"', 'href="report/02/"', 'href="report/03/"', 'href="dashboard/"', 'href="dashboard/report/"']) {
    assert.match(homepage, new RegExp(href.replace(/[/.]/g, '\\$&')));
  }
  assert.match(homepage, />详细方案</);
  assert.match(homepage, />飞书看板</);
  assert.match(homepage, />数据与接口透视</);
});

test('contact section keeps the public team profile without private channels', () => {
  assert.match(homepage, /id="contact"/);
  for (const text of ['刘清源', '南昌航空大学', '梁小清', '杜欣宇', '丁铭浩']) {
    assert.match(homepage, new RegExp(text));
  }
  assert.match(homepage, /github\.com\/Lil-BobCN\/feishu-ai-talent-competition/);
  assert.doesNotMatch(homepage, /mailto:/);
  assert.doesNotMatch(homepage, /tel:/);
});

test('published pages carry no draft labels or internal process markers', () => {
  for (const page of [homepage, allReports]) {
    assert.doesNotMatch(page, /设计稿 v5|变体 B|homepage-design-draft/);
  }
});

test('homepage is self-contained and no longer references the archived site assets', () => {
  assert.doesNotMatch(homepage, /<script[^>]+\bsrc=/);
  assert.doesNotMatch(homepage, /shengnong-nodes|sunner-logo/);
});

test('loop reports use their approved titles and relative-root home links', () => {
  assert.match(report01, /<title>圣农经营智能中枢 · 经营事件循环｜评委交互研究报告<\/title>/);
  assert.match(report02, /<title>圣农经营智能中枢 · 能力进化循环｜评委交互研究报告<\/title>/);
  assert.match(report03, /<title>圣农经营智能中枢 · 业务扩域循环｜评委交互研究报告<\/title>/);
  assert.match(report01, /<a href="\.\.\/">← 首页<\/a>/);
  assert.match(report02, /<a href="\.\.\/\.\.\/">← 首页<\/a>/);
  assert.match(report03, /<a href="\.\.\/\.\.\/">← 首页<\/a>/);
});

test('loop reports keep the honesty and fact-grading language', () => {
  for (const term of ['待企业验证', '本方案设计判断', '圣农公开事实', '试点设计稿', '非生产就绪声明']) {
    assert.match(allReports, new RegExp(term));
  }
  assert.doesNotMatch(allReports, /已接入圣农|生产已上线|当前已经全面实现/);
});

test('loop reports load their local scripts and diagram assets', async () => {
  for (const asset of [
    'report/css/style.css',
    'report/css/fonts.css',
    'report/js/main.js',
    'report/js/data.js',
    'report/assets/01_经营事件循环_总体逻辑图.svg',
    'report/assets/01_经营事件循环_持续留痕图.svg',
    'report/02/css/style.css',
    'report/02/js/main.js',
    'report/02/assets/02_能力进化循环_逻辑骨架.svg',
    'report/03/css/style.css',
    'report/03/js/main.js',
  ]) {
    await access(new URL(`../${asset}`, import.meta.url));
  }
  assert.match(report01, /src="js\/main\.js"/);
  assert.match(report01, /assets\/01_经营事件循环_总体逻辑图\.svg/);
  assert.match(report02, /assets\/02_能力进化循环_逻辑骨架\.svg/);
});

test('dashboard pages keep their identity and cross-links', async () => {
  const dashboard = await read('dashboard/index.html');
  const brief = await read('dashboard/report/index.html');
  assert.match(dashboard, /<h1>飞书看板<\/h1>/);
  assert.match(dashboard, /脱敏演示数据/);
  assert.match(dashboard, /href="report\/"/);
  assert.match(brief, /数据与接口透视/);
  assert.match(brief, /EventPackage v1/);
  assert.match(brief, /target-tenant unknown/);
});
