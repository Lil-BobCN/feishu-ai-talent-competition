import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.js', import.meta.url), 'utf8');

test('Aily 叙事包含八个业务场景', () => {
  assert.equal((html.match(/<section[^>]+data-aily-scene=/g) || []).length, 8);
  for (const id of ['intake', 'assess', 'plan', 'evidence', 'parallel', 'scope', 'gate', 'dossier']) {
    assert.match(html, new RegExp(`data-aily-scene="${id}"`));
  }
});

test('有界调查的四个出口与人工审批边界存在', () => {
  for (const text of ['停止', '扩大', '等待补证', '转人工', 'approval_required']) assert.match(html, new RegExp(text));
});

test('副本脚本激活 Aily 场景并支持减弱动效', () => {
  assert.match(js, /initAilyNarrative/);
  assert.match(html, /prefers-reduced-motion/);
});

test('八幕使用业务人员能直接理解的中文动作标题', () => {
  for (const text of [
    '接到问题',
    '先列出可能原因',
    '只查最能排除原因的一条信息',
    '把查到的证据放回问题档案',
    '系统查不到，就请责任人补充',
    '证据支持时，才扩大调查范围',
    '现在是否足够交给管理层',
    '把事实、缺口和方案交给人决定'
  ]) assert.match(html, new RegExp(text));
});

test('PRICE-0249 案例状态条贯穿整个调查叙事', () => {
  assert.match(html, /class="aily-case-thread"/);
  assert.match(html, /data-case-current/);
  assert.match(html, /门店实付 24\.9 元/);
  assert.match(html, /统一价盘 29\.9 元/);
  assert.match(js, /updateAilyCaseThread/);
});

test('点线面查询循环具有完整的连续动画阶段', () => {
  assert.match(html, /class="aily-loop-visual/);
  for (const phase of ['point', 'line', 'network', 'surface', 'gate', 'query']) {
    assert.match(html, new RegExp(`data-loop-phase="${phase}"`));
  }
  assert.match(html, /@keyframes aily-loop-cycle/);
  assert.match(html, /没有新证据，不扩大范围/);
});

test('04 节点按钮反映 Aily 页面内部阅读进度', () => {
  assert.match(js, /updateAilyNodeProgress/);
  assert.match(js, /--node-progress/);
  assert.match(js, /addEventListener\(['"]scroll['"]/);
  assert.match(html, /conic-gradient/);
});

test('场景未成为 active 时正文仍保持可读', () => {
  assert.match(html, /\.aily-reveal \{ opacity: 1; transform: none; \}/);
  assert.match(html, /\.aily-hypothesis,[\s\S]*\.aily-check \{ opacity: 1; transform: none; \}/);
});

test('查询循环从第一帧即有可见内容', () => {
  assert.match(html, /@keyframes aily-loop-cycle \{\s*0%, 15% \{ opacity: 1/);
});

test('第 02 幕说明排查顺序来自企业经验而非模型临时猜测', () => {
  assert.match(html, /公司把老员工处理同类问题的经验/);
  assert.match(html, /领域 Skill/);
  assert.match(html, /优先级最高、成本最小、最能排除原因/);
  assert.match(html, /class="aily-priority-loop/);
});

test('第 02 幕说明查询循环由证据不足被动触发', () => {
  assert.match(html, /当前范围查不清/);
  assert.match(html, /才扩大一层/);
  assert.match(html, /在新范围内重新排序/);
  assert.doesNotMatch(html, /最低优先级/);
});

test('第 03 幕状态条与队首查询保持一致', () => {
  assert.match(html, /data-case-next="执行队首查询：核对商品与规格"/);
  assert.doesNotMatch(html, /data-case-next="只查询活动绑定记录"/);
});

test('母稿中的调查资源上限、跨天续查和恢复条件进入可见叙事', () => {
  for (const text of [
    '查询次数、总时长、可用工具、证据要求和费用上限',
    '收到新信息后再按 event_id 继续',
    '何时停止、如何恢复',
    '由可复算程序测算'
  ]) assert.match(html, new RegExp(text));
});

test('Aily 移动端保留四项状态并移除详情标签', () => {
  assert.doesNotMatch(html, /\.aily-case-field\.case-confirmed,[\s\S]{0,100}display:\s*none/);
  assert.doesNotMatch(html, /\.aily-case-field\.case-unknown\s*\{\s*display:\s*none/);
  assert.doesNotMatch(html, /data-node-tab=/);
});
