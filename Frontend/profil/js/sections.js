/**
 * sections.js
 * Scroll-driven animations for all content sections below the sequence hero.
 * Uses IntersectionObserver for reveal-on-scroll, and a manual RAF loop
 * for the infinite marquee.
 */

/* ===== Scroll Reveal (IntersectionObserver) ===== */
export function initScrollReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ===== Staggered Children Reveal ===== */
export function initStaggerReveal() {
  const groups = document.querySelectorAll("[data-stagger]");
  if (!groups.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll("[data-stagger-child]");
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.1}s`;
            child.classList.add("revealed");
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  groups.forEach((el) => observer.observe(el));
}

/* ===== Infinite Marquee ===== */
export function initMarquee() {
  const track = document.querySelector(".marquee__track");
  if (!track) return;

  // Duplicate children for seamless loop
  const children = [...track.children];
  children.forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  let offset = 0;
  const speed = 0.5; // px per frame

  function loop() {
    offset -= speed;
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(offset) >= halfWidth) offset = 0;
    track.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ===== About: Typewriter Reveal ===== */
export function initAboutReveal() {
  const lines = document.querySelectorAll(".about__line");
  if (!lines.length) return;

  // Persiapkan elemen: simpan teks asli, lalu kosongkan dengan spasi agar layout tidak rusak
  lines.forEach(line => {
    if (line.innerHTML === "&nbsp;") return;
    line.dataset.text = line.textContent;
    line.textContent = "\u00A0"; 
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          observer.unobserve(target); // Hanya animasi sekali
          
          if (!target.dataset.text) return;
          
          const text = target.dataset.text;
          const index = parseInt(target.dataset.index);
          
          // Penundaan berjenjang agar mengetik baris demi baris (overlapping sedikit)
          const delay = index * 400; 
          
          setTimeout(() => {
            target.textContent = ""; 
            target.classList.add("typing"); // Munculkan kursor
            let i = 0;
            const typing = setInterval(() => {
              target.textContent += text.charAt(i);
              i++;
              if (i >= text.length) {
                clearInterval(typing);
                target.classList.remove("typing"); // Sembunyikan kursor
              }
            }, 30); // Kecepatan ketik: 30ms per huruf
          }, delay);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
  );

  let textLineIndex = 0;
  lines.forEach((el) => {
    if (el.innerHTML !== "&nbsp;") {
      el.dataset.index = textLineIndex;
      textLineIndex++;
    }
    observer.observe(el);
  });
}

/* ===== Testimonials Auto-Slide ===== */
export function initTestimonials() {
  const track = document.querySelector(".testimonials__track");
  const dots = document.querySelectorAll(".testimonials__dot");
  if (!track || !dots.length) return;

  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  // Auto-advance every 5 seconds
  setInterval(() => {
    goTo((current + 1) % total);
  }, 5000);
}

/* ===== Contact: Parallax Tilt on Hover ===== */
export function initContactParallax() {
  const cards = document.querySelectorAll(".contact__link");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ===== Works Gallery Continuous Marquee ===== */
export function initGalleryMarquee() {
  const track = document.querySelector(".works__gallery-track");
  if (!track) return;

  // Duplicate slides for seamless loop
  const children = [...track.children];
  children.forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  let offset = 0;
  const speed = 0.5; // pixel per frame
  let isHovered = false;

  function loop() {
    if (!isHovered) {
      offset -= speed;
      // Because we duplicated the exact children, the seamless reset point
      // is exactly half of the new scrollWidth
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(offset) >= halfWidth) offset = 0;
      track.style.transform = `translateX(${offset}px)`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  track.addEventListener("mouseenter", () => isHovered = true);
  track.addEventListener("mouseleave", () => isHovered = false);
}

/* ===== Master Init ===== */
export function initAllSections() {
  initScrollReveal();
  initStaggerReveal();
  initMarquee();
  initAboutReveal();
  initTestimonials();
  initContactParallax();
  initGalleryMarquee();
  initTimelineThread();
}

/* ===== Timeline Thread Animation ===== */
export function initTimelineThread() {
  const timeline = document.querySelector(".works__timeline");
  const svg = document.querySelector(".timeline__svg");
  const path = document.querySelector(".timeline__path");
  const pathGlow = document.querySelector(".timeline__path-glow");
  const nodes = document.querySelectorAll(".timeline__node");
  
  if (!timeline || !svg || !path) return;

  let pathLength = 0;

  function drawLine() {
    const timelineRect = timeline.getBoundingClientRect();
    
    let d = "";
    // On mobile, the line is on the left (5%). On desktop, it's centered (50%).
    let startX = window.innerWidth <= 768 ? timelineRect.width * 0.05 : timelineRect.width / 2;
    
    d += `M ${startX} 0 `;

    nodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const x = rect.left - timelineRect.left + rect.width / 2;
      const y = rect.top - timelineRect.top + rect.height / 2;
      
      if (index === 0) {
        // Curve from start to first node
        d += `C ${startX} ${y / 2}, ${x} ${y / 2}, ${x} ${y} `;
      } else {
        // Curve between nodes (S-curve)
        const prevRect = nodes[index - 1].getBoundingClientRect();
        const prevX = prevRect.left - timelineRect.left + prevRect.width / 2;
        const prevY = prevRect.top - timelineRect.top + prevRect.height / 2;
        d += `C ${prevX} ${(prevY + y) / 2}, ${x} ${(prevY + y) / 2}, ${x} ${y} `;
      }
    });

    // Draw straight line to the bottom
    const lastNode = nodes[nodes.length - 1];
    const lastRect = lastNode.getBoundingClientRect();
    const lastX = lastRect.left - timelineRect.left + lastRect.width / 2;
    d += `L ${lastX} ${timelineRect.height}`;

    path.setAttribute("d", d);
    pathGlow.setAttribute("d", d);

    // Calculate length for dash array animation
    pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = 0; 
    
    pathGlow.style.strokeDasharray = pathLength;
    pathGlow.style.strokeDashoffset = pathLength; 
  }

  // Initialize and handle resize
  drawLine();
  window.addEventListener("resize", () => {
    // Debounce slightly or just call
    drawLine();
  });

  // Scroll loop to animate the glowing thread
  function updateScroll() {
    if (pathLength === 0) return requestAnimationFrame(updateScroll);

    const timelineRect = timeline.getBoundingClientRect();
    // The "draw head" is fixed at the vertical center of the screen
    const startOffset = window.innerHeight / 2;
    const scrollPos = startOffset - timelineRect.top;
    
    let progress = scrollPos / timelineRect.height;
    progress = Math.max(0, Math.min(1, progress));
    
    pathGlow.style.strokeDashoffset = pathLength - (pathLength * progress);
    
    // Activate node dots when the thread passes them
    nodes.forEach((node) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;
      if (nodeCenterY < startOffset) {
        node.parentElement.classList.add("active");
      } else {
        node.parentElement.classList.remove("active");
      }
    });
    
    requestAnimationFrame(updateScroll);
  }
  
  updateScroll();
}

/* ===== Portfolio Showcase Tabs ===== */
export function initShowcaseTabs() {
  const tabs = document.querySelectorAll(".showcase__tab");
  const panels = document.querySelectorAll(".showcase__panel");

  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active from all
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      // Add active to clicked
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}
