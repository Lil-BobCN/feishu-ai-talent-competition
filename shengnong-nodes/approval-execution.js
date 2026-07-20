window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.decision = {
  id: 'decision',
  caseId: 'PRICE-0249',
  bridge: {
    from: 'Aily 交付的 PRICE-0249 决策就绪包',
    to: '价格处理方案的正式审批结果'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'decision-intake',
      number: '01',
      code: 'DECISION INTAKE',
      title: '接住 Aily 查清的这一个价格事件',
      description: '管理层收到 PRICE-0249 决策就绪包：门店实付 24.9 元、SAP 价盘 29.9 元，活动申请未绑定该门店，券承担方仍待补证。包内同时给出“合法活动”和“未授权低价”两套有边界的处理方案。',
      current: '审阅 PRICE-0249 的事实、缺口和两套方案',
      confirmed: '24.9 元成交与 29.9 元价盘均有来源和时间',
      unknown: '券承担方能否证明 24.9 元属于合法活动',
      next: '限定两套价格处理方案的适用边界',
      visual: 'decision-dossier',
      body: `
        <div class="sn-visual sn-decision-dossier" aria-label="PRICE-0249 决策材料由事实、缺口和两套价格方案组成">
          <div class="sn-dossier-head">
            <span class="sn-kicker">PRICE-0249 / DECISION-READY</span>
            <strong class="sn-dossier-title">24.9 元是否有依据，先把事实和缺口分开</strong>
            <span class="sn-badge sn-badge-partial">partial / 待管理审议</span>
          </div>
          <div class="sn-dossier-grid">
            <article class="sn-panel sn-panel-verified"><small class="sn-label">已确认事实</small><b>POS 24.9 / SAP 29.9</b><p>门店、SKU、成交时间和价盘版本均可追溯。</p></article>
            <article class="sn-panel"><small class="sn-label">调查判断</small><b>活动存在但未绑定门店</b><p>目前不能直接认定合法，也不能先给员工定责。</p></article>
            <article class="sn-panel sn-panel-warning"><small class="sn-label">关键缺口</small><b>券承担方仍未知</b><p>缺口会决定采用合法活动还是未授权低价分支。</p></article>
            <article class="sn-panel"><small class="sn-label">候选方案</small><b>活动补证 / 恢复 29.9</b><p>两套方案分别列明预算、时限、停止和恢复条件。</p></article>
          </div>
        </div>`
    },
    {
      id: 'decision-boundary',
      number: '02',
      code: 'SCOPE & CONTROL',
      title: '把两套价格方案写成可执行边界',
      description: '若补证为合法活动，管理层需批准 24.9 元的门店、SKU、券承担方、预算和有效期；若属于未授权低价，则批准恢复 29.9 元、纠正价签并核查影响订单。',
      current: '限定 PRICE-0249 两个处理分支',
      confirmed: '合法活动与未授权低价的动作已经分开',
      unknown: '最终采用哪一分支仍由补证与管理层决定',
      next: '校验价格审批人和预算审批权限',
      visual: 'decision-boundary',
      body: `
        <div class="sn-visual sn-boundary-board" aria-label="PRICE-0249 两套价格方案的范围与控制条件">
          <div class="sn-boundary-core">
            <span class="sn-kicker">PRICE-0249 / DECISION DRAFT</span>
            <strong>先定分支，再定边界</strong>
            <p>合法活动可保留 24.9；未授权低价必须恢复 29.9，任何动作都不能越过批准版本。</p>
          </div>
          <div class="sn-boundary-items">
            <div class="sn-control-item"><small>合法活动分支</small><b>24.9 元 + 门店绑定 + 券承担方</b></div>
            <div class="sn-control-item"><small>未授权分支</small><b>恢复 29.9 元 + 纠正价签</b></div>
            <div class="sn-control-item"><small>适用范围</small><b>门店 · SKU · 渠道 · 有效期</b></div>
            <div class="sn-control-item"><small>控制条件</small><b>预算上限 · 观察窗口 · 停止条件</b></div>
            <div class="sn-control-item"><small>恢复办法</small><b>保留原价盘与 rollback_plan_id</b></div>
            <div class="sn-control-item sn-control-unknown"><small>仍待补证</small><b>券承担方及活动对该门店的授权</b></div>
          </div>
        </div>`
    },
    {
      id: 'decision-authority',
      number: '03',
      code: 'HUMAN AUTHORITY GATE',
      title: '24.9 留不留、29.9 恢不恢复，必须由人拍板',
      description: '程序校验价盘、预算和权限，Aily 解释证据并比较方案；但价格调整及其预算责任不能由 Agent 自动决定。',
      current: '核对 PRICE-0249 的价格与预算审批权限',
      confirmed: 'Aily 只提供调查材料和方案，不拥有审批权',
      unknown: '真实授权矩阵仍需圣农按组织制度配置',
      next: '由有权管理者批准、要求修改或驳回',
      visual: 'human-authority-gate',
      body: `
        <div class="sn-visual sn-authority-gate" aria-label="PRICE-0249 价格处理方案的人工审批门">
          <div class="sn-role-lane"><span class="sn-role-mark">程序</span><b>校验 29.9 价盘、活动版本、预算和权限</b><small>确定性检查</small></div>
          <div class="sn-role-lane"><span class="sn-role-mark">Aily</span><b>解释 24.9 证据、缺口与两套方案</b><small>决策支持</small></div>
          <div class="sn-gate-lock"><span class="sn-lock-label">HUMAN GATE</span><strong>管理者决定价格分支</strong><p>未经批准，SAP、POS 与门店任务均不得写入。</p></div>
          <div class="sn-risk-actions">
            <span>保留 24.9</span><span>恢复 29.9</span><span>活动预算</span><span>订单核查</span><span>观察窗口</span>
          </div>
        </div>`
    },
    {
      id: 'decision-branches',
      number: '04',
      code: 'APPROVAL BRANCH',
      title: '管理层明确选择价格处理分支',
      description: '管理者可批准合法活动方案、批准未授权低价整改方案，或要求补证后重审；任何未批准状态都不能被解释成可以执行。',
      current: '记录 PRICE-0249 的正式审批选择',
      confirmed: '审批版本、审批人和证据快照已经绑定',
      unknown: '管理者尚未选择活动保留或低价整改',
      next: '仅把获批的价格分支固化为正式版本',
      visual: 'decision-branch-loop',
      body: `
        <div class="sn-visual sn-branch-flow" aria-label="PRICE-0249 合法活动、低价整改和补证重审分支">
          <div class="sn-branch-source"><small>PRICE-0249 / DECISION VERSION</small><strong>等待管理层选择</strong><span>同一证据快照 · 同一审计链</span></div>
          <div class="sn-branch-lines" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="sn-branch-options">
            <article class="sn-branch sn-branch-approved"><span>LEGAL PROMOTION</span><b>批准合法活动</b><p>24.9 元仅在批准门店、SKU 和期限内有效。</p><small>绑定券承担方与预算</small></article>
            <article class="sn-branch sn-branch-change"><span>UNAUTHORIZED PRICE</span><b>批准低价整改</b><p>恢复 29.9 元、纠正价签并核查影响订单。</p><small>进入责任执行</small></article>
            <article class="sn-branch sn-branch-rejected"><span>MORE EVIDENCE</span><b>补证后重审</b><p>券承担方未查清前，不执行扩大性动作。</p><small>退回 Aily 调查</small></article>
          </div>
        </div>`
    },
    {
      id: 'decision-version',
      number: '05',
      code: 'FORMAL DECISION',
      title: '获批价格方案成为唯一可下发版本',
      description: '本演示沿“未授权低价整改”分支继续：管理层批准门店恢复 29.9 元、纠正价签并核查影响订单。系统固化 approval_id、版本、范围、时限和停止条件。',
      current: '固化 PRICE-0249 的低价整改授权',
      confirmed: '管理层已批准恢复 29.9 元的示例分支',
      unknown: '圣农真实审批人和时间阈值仍待试点配置',
      next: '把获批整改方案交给责任执行节点',
      visual: 'formal-decision-card',
      body: `
        <div class="sn-visual sn-formal-decision" aria-label="PRICE-0249 未授权低价整改的正式决策版本">
          <div class="sn-version-stamp"><span>PRICE-0249 / APPROVAL STATUS</span><strong>approved</strong><small>演示分支：恢复 29.9 元，不代表目标租户已运行</small></div>
          <dl class="sn-contract-list">
            <div><dt>approval_id</dt><dd>PRICE-0249-AP-01 · 绑定审批人与审计记录</dd></div>
            <div><dt>decision_version</dt><dd>PRICE-0249-v1 · 低价整改</dd></div>
            <div><dt>scope</dt><dd>涉事门店 · 涉事 SKU · 恢复 29.9 元</dd></div>
            <div><dt>controls</dt><dd>纠正价签、核查订单、观察窗口与回滚条件</dd></div>
          </dl>
          <div class="sn-contract-gate"><b>进入下一节点的条件</b><span>approved + 权限有效 + 版本有效 + 范围匹配</span></div>
        </div>`
    }
  ],
  handoff: {
    output: 'PRICE-0249 经批准的价格整改版本',
    nextId: 'execution',
    condition: '只有有权管理者批准 PRICE-0249 的具体价格分支，且 approval_id、decision_version、门店、SKU 与有效期均通过校验，才能进入责任执行'
  }
};

window.ShengnongNodeNarratives.execution = {
  id: 'execution',
  caseId: 'PRICE-0249',
  bridge: {
    from: 'PRICE-0249 经批准的价格整改版本',
    to: '恢复 29.9 元的责任任务与验收依据'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'execution-validate',
      number: '01',
      code: 'VALIDATE APPROVAL',
      title: '先验证这次 29.9 元整改是否真的获批',
      description: '系统先核对 PRICE-0249 的 approval_id、低价整改版本、涉事门店、SKU、有效期和当前权限。任何一项不符，都不能生成改价或门店任务。',
      current: '校验 PRICE-0249 低价整改授权',
      confirmed: '已收到管理层批准的 PRICE-0249-v1',
      unknown: '当前门店和 SKU 是否完全落在批准范围内',
      next: '按恢复 29.9 元的批准内容生成任务',
      visual: 'approval-validation',
      body: `
        <div class="sn-visual sn-validation-gate" aria-label="PRICE-0249 执行前的审批有效性校验">
          <div class="sn-input-chip"><span>输入</span><b>PRICE-0249-AP-01 + PRICE-0249-v1</b></div>
          <div class="sn-validation-list">
            <div class="sn-check-row"><span>审批状态</span><b>approved</b><em>通过才继续</em></div>
            <div class="sn-check-row"><span>版本与有效期</span><b>当前有效</b><em>过期即停止</em></div>
            <div class="sn-check-row"><span>门店和 SKU 范围</span><b>只处理涉事对象</b><em>逐任务校验</em></div>
            <div class="sn-check-row"><span>当前操作权限</span><b>服务端复核</b><em>不信任历史快照</em></div>
          </div>
          <div class="sn-deny-strip"><strong>change_requested / rejected / revoked</strong><span>不产生执行授权</span></div>
        </div>`
    },
    {
      id: 'execution-decompose',
      number: '02',
      code: 'TASK ORCHESTRATION',
      title: '把恢复 29.9 元拆成六项具体工作',
      description: '系统依据已批准方案生成任务草案：价格管理员更新正式价盘，区域销售通知门店，门店责任人纠正价签，数据与财务人员核查 24.9 元影响订单。',
      current: '拆解 PRICE-0249 低价整改任务',
      confirmed: '恢复价格、适用门店、SKU 和观察窗口来自同一版本',
      unknown: '实际负责人和系统操作入口待流程责任人确认',
      next: '为六项价格任务补齐责任与验收证据',
      visual: 'task-decomposition',
      body: `
        <div class="sn-visual sn-task-decomposition" aria-label="PRICE-0249 低价整改拆分为四项责任任务">
          <div class="sn-decision-node"><small>PRICE-0249-v1 / APPROVED</small><strong>门店恢复 29.9 元</strong><span>涉事门店、SKU、时限、观察与恢复条件</span></div>
          <div class="sn-task-spine" aria-hidden="true"></div>
          <div class="sn-task-grid">
            <article class="sn-task-node"><span>价格管理员</span><b>SAP 生效 29.9 元价盘</b></article>
            <article class="sn-task-node"><span>区域销售</span><b>通知门店并确认整改要求</b></article>
            <article class="sn-task-node"><span>门店责任人</span><b>更新价签与 POS 配置</b></article>
            <article class="sn-task-node"><span>数据人员</span><b>核对 WMS/TMS/POS 里程碑</b></article>
            <article class="sn-task-node"><span>财务</span><b>核查 24.9 元影响订单</b></article>
            <article class="sn-task-node"><span>流程负责人</span><b>处理阻塞与例外升级</b></article>
          </div>
          <p class="sn-boundary-note">任务只处理 PRICE-0249 已批准范围，不扩展到其他门店或商品；真实责任分工仍需圣农样本校准。</p>
        </div>`
    },
    {
      id: 'execution-contract',
      number: '03',
      code: '责任任务清单',
      title: '每项价格任务都写清谁来做、何时做、怎样算完成',
      description: '以门店价签整改为例，任务必须写明负责人、前置的 SAP 价盘状态、29.9 元完成标准、截止时间、照片与 POS 记录，以及延误后向谁升级。',
      current: '补齐门店价格整改责任合同',
      confirmed: '任务草案已绑定 PRICE-0249-v1',
      unknown: '具体负责人、时限和升级对象待流程责任人确认',
      next: '为 PRICE-0249 建立最小必要协作关系',
      visual: 'task-contract',
      body: `
        <div class="sn-visual sn-task-contract" aria-label="PRICE-0249 门店价格整改任务的关键字段">
          <div class="sn-task-card-head"><span class="sn-kicker">TASK / PRICE-0249 / STORE PRICE</span><strong>把门店价格恢复到 29.9 元</strong><span class="sn-badge sn-badge-partial">待流程确认</span></div>
          <div class="sn-task-fields">
            <div><small>负责人</small><b>涉事门店价格责任人</b></div>
            <div><small>配合人</small><b>区域销售 + 价格管理员</b></div>
            <div><small>前置任务</small><b>SAP 29.9 元价盘已生效</b></div>
            <div><small>完成标准</small><b>价签 29.9 + POS 成交 29.9</b></div>
            <div><small>所需证据</small><b>价签照片 + POS 订单 + 时间戳</b></div>
            <div><small>升级路径</small><b>区域经理 / 价格审批人</b></div>
          </div>
          <div class="sn-task-rule"><span>正式状态</span><b>草稿 &rarr; 已指派 &rarr; 已接受 &rarr; 已提交 &rarr; 已验收 / 已退回</b></div>
        </div>`
    },
    {
      id: 'execution-collaboration',
      number: '04',
      code: 'CONTROLLED COLLABORATION',
      title: '让价格管理员、区域销售和门店围绕同一事件协作',
      description: 'PRICE-0249 涉及正式价盘、门店执行和结果核验，系统在权限校验后建立最小事件协同群；不相关人员不加入，正式状态仍写回业务系统。',
      current: '建立 PRICE-0249 最小协作关系',
      confirmed: '价格管理员、区域销售和门店责任已经列明',
      unknown: '飞书建群、加人和机器人权限待圣农验证',
      next: '向门店责任人提供价格整改指导与追问入口',
      visual: 'collaboration-router',
      body: `
        <div class="sn-visual sn-collaboration-router" aria-label="单人任务与跨部门任务的协作分流">
          <div class="sn-router-question"><small>PRICE-0249 / COLLABORATION GATE</small><strong>SAP 价盘、区域通知和门店价签是否需要三方协同？</strong></div>
          <div class="sn-router-paths">
            <article class="sn-route-card sn-route-single"><span>单项</span><b>个人只收自己的任务卡</b><p>价格管理员和门店责任人各自看到最小必要信息。</p></article>
            <article class="sn-route-card sn-route-group"><span>跨岗</span><b>按 PRICE-0249 建事件群</b><p>只纳入价格管理员、区域销售、门店责任人和流程负责人。</p></article>
          </div>
          <div class="sn-first-message">
            <small>协同群首条信息</small>
            <span>24.9 / 29.9 事件背景</span><span>已批准恢复 29.9</span><span>负责人和时限</span><span>价签与 POS 证据</span><span>不得扩大范围</span><span>Aily 追问入口</span>
          </div>
          <p class="sn-boundary-note">群聊只承载协作；审批、任务状态、价格和库存等正式事实仍以授权系统为准。</p>
        </div>`
    },
    {
      id: 'execution-guidance',
      number: '05',
      code: 'ROLE-GUIDED ASSISTANCE',
      title: '新员工也能问清这次价格整改怎么做',
      description: '门店责任人可选择“我是新入职人员”，Aily 随即解释 PRICE-0249 中他负责的价签更新、POS 核对、证据提交和异常升级，不要求新人靠口头经验摸索。',
      current: '指导新员工完成 PRICE-0249 门店任务',
      confirmed: '岗位、批准版本和当前任务阶段已经识别',
      unknown: '圣农有效操作制度和已审核案例仍需接入',
      next: '责任人认领任务并等待正式里程碑后执行',
      visual: 'new-hire-guidance',
      body: `
        <div class="sn-visual sn-guidance-console" aria-label="新入职人员的岗位任务指导">
          <div class="sn-guidance-prompt"><span class="sn-person-mark">责任人</span><strong>我是新入职人员</strong></div>
          <div class="sn-guidance-response">
            <div class="sn-guidance-head"><small>PRICE-0249 / ROLE-GUIDED ASSISTANCE</small><b>你的任务：在 SAP 价盘生效后更新价签并核对 POS</b></div>
            <ol class="sn-guidance-steps">
              <li><span>01</span><b>先看前置状态</b><small>SAP 29.9 元价盘是否已生效</small></li>
              <li><span>02</span><b>更新门店价签</b><small>只处理获批门店与 SKU</small></li>
              <li><span>03</span><b>核对 POS</b><small>首笔正式成交是否为 29.9 元</small></li>
              <li><span>04</span><b>提交证据</b><small>价签照片、订单号和时间戳</small></li>
              <li><span>05</span><b>发现例外</b><small>向区域经理或价格审批人升级</small></li>
            </ol>
          </div>
          <div class="sn-guidance-limit"><b>不能临时编造操作规程</b><span>没有有效制度或案例时，明确提示并转向求助对象。</span></div>
        </div>`
    },
    {
      id: 'execution-dispatch',
      number: '06',
      code: 'CONTROLLED DISPATCH',
      title: '任务下发后，不马上判定价格整改失败',
      description: '流程负责人确认后，PRICE-0249 任务才进入 assigned。系统先等待 SAP、WMS、TMS、门店与 POS 的正式业务状态；状态未到或仍在宽限期内，只显示进度，不提前报“未改价”。',
      current: '下发 PRICE-0249 责任任务',
      confirmed: '负责人、29.9 元标准、证据、时限和升级路径已登记',
      unknown: 'SAP/WMS/TMS/POS 状态是否已到达',
      next: '交给里程碑节点按正式状态逐站验收',
      visual: 'controlled-dispatch',
      body: `
        <div class="sn-visual sn-dispatch-flow" aria-label="PRICE-0249 从任务确认到正式业务里程碑跟踪">
          <div class="sn-dispatch-stage"><small>01 / CONFIRM</small><b>确认恢复 29.9 元任务</b><span>门店、SKU、角色、依赖和验收依据</span></div>
          <div class="sn-flow-arrow" aria-hidden="true">&rarr;</div>
          <div class="sn-dispatch-stage"><small>02 / ASSIGN</small><b>价格与门店负责人认领</b><span>任务卡 + PRICE-0249 事件协同群</span></div>
          <div class="sn-flow-arrow" aria-hidden="true">&rarr;</div>
          <div class="sn-dispatch-stage sn-dispatch-next"><small>03 / WAIT</small><b>等待 SAP / WMS / TMS / POS</b><span>正式里程碑决定何时验收价格</span></div>
          <div class="sn-escalation-strip"><b>延误或阻塞</b><span>按预先登记的 escalation_to 升级，不由模型自行扩大权限。</span></div>
        </div>`
    }
  ],
  handoff: {
    output: 'PRICE-0249 价格整改任务、岗位指导与验收依据',
    nextId: 'milestone',
    condition: 'PRICE-0249 任务已绑定有效审批版本，恢复 29.9 元的负责人、依赖、完成标准、时限、证据与升级路径均已确认'
  }
};

window.ShengnongNodeNarratives.milestone = {
  id: 'milestone',
  caseId: 'PRICE-0249',
  bridge: {
    from: 'PRICE-0249 价格整改任务与正式业务状态',
    to: '29.9 元价格验收、延误升级或重新处理结果'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'milestone-register',
      number: '01',
      code: 'MILESTONE REGISTER',
      title: '先定义 PRICE-0249 什么时候才能验收',
      description: '恢复 29.9 元不能以“任务已下发”作为完成。系统先登记 SAP 价盘生效、WMS 批次出库、TMS 到店、门店登记、POS 首销和宽限期，再决定何时核验价签与成交价。',
      current: '加载 PRICE-0249 里程碑版本',
      confirmed: '任务已绑定低价整改审批版本与 29.9 元验收标准',
      unknown: '圣农真实状态码、预计时长和宽限期待配置',
      next: '等待 SAP 价盘生效与 WMS 正式出库',
      visual: 'milestone-contract',
      body: `
        <div class="sn-visual sn-milestone-contract" aria-label="PRICE-0249 价格整改里程碑合同">
          <div class="sn-contract-head"><span class="sn-kicker">PRICE-0249 / MILESTONE VERSION</span><strong>先登记正式状态，再验收 29.9 元</strong><span class="sn-badge sn-badge-unknown">unknown / 待企业配置</span></div>
          <div class="sn-contract-grid">
            <div><small>SAP</small><b>29.9 元价盘版本生效</b></div>
            <div><small>WMS</small><b>匹配 SKU / 批次正式出库</b></div>
            <div><small>TMS</small><b>到店签收状态</b></div>
            <div><small>门店</small><b>收货、登记与上架</b></div>
            <div><small>POS</small><b>首笔正式成交记录</b></div>
            <div><small>宽限期</small><b>企业批准的整改时间</b></div>
            <div><small>验收</small><b>价签 29.9 + POS 29.9</b></div>
            <div><small>失败分支</small><b>升级、重做或重新审批</b></div>
          </div>
          <p class="sn-boundary-note">页面中的顺序来自母稿；目标租户真实接口、状态码和时间阈值必须用业务样本验证。</p>
        </div>`
    },
    {
      id: 'milestone-sap',
      number: '02',
      code: 'SAP PRICE & WMS DISPATCH',
      title: '第一站：SAP 价盘生效，WMS 批次正式出库',
      description: 'PRICE-0249 任务下发不代表 29.9 元已经可售。只有 SAP 中批准价盘已生效，且 WMS 出现匹配 SKU 与批次的正式出库记录，才进入运输和门店执行阶段。',
      current: '核对 SAP 29.9 元价盘与 WMS 出库记录',
      confirmed: 'PRICE-0249 责任任务已经下发',
      unknown: '正式价盘和匹配批次是否均已生效',
      next: '两项状态到达后监测 TMS 到店',
      visual: 'sap-dispatch-status',
      body: `
        <div class="sn-visual sn-status-track" aria-label="SAP 价盘和 WMS 出库进入 PRICE-0249 里程碑链">
          <div class="sn-track-node sn-track-active"><span>01</span><b>SAP 价盘 29.9 元</b><small>审批版本、门店、SKU 和生效时间匹配</small><em>等待正式状态</em></div>
          <div class="sn-track-link"><i></i><small>两项都到达才继续</small></div>
          <div class="sn-track-node"><span>02</span><b>WMS 批次出库</b><small>SKU、批次和物流单号匹配</small><em>pending</em></div>
          <div class="sn-progress-rule"><b>当前规则</b><span>SAP 或 WMS 任一未到达，只显示进度，不报“门店未改价”。</span></div>
        </div>`
    },
    {
      id: 'milestone-arrival',
      number: '03',
      code: 'TMS ARRIVAL & STORE RECEIPT',
      title: '第二站：TMS 到店后，门店仍要完成收货登记',
      description: 'TMS 签收只说明运输完成，门店收货和登记才确认 PRICE-0249 对应商品已进入门店流程。仍在运输或登记时，系统只跟进进度，不提前检测价签。',
      current: '对齐 PRICE-0249 的 TMS 到店与门店登记',
      confirmed: 'SAP 29.9 元价盘与 WMS 出库记录已经匹配',
      unknown: '门店是否完成正式收货登记',
      next: '登记到达后等待上架与 POS 首销',
      visual: 'arrival-registration',
      body: `
        <div class="sn-visual sn-arrival-flow" aria-label="PRICE-0249 的 TMS 到店和门店登记两个连续节点">
          <article class="sn-arrival-node sn-arrival-verified"><span>TMS</span><b>签收 / 到货</b><p>核对物流单号、时间和异常状态。</p><em>节点到达</em></article>
          <div class="sn-arrival-bridge"><i></i><small>继续监测进度</small></div>
          <article class="sn-arrival-node sn-arrival-pending"><span>门店</span><b>收货 / 登记</b><p>核对 PRICE-0249 的门店、SKU 和批次，不以群内回复代替。</p><em>等待状态</em></article>
          <div class="sn-monitor-notice"><strong>不得提前误报</strong><span>门店仍在企业认可的登记时间内，不报“未上架”“未标价”或“仍按 24.9 元销售”。</span></div>
        </div>`
    },
    {
      id: 'milestone-listing',
      number: '04',
      code: 'SHELF OR FIRST SALE',
      title: '第三站：上架与 POS 首销证明 29.9 元进入销售',
      description: '门店登记完成后，系统继续等待企业认可的上架记录与匹配 SKU 的 POS 首笔成交。网页截图或群内回复只能补充说明，不能替代正式状态。',
      current: '等待 PRICE-0249 商品上架与 POS 首销',
      confirmed: 'TMS 到店和门店登记节点已经到达',
      unknown: 'POS 是否已产生可核对的首笔正式成交',
      next: '首销到达并超过宽限期后核验 29.9 元',
      visual: 'listing-first-sale',
      body: `
        <div class="sn-visual sn-listing-gate" aria-label="PRICE-0249 上架与 POS 首销的业务状态门">
          <div class="sn-listing-input"><small>PRICE-0249 / 门店登记完成</small><strong>等待销售状态证明 29.9 元已落地</strong></div>
          <div class="sn-listing-options">
            <article><span>PATH A</span><b>商品上架</b><p>价签显示批准价 29.9 元并带时间证据。</p></article>
            <div class="sn-option-or">+</div>
            <article><span>PATH B</span><b>POS 首次销售</b><p>读取匹配门店、SKU 的首笔正式成交。</p></article>
          </div>
          <div class="sn-listing-result"><span>两项状态均达到</span><b>启动价格验收宽限期</b><small>尚不立即判定整改失败</small></div>
        </div>`
    },
    {
      id: 'milestone-quality',
      number: '05',
      code: 'GRACE PERIOD & QUALITY CHECK',
      title: '正式里程碑到达后，才验收是否恢复 29.9 元',
      description: '只有 SAP、WMS、TMS、门店和 POS 状态全部到达，并且整改宽限期结束，系统才核对价签与实际成交价。若仍为 24.9 元，则根据证据升级、重做或重新审批。',
      current: '验收 PRICE-0249 是否恢复 29.9 元',
      confirmed: 'SAP/WMS/TMS/门店/POS 已到达且宽限期结束',
      unknown: '价签和 POS 成交价是否均为批准的 29.9 元',
      next: '通过则关闭；未通过则升级、重做或重新审批',
      visual: 'milestone-quality-loop',
      body: `
        <div class="sn-visual sn-quality-gate" aria-label="PRICE-0249 正式节点到达后的 29.9 元价格验收">
          <div class="sn-gate-conditions">
            <div class="sn-condition sn-condition-pass"><span>条件 01</span><b>SAP/WMS/TMS/POS 已到达</b><small>正式业务状态已经确认</small></div>
            <div class="sn-condition-join">+</div>
            <div class="sn-condition sn-condition-pass"><span>条件 02</span><b>已超过宽限期</b><small>企业认可的处理时间已经结束</small></div>
          </div>
          <div class="sn-quality-checks">
            <span class="sn-kicker">开始质量检查</span>
            <div class="sn-quality-row"><b>门店价签</b><span>涉事 SKU 是否显示批准价 29.9 元</span></div>
            <div class="sn-quality-row"><b>POS 成交价</b><span>首笔正式订单是否按 29.9 元成交</span></div>
          </div>
          <div class="sn-outcome-branches">
            <span class="sn-outcome sn-outcome-pass">29.9 元验收通过</span>
            <span class="sn-outcome">仍在 24.9：延误升级</span>
            <span class="sn-outcome">价签或 POS 不一致：重新执行</span>
            <span class="sn-outcome sn-outcome-gated">需保留活动价：重新审批</span>
          </div>
        </div>`
    }
  ],
  handoff: {
    output: 'PRICE-0249 的 29.9 元验收、升级或重新处理结果',
    nextId: 'risk',
    condition: 'SAP、WMS、TMS、门店与 POS 正式状态均已到达并超过批准宽限期，价签和 POS 价格已有来源、时间、版本与证据；继续 24.9 元活动价必须重新审批'
  }
};
