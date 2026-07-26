import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

// ===== 飞书看板（值守台定稿）四处镜像 + 设计稿 =====
const repoDashboardUrl = new URL('../dashboard/index.html', import.meta.url);
const deliveryUrl = new URL('../output/html/圣农经营智能中枢_飞书经营看板.html', import.meta.url);
const siteMirrorUrl = new URL(
  '../.superpowers/brainstorm/34646-1784704126/content/dashboard/index.html',
  import.meta.url,
);
const prototypeUrl = new URL(
  '../.superpowers/brainstorm/9302-1784773389/content/dashboard-hybrid-role-prototype.html',
  import.meta.url,
);
const draftUrl = new URL(
  '../.superpowers/brainstorm/34646-1784704126/content/drafts/feishu-kanban-a.html',
  import.meta.url,
);
// ===== 数据与接口透视（未在本次改动范围） =====
const reportDeliveryUrl = new URL('../output/html/圣农经营智能中枢_飞书看板_数据与接口透视.html', import.meta.url);
const reportSiteUrl = new URL(
  '../.superpowers/brainstorm/34646-1784704126/content/dashboard/report/index.html',
  import.meta.url,
);
const homepageUrl = new URL(
  '../.superpowers/brainstorm/34646-1784704126/content/homepage-design-draft.html',
  import.meta.url,
);
const collaborationDocUrl = new URL('../docs/方案合并副本_2026-07-21/飞书经营协同与人员同步方案_待确认.md', import.meta.url);
const capabilityDocUrl = new URL('../docs/方案合并副本_2026-07-21/飞书看板能力.md', import.meta.url);
const planUrl = new URL('../docs/superpowers/plans/2026-07-24-feishu-operations-dashboard.md', import.meta.url);
const loop01Url = new URL('../docs/方案合并副本_2026-07-21/循环专题_待确认/01_经营事件循环_专题工作稿_待确认.md', import.meta.url);
const loop02Url = new URL('../docs/方案合并副本_2026-07-21/循环专题_待确认/02_能力进化循环_专题工作稿_待确认.md', import.meta.url);
const html = await readFile(repoDashboardUrl, 'utf8');

const stageLabels = [
  '调查取证中',
  '待人工补证',
  '分析中',
  '决策就绪',
  '持续监督',
  '执行中',
  '待结果验证',
  '未解决专项协作',
  '已正式关闭',
];

const sourceStates = [
  'investigating',
  'awaiting_human_evidence',
  'evidence_fact_summary_ready',
  'evidence_completeness_review',
  'analyzing',
  'decision_ready',
  'known_no_action',
  'risk_accepted',
  'executing',
  'unresolved_collaboration',
  'awaiting_result_verification',
  'closed',
];

test('the four dashboard mirrors and the approved draft stay byte identical', async () => {
  await access(repoDashboardUrl);
  await access(deliveryUrl);
  await access(siteMirrorUrl);
  await access(prototypeUrl);
  await access(draftUrl);
  const reviewed = await readFile(repoDashboardUrl);
  for (const url of [deliveryUrl, siteMirrorUrl, prototypeUrl, draftUrl]) {
    assert.deepEqual(await readFile(url), reviewed, `${url.pathname} must stay byte identical`);
  }
});

test('01 lifecycle uses the approved page stages and twelve source states', () => {
  for (const label of stageLabels) assert.match(html, new RegExp(label));
  for (const state of sourceStates) assert.match(html, new RegExp(state));
  assert.doesNotMatch(html, /(?:^|[^A-Za-z0-9_])waiting_human_evidence(?:$|[^A-Za-z0-9_])/);
  assert.match(html, /code: 'governance_watch'/);
  assert.match(html, /data-stage="\$\{stage\.code\}"/);
  assert.match(html, /data-substate="known_no_action"/);
  assert.match(html, /data-substate="risk_accepted"/);
});

test('business state, milestone, task, collaboration and resolution remain distinct', () => {
  for (const token of [
    'current_case_state',
    'milestone_code',
    'task_completion_status',
    'collaboration_status',
    'resolution_status',
    'projection_status',
  ]) assert.match(html, new RegExp(token));
  assert.match(html, /任务完成不等于经营结果达成/);
  assert.match(html, /案件已建立是里程碑，不是案件当前状态/);
  for (const structuredField of ['milestones:', 'tasks:', 'verification:', 'collaboration:', 'impact:', 'approval:', 'closure:']) {
    assert.match(html, new RegExp(structuredField));
  }
  for (const collaborationField of ['deliveredAt', 'readAt', 'acknowledgedAt', 'acceptedAt']) {
    assert.match(html, new RegExp(collaborationField));
  }
  assert.doesNotMatch(html, /case_created \+ current_progress/);
});

test('01 duty console exposes the complete eleven-section case dossier', () => {
  for (const region of [
    '案件总览',
    '经营事实与未知项',
    'Agent调查循环',
    '证据与查询轨迹',
    '责任人与下一动作',
    '管理决定',
    '责任任务与业务里程碑',
    '结果验证与关闭',
    '飞书协同送达状态',
    '原始证据与权限',
    '接口与字段映射',
  ]) assert.match(html, new RegExp(region));
  assert.match(html, /EventPackage v1/);
  assert.match(html, /我是新入职人员，请告诉我该怎么处理/);
  for (const field of [
    'guidance_role_duties',
    'guidance_required_evidence',
    'guidance_next_milestone',
    'guidance_escalation_path',
    'guidance_case_refs',
  ]) assert.match(html, new RegExp(field));
});

test('role home sections and honest empty states are declared', () => {
  for (const token of [
    '待我决策',
    '需要关注',
    '治理线与经营影响线',
    '本区域待办',
    '升级事项',
    '本区域阶段分布',
    '我的任务',
    '新人指导',
    '权限说明',
    'empty 不等于没有经营风险',
    '切回集团管理层可见待办队列演示',
    '已知悉暂不处理与风险接受案件见 05 持续监督格',
  ]) assert.match(html, new RegExp(token));
  assert.match(html, /集团管理层/);
  assert.match(html, /区域负责人/);
  assert.match(html, /一线责任人/);
});

test('runtime inspector covers all truthful states and offers recovery', () => {
  for (const state of [
    'normal',
    'loading',
    'empty',
    'forbidden',
    'stale',
    'conflict',
    'unavailable',
    'projection_failed',
  ]) {
    assert.match(html, new RegExp(`value="${state}"`));
  }
  assert.match(html, /恢复正常演示 · normal/);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
});

test('02 is frozen logic only and 03 remains untouched in progress', () => {
  assert.match(html, /02_logic_final/);
  assert.match(html, /每个正式关闭案件完整复盘/);
  assert.match(html, /隔离验证通过后提交管理审批/);
  assert.match(html, /03_in_progress/);
  assert.match(html, /03专题仍在修改/);
  assert.doesNotMatch(html, /扩域评分\s*[:：]?\s*\d|候选域评分|模拟扩域队列/);
});

test('the duty console never claims target-tenant production truth', () => {
  assert.match(html, /脱敏演示数据/);
  assert.match(html, /target_tenant_unknown/);
  assert.doesNotMatch(html, /真实数据|已接入圣农|生产已上线|当前已经全面实现|EventState|低成本初筛/);
});

test('the impact line honestly declines to show fabricated numbers', () => {
  assert.match(html, /经营影响线/);
  assert.match(html, /model_run_id/);
  assert.match(html, /unknown \/ modeled/);
  assert.match(html, /本页不显示数值/);
  assert.doesNotMatch(html, /\d+(?:\.\d+)?\s*万元/);
});

test('sunner editorial css variables and motion choreography are declared', () => {
  for (const token of [
    '--paper: #ffffff',
    '--ink: #051c2c',
    '--red: #2251ff',
    '--copper: #b07a10',
    '--green: #008a6d',
    '--neg: #c22f4e',
    '--serif:',
    '--mono:',
  ]) assert.match(html, new RegExp(token));
  for (const token of [
    'riseIn',
    'data-rise',
    'ledPulse',
    'numFlash',
    'grid-template-rows: 0fr',
    'visibility: hidden',
    'prefers-reduced-motion: reduce',
  ]) assert.match(html, new RegExp(token));
});

test('navigation follows the public site convention', async () => {
  assert.match(html, /<a href="\.\.\/">主页<\/a>/);
  assert.match(html, /href="\.\.\/report\/"/);
  assert.match(html, /href="\.\.\/report\/02\/"/);
  assert.match(html, /href="\.\.\/report\/03\/"/);
  assert.match(html, /href="report\/"/);
  assert.match(html, /href="\.\.\/#contact"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /数据与接口透视/);
  assert.match(html, /<h1>飞书看板<\/h1>/);
  assert.match(html, /协作投影，不是第二套权威账/);
  const homepage = await readFile(homepageUrl, 'utf8');
  assert.match(homepage, /href="dashboard\/report\/"/);
  assert.match(homepage, /飞书看板/);
  assert.match(homepage, /数据与接口透视/);
});

test('the tech brief mirrors exist and stay byte identical', async () => {
  await access(reportDeliveryUrl);
  await access(reportSiteUrl);
  const delivery = await readFile(reportDeliveryUrl);
  const siteMirror = await readFile(reportSiteUrl);
  assert.deepEqual(siteMirror, delivery);
});

test('tech brief states contracts, interfaces and honesty boundaries', async () => {
  const brief = await readFile(reportDeliveryUrl, 'utf8');
  for (const token of [
    '数据与接口透视',
    'EventPackage v1',
    'CaseState',
    'get_case_counts',
    'search_events',
    'verified',
    'partial',
    'target-tenant unknown',
    '协作投影',
    '第二套权威账',
    'model_run_id',
    '03_in_progress',
    '飞书看板能力',
    '不能宣称',
  ]) assert.match(brief, new RegExp(token));
  assert.match(brief, /不是 SAP、POS、经营事件库/);
  assert.match(brief, /design_audit_in_progress/);
  assert.doesNotMatch(brief, /真实数据|已接入圣农|生产已上线|当前已经全面实现/);
});

test('independent Feishu documents keep 03 in progress without copying an old flow', async () => {
  const [collaborationDoc, capabilityDoc] = await Promise.all([
    readFile(collaborationDocUrl, 'utf8'),
    readFile(capabilityDocUrl, 'utf8'),
  ]);
  for (const doc of [collaborationDoc, capabilityDoc]) {
    assert.match(doc, /03_in_progress/);
    assert.match(doc, /不读取、不复述、不补写、不冻结/);
    assert.doesNotMatch(doc, /业务扩域专题稿已经明确流程|当前领域形成稳定闭环/);
  }
  assert.doesNotMatch(capabilityDoc, /`01` 页面已展示[^\n]*双线汇总/);
  assert.match(capabilityDoc, /案件数组[^\n]*阶段[^\n]*状态[^\n]*角色范围[^\n]*影响证据状态/);
  assert.match(capabilityDoc, /治理效率[^\n]*经营影响[^\n]*企业指标口径[^\n]*真实接口[^\n]*model_run_id[^\n]*再投影/);
});

test('implementation plan freezes 01 and 02 while excluding concurrently edited 03', async () => {
  const plan = await readFile(planUrl, 'utf8');
  assert.match(plan, /八种运行状态/);
  assert.match(plan, /03.*不读取.*不补写.*不冻结/);
  assert.doesNotMatch(plan, /three hashes byte-for-byte identical|all three hashes/);

  const sha256 = input => createHash('sha256').update(input).digest('hex');
  assert.equal(sha256(await readFile(loop01Url)), 'b1c04431d17f33a9028c74f34dd1adf0ca1e261b34b4b5049fd5d46ee45b9016');
  assert.equal(sha256(await readFile(loop02Url)), 'b6fbe1211ccef4cd87aa593455445a179c0749f26843bce673eab43e9ed91f49');
});
