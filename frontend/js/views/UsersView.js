// Vista de Gestión de Usuarios — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { Icons } from '../components/Icons.js';

export const UsersView = {
  render() {
    const state = store.getState();
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let currentRoleFilter = state.filters.userRole || '';

    const renderList = () => {
      const filteredUsers = state.users.filter((u) => {
        if (!currentRoleFilter) return true;
        return u.role === currentRoleFilter;
      });

      const bodyContainer = container.querySelector('#users-table-container');
      if (!bodyContainer) return;

      if (filteredUsers.length === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: Icons.users('', 36),
            title: 'No se encontraron usuarios',
            description: currentRoleFilter ? 'No hay usuarios registrados con el rol seleccionado.' : 'Comienza creando el primer usuario.',
            actionText: '+ Registrar Usuario',
            onAction: () => this.openUserModal(),
          })
        );
        return;
      }

      bodyContainer.innerHTML = `
        <div class="table-responsive card">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Fecha de Registro</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map((u) => `
                <tr>
                  <td class="font-semibold">${u.name}</td>
                  <td class="text-muted">${u.email}</td>
                  <td>${Badge.role(u.role)}</td>
                  <td>${Badge.formatDate(u.createdAt)}</td>
                  <td class="text-right">
                    <button class="btn btn-xs btn-outline btn-edit-user" data-id="${u.id}" style="display:inline-flex; align-items:center; gap:0.25rem;">
                      ${Icons.edit('', 12)} <span>Editar</span>
                    </button>
                    <button class="btn btn-xs btn-danger-outline btn-delete-user" data-id="${u.id}" style="display:inline-flex; align-items:center; gap:0.25rem;">
                      ${Icons.trash('', 12)} <span>Eliminar</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Eventos de Editar y Eliminar
      bodyContainer.querySelectorAll('.btn-edit-user').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const user = state.users.find((u) => u.id === id);
          if (user) this.openUserModal(user);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-user').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const user = state.users.find((u) => u.id === id);
          if (user) this.confirmDelete(user);
        });
      });
    };

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Directorio de Usuarios</h2>
          <p class="view-subtitle">Administra los estudiantes, tutores y personal académico registrados.</p>
        </div>
        <div class="view-actions">
          <select id="user-role-filter" class="form-control" style="width: auto;">
            <option value="">Todos los roles</option>
            <option value="student" ${currentRoleFilter === 'student' ? 'selected' : ''}>Estudiantes</option>
            <option value="tutor" ${currentRoleFilter === 'tutor' ? 'selected' : ''}>Tutores</option>
            <option value="admin" ${currentRoleFilter === 'admin' ? 'selected' : ''}>Administradores</option>
          </select>
          <button id="btn-create-user" class="btn btn-primary">+ Nuevo Usuario</button>
        </div>
      </div>

      <div id="users-table-container"></div>
    `;

    // Filtro por Rol
    container.querySelector('#user-role-filter').addEventListener('change', (e) => {
      currentRoleFilter = e.target.value;
      store.state.filters.userRole = currentRoleFilter;
      renderList();
    });

    // Botón Crear
    container.querySelector('#btn-create-user').addEventListener('click', () => {
      this.openUserModal();
    });

    setTimeout(renderList, 0);
    return container;
  },

  openUserModal(user = null) {
    const isEdit = Boolean(user);
    const title = isEdit ? 'Editar Usuario' : 'Registrar Nuevo Usuario';

    Modal.open({
      title,
      content: `
        <form id="user-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="user-name-input">Nombre Completo *</label>
            <input type="text" id="user-name-input" class="form-control" value="${user?.name || ''}" placeholder="Ej. Carlos Mendoza" required />
            <small class="form-help">Mínimo 2 caracteres.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-email-input">Correo Electrónico Institucional *</label>
            <input type="email" id="user-email-input" class="form-control" value="${user?.email || ''}" placeholder="carlos@upds.edu.bo" required ${isEdit ? 'readonly style="background:#f1f5f9;"' : ''} />
            <small class="form-help">${isEdit ? 'El correo no se puede modificar.' : 'Debe ser único en el sistema.'}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-role-input">Rol del Usuario *</label>
            <select id="user-role-input" class="form-control" required>
              <option value="student" ${user?.role === 'student' ? 'selected' : ''}>Estudiante</option>
              <option value="tutor" ${user?.role === 'tutor' ? 'selected' : ''}>Tutor Docente</option>
              <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-password-input">${isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso JWT (Opcional)'}</label>
            <input type="password" id="user-password-input" class="form-control" placeholder="${isEdit ? 'Dejar en blanco para conservar actual' : 'Por defecto: Upds2026'}" />
            <small class="form-help">${isEdit ? 'Solo escribe si deseas restablecer la contraseña (mínimo 6 caracteres).' : 'Si se deja vacío, la clave inicial será <code>Upds2026</code>.'}</small>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Registrar',
      onConfirm: async (dialog) => {
        const name = dialog.querySelector('#user-name-input').value.trim();
        const email = dialog.querySelector('#user-email-input').value.trim();
        const role = dialog.querySelector('#user-role-input').value;
        const password = dialog.querySelector('#user-password-input').value.trim() || undefined;

        const validation = Validators.validateUser({ name, email, role });
        if (!validation.isValid) {
          Toast.error(validation.errors[0]);
          return false;
        }

        try {
          if (isEdit) {
            await api.users.update(user.id, { name, role, ...(password ? { password } : {}) });
            Toast.success('Usuario actualizado correctamente.');
          } else {
            await api.users.create({ name, email, role, password });
            Toast.success('Usuario creado exitosamente con clave de acceso.');
          }

          // Recargar lista desde la BD
          const updatedUsers = await api.users.getAll();
          store.setUsers(updatedUsers);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },

  confirmDelete(user) {
    Modal.confirm({
      title: '¿Eliminar Usuario?',
      message: `¿Estás seguro de eliminar al usuario <strong>${user.name}</strong> (${user.email})? Se eliminarán también sus reservas asociadas.`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          await api.users.delete(user.id);
          Toast.success('Usuario eliminado exitosamente.');
          const updatedUsers = await api.users.getAll();
          store.setUsers(updatedUsers);
          return true;
        } catch (err) {
          Toast.error(err.message);
          return false;
        }
      },
    });
  },
};
