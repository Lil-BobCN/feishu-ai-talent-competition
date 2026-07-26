/* ═══════════════════════════════════════════════════════════
   cover-wire.js · 封面 C —— 同一几何的蓝图线框 + 三键切换器
   两部分职责（COVER.md §5 / §7）：
   ① #cover-mode 三键（data-mode rec/x/w）切换 + localStorage + ?cover=rec|x|w 直链；
      切换逻辑必须住在最后加载的 cover-wire.js（§7）。宿主缺失时切换器仍须工作，
      因此线框模块包成内层 IIFE，初始 applyMode 在所有引擎注册后执行。
   ② 宿主 #cover-canvas-w（初始 display:none；setActive 时等 reflow 再 fit ——
      COVER.md 标注的最常见坑：display:'' 后同步量测 0×0 → 全空白）。
   数据：window.RPT.archives（七层 = 七类档案）；来源 K10 · 2026-07-23 · 方案模拟
   window.__COVER_NOTEXT = true 时不画任何文字（QA 识别测试钩子，非业务功能）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  /* ── ① 三键切换器 ── */
  const modeBar = document.getElementById('cover-mode');
  const CV = {
    rec: document.getElementById('cover-canvas'),
    x: document.getElementById('cover-canvas-x'),
    w: document.getElementById('cover-canvas-w'),
  };
  function applyMode(m, persist) {
    if (!CV.rec && !CV.x && !CV.w) return;
    ['rec', 'x', 'w'].forEach(k => { if (CV[k]) CV[k].style.display = (k === m) ? '' : 'none'; });
    if (window.COVER_A && typeof window.COVER_A.setActive === 'function') window.COVER_A.setActive(m === 'rec');
    if (window.COVER_X) window.COVER_X.setActive(m === 'x');
    if (window.COVER_W) window.COVER_W.setActive(m === 'w');
    if (modeBar) modeBar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    if (persist) { try { localStorage.setItem('coverModeV1', m); } catch (e) { /* file:// 或隐私模式 */ } }
  }
  let initial = 'rec';
  try {
    const q = new URLSearchParams(location.search).get('cover');
    if (q === 'rec' || q === 'x' || q === 'w') initial = q;
    else { const s = localStorage.getItem('coverModeV1'); if (s === 'rec' || s === 'x' || s === 'w') initial = s; }
  } catch (e) { /* 无 localStorage 环境 */ }
  if (modeBar) modeBar.querySelectorAll('button[data-mode]').forEach(btn =>
    btn.addEventListener('click', () => applyMode(btn.dataset.mode, true)));

  /* ── ② 蓝图线框模块 ── */
  const host = document.getElementById('cover-canvas-w');
  if (host) (function wireModule() {
    const U = window.U;
    if (!U) return;

    const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
    const MONO = 'Menlo,Consolas,monospace';
    const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_L = '#7d9bff';
    const NEG = '#c22f4e';                     // 真语义红，仅给 04
    const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

    U.frame(host, {
      title: '同一只档案夹的工程蓝图：七层语义在线框里仍然可读',
      sub: 'X 光线框 · 无隐线 · 逐层线色 = 档案类别色 · 点击空白装配/爆炸 · 点击图层或右侧标签下钻 · 方案模拟',
      src: '研究整理 · K10 评委稿（重写版）2026-07-23 · 方案模拟',
    });
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', '案件档案夹七层爆炸图的蓝图线框版：04 调查证据档案以语义红标注一份证据只存一次。');

    /* 数据纪律（§U.5）：宁可缺失不编造 */
    const ARCH = (window.RPT && Array.isArray(window.RPT.archives) && window.RPT.archives.length === 7)
      ? window.RPT.archives : null;

    const HX = 18, HY = 12.5, GAP = 0.14, SEP = 3.4;
    const LCOL = [BLUE_D, BLUE, BLUE_D, NEG, BLUE_D, BLUE, INK_M];   // 逐层线色 = 该层标签色（同 B）
    const LAYERS = ARCH ? ARCH.map((a, i) => ({
      i, no: a.no, name: a.name, holds: a.holds, thesis: a.thesis,
      kraft: i === 6, th: i === 6 ? 1.5 : 1.15,
      hx: i === 6 ? 19 : HX, hy: i === 6 ? 13.4 : HY,
      tabY: -8.4 + i * 2.8, color: LCOL[i], z0: 0,
    })) : [];
    let zacc = 0;
    for (let i = 6; i >= 0; i--) { if (LAYERS[i]) { LAYERS[i].z0 = zacc; zacc += LAYERS[i].th + GAP; } }
    /* 纵向容量：爆炸到顶所需净空；fit() 的 u 上限，矮视口不裁顶（与 B 同约） */
    const ZTOP = LAYERS.length ? LAYERS[0].z0 + LAYERS[0].th + 6 * SEP : 30;
    const PTOP = (HX + HY) * 0.7071 * 0.5 + 0.6;

    /* 几何引擎（COVER.md §2，与 B 同蓝图） */
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bd = U.bindCanvas(host);
    const ctx = bd.ctx;
    let W = 0, H = 0, Hv = 0, u = 6, cam = null, yawCur = Math.PI / 4;

    function fit() {
      const m = bd.fit();
      W = m.w; H = m.h;
      /* 封面内容可超过 100vh：签名条/对位标记/标签/几何锚定可视高度，否则沉到首屏外 */
      Hv = Math.max(320, Math.min(H, window.innerHeight || H));
      const leftBound = 0.585 * W;
      let right = W - 332, labels = true;
      u = Math.min((right - leftBound) / 44, Hv * 0.0132, (0.56 * Hv - 28) / (ZTOP + PTOP));
      if (u < 5.6) {
        labels = false; right = W - 40;
        u = Math.min((right - leftBound) / 44, Hv * 0.0132, (0.56 * Hv - 28) / (ZTOP + PTOP));
      }
      cam = { leftBound, right, labels, cx: (leftBound + right) / 2, cy: 0.56 * Hv };
    }
    function proj(x, y, z) {
      const c = Math.cos(yawCur), s = Math.sin(yawCur);
      const rx = x * c - y * s, ry = x * s + y * c;
      return { x: cam.cx + rx * u, y: cam.cy + ry * u * 0.5 - z * u, rx, ry };
    }
    const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

    let active = false, raf = 0, started = false;
    let kNow = 0, kFrom = 0, kTo = 1, kT0 = 0, t0 = 0;
    let yawMouse = 0, yawMouseT = 0;
    let hits = [];

    function layerZ(L, t) {
      const lay = U.clamp(kNow * 1.55 - L.i * 0.17, 0, 1);
      const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + L.i * 1.31) * 0.20 * lay;
      return { lay, z: L.z0 + lay * (6 - L.i) * SEP + breathe };
    }

    function pathOf(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
    }
    function fillP(pts, style) { pathOf(pts); ctx.fillStyle = style; ctx.fill(); }
    function strokeP(pts, style, lw) { pathOf(pts); ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke(); }
    function seg(p1, p2, style, lw) {
      ctx.strokeStyle = style; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    function haloText(txt, x, y, fill) {
      ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 3.5;
      ctx.strokeText(txt, x, y);
      ctx.fillStyle = fill; ctx.fillText(txt, x, y);
    }
    function fitText(text, budget) {
      if (ctx.measureText(text).width <= budget) return text;
      let s = text;
      while (s.length > 1 && ctx.measureText(s + ' …').width > budget) s = s.slice(0, -1);
      s = s.replace(/[\s,，、;；:：.。·\-—(（]+$/u, '');
      return s + ' …';
    }

    /* X 光线框：无隐线；远角 .22 / 近边 .7 / 顶面轮廓 .85；顶面白纱罩 .55–.8（COVER.md §5） */
    function wireLayer(L, z) {
      const hx = L.hx, hy = L.hy, zb = z, zt = z + L.th;
      const c = [
        proj(-hx, -hy, zb), proj(hx, -hy, zb), proj(hx, hy, zb), proj(-hx, hy, zb),
        proj(-hx, -hy, zt), proj(hx, -hy, zt), proj(hx, hy, zt), proj(-hx, hy, zt),
      ];
      const R = (hx + hy) * 0.7071;
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([a, b]) => {
        const n = U.clamp(((c[a].ry + c[b].ry) / 2) / R, -1, 1);
        seg(c[a], c[b], hexA(L.color, U.lerp(0.22, 0.7, (n + 1) / 2)), 1);
      });
      // 制图细节：侧页虚线（≤1px hairline）
      ctx.setLineDash([3, 3]);
      for (let f = 1; f <= 2; f++) {
        const zf = zb + L.th * f / 3;
        seg(proj(hx, -hy, zf), proj(hx, hy, zf), hexA(L.color, 0.34), 0.7);
        seg(proj(hx, hy, zf), proj(-hx, hy, zf), hexA(L.color, 0.34), 0.7);
      }
      ctx.setLineDash([]);
      // 顶面白纱罩（前后分层）
      fillP([c[4], c[5], c[6], c[7]], `rgba(255,255,255,${0.58 + L.i * 0.035})`);
      // 装订孔空心环（纸层细节，画在纱罩上）
      if (!L.kraft) [-8, 8].forEach(xc => {
        ctx.strokeStyle = hexA(L.color, 0.55); ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let k = 0; k <= 22; k++) {
          const th = k / 22 * U.TAU;
          const p = proj(xc + 1.6 * Math.cos(th), 1.6 * Math.sin(th), zt);
          if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      });
      // 顶面轮廓（最重 .85）
      strokeP([c[4], c[5], c[6], c[7]], hexA(L.color, 0.85), 1.2);
      // 分页签线框 + 根部虚线折痕
      const x1 = hx + 2.6, y0 = L.tabY, y1 = y0 + 3.2, zt2 = zt + 0.38, zb2 = zb - 0.02;
      const tf = [proj(x1, y0, zb2), proj(x1, y1, zb2), proj(x1, y1, zt2), proj(x1, y0, zt2)];
      strokeP(tf, hexA(L.color, 0.8), 0.8);
      seg(proj(hx, y0, zt2), proj(x1, y0, zt2), hexA(L.color, 0.8), 0.8);
      seg(proj(hx, y1, zt2), proj(x1, y1, zt2), hexA(L.color, 0.8), 0.8);
      ctx.setLineDash([2, 2.6]);
      seg(proj(hx, y0, zb2), proj(hx, y0, zt2), hexA(L.color, 0.4), 0.7);
      seg(proj(hx, y1, zb2), proj(hx, y1, zt2), hexA(L.color, 0.4), 0.7);
      ctx.setLineDash([]);
      // 夹身托盘加画盘口内外两圈
      if (L.kraft) {
        const z9 = z + 1.9;
        strokeP([proj(-hx, -hy, z9), proj(hx, -hy, z9), proj(hx, hy, z9), proj(-hx, hy, z9)], hexA(L.color, 0.5), 0.8);
        strokeP([proj(-hx + 0.55, -hy + 0.55, z9), proj(hx - 0.55, -hy + 0.55, z9),
                 proj(hx - 0.55, hy - 0.55, z9), proj(-hx + 0.55, hy - 0.55, z9)], hexA(L.color, 0.3), 0.7);
      }
      hits.push({ i: L.i, poly: [c[4], c[5], c[6], c[7]] });
      hits.push({ i: L.i, poly: tf });
    }

    function drawLabels(la, t) {
      const rows = LAYERS.map(L => {
        const zz = layerZ(L, t).z;
        const zt = zz + (L.kraft ? 1.9 : L.th);
        const cand = [
          proj(-L.hx, -L.hy, zt), proj(L.hx, -L.hy, zt), proj(L.hx, L.hy, zt), proj(-L.hx, L.hy, zt),
          proj(L.hx, 0, zt), proj(L.hx + 2.6, L.tabY + 1.6, zt - 0.4),
        ];
        let a = cand[0];
        for (let k = 1; k < cand.length; k++) if (cand[k].x > a.x) a = cand[k];
        return { L, ax: a.x, ay: a.y };
      });
      rows.sort((p, q) => p.ay - q.ay);
      const TOP = 64, BOT = Hv - 118, MIN = 34;
      rows.forEach((r, idx) => { r.ry = idx ? Math.max(r.ay, rows[idx - 1].ry + MIN) : Math.max(TOP, r.ay); });
      const over = rows[rows.length - 1].ry - BOT;
      if (over > 0) rows.forEach(r => { r.ry -= over; });
      const labX = cam.right + 6, textX = cam.right + 20;
      const budget = Math.min(286, W - 20 - textX);
      ctx.globalAlpha = la;
      rows.forEach(r => {
        const L = r.L, yy = r.ry;
        // 制图引线：锚点空心圈 → 短横 → 折线 → 短横入列
        ctx.strokeStyle = hexA(L.color, 0.75); ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r.ax + 4.6, r.ay);
        ctx.lineTo(r.ax + 13, r.ay);
        ctx.lineTo(labX, yy - 3.5);
        ctx.lineTo(labX + 8, yy - 3.5);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(r.ax, r.ay, 3.2, 0, U.TAU);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = hexA(L.color, 0.9); ctx.stroke();
        ctx.font = `700 10px ${MONO}`;
        haloText(fitText(`${L.no} · ${L.name}`, budget), textX, yy, L.color);
        ctx.font = `11px ${SERIF}`;
        haloText(fitText(L.thesis, budget), textX, yy + 13.5, INK_M);
        hits.push({ i: L.i, x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
      });
      ctx.globalAlpha = 1;
    }

    function drawStrip() {                                // 右下签名条：随状态改写
      const exploded = kTo === 1;
      const s1 = 'FIG. C — 案件档案夹 · 七类档案（方案模拟）';
      const s2 = (exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW') + ' · 7 LAYERS';
      const s3 = 'SOURCE 研究整理 K10 · 2026-07-23';
      const r1 = 'SCALE · NTS';
      const r2 = exploded ? 'CLICK TO ASSEMBLE' : 'CLICK TO EXPLODE';
      ctx.font = `700 9px ${MONO}`;
      const w1 = Math.max(ctx.measureText(s1).width, ctx.measureText(s2).width, ctx.measureText(s3).width);
      ctx.font = `9px ${MONO}`;
      const w2 = Math.max(ctx.measureText(r1).width, ctx.measureText(r2).width);
      const pad = 10, gap = 18;
      const bw = pad * 2 + w1 + gap + w2 + 8, bh = 58;
      const bx = W - 22 - bw, by = Hv - 22 - bh;
      ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = hexA(INK, 0.5); ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
      const dx = bx + pad + w1 + gap / 2 + 4;
      ctx.strokeStyle = hexA(INK, 0.3);
      ctx.beginPath(); ctx.moveTo(dx, by); ctx.lineTo(dx, by + bh); ctx.stroke();
      ctx.font = `700 9px ${MONO}`;
      haloText(s1, bx + pad, by + 15, BLUE);
      ctx.font = `9px ${MONO}`;
      haloText(s2, bx + pad, by + 27, INK_M);
      haloText(s3, bx + pad, by + 39, INK_L);
      /* 评审修复 8：04 唯一语义红图例（与封面 B 标签列根部同口径） */
      ctx.fillStyle = NEG;
      ctx.fillRect(bx + pad, by + 46, 6, 6);
      haloText('红 = 最硬约束', bx + pad + 10, by + 51.5, INK_M);
      ctx.textAlign = 'center';
      const cxr = (dx + bx + bw) / 2;
      haloText(r1, cxr, by + 23, INK_M);
      ctx.font = `700 9px ${MONO}`;
      haloText(r2, cxr, by + 40, INK);
      ctx.textAlign = 'left';
    }

    function regMarks() {                                 // 四角电蓝对位标记
      const m = 26;
      [[m, m], [W - m, m], [m, Hv - m], [W - m, Hv - m]].forEach(([x, y]) => {
        ctx.strokeStyle = hexA(BLUE, 0.75); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, U.TAU); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 11, y); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y); ctx.lineTo(x + 11, y);
        ctx.moveTo(x, y - 11); ctx.lineTo(x, y - 4); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 11);
        ctx.stroke();
      });
    }

    function draw(t) {
      if (W < 2 || H < 2 || !cam) return;
      ctx.clearRect(0, 0, W, H);
      hits = [];
      yawCur = Math.PI / 4 + (REDUCED ? 0 : 0.3 * Math.sin(t * 0.11)) + yawMouse;
      // 52px 十字格基线
      ctx.strokeStyle = 'rgba(5,28,44,.13)'; ctx.lineWidth = 1;
      for (let gx = 26; gx < W; gx += 52) for (let gy = 26; gy < H; gy += 52) {
        ctx.beginPath();
        ctx.moveTo(gx - 4, gy); ctx.lineTo(gx + 4, gy);
        ctx.moveTo(gx, gy - 4); ctx.lineTo(gx, gy + 4);
        ctx.stroke();
      }
      // 左文列白纱洗
      const wg = ctx.createLinearGradient(0, 0, 0.62 * W, 0);
      wg.addColorStop(0, 'rgba(255,255,255,.94)');
      wg.addColorStop(0.55, 'rgba(255,255,255,.5)');
      wg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = wg; ctx.fillRect(0, 0, 0.62 * W, H);
      regMarks();
      if (!LAYERS.length) {
        ctx.font = `10px ${MONO}`;
        haloText('ARCHIVE DATA MISSING · window.RPT.archives 未加载（数据纪律：宁可缺失不编造）', cam.cx - 150, cam.cy, INK_L);
        return;
      }
      // 地面虚线椭圆
      const g0 = proj(0, 0, 0);
      ctx.save(); ctx.translate(g0.x, g0.y + 1.2 * u); ctx.scale(1, 9.2 / 24);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(66,86,106,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 24 * u, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      for (let i = 6; i >= 0; i--) {
        const L = LAYERS[i];
        wireLayer(L, layerZ(L, t).z);
      }
      const la = U.clamp((kNow - 0.45) * 2.4, 0, 1);
      if (cam.labels && la > 0 && !window.__COVER_NOTEXT) drawLabels(la, t);
      if (!window.__COVER_NOTEXT) drawStrip();
    }

    /* 交互（与 B 同约：空白装配/爆炸，元素下钻） */
    function pointInPoly(x, y, poly) {
      let ins = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins;
      }
      return ins;
    }
    function hitAt(x, y) {
      for (let k = hits.length - 1; k >= 0; k--) {
        const h = hits[k];
        if (h.poly) { if (pointInPoly(x, y, h.poly)) return h; }
        else if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
      }
      return null;
    }
    function drillFor(i, x, y) {
      const a = LAYERS[i];
      U.showDrill({
        title: `档案 ${a.no} · ${a.name}（蓝图）`,
        value: a.no === '04' ? '证据只存一次' : `${a.no} / 07 · 七类档案`,
        sub: `${a.thesis}<br>保存：${a.holds}。七类档案组织一份受控逻辑记录；备份、缓存、只读投影不算第二套真相。`,
        source: '研究整理 · K10 评委稿（重写版）· 2026-07-23 · 24.9 元案例为方案模拟',
        x, y,
      });
    }
    function toggle() {
      kFrom = kNow; kTo = kTo === 1 ? 0 : 1; kT0 = performance.now();
      if (REDUCED) { kNow = kTo; drawStatic(); }
    }
    const header = document.getElementById('cover');
    const coverInner = header ? header.querySelector('.cover-inner') : null;
    if (header) {
      header.addEventListener('click', e => {
        if (!active) return;
        /* 评审修复 1（与封面 B 同口径）：只在真空白（画布 / 结构容器）上响应，文字层不触发 */
        const t = e.target;
        if (t !== host && t !== header && t !== coverInner) return;
        const r = host.getBoundingClientRect();
        const h = hitAt(e.clientX - r.left, e.clientY - r.top);
        if (h) { drillFor(h.i, e.clientX, e.clientY); return; }
        if (window.getSelection && String(window.getSelection()).length) return;
        toggle();
      });
      header.addEventListener('mousemove', e => {
        if (!active || REDUCED) return;
        yawMouseT = (e.clientX / window.innerWidth - 0.5) * 0.22;
        const t = e.target;
        if (t !== host && t !== header && t !== coverInner) { host.style.cursor = ''; return; }
        const r = host.getBoundingClientRect();
        host.style.cursor = hitAt(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : '';
      });
    }

    function drawStatic() { if (W < 2 || H < 2) fit(); if (W >= 2 && H >= 2) draw(0); }
    function frame(now) {
      if (!active) return;
      if (W < 2 || H < 2) fit();
      const t = now / 1000 - t0;
      const p = U.clamp((now - kT0) / 1650, 0, 1);
      kNow = kFrom + (kTo - kFrom) * (kTo >= kFrom ? easeOutBack(p) : easeInOut(p));
      yawMouse += (yawMouseT - yawMouse) * 0.06;
      draw(t);
      raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      if (on) {
        active = true;
        host.style.display = '';
        // 先 requestAnimationFrame 等 reflow 再 fit 再画，否则 0×0 全空白（COVER.md 最常见坑）
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fit();
          if (REDUCED) { kNow = kTo; drawStatic(); return; }
          if (!started) { started = true; kFrom = 0; kTo = 1; kNow = 0; kT0 = performance.now(); }
          if (!t0) t0 = performance.now() / 1000;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }));
      } else {
        active = false;
        cancelAnimationFrame(raf);
        host.style.cursor = '';
        host.style.display = 'none';
      }
    }
    window.COVER_W = { setActive };
    window.addEventListener('resize', () => { if (active) { fit(); if (REDUCED) drawStatic(); } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active && REDUCED) drawStatic(); });
  })();

  /* 初始模式：必须在 COVER_X / COVER_W 注册之后再应用（?cover= / localStorage 直链） */
  applyMode(initial, false);
})();
