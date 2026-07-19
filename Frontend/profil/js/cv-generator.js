/**
 * cv-generator.js — Auto-generate and download a PDF CV from API data
 * Uses jsPDF library (loaded via CDN in index.html)
 */

export function initCVGenerator(data) {
  const btn = document.getElementById('downloadCvBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    try {
      generateCV(data);
    } catch (e) {
      console.error('[CV Generator] Error:', e);
      alert('Gagal membuat CV. Silakan coba lagi.');
    }
  });
}

function generateCV(data) {
  const { jspdf } = window.jspdf;
  if (!jspdf) {
    alert('PDF library belum dimuat. Tunggu sebentar dan coba lagi.');
    return;
  }
  const doc = new jspdf({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const profil = data.profil || {};
  const skills = data.skills || [];
  const experiences = data.experiences || [];
  const projects = data.projects || [];

  // ---- Header ----
  doc.setFillColor(15, 23, 42); // Dark navy
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(profil.nama_lengkap || 'Arthur Willyam Liang', margin, y + 10);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profil.prodi || 'Information Systems'} — ${profil.universitas || 'UKSW'}`, margin, y + 20);

  doc.setFontSize(9);
  const contacts = [
    profil.email || 'awillyam327@gmail.com',
    profil.telepon || '082230429592',
    profil.alamat || 'Salatiga'
  ].filter(Boolean).join('  |  ');
  doc.text(contacts, margin, y + 28);

  y = 65;

  // ---- Separator ----
  function drawSection(title) {
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  // Auto page break
  function checkPage(needed = 15) {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  }

  // ---- About ----
  drawSection('About');
  const aboutText = `${profil.nama_lengkap || 'Arthur Willyam Liang'}, a Semester ${profil.semester || 6} student at ${profil.universitas || 'UKSW'}, studying ${profil.prodi || 'Information Systems'} (${profil.fakultas || 'FTI'}). Born in ${profil.tempat_lahir || 'Sragen'}.`;
  const aboutLines = doc.splitTextToSize(aboutText, contentWidth);
  doc.text(aboutLines, margin, y);
  y += aboutLines.length * 5 + 8;

  // ---- Skills ----
  checkPage(20);
  drawSection('Skills & Competencies');
  if (skills.length > 0) {
    const skillNames = skills.map(s => s.nama_skill).join('  •  ');
    const skillLines = doc.splitTextToSize(skillNames, contentWidth);
    doc.text(skillLines, margin, y);
    y += skillLines.length * 5 + 8;
  }

  // ---- Experience ----
  checkPage(20);
  drawSection('Experience & Leadership');
  experiences.forEach(exp => {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(exp.posisi || '', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${exp.perusahaan || ''} | ${exp.durasi || ''}`, margin, y + 5);
    doc.setTextColor(30, 30, 30);
    if (exp.deskripsi) {
      const descLines = doc.splitTextToSize(exp.deskripsi, contentWidth - 5);
      doc.text(descLines, margin + 2, y + 10);
      y += 10 + descLines.length * 4 + 6;
    } else {
      y += 14;
    }
  });

  // ---- Projects ----
  checkPage(20);
  drawSection('Projects');
  projects.forEach(p => {
    checkPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(p.judul || '', margin, y);
    doc.setFont('helvetica', 'normal');
    if (p.deskripsi) {
      const projLines = doc.splitTextToSize(p.deskripsi, contentWidth - 5);
      doc.text(projLines, margin + 2, y + 5);
      y += projLines.length * 4 + 10;
    } else {
      y += 10;
    }
  });

  // ---- Footer ----
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated automatically from portofolio-ku.vercel.app', margin, 290);

  // Save
  const filename = `CV_${(profil.nama_lengkap || 'Arthur_Willyam_Liang').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
