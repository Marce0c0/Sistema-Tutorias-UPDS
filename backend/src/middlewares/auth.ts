// Middleware de Autenticación y Autorización RBAC — Sistema-Tutoriales-UPDS
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  name: string;
}

// Extender la interfaz Request de Express de forma segura
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'upds_jwt_super_secret_key_2026_enterprise_grade_auth';

// Middleware 1: Verificar y decodificar el token JWT
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: Se requiere cabecera Authorization con formato Bearer <token>.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Sesión expirada: El token JWT ha caducado. Por favor inicie sesión nuevamente.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token inválido o corrupto.',
    });
  }
};

// Middleware 2: Autorización basada en roles (RBAC)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado: Identidad de usuario no verificada.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado: El rol '${req.user.role}' no cuenta con permisos suficientes para esta operación. Roles requeridos: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
};
