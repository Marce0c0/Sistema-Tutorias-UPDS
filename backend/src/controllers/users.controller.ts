// Controlador de Usuarios — CRUD completo
// Gestiona estudiantes, tutores y administradores de la plataforma

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/users — Obtener todos los usuarios
export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id — Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        courses: true,   // Incluye los cursos que imparte (si es tutor)
        bookings: true,  // Incluye las reservas que tiene (si es estudiante)
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/users — Crear un nuevo usuario
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, role } = req.body;
    const newUser = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), role },
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id — Actualizar un usuario
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(role && { role }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Eliminar un usuario
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
