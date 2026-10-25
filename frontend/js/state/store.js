// Gestor de Estado Global (Store) Reactivo — Sistema-Tutoriales-UPDS
// Maneja el estado en memoria para las 6 entidades, usuario activo y suscriptores de eventos
import { can } from '../utils/permissions.js';

class Store {
  constructor() {
    this.state = {
      currentView: 'dashboard',
      activeUser: null, // Usuario simulado en sesión
      users: [],
      courses: [],
      tutorias: [],
      bookings: [],
      forums: [],
      notifications: [],
      stats: {
        totalUsers: 0,
        totalCourses: 0,
        activeTutorias: 0,
        totalBookings: 0,
        unreadNotifications: 0,
      },
      filters: {
        forumCourseId: '',
        notificationUserId: '',
        userRole: '',
      },
      isLoading: false,
      lastError: null,
    };

    this.listeners = new Set();
  }

  // Suscribirse a cambios en el estado
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notificar a todos los componentes suscritos
  notify() {
    this.recalculateStats();
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[Store Listener Error]:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  // Punto único de control de navegación: rechaza vistas no permitidas por el rol
  setView(viewName) {
    if (!can(this.state.activeUser?.role, `view.${viewName}`)) return false;
    this.state.currentView = viewName;
    this.notify();
    return true;
  }

  setActiveUser(user) {
    this.state.activeUser = user;
    this.state.filters.notificationUserId = '';
    if (!can(user?.role, `view.${this.state.currentView}`)) {
      this.state.currentView = 'dashboard';
    }
    this.notify();
  }

  setLoading(isLoading) {
    this.state.isLoading = isLoading;
    this.notify();
  }

  // Recalcular métricas de dashboard
  recalculateStats() {
    const { users, courses, tutorias, bookings, notifications, activeUser } = this.state;
    const seesAllNotifications = can(activeUser?.role, 'notifications.viewAll');
    this.state.stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      activeTutorias: tutorias.filter((t) => t.status === 'active').length,
      totalBookings: bookings.length,
      unreadNotifications: notifications.filter(
        (n) => !n.isRead && (seesAllNotifications || n.userId === activeUser?.id)
      ).length,
    };
  }

  // Mutaciones atómicas para cada entidad
  setUsers(users) {
    this.state.users = users;
    // Resincronizar identidad activa: su rol pudo cambiar al editarla
    this.state.activeUser = users.find((u) => u.id === this.state.activeUser?.id) || users[0] || null;
    if (!can(this.state.activeUser?.role, `view.${this.state.currentView}`)) {
      this.state.currentView = 'dashboard';
    }
    this.notify();
  }

  setCourses(courses) {
    this.state.courses = courses;
    this.notify();
  }

  setTutorias(tutorias) {
    this.state.tutorias = tutorias;
    this.notify();
  }

  setBookings(bookings) {
    this.state.bookings = bookings;
    this.notify();
  }

  setForums(forums) {
    this.state.forums = forums;
    this.notify();
  }

  setNotifications(notifications) {
    this.state.notifications = notifications;
    this.notify();
  }
}

export const store = new Store();
