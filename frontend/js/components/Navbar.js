// Componente de Navegación Principal — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { ENV } from '../config/env.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';

export const Navbar = {
  render(container) {
    const state = store.getState();
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'users', label: 'Usuarios', icon: '👥' },
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
    ];

    const currentView = state.currentView;
    const activeUser = state.activeUser;
    const users = state.users;

    container.innerHTML = `
      <header class="app-header">
        <div class="header-container">
          <!-- Marca UPDS -->
          <div class="brand-area" id="brand-home-btn" role="button" tabindex="0">
            <div class="brand-logo">UPDS</div>
            <div class="brand-text">
              <span class="brand-title">Tutorías Universitarias</span>
              <span class="brand-subtitle">Portal Académico Institucional</span>
            </div>
          </div>

          <!-- Selector de Usuario Activo en Sesión -->
          <div class="user-session-box">
            <span class="session-label">Sesión Activa:</span>
            <select id="session-user-select" class="session-select" aria-label="Seleccionar usuario activo">
              ${users.map((u) => `
                <option value="${u.id}" ${activeUser?.id === u.id ? 'selected' : ''}>
                  ${u.name} (${u.role.toUpperCase()})
                </option>
              `).join('')}
            </select>
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

    // Cambio de usuario activo
    const userSelect = container.querySelector('#session-user-select');
    userSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = users.find((u) => u.id === selectedId);
      if (found) {
        store.setActiveUser(found);
        Toast.info(`Sesión cambiada a: ${found.name} (${found.role})`);
      }
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
