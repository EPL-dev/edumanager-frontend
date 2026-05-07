// =============================================
//  announcements.js — Annonces
// =============================================

function renderAnnouncements() {
  const container = document.getElementById('announcements-list');
  if (!container) return;

  const announcements = getData('edu_announcements');
  const isAdmin = document.body.classList.contains('role-admin');

  if (announcements.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="padding:1rem">Aucune annonce publiée</p>';
    return;
  }

  container.innerHTML = [...announcements].reverse().map(a => `
    <div class="announcement-card">
      <div class="ann-card-header">
        <span class="ann-card-title">📢 ${a.title}</span>
        <span class="ann-card-date">${a.date}</span>
      </div>
      <p class="ann-card-body">${a.body}</p>
      ${isAdmin ? `
        <div class="ann-card-actions">
          <button class="btn-icon del" onclick="deleteAnnouncement(${a.id})"><i class="fas fa-trash"></i> Supprimer</button>
        </div>` : ''}
    </div>
  `).join('');
}

function openAnnouncementModal() {
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-body').value = '';
  openModal('modal-announcement');
}

function saveAnnouncement() {
  const title = document.getElementById('ann-title').value.trim();
  const body  = document.getElementById('ann-body').value.trim();

  if (!title || !body) {
    showToast('Titre et message requis', 'error');
    return;
  }

  const announcements = getData('edu_announcements');
  announcements.push({
    id: genId(),
    title,
    body,
    date: new Date().toLocaleDateString('fr-FR')
  });

  saveData('edu_announcements', announcements);
  closeModal('modal-announcement');
  renderAnnouncements();
  updateDashboard();
  showToast('Annonce publiée ✅');
}

function deleteAnnouncement(id) {
  if (!confirmDelete('Supprimer cette annonce ?')) return;
  let announcements = getData('edu_announcements');
  announcements = announcements.filter(a => a.id !== id);
  saveData('edu_announcements', announcements);
  renderAnnouncements();
  updateDashboard();
  showToast('Annonce supprimée');
}


// =============================================
//  documents.js — Documents
// =============================================

function renderDocuments() {
  const container = document.getElementById('documents-list');
  if (!container) return;

  const documents = getData('edu_documents');
  const isAdmin   = document.body.classList.contains('role-admin');

  if (documents.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="padding:1rem">Aucun document disponible</p>';
    return;
  }

  container.innerHTML = documents.map(d => {
    const icons = { pdf: '📄', doc: '📝', autre: '📁' };
    const icon  = icons[d.type] || '📁';
    return `
      <div class="doc-card">
        <div class="doc-icon ${d.type}">${icon}</div>
        <div class="doc-name">${d.name}</div>
        <div class="doc-actions">
          <a href="${d.url}" target="_blank" class="btn-primary" style="font-size:0.78rem;padding:0.4rem 0.8rem">
            <i class="fas fa-download"></i> Télécharger
          </a>
          ${isAdmin ? `<button class="btn-icon del" onclick="deleteDocument(${d.id})"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function openDocumentModal() {
  document.getElementById('doc-name').value = '';
  document.getElementById('doc-url').value = '';
  document.getElementById('doc-type').value = 'pdf';
  openModal('modal-document');
}

function saveDocument() {
  const name = document.getElementById('doc-name').value.trim();
  const url  = document.getElementById('doc-url').value.trim();
  const type = document.getElementById('doc-type').value;

  if (!name || !url) {
    showToast('Nom et lien requis', 'error');
    return;
  }

  const documents = getData('edu_documents');
  documents.push({ id: genId(), name, url, type });
  saveData('edu_documents', documents);
  closeModal('modal-document');
  renderDocuments();
  showToast('Document ajouté ✅');
}

function deleteDocument(id) {
  if (!confirmDelete('Supprimer ce document ?')) return;
  let documents = getData('edu_documents');
  documents = documents.filter(d => d.id !== id);
  saveData('edu_documents', documents);
  renderDocuments();
  showToast('Document supprimé');
}
