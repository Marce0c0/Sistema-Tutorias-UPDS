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
          <!-- Bloque Superior Izquierdo: Marca UPDS, Modo Activo e Iniciar Sesión -->
          <div class="header-left-cluster" style="display:flex; align-items:center; gap:0.85rem; flex-wrap:wrap;">
            <!-- Logo Institucional UPDS (Clic para volver al Inicio) -->
            <div class="brand-area" id="brand-home-btn" role="button" tabindex="0" title="Volver al Inicio UPDS">
              <div class="brand-logo-card">
                <img src="img/upds-logo.png" alt="Universidad Privada Domingo Savio" class="brand-logo-img" />
              </div>
              <div class="brand-text">
                <span class="brand-title">Tutorías Universitarias</span>
                <span class="brand-subtitle">Universidad Privada Domingo Savio</span>
              </div>
            </div>

            <!-- Modo Activo e Iniciar Sesión (Arriba a la Izquierda) -->
            <div class="header-status-box" style="display:flex; align-items:center; gap:0.45rem;">
              ${
                isGuest
                  ? `
                  <span class="role-tag" style="background:#475569;color:#ffffff;font-size:0.72rem;font-weight:700;">MODO INVITADO</span>
                  <button id="headbar-login-btn" class="btn btn-sm btn-primary" style="background:#004b93;border-color:#004b93;color:#ffffff;font-size:0.78rem;">
                    🔑 Iniciar Sesión
                  </button>
                `
                  : isAuthenticated
                  ? `
                  <div class="auth-user-badge">
                    <span class="role-tag role-${activeUser.role}">${ROLES.find((r) => r.id === activeUser.role)?.label || activeUser.role}</span>
                    <span class="session-label" title="${activeUser.email}">👤 ${activeUser.name}</span>
                  </div>
                `
                  : ''
              }
            </div>
          </div>

          <!-- Bloque Superior Derecho: Controles y Salir -->
          <div class="header-right-cluster" style="display:flex; align-items:center; gap:0.5rem;">
            ${
              isAuthenticated
                ? `<button id="logout-btn" class="btn btn-sm btn-secondary" title="Cerrar Sesión JWT">Salir</button>`
                : isWelcome
                ? `<button id="headbar-guest-btn" class="btn btn-sm btn-outline" style="color:#ffffff;border-color:rgba(255,255,255,0.35);background:rgba(255,255,255,0.1);">🌐 Modo Invitado</button>`
                : ''
            }
            <!-- Botón Menú Móvil -->
            ${navItems.length > 0 ? `<button id="mobile-menu-toggle" class="mobile-toggle" aria-label="Abrir menú">☰</button>` : ''}
          </div>
        </div>

        <!-- Barra de Navegación por Pestañas (Centrada Arriba al Medio) -->
        ${
          navItems.length > 0
            ? `
        <nav class="nav-bar" id="app-nav-bar">
          <ul class="nav-list" style="justify-content:center;">
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
    // Clic en Logo Superior Izquierdo: Volver al Inicio
    container.querySelector('#brand-home-btn').addEventListener('click', () => {
      if (activeUser && activeUser.role !== 'guest') {
        store.setView('dashboard');
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

    // Botón de acceso a Modo Invitado desde el headbar
    const headbarGuestBtn = container.querySelector('#headbar-guest-btn');
    if (headbarGuestBtn) {
      headbarGuestBtn.addEventListener('click', () => {
        localStorage.setItem('guestMode', 'true');
        store.setActiveUser({
          id: 'guest',
          name: 'Invitado UPDS',
          email: 'invitado@upds.net',
          role: 'guest',
        });
        store.setView('courses');
        Toast.info('Explorando el catálogo en Modo Invitado.');
      });
    }

    // Login Modal desde el headbar (Modo Invitado)
    const headbarLoginBtn = container.querySelector('#headbar-login-btn');
    if (headbarLoginBtn) {
      headbarLoginBtn.addEventListener('click', () => {
        this.openLoginModal();
      });
    }

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

    // Utilitario silencioso para consola de desarrollo si se necesita cambiar URL
    window.setBackendUrl = (url) => {
      if (url && typeof url === 'string') {
        ENV.setApiUrl(url.trim());
      }
    };
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
