// Componente de Navegación Principal — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { ENV } from '../config/env.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { can } from '../utils/permissions.js';

const ROLES = [
  { id: 'student', label: 'Estudiante' },
  { id: 'tutor', label: 'Tutor Docente' },
  { id: 'admin', label: 'Administrador' },
];

export const Navbar = {
  render(container) {
    const state = store.getState();
    const activeUser = state.activeUser;
    const token = localStorage.getItem('token');
    const isAuthenticated = !!(token && activeUser && activeUser.role !== 'guest');
    const isGuest = activeUser?.role === 'guest';
    const isWelcome = !activeUser;

    const navItems = isWelcome
      ? []
      : [
          { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: 'view.dashboard' },
          { id: 'users', label: 'Usuarios', icon: '👥', permission: 'view.users' },
          { id: 'courses', label: 'Cursos & Talleres', icon: '📚', permission: 'view.courses' },
          { id: 'tutorias', label: 'Tutorías', icon: '🎓', permission: 'view.tutorias' },
          { id: 'events', label: 'Eventos & Hackathons', icon: '🏆', permission: 'view.events' },
          { id: 'bookings', label: 'Reservas', icon: '📅', permission: 'view.bookings' },
          { id: 'forums', label: 'Foro de Dudas', icon: '💬', permission: 'view.forums' },
          {
            id: 'notifications',
            label: 'Notificaciones',
            icon: '🔔',
            permission: 'view.notifications',
            badge: state.stats.unreadNotifications > 0 ? state.stats.unreadNotifications : null,
          },
        ].filter((item) => !item.permission || can(activeUser?.role, item.permission));

    const currentView = state.currentView;

    container.innerHTML = `
      <header class="app-header">
        <div class="header-container">
          <!-- Marca UPDS Oficial -->
          <div class="brand-area" id="brand-home-btn" role="button" tabindex="0">
            <div class="brand-logo-card">
              <img src="img/upds-logo.png" alt="Universidad Privada Domingo Savio" class="brand-logo-img" />
            </div>
            <div class="brand-text">
              <span class="brand-title">Tutorías Universitarias</span>
              <span class="brand-subtitle">Universidad Privada Domingo Savio</span>
            </div>
          </div>

          <!-- Área de Autenticación y Sesión JWT -->
          <div class="user-session-box">
            ${
              isAuthenticated
                ? `
                <div class="auth-user-badge">
                  <span class="role-tag role-${activeUser.role}">${ROLES.find((r) => r.id === activeUser.role)?.label || activeUser.role}</span>
                  <span class="session-label" title="${activeUser.email}">👤 ${activeUser.name}</span>
                  <button id="logout-btn" class="btn btn-sm btn-secondary" title="Cerrar Sesión JWT">Salir</button>
                </div>
              `
                : isGuest
                ? `
                <div class="auth-user-badge">
                  <span class="role-tag" style="background:#475569;color:#fff;">MODO INVITADO</span>
                  <button id="open-login-btn" class="btn btn-sm btn-primary" style="background:#002855;border-color:#002855;color:#fff;">
                    🔑 Iniciar Sesión
                  </button>
                  <button id="logout-btn" class="btn btn-sm btn-secondary" title="Volver al Inicio">Inicio</button>
                </div>
              `
                : `
                <button id="open-login-btn" class="btn btn-sm btn-primary" style="background:#002855;border-color:#002855;color:#fff;">
                  🔑 Iniciar Sesión (JWT)
                </button>
              `
            }
            <button id="config-api-btn" class="btn-icon" title="Configuración de Servidor API">⚙️</button>
          </div>

          <!-- Botón Menú Móvil -->
          ${navItems.length > 0 ? `<button id="mobile-menu-toggle" class="mobile-toggle" aria-label="Abrir menú">☰</button>` : ''}
        </div>

        <!-- Barra de Navegación por Pestañas -->
        ${
          navItems.length > 0
            ? `
        <nav class="nav-bar" id="app-nav-bar">
          <ul class="nav-list">
            ${navItems
              .map(
                (item) => `
              <li class="nav-item">
                <button class="nav-btn ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
                  <span class="nav-icon">${item.icon}</span>
                  <span class="nav-label">${item.label}</span>
                  ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </button>
              </li>
            `
              )
              .join('')}
          </ul>
        </nav>
        `
            : ''
        }
      </header>
    `;

    // ─── Eventos ─────────────────────────────────────────────────────────────
    container.querySelector('#brand-home-btn').addEventListener('click', () => {
      if (activeUser && activeUser.role !== 'guest') {
        store.setView('dashboard');
      } else if (isGuest) {
        store.setView('courses');
      } else {
        store.setView('welcome');
      }
    });

    // Pestañas
    container.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        store.setView(view);
        const navBar = container.querySelector('#app-nav-bar');
        if (navBar) navBar.classList.remove('open');
      });
    });

    // Logout / Salir
    const logoutBtn = container.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        localStorage.removeItem('guestMode');
        store.setActiveUser(null);
        store.setView('welcome');
        Toast.info('Has vuelto a la pantalla de inicio.');
      });
    }

    // Login Modal
    const openLoginBtn = container.querySelector('#open-login-btn');
    if (openLoginBtn) {
      openLoginBtn.addEventListener('click', () => {
        this.openLoginModal();
      });
    }

    // Toggle menú móvil
    const mobileToggle = container.querySelector('#mobile-menu-toggle');
    if (mobileToggle) {
      const navBar = container.querySelector('#app-nav-bar');
      mobileToggle.addEventListener('click', () => {
        if (navBar) navBar.classList.toggle('open');
      });
    }

    // Configurar Endpoint API
    container.querySelector('#config-api-btn').addEventListener('click', () => {
      const currentUrl = ENV.getApiUrl();
      Modal.open({
        title: 'Configuración de Conexión API',
        content: `
          <div class="form-group">
            <label class="form-label" for="api-url-input">URL Base del Servidor Backend:</label>
            <input type="url" id="api-url-input" class="form-control" value="${currentUrl}" placeholder="http://localhost:3001" required />
            <small class="form-help">Por defecto apunta a <code>http://localhost:3001</code>. Puede configurarse hacia una IP de red local o DNS en la nube.</small>
          </div>
        `,
        confirmText: 'Guardar y Recargar',
        onConfirm: (dialog) => {
          const input = dialog.querySelector('#api-url-input');
          if (input && input.value.trim()) {
            ENV.setApiUrl(input.value.trim());
          }
        },
      });
    });
  },

  openLoginModal() {
    Modal.open({
      title: 'Iniciar Sesión — Autenticación JWT',
      content: `
        <form id="login-modal-form" class="form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="login-email">Correo Institucional:</label>
            <input type="email" id="login-email" class="form-control" placeholder="admin@upds.edu.bo" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Contraseña:</label>
            <input type="password" id="login-password" class="form-control" placeholder="••••••••" required />
          </div>

          <div style="background:#f0f4f8;border-left:4px solid #002855;padding:10px;border-radius:4px;margin-bottom:12px;font-size:0.85rem;">
            <strong>Cuentas Semilla de Prueba (Clave: <code>Upds2026</code>):</strong><br/>
            • <a href="#" class="quick-fill-auth" data-email="admin@upds.edu.bo">admin@upds.edu.bo</a> (Admin)<br/>
            • <a href="#" class="quick-fill-auth" data-email="maria@tutor.com">maria@tutor.com</a> (Tutor)<br/>
            • <a href="#" class="quick-fill-auth" data-email="juan@estudiante.com">juan@estudiante.com</a> (Estudiante)
          </div>
        </form>
      `,
      confirmText: 'Ingresar',
      cancelText: 'Cancelar',
      onConfirm: async (dialog) => {
        const emailInput = dialog.querySelector('#login-email');
        const passInput = dialog.querySelector('#login-password');
        const email = emailInput?.value.trim();
        const password = passInput?.value;

        if (!email || !password) {
          Toast.warning('Complete todos los campos.');
          return;
        }

        try {
          const res = await api.auth.login({ email, password });
          if (res.token && res.user) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('authUser', JSON.stringify(res.user));
            localStorage.removeItem('guestMode');
            store.setActiveUser(res.user);
            store.setView('dashboard');
            Toast.success(`Bienvenido/a ${res.user.name} (${res.user.role})`);
            // Recargar datos protegidos
            api.users.getAll().then((list) => store.setUsers(list)).catch(() => {});
            api.notifications.getAll().then((list) => store.setNotifications(list)).catch(() => {});
          }
        } catch (err) {
          Toast.error(err.message || 'Error al autenticar.');
        }
      },
    });

    // Enlazar autofill para cuentas rápidas con Upds2026
    setTimeout(() => {
      document.querySelectorAll('.quick-fill-auth').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('login-email');
          const passInput = document.getElementById('login-password');
          if (emailInput && passInput) {
            emailInput.value = link.getAttribute('data-email');
            passInput.value = 'Upds2026';
          }
        });
      });
    }, 100);
  },
};
