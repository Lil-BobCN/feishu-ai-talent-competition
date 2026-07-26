/* ═══════════════════════════════════════════════════════════
   cover-wire.js · 封面 C —— 隔离试验样本管的蓝图线框 + 三键切换器
   两部分职责（COVER.md §5 / §7）：
   ① #cover-mode 三键（data-mode rec/x/w）切换 + localStorage + ?cover=rec|x|w 直链；
      切换逻辑必须住在最后加载的 cover-wire.js（§7）。宿主缺失时切换器仍须工作，
      因此线框模块包成内层 IIFE，初始 applyMode 在所有引擎注册后执行。
   ② 宿主 #cover-canvas-w（初始 display:none；setActive 时等 reflow 再 fit ——
      COVER.md 标注的最常见坑：display:'' 后同步量测 0×0 → 全空白）。
   数据：window.RPT.trialLayers（八层 = 试验记录字段）；来源 K1 · 2026-07-23 定稿 · EV-03 行208
   window.__COVER_NOTEXT = true 时不画任何文字（QA 识别测试钩子，非业务功能）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  /* ── ① 三键切换器（地基契约：applyMode / localStorage coverModeV1 / ?cover= 直链，勿破坏） ── */
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

  /* ── ② 蓝图线框模块（与封面 B 同几何） ── */
  const host = document.getElementById('cover-canvas-w');
  if (host) (function wireModule() {
    const U = window.U;
    if (!U) return;

    const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
    const MONO = 'Menlo,Consolas,monospace';
    const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_L = '#7d9bff';
    const NEG = '#c22f4e';                     // 真语义红，仅给 07 审批层
    const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

    U.frame(host, {
      title: '同一支样本管的工程蓝图：八层字段在线框里仍然可读',
      sub: 'X 光线框 · 无隐线 · 逐层线色 = 字段标签色 · 点击空白装配/爆炸 · 点击液层或右侧标签下钻',
      src: '研究整理 · 02 专题工作稿 EV-03 · K1（2026-07-23 定稿 · 2026-07-24 最终复核）',
    });
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', '隔离试验样本管八层爆炸图的蓝图线框版：07 审批层以语义红标注无批准不进生产。');

    /* 数据纪律（§U.5）：宁可缺失不编造 */
    const TL = (window.RPT && Array.isArray(window.RPT.trialLayers) && window.RPT.trialLayers.length === 8)
      ? window.RPT.trialLayers : null;

    const R = 6, TH = 1.5, GAP = 0.12, SEP = 2.2;
    const BASE_HX = 9.5, BASE_HY = 7, BASE_TH = 1.6;
    const GLASS_ZB = 1.2, GLASS_ZT = 15.4;
    const STACK_Z0 = 1.9;
    const LCOL = [BLUE_L, BLUE, BLUE_D, INK_L, BLUE, BLUE_D, NEG, INK_M];   // 逐层线色 = 该层标签色（同 B）
    const LAYERS = TL ? TL.map((f, i) => ({
      i, no: '0' + (i + 1), field: f.field, meaning: f.meaning,
      th: TH, color: LCOL[i],
      z0: STACK_Z0 + (7 - i) * (TH + GAP),
    })) : [];
    const CORK = { r: R * 0.86, th: 1.5, z0: GLASS_ZT - 0.35 };
    const riseOf = L => (8 - L.i) * SEP;
    const ZTOP = CORK.z0 + 9.4 * SEP + CORK.th + 1.2;
    const WFOOT = (BASE_HX + BASE_HY) * 0.7071 * 2 + 2.5;

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
      u = Math.min((right - leftBound) / (WFOOT + 2), Hv * 0.0135, (0.56 * Hv - 30) / ZTOP);
      if (u < 4.6) {
        labels = false; right = W - 40;
        u = Math.min((right - leftBound) / (WFOOT + 2), Hv * 0.0135, (0.56 * Hv - 30) / ZTOP);
      }
      cam = { leftBound, right, labels, cx: (leftBound + right) / 2, cy: 0.56 * Hv };
    }
    function proj(x, y, z) {
      const c = Math.cos(yawCur), s = Math.sin(yawCur);
      const rx = x * c - y * s, ry = x * s + y * c;
      return { x: cam.cx + rx * u, y: cam.cy + ry * u * 0.5 - z * u, rx, ry };
    }
    const ellY = z => cam.cy - z * u;
    const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

    let active = false, raf = 0, started = false;
    let kNow = 0, kFrom = 0, kTo = 1, kT0 = 0, t0 = 0;
    let yawMouse = 0, yawMouseT = 0;
    let hits = [];

    function layerZ(L, t) {
      const lay = U.clamp(kNow * 1.9 - L.i * 0.13, 0, 1);
      const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + L.i * 1.31) * 0.20 * lay;
      return { lay, z: L.z0 + lay * riseOf(L) + breathe };
    }
    function corkZ(t) {
      const lay = U.clamp(kNow * 1.55, 0, 1);  // 软木塞先拔塞：k≈0.65 即完成起升
      const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + 8 * 1.31) * 0.20 * lay;
      return { lay, z: CORK.z0 + lay * 9.4 * SEP + breathe };
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

    /* X 光线框圆柱：无隐线；后半弧 .22 / 近边 .7 / 顶面轮廓 .85；顶面白纱罩（COVER.md §5） */
    function wireCylinder(cxR, z, th, color, veil) {
      const rx = cxR * u, ry = cxR * u * 0.5;
      const yb = ellY(z), yt = ellY(z + th);
      // 后半弧（远 .22，虚线）+ 前半弧（近 .7）：底圈与顶圈内描
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = hexA(color, 0.22); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(cam.cx, yb, rx, ry, 0, Math.PI, U.TAU, false); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = hexA(color, 0.7); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cam.cx, yb, rx, ry, 0, 0, Math.PI, false); ctx.stroke();
      // 两侧竖边（近 .7）
      seg({ x: cam.cx - rx, y: yt }, { x: cam.cx - rx, y: yb }, hexA(color, 0.7), 1);
      seg({ x: cam.cx + rx, y: yt }, { x: cam.cx + rx, y: yb }, hexA(color, 0.7), 1);
      // 顶面白纱罩（前后分层）
      ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU);
      ctx.fillStyle = `rgba(255,255,255,${veil})`; ctx.fill();
      // 半月线虚弧（液面细节，≤1px hairline）
      ctx.setLineDash([2, 2.6]);
      ctx.strokeStyle = hexA(color, 0.4); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx * 0.72, ry * 0.72, 0, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([]);
      // 顶面轮廓（最重 .85）
      ctx.strokeStyle = hexA(color, 0.85); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.stroke();
      return { rx, ry, yb, yt };
    }
    function wireLayer(L, z) {
      wireCylinder(R - 0.55, z, L.th, L.color, 0.58 + L.i * 0.026);
      // 右侧刻度身份线 + 字段序号（同 B 的位置语义；层距 <14px 隔档、<9px 不画）
      const yt = ellY(z + L.th);
      const tx0 = cam.cx + R * u + 1.5, tx1 = tx0 + 8;
      seg({ x: tx0, y: yt }, { x: tx1, y: yt }, hexA(L.color, 0.9), 1);
      const pitch = (TH + GAP) * u;
      const showNo = pitch >= 14 || (pitch >= 9 && L.i % 2 === 0);
      if (!window.__COVER_NOTEXT && showNo) {
        ctx.font = `700 7.5px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        haloText(L.no, tx1 + 2.5, yt, L.color);
        ctx.textBaseline = 'alphabetic';
      }
      const rx = (R - 0.55) * u, ry = (R - 0.55) * u * 0.5;
      hits.push({ i: L.i, kind: 'layer', x0: cam.cx - rx, x1: cam.cx + rx, y0: yt - ry, y1: ellY(z) + ry,
                  ell: { cx: cam.cx, cy: yt, rx, ry } });
    }
    function wireGlass() {
      const rx = R * u, ry = R * u * 0.5;
      const yb = ellY(GLASS_ZB), yt = ellY(GLASS_ZT);
      // 管壁两侧（ink 中性）+ 底圈前弧
      seg({ x: cam.cx - rx, y: yt }, { x: cam.cx - rx, y: yb }, hexA(INK_M, 0.55), 1);
      seg({ x: cam.cx + rx, y: yt }, { x: cam.cx + rx, y: yb }, hexA(INK_M, 0.55), 1);
      ctx.strokeStyle = hexA(INK_M, 0.5); ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.ellipse(cam.cx, yb, rx, ry, 0, 0, Math.PI, false); ctx.stroke();
      // 刻度虚线（hairline）
      ctx.setLineDash([2, 2.6]);
      ctx.strokeStyle = hexA(INK_M, 0.35); ctx.lineWidth = 0.7;
      for (let gz = 3; gz <= 14; gz += 1.375) {
        const yy = ellY(gz);
        ctx.beginPath(); ctx.moveTo(cam.cx - rx + 1, yy); ctx.lineTo(cam.cx - rx + 6, yy); ctx.stroke();
      }
      ctx.setLineDash([]);
      // 管口双圈（最重 .85）
      ctx.strokeStyle = hexA(INK, 0.85); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.stroke();
      ctx.strokeStyle = hexA(INK_M, 0.4); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx - 2.2, ry - 1.1, 0, 0, U.TAU); ctx.stroke();
      hits.push({ i: -1, kind: 'glass', x0: cam.cx - rx, x1: cam.cx + rx, y0: yt - ry, y1: yb + ry });
    }
    function wireCork(z) {
      wireCylinder(CORK.r, z, CORK.th, INK_M, 0.62);
      const rx = CORK.r * u, ry = CORK.r * u * 0.5;
      hits.push({ i: -2, kind: 'cork', x0: cam.cx - rx, x1: cam.cx + rx,
                  y0: ellY(z + CORK.th) - ry, y1: ellY(z) + ry,
                  ell: { cx: cam.cx, cy: ellY(z + CORK.th), rx, ry } });
    }
    function wireBase() {
      const hx = BASE_HX, hy = BASE_HY;
      const c = [
        proj(-hx, -hy, 0), proj(hx, -hy, 0), proj(hx, hy, 0), proj(-hx, hy, 0),
        proj(-hx, -hy, BASE_TH), proj(hx, -hy, BASE_TH), proj(hx, hy, BASE_TH), proj(-hx, hy, BASE_TH),
      ];
      const Rp = (hx + hy) * 0.7071;
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([a, b]) => {
        const n = U.clamp(((c[a].ry + c[b].ry) / 2) / Rp, -1, 1);
        seg(c[a], c[b], hexA(INK_M, U.lerp(0.22, 0.7, (n + 1) / 2)), 1);
      });
      // 顶面白纱罩 + 抱箍双圈（最重 .85）
      fillP([c[4], c[5], c[6], c[7]], 'rgba(255,255,255,.55)');
      strokeP([c[4], c[5], c[6], c[7]], hexA(INK, 0.85), 1.2);
      const cy6 = ellY(BASE_TH);
      ctx.strokeStyle = hexA(INK, 0.6); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cam.cx, cy6, (R + 0.9) * u, (R + 0.9) * u * 0.5, 0, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = hexA(INK_M, 0.3); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(cam.cx, cy6, (R + 1.7) * u, (R + 1.7) * u * 0.5, 0, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([]);
      hits.push({ i: -3, kind: 'base', x0: Math.min(c[4].x, c[7].x), x1: Math.max(c[5].x, c[6].x),
                  y0: Math.min(c[4].y, c[5].y, cy6 - (R + 1.7) * u * 0.5), y1: Math.max(c[2].y, c[3].y) });
    }

    function drawLabels(la, t) {
      const rows = LAYERS.map(L => {
        const zz = layerZ(L, t).z;
        return { L, ax: cam.cx + R * u, ay: ellY(zz + L.th) };
      });
      rows.sort((p, q) => p.ay - q.ay);
      const TOP = 64, BOT = Hv - 118, MIN = 34;
      rows.forEach((r, idx) => { r.ry = idx ? Math.max(r.ay, rows[idx - 1].ry + MIN) : Math.max(TOP, r.ay); });
      const over = rows[rows.length - 1].ry - BOT;
      if (over > 0) rows.forEach(r => { r.ry -= over; });
      const labX = cam.right + 6, textX = cam.right + 20;
      const budget = Math.min(286, W - 20 - textX);
      ctx.globalAlpha = la;
      ctx.font = `8.5px ${MONO}`;
      ctx.fillStyle = NEG;
      ctx.fillRect(textX, TOP - 30, 7, 7);
      haloText('红 = 审批 · 最硬约束（无批准不进生产）', textX + 12, TOP - 23, INK_M);
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
        haloText(fitText(`${L.no} · ${L.field}`, budget), textX, yy, L.color);
        ctx.font = `11px ${SERIF}`;
        haloText(fitText(L.meaning, budget), textX, yy + 13.5, INK_M);
        hits.push({ i: L.i, kind: 'layer', x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
      });
      ctx.globalAlpha = 1;
    }

    function drawStrip() {                     // 右下签名条：随状态改写
      const exploded = kTo === 1;
      const s1 = 'FIG. C — 隔离试验样本管 · 试验记录八字段';
      const s2 = (exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW') + ' · 8 LAYERS';
      const s3 = 'SOURCE 研究整理 K1 · 2026-07-23';
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
      /* 07 审批唯一语义红图例（与封面 B 标签列根部同口径） */
      ctx.fillStyle = NEG;
      ctx.fillRect(bx + pad, by + 46, 6, 6);
      haloText('红 = 审批 · 最硬约束', bx + pad + 10, by + 51.5, INK_M);
      ctx.textAlign = 'center';
      const cxr = (dx + bx + bw) / 2;
      haloText(r1, cxr, by + 23, INK_M);
      ctx.font = `700 9px ${MONO}`;
      haloText(r2, cxr, by + 40, INK);
      ctx.textAlign = 'left';
    }

    function regMarks() {                      // 四角电蓝对位标记
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
        haloText('TRIAL DATA MISSING · window.RPT.trialLayers 未加载（数据纪律：宁可缺失不编造）', cam.cx - 150, cam.cy, INK_L);
        return;
      }
      // 地面虚线椭圆
      ctx.save(); ctx.translate(cam.cx, ellY(0) + 1.2 * u); ctx.scale(1, 6 / 15);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(66,86,106,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 15 * u, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      wireBase();
      wireGlass();
      for (let i = 7; i >= 0; i--) {
        const L = LAYERS[i];
        wireLayer(L, layerZ(L, t).z);
      }
      wireCork(corkZ(t).z);
      const la = U.clamp((kNow - 0.45) * 2.4, 0, 1);
      if (cam.labels && la > 0 && !window.__COVER_NOTEXT) drawLabels(la, t);
      if (!window.__COVER_NOTEXT) drawStrip();
    }

    /* 交互（与 B 同约：空白装配/爆炸，元素下钻） */
    function hitAt(x, y) {
      for (let k = hits.length - 1; k >= 0; k--) {
        const h = hits[k];
        if (h.ell) {
          const dx = (x - h.ell.cx) / h.ell.rx, dy = (y - h.ell.cy) / h.ell.ry;
          if (dx * dx + dy * dy <= 1) return h;
          if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h;
        } else if (h.x0 != null) {
          if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h;
        } else if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
      }
      return null;
    }
    function drillFor(h, x, y) {
      if (h.kind === 'layer') {
        const L = LAYERS[h.i];
        U.showDrill({
          title: `试验记录字段 ${L.no} · ${L.field}（蓝图）`,
          value: L.no === '07' ? '无批准不进生产' : `${L.no} / 08 · 试验记录字段`,
          sub: `${L.meaning}。母稿 EV-03（行208）：试验记录至少含假设、修改对象、基线、案例集、指标、结论、审批和版本关系。${L.no === '07' ? '审批是全链路最硬约束：批准才形成候选 Agent 能力版本回 01 受控运行。' : ''}`,
          source: '研究整理 · 02 专题工作稿 EV-03 · K1 · 2026-07-23 定稿 / 2026-07-24 最终复核', x, y,
        });
      } else if (h.kind === 'cork') {
        U.showDrill({
          title: '软木塞 · 隔离密封（蓝图）',
          value: '隔离环境',
          sub: '候选 Skill / Prompt / MCP / 工作流改动只进隔离试验版本，密封于样本管内验证，不触生产；诊断—隔离验证必须成回路。',
          source: '研究整理 · 02 思维台账 · K3 · 2026-07-24', x, y,
        });
      } else if (h.kind === 'glass') {
        U.showDrill({
          title: '玻璃管壁 · 三道检验一道闸门（蓝图）',
          value: 'G1 → G2 → G3 → GATE',
          sub: '管内逐层验证：历史回放、留出案例、专家审查，全部留痕；满足试验记录预先写明的验收条件，才允许向管理层提交改进申请。',
          source: '研究整理 · 02 专题工作稿 · K1 · 2026-07-23 定稿', x, y,
        });
      } else if (h.kind === 'base') {
        U.showDrill({
          title: '金属管架 · 工程底座（蓝图）',
          value: '工程 · 平台团队',
          sub: '隔离环境、版本、历史回放、留出案例、评测、审计、受控发布与回滚能力由工程 / 平台团队提供；具体实现列入 §8 待企业验证清单。',
          source: '研究整理 · 02 专题工作稿 · K1 · 2026-07-23 定稿', x, y,
        });
      }
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
        const r = host.getBoundingClientRect();
        const h = hitAt(e.clientX - r.left, e.clientY - r.top);
        /* 命中画布元素：任何 DOM 目标都允许下钻（1280 断点标签列/管体叠在文字盒上） */
        if (h) { drillFor(h, e.clientX, e.clientY); return; }
        /* 与封面 B 同口径：装配切换只在真空白（画布 / 结构容器）上响应，文字层不触发 */
        const t = e.target;
        if (t !== host && t !== header && t !== coverInner) return;
        if (window.getSelection && String(window.getSelection()).length) return;
        toggle();
      });
      header.addEventListener('mousemove', e => {
        if (!active || REDUCED) return;
        yawMouseT = (e.clientX / window.innerWidth - 0.5) * 0.22;
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
