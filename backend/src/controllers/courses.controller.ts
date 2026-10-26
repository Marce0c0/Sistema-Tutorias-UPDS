// Controlador de Cursos — CRUD completo
// Gestiona el catálogo de cursos extracurriculares y talleres de la plataforma

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/courses — Obtener todos los cursos (Ficha D: búsqueda parametrizada ?buscar=)
export const getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buscar = (req.query.buscar as string) || (req.query.search as string);
    const where = buscar
      ? {
          title: {
            contains: buscar.trim(),
            mode: 'insensitive' as const,
          },
        }
      : {};

    const courses = await prisma.course.findMany({
      where,
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

// POST /api/courses — Crear un nuevo curso (Ficha E: anti-duplicados 409 | Ficha F: activo boolean)
export const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, tutorId, activo } = req.body;
    const normalizedTitle = title ? title.trim() : '';

    if (!normalizedTitle) {
      res.status(400).json({ success: false, message: 'El título del curso es obligatorio.' });
      return;
    }

    // Ficha F: Si activo se envía, debe ser estrictamente un booleano JSON. Si se omite, default true.
    let isActive = true;
    if (activo !== undefined) {
      if (typeof activo !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'El campo activo debe ser un valor booleano JSON (true o false).',
        });
        return;
      }
      isActive = activo;
    }

    // Ficha E: Verificar duplicados normalizando espacios y mayúsculas/minúsculas
    const existing = await prisma.course.findFirst({
      where: {
        title: {
          equals: normalizedTitle,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `El curso '${normalizedTitle}' ya se encuentra registrado en el sistema.`,
      });
      return;
    }

    const newCourse = await prisma.course.create({
      data: {
        title: normalizedTitle,
        description: description?.trim(),
        tutorId: tutorId || null,
        activo: isActive,
      },
    });
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

// PUT /api/courses/:id — Actualizar un curso (Ficha F: actualización de estado activo)
export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, tutorId, activo } = req.body;

    // Ficha F: Validación de tipo booleano en PUT
    if (activo !== undefined && typeof activo !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'El campo activo debe ser un valor booleano JSON (true o false).',
      });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(tutorId !== undefined && { tutorId }),
        ...(activo !== undefined && { activo }),
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
