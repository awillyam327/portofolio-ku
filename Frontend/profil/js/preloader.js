/**
 * preloader.js
 * Drives the loading-bar percentage (backed by REAL progress — image
 * sequence + profile fetch, not a fake timer) and reveals the page with
 * a clip-path wipe once everything is ready.
 *
 * BUG FIX: Added a 2-second timeout fallback. If `transitionend` for
 * clip-path never fires (some browsers/environments), the preloader is
 * force-removed so the page isn't permanently blocked.
 */
const preloaderEl = document.getElementById("preloader");
const fillEl = document.getElementById("preloaderFill");
const percentEl = document.getElementById("preloaderPercent");

export function setProgress(percent) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  if (fillEl) fillEl.style.width = `${clamped}%`;
  if (percentEl) percentEl.textContent = `${clamped}%`;
}

export function setIdentity({ name, role }) {
  const nameEl = document.querySelector("[data-preloader-name]");
  const roleEl = document.querySelector("[data-preloader-role]");
  if (name && nameEl) nameEl.textContent = name;
  if (role && roleEl) roleEl.textContent = role;
}

/** Plays the exit wipe and resolves once the transition finishes.
 *  Includes a timeout fallback to prevent infinite blocking. */
export function reveal() {
  return new Promise((resolve) => {
    if (!preloaderEl) {
      resolve();
      return;
    }

    let resolved = false;
    function finish() {
      if (resolved) return;
      resolved = true;
      preloaderEl.style.display = "none";
      resolve();
    }

    // Listen for the real CSS transition end
    preloaderEl.addEventListener(
      "transitionend",
      function handler(event) {
        if (event.propertyName !== "clip-path") return;
        preloaderEl.removeEventListener("transitionend", handler);
        finish();
      }
    );

    // Safety net: if transitionend never fires, force-finish after 2s
    setTimeout(finish, 2000);

    preloaderEl.classList.add("preloader--exit");
  });
}
