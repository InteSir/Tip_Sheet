// The Tip Sheet: small progressive-enhancement script (no dependencies, no tracking).
(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const header = document.querySelector("[data-header]");
  const ICON_OPEN = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  // ---------- Mobile menu ----------
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      toggle.innerHTML = (open ? ICON_CLOSE : ICON_OPEN) + `<span class="visually-hidden">${open ? "Close menu" : "Open menu"}</span>`;
      if (open) menu.querySelector("a")?.focus();
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setOpen(false));
  }

  // ---------- Compact header on scroll ----------
  if (header) {
    let ticking = false;
    const onScroll = () => { header.classList.toggle("is-compact", window.scrollY > 120); ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  }

  // ---------- Saved favourites (stored only in this browser) ----------
  const KEY = "tipsheet-saved-v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked */ } };
  const countEls = document.querySelectorAll("[data-saved-count]");
  const renderCount = () => {
    const n = read().length;
    countEls.forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    document.querySelectorAll(".saved-link").forEach((a) => a.setAttribute("aria-label", n ? `Saved looks (${n})` : "Saved looks"));
  };
  const syncButtons = () => {
    const ids = new Set(read().map((x) => x.id));
    document.querySelectorAll("[data-save]").forEach((btn) => {
      let item; try { item = JSON.parse(btn.dataset.save); } catch { return; }
      const on = ids.has(item.id);
      btn.setAttribute("aria-pressed", String(on));
      const lbl = btn.querySelector("[data-save-label]");
      if (lbl) lbl.textContent = on ? "Saved" : "Save";
    });
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-save]");
    if (!btn) return;
    let item; try { item = JSON.parse(btn.dataset.save); } catch { return; }
    const list = read();
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list.splice(i, 1); else list.unshift({ ...item, d: Date.now() });
    write(list); syncButtons(); renderCount(); renderSaved();
  });

  // Saved page
  const listEl = document.querySelector("[data-saved-list]");
  const emptyEl = document.querySelector("[data-saved-empty]");
  const clearEl = document.querySelector("[data-saved-clear]");
  const escH = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function renderSaved() {
    if (!listEl) return;
    const list = read();
    listEl.innerHTML = list.map((x) => `<article class="article-card look-tile">
      <a class="article-card__link" href="${escH(x.u)}"><span class="media ratio-45"><img src="${escH(x.i)}" alt="" loading="lazy" width="400" height="400"></span>
      <h2 class="article-card__title">${escH(x.t)}</h2><p class="look-card__from">From: ${escH(x.a)}</p></a>
      <button class="act act--save" type="button" aria-pressed="true" data-save="${escH(JSON.stringify({ id: x.id, t: x.t, u: x.u, i: x.i, a: x.a }))}"><span data-save-label>Saved</span><span class="visually-hidden">: remove ${escH(x.t)}</span></button>
    </article>`).join("");
    if (emptyEl) emptyEl.hidden = list.length > 0;
    if (clearEl) clearEl.hidden = list.length === 0;
  }
  clearEl?.addEventListener("click", () => { if (confirm("Remove all saved looks from this device?")) { write([]); renderSaved(); renderCount(); syncButtons(); } });
  window.addEventListener("storage", (e) => { if (e.key === KEY) { syncButtons(); renderCount(); renderSaved(); } });
  syncButtons(); renderCount(); renderSaved();

  // ---------- More like this (Look Card action bar) ----------
  // The panel is visible without JavaScript; with JS it starts closed and the button toggles it.
  document.querySelectorAll("[data-more-toggle]").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    panel.hidden = true;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      if (open) panel.querySelector("a")?.focus({ preventScroll: true });
    });
  });

  // ---------- Print buttons (sizing chart, prep checklist) ----------
  document.querySelectorAll("[data-print]").forEach((b) => b.addEventListener("click", () => window.print()));

  // ---------- Open the look (or problem) a link points to ----------
  const openHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) el.classList.add("is-target");
  };
  window.addEventListener("hashchange", openHash); openHash();
})();
