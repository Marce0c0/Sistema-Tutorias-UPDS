import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed) para las 6 entidades...');

  // 1. Usuarios (Estudiante, Tutor, Admin)
  const student = await prisma.user.upsert({
    where: { email: 'juan@estudiante.com' },
    update: {},
    create: {
      id: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      name: 'Juan Perez',
      email: 'juan@estudiante.com',
      role: 'student',
    },
  });

  const tutor = await prisma.user.upsert({
    where: { email: 'maria@tutor.com' },
    update: {},
    create: {
      id: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      name: 'Maria Gomez',
      email: 'maria@tutor.com',
      role: 'tutor',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@upds.edu.bo' },
    update: {},
    create: {
      id: '3b593672-04b3-469b-9ffb-149eb0f317b9',
      name: 'Coordinación Académica UPDS',
      email: 'admin@upds.edu.bo',
      role: 'admin',
    },
  });

  // 2. Cursos
  const course1 = await prisma.course.upsert({
    where: { id: '196842ff-59e6-49d3-bbd0-78bfee97194a' },
    update: {},
    create: {
      id: '196842ff-59e6-49d3-bbd0-78bfee97194a',
      title: 'Matemáticas Aplicadas',
      description: 'Curso de apoyo de cálculo y álgebra lineal para ingeniería.',
      tutorId: tutor.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: '7602b258-16be-4d49-9160-19d5e2b14422' },
    update: {},
    create: {
      id: '7602b258-16be-4d49-9160-19d5e2b14422',
      title: 'Programación Web II',
      description: 'Arquitectura Backend con Node.js, Express, TypeScript, ORM y PostgreSQL.',
      tutorId: tutor.id,
    },
  });

  // 3. Tutorías
  const tutoria1 = await prisma.tutoria.upsert({
    where: { id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
      courseId: course2.id,
      title: 'Taller Práctico: Implementación de APIs REST con Express',
      description: 'Sesión intensiva de resolución de dudas sobre middlewares y Prisma.',
      date: new Date('2026-10-22T18:00:00.000Z'),
      maxStudents: 15,
      status: 'active',
    },
  });

  // 4. Reservas (Bookings)
  const booking1 = await prisma.booking.upsert({
    where: { id: '777ccbc6-4a04-42b7-bdf6-6f7f446ece11' },
    update: {},
    create: {
      id: '777ccbc6-4a04-42b7-bdf6-6f7f446ece11',
      studentId: student.id,
      courseId: course2.id,
      tutoriaId: tutoria1.id,
      scheduledAt: new Date('2026-10-22T18:00:00.000Z'),
      status: 'confirmed',
    },
  });

  // 5. Mensajes de Foro (Forum Messages)
  const forumMessage1 = await prisma.forumMessage.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440001' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      courseId: course2.id,
      userId: student.id,
      title: 'Consulta sobre validación de UUIDs en rutas Express',
      content: '¿Es recomendable validar los UUIDs mediante middleware regex antes de consultar la BD?',
    },
  });

  // 6. Notificaciones
  const notification1 = await prisma.notification.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440002' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      userId: student.id,
      title: 'Reserva Confirmada',
      message: 'Tu reserva para el Taller Práctico de Express ha sido confirmada con éxito.',
      type: 'booking_update',
      isRead: false,
    },
  });

  console.log('✅ Seed completado con éxito para las 6 entidades:');
  console.log({
    usersCount: 3,
    coursesCount: 2,
    tutoriasCount: 1,
    bookingsCount: 1,
    forumMessagesCount: 1,
    notificationsCount: 1,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
