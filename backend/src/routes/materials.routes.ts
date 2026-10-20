// Rutas de Materiales de Estudio
import { Router } from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materials.controller';
import { validateId, validateMaterial } from '../middlewares/validate';

export const materialsRouter = Router();

materialsRouter.get('/', getMaterials);
materialsRouter.get('/:id', validateId, getMaterialById);
materialsRouter.post('/', validateMaterial, createMaterial);
materialsRouter.put('/:id', validateId, updateMaterial);
materialsRouter.delete('/:id', validateId, deleteMaterial);
