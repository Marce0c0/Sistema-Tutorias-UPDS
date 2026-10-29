// Vista Principal del Dashboard — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { StatCard } from '../components/StatCard.js';
import { Badge } from '../components/Badge.js';
import { can } from '../utils/permissions.js';
import { Icons } from '../components/Icons.js';
import { TicketModal } from '../components/TicketModal.js';
import { CoursesView } from './CoursesView.js';
import { getStoredEvents } from './EventsView.js';
import { Navbar } from '../components/Navbar.js';
import { Toast } from '../components/Toast.js';

export const DashboardView = {
  render() {
    const state = store.getState();
    const { stats, activeUser, tutorias, bookings, courses, forums } = state;

    // Si no hay usuario autenticado o es invitado, redirigir a su vista autorizada
    if (!activeUser || activeUser.role === 'guest') {
      setTimeout(() => {
        store.setView(activeUser?.role === 'guest' ? 'courses' : 'welcome');
      }, 0);
      return document.createElement('div');
    }

    const role = activeUser.role;
    const isStudent = role === 'student';

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    // ──────────────────────────────────────────────────────────────────────────
    // 1. DASHBOARD EXCLUSIVO PARA ESTUDIANTES (Experiencia Dinámica e Interactiva)
    // ──────────────────────────────────────────────────────────────────────────
    if (isStudent) {
      const myBookings = bookings.filter((b) => b.studentId === activeUser?.id);
      const activeBookings = myBookings.filter((b) => b.status !== 'cancelled');
      
      // Ordenar por fecha cronológica para encontrar la próxima clase/taller
      const sortedActiveBookings = [...activeBookings].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
      const nextBooking = sortedActiveBookings[0];
      const nextCourse = nextBooking
        ? courses.find((c) => c.id === nextBooking.courseId) || nextBooking.course
        : null;
      const nextTutoria = nextBooking
        ? tutorias.find((t) => t.id === nextBooking.tutoriaId) || nextBooking.tutoria
        : null;

      // Banner de Bienvenida Estudiantil con Identidad UPDS
      const banner = document.createElement('div');
      banner.className = 'student-banner';
      banner.innerHTML = `
        <div>
          <h1 class="student-banner-title">
            <span>¡Hola, <strong>${activeUser?.name || 'Estudiante'}</strong>! ${Icons.cap('', 22)}</span>
          </h1>
          <p class="student-banner-subtitle">
            Bienvenido a tu portal de aprendizaje y talleres extracurriculares de la UPDS.
            ${activeBookings.length > 0 
              ? `Tienes <strong>${activeBookings.length} ${activeBookings.length === 1 ? 'pase activo' : 'pases activos'}</strong> en tu credencial digital.` 
              : 'Explora nuevos bootcamps y talleres prácticos para potenciar tu carrera.'}
          </p>
          <div class="student-quick-chips">
            <button class="student-chip-btn" id="chip-btn-courses">
              ${Icons.book('', 14)} Explorar Cursos & Talleres
            </button>
            <button class="student-chip-btn" id="chip-btn-bookings">
              ${Icons.ticket('', 14)} Mis Entradas QR (${activeBookings.length})
            </button>
            <button class="student-chip-btn" id="chip-btn-forums">
              ${Icons.chat('', 14)} Foro de Consultas
            </button>
            <button class="student-chip-btn" id="chip-btn-events">
              ${Icons.star('', 14)} Convocatorias & Actividades
            </button>
          </div>
        </div>
      `;
      container.appendChild(banner);

      // Hero Card: Próxima Clase Activa o Invitación a Inscribirse
      const heroContainer = document.createElement('div');
      if (nextBooking) {
        const isConfirmed = nextBooking.status === 'confirmed';
        const ticketCode = (nextBooking.id || 'UPDS-TICKET').slice(0, 8).toUpperCase();
        const modality = nextTutoria?.modality || 'presencial';
        const venue = modality === 'presencial' 
          ? (nextTutoria?.location || 'Campus Central UPDS · Aula 302') 
          : (nextTutoria?.meetingUrl ? 'Sesión Virtual Online' : 'Enlace Virtual UPDS');

        heroContainer.className = 'student-hero-pass animate-fade-in';
        if (!isConfirmed) {
          heroContainer.style.borderTopColor = '#d97706';
        }

        const badgeHtml = isConfirmed
          ? `<div class="student-hero-badge">
              <span class="badge-status-dot"></span> Próxima Clase Confirmada
            </div>`
          : `<div class="student-hero-badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">
              <span class="badge-status-dot" style="background-color:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span> Entrada en Confirmación
            </div>`;

        heroContainer.innerHTML = `
          <div class="student-hero-left">
            ${badgeHtml}
            <h2 class="student-hero-title">${nextCourse?.title || 'Bootcamp de Programación'}</h2>
            <div class="student-hero-subtitle">
              <strong>Sesión:</strong> ${nextTutoria?.title || 'Clase Práctica con Docente Especialista'}
            </div>
            <div class="student-hero-meta-row">
              <span class="student-hero-meta-item">
                ${Icons.calendar('', 14)} <strong>${Badge.formatDate(nextBooking.scheduledAt)}</strong>
              </span>
              <span class="student-hero-meta-item">
                ${modality === 'presencial' ? Icons.pin('', 14) : Icons.link('', 14)} 
                ${venue}
              </span>
              <span class="student-hero-meta-item">
                ${Icons.ticket('', 14)} Entrada <strong>#UPDS-${ticketCode}</strong>
              </span>
            </div>
          </div>
          <div class="student-hero-right">
            <button id="btn-hero-ticket" class="btn ${isConfirmed ? 'btn-primary' : 'btn-secondary'}" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700; padding:0.65rem 1.25rem; ${!isConfirmed ? 'border-color:#d97706; color:#92400e; background:#fffbeb;' : ''}">
              ${isConfirmed ? Icons.ticket('', 16) : Icons.clock('', 16)} ${isConfirmed ? 'Ver Entrada QR Oficial' : 'Ver Entrada por Confirmar'}
            </button>
            <small style="color:${isConfirmed ? '#64748b' : '#b45309'}; font-size:0.75rem;">
              ${isConfirmed ? 'Sincronizable con Google y Apple Wallet' : 'Comprobante en verificación por Administración UPDS'}
            </small>
          </div>
        `;

        heroContainer.querySelector('#btn-hero-ticket')?.addEventListener('click', () => {
          TicketModal.open(nextBooking, nextCourse, nextTutoria, activeUser);
        });
      } else {
        heroContainer.className = 'student-hero-empty animate-fade-in';
        heroContainer.innerHTML = `
          <div>
            <h3 style="color:var(--primary-navy); font-weight:800; font-size:1.15rem; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.ticket('', 20)} ¡Aún no tienes pases reservados para este mes!
            </h3>
            <p style="color:#475569; font-size:0.88rem; max-width:620px;">
              Inscríbete a los talleres extracurriculares de programación, bases de datos o asesoría académica para asegurar tu cupo y obtener tu pase digital con código QR.
            </p>
          </div>
          <button id="btn-hero-explore" class="btn btn-primary" style="font-weight:700; white-space:nowrap; display:inline-flex; align-items:center; gap:0.4rem;">
            <span>Explorar Catálogo de Cursos</span> ${Icons.arrowRight('', 14)}
          </button>
        `;
        heroContainer.querySelector('#btn-hero-explore')?.addEventListener('click', () => {
          store.setView('courses');
        });
      }
      container.appendChild(heroContainer);

      // Grid de Métricas y Accesos Estudiantiles
      const kpiGrid = document.createElement('div');
      kpiGrid.className = 'kpi-grid';

      const pendingCount = activeBookings.filter((b) => b.status === 'pending').length;
      kpiGrid.appendChild(
        StatCard({
          title: 'Mis Pases Activos',
          value: activeBookings.length,
          icon: Icons.ticket('', 22),
          subtitle: pendingCount > 0 ? `${activeBookings.length - pendingCount} confirmadas · ${pendingCount} por verificar` : 'Entradas QR listas para ingreso',
          color: 'blue',
          onClick: () => store.setView('bookings'),
        })
      );

      kpiGrid.appendChild(
        StatCard({
          title: 'Cursos & Talleres',
          value: courses.length,
          icon: Icons.book('', 22),
          subtitle: 'Disponibles para inscribirte',
          color: 'emerald',
          onClick: () => store.setView('courses'),
        })
      );

      kpiGrid.appendChild(
        StatCard({
          title: 'Consultas en Comunidad',
          value: forums.length,
          icon: Icons.chat('', 22),
          subtitle: 'Preguntas y debates activos',
          color: 'indigo',
          onClick: () => store.setView('forums'),
        })
      );

      const eventsCount = (state.events && state.events.length) || 3;
      kpiGrid.appendChild(
        StatCard({
          title: 'Convocatorias UPDS',
          value: eventsCount,
          icon: Icons.star('', 22),
          subtitle: 'Hackathones, ferias y eventos',
          color: 'amber',
          onClick: () => store.setView('events'),
        })
      );

      container.appendChild(kpiGrid);

      // Secciones Divididas: Cursos Recomendados vs Mis Pases Recientes
      const splitSection = document.createElement('div');
      splitSection.className = 'dashboard-split-grid';

      // Columna 1: Cursos y Talleres Recomendados
      const featuredCourses = courses.slice(0, 3);
      const coursesBox = document.createElement('div');
      coursesBox.className = 'card';
      coursesBox.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">Talleres & Cursos Recomendados</h3>
          <button class="btn btn-sm btn-outline" id="dash-student-all-courses">Ver catálogo completo</button>
        </div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:0.75rem;">
          ${featuredCourses.map((c) => {
            const tutor = state.users.find((u) => u.id === c.tutorId);
            const extMatch = c.description ? c.description.match(/<!--external_tutor:([^>]+)-->/) : null;
            const externalTutor = extMatch ? extMatch[1].trim() : null;
            const cleanDesc = extMatch ? c.description.replace(/<!--external_tutor:[^>]+-->\n?/, '').trim() : c.description;

            return `
              <div class="student-course-card">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.25rem;">
                    <strong class="student-course-title" title="${c.title}">${c.title}</strong>
                    <span class="badge ${c.category === 'programacion' ? 'badge-primary' : 'badge-info'}" style="font-size:0.68rem; text-transform:uppercase; flex-shrink:0;">
                      ${c.category || 'General'}
                    </span>
                  </div>
                  <p class="student-course-desc" title="${cleanDesc || ''}">
                    ${cleanDesc || 'Programa de formación extracurricular con enfoque práctico de la Universidad Privada Domingo Savio.'}
                  </p>
                  <div style="font-size:0.78rem; color:#475569; display:flex; align-items:center; gap:0.4rem; height:1.4rem;">
                    ${externalTutor ? Icons.user('', 13) : Icons.cap('', 13)} Docente: <strong style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${externalTutor ? `${externalTutor} (Invitado)` : (tutor?.name || 'Coordinación Académica')}
                    </strong>
                  </div>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                  <button class="btn btn-xs btn-outline btn-course-quick-detail" data-id="${c.id}" style="font-weight:600;">
                    Ver Ficha & Sesiones ↗
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Columna 2: Mis Pases y Entradas Recientes
      const recentMyBookings = myBookings.slice(0, 3);
      const bookingsBox = document.createElement('div');
      bookingsBox.className = 'card';
      bookingsBox.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">Mis Entradas & Pases Recientes</h3>
          <button class="btn btn-sm btn-outline" id="dash-student-all-bookings">Ir a mis entradas</button>
        </div>
        <div class="card-body">
          ${recentMyBookings.length === 0 ? `
            <div style="text-align:center; padding:1.5rem 1rem; color:#64748b;">
              <p style="font-size:0.9rem; margin-bottom:0.75rem;">Aún no has solicitado ningún pase o entrada.</p>
              <button class="btn btn-sm btn-primary" id="btn-empty-book">Inscribirme a un Curso</button>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              ${recentMyBookings.map((b) => {
                const course = courses.find((c) => c.id === b.courseId) || b.course;
                const tutoria = tutorias.find((t) => t.id === b.tutoriaId) || b.tutoria;
                const isCancelled = b.status === 'cancelled';
                return `
                  <div class="student-ticket-item">
                    <div>
                      <strong style="color:var(--primary-navy); display:block; font-size:0.88rem;">
                        ${course?.title || 'Curso / Taller UPDS'}
                      </strong>
                      <span style="font-size:0.76rem; color:#64748b;">
                        ${Badge.formatDate(b.scheduledAt)} · ${tutoria?.title || 'Sesión'}
                      </span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      ${Badge.bookingStatus(b.status, b.receiptUrl)}
                      <button class="btn btn-xs btn-outline btn-dash-show-ticket" data-id="${b.id}" title="Ver Entrada QR" style="font-weight:700; color:var(--primary-navy);">
                        ${Icons.ticket('', 12)} QR
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;

      splitSection.appendChild(coursesBox);
      splitSection.appendChild(bookingsBox);
      container.appendChild(splitSection);

      // Callout Inferior: Foro de la Comunidad UPDS
      const callout = document.createElement('div');
      callout.className = 'student-community-callout';
      callout.innerHTML = `
        <div>
          <h4 style="color:var(--primary-navy); font-weight:800; font-size:1.05rem; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
            <span>¿Tienes dudas con tus materias o proyectos?</span> ${Icons.chat('', 18)}
          </h4>
          <p style="color:#475569; font-size:0.85rem; max-width:650px;">
            Participa en el Foro de la Comunidad Estudiantil UPDS. Pregunta a los docentes, comparte apuntes y colabora con otros estudiantes de tu carrera.
          </p>
        </div>
        <button class="btn btn-sm btn-primary" id="btn-callout-forum" style="font-weight:700; white-space:nowrap; display:inline-flex; align-items:center; gap:0.4rem;">
          <span>Ir al Foro de Consultas</span> ${Icons.arrowRight('', 14)}
        </button>
      `;
      container.appendChild(callout);

      // Enlazar Eventos Estudiantiles
      banner.querySelector('#chip-btn-courses')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('courses');
      });
      banner.querySelector('#chip-btn-bookings')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('bookings');
      });
      banner.querySelector('#chip-btn-forums')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('forums');
      });
      banner.querySelector('#chip-btn-events')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('events');
      });

      coursesBox.querySelector('#dash-student-all-courses')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('courses');
      });
      bookingsBox.querySelector('#dash-student-all-bookings')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('bookings');
      });
      bookingsBox.querySelector('#btn-empty-book')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('courses');
      });
      callout.querySelector('#btn-callout-forum')?.addEventListener('click', (e) => {
        e?.preventDefault();
        store.setView('forums');
      });

      // Evento Ver Detalle de Curso Rápido
      coursesBox.querySelectorAll('.btn-course-quick-detail').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = courses.find((c) => c.id === id);
          if (course) {
            CoursesView.openCourseDetails(course);
          }
        });
      });

      // Evento Ver Entrada QR de la lista
      bookingsBox.querySelectorAll('.btn-dash-show-ticket').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const b = myBookings.find((item) => item.id === id);
          if (b) {
            const course = courses.find((c) => c.id === b.courseId) || b.course;
            const tutoria = tutorias.find((t) => t.id === b.tutoriaId) || b.tutoria;
            TicketModal.open(b, course, tutoria, activeUser);
          }
        });
      });

      return container;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. DASHBOARD INSTITUCIONAL PARA ADMINISTRADORES Y DOCENTES / TUTORES
    // ──────────────────────────────────────────────────────────────────────────
    const seesAllBookings = can(role, 'bookings.manage');
    const visibleBookings = seesAllBookings ? bookings : bookings.filter((b) => b.studentId === activeUser?.id);

    // Banner de bienvenida y usuario en sesión
    const banner = document.createElement('div');
    banner.className = 'dashboard-banner';
    banner.innerHTML = `
      <div class="banner-info">
        <h1 class="banner-title">Panel Académico y Administrativo UPDS</h1>
        <p class="banner-subtitle">
          Bienvenido, <strong>${activeUser?.name || 'Usuario'}</strong>.
          Tu rol activo en el sistema es ${Badge.role(role)}.
        </p>
      </div>
      <div class="banner-badge">
        <span class="badge-status-dot"></span> Campus UPDS · Supervisión Activa
      </div>
    `;
    container.appendChild(banner);

    // Grid de Tarjetas KPI Administrativas
    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'kpi-grid';

    if (can(role, 'view.users')) {
      kpiGrid.appendChild(
        StatCard({
          title: 'Estudiantes y Docentes',
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
        title: 'Sesiones Prácticas',
        value: stats.activeTutorias,
        icon: Icons.cap('', 22),
        subtitle: 'Clases y laboratorios',
        color: 'emerald',
        onClick: () => store.setView('courses'),
      })
    );

    if (role === 'admin') {
      const storedEvents = getStoredEvents();
      kpiGrid.appendChild(
        StatCard({
          title: 'Eventos & Hackathons',
          value: storedEvents.length,
          icon: Icons.trophy('', 22),
          subtitle: 'Convocatorias activas',
          color: 'amber',
          onClick: () => store.setView('events'),
        })
      );
      const pendingCount = (state.bookings || []).filter((b) => b.status === 'pending').length;
      kpiGrid.appendChild(
        StatCard({
          title: 'Gestión de Entradas',
          value: (state.bookings || []).length,
          icon: Icons.ticket('', 22),
          subtitle: pendingCount > 0 ? `${pendingCount} pago(s) por verificar` : 'Entradas y pases emitidos',
          color: 'blue',
          onClick: () => store.setView('bookings'),
        })
      );
    } else {
      kpiGrid.appendChild(
        StatCard({
          title: 'Reservas Globales',
          value: visibleBookings.length,
          icon: Icons.calendar('', 22),
          subtitle: seesAllBookings ? 'Citas agendadas totales' : 'Mis sesiones asignadas',
          color: 'amber',
          onClick: () => store.setView('bookings'),
        })
      );
    }

    container.appendChild(kpiGrid);

    // Paneles de Resumen Rápido (Próximas Sesiones y Convocatorias/Reservas)
    const splitSection = document.createElement('div');
    splitSection.className = 'dashboard-split-grid';

    // Columna 1: Próximas Sesiones (Cursos y Talleres)
    const upcomingSessions = [...tutorias]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    const tutoriasBox = document.createElement('div');
    tutoriasBox.className = 'card';
    tutoriasBox.innerHTML = `
      <div class="card-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <h3 class="card-title">Próximas Sesiones de Cursos & Talleres</h3>
        <div style="display:flex; gap:0.35rem;">
          <button class="btn btn-xs btn-outline" id="dash-view-all-courses" title="Ver catálogo de Cursos y Talleres">Ver Catálogo de Cursos & Talleres</button>
        </div>
      </div>
      <div class="card-body">
        ${upcomingSessions.length === 0 ? '<p class="text-muted">No hay sesiones académicas programadas actualmente.</p>' : `
          <ul class="activity-list">
            ${upcomingSessions.map((t) => {
              const matchedCourse = t.course || courses.find((c) => c.id === t.courseId);
              const titleLower = (t.title || '').toLowerCase();
              const courseLower = (matchedCourse?.title || '').toLowerCase();

              let typeBadge = '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.68rem; padding:1px 6px;">Taller</span>';
              if (titleLower.includes('taller') || courseLower.includes('taller') || titleLower.includes('laboratorio')) {
                typeBadge = '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.68rem; padding:1px 6px;">Taller</span>';
              } else if (titleLower.includes('bootcamp') || courseLower.includes('bootcamp') || courseLower.includes('curso') || titleLower.includes('masterclass')) {
                typeBadge = '<span class="badge" style="background:#f3e8ff; color:#7e22ce; font-size:0.68rem; padding:1px 6px;">Curso</span>';
              } else if (titleLower.includes('hackathon') || courseLower.includes('hackathon') || titleLower.includes('ctf')) {
                typeBadge = '<span class="badge" style="background:#fef3c7; color:#b45309; font-size:0.68rem; padding:1px 6px;">Hackathon</span>';
              } else {
                typeBadge = '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.68rem; padding:1px 6px;">Taller Práctico</span>';
              }

              return `
                <li class="activity-item">
                  <div class="activity-icon" style="display:flex; align-items:center; justify-content:center;">${Icons.cap('', 18)}</div>
                  <div class="activity-content">
                    <div class="activity-title" style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                      <span>${t.title}</span>
                      ${typeBadge}
                    </div>
                    <div class="activity-meta">
                      <strong>${matchedCourse?.title || 'Programa Académico UPDS'}</strong> ·
                      <span>${Badge.formatDate(t.date)}</span>
                      ${t.location ? `· <span>${t.location}</span>` : ''}
                    </div>
                  </div>
                  <div class="activity-status">
                    ${Badge.tutoriaStatus(t.status)}
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        `}
      </div>
    `;

    // Columna 2: Eventos Tech para Administrador / Reservas para Tutores
    const rightBox = document.createElement('div');
    rightBox.className = 'card';

    if (role === 'admin') {
      const storedEvents = getStoredEvents().slice(0, 4);
      rightBox.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">Convocatorias & Eventos Tech</h3>
          <button class="btn btn-sm btn-outline" id="dash-view-all-events">Ver todos</button>
        </div>
        <div class="card-body">
          ${storedEvents.length === 0 ? '<p class="text-muted">No hay eventos registrados.</p>' : `
            <ul class="activity-list">
              ${storedEvents.map((ev) => `
                <li class="activity-item">
                  <div class="activity-icon" style="display:flex; align-items:center; justify-content:center;">${Icons.trophy('', 18)}</div>
                  <div class="activity-content">
                    <div class="activity-title">${ev.title}</div>
                    <div class="activity-meta">
                      <span>${ev.organizer}</span> ·
                      <span>${ev.date}</span>
                    </div>
                  </div>
                  <div class="activity-status">
                    <span class="event-badge-status" style="font-size:0.7rem; padding:2px 8px; ${ev.status === 'cancelled' ? 'background:#ef4444; color:#ffffff;' : ''}">
                      ${ev.status === 'cancelled' ? 'Cancelado' : ev.badge}
                    </span>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      `;
    } else {
      const recentBookings = visibleBookings.slice(0, 4);
      rightBox.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">${seesAllBookings ? 'Últimas Reservas de Estudiantes' : 'Mis Sesiones'}</h3>
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
                      <span>${b.course?.title || 'Curso / Taller'}</span> ·
                      <span>${Badge.formatDate(b.scheduledAt)}</span>
                    </div>
                  </div>
                  <div class="activity-status">
                    ${Badge.bookingStatus(b.status, b.receiptUrl)}
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      `;
    }

    splitSection.appendChild(tutoriasBox);
    splitSection.appendChild(rightBox);
    container.appendChild(splitSection);

    // Eventos
    tutoriasBox.querySelector('#dash-view-all-courses')?.addEventListener('click', () => {
      store.setView('courses');
    });

    rightBox.querySelector('#dash-view-all-events')?.addEventListener('click', () => {
      store.setView('events');
    });

    rightBox.querySelector('#dash-view-all-bookings')?.addEventListener('click', () => {
      store.setView('bookings');
    });

    return container;
  },
};

