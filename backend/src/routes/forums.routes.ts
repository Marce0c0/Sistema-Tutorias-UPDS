// Rutas del Foro de Dudas
import { Router } from 'express';
import {
  getForumMessages,
  getForumMessageById,
  createForumMessage,
  updateForumMessage,
  deleteForumMessage,
} from '../controllers/forums.controller';
import { validateId, validateForumMessage } from '../middlewares/validate';

export const forumsRouter = Router();

forumsRouter.get('/', getForumMessages);
forumsRouter.get('/:id', validateId, getForumMessageById);
forumsRouter.post('/', validateForumMessage, createForumMessage);
forumsRouter.put('/:id', validateId, updateForumMessage);
forumsRouter.delete('/:id', validateId, deleteForumMessage);
