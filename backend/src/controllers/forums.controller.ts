// Controlador de Mensajes de Foro de Dudas
// Permite la interacción y resolución de dudas entre estudiantes y tutores por curso

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/forums — Listar mensajes (opcionalmente filtrados por curso: ?courseId=...)
export const getForumMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.query;

    const messages = await prisma.forumMessage.findMany({
      where: courseId ? { courseId: String(courseId) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// GET /api/forums/:id — Obtener un mensaje específico por ID
export const getForumMessageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const message = await prisma.forumMessage.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    if (!message) {
      res.status(404).json({ success: false, message: 'Mensaje de foro no encontrado.' });
      return;
    }

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

// POST /api/forums — Publicar una nueva consulta o mensaje
export const createForumMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, userId, title, content } = req.body;

    const newMessage = await prisma.forumMessage.create({
      data: {
        courseId,
        userId,
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

// PUT /api/forums/:id — Editar título o contenido de un mensaje
export const updateForumMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, content } = req.body;

    const updated = await prisma.forumMessage.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(content && { content: content.trim() }),
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/forums/:id — Eliminar un mensaje de foro
export const deleteForumMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.forumMessage.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Mensaje de foro eliminado exitosamente.' });
  } catch (error) {
    next(error);
  }
};
