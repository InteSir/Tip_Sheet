// The Tip Sheet: tiny progressive-enhancement script (no dependencies).
(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const header = document.querySelector("[data-header]");

  // Mobile menu
  if (toggle && menu) {
    const label = toggle.querySelector(".visually-hidden");
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Close menu" : "Open menu";
      toggle.innerHTML = (open
        ? '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>')
        + `<span class="visually-hidden">${open ? "Close menu" : "Open menu"}</span>`;
      if (open) menu.querySelector("a")?.focus();
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setOpen(false));
  }

  // Compact header on scroll
  if (header) {
    let ticking = false;
    const onScroll = () => {
      header.classList.toggle("is-compact", window.scrollY > 120);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  }
})();
