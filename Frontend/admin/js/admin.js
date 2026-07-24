/* ============================================
   ADMIN PANEL — JavaScript
   Full CRUD for Profil, Experiences, Projects, Skills, Contacts
   ============================================ */

const API = '/api';
const token = localStorage.getItem('token');
const adminName = localStorage.getItem('admin_name') || 'Admin';

// Auth guard
if (!token) window.location.href = '/admin/login.html';

document.getElementById('adminName').textContent = adminName;

// ---- API Helper ----
async function api(endpoint, options = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/admin/login.html';
    return;
  }
  return res.json();
}

async function apiUpload(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/upload/image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
  });
  return res.json();
}

// ---- Sidebar Navigation ----
const links = document.querySelectorAll('.sidebar__link');
const pageTitle = document.getElementById('pageTitle');
const contentArea = document.getElementById('contentArea');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const page = link.dataset.page;
    pageTitle.textContent = link.textContent.trim();
    loadPage(page);
  });
});

// ---- Logout ----
document.getElementById('btnLogout').addEventListener('click', async () => {
  try { await fetch(`${API}/logout`, { method: 'POST' }); } catch {}
  localStorage.clear();
  window.location.href = '/admin/login.html';
});

// ---- Modal ----
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalFields = document.getElementById('modalFields');
const modalForm = document.getElementById('modalForm');

function openModal(title, fields, onSubmit) {
  modalTitle.textContent = title;
  modalFields.innerHTML = fields;
  modalOverlay.classList.add('open');
  modalForm.onsubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalForm.onsubmit = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// ---- Page Loaders ----
function loadPage(page) {
  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'profil': loadProfil(); break;
    case 'experiences': loadExperiences(); break;
    case 'projects': loadProjects(); break;
    case 'case_studies': loadCaseStudies(); break;
    case 'skills': loadSkills(); break;
    case 'contacts': loadContacts(); break;
    case 'blogs': loadBlogs(); break;
    case 'certificates': loadCertificates(); break;
  }
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const data = await api('/dashboard/stats');
  const stats = data?.data || {};
  contentArea.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><h4>Experiences</h4><div class="stat-value">${stats.experiences_count || 0}</div></div>
      <div class="stat-card"><h4>Projects</h4><div class="stat-value">${stats.projects_count || 0}</div></div>
      <div class="stat-card"><h4>Tech Stack</h4><div class="stat-value">${stats.skills_count || 0}</div></div>
    </div>
    <p style="color:var(--text-muted)">Welcome to the Admin Panel, <strong>${adminName}</strong>. Use the menu on the left to manage your portfolio data.</p>
  `;
}

// ===== CASE STUDIES (FEATURED PROJECTS) =====
async function loadCaseStudies() {
  const res = await api('/case-studies');
  const items = res?.data || [];
  
  let tableHtml = `<div class="empty-state"><i class="ph ph-clipboard-text"></i><p>No data available.</p></div>`;
  
  if (items.length > 0) {
    tableHtml = `<table class="data-table">
      <thead><tr><th>Title</th><th>Tech Stack</th><th>Link</th><th>Actions</th></tr></thead>
      <tbody>
        ${items.map(p => `
          <tr>
            <td><strong>${p.judul}</strong></td>
            <td><small>${(p.tech_stack || '-').substring(0,50)}...</small></td>
            <td>${p.link_project ? `<a href="${p.link_project}" target="_blank">Link</a>` : '-'}</td>
            <td class="table-actions">
              <button class="btn btn--sm btn--secondary" onclick='editCaseStudy(${JSON.stringify(p).replace(/"/g, "&quot;").replace(/'/g, "&#39;")})'>Edit</button>
              <button class="btn btn--sm btn--danger" onclick="deleteCaseStudy(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  }

  contentArea.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
      <h2>Featured Projects (Studi Kasus)</h2>
      <button class="btn btn--primary" onclick="addCaseStudy()"><i class="ph ph-plus"></i> Add</button>
    </div>
    ${tableHtml}
  `;
}

function getCaseStudyFields(p = {}) {
  // Extract initial images for preview
  const imgs = (p.gambar_urls || '').split(',').map(u => u.trim()).filter(Boolean);
  const getImgSrc = (img) => img.startsWith('http') ? img : `/profil/img/${img}`;
  const previewHtml = imgs.map(u => `
    <div class="preview-item" data-url="${u}">
      <img src="${getImgSrc(u)}" />
      <button type="button" class="btn-remove" onclick="removeImage(this)">
        <i class="ph ph-x"></i>
      </button>
    </div>
  `).join('');

  return `
    <div class="form-group"><label>Title</label><input name="judul" value="${p.judul || ''}" required /></div>
    <div class="form-group"><label>Short Description</label><textarea name="deskripsi_singkat" rows="3" required>${p.deskripsi_singkat || ''}</textarea></div>
    <div class="form-group"><label>Tech Stack (Separate with | or ,)</label><input name="tech_stack" value="${p.tech_stack || ''}" /></div>
    <div class="form-group"><label>Detailed Explanation</label><textarea name="penjelasan_detail" rows="5">${p.penjelasan_detail || ''}</textarea></div>
    
    <div class="form-group">
      <label>Image (Drag & Drop) Cloudinary</label>
      <input type="hidden" name="gambar_urls" id="hiddenGambarUrls" value="${p.gambar_urls || ''}" />
      <div class="dropzone" id="csDropzone">
        <i class="ph ph-cloud-arrow-up" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <p>Drag & Drop website photos here or click to select files</p>
        <input type="file" id="csFileInput" multiple accept="image/*" style="display:none;" />
      </div>
      <div class="dropzone-preview" id="csDropzonePreview">${previewHtml}</div>
    </div>
    
    <div class="form-group"><label>Project Link</label><input name="link_project" value="${p.link_project || ''}" /></div>
  `;
}

window.removeImage = (btn) => {
  const item = btn.closest('.preview-item');
  const urlToRemove = item.dataset.url;
  const hiddenInput = document.getElementById('hiddenGambarUrls');
  let urls = hiddenInput.value.split(',').map(u => u.trim()).filter(Boolean);
  urls = urls.filter(u => u !== urlToRemove);
  hiddenInput.value = urls.join(',');
  item.remove();
};

function initDropzone() {
  const dropzone = document.getElementById('csDropzone');
  const fileInput = document.getElementById('csFileInput');
  const hiddenInput = document.getElementById('hiddenGambarUrls');
  const preview = document.getElementById('csDropzonePreview');
  
  if (!dropzone) return;

  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFiles(e.target.files);
  });
  
  async function handleFiles(files) {
    dropzone.innerHTML = `<p>Uploading ${files.length} photos...</p>`;
    
    let uploadedUrls = hiddenInput.value ? hiddenInput.value.split(',').filter(Boolean) : [];
    
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      
      try {
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: fd
        });
        const data = await res.json();
        
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
          preview.innerHTML += `
            <div class="preview-item" data-url="${data.url}">
              <img src="${data.url}" />
              <button type="button" class="btn-remove" onclick="removeImage(this)">
                <i class="ph ph-x"></i>
              </button>
            </div>
          `;
        } else {
          alert('Upload failed: ' + data.error);
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    hiddenInput.value = uploadedUrls.join(',');
    dropzone.innerHTML = `
      <i class="ph ph-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--primary);"></i>
      <p>Done! Drag another photo if needed.</p>
    `;
  }
}

window.addCaseStudy = () => {
  openModal('Add Case Study', getCaseStudyFields(), async () => {
    const fd = new FormData(modalForm);
    await api('/case-studies', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
    closeModal();
    loadCaseStudies();
  });
  initDropzone();
};

window.editCaseStudy = (p) => {
  openModal('Edit Case Study', getCaseStudyFields(p), async () => {
    const fd = new FormData(modalForm);
    await api(`/case-studies/${p.id}`, { method: 'PUT', body: JSON.stringify(Object.fromEntries(fd)) });
    closeModal();
    loadCaseStudies();
  });
  initDropzone();
};

window.deleteCaseStudy = async (id) => {
  if (confirm('Are you sure you want to delete this case study?')) {
    await api(`/case-studies/${id}`, { method: 'DELETE' });
    loadCaseStudies();
  }
};

// ===== PROFIL =====
async function loadProfil() {
  const data = await api('/profiles');
  const p = data?.data || {};
  contentArea.innerHTML = `
    <form class="profil-form" id="profilForm">
      <div class="form-group"><label>Full Name</label><input name="nama_lengkap" value="${p.nama_lengkap || ''}" /></div>
      <div class="form-group"><label>Nickname</label><input name="nama_panggilan" value="${p.nama_panggilan || ''}" /></div>
      <div class="form-group"><label>Email</label><input name="email" value="${p.email || ''}" /></div>
      <div class="form-group"><label>Phone</label><input name="telepon" value="${p.telepon || ''}" /></div>
      <div class="form-group"><label>University</label><input name="universitas" value="${p.universitas || ''}" /></div>
      <div class="form-group"><label>Faculty</label><input name="fakultas" value="${p.fakultas || ''}" /></div>
      <div class="form-group"><label>Major</label><input name="prodi" value="${p.prodi || ''}" /></div>
      <div class="form-group"><label>Semester</label><input name="semester" type="number" value="${p.semester || ''}" /></div>
      <div class="form-group"><label>Place of Birth</label><input name="tempat_lahir" value="${p.tempat_lahir || ''}" /></div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input name="tanggal_lahir" type="date" value="${p.tanggal_lahir ? new Date(p.tanggal_lahir).toISOString().split('T')[0] : ''}" />
      </div>
      <div class="form-group full-width"><label>Address</label><input name="alamat" value="${p.alamat || ''}" /></div>
      <button type="submit" class="btn btn--primary">Save Profile</button>
    </form>
  `;
  document.getElementById('profilForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    body.semester = parseInt(body.semester) || 0;
    await api('/profiles', { method: 'PUT', body: JSON.stringify(body) });
    alert('Profile saved successfully!');
    loadProfil();
  });
}

// ===== GENERIC TABLE RENDER =====
function renderTable(headers, rows, actions) {
  if (!rows.length) return `<div class="empty-state"><i class="ph ph-clipboard-text"></i><p>No data available.</p></div>`;
  let html = '<table class="data-table"><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '<th>Actions</th></tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    row.cells.forEach(c => html += `<td>${c}</td>`);
    html += `<td class="table-actions">${actions(row.id)}</td>`;
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// ===== EXPERIENCES =====
async function loadExperiences() {
  const data = await api('/experiences');
  const items = data?.data || [];
  const rows = items.map(i => ({ id: i.id, cells: [i.posisi, i.perusahaan, i.durasi, (i.deskripsi||'').substring(0,50)+'...'] }));
  contentArea.innerHTML = `
    <div class="action-bar">
      <span>${items.length} experiences</span>
      <button class="btn btn--primary" id="addExp"><i class="ph ph-plus"></i> Add</button>
    </div>
    ${renderTable(['Position','Company','Duration','Description'], rows, (id) => `
      <button class="btn btn--sm btn--secondary" onclick="editExp(${id})">Edit</button>
      <button class="btn btn--sm btn--danger" onclick="delExp(${id})">Delete</button>
    `)}
  `;
  document.getElementById('addExp').addEventListener('click', () => editExp(null));
}

window.editExp = async function(id) {
  let item = {};
  if (id) {
    const data = await api('/experiences');
    item = (data?.data || []).find(i => i.id === id) || {};
  }
  openModal(id ? 'Edit Experience' : 'Add Experience', `
    <div class="form-group"><label>Position</label><input id="mPosisi" value="${item.posisi||''}" required /></div>
    <div class="form-group"><label>Company</label><input id="mPerusahaan" value="${item.perusahaan||''}" required /></div>
    <div class="form-group"><label>Duration</label><input id="mDurasi" value="${item.durasi||''}" /></div>
    <div class="form-group"><label>Description</label><textarea id="mDeskripsi" rows="3">${item.deskripsi||''}</textarea></div>
  `, async () => {
    const body = {
      posisi: document.getElementById('mPosisi').value,
      perusahaan: document.getElementById('mPerusahaan').value,
      durasi: document.getElementById('mDurasi').value,
      deskripsi: document.getElementById('mDeskripsi').value,
    };
    if (id) await api(`/experiences/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/experiences', { method: 'POST', body: JSON.stringify(body) });
    closeModal();
    loadExperiences();
  });
};

window.delExp = async function(id) {
  if (!confirm('Are you sure you want to delete?')) return;
  await api(`/experiences/${id}`, { method: 'DELETE' });
  loadExperiences();
};

// ===== PROJECTS =====
async function loadProjects() {
  const data = await api('/projects');
  const items = data?.data || [];
  const rows = items.map(i => ({ id: i.id, cells: [i.judul, (i.deskripsi||'').substring(0,50)+'...', i.gambar_url ? '✅' : '—'] }));
  contentArea.innerHTML = `
    <div class="action-bar">
      <span>${items.length} projects</span>
      <button class="btn btn--primary" id="addProj"><i class="ph ph-plus"></i> Add</button>
    </div>
    ${renderTable(['Title','Description','Image'], rows, (id) => `
      <button class="btn btn--sm btn--secondary" onclick="editProj(${id})">Edit</button>
      <button class="btn btn--sm btn--danger" onclick="delProj(${id})">Delete</button>
    `)}
  `;
  document.getElementById('addProj').addEventListener('click', () => editProj(null));
}

window.editProj = async function(id) {
  let item = {};
  if (id) {
    const data = await api('/projects');
    item = (data?.data || []).find(i => i.id === id) || {};
  }
  openModal(id ? 'Edit Project' : 'Add Project', `
    <div class="form-group"><label>Title</label><input id="mJudul" value="${item.judul||''}" required /></div>
    <div class="form-group"><label>Description</label><textarea id="mDeskripsiP" rows="3">${item.deskripsi||''}</textarea></div>
    <div class="form-group"><label>Project Link</label><input id="mLink" value="${item.link_project||''}" /></div>
    <div class="form-group"><label>Upload Image (Cloudinary)</label><input id="mFile" type="file" accept="image/*" /></div>
    <div class="form-group"><label>Current Image URL</label><input id="mGambarUrl" value="${item.gambar_url||''}" /></div>
  `, async () => {
    let gambar_url = document.getElementById('mGambarUrl').value;
    const file = document.getElementById('mFile').files[0];
    if (file) {
      const upload = await apiUpload(file);
      if (upload.url) gambar_url = upload.url;
    }
    const body = {
      judul: document.getElementById('mJudul').value,
      deskripsi: document.getElementById('mDeskripsiP').value,
      link_project: document.getElementById('mLink').value,
      gambar_url: gambar_url,
    };
    if (id) await api(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/projects', { method: 'POST', body: JSON.stringify(body) });
    closeModal();
    loadProjects();
  });
};

window.delProj = async function(id) {
  if (!confirm('Are you sure you want to delete?')) return;
  await api(`/projects/${id}`, { method: 'DELETE' });
  loadProjects();
};

// ===== SKILLS =====
async function loadSkills() {
  const data = await api('/skills');
  const items = data?.data || [];
  const rows = items.map(i => ({ id: i.id, cells: [i.nama_skill, i.icon_class || '—', i.logo_url ? '✅' : '—'] }));
  contentArea.innerHTML = `
    <div class="action-bar">
      <span>${items.length} Tech Stack</span>
      <button class="btn btn--primary" id="addSkill"><i class="ph ph-plus"></i> Add</button>
    </div>
    ${renderTable(['Skill Name','Icon Class', 'Logo'], rows, (id) => `
      <button class="btn btn--sm btn--secondary" onclick="editSkill(${id})">Edit</button>
      <button class="btn btn--sm btn--danger" onclick="delSkill(${id})">Delete</button>
    `)}
  `;
  document.getElementById('addSkill').addEventListener('click', () => editSkill(null));
}

window.editSkill = async function(id) {
  let item = {};
  if (id) {
    const data = await api('/skills');
    item = (data?.data || []).find(i => i.id === id) || {};
  }
  openModal(id ? 'Edit Skill' : 'Add Skill', `
    <div class="form-group"><label>Skill Name</label><input id="mSkill" value="${item.nama_skill||''}" required /></div>
    <div class="form-group"><label>Icon Class (Phosphor) (optional)</label><input id="mIcon" value="${item.icon_class||''}" placeholder="ph ph-code" /></div>
    <div class="form-group"><label>Upload Logo</label><input id="mLogoFile" type="file" accept="image/*" /></div>
    <div class="form-group"><label>Current Logo URL</label><input id="mLogoUrl" value="${item.logo_url||''}" /></div>
  `, async () => {
    let logo_url = document.getElementById('mLogoUrl').value;
    const file = document.getElementById('mLogoFile').files[0];
    if (file) {
      const upload = await apiUpload(file);
      if (upload.url) logo_url = upload.url;
    }
    const body = {
      nama_skill: document.getElementById('mSkill').value,
      icon_class: document.getElementById('mIcon').value,
      logo_url: logo_url,
    };
    if (id) await api(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/skills', { method: 'POST', body: JSON.stringify(body) });
    closeModal();
    loadSkills();
  });
};

window.delSkill = async function(id) {
  if (!confirm('Are you sure you want to delete?')) return;
  await api(`/skills/${id}`, { method: 'DELETE' });
  loadSkills();
};

// ===== CONTACTS (Read-only + Delete) =====
async function loadContacts() {
  let items = [];
  try {
    const data = await api('/admin/contacts');
    items = data?.data || [];
  } catch { items = []; }
  const rows = items.map(i => ({ id: i.id, cells: [i.nama, i.email, (i.pesan||'').substring(0,60)+'...', new Date(i.created_at).toLocaleDateString('id')] }));
  contentArea.innerHTML = `
    <div class="action-bar"><span>${items.length} messages</span></div>
    ${renderTable(['Name','Email','Message','Date'], rows, (id) => `
      <button class="btn btn--sm btn--danger" onclick="delContact(${id})">Delete</button>
    `)}
  `;
}

window.delContact = async function(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  await api(`/admin/contacts/${id}`, { method: 'DELETE' });
  loadContacts();
};

// ===== BLOGS =====
async function loadBlogs() {
  let items = [];
  try {
    const data = await api('/blogs');
    items = data?.data || [];
  } catch { items = []; }

  contentArea.innerHTML = `
    <div class="header-action">
      <h2>Blogs / Write-ups List</h2>
      <button class="btn btn--primary" onclick="addBlog()"><i class="ph ph-plus"></i> Add Blog</button>
    </div>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(b => `
            <tr>
              <td>${b.judul || ''}</td>
              <td><span class="badge">${b.kategori || 'General'}</span></td>
              <td>${new Date(b.created_at).toLocaleDateString('id-ID')}</td>
              <td>
                <button class="btn btn--sm btn--secondary" onclick='editBlog(${JSON.stringify(b).replace(/'/g, "&#39;")})'><i class="ph ph-pencil"></i></button>
                <button class="btn btn--sm btn--danger" onclick="delBlog(${b.id})"><i class="ph ph-trash"></i></button>
              </td>
            </tr>
          `).join('')}
          ${items.length === 0 ? '<tr><td colspan="4" class="empty-state">No blogs available. Start writing!</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

function getBlogFields(b = {}) {
  return `
    <div class="form-group">
      <label>Title</label>
      <input id="mBlogJudul" value="${b.judul || ''}" placeholder="Article title..." required />
    </div>
    <div class="form-group">
      <label>Category</label>
      <input id="mBlogKategori" value="${b.kategori || ''}" placeholder="Cybersecurity, Leadership, Career..." />
    </div>
    <div class="form-group full-width">
      <label>Content</label>
      <textarea id="mBlogKonten" rows="8" placeholder="Write your article here..." required>${b.konten || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Image URL (optional)</label>
      <input id="mBlogGambar" value="${b.gambar_url || ''}" placeholder="https://..." />
    </div>
  `;
}

window.addBlog = () => {
  openModal('Add Blog', getBlogFields(), async () => {
    const body = {
      judul: document.getElementById('mBlogJudul').value,
      konten: document.getElementById('mBlogKonten').value,
      kategori: document.getElementById('mBlogKategori').value || 'General',
      gambar_url: document.getElementById('mBlogGambar').value,
    };
    await api('/blogs', { method: 'POST', body: JSON.stringify(body) });
    closeModal();
    loadBlogs();
  });
};

window.editBlog = (b) => {
  openModal('Edit Blog', getBlogFields(b), async () => {
    const body = {
      judul: document.getElementById('mBlogJudul').value,
      konten: document.getElementById('mBlogKonten').value,
      kategori: document.getElementById('mBlogKategori').value || 'General',
      gambar_url: document.getElementById('mBlogGambar').value,
    };
    await api(`/blogs/${b.id}`, { method: 'PUT', body: JSON.stringify(body) });
    closeModal();
    loadBlogs();
  });
};

window.delBlog = async function(id) {
  if (!confirm('Are you sure you want to delete this blog?')) return;
  await api(`/blogs/${id}`, { method: 'DELETE' });
  loadBlogs();
};

// ===== CERTIFICATES =====
async function loadCertificates() {
  const data = await api('/certificates');
  const items = data?.data || [];
  const rows = items.map(i => ({ id: i.id, cells: [i.judul, i.gambar_url ? '✅' : '—'] }));
  contentArea.innerHTML = `
    <div class="action-bar">
      <span>${items.length} certificates</span>
      <button class="btn btn--primary" id="addCert"><i class="ph ph-plus"></i> Add</button>
    </div>
    ${renderTable(['Title', 'Image'], rows, (id) => `
      <button class="btn btn--sm btn--secondary" onclick="editCertificate(${id})">Edit</button>
      <button class="btn btn--sm btn--danger" onclick="delCertificate(${id})">Delete</button>
    `)}
  `;
  document.getElementById('addCert').addEventListener('click', () => editCertificate(null));
}

window.editCertificate = async function(id) {
  let item = {};
  if (id) {
    const data = await api('/certificates');
    item = (data?.data || []).find(i => i.id === id) || {};
  }
  openModal(id ? 'Edit Certificate' : 'Add Certificate', `
    <div class="form-group"><label>Certificate Title</label><input id="mCertJudul" value="${item.judul||''}" required /></div>
    <div class="form-group"><label>Upload Image</label><input id="mCertFile" type="file" accept="image/*" /></div>
    <div class="form-group"><label>Current Image URL</label><input id="mCertUrl" value="${item.gambar_url||''}" /></div>
  `, async () => {
    let gambar_url = document.getElementById('mCertUrl').value;
    const file = document.getElementById('mCertFile').files[0];
    if (file) {
      const upload = await apiUpload(file);
      if (upload.url) gambar_url = upload.url;
    }
    const body = {
      judul: document.getElementById('mCertJudul').value,
      gambar_url: gambar_url,
    };
    if (id) await api(`/certificates/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/certificates', { method: 'POST', body: JSON.stringify(body) });
    closeModal();
    loadCertificates();
  });
};

window.delCertificate = async function(id) {
  if (!confirm('Are you sure you want to delete this certificate?')) return;
  await api(`/certificates/${id}`, { method: 'DELETE' });
  loadCertificates();
};

// ---- Initial Load ----
loadDashboard();
