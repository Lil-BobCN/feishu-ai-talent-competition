/* ═══════════════════════════════════════════════════════════
   dashboard.js · P14 常驻右栏（context rail）· 业务扩域循环（03）
   宿主：#dash-canvas（<canvas>，#dash-rail 内，宽 var(--railw)=460px；≤1180px 整栏 display:none）
   数据：window.RPT（phases / keyFacts / expansionCandidates / cocreateSteps / boundaries / unknowns）
         window.SRC（K1–K5 锚点 → 日期），宁可缺失不得编造
   工具：window.U（bindCanvas / showDrill / showTip / hideTip / PAL / clamp / smooth）
   自上而下：当前窗口徽章+标题 → 四段相位条 → 扩域管线卡（地块微缩）
             → 数据牌（keyFacts 精选）→ 四个 stat 块（入场 count-up）
   地理节点按任务书替换为地块小图标（圣农农业语境），当前相位电蓝脉冲；
   回到 01 以虚线回弧表达建议路径（§U.7：建议=空心+虚线），不表达自动化。
   03 红线：自动化词仅出现在否定句；零收益/成本/时间表数字；
            候选顺序始终标注「方案推断，不是圣农批准的路线」。
   说明：宿主为 <canvas>，U.frame 的 DOM 三段式无法渲染进 canvas 元素，
         故 frame 三段式（结论句标题 / mono 读法 sub / 来源行 src）以 canvas
         文字原样绘制，语义与 U.frame 契约一致。

   ── 地基共享部分（保留，模块工程师请勿删除）──
   win-change 探针：把当前相位 id 写到 canvas 的 data-win-current
   属性，供 QA 与后续引擎读取。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('dash-canvas');
  if (!host) return;
  const U = window.U;
  if (!U || !U.bindCanvas) return;
  host.setAttribute('data-module', 'dashboard');
  host.removeAttribute('data-placeholder');

  const RPT = window.RPT || {};
  // 注意：本模块先于 sources.js 加载，K 锚点日期必须在调用时惰性读取 window.SRC
  function srcOf(id) {
    const arr = Array.isArray(window.SRC) ? window.SRC : [];
    const s = arr.find(x => x.id === id);
    return s ? `${s.id} · ${s.date}` : id;
  }
  const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const P = U.PAL;
  const BLUE = '#2251ff', BLUE_D = '#1233b8', BLUE_S = '#7d9bff', NEG = '#c22f4e'; // 电蓝族 + 真语义红
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';

  /* ── 数据准备（全部取自 RPT；缺失则跳过对应块，不编造） ── */
  const PHASES = Array.isArray(RPT.phases) ? RPT.phases : [];
  // 每窗口结论句（U.frame 之 title 语义：结论句，不是图表类型）
  const WINX = {
    'win-evidence': { concl: '先有可核验的试点结果，再与企业共议下一站' },
    'win-cocreate': { concl: '与企业共同盘点资料、能力与约束，不替企业拍板' },
    'win-decide':   { concl: '候选顺序是方案推断，采纳、调整或暂缓由企业选择' },
    'win-return':   { concl: '新场景仍回到 01 经营事件循环，03 只提供建议' },
  };
  const SEC_LABEL = {
    'sec-summary': '§0', 'sec-premise': '§1', 'sec-cocreate': '§2', 'sec-method': '§3',
    'sec-criteria': '§4', 'sec-candidates': '§5', 'sec-scenario': '§6', 'sec-roadmap': '§7',
    'sec-boundary': '§8', 'sec-evidence': '§9', 'sec-appendix': '附录', 'sec-sources': 'Sources',
  };
  const covOf = p => (p.sections || []).map(s => SEC_LABEL[s] || s).join(' · ');

  // 扩域管线四节点（对应 RPT.cocreateSteps 主链 N1→N6 与采纳分支；drill 文案惰性取自 RPT）
  const cs = RPT.cocreateSteps || {};
  const csMain = Array.isArray(cs.main) ? cs.main : [];
  const csBranches = Array.isArray(cs.branches) ? cs.branches : [];
  const lab = i => (csMain[i] && csMain[i].label) || '—';
  const PIPE = [
    { name: '试点结果', sub: () => lab(0) + '——扩域讨论的前提（§1 启动参考条件：可核验结果 / 重复运行 / 风险已说明，均为大致参考，不是固定门槛）。' },
    { name: '共创盘点', sub: () => 'N2 ' + lab(1) + ' → N3 ' + lab(2) + '；五步共创手段与四方角色分工见 §3（FDE 不替企业拍板）。' },
    { name: '企业选择', sub: () => 'N6 ' + lab(5) + '（门）：' + (csBranches.map(b => b.choice + '（' + b.flow + '）').join('；') || '—') + '。' },
    { name: '新场景回01', sub: () => (csBranches[0] ? csBranches[0].flow : '—') + '；新场景仍按 01 建立独立事件、案件与 Agent 上下文，跨循环边界见 §8。' },
  ];

  const KF = Array.isArray(RPT.keyFacts) ? RPT.keyFacts : [];
  const PICK = ['循环性质', '企业选择权', '候选场景', '年报方向支撑'];
  const plaqueFacts = (PICK.map(l => KF.find(f => f.label === l)).filter(Boolean).length
    ? PICK.map(l => KF.find(f => f.label === l)).filter(Boolean)
    : KF.slice(0, 4)).slice(0, 4);

  const candN = Array.isArray(RPT.expansionCandidates) ? RPT.expansionCandidates.length : null;
  const stepN = csMain.length || null;
  const bndN = Array.isArray(RPT.boundaries) ? RPT.boundaries.length : null;
  const unkN = Array.isArray(RPT.unknowns) ? RPT.unknowns.length : null;
  const unk6 = unkN != null ? RPT.unknowns.slice(0, 6).map(u => u.item).join(' / ') : '';
  const unk7 = unkN != null ? RPT.unknowns.slice(6).map(u => u.item).join(' / ') : '';

  const STATS = [
    candN != null && { label: '候选场景', value: candN, color: P.ink, tag: '顺序为方案推断', tagC: BLUE_S,
      drill: () => ({ title: '候选扩域场景（§5）', value: String(candN) + ' 个',
        sub: RPT.expansionCandidates.map(c => c.order + '. ' + c.scenario + (c.tag ? '（' + c.tag + '）' : '')).join('；') +
             '。首选建议：渠道库存与动销协同；候选顺序为方案推断，不是圣农批准的路线。',
        source: srcOf('K1') }) },
    stepN != null && { label: '共创步骤', value: stepN, color: P.ink, tag: '企业选择为门', tagC: P.inkLo,
      drill: () => ({ title: '共创顺序主链（§2）', value: 'N1–N' + stepN,
        sub: csMain.map(s => s.id + ' ' + s.label).join(' → ') + '。箭头只表达建议的共创顺序，不代表自动化工作流。',
        source: srcOf('K1') }) },
    bndN != null && { label: '跨循环边界', value: bndN, color: P.ink, tag: '01 / 02 / 03 分工', tagC: P.inkLo,
      drill: () => ({ title: '跨循环边界（§8）', value: String(bndN) + ' 条',
        sub: RPT.boundaries.map(b => b.boundary + '：' + b.rule).join('；'),
        source: srcOf('K1') }) },
    unkN != null && { label: '待核验项', value: unkN, color: NEG, tag: '待企业核验', tagC: NEG,
      drill: () => ({ title: '待企业核验与有意留白（附录 A）', value: String(unkN) + ' 项',
        sub: '六项事实核验（' + unk6 + '）+ 七类有意留白（' + unk7 + '）；现场核验前不写成已支持。',
        source: srcOf('K1') }) },
  ].filter(Boolean);

  /* ── canvas 绑定与自适应（display:none 时静默；激活后重新 fit，postmortem #2） ── */
  const cv = U.bindCanvas(host);
  const ctx = cv.ctx;
  let view = { w: 0, h: 0 };
  function fitIfNeeded() {
    const r = host.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (Math.abs(r.width - view.w) > 0.5 || Math.abs(r.height - view.h) > 0.5) view = cv.fit();
    return true;
  }

  /* ── 文字与形状助手 ── */
  function txt(str, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.font = (o.i ? 'italic ' : '') + (o.w || 400) + ' ' + (o.s || 10) + 'px ' + (o.f || MONO);
    ctx.fillStyle = o.c || P.ink;
    ctx.textAlign = o.a || 'left';
    ctx.textBaseline = o.b || 'alphabetic';
    if (o.halo) { // 纸色光晕（§U.3：文字压线一律 strokeText）
      ctx.lineWidth = o.halo; ctx.lineJoin = 'round'; ctx.strokeStyle = P.paper;
      ctx.strokeText(str, x, y);
    }
    ctx.fillText(str, x, y);
    ctx.restore();
  }
  const TRIMTAIL = '，、的了与和及·：；（(“';
  function trunc(str, maxW, font) { // 测量截断：截尾去逗号/介词再加 " …"（postmortem #9）
    ctx.save(); if (font) ctx.font = font;
    let s = String(str);
    if (ctx.measureText(s).width <= maxW) { ctx.restore(); return s; }
    while (s.length && ctx.measureText(s + ' …').width > maxW) s = s.slice(0, -1);
    while (s.length && TRIMTAIL.indexOf(s[s.length - 1]) >= 0) s = s.slice(0, -1);
    ctx.restore();
    return s + ' …';
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
  function arrow(x1, y1, x2, y2, c, lw) {
    ctx.save();
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw || 1.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 5.5 * Math.cos(ang - 0.42), y2 - 5.5 * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - 5.5 * Math.cos(ang + 0.42), y2 - 5.5 * Math.sin(ang + 0.42));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 地块小图标：斜平行四边形田块 + 两条垄线（代替 P14 地理节点）
  function plotIcon(cx, cy, s, o) {
    o = o || {};
    const bx0 = cx - s, bx1 = cx + s * 0.35, tx0 = cx - s * 0.35, tx1 = cx + s;
    const yb = cy + s * 0.28, yt = cy - s * 0.44;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx0, yb); ctx.lineTo(tx0, yt); ctx.lineTo(tx1, yt); ctx.lineTo(bx1, yb);
    ctx.closePath();
    if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
    ctx.lineWidth = o.lw || 1.2; ctx.strokeStyle = o.stroke || P.ink; ctx.stroke();
    ctx.lineWidth = Math.max(0.8, (o.lw || 1.2) * 0.7);
    for (const t of [0.36, 0.68]) { // 垄线：长边方向内插两条
      ctx.beginPath();
      ctx.moveTo(U.lerp(bx0, tx0, t), U.lerp(yb, yt, t));
      ctx.lineTo(U.lerp(bx1, tx1, t), U.lerp(yb, yt, t));
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── 状态与动画 ── */
  let cur = 0;                 // 当前窗口下标
  let entered = false, enterT0 = 0, railOn = false;
  let switchT0 = 0;            // 窗口切换微动画起点
  let hits = [];
  let raf = 0;

  function pushHit(x, y, w, h, tip, drill) { hits.push({ x, y, w, h, tip, drill }); }

  function draw(now) {
    if (!fitIfNeeded()) return;
    const W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    hits = [];

    const t = entered ? now - enterT0 : 0;
    const A = (delay, dur) => { // 入场进度：alpha + 上浮位移；reduced-motion 直接完成帧
      if (REDUCE) return { a: 1, dy: 0 };
      const p = U.clamp((t - delay) / (dur || 460), 0, 1);
      const e = U.smooth(p);
      return { a: e, dy: (1 - e) * 10 };
    };
    const pulse = REDUCE ? 0.55 : 0.5 + 0.5 * Math.sin(now / 720);
    const swA = REDUCE ? 1 : U.clamp((now - switchT0) / 280, 0, 1); // 窗口切换淡入

    const N = PHASES.length || 4;
    const win = PHASES[cur] || { id: '', name: '—', sections: [] };
    const wx = WINX[win.id] || { concl: '' };

    const PAD = 30, CW = W - PAD * 2;
    const hHeader = 96, hPhase = 46, hPipe = 140;
    const hPlaque = plaqueFacts.length ? 16 + plaqueFacts.length * 23 + 4 : 0;
    const hStats = STATS.length ? 56 : 0;
    const blocks = [hHeader, hPhase, hPipe, hPlaque, hStats].filter(h => h > 0);
    const sum = blocks.reduce((a, b) => a + b, 0);
    const gap = U.clamp((H - 34 - 44 - sum) / blocks.length, 12, 64);
    let y = 34 + Math.max(0, H - 44 - 34 - sum - gap * blocks.length) * 0.4;

    /* ── 1 · 当前窗口徽章 + 标题（结论句；U.frame 之 title/sub 语义） ── */
    {
      const g = A(0);
      ctx.save(); ctx.globalAlpha = g.a * swA;
      const y0 = y + g.dy;
      txt('业务扩域循环 · 常驻仪表', PAD, y0, { s: 9, c: P.inkLo });
      txt('LIVE', W - PAD, y0, { s: 9, c: BLUE, a: 'right', w: 700 });

      const badge = '窗口 ' + (cur + 1) + ' / ' + N;
      ctx.font = '700 10px ' + MONO;
      const bw = ctx.measureText(badge).width + 16;
      ctx.lineWidth = 1.5; ctx.strokeStyle = P.ink;
      ctx.strokeRect(PAD, y0 + 12, bw, 20);
      txt(badge, PAD + 8, y0 + 25.5, { s: 10, w: 700, c: P.ink });
      txt(trunc(win.name, CW - bw - 12, '700 15px ' + SERIF), PAD + bw + 12, y0 + 27, { s: 15, w: 700, f: SERIF, c: P.ink });

      txt(trunc(wx.concl, CW, 'italic 400 12.5px ' + SERIF), PAD, y0 + 50, { s: 12.5, i: true, f: SERIF, c: P.inkMd });
      txt('滚动切换窗口 · 点击任意元素查看依据与 K 编号 · 候选顺序为方案推断', PAD, y0 + 68, { s: 8.5, c: P.inkLo });
      ctx.restore();

      pushHit(PAD, y, CW, 74, '当前窗口 · 点击下钻', {
        title: '当前窗口 · 相位 ' + (cur + 1) + ' / ' + N,
        value: win.name,
        sub: wx.concl + '。滚动探针命中章节时切换（main.js · 视口 35% 探针）；本窗口覆盖：' + (covOf(win) || '—') + '。',
        source: srcOf('K1'),
      });
      y += hHeader + gap;
    }

    /* ── 2 · 四段相位条（当前段电蓝 + 脉冲） ── */
    if (PHASES.length) {
      const segGap = 6, segW = (CW - segGap * (N - 1)) / N, barH = 26;
      for (let j = 0; j < N; j++) {
        const p = PHASES[j];
        const g = A(170 + j * 85);
        const x = PAD + j * (segW + segGap), yy = y + g.dy;
        const st = j < cur ? 'done' : j === cur ? 'cur' : 'todo';
        ctx.save(); ctx.globalAlpha = g.a;
        rr(x, yy, segW, barH, 3);
        ctx.fillStyle = st === 'cur' ? BLUE : st === 'done' ? P.ink : P.lineLo;
        ctx.fill();
        if (st === 'cur') { // 脉冲外晕
          ctx.globalAlpha = g.a * (0.25 + 0.45 * pulse);
          ctx.lineWidth = 1.5; ctx.strokeStyle = BLUE;
          rr(x - 2.5, yy - 2.5, segW + 5, barH + 5, 5); ctx.stroke();
          ctx.globalAlpha = g.a;
        }
        const lab2 = (j + 1) + ' · ' + p.name;
        txt(trunc(lab2, segW - 12, '700 9px ' + MONO), x + segW / 2, yy + barH / 2, {
          s: 9, w: 700, c: st === 'todo' ? P.inkLo : '#ffffff', a: 'center', b: 'middle',
        });
        ctx.restore();

        pushHit(x, y, segW, barH, p.name + ' · 点击查看覆盖章节', {
          title: '相位 ' + (j + 1) + ' / ' + N,
          value: p.name,
          sub: '覆盖章节：' + (covOf(p) || '—') + '。状态：' + (j < cur ? '已通过' : j === cur ? '当前窗口' : '未进入') + '。',
          source: srcOf('K1'),
        });
      }
      const g2 = A(560);
      ctx.save(); ctx.globalAlpha = g2.a;
      txt('相位 ' + (cur + 1) + ' / ' + N, PAD, y + barH + 13 + g2.dy, { s: 8, c: P.inkLo });
      txt(trunc(covOf(win), CW - 90, '400 8px ' + MONO), W - PAD, y + barH + 13 + g2.dy, { s: 8, c: P.inkLo, a: 'right' });
      ctx.restore();
      y += hPhase + gap;
    }

    /* ── 3 · 扩域管线卡（地块微缩：试点结果→共创盘点→企业选择→新场景回01） ── */
    {
      const g = A(320);
      const fx = PAD, fw = CW, fy = y + g.dy;
      ctx.save(); ctx.globalAlpha = g.a;
      // 卡体
      rr(fx, fy + 12, fw, hPipe - 12, 6);
      ctx.fillStyle = P.hi; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = P.line; ctx.stroke();
      // 卡舌（蓝图夹：盖住卡体顶边接缝）
      ctx.beginPath();
      ctx.moveTo(fx + 10, fy + 12);
      ctx.lineTo(fx + 10, fy + 4);
      ctx.quadraticCurveTo(fx + 10, fy, fx + 16, fy);
      ctx.lineTo(fx + 150, fy);
      ctx.quadraticCurveTo(fx + 156, fy, fx + 160, fy + 12);
      ctx.closePath();
      ctx.fillStyle = P.hi; ctx.fill();
      ctx.strokeStyle = P.line; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 11, fy + 12); ctx.lineTo(fx + 159, fy + 12);
      ctx.strokeStyle = P.hi; ctx.stroke(); // 擦掉舌底缝线
      txt('ADVISORY PIPELINE · 扩域管线', fx + 18, fy + 9.5, { s: 8, w: 700, c: P.inkMd });

      // 卡头：地块小图标 + 卡名 + 性质标记
      const hy = fy + 33;
      plotIcon(fx + 27, hy - 1, 9.5, { stroke: P.ink, fill: 'rgba(5,28,44,0.05)', lw: 1.1 });
      txt(trunc('试点之后怎么走（微缩）', fw - 190, '700 13px ' + SERIF), fx + 42, hy, { s: 13, w: 700, f: SERIF, c: P.ink });
      txt(trunc('建议性蓝图 · 非实施合同', 128, '400 8px ' + MONO), fx + fw - 14, hy, { s: 8, c: P.inkLo, a: 'right' });
      ctx.beginPath(); ctx.moveTo(fx + 14, hy + 9); ctx.lineTo(fx + fw - 14, hy + 9);
      ctx.strokeStyle = P.lineLo; ctx.lineWidth = 1; ctx.stroke();

      pushHit(fx + 10, fy, fw - 20, hy - fy + 10, '扩域管线 · 点击查看整体依据', {
        title: '扩域管线（微缩 · §2 共创顺序）',
        value: PIPE.map(p => p.name).join(' → '),
        sub: cs.note || '—',
        source: srcOf('K1'),
      });

      // 节点几何：四地块横向等距
      const cellW = (fw - 36) / 4;
      const nx = i => fx + 18 + cellW * (i + 0.5);
      const ny = hy + 39; // 地块中心
      const stOf = i => (i < cur ? 'done' : i === cur ? 'cur' : 'todo');

      // 回到 01 虚线回弧（先画，压在地块之下；建议路径=空心+虚线，§U.7）
      {
        const ay0 = ny - 14, ayC = ny - 36;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = stOf(3) === 'todo' ? P.line : P.inkLo;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nx(3), ay0);
        ctx.quadraticCurveTo((nx(0) + nx(3)) / 2, ayC, nx(0), ay0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      // 相邻节点连接箭头：已进入的边墨色、指向当前相位的边电蓝、未进入浅线
      for (let e = 0; e < 3; e++) {
        const ec = e + 1 < cur ? P.ink : e + 1 === cur ? BLUE : P.line;
        arrow(nx(e) + 24, ny - 1, nx(e + 1) - 24, ny - 1, ec, e + 1 === cur ? 1.5 : 1.2);
      }
      // 四地块节点（当前相位电蓝 + 脉冲环）
      PIPE.forEach((node, i) => {
        const gg = A(380 + i * 70);
        const st = stOf(i);
        const cx = nx(i), cy = ny + gg.dy;
        ctx.save(); ctx.globalAlpha = gg.a;
        if (st === 'cur') {
          ctx.globalAlpha = gg.a * (0.3 + 0.5 * pulse);
          ctx.beginPath(); ctx.arc(cx, ny, 16 + pulse * 1.5, 0, U.TAU);
          ctx.lineWidth = 1.5; ctx.strokeStyle = BLUE; ctx.stroke();
          ctx.globalAlpha = gg.a;
        }
        plotIcon(cx, cy, 17, st === 'cur'
          ? { stroke: BLUE, fill: 'rgba(34,81,255,0.10)', lw: 1.5 }
          : st === 'done'
            ? { stroke: P.ink, fill: 'rgba(5,28,44,0.07)', lw: 1.2 }
            : { stroke: P.inkLo, fill: P.paper, lw: 1.1 });
        txt(node.name, cx, ny + 20, {
          s: 8, w: st === 'cur' ? 700 : 400,
          c: st === 'cur' ? BLUE_D : st === 'done' ? P.ink : P.inkLo, a: 'center', halo: 3,
        });
        ctx.restore();

        pushHit(cx - cellW / 2, ny - 18, cellW, 44, node.name + ' · 点击查看依据', {
          title: '管线节点 ' + (i + 1) + ' / 4 · ' + node.name,
          value: node.name,
          sub: node.sub() + (i === cur ? '（当前相位高亮）' : ''),
          source: srcOf('K1'),
        });
      });
      // 回弧箭头（压在地块之上，指向节点 1 顶部）
      {
        const tx0 = nx(0), ty0 = ny - 14;
        const ang = Math.atan2(ty0 - (ny - 36), tx0 - (nx(0) + nx(3)) / 2); // 回弧终点切线
        ctx.save();
        ctx.fillStyle = stOf(3) === 'todo' ? P.line : P.inkLo;
        ctx.beginPath();
        ctx.moveTo(tx0, ty0 + 1);
        ctx.lineTo(tx0 - 6 * Math.cos(ang - 0.5), ty0 + 1 - 6 * Math.sin(ang - 0.5));
        ctx.lineTo(tx0 - 6 * Math.cos(ang + 0.5), ty0 + 1 - 6 * Math.sin(ang + 0.5));
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      // 卡脚注（红线注：否定句，表达非自动化）
      txt('箭头表达建议的共创顺序，不代表自动化工作流 · 回到 01 见 §8', fx + 14, fy + hPipe - 14, { s: 8, c: P.inkLo });
      ctx.restore();
      y += hPipe + gap;
    }

    /* ── 4 · 数据牌（RPT.keyFacts 精选） ── */
    if (plaqueFacts.length) {
      const g = A(620);
      const py = y + g.dy;
      ctx.save(); ctx.globalAlpha = g.a;
      txt('数据牌 · KEY FACTS', PAD, py + 8, { s: 8.5, w: 700, c: P.inkLo });
      txt('点击行查看依据', W - PAD, py + 8, { s: 8, c: P.inkLo, a: 'right' });
      plaqueFacts.forEach((f, i) => {
        const ry = py + 16 + i * 23;
        ctx.beginPath(); ctx.moveTo(PAD, ry); ctx.lineTo(W - PAD, ry);
        ctx.strokeStyle = P.lineLo; ctx.lineWidth = 1; ctx.stroke();
        txt(f.label, PAD, ry + 15.5, { s: 8.5, c: P.inkLo });
        txt(trunc(f.value, CW - 150, '700 13.5px ' + SERIF), W - PAD, ry + 16,
          { s: 13.5, w: 700, f: SERIF, c: P.ink, a: 'right' });
        pushHit(PAD, ry, CW, 23, f.label + ' · ' + f.value, {
          title: f.label, value: f.value,
          sub: f.sub + ' · 证据分级：' + f.factTag,
          source: srcOf(f.srcId),
        });
      });
      ctx.beginPath(); ctx.moveTo(PAD, py + 16 + plaqueFacts.length * 23); ctx.lineTo(W - PAD, py + 16 + plaqueFacts.length * 23);
      ctx.strokeStyle = P.lineLo; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      y += hPlaque + gap;
    }

    /* ── 5 · 四个 stat 块（入场 count-up；待核验项缺口语义 → 真语义红） ── */
    if (STATS.length) {
      const bw2 = (CW - (STATS.length - 1) * 10) / STATS.length;
      STATS.forEach((s, i) => {
        const g = A(760 + i * 100);
        const x = PAD + i * (bw2 + 10), sy = y + g.dy;
        const p = REDUCE ? 1 : 1 - Math.pow(1 - U.clamp((t - (760 + i * 100)) / 1000, 0, 1), 3);
        const shown = Math.round(s.value * p);
        ctx.save(); ctx.globalAlpha = g.a;
        ctx.fillStyle = s.color;
        ctx.fillRect(x, sy, 18, 2); // 顶部编辑式短刻度
        txt(String(shown), x, sy + 26, { s: 21, w: 700, c: s.color });
        txt(s.label, x, sy + 40, { s: 8, c: P.inkLo });
        if (s.tag) txt(s.tag, x, sy + 50, { s: 7.5, c: s.tagC || P.inkLo });
        ctx.restore();
        pushHit(x - 2, y, bw2 + 4, 56, s.label + ' · ' + s.value, s.drill);
      });
      y += hStats + gap;
    }

    /* ── 6 · 来源行（frame 三段式之 src，底部锚定） ── */
    {
      const g = A(900);
      ctx.save(); ctx.globalAlpha = g.a;
      txt('Source · K1 03工作稿 · K2 年报 · K3 赛题 · K4/K5 调研',
        PAD, H - 27 + g.dy, { s: 8.5, c: P.inkLo });
      txt('建议性蓝图 · 企业可确认 / 调整 / 暂缓 / 否决 · 候选顺序为方案推断',
        PAD, H - 13 + g.dy, { s: 8.5, c: P.inkLo });
      ctx.restore();
      pushHit(PAD, H - 40, CW, 36, '来源与纪律', {
        title: '来源与纪律', value: 'K1–K5',
        sub: '右栏每个数字均可点击回溯到 K 锚点；候选顺序为方案推断，不是圣农批准的路线；完整出处、日期与四源分类见页脚 Sources & method。',
        source: srcOf('K1'),
      });
    }
  }

  /* ── 动画循环（仅右栏可见且非 reduced-motion 时运行） ── */
  function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
  function startLoop() { if (!raf) raf = requestAnimationFrame(loop); }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; }
  function requestDraw() { requestAnimationFrame(draw); }

  /* ── 入场触发：右栏滑入（.on）时 fires once；reduced-motion 直接完成帧 ── */
  const rail = document.getElementById('dash-rail');
  function checkRail() {
    const on = !!(rail && rail.classList.contains('on'));
    railOn = on;
    if (on && !entered) { entered = true; enterT0 = performance.now(); }
    if (REDUCE) { if (on || entered) requestDraw(); }
    else if (on) startLoop(); else stopLoop();
  }
  if (rail) new MutationObserver(checkRail).observe(rail, { attributes: true, attributeFilter: ['class'] });
  checkRail();
  if (REDUCE) { entered = true; requestDraw(); }

  /* ── 窗口切换：与 section data-win 同步（main.js 派发 win-change） ── */
  host.setAttribute('data-win-current', PHASES[0] ? PHASES[0].id : ''); // 地基探针：初始相位
  window.addEventListener('win-change', e => {
    const id = e.detail && e.detail.win;
    host.setAttribute('data-win-current', id || ''); // 地基探针（保留）
    const i = PHASES.findIndex(p => p.id === id);
    if (i < 0 || i === cur) return;
    cur = i;
    switchT0 = performance.now();
    if (REDUCE) requestDraw();
  });

  /* ── resize / 重新激活：重新 fit() ── */
  function onResize() { if (fitIfNeeded() && REDUCE) requestDraw(); }
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(host);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); else checkRail(); });

  /* ── 交互：全元素 drill + hover tip ── */
  host.setAttribute('data-drill-keep', '');
  host.addEventListener('click', e => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = hits.length - 1; i >= 0; i--) {
      const h = hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        const d = typeof h.drill === 'function' ? h.drill() : h.drill;
        U.showDrill(Object.assign({}, d, { x: e.clientX, y: e.clientY }));
        return;
      }
    }
  });
  host.addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let hit = null;
    for (let i = hits.length - 1; i >= 0; i--) {
      const h = hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { hit = h; break; }
    }
    if (hit) {
      host.style.cursor = 'pointer';
      if (hit.tip) U.showTip(hit.tip, e.clientX, e.clientY);
    } else {
      host.style.cursor = '';
      U.hideTip();
    }
  });
  host.addEventListener('mouseleave', () => { host.style.cursor = ''; U.hideTip(); });
})();
