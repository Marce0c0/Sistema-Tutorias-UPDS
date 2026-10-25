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
    const users = state.users;

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'users', label: 'Usuarios', icon: '👥', permission: 'view.users' },
      { id: 'courses', label: 'Cursos', icon: '📚' },
      { id: 'tutorias', label: 'Tutorías', icon: '🎓' },
      { id: 'bookings', label: 'Reservas', icon: '📅' },
      { id: 'forums', label: 'Foro de Dudas', icon: '💬' },
      {
        id: 'notifications',
        label: 'Notificaciones',
        icon: '🔔',
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

          <!-- Selector de Rol para la Sesión de Demostración -->
          <div class="user-session-box">
            <span class="session-label">Vista como:</span>
            <select id="session-role-select" class="session-select" aria-label="Seleccionar rol de la sesión">
              ${ROLES.map((r) => {
                const available = users.some((u) => u.role === r.id);
                return `<option value="${r.id}" ${activeUser?.role === r.id ? 'selected' : ''} ${available ? '' : 'disabled'}>${r.label}</option>`;
              }).join('')}
            </select>
            <span class="session-label" title="Usuario de demostración asociado al rol">${activeUser?.name || 'Sin sesión'}</span>
            <button id="config-api-btn" class="btn-icon" title="Configuración de Servidor API">⚙️</button>
          </div>

          <!-- Botón Menú Móvil -->
          <button id="mobile-menu-toggle" class="mobile-toggle" aria-label="Abrir menú">☰</button>
        </div>

        <!-- Barra de Navegación por Pestañas -->
        <nav class="nav-bar" id="app-nav-bar">
          <ul class="nav-list">
            ${navItems.map((item) => `
              <li class="nav-item">
                <button class="nav-btn ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
                  <span class="nav-icon">${item.icon}</span>
                  <span class="nav-label">${item.label}</span>
                  ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </button>
              </li>
            `).join('')}
          </ul>
        </nav>
      </header>
    `;

    // Eventos
    container.querySelector('#brand-home-btn').addEventListener('click', () => {
      store.setView('dashboard');
    });

    // Pestañas
    container.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        store.setView(view);
        // Cerrar menú móvil si está abierto
        container.querySelector('#app-nav-bar').classList.remove('open');
      });
    });

    // Cambio de rol (toma un usuario representativo de ese rol)
    const roleSelect = container.querySelector('#session-role-select');
    roleSelect.addEventListener('change', (e) => {
      const role = e.target.value;
      const found = users.find((u) => u.role === role);
      if (!found) {
        Toast.warning(`No hay usuarios con rol ${role} registrados.`);
        return;
      }
      store.setActiveUser(found);
      // La bandeja pudo quedar filtrada por otro usuario: recargar sin filtro
      api.notifications.getAll().then((list) => store.setNotifications(list)).catch(() => {});
      Toast.info(`Vista cambiada a: ${ROLES.find((r) => r.id === role).label} — ${found.name}`);
    });

    // Toggle menú móvil
    const mobileToggle = container.querySelector('#mobile-menu-toggle');
    const navBar = container.querySelector('#app-nav-bar');
    mobileToggle.addEventListener('click', () => {
      navBar.classList.toggle('open');
    });

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
};
