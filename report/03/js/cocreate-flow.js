/* ═══════════════════════════════════════════════════════════
   cocreate-flow.js · 共创顺序流 ｜ 宿主：#cocreate-chart（§2，.wide.xl）
   数据契约：window.RPT.cocreateSteps = { main[6]（N6 gate:true）、
            branches[3]（采纳 / 调整 / 暂缓或否决）、note } —— 只用已有键。
   真源行号（03 工作稿，已逐行核验）：
     主链 A→F 行26–31；采纳 F→G 行31、G→I 行34、I→J 行35、J→B 行36；
     调整 F→C 行32；暂缓或否决 F→H 行33、H -.条件变化.-> B 行37；注 行40。
   结构变量（≥2，禁纯文字框链）：
     ① 顺序：x 位置 + mono 序号 + 主链箭头（N1→N6）；
     ② 分支拓扑：闸口三分支——前进链（3 子节点）/ 中段回流（回 N3）/
        终点暂存（H），外加「真实结果回到 03」回流弧（真源行36 J→B）；
     ③ 线型语义：实线=建议前进、墨虚线=回流、红虚线=不前进（仅此处用红）。
   红线遵守：不虚构收益/成本/时间数字；「自动化」只出现于否定句（行40 注）；
     候选顺序标注「方案推断，不是圣农批准的路线」（N4 drill）。
   取舍说明：真源行37 的 H-.->B 虚线未画出——会与采纳回流弧在左侧交叉，
     已在 H 节点 drill 中注明，保持「宁可缺失不得编造/不得误导」。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('cocreate-chart');
  if (!host) return;
  host.setAttribute('data-module', 'cocreate-flow');
  host.removeAttribute('data-placeholder');

  const RPT = window.RPT || {};
  const U = window.U;
  const steps = RPT.cocreateSteps;
  if (!U || !steps || !Array.isArray(steps.main) || !steps.main.length) return; // 宁可缺失，不得编造
  const PAL = U.PAL;
  const SERIF = '"et-book","Songti SC",Palatino,Georgia,serif';
  const MONO = 'Menlo,Consolas,monospace';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 作用域样式（前缀 cf03-；不碰全站 css，仅覆写本图 svg 内 serif） ── */
  const css = `
    #cocreate-chart .cf03-svg { display:block; width:100%; height:auto; }
    #cocreate-chart .cf03-svg text { font-family:${MONO}; }
    #cocreate-chart .cf03-svg text.cf03-serif { font-family:${SERIF}; }
    #cocreate-chart .cf03-svg .cf03-n { opacity:0; transform:translateY(10px);
      transition:opacity .45s ease, transform .45s ease; }
    #cocreate-chart .cf03-svg .cf03-f { opacity:0; transition:opacity .5s ease; }
    #cocreate-chart .cf03-svg .cf03-e { stroke-dasharray:1; stroke-dashoffset:1;
      transition:stroke-dashoffset .55s ease; }
    #cocreate-chart .cf03-svg.cf03-on .cf03-n { opacity:1; transform:none; }
    #cocreate-chart .cf03-svg.cf03-on .cf03-f { opacity:1; }
    #cocreate-chart .cf03-svg.cf03-on .cf03-e { stroke-dashoffset:0; }
    #cocreate-chart .cf03-svg .cf03-hit { cursor:pointer; outline:none; }
    #cocreate-chart .cf03-svg g.cf03-hit:hover .cf03-frame,
    #cocreate-chart .cf03-svg g.cf03-hit:focus .cf03-frame { stroke:${PAL.red}; stroke-width:1.8px; }
    #cocreate-chart .cf03-svg g.cf03-hit:focus .cf03-frame { stroke-dasharray:3 2; }
    #cocreate-chart .cf03-svg path.cf03-eh { fill:none; stroke:#000; stroke-opacity:0; stroke-width:16; pointer-events:stroke; }
    @media (prefers-reduced-motion: reduce) {
      #cocreate-chart .cf03-svg .cf03-n,
      #cocreate-chart .cf03-svg .cf03-f,
      #cocreate-chart .cf03-svg .cf03-e { transition:none !important; }
    }`;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── 图表骨架（U.frame 三件套：结论句标题 / mono 读法 / 来源+日期） ── */
  const body = U.frame(host, {
    title: '共创的终点不是方案交付，是企业的选择',
    sub: '读法 · N1→N6 建议讨论顺序；闸口三分支——蓝实线=采纳前进 · 墨虚线=调整回流 · 红虚线=暂缓或否决（不前进） · 点击下钻',
    src: '03 业务扩域循环专题工作稿 §1（真源行 24–40）· K1 · 2026-07-24',
  });

  /* ── 数据装配（标签全部来自 RPT；分支走向按「→」切分） ── */
  const main = steps.main;
  const brFlow = {};
  (steps.branches || []).forEach(b => { brFlow[b.choice] = b.flow || ''; });
  const adoptSegs = (brFlow['采纳'] || '').split('→').map(s => s.trim()).filter(Boolean);
  const adjFlow = brFlow['调整'] || '';
  const holdFlow = brFlow['暂缓或否决'] || '';
  const adjM = /（(N\d+)）/.exec(adjFlow);
  const adjTargetId = adjM ? adjM[1] : 'N3';           // 回流目标由数据解析，拓扑不硬编
  const note = steps.note || '';

  /* ── 几何（固定 viewBox，宽度 100% 自适应；QA 铁律：不测容器实宽） ── */
  const W = 920, H = 404;
  const ROW_Y = 40, PW = 124, PH = 74, STEP = 155, X0 = 10;   // 主链牌匾
  const MID_Y = ROW_Y + PH / 2, BOT_Y = ROW_Y + PH;           // 77 / 114
  const GW = 180, GH = 60, GY = 232, GX = [530, 310, 90];     // 采纳支三块（右→左=回到03）
  const HX = 706, HY = 296, HW = 200, HH = 56;                // 暂存牌匾
  const nodes = main.map((n, i) => ({ id: n.id, label: n.label, gate: !!n.gate,
    x: X0 + i * STEP, cx: X0 + i * STEP + PW / 2 }));
  const gateIdx = nodes.findIndex(n => n.gate);
  const adjNode = nodes.find(n => n.id === adjTargetId) || nodes[2];

  /* ── CJK 换行：优先「、，；：」后 /「与和及并或」前 / 数字前断行，其次中分 ── */
  function wrapCJK(text, maxCh) {
    const chars = [...text];
    const n = chars.length;
    if (n <= maxCh) return [text];
    const cand = [];
    for (let i = 2; i <= n - 2; i++) {
      const c = chars[i], p = chars[i - 1];
      let sem = 0;
      if (/[、，；：。]/.test(p)) sem = 1;
      else if (/[与和及并或]/.test(c)) sem = 1;
      else if (/[0-9A-Za-z]/.test(c) && !/[0-9A-Za-z]/.test(p)) sem = 1;
      if (sem && i <= maxCh && n - i <= maxCh) cand.push({ i, score: Math.abs(i - n / 2) });
    }
    let brk;
    if (cand.length) { cand.sort((a, b) => a.score - b.score); brk = cand[0].i; }
    else brk = Math.min(maxCh, Math.ceil(n / 2));
    return [chars.slice(0, brk).join('').trim(), chars.slice(brk).join('').trim()];
  }

  /* ── SVG 基础 ── */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'cf03-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '共创顺序流：六个节点到企业选择闸口，分出采纳、调整、暂缓或否决三支');
  function EL(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, o) {
    const t = EL('text', { x: o.x, y: o.y, 'text-anchor': o.anchor || 'middle',
      'font-size': o.size, 'font-weight': o.weight || 400, fill: o.fill }, parent);
    if (o.family === 'serif') t.setAttribute('class', (o.cls || '') + ' cf03-serif');
    else if (o.cls) t.setAttribute('class', o.cls);
    if (o.ls) t.setAttribute('letter-spacing', o.ls);
    if (o.halo) { t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', '#ffffff'); t.setAttribute('stroke-width', 4); }
    t.textContent = o.str;
    return t;
  }

  /* 箭头 markers（实线蓝/墨/红三色独立 marker，与线色一致） */
  const defs = EL('defs', {}, svg);
  [['ah-ink', PAL.ink], ['ah-blue', PAL.red], ['ah-neg', PAL.neg]].forEach(([id, color]) => {
    const m = EL('marker', { id: 'cf03-' + id, viewBox: '0 0 10 10', refX: 8.2, refY: 5,
      markerWidth: 7.2, markerHeight: 7.2, orient: 'auto-start-reverse' }, defs);
    EL('path', { d: 'M0,1.2 L8.8,5 L0,8.8 Z', fill: color }, m);
  });

  /* ── 图层：边在下，节点在中，文字与命中层在上（QA#4：后画线不穿字） ── */
  const gEdges = EL('g', {}, svg);
  const gNodes = EL('g', {}, svg);
  const gNote = EL('g', {}, svg);
  const gHit = EL('g', {}, svg);

  /* ── drill 登记：每个节点与分支都可下钻（含义 + 母稿行号 + K 编号 + 日期） ── */
  const SRC = 'K1 · 03 业务扩域循环专题工作稿';
  const drills = {};   // key → {title, value, sub, source, tip}
  function reg(key, d) { drills[key] = d; }

  const nodeSubs = {
    N1: '共创起点：已有试点形成可参考结果——03 的三项启动参考条件之一为「可核验结果」（另两项：重复运行、风险已说明；大致参考，不是固定门槛）',
    N2: '方向来自企业：与管理层沟通经营目标与治理诉求（五步法第一步）；FDE 不替企业定目标',
    N3: '共同盘点资料、已有能力与现实约束；企业选择「调整」时回到本节点重盘（真源行 32：F → C）',
    N4: '提出候选场景与首选建议；候选顺序为方案推断，不是圣农批准的路线（与 §5 同口径）',
    N5: '共同形成分阶段业务扩域蓝图；不设时间表，不承诺按此顺序实施（与 §7 同口径）',
    N6: '闸口：扩域选择与实施路径均为建议——企业可确认、调整、暂缓或否决（4 种走向）；FDE 不替企业拍板，信息不足时可建议暂缓',
  };
  nodes.forEach((n, i) => {
    reg(n.id, { title: `共创顺序 · ${n.id}（${i + 1}/${nodes.length}，建议性）`, value: n.label,
      sub: nodeSubs[n.id] || '建议讨论顺序中的一环',
      source: `${SRC} 行${26 + i} · 2026-07-24`, tip: `${n.id} · 点击下钻` });
  });

  /* ── 主链边（N_i → N_{i+1}，实线墨，顺序语义） ── */
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    const p = EL('path', { d: `M${a.x + PW},${MID_Y} L${b.x},${MID_Y}`, fill: 'none',
      stroke: PAL.ink, 'stroke-width': 1.4, 'marker-end': 'url(#cf03-ah-ink)',
      class: 'cf03-e', pathLength: 1, style: `transition-delay:${45 + i * 85}ms` }, gEdges);
    reg('chain' + i, { title: `建议顺序 · ${a.id} → ${b.id}`, value: `${a.id} → ${b.id}`,
      sub: '箭头只表达建议的讨论顺序，不代表自动化工作流（真源行 40 注）',
      source: `${SRC} 行${26 + i}–${27 + i} · 2026-07-24`, tip: `${a.id} → ${b.id} · 点击下钻` });
    const hp = EL('path', { d: p.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit);
    bindHit(hp, 'chain' + i);
  }

  /* ── 主链牌匾（白底墨框；mono 序号 + serif 名；N6 双框闸口） ── */
  nodes.forEach((n, i) => {
    const g = EL('g', { class: 'cf03-n cf03-hit', 'data-drill-keep': '1', tabindex: '0',
      role: 'button', 'aria-label': `${n.id} ${n.label}`, style: `transition-delay:${i * 85}ms` }, gNodes);
    const frame = EL('rect', { x: n.x, y: ROW_Y, width: PW, height: PH, rx: 2,
      fill: '#ffffff', stroke: PAL.ink, 'stroke-width': n.gate ? 1.6 : 1.2, class: 'cf03-frame' }, g);
    if (n.gate) EL('rect', { x: n.x + 4.5, y: ROW_Y + 4.5, width: PW - 9, height: PH - 9,
      fill: 'none', stroke: PAL.ink, 'stroke-width': 0.75 }, g);   // 闸口双框
    txt(g, { x: n.cx, y: ROW_Y + 20, str: n.gate ? `${n.id} · GATE` : n.id,
      size: 9, fill: n.gate ? PAL.red : PAL.inkLo, weight: n.gate ? 700 : 400, ls: '.14em' });
    const lines = wrapCJK(n.label, 9);
    if (n.gate) {
      txt(g, { x: n.cx, y: ROW_Y + 49, str: n.label, size: 13.5, weight: 700, fill: PAL.ink, family: 'serif' });
    } else if (lines.length === 1) {
      txt(g, { x: n.cx, y: ROW_Y + 47, str: lines[0], size: 11.5, weight: 700, fill: PAL.ink, family: 'serif' });
    } else {
      txt(g, { x: n.cx, y: ROW_Y + 40, str: lines[0], size: 11.5, weight: 700, fill: PAL.ink, family: 'serif' });
      txt(g, { x: n.cx, y: ROW_Y + 55.5, str: lines[1], size: 11.5, weight: 700, fill: PAL.ink, family: 'serif' });
    }
    EL('rect', { x: n.x - 3, y: ROW_Y - 3, width: PW + 6, height: PH + 6, fill: '#000', 'fill-opacity': 0 }, g);
    bindHit(g, n.id);
  });

  const gate = nodes[gateIdx >= 0 ? gateIdx : nodes.length - 1];

  /* ── 分支一 · 采纳（电蓝实线前进链：试点 → 回 01 → 回 03） ── */
  if (adoptSegs.length) {
    const g1x = GX[0];
    const trunk = EL('path', { d: `M${gate.cx + 2},${BOT_Y} C${gate.cx + 2},182 780,208 702,${GY - 2}`,
      fill: 'none', stroke: PAL.red, 'stroke-width': 2.2, 'marker-end': 'url(#cf03-ah-blue)',
      class: 'cf03-e', pathLength: 1, style: 'transition-delay:620ms' }, gEdges);
    txt(gEdges, { x: 864, y: 146, str: '采纳', size: 10.5, weight: 700, fill: PAL.red,
      anchor: 'start', halo: 1, cls: 'cf03-f', }).setAttribute('style', 'transition-delay:700ms');
    reg('adopt', { title: '分支 · 采纳（实线蓝 = 建议前进）', value: '采纳',
      sub: `采纳后的建议走向：${brFlow['采纳']}（真源行 31：F → G）`,
      source: `${SRC} 行31 · 2026-07-24`, tip: '采纳 · 点击下钻' });
    bindHit(EL('path', { d: trunk.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit), 'adopt');

    adoptSegs.slice(0, 3).forEach((seg, j) => {
      const gx = GX[j], gcx = gx + GW / 2;
      if (j > 0) {  // 子步箭头（左向=回到 03 方向）
        const p = EL('path', { d: `M${GX[j - 1]},${GY + GH / 2} L${gx + GW},${GY + GH / 2}`, fill: 'none',
          stroke: PAL.red, 'stroke-width': 2.2, 'marker-end': 'url(#cf03-ah-blue)',
          class: 'cf03-e', pathLength: 1, style: `transition-delay:${830 + (j - 1) * 100}ms` }, gEdges);
        reg('aseg' + j, { title: `采纳 · 第 ${j}/${adoptSegs.length} 步 → 第 ${j + 1}/${adoptSegs.length} 步`, value: '→',
          sub: `完整走向：${brFlow['采纳']}；实线=建议前进方向`,
          source: `${SRC} 行31–35 · 2026-07-24`, tip: '采纳顺序 · 点击下钻' });
        bindHit(EL('path', { d: p.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit), 'aseg' + j);
      }
      const g = EL('g', { class: 'cf03-n cf03-hit', 'data-drill-keep': '1', tabindex: '0', role: 'button',
        'aria-label': `采纳 第${j + 1}步 ${seg}`, style: `transition-delay:${760 + j * 100}ms` }, gNodes);
      EL('rect', { x: gx, y: GY, width: GW, height: GH, rx: 2, fill: '#ffffff',
        stroke: PAL.red, 'stroke-width': 1.2, class: 'cf03-frame' }, g);
      txt(g, { x: gcx, y: GY + 17, str: `采纳 · ${j + 1}/${adoptSegs.length}`, size: 8.5, fill: PAL.inkLo, ls: '.12em' });
      const lines = wrapCJK(seg, 13);
      if (lines.length === 1) {
        txt(g, { x: gcx, y: GY + 42, str: lines[0], size: 12, weight: 700, fill: PAL.ink, family: 'serif' });
      } else {
        txt(g, { x: gcx, y: GY + 36, str: lines[0], size: 12, weight: 700, fill: PAL.ink, family: 'serif' });
        txt(g, { x: gcx, y: GY + 50, str: lines[1], size: 12, weight: 700, fill: PAL.ink, family: 'serif' });
      }
      EL('rect', { x: gx - 3, y: GY - 3, width: GW + 6, height: GH + 6, fill: '#000', 'fill-opacity': 0 }, g);
      const rowRef = ['行31', '行34', '行35'][j] || '行31–35';
      reg('g' + j, { title: `采纳 · 第 ${j + 1}/${adoptSegs.length} 步`, value: seg,
        sub: `完整走向：${brFlow['采纳']}${j === adoptSegs.length - 1 ? '；随后重新进入与企业的沟通（真源行 36：J → B，图中回流虚线弧）' : ''}`,
        source: `${SRC} ${rowRef} · 2026-07-24`, tip: `采纳 ${j + 1}/${adoptSegs.length} · 点击下钻` });
      bindHit(g, 'g' + j);
    });

    /* 回流弧：G3 → N2（真源行36 J→B；虚线蓝=再进入，不是新一步） */
    const n2 = nodes[1];
    const arc = EL('path', { d: `M${GX[GX.length - 1]},${GY + GH / 2} C30,${GY + GH / 2} 24,240 24,196 C24,136 130,116 ${n2.cx},115`,
      fill: 'none', stroke: PAL.red, 'stroke-width': 1.3, 'stroke-dasharray': '5 4',
      'marker-end': 'url(#cf03-ah-blue)', class: 'cf03-f', style: 'transition-delay:1060ms' }, gEdges);
    txt(gEdges, { x: 17, y: 232, str: '回到 03', size: 9, fill: PAL.red, anchor: 'start',
      halo: 1, cls: 'cf03-f' }).setAttribute('style', 'transition-delay:1120ms');
    reg('arc', { title: '回流 · 重新进入共创（虚线蓝 = 再进入）', value: '回到 03 更新建议',
      sub: `真实结果形成后回到 03 更新建议，并重新进入与企业的沟通（真源行 35–36：I → J → B）；虚线=再进入，不是新一步`,
      source: `${SRC} 行35–36 · 2026-07-24`, tip: '回流弧 · 点击下钻' });
    bindHit(EL('path', { d: arc.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit), 'arc');
  }

  /* ── 分支二 · 调整（墨虚线回流共同盘点；真源行32 F→C，目标由数据解析） ── */
  if (adjFlow) {
    const p = EL('path', { d: `M${gate.cx - 47},${BOT_Y} C${gate.cx - 47},134 748,142 692,142 L470,142 C428,142 396,130 ${adjNode.cx},116`,
      fill: 'none', stroke: PAL.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 4',
      'marker-end': 'url(#cf03-ah-ink)', class: 'cf03-f', style: 'transition-delay:700ms' }, gEdges);
    txt(gEdges, { x: 581, y: 134, str: '调整', size: 10.5, fill: PAL.inkMd,
      halo: 1, cls: 'cf03-f' }).setAttribute('style', 'transition-delay:760ms');
    reg('adj', { title: '分支 · 调整（虚线墨 = 回流，不新增节点）', value: '调整',
      sub: `${adjFlow}——回到既有共同盘点（真源行 32：F → C）`,
      source: `${SRC} 行32 · 2026-07-24`, tip: '调整 · 点击下钻' });
    bindHit(EL('path', { d: p.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit), 'adj');
  }

  /* ── 分支三 · 暂缓或否决（红虚线终点暂存；全图唯一用红处，语义=不前进） ── */
  if (holdFlow) {
    const hx = HX + HW - 18;
    const p = EL('path', { d: `M${gate.cx + 43},${BOT_Y} L${hx},${HY - 2}`,
      fill: 'none', stroke: PAL.neg, 'stroke-width': 1.5, 'stroke-dasharray': '6 4',
      'marker-end': 'url(#cf03-ah-neg)', class: 'cf03-f', style: 'transition-delay:740ms' }, gEdges);
    txt(gEdges, { x: hx - 9, y: 198, str: '暂缓或否决', size: 10.5, fill: PAL.neg, anchor: 'end',
      halo: 1, cls: 'cf03-f' }).setAttribute('style', 'transition-delay:800ms');
    reg('hold', { title: '分支 · 暂缓或否决（红虚线 = 不前进，非负面评价）', value: '暂缓或否决',
      sub: `${holdFlow}——依据保留，待条件变化（真源行 33：F → H）`,
      source: `${SRC} 行33 · 2026-07-24`, tip: '暂缓或否决 · 点击下钻' });
    bindHit(EL('path', { d: p.getAttribute('d'), class: 'cf03-hit cf03-eh', 'data-drill-keep': '1' }, gHit), 'hold');

    const g = EL('g', { class: 'cf03-n cf03-hit', 'data-drill-keep': '1', tabindex: '0', role: 'button',
      'aria-label': `暂存 ${holdFlow}`, style: 'transition-delay:900ms' }, gNodes);
    EL('rect', { x: HX, y: HY, width: HW, height: HH, rx: 2, fill: '#ffffff',
      stroke: PAL.neg, 'stroke-width': 1.3, 'stroke-dasharray': '5 4', class: 'cf03-frame' }, g);
    txt(g, { x: HX + HW / 2, y: HY + 17, str: 'HOLD · 待条件变化', size: 8.5, fill: PAL.neg, ls: '.12em' });
    txt(g, { x: HX + HW / 2, y: HY + 42, str: holdFlow, size: 12, weight: 700, fill: PAL.ink, family: 'serif' });
    EL('rect', { x: HX - 3, y: HY - 3, width: HW + 6, height: HH + 6, fill: '#000', 'fill-opacity': 0 }, g);
    reg('hnode', { title: '暂存 · 不前进', value: holdFlow,
      sub: '暂存态：不新增动作、不前进；真源行 37 另注明条件变化后可再回到沟通（H -.-> B）——为避免与采纳回流弧交叉，本图从略，特此注明',
      source: `${SRC} 行33（回流 行37）· 2026-07-24`, tip: '暂存 · 点击下钻' });
    bindHit(g, 'hnode');
  }

  /* ── 图尾注（note 原文入图：箭头非自动化工作流，否定句红线） ── */
  EL('path', { d: `M10,374 L${W - 10},374`, stroke: PAL.lineLo, 'stroke-width': 1, class: 'cf03-f',
    style: 'transition-delay:1180ms' }, gNote);
  if (note) {
    const lines = wrapCJK(note, 52);
    lines.slice(0, 3).forEach((ln, k) => {
      txt(gNote, { x: 10, y: 388 + k * 13, str: (k === 0 ? '注 · ' : '') + ln, size: 10,
        fill: PAL.inkMd, anchor: 'start', family: 'serif', cls: 'cf03-f' })
        .setAttribute('style', `transition-delay:${1180 + k * 60}ms`);
    });
    const noteHit = EL('rect', { x: 8, y: 372, width: W - 16, height: 30, fill: '#000',
      'fill-opacity': 0, class: 'cf03-hit', 'data-drill-keep': '1', tabindex: '0', role: 'button',
      'aria-label': '图注：箭头只表达建议的共创顺序' }, gHit);
    reg('note', { title: '图注 · 共创顺序，不是自动化工作流', value: '注',
      sub: note, source: `${SRC} 行40 · 2026-07-24`, tip: '图注 · 点击下钻' });
    bindHit(noteHit, 'note');
  }

  body.appendChild(svg);

  /* ── 命中交互：click / Enter·Space → U.showDrill；hover → U.showTip ── */
  function bindHit(el, key) {
    el.addEventListener('click', ev => {
      const d = drills[key]; if (!d) return;
      U.showDrill({ title: d.title, value: d.value, sub: d.sub, source: d.source, x: ev.clientX, y: ev.clientY });
    });
    el.addEventListener('keydown', ev => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      const d = drills[key]; if (!d) return;
      const r = el.getBoundingClientRect();
      U.showDrill({ title: d.title, value: d.value, sub: d.sub, source: d.source,
        x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
    el.addEventListener('mousemove', ev => {
      const d = drills[key]; if (d && d.tip) U.showTip(d.tip, ev.clientX, ev.clientY);
    });
    el.addEventListener('mouseleave', () => U.hideTip());
  }

  /* ── 入场：IntersectionObserver fires once；reduced-motion 直接完成帧 ── */
  if (reduced) {
    svg.classList.add('cf03-on');
  } else {
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { svg.classList.add('cf03-on'); io.unobserve(svg); } });
    }, { threshold: 0.2 });
    io.observe(svg);
  }
})();
