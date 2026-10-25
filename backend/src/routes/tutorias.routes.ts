// Rutas de Tutorías
import { Router } from 'express';
import {
  getTutorias,
  getTutoriaById,
  createTutoria,
  updateTutoria,
  deleteTutoria,
} from '../controllers/tutorias.controller';
import { validateId, validateTutoria } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';

export const tutoriasRouter = Router();

tutoriasRouter.get('/', getTutorias);
tutoriasRouter.get('/:id', validateId, getTutoriaById);

// Gestión de tutorías: solo admin y tutores
tutoriasRouter.post('/', authenticateJWT, authorizeRoles('admin', 'tutor'), validateTutoria, createTutoria);
tutoriasRouter.put('/:id', authenticateJWT, authorizeRoles('admin', 'tutor'), validateId, updateTutoria);
tutoriasRouter.delete('/:id', authenticateJWT, authorizeRoles('admin', 'tutor'), validateId, deleteTutoria);
