/* ═══════════════════════════════════════════════════════════
   dashboard.js · P14 常驻右栏（context rail）· 经营事件循环
   宿主：#dash-canvas（<canvas>，460px 固定栏；≤1180px 整栏 display:none）
   数据：window.RPT（phases / keyFacts / dossier / signals / gates / unknowns）
         window.SRC（K 锚点 → 日期），宁可缺失不得编造
   工具：window.U（bindCanvas / showDrill / showTip / hideTip / PAL / clamp / smooth）
   自上而下：当前窗口徽章+标题 → 四段相位条 → 案件卡 E1-C1 状态机微缩
             → 数据牌（keyFacts ×4）→ 四个 stat 块（入场 count-up）
   说明：宿主为 <canvas>，U.frame 的 DOM 三段式无法渲染进 canvas 元素，
         故 frame 三段式（结论句标题 / mono 读法 sub / 来源行 src）以 canvas
         文字原样绘制，语义与 U.frame 契约一致；24.9 元案件为方案模拟并全程标注。
   无 topojson：按任务书不画地图，以档案夹（dossier folder）承载案件状态机。
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
  // 每窗口结论句 + 案件状态机高亮映射（窗口 → 状态下标；任务书给定七态顺序）
  const WINX = {
    'win-detect':      { concl: '事实先落库——异常只表示“值得调查”', state: 0 },
    'win-investigate': { concl: '查得到的 Agent 先查，查不到的交给人', state: 1 },
    'win-decide':      { concl: '证据齐了才上桌，决定权留给人', state: 3 },
    'win-verify':      { concl: '结果回读权威事实，目标达到才算结案', state: 6 },
  };
  const SEC_LABEL = {
    'sec-exec': '§0', 'sec-problem': '§1', 'sec-overview': '§2', 'sec-semantic': '§3',
    'sec-investigate': '§4', 'sec-case': '§5', 'sec-governance': '§6', 'sec-pilot': '§7',
    'sec-boundary': '§8', 'sec-appendix': '附录', 'sec-sources': 'Sources',
  };
  const covOf = p => (p.sections || []).map(s => SEC_LABEL[s] || s).join(' · ');

  // 案件状态机微缩（对应 RPT.timeline 时点；详情全部来自 data.js 注释级事实）
  const STATES = [
    { n: '调查取证中', t: 'T6',      d: 'Agent 独立上下文 A1 加载价格 Skill，由小到大补证；每次查询、返回、异常状态与证据版本全部留痕（方案模拟）。' },
    { n: '待人工补证', t: 'T7–T8',   d: '必需信息只能由人提供：创建补证请求并按分层规则通知；等待期禁止业务分析，按规则提醒与逐级升级。' },
    { n: '分析中',     t: 'T9',      d: '补证完成：以“事实汇总报告 + 补证内容”为共同输入恢复分析；记录人工材料、提交人与完整性确认结果。' },
    { n: '决策就绪',   t: 'T10',     d: '满足停止条件后形成决策就绪包：已确认事实、仍未知项、可能合法例外与建议；提示授权负责人复核。' },
    { n: '执行中',     t: 'T11–T12', d: '管理决定 + 责任执行；任务完成只表示执行成功，不表示问题解决。' },
    { n: '待结果验证', t: 'T13–T14', d: '案件保持打开，保存 next_check_at 并到期提醒；按业务里程碑回读 POS/SAP 权威事实。' },
    { n: '已正式关闭', t: 'T15',     d: '达到经营目标：标记成功解决，形成关闭记录并进入能力进化循环；“查不清”不是结案。' },
  ];

  const KF = Array.isArray(RPT.keyFacts) ? RPT.keyFacts : [];
  const PICK = ['已建成数字底座', '异常处置现状', '零售场景覆盖', '归并出口'];
  const plaqueFacts = (PICK.map(l => KF.find(f => f.label === l)).filter(Boolean).length
    ? PICK.map(l => KF.find(f => f.label === l)).filter(Boolean)
    : KF.slice(0, 4)).slice(0, 4);

  const DOS = RPT.dossier || {};
  const caseId = (DOS.caseId && DOS.caseId.value) || 'E1-C1';
  const obs = (DOS.observed && DOS.observed.value) != null ? DOS.observed.value : null;
  const base = (DOS.baseline && DOS.baseline.value) != null ? DOS.baseline.value : null;

  const sigN = (RPT.signals && Array.isArray(RPT.signals.entities)) ? RPT.signals.entities.length : null;
  const gateN = Array.isArray(RPT.gates) ? RPT.gates.length : null;
  const unkN = Array.isArray(RPT.unknowns) ? RPT.unknowns.length : null;
  // 经营事件数：演示案例仅 E1 一件（RPT.dossier 单案；RPT 无事件集合，缺失则不显示该块）
  const evN = DOS.caseId ? 1 : null;

  const STATS = [
    sigN != null && { label: '候选信号', value: sigN, color: P.ink, sim: true,
      drill: () => ({ title: '候选异常信号', value: String(sigN),
        sub: 'SIG-0001…SIG-0004 四种命运：独立成案 / 重复标记保留 / 归并成员 / 停在成案前；命运流见 §3。',
        source: srcOf('K10') + ' · 方案模拟' }) },
    evN != null && { label: '经营事件', value: evN, color: BLUE, sim: true,
      drill: () => ({ title: '经营事件', value: String(evN),
        sub: 'E1：价格异常事件（待调查，不等于违规结论）；由 SIG-0001 经解析记录 PR-0001 独立成案。',
        source: srcOf('K10') + ' · 方案模拟' }) },
    gateN != null && { label: '停止规则', value: gateN, color: P.ink, sim: false,
      drill: () => ({ title: '停止条件模块', value: String(gateN),
        sub: '哪里报错哪里停止，不跳过不猜测；全部模块无旁路（hasBypass 恒 false），精选清单见 §6。',
        source: srcOf('K9') }) },
    unkN != null && { label: '待验证项', value: unkN, color: NEG, sim: false,
      drill: () => ({ title: '待企业验证项', value: String(unkN),
        sub: '真实字段、接口、租户能力、组织权限、端到端回放全部为 unknown；现场核验前不写成已支持，清单见 §8。',
        source: srcOf('K10') }) },
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
    const wx = WINX[win.id] || { concl: '', state: 0 };
    const curState = wx.state;

    const PAD = 30, CW = W - PAD * 2;
    const hHeader = 96, hPhase = 46;
    const rowH = 20;
    const hCase = 12 + 34 + 8 + STATES.length * rowH + 12;   // tab + 头 + 间距 + 七态 + 底
    const hPlaque = plaqueFacts.length ? 16 + plaqueFacts.length * 23 : 0;
    const hStats = STATS.length ? 52 : 0;
    const blocks = [hHeader, hPhase, hCase, hPlaque, hStats].filter(h => h > 0);
    const sum = blocks.reduce((a, b) => a + b, 0);
    const gap = U.clamp((H - 34 - 44 - sum) / blocks.length, 12, 64);
    let y = 34 + Math.max(0, H - 44 - 34 - sum - gap * blocks.length) * 0.4;

    /* ── 1 · 当前窗口徽章 + 标题（结论句） ── */
    {
      const g = A(0);
      ctx.save(); ctx.globalAlpha = g.a * swA;
      const y0 = y + g.dy;
      txt('经营事件循环 · 常驻仪表', PAD, y0, { s: 9, c: P.inkLo });
      txt('LIVE', W - PAD, y0, { s: 9, c: BLUE, a: 'right', w: 700 });

      const badge = '窗口 ' + (cur + 1) + ' / ' + N;
      ctx.font = '700 10px ' + MONO;
      const bw = ctx.measureText(badge).width + 16;
      ctx.lineWidth = 1.5; ctx.strokeStyle = P.ink;
      ctx.strokeRect(PAD, y0 + 12, bw, 20);
      txt(badge, PAD + 8, y0 + 25.5, { s: 10, w: 700, c: P.ink });
      txt(trunc(win.name, CW - bw - 12, '700 15px ' + SERIF), PAD + bw + 12, y0 + 27, { s: 15, w: 700, f: SERIF, c: P.ink });

      txt(trunc(wx.concl, CW, 'italic 400 12.5px ' + SERIF), PAD, y0 + 50, { s: 12.5, i: true, f: SERIF, c: P.inkMd });
      txt('滚动切换窗口 · 点击任意元素查看依据与 K 编号 · 24.9 元案件为方案模拟', PAD, y0 + 68, { s: 8.5, c: P.inkLo });
      ctx.restore();

      pushHit(PAD, y, CW, 74, '当前窗口 · 点击下钻', {
        title: '当前窗口 · 相位 ' + (cur + 1) + ' / ' + N,
        value: win.name,
        sub: wx.concl + '。滚动探针命中章节时切换（main.js · 视口 35% 探针）；本窗口覆盖：' + (covOf(win) || '—') + '。',
        source: srcOf('K10'),
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
          source: srcOf('K10'),
        });
      }
      const g2 = A(560);
      ctx.save(); ctx.globalAlpha = g2.a;
      txt('相位 ' + (cur + 1) + ' / ' + N, PAD, y + barH + 13 + g2.dy, { s: 8, c: P.inkLo });
      txt(trunc(covOf(win), CW - 90, '400 8px ' + MONO), W - PAD, y + barH + 13 + g2.dy, { s: 8, c: P.inkLo, a: 'right' });
      ctx.restore();
      y += hPhase + gap;
    }

    /* ── 3 · 案件卡（档案夹 + E1-C1 七态状态机微缩） ── */
    {
      const g = A(320);
      const fx = PAD, fw = CW, fy = y + g.dy, fh = hCase;
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
      ctx.lineTo(fx + 106, fy);
      ctx.quadraticCurveTo(fx + 112, fy, fx + 116, fy + 12);
      ctx.closePath();
      ctx.fillStyle = P.hi; ctx.fill();
      ctx.strokeStyle = P.line; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 11, fy + 12); ctx.lineTo(fx + 115, fy + 12);
      ctx.strokeStyle = P.hi; ctx.stroke(); // 擦掉舌底缝线
      txt('CASE FILE · ' + caseId, fx + 18, fy + 9.5, { s: 8, w: 700, c: P.inkMd });

      // 卡头：档案夹小图标 + 案件名 + 模拟标记
      const hy = fy + 12 + 24;
      ctx.lineWidth = 1.2; ctx.strokeStyle = P.ink;
      rr(fx + 18, hy - 9, 17, 11, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 18, hy - 9); ctx.lineTo(fx + 18, hy - 12);
      ctx.lineTo(fx + 25, hy - 12); ctx.lineTo(fx + 27, hy - 9); ctx.closePath();
      ctx.fillStyle = P.hi; ctx.fill(); ctx.stroke();
      txt(trunc(caseId + ' · 价格异常事件（待调查）', fw - 150, '700 13px ' + SERIF), fx + 42, hy, { s: 13, w: 700, f: SERIF, c: P.ink });
      const simTag = (obs != null && base != null ? obs + ' / ' + base + ' 元 · ' : '') + '方案模拟';
      txt(trunc(simTag, 118, '400 8px ' + MONO), fx + fw - 14, hy, { s: 8, c: P.inkLo, a: 'right' });
      ctx.beginPath(); ctx.moveTo(fx + 14, hy + 9); ctx.lineTo(fx + fw - 14, hy + 9);
      ctx.strokeStyle = P.lineLo; ctx.lineWidth = 1; ctx.stroke();

      pushHit(fx + 10, fy, fw - 20, hy - fy + 10, '案件 ' + caseId + ' · 点击查看依据', {
        title: '调查案件 · 价格试点（方案模拟）',
        value: caseId,
        sub: 'SIG-0001 独立成案 → 经营事件 E1 → 调查案件 C1；观测 ' + (obs != null ? obs + ' 元' : '—') +
             ' vs 候选价格基准 ' + (base != null ? base + ' 元' : '—') + '（基准适用性待确认；待调查不等于违规结论）。',
        source: srcOf('K10') + ' · 方案模拟',
      });

      // 七态步进器
      const dotX = fx + 24, labX = fx + 42, tagX = fx + fw - 14;
      const y0 = hy + 20 + rowH / 2;
      ctx.beginPath(); ctx.moveTo(dotX, y0); ctx.lineTo(dotX, y0 + (STATES.length - 1) * rowH);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1; ctx.stroke();
      STATES.forEach((s, i) => {
        const gg = A(360 + i * 60);
        const cy = y0 + i * rowH + gg.dy;
        const st = i < curState ? 'done' : i === curState ? 'cur' : 'todo';
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
        if (st === 'done') { ctx.fillStyle = P.ink; ctx.fill(); }
        else if (st === 'cur') { ctx.fillStyle = BLUE; ctx.fill(); }
        else { ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = P.inkLo; ctx.stroke(); }
        txt(s.n, labX, cy, {
          s: st === 'cur' ? 13 : 12.5, w: st === 'cur' ? 700 : 400, f: SERIF,
          c: st === 'cur' ? BLUE : st === 'done' ? P.ink : P.inkLo, b: 'middle',
        });
        txt(s.t, tagX, cy, { s: 8, c: st === 'cur' ? BLUE_D : P.inkLo, a: 'right', b: 'middle' });
        ctx.restore();

        pushHit(fx + 10, y0 + i * rowH - rowH / 2, fw - 20, rowH, s.n + ' · ' + s.t, {
          title: '案件状态 ' + (i + 1) + ' / ' + STATES.length,
          value: s.n,
          sub: s.d + (i === curState ? '（当前窗口对应高亮状态）' : ''),
          source: srcOf('K9') + ' ；' + srcOf('K10'),
        });
      });
      ctx.restore();
      y += hCase + gap;
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
        const neg = f.label === '异常处置现状'; // 处置耗时 4–5 天：缺口语义 → 真语义红
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

    /* ── 5 · 四个 stat 块（入场 count-up） ── */
    if (STATS.length) {
      const bw = (CW - (STATS.length - 1) * 10) / STATS.length;
      STATS.forEach((s, i) => {
        const g = A(760 + i * 100);
        const x = PAD + i * (bw + 10), sy = y + g.dy;
        const p = REDUCE ? 1 : 1 - Math.pow(1 - U.clamp((t - (760 + i * 100)) / 1000, 0, 1), 3);
        const shown = Math.round(s.value * p);
        ctx.save(); ctx.globalAlpha = g.a;
        ctx.fillStyle = s.color === NEG ? NEG : s.color;
        ctx.fillRect(x, sy, 18, 2); // 顶部编辑式短刻度
        txt(String(shown), x, sy + 26, { s: 21, w: 700, c: s.color });
        txt(s.label, x, sy + 40, { s: 8, c: P.inkLo });
        if (s.sim) txt('方案模拟', x, sy + 50, { s: 7.5, c: BLUE_S });
        ctx.restore();
        pushHit(x - 2, y, bw + 4, 54, s.label + ' · ' + s.value, s.drill);
      });
      y += hStats + gap;
    }

    /* ── 6 · 来源行（frame 三段式之 src，底部锚定） ── */
    {
      const g = A(900);
      ctx.save(); ctx.globalAlpha = g.a;
      /* 评审修复 3：来源行压缩到栏宽内；完整出处保留在页脚 Sources */
      txt('Source · K1 年报 · K3 赛题 · K9 工作稿 · K10 评委稿',
        PAD, H - 27 + g.dy, { s: 8.5, c: P.inkLo });
      txt('案件、信号与事件计数为方案模拟（SIMULATED）· 待企业验证项见 §8',
        PAD, H - 13 + g.dy, { s: 8.5, c: P.inkLo });
      ctx.restore();
      pushHit(PAD, H - 40, CW, 36, '来源与纪律', {
        title: '来源与纪律', value: 'K1 · K3 · K9 · K10',
        sub: '右栏每个数字均可点击回溯到 K 锚点；完整出处、日期与四源分类见页脚 Sources & method。',
        source: srcOf('K10'),
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
