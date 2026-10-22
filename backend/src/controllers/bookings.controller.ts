// Controlador de Reservas — CRUD completo
// Gestiona las reservas de tutorías entre estudiantes y cursos

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/bookings — Obtener todas las reservas
export const getBookings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        tutoria: { select: { id: true, title: true, date: true } },
      },
    });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id — Obtener una reserva por ID
export const getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: {
          include: {
            tutor: { select: { id: true, name: true } },
          },
        },
        tutoria: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: 'Reserva no encontrada.' });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// POST /api/bookings — Crear una nueva reserva
export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId, scheduledAt, tutoriaId } = req.body;

    const newBooking = await prisma.booking.create({
      data: {
        studentId,
        courseId,
        scheduledAt: new Date(scheduledAt),
        status: 'pending',
        ...(tutoriaId && { tutoriaId }),
      },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
        tutoria: { select: { id: true, title: true, date: true } },
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id — Actualizar estado de una reserva
export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, scheduledAt, tutoriaId } = req.body;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(tutoriaId !== undefined && { tutoriaId }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/bookings/:id — Eliminar una reserva
export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.booking.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Reserva eliminada exitosamente.' });
  } catch (error) {
    next(error);
  }
};

