// Controlador de Autenticación (Auth) — Registro, Login y Perfil con JWT & Bcrypt
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'upds_jwt_super_secret_key_2026_enterprise_grade_auth';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Helper para emitir el token JWT
const signToken = (payload: { id: string; email: string; role: string; name: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN || '8h') as any });
};

// POST /api/auth/register — Registro de nuevo usuario
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Correo electrónico inválido.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const assignedRole = role === 'tutor' || role === 'admin' ? role : 'student';

    // Verificar si el correo ya existe
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'El correo electrónico ya se encuentra registrado.' });
      return;
    }

    // Hashear contraseña con salt factor 10
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Emisión de token JWT
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login — Inicio de sesión
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Correo electrónico y contraseña requeridos.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
      return;
    }

    // Validar hash con bcrypt
    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
      return;
    }

    // Emisión de token JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — Obtener perfil del usuario autenticado
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
