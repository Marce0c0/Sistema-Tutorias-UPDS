// Vista de la Bandeja de Notificaciones — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { can } from '../utils/permissions.js';

export const NotificationsView = {
  render() {
    const state = store.getState();
    const role = state.activeUser?.role;
    const seesAll = can(role, 'notifications.viewAll');
    const canSend = can(role, 'notifications.send');
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let selectedUserId = state.filters.notificationUserId || '';

    const renderNotifications = () => {
      // Un estudiante solo ve sus propios avisos
      const notifications = seesAll
        ? state.notifications
        : state.notifications.filter((n) => n.userId === state.activeUser?.id);
      const bodyContainer = container.querySelector('#notifications-list-container');
      if (!bodyContainer) return;

      if (notifications.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: '🔔',
            title: 'No hay notificaciones',
            description: selectedUserId ? 'El usuario seleccionado no tiene alertas pendientes.' : 'No existen avisos o recordatorios en el sistema.',
            actionText: canSend ? '+ Enviar Notificación' : undefined,
            onAction: canSend ? () => this.openNotificationModal() : undefined,
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="notifications-feed">
          ${notifications.map((n) => `
            <div class="card notification-card ${n.isRead ? 'notification-read' : 'notification-unread'}">
              <div class="notification-type-stripe type-${n.type || 'info'}"></div>
              <div class="notification-body">
                <div class="notification-header">
                  <div class="notification-meta">
                    ${Badge.notificationType(n.type)}
                    <span class="notification-recipient">Para: <strong>${n.user?.name || 'Usuario'}</strong></span>
                    <span class="notification-date">· ${Badge.formatDate(n.createdAt)}</span>
                  </div>
                  <div class="notification-actions">
                    <button class="btn btn-xs ${n.isRead ? 'btn-outline' : 'btn-primary-outline'} btn-toggle-read" data-id="${n.id}" data-read="${n.isRead}">
                      ${n.isRead ? 'Marcar no leída' : '✓ Marcar leída'}
                    </button>
                    ${canSend ? `<button class="btn btn-xs btn-danger-outline btn-delete-notification" data-id="${n.id}" title="Eliminar">🗑️</button>` : ''}
                  </div>
                </div>
                <h4 class="notification-title">${n.title}</h4>
                <p class="notification-msg">${n.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Eventos
      bodyContainer.querySelectorAll('.btn-toggle-read').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const currentRead = btn.getAttribute('data-read') === 'true';
          await this.toggleRead(id, !currentRead);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-notification').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const notification = state.notifications.find((n) => n.id === id);
          if (notification) this.confirmDelete(notification);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Bandeja de Notificaciones y Alertas</h2>
          <p class="view-subtitle">Avisos del sistema, confirmaciones de reserva y respuestas académicas.</p>
        </div>
        <div class="view-actions">
          ${seesAll ? `
            <select id="notification-user-filter" class="form-control" style="width: auto;">
              <option value="">Todos los usuarios</option>
              ${state.users.map((u) => `
                <option value="${u.id}" ${selectedUserId === u.id ? 'selected' : ''}>
                  ${u.name} (${u.role})
                </option>
              `).join('')}
            </select>
          ` : ''}
          ${canSend ? '<button id="btn-create-notification" class="btn btn-primary">+ Enviar Notificación</button>' : ''}
        </div>
      </div>

      <div id="notifications-list-container"></div>
    `;

    // Filtro por Usuario
    container.querySelector('#notification-user-filter')?.addEventListener('change', async (e) => {
      selectedUserId = e.target.value;
      store.state.filters.notificationUserId = selectedUserId;
      try {
        const filtered = await api.notifications.getAll(selectedUserId);
        store.setNotifications(filtered);
      } catch (err) {
        Toast.error(err.message);
      }
    });

    container.querySelector('#btn-create-notification')?.addEventListener('click', () => {
      this.openNotificationModal();
    });

    setTimeout(renderNotifications, 0);
    return container;
  },

  async toggleRead(id, newReadStatus) {
    try {
      await api.notifications.update(id, { isRead: newReadStatus });
      Toast.success(newReadStatus ? 'Notificación marcada como leída.' : 'Notificación marcada como no leída.');

      const currentFilter = store.state.filters.notificationUserId;
      const updated = await api.notifications.getAll(currentFilter);
      store.setNotifications(updated);
    } catch (err) {
      Toast.error(err.message);
    }
  },

  openNotificationModal() {
    const state = store.getState();
    const users = state.users;

    if (users.length === 0) {
      Toast.warning('Debe registrar al menos un usuario para enviar notificaciones.');
      return;
    }

    Modal.open({
      title: 'Emitir Notificación del Sistema',
      content: `
        <form id="notification-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="notif-user-select">Destinatario *</label>
            <select id="notif-user-select" class="form-control" required>
              ${users.map((u) => `
                <option value="${u.id}" ${state.activeUser?.id === u.id ? 'selected' : ''}>
                  ${u.name} (${u.role}) - ${u.email}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="notif-type-select">Tipo de Notificación</label>
            <select id="notif-type-select" class="form-control">
              <option value="info">Información General</option>
              <option value="reminder">Recordatorio de Tutoría</option>
              <option value="booking_update">Actualización de Reserva</option>
              <option value="forum_reply">Respuesta en Foro</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="notif-title-input">Título de la Notificación *</label>
            <input type="text" id="notif-title-input" class="form-control" placeholder="Ej. Recordatorio: Sesión de Examen" required />
            <small class="form-help">Mínimo 2 caracteres.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="notif-message-input">Mensaje / Contenido *</label>
            <textarea id="notif-message-input" class="form-control" rows="3" placeholder="Mensaje descriptivo para el usuario..." required></textarea>
            <small class="form-help">Mínimo 3 caracteres.</small>
          </div>
        </form>
      `,
      confirmText: 'Enviar Alerta',
      onConfirm: async (dialog) => {
        const userId = dialog.querySelector('#notif-user-select').value;
        const type = dialog.querySelector('#notif-type-select').value;
        const titleVal = dialog.querySelector('#notif-title-input').value.trim();
        const messageVal = dialog.querySelector('#notif-message-input').value.trim();

        const validation = Validators.validateNotification({
          userId,
          title: titleVal,
          message: messageVal,
          type,
        });

        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          await api.notifications.create({
            userId,
            title: titleVal,
            message: messageVal,
            type,
          });
          Toast.success('Notificación enviada exitosamente.');

          const currentFilter = store.state.filters.notificationUserId;
          const updated = await api.notifications.getAll(currentFilter);
          store.setNotifications(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(notification) {
    Modal.confirm({
      title: '¿Eliminar Notificación?',
      message: `¿Estás seguro de eliminar el aviso "<strong>${notification.title}</strong>"?`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.notifications.delete(notification.id);
          Toast.success('Notificación eliminada exitosamente.');
          const currentFilter = store.state.filters.notificationUserId;
          const updated = await api.notifications.getAll(currentFilter);
          store.setNotifications(updated);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
