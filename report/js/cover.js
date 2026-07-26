/* ═══════════════════════════════════════════════════════════
   cover.js · 封面 A —— 案件档案夹无限递归（宿主 #cover-canvas 全屏 absolute canvas）
   ─────────────────────────────────────────────────────────
   主题原子 = E1-C1 案件大档案夹（俯视 mask：夹身 + 标签舌 + 「E1-C1 价格异常」标签
   + 01–07 分页签）。递归的是“物体本身”，不是逻辑链（COVER.md §3）。
   引擎：
     · 相机持续拉远（log 空间匀速），当前档案夹/阵列精确缩成上一层 3×3 阵列的中心格；
     · 新一圈档案夹按 BFS（自中心向外螺旋）出生序诞生 + 电蓝闪光（无波浪冲击环）；
     · 蓝色四角取景框跟踪当前原子（透明度只随相位淡入淡出，不随时间闪烁）；
     · 中心格永远只由上一层递归落入——sibling 格永不占中心（“留空等下一层”）；
     · 12 秒/层无缝循环（p 连续推进不重置，深处 LOD 裁剪保证无限）。
   阵列含义 = 经营事件与证据库；caption 写明“每一个案件档案夹，都是证据库中的一格
   ——规模，一路向上”。
   数据来源（只取 window.RPT / window.SRC，缺失不编造）：
     · RPT.dossier：E1-C1 / 价格异常 / 24.9 / 29.9 / SIG-0001 / PR-0001（simulated → 标注「方案模拟」）
     · RPT.archives：01–07 七类档案分页签（名称与 thesis 进 drill）
     · 旁格档案夹不标注虚构案号——权威案件记录只有 E1-C1；旁格为证据库纹理示意。
   注 1：宿主是全屏 canvas，U.frame 的 DOM 三联无法挂载 → 等价物绘制在画布右下：
        结论句（serif）+ 读法/交互 sub（mono）+ 带来源类别/日期/「方案模拟」的 src 行。
   注 2：cover.js 先于 sources.js 加载，window.SRC 一律惰性读取（带日期兜底）。
   注 3：.cover-inner 文字层压在 canvas 之上 → 点击/悬停监听挂 window，
        排除 button/a/chip/#drill-card 后做命中测试，不干扰翻页 chips。
   对外契约：window.COVER_A = { setActive(on), redraw(), rebuild() }（供三态切换调用）。
   QA 钩子：window.__COVER_NOTEXT__ = true 后 COVER_A.rebuild() → 无字识别测试帧。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas');
  if (!host) return;

  const U = window.U || {};
  const PAL = U.PAL || { paper: '#ffffff', hi: '#f7f9fc', ink: '#051c2c', inkMd: '#42566a', inkLo: '#8595a6', line: '#dbe2ea', lineLo: '#eef1f6', red: '#2251ff', redHi: '#1233b8', neg: '#c22f4e' };
  const clamp = U.clamp || ((v, a, b) => Math.max(a, Math.min(b, v)));
  const makeRng = U.makeRng || (() => () => 0.5);
  const showDrill = U.showDrill || (() => {});
  const BLUE = PAL.red;            // 电蓝（遗留槽位名）
  const BLUE_D = PAL.redHi;        // #1233b8
  const BLUE_L = '#7d9bff';        // 浅蓝（规范允许的电蓝族第三阶）
  const NEG = PAL.neg;             // 真语义红：仅缺口语义
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';

  /* ── 数据（RPT 契约；fallback 仅在数据层缺失时启用，见文件头注） ── */
  const DOS = (window.RPT && window.RPT.dossier) || {};
  const ARCH = (window.RPT && Array.isArray(window.RPT.archives)) ? window.RPT.archives : [];
  const dv = (k, fb) => (DOS[k] && DOS[k].value != null) ? DOS[k].value : fb;
  const CASE_ID = String(dv('caseId', 'E1-C1'));
  const EV_TYPE = String(dv('eventType', '价格异常'));
  const OBS = dv('observed', 24.9);
  const BASE = dv('baseline', 29.9);
  const SIG_ID = String(dv('signalId', 'SIG-0001'));
  const PR_ID = String(dv('parseRunId', 'PR-0001'));
  const STEPS_N = dv('timelineSteps', 15);
  const f1 = v => (typeof v === 'number' ? v.toFixed(1) : String(v));
  const GAP = (typeof OBS === 'number' && typeof BASE === 'number') ? (BASE - OBS) : null;
  const GAP_PCT = (GAP != null && BASE) ? ((OBS / BASE - 1) * 100) : null;

  function srcDate(id, fb) {
    const S = window.SRC;
    if (Array.isArray(S)) { const r = S.find(x => x.id === id); if (r && r.date) return r.date; }
    return fb;
  }
  const srcTag = () => `研究整理 — 评委稿重写版（K10 · ${srcDate('K10', '2026-07-23 重写')}）`;

  /* ── 引擎常量 ── */
  const GRID = 3;                       // 每层 3×3（中心格留给上一层递归）
  const FILL = 0.9;                     // 格尺寸 / 格距
  const R = 2 / FILL + 1;               // 单层放大比 ≈ 3.222（无缝关键：s_k = S0·R^(k−p)）
  const LAYER_T = 12;                   // 12 秒/层
  const LIVE_PX = 132;                  // ≥ 此尺寸用矢量活画，否则贴预渲染 tile
  const MIN_PX = 7;                     // 深处裁剪
  const ZONE_PX = 56;                   // ≥ 此尺寸的格子注册下钻热区
  const ROOT_SEED = 20260723;
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
  const rr = (x, y, w, h, r) => rrOn(ctx, x, y, w, h, r);

  /* ═══ 档案夹画法（局部坐标：夹身 0,0,300,330；标签舌 0,−26,132,28；右侧分页签 x≤322） ═══ */
  const FOOT_CX = 161, FOOT_CY = 152, FOOT = 356; // 外接方 356×356 的中心
  function folderTransform(x, y, size) {          // x,y = 外接方左上角屏幕坐标
    ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.scale(size / FOOT, size / FOOT); ctx.translate(-FOOT_CX, -FOOT_CY);
  }

  // 夹身 + 标签舌 + 阴影 + 背页（画到给定上下文 g）
  function folderBodyOn(g, tongueFill, tongueText, lw) {
    g.fillStyle = 'rgba(5,28,44,0.08)'; rrOn(g, 10, 12, 300, 330, 10); g.fill();
    g.fillStyle = PAL.hi; g.strokeStyle = PAL.line; g.lineWidth = lw * 0.7;
    rrOn(g, 12, -18, 288, 330, 8); g.fill(); g.stroke();
    g.fillStyle = '#ffffff'; g.strokeStyle = PAL.ink; g.lineWidth = lw;
    rrOn(g, 0, 0, 300, 330, 10); g.fill(); g.stroke();
    // 标签舌（与夹身顶边融合）
    g.beginPath();
    g.moveTo(0, 2); g.lineTo(0, -20); g.quadraticCurveTo(0, -26, 6, -26);
    g.lineTo(126, -26); g.quadraticCurveTo(132, -26, 132, -20); g.lineTo(132, 2); g.closePath();
    g.fillStyle = tongueFill || '#ffffff'; g.fill(); g.stroke();
    if (tongueText && !NOTEXT) {
      g.font = `700 16px ${MONO}`; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillStyle = tongueFill ? '#ffffff' : PAL.inkMd; g.fillText(tongueText, 12, -12);
    } else if (!tongueText) {
      g.strokeStyle = PAL.line; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(12, -12); g.lineTo(58, -12); g.stroke();
    }
  }
  // 卷宗纸堆 + 文字行（纹理；行宽由 rng 抖动）
  function paperStackOn(g, rng, x0, y0, w, h, sheets, lines) {
    for (let i = sheets - 1; i >= 0; i--) {
      const ox = i * (2 + rng() * 2), oy = -i * (3 + rng() * 2);
      g.fillStyle = i ? PAL.hi : '#ffffff'; g.strokeStyle = PAL.line; g.lineWidth = 1.2;
      rrOn(g, x0 + ox, y0 + oy, w, h, 3); g.fill(); g.stroke();
    }
    g.strokeStyle = PAL.line; g.lineWidth = 3; g.lineCap = 'round';
    for (let l = 0; l < lines; l++) {
      const ly = y0 + 18 + l * ((h - 30) / Math.max(1, lines - 1));
      const lw2 = w * (0.45 + rng() * 0.5);
      g.beginPath(); g.moveTo(x0 + 10, ly); g.lineTo(x0 + 10 + lw2, ly); g.stroke();
    }
  }
  function blueTabsOn(g, n, seedv) {
    const cols = [BLUE, BLUE_D, BLUE_L];
    for (let i = 0; i < n; i++) {
      const ty = 40 + i * 74;
      g.fillStyle = cols[(seedv + i) % 3]; g.strokeStyle = PAL.ink; g.lineWidth = 1.6;
      rrOn(g, 296, ty, 22, 34, 4); g.fill(); g.stroke();
    }
  }
  /* 内部纹理 10 变体（换行业必须换纹理：此处 = 卷宗纸堆 / 证据标签条 / 蓝色分页签） */
  function tileInteriorOn(g, v, rng) {
    switch (v) {
      case 0: // 血缘格标记纹理：纸堆 + 蓝色证据标签框
        paperStackOn(g, rng, 26, 56, 248, 210, 3, 6);
        g.strokeStyle = BLUE; g.lineWidth = 1.6; rrOn(g, 26, 282, 150, 26, 5); g.stroke();
        g.strokeStyle = BLUE_D; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(38, 295); g.lineTo(128, 295); g.stroke(); break;
      case 1: paperStackOn(g, rng, 26, 56, 248, 230, 3, 7); break;
      case 2: // 纸堆 + 顶部蓝色分页签 ×3
        paperStackOn(g, rng, 26, 66, 248, 220, 2, 6);
        for (let i = 0; i < 3; i++) { g.fillStyle = [BLUE, BLUE_D, BLUE_L][i]; rrOn(g, 52 + i * 66, 42, 46, 18, 3); g.fill(); } break;
      case 3: // 证据标签条 ×2
        paperStackOn(g, rng, 26, 56, 248, 180, 2, 5);
        for (let i = 0; i < 2; i++) {
          g.strokeStyle = BLUE; g.lineWidth = 1.6; rrOn(g, 26, 252 + i * 34, 176, 26, 5); g.stroke();
          g.strokeStyle = BLUE_D; g.lineWidth = 3; g.lineCap = 'round';
          g.beginPath(); g.moveTo(38, 265 + i * 34); g.lineTo(38 + 70 + rng() * 60, 265 + i * 34); g.stroke();
        } break;
      case 4: paperStackOn(g, rng, 26, 56, 236, 230, 2, 6); blueTabsOn(g, 3, 0); break;
      case 5: { // POS 流水表格式 sheet
        g.fillStyle = '#ffffff'; g.strokeStyle = PAL.line; rrOn(g, 26, 56, 248, 230, 3); g.fill(); g.stroke();
        g.strokeStyle = PAL.line; g.lineWidth = 1.4;
        for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(26 + i * 41.3, 56); g.lineTo(26 + i * 41.3, 286); g.stroke(); }
        for (let j = 1; j < 8; j++) { g.beginPath(); g.moveTo(26, 56 + j * 28.75); g.lineTo(274, 56 + j * 28.75); g.stroke(); }
        g.fillStyle = BLUE_L; g.fillRect(26, 56, 248, 28.75); break;
      }
      case 6: // 纸堆 + 蓝色便签
        paperStackOn(g, rng, 26, 56, 248, 230, 3, 6);
        g.save(); g.translate(190, 120); g.rotate(0.06);
        g.fillStyle = BLUE_L; g.globalAlpha *= 0.9; g.fillRect(-34, -34, 68, 68); g.restore(); break;
      case 7: // 装订孔 + 线
        paperStackOn(g, rng, 34, 56, 240, 230, 2, 6);
        g.strokeStyle = PAL.inkMd; g.lineWidth = 1.6;
        for (const hy of [110, 240]) { g.beginPath(); g.arc(30, hy, 7, 0, Math.PI * 2); g.stroke(); }
        g.strokeStyle = BLUE; g.beginPath(); g.moveTo(30, 117); g.lineTo(30, 233); g.stroke(); break;
      case 8: // 骑缝竖标签条
        paperStackOn(g, rng, 52, 56, 222, 230, 2, 6);
        g.fillStyle = BLUE_L; g.fillRect(26, 56, 18, 230);
        g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.strokeRect(26, 56, 18, 230); break;
      default: // 密集纸堆 + 底部日期条
        paperStackOn(g, rng, 26, 62, 248, 200, 5, 6);
        g.fillStyle = BLUE_L; g.fillRect(26, 278, 120, 16);
        g.strokeStyle = PAL.inkMd; g.lineWidth = 1; g.strokeRect(26, 278, 120, 16); break;
    }
  }

  /* 活画一个档案夹格（大尺寸用；矢量，永远清晰）。cx,cy 屏幕中心。 */
  function drawTileArt(cx, cy, size, variant, seed, lineage) {
    const rng = makeRng(seed);
    folderTransform(cx - size / 2, cy - size / 2, size);
    folderBodyOn(ctx, lineage ? BLUE : null, lineage ? CASE_ID : null, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(10, 10, 280, 310); ctx.clip();
    tileInteriorOn(ctx, variant, rng);
    ctx.restore();
    if (variant !== 4 && !lineage && (seed % 5 === 0)) blueTabsOn(ctx, 2, seed % 3); // 少量格带分页签，避免全场雷同
    ctx.restore();
  }

  /* ── 10 张预渲染内部纹理 tile（512px；含俯视 mask：夹身 + 标签舌） ── */
  const TILE_N = 10, TILE_PX = 512;
  let tiles = [];
  function makeTiles() {
    tiles = [];
    for (let v = 0; v < TILE_N; v++) {
      const c = document.createElement('canvas'); c.width = c.height = TILE_PX;
      const g = c.getContext('2d');
      const u = TILE_PX / FOOT;
      g.save(); g.translate(TILE_PX / 2, TILE_PX / 2); g.scale(u, u); g.translate(-FOOT_CX, -FOOT_CY);
      folderBodyOn(g, v === 0 ? BLUE : null, v === 0 ? CASE_ID : null, 3);
      g.save(); g.beginPath(); g.rect(10, 10, 280, 310); g.clip();
      tileInteriorOn(g, v, makeRng(ROOT_SEED + v * 7919));
      g.restore();
      g.restore();
      tiles.push(c);
    }
  }

  /* ═══ 主原子：E1-C1 案件大档案夹（活画详版 + 下钻热区） ═══ */
  function drawHero(cx, cy, size, alpha) {
    const u = size / FOOT;
    const px = lx => cx + (lx - FOOT_CX) * u, py = ly => cy + (ly - FOOT_CY) * u;
    const zone = (lx0, ly0, lx1, ly1, d) => zones.push({ x0: px(lx0), y0: py(ly0), x1: px(lx1), y1: py(ly1), d });

    // ① 通用格下钻（先入队，详细热区后入队、反向命中时优先）
    zone(0, -26, 322, 330, {
      title: `案件档案夹 · ${CASE_ID}`,
      value: `${ARCH.length || 7} 类档案 · 全程留痕`,
      sub: `一份受控权威案件记录：源事实与信号、语义解析、案件与 Agent 运行、调查证据、决策治理、执行验证、审计归档。备份、缓存、只读投影不算第二套真相。【案件为方案模拟】`,
      source: `${srcTag()} · 方案模拟`,
    });

    ctx.save(); ctx.globalAlpha *= alpha;
    folderTransform(cx - size / 2, cy - size / 2, size);
    folderBodyOn(ctx, null, null, 3);

    // ② 标签舌：「E1-C1 价格异常」
    if (!NOTEXT) {
      ctx.font = `700 17px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper;
      ctx.strokeText(CASE_ID, 12, -12); ctx.fillStyle = BLUE_D; ctx.fillText(CASE_ID, 12, -12);
      const w1 = ctx.measureText(CASE_ID).width;
      ctx.font = `700 14px ${SERIF}`;
      ctx.strokeText(` ${EV_TYPE}`, 12 + w1 + 6, -12); ctx.fillStyle = PAL.ink; ctx.fillText(` ${EV_TYPE}`, 12 + w1 + 6, -12);
    }
    zone(0, -28, 132, 2, {
      title: `案件标签 · ${CASE_ID} ${EV_TYPE}`,
      value: `${f1(OBS)} 元 vs 候选基准 ${f1(BASE)} 元`,
      sub: `P001 · ST021 · TX-9001。候选异常只表示“值得调查”，不等于违规结论；事件类型待调查确认。【方案模拟】`,
      source: `${srcTag()} · 方案模拟`,
    });

    // ③ 夹身顶部 mono 行
    if (!NOTEXT) {
      ctx.font = `700 11.5px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper; ctx.lineJoin = 'round';
      const idParts = CASE_ID.split('-');
      const head = `CASE DOSSIER · 经营事件 ${idParts[0] || 'E1'} · 调查案件 ${idParts[1] || 'C1'}`;
      ctx.strokeText(head, 16, 24); ctx.fillStyle = PAL.inkLo; ctx.fillText(head, 16, 24);
    }

    // ④ 卷宗纸堆（内容裁剪进夹身）
    ctx.save(); ctx.beginPath(); ctx.rect(10, 30, 280, 290); ctx.clip();
    const rng = makeRng(ROOT_SEED ^ 0x51c1);
    ctx.fillStyle = PAL.hi; ctx.strokeStyle = PAL.line; ctx.lineWidth = 1.4;
    rr(22, 40, 256, 176, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; rr(16, 34, 256, 176, 3); ctx.fill(); ctx.stroke();
    if (!NOTEXT) {
      ctx.font = `400 11px ${MONO}`; ctx.fillStyle = PAL.inkLo; ctx.textAlign = 'left';
      ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper; ctx.lineJoin = 'round';
      const hdr = `调查留痕 · ${PR_ID} · T1–T${STEPS_N}`;
      ctx.strokeText(hdr, 26, 52); ctx.fillText(hdr, 26, 52);
    }
    ctx.strokeStyle = PAL.line; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let l = 0; l < 6; l++) {
      const ly = 68 + l * 22, lw2 = 110 + rng() * 120;
      ctx.beginPath(); ctx.moveTo(26, ly); ctx.lineTo(26 + lw2, ly); ctx.stroke();
    }
    ctx.restore();

    // ⑤ 证据标签条 chips（固定 2×2 排布，超宽自动缩字号；全部可下钻；缺口 chip 用语义红 PAL.neg）
    const chips = [
      { t: `TX-9001 · 成交 ${f1(OBS)} 元`, c: BLUE_D, d: { title: '观测成交价（POS 事实）', value: `${f1(OBS)} 元`, sub: `POS 交易 TX-9001，门店 ST021，商品 P001；业务时间与来源版本已记录。【方案模拟】`, source: `${srcTag()} · 方案模拟` } },
      { t: `候选基准 ${f1(BASE)} 元`, c: BLUE_D, d: { title: '候选价格基准', value: `${f1(BASE)} 元`, sub: `异常检测规则匹配；基准是否真正适用于本门店、商品、渠道和时点，待调查确认。【方案模拟】`, source: `${srcTag()} · 方案模拟` } },
      { t: `${SIG_ID} → ${CASE_ID}`, c: BLUE, d: { title: `候选异常信号 ${SIG_ID}`, value: `→ ${CASE_ID}`, sub: `事件解析记录 ${PR_ID}：清洗、确定性去重、初次归并、分类全程留痕；信号只表示“值得调查”。【方案模拟】`, source: `${srcTag()} · 方案模拟` } },
      GAP != null ? { t: `缺口 −${f1(GAP)} 元 · ${GAP_PCT.toFixed(1)}%`, c: NEG, d: { title: '观测与候选基准的缺口', value: `−${f1(GAP)} 元（${GAP_PCT.toFixed(1)}%）`, sub: `缺口本身不是违规结论：可能来自违规低价，也可能来自合法促销、区域差异、临期处理或基准不适用。【方案模拟】`, source: `${srcTag()} · 方案模拟` } }
                    : { t: `${PR_ID} 留痕`, c: BLUE, d: { title: `事件解析记录 ${PR_ID}`, value: 'success', sub: '清洗、确定性去重、初次归并、分类全程留痕。【方案模拟】', source: `${srcTag()} · 方案模拟` } },
    ];
    const chipRows = [[chips[0], chips[1]], [chips[2], chips[3]]];
    const rowY = [240, 278], rowH = 28;
    chipRows.forEach((row, ri) => {
      let fs = 11.5, ws = [], tot = 0;
      for (;;) {                                   // 碰撞处理：测量 → 缩字号（局部坐标预算 268）
        ctx.font = `700 ${fs}px ${MONO}`;
        ws = row.map(c => ctx.measureText(c.t).width + 16);
        tot = ws.reduce((a, b) => a + b, 0) + 8 * (row.length - 1);
        if (tot <= 268 || fs <= 8.5) break;
        fs -= 0.5;
      }
      let xCur = 16;
      row.forEach((ch, ci) => {
        const tw = ws[ci], y = rowY[ri];
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = ch.c; ctx.lineWidth = 1.6;
        rr(xCur, y, tw, rowH, 6); ctx.fill(); ctx.stroke();
        if (!NOTEXT) {
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper; ctx.lineJoin = 'round';
          ctx.strokeText(ch.t, xCur + 8, y + rowH / 2 + 0.5); ctx.fillStyle = ch.c; ctx.fillText(ch.t, xCur + 8, y + rowH / 2 + 0.5);
        }
        zone(xCur, y, xCur + tw, y + rowH, ch.d);
        xCur += tw + 8;
      });
    });

    // ⑥ 归档日期条（含「方案模拟」标注；上移至纸堆与 chips 之间，避开封面 DOM 按钮行）
    if (!NOTEXT) {
      ctx.font = `400 10.5px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const dateLine = `归档 ${srcDate('K10', '2026-07-23 重写')} · 方案模拟 · 点击各元素下钻`;
      ctx.lineWidth = 4; ctx.strokeStyle = PAL.paper; ctx.lineJoin = 'round';
      ctx.strokeText(dateLine, 16, 226); ctx.fillStyle = PAL.inkLo; ctx.fillText(dateLine, 16, 226);
    }

    // ⑦ 01–07 分页签（七类档案；03 = 案件与 Agent 运行档案高亮电蓝）
    const n = Math.min(7, ARCH.length || 7);
    for (let i = 0; i < n; i++) {
      const a = ARCH[i] || { no: '0' + (i + 1), name: '', holds: '', thesis: '' };
      const ty = 26 + i * 42, hi = i === 2;
      ctx.fillStyle = hi ? BLUE : '#ffffff'; ctx.strokeStyle = hi ? BLUE_D : PAL.inkMd; ctx.lineWidth = 1.6;
      rr(298, ty, 24, 34, 4); ctx.fill(); ctx.stroke();
      if (!NOTEXT) {
        ctx.font = `700 12.5px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.strokeStyle = hi ? BLUE : PAL.paper; ctx.lineJoin = 'round';
        ctx.strokeText(a.no, 310, ty + 17.5); ctx.fillStyle = hi ? '#ffffff' : PAL.inkMd;
        ctx.fillText(a.no, 310, ty + 17.5);
      }
      zone(296, ty, 324, ty + 34, {
        title: `分页签 ${a.no} · ${a.name}`,
        value: a.holds || '—',
        sub: `${a.thesis || ''}（七类业务记录组织一份权威案件记录，不是七份副本。）`,
        source: `${srcTag()} · 方案模拟`,
      });
    }
    ctx.restore(); // folderTransform 的 save
    ctx.restore(); // alpha 的 save
  }

  /* ═══ 递归渲染 ═══ */
  // 环格出生：窗口收在本周期内（ringLevel+0.05 → +0.75）：φ≈0.75 起全场 9 块齐生、
  // 块仍 ≥150px（密集格场）；φ→1 时 9 块全部 settled，与下一周期 φ=0 严格同帧 → 无缝；
  // 接缝的紧凑簇 = “缩成上一层中心格”的节拍点，随后新一圈在外场诞生（BFS 螺旋）。
  function birthP(p, ringLevel, idx) {
    const start = ringLevel + 0.05 + idx * 0.04;
    return clamp((p - start) / 0.42, 0, 1);
  }
  const flashCurve = bp => Math.pow(Math.max(0, Math.sin(Math.PI * bp)), 1.6);

  function drawFlash(x, y, size, f) {
    ctx.save();
    rr(x - size / 2 + 2, y - size / 2 + 2, size - 4, size - 4, Math.max(4, size * 0.06));
    ctx.fillStyle = `rgba(34,81,255,${(0.26 * f).toFixed(3)})`; ctx.fill();
    ctx.strokeStyle = `rgba(125,155,255,${(0.55 * f).toFixed(3)})`; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = `rgba(34,81,255,${(0.85 * f).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }

  function drawNode(cx, cy, size, level, alpha, lineage, seed, p) {
    if (alpha <= 0.01 || size < MIN_PX) return;
    if (cx + size / 2 < -60 || cx - size / 2 > view.w + 60 || cy + size / 2 < -60 || cy - size / 2 > view.h + 60) return;
    if (level === 0) { drawLeaf(cx, cy, size, alpha, lineage, seed); return; }
    // 下钻热区（先于子格入队 → 更深/更小的格优先命中）：
    //  · 血缘原子节点（level === 当前循环层 L）：「当前案件原子」专属下钻——血缘叶格
    //    缩到 <ZONE_PX 后，当前原子仍必须可点（铁律：关键元素必须可下钻）；
    //  · 非血缘 level-1/2 阵列块：「经营事件与证据库 · 一格」通用下钻。
    const atomLv = Math.floor(p);
    if (size >= ZONE_PX && alpha > 0.5 && ((lineage && level === atomLv) || (!lineage && level >= 1 && level <= atomLv + 1))) {
      zones.push({
        x0: cx - size * 0.47, y0: cy - size * 0.47, x1: cx + size * 0.47, y1: cy + size * 0.47,
        d: lineage ? {
          title: `当前案件原子 · ${CASE_ID}`,
          value: `${EV_TYPE}（待调查）`,
          sub: `相机持续拉远：这只档案夹（及其阵列）正精确缩成上一层 3×3 阵列的中心格；中心格永远留给上一层递归，sibling 格不占位。【案件为方案模拟】`,
          source: `${srcTag()} · 方案模拟`,
        } : {
          title: '经营事件与证据库 · 一格',
          value: '案件档案夹（库位示意）',
          sub: `每一个案件档案夹，都是证据库中的一格——规模，一路向上。旁格为证据库纹理示意，不标注虚构案号：当前权威案件记录只有 ${CASE_ID}（方案模拟），真实库容为待企业验证项。`,
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
    // 整格热区必须先于绘制入队：drawHero 的细部热区（标签舌/分页签/证据 chips）
    // 后入队、反向命中时优先——否则整格血缘区会吞掉全部细部下钻。
    if (size >= ZONE_PX) {
      zones.push({
        x0: cx - size * 0.47, y0: cy - size * 0.47, x1: cx + size * 0.47, y1: cy + size * 0.47,
        d: lineage ? {
          title: `当前案件原子 · ${CASE_ID}`,
          value: `${EV_TYPE}（待调查）`,
          sub: `相机持续拉远：这只档案夹正精确缩成上一层 3×3 阵列的中心格；中心格永远留给上一层递归，sibling 格不占位。【案件为方案模拟】`,
          source: `${srcTag()} · 方案模拟`,
        } : {
          title: '经营事件与证据库 · 一格',
          value: '案件档案夹（库位示意）',
          sub: `每一个案件档案夹，都是证据库中的一格——规模，一路向上。旁格为证据库纹理示意，不标注虚构案号：当前权威案件记录只有 ${CASE_ID}（方案模拟），真实库容为待企业验证项。`,
          source: srcTag(),
        },
      });
    }
    if (size >= LIVE_PX) {
      if (lineage) drawHero(cx, cy, size, alpha);   // 唯一带 E1-C1 标签的详版主原子
      else drawTileArt(cx, cy, size, 1 + (seed % (TILE_N - 1)), seed, false);
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

  function drawCaption(w, h) {
    const x = w - 26;
    // 右下角白色径向垫底：满场格阵可能伸到 caption 下方，先保证文字区干净
    const gb = ctx.createRadialGradient(w - 150, h - 30, 20, w - 150, h - 30, 360);
    gb.addColorStop(0, 'rgba(255,255,255,0.94)'); gb.addColorStop(0.55, 'rgba(255,255,255,0.82)');
    gb.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gb; ctx.fillRect(w - 560, h - 400, 560, 400);
    // 窄屏缩短文案（评审修复 12：820px 右缘被裁）
    const narrow = w < 900;
    const L1 = narrow ? '每一个案件档案夹，都是证据库中的一格。'
                      : '每一个案件档案夹，都是证据库中的一格——规模，一路向上。';
    const L2 = '相机持续拉远 · 12 秒/层 · 蓝色取景框 = 当前案件原子 · 新格按 BFS 出生 · 点击档案夹与分页签下钻';
    const L3 = narrow ? `SOURCE · K10 · ${srcDate('K10', '2026-07-23 重写')} · ${CASE_ID} 为方案模拟`
                      : `SOURCE · ${srcTag()} · 阵列 = 经营事件与证据库 · ${CASE_ID} 案件为方案模拟`;
    const f1n = `italic 400 15px ${SERIF}`, f2n = `400 10px ${MONO}`;
    const maxW = Math.min(w * 0.62, 600);
    const l1 = trunc(L1, maxW, f1n);
    const l2 = trunc(w < 900 ? '点击档案夹与分页签下钻 · 12 秒/层' : L2, maxW, f2n);
    const l3 = trunc(L3, maxW, f2n);
    txt(l1, x, h - 62, f1n, PAL.ink, 'right', 4);
    txt(l2, x, h - 42, f2n, PAL.inkLo, 'right', 4);
    txt(l3, x, h - 26, f2n, PAL.inkLo, 'right', 4);
    if (!NOTEXT) {
      ctx.save(); ctx.font = f1n; const w1 = ctx.measureText(l1).width; ctx.font = f2n;
      const w23 = Math.max(ctx.measureText(l2).width, ctx.measureText(l3).width);
      ctx.restore();
      zones.push({
        x0: x - Math.max(w1, w23) - 8, y0: h - 78, x1: w - 8, y1: h - 12,
        d: {
          title: '封面 A · 案件档案夹无限递归',
          value: '规模，一路向上',
          sub: `相机持续拉远：当前档案夹精确缩成上一层 3×3 阵列的中心格，新一圈档案夹按 BFS 出生序（自中心向外螺旋）携电蓝闪光诞生；12 秒/层无缝循环。阵列 = 经营事件与证据库：每一起经营事件，都是库中的一格。`,
          source: srcTag(),
        },
      });
    }
  }

  /* ═══ 帧渲染 ═══ */
  /* 左文列实测：卡片不得压字（评审修复 4）。canvas 与 #cover 同原点，
     文字元素 viewport 坐标 − host rect = 画布坐标。缓存量测，refit/字体就绪时重测。
     注意：无 max-width 的块级元素（kicker/sub/title）盒宽会撑满整列，
     必须测「文本实际宽度」而非块盒宽（轮次 3 调试实录）。 */
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
    if (tc.right > 0) textCol = tc;
  }

  function render(p, masterA) {
    const w = view.w, h = view.h;
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalAlpha = masterA;
    const L = Math.max(0, Math.floor(p)), phi = p - L;
    const tc = textCol || { right: Math.min(664, w * 0.8), titleRight: Math.min(664, w * 0.8), titleBottom: h * 0.3 };
    /* 主原子 S0/Cx：左缘必须让开实测文字列右缘（gap 26），右缘留 10px 边；
       空间不足时缩 S0（floor 150）——修复 820px 卡片穿字 */
    let S0 = clamp(Math.min(w, h) * 0.36, 200, 430);
    const avail = w - 10 - (tc.right + 26);
    if (S0 > avail) S0 = Math.max(150, avail);
    const Cx = clamp(Math.max(w * 0.615, tc.right + 26 + S0 * 0.5), w * 0.5, w - 10 - S0 * 0.5);
    const Cy = h * 0.47;   // 主原子底部避开封面 DOM chips 行（y≈655–685 @1050）
    GEOM.Cx = Cx; GEOM.S0 = S0; GEOM.textRight = tc.right;   // QA 探针：卡片/文字列几何
    zones.length = 0;

    drawNode(Cx, Cy, S0 * Math.pow(R, 2 - phi), L + 2, 1, true, ROOT_SEED, p);

    // 边缘渐隐（保持中心聚焦；与参考一致的外场淡出）
    const g2 = ctx.createRadialGradient(Cx, Cy, Math.min(w, h) * 0.40, Cx, Cy, Math.max(w, h) * 0.92);
    g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(255,255,255,0.66)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

    // 左侧 0→0.62W 白色渐变 wash（COVER.md §2：保住标题可读性；前段更陡，文字尾部区保持高遮盖）
    const gw = ctx.createLinearGradient(0, 0, w * 0.62, 0);
    gw.addColorStop(0, 'rgba(255,255,255,0.98)'); gw.addColorStop(0.5, 'rgba(255,255,255,0.94)');
    gw.addColorStop(0.8, 'rgba(255,255,255,0.60)'); gw.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gw; ctx.fillRect(0, 0, w * 0.62, h);

    // 标题带加强洗版（评审修复 4b：1100/1280 大图块描边与标题轻度相交）：
    // 只压标题区矩形，x 尽头收在主原子左缘之前 → 不白化主原子与夹舌标签
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
        const gb = ctx.createLinearGradient(0, 0, bandX1, 0);
        gb.addColorStop(0, 'rgba(255,255,255,0.42)');
        gb.addColorStop(hold, 'rgba(255,255,255,0.36)');
        gb.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gb; ctx.fillRect(0, bandY1, bandX1, 60);
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
    // 只在真空白（画布 / 结构容器）上响应；文字层一律不触发（评审修复 1 同源口径）
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

  /* ── 对外契约（供 cover-wire.js 三态切换调用；display:none 恢复时自动 refit） ── */
  window.COVER_A = {
    setActive(on) { active = !!on; if (on) { cw = -1; } },
    redraw() { render(REDUCED ? STATIC_P : Math.max(0, tAcc / LAYER_T), 1); },
    rebuild() { NOTEXT = !!window.__COVER_NOTEXT__; makeTiles(); cw = -1; if (REDUCED) render(STATIC_P, 1); },
    get _p() { return REDUCED ? STATIC_P : Math.max(0, tAcc / LAYER_T); },   // QA 时间核对
    get _geom() { return { Cx: GEOM.Cx, S0: GEOM.S0, textRight: GEOM.textRight }; },  // QA 几何核对
  };

  makeTiles();
  measureCoverText();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureCoverText(); if (REDUCED && active) render(STATIC_P, 1); });
  requestAnimationFrame(frame);
})();
