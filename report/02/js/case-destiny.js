/* ═══════════════════════════════════════════════════════════
   case-destiny.js · §3 P2 命运流：正式关闭案件的四分支去向
   宿主：#destiny-chart（.wide.xl，924px 栏宽 / 868px 内容宽）
   数据：window.RPT.destiny（entry / review / branches[4]，B4 entersLoop）
        window.RPT.entry.closures（三类正式关闭的结案依据）
   配方：CHARTS.md P2 —— 左列实体按三类结案分组（mono kicker 组标）、
   中间 ink 圆头生命线穿过「每案完整复盘」竖带（不设低成本初筛），
   Bézier ribbon 汇入右列分支牌匾（左色条 + mono 名称 + ×n 汇入计数）；
   「转交 01」「提交平台方」虚线 ribbon = 流出本循环；「能力异样线索」
   牌匾带「→ 诊断」去向；牌匾按汇入行均 y 排序、raise 到 ribbon 之上；
   全部标签最后绘制 + 纸色描边。
   红线：左列 6 条生命线为方案模拟示例（3 类结案 × 2 例，覆盖 4 分支），
   非真实案件计数——sub / 图例 / drill 三处声明；无版本号、无评测成绩。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('destiny-chart');
  if (!host) return;
  const U = window.U;
  if (!U) return; // 工具缺失：静默退出，不影响其他模块

  const RPT = window.RPT || {};
  const D = RPT.destiny;
  const CLOSURES = (RPT.entry || {}).closures;
  // 宁可缺失不得编造：数据键不在契约中时只留说明，不画假数据
  if (!D || !D.entry || !D.review || !D.branches || !CLOSURES) {
    U.frame(host, {
      title: '每案完整复盘：四分支人工核实，仅能力异样线索进入改进回路',
      sub: 'FLOW MAP · 数据契约 window.RPT.destiny / RPT.entry 缺失，本图未渲染',
      src: '研究整理 — 02 能力进化循环专题工作稿（K1 · 2026-07-23 定稿）',
    });
    return;
  }

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const P = U.PAL;
  const NS = 'http://www.w3.org/2000/svg';

  // 分支视觉：电蓝族三阶 + ink 阶；无停止/缺口语义，不使用 PAL.neg
  const BR_STYLE = {
    B1: { color: '#7d9bff', dashed: false }, // 保存记录：浅蓝，留在本循环（归档）
    B2: { color: '#1233b8', dashed: true },  // 转交 01：深蓝虚线，流出本循环
    B3: { color: P.inkMd,  dashed: true },   // 提交平台方：ink 虚线，流出本循环
    B4: { color: P.red,    dashed: false },  // 能力异样线索：电蓝，进入诊断回路（hero）
  };
  // 母稿行号（02 能力进化循环专题工作稿，docs/方案合并副本_2026-07-21/循环专题_待确认/）
  const BR_LINE = { B1: '行95', B2: '行96', B3: '行97', B4: '行98' };
  const BR_EXTRA = {
    B1: '完整复盘是信息处理要求，不代表每个案件都会生成改进版本（行103）；记录归档备查，不进入改进回路',
    B2: '源数据与语义层问题回到 01 的失败处置和人工修复路径（行7、行34）；不在 02 内越界修复',
    B3: '飞书 / Aily / 豆包底层平台缺陷不在 02 内修复，由项目团队保留证据、评估影响并向平台方反馈（行7、行34）',
    B4: '不直接认定为缺陷（行50）；后续进入 FDE 诊断 → 隔离验证闸门 → 管理审批三出口（行113–126）',
  };
  const SRC_K1 = 'K1 · 02 专题工作稿 2026-07-23 定稿 / 2026-07-24 复核';

  const body = U.frame(host, {
    title: '每案完整复盘：四分支人工核实，仅能力异样线索进入改进回路',
    sub: 'FLOW MAP · 左：正式关闭案件 ×6（三类结案 · 方案模拟示例）· 中：每案完整复盘竖带，不设低成本初筛 · 右：人工核实四分支牌匾（×n = 示例汇入数）· 虚线 = 流出本循环 · 点击案件 / 连线 / 竖带 / 牌匾看判据与母稿行号',
    src: '研究整理 — 02 能力进化循环专题工作稿 行36–38 / 行40–68 / 行86–99（K1 · 2026-07-23 定稿，2026-07-24 复核）；左列生命线为方案模拟示例，非真实案件计数',
  });

  /* ── 示例案件集：方案模拟（非真实案件计数）──
     条数取自数据契约结构：RPT.entry.closures 三类结案 × 2 例 = 6，
     分配覆盖 RPT.destiny.branches 全部 4 分支（B1×2 / B2×2 / B3×1 / B4×1）。 */
  const CASES = [
    { id: '样例 S1', type: '成功解决', to: 'B4', note: '目标达成 · 复盘发现 Skill 可改进点' },
    { id: '样例 S2', type: '成功解决', to: 'B1', note: '目标达成 · 未见可控能力问题' },
    { id: '样例 S3', type: '合法例外', to: 'B1', note: '授权确认例外 · 未见可控能力问题' },
    { id: '样例 S4', type: '合法例外', to: 'B2', note: '复盘发现语义层判读偏差' },
    { id: '样例 S5', type: '系统误报', to: 'B2', note: '溯源确认误报 · 语义映射问题' },
    { id: '样例 S6', type: '系统误报', to: 'B3', note: '溯源确认误报 · 底层平台缺陷' },
  ];
  const TYPE_SHORT = { '成功解决': '经营目标验证达成', '合法例外': '授权负责人确认', '系统误报': '责任层溯源后确认' };
  const basisOf = t => { const c = CLOSURES.find(x => x.state === t); return c ? c.basis : ''; };
  const branchOf = id => D.branches.find(b => b.id === id);

  /* ── 布局（固定 viewBox，绝不测量宿主宽度：postmortem 防 0 宽塌陷） ── */
  const W = 868, H = 478;
  const ROW_Y = [88, 142, 220, 274, 352, 406];
  const GROUPS = [
    { type: '成功解决', y: 56 }, { type: '合法例外', y: 188 }, { type: '系统误报', y: 320 },
  ];
  const X_LABEL = 10, X_LINE0 = 170, X_LINE1 = 545;
  const BAND_X0 = 290, BAND_X1 = 470, BAND_Y0 = 66, BAND_Y1 = 422;
  const BAND_CX = (BAND_X0 + BAND_X1) / 2;
  const X_RIB_END = 636;                       // ribbon 终点（牌匾左缘前 8px）
  const PLQ_X = 644, PLQ_W = 214, PLQ_H = 48, PLQ_GAP = 64;

  const rowOf = {}; CASES.forEach((c, i) => { rowOf[c.id] = i; });
  const inflows = {}; D.branches.forEach(b => { inflows[b.id] = []; });
  CASES.forEach(c => { if (inflows[c.to]) inflows[c.to].push(c); });

  // 牌匾排序：按汇入行均 y 升序，减少交叉（P2 配方）；无汇入者按原序置后
  const plaques = D.branches
    .map(b => {
      const rows = inflows[b.id].map(c => rowOf[c.id]);
      const meanY = rows.length ? rows.reduce((a, r) => a + ROW_Y[r], 0) / rows.length : 9999;
      return { b, rows, meanY, n: rows.length };
    })
    .sort((a, b) => a.meanY - b.meanY);
  plaques.forEach((p, i) => { p.cy = ROW_Y[0] + i * PLQ_GAP; });

  /* ── SVG 与图层：band → lifelines → ribbons → plaques(raise) → labels(最后) → hit ── */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block';
  body.appendChild(svg);
  const g = id => { const e = document.createElementNS(NS, 'g'); e.setAttribute('class', id); svg.appendChild(e); return e; };
  const gBand = g('cd-band'), gLife = g('cd-life'), gRib = g('cd-rib'),
        gPlq = g('cd-plq'), gTxt = g('cd-txt'), gHit = g('cd-hit');

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function text(parent, x, y, str, opt) {
    const t = el('text', {
      x, y,
      'font-size': opt.size || 10,
      'font-weight': opt.bold ? 700 : 400,
      fill: opt.color || P.ink,
      'text-anchor': opt.anchor || 'start',
      // §U#3：纸色描边光晕，防止文字压线被穿透
      'paint-order': 'stroke', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round',
    }, parent);
    // 内联样式：压过 css `.chart-frame svg text { font-family: var(--mono) }` 的全局规则
    t.style.fontFamily = opt.mono ? MONO : SERIF;
    t.textContent = str;
    return t;
  }

  const anim = []; // {el, prop, to} 入场动画登记
  function regGrow(path, delay) {
    if (REDUCED) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    path.style.strokeDashoffset = L;
    path.style.transition = `stroke-dashoffset .6s cubic-bezier(.4,0,.2,1) ${delay}ms`;
    // 动画结束还原属性层 dasharray（虚线 ribbon 语义不能被内联动画样式吞掉）
    path.addEventListener('transitionend', () => {
      path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; path.style.transition = '';
    }, { once: true });
    anim.push({ el: path, prop: 'strokeDashoffset', to: '0' });
  }
  function regFade(node, delay) {
    if (REDUCED) return;
    node.style.opacity = 0;
    node.style.transition = `opacity .45s ease ${delay}ms`;
    anim.push({ el: node, prop: 'opacity', to: '1' });
  }

  /* ── ① 复盘竖带（每案完整复盘 · 不设低成本初筛；所有生命线必须穿过） ── */
  const bandRect = el('rect', {
    x: BAND_X0, y: BAND_Y0, width: BAND_X1 - BAND_X0, height: BAND_Y1 - BAND_Y0, fill: P.hi,
  }, gBand);
  el('line', { x1: BAND_X0, y1: BAND_Y0, x2: BAND_X1, y2: BAND_Y0, stroke: P.line, 'stroke-width': 1 }, gBand);
  el('line', { x1: BAND_X0, y1: BAND_Y1, x2: BAND_X1, y2: BAND_Y1, stroke: P.line, 'stroke-width': 1 }, gBand);
  el('line', { x1: BAND_X0, y1: BAND_Y0, x2: BAND_X0, y2: BAND_Y1, stroke: P.lineLo, 'stroke-width': 1 }, gBand);
  el('line', { x1: BAND_X1, y1: BAND_Y0, x2: BAND_X1, y2: BAND_Y1, stroke: P.lineLo, 'stroke-width': 1 }, gBand);
  regFade(bandRect, 0);
  const bandLab = text(gTxt, BAND_CX, 58, '每案完整复盘 · 不设低成本初筛',
    { mono: true, size: 8.5, color: P.inkLo, anchor: 'middle' });
  regFade(bandLab, 120);

  /* ── ② 生命线 + 复盘读取点 + ③ ribbon ── */
  CASES.forEach((c, i) => {
    const y = ROW_Y[i];
    const st = BR_STYLE[c.to] || { color: P.inkMd, dashed: false };
    const plq = plaques.find(p => p.b.id === c.to);
    const py = plq ? plq.cy : y;

    // 生命线：ink 圆头线 + 结案进入点
    const life = el('line', {
      x1: X_LINE0, y1: y, x2: X_LINE1, y2: y,
      stroke: P.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round',
    }, gLife);
    regGrow(life, 60 + i * 90);
    const dot = el('circle', { cx: X_LINE0, cy: y, r: 3.2, fill: P.ink }, gLife);
    regFade(dot, 60 + i * 90);

    // 复盘读取点：竖带中心的白心圆点（每个案件都在此被完整读取，无一跳过）
    const cp = el('circle', {
      cx: BAND_CX, cy: y, r: 3.4, fill: '#ffffff', stroke: P.ink, 'stroke-width': 1.6,
    }, gLife);
    regFade(cp, 320 + i * 90);

    // Bézier ribbon：生命线右端 → 分支牌匾（按排序后牌匾行；虚线 = 流出本循环）
    const rib = el('path', {
      d: `M ${X_LINE1} ${y} C ${X_LINE1 + 40} ${y}, ${X_RIB_END - 44} ${py}, ${X_RIB_END} ${py}`,
      fill: 'none', stroke: st.color, 'stroke-width': 4.6, 'stroke-linecap': 'round',
      opacity: 0.82,
    }, gRib);
    if (st.dashed) rib.setAttribute('stroke-dasharray', '7 6');
    regGrow(rib, 500 + i * 80);
  });

  /* ── ④ 分支牌匾（raise 到 ribbon 之上）：左色条 + mono 名称 + ×n 汇入 ── */
  plaques.forEach((p, j) => {
    const st = BR_STYLE[p.b.id] || { color: P.inkMd };
    const y0 = p.cy - PLQ_H / 2;
    const grp = el('g', {}, gPlq);
    el('rect', { x: PLQ_X, y: y0, width: PLQ_W, height: PLQ_H, fill: '#ffffff', stroke: P.line, 'stroke-width': 1 }, grp);
    el('rect', { x: PLQ_X, y: y0, width: 5, height: PLQ_H, fill: st.color }, grp);
    regFade(grp, 920 + j * 90);

    const t1 = text(gTxt, PLQ_X + 16, p.cy - 5, p.b.route, { mono: true, size: 10.5, bold: true, color: P.ink });
    const t2 = text(gTxt, PLQ_X + PLQ_W - 10, p.cy - 5, `×${p.n} 汇入`, { mono: true, size: 9, color: P.inkLo, anchor: 'end' });
    regFade(t1, 960 + j * 90); regFade(t2, 1000 + j * 90);
    if (p.b.id === 'B4') {
      // B4 判据行让位给「不直接认定为缺陷」 hedge +「→ 诊断」去向
      const t3 = text(gTxt, PLQ_X + 16, p.cy + 12, '不直接认定为缺陷', { mono: true, size: 8, color: P.inkMd });
      const t4 = text(gTxt, PLQ_X + PLQ_W - 10, p.cy + 12, '→ 诊断', { mono: true, size: 9, bold: true, color: P.red, anchor: 'end' });
      regFade(t3, 1040 + j * 90); regFade(t4, 1080 + j * 90);
    } else {
      const t3 = text(gTxt, PLQ_X + 16, p.cy + 12, p.b.name, { mono: true, size: 8, color: P.inkMd });
      regFade(t3, 1040 + j * 90);
    }
  });

  /* ── ⑤ 全部文字标签最后绘制（已在 gTxt 层）：列头、组 kicker、案件标签、图例 ── */
  const hd1 = text(gTxt, X_LABEL, 28, `CLOSED CASES ×${CASES.length} · 正式关闭案件（方案模拟示例）`, { mono: true, size: 9, color: P.inkLo });
  const hd2 = text(gTxt, W - 10, 28, '人工核实分支 ×4 · 仅 B4 进入改进回路', { mono: true, size: 9, color: P.inkLo, anchor: 'end' });
  regFade(hd1, 80); regFade(hd2, 80);

  GROUPS.forEach((gp, gi) => {
    // 组标：电蓝短划 + mono kicker（三类结案分组）
    const dash = el('line', { x1: X_LABEL, y1: gp.y - 3, x2: X_LABEL + 14, y2: gp.y - 3, stroke: P.red, 'stroke-width': 2 }, gTxt);
    const k = text(gTxt, X_LABEL + 20, gp.y, `${gp.type} ×2 · ${TYPE_SHORT[gp.type] || ''}`, { mono: true, size: 9, color: P.inkMd });
    regFade(dash, 140 + gi * 60); regFade(k, 140 + gi * 60);
  });

  CASES.forEach((c, i) => {
    const y = ROW_Y[i];
    const a = text(gTxt, X_LABEL, y + 1, c.id, { size: 12, bold: true, color: P.ink });
    const b = text(gTxt, X_LABEL, y + 14, c.note, { mono: true, size: 8, color: P.inkLo });
    regFade(a, 100 + i * 90); regFade(b, 140 + i * 90);
  });

  const lg1 = text(gTxt, X_LABEL, 446, '实线 = 留在本循环（保存记录 / 进入诊断）· 虚线 = 流出本循环（转交 01 / 提交平台方，不在 02 内修复）· ○ = 复盘读取点，每案必过', { mono: true, size: 8.5, color: P.inkLo });
  const lg2 = text(gTxt, X_LABEL, 464, '左列 6 条生命线为方案模拟示例（每类结案 2 例），用于展示分支路由拓扑，不构成真实案件计数 · 点击案件 / 连线 / 竖带 / 分支牌匾看依据与母稿行号', { mono: true, size: 8.5, color: P.inkLo });
  regFade(lg1, 1180); regFade(lg2, 1240);

  /* ── ⑥ 命中层（透明热区置顶）：竖带（垫底）→ 案件 / 连线 → 分支牌匾 ── */
  function hit(x, y, w, h, drill, tip) {
    const r = el('rect', {
      x, y, width: w, height: h, fill: 'rgba(0,0,0,0)',
      cursor: 'pointer', 'data-drill-keep': '',
    }, gHit);
    r.addEventListener('click', e => { U.showDrill({ ...drill, x: e.clientX, y: e.clientY }); });
    r.addEventListener('mousemove', e => U.showTip(tip, e.clientX, e.clientY));
    r.addEventListener('mouseleave', () => U.hideTip());
    return r;
  }

  // 复盘竖带 drill：垫底登记（生命线热区在其上，带内点线仍命中案件路由）
  hit(BAND_X0, BAND_Y0, BAND_X1 - BAND_X0, BAND_Y1 - BAND_Y0, {
    title: '每案完整复盘 · 不设低成本初筛',
    value: '复盘单元 = 1 个正式关闭案件',
    sub: `${D.review} · 不能以低成本初筛替代完整案件复盘，也不能丢弃原始信号、查询轨迹和证据（行101）· 系统不设自动认定标准，不自动宣布能力缺陷（行103）`,
    source: `${SRC_K1} · 行86–101`,
  }, '每案完整复盘 — 点击看复盘读取范围与不设初筛依据');

  CASES.forEach((c, i) => {
    const y = ROW_Y[i];
    const br = branchOf(c.to);
    // 案件本体：结案类型 + 结案依据（K4 / 02 行38）+ 方案模拟声明
    hit(4, y - 22, X_LINE0 - 12, 44, {
      title: `示例案件 · ${c.id}（方案模拟）`,
      value: `${c.type} → ${br.route}`,
      sub: `结案依据：${basisOf(c.type)}（01 专题工作稿 K4；02 行38）· ${D.entry.note} · 人工核实走向：${br.name} → ${br.route}（02 ${BR_LINE[c.to]}）· 本案件为方案模拟示例，不构成真实案件计数`,
      source: SRC_K1,
    }, `${c.id} · ${c.type} — 点击看结案依据与核实走向`);
    // 连线：完整复盘 → 分支路由（虚线 = 流出本循环）
    const st = BR_STYLE[c.to];
    hit(X_LINE0, y - 12, X_RIB_END - X_LINE0, 24, {
      title: `命运流 · ${c.id} → ${c.to}`,
      value: st.dashed ? '流出本循环' : (br.entersLoop ? '进入诊断回路' : '归档保存'),
      sub: `判据：${br.name} → ${br.route}（02 ${BR_LINE[c.to]}）· ${br.next} · ${BR_EXTRA[c.to]} · 本连线为方案模拟示例路径`,
      source: SRC_K1,
    }, `${c.id} → ${br.route} · ${st.dashed ? '虚线 · 流出本循环' : '实线'} — 点击看分支判据`);
  });

  // 分支牌匾 drill：判据 + 母稿行号
  plaques.forEach(p => {
    hit(PLQ_X, p.cy - PLQ_H / 2, PLQ_W, PLQ_H, {
      title: `人工核实分支 · ${p.b.id}`,
      value: `${p.b.route}（×${p.n} 示例汇入）`,
      sub: `判据：${p.b.name}（02 专题工作稿 ${BR_LINE[p.b.id]}）· 去向：${p.b.next} · ${BR_EXTRA[p.b.id]} · 汇入：${inflows[p.b.id].map(c => c.id).join('、') || '—'}（方案模拟示例）`,
      source: `${SRC_K1} · 行40–68 冻结主链 / 行86–99 复盘入口`,
    }, `${p.b.route} ×${p.n} · 点击看判据与母稿行号`);
  });

  /* ── 入场动画：IO fires once（threshold 0.15）；reduced-motion 直接完成帧 ── */
  function play() { anim.forEach(a => { a.el.style[a.prop] = a.to; }); }
  if (!REDUCED) {
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { play(); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(host);
  }
})();
