// Matriz de permisos por rol — Sistema-Tutoriales-UPDS
// Admin: control total · Tutor: gestiona tutorías, reservas y modera el foro · Estudiante: consulta y reserva · Invitado: solo lectura de catálogo y tutorías

const RULES = {
  // Navegación
  'view.dashboard': ['admin', 'tutor', 'student'],
  'view.courses': ['admin', 'tutor', 'student', 'guest'],
  'view.tutorias': ['admin', 'tutor', 'student', 'guest'],
  'view.events': ['admin', 'tutor', 'student', 'guest'],
  'view.bookings': ['admin', 'tutor', 'student'],
  'view.forums': ['admin', 'tutor', 'student'],
  'view.notifications': ['admin', 'tutor', 'student'],
  'view.users': ['admin'],

  // Usuarios
  'users.manage': ['admin'],

  // Cursos
  'courses.manage': ['admin'],

  // Tutorías
  'tutorias.manage': ['admin', 'tutor'],
  'tutorias.book': ['student'],

  // Reservas
  'bookings.create': ['admin', 'student'],
  'bookings.manage': ['admin', 'tutor'],

  // Foro
  'forums.create': ['admin', 'tutor', 'student'],
  'forums.moderate': ['admin', 'tutor'],

  // Notificaciones
  'notifications.viewAll': ['admin', 'tutor'],
  'notifications.send': ['admin', 'tutor'],
};

// Sin rol asignado se asume 'guest' (modo invitado sin privilegios de modificación)
export const can = (role, action) => (RULES[action] || []).includes(role || 'guest');
