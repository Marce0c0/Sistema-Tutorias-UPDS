// Cliente HTTP Centralizado — Sistema-Tutoriales-UPDS
// Provee métodos tipados para consumir los 30 endpoints REST de las 6 entidades

import { ENV, safeStorage } from '../config/env.js';

class ApiService {
  constructor() {
    this.baseUrl = ENV.getApiUrl();
  }

  // Wrapper genérico de petición fetch
  async request(endpoint, options = {}) {
    const base = ENV.getApiUrl();
    const url = `${base}${endpoint}`;
    const token = safeStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      let data = null;

      // Intentar parsear respuesta JSON si existe contenido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(`No se pudo conectar con el servidor en ${this.baseUrl}. ¿Está corriendo el backend?`);
      }
      throw err;
    }
  }

  // ─── 0. MÓDULO DE AUTENTICACIÓN JWT (/api/auth) ─────────────────────────
  auth = {
    login: (credentials) => this.request('/api/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => this.request('/api/auth/register', { method: 'POST', body: userData }),
    getMe: () => this.request('/api/auth/me'),
  };

  // ─── 1. MÓDULO DE USUARIOS (/api/users) ──────────────────────────────────
  users = {
    getAll: () => this.request('/api/users'),
    getById: (id) => this.request(`/api/users/${id}`),
    create: (payload) => this.request('/api/users', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/users/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/users/${id}`, { method: 'DELETE' }),
  };

  // ─── 2. MÓDULO DE CURSOS (/api/courses) ──────────────────────────────────
  courses = {
    getAll: () => this.request('/api/courses'),
    getById: (id) => this.request(`/api/courses/${id}`),
    create: (payload) => this.request('/api/courses', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/courses/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/courses/${id}`, { method: 'DELETE' }),
  };

  // ─── 3. MÓDULO DE TUTORÍAS (/api/tutorias) ───────────────────────────────
  tutorias = {
    getAll: () => this.request('/api/tutorias'),
    getById: (id) => this.request(`/api/tutorias/${id}`),
    create: (payload) => this.request('/api/tutorias', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/tutorias/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/tutorias/${id}`, { method: 'DELETE' }),
  };

  // ─── 4. MÓDULO DE RESERVAS (/api/bookings) ───────────────────────────────
  bookings = {
    getAll: () => this.request('/api/bookings'),
    getById: (id) => this.request(`/api/bookings/${id}`),
    create: (payload) => this.request('/api/bookings', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/bookings/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/bookings/${id}`, { method: 'DELETE' }),
  };

  // ─── 5. MÓDULO DE FORO (/api/forums) ─────────────────────────────────────
  forums = {
    getAll: (courseId = '') => {
      const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';
      return this.request(`/api/forums${query}`);
    },
    getById: (id) => this.request(`/api/forums/${id}`),
    create: (payload) => this.request('/api/forums', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/forums/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/forums/${id}`, { method: 'DELETE' }),
  };

  // ─── 6. MÓDULO DE NOTIFICACIONES (/api/notifications) ───────────────────
  notifications = {
    getAll: (userId = '') => {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return this.request(`/api/notifications${query}`);
    },
    getById: (id) => this.request(`/api/notifications/${id}`),
    create: (payload) => this.request('/api/notifications', { method: 'POST', body: payload }),
    update: (id, payload) => this.request(`/api/notifications/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => this.request(`/api/notifications/${id}`, { method: 'DELETE' }),
  };
}

export const api = new ApiService();
