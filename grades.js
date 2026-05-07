// =============================================
//  grades.js — Notes, Moyennes & Classement
// =============================================

function initGradeFilters() {
  populateSubjectSelect('grade-subject-filter', true);
  populateStudentSelect('grade-student');
  populateSubjectSelect('grade-subject');
}

function renderGrades() {
  const tbody = document.getElementById('grades-tbody');
  if (!tbody) return;

  let grades = getData('edu_grades');
  const students = getData('edu_students');
  const subjects = getData('edu_subjects');
  const isAdmin = document.body.classList.contains('role-admin');

  const semFilter  = document.getElementById('grade-sem-filter')?.value;
  const subjFilter = document.getElementById('grade-subject-filter')?.value;

  if (semFilter)  grades = grades.filter(g => g.semester === semFilter);
  if (subjFilter) grades = grades.filter(g => g.subjectId == subjFilter);

  if (grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">Aucune note enregistrée</td></tr>`;
    return;
  }

  tbody.innerHTML = grades.map(g => {
    const student = students.find(s => s.id == g.studentId);
    const subject = subjects.find(s => s.id == g.subjectId);
    const color = g.value >= 10 ? 'var(--green)' : 'var(--red)';
    return `
      <tr>
        <td>${student ? student.nom + ' ' + student.prenom : '–'}</td>
        <td>${subject ? subject.name : '–'}</td>
        <td><strong style="color:${color};font-size:1rem">${g.value}/20</strong></td>
        <td><span class="badge" style="background:rgba(59,130,246,0.1);color:var(--primary)">${g.semester}</span></td>
        <td class="admin-only" style="${isAdmin ? '' : 'display:none'}">
          <button class="btn-icon edit" onclick="editGrade(${g.id})"><i class="fas fa-pen"></i></button>
          <button class="btn-icon del" onclick="deleteGrade(${g.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  renderRanking();
}

function renderRanking() {
  const tbody = document.getElementById('ranking-tbody');
  if (!tbody) return;

  const grades   = getData('edu_grades');
  const students = getData('edu_students');
  const subjects = getData('edu_subjects');

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1rem;">Aucun étudiant</td></tr>`;
    return;
  }

  // Calcul de la moyenne générale pondérée par coefficient
  const ranking = students.map(student => {
    const studentGrades = grades.filter(g => g.studentId == student.id);
    let totalPoints = 0, totalCoeff = 0;

    studentGrades.forEach(g => {
      const subject = subjects.find(s => s.id == g.subjectId);
      const coeff = subject ? subject.coeff : 1;
      totalPoints += g.value * coeff;
      totalCoeff  += coeff;
    });

    const avg = totalCoeff > 0 ? (totalPoints / totalCoeff) : null;
    return { student, avg, gradesCount: studentGrades.length };
  });

  // Trier par moyenne décroissante
  ranking.sort((a, b) => {
    if (a.avg === null && b.avg === null) return 0;
    if (a.avg === null) return 1;
    if (b.avg === null) return -1;
    return b.avg - a.avg;
  });

  const medals = ['🥇', '🥈', '🥉'];

  tbody.innerHTML = ranking.map((r, i) => {
    const avgDisplay = r.avg !== null ? r.avg.toFixed(2) + '/20' : 'N/A';
    const mention = getAppreciation(r.avg);
    const rankClass = i < 3 ? `rank-${i + 1}` : '';
    const rankIcon = i < 3 ? medals[i] : `${i + 1}`;
    const color = r.avg === null ? '' : r.avg >= 10 ? 'color:var(--green)' : 'color:var(--red)';
    return `
      <tr class="${rankClass}">
        <td style="font-size:1.1rem">${rankIcon}</td>
        <td><strong>${r.student.nom} ${r.student.prenom}</strong></td>
        <td style="${color};font-weight:700">${avgDisplay}</td>
        <td><span style="font-size:0.82rem;color:var(--text-muted)">${mention}</span></td>
      </tr>
    `;
  }).join('');
}

function getAppreciation(avg) {
  if (avg === null) return '–';
  if (avg >= 16) return '🌟 Très bien';
  if (avg >= 14) return '👍 Bien';
  if (avg >= 12) return '✅ Assez bien';
  if (avg >= 10) return '📘 Passable';
  return '❌ Insuffisant';
}

function openGradeModal() {
  document.getElementById('grade-id').value = '';
  document.getElementById('grade-value').value = '';
  document.getElementById('grade-sem').value = 'S1';
  populateStudentSelect('grade-student');
  populateSubjectSelect('grade-subject');
  document.getElementById('modal-grade-title').textContent = 'Ajouter une note';
  openModal('modal-grade');
}

function editGrade(id) {
  const grades = getData('edu_grades');
  const g = grades.find(x => x.id === id);
  if (!g) return;
  populateStudentSelect('grade-student');
  populateSubjectSelect('grade-subject');
  document.getElementById('grade-id').value = g.id;
  document.getElementById('grade-student').value = g.studentId;
  document.getElementById('grade-subject').value = g.subjectId;
  document.getElementById('grade-value').value = g.value;
  document.getElementById('grade-sem').value = g.semester;
  document.getElementById('modal-grade-title').textContent = 'Modifier la note';
  openModal('modal-grade');
}

function saveGrade() {
  const id        = document.getElementById('grade-id').value;
  const studentId = document.getElementById('grade-student').value;
  const subjectId = document.getElementById('grade-subject').value;
  const value     = parseFloat(document.getElementById('grade-value').value);
  const semester  = document.getElementById('grade-sem').value;

  if (!studentId || !subjectId || isNaN(value) || value < 0 || value > 20) {
    showToast('Données invalides (note entre 0 et 20)', 'error');
    return;
  }

  let grades = getData('edu_grades');

  if (id) {
    const idx = grades.findIndex(g => g.id == id);
    if (idx !== -1) grades[idx] = { ...grades[idx], studentId, subjectId, value, semester };
    showToast('Note modifiée ✅');
  } else {
    grades.push({ id: genId(), studentId, subjectId, value, semester });
    showToast('Note ajoutée ✅');
  }

  saveData('edu_grades', grades);
  closeModal('modal-grade');
  renderGrades();
  updateDashboard();
}

function deleteGrade(id) {
  if (!confirmDelete('Supprimer cette note ?')) return;
  let grades = getData('edu_grades');
  grades = grades.filter(g => g.id !== id);
  saveData('edu_grades', grades);
  renderGrades();
  updateDashboard();
  showToast('Note supprimée');
}

// Remplir un <select> avec les étudiants
function populateStudentSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const students = getData('edu_students');
  const current = select.value;
  select.innerHTML = '';
  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nom + ' ' + s.prenom;
    select.appendChild(opt);
  });
  if (current) select.value = current;
}
