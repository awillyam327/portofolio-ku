/**
 * navbar.js
 * Floating navbar + fullscreen menu. The clip-path circle reveal itself
 * lives in CSS (.nav-overlay / .nav-overlay--open); this just toggles
 * the class and keeps aria-expanded / body scroll in sync.
 */
export function initNavbar() {
  const toggle = document.getElementById("navToggle");
  const overlay = document.getElementById("navOverlay");
  if (!toggle || !overlay) return;

  function setOpen(isOpen) {
    overlay.classList.toggle("nav-overlay--open", isOpen);
    toggle.classList.toggle("navbar__toggle--active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggle.addEventListener("click", () => {
    setOpen(!overlay.classList.contains("nav-overlay--open"));
  });

  overlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/** Lets other modules (e.g. main.js after fetching profil) update the name shown in the menu footer. */
export function setNavIdentity({ name }) {
  const nameEl = document.querySelector("[data-nav-name]");
  if (name && nameEl) nameEl.textContent = name;
}
