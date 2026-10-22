// Configuración de Entorno Frontend — Sistema-Tutoriales-UPDS
// Permite alternar la URL de la API dinámicamente desde la interfaz o por variable local

const DEFAULT_API_URL = 'http://localhost:3001';

export const ENV = {
  getApiUrl() {
    return localStorage.getItem('UPDS_API_BASE_URL') || DEFAULT_API_URL;
  },

  setApiUrl(url) {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem('UPDS_API_BASE_URL', cleanUrl);
    window.location.reload();
  },

  resetApiUrl() {
    localStorage.removeItem('UPDS_API_BASE_URL');
    window.location.reload();
  },

  APP_NAME: 'Sistema de Tutorías y Cursos UPDS',
  VERSION: '3.0.0',
  INSTITUTION: 'Universidad Privada Domingo Savio',
};
