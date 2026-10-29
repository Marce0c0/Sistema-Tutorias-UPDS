import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking } from '../controllers/bookings.controller';
import { validateBooking, validateBookingStatus, validateId } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';

export const bookingsRouter = Router();

bookingsRouter.get('/', getBookings);
bookingsRouter.get('/:id', validateId, getBookingById);
bookingsRouter.post('/', authenticateJWT, authorizeRoles('admin', 'student'), validateBooking, createBooking);
bookingsRouter.put('/:id', authenticateJWT, authorizeRoles('admin', 'tutor', 'student'), validateId, validateBookingStatus, updateBooking);
bookingsRouter.delete('/:id', authenticateJWT, authorizeRoles('admin', 'student'), validateId, deleteBooking);
