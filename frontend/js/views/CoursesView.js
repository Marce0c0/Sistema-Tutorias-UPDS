// Vista del Catálogo de Cursos y Materias — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';

export const CoursesView = {
  render() {
    const state = store.getState();
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const renderList = () => {
      const courses = state.courses;
      const bodyContainer = container.querySelector('#courses-grid-container');
      if (!bodyContainer) return;

      if (courses.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: '📚',
            title: 'No hay cursos registrados',
            description: 'Comienza creando la primera materia académica.',
            actionText: '+ Crear Curso',
            onAction: () => this.openCourseModal(),
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="cards-grid">
          ${courses.map((c) => `
            <div class="card course-card">
              <div class="course-card-header">
                <span class="course-tag">Materia UPDS</span>
                <div class="course-actions">
                  <button class="btn btn-xs btn-outline btn-edit-course" data-id="${c.id}" title="Editar">✏️</button>
                  <button class="btn btn-xs btn-danger-outline btn-delete-course" data-id="${c.id}" title="Eliminar">🗑️</button>
                </div>
              </div>
              <h3 class="course-title">${c.title}</h3>
              <p class="course-desc">${c.description || 'Sin descripción detallada disponible.'}</p>
              <div class="course-footer">
                <div class="course-tutor">
                  <span class="tutor-avatar">👨‍🏫</span>
                  <div class="tutor-info">
                    <span class="tutor-label">Docente Tutor:</span>
                    <span class="tutor-name">${c.tutor?.name || 'No asignado'}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Eventos
      bodyContainer.querySelectorAll('.btn-edit-course').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = state.courses.find((c) => c.id === id);
          if (course) this.openCourseModal(course);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-course').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const course = state.courses.find((c) => c.id === id);
          if (course) this.confirmDelete(course);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Catálogo de Cursos y Materias</h2>
          <p class="view-subtitle">Materias curriculares habilitadas para sesiones de tutoría universitaria.</p>
        </div>
        <div class="view-actions">
          <button id="btn-create-course" class="btn btn-primary">+ Nuevo Curso</button>
        </div>
      </div>

      <div id="courses-grid-container"></div>
    `;

    container.querySelector('#btn-create-course').addEventListener('click', () => {
      this.openCourseModal();
    });

    setTimeout(renderList, 0);
    return container;
  },

  openCourseModal(course = null) {
    const isEdit = Boolean(course);
    const title = isEdit ? 'Editar Curso' : 'Crear Nueva Materia';
    const state = store.getState();
    const tutors = state.users.filter((u) => u.role === 'tutor' || u.role === 'admin');

    Modal.open({
      title,
      content: `
        <form id="course-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="course-title-input">Nombre de la Materia *</label>
            <input type="text" id="course-title-input" class="form-control" value="${course?.title || ''}" placeholder="Ej. Arquitectura de Software" required />
            <small class="form-help">Mínimo 3 caracteres.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="course-desc-input">Descripción del Curso</label>
            <textarea id="course-desc-input" class="form-control" rows="3" placeholder="Objetivos, temario y alcance">${course?.description || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="course-tutor-select">Docente Tutor Asignado</label>
            <select id="course-tutor-select" class="form-control">
              <option value="">-- Sin tutor asignado --</option>
              ${tutors.map((t) => `
                <option value="${t.id}" ${course?.tutorId === t.id ? 'selected' : ''}>
                  ${t.name} (${t.email})
                </option>
              `).join('')}
            </select>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Crear Materia',
      onConfirm: async (dialog) => {
        const titleVal = dialog.querySelector('#course-title-input').value.trim();
        const descVal = dialog.querySelector('#course-desc-input').value.trim();
        const tutorIdVal = dialog.querySelector('#course-tutor-select').value || null;

        const validation = Validators.validateCourse({ title: titleVal, tutorId: tutorIdVal });
        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          const payload = {
            title: titleVal,
            description: descVal || null,
            tutorId: tutorIdVal,
          };

          if (isEdit) {
            await api.courses.update(course.id, payload);
            Toast.success('Curso actualizado exitosamente.');
          } else {
            await api.courses.create(payload);
            Toast.success('Curso creado exitosamente.');
          }

          const updatedCourses = await api.courses.getAll();
          store.setCourses(updatedCourses);
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
      title: '¿Eliminar Curso?',
      message: `¿Estás seguro de eliminar la materia <strong>${course.title}</strong>? Se eliminarán todas sus tutorías y mensajes asociados.`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.courses.delete(course.id);
          Toast.success('Curso eliminado exitosamente.');
          const updatedCourses = await api.courses.getAll();
          store.setCourses(updatedCourses);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
