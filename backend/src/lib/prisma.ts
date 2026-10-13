// Cliente de Prisma — Patrón Singleton
// Se crea una sola instancia para evitar múltiples conexiones a la BD

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
