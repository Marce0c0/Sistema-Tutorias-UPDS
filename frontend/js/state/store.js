// Gestor de Estado Global (Store) Reactivo — Sistema-Tutoriales-UPDS
// Maneja el estado en memoria para las 6 entidades, usuario activo y suscriptores de eventos

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

  setView(viewName) {
    this.state.currentView = viewName;
    this.notify();
  }

  setActiveUser(user) {
    this.state.activeUser = user;
    this.notify();
  }

  setLoading(isLoading) {
    this.state.isLoading = isLoading;
    this.notify();
  }

  // Recalcular métricas de dashboard
  recalculateStats() {
    const { users, courses, tutorias, bookings, notifications } = this.state;
    this.state.stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      activeTutorias: tutorias.filter((t) => t.status === 'active').length,
      totalBookings: bookings.length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length,
    };
  }

  // Mutaciones atómicas para cada entidad
  setUsers(users) {
    this.state.users = users;
    // Si no hay activeUser o el activeUser actual ya no existe, asignar el primero
    if (!this.state.activeUser && users.length > 0) {
      this.state.activeUser = users[0];
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
