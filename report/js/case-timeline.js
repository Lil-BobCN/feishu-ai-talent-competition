/* ═══════════════════════════════════════════════════════════
   case-timeline.js · P3 墙图时间线（CHARTS.md P3 配方）
   宿主：#timeline-chart（.wide.xl，868px）
   数据：window.RPT.timeline（T1–T15，四泳道，全部 simulated:true）
   层序铁律：bands → stems(stemLayer) → plaques(plaqueLayer) → 全部标签最后
   关键节点（以数据为准）：T10 决策就绪 / T11 管理决定 / T14 结果验证 = 电蓝框
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('timeline-chart');
  if (!host) return;
  const U = window.U;
  if (!U || !window.RPT || !Array.isArray(window.RPT.timeline) || !window.RPT.timeline.length) return;

  const PAL = U.PAL;
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const NS = 'http://www.w3.org/2000/svg';
  const TL = window.RPT.timeline;

  /* ── 关键节点：决策就绪 / 管理决定（批准执行）/ 结果验证（按 RPT.timeline 实际编号） ── */
  const KEY_IDS = { T10: 1, T11: 1, T14: 1 };

  /* ── 固定 viewBox 坐标系（不量宿主宽度，避免首帧塌陷） ── */
  const W = 868, mL = 26, mR = 26;
  const plotW = W - mL - mR;
  const N = TL.length;
  const step = plotW / N;
  const xOf = i => mL + (i + 0.5) * step;

  /* ── 泳道：按出现顺序聚合（发现成案/调查补证/决策执行/验证结案） ── */
  const lanes = [];
  TL.forEach((t, i) => {
    let l = lanes.find(l => l.name === t.lane);
    if (!l) { l = { name: t.lane, from: i, to: i }; lanes.push(l); }
    l.to = i;
  });

  /* ── 牌匾宽度估算：serif bold 12px，CJK ≥12.2px/char，Latin ≈7px/char ── */
  function titleW(s) {
    let w = 0;
    for (const ch of s) w += /[\u2e80-\u9fff\uff00-\uffef，。、；：（）]/.test(ch) ? 12.2 : 7.0;
    return w;
  }
  const PH = 42;                       // 牌匾高
  const plaqueW = t => Math.max(64, Math.ceil(titleW(t.title)) + 26);

  /* ── 贪心分层：本层放不下就上移一层，层上限 9 ── */
  const LAYER_CAP = 9;
  const placed = [];
  const evs = TL.map((t, i) => {
    const w = plaqueW(t), x = xOf(i);
    let layer = 0;
    while (layer < LAYER_CAP &&
           placed.some(p => p.layer === layer && Math.abs(p.x - x) < (p.w + w) / 2 + 12)) layer++;
    placed.push({ x, w, layer });
    return { t, i, x, w, layer, key: !!KEY_IDS[t.id] };
  });
  const layerCount = Math.max.apply(null, evs.map(e => e.layer)) + 1;

  /* ── 图高 = f(实际层数) ── */
  const layerH = 52, stemGap = 26, topPad = 18;
  const yAxis = topPad + (layerCount - 1) * layerH + PH + stemGap;
  const bandY = yAxis + 16, bandH = 26, botPad = 12;
  const H = bandY + bandH + botPad;
  const yPlqTop = e => yAxis - stemGap - e.layer * layerH - PH;

  /* ── 模块内样式（只作用于本宿主） ── */
  const st = document.createElement('style');
  st.textContent =
    '#timeline-chart svg.wall{display:block;width:100%;height:auto}' +
    '#timeline-chart svg.wall .ev{opacity:0;transform:translateY(-9px);transition:opacity .5s ease,transform .5s ease;cursor:pointer;outline:none}' +
    '#timeline-chart svg.wall.in .ev{opacity:1;transform:none}' +
    '#timeline-chart svg.wall .ev:hover rect.plq,#timeline-chart svg.wall .ev:focus rect.plq{stroke-width:2.1}';
  document.head.appendChild(st);

  /* ── frame 起手：结论句 title + mono sub（含方案模拟标注）+ src ── */
  const body = U.frame(host, {
    title: '15 个时点、一次闭环：同一案件从 POS 事实更新走到结案，步步留痕',
    sub: 'WALL CHART · 泳道 = 四阶段 · 牌匾 = T1–T15 时点（编号为流程顺序，非真实时长） · 电蓝框 = 关键节点（T10 决策就绪 / T11 管理决定 / T14 结果验证） · 点击牌匾查看留痕依据 · 方案模拟 · 不代表圣农真实经营事实',
    src: '研究整理 — 经营事件循环评委稿 24.9 元案例（K10，2026-07-23）· 全部时点与动作均为方案模拟',
  });

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'wall');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '24.9 元案例 T1 至 T15 墙图时间线（方案模拟）');
  body.appendChild(svg);

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, str, o) {
    const t = el('text', {
      x: x, y: y,
      'font-family': o.serif ? SERIF : MONO,
      'font-size': o.size, 'font-weight': o.bold ? 700 : 400,
      fill: o.fill,
      'paint-order': 'stroke', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round',
    }, parent);
    if (o.ls) t.setAttribute('letter-spacing', o.ls);
    if (o.anchor) t.setAttribute('text-anchor', o.anchor);
    t.textContent = str;
    return t;
  }
  const SRC_LINE = 'K10 · 经营事件循环评委稿（重写版）· 2026-07-23 · 方案模拟';

  /* ══ ① bands 层：泳道浅蓝带（最先画） ══ */
  const gBands = el('g', {}, svg);
  lanes.forEach(l => {
    const x0 = mL + l.from * step + 2, x1 = mL + (l.to + 1) * step - 2;
    const r = el('rect', {
      x: x0, y: bandY, width: x1 - x0, height: bandH,
      fill: 'rgba(34,81,255,0.06)', 'data-drill-keep': '', style: 'cursor:pointer',
    }, gBands);
    const tt = el('title', {}, r); tt.textContent = l.name + ' · ' + TL[l.from].id + '–' + TL[l.to].id;
    r.addEventListener('click', ev => {
      U.showDrill({
        title: '泳道 · ' + l.name,
        value: TL[l.from].id + '–' + TL[l.to].id,
        sub: '覆盖时点：' + TL.slice(l.from, l.to + 1).map(t => t.id + ' ' + t.title).join(' → ') + '（方案模拟，不代表圣农真实经营事实）',
        source: SRC_LINE,
        x: ev.clientX, y: ev.clientY,
      });
    });
  });

  /* ══ ② 双线时间轴（dots 归 stemLayer，随牌匾入场） ══ */
  const gAxis = el('g', {}, svg);
  el('line', { x1: mL - 8, y1: yAxis - 2.5, x2: W - mR + 8, y2: yAxis - 2.5, stroke: PAL.ink, 'stroke-width': 1.3 }, gAxis);
  el('line', { x1: mL - 8, y1: yAxis + 2.5, x2: W - mR + 8, y2: yAxis + 2.5, stroke: PAL.ink, 'stroke-width': 1.3 }, gAxis);

  /* ══ ③ stemLayer：全部茎 + 轴上圆点（先于牌匾，避免戳穿文字） ══ */
  const gStem = el('g', {}, svg);
  evs.forEach(e => {
    const g = el('g', { 'class': 'ev' }, gStem);
    g.style.transitionDelay = (e.i * 70) + 'ms';
    const yb = yPlqTop(e) + PH;
    el('line', { x1: e.x, y1: yb, x2: e.x, y2: yAxis - 4.5, stroke: e.key ? PAL.red : PAL.inkLo, 'stroke-width': e.key ? 1.2 : 1 }, g);
    el('circle', {
      cx: e.x, cy: yAxis, r: 3.4,
      fill: e.key ? PAL.red : '#ffffff', stroke: e.key ? PAL.redHi : PAL.inkMd, 'stroke-width': 1.4,
    }, g);
  });

  /* ══ ④ plaqueLayer：白纸墨框牌匾（mono T 编号 + serif 加粗一行标题） ══ */
  const gPlq = el('g', {}, svg);
  evs.forEach(e => {
    const px = U.clamp(e.x - e.w / 2, 6, W - 6 - e.w);
    const py = yPlqTop(e);
    const g = el('g', { 'class': 'ev', 'data-drill-keep': '', tabindex: '0', role: 'button' }, gPlq);
    g.style.transitionDelay = (e.i * 70) + 'ms';
    const tt = el('title', {}, g); tt.textContent = e.t.id + ' · ' + e.t.title + '（点击查看依据）';
    el('rect', {
      'class': 'plq', x: px, y: py, width: e.w, height: PH, rx: 2,
      fill: '#ffffff', stroke: e.key ? PAL.red : PAL.ink, 'stroke-width': e.key ? 1.5 : 1.1,
    }, g);
    txt(g, px + 11, py + 15, e.t.id, { size: 9.5, fill: e.key ? PAL.red : PAL.inkLo, ls: 1 });
    txt(g, px + 11, py + 32, e.t.title, { size: 12, serif: true, bold: true, fill: PAL.ink });
    function open() {
      const r = g.getBoundingClientRect();
      U.showDrill({
        title: '时点 ' + e.t.id + ' · ' + e.t.lane + (e.key ? ' · 关键节点' : ''),
        value: e.t.title,
        sub: e.t.detail + '（方案模拟，不代表圣农真实经营事实）',
        source: SRC_LINE,
        x: r.left + r.width / 2, y: r.top,
      });
    }
    g.addEventListener('click', open);
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); } });
  });

  /* ══ ⑤ 全部标签最后：泳道 mono kicker（纸色描边 ≥4，见 txt()） ══ */
  const gLab = el('g', {}, svg);
  lanes.forEach(l => {
    const x0 = mL + l.from * step + 2, x1 = mL + (l.to + 1) * step - 2;
    txt(gLab, (x0 + x1) / 2, bandY + 17, l.name + ' · ' + TL[l.from].id + '–' + TL[l.to].id,
      { size: 9.5, fill: PAL.inkMd, ls: 2, anchor: 'middle' });
  });

  /* ── 入场：IntersectionObserver 左→右逐牌匾 stagger，fires once；
        prefers-reduced-motion 直接画完成帧（首帧前加 in，无过渡） ── */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    svg.classList.add('in');
  } else {
    const io = new IntersectionObserver(ens => {
      ens.forEach(en => {
        if (en.isIntersecting) { svg.classList.add('in'); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(host);
  }
})();
