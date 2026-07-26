/* ═══════════════════════════════════════════════════════════
   data.js · window.RPT — 全站唯一数据层（键名契约）
   事实源：docs/…/评委展示稿_待确认/01_经营事件循环_评委稿_重写版_待确认.md
   规则：所有模拟数字标 simulated:true；factTag 只用五类：
   '圣农公开事实' | '行业验证经验' | '官方技术依据' | '本方案设计判断' | '待企业验证'
   srcId 对应 sources.js 的 K 锚点。
   ═══════════════════════════════════════════════════════════ */
window.RPT = (() => {

  // ── §0 关键事实（证据对象上悬挂的数字） ──
  const keyFacts = [
    { label: "已建成数字底座", value: "SAP + 智慧农场", sub: "2024 年报披露已上线；2025 年报提出“AI+BI”双轨与智慧中台", factTag: "圣农公开事实", srcId: "K1" },
    { label: "零售场景覆盖", value: "10 区域 · 300+ 业务员", sub: "日报、经销商台账、POS 流水、价格巡查分散在 6 个系统", factTag: "圣农公开事实", srcId: "K3" },
    { label: "异常处置现状", value: "4–5 天", sub: "价格异常从投诉到处置的平均耗时（官方赛题披露）", factTag: "圣农公开事实", srcId: "K3" },
    { label: "归并出口", value: "3 个", sub: "独立成案 / 强制专家复核 / 停在成案前——没有第四个出口", factTag: "本方案设计判断", srcId: "K10" },
    { label: "权威案件记录", value: "7 类档案", sub: "一份受控逻辑记录；备份、缓存、只读投影不算第二套真相", factTag: "本方案设计判断", srcId: "K10" },
    { label: "模块停止条件", value: "12 类", sub: "哪里报错哪里停止；完整模块清单见母稿 2.4.2", factTag: "本方案设计判断", srcId: "K9" },
    { label: "正式结案类型", value: "3 类", sub: "成功解决 / 合法例外 / 系统误报；“查不清”不是结案", factTag: "本方案设计判断", srcId: "K10" },
    { label: "待企业验证项", value: "10 项", sub: "真实字段、接口、租户能力、组织权限、端到端回放全部为 unknown", factTag: "待企业验证", srcId: "K10" },
  ];

  // ── §0 证据对象：案件档案夹（24.9 元模拟案件 E1-C1） ──
  const dossier = {
    caseId:         { value: "E1-C1",   label: "案件编号",        basis: "价格试点 E1/C1 同号关联", srcId: "K10", simulated: true },
    eventType:      { value: "价格异常", label: "事件类型",        basis: "待调查，不等于违规结论", srcId: "K10", simulated: true },
    observed:       { value: 24.9,      label: "观测成交价（元）", basis: "POS 交易 TX-9001，门店 ST021，商品 P001", srcId: "K10", simulated: true },
    baseline:       { value: 29.9,      label: "候选价格基准（元）", basis: "异常检测规则匹配；适用性待确认", srcId: "K10", simulated: true },
    signalId:       { value: "SIG-0001", label: "候选异常信号",    basis: "只表示“值得调查”；展示别名 S1-01", srcId: "K10", simulated: true },
    parseRunId:     { value: "PR-0001", label: "事件解析记录",    basis: "清洗、确定性去重、初次归并、分类全程留痕", srcId: "K10", simulated: true },
    archives:       { value: 7,         label: "档案分类数",      basis: "七类业务记录组织一份权威案件记录", srcId: "K10", simulated: false },
    timelineSteps:  { value: 15,        label: "全流程时点",      basis: "T1 事实更新 → T15 结案，逐步留痕", srcId: "K10", simulated: true },
    closureTypes:   { value: 3,         label: "结案类型",        basis: "成功解决 / 合法例外 / 系统误报", srcId: "K10", simulated: false },
    stopRules:      { value: 12,        label: "停止条件模块",    basis: "哪里报错哪里停止，不跳过不猜测", srcId: "K9", simulated: false },
    traditionalDays:{ value: "4–5天",   label: "传统处置耗时",    basis: "官方赛题：价格异常从投诉到处置平均 4—5 天", srcId: "K3", simulated: false },
    humanGates:     { value: "人在关键处", label: "人工接管点",    basis: "补证、决定、执行、结案确认由人承担", srcId: "K10", simulated: false },
  };

  // ── §5 时间线 T1–T15（lane 四泳道，全部 simulated） ──
  const timeline = [
    { id: "T1",  lane: "发现成案", title: "POS 事实更新",        detail: "KWeaver 获得事实变化，映射为商品、门店、成交记录对象；记录源记录 ID、业务时间、读取时间和版本。此时尚无候选异常，不创建案件。", simulated: true },
    { id: "T2",  lane: "发现成案", title: "异常规则命中",        detail: "保存独立候选异常信号 SIG-0001：规则 ID 与版本、观测值 24.9 元、候选基准 29.9 元、所引用事实的快照。", simulated: true },
    { id: "T3",  lane: "发现成案", title: "事件解析运行",        detail: "清洗、确定性去重、初次归并、分类；保存解析记录 PR-0001、输入信号、各项依据与不确定项。", simulated: true },
    { id: "T4",  lane: "发现成案", title: "经营事件形成",        detail: "创建价格异常事件 E1，输出经营事件包 v1；记录 E1 与 SIG-0001/PR-0001 的关系；不认定违规。", simulated: true },
    { id: "T5",  lane: "发现成案", title: "可靠建案",            detail: "原子创建调查案件 C1；落库后发布内部 case_created；并行发送飞书“案件已建立”通知（二者不是同一条消息）。", simulated: true },
    { id: "T6",  lane: "调查补证", title: "Agent 调查",          detail: "独立上下文 A1 加载价格领域 Skill（本例演示模板运行），由小到大补证；每次查询、返回、异常状态与证据版本全部留痕。", simulated: true },
    { id: "T7",  lane: "调查补证", title: "发起人工补证",        detail: "必需信息只能由人提供：创建补证请求，按分层规则通知；记录缺口、用途、责任人、期限、消息与任务编号。", simulated: true },
    { id: "T8",  lane: "调查补证", title: "等待补证",            detail: "Agent 只做不依赖缺口的查询，生成《待补证事实汇总报告（未分析）》；禁止业务分析；按规则提醒与逐级升级。", simulated: true },
    { id: "T9",  lane: "调查补证", title: "补证完成，恢复分析",  detail: "以“事实汇总报告 + 补证内容”为共同输入恢复分析；记录人工材料、提交人、完整性确认结果。", simulated: true },
    { id: "T10", lane: "决策执行", title: "决策就绪",            detail: "满足停止条件后形成决策就绪包，列出已确认事实、仍未知项、可能合法例外与建议；提示授权负责人复核。", simulated: true },
    { id: "T11", lane: "决策执行", title: "管理决定",            detail: "授权管理者确认需调整价格并批准执行（模拟动作）；记录审批人、依据、时间、适用范围、送达与已读。", simulated: true },
    { id: "T12", lane: "决策执行", title: "责任执行",            detail: "创建责任任务，执行人完成调价；任务完成只表示执行成功，不表示问题解决。", simulated: true },
    { id: "T13", lane: "验证结案", title: "待结果验证",          detail: "案件保持打开，保存 next_check_at 并到期提醒；记录业务验证条件、观察期、责任路由。", simulated: true },
    { id: "T14", lane: "验证结案", title: "结果验证",            detail: "按业务里程碑回读 POS/SAP 权威事实；记录回读结果、证据版本、验证条件和结论。", simulated: true },
    { id: "T15", lane: "验证结案", title: "结案",                detail: "达到经营目标：标记成功解决，形成关闭记录并进入能力进化循环；未达成则围绕原 C1 返回调查。", simulated: true },
  ];

  // ── §3 候选信号命运流（归并三出口 + 重复保留 + 停在成案前，simulated） ──
  const signals = {
    entities: [
      { id: "SIG-0001", type: "成交价低于候选匹配价格基准", objects: "P001 · ST021 · TX-9001", observed: 24.9, baseline: 29.9, outcome: "独立成案", note: "稳定主键明确，正常独立成案 → E1", simulated: true },
      { id: "SIG-0002", type: "成交价低于候选匹配价格基准", objects: "P001 · ST021 · TX-9001", observed: 24.9, baseline: 29.9, outcome: "重复标记保留", note: "确定性去重键一致：只标记处理结果，不删除原记录", simulated: true },
      { id: "SIG-0003", type: "成交价低于候选匹配价格基准", objects: "P001 · ST021 · 同一 30m 时间窗", observed: 24.9, baseline: 29.9, outcome: "归并成员", note: "归并主键一致：作为成员信号并入 E1（PR-0001 归并依据）", simulated: true },
      { id: "SIG-0004", type: "成交价低于候选匹配价格基准", objects: "来源版本无法可靠确定", observed: null, baseline: null, outcome: "停在成案前", note: "事件类型、核心对象、来源版本或解析依据无法可靠确定：不输出事件包、不创建案件", simulated: true },
    ],
    outcomes: [
      { id: "独立成案",     desc: "稳定主键明确不同：正常保持独立，分别继续处理；这不是错误" },
      { id: "归并成员",     desc: "归并主键与时间窗一致：作为成员信号进入同一经营事件" },
      { id: "重复标记保留", desc: "被判重复的信号只标记处理结果，不删除原记录；系统不强行猜测合并" },
      { id: "停在成案前",   desc: "关系模糊保持独立成案并强制专家复核；完全无法确定则停在成案前" },
    ],
    links: [
      { from: "SIG-0001", to: "独立成案",     via: "PR-0001" },
      { from: "SIG-0002", to: "重复标记保留", via: "PR-0001 去重" },
      { from: "SIG-0003", to: "归并成员",     via: "PR-0001 归并" },
      { from: "SIG-0004", to: "停在成案前",   via: "解析中止" },
    ],
    simulated: true,
  };

  // ── §6 七类档案（6.4） ──
  const archives = [
    { no: "01", name: "源事实与信号档案",     holds: "权威事实引用、候选异常信号、检测规则与版本",       thesis: "一切结论的起点：先证明“事实确实这样来过”。" },
    { no: "02", name: "语义解析与事件档案",   holds: "解析运行、清洗去重、归并分类、经营事件、事件包各版本", thesis: "把分散字段变成可信事件的全过程，每个版本可重放。" },
    { no: "03", name: "案件与 Agent 运行档案", holds: "调查案件、CaseState、Agent 运行、Skill 版本",      thesis: "Agent 做了什么、依据哪个版本，全部留档。" },
    { no: "04", name: "调查证据档案",         holds: "查询请求与结果、来源版本、证据引用、人工补证",       thesis: "证据正文只存一次，后续环节只写编号与版本。" },
    { no: "05", name: "决策治理档案",         holds: "决策就绪包、审批、知悉、风险接受与复核",             thesis: "决定权留在人手里，并留下可追溯凭据。" },
    { no: "06", name: "执行验证档案",         holds: "任务、动作回执、业务里程碑与结果验证",               thesis: "任务完成与问题解决分开保存，互不冒充。" },
    { no: "07", name: "审计归档与重开档案",   holds: "关闭依据、未决风险、重开与能力进化交接",             thesis: "结案有门槛；正式关闭后才进入能力进化循环。" },
  ];

  // ── §6 停止条件闸门（6.2 精选 12 条；hasBypass 恒 false） ──
  const gates = [
    { module: "权威事实进入",        condition: "源记录缺失、格式错误、重复乱序无法处理、版本无法识别、接口或权限失败：停止受影响事实及其下游", level: "停止",   hasBypass: false },
    { module: "语义映射",            condition: "字段含义、单位、主键或对象关系无法可靠映射，或映射执行报错：停止；业务含义无法确定时转人工确认", level: "转人工", hasBypass: false },
    { module: "异常检测规则",        condition: "最低数据条件不满足、阈值或口径冲突、规则或依赖运行失败：停止本次评估，不产生候选信号",       level: "停止",   hasBypass: false },
    { module: "清洗与确定性去重",    condition: "编码无法标准化、去重主键缺失、同一主键冲突事实或程序失败：停止本次解析；无法证明重复时保留全部信号", level: "停止", hasBypass: false },
    { module: "事件分类",            condition: "事件类型无法确定、多个类型冲突或分类执行失败：停在成案前",                               level: "停止",   hasBypass: false },
    { module: "经营事件包生成",      condition: "事件类型、核心对象、来源版本或解析依据无法可靠确定，或生成失败：停止；后续调查信息未取得不属于停止条件", level: "停止", hasBypass: false },
    { module: "可靠建案 case_created", condition: "案件落库、事务提交或消息发布失败：停止，不启动 Agent；重复消息不得重复建案",           level: "停止",   hasBypass: false },
    { module: "Agent 选择 Skill",    condition: "无匹配 Skill、多个候选冲突、版本不兼容或无调用权限：停止，不强行选择",                   level: "停止",   hasBypass: false },
    { module: "Skill 调查与查询",    condition: "必需查询无权限、数据过期或冲突、工具超时或格式错误且无既定预案：停止；只能由人提供的信息转人工补证", level: "转人工", hasBypass: false },
    { module: "管理决定与责任执行",  condition: "没有授权决定不得执行；任务失败、受阻或超时：停止当前执行并返回同一案件",                 level: "转人工", hasBypass: false },
    { module: "结果验证与结案",      condition: "未到验证时间、无法取得结果、目标未达成或关闭依据不足：不得关闭案件",                     level: "停止",   hasBypass: false },
    { module: "经营事件与证据库写入", condition: "主记录、证据或运行日志无法可靠写入：停止依赖该记录的流程，不能假装已经留痕",             level: "停止",   hasBypass: false },
  ];

  // ── 右栏四阶段（data-win 契约） ──
  const phases = [
    { id: "win-detect",      name: "发现与成案", sections: ["sec-exec", "sec-problem", "sec-overview", "sec-semantic"] },
    { id: "win-investigate", name: "调查与补证", sections: ["sec-investigate"] },
    { id: "win-decide",      name: "决策与执行", sections: ["sec-case"] },
    { id: "win-verify",      name: "验证与结案", sections: ["sec-governance", "sec-pilot", "sec-boundary", "sec-appendix", "sec-sources"] },
  ];

  // ── 三类结案（6.6） ──
  const closures = [
    { type: "成功解决", meaning: "管理决定已执行，权威事实回读证明经营目标达到", basis: "执行记录、验证条件、结果证据、验证时间和确认人", impliesError: "否" },
    { type: "合法例外", meaning: "偏离真实存在，但经完整调查确认属于授权促销、审批、业务政策或其他无需纠正的合理情形", basis: "例外依据、授权记录、适用范围、有效期、证据版本和确认人", impliesError: "不一定；候选异常本来只表示“值得调查”" },
    { type: "系统误报", meaning: "本不应产生候选异常、事件分类或调查结论，但源数据、语义映射、检测规则、事件解析或 Agent/Skill 判断发生错误", basis: "误报层级、错误记录、输入与版本、修正责任、影响范围和确认人", impliesError: "是，必须定位到具体能力层" },
  ];

  // ── §5续 管理审批四类走向（母稿 2.2 主链行155–162；飞书方案 §3.2.1-C 状态机合同） ──
  const decisionBranches = [
    { decision: "要求补证或重新调查", flow: "返回 Agent 调查（回到调查取证中）", mustRecord: "决定人、依据、返回范围", isClosure: "否" },
    { decision: "已知悉暂不处理 / 风险接受", flow: "保持打开，持续看板监督，到复核时间或条件触发后返回调查", mustRecord: "授权人、依据、复核时间、未决风险；不标记“已解决”", isClosure: "否——治理状态，不是结案" },
    { decision: "确认系统误报 / 合法例外", flow: "无需执行，由授权负责人确认后正式关闭", mustRecord: "溯源结果、依据、适用范围、有效期", isClosure: "是（三类结案之二）" },
    { decision: "批准执行", flow: "进入责任执行；执行成功只标记任务完成，案件进入待结果验证", mustRecord: "审批人、依据、时间、适用范围", isClosure: "否——闭环才走半程" },
  ];

  // ── §5续 分层通知四级（母稿 3.1 行568–577） ──
  const notifyLevels = [
    { level: "责任人", action: "收到明确待办：案件、事项、用途、入口、期限、完整性要求", rule: "创建后立即通知；必须处理，或明确反馈无法完成的原因" },
    { level: "直属负责人 / 案件负责人", action: "看到内容、责任人、期限与阻塞状态，负责监督", rule: "立即知情；提交、拒绝或超时时同步更新" },
    { level: "更高管理层", action: "按组织与权限在看板实时查看", rule: "普通进展不逐条群发" },
    { level: "逐级升级", action: "—", rule: "仅在逾期、拒绝、高影响或持续阻塞时逐级即时升级；“高影响”只能来自确定性规则、已确认事实阈值或授权人员标记" },
  ];

  // ── §5续 五类“不是结案”（母稿 4.6 行820） ──
  const nonClosures = [
    { state: "信息不足", handling: "继续补证，不得包装成“合法例外”关闭" },
    { state: "无权限", handling: "走权限处理，权限缺口是技术状态，不是业务结论" },
    { state: "数据未同步", handling: "等待或修复同步，迟到数据不能冒充“没有问题”" },
    { state: "系统暂不可用", handling: "等待恢复，平台故障不改变经营事实" },
    { state: "结果冲突", handling: "继续核实，冲突未裁决前无结论" },
  ];

  // ── §5续 关闭记录九字段（母稿 4.6 行836） ──
  const closureFields = [
    { field: "closure_type", meaning: "结案类型（三类之一）" },
    { field: "closure_basis_refs", meaning: "依据引用" },
    { field: "confirmed_by", meaning: "确认人" },
    { field: "confirmed_at", meaning: "确认时间" },
    { field: "scope", meaning: "适用范围" },
    { field: "valid_until", meaning: "有效期（可空）" },
    { field: "provenance_assessment_id", meaning: "溯源记录" },
    { field: "remaining_risk", meaning: "剩余风险" },
    { field: "next_loop_handoff", meaning: "能力进化交接" },
  ];

  // ── §8 待企业验证清单（10 项） ──
  const unknowns = [
    { item: "SAP/POS 真实字段、主键、变更接口、更新时效", status: "unknown；开源代码未证明存在可直接使用的 SAP 原生连接器", method: "现场调研 + 最小端到端试点" },
    { item: "圣农真实价格域对象、关系、经营口径、异常检测与事件解析规则", status: "只有模拟占位模型，非真实首版清单", method: "企业资料 + FDE 与一线专家填充校准" },
    { item: "圣农价格领域 Skill 真实内容", status: "只交付通用模板，不含真实证据清单、顺序、阈值", method: "现场填充 → 脱敏历史回放 → 专家验收 → 受控试运行" },
    { item: "组织树、抽象角色到人员的责任路由、无人负责时的兜底人", status: "原则已确认，真实配置未知", method: "企业访谈与制度确认" },
    { item: "飞书/Aily 目标租户能力（Skill 版本、完整工具 Trace、跨天恢复、运行中追加消息、权限）", status: "公开能力已核实，目标租户未验证；已送达 ≠ 已读 ≠ 已知悉", method: "目标租户最小权限 E2E" },
    { item: "提醒频率、升级层级、“高影响”判断标准", status: "原则已确认，数值未知", method: "现场确认" },
    { item: "数据更新通道的具体形态（事件 / CDC / Webhook / API / 增量轮询 / 适配器）", status: "通道能力已确认，现场选型未定", method: "现场接口核验" },
    { item: "物理数据库、对象存储、Agent 日志接口、飞书投影实现", status: "逻辑结构已确认，物理实现核验中", method: "数据库落地台账 + 24.9 元最小 E2E" },
    { item: "误报溯源链端到端回放", status: "designed_contract，需各组件主动写入", method: "代表性历史案例回放 + 目标环境 E2E" },
    { item: "验收指标的具体达标数值", status: "只定口径，不定数字", method: "取得真实基线后确定" },
  ];

  return { keyFacts, dossier, timeline, signals, archives, gates, phases, closures, unknowns, decisionBranches, notifyLevels, nonClosures, closureFields };
})();
