/* ═══════════════════════════════════════════════════════════
   signal-destiny.js · P2 命运流：候选异常信号的四种去向
   宿主：#signal-chart（.wide.xl，868px 内容宽）
   数据：window.RPT.signals（entities / outcomes / links，全部 simulated）
   配方：CHARTS.md P2 —— 左列实体（serif 编号 + mono 类型 kicker）、
   中间 ink 圆头生命线、Bézier ribbon 汇入右列去向牌匾
   （左侧色条 + mono caps 名称 + ×n 汇入计数）、虚线 = 依据无法可靠确定、
   停在成案前终点 ✕、牌匾按汇入行均 y 排序、全部标签最后绘制 + 纸色描边。
   中间竖带 = PR-0001 事件解析运行（清洗→去重→归并→分类），
   承载「信号 → 解析 → 出口」的机制识别（去文字仍可读出流向拓扑）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('signal-chart');
  if (!host) return;
  const U = window.U;
  if (!U) return; // 工具缺失：静默退出，不影响其他模块

  const S = (window.RPT || {}).signals;
  // 宁可缺失不得编造：RPT.signals 不在契约中时只留说明，不画假数据
  if (!S || !S.entities || !S.outcomes || !S.links) {
    U.frame(host, {
      title: '候选异常信号的四种去向',
      sub: 'FLOW MAP · 数据契约 window.RPT.signals 缺失，本图未渲染',
      src: '研究整理 — 评委稿 §3.3（K10 · 2026-07-23）',
    });
    return;
  }

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const P = U.PAL;
  const NS = 'http://www.w3.org/2000/svg';

  // 去向配色：电蓝族三阶 + 语义红（仅「停在成案前」停止类语义）
  const OUT_COLOR = {
    '独立成案': P.red,        // #2251ff 电蓝
    '归并成员': P.redHi,      // #1233b8 深蓝
    '重复标记保留': '#7d9bff', // 浅蓝（调色板第三阶）
    '停在成案前': P.neg,       // #c22f4e 语义红：停止
  };
  const SRC_LINE = 'K10 · 评委稿（重写版）2026-07-23 · 方案模拟示例';
  const SRC_RULE = 'K9 · 母稿 2026-07-21 定稿 / K10 · 2026-07-23 重写';

  const body = U.frame(host, {
    title: '四条候选信号，四种命运：成案、归并、标记、停在成案前',
    sub: 'FLOW MAP · 左：候选异常信号（serif 编号 + mono 类型）· 中：PR-0001 事件解析 · 右：解析出口牌匾（×n = 汇入数）· 虚线 = 解析依据无法可靠确定 · ✕ = 不成案 · 点击信号 / 连线 / 出口看判据 —— 全部为方案模拟数据',
    src: '研究整理 — 评委稿 §3.3 归并三出口 + 附录 B.1/B.2 数据合同（K10 · 2026-07-23 重写）；24.9 元案件与四条信号均为方案模拟',
  });

  /* ── 布局（固定 viewBox，绝不测量宿主宽度：postmortem 防 0 宽塌陷） ── */
  const W = 868, H = 362;
  const ROW_Y = [92, 152, 212, 272];          // 四条信号行
  const ROW_GAP = 60;
  const X_LABEL = 10, X_LINE0 = 196, X_LINE1 = 536;
  const BAND_X0 = 316, BAND_X1 = 536;         // PR-0001 解析竖带
  const X_RIB_END = 632;                      // ribbon 终点（牌匾左缘前）
  const PLQ_X = 640, PLQ_W = 218, PLQ_H = 46;

  const entities = S.entities.slice(0, 4);
  const rowOf = {}; entities.forEach((e, i) => { rowOf[e.id] = i; });

  // 每个去向的汇入链接与计数（只从 RPT.links 推导）
  const inflows = {}; S.outcomes.forEach(o => { inflows[o.id] = []; });
  S.links.forEach(l => { if (inflows[l.to]) inflows[l.to].push(l); });

  // 牌匾排序：按汇入行均 y 升序，减少交叉（P2 配方）；无汇入者按原序置后
  const plaques = S.outcomes
    .map(o => {
      const rows = inflows[o.id].map(l => rowOf[l.from]).filter(r => r != null);
      const meanY = rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : 99;
      return { o, rows, meanY, n: inflows[o.id].length };
    })
    .sort((a, b) => a.meanY - b.meanY);
  plaques.forEach((p, i) => { p.cy = ROW_Y[0] + i * ROW_GAP; });

  /* ── SVG 与图层：bands → lifelines → ribbons → plaques(raise) → labels(最后) → hit ── */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block';
  body.appendChild(svg);
  const g = id => { const e = document.createElementNS(NS, 'g'); e.setAttribute('class', id); svg.appendChild(e); return e; };
  const gBand = g('sd-band'), gLife = g('sd-life'), gRib = g('sd-rib'),
        gPlq = g('sd-plq'), gTxt = g('sd-txt'), gHit = g('sd-hit');

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function text(parent, x, y, str, opt) {
    const t = el('text', {
      x, y,
      'font-family': opt.mono ? MONO : SERIF,
      'font-size': opt.size || 10,
      'font-weight': opt.bold ? 700 : 400,
      'font-style': opt.italic ? 'italic' : 'normal',
      fill: opt.color || P.ink,
      'text-anchor': opt.anchor || 'start',
      // §U#3：纸色描边光晕，防止文字压线被穿透
      'paint-order': 'stroke', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round',
    }, parent);
    t.textContent = str;
    return t;
  }

  const anim = []; // {el, kind, delay, len} 入场动画登记
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

  /* ── ① 中间解析竖带（PR-0001 机制区） ── */
  el('rect', { x: BAND_X0, y: 54, width: BAND_X1 - BAND_X0, height: 240, fill: P.hi }, gBand);
  el('line', { x1: BAND_X0, y1: 54, x2: BAND_X0, y2: 294, stroke: P.lineLo, 'stroke-width': 1 }, gBand);
  el('line', { x1: BAND_X1, y1: 54, x2: BAND_X1, y2: 294, stroke: P.lineLo, 'stroke-width': 1 }, gBand);
  // 顶/底 hairline：去文字后仍可读出一个「解析闸口」区域（识别测试）
  el('line', { x1: BAND_X0, y1: 54, x2: BAND_X1, y2: 54, stroke: P.line, 'stroke-width': 1 }, gBand);
  el('line', { x1: BAND_X0, y1: 294, x2: BAND_X1, y2: 294, stroke: P.line, 'stroke-width': 1 }, gBand);
  const bandLab = text(gTxt, (BAND_X0 + BAND_X1) / 2, 46,
    'PR-0001 · 事件解析运行：清洗 → 去重 → 归并 → 分类',
    { mono: true, size: 8.5, color: P.inkLo, anchor: 'middle' });
  regFade(bandLab, 120);

  /* ── ② 生命线 + ③ ribbon ── */
  const linkBySig = {}; S.links.forEach(l => { linkBySig[l.from] = l; });
  entities.forEach((s, i) => {
    const y = ROW_Y[i], link = linkBySig[s.id] || {};
    const stopped = s.outcome === '停在成案前';
    const color = OUT_COLOR[s.outcome] || P.inkMd;

    // 生命线：ink 圆头线 + 信号诞生点
    const life = el('line', {
      x1: X_LINE0, y1: y, x2: X_LINE1, y2: y,
      stroke: P.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round',
    }, gLife);
    regGrow(life, 60 + i * 90);
    const dot = el('circle', { cx: X_LINE0, cy: y, r: 3.2, fill: P.ink }, gLife);
    regFade(dot, 60 + i * 90);

    // Bézier ribbon：生命线右端 → 去向牌匾（按排序后牌匾行）
    const plq = plaques.find(p => p.o.id === s.outcome);
    const py = plq ? plq.cy : y;
    const ribEnd = stopped ? X_RIB_END - 24 : X_RIB_END; // ✕ 占位
    const rib = el('path', {
      d: `M ${X_LINE1} ${y} C ${X_LINE1 + 42} ${y}, ${ribEnd - 46} ${py}, ${ribEnd} ${py}`,
      fill: 'none', stroke: color, 'stroke-width': 4.6, 'stroke-linecap': 'round',
      opacity: 0.82,
    }, gRib);
    if (stopped) rib.setAttribute('stroke-dasharray', '7 6'); // 虚线 = 依据无法可靠确定
    regGrow(rib, 420 + i * 90);

    // ✕ 终点：停在成案前（语义红，正式停止状态）
    if (stopped) {
      const xx = X_RIB_END - 12;
      const xMark = text(gTxt, xx, py + 5, '✕', { size: 15, bold: true, color: P.neg, anchor: 'middle' });
      regFade(xMark, 1000);
    }
  });

  /* ── ④ 去向牌匾（raise 到 ribbon 之上）：左色条 + mono caps 名称 + ×n ── */
  plaques.forEach((p, i) => {
    const color = OUT_COLOR[p.o.id] || P.inkMd;
    const y0 = p.cy - PLQ_H / 2;
    const grp = el('g', {}, gPlq);
    el('rect', { x: PLQ_X, y: y0, width: PLQ_W, height: PLQ_H, fill: '#ffffff', stroke: P.line, 'stroke-width': 1 }, grp);
    el('rect', { x: PLQ_X, y: y0, width: 5, height: PLQ_H, fill: color }, grp);
    regFade(grp, 820 + i * 80);

    const t1 = text(gTxt, PLQ_X + 17, p.cy - 3, p.o.id, { mono: true, size: 11.5, bold: true, color: P.ink });
    const t2 = text(gTxt, PLQ_X + 17, p.cy + 13, `×${p.n} 汇入`, { mono: true, size: 9, color: P.inkLo });
    regFade(t1, 860 + i * 80); regFade(t2, 900 + i * 80);
    if (p.o.id === '独立成案') {
      const t3 = text(gTxt, PLQ_X + PLQ_W - 12, p.cy + 13, '→ E1 · C1', { mono: true, size: 9, color: P.red, anchor: 'end' });
      regFade(t3, 940);
    }
  });

  /* ── ⑤ 全部文字标签最后绘制（已在 gTxt 层）：列 kicker、信号标签、via 标注、图例 ── */
  text(gTxt, X_LABEL, 30, `CANDIDATE SIGNALS ×${entities.length} · 候选异常信号`, { mono: true, size: 9, color: P.inkLo });
  text(gTxt, W - 10, 30, '解析出口 · 归并只有三个，没有第四个', { mono: true, size: 9, color: P.inkLo, anchor: 'end' });

  entities.forEach((s, i) => {
    const y = ROW_Y[i];
    const a = text(gTxt, X_LABEL, y + 1, s.id, { size: 13, bold: true, color: P.ink });
    const b = text(gTxt, X_LABEL, y + 15, s.type, { mono: true, size: 8.5, color: P.inkLo });
    regFade(a, 100 + i * 90); regFade(b, 140 + i * 90);
    // via 标注：挂在生命线上（解析竖带中心），说明该信号在 PR-0001 中的处理路径
    const via = (linkBySig[s.id] || {}).via;
    if (via) {
      const v = text(gTxt, (BAND_X0 + BAND_X1) / 2, y - 8, via, { mono: true, size: 9, color: P.inkMd, anchor: 'middle' });
      regFade(v, 700 + i * 80);
    }
  });

  const lg1 = text(gTxt, X_LABEL, 326, '实线 = 解析通过，进入对应出口 · 虚线 = 来源版本 / 解析依据无法可靠确定 · ✕ = 停在成案前：不输出事件包、不创建案件', { mono: true, size: 8.5, color: P.inkLo });
  const lg2 = text(gTxt, X_LABEL, 344, '被判重复的信号只标记处理结果，不删除原记录；关系模糊时保持独立成案并强制专家复核 —— 系统不强行猜测合并', { mono: true, size: 8.5, color: P.inkLo });
  regFade(lg1, 1080); regFade(lg2, 1140);

  /* ── ⑥ 命中层（透明热区置顶）：每信号 / 每连线 / 每去向均可 drill ── */
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

  entities.forEach((s, i) => {
    const y = ROW_Y[i];
    const obs = s.observed != null ? `观测 ${s.observed} 元` : '观测值未可靠取得';
    const baseNote = s.baseline != null ? `候选基准 ${s.baseline} 元 · ` : '';
    // 信号本体：类型 / 规则版本 / 权威事实引用
    hit(4, y - 22, X_LINE0 - 12, 44, {
      title: `候选异常信号 · ${s.id}`,
      value: obs,
      sub: `类型：${s.type}（规则 price-gap-rule v1，附录 B.1 数据合同）· 对象 ${s.objects} · ${baseNote}权威事实引用：POS 事实快照随信号保存 · ${s.note} · 候选异常只表示“值得调查”，不等于违规结论`,
      source: SRC_LINE,
    }, `${s.id} · ${s.outcome} — 点击看类型 / 规则版本 / 事实引用`);
    // 连线：PR-0001 处理路径
    const link = linkBySig[s.id];
    if (link) {
      hit(X_LINE0, y - 13, X_RIB_END - X_LINE0, 26, {
        title: `解析路径 · ${link.via}`,
        value: `${s.id} → ${link.to}`,
        sub: `PR-0001（price-event-parser v1）：清洗 → 确定性去重（商品+门店+交易号+规则）→ 初次归并（归并主键+30m 时间窗）→ 分类 · ${s.note} · 输入、依据、不确定项全程留痕（附录 B.2）`,
        source: SRC_LINE,
      }, `${link.via} · 点击看解析依据`);
    }
  });

  // 去向牌匾：判据 drill（母稿归并三出口与停止条件）
  plaques.forEach(p => {
    const extra = p.o.id === '独立成案'
      ? ' · 事件类型和核心对象明确但关系模糊时：保持独立成案，强制提交 FDE 和领域专家复核关系'
      : p.o.id === '停在成案前'
        ? ' · 解析中止不是错误，是正式状态；后续新信号或新证据提示语义变化时回到语义层重新解析'
        : '';
    hit(PLQ_X, p.cy - PLQ_H / 2, PLQ_W, PLQ_H, {
      title: `解析出口 · ${p.o.id}`,
      value: `×${p.n} 汇入`,
      sub: `判据：${p.o.desc}${extra} · 汇入信号：${inflows[p.o.id].map(l => l.from).join('、') || '—'}`,
      source: SRC_RULE,
    }, `${p.o.id} ×${p.n} · 点击看判据`);
  });

  /* ── 入场动画：IO fires once（threshold 0.15）；reduced-motion 直接完成帧 ── */
  function play() { anim.forEach(a => { a.el.style[a.prop] = a.to; }); }
  if (REDUCED) {
    // 元素本就以完成态绘制，无需动作
  } else {
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { play(); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(host);
  }
})();
