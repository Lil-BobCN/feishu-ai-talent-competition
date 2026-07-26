/* ═══════════════════════════════════════════════════════════
   cover-exploded.js · 封面 B —— 隔离试验样本管 · 八层试验记录真实材质爆炸图
   宿主：#cover-canvas-x（初始 display:none；setActive 时等 reflow 再 fit，QA.md postmortem #2）
   规范：COVER.md §2 几何引擎 / §4 真实材质爆炸图 / §7 移植清单
   数据：window.RPT.trialLayers（八层 = 试验记录字段：假设/修改对象/基线/案例集/指标/结论/审批/版本关系）
        window.RPT.gates（管体 drill 用）；来源 K1 · 2026-07-23 定稿 / 2026-07-24 复核 · EV-03 行208
   色纪律：封面 B 真实材质豁免（玻璃 / 软木 / 金属管架）；管内液体色阶 = ink + 电蓝族（不彩虹）；
   全图唯一语义红 = 07 审批层（最硬约束：无批准不进生产）。
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
  const NEG = '#c22f4e';                       // 真语义红，仅给 07 审批层
  const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

  /* U.frame 起手三件套：写进 canvas 作无障碍回退文本（canvas 子节点不上屏） */
  U.frame(host, {
    title: '一支隔离试验样本管：改动先在管内证明“改对了”',
    sub: '轴测爆炸图 · 管内八层 = 试验记录字段 · 鼠标平移转向 · 点击空白装配/爆炸 · 点击液层或右侧标签下钻',
    src: '研究整理 · 02 专题工作稿 EV-03 · K1（2026-07-23 定稿 · 2026-07-24 最终复核）',
  });
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', '隔离试验样本管八层爆炸图：八层液体对应试验记录的假设、修改对象、基线、案例集、指标、结论、审批、版本关系八个字段，07 审批层以语义红标注无批准不进生产。');

  /* 数据纪律（§U.5）：trialLayers 缺失则宁可留白，不编造八层 */
  const TL = (window.RPT && Array.isArray(window.RPT.trialLayers) && window.RPT.trialLayers.length === 8)
    ? window.RPT.trialLayers : null;
  const GATES = (window.RPT && Array.isArray(window.RPT.gates)) ? window.RPT.gates : null;

  /* ── 几何常量：竖管沿 z 轴；圆截面在该投影下恰为非倾斜椭圆（rx=R·u，ry=R·u·0.5） ── */
  const R = 6, TH = 1.5, GAP = 0.12, SEP = 2.2;
  const BASE_HX = 9.5, BASE_HY = 7, BASE_TH = 1.6;
  const GLASS_ZB = 1.2, GLASS_ZT = 15.4;
  const STACK_Z0 = 1.9;                        // 装配态最底层液面底
  const LCOL = [BLUE_L, BLUE, BLUE_D, INK_L, BLUE, BLUE_D, NEG, INK_M];  // 逐层液体色（07 审批 = 唯一语义红）
  const LAYERS = TL ? TL.map((f, i) => ({
    i, no: '0' + (i + 1), field: f.field, meaning: f.meaning,
    th: TH, color: LCOL[i],
    z0: STACK_Z0 + (7 - i) * (TH + GAP),       // i=0（假设）在栈顶
  })) : [];
  const CORK = { r: R * 0.86, th: 1.5, z0: GLASS_ZT - 0.35 };
  /* 爆炸位移：顶层升得最高；软木塞再上一档。纵向净空用于 fit() 的 u 上限（矮视口不裁顶） */
  const riseOf = L => (8 - L.i) * SEP;
  const ZTOP = CORK.z0 + 9.4 * SEP + CORK.th + 1.2;
  const WFOOT = (BASE_HX + BASE_HY) * 0.7071 * 2 + 2.5;   // 底座水平投影全宽（世界单位）

  /* ── 几何引擎（COVER.md §2） ── */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bd = U.bindCanvas(host);
  const ctx = bd.ctx;
  let W = 0, H = 0, Hv = 0, u = 6, cam = null, yawCur = Math.PI / 4;

  function fit() {
    const m = bd.fit();
    W = m.w; H = m.h;
    /* 封面内容可超过 100vh：签名条/标签/几何必须锚定可视高度，否则沉到首屏外 */
    Hv = Math.max(320, Math.min(H, window.innerHeight || H));
    const leftBound = 0.585 * W;               // 避开左文列 + chips 行（postmortem #15）
    let right = W - 332, labels = true;        // 右侧 332px 标签列预留
    u = Math.min((right - leftBound) / (WFOOT + 2), Hv * 0.0135, (0.56 * Hv - 30) / ZTOP);
    if (u < 4.6) {                             // 太窄 → 放弃标签列，用满右缘
      labels = false; right = W - 40;
      u = Math.min((right - leftBound) / (WFOOT + 2), Hv * 0.0135, (0.56 * Hv - 30) / ZTOP);
    }
    cam = { leftBound, right, labels, cx: (leftBound + right) / 2, cy: 0.56 * Hv };
  }
  /* 世界点 → 屏点（与 01 同投影；本模块圆截面只用椭圆方程，不逐点 proj） */
  function proj(x, y, z) {
    const c = Math.cos(yawCur), s = Math.sin(yawCur);
    const rx = x * c - y * s, ry = x * s + y * c;
    return { x: cam.cx + rx * u, y: cam.cy + ry * u * 0.5 - z * u, rx, ry };
  }
  const ellY = z => cam.cy - z * u;            // z 高度处管心屏 y
  const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

  /* ── 预渲染材质（COVER.md §4：seeded RNG 可复现） ── */
  let patCork = null, patMetal = null;
  function speckle(base, dark, light, n, seed, horizontal) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), rnd = U.makeRng(seed);
    g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() < 0.5 ? dark : light;
      g.globalAlpha = 0.04 + rnd() * 0.10;
      if (horizontal) g.fillRect(rnd() * 128, rnd() * 128, 3 + rnd() * 9, 0.7 + rnd() * 0.7);   // 拉丝金属横纹
      else g.fillRect(rnd() * 128, rnd() * 128, 0.8 + rnd() * 1.6, 0.8 + rnd() * 1.4);          // 软木斑点
    }
    return ctx.createPattern(c, 'repeat');
  }
  function ensurePatterns() {
    if (!patCork) patCork = speckle('#c9a26e', '#8a6a42', '#e6c898', 340, 20260724, false);
    if (!patMetal) patMetal = speckle('#c3c9d2', '#8e97a3', '#e8ecf1', 300, 20260725, true);
  }

  /* ── 状态 ── */
  let active = false, raf = 0, started = false;
  let kNow = 0, kFrom = 0, kTo = 1, kT0 = 0, t0 = 0;
  let yawMouse = 0, yawMouseT = 0;
  let hits = [];

  /* 爆炸主进度 k（easeOutBack）+ 逐层 stagger + 呼吸浮动（COVER.md §2） */
  function layerZ(L, t) {
    const lay = U.clamp(kNow * 1.9 - L.i * 0.13, 0, 1);   // stagger 且 k=1 时各层起升全部完成（≥0.99）
    const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + L.i * 1.31) * 0.20 * lay;
    return { lay, z: L.z0 + lay * riseOf(L) + breathe };
  }
  function corkZ(t) {
    const lay = U.clamp(kNow * 1.55, 0, 1);    // 软木塞先拔塞：k≈0.65 即完成起升，不停在栈腰
    const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + 8 * 1.31) * 0.20 * lay;
    return { lay, z: CORK.z0 + lay * 9.4 * SEP + breathe };
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
  function sideShade(pts) {                    // 侧体积渐变：顶白 .26 → 底 ink .09（COVER.md §4）
    const b = bboxOf(pts);
    const g = ctx.createLinearGradient(0, b.y0, 0, b.y1);
    g.addColorStop(0, 'rgba(255,255,255,.26)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(5,28,44,.09)');
    fillP(pts, g);
  }
  function glossQuad(pts, a) {                 // 顶面斜向光照
    const b = bboxOf(pts);
    const g = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(5,28,44,.045)');
    fillP(pts, g);
  }
  function softEllipse(cx, cy, rx, ry, alpha) { // plateShadow / 地面影
    if (alpha <= 0.004 || rx < 1) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(5,28,44,${alpha})`);
    g.addColorStop(1, 'rgba(5,28,44,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, U.TAU); ctx.fill();
    ctx.restore();
  }
  function haloText(txt, x, y, fill) {         // 纸色光晕 3.5px（铁律：文字压线）
    ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 3.5;
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = fill; ctx.fillText(txt, x, y);
  }
  function fitText(text, budget) {             // 测量截断：截尾去逗号/介词再加 …（postmortem #9）
    if (ctx.measureText(text).width <= budget) return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + ' …').width > budget) s = s.slice(0, -1);
    s = s.replace(/[\s,，、;；:：.。·\-—(（]+$/u, '');
    return s + ' …';
  }
  /* 圆柱侧带路径：底前半弧（0→π）→ 左上 → 顶前半弧反向（π→0）→ 闭合 */
  function tubeSidePath(rx, ry, yb, yt) {
    ctx.beginPath();
    ctx.ellipse(cam.cx, yb, rx, ry, 0, 0, Math.PI, false);
    ctx.lineTo(cam.cx - rx, yt);
    ctx.ellipse(cam.cx, yt, rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
  }

  /* ── 液体层：侧壁渐变 + 液面椭圆 + 半月线 + 右侧刻度身份线 ── */
  function drawLiquidLayer(L, z, t) {
    const rx = (R - 0.55) * u, ry = (R - 0.55) * u * 0.5;
    const zb = z, zt = z + L.th;
    const yb = ellY(zb), yt = ellY(zt);
    // 侧壁：液体色纵向渐变（顶略透，底更实）+ 两侧 ink 收边
    tubeSidePath(rx, ry, yb, yt);
    const g = ctx.createLinearGradient(0, yt, 0, yb);
    g.addColorStop(0, hexA(L.color, 0.66));
    g.addColorStop(1, hexA(L.color, 0.88));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(5,28,44,.16)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(cam.cx - rx, yt); ctx.lineTo(cam.cx - rx, yb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cam.cx + rx, yt); ctx.lineTo(cam.cx + rx, yb); ctx.stroke();
    // 底面前半弧（与下一层分界）
    ctx.strokeStyle = hexA(L.color, 0.55); ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(cam.cx, yb, rx, ry, 0, 0, Math.PI, false); ctx.stroke();
    // 液面：满椭圆 + 斜向光泽 + 半月线（液层身份细节）
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU);
    ctx.fillStyle = hexA(L.color, 0.82); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.clip();
    const gg = ctx.createLinearGradient(cam.cx - rx, yt - ry, cam.cx + rx, yt + ry);
    gg.addColorStop(0, 'rgba(255,255,255,.34)'); gg.addColorStop(0.55, 'rgba(255,255,255,0)');
    gg.addColorStop(1, 'rgba(5,28,44,.08)');
    ctx.fillStyle = gg; ctx.fillRect(cam.cx - rx, yt - ry, 2 * rx, 2 * ry);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92, false); ctx.stroke();
    ctx.strokeStyle = hexA(L.color, 0.9); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.stroke();
    // 右侧刻度身份线：伸出管壁的短横 + 字段序号（等价 01 分页签）
    // 碰撞纪律：层距 <14px 隔档画号，<9px 不画（装配态小 u 不堆字）
    const tx0 = cam.cx + R * u + 1.5, tx1 = tx0 + 8;
    ctx.strokeStyle = hexA(L.color, 0.9); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(tx0, yt); ctx.lineTo(tx1, yt); ctx.stroke();
    const pitch = (TH + GAP) * u;
    const showNo = pitch >= 14 || (pitch >= 9 && L.i % 2 === 0);
    if (!window.__COVER_NOTEXT && showNo) {
      ctx.font = `700 7.5px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      haloText(L.no, tx1 + 2.5, yt, L.color);
      ctx.textBaseline = 'alphabetic';
    }
    hits.push({ i: L.i, kind: 'layer', x0: cam.cx - rx, x1: cam.cx + rx, y0: yt - ry, y1: yb + ry,
                ell: { cx: cam.cx, cy: yt, rx, ry } });
  }

  /* ── 玻璃管：后壁淡色 → （液层之间）→ 前壁透叠 + 高光扫带 + 刻度 + 管口 ── */
  function drawGlassBack() {
    const rx = R * u, ry = R * u * 0.5;
    const yb = ellY(GLASS_ZB), yt = ellY(GLASS_ZT);
    tubeSidePath(rx, ry, yb, yt);
    const g = ctx.createLinearGradient(0, yt, 0, yb);
    g.addColorStop(0, 'rgba(125,155,255,.05)');
    g.addColorStop(1, 'rgba(5,28,44,.045)');
    ctx.fillStyle = g; ctx.fill();
  }
  function drawGlassFront(t) {
    const rx = R * u, ry = R * u * 0.5;
    const yb = ellY(GLASS_ZB), yt = ellY(GLASS_ZT);
    // 前壁透叠白纱（玻璃感）+ 两侧竖边
    tubeSidePath(rx, ry, yb, yt);
    const g = ctx.createLinearGradient(0, yt, 0, yb);
    g.addColorStop(0, 'rgba(255,255,255,.20)');
    g.addColorStop(0.5, 'rgba(255,255,255,.07)');
    g.addColorStop(1, 'rgba(255,255,255,.13)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(5,28,44,.30)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cam.cx - rx, yt); ctx.lineTo(cam.cx - rx, yb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cam.cx + rx, yt); ctx.lineTo(cam.cx + rx, yb); ctx.stroke();
    // 固定高光条（左偏）+ 移动高光扫带（clip 在玻璃侧带内）
    ctx.save();
    tubeSidePath(rx, ry, yb, yt); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.fillRect(cam.cx - rx * 0.62, yt, rx * 0.16, yb - yt);
    if (!REDUCED) {
      const span = 2 * rx + 140;
      const bx = cam.cx - rx - 70 + ((t * 34) % span);
      const hg = ctx.createLinearGradient(bx - 26, 0, bx + 26, 0);
      hg.addColorStop(0, 'rgba(255,255,255,0)');
      hg.addColorStop(0.5, 'rgba(255,255,255,.20)');
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hg; ctx.fillRect(bx - 26, yt, 52, yb - yt);
    }
    // 玻璃刻度（试验管身份细节）：左侧短横 + 隔档序号
    ctx.strokeStyle = 'rgba(5,28,44,.30)'; ctx.lineWidth = 0.8;
    for (let gz = 3; gz <= 14; gz += 1.375) {
      const yy = ellY(gz);
      ctx.beginPath(); ctx.moveTo(cam.cx - rx + 1, yy); ctx.lineTo(cam.cx - rx + 6, yy); ctx.stroke();
    }
    ctx.restore();
    // 管口：满椭圆口沿（玻璃壁厚感：内外两圈）+ 底圈
    ctx.strokeStyle = 'rgba(5,28,44,.42)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(5,28,44,.18)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx - 2.2, ry - 2.2 * 0.5, 0, 0, U.TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cam.cx, yb, rx, ry, 0, 0, Math.PI, false); ctx.stroke();
    hits.push({ i: -1, kind: 'glass', x0: cam.cx - rx, x1: cam.cx + rx, y0: yt - ry, y1: yb + ry });
  }

  /* ── 软木塞：斑点纹理侧壁 + 顶面 ── */
  function drawCork(z) {
    const rx = CORK.r * u, ry = CORK.r * u * 0.5;
    const yb = ellY(z), yt = ellY(z + CORK.th);
    tubeSidePath(rx, ry, yb, yt);
    ctx.fillStyle = patCork; ctx.fill();
    tubeSidePath(rx, ry, yb, yt);
    const g = ctx.createLinearGradient(0, yt, 0, yb);
    g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(5,28,44,.14)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(5,28,44,.22)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cam.cx - rx, yt); ctx.lineTo(cam.cx - rx, yb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cam.cx + rx, yt); ctx.lineTo(cam.cx + rx, yb); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU);
    ctx.fillStyle = patCork; ctx.fill();
    glossQuad([{ x: cam.cx - rx, y: yt - ry }, { x: cam.cx + rx, y: yt - ry },
               { x: cam.cx + rx, y: yt + ry }, { x: cam.cx - rx, y: yt + ry }], 0.30);
    ctx.strokeStyle = 'rgba(5,28,44,.30)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cam.cx, yt, rx, ry, 0, 0, U.TAU); ctx.stroke();
    hits.push({ i: -2, kind: 'cork', x0: cam.cx - rx, x1: cam.cx + rx, y0: yt - ry, y1: yb + ry,
                ell: { cx: cam.cx, cy: yt, rx, ry } });
  }

  /* ── 金属管架底座：拉丝座身 + 顶面抱箍圈 ── */
  function drawBase() {
    const hx = BASE_HX, hy = BASE_HY, zb = 0, zt = BASE_TH;
    const t1 = proj(-hx, -hy, zt), t2 = proj(hx, -hy, zt), t3 = proj(hx, hy, zt), t4 = proj(-hx, hy, zt);
    const b2 = proj(hx, -hy, zb), b3 = proj(hx, hy, zb), b4 = proj(-hx, hy, zb);
    fillP([b2, b3, t3, t2], patMetal); sideShade([b2, b3, t3, t2]);
    fillP([b3, b4, t4, t3], patMetal); sideShade([b3, b4, t4, t3]);
    const top = [t1, t2, t3, t4];
    fillP(top, patMetal); glossQuad(top, 0.30);
    strokeP(top, 'rgba(5,28,44,.28)', 1);
    // 顶面抱箍：管位双圈 + 四颗铆钉（ball metal：径向渐变 + 高光点）
    const cy6 = ellY(zt);
    ctx.strokeStyle = 'rgba(5,28,44,.40)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(cam.cx, cy6, (R + 0.9) * u, (R + 0.9) * u * 0.5, 0, 0, U.TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(5,28,44,.18)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(cam.cx, cy6, (R + 1.7) * u, (R + 1.7) * u * 0.5, 0, 0, U.TAU); ctx.stroke();
    [[-hx + 2.4, -hy + 2.4], [hx - 2.4, -hy + 2.4], [hx - 2.4, hy - 2.4], [-hx + 2.4, hy - 2.4]].forEach(([bx, by]) => {
      const p = proj(bx, by, zt);
      const rr = 0.62 * u;
      const rg = ctx.createRadialGradient(p.x - rr * 0.3, p.y - rr * 0.3, rr * 0.1, p.x, p.y, rr);
      rg.addColorStop(0, '#e8ecf1'); rg.addColorStop(0.7, '#8e97a3'); rg.addColorStop(1, '#5c6672');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, U.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(p.x - rr * 0.3, p.y - rr * 0.35, rr * 0.18, 0, U.TAU); ctx.fill();
    });
    hits.push({ i: -3, kind: 'base', x0: Math.min(t1.x, t4.x), x1: Math.max(t2.x, t3.x),
                y0: Math.min(t1.y, t2.y, cy6 - (R + 1.7) * u * 0.5), y1: Math.max(b3.y, b4.y) });
  }

  /* ── 标签列：锚点取液面右缘 → 引线入 312px 列；行距 <34px 向下推挤 ── */
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
    const budget = Math.min(286, W - 20 - textX);          // 列宽 312 − 26
    ctx.globalAlpha = la;
    /* 标签列根部小图例：07 审批是唯一语义红，必须给读法 */
    ctx.font = `8.5px ${MONO}`;
    ctx.fillStyle = NEG;
    ctx.fillRect(textX, TOP - 30, 7, 7);
    haloText('红 = 审批 · 最硬约束（无批准不进生产）', textX + 12, TOP - 23, INK_M);
    rows.forEach(r => {
      const L = r.L, yy = r.ry;
      ctx.strokeStyle = hexA(L.color, 0.8); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(r.ax, r.ay); ctx.lineTo(labX, yy - 3.5); ctx.lineTo(labX + 8, yy - 3.5); ctx.stroke();
      ctx.fillStyle = hexA(L.color, 0.9);
      ctx.beginPath(); ctx.arc(r.ax, r.ay, 2, 0, U.TAU); ctx.fill();
      ctx.font = `700 10px ${MONO}`;
      haloText(fitText(`${L.no} · ${L.field}`, budget), textX, yy, L.color);
      ctx.font = `11px ${SERIF}`;
      haloText(fitText(L.meaning, budget), textX, yy + 13.5, INK_M);
      hits.push({ i: L.i, kind: 'layer', x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
    });
    ctx.globalAlpha = 1;
  }

  function drawCaption() {                     // 右下签名条：随状态改写（postmortem #21）
    const exploded = kTo === 1;
    ctx.textAlign = 'right'; ctx.font = `9px ${MONO}`;
    haloText(exploded ? '八层 · 试验记录字段 · 隔离试验样本管 — CLICK TO ASSEMBLE'
                      : '已装配 · 一支隔离试验样本管 — CLICK TO EXPLODE', W - 22, Hv - 40, INK_L);
    haloText('SOURCE · 研究整理 K1 · 2026-07-23 定稿 · EV-03 试验记录字段', W - 22, Hv - 26, INK_L);
    /* labels=false 断点（如 1280）标签列消失，必须给提示与红色图例 */
    if (cam && !cam.labels) {
      haloText('窄屏模式 · 点击液层查看字段 · 红 = 审批 · 最硬约束', W - 22, Hv - 54, INK_M);
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
      haloText('TRIAL DATA MISSING · window.RPT.trialLayers 未加载（数据纪律：宁可缺失不编造）', cam.cx - 150, cam.cy, INK_L);
      return;
    }
    softEllipse(cam.cx, ellY(0) + 1.2 * u, 15 * u, 6 * u, 0.14);   // 地面椭圆影
    drawBase();
    drawGlassBack();
    for (let i = 7; i >= 0; i--) {             // 自下而上画液层（装配态相邻无缝）
      const L = LAYERS[i], zz = layerZ(L, t);
      if (zz.lay > 0.02) {                     // 层间 plateShadow：alpha=clamp(.20−sep·.007)，悬浮感
        softEllipse(cam.cx, ellY(L.z0), (R - 0.4) * u, (R - 0.4) * u * 0.5,
                    U.clamp(0.16 - (zz.z - L.z0) * u * 0.007, 0, 0.16));
      }
      drawLiquidLayer(L, zz.z, t);
    }
    const cz = corkZ(t);
    drawCork(cz.z);
    drawGlassFront(t);
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
  function hitAt(x, y) {
    for (let k = hits.length - 1; k >= 0; k--) {
      const h = hits[k];
      if (h.ell) {                             // 椭圆顶面优先，再侧带 bbox
        const dx = (x - h.ell.cx) / h.ell.rx, dy = (y - h.ell.cy) / h.ell.ry;
        if (dx * dx + dy * dy <= 1) return h;
        if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h;
      } else if (h.x0 != null) {
        if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h;
      } else if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
    }
    return null;
  }
  const SRC_LINE = '研究整理 · 02 专题工作稿 EV-03 · K1 · 2026-07-23 定稿 / 2026-07-24 最终复核';
  function drillFor(h, x, y) {
    if (h.kind === 'layer') {
      const L = LAYERS[h.i];
      U.showDrill({
        title: `试验记录字段 ${L.no} · ${L.field}`,
        value: L.no === '07' ? '无批准不进生产' : `${L.no} / 08 · 试验记录字段`,
        sub: `${L.meaning}。母稿 EV-03（行208）：试验记录至少含假设、修改对象、基线、案例集、指标、结论、审批和版本关系。${L.no === '07' ? '审批是全链路最硬约束：批准才形成候选 Agent 能力版本回 01 受控运行。' : ''}`,
        source: SRC_LINE, x, y,
      });
    } else if (h.kind === 'cork') {
      U.showDrill({
        title: '软木塞 · 隔离密封',
        value: '隔离环境',
        sub: '候选 Skill / Prompt / MCP / 工作流改动只进隔离试验版本，密封于样本管内验证，不触生产；诊断—隔离验证必须成回路。',
        source: '研究整理 · 02 思维台账 · K3 · 2026-07-24', x, y,
      });
    } else if (h.kind === 'glass') {
      const gn = GATES ? GATES.map(g => g.no).join(' → ') : 'G1 → G2 → G3 → GATE';
      U.showDrill({
        title: '玻璃管壁 · 三道检验一道闸门',
        value: gn,
        sub: '管内逐层验证：历史回放、留出案例、专家审查，全部留痕；满足试验记录预先写明的验收条件，才允许向管理层提交改进申请。',
        source: '研究整理 · 02 专题工作稿 · K1 · 2026-07-23 定稿', x, y,
      });
    } else if (h.kind === 'base') {
      U.showDrill({
        title: '金属管架 · 工程底座',
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
      /* 命中画布元素（液层/标签/管体/底座/软木塞）：任何 DOM 目标都允许下钻——
         1280 断点下标签列与管体会叠在 .cover-inner 文字盒上，不穿透则 drill 不可用 */
      if (h) { drillFor(h, e.clientX, e.clientY); return; }
      /* 装配切换仍只在真空白（画布本体 / 结构容器）上响应；按钮、链接、chips、文字层不触发 */
      const t = e.target;
      if (t !== host && t !== header && t !== coverInner) return;
      if (window.getSelection && String(window.getSelection()).length) return;  // 划词不触发
      toggle();
    });
    header.addEventListener('mousemove', e => {
      if (!active || REDUCED) return;
      yawMouseT = (e.clientX / window.innerWidth - 0.5) * 0.22;                 // 鼠标偏移 ±0.11
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
