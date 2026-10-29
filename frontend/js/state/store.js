// Gestor de Estado Global (Store) Reactivo — Sistema-Tutoriales-UPDS
// Maneja el estado en memoria para las 6 entidades, usuario activo y suscriptores de eventos
import { can } from '../utils/permissions.js';
import { safeStorage } from '../config/env.js';

class Store {
  constructor() {
    const user = (() => {
      const token = safeStorage.getItem('token');
      const raw = safeStorage.getItem('authUser');
      if (token && raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.role) return parsed;
        } catch {}
      }
      return null;
    })();

    const initialViewFromHash = (() => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const raw = window.location.hash.replace(/^#\/?/, '').trim();
        const knownViews = ['welcome', 'dashboard', 'users', 'courses', 'events', 'bookings', 'forums', 'notifications'];
        const candidate = raw === 'tutorias' ? 'courses' : raw;
        if (knownViews.includes(candidate)) {
          return candidate;
        }
      }
      return user ? (user.role === 'guest' ? 'courses' : 'dashboard') : 'welcome';
    })();

    this.state = {
      currentView: initialViewFromHash,
      activeUser: user,
      users: [],
      courses: (() => {
        const raw = safeStorage.getItem('upds_courses_cache_v1');
        if (raw) {
          try { return JSON.parse(raw); } catch {}
        }
        return [];
      })(),
      tutorias: (() => {
        const raw = safeStorage.getItem('upds_tutorias_cache_v1');
        if (raw) {
          try { return JSON.parse(raw); } catch {}
        }
        return [];
      })(),
      bookings: [],
      forums: [],
      notifications: (() => {
        if (user && user.id && user.role !== 'guest') {
          const raw = safeStorage.getItem(`upds_notifs_cache_${user.id}`);
          if (raw) {
            try { return JSON.parse(raw); } catch {}
          }
        }
        return [];
      })(),
      events: (() => {
        const raw = safeStorage.getItem('upds_events_v1');
        if (raw) {
          try { return JSON.parse(raw); } catch {}
        }
        return [];
      })(),
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

  // Punto único de control de navegación: rechaza vistas no permitidas por el rol y sincroniza el hash de la URL
  setView(viewName) {
    if (!can(this.state.activeUser?.role, `view.${viewName}`)) return false;
    this.state.currentView = viewName;
    if (typeof window !== 'undefined') {
      const targetHash = '#' + viewName;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
    this.notify();
    return true;
  }

  setActiveUser(user) {
    this.state.activeUser = user;
    this.state.filters.notificationUserId = '';
    if (user && user.role !== 'guest' && user.id) {
      const rawNotifs = safeStorage.getItem(`upds_notifs_cache_${user.id}`);
      if (rawNotifs) {
        try {
          this.state.notifications = JSON.parse(rawNotifs);
        } catch {}
      }
    } else if (!user) {
      this.state.notifications = [];
    }
    if (!user) {
      this.state.currentView = 'welcome';
      if (typeof window !== 'undefined' && window.location.hash !== '#welcome') {
        window.location.hash = '#welcome';
      }
    } else if (!can(user?.role, `view.${this.state.currentView}`)) {
      const fallback = user.role === 'guest' ? 'courses' : 'dashboard';
      this.state.currentView = fallback;
      if (typeof window !== 'undefined' && window.location.hash !== '#' + fallback) {
        window.location.hash = '#' + fallback;
      }
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
    this.state.stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      activeTutorias: tutorias.filter((t) => t.status === 'active').length,
      totalBookings: bookings.length,
      unreadNotifications: activeUser && activeUser.role !== 'guest'
        ? notifications.filter((n) => !Boolean(n.isRead ?? n.is_read) && (n.userId || n.user_id) === activeUser.id).length
        : 0,
    };
  }

  // Mutaciones atómicas para cada entidad
  setUsers(users) {
    this.state.users = users;
    // Resincronizar identidad activa: solo si existe y coincide su ID, nunca suplantar rol
    if (this.state.activeUser && this.state.activeUser.role !== 'guest') {
      const match = users.find((u) => u.id === this.state.activeUser.id);
      if (match) {
        this.state.activeUser = { ...this.state.activeUser, ...match };
        safeStorage.setItem('authUser', JSON.stringify(this.state.activeUser));
      }
    }
    this.notify();
  }

  setCourses(courses) {
    this.state.courses = courses;
    if (courses && courses.length > 0) {
      safeStorage.setItem('upds_courses_cache_v1', JSON.stringify(courses));
    }
    this.notify();
  }

  setTutorias(tutorias) {
    this.state.tutorias = tutorias;
    if (tutorias && tutorias.length > 0) {
      safeStorage.setItem('upds_tutorias_cache_v1', JSON.stringify(tutorias));
    }
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
    if (this.state.activeUser?.id && Array.isArray(notifications)) {
      safeStorage.setItem(`upds_notifs_cache_${this.state.activeUser.id}`, JSON.stringify(notifications));
    }
    this.notify();
  }

  setEvents(events) {
    this.state.events = events;
    safeStorage.setItem('upds_events_v1', JSON.stringify(events));
    this.notify();
  }
}

export const store = new Store();
