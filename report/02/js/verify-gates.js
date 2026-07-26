/* ═══════════════════════════════════════════════════════════
   verify-gates.js · P13 闸门梯 — §6.1 三道检验 + 隔离验证闸门
   宿主：#gates-chart（.wide，max-width 800px，注意窄容器）｜ 数据：window.RPT.gates（4 条）
   主题表达：G1 历史回放 / G2 留出案例 / G3 专家审查 三道「检验」汇入
   唯一一道「闸门」——隔离验证闸门。闸门只有两个出口：未通过 ↩ 回诊断
   与现实补全（失败证据保留，电蓝回流 = 设计内回路，不用真红）；通过 →
   才允许提交管理审批。闸门行 hl 高亮。
   红线遵守：数据无分数 / 通过率 → 本图【不画】gallery 的 10 格记分条
   （宁可缺失不得伪造，§U.5）；不设“自动学习”类表述；4 为结构性计数。
   结构编码（§U.9 ≥2 个非文本变量）：
     ① 收敛拓扑——三条检验芯片经 SVG 汇集线汇入闸门行（漏斗几何）
     ② 级别两态——检验 = 空心电蓝徽章 / 闸门 = 实心墨徽章
     ③ 出口分流——闸门行双出口芯片（回流虚线蓝框 ↩ / 前行实心墨 →）
   列宽预算（postmortem #16：列宽 ≥ 内容实际宽度）：
     序号 44px ｜ 名称+条件 minmax(0,1fr) ≈ 470px ｜ 徽章 54px（2 字）
     出口 200px（汇入芯片 ≈ 104px；闸门回流芯片 ≈ 136px ✓）
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('gates-chart');
  if (!host) return;
  if (!window.U) return;
  const gates = (window.RPT && window.RPT.gates) || [];
  if (!gates.length) return; // 宁可缺失不得编造（§U.5）

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const SRC_ROW = '02 能力进化循环专题工作稿 · 行 54–56（三道检验）、行 113–126（隔离验证回路与闸门）· K1 · 2026-07-23 定稿，2026-07-24 最终复核';
  const SRC_GATE = '02 能力进化循环专题工作稿 · 行 113–126（闸门两出口）、EV-01 行 109–136（预先写明验收条件）、行 168 · K1 · 2026-07-23 定稿，2026-07-24 最终复核';

  /* ── 图表骨架（title = 结论句；sub = mono 读法+交互；src = 来源+日期） ── */
  const body = U.frame(host, {
    title: '三道检验汇入一道闸门：验收条件不过，改进申请不出隔离区',
    sub: '读法：G1–G3 三道检验（历史回放 / 留出案例 / 专家审查）汇入隔离验证闸门 · 闸门两出口：未通过 ↩ 回诊断与现实补全（失败证据保留），通过 → 才可提交管理审批 · 本图不设分数与通过率——验收条件预先写明，结果只有过 / 不过 · 点击任意行展开完整条件与出处',
    src: '方案文档 — 02 能力进化循环专题工作稿（行 54–56、113–126、168；验收纪律 EV-01 行 109–136）· K1 · 2026-07-23 定稿，2026-07-24 复核；闸门定位亦见 K3（2026-07-24）',
  });

  /* ── 作用域样式（全部前缀 gt- 限定在 #gates-chart 下，不碰全站 css） ── */
  const style = document.createElement('style');
  style.textContent = `
#gates-chart .gt-head, #gates-chart .gt-row {
  display:grid; grid-template-columns:44px minmax(0,1fr) 54px 200px;
  grid-template-areas:"rank main level exit"; column-gap:14px;
}
#gates-chart .gt-head {
  padding:0 8px 7px; border-bottom:1px solid var(--line);
  font-family:var(--mono); font-size:9.5px; letter-spacing:.12em;
  color:var(--ink-lo); text-transform:uppercase;
}
#gates-chart .gt-wrap { position:relative; }
#gates-chart .gt-link {
  position:absolute; inset:0; width:100%; height:100%;
  z-index:2; pointer-events:none; overflow:visible;
}
#gates-chart .gt-row {
  padding:13px 8px; border-bottom:1px solid var(--line-lo);
  cursor:pointer; align-items:center;
  opacity:0; transform:translateY(10px);
  transition:opacity .5s ease var(--d,0ms), transform .5s ease var(--d,0ms), background-color .15s ease 0ms;
}
#gates-chart .gt-row:hover { background:var(--paper-hi); }
#gates-chart .gt-row:focus-visible { outline:2px solid #2251ff; outline-offset:-2px; }
#gates-chart .gt-row.gt-hl { background:rgba(34,81,255,.05); }
#gates-chart .gt-row.gt-hl:hover { background:rgba(34,81,255,.08); }
#gates-chart .gt-live .gt-row { opacity:1; transform:none; }
#gates-chart .gt-rank { grid-area:rank; }
#gates-chart .gt-rank .n {
  font-family:var(--serif); font-weight:700; font-size:23px;
  color:#2251ff; line-height:1; display:block;
}
#gates-chart .gt-rank .c {
  font-family:var(--mono); font-size:8.5px; letter-spacing:.08em;
  color:var(--ink-lo); display:block; margin-top:3px;
}
#gates-chart .gt-main { grid-area:main; min-width:0; }
#gates-chart .gt-name {
  font-family:var(--serif); font-weight:700; font-size:13.5px;
  color:var(--ink); margin:0 0 2px; line-height:1.3;
}
#gates-chart .gt-asks {
  font-family:var(--serif); font-size:12px; color:var(--ink-md);
  margin:0; line-height:1.5; overflow-wrap:break-word;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
#gates-chart .gt-level { grid-area:level; justify-self:start; }
#gates-chart .gt-lv {
  font-family:var(--mono); font-size:9.5px; letter-spacing:.14em;
  padding:4px 0; width:54px; text-align:center; box-sizing:border-box;
  border:1px solid; white-space:nowrap; display:inline-block;
}
#gates-chart .gt-lv-check { background:#fff; border-color:#2251ff; color:#2251ff; }
#gates-chart .gt-lv-gate  { background:var(--ink); border-color:var(--ink); color:#fff; }
#gates-chart .gt-exit { grid-area:exit; min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
#gates-chart .gt-chip {
  position:relative; z-index:3; /* 压在 SVG 汇集线之上，形成"线穿芯片"的漏斗感 */
  font-family:var(--mono); font-size:9px; letter-spacing:.06em;
  padding:4px 9px; white-space:nowrap; box-sizing:border-box;
  background:#fff; /* 不透明：遮住穿过的汇集线 */
  opacity:0; transform:scale(1.12);
  transition:opacity .3s ease var(--d2,0ms), transform .4s cubic-bezier(.2,.9,.3,1.4) var(--d2,0ms);
}
#gates-chart .gt-live .gt-chip { opacity:1; transform:none; }
#gates-chart .gt-join { color:#1233b8; border:1px solid #1233b8; }
#gates-chart .gt-back { color:#2251ff; border:1px dashed #2251ff; } /* 电蓝回流：设计内回路，非真红 */
#gates-chart .gt-pass { color:#fff; background:var(--ink); border:1px solid var(--ink); }
#gates-chart .gt-foot {
  margin-top:12px; padding-top:10px; border-top:1px solid var(--line-lo);
  font-family:var(--serif); font-style:italic; font-size:12px;
  color:var(--ink-md); line-height:1.6; display:flex; gap:8px;
}
#gates-chart .gt-foot::before {
  content:""; flex:0 0 auto; width:9px; height:9px; background:var(--ink); margin-top:5px;
}
@media (max-width:640px) {
  #gates-chart .gt-head { display:none; }
  #gates-chart .gt-row {
    grid-template-columns:32px minmax(0,1fr);
    grid-template-areas:"rank main" "rank level" "rank exit"; row-gap:8px;
  }
  #gates-chart .gt-rank .n { font-size:19px; }
  #gates-chart .gt-exit { gap:5px; }
}
@media (prefers-reduced-motion: reduce) {
  #gates-chart .gt-row, #gates-chart .gt-chip { transition:none !important; }
}`;
  document.head.appendChild(style);

  /* ── 列头（mono ALL-CAPS，对齐行网格） ── */
  const head = document.createElement('div');
  head.className = 'gt-head';
  head.innerHTML = '<span>No.</span><span>检验 · 闸门问的问题（摘要）</span><span>级别</span><span>出口语义</span>';
  body.appendChild(head);

  /* ── 行容器 + SVG 汇集线层（z-index 2，芯片 z-index 3 压线） ── */
  const wrap = document.createElement('div');
  wrap.className = 'gt-wrap';
  body.appendChild(wrap);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'gt-link');
  svg.setAttribute('aria-hidden', 'true');
  wrap.appendChild(svg);

  const isGate = g => g.no === 'GATE';
  const joinChips = []; // 前三道「汇入」芯片，供汇集线测量

  gates.forEach((g, i) => {
    const gate = isGate(g);
    const row = document.createElement('div');
    row.className = 'gt-row' + (gate ? ' gt-hl' : '');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('data-drill-keep', '');
    row.setAttribute('aria-label', `${g.no} ${g.name}，${gate ? '闸门' : '检验'}。${g.asks}。点击查看完整条件与出处。`);
    row.style.setProperty('--d', reduced ? '0ms' : (i * 70) + 'ms');

    /* 序号列：大序号 + mono 编号 */
    const rank = document.createElement('div');
    rank.className = 'gt-rank';
    rank.innerHTML = `<span class="n">${i + 1}</span><span class="c">${esc(g.no)}</span>`;

    /* 名称 + 条件摘要（两行截断，全文进 drill） */
    const main = document.createElement('div');
    main.className = 'gt-main';
    const nm = document.createElement('p');
    nm.className = 'gt-name';
    nm.textContent = g.name;
    const ask = document.createElement('p');
    ask.className = 'gt-asks';
    ask.textContent = g.asks;
    main.append(nm, ask);

    /* 级别徽章：检验 = 空心电蓝 / 闸门 = 实心墨（刚性两态，数据 no 字段驱动） */
    const level = document.createElement('div');
    level.className = 'gt-level';
    const lv = document.createElement('span');
    lv.className = 'gt-lv ' + (gate ? 'gt-lv-gate' : 'gt-lv-check');
    lv.textContent = gate ? '闸门' : '检验';
    level.appendChild(lv);

    /* 出口语义列：前三道 = 汇入芯片；闸门 = 回流 + 前行双出口 */
    const exit = document.createElement('div');
    exit.className = 'gt-exit';
    if (gate) {
      exit.classList.add('gt-gate-exit');
      const back = document.createElement('span');
      back.className = 'gt-chip gt-back';
      back.textContent = '↩ 未通过 · 回诊断与现实补全';
      back.style.setProperty('--d2', reduced ? '0ms' : (i * 70 + 260) + 'ms');
      const pass = document.createElement('span');
      pass.className = 'gt-chip gt-pass';
      pass.textContent = '→ 通过 · 才可提交管理审批';
      pass.style.setProperty('--d2', reduced ? '0ms' : (i * 70 + 340) + 'ms');
      exit.append(back, pass);
    } else {
      const join = document.createElement('span');
      join.className = 'gt-chip gt-join';
      join.textContent = '↘ 汇入隔离验证闸门';
      join.style.setProperty('--d2', reduced ? '0ms' : (i * 70 + 160) + 'ms');
      exit.appendChild(join);
      joinChips.push(join);
    }

    /* drill：完整条件 + 出口 + 出处（K 编号 + 日期） */
    const open = (x, y) => {
      const sub = gate
        ? `${esc(g.asks)}。<br><span style="opacity:.78">未通过：记录失败证据，回到诊断与现实补全；通过：才允许向管理层提交改进申请（范围、收益、风险和回滚）。验收条件必须在试验记录中预先写明（EV-01）——本图不展示分数或通过率：方案只定义「过 / 不过」两种结果，样本数、指标及阈值待试点确定（§8 待验证清单）。</span>`
        : `${esc(g.asks)}。<br><span style="opacity:.78">未通过：${esc(g.onFail)}；通过：与另外两道检验一起汇入隔离验证闸门。三道检验全部在隔离试验版本与试验记录中留痕，不触碰生产 Skill / Prompt / MCP / 工作流配置（§6.1 试验纪律）。</span>`;
      U.showDrill({
        title: `${g.no} · ${g.name}`,
        value: gate ? '闸门' : '检验',
        sub,
        source: gate ? SRC_GATE : SRC_ROW,
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

    row.append(rank, main, level, exit);
    wrap.appendChild(row);
  });

  /* ── SVG 汇集线：三条检验芯片 → 闸门回流芯片（漏斗拓扑，电深蓝） ──
     须在入场动画结束后测量绘制（transform/opacity 期间行有堆叠上下文，
     且芯片位置未稳定）；reduced-motion 直接画完成帧。 */
  let linkDrawn = false;
  function drawLink() {
    if (joinChips.length < 1) return;
    const back = wrap.querySelector('.gt-back');
    if (!back) return;
    const wr = wrap.getBoundingClientRect();
    if (wr.width < 40) return;
    svg.setAttribute('viewBox', `0 0 ${wr.width} ${wr.height}`);
    svg.innerHTML = '';
    const c0 = joinChips[0].getBoundingClientRect();
    const jx = c0.left - wr.left + c0.width / 2;      // 汇入芯片列中心 x（三片同文同宽）
    const y0 = c0.top - wr.top + c0.height / 2;        // 从第一片中心起笔（线藏片后）
    const br = back.getBoundingClientRect();
    const bx = br.left - wr.left + Math.min(br.width, 120) * 0.5; // 箭头落点：回流芯片顶边中左
    const tipY = br.top - wr.top - 2;                  // 箭头尖抵住回流芯片顶边
    const elbowY = tipY - 10;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', `M ${jx} ${y0} V ${elbowY} L ${bx} ${tipY - 4}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#1233b8');
    path.setAttribute('stroke-width', '1.5');
    svg.appendChild(path);
    const arrow = document.createElementNS(NS, 'path');
    arrow.setAttribute('d', `M ${bx - 4.5} ${tipY - 8} L ${bx + 4.5} ${tipY - 8} L ${bx} ${tipY} Z`);
    arrow.setAttribute('fill', '#1233b8');
    svg.appendChild(arrow);
    /* 画线入场：stroke-dash 收线动画；reduced 直接完成帧 */
    const len = path.getTotalLength() + 12;
    if (reduced || linkDrawn) { path.style.strokeDasharray = 'none'; return; }
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    arrow.style.opacity = '0';
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset .7s ease';
      path.style.strokeDashoffset = '0';
      arrow.style.transition = 'opacity .25s ease .55s';
      arrow.style.opacity = '1';
    });
    linkDrawn = true;
  }

  /* ── 图尾脚注：验收纪律（02 母稿 EV-01 / 行 109–136） ── */
  const foot = document.createElement('p');
  foot.className = 'gt-foot';
  foot.textContent = '只有满足试验记录中预先写明的验收条件，才允许把验证证据提交管理层（02 母稿 EV-01 · 行 109–136）。「↩ 回诊断」不是隐藏失败：失败证据随试验记录一起保留，诊断与隔离验证构成回路。';
  body.appendChild(foot);

  /* ── 入场：IO fires once；reduced-motion 直接完成帧（§U.4） ── */
  let resizeT = 0;
  const goLive = () => {
    body.classList.add('gt-live');
    /* 等行/芯片过渡结束后再测量画汇集线（4 行 × 70ms + 芯片 340ms + 400ms ≈ 1s） */
    setTimeout(drawLink, reduced ? 60 : 1000);
  };
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
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (body.classList.contains('gt-live')) drawLink(); }, 140);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (body.classList.contains('gt-live')) drawLink(); });
  }
})();
