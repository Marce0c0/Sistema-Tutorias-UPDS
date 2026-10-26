import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed) para las 8 entidades universitarias...');

  // Generar hash seguro para contraseñas de prueba (Upds2026)
  const defaultPasswordHash = await bcrypt.hash('Upds2026', 10);

  // 1. Usuarios (Estudiante, Tutor, Admin)
  const student = await prisma.user.upsert({
    where: { email: 'juan@estudiante.com' },
    update: {
      passwordHash: defaultPasswordHash,
    },
    create: {
      id: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      name: 'Juan Perez',
      email: 'juan@estudiante.com',
      passwordHash: defaultPasswordHash,
      role: 'student',
    },
  });

  const tutor = await prisma.user.upsert({
    where: { email: 'maria@tutor.com' },
    update: {
      passwordHash: defaultPasswordHash,
    },
    create: {
      id: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      name: 'Maria Gomez',
      email: 'maria@tutor.com',
      passwordHash: defaultPasswordHash,
      role: 'tutor',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@upds.edu.bo' },
    update: {
      passwordHash: defaultPasswordHash,
    },
    create: {
      id: '3b593672-04b3-469b-9ffb-149eb0f317b9',
      name: 'Coordinación Académica UPDS',
      email: 'admin@upds.edu.bo',
      passwordHash: defaultPasswordHash,
      role: 'admin',
    },
  });

  // 2. Cursos Extracurriculares y Talleres de Extensión
  const course1 = await prisma.course.upsert({
    where: { id: '196842ff-59e6-49d3-bbd0-78bfee97194a' },
    update: {
      title: 'Taller de Nivelación en Matemáticas Aplicadas',
      description: 'Taller extracurricular de apoyo académico y nivelación práctica en cálculo y álgebra lineal.',
    },
    create: {
      id: '196842ff-59e6-49d3-bbd0-78bfee97194a',
      title: 'Taller de Nivelación en Matemáticas Aplicadas',
      description: 'Taller extracurricular de apoyo académico y nivelación práctica en cálculo y álgebra lineal.',
      tutorId: tutor.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: '7602b258-16be-4d49-9160-19d5e2b14422' },
    update: {
      title: 'Bootcamp Práctico: Programación Web II & Cloud',
      description: 'Curso intensivo de extensión universitaria en Node.js, Express, TypeScript, Docker y Despliegue Cloud.',
    },
    create: {
      id: '7602b258-16be-4d49-9160-19d5e2b14422',
      title: 'Bootcamp Práctico: Programación Web II & Cloud',
      description: 'Curso intensivo de extensión universitaria en Node.js, Express, TypeScript, Docker y Despliegue Cloud.',
      tutorId: tutor.id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: '8a123b45-67c8-49de-b123-456789abcdef' },
    update: {
      title: 'Hackathon Cochabamba Innova Tech 2026',
      description: 'Desafío de desarrollo tecnológico y soluciones Smart City para la llajta, auspiciado por la Alcaldía de Cochabamba y el Hub Tecnológico.',
    },
    create: {
      id: '8a123b45-67c8-49de-b123-456789abcdef',
      title: 'Hackathon Cochabamba Innova Tech 2026',
      description: 'Desafío de desarrollo tecnológico y soluciones Smart City para la llajta, auspiciado por la Alcaldía de Cochabamba y el Hub Tecnológico.',
      tutorId: admin.id,
    },
  });

  const course4 = await prisma.course.upsert({
    where: { id: '9b234c56-78d9-40ef-c234-567890abcdef' },
    update: {
      title: 'Torneo de Ciberseguridad & CTF Cochabamba',
      description: 'Competencia externa de ethical hacking y seguridad defensiva en redes para talentos universitarios de Cochabamba.',
    },
    create: {
      id: '9b234c56-78d9-40ef-c234-567890abcdef',
      title: 'Torneo de Ciberseguridad & CTF Cochabamba',
      description: 'Competencia externa de ethical hacking y seguridad defensiva en redes para talentos universitarios de Cochabamba.',
      tutorId: tutor.id,
    },
  });

  // 3. Tutorías (con modalidad, aula física y enlace virtual)
  const tutoria1 = await prisma.tutoria.upsert({
    where: { id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' },
    update: {
      modality: 'presencial',
      location: 'Aula 302 - Bloque B (Campus Central)',
      meetingUrl: 'https://meet.google.com/upds-web2-tutoria',
    },
    create: {
      id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
      courseId: course2.id,
      title: 'Taller Práctico: Implementación de APIs REST con Express',
      description: 'Sesión intensiva de resolución de dudas sobre middlewares y Prisma.',
      date: new Date('2026-10-22T18:00:00.000Z'),
      maxStudents: 15,
      status: 'active',
      modality: 'presencial',
      location: 'Aula 302 - Bloque B (Campus Central)',
      meetingUrl: 'https://meet.google.com/upds-web2-tutoria',
    },
  });

  const tutoria2 = await prisma.tutoria.upsert({
    where: { id: 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e' },
    update: {},
    create: {
      id: 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
      courseId: course1.id,
      title: 'Resolución de Exámenes Pasados de Cálculo I',
      description: 'Repaso integral de derivadas, límites y aplicaciones prácticas.',
      date: new Date('2026-10-24T15:00:00.000Z'),
      maxStudents: 20,
      status: 'active',
      modality: 'virtual',
      location: 'En línea vía Google Meet',
      meetingUrl: 'https://meet.google.com/calc1-upds-repaso',
    },
  });

  const tutoria3 = await prisma.tutoria.upsert({
    where: { id: 'c3d4e5f6-a1b2-4c3d-0e4f-5a6b7c8d9e0f' },
    update: {
      location: 'Recinto Ferial Alalay - Pabellón Cochabamba Tech',
      meetingUrl: 'https://cochabamba.bo/innova-tech-2026',
    },
    create: {
      id: 'c3d4e5f6-a1b2-4c3d-0e4f-5a6b7c8d9e0f',
      courseId: course3.id,
      title: 'Presentación de Proyectos: Hackathon Cochabamba 2026',
      description: 'Demoday y evaluación presencial de prototipos Smart City ante jurados de la Alcaldía y empresas patrocinadoras.',
      date: new Date('2026-11-05T09:00:00.000Z'),
      maxStudents: 50,
      status: 'active',
      modality: 'presencial',
      location: 'Recinto Ferial Alalay - Pabellón Cochabamba Tech',
      meetingUrl: 'https://cochabamba.bo/innova-tech-2026',
    },
  });

  const tutoria4 = await prisma.tutoria.upsert({
    where: { id: 'd4e5f6a1-b2c3-4d4e-1f5a-6b7c8d9e0f1a' },
    update: {
      location: 'Discord Oficial de Comunidades Tech Cochabamba',
      meetingUrl: 'https://discord.gg/tech-cochabamba',
    },
    create: {
      id: 'd4e5f6a1-b2c3-4d4e-1f5a-6b7c8d9e0f1a',
      courseId: course4.id,
      title: 'Workshop de Preparación CTF & Hacking Ético',
      description: 'Entrenamiento previo para la competencia de seguridad ofensiva y defensiva en Cochabamba.',
      date: new Date('2026-11-12T19:00:00.000Z'),
      maxStudents: 35,
      status: 'active',
      modality: 'virtual',
      location: 'Discord Oficial de Comunidades Tech Cochabamba',
      meetingUrl: 'https://discord.gg/tech-cochabamba',
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

  // 7. Reseñas y Calificaciones (Reviews)
  const review1 = await prisma.review.upsert({
    where: {
      tutoriaId_studentId: {
        tutoriaId: tutoria1.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      id: '990e8400-e29b-41d4-a716-446655440010',
      tutoriaId: tutoria1.id,
      studentId: student.id,
      rating: 5,
      comment: 'Excelente explicación de los middlewares en Express y la arquitectura en capas. Muy clara la clase.',
    },
  });

  // 8. Materiales de Estudio (Materials en Amazon S3)
  const material1 = await prisma.material.upsert({
    where: { id: '880e8400-e29b-41d4-a716-446655440020' },
    update: {},
    create: {
      id: '880e8400-e29b-41d4-a716-446655440020',
      courseId: course2.id,
      uploadedById: tutor.id,
      title: 'Guía Completa de APIs RESTful con Node.js y Express',
      description: 'Documento PDF con buenas prácticas, patrones de diseño y manejo de errores.',
      fileUrl: 'https://sistema-tutorias-upds.s3.us-east-2.amazonaws.com/materials/guia-apis-rest-express.pdf',
      fileType: 'pdf',
    },
  });

  const material2 = await prisma.material.upsert({
    where: { id: '880e8400-e29b-41d4-a716-446655440021' },
    update: {},
    create: {
      id: '880e8400-e29b-41d4-a716-446655440021',
      courseId: course1.id,
      uploadedById: tutor.id,
      title: 'Formulario y Ejercicios Resueltos de Integrales',
      description: 'Compendio de ejercicios resueltos paso a paso para el examen parcial.',
      fileUrl: 'https://sistema-tutorias-upds.s3.us-east-2.amazonaws.com/materials/formulario-integrales-calculo.pdf',
      fileType: 'pdf',
    },
  });

  console.log('✅ Seed completado con éxito para las 8 entidades universitarias:');
  console.log({
    usersCount: 3,
    coursesCount: 4,
    tutoriasCount: 4,
    bookingsCount: 1,
    forumMessagesCount: 1,
    notificationsCount: 1,
    reviewsCount: 1,
    materialsCount: 2,
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

