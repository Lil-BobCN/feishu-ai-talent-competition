/* ═══════════════════════════════════════════════════════════
   candidate-odds.js · P7 候选场景三级证据榜（odds board 行式）
   宿主：#candidate-chart（§5，.wide.xl，.chart-frame）
   数据：window.RPT.expansionCandidates[3] = { order, tag, scenario,
         suggestion, evPublic（可空）, evDesign, evUnknown, srcId }
   视觉：每行 = 场景名（serif 700）｜建议顺序阶梯刻度（1 首选 → 3
         备选，方案推断，非概率，阶梯为星）｜三级证据徽标列
         （fact-tag 语义：绿=公开资料支持 / 电蓝=方案推断 /
         红描边=待企业核验）；evPublic=null 的行保留虚线空位
         「暂缺」，严禁补造。首选行整行电蓝 5% 高亮 + pill。
         图尾显著标注：候选顺序是方案推断，不是圣农批准的路线；
         企业可调整顺序，也可暂不选择任何场景。
         每行 / 每徽标 / 声明均 drill 到完整建议 + 依据 +
         母稿行82–90（K 编号 + 日期）。无收益/成本/时间数字。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('candidate-chart');
  if (!host) return;
  host.setAttribute('data-module', 'candidate-odds');
  host.removeAttribute('data-placeholder');

  const U = window.U;
  const C = (window.RPT && window.RPT.expansionCandidates) || [];
  if (!U || !C.length) return; // 数据缺失宁可留空，不得编造

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SRC_LINE = '03 业务扩域循环专题工作稿 行82–90 · K1（2026-07-24）';
  const SRC_K2 = '；年报方向见 K2（2026 年披露，2025 财年年报）';
  const BOUNDARY = '候选顺序是方案推断，不是圣农批准的路线；企业可以调整顺序，也可以暂不选择任何场景。';

  /* ── 作用域样式（前缀 co03-，不碰全站 css；徽标复用主题 .fact-tag） ── */
  const style = document.createElement('style');
  style.textContent = `
    #candidate-chart .co03-head {
      display: grid; grid-template-columns: minmax(210px, 250px) 190px 1fr;
      gap: 18px; padding: 0 10px 7px; border-bottom: 1px solid var(--line);
    }
    #candidate-chart .co03-head span {
      font-family: var(--mono); font-size: 9.5px; letter-spacing: .12em;
      color: var(--ink-lo); text-transform: uppercase;
    }
    #candidate-chart .co03-head span:nth-child(2) { text-align: center; }
    #candidate-chart .co03-row {
      display: grid; grid-template-columns: minmax(210px, 250px) 190px 1fr;
      gap: 18px; padding: 14px 10px; border-bottom: 1px solid var(--line-lo);
      border-radius: 6px; cursor: pointer; align-items: start;
      opacity: 0; transform: translateX(-16px);
    }
    #candidate-chart .co03-body.co03-in .co03-row { opacity: 1; transform: none; }
    #candidate-chart .co03-row:hover { background: var(--paper-hi); }
    #candidate-chart .co03-row:focus-visible { outline: 1.5px solid var(--red); outline-offset: 2px; }
    #candidate-chart .co03-row.hl { background: rgba(34, 81, 255, .05); }
    #candidate-chart .co03-row.hl:hover { background: rgba(34, 81, 255, .09); }
    #candidate-chart .co03-kicker {
      font-family: var(--mono); font-size: 9px; letter-spacing: .14em;
      color: var(--ink-lo); margin-bottom: 4px;
    }
    #candidate-chart .co03-name {
      font-family: var(--serif); font-weight: 700; font-size: 15.5px;
      line-height: 1.45; color: var(--ink); margin: 0 0 7px;
    }
    #candidate-chart .co03-pill {
      display: inline-block; font-family: var(--mono); font-size: 9px;
      letter-spacing: .1em; border: 1px solid var(--red); color: var(--red);
      border-radius: 3px; padding: 1px 7px;
    }
    #candidate-chart .co03-tag {
      font-family: var(--mono); font-size: 9.5px; letter-spacing: .08em; color: var(--ink-lo);
    }
    #candidate-chart .co03-scale { padding-top: 3px; }
    #candidate-chart .co03-scale svg { display: block; width: 100%; max-width: 180px; height: auto; }
    #candidate-chart .co03-scale text {
      font-family: var(--mono); paint-order: stroke; stroke: #ffffff; stroke-width: 3.5px;
    }
    #candidate-chart .co03-scale-cap {
      display: none; font-family: var(--mono); font-size: 8.5px;
      letter-spacing: .06em; color: var(--ink-lo); margin-bottom: 3px;
    }
    #candidate-chart .co03-evs { display: flex; flex-direction: column; gap: 6px; padding-top: 2px; }
    #candidate-chart .co03-ev {
      font-size: 12px; color: var(--ink-md); line-height: 1.6; text-wrap: pretty;
      cursor: pointer; border-radius: 4px; padding: 1px 4px; margin: -1px -4px;
    }
    #candidate-chart .co03-ev:hover { background: rgba(34, 81, 255, .06); }
    #candidate-chart .co03-ev .fact-tag { margin: 0 5px 0 0; }
    #candidate-chart .fact-tag.co03-ft-empty { border: 1px dashed var(--ink-lo); color: var(--ink-lo); }
    #candidate-chart .co03-ev-empty .co03-ev-t {
      color: var(--ink-lo); font-family: var(--mono); font-size: 10.5px; letter-spacing: .04em;
    }
    #candidate-chart .co03-head, #candidate-chart .co03-disclaimer { opacity: 0; }
    #candidate-chart .co03-body.co03-in .co03-head,
    #candidate-chart .co03-body.co03-in .co03-disclaimer { opacity: 1; }
    #candidate-chart .co03-disclaimer {
      margin-top: 16px; padding: 12px 2px 4px; border-top: 1.5px solid var(--ink); cursor: pointer;
    }
    #candidate-chart .co03-d-k {
      display: block; font-family: var(--mono); font-size: 9.5px; font-weight: 700;
      letter-spacing: .2em; color: var(--ink); margin-bottom: 6px;
    }
    #candidate-chart .co03-disclaimer p {
      font-size: 13.5px; color: var(--ink-md); line-height: 1.75; margin: 0;
    }
    #candidate-chart .co03-body.co03-rm .co03-row,
    #candidate-chart .co03-body.co03-rm .co03-head,
    #candidate-chart .co03-body.co03-rm .co03-disclaimer { transition: none !important; }
    @media (max-width: 760px) {
      #candidate-chart .co03-head { display: none; }
      #candidate-chart .co03-row { grid-template-columns: 1fr; gap: 10px; padding: 14px 8px; }
      #candidate-chart .co03-scale svg { max-width: 190px; }
      #candidate-chart .co03-scale-cap { display: block; }
    }
  `;
  document.head.appendChild(style);

  /* ── 骨架（title 结论句 / sub 读法 / src 来源+日期） ── */
  const body = U.frame(host, {
    title: '首选渠道库存与动销协同——但三个候选场景的顺序只是方案推断',
    sub: 'ODDS BOARD · 阶梯刻度 = 建议顺序（1 首选 → 3 备选 · 方案推断，非概率） · 徽标 = 证据状态（绿 公开资料 / 电蓝 方案推断 / 红描边 待核验） · 点击行 / 徽标 / 图尾声明展开依据',
    src: '03 业务扩域循环专题工作稿 行82–90（K1 · 2026-07-24）；年报方向见 K2（2026 年披露，2025 财年年报）',
  });
  body.classList.add('co03-body');
  if (REDUCED) body.classList.add('co03-rm');

  /* ── 建议顺序阶梯刻度（1 首选在最高阶，右行递降；方案推断，非概率） ── */
  const TICK_X = [30, 86, 146], TREAD_Y = [24, 32, 40], WORDS = ['首选', '其次', '备选'];
  function scaleSVG(order) {
    let g = '';
    for (let k = 1; k <= 3; k++) {
      const on = k === order;
      if (!on) {
        g += `<circle cx="${TICK_X[k - 1]}" cy="${TREAD_Y[k - 1] - 5.5}" r="2.6" fill="#ffffff" stroke="#8595a6" stroke-width="1"/>`;
      }
      g += `<text x="${TICK_X[k - 1]}" y="55" text-anchor="middle" font-size="9" ` +
        `fill="${on ? (order === 1 ? '#2251ff' : '#051c2c') : '#8595a6'}"${on ? ' font-weight="700"' : ''}>` +
        `${k} · ${WORDS[k - 1]}</text>`;
    }
    const my = TREAD_Y[order - 1], mx = TICK_X[order - 1];
    const mc = order === 1 ? '#2251ff' : '#051c2c';
    const halo = order === 1 ? `<circle cx="${mx}" cy="${my - 5.5}" r="8" fill="none" stroke="#2251ff" stroke-width="1" opacity=".3"/>` : '';
    return `<svg viewBox="0 0 180 60" role="img" aria-label="建议顺序 ${order} / 3（方案推断，非概率）">` +
      `<path d="M4,24 H56 V32 H116 V40 H176" fill="none" stroke="#8595a6" stroke-width="1.1"/>` +
      halo + `<circle cx="${mx}" cy="${my - 5.5}" r="4.5" fill="${mc}"/>` + g + `</svg>`;
  }

  /* ── drill：行（完整建议 + 三级证据 + 边界） ── */
  function rowDrill(c, x, y) {
    U.showDrill({
      title: `候选 ${c.order} / 3 · ${c.tag || '建议顺序 ' + c.order}`,
      value: c.scenario,
      sub: `<b>建议（母稿原文）</b>：${c.suggestion}<br><br><b>三级证据</b><br>` +
        `· 公开资料支持：${c.evPublic || '暂缺（留空，不补造）'}<br>` +
        `· 方案推断：${c.evDesign}<br>· 待企业核验：${c.evUnknown}<br><br>${BOUNDARY}`,
      source: SRC_LINE + (c.evPublic ? SRC_K2 : ''),
      x, y,
    });
  }

  /* ── drill：单条证据 ── */
  function evDrill(c, kind, x, y) {
    const map = {
      public: ['公开资料支持', c.evPublic, '事实标记「圣农公开事实」——来自公司年报、官方赛题等公开披露。', SRC_LINE + SRC_K2],
      design: ['方案推断', c.evDesign, '事实标记「本方案设计判断」——方案团队的推断，未经企业确认。', SRC_LINE],
      unknown: ['待企业核验', c.evUnknown, '事实标记「待企业验证」——需结合企业内部信息共同确认。', SRC_LINE],
      empty: ['公开资料支持', '暂缺', '本行暂无公开资料支持项：数据键 evPublic = null，按数据纪律留空，不作补造。', SRC_LINE],
    };
    const m = map[kind];
    U.showDrill({
      title: `${c.scenario} · 证据分级`, value: m[0],
      sub: `<b>${m[1]}</b><br><br>${m[2]}<br><br>${BOUNDARY}`,
      source: m[3], x, y,
    });
  }

  /* ── 列头 ── */
  const head = document.createElement('div');
  head.className = 'co03-head';
  head.innerHTML = '<span>候选场景 · 均为建议</span><span>建议顺序 · 方案推断刻度（非概率）</span><span>三级证据 · 徽标 = 事实标记</span>';
  body.appendChild(head);

  /* ── 三行候选 ── */
  const TAG_TIP = {
    'ft-public': '公开资料支持：来自年报、官方赛题等公开披露（K2 / K3）',
    'ft-design': '方案推断：本方案的设计判断，未经企业确认（K1）',
    'ft-unknown': '待企业核验：需结合企业内部信息共同确认（K1）',
  };

  C.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'co03-row' + (c.order === 1 ? ' hl' : '');
    row.setAttribute('data-drill-keep', '1');
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `候选 ${c.order} / 3：${c.scenario}，点击展开完整建议与依据`);

    const tagHtml = c.tag
      ? (c.order === 1 ? `<span class="co03-pill">${c.tag}</span>` : `<span class="co03-tag">${c.tag}</span>`)
      : '';

    // 三级证据列：公开（可空→虚线空位）/ 推断 / 待核验
    const evPublicHtml = c.evPublic
      ? `<div class="co03-ev" data-ev="public" data-drill-keep="1"><span class="fact-tag ft-public">公开资料支持</span><span class="co03-ev-t">${c.evPublic}</span></div>`
      : `<div class="co03-ev co03-ev-empty" data-ev="empty" data-drill-keep="1"><span class="fact-tag co03-ft-empty">公开资料支持</span><span class="co03-ev-t">暂缺 · 留空不补造</span></div>`;

    row.innerHTML =
      `<div class="co03-scene"><p class="co03-kicker">候选 ${c.order} / 3</p>` +
      `<p class="co03-name">${c.scenario}</p>${tagHtml}</div>` +
      `<div class="co03-scale"><p class="co03-scale-cap">建议顺序 · 方案推断（非概率）</p>${scaleSVG(c.order)}</div>` +
      `<div class="co03-evs">${evPublicHtml}` +
      `<div class="co03-ev" data-ev="design" data-drill-keep="1"><span class="fact-tag ft-design">方案推断</span><span class="co03-ev-t">${c.evDesign}</span></div>` +
      `<div class="co03-ev" data-ev="unknown" data-drill-keep="1"><span class="fact-tag ft-unknown">待企业核验</span><span class="co03-ev-t">${c.evUnknown}</span></div></div>`;

    // 交互：行 drill；证据条 drill（阻止冒泡）；徽标 hover 词义；刻度 hover 读法
    row.addEventListener('click', e => rowDrill(c, e.clientX, e.clientY));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = row.getBoundingClientRect(); rowDrill(c, r.left + r.width / 2, r.top + 20); }
    });
    row.querySelectorAll('.co03-ev').forEach(ev => {
      ev.addEventListener('click', e => { e.stopPropagation(); evDrill(c, ev.getAttribute('data-ev'), e.clientX, e.clientY); });
    });
    row.querySelectorAll('.fact-tag').forEach(b => {
      const key = Object.keys(TAG_TIP).find(k => b.classList.contains(k));
      const text = key ? TAG_TIP[key] : '公开资料支持项暂缺：留空，不作补造';
      b.addEventListener('mousemove', e => U.showTip(text, e.clientX, e.clientY));
      b.addEventListener('mouseleave', () => U.hideTip());
    });
    const sc = row.querySelector('.co03-scale');
    sc.addEventListener('mousemove', e =>
      U.showTip('建议顺序 1 → 3 为方案推断——不是概率，也不是圣农批准的路线；点击行展开完整依据', e.clientX, e.clientY));
    sc.addEventListener('mouseleave', () => U.hideTip());

    // 入场：交错滑入（reduced-motion 由 co03-rm 去过渡，直接完成帧）
    const d = i * 110;
    row.style.transition = `background .15s ease, opacity .55s ease ${d}ms, transform .55s cubic-bezier(.2,.6,.2,1) ${d}ms`;
    body.appendChild(row);
  });

  /* ── 图尾显著标注（边界声明，可 drill） ── */
  const disc = document.createElement('div');
  disc.className = 'co03-disclaimer';
  disc.setAttribute('data-drill-keep', '1');
  disc.setAttribute('tabindex', '0');
  disc.setAttribute('role', 'button');
  disc.setAttribute('aria-label', '边界声明：候选顺序是方案推断，不是圣农批准的路线');
  disc.innerHTML = `<span class="co03-d-k">方案推断 · 非批准路线</span>` +
    `<p>候选顺序是方案推断，<b>不是圣农批准的路线</b>；公开资料尚不足以证明三个场景的真实收益、建设成本和内部优先级——<b>企业可以调整顺序，也可以暂不选择任何场景</b>。</p>`;
  disc.style.transition = 'opacity .5s ease 320ms';
  const discDrill = (x, y) => U.showDrill({
    title: '候选顺序 · 边界声明', value: '方案推断',
    sub: `<b>${BOUNDARY}</b><br><br>公开资料尚不足以证明三个场景的真实收益、建设成本和内部优先级；本榜所有顺序刻度均为建议，不是实施合同，也不设时间表。`,
    source: SRC_LINE, x, y,
  });
  disc.addEventListener('click', e => discDrill(e.clientX, e.clientY));
  disc.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = disc.getBoundingClientRect(); discDrill(r.left + r.width / 2, r.top + 10); }
  });
  body.appendChild(disc);

  /* ── 入场（IntersectionObserver，fires once；reduced-motion 直接完成帧） ── */
  if (REDUCED) {
    body.classList.add('co03-in');
  } else {
    head.style.transition = 'opacity .4s ease 40ms';
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { body.classList.add('co03-in'); io.unobserve(body); }
    }), { threshold: 0.15 });
    io.observe(body);
  }
})();
