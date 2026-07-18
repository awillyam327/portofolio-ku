/**
 * sequence-scroll.js
 * The core mechanic: a 500vh section with a sticky canvas inside it.
 * Scroll position maps to a frame index (1..FRAME_COUNT); that frame is
 * drawn to the canvas with cover-fit sizing. Four text overlays fade in
 * and out at roughly 5% / 30% / 60% / 90% of the section's scroll range.
 *
 * FALLBACK: If no image frames are available, renders a cinematic
 * animated gradient with floating particles that responds to scroll.
 */
const FRAME_COUNT = 192;
const getFrameSrc = (index) => `/profil/sequence/${String(index).padStart(4, "0")}.webp`;

const images = new Array(FRAME_COUNT);
let loadedCount = 0;
let successCount = 0;
let useFallback = false;

/** Preloads every frame. Resolves once all have settled. */
export function preloadFrames(onProgress) {
  return new Promise((resolve) => {
    for (let i = 1; i <= FRAME_COUNT; i += 1) {
      const img = new Image();
      img.src = getFrameSrc(i);
      const settle = (ok) => {
        loadedCount += 1;
        if (ok) successCount += 1;
        onProgress?.(loadedCount / FRAME_COUNT);
        if (loadedCount === FRAME_COUNT) {
          // If less than 10% of frames loaded, switch to fallback
          useFallback = successCount < FRAME_COUNT * 0.1;
          resolve(images);
        }
      };
      img.onload = () => settle(true);
      img.onerror = () => settle(false);
      images[i - 1] = img;
    }
  });
}

/** Draws `img` into the canvas covering width x height (object-fit: cover). */
function drawCover(ctx, img, width, height) {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = width / height;
  let rw, rh;
  if (imgRatio > boxRatio) {
    rh = height; rw = img.naturalWidth * (height / img.naturalHeight);
  } else {
    rw = width; rh = img.naturalHeight * (width / img.naturalWidth);
  }
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, (width - rw) / 2, (height - rh) / 2, rw, rh);
}

/* ===== Fallback: Cinematic gradient + particles ===== */
const particles = [];
function initParticles(width, height) {
  particles.length = 0;
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    });
  }
}

function drawFallback(ctx, width, height, progress) {
  // Cinematic gradient that shifts with scroll
  const hue1 = 220 + progress * 60;   // deep blue → purple
  const hue2 = 280 + progress * 40;   // purple → magenta
  const lightness = 4 + progress * 6;

  const grad = ctx.createRadialGradient(
    width * (0.3 + progress * 0.4), height * (0.4 + progress * 0.2),
    0,
    width * 0.5, height * 0.5,
    Math.max(width, height) * 0.8
  );
  grad.addColorStop(0, `hsl(${hue1}, 60%, ${lightness + 8}%)`);
  grad.addColorStop(0.5, `hsl(${hue2}, 40%, ${lightness + 3}%)`);
  grad.addColorStop(1, `hsl(0, 0%, ${lightness}%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid lines
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + progress * 0.02})`;
  ctx.lineWidth = 0.5;
  const gridSize = 80;
  const offsetY = (progress * 200) % gridSize;
  for (let y = -gridSize + offsetY; y < height + gridSize; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  const offsetX = (progress * 100) % gridSize;
  for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }

  // Floating particles
  if (particles.length === 0) initParticles(width, height);
  for (const p of particles) {
    p.x += p.vx + progress * 0.5;
    p.y += p.vy - progress * 0.3;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.3 + progress * 0.7)})`;
    ctx.fill();
  }

  // Central glow orb
  const orbX = width * (0.5 + Math.sin(progress * Math.PI * 2) * 0.1);
  const orbY = height * (0.5 + Math.cos(progress * Math.PI) * 0.15);
  const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 200 + progress * 100);
  orbGrad.addColorStop(0, `rgba(120, 140, 255, ${0.15 + progress * 0.1})`);
  orbGrad.addColorStop(1, "rgba(120, 140, 255, 0)");
  ctx.fillStyle = orbGrad;
  ctx.fillRect(0, 0, width, height);
}

/** 4-point keyframe opacity. */
function fadeOpacity(progress, [inStart, inEnd, outStart, outEnd]) {
  if (progress <= inStart || progress >= outEnd) return 0;
  if (progress < inEnd) return (progress - inStart) / (inEnd - inStart);
  if (progress > outStart) return 1 - (progress - outStart) / (outEnd - outStart);
  return 1;
}

export function initSequenceScroll() {
  const section = document.getElementById("sequence");
  const canvas = document.getElementById("sequenceCanvas");
  const ctx = canvas.getContext("2d");

  const texts = [
    { el: document.getElementById("seqText1"), range: [0, 0.05, 0.28, 0.33] },
    { el: document.getElementById("seqText2"), range: [0.33, 0.38, 0.61, 0.66] },
    { el: document.getElementById("seqText3"), range: [0.66, 0.71, 0.95, 1] },
  ];

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (useFallback) initParticles(width, height);
    render(getProgress());
  }

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const scrollableHeight = rect.height - window.innerHeight;
    if (scrollableHeight <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollableHeight));
  }

  function render(progress) {
    if (useFallback) {
      drawFallback(ctx, width, height, progress);
    } else {
      const frame = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(progress * (FRAME_COUNT - 1)) + 1)
      );
      const img = images[frame - 1];
      if (img && img.complete && img.naturalWidth) {
        drawCover(ctx, img, width, height);
      }
    }
    texts.forEach(({ el, range }) => {
      if (el) el.style.opacity = String(fadeOpacity(progress, range));
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render(getProgress());
      ticking = false;
    });
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  resize();

  return { render, getProgress };
}
