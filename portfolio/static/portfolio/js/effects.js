/* Effects for the current index.html (loaded as type="module"). Vanilla JS. */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Mobile menu */
const toggle = $(".nav-toggle"), links = $$(".nav-menu a");
const setMenu = open => toggle && toggle.setAttribute("aria-expanded", String(open));
toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
links.forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
document.addEventListener("click", e => {
  if (toggle?.getAttribute("aria-expanded") === "true" && !e.target.closest(".site-header")) setMenu(false);
});

/* Scroll progress + header state */
const bar = $(".scroll-progress"), header = $(".site-header");
let ticking = false;
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header?.classList.toggle("is-scrolled", scrollY > 30);
  ticking = false;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Scroll reveal (staggered per row); attribute removed after so hover transitions stay snappy */
const items = $$("[data-reveal]");
if ("IntersectionObserver" in window && !reduced) {
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {
      e.target.style.setProperty("--reveal-index", i);
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
      setTimeout(() => e.target.removeAttribute("data-reveal"), 1200);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(el => io.observe(el));
} else items.forEach(el => el.classList.add("is-visible"));

/* Active nav link */
if ("IntersectionObserver" in window) {
  const so = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => {
      const on = a.getAttribute("href") === `#${e.target.id}`;
      on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
    });
  }), { rootMargin: "-35% 0px -55% 0px" });
  $$("main section[id]").forEach(s => so.observe(s));
}

/* Cursor glow (desktop only) */
const glow = $(".cursor-glow");
if (glow && canHover && !reduced) {
  addEventListener("pointermove", e => {
    glow.classList.add("is-active");
    glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow.classList.remove("is-active"));
}