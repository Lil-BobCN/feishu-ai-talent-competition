/* ═══════════════════════════════════════════════════════════
   cover-exploded.js · 封面 B —— 案件档案夹 · 七层真实材质爆炸图
   宿主：#cover-canvas-x（初始 display:none；setActive 时重新 fit，QA.md postmortem #2）
   规范：COVER.md §2 几何引擎 / §4 真实材质爆炸图 / §7 移植清单
   数据：window.RPT.archives（七层 = 七类档案）；来源 K10 · 2026-07-23 · 方案模拟
   色纪律：封面 B 真实材质豁免（牛皮纸夹身 / 卷宗白纸 / 电蓝分页签）；
   全图唯一语义红 = 04 调查证据档案标注（最硬约束：一份证据只存一次）。
   window.__COVER_NOTEXT = true 时不画任何文字（QA 识别测试钩子，非业务功能）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas-x');
  if (!host) return;
  const U = window.U;
  if (!U) return;

  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_L = '#7d9bff';
  const NEG = '#c22f4e';                       // 真语义红，仅给 04
  const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

  /* U.frame 起手三件套：写进 canvas 作无障碍回退文本（canvas 子节点不上屏） */
  U.frame(host, {
    title: '七类档案，只装一份权威案件记录',
    sub: '轴测爆炸图 · 七层 = 七类档案 · 鼠标平移转向 · 点击空白装配/爆炸 · 点击图层或右侧标签下钻 · 24.9 元案例为方案模拟',
    src: '研究整理 · K10 评委稿（重写版）2026-07-23 · 方案模拟',
  });
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', '案件档案夹七层爆炸图：七层对应七类业务档案，04 调查证据档案以语义红标注一份证据只存一次。');

  /* 数据纪律（§U.5）：archives 缺失则宁可留白，不编造七层 */
  const ARCH = (window.RPT && Array.isArray(window.RPT.archives) && window.RPT.archives.length === 7)
    ? window.RPT.archives : null;

  /* ── 层定义：01–06 白色卷宗纸层 + 07 牛皮纸夹身托盘；蓝色分页签是每层身份细节 ── */
  const HX = 18, HY = 12.5, GAP = 0.14, SEP = 3.4;
  const LCOL = [BLUE_D, BLUE, BLUE_D, NEG, BLUE_D, BLUE, INK_M];  // 逐层标签色（04 = 唯一语义红）
  const LAYERS = ARCH ? ARCH.map((a, i) => ({
    i, no: a.no, name: a.name, holds: a.holds, thesis: a.thesis,
    kraft: i === 6, th: i === 6 ? 1.5 : 1.15,
    hx: i === 6 ? 19 : HX, hy: i === 6 ? 13.4 : HY,
    tabY: -8.4 + i * 2.8, color: LCOL[i], z0: 0,
  })) : [];
  let zacc = 0;
  for (let i = 6; i >= 0; i--) { if (LAYERS[i]) { LAYERS[i].z0 = zacc; zacc += LAYERS[i].th + GAP; } }
  /* 纵向容量：爆炸到顶所需净空 = 顶层 z + 平面投影半径；用于 fit() 的 u 上限，矮视口不裁顶 */
  const ZTOP = LAYERS.length ? LAYERS[0].z0 + LAYERS[0].th + 6 * SEP : 30;
  const PTOP = (HX + HY) * 0.7071 * 0.5 + 0.6;

  /* ── 几何引擎（COVER.md §2） ── */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bd = U.bindCanvas(host);
  const ctx = bd.ctx;
  let W = 0, H = 0, Hv = 0, u = 6, cam = null, yawCur = Math.PI / 4;

  function fit() {
    const m = bd.fit();
    W = m.w; H = m.h;
    /* 封面内容可超过 100vh（实测 header 989 > 视口 950）：签名条/标签/几何必须锚定可视高度，否则沉到首屏外 */
    Hv = Math.max(320, Math.min(H, window.innerHeight || H));
    const leftBound = 0.585 * W;                       // 避开左文列 + chips 行（postmortem #15）
    let right = W - 332, labels = true;                // 右侧 332px 标签列预留
    u = Math.min((right - leftBound) / 44, Hv * 0.0132, (0.56 * Hv - 28) / (ZTOP + PTOP));
    if (u < 5.6) {                                     // 太窄 → 放弃标签列，用满右缘
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

  /* ── 预渲染材质（COVER.md §4：seeded RNG 可复现） ── */
  let patKraft = null, patPaper = null;
  function speckle(base, dark, light, n, seed) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), rnd = U.makeRng(seed);
    g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() < 0.5 ? dark : light;
      g.globalAlpha = 0.04 + rnd() * 0.10;
      g.fillRect(rnd() * 128, rnd() * 128, 0.8 + rnd() * 1.6, 0.8 + rnd() * 1.4);
    }
    return ctx.createPattern(c, 'repeat');
  }
  function ensurePatterns() {
    if (!patKraft) patKraft = speckle('#c9a26e', '#8a6a42', '#e6c898', 340, 20260724);
    if (!patPaper) patPaper = speckle('#f4efe3', '#d9d0bc', '#ffffff', 150, 20260725);
  }

  /* ── 状态 ── */
  let active = false, raf = 0, started = false;
  let kNow = 0, kFrom = 0, kTo = 1, kT0 = 0, t0 = 0;
  let yawMouse = 0, yawMouseT = 0;
  let hits = [];

  /* 爆炸主进度 k（easeOutBack）+ 逐层 stagger + 呼吸浮动（COVER.md §2） */
  function layerZ(L, t) {
    const lay = U.clamp(kNow * 1.55 - L.i * 0.17, 0, 1);
    const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + L.i * 1.31) * 0.20 * lay;
    return { lay, z: L.z0 + lay * (6 - L.i) * SEP + breathe };
  }

  /* ── 基础绘图件 ── */
  function pathOf(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
  }
  function fillP(pts, style) { pathOf(pts); ctx.fillStyle = style; ctx.fill(); }
  function strokeP(pts, style, lw) { pathOf(pts); ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke(); }
  function bboxOf(pts) {
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
  }
  function sideShade(pts) {                                // 侧体积渐变：顶白 .26 → 底 ink .09（COVER.md §4）
    const b = bboxOf(pts);
    const g = ctx.createLinearGradient(0, b.y0, 0, b.y1);
    g.addColorStop(0, 'rgba(255,255,255,.26)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(5,28,44,.09)');
    fillP(pts, g);
  }
  function glossQuad(pts, a) {                             // 顶面斜向光照
    const b = bboxOf(pts);
    const g = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(5,28,44,.045)');
    fillP(pts, g);
  }
  function bevel(pts) {                                    // 顶缘亮边
    strokeP(pts, 'rgba(255,255,255,.8)', 1.4);
    strokeP(pts, 'rgba(5,28,44,.10)', 0.6);
  }
  function sheen(pts, i, t) {                              // 移动高光盘（纸面微光泽）
    if (REDUCED) return;
    const b = bboxOf(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, w = b.x1 - b.x0, h = b.y1 - b.y0;
    const bx = ((t * 46 + i * 120) % (w + 160)) - 80 - w / 2;
    ctx.save(); pathOf(pts); ctx.clip();
    ctx.translate(cx, cy); ctx.rotate(-0.5);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fillRect(bx, -h, 30, 2 * h);
    ctx.restore();
  }
  function softEllipse(cx, cy, rx, ry, alpha) {            // plateShadow / 地面影
    if (alpha <= 0.004 || rx < 1) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(5,28,44,${alpha})`);
    g.addColorStop(1, 'rgba(5,28,44,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, U.TAU); ctx.fill();
    ctx.restore();
  }
  function haloText(txt, x, y, fill) {                     // 纸色光晕 3.5px（铁律：文字压线）
    ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 3.5;
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = fill; ctx.fillText(txt, x, y);
  }
  function fitText(text, budget) {                         // 测量截断：截尾去逗号/介词再加 …（postmortem #9）
    if (ctx.measureText(text).width <= budget) return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + ' …').width > budget) s = s.slice(0, -1);
    s = s.replace(/[\s,，、;；:：.。·\-—(（]+$/u, '');
    return s + ' …';
  }

  /* ── 纸层（01–06）：白色卷宗 + 页边 striations + 蓝色分页签 ── */
  function docLines(zt, hx) {
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(5,28,44,.06)';
    [-7.5, -3.5, 0.5, 4.5].forEach(yv => {
      const p1 = proj(-hx + 3.2, yv, zt), p2 = proj(hx - 3.2, yv, zt);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    });
    const q1 = proj(-hx + 3.2, 8.3, zt), q2 = proj(-hx + 10, 8.3, zt);
    ctx.strokeStyle = 'rgba(5,28,44,.09)';
    ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
  }
  function drawTab(L, zb, zt) {
    const hx = L.hx, y0 = L.tabY, y1 = y0 + 3.2, x1 = hx + 2.6;
    const zt2 = zt + 0.38, zb2 = zb - 0.02;                // 分页签高出层顶 = 身份细节
    fillP([proj(hx, y1, zb2), proj(x1, y1, zb2), proj(x1, y1, zt2), proj(hx, y1, zt2)], BLUE_D);
    fillP([proj(hx, y0, zt2), proj(x1, y0, zt2), proj(x1, y1, zt2), proj(hx, y1, zt2)], BLUE_L);
    const f = [proj(x1, y0, zb2), proj(x1, y1, zb2), proj(x1, y1, zt2), proj(x1, y0, zt2)];
    fillP(f, BLUE);
    if (!window.__COVER_NOTEXT) {
      const c = proj(x1, (y0 + y1) / 2, (zb2 + zt2) / 2);
      ctx.font = `700 8px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff'; ctx.fillText(L.no, c.x, c.y + 0.3);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    hits.push({ i: L.i, poly: f });
  }
  function drawPaperLayer(L, z, t) {
    const hx = L.hx, hy = L.hy, zb = z, zt = z + L.th;
    const t1 = proj(-hx, -hy, zt), t2 = proj(hx, -hy, zt), t3 = proj(hx, hy, zt), t4 = proj(-hx, hy, zt);
    const b2 = proj(hx, -hy, zb), b3 = proj(hx, hy, zb), b4 = proj(-hx, hy, zb);
    // 侧面（painter：两侧再顶面）+ 页边线（纸层身份细节）
    fillP([b2, b3, t3, t2], patPaper); sideShade([b2, b3, t3, t2]);
    fillP([b3, b4, t4, t3], patPaper); sideShade([b3, b4, t4, t3]);
    ctx.strokeStyle = 'rgba(5,28,44,.10)'; ctx.lineWidth = 0.6;
    for (let f = 1; f <= 5; f++) {
      const zf = zb + L.th * f / 6;
      let p1 = proj(hx, -hy, zf), p2 = proj(hx, hy, zf);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      p1 = proj(hx, hy, zf); p2 = proj(-hx, hy, zf);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    // 顶面：白纸 + 文档行 + gloss + bevel + sheen
    const top = [t1, t2, t3, t4];
    fillP(top, '#fdfcf7');
    docLines(zt, hx);
    glossQuad(top, 0.30);
    bevel(top);
    sheen(top, L.i, t);
    drawTab(L, zb, zt);
    hits.push({ i: L.i, poly: top });
  }

  /* ── 牛皮纸夹身托盘（07 = 归档档案层）：底座 + 四壁 + 绕绳扣 ── */
  function drawTrayBase(L) {
    const hx = L.hx, hy = L.hy, zm = 1.0, zt = 1.9, wth = 0.55;
    const b2 = proj(hx, -hy, 0), b3 = proj(hx, hy, 0), b4 = proj(-hx, hy, 0);
    const m1 = proj(-hx, -hy, zm), m2 = proj(hx, -hy, zm), m3 = proj(hx, hy, zm), m4 = proj(-hx, hy, zm);
    // 远壁 y=-hy（内壁可见）+ 壁顶
    const nA = proj(-hx, -hy + wth, zm), nB = proj(hx, -hy + wth, zm), nC = proj(hx, -hy + wth, zt), nD = proj(-hx, -hy + wth, zt);
    fillP([nA, nB, nC, nD], '#c69d66'); sideShade([nA, nB, nC, nD]);
    // 远壁 x=-hx
    const wA = proj(-hx + wth, -hy + wth, zm), wB = proj(-hx + wth, hy, zm), wC = proj(-hx + wth, hy, zt), wD = proj(-hx + wth, -hy + wth, zt);
    fillP([wA, wB, wC, wD], '#bb9357'); sideShade([wA, wB, wC, wD]);
    // 底座近侧面 + 底板
    fillP([b2, b3, m3, m2], '#b98f5c'); sideShade([b2, b3, m3, m2]);
    fillP([b3, b4, m4, m3], '#a87f4f'); sideShade([b3, b4, m4, m3]);
    fillP([m1, m2, m3, m4], patKraft); glossQuad([m1, m2, m3, m4], 0.16);
    // 两远壁壁顶
    fillP([proj(-hx, -hy, zt), proj(hx, -hy, zt), nC, nD], '#d4af7d');
    fillP([proj(-hx, -hy, zt), nD, wD, proj(-hx, hy, zt)], '#cfa872');
    // 底座外轮廓细线（纸器读感）
    strokeP([m1, m2, m3, m4], 'rgba(5,28,44,.10)', 0.6);
    drawTab(L, 0, 1.5);
    hits.push({ i: L.i, poly: [m1, m2, m3, m4] });
  }
  function drawTrayRimNear(L) {                            // 近壁最后画：正确遮挡层内纸层
    const hx = L.hx, hy = L.hy, zm = 1.0, zt = 1.9, wth = 0.55;
    const e1 = proj(hx, -hy, zm), e2 = proj(hx, hy, zm), e3 = proj(hx, hy, zt), e4 = proj(hx, -hy, zt);
    fillP([e1, e2, e3, e4], '#b98f5c'); sideShade([e1, e2, e3, e4]);
    fillP([e4, e3, proj(hx - wth, hy, zt), proj(hx - wth, -hy, zt)], '#d4af7d');
    const s1 = proj(hx, hy, zm), s2 = proj(-hx, hy, zm), s3 = proj(-hx, hy, zt), s4 = proj(hx, hy, zt);
    fillP([s1, s2, s3, s4], '#a87f4f'); sideShade([s1, s2, s3, s4]);
    fillP([s4, s3, proj(-hx, hy - wth, zt), proj(hx, hy - wth, zt)], '#c9a06a');
    // 档案袋绕绳扣（行业身份细节，竖直 upright 绘制）
    const pA = proj(-5.5, hy + 0.03, 1.45), pB = proj(5.5, hy + 0.03, 1.45);
    ctx.strokeStyle = '#6e5433'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(pA.x, pA.y);
    ctx.quadraticCurveTo((pA.x + pB.x) / 2, Math.max(pA.y, pB.y) + 7, pB.x, pB.y); ctx.stroke();
    [pA, pB].forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.4, 0, U.TAU);
      ctx.fillStyle = '#8f6f45'; ctx.fill(); ctx.stroke();
    });
  }

  /* ── 标签列：候选锚点取投影最右 x → 引线入 312px 列；行距 <34px 向下推挤 ── */
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
    const budget = Math.min(286, W - 20 - textX);          // 列宽 312 − 26
    ctx.globalAlpha = la;
    /* 评审修复 8：标签列根部小图例——04 是唯一语义红，必须给读法 */
    ctx.font = `8.5px ${MONO}`;
    ctx.fillStyle = NEG;
    ctx.fillRect(textX, TOP - 30, 7, 7);
    haloText('红 = 最硬约束', textX + 12, TOP - 23, INK_M);
    rows.forEach(r => {
      const L = r.L, yy = r.ry;
      ctx.strokeStyle = hexA(L.color, 0.8); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(r.ax, r.ay); ctx.lineTo(labX, yy - 3.5); ctx.lineTo(labX + 8, yy - 3.5); ctx.stroke();
      ctx.fillStyle = hexA(L.color, 0.9);
      ctx.beginPath(); ctx.arc(r.ax, r.ay, 2, 0, U.TAU); ctx.fill();
      ctx.font = `700 10px ${MONO}`;
      haloText(fitText(`${L.no} · ${L.name}`, budget), textX, yy, L.color);
      ctx.font = `11px ${SERIF}`;
      haloText(fitText(L.thesis, budget), textX, yy + 13.5, INK_M);
      hits.push({ i: L.i, x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
    });
    ctx.globalAlpha = 1;
  }

  function drawCaption() {                                 // 右下签名条：随状态改写（postmortem #21）
    const exploded = kTo === 1;
    ctx.textAlign = 'right'; ctx.font = `9px ${MONO}`;
    haloText(exploded ? '七层 · 七类档案 · 方案模拟 — CLICK TO ASSEMBLE'
                      : '已装配 · 一份权威案件记录 · 方案模拟 — CLICK TO EXPLODE', W - 22, Hv - 40, INK_L);
    haloText('SOURCE · 研究整理 K10 · 2026-07-23 重写 · 24.9 元案例为方案模拟', W - 22, Hv - 26, INK_L);
    /* 评审修复 10：labels=false 断点（如 1280）标签列消失，必须给提示与红色图例 */
    if (cam && !cam.labels) {
      haloText('窄屏模式 · 点击立方体查看档案类 · 红 = 最硬约束', W - 22, Hv - 54, INK_M);
    }
    ctx.textAlign = 'left';
  }

  /* ── 主绘制 ── */
  function draw(t) {
    if (W < 2 || H < 2 || !cam) return;
    ctx.clearRect(0, 0, W, H);
    hits = [];
    yawCur = Math.PI / 4 + (REDUCED ? 0 : 0.3 * Math.sin(t * 0.11)) + yawMouse;   // 转盘 yaw（COVER.md §2）
    ensurePatterns();
    if (!LAYERS.length) {
      ctx.font = `10px ${MONO}`;
      haloText('ARCHIVE DATA MISSING · window.RPT.archives 未加载（数据纪律：宁可缺失不编造）', cam.cx - 150, cam.cy, INK_L);
      return;
    }
    const g0 = proj(0, 0, 0);                              // 地面椭圆影
    softEllipse(g0.x, g0.y + 1.2 * u, 24 * u, 9.2 * u, 0.14);
    drawTrayBase(LAYERS[6]);
    for (let i = 5; i >= 0; i--) {
      const L = LAYERS[i], zz = layerZ(L, t);
      if (zz.lay > 0.02) {                                 // 层间 plateShadow：alpha=clamp(.20−sep·.007)
        const rest = proj(0, 0, L.z0);
        softEllipse(rest.x, rest.y, 20.5 * u, 7.6 * u, U.clamp(0.20 - (zz.z - L.z0) * u * 0.007, 0, 0.20));
      }
      drawPaperLayer(L, zz.z, t);
    }
    drawTrayRimNear(LAYERS[6]);
    const la = U.clamp((kNow - 0.45) * 2.4, 0, 1);         // 标签随爆炸淡入
    if (cam.labels && la > 0 && !window.__COVER_NOTEXT) drawLabels(la, t);
    const wg = ctx.createLinearGradient(0, 0, 0.62 * W, 0); // 左文列白纱洗（COVER.md §2）
    wg.addColorStop(0, 'rgba(255,255,255,.95)');
    wg.addColorStop(0.55, 'rgba(255,255,255,.55)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, 0.62 * W, H);
    if (!window.__COVER_NOTEXT) drawCaption();
  }

  /* ── 交互：命中检测 / 下钻 / 装配切换 ── */
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
      title: `档案 ${a.no} · ${a.name}`,
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
      /* 评审修复 1：只在真空白（画布本体 / 结构容器）上响应；
         按钮、链接、chips、.cover-mode、文字层（p/h1/span…）一律不触发装配切换 */
      const t = e.target;
      if (t !== host && t !== header && t !== coverInner) return;
      const r = host.getBoundingClientRect();
      const h = hitAt(e.clientX - r.left, e.clientY - r.top);
      if (h) { drillFor(h.i, e.clientX, e.clientY); return; }
      if (window.getSelection && String(window.getSelection()).length) return;  // 划词不触发
      toggle();
    });
    header.addEventListener('mousemove', e => {
      if (!active || REDUCED) return;
      yawMouseT = (e.clientX / window.innerWidth - 0.5) * 0.22;                   // 鼠标偏移 ±0.11
      const t = e.target;
      if (t !== host && t !== header && t !== coverInner) { host.style.cursor = ''; return; }
      const r = host.getBoundingClientRect();
      host.style.cursor = hitAt(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : '';
    });
  }

  /* ── 激活 / 休眠：display:none 激活时等 reflow 再 fit（postmortem #2，COVER.md 最常见坑） ── */
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
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fit();
        if (REDUCED) { kNow = kTo; drawStatic(); return; }  // reduced-motion：静态完成帧
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
  window.COVER_X = { setActive };
  window.addEventListener('resize', () => { if (active) { fit(); if (REDUCED) drawStatic(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active && REDUCED) drawStatic(); });
})();
