// =============================================
//  attendance.js — Gestion des Présences
// =============================================

// État temporaire de la séance en cours
let currentAttendanceSession = {};

function initAttendanceFilters() {
  populateSubjectSelect('att-subject-filter', true);
  // Date du jour par défaut
  const dateInput = document.getElementById('att-date-filter');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function renderAttendance() {
  const tbody = document.getElementById('attendance-tbody');
  if (!tbody) return;

  let records = getData('edu_attendance');
  const subjectFilter = document.getElementById('att-subject-filter')?.value;
  const dateFilter = document.getElementById('att-date-filter')?.value;
  const subjects = getData('edu_subjects');
  const students = getData('edu_students');

  if (subjectFilter) records = records.filter(r => r.subjectId == subjectFilter);
  if (dateFilter)    records = records.filter(r => r.date === dateFilter);

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem;">Aucune présence enregistrée</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const student = students.find(s => s.id == r.studentId);
    const subject = subjects.find(s => s.id == r.subjectId);
    return `
      <tr>
        <td><strong>${student ? student.nom + ' ' + student.prenom : '–'}</strong></td>
        <td>${subject ? subject.name : '–'}</td>
        <td>${r.date}</td>
        <td>
          <span class="badge badge-${r.status}">
            ${r.status === 'present' ? '✅ Présent' : r.status === 'absent' ? '❌ Absent' : '⏰ Retard'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function openAttendanceSession() {
  populateSubjectSelect('att-modal-subject');
  const dateInput = document.getElementById('att-modal-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  currentAttendanceSession = {};
  renderAttendanceStudentList();
  openModal('modal-attendance');
}

function renderAttendanceStudentList() {
  const container = document.getElementById('att-student-list');
  if (!container) return;
  const students = getData('edu_students');

  if (students.length === 0) {
    container.innerHTML = '<p class="empty-msg">Aucun étudiant enregistré</p>';
    return;
  }

  container.innerHTML = students.map(s => `
    <div class="att-student-row" id="att-row-${s.id}">
      <span class="att-name">${s.nom} ${s.prenom} <small style="color:var(--text-muted)">(${s.matricule})</small></span>
      <div class="att-btns">
        <button class="att-btn present" onclick="setAttStatus(${s.id}, 'present', this)">✅ Présent</button>
        <button class="att-btn absent"  onclick="setAttStatus(${s.id}, 'absent', this)">❌ Absent</button>
        <button class="att-btn retard"  onclick="setAttStatus(${s.id}, 'retard', this)">⏰ Retard</button>
      </div>
    </div>
  `).join('');
}

function setAttStatus(studentId, status, btn) {
  currentAttendanceSession[studentId] = status;
  // Mettre à jour l'UI
  const row = document.getElementById(`att-row-${studentId}`);
  if (!row) return;
  row.querySelectorAll('.att-btn').forEach(b => {
    b.className = `att-btn ${b.classList[1]}`;
  });
  btn.classList.add(`active-${status}`);
}

function saveAttendance() {
  const subjectId = document.getElementById('att-modal-subject')?.value;
  const date = document.getElementById('att-modal-date')?.value;

  if (!subjectId || !date) {
    showToast('Veuillez choisir une matière et une date', 'error');
    return;
  }

  if (Object.keys(currentAttendanceSession).length === 0) {
    showToast('Veuillez marquer au moins un étudiant', 'error');
    return;
  }

  let records = getData('edu_attendance');

  // Supprimer les enregistrements existants pour cette séance
  records = records.filter(r => !(r.subjectId == subjectId && r.date === date));

  // Ajouter les nouveaux
  const students = getData('edu_students');
  students.forEach(s => {
    const status = currentAttendanceSession[s.id] || 'absent'; // Absent par défaut
    records.push({ id: genId(), studentId: s.id, subjectId, date, status });
  });

  saveData('edu_attendance', records);
  closeModal('modal-attendance');
  renderAttendance();
  updateDashboard();
  showToast('Séance enregistrée ✅');
}
