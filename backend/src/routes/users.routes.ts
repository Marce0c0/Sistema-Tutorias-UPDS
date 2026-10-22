import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { validateUser, validateUserUpdate, validateId } from '../middlewares/validate';

export const usersRouter = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', validateId, getUserById);
usersRouter.post('/', validateUser, createUser);
usersRouter.put('/:id', validateId, validateUserUpdate, updateUser);
usersRouter.delete('/:id', validateId, deleteUser);

