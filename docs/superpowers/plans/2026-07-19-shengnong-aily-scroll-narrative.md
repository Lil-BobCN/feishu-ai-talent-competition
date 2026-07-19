# 圣农 Aily Agent 单节点滚动叙事 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不修改 8124 正式副本的前提下，制作只讲 Aily 收到决策底座事件包后如何调查并形成决策就绪包的八幕滚动叙事副本。

**Architecture:** 从当前 Hash 路由正式页面复制独立 HTML/JS，在 Aily 节点用一个模板化叙事组件替换原长文内容。主路由继续由 Hash 控制；Aily 内部场景通过自然滚动和可见性观察激活 CSS 时间线，所有业务状态来自母稿 M05/M06。

**Tech Stack:** 原生 HTML、CSS、JavaScript、CSS keyframes、IntersectionObserver（仅用于场景显现）、Node.js 内置测试、浏览器 E2E。

---

### Task 1: 建立副本和失败测试

**Files:**
- Create: `output/html/圣农经营智能中枢_Aily叙事副本.html`
- Create: `output/html/圣农经营智能中枢_Aily叙事副本.js`
- Create: `tests/shengnong-aily-narrative.test.mjs`

- [ ] **Step 1: 复制当前正式页面与脚本**

```bash
cp output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html output/html/圣农经营智能中枢_Aily叙事副本.html
cp output/html/圣农经营智能中枢_滚动叙事副本.js output/html/圣农经营智能中枢_Aily叙事副本.js
```

- [ ] **Step 2: 写入失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.js', import.meta.url), 'utf8');

test('Aily 叙事包含八个业务场景', () => {
  assert.equal((html.match(/data-aily-scene=/g) || []).length, 8);
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
```

- [ ] **Step 3: 运行测试确认失败**

Run: `node --test tests/shengnong-aily-narrative.test.mjs`

Expected: FAIL，副本尚无 `data-aily-scene` 和 `initAilyNarrative`。

### Task 2: 实现八幕 Aily 叙事

**Files:**
- Modify: `output/html/圣农经营智能中枢_Aily叙事副本.html`
- Modify: `output/html/圣农经营智能中枢_Aily叙事副本.js`

- [ ] **Step 1: 将副本 HTML 的脚本引用改为独立 JS**

把 `圣农经营智能中枢_滚动叙事副本.js` 改为 `圣农经营智能中枢_Aily叙事副本.js`，保证正式页面与副本运行时完全隔离。

- [ ] **Step 2: 添加 Aily 叙事模板**

模板包含八个 `data-aily-scene`：统一受理、观察评估、最小计划、局部证据、并行补证、动态范围、校验决定、决策就绪包。开场额外显示 03 决策底座向 04 Aily 的结构化事件包交接。

- [ ] **Step 3: 实现场景视觉系统**

每幕使用 `min-height: calc(100svh - var(--aily-top-offset))`，建立事件包、假设矩阵、查询轨迹、证据轨迹、双通道补数、范围扩张、四出口证据门和 JSON 决策包等专属视图；场景之间用“本幕产物 → 下一幕输入”连接，不使用大量通用分割线。

- [ ] **Step 4: 实现因果动效**

进入场景后依次播放路径绘制、节点激活、证据汇入和状态提交；只允许当前场景的确定性时间线运行。`prefers-reduced-motion` 时立即显示最终状态。

- [ ] **Step 5: 接入 Aily 路由**

`renderNode('aily')` 时克隆叙事模板、隐藏原四标签和通用“下一页”区，初始化场景；其他七个节点保持原副本行为。

### Task 3: 独立服务和代表性验收

**Files:**
- Test: `tests/shengnong-aily-narrative.test.mjs`
- Verify: `output/html/圣农经营智能中枢_Aily叙事副本.html`

- [ ] **Step 1: 运行静态测试和语法检查**

Run: `node --test tests/shengnong-aily-narrative.test.mjs && node --check output/html/圣农经营智能中枢_Aily叙事副本.js`

Expected: all PASS，JavaScript exit 0。

- [ ] **Step 2: 在新端口启动副本**

Run: `python3 -m http.server 8125 --bind 127.0.0.1`

Expected: `http://127.0.0.1:8125/` 可访问；8124 仍返回 HTTP 200。

- [ ] **Step 3: 浏览器验证 Aily 流程**

验证 `#node/aily`：开场从 03 交接开始；八幕按顺序出现；补证并行、Run 暂停、四出口和 `approval_required: true` 可见；正文不重演完整 01-08 流程；控制台 0 error。

- [ ] **Step 4: 响应式与减弱动效验证**

检查 1440、1024、768、390、320px 无页面横向溢出；顶部节点栏自身可横向滚动；减弱动效模式无自动路径与错峰动画但内容完整。

- [ ] **Step 5: 提交副本**

```bash
git add output/html/圣农经营智能中枢_Aily叙事副本.html \
  output/html/圣农经营智能中枢_Aily叙事副本.js \
  tests/shengnong-aily-narrative.test.mjs \
  docs/superpowers/plans/2026-07-19-shengnong-aily-scroll-narrative.md
git commit -m "feat: add Aily investigation scroll narrative"
```
