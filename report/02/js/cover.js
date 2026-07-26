/* ═══════════════════════════════════════════════════════════
   cover.js · 封面 A —— 隔离试验样本管无限递归（宿主 #cover-canvas 全屏 absolute canvas）
   ─────────────────────────────────────────────────────────
   主题原子 = 隔离试验样本管（俯视 mask：玻璃管身外环 + 软木塞盘 / 管内分层液体
   同心环 + 刻度线 + 标签条「候选版本」——不设版本号）。递归的是"物体本身"，
   不是逻辑链（COVER.md §3）。引擎移植自 01 cover.js（已验收），只换 mask +
   内部纹理 tile + 文案（COVER.md §7：换行业必须换纹理，引擎不动）。
   引擎：
     · 相机持续拉远（log 空间匀速），当前样本管/阵列精确缩成上一层 3×3 试管架
       阵列的中心格；
     · 新一圈样本管按 BFS（自中心向外螺旋）出生序诞生 + 电蓝闪光（圆形闪，无波浪冲击环）；
     · 蓝色四角取景框跟踪当前原子（透明度只随相位淡入淡出，不随时间闪烁）；
     · 中心格永远只由上一层递归落入——sibling 格永不占中心（"留空等下一层"）；
     · 12 秒/层无缝循环（p 连续推进不重置，深处 LOD 裁剪保证无限）。
   阵列含义 = 能力库（试管架俯视 = 圆格阵）；caption 写明"每一项验证过的改进，
   都是能力库中的一格——沉淀，一路向上"。
   数据来源（只取 window.RPT / window.SRC，缺失不编造）：
     · RPT.dossier：gates=3（回放/留出/审查）/ approvals=3 / trialFields=8（结构性计数）
     · RPT.destiny：入口与四分支语料（drill 文案）；旁格样本管不设虚构版本号——
       能力版本库与退役规则为待企业验证项（§8）。
   注 1：宿主是全屏 canvas，U.frame 的 DOM 三联无法挂载 → 等价物绘制在画布右下：
        结论句（serif）+ 读法/交互 sub（mono）+ 带 K 编号/日期的 src 行。
   注 2：cover.js 先于 sources.js 加载，window.SRC 一律惰性读取（带日期兜底）。
   注 3：.cover-inner 文字层压在 canvas 之上 → 点击/悬停监听挂 window，
        排除 button/a/chip/#drill-card 后做命中测试，不干扰翻页 chips。
   注 4：02 三态切换约定 = 各引擎 setActive 自负 display 切换（cover-wire.js 占位契约），
        与 01 由 wire 代管不同；display:none 恢复时自动 refit（COVERS.md §2 0×0 陷阱）。
   红线：不设版本号/案件数/评测成绩/模拟队列；封面全文不写"自动学习"。
   对外契约：window.COVER_A = { setActive(on), redraw(), rebuild() }（供三态切换调用）。
   QA 钩子：window.__COVER_NOTEXT__ = true 后 COVER_A.rebuild() → 无字识别测试帧。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas');
  if (!host) return;

  const U = window.U || {};
  const TAU = U.TAU || Math.PI * 2;
  const PAL = U.PAL || { paper: '#ffffff', hi: '#f7f9fc', ink: '#051c2c', inkMd: '#42566a', inkLo: '#8595a6', line: '#dbe2ea', lineLo: '#eef1f6', red: '#2251ff', redHi: '#1233b8', neg: '#c22f4e' };
  const clamp = U.clamp || ((v, a, b) => Math.max(a, Math.min(b, v)));
  const makeRng = U.makeRng || (() => () => 0.5);
  const showDrill = U.showDrill || (() => {});
  const BLUE = PAL.red;            // 电蓝（遗留槽位名）
  const BLUE_D = PAL.redHi;        // #1233b8
  const BLUE_L = '#7d9bff';        // 浅蓝（规范允许的电蓝族第三阶）
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';

  /* ── 数据（RPT 契约：dossier / destiny；缺失不编造，仅结构性计数兜底） ── */
  const DOS = (window.RPT && window.RPT.dossier) || {};
  const DST = (window.RPT && window.RPT.destiny) || {};
  const UNK = (window.RPT && Array.isArray(window.RPT.unknowns)) ? window.RPT.unknowns : [];
  const gatesBasis = (DOS.gates && DOS.gates.basis) || '历史回放 / 留出案例 / 专家审查';
  const trialBasis = (DOS.trialFields && DOS.trialFields.basis) || '假设 / 修改对象 / 基线 / 案例集 / 指标 / 结论 / 审批 / 版本关系';
  const verUnknown = (UNK.find(u => /版本标签/.test(u.item || '')) || {}).item || '版本标签、发布范围和结果回收机制';
  const branchB4 = (Array.isArray(DST.branches) && DST.branches.find(b => b.entersLoop)) || null;

  function srcDate(id, fb) {
    const S = window.SRC;
    if (Array.isArray(S)) { const r = S.find(x => x.id === id); if (r && r.date) return r.date; }
    return fb;
  }
  const srcTag = () => `研究整理 — 02 专题工作稿（K1 · ${srcDate('K1', '2026-07-23 定稿 · 2026-07-24 最终复核')}）`;
  const srcTagK3 = () => `研究整理 — 02 思维台账（K3 · ${srcDate('K3', '2026-07-24')}）`;

  /* ── 引擎常量 ── */
  const GRID = 3;                       // 每层 3×3（中心格留给上一层递归）
  const FILL = 0.9;                     // 格尺寸 / 格距
  const R = 2 / FILL + 1;               // 单层放大比 ≈ 3.222（无缝关键：s_k = S0·R^(k−p)）
  const LAYER_T = 12;                   // 12 秒/层
  const LIVE_PX = 132;                  // ≥ 此尺寸用矢量活画，否则贴预渲染 tile
  const MIN_PX = 7;                     // 深处裁剪
  const ZONE_PX = 56;                   // ≥ 此尺寸的格子注册下钻热区
  const ROOT_SEED = 20260724;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STATIC_P = 1.78;                // reduced-motion 静态完成帧：φ=0.78 全环齐生后的密集格场（取景框全显）

  // BFS 出生序：自中心向外，环内顺时针螺旋（左上起）
  const RING_ORDER = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
  const ringIdx = (di, dj) => { for (let i = 0; i < 8; i++) if (RING_ORDER[i][0] === di && RING_ORDER[i][1] === dj) return i; return 0; };

  const hashSeed = (seed, di, dj, level) => {
    let h = (seed ^ 0x9e3779b9) >>> 0;
    h = Math.imul(h ^ ((di + 2) * 0x85ebca6b), 0xc2b2ae35) >>> 0;
    h = Math.imul(h ^ ((dj + 2) * 0x27d4eb2f), 0x165667b1) >>> 0;
    return (h ^ ((level + 1) * 0x9e3779b9)) >>> 0;
  };

  /* ── 画布绑定 ── */
  const bound = U.bindCanvas(host);
  const ctx = bound.ctx;
  let view = bound.fit();
  const zones = [];                     // 每帧重建的下钻热区 {x0,y0,x1,y1,d}

  /* ── 文字工具：一律纸色光晕（canvas 规范 strokeText 3.5–5px） ── */
  let NOTEXT = false;                   // QA 识别测试钩子（重建 tile + 跳过活字）
  function txt(str, x, y, font, fill, align, halo) {
    if (NOTEXT) return;
    ctx.save();
    ctx.font = font; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = halo || 4; ctx.strokeStyle = PAL.paper;
    ctx.strokeText(str, x, y); ctx.fillStyle = fill; ctx.fillText(str, x, y);
    ctx.restore();
  }
  function trunc(str, maxW, font) {     // 测量截断：先去逗号/介词尾巴再加 " …"
    ctx.save(); ctx.font = font;
    if (ctx.measureText(str).width <= maxW) { ctx.restore(); return str; }
    let s = str;
    while (s.length && ctx.measureText(s + ' …').width > maxW) s = s.slice(0, -1);
    s = s.replace(/[，,、。·\s]+$/, '');
    ctx.restore(); return s + ' …';
  }
  function rrOn(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); };

  /* ═══ 样本管画法（俯视。局部坐标：原点=管圆心偏下 (0,2) 为外接方中心；
         管圆心 (0,−18)，外径 140；标签吊牌在左下 (−66,152) 旋 −5°。
         外接方 FOOT=356，(FOOT_CX,FOOT_CY)=(0,2) 映射到屏幕格中心） ═══ */
  const FOOT = 356, FOOT_CX = 0, FOOT_CY = 2;
  function tubeTransform(x, y, size) {          // x,y = 外接方左上角屏幕坐标
    ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.scale(size / FOOT, size / FOOT); ctx.translate(-FOOT_CX, -FOOT_CY);
  }

  // 接地软影（俯视正下方微偏）
  function shadowOn(g) {
    circ(g, 10, -4, 142); g.fillStyle = 'rgba(5,28,44,0.07)'; g.fill();
  }
  // 悬挂标本吊牌（管身标签的俯视可读化；withText 时写「候选版本」，否则抽象线）
  function tagOn(g, withText, lw) {
    g.save(); g.translate(-66, 152); g.rotate(-0.09);
    g.fillStyle = '#ffffff'; g.strokeStyle = PAL.ink; g.lineWidth = lw;
    rrOn(g, -40, -21, 80, 42, 6); g.fill(); g.stroke();
    circ(g, -28, -9, 4.5); g.strokeStyle = PAL.inkMd; g.lineWidth = lw * 0.55; g.stroke();
    if (withText && !NOTEXT) {
      g.font = `700 15px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = BLUE_D; g.fillText('候选版本', 6, 3);
    } else {
      g.strokeStyle = PAL.line; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-12, 3); g.lineTo(24, 3); g.stroke();
    }
    g.restore();
  }
  // 系绳（玻璃唇缘 → 吊牌孔；画在玻璃之后，压在管缘上）
  function stringOn(g, lw) {
    g.strokeStyle = PAL.inkMd; g.lineWidth = lw * 0.55; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-59, 109); g.quadraticCurveTo(-88, 118, -95, 141); g.stroke();
  }
  // 玻璃底：白盘 + 外环墨线
  function glassBaseOn(g, lw) {
    circ(g, 0, -18, 140);
    g.fillStyle = '#ffffff'; g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = lw; g.stroke();
  }
  // 玻璃罩面：底部薄影弧 + 顶部受光弧 + 内缘线 + 高光弧（玻璃体积感）
  function glassGlazeOn(g, lw) {
    g.lineCap = 'butt';
    g.strokeStyle = 'rgba(5,28,44,0.08)'; g.lineWidth = 22;
    g.beginPath(); g.arc(0, -18, 129, Math.PI * 0.12, Math.PI * 0.88); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 20;
    g.beginPath(); g.arc(0, -18, 129, Math.PI * 1.06, Math.PI * 1.94); g.stroke();
    g.strokeStyle = PAL.line; g.lineWidth = lw * 0.6;
    circ(g, 0, -18, 118); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -18, 131, Math.PI * 1.16, Math.PI * 1.44); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 4;
    g.beginPath(); g.arc(0, -18, 131, Math.PI * 0.1, Math.PI * 0.2); g.stroke();
  }
  // 管内分层液体（俯视同心环；自外向内逐层罩画 + 弯月面环 + 可选气泡）
  const RING_COLS = [
    'rgba(125,155,255,0.16)', 'rgba(34,81,255,0.10)', 'rgba(125,155,255,0.24)',
    'rgba(18,51,184,0.10)', 'rgba(34,81,255,0.20)', 'rgba(18,51,184,0.16)',
  ];
  function ringsOn(g, rng, bounds, opts = {}) {
    const cols = opts.cols || RING_COLS;
    for (let i = 0; i < bounds.length; i++) {
      circ(g, 0, -18, bounds[i]);
      g.fillStyle = cols[(i + (opts.shift || 0)) % cols.length]; g.fill();
    }
    g.strokeStyle = 'rgba(18,51,184,0.30)'; g.lineWidth = 1.4;
    for (const r of bounds) { circ(g, 0, -18, r); g.stroke(); }
    if (opts.bubbles) {
      for (let i = 0; i < 6; i++) {
        const a = rng() * TAU, d = 16 + rng() * 82;
        const bx = Math.cos(a) * d, by = -18 + Math.sin(a) * d, br = 1.8 + rng() * 2.6;
        circ(g, bx, by, br);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
        g.strokeStyle = 'rgba(18,51,184,0.25)'; g.lineWidth = 0.8; g.stroke();
      }
    }
  }
  // 软木塞盘（俯视：ink 阶 speckle + 木纹短弧；封面 A 不走真实材质豁免，保持电蓝/墨纪律）
  function corkOn(g, rng) {
    circ(g, 0, -18, 118); g.fillStyle = PAL.hi; g.fill();
    g.strokeStyle = 'rgba(5,28,44,0.05)'; g.lineWidth = 12;
    circ(g, 0, -18, 111); g.stroke();
    for (let i = 0; i < 90; i++) {
      const a = rng() * TAU, d = Math.sqrt(rng()) * 112;
      circ(g, Math.cos(a) * d, -18 + Math.sin(a) * d, 0.9 + rng() * 1.9);
      g.fillStyle = `rgba(5,28,44,${(0.06 + rng() * 0.14).toFixed(3)})`; g.fill();
    }
    g.strokeStyle = 'rgba(66,86,106,0.30)'; g.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const a = rng() * TAU, d = 26 + rng() * 80, s = rng() * TAU, span = 0.25 + rng() * 0.45;
      g.beginPath(); g.arc(Math.cos(a) * d * 0.3, -18 + Math.sin(a) * d * 0.3, d, s, s + span); g.stroke();
    }
    g.strokeStyle = 'rgba(66,86,106,0.6)'; g.lineWidth = 2;
    circ(g, 0, -18, 118); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -18, 84, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  }
  // 标签条 arc band（俯视标签的沿壁可读化：底部弧带 + 电蓝抽象字线）
  function arcBandOn(g, lw) {
    const a0 = Math.PI * 0.26, a1 = Math.PI * 0.74;
    g.beginPath(); g.arc(0, -18, 114, a0, a1); g.arc(0, -18, 97, a1, a0, true); g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill();
    g.strokeStyle = 'rgba(5,28,44,0.38)'; g.lineWidth = lw * 0.45; g.stroke();
    g.strokeStyle = 'rgba(34,81,255,0.4)'; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -18, 105.5, a0 + 0.12, a1 - 0.12); g.stroke();
  }
  // 刻度线（放射 ticks，蚀刻在玻璃唇缘内侧 → 实验器皿识别锚点）
  function ticksOn(g, dense) {
    const n = dense ? 48 : 30, stepM = dense ? 8 : 5;
    g.save(); g.lineCap = 'butt';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + 0.06, major = i % stepM === 0;
      const r1 = 117, r2 = major ? 104 : 111;
      g.strokeStyle = major ? 'rgba(66,86,106,0.85)' : 'rgba(66,86,106,0.5)';
      g.lineWidth = major ? 1.8 : 1.2;
      g.beginPath();
      g.moveTo(Math.cos(a) * r1, -18 + Math.sin(a) * r1);
      g.lineTo(Math.cos(a) * r2, -18 + Math.sin(a) * r2);
      g.stroke();
    }
    g.restore();
  }

  /* 整管 10 变体（换行业必须换纹理：此处 = 分层液体同心环 / 软木塞盘 / 标签条 / 刻度线） */
  function tubeOn(g, v, rng, lw) {
    shadowOn(g);
    const hasTag = v !== 3 && v !== 4 && v !== 7;
    if (hasTag) tagOn(g, v === 0, lw);
    glassBaseOn(g, lw);
    g.save(); circ(g, 0, -18, 118); g.clip();
    if (v === 2 || v === 4 || v === 7) {
      corkOn(g, rng);
    } else {
      switch (v) {
        case 0: ringsOn(g, rng, [118, 94, 72, 52, 34, 18], { bubbles: true }); break;
        case 1: ringsOn(g, rng, [118, 92, 66, 42], {}); break;
        case 3: ringsOn(g, rng, [118, 102, 86, 70, 55, 41, 28, 16], { bubbles: true, shift: 2 }); break;
        case 5: ringsOn(g, rng, [118, 92, 66, 42], { shift: 3 }); break;
        case 6: ringsOn(g, rng, [118, 96, 74, 54, 36, 20], { bubbles: true, shift: 1 }); break;
        case 8: // 沉淀深芯（验证留痕沉积）
          ringsOn(g, rng, [118, 94, 70, 46], { cols: ['rgba(125,155,255,0.14)', 'rgba(34,81,255,0.10)', 'rgba(125,155,255,0.20)', 'rgba(18,51,184,0.34)'] }); break;
        default: ringsOn(g, rng, [118, 84], {}); break;   // v9 单弯月面
      }
    }
    g.restore();
    if (v === 4 || v === 5 || v === 9) arcBandOn(g, lw);
    if (v === 0 || v === 1 || v === 5 || v === 6 || v === 8) ticksOn(g, v === 6);
    glassGlazeOn(g, lw);
    if (hasTag) stringOn(g, lw);
  }

  /* 活画一个样本管格（大尺寸用；矢量，永远清晰）。cx,cy 屏幕中心。 */
  function drawTileArt(cx, cy, size, variant, seed) {
    tubeTransform(cx - size / 2, cy - size / 2, size);
    tubeOn(ctx, variant, makeRng(seed), 3);
    ctx.restore();
  }

  /* ── 10 张预渲染纹理 tile（512px；含俯视 mask：玻璃环 + 吊牌 + 分层/软木塞） ── */
  const TILE_N = 10, TILE_PX = 512;
  let tiles = [];
  function makeTiles() {
    tiles = [];
    for (let v = 0; v < TILE_N; v++) {
      const c = document.createElement('canvas'); c.width = c.height = TILE_PX;
      const g = c.getContext('2d');
      const u = TILE_PX / FOOT;
      g.save(); g.translate(TILE_PX / 2, TILE_PX / 2); g.scale(u, u); g.translate(-FOOT_CX, -FOOT_CY);
      tubeOn(g, v, makeRng(ROOT_SEED + v * 7919), 3);
      g.restore();
      tiles.push(c);
    }
  }

  /* ═══ 主原子：当前样本管（活画详版 + 中心留痕行 + 下钻热区） ═══ */
  function drawHero(cx, cy, size, alpha) {
    const u = size / FOOT;
    const px = lx => cx + (lx - FOOT_CX) * u, py = ly => cy + (ly - FOOT_CY) * u;
    const zone = (lx0, ly0, lx1, ly1, d) => zones.push({ x0: px(lx0), y0: py(ly0), x1: px(lx1), y1: py(ly1), d });

    // ① 整管通用下钻（先入队，详细热区后入队、反向命中时优先）
    zone(-150, -172, 152, 180, {
      title: '当前样本管 · 候选版本',
      value: '隔离试验样本',
      sub: '相机持续拉远：这支样本管（及其阵列）正精确缩成上一层试管架阵列的中心格；中心格永远留给上一层递归，旁格不占位。样本管为视觉隐喻：能力改进先在隔离环境做成"样本"，三道检验与闸门通过后才谈审批与受控运行。',
      source: srcTag(),
    });

    ctx.save(); ctx.globalAlpha *= alpha;
    tubeTransform(cx - size / 2, cy - size / 2, size);
    tubeOn(ctx, 0, makeRng(ROOT_SEED ^ 0x51c1), 3);

    // ② 管内中心留痕行（mono；结构性计数 3 检验 / 3 出口 / ≥8 字段，来自 dossier）
    if (!NOTEXT) {
      const halo = (s, x, y, font, fill) => {
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper;
        ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y);
      };
      halo('隔离试验样本', 0, -46, `700 14px ${MONO}`, BLUE_D);
      halo('回放 · 留出 · 审查 → 闸门', 0, -24, `400 10.5px ${MONO}`, PAL.inkMd);
      halo('审批 3 出口 · 试验记录 ≥8 字段', 0, -4, `400 10.5px ${MONO}`, PAL.inkMd);
    }
    ctx.restore();   // tubeTransform 的 save
    ctx.restore();   // alpha 的 save

    // ③ 玻璃唇缘（隔离环境）热区
    zone(-110, -162, 110, -94, {
      title: '玻璃管壁 · 隔离环境',
      value: '隔离验证',
      sub: '缺口假设与修改先在隔离环境验证：历史回放、留出案例、版本对比与审计的工程实现待企业验证（§8）；管壁 = 隔离边界（视觉隐喻）。未通过闸门：回到诊断与现实补全，不进入审批。',
      source: srcTag(),
    });
    // ④ 管内分层（三道检验留痕 + 试验记录字段）热区
    zone(-82, -56, 82, 6, {
      title: '管内分层 · 三道检验留痕',
      value: '回放 · 留出 · 审查',
      sub: `${gatesBasis}；过隔离验证闸门才允许向管理层提交改进申请。试验记录至少 8 字段：${trialBasis}。分层 = 留痕纹理（视觉隐喻），不设评测成绩数字。`,
      source: `${srcTag()} · ${srcTagK3()}`,
    });
    // ⑤ 管身标签（候选版本；不设版本号）热区
    zone(-112, 120, -16, 182, {
      title: '管身标签 · 候选版本',
      value: '候选 Agent 能力版本',
      sub: `管理审批批准后形成候选 Agent 能力版本，回 01 在批准范围内受控真实运行；暂缓与驳回都保留原始记录。候选版本不设版本号——${verUnknown}，待企业验证（§8）。${branchB4 ? '进入本回路的线索只来自人工核实分支 B4（' + branchB4.name + '）。' : ''}`,
      source: srcTag(),
    });
  }

  /* ═══ 递归渲染（引擎移植 01：出生窗口收在本周期 ringLevel+0.05 → +0.75，
         φ≈0.75 起全场 9 块齐生；φ→1 时 9 块全部 settled，与下一周期 φ=0 严格同帧 → 无缝；
         接缝的紧凑簇 = "缩成上一层中心格"的节拍点，随后新一圈在外场诞生（BFS 螺旋）） ═══ */
  function birthP(p, ringLevel, idx) {
    const start = ringLevel + 0.05 + idx * 0.04;
    return clamp((p - start) / 0.42, 0, 1);
  }
  const flashCurve = bp => Math.pow(Math.max(0, Math.sin(Math.PI * bp)), 1.6);

  function drawFlash(x, y, size, f) {   // 圆形电蓝闪光（禁波浪冲击环：BFS 出生序本身就是波）
    ctx.save();
    const r = size / 2 - 2;
    circ(ctx, x, y, r);
    ctx.fillStyle = `rgba(34,81,255,${(0.22 * f).toFixed(3)})`; ctx.fill();
    ctx.strokeStyle = `rgba(125,155,255,${(0.5 * f).toFixed(3)})`; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = `rgba(34,81,255,${(0.85 * f).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }

  function drawNode(cx, cy, size, level, alpha, lineage, seed, p) {
    if (alpha <= 0.01 || size < MIN_PX) return;
    if (cx + size / 2 < -60 || cx - size / 2 > view.w + 60 || cy + size / 2 < -60 || cy - size / 2 > view.h + 60) return;
    if (level === 0) { drawLeaf(cx, cy, size, alpha, lineage, seed); return; }
    // 下钻热区（先于子格入队 → 更深/更小的格优先命中）：
    //  · 血缘原子节点（level === 当前循环层 L）：「当前样本管」专属下钻——血缘叶格
    //    缩到 <ZONE_PX 后，当前原子仍必须可点（铁律：关键元素必须可下钻）；
    //  · 非血缘 level-1/2 阵列块：「能力库 · 一格」通用下钻。
    const atomLv = Math.floor(p);
    if (size >= ZONE_PX && alpha > 0.5 && ((lineage && level === atomLv) || (!lineage && level >= 1 && level <= atomLv + 1))) {
      zones.push({
        x0: cx - size * 0.47, y0: cy - size * 0.47, x1: cx + size * 0.47, y1: cy + size * 0.47,
        d: lineage ? {
          title: '当前样本管 · 候选版本',
          value: '隔离试验样本',
          sub: '相机持续拉远：这支样本管（及其阵列）正精确缩成上一层试管架阵列的中心格；中心格永远留给上一层递归，旁格不占位。',
          source: srcTag(),
        } : {
          title: '能力库 · 一格',
          value: '样本管（库位示意）',
          sub: '每一项验证过的改进，都是能力库中的一格——沉淀，一路向上。旁格为能力库纹理示意，不设虚构版本号：能力版本库与旧版本退役规则为待企业验证项（§8）。',
          source: srcTag(),
        },
      });
    }
    const cs = size / R, pitch = cs / FILL;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      const isC = di === 0 && dj === 0;
      let a = alpha, bp = 1;
      if (!isC) {
        bp = birthP(p, level - 1, ringIdx(di, dj));
        if (bp <= 0) continue;                       // 尚未诞生（未来层）→ 不画
        a = alpha * Math.min(1, bp * 3.2);
      }
      const childSeed = hashSeed(seed, di, dj, level);
      const nx = cx + di * pitch, ny = cy + dj * pitch;
      drawNode(nx, ny, cs, level - 1, a, lineage && isC, childSeed, p);
      if (!isC && bp < 1) { const f = flashCurve(bp); if (f > 0.02) drawFlash(nx, ny, cs, f); }
    }
  }

  function drawLeaf(cx, cy, size, alpha, lineage, seed) {
    // 整格热区必须先于绘制入队：drawHero 的细部热区（唇缘/分层/标签）
    // 后入队、反向命中时优先——否则整格血缘区会吞掉全部细部下钻。
    if (size >= ZONE_PX) {
      zones.push({
        x0: cx - size * 0.47, y0: cy - size * 0.47, x1: cx + size * 0.47, y1: cy + size * 0.47,
        d: lineage ? {
          title: '当前样本管 · 候选版本',
          value: '隔离试验样本',
          sub: '相机持续拉远：这支样本管正精确缩成上一层试管架阵列的中心格；中心格永远留给上一层递归，旁格不占位。',
          source: srcTag(),
        } : {
          title: '能力库 · 一格',
          value: '样本管（库位示意）',
          sub: '每一项验证过的改进，都是能力库中的一格——沉淀，一路向上。旁格为能力库纹理示意，不设虚构版本号：能力版本库与旧版本退役规则为待企业验证项（§8）。',
          source: srcTag(),
        },
      });
    }
    if (size >= LIVE_PX) {
      if (lineage) drawHero(cx, cy, size, alpha);    // 唯一带「候选版本」标签的详版主原子
      else drawTileArt(cx, cy, size, 1 + (seed % (TILE_N - 1)), seed);
    } else {
      ctx.save(); ctx.globalAlpha *= alpha;
      ctx.drawImage(tiles[lineage ? 0 : 1 + (seed % (TILE_N - 1))], cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
    }
  }

  /* ═══ 取景框 / 洗版 / caption ═══ */
  const sstep = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function drawViewfinder(x, y, s, o) {
    const arm = clamp(s * 0.17, 10, 26);
    ctx.save();
    ctx.strokeStyle = `rgba(34,81,255,${o.toFixed(3)})`; ctx.lineWidth = 2; ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(x, y + arm); ctx.lineTo(x, y); ctx.lineTo(x + arm, y);
    ctx.moveTo(x + s - arm, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s, y + arm);
    ctx.moveTo(x + s, y + s - arm); ctx.lineTo(x + s, y + s); ctx.lineTo(x + s - arm, y + s);
    ctx.moveTo(x + arm, y + s); ctx.lineTo(x, y + s); ctx.lineTo(x, y + s - arm);
    ctx.stroke();
    ctx.restore();
  }

  /* caption 防碰撞：canvas 高 = cover 内容高（可超 100vh），封面 DOM 底部元素
     （chips/anchor/mode/scroll-hint）在窄宽时会伸进 caption 默认带（h−78…h−12）。
     量测这些 DOM rect（canvas 坐标，缓存于 measureCoverText）；默认三行块与任一
     DOM rect 相交时降级为「单行结论句」并锚在 mode 顶上方 14px（仍撞则继续上移），
     被省略的读法/来源行全文保留在 caption drill 中（截断全文进 drill）。 */
  function lineRect(x, y, wdt, fs) { return { x0: x - wdt - 8, y0: y - fs - 4, x1: x + 4, y1: y + 5 }; }
  const rectsHit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  function drawCaption(w, h) {
    const x = w - 26;
    const narrow = w < 900;
    const L1f = '每一项验证过的改进，都是能力库中的一格——沉淀，一路向上';
    const L1n = '每一项验证过的改进，都是能力库中的一格。';
    const L2 = '相机持续拉远 · 12 秒/层 · 蓝色取景框 = 当前样本管 · 新格按 BFS 出生 · 点击样本管与标签下钻';
    const L3 = narrow ? `SOURCE · K1 · ${srcDate('K1', '2026-07-23 定稿')}`
                      : `SOURCE · ${srcTag()} · 阵列 = 能力库 · 旁格为纹理示意`;
    const f1n = `italic 400 15px ${SERIF}`, f2n = `400 10px ${MONO}`;
    const maxW = Math.min(w * 0.62, 600);
    const l1f = trunc(L1f, maxW, f1n), l1n = trunc(L1n, maxW, f1n);
    const l2 = trunc(narrow ? '点击样本管与标签下钻 · 12 秒/层' : L2, maxW, f2n);
    const l3 = trunc(L3, maxW, f2n);
    ctx.save(); ctx.font = f1n;
    const w1f = ctx.measureText(l1f).width, w1n = ctx.measureText(l1n).width;
    ctx.font = f2n;
    const w2 = ctx.measureText(l2).width, w3 = ctx.measureText(l3).width;
    ctx.restore();
    const dom = (textCol && textCol.dom) || {};
    const domList = [dom.mode, dom.anchor, dom.chips, dom.hint].filter(Boolean);

    // 默认三行（y 锚 h−26）；与 DOM 底带任一 rect 相交 → 紧凑单行
    const fullBlock = { x0: x - Math.max(w1f, w2, w3) - 8, y0: h - 78, x1: x + 4, y1: h - 12 };
    let compact = domList.some(r => rectsHit(fullBlock, r));
    let lines, yB;
    if (!compact) {
      lines = [[narrow ? l1n : l1f, 15, f1n, PAL.ink], [l2, 10, f2n, PAL.inkLo], [l3, 10, f2n, PAL.inkLo]];
      yB = h - 26;
      // 逐行复核（块级相交可能由行间距空白引起）
      const rs = lines.map(([s, fs], i) => lineRect(x, yB - 36 + i * 20, ctx.measureText ? [w1f, w2, w3][i] : 0, fs));
      if (!domList.some(r => rs.some(q => rectsHit(q, r)))) {
        // 无碰撞：画右下径向白垫底 + 三行
      } else compact = true;
    }
    if (compact) {
      const l1 = w < 1200 ? l1n : l1f, w1 = w < 1200 ? w1n : w1f;
      yB = dom.mode ? dom.mode.y0 - 18 : h - 26;
      // 仍撞 anchor/chips/hint → 继续上移到碰撞 rect 顶上方
      for (let guard = 0; guard < 4; guard++) {
        const q = lineRect(x, yB, w1, 15);
        const hit = domList.find(r => rectsHit(q, r));
        if (!hit || yB < 80) break;
        yB = Math.min(yB, hit.y0 - 18);
      }
      lines = [[l1, 15, f1n, PAL.ink]];
    }
    const yOf = i => compact ? yB : yB - 36 + i * 20;

    // 右下白色径向垫底：满场格阵可能伸到 caption 下方，先保证文字区干净
    const padCx = x - 124, padCy = yOf(lines.length - 1) + 4;
    const gb = ctx.createRadialGradient(padCx, padCy, 20, padCx, padCy, 360);
    gb.addColorStop(0, 'rgba(255,255,255,0.94)'); gb.addColorStop(0.55, 'rgba(255,255,255,0.82)');
    gb.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gb; ctx.fillRect(x - 534, padCy - 370, 560, 400);

    lines.forEach(([s, fs, f, c], i) => txt(s, x, yOf(i), f, c, 'right', 4));
    if (!NOTEXT) {
      const last = lines[lines.length - 1][0];
      ctx.save(); ctx.font = f1n; const wL1 = ctx.measureText(lines[0][0]).width;
      ctx.font = f2n; const wLast = ctx.measureText(last).width; ctx.restore();
      zones.push({   // 热区贴合实际文字墨区（上 fs+6 / 下 6），不吃 DOM 底带
        x0: x - Math.max(wL1, wLast) - 8, y0: yOf(0) - (lines[0][1] + 6), x1: w - 4, y1: yOf(lines.length - 1) + 6,
        d: {
          title: '封面 A · 样本递归',
          value: '沉淀，一路向上',
          sub: `相机持续拉远：当前样本管精确缩成上一层试管架阵列的中心格，新一圈样本管按 BFS 出生序（自中心向外螺旋）携电蓝闪光诞生；12 秒/层无缝循环。阵列 = 能力库：每一项验证过的改进，都是库中的一格。${compact ? '（窄宽时读法/来源行收起：' + l2 + ' · ' + l3 + '）' : ''}`,
          source: srcTag(),
        },
      });
    }
  }

  /* ═══ 帧渲染 ═══ */
  /* 左文列实测：格阵不得压字。canvas 与 #cover 同原点，
     文字元素 viewport 坐标 − host rect = 画布坐标。缓存量测，refit/字体就绪时重测。
     注意：无 max-width 的块级元素（kicker/sub/title）盒宽会撑满整列，
     必须测「文本实际宽度」而非块盒宽（沿 01 轮次 3 调试实录）。 */
  let textCol = null;
  const GEOM = { Cx: 0, S0: 0, textRight: 0 };          // 只读几何探针（QA 用）
  function measureCoverText() {
    const r = host.getBoundingClientRect();
    if (r.width < 2) return;
    const tc = { right: 0, titleRight: 0, titleBottom: 0 };
    const g2d = measureCoverText._g || (measureCoverText._g = document.createElement('canvas').getContext('2d'));
    const textW = el => {
      const cs = getComputedStyle(el);
      g2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      let w = 0;
      for (const s of (el.innerText || '').split('\n')) w = Math.max(w, g2d.measureText(s).width);
      return w;
    };
    ['.cover-kicker', '.cover-sub', '.cover-lede', '.cover-anchor'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const b = el.getBoundingClientRect();
      const wEff = Math.min(b.width, textW(el) + 2);      // 文本宽与盒宽取小（lede/anchor 盒=文本）
      tc.right = Math.max(tc.right, b.left - r.left + wEff);
    });
    const t = document.querySelector('.cover-title');
    if (t) {
      const b = t.getBoundingClientRect();
      tc.titleBottom = b.bottom - r.top;
      tc.titleRight = b.left - r.left + Math.min(b.width, textW(t) + 2);
    }
    // 封面 DOM 底带 rect（canvas 坐标）：caption 防碰撞用
    tc.dom = {};
    [['mode', '.cover-mode'], ['anchor', '.cover-anchor'], ['chips', '.cover-chips'], ['hint', '.scroll-hint']].forEach(([k, sel]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const b = el.getBoundingClientRect();
      if (b.width < 2) return;
      tc.dom[k] = { x0: b.left - r.left, y0: b.top - r.top, x1: b.right - r.left, y1: b.bottom - r.top };
    });
    if (tc.right > 0) textCol = tc;
  }

  function render(p, masterA) {
    const w = view.w, h = view.h;
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalAlpha = masterA;
    const L = Math.max(0, Math.floor(p)), phi = p - L;
    const tc = textCol || { right: Math.min(664, w * 0.8), titleRight: Math.min(664, w * 0.8), titleBottom: h * 0.3 };
    /* 主原子 S0/Cx：左缘必须让开实测文字列右缘（gap 26），右缘留 10px 边；
       空间不足时缩 S0（floor 150） */
    let S0 = clamp(Math.min(w, h) * 0.36, 200, 430);
    const avail = w - 10 - (tc.right + 26);
    if (S0 > avail) S0 = Math.max(150, avail);
    const Cx = clamp(Math.max(w * 0.615, tc.right + 26 + S0 * 0.5), w * 0.5, w - 10 - S0 * 0.5);
    const Cy = h * 0.47;   // 主原子底部避开封面 DOM chips 行
    GEOM.Cx = Cx; GEOM.S0 = S0; GEOM.textRight = tc.right;   // QA 探针：格阵/文字列几何
    zones.length = 0;

    drawNode(Cx, Cy, S0 * Math.pow(R, 2 - phi), L + 2, 1, true, ROOT_SEED, p);

    // 边缘渐隐（保持中心聚焦；外场淡出）
    const g2 = ctx.createRadialGradient(Cx, Cy, Math.min(w, h) * 0.40, Cx, Cy, Math.max(w, h) * 0.92);
    g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(255,255,255,0.66)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

    // 左侧 0→0.62W 白色渐变 wash（COVER.md §2：保住标题可读性；前段更陡，文字尾部区保持高遮盖）
    const gw = ctx.createLinearGradient(0, 0, w * 0.62, 0);
    gw.addColorStop(0, 'rgba(255,255,255,0.98)'); gw.addColorStop(0.5, 'rgba(255,255,255,0.94)');
    gw.addColorStop(0.8, 'rgba(255,255,255,0.60)'); gw.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gw; ctx.fillRect(0, 0, w * 0.62, h);

    // 标题带加强洗版：只压标题区矩形，x 尽头收在主原子左缘之前 → 不白化主原子与标签
    if (!NOTEXT && tc.titleBottom > 0) {
      const bandX1 = Math.min(tc.titleRight + 60, Cx - S0 * 0.5 - 14);
      if (bandX1 > 220) {
        const bandY1 = tc.titleBottom + 30;
        const hold = clamp((tc.titleRight - 10) / bandX1, 0.3, 0.92);
        const gx = ctx.createLinearGradient(0, 0, bandX1, 0);
        gx.addColorStop(0, 'rgba(255,255,255,0.96)');
        gx.addColorStop(hold, 'rgba(255,255,255,0.93)');
        gx.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gx; ctx.fillRect(0, 0, bandX1, bandY1);
        // 下缘 60px 羽化（同一 x 渐变的衰减版，避免硬切）
        const gbf = ctx.createLinearGradient(0, 0, bandX1, 0);
        gbf.addColorStop(0, 'rgba(255,255,255,0.42)');
        gbf.addColorStop(hold, 'rgba(255,255,255,0.36)');
        gbf.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gbf; ctx.fillRect(0, bandY1, bandX1, 60);
      }
    }

    // 蓝色四角取景框：跟踪当前原子（透明度只随相位变化，禁时间闪烁）
    const sA = S0 * Math.pow(R, -phi);
    const vo = REDUCED ? 1 : sstep(phi, 0.03, 0.17) * (1 - sstep(phi, 0.74, 0.95));
    if (vo > 0.01) drawViewfinder(Cx - sA / 2 - 10, Cy - sA / 2 - 10, sA + 20, vo);

    drawCaption(w, h);
    ctx.restore();
  }

  /* ═══ 主循环（tAcc 只在可见且激活时累计；display:none 恢复自动 refit） ═══ */
  let active = true, inView = true, started = false, startMs = 0;
  let tAcc = 0, lastTs = 0, cw = -1, ch2 = -1, reducedTick = 0;
  const coverEl = document.getElementById('cover') || host.parentElement;

  function frame(ts) {
    requestAnimationFrame(frame);
    const r = host.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { lastTs = ts; return; }        // display:none：跳过绘制
    if (Math.abs(r.width - cw) > 0.5 || Math.abs(r.height - ch2) > 0.5) { // 尺寸变化（含隐藏→激活）：refit
      cw = r.width; ch2 = r.height; view = bound.fit(); measureCoverText();
    }
    if (!active) { lastTs = ts; return; }
    if (!inView) { lastTs = ts; return; }                            // 滚出封面：停止绘制让出主线程（chips 平滑滚动保障）
    if (REDUCED) {                                                    // 静态完成帧（尺寸稳定则低频兜底重画）
      if ((reducedTick++ % 45) === 0) render(STATIC_P, 1);
      return;
    }
    const dt = Math.min(0.25, Math.max(0, (ts - lastTs) / 1000)); lastTs = ts;
    if (inView && started) tAcc += dt;
    const ent = started ? clamp((ts - startMs) / 1100, 0, 1) : 0;
    const masterA = ent * ent * (3 - 2 * ent);
    if (masterA <= 0.001) return;
    const p = tAcc / LAYER_T - 0.045 * (1 - masterA);                  // 入场轻推近
    render(Math.max(0, p), masterA);
  }

  /* ── 入场动画：IntersectionObserver 一次性触发（reduced-motion 直接完成帧） ── */
  if (REDUCED) {
    started = true;
  } else {
    const ioE = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting && !started) { started = true; startMs = performance.now(); ioE.disconnect(); } });
    }, { threshold: 0.12 });
    ioE.observe(coverEl);
    const ioV = new IntersectionObserver(es => { es.forEach(en => { inView = en.isIntersecting; }); }, { threshold: 0.02 });
    ioV.observe(coverEl);
  }

  /* ── 下钻交互：window 级命中测试（.cover-inner 文字层压在 canvas 上方） ── */
  const coverInnerEl = coverEl ? coverEl.querySelector('.cover-inner') : null;
  function zonesHit(x, y) {
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i];
      if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) return z;
    }
    return null;
  }
  function coverEventOK(e) {
    if (!active) return false;
    if (e.target.closest('button, a, .chip, #drill-card, summary, details')) return false;
    // 只在真空白（画布 / 结构容器）上响应；文字层一律不触发
    const t = e.target;
    if (t !== host && t !== coverEl && t !== coverInnerEl) return false;
    const r = host.getBoundingClientRect();
    if (r.width < 2) return false;
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  window.addEventListener('click', e => {
    if (!coverEventOK(e)) return;
    const z = zonesHit(e.clientX, e.clientY);
    if (z) showDrill(Object.assign({ x: e.clientX, y: e.clientY }, z.d));
  });
  let hoverRaf = 0;
  window.addEventListener('mousemove', e => {
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      let cur = '';
      if (coverEventOK(e) && zonesHit(e.clientX, e.clientY)) cur = 'pointer';
      if (coverEl) coverEl.style.cursor = cur;
    });
  }, { passive: true });

  /* ── 对外契约（供 cover-wire.js 三态切换调用；02 约定：引擎 setActive 自负 display 切换；
        display:none 恢复时自动 refit；reduced-motion 下延帧到 layout 后补静态完成帧） ── */
  window.COVER_A = {
    setActive(on) {
      active = !!on;
      host.style.display = on ? '' : 'none';
      if (on) {
        cw = -1;
        if (REDUCED) requestAnimationFrame(() => {
          const r = host.getBoundingClientRect();
          if (r.width >= 2) { cw = r.width; ch2 = r.height; view = bound.fit(); measureCoverText(); render(STATIC_P, 1); }
        });
      }
    },
    redraw() { render(REDUCED ? STATIC_P : Math.max(0, tAcc / LAYER_T), 1); },
    rebuild() { NOTEXT = !!window.__COVER_NOTEXT__; makeTiles(); cw = -1; if (REDUCED) render(STATIC_P, 1); },
    get _p() { return REDUCED ? STATIC_P : Math.max(0, tAcc / LAYER_T); },   // QA 时间核对
    get _geom() { return { Cx: GEOM.Cx, S0: GEOM.S0, textRight: GEOM.textRight }; },  // QA 几何核对
    get _zones() { return zones.map(z => ({ x0: Math.round(z.x0), y0: Math.round(z.y0), x1: Math.round(z.x1), y1: Math.round(z.y1), t: z.d.title })); },  // QA 热区核对
  };

  makeTiles();
  measureCoverText();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureCoverText(); if (REDUCED && active) render(STATIC_P, 1); });
  requestAnimationFrame(frame);
})();
