window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.risk = {
  id: 'risk',
  caseId: 'PRICE-0249',
  bridge: {
    from: '阶段验收',
    to: '执行结果、经营数据和外部市场变化'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'outcome-gate',
      number: '01',
      code: 'OUTCOME GATE',
      title: '价签改完了，还要确认经营结果',
      description: 'PRICE-0249 已完成门店整改并通过里程碑验收，但任务关单不等于问题结束。系统继续回读实付价、销量、库存和投诉，确认价格是否恢复、销量是否受损、库存是否积压。',
      current: '接收 PRICE-0249 的验收结果',
      confirmed: '门店已完成批准的价格整改',
      unknown: '价格、销量、库存和投诉是否恢复',
      next: '按批准的观察窗口回读四类结果',
      visual: 'outcome-gate',
      body: `<div class="sn-outcome-gate" aria-label="任务完成与经营目标达成的区别">
        <div class="sn-gate-track">
          <div class="sn-gate-step is-confirmed"><span>01 / PRICE-0249</span><b>门店价格整改已验收</b><small>verified：只确认动作完成</small></div>
          <div class="sn-gate-divider" aria-hidden="true"><span>不等于</span></div>
          <div class="sn-gate-step is-pending"><span>02 / 经营结果</span><b>价格、销量、库存、投诉待回读</b><small>unknown：不能用关单代替结果</small></div>
        </div>
        <p class="sn-boundary-note"><strong>方案演示 / 待企业核实：</strong>观察周期、目标区间、停止条件和恢复办法应随批准方案一并登记。</p>
      </div>`
    },
    {
      id: 'metric-readback',
      number: '02',
      code: 'READBACK',
      title: '沿着同一事件回读四类关键结果',
      description: '系统用 PRICE-0249 的 event_id 拉回同一观察窗口内的门店实付价、销量、库存和投诉；取不到的数据标为缺失，绝不能把缺失写成零。',
      current: '回读价格、销量、库存和投诉',
      confirmed: '四类结果已与 PRICE-0249 关联',
      unknown: '缺失数据和指标口径是否影响判断',
      next: '把本次结果与批准基准作同口径比较',
      visual: 'metric-readback',
      body: `<div class="sn-metric-readback" aria-label="经营结果指标回读">
        <div class="sn-metric-strip">
          <span><small>PRICE</small><b>价格</b></span>
          <span><small>VOLUME</small><b>销量</b></span>
          <span><small>STOCK</small><b>库存</b></span>
          <span><small>VOICE</small><b>投诉</b></span>
          <span><small>PROOF</small><b>任务证据</b></span>
        </div>
        <div class="sn-readback-rule">
          <span>同一 event_id</span><span>同一观察周期</span><span>保留口径版本</span><span>缺失 != 0</span>
        </div>
      </div>`
    },
    {
      id: 'calibrated-comparison',
      number: '03',
      code: 'CALIBRATE',
      title: '先判断 PRICE-0249 是否真的恢复',
      description: '把整改后的实付价、销量、库存和投诉与批准时基准、相近门店和历史同期比较。口径不一致或渠道库存不可见时，只能给出部分结论。',
      current: '比较整改前后与相近门店结果',
      confirmed: '价格已恢复不代表其余指标同步改善',
      unknown: '销量和库存变化来自整改还是季节波动',
      next: '判断事件应关闭、重开还是扩大风险调查',
      visual: 'calibrated-comparison',
      body: `<div class="sn-comparison-board" aria-label="基准对照与季节性比较">
          <div class="sn-comparison-input"><span>PRICE-0249</span><b>整改后四项结果</b><small>口径 v? / 待企业确认</small></div>
        <div class="sn-comparison-axis" aria-hidden="true"><span>同口径校准</span></div>
        <div class="sn-comparison-set">
          <div><span>BASELINE</span><b>批准时基准</b><small>目标与停止条件</small></div>
          <div><span>CONTROL</span><b>对照区域</b><small>相近渠道与商品</small></div>
          <div><span>SEASON</span><b>历史季节性</b><small>相同时间窗口</small></div>
        </div>
        <p class="sn-evidence-limit">渠道库存不透明或指标口径变化时，结论状态保持 <strong>partial</strong>，不得把表面差异直接归因于执行方案。</p>
      </div>`
    },
    {
      id: 'cross-domain-propagation',
      number: '04',
      code: 'PROPAGATE',
      title: '一个门店异常，不能直接推断全国市场',
      description: 'PRICE-0249 只能证明一个事件的结果。只有其他区域也持续出现降价、滞销、库存上升或投诉联动，系统才把调查从门店扩到区域和经营链；单一事件绝不能自动推出全国需求下降。',
      current: '检查 PRICE-0249 是否存在风险外溢证据',
      confirmed: '单一事件不足以判断全国市场',
      unknown: '其他区域是否出现同向且可比的持续信号',
      next: '有外溢证据则测算情景，没有则保留个案边界',
      visual: 'risk-propagation',
      body: `<div class="sn-risk-propagation" aria-label="多区域风险向生产存栏产能和海外市场传导">
        <div class="sn-signal-cluster">
          <span>PRICE-0249 / 已核实</span><span>其他区域 / 待核实</span><span>全国需求 / 不可直接推断</span>
        </div>
        <div class="sn-propagation-path">
          <div><small>01</small><b>需求</b><span>真实消费是否放缓</span></div>
          <div><small>02</small><b>渠道库存</b><span>出货与动销是否背离</span></div>
          <div><small>03</small><b>生产</b><span>计划是否需要调整</span></div>
          <div><small>04</small><b>存栏</b><span>长周期约束是否允许</span></div>
          <div><small>05</small><b>产能</b><span>上下限与合同约束</span></div>
          <div><small>06</small><b>海外市场</b><span>替代市场与准入证据</span></div>
        </div>
        <p class="sn-boundary-note">外部市场线索不是战略事实；重大判断须回到官方或授权来源，并经法务、质量和业务确认。</p>
      </div>`
    },
    {
      id: 'scenario-governance',
      number: '05',
      code: 'SCENARIOS',
      title: '出现外溢证据，才测算更大范围的风险',
      description: '若多个可比区域出现同向变化，程序再测算价格、销量、库存、现金流和供应风险，并列出假设与未知信息。调整价格、库存、存栏、产能或市场进入仍必须交回管理层批准。',
      current: '根据外溢证据比较短中长期情景',
      confirmed: '测算只支持选择，不能替管理层拍板',
      unknown: '信号会消退、持续还是传向供应链',
      next: '形成关闭、重开或重新审批建议',
      visual: 'scenario-governance',
      body: `<div class="sn-scenario-governance" aria-label="多情景与可恢复措施">
        <div class="sn-scenario-table">
          <div class="sn-scenario-row is-head"><span>情景</span><span>主要假设</span><span>观察重点</span><span>可恢复措施</span></div>
          <div class="sn-scenario-row"><b>短期促销外溢</b><span>需求未变、跟价扩大</span><span>毛利 / 投诉</span><span>限店、限量、限时</span></div>
          <div class="sn-scenario-row"><b>渠道去库存</b><span>sell-in 正常、sell-out 放缓</span><span>库龄 / 回款</span><span>暂停补货、调拨试点</span></div>
          <div class="sn-scenario-row"><b>需求持续走弱</b><span>多周期、多区域同向</span><span>库存 / 现金流 / 供应</span><span>提交计划调整申请</span></div>
        </div>
        <p class="sn-approval-lock"><strong>人工边界：</strong>价格、库存、存栏、产能和市场进入决策必须由管理层批准；模型与程序不得自动拍板。</p>
      </div>`
    },
    {
      id: 'result-routing',
      number: '06',
      code: 'ROUTE RESULT',
      title: '让 PRICE-0249 进入有证据的处置分支',
      description: '四项结果达到目标则关闭 PRICE-0249；整改无效或出现新原因则重开调查；重大方案需要改变则重新审批。只有关闭、结果已验证且证据完整的版本，才能进入管理复盘候选池。',
      current: '为 PRICE-0249 选择结果分支',
      confirmed: '关闭、重开和重新审批条件已有证据',
      unknown: '改善能否跨过完整观察窗口',
      next: '合格关闭后累计同类事件，未合格则继续原事件',
      visual: 'result-routing',
      body: `<div class="sn-result-routing" aria-label="经营结果四类处置分支">
        <div class="sn-result-origin"><span>经营结果</span><b>目标、基准、证据与未知信息</b></div>
        <div class="sn-result-branches">
          <div class="is-close"><small>CLOSE</small><b>关闭</b><span>达到批准目标并保留证据</span></div>
          <div class="is-restore"><small>MONITOR</small><b>继续观察</b><span>证据不足，保留事件状态</span></div>
          <div class="is-reopen"><small>REOPEN</small><b>重开</b><span>新风险出现，扩大调查</span></div>
          <div class="is-reapprove"><small>REAPPROVE</small><b>重新审批</b><span>重大动作改变，回到管理层</span></div>
        </div>
        <p class="sn-evidence-limit">只有已关闭、结果已验证且证据完整的事件，才有资格进入后续管理复盘；其余状态继续保留在原经营事件中。</p>
      </div>`
    }
  ],
  handoff: {
    output: 'PRICE-0249 的经营结果与风险处置记录',
    nextId: 'review',
    condition: '事件已关闭、结果已验证、证据完整，并满足同领域管理复盘的资格标准'
  }
};

window.ShengnongNodeNarratives.review = {
  id: 'review',
  caseId: 'PRICE-0249',
  bridge: {
    from: '经营结果',
    to: '十个合格、去重、已验证的同领域事件'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'eligibility',
      number: '01',
      code: 'ELIGIBILITY',
      title: 'PRICE-0249 先进入候选池，不立刻上升为管理问题',
      description: 'PRICE-0249 关闭且结果验证后，只成为第一个候选样本。管理复盘要等待同一业务领域累计十个已关闭、结果已验证、证据完整的事件；一个个案不能自动证明制度有问题。',
      current: '登记 PRICE-0249 的合格关闭版本',
      confirmed: 'PRICE-0249 已满足复盘候选资格',
      unknown: '是否已累计十个同领域合格事件',
      next: '继续累计并逐案校验资格',
      visual: 'review-eligibility',
      body: `<div class="sn-review-eligibility" aria-label="十个管理复盘事件资格检查">
        <div class="sn-case-counter">
          <span>PRICE-0249</span><span>02</span><span>03</span><span>04</span><span>05</span>
          <span>06</span><span>07</span><span>08</span><span>09</span><span>10</span>
        </div>
        <div class="sn-eligibility-gates">
          <div><small>DOMAIN</small><b>同一批准领域</b></div>
          <div><small>CLOSED</small><b>事件已关闭</b></div>
          <div><small>VERIFIED</small><b>结果已验证</b></div>
          <div><small>COMPLETE</small><b>证据完整</b></div>
        </div>
        <p class="sn-boundary-note"><strong>试点边界：</strong>需取得至少十个同领域脱敏历史事件，并用人工复盘结果检查系统归纳是否准确。</p>
      </div>`
    },
    {
      id: 'deduplicate-and-seal',
      number: '02',
      code: 'DEDUPLICATE',
      title: '同一价格事件只算一次',
      description: 'PRICE-0249 产生过告警、整改任务、验收记录和结果回读，但它们都属于同一个根问题。服务端按统一事件编号去重，确认十个不同事件后才封存复盘批次。',
      current: '对 PRICE-0249 及同类事件做根因去重',
      confirmed: '告警、任务和重开记录不会重复计数',
      unknown: '其余九个事件是否满足相同资格标准',
      next: '封存十个合格且不同根因事件的批次',
      visual: 'batch-seal',
      body: `<div class="sn-batch-seal" aria-label="管理复盘批次去重与封存">
        <div class="sn-duplicate-stream">
          <span>PRICE-0249 告警</span><span>整改任务</span><span>验收记录</span><span>结果回读</span><span>其他事件</span>
        </div>
        <div class="sn-dedup-gate"><span>canonical_case_id</span><b>资格检查 + 去重 + 排序</b><small>由确定性服务执行，指令模板不能放宽约束</small></div>
        <div class="sn-sealed-batch"><span>BATCH / 01</span><b>十个不同根问题</b><small>事件关闭版本、资格规则版本和权限标签一并封存</small></div>
        <p class="sn-evidence-limit">第 1-10 个形成第一批，第 11-20 个形成第二批；并发或消息重放只能读到同一个批次。</p>
      </div>`
    },
    {
      id: 'counterevidence',
      number: '03',
      code: 'COUNTEREVIDENCE',
      title: '用另外九个事件检验 PRICE-0249 是否具有共性',
      description: '十案比较价格异常的背景、根因、处置和结果，同时主动寻找没有复发的反例。渠道、季节、授权促销或组织范围不同，都可能让表面相似失去可比性。',
      current: '比较 PRICE-0249 与九个同类合格事件',
      confirmed: '反例和替代解释必须与支持证据并列',
      unknown: '是否存在稳定、可重复的管理短板',
      next: '有证据才形成候选，没有则报告无稳定规律',
      visual: 'counterevidence',
      body: `<div class="sn-counterevidence" aria-label="支持证据反例与替代解释">
        <div class="sn-evidence-columns">
          <div class="is-support"><small>SUPPORT</small><b>支持证据</b><span>哪些事件重复出现同类缺口</span></div>
          <div class="is-counter"><small>COUNTEREXAMPLE</small><b>反例</b><span>相同背景下为什么没有复发</span></div>
          <div class="is-alternative"><small>ALTERNATIVE</small><b>替代解释</b><span>季节、口径、渠道或范围变化</span></div>
          <div class="is-limit"><small>LIMIT</small><b>适用范围</b><span>结论能覆盖哪些法人、区域和渠道</span></div>
        </div>
        <div class="sn-review-question"><span>复盘要回答</span><b>这是重复性管理短板，还是多个个案碰巧呈现相似结果？</b></div>
      </div>`
    },
    {
      id: 'candidate-issues',
      number: '04',
      code: 'CANDIDATES',
      title: '把重复根因写成候选，不把猜测写成结论',
      description: '如果十案反复显示价盘口径、促销审批、门店执行或培训存在共同缺口，系统形成相应候选；证据不稳定时可以输出零候选。候选仍是待审议材料。',
      current: '从十案中归纳重复根因和适用边界',
      confirmed: '候选允许为零个或多个',
      unknown: '共同缺口是否足以支持制度或流程调整',
      next: '把证据、反例和改进选项提交管理层',
      visual: 'candidate-issues',
      body: `<div class="sn-candidate-issues" aria-label="零个或多个管理问题候选">
        <div class="sn-candidate-source"><span>十案复盘报告</span><b>证据 + 反例 + 替代解释 + 适用范围</b></div>
        <div class="sn-candidate-branches">
          <div class="is-none"><small>0 CANDIDATE</small><b>未发现稳定规律</b><span>明确报告，不为形式强行归纳</span></div>
          <div class="is-many"><small>1..N CANDIDATES</small><b>零个或多个候选</b><span>制度 / 流程 / 组织 / 系统 / 培训 / 风险管理</span></div>
        </div>
        <p class="sn-report-statement">无稳定规律时报告写明：<strong>“本批次未发现稳定的重复性问题”</strong>。</p>
      </div>`
    },
    {
      id: 'management-approval',
      number: '05',
      code: 'MANAGEMENT REVIEW',
      title: '制度和流程怎么改，仍由管理层批准',
      description: '系统可建议更新价格口径、促销审批、门店巡检或岗位指导，但不能自行改制度。管理层可以批准试点、要求修改、驳回或暂缓，只有批准分支才能形成改进任务。',
      current: '提交 PRICE-0249 十案复盘与改进选项',
      confirmed: '制度变更必须取得管理层批准',
      unknown: '候选问题与试点范围将如何处置',
      next: '把批准版本转成可验收的改进任务',
      visual: 'management-approval',
      body: `<div class="sn-management-approval" aria-label="管理问题候选审批分支">
        <div class="sn-dossier"><span>MANAGEMENT DOSSIER</span><b>候选问题、反例、替代解释、选项与验证条件</b><small>候选 != 已确认管理问题</small></div>
        <div class="sn-approval-branches">
          <div class="is-approved"><b>批准</b><span>建立试点范围、负责人、成功指标和观察窗口</span></div>
          <div><b>要求修改</b><span>补证或调整问题范围后重新提交</span></div>
          <div><b>驳回</b><span>带理由关闭，不进入改进执行</span></div>
          <div><b>暂缓</b><span>等待新批次，不阻止后续批次形成</span></div>
        </div>
        <p class="sn-approval-lock"><strong>管理边界：</strong>改进任务必须由管理层批准；批准记录应包含 owner、范围、成功指标、生效日、观察窗口、停止条件和恢复办法。</p>
      </div>`
    },
    {
      id: 'effectiveness-feedback',
      number: '06',
      code: 'VERIFY & FEEDBACK',
      title: '把验证过的新口径和处理经验送回前端',
      description: '批准后的改进先进入执行和观察，后续批次证明有效后，才把新版价格口径和异常判断条件回流节点 03，把 PRICE-0249 等已审核处理经验回流节点 04。',
      current: '用后续批次验证改进是否减少同类问题',
      confirmed: '03 接收新口径，04 接收已审核处理经验',
      unknown: '后续证据是否达到批准的效果门槛',
      next: '发布新版本并继续监测下一批事件',
      visual: 'effectiveness-feedback',
      body: `<div class="sn-effectiveness-feedback" aria-label="改进验证与经营知识回流">
        <div class="sn-effectiveness-path">
          <div><small>01</small><b>批准改进</b><span>范围、owner、指标、观察窗</span></div>
          <div><small>02</small><b>后续批次</b><span>新的合格事件，不重复旧样本</span></div>
          <div><small>03</small><b>效果判断</b><span>事件数、覆盖量、稳定时间、口径可比</span></div>
          <div><small>04</small><b>发布知识</b><span>经 owner 审核并保留版本记录</span></div>
        </div>
        <div class="sn-feedback-targets">
          <div><span>反馈至 03 / FOUNDATION</span><b>新版价格口径与异常判断条件</b></div>
          <div><span>反馈至 04 / AILY</span><b>PRICE-0249 等已审核处理经验</b></div>
        </div>
        <p class="sn-evidence-limit">未达到批准的判断条件时，只能写：<strong>“当前证据不足以判断改进效果”</strong>。这不是成功，也不是失败。</p>
      </div>`
    }
  ],
  handoff: {
    output: '管理改进',
    nextId: 'foundation',
    condition: '管理层已批准改进，并由后续批次验证；新版口径、判断条件、处置模板和案例再反馈至 foundation 与 aily'
  }
};
