/* ═══════════════════════════════════════════════════════════
   sources.js · window.SRC — K 锚点表 + #source-list 渲染
   cat 四类徽章映射（与 01 报告同一规则）：
     company  = 公司披露（圣农年报）
     industry = 行业 & 官方（官方赛题）
     kimi     = 研究整理（03 专题工作稿、圣农调研）
     broker   = 本报告不使用
   每条带日期；日期按文件实际。
   ═══════════════════════════════════════════════════════════ */
window.SRC = [
  { id: "K1", cat: "kimi",     date: "2026-07-24",
    fact: "业务扩域循环唯一逻辑基准：03 由人主导，不是自动运行的业务系统、评分制度或实施合同；扩域建议由企业确认、调整、暂缓或否决；候选顺序为方案推断，不虚构实施合同与试验结果",
    cite: "03 业务扩域循环 · 专题工作稿（logic_confirmed / advisory_blueprint / enterprise_validation_pending）" },
  { id: "K2", cat: "company",  date: "2026 年披露（2025 财年年报）",
    fact: "提出精准预测、高效生产、精益仓储、智能物流、产销协同、全渠道策略和 B 端客户全周期管理等方向",
    cite: "圣农发展 2025 年年度报告（公司披露，具体披露日以公司公告为准）" },
  { id: "K3", cat: "industry", date: "2026-07（赛题发布）",
    fact: "零售业务覆盖多区域、多人员和多渠道，相关数据分散在多个系统",
    cite: "飞书 AI 人才赛 · 官方赛题汇总（圣农集团条目）" },
  { id: "K4", cat: "kimi",     date: "2026-07-18",
    fact: "库存与经销商调研（14 条记录）：存货与渠道线索；经销商窜货处罚案例、渠道压货量化数据等方向未找到可靠信息，均填 unknown 并标注“推断”——媒体信息与搜索摘要只能作为线索",
    cite: "圣农调研 04a · 库存与经销商（前期调研交接包，研究整理）" },
  { id: "K5", cat: "kimi",     date: "2026-07-18",
    fact: "跨部门协作与决策调研（18 条记录）：2022–2024 生熟两套体系整合、四部门融合、渠道拆分重组等组织改革；“决策滞后、产销失衡、窜货”类负面事件无公开实证——行业类比只能作为线索",
    cite: "圣农调研 06b · 跨部门协作与决策机制（前期调研交接包，研究整理）" },
];

/* 渲染 #source-list（.src-row × N，徽章 + 事实 + 出处 + 日期 + 可选链接） */
(function () {
  const host = document.getElementById("source-list");
  if (!host || !window.SRC) return;
  const catName = { company: "公司披露", industry: "行业 & 官方", kimi: "研究整理", broker: "Broker" };
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
