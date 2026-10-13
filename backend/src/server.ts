// Punto de entrada principal del servidor
// Sistema-Tutoriales-UPDS | Backend API REST

import express from 'express';
import { usersRouter } from './routes/users.routes';
import { coursesRouter } from './routes/courses.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globales ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Ruta Raíz ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API del Sistema-Tutoriales-UPDS',
    version: '2.0',
    endpoints: {
      users: '/api/users',
      courses: '/api/courses',
      bookings: '/api/bookings',
    },
  });
});

// ─── Rutas de la API ────────────────────────────────────────────────────────
app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/bookings', bookingsRouter);

// ─── Middleware de Manejo de Errores (siempre al final) ─────────────────────
app.use(errorHandler);

// ─── Iniciar el Servidor ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
