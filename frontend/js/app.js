// Controlador Principal y Enrutador SPA — Sistema-Tutoriales-UPDS
import { store } from './state/store.js';
import { api } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Toast } from './components/Toast.js';
import { WelcomeView } from './views/WelcomeView.js';
import { DashboardView } from './views/DashboardView.js';
import { UsersView } from './views/UsersView.js';
import { CoursesView } from './views/CoursesView.js';
import { TutoriasView } from './views/TutoriasView.js';
import { EventsView, getStoredEvents } from './views/EventsView.js';
import { BookingsView } from './views/BookingsView.js';
import { ForumsView } from './views/ForumsView.js';
import { NotificationsView } from './views/NotificationsView.js';
import { NotFoundView } from './views/NotFoundView.js';

class App {
  constructor() {
    this.navContainer = document.getElementById('navbar-mount');
    this.mainContainer = document.getElementById('main-content-mount');
    this.loadingOverlay = document.getElementById('app-loading-overlay');
  }

  async init() {
    console.log('🚀 Inicializando frontend del Sistema-Tutoriales-UPDS (Seguridad & Modo Invitado)...');

    // Manejar cambios de ruta / hash en el navegador
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Suscribir renderizador al Store reactivo
    store.subscribe((state) => {
      this.render(state);
    });

    // Cargar datos iniciales desde el backend REST
    await this.loadInitialData();
  }

  handleHashChange() {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (!raw) return;
    const knownViews = ['welcome', 'dashboard', 'users', 'courses', 'tutorias', 'events', 'bookings', 'forums', 'notifications'];
    if (knownViews.includes(raw)) {
      store.setView(raw);
    } else {
      store.setState({ currentView: '404', lastInvalidRoute: raw });
    }
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

      // 1. Verificar si existe token JWT activo guardado
      let initialUser = null;
      let initialView = 'welcome';
      const storedToken = localStorage.getItem('token');
      const isGuest = localStorage.getItem('guestMode') === 'true';

      if (storedToken) {
        try {
          const authRes = await api.auth.getMe();
          if (authRes?.user) {
            initialUser = authRes.user;
            initialView = 'dashboard';
          }
        } catch (_err) {
          localStorage.removeItem('token');
          localStorage.removeItem('authUser');
        }
      } else if (isGuest) {
        initialUser = {
          id: 'guest',
          name: 'Invitado',
          email: 'invitado@upds.edu.bo',
          role: 'guest',
        };
        initialView = 'courses';
      }

      store.setState({
        users,
        courses,
        tutorias,
        bookings,
        forums,
        notifications,
        events: getStoredEvents(),
        activeUser: initialUser,
        currentView: initialView,
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

      // Si la vista solicitada es 404, mostrarla directamente dando feedback interactivo
      if (state.currentView === '404') {
        this.mainContainer.appendChild(NotFoundView.render(state.lastInvalidRoute));
        return;
      }

      // Si no hay usuario ni modo invitado activo, mostrar la pantalla de bienvenida / login
      if (!state.activeUser) {
        this.mainContainer.appendChild(WelcomeView.render());
        return;
      }

      let viewElement = null;
      switch (state.currentView) {
        case 'welcome':
          viewElement = WelcomeView.render();
          break;
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
        case 'events':
          viewElement = EventsView.render();
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
        case '404':
          viewElement = NotFoundView.render(state.lastInvalidRoute);
          break;
        default:
          viewElement = NotFoundView.render(state.currentView);
          break;
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
