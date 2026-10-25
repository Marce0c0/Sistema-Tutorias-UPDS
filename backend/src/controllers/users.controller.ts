// Controlador de Usuarios — CRUD completo (Seguridad & Exclusión de passwordHash)
// Gestiona estudiantes, tutores y administradores de la plataforma

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Selector público seguro que previene la fuga de credenciales
const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

// GET /api/users — Obtener todos los usuarios (sin passwordHash)
export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: userPublicSelect,
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
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userPublicSelect,
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
      select: userPublicSelect,
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id — Actualizar un usuario
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, email, role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(role && { role }),
      },
      select: userPublicSelect,
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Eliminar un usuario
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    next(error);
  }
};
