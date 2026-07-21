/* passkey/guide — animated ASCII bg · parallax · mask reveals */
"use strict";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   1. Animated ASCII background — multi-layer character rain.
   Layers move at different speeds + shift with page scroll,
   creating parallax depth behind the editorial layout.
   ========================================================= */
(function asciiRain() {
  const canvas = document.getElementById("ascii-bg");
  const ctx = canvas.getContext("2d");

  const CHARS = "01#$%&@*+=?!~^:;".split("");
  const WORDS = ["****", "key", "fido", "auth", "2fa", "p@ss", "hash", "lock"];

  const LAYERS = [
    { size: 12, speed: 0.4,  alpha: 0.14, parallax: 0.05, color: "#1f6f80" },
    { size: 16, speed: 0.75, alpha: 0.20, parallax: 0.12, color: "#22d3ee" },
    { size: 21, speed: 1.25, alpha: 0.28, parallax: 0.24, color: "#8b7cf6" },
  ];

  let W, H, layers, scrollY = 0;

  function spawnTrail() {
    const len = 4 + Math.floor(Math.random() * 9);
    const trail = [];
    for (let i = 0; i < len; i++) {
      trail.push(Math.random() < 0.07
        ? WORDS[Math.floor(Math.random() * WORDS.length)]
        : CHARS[Math.floor(Math.random() * CHARS.length)]);
    }
    return trail;
  }

  function build() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    layers = LAYERS.map(cfg => {
      const cols = Math.ceil(W / (cfg.size * 1.4));
      const drops = [];
      for (let i = 0; i < cols; i++) {
        drops.push({
          x: i * cfg.size * 1.4 + Math.random() * cfg.size,
          y: Math.random() * H,
          speed: cfg.speed * (0.6 + Math.random() * 0.8),
          chars: spawnTrail(),
          drift: (Math.random() - 0.5) * 0.12,
        });
      }
      return { cfg, drops };
    });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const { cfg, drops } of layers) {
      ctx.font = `${cfg.size}px "JetBrains Mono", Consolas, monospace`;
      const scrollShift = scrollY * cfg.parallax;
      for (const d of drops) {
        for (let i = 0; i < d.chars.length; i++) {
          const isHead = i === 0;
          ctx.globalAlpha = isHead ? Math.min(cfg.alpha + 0.22, 0.55) : cfg.alpha * (1 - i / d.chars.length);
          ctx.fillStyle = isHead ? "#d9f6ff" : cfg.color;
          ctx.fillText(d.chars[i], d.x, d.y - i * cfg.size * 1.25 + (scrollShift % (H * 2)));
        }
        if (!REDUCED) {
          d.y += d.speed;
          d.x += d.drift;
          if (Math.random() < 0.02) {
            const idx = Math.floor(Math.random() * d.chars.length);
            d.chars[idx] = Math.random() < 0.06
              ? WORDS[Math.floor(Math.random() * WORDS.length)]
              : CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          if (d.y - d.chars.length * cfg.size * 1.25 > H) {
            d.y = -Math.random() * 200;
            d.x = Math.random() * W;
            d.chars = spawnTrail();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", build);
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  build();
  requestAnimationFrame(frame);
})();

/* =========================================================
   2. Hero entrance — trigger mask reveals after page load
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.querySelectorAll(".hero .mask").forEach(m => m.classList.add("in"));
  });
});

/* =========================================================
   3. Reveal-on-scroll — .mask & .reveal
   ========================================================= */
(function reveal() {
  const targets = document.querySelectorAll(".reveal, main .mask");
  if (REDUCED || !("IntersectionObserver" in window)) {
    targets.forEach(e => e.classList.add("visible", "in"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("visible", "in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  targets.forEach(e => io.observe(e));
})();

/* =========================================================
   4. Parallax — [data-speed] elements lag behind scroll
   ========================================================= */
(function parallax() {
  if (REDUCED) return;
  const els = Array.from(document.querySelectorAll("[data-speed]"));
  if (!els.length) return;
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of els) {
      const speed = parseFloat(el.dataset.speed) || 0;
      const r = el.getBoundingClientRect();
      const delta = (r.top + r.height / 2) - vh / 2;
      el.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0)`;
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

/* =========================================================
   5. Header state + scroll progress
   ========================================================= */
(function chrome() {
  const header = document.getElementById("siteHeader");
  const bar = document.getElementById("scrollbar");
  function update() {
    header.classList.toggle("scrolled", window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
