// Rutas de Cursos
import { Router } from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from '../controllers/courses.controller';
import { validateCourse } from '../middlewares/validate';

export const coursesRouter = Router();

coursesRouter.get('/', getCourses);
coursesRouter.get('/:id', getCourseById);
coursesRouter.post('/', validateCourse, createCourse);
coursesRouter.put('/:id', updateCourse);
coursesRouter.delete('/:id', deleteCourse);
