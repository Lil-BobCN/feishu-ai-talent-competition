window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.collection = {
  id: 'collection',
  caseId: 'FACT-001',
  bridge: {
    from: '经营事实',
    to: '带来源、时间、权限和质量状态的原始数据'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'source-map',
      number: '01',
      code: 'SOURCE MAP',
      title: '先把七类信息入口列清楚',
      description: '订单、物流、门店销售、养殖、协作信息和外部线索来自不同地方，先登记来源，再谈后续使用。',
      current: '登记一条经营事实的来源',
      confirmed: '方案需覆盖七类来源，正式业务事实仍以授权业务系统为准',
      unknown: '目标企业实际开放哪些系统、字段和接口',
      next: '逐项核对法人范围、负责人和访问权限',
      visual: 'source-grid-loop',
      body: `<div class="sn-blueprint sn-source-map" aria-label="七类经营信息来源进入采集入口">
        <div class="sn-source-grid">
          <span class="sn-source-node"><b class="sn-source-name">SAP/ERP</b><small class="sn-source-note">订单 · 生产 · 库存 · 财务</small></span>
          <span class="sn-source-node"><b class="sn-source-name">WMS/TMS</b><small class="sn-source-note">出入库 · 在途 · 签收 · 批次</small></span>
          <span class="sn-source-node"><b class="sn-source-name">CRM/SRM</b><small class="sn-source-note">客户 · 渠道 · 合同 · 供应商</small></span>
          <span class="sn-source-node"><b class="sn-source-name">POS/零售平台</b><small class="sn-source-note">实付价 · 退款 · 销量 · 门店库存</small></span>
          <span class="sn-source-node"><b class="sn-source-name">智慧农场/养殖</b><small class="sn-source-note">存栏 · 日龄 · 健康 · 出栏</small></span>
          <span class="sn-source-node"><b class="sn-source-name">飞书</b><small class="sn-source-note">审批 · 任务 · 日报 · 补充信息</small></span>
          <span class="sn-source-node"><b class="sn-source-name">外部市场</b><small class="sn-source-note">政策 · 汇率 · 物流 · 天气 · 行业线索</small></span>
        </div>
        <div class="sn-flow-arrow" aria-hidden="true"><span class="sn-flow-line"></span><span class="sn-flow-head">→</span></div>
        <div class="sn-gate-node"><small class="sn-gate-kicker">COLLECTION GATE</small><strong class="sn-gate-title">来源登记</strong><span class="sn-status-chip">待企业核实</span></div>
      </div>`
    },
    {
      id: 'access-scope',
      number: '02',
      code: 'ACCESS GATE',
      title: '能找到，不代表可以直接使用',
      description: '每个入口都要说明归属法人、业务单据、负责人和权限；外部信息还要记录许可和可比性。',
      current: '核对来源责任与权限范围',
      confirmed: '外部网页只能作为线索，沟通内容核实后才能进入经营事实',
      unknown: '目标租户的字段权限、数据许可和保留要求',
      next: '权限通过后，为记录补齐三个时间',
      visual: 'permission-gate',
      body: `<div class="sn-blueprint sn-permission-gate" aria-label="来源经过责任和权限校验">
        <div class="sn-record-node"><small class="sn-record-kicker">INCOMING FACT</small><strong class="sn-record-title">经营事实</strong><span class="sn-record-meta">来源已登记</span></div>
        <div class="sn-check-rail">
          <span class="sn-check-node"><i class="sn-check-led"></i><b class="sn-check-label">法人范围</b></span>
          <span class="sn-check-node"><i class="sn-check-led"></i><b class="sn-check-label">业务单据</b></span>
          <span class="sn-check-node"><i class="sn-check-led"></i><b class="sn-check-label">数据负责人</b></span>
          <span class="sn-check-node"><i class="sn-check-led"></i><b class="sn-check-label">字段权限</b></span>
          <span class="sn-check-node"><i class="sn-check-led"></i><b class="sn-check-label">来源许可</b></span>
        </div>
        <div class="sn-decision-node"><small class="sn-decision-kicker">ACCESS RESULT</small><strong class="sn-decision-title">已授权才接收</strong><span class="sn-status-chip">权限不足则停止</span></div>
      </div>`
    },
    {
      id: 'three-times',
      number: '03',
      code: 'THREE CLOCKS',
      title: '一条记录，要看清三个时间',
      description: '业务何时发生、源系统何时记账、平台何时收到必须分开显示，才能看出迟到发生在哪一段。',
      current: '为同一条记录补齐时间链',
      confirmed: '业务发生时间、源系统记录时间、平台接收时间职责不同',
      unknown: '当前延迟来自业务录入、源系统还是接入链路',
      next: '按业务需要标记接收时效等级',
      visual: 'three-clock-loop',
      body: `<div class="sn-blueprint sn-time-rail" aria-label="同一经营事实的三个时间">
        <div class="sn-time-node sn-is-origin"><span class="sn-time-index">T1</span><small class="sn-time-label">业务发生时间</small><strong class="sn-time-value">现场动作</strong></div>
        <div class="sn-time-link"><span class="sn-time-pulse"></span><small class="sn-time-link-label">记录间隔</small></div>
        <div class="sn-time-node"><span class="sn-time-index">T2</span><small class="sn-time-label">源系统记录时间</small><strong class="sn-time-value">正式留痕</strong></div>
        <div class="sn-time-link"><span class="sn-time-pulse"></span><small class="sn-time-link-label">传输间隔</small></div>
        <div class="sn-time-node sn-is-received"><span class="sn-time-index">T3</span><small class="sn-time-label">平台接收时间</small><strong class="sn-time-value">进入处理</strong></div>
        <div class="sn-time-result"><span class="sn-status-chip">三时并列</span><b class="sn-time-result-text">延迟可以追到具体环节</b></div>
      </div>`
    },
    {
      id: 'freshness-levels',
      number: '04',
      code: 'FRESHNESS',
      title: '不是所有数据都叫“实时”',
      description: '有消息回调的可以秒级接收；普通接口按分钟或小时查询；只能给文件的按约定批次处理批量文件。',
      current: '为数据源标记真实接收方式',
      confirmed: '时效分为秒级、分钟级、小时级和批次，不统一宣称实时',
      unknown: '每类业务允许的最长延迟和超时处理标准',
      next: '由业务与数据负责人确认时效要求',
      visual: 'freshness-lanes',
      body: `<div class="sn-blueprint sn-freshness-board" aria-label="四种数据接收时效等级">
        <div class="sn-freshness-scale"><span class="sn-scale-label">快</span><span class="sn-scale-line"></span><span class="sn-scale-label">按业务需要</span></div>
        <div class="sn-freshness-lanes">
          <div class="sn-freshness-lane"><span class="sn-lane-level">秒级</span><b class="sn-lane-method">消息回调 / 增量变更</b><small class="sn-lane-boundary">有能力且有授权时</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">分钟级</span><b class="sn-lane-method">高时效接口查询</b><small class="sn-lane-boundary">按业务节奏配置</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">小时级</span><b class="sn-lane-method">常规接口查询</b><small class="sn-lane-boundary">满足管理时效即可</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">批次</span><b class="sn-lane-method">约定文件处理</b><small class="sn-lane-boundary">明确批次时间</small></div>
        </div>
        <p class="sn-boundary-note"><span class="sn-boundary-mark">!</span>页面展示真实等级，不用一个“实时”标签掩盖差异。</p>
      </div>`
    },
    {
      id: 'raw-envelope',
      number: '05',
      code: 'RAW DATA',
      title: '先形成可交接的原始数据',
      description: '把原始内容和来源、三个时间、权限、质量状态放在一起；缺少关键字段时保留未知，不向后伪装完整。',
      current: '封装采集结果并标记缺口',
      confirmed: '来源、时间、权限和当前质量状态随记录一同交接',
      unknown: '字段是否完整、不同来源是否冲突',
      next: '交给可靠传输层保留原样并安全送达',
      visual: 'evidence-envelope',
      body: `<div class="sn-blueprint sn-envelope-board" aria-label="带来源时间权限和质量状态的原始数据">
        <div class="sn-envelope-shell">
          <div class="sn-envelope-head"><span class="sn-envelope-id">FACT-001</span><strong class="sn-envelope-title">原始数据</strong><span class="sn-status-chip">PARTIAL</span></div>
          <div class="sn-envelope-fields">
            <span class="sn-field-node"><small class="sn-field-label">SOURCE</small><b class="sn-field-value">来源已登记</b></span>
            <span class="sn-field-node"><small class="sn-field-label">TIME × 3</small><b class="sn-field-value">三时并列</b></span>
            <span class="sn-field-node"><small class="sn-field-label">ACCESS</small><b class="sn-field-value">权限状态</b></span>
            <span class="sn-field-node"><small class="sn-field-label">QUALITY</small><b class="sn-field-value">待后续检查</b></span>
          </div>
        </div>
        <div class="sn-handoff-arrow"><span class="sn-handoff-line"></span><b class="sn-handoff-target">可靠传输</b></div>
      </div>`
    }
  ],
  handoff: {
    output: '带来源、时间、权限和质量状态的原始数据',
    nextId: 'transport',
    condition: '来源、三个时间和权限状态已登记；未取得的信息明确标为未知'
  }
};

window.ShengnongNodeNarratives.transport = {
  id: 'transport',
  caseId: 'RECORD-001',
  bridge: {
    from: '带来源、时间、权限和质量状态的原始数据',
    to: '可追溯、可重试、可回放的原始记录'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'identity-receive',
      number: '01',
      code: 'IDENTITY',
      title: '先验明身份，再接收记录',
      description: '每条数据先核对发送方身份和授权范围，再分配事件编号；身份或权限不明就停止接收。',
      current: '校验发送方并分配记录编号',
      confirmed: '来源和采集权限状态随数据到达',
      unknown: '发送身份是否仍有效、是否超出法人或字段范围',
      next: '为同一条数据建立唯一接收凭据',
      visual: 'identity-gate',
      body: `<div class="sn-blueprint sn-identity-flow" aria-label="原始数据经过身份校验进入可靠传输">
        <div class="sn-record-node"><small class="sn-record-kicker">INBOUND</small><strong class="sn-record-title">原始数据</strong><span class="sn-record-meta">FACT-001</span></div>
        <div class="sn-security-gate"><span class="sn-gate-bracket">[</span><div class="sn-gate-copy"><small class="sn-gate-kicker">IDENTITY CHECK</small><b class="sn-gate-title">身份 · 法人 · 字段权限</b></div><span class="sn-gate-bracket">]</span></div>
        <div class="sn-record-node sn-is-accepted"><small class="sn-record-kicker">ACCEPTED</small><strong class="sn-record-title">RECORD-001</strong><span class="sn-status-chip">已接收</span></div>
      </div>`
    },
    {
      id: 'idempotent-receive',
      number: '02',
      code: 'IDEMPOTENCY',
      title: '重复送达，也只记一次',
      description: '同一编号再次到达时不新建记录，只返回原有接收结果；这就是幂等，避免重复数据放大后续工作。',
      current: '检查记录是否已经接收',
      confirmed: 'RECORD-001 已有唯一接收凭据',
      unknown: '上游为什么重复发送、是否还有关联记录迟到',
      next: '按业务顺序放入传输队列',
      visual: 'idempotency-loop',
      body: `<div class="sn-blueprint sn-idempotency-board" aria-label="重复记录被幂等拦截">
        <div class="sn-duplicate-stack">
          <span class="sn-packet-node sn-is-first"><b class="sn-packet-id">RECORD-001</b><small class="sn-packet-state">首次到达</small></span>
          <span class="sn-packet-node sn-is-repeat"><b class="sn-packet-id">RECORD-001</b><small class="sn-packet-state">重复到达</small></span>
        </div>
        <div class="sn-idempotent-gate"><small class="sn-gate-kicker">ONE KEY · ONE RESULT</small><strong class="sn-gate-title">同一条只收一次</strong><span class="sn-loop-mark" aria-hidden="true">↻</span></div>
        <div class="sn-single-result"><span class="sn-result-count">01</span><b class="sn-result-title">唯一原始记录</b><small class="sn-result-note">重复请求返回同一结果</small></div>
      </div>`
    },
    {
      id: 'order-retry',
      number: '03',
      code: 'ORDER / RETRY',
      title: '按顺序送达，失败可以再试',
      description: '同一业务链的记录按编号排序；短暂失败按规则重试，每次尝试都留下时间和结果。',
      current: '排序并执行受控重试',
      confirmed: '重复已拦截，原始内容未被改写',
      unknown: '当前失败是暂时拥堵、接口中断还是权限变化',
      next: '达到重试上限后转入异常暂存区',
      visual: 'retry-circuit-loop',
      body: `<div class="sn-blueprint sn-retry-circuit" aria-label="记录按顺序传输并在失败后重试">
        <div class="sn-sequence-rail">
          <span class="sn-sequence-node sn-is-done"><b class="sn-sequence-id">001</b><small class="sn-sequence-state">送达</small></span>
          <span class="sn-sequence-link"></span>
          <span class="sn-sequence-node sn-is-retrying"><b class="sn-sequence-id">002</b><small class="sn-sequence-state">重试中</small></span>
          <span class="sn-sequence-link"></span>
          <span class="sn-sequence-node sn-is-waiting"><b class="sn-sequence-id">003</b><small class="sn-sequence-state">等待排序</small></span>
        </div>
        <div class="sn-retry-loop"><span class="sn-loop-arrow" aria-hidden="true">↻</span><div class="sn-retry-copy"><small class="sn-retry-label">RETRY LOG</small><b class="sn-retry-value">尝试 02 / 上限待配置</b></div></div>
        <p class="sn-boundary-note"><span class="sn-boundary-mark">!</span>重试次数、间隔和超时标准需由目标环境确认。</p>
      </div>`
    },
    {
      id: 'dead-letter-replay',
      number: '04',
      code: 'RECOVERY',
      title: '送不动的先留住，修复后再回放',
      description: '超过重试上限的记录进入异常暂存区，也就是死信；人工或系统修复原因后，从原始内容重新回放。',
      current: '隔离失败记录并保留恢复入口',
      confirmed: '失败记录、尝试过程和原始内容均已保留',
      unknown: '根因是否已消除、回放是否仍在原授权范围内',
      next: '确认修复和权限后回到原队列',
      visual: 'dead-letter-replay-loop',
      body: `<div class="sn-blueprint sn-recovery-loop" aria-label="失败记录进入死信暂存并在修复后回放">
        <div class="sn-queue-node"><small class="sn-queue-label">DELIVERY QUEUE</small><b class="sn-queue-title">正常队列</b></div>
        <div class="sn-failure-path"><span class="sn-path-arrow">→</span><small class="sn-path-label">重试到上限</small></div>
        <div class="sn-dead-letter-node"><small class="sn-dead-letter-label">DEAD LETTER</small><strong class="sn-dead-letter-title">异常暂存区</strong><span class="sn-status-chip">等待修复</span></div>
        <div class="sn-replay-path"><span class="sn-replay-arrow" aria-hidden="true">↺</span><div class="sn-replay-copy"><small class="sn-replay-label">REPLAY</small><b class="sn-replay-title">核准后回放原记录</b></div></div>
        <div class="sn-queue-node sn-is-return"><small class="sn-queue-label">RETURN</small><b class="sn-queue-title">回到原队列</b></div>
      </div>`
    },
    {
      id: 'traceable-record',
      number: '05',
      code: 'TRACE',
      title: '交付的是留痕完整的记录，不是结论',
      description: '原始内容、接收时间、顺序、重复、重试、死信和回放记录一起保存，后续可以追到每一步；这一层只可靠搬运，不承担经营判断。',
      current: '汇总可靠传输的全程记录',
      confirmed: 'RECORD-001 可追溯、可重试、可回放',
      unknown: '数据含义是否一致、字段是否足以支持经营判断',
      next: '交给经营证据层统一口径并检查质量',
      visual: 'trace-ledger',
      body: `<div class="sn-blueprint sn-trace-ledger" aria-label="可靠传输全程留痕">
        <div class="sn-ledger-head"><span class="sn-ledger-id">RECORD-001</span><strong class="sn-ledger-title">传输台账</strong><span class="sn-status-chip">TRACEABLE</span></div>
        <div class="sn-ledger-rows">
          <span class="sn-ledger-row"><i class="sn-ledger-led sn-is-ok"></i><b class="sn-ledger-action">身份校验</b><small class="sn-ledger-result">通过并留痕</small></span>
          <span class="sn-ledger-row"><i class="sn-ledger-led sn-is-ok"></i><b class="sn-ledger-action">幂等与排序</b><small class="sn-ledger-result">唯一且有序</small></span>
          <span class="sn-ledger-row"><i class="sn-ledger-led sn-is-warn"></i><b class="sn-ledger-action">重试 / 死信 / 回放</b><small class="sn-ledger-result">过程可追溯</small></span>
          <span class="sn-ledger-row"><i class="sn-ledger-led sn-is-neutral"></i><b class="sn-ledger-action">经营含义</b><small class="sn-ledger-result">本层不判断</small></span>
        </div>
        <p class="sn-boundary-note sn-is-strong"><span class="sn-boundary-mark">BOUNDARY</span>这一层只负责可靠搬运，不判违规、不定严重程度，也不替管理者下结论。</p>
      </div>`
    }
  ],
  handoff: {
    output: '可追溯、可重试、可回放的原始记录',
    nextId: 'foundation',
    condition: '原始内容和身份校验、幂等、排序、重试、死信及回放过程均已留痕'
  }
};

window.ShengnongNodeNarratives.foundation = {
  id: 'foundation',
  caseId: 'SIGNAL-001',
  bridge: {
    from: '可追溯、可重试、可回放的原始记录',
    to: '统一口径的待调查经营事件'
  },
  statusLabels: ['当前处理', '已经确认', '仍然未知', '下一步'],
  scenes: [
    {
      id: 'entity-resolution',
      number: '01',
      code: 'ENTITY MAP',
      title: '先确认不同叫法是不是同一个对象',
      description: '把各系统中的 SKU、门店、区域、价格、批次和时间映射到统一经营对象，原始编号仍然保留。',
      current: '对齐跨系统对象和主键',
      confirmed: 'RECORD-001 的来源和传输过程可追溯',
      unknown: '不同名称是否确指同一规格、门店和批次',
      next: '由数据和业务负责人确认对应关系',
      visual: 'entity-map-loop',
      body: `<div class="sn-blueprint sn-entity-map" aria-label="不同来源标识映射到统一经营对象">
        <div class="sn-alias-column">
          <span class="sn-alias-node"><small class="sn-alias-source">系统 A</small><b class="sn-alias-value">商品编码 / 门店编码</b></span>
          <span class="sn-alias-node"><small class="sn-alias-source">系统 B</small><b class="sn-alias-value">规格名称 / 网点名称</b></span>
          <span class="sn-alias-node"><small class="sn-alias-source">业务记录</small><b class="sn-alias-value">区域 / 批次 / 时间</b></span>
        </div>
        <div class="sn-map-links"><span class="sn-map-line"></span><span class="sn-map-line"></span><span class="sn-map-line"></span></div>
        <div class="sn-canonical-node"><small class="sn-canonical-kicker">CANONICAL OBJECT</small><strong class="sn-canonical-title">统一经营对象</strong><div class="sn-canonical-fields"><span class="sn-field-chip">SKU</span><span class="sn-field-chip">门店</span><span class="sn-field-chip">区域</span><span class="sn-field-chip">价格</span><span class="sn-field-chip">批次</span><span class="sn-field-chip">时间</span></div></div>
      </div>`
    },
    {
      id: 'definition-version',
      number: '02',
      code: 'DEFINITION',
      title: '同一个指标，要说清用哪套口径',
      description: '经营概念、指标计算、适用范围和生效日期都带版本；历史数据不跨口径直接比较。',
      current: '绑定经营概念和指标口径版本',
      confirmed: '统一对象已保留原始编号与对应关系',
      unknown: '业务部门是否批准当前定义、历史口径何时变更',
      next: '检查记录在当前口径下是否完整和及时',
      visual: 'definition-version-rail',
      body: `<div class="sn-blueprint sn-definition-board" aria-label="经营口径按版本和生效日期管理">
        <div class="sn-definition-object"><small class="sn-definition-label">经营概念</small><strong class="sn-definition-title">统一对象 + 指标</strong></div>
        <div class="sn-version-rail">
          <span class="sn-version-node sn-is-history"><b class="sn-version-id">v1</b><small class="sn-version-state">历史口径</small></span>
          <span class="sn-version-link"><small class="sn-version-date">生效日期</small></span>
          <span class="sn-version-node sn-is-current"><b class="sn-version-id">v2</b><small class="sn-version-state">当前待确认</small></span>
        </div>
        <div class="sn-definition-rules"><span class="sn-rule-chip">计算方法</span><span class="sn-rule-chip">适用法人</span><span class="sn-rule-chip">区域 / 渠道</span><span class="sn-rule-chip">勾稽关系</span></div>
        <p class="sn-boundary-note"><span class="sn-boundary-mark">!</span>业务部门批准经营概念和指标口径，程序只按已登记版本执行。</p>
      </div>`
    },
    {
      id: 'quality-check',
      number: '03',
      code: 'QUALITY',
      title: '先分清经营变化，还是数据出了问题',
      description: '逐项检查完整性、时效性、冲突和字段有效性；发现缺口只登记质量状态，不把坏数据解释成经营异常。',
      current: '检查完整性、时效、冲突和字段有效性',
      confirmed: '对象和口径版本已经登记',
      unknown: '缺失或冲突会不会改变后续判断',
      next: '重要缺口转人工确认，未解决前保留证据不足',
      visual: 'quality-console',
      body: `<div class="sn-blueprint sn-quality-console" aria-label="经营记录的数据质量检查台">
        <div class="sn-quality-head"><small class="sn-quality-kicker">DATA QUALITY</small><strong class="sn-quality-title">质量检查台</strong><span class="sn-status-chip">PARTIAL</span></div>
        <div class="sn-quality-grid">
          <span class="sn-quality-node sn-is-checking"><i class="sn-quality-led"></i><b class="sn-quality-name">完整性</b><small class="sn-quality-result">关键字段是否齐全</small></span>
          <span class="sn-quality-node sn-is-checking"><i class="sn-quality-led"></i><b class="sn-quality-name">时效性</b><small class="sn-quality-result">三时差距是否可接受</small></span>
          <span class="sn-quality-node sn-is-warning"><i class="sn-quality-led"></i><b class="sn-quality-name">数据冲突</b><small class="sn-quality-result">来源不一致则标记</small></span>
          <span class="sn-quality-node sn-is-checking"><i class="sn-quality-led"></i><b class="sn-quality-name">字段有效性</b><small class="sn-quality-result">格式和范围是否合法</small></span>
        </div>
        <div class="sn-quality-output"><span class="sn-output-label">OUTPUT</span><b class="sn-output-value">质量状态 + 证据缺口</b></div>
      </div>`
    },
    {
      id: 'exception-rule',
      number: '04',
      code: 'RULE VERSION',
      title: '合法例外和判断条件都要有版本',
      description: '程序只使用企业批准且在有效期内的条件；符合合法例外就保留依据，规则版本过期或范围不符就停止。',
      current: '匹配合法例外与判断条件版本',
      confirmed: '质量状态和证据缺口已经登记',
      unknown: '例外是否仍有效、条件是否覆盖当前法人和业务范围',
      next: '由业务部门确认例外，数据与 IT 确认执行版本',
      visual: 'exception-rule-gate',
      body: `<div class="sn-blueprint sn-rule-gate" aria-label="合法例外和判断条件的版本校验">
        <div class="sn-rule-input"><small class="sn-rule-input-label">CURRENT RECORD</small><strong class="sn-rule-input-title">统一对象 + 质量状态</strong></div>
        <div class="sn-rule-branch">
          <div class="sn-rule-node sn-is-exception"><span class="sn-rule-index">E</span><b class="sn-rule-title">合法例外</b><small class="sn-rule-meta">批准人 · 适用范围 · 有效期</small></div>
          <div class="sn-rule-node sn-is-condition"><span class="sn-rule-index">R</span><b class="sn-rule-title">判断条件版本</b><small class="sn-rule-meta">版本 · 生效日 · 业务范围</small></div>
        </div>
        <div class="sn-rule-result"><span class="sn-status-chip">VERSION CHECK</span><b class="sn-rule-result-title">仅登记当前匹配结果</b><small class="sn-rule-result-note">过期、越权或范围不符则停止</small></div>
        <p class="sn-boundary-note"><span class="sn-boundary-mark">OWNER</span>业务部门批准经营概念、指标口径和合法例外。</p>
      </div>`
    },
    {
      id: 'signal-register',
      number: '05',
      code: 'SIGNAL',
      title: '程序只登记待调查信号',
      description: '最小必要字段齐全且满足已批准条件时，生成一条待调查经营事件；它是调查起点，不是违规结论。',
      current: '登记 SIGNAL-001 并附上证据索引',
      confirmed: '来源、时间、原始记录、统一对象、口径、质量和条件版本可追溯',
      unknown: '真实原因、影响范围和事件严重程度',
      next: '在授权范围内调查；证据不足时等待或转人工',
      visual: 'signal-register',
      body: `<div class="sn-blueprint sn-signal-register" aria-label="程序登记待调查经营信号而不作违规判断">
        <div class="sn-signal-input-stack">
          <span class="sn-signal-input"><small class="sn-input-label">OBJECT</small><b class="sn-input-value">统一经营对象</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">EVIDENCE</small><b class="sn-input-value">来源与原始记录</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">VERSION</small><b class="sn-input-value">口径与条件版本</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">QUALITY</small><b class="sn-input-value">质量与缺口</b></span>
        </div>
        <div class="sn-register-arrow"><span class="sn-register-line"></span><span class="sn-register-head">→</span></div>
        <div class="sn-signal-node"><small class="sn-signal-kicker">SIGNAL-001</small><strong class="sn-signal-title">待调查经营事件</strong><span class="sn-status-chip">UNKNOWN CAUSE</span></div>
        <div class="sn-boundary-panel"><span class="sn-boundary-mark">程序边界</span><b class="sn-boundary-title">不判违规 · 不定严重程度 · 不补齐未知事实</b><small class="sn-boundary-copy">重要缺口可能改变判断时，明确标注“证据不足”，交由授权调查和人工责任人处理。</small></div>
      </div>`
    }
  ],
  handoff: {
    output: '统一口径的待调查经营事件',
    nextId: 'aily',
    condition: '来源和原始记录可追溯，对象、口径、质量、合法例外及判断条件版本已登记；程序未作违规或严重程度判断'
  }
};
