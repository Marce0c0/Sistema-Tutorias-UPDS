// Utilidades de Validación Frontend — Sistema-Tutoriales-UPDS
// Valida los datos antes de enviar al backend, replicando las reglas de validación del servidor

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VALID_ROLES = ['student', 'tutor', 'admin'];
export const VALID_BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];
export const VALID_TUTORIA_STATUSES = ['active', 'completed', 'cancelled'];
export const VALID_NOTIFICATION_TYPES = ['info', 'reminder', 'booking_update', 'forum_reply'];

export const Validators = {
  isValidUuid(id) {
    return Boolean(id && UUID_REGEX.test(id));
  },

  isValidEmail(email) {
    return Boolean(email && EMAIL_REGEX.test(email));
  },

  validateUser(data) {
    const errors = [];
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
    }
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('El correo electrónico debe tener un formato válido (ej: usuario@upds.edu.bo).');
    }
    if (!data.role || !VALID_ROLES.includes(data.role)) {
      errors.push(`El rol debe ser uno de: ${VALID_ROLES.join(', ')}.`);
    }
    return { isValid: errors.length === 0, errors };
  },

  validateCourse(data) {
    const errors = [];
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('El título de la materia es obligatorio y debe tener al menos 3 caracteres.');
    }
    if (data.tutorId && !this.isValidUuid(data.tutorId)) {
      errors.push('El tutor seleccionado debe ser un identificador válido.');
    }
    return { isValid: errors.length === 0, errors };
  },

  validateTutoria(data) {
    const errors = [];
    if (!data.courseId || !this.isValidUuid(data.courseId)) {
      errors.push('Debe seleccionar una materia válida.');
    }
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('El tema o título de la tutoría debe tener al menos 3 caracteres.');
    }
    if (!data.date || isNaN(new Date(data.date).getTime())) {
      errors.push('Debe especificar una fecha y hora válida.');
    }
    const max = Number(data.maxStudents);
    if (!max || isNaN(max) || max <= 0) {
      errors.push('El cupo máximo debe ser un número entero mayor a cero.');
    }
    if (data.status && !VALID_TUTORIA_STATUSES.includes(data.status)) {
      errors.push(`El estado debe ser: ${VALID_TUTORIA_STATUSES.join(', ')}.`);
    }
    return { isValid: errors.length === 0, errors };
  },

  validateBooking(data) {
    const errors = [];
    if (!data.studentId || !this.isValidUuid(data.studentId)) {
      errors.push('Debe seleccionar un estudiante registrado.');
    }
    if (!data.courseId || !this.isValidUuid(data.courseId)) {
      errors.push('Debe seleccionar la materia para la reserva.');
    }
    if (!data.scheduledAt || isNaN(new Date(data.scheduledAt).getTime())) {
      errors.push('Debe definir una fecha de reserva válida.');
    }
    return { isValid: errors.length === 0, errors };
  },

  validateForumMessage(data) {
    const errors = [];
    if (!data.courseId || !this.isValidUuid(data.courseId)) {
      errors.push('Debe seleccionar el curso al cual pertenece la consulta.');
    }
    if (!data.userId || !this.isValidUuid(data.userId)) {
      errors.push('Debe seleccionar el autor de la pregunta.');
    }
    if (!data.title || data.title.trim().length < 3) {
      errors.push('El título de la consulta debe tener al menos 3 caracteres.');
    }
    if (!data.content || data.content.trim().length < 5) {
      errors.push('El contenido de la consulta debe ser descriptivo (mínimo 5 caracteres).');
    }
    return { isValid: errors.length === 0, errors };
  },

  validateNotification(data) {
    const errors = [];
    if (!data.userId || !this.isValidUuid(data.userId)) {
      errors.push('Debe seleccionar el usuario destinatario.');
    }
    if (!data.title || data.title.trim().length < 2) {
      errors.push('El título de la alerta es obligatorio.');
    }
    if (!data.message || data.message.trim().length < 3) {
      errors.push('El cuerpo de la notificación es obligatorio.');
    }
    if (data.type && !VALID_NOTIFICATION_TYPES.includes(data.type)) {
      errors.push(`El tipo debe ser: ${VALID_NOTIFICATION_TYPES.join(', ')}.`);
    }
    return { isValid: errors.length === 0, errors };
  },
};
