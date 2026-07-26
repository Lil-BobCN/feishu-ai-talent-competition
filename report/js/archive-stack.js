/* ═══════════════════════════════════════════════════════════
   archive-stack.js · §6.4 七类档案 2.5D 层叠（CHARTS.md P8 · value stack）
   宿主：#archive-chart（.wide.xl）｜数据：window.RPT.archives（7 层：no/name/holds/thesis）
   论点：七类业务记录组织成一份权威案件记录；关键层 04 调查证据档案——
        证据正文只保存一次，后续环节只写编号与版本，处处引用。
   结构：斜四边形顶面 + 矩形前面，自上而下 LAYER 07→01 堆叠（mono 层号）；
        右列每层 holds 摘要（截断到像素预算，全文进 drill）+ 一句 italic thesis；
        每层点击 drill 到完整 holds + thesis + 母稿出处（01母稿 §2.5 / 评委稿 §6.4）。
   入场：自上而下逐层「不透明滑入」（visibility + transform，不用 opacity —— postmortem #7/#14）。
   数据说明：RPT.archives 七层齐备，无需缺口标记；该分类为「本方案设计判断」（非模拟数据）。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('archive-chart');
  if (!host) return;
  try {
    const U = window.U, RPT = window.RPT;
    if (!U || !RPT || !Array.isArray(RPT.archives) || !RPT.archives.length) return; // 宁可缺失不得编造

    const PAL = U.PAL;
    const BLUE = PAL.red, BLUE_HI = PAL.redHi; // PAL.red = 电蓝（legacy 槽位，postmortem #24；真红 PAL.neg 本图无语义用途，不用）
    const SERIF = "'et-book','Songti SC',Palatino,Georgia,serif";
    const MONO  = "Menlo,Consolas,monospace";
    const F_HOLDS  = "12.5px " + SERIF;
    const F_THESIS = "italic 12px " + SERIF;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SRC_LINE = "研究整理 — 01母稿 §2.5 七类档案（K9 · 2026-07-21 定稿）· 评委稿 §6.4（K10 · 2026-07-23 重写）· 本方案设计判断";

    const body = U.frame(host, {
      title: "七类档案叠成一份权威记录：证据只存一次，处处引用",
      sub: "STACK DIAGRAM · 自上而下 LAYER 07→01（07 最后写入 · 01 为一切结论的起点）· 蓝色层 = 调查证据档案 · 点击任一层查看完整 holds 与出处",
      src: "研究整理 — 01 经营事件循环专题工作稿 §2.5（K9 · 2026-07-21 定稿）· 评委稿 §6.4（K10 · 2026-07-23 重写）· 分类结构为本方案设计判断",
    });

    /* ── 固定 viewBox 坐标系：不量容器宽度（P21 铁律①），width:100% 自适应 ── */
    const W = 880, H = 530;
    const mL = 8, slabW = 400, slabH = 46, pitch = 62, dX = 26, dY = 13, y0 = 65;
    const rX = mL + slabW + dX + 36;   // 右列 x = 470
    const rW = W - rX - 6;             // 右列像素预算 = 404
    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.style.width = "100%"; svg.style.height = "auto"; svg.style.display = "block";
    body.appendChild(svg);

    function el(tag, attrs, parent) {
      const e = document.createElementNS(NS, tag);
      if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    }
    /* SVG 文字：内联 font-family（覆盖 .chart-frame svg text 的 mono 默认）；
       一律 paint-order:stroke 纸色光晕 ≥3.5/4px（§U.3），文字不压线时仅作保险 */
    function putText(parent, o) {
      const t = el("text", { x: o.x, y: o.y }, parent);
      t.textContent = o.str;
      t.style.fontFamily = o.family;
      t.style.fontSize = o.size + "px";
      if (o.weight) t.style.fontWeight = o.weight;      // 字重只用 400/700（postmortem #6）
      if (o.style) t.style.fontStyle = o.style;
      if (o.ls) t.style.letterSpacing = o.ls;
      t.style.fill = o.fill;
      t.style.paintOrder = "stroke";
      t.style.stroke = "#ffffff";
      t.style.strokeWidth = (o.size >= 12 ? 4 : 3.5) + "px";
      return t;
    }

    /* ── 截断到像素预算：canvas 实测（§U.2 许可 measureText）；
          断点不落在逗号/介词上，截尾去逗号介词再加 " …"（postmortem #9）；全文进 drill ── */
    const meas = document.createElement("canvas").getContext("2d");
    function fitText(str, font, maxW) {
      meas.font = font;
      if (meas.measureText(str).width <= maxW) return str;
      const ELL = " …";
      let lo = 0, hi = str.length;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (meas.measureText(str.slice(0, mid) + ELL).width <= maxW) lo = mid; else hi = mid - 1;
      }
      const cut = str.slice(0, lo)
        .replace(/[\s，、,;；：:·]+$/u, "")
        .replace(/(以及|而且|或者|和|与|及|或|并|以|其|之|于|为|把|被|将|的|得|了|在)$/u, "")
        .replace(/[\s，、,;；：:·]+$/u, "")
        .replace(/(and|or|of|the|a|an|to|in|on|for|with)$/i, "")
        .replace(/[\s，、,;；：:·]+$/u, "");
      return cut + ELL;
    }

    const items = RPT.archives.slice().reverse(); // 显示顺序：07 → 01（自上而下）
    const animGroups = [];

    /* ── 顶部说明行（左：堆顶语义 / 右：右列读法） ── */
    const gCap = el("g", null, svg);
    putText(gCap, { x: mL, y: 38, str: "TOP OF STACK — 最后写入的层 · " + items[0].no + " " + items[0].name, size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".12em" });
    putText(gCap, { x: rX, y: 38, str: "HOLDS → THESIS · 每层装什么 · 为何存在", size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".12em" });
    animGroups.push(gCap);

    /* ── 七层堆叠 ── */
    items.forEach((a, i) => {
      const fy = y0 + i * pitch;
      const key = a.no === "04"; // 关键层：调查证据档案（蓝调 + 蓝框）
      const frontFill = key ? "rgba(34,81,255,.08)" : "#ffffff";
      const topFill   = key ? "rgba(34,81,255,.17)" : PAL.lineLo;
      const stroke    = key ? BLUE : PAL.ink;
      const sw        = key ? 1.5 : 1.2;

      const g = el("g", null, svg);
      g.style.cursor = "pointer";
      g.setAttribute("data-drill-keep", ""); // P16：触发元素带 data-drill-keep
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");

      // 先面后字：顶面（斜四边形）→ 前面（矩形）→ 文字最后（postmortem #4）
      el("polygon", {
        points: mL + "," + fy + " " + (mL + slabW) + "," + fy + " " +
                (mL + slabW + dX) + "," + (fy - dY) + " " + (mL + dX) + "," + (fy - dY),
        fill: topFill, stroke: stroke, "stroke-width": sw, "stroke-linejoin": "round",
      }, g);
      const front = el("rect", {
        x: mL, y: fy, width: slabW, height: slabH,
        fill: frontFill, stroke: stroke, "stroke-width": sw,
      }, g);

      putText(g, { x: mL + 14, y: fy + 16, str: "LAYER " + a.no, size: 9, family: MONO, fill: key ? BLUE : PAL.inkLo, ls: ".14em" });
      putText(g, { x: mL + 14, y: fy + 36, str: a.name, size: 17, family: SERIF, weight: 700, fill: key ? BLUE_HI : PAL.ink });

      // 右列：holds 摘要（截断，全文进 drill）+ italic thesis（关键层电蓝）
      putText(g, { x: rX, y: fy + 19, str: fitText(a.holds, F_HOLDS, rW), size: 12.5, family: SERIF, fill: PAL.inkMd });
      putText(g, { x: rX, y: fy + 37, str: fitText(a.thesis, F_THESIS, rW), size: 12, family: SERIF, style: "italic", fill: key ? BLUE : PAL.inkLo });

      // hover / 键盘 focus 提示：前面加深一档（关键层加深蓝调）；
      // 压掉浏览器默认 focus 描边（SVG g 的默认蓝圈会破坏板面），改用同一套加深反馈
      g.style.outline = "none";
      const hi = (on) => { front.setAttribute("fill", on ? (key ? "rgba(34,81,255,.14)" : PAL.hi) : frontFill); };
      g.addEventListener("mouseenter", () => hi(true));
      g.addEventListener("mouseleave", () => hi(false));
      g.addEventListener("focus", () => hi(true));
      g.addEventListener("blur", () => hi(false));

      const open = (cx, cy) => {
        let x = cx, y = cy;
        if (x == null) { const r = g.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
        U.showDrill({
          title: "LAYER " + a.no + " · 七类档案 · 一份权威案件记录",
          value: a.name,
          sub: "Holds（完整）：" + a.holds + "。<br>Thesis：" + a.thesis,
          source: SRC_LINE,
          x: x, y: y,
        });
      };
      g.addEventListener("click", (e) => open(e.clientX, e.clientY));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(null, null); }
      });
      animGroups.push(g);
    });

    /* ── 地面线 + 页脚注（§6.4：备份 / 缓存 / 只读投影不算第二套真相） ── */
    const gBase = el("g", null, svg);
    const gy = y0 + 6 * pitch + slabH + 6;
    el("line", { x1: mL, y1: gy, x2: mL + slabW + dX, y2: gy, stroke: PAL.line, "stroke-width": 1.5 }, gBase);
    putText(gBase, { x: mL, y: gy + 23, str: "7 类业务记录 · 一份受控逻辑记录 —— 备份 / 缓存 / 索引 / 只读投影不算第二套真相", size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".06em" });
    animGroups.push(gBase);

    /* ── 入场：自上而下逐层不透明滑入（IntersectionObserver fires once，threshold 0.15）；
          prefers-reduced-motion 直接画完成帧（§U.4） ── */
    function reveal() {
      animGroups.forEach((g, k) => {
        const show = () => {
          g.style.visibility = "visible";
          g.style.transition = "transform .55s cubic-bezier(.22,.61,.36,1)";
          g.style.transform = "translateY(0)";
        };
        setTimeout(show, 60 + k * 110);
      });
    }
    if (reduced) {
      // 完成帧：不隐藏、不过渡
    } else {
      animGroups.forEach((g) => { g.style.visibility = "hidden"; g.style.transform = "translateY(-24px)"; });
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((es) => {
          es.forEach((en) => { if (en.isIntersecting) { reveal(); io.disconnect(); } });
        }, { threshold: 0.15 });
        io.observe(host);
      } else {
        reveal();
      }
    }
  } catch (err) {
    /* 模块隔离：单模块异常不得波及其他模块 */
    if (window.console && console.warn) console.warn("archive-stack:", err);
  }
})();
