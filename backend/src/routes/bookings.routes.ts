// Rutas de Reservas
import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking } from '../controllers/bookings.controller';
import { validateBooking, validateBookingStatus } from '../middlewares/validate';

export const bookingsRouter = Router();

bookingsRouter.get('/', getBookings);
bookingsRouter.get('/:id', getBookingById);
bookingsRouter.post('/', validateBooking, createBooking);
bookingsRouter.put('/:id', validateBookingStatus, updateBooking);
bookingsRouter.delete('/:id', deleteBooking);
