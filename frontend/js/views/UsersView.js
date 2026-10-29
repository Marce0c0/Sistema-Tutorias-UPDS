// Vista de Gestión de Usuarios — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Validators } from '../utils/validators.js';
import { EmptyState } from '../components/EmptyState.js';
import { Icons } from '../components/Icons.js';
import { Pagination } from '../components/Pagination.js';

export const UsersView = {
  render() {
    const state = store.getState();
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let currentRoleFilter = state.filters.userRole || 'all'; // Todos los roles ya desplegados por defecto
    let searchTerm = '';

    const renderList = () => {
      const currentState = store.getState();
      const usersList = currentState.users || [];
      const term = searchTerm.trim().toLowerCase();

      // Métricas por rol para las pestañas institucionales
      const countAll = usersList.length;
      const countStudents = usersList.filter((u) => u.role === 'student').length;
      const countTutors = usersList.filter((u) => u.role === 'tutor').length;
      const countAdmins = usersList.filter((u) => u.role === 'admin').length;

      // Filtrar por término de búsqueda si existe
      const matchesSearch = (u) => {
        if (!term) return true;
        return (
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term))
        );
      };

      // Definición de las secciones/contenedores por rol
      const roleSections = [
        {
          role: 'student',
          title: 'Estudiantes Matriculados',
          subtitle: 'Comunidad universitaria y participantes inscritos en bootcamps y talleres.',
          badgeLabel: 'Estudiantes',
          badgeBg: '#e0f2fe',
          badgeColor: '#0369a1',
          borderColor: '#0284c7',
          icon: Icons.cap('', 18),
          iconBg: '#eff6ff',
          iconColor: '#0284c7',
          users: usersList.filter((u) => u.role === 'student' && matchesSearch(u)),
        },
        {
          role: 'tutor',
          title: 'Docentes Titulares & Tutores',
          subtitle: 'Docentes responsables de asignaturas, ponentes y tutores de bootcamps.',
          badgeLabel: 'Docentes Titulares',
          badgeBg: '#fef3c7',
          badgeColor: '#b45309',
          borderColor: '#f59e0b',
          icon: Icons.user('', 18),
          iconBg: '#fffbeb',
          iconColor: '#b45309',
          users: usersList.filter((u) => u.role === 'tutor' && matchesSearch(u)),
        },
        {
          role: 'admin',
          title: 'Administración del Sistema UPDS',
          subtitle: 'Personal de coordinación académica, caja y soporte con privilegios de gestión.',
          badgeLabel: 'Administración',
          badgeBg: '#fee2e2',
          badgeColor: '#b91c1c',
          borderColor: '#dc2626',
          icon: Icons.shield('', 18),
          iconBg: '#fef2f2',
          iconColor: '#dc2626',
          users: usersList.filter((u) => u.role === 'admin' && matchesSearch(u)),
        },
      ];

      // Determinar qué secciones mostrar según la pestaña activa
      const visibleSections = currentRoleFilter === 'all'
        ? roleSections
        : roleSections.filter((s) => s.role === currentRoleFilter);

      const totalVisibleUsers = visibleSections.reduce((acc, s) => acc + s.users.length, 0);

      // Renderizar pestañas segmentadas estilo UX/UI moderno y buscador
      const controlsContainer = container.querySelector('#users-controls-container');
      if (controlsContainer) {
        controlsContainer.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap;">
            <!-- Segmented Control de Roles UPDS -->
            <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; padding:4px; display:inline-flex; gap:3px; flex-wrap:wrap; box-shadow:inset 0 1px 2px rgba(0,0,0,0.03);">
              <button type="button" class="btn-role-tab ${currentRoleFilter === 'all' ? 'active' : ''}" data-role="all" style="border:none; border-radius:7px; padding:0.4rem 0.85rem; font-size:0.83rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; transition:all 150ms ease; ${currentRoleFilter === 'all' ? 'background:#ffffff; color:#002855; font-weight:700; box-shadow:0 1px 3px rgba(0,40,85,0.1);' : 'background:transparent; color:#64748b; font-weight:500;'}">
                <span>Todos Desplegados</span>
                <span style="font-size:0.7rem; font-weight:800; padding:1px 7px; border-radius:12px; ${currentRoleFilter === 'all' ? 'background:#e2e8f0; color:#002855;' : 'background:#e2e8f0; color:#64748b;'}">${countAll}</span>
              </button>

              <button type="button" class="btn-role-tab ${currentRoleFilter === 'student' ? 'active' : ''}" data-role="student" style="border:none; border-radius:7px; padding:0.4rem 0.85rem; font-size:0.83rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; transition:all 150ms ease; ${currentRoleFilter === 'student' ? 'background:#ffffff; color:#002855; font-weight:700; box-shadow:0 1px 3px rgba(0,40,85,0.1);' : 'background:transparent; color:#64748b; font-weight:500;'}">
                ${Icons.cap('', 14)} <span>Estudiantes</span>
                <span style="font-size:0.7rem; font-weight:800; padding:1px 7px; border-radius:12px; ${currentRoleFilter === 'student' ? 'background:#e0f2fe; color:#0369a1;' : 'background:#e2e8f0; color:#64748b;'}">${countStudents}</span>
              </button>

              <button type="button" class="btn-role-tab ${currentRoleFilter === 'tutor' ? 'active' : ''}" data-role="tutor" style="border:none; border-radius:7px; padding:0.4rem 0.85rem; font-size:0.83rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; transition:all 150ms ease; ${currentRoleFilter === 'tutor' ? 'background:#ffffff; color:#002855; font-weight:700; box-shadow:0 1px 3px rgba(0,40,85,0.1);' : 'background:transparent; color:#64748b; font-weight:500;'}">
                ${Icons.user('', 14)} <span>Docentes Titulares</span>
                <span style="font-size:0.7rem; font-weight:800; padding:1px 7px; border-radius:12px; ${currentRoleFilter === 'tutor' ? 'background:#fef3c7; color:#b45309;' : 'background:#e2e8f0; color:#64748b;'}">${countTutors}</span>
              </button>

              <button type="button" class="btn-role-tab ${currentRoleFilter === 'admin' ? 'active' : ''}" data-role="admin" style="border:none; border-radius:7px; padding:0.4rem 0.85rem; font-size:0.83rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; transition:all 150ms ease; ${currentRoleFilter === 'admin' ? 'background:#ffffff; color:#002855; font-weight:700; box-shadow:0 1px 3px rgba(0,40,85,0.1);' : 'background:transparent; color:#64748b; font-weight:500;'}">
                ${Icons.shield('', 14)} <span>Administración</span>
                <span style="font-size:0.7rem; font-weight:800; padding:1px 7px; border-radius:12px; ${currentRoleFilter === 'admin' ? 'background:#fee2e2; color:#b91c1c;' : 'background:#e2e8f0; color:#64748b;'}">${countAdmins}</span>
              </button>
            </div>

            <!-- Buscador en tiempo real reactivo -->
            <div style="position:relative; min-width:280px; flex:1; max-width:380px;">
              <span style="position:absolute; left:0.85rem; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; display:flex; align-items:center;">
                ${Icons.search('', 15)}
              </span>
              <input 
                type="text" 
                id="users-search-input" 
                class="form-control" 
                placeholder="Buscar en todos los roles por nombre o correo..." 
                value="${searchTerm}" 
                style="padding-left:2.35rem; padding-right:2.2rem; font-size:0.84rem; height:38px; border-radius:9px; border-color:#cbd5e1; box-shadow:0 1px 2px rgba(0,0,0,0.03);" 
              />
              ${searchTerm ? `
                <button type="button" id="btn-clear-users-search" style="position:absolute; right:0.7rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.15rem; line-height:1; padding:2px;" title="Limpiar búsqueda">
                  &times;
                </button>
              ` : ''}
            </div>
          </div>
        `;

        // Eventos de Pestañas
        controlsContainer.querySelectorAll('.btn-role-tab').forEach((tabBtn) => {
          tabBtn.addEventListener('click', () => {
            currentRoleFilter = tabBtn.getAttribute('data-role');
            store.state.filters.userRole = currentRoleFilter;
            renderList();
          });
        });

        // Evento Buscador manteniendo cursor
        const searchInput = controlsContainer.querySelector('#users-search-input');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            renderList();
            const reInput = container.querySelector('#users-search-input');
            if (reInput) {
              reInput.focus();
              try { reInput.setSelectionRange(start, end); } catch (_) {}
            }
          });
        }

        const clearBtn = controlsContainer.querySelector('#btn-clear-users-search');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            searchTerm = '';
            renderList();
          });
        }
      }

      const bodyContainer = container.querySelector('#users-table-container');
      if (!bodyContainer) return;

      if (totalVisibleUsers === 0) {
        bodyContainer.innerHTML = '';
        bodyContainer.appendChild(
          EmptyState({
            icon: Icons.users('', 38),
            title: term ? `Sin resultados para "${searchTerm}"` : 'No hay usuarios en este segmento',
            description: term
              ? 'Verifica la ortografía o intenta buscar con otro término en el directorio.'
              : 'No se encontraron registros activos en la categoría seleccionada.',
            actionText: term ? 'Limpiar Búsqueda' : '+ Registrar Usuario',
            onAction: term ? () => { searchTerm = ''; renderList(); } : () => this.openUserModal(),
          })
        );
        return;
      }

      // Renderizar los contenedores de roles ya desplegados
      bodyContainer.innerHTML = `
        <div class="user-role-sections" style="display:flex; flex-direction:column; gap:1.5rem;">
          ${visibleSections.map((section) => {
            if (section.users.length === 0 && term) return '';

            return `
              <div class="card role-user-card" style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.03); border-left:5px solid ${section.borderColor}; margin-bottom:0;">
                <!-- Cabecera del Contenedor de Rol -->
                <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:0.85rem 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
                  <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="width:36px; height:36px; border-radius:8px; background:${section.iconBg}; color:${section.iconColor}; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0;">
                      ${section.icon}
                    </div>
                    <div>
                      <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <h3 style="margin:0; font-size:1.02rem; font-weight:700; color:#002855;">${section.title}</h3>
                        <span class="badge" style="background:${section.badgeBg}; color:${section.badgeColor}; font-weight:700; font-size:0.72rem;">${section.badgeLabel}</span>
                      </div>
                      <span style="font-size:0.76rem; color:#64748b;">${section.subtitle}</span>
                    </div>
                  </div>
                  <div>
                    <span class="badge badge-info" style="font-size:0.75rem;">👥 ${section.users.length} ${section.users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}</span>
                  </div>
                </div>

                <!-- Tabla de Usuarios de este Rol -->
                <div class="table-responsive" style="margin:0;">
                  <table class="table" style="margin-bottom:0;">
                    <thead>
                      <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
                        <th style="font-size:0.8rem; padding:0.8rem 1rem;">Usuario / Titular</th>
                        <th style="font-size:0.8rem; padding:0.8rem 1rem;">Correo Institucional</th>
                        <th style="font-size:0.8rem; padding:0.8rem 1rem;">Fecha de Registro</th>
                        <th class="text-right" style="font-size:0.8rem; padding:0.8rem 1rem;">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${section.users.map((u) => {
                        const initials = (u.name || 'U')
                          .split(' ')
                          .filter(Boolean)
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        const isStud = u.role === 'student';
                        const isTut = u.role === 'tutor';
                        const avatarBg = isStud ? '#e0f2fe' : (isTut ? '#fef3c7' : '#fee2e2');
                        const avatarColor = isStud ? '#0284c7' : (isTut ? '#b45309' : '#b91c1c');
                        const avatarBorder = isStud ? '#bae6fd' : (isTut ? '#fde68a' : '#fecaca');
                        const roleDesc = isStud ? '🎓 Matrícula Estudiantil' : (isTut ? '👨‍🏫 Docente Titular UPDS' : '🛡️ Administración del Sistema');

                        return `
                          <tr>
                            <td style="padding:0.8rem 1rem;">
                              <div style="display:flex; align-items:center; gap:0.75rem;">
                                <div style="width:34px; height:34px; border-radius:50%; background:${avatarBg}; color:${avatarColor}; border:1px solid ${avatarBorder}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.78rem; flex-shrink:0;">
                                  ${initials}
                                </div>
                                <div>
                                  <div class="font-semibold" style="color:var(--primary-navy); font-size:0.91rem;">${u.name}</div>
                                  <small style="color:#64748b; font-size:0.73rem;">${roleDesc}</small>
                                </div>
                              </div>
                            </td>
                            <td style="padding:0.8rem 1rem; font-size:0.84rem; color:#475569;">
                              <code>${u.email}</code>
                            </td>
                            <td style="padding:0.8rem 1rem; font-size:0.82rem; color:#64748b;">
                              ${Badge.formatDate(u.createdAt)}
                            </td>
                            <td class="text-right" style="padding:0.8rem 1rem;">
                              <div style="display:inline-flex; align-items:center; gap:0.35rem; justify-content:flex-end;">
                                <button class="btn btn-xs btn-outline btn-edit-user" data-id="${u.id}" title="Editar información del usuario" style="display:inline-flex; align-items:center; gap:0.25rem; font-weight:600; color:#0369a1; border-color:#bae6fd; background:#f0f9ff;">
                                  ${Icons.edit('', 12)} <span>Editar</span>
                                </button>
                                <button class="btn btn-xs btn-danger-outline btn-delete-user" data-id="${u.id}" title="Eliminar cuenta y registros asociados" style="display:inline-flex; align-items:center; gap:0.25rem; font-weight:600; color:#dc2626; border-color:#fca5a5; background:#fef2f2;">
                                  ${Icons.trash('', 12)} <span>Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Eventos de Paginación
      Pagination.bindEvents(bodyContainer, (newPage) => {
        currentPage = newPage;
        renderList();
      });

      // Eventos de Editar y Eliminar
      bodyContainer.querySelectorAll('.btn-edit-user').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const user = (store.getState().users || []).find((u) => u.id === id);
          if (user) this.openUserModal(user);
        });
      });

      bodyContainer.querySelectorAll('.btn-delete-user').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const user = (store.getState().users || []).find((u) => u.id === id);
          if (user) this.confirmDelete(user);
        });
      });
    };

    // Si aún no se cargaron usuarios en el Store, solicitarlos a la API REST
    if (!store.getState().users || store.getState().users.length === 0) {
      api.users.getAll().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          store.setUsers(data);
          renderList();
        }
      }).catch((err) => console.warn('[UsersView load warning]:', err));
    }

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Directorio de Usuarios</h2>
          <p class="view-subtitle">Administra los estudiantes, tutores docentes y personal administrativo registrados.</p>
        </div>
        <div class="view-actions">
          <button id="btn-create-user" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.35rem;">
            ${Icons.user ? Icons.user('', 14) : ''} <span>+ Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div id="users-controls-container"></div>
      <div id="users-table-container"></div>
    `;

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
            <input type="text" id="user-name-input" class="form-control" value="${user?.name || ''}" placeholder="Ej. Carlos Mendoza" maxlength="60" required />
            <small class="form-help">Mínimo 2 caracteres, máximo 60.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-email-input">Correo Electrónico Institucional *</label>
            <input type="email" id="user-email-input" class="form-control" value="${user?.email || ''}" placeholder="carlos@upds.edu.bo" maxlength="80" required ${isEdit ? 'readonly style="background:#f1f5f9;"' : ''} />
            <small class="form-help">${isEdit ? 'El correo no se puede modificar.' : 'Debe ser único en el sistema (máx. 80 caracteres).'}</small>
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
            <input type="password" id="user-password-input" class="form-control" maxlength="40" placeholder="${isEdit ? 'Dejar en blanco para conservar actual' : 'Por defecto: Upds2026'}" />
            <small class="form-help">${isEdit ? 'Solo escribe si deseas restablecer la contraseña (mínimo 6 caracteres, máx. 40).' : 'Si se deja vacío, la clave inicial será <code>Upds2026</code>.'}</small>
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
