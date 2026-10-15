import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed)...');

  // 1. Usuarios
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

  // 2. Cursos
  const course1 = await prisma.course.upsert({
    where: { id: '196842ff-59e6-49d3-bbd0-78bfee97194a' },
    update: {},
    create: {
      id: '196842ff-59e6-49d3-bbd0-78bfee97194a',
      title: 'Matemáticas Aplicadas',
      description: 'Curso de apoyo de matemáticas',
      tutorId: tutor.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: '7602b258-16be-4d49-9160-19d5e2b14422' },
    update: {},
    create: {
      id: '7602b258-16be-4d49-9160-19d5e2b14422',
      title: 'Programación Web II',
      description: 'Curso intensivo de desarrollo web',
      tutorId: tutor.id,
    },
  });

  // 3. Reserva
  const booking = await prisma.booking.upsert({
    where: { id: '777ccbc6-4a04-42b7-bdf6-6f7f446ece11' },
    update: {},
    create: {
      id: '777ccbc6-4a04-42b7-bdf6-6f7f446ece11',
      studentId: student.id,
      courseId: course2.id,
      scheduledAt: new Date('2026-10-20T15:00:00.000Z'),
      status: 'pending',
    },
  });

  console.log('✅ Seed completado con éxito:');
  console.log({ student, tutor, courses: [course1.title, course2.title], bookingId: booking.id });
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
