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
        course: { select: { id: true, title: true, description: true, price: true, category: true } },
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
    const { studentId, courseId, scheduledAt, tutoriaId, status, receiptUrl } = req.body;

    // Validación de seguridad para comprobantes (máx. 10MB en base64)
    if (receiptUrl && (typeof receiptUrl !== 'string' || receiptUrl.length > 14 * 1024 * 1024)) {
      res.status(400).json({ message: 'El comprobante excede el tamaño máximo permitido de 10 MB.' });
      return;
    }

    // Evitar reservas duplicadas si el estudiante ya cuenta con un pase activo
    if (studentId && (courseId || tutoriaId)) {
      const existing = await prisma.booking.findFirst({
        where: {
          studentId,
          ...(courseId ? { courseId } : {}),
          ...(tutoriaId ? { tutoriaId } : {}),
          status: { not: 'cancelled' },
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, description: true, price: true, category: true } },
          tutoria: { select: { id: true, title: true, date: true } },
        },
      });

      if (existing) {
        // Si ya existe pero estaba pendiente o sin comprobante, actualizar el comprobante y notificar a los admins
        if (receiptUrl && (existing.status === 'pending' || !existing.receiptUrl)) {
          const updated = await prisma.booking.update({
            where: { id: existing.id },
            data: {
              receiptUrl,
              status: 'pending',
            },
            include: {
              student: { select: { id: true, name: true, email: true } },
              course: { select: { id: true, title: true, description: true, price: true, category: true } },
              tutoria: { select: { id: true, title: true, date: true } },
            },
          });

          try {
            const admins = await prisma.user.findMany({
              where: { role: 'admin' },
              select: { id: true },
            });
            if (admins.length > 0) {
              await prisma.notification.createMany({
                data: admins.map((adm) => ({
                  userId: adm.id,
                  title: `Nuevo comprobante recibido — ${(updated.course?.title || 'Curso UPDS').slice(0, 30)}`,
                  message: `${updated.student?.name || 'Un estudiante'} subió su comprobante de pago por Simple QR. Ingresa a 'Validar Entradas' para cotejar en la banca y aprobarlo.`,
                  type: 'booking_update',
                  isRead: false,
                })),
              });
            }
          } catch (notifErr) {
            console.warn('[Error notificando a administradores]:', notifErr);
          }

          res.status(200).json(updated);
          return;
        }

        res.status(200).json(existing);
        return;
      }
    }

    // Determinar estado: cursos gratuitos se confirman automáticamente sin requerir verificación
    let initialStatus = 'confirmed';
    let courseData: { title: string; description: string | null } | null = null;
    if (courseId) {
      courseData = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, description: true },
      });
      const hasPrice = courseData?.description && /<!--price:(\d+)-->/.test(courseData.description);
      if (hasPrice) {
        initialStatus = status === 'confirmed' ? 'confirmed' : 'pending';
      }
    } else if (status) {
      initialStatus = status;
    }

    const newBooking = await prisma.booking.create({
      data: {
        studentId,
        courseId,
        scheduledAt: new Date(scheduledAt),
        status: initialStatus,
        receiptUrl: receiptUrl || null,
        ...(tutoriaId && { tutoriaId }),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, description: true, price: true, category: true } },
        tutoria: { select: { id: true, title: true, date: true } },
      },
    });

    // Si la inscripción está en espera de validación, notificar automáticamente a todos los Administradores
    if (initialStatus === 'pending') {
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'admin' },
          select: { id: true },
        });
        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map((adm) => ({
              userId: adm.id,
              title: `Nuevo comprobante recibido — ${(newBooking.course?.title || courseData?.title || 'Curso UPDS').slice(0, 30)}`,
              message: `${newBooking.student?.name || 'Un estudiante'} subió su comprobante de pago por Simple QR. Ingresa a 'Validar Entradas' para cotejar en la banca y aprobarlo.`,
              type: 'booking_update',
              isRead: false,
            })),
          });
        }
      } catch (notifErr) {
        console.warn('[Error notificando a administradores]:', notifErr);
      }
    }

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id — Actualizar estado de una reserva
export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, scheduledAt, tutoriaId, receiptUrl } = req.body;

    if (receiptUrl && (typeof receiptUrl !== 'string' || receiptUrl.length > 14 * 1024 * 1024)) {
      res.status(400).json({ message: 'El comprobante excede el tamaño máximo permitido de 10 MB.' });
      return;
    }

    const user = (req as any).user;
    if (user && user.role === 'student') {
      const existing = await prisma.booking.findUnique({ where: { id } });
      const currentUserId = user.id || user.userId;
      if (!existing || existing.studentId !== currentUserId) {
        res.status(403).json({ message: 'No tienes permiso para modificar esta reserva.' });
        return;
      }
    }

    const previousBooking = await prisma.booking.findUnique({
      where: { id },
      include: { course: { select: { title: true } } },
    });

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(tutoriaId !== undefined && { tutoriaId }),
        ...(receiptUrl !== undefined && { receiptUrl }),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, description: true, price: true, category: true } },
        tutoria: { select: { id: true, title: true, date: true } },
      },
    });

    // Si el Administrador aprueba el pago, notificar automáticamente al estudiante
    if (status === 'confirmed' && previousBooking?.status === 'pending') {
      try {
        await prisma.notification.create({
          data: {
            userId: updated.studentId,
            title: '¡Comprobante Aprobado y Entrada QR Activa! 🎉',
            message: `Tu comprobante de pago para "${updated.course?.title || 'tu curso'}" fue verificado exitosamente. Tu pase digital con Código QR ya se encuentra activo.`,
            type: 'booking_update',
            isRead: false,
          },
        });
      } catch (notifErr) {
        console.warn('[Error notificando aprobación al estudiante]:', notifErr);
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/bookings/:id — Eliminar una reserva
export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;
    if (user && user.role === 'student') {
      const existing = await prisma.booking.findUnique({ where: { id } });
      const currentUserId = user.id || user.userId;
      if (!existing || existing.studentId !== currentUserId) {
        res.status(403).json({ message: 'No tienes permiso para eliminar esta reserva.' });
        return;
      }
      if (existing.status !== 'cancelled' || !existing.receiptUrl?.includes('deleted_by_admin')) {
        res.status(403).json({ message: 'Solo puedes eliminar de tu historial los registros cancelados por la administración.' });
        return;
      }
    }
    await prisma.booking.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Reserva eliminada exitosamente.' });
  } catch (error) {
    next(error);
  }
};

