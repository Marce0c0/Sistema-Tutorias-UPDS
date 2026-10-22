// Controlador de Tutorías (Sesiones grupales o individuales)
// Gestiona la programación, capacidad y estado de cada tutoría

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/tutorias — Listar todas las tutorías
export const getTutorias = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tutorias = await prisma.tutoria.findMany({
      orderBy: { date: 'asc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            tutor: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
    });
    res.status(200).json(tutorias);
  } catch (error) {
    next(error);
  }
};

// GET /api/tutorias/:id — Obtener una tutoría por ID con sus reservas
export const getTutoriaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const tutoria = await prisma.tutoria.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            tutor: { select: { id: true, name: true, email: true } },
          },
        },
        bookings: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!tutoria) {
      res.status(404).json({ success: false, message: 'Tutoría no encontrada.' });
      return;
    }

    res.status(200).json(tutoria);
  } catch (error) {
    next(error);
  }
};

// POST /api/tutorias — Crear una nueva tutoría
export const createTutoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, title, description, date, maxStudents, status } = req.body;

    const newTutoria = await prisma.tutoria.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        date: new Date(date),
        maxStudents: maxStudents !== undefined ? Number(maxStudents) : 10,
        status: status || 'active',
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(newTutoria);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tutorias/:id — Actualizar una tutoría
export const updateTutoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, date, maxStudents, status } = req.body;

    const updated = await prisma.tutoria.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(date && { date: new Date(date) }),
        ...(maxStudents !== undefined && { maxStudents: Number(maxStudents) }),
        ...(status && { status }),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tutorias/:id — Eliminar una tutoría
export const deleteTutoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.tutoria.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Tutoría eliminada exitosamente.' });
  } catch (error) {
    next(error);
  }
};
