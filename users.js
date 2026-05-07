// =============================================
//  users.js — Gestion des comptes utilisateurs
//  Accessible uniquement au superadmin
// =============================================

function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  initUsers();
  const users   = getData('edu_users');
  const current = getCurrentUser();

  const roleLabels = { superadmin: '👑 Super Admin', admin: '🔑 Admin', etudiant: '🎓 Étudiant' };
  const roleColors = {
    superadmin: 'background:rgba(251,191,36,0.12);color:#fbbf24',
    admin:      'background:rgba(59,130,246,0.12);color:var(--primary)',
    etudiant:   'background:rgba(34,197,94,0.12);color:var(--green)'
  };

  tbody.innerHTML = users.map((u, i) => {
    const isSelf  = u.id === current.id;
    const canEdit = !isSelf; // ne peut pas se supprimer soi-même
    return `
      <tr>
        <td>${i + 1}</td>
        <td><code style="font-family:var(--mono);color:var(--primary)">${u.username}</code></td>
        <td>${u.nom || '–'}</td>
        <td><span class="badge" style="${roleColors[u.role] || ''}">${roleLabels[u.role] || u.role}</span></td>
        <td>${u.email || '–'}</td>
        <td>${u.createdAt || '–'}</td>
        <td>
          ${isSelf
            ? '<span style="color:var(--text-muted);font-size:0.78rem">Compte actuel</span>'
            : `<button class="btn-icon edit" onclick="editUser(${u.id})"><i class="fas fa-pen"></i></button>
               <button class="btn-icon del"  onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

function openUserModal(id = null) {
  document.getElementById('user-id').value       = '';
  document.getElementById('user-username').value = '';
  document.getElementById('user-nom').value      = '';
  document.getElementById('user-email').value    = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value     = 'etudiant';
  document.getElementById('modal-user-title').textContent = 'Ajouter un compte';
  document.getElementById('user-password-hint').textContent = '';
  openModal('modal-user');
}

function editUser(id) {
  initUsers();
  const users = getData('edu_users');
  const u     = users.find(x => x.id === id);
  if (!u) return;

  document.getElementById('user-id').value       = u.id;
  document.getElementById('user-username').value = u.username;
  document.getElementById('user-nom').value      = u.nom || '';
  document.getElementById('user-email').value    = u.email || '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value     = u.role;
  document.getElementById('modal-user-title').textContent = 'Modifier le compte';
  document.getElementById('user-password-hint').textContent = 'Laisser vide pour ne pas changer le mot de passe';
  openModal('modal-user');
}

function saveUser() {
  const id       = document.getElementById('user-id').value;
  const username = document.getElementById('user-username').value.trim();
  const nom      = document.getElementById('user-nom').value.trim();
  const email    = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const role     = document.getElementById('user-role').value;

  if (!username || !nom) {
    showToast('Nom d\'utilisateur et nom complet requis', 'error');
    return;
  }

  initUsers();
  let users = getData('edu_users');

  if (id) {
    // Modifier
    const idx = users.findIndex(u => u.id == id);
    if (idx === -1) return;

    // Vérifier doublon username (sauf soi-même)
    if (users.find(u => u.username === username && u.id != id)) {
      showToast('Ce nom d\'utilisateur est déjà pris', 'error');
      return;
    }

    users[idx].username = username;
    users[idx].nom      = nom;
    users[idx].email    = email;
    users[idx].role     = role;
    if (password) users[idx].password = hashPassword(password);

    showToast('Compte modifié ✅');
  } else {
    // Nouveau compte
    if (!password || password.length < 4) {
      showToast('Mot de passe requis (minimum 4 caractères)', 'error');
      return;
    }
    if (users.find(u => u.username === username)) {
      showToast('Ce nom d\'utilisateur est déjà pris', 'error');
      return;
    }

    users.push({
      id:        genId(),
      username,
      password:  hashPassword(password),
      role,
      nom,
      email,
      createdAt: new Date().toLocaleDateString('fr-FR')
    });

    showToast('Compte créé ✅');
  }

  saveData('edu_users', users);
  closeModal('modal-user');
  renderUsers();
}

function deleteUser(id) {
  const current = getCurrentUser();
  if (id === current.id) { showToast('Vous ne pouvez pas supprimer votre propre compte', 'error'); return; }
  if (!confirmDelete('Supprimer ce compte utilisateur ?')) return;

  initUsers();
  let users = getData('edu_users');
  users = users.filter(u => u.id !== id);
  saveData('edu_users', users);
  renderUsers();
  showToast('Compte supprimé');
}
