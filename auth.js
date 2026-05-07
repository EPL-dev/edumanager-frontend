// =============================================
//  auth.js — Authentification & Rôles (v2)
//  Rôles : superadmin > admin > etudiant
// =============================================

function initUsers() {
  if (!localStorage.getItem("edu_users")) {
    const defaultUsers = [
      {
        id: 1,
        username: "superadmin",
        password: hashPassword("super123"),
        role: "superadmin",
        nom: "Super Administrateur",
        email: "superadmin@edu.com",
        createdAt: new Date().toLocaleDateString("fr-FR"),
      },
      {
        id: 2,
        username: "admin",
        password: hashPassword("admin123"),
        role: "admin",
        nom: "Administrateur",
        email: "admin@edu.com",
        createdAt: new Date().toLocaleDateString("fr-FR"),
      },
      {
        id: 3,
        username: "etudiant",
        password: hashPassword("etud123"),
        role: "etudiant",
        nom: "Étudiant Test",
        email: "etudiant@edu.com",
        createdAt: new Date().toLocaleDateString("fr-FR"),
      },
    ];
    localStorage.setItem("edu_users", JSON.stringify(defaultUsers));
  }
}

function hashPassword(password) {
  const salt = "edumanager_2024_";
  return btoa(salt + password);
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showLoginError("Veuillez remplir tous les champs");
    return;
  }

  initUsers();
  const users = JSON.parse(localStorage.getItem("edu_users"));
  const user = users.find((u) => u.username === username);

  if (!user || !verifyPassword(password, user.password)) {
    showLoginError("Nom d'utilisateur ou mot de passe incorrect");
    return;
  }

  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    nom: user.nom,
  };
  sessionStorage.setItem("edu_current_user", JSON.stringify(session));
  window.location.href = "dashboard.html";
}

function showLoginError(msg) {
  const errorDiv = document.getElementById("login-error");
  const errorMsg = document.getElementById("login-error-msg");
  if (errorMsg) errorMsg.textContent = msg;
  if (errorDiv) errorDiv.classList.remove("hidden");
}

function handleLogout() {
  sessionStorage.removeItem("edu_current_user");
  window.location.href = "index.html";
}

function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

function getCurrentUser() {
  const data = sessionStorage.getItem("edu_current_user");
  return data ? JSON.parse(data) : null;
}

function applyRole(user) {
  document.body.classList.add("role-" + user.role);
  if (user.role === "superadmin") document.body.classList.add("role-admin");

  const roleLabels = {
    superadmin: "👑 Super Admin",
    admin: "🔑 Admin",
    etudiant: "🎓 Étudiant",
  };

  const nameEl = document.getElementById("user-display-name");
  const roleEl = document.getElementById("user-display-role");
  const topbarRole = document.getElementById("topbar-role");

  if (nameEl) nameEl.textContent = user.nom || user.username;
  if (roleEl) roleEl.textContent = roleLabels[user.role] || user.role;
  if (topbarRole) {
    topbarRole.textContent = roleLabels[user.role] || user.role;
    topbarRole.className = `role-badge role-badge-${user.role}`;
  }
}

const toggleBtn = document.getElementById("toggle-pw");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const pwInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");
    if (pwInput.type === "password") {
      pwInput.type = "text";
      eyeIcon.className = "fas fa-eye-slash";
    } else {
      pwInput.type = "password";
      eyeIcon.className = "fas fa-eye";
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.getElementById("btn-login")) handleLogin();
});
