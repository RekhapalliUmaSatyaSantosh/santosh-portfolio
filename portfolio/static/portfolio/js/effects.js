document.documentElement.classList.replace("no-js", "js");
document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const header = document.querySelector(".site-header");
    const progressBar = document.querySelector("#reading-progress-bar");
    const toggle = document.querySelector(".nav-toggle");
    const navPanel = document.querySelector(".nav-panel");
    const navLinks = document.querySelectorAll(
        '.nav-menu a[href^="#"]'
    );
    function closeMenu() {
        if (!toggle || !navPanel) return;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        navPanel.classList.remove("is-open");
    }
    function openMenu() {
        if (!toggle || !navPanel) return;
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation");
        navPanel.classList.add("is-open");
    }
    if (toggle && navPanel) {
        toggle.addEventListener("click", () => {
            const isOpen =
                toggle.getAttribute("aria-expanded") === "true";

            isOpen ? closeMenu() : openMenu();
        });
        navLinks.forEach(link => {
            link.addEventListener("click", closeMenu);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
                toggle.focus();
            }
        });
        document.addEventListener("click", event => {
            const clickedInside =
                navPanel.contains(event.target) ||
                toggle.contains(event.target);
            if (!clickedInside) {
                closeMenu();
            }
        });
        window.addEventListener("resize", () => {
            if (window.innerWidth > 680) {
                closeMenu();
            }
        });
    }
    let scrollScheduled = false;
    function updateScrollUI() {
        const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop;
        const scrollHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;
        const percentage =
            scrollHeight > 0
                ? (scrollTop / scrollHeight) * 100
                : 0;
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (header) {
            header.classList.toggle(
                "is-scrolled",
                scrollTop > 20
            );
        }
        scrollScheduled = false;
    }
    window.addEventListener("scroll", () => {
        if (!scrollScheduled) {
            window.requestAnimationFrame(updateScrollUI);
            scrollScheduled = true;
        }
    }, { passive: true });
    updateScrollUI();
    const revealElements =
        document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });
    }
    const sections = document.querySelectorAll(
        "main section[id]"
    );
    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const currentId = entry.target.id;
                    navLinks.forEach(link => {
                        const active =
                            link.getAttribute("href") ===
                            `#${currentId}`;
                        link.classList.toggle("active", active);
                        if (active) {
                            link.setAttribute(
                                "aria-current",
                                "location"
                            );
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0
            }
        );
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = document.querySelector(targetId);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });
            if (targetId === "#main") {
                target.focus({ preventScroll: true });
            }
        });
    });
    const portrait = document.querySelector(".portrait-frame img");
    if (portrait) {
        portrait.addEventListener("error", () => {
            portrait.style.display = "none";
            portrait.parentElement.style.background = "#FFD6A5";
        }, { once: true });
    }
});
