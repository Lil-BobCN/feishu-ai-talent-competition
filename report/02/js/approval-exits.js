/* ═══════════════════════════════════════════════════════════
   approval-exits.js · §6.2 审批三出口 DOM 榜（行式尺度感仿 P7 odds board，
   但不伪造概率：本行无主观概率数据，尺度列换为「出口后的路由」拓扑轨）
   宿主：#approval-chart（.wide，内容宽 744px，class chart-frame）
   数据：window.RPT.approvals（3 条：批准 hl / 暂缓 / 驳回，各含 flow 与 keeps）
   行式：出口名（serif 700）｜保留什么（摘要两行，全文进 drill）
        ｜出口后的路由（SVG 拓扑轨：批准闭环 / 暂缓折返 / 驳回归档）
        ｜后续走向（mono 摘要）
   结构编码（§U.9）：出口类别 × 记录保留语义 × 出口后拓扑（闭环/折返/归档），
   不是状态点列表；路由轨标签全部缩写自 data.js flow/keeps 原文，不新增事实。
   颜色纪律：ink 阶 + 电蓝族 #2251ff/#1233b8/#7d9bff；不用真红
   （驳回是留痕的关闭语义，非缺口/风险，故终节点用 ink 而非 PAL.neg）。
   依据：02 专题工作稿 §6 行 113–126（含行 124–126 三出口定义）、行 168 · K1。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('approval-chart');
  if (!host) return;
  if (!window.U) return;
  const approvals = (window.RPT && window.RPT.approvals) || [];
  if (!approvals.length) return; // 宁可缺失不得编造（§U.5）

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── 图表骨架（title = 结论句；sub = mono 读法+交互；src = 来源+日期） ── */
  const body = U.frame(host, {
    title: '审批只有三个出口：一个通向受控运行，三个都留下记录',
    sub: '每行 = 一个审批出口 · 第二列 = 该出口保留什么（摘要两行，全文在点击详情）· 路由轨：批准回 01 闭环 / 暂缓折返重提 / 驳回关闭归档 · 点击任意行查看母稿依据与复核记录',
    src: '研究整理 — 02 能力进化循环专题工作稿 §6 行 113–126、行 168 · K1（2026-07-23 定稿 · 2026-07-24 最终复核）',
  });

  /* ── 行级展示元数据（全部为 data.js flow/keeps 原文的缩写，不新增事实） ── */
  const META = {
    '批准': { subName: '回 01 · 受控运行', pill: true, value: '候选版本 · 受控运行', kind: 'approve' },
    '暂缓': { subName: '不进入真实运行', pill: false, value: '折返 · 条件满足重提', kind: 'hold' },
    '驳回': { subName: '关闭本次申请', pill: false, value: '关闭 · 记录继续保留', kind: 'reject' },
  };

  /* ── 作用域样式（不碰全站 css，全部前缀 ap- 限定在 #approval-chart 下） ── */
  const style = document.createElement('style');
  style.textContent = `
#approval-chart .ap-head, #approval-chart .ap-row {
  display:grid; grid-template-columns:132px minmax(0,1fr) 208px 158px;
  grid-template-areas:"name keeps track flow"; column-gap:14px;
}
#approval-chart .ap-head {
  padding:0 8px 7px; border-bottom:1px solid var(--line);
  font-family:var(--mono); font-size:9.5px; letter-spacing:.12em;
  color:var(--ink-lo); text-transform:uppercase;
}
#approval-chart .ap-row {
  padding:12px 8px; border-bottom:1px solid var(--line-lo);
  cursor:pointer; align-items:center;
  opacity:0; transform:translateY(10px);
  transition:opacity .5s ease var(--d,0ms), transform .5s ease var(--d,0ms), background-color .15s ease 0ms;
}
#approval-chart .ap-row:hover { background:var(--paper-hi); }
#approval-chart .ap-row:focus-visible { outline:2px solid #2251ff; outline-offset:-2px; }
#approval-chart .ap-live .ap-row { opacity:1; transform:none; }
#approval-chart .ap-row.ap-hl { background:rgba(34,81,255,.055); }
#approval-chart .ap-row.ap-hl:hover { background:rgba(34,81,255,.09); }
#approval-chart .ap-name { grid-area:name; min-width:0; }
#approval-chart .ap-kicker {
  font-family:var(--mono); font-size:8.5px; letter-spacing:.16em;
  color:var(--ink-lo); margin:0 0 3px; text-transform:uppercase;
}
#approval-chart .ap-outcome {
  font-family:var(--serif); font-weight:700; font-size:17px;
  color:var(--ink); margin:0 0 3px; line-height:1.2;
}
#approval-chart .ap-subname {
  font-family:var(--mono); font-size:9px; color:var(--ink-lo);
  margin:0; line-height:1.4; letter-spacing:.02em;
}
#approval-chart .ap-subname.ap-pill {
  display:inline-block; color:#1233b8; border:1px solid #2251ff;
  background:#fff; padding:2px 7px; letter-spacing:.06em;
}
#approval-chart .ap-keeps {
  grid-area:keeps; min-width:0; font-family:var(--serif); font-size:12px;
  color:var(--ink-md); margin:0; line-height:1.55; overflow-wrap:break-word;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
#approval-chart .ap-track { grid-area:track; min-width:0; }
#approval-chart .ap-track svg { display:block; width:100%; height:auto; }
#approval-chart .ap-flow {
  grid-area:flow; min-width:0; font-family:var(--mono); font-size:9.5px;
  color:var(--ink-md); margin:0; line-height:1.55; overflow-wrap:break-word;
  display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden;
}
#approval-chart .ap-foot {
  margin-top:12px; padding-top:10px; border-top:1px solid var(--line-lo);
  font-family:var(--serif); font-style:italic; font-size:12px;
  color:var(--ink-md); line-height:1.6; display:flex; gap:8px;
}
#approval-chart .ap-foot::before {
  content:""; flex:0 0 auto; width:9px; height:9px; background:#2251ff; margin-top:5px;
}
@media (max-width:640px) {
  #approval-chart .ap-head { display:none; }
  #approval-chart .ap-row {
    grid-template-columns:minmax(0,1fr); row-gap:8px;
    grid-template-areas:"name" "track" "keeps" "flow";
  }
  #approval-chart .ap-track svg { max-width:260px; }
}
@media (prefers-reduced-motion: reduce) {
  #approval-chart .ap-row { transition:none !important; }
}`;
  document.head.appendChild(style);

  /* ── 列头（mono ALL-CAPS，对齐行网格） ── */
  const head = document.createElement('div');
  head.className = 'ap-head';
  head.innerHTML = '<span>审批出口</span><span>保留什么（摘要）</span><span>出口后的路由</span><span>后续走向</span>';
  body.appendChild(head);

  /* ── SVG 路由轨（viewBox 0 0 208 56；标签全部 paint-order:stroke 纸色光晕） ── */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const n = document.createElementNS(SVGNS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
  const txt = (x, y, s, opt = {}) => {
    const t = el('text', {
      x, y, 'text-anchor': opt.anchor || 'middle', 'font-size': opt.size || 9,
      fill: opt.fill || '#42566a',
      style: 'paint-order:stroke;stroke:#ffffff;stroke-width:3.5px',
    });
    t.textContent = s; return t;
  };
  const arrow = (x2, y, color) => el('path', { d: `M${x2},${y} l-6,-3.4 v6.8 Z`, fill: color });
  const startNode = () => el('circle', { cx: 10, cy: 22, r: 4, fill: '#051c2c' });
  const archiveBox = (x, above, below) => {
    const g = el('g', {});
    g.appendChild(el('rect', { x, y: 12, width: 56, height: 24, rx: 2, fill: '#f7f9fc', stroke: '#051c2c', 'stroke-width': 1 }));
    g.appendChild(el('line', { x1: x + 8, y1: 20, x2: x + 48, y2: 20, stroke: '#8595a6', 'stroke-width': 1 }));
    g.appendChild(el('line', { x1: x + 8, y1: 27, x2: x + 40, y2: 27, stroke: '#8595a6', 'stroke-width': 1 }));
    if (above) g.appendChild(txt(x + 28, 8, above, { size: 8 }));
    if (below) g.appendChild(txt(x + 28, 48, below, { size: 8.5, fill: '#8595a6' }));
    return g;
  };

  const TRACKS = {
    /* 批准：申请 → 候选版本 → 回 01 受控运行 →（虚线回路）案件正式关闭再进 02 复盘 */
    approve() {
      const s = el('svg', { viewBox: '0 0 208 56', role: 'img', 'aria-label': '批准路由：形成候选 Agent 能力版本，回 01 受控运行，案件正式关闭后再次进入 02 复盘' });
      s.appendChild(startNode());
      s.appendChild(el('line', { x1: 14, y1: 22, x2: 54, y2: 22, stroke: '#051c2c', 'stroke-width': 1.2 }));
      s.appendChild(arrow(58, 22, '#051c2c'));
      s.appendChild(el('rect', { x: 62, y: 12, width: 62, height: 20, rx: 3, fill: 'rgba(34,81,255,.08)', stroke: '#2251ff', 'stroke-width': 1.2 }));
      s.appendChild(txt(93, 26, '候选版本', { size: 9, fill: '#1233b8' }));
      s.appendChild(txt(158, 10, '回 01 受控运行', { size: 9, fill: '#1233b8' }));
      s.appendChild(el('line', { x1: 128, y1: 22, x2: 182, y2: 22, stroke: '#2251ff', 'stroke-width': 1.4 }));
      s.appendChild(arrow(186, 22, '#2251ff'));
      s.appendChild(el('circle', { cx: 192, cy: 22, r: 4, fill: '#2251ff' }));
      s.appendChild(el('path', { d: 'M192,28 C192,50 93,50 93,38', fill: 'none', stroke: '#7d9bff', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }));
      s.appendChild(el('path', { d: 'M93,34 l-3.4,6 6.8,0 Z', fill: '#7d9bff' }));
      s.appendChild(txt(142, 54, '案件正式关闭 · 再进 02 复盘', { size: 8.5, fill: '#8595a6' }));
      return s;
    },
    /* 暂缓：申请 → 暂停节点 →（虚线折返）条件满足重新提交；申请+版本+记录全部保留 */
    hold() {
      const s = el('svg', { viewBox: '0 0 208 56', role: 'img', 'aria-label': '暂缓路由：不进入真实运行，条件满足后重新提交审批；改进申请、隔离试验版本与试验记录全部保留' });
      s.appendChild(startNode());
      s.appendChild(el('line', { x1: 14, y1: 22, x2: 52, y2: 22, stroke: '#051c2c', 'stroke-width': 1.2 }));
      s.appendChild(arrow(56, 22, '#051c2c'));
      s.appendChild(el('circle', { cx: 66, cy: 22, r: 8, fill: '#ffffff', stroke: '#051c2c', 'stroke-width': 1.2 }));
      s.appendChild(el('rect', { x: 63, y: 18, width: 2.4, height: 8, fill: '#051c2c' }));
      s.appendChild(el('rect', { x: 67.6, y: 18, width: 2.4, height: 8, fill: '#051c2c' }));
      s.appendChild(el('path', { d: 'M66,30 C66,52 10,52 10,28', fill: 'none', stroke: '#42566a', 'stroke-width': 1.1, 'stroke-dasharray': '3 3' }));
      s.appendChild(el('path', { d: 'M10,24 l-3.4,6 6.8,0 Z', fill: '#42566a' }));
      s.appendChild(txt(50, 54, '条件满足 · 重新提交', { size: 8.5, fill: '#42566a' }));
      s.appendChild(archiveBox(122, '申请 + 版本 + 记录', '全部保留'));
      return s;
    },
    /* 驳回：申请 → 关闭终节点（ink 实心方块）→（虚线）记录归档继续保留 */
    reject() {
      const s = el('svg', { viewBox: '0 0 208 56', role: 'img', 'aria-label': '驳回路由：关闭本次改进申请；原始案件、报告和试验记录继续保留' });
      s.appendChild(startNode());
      s.appendChild(txt(60, 10, '关闭本次申请', { size: 9, fill: '#051c2c' }));
      s.appendChild(el('line', { x1: 14, y1: 22, x2: 100, y2: 22, stroke: '#051c2c', 'stroke-width': 1.2 }));
      s.appendChild(el('rect', { x: 104, y: 16, width: 12, height: 12, fill: '#051c2c' }));
      s.appendChild(el('line', { x1: 120, y1: 22, x2: 134, y2: 22, stroke: '#8595a6', 'stroke-width': 1.1, 'stroke-dasharray': '3 3' }));
      s.appendChild(arrow(138, 22, '#8595a6'));
      s.appendChild(archiveBox(142, '案件+报告+试验记录', '继续保留'));
      return s;
    },
  };

  /* ── 三行出口 ── */
  const SRC_LINE = '02 能力进化循环专题工作稿 §6.2 审批三出口（行 113–126，含行 124–126 出口定义；行 168 出口与复核逻辑）· K1 · 2026-07-23 定稿 · 2026-07-24 最终复核';
  approvals.forEach((a, i) => {
    const meta = META[a.outcome] || { subName: '', pill: false, value: a.outcome, kind: null };

    const row = document.createElement('div');
    row.className = 'ap-row' + (a.hl ? ' ap-hl' : '');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('data-drill-keep', '');
    row.setAttribute('aria-label', `审批出口 ${a.outcome}：${a.flow}。${a.keeps}。点击查看母稿依据。`);
    row.style.setProperty('--d', reduced ? '0ms' : (i * 90) + 'ms');

    /* 出口名（serif 700）+ mono 子注 */
    const name = document.createElement('div');
    name.className = 'ap-name';
    const kicker = document.createElement('p');
    kicker.className = 'ap-kicker';
    kicker.textContent = `EXIT ${String(i + 1).padStart(2, '0')}`;
    const oc = document.createElement('p');
    oc.className = 'ap-outcome';
    oc.textContent = a.outcome;
    name.append(kicker, oc);
    if (meta.subName) {
      const sn = document.createElement('p');
      sn.className = 'ap-subname' + (meta.pill ? ' ap-pill' : '');
      sn.textContent = meta.subName;
      name.appendChild(sn);
    }

    /* 保留什么（摘要两行，全文进 drill） */
    const keeps = document.createElement('p');
    keeps.className = 'ap-keeps';
    keeps.textContent = a.keeps;

    /* 出口后的路由（SVG 拓扑轨；无对应类型则留空，不伪造） */
    const track = document.createElement('div');
    track.className = 'ap-track';
    if (meta.kind && TRACKS[meta.kind]) track.appendChild(TRACKS[meta.kind]());

    /* 后续走向（mono 摘要，全文进 drill） */
    const flow = document.createElement('p');
    flow.className = 'ap-flow';
    flow.textContent = a.flow;

    const open = (x, y) => {
      U.showDrill({
        title: `审批出口 ${i + 1} / 3 · ${a.outcome}`,
        value: meta.value,
        sub: `<b>走向</b>：${esc(a.flow)}<br><b>保留</b>：${esc(a.keeps)}<br><span style="opacity:.72">依据：02 专题工作稿 §6 行 124–126 三出口定义与行 168 出口复核逻辑；审批出口只有三个，无第四个去向；暂缓复核的提醒频率与责任人属 §8 待企业验证项（不写成已配置）。</span>`,
        source: SRC_LINE,
        x, y,
      });
    };
    row.addEventListener('click', ev => open(ev.clientX, ev.clientY));
    row.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const r = row.getBoundingClientRect();
        open(r.left + r.width * 0.6, r.top + 18);
      }
    });

    row.append(name, keeps, track, flow);
    body.appendChild(row);
  });

  /* ── 图尾一句（本图主题声明） ── */
  const foot = document.createElement('p');
  foot.className = 'ap-foot';
  foot.textContent = '管理层批准的不是全集团永久发布，而是带范围、验收条件和回滚责任的候选版本。';
  body.appendChild(foot);

  /* ── 入场动画：IO fires once；reduced-motion 直接完成帧（§U.4） ── */
  const goLive = () => body.classList.add('ap-live');
  if (reduced || !('IntersectionObserver' in window)) {
    goLive();
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { goLive(); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(host);
  }
})();
