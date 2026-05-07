// =============================================
//  subjects.js — Gestion des Matières
// =============================================

function renderSubjects() {
  const tbody = document.getElementById('subjects-tbody');
  if (!tbody) return;

  const subjects = getData('edu_subjects');
  const isAdmin = document.body.classList.contains('role-admin');

  if (subjects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem;">Aucune matière enregistrée</td></tr>`;
    return;
  }

  tbody.innerHTML = subjects.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td>
        <span style="background:rgba(168,85,247,0.1);color:var(--purple);padding:0.2rem 0.6rem;border-radius:20px;font-size:0.78rem;font-weight:700">
          Coeff. ${s.coeff}
        </span>
      </td>
      <td class="admin-only" style="${isAdmin ? '' : 'display:none'}">
        <button class="btn-icon edit" onclick="editSubject(${s.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-icon del" onclick="deleteSubject(${s.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openSubjectModal() {
  document.getElementById('subject-id').value = '';
  document.getElementById('subject-name').value = '';
  document.getElementById('subject-coeff').value = '';
  document.getElementById('modal-subject-title').textContent = 'Ajouter une matière';
  openModal('modal-subject');
}

function editSubject(id) {
  const subjects = getData('edu_subjects');
  const s = subjects.find(x => x.id === id);
  if (!s) return;
  document.getElementById('subject-id').value = s.id;
  document.getElementById('subject-name').value = s.name;
  document.getElementById('subject-coeff').value = s.coeff;
  document.getElementById('modal-subject-title').textContent = 'Modifier la matière';
  openModal('modal-subject');
}

function saveSubject() {
  const id = document.getElementById('subject-id').value;
  const name = document.getElementById('subject-name').value.trim();
  const coeff = parseInt(document.getElementById('subject-coeff').value);

  if (!name || !coeff || coeff < 1) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }

  let subjects = getData('edu_subjects');

  if (id) {
    const idx = subjects.findIndex(s => s.id == id);
    if (idx !== -1) subjects[idx] = { ...subjects[idx], name, coeff };
    showToast('Matière modifiée ✅');
  } else {
    subjects.push({ id: genId(), name, coeff });
    showToast('Matière ajoutée ✅');
  }

  saveData('edu_subjects', subjects);
  closeModal('modal-subject');
  renderSubjects();
  updateDashboard();
}

function deleteSubject(id) {
  if (!confirmDelete('Supprimer cette matière ?')) return;
  let subjects = getData('edu_subjects');
  subjects = subjects.filter(s => s.id !== id);
  saveData('edu_subjects', subjects);
  renderSubjects();
  updateDashboard();
  showToast('Matière supprimée');
}

// Remplir un <select> avec les matières
function populateSubjectSelect(selectId, addAll = false) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const subjects = getData('edu_subjects');
  const current = select.value;
  select.innerHTML = '';
  if (addAll) select.innerHTML = '<option value="">Toutes les matières</option>';
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
  if (current) select.value = current;
}
