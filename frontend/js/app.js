// Controlador Principal y Enrutador SPA — Sistema-Tutoriales-UPDS
import { safeStorage, safeSession } from './config/env.js';
import { store } from './state/store.js';
import { api } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Toast } from './components/Toast.js';
import { Skeleton } from './components/Skeleton.js';
import { WelcomeView } from './views/WelcomeView.js';
import { DashboardView } from './views/DashboardView.js';
import { UsersView } from './views/UsersView.js';
import { CoursesView } from './views/CoursesView.js';
import { EventsView, getStoredEvents } from './views/EventsView.js';
import { BookingsView } from './views/BookingsView.js';
import { ForumsView } from './views/ForumsView.js';
import { NotificationsView } from './views/NotificationsView.js';
import { NotFoundView } from './views/NotFoundView.js';
import { can } from './utils/permissions.js';

class App {
  constructor() {
    this.navContainer = document.getElementById('navbar-mount');
    this.mainContainer = document.getElementById('main-content-mount');
    this.loadingOverlay = document.getElementById('app-loading-overlay');
    this._currentView = null;
    this._currentUserRole = null;
  }

  async init() {
    console.log('🚀 Inicializando frontend del Sistema-Tutoriales-UPDS (Seguridad, Modo Invitado & Skeletons)...');

    // Manejar cambios de ruta / hash en el navegador
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Suscribir renderizador al Store reactivo
    store.subscribe((state) => {
      this.render(state);
    });

    // Si ya inicializó en esta sesión (F5 / recarga), pintar de inmediato los Skeletons de la vista activa
    const isAlreadyInitialized = safeSession.getItem('app_initialized') === 'true';
    if (isAlreadyInitialized && this.mainContainer) {
      const targetHash = (typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').trim() : '');
      const activeView = targetHash || store.getState().currentView || 'dashboard';
      this.mainContainer.innerHTML = Skeleton.renderViewSkeleton(activeView);
      if (this.navContainer) {
        Navbar.render(this.navContainer);
      }
    }

    // Cargar datos iniciales desde el backend REST
    await this.loadInitialData();

    // Iniciar sondeo inteligente de notificaciones en segundo plano (0 lag)
    this.startNotificationsPolling();
  }

  startNotificationsPolling() {
    if (this._pollingInterval) clearInterval(this._pollingInterval);

    const checkNotifications = async () => {
      const state = store.getState();
      const user = state.activeUser;
      if (!user || user.role === 'guest' || document.visibilityState !== 'visible') {
        return;
      }
      try {
        const fresh = await api.notifications.getAll(user.id);
        if (Array.isArray(fresh)) {
          const current = store.getState().notifications || [];
          const hasChanged =
            fresh.length !== current.length ||
            fresh.some((f, idx) => f.id !== current[idx]?.id || f.isRead !== current[idx]?.isRead);
          if (hasChanged) {
            store.setNotifications(fresh);
          }
        }
      } catch (err) {
        // Silencioso en fondo
      }
    };

    // Polling ligero cada 15 segundos
    this._pollingInterval = setInterval(checkNotifications, 15000);

    // Consulta inmediata si el usuario regresa de otra pestaña a la aplicación UPDS
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkNotifications();
      }
    });
  }

  handleHashChange() {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (!raw) return;
    if (raw === 'tutorias') {
      store.setView('courses');
      return;
    }
    const knownViews = ['welcome', 'dashboard', 'users', 'courses', 'events', 'bookings', 'forums', 'notifications'];
    if (knownViews.includes(raw)) {
      if (store.getState().currentView !== raw) {
        const ok = store.setView(raw);
        if (!ok) {
          const state = store.getState();
          const fallback = !state.activeUser ? 'welcome' : (state.activeUser.role === 'guest' ? 'courses' : 'dashboard');
          store.setView(fallback);
        }
      }
    } else {
      store.setState({ currentView: '404', lastInvalidRoute: raw });
    }
  }

  async loadInitialData() {
    // Si ya inicializó en esta sesión, no bloquear con el splash overlay y pintar skeletons
    const isAlreadyInitialized = safeSession.getItem('app_initialized') === 'true';
    if (!isAlreadyInitialized) {
      this.showLoading(true);
    } else {
      this.showLoading(false);
      if (this.mainContainer && (!this.mainContainer.innerHTML || this.mainContainer.innerHTML.trim() === '')) {
        const targetHash = (typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').trim() : '');
        const activeView = targetHash || store.getState().currentView || 'dashboard';
        this.mainContainer.innerHTML = Skeleton.renderViewSkeleton(activeView);
      }
    }

    try {
      // Limpiar residuo persistente legacy en localStorage si existiera
      safeStorage.removeItem('guestMode');

      const storedToken = safeStorage.getItem('token');
      if (storedToken) {
        safeSession.removeItem('guestMode');
      }
      const isGuest = !storedToken && safeSession.getItem('guestMode') === 'true';
      const rawHash = (typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').trim() : '');

      let initialUser = null;

      // 1. Cargar datos públicos y validar JWT concurrentemente
      const [courses, tutorias, forums, authRes] = await Promise.all([
        api.courses.getAll().catch(() => []),
        api.tutorias.getAll().catch(() => []),
        api.forums.getAll().catch(() => []),
        storedToken ? api.auth.getMe().catch(() => null) : Promise.resolve(null),
      ]);

      if (courses && courses.length > 0) {
        safeStorage.setItem('upds_courses_cache_v1', JSON.stringify(courses));
      }
      if (tutorias && tutorias.length > 0) {
        safeStorage.setItem('upds_tutorias_cache_v1', JSON.stringify(tutorias));
      }

      if (authRes?.user) {
        initialUser = authRes.user;
        safeStorage.setItem('authUser', JSON.stringify(authRes.user));
      } else if (storedToken) {
        // Token caducado o inválido
        safeStorage.removeItem('token');
        safeStorage.removeItem('authUser');
      }

      // Si no hay usuario JWT, pero la URL pide #courses, #events o ya está en modo invitado:
      const publicViews = ['courses', 'events', 'tutorias'];
      const rawCandidate = rawHash === 'tutorias' ? 'courses' : rawHash;

      if (!initialUser && !storedToken && (isGuest || publicViews.includes(rawCandidate))) {
        initialUser = {
          id: 'guest',
          name: 'Invitado',
          email: 'invitado@upds.edu.bo',
          role: 'guest',
        };
        safeSession.setItem('guestMode', 'true');
      }

      // 2. Pedir datos protegidos solo para usuarios autenticados reales
      let users = [];
      let bookings = [];
      let notifications = [];
      if (initialUser && initialUser.role !== 'guest') {
        const protectedData = await Promise.all([
          api.users.getAll().catch(() => []),
          api.bookings.getAll().catch(() => []),
          api.notifications.getAll(initialUser.id).catch(() => []),
        ]);
        users = protectedData[0] || [];
        bookings = protectedData[1] || [];
        notifications = protectedData[2] || [];
      }

      // 3. Determinar la vista activa respetando el hash actual (ej. #events o #courses)
      let initialView = 'welcome';
      const knownViews = ['dashboard', 'users', 'courses', 'events', 'bookings', 'forums', 'notifications'];

      if (initialUser) {
        let candidateHash = rawHash === 'tutorias' ? 'courses' : rawHash;
        if (candidateHash && knownViews.includes(candidateHash) && can(initialUser.role, `view.${candidateHash}`)) {
          initialView = candidateHash;
        } else {
          initialView = initialUser.role === 'guest' ? 'courses' : 'dashboard';
        }
      } else {
        // Inicio frío sin credenciales: Pantalla de Login / Bienvenida ("inicio inicio")
        initialView = 'welcome';
      }

      if (window.location.hash !== '#' + initialView) {
        window.location.hash = '#' + initialView;
      }

      store.setState({
        users,
        courses: (courses && courses.length > 0) ? courses : store.getState().courses,
        tutorias: (tutorias && tutorias.length > 0) ? tutorias : store.getState().tutorias,
        bookings,
        forums: forums || [],
        notifications,
        events: getStoredEvents(),
        activeUser: initialUser,
        currentView: initialView,
        isLoading: false,
      });

      safeSession.setItem('app_initialized', 'true');
    } catch (err) {
      console.error('[Error de Carga Inicial]:', err);
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
    // 1. Renderizar Barra de Navegación (siempre actualiza campana y badge de alertas)
    if (this.navContainer) {
      Navbar.render(this.navContainer);
    }

    // 2. Renderizar Vista Activa
    if (this.mainContainer) {
      // Si la vista solicitada es 404, mostrarla directamente dando feedback interactivo
      if (state.currentView === '404') {
        this._currentView = '404';
        this.mainContainer.innerHTML = '';
        this.mainContainer.appendChild(NotFoundView.render(state.lastInvalidRoute));
        return;
      }

      // Si no hay usuario activo, permitir navegación directa a cursos y eventos en modo invitado
      if (!state.activeUser) {
        const hasToken = !!safeStorage.getItem('token');
        if (!hasToken && (state.currentView === 'courses' || state.currentView === 'events')) {
          store.setActiveUser({
            id: 'guest',
            name: 'Invitado',
            email: 'invitado@upds.edu.bo',
            role: 'guest',
          });
          safeSession.setItem('guestMode', 'true');
          return;
        }
        this._currentView = 'welcome';
        this.mainContainer.innerHTML = '';
        this.mainContainer.appendChild(WelcomeView.render());
        return;
      }

      // Si la vista activa y el rol no cambiaron, no destruir el DOM; permitir actualizaciones internas fluidas
      if (this._currentView === state.currentView && this._currentUserRole === state.activeUser?.role) {
        if (state.currentView === 'notifications' && NotificationsView._renderList) {
          NotificationsView._renderList();
        }
        return;
      }

      this._currentView = state.currentView;
      this._currentUserRole = state.activeUser?.role;
      this.mainContainer.innerHTML = '';

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
          viewElement = CoursesView.render();
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

// Iniciar aplicación al cargar el DOM de forma segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}
