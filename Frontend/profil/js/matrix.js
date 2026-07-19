/**
 * matrix.js — Matrix/Cyber Mode Toggle
 * Adds a falling binary rain effect + green neon color scheme
 */

let matrixActive = false;
let matrixCanvas = null;
let matrixCtx = null;
let matrixAnimId = null;

export function initMatrixMode() {
  const toggle = document.getElementById('matrixToggle');
  if (!toggle) return;

  // Create canvas for matrix rain
  createMatrixCanvas();

  toggle.addEventListener('click', () => {
    try {
      matrixActive = !matrixActive;
      toggle.classList.toggle('active', matrixActive);
      document.body.classList.toggle('cyber-mode', matrixActive);

      if (matrixActive) {
        startMatrixRain();
      } else {
        stopMatrixRain();
      }
    } catch (e) {
      console.warn('[Matrix] Toggle error:', e);
    }
  });
}

function createMatrixCanvas() {
  if (document.getElementById('matrixCanvas')) return;

  matrixCanvas = document.createElement('canvas');
  matrixCanvas.id = 'matrixCanvas';
  matrixCanvas.className = 'matrix-canvas';
  document.body.appendChild(matrixCanvas);

  matrixCtx = matrixCanvas.getContext('2d');
  resizeMatrixCanvas();
  window.addEventListener('resize', resizeMatrixCanvas);
}

function resizeMatrixCanvas() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
}

function startMatrixRain() {
  if (!matrixCanvas || !matrixCtx) return;

  matrixCanvas.classList.add('visible');

  const fontSize = 14;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops = new Array(columns).fill(1);
  const chars = '01アイウエオカキクケコ⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉';

  function draw() {
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    matrixCtx.fillStyle = '#0f0';
    matrixCtx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Random brightness
      const brightness = Math.random();
      if (brightness > 0.95) {
        matrixCtx.fillStyle = '#fff';
      } else if (brightness > 0.8) {
        matrixCtx.fillStyle = '#0f0';
      } else {
        matrixCtx.fillStyle = `rgba(0, 255, 0, ${0.3 + brightness * 0.4})`;
      }

      matrixCtx.fillText(char, x, y);

      if (y > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    matrixAnimId = requestAnimationFrame(draw);
  }

  draw();
}

function stopMatrixRain() {
  if (matrixAnimId) {
    cancelAnimationFrame(matrixAnimId);
    matrixAnimId = null;
  }
  if (matrixCanvas) {
    matrixCanvas.classList.remove('visible');
  }
}
