// Matriz de permisos por rol — Sistema-Tutoriales-UPDS
// Admin: control total · Tutor: gestiona tutorías, reservas y modera el foro · Estudiante: consulta y reserva · Invitado: solo lectura de catálogo y tutorías

const RULES = {
  // Navegación
  'view.welcome': ['admin', 'tutor', 'student', 'guest'],
  'view.dashboard': ['admin', 'tutor', 'student'],
  'view.courses': ['admin', 'tutor', 'student', 'guest'],
  'view.tutorias': ['admin', 'tutor', 'student', 'guest'],
  'view.events': ['admin', 'tutor', 'student', 'guest'],
  'view.bookings': ['admin', 'student', 'tutor'],
  'view.forums': ['admin', 'tutor', 'student'],
  'view.notifications': ['admin', 'tutor', 'student'],
  'view.users': ['admin'],
  'view.404': ['admin', 'tutor', 'student', 'guest'],

  // Usuarios
  'users.manage': ['admin'],

  // Cursos
  'courses.manage': ['admin', 'tutor'],
  'courses.create': ['admin', 'tutor'],

  // Eventos y Hackathons
  'events.manage': ['admin'],

  // Tutorías
  'tutorias.manage': ['admin', 'tutor'],
  'tutorias.book': ['student'],

  // Reservas (Las entradas solo se generan mediante inscripción de estudiantes en Cursos & Talleres)
  'bookings.create': [],
  'bookings.manage': ['admin', 'tutor'],

  // Foro
  'forums.create': ['admin', 'tutor', 'student'],
  'forums.moderate': ['admin', 'tutor'],

  // Notificaciones (100% personales y automáticas para cada rol según eventos)
  'notifications.viewAll': [],
  'notifications.send': [],
};

// Sin rol asignado se asume 'guest' (modo invitado sin privilegios de modificación)
export const can = (role, action) => (RULES[action] || []).includes(role || 'guest');
