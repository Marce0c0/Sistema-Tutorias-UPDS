// Controlador de Calificaciones y Reseñas (Reviews)
// Permite a los estudiantes calificar con estrellas (1-5) y opinar sobre las tutorías

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/reviews — Listar reseñas (opcionalmente filtradas por ?tutoriaId=... o ?studentId=...)
export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tutoriaId, studentId } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        ...(tutoriaId ? { tutoriaId: String(tutoriaId) } : {}),
        ...(studentId ? { studentId: String(studentId) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutoria: {
          select: {
            id: true,
            title: true,
            date: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/:id — Obtener una reseña por ID
export const getReviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutoria: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!review) {
      res.status(404).json({ success: false, message: 'Reseña no encontrada.' });
      return;
    }

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews — Crear una nueva reseña
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tutoriaId, studentId, rating, comment } = req.body;

    // Verificar si ya existe una reseña de este estudiante para esta tutoría
    const existing = await prisma.review.findUnique({
      where: {
        tutoriaId_studentId: {
          tutoriaId,
          studentId,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'El estudiante ya ha publicado una reseña para esta tutoría.',
      });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        tutoriaId,
        studentId,
        rating: Number(rating),
        comment: comment ? String(comment).trim() : null,
      },
      include: {
        student: { select: { id: true, name: true } },
        tutoria: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Reseña registrada con éxito.',
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id — Actualizar calificación o comentario
export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, comment } = req.body;

    const dataToUpdate: any = {};
    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ success: false, message: 'El rating debe estar entre 1 y 5.' });
        return;
      }
      dataToUpdate.rating = numRating;
    }
    if (comment !== undefined) {
      dataToUpdate.comment = comment ? String(comment).trim() : null;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Reseña actualizada con éxito.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id — Eliminar una reseña
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.review.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada con éxito.',
    });
  } catch (error) {
    next(error);
  }
};
