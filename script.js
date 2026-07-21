/* What is a Passkey? — animated ASCII bg + parallax + reveal */
"use strict";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   1. Animated ASCII background — multi-layer "rain"
   Characters drift downward at different speeds; layers also
   shift with page scroll => parallax depth.
   ========================================================= */
(function asciiRain() {
  const canvas = document.getElementById("ascii-bg");
  const ctx = canvas.getContext("2d");

  // glyph pools: passwords/symbols dissolving into "key-ish" marks
  const CHARS = "01#$%&@*+=?!~^:;<>[]{}".split("");
  const WORDS = ["****", "p@ss", "key", "auth", "fido", "2fa", "hash"];

  const LAYERS = [
    { size: 13, speed: 0.45, alpha: 0.16, parallax: 0.06, color: "#22d3ee" },
    { size: 17, speed: 0.80, alpha: 0.24, parallax: 0.14, color: "#22d3ee" },
    { size: 22, speed: 1.30, alpha: 0.33, parallax: 0.26, color: "#a78bfa" },
  ];

  let W, H, layers, scrollY = 0;

  function build() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    layers = LAYERS.map(cfg => {
      const cols = Math.ceil(W / (cfg.size * 1.1));
      const drops = [];
      for (let i = 0; i < cols; i++) {
        drops.push({
          x: i * cfg.size * 1.1,
          y: Math.random() * H,
          speed: cfg.speed * (0.6 + Math.random() * 0.8),
          chars: spawnTrail(),
          drift: (Math.random() - 0.5) * 0.15,
        });
      }
      return { cfg, drops };
    });
  }

  function spawnTrail() {
    const len = 4 + Math.floor(Math.random() * 8);
    const trail = [];
    for (let i = 0; i < len; i++) {
      trail.push(
        Math.random() < 0.08
          ? WORDS[Math.floor(Math.random() * WORDS.length)]
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      );
    }
    return trail;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const { cfg, drops } of layers) {
      ctx.font = `${cfg.size}px "Cascadia Code", Consolas, monospace`;
      ctx.fillStyle = cfg.color;
      const scrollShift = scrollY * cfg.parallax;
      for (const d of drops) {
        for (let i = 0; i < d.chars.length; i++) {
          const fade = 1 - i / d.chars.length;
          ctx.globalAlpha = cfg.alpha * fade;
          ctx.fillText(
            d.chars[i],
            d.x,
            d.y - i * cfg.size * 1.25 + scrollShift % (H * 2)
          );
        }
        if (!REDUCED) {
          d.y += d.speed;
          d.x += d.drift;
          // occasionally mutate a character -> "living" wall of text
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
   2. Hero ASCII key art with "digital shimmer" glitch
   ========================================================= */
(function heroAscii() {
  const el = document.getElementById("hero-ascii");
  if (!el) return;

  const ART = String.raw`
         ________
        /        \
       /  ______  \
      |  /      \  |
      |  \______/  |
       \          /
        \________/
            ||
            ||
            ||
            ||
            ||====.
            ||    |
            ||===='
            ||
            ||
            ||====.
            ||    |
            ||===='
            ||
           _||_
          |____|
`;

  el.textContent = ART;
  if (REDUCED) return;

  const GLITCH = "*#%&@$?+~".split("");
  // indices of drawable (non-space) characters
  const solidIdx = [];
  for (let i = 0; i < ART.length; i++) {
    if (!/\s/.test(ART[i])) solidIdx.push(i);
  }

  const active = new Map(); // idx -> frames remaining

  setInterval(() => {
    const arr = ART.split("");
    // spawn new glitches
    const spawn = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < spawn; i++) {
      const idx = solidIdx[Math.floor(Math.random() * solidIdx.length)];
      active.set(idx, 2 + Math.floor(Math.random() * 4));
    }
    // apply & age glitches
    for (const [idx, ttl] of active) {
      if (ttl <= 0) { active.delete(idx); continue; }
      arr[idx] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
      active.set(idx, ttl - 1);
    }
    el.textContent = arr.join("");
  }, 90);
})();

/* =========================================================
   3. Parallax scrolling for [data-speed] elements
   speed > 0: element lags behind scroll (moves slower)
   ========================================================= */
(function parallax() {
  if (REDUCED) return;
  const els = Array.from(document.querySelectorAll("[data-speed]"));
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of els) {
      const speed = parseFloat(el.dataset.speed) || 0;
      const r = el.getBoundingClientRect();
      // distance of element center from viewport center
      const delta = (r.top + r.height / 2) - vh / 2;
      el.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0)`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

/* =========================================================
   4. Reveal-on-scroll
   ========================================================= */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (REDUCED || !("IntersectionObserver" in window)) {
    els.forEach(e => e.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach(e => io.observe(e));
})();
