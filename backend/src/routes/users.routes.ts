// Rutas de Usuarios
import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { validateUser } from '../middlewares/validate';

export const usersRouter = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', validateUser, createUser);
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);
