// Controlador de Notificaciones del Sistema
// Gestiona alertas sobre reservas, respuestas en foros y recordatorios a usuarios

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/notifications — Listar notificaciones (opcionalmente filtradas por ?userId=...)
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.query;

    const notifications = await prisma.notification.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/:id — Obtener una notificación por ID
export const getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
      return;
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications — Crear una nueva notificación
export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, title, message, type } = req.body;

    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title: title.trim(),
        message: message.trim(),
        type: type || 'info',
        isRead: false,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id — Actualizar estado (ej. marcar como leída)
export const updateNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isRead, title, message } = req.body;

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        ...(isRead !== undefined && { isRead: Boolean(isRead) }),
        ...(title && { title: title.trim() }),
        ...(message && { message: message.trim() }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id — Eliminar una notificación
export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.notification.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Notificación eliminada exitosamente.' });
  } catch (error) {
    next(error);
  }
};
