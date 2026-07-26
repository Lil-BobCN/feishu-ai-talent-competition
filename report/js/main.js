/* ═══════════════════════════════════════════════════════════
   main.js · 主滚动引擎（最后加载）
   - IntersectionObserver 入场动画：.band 与 .chart-frame 渐入（threshold 0.12，只触发一次）
   - prefers-reduced-motion：直接呈现完成态
   - 封面 chips 平滑滚动
   - 右栏 data-win 切换：派发自定义事件 'win-change'（dashboard.js 监听）
   - 顶部 2px 阅读进度条：transform 实现（postmortem #14：不用 opacity 过渡）
   ═══════════════════════════════════════════════════════════ */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 阅读进度细条（顶部 2px，transform） ── */
  const bar = document.createElement("div");
  bar.id = "progress-bar";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  let ticking = false;
  function updateBar() {
    ticking = false;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
    bar.style.transform = "scaleX(" + p + ")";
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* ── 入场动画（.band / .chart-frame 渐入，fires once） ── */
  const enterTargets = document.querySelectorAll(".band, .chart-frame");
  if (reduced) {
    enterTargets.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    enterTargets.forEach(el => io.observe(el));
  }

  /* ── chips 平滑滚动 ── */
  document.querySelectorAll(".chip[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = document.querySelector(btn.getAttribute("data-goto"));
      if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });

  /* ── 右栏滑入 + data-win 切换 ── */
  const rail = document.getElementById("dash-rail");
  const cover = document.getElementById("cover");
  let curWin = null;
  function setWin(win) {
    if (win === curWin) return;
    curWin = win;
    window.dispatchEvent(new CustomEvent("win-change", { detail: { win } }));
  }
  const bands = Array.from(document.querySelectorAll("section.band[data-win], footer[data-win]"));
  function onScrollWin() {
    // 右栏：离开封面后滑入
    if (rail && cover) {
      const past = window.scrollY > cover.offsetHeight * 0.62;
      rail.classList.toggle("on", past);
    }
    // 取当前视口顶部 35% 处命中的章节
    const probe = window.scrollY + window.innerHeight * 0.35;
    let active = null;
    for (const b of bands) {
      if (b.offsetTop <= probe) active = b;
      else break;
    }
    if (active) setWin(active.getAttribute("data-win"));
  }
  window.addEventListener("scroll", () => requestAnimationFrame(onScrollWin), { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(onScrollWin));
  onScrollWin();
})();
