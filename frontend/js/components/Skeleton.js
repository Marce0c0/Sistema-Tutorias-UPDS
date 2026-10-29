// Componente Reutilizable de Skeletons (Shimmer Loading) — Sistema-Tutoriales-UPDS
// Proporciona esqueletos animados para eliminar el parpadeo de carga y dar fluidez visual instantánea

export const Skeleton = {
  /**
   * Genera una tarjeta esqueleto individual para Hackathons y Eventos
   */
  renderEventCard() {
    return `
      <div class="skeleton-card skeleton-event-card">
        <div class="skeleton-badge-row">
          <div style="display:flex; gap:0.4rem;">
            <span class="skeleton-shimmer" style="width: 80px; height: 22px; border-radius: 9999px;"></span>
            <span class="skeleton-shimmer" style="width: 100px; height: 22px; border-radius: 9999px;"></span>
          </div>
          <span class="skeleton-shimmer" style="width: 28px; height: 28px; border-radius: 6px;"></span>
        </div>

        <div style="margin: 0.4rem 0;">
          <span class="skeleton-shimmer" style="width: 85%; height: 22px; border-radius: 6px; margin-bottom: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 55%; height: 18px; border-radius: 6px;"></span>
        </div>

        <!-- Banner de Cuenta Regresiva Esqueleto -->
        <div class="skeleton-countdown-box">
          <span class="skeleton-shimmer" style="width: 140px; height: 14px; border-radius: 4px; margin: 0 auto;"></span>
          <div class="skeleton-countdown-digits">
            <span class="skeleton-shimmer skeleton-digit-box"></span>
            <span class="skeleton-shimmer skeleton-digit-box"></span>
            <span class="skeleton-shimmer skeleton-digit-box"></span>
            <span class="skeleton-shimmer skeleton-digit-box"></span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem; margin: 0.3rem 0;">
          <span class="skeleton-shimmer" style="width: 95%; height: 14px; border-radius: 4px;"></span>
          <span class="skeleton-shimmer" style="width: 75%; height: 14px; border-radius: 4px;"></span>
        </div>

        <div class="skeleton-actions-cluster">
          <span class="skeleton-shimmer" style="flex: 1; height: 36px; border-radius: 6px;"></span>
          <span class="skeleton-shimmer" style="flex: 1.4; height: 36px; border-radius: 6px;"></span>
        </div>
      </div>
    `;
  },

  /**
   * Genera el grid completo de Eventos y Hackathons con cabecera y filtros
   */
  renderEventGrid(count = 6) {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 320px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 480px; height: 16px; border-radius: 4px;"></span>
          </div>
          <div style="display:flex; gap:0.6rem;">
            <span class="skeleton-shimmer" style="width: 140px; height: 36px; border-radius: 9999px;"></span>
            <span class="skeleton-shimmer" style="width: 160px; height: 36px; border-radius: 6px;"></span>
          </div>
        </div>

        <div class="skeleton-shimmer skeleton-banner-bar"></div>

        <div class="skeleton-filter-bar">
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
        </div>

        <div class="skeleton-grid">
          ${Array.from({ length: count }).map(() => this.renderEventCard()).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Genera una tarjeta esqueleto individual para Cursos y Talleres
   */
  renderCourseCard() {
    return `
      <div class="skeleton-card skeleton-course-card">
        <div class="skeleton-badge-row">
          <span class="skeleton-shimmer" style="width: 90px; height: 22px; border-radius: 9999px;"></span>
          <span class="skeleton-shimmer" style="width: 70px; height: 22px; border-radius: 9999px;"></span>
        </div>

        <div style="margin: 0.4rem 0;">
          <span class="skeleton-shimmer" style="width: 90%; height: 22px; border-radius: 6px; margin-bottom: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 60%; height: 18px; border-radius: 6px;"></span>
        </div>

        <div style="display:flex; align-items:center; gap:0.6rem; margin: 0.3rem 0;">
          <span class="skeleton-shimmer" style="width: 32px; height: 32px; border-radius: 50%;"></span>
          <span class="skeleton-shimmer" style="width: 130px; height: 16px; border-radius: 4px;"></span>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.65rem; margin: 0.4rem 0;">
          <span class="skeleton-shimmer" style="width: 70%; height: 14px; border-radius: 4px; margin-bottom: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 40%; height: 12px; border-radius: 4px;"></span>
        </div>

        <div class="skeleton-actions-cluster">
          <span class="skeleton-shimmer" style="flex: 1; height: 36px; border-radius: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 36px; height: 36px; border-radius: 6px;"></span>
          <span class="skeleton-shimmer" style="flex: 1.4; height: 36px; border-radius: 6px;"></span>
        </div>
      </div>
    `;
  },

  /**
   * Genera el grid de Cursos y Talleres
   */
  renderCourseGrid(count = 6) {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 300px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 450px; height: 16px; border-radius: 4px;"></span>
          </div>
          <span class="skeleton-shimmer" style="width: 150px; height: 36px; border-radius: 6px;"></span>
        </div>

        <div class="skeleton-filter-bar">
          <span class="skeleton-shimmer" style="width: 220px; height: 38px; border-radius: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 140px; height: 38px; border-radius: 6px;"></span>
          <span class="skeleton-shimmer" style="width: 140px; height: 38px; border-radius: 6px;"></span>
        </div>

        <div class="skeleton-grid">
          ${Array.from({ length: count }).map(() => this.renderCourseCard()).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para el Foro de Consultas
   */
  renderForumGrid(count = 5) {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 280px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 420px; height: 16px; border-radius: 4px;"></span>
          </div>
          <span class="skeleton-shimmer" style="width: 160px; height: 36px; border-radius: 6px;"></span>
        </div>

        <div class="skeleton-filter-bar">
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
          <span class="skeleton-shimmer skeleton-tab-pill"></span>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${Array.from({ length: count }).map(() => `
            <div class="skeleton-card" style="padding: 1.1rem 1.25rem;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.5rem;">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span class="skeleton-shimmer" style="width: 32px; height: 32px; border-radius: 50%;"></span>
                  <div>
                    <span class="skeleton-shimmer" style="width: 120px; height: 14px; border-radius: 4px; margin-bottom: 4px;"></span>
                    <span class="skeleton-shimmer" style="width: 80px; height: 12px; border-radius: 4px;"></span>
                  </div>
                </div>
                <span class="skeleton-shimmer" style="width: 90px; height: 22px; border-radius: 9999px;"></span>
              </div>
              <span class="skeleton-shimmer" style="width: 75%; height: 20px; border-radius: 6px; margin-bottom: 6px;"></span>
              <span class="skeleton-shimmer" style="width: 95%; height: 14px; border-radius: 4px;"></span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para el Dashboard
   */
  renderDashboard() {
    return `
      <div class="view-content skeleton-view-wrapper">
        <!-- Banner de Bienvenida Esqueleto -->
        <div class="skeleton-card" style="padding: 1.75rem 1.5rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, #002d62 0%, #004b93 100%); border:none;">
          <span class="skeleton-shimmer" style="width: 280px; height: 26px; border-radius: 6px; margin-bottom: 8px; background: rgba(255,255,255,0.25);"></span>
          <span class="skeleton-shimmer" style="width: 450px; height: 16px; border-radius: 4px; background: rgba(255,255,255,0.18);"></span>
        </div>

        <!-- Grid de KPIs Esqueleto -->
        <div class="skeleton-kpi-grid">
          ${Array.from({ length: 4 }).map(() => `
            <div class="skeleton-kpi-card">
              <span class="skeleton-shimmer" style="width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0;"></span>
              <div style="flex:1;">
                <span class="skeleton-shimmer" style="width: 80px; height: 26px; border-radius: 6px; margin-bottom: 6px;"></span>
                <span class="skeleton-shimmer" style="width: 120px; height: 14px; border-radius: 4px;"></span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 2 Columnas Esqueleto -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          <div class="skeleton-card" style="padding: 1.25rem;">
            <span class="skeleton-shimmer" style="width: 180px; height: 20px; border-radius: 6px; margin-bottom: 1rem;"></span>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
            </div>
          </div>

          <div class="skeleton-card" style="padding: 1.25rem;">
            <span class="skeleton-shimmer" style="width: 180px; height: 20px; border-radius: 6px; margin-bottom: 1rem;"></span>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
              <span class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 8px;"></span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para Mis Entradas & Reservas
   */
  renderBookings() {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 260px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 380px; height: 16px; border-radius: 4px;"></span>
          </div>
        </div>

        <div class="skeleton-grid">
          ${Array.from({ length: 4 }).map(() => `
            <div class="skeleton-card">
              <div class="skeleton-badge-row">
                <span class="skeleton-shimmer" style="width: 110px; height: 22px; border-radius: 9999px;"></span>
                <span class="skeleton-shimmer" style="width: 70px; height: 22px; border-radius: 9999px;"></span>
              </div>
              <span class="skeleton-shimmer" style="width: 80%; height: 20px; border-radius: 6px; margin: 0.5rem 0;"></span>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem; display:flex; justify-content:center; align-items:center;">
                <span class="skeleton-shimmer" style="width: 140px; height: 140px; border-radius: 8px;"></span>
              </div>
              <span class="skeleton-shimmer" style="width: 100%; height: 38px; border-radius: 6px; margin-top: 0.5rem;"></span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para Gestión de Usuarios
   */
  renderUsers() {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 240px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 380px; height: 16px; border-radius: 4px;"></span>
          </div>
          <span class="skeleton-shimmer" style="width: 150px; height: 36px; border-radius: 6px;"></span>
        </div>

        <div class="skeleton-card" style="padding: 1.5rem;">
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${Array.from({ length: 6 }).map(() => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:0.75rem; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <span class="skeleton-shimmer" style="width: 36px; height: 36px; border-radius: 50%;"></span>
                  <div>
                    <span class="skeleton-shimmer" style="width: 140px; height: 16px; border-radius: 4px; margin-bottom: 4px;"></span>
                    <span class="skeleton-shimmer" style="width: 180px; height: 13px; border-radius: 4px;"></span>
                  </div>
                </div>
                <span class="skeleton-shimmer" style="width: 80px; height: 22px; border-radius: 9999px;"></span>
                <span class="skeleton-shimmer" style="width: 60px; height: 28px; border-radius: 6px;"></span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para la Bandeja de Notificaciones
   */
  renderNotifications() {
    return `
      <div class="view-content skeleton-view-wrapper">
        <div class="skeleton-header">
          <div>
            <span class="skeleton-shimmer" style="width: 260px; height: 28px; border-radius: 6px; margin-bottom: 8px;"></span>
            <span class="skeleton-shimmer" style="width: 380px; height: 16px; border-radius: 4px;"></span>
          </div>
          <span class="skeleton-shimmer" style="width: 160px; height: 36px; border-radius: 6px;"></span>
        </div>

        <div class="notifications-feed" style="display:flex; flex-direction:column; gap:0.75rem;">
          ${Array.from({ length: 5 }).map(() => `
            <div class="skeleton-card" style="padding: 1.1rem 1.25rem; border-left: 4px solid #cbd5e1;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span class="skeleton-shimmer" style="width: 80px; height: 20px; border-radius: 9999px;"></span>
                  <span class="skeleton-shimmer" style="width: 140px; height: 14px; border-radius: 4px;"></span>
                  <span class="skeleton-shimmer" style="width: 90px; height: 14px; border-radius: 4px;"></span>
                </div>
                <span class="skeleton-shimmer" style="width: 95px; height: 24px; border-radius: 4px;"></span>
              </div>
              <span class="skeleton-shimmer" style="width: 65%; height: 18px; border-radius: 4px; margin-bottom: 0.4rem;"></span>
              <span class="skeleton-shimmer" style="width: 92%; height: 14px; border-radius: 4px;"></span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Genera el esqueleto para la Pantalla de Inicio / Bienvenida
   */
  renderWelcome() {
    return `
      <div class="view-content skeleton-view-wrapper welcome-view-container" style="max-width:960px; margin:2rem auto; padding:1rem;">
        <div class="skeleton-card" style="padding:2.5rem; border-radius:14px; display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
          <div style="display:flex; flex-direction:column; gap:1rem;">
            <div style="text-align:center; margin-bottom:1rem;">
              <span class="skeleton-shimmer" style="width:120px; height:46px; border-radius:8px; display:inline-block; margin-bottom:0.75rem;"></span>
              <span class="skeleton-shimmer" style="width:180px; height:24px; border-radius:6px; display:block; margin:0 auto 0.4rem;"></span>
              <span class="skeleton-shimmer" style="width:240px; height:14px; border-radius:4px; display:block; margin:0 auto;"></span>
            </div>
            <span class="skeleton-shimmer" style="width:100%; height:42px; border-radius:8px;"></span>
            <span class="skeleton-shimmer" style="width:100%; height:42px; border-radius:8px;"></span>
            <span class="skeleton-shimmer" style="width:100%; height:46px; border-radius:8px; margin-top:0.5rem;"></span>
          </div>
          <div style="display:flex; flex-direction:column; gap:1rem; border-left:1px solid #f1f5f9; padding-left:1.5rem;">
            <span class="skeleton-shimmer" style="width:160px; height:24px; border-radius:6px;"></span>
            <span class="skeleton-shimmer" style="width:100%; height:16px; border-radius:4px;"></span>
            <span class="skeleton-shimmer" style="width:90%; height:16px; border-radius:4px;"></span>
            <div style="display:flex; gap:0.5rem; margin:1rem 0;">
              <span class="skeleton-shimmer" style="flex:1; height:60px; border-radius:10px;"></span>
              <span class="skeleton-shimmer" style="flex:1; height:60px; border-radius:10px;"></span>
              <span class="skeleton-shimmer" style="flex:1; height:60px; border-radius:10px;"></span>
            </div>
            <span class="skeleton-shimmer" style="width:100%; height:46px; border-radius:8px; margin-top:auto;"></span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Selector dinámico de esqueleto según el hash / vista actual
   * @param {string} viewName Nombre de la vista ('events', 'courses', 'forums', etc.)
   */
  renderViewSkeleton(viewName) {
    const raw = (viewName || '').replace(/^#\/?/, '').trim();
    switch (raw) {
      case 'events':
        return this.renderEventGrid(6);
      case 'courses':
      case 'tutorias':
        return this.renderCourseGrid(6);
      case 'forums':
        return this.renderForumGrid(5);
      case 'dashboard':
        return this.renderDashboard();
      case 'bookings':
        return this.renderBookings();
      case 'users':
        return this.renderUsers();
      case 'notifications':
        return this.renderNotifications();
      case 'welcome':
      default:
        return this.renderWelcome();
    }
  },
};

