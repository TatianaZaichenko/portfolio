(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const i18n = window.TA_I18N;

  const applyLang = (lang) => {
    if (!i18n) return;
    i18n.apply(lang);
    const menuBtn = document.querySelector("[data-menu]");
    if (menuBtn) {
      const open = document.body.classList.contains("nav-open");
      menuBtn.setAttribute("aria-label", i18n.t(lang, open ? "nav.menuClose" : "nav.menu"));
    }
  };

  const isHome = document.body.hasAttribute("data-home");
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const id = a.getAttribute("data-nav");
    if (!id) return;
    a.setAttribute("href", isHome ? `#${id}` : `index.html#${id}`);
  });

  const startLang = i18n ? i18n.pick() : "en";
  applyLang(startLang);

  const preloader = document.querySelector("[data-preloader]");
  const countEl = document.querySelector("[data-count]");
  if (preloader && !sessionStorage.getItem("ta-preloaded") && !reduce) {
    let n = 0;
    const tick = () => {
      n = Math.min(100, n + Math.floor(Math.random() * 14) + 4);
      if (countEl) countEl.textContent = String(n).padStart(2, "0");
      if (n < 100) requestAnimationFrame(() => setTimeout(tick, 40));
      else {
        setTimeout(() => {
          preloader.classList.add("is-done");
          sessionStorage.setItem("ta-preloaded", "1");
        }, 280);
      }
    };
    tick();
  } else if (preloader) {
    preloader.classList.add("is-done");
  }

  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const menuBtn = document.querySelector("[data-menu]");
  const overlay = document.querySelector("[data-overlay]");
  if (menuBtn && overlay) {
    menuBtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      overlay.setAttribute("aria-hidden", String(!open));
      const lang = localStorage.getItem("ta-lang") || "en";
      menuBtn.setAttribute("aria-label", i18n ? i18n.t(lang, open ? "nav.menuClose" : "nav.menu") : open ? "Close menu" : "Open menu");
    });
    overlay.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        overlay.setAttribute("aria-hidden", "true");
      });
    });
  }

  document.querySelectorAll("[data-lang]").forEach((root) => {
    const toggle = root.querySelector("[data-lang-toggle]");
    const menu = root.querySelector("[data-lang-menu]");
    if (!toggle || !menu) return;

    const close = () => {
      root.classList.remove("is-open");
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      root.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang-set]");
      if (!btn) return;
      applyLang(btn.getAttribute("data-lang-set"));
      close();
    });

    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) close();
    });
  });

  if (!coarse && !reduce) {
    const ring = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor-dot");
    const label = document.querySelector(".cursor-label");
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;

    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (dot) {
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
      }
    });

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }
      if (label) {
        label.style.left = `${rx}px`;
        label.style.top = `${ry - 36}px`;
      }
      requestAnimationFrame(loop);
    };
    loop();

    const hoverables = document.querySelectorAll("[data-hover], a, button");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => ring && ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring && ring.classList.remove("is-hover"));
    });

    document.querySelectorAll("[data-cursor], [data-i18n-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (!label) return;
        label.textContent = el.getAttribute("data-cursor") || "View";
        label.classList.add("is-on");
      });
      el.addEventListener("mouseleave", () => label && label.classList.remove("is-on"));
    });

    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.22 - 3}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  document.querySelectorAll(".inview").forEach((el) => io.observe(el));

  const filters = document.querySelector("[data-filters]");
  if (filters) {
    const cards = document.querySelectorAll("[data-cat]");
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filters.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const key = btn.getAttribute("data-filter");
      cards.forEach((card) => {
        const show = key === "all" || card.getAttribute("data-cat") === key;
        card.style.display = show ? "" : "none";
      });
    });
  }

  const workCarousel = document.querySelector("[data-work-carousel]");
  if (workCarousel) {
    const cards = [...workCarousel.querySelectorAll(".work-card")];
    const n = cards.length;
    const TAU = Math.PI * 2;
    const SPEED = TAU / 18000;
    let angle = 0;
    let last = 0;
    let paused = false;

    const paint = (now) => {
      if (!last) last = now;
      const dt = Math.min(32, now - last);
      last = now;
      if (!paused) angle += dt * SPEED;

      cards.forEach((card, i) => {
        const a = angle + (TAU * i) / n;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const depth = (cos + 1) / 2;
        const x = -50 + sin * 64;
        const y = -34 - (1 - cos) * 10;
        const scale = 0.66 + 0.34 * depth;
        const rot = sin * 5;
        const z = String(Math.round(10 + depth * 20));
        card.style.setProperty(
          "transform",
          `translate(${x}%, ${y}%) scale(${scale}) rotate(${rot}deg)`,
          "important"
        );
        card.style.zIndex = z;
        card.classList.toggle("is-front", depth > 0.78);
      });
      requestAnimationFrame(paint);
    };
    requestAnimationFrame(paint);

    workCarousel.addEventListener("mouseenter", (e) => {
      if (e.target.closest(".work-card")) paused = true;
    }, true);
    workCarousel.addEventListener("mouseleave", () => {
      paused = false;
    });
  }
})();
