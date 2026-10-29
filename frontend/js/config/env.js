// Configuración de Entorno Frontend — Sistema-Tutoriales-UPDS
// Permite alternar la URL de la API dinámicamente desde la interfaz o por variable local

export const safeStorage = {
  getItem(key) {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key, val) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, val);
    } catch {}
  },
  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
    } catch {}
  },
};

export const safeSession = {
  getItem(key) {
    try {
      return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key, val) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.setItem(key, val);
    } catch {}
  },
  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.removeItem(key);
    } catch {}
  },
};

const isLocalDev = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '' ||
  window.location.protocol === 'file:'
);
const DEFAULT_API_URL = isLocalDev ? 'http://localhost:3001' : '';

export const ENV = {
  getApiUrl() {
    // En desarrollo local siempre usar el backend local en puerto 3001
    if (isLocalDev) {
      return DEFAULT_API_URL;
    }
    const stored = safeStorage.getItem('UPDS_API_BASE_URL');
    if (stored) {
      return stored;
    }
    return DEFAULT_API_URL;
  },

  setApiUrl(url) {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    safeStorage.setItem('UPDS_API_BASE_URL', cleanUrl);
    window.location.reload();
  },

  resetApiUrl() {
    safeStorage.removeItem('UPDS_API_BASE_URL');
    window.location.reload();
  },

  APP_NAME: 'Sistema de Cursos, Talleres & Hackathons UPDS',
  VERSION: '3.0.0',
  INSTITUTION: 'Universidad Privada Domingo Savio',
};
