// Vista de Gestión de Reservas de Tutorías — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';

export const BookingsView = {
  render() {
    const state = store.getState();
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const renderList = () => {
      const bookings = state.bookings;
      const bodyContainer = container.querySelector('#bookings-table-container');
      if (!bodyContainer) return;

      if (bookings.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: '📅',
            title: 'No hay reservas registradas',
            description: 'Los estudiantes pueden agendar sesiones de apoyo académico.',
            actionText: '+ Agendar Reserva',
            onAction: () => this.openBookingModal(),
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="table-responsive card">
          <table class="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Materia</th>
                <th>Sesión de Tutoría</th>
                <th>Fecha Programada</th>
                <th>Estado Actual</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map((b) => `
                <tr>
                  <td>
                    <div class="font-semibold">${b.student?.name || 'Estudiante'}</div>
                    <small class="text-muted">${b.student?.email || ''}</small>
                  </td>
                  <td>${b.course?.title || 'Materia'}</td>
                  <td>
                    ${b.tutoria ? `<span class="tutoria-ref-badge">${b.tutoria.title}</span>` : '<span class="text-muted">Cita individual</span>'}
                  </td>
                  <td>${Badge.formatDate(b.scheduledAt)}</td>
                  <td>${Badge.bookingStatus(b.status)}</td>
                  <td class="text-right">
                    <div class="action-btn-group">
                      ${b.status !== 'confirmed' ? `
                        <button class="btn btn-xs btn-success-outline btn-status-booking" data-id="${b.id}" data-status="confirmed" title="Confirmar">✓</button>
                      ` : ''}
                      ${b.status !== 'cancelled' ? `
                        <button class="btn btn-xs btn-warning-outline btn-status-booking" data-id="${b.id}" data-status="cancelled" title="Cancelar">✕</button>
                      ` : ''}
                      <button class="btn btn-xs btn-danger-outline btn-delete-booking" data-id="${b.id}" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Eventos de Cambio Rápido de Estado
      bodyContainer.querySelectorAll('.btn-status-booking').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const newStatus = btn.getAttribute('data-status');
          await this.updateStatus(id, newStatus);
        });
      });

      // Evento Eliminar
      bodyContainer.querySelectorAll('.btn-delete-booking').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const booking = state.bookings.find((b) => b.id === id);
          if (booking) this.confirmDelete(booking);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Reservas de Tutoría</h2>
          <p class="view-subtitle">Supervisión y control del agendamiento de sesiones entre estudiantes y materias.</p>
        </div>
        <div class="view-actions">
          <button id="btn-create-booking" class="btn btn-primary">+ Nueva Reserva</button>
        </div>
      </div>

      <div id="bookings-table-container"></div>
    `;

    container.querySelector('#btn-create-booking').addEventListener('click', () => {
      this.openBookingModal();
    });

    setTimeout(renderList, 0);
    return container;
  },

  async updateStatus(id, status) {
    try {
      await api.bookings.update(id, { status });
      Toast.success(`Estado de reserva actualizado a: ${status}`);
      const updated = await api.bookings.getAll();
      store.setBookings(updated);
    } catch (err) {
      Toast.error(err.message);
    }
  },

  openBookingModal() {
    const state = store.getState();
    const students = state.users.filter((u) => u.role === 'student');
    const courses = state.courses;
    const tutorias = state.tutorias;

    if (students.length === 0 || courses.length === 0) {
      Toast.warning('Debe existir al menos un estudiante y un curso registrado.');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    const defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    Modal.open({
      title: 'Crear Nueva Reserva de Tutoría',
      content: `
        <form id="booking-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="booking-student-select">Estudiante Solicitante *</label>
            <select id="booking-student-select" class="form-control" required>
              ${students.map((s) => `
                <option value="${s.id}" ${state.activeUser?.id === s.id ? 'selected' : ''}>
                  ${s.name} (${s.email})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="booking-course-select">Materia Curricular *</label>
            <select id="booking-course-select" class="form-control" required>
              ${courses.map((c) => `
                <option value="${c.id}">${c.title} (${c.tutor ? `Tutor: ${c.tutor.name}` : 'Sin tutor'})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="booking-tutoria-select">Tutoría Programada (Opcional)</label>
            <select id="booking-tutoria-select" class="form-control">
              <option value="">-- Cita de apoyo individual --</option>
              ${tutorias.map((t) => `
                <option value="${t.id}">${t.title} [${t.course?.title || ''}] - ${Badge.formatDate(t.date)}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="booking-date-input">Fecha y Hora Programada *</label>
            <input type="datetime-local" id="booking-date-input" class="form-control" value="${defaultDate}" required />
          </div>
        </form>
      `,
      confirmText: 'Registrar Reserva',
      onConfirm: async (dialog) => {
        const studentId = dialog.querySelector('#booking-student-select').value;
        const courseId = dialog.querySelector('#booking-course-select').value;
        const tutoriaId = dialog.querySelector('#booking-tutoria-select').value || null;
        const scheduledAt = dialog.querySelector('#booking-date-input').value;

        const validation = Validators.validateBooking({ studentId, courseId, scheduledAt });
        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          await api.bookings.create({
            studentId,
            courseId,
            tutoriaId,
            scheduledAt: new Date(scheduledAt).toISOString(),
          });
          Toast.success('Reserva creada exitosamente.');

          const [updatedBookings, updatedTutorias] = await Promise.all([
            api.bookings.getAll(),
            api.tutorias.getAll(),
          ]);
          store.setBookings(updatedBookings);
          store.setTutorias(updatedTutorias);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(booking) {
    Modal.confirm({
      title: '¿Eliminar Reserva?',
      message: `¿Estás seguro de eliminar la reserva de <strong>${booking.student?.name || 'Estudiante'}</strong> para la materia <strong>${booking.course?.title || 'Materia'}</strong>?`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.bookings.delete(booking.id);
          Toast.success('Reserva eliminada exitosamente.');
          const updated = await api.bookings.getAll();
          store.setBookings(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
