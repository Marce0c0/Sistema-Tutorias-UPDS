// Vista Integral de Foros & Comunidad Universitaria — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { can } from '../utils/permissions.js';
import { Icons } from '../components/Icons.js';
import { Pagination } from '../components/Pagination.js';
import { getStoredEvents } from './EventsView.js';
import { Navbar } from '../components/Navbar.js';
import {
  DEFAULT_FORUM_COVER,
  FORUM_CATEGORIES,
  getCategoryById,
  parseForumContent,
  formatForumContent,
  getRepliesForMessage,
  saveReplyForMessage,
  isThreadSubscribed,
  toggleThreadSubscription,
} from '../utils/forumData.js';

export const getCourseForumAccess = (courseId, activeUser, bookings = []) => {
  if (!activeUser || activeUser.role === 'guest') {
    return {
      allowed: false,
      reason: 'guest',
      message: 'Inicia sesión con tu cuenta universitaria para participar en este foro.',
    };
  }
  // Docentes, Tutores y Administradores tienen acceso total como moderadores
  if (activeUser.role === 'admin' || activeUser.role === 'tutor') {
    return { allowed: true, reason: 'staff' };
  }
  if (!courseId) {
    return { allowed: true, reason: 'general' };
  }
  // Para estudiantes: verificar si tienen inscripción confirmada en este curso
  const studentBooking = (bookings || []).find((b) => b.courseId === courseId && b.studentId === activeUser.id);
  if (!studentBooking) {
    return {
      allowed: false,
      reason: 'not_enrolled',
      message: 'Este foro es exclusivo para estudiantes matriculados en este curso o taller. Inscríbete para participar en las consultas y debates.',
    };
  }
  if (studentBooking.status === 'pending') {
    return {
      allowed: false,
      reason: 'pending_payment',
      message: 'Tu inscripción para este curso está en espera de verificación de comprobante por Administración. Podrás comentar en cuanto sea aprobada.',
    };
  }
  if (studentBooking.status === 'confirmed') {
    return { allowed: true, reason: 'enrolled', booking: studentBooking };
  }
  return {
    allowed: false,
    reason: 'inactive_booking',
    message: 'Tu estado de inscripción no permite comentar en este foro en este momento.',
  };
};

export const ForumsView = {
  render() {
    const state = store.getState();
    const role = state.activeUser?.role;
    const canModerate = can(role, 'forums.moderate');
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    // Estado local de navegación en foros
    let currentChannel = 'all'; // 'all', 'general', 'events', 'courses'
    let selectedSubId = '';      // ID de evento o ID de curso específico
    let selectedCategory = 'all'; // 'all', 'pregunta', 'recomendacion', 'equipo', 'debate', 'soporte'
    let currentPage = 1;
    const PAGE_SIZE = 6;

    // Soporte para navegación directa desde tarjetas de Eventos o Cursos
    if (window.__pendingForumNav) {
      currentChannel = window.__pendingForumNav.channel || 'all';
      selectedSubId = window.__pendingForumNav.subId || '';
      window.__pendingForumNav = null;
    }

    const renderView = () => {
      const currentState = store.getState();
      const allMessages = currentState.forums || [];
      const courses = currentState.courses || [];
      const events = getStoredEvents();

      // Auto-asegurar foros oficiales para cada curso y evento si no existen aún en la base de datos
      const existingCourseIds = new Set((allMessages || []).map((m) => m.courseId));
      const autoCourseForums = courses
        .filter((c) => !existingCourseIds.has(c.id))
        .map((c) => ({
          id: `auto-forum-${c.id}`,
          courseId: c.id,
          userId: c.tutorId || 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
          user: { name: 'Maria Gomez', role: 'tutor' },
          title: `Foro Oficial: ${c.title}`,
          content: `<!--upds_meta:{"category":"debate","channel":"course:${c.id}","coverImage":null}-->\nEspacio oficial de consultas y debate para el taller o curso ${c.title}. Aquí los estudiantes matriculados pueden formular sus preguntas técnicas y recibir respuestas de la docente titular y compañeros.`,
          createdAt: c.createdAt || new Date().toISOString(),
          isAutoProvisioned: true,
        }));

      const existingEventChannels = new Set((allMessages || []).map((m) => {
        const { meta } = parseForumContent(m.content);
        return meta?.channel;
      }));
      const autoEventForums = events
        .filter((e) => !existingEventChannels.has(`event:${e.id}`))
        .map((e) => ({
          id: `auto-forum-event-${e.id}`,
          courseId: courses[0]?.id || '7602b258-16be-4d49-9160-19d5e2b14422',
          userId: '3b593672-04b3-469b-9ffb-149eb0f317b9',
          user: { name: 'Coordinación Académica UPDS', role: 'admin' },
          title: `Foro Oficial: ${e.title}`,
          content: `<!--upds_meta:{"category":"debate","channel":"event:${e.id}","coverImage":null}-->\nEspacio oficial de consultas y coordinación de equipos para ${e.title}. Abierto a toda la comunidad universitaria para resolver dudas del reto tecnológico.`,
          createdAt: e.startDate || new Date().toISOString(),
          isAutoProvisioned: true,
        }));

      const fullMessagesList = [...allMessages, ...autoCourseForums, ...autoEventForums];

      // Enriquecer cada mensaje con sus metadatos y autoría oficial
      const enrichedMessages = fullMessagesList.map((m) => {
        const { text, meta } = parseForumContent(m.content);
        const replies = getRepliesForMessage(m.id);
        const categoryObj = getCategoryById(meta.category);

        // Resolver nombre del canal / subforo
        let channelName = 'Foro General UPDS';
        let isEvent = false;

        if (meta.channel === 'general') {
          channelName = 'Foro General & Ayuda';
        } else if (meta.channel && meta.channel.startsWith('event:')) {
          const evId = meta.channel.replace('event:', '');
          const ev = events.find((e) => e.id === evId);
          channelName = ev ? `Evento: ${ev.title}` : 'Hackathon / Evento';
          isEvent = true;
        } else {
          // Por defecto es un curso o taller
          const course = courses.find((c) => c.id === m.courseId);
          if (course) {
            const isHackathon = course.title.toLowerCase().includes('hackathon') || course.title.toLowerCase().includes('ctf');
            channelName = isHackathon ? `Evento: ${course.title}` : `Curso: ${course.title}`;
            isEvent = isHackathon;
          }
        }

        // Lógica de autoría institucional:
        // - Hackathons y Eventos: Creados exclusivamente por el Administrador (Coordinación Académica UPDS).
        // - Cursos y Talleres: Creados por el Tutor/Docente asignado o por el Administrador.
        let authorUser = m.user;
        if (isEvent) {
          authorUser = { name: 'Coordinación Académica UPDS', role: 'admin' };
        } else if (!authorUser || authorUser.role === 'student') {
          if (m.userId === '3b593672-04b3-469b-9ffb-149eb0f317b9') {
            authorUser = { name: 'Coordinación Académica UPDS', role: 'admin' };
          } else {
            authorUser = { name: 'Maria Gomez', role: 'tutor' };
          }
        }

        return {
          ...m,
          user: authorUser,
          parsedText: text,
          meta,
          replies,
          repliesCount: replies.length,
          categoryObj,
          channelName,
          isEvent,
        };
      });

      // Métricas por canal para badges numéricos
      const coursesCount = enrichedMessages.filter((m) => !m.isEvent && m.meta.channel !== 'general').length;
      const eventsCount = enrichedMessages.filter((m) => m.isEvent || (m.meta.channel && m.meta.channel.startsWith('event:'))).length;
      const generalCount = enrichedMessages.filter((m) => m.meta.channel === 'general').length;

      // Filtrado por Canal Principal
      let filtered = enrichedMessages;

      if (currentChannel === 'general') {
        filtered = filtered.filter((m) => m.meta.channel === 'general');
      } else if (currentChannel === 'events') {
        filtered = filtered.filter((m) => m.isEvent || (m.meta.channel && m.meta.channel.startsWith('event:')));
        if (selectedSubId) {
          filtered = filtered.filter(
            (m) => m.meta.channel === `event:${selectedSubId}` || m.courseId === selectedSubId
          );
        }
      } else if (currentChannel === 'courses') {
        filtered = filtered.filter((m) => !m.isEvent && m.meta.channel !== 'general');
        if (selectedSubId) {
          filtered = filtered.filter((m) => m.courseId === selectedSubId || m.meta.channel === `course:${selectedSubId}`);
        }
      }

      // Filtrado por Categoría
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((m) => m.meta.category === selectedCategory);
      }

      // Paginación
      const pagination = Pagination.paginate(filtered, currentPage, PAGE_SIZE);
      currentPage = pagination.currentPage;

      // Resolver Banner Informativo de Acceso si hay un Subforo Seleccionado
      let subforumBannerHTML = '';
      if (currentChannel === 'events' && selectedSubId) {
        const ev = events.find((e) => e.id === selectedSubId);
        if (ev) {
          subforumBannerHTML = `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #16a34a; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
              <div>
                <strong style="color:#15803d; font-size:0.92rem; display:flex; align-items:center; gap:0.4rem;">
                  ${Icons.trophy('', 15)} <span>Subforo de Hackathon: ${ev.title}</span>
                </strong>
                <p style="margin:2px 0 0; font-size:0.8rem; color:#166534;">
                  Espacio abierto a toda la comunidad: formula dudas de retos, busca compañeros de equipo o coordina proyectos sin restricción de aranceles.
                </p>
              </div>
              <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">Participación Libre</span>
            </div>
          `;
        }
      } else if (currentChannel === 'courses' && selectedSubId) {
        const course = courses.find((c) => c.id === selectedSubId);
        if (course) {
          const access = getCourseForumAccess(course.id, currentState.activeUser, currentState.bookings);
          const isAllowed = access.allowed;
          const isPending = access.reason === 'pending_payment';
          subforumBannerHTML = `
            <div style="background:${isAllowed ? '#eff6ff' : isPending ? '#fffbeb' : '#f8fafc'}; border:1px solid ${isAllowed ? '#bfdbfe' : isPending ? '#fde68a' : '#cbd5e1'}; border-left:4px solid ${isAllowed ? '#2563eb' : isPending ? '#d97706' : '#64748b'}; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
              <div>
                <strong style="color:${isAllowed ? '#1e40af' : isPending ? '#92400e' : '#334155'}; font-size:0.92rem; display:flex; align-items:center; gap:0.4rem;">
                  ${Icons.book('', 15)} <span>Subforo Académico: ${course.title}</span>
                </strong>
                <p style="margin:2px 0 0; font-size:0.8rem; color:${isAllowed ? '#1e3a8a' : isPending ? '#78350f' : '#64748b'};">
                  ${isAllowed ? (access.reason === 'staff' ? 'Modo Docente/Admin: Acceso completo para resolver consultas y moderar.' : 'Estudiante Matriculado Confirmado: Acceso completo para debatir y publicar dudas.') : access.message}
                </p>
              </div>
              <div>
                ${isAllowed ? `
                  <span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">Acceso Autorizado</span>
                ` : isPending ? `
                  <a href="#bookings" class="btn btn-xs btn-warning" style="white-space:nowrap; gap:0.3rem;">
                    ${Icons.ticket('', 11)} Ver Comprobante
                  </a>
                ` : `
                  <a href="#courses" class="btn btn-xs btn-primary" style="white-space:nowrap; gap:0.3rem;">
                    ${Icons.cap('', 11)} Inscribirme al Curso
                  </a>
                `}
              </div>
            </div>
          `;
        }
      }

      const isStaff = role === 'admin' || role === 'tutor';

      container.innerHTML = `
        <div class="view-header">
          <div>
            <h2 class="view-title" style="display:flex;align-items:center;gap:0.55rem;">
              ${Icons.chat('', 24)} <span>Foros Oficiales de Consultas & Comunidad UPDS</span>
            </h2>
            <p class="view-subtitle">Los foros son creados automáticamente o por los docentes de cada taller o curso. Ingresa a cualquier foro para formular tus dudas y recibir respuestas oficiales adentro.</p>
          </div>
          <div class="view-actions">
            ${isStaff ? `
              <button id="btn-create-forum" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.45rem;">
                ${Icons.chat('', 16)} <span>+ Publicar Nuevo Foro Oficial</span>
              </button>
            ` : `
              <button id="btn-student-forum-help" class="btn btn-outline" style="border-color:var(--primary-navy); color:var(--primary-navy); font-weight:700; display:inline-flex; align-items:center; gap:0.45rem;">
                ${Icons.chat('', 15)} <span>Mis Foros & Consultas</span>
              </button>
            `}
          </div>
        </div>

        <!-- Barra de Canales & Subforos -->
        <div class="forum-channels-nav" role="tablist">
          <button type="button" class="forum-channel-tab ${currentChannel === 'all' ? 'active' : ''}" data-channel="all">
            ${Icons.layers('', 15)} <span>Todos los Foros</span>
            <span class="badge-count" style="font-size:0.75rem; padding:2px 7px; border-radius:12px; background:#f1f5f9; color:#475569;">${enrichedMessages.length}</span>
          </button>

          <button type="button" class="forum-channel-tab ${currentChannel === 'courses' ? 'active' : ''}" data-channel="courses">
            ${Icons.book('', 15)} <span>Foros de Cursos & Talleres</span>
            <span class="badge-count" style="font-size:0.75rem; padding:2px 7px; border-radius:12px; background:#f1f5f9; color:#475569;">${coursesCount}</span>
          </button>

          <button type="button" class="forum-channel-tab ${currentChannel === 'events' ? 'active' : ''}" data-channel="events">
            ${Icons.trophy('', 15)} <span>Foros de Hackathons</span>
            <span class="badge-count" style="font-size:0.75rem; padding:2px 7px; border-radius:12px; background:#f1f5f9; color:#475569;">${eventsCount}</span>
          </button>

          <button type="button" class="forum-channel-tab ${currentChannel === 'general' ? 'active' : ''}" data-channel="general">
            ${Icons.globe('', 15)} <span>Foro General de Ayuda</span>
            <span class="badge-count" style="font-size:0.75rem; padding:2px 7px; border-radius:12px; background:#f1f5f9; color:#475569;">${generalCount}</span>
          </button>
        </div>

        <!-- Barra de Sub-Filtros (Categorías y Selector Específico) -->
        <div class="forum-sub-filter-bar">
          <div class="forum-category-pills">
            <button type="button" class="forum-cat-btn ${selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
              Todas
            </button>
            ${FORUM_CATEGORIES.map(
              (cat) => `
              <button type="button" class="forum-cat-btn ${selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                <span>${cat.icon}</span> <span>${cat.label}</span>
              </button>
            `
            ).join('')}
          </div>

          ${currentChannel === 'events' ? `
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <label for="forum-sub-select" style="font-size:0.82rem; font-weight:600; color:#64748b;">Subforo de Evento:</label>
              <select id="forum-sub-select" class="form-control" style="width:auto; font-size:0.83rem; padding:4px 8px;">
                <option value="">Todos los eventos tecnológicos</option>
                ${events.map((e) => `<option value="${e.id}" ${selectedSubId === e.id ? 'selected' : ''}>${e.title}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          ${currentChannel === 'courses' ? `
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <label for="forum-sub-select" style="font-size:0.82rem; font-weight:600; color:#64748b;">Materia o Taller:</label>
              <select id="forum-sub-select" class="form-control" style="width:auto; font-size:0.83rem; padding:4px 8px;">
                <option value="">Todos los cursos y talleres</option>
                ${courses.map((c) => `<option value="${c.id}" ${selectedSubId === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        ${subforumBannerHTML}

        <!-- Feed de Consultas y Foros -->
        <div id="forum-cards-container">
          ${filtered.length === 0 ? `
            <div id="forum-empty-mount"></div>
          ` : `
            <div class="forum-cards-grid">
              ${pagination.items
                .map((m) => {
                  const coverSrc = m.meta.coverImage || DEFAULT_FORUM_COVER;
                  const cat = m.categoryObj;
                  return `
                  <div class="forum-card-v2">
                    <div class="forum-card-cover-wrapper">
                      <img src="${coverSrc}" alt="Portada de la consulta" class="forum-card-cover-img" loading="lazy" />
                      <span class="forum-card-cover-badge" style="background:${cat.bg}; color:${cat.color}; border:1px solid ${cat.border};">
                        ${cat.icon} ${cat.label}
                      </span>
                      <span class="forum-card-channel-badge">${m.channelName}</span>
                    </div>

                    <div class="forum-card-body">
                      <div class="forum-card-author-row">
                        <div class="forum-card-user-info">
                          <div class="forum-user-avatar-mini" style="background:${m.isEvent || m.user?.role === 'admin' ? 'var(--primary-navy)' : '#059669'}; color:#ffffff; font-weight:800;">
                            ${m.isEvent || m.user?.role === 'admin' ? 'A' : (m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'D')}
                          </div>
                          <div>
                            <span style="font-weight:700; color:#0f172a;">${m.isEvent ? 'Coordinación Académica UPDS' : (m.user?.name || 'Docente Titular UPDS')}</span>
                            <div style="font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:0.3rem;">
                              <span class="tutor-verified-badge" style="font-size:0.68rem; padding:1px 6px; background:${m.isEvent || m.user?.role === 'admin' ? 'var(--primary-navy)' : '#059669'};">
                                ${Icons.shield('', 10)} ${m.isEvent ? 'Administración UPDS (Organizador)' : (m.user?.role === 'admin' ? 'Administración' : 'Docente Tutor')}
                              </span>
                              · ${Badge.formatDate(m.createdAt)}
                            </div>
                          </div>
                        </div>

                        ${canModerate || m.userId === currentState.activeUser?.id ? `
                          <div style="display:inline-flex; align-items:center; gap:0.25rem;">
                            <button class="btn btn-xs btn-outline btn-edit-forum" data-id="${m.id}" title="Editar">${Icons.edit('', 12)}</button>
                            <button class="btn btn-xs btn-danger-outline btn-delete-forum" data-id="${m.id}" title="Eliminar">${Icons.trash('', 12)}</button>
                          </div>
                        ` : ''}
                      </div>

                      <h3 class="forum-card-title-v2" title="${m.title}">${m.title}</h3>
                      <p class="forum-card-snippet" title="${m.parsedText}">${m.parsedText}</p>

                      <div class="forum-card-footer-v2">
                        <span class="forum-replies-counter">
                          ${Icons.chat('', 14)} <strong>${m.repliesCount}</strong> ${m.repliesCount === 1 ? 'consulta/respuesta' : 'consultas y respuestas'}
                        </span>
                        <button type="button" class="btn btn-sm btn-primary btn-open-thread" data-id="${m.id}" style="font-weight:600; gap:0.35rem; padding:6px 14px;">
                          ${Icons.chat('', 13)} Ingresar al Foro
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>

            ${Pagination.renderHTML(pagination)}
          `}
        </div>
      `;

      // Si la lista está vacía, montar EmptyState
      if (filtered.length === 0) {
        const mount = container.querySelector('#forum-empty-mount');
        if (mount) {
          mount.appendChild(
            EmptyState({
              icon: Icons.chat('', 36),
              title: 'No hay foros en este canal',
              description: 'Los foros oficiales son creados automáticamente o por los docentes tutores de cada curso y taller.',
              actionText: isStaff ? '+ Publicar Foro Oficial' : 'Ver Todos los Foros',
              onAction: () => {
                if (isStaff) {
                  this.openCreateModal(renderView, currentChannel, selectedSubId);
                } else {
                  currentChannel = 'all';
                  selectedSubId = '';
                  renderView();
                }
              },
            })
          );
        }
      }

      // Enlazar Paginación
      Pagination.bindEvents(container, (newPage) => {
        currentPage = newPage;
        renderView();
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // Enlazar Pestañas de Canales
      container.querySelectorAll('.forum-channel-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          currentChannel = tab.getAttribute('data-channel');
          selectedSubId = '';
          currentPage = 1;
          renderView();
        });
      });

      // Enlazar Filtros de Categorías
      container.querySelectorAll('.forum-cat-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedCategory = btn.getAttribute('data-cat');
          currentPage = 1;
          renderView();
        });
      });

      // Enlazar Sub-Selector de Evento / Curso
      container.querySelector('#forum-sub-select')?.addEventListener('change', (e) => {
        selectedSubId = e.target.value;
        currentPage = 1;
        renderView();
      });

      // Botón Publicar Nuevo Tema (Docentes / Admin)
      container.querySelector('#btn-create-forum')?.addEventListener('click', () => {
        this.openCreateModal(renderView, currentChannel, selectedSubId);
      });

      // Botón Mis Foros & Consultas (Estudiantes)
      container.querySelector('#btn-student-forum-help')?.addEventListener('click', () => {
        this.openStudentForumsGuideModal(renderView);
      });

      // Botones de Abrir Hilo de Discusión / Debate
      container.querySelectorAll('.btn-open-thread').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const message = enrichedMessages.find((m) => m.id === id);
          if (message) this.openThreadModal(message, renderView);
        });
      });

      // Editar / Eliminar para Dueño o Moderador
      container.querySelectorAll('.btn-edit-forum').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const message = enrichedMessages.find((m) => m.id === id);
          if (message) this.openEditModal(message, renderView);
        });
      });

      container.querySelectorAll('.btn-delete-forum').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const message = enrichedMessages.find((m) => m.id === id);
          if (message) this.confirmDelete(message, renderView);
        });
      });
    };

    renderView();
    return container;
  },

  // Modal para Guiar a los Estudiantes a sus Foros Correspondientes
  openStudentForumsGuideModal(onRefresh) {
    const state = store.getState();
    const activeUser = state.activeUser;
    const courses = state.courses || [];
    const events = getStoredEvents();
    const bookings = state.bookings || [];

    // Cursos con matrícula confirmada
    const enrolledBookings = bookings.filter((b) => b.studentId === activeUser.id && b.status === 'confirmed');
    const enrolledCourseIds = new Set(enrolledBookings.map((b) => b.courseId));
    const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c.id));

    Modal.open({
      title: 'Espacios de Consultas y Foros Académicos UPDS',
      size: 'lg',
      content: `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid var(--primary-navy); border-radius:8px; padding:12px 16px;">
            <strong style="color:var(--primary-navy); font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.pin('', 16)} <span>¿Cómo participar en los foros?</span>
            </strong>
            <p style="margin:4px 0 0; font-size:0.84rem; color:#475569; line-height:1.5;">
              Todos los foros son creados automáticamente o publicados por los docentes de cada curso y taller. Para participar, ingresa al foro correspondiente donde podrás formular tus preguntas y recibir respuestas oficiales del docente y tus compañeros.
            </p>
          </div>

          <div>
            <h4 style="font-size:0.95rem; color:#0f172a; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.book('', 16)} <span>Tus Cursos y Talleres Matriculados (${enrolledCourses.length})</span>
            </h4>
            ${enrolledCourses.length === 0 ? `
              <div style="padding:1rem; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; font-size:0.85rem; color:#92400e;">
                Aún no tienes inscripciones confirmadas en cursos o talleres de pago. Puedes inscribirte en la sección de Cursos para acceder a sus foros de consultas.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${enrolledCourses.map((c) => `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; gap:0.75rem; flex-wrap:wrap;">
                    <div>
                      <strong style="font-size:0.9rem; color:#0f172a; display:block;">${c.title}</strong>
                      <span style="font-size:0.76rem; color:#059669; font-weight:700; display:inline-flex; align-items:center; gap:0.3rem;">${Icons.check('', 12)} Matriculado · Acceso Completo a Consultas</span>
                    </div>
                    <button type="button" class="btn btn-xs btn-primary btn-jump-course-forum" data-id="${c.id}" style="white-space:nowrap; gap:0.3rem;">
                      ${Icons.chat('', 12)} Ingresar al Foro
                    </button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div>
            <h4 style="font-size:0.95rem; color:#0f172a; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.trophy('', 16)} <span>Foros Abiertos de Hackathons & Eventos (${events.length})</span>
            </h4>
            <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:220px; overflow-y:auto;">
              ${events.map((e) => `
                <div style="display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; gap:0.75rem; flex-wrap:wrap;">
                  <div>
                    <strong style="font-size:0.9rem; color:#0f172a; display:block;">${e.title}</strong>
                    <span style="font-size:0.76rem; color:#15803d; font-weight:700;">Participación Libre · Búsqueda de Equipos</span>
                  </div>
                  <button type="button" class="btn btn-xs btn-outline btn-jump-event-forum" data-id="${e.id}" style="white-space:nowrap; gap:0.3rem;">
                    ${Icons.chat('', 12)} Ver Foro
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      confirmText: null,
      cancelText: 'Cerrar',
    });

    const modalEl = document.querySelector('.modal-overlay');
    modalEl?.querySelectorAll('.btn-jump-course-forum').forEach((btn) => {
      btn.addEventListener('click', () => {
        const courseId = btn.getAttribute('data-id');
        Modal.close();
        window.__pendingForumNav = { channel: 'courses', subId: courseId };
        onRefresh();
      });
    });

    modalEl?.querySelectorAll('.btn-jump-event-forum').forEach((btn) => {
      btn.addEventListener('click', () => {
        const evId = btn.getAttribute('data-id');
        Modal.close();
        window.__pendingForumNav = { channel: 'events', subId: evId };
        onRefresh();
      });
    });
  },

  // Modal de Hilo Completo de Discusión y Comentarios
  openThreadModal(message, onRefresh = () => {}) {
    const state = store.getState();
    const activeUser = state.activeUser;
    const isGuest = !activeUser || activeUser.role === 'guest';
    const coverSrc = message.meta.coverImage || DEFAULT_FORUM_COVER;
    const cat = message.categoryObj;
    let replies = getRepliesForMessage(message.id);
    let isSubscribed = !isGuest && isThreadSubscribed(message.id, activeUser?.id);

    const renderRepliesList = (repliesArr) => {
      if (repliesArr.length === 0) {
        return `
          <div style="text-align:center; padding:1.8rem 1rem; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; color:#64748b; font-size:0.88rem;">
            ${Icons.chat('', 22)}
            <p style="margin:0.5rem 0 0; font-weight:600; color:#475569;">Aún no se han formulado preguntas en este foro.</p>
            <p style="margin:0.25rem 0 0; font-size:0.8rem; color:#94a3b8;">¡Formula tu duda técnica o consulta sobre el taller para que el docente te responda!</p>
          </div>
        `;
      }
      return repliesArr
        .map(
          (r, idx) => {
            const isTutor = r.userRole === 'tutor' || r.userRole === 'admin';
            const avatarChar = r.userName ? r.userName.charAt(0).toUpperCase() : 'U';
            return `
              <div class="thread-comment-card ${isTutor ? 'is-tutor-response' : 'student-question-card'}">
                <div class="thread-comment-header">
                  <div class="thread-comment-author-info">
                    <div class="thread-comment-avatar ${isTutor ? 'avatar-tutor' : ''}">
                      ${avatarChar}
                    </div>
                    <div>
                      <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                        <span class="thread-comment-name">${r.userName || 'Usuario'}</span>
                        ${isTutor ? `
                          <span class="tutor-verified-badge" title="Respuesta verificada por Docente/Tutor">
                            ${Icons.shield('', 11)} ${r.userRole === 'admin' ? 'Coordinación' : 'Docente Tutor'}
                          </span>
                        ` : `
                          <span class="student-question-badge" style="display:inline-flex; align-items:center; gap:0.25rem;">
                            ${Icons.helpCircle('', 11)} <span>Pregunta de Estudiante</span>
                          </span>
                        `}
                      </div>
                      <div class="thread-comment-date">${Badge.formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <span class="thread-comment-num">#${idx + 1}</span>
                </div>
                <div class="thread-comment-text">${r.content.replace(/\n/g, '<br/>')}</div>
              </div>
            `;
          }
        )
        .join('');
    };

    const isEventOrGeneral = message.isEvent || message.meta.channel === 'general' || (message.meta.channel && message.meta.channel.startsWith('event:'));
    const access = isEventOrGeneral
      ? (isGuest ? { allowed: false, reason: 'guest', message: 'Inicia sesión con tu cuenta universitaria para poder aportar.' } : { allowed: true, reason: 'open' })
      : getCourseForumAccess(message.courseId, activeUser, state.bookings);

    const dialog = Modal.open({
      title: message.title.startsWith('Foro Oficial') ? message.title : `Foro Oficial: ${message.title}`,
      size: 'xl',
      content: `
        <div class="forum-thread-wrapper">
          <div class="forum-thread-banner-box">
            <img src="${coverSrc}" alt="Portada del hilo" class="forum-thread-banner-img" />
            <div class="forum-thread-banner-overlay">
              <div class="forum-thread-banner-chips">
                <span class="forum-card-cover-badge" style="position:static; background:${cat.bg}; color:${cat.color}; border:1px solid ${cat.border};">
                  ${cat.icon} ${cat.label}
                </span>
                <span style="font-size:0.8rem; font-weight:700; color:#ffffff; background:rgba(0, 45, 98, 0.88); backdrop-filter:blur(4px); padding:3px 10px; border-radius:4px; border:1px solid rgba(255,255,255,0.25);">
                  ${message.channelName}
                </span>
              </div>
            </div>
          </div>

          <!-- Cuadro de la Presentación Oficial del Foro -->
          <div class="thread-op-card">
            <div class="thread-op-header">
              <div class="thread-author-group">
                <div class="thread-author-avatar" style="background:${message.isEvent || message.user?.role === 'admin' ? 'var(--primary-navy)' : '#059669'}; color:#ffffff; font-weight:800;">
                  ${message.isEvent || message.user?.role === 'admin' ? 'A' : (message.user?.name ? message.user.name.charAt(0).toUpperCase() : 'D')}
                </div>
                <div>
                  <div class="thread-author-name" style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                    <span>${message.isEvent ? 'Coordinación Académica UPDS' : (message.user?.name || 'Docente Titular UPDS')}</span>
                    <span class="thread-op-badge" style="background:${message.isEvent || message.user?.role === 'admin' ? 'var(--primary-navy)' : '#059669'}; color:#ffffff;">
                      ${Icons.shield('', 11)} ${message.isEvent ? 'Administración Central (Organizador)' : (message.user?.role === 'admin' ? 'Coordinación Académica' : 'Docente Tutor UPDS')}
                    </span>
                  </div>
                  <div class="thread-meta-sub">
                    ${message.isEvent ? 'Foro Oficial de Hackathon · Creado por Administración Central' : 'Foro Oficial de Curso/Taller · Creado por ' + (message.user?.role === 'admin' ? 'Administración' : 'Docente Titular')} · ${Badge.formatDate(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <h2 class="thread-op-title">${message.title}</h2>
            <div class="thread-op-body">
              ${message.parsedText.replace(/\n/g, '<br/>')}
            </div>
          </div>

          <!-- Sección de Preguntas y Respuestas del Foro -->
          <div class="forum-comments-section">
            <div class="forum-comments-header-row" style="margin-bottom:0.85rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.6rem; display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; flex-wrap:wrap;">
              <div>
                <h4 class="forum-comments-title" style="margin:0; font-size:1.05rem; display:flex; align-items:center; gap:0.5rem; color:#0f172a;">
                  ${Icons.chat('', 18)} <span>Preguntas & Respuestas en este Foro (<span id="thread-reply-count">${replies.length}</span>)</span>
                </h4>
                <p style="margin:2px 0 0; font-size:0.8rem; color:#64748b;">
                  Espacio para que los estudiantes matriculados formulen sus preguntas técnicas y reciban respuestas oficiales del docente y compañeros.
                </p>
              </div>
              ${!isGuest ? `
                <div>
                  <button type="button" id="btn-toggle-thread-sub" class="btn btn-xs ${isSubscribed ? 'btn-primary-outline' : 'btn-outline'}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:5px 12px; border-radius:6px; font-weight:600; cursor:pointer;" title="Configurar si recibes avisos de nuevas respuestas en tu campanita">
                    ${isSubscribed ? `${Icons.bell('', 13)} <span>Notificaciones del hilo: <strong>Activadas</strong></span>` : `${Icons.bellOff('', 13)} <span>Notificaciones del hilo: <strong>Silenciadas</strong></span>`}
                  </button>
                </div>
              ` : ''}
            </div>

            <div id="thread-replies-list" style="display:flex; flex-direction:column; gap:0.75rem;">
              ${renderRepliesList(replies)}
            </div>

            ${access.allowed ? `
              ${activeUser?.role === 'student' ? `
                <!-- Formulario para que el Estudiante formule su Pregunta -->
                <div class="thread-reply-box" style="margin-top:1.25rem; border:1.5px solid #bfdbfe; background:#f8fafc; border-radius:8px; padding:1.1rem;">
                  <div class="thread-reply-box-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.65rem;">
                    <div style="display:flex; align-items:center; gap:0.55rem;">
                      <div class="thread-comment-avatar" style="background:var(--primary-navy); color:#ffffff; font-weight:700; width:28px; height:28px; font-size:0.75rem;">
                        ${activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <strong style="font-size:0.88rem; color:var(--primary-navy); display:block;">
                          Formular una Pregunta o Consulta en este Foro
                        </strong>
                        <span style="font-size:0.75rem; color:#64748b;">${activeUser.name} · Estudiante Matriculado</span>
                      </div>
                    </div>
                    <span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700; display:inline-flex; align-items:center; gap:0.25rem;">${Icons.chat('', 12)} Nueva Pregunta</span>
                  </div>

                  <div class="thread-reply-input-wrapper">
                    <textarea id="thread-new-reply-input" placeholder="Escribe tu pregunta o duda técnica sobre este curso/taller para que el docente y tus compañeros te respondan..." maxlength="1000"></textarea>
                  </div>

                  <div class="thread-reply-footer" style="display:flex; align-items:center; justify-content:space-between; margin-top:0.65rem; flex-wrap:wrap; gap:0.5rem;">
                    <small style="color:#64748b; font-size:0.78rem; display:inline-flex; align-items:center; gap:0.3rem;">
                      ${Icons.zap('', 12)} Tu duda será visible para el docente titular y compañeros matriculados.
                    </small>
                    <button type="button" id="btn-submit-reply" class="btn btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:0.35rem; padding:6px 16px; font-weight:700;">
                      ${Icons.rocket('', 13)} Publicar Pregunta
                    </button>
                  </div>
                </div>
              ` : `
                <!-- Formulario para Docente / Tutor / Admin -->
                <div class="thread-reply-box" style="margin-top:1.25rem; border:1.5px solid #a7f3d0; background:#f0fdf4; border-radius:8px; padding:1.1rem;">
                  <div class="thread-reply-box-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.65rem;">
                    <div style="display:flex; align-items:center; gap:0.55rem;">
                      <div class="thread-comment-avatar" style="background:#059669; color:#ffffff; font-weight:700; width:28px; height:28px; font-size:0.75rem;">
                        ${activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <strong style="font-size:0.88rem; color:#065f46; display:block;">
                          Publicar Respuesta u Orientación Oficial (Docente/Tutor)
                        </strong>
                        <span style="font-size:0.75rem; color:#047857;">${activeUser.name} · ${activeUser.role === 'admin' ? 'Coordinación' : 'Docente Titular'}</span>
                      </div>
                    </div>
                    <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700; display:inline-flex; align-items:center; gap:0.25rem;">${Icons.shield('', 12)} Respuesta Oficial</span>
                  </div>

                  <div class="thread-reply-input-wrapper">
                    <textarea id="thread-new-reply-input" placeholder="Escribe la respuesta oficial, aclaración técnica o material de apoyo para resolver las consultas de los estudiantes..." maxlength="1000"></textarea>
                  </div>

                  <div class="thread-reply-footer" style="display:flex; align-items:center; justify-content:space-between; margin-top:0.65rem; flex-wrap:wrap; gap:0.5rem;">
                    <small style="color:#047857; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:0.3rem;">
                      ${Icons.check('', 12)} Tu respuesta se destacará con insignia oficial de Docente/Tutor.
                    </small>
                    <button type="button" id="btn-submit-reply" class="btn btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:0.35rem; padding:6px 16px; font-weight:700; background:#059669; border-color:#059669;">
                      ${Icons.shield('', 13)} Publicar Respuesta de Docente
                    </button>
                  </div>
                </div>
              `}
            ` : `
              <!-- Aviso de Foro Bloqueado / Restringido -->
              <div class="forum-locked-comment-box ${access.reason === 'pending_payment' ? 'is-pending-box' : ''}">
                <div class="locked-box-icon">${access.reason === 'pending_payment' ? Icons.clock('', 26) : access.reason === 'guest' ? Icons.key('', 26) : Icons.lock('', 26)}</div>
                <div class="locked-box-text">
                  <strong>${access.reason === 'pending_payment' ? 'Inscripción en Espera de Verificación' : access.reason === 'guest' ? 'Modo Solo Lectura (Invitado)' : 'Foro Exclusivo para Matriculados'}</strong>
                  <p>${access.message}</p>
                </div>
                <div>
                  ${access.reason === 'pending_payment' ? `
                    <button type="button" class="btn btn-sm btn-outline" id="btn-goto-my-bookings" style="white-space:nowrap; gap:0.35rem; color:#92400e; border-color:#fde68a;">
                      ${Icons.ticket('', 13)} <span>Ver Comprobante</span>
                    </button>
                  ` : access.reason === 'not_enrolled' ? `
                    <button type="button" class="btn btn-sm btn-primary" id="btn-goto-enroll-course" style="white-space:nowrap; gap:0.35rem;">
                      ${Icons.cap('', 13)} <span>Inscribirme al Curso</span>
                    </button>
                  ` : `
                    <button type="button" class="btn btn-sm btn-outline" id="btn-guest-login-comment">
                      Iniciar Sesión
                    </button>
                  `}
                </div>
              </div>
            `}
          </div>
        </div>
      `,
      cancelText: 'Cerrar',
      confirmText: null, // Solo botón de cerrar
    });

    // Enlazar botones de navegación y envío
    const submitBtn = dialog.querySelector('#btn-submit-reply');
    const inputArea = dialog.querySelector('#thread-new-reply-input');
    const repliesListContainer = dialog.querySelector('#thread-replies-list');
    const countBadge = dialog.querySelector('#thread-reply-count');

    dialog.querySelector('#btn-goto-my-bookings')?.addEventListener('click', () => {
      Modal.close();
      window.location.hash = '#bookings';
    });
    dialog.querySelector('#btn-goto-enroll-course')?.addEventListener('click', () => {
      Modal.close();
      window.location.hash = '#courses';
    });
    dialog.querySelector('#btn-guest-login-comment')?.addEventListener('click', () => {
      Modal.close();
      Navbar.openLoginModal('forums');
    });

    // Botón de Alternar Suscripción a Notificaciones del Hilo
    const toggleSubBtn = dialog.querySelector('#btn-toggle-thread-sub');
    toggleSubBtn?.addEventListener('click', () => {
      const nowSubscribed = toggleThreadSubscription(message.id, activeUser?.id);
      if (nowSubscribed) {
        toggleSubBtn.className = 'btn btn-xs btn-primary-outline';
        toggleSubBtn.innerHTML = `${Icons.bell('', 13)} <span>Notificaciones del hilo: <strong>Activadas</strong></span>`;
        Toast.success('Notificaciones del hilo activadas. Recibirás avisos de nuevas consultas.');
      } else {
        toggleSubBtn.className = 'btn btn-xs btn-outline';
        toggleSubBtn.innerHTML = `${Icons.bellOff('', 13)} <span>Notificaciones del hilo: <strong>Silenciadas</strong></span>`;
        Toast.info('Hilo silenciado: ya no recibirás alertas de este debate.');
      }
    });

    submitBtn?.addEventListener('click', async () => {
      const text = inputArea.value.trim();
      if (!text || text.length < 3) {
        Toast.warning('El mensaje debe tener al menos 3 caracteres.');
        return;
      }

      const isStudent = activeUser.role === 'student';
      const newReply = {
        id: 'reply-' + Date.now(),
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
        content: text,
        createdAt: new Date().toISOString(),
      };

      replies = saveReplyForMessage(message.id, newReply);
      repliesListContainer.innerHTML = renderRepliesList(replies);
      countBadge.textContent = replies.length;
      inputArea.value = '';
      Toast.success(isStudent ? '¡Tu pregunta ha sido publicada con éxito en este foro!' : '¡Respuesta oficial publicada exitosamente en el debate!');
      onRefresh();

      // ── Enviar Notificación Automática de Foro a Usuarios Suscritos ────────
      try {
        const targetIds = new Set();
        // 1. Autor principal del hilo
        if (message.userId && message.userId !== activeUser.id) {
          targetIds.add(message.userId);
        } else if (message.isEvent) {
          if (activeUser.id !== '3b593672-04b3-469b-9ffb-149eb0f317b9') {
            targetIds.add('3b593672-04b3-469b-9ffb-149eb0f317b9');
          }
        } else {
          // Curso/Taller: avisar al tutor responsable
          const course = (store.getState().courses || []).find((c) => c.id === message.courseId);
          const tutorId = course?.tutorId || 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914';
          if (tutorId !== activeUser.id) {
            targetIds.add(tutorId);
          }
        }

        // 2. Participantes previos del hilo
        replies.forEach((r) => {
          if (r.userId && r.userId !== activeUser.id && /^[0-9a-fA-F-]{36}$/.test(r.userId)) {
            targetIds.add(r.userId);
          }
        });

        // 3. Crear notificación para cada destinatario si tiene el hilo activo (default: sí)
        for (const targetId of targetIds) {
          if (isThreadSubscribed(message.id, targetId)) {
            await api.notifications.create({
              userId: targetId,
              title: isStudent ? `Nueva duda en: ${message.title.slice(0, 30)}` : `Respuesta oficial en: ${message.title.slice(0, 30)}`,
              message: `${activeUser.name} ha aportado en el debate "${message.title}". Revisa la consulta en el foro.`,
              type: 'forum_reply',
            }).catch(() => {});
          }
        }

        // Actualizar notificaciones del store para sincronizar el badge del navbar
        const fresh = await api.notifications.getAll().catch(() => null);
        if (Array.isArray(fresh)) {
          store.setNotifications(fresh);
        }
      } catch (err) {
        console.warn('[Auto-notification forum error]:', err);
      }
    });
  },

  // Modal para Crear un Nuevo Tema / Foro con Portada y Categoría (Solo Docentes / Admin)
  openCreateModal(onRefresh, defaultChannel = 'all', defaultSubId = '') {
    const state = store.getState();
    const activeUser = state.activeUser;

    if (!activeUser || activeUser.role === 'guest') {
      Toast.info('Para participar en la comunidad, inicia sesión con tu cuenta universitaria.');
      Navbar.openLoginModal('forums');
      return;
    }

    if (activeUser.role === 'student') {
      Toast.info('Los foros oficiales son creados automáticamente o por los tutores de cada curso/taller. Ingresa al foro de tu curso para formular tus preguntas adentro.');
      return;
    }

    const courses = state.courses || [];
    const events = getStoredEvents();

    if (courses.length === 0) {
      Toast.warning('Debe existir al menos un curso o programa en el sistema.');
      return;
    }

    const isAdmin = activeUser.role === 'admin';
    let selectedCoverDataUrl = null;

    Modal.open({
      title: isAdmin
        ? 'Publicar Nuevo Foro Oficial (Administración Central)'
        : 'Publicar Nuevo Foro de Curso / Taller (Docente Tutor)',
      content: `
        <form id="forum-create-modal-form" class="modal-form">
          <!-- Destino / Canal del Foro -->
          <div class="form-group">
            <label class="form-label" for="forum-channel-select">Canal o Subforo de Destino *</label>
            <select id="forum-channel-select" class="form-control" required>
              <optgroup label="Canal Principal">
                <option value="general" ${defaultChannel === 'general' ? 'selected' : ''}>🌐 Foro General de Ayuda & Soporte (Libre)</option>
              </optgroup>
              ${isAdmin ? `
                <optgroup label="Subforos de Eventos & Hackathons (Exclusivo Administración Central)">
                  ${events.map((e) => `<option value="event:${e.id}" ${defaultChannel === 'events' && defaultSubId === e.id ? 'selected' : ''}>🏆 ${e.title}</option>`).join('')}
                </optgroup>
              ` : ''}
              <optgroup label="Subforos de Cursos & Talleres (${isAdmin ? 'Administración y Docentes' : 'Docente Titular'})">
                ${courses.map((c) => `<option value="course:${c.id}" ${defaultChannel === 'courses' && defaultSubId === c.id ? 'selected' : ''}>📚 ${c.title}</option>`).join('')}
              </optgroup>
            </select>
            <small id="forum-channel-help" class="form-help">
              ${isAdmin
                ? 'Como administrador, puedes aperturar foros oficiales para eventos/hackathons, cursos o el canal general.'
                : 'Como docente/tutor, puedes aperturar foros oficiales para cursos y talleres académicos.'}
            </small>
          </div>

          <!-- Categoría del Tema -->
          <div class="form-group">
            <label class="form-label" for="forum-category-select">Tipo de Consulta / Categoría *</label>
            <select id="forum-category-select" class="form-control" required>
              ${FORUM_CATEGORIES.map((c) => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
            </select>
          </div>

          <!-- Título -->
          <div class="form-group">
            <label class="form-label" for="forum-title-input">Título del Tema *</label>
            <input type="text" id="forum-title-input" class="form-control" placeholder="Ej. ¿Cómo estructurar el middleware de autenticación en Express?" maxlength="120" required />
            <small class="form-help">Mínimo 3 caracteres, máximo 120.</small>
          </div>

          <!-- Contenido Detallado -->
          <div class="form-group">
            <label class="form-label" for="forum-content-input">Pregunta o Explicación Detallada *</label>
            <textarea id="forum-content-input" class="form-control" rows="4" placeholder="Explica tu duda o comparte tu recomendación con claridad..." maxlength="1000" required></textarea>
            <small class="form-help">Máximo 1000 caracteres.</small>
          </div>

          <!-- Portada Opcional con Signo de Interrogación por Defecto -->
          <div class="form-group">
            <label class="form-label">Imagen de Portada (Opcional)</label>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <input type="file" id="forum-cover-file-input" class="form-control" accept="image/*" style="font-size:0.85rem;" />
              <button type="button" id="btn-clear-cover" class="btn btn-sm btn-outline" title="Usar portada por defecto" style="white-space:nowrap;">
                Limpiar
              </button>
            </div>
            <small class="form-help">Si no subes una imagen, se asignará automáticamente la portada oficial con signo de interrogación.</small>

            <div class="cover-preview-box">
              <img id="cover-preview-img" src="${DEFAULT_FORUM_COVER}" alt="Vista previa de portada" />
              <span id="cover-preview-badge" class="cover-preview-badge">Portada por defecto (?)</span>
            </div>
          </div>
        </form>
      `,
      confirmText: 'Publicar Tema',
      cancelText: 'Cancelar',
      onConfirm: async (dialog) => {
        const channelVal = dialog.querySelector('#forum-channel-select').value;
        const categoryVal = dialog.querySelector('#forum-category-select').value;
        const titleVal = dialog.querySelector('#forum-title-input').value.trim();
        const contentVal = dialog.querySelector('#forum-content-input').value.trim();

        if (titleVal.length < 3) {
          Toast.warning('El título debe tener al menos 3 caracteres.');
          return false;
        }
        if (contentVal.length < 5) {
          Toast.warning('El contenido debe tener al menos 5 caracteres.');
          return false;
        }

        // Validación de permisos: Solo el admin puede crear temas en subforos de eventos/hackathons
        if (channelVal.startsWith('event:') && activeUser.role !== 'admin') {
          Toast.warning('Solo la Administración Central puede crear y publicar foros oficiales de Hackathons y Eventos.');
          return false;
        }

        // Validación de permisos de curso para estudiantes
        if (channelVal.startsWith('course:') && activeUser.role === 'student') {
          const courseId = channelVal.replace('course:', '');
          const access = getCourseForumAccess(courseId, activeUser, state.bookings);
          if (!access.allowed) {
            Toast.warning(access.message);
            return false;
          }
        }

        // Determinar courseId para el backend
        let backendCourseId = courses[0]?.id;
        if (channelVal.startsWith('course:')) {
          backendCourseId = channelVal.replace('course:', '');
        } else if (channelVal.startsWith('event:')) {
          // Si el evento tiene curso gemelo en la BD, buscarlo
          const evId = channelVal.replace('event:', '');
          const ev = events.find((e) => e.id === evId);
          const matchedCourse = courses.find((c) => c.title.toLowerCase().includes('hackathon') || c.title.toLowerCase().includes('ctf'));
          if (matchedCourse) backendCourseId = matchedCourse.id;
        }

        // Empaquetar metadatos en el contenido
        const meta = {
          category: categoryVal,
          channel: channelVal,
          coverImage: selectedCoverDataUrl,
        };

        const packedContent = formatForumContent(contentVal, meta);

        // Por lógica institucional: foros de eventos los firma el Admin (Coordinación Académica)
        const authorUserId = (channelVal.startsWith('event:') || activeUser.role === 'admin')
          ? '3b593672-04b3-469b-9ffb-149eb0f317b9'
          : activeUser.id;

        try {
          await api.forums.create({
            courseId: backendCourseId,
            userId: authorUserId,
            title: titleVal,
            content: packedContent,
          });

          Toast.success('¡Tema publicado con éxito en la comunidad UPDS!');
          const updated = await api.forums.getAll();
          store.setForums(updated);
          onRefresh();
          return true;
        } catch (err) {
          Toast.error(err.message || 'Error al publicar el tema.');
          return false;
        }
      },
    });

    // Control de validación reactiva de acceso a subforos de cursos
    const channelSelect = document.getElementById('forum-channel-select');
    const channelHelp = document.getElementById('forum-channel-help');
    const checkChannelAccess = () => {
      if (!channelSelect || !channelHelp) return;
      const val = channelSelect.value;
      if (val.startsWith('course:') && activeUser.role === 'student') {
        const courseId = val.replace('course:', '');
        const access = getCourseForumAccess(courseId, activeUser, state.bookings);
        if (!access.allowed) {
          channelHelp.innerHTML = `<span style="color:#b91c1c; font-weight:700;">🔒 ${access.message}</span>`;
          return;
        }
      }
      channelHelp.innerHTML = 'Elige el espacio adecuado para que tus compañeros y docentes encuentren tu consulta.';
    };
    channelSelect?.addEventListener('change', checkChannelAccess);
    checkChannelAccess();

    // Control de preview de imagen
    const fileInput = document.getElementById('forum-cover-file-input');
    const previewImg = document.getElementById('cover-preview-img');
    const previewBadge = document.getElementById('cover-preview-badge');
    const clearBtn = document.getElementById('btn-clear-cover');

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          Toast.error('La imagen de portada excede el límite de 5 MB.');
          fileInput.value = '';
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          Toast.warning('La imagen es superior a 2MB. Te sugerimos una imagen más liviana.');
        }
        const reader = new FileReader();
        reader.onload = (loadEv) => {
          selectedCoverDataUrl = loadEv.target.result;
          if (previewImg) previewImg.src = selectedCoverDataUrl;
          if (previewBadge) previewBadge.textContent = 'Portada personalizada';
        };
        reader.readAsDataURL(file);
      }
    });

    clearBtn?.addEventListener('click', () => {
      selectedCoverDataUrl = null;
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = DEFAULT_FORUM_COVER;
      if (previewBadge) previewBadge.textContent = 'Portada por defecto (?)';
    });
  },

  // Modal para Editar Consulta Existente
  openEditModal(message, onRefresh) {
    const { text, meta } = parseForumContent(message.content);

    Modal.open({
      title: `Editar: ${message.title}`,
      content: `
        <form class="modal-form">
          <div class="form-group">
            <label class="form-label" for="edit-forum-category">Categoría</label>
            <select id="edit-forum-category" class="form-control">
              ${FORUM_CATEGORIES.map((c) => `<option value="${c.id}" ${meta.category === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-forum-title">Título del Tema</label>
            <input type="text" id="edit-forum-title" class="form-control" value="${message.title}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-forum-content">Contenido</label>
            <textarea id="edit-forum-content" class="form-control" rows="5" required>${text}</textarea>
          </div>
        </form>
      `,
      confirmText: 'Guardar Cambios',
      cancelText: 'Cancelar',
      onConfirm: async (dialog) => {
        const titleVal = dialog.querySelector('#edit-forum-title').value.trim();
        const contentVal = dialog.querySelector('#edit-forum-content').value.trim();
        const categoryVal = dialog.querySelector('#edit-forum-category').value;

        if (titleVal.length < 3 || contentVal.length < 5) {
          Toast.warning('Verifica los campos obligatorios.');
          return false;
        }

        const updatedMeta = { ...meta, category: categoryVal };
        const packedContent = formatForumContent(contentVal, updatedMeta);

        try {
          await api.forums.update(message.id, { title: titleVal, content: packedContent });
          Toast.success('Tema actualizado correctamente.');
          const updated = await api.forums.getAll();
          store.setForums(updated);
          onRefresh();
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  // Confirmar Eliminación
  confirmDelete(message, onRefresh) {
    Modal.confirm({
      title: '¿Eliminar este tema del foro?',
      message: `¿Estás seguro de eliminar "<strong>${message.title}</strong>"? Esta acción también eliminará todas las respuestas asociadas.`,
      confirmText: 'Sí, Eliminar Tema',
      danger: true,
      onConfirm: async () => {
        try {
          await api.forums.delete(message.id);
          Toast.success('Tema eliminado exitosamente.');
          const updated = await api.forums.getAll();
          store.setForums(updated);
          onRefresh();
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
