// Vista de la Bandeja de Notificaciones — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { EmptyState } from '../components/EmptyState.js';
import { Icons } from '../components/Icons.js';
import { TicketModal } from '../components/TicketModal.js';
import { Skeleton } from '../components/Skeleton.js';
import { Navbar } from '../components/Navbar.js';

export const NotificationsView = {
  _activeFilter: 'all', // 'all' | 'unread' | 'read'
  _renderList: null,
  _hasFetchedInitially: false,

  getDeepLinkInfo(n, activeUser) {
    const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    const isStudent = activeUser?.role === 'student';

    if (
      n.type === 'booking_update' ||
      text.includes('inscripción') ||
      text.includes('entrada') ||
      text.includes('comprobante') ||
      text.includes('cupo liberado')
    ) {
      return {
        label: isStudent ? `${Icons.ticket('', 13)} Ver mi Entrada QR` : `${Icons.search('', 13)} Revisar en Entradas`,
        view: 'bookings',
        color: '#059669',
      };
    }

    if (
      n.type === 'forum_reply' ||
      text.includes('foro') ||
      text.includes('duda') ||
      text.includes('debate') ||
      text.includes('respuesta')
    ) {
      return {
        label: `${Icons.chat('', 13)} Ir al Foro de Consultas`,
        view: 'forums',
        color: '#7c3aed',
      };
    }

    if (text.includes('convocatoria') || text.includes('hackathon') || text.includes('reto')) {
      return {
        label: `${Icons.trophy('', 13)} Ver Convocatoria`,
        view: 'events',
        color: '#d97706',
      };
    }

    if (text.includes('curso') || text.includes('taller') || text.includes('bootcamp')) {
      return {
        label: `${Icons.book('', 13)} Explorar Cursos & Talleres`,
        view: 'courses',
        color: '#004b93',
      };
    }

    return {
      label: `${Icons.arrowRight('', 13)} Ver Detalles`,
      view: 'dashboard',
      color: '#475569',
    };
  },

  handleDeepLink(n) {
    const state = store.getState();
    const activeUser = state.activeUser;
    const linkInfo = this.getDeepLinkInfo(n, activeUser);

    // Si aún no está leída, marcarla inmediatamente
    if (!n.isRead) {
      this.toggleRead(n.id, true, false);
    }

    // Navegación contextual directa
    store.setView(linkInfo.view);

    // Si es estudiante y la notificación es sobre una entrada confirmada, abrir el ticket de una vez
    if (linkInfo.view === 'bookings' && activeUser?.role === 'student') {
      setTimeout(() => {
        const bookings = store.getState().bookings || [];
        const myBookings = bookings.filter((b) => b.studentId === activeUser.id && b.status !== 'cancelled');
        const targetBooking = myBookings[0] || bookings[0];
        if (targetBooking) {
          const courses = store.getState().courses || [];
          const tutorias = store.getState().tutorias || [];
          const course = courses.find((c) => c.id === targetBooking.courseId) || targetBooking.course;
          const tutoria = tutorias.find((t) => t.id === targetBooking.tutoriaId) || targetBooking.tutoria;
          TicketModal.open(targetBooking, course, tutoria, activeUser);
        }
      }, 180);
    }
  },

  render() {
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const renderNotifications = () => {
      const currentState = store.getState();
      const activeUser = currentState.activeUser;
      // Notificaciones personales del usuario autenticado
      const userNotifications = (currentState.notifications || []).filter(
        (n) => (n.userId || n.user_id) === activeUser?.id
      );

      const unreadCount = userNotifications.filter((n) => !Boolean(n.isRead ?? n.is_read)).length;
      const readCount = userNotifications.filter((n) => Boolean(n.isRead ?? n.is_read)).length;
      const allCount = userNotifications.length;

      // Filtrar según la pestaña activa
      let displayedList = userNotifications;
      if (this._activeFilter === 'unread') {
        displayedList = userNotifications.filter((n) => !Boolean(n.isRead ?? n.is_read));
      } else if (this._activeFilter === 'read') {
        displayedList = userNotifications.filter((n) => Boolean(n.isRead ?? n.is_read));
      }

      const toolbarContainer = container.querySelector('#notifications-toolbar-mount');
      const listContainer = container.querySelector('#notifications-list-container');
      if (!listContainer || !toolbarContainer) return;

      // Renderizar Toolbar de Filtros y Acciones
      toolbarContainer.innerHTML = `
        <div class="notifications-toolbar">
          <div class="notifications-tabs">
            <button type="button" class="notif-tab-btn ${this._activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              ${Icons.inbox('', 14)} <span>Todas</span> <span class="notif-pill">${allCount}</span>
            </button>
            <button type="button" class="notif-tab-btn ${this._activeFilter === 'unread' ? 'active' : ''}" data-filter="unread">
              ${Icons.bell('', 14)} <span>No leídas</span> ${unreadCount > 0 ? `<span class="notif-pill notif-pill-unread">${unreadCount}</span>` : `<span class="notif-pill">0</span>`}
            </button>
            <button type="button" class="notif-tab-btn ${this._activeFilter === 'read' ? 'active' : ''}" data-filter="read">
              ${Icons.check('', 14)} <span>Leídas</span> <span class="notif-pill">${readCount}</span>
            </button>
          </div>
          <div class="notifications-bulk-actions">
            <button type="button" id="btn-mark-all-read" class="btn btn-xs btn-outline" ${unreadCount === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} title="Marcar todas como leídas">
              ${Icons.check('', 13)} <span>Marcar todas leídas</span>
            </button>
            ${readCount > 0 ? `
              <button type="button" id="btn-clear-read" class="btn btn-xs btn-outline text-muted" title="Limpiar avisos leídos">
                ${Icons.trash('', 12)} <span>Limpiar leídas</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;

      // Enlazar Eventos de Tabs
      toolbarContainer.querySelectorAll('.notif-tab-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this._activeFilter = btn.getAttribute('data-filter') || 'all';
          renderNotifications();
        });
      });

      // Enlazar Marcar Todas Leídas
      toolbarContainer.querySelector('#btn-mark-all-read')?.addEventListener('click', () => {
        this.markAllAsRead();
      });

      // Enlazar Limpiar Leídas
      toolbarContainer.querySelector('#btn-clear-read')?.addEventListener('click', () => {
        this.clearReadNotifications();
      });

      // Si aún no hay datos y es la primera consulta sin caché, mostrar Skeleton en 0 ms
      if (userNotifications.length === 0 && !this._hasFetchedInitially) {
        listContainer.innerHTML = Skeleton.renderNotifications();
        return;
      }

      // Renderizar Lista o Empty State
      if (displayedList.length === 0) {
        let emptyTitle = 'No tienes notificaciones pendientes';
        let emptyDesc = 'Todas tus alertas, comprobantes y avisos de debate están al día.';
        if (this._activeFilter === 'unread') {
          emptyTitle = '¡Estás al día!';
          emptyDesc = 'No tienes ninguna notificación pendiente de leer en este momento.';
        } else if (this._activeFilter === 'read') {
          emptyTitle = 'Sin notificaciones leídas';
          emptyDesc = 'Las notificaciones que marques como leídas se archivarán en esta pestaña.';
        }

        listContainer.innerHTML = '';
        listContainer.appendChild(
          EmptyState({
            icon: Icons.bell('', 36),
            title: emptyTitle,
            description: emptyDesc,
          })
        );
        return;
      }

      listContainer.innerHTML = `
        <div class="notifications-feed">
          ${displayedList.map((n) => {
            const deepLink = this.getDeepLinkInfo(n, activeUser);
            const isRead = Boolean(n.isRead ?? n.is_read);
            return `
            <div class="card notification-card ${isRead ? 'notification-read' : 'notification-unread'}" data-id="${n.id}" style="cursor:pointer; margin-bottom:0.75rem;">
              <div class="notification-type-stripe type-${n.type || 'info'}"></div>
              <div class="notification-body">
                <div class="notification-header">
                  <div class="notification-meta">
                    ${Badge.notificationType(n.type)}
                    <span class="notification-date">· ${Badge.formatDate(n.createdAt)}</span>
                  </div>
                  <div class="notification-actions">
                    <button type="button" class="btn btn-xs ${isRead ? 'btn-outline' : 'btn-primary-outline'} btn-toggle-read" data-id="${n.id}" data-read="${isRead}" style="display:inline-flex; align-items:center; gap:0.25rem;">
                      ${isRead ? `${Icons.undo('', 12)} <span>No leída</span>` : `${Icons.check('', 12)} <span>Marcar leída</span>`}
                    </button>
                    <button type="button" class="btn btn-xs btn-danger-outline btn-delete-notification" data-id="${n.id}" title="Eliminar aviso" style="display:inline-flex; align-items:center; justify-content:center;">${Icons.trash('', 12)}</button>
                  </div>
                </div>
                <h4 class="notification-title">${n.title}</h4>
                <p class="notification-msg">${n.message}</p>
                <div class="notification-footer">
                  <span class="notification-nav-hint" style="color:${deepLink.color}">
                    ${deepLink.label} ${Icons.arrowRight('', 11)}
                  </span>
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      `;

      // Enlazar clics y botones directamente
      this.bindCardInteractions(listContainer, displayedList);
    };

    this._renderList = renderNotifications;

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">Bandeja de Notificaciones y Alertas</h2>
          <p class="view-subtitle">Avisos automáticos, confirmaciones de reserva, alertas de pago y respuestas del foro dirigidas a tu cuenta.</p>
        </div>
      </div>
      <div id="notifications-toolbar-mount"></div>
      <div id="notifications-list-container"></div>
    `;

    // Consultar una sola vez al montar si aún no se ha cargado inicialmente
    const state = store.getState();
    if (!this._hasFetchedInitially && state.activeUser && state.activeUser.role !== 'guest') {
      this._hasFetchedInitially = true;
      api.notifications.getAll(state.activeUser.id).then((data) => {
        if (Array.isArray(data)) {
          store.setNotifications(data);
          if (this._renderList) this._renderList();
        }
      }).catch((err) => {
        console.warn('[NotificationsView load warn]:', err);
      });
    }

    renderNotifications();
    return container;
  },

  // Manejador de clics limpios y directos (sin swipe conflictivo)
  bindCardInteractions(listContainer, notifications) {
    listContainer.querySelectorAll('.notification-card').forEach((card) => {
      const notifId = card.getAttribute('data-id');
      const notif = notifications.find((n) => n.id === notifId);

      // Botón "Marcar leída / No leída" individual
      card.querySelector('.btn-toggle-read')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const currentRead = Boolean(notif?.isRead ?? notif?.is_read);
        this.toggleRead(notifId, !currentRead);
      });

      // Botón "Eliminar" individual
      card.querySelector('.btn-delete-notification')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (notif) this.confirmDelete(notif);
      });

      // Clic directo en la tarjeta para activar Deep Linking hacia el destino
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.notification-actions')) {
          return;
        }
        if (notif) this.handleDeepLink(notif);
      });
    });
  },

  // 1. Marcar como Leída / No leída con actualización optimista instantánea (0 ms)
  async toggleRead(id, newReadStatus, showToast = true) {
    const currentNotifs = store.getState().notifications || [];
    const updatedLocal = currentNotifs.map((n) => (n.id === id ? { ...n, isRead: newReadStatus, is_read: newReadStatus } : n));

    // Inmediato en memoria: actualiza el store y el Navbar
    store.setNotifications(updatedLocal);
    // Refrescar sincronamente las pestañas con sus números y la lista
    if (this._renderList) this._renderList();
    Navbar.updateBadge?.();

    if (showToast) {
      Toast.success(newReadStatus ? 'Notificación marcada como leída.' : 'Notificación marcada como no leída.');
    }

    // Persistir en backend sin bloquear la interfaz
    try {
      await api.notifications.update(id, { isRead: newReadStatus });
    } catch (err) {
      console.warn('[Error persistiendo estado de lectura]:', err);
      // Revertir en memoria si la red falla
      const rollbacked = store.getState().notifications.map((n) => (n.id === id ? { ...n, isRead: !newReadStatus, is_read: !newReadStatus } : n));
      store.setNotifications(rollbacked);
      if (this._renderList) this._renderList();
      Navbar.updateBadge?.();
      Toast.error('No se pudo sincronizar con el servidor.');
    }
  },

  // 2. Marcar Todas como Leídas en 1 solo clic (Limpia el badge de la campana a 0 de golpe)
  async markAllAsRead() {
    const state = store.getState();
    const activeUserId = state.activeUser?.id;
    const currentNotifs = state.notifications || [];
    const unread = currentNotifs.filter((n) => !Boolean(n.isRead ?? n.is_read) && (n.userId || n.user_id) === activeUserId);

    if (unread.length === 0) {
      Toast.info('No tienes notificaciones pendientes por leer.');
      return;
    }

    // Actualización optimista de golpe: badge a 0 de inmediato
    const updatedLocal = currentNotifs.map((n) => ((n.userId || n.user_id) === activeUserId ? { ...n, isRead: true, is_read: true } : n));
    store.setNotifications(updatedLocal);
    if (this._renderList) this._renderList();
    Navbar.updateBadge?.();
    Toast.success(`Se marcaron ${unread.length} notificaciones como leídas.`);

    // Persistir concurrentemente en el backend
    try {
      await Promise.all(unread.map((n) => api.notifications.update(n.id, { isRead: true }).catch(() => {})));
    } catch (err) {
      console.warn('[Error persistiendo marcar todas como leídas]:', err);
    }
  },

  // 3. Limpiar Notificaciones Leídas
  clearReadNotifications() {
    const state = store.getState();
    const activeUserId = state.activeUser?.id;
    const currentNotifs = state.notifications || [];
    const readOnes = currentNotifs.filter((n) => Boolean(n.isRead ?? n.is_read) && (n.userId || n.user_id) === activeUserId);

    if (readOnes.length === 0) {
      Toast.info('No hay notificaciones leídas para eliminar.');
      return;
    }

    Modal.confirm({
      title: '¿Limpiar avisos leídos?',
      message: `¿Deseas eliminar las <strong>${readOnes.length}</strong> notificaciones que ya leíste para despejar tu bandeja?`,
      confirmText: 'Sí, Limpiar',
      onConfirm: async () => {
        // Optimista instantáneo
        const updatedLocal = currentNotifs.filter((n) => !(Boolean(n.isRead ?? n.is_read) && (n.userId || n.user_id) === activeUserId));
        store.setNotifications(updatedLocal);
        if (this._renderList) this._renderList();
        Navbar.updateBadge?.();
        Toast.success('Avisos leídos despejados.');

        // Backend
        await Promise.all(readOnes.map((n) => api.notifications.delete(n.id).catch(() => {})));
      },
    });
  },

  // 4. Eliminar Notificación Individual
  confirmDelete(notification) {
    Modal.confirm({
      title: '¿Eliminar Notificación?',
      message: `¿Estás seguro de eliminar el aviso "<strong>${notification.title}</strong>"?`,
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        try {
          // Eliminación optimista inmediata en memoria
          const currentNotifs = store.getState().notifications || [];
          const updatedLocal = currentNotifs.filter((n) => n.id !== notification.id);
          store.setNotifications(updatedLocal);
          if (this._renderList) this._renderList();
          Navbar.updateBadge?.();
          Toast.success('Notificación eliminada de tu bandeja.');

          // Persistir en backend
          await api.notifications.delete(notification.id);
          return true;
        } catch (err) {
          Toast.error(err.message || 'Error al eliminar notificación');
          const refreshed = await api.notifications.getAll(store.getState().activeUser?.id).catch(() => null);
          if (refreshed) {
            store.setNotifications(refreshed);
            if (this._renderList) this._renderList();
            Navbar.updateBadge?.();
          }
          return false;
        }
      },
    });
  },
};
