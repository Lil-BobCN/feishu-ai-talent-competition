(() => {
  const makeHeading = (index, code, title, description, proofs = []) => {
    const heading = document.createElement('header');
    heading.className = 'stage-heading';
    heading.innerHTML = `<div><p class="stage-index">${index} / ${code}</p><h2>${title}</h2><div class="stage-proof">${proofs.map(item => `<span>${item}</span>`).join('')}</div></div><p>${description}</p>`;
    return heading;
  };

  const makeStage = (id, className, code) => {
    const stage = document.createElement('section');
    stage.id = id;
    stage.className = `story-stage ${className}`;
    stage.dataset.stageCode = code;
    return stage;
  };

  const dataFlow = document.getElementById('data-flow');
  const dataPanels = dataFlow ? [...dataFlow.querySelectorAll(':scope > .panel')] : [];
  const agentStage = document.getElementById('agent-config');

  if (dataFlow && agentStage && dataPanels.length >= 3) {
    const collection = makeStage('collection', 'stage-collection', 'COLLECT');
    collection.append(
      makeHeading('01', 'COLLECTION', '信息采集层', '从 SAP、POS、CRM、WMS、飞书和合法外部市场取得带来源、时间、权限与质量状态的经营事实。采集只保留证据，不在入口处替业务定责。', ['原文保留', '权威来源', '缺失不补零']),
      dataPanels[0], dataPanels[1]
    );

    const transport = makeStage('transport', 'stage-transport', 'TRANSPORT');
    transport.append(
      makeHeading('02', 'TRANSPORT', '数据传输层', '通过 API、Webhook、AnyCross、受控 CDC 或审计文件把证据可靠送达。该层解决连接、幂等、重试、顺序和血缘，不承担经营判断。', ['API 优先', '可重放', '失败可见']),
      dataPanels[2]
    );

    const foundation = makeStage('foundation', 'stage-foundation', 'FOUNDATION');
    foundation.innerHTML = `
      <header class="stage-heading"><div><p class="stage-index">03 / FOUNDATION</p><h2>企业数据与决策底座</h2><div class="stage-proof"><span>业务概念优先</span><span>确定性计算</span><span>长期状态</span></div></div><p>把不同系统中的物理字段映射为同一套经营对象、口径、规则与动作边界，为 Agent 提供可查询、可复算、可审计的企业上下文。</p></header>
      <div class="foundation-map" aria-label="企业数据与决策底座五项确定性服务">
        <article><code>D01 / RAW EVIDENCE</code><h3>原始证据库</h3><p>保存原始快照、来源、时间、hash、schema、敏感级别和访问范围。</p></article>
        <article><code>D02 / SEMANTIC</code><h3>语义注册与实体解析</h3><p>统一 SKU、门店、客户、区域、价盘、到手价、库存与经营事件。</p></article>
        <article><code>D03 / RULES</code><h3>规则与例外服务</h3><p>执行阈值、时间窗、合法活动、里程碑前置条件和数据质量检查。</p></article>
        <article><code>D04 / SCENARIO</code><h3>预测与情景模拟</h3><p>确定性计算销量、毛利、预算、库存、存栏和多方案影响，Agent 只负责解释。</p></article>
        <article><code>D05 / EVENT STORE</code><h3>经营事件状态库</h3><p>保存 event_id、调查版本、审批、任务、跨天恢复、重开和长期审计。</p></article>
      </div>
      <div class="foundation-contract">
        <div class="panel panel-pad"><h3>给 Agent 的不是数据库表，而是业务工具</h3><p class="sub">领域 MCP 只暴露已解释的业务动作，并在服务端再次执行身份、权限、字段、规则和审批校验。</p><pre>get_price_context(event_id, scope)
get_inventory_exposure(sku, region, window)
get_promotion_approval(store, sku, occurred_at)
simulate_price_options(event_id, constraints)
append_evidence(event_id, evidence_ref)</pre></div>
        <div class="panel panel-pad"><h3>暗知识单独治理</h3><div class="config-list"><div class="config-item"><strong>业务口径</strong><p>到手价、sell-out、区域范围、库存可用量和贡献毛利。</p></div><div class="config-item"><strong>合法例外</strong><p>消费券承担方、渠道特供规格、审批有效期和临期政策。</p></div><div class="config-item"><strong>动作与责任</strong><p>谁能查、谁能建议、谁必须审批、谁执行、何时升级。</p></div></div></div>
      </div>`;

    agentStage.before(collection, transport, foundation);
    dataFlow.remove();
  }

  const stageDefinitions = [
    ['agent-config', '04', 'AILY RUNTIME', '飞书 Aily：唯一 Agent 运行时', '接收可信异常点后，按统一事件受理 Skill 运行有界查询循环；证据不足时并行调用领域工具与责任人补数，直到形成决策就绪事件包或明确转人工。', ['有界 while 循环', '领域 MCP', '结构化事件包'], 'stage-agent'],
    ['price-case', '05', 'HUMAN DECISION', '人工决策与方案审批', 'Agent 围绕一个价格异常逐级调查并组织多情景方案，但价格、存栏、产能和市场进入决策必须由管理层批准，批准后才允许拆解任务和写回。', ['多方案比较', 'approval_id', '禁止自动拍板'], 'stage-human'],
    ['milestones', '06', 'MILESTONE GATE', '里程碑质量门', '任务下达不等于立即验收。系统先读取 SAP、TMS、WMS、POS 的正式状态，达到业务节点并越过宽限期后，才运行相应质量检测。', ['源状态映射', '宽限窗口', '后置检测'], 'stage-human'],
    ['coaching', '07', 'OWNER ENABLEMENT', '责任到人与岗位辅导', '每项任务绑定负责人、截止时间、完成证据和追问入口。新人可在任务上下文中获得岗位职责、第一步、历史案例和升级路径，但仍对现场事实负责。', ['责任任务', '任务内追问', '案例有来源'], 'stage-human'],
    ['consensus', '08', 'FEEDBACK', '结果验证、校准与知识沉淀', '系统按 6/24/48/72 小时回读价格、销量、库存和投诉。经营结果恢复才关闭；未恢复则升级或重开，并把有效经验版本化回写到规则、语义、Skill 与岗位案例。', ['close / escalate / reopen', '复发率', '版本治理'], 'stage-feedback']
  ];

  stageDefinitions.forEach(([id, index, code, title, description, proofs, className]) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.add(className);
    section.prepend(makeHeading(index, code, title, description, proofs));
  });

  const feedback = document.getElementById('consensus');
  if (feedback) {
    const feedbackFlow = document.createElement('div');
    feedbackFlow.className = 'panel panel-pad';
    feedbackFlow.innerHTML = `<h3>执行结果回到同一个经营事件</h3><div class="landing-sequence"><div class="landing-step"><b>01 / 回读</b><span>按批准方案读取价格、sell-out、库存、投诉和任务证据。</span></div><div class="landing-step"><b>02 / 对照</b><span>比较基线、目标、预算、停止条件和数据质量，不用任务完成代替经营恢复。</span></div><div class="landing-step"><b>03 / 决定</b><span>达到目标则关闭；未达到则升级、重开调查或重新送审。</span></div><div class="landing-step"><b>04 / 校准</b><span>把有效规则、失败边界、语义变化和岗位案例写入新版本并回归测试。</span></div></div>`;
    feedback.querySelector('.stage-heading')?.after(feedbackFlow);
  }

  const feedbackSource = document.createElement('div');
  feedbackSource.className = 'hash-feedback-source';
  if (feedback) feedbackSource.append(feedback);
  const boundaries = document.getElementById('boundaries');
  if (boundaries) feedbackSource.append(boundaries);

  const nodes = {
    collection: {
      route: '#node/collection', code: '01 / COLLECTION', title: '信息采集', phase: 'info', output: '原始数据',
      summary: '从业务系统、飞书和合法外部来源取得经营事实，同时登记来源、时间、权限和质量状态。',
      next: 'transport', nextCondition: '带来源和时间的原始数据进入可靠传输',
      source: document.getElementById('collection'),
      contract: [['输入', 'SAP、POS、CRM、WMS、飞书与合法外部市场的原始记录'], ['输出', 'source、entity、occurred_at、payload、quality、lineage、hash'], ['缺口', '无法取得的券承担方、审批版本和现场证明必须显式标记 unknown'], ['责任', '源系统负责人确认接口；业务人员只补现场证据，不改写原始记录']],
      technology: [['接口优先', 'API、Webhook、变更通知；无接口时才使用审计文件或受控轮询'], ['证据保真', '原始快照、schema version、payload hash、访问范围与采集时间同时保存'], ['外部市场', '合法公开源按来源白名单、频率、版权和质量等级进入'], ['实时触发', '到达即生成最小信号，确定性规则只负责暴露，不替 Agent 定性']],
      acceptance: [['可追溯', '任一字段都能回到原始系统、原始时间和原始版本'], ['不补零', '缺失、延迟和无权限分别标记，不把未知写成零'], ['最小权限', '采集账号只读取授权对象与字段'], ['租户事实', '接口名称、字段、频率和 owner 仍需圣农 IT E2E 验证']]
    },
    transport: {
      route: '#node/transport', code: '02 / TRANSPORT', title: '可靠传输', phase: 'info', output: '可追溯原始记录',
      summary: '通过企业已有接口和集成方式可靠搬运数据，处理重复、乱序和失败，不承担经营判断。',
      next: 'foundation', nextCondition: '可追溯原始记录进入经营口径和信号登记',
      source: document.getElementById('transport'),
      contract: [['输入', '带 hash、schema 与来源的原始证据包'], ['输出', '幂等、排序、可重放并附带 lineage 的标准证据流'], ['失败', '重试、死信、补偿和人工重放状态必须可见'], ['边界', 'AnyCross 是集成通道，不是事实库、语义层或规则引擎']],
      technology: [['接入网关', 'API Gateway、Webhook Receiver、SFTP、受控 CDC 与内网代理'], ['可靠传输', 'idempotency key、重试退避、死信队列、顺序键与限流'], ['数据合同', 'schema registry、版本兼容、敏感字段脱敏与质量标记'], ['可观测性', '延迟、吞吐、失败率、重放次数与 lineage 全链路记录']],
      acceptance: [['幂等', '相同证据重复送达不会生成两个经营事实'], ['可重放', '失败批次可以按 event_id 和时间窗重放'], ['不判断', '传输故障不得被解释为经营异常'], ['租户事实', '连接器、吞吐、重试上限和 SLA 必须在目标租户验证']]
    },
    foundation: {
      route: '#node/foundation', code: '03 / EVIDENCE & SIGNAL', title: '经营证据与信号', phase: 'info', output: '待调查经营事件',
      summary: '统一经营对象、业务口径、合法例外和判断条件，区分数据问题与值得调查的经营信号。',
      next: 'aily', nextCondition: '统一口径的待调查经营事件交给 Aily 智能研判',
      source: document.getElementById('foundation'),
      contract: [['输入', '可重放的标准证据流和主数据映射'], ['输出', '统一对象、暗知识、规则版本、event_id 与受控动作'], ['语义', 'SKU、门店、区域、到手价、库存、活动、里程碑和责任链统一命名'], ['状态', '事件调查、审批、任务、回读、关闭与重开跨天保存']],
      technology: [['原始证据库', '保存原始快照和 lineage，不替代 SAP/POS 正式账'], ['语义注册', '实体解析、指标口径、维度、例外、责任人与权限声明'], ['规则服务', '阈值、时间窗、合法活动、里程碑门和确定性校验'], ['情景服务', '价格、销量、毛利、库存、存栏和产能影响由确定性模型计算']],
      acceptance: [['业务概念优先', 'Agent 查询业务工具，不直接理解物理表和字段'], ['版本化', '语义、规则、模型和动作声明均有版本与回归样本'], ['可复算', '相同输入、版本和参数得到相同结果'], ['长期治理', '业务 owner、数据 owner 与 AI owner 共同处理语义变更']]
    },
    aily: {
      route: '#node/aily', code: '04 / AILY INVESTIGATION', title: 'Aily 智能研判', phase: 'agent', output: '决策就绪材料',
      summary: '按照企业经验从最小范围开始调查；现有证据解释不了问题时，才扩大范围并继续补证。',
      next: 'decision', nextCondition: '决策就绪材料进入管理审批与授权',
      source: document.getElementById('agent-config'),
      contract: [['输入', 'event_id、最小异常信号、可见范围与当前语义版本'], ['输出', '事实、未知、原因假设、影响、方案、约束和引用组成的决策就绪包'], ['循环', '局部 → 区域 → 跨域 → 战略；每轮只查询区分当前假设所需的最小证据'], ['并行补数', '系统查询与飞书责任人请求并行，缺失字段、已读状态和预计时间透明']],
      technology: [['统一受理 Skill', '读取已知/未知、建立互斥假设、选择调查等级和停止条件'], ['领域 Skill', '价格、库存、渠道、供应链和市场风险采用不同处理方法'], ['五域 MCP', '销售、供应、生产、财务/风险、组织知识均通过权限网关查询'], ['中间态', '调查计划、证据请求、事件包版本和工具结果可检查、可回滚']],
      acceptance: [['有界运行', '达到证据门槛、预算/时间上限或权限阻塞时必须停止'], ['引用事实', '每个结论引用来源、时间、口径和质量状态'], ['不直连', 'Agent 不直接访问数据库，不绕过 MCP 权限与审计'], ['不拍板', '价格、存栏、产能和市场进入只形成方案，不自动批准']]
    },
    decision: {
      route: '#node/decision', code: '05 / MANAGEMENT APPROVAL', title: '管理审批与授权', phase: 'execute', output: '经批准的正式决策版本',
      summary: '管理者同时查看事实、缺口、方案、代价和恢复办法，决定批准、修改还是驳回。',
      next: 'execution', nextCondition: '有效的正式决策版本进入责任执行',
      source: document.getElementById('price-case'),
      contract: [['输入', '决策就绪材料、备选方案、影响范围、预算、停止条件和恢复办法'], ['输出', 'approval_id、decision_version、适用对象、批准人、生效期和执行授权'], ['分支', '批准进入执行；修改或驳回返回调查与方案环节'], ['边界', '所有存栏、产能、价格、库存和市场进入决策必须由管理层批准']],
      technology: [['审批页面', '事实、推断、未知信息、方案比较和风险边界同屏呈现'], ['权限校验', '校验审批人、法人范围、代理关系、预算和适用对象'], ['版本控制', '参数变化或材料过期后不得沿用旧 approval_id'], ['审计恢复', '保留修改、驳回、批准理由、停止条件和恢复办法']],
      acceptance: [['不自动拍板', '系统只组织材料和生成草案，不替管理层承担决策责任'], ['证据不足可见', '缺失信息会改变方案选择时，限制可批准动作'], ['范围明确', '对象、数量、预算、时间和权限均可检查'], ['可恢复', '每个批准方案都包含停止条件和恢复办法']]
    },
    execution: {
      route: '#node/execution', code: '06 / RESPONSIBLE EXECUTION', title: '责任执行与岗位指导', phase: 'execute', output: '责任任务',
      summary: '把批准内容拆成负责人、配合人、前置关系、完成标准和升级路径，并在任务内提供岗位指导。',
      next: 'milestone', nextCondition: '责任任务及其完成依据进入业务里程碑跟踪',
      source: document.getElementById('coaching'),
      contract: [['输入', '有效审批、业务任务模板、组织和权限目录'], ['输出', 'task_id、负责人、配合人、依赖、截止时间、完成标准和升级路径'], ['协作', '跨部门事项经权限校验后建事件群；单人任务只下发任务卡'], ['岗位指导', '责任人可选择“我是新入职人员”，查看职责、步骤、审核案例和求助对象']],
      technology: [['任务编排', '按销售、库存、生产、养殖、财务和海外业务生成任务草案'], ['协同范围', '只纳入当前阶段必需角色，外部对象使用另行批准的协作方式'], ['岗位知识', '回答引用有效制度、适用版本和已审核案例'], ['失败降级', '建群失败不阻断正式任务，并显示重试和人工入口']],
      acceptance: [['责任到人', '每项任务都有负责人、完成标准、截止时间和升级对象'], ['权限一致', '指导不会扩大岗位的查询或写入权限'], ['来源可查', '岗位建议引用制度或已审核案例，不临时编造规程'], ['事实归位', '群聊用于协作，正式事实仍以授权业务系统为准']]
    },
    milestone: {
      route: '#node/milestone', code: '07 / BUSINESS MILESTONE', title: '业务里程碑与验收', phase: 'execute', output: '阶段验收',
      summary: '先等待业务系统确认任务已经走到正确节点，再在企业认可的时间之后检查执行质量。',
      next: 'risk', nextCondition: '阶段验收和执行证据进入结果校准与风险预判',
      source: document.getElementById('milestones'),
      contract: [['输入', '责任任务、正式业务状态、预计时长、宽限期和完成证据'], ['输出', 'milestone_id、阶段验收、进度阻塞、质量异常或重新执行要求'], ['顺序', 'SAP 发运 → TMS 到货 → 门店登记 → 上架或 POS 首销 → 价签与成交价'], ['原则', '节点未到只监测进度；节点到达并超过宽限期后才检查质量']],
      technology: [['状态映射', '把真实单据和状态码映射为企业批准的标准业务节点'], ['进度监测', '运输中、登记中和等待前置任务时只显示推进状态'], ['质量检查', '节点到达且超过处理时间后运行对应检测'], ['失败分流', '进度延误和执行质量问题分别定责、升级和补偿']],
      acceptance: [['零提前误报', '货物仍在运输或登记时不得报告未上架、未标价'], ['正式状态', '不以群聊回复代替 SAP/TMS/WMS/POS 等正式状态'], ['历史完整', '状态回退、取消、重派和人工修正均可追溯'], ['待企业核实', '真实状态码、宽限期、例外和负责人必须由业务确认']]
    },
    risk: {
      route: '#node/risk', code: '08 / OUTCOME & RISK', title: '结果校准与风险预判', phase: 'risk', output: '经营结果',
      summary: '用执行后的新数据判断经营目标是否改善，并把多区域变化传导到库存、生产、存栏和市场选择。',
      next: 'review', nextCondition: '已关闭且结果验证完整的经营事件进入管理复盘',
      source: feedbackSource,
      contract: [['输入', '阶段验收、批准目标、基准、观察周期和新的经营数据'], ['输出', '关闭、继续观察、恢复、重开或重新审批，以及多情景风险建议'], ['结果', '读取价格、销量、毛利、库存、回款、退货和投诉，不以任务完成替代目标达成'], ['传导', '多区域降价、滞销和库存上升联动需求、生产、存栏、产能和海外市场分析']],
      technology: [['结果回读', '按 event_id 聚合业务指标、执行证据和外部市场新信息'], ['可比分析', '比较同口径基准、对照区域和历史季节性'], ['情景测算', '确定性程序测算库存、毛利、现金流、产能与供应风险'], ['重新决策', '高影响调整只形成建议，必须回到管理审批']],
      acceptance: [['结果导向', '经营指标达到批准目标才允许关闭'], ['多情景', '同时展示假设、置信范围、敏感性和未知信息'], ['先可恢复', '长期调整前优先采用有停止条件和恢复办法的措施'], ['不越权', '价格、库存、存栏、产能和市场进入仍由管理层批准']]
    },
    review: {
      route: '#node/review', code: '09 / MANAGEMENT REVIEW', title: '管理复盘与持续改进', phase: 'feedback', output: '管理改进',
      summary: '从多个合格事件中识别可能重复出现的管理短板，再由管理层决定是否改制度、流程或经营知识。',
      next: 'foundation', nextCondition: '批准后的新口径和判断条件回流节点 03，并同步更新节点 04 的调查方法',
      source: feedbackSource,
      contract: [['输入', '同领域十个已关闭、结果已验证、证据完整且按根因去重的事件'], ['输出', '零个或多个管理问题候选、反例、替代解释、改进选项和管理层报告'], ['改进', '管理层批准后形成改进任务，并用后续批次检查问题是否减少'], ['回流', '新版口径、判断条件、业务处置模板和案例反馈到节点 03 和 04']],
      technology: [['资格与去重', '服务端确定性筛选、排序、去重和封存，重复打开不重复计数'], ['复盘分析', '比较背景、原因、处置和结果，同时保留反例与其他解释'], ['管理审批', '候选问题不能自行进入制度或组织变更执行'], ['版本治理', '保存批次、报告、证据、模型、工具、模板、权限和投递状态版本']],
      acceptance: [['不强行归纳', '没有稳定规律时明确输出未发现系统性问题'], ['批次可信', '十个不同事件满足同一资格和证据标准'], ['效果可比', '达到企业批准的事件量、覆盖量和观察期后才判断改善'], ['持续运行', '上一批驳回或暂缓不阻断后续批次形成']]
    }
  };

  const routeOrder = ['collection', 'transport', 'foundation', 'aily', 'decision', 'execution', 'milestone', 'risk', 'review'];
  const routeRanges = [[0, 2], [2, 3], [3, 6], [6, 7], [7, 8]];
  const app = document.getElementById('hash-app');
  const routeNodes = [...app.querySelectorAll('.hash-route-node')];
  const segments = [...app.querySelectorAll('.route-segment')];
  const panels = Object.fromEntries([...app.querySelectorAll('[data-node-panel]')].map(panel => [panel.dataset.nodePanel, panel]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentNode = 'collection';
  let routeTimer;
  let entranceTimer;
  let homeEntranceTimer;
  let revealObserver;
  let ailySceneObserver;
  let ailyProgressFrame;
  let ailyScrollListener;
  let genericSceneObserver;
  let genericProgressFrame;
  let genericScrollListener;
  let contactEntranceTimer;
  let contactRevealObserver;
  let routeInitialized = false;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  };

  const syncStickyOffset = () => {
    const routeBar = app.querySelector('.hash-route-bar');
    if (routeBar?.offsetHeight) app.style.setProperty('--route-sticky-offset', `${routeBar.offsetHeight + 10}px`);
  };

  const completeRoute = focusTarget => {
    resetScroll();
    const shouldFocus = routeInitialized;
    routeInitialized = true;
    if (shouldFocus) window.requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
  };

  const setRouteButtonLabel = (nodeId, progress) => {
    const button = app.querySelector(`.hash-route-node[data-node="${nodeId}"] .hash-node-button`);
    if (!button || !nodes[nodeId]) return;
    const number = String(routeOrder.indexOf(nodeId) + 1).padStart(2, '0');
    const suffix = Number.isFinite(progress) ? `，本节点阅读进度 ${progress}%` : '';
    button.setAttribute('aria-label', `${number} ${nodes[nodeId].title}${suffix}`);
  };

  const sceneAtReadingLine = scenes => {
    const readingLine = window.innerHeight * .42;
    const visible = scenes.filter(scene => {
      const rect = scene.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });
    const reached = visible.filter(scene => scene.getBoundingClientRect().top <= readingLine);
    return reached[reached.length - 1] || visible[0];
  };

  const setupScrollReveals = () => {
    revealObserver?.disconnect();
    if (app.classList.contains('is-aily-narrative') || app.classList.contains('is-generic-narrative')) return;
    const activePanel = Object.values(panels).find(panel => !panel.hidden);
    if (!activePanel) return;
    const selector = [
      '.panel', '.foundation-map > article', '.runtime-lane', '.bundle-card',
      '.milestone-stage', '.state-card', '.task-demo', '.consensus-card',
      '.acceptance-card', '.component-block', '.landing-step', '.hash-info-card'
    ].join(',');
    const candidates = [...activePanel.querySelectorAll(selector)];
    const targets = (candidates.length ? candidates : [...activePanel.children]).filter(element =>
      !candidates.some(parent => parent !== element && parent.contains(element))
    );
    targets.forEach(target => target.classList.remove('hash-scroll-reveal', 'is-visible'));
    if (reducedMotion.matches) {
      targets.forEach(target => target.classList.add('is-visible'));
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });
    targets.forEach(target => {
      target.classList.add('hash-scroll-reveal');
      revealObserver.observe(target);
    });
  };

  const triggerNodeEntrance = () => {
    const detailMain = app.querySelector('.hash-detail-main');
    clearTimeout(entranceTimer);
    detailMain.classList.remove('is-entering');
    if (reducedMotion.matches) return;
    void detailMain.offsetWidth;
    detailMain.classList.add('is-entering');
    entranceTimer = window.setTimeout(() => detailMain.classList.remove('is-entering'), 860);
  };

  const triggerHomeEntrance = () => {
    clearTimeout(homeEntranceTimer);
    app.classList.remove('hash-home-entering');
    if (reducedMotion.matches) return;
    void app.offsetWidth;
    app.classList.add('hash-home-entering');
    homeEntranceTimer = window.setTimeout(() => app.classList.remove('hash-home-entering'), 1500);
  };

  const stopContactMotion = () => {
    clearTimeout(contactEntranceTimer);
    contactRevealObserver?.disconnect();
    contactRevealObserver = undefined;
    const page = app.querySelector('.hash-contact-page');
    page?.classList.remove('is-contact-entering');
    page?.querySelector('.contact-team')?.classList.remove('is-revealed');
    page?.querySelectorAll('.contact-scroll-reveal, .is-visible').forEach(target => {
      target.classList.remove('contact-scroll-reveal', 'is-visible');
    });
  };

  const setupContactReveals = () => {
    const page = app.querySelector('.hash-contact-page');
    if (!page) return;
    const team = page.querySelector('.contact-team');
    const targets = [...page.querySelectorAll('.contact-team-head, .contact-team-card')];
    if (!targets.length) return;
    if (reducedMotion.matches) {
      targets.forEach(target => target.classList.add('is-visible'));
      team?.classList.add('is-revealed');
      return;
    }
    // Keep the reveal line below the initial fold, but never beyond the page's reachable scroll range.
    const revealMargin = Math.max(64, Math.round(window.innerHeight * .14));
    contactRevealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('contact-team-head')) team?.classList.add('is-revealed');
        contactRevealObserver.unobserve(entry.target);
      });
    }, { rootMargin: `0px 0px -${revealMargin}px 0px`, threshold: .06 });
    targets.forEach(target => {
      target.classList.add('contact-scroll-reveal');
      contactRevealObserver.observe(target);
    });
  };

  const triggerContactEntrance = () => {
    const page = app.querySelector('.hash-contact-page');
    stopContactMotion();
    if (!page) return;
    setupContactReveals();
    if (reducedMotion.matches) return;
    void page.offsetWidth;
    page.classList.add('is-contact-entering');
    contactEntranceTimer = window.setTimeout(() => page.classList.remove('is-contact-entering'), 1100);
  };

  const cardGrid = items => `<div class="hash-info-grid">${items.map(([title, copy], index) => `<article class="hash-info-card"><small>${String(index + 1).padStart(2, '0')}</small><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;

  const updateAilyCaseThread = scene => {
    const thread = panels.flow.querySelector('.aily-case-thread');
    if (!thread || !scene) return;
    const fields = {
      current: scene.dataset.caseCurrent,
      confirmed: scene.dataset.caseConfirmed,
      unknown: scene.dataset.caseUnknown,
      next: scene.dataset.caseNext
    };
    Object.entries(fields).forEach(([field, value]) => {
      const target = thread.querySelector(`[data-case-${field}]`);
      if (target && value) target.textContent = value;
    });
  };

  const updateAilyNodeProgress = () => {
    ailyProgressFrame = undefined;
    const narrative = panels.flow.querySelector('.aily-narrative');
    const button = app.querySelector('.hash-route-node[data-node="aily"] .hash-node-button');
    if (!narrative || !button || currentNode !== 'aily') return;
    const narrativeTop = window.scrollY + narrative.getBoundingClientRect().top;
    const narrativeEnd = narrativeTop + narrative.offsetHeight - window.innerHeight;
    const distance = Math.max(1, narrativeEnd - narrativeTop);
    const progress = Math.max(0, Math.min(1, (window.scrollY - narrativeTop) / distance));
    const percent = Math.round(progress * 100);
    button.style.setProperty('--node-progress', `${percent}%`);
    setRouteButtonLabel('aily', percent);
  };

  const scheduleAilyNodeProgress = () => {
    if (ailyProgressFrame) return;
    ailyProgressFrame = window.requestAnimationFrame(updateAilyNodeProgress);
  };

  const stopAilyNarrative = () => {
    ailySceneObserver?.disconnect();
    if (ailyScrollListener) {
      window.removeEventListener('scroll', ailyScrollListener);
      window.removeEventListener('resize', ailyScrollListener);
      ailyScrollListener = undefined;
    }
    if (ailyProgressFrame) window.cancelAnimationFrame(ailyProgressFrame);
    ailyProgressFrame = undefined;
    const button = app.querySelector('.hash-route-node[data-node="aily"] .hash-node-button');
    button?.style.removeProperty('--node-progress');
    setRouteButtonLabel('aily');
  };

  const initAilyNarrative = () => {
    stopAilyNarrative();
    const scenes = [...panels.flow.querySelectorAll('[data-aily-scene]')];
    if (!scenes.length) return;
    const activate = scene => {
      scenes.forEach(item => item.classList.toggle('is-active', item === scene));
      app.dataset.activeAilyScene = scene.dataset.ailyScene;
      updateAilyCaseThread(scene);
    };
    activate(scenes[0]);
    ailySceneObserver = new IntersectionObserver(() => {
      const visible = sceneAtReadingLine(scenes);
      if (visible) activate(visible);
    }, { rootMargin: '-22% 0px -36% 0px', threshold: [.18, .4, .65] });
    scenes.forEach(scene => ailySceneObserver.observe(scene));
    ailyScrollListener = scheduleAilyNodeProgress;
    window.addEventListener('scroll', ailyScrollListener, { passive: true });
    window.addEventListener('resize', ailyScrollListener, { passive: true });
    scheduleAilyNodeProgress();
  };

  const renderGenericNarrative = definition => {
    const narrative = document.createElement('section');
    narrative.className = 'sn-narrative';
    narrative.dataset.narrativeNode = definition.id;
    const labels = definition.statusLabels || ['当前处理', '已经确认', '仍然未知', '下一步'];
    narrative.innerHTML = `
      <div class="sn-case-thread" aria-label="当前节点处理状态">
        <div class="sn-case-id"><div><span>PROCESS OBJECT</span><b>${definition.caseId}</b></div></div>
        ${labels.map((label, index) => `<div class="sn-case-state"><span>${label}</span><b data-sn-state="${['current', 'confirmed', 'unknown', 'next'][index]}">—</b></div>`).join('')}
      </div>
      <div class="sn-scenes">
        ${definition.scenes.map(scene => `
          <section class="sn-scene" data-sn-scene="${scene.id}" data-scene-number="${scene.number}"
            data-state-current="${scene.current}" data-state-confirmed="${scene.confirmed}"
            data-state-unknown="${scene.unknown}" data-state-next="${scene.next}">
            <header class="sn-scene-head sn-reveal">
              <span class="sn-scene-code">${scene.number} / ${scene.code}</span>
              <h3>${scene.title}</h3>
              <p>${scene.description}</p>
            </header>
            <div class="sn-visual sn-reveal" data-visual="${scene.visual}">${scene.body}</div>
          </section>`).join('')}
      </div>
      <div class="sn-handoff">
        <div><small>HANDOFF / 本节点正式交付</small><h3>${definition.handoff.output}</h3><p>${definition.handoff.condition}</p></div>
        <code>→ ${nodes[definition.handoff.nextId]?.title || definition.handoff.nextId}</code>
      </div>`;
    return narrative;
  };

  const updateGenericThread = scene => {
    const thread = panels.flow.querySelector('.sn-case-thread');
    if (!thread || !scene) return;
    const fields = {
      current: scene.dataset.stateCurrent,
      confirmed: scene.dataset.stateConfirmed,
      unknown: scene.dataset.stateUnknown,
      next: scene.dataset.stateNext
    };
    Object.entries(fields).forEach(([field, value]) => {
      const target = thread.querySelector(`[data-sn-state="${field}"]`);
      if (target) target.textContent = value || '—';
    });
  };

  const updateGenericNodeProgress = () => {
    genericProgressFrame = undefined;
    const narrative = panels.flow.querySelector('.sn-narrative');
    const button = app.querySelector(`.hash-route-node[data-node="${currentNode}"] .hash-node-button`);
    if (!narrative || !button || currentNode === 'aily') return;
    const narrativeTop = window.scrollY + narrative.getBoundingClientRect().top;
    const narrativeEnd = narrativeTop + narrative.offsetHeight - window.innerHeight;
    const distance = Math.max(1, narrativeEnd - narrativeTop);
    const progress = Math.max(0, Math.min(1, (window.scrollY - narrativeTop) / distance));
    const percent = Math.round(progress * 100);
    button.style.setProperty('--node-progress', `${percent}%`);
    setRouteButtonLabel(currentNode, percent);
  };

  const scheduleGenericNodeProgress = () => {
    if (genericProgressFrame) return;
    genericProgressFrame = window.requestAnimationFrame(updateGenericNodeProgress);
  };

  const stopGenericNarrative = () => {
    genericSceneObserver?.disconnect();
    genericSceneObserver = undefined;
    if (genericScrollListener) {
      window.removeEventListener('scroll', genericScrollListener);
      window.removeEventListener('resize', genericScrollListener);
      genericScrollListener = undefined;
    }
    if (genericProgressFrame) window.cancelAnimationFrame(genericProgressFrame);
    genericProgressFrame = undefined;
    app.querySelectorAll('.hash-route-node .hash-node-button').forEach(button => {
      if (button.closest('[data-node="aily"]')) return;
      button.style.removeProperty('--node-progress');
      setRouteButtonLabel(button.closest('.hash-route-node')?.dataset.node);
    });
  };

  const initGenericNarrative = () => {
    stopGenericNarrative();
    const scenes = [...panels.flow.querySelectorAll('[data-sn-scene]')];
    if (!scenes.length) return;
    const activate = scene => {
      scenes.forEach(item => item.classList.toggle('is-active', item === scene));
      app.dataset.activeNarrativeScene = scene.dataset.snScene;
      updateGenericThread(scene);
    };
    activate(scenes[0]);
    genericSceneObserver = new IntersectionObserver(() => {
      const visible = sceneAtReadingLine(scenes);
      if (visible) activate(visible);
    }, { rootMargin: '-22% 0px -36% 0px', threshold: [.18, .4, .65] });
    scenes.forEach(scene => genericSceneObserver.observe(scene));
    genericScrollListener = scheduleGenericNodeProgress;
    window.addEventListener('scroll', genericScrollListener, { passive: true });
    window.addEventListener('resize', genericScrollListener, { passive: true });
    scheduleGenericNodeProgress();
  };

  const setRouteProgress = nodeId => {
    const targetIndex = routeOrder.indexOf(nodeId);
    segments.forEach((segment, index) => {
      const [start, end] = routeRanges[index];
      const fill = Math.max(0, Math.min(1, (targetIndex - start) / (end - start)));
      segment.style.setProperty('--fill', fill);
    });
  };

  const settleRoute = nodeId => {
    const targetIndex = routeOrder.indexOf(nodeId);
    let activeButton;
    routeNodes.forEach((routeNode, index) => {
      const active = index === targetIndex;
      routeNode.classList.toggle('is-reached', index <= targetIndex);
      routeNode.classList.toggle('is-active', active);
      const button = routeNode.querySelector('button');
      setRouteButtonLabel(routeNode.dataset.node);
      if (active) {
        activeButton = button;
        button.setAttribute('aria-current', 'step');
      } else button.removeAttribute('aria-current');
    });
    if (document.activeElement?.classList.contains('hash-node-button') && document.activeElement !== activeButton) {
      document.activeElement.blur();
    }
    window.requestAnimationFrame(() => activeButton?.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center'
    }));
  };

  const selectTab = tabId => {
    Object.entries(panels).forEach(([id, panel]) => { panel.hidden = id !== tabId; });
    if (app.classList.contains('is-generic-narrative')) {
      if (tabId === 'flow') window.requestAnimationFrame(initGenericNarrative);
      else stopGenericNarrative();
    }
    window.requestAnimationFrame(setupScrollReveals);
  };

  const renderNode = nodeId => {
    const node = nodes[nodeId];
    const isAilyNarrative = nodeId === 'aily';
    const genericDefinition = window.ShengnongNodeNarratives?.[nodeId];
    const isGenericNarrative = Boolean(genericDefinition);
    currentNode = nodeId;
    app.classList.toggle('is-aily-narrative', isAilyNarrative);
    app.classList.toggle('is-generic-narrative', isGenericNarrative);
    if (!isAilyNarrative) {
      stopAilyNarrative();
      delete app.dataset.activeAilyScene;
    }
    if (!isGenericNarrative) {
      stopGenericNarrative();
      delete app.dataset.activeNarrativeScene;
    }
    const phaseColor = { info: 'blue', agent: 'orange', execute: 'violet', risk: 'amber', feedback: 'green' }[node.phase];
    app.style.setProperty('--active-color', `var(--route-${phaseColor})`);
    app.querySelector('[data-node-code]').textContent = node.code;
    app.querySelector('[data-node-title]').textContent = node.title;
    app.querySelector('[data-node-summary]').textContent = node.summary;
    app.querySelector('[data-node-output]').textContent = node.output;
    app.querySelector('[data-node-output-copy]').textContent = isAilyNarrative
      ? '本节点从决策底座的结构化事件包开始，逐幕呈现有界调查循环，并在最终一幕交付给人工决策。'
      : '本页产物是下一节点的正式输入，九个页面共同构成一条连续的经营数据与责任链。';
    if (isAilyNarrative) {
      const template = document.getElementById('aily-narrative-template');
      panels.flow.replaceChildren(template.content.cloneNode(true));
    } else if (isGenericNarrative) {
      panels.flow.replaceChildren(renderGenericNarrative(genericDefinition));
    } else panels.flow.replaceChildren(node.source);
    app.querySelector('[data-next-condition]').textContent = node.nextCondition;
    app.querySelector('[data-action="next"]').textContent = `进入${nodes[node.next].title} →`;
    selectTab('flow');
    if (isAilyNarrative) window.requestAnimationFrame(initAilyNarrative);
    if (isGenericNarrative && !genericSceneObserver) window.requestAnimationFrame(initGenericNarrative);
    setRouteProgress(nodeId);
    settleRoute(nodeId);
    window.requestAnimationFrame(syncStickyOffset);
    triggerNodeEntrance();
  };

  const parseRoute = () => {
    if (!location.hash || location.hash === '#home') return { view: 'home' };
    if (location.hash === '#contact') return { view: 'contact' };
    const nodeId = routeOrder.find(id => nodes[id].route === location.hash);
    return nodeId ? { view: 'detail', nodeId } : { view: 'home' };
  };

  const renderRoute = () => {
    clearTimeout(routeTimer);
    const route = parseRoute();
    if (route.view === 'home') {
      if (location.hash !== '#home') history.replaceState(null, '', '#home');
      stopContactMotion();
      stopAilyNarrative();
      stopGenericNarrative();
      app.classList.remove('is-aily-narrative');
      app.classList.remove('is-generic-narrative');
      app.dataset.view = 'home';
      document.title = '圣农经营智能中枢 · 终局架构蓝图';
      triggerHomeEntrance();
      completeRoute(app.querySelector('.hash-home h2'));
      return;
    }
    if (route.view === 'contact') {
      stopAilyNarrative();
      stopGenericNarrative();
      app.classList.remove('is-aily-narrative');
      app.classList.remove('is-generic-narrative');
      delete app.dataset.activeAilyScene;
      delete app.dataset.activeNarrativeScene;
      app.dataset.view = 'contact';
      document.title = '联系我们 · 刘清源';
      completeRoute(document.getElementById('contact-title'));
      triggerContactEntrance();
      return;
    }
    stopContactMotion();
    app.dataset.view = 'detail';
    renderNode(route.nodeId);
    document.title = `${nodes[route.nodeId].title} · 圣农经营智能中枢`;
    completeRoute(app.querySelector('[data-node-title]'));
  };

  const navigateNode = nodeId => {
    if (!nodes[nodeId] || nodeId === currentNode) return;
    clearTimeout(routeTimer);
    if (app.dataset.view !== 'detail' || reducedMotion.matches) {
      location.hash = nodes[nodeId].route;
      return;
    }
    setRouteProgress(nodeId);
    routeTimer = window.setTimeout(() => { location.hash = nodes[nodeId].route; }, 580);
  };

  routeNodes.forEach(routeNode => routeNode.querySelector('button').addEventListener('click', () => navigateNode(routeNode.dataset.node)));
  app.querySelectorAll('[data-action="home"], [data-action="back-home"]').forEach(button => button.addEventListener('click', () => { location.hash = '#home'; }));
  app.querySelectorAll('[data-action="scheme"], [data-action="explore"]').forEach(button => button.addEventListener('click', () => { location.hash = nodes.collection.route; }));
  app.querySelectorAll('[data-action="contact"]').forEach(button => button.addEventListener('click', () => { location.hash = '#contact'; }));
  app.querySelector('[data-action="next"]').addEventListener('click', () => navigateNode(nodes[currentNode].next));
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('resize', syncStickyOffset, { passive: true });

  if (!location.hash || (location.hash !== '#home' && location.hash !== '#contact' && !routeOrder.some(id => nodes[id].route === location.hash))) {
    history.replaceState(null, '', '#home');
  }
  renderRoute();
})();
