/* ═══════════════════════════════════════════════════════════
   phase-road.js · §7 分阶段建议路带（模块工程师轮次，覆盖占位）
   宿主：#road-chart（§7，.wide.xl，.chart-frame）
   数据契约：window.RPT.phasesRoad[3] = { phase, scope, kind }
             kind ∈ now（第一阶段建议）/ next（后续相邻阶段）/
             future（远期探索方向）——只用已有键，缺失宁可不渲染。
   结构编码（≥2，均非文字）：
     ① 顺序——三站沿一条路带由近及远（序数编码：证据成熟度×业务
        邻近程度；不是时间轴，路带上无日期/年份/时刻刻度）；
     ② 确定性状态——描边与填充（实=当前可启动 / 空=待真实结果 /
        虚线空心=远期非承诺），路带自身由实线渐变为点线；
     ③ 回路拓扑——路带下方虚线弧「回到 03 重新讨论」（人主导的
        再讨论，非自动触发），回到起点而非通向新节点。
   内容红线：显著标注「不设时间表 · 不承诺企业按此顺序实施」；
   候选顺序为方案推断，不是圣农批准的路线；「自动」仅出现于
   否定句；每站 drill 回溯 K1（03 工作稿 §3.4 行 98–106）。
   QA 钩子：window.RPT03_NOTEXT=true 时跳过全部文字（隐字识别
   测试用，生产环境不设置）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const host = document.getElementById('road-chart');
  if (!host) return;
  host.setAttribute('data-module', 'phase-road');

  const U = window.U;
  if (!U) return;
  const PAL = U.PAL, clamp = U.clamp;
  const FM = 'Menlo,Consolas,monospace';
  const FS = '"et-book","Songti SC",Palatino,Georgia,serif';
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOTEXT = !!window.RPT03_NOTEXT;

  const RPT = window.RPT || {};
  const ROAD = Array.isArray(RPT.phasesRoad) ? RPT.phasesRoad.slice(0, 3) : [];
  const CAND = Array.isArray(RPT.expansionCandidates) ? RPT.expansionCandidates : [];

  /* ── 骨架 trio：title=结论句 / sub=mono 读法+交互提示 / src=来源+日期 ── */
  const body = U.frame(host, {
    title: '三站由近及远，确定性随序递减——顺序是方案推断，不是实施承诺',
    sub: '读法 · 站位＝证据成熟度×业务邻近程度（序数编码，非时间轴） · 描边＝确定性（实＝当前可启动／空＝待真实结果／虚＝远期非承诺） · 点击站牌或回路查看依据',
    src: '03 业务扩域循环专题工作稿 §3.4（行 98–106） · K1 · 2026-07-24',
  });

  /* 作用域样式（前缀 pr03-，不碰全站 css） */
  const style = document.createElement('style');
  style.textContent =
    '#road-chart .pr03-canvas{width:100%;height:430px;display:block}' +
    '#road-chart .pr03-note{margin-top:10px;padding:9px 2px 8px;border-top:1px solid var(--line);' +
    'border-bottom:1px solid var(--line-lo);font-family:var(--mono);font-size:10.5px;line-height:1.8;' +
    'color:var(--ink-md);letter-spacing:.02em}' +
    '#road-chart .pr03-note b{color:var(--ink)}' +
    '#road-chart .pr03-empty{font-family:var(--mono);font-size:11px;color:var(--ink-lo);padding:26px 0}';
  body.appendChild(style);

  /* 数据缺失：宁可不渲染，不补造（§U#5） */
  if (!ROAD.length) {
    const p = document.createElement('p');
    p.className = 'pr03-empty';
    p.textContent = 'RPT.phasesRoad 数据缺失——按契约宁可缺失，不补造。';
    body.appendChild(p);
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'pr03-canvas';
  canvas.setAttribute('data-drill-keep', '1');
  body.appendChild(canvas);

  /* 显著标注：不设时间表 · 不承诺按此顺序实施 · 回到 03 重新讨论 */
  const note = document.createElement('div');
  note.className = 'pr03-note';
  note.innerHTML = '<b>不设时间表</b> · <b>不承诺企业按此顺序实施</b> · 候选顺序为方案推断，不是圣农批准的路线——' +
    '每完成一个真实试点，都可以回到 03 重新讨论下一阶段建议（K1 · 行 106）。';
  body.appendChild(note);

  /* ── 三站内容（文案全部回溯 RPT / 母稿行 98–106，无编造） ── */
  const SRC_K1 = 'K1 · 03 业务扩域循环专题工作稿 §3.4（行 98–106） · 2026-07-24';
  const SRC_K2 = 'K2 · 圣农发展 2025 年年度报告方向';

  function shortScope(d) {
    return d.kind === 'next' ? d.scope.replace(/^根据真实结果[，,]?\s*再讨论/, '') : d.scope;
  }

  const ST = ROAD.map((d, i) => {
    const st = { i, kind: d.kind, phase: d.phase, scope: d.scope, name: shortScope(d) };
    if (d.kind === 'now') {
      const c = CAND[0] || null;
      st.tag = '当前可启动';
      st.basis = c ? '与已有试点对象较相邻 · 年报方向相符' : '与已有试点对象较相邻';
      st.drill = {
        title: d.phase, value: d.scope,
        sub: (c ? '依据：' + c.suggestion + '。' +
               (c.evPublic ? c.evPublic + '（K2）；' : '') +
               (c.evUnknown ? c.evUnknown + '。' : '') : '') +
             '「当前可启动」＝建议作为首选下一试点；企业仍可确认、调整、暂缓或否决。',
        source: SRC_K1 + ' ｜ ' + SRC_K2,
      };
    } else if (d.kind === 'next') {
      const c2 = CAND[1] || null, c3 = CAND[2] || null;
      st.basis = '待第一阶段真实结果 · 走向由企业判断';
      st.drill = {
        title: d.phase, value: st.name,
        sub: '母稿原文：「' + d.scope + '」（行 102）。' +
             (c2 && c2.evUnknown ? '促销毛利治理：' + c2.evUnknown + '；' : '') +
             (c3 && c3.evUnknown ? 'B 端履约治理：' + c3.evUnknown + '。' : '') +
             '须待第一阶段形成真实结果后再讨论，不预设启动。',
        source: SRC_K1,
      };
    } else {
      st.basis = '证据与邻近程度最低 · 方向性探索，非承诺';
      st.drill = {
        title: d.phase, value: st.name,
        sub: '母稿原文：「' + d.scope + '」（行 103）。虚线空心＝遥远而非承诺：不构成实施安排，' +
             '不预设时间预期；是否靠近这些方向，取决于此前真实试点的结果与企业选择。',
        source: SRC_K1 + ' ｜ ' + SRC_K2,
      };
    }
    return st;
  });

  const LOOP = {
    label: '每完成一个真实试点 → 回到 03 重新讨论（人主导，非自动触发）',
    tip: '回到 03 重新讨论 · 点击查看母稿原文',
    drill: {
      title: '回到 03 重新讨论', value: '每完成一个真实试点',
      sub: '母稿原文：「每完成一个真实试点，都可以回到 03 重新讨论下一阶段建议」（行 106）。' +
           '回路表示由人主导的再讨论——03 不设计自动触发，新建议仍由企业确认、调整、暂缓或否决。',
      source: SRC_K1,
    },
  };

  /* ── 画布与布局 ── */
  const bind = U.bindCanvas(canvas);
  const ctx = bind.ctx;
  let W = 0, H = 0, geo = null, prog = REDUCE ? 1 : 0, started = false;

  function layout() {
    const r = bind.fit();
    W = r.w; H = r.h;
    const x0 = 64, x1 = W - 56, yR = H - 128;
    // 二次贝塞尔路带：y(t) = yR + 60·t·(1−t)（轻微下弯，无轴向刻度）
    const pt = t => ({ x: x0 + (x1 - x0) * t, y: yR + 60 * t * (1 - t) });
    const pw = clamp(W * 0.30, 208, 262), ph = 94;
    const ts = [0.16, 0.5, 0.84];
    geo = {
      x0, x1, yR, pt,
      st: ST.map((s, i) => {
        const node = pt(ts[i]);
        const tierY = i === 1 ? 142 : 42;          // 奇偶分层：纵带不重叠，横移豁免
        const rx = clamp(node.x - pw / 2, 10, W - pw - 10);
        return { node, rect: { x: rx, y: tierY, w: pw, h: ph }, cx: rx + pw / 2 };
      }),
      loopHit: null,
    };
  }

  /* ── 文字工具：纸色光晕 / 测量截断（截尾去逗号连词加" …"） / 两行折行 ── */
  function txt(text, x, y, o) {
    if (NOTEXT) return;
    o = o || {};
    ctx.save();
    ctx.font = o.font;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
    if (o.ls && 'letterSpacing' in ctx) ctx.letterSpacing = o.ls;
    if (o.halo !== false) {
      ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = o.fill;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  function measure(text, font, ls) {
    ctx.save(); ctx.font = font;
    if (ls && 'letterSpacing' in ctx) ctx.letterSpacing = ls;
    const w = ctx.measureText(text).width;
    ctx.restore(); return w;
  }
  function trunc(text, maxW, font) {
    ctx.save(); ctx.font = font;
    let s = text;
    if (ctx.measureText(s).width > maxW) {
      while (s.length > 1 && ctx.measureText(s + ' …').width > maxW) s = s.slice(0, -1);
      s = s.replace(/[\s，、；：·\/（）(),.…]+$/u, '').replace(/[与和或及的在]$/u, '');
      s += ' …';
    }
    ctx.restore(); return s;
  }
  function wrap2(text, maxW, font) {
    ctx.save(); ctx.font = font;
    if (ctx.measureText(text).width <= maxW) { ctx.restore(); return [text, null]; }
    let l1 = '', l2 = '';
    for (const ch of text) {
      if (!l2.length && ctx.measureText(l1 + ch).width <= maxW) l1 += ch; else l2 += ch;
    }
    ctx.restore();
    // 折行点偏好「、」：l2 过短时回退到最近的顿号，避免孤词行
    if (l2 && l2.length <= 4) {
      const idx = l1.lastIndexOf('、');
      if (idx > 0) { l2 = l1.slice(idx + 1) + l2; l1 = l1.slice(0, idx + 1); }
    }
    return [l1, trunc(l2, maxW, font)];
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const stAlpha = i => clamp((prog - 0.40 - i * 0.15) / 0.22, 0, 1);

  /* 路带：实线（证据较成熟）→ 长虚线 → 点线（遥远未建），无日期无年份 */
  function drawRoad(progR) {
    const segs = [
      { a: 0, b: 0.16, dash: [], lw: 9, color: PAL.ink },
      { a: 0.16, b: 0.5, dash: [22, 14], lw: 8, color: PAL.ink, alpha: 0.62 },
      { a: 0.5, b: 1, dash: [0.1, 15], lw: 6.5, color: PAL.inkLo, alpha: 0.9 },
    ];
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W * progR + 14, H); ctx.clip();
    segs.forEach(sg => {
      ctx.save();
      ctx.strokeStyle = sg.color; ctx.lineWidth = sg.lw; ctx.lineCap = 'round';
      if (sg.alpha) ctx.globalAlpha = sg.alpha;
      ctx.setLineDash(sg.dash);
      ctx.beginPath();
      const N = 48;
      for (let k = 0; k <= N; k++) {
        const p = geo.pt(sg.a + (sg.b - sg.a) * (k / N));
        k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      }
      ctx.stroke(); ctx.restore();
    });
    ctx.restore();
  }

  function drawStations() {
    ST.forEach((s, i) => {
      const g = geo.st[i], a = stAlpha(i);
      if (a <= 0) return;
      const now = s.kind === 'now', future = s.kind === 'future';
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = future ? PAL.inkLo : PAL.inkMd;
      ctx.lineWidth = 1.2;
      if (future) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(g.cx, g.rect.y + g.rect.h);
      ctx.lineTo(g.node.x, g.node.y - 10);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = a;
      if (now) {
        ctx.fillStyle = PAL.red;
        ctx.beginPath(); ctx.arc(g.node.x, g.node.y, 8, 0, U.TAU); ctx.fill();
        ctx.fillStyle = PAL.paper;
        ctx.beginPath(); ctx.arc(g.node.x, g.node.y, 3, 0, U.TAU); ctx.fill();
        ctx.globalAlpha = a * 0.35;
        ctx.strokeStyle = PAL.red; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(g.node.x, g.node.y, 12.5, 0, U.TAU); ctx.stroke();
      } else {
        ctx.fillStyle = PAL.paper;
        ctx.beginPath(); ctx.arc(g.node.x, g.node.y, 7, 0, U.TAU); ctx.fill();
        ctx.strokeStyle = future ? PAL.inkLo : PAL.ink;
        ctx.lineWidth = future ? 1.4 : 1.6;
        if (future) ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(g.node.x, g.node.y, 7, 0, U.TAU); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawPlaques() {
    ST.forEach((s, i) => {
      const g = geo.st[i], a = stAlpha(i);
      if (a <= 0) return;
      const { x, y, w, h } = g.rect;
      const now = s.kind === 'now', future = s.kind === 'future';
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, (1 - a) * 10);
      rr(x, y, w, h, 4);
      ctx.fillStyle = PAL.paper; ctx.fill();
      if (now) { ctx.strokeStyle = PAL.red; ctx.lineWidth = 2; ctx.stroke(); }
      else if (future) { ctx.strokeStyle = PAL.inkLo; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.stroke(); }
      else { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.2; ctx.stroke(); }
      ctx.setLineDash([]);

      const pad = 12;
      if (now && s.tag) {
        // 「当前可启动」骑缝在站牌右上角边框上，不占 kicker 行宽
        const pf = '9px ' + FM;
        const pillW = measure(s.tag, pf, '1px') + 14;
        const px = x + w - pad - pillW, py = y - 7.5;
        rr(px, py, pillW, 15, 7.5);
        ctx.fillStyle = PAL.red; ctx.fill();
        txt(s.tag, px + pillW / 2, py + 7.5, { font: pf, fill: '#fff', align: 'center', baseline: 'middle', halo: false, ls: '1px' });
      }
      const kf = '9.5px ' + FM;
      const kicker = 'STATION 0' + (i + 1) + ' · ' + s.phase;
      txt(trunc(kicker, w - pad * 2, kf), x + pad, y + 20,
        { font: kf, fill: now ? PAL.redHi : (future ? PAL.inkLo : PAL.inkMd), halo: false, ls: '1.2px' });
      const nf = '700 13px ' + FS;
      const lines = wrap2(s.name, w - pad * 2, nf);
      const nFill = future ? PAL.inkMd : PAL.ink;
      txt(lines[0], x + pad, y + 41, { font: nf, fill: nFill, halo: false });
      if (lines[1]) txt(lines[1], x + pad, y + 58, { font: nf, fill: nFill, halo: false });
      const bf = '10.5px ' + FS;
      txt(trunc(s.basis, w - pad * 2, bf), x + pad, y + h - 13,
        { font: bf, fill: future ? PAL.inkLo : PAL.inkMd, halo: false });
      ctx.restore();
    });
  }

  /* 路带两端序数语义标注（无日期/年份） */
  function drawEndLabels(a) {
    if (a <= 0) return;
    const f = '10px ' + FM;
    txt('近 · 证据较成熟 · 业务较相邻', geo.x0 - 4, geo.yR + 30, { font: f, fill: PAL.inkLo, alpha: a, ls: '0.5px' });
    txt('远 · 方向性探索（非承诺）', geo.x1 + 4, geo.yR + 30, { font: f, fill: PAL.inkLo, align: 'right', alpha: a, ls: '0.5px' });
  }

  /* 回路虚线弧：每完成一个真实试点 → 回到 03 重新讨论（人主导，非自动触发） */
  function drawLoop(a) {
    if (a <= 0) return;
    const A = { x: geo.st[2].node.x, y: geo.yR + 40 };
    const B = { x: geo.st[0].node.x, y: geo.yR + 40 };
    const c1 = { x: A.x - 80, y: H - 14 }, c2 = { x: B.x + 80, y: H - 14 };
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = PAL.inkLo; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y);
    ctx.stroke();
    ctx.setLineDash([]);
    const dx = B.x - c2.x, dy = B.y - c2.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, px = -uy, py = ux;
    ctx.fillStyle = PAL.inkLo;
    ctx.beginPath();
    ctx.moveTo(B.x + ux * 2, B.y + uy * 2);
    ctx.lineTo(B.x - ux * 9 + px * 4.5, B.y - uy * 9 + py * 4.5);
    ctx.lineTo(B.x - ux * 9 - px * 4.5, B.y - uy * 9 - py * 4.5);
    ctx.closePath(); ctx.fill();
    const f = '10px ' + FM;
    const lw = measure(LOOP.label, f, '0.5px');
    const lx = clamp((A.x + B.x) / 2, lw / 2 + 8, W - lw / 2 - 8);
    const ly = H - 16;
    txt(LOOP.label, lx, ly, { font: f, fill: PAL.inkMd, align: 'center', alpha: a, ls: '0.5px' });
    geo.loopHit = { x: lx - lw / 2 - 6, y: ly - 12, w: lw + 12, h: 20 };
    ctx.restore();
  }

  function draw() {
    if (!geo || W < 320) return;
    ctx.clearRect(0, 0, W, H);
    const progR = clamp(prog / 0.55, 0, 1);
    drawRoad(progR);
    drawStations();
    drawEndLabels(clamp((progR - 0.6) / 0.4, 0, 1));
    drawLoop(clamp((prog - 0.86) / 0.14, 0, 1));
    drawPlaques();
  }

  /* ── 入场：IntersectionObserver fires once；reduced-motion 直接完成帧 ── */
  function animate() {
    const t0 = performance.now();
    const step = ts => {
      prog = clamp((ts - t0) / 1200, 0, 1);
      draw();
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true; io.disconnect();
        if (REDUCE) { prog = 1; draw(); } else animate();
      }
    });
  }, { threshold: 0.18 });
  layout(); draw();
  io.observe(host);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
  let rT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => { layout(); draw(); }, 140);
  });

  /* ── 交互：hover tip + click drill（依据回溯 K1 行 98–106） ── */
  function hit(e) {
    if (!geo) return null;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = 0; i < ST.length; i++) {
      const g = geo.st[i], rc = g.rect;
      if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) return { kind: 'st', i };
      const dx = x - g.node.x, dy = y - g.node.y;
      if (dx * dx + dy * dy <= 15 * 15) return { kind: 'st', i };
    }
    const lh = geo.loopHit;
    if (lh && x >= lh.x && x <= lh.x + lh.w && y >= lh.y && y <= lh.y + lh.h) return { kind: 'loop' };
    return null;
  }
  canvas.addEventListener('click', e => {
    const hHit = hit(e);
    if (!hHit) return;
    const d = hHit.kind === 'loop' ? LOOP.drill : ST[hHit.i].drill;
    U.showDrill({ title: d.title, value: d.value, sub: d.sub, source: d.source, x: e.clientX, y: e.clientY });
  });
  canvas.addEventListener('mousemove', e => {
    const hHit = hit(e);
    canvas.style.cursor = hHit ? 'pointer' : 'default';
    if (hHit) {
      U.showTip(hHit.kind === 'loop' ? LOOP.tip : ST[hHit.i].phase + ' · 点击查看依据与边界', e.clientX, e.clientY);
    } else U.hideTip();
  });
  canvas.addEventListener('mouseleave', () => { canvas.style.cursor = 'default'; U.hideTip(); });
})();
