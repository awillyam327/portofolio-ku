/**
 * radar-chart.js — Animated Spider/Radar Chart for Skills
 * Pure canvas, no external libraries.
 */

export function initRadarChart(skills) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas || !skills || skills.length < 3) return;

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const container = canvas.parentElement;
    let size = container.offsetWidth;
    // Fallback if rendered while inside a hidden tab
    if (size === 0) {
      size = Math.min(window.innerWidth - 40, 400);
    } else {
      size = Math.min(size, 400);
    }
    canvas.width = size * 2;  // HiDPI
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const levels = 5;
    const labels = skills.map(s => s.nama_skill || 'Skill');
    const values = skills.map(() => 0.7 + Math.random() * 0.3); // 70-100%
    const numPoints = labels.length;

    // Animation
    let progress = 0;
    const duration = 1500;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function drawFrame(timestamp) {
      const elapsed = timestamp - startTime;
      progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      ctx.clearRect(0, 0, size, size);

      // Draw grid levels
      for (let level = 1; level <= levels; level++) {
        const r = (radius / levels) * level;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(242, 243, 245, ${level === levels ? 0.15 : 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw axes
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        ctx.strokeStyle = 'rgba(242, 243, 245, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw data polygon (animated)
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const idx = i % numPoints;
        const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
        const r = radius * values[idx] * easedProgress;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Gradient fill
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw data points
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const r = radius * values[i] * easedProgress;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        // Glow effect
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fill();

        // Point
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }

      // Draw labels
      ctx.font = '11px Manrope, sans-serif';
      ctx.fillStyle = 'rgba(242, 243, 245, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const labelRadius = radius + 24;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        ctx.fillText(labels[i], x, y);
      }

      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      }
    }

    // Use IntersectionObserver so animation triggers when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(drawFrame);
          observer.unobserve(canvas);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(canvas);

  } catch (e) {
    console.warn('[RadarChart] Failed to render:', e);
  }
}
