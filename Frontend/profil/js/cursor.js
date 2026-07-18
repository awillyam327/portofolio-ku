/**
 * cursor.js
 * Awwwards-style custom cursor: a small ring that eases toward the
 * pointer position every frame (hand-rolled lerp, standing in for
 * Framer Motion's useSpring) and grows on interactive elements.
 * Skipped entirely on touch devices.
 */
export function initCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

  let targetX = -100;
  let targetY = -100;
  let currentX = -100;
  let currentY = -100;
  const ease = 0.18;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.style.opacity = "1";
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button, [data-cursor-hover]")) {
      cursor.classList.add("cursor--hover");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button, [data-cursor-hover]")) {
      cursor.classList.remove("cursor--hover");
    }
  });

  function loop() {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    cursor.style.transform = `translate(${currentX - 16}px, ${currentY - 16}px) scale(${
      cursor.classList.contains("cursor--hover") ? 2.2 : 1
    })`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
