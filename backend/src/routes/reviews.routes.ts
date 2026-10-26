// Rutas de Calificaciones y Reseñas
import { Router } from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller';
import { validateId, validateReview } from '../middlewares/validate';

export const reviewsRouter = Router();

reviewsRouter.get('/', getReviews);
reviewsRouter.get('/:id', validateId, getReviewById);
reviewsRouter.post('/', validateReview, createReview);
reviewsRouter.put('/:id', validateId, updateReview);
reviewsRouter.delete('/:id', validateId, deleteReview);
