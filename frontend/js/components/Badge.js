// Componente de Insignias y Etiquetas de Estado — Sistema-Tutoriales-UPDS

export const Badge = {
  role(role) {
    const roles = {
      student: { label: 'Estudiante', cls: 'badge-student' },
      tutor: { label: 'Tutor', cls: 'badge-tutor' },
      admin: { label: 'Administrador', cls: 'badge-admin' },
    };
    const r = roles[role] || { label: role || 'Desconocido', cls: 'badge-neutral' };
    return `<span class="badge ${r.cls}">${r.label}</span>`;
  },

  bookingStatus(status) {
    const statuses = {
      pending: { label: 'Pendiente', cls: 'badge-warning' },
      confirmed: { label: 'Confirmada', cls: 'badge-success' },
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
};
