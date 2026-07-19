# Management Review Loop PDF Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved ten-event management review loop into the Shengnong operating intelligence master proposal and regenerate a visually verified PDF.

**Architecture:** Keep the existing master Markdown as the single proposal source. Add the review loop as a distinct capability after single-event result verification, route approved improvements back through the existing approval/task/milestone path, and reserve long-term asset governance for the renumbered M13. Reuse the existing Markdown-to-HTML renderer and Chrome print path, then validate the PDF through text extraction and full-page image rendering.

**Tech Stack:** Markdown, Mermaid, Python 3, Python Markdown/BeautifulSoup, local Mermaid JavaScript, headless Google Chrome, Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`).

---

### Task 1: Integrate the approved management review design

**Files:**
- Modify: `docs/superpowers/specs/2026-07-19-management-review-loop-design.md`
- Modify: `docs/圣农经营智能中枢_完整方案母稿.md`

- [x] **Step 1: Record design approval**

Change the design status from `待用户书面审阅` to `用户已批准，实施中` without altering the approved behavior.

- [x] **Step 2: Extend the proposal's executive narrative**

Update the one-page conclusion and the bidirectional operating diagrams so they distinguish:

```text
单事件闭环：发现 → 调查 → 审批 → 执行 → 验证 → 关闭
跨事件管理闭环：同领域十件合格事件 → 管理问题候选 → 管理层审议 → 改进任务 → 后续批次验证
长期治理闭环：批准的语义、规则、Skill、模型和案例变更 → 评测 → 发布/回滚
```

State explicitly that later batches continue forming even if the prior report is rejected, deferred, or finds no systemic issue.

- [x] **Step 3: Add a concrete price-domain example**

After the existing 29.9/24.9 price event lifecycle, add a short example showing ten distinct, closed, evidence-complete price cases being deduplicated, reviewed across policy/process/organization/system/training/risk-control dimensions, reported to management, and followed by a second batch. Preserve the caveat that ten cases do not prove enterprise incidence without an exposure denominator.

- [x] **Step 4: Extend shared objects and state**

Change “七个关键中间态” to “九个关键中间态” and add:

```text
复盘批次：同一 review_domain_id、十个不同 canonical_case_id、资格/分类版本、批次状态
管理问题上报包：支持证据、反例、替代解释、六维候选、历史关联、建议和验证策略
```

Add a fourth state line for batch review, including invalidation on event reopen, no duplicate rebatching, independent future batches, and `inconclusive` when effectiveness gates are unmet. Extend the board description with backlog aging, delivery/read state, report versions, management comments, and improvement status.

- [x] **Step 5: Add M12 and renumber continuous governance to M13**

Update the module table and route table so the tail becomes:

```text
M11 单事件结果验证/关闭
→ M12 同领域十事件管理复盘
→ M07 管理层审批改进
→ M08/M09/M10 执行、辅导和里程碑
→ M11 验证
→ M13 受控发布批准的治理资产变更
```

Add a full `M12 跨事件管理复盘闭环` module table covering purpose, inputs/outputs, deterministic batching, `management-review` Skill, direct-to-management delivery, role revalidation, reopened-event invalidation, backlog blind-spot prevention, intervention cohorts, downgrade behavior, acceptance, phased value, and future extension. Rename the existing M12 section and all references to M13.

- [x] **Step 6: Update supporting chapters and appendices**

Update all relevant proposal surfaces:

```text
第 9 章：Aily Skill / deterministic batch service / capability boundary
第 10 章：business taxonomy, completeness policy, recipients, target-tenant E2E items
第 11 章：manual review in lower tier; automated batching and cross-batch validation in terminal tier
第 12 章：new G4 review gate, later gates renumbered; review metrics and E2E cases
第 13 章：answer the prompt with “solve cases and repair management weaknesses”
附录 A：management, risk/audit, domain owner sample requirements
附录 B：add management-review Skill
附录 C：add management_review_batch and management_issue_dossier contracts
附录 F：add review terms in plain language
附录 G：add submission checks
```

Correct M07/M08 language so the 2024 Feishu customer case is historical evidence whose 2026 status remains to be confirmed.

- [x] **Step 7: Run focused structural checks**

Run:

```bash
rg -n '七个关键|M12.*持续治理|M12 治理|M01-M05/M12|抽象六类|圣农飞书统一审批入口 `公开事实已核验`' docs/圣农经营智能中枢_完整方案母稿.md
rg -n 'M12|M13|management-review|management_review_batch|management_issue_dossier|canonical_case_id|effectiveness_policy|未关闭|积压' docs/圣农经营智能中枢_完整方案母稿.md
```

Expected: the first command returns no stale wording; the second command shows the new capability across architecture, modules, testing, skills, contracts, and glossary.

### Task 1A: Add Aily-triggered Feishu event collaboration groups

**Files:**
- Create: `docs/superpowers/specs/2026-07-19-aily-event-collaboration-group-design.md`
- Modify: `docs/圣农经营智能中枢_完整方案母稿.md`

- [x] **Step 1: Verify official Feishu capability boundaries**

Confirm that the official Feishu Open Platform documents expose create-chat, chat-member, and send-message APIs. Treat these as platform capabilities only; keep target-tenant permissions and representative E2E unverified.

- [x] **Step 2: Specify the safe architecture**

Define Aily as the collaboration-scope proposer and a deterministic event collaboration service as the credential holder, permission validator, idempotent group creator, member synchronizer, retry handler, and audit source.

- [x] **Step 3: Integrate the capability across the proposal**

Add the event group to the responsibility-to-person stage, M08/M09, cases, capability matrix, F25-F31 E2E, capability tiers, G3, Skill/tool contracts, task Schema, glossary, and submission checks. Preserve the rule that chat is not ERP, approval, task completion, or source-system state.

- [x] **Step 4: Verify collaboration-group coverage**

Run structural checks and search for `事件协同群`, `create_collaboration_chat`, `collaboration_idempotency_key`, `F25`, `collaboration_degraded`, the three official API links, and explicit no-approval/no-permission boundaries. Expected: all surfaces are present and Markdown remains valid.

### Task 2: Verify content, evidence boundaries, and Markdown integrity

**Files:**
- Verify: `docs/圣农经营智能中枢_完整方案母稿.md`
- Verify: `docs/superpowers/specs/2026-07-19-management-review-loop-design.md`

- [x] **Step 1: Verify Markdown structure**

Run a deterministic checker that confirms code fences are balanced and every Markdown table has a consistent number of cells. Expected: zero failures.

- [x] **Step 2: Verify approved design coverage**

Check that the mother document includes all of these exact concepts:

```text
same-domain only
closed and evidence-complete only
ten non-overlapping cases per batch
canonical-case deduplication
independent subsequent batching
event-reopen invalidation and versioning
six dimensions with zero-or-more findings
direct management delivery with current-role authorization
no automatic制度/组织/价格/存栏/产能/市场进入 changes
pre/transition/post-intervention cohorts
versioned effectiveness policy and inconclusive fallback
separate overdue/open/incomplete backlog visibility
```

- [x] **Step 3: Recheck factual boundaries**

Search for absolute claims about Shengnong's current internal systems, current Aily deployment, current Feishu process, or proven management problems. Expected: every unsupported operational claim is labeled `待企业确认`, `需要 E2E`, `unknown`, `unsupported`, `方案设计`, or equivalent.

- [x] **Step 4: Recheck public links**

Extract unique `http(s)` links from the Markdown and request each with redirect support. Expected: all reachable links return HTTP 2xx/3xx; any network-blocked result is reported as unverified rather than silently passed.

- [x] **Step 5: Independent review**

Use separate reviewers for specification coverage and first-time management-judge readability. Resolve every high/medium issue, then rerun Steps 1-3.

### Task 3: Generate and visually verify the PDF

**Files:**
- Reuse: `tmp/pdfs/render_markdown_pdf.py`
- Reuse: `tmp/pdfs/mermaid.min.js`
- Generate: `tmp/pdfs/圣农经营智能中枢_完整方案母稿.html`
- Generate temporarily: `tmp/pdfs/圣农经营智能中枢_完整方案母稿.new.pdf`
- Replace: `output/pdf/圣农经营智能中枢_完整方案母稿.pdf`
- Generate temporarily: `tmp/pdfs/rendered-management-review/*.png`

- [ ] **Step 1: Render Markdown to print HTML**

Run:

```bash
python3 \
  tmp/pdfs/render_markdown_pdf.py \
  docs/圣农经营智能中枢_完整方案母稿.md \
  tmp/pdfs/圣农经营智能中枢_完整方案母稿.html \
  --mermaid-js tmp/pdfs/mermaid.min.js
```

Expected: HTML exists, contains no Mermaid fallback, and all Mermaid source blocks are converted to render targets.

- [ ] **Step 2: Print HTML to the stable PDF path**

Run headless Chrome with a fresh temporary user-data directory and wait for Mermaid rendering before printing:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=12000 \
  --user-data-dir=tmp/pdfs/chrome-profile-management-review \
  --print-to-pdf=tmp/pdfs/圣农经营智能中枢_完整方案母稿.new.pdf \
  "$(pwd)/tmp/pdfs/圣农经营智能中枢_完整方案母稿.html"
```

Expected: Chrome exits successfully and the temporary PDF modification time is newer than the source Markdown update. Keep the current stable PDF untouched until the new file passes all checks.

- [ ] **Step 3: Validate PDF structure and text**

Run `pdfinfo`, `pdftotext`, and targeted searches against the temporary PDF. Expected: A4 page size, nonzero pages, extractable Chinese text, and visible occurrences of `M12 跨事件管理复盘`, `M13`, `management-review`, `canonical_case_id`, and `effectiveness_policy`.

- [ ] **Step 4: Render every page to PNG**

Run:

```bash
rm -rf tmp/pdfs/rendered-management-review
mkdir -p tmp/pdfs/rendered-management-review
pdftoppm -png -r 110 tmp/pdfs/圣农经营智能中枢_完整方案母稿.new.pdf \
  tmp/pdfs/rendered-management-review/page
```

Expected: one nonblank PNG for every PDF page.

- [ ] **Step 5: Inspect all pages and representative full-resolution pages**

Generate contact sheets for every page and inspect them for blank pages, clipping, black squares, overlapping tables, broken diagrams, and inconsistent section transitions. Inspect the cover, first content page, every page containing M12/M13, at least one dense table, and the final page at full resolution.

- [ ] **Step 6: Run final artifact checks**

Confirm the temporary PDF opens, page count matches rendered PNG count, text extraction contains no Mermaid source fallback, and no page is almost entirely blank except intentional section breaks. Then atomically replace `output/pdf/圣农经营智能中枢_完整方案母稿.pdf` with the verified temporary file and rerun `pdfinfo` plus the targeted text checks on the stable path.
