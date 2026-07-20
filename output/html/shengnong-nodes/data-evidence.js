window.ShengnongNodeNarratives = window.ShengnongNodeNarratives || {};

window.ShengnongNodeNarratives.collection = {
  id: 'collection',
  caseId: 'PRICE-0249',
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
      title: '从 POS 接住“门店实付 24.9 元”',
      description: '系统先将这条价格记录视为经营事实：它来自哪家门店、哪个 POS 单据，与哪个 SKU 相关。此时只采集，不判断为什么降价。',
      current: '登记 PRICE-0249 的 POS 来源和业务单据',
      confirmed: '指定门店的指定 SKU 出现一笔实付价 24.9 元的销售记录',
      unknown: '是否使用消费券、促销由谁承担、是否已获批准',
      next: '核对这条 POS 记录的法人范围、数据负责人和字段权限',
      visual: 'source-grid-loop',
      body: `<div class="sn-blueprint sn-source-map" aria-label="七类经营信息来源进入采集入口">
        <div class="sn-source-grid">
          <span class="sn-source-node"><b class="sn-source-name">SAP/ERP</b><small class="sn-source-note">订单 · 生产 · 库存 · 财务</small></span>
          <span class="sn-source-node"><b class="sn-source-name">WMS/TMS</b><small class="sn-source-note">出入库 · 在途 · 签收 · 批次</small></span>
          <span class="sn-source-node"><b class="sn-source-name">CRM/SRM</b><small class="sn-source-note">客户 · 渠道 · 合同 · 供应商</small></span>
          <span class="sn-source-node"><b class="sn-source-name">POS/零售平台</b><small class="sn-source-note">PRICE-0249 · 实付 24.9 元</small></span>
          <span class="sn-source-node"><b class="sn-source-name">智慧农场/养殖</b><small class="sn-source-note">存栏 · 日龄 · 健康 · 出栏</small></span>
          <span class="sn-source-node"><b class="sn-source-name">飞书</b><small class="sn-source-note">审批 · 任务 · 日报 · 补充信息</small></span>
          <span class="sn-source-node"><b class="sn-source-name">外部市场</b><small class="sn-source-note">政策 · 汇率 · 物流 · 天气 · 行业线索</small></span>
        </div>
        <div class="sn-flow-arrow" aria-hidden="true"><span class="sn-flow-line"></span><span class="sn-flow-head">→</span></div>
        <div class="sn-gate-node"><small class="sn-gate-kicker">PRICE-0249</small><strong class="sn-gate-title">POS 价格事实</strong><span class="sn-status-chip">已登记来源</span></div>
      </div>`
    },
    {
      id: 'access-scope',
      number: '02',
      code: 'ACCESS GATE',
      title: '价格看得见，还要确认能不能用',
      description: '采集层核对 PRICE-0249 归属的法人、门店、POS 单据和字段权限。没有授权就停止接收，不用越权数据补全故事。',
      current: '核对 PRICE-0249 的来源责任与访问权限',
      confirmed: '实付 24.9 元来自已登记的 POS 业务记录',
      unknown: '该租户是否允许读取优惠明细、促销标识和承担方字段',
      next: '权限通过后，补齐这笔价格记录的三个时间',
      visual: 'permission-gate',
      body: `<div class="sn-blueprint sn-permission-gate" aria-label="来源经过责任和权限校验">
        <div class="sn-record-node"><small class="sn-record-kicker">PRICE-0249</small><strong class="sn-record-title">实付 24.9 元</strong><span class="sn-record-meta">POS 来源已登记</span></div>
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
      title: '这笔 24.9 元，三个时间要分开',
      description: '分别记录顾客实际支付、POS 正式记账和平台收到 PRICE-0249 的时间，避免把迟到数据误当成刚发生的价格变化。',
      current: '为 PRICE-0249 补齐业务、记账和接收时间',
      confirmed: '实付 24.9 元的业务发生时间可与记账、接收时间区分',
      unknown: '若存在延迟，是发生在门店录入、POS 记账还是接入链路',
      next: '按价格事件的业务时效标记真实接收等级',
      visual: 'three-clock-loop',
      body: `<div class="sn-blueprint sn-time-rail" aria-label="同一经营事实的三个时间">
        <div class="sn-time-node sn-is-origin"><span class="sn-time-index">T1</span><small class="sn-time-label">顾客支付时间</small><strong class="sn-time-value">实付 24.9 元</strong></div>
        <div class="sn-time-link"><span class="sn-time-pulse"></span><small class="sn-time-link-label">记录间隔</small></div>
        <div class="sn-time-node"><span class="sn-time-index">T2</span><small class="sn-time-label">POS 记账时间</small><strong class="sn-time-value">单据正式留痕</strong></div>
        <div class="sn-time-link"><span class="sn-time-pulse"></span><small class="sn-time-link-label">传输间隔</small></div>
        <div class="sn-time-node sn-is-received"><span class="sn-time-index">T3</span><small class="sn-time-label">平台接收时间</small><strong class="sn-time-value">PRICE-0249 进入处理</strong></div>
        <div class="sn-time-result"><span class="sn-status-chip">三时并列</span><b class="sn-time-result-text">延迟可以追到具体环节</b></div>
      </div>`
    },
    {
      id: 'freshness-levels',
      number: '04',
      code: 'FRESHNESS',
      title: '价格记录多快到，如实标注',
      description: 'PRICE-0249 是通过消息回调秒级到达，还是由接口轮询、文件批次送达，应按真实接入方式登记，不统一宣称“实时”。',
      current: '标记 PRICE-0249 的真实接收方式和时效等级',
      confirmed: '该记录的三个时间已分开保留',
      unknown: '价格类数据允许的最长延迟和超时处理标准',
      next: '将接收方式和未确认的时效标准一并写入原始数据包',
      visual: 'freshness-lanes',
      body: `<div class="sn-blueprint sn-freshness-board" aria-label="四种数据接收时效等级">
        <div class="sn-freshness-scale"><span class="sn-scale-label">快</span><span class="sn-scale-line"></span><span class="sn-scale-label">按业务需要</span></div>
        <div class="sn-freshness-lanes">
          <div class="sn-freshness-lane"><span class="sn-lane-level">秒级</span><b class="sn-lane-method">消息回调 / 增量变更</b><small class="sn-lane-boundary">有能力且有授权时</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">分钟级</span><b class="sn-lane-method">高时效接口查询</b><small class="sn-lane-boundary">按业务节奏配置</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">小时级</span><b class="sn-lane-method">常规接口查询</b><small class="sn-lane-boundary">满足管理时效即可</small></div>
          <div class="sn-freshness-lane"><span class="sn-lane-level">批次</span><b class="sn-lane-method">约定文件处理</b><small class="sn-lane-boundary">明确批次时间</small></div>
        </div>
        <p class="sn-boundary-note"><span class="sn-boundary-mark">PRICE-0249</span>只记真实到达等级，不因“实时”标签掩盖延迟。</p>
      </div>`
    },
    {
      id: 'raw-envelope',
      number: '05',
      code: 'RAW DATA',
      title: '封装 PRICE-0249，未知原因不乱填',
      description: '将实付 24.9 元的原始值、POS 来源、三个时间、权限和时效状态放进同一个数据包。消费券、促销审批等原因仍保留为未知。',
      current: '封装 PRICE-0249 的采集结果并明示证据缺口',
      confirmed: '门店实付 24.9 元的原始值、来源、时间和权限状态已封装',
      unknown: '优惠构成、活动审批、承担方以及其他来源是否与 POS 记录冲突',
      next: '将原样数据包交给可靠传输层，不在采集层调查原因',
      visual: 'evidence-envelope',
      body: `<div class="sn-blueprint sn-envelope-board" aria-label="带来源时间权限和质量状态的原始数据">
        <div class="sn-envelope-shell">
          <div class="sn-envelope-head"><span class="sn-envelope-id">PRICE-0249</span><strong class="sn-envelope-title">门店实付 24.9 元</strong><span class="sn-status-chip">PARTIAL</span></div>
          <div class="sn-envelope-fields">
            <span class="sn-field-node"><small class="sn-field-label">SOURCE</small><b class="sn-field-value">POS 单据已登记</b></span>
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
  caseId: 'PRICE-0249',
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
      title: '验明 POS 发送方，接收 PRICE-0249',
      description: '可靠传输层先核对发送方身份和授权范围，再接收包含“实付 24.9 元”的原始数据包。本层不评价这个价格。',
      current: '校验 PRICE-0249 发送方并建立接收凭据',
      confirmed: 'POS 来源、实付 24.9 元和采集权限状态随包到达',
      unknown: '发送身份是否仍有效、是否超出法人或字段范围',
      next: '用 PRICE-0249 检查同一数据包是否重复送达',
      visual: 'identity-gate',
      body: `<div class="sn-blueprint sn-identity-flow" aria-label="原始数据经过身份校验进入可靠传输">
        <div class="sn-record-node"><small class="sn-record-kicker">INBOUND</small><strong class="sn-record-title">实付 24.9 元</strong><span class="sn-record-meta">PRICE-0249</span></div>
        <div class="sn-security-gate"><span class="sn-gate-bracket">[</span><div class="sn-gate-copy"><small class="sn-gate-kicker">IDENTITY CHECK</small><b class="sn-gate-title">身份 · 法人 · 字段权限</b></div><span class="sn-gate-bracket">]</span></div>
        <div class="sn-record-node sn-is-accepted"><small class="sn-record-kicker">ACCEPTED</small><strong class="sn-record-title">PRICE-0249</strong><span class="sn-status-chip">已接收</span></div>
      </div>`
    },
    {
      id: 'idempotent-receive',
      number: '02',
      code: 'IDEMPOTENCY',
      title: '同一笔 24.9 元，重复送达也只记一次',
      description: 'PRICE-0249 再次到达时不新建价格记录，只返回原接收结果，避免一笔销售被误当成多次降价信号。',
      current: '检查 PRICE-0249 是否已经接收',
      confirmed: 'PRICE-0249 已有唯一接收凭据',
      unknown: '上游为什么重复发送、是否还有关联价格记录迟到',
      next: '保留唯一记录，按原业务顺序放入传输队列',
      visual: 'idempotency-loop',
      body: `<div class="sn-blueprint sn-idempotency-board" aria-label="重复记录被幂等拦截">
        <div class="sn-duplicate-stack">
          <span class="sn-packet-node sn-is-first"><b class="sn-packet-id">PRICE-0249</b><small class="sn-packet-state">首次到达 · 24.9 元</small></span>
          <span class="sn-packet-node sn-is-repeat"><b class="sn-packet-id">PRICE-0249</b><small class="sn-packet-state">重复到达 · 不新建</small></span>
        </div>
        <div class="sn-idempotent-gate"><small class="sn-gate-kicker">ONE KEY · ONE RESULT</small><strong class="sn-gate-title">同一条只收一次</strong><span class="sn-loop-mark" aria-hidden="true">↻</span></div>
        <div class="sn-single-result"><span class="sn-result-count">01</span><b class="sn-result-title">唯一原始记录</b><small class="sn-result-note">重复请求返回同一结果</small></div>
      </div>`
    },
    {
      id: 'order-retry',
      number: '03',
      code: 'ORDER / RETRY',
      title: '保持价格记录顺序，送达失败可重试',
      description: 'PRICE-0249 按原业务顺序送往数据与证据底座；接口短暂失败时受控重试，每次尝试都留下时间和结果。',
      current: '为 PRICE-0249 排序并执行受控重试',
      confirmed: '重复已拦截，“实付 24.9 元”的原始内容未被改写',
      unknown: '当前失败是暂时拥堵、接口中断还是权限变化',
      next: '若达到重试上限，将 PRICE-0249 转入异常暂存区',
      visual: 'retry-circuit-loop',
      body: `<div class="sn-blueprint sn-retry-circuit" aria-label="记录按顺序传输并在失败后重试">
        <div class="sn-sequence-rail">
          <span class="sn-sequence-node sn-is-done"><b class="sn-sequence-id">001</b><small class="sn-sequence-state">送达</small></span>
          <span class="sn-sequence-link"></span>
          <span class="sn-sequence-node sn-is-retrying"><b class="sn-sequence-id">PRICE-0249</b><small class="sn-sequence-state">重试中</small></span>
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
      title: 'PRICE-0249 送不动时先留住，修复后再回放',
      description: '超过重试上限时，整个 PRICE-0249 原始数据包进入异常暂存区。修复链路并重新确认权限后，按原内容回放，不手工改写价格。',
      current: '隔离送达失败的 PRICE-0249 并保留恢复入口',
      confirmed: '实付 24.9 元、失败记录和每次尝试过程均已保留',
      unknown: '链路故障是否已消除、回放是否仍在原授权范围内',
      next: '确认修复和权限后，将 PRICE-0249 回到原队列',
      visual: 'dead-letter-replay-loop',
      body: `<div class="sn-blueprint sn-recovery-loop" aria-label="失败记录进入死信暂存并在修复后回放">
        <div class="sn-queue-node"><small class="sn-queue-label">DELIVERY QUEUE</small><b class="sn-queue-title">正常队列</b></div>
        <div class="sn-failure-path"><span class="sn-path-arrow">→</span><small class="sn-path-label">重试到上限</small></div>
        <div class="sn-dead-letter-node"><small class="sn-dead-letter-label">PRICE-0249</small><strong class="sn-dead-letter-title">异常暂存区</strong><span class="sn-status-chip">等待修复</span></div>
        <div class="sn-replay-path"><span class="sn-replay-arrow" aria-hidden="true">↺</span><div class="sn-replay-copy"><small class="sn-replay-label">REPLAY</small><b class="sn-replay-title">核准后回放原记录</b></div></div>
        <div class="sn-queue-node sn-is-return"><small class="sn-queue-label">RETURN</small><b class="sn-queue-title">回到原队列</b></div>
      </div>`
    },
    {
      id: 'traceable-record',
      number: '05',
      code: 'TRACE',
      title: '交付的是可追溯的 PRICE-0249，还不是结论',
      description: '实付 24.9 元的原始内容、接收时间、顺序、重复、重试和回放记录一起保存。可靠传输层只保证送得到、查得回，不判断 24.9 元是否合理。',
      current: '汇总 PRICE-0249 可靠传输的全程留痕',
      confirmed: 'PRICE-0249 的原始值可追溯、可重试、可回放',
      unknown: '24.9 元与统一价盘是否可比、是否存在合法例外',
      next: '将 PRICE-0249 交给经营证据层统一对象、口径并检查质量',
      visual: 'trace-ledger',
      body: `<div class="sn-blueprint sn-trace-ledger" aria-label="可靠传输全程留痕">
        <div class="sn-ledger-head"><span class="sn-ledger-id">PRICE-0249</span><strong class="sn-ledger-title">价格记录传输台账</strong><span class="sn-status-chip">TRACEABLE</span></div>
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
  caseId: 'PRICE-0249',
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
      title: '先确认 24.9 元和 29.9 元说的是同一个商品',
      description: '将 POS 中的门店编码、SKU 和实付价，与价盘中的商品、规格、区域和生效时间映射到同一经营对象，同时保留原编号。',
      current: '对齐 PRICE-0249 的 POS 对象与统一价盘对象',
      confirmed: '门店实付 24.9 元的来源和传输过程可追溯',
      unknown: '两系统的编码是否确指同一 SKU、规格、门店和生效时段',
      next: '由数据和业务负责人确认对应关系，再绑定价格口径',
      visual: 'entity-map-loop',
      body: `<div class="sn-blueprint sn-entity-map" aria-label="不同来源标识映射到统一经营对象">
        <div class="sn-alias-column">
          <span class="sn-alias-node"><small class="sn-alias-source">POS</small><b class="sn-alias-value">门店 SKU · 实付 24.9</b></span>
          <span class="sn-alias-node"><small class="sn-alias-source">统一价盘</small><b class="sn-alias-value">标准 SKU · 指导价 29.9</b></span>
          <span class="sn-alias-node"><small class="sn-alias-source">PRICE-0249</small><b class="sn-alias-value">门店 · 区域 · 生效时间</b></span>
        </div>
        <div class="sn-map-links"><span class="sn-map-line"></span><span class="sn-map-line"></span><span class="sn-map-line"></span></div>
        <div class="sn-canonical-node"><small class="sn-canonical-kicker">CANONICAL OBJECT</small><strong class="sn-canonical-title">统一经营对象</strong><div class="sn-canonical-fields"><span class="sn-field-chip">SKU</span><span class="sn-field-chip">门店</span><span class="sn-field-chip">区域</span><span class="sn-field-chip">价格</span><span class="sn-field-chip">批次</span><span class="sn-field-chip">时间</span></div></div>
      </div>`
    },
    {
      id: 'definition-version',
      number: '02',
      code: 'DEFINITION',
      title: '对比前，先说清“实付价”和“统一价盘”',
      description: '系统绑定企业已批准的价格口径：24.9 是顾客实际支付额，29.9 是当前适用的统一价盘，并记录版本、区域和生效日期。',
      current: '为 PRICE-0249 绑定实付价和统一价盘的口径版本',
      confirmed: '同一 SKU、门店、区域和时间对象已保留原编号与对应关系',
      unknown: '业务部门是否批准当前 29.9 元价盘版本、当日是否存在新版本',
      next: '检查 24.9 元记录在当前口径下是否完整、及时且无冲突',
      visual: 'definition-version-rail',
      body: `<div class="sn-blueprint sn-definition-board" aria-label="经营口径按版本和生效日期管理">
        <div class="sn-definition-object"><small class="sn-definition-label">PRICE-0249</small><strong class="sn-definition-title">实付 24.9 元 vs 价盘 29.9 元</strong></div>
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
      title: '先排除“24.9 元是坏数据”',
      description: '检查 PRICE-0249 的必填字段、三个时间、商品和门店映射，并核对其他授权来源是否冲突。若数据可疑，只登记质量问题，不解释成经营异常。',
      current: '检查 PRICE-0249 的完整性、时效、冲突和字段有效性',
      confirmed: '实付 24.9 元与统一价盘 29.9 元已绑定对象和口径版本',
      unknown: '优惠明细、促销标识或其他来源的缺失是否会改变后续调查',
      next: '重要缺口转人工确认；未解决前，PRICE-0249 明确标记证据不足',
      visual: 'quality-console',
      body: `<div class="sn-blueprint sn-quality-console" aria-label="经营记录的数据质量检查台">
        <div class="sn-quality-head"><small class="sn-quality-kicker">PRICE-0249</small><strong class="sn-quality-title">24.9 元数据质量检查</strong><span class="sn-status-chip">PARTIAL</span></div>
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
      title: '用已批准的价盘和合法例外检查“5 元差额”',
      description: '程序只执行企业已批准、在有效期内且适用于当前门店的条件：统一价盘 29.9 元，实付 24.9 元，差额 5 元。此处只产生匹配结果，不定性违规。',
      current: '为 PRICE-0249 匹配当前价盘、促销和消费券例外版本',
      confirmed: '24.9 元与 29.9 元的 5 元差额、质量状态和证据缺口已登记',
      unknown: '当日消费券或促销例外是否已批准、在有效期内且适用当前门店',
      next: '记录规则版本和匹配结果，产生待 Agent 调查的价格事件',
      visual: 'exception-rule-gate',
      body: `<div class="sn-blueprint sn-rule-gate" aria-label="合法例外和判断条件的版本校验">
        <div class="sn-rule-input"><small class="sn-rule-input-label">PRICE-0249</small><strong class="sn-rule-input-title">24.9 元 vs 29.9 元</strong></div>
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
      title: '形成 PRICE-0249 待调查事件，把原因留给 Agent',
      description: '程序将门店实付 24.9 元、统一价盘 29.9 元、5 元差额、来源、时间、口径、质量和规则版本打包成待调查事件。它说明“需要查”，不说明“已违规”。',
      current: '登记 PRICE-0249 待调查事件并附上完整证据索引',
      confirmed: '24.9 元实付、29.9 元价盘、5 元差额以及来源、时间、口径、质量和条件版本可追溯',
      unknown: '差额是否由消费券、已批促销或未授权改价造成，以及影响范围和严重程度',
      next: '交给 Aily 按企业经验从小到大调查；证据不足时等待或转人工',
      visual: 'signal-register',
      body: `<div class="sn-blueprint sn-signal-register" aria-label="程序登记待调查经营信号而不作违规判断">
        <div class="sn-signal-input-stack">
          <span class="sn-signal-input"><small class="sn-input-label">OBJECT</small><b class="sn-input-value">统一经营对象</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">EVIDENCE</small><b class="sn-input-value">来源与原始记录</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">VERSION</small><b class="sn-input-value">口径与条件版本</b></span>
          <span class="sn-signal-input"><small class="sn-input-label">QUALITY</small><b class="sn-input-value">质量与缺口</b></span>
        </div>
        <div class="sn-register-arrow"><span class="sn-register-line"></span><span class="sn-register-head">→</span></div>
        <div class="sn-signal-node"><small class="sn-signal-kicker">PRICE-0249</small><strong class="sn-signal-title">24.9 vs 29.9 待调查事件</strong><span class="sn-status-chip">UNKNOWN CAUSE</span></div>
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
