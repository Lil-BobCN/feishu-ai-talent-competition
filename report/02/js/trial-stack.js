/* ═══════════════════════════════════════════════════════════
   trial-stack.js · §6.3 试验记录八字段 2.5D 层叠（CHARTS.md P8 · value stack）
   宿主：#trial-chart（.wide.xl）｜数据：window.RPT.trialLayers（8 字段：field/meaning）
   论点：八个字段叠成一份完整试验记录；「审批」层蓝调+蓝框——无批准，不进生产。
   结构：斜四边形顶面 + 矩形前面，自上而下 LAYER 08→01 堆叠（mono 层号）；
        层号 = 写入顺序（01 假设最先写下 → 08 版本关系最后记录，档案夹母题，呼应 01 archive-stack）；
        板上右端 mono 标注写入阶段（诊断时 / 试验前 / 检验后 / 批准时——由 RPT.roles/gates/approvals
        已确认流程推断，非新增事实）；右列每层 meaning 摘要（截断到像素预算，断点不落逗号/介词，
        全文进 drill）+ 一句 italic 注记；每层点击 drill 到完整含义 + 母稿 EV-03 出处。
   入场：自上而下逐层「不透明滑入」（visibility + transform，不用 opacity —— postmortem #7/#14）。
   数据说明：RPT.trialLayers 八层齐备（真源 EV-03 行208「至少记录」八项），无需缺口标记；
        字段集合为「本方案设计判断」，字段合同与保管位置待台账冻结（§8 unknown）——只标注，不涂红。
   红线：不写“自动学习”；无案件数 / 评测成绩 / 版本号 / 模拟队列；层号为结构性计数。
   ═══════════════════════════════════════════════════════════ */
(function () {
  const host = document.getElementById('trial-chart');
  if (!host) return;
  try {
    const U = window.U, RPT = window.RPT;
    if (!U || !RPT || !Array.isArray(RPT.trialLayers) || !RPT.trialLayers.length) return; // 宁可缺失不得编造

    const PAL = U.PAL;
    const BLUE = PAL.red, BLUE_HI = PAL.redHi; // PAL.red = 电蓝（legacy 槽位，postmortem #24；真红 PAL.neg 本图无语义用途，不用）
    const SERIF = "'et-book','Songti SC',Palatino,Georgia,serif";
    const MONO  = "Menlo,Consolas,monospace";
    const F_MEAN = "12.5px " + SERIF;
    const F_NOTE = "italic 12px " + SERIF;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* 每字段的写入阶段与一句 italic 注记（注记为含义的诠释性注脚，非新事实） */
    const EXTRA = {
      "假设":     { stage: "诊断时", note: "为什么没按预期，先假设再求证" },
      "修改对象": { stage: "诊断时", note: "改在哪一处，才查得回去" },
      "基线":     { stage: "试验前", note: "留住修改前，才有对照" },
      "案例集":   { stage: "试验前", note: "历史回放加留出，不许自证" },
      "指标":     { stage: "试验前", note: "验收条件先于试验写下" },
      "结论":     { stage: "检验后", note: "未通过的失败证据同样保留" },
      "审批":     { stage: "批准时", note: "无批准，不进生产" },
      "版本关系": { stage: "批准时", note: "知道从哪来，才回得去" },
    };

    const SRC_LINE = "研究整理 — 02 专题工作稿 EV-03 试验记录字段（行208 · K3 · 2026-07-24）· 字段合同与保管位置待台账冻结";

    const body = U.frame(host, {
      title: "试验记录八字段层叠：无批准，不进生产",
      sub: "STACK DIAGRAM · 自上而下 LAYER 08→01（08 版本关系最后记录 · 01 假设最先写下）· 蓝色层 = 审批 · 点击任一层查看完整字段含义与 EV-03 出处",
      src: "研究整理 — 02 能力进化循环专题工作稿 EV-03（K3 · 2026-07-24）· 字段集合为本方案设计判断，字段合同待台账冻结",
    });

    /* ── 固定 viewBox 坐标系：不量容器宽度（P21 铁律①），width:100% 自适应 ── */
    const W = 880, H = 590;
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
      if (o.anchor) t.setAttribute("text-anchor", o.anchor);
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

    /* 显示顺序：LAYER 08 → 01（自上而下）；层号 = 数据序 + 1（假设=01 … 版本关系=08） */
    const items = RPT.trialLayers.map((a, i) => ({
      no: "0" + (i + 1), field: a.field, meaning: a.meaning,
      stage: (EXTRA[a.field] || {}).stage || "记录时",
      note: (EXTRA[a.field] || {}).note || "",
    })).reverse();
    const animGroups = [];

    /* ── 顶部说明行（左：堆顶语义 / 右：右列读法） ── */
    const gCap = el("g", null, svg);
    putText(gCap, { x: mL, y: 38, str: "TOP OF STACK — 最后记录的字段 · LAYER " + items[0].no + " " + items[0].field, size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".12em" });
    putText(gCap, { x: rX, y: 38, str: "MEANING → NOTE · 字段含义 · 一句注记", size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".12em" });
    animGroups.push(gCap);

    /* ── 八层堆叠 ── */
    items.forEach((a, i) => {
      const fy = y0 + i * pitch;
      const key = a.field === "审批"; // 关键层：审批（蓝调 + 蓝框——无批准不进生产）
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
      putText(g, { x: mL + slabW - 14, y: fy + 16, str: "写入 · " + a.stage, size: 9, family: MONO, fill: key ? BLUE : PAL.inkLo, ls: ".06em", anchor: "end" });
      putText(g, { x: mL + 14, y: fy + 36, str: a.field, size: 17, family: SERIF, weight: 700, fill: key ? BLUE_HI : PAL.ink });

      // 右列：meaning 摘要（截断，全文进 drill）+ italic 注记（关键层电蓝）
      putText(g, { x: rX, y: fy + 19, str: fitText(a.meaning, F_MEAN, rW), size: 12.5, family: SERIF, fill: PAL.inkMd });
      if (a.note) putText(g, { x: rX, y: fy + 37, str: fitText(a.note, F_NOTE, rW), size: 12, family: SERIF, style: "italic", fill: key ? BLUE : PAL.inkLo });

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
          title: "LAYER " + a.no + " · " + a.field + " · 试验记录字段（共 8 层）",
          value: a.field,
          sub: "含义（完整）：" + a.meaning + "。<br>注记：" + (a.note || "—") + "<br>写入阶段：" + a.stage + "。",
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

    /* ── 地面线 + 页脚注（EV-03：至少记录以上 8 字段；合同待台账冻结） ── */
    const gBase = el("g", null, svg);
    const gy = y0 + 7 * pitch + slabH + 6;
    el("line", { x1: mL, y1: gy, x2: mL + slabW + dX, y2: gy, stroke: PAL.line, "stroke-width": 1.5 }, gBase);
    putText(gBase, { x: mL, y: gy + 23, str: "EV-03 · 至少记录以上 8 字段 —— 未通过保留失败证据 · 暂缓与驳回保留全部记录 · 字段合同与保管位置待台账冻结", size: 9.5, family: MONO, fill: PAL.inkLo, ls: ".06em" });
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
    if (window.console && console.warn) console.warn("trial-stack:", err);
  }
})();
