# Shengnong Nine-Node Main Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current Aily narrative copy into the single nine-node main site, using the final judge-facing mother document as the sole content source and the validated Aily narrative as the shared interaction language.

**Architecture:** Keep the existing static Hash-routed HTML application and preserve the specialized Aily implementation. Add three isolated narrative-content registries, one shared narrative renderer/style layer, and a nine-node route registry. Subagents own disjoint content files; the primary agent alone edits shared HTML, shared JavaScript, navigation, and integration tests.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js `node:test`, Playwright browser QA, existing local HTTP server on port `8125`.

---

## File Structure

- Modify `output/html/圣农经营智能中枢_Aily叙事副本.html`: nine-node navigation, shared stylesheet/script includes, homepage phases, Aily preservation, contact page.
- Modify `output/html/圣农经营智能中枢_Aily叙事副本.js`: nine-node route registry, generic narrative mount/unmount, node progress, homepage entrance, route cleanup.
- Create `output/html/shengnong-nodes/narrative-core.css`: shared narrative layout, status thread, scene states, handoff, responsive and reduced-motion rules.
- Create `output/html/shengnong-nodes/data-evidence.js`: nodes 01-03 content and visuals.
- Create `output/html/shengnong-nodes/approval-execution.js`: nodes 05-07 content and visuals.
- Create `output/html/shengnong-nodes/risk-review.js`: nodes 08-09 content and visuals.
- Create `tests/shengnong-nine-node-main-site.test.mjs`: structural, wording, boundary, asset and content-source regression contract.
- Modify `tests/shengnong-aily-narrative.test.mjs`: preserve Aily-specific behavior after route expansion.

The three content files expose entries through this exact interface:

```js
window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};
window.ShengnongNodeNarratives.collection = {
  id: 'collection',
  caseId: 'FACT-001',
  bridge: { from: '经营事实', to: '带来源和时间的原始数据' },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [{
    id: 'source',
    number: '01',
    code: 'SOURCE',
    title: '经营事实从哪里产生',
    description: '先确认这条价格记录来自哪个系统、发生在什么时间，并保留原始内容。',
    current: '接收门店价格记录',
    confirmed: '来源、发生时间和接收时间已登记',
    unknown: '当前字段是否足以形成待调查信号',
    next: '检查权限范围和数据质量状态',
    visual: 'source-flow',
    body: '<div class="sn-source-flow"><span>POS 价格记录</span><span>来源与时间</span><span>原始数据</span></div>'
  }],
  handoff: { output: '原始数据', nextId: 'transport', condition: '来源、时间、权限和质量状态已登记' }
};
```

## Task 1: Add the Nine-Node Contract Test

**Files:**
- Create: `tests/shengnong-nine-node-main-site.test.mjs`

- [ ] **Step 1: Write the failing structural test**

```js
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
  for (const id of ['collection','transport','foundation','aily','decision','execution','milestone','risk','review']) {
    assert.match(all, new RegExp(`(?:data-node|id|nextId)[=:"'\\s]+${id}`));
  }
});

test('mother-document management boundaries remain visible', () => {
  for (const text of ['证据不足','必须由管理层批准','我是新入职人员','宽限期','十个','反例','恢复办法']) {
    assert.match(all, new RegExp(text));
  }
});
```

- [ ] **Step 2: Run the test and verify it fails because the new fragment files do not exist**

Run: `node --test tests/shengnong-nine-node-main-site.test.mjs`

Expected: FAIL with `ENOENT` for `shengnong-nodes/data-evidence.js`.

- [ ] **Step 3: Commit the failing contract test**

```bash
git add tests/shengnong-nine-node-main-site.test.mjs
git commit -m "test: define nine-node shengnong main site"
```

## Task 2: Build Nodes 01-03 Content Registry

**Files:**
- Create: `output/html/shengnong-nodes/data-evidence.js`
- Reference: `/Users/Admin/Desktop/母方案副本/圣农经营智能中枢_评委版母方案.md:219`

- [ ] **Step 1: Implement three complete narrative entries**

Use the shared interface above and register exactly `collection`, `transport`, and `foundation`. Each entry must contain four to six scenes, a continuous state thread, one loop-capable visual, and a handoff. Required mother-document content:

```text
collection: SAP/ERP, WMS/TMS, CRM/SRM, POS, 智慧农场/养殖, 飞书, 外部市场;
            业务发生时间, 源系统记录时间, 平台接收时间;
            秒级/分钟级/小时级/批次, 不统一宣称实时.
transport: 身份校验, 幂等, 排序, 重试, 死信, 回放, 原始记录;
           只可靠搬运, 不承担经营判断.
foundation: SKU/门店/区域/价格/批次/时间统一;
            完整性/时效/冲突/合法例外/判断条件版本;
            程序登记待调查信号, 不判违规或严重程度.
```

- [ ] **Step 2: Validate JavaScript syntax**

Run: `node --check output/html/shengnong-nodes/data-evidence.js`

Expected: exit code `0` with no output.

- [ ] **Step 3: Commit the isolated content registry**

```bash
git add output/html/shengnong-nodes/data-evidence.js
git commit -m "feat: add data and evidence narratives"
```

## Task 3: Build Nodes 05-07 Content Registry

**Files:**
- Create: `output/html/shengnong-nodes/approval-execution.js`
- Reference: `/Users/Admin/Desktop/母方案副本/圣农经营智能中枢_评委版母方案.md:288`

- [ ] **Step 1: Implement three complete narrative entries**

Register exactly `decision`, `execution`, and `milestone`. Required content and transitions:

```text
decision: 决策材料 -> 批准/修改/驳回 -> 正式决策版本;
          适用对象, 预算, 时间, 停止条件, 恢复办法;
          价格/存栏/产能/库存/市场进入不得自动批准.
execution: 有效审批 -> 负责人/配合人/前置任务/完成标准/截止时间/升级路径;
           跨部门权限校验后建群; 单人任务只发卡片;
           “我是新入职人员” -> 岗位职责/步骤/审核案例/求助对象.
milestone: SAP 发运 -> TMS 到货 -> 门店登记 -> 上架或 POS 首销 -> 价签和成交价;
           节点未到只监测进度; 节点到达并超过宽限期后检查质量.
```

- [ ] **Step 2: Validate JavaScript syntax**

Run: `node --check output/html/shengnong-nodes/approval-execution.js`

Expected: exit code `0` with no output.

- [ ] **Step 3: Commit the isolated content registry**

```bash
git add output/html/shengnong-nodes/approval-execution.js
git commit -m "feat: add approval and execution narratives"
```

## Task 4: Build Nodes 08-09 Content Registry

**Files:**
- Create: `output/html/shengnong-nodes/risk-review.js`
- Reference: `/Users/Admin/Desktop/母方案副本/圣农经营智能中枢_评委版母方案.md:322`

- [ ] **Step 1: Implement two complete narrative entries**

Register exactly `risk` and `review`. Required content:

```text
risk: 任务完成 != 经营目标达成;
      价格/销量/毛利/库存/回款/退货/投诉 -> 基准/对照区域/季节性;
      多区域降价+滞销+库存上升 -> 需求/库存/生产/存栏/产能/海外市场;
      多情景与可恢复措施 -> 关闭/恢复/重开/重新审批.
review: 同领域十个已关闭、结果已验证、证据完整、根因去重事件;
        资格检查 -> 反例与替代解释 -> 零个或多个管理问题候选;
        管理审批 -> 改进任务 -> 后续批次验证;
        新口径/判断条件/模板/案例回流 foundation 和 aily.
```

- [ ] **Step 2: Validate JavaScript syntax**

Run: `node --check output/html/shengnong-nodes/risk-review.js`

Expected: exit code `0` with no output.

- [ ] **Step 3: Commit the isolated content registry**

```bash
git add output/html/shengnong-nodes/risk-review.js
git commit -m "feat: add risk and management review narratives"
```

## Task 5: Add the Shared Narrative Design Language

**Files:**
- Create: `output/html/shengnong-nodes/narrative-core.css`
- Modify: `output/html/圣农经营智能中枢_Aily叙事副本.html`

- [ ] **Step 1: Add the stylesheet contract and load it from the main HTML**

The stylesheet must define these shared classes:

```css
.sn-narrative { --node-accent: #ff7a17; }
.sn-narrative-bridge {}
.sn-case-thread {}
.sn-case-state {}
.sn-scenes {}
.sn-scene {}
.sn-scene.is-active {}
.sn-scene-head {}
.sn-visual {}
.sn-handoff {}
.sn-reveal {}
@media (prefers-reduced-motion: reduce) {}
```

Add to `<head>`:

```html
<link rel="stylesheet" href="shengnong-nodes/narrative-core.css?v=20260719-1">
```

- [ ] **Step 2: Implement consistent layout and fallbacks**

Use the existing black engineering-blueprint palette, shared typography, 1px rules, eight-pixel-or-smaller corners, stable full-screen scene dimensions, visible inactive content, responsive stacking below `760px`, and static reduced-motion rendering. Do not introduce a second palette, decorative gradients, nested cards, or viewport-scaled body typography.

- [ ] **Step 3: Run static checks**

Run: `rg -n "sn-narrative|sn-case-thread|prefers-reduced-motion" output/html/shengnong-nodes/narrative-core.css output/html/圣农经营智能中枢_Aily叙事副本.html`

Expected: all three terms exist in the stylesheet and the stylesheet link exists in HTML.

## Task 6: Integrate the Nine Routes and Generic Narrative Engine

**Files:**
- Modify: `output/html/圣农经营智能中枢_Aily叙事副本.html`
- Modify: `output/html/圣农经营智能中枢_Aily叙事副本.js`

- [ ] **Step 1: Load content registries before the main script**

```html
<script src="shengnong-nodes/data-evidence.js?v=20260719-1"></script>
<script src="shengnong-nodes/approval-execution.js?v=20260719-1"></script>
<script src="shengnong-nodes/risk-review.js?v=20260719-1"></script>
<script src="圣农经营智能中枢_Aily叙事副本.js?v=20260719-1"></script>
```

- [ ] **Step 2: Replace the eight-node route metadata with nine nodes**

```js
const routeOrder = ['collection','transport','foundation','aily','decision','execution','milestone','risk','review'];
```

Update labels, phase colors, `next`, `nextCondition`, and homepage phase copy so outputs chain as:

```text
原始数据 -> 可追溯原始记录 -> 待调查经营事件 -> 决策就绪材料 -> 正式决策版本 -> 责任任务 -> 阶段验收 -> 经营结果 -> 管理改进
```

- [ ] **Step 3: Implement generic mount and cleanup functions**

```js
const initGenericNarrative = (nodeId, mount) => {
  const definition = window.ShengnongNodeNarratives?.[nodeId];
  if (!definition) return false;
  mount.replaceChildren(renderNarrative(definition));
  observeNarrativeScenes(mount, definition);
  updateNodeProgress(nodeId, mount);
  return true;
};

const stopGenericNarrative = () => {
  genericSceneObserver?.disconnect();
  window.removeEventListener('scroll', genericProgressHandler);
  window.removeEventListener('resize', genericProgressHandler);
};
```

`renderRoute()` must call `stopGenericNarrative()` and existing `stopAilyNarrative()` before mounting a new route. `#node/aily` must continue to use the current specialized Aily template and functions.

- [ ] **Step 4: Synchronize the missing homepage entrance loop**

Port only the `f0c13b4` homepage entrance closure: initial `hash-home-entering`, six stagger selectors, three keyframes, `homeEntranceTimer`, `triggerHomeEntrance()`, render-time replay, and reduced-motion disable. Preserve Aily cleanup and contact routing.

- [ ] **Step 5: Run syntax and contract tests**

Run:

```bash
node --check output/html/圣农经营智能中枢_Aily叙事副本.js
node --test tests/shengnong-nine-node-main-site.test.mjs tests/shengnong-aily-narrative.test.mjs tests/shengnong-contact.test.mjs
```

Expected: JavaScript check passes and all tests pass.

## Task 7: Complete Semantic and Visual Consistency Review

**Files:**
- Modify as required: the three `output/html/shengnong-nodes/*.js` content registries
- Modify as required: `output/html/shengnong-nodes/narrative-core.css`
- Modify: `tests/shengnong-nine-node-main-site.test.mjs`

- [ ] **Step 1: Add terminology assertions**

```js
test('handoff vocabulary is consistent across all nodes', () => {
  for (const term of ['原始数据','可追溯原始记录','待调查经营事件','决策就绪材料','正式决策版本','责任任务','阶段验收','经营结果','管理改进']) {
    assert.match(all, new RegExp(term));
  }
});

test('proposal and verified-current language are not mixed', () => {
  assert.match(all, /待企业核实|目标租户|方案建议/);
  assert.doesNotMatch(all, /圣农已经完成全部|当前已经全面实现/);
});
```

- [ ] **Step 2: Read every scene in route order**

Check that each sentence answers one of: what enters, what the system does, what becomes known, what remains unknown, who decides, or what is handed off. Rewrite long mother-document paragraphs into plain management Chinese without deleting qualifications or approval boundaries.

- [ ] **Step 3: Run all static tests**

Run: `node --test tests/shengnong-nine-node-main-site.test.mjs tests/shengnong-aily-narrative.test.mjs tests/shengnong-contact.test.mjs`

Expected: all tests pass.

## Task 8: Browser and Responsive Verification

**Files:**
- Modify only when a verified visual defect is found: main HTML, main JS, shared CSS, or the responsible node registry.
- Save evidence: `output/playwright/shengnong-nine-node/`

- [ ] **Step 1: Verify all routes on desktop**

Open `http://127.0.0.1:8125/output/html/圣农经营智能中枢_Aily叙事副本.html#home`, then visit every `#node/*` route. Confirm the highlighted node, internal progress, active scene, sticky state, next handoff and contact navigation.

- [ ] **Step 2: Verify representative mobile routes**

Use a `390x844` viewport for `#home`, `#node/collection`, `#node/aily`, `#node/execution`, `#node/risk`, and `#node/review`. Confirm no horizontal overflow, overlap, clipped long words, blank animation canvas or unreachable controls.

- [ ] **Step 3: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`. Confirm loop stages are statically visible and no content depends on animation timing.

- [ ] **Step 4: Run final test suite and inspect results**

```bash
node --check output/html/圣农经营智能中枢_Aily叙事副本.js
node --check output/html/shengnong-nodes/data-evidence.js
node --check output/html/shengnong-nodes/approval-execution.js
node --check output/html/shengnong-nodes/risk-review.js
node --test tests/shengnong-nine-node-main-site.test.mjs tests/shengnong-aily-narrative.test.mjs tests/shengnong-contact.test.mjs
```

Expected: all syntax checks and tests pass; screenshots show complete, non-overlapping content.
