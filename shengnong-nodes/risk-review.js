window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.risk = {
  id: 'risk',
  caseId: 'RESULT-CHECK-001',
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
      title: '任务完成不等于经营目标达成',
      description: '价签已更换、任务已关单，不等于消费者实付价正确，更不等于销量、库存和毛利已经改善。节点 08 从阶段验收继续追到经营结果。',
      current: '接收阶段验收和批准方案',
      confirmed: '责任动作已有完成证据',
      unknown: '经营目标是否真正达成',
      next: '读取观察期内的经营指标',
      visual: 'outcome-gate',
      body: `<div class="sn-outcome-gate" aria-label="任务完成与经营目标达成的区别">
        <div class="sn-gate-track">
          <div class="sn-gate-step is-confirmed"><span>01 / 责任动作</span><b>任务已提交完成证据</b><small>verified：只确认动作完成</small></div>
          <div class="sn-gate-divider" aria-hidden="true"><span>不等于</span></div>
          <div class="sn-gate-step is-pending"><span>02 / 经营结果</span><b>目标是否改善仍待回读</b><small>unknown：不能用关单代替结果</small></div>
        </div>
        <p class="sn-boundary-note"><strong>方案演示 / 待企业核实：</strong>观察周期、目标区间、停止条件和恢复办法应随批准方案一并登记。</p>
      </div>`
    },
    {
      id: 'metric-readback',
      number: '02',
      code: 'READBACK',
      title: '把八类结果放回同一个观察窗口',
      description: '系统按批准的时间读取价格、销量、毛利、库存、回款、退货、投诉和任务证据；未取得的数据明确标注缺失，不能当作零。',
      current: '按观察周期读取八类结果',
      confirmed: '指标清单和任务证据已关联',
      unknown: '目标租户的数据完整度与实际口径',
      next: '统一口径后建立可比基准',
      visual: 'metric-readback',
      body: `<div class="sn-metric-readback" aria-label="经营结果指标回读">
        <div class="sn-metric-strip">
          <span><small>PRICE</small><b>价格</b></span>
          <span><small>VOLUME</small><b>销量</b></span>
          <span><small>MARGIN</small><b>毛利</b></span>
          <span><small>STOCK</small><b>库存</b></span>
          <span><small>CASH</small><b>回款</b></span>
          <span><small>RETURN</small><b>退货</b></span>
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
      title: '只和真正可比的结果作比较',
      description: '试点结果要与同口径基准、对照区域或历史季节性比较。核算方法、并表范围或渠道库存不可见时，页面必须保留限制条件。',
      current: '校准基准、对照区域和季节性',
      confirmed: '不同口径不能直接比较',
      unknown: '变化来自执行、季节还是核算范围',
      next: '检查是否出现跨区域联动风险',
      visual: 'calibrated-comparison',
      body: `<div class="sn-comparison-board" aria-label="基准对照与季节性比较">
        <div class="sn-comparison-input"><span>本次试点</span><b>观察期结果</b><small>口径 v? / 待企业确认</small></div>
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
      title: '多区域同时走弱，要沿经营链继续追',
      description: '当多个区域持续出现降价、滞销和库存上升，问题可能从渠道传到生产、养殖和长期产能，也可能来自需求、口径或短期促销。系统同时展开多种解释，不给唯一答案。',
      current: '分析多区域降价、滞销和库存上升',
      confirmed: '销售变化需要跨领域联合判断',
      unknown: '需求、渠道库存或其他解释谁更接近事实',
      next: '测算短中长期多情景',
      visual: 'risk-propagation',
      body: `<div class="sn-risk-propagation" aria-label="多区域风险向生产存栏产能和海外市场传导">
        <div class="sn-signal-cluster">
          <span>区域 A / 降价</span><span>区域 B / 滞销</span><span>区域 C / 库存上升</span>
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
      title: '先比较多种假设，再选择可恢复动作',
      description: '预测展示多种假设、敏感性、置信范围和未知信息。面对长周期生产约束，优先采用限定范围、数量和时间的可恢复措施。',
      current: '测算库存、毛利、现金流和供应风险',
      confirmed: '预测只能支持决策，不能代替决策',
      unknown: '计划周期、最小调整幅度和硬性合同',
      next: '由管理层选择关闭、恢复或重新审批',
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
      title: '把结果带着证据送往正确分支',
      description: '结果改善则关闭并保留证据；无效或出现新风险，则恢复原方案、重开调查或重新审批。任何分支都保留受影响事件、任务和数据记录。',
      current: '形成经营结果和风险处置建议',
      confirmed: '关闭、恢复、重开和重新审批边界明确',
      unknown: '改善能否在后续观察期持续',
      next: '合格关单事件进入管理复盘候选池',
      visual: 'result-routing',
      body: `<div class="sn-result-routing" aria-label="经营结果四类处置分支">
        <div class="sn-result-origin"><span>经营结果</span><b>目标、基准、证据与未知信息</b></div>
        <div class="sn-result-branches">
          <div class="is-close"><small>CLOSE</small><b>关闭</b><span>达到批准目标并保留证据</span></div>
          <div class="is-restore"><small>RESTORE</small><b>恢复</b><span>触发停止条件，采用恢复办法</span></div>
          <div class="is-reopen"><small>REOPEN</small><b>重开</b><span>新风险出现，扩大调查</span></div>
          <div class="is-reapprove"><small>REAPPROVE</small><b>重新审批</b><span>重大动作改变，回到管理层</span></div>
        </div>
        <p class="sn-evidence-limit">只有已关闭、结果已验证且证据完整的事件，才有资格进入后续管理复盘；其余状态继续保留在原经营事件中。</p>
      </div>`
    }
  ],
  handoff: {
    output: '经营结果',
    nextId: 'review',
    condition: '事件已关闭、结果已验证、证据完整，并满足同领域管理复盘的资格标准'
  }
};

window.ShengnongNodeNarratives.review = {
  id: 'review',
  caseId: 'MRB-PILOT-001',
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
      title: '先确认这十个事件是否真的合格',
      description: '管理复盘只接收同一经批准业务领域中已关闭、结果已验证、证据完整的事件。事件数量达到十个只是开始，不自动证明存在普遍问题。',
      current: '收集同领域已关闭事件',
      confirmed: '资格标准由业务领域负责人批准',
      unknown: '当前是否已有十个合格事件',
      next: '校验资格、统一编号和关闭版本',
      visual: 'review-eligibility',
      body: `<div class="sn-review-eligibility" aria-label="十个管理复盘事件资格检查">
        <div class="sn-case-counter">
          <span>01</span><span>02</span><span>03</span><span>04</span><span>05</span>
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
      title: '按根因去重，再把批次封存',
      description: '多条告警、任务或系统记录可能来自同一个根问题。服务端按统一事件编号去重，确认十个不同事件及其关闭版本后才形成批次。',
      current: '执行资格、排序和根因去重',
      confirmed: '同一事件不得重复计入不同批次',
      unknown: '关闭版本是否仍满足资格规则',
      next: '封存可审计的十案批次',
      visual: 'batch-seal',
      body: `<div class="sn-batch-seal" aria-label="管理复盘批次去重与封存">
        <div class="sn-duplicate-stream">
          <span>告警 A</span><span>任务 A-1</span><span>重开 A-2</span><span>事件 B</span><span>事件 C</span>
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
      title: '相似现象必须经得起反例挑战',
      description: '十案比较背景、原因、处置和结果，同时寻找反例与替代解释。渠道、季节、口径或组织范围不同，都可能让“看起来相似”失去可比性。',
      current: '比较十案的背景、原因、处置和结果',
      confirmed: '反例和替代解释必须进入报告',
      unknown: '是否存在稳定、可重复的共同问题',
      next: '形成零个或多个管理问题候选',
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
      title: '复盘可以得出零个，也可以得出多个候选',
      description: '候选问题可落在制度、流程、组织、系统、培训或风险管理，但它仍是待审议材料，不是既成事实。证据不稳定时，系统必须允许零候选。',
      current: '归纳管理问题候选及证据边界',
      confirmed: '候选数量允许为零个或多个',
      unknown: '管理层是否认可问题、范围和改进选项',
      next: '提交管理问题上报包',
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
      title: '候选问题先由管理层审议',
      description: '管理层可以批准试点、批准变更、要求修改、驳回或暂缓。只有批准分支才能形成改进任务，系统不能自行修改制度、流程或生产知识。',
      current: '提交复盘报告和改进选项',
      confirmed: '未取得管理审批不能进入执行',
      unknown: '候选问题和试点方案将如何处置',
      next: '把批准内容转成可验收改进任务',
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
      title: '让后续批次证明改进是否有效',
      description: '批准后的改进进入执行和观察，但不能立刻宣称有效。只有达到企业批准的事件数、覆盖量、稳定观察时间和口径可比条件，后续批次才能验证效果。',
      current: '观察改进任务和后续批次',
      confirmed: '效果判断条件和知识回流路径已定义',
      unknown: '后续证据是否足以证明问题减少',
      next: '发布经验证的新知识并继续下一批复盘',
      visual: 'effectiveness-feedback',
      body: `<div class="sn-effectiveness-feedback" aria-label="改进验证与经营知识回流">
        <div class="sn-effectiveness-path">
          <div><small>01</small><b>批准改进</b><span>范围、owner、指标、观察窗</span></div>
          <div><small>02</small><b>后续批次</b><span>新的合格事件，不重复旧样本</span></div>
          <div><small>03</small><b>效果判断</b><span>事件数、覆盖量、稳定时间、口径可比</span></div>
          <div><small>04</small><b>发布知识</b><span>经 owner 审核并保留版本记录</span></div>
        </div>
        <div class="sn-feedback-targets">
          <div><span>反馈至 03 / FOUNDATION</span><b>新版口径与判断条件</b></div>
          <div><span>反馈至 04 / AILY</span><b>业务处置模板与已审核案例</b></div>
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
