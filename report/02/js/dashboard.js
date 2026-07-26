/* ═══════════════════════════════════════════════════════════
   dashboard.js · P14 常驻右栏（context rail）· 02 能力进化循环
   宿主：#dash-canvas（<canvas>，#dash-rail 内 460px 固定右栏；
        ≤1180px 整栏 display:none；透明底无边框）
   数据：window.RPT（phases / keyFacts / destiny / gates / approvals /
        unknowns）+ window.SRC（K 锚点 → 日期），只用已有键，宁可缺失不得编造
   工具：window.U（bindCanvas / showDrill / showTip / hideTip / PAL / clamp / smooth）
   自上而下：当前窗口徽章+标题（监听 win-change，detail.win ∈ RPT.phases[].id）
             → 四段相位条（当前段电蓝+脉冲）
             → 复盘管线卡（档案夹母题：正式关闭案件 → 完整复盘 →
               四分支微缩流程 → B4 诊断回路三节点；当前相位对应节点电蓝）
             → 数据牌（RPT.keyFacts ×4）→ 四个 stat 块（count-up，待验证 PAL.neg）
   说明：宿主为 <canvas>，U.frame 的 DOM 三段式无法渲染进 canvas 元素，
         故 frame 三段式（结论句标题 / mono 读法 sub / 来源行 src）以 canvas
         文字原样绘制，语义与 U.frame 契约一致（与 01 报告同解法）。
   无 topojson：按任务书不画地图，以档案夹（dossier folder）承载复盘管线。
   红线：全部数字为 RPT 集合长度的结构性计数；不写“自动学习”；
         无伪造案件数 / 评测成绩 / 版本号 / 模拟队列。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('dash-canvas');
  if (!host) return;
  const U = window.U;
  if (!U || !U.bindCanvas) return;

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
  // 每窗口结论句 + 管线高亮节点映射（win → 管线节点 id）
  const WINX = {
    'win-review':   { concl: '正式关闭是唯一入口，每案完整复盘不设初筛', node: 'review' },
    'win-diagnose': { concl: '只有项目可控的 Skill / Prompt / MCP / 工作流异样，才进诊断回路', node: 'B4' },
    'win-approve':  { concl: '三道检验过隔离验证闸门，管理审批三出口定去向', node: 'approve' },
    'win-deposit':  { concl: '批准范围内回 01 受控运行，未通过回滚至原版本', node: 'deposit' },
  };
  const SEC_LABEL = {
    'sec-exec': '§0', 'sec-why': '§1', 'sec-entry': '§2', 'sec-chain': '§3',
    'sec-routes': '§4', 'sec-roles': '§5', 'sec-trial': '§6', 'sec-feishu': '§7',
    'sec-boundary': '§8', 'sec-appendix': '附录', 'sec-sources': 'Sources',
  };
  const covOf = p => (p.sections || []).map(s => SEC_LABEL[s] || s).join(' · ');

  // 复盘管线（对应 RPT.destiny；详情全部来自 data.js 事实）
  const DST = RPT.destiny || {};
  const BR = Array.isArray(DST.branches) ? DST.branches : [];
  const BR_SHORT = { B1: '保存记录', B2: '转交 01', B3: '提交平台方', B4: '异样线索' };
  const BR_TAG = { B1: '归档备查', B2: '回 01 处置', B3: '证据提交', B4: '进诊断回路' };

  const CHAIN = [
    { id: 'gates',   n: '三道检验', srcId: 'K3',
      d: '历史回放 + 留出案例 + 专家审查；过隔离验证闸门才允许提交管理审批。任一环未过：记录失败证据，回到诊断与现实补全。' },
    { id: 'approve', n: '管理审批', srcId: 'K1',
      d: '批准 / 暂缓 / 驳回三出口；暂缓设复核条件或时间重新提交，驳回记录理由；改进申请、隔离试验版本与试验记录全部保留。' },
    { id: 'deposit', n: '沉淀 / 回滚', srcId: 'K1',
      d: '批准形成候选 Agent 能力版本，回 01 在批准范围内受控真实运行；受控验证未通过：回滚至原版本，返回诊断。' },
  ];

  const KF = Array.isArray(RPT.keyFacts) ? RPT.keyFacts : [];
  const PICK = ['唯一入口', '复盘方式', '三道检验', '待企业验证项'];
  const plaqueFacts = (PICK.map(l => KF.find(f => f.label === l)).filter(Boolean).length
    ? PICK.map(l => KF.find(f => f.label === l)).filter(Boolean)
    : KF.slice(0, 4)).slice(0, 4);

  // 四个 stat 块：全部取自 RPT 集合长度（结构性计数）
  const GATES = Array.isArray(RPT.gates) ? RPT.gates : [];
  const brN = BR.length || null;
  const gateN = GATES.filter(g => /^G\d/.test(g.no || '')).length || null; // G1–G3，不含 GATE 闸门本体
  const apN = Array.isArray(RPT.approvals) ? RPT.approvals.length : null;
  const unkN = Array.isArray(RPT.unknowns) ? RPT.unknowns.length : null;

  const STATS = [
    brN != null && { label: '四分支', value: brN, color: P.ink,
      drill: () => ({ title: '人工核实分支', value: String(brN),
        sub: '保存记录 / 转交 01 / 提交平台方 / 形成能力异样线索；仅 B4 进入 FDE 诊断与隔离验证回路，不直接认定为缺陷。',
        source: srcOf('K1') }) },
    gateN != null && { label: '三道检验', value: gateN, color: P.ink,
      drill: () => ({ title: '三道检验', value: String(gateN),
        sub: '历史回放 + 留出案例 + 专家审查，全部在隔离试验版本中留痕；过隔离验证闸门才谈审批。',
        source: srcOf('K3') + ' ；' + srcOf('K1') }) },
    apN != null && { label: '审批出口', value: apN, color: P.ink,
      drill: () => ({ title: '审批出口', value: String(apN),
        sub: '批准 / 暂缓 / 驳回；暂缓与驳回都保留原始记录，暂缓条件满足后重新提交审批。',
        source: srcOf('K1') }) },
    unkN != null && { label: '待验证项', value: unkN, color: NEG,
      drill: () => ({ title: '待企业验证项', value: String(unkN),
        sub: '复盘 Skill 承载、版本库、隔离环境、样本阈值、发布回滚平台等 §8 清单全部 unknown；现场核验前不写成已支持。',
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
  const TRIMTAIL = '，、的了与和及·：；（(“/';
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

  /* ── 状态与动画 ── */
  let cur = 0;                 // 当前窗口下标
  let entered = false, enterT0 = 0;
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
    const wx = WINX[win.id] || { concl: '', node: '' };
    const curNode = wx.node;

    const PAD = 30, CW = W - PAD * 2;
    const hHeader = 96, hPhase = 46;
    // 管线卡内部几何
    const rowH = 18, cellH = 21, cellGap = 4, chipH = 24;
    const hCard = 12 + 28 + 10 + rowH * 2 + 8 + BR.length * cellH + (BR.length - 1) * cellGap + 10 + chipH + 10;
    const hPlaque = plaqueFacts.length ? 16 + plaqueFacts.length * 23 : 0;
    const hStats = STATS.length ? 52 : 0;
    const blocks = [hHeader, hPhase, hCard, hPlaque, hStats].filter(h => h > 0);
    const sum = blocks.reduce((a, b) => a + b, 0);
    const gap = U.clamp((H - 34 - 44 - sum) / blocks.length, 12, 64);
    let y = 34 + Math.max(0, H - 44 - 34 - sum - gap * blocks.length) * 0.4;

    /* ── 1 · 当前窗口徽章 + 标题（结论句） ── */
    {
      const g = A(0);
      ctx.save(); ctx.globalAlpha = g.a * swA;
      const y0 = y + g.dy;
      txt('能力进化循环 · 常驻仪表', PAD, y0, { s: 9, c: P.inkLo });
      txt('LIVE', W - PAD, y0, { s: 9, c: BLUE, a: 'right', w: 700 });

      const badge = '窗口 ' + (cur + 1) + ' / ' + N;
      ctx.font = '700 10px ' + MONO;
      const bw = ctx.measureText(badge).width + 16;
      ctx.lineWidth = 1.5; ctx.strokeStyle = P.ink;
      ctx.strokeRect(PAD, y0 + 12, bw, 20);
      txt(badge, PAD + 8, y0 + 25.5, { s: 10, w: 700, c: P.ink });
      txt(trunc(win.name, CW - bw - 12, '700 15px ' + SERIF), PAD + bw + 12, y0 + 27, { s: 15, w: 700, f: SERIF, c: P.ink });

      txt(trunc(wx.concl, CW, 'italic 400 12.5px ' + SERIF), PAD, y0 + 50, { s: 12.5, i: true, f: SERIF, c: P.inkMd });
      txt('滚动切换窗口 · 点击任意元素查看依据与 K 编号', PAD, y0 + 68, { s: 8.5, c: P.inkLo });
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
        const lab = (j + 1) + ' · ' + p.name;
        txt(trunc(lab, segW - 12, '700 9px ' + MONO), x + segW / 2, yy + barH / 2, {
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

    /* ── 3 · 复盘管线卡（档案夹：关闭案件 → 完整复盘 → 四分支 → B4 回路） ── */
    if (BR.length) {
      const g = A(320);
      const fx = PAD, fw = CW, fy = y + g.dy, fh = hCard;
      ctx.save(); ctx.globalAlpha = g.a;
      // 夹体
      rr(fx, fy + 12, fw, fh - 12, 6);
      ctx.fillStyle = P.hi; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = P.line; ctx.stroke();
      // 夹舌（盖住夹体顶边接缝）
      ctx.beginPath();
      ctx.moveTo(fx + 10, fy + 12);
      ctx.lineTo(fx + 10, fy + 4);
      ctx.quadraticCurveTo(fx + 10, fy, fx + 16, fy);
      ctx.lineTo(fx + 128, fy);
      ctx.quadraticCurveTo(fx + 134, fy, fx + 138, fy + 12);
      ctx.closePath();
      ctx.fillStyle = P.hi; ctx.fill();
      ctx.strokeStyle = P.line; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 11, fy + 12); ctx.lineTo(fx + 137, fy + 12);
      ctx.strokeStyle = P.hi; ctx.stroke(); // 擦掉舌底缝线
      txt('REVIEW PIPELINE · 复盘管线', fx + 18, fy + 9.5, { s: 8, w: 700, c: P.inkMd });

      // 卡头：档案夹小图标 + 标题 + 纪律标记
      const hy = fy + 12 + 20;
      ctx.lineWidth = 1.2; ctx.strokeStyle = P.ink;
      rr(fx + 18, hy - 9, 17, 11, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 18, hy - 9); ctx.lineTo(fx + 18, hy - 12);
      ctx.lineTo(fx + 25, hy - 12); ctx.lineTo(fx + 27, hy - 9); ctx.closePath();
      ctx.fillStyle = P.hi; ctx.fill(); ctx.stroke();
      txt(trunc('关闭案件的复盘命运', fw - 150, '700 13px ' + SERIF), fx + 42, hy, { s: 13, w: 700, f: SERIF, c: P.ink });
      txt('不设初筛 · 不丢弃案件内容', fx + fw - 14, hy, { s: 8, c: P.inkLo, a: 'right' });
      ctx.beginPath(); ctx.moveTo(fx + 14, hy + 7); ctx.lineTo(fx + fw - 14, hy + 7);
      ctx.strokeStyle = P.lineLo; ctx.lineWidth = 1; ctx.stroke();

      pushHit(fx + 10, fy, fw - 20, hy - fy + 8, '复盘管线 · 点击查看依据', {
        title: '复盘管线 · 冻结主链',
        value: '正式关闭 → 完整复盘 → 四分支',
        sub: (DST.review || '独立复盘 Agent 加载专用复盘 Skill，形成由面到点的交互式复盘报告。'),
        source: srcOf('K1') + ' ；' + srcOf('K2'),
      });

      // 入口与复盘两行（步进器）
      const dotX = fx + 22, labX = fx + 38, tagX = fx + fw - 16;
      const y0 = hy + 16 + rowH / 2;
      const ROWS = [
        { id: 'entry', n: '正式关闭案件', tag: '3 类关闭',
          tip: '正式关闭案件 · 唯一入口',
          drill: { title: '循环入口 · 唯一', value: '正式关闭案件',
            sub: ((DST.entry && DST.entry.note) || '形成完整关闭记录后按固定入口进入能力进化循环') + '；三类：' + ((DST.entry && DST.entry.types) || '成功解决 / 合法例外 / 系统误报') + '。',
            source: srcOf('K1') + ' ；' + srcOf('K4') } },
        { id: 'review', n: '完整复盘', tag: '每案 · 不设初筛',
          tip: '完整复盘 · 交互式复盘报告',
          drill: { title: '复盘方式', value: '每案完整复盘',
            sub: DST.review || '独立复盘 Agent 加载专用复盘 Skill，完整读取全过程，形成由面到点的交互式复盘报告。',
            source: srcOf('K1') + ' ；' + srcOf('K2') } },
      ];
      // 主脊线：入口 → 复盘 → 四分支末行中点
      const branchTop = y0 + rowH * 1.5 + 8;
      const branchH = BR.length * cellH + (BR.length - 1) * cellGap;
      const spineBot = branchTop + branchH - cellH / 2;
      ctx.beginPath(); ctx.moveTo(dotX, y0 - rowH / 2); ctx.lineTo(dotX, spineBot);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1; ctx.stroke();

      ROWS.forEach((s, i) => {
        const gg = A(360 + i * 60);
        const cy = y0 + i * rowH + gg.dy;
        const st = s.id === curNode ? 'cur' : 'plain';
        ctx.save(); ctx.globalAlpha = gg.a;
        if (st === 'cur') {
          rr(fx + 12, cy - rowH / 2 + 1, fw - 24, rowH - 2, 4);
          ctx.fillStyle = 'rgba(34,81,255,0.07)'; ctx.fill();
          ctx.globalAlpha = gg.a * (0.3 + 0.55 * pulse);
          ctx.beginPath(); ctx.arc(dotX, cy, 7.5 + pulse * 1.5, 0, U.TAU);
          ctx.lineWidth = 1.5; ctx.strokeStyle = BLUE; ctx.stroke();
          ctx.globalAlpha = gg.a;
        }
        ctx.beginPath(); ctx.arc(dotX, cy, st === 'cur' ? 4 : 3.5, 0, U.TAU);
        if (st === 'cur') { ctx.fillStyle = BLUE; ctx.fill(); }
        else { ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = P.ink; ctx.stroke(); }
        txt(s.n, labX, cy, {
          s: st === 'cur' ? 13 : 12.5, w: st === 'cur' ? 700 : 400, f: SERIF,
          c: st === 'cur' ? BLUE : P.ink, b: 'middle', halo: 3.5,
        });
        txt(s.tag, tagX, cy, { s: 8, c: st === 'cur' ? BLUE_D : P.inkLo, a: 'right', b: 'middle' });
        ctx.restore();

        pushHit(fx + 10, y0 + i * rowH - rowH / 2, fw - 20, rowH, s.tip, s.drill);
      });

      // 四分支微缩流程（整宽单元行，肘线挂主脊）
      BR.forEach((b, i) => {
        const gg = A(440 + i * 70);
        const cx0 = fx + 30, cw = fw - 30 - 14;
        const cy0 = branchTop + i * (cellH + cellGap) + gg.dy;
        const midY = cy0 + cellH / 2;
        const isCur = b.id === curNode;
        const isLoop = !!b.entersLoop;
        ctx.save(); ctx.globalAlpha = gg.a;
        // 肘线：主脊 → 单元左缘
        ctx.beginPath(); ctx.moveTo(dotX, midY); ctx.lineTo(cx0, midY);
        ctx.strokeStyle = isCur ? BLUE : P.line; ctx.lineWidth = isCur ? 1.5 : 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(dotX, midY, 2, 0, U.TAU);
        ctx.fillStyle = isCur ? BLUE : P.inkLo; ctx.fill();
        // 单元体
        rr(cx0, cy0, cw, cellH, 4);
        if (isCur) { ctx.fillStyle = BLUE; ctx.fill(); }
        else if (isLoop) { ctx.fillStyle = 'rgba(34,81,255,0.06)'; ctx.fill(); }
        else { ctx.fillStyle = P.paper; ctx.fill(); }
        ctx.lineWidth = isCur || isLoop ? 1.4 : 1;
        ctx.strokeStyle = isCur ? BLUE : isLoop ? BLUE_S : P.line; ctx.stroke();
        if (isCur) { // 脉冲外晕
          ctx.globalAlpha = gg.a * (0.25 + 0.45 * pulse);
          ctx.lineWidth = 1.5; ctx.strokeStyle = BLUE;
          rr(cx0 - 2.5, cy0 - 2.5, cw + 5, cellH + 5, 6); ctx.stroke();
          ctx.globalAlpha = gg.a;
        }
        const inkCell = isCur ? '#ffffff' : isLoop ? BLUE_D : P.ink;
        txt(b.id, cx0 + 9, midY, { s: 8, w: 700, c: isCur ? '#ffffff' : isLoop ? BLUE : P.inkLo, b: 'middle' });
        txt(BR_SHORT[b.id] || b.name, cx0 + 34, midY, { s: 12, w: isCur || isLoop ? 700 : 400, f: SERIF, c: inkCell, b: 'middle' });
        txt(BR_TAG[b.id] || '', cx0 + cw - 9, midY, { s: 8, c: isCur ? '#dce5ff' : isLoop ? BLUE : P.inkLo, a: 'right', b: 'middle' });
        ctx.restore();

        pushHit(cx0, branchTop + i * (cellH + cellGap), cw, cellH, b.id + ' · ' + (BR_SHORT[b.id] || b.name), {
          title: '人工核实分支 ' + b.id + ' / ' + BR.length,
          value: BR_SHORT[b.id] || b.name,
          sub: b.name + '：' + b.route + '；' + b.next + (isLoop ? '（唯一进入诊断回路的分支；不直接认定为缺陷）' : '（不进入改进回路）'),
          source: srcOf('K1'),
        });
      });

      // B4 → 诊断回路三节链（检验 → 审批 → 沉淀/回滚）
      const chainTop = branchTop + branchH + 10;
      const b4cx = fx + 30 + (fw - 30 - 14) / 2;
      const arrowW = 16;
      const chipW = (fw - 28 - arrowW * 2) / 3;
      const chipX = i => fx + 14 + i * (chipW + arrowW);
      // 汇入肘线：B4 底中 → chip1 顶中
      ctx.save(); ctx.globalAlpha = g.a;
      ctx.beginPath();
      ctx.moveTo(b4cx, branchTop + branchH);
      ctx.lineTo(b4cx, chainTop - 5);
      ctx.lineTo(chipX(0) + chipW / 2, chainTop - 5);
      ctx.lineTo(chipX(0) + chipW / 2, chainTop);
      ctx.strokeStyle = BLUE_S; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();

      CHAIN.forEach((c, i) => {
        const gg = A(760 + i * 90);
        const x = chipX(i), yy = chainTop + gg.dy;
        const isCur = c.id === curNode;
        ctx.save(); ctx.globalAlpha = gg.a;
        rr(x, yy, chipW, chipH, 4);
        if (isCur) { ctx.fillStyle = BLUE; ctx.fill(); }
        else { ctx.fillStyle = P.paper; ctx.fill(); }
        ctx.lineWidth = isCur ? 1.4 : 1;
        ctx.strokeStyle = isCur ? BLUE : P.line; ctx.stroke();
        if (isCur) {
          ctx.globalAlpha = gg.a * (0.25 + 0.45 * pulse);
          ctx.lineWidth = 1.5; ctx.strokeStyle = BLUE;
          rr(x - 2.5, yy - 2.5, chipW + 5, chipH + 5, 6); ctx.stroke();
          ctx.globalAlpha = gg.a;
        }
        txt(c.n, x + chipW / 2, yy + chipH / 2, {
          s: 9, w: isCur ? 700 : 400, c: isCur ? '#ffffff' : P.inkMd, a: 'center', b: 'middle',
        });
        // 节间小箭头
        if (i < CHAIN.length - 1) {
          const ax = x + chipW + 4, ay = yy + chipH / 2;
          ctx.beginPath(); ctx.moveTo(ax, ay - 3); ctx.lineTo(ax + 7, ay); ctx.lineTo(ax, ay + 3); ctx.closePath();
          ctx.fillStyle = P.inkLo; ctx.fill();
        }
        ctx.restore();

        pushHit(x, chainTop, chipW, chipH, c.n + ' · 点击查看依据', {
          title: 'B4 诊断回路 · 节点 ' + (i + 1) + ' / ' + CHAIN.length,
          value: c.n,
          sub: c.d,
          source: srcOf(c.srcId) + (c.srcId === 'K1' ? '' : ' ；' + srcOf('K1')),
        });
      });
      ctx.restore();
      y += hCard + gap;
    }

    /* ── 4 · 数据牌（RPT.keyFacts 精选 4 条） ── */
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
        const neg = f.factTag === '待企业验证'; // 待验证语义 → 真语义红
        txt(f.label, PAD, ry + 15.5, { s: 8.5, c: P.inkLo });
        txt(trunc(f.value, CW - 130, '700 13.5px ' + SERIF), W - PAD, ry + 16,
          { s: 13.5, w: 700, f: SERIF, c: neg ? NEG : P.ink, a: 'right' });
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

    /* ── 5 · 四个 stat 块（入场 count-up；取自 RPT 集合长度） ── */
    if (STATS.length) {
      const bw = (CW - (STATS.length - 1) * 10) / STATS.length;
      STATS.forEach((s, i) => {
        const g = A(760 + i * 100);
        const x = PAD + i * (bw + 10), sy = y + g.dy;
        const p = REDUCE ? 1 : 1 - Math.pow(1 - U.clamp((t - (760 + i * 100)) / 1000, 0, 1), 3);
        const shown = Math.round(s.value * p);
        ctx.save(); ctx.globalAlpha = g.a;
        ctx.fillStyle = s.color;
        ctx.fillRect(x, sy, 18, 2); // 顶部编辑式短刻度
        txt(String(shown), x, sy + 26, { s: 21, w: 700, c: s.color });
        txt(s.label, x, sy + 40, { s: 8, c: P.inkLo });
        ctx.restore();
        pushHit(x - 2, y, bw + 4, 54, s.label + ' · ' + s.value, s.drill);
      });
      y += hStats + gap;
    }

    /* ── 6 · 来源行（frame 三段式之 src，底部锚定） ── */
    {
      const g = A(900);
      ctx.save(); ctx.globalAlpha = g.a;
      txt('Source · K1 02 专题工作稿 · K2 复盘台账 · K3 后端台账 · K4 01 工作稿',
        PAD, H - 27 + g.dy, { s: 8.5, c: P.inkLo });
      txt('全部数字为结构性计数（分支 / 检验 / 出口 / 待验证清单）· 待验证项见 §8',
        PAD, H - 13 + g.dy, { s: 8.5, c: P.inkLo });
      ctx.restore();
      pushHit(PAD, H - 40, CW, 36, '来源与纪律', {
        title: '来源与纪律', value: 'K1 · K2 · K3 · K4',
        sub: '右栏每个数字均可点击回溯到 K 锚点；完整出处、日期与来源分类见页脚 Sources。',
        source: srcOf('K1'),
      });
    }
  }

  /* ── 动画循环（仅右栏可见且非 reduced-motion 时运行） ── */
  function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
  function startLoop() { if (!raf) raf = requestAnimationFrame(loop); }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; }
  function requestDraw() { requestAnimationFrame(draw); }

  /* ── 入场触发：右栏滑入（.on）时 fires once（IO 入场由 main.js 经 .on 表达，
        固定栏不在文档流内，MutationObserver 是该契约的可靠探针）；reduced-motion 直接完成帧 ── */
  const rail = document.getElementById('dash-rail');
  function checkRail() {
    const on = !!(rail && rail.classList.contains('on'));
    if (on && !entered) { entered = true; enterT0 = performance.now(); }
    if (REDUCE) { if (on || entered) requestDraw(); }
    else if (on) startLoop(); else stopLoop();
  }
  if (rail) new MutationObserver(checkRail).observe(rail, { attributes: true, attributeFilter: ['class'] });
  checkRail();
  if (REDUCE) { entered = true; requestDraw(); }

  /* ── 窗口切换：与 section data-win 同步（main.js 派发 win-change） ── */
  window.addEventListener('win-change', e => {
    const id = e.detail && e.detail.win;
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
