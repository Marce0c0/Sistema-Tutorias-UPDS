// Componente de Insignias y Etiquetas de Estado — Sistema-Tutoriales-UPDS

export const Badge = {
  role(role) {
    const roles = {
      student: { label: 'Estudiante', cls: 'badge-student' },
      tutor: { label: 'Docente', cls: 'badge-tutor' },
      admin: { label: 'Administrador', cls: 'badge-admin' },
    };
    const r = roles[role] || { label: role || 'Desconocido', cls: 'badge-neutral' };
    return `<span class="badge ${r.cls}">${r.label}</span>`;
  },

  bookingStatus(status, receiptUrl = null) {
    if (status === 'cancelled') {
      const isByAdmin = receiptUrl && typeof receiptUrl === 'string' && receiptUrl.includes('deleted_by_admin');
      if (isByAdmin) {
        return '<span class="badge badge-danger" title="Anulado por Administración UPDS">Eliminado por el Administrador</span>';
      }
      return '<span class="badge badge-danger">Cancelada</span>';
    }
    const statuses = {
      pending: { label: 'En espera de verificación', cls: 'badge-warning' },
      confirmed: { label: 'Confirmada / Activa', cls: 'badge-success' },
      cancelled: { label: 'Cancelada', cls: 'badge-danger' },
    };
    const s = statuses[status] || { label: status, cls: 'badge-neutral' };
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  },

  tutoriaStatus(status) {
    const statuses = {
      active: { label: 'Activa', cls: 'badge-success' },
      completed: { label: 'Completada', cls: 'badge-info' },
      cancelled: { label: 'Cancelada', cls: 'badge-danger' },
    };
    const s = statuses[status] || { label: status, cls: 'badge-neutral' };
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  },

  category(cat) {
    return `<span class="badge badge-info" style="font-size:0.75rem; text-transform:capitalize;">${cat || 'Académico'}</span>`;
  },

  notificationType(type) {
    const types = {
      info: { label: 'Aviso', cls: 'badge-info' },
      reminder: { label: 'Recordatorio', cls: 'badge-warning' },
      booking_update: { label: 'Reserva', cls: 'badge-success' },
      forum_reply: { label: 'Foro', cls: 'badge-student' },
    };
    const t = types[type] || { label: type, cls: 'badge-neutral' };
    return `<span class="badge ${t.cls}">${t.label}</span>`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  },

  getNowBoliviaString() {
    const d = new Date();
    return d.toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  },

  toBoliviaDateTimeLocal(dateInput) {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(d);
      const p = {};
      parts.forEach(({ type, value }) => { p[type] = value; });
      return `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
    } catch {
      return '';
    }
  },

  parseBoliviaDateTime(localVal) {
    if (!localVal) return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localVal)) {
      return new Date(`${localVal}:00-04:00`).toISOString();
    }
    return new Date(localVal).toISOString();
  },
};
