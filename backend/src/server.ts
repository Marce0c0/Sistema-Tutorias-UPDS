import express from 'express';
import { usersRouter } from './routes/users.routes';
import { coursesRouter } from './routes/courses.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { tutoriasRouter } from './routes/tutorias.routes';
import { forumsRouter } from './routes/forums.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { materialsRouter } from './routes/materials.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globales ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Ruta Raíz ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API del Sistema-Tutoriales-UPDS',
    version: '2.1',
    entitiesCount: 8,
    endpoints: {
      users: '/api/users',
      courses: '/api/courses',
      tutorias: '/api/tutorias',
      bookings: '/api/bookings',
      forums: '/api/forums',
      notifications: '/api/notifications',
      reviews: '/api/reviews',
      materials: '/api/materials',
    },
  });
});

// ─── Rutas de la API (8 Entidades Universitarias) ───────────────────────────
app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/tutorias', tutoriasRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/forums', forumsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/materials', materialsRouter);

// ─── Middleware de Manejo de Errores (siempre al final) ─────────────────────
app.use(errorHandler);

// ─── Iniciar el Servidor ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

