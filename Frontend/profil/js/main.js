import { getProfil, getExperiences, getProjects, getSkills, getCaseStudies, pick } from "./api.js";
import { initCursor } from "./cursor.js";
import { initNavbar, setNavIdentity } from "./navbar.js";
import { setProgress, setIdentity, reveal } from "./preloader.js";
import { preloadFrames, initSequenceScroll } from "./sequence-scroll.js";
import { initAllSections } from "./sections.js";

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

  const framesPromise = preloadFrames((fraction) => {
    framesProgress = fraction;
    updateOverall();
  });

  // Fetch all data
  const [profil, experiences, projects, skills, caseStudies] = await Promise.all([
    getProfil().catch(() => null),
    getExperiences().catch(() => []),
    getProjects().catch(() => []),
    getSkills().catch(() => []),
    getCaseStudies().catch(() => []),
    framesPromise
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

  renderDynamicContent(experiences, projects, skills, caseStudies);

  if (loadingEl) loadingEl.hidden = true;

  await reveal();

  const sequence = initSequenceScroll();
  sequence.render(sequence.getProgress());

  // Initialize all content section animations AFTER DOM is injected
  initAllSections();
}

function renderDynamicContent(experiences, projects, skills, caseStudies) {
  // 0. Render Case Studies
  const caseStudiesContainer = document.getElementById("dynamicCaseStudies");
  if (caseStudiesContainer && caseStudies && caseStudies.length > 0) {
    caseStudiesContainer.innerHTML = "";
    caseStudies.forEach((cs, i) => {
      // Split tech stack by comma or pipe
      const techs = (cs.tech_stack || "").split(/[,|]/).map(t => t.trim()).filter(Boolean);
      const techHtml = techs.map(t => {
        const parts = t.split(':');
        if (parts.length > 1) {
          return `<li><strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}</li>`;
        }
        return `<li>${t}</li>`;
      }).join('');

      // Parse multiple images
      const images = (cs.gambar_urls || "").split(',').map(img => img.trim()).filter(Boolean);
      let sliderHtml = "";
      
      const getImgSrc = (img) => img.startsWith('http') ? img : `/profil/img/${img}`;

      if (images.length === 0) {
         sliderHtml = `<img src="https://via.placeholder.com/800x600/12121a/e8e8ed?text=No+Image" alt="${cs.judul}" />`;
      } else if (images.length === 1) {
         sliderHtml = `<img src="${getImgSrc(images[0])}" alt="${cs.judul}" onerror="this.src='https://via.placeholder.com/800x600/12121a/e8e8ed?text=Error'" />`;
      } else {
         // Create mini slider HTML
         let slides = images.map((img, idx) => `
           <div class="cs-slide ${idx === 0 ? 'active' : ''}">
             <img src="${getImgSrc(img)}" alt="${cs.judul} - ${idx+1}" onerror="this.src='https://via.placeholder.com/800x600/12121a/e8e8ed?text=Error'" />
           </div>
         `).join('');
         
         let dots = images.map((_, idx) => `
           <button class="cs-dot ${idx === 0 ? 'active' : ''}" onclick="window.changeCsSlide(this, ${idx})"></button>
         `).join('');

         sliderHtml = `
           <div class="cs-slider">
             <div class="cs-slides-container">${slides}</div>
             <div class="cs-slider-nav">
               <button class="cs-nav-btn prev" onclick="window.prevCsSlide(this)"><i class="ph ph-caret-left"></i></button>
               <div class="cs-dots">${dots}</div>
               <button class="cs-nav-btn next" onclick="window.nextCsSlide(this)"><i class="ph ph-caret-right"></i></button>
             </div>
           </div>
         `;
      }

      caseStudiesContainer.innerHTML += `
        <section class="case-study" id="case-study-${cs.id}">
          <div class="case-study__header" data-reveal>
            <p class="section-label">${i === 0 ? 'Featured Project' : 'Case Study'}</p>
            <h2 class="section-title">${cs.judul}</h2>
          </div>

          <div class="case-study__content" data-reveal>
            <div class="case-study__visual" data-cursor-hover>
              ${sliderHtml}
            </div>
            <div class="case-study__info">
              <h3>${cs.judul}</h3>
              <p class="case-study__desc">${cs.deskripsi_singkat || ''}</p>
              <ul class="case-study__tech">
                ${techHtml}
              </ul>
              <p class="case-study__desc">${cs.penjelasan_detail || ''}</p>
              ${cs.link_project ? `
              <a href="${cs.link_project}" target="_blank" rel="noopener noreferrer" class="btn-primary" data-cursor-hover>
                Kunjungi Website <i class="ph ph-arrow-up-right"></i>
              </a>` : ''}
            </div>
          </div>
        </section>
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
    skills.forEach((skill, i) => {
      const numStr = (i + 1).toString().padStart(2, "0");
      skillsGrid.innerHTML += `
        <div class="services__card" data-stagger-child>
          <div class="services__card-num">${numStr}</div>
          <h3>${skill.nama_skill}</h3>
          <p>Expertise in ${skill.nama_skill} with a proven track record.</p>
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
