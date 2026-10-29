// Vista Unificada del Catálogo de Cursos y Talleres Académicos — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { can } from '../utils/permissions.js';
import { Icons } from '../components/Icons.js';
import { TicketModal } from '../components/TicketModal.js';
import { withButtonLoading } from '../utils/button.js';
import { Navbar } from '../components/Navbar.js';
import { Pagination } from '../components/Pagination.js';
import { QRCode } from '../utils/qrcode.js';

// Helper para gestionar recibos de pago en localStorage
export const getBookingReceipt = (bookingId) => {
  try {
    const raw = localStorage.getItem(`upds_receipt_${bookingId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveBookingReceipt = (bookingId, data) => {
  try {
    localStorage.setItem(`upds_receipt_${bookingId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error guardando comprobante:', e);
  }
};

// Comprime una imagen a formato JPEG ligero para almacenamiento eficiente
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Helper blindado para decodificar docentes externos y costo (prioridad BD nativa + fallback metadata)
export const parseCourseDescription = (rawOrCourse = '') => {
  const isObject = typeof rawOrCourse === 'object' && rawOrCourse !== null;
  const raw = isObject ? (rawOrCourse.description || '') : (rawOrCourse || '');
  if (!raw && !isObject) return { text: '', externalTutor: null, price: 0 };
  const extMatch = raw.match(/<!--external_tutor:([^>]+)-->/);
  const priceMatch = raw.match(/<!--price:(\d+)-->/);
  let text = raw;
  if (extMatch) text = text.replace(/<!--external_tutor:[^>]+-->\n?/, '');
  if (priceMatch) text = text.replace(/<!--price:\d+-->\n?/, '');

  const parsedPrice = priceMatch ? parseInt(priceMatch[1], 10) : 0;
  const directPrice = isObject && typeof rawOrCourse.price === 'number' && rawOrCourse.price > 0 ? rawOrCourse.price : null;

  return {
    text: text.trim(),
    externalTutor: extMatch ? extMatch[1].trim() : null,
    price: directPrice ?? parsedPrice,
  };
};

export const formatCourseDescription = (text = '', externalTutor = null, price = 0) => {
  const cleanText = (text || '').trim();
  let prefix = '';
  if (externalTutor && externalTutor.trim()) {
    prefix += `<!--external_tutor:${externalTutor.trim()}-->\n`;
  }
  if (price && parseInt(price, 10) > 0) {
    prefix += `<!--price:${parseInt(price, 10)}-->\n`;
  }
  return `${prefix}${cleanText}`;
};

export const CoursesView = {
  render() {
    const state = store.getState();
    const activeUser = state.activeUser;
    const canCreate = activeUser && (activeUser.role === 'admin' || activeUser.role === 'tutor');
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let currentPage = 1;
    const PAGE_SIZE = 6;

    const renderList = () => {
      const currentState = store.getState();
      const currentCourses = currentState.courses || [];
      const tutorias = currentState.tutorias || [];
      const bookings = currentState.bookings || [];
      const activeUser = currentState.activeUser;
      const isGuest = !activeUser || activeUser.role === 'guest';

      // Filtrar cursos y talleres (los hackathons tienen su propia vista de eventos)
      const courses = currentCourses.filter(
        (c) =>
          !c.title.toLowerCase().includes('hackathon') &&
          !c.title.toLowerCase().includes('torneo') &&
          !c.title.toLowerCase().includes('ctf')
      );

      const bodyContainer = container.querySelector('#courses-grid-container');
      if (!bodyContainer) return;

      if (courses.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: Icons.book('', 36),
            title: 'No hay cursos o talleres registrados',
            description: 'Comienza creando el primer programa de extensión o taller académico.',
            actionText: canCreate ? '+ Crear Curso / Taller' : undefined,
            onAction: canCreate ? () => this.openCourseModal() : undefined,
          })
        );
        return;
      }

      const pagination = Pagination.paginate(courses, currentPage, PAGE_SIZE);
      currentPage = pagination.currentPage;

      bodyContainer.innerHTML = `
        <div class="cards-grid">
          ${pagination.items.map((c) => {
            // Obtener tutorías/clases asociadas a este curso
            const sessions = tutorias.filter((t) => t.courseId === c.id);
            const activeSessions = sessions.filter((s) => s.status !== 'cancelled');
            const hasSessions = activeSessions.length > 0;
            const allSessionsFull = hasSessions && activeSessions.every((s) => {
              const bookingsCount = s._count?.bookings ?? (s.bookings?.length || 0);
              return bookingsCount >= s.maxStudents;
            });
            const isFull = allSessionsFull;

            // Verificar si el estudiante actual ya tiene una reserva activa
            const myBooking = !isGuest
              ? bookings.find((b) => b.courseId === c.id && b.studentId === activeUser.id && b.status !== 'cancelled')
              : null;
            const hasRejected = !isGuest && !myBooking && bookings.some((b) => b.courseId === c.id && b.studentId === activeUser.id && b.status === 'cancelled');
            const { text: cleanDesc, externalTutor, price } = parseCourseDescription(c.description);

            return `
              <div class="card course-card" style="${isFull && !myBooking ? 'background:#fffbfb; border-color:#fecaca;' : ''}">
                <div class="course-card-body-top">
                  <div class="course-card-header">
                    <div style="display:flex; align-items:center; gap:0.4rem; overflow:hidden;">
                      <span class="course-tag">Curso & Taller Académico</span>
                      ${price > 0 
                        ? `<span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:800; font-size:0.68rem; padding:0.15rem 0.45rem;">${price} Bs</span>` 
                        : `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; font-weight:800; font-size:0.68rem; padding:0.15rem 0.45rem;">Gratis</span>`
                      }
                      ${isFull ? `
                        <span class="badge" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; font-weight:800; font-size:0.68rem; padding:0.15rem 0.45rem; white-space:nowrap; display:inline-flex; align-items:center; gap:0.25rem;">
                          <span class="badge-status-dot" style="background:#dc2626;"></span> LLENO
                        </span>
                      ` : ''}
                    </div>
                    ${(activeUser?.role === 'admin' || (activeUser?.role === 'tutor' && c.tutorId === activeUser.id)) ? `
                      <div class="course-actions">
                        <button class="btn btn-xs btn-outline btn-edit-course" data-id="${c.id}" title="Editar este curso">${Icons.edit('', 13)}</button>
                        <button class="btn btn-xs btn-danger-outline btn-delete-course" data-id="${c.id}" title="Eliminar este curso">${Icons.trash('', 13)}</button>
                      </div>
                    ` : ''}
                  </div>

                  <h3 class="course-title" title="${c.title}">${c.title}</h3>
                  <p class="course-desc" title="${cleanDesc}">${cleanDesc || 'Programa de formación extracurricular con enfoque práctico en competencias de alta demanda universitaria.'}</p>

                  <!-- Bloque del Instructor / Docente -->
                  <div class="course-footer">
                    <div class="course-tutor">
                      <span class="tutor-avatar" style="${externalTutor ? 'color:#b45309;background:#fef3c7;' : 'color:var(--primary-navy);background:#e8f1fa;'}display:inline-flex;align-items:center;justify-content:center;border-radius:50%;width:30px;height:30px;flex-shrink:0;">
                        ${externalTutor ? Icons.user('', 15) : Icons.cap('', 15)}
                      </span>
                      <div class="tutor-info" style="min-width:0; flex:1;">
                        <span class="tutor-label">${externalTutor ? 'Docente / Expositor:' : 'Docente Responsable:'}</span>
                        <div style="display:flex; align-items:center; gap:0.35rem; overflow:hidden;">
                          <span class="tutor-name" title="${externalTutor || c.tutor?.name || 'Coordinación Académica UPDS'}" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:${externalTutor ? '155px' : '100%'};">
                            ${externalTutor || c.tutor?.name || 'Coordinación Académica UPDS'}
                          </span>
                          ${externalTutor ? `
                            <span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:0.62rem; padding:0.1rem 0.35rem; font-weight:700; border-radius:4px; white-space:nowrap; flex-shrink:0; line-height:1.2;">
                              Invitado
                            </span>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Clases y Tutorías Programadas Integradas (Caja con Altura Uniforme) -->
                  <div class="course-sessions-cluster">
                    <div class="session-cluster-header">
                      <span>${Icons.calendar('', 13)} Sesiones Programadas:</span>
                      <span style="font-weight:700; color:var(--primary-navy);">
                        ${sessions.length > 0 ? (sessions.length > 1 ? `1 de ${sessions.length} sesiones` : '1 sesión') : 'Por programar'}
                      </span>
                    </div>

                    ${sessions.length > 0 ? (() => {
                      const s = sessions[0];
                      const bookingsCount = s._count?.bookings ?? (s.bookings?.length || 0);
                      const isSessionFull = bookingsCount >= s.maxStudents;
                      const isPresencial = (s.modality || 'presencial').toLowerCase().includes('presencial');
                      const sessionDate = new Date(s.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return `
                        <div class="course-session-item">
                          <div class="session-main-info">
                            <span class="session-title-text" title="${s.title}">${s.title}</span>
                            <span class="session-meta-text">
                              ${isPresencial ? Icons.building('', 11) + ' ' + (s.location || 'Presencial') : Icons.laptop('', 11) + ' Virtual'} · ${sessionDate}
                            </span>
                          </div>
                          <span class="session-seats-badge ${isSessionFull ? 'seats-full' : 'seats-available'}">
                            ${isSessionFull ? 'Agotado' : `${s.maxStudents - bookingsCount} cupos`}
                          </span>
                        </div>
                      `;
                    })() : `
                      <div class="course-session-item session-item-empty">
                        <div class="session-main-info">
                          <span class="session-title-text" style="color:#64748b; font-weight:500;">Próximamente nuevas fechas</span>
                          <span class="session-meta-text">${Icons.calendar('', 11)} Consulta en secretaría académica</span>
                        </div>
                        <span class="session-seats-badge" style="background:#f1f5f9; color:#64748b;">
                          Por abrir
                        </span>
                      </div>
                    `}
                  </div>
                </div>

                <!-- Botones de Acción: Ver Detalles, Inscribirse o Ver Entrada QR -->
                <div class="course-actions-cluster">
                  <button type="button" class="btn btn-sm btn-outline btn-view-details" data-id="${c.id}" style="flex:1;">
                    ${Icons.fileText('', 13)} Detalle
                  </button>
                  <button type="button" class="btn btn-sm btn-outline btn-course-forum" data-id="${c.id}" title="Ir al foro de consultas académicas de este curso" style="padding:0 9px; color:var(--primary-navy);" aria-label="Foro del curso">
                    ${Icons.chat('', 13)}
                  </button>

                  ${myBooking ? (
                    myBooking.status === 'pending' ? `
                      <button type="button" class="btn btn-sm btn-view-ticket" data-course-id="${c.id}" data-booking-id="${myBooking.id}" style="flex:1.4; display:inline-flex; align-items:center; justify-content:center; gap:0.35rem; background:#fffbeb; border:1px solid #fde68a; color:#92400e; font-weight:700; font-size:0.78rem;" title="Inscripción en espera de validación de pago">
                        ${Icons.clock('', 13)} <span>En espera de verificación</span>
                      </button>
                    ` : `
                      <button type="button" class="btn btn-sm btn-course-ticket btn-view-ticket" data-course-id="${c.id}" data-booking-id="${myBooking.id}" style="flex:1.4; display:inline-flex; align-items:center; justify-content:center; gap:0.4rem;">
                        ${Icons.ticket('', 14)} <strong>Ver Entrada QR</strong>
                      </button>
                    `
                  ) : isFull ? `
                    <button type="button" class="btn btn-sm" disabled style="flex:1.4; background:#fef2f2; border:1px solid #fca5a5; color:#b91c1c; font-weight:700; font-size:0.78rem; opacity:0.95; cursor:not-allowed; display:inline-flex; align-items:center; justify-content:center; gap:0.35rem;" title="Cupos totalmente agotados para este taller">
                      ${Icons.alertTriangle('', 13)} <span>Lleno (Sin cupos)</span>
                    </button>
                  ` : (sessions.length > 0 ? `
                    <button type="button" class="btn btn-sm ${hasRejected ? 'btn-outline' : 'btn-primary'} btn-course-enroll btn-enroll-action" data-course-id="${c.id}" data-session-id="${sessions[0].id}" style="flex:1.4; display:inline-flex; align-items:center; justify-content:center; gap:0.4rem; ${hasRejected ? 'border-color:#f59e0b; color:#b45309; background:#fffbeb;' : ''}">
                      ${Icons.qrcode('', 14)} <strong>${hasRejected ? 'Reenviar Comprobante' : `Inscribirme ${price > 0 ? `(${price} Bs)` : ''}`}</strong>
                    </button>
                  ` : `
                    <button type="button" class="btn btn-sm btn-outline" disabled style="flex:1.4; opacity:0.7; font-weight:600; cursor:not-allowed; display:inline-flex; align-items:center; justify-content:center; gap:0.35rem;">
                      ${Icons.clock('', 13)} <span>Próximamente</span>
                    </button>
                  `)}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${Pagination.renderHTML(pagination)}
      `;

      // Enlazar eventos de paginación
      Pagination.bindEvents(bodyContainer, (newPage) => {
        currentPage = newPage;
        renderList();
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // Eventos: Ver Detalle del Curso
      bodyContainer.querySelectorAll('.btn-view-details').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = currentState.courses.find((c) => c.id === id);
          if (course) this.openCourseDetails(course);
        });
      });

      // Eventos: Ir al Foro del Curso
      bodyContainer.querySelectorAll('.btn-course-forum').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          window.__pendingForumNav = { channel: 'courses', subId: id };
          window.location.hash = '#forums';
        });
      });

      // Eventos: Ver Entrada QR existente
      bodyContainer.querySelectorAll('.btn-view-ticket').forEach((btn) => {
        btn.addEventListener('click', () => {
          const courseId = btn.getAttribute('data-course-id');
          const bookingId = btn.getAttribute('data-booking-id');
          const course = currentState.courses.find((c) => c.id === courseId);
          const booking = currentState.bookings.find((b) => b.id === bookingId);
          const tutoria = currentState.tutorias.find((t) => t.id === booking?.tutoriaId) || currentState.tutorias.find((t) => t.courseId === courseId);
          TicketModal.open(booking, course, tutoria, currentState.activeUser);
        });
      });

      // Eventos: Inscribirse y Generar Entrada QR
      bodyContainer.querySelectorAll('.btn-enroll-action').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const courseId = btn.getAttribute('data-course-id');
          const sessionId = btn.getAttribute('data-session-id');
          await this.handleEnrollment(courseId, sessionId, btn);
        });
      });

      // Eventos Admin: Editar y Eliminar
      bodyContainer.querySelectorAll('.btn-edit-course').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = currentState.courses.find((c) => c.id === id);
          if (course) this.openCourseModal(course);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-course').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = currentState.courses.find((c) => c.id === id);
          if (course) this.confirmDelete(course);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Cursos y Talleres Académicos</h2>
          <p class="view-subtitle">Catálogo unificado de programas extracurriculares, bootcamps y talleres prácticos con pase digital oficial UPDS.</p>
        </div>
        <div class="view-actions">
          ${canCreate ? '<button id="btn-create-course" class="btn btn-primary">+ Nuevo Curso / Taller</button>' : ''}
        </div>
      </div>

      <div id="courses-grid-container"></div>
    `;

    container.querySelector('#btn-create-course')?.addEventListener('click', () => {
      this.openCourseModal();
    });

    this._refreshList = renderList;
    setTimeout(renderList, 0);
    return container;
  },

  // Flujo completo de confirmación de inscripción y pasarela de pago con QR
  async handleEnrollment(courseId, sessionId, triggerBtn) {
    const state = store.getState();
    const activeUser = state.activeUser;

    // Si es visitante o modo invitado, pedir autenticación para emitir el boleto a su nombre
    if (!activeUser || activeUser.role === 'guest') {
      Toast.info('Para emitir tu entrada oficial con Código QR, accede con tu cuenta institucional.');
      Navbar.openLoginModal('courses');
      return;
    }

    const course = state.courses.find((c) => c.id === courseId);
    const tutoria = state.tutorias.find((t) => t.id === sessionId);

    // Evitar reinscripciones duplicadas si ya tiene entrada activa
    const existingBooking = (state.bookings || []).find(
      (b) => b.courseId === courseId && b.studentId === activeUser.id && b.status !== 'cancelled'
    );
    if (existingBooking) {
      Toast.info('Ya cuentas con una entrada activa para este programa.');
      TicketModal.open(existingBooking, course, tutoria, activeUser);
      return;
    }

    const { externalTutor, price } = parseCourseDescription(course?.description);
    const tutorName = externalTutor || course?.tutor?.name || 'Coordinación Académica UPDS';
    const isPaid = price > 0;

    Modal.confirm({
      title: isPaid ? 'Confirmar Inscripción y Arancel' : 'Confirmar Inscripción Académica',
      message: `
        <div style="font-size:0.92rem; line-height:1.55; color:#334155;">
          <p style="margin-bottom:0.75rem;">¿Deseas formalizar tu inscripción al siguiente programa?</p>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem 1rem; margin-bottom:0.85rem;">
            <div style="font-weight:800; color:var(--primary-navy); font-size:1.02rem; margin-bottom:0.25rem;">${course?.title}</div>
            <div style="font-size:0.82rem; color:#64748b; margin-bottom:0.25rem;">Docente / Expositor: <strong>${tutorName}</strong></div>
            ${tutoria ? `<div style="font-size:0.82rem; color:#64748b; margin-bottom:0.25rem;">Sesión: <strong>${tutoria.title}</strong> (${new Date(tutoria.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})</div>` : ''}
            <div style="font-size:0.88rem; margin-top:0.5rem; padding-top:0.45rem; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
              <span>Arancel / Inversión:</span>
              <strong style="color:${isPaid ? '#0284c7' : '#16a34a'}; font-size:1.05rem;">
                ${isPaid ? `${price} Bs` : 'Gratuito (100% Subvencionado)'}
              </strong>
            </div>
          </div>
          ${isPaid ? `
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid #3b82f6; border-radius:6px; padding:0.6rem 0.8rem; font-size:0.82rem; color:#1e40af; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.bell('', 14)} <span>Al confirmar, se abrirá el <strong>Código QR de Transferencia Bancaria</strong> y el cajón para adjuntar tu comprobante de pago.</span>
            </div>
          ` : `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #22c55e; border-radius:6px; padding:0.6rem 0.8rem; font-size:0.82rem; color:#166534; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.check('', 14)} <span>Al ser un curso gratuito no requiere verificación previa: tu cupo e ingreso con Código QR se confirmarán automáticamente.</span>
            </div>
          `}
        </div>
      `,
      confirmText: isPaid ? `Continuar al Pago (${price} Bs)` : 'Confirmar e Inscribirme Ahora',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        if (isPaid) {
          this.openPaymentModal(course, tutoria, activeUser, price);
        } else {
          await this.completeFreeEnrollment(course, tutoria, activeUser, triggerBtn);
        }
      },
    });
  },

  // Modal de Pago con QR bancario UPDS y Cajón de Comprobante
  openPaymentModal(course, tutoria, activeUser, price) {
    // Un solo QR institucional oficial UPDS para todos los cursos (sin monto predefinido)
    const UPDS_OFFICIAL_QR_PAYLOAD = 'UPDS-SIMPLE-QR|BMSC:401089234101|NIT:1028394025|UNIVERSIDAD-PRIVADA-DOMINGO-SAVIO';
    const qrSvg = QRCode.generateSvg(UPDS_OFFICIAL_QR_PAYLOAD, {
      size: 190,
      color: '#002855',
      bgColor: '#FFFFFF',
      margin: 1,
    });

    let selectedReceiptBase64 = null;

    const modalContent = document.createElement('div');
    modalContent.innerHTML = `
      <div style="font-size:0.9rem; line-height:1.5; color:#334155;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid #0284c7; border-radius:8px; padding:0.75rem 1rem; margin-bottom:1.1rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#0369a1; font-size:1.02rem; display:block;">${course.title}</strong>
            <span style="font-size:0.8rem; color:#475569;">Arancel Institucional de Certificación y Acceso</span>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.72rem; text-transform:uppercase; color:#64748b; display:block; font-weight:700;">TOTAL A PAGAR</span>
            <strong style="font-size:1.35rem; color:#0284c7; font-weight:800;">${price} Bs</strong>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1.15fr; gap:1.25rem; align-items:start;">
          <!-- Columna 1: QR Bancario UPDS Oficial y Datos de Cuenta -->
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:0.9rem; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom:0.35rem;">
              <span style="font-size:0.75rem; font-weight:800; color:#002855; text-transform:uppercase; letter-spacing:0.5px; display:block;">
                BANCO MERCANTIL SANTA CRUZ
              </span>
              <span style="display:inline-block; font-size:0.68rem; font-weight:800; color:#d9272e; background:#fef2f2; border:1px solid #fecaca; padding:1px 8px; border-radius:12px; margin-top:2px; text-transform:uppercase;">
                QR Simple Oficial UPDS • Sin Monto Fijo
              </span>
            </div>
            
            <div style="display:flex; justify-content:center; margin-bottom:0.55rem;">
              <div style="padding:6px; background:#ffffff; border:2px solid #002855; border-radius:10px; display:inline-block; box-shadow:0 2px 5px rgba(0,40,85,0.08);">
                ${qrSvg}
              </div>
            </div>

            <div style="font-size:0.72rem; color:#475569; margin-bottom:0.6rem; background:#f1f5f9; padding:4px 8px; border-radius:6px; line-height:1.35;">
              Escanea desde tu app bancaria y digita el monto: <strong style="color:#002855; font-size:0.8rem;">${price} Bs</strong>
            </div>

            <div style="text-align:left; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem 0.75rem; font-size:0.77rem; line-height:1.45;">
              <div><strong>Banco:</strong> Mercantil Santa Cruz S.A.</div>
              <div><strong>Cta. Cte. Bs:</strong> 4010-892341-01</div>
              <div><strong>Titular:</strong> Univ. Privada Domingo Savio</div>
              <div><strong>NIT:</strong> 1028394025</div>
              <div><strong>Glosa Sugerida:</strong> ${activeUser.name.slice(0, 16)} - ${course.title.slice(0, 14)}</div>
            </div>
          </div>

          <!-- Columna 2: Cajón para Adjuntar Comprobante -->
          <div>
            <label class="form-label" style="font-weight:700; margin-bottom:0.35rem; color:var(--primary-navy); display:flex; align-items:center; gap:0.35rem;">
              ${Icons.fileText('', 15)} <span>Adjunta tu Comprobante de Pago *</span>
            </label>
            <p style="font-size:0.78rem; color:#64748b; margin-bottom:0.6rem;">
              Sube la captura de pantalla o comprobante emitido por tu banca móvil (BCP, BNB, Banco Unión, GanaMóvil, etc.).
            </p>

            <!-- Cajón Dropzone Interactivo -->
            <div id="receipt-dropzone" style="border:2px dashed #cbd5e1; border-radius:10px; padding:1.1rem 0.75rem; text-align:center; background:#f8fafc; cursor:pointer; transition:all 180ms ease;">
              <input type="file" id="receipt-file-input" accept="image/*" style="display:none;" />
              
              <div id="receipt-empty-view">
                <span style="display:block; margin-bottom:0.45rem; color:var(--primary-navy);">${Icons.upload('', 32)}</span>
                <strong style="color:var(--primary-navy); font-size:0.86rem; display:block;">Haz clic para adjuntar comprobante</strong>
                <span style="font-size:0.72rem; color:#64748b;">Formatos aceptados: PNG, JPG, JPEG</span>
              </div>

              <!-- Vista Previa de la Imagen Cargada -->
              <div id="receipt-preview-view" style="display:none; flex-direction:column; align-items:center; gap:0.4rem;">
                <div style="position:relative; max-width:160px; max-height:120px; overflow:hidden; border-radius:8px; border:1px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <img id="receipt-preview-img" src="" alt="Comprobante" style="width:100%; height:auto; display:block; object-fit:contain;" />
                </div>
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span style="font-size:0.75rem; color:#059669; font-weight:700; display:inline-flex; align-items:center; gap:0.25rem;">${Icons.check('', 12)} Comprobante listo</span>
                  <button type="button" id="btn-remove-receipt" class="btn btn-xs btn-outline" style="font-size:0.72rem; padding:1px 6px;">Cambiar</button>
                </div>
              </div>
            </div>

            <div style="margin-top:0.75rem; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:0.55rem 0.75rem; font-size:0.76rem; color:#92400e; line-height:1.4; display:flex; align-items:center; gap:0.4rem;">
              ${Icons.bell('', 14)} <span><strong>Proceso de Verificación:</strong> Al enviar el recibo, tu inscripción pasará a <strong>"En espera de verificación"</strong>. Administración UPDS revisará el comprobante y activará tu entrada QR oficial notificándote en tiempo real.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = modalContent.querySelector('#receipt-dropzone');
    const fileInput = modalContent.querySelector('#receipt-file-input');
    const emptyView = modalContent.querySelector('#receipt-empty-view');
    const previewView = modalContent.querySelector('#receipt-preview-view');
    const previewImg = modalContent.querySelector('#receipt-preview-img');
    const removeBtn = modalContent.querySelector('#btn-remove-receipt');

    dropzone.addEventListener('click', (e) => {
      if (e.target !== removeBtn) fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ponytail: límite estricto en frontend para no sobrecargar memoria ni la API
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        Toast.error('El comprobante supera el límite máximo de 10 MB. Elige una imagen más liviana.');
        fileInput.value = '';
        return;
      }

      try {
        selectedReceiptBase64 = await compressImage(file);
        previewImg.src = selectedReceiptBase64;
        emptyView.style.display = 'none';
        previewView.style.display = 'flex';
        dropzone.style.borderColor = '#059669';
        dropzone.style.background = '#f0fdf4';
      } catch (err) {
        Toast.error('No se pudo procesar la imagen del comprobante.');
      }
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedReceiptBase64 = null;
      fileInput.value = '';
      previewImg.src = '';
      previewView.style.display = 'none';
      emptyView.style.display = 'block';
      dropzone.style.borderColor = '#cbd5e1';
      dropzone.style.background = '#f8fafc';
    });

    Modal.open({
      title: 'Pasarela de Pago y Comprobante Oficial UPDS',
      size: 'lg',
      content: modalContent,
      confirmText: 'Enviar Comprobante para Verificación',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        if (!selectedReceiptBase64) {
          Toast.warning('Por favor adjunta la foto o captura de tu comprobante bancario antes de continuar.');
          return false;
        }

        try {
          const payload = {
            studentId: activeUser.id,
            courseId: course.id,
            tutoriaId: tutoria?.id || null,
            scheduledAt: tutoria?.date || new Date().toISOString(),
            status: 'pending',
            receiptUrl: selectedReceiptBase64,
          };

          const newBooking = await api.bookings.create(payload);

          // Guardar comprobante indexado localmente como respaldo
          saveBookingReceipt(newBooking.id, {
            bookingId: newBooking.id,
            studentId: activeUser.id,
            studentName: activeUser.name,
            studentEmail: activeUser.email,
            courseId: course.id,
            courseTitle: course.title,
            amount: `${price} Bs`,
            uploadedAt: new Date().toISOString(),
            receiptImage: selectedReceiptBase64,
            status: 'pending',
          });

          // Actualizar estado global al instante
          const currentBookings = store.getState().bookings || [];
          const updatedBookings = [newBooking, ...currentBookings.filter((b) => b.id !== newBooking.id)];
          store.setState({ bookings: updatedBookings });
          this._refreshList?.();

          Toast.success('¡Comprobante enviado exitosamente! Tu inscripción está en espera de verificación.');

          // Abrir entrada provisional
          TicketModal.open(newBooking, course, tutoria, activeUser);
          return true;
        } catch (err) {
          Toast.error(err.message || 'Error al procesar la inscripción.');
          return false;
        }
      },
    });
  },

  // Flujo directo para cursos gratuitos: inscripción automática sin verificación previa
  async completeFreeEnrollment(course, tutoria, activeUser, triggerBtn) {
    await withButtonLoading(triggerBtn, async () => {
      try {
        const payload = {
          studentId: activeUser.id,
          courseId: course.id,
          tutoriaId: tutoria?.id || null,
          scheduledAt: tutoria?.date || new Date().toISOString(),
          status: 'confirmed',
        };

        const newBooking = await api.bookings.create(payload);
        newBooking.status = 'confirmed';

        // Actualizar estado local inmediatamente sin llamadas redundantes
        const currentBookings = store.getState().bookings || [];
        const updatedBookings = [newBooking, ...currentBookings.filter((b) => b.id !== newBooking.id)];
        store.setState({ bookings: updatedBookings });

        // Refrescar tarjetas de cursos para reflejar "Ver Entrada QR" al instante
        this._refreshList?.();

        Toast.success('¡Inscripción confirmada automáticamente! Tu entrada con Código QR ha sido generada.');

        // Abre inmediatamente la entrada digital confirmada
        TicketModal.open(newBooking, course, tutoria, activeUser);
      } catch (err) {
        Toast.error(err.message || 'Error al procesar la inscripción.');
      }
    }, 'Inscribiendo...');
  },

  // Modal con detalle extendido del curso, temario y lista de estudiantes inscritos
  openCourseDetails(course) {
    const state = store.getState();
    const sessions = (state.tutorias || []).filter((t) => t.courseId === course.id);
    const tutor = course.tutor || state.users?.find((u) => u.id === course.tutorId);
    const { text: cleanDesc, externalTutor, price } = parseCourseDescription(course.description);
    const activeUser = state.activeUser;
    const isOwnerTutor = activeUser?.role === 'tutor' && course.tutorId === activeUser.id;
    const canViewEnrolledStudents = activeUser?.role === 'admin' || isOwnerTutor;
    const courseBookings = (state.bookings || []).filter((b) => b.courseId === course.id);

    Modal.open({
      title: course.title,
      size: canViewEnrolledStudents ? 'lg' : 'md',
      content: `
        <div class="course-details-modal-body" style="font-size:0.92rem; color:#334155; line-height:1.6;">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1rem; flex-wrap:wrap;">
            <span class="badge ${price > 0 ? 'badge-primary' : 'badge-success'}" style="font-weight:700;">
              ${price > 0 ? `Arancel: ${price} Bs` : 'Gratuito (Subvención 100%)'}
            </span>
            <span class="badge badge-primary">Acreditación Académica UPDS</span>
            <span class="badge badge-success">Certificado Digital</span>
            ${externalTutor ? `
              <span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:700;">
                Docente Invitado / Exterior
              </span>
            ` : ''}
            ${isOwnerTutor ? `
              <span class="badge" style="background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; font-weight:700;">
                Creado por ti (Docente Titular)
              </span>
            ` : ''}
          </div>

          <h4 style="color:var(--primary-navy); margin-bottom:0.35rem; font-size:1.05rem;">Descripción y Alcance:</h4>
          <p style="margin-bottom:1.25rem;">${cleanDesc || 'Este programa brinda formación extracurricular técnica orientada a potenciar las competencias prácticas de los estudiantes universitarios.'}</p>

          <h4 style="color:var(--primary-navy); margin-bottom:0.35rem; font-size:1.05rem;">
            ${externalTutor ? 'Docente / Expositor Invitado:' : 'Docente Tutor a Cargo:'}
          </h4>
          ${externalTutor ? `
            <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:10px; padding:0.75rem 1rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.8rem;">
              <span style="background:#fde68a; color:#92400e; width:38px; height:38px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${Icons.user('', 18)}
              </span>
              <div>
                <strong style="color:#92400e; display:block; font-size:0.95rem;">
                  ${externalTutor} 
                  <span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:0.68rem; margin-left:0.4rem; font-weight:700;">Exterior / Invitado</span>
                </strong>
                <small style="color:#b45309;">Docente o ponente externo invitado (sin cuenta institucional en el sistema).</small>
              </div>
            </div>
          ` : `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem 1rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.8rem;">
              <span style="background:#e8f1fa; color:var(--primary-navy); width:38px; height:38px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;">
                ${Icons.cap('', 18)}
              </span>
              <div>
                <strong style="color:var(--primary-navy); display:block;">${tutor?.name || 'Coordinación Académica'}</strong>
                <small style="color:#64748b;">${tutor?.email || 'academica@upds.edu.bo'}</small>
              </div>
            </div>
          `}

          <h4 style="color:var(--primary-navy); margin-bottom:0.5rem; font-size:1.05rem;">Próximas Sesiones Programadas:</h4>
          ${sessions.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.25rem;">
              ${sessions.map((s) => `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:var(--primary-navy); display:block; font-size:0.88rem;">${s.title}</strong>
                    <span style="font-size:0.78rem; color:#64748b;">
                      ${new Date(s.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span class="badge ${s.modality === 'presencial' ? 'badge-primary' : 'badge-warning'}">
                    ${s.modality === 'presencial' ? 'Presencial' : 'Virtual'}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:#64748b; font-style:italic; margin-bottom:1.25rem;">No hay sesiones abiertas en este momento.</p>'}

          ${canViewEnrolledStudents ? `
            <div style="margin-top:1.25rem; padding-top:1.15rem; border-top:1px solid #e2e8f0;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                <h4 style="color:var(--primary-navy); margin:0; font-size:1.05rem; display:flex; align-items:center; gap:0.4rem;">
                  ${Icons.users('', 17)} <span>Estudiantes Inscritos en este Curso / Taller</span>
                </h4>
                <span class="badge badge-primary" style="font-weight:700;">
                  ${courseBookings.length} ${courseBookings.length === 1 ? 'estudiante matriculado' : 'estudiantes matriculados'}
                </span>
              </div>

              ${courseBookings.length === 0 ? `
                <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.25rem; text-align:center; color:#64748b; font-size:0.86rem;">
                  <div style="opacity:0.6; margin-bottom:0.35rem;">${Icons.inbox('', 26)}</div>
                  <strong style="display:block; color:#475569;">Aún no hay estudiantes inscritos</strong>
                  <p style="margin:2px 0 0; font-size:0.8rem;">En cuanto los estudiantes se matriculen a través de la plataforma, verás sus nombres, horarios y comprobantes aquí.</p>
                </div>
              ` : `
                <div style="max-height:280px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px;">
                  <table class="table" style="margin:0; font-size:0.82rem; width:100%; border-collapse:collapse;">
                    <thead>
                      <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; text-align:left;">
                        <th style="padding:8px 12px; font-weight:700; color:#475569;">Estudiante</th>
                        <th style="padding:8px 12px; font-weight:700; color:#475569;">Sesión / Modalidad</th>
                        <th style="padding:8px 12px; font-weight:700; color:#475569;">Fecha Registro</th>
                        <th style="padding:8px 12px; font-weight:700; color:#475569; text-align:center;">Estado</th>
                        ${price > 0 ? '<th style="padding:8px 12px; font-weight:700; color:#475569; text-align:center;">Comprobante</th>' : ''}
                      </tr>
                    </thead>
                    <tbody>
                      ${courseBookings.map((b) => {
                        const student = b.student || state.users?.find((u) => u.id === b.studentId);
                        const tutoria = sessions.find((s) => s.id === b.tutoriaId) || b.tutoria;
                        const statusClass = b.status === 'confirmed' ? 'badge-success' : (b.status === 'pending' ? 'badge-warning' : 'badge-danger');
                        const statusLabel = b.status === 'confirmed' ? 'Confirmado' : (b.status === 'pending' ? 'En verificación' : 'Cancelado');
                        const bookingDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
                        return `
                          <tr style="border-bottom:1px solid #f1f5f9;">
                            <td style="padding:8px 12px;">
                              <strong style="color:#0f172a; display:block;">${student?.name || 'Estudiante UPDS'}</strong>
                              <small style="color:#64748b;">${student?.email || 'estudiante@upds.edu.bo'}</small>
                            </td>
                            <td style="padding:8px 12px; color:#334155;">
                              ${tutoria?.title || 'General'}
                            </td>
                            <td style="padding:8px 12px; color:#64748b; white-space:nowrap;">
                              ${bookingDate}
                            </td>
                            <td style="padding:8px 12px; text-align:center;">
                              <span class="badge ${statusClass}" style="font-weight:700; font-size:0.72rem;">
                                ${statusLabel}
                              </span>
                            </td>
                            ${price > 0 ? `
                              <td style="padding:8px 12px; text-align:center;">
                                ${b.receiptUrl ? `
                                  <button type="button" class="btn btn-xs btn-outline btn-view-receipt-item" data-receipt="${b.receiptUrl}" style="padding:2px 8px; font-size:0.72rem; gap:0.25rem;">
                                    ${Icons.fileText('', 11)} Ver Recibo
                                  </button>
                                ` : '<span style="color:#94a3b8; font-size:0.72rem;">Sin recibo</span>'}
                              </td>
                            ` : ''}
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          ` : ''}
        </div>
      `,
      confirmText: 'Cerrar',
      cancelText: false,
      onConfirm: () => {},
    });

    // Enlazar vista rápida de recibo dentro del modal de detalles
    if (canViewEnrolledStudents) {
      setTimeout(() => {
        const modalEl = document.querySelector('.modal-overlay');
        modalEl?.querySelectorAll('.btn-view-receipt-item').forEach((btn) => {
          btn.addEventListener('click', () => {
            const receiptUrl = btn.getAttribute('data-receipt');
            if (receiptUrl) {
              Modal.open({
                title: 'Comprobante de Pago — ' + course.title,
                size: 'md',
                content: `
                  <div style="text-align:center; padding:0.5rem 0;">
                    <img src="${receiptUrl}" alt="Comprobante Bancario" style="max-width:100%; max-height:480px; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.15); object-fit:contain;" />
                  </div>
                `,
                confirmText: 'Volver a Detalles',
                cancelText: false,
                onConfirm: () => {
                  this.openCourseDetails(course);
                },
              });
            }
          });
        });
      }, 50);
    }
  },

  openCourseModal(course = null) {
    const isEdit = Boolean(course);
    const title = isEdit ? 'Editar Curso / Taller' : 'Crear Nuevo Curso o Taller Extracurricular';
    const state = store.getState();
    const activeUser = state.activeUser;
    const isTutor = activeUser?.role === 'tutor';
    const tutors = (state.users || []).filter((u) => u.role === 'tutor');

    const { text: cleanDesc, externalTutor: initialExtTutor, price: initialPrice } = parseCourseDescription(course?.description);
    let isExternal = isTutor ? false : Boolean(initialExtTutor);
    let isPaid = (initialPrice || 0) > 0;
    let selectedTutorId = isTutor ? activeUser.id : (course?.tutorId || null);
    let selectedTutor = isTutor ? activeUser : (tutors.find((u) => u.id === selectedTutorId) || course?.tutor || null);

    const form = document.createElement('form');
    form.id = 'course-modal-form';
    form.className = 'modal-form';
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="course-title-input">Nombre del Curso / Taller *</label>
        <input type="text" id="course-title-input" class="form-control" value="${course?.title || ''}" placeholder="Ej. Taller Práctico de Machine Learning" maxlength="85" required />
        <small class="form-help">Mínimo 3 caracteres, máximo 85 (alineación óptima de 2 líneas).</small>
      </div>

      <div class="form-group">
        <label class="form-label" for="course-desc-input">Descripción del Curso</label>
        <textarea id="course-desc-input" class="form-control" rows="3" placeholder="Objetivos, temario y alcance" maxlength="500">${cleanDesc || ''}</textarea>
        <small class="form-help">Máximo 500 caracteres.</small>
      </div>

      <!-- Modalidad de Arancel / Costo del Curso -->
      <div class="form-group" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem 0.85rem; margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.4rem;">
          <label class="form-label" style="margin-bottom:0; font-weight:700;">Arancel / Modalidad de Cobro *</label>
          <div class="pricing-mode-switch" style="display:inline-flex; background:#ffffff; border:1px solid #cbd5e1; padding:2px; border-radius:6px; font-size:0.78rem;">
            <button type="button" class="btn-mode-price ${!isPaid ? 'active' : ''}" data-mode="free" style="border:none; background:${!isPaid ? '#22c55e' : 'transparent'}; color:${!isPaid ? '#ffffff' : '#64748b'}; padding:0.25rem 0.65rem; border-radius:4px; font-weight:700; cursor:pointer;">
              Gratuito (0 Bs)
            </button>
            <button type="button" class="btn-mode-price ${isPaid ? 'active' : ''}" data-mode="paid" style="border:none; background:${isPaid ? '#0284c7' : 'transparent'}; color:${isPaid ? '#ffffff' : '#64748b'}; padding:0.25rem 0.65rem; border-radius:4px; font-weight:700; cursor:pointer;">
              De Pago (Arancel en Bs)
            </button>
          </div>
        </div>
        <div id="course-price-wrapper" style="${isPaid ? 'display:block;' : 'display:none;'} margin-top:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" id="course-price-input" class="form-control" value="${initialPrice || 50}" min="5" max="9999" placeholder="50" style="max-width:140px; font-weight:700;" />
            <span style="font-weight:700; color:var(--primary-navy); font-size:0.88rem;">Bs (Bolivianos)</span>
          </div>
          <small class="form-help">Al inscribirse, los estudiantes deberán transferir este monto por QR y adjuntar su comprobante de pago.</small>
        </div>
      </div>

      ${isTutor ? `
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label class="form-label" style="font-weight:700;">Docente Titular a Cargo</label>
          <div style="background:#e8f1fa; border:1px solid #bfdbfe; border-radius:8px; padding:0.65rem 0.85rem; display:flex; align-items:center; gap:0.65rem;">
            <span style="background:var(--primary-navy); color:#ffffff; width:34px; height:34px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${Icons.cap('', 16)}
            </span>
            <div style="line-height:1.25;">
              <strong style="color:var(--primary-navy); font-size:0.9rem; display:block;">${activeUser.name}</strong>
              <small style="color:#64748b; font-size:0.78rem;">${activeUser.email} · Tu cuenta docente (asignación automática)</small>
            </div>
          </div>
        </div>
      ` : `
      <div class="form-group" style="margin-bottom: 0.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; flex-wrap:gap:0.4rem;">
          <label class="form-label" style="margin-bottom:0;">Docente / Expositor Asignado</label>
          <div class="tutor-mode-switch" style="display:inline-flex; background:#f1f5f9; border:1px solid #e2e8f0; padding:2px; border-radius:6px; font-size:0.78rem;">
            <button type="button" class="btn-mode-tutor ${!isExternal ? 'active' : ''}" data-mode="internal" style="border:none; background:${!isExternal ? '#ffffff' : 'transparent'}; color:${!isExternal ? 'var(--primary-navy)' : '#64748b'}; padding:0.25rem 0.65rem; border-radius:4px; font-weight:600; cursor:pointer; box-shadow:${!isExternal ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
              Docente UPDS
            </button>
            <button type="button" class="btn-mode-tutor ${isExternal ? 'active' : ''}" data-mode="external" style="border:none; background:${isExternal ? '#ffffff' : 'transparent'}; color:${isExternal ? '#b45309' : '#64748b'}; padding:0.25rem 0.65rem; border-radius:4px; font-weight:600; cursor:pointer; box-shadow:${isExternal ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
              Docente Exterior / Invitado
            </button>
          </div>
        </div>

        <!-- Panel Docente Interno UPDS con Buscador desplegable -->
        <div id="internal-tutor-panel" style="${isExternal ? 'display:none;' : 'display:block;'}">
          <!-- Chip de Docente Seleccionado -->
          <div id="selected-tutor-chip" class="selected-tutor-chip" style="${selectedTutor ? 'display:flex;' : 'display:none;'}">
            <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:0;">
              <span style="background:#e8f1fa; color:var(--primary-navy); width:32px; height:32px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${Icons.cap('', 16)}
              </span>
              <div style="line-height:1.2; min-width:0;">
                <strong id="selected-tutor-name" style="display:block; font-size:0.88rem; color:var(--primary-navy); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                  ${selectedTutor?.name || ''}
                </strong>
                <small id="selected-tutor-email" style="color:#64748b; font-size:0.78rem;">
                  (${selectedTutor?.email || ''})
                </small>
              </div>
            </div>
            <button type="button" id="btn-clear-tutor" class="btn btn-xs btn-outline" style="border-radius:20px; font-size:0.75rem; flex-shrink:0;">
              Cambiar
            </button>
          </div>

          <!-- Buscador de Docentes en tiempo real -->
          <div id="tutor-search-wrapper" style="${selectedTutor ? 'display:none;' : 'display:block;'} position:relative;">
            <div style="position:relative;">
              <input type="text" id="tutor-search-input" class="form-control" placeholder="Escribe el nombre o correo del docente..." maxlength="60" autocomplete="off" style="padding-left:2.2rem; font-size:0.88rem;" />
              <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); opacity:0.5; pointer-events:none; display:flex; align-items:center;">${Icons.search('', 15)}</span>
            </div>
            <div id="tutor-search-results" class="tutor-search-results" style="display:none;"></div>
            <small class="form-help">Escribe para filtrar los docentes y tutores de la universidad. Muestra nombre y su correo entre paréntesis.</small>
          </div>
        </div>

        <!-- Panel Docente Exterior / Invitado -->
        <div id="external-tutor-panel" style="${isExternal ? 'display:block;' : 'display:none;'}">
          <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:8px; padding:0.6rem 0.85rem; margin-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.4rem; color:#92400e; font-size:0.82rem; margin-bottom:0.2rem; font-weight:700;">
              <span>ℹ️</span> Docente o Expositor Externo (Sin cuenta requerida)
            </div>
            <p style="margin:0; font-size:0.76rem; color:#b45309; line-height:1.4;">
              No requiere crear una cuenta institucional. Se reflejará con el distintivo oficial <strong>Exterior / Invitado</strong> en las tarjetas y detalles del taller.
            </p>
          </div>
          <input type="text" id="external-tutor-input" class="form-control" placeholder="Ej: Ing. Roberto Torrez (Especialista en Seguridad Ofensiva)" maxlength="65" value="${initialExtTutor || ''}" />
          <small class="form-help">Máximo 65 caracteres.</small>
        </div>
      </div>
      `}
    `;

    // Conectar eventos de modalidad de precio
    const btnModePrices = form.querySelectorAll('.btn-mode-price');
    const priceWrapper = form.querySelector('#course-price-wrapper');
    const priceInput = form.querySelector('#course-price-input');
    btnModePrices.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        isPaid = mode === 'paid';
        btnModePrices.forEach((b) => {
          const active = b.getAttribute('data-mode') === mode;
          b.classList.toggle('active', active);
          b.style.background = active ? (isPaid ? '#0284c7' : '#22c55e') : 'transparent';
          b.style.color = active ? '#ffffff' : '#64748b';
        });
        if (isPaid) {
          priceWrapper.style.display = 'block';
          priceInput?.focus();
        } else {
          priceWrapper.style.display = 'none';
        }
      });
    });

    if (!isTutor) {
      // Conectar eventos del formulario de tutor para rol Administrador
      const btnModeTutors = form.querySelectorAll('.btn-mode-tutor');
      const internalPanel = form.querySelector('#internal-tutor-panel');
      const externalPanel = form.querySelector('#external-tutor-panel');
      const externalInput = form.querySelector('#external-tutor-input');

      btnModeTutors.forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          isExternal = mode === 'external';
          btnModeTutors.forEach((b) => {
            const active = b.getAttribute('data-mode') === mode;
            b.style.background = active ? '#ffffff' : 'transparent';
            b.style.color = active ? (mode === 'external' ? '#b45309' : 'var(--primary-navy)') : '#64748b';
            b.style.boxShadow = active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';
          });
          if (isExternal) {
            if (internalPanel) internalPanel.style.display = 'none';
            if (externalPanel) externalPanel.style.display = 'block';
            externalInput?.focus();
          } else {
            if (internalPanel) internalPanel.style.display = 'block';
            if (externalPanel) externalPanel.style.display = 'none';
          }
        });
      });

      const tutorInput = form.querySelector('#tutor-search-input');
      const tutorResults = form.querySelector('#tutor-search-results');
      const selectedChip = form.querySelector('#selected-tutor-chip');
      const tutorSearchWrapper = form.querySelector('#tutor-search-wrapper');
      const selectedName = form.querySelector('#selected-tutor-name');
      const selectedEmail = form.querySelector('#selected-tutor-email');
      const clearTutorBtn = form.querySelector('#btn-clear-tutor');

      const renderTutorMatches = (query = '') => {
        const term = query.trim().toLowerCase();
        const matches = tutors.filter((t) => {
          if (!term) return true;
          return (t.name && t.name.toLowerCase().includes(term)) ||
                 (t.email && t.email.toLowerCase().includes(term));
        });

        if (matches.length === 0) {
          if (tutorResults) {
            tutorResults.innerHTML = `
              <div style="padding:0.65rem 0.85rem; color:#94a3b8; font-size:0.82rem; text-align:center;">
                No se encontró ningún docente con "${query}".
              </div>
            `;
            tutorResults.style.display = 'block';
          }
          return;
        }

        if (tutorResults) {
          tutorResults.innerHTML = `
            <div class="tutor-search-item" data-id="" style="padding:0.5rem 0.85rem; border-bottom:1px solid #f1f5f9; cursor:pointer; font-size:0.82rem; color:#64748b;">
              <em>-- Sin docente asignado (Coordinación Académica) --</em>
            </div>
            ${matches.map((t) => `
              <div class="tutor-search-item" data-id="${t.id}" style="padding:0.6rem 0.85rem; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; flex-direction:column; gap:0.15rem;">
                <strong style="color:var(--primary-navy); font-size:0.88rem;">${t.name}</strong>
                <span style="color:#64748b; font-size:0.78rem;">(${t.email})</span>
              </div>
            `).join('')}
          `;
          tutorResults.style.display = 'block';

          tutorResults.querySelectorAll('.tutor-search-item').forEach((item) => {
            item.addEventListener('click', () => {
              const id = item.getAttribute('data-id');
              if (!id) {
                selectedTutorId = null;
                selectedTutor = null;
                if (selectedName) selectedName.textContent = 'Coordinación Académica';
                if (selectedEmail) selectedEmail.textContent = '(academica@upds.edu.bo)';
                if (selectedChip) selectedChip.style.display = 'flex';
                if (tutorSearchWrapper) tutorSearchWrapper.style.display = 'none';
                if (tutorResults) tutorResults.style.display = 'none';
                return;
              }
              const found = tutors.find((t) => t.id === id);
              if (found) {
                selectedTutorId = found.id;
                selectedTutor = found;
                if (selectedName) selectedName.textContent = found.name;
                if (selectedEmail) selectedEmail.textContent = `(${found.email})`;
                if (selectedChip) selectedChip.style.display = 'flex';
                if (tutorSearchWrapper) tutorSearchWrapper.style.display = 'none';
                if (tutorResults) tutorResults.style.display = 'none';
              }
            });
          });
        }
      };

      tutorInput?.addEventListener('focus', () => {
        renderTutorMatches(tutorInput.value);
      });

      tutorInput?.addEventListener('input', (e) => {
        renderTutorMatches(e.target.value);
      });

      clearTutorBtn?.addEventListener('click', () => {
        selectedTutorId = null;
        selectedTutor = null;
        if (selectedChip) selectedChip.style.display = 'none';
        if (tutorSearchWrapper) tutorSearchWrapper.style.display = 'block';
        if (tutorInput) {
          tutorInput.value = '';
          tutorInput.focus();
        }
        renderTutorMatches('');
      });

      form.addEventListener('click', (e) => {
        if (!tutorSearchWrapper?.contains(e.target)) {
          if (tutorResults) tutorResults.style.display = 'none';
        }
      });
    }

    Modal.open({
      title,
      size: 'lg',
      content: form,
      confirmText: isEdit ? 'Guardar Cambios' : 'Crear Curso / Taller',
      onConfirm: async () => {
        const titleVal = form.querySelector('#course-title-input').value.trim();
        const descVal = form.querySelector('#course-desc-input').value.trim();
        const extTutorVal = isTutor ? null : (isExternal ? (form.querySelector('#external-tutor-input')?.value.trim() || null) : null);
        const tutorIdVal = isTutor ? activeUser.id : (isExternal ? null : selectedTutorId);

        const validation = Validators.validateCourse({ title: titleVal, tutorId: tutorIdVal });
        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          const isPricePaid = isPaid;
          const priceInputVal = parseInt(form.querySelector('#course-price-input')?.value || '0', 10);
          const priceVal = isPricePaid ? (isNaN(priceInputVal) || priceInputVal <= 0 ? 50 : priceInputVal) : 0;
          const formattedDesc = formatCourseDescription(descVal, extTutorVal, priceVal);

          const payload = {
            title: titleVal,
            description: formattedDesc || null,
            tutorId: tutorIdVal,
            price: priceVal,
            category: titleVal.toLowerCase().includes('bootcamp') ? 'Bootcamp' : (titleVal.toLowerCase().includes('hackathon') ? 'Hackathon' : (titleVal.toLowerCase().includes('ciberseguridad') ? 'Ciberseguridad' : 'Taller')),
          };

          if (isEdit) {
            await api.courses.update(course.id, payload);
            Toast.success('Curso actualizado exitosamente.');
          } else {
            await api.courses.create(payload);
            Toast.success('Curso creado exitosamente.');

            // Notificación automática a los estudiantes sobre nueva convocatoria abierta
            try {
              const students = (store.getState().users || []).filter((u) => u.role === 'student');
              for (const student of students) {
                await api.notifications.create({
                  userId: student.id,
                  title: `Nuevo Curso / Taller: ${payload.title.slice(0, 30)}`,
                  message: `¡Se ha publicado un nuevo curso institucional: "${payload.title}"! Revisa el catálogo para matricularte.`,
                  type: 'info',
                }).catch(() => {});
              }
            } catch (errNotif) {
              console.warn('Error notificando nuevo curso a estudiantes:', errNotif);
            }
          }

          const updatedCourses = await api.courses.getAll();
          store.setCourses(updatedCourses);
          this._refreshList?.();
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(course) {
    Modal.confirm({
      title: '¿Eliminar Curso o Taller?',
      message: `¿Estás seguro de eliminar el curso o taller <strong>${course.title}</strong>? Se cancelarán también todas sus clases extra y sesiones asociadas.`,
      confirmText: 'Sí, Eliminar',
      danger: true,
      onConfirm: async () => {
        try {
          await api.courses.delete(course.id);
          Toast.success('Curso eliminado exitosamente.');
          const updatedCourses = await api.courses.getAll();
          store.setCourses(updatedCourses);
          this._refreshList?.();
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
