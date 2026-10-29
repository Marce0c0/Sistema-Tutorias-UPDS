import express from 'express';
import helmet from 'helmet';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { coursesRouter } from './routes/courses.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { tutoriasRouter } from './routes/tutorias.routes';
import { forumsRouter } from './routes/forums.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { materialsRouter } from './routes/materials.routes';
import { errorHandler } from './middlewares/errorHandler';
import { sanitizeInput } from './middlewares/validate';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── 1. Cabeceras de Seguridad con Helmet & Custom Headers ───────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ─── 2. CORS y Políticas de Seguridad Adicionales ────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Cabeceras de protección activa contra clickjacking y MIME sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// ─── 3. Límite de Tamaño de Carga y Sanitización ────────────────────────────
// Permite imágenes de comprobantes bancarios comprimidos (hasta 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// ─── 4. Ruta Raíz y Salud de la API ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API del Sistema-Tutoriales-UPDS (Seguridad & Calidad)',
    version: '2.2.0',
    status: 'online',
    security: {
      auth: 'JWT Bearer',
      rbac: 'Enabled (admin, tutor, student)',
      rateLimitPayload: '10kb',
      headers: 'Helmet active',
    },
    endpoints: {
      auth: '/api/auth',
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

// ─── 5. Rutas de la API (Módulo de Autenticación + 8 Entidades) ──────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/tutorias', tutoriasRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/forums', forumsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/materials', materialsRouter);

// ─── 6. Ruta 404 para Endpoints no Encontrados ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    suggestion: 'Consulte la raíz GET / para verificar los endpoints REST disponibles.',
  });
});

// ─── 7. Middleware de Manejo Centralizado de Errores ────────────────────────
app.use(errorHandler);

// ─── 7. Iniciar el Servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor UPDS Backend corriendo de forma segura en http://localhost:${PORT}`);
});
