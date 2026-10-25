// Controlador Principal y Enrutador SPA — Sistema-Tutoriales-UPDS
import { store } from './state/store.js';
import { api } from './services/api.js';
import { Navbar } from './components/Navbar.js?v=3';
import { Toast } from './components/Toast.js';
import { DashboardView } from './views/DashboardView.js';
import { UsersView } from './views/UsersView.js';
import { CoursesView } from './views/CoursesView.js';
import { TutoriasView } from './views/TutoriasView.js';
import { BookingsView } from './views/BookingsView.js';
import { ForumsView } from './views/ForumsView.js';
import { NotificationsView } from './views/NotificationsView.js';

class App {
  constructor() {
    this.navContainer = document.getElementById('navbar-mount');
    this.mainContainer = document.getElementById('main-content-mount');
    this.loadingOverlay = document.getElementById('app-loading-overlay');
  }

  async init() {
    console.log('🚀 Inicializando frontend del Sistema-Tutoriales-UPDS...');

    // Suscribir renderizador al Store
    store.subscribe((state) => {
      this.render(state);
    });

    // Cargar datos iniciales desde el backend REST
    await this.loadInitialData();
  }

  async loadInitialData() {
    this.showLoading(true);
    try {
      const [users, courses, tutorias, bookings, forums, notifications] = await Promise.all([
        api.users.getAll().catch(() => []),
        api.courses.getAll().catch(() => []),
        api.tutorias.getAll().catch(() => []),
        api.bookings.getAll().catch(() => []),
        api.forums.getAll().catch(() => []),
        api.notifications.getAll().catch(() => []),
      ]);

      store.setState({
        users,
        courses,
        tutorias,
        bookings,
        forums,
        notifications,
        // Identidad de demostración por defecto (primer usuario del seed)
        activeUser: store.getState().activeUser || users[0] || null,
        isLoading: false,
      });

      Toast.success('Datos sincronizados con éxito desde la API REST.');
    } catch (err) {
      console.error('[Error de Carga Inicial]:', err);
      Toast.error(`No se pudo conectar a la API: ${err.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    if (this.loadingOverlay) {
      if (show) {
        this.loadingOverlay.classList.remove('hidden');
      } else {
        this.loadingOverlay.classList.add('hidden');
      }
    }
  }

  render(state) {
    // 1. Renderizar Barra de Navegación
    if (this.navContainer) {
      Navbar.render(this.navContainer);
    }

    // 2. Renderizar Vista Activa
    if (this.mainContainer) {
      this.mainContainer.innerHTML = '';

      let viewElement = null;
      switch (state.currentView) {
        case 'dashboard':
          viewElement = DashboardView.render();
          break;
        case 'users':
          viewElement = UsersView.render();
          break;
        case 'courses':
          viewElement = CoursesView.render();
          break;
        case 'tutorias':
          viewElement = TutoriasView.render();
          break;
        case 'bookings':
          viewElement = BookingsView.render();
          break;
        case 'forums':
          viewElement = ForumsView.render();
          break;
        case 'notifications':
          viewElement = NotificationsView.render();
          break;
        default:
          viewElement = DashboardView.render();
      }

      if (viewElement) {
        this.mainContainer.appendChild(viewElement);
      }
    }
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
