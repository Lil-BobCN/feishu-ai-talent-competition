import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../output/html/', import.meta.url);
const html = await readFile(new URL('圣农经营智能中枢_Aily叙事副本.html', root), 'utf8');
const js = await readFile(new URL('圣农经营智能中枢_Aily叙事副本.js', root), 'utf8');
const fragments = await Promise.all([
  'shengnong-nodes/data-evidence.js',
  'shengnong-nodes/approval-execution.js',
  'shengnong-nodes/risk-review.js'
].map(path => readFile(new URL(path, root), 'utf8')));
const all = [html, js, ...fragments].join('\n');

test('main route contains the approved nine-node operating flow', () => {
  assert.equal((html.match(/class="hash-route-node/g) || []).length, 9);
  for (const id of ['collection', 'transport', 'foundation', 'aily', 'decision', 'execution', 'milestone', 'risk', 'review']) {
    assert.match(all, new RegExp(`(?:data-node|id|nextId)[=:"'\\s]+${id}`));
  }
  assert.match(js, /const routeOrder = \['collection', 'transport', 'foundation', 'aily', 'decision', 'execution', 'milestone', 'risk', 'review'\]/);
});

test('three isolated registries and shared narrative design are loaded', () => {
  for (const asset of ['data-evidence.js', 'approval-execution.js', 'risk-review.js', 'narrative-core.css']) {
    assert.match(html, new RegExp(asset.replace('.', '\\.')));
  }
  assert.match(js, /renderGenericNarrative/);
  assert.match(js, /initGenericNarrative/);
  assert.match(js, /stopGenericNarrative/);
});

test('homepage entrance asset is synchronized without replacing Aily narrative', () => {
  assert.match(html, /hash-home-entering/);
  assert.match(js, /triggerHomeEntrance/);
  assert.match(html, /id="aily-narrative-template"/);
  assert.match(js, /initAilyNarrative/);
});

test('mother-document management boundaries remain visible', () => {
  for (const text of ['证据不足', '必须由管理层批准', '我是新入职人员', '宽限期', '十个', '反例', '恢复办法']) {
    assert.match(all, new RegExp(text));
  }
});

test('handoff vocabulary is consistent across all nodes', () => {
  for (const term of ['原始数据', '可追溯原始记录', '待调查经营事件', '决策就绪包', '正式决策版本', '责任任务', '阶段验收', '经营结果', '管理改进']) {
    assert.match(all, new RegExp(term));
  }
});

test('homepage and node openings use the approved Chinese management language', () => {
  for (const term of [
    '脚本找异常，Agent 查原因',
    '最小信息触发',
    '原始数据全程留痕',
    '企业经营语义层',
    '由点及面的逐级调查',
    '人机协同决策',
    '责任到岗，任务到人',
    '按业务节点验收',
    '结果回读与自动复查',
    '经验反哺规则和 Skill'
  ]) assert.match(all, new RegExp(term));
  assert.doesNotMatch(all, /证据门|可信事件管道|Human-in-the-Loop|知识飞轮|有界查询循环|人工责任门|最终判断门|通过上述硬门|while 调查|while 循环/);
});

test('Aily separates investigation, domain Skill planning, and decision readiness', () => {
  assert.match(js, /从待调查经营信号开始/);
  assert.match(html, /查清就停，查不清再扩大/);
  const handoff = html.slice(html.indexOf('07 \/ 调查结束，进入方案生成'), html.indexOf('</template>'));
  const orderedTerms = ['调查结果包', '领域 Skill', '决策就绪包', '管理审批'];
  let cursor = -1;
  for (const term of orderedTerms) {
    const next = handoff.indexOf(term, cursor + 1);
    assert.ok(next > cursor, `${term} should appear after the previous Aily stage`);
    cursor = next;
  }
});

test('scheme detail uses the same investigation-to-decision sequence as the main narrative', () => {
  const priceCase = html.slice(html.indexOf('<section id="price-case"'), html.indexOf('<section id="milestones"'));
  const orderedTerms = ['形成调查结果包', '领域 Skill 生成方案', '形成决策就绪包', '管理层审批'];
  let cursor = -1;
  for (const term of orderedTerms) {
    const next = priceCase.indexOf(term, cursor + 1);
    assert.ok(next > cursor, `${term} should follow the previous price-case stage`);
    cursor = next;
  }
  assert.match(all, /每个字段的来源、时间和版本/);
});

test('proposal and verified-current language are not mixed', () => {
  assert.match(all, /待企业核实|目标租户|方案建议/);
  assert.doesNotMatch(all, /圣农已经完成全部|当前已经全面实现/);
});

test('the former copy now identifies itself as the single nine-node main site', () => {
  assert.match(html, /九节点经营主站/);
  assert.doesNotMatch(html, /版式精修副本 · Aily 单节点滚动叙事/);
});

test('approval and management-review handoffs follow their actual branches', () => {
  assert.match(fragments[1], /output: 'PRICE-0249 经批准的价格整改版本',[\s\S]*?nextId: 'execution'/);
  assert.doesNotMatch(fragments[1], /output: '正式决策版本或退回意见'/);
  assert.match(js, /review:\s*\{[\s\S]*?next: 'foundation'/);
  assert.match(js, /同步更新节点 04 的调查方法/);
});

test('route navigation keeps complete accessible names and manages focus after hash changes', () => {
  assert.equal((html.match(/class="hash-node-button"[^>]+aria-label="\d{2} [^"]+"/g) || []).length, 9);
  assert.match(js, /const setRouteButtonLabel/);
  assert.match(js, /completeRoute\(app\.querySelector\('\[data-node-title\]'\)\)/);
  assert.match(html, /<h2 data-node-title tabindex="-1">/);
});

test('touch targets and landmarks follow the delivery design contract', () => {
  assert.match(html, /\.hash-node-button\s*\{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
  assert.doesNotMatch(html, /<main class="contact-resume-main">/);
  assert.match(html, /<div class="contact-resume-main">/);
});

test('scene activation uses the full visible scene set instead of observer entry order', () => {
  assert.match(js, /const sceneAtReadingLine/);
  assert.match(js, /sceneAtReadingLine\(scenes\)/);
  assert.doesNotMatch(js, /entries\.filter\(entry => entry\.isIntersecting\)\.sort/);
});

test('scene reveals play once while active state remains free to track reading progress', () => {
  assert.match(js, /classList\.contains\('is-seen'\)/);
  assert.match(js, /classList\.add\('is-seen', 'is-entering'\)/);
  assert.match(html, /\.aily-scene\.is-entering \.aily-reveal/);
  assert.doesNotMatch(html, /\.aily-scene\.is-active \.aily-reveal\s*\{\s*animation:/);
});

test('primary narrative motion avoids the forbidden neon glow effects', () => {
  assert.doesNotMatch(html, /box-shadow: 0 0 18px currentColor/);
  assert.doesNotMatch(html, /box-shadow: 0 0 42px/);
});

test('all node pages remove the detail tab strip and redundant handoff bridge', () => {
  assert.doesNotMatch(html, /data-node-tab=/);
  assert.doesNotMatch(html, /data-node-panel="(?:contract|technology|acceptance)"/);
  assert.doesNotMatch(js, /sn-narrative-bridge/);
  assert.doesNotMatch(html, /class="aily-intro"/);
});

test('sticky case threads sit below the measured route bar and show full text', () => {
  assert.match(js, /const syncStickyOffset/);
  assert.match(all, /top: var\(--route-sticky-offset/);
  assert.match(all, /overflow-wrap: anywhere;[\s\S]*?text-overflow: clip;[\s\S]*?white-space: normal;/);
});

test('every node has a full-screen opening and a linear print reading mode', () => {
  assert.match(html, /\.hash-node-hero \{[^}]*min-height: calc\(100svh - var\(--route-sticky-offset/);
  assert.match(html, /\.hash-node-hero > div:first-child \{ align-self: start; \}/);
  assert.match(html, /\.hash-node-output \{[\s\S]*?align-self: end;/);
  assert.match(html, /@media print/);
  assert.match(html, /\.aily-scene, \.sn-scene \{ min-height: 94vh/);
});

test('PRICE-0249 is the single case thread across all nine nodes', () => {
  assert.equal(fragments.reduce((count, source) => count + (source.match(/caseId: 'PRICE-0249'/g) || []).length, 0), 8);
  assert.doesNotMatch(fragments.join('\n'), /caseId: '(?:FACT|RECORD|SIGNAL|DECISION|EXECUTION|MILESTONE|RESULT-CHECK|MRB)-/);
  assert.match(js, /同一个案例贯穿全程/);
  assert.match(js, /门店实付 24\.9 元 \/ 统一价盘 29\.9 元/);
});
