/**
 * terminal.js — Hacker Terminal Easter Egg
 * Shortcut: Ctrl + ` (backtick) to toggle
 * Commands: whoami, skills, experience, projects, contact, help, clear, exit
 */

let terminalData = { profil: null, skills: [], experiences: [], projects: [] };

export function initTerminal(data) {
  try {
    terminalData = { ...terminalData, ...data };
  } catch (e) {
    console.warn('[Terminal] Failed to initialize data:', e);
  }
  createTerminalDOM();
  bindTerminalEvents();
}

function createTerminalDOM() {
  // Prevent duplicate creation
  if (document.getElementById('terminalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'terminalOverlay';
  overlay.className = 'terminal-overlay';
  overlay.innerHTML = `
    <div class="terminal">
      <div class="terminal__header">
        <div class="terminal__dots">
          <span class="terminal__dot terminal__dot--red"></span>
          <span class="terminal__dot terminal__dot--yellow"></span>
          <span class="terminal__dot terminal__dot--green"></span>
        </div>
        <span class="terminal__title">awl@portofolio:~</span>
        <button class="terminal__close" id="terminalClose">&times;</button>
      </div>
      <div class="terminal__body" id="terminalBody">
        <div class="terminal__output" id="terminalOutput"></div>
        <div class="terminal__input-line">
          <span class="terminal__prompt">awl@portofolio:~$</span>
          <input type="text" class="terminal__input" id="terminalInput" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function bindTerminalEvents() {
  const overlay = document.getElementById('terminalOverlay');
  const input = document.getElementById('terminalInput');
  const closeBtn = document.getElementById('terminalClose');

  if (!overlay || !input) return;

  // Keyboard shortcut: Ctrl + ` to toggle
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      toggleTerminal();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeTerminal();
    }
  });

  // Close button
  if (closeBtn) closeBtn.addEventListener('click', closeTerminal);

  // Command input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      input.value = '';
      if (cmd) processCommand(cmd);
    }
  });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTerminal();
  });

  // Print welcome message
  printWelcome();
}

function toggleTerminal() {
  const overlay = document.getElementById('terminalOverlay');
  if (!overlay) return;
  if (overlay.classList.contains('open')) {
    closeTerminal();
  } else {
    openTerminal();
  }
}

function openTerminal() {
  const overlay = document.getElementById('terminalOverlay');
  const input = document.getElementById('terminalInput');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { if (input) input.focus(); }, 300);
}

function closeTerminal() {
  const overlay = document.getElementById('terminalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function printLine(text, className = '') {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  const line = document.createElement('div');
  line.className = `terminal__line ${className}`;
  line.innerHTML = text;
  output.appendChild(line);
  // Auto-scroll to bottom
  const body = document.getElementById('terminalBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function printWelcome() {
  const asciiArt = `
 █████╗ ██╗    ██╗██╗     
██╔══██╗██║    ██║██║     
███████║██║ █╗ ██║██║     
██╔══██║██║███╗██║██║     
██║  ██║╚███╔███╔╝███████╗
╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝`;

  printLine(`<pre class="terminal__ascii">${asciiArt}</pre>`);
  printLine('');
  printLine('<span class="t-green">Welcome to Arthur Willyam Liang\'s Terminal Portfolio</span>');
  printLine('<span class="t-dim">Type <span class="t-cyan">help</span> to see available commands</span>');
  printLine('');
}

function processCommand(cmd) {
  // Echo the command
  printLine(`<span class="terminal__prompt">awl@portofolio:~$</span> <span class="t-white">${escapeHtml(cmd)}</span>`);

  const args = cmd.toLowerCase().split(/\s+/);
  const command = args[0];

  try {
    switch (command) {
      case 'help':
        cmdHelp();
        break;
      case 'whoami':
        cmdWhoami();
        break;
      case 'skills':
      case 'cat skills.txt':
        cmdSkills();
        break;
      case 'experience':
      case 'exp':
        cmdExperience();
        break;
      case 'projects':
      case 'ls projects/':
        cmdProjects();
        break;
      case 'contact':
        cmdContact();
        break;
      case 'clear':
        cmdClear();
        break;
      case 'exit':
      case 'quit':
        closeTerminal();
        break;
      case 'sudo':
        printLine('<span class="t-red">⚠ Nice try! You don\'t have root access here 😏</span>');
        break;
      case 'rm':
        printLine('<span class="t-red">🚫 Permission denied: You cannot delete anything here!</span>');
        break;
      case 'hack':
        printLine('<span class="t-green">🔒 System secured. I\'m the cybersecurity guy, remember?</span>');
        break;
      case 'date':
        printLine(`<span class="t-cyan">${new Date().toLocaleString('id-ID')}</span>`);
        break;
      case 'uname':
        printLine('<span class="t-cyan">AWL-OS v2.0.26 (Portofolio Edition)</span>');
        break;
      case 'neofetch':
        cmdNeofetch();
        break;
      default:
        printLine(`<span class="t-red">Command not found: ${escapeHtml(command)}</span>`);
        printLine('<span class="t-dim">Type <span class="t-cyan">help</span> for available commands</span>');
    }
  } catch (e) {
    printLine(`<span class="t-red">Error executing command: ${escapeHtml(e.message)}</span>`);
  }
  printLine('');
}

function cmdHelp() {
  const commands = [
    ['whoami', 'Display profile information'],
    ['skills', 'List all skills & competencies'],
    ['experience', 'Show work & organization experience'],
    ['projects', 'List portfolio projects'],
    ['contact', 'Show contact information'],
    ['neofetch', 'System information (fun!)'],
    ['date', 'Show current date & time'],
    ['clear', 'Clear terminal screen'],
    ['exit', 'Close terminal'],
  ];
  printLine('<span class="t-green">Available Commands:</span>');
  printLine('');
  commands.forEach(([cmd, desc]) => {
    printLine(`  <span class="t-cyan">${cmd.padEnd(14)}</span> <span class="t-dim">${desc}</span>`);
  });
}

function cmdWhoami() {
  const p = terminalData.profil;
  if (!p) {
    printLine('<span class="t-yellow">⚠ Profile data not available</span>');
    return;
  }
  printLine('<span class="t-green">╔══════════════════════════════════════╗</span>');
  printLine('<span class="t-green">║       PROFILE INFORMATION            ║</span>');
  printLine('<span class="t-green">╚══════════════════════════════════════╝</span>');
  printLine(`  <span class="t-cyan">Name:</span>       ${p.nama_lengkap || 'Arthur Willyam Liang'}`);
  printLine(`  <span class="t-cyan">Nickname:</span>   ${p.nama_panggilan || 'Arthur'}`);
  printLine(`  <span class="t-cyan">University:</span> ${p.universitas || 'UKSW'}`);
  printLine(`  <span class="t-cyan">Faculty:</span>    ${p.fakultas || 'FTI'}`);
  printLine(`  <span class="t-cyan">Major:</span>      ${p.prodi || 'Information Systems'}`);
  printLine(`  <span class="t-cyan">Semester:</span>   ${p.semester || '6'}`);
  printLine(`  <span class="t-cyan">Email:</span>      ${p.email || '-'}`);
  printLine(`  <span class="t-cyan">Phone:</span>      ${p.telepon || '-'}`);
  printLine(`  <span class="t-cyan">Location:</span>   ${p.alamat || '-'}`);
}

function cmdSkills() {
  const skills = terminalData.skills || [];
  if (skills.length === 0) {
    printLine('<span class="t-yellow">⚠ No skills data loaded</span>');
    return;
  }
  printLine('<span class="t-green">╔══════════════════════════════════════╗</span>');
  printLine('<span class="t-green">║       SKILLS & COMPETENCIES          ║</span>');
  printLine('<span class="t-green">╚══════════════════════════════════════╝</span>');
  skills.forEach((s, i) => {
    const bar = '█'.repeat(Math.min(15, 8 + Math.floor(Math.random() * 8)));
    const pct = Math.floor(70 + Math.random() * 30);
    printLine(`  <span class="t-cyan">[${(i + 1).toString().padStart(2, '0')}]</span> ${(s.nama_skill || '').padEnd(20)} <span class="t-green">${bar}</span> <span class="t-dim">${pct}%</span>`);
  });
}

function cmdExperience() {
  const exps = terminalData.experiences || [];
  if (exps.length === 0) {
    printLine('<span class="t-yellow">⚠ No experience data loaded</span>');
    return;
  }
  printLine('<span class="t-green">╔══════════════════════════════════════╗</span>');
  printLine('<span class="t-green">║       EXPERIENCE & LEADERSHIP        ║</span>');
  printLine('<span class="t-green">╚══════════════════════════════════════╝</span>');
  exps.forEach((exp) => {
    printLine(`  <span class="t-cyan">▸</span> <span class="t-white">${exp.posisi || ''}</span>`);
    printLine(`    <span class="t-dim">${exp.perusahaan || ''} | ${exp.durasi || ''}</span>`);
    if (exp.deskripsi) printLine(`    ${exp.deskripsi}`);
    printLine('');
  });
}

function cmdProjects() {
  const projects = terminalData.projects || [];
  if (projects.length === 0) {
    printLine('<span class="t-yellow">⚠ No projects data loaded</span>');
    return;
  }
  printLine('<span class="t-green">╔══════════════════════════════════════╗</span>');
  printLine('<span class="t-green">║       PROJECT DIRECTORY              ║</span>');
  printLine('<span class="t-green">╚══════════════════════════════════════╝</span>');
  printLine('<span class="t-dim">  drwxr-xr-x  projects/</span>');
  printLine('');
  projects.forEach((p) => {
    printLine(`  <span class="t-cyan">📁</span> <span class="t-white">${p.judul || ''}</span>`);
    if (p.deskripsi) printLine(`     <span class="t-dim">${p.deskripsi}</span>`);
  });
}

function cmdContact() {
  const p = terminalData.profil;
  printLine('<span class="t-green">╔══════════════════════════════════════╗</span>');
  printLine('<span class="t-green">║       CONTACT INFORMATION            ║</span>');
  printLine('<span class="t-green">╚══════════════════════════════════════╝</span>');
  printLine(`  <span class="t-cyan">📧 Email:</span>    ${p?.email || 'awillyam327@gmail.com'}`);
  printLine(`  <span class="t-cyan">📱 Phone:</span>    ${p?.telepon || '082230429592'}`);
  printLine(`  <span class="t-cyan">🐙 GitHub:</span>   github.com/awillyam327`);
  printLine(`  <span class="t-cyan">💼 LinkedIn:</span> linkedin.com/in/arthurwillyam`);
}

function cmdNeofetch() {
  const asciiSmall = `
  ▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄
 █   █       █   █
 █   █   ▄   █   █
 █   █  █ █  █   █
 █   █  █▄█  █   █
 █   █       █   █
 █▄▄▄█▄▄▄▄▄▄▄█▄▄▄█`;
  printLine(`<pre class="terminal__ascii t-cyan">${asciiSmall}</pre>`);
  printLine(`  <span class="t-cyan">OS:</span>      AWL-OS v2.0.26`);
  printLine(`  <span class="t-cyan">Host:</span>    Vercel Cloud`);
  printLine(`  <span class="t-cyan">Shell:</span>   awl-terminal v1.0`);
  printLine(`  <span class="t-cyan">Stack:</span>   Flask + Vanilla JS`);
  printLine(`  <span class="t-cyan">DB:</span>      TiDB Serverless`);
  printLine(`  <span class="t-cyan">CDN:</span>     Cloudinary`);
  printLine(`  <span class="t-cyan">Uptime:</span>  ${Math.floor((Date.now() - performance.timing.navigationStart) / 1000)}s`);
}

function cmdClear() {
  const output = document.getElementById('terminalOutput');
  if (output) output.innerHTML = '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
