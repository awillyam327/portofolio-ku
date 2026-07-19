import { getProfil, getExperiences, getProjects, getSkills, getCaseStudies, getBlogs, getCertificates, pick } from "./api.js";
import { initCursor } from "./cursor.js";
import { initNavbar, setNavIdentity } from "./navbar.js";
import { setProgress, setIdentity, reveal } from "./preloader.js";
import { preloadFrames, initSequenceScroll } from "./sequence-scroll.js";
import { initAllSections, initShowcaseTabs } from "./sections.js";
import { initTerminal } from "./terminal.js";
import { initRadarChart } from "./radar-chart.js";
import { initCVGenerator } from "./cv-generator.js";
import { initMatrixMode } from "./matrix.js";

const FALLBACK_IDENTITY = { name: "Arthur Willyam Liang", role: "Portofolio" };
const loadingPercentEl = document.getElementById("sequenceLoadingPercent");
const loadingEl = document.getElementById("sequenceLoading");

function resolveIdentity(profil) {
  if (!profil) return FALLBACK_IDENTITY;
  return {
    name: pick(profil, ["nama", "name", "full_name", "nama_lengkap"], FALLBACK_IDENTITY.name),
    role: pick(profil, ["role", "jabatan", "title", "profesi"], FALLBACK_IDENTITY.role),
  };
}

async function bootstrap() {
  initCursor();
  initNavbar();

  // Initialize Lenis Smooth Scrolling
  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  let framesProgress = 0;
  let dataProgress = 0;

  function updateOverall() {
    const overall = framesProgress * 0.9 + dataProgress * 0.1;
    const percent = Math.round(overall * 100);
    setProgress(percent);
    if (loadingPercentEl) loadingPercentEl.textContent = `${percent}%`;
  }



  // Fetch all data
  const [profil, experiences, projects, skills, caseStudies, blogs, certificates, framesPromise] = await Promise.all([
    getProfil().catch(() => null),
    getExperiences().catch(() => []),
    getProjects().catch(() => []),
    getSkills().catch(() => []),
    getCaseStudies().catch(() => []),
    getBlogs().catch(() => []),
    getCertificates().catch(() => []),
    preloadFrames((fraction) => {
      framesProgress = fraction;
      updateOverall();
    })
  ]);

  dataProgress = 1;
  updateOverall();

  const identity = resolveIdentity(profil);

  setIdentity(identity);
  setNavIdentity(identity);

  const heroName = document.querySelector("[data-hero-name]");
  const heroRole = document.querySelector("[data-hero-role]");
  if (heroName) heroName.textContent = identity.name;
  if (heroRole) heroRole.textContent = identity.role;

  // Render About Me description based on actual database fields
  const dynamicAbout = document.getElementById("dynamicAbout");
  if (dynamicAbout && profil) {
    dynamicAbout.innerHTML = `
      <p class="about__line">Hello, I'm ${profil.nama_lengkap || 'Arthur Willyam Liang'}.</p>
      <p class="about__line">A Semester ${profil.semester || 6} student at</p>
      <p class="about__line">${profil.universitas || 'Universitas Kristen Satya Wacana'},</p>
      <p class="about__line">studying in ${profil.prodi || 'Information Systems'} (${profil.fakultas || 'FTI'}).</p>
      <p class="about__line">&nbsp;</p>
      <p class="about__line">Born in ${profil.tempat_lahir || 'Salatiga'} on ${profil.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID') : '01/01/2003'}.</p>
      <p class="about__line">Currently based in: ${profil.alamat || 'Salatiga'}.</p>
      <p class="about__line">&nbsp;</p>
      <p class="about__line">I am deeply passionate about bridging technical expertise</p>
      <p class="about__line">with strong leadership to build impactful digital solutions.</p>
      <p class="about__line">I always strive for absolute excellence.</p>
    `;
  }

  // Render Contact Links
  const contactWA = document.getElementById("contactWA");
  const navContactWA = document.getElementById("navContactWA");
  if (profil?.telepon) {
    let phoneStr = profil.telepon.replace(/\D/g, '');
    if (phoneStr.startsWith('0')) phoneStr = '62' + phoneStr.substring(1);
    const waLink = `https://wa.me/${phoneStr}`;
    
    if (contactWA) contactWA.href = waLink;
    if (navContactWA) {
      navContactWA.href = waLink;
      navContactWA.innerHTML = `WhatsApp: +${phoneStr}`;
    }
  }

  const contactEmail = document.getElementById("contactEmail");
  if (contactEmail && profil?.email) {
    contactEmail.href = `mailto:${profil.email}`;
  }

  renderDynamicContent(experiences, projects, skills, caseStudies, blogs, certificates);

  if (loadingEl) loadingEl.hidden = true;

  await reveal();

  const sequence = initSequenceScroll();
  sequence.render(sequence.getProgress());

  // Initialize all content section animations AFTER DOM is injected
  initAllSections();

  // ---- Premium Features ----
  const allData = { profil, skills, experiences, projects, blogs };

  // Terminal Easter Egg (Ctrl + `)
  try { initTerminal(allData); } catch (e) { console.warn('[Terminal] Init failed:', e); }

  // Radar Chart for Skills
  try { initRadarChart(skills); } catch (e) { console.warn('[RadarChart] Init failed:', e); }

  // Auto CV Generator
  try { initCVGenerator(allData); } catch (e) { console.warn('[CV] Init failed:', e); }

  // Matrix/Cyber Mode
  try { initMatrixMode(); } catch (e) { console.warn('[Matrix] Init failed:', e); }

  // Showcase Tabs
  try { initShowcaseTabs(); } catch (e) { console.warn('[Tabs] Init failed:', e); }
}

function renderDynamicContent(experiences, projects, skills, caseStudies, blogs, certificates) {
  // 0. Render Projects (Showcase Tab 1)
  const caseStudiesContainer = document.getElementById("dynamicCaseStudies");
  if (caseStudiesContainer && projects && projects.length > 0) {
    caseStudiesContainer.className = "showcase-grid";
    caseStudiesContainer.innerHTML = "";
    projects.forEach(p => {
      const img = p.gambar_url ? (p.gambar_url.startsWith('http') ? p.gambar_url : `/profil/img/${p.gambar_url}`) : 'https://via.placeholder.com/800x600/12121a/e8e8ed?text=No+Image';
      const linkHtml = p.link_project ? `<a href="${p.link_project}" target="_blank" class="showcase-card__link">Live Demo / Details</a>` : '';
      
      caseStudiesContainer.innerHTML += `
        <div class="showcase-card">
          <img src="${img}" alt="${p.judul}" class="showcase-card__img" />
          <div class="showcase-card__content">
            <h3 class="showcase-card__title">${p.judul}</h3>
            <p class="showcase-card__desc">${p.deskripsi || ''}</p>
            ${linkHtml}
          </div>
        </div>
      `;
    });
  }

  // Render Certificates (Showcase Tab 2)
  const certContainer = document.getElementById("dynamicCertificates");
  if (certContainer && certificates && certificates.length > 0) {
    certContainer.innerHTML = "";
    certificates.forEach(c => {
      const img = c.gambar_url ? (c.gambar_url.startsWith('http') ? c.gambar_url : `/profil/img/${c.gambar_url}`) : 'https://via.placeholder.com/800x600/12121a/e8e8ed?text=No+Image';
      certContainer.innerHTML += `
        <div class="cert-card">
          <img src="${img}" alt="${c.judul}" />
          <h3>${c.judul}</h3>
        </div>
      `;
    });
  }

  // 1. Render Gallery (Projects)
  const gallery = document.getElementById("dynamicGallery");
  if (gallery && projects.length > 0) {
    gallery.innerHTML = "";
    projects.forEach(p => {
      const img = p.gambar_url ? `/profil/img/${p.gambar_url}` : '/profil/img/others2.png';
      gallery.innerHTML += `<div class="works__gallery-slide" style="background-image: url('${img}?v=2');"></div>`;
    });
  }

  // 2. Render Timeline (Experiences)
  const timeline = document.getElementById("worksTimeline");
  if (timeline && experiences.length > 0) {
    // Keep the SVG element which is the first child
    const svgEl = timeline.querySelector('.timeline__svg');
    timeline.innerHTML = "";
    if (svgEl) timeline.appendChild(svgEl);

    const hues = [220, 280, 160, 30, 320, 100];
    experiences.forEach((exp, i) => {
      const alignClass = i % 2 === 0 ? "timeline__item--left" : "timeline__item--right";
      const hue = hues[i % hues.length];
      
      timeline.innerHTML += `
        <div class="timeline__item ${alignClass}" data-reveal>
          <div class="timeline__node"></div>
          <a href="javascript:void(0)" class="works__card" data-cursor-hover>
            <div class="works__card-visual">
              <div class="works__card-gradient" style="--glow-hue: ${hue}"></div>
              <div class="works__card-icon"><i class="ph ph-briefcase"></i></div>
            </div>
            <div class="works__card-info">
              <h3>${exp.posisi}</h3>
              <p>${exp.deskripsi} (${exp.durasi}).</p>
              <span class="works__card-tag">${exp.perusahaan}</span>
            </div>
          </a>
        </div>
      `;
    });
  }

  // 3. Render Skills Grid
  const skillsGrid = document.getElementById("dynamicSkills");
  if (skillsGrid && skills.length > 0) {
    skillsGrid.innerHTML = "";
    skills.forEach((skill) => {
      const iconOrLogo = skill.logo_url 
        ? `<img src="${skill.logo_url}" alt="${skill.nama_skill}" />`
        : `<i class="${skill.icon_class || 'ph ph-code'}"></i>`;
      
      skillsGrid.innerHTML += `
        <div class="tech-card">
          ${iconOrLogo}
          <span>${skill.nama_skill}</span>
        </div>
      `;
    });
  }

  // 4. Render Marquee
  const marquee = document.getElementById("dynamicMarquee");
  if (marquee && skills.length > 0) {
    marquee.innerHTML = "";
    skills.forEach(skill => {
      marquee.innerHTML += `<span class="marquee__item">${skill.nama_skill}</span>`;
    });
    // Duplicate for infinite scrolling effect
    marquee.innerHTML += marquee.innerHTML;
  }

  // 5. Render Blogs
  const blogsGrid = document.getElementById("dynamicBlogs");
  if (blogsGrid && typeof blogs !== 'undefined' && blogs.length > 0) {
    blogsGrid.innerHTML = "";
    blogs.forEach(b => {
      const date = new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const img = b.gambar_url ? `<div class="blog__image" style="background-image: url('${b.gambar_url}')"></div>` : '';
      blogsGrid.innerHTML += `
        <article class="blog__card" data-stagger-child>
          ${img}
          <div class="blog__content">
            <div class="blog__meta">
              <span class="blog__category">${b.kategori || 'General'}</span>
              <span class="blog__date">${date}</span>
            </div>
            <h3 class="blog__title">${b.judul}</h3>
            <p class="blog__excerpt">${b.konten.substring(0, 120)}...</p>
            <a href="#" class="blog__readmore" onclick="alert('Full blog view coming soon!')">Read More <i class="ph ph-arrow-right"></i></a>
          </div>
        </article>
      `;
    });
  }
}

// Global functions for Case Study mini slider
window.changeCsSlide = (btn, idx) => {
  const slider = btn.closest('.cs-slider');
  const slides = slider.querySelectorAll('.cs-slide');
  const dots = slider.querySelectorAll('.cs-dot');
  
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  
  slides[idx].classList.add('active');
  dots[idx].classList.add('active');
};

window.nextCsSlide = (btn) => {
  const slider = btn.closest('.cs-slider');
  const slides = Array.from(slider.querySelectorAll('.cs-slide'));
  const activeIdx = slides.findIndex(s => s.classList.contains('active'));
  const nextIdx = (activeIdx + 1) % slides.length;
  window.changeCsSlide(slider.querySelectorAll('.cs-dot')[nextIdx], nextIdx);
};

window.prevCsSlide = (btn) => {
  const slider = btn.closest('.cs-slider');
  const slides = Array.from(slider.querySelectorAll('.cs-slide'));
  const activeIdx = slides.findIndex(s => s.classList.contains('active'));
  const prevIdx = (activeIdx - 1 + slides.length) % slides.length;
  window.changeCsSlide(slider.querySelectorAll('.cs-dot')[prevIdx], prevIdx);
};

bootstrap();

// Contact form handler (runs independently of bootstrap)
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("contactSubmit");
    const status = document.getElementById("contactStatus");
    const nama = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const pesan = document.getElementById("contactMessage").value.trim();

    if (!nama || !email || !pesan) return;

    btn.disabled = true;
    btn.querySelector("span").textContent = "Mengirim...";
    status.textContent = "";
    status.className = "contact__status";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, pesan }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        status.textContent = "✅ " + data.message;
        status.className = "contact__status success";
        form.reset();
      } else {
        status.textContent = "❌ " + (data.error || "Gagal mengirim pesan.");
        status.className = "contact__status error";
      }
    } catch (err) {
      status.textContent = "❌ Koneksi gagal. Coba lagi nanti.";
      status.className = "contact__status error";
    } finally {
      btn.disabled = false;
      btn.querySelector("span").textContent = "Kirim Pesan";
    }
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);
