// =============================================
//  students.js — Gestion des Étudiants
// =============================================

function renderStudents() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  let students = getData('edu_students');
  const search = (document.getElementById('search-student')?.value || '').toLowerCase();

  if (search) {
    students = students.filter(s =>
      s.nom.toLowerCase().includes(search) ||
      s.prenom.toLowerCase().includes(search) ||
      s.matricule.toLowerCase().includes(search)
    );
  }

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">
      ${search ? 'Aucun résultat trouvé' : 'Aucun étudiant enregistré'}</td></tr>`;
    return;
  }

  const isAdmin = document.body.classList.contains('role-admin');

  tbody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><code style="font-family:var(--mono);color:var(--primary);font-size:0.8rem">${s.matricule}</code></td>
      <td><strong>${s.nom}</strong> ${s.prenom}</td>
      <td>
        <span class="badge" style="${s.sexe === 'M' ? 'background:rgba(59,130,246,0.1);color:var(--primary)' : 'background:rgba(168,85,247,0.1);color:var(--purple)'}">
          ${s.sexe === 'M' ? '♂ Masculin' : '♀ Féminin'}
        </span>
      </td>
      <td class="admin-only" style="${isAdmin ? '' : 'display:none'}">
        <button class="btn-icon edit" onclick="editStudent(${s.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-icon del" onclick="deleteStudent(${s.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openStudentModal(id = null) {
  document.getElementById('student-id').value = '';
  document.getElementById('student-matricule').value = '';
  document.getElementById('student-nom').value = '';
  document.getElementById('student-prenom').value = '';
  document.getElementById('student-sexe').value = 'M';
  document.getElementById('modal-student-title').textContent = 'Ajouter un étudiant';
  openModal('modal-student');
}

function editStudent(id) {
  const students = getData('edu_students');
  const s = students.find(x => x.id === id);
  if (!s) return;

  document.getElementById('student-id').value = s.id;
  document.getElementById('student-matricule').value = s.matricule;
  document.getElementById('student-nom').value = s.nom;
  document.getElementById('student-prenom').value = s.prenom;
  document.getElementById('student-sexe').value = s.sexe;
  document.getElementById('modal-student-title').textContent = 'Modifier l\'étudiant';
  openModal('modal-student');
}

function saveStudent() {
  const id = document.getElementById('student-id').value;
  const matricule = document.getElementById('student-matricule').value.trim();
  const nom = document.getElementById('student-nom').value.trim();
  const prenom = document.getElementById('student-prenom').value.trim();
  const sexe = document.getElementById('student-sexe').value;

  if (!matricule || !nom || !prenom) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }

  let students = getData('edu_students');

  if (id) {
    // Modifier
    const idx = students.findIndex(s => s.id == id);
    if (idx !== -1) students[idx] = { ...students[idx], matricule, nom, prenom, sexe };
    showToast('Étudiant modifié ✅');
  } else {
    // Vérifier matricule unique
    if (students.find(s => s.matricule === matricule)) {
      showToast('Ce matricule existe déjà', 'error');
      return;
    }
    students.push({ id: genId(), matricule, nom, prenom, sexe });
    showToast('Étudiant ajouté ✅');
  }

  saveData('edu_students', students);
  closeModal('modal-student');
  renderStudents();
  updateDashboard();
}

function deleteStudent(id) {
  if (!confirmDelete('Supprimer cet étudiant ? Cette action est irréversible.')) return;
  let students = getData('edu_students');
  students = students.filter(s => s.id !== id);
  saveData('edu_students', students);
  renderStudents();
  updateDashboard();
  showToast('Étudiant supprimé');
}
