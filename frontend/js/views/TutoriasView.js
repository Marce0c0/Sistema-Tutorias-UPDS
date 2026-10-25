// Vista de Gestión de Tutorías — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { can } from '../utils/permissions.js';

export const TutoriasView = {
  render() {
    const state = store.getState();
    const role = state.activeUser?.role;
    const canManage = can(role, 'tutorias.manage');
    const canBook = can(role, 'tutorias.book');
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const renderList = () => {
      const tutorias = state.tutorias;
      const bodyContainer = container.querySelector('#tutorias-grid-container');
      if (!bodyContainer) return;

      if (tutorias.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: '🎓',
            title: 'No hay tutorías programadas',
            description: 'Programa una nueva sesión de apoyo académico para los estudiantes.',
            actionText: canManage ? '+ Programar Tutoría' : undefined,
            onAction: canManage ? () => this.openTutoriaModal() : undefined,
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="cards-grid">
          ${tutorias.map((t) => {
            const bookingsCount = t._count?.bookings ?? (t.bookings?.length || 0);
            const isFull = bookingsCount >= t.maxStudents;
            const percent = Math.min(100, Math.round((bookingsCount / t.maxStudents) * 100));

            return `
              <div class="card tutoria-card">
                <div class="tutoria-card-header">
                  <span class="course-pill">${t.course?.title || 'Materia'}</span>
                  ${Badge.tutoriaStatus(t.status)}
                </div>

                <h3 class="tutoria-title">${t.title}</h3>
                <p class="tutoria-desc">${t.description || 'Sin temario detallado.'}</p>

                <div class="tutoria-meta">
                  <div class="meta-row">
                    <span class="meta-label">📅 Fecha y Hora:</span>
                    <span class="meta-val">${Badge.formatDate(t.date)}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">👨‍🏫 Tutor / Organizador:</span>
                    <span class="meta-val">${t.course?.tutor?.name || 'No asignado'}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">📍 Ubicación / Enlace:</span>
                    <span class="meta-val">${t.location || (t.meetingUrl ? `<a href="${t.meetingUrl}" target="_blank">Enlace Virtual</a>` : 'Campus Central')}</span>
                  </div>
                </div>

                <div class="capacity-box">
                  <div class="capacity-labels">
                    <span>Capacidad: ${bookingsCount} / ${t.maxStudents} estudiantes</span>
                    <span class="${isFull ? 'text-danger font-semibold' : 'text-muted'}">${isFull ? '¡Lleno!' : `${t.maxStudents - bookingsCount} disp.`}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill ${isFull ? 'progress-full' : ''}" style="width: ${percent}%;"></div>
                  </div>
                </div>

                <div class="tutoria-footer">
                  ${canBook ? `
                    <button class="btn btn-sm btn-primary btn-book-tutoria" data-id="${t.id}" data-course-id="${t.courseId}" data-date="${t.date}" ${isFull || t.status !== 'active' ? 'disabled' : ''}>
                      📅 Reservar Cupo
                    </button>
                  ` : ''}
                  ${canManage ? `
                    <div class="footer-actions">
                      <button class="btn btn-xs btn-outline btn-edit-tutoria" data-id="${t.id}">✏️</button>
                      <button class="btn btn-xs btn-danger-outline btn-delete-tutoria" data-id="${t.id}">🗑️</button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Eventos
      bodyContainer.querySelectorAll('.btn-book-tutoria').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const tutoriaId = btn.getAttribute('data-id');
          const courseId = btn.getAttribute('data-course-id');
          const date = btn.getAttribute('data-date');
          await this.quickBook(tutoriaId, courseId, date);
        });
      });

      bodyContainer.querySelectorAll('.btn-edit-tutoria').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const tutoria = state.tutorias.find((t) => t.id === id);
          if (tutoria) this.openTutoriaModal(tutoria);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-tutoria').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const tutoria = state.tutorias.find((t) => t.id === id);
          if (tutoria) this.confirmDelete(tutoria);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Sesiones de Tutoría Programadas</h2>
          <p class="view-subtitle">Organización, cupos y estado de sesiones grupales o individuales.</p>
        </div>
        <div class="view-actions">
          ${canManage ? '<button id="btn-create-tutoria" class="btn btn-primary">+ Programar Tutoría</button>' : ''}
        </div>
      </div>

      <div id="tutorias-grid-container"></div>
    `;

    container.querySelector('#btn-create-tutoria')?.addEventListener('click', () => {
      this.openTutoriaModal();
    });

    setTimeout(renderList, 0);
    return container;
  },

  async quickBook(tutoriaId, courseId, scheduledAt) {
    const state = store.getState();
    const student = state.activeUser;

    if (!student) {
      Toast.error('Debe seleccionar un usuario activo en sesión.');
      return;
    }

    try {
      await api.bookings.create({
        studentId: student.id,
        courseId,
        tutoriaId,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      Toast.success(`¡Reserva creada exitosamente para ${student.name}!`);

      // Refrescar tutorías y reservas
      const [updatedTutorias, updatedBookings] = await Promise.all([
        api.tutorias.getAll(),
        api.bookings.getAll(),
      ]);
      store.setTutorias(updatedTutorias);
      store.setBookings(updatedBookings);
    } catch (err) {
      Toast.error(err.message);
    }
  },

  openTutoriaModal(tutoria = null) {
    const isEdit = Boolean(tutoria);
    const title = isEdit ? 'Editar Tutoría' : 'Programar Nueva Tutoría';
    const state = store.getState();
    const courses = state.courses;

    if (courses.length === 0) {
      Toast.warning('Debe registrar al menos una materia antes de programar tutorías.');
      store.setView('courses');
      return;
    }

    // Formatear fecha para datetime-local
    let defaultDate = '';
    if (tutoria?.date) {
      const d = new Date(tutoria.date);
      defaultDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(16, 0, 0, 0);
      defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    Modal.open({
      title,
      content: `
        <form id="tutoria-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="tutoria-course-select">Materia Curricular *</label>
            <select id="tutoria-course-select" class="form-control" required>
              ${courses.map((c) => `
                <option value="${c.id}" ${tutoria?.courseId === c.id ? 'selected' : ''}>
                  ${c.title} (${c.tutor ? `Tutor: ${c.tutor.name}` : 'Sin tutor'})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="tutoria-title-input">Tema o Propósito de la Tutoría *</label>
            <input type="text" id="tutoria-title-input" class="form-control" value="${tutoria?.title || ''}" placeholder="Ej. Taller Práctico de SQL y Normalización" required />
            <small class="form-help">Mínimo 3 caracteres.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="tutoria-desc-input">Detalles / Temario a cubrir</label>
            <textarea id="tutoria-desc-input" class="form-control" rows="2" placeholder="Ejercicios del examen, dudas de instalación, etc.">${tutoria?.description || ''}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="tutoria-date-input">Fecha y Hora Programada *</label>
              <input type="datetime-local" id="tutoria-date-input" class="form-control" value="${defaultDate}" required />
            </div>

            <div class="form-group col-3">
              <label class="form-label" for="tutoria-max-input">Cupo Máximo *</label>
              <input type="number" id="tutoria-max-input" class="form-control" value="${tutoria?.maxStudents || 10}" min="1" max="100" required />
            </div>

            <div class="form-group col-3">
              <label class="form-label" for="tutoria-status-select">Estado</label>
              <select id="tutoria-status-select" class="form-control">
                <option value="active" ${tutoria?.status === 'active' ? 'selected' : ''}>Activa</option>
                <option value="completed" ${tutoria?.status === 'completed' ? 'selected' : ''}>Completada</option>
                <option value="cancelled" ${tutoria?.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
              </select>
            </div>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Programar Sesión',
      onConfirm: async (dialog) => {
        const courseId = dialog.querySelector('#tutoria-course-select').value;
        const titleVal = dialog.querySelector('#tutoria-title-input').value.trim();
        const descVal = dialog.querySelector('#tutoria-desc-input').value.trim();
        const dateVal = dialog.querySelector('#tutoria-date-input').value;
        const maxStudents = Number(dialog.querySelector('#tutoria-max-input').value);
        const status = dialog.querySelector('#tutoria-status-select').value;

        const validation = Validators.validateTutoria({
          courseId,
          title: titleVal,
          date: dateVal,
          maxStudents,
          status,
        });

        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          const payload = {
            courseId,
            title: titleVal,
            description: descVal || null,
            date: new Date(dateVal).toISOString(),
            maxStudents,
            status,
          };

          if (isEdit) {
            await api.tutorias.update(tutoria.id, payload);
            Toast.success('Tutoría actualizada correctamente.');
          } else {
            await api.tutorias.create(payload);
            Toast.success('Tutoría programada exitosamente.');
          }

          const updated = await api.tutorias.getAll();
          store.setTutorias(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(tutoria) {
    Modal.confirm({
      title: '¿Eliminar Tutoría?',
      message: `¿Estás seguro de cancelar y eliminar la sesión <strong>${tutoria.title}</strong>?`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.tutorias.delete(tutoria.id);
          Toast.success('Tutoría eliminada exitosamente.');
          const updated = await api.tutorias.getAll();
          store.setTutorias(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
