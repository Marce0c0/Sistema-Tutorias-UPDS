// Vista Principal del Dashboard — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { StatCard } from '../components/StatCard.js';
import { Badge } from '../components/Badge.js';
import { can } from '../utils/permissions.js';
import { Icons } from '../components/Icons.js';

export const DashboardView = {
  render() {
    const state = store.getState();
    const { stats, activeUser, tutorias, bookings, courses } = state;
    const role = activeUser?.role;
    const seesAllBookings = can(role, 'bookings.manage');
    const visibleBookings = seesAllBookings ? bookings : bookings.filter((b) => b.studentId === activeUser?.id);

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    // Banner de bienvenida y usuario en sesión
    const banner = document.createElement('div');
    banner.className = 'dashboard-banner';
    banner.innerHTML = `
      <div class="banner-info">
        <h1 class="banner-title">Panel Académico de Tutorías</h1>
        <p class="banner-subtitle">
          Bienvenido, <strong>${activeUser?.name || 'Usuario'}</strong>.
          Tu rol activo es ${Badge.role(activeUser?.role || 'student')}.
        </p>
      </div>
      <div class="banner-badge">
        <span class="badge-status-dot"></span> Campus UPDS · Sistema En Línea
      </div>
    `;
    container.appendChild(banner);

    // Grid de Tarjetas KPI
    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'kpi-grid';

    // El directorio de usuarios solo existe para quien puede administrarlo
    if (can(role, 'view.users')) {
      kpiGrid.appendChild(
        StatCard({
          title: 'Estudiantes y Tutores',
          value: stats.totalUsers,
          icon: Icons.users('', 22),
          subtitle: 'Usuarios en plataforma',
          color: 'blue',
          onClick: () => store.setView('users'),
        })
      );
    }

    kpiGrid.appendChild(
      StatCard({
        title: 'Cursos y Talleres',
        value: stats.totalCourses,
        icon: Icons.book('', 22),
        subtitle: 'Catálogo académico',
        color: 'indigo',
        onClick: () => store.setView('courses'),
      })
    );

    kpiGrid.appendChild(
      StatCard({
        title: 'Tutorías Activas',
        value: stats.activeTutorias,
        icon: Icons.cap('', 22),
        subtitle: 'Sesiones grupales / indiv.',
        color: 'emerald',
        onClick: () => store.setView('tutorias'),
      })
    );

    kpiGrid.appendChild(
      StatCard({
        title: 'Reservas Realizadas',
        value: visibleBookings.length,
        icon: Icons.calendar('', 22),
        subtitle: seesAllBookings ? 'Citas agendadas' : 'Mis citas agendadas',
        color: 'amber',
        onClick: () => store.setView('bookings'),
      })
    );

    container.appendChild(kpiGrid);

    // Paneles de Resumen Rápido (Próximas Tutorías y Últimas Reservas)
    const splitSection = document.createElement('div');
    splitSection.className = 'dashboard-split-grid';

    // Columna 1: Próximas Tutorías
    const upcomingTutorias = tutorias.slice(0, 4);
    const tutoriasBox = document.createElement('div');
    tutoriasBox.className = 'card';
    tutoriasBox.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">Próximas Sesiones de Tutoría</h3>
        <button class="btn btn-sm btn-outline" id="dash-view-all-tutorias">Ver todas</button>
      </div>
      <div class="card-body">
        ${upcomingTutorias.length === 0 ? '<p class="text-muted">No hay tutorías programadas actualmente.</p>' : `
          <ul class="activity-list">
            ${upcomingTutorias.map((t) => `
              <li class="activity-item">
                <div class="activity-icon" style="display:flex; align-items:center; justify-content:center;">${Icons.cap('', 18)}</div>
                <div class="activity-content">
                  <div class="activity-title">${t.title}</div>
                  <div class="activity-meta">
                    <span>${t.course?.title || 'Curso'}</span> ·
                    <span>${Badge.formatDate(t.date)}</span>
                  </div>
                </div>
                <div class="activity-status">
                  ${Badge.tutoriaStatus(t.status)}
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    `;

    // Columna 2: Últimas Reservas
    const recentBookings = visibleBookings.slice(0, 4);
    const bookingsBox = document.createElement('div');
    bookingsBox.className = 'card';
    bookingsBox.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${seesAllBookings ? 'Últimas Reservas de Estudiantes' : 'Mis Reservas'}</h3>
        <button class="btn btn-sm btn-outline" id="dash-view-all-bookings">Ver todas</button>
      </div>
      <div class="card-body">
        ${recentBookings.length === 0 ? '<p class="text-muted">No hay reservas registradas.</p>' : `
          <ul class="activity-list">
            ${recentBookings.map((b) => `
              <li class="activity-item">
                <div class="activity-icon" style="display:flex; align-items:center; justify-content:center;">${Icons.calendar('', 18)}</div>
                <div class="activity-content">
                  <div class="activity-title">${b.student?.name || 'Estudiante'}</div>
                  <div class="activity-meta">
                    <span>${b.course?.title || 'Materia'}</span> ·
                    <span>${Badge.formatDate(b.scheduledAt)}</span>
                  </div>
                </div>
                <div class="activity-status">
                  ${Badge.bookingStatus(b.status)}
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    `;

    splitSection.appendChild(tutoriasBox);
    splitSection.appendChild(bookingsBox);
    container.appendChild(splitSection);

    // Eventos
    tutoriasBox.querySelector('#dash-view-all-tutorias')?.addEventListener('click', () => {
      store.setView('tutorias');
    });

    bookingsBox.querySelector('#dash-view-all-bookings')?.addEventListener('click', () => {
      store.setView('bookings');
    });

    return container;
  },
};
