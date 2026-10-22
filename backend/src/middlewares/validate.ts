// Middleware de validación de datos de entrada
// Garantiza la integridad de datos antes de procesarlos en la base de datos

import { Request, Response, NextFunction } from 'express';

const VALID_ROLES = ['student', 'tutor', 'admin'];
const VALID_BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];
const VALID_TUTORIA_STATUSES = ['active', 'completed', 'cancelled'];
const VALID_NOTIFICATION_TYPES = ['info', 'reminder', 'booking_update', 'forum_reply'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Validar ID de Parámetros (:id) ─────────────────────────────────────────
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id;
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    res.status(400).json({
      success: false,
      message: 'El identificador proporcionado en la ruta no tiene un formato UUID válido.',
    });
    return;
  }
  next();
};

// ─── Validar Usuario (Creación) ──────────────────────────────────────────────
export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    res.status(400).json({ success: false, message: 'Los campos name, email y role son obligatorios.' });
    return;
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ success: false, message: 'El campo name debe tener al menos 2 caracteres.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'El campo email no tiene un formato válido.' });
    return;
  }

  if (!VALID_ROLES.includes(role)) {
    res.status(400).json({
      success: false,
      message: `El rol '${role}' no es válido. Debe ser uno de: ${VALID_ROLES.join(', ')}.`,
    });
    return;
  }

  next();
};

// ─── Validar Usuario (Actualización) ────────────────────────────────────────
export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, role } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({ success: false, message: 'El campo name debe tener al menos 2 caracteres.' });
    return;
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'El campo email no tiene un formato válido.' });
      return;
    }
  }

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    res.status(400).json({
      success: false,
      message: `El rol '${role}' no es válido. Debe ser uno de: ${VALID_ROLES.join(', ')}.`,
    });
    return;
  }

  next();
};

// ─── Validar Curso (Creación) ────────────────────────────────────────────────
export const validateCourse = (req: Request, res: Response, next: NextFunction): void => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    res.status(400).json({ success: false, message: 'El campo title es obligatorio y debe tener al menos 3 caracteres.' });
    return;
  }

  next();
};

// ─── Validar Curso (Actualización) ──────────────────────────────────────────
export const validateCourseUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, tutorId } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    res.status(400).json({ success: false, message: 'El campo title debe tener al menos 3 caracteres.' });
    return;
  }

  if (tutorId !== undefined && tutorId !== null && !UUID_REGEX.test(tutorId)) {
    res.status(400).json({ success: false, message: 'tutorId debe ser un UUID válido o null.' });
    return;
  }

  next();
};

// ─── Validar Tutoría (Creación) ──────────────────────────────────────────────
export const validateTutoria = (req: Request, res: Response, next: NextFunction): void => {
  const { courseId, title, date, maxStudents } = req.body;

  if (!courseId || !title || !date) {
    res.status(400).json({ success: false, message: 'courseId, title y date son campos obligatorios.' });
    return;
  }

  if (!UUID_REGEX.test(courseId)) {
    res.status(400).json({ success: false, message: 'courseId debe ser un UUID válido.' });
    return;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    res.status(400).json({ success: false, message: 'date debe ser una fecha y hora válida.' });
    return;
  }

  if (maxStudents !== undefined && (typeof maxStudents !== 'number' || maxStudents <= 0)) {
    res.status(400).json({ success: false, message: 'maxStudents debe ser un número entero positivo.' });
    return;
  }

  next();
};

// ─── Validar Reserva (Creación) ──────────────────────────────────────────────
export const validateBooking = (req: Request, res: Response, next: NextFunction): void => {
  const { studentId, courseId, scheduledAt, tutoriaId } = req.body;

  if (!studentId || !courseId || !scheduledAt) {
    res.status(400).json({ success: false, message: 'studentId, courseId y scheduledAt son obligatorios.' });
    return;
  }

  if (!UUID_REGEX.test(studentId) || !UUID_REGEX.test(courseId)) {
    res.status(400).json({ success: false, message: 'studentId y courseId deben ser UUIDs válidos.' });
    return;
  }

  if (tutoriaId && !UUID_REGEX.test(tutoriaId)) {
    res.status(400).json({ success: false, message: 'tutoriaId debe ser un UUID válido.' });
    return;
  }

  const date = new Date(scheduledAt);
  if (isNaN(date.getTime())) {
    res.status(400).json({ success: false, message: 'scheduledAt debe ser una fecha válida (ej: 2026-10-20T10:00:00Z).' });
    return;
  }

  next();
};

// ─── Validar Estado de Reserva ──────────────────────────────────────────────
export const validateBookingStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, message: 'El campo status es obligatorio.' });
    return;
  }

  if (!VALID_BOOKING_STATUSES.includes(status)) {
    res.status(400).json({
      success: false,
      message: `El estado '${status}' no es válido. Debe ser: ${VALID_BOOKING_STATUSES.join(', ')}.`,
    });
    return;
  }

  next();
};

// ─── Validar Mensaje de Foro ────────────────────────────────────────────────
export const validateForumMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { courseId, userId, title, content } = req.body;

  if (!courseId || !userId || !title || !content) {
    res.status(400).json({ success: false, message: 'courseId, userId, title y content son obligatorios.' });
    return;
  }

  if (!UUID_REGEX.test(courseId) || !UUID_REGEX.test(userId)) {
    res.status(400).json({ success: false, message: 'courseId y userId deben ser UUIDs válidos.' });
    return;
  }

  next();
};

// ─── Validar Notificación ───────────────────────────────────────────────────
export const validateNotification = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, title, message, type } = req.body;

  if (!userId || !title || !message) {
    res.status(400).json({ success: false, message: 'userId, title y message son obligatorios.' });
    return;
  }

  if (!UUID_REGEX.test(userId)) {
    res.status(400).json({ success: false, message: 'userId debe ser un UUID válido.' });
    return;
  }

  if (type !== undefined && !VALID_NOTIFICATION_TYPES.includes(type)) {
    res.status(400).json({
      success: false,
      message: `El tipo '${type}' no es válido. Debe ser uno de: ${VALID_NOTIFICATION_TYPES.join(', ')}.`,
    });
    return;
  }

  next();
};
