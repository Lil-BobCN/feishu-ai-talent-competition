/* ═══════════════════════════════════════════════════════════
   sources.js · window.SRC — K 锚点表 + #source-list 渲染
   cat 四类徽章映射（DESIGN.md 四源规则）：
     company  = 公司披露（圣农年报）
     industry = 行业 & 官方（官方赛题、飞书官方文档、KWeaver 能力核验）
     kimi     = 研究整理（方案文档：母稿 / 重写版）
     broker   = 本报告不使用
   每条带日期；飞书公开能力依据复核日期 2026-07-23。
   ═══════════════════════════════════════════════════════════ */
window.SRC = [
  { id: "K1",  cat: "company",  date: "2025 年披露（2024 财年年报）",
    fact: "“SAP + 智慧农场”已上线，建立全产业链数字化管理基础",
    cite: "圣农发展 2024 年年度报告（公司披露，具体披露日以公司公告为准）" },
  { id: "K2",  cat: "company",  date: "2026 年披露（2025 财年年报）",
    fact: "提出“AI+BI”双轨落地与智慧中台建设",
    cite: "圣农发展 2025 年年度报告（公司披露，具体披露日以公司公告为准）" },
  { id: "K3",  cat: "industry", date: "2026-07（赛题发布）",
    fact: "零售场景覆盖 10 个区域、300 多名业务员；日报、经销商台账、POS 流水、价格巡查分散在 6 个系统；价格异常从投诉到处置平均 4—5 天",
    cite: "飞书 AI 人才赛 · 官方赛题（圣农场景披露）" },
  { id: "K4",  cat: "industry", date: "2026-07-23 复核",
    fact: "飞书开放平台：获取单个用户信息（证明平台通用能力，不证明圣农租户已开通）",
    cite: "飞书官方文档 · contact-v3/user/get",
    url: "https://open.feishu.cn/document/server-docs/contact-v3/user/get" },
  { id: "K5",  cat: "industry", date: "2026-07-23 复核",
    fact: "飞书开放平台：获取部门直属用户列表",
    cite: "飞书官方文档 · contact-v3/user/find_by_department",
    url: "https://open.feishu.cn/document/server-docs/contact-v3/user/find_by_department" },
  { id: "K6",  cat: "industry", date: "2026-07-23 复核",
    fact: "飞书开放平台：发送消息",
    cite: "飞书官方文档 · im-v1/message/create",
    url: "https://open.feishu.cn/document/server-docs/im-v1/message/create" },
  { id: "K7",  cat: "industry", date: "2026-07-23 复核",
    fact: "飞书开放平台：查询消息已读信息（已送达 ≠ 已读 ≠ 已知悉）",
    cite: "飞书官方文档 · im-v1/message/read_users",
    url: "https://open.feishu.cn/document/server-docs/im-v1/message/read_users" },
  { id: "K8",  cat: "industry", date: "2026-07-23 复核",
    fact: "KWeaver 通用能力基座公开能力边界：连接数据源、语义映射、结构化查询、API/MCP、上下文加载、权限与追踪",
    cite: "KWeaver Core 能力核验台账（verified / partial / unknown / unsupported 分级）" },
  { id: "K9",  cat: "kimi",     date: "2026-07-21 定稿",
    fact: "经营事件循环业务逻辑唯一权威来源：节点、责任边界、停止条件、结案类型、数据合同字段",
    cite: "01 经营事件循环 · 专题工作稿（逻辑定稿 logic_final）" },
  { id: "K10", cat: "kimi",     date: "2026-07-23 重写",
    fact: "评委审阅稿：重组、压缩与改写；不改变母稿任何已确认结论；24.9 元案例为方案模拟",
    cite: "01 经营事件循环 · 评委稿（重写版 reviewer_rewrite / 待确认）" },
  { id: "K11", cat: "kimi",     date: "2026-07-21 合并版",
    fact: "飞书只是协作投影：权威记录留在经营事件与证据库；已送达 ≠ 已读 ≠ 已知悉；看板状态机合同按 confirmed_design / proposed_code 分级，目标租户未验证",
    cite: "飞书经营协同与人员同步方案（待确认）· 投影合同 feishu-case-projection-v0.1-draft" },
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
