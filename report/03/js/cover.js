/* ═══════════════════════════════════════════════════════════
   cover.js · 封面 A「版图递归」引擎（模块工程师轮次，覆盖占位 stub）
   宿主：#cover-canvas（position:absolute inset:0 全屏）
   主题原子：一块「价格试点」经营地块（边界线 + 垄行纹理 + 地牌）——
   相机匀速拉远，当前地块精确缩成上一层经营版图阵列的中心格；
   阵列格按中心 BFS 出生序纳入版图（电蓝闪光）；12s/层无缝循环。
   阵列含义 = 圣农经营版图：「每一个验证过的试点，都是经营版图中的
   一块——扩域，一步一步来」。

   数据契约（只用 window.RPT 已有键，下钻文案均取自数据层）：
     RPT.keyFacts（启动参考条件 / 循环性质）· RPT.expansionCandidates
     （首选建议，方案推断标注）· RPT.cocreateSteps（N1）
   模式契约：听 'cover-mode-change'（detail.mode ∈ rec/x/w），
     非 rec 停帧；切回 rec 时 rAF 延迟重 fit()（display:none 期间
     量得 0×0 的教训）再启动。localStorage 键 rpt03-cover 与三态
     切换管理由 cover-wire.js 地基实现，本模块不碰。
   对外契约：window.COVER_A = { setActive, redraw, rebuild }。
   内容红线：无收益/成本/时间表数字；自动化词只出现于否定语境
     （本模块文案不出现）；候选顺序一律标注「方案推断，不是圣农
     批准的路线」。PAL.red 为电蓝主色；不使用 PAL.neg（无风险语义）。
   视觉纪律：禁波浪环；取景框不透明度只随相位淡出，不随时间闪烁；
     左侧 0→0.62W 白色 wash 护住文字列；canvas 文字一律纸色光晕。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas');
  if (!host) return;
  host.setAttribute('data-module', 'cover');
  host.removeAttribute('data-placeholder');
  host.setAttribute('data-engine', 'cover-recursion-a');
  const U = window.U;
  if (!U) return;
  const PAL = U.PAL, clamp = U.clamp;
  const MONO = 'Menlo,Consolas,monospace';
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const BLUE = PAL.red, BLUE_HI = PAL.redHi, BLUE_SOFT = '#7d9bff';

  /* ── 循环参数：R=3 自相似比，12s/层，起始相位取构图最完整处 ── */
  const R = 3, LAYER_S = 12, PHI0 = 0.18;
  const SRC_LINE = 'K1 · 03 业务扩域循环专题工作稿 · 2026-07-24';
  const CAPTION = '每一个验证过的试点，都是经营版图中的一块——扩域，一步一步来';
  const CAPTION_NOTE = '点击下钻 · 候选场景顺序为方案推断，不是圣农批准的路线 · K1 · 2026-07-24';

  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  const bound = U.bindCanvas(host);
  const ctx = bound.ctx;
  let W = 0, H = 0, S = 0, CX = 0, CY = 0, P0 = 0;

  function resize() {
    const m = bound.fit();
    W = m.w; H = m.h; S = Math.min(W, H);
    CX = W * 0.685; CY = H * 0.52;
    P0 = clamp(S * 0.134, 80, 190);
  }

  /* ── 8–12 张地块纹理 tile（垄行/水线/地牌/网格渠；换行业必须换纹理） ── */
  const TILE_N = 256;
  let tiles = [];
  function tileBase(c, rng) {
    c.clearRect(0, 0, TILE_N, TILE_N);
    c.strokeStyle = PAL.ink; c.globalAlpha = 0.55; c.lineWidth = 3;
    c.strokeRect(2.5, 2.5, TILE_N - 5, TILE_N - 5);           // 外田界
    c.globalAlpha = 0.20; c.lineWidth = 1.5;
    c.strokeRect(11.5, 11.5, TILE_N - 23, TILE_N - 23);       // 内双界
    c.globalAlpha = 1;
  }
  function rows(c, n, alpha, color, lw, vertical, jitter, rng) {
    c.strokeStyle = color; c.lineWidth = lw; c.globalAlpha = alpha;
    const step = (TILE_N - 36) / n;
    for (let i = 0; i < n; i++) {
      const p = 18 + step * (i + 0.5) + (jitter ? (rng() - 0.5) * jitter : 0);
      c.beginPath();
      if (vertical) { c.moveTo(p, 18); c.lineTo(p + (rng() - 0.5) * 3, TILE_N - 18); }
      else { c.moveTo(18, p); c.lineTo(TILE_N - 18, p + (rng() - 0.5) * 3); }
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  function buildTiles() {
    tiles = [];
    const defs = [
      (c, r) => rows(c, 8, 0.55, PAL.inkLo, 2, false, 2, r),                       // 垄行·横
      (c, r) => rows(c, 8, 0.55, PAL.inkLo, 2, true, 2, r),                        // 垄行·竖
      (c, r) => {                                                                // 垄行·斜
        c.strokeStyle = PAL.inkLo; c.globalAlpha = 0.5; c.lineWidth = 2;
        for (let i = -6; i < 14; i++) {
          c.beginPath(); c.moveTo(18 + i * 22, 18); c.lineTo(18 + i * 22 + 60, TILE_N - 18); c.stroke();
        }
        c.globalAlpha = 1;
      },
      (c, r) => {                                                                // 水线（灌溉）
        rows(c, 4, 0.6, BLUE_SOFT, 2.5, false, 1, r);
        rows(c, 7, 0.35, PAL.inkLo, 1.4, false, 1.5, r);
      },
      (c, r) => {                                                                // 网格渠
        c.strokeStyle = PAL.inkMd; c.globalAlpha = 0.5; c.lineWidth = 4;
        [TILE_N / 3, TILE_N * 2 / 3].forEach(p => {
          c.beginPath(); c.moveTo(p, 16); c.lineTo(p, TILE_N - 16); c.stroke();
          c.beginPath(); c.moveTo(16, p); c.lineTo(TILE_N - 16, p); c.stroke();
        });
        c.strokeStyle = BLUE_SOFT; c.globalAlpha = 0.55; c.lineWidth = 1.5;
        [TILE_N / 3, TILE_N * 2 / 3].forEach(p => {
          c.beginPath(); c.moveTo(p, 16); c.lineTo(p, TILE_N - 16); c.stroke();
          c.beginPath(); c.moveTo(16, p); c.lineTo(TILE_N - 16, p); c.stroke();
        });
        c.globalAlpha = 1;
      },
      (c, r) => {                                                                // 垄行 + 地牌
        rows(c, 7, 0.5, PAL.inkLo, 1.8, false, 2, r);
        c.fillStyle = BLUE; c.globalAlpha = 0.55;
        c.fillRect(30, 30, 48, 18);
        c.globalAlpha = 0.4; c.fillRect(30, 48, 3.5, 10);                        // 牌脚
        c.globalAlpha = 1;
      },
      (c, r) => {                                                                // 疏垄 + 单水线
        rows(c, 4, 0.5, PAL.inkLo, 2, true, 2, r);
        c.strokeStyle = BLUE_SOFT; c.globalAlpha = 0.6; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(18, TILE_N / 2); c.lineTo(TILE_N - 18, TILE_N / 2); c.stroke();
        c.globalAlpha = 1;
      },
      (c, r) => {                                                                // 田字分块（四区换向垄行）
        c.strokeStyle = PAL.inkMd; c.globalAlpha = 0.5; c.lineWidth = 3;
        c.beginPath(); c.moveTo(TILE_N / 2, 14); c.lineTo(TILE_N / 2, TILE_N - 14); c.stroke();
        c.beginPath(); c.moveTo(14, TILE_N / 2); c.lineTo(TILE_N - 14, TILE_N / 2); c.stroke();
        c.globalAlpha = 1;
        rows(c, 3, 0.4, PAL.inkLo, 1.5, false, 1, r);
      },
      (c, r) => {                                                                // 点阵苗
        c.fillStyle = PAL.inkLo; c.globalAlpha = 0.5;
        for (let y = 26; y < TILE_N - 20; y += 20) {
          const off = (Math.round(y / 20) % 2) ? 10 : 0;
          for (let x = 26; x < TILE_N - 20; x += 20) {
            c.beginPath(); c.arc(x + off, y, 2.2, 0, U.TAU); c.fill();
          }
        }
        c.globalAlpha = 1;
      },
      (c, r) => {                                                                // 边界双垄 + 竖行
        c.strokeStyle = PAL.inkMd; c.globalAlpha = 0.5; c.lineWidth = 2.5;
        c.strokeRect(20.5, 20.5, TILE_N - 41, TILE_N - 41);
        c.globalAlpha = 1;
        rows(c, 6, 0.45, PAL.inkLo, 1.8, true, 1.5, r);
      },
    ];
    defs.forEach(fn => {
      const cv = document.createElement('canvas');
      cv.width = TILE_N; cv.height = TILE_N;
      const c = cv.getContext('2d');
      const rng = U.makeRng(0x5eed + tiles.length * 977);
      tileBase(c, rng); fn(c, rng);
      tiles.push(cv);
    });
  }
  function tileFor(k, i, j) {
    let h = (k * 73856093) ^ (i * 19349663) ^ (j * 83492791);
    h = (h ^ (h >>> 13)) >>> 0;
    return tiles[h % tiles.length];
  }

  /* ── 相位带（宽度恰好一个自相似比 R，任意时刻每带恰有一层） ── */
  const uOf = p => p / S;
  const inBand = (u, a, b) => u > a && u <= b;
  // 英雄地块（当前atom）盛装不透明度：只随相位在带边淡出，不随时间闪烁
  const aDress = u => clamp(Math.min((u - 0.26) / 0.10, (0.78 - u) / 0.16), 0, 1);
  // 版图格纳入阈值：ring 由中心向外几何递降（BFS 出生序）；
  // ring 9 阈值收于带底之上（0.095S），保证出生闪光发生在阵列带内、
  // 跨入深层时不透明度两侧连续（深层顶 alpha=1 = 出生淡入完成值）
  const pApp = ring => 0.26 * S * Math.pow(0.095 / 0.26, Math.min(ring, 9) / 9);
  // 每格 ±4.5% 阈值抖动（<环间距 10.6%）：打破整环齐闪，出生呈撒点式，
  // 环序保持（BFS 中心向外不变）；哈希含层号，跨周期绝对稳定
  function pJit(k, i, j) {
    let h = (k * 2654435761) ^ (i * 974634211) ^ (j * 622001983);
    h = (h ^ (h >>> 11)) >>> 0;
    return ((h % 1000) / 1000 - 0.5) * 0.09;
  }
  // 外缘格（ring>9）：阈值撒于带底小区间 [0.088,0.095]S，破齐闪；
  // 峰值随环号衰减——叙事闪光集中在近中心环，外缘只读作"版图填入"
  const paOf = (k, i, j, ring) => {
    if (ring > 9) {
      let h = (k * 2654435761) ^ (i * 974634211) ^ (j * 622001983);
      h = (h ^ (h >>> 11)) >>> 0;
      return (0.088 + 0.007 * ((h % 1000) / 1000)) * S;
    }
    return pApp(ring) * (1 + pJit(k, i, j));
  };
  const faPeak = ring => 0.28 * clamp(1.15 - ring * 0.09, 0.3, 1);

  /* ── 命中区（每帧重记） ── */
  let hits = { hero: null, cells: [], caption: null };
  const inRect = (x, y, r) => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

  /* ── 绘制 ── */
  let gAlpha = 0; // 入场总不透明度（IO 入场一次，由 0 渐入）
  function draw(phi) {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    hits = { hero: null, cells: [], caption: null };

    // 当前盛装层（英雄地块所在层，任意相位恰好一个）
    const log3 = Math.log(3);
    const heroK = Math.ceil(phi + Math.log(0.26 * S / P0) / log3);
    const heroP = P0 * Math.pow(R, heroK - phi);
    const heroU = uOf(heroP), aD = aDress(heroU);
    const heroRect = { x: CX - heroP / 2, y: CY - heroP / 2, w: heroP, h: heroP };

    const kTop = Math.floor(phi + Math.log(2.34 * S / P0) / log3);
    const kBot = Math.ceil(phi + Math.log(26 / P0) / log3);

    let winRect = null; // 递归开窗链：英雄格中心一路向下
    const chainMin = 44;

    for (let k = kTop; k >= kBot; k--) {
      const p = P0 * Math.pow(R, k - phi);
      const u = uOf(p);
      if (u > 2.34 || p < 26) continue;
      const gap = Math.max(1.5, p * 0.045);
      const iMin = Math.floor((0 - CX) / p - 0.5), iMax = Math.ceil((W - CX) / p + 0.5);
      const jMin = Math.floor((0 - CY) / p - 0.5), jMax = Math.ceil((H - CY) / p + 0.5);
      const isHeroLvl = (k === heroK);

      for (let j = jMin; j <= jMax; j++) {
        for (let i = iMin; i <= iMax; i++) {
          const x = CX + i * p - p / 2, y = CY + j * p - p / 2;
          const rect = { x, y, w: p, h: p };
          const centerCell = (i === 0 && j === 0);

          // 英雄格身后的小层格：按盛装度连续压盖（aD 即系数，无二元开关——
          // 修复盛装淡入/淡出期"白洞"：压盖曾二元生效而本体尚不可见）
          let cA = 1;
          if (!isHeroLvl && k < heroK && aD > 0.005) {
            const inHero = x < heroRect.x + heroRect.w && x + p > heroRect.x && y < heroRect.y + heroRect.h && y + p > heroRect.y;
            if (inHero && !centerCell) {
              const inWin = winRect && x + p / 2 >= winRect.x - 0.5 && y + p / 2 >= winRect.y - 0.5 &&
                x + p / 2 <= winRect.x + winRect.w + 0.5 && y + p / 2 <= winRect.y + winRect.h + 0.5;
              if (!inWin) {
                if (aD > 0.995) continue;
                cA = 1 - aD;
              }
            }
          }

          if (centerCell && !isHeroLvl) {
            // 递归开窗：本层中心格留空，透出更深层（中心格精确留给下一层递归）
            if (p >= chainMin) {
              // 落位闪光：淡入淡出均随相位平滑（带顶淡入 0.035S，带底淡出至 0）
              const flash = inBand(u, 0.0867, 0.26)
                ? 0.35 * Math.min(clamp((0.26 * S - p) / (0.035 * S), 0, 1), clamp((u - 0.0867) / 0.14, 0, 1))
                : 0;
              // 窗口线宽不透明度跨带连续（巨层侧随尺度渐出，近链尾渐隐）
              const wAlpha = (u > 0.78 ? 0.42 * clamp((2.34 - u) / 1.56, 0, 1) : 0.42) * clamp((p - chainMin) / 30, 0, 1);
              ctx.globalAlpha = (wAlpha + flash * 0.5) * gAlpha;
              ctx.strokeStyle = flash > 0.12 ? BLUE : PAL.ink;
              ctx.lineWidth = flash > 0.12 ? 1.8 : 1.2;
              ctx.strokeRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
              if (flash > 0.02) { // 英雄落位闪光：电蓝淡染，相位驱动
                ctx.globalAlpha = flash * 0.10 * gAlpha;
                ctx.fillStyle = BLUE;
                ctx.fillRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
              }
              // 开窗链只在英雄格内部向下传递（巨层窗口不得污染抑制区）
              if (aD <= 0.02 || k < heroK) {
                winRect = { x: x + gap / 2, y: y + gap / 2, w: p - gap, h: p - gap };
              }
            } else {
              // 递归核：链尽头一点（淡入淡出均随尺度，无跳变）
              const dotA = 0.5 * clamp((chainMin - p) / 8, 0, 1) * clamp((p - 26) / 6, 0, 1);
              if (dotA > 0.01) {
                ctx.globalAlpha = dotA * gAlpha; ctx.fillStyle = BLUE;
                ctx.beginPath(); ctx.arc(CX, CY, 2, 0, U.TAU); ctx.fill();
              }
            }
            continue;
          }

          if (u > 0.78) { // 巨层：只给极淡大格结构
            ctx.globalAlpha = 0.05 * clamp((2.34 - u) / 1.56, 0, 1) * gAlpha;
            ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1;
            ctx.strokeRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
            continue;
          }

          if (isHeroLvl) { // 盛装层兄弟格：未纳入版图的虚线轮廓；中心格即英雄地块本体
            if (centerCell) {
              // 英雄本体在层序内绘制：更深层内容随后只落在其中心开窗链上
              if (aD > 0.02) drawHeroBody(heroRect, heroP, aD);
              continue;
            }
            // 虚线不透明度跨带连续：与巨层 0.05 在 u=0.78 处相接
            ctx.globalAlpha = (0.05 + 0.25 * clamp((0.78 - u) / 0.14, 0, 1)) * gAlpha;
            ctx.strokeStyle = PAL.inkMd; ctx.lineWidth = 1.2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
            ctx.setLineDash([]);
            continue;
          }

          if (inBand(u, 0.26, 0.78)) continue; // 非中心盛装层格已由上面分支处理

          const ring = Math.max(Math.abs(i), Math.abs(j));
          if (inBand(u, 0.0867, 0.26)) { // 版图阵列带：按 BFS 出生序纳入（带阈值抖动）
            const pa = paOf(k, i, j, ring);
            if (p > pa) { // 未出生：虚线规划格（带顶与盛装层虚线 0.30 相接，向深处渐淡）
              ctx.globalAlpha = (0.20 + 0.10 * clamp((u - 0.22) / 0.04, 0, 1)) * cA * gAlpha;
              ctx.strokeStyle = PAL.inkMd; ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
              ctx.setLineDash([]);
              continue;
            }
            const fx = (pa - p) / pa;
            // 实体格淡入：出生瞬与虚线视觉量相近，fx 0.04 内淡入至满
            drawTileCell(k, i, j, x + gap / 2, y + gap / 2, p - gap, (0.25 + 0.75 * clamp(fx / 0.04, 0, 1)) * cA);
            // 出生闪光：每格每周期严格一次，峰值随环号衰减、快速衰减（禁整环齐闪）；
            // 填充强度随格尺寸缩放——大格只闪电蓝边线，避免整片暗蓝脉冲
            if (fx < 0.2) {
              const fa = faPeak(ring) * Math.exp(-fx * 16);
              if (fa > 0.01) {
                ctx.globalAlpha = fa * clamp(1.5 - p / 150, 0.22, 1) * cA * gAlpha; ctx.fillStyle = BLUE;
                ctx.fillRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
                ctx.globalAlpha = Math.min(1, fa * 2.2) * cA * gAlpha;
                ctx.strokeStyle = BLUE; ctx.lineWidth = 1.4;
                ctx.strokeRect(x + gap / 2, y + gap / 2, p - gap, p - gap);
              }
            }
            if (p > 44 && cA > 0.5 && hits.cells.length < 500) hits.cells.push({ x, y, w: p, h: p, ring, k, i, j });
            continue;
          }

          // 深层：已纳入的小格，随尺度渐隐至 cutoff 恰为 0（无层消失跳变）
          const da = clamp((p - 26) / (0.0867 * S - 26), 0, 1);
          drawTileCell(k, i, j, x + gap / 2, y + gap / 2, p - gap, da * cA);
        }
      }
    }

    // ── 取景框置顶（不被更深层小格压盖）；英雄本体已随层序绘制 ──
    if (aD > 0.02) drawFinder(heroRect, heroP, aD);

    // ── 左侧 0→0.62W 白色 wash（护文字列） ──
    const wash = ctx.createLinearGradient(0, 0, W * 0.62, 0);
    wash.addColorStop(0, 'rgba(255,255,255,0.96)');
    wash.addColorStop(0.55, 'rgba(255,255,255,0.72)');
    wash.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W * 0.62, H);

    drawChrome(aD);
  }

  function drawTileCell(k, i, j, x, y, sz, alpha) {
    ctx.globalAlpha = alpha * gAlpha;
    ctx.drawImage(tileFor(k, i, j), x, y, sz, sz);
  }

  /* 英雄地块本体（随层序绘制）：边界线 + 垄行 + 水线 + 地牌「价格试点」 */
  function drawHeroBody(r, p, a) {
    const inset = Math.max(4, p * 0.04);
    // 纸底不透明度随盛装度归 0：盛装度越界熄灯时无白块跳变
    ctx.globalAlpha = 0.97 * a * gAlpha;
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(r.x, r.y, p, p);
    ctx.globalAlpha = 0.05 * a * gAlpha; ctx.fillStyle = BLUE;
    ctx.fillRect(r.x, r.y, p, p);

    // 田界双线
    ctx.globalAlpha = 0.9 * a * gAlpha; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, p, p);
    ctx.globalAlpha = 0.35 * a * gAlpha; ctx.lineWidth = 1;
    ctx.strokeRect(r.x + inset, r.y + inset, p - inset * 2, p - inset * 2);

    // 垄行（随尺度加密，保持田块肌理可读）
    const n = clamp(Math.round(p / 22), 6, 22);
    ctx.strokeStyle = PAL.inkLo; ctx.lineWidth = 1;
    const step = (p - inset * 2) / n;
    ctx.globalAlpha = 0.5 * a * gAlpha;
    for (let i = 0; i < n; i++) {
      const yy = r.y + inset + step * (i + 0.5);
      ctx.beginPath(); ctx.moveTo(r.x + inset, yy); ctx.lineTo(r.x + r.w - inset, yy); ctx.stroke();
    }
    // 水线两条
    ctx.strokeStyle = BLUE_SOFT; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.5 * a * gAlpha;
    [1 / 3, 2 / 3].forEach(f => {
      const xx = r.x + inset + (p - inset * 2) * f;
      ctx.beginPath(); ctx.moveTo(xx, r.y + inset); ctx.lineTo(xx, r.y + r.h - inset); ctx.stroke();
    });

    // 地牌「价格试点」（置于地块右上角，避开左侧文字列）
    const ph = clamp(p * 0.12, 16, 42), pw = ph * 3.4;
    const px = r.x + r.w - inset - pw - 2, py = r.y + inset + 2;
    ctx.globalAlpha = 0.92 * a * gAlpha; ctx.fillStyle = BLUE;
    ctx.fillRect(px, py, pw, ph);
    if (ph >= 19) {
      const fs = ph * 0.52;
      ctx.font = '700 ' + fs.toFixed(1) + 'px ' + MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = a * gAlpha; ctx.fillStyle = '#ffffff';
      ctx.fillText('价格试点', px + pw / 2, py + ph / 2 + fs * 0.04);
    }
  }

  /* 蓝色四角取景框（置顶；不透明度只随相位，不闪烁） */
  function drawFinder(r, p, a) {
    const gp = Math.max(10, p * 0.03), arm = clamp(p * 0.11, 14, 36);
    ctx.globalAlpha = a * gAlpha; ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
    const cs = [
      [r.x - gp, r.y - gp, 1, 1], [r.x + r.w + gp, r.y - gp, -1, 1],
      [r.x - gp, r.y + r.h + gp, 1, -1], [r.x + r.w + gp, r.y + r.h + gp, -1, -1],
    ];
    cs.forEach(([vx, vy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(vx + arm * sx, vy); ctx.lineTo(vx, vy); ctx.lineTo(vx, vy + arm * sy);
      ctx.stroke();
    });
    if (a > 0.05) hits.hero = { x: r.x - gp, y: r.y - gp, w: p + gp * 2, h: p + gp * 2 };
  }

  /* FIG 标注 + caption（canvas 文字一律纸色光晕） */
  function halo(text, x, y, font, color, alpha, align) {
    ctx.font = font; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = Math.min(1, alpha * 1.6) * gAlpha;
    ctx.strokeStyle = PAL.paper; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.globalAlpha = alpha * gAlpha; ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function drawChrome(aD) {
    halo('FIG. A · 版图递归 · 点击地块下钻', W - 16, 26, '10px ' + MONO, PAL.inkLo, 0.85, 'right');
    // 视口钳制：header 可能高于 100vh（1280×800 时 825px），caption 贴可视底边
    const capH = Math.min(H, window.innerHeight || H);
    const capFont = '11px ' + MONO, noteFont = '9.5px ' + MONO;
    halo(CAPTION, W - 16, capH - 26, capFont, PAL.inkMd, 0.95, 'right');
    halo(CAPTION_NOTE, W - 16, capH - 11, noteFont, PAL.inkLo, 0.8, 'right');
    ctx.font = capFont;
    const wCap = ctx.measureText(CAPTION).width;
    ctx.font = noteFont;
    const wNote = ctx.measureText(CAPTION_NOTE).width;
    const wMax = Math.max(wCap, wNote);
    hits.caption = { x: W - 16 - wMax - 8, y: capH - 40, w: wMax + 16, h: 40 };
  }

  /* ── 动画循环：相位 φ = 累计秒 / 12s；切模式暂停不跳相位 ── */
  let active = false, raf = 0, lastTs = 0, accS = PHI0 * LAYER_S, entered = false;
  function tick(ts) {
    if (!active) return;
    const dt = Math.min(0.1, (ts - lastTs) / 1000 || 0);
    lastTs = ts; accS += dt;
    if (entered) gAlpha = clamp(gAlpha + dt / 0.9, 0, 1);
    draw((accS / LAYER_S) % 1000);
    raf = requestAnimationFrame(tick);
  }
  function start() {
    cancelAnimationFrame(raf);
    // display:none 激活当帧量得 0×0——延迟一帧再 fit 再画
    raf = requestAnimationFrame(() => {
      resize();
      if (RM.matches) { gAlpha = 1; draw(PHI0); active = false; return; }
      active = true; lastTs = performance.now();
      raf = requestAnimationFrame(tick);
    });
  }
  function stop() { active = false; cancelAnimationFrame(raf); }

  function setActive(on) { if (on) start(); else stop(); }

  window.addEventListener('cover-mode-change', e => {
    setActive(!!(e.detail && e.detail.mode === 'rec'));
  });
  window.addEventListener('resize', () => {
    resize();
    if (!active) { gAlpha = 1; draw(PHI0); }
  });
  if (RM.addEventListener) RM.addEventListener('change', () => setActive(host.style.display !== 'none'));

  /* ── 入场（IntersectionObserver，fires once） ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(en => {
      if (en[0] && en[0].isIntersecting) { entered = true; io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(host);
  } else entered = true;

  /* ── 下钻：地块 / 版图格 / caption（K 编号 + 日期） ── */
  function drillHero(x, y) {
    const kf = (window.RPT && RPT.keyFacts) || [];
    const premise = (kf.find(f => f.label === '启动参考条件') || {}).sub || '可核验结果 / 重复运行 / 风险已说明';
    const nature = (kf.find(f => f.label === '循环性质') || {}).sub || '人主导的建议性蓝图';
    U.showDrill({
      title: '地块 · 价格试点（首个可参考结果）',
      value: '1 个已验证试点 · 3 项启动参考',
      sub: '启动参考：' + premise + '。' + nature + '。',
      source: SRC_LINE, x, y,
    });
  }
  function drillCell(x, y) {
    const cands = (window.RPT && RPT.expansionCandidates) || [];
    const first = cands.find(c => c.order === 1);
    const road = ((window.RPT && RPT.phasesRoad) || []).map(p => p.scope).join('；');
    U.showDrill({
      title: '版图格 · 经营版图中的一员',
      value: '扩域，一步一步来',
      sub: '首选建议：' + (first ? first.scenario : '渠道库存与动销协同') +
        '（顺序为方案推断，不是圣农批准的路线）。分阶段方向：' + road + '。',
      source: SRC_LINE, x, y,
    });
  }
  function drillCaption(x, y) {
    U.showDrill({
      title: '封面 A · 版图递归',
      value: CAPTION,
      sub: '相机匀速拉远：当前地块精确缩成上一层经营版图阵列的中心格，新一层版图格按中心 BFS 出生序纳入。候选场景顺序是方案推断，不是圣农批准的路线。',
      source: SRC_LINE, x, y,
    });
  }

  /* 画布在 .cover-inner（z-index:2，无 pointer-events 处理）下方：
     事件挂 document，仅在命中画布空白/容器空白、且非按钮链接时做命中测试 */
  function coverEventOK(e) {
    const t = e.target;
    if (!t || !t.closest) return false;
    if (!t.closest('#cover')) return false;
    if (t.closest('button, a, .chip, .cover-mode, .scroll-hint')) return false;
    if (t.closest('p, h1')) return false; // 文字阅读区不打扰
    return true;
  }
  function coverXY(e) {
    const r = host.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  document.addEventListener('mousemove', e => {
    if (!coverEventOK(e)) { U.hideTip(); host.style.cursor = 'default'; return; }
    const [x, y] = coverXY(e);
    let tip = null;
    if (inRect(x, y, hits.hero)) tip = '价格试点 · 首个可参考结果——点击下钻';
    else if (inRect(x, y, hits.caption)) tip = '图注 · 点击下钻';
    else {
      const c = hits.cells.find(c => inRect(x, y, c));
      if (c) tip = '版图格 · 经营版图中的一员——点击下钻';
    }
    if (tip) { U.showTip(tip, e.clientX, e.clientY); host.style.cursor = 'pointer'; }
    else { U.hideTip(); host.style.cursor = 'default'; }
  });
  document.addEventListener('mouseleave', () => { U.hideTip(); host.style.cursor = 'default'; });
  document.addEventListener('click', e => {
    if (!coverEventOK(e)) return;
    const [x, y] = coverXY(e);
    if (inRect(x, y, hits.hero)) return drillHero(e.clientX, e.clientY);
    if (inRect(x, y, hits.caption)) return drillCaption(e.clientX, e.clientY);
    const c = hits.cells.find(c => inRect(x, y, c));
    if (c) return drillCell(e.clientX, e.clientY);
  });

  /* ── 初始化与对外契约 ── */
  buildTiles();
  resize();
  window.COVER_A = {
    setActive,
    redraw() { resize(); gAlpha = 1; draw(RM.matches ? PHI0 : (accS / LAYER_S) % 1000); },
    rebuild() { buildTiles(); resize(); gAlpha = 1; draw(RM.matches ? PHI0 : (accS / LAYER_S) % 1000); },
    // 诊断只读：当前相位的分层/闪光状态（爆闪回归用，不改变行为）
    debug() {
      const phi = (accS / LAYER_S) % 1000;
      const log3 = Math.log(3);
      const out = { phi: +phi.toFixed(4), aD: 0, levels: [], flashCells: [] };
      const heroK = Math.ceil(phi + Math.log(0.26 * S / P0) / log3);
      out.aD = +aDress(uOf(P0 * Math.pow(R, heroK - phi))).toFixed(3);
      const kTop = Math.floor(phi + Math.log(2.34 * S / P0) / log3);
      const kBot = Math.ceil(phi + Math.log(26 / P0) / log3);
      for (let k = kTop; k >= kBot; k--) {
        const p = P0 * Math.pow(R, k - phi), u = uOf(p);
        const lvl = { k, p: Math.round(p), u: +u.toFixed(3), ghost: 0, flash: 0, born: 0, maxFa: 0 };
        const iMax = Math.ceil((W - CX) / p + 0.5), jMax = Math.ceil((H - CY) / p + 0.5);
        const iMin = Math.floor((0 - CX) / p - 0.5), jMin = Math.floor((0 - CY) / p - 0.5);
        for (let j = jMin; j <= jMax; j++) for (let i = iMin; i <= iMax; i++) {
          if (!inBand(u, 0.0867, 0.26)) continue;
          const ring = Math.max(Math.abs(i), Math.abs(j));
          const pa = paOf(k, i, j, ring);
          if (p > pa) { lvl.ghost++; continue; }
          const fx = (pa - p) / pa;
          if (fx < 0.2) {
            const fa = faPeak(ring) * Math.exp(-fx * 16);
            if (fa > 0.02) {
              lvl.flash++; lvl.maxFa = Math.max(lvl.maxFa, +fa.toFixed(3));
              if (fa > 0.08) out.flashCells.push({ i, j, ring, p: Math.round(p), fa: +fa.toFixed(2) });
            } else lvl.born++;
          } else lvl.born++;
        }
        out.levels.push(lvl);
      }
      return out;
    },
  };
  if (host.style.display !== 'none') setActive(true);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!active) draw(PHI0); });
  }
})();
