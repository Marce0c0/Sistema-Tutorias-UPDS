// Middleware centralizado de manejo de errores
// Captura todos los errores del servidor y responde de forma uniforme

import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;       // Códigos de error específicos de Prisma
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);

  // ── Errores de Prisma ──────────────────────────────────────────────────────
  // P2002: Valor único duplicado (ej. email ya registrado)
  if (err.code === 'P2002') {
    res.status(409).json({ message: 'Ya existe un registro con ese valor (ej: email duplicado).' });
    return;
  }

  // P2025: Registro no encontrado
  if (err.code === 'P2025') {
    res.status(404).json({ message: 'El recurso solicitado no fue encontrado.' });
    return;
  }

  // P2003: Violación de clave foránea (ej: tutorId no existe)
  if (err.code === 'P2003') {
    res.status(400).json({ message: 'El ID de referencia proporcionado no existe en la base de datos.' });
    return;
  }

  // ── Error Genérico ─────────────────────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Error interno del servidor.' : err.message;

  res.status(statusCode).json({ message });
};
