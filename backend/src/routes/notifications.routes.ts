// Rutas de Notificaciones
import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../controllers/notifications.controller';
import { validateId, validateNotification } from '../middlewares/validate';

export const notificationsRouter = Router();

notificationsRouter.get('/', getNotifications);
notificationsRouter.get('/:id', validateId, getNotificationById);
notificationsRouter.post('/', validateNotification, createNotification);
notificationsRouter.put('/:id', validateId, updateNotification);
notificationsRouter.delete('/:id', validateId, deleteNotification);
