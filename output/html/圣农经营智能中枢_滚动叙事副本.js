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
      route: '#node/collection', code: '01 / COLLECTION', title: '信息采集层', phase: 'info', output: '原始证据包',
      summary: '从 SAP、POS、CRM、WMS、飞书与外部市场取得带来源、时间、权限和质量状态的经营事实。',
      next: 'transport', nextCondition: '原始证据包成为“数据传输层”的前置条件',
      source: document.getElementById('collection'),
      contract: [['输入', 'SAP、POS、CRM、WMS、飞书与合法外部市场的原始记录'], ['输出', 'source、entity、occurred_at、payload、quality、lineage、hash'], ['缺口', '无法取得的券承担方、审批版本和现场证明必须显式标记 unknown'], ['责任', '源系统负责人确认接口；业务人员只补现场证据，不改写原始记录']],
      technology: [['接口优先', 'API、Webhook、变更通知；无接口时才使用审计文件或受控轮询'], ['证据保真', '原始快照、schema version、payload hash、访问范围与采集时间同时保存'], ['外部市场', '合法公开源按来源白名单、频率、版权和质量等级进入'], ['实时触发', '到达即生成最小信号，确定性规则只负责暴露，不替 Agent 定性']],
      acceptance: [['可追溯', '任一字段都能回到原始系统、原始时间和原始版本'], ['不补零', '缺失、延迟和无权限分别标记，不把未知写成零'], ['最小权限', '采集账号只读取授权对象与字段'], ['租户事实', '接口名称、字段、频率和 owner 仍需圣农 IT E2E 验证']]
    },
    transport: {
      route: '#node/transport', code: '02 / TRANSPORT', title: '数据传输层', phase: 'info', output: '可重放的标准证据流',
      summary: '通过 API、Webhook、AnyCross、受控 CDC 或文件交换可靠搬运证据，不承担经营判断。',
      next: 'foundation', nextCondition: '标准证据流成为“企业数据与决策底座”的前置条件',
      source: document.getElementById('transport'),
      contract: [['输入', '带 hash、schema 与来源的原始证据包'], ['输出', '幂等、排序、可重放并附带 lineage 的标准证据流'], ['失败', '重试、死信、补偿和人工重放状态必须可见'], ['边界', 'AnyCross 是集成通道，不是事实库、语义层或规则引擎']],
      technology: [['接入网关', 'API Gateway、Webhook Receiver、SFTP、受控 CDC 与内网代理'], ['可靠传输', 'idempotency key、重试退避、死信队列、顺序键与限流'], ['数据合同', 'schema registry、版本兼容、敏感字段脱敏与质量标记'], ['可观测性', '延迟、吞吐、失败率、重放次数与 lineage 全链路记录']],
      acceptance: [['幂等', '相同证据重复送达不会生成两个经营事实'], ['可重放', '失败批次可以按 event_id 和时间窗重放'], ['不判断', '传输故障不得被解释为经营异常'], ['租户事实', '连接器、吞吐、重试上限和 SLA 必须在目标租户验证']]
    },
    foundation: {
      route: '#node/foundation', code: '03 / FOUNDATION', title: '企业数据与决策底座', phase: 'info', output: '可查询的企业上下文',
      summary: '统一业务对象、指标口径、规则、例外、事件状态和确定性计算，为 Agent 提供被解释的企业世界。',
      next: 'aily', nextCondition: '企业上下文成为“Aily Agent 调查”的前置条件',
      source: document.getElementById('foundation'),
      contract: [['输入', '可重放的标准证据流和主数据映射'], ['输出', '统一对象、暗知识、规则版本、event_id 与受控动作'], ['语义', 'SKU、门店、区域、到手价、库存、活动、里程碑和责任链统一命名'], ['状态', '事件调查、审批、任务、回读、关闭与重开跨天保存']],
      technology: [['原始证据库', '保存原始快照和 lineage，不替代 SAP/POS 正式账'], ['语义注册', '实体解析、指标口径、维度、例外、责任人与权限声明'], ['规则服务', '阈值、时间窗、合法活动、里程碑门和确定性校验'], ['情景服务', '价格、销量、毛利、库存、存栏和产能影响由确定性模型计算']],
      acceptance: [['业务概念优先', 'Agent 查询业务工具，不直接理解物理表和字段'], ['版本化', '语义、规则、模型和动作声明均有版本与回归样本'], ['可复算', '相同输入、版本和参数得到相同结果'], ['长期治理', '业务 owner、数据 owner 与 AI owner 共同处理语义变更']]
    },
    aily: {
      route: '#node/aily', code: '04 / AILY RUNTIME', title: '飞书 Aily：唯一 Agent 运行时', phase: 'agent', output: '决策就绪事件包',
      summary: '按统一事件受理 Skill 运行有界调查循环，并行调用领域 MCP 与责任人补数，直到证据达标或明确转人工。',
      next: 'decision', nextCondition: '决策就绪事件包成为“人工决策”的前置条件',
      source: document.getElementById('agent-config'),
      contract: [['输入', 'event_id、最小异常信号、可见范围与当前语义版本'], ['输出', '事实、未知、原因假设、影响、方案、约束和引用组成的决策就绪包'], ['循环', '局部 → 区域 → 跨域 → 战略；每轮只查询区分当前假设所需的最小证据'], ['并行补数', '系统查询与飞书责任人请求并行，缺失字段、已读状态和预计时间透明']],
      technology: [['统一受理 Skill', '读取已知/未知、建立互斥假设、选择调查等级和停止条件'], ['领域 Skill', '价格、库存、渠道、供应链和市场风险采用不同处理方法'], ['五域 MCP', '销售、供应、生产、财务/风险、组织知识均通过权限网关查询'], ['中间态', '调查计划、证据请求、事件包版本和工具结果可检查、可回滚']],
      acceptance: [['有界运行', '达到证据门槛、预算/时间上限或权限阻塞时必须停止'], ['引用事实', '每个结论引用来源、时间、口径和质量状态'], ['不直连', 'Agent 不直接访问数据库，不绕过 MCP 权限与审计'], ['不拍板', '价格、存栏、产能和市场进入只形成方案，不自动批准']]
    },
    decision: {
      route: '#node/decision', code: '05 / HUMAN DECISION', title: '人工决策与方案审批', phase: 'execute', output: '带 approval_id 的决定',
      summary: '管理层审阅证据、多情景方案和风险边界，批准后才允许拆解任务或写回正式系统。',
      next: 'milestone', nextCondition: '批准后的决定成为“里程碑执行”的前置条件',
      source: document.getElementById('price-case'),
      contract: [['输入', '决策就绪事件包、价格/销量/毛利/库存情景和风险约束'], ['输出', 'approval_id、decision_version、批准人、生效期、预算、停止条件与回滚条件'], ['可修改', '管理层可以调整范围、参数和方案后再批准'], ['禁止', 'Agent 不批准价格、存栏、产能、市场进入或资金承诺']],
      technology: [['审批卡片', '证据摘要、多方案比较、未知字段、权限边界和建议动作同屏'], ['责任网关', '审批人、代理人、会签顺序、超时、撤回与版本冲突控制'], ['写回门', '服务端再次校验 approval_id、版本、范围和生效期'], ['审计', '保留原方案、修改内容、批准理由与后续结果']],
      acceptance: [['证据门槛', '关键字段 unknown 时显示影响并限制可批准动作'], ['版本一致', '过期事件包或被修改的参数不得沿用旧 approval_id'], ['可回滚', '价格与任务写回均有停止条件和补偿路径'], ['责任清晰', '最终决策人和执行责任人不能由模型替代']]
    },
    milestone: {
      route: '#node/milestone', code: '06 / MILESTONE GATE', title: '里程碑质量门', phase: 'execute', output: '可验证的执行状态',
      summary: '依据 SAP、TMS、WMS、POS 正式状态，在正确业务节点与宽限期之后执行质量检测。',
      next: 'coaching', nextCondition: '可验证执行状态成为“岗位辅导与追责”的上下文',
      source: document.getElementById('milestones'),
      contract: [['输入', '批准决定、责任任务、源系统正式状态、预计时间与宽限窗口'], ['输出', 'process_id、milestone_id、当前状态、完成证据、阻塞与质量门结果'], ['顺序', '出库 → 到货 → 门店登记 → 上架可售 → 价格验证'], ['原则', '里程碑未到只监控进度；达到并过宽限期后才检查质量']],
      technology: [['状态映射', 'SAP/TMS/WMS/POS 单据与状态码映射为标准里程碑'], ['事件恢复', '审批和源系统状态事件按 event_id/process_id 恢复 Workflow'], ['质量门调度', '节点到达后启动宽限计时，再运行对应检测'], ['异常分流', '进度阻塞与执行质量异常分开建案、分开定责']],
      acceptance: [['零提前误报', '运输中或登记中不得报告未上架、未标价'], ['正式证据', '不以聊天回复代替源系统完成状态'], ['补偿可见', '状态回退、取消、重派和人工修正均保留历史'], ['租户事实', '真实状态码、宽限期、例外与 owner 需业务负责人确认']]
    },
    coaching: {
      route: '#node/coaching', code: '07 / OWNER ENABLEMENT', title: '责任到人与岗位辅导', phase: 'execute', output: '人员完成证据',
      summary: '把任务、完成标准、岗位职责、历史案例和追问入口交付给责任人，缩短业务人员成才周期。',
      next: 'feedback', nextCondition: '人员完成证据成为“结果验证与校准”的输入',
      source: document.getElementById('coaching'),
      contract: [['输入', '责任任务、岗位、资历、当前里程碑、SOP 与已验证历史案例'], ['输出', '现场证据、执行动作、追问记录、升级记录与学习结果'], ['新人模式', '责任人可主动声明“我是新入职人员”，获得职责、第一步和完成标准'], ['责任', 'Agent 提供上下文和方法，不代替员工确认现场事实或承诺结果']],
      technology: [['任务会话', 'event_id、task_id、岗位、权限和当前里程碑绑定在同一上下文'], ['岗位 Skill', '只检索适用版本的职责、SOP、案例和升级矩阵'], ['引用与追问', '每个回答给来源、版本和下一步，允许继续追问'], ['成长指标', '首次正确率、返工率、独立完成周期和升级质量']],
      acceptance: [['责任到人', '任务必须有负责人、截止时间、完成证据和升级对象'], ['来源可查', '指导引用制度、Skill 或已验证案例，不输出无来源经验'], ['权限一致', '新人不会因辅导获得超出岗位的查询或写入权限'], ['不替代负责', 'Agent 不替员工确认事实、审批或签署完成']]
    },
    feedback: {
      route: '#node/feedback', code: '08 / FEEDBACK', title: '结果验证、校准与知识沉淀', phase: 'feedback', output: '新一轮经营事实',
      summary: '回读价格、销量、库存和投诉，关闭、升级或重开事件，并把有效经验版本化回写到语义、规则与 Skill。',
      next: 'collection', nextCondition: '新经营事实返回“信息采集层”，形成下一轮闭环',
      source: feedbackSource,
      contract: [['输入', '批准方案、任务证据、价格、sell-out、库存、投诉和竞品新数据'], ['输出', 'close、escalate 或 reopen，以及规则/语义/Skill 的候选变更'], ['时间窗', '按 6/24/48/72 小时或业务配置回读，不以任务关单替代经营恢复'], ['闭环', '结果成为新的经营事实，重新进入信息采集和证据链']],
      technology: [['结果回读', '按 event_id 聚合业务结果、执行证据和外部市场新信号'], ['目标对照', '比较基线、目标、预算、停止条件和数据质量'], ['版本治理', '有效经验先形成候选变更，经 owner 审核和回归后发布'], ['监控指标', '复发率、重开率、动销恢复、毛利恢复和独立完成周期']],
      acceptance: [['结果导向', '只有经营指标恢复或达到批准目标才关闭'], ['失败可学', '失败边界、误判原因和缺失证据进入回归样本'], ['变更受控', '模型不能自动修改生产规则、语义或 Skill'], ['完整边界', '权限、审计、租户事实和外部 Agent 升级条件持续可见']]
    }
  };

  const routeOrder = Object.keys(nodes);
  const routeRanges = [[0, 2], [2, 3], [3, 6], [6, 7]];
  const app = document.getElementById('hash-app');
  const routeNodes = [...app.querySelectorAll('.hash-route-node')];
  const segments = [...app.querySelectorAll('.route-segment')];
  const panels = Object.fromEntries([...app.querySelectorAll('[data-node-panel]')].map(panel => [panel.dataset.nodePanel, panel]));
  const tabs = [...app.querySelectorAll('[data-node-tab]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentNode = 'collection';
  let routeTimer;
  let entranceTimer;
  let homeEntranceTimer;
  let revealObserver;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  };

  const setupScrollReveals = () => {
    revealObserver?.disconnect();
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
    homeEntranceTimer = window.setTimeout(() => app.classList.remove('hash-home-entering'), 1400);
  };

  const cardGrid = items => `<div class="hash-info-grid">${items.map(([title, copy], index) => `<article class="hash-info-card"><small>${String(index + 1).padStart(2, '0')}</small><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;

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
    tabs.forEach(tab => {
      const active = tab.dataset.nodeTab === tabId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    Object.entries(panels).forEach(([id, panel]) => { panel.hidden = id !== tabId; });
    window.requestAnimationFrame(setupScrollReveals);
  };

  const renderNode = nodeId => {
    const node = nodes[nodeId];
    currentNode = nodeId;
    app.style.setProperty('--active-color', `var(--route-${node.phase === 'info' ? 'blue' : node.phase === 'agent' ? 'orange' : node.phase === 'execute' ? 'violet' : 'green'})`);
    app.querySelector('[data-node-code]').textContent = node.code;
    app.querySelector('[data-node-title]').textContent = node.title;
    app.querySelector('[data-node-summary]').textContent = node.summary;
    app.querySelector('[data-node-output]').textContent = node.output;
    panels.flow.replaceChildren(node.source);
    panels.contract.innerHTML = cardGrid(node.contract);
    panels.technology.innerHTML = cardGrid(node.technology);
    panels.acceptance.innerHTML = cardGrid(node.acceptance);
    app.querySelector('[data-next-condition]').textContent = node.nextCondition;
    app.querySelector('[data-action="next"]').textContent = `进入${nodes[node.next].title} →`;
    selectTab('flow');
    setRouteProgress(nodeId);
    settleRoute(nodeId);
    triggerNodeEntrance();
  };

  const parseRoute = () => {
    if (!location.hash || location.hash === '#home') return { view: 'home' };
    const nodeId = routeOrder.find(id => nodes[id].route === location.hash);
    return nodeId ? { view: 'detail', nodeId } : { view: 'home' };
  };

  const renderRoute = () => {
    clearTimeout(routeTimer);
    const route = parseRoute();
    if (route.view === 'home') {
      if (location.hash !== '#home') history.replaceState(null, '', '#home');
      app.dataset.view = 'home';
      document.title = '圣农经营智能中枢 · 终局架构蓝图';
      triggerHomeEntrance();
      resetScroll();
      return;
    }
    app.dataset.view = 'detail';
    renderNode(route.nodeId);
    document.title = `${nodes[route.nodeId].title} · 圣农经营智能中枢`;
    resetScroll();
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
  tabs.forEach(tab => tab.addEventListener('click', () => selectTab(tab.dataset.nodeTab)));
  app.querySelectorAll('[data-action="home"], [data-action="back-home"]').forEach(button => button.addEventListener('click', () => { location.hash = '#home'; }));
  app.querySelectorAll('[data-action="scheme"], [data-action="explore"]').forEach(button => button.addEventListener('click', () => { location.hash = nodes.collection.route; }));
  app.querySelector('[data-action="next"]').addEventListener('click', () => navigateNode(nodes[currentNode].next));
  window.addEventListener('hashchange', renderRoute);

  if (!location.hash || (location.hash !== '#home' && !routeOrder.some(id => nodes[id].route === location.hash))) {
    history.replaceState(null, '', '#home');
  }
  renderRoute();
})();
