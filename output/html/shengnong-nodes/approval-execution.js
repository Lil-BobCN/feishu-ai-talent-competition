window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.decision = {
  id: 'decision',
  caseId: 'DECISION-001',
  bridge: {
    from: '决策就绪材料和备选方案',
    to: '审批结果'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'decision-intake',
      number: '01',
      code: 'DECISION INTAKE',
      title: '先看清材料，再进入审批',
      description: '管理者收到的不是一句建议，而是一份把事实、推断、证据缺口、备选方案、影响和风险分开的决策材料。',
      current: '核对决策材料是否足以审议',
      confirmed: '事实、推断、方案和风险已经分栏',
      unknown: '缺失信息是否会改变方案选择',
      next: '明确这次审批允许决定的范围',
      visual: 'decision-dossier',
      body: `
        <div class="sn-visual sn-decision-dossier" aria-label="决策材料由事实、推断、缺口和方案组成">
          <div class="sn-dossier-head">
            <span class="sn-kicker">DECISION-READY</span>
            <strong class="sn-dossier-title">同一份材料，四类信息不混写</strong>
            <span class="sn-badge sn-badge-partial">partial / 待管理审议</span>
          </div>
          <div class="sn-dossier-grid">
            <article class="sn-panel sn-panel-verified"><small class="sn-label">事实</small><b>可回到来源与时间</b><p>正式系统记录、已核实补证和可复算结果。</p></article>
            <article class="sn-panel"><small class="sn-label">推断</small><b>说明依据，不冒充事实</b><p>原因判断和影响分析保留适用条件。</p></article>
            <article class="sn-panel sn-panel-warning"><small class="sn-label">缺口</small><b>会改变选择就必须显式</b><p>证据不足时不由系统自行补齐。</p></article>
            <article class="sn-panel"><small class="sn-label">方案</small><b>多个可比较选项</b><p>列出影响、风险、预算和可恢复方式。</p></article>
          </div>
        </div>`
    },
    {
      id: 'decision-boundary',
      number: '02',
      code: 'SCOPE & CONTROL',
      title: '把批准内容写成可执行边界',
      description: '审批不是只点“同意”。管理者需要明确适用对象、数量或预算、有效时间、经营目标、停止条件和恢复办法。',
      current: '定义决策适用范围与控制条件',
      confirmed: '审批对象和候选方案已经明确',
      unknown: '目标租户的预算口径与观察窗口待企业核实',
      next: '校验审批人是否有权批准这些动作',
      visual: 'decision-boundary',
      body: `
        <div class="sn-visual sn-boundary-board" aria-label="决策范围与控制条件">
          <div class="sn-boundary-core">
            <span class="sn-kicker">DECISION VERSION / DRAFT</span>
            <strong>边界先于授权</strong>
            <p>任何正式执行都不得超出本版本记录的范围。</p>
          </div>
          <div class="sn-boundary-items">
            <div class="sn-control-item"><small>适用对象</small><b>法人 · 区域 · 渠道 · SKU</b></div>
            <div class="sn-control-item"><small>数量与预算</small><b>上限必须可核对</b></div>
            <div class="sn-control-item"><small>时间</small><b>生效日 · 到期日 · 观察窗口</b></div>
            <div class="sn-control-item"><small>停止条件</small><b>触发即停止扩大执行</b></div>
            <div class="sn-control-item"><small>恢复办法</small><b>保留 rollback_plan_id</b></div>
            <div class="sn-control-item sn-control-unknown"><small>待企业核实</small><b>真实阈值、预算口径和审批层级</b></div>
          </div>
        </div>`
    },
    {
      id: 'decision-authority',
      number: '03',
      code: 'HUMAN AUTHORITY GATE',
      title: '高影响决策必须由有权管理者拍板',
      description: '程序可以校验材料、权限和确定性条件，Aily 可以组织材料；价格、存栏、产能、库存和市场进入等高影响决策不能自动批准。',
      current: '核对审批人、法人范围和动作权限',
      confirmed: '系统只提供辅助判断，不拥有审批权',
      unknown: '目标租户实际审批层级和授权矩阵待验证',
      next: '由有权管理者选择批准、修改或驳回',
      visual: 'human-authority-gate',
      body: `
        <div class="sn-visual sn-authority-gate" aria-label="高影响经营动作的人工审批门">
          <div class="sn-role-lane"><span class="sn-role-mark">程序</span><b>校验范围、版本、预算和权限</b><small>确定性检查</small></div>
          <div class="sn-role-lane"><span class="sn-role-mark">Aily</span><b>归纳证据、比较方案、组织材料</b><small>决策支持</small></div>
          <div class="sn-gate-lock"><span class="sn-lock-label">HUMAN GATE</span><strong>管理者授权</strong><p>未经批准，正式经营写入必须被服务端拒绝。</p></div>
          <div class="sn-risk-actions">
            <span>价格</span><span>存栏</span><span>产能</span><span>库存</span><span>市场进入</span>
          </div>
        </div>`
    },
    {
      id: 'decision-branches',
      number: '04',
      code: 'APPROVAL BRANCH',
      title: '一次审批，保留三条清晰分支',
      description: '批准生成执行授权；要求修改带着意见退回材料；驳回记录理由并停止本版本。系统不能把退回或驳回重新解释成“已批准”。',
      current: '记录管理者的正式审批结果',
      confirmed: '审批版本、审批人和审计信息已经绑定',
      unknown: '管理者尚未选择本版本分支',
      next: '只让批准分支生成正式决策版本',
      visual: 'decision-branch-loop',
      body: `
        <div class="sn-visual sn-branch-flow" aria-label="批准、要求修改和驳回三条审批分支">
          <div class="sn-branch-source"><small>DECISION VERSION</small><strong>等待人工决定</strong><span>同一版本 · 同一审计链</span></div>
          <div class="sn-branch-lines" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="sn-branch-options">
            <article class="sn-branch sn-branch-approved"><span>APPROVED</span><b>批准</b><p>形成 approval_id 与执行授权。</p><small>进入责任执行</small></article>
            <article class="sn-branch sn-branch-change"><span>CHANGE REQUESTED</span><b>要求修改</b><p>携带修改意见退回决策材料。</p><small>修订后重新审批</small></article>
            <article class="sn-branch sn-branch-rejected"><span>REJECTED</span><b>驳回</b><p>记录理由，本版本不得执行。</p><small>关闭或重新调查</small></article>
          </div>
        </div>`
    },
    {
      id: 'decision-version',
      number: '05',
      code: 'FORMAL DECISION',
      title: '批准结果成为唯一可下发的正式版本',
      description: '系统保存 approval_id、decision_version、适用范围、生效时间和控制条件。只有状态为 approved 且仍在有效期内，下一节点才可拆分任务。',
      current: '固化审批结果与执行授权',
      confirmed: '批准、修改或驳回状态均已可追溯',
      unknown: '企业真实审批样本和修改记录尚待试点取得',
      next: '将有效批准交给责任执行节点',
      visual: 'formal-decision-card',
      body: `
        <div class="sn-visual sn-formal-decision" aria-label="正式决策版本及其执行条件">
          <div class="sn-version-stamp"><span>APPROVAL STATUS</span><strong>approved</strong><small>仅示意合同状态，不代表目标租户已运行</small></div>
          <dl class="sn-contract-list">
            <div><dt>approval_id</dt><dd>绑定审批人与审计记录</dd></div>
            <div><dt>decision_version</dt><dd>执行引用的唯一版本</dd></div>
            <div><dt>scope</dt><dd>法人、区域、渠道、SKU</dd></div>
            <div><dt>controls</dt><dd>预算、有效期、停止条件、恢复办法</dd></div>
          </dl>
          <div class="sn-contract-gate"><b>进入下一节点的条件</b><span>approved + 权限有效 + 版本有效 + 范围匹配</span></div>
        </div>`
    }
  ],
  handoff: {
    output: '经批准的正式决策版本',
    nextId: 'execution',
    condition: '只有有权管理者批准且 approval_id、decision_version、适用范围和有效期均通过校验，才能进入责任执行'
  }
};

window.ShengnongNodeNarratives.execution = {
  id: 'execution',
  caseId: 'EXECUTION-001',
  bridge: {
    from: '有效审批结果',
    to: '责任任务、协同关系、岗位指导和验收依据'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'execution-validate',
      number: '01',
      code: 'VALIDATE APPROVAL',
      title: '先验证授权，再生成任务',
      description: '责任执行从有效审批开始。系统先核对 approval_id、决策版本、状态、适用范围、有效期和当前权限，任一条件不符都不能下发。',
      current: '校验本次执行能否引用该审批',
      confirmed: '已收到带版本的审批结果',
      unknown: '当前任务是否完全落在批准范围内',
      next: '按批准内容生成任务草案',
      visual: 'approval-validation',
      body: `
        <div class="sn-visual sn-validation-gate" aria-label="执行前的审批有效性校验">
          <div class="sn-input-chip"><span>输入</span><b>approval_id + decision_version</b></div>
          <div class="sn-validation-list">
            <div class="sn-check-row"><span>审批状态</span><b>approved</b><em>通过才继续</em></div>
            <div class="sn-check-row"><span>版本与有效期</span><b>当前有效</b><em>过期即停止</em></div>
            <div class="sn-check-row"><span>法人和业务范围</span><b>不得越界</b><em>逐任务校验</em></div>
            <div class="sn-check-row"><span>当前操作权限</span><b>服务端复核</b><em>不信任历史快照</em></div>
          </div>
          <div class="sn-deny-strip"><strong>change_requested / rejected / revoked</strong><span>不产生执行授权</span></div>
        </div>`
    },
    {
      id: 'execution-decompose',
      number: '02',
      code: 'TASK ORCHESTRATION',
      title: '把一个批准版本拆成可追责的工作',
      description: '系统依据业务模板生成任务草案，再由流程责任人确认。销售、库存、生产、养殖、财务和海外业务只在批准范围实际涉及它们时进入任务网。',
      current: '将正式决策版本拆成任务草案',
      confirmed: '执行范围、预算和停止条件来自同一批准版本',
      unknown: '目标企业实际模板和部门分工待样本校准',
      next: '为每项任务补齐责任、依赖和验收依据',
      visual: 'task-decomposition',
      body: `
        <div class="sn-visual sn-task-decomposition" aria-label="正式决策拆分为多部门任务草案">
          <div class="sn-decision-node"><small>APPROVED DECISION</small><strong>正式决策版本</strong><span>范围、预算、时限、停止与恢复</span></div>
          <div class="sn-task-spine" aria-hidden="true"></div>
          <div class="sn-task-grid">
            <article class="sn-task-node"><span>销售</span><b>渠道与门店动作</b></article>
            <article class="sn-task-node"><span>库存</span><b>备货与批次协调</b></article>
            <article class="sn-task-node"><span>生产</span><b>计划与交付约束</b></article>
            <article class="sn-task-node"><span>养殖</span><b>供给周期协同</b></article>
            <article class="sn-task-node"><span>财务</span><b>预算与结果口径</b></article>
            <article class="sn-task-node"><span>海外业务</span><b>仅在批准范围涉及时</b></article>
          </div>
          <p class="sn-boundary-note">任务草案不扩大原审批范围；企业真实责任分工需用跨部门样本核实。</p>
        </div>`
    },
    {
      id: 'execution-contract',
      number: '03',
      code: 'RESPONSIBILITY CONTRACT',
      title: '每项任务都能回答“谁、何时、凭什么完成”',
      description: '任务必须写清负责人、配合人、前置任务、完成标准、截止时间、所需证据和延误后的升级路径，不能用一段群通知代替责任合同。',
      current: '补齐任务责任与验收合同',
      confirmed: '任务草案已经绑定决策版本',
      unknown: '负责人、时限和升级对象需流程责任人确认',
      next: '判断任务需要卡片还是事件协同群',
      visual: 'task-contract',
      body: `
        <div class="sn-visual sn-task-contract" aria-label="责任任务的关键字段">
          <div class="sn-task-card-head"><span class="sn-kicker">TASK / DRAFT</span><strong>一项任务，一条清晰责任链</strong><span class="sn-badge sn-badge-partial">待流程确认</span></div>
          <div class="sn-task-fields">
            <div><small>负责人</small><b>owner_role + owner_user_id</b></div>
            <div><small>配合人</small><b>必要角色与权限范围</b></div>
            <div><small>前置任务</small><b>dependencies</b></div>
            <div><small>完成标准</small><b>acceptance + required_evidence</b></div>
            <div><small>时限</small><b>deadline</b></div>
            <div><small>升级路径</small><b>escalation_to</b></div>
          </div>
          <div class="sn-task-rule"><span>正式状态</span><b>draft &rarr; assigned &rarr; accepted &rarr; submitted &rarr; verified / rejected</b></div>
        </div>`
    },
    {
      id: 'execution-collaboration',
      number: '04',
      code: 'CONTROLLED COLLABORATION',
      title: '按协作需要建群，不为每项任务建群',
      description: '两个以上主要责任角色或跨部门、跨法人事项，在权限校验后建立最小成员事件协同群；单人任务只发任务卡。',
      current: '选择最小必要的协作方式',
      confirmed: '任务责任链和参与角色已经列明',
      unknown: '飞书建群、加人和机器人权限待目标租户验证',
      next: '向责任人提供与岗位匹配的执行指导',
      visual: 'collaboration-router',
      body: `
        <div class="sn-visual sn-collaboration-router" aria-label="单人任务与跨部门任务的协作分流">
          <div class="sn-router-question"><small>COLLABORATION GATE</small><strong>是否需要两个以上主要责任角色，或跨部门、跨法人协作？</strong></div>
          <div class="sn-router-paths">
            <article class="sn-route-card sn-route-single"><span>否</span><b>只发任务卡</b><p>减少无效群聊，责任和状态仍记录在任务系统。</p></article>
            <article class="sn-route-card sn-route-group"><span>是</span><b>权限校验后按需建群</b><p>只纳入当前阶段必须协作的内部人员，外部参与另行审批。</p></article>
          </div>
          <div class="sn-first-message">
            <small>协同群首条信息</small>
            <span>事件背景</span><span>已批准内容</span><span>负责人和截止时间</span><span>完成依据</span><span>权限限制</span><span>Aily 追问入口</span>
          </div>
          <p class="sn-boundary-note">群聊只承载协作；审批、任务状态、价格和库存等正式事实仍以授权系统为准。</p>
        </div>`
    },
    {
      id: 'execution-guidance',
      number: '05',
      code: 'ROLE-GUIDED ASSISTANCE',
      title: '新员工也能在责任边界内开始工作',
      description: '责任人可选择“我是新入职人员”。系统根据岗位、当前任务和权限，解释职责、步骤、所需证据、已审核案例和求助对象。',
      current: '为责任人提供岗位化任务指导',
      confirmed: '岗位、任务阶段和权限范围已经识别',
      unknown: '目标企业有效制度和已审核案例仍需接入',
      next: '责任人确认任务并按里程碑提交证据',
      visual: 'new-hire-guidance',
      body: `
        <div class="sn-visual sn-guidance-console" aria-label="新入职人员的岗位任务指导">
          <div class="sn-guidance-prompt"><span class="sn-person-mark">责任人</span><strong>我是新入职人员</strong></div>
          <div class="sn-guidance-response">
            <div class="sn-guidance-head"><small>ROLE-GUIDED TASK ASSISTANCE</small><b>只回答你当前有权执行的部分</b></div>
            <ol class="sn-guidance-steps">
              <li><span>01</span><b>岗位职责</b><small>这项任务中你负责什么</small></li>
              <li><span>02</span><b>操作步骤</b><small>按有效制度逐步执行</small></li>
              <li><span>03</span><b>所需证据</b><small>提交什么才能验收</small></li>
              <li><span>04</span><b>审核案例</b><small>参考相似已审核案例</small></li>
              <li><span>05</span><b>求助对象</b><small>遇到例外向谁升级</small></li>
            </ol>
          </div>
          <div class="sn-guidance-limit"><b>不能临时编造操作规程</b><span>没有有效制度或案例时，明确提示并转向求助对象。</span></div>
        </div>`
    },
    {
      id: 'execution-dispatch',
      number: '06',
      code: 'CONTROLLED DISPATCH',
      title: '任务下发后，等待正式业务状态',
      description: '流程负责人确认草案后，任务才进入 assigned。责任人认领、执行并提交证据；后续是否完成，不由群聊或口头汇报判定。',
      current: '下发已确认的责任任务',
      confirmed: '负责人、配合人、依赖、标准、时限和升级路径已登记',
      unknown: '业务系统状态映射和真实处理时限待企业样本核实',
      next: '交给业务里程碑节点跟踪正式状态',
      visual: 'controlled-dispatch',
      body: `
        <div class="sn-visual sn-dispatch-flow" aria-label="从任务确认到业务里程碑跟踪">
          <div class="sn-dispatch-stage"><small>01 / CONFIRM</small><b>流程责任人确认</b><span>模板、角色、依赖和验收依据</span></div>
          <div class="sn-flow-arrow" aria-hidden="true">&rarr;</div>
          <div class="sn-dispatch-stage"><small>02 / ASSIGN</small><b>负责人认领</b><span>任务卡或受控事件协同群</span></div>
          <div class="sn-flow-arrow" aria-hidden="true">&rarr;</div>
          <div class="sn-dispatch-stage sn-dispatch-next"><small>03 / WAIT</small><b>等待正式业务状态</b><span>源系统里程碑决定何时检查</span></div>
          <div class="sn-escalation-strip"><b>延误或阻塞</b><span>按预先登记的 escalation_to 升级，不由模型自行扩大权限。</span></div>
        </div>`
    }
  ],
  handoff: {
    output: '责任任务、协同关系、岗位指导和验收依据',
    nextId: 'milestone',
    condition: '任务已绑定有效 approval_id 和 decision_version，负责人、配合人、依赖、完成标准、截止时间、证据与升级路径均已确认'
  }
};

window.ShengnongNodeNarratives.milestone = {
  id: 'milestone',
  caseId: 'MILESTONE-001',
  bridge: {
    from: '责任任务状态和业务系统正式状态',
    to: '阶段验收、延误升级或重新执行结果'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'milestone-register',
      number: '01',
      code: 'MILESTONE REGISTER',
      title: '先定义什么时候才算到达业务节点',
      description: '每类流程都要登记进入条件、正式状态映射、完成证据、预计时长、宽限期、质量检查和失败分支，不能凭一句“已完成”启动验收。',
      current: '加载本任务的里程碑版本',
      confirmed: '任务已经绑定审批版本和验收依据',
      unknown: '源系统状态码、预计时长和宽限期待企业核实',
      next: '等待 SAP 出库或发运状态',
      visual: 'milestone-contract',
      body: `
        <div class="sn-visual sn-milestone-contract" aria-label="里程碑注册合同">
          <div class="sn-contract-head"><span class="sn-kicker">RETAIL LISTING / VERSION</span><strong>先登记门，再等待状态</strong><span class="sn-badge sn-badge-unknown">unknown / 待企业配置</span></div>
          <div class="sn-contract-grid">
            <div><small>进入条件</small><b>entry_condition</b></div>
            <div><small>正式状态映射</small><b>source_status_mapping</b></div>
            <div><small>完成证据</small><b>completion_evidence</b></div>
            <div><small>预计时长</small><b>expected_duration</b></div>
            <div><small>宽限期</small><b>grace_period</b></div>
            <div><small>质量检查</small><b>quality_checks</b></div>
            <div><small>失败分支</small><b>failure_branch</b></div>
            <div><small>补偿方案</small><b>compensation_plan</b></div>
          </div>
          <p class="sn-boundary-note">页面中的顺序来自母稿；目标租户真实接口、状态码和时间阈值必须用业务样本验证。</p>
        </div>`
    },
    {
      id: 'milestone-sap',
      number: '02',
      code: 'SAP DISPATCH',
      title: '第一站：SAP 已正式出库或发运',
      description: '任务下发不代表货物已经移动。只有授权业务系统出现匹配订单、批次和物流单号的出库或发运状态，流程才进入运输阶段。',
      current: '等待并核对 SAP 出库或发运记录',
      confirmed: '责任任务已经下发',
      unknown: '货物是否已形成正式发运证据',
      next: '发运到达后监测 TMS 在途与到货',
      visual: 'sap-dispatch-status',
      body: `
        <div class="sn-visual sn-status-track" aria-label="SAP 发运状态进入里程碑链">
          <div class="sn-track-node sn-track-active"><span>01</span><b>SAP 出库 / 发运</b><small>订单、批次、物流单号匹配</small><em>等待正式状态</em></div>
          <div class="sn-track-link"><i></i><small>未到达：只看进度</small></div>
          <div class="sn-track-node"><span>02</span><b>TMS 到货</b><small>尚未进入质量检查</small><em>pending</em></div>
          <div class="sn-progress-rule"><b>当前规则</b><span>没有 SAP 正式状态，不把“已通知发货”当作完成证据。</span></div>
        </div>`
    },
    {
      id: 'milestone-arrival',
      number: '03',
      code: 'TMS ARRIVAL & STORE RECEIPT',
      title: '第二、三站：到货之后还要完成门店登记',
      description: 'TMS 签收或到货只说明运输节点到达；门店收货和登记是下一项正式状态。货物仍在运输或登记时，只监测进度。',
      current: '对齐 TMS 到货与门店收货登记',
      confirmed: 'SAP 发运记录已经匹配',
      unknown: '门店是否完成正式收货登记',
      next: '登记到达后等待上架或 POS 首销',
      visual: 'arrival-registration',
      body: `
        <div class="sn-visual sn-arrival-flow" aria-label="TMS 到货和门店登记两个连续节点">
          <article class="sn-arrival-node sn-arrival-verified"><span>TMS</span><b>签收 / 到货</b><p>核对物流单号、时间和异常状态。</p><em>节点到达</em></article>
          <div class="sn-arrival-bridge"><i></i><small>继续监测进度</small></div>
          <article class="sn-arrival-node sn-arrival-pending"><span>门店</span><b>收货 / 登记</b><p>以门店正式登记为准，不以群内回复代替。</p><em>等待状态</em></article>
          <div class="sn-monitor-notice"><strong>不误报</strong><span>门店仍在企业认可的登记时间内，不报“未上架”或“未标价”。</span></div>
        </div>`
    },
    {
      id: 'milestone-listing',
      number: '04',
      code: 'SHELF OR FIRST SALE',
      title: '第四站：上架或 POS 首销证明商品已进入销售',
      description: '门店登记完成后，继续等待商品上架或 POS 首次销售。两者采用企业批准的正式状态映射，不由系统凭图片或聊天自行猜测。',
      current: '等待商品上架或 POS 首次销售',
      confirmed: '到货和门店登记节点已经到达',
      unknown: '商品是否已进入可销售状态',
      next: '节点到达并超过宽限期后启动价格质量检查',
      visual: 'listing-first-sale',
      body: `
        <div class="sn-visual sn-listing-gate" aria-label="上架或 POS 首销的业务状态门">
          <div class="sn-listing-input"><small>门店登记完成</small><strong>下一项正式业务状态</strong></div>
          <div class="sn-listing-options">
            <article><span>PATH A</span><b>商品上架</b><p>读取企业认可的上架记录。</p></article>
            <div class="sn-option-or">或</div>
            <article><span>PATH B</span><b>POS 首次销售</b><p>读取匹配 SKU 与门店的首销记录。</p></article>
          </div>
          <div class="sn-listing-result"><span>任一路径达到</span><b>启动宽限期计时</b><small>尚不立即判定执行质量</small></div>
        </div>`
    },
    {
      id: 'milestone-quality',
      number: '05',
      code: 'GRACE PERIOD & QUALITY CHECK',
      title: '节点到达且超过宽限期，才检查价签和成交价',
      description: '质量检查有两个同时成立的前提：对应业务状态已经到达，并且企业认可的宽限期已经结束。之后才核对价签与实际成交价，输出验收或处置分支。',
      current: '执行里程碑后的质量检查',
      confirmed: '业务节点到达且宽限期已经结束',
      unknown: '价签与实际成交价是否符合批准版本',
      next: '形成阶段验收、延误升级、重新执行或重新审批结果',
      visual: 'milestone-quality-loop',
      body: `
        <div class="sn-visual sn-quality-gate" aria-label="节点到达和宽限期结束后的质量检查">
          <div class="sn-gate-conditions">
            <div class="sn-condition sn-condition-pass"><span>条件 01</span><b>正式节点已到达</b><small>source status verified</small></div>
            <div class="sn-condition-join">+</div>
            <div class="sn-condition sn-condition-pass"><span>条件 02</span><b>已超过宽限期</b><small>grace period elapsed</small></div>
          </div>
          <div class="sn-quality-checks">
            <span class="sn-kicker">QUALITY CHECK START</span>
            <div class="sn-quality-row"><b>价签</b><span>是否与批准范围和有效版本一致</span></div>
            <div class="sn-quality-row"><b>实际成交价</b><span>以 POS 等授权业务系统正式记录为准</span></div>
          </div>
          <div class="sn-outcome-branches">
            <span class="sn-outcome sn-outcome-pass">阶段验收</span>
            <span class="sn-outcome">延误升级</span>
            <span class="sn-outcome">重新执行</span>
            <span class="sn-outcome sn-outcome-gated">重新审批</span>
          </div>
        </div>`
    }
  ],
  handoff: {
    output: '阶段验收、延误升级或重新执行结果',
    nextId: 'risk',
    condition: '正式业务状态已到达并超过企业批准的宽限期，价签和实际成交价检查已有来源、时间、版本与证据；重大调整仍需重新审批'
  }
};
