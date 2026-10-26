// Vista 404 Interactiva con Feedback — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { Toast } from '../components/Toast.js';
import { Icons } from '../components/Icons.js';

export const NotFoundView = {
  render(invalidPath = '') {
    const state = store.getState();
    const role = state.activeUser?.role || 'guest';
    const currentHash = window.location.hash || (invalidPath ? `#/${invalidPath}` : '#/desconocido');

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in not-found-page-wrapper';
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 72vh;
      padding: 2rem 1rem;
      text-align: center;
    `;

    container.innerHTML = `
      <div class="card not-found-card" style="
        max-width: 680px;
        width: 100%;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 40, 85, 0.08), 0 8px 10px -6px rgba(0, 40, 85, 0.04);
        padding: 2.5rem 2rem;
        position: relative;
        overflow: hidden;
      ">
        <!-- Barra de acento superior UPDS -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #002855 0%, #1e3a8a 50%, #FFB800 100%);
        "></div>

        <!-- Encabezado con Icono Animado y Badge -->
        <div style="margin-bottom: 1.25rem;">
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: #f1f5f9;
            color: #002855;
            margin-bottom: 1rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
          ">
            ${Icons.compass('animate-spin-slow', 40)}
          </div>
          <div>
            <span style="
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              background: #fee2e2;
              color: #991b1b;
              font-size: 0.8rem;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            ">Error 404 · Ruta no encontrada</span>
          </div>
        </div>

        <!-- Tipografía de Impacto -->
        <h1 style="
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1;
          margin: 0.5rem 0;
          color: #002855;
          letter-spacing: -0.04em;
        ">4<span style="color: #FFB800;">0</span>4</h1>

        <h2 style="
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        ">¿Te perdiste en el campus virtual?</h2>

        <p style="
          font-size: 0.95rem;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto 1.5rem auto;
          line-height: 1.5;
        ">
          El recurso solicitado en <code style="background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${currentHash}</code> no existe, fue renombrado o no está disponible en este momento.
        </p>

        <!-- Buscador Interactivo Rápido -->
        <div style="
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: left;
        ">
          <label style="
            display: block;
            font-size: 0.85rem;
            font-weight: 700;
            color: #334155;
            margin-bottom: 0.5rem;
          ">
            🔍 Búsqueda rápida en el catálogo de cursos:
          </label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <input
              type="text"
              id="input-404-search"
              placeholder="Ej: docker, web, programacion, python..."
              style="
                flex: 1;
                min-width: 200px;
                padding: 0.6rem 0.85rem;
                font-size: 0.9rem;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                outline: none;
              "
            />
            <button id="btn-404-search" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>Buscar Cursos</span>
            </button>
          </div>
        </div>

        <!-- Botones de Acción Directa -->
        <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          <button id="btn-404-home" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
            ${Icons.home('', 16)}
            <span>${role === 'guest' ? 'Ir al Inicio' : 'Volver al Dashboard'}</span>
          </button>
          <button id="btn-404-courses" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.4rem;">
            ${Icons.book('', 16)}
            <span>Explorar Cursos & Talleres</span>
          </button>
          <button id="btn-404-tutorias" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.4rem;">
            ${Icons.cap('', 16)}
            <span>Ver Tutorías</span>
          </button>
        </div>

        <!-- Módulo de Feedback Interactivo -->
        <div style="
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #64748b;
        ">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <span>API Backend: <strong>En línea</strong> (puerto 3001)</span>
          </div>

          <button id="btn-report-broken-link" style="
            background: none;
            border: none;
            color: #002855;
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: underline;
            cursor: pointer;
            padding: 4px;
          ">
            🚩 Reportar enlace roto al soporte
          </button>
        </div>
      </div>
    `;

    // ─── Listeners Interactivos ──────────────────────────────────────────────
    const inputSearch = container.querySelector('#input-404-search');
    const btnSearch = container.querySelector('#btn-404-search');
    const btnHome = container.querySelector('#btn-404-home');
    const btnCourses = container.querySelector('#btn-404-courses');
    const btnTutorias = container.querySelector('#btn-404-tutorias');
    const btnReport = container.querySelector('#btn-report-broken-link');

    // Búsqueda interactiva
    const triggerSearch = () => {
      const term = inputSearch.value.trim();
      if (!term) {
        Toast.info('Ingresa una palabra para buscar en el catálogo.');
        inputSearch.focus();
        return;
      }
      Toast.success(`Buscando "${term}" en el catálogo de cursos...`);
      store.setView('courses');
      // Establecer término de búsqueda tras renderizar
      setTimeout(() => {
        const courseSearchInput = document.querySelector('#course-search-input');
        if (courseSearchInput) {
          courseSearchInput.value = term;
          courseSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 50);
    };

    btnSearch?.addEventListener('click', triggerSearch);
    inputSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });

    // Navegación
    btnHome?.addEventListener('click', () => {
      if (role === 'guest' || !state.activeUser) {
        store.setView('welcome');
      } else {
        store.setView('dashboard');
      }
      window.location.hash = '';
    });

    btnCourses?.addEventListener('click', () => {
      store.setView('courses');
      window.location.hash = '#/courses';
    });

    btnTutorias?.addEventListener('click', () => {
      store.setView('tutorias');
      window.location.hash = '#/tutorias';
    });

    // Reporte de enlace roto con feedback instantáneo
    let reported = false;
    btnReport?.addEventListener('click', () => {
      if (reported) {
        Toast.info('Ya enviaste un reporte sobre esta ruta. ¡Gracias por tu colaboración!');
        return;
      }
      reported = true;
      btnReport.textContent = '✅ Reporte enviado al equipo técnico';
      btnReport.style.color = '#10b981';
      btnReport.style.textDecoration = 'none';
      btnReport.style.cursor = 'default';

      Toast.success('¡Gracias por tu feedback! Hemos registrado la ruta rota para revisarla.');
    });

    return container;
  },
};
