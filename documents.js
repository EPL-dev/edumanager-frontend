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
    return `<div class="doc-card">
      <div class="doc-icon ${d.type}">${icons[d.type] || '📁'}</div>
      <div class="doc-name">${d.name}</div>
      <div class="doc-actions">
        <a href="${d.url}" target="_blank" class="btn-primary" style="font-size:0.78rem;padding:0.4rem 0.8rem">
          <i class="fas fa-download"></i> Télécharger
        </a>
        ${isAdmin ? `<button class="btn-icon del" onclick="deleteDocument(${d.id})"><i class="fas fa-trash"></i></button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function openDocumentModal() {
  document.getElementById('doc-name').value = '';
  document.getElementById('doc-url').value  = '';
  document.getElementById('doc-type').value = 'pdf';
  openModal('modal-document');
}

function saveDocument() {
  const name = document.getElementById('doc-name').value.trim();
  const url  = document.getElementById('doc-url').value.trim();
  const type = document.getElementById('doc-type').value;
  if (!name || !url) { showToast('Nom et lien requis', 'error'); return; }
  const docs = getData('edu_documents');
  docs.push({ id: genId(), name, url, type });
  saveData('edu_documents', docs);
  closeModal('modal-document');
  renderDocuments();
  showToast('Document ajouté ✅');
}

function deleteDocument(id) {
  if (!confirmDelete('Supprimer ce document ?')) return;
  saveData('edu_documents', getData('edu_documents').filter(d => d.id !== id));
  renderDocuments();
  showToast('Document supprimé');
}
