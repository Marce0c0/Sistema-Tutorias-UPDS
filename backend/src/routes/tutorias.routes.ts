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

export const tutoriasRouter = Router();

tutoriasRouter.get('/', getTutorias);
tutoriasRouter.get('/:id', validateId, getTutoriaById);
tutoriasRouter.post('/', validateTutoria, createTutoria);
tutoriasRouter.put('/:id', validateId, updateTutoria);
tutoriasRouter.delete('/:id', validateId, deleteTutoria);
