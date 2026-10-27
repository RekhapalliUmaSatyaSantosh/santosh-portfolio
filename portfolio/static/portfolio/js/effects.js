/**
 * Portfolio interactions.
 * Each feature is its own init function. Listeners are registered once,
 * DOM lookups happen once, and all per-frame work is batched in rAF.
 */

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const desktopNavQuery = window.matchMedia("(min-width: 48em)");

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Collapse bursts of events into at most one callback per animation frame. */
const rafThrottle = (callback) => {
  let frameId = 0;
  let latestArgs = [];

  return (...args) => {
    latestArgs = args;
    if (frameId) return;

    frameId = requestAnimationFrame(() => {
      frameId = 0;
      callback(...latestArgs);
    });
  };
};

/* Reading progress (transform-only, no layout) ---------------------------- */
const initScrollProgress = () => {
  const bar = $(".scroll-progress");
  if (!bar) return;

  let maxScroll = 1;

  const measure = () => {
    maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  };

  const render = rafThrottle(() => {
    const ratio = Math.min(window.scrollY / maxScroll, 1);
    bar.style.transform = `scaleX(${ratio})`;
  });

  measure();
  render();

  window.addEventListener("scroll", render, { passive: true });
  new ResizeObserver(() => {
    measure();
    render();
  }).observe(document.documentElement);
};

/* Reveal on scroll -------------------------------------------------------- */
const initReveal = () => {
  const items = $$("[data-reveal]");
  if (!items.length) return;

  const showAll = () => items.forEach((item) => item.classList.add("is-visible"));

  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  // Stagger siblings (cards in the same grid) by a small repeating index.
  const siblingCounts = new Map();
  items.forEach((item) => {
    const count = siblingCounts.get(item.parentElement) ?? 0;
    item.style.setProperty("--reveal-index", String(count % 4));
    siblingCounts.set(item.parentElement, count + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  items.forEach((item) => observer.observe(item));
};

/* Navigation: mobile menu + active section -------------------------------- */
const initNavigation = () => {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const menu = $("#nav-menu");
  if (!header || !toggle || !menu) return;

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Event delegation: one listener for every menu link
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  desktopNavQuery.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });

  // Highlight the link for the section currently in view
  if (!("IntersectionObserver" in window)) return;

  const links = $$('a[href^="#"]', menu);
  const linkBySectionId = new Map(links.map((link) => [link.hash.slice(1), link]));
  const sections = $$("main > section[id]");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => link.removeAttribute("aria-current"));
        linkBySectionId.get(entry.target.id)?.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
};

/* Pointer-follow glow ----------------------------------------------------- */
const initCursorGlow = () => {
  const glow = $(".cursor-glow");
  if (!glow || !finePointerQuery.matches || motionQuery.matches) return;

  const move = rafThrottle((x, y) => {
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    glow.classList.add("is-active");
  });

  document.addEventListener("pointermove", (event) => move(event.clientX, event.clientY), {
    passive: true,
  });
  document.documentElement.addEventListener("pointerleave", () => {
    glow.classList.remove("is-active");
  });
};

/* Gentle portrait parallax ------------------------------------------------ */
const initPortraitTilt = () => {
  const visual = $(".hero-visual");
  const portrait = $(".portrait");
  if (!visual || !portrait || !finePointerQuery.matches || motionQuery.matches) return;

  const MAX_SHIFT = 8; // px

  const update = rafThrottle((clientX, clientY) => {
    const bounds = visual.getBoundingClientRect();
    const x = (clientX - bounds.left) / bounds.width - 0.5;
    const y = (clientY - bounds.top) / bounds.height - 0.5;
    portrait.style.transform = `translate3d(${x * MAX_SHIFT}px, ${y * MAX_SHIFT}px, 0)`;
  });

  visual.addEventListener("pointermove", (event) => update(event.clientX, event.clientY), {
    passive: true,
  });
  visual.addEventListener("pointerleave", () => {
    portrait.style.transform = "";
  });
};

initScrollProgress();
initReveal();
initNavigation();
initCursorGlow();
initPortraitTilt();