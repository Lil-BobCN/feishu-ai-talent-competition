/* ═══════════════════════════════════════════════════════════
   cover-exploded.js · 封面 B「蓝图展开」—— 扩域蓝图卷轴 · 六层轴测爆炸
   宿主：#cover-canvas-x（初始 display:none；激活时等 reflow 再 fit，QA.md #2）
   几何纪律（同 01/02 B）：yaw 转盘、leftBound=0.585W（postmortem #15）、
   k 主进度 easeOutBack、右侧标签列 312px、行距 34px 向下推挤、测量截断。
   对象：竖放的扩域蓝图卷轴/地板块。分层 = 共创顺序（RPT.cocreateSteps.main）：
     底 N1 试点结果＝地板块（垄行纹理）→ N2/N3/N4/N5＝蓝图卷轴纸
     （淡蓝网格纹 + 卷边）→ 顶 N6 企业选择＝闸口层（全图唯一语义红描边，
     采纳/调整/暂缓或否决三条出口线）。
   数据：window.RPT.cocreateSteps / blueprintOutputs / expansionCandidates /
   keyFacts / fiveSteps（只用已有键，宁可缺失不编造，§U.5）。
   每层 drill → 步骤含义 + 母稿行号（K1 · 2026-07-24）。
   模式契约：听 'cover-mode-change'（detail.mode ∈ rec/x/w），非 x 停帧，
   切回 x 重 fit 重启；reduced-motion 直接画完成帧。
   window.__COVER_NOTEXT = true 时不画任何文字（QA 识别测试钩子，非业务功能）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas-x');
  if (!host) return;
  const U = window.U;
  if (!U) return;
  host.setAttribute('data-module', 'cover-exploded');

  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_L = '#7d9bff';
  const NEG = '#c22f4e';                       // 真语义红：仅 N6 企业选择闸口
  const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

  /* U.frame 起手三件套：写进 canvas 作无障碍回退文本（canvas 子节点不上屏） */
  U.frame(host, {
    title: '六层共创，从试点地块到企业闸口',
    sub: '轴测爆炸图 · 底＝试点地块 顶＝企业选择闸口 · 层序＝建议的共创顺序 · 点击空白装配/爆炸 · 点击图层或右侧标签下钻',
    src: '研究整理 · K1 03专题工作稿 2026-07-24 · 行24–40 · 建议性蓝图',
  });
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', '扩域蓝图卷轴六层爆炸图：底层为试点结果地块，四层蓝图卷轴纸对应四步共创，顶层企业选择闸口以唯一语义红描边，三条出口线对应采纳、调整、暂缓或否决。');

  /* ── 数据纪律（§U.5）：只用已有键，缺失则留白 ── */
  const R = window.RPT || {};
  const STEPS = (R.cocreateSteps && Array.isArray(R.cocreateSteps.main) && R.cocreateSteps.main.length === 6)
    ? R.cocreateSteps.main : null;
  const BR = (R.cocreateSteps && Array.isArray(R.cocreateSteps.branches)) ? R.cocreateSteps.branches : [];
  const OUT5 = Array.isArray(R.blueprintOutputs) ? R.blueprintOutputs : [];
  const CAND = Array.isArray(R.expansionCandidates) ? R.expansionCandidates : [];
  const KF = Array.isArray(R.keyFacts) ? R.keyFacts : [];
  const FIVE = Array.isArray(R.fiveSteps) ? R.fiveSteps : [];
  const kfStart = KF.find(k => k.label === '启动参考条件');
  const first = CAND.find(c => c.order === 1);
  const THESIS = {
    N1: kfStart ? `启动参考 ${kfStart.value} · 不是固定门槛` : '启动参考 · 大致参考非门槛',
    N2: FIVE[0] ? `五步法一 · ${FIVE[0].action}` : '沟通经营目标与治理诉求',
    N3: '五步法二·三 · 核验痛点 · 复查试点',
    N4: first ? `首选建议：${first.scenario} · 顺序为方案推断` : '候选场景与首选建议 · 方案推断',
    N5: OUT5.length ? `蓝图产物 ${OUT5.length} 项 · 企业可修订` : '分阶段蓝图 · 企业可修订',
    N6: BR.length === 3 ? BR.map(b => b.choice).join(' / ') : '采纳 / 调整 / 暂缓或否决',
  };
  const SRC_LINE = '研究整理 · K1 03业务扩域循环专题工作稿 · 2026-07-24';
  const DRILL = {
    N1: { title: '第一步 · 试点结果', value: 'N1 / 06 · 共创顺序',
      sub: '已有试点形成可参考结果（母稿 行26）。启动参考条件：可核验结果 / 重复运行 / 风险已说明——大致参考，不是固定门槛（行14）；企业也可认为条件不成熟，暂不扩域。本层画成已耕种的地块：一切扩域讨论从真实结果长出。' },
    N2: { title: '第二步 · 沟通经营目标', value: 'N2 / 06 · 共创顺序',
      sub: '与企业沟通经营目标与治理诉求（母稿 行26）；五步法第一步：与管理层沟通经营目标和治理诉求（行44）。经营方向来自管理层，FDE 不替企业拍板（行50）。' },
    N3: { title: '第三步 · 共同盘点', value: 'N3 / 06 · 共创顺序',
      sub: '共同盘点资料、已有能力与现实约束（母稿 行27）；与候选业务域负责人及一线人员核验真实痛点、复查首个试点的结果与未解决问题（行45–46）。真实痛点与数据可得性待企业核验（行80）。' },
    N4: { title: '第四步 · 候选场景与首选建议', value: 'N4 / 06 · 共创顺序',
      sub: '提出候选场景与首选建议（母稿 行28）：首选建议＝渠道库存与动销协同（行86）。候选顺序是方案推断，不是圣农批准的路线；企业可以调整顺序，也可以暂不选择任何场景（行90）。' },
    N5: { title: '第五步 · 分阶段蓝图', value: 'N5 / 06 · 共创顺序',
      sub: '共同形成分阶段业务扩域蓝图（母稿 行29）。建议产物 5 项：候选场景及推荐顺序 / 首选下一试点建议与主要依据 / 可以复用的已有能力和需要补充的条件 / 建议参与角色、后续阶段及可以暂缓的原因 / 公开资料支持、方案推断和待企业核验项（行58–64），企业可继续修订。' },
    N6: { title: '最终闸口 · 企业选择', value: BR.length === 3 ? BR.map(b => b.choice).join(' / ') : '采纳 / 调整 / 暂缓或否决',
      sub: '企业四种走向：确认 / 调整 / 暂缓 / 否决（母稿 行6）。采纳→建议开展小范围新场景试点→新场景重新进入 01 经营事件循环（行31/34）；调整→回到共同盘点 N3（行32）；暂缓或否决→保留依据，待条件变化后再讨论（行33）。03 只提供建议，不执行真实审批（行70）。' },
  };

  /* ── 层定义：index 0 = 顶层（N6 闸口），index 5 = 底层（N1 地块） ── */
  const HX = 18, HY = 12.5, GAP = 0.14, SEP = 3.4;
  const DEF = [
    { id: 'N6', kind: 'gate', color: NEG, roll: 0.8 },
    { id: 'N5', kind: 'sheet', color: BLUE, roll: 1.3 },
    { id: 'N4', kind: 'sheet', color: BLUE_D, roll: 0.8 },
    { id: 'N3', kind: 'sheet', color: BLUE, roll: 0.8 },
    { id: 'N2', kind: 'sheet', color: BLUE_D, roll: 0.8 },
    { id: 'N1', kind: 'plot', color: INK_M, roll: 0 },
  ];
  const LAYERS = STEPS ? DEF.map((d, i) => {
    const step = STEPS.find(s => s.id === d.id) || {};
    return {
      i, id: d.id, kind: d.kind, roll: d.roll, color: d.color,
      label: step.label || d.id, gate: !!step.gate,
      th: d.kind === 'plot' ? 1.5 : 1.0,
      hx: d.kind === 'plot' ? 19.6 : HX, hy: d.kind === 'plot' ? 13.9 : HY,
      thesis: THESIS[d.id], z0: 0,
    };
  }) : [];
  let zacc = 0;
  for (let i = 5; i >= 0; i--) { if (LAYERS[i]) { LAYERS[i].z0 = zacc; zacc += LAYERS[i].th + GAP; } }
  /* 纵向容量：爆炸到顶 + 闸口立高 3.0；fit() 的 u 上限，矮视口不裁顶 */
  const GATE_H = 3.0;
  const ZTOP = LAYERS.length ? LAYERS[0].z0 + LAYERS[0].th + 5 * SEP + GATE_H + 0.4 : 28;
  const PTOP = (HX + HY) * 0.7071 * 0.5 + 0.6;

  /* ── 几何引擎（同 01/02 B 纪律） ── */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bd = U.bindCanvas(host);
  const ctx = bd.ctx;
  let W = 0, H = 0, Hv = 0, u = 6, cam = null, yawCur = Math.PI / 4;

  function fit() {
    const m = bd.fit();
    W = m.w; H = m.h;
    /* 封面内容可超过 100vh：签名条/标签/几何锚定可视高度，否则沉到首屏外 */
    Hv = Math.max(320, Math.min(H, window.innerHeight || H));
    const leftBound = 0.585 * W;                       // 避开左文列 + chips 行（postmortem #15）
    let right = W - 332, labels = true;                // 右侧 332px 标签列预留（列宽 312）
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

  /* ── 预渲染材质（seeded RNG 可复现） ── */
  let patSheet = null, patPlot = null;
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
    if (!patSheet) patSheet = speckle('#eef4ff', '#c9d9f7', '#ffffff', 150, 20260724); // 淡蓝图纸
    if (!patPlot) patPlot = speckle('#e9eef5', '#c3cedd', '#f7fafc', 240, 20260725);  // 地块剖面
  }

  /* ── 状态 ── */
  let active = false, raf = 0, started = false;
  let kNow = 0, kFrom = 0, kTo = 1, kT0 = 0, t0 = 0;
  let yawMouse = 0, yawMouseT = 0;
  let hits = [];

  /* 爆炸主进度 k（easeOutBack）+ 逐层 stagger + 呼吸浮动 */
  function layerZ(L, t) {
    const lay = U.clamp(kNow * 1.55 - L.i * 0.17, 0, 1);
    const breathe = REDUCED ? 0 : Math.sin(t * 0.9 + L.i * 1.31) * 0.20 * lay;
    return { lay, z: L.z0 + lay * (5 - L.i) * SEP + breathe };
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
  function seg(p1, p2, style, lw) {
    ctx.strokeStyle = style; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  function bboxOf(pts) {
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
  }
  function sideShade(pts) {                                // 侧体积渐变：顶白 .26 → 底 ink .09
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
  function lineTop(x1, y1, x2, y2, z, st, lw) { seg(proj(x1, y1, z), proj(x2, y2, z), st, lw); }
  function polyTop(cx, cy, r, z, n) {                      // 顶平面圆（投影后成椭圆弧）
    const pts = [];
    for (let k = 0; k < (n || 26); k++) {
      const a = k / (n || 26) * U.TAU;
      pts.push(proj(cx + r * Math.cos(a), cy + r * Math.sin(a), z));
    }
    return pts;
  }

  /* ── 蓝图卷轴纸层（N2–N6）：淡蓝网格纹 + 卷边 + 逐步身份刻线 ── */
  function gridLines(L, zt) {                              // 投影绘制的淡蓝网格（图纸纹）
    const hx = L.hx, hy = L.hy;
    ctx.lineWidth = 0.7;
    for (let gx = -hx + 3; gx <= hx - 2.4; gx += 3) lineTop(gx, -hy + 1.3, gx, hy - 1.3, zt, hexA(BLUE, 0.12), 0.7);
    for (let gy = -hy + 3; gy <= hy - 2.4; gy += 3) lineTop(-hx + 1.6, gy, hx - 1.9, gy, zt, hexA(BLUE, 0.12), 0.7);
    /* 对位十字（制图件） */
    lineTop(-1.5, 0, 1.5, 0, zt, hexA(BLUE, 0.35), 0.9);
    lineTop(0, -1.5, 0, 1.5, zt, hexA(BLUE, 0.35), 0.9);
  }
  function drawMarks(L, zt) {                              // 每步一条几何身份刻线（文字在标签列）
    const c = hexA(L.color, 0.62);
    if (L.id === 'N2') {                                   // 对话：两只交叠气泡
      strokeP(polyTop(-5.2, -2.2, 2.2, zt), c, 1);
      strokeP(polyTop(0.8, 1.9, 2.8, zt), c, 1);
      lineTop(-4.0, -0.5, -2.9, 0.9, zt, c, 1);
      lineTop(-0.4, 0.2, -1.6, -1.1, zt, c, 1);
    } else if (L.id === 'N3') {                            // 盘点：三格清单 + 勾
      for (let k = 0; k < 3; k++) {
        const yv = -4.6 + k * 4.6;
        const sq = [proj(-6.4, yv - 0.95, zt), proj(-4.5, yv - 0.95, zt), proj(-4.5, yv + 0.95, zt), proj(-6.4, yv + 0.95, zt)];
        strokeP(sq, c, 1);
        lineTop(-3.3, yv + 0.5, -2.6, yv - 0.3, zt, c, 1.2);
        lineTop(-2.6, yv - 0.3, -1.4, yv + 1.1, zt, c, 1.2);
      }
    } else if (L.id === 'N4') {                            // 候选：三枚菱形，首选实心电蓝
      [-5.5, 0, 5.5].forEach((xv, k) => {
        const d = [proj(xv, -2.3, zt), proj(xv + 1.8, 0, zt), proj(xv, 2.3, zt), proj(xv - 1.8, 0, zt)];
        if (k === 0) { fillP(d, hexA(BLUE, 0.85)); strokeP(d, hexA(BLUE_D, 0.95), 1.2); }
        else strokeP(d, hexA(INK_M, 0.55), 1);
      });
    } else if (L.id === 'N5') {                            // 分阶段：三段小方幅
      [-6, 0, 6].forEach(xv => {
        const r0 = [proj(xv - 2.1, -1.3, zt), proj(xv + 2.1, -1.3, zt), proj(xv + 2.1, 1.3, zt), proj(xv - 2.1, 1.3, zt)];
        strokeP(r0, c, 1);
      });
      ctx.setLineDash([2.2, 2.2]);
      lineTop(-3.9, 0, -2.1, 0, zt, c, 0.9);
      lineTop(2.1, 0, 3.9, 0, zt, c, 0.9);
      ctx.setLineDash([]);
    }
  }
  function drawRoll(L, zt) {                               // 卷边：右缘纸卷（轴沿 y 的圆管）
    const r = L.roll; if (!r) return;
    const x0 = L.hx - 0.15, yA = -L.hy + 0.55, yB = L.hy - 0.55, TH = 9, THmax = Math.PI * 1.08;
    const prof = [];
    for (let j = 0; j <= TH; j++) {
      const th = THmax * j / TH;
      prof.push({ x: x0 + r * Math.sin(th), z: zt + r * (1 - Math.cos(th)), th });
    }
    for (let j = 0; j < TH; j++) {                         // 管面条带：顶部最亮
      const a = prof[j], b = prof[j + 1];
      const q = [proj(a.x, yA, a.z), proj(a.x, yB, a.z), proj(b.x, yB, b.z), proj(b.x, yA, b.z)];
      const light = 0.5 + 0.5 * Math.cos((a.th + b.th) / 2 - Math.PI / 2);
      fillP(q, `rgba(255,255,255,${0.32 + 0.38 * light})`);
      strokeP(q, hexA(BLUE, 0.18), 0.6);
    }
    prof.forEach((p, j) => { if (j % 2 === 0) seg(proj(p.x, yA, p.z), proj(p.x, yB, p.z), hexA(BLUE, 0.26), 0.6); });
    [yA, yB].forEach(yv => {                               // 两端螺旋口（卷纸厚度）
      const zc = zt + r;
      ctx.beginPath();
      prof.forEach((p, j) => { const q = proj(p.x, yv, p.z); if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.strokeStyle = hexA(L.color, 0.6); ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath();
      prof.forEach((p, j) => {
        const q = proj(x0 + (p.x - x0) * 0.55, yv, zc + (p.z - zc) * 0.55);
        if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
      });
      ctx.strokeStyle = hexA(L.color, 0.35); ctx.lineWidth = 0.7; ctx.stroke();
    });
  }
  function drawGate(L, zt) {                               // N6 闸口：唯一语义红描边 + 三出口线
    const gh = GATE_H;
    function post(x0, x1) {
      const y0 = -0.95, y1 = 0.95, zt2 = zt + gh - 0.6;
      const A = proj(x0, y0, zt), B = proj(x1, y0, zt), C = proj(x1, y1, zt), D = proj(x0, y1, zt);
      const A2 = proj(x0, y0, zt2), B2 = proj(x1, y0, zt2), C2 = proj(x1, y1, zt2), D2 = proj(x0, y1, zt2);
      fillP([A, B, B2, A2], '#fbfbfd'); sideShade([A, B, B2, A2]);
      fillP([B, C, C2, B2], '#f1f4f9'); sideShade([B, C, C2, B2]);
      fillP([A2, B2, C2, D2], '#ffffff');
      seg(A, A2, hexA(NEG, 0.9), 1.3); seg(B, B2, hexA(NEG, 0.9), 1.3);
      seg(C, C2, hexA(NEG, 0.9), 1.3); seg(D, D2, hexA(NEG, 0.9), 1.3);
      strokeP([A2, B2, C2, D2], hexA(NEG, 0.95), 1.3);
    }
    post(-3.1, -1.9); post(1.9, 3.1);
    const zl0 = zt + gh - 0.6, zl1 = zt + gh;              // 门楣
    const E = proj(-3.3, -0.95, zl1), F = proj(3.3, -0.95, zl1), G = proj(3.3, 0.95, zl1), Hd = proj(-3.3, 0.95, zl1);
    const E0 = proj(-3.3, -0.95, zl0), F0 = proj(3.3, -0.95, zl0), G0 = proj(3.3, 0.95, zl0), H0 = proj(-3.3, 0.95, zl0);
    fillP([E0, F0, F, E], '#f6f8fb'); sideShade([E0, F0, F, E]);
    fillP([F0, G0, G, F], '#edf1f7'); sideShade([F0, G0, G, F]);
    fillP([E, F, G, Hd], '#ffffff');
    strokeP([E, F, G, Hd], hexA(NEG, 0.95), 1.5);
    seg(E, E0, hexA(NEG, 0.9), 1.3); seg(F, F0, hexA(NEG, 0.9), 1.3);
    seg(G, G0, hexA(NEG, 0.9), 1.3); seg(Hd, H0, hexA(NEG, 0.9), 1.3);
    strokeP([E0, F0, G0, H0], hexA(NEG, 0.8), 1.2);
    hits.push({ i: L.i, poly: [E, F, F0, E0] });
    ctx.setLineDash([3, 2.4]);                             // 门槛虚线（红）
    lineTop(-1.9, 0, 1.9, 0, zt + 0.03, hexA(NEG, 0.8), 1.1);
    ctx.setLineDash([]);
    /* 三条出口线 = 企业选择三分支（母稿 行31–33）：采纳实蓝 / 调整墨虚 / 暂缓或否决浅点 */
    const outs = [
      { y: -2.8, st: hexA(BLUE, 0.9), lw: 1.5, dash: null },
      { y: 0, st: hexA(INK_M, 0.75), lw: 1.2, dash: [5, 3] },
      { y: 2.8, st: hexA(INK_L, 0.85), lw: 1.2, dash: [1.6, 2.8] },
    ];
    outs.forEach(o => {
      if (o.dash) ctx.setLineDash(o.dash);
      const p1 = proj(3.5, 0, zt + 0.04), p2 = proj(9.4, o.y, zt + 0.04);
      seg(p1, p2, o.st, o.lw);
      seg(p2, proj(9.4, o.y + 0.75, zt + 0.04), o.st, o.lw);   // 端点制图短tick（无箭头）
      ctx.setLineDash([]);
    });
  }
  function drawSheet(L, z, t) {
    const hx = L.hx, hy = L.hy, zb = z, zt = z + L.th;
    const t1 = proj(-hx, -hy, zt), t2 = proj(hx, -hy, zt), t3 = proj(hx, hy, zt), t4 = proj(-hx, hy, zt);
    const b2 = proj(hx, -hy, zb), b3 = proj(hx, hy, zb), b4 = proj(-hx, hy, zb);
    fillP([b2, b3, t3, t2], patSheet); sideShade([b2, b3, t3, t2]);
    fillP([b3, b4, t4, t3], patSheet); sideShade([b3, b4, t4, t3]);
    ctx.strokeStyle = 'rgba(5,28,44,.10)'; ctx.lineWidth = 0.6;   // 侧页线
    for (let f = 1; f <= 2; f++) {
      const zf = zb + L.th * f / 3;
      lineTop(hx, -hy, hx, hy, zf, 'rgba(5,28,44,.10)', 0.6);
      lineTop(hx, hy, -hx, hy, zf, 'rgba(5,28,44,.10)', 0.6);
    }
    const top = [t1, t2, t3, t4];
    fillP(top, '#f4f8ff');
    gridLines(L, zt);
    drawMarks(L, zt);
    glossQuad(top, 0.26);
    bevel(top);
    sheen(top, L.i, t);
    drawRoll(L, zt);
    if (L.kind === 'gate') drawGate(L, zt);
    hits.push({ i: L.i, poly: top });
  }

  /* ── 地板块（N1 试点结果）：垄行纹理 + 土层剖线 ── */
  function furrow(yv, zt, hx) {                            // 一条垄：亮顶 + 近侧阴面 + 脊线 + 垄端帽
    const z2 = zt + 0.15, w = 0.62, xe = hx - 0.4;
    const tp = [proj(-hx + 1.2, yv - w, z2), proj(xe, yv - w, z2), proj(xe, yv + w, z2), proj(-hx + 1.2, yv + w, z2)];
    fillP(tp, 'rgba(255,255,255,.68)');
    const ns = [proj(-hx + 1.2, yv + w, zt), proj(xe, yv + w, zt), tp[2], tp[3]];
    fillP(ns, 'rgba(5,28,44,.105)');
    seg(tp[0], tp[1], 'rgba(5,28,44,.14)', 0.7);
    fillP([proj(xe, yv - w, zt), proj(xe, yv + w, zt), tp[2], tp[1]], 'rgba(5,28,44,.13)');  // 田边垄端截面
  }
  function drawPlot(L, z, t) {
    const hx = L.hx, hy = L.hy, zb = z, zt = z + L.th;
    const t1 = proj(-hx, -hy, zt), t2 = proj(hx, -hy, zt), t3 = proj(hx, hy, zt), t4 = proj(-hx, hy, zt);
    const b2 = proj(hx, -hy, zb), b3 = proj(hx, hy, zb), b4 = proj(-hx, hy, zb);
    fillP([b2, b3, t3, t2], patPlot); sideShade([b2, b3, t3, t2]);
    fillP([b3, b4, t4, t3], patPlot); sideShade([b3, b4, t4, t3]);
    for (let f = 1; f <= 2; f++) {                         // 土层剖线（地块身份）
      const zf = zb + L.th * f / 3;
      lineTop(hx, -hy, hx, hy, zf, 'rgba(5,28,44,.13)', 0.7);
      lineTop(hx, hy, -hx, hy, zf, 'rgba(5,28,44,.13)', 0.7);
    }
    const top = [t1, t2, t3, t4];
    fillP(top, '#f2f6fa');
    for (let yv = -hy + 2.6; yv <= hy - 1.8; yv += 2.4) furrow(yv, zt, hx);   // 垄行
    glossQuad(top, 0.18);
    bevel(top);
    sheen(top, L.i, t);
    hits.push({ i: L.i, poly: top });
  }

  /* ── 标签列：候选锚点取投影最右 x → 引线入 312px 列；行距 <34px 向下推挤 ── */
  function drawLabels(la, t) {
    const rows = LAYERS.map(L => {
      const zz = layerZ(L, t).z;
      const zt = zz + L.th;
      const cand = [
        proj(-L.hx, -L.hy, zt), proj(L.hx, -L.hy, zt), proj(L.hx, L.hy, zt), proj(-L.hx, L.hy, zt),
        proj(L.hx, 0, zt),
      ];
      if (L.roll) cand.push(proj(L.hx - 0.15, 0, zt + 2 * L.roll));
      if (L.kind === 'gate') cand.push(proj(3.3, 0.95, zt + GATE_H));
      let a = cand[0];
      for (let k = 1; k < cand.length; k++) if (cand[k].x > a.x) a = cand[k];
      return { L, ax: a.x, ay: a.y };
    });
    rows.sort((p, q) => p.ay - q.ay);
    const TOP = 64, BOT = Hv - 132, MIN = 34;
    rows.forEach((r, idx) => { r.ry = idx ? Math.max(r.ay, rows[idx - 1].ry + MIN) : Math.max(TOP, r.ay); });
    const over = rows[rows.length - 1].ry - BOT;
    if (over > 0) rows.forEach(r => { r.ry -= over; });
    const labX = cam.right + 6, textX = cam.right + 20;
    const budget = Math.min(286, W - 20 - textX);          // 列宽 312 − 26
    ctx.globalAlpha = la;
    /* 标签列根部小图例：红 = 企业最终闸口（唯一语义红，必须给读法）；
       锚在首行标签上方 30px，不钉死在 TOP（行组整体上移时不留孤儿图例） */
    ctx.font = `8.5px ${MONO}`;
    ctx.fillStyle = NEG;
    ctx.fillRect(textX, rows[0].ry - 30, 7, 7);
    haloText('红 = 企业最终闸口', textX + 12, rows[0].ry - 23, INK_M);
    rows.forEach(r => {
      const L = r.L, yy = r.ry;
      ctx.strokeStyle = hexA(L.color, 0.8); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(r.ax, r.ay); ctx.lineTo(labX, yy - 3.5); ctx.lineTo(labX + 8, yy - 3.5); ctx.stroke();
      ctx.fillStyle = hexA(L.color, 0.9);
      ctx.beginPath(); ctx.arc(r.ax, r.ay, 2, 0, U.TAU); ctx.fill();
      ctx.font = `700 10px ${MONO}`;
      haloText(fitText(`${L.id} · ${L.label}`, budget), textX, yy, L.color);
      ctx.font = `11px ${SERIF}`;
      haloText(fitText(L.thesis, budget), textX, yy + 13.5, INK_M);
      hits.push({ i: L.i, x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
    });
    ctx.globalAlpha = 1;
  }

  function drawCaption() {                                 // 右下签名条：随状态改写（postmortem #21）
    const exploded = kTo === 1;
    ctx.textAlign = 'right'; ctx.font = `9px ${MONO}`;
    if (cam && !cam.labels) {                              // 窄屏断点：标签列消失时的读法补偿
      haloText('窄屏模式 · 点击图层查看步骤含义 · 红 = 企业最终闸口', W - 22, Hv - 68, INK_M);
    }
    haloText(exploded ? '六层 · 共创顺序 · 建议性蓝图 — CLICK TO ASSEMBLE'
                      : '已装配 · 扩域蓝图卷轴 — CLICK TO EXPLODE', W - 22, Hv - 54, INK_L);
    haloText('读法 · 层序＝建议的共创顺序（行40），不代表自动化工作流', W - 22, Hv - 40, INK_L);
    haloText('SOURCE · 研究整理 K1 · 2026-07-24 · 母稿 行24–40', W - 22, Hv - 26, INK_L);
    ctx.textAlign = 'left';
  }

  /* ── 主绘制 ── */
  function draw(t) {
    if (W < 2 || H < 2 || !cam) return;
    ctx.clearRect(0, 0, W, H);
    hits = [];
    yawCur = Math.PI / 4 + (REDUCED ? 0 : 0.3 * Math.sin(t * 0.11)) + yawMouse;   // 转盘 yaw
    ensurePatterns();
    if (!LAYERS.length) {
      ctx.font = `10px ${MONO}`;
      haloText('COCREATE DATA MISSING · window.RPT.cocreateSteps 未加载（数据纪律：宁可缺失不编造）', cam.cx - 160, cam.cy, INK_L);
      return;
    }
    const g0 = proj(0, 0, 0);                              // 地面椭圆影
    softEllipse(g0.x, g0.y + 1.2 * u, 24 * u, 9.2 * u, 0.14);
    for (let i = 5; i >= 0; i--) {
      const L = LAYERS[i], zz = layerZ(L, t);
      if (zz.lay > 0.02) {                                 // 层间 plateShadow
        const rest = proj(0, 0, L.z0);
        softEllipse(rest.x, rest.y, 20.5 * u, 7.6 * u, U.clamp(0.20 - (zz.z - L.z0) * u * 0.007, 0, 0.20));
      }
      if (L.kind === 'plot') drawPlot(L, zz.z, t); else drawSheet(L, zz.z, t);
    }
    const la = U.clamp((kNow - 0.45) * 2.4, 0, 1);         // 标签随爆炸淡入
    if (cam.labels && la > 0 && !window.__COVER_NOTEXT) drawLabels(la, t);
    const wg = ctx.createLinearGradient(0, 0, 0.62 * W, 0); // 左文列白纱洗
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
    const L = LAYERS[i], d = DRILL[L.id];
    U.showDrill({
      title: d.title,
      value: d.value,
      sub: d.sub,
      source: SRC_LINE,
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
      /* 只在真空白（画布本体 / 结构容器）上响应；按钮、chips、文字层一律不触发装配切换 */
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

  /* ── 激活 / 休眠：display:none 激活时等 reflow 再 fit（postmortem #2） ── */
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
  /* 模式契约（03 地基）：听 cover-mode-change，非 x 停帧；切回 x 重 fit 重启 */
  window.addEventListener('cover-mode-change', e => {
    setActive(!!(e.detail && e.detail.mode === 'x'));
  });
  window.addEventListener('resize', () => { if (active) { fit(); if (REDUCED) drawStatic(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active && REDUCED) drawStatic(); });
})();
