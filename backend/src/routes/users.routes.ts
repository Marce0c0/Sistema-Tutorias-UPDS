import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { validateUser, validateUserUpdate, validateId } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';

export const usersRouter = Router();

// Directorio de usuarios universitario: lectura pública segura (sin passwordHash), mutaciones restringidas a Administrador
usersRouter.get('/', getUsers);
usersRouter.get('/:id', authenticateJWT, validateId, getUserById);
usersRouter.post('/', authenticateJWT, authorizeRoles('admin'), validateUser, createUser);
usersRouter.put('/:id', authenticateJWT, authorizeRoles('admin'), validateId, validateUserUpdate, updateUser);
usersRouter.delete('/:id', authenticateJWT, authorizeRoles('admin'), validateId, deleteUser);
