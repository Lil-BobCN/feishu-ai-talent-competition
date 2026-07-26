/* ═══════════════════════════════════════════════════════════
   stop-gates.js · P13 闸门梯 — §6.2 模块停止条件（12 条精选）
   宿主：#gate-chart（.wide，内容宽 744px）｜ 数据：window.RPT.gates
   主题表达：全部 12 条 hasBypass === false —— 「哪里报错哪里停止，
   不跳过、不猜测」。每行红框 NO BYPASS 不是缺数，而是设计本身；
   严禁伪造绕行路线（渲染严格按数据驱动，数据无绕行即无绕行）。
   列宽预算（postmortem #16：列宽 ≥ 内容实际宽度）：
     序号 40px ｜ 名称+条件 minmax(0,1fr) ≈ 488px
     级别徽章 64px（转人工 3 字 mono 9.5px + padding ≈ 47px ✓）
     NO BYPASS 92px（9 字 mono 9px ls.12em ≈ 58px + border ✓）
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('gate-chart');
  if (!host) return;
  if (!window.U) return;
  const gates = (window.RPT && window.RPT.gates) || [];
  if (!gates.length) return; // 宁可缺失不得编造（§U.5）

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── 图表骨架（title = 结论句；sub = mono 读法+交互；src = 来源类别+日期） ── */
  const body = U.frame(host, {
    title: '十二道模块闸门，没有一道可以绕行',
    sub: '每行 = 一个模块的停止 / 转人工条件（摘要两行，全文在点击详情）· 徽章分「停止」「转人工」两态 · 红框 NO BYPASS = 该闸门无绕行路线 · 点击任意行展开完整条件与母稿出处',
    src: '方案文档 — 经营事件循环母稿 §6.2 精选 12 条（完整模块清单见母稿 §2.4.2）· K9 · 2026-07-21 定稿',
  });

  /* ── 作用域样式（不碰全站 css，全部前缀 g13- 限定在 #gate-chart 下） ── */
  const style = document.createElement('style');
  style.textContent = `
#gate-chart .g13-head, #gate-chart .g13-row {
  display:grid; grid-template-columns:40px minmax(0,1fr) auto;
  grid-template-areas:"rank main side"; column-gap:16px;
}
#gate-chart .g13-head {
  padding:0 8px 7px; border-bottom:1px solid var(--line);
  font-family:var(--mono); font-size:9.5px; letter-spacing:.12em;
  color:var(--ink-lo); text-transform:uppercase;
}
#gate-chart .g13-row {
  padding:10px 8px; border-bottom:1px solid var(--line-lo);
  cursor:pointer; align-items:center;
  opacity:0; transform:translateY(10px);
  transition:opacity .5s ease var(--d,0ms), transform .5s ease var(--d,0ms), background-color .15s ease 0ms;
}
#gate-chart .g13-row:hover { background:var(--paper-hi); }
#gate-chart .g13-row:focus-visible { outline:2px solid #2251ff; outline-offset:-2px; }
#gate-chart .g13-live .g13-row { opacity:1; transform:none; }
#gate-chart .g13-rank {
  grid-area:rank; font-family:var(--serif); font-weight:700;
  font-size:23px; color:#2251ff; line-height:1;
}
#gate-chart .g13-main { grid-area:main; min-width:0; }
#gate-chart .g13-name {
  font-family:var(--serif); font-weight:700; font-size:13.5px;
  color:var(--ink); margin:0 0 2px; line-height:1.3;
}
#gate-chart .g13-cond {
  font-family:var(--serif); font-size:12px; color:var(--ink-md);
  margin:0; line-height:1.5; overflow-wrap:break-word;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
#gate-chart .g13-side { grid-area:side; display:flex; align-items:center; gap:12px; }
#gate-chart .g13-lv {
  font-family:var(--mono); font-size:9.5px; letter-spacing:.1em;
  padding:4px 0; width:64px; text-align:center; box-sizing:border-box;
  border:1px solid; white-space:nowrap;
}
#gate-chart .g13-lv-stop  { background:var(--ink); border-color:var(--ink); color:#fff; }
#gate-chart .g13-lv-human { background:#fff; border-color:#2251ff; color:#2251ff; }
#gate-chart .g13-nb {
  font-family:var(--mono); font-size:9px; font-weight:700; letter-spacing:.12em;
  color:#c22f4e; border:1.5px solid #c22f4e; background:#fff;
  padding:5px 0; width:92px; text-align:center; white-space:nowrap; box-sizing:border-box;
  opacity:0; transform:scale(1.3);
  transition:opacity .3s ease var(--d2,0ms), transform .4s cubic-bezier(.2,.9,.3,1.4) var(--d2,0ms);
}
#gate-chart .g13-live .g13-nb { opacity:1; transform:none; }
#gate-chart .g13-foot {
  margin-top:12px; padding-top:10px; border-top:1px solid var(--line-lo);
  font-family:var(--serif); font-style:italic; font-size:12px;
  color:var(--ink-md); line-height:1.6; display:flex; gap:8px;
}
#gate-chart .g13-foot::before {
  content:""; flex:0 0 auto; width:9px; height:9px; background:var(--ink); margin-top:5px;
}
@media (max-width:640px) {
  #gate-chart .g13-head { display:none; }
  #gate-chart .g13-row { grid-template-columns:28px minmax(0,1fr); grid-template-areas:"rank main" "rank side"; row-gap:7px; }
  #gate-chart .g13-rank { font-size:19px; }
}
@media (prefers-reduced-motion: reduce) {
  #gate-chart .g13-row, #gate-chart .g13-nb { transition:none !important; }
}`;
  document.head.appendChild(style);

  /* ── 列头（mono ALL-CAPS，对齐行网格） ── */
  const head = document.createElement('div');
  head.className = 'g13-head';
  head.innerHTML = '<span>No.</span><span>模块 · 停止条件（摘要）</span><span>级别 · 绕行路线</span>';
  body.appendChild(head);

  /* ── 12 行闸门 ── */
  const SRC_LINE = '母稿 §2.4.2 模块停止条件清单（§6.2 精选引用）· K9 · 2026-07-21 定稿';
  gates.forEach((g, i) => {
    const row = document.createElement('div');
    row.className = 'g13-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('data-drill-keep', '');
    row.setAttribute('aria-label', `闸门 ${i + 1}：${g.module}，${g.level}，无绕行。点击查看完整停止条件。`);
    row.style.setProperty('--d', reduced ? '0ms' : (i * 55) + 'ms');

    const rank = document.createElement('div');
    rank.className = 'g13-rank';
    rank.textContent = String(i + 1);

    const main = document.createElement('div');
    main.className = 'g13-main';
    const nm = document.createElement('p');
    nm.className = 'g13-name';
    nm.textContent = g.module;
    const cd = document.createElement('p');
    cd.className = 'g13-cond';
    cd.textContent = g.condition; // 完整条件两行截断，全文进 drill
    main.append(nm, cd);

    const side = document.createElement('div');
    side.className = 'g13-side';
    const lv = document.createElement('span');
    lv.className = 'g13-lv ' + (g.level === '转人工' ? 'g13-lv-human' : 'g13-lv-stop');
    lv.textContent = g.level;
    side.appendChild(lv);
    // 绕行列严格数据驱动：当前 12 条 hasBypass 均为 false → 全部 NO BYPASS。
    // 若未来数据出现 hasBypass:true 且提供绕行路线字段，此处应渲染 ↳ 深蓝宝石路；
    // 在数据给出路线前绝不伪造。
    if (g.hasBypass) {
      const bp = document.createElement('span');
      bp.className = 'g13-lv g13-lv-human';
      bp.textContent = '↳ 见详情';
      side.appendChild(bp);
    } else {
      const nb = document.createElement('span');
      nb.className = 'g13-nb';
      nb.textContent = 'NO BYPASS';
      nb.style.setProperty('--d2', reduced ? '0ms' : (i * 55 + 140) + 'ms');
      side.appendChild(nb);
    }

    const open = (x, y) => {
      U.showDrill({
        title: `GATE ${String(i + 1).padStart(2, '0')} · ${g.module}`,
        value: g.level,
        sub: `${esc(g.condition)}<br><span style="opacity:.72">绕行路线：无 —— 全方案 12 条闸门统一不可绕行；报错即停，保存已取得的信息与错误位置，不跳过、不猜测（母稿 §6.1）。</span>`,
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

    row.append(rank, main, side);
    body.appendChild(row);
  });

  /* ── 图尾脚注：统一原则（本图主题声明） ── */
  const foot = document.createElement('p');
  foot.className = 'g13-foot';
  foot.textContent = '统一原则（母稿 §6.1）· 全部 12 条都是 NO BYPASS 不是缺数，而是设计本身：哪里报错哪里停止，保存已取得的信息与错误位置，不跳过、不猜测。「转人工」表示该情形只能由人补证或决定，同样不是绕行。';
  body.appendChild(foot);

  /* ── 入场动画：IO fires once；reduced-motion 直接完成帧（§U.4） ── */
  const goLive = () => body.classList.add('g13-live');
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
