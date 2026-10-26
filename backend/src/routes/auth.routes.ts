// Rutas de Autenticación — /api/auth
import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth';

export const authRouter = Router();

// Endpoints públicos de autenticación
authRouter.post('/register', register);
authRouter.post('/login', login);

// Endpoint privado protegido con JWT
authRouter.get('/me', authenticateJWT, getMe);
