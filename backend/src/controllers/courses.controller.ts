// Controlador de Cursos — CRUD completo
// Gestiona el catálogo de materias y tutoriales de la plataforma

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/courses — Obtener todos los cursos
export const getCourses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: { select: { id: true, name: true, email: true } }, // Info básica del tutor
      },
    });
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id — Obtener un curso por ID
export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        bookings: {
          include: {
            student: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: 'Curso no encontrado.' });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};

// POST /api/courses — Crear un nuevo curso
export const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, tutorId } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        tutorId: tutorId || null,
      },
    });
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

// PUT /api/courses/:id — Actualizar un curso
export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, tutorId } = req.body;

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(tutorId !== undefined && { tutorId }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.course.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Curso eliminado exitosamente.' });
  } catch (error) {
    next(error);
  }
};
