// =============================================
//  app.js — Logique principale (v2)
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initUsers();
  const user = checkAuth();
  if (!user) return;

  applyRole(user);
  applyMenuByRole(user);
  initNavigation();
  initSidebar();
  updateDashboard();
});

// Afficher/cacher les menus selon le rôle
function applyMenuByRole(user) {
  const isAdmin      = user.role === 'admin' || user.role === 'superadmin';
  const isSuperAdmin = user.role === 'superadmin';
  const isEtudiant   = user.role === 'etudiant';

  // Éléments admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Éléments superadmin
  document.querySelectorAll('.superadmin-only').forEach(el => {
    el.style.display = isSuperAdmin ? '' : 'none';
  });

  // Éléments étudiant uniquement
  document.querySelectorAll('.student-visible').forEach(el => {
    el.style.display = isEtudiant ? '' : 'none';
  });
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      const title   = item.querySelector('span')?.textContent || section;
      navigateTo(section, title);
      closeSidebar();
    });
  });
}

function navigateTo(sectionId, title) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  const activeNav     = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  const activeSection = document.getElementById(`section-${sectionId}`);

  if (activeNav)     activeNav.classList.add('active');
  if (activeSection) activeSection.classList.add('active');

  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) topbarTitle.textContent = title;

  loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
  switch(sectionId) {
    case 'dashboard':     updateDashboard(); break;
    case 'students':      renderStudents(); break;
    case 'subjects':      renderSubjects(); break;
    case 'attendance':    initAttendanceFilters(); renderAttendance(); break;
    case 'grades':        initGradeFilters(); renderGrades(); renderRanking(); break;
    case 'schedule':      renderSchedule(); break;
    case 'announcements': renderAnnouncements(); break;
    case 'documents':     renderDocuments(); break;
    case 'users':         renderUsers(); break;
    case 'my-grades':     renderMyGrades(); break;
    case 'my-attendance': renderMyAttendance(); break;
  }
}

// Sidebar mobile
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const closeBtn  = document.getElementById('sidebar-close');
  if (hamburger) hamburger.addEventListener('click', () => document.getElementById('sidebar').classList.add('open'));
  if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}

// ---- MES NOTES (vue étudiant) ----
function renderMyGrades() {
  const tbody   = document.getElementById('my-grades-tbody');
  const avgEl   = document.getElementById('my-avg-display');
  if (!tbody) return;

  const user     = getCurrentUser();
  const students = getData('edu_students');
  const grades   = getData('edu_grades');
  const subjects = getData('edu_subjects');

  // Trouver l'étudiant lié à ce compte (par nom)
  const student = students.find(s =>
    (s.nom + ' ' + s.prenom).toLowerCase() === (user.nom || '').toLowerCase()
  );

  if (!student) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem">
      Votre profil étudiant n'est pas encore lié. Contactez l'administrateur.</td></tr>`;
    if (avgEl) avgEl.textContent = '–';
    return;
  }

  const myGrades = grades.filter(g => g.studentId == student.id);

  if (myGrades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem">Aucune note enregistrée</td></tr>`;
    if (avgEl) avgEl.textContent = '–';
    return;
  }

  tbody.innerHTML = myGrades.map(g => {
    const subj  = subjects.find(s => s.id == g.subjectId);
    const color = g.value >= 10 ? 'var(--green)' : 'var(--red)';
    return `<tr>
      <td>${subj ? subj.name : '–'}</td>
      <td><strong style="color:${color}">${g.value}/20</strong></td>
      <td><span class="badge" style="background:rgba(59,130,246,0.1);color:var(--primary)">${g.semester}</span></td>
      <td>${getAppreciation(g.value)}</td>
    </tr>`;
  }).join('');

  // Moyenne
  let totalPts = 0, totalCoeff = 0;
  myGrades.forEach(g => {
    const subj  = subjects.find(s => s.id == g.subjectId);
    const coeff = subj ? subj.coeff : 1;
    totalPts  += g.value * coeff;
    totalCoeff += coeff;
  });
  const avg = totalCoeff > 0 ? (totalPts / totalCoeff).toFixed(2) : '–';
  if (avgEl) {
    avgEl.textContent = avg !== '–' ? avg + '/20' : '–';
    avgEl.style.color = avg >= 10 ? 'var(--green)' : 'var(--red)';
  }
}

// ---- MES PRÉSENCES (vue étudiant) ----
function renderMyAttendance() {
  const tbody = document.getElementById('my-attendance-tbody');
  if (!tbody) return;

  const user       = getCurrentUser();
  const students   = getData('edu_students');
  const attendance = getData('edu_attendance');
  const subjects   = getData('edu_subjects');

  const student = students.find(s =>
    (s.nom + ' ' + s.prenom).toLowerCase() === (user.nom || '').toLowerCase()
  );

  if (!student) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:2rem">
      Profil étudiant non lié. Contactez l'administrateur.</td></tr>`;
    return;
  }

  const myRecords = attendance.filter(a => a.studentId == student.id);

  setEl('my-present-count', myRecords.filter(a => a.status === 'present').length);
  setEl('my-retard-count',  myRecords.filter(a => a.status === 'retard').length);
  setEl('my-absent-count',  myRecords.filter(a => a.status === 'absent').length);

  if (myRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:2rem">Aucun enregistrement</td></tr>`;
    return;
  }

  tbody.innerHTML = myRecords.map(r => {
    const subj = subjects.find(s => s.id == r.subjectId);
    return `<tr>
      <td>${subj ? subj.name : '–'}</td>
      <td>${r.date}</td>
      <td><span class="badge badge-${r.status}">
        ${r.status === 'present' ? '✅ Présent' : r.status === 'absent' ? '❌ Absent' : '⏰ Retard'}
      </span></td>
    </tr>`;
  }).join('');
}

// ---- Dashboard ----
function updateDashboard() {
  const students      = getData('edu_students');
  const subjects      = getData('edu_subjects');
  const attendance    = getData('edu_attendance');
  const grades        = getData('edu_grades');
  const announcements = getData('edu_announcements');

  setEl('stat-students', students.length);
  setEl('stat-subjects', subjects.length);

  if (attendance.length > 0) {
    const rate = Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100);
    setEl('stat-presence', rate + '%');
  } else { setEl('stat-presence', 'N/A'); }

  if (grades.length > 0) {
    const avg = grades.reduce((s, g) => s + g.value, 0) / grades.length;
    setEl('stat-avg', avg.toFixed(2) + '/20');
  } else { setEl('stat-avg', 'N/A'); }

  // Alertes absences
  const absenceContainer = document.getElementById('absence-alerts');
  if (absenceContainer) {
    const counts = {};
    attendance.filter(a => a.status === 'absent').forEach(a => {
      counts[a.studentId] = (counts[a.studentId] || 0) + 1;
    });
    const alerts = Object.entries(counts).filter(([,c]) => c >= 3).map(([sid, c]) => {
      const s = students.find(x => x.id == sid);
      return s ? `<div class="alert-item"><i class="fas fa-triangle-exclamation"></i>${s.nom} ${s.prenom} — ${c} absences</div>` : '';
    }).filter(Boolean).join('');
    absenceContainer.innerHTML = alerts || '<p class="empty-msg">Aucune alerte ✅</p>';
  }

  // Annonces récentes
  const annContainer = document.getElementById('recent-announcements');
  if (annContainer) {
    if (!announcements.length) {
      annContainer.innerHTML = '<p class="empty-msg">Aucune annonce publiée</p>';
    } else {
      annContainer.innerHTML = [...announcements].reverse().slice(0, 3).map(a =>
        `<div class="announcement-card" style="margin-bottom:0.5rem">
          <div class="ann-card-header">
            <span class="ann-card-title">${a.title}</span>
            <span class="ann-card-date">${a.date}</span>
          </div>
          <p class="ann-card-body">${a.body}</p>
        </div>`
      ).join('');
    }
  }
}

// ---- Utilitaires ----
function getData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function genId() { return Date.now() + Math.floor(Math.random() * 1000); }

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

function confirmDelete(msg) { return confirm(msg || 'Confirmer la suppression ?'); }
