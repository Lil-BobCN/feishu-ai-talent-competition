/* ═══════════════════════════════════════════════════════════
   exec-dossier.js · P17 证据对象 —— E1-C1 案件档案夹（本报告签名图）
   宿主：#exec-chart（.wide.xl）｜ 配方：CHARTS.md P17 evidence object
   数据：window.RPT.dossier / archives / timeline / closures（只用已有键；缺则不画，不编造）
   语义位映射（全部为档案夹上真实存在的功能位，§R#4 门禁）：
     夹舌标签   = 案件编号 E1-C1 + 事件类型「价格异常」（档案夹夹舌本就用来写案由编号）
     夹身贴纸   = 观测成交价 24.9 元 vs 候选基准 29.9 元（差值 −5.0 元语义红；方案模拟）
     侧面分页签 = 7 类档案（RPT.archives；分页签本就用于分类归档）
     背脊刻度   = 15 步时间线（RPT.timeline T1–T15；背脊本就承载顺序索引）
     封口印章区 = 3 类结案类型（RPT.closures；骑缝压在封口上，盖章才准结案）
     悬挂吊签   = 传统处置 4–5 天（圣农公开事实 K3）
     夹内纸堆   = 12 条停止规则（dossier.stopRules；层数即条数）
   P17 pitfall 遵守：夹舌 / 分页签 / 吊签 / 贴纸均为独立叠放件，不嵌入外轮廓路径。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('exec-chart');
  if (!host || !window.U) return;

  const PAL = U.PAL;
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = U.frame(host, {
    title: "一笔 24.9 元的可疑成交，留下的证据挂满了一只档案夹",
    sub: "读法 · 档案夹每处真实功能位挂一类证据：夹舌＝案件编号 · 贴纸＝成交价对基准（元）· 分页签＝档案分类 · 背脊刻度＝时间线 · 封口印章＝结案类型 · 吊签＝传统耗时 · 纸堆层数＝停止规则 · 点击任意数字或部件下钻依据",
    src: "官方赛题（K3，2026-07）· 专题工作稿（K9，2026-07-21）· 评委稿（K10，2026-07-23）· 24.9 元案例为方案模拟",
  });

  const D = window.RPT || {};
  if (!D.dossier) {
    // 数据缺失：宁可缺失也不编造（§U#5）——只留说明，不渲染图形
    const p = document.createElement("p");
    p.className = "chart-sub";
    p.textContent = "证据对象数据缺失（window.RPT.dossier），本图未渲染。";
    body.appendChild(p);
    return;
  }
  const dossier = D.dossier;
  const archives = Array.isArray(D.archives) ? D.archives : [];   // 分页签
  const timeline = Array.isArray(D.timeline) ? D.timeline : [];   // 背脊刻度
  const closures = Array.isArray(D.closures) ? D.closures : [];   // 印章
  const STOP_N = (dossier.stopRules && dossier.stopRules.value) || 0; // 纸堆层数

  /* ── 来源行：点击时才查 window.SRC（sources.js 加载在本模块之后），附静态兜底 ── */
  const SRC_FALLBACK = {
    K3: "飞书 AI 人才赛 · 官方赛题（圣农场景披露）· 2026-07（赛题发布）· K3",
    K9: "经营事件循环 · 专题工作稿（逻辑定稿 logic_final）· 2026-07-21 定稿 · K9",
    K10: "经营事件循环 · 评委稿（重写版 reviewer_rewrite / 待确认）· 2026-07-23 重写 · K10",
  };
  function srcOf(kid) {
    const s = (window.SRC || []).find(x => x.id === kid);
    return s ? `${s.cite} · ${s.date} · ${s.id}` : (SRC_FALLBACK[kid] || kid);
  }

  /* ── SVG 基础（固定 viewBox 坐标系，P21 铁律①；从不量容器宽度） ── */
  const W = 880, H = 560, GY = 514;
  const NS = "http://www.w3.org/2000/svg";
  const scroller = document.createElement("div");
  scroller.style.overflowX = "auto";
  body.appendChild(scroller);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.minWidth = "720px";
  svg.style.height = "auto";
  svg.style.display = "block";
  scroller.appendChild(svg);

  function E(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function G(parent, attrs = {}) { return E("g", attrs, parent); }
  // 文字：一律 paint-order:stroke 纸色光晕 ≥4（§U#3）
  function T(parent, x, y, str, o = {}) {
    const t = E("text", {
      x, y,
      "font-family": o.mono ? MONO : SERIF,
      "font-size": o.size || 10,
      "font-weight": o.weight || 400,
      fill: o.fill || PAL.ink,
      "text-anchor": o.anchor || "start",
      "paint-order": "stroke",
      stroke: "#ffffff",
      "stroke-width": 4,
      "stroke-linejoin": "round",
    }, parent);
    if (o.ls) t.setAttribute("letter-spacing", o.ls);
    t.textContent = str;
    return t;
  }

  /* ── 入场「逐个挂上」：IntersectionObserver fires once；reduced-motion 直接完成帧 ── */
  const parts = [];
  function hang(g, delay, kind) {
    if (REDUCED) return;
    g.style.opacity = "0";
    g.style.transition = "opacity .5s ease, transform .5s cubic-bezier(.2,.7,.3,1)";
    g.style.transitionDelay = delay + "ms";
    if (kind === "stamp") {
      g.style.transformBox = "fill-box";
      g.style.transformOrigin = "center";
      g.style.transform = "scale(1.6)";
    } else {
      g.style.transform = "translateY(-12px)";
    }
    parts.push(g);
  }
  function entrance() {
    parts.forEach(g => { g.style.opacity = "1"; g.style.transform = "none"; });
  }

  /* ── 可点击部件：drill + hover tip（P16：每个数字都可点下钻） ── */
  function clickable(g, drill, tip) {
    g.style.cursor = "pointer";
    g.setAttribute("data-drill-keep", "");
    g.addEventListener("click", ev => {
      ev.stopPropagation();
      U.showDrill(Object.assign({}, typeof drill === "function" ? drill() : drill, { x: ev.clientX, y: ev.clientY }));
    });
    if (tip) {
      g.addEventListener("mousemove", ev => U.showTip(tip + "<br><span style='opacity:.65'>点击下钻依据</span>", ev.clientX, ev.clientY));
      g.addEventListener("mouseleave", () => U.hideTip());
    }
  }

  /* ═══════════ ① 统一地线（承载全部物件） ═══════════ */
  const gGround = G(svg);
  E("line", { x1: 60, y1: GY, x2: 836, y2: GY, stroke: PAL.ink, "stroke-width": 1.5 }, gGround);
  hang(gGround, 0);

  /* ═══════════ ② 档案夹背板（含背脊带）+ 夹舌标签（独立叠放件） ═══════════ */
  const gBack = G(svg);
  E("rect", { x: 170, y: 150, width: 510, height: GY - 150, fill: PAL.hi, stroke: PAL.ink, "stroke-width": 1.5 }, gBack);
  E("line", { x1: 196, y1: 150, x2: 196, y2: GY, stroke: PAL.inkLo, "stroke-width": 1 }, gBack); // 背脊带分隔
  // 夹舌：路径不封底边，底边与背板顶边重合（经典 folder tab，独立件不嵌入外轮廓）
  E("path", { d: "M240,150 L254,116 L366,116 L380,150", fill: PAL.hi, stroke: PAL.ink, "stroke-width": 1.5 }, gBack);
  T(gBack, 310, 134, dossier.caseId.value, { mono: true, size: 14, weight: 700, anchor: "middle" });
  T(gBack, 310, 147, dossier.eventType.value, { size: 10.5, weight: 700, anchor: "middle" });
  const gTabHit = G(gBack);
  E("rect", { x: 236, y: 110, width: 148, height: 42, fill: "transparent" }, gTabHit);
  clickable(gTabHit, {
    title: "夹舌标签 · 案件编号 / 事件类型",
    value: `${dossier.caseId.value} · ${dossier.eventType.value}`,
    sub: `${dossier.caseId.basis}；事件类型「${dossier.eventType.value}」为待调查标记，不等于违规结论 · 方案模拟`,
    source: srcOf("K10"),
  }, "夹舌＝案件编号 + 事件类型");
  hang(gBack, 80);

  /* ═══════════ ③ 夹内纸堆 = 12 条停止规则（层数即条数） ═══════════ */
  const sheetsG = G(svg);
  for (let i = 0; i < STOP_N; i++) {
    const sx = 200 + (i % 3) * 3;
    const sy = 185 - i * 2.8;              // 顶缘错落，露出封面之上
    const sr = 660 + (i % 4) * 3;          // 右缘扇出，露出封面右侧
    const gs = G(sheetsG);
    E("rect", { x: sx, y: sy, width: sr - sx, height: 508 - sy, fill: "#ffffff", stroke: "#c9d2dd", "stroke-width": 1 }, gs);
    hang(gs, 140 + i * 40);
  }
  const paperHit = E("rect", { x: 420, y: 146, width: 250, height: 52, fill: "transparent" }, sheetsG);
  clickable(paperHit, {
    title: "夹内纸堆 · 层数＝停止规则",
    value: `${STOP_N} 层＝${STOP_N} 条`,
    sub: `${dossier.stopRules.basis} · 完整模块清单见母稿 2.4.2 · 本方案设计判断`,
    source: srcOf("K9"),
  }, "纸堆层数＝停止规则条数");
  /* 评审修复 9：纸堆层数不可数 → 外露纸缘上加 mono 计数角标 */
  const gBadge = G(sheetsG);
  E("rect", { x: 566, y: 160, width: 46, height: 22, rx: 4, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.1 }, gBadge);
  T(gBadge, 589, 175, `×${STOP_N}`, { mono: true, size: 12, weight: 700, anchor: "middle" });
  clickable(gBadge, {
    title: "夹内纸堆 · 层数＝停止规则",
    value: `${STOP_N} 层＝${STOP_N} 条`,
    sub: `${dossier.stopRules.basis} · 完整模块清单见母稿 2.4.2 · 本方案设计判断`,
    source: srcOf("K9"),
  }, "纸堆层数＝停止规则条数");
  hang(gBadge, 660);

  /* ═══════════ ④ 封面（圆角 + 拇指缺口，露出纸堆） ═══════════ */
  const gCover = G(svg);
  E("path", {
    d: "M196,514 L196,210 Q196,202 204,202 L384,202 A16,16 0 0 0 416,202 L638,202 Q646,202 646,210 L646,514 Z",
    fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.5,
  }, gCover);
  E("line", { x1: 224, y1: 208, x2: 224, y2: 510, stroke: PAL.lineLo, "stroke-width": 1 }, gCover); // 背脊折痕
  hang(gCover, 400);

  /* ═══════════ ⑤ 背脊刻度 = 15 步时间线（刻度长在背脊带内） ═══════════ */
  const spineG = G(svg);
  const tickTop = 176, tickStep = (500 - tickTop) / Math.max(timeline.length - 1, 1);
  timeline.forEach((t, i) => {
    const y = tickTop + i * tickStep;
    const gt = G(spineG);
    E("line", { x1: 174, y1: y, x2: 192, y2: y, stroke: PAL.inkLo, "stroke-width": 1.1 }, gt);
    T(gt, 166, y + 3, t.id, {
      mono: true, size: 9, anchor: "end",
      fill: (i === 0 || i === timeline.length - 1) ? PAL.ink : PAL.inkLo,
      weight: (i === 0 || i === timeline.length - 1) ? 700 : 400,
    });
    E("rect", { x: 122, y: y - 10, width: 74, height: 20, fill: "transparent" }, gt);
    clickable(gt, () => ({
      title: `${t.id} · ${t.title}`,
      value: t.lane,
      sub: t.detail + (t.simulated ? " · 方案模拟" : ""),
      source: srcOf("K10"),
    }), `${t.id} · ${t.title}`);
    hang(gt, 620 + i * 40);
  });

  /* ═══════════ ⑥ 夹身贴纸 = 成交价 对 基准（差值语义红） ═══════════ */
  const gSticker = G(svg, { transform: "rotate(-2.5 438 310)" });
  E("rect", { x: 333, y: 265.5, width: 216, height: 96, rx: 4, fill: PAL.ink, opacity: 0.055 }, gSticker);
  E("rect", { x: 330, y: 262, width: 216, height: 96, rx: 4, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.3 }, gSticker);
  T(gSticker, 344, 279, "PRICE TAG · 方案模拟", { mono: true, size: 7.5, fill: PAL.inkLo, ls: ".12em" });
  T(gSticker, 344, 303, "观测成交价", { size: 11 });
  T(gSticker, 474, 305, String(dossier.observed.value), { mono: true, size: 23, weight: 700, fill: PAL.red, anchor: "end" });
  T(gSticker, 480, 305, "元", { mono: true, size: 10.5 });
  T(gSticker, 344, 327, "候选基准", { size: 10.5, fill: PAL.inkMd });
  T(gSticker, 474, 327, String(dossier.baseline.value), { mono: true, size: 12, fill: PAL.inkMd, anchor: "end" });
  E("line", { x1: 446, y1: 323, x2: 475, y2: 323, stroke: PAL.inkMd, "stroke-width": 1.1 }, gSticker); // 基准划除
  T(gSticker, 480, 327, "元", { mono: true, size: 9.5, fill: PAL.inkMd });
  E("line", { x1: 344, y1: 337, x2: 524, y2: 337, stroke: PAL.line, "stroke-width": 1 }, gSticker);
  T(gSticker, 344, 351, "差值", { size: 10.5 });
  T(gSticker, 390, 351, "−5.0 元", { mono: true, size: 13, weight: 700, fill: PAL.neg }); // 唯一语义红：缺口
  T(gSticker, 448, 351, "(−16.7%)", { mono: true, size: 9.5, fill: PAL.neg });
  const row1 = E("rect", { x: 336, y: 284, width: 200, height: 26, fill: "transparent" }, gSticker);
  clickable(row1, {
    title: dossier.observed.label,
    value: dossier.observed.value + " 元",
    sub: dossier.observed.basis + " · 方案模拟",
    source: srcOf("K10"),
  }, "观测成交价（POS 流水）");
  const row2 = E("rect", { x: 336, y: 310, width: 200, height: 22, fill: "transparent" }, gSticker);
  clickable(row2, {
    title: dossier.baseline.label,
    value: dossier.baseline.value + " 元",
    sub: dossier.baseline.basis + " · 方案模拟",
    source: srcOf("K10"),
  }, "候选价格基准（规则匹配）");
  const row3 = E("rect", { x: 336, y: 338, width: 200, height: 16, fill: "transparent" }, gSticker);
  clickable(row3, {
    title: "成交价 − 候选基准",
    value: "−5.0 元",
    delta: -16.7,
    sub: "24.9 − 29.9 ＝ −5.0 元 · 相对候选基准 −16.7%［derived］· 方案模拟",
    source: srcOf("K10"),
  }, "差值（derived）");
  hang(gSticker, 560, "drop");

  /* ═══════════ ⑦ 侧面分页签 = 7 类档案 ═══════════ */
  const tabsG = G(svg);
  archives.forEach((a, i) => {
    const ty = 240 + i * 38;
    const gt = G(tabsG);
    const r = E("rect", { x: 672, y: ty, width: 40, height: 32, rx: 3, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.2 }, gt);
    T(gt, 692, ty + 20, a.no, { mono: true, size: 10, weight: 700, anchor: "middle" });
    gt.addEventListener("mouseenter", () => r.setAttribute("stroke", PAL.red));
    gt.addEventListener("mouseleave", () => r.setAttribute("stroke", PAL.ink));
    clickable(gt, {
      title: `档案 ${a.no} · ${a.name}`,
      value: a.name,
      sub: `存：${a.holds} —— ${a.thesis} · 本方案设计判断`,
      source: srcOf("K10"),
    }, `分页签 ${a.no} · ${a.name}`);
    hang(gt, 700 + i * 55);
  });

  /* ═══════════ ⑧ 封口印章区 = 3 类结案类型（骑缝压封口，实心白底遮地线） ═══════════ */
  const gSeal = G(svg);
  const sealRot = G(gSeal, { transform: "rotate(8 556 510)" });
  E("circle", { cx: 556, cy: 510, r: 38, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 2.2 }, sealRot);
  E("circle", { cx: 556, cy: 510, r: 32, fill: "none", stroke: PAL.ink, "stroke-width": 0.8 }, sealRot);
  (function star(cx, cy, ro, ri) { // 印章五角星
    let d = "";
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? ri : ro, a = -Math.PI / 2 + k * Math.PI / 5;
      d += (k ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1);
    }
    E("path", { d: d + "Z", fill: PAL.ink }, sealRot);
  })(556, 493, 6.5, 2.6);
  T(sealRot, 556, 515, `${closures.length} 类`, { mono: true, size: 16, weight: 700, anchor: "middle" });
  T(sealRot, 556, 529, "结案类型", { mono: true, size: 8.5, anchor: "middle" });
  T(gSeal, 556, 458, closures.map(c => c.type).join(" / "), { mono: true, size: 8, fill: PAL.inkLo, anchor: "middle" });
  const gSealHit = G(gSeal);
  E("rect", { x: 510, y: 448, width: 96, height: 102, fill: "transparent" }, gSealHit);
  clickable(gSealHit, {
    title: "封口印章 · 正式结案类型",
    value: `${closures.length} 类`,
    sub: closures.map(c => `${c.type}：${c.meaning}`).join("；") + " —— “查不清”不是结案 · 本方案设计判断",
    source: srcOf("K10"),
  }, "封口印章＝3 类结案类型");
  hang(gSeal, 1080, "stamp");

  /* ═══════════ ⑨ 悬挂吊签 = 传统处置 4–5 天 ═══════════ */
  const gTag = G(svg);
  E("path", { d: "M664,150 C692,132 722,140 736,176", fill: "none", stroke: PAL.ink, "stroke-width": 1.1 }, gTag);
  const tagRot = G(gTag, { transform: "rotate(3 758 196)" });
  E("rect", { x: 703, y: 167, width: 116, height: 64, rx: 5, fill: PAL.ink, opacity: 0.05 }, tagRot);
  E("rect", { x: 700, y: 164, width: 116, height: 64, rx: 5, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.3 }, tagRot);
  E("circle", { cx: 736, cy: 177, r: 3.5, fill: "#ffffff", stroke: PAL.ink, "stroke-width": 1.1 }, tagRot);
  T(tagRot, 714, 196, "传统异常处置", { mono: true, size: 8.5, fill: PAL.inkMd });
  T(tagRot, 714, 219, dossier.traditionalDays.value.replace("天", " 天"), { mono: true, size: 19, weight: 700 });
  T(tagRot, 714, 232, "投诉 → 处置 · 均值", { mono: true, size: 7.5, fill: PAL.inkLo });
  E("rect", { x: 696, y: 158, width: 128, height: 76, fill: "transparent" }, tagRot);
  clickable(gTag, {
    title: dossier.traditionalDays.label,
    value: dossier.traditionalDays.value,
    sub: dossier.traditionalDays.basis + " · 圣农公开事实",
    source: srcOf("K3"),
  }, "吊签＝传统处置耗时（K3）");
  hang(gTag, 1140, "swing");

  /* ═══════════ ⑩ 注记层（最后画，避免被剪影压住；全部带纸色光晕） ═══════════ */
  const gCaps = G(svg);
  T(gCaps, 310, 103, "夹舌标签＝案件编号 · 事件类型", { mono: true, size: 9, fill: PAL.inkLo, anchor: "middle" });
  E("line", { x1: 310, y1: 108, x2: 310, y2: 113, stroke: PAL.inkLo, "stroke-width": 1 }, gCaps);
  T(gCaps, 520, 103, `纸堆 ${STOP_N} 层＝停止规则 ${STOP_N} 条`, { mono: true, size: 9, fill: PAL.inkLo, anchor: "middle" });
  E("line", { x1: 520, y1: 108, x2: 540, y2: 150, stroke: PAL.inkLo, "stroke-width": 1 }, gCaps);
  const capPaper = G(gCaps);
  E("rect", { x: 452, y: 91, width: 136, height: 18, fill: "transparent" }, capPaper);
  clickable(capPaper, {
    title: "夹内纸堆 · 层数＝停止规则",
    value: `${STOP_N} 层＝${STOP_N} 条`,
    sub: `${dossier.stopRules.basis} · 完整模块清单见母稿 2.4.2 · 本方案设计判断`,
    source: srcOf("K9"),
  }, "纸堆层数＝停止规则条数");
  T(gCaps, 726, 362, `分页签 ×${archives.length}＝${archives.length} 类档案`, { mono: true, size: 9, fill: PAL.inkLo });
  T(gCaps, 726, 375, "01–07 · 点击单签下钻", { mono: true, size: 9, fill: PAL.inkLo });
  const capTabs = G(gCaps);
  E("rect", { x: 722, y: 350, width: 118, height: 34, fill: "transparent" }, capTabs);
  clickable(capTabs, {
    title: "侧面分页签 · 档案分类",
    value: `${archives.length} 类档案`,
    sub: archives.map(a => `${a.no} ${a.name}`).join(" · ") + " · 本方案设计判断",
    source: srcOf("K10"),
  }, "7 类档案分页签");
  T(gCaps, 66, 540, `背脊刻度＝${timeline.length} 步时间线 · T1 → T${timeline.length}`, { mono: true, size: 9, fill: PAL.inkLo });
  E("line", { x1: 150, y1: 531, x2: 172, y2: 507, stroke: PAL.inkLo, "stroke-width": 1 }, gCaps);
  const capSpine = G(gCaps);
  E("rect", { x: 60, y: 528, width: 224, height: 18, fill: "transparent" }, capSpine);
  clickable(capSpine, {
    title: "背脊刻度 · 全流程时点",
    value: `${timeline.length} 步`,
    sub: `${dossier.timelineSteps.basis} · 四泳道：发现成案 / 调查补证 / 决策执行 / 验证结案 · 方案模拟`,
    source: srcOf("K10"),
  }, "背脊刻度＝时间线步骤");

  hang(gCaps, 1220);

  /* ── 入场触发（threshold 0.2，fires once；reduced-motion 已在 hang() 短路） ── */
  if (REDUCED) {
    entrance();
  } else {
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { entrance(); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(host);
  }
})();
