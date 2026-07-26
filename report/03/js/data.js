/* ═══════════════════════════════════════════════════════════
   data.js · window.RPT — 全站唯一数据层（键名契约）
   事实源：docs/方案合并副本_2026-07-21/循环专题_待确认/03_业务扩域循环_专题工作稿_待确认.md（114 行）
   规则：03 为建议性蓝图（advisory_blueprint）——不虚构收益、成本、
   时间表、数字承诺与实施合同；factTag 本报告只用三类：
   '圣农公开事实' | '本方案设计判断' | '待企业验证'
   srcId 对应 sources.js 的 K1–K5 锚点。
   ═══════════════════════════════════════════════════════════ */
window.RPT = (() => {

  // ── §0 关键事实（03 一页；数量均由真源枚举直接计数，无编造） ──
  const keyFacts = [
    { label: "循环性质", value: "人主导的建议", sub: "不是自动运行的业务系统、评分制度或实施合同；扩域建议由企业确认、调整、暂缓或否决", factTag: "本方案设计判断", srcId: "K1" },
    { label: "企业选择权", value: "4 种走向", sub: "确认 / 调整 / 暂缓 / 否决——扩域选择与实施路径均为建议", factTag: "本方案设计判断", srcId: "K1" },
    { label: "启动参考条件", value: "3 项", sub: "可核验结果 / 重复运行 / 风险已说明——大致参考，不是固定门槛", factTag: "本方案设计判断", srcId: "K1" },
    { label: "共创手段", value: "5 步", sub: "沟通目标 → 核验痛点 → 复查试点 → 情景推演 → 分阶段建议", factTag: "本方案设计判断", srcId: "K1" },
    { label: "共创角色", value: "4 方", sub: "管理层 / 业务域负责人与一线 / IT·数据·安全 / FDE·方案团队（不替企业拍板）", factTag: "本方案设计判断", srcId: "K1" },
    { label: "候选场景", value: "3 个", sub: "首选建议：渠道库存与动销协同；顺序为方案推断，非圣农批准的路线", factTag: "本方案设计判断", srcId: "K1" },
    { label: "年报方向支撑", value: "7 个方向", sub: "精准预测、高效生产、精益仓储、智能物流、产销协同、全渠道策略、B 端客户全周期管理", factTag: "圣农公开事实", srcId: "K2" },
    { label: "待企业核验", value: "13 项", sub: "六项事实核验（痛点/数据/负责人/资源/顺序/价值）+ 七类有意留白（接口/字段/权限/责任人/阈值/预算/部署）", factTag: "待企业验证", srcId: "K1" },
  ];

  // ── §5 三个候选场景（03 工作稿 行82–90；顺序为方案推断，非圣农批准的路线；不含收益/成本数字） ──
  const expansionCandidates = [
    { order: 1, tag: "首选建议", scenario: "渠道库存与动销协同",
      suggestion: "建议作为首选下一试点。它与价格、产品、区域、客户和渠道等已有对象较相邻，也与年报中的产销协同、精益仓储和智能物流方向相符",
      evPublic: "年报方向相符（产销协同 / 精益仓储 / 智能物流）",
      evDesign: "首选建议与相邻性判断为方案推断",
      evUnknown: "真实痛点与数据可得性待企业核验", srcId: "K1" },
    { order: 2, tag: "", scenario: "全渠道促销执行与毛利治理",
      suggestion: "价格政策和渠道能力可能较容易复用，但需由企业判断它是价格域继续深化，还是值得形成独立扩域场景",
      evPublic: null,
      evDesign: "复用可能性为方案推断",
      evUnknown: "是否独立成域由企业判断", srcId: "K1" },
    { order: 3, tag: "后续备选", scenario: "B 端客户全周期履约治理",
      suggestion: "年报已有明确战略方向，但预计需要补充订单、合同、履约和物流等更多信息，建议作为后续备选",
      evPublic: "年报战略方向（B 端客户全周期管理）",
      evDesign: "信息补充需求为方案推断",
      evUnknown: "内部优先级待企业核验", srcId: "K1" },
  ];

  // ── §2 共创顺序（03 工作稿 行24–38 mermaid + 行40 注；企业选择三分支） ──
  const cocreateSteps = {
    main: [
      { id: "N1", label: "已有试点形成可参考结果" },
      { id: "N2", label: "与企业沟通经营目标与治理诉求" },
      { id: "N3", label: "共同盘点资料、已有能力与现实约束" },
      { id: "N4", label: "提出候选场景与首选建议" },
      { id: "N5", label: "共同形成分阶段业务扩域蓝图" },
      { id: "N6", label: "企业选择", gate: true },
    ],
    branches: [
      { choice: "采纳", flow: "建议开展小范围新场景试点 → 新场景重新进入 01 经营事件循环 → 真实结果形成后回到 03 更新建议" },
      { choice: "调整", flow: "回到共同盘点（N3）" },
      { choice: "暂缓或否决", flow: "保留依据，待条件变化后再讨论" },
    ],
    note: "箭头只表达建议的共创顺序，不代表自动化工作流：03 不设计自动触发、自动评分、自动选场景、自动审批或自动扩域；未来即使增加工具，也建议先用于资料整理和证据汇总，不替企业作经营决策",
  };

  // ── §3 五步共创手段（03 工作稿 行44–48） ──
  const fiveSteps = [
    { step: "第一步", action: "与管理层沟通经营目标和治理诉求" },
    { step: "第二步", action: "与候选业务域负责人及一线人员核验真实痛点" },
    { step: "第三步", action: "共同复查首个试点的结果、已有能力和未解决问题" },
    { step: "第四步", action: "结合企业资料，用简要情景推演讨论候选场景的数据、协作和风险" },
    { step: "第五步", action: "形成分阶段扩域建议，由企业选择采纳、调整或暂缓" },
  ];

  // ── §3 四方角色分工（03 工作稿 行50；FDE 不替企业拍板，信息不足可建议暂缓） ──
  const cocreateRoles = [
    { role: "企业管理层", duty: "提供经营方向" },
    { role: "候选业务域负责人 · 一线人员", duty: "核验真实痛点与现实做法" },
    { role: "IT · 数据 · 安全团队", duty: "说明可行性与约束" },
    { role: "FDE · 方案团队", duty: "负责资料分析、能力盘点和建议整理——不替企业拍板；没有明确业务负责人或关键信息不足时，可以建议暂缓" },
  ];

  // ── §4 判断维度（03 工作稿 行54；不形成分数、权重、固定阈值或强制选择规则） ──
  const judgementDims = [
    { seq: "先关注", dims: "场景能否创造重要经营价值、改善跨部门协同或提升治理效能" },
    { seq: "再讨论", dims: "已有能力可以复用多少、还需补充哪些数据与能力、风险是否可控" },
  ];

  // ── §7 分阶段建议（03 工作稿 行101–103；不设时间表，不承诺按此顺序实施，行106） ──
  const phasesRoad = [
    { phase: "第一阶段建议", scope: "渠道库存与动销协同", kind: "now" },
    { phase: "后续相邻阶段", scope: "根据真实结果，再讨论促销毛利治理或 B 端履约治理", kind: "next" },
    { phase: "远期探索方向", scope: "生产、仓储物流、采购、养殖育种或海外业务", kind: "future" },
  ];

  // ── §8 跨循环边界（03 工作稿 行66–70） ──
  const boundaries = [
    { boundary: "新场景仍走 01", rule: "企业采纳某个新场景后，建议先把它作为独立业务域的小范围试点；其中的新经营事件仍按 01 建立独立事件、案件和 Agent 上下文，不让价格案件直接切换成库存或履约 Skill" },
    { boundary: "可控问题仍走 02", rule: "真实案件关闭后，如果暴露的是 Agent 接案后可控的 Skill、Prompt、MCP 或工作流问题，再按 02 进入能力进化" },
    { boundary: "03 只提供建议", rule: "不直接修改生产能力，不执行真实审批，也不承担扩域项目管理" },
  ];

  // ── 附录 B 分阶段蓝图建议产物（03 工作稿 行58–64；企业可继续修订） ──
  const blueprintOutputs = [
    "候选场景及推荐顺序",
    "首选下一试点建议与主要依据",
    "可以复用的已有能力和需要补充的条件",
    "建议参与角色、后续阶段及可以暂缓的原因",
    "公开资料支持、方案推断和待企业核验项",
  ];

  // ── §9 资料依据（03 工作稿 行110–112；四条） ──
  const sources = [
    { srcId: "K3", name: "官方赛题汇总（圣农条目）", use: "确认官方赛题披露的零售组织、渠道与数据分散背景", factTag: "圣农公开事实" },
    { srcId: "K2", name: "圣农发展 2025 年年度报告", use: "确认产销协同、精益仓储、智能物流、全渠道与 B 端履约方向", factTag: "圣农公开事实" },
    { srcId: "K4", name: "库存与经销商调研", use: "补充候选场景线索与证据边界", factTag: "本方案设计判断" },
    { srcId: "K5", name: "跨部门协作与决策调研", use: "补充候选场景线索与证据边界", factTag: "本方案设计判断" },
  ];

  // ── 右栏四相位（data-win 契约：win-evidence / win-cocreate / win-decide / win-return） ──
  const phases = [
    { id: "win-evidence", name: "试点证据", sections: ["sec-summary", "sec-premise"] },
    { id: "win-cocreate", name: "共创盘点", sections: ["sec-cocreate", "sec-method", "sec-criteria"] },
    { id: "win-decide",   name: "企业选择", sections: ["sec-candidates", "sec-scenario", "sec-roadmap"] },
    { id: "win-return",   name: "回到 01",  sections: ["sec-boundary", "sec-evidence", "sec-appendix", "sec-sources"] },
  ];

  // ── 附录 A 待企业核验与有意留白清单（03 工作稿 行80 六项 + 行20 七类，共 13 项） ──
  const unknowns = [
    { item: "真实痛点", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "数据可得性", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "业务负责人", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "资源投入", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "优先顺序", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "试点价值", basis: "需结合企业内部信息共同确认", origin: "03 工作稿 §3.1 待企业核验" },
    { item: "数据接口", basis: "有意留白：已识别为真实扩域需要补充的事项；继续细化会产生无证据假设", origin: "03 工作稿 §0.1 有意留白" },
    { item: "字段", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
    { item: "权限", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
    { item: "责任人", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
    { item: "指标阈值", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
    { item: "预算周期", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
    { item: "部署验证", basis: "有意留白（同上）", origin: "03 工作稿 §0.1 有意留白" },
  ];

  return { keyFacts, expansionCandidates, cocreateSteps, fiveSteps, cocreateRoles, judgementDims, phasesRoad, boundaries, blueprintOutputs, sources, phases, unknowns };
})();
