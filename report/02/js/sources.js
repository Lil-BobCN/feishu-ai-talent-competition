/* ═══════════════════════════════════════════════════════════
   sources.js · window.SRC — K 锚点表 + #source-list 渲染 · 02 能力进化循环
   cat 映射（本报告两类）：
     official = 官方 & 平台（飞书平台公开能力台账；证明平台通用能力，不证明圣农租户已开通）
     kimi     = 研究整理（方案文档：专题工作稿 / 思维台账）
   每条带日期；日期按文件实际标注。
   ═══════════════════════════════════════════════════════════ */
window.SRC = [
  { id: "K1", cat: "kimi", date: "2026-07-23 定稿 · 2026-07-24 最终复核",
    fact: "能力进化循环唯一逻辑基准：正式关闭是唯一入口、每案完整复盘不设初筛、人工核实四分支、诊断—隔离验证回路、管理审批三出口、候选版本回 01 受控运行；不写“自动学习”",
    cite: "02 能力进化循环 · 专题工作稿（逻辑定稿 logic_final / pilot_design）" },
  { id: "K2", cat: "kimi", date: "2026-07-23",
    fact: "复盘入口台账：独立复盘 Agent、专用复盘 Skill、由面到点的交互式复盘报告、FDE 全域数据下钻；台账未关闭事项不得在评委材料中表述为已落地能力",
    cite: "02 能力进化循环 · 复盘 Agent 与交互式复盘报告思维台账（logic_aligned / implementation_pending）" },
  { id: "K3", cat: "kimi", date: "2026-07-24",
    fact: "后端台账：隔离验证是判断“改没改对”的技术闸门而非最终出口；诊断—隔离验证必须成回路；试验记录至少含假设、修改对象、基线、案例集、指标、结论、审批和版本关系",
    cite: "02 能力进化循环 · 思维台账（logic_aligned / implementation_pending）" },
  { id: "K4", cat: "kimi", date: "2026-07-21 定稿",
    fact: "01 经营事件循环业务逻辑权威来源：三类正式关闭与五类打开状态、关闭记录九字段、失败处置和人工修复路径——02 的入口与回路由其定义",
    cite: "01 经营事件循环 · 专题工作稿（逻辑定稿 logic_final）" },
  { id: "K5", cat: "official", date: "2026-07-23 创建（design_audit_in_progress）",
    fact: "飞书平台公开能力台账：文档、多维表格、消息卡片、审批、Aily 等候选组合；证明平台通用能力，不代表圣农目标租户已开通或完成联调",
    cite: "飞书看板能力（已核实平台能力与目标租户未知项台账）" },
];

/* 渲染 #source-list（.src-row × N，徽章 + 事实 + 出处 + 日期 + 可选链接）——逻辑与 01 相同 */
(function () {
  const host = document.getElementById("source-list");
  if (!host || !window.SRC) return;
  const catName = { company: "公司披露", industry: "行业 & 官方", kimi: "研究整理", broker: "Broker", official: "官方 & 平台" };
  const frag = document.createDocumentFragment();
  window.SRC.forEach(s => {
    const row = document.createElement("div");
    row.className = "src-row";
    row.id = "src-" + s.id.toLowerCase();
    const link = s.url ? ` · <a href="${s.url}" target="_blank" rel="noopener">官方文档 ↗</a>` : "";
    row.innerHTML =
      `<span class="s-fact"><span class="src-cat ${s.cat}">${catName[s.cat] || s.cat}</span>` +
      `<b>${s.id}</b> · ${s.fact}</span>` +
      `<span class="s-cite">${s.cite} · ${s.date}${link}</span>`;
    frag.appendChild(row);
  });
  host.appendChild(frag);
})();
