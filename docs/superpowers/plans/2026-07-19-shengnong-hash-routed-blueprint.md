# 圣农经营智能中枢 Hash 路由版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把滚动叙事副本改造成视觉首页与八个 Hash 路由节点详情页，并保留现有业务内容、交互与人工审批边界。

**Architecture:** HTML 负责可访问的静态页面壳、首页和节点内容容器；独立 JavaScript 把现有业务章节迁移到八个节点，使用 `location.hash` 作为唯一路由状态，并控制四标签和流程进度动画。流程条采用灰色底轨和四段彩色进度层，动画抵达后才提交节点、Hash 与页面内容。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Node.js 内置测试运行器、浏览器 E2E 验证。

---

### Task 1: 建立可回归的路由契约测试

**Files:**
- Create: `tests/shengnong-hash-blueprint.test.mjs`
- Test: `output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html`
- Test: `output/html/圣农经营智能中枢_滚动叙事副本.js`

- [ ] **Step 1: 写入失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html', import.meta.url);
const jsPath = new URL('../output/html/圣农经营智能中枢_滚动叙事副本.js', import.meta.url);
const html = await readFile(htmlPath, 'utf8');
const js = await readFile(jsPath, 'utf8');
const routes = ['collection', 'transport', 'foundation', 'aily', 'decision', 'milestone', 'coaching', 'feedback'];

test('首页与详情页结构存在', () => {
  assert.match(html, /data-view="home"/);
  assert.match(html, /data-view="detail"/);
  assert.match(html, />联系我们</);
});

test('八节点 Hash 路由完整', () => {
  for (const route of routes) assert.match(js, new RegExp(`node/${route}`));
  assert.doesNotMatch(js, /IntersectionObserver/);
});

test('流程条使用灰色底轨和动态填充', () => {
  assert.match(html, /route-segment/);
  assert.match(js, /setRouteProgress/);
  assert.match(js, /is-reached/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/shengnong-hash-blueprint.test.mjs`

Expected: FAIL，旧正式副本没有 `data-view="home"`，且仍包含 `IntersectionObserver`。

### Task 2: 实现首页、详情壳和 Hash 路由

**Files:**
- Modify: `output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html`
- Modify: `output/html/圣农经营智能中枢_滚动叙事副本.js`

- [ ] **Step 1: 在 HTML 中实现正式页面壳**

首页包含左侧 SN 品牌、中部“首页 / 方案详情”、右侧“联系我们”、视觉英雄区和四阶段经营闭环；详情页包含返回首页、八节点导航、四个内部标签和下一节点交接区。未到达节点和连线使用灰色。

- [ ] **Step 2: 使用 Hash 作为唯一状态源**

```js
const ROUTES = ['collection', 'transport', 'foundation', 'aily', 'decision', 'milestone', 'coaching', 'feedback'];

function parseRoute() {
  if (location.hash === '#home' || !location.hash) return { view: 'home' };
  const match = location.hash.match(/^#node\/(.+)$/);
  return match && ROUTES.includes(match[1]) ? { view: 'detail', node: match[1] } : { view: 'home' };
}

window.addEventListener('hashchange', renderRoute);
```

- [ ] **Step 3: 实现动态进度传递**

用四段 `route-segment` 保存阶段色，`setRouteProgress(nodeId)` 设置每段 `--fill`。用户点击下一节点后先更新进度层，560ms 后再设置 `is-active`、`is-reached`、Hash 和内容；减弱动效模式立即完成。

- [ ] **Step 4: 将现有业务章节迁移到八节点**

映射关系：采集 `collection`、传输 `transport`、底座 `foundation`、Aily `agent-config`、人工决策 `price-case`、里程碑 `milestones`、岗位辅导 `coaching`、结果校准 `consensus + boundaries`。原章节内容放入“流程示例”，其余三个标签由节点合同、技术能力和验收边界生成，不删除现有事实与来源。

- [ ] **Step 5: 保留现有局部交互**

继续支持 Aily 子标签、岗位追问按钮、来源链接和键盘焦点；主路由不得使用滚动位置或 `IntersectionObserver`。

### Task 3: 自动化与浏览器验收

**Files:**
- Test: `tests/shengnong-hash-blueprint.test.mjs`
- Verify: `output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html`

- [ ] **Step 1: 运行静态契约测试**

Run: `node --test tests/shengnong-hash-blueprint.test.mjs`

Expected: 3 tests PASS。

- [ ] **Step 2: 检查 JavaScript 语法**

Run: `node --check output/html/圣农经营智能中枢_滚动叙事副本.js`

Expected: exit 0，无输出。

- [ ] **Step 3: 验证代表性 E2E**

在 `http://127.0.0.1:8124/...滚动叙事副本.html#home` 验证：首页无八节点导航；“方案详情”进入 `#node/collection`；点击 02 时蓝线先传递再点亮；直接打开 `#node/aily` 高亮 04；前进后退恢复页面；四标签可切换；控制台 0 error。

- [ ] **Step 4: 验证响应式与减弱动效**

检查 1440、1024、768、390、320px：无页面横向溢出、文字不重叠、导航自身可横向滚动；`prefers-reduced-motion` 下路由立即完成。

- [ ] **Step 5: 提交正式实现**

```bash
git add tests/shengnong-hash-blueprint.test.mjs \
  output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html \
  output/html/圣农经营智能中枢_滚动叙事副本.js \
  docs/superpowers/plans/2026-07-19-shengnong-hash-routed-blueprint.md
git commit -m "feat: build hash-routed shengnong blueprint"
```
