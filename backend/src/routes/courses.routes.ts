import { Router } from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from '../controllers/courses.controller';
import { validateCourse, validateCourseUpdate, validateId } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';

export const coursesRouter = Router();

// Consulta pública o institucional
coursesRouter.get('/', getCourses);
coursesRouter.get('/:id', validateId, getCourseById);

// Operaciones restringidas para administradores
coursesRouter.post('/', authenticateJWT, authorizeRoles('admin'), validateCourse, createCourse);
coursesRouter.put('/:id', authenticateJWT, authorizeRoles('admin'), validateId, validateCourseUpdate, updateCourse);
coursesRouter.delete('/:id', authenticateJWT, authorizeRoles('admin'), validateId, deleteCourse);
