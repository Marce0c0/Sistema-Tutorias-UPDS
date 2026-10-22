import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking } from '../controllers/bookings.controller';
import { validateBooking, validateBookingStatus, validateId } from '../middlewares/validate';

export const bookingsRouter = Router();

bookingsRouter.get('/', getBookings);
bookingsRouter.get('/:id', validateId, getBookingById);
bookingsRouter.post('/', validateBooking, createBooking);
bookingsRouter.put('/:id', validateId, validateBookingStatus, updateBooking);
bookingsRouter.delete('/:id', validateId, deleteBooking);

