// Middleware de validación de datos de entrada
// Se usa antes de los controladores para asegurar que los datos sean correctos

import { Request, Response, NextFunction } from 'express';

const VALID_ROLES = ['student', 'tutor', 'admin'];
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

// ─── Validar Usuario ────────────────────────────────────────────────────────
export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    res.status(400).json({ message: 'Los campos name, email y role son obligatorios.' });
    return;
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ message: 'El campo name debe tener al menos 2 caracteres.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'El campo email no tiene un formato válido.' });
    return;
  }

  if (!VALID_ROLES.includes(role)) {
    res.status(400).json({
      message: `El rol '${role}' no es válido. Debe ser uno de: ${VALID_ROLES.join(', ')}.`,
    });
    return;
  }

  next();
};

// ─── Validar Curso ──────────────────────────────────────────────────────────
export const validateCourse = (req: Request, res: Response, next: NextFunction): void => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    res.status(400).json({ message: 'El campo title es obligatorio y debe tener al menos 3 caracteres.' });
    return;
  }

  next();
};

// ─── Validar Reserva ────────────────────────────────────────────────────────
export const validateBooking = (req: Request, res: Response, next: NextFunction): void => {
  const { studentId, courseId, scheduledAt } = req.body;

  if (!studentId || !courseId || !scheduledAt) {
    res.status(400).json({ message: 'Los campos studentId, courseId y scheduledAt son obligatorios.' });
    return;
  }

  const date = new Date(scheduledAt);
  if (isNaN(date.getTime())) {
    res.status(400).json({ message: 'scheduledAt debe ser una fecha válida (ej: 2026-10-20T10:00:00Z).' });
    return;
  }

  if (date < new Date()) {
    res.status(400).json({ message: 'No puedes reservar una tutoría en una fecha pasada.' });
    return;
  }

  next();
};

// ─── Validar Actualización de Estado de Reserva ─────────────────────────────
export const validateBookingStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ message: 'El campo status es obligatorio.' });
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({
      message: `El estado '${status}' no es válido. Debe ser: ${VALID_STATUSES.join(', ')}.`,
    });
    return;
  }

  next();
};
