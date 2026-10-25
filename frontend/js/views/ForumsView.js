// Vista del Foro Académico de Dudas — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { can } from '../utils/permissions.js';

export const ForumsView = {
  render() {
    const state = store.getState();
    const role = state.activeUser?.role;
    const canModerate = can(role, 'forums.moderate');
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let selectedCourseId = state.filters.forumCourseId || '';

    const renderMessages = () => {
      const messages = state.forums;
      const bodyContainer = container.querySelector('#forum-messages-container');
      if (!bodyContainer) return;

      if (messages.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: '💬',
            title: 'No hay consultas en el foro',
            description: selectedCourseId ? 'No hay preguntas publicadas para esta materia aún.' : 'Sé el primero en iniciar una consulta académica.',
            actionText: '+ Publicar Consulta',
            onAction: () => this.openForumModal(),
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="forum-feed">
          ${messages.map((m) => `
            <div class="card forum-card">
              <div class="forum-card-header">
                <div class="forum-user-meta">
                  <div class="user-avatar">${m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}</div>
                  <div class="user-details">
                    <span class="user-name">${m.user?.name || 'Usuario'}</span>
                    <div class="user-sub">${Badge.role(m.user?.role || 'student')} · <span>${Badge.formatDate(m.createdAt)}</span></div>
                  </div>
                </div>
                <div class="forum-header-right">
                  <span class="course-pill">${m.course?.title || 'Materia'}</span>
                  ${canModerate || m.userId === state.activeUser?.id ? `
                    <div class="forum-actions">
                      <button class="btn btn-xs btn-outline btn-edit-forum" data-id="${m.id}" title="Editar">✏️</button>
                      <button class="btn btn-xs btn-danger-outline btn-delete-forum" data-id="${m.id}" title="Eliminar">🗑️</button>
                    </div>
                  ` : ''}
                </div>
              </div>
              <h3 class="forum-post-title">${m.title}</h3>
              <p class="forum-post-content">${m.content}</p>
            </div>
          `).join('')}
        </div>
      `;

      // Eventos
      bodyContainer.querySelectorAll('.btn-edit-forum').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const message = state.forums.find((m) => m.id === id);
          if (message) this.openForumModal(message);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-forum').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const message = state.forums.find((m) => m.id === id);
          if (message) this.confirmDelete(message);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Foro de Dudas y Consultas</h2>
          <p class="view-subtitle">Espacio colaborativo de interacción entre estudiantes y docentes tutores.</p>
        </div>
        <div class="view-actions">
          <select id="forum-course-filter" class="form-control" style="width: auto;">
            <option value="">Todas las materias</option>
            ${state.courses.map((c) => `
              <option value="${c.id}" ${selectedCourseId === c.id ? 'selected' : ''}>${c.title}</option>
            `).join('')}
          </select>
          <button id="btn-create-forum" class="btn btn-primary">+ Publicar Consulta</button>
        </div>
      </div>

      <div id="forum-messages-container"></div>
    `;

    // Filtro por Curso
    container.querySelector('#forum-course-filter').addEventListener('change', async (e) => {
      selectedCourseId = e.target.value;
      store.state.filters.forumCourseId = selectedCourseId;
      try {
        const filtered = await api.forums.getAll(selectedCourseId);
        store.setForums(filtered);
      } catch (err) {
        Toast.error(err.message);
      }
    });

    container.querySelector('#btn-create-forum').addEventListener('click', () => {
      this.openForumModal();
    });

    setTimeout(renderMessages, 0);
    return container;
  },

  openForumModal(message = null) {
    const isEdit = Boolean(message);
    const title = isEdit ? 'Editar Consulta' : 'Publicar Nueva Consulta en el Foro';
    const state = store.getState();
    const courses = state.courses;
    const users = state.users;

    if (courses.length === 0) {
      Toast.warning('Debe registrar al menos un curso para publicar en el foro.');
      return;
    }

    Modal.open({
      title,
      content: `
        <form id="forum-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="forum-course-select">Materia Relacionada *</label>
            <select id="forum-course-select" class="form-control" required ${isEdit ? 'disabled' : ''}>
              ${courses.map((c) => `
                <option value="${c.id}" ${message?.courseId === c.id ? 'selected' : ''}>${c.title}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="forum-user-select">Autor de la Consulta *</label>
            <select id="forum-user-select" class="form-control" required disabled>
              ${users.map((u) => `
                <option value="${u.id}" ${(message?.userId || state.activeUser?.id) === u.id ? 'selected' : ''}>
                  ${u.name} (${u.role})
                </option>
              `).join('')}
            </select>
            <small class="form-help">Se publica siempre a nombre del usuario en sesión.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="forum-title-input">Título de la Consulta *</label>
            <input type="text" id="forum-title-input" class="form-control" value="${message?.title || ''}" placeholder="Ej. Duda con promesas async/await en Node.js" required />
            <small class="form-help">Mínimo 3 caracteres.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="forum-content-input">Pregunta / Contenido Detallado *</label>
            <textarea id="forum-content-input" class="form-control" rows="4" placeholder="Describe claramente tu duda..." required>${message?.content || ''}</textarea>
            <small class="form-help">Mínimo 5 caracteres.</small>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Publicar Pregunta',
      onConfirm: async (dialog) => {
        const courseId = dialog.querySelector('#forum-course-select').value;
        const userId = dialog.querySelector('#forum-user-select').value;
        const titleVal = dialog.querySelector('#forum-title-input').value.trim();
        const contentVal = dialog.querySelector('#forum-content-input').value.trim();

        const validation = Validators.validateForumMessage({
          courseId,
          userId,
          title: titleVal,
          content: contentVal,
        });

        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          if (isEdit) {
            await api.forums.update(message.id, { title: titleVal, content: contentVal });
            Toast.success('Consulta actualizada correctamente.');
          } else {
            await api.forums.create({ courseId, userId, title: titleVal, content: contentVal });
            Toast.success('Consulta publicada exitosamente.');
          }

          const currentCourseFilter = store.state.filters.forumCourseId;
          const updated = await api.forums.getAll(currentCourseFilter);
          store.setForums(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(message) {
    Modal.confirm({
      title: '¿Eliminar Mensaje del Foro?',
      message: `¿Estás seguro de eliminar la consulta "<strong>${message.title}</strong>"?`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.forums.delete(message.id);
          Toast.success('Mensaje eliminado exitosamente.');
          const currentCourseFilter = store.state.filters.forumCourseId;
          const updated = await api.forums.getAll(currentCourseFilter);
          store.setForums(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
