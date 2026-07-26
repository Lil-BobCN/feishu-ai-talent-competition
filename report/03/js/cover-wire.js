/* ═══════════════════════════════════════════════════════════
   cover-wire.js · 封面 C「蓝图」—— 扩域蓝图卷轴的工程线框 + 三键切换器
   宿主：#cover-canvas-w（初始 display:none；激活时等 reflow 再 fit ——
   COVER/QA 标注的最常见坑：display:'' 后同步量测 0×0 → 全空白）。
   与封面 B 同几何（yaw / leftBound 0.585W / k easeOutBack / 标签列 312px /
   推挤截断），X 光线框渲染；制图件齐全：52px 十字格 / 四角对位标记 /
   右下签名条随状态改写（postmortem #21）/ 红 = 企业最终闸口图例。
   数据：window.RPT.cocreateSteps / blueprintOutputs / expansionCandidates /
   keyFacts / fiveSteps（只用已有键，宁可缺失不编造，§U.5）。
   不画自动化箭头（真源行40：箭头只表达建议的共创顺序）。
   window.__COVER_NOTEXT = true 时不画任何文字（QA 识别测试钩子，非业务功能）。

   ── 地基契约（BUILD_LOG 注意事项 #2：须保留或等价实现）──
   本文件末尾的三态切换管理（applyMode + 'cover-mode-change' 事件 +
   localStorage 键 rpt03-cover + ?cover= 直链 + window.COVER03）为地基逻辑，
   原样保留；线框引擎通过监听该事件停帧/重启。本文件必须在 cover.js 与
   cover-exploded.js 之后加载。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cover-canvas-w');
  if (!host) return;
  host.setAttribute('data-module', 'cover-wire');

  /* ── ② 蓝图线框模块 ── */
  (function wireModule() {
    const U = window.U;
    if (!U) return;

    const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
    const MONO = 'Menlo,Consolas,monospace';
    const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_L = '#7d9bff';
    const NEG = '#c22f4e';                     // 真语义红：仅 N6 企业选择闸口
    const INK = '#051c2c', INK_M = '#42566a', INK_L = '#8595a6';

    U.frame(host, {
      title: '同一张蓝图卷轴的工程线框：层序与闸口仍然可读',
      sub: 'X 光线框 · 无隐线 · 十字格 + 对位标记 · 点击空白装配/爆炸 · 点击图层或右侧标签下钻',
      src: '研究整理 · K1 03专题工作稿 2026-07-24 · 行24–40 · 建议性蓝图',
    });
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', '扩域蓝图卷轴六层爆炸图的蓝图线框版：底层试点地块、四层卷轴纸、顶层企业选择闸口以唯一语义红描边。');

    /* 数据纪律（§U.5）：只用已有键，宁可缺失不编造 */
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
      N1: { title: '第一步 · 试点结果（蓝图）', value: 'N1 / 06 · 共创顺序',
        sub: '已有试点形成可参考结果（母稿 行26）。启动参考条件：可核验结果 / 重复运行 / 风险已说明——大致参考，不是固定门槛（行14）；企业也可认为条件不成熟，暂不扩域。本层画成已耕种的地块：一切扩域讨论从真实结果长出。' },
      N2: { title: '第二步 · 沟通经营目标（蓝图）', value: 'N2 / 06 · 共创顺序',
        sub: '与企业沟通经营目标与治理诉求（母稿 行26）；五步法第一步：与管理层沟通经营目标和治理诉求（行44）。经营方向来自管理层，FDE 不替企业拍板（行50）。' },
      N3: { title: '第三步 · 共同盘点（蓝图）', value: 'N3 / 06 · 共创顺序',
        sub: '共同盘点资料、已有能力与现实约束（母稿 行27）；与候选业务域负责人及一线人员核验真实痛点、复查首个试点的结果与未解决问题（行45–46）。真实痛点与数据可得性待企业核验（行80）。' },
      N4: { title: '第四步 · 候选场景与首选建议（蓝图）', value: 'N4 / 06 · 共创顺序',
        sub: '提出候选场景与首选建议（母稿 行28）：首选建议＝渠道库存与动销协同（行86）。候选顺序是方案推断，不是圣农批准的路线；企业可以调整顺序，也可以暂不选择任何场景（行90）。' },
      N5: { title: '第五步 · 分阶段蓝图（蓝图）', value: 'N5 / 06 · 共创顺序',
        sub: '共同形成分阶段业务扩域蓝图（母稿 行29）。建议产物 5 项：候选场景及推荐顺序 / 首选下一试点建议与主要依据 / 可以复用的已有能力和需要补充的条件 / 建议参与角色、后续阶段及可以暂缓的原因 / 公开资料支持、方案推断和待企业核验项（行58–64），企业可继续修订。' },
      N6: { title: '最终闸口 · 企业选择（蓝图）', value: BR.length === 3 ? BR.map(b => b.choice).join(' / ') : '采纳 / 调整 / 暂缓或否决',
        sub: '企业四种走向：确认 / 调整 / 暂缓 / 否决（母稿 行6）。采纳→建议开展小范围新场景试点→新场景重新进入 01 经营事件循环（行31/34）；调整→回到共同盘点 N3（行32）；暂缓或否决→保留依据，待条件变化后再讨论（行33）。03 只提供建议，不执行真实审批（行70）。' },
    };

    /* 层定义（与封面 B 同蓝图）：index 0 = 顶层 N6 闸口，index 5 = 底层 N1 地块 */
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
    const GATE_H = 3.0;
    const ZTOP = LAYERS.length ? LAYERS[0].z0 + LAYERS[0].th + 5 * SEP + GATE_H + 0.4 : 28;
    const PTOP = (HX + HY) * 0.7071 * 0.5 + 0.6;

    /* 几何引擎（与 B 同约） */
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bd = U.bindCanvas(host);
    const ctx = bd.ctx;
    let W = 0, H = 0, Hv = 0, u = 6, cam = null, yawCur = Math.PI / 4;

    function fit() {
      const m = bd.fit();
      W = m.w; H = m.h;
      /* 封面内容可超过 100vh：签名条/对位标记/标签/几何锚定可视高度 */
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
      return { lay, z: L.z0 + lay * (5 - L.i) * SEP + breathe };
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
    function lineTop(x1, y1, x2, y2, z, st, lw) { seg(proj(x1, y1, z), proj(x2, y2, z), st, lw); }
    function polyTop(cx, cy, r, z, n) {
      const pts = [];
      for (let k = 0; k < (n || 26); k++) {
        const a = k / (n || 26) * U.TAU;
        pts.push(proj(cx + r * Math.cos(a), cy + r * Math.sin(a), z));
      }
      return pts;
    }

    /* X 光线框盒体：无隐线；远角 .22 / 近边 .7；顶面白纱罩 + 最重轮廓 .85 */
    function wireBox(x0, x1, y0, y1, z0, z1, color, veil) {
      const c = [
        proj(x0, y0, z0), proj(x1, y0, z0), proj(x1, y1, z0), proj(x0, y1, z0),
        proj(x0, y0, z1), proj(x1, y0, z1), proj(x1, y1, z1), proj(x0, y1, z1),
      ];
      const Rr = (Math.abs(x1 - x0) + Math.abs(y1 - y0)) * 0.7071 || 1;
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([a, b]) => {
        const n = U.clamp(((c[a].ry + c[b].ry) / 2) / Rr, -1, 1);
        seg(c[a], c[b], hexA(color, U.lerp(0.22, 0.7, (n + 1) / 2)), 1);
      });
      if (veil) fillP([c[4], c[5], c[6], c[7]], veil);
      strokeP([c[4], c[5], c[6], c[7]], hexA(color, 0.85), 1.2);
      return c;
    }
    function wireRoll(L, zt) {                             // 卷边线框：三站位剖面 + 纵向轨线
      const r = L.roll; if (!r) return;
      const x0 = L.hx - 0.15, TH = 9, THmax = Math.PI * 1.08;
      const prof = [];
      for (let j = 0; j <= TH; j++) {
        const th = THmax * j / TH;
        prof.push({ x: x0 + r * Math.sin(th), z: zt + r * (1 - Math.cos(th)) });
      }
      const stations = [-L.hy + 0.55, 0, L.hy - 0.55];
      stations.forEach(yv => {
        ctx.beginPath();
        prof.forEach((p, j) => { const q = proj(p.x, yv, p.z); if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.strokeStyle = hexA(L.color, 0.5); ctx.lineWidth = 0.8; ctx.stroke();
      });
      prof.forEach((p, j) => {
        if (j % 2) return;
        seg(proj(p.x, stations[0], p.z), proj(p.x, stations[2], p.z), hexA(L.color, 0.32), 0.7);
      });
    }
    function wireMarks(L, zt) {                            // 与 B 同位的身份刻线（线框版）
      const c = hexA(L.color, 0.5);
      if (L.id === 'N2') {
        strokeP(polyTop(-5.2, -2.2, 2.2, zt), c, 0.9);
        strokeP(polyTop(0.8, 1.9, 2.8, zt), c, 0.9);
        lineTop(-4.0, -0.5, -2.9, 0.9, zt, c, 0.9);
        lineTop(-0.4, 0.2, -1.6, -1.1, zt, c, 0.9);
      } else if (L.id === 'N3') {
        for (let k = 0; k < 3; k++) {
          const yv = -4.6 + k * 4.6;
          strokeP([proj(-6.4, yv - 0.95, zt), proj(-4.5, yv - 0.95, zt), proj(-4.5, yv + 0.95, zt), proj(-6.4, yv + 0.95, zt)], c, 0.9);
          lineTop(-3.3, yv + 0.5, -2.6, yv - 0.3, zt, c, 1);
          lineTop(-2.6, yv - 0.3, -1.4, yv + 1.1, zt, c, 1);
        }
      } else if (L.id === 'N4') {
        [-5.5, 0, 5.5].forEach((xv, k) => {
          const d = [proj(xv, -2.3, zt), proj(xv + 1.8, 0, zt), proj(xv, 2.3, zt), proj(xv - 1.8, 0, zt)];
          if (k === 0) { fillP(d, hexA(BLUE, 0.28)); strokeP(d, hexA(BLUE_D, 0.9), 1.1); }
          else strokeP(d, hexA(INK_M, 0.5), 0.9);
        });
      } else if (L.id === 'N5') {
        [-6, 0, 6].forEach(xv => {
          strokeP([proj(xv - 2.1, -1.3, zt), proj(xv + 2.1, -1.3, zt), proj(xv + 2.1, 1.3, zt), proj(xv - 2.1, 1.3, zt)], c, 0.9);
        });
        ctx.setLineDash([2.2, 2.2]);
        lineTop(-3.9, 0, -2.1, 0, zt, c, 0.8);
        lineTop(2.1, 0, 3.9, 0, zt, c, 0.8);
        ctx.setLineDash([]);
      }
    }
    function wireGate(L, zt) {                             // N6 闸口线框：全部 NEG（唯一语义红）
      const gh = GATE_H;
      wireBox(-3.1, -1.9, -0.95, 0.95, zt, zt + gh - 0.6, NEG, null);
      wireBox(1.9, 3.1, -0.95, 0.95, zt, zt + gh - 0.6, NEG, null);
      const lin = wireBox(-3.3, 3.3, -0.95, 0.95, zt + gh - 0.6, zt + gh, NEG, 'rgba(255,255,255,.72)');
      hits.push({ i: L.i, poly: [proj(-3.3, -0.95, zt + gh), proj(3.3, -0.95, zt + gh), proj(3.3, -0.95, zt + gh - 0.6), proj(-3.3, -0.95, zt + gh - 0.6)] });
      ctx.setLineDash([3, 2.4]);
      lineTop(-1.9, 0, 1.9, 0, zt + 0.03, hexA(NEG, 0.8), 1);
      ctx.setLineDash([]);
      const outs = [
        { y: -2.8, st: hexA(BLUE, 0.85), lw: 1.3, dash: null },
        { y: 0, st: hexA(INK_M, 0.7), lw: 1.1, dash: [5, 3] },
        { y: 2.8, st: hexA(INK_L, 0.8), lw: 1.1, dash: [1.6, 2.8] },
      ];
      outs.forEach(o => {
        if (o.dash) ctx.setLineDash(o.dash);
        const p1 = proj(3.5, 0, zt + 0.04), p2 = proj(9.4, o.y, zt + 0.04);
        seg(p1, p2, o.st, o.lw);
        seg(p2, proj(9.4, o.y + 0.75, zt + 0.04), o.st, o.lw);
        ctx.setLineDash([]);
      });
      return lin;
    }
    function wireLayer(L, z) {
      const hx = L.hx, hy = L.hy, zb = z, zt = z + L.th;
      const veilA = `rgba(255,255,255,${0.58 + L.i * 0.035})`;
      const c = wireBox(-hx, hx, -hy, hy, zb, zt, L.color, veilA);
      /* 制图细节：侧页虚线（≤1px hairline） */
      ctx.setLineDash([3, 3]);
      for (let f = 1; f <= 2; f++) {
        const zf = zb + L.th * f / 3;
        lineTop(hx, -hy, hx, hy, zf, hexA(L.color, 0.34), 0.7);
        lineTop(hx, hy, -hx, hy, zf, hexA(L.color, 0.34), 0.7);
      }
      /* 顶面图纸网格（虚线，制图风） */
      if (L.kind !== 'plot') {
        for (let gx = -hx + 6; gx <= hx - 3; gx += 6) lineTop(gx, -hy + 1.3, gx, hy - 1.3, zt, hexA(L.color, 0.26), 0.7);
        for (let gy = -hy + 6; gy <= hy - 3; gy += 6) lineTop(-hx + 1.6, gy, hx - 1.9, gy, zt, hexA(L.color, 0.26), 0.7);
      } else {
        /* 地块：垄行虚线 */
        for (let yv = -hy + 2.6; yv <= hy - 1.8; yv += 2.4) lineTop(-hx + 1.2, yv, hx - 0.4, yv, zt, hexA(L.color, 0.4), 0.8);
      }
      ctx.setLineDash([]);
      wireMarks(L, zt);
      wireRoll(L, zt);
      if (L.kind === 'gate') wireGate(L, zt);
      hits.push({ i: L.i, poly: [c[4], c[5], c[6], c[7]] });
    }

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
        haloText(fitText(`${L.id} · ${L.label}`, budget), textX, yy, L.color);
        ctx.font = `11px ${SERIF}`;
        haloText(fitText(L.thesis, budget), textX, yy + 13.5, INK_M);
        hits.push({ i: L.i, x: labX, y: yy - 11, w: W - 18 - labX, h: 31 });
      });
      ctx.globalAlpha = 1;
    }

    function drawStrip() {                                // 右下签名条：随状态改写（postmortem #21）
      const exploded = kTo === 1;
      const s1 = 'FIG. C — 扩域蓝图卷轴 · 共创六步（建议性蓝图）';
      const s2 = (exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW') + ' · 6 LAYERS';
      const s3 = 'SOURCE 研究整理 K1 · 2026-07-24 · 行24–40';
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
      /* 红 = 企业最终闸口图例（唯一语义红，必须给读法） */
      ctx.fillStyle = NEG;
      ctx.fillRect(bx + pad, by + 46, 6, 6);
      haloText('红 = 企业最终闸口', bx + pad + 10, by + 51.5, INK_M);
      ctx.textAlign = 'center';
      const cxr = (dx + bx + bw) / 2;
      haloText(r1, cxr, by + 23, INK_M);
      ctx.font = `700 9px ${MONO}`;
      haloText(r2, cxr, by + 40, INK);
      ctx.textAlign = 'left';
      /* 读法注（真源行40）：层序＝建议的共创顺序，不代表自动化工作流 */
      ctx.textAlign = 'right';
      haloText('读法 · 层序＝建议的共创顺序（行40），不代表自动化工作流', W - 22, by - 9, INK_L);
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
      // 52px 十字格基线（制图件）
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
        haloText('COCREATE DATA MISSING · window.RPT.cocreateSteps 未加载（数据纪律：宁可缺失不编造）', cam.cx - 160, cam.cy, INK_L);
        return;
      }
      // 地面虚线椭圆
      const g0 = proj(0, 0, 0);
      ctx.save(); ctx.translate(g0.x, g0.y + 1.2 * u); ctx.scale(1, 9.2 / 24);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(66,86,106,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 24 * u, 0, U.TAU); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      for (let i = 5; i >= 0; i--) {
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
        /* 只在真空白（画布 / 结构容器）上响应，文字层不触发 */
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
        // 先 requestAnimationFrame 等 reflow 再 fit 再画，否则 0×0 全空白（最常见坑）
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
    /* 模式契约（03 地基）：听 cover-mode-change，非 w 停帧；切回 w 重 fit 重启 */
    window.addEventListener('cover-mode-change', e => {
      setActive(!!(e.detail && e.detail.mode === 'w'));
    });
    window.addEventListener('resize', () => { if (active) { fit(); if (REDUCED) drawStatic(); } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active && REDUCED) drawStatic(); });
  })();

  /* ── ① 三态封面切换（地基逻辑，原样保留：display + .on + localStorage + ?cover= + 事件） ── */
  const MODES = { rec: 'cover-canvas', x: 'cover-canvas-x', w: 'cover-canvas-w' };
  const wrap = document.getElementById('cover-mode');
  if (!wrap) return;
  const btns = Array.from(wrap.querySelectorAll('button[data-mode]'));
  function applyMode(mode) {
    if (!MODES[mode]) mode = 'rec';
    Object.keys(MODES).forEach(m => {
      const c = document.getElementById(MODES[m]);
      if (c) c.style.display = (m === mode) ? '' : 'none';
    });
    btns.forEach(b => b.classList.toggle('on', b.getAttribute('data-mode') === mode));
    try { localStorage.setItem('rpt03-cover', mode); } catch (e) {}
    window.dispatchEvent(new CustomEvent('cover-mode-change', { detail: { mode } }));
  }
  btns.forEach(b => b.addEventListener('click', () => applyMode(b.getAttribute('data-mode'))));
  let initial = null;
  try {
    const q = new URLSearchParams(window.location.search).get('cover');
    if (q && MODES[q]) initial = q;
    else {
      const s = localStorage.getItem('rpt03-cover');
      if (s && MODES[s]) initial = s;
    }
  } catch (e) {}
  applyMode(initial || 'rec');
  window.COVER03 = { applyMode: applyMode };
})();
