# Informe de Actividad 2
## Desarrollo Backend, Base de Datos y API REST

---

**Materia:** Tecnología Web II  
**Actividad:** 2 de 6 — Entregable 2  
**Modalidad:** Individual  
**Fecha de Entrega:** 18/10/2026  
**Estudiante:** Sammy Marcelo Sivila Sanchez  
**Proyecto:** Sistema-Tutoriales-UPDS  
**Repositorio:** https://github.com/Marce0c0/Sistema-Tutorias-UPDS  

---

## 1. Portada

| Campo | Detalle |
|---|---|
| **Nombre del Proyecto** | Sistema-Tutoriales-UPDS |
| **Descripción** | Plataforma web para gestionar tutorías y cursos universitarios |
| **Tecnologías** | Node.js, TypeScript, Express, Prisma ORM, PostgreSQL (Supabase / AWS RDS), AWS S3 |
| **Cloud Providers** | Supabase (Database) & Amazon Web Services (Storage / Infrastructure) |
| **Desarrollador** | Sammy Marcelo Sivila Sanchez |
| **Repositorio GitHub** | https://github.com/Marce0c0/Sistema-Tutorias-UPDS |
| **Fecha** | Octubre 2026 |

---

## 2. Estructura del Proyecto Backend

La estructura de carpetas sigue las buenas prácticas de separación de responsabilidades para un backend con TypeScript y Express:

```
sistema-tutoriales-UPDS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Definición de modelos y base de datos
│   │   └── migrations/          # Historial de migraciones generadas
│   ├── src/
│   │   ├── routes/
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   └── bookings.routes.ts
│   │   ├── controllers/
│   │   │   ├── users.controller.ts
│   │   │   ├── courses.controller.ts
│   │   │   └── bookings.controller.ts
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts  # Manejo centralizado de errores
│   │   │   └── validate.ts      # Validación de datos de entrada
│   │   ├── lib/
│   │   │   └── prisma.ts        # Cliente de Prisma (singleton)
│   │   └── server.ts            # Punto de entrada principal
│   ├── .env                     # Variables de entorno (no se sube a GitHub)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
├── .gitignore
└── README.md
```

---

## 3. Implementación con TypeScript

Para esta actividad el proyecto migra de JavaScript a **TypeScript**, aportando tipado estático, mejor detección de errores en tiempo de desarrollo y una base de código más mantenible.

### Configuración de `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Dependencias del proyecto
```bash
# Producción
npm install express @prisma/client

# Desarrollo
npm install -D typescript ts-node-dev @types/express @types/node prisma
```

### Punto de entrada: `src/server.ts`
```typescript
import express from 'express';
import { usersRouter } from './routes/users.routes';
import { coursesRouter } from './routes/courses.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema-Tutoriales-UPDS', version: '2.0' });
});

app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/bookings', bookingsRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 4. Arquitectura del Backend

El backend sigue el patrón **MVC (Modelo - Vista - Controlador)** adaptado para APIs REST, desacoplado de la infraestructura subyacente:

```
Cliente (Postman / Navegador)
         │
         ▼
    [Express Router]            ← Define las rutas (GET, POST, PUT, DELETE)
         │
         ▼
    [Middleware de Validación]  ← Verifica datos de entrada
         │
         ▼
    [Controller]                ← Orquesta la lógica de negocio
       │              │
       ▼              ▼
  [Prisma ORM]   [AWS S3 SDK]   ← Capas de datos y almacenamiento
       │              │
       ▼              ▼
[PostgreSQL DB]  [Amazon S3]    ← DB Relacional (Supabase / AWS RDS) + Archivos/PDFs
```

**Flujo de una petición:**
1. El cliente hace una petición HTTP (ej. `POST /api/users` o subida de material de estudio).
2. Express enruta la petición al middleware de validación.
3. El controlador procesa los datos y llama a Prisma (o al SDK de AWS S3 para archivos).
4. Prisma ejecuta la consulta SQL contra PostgreSQL de forma segura.
5. El controlador responde con el código HTTP correspondiente y los datos en JSON.

---

## 5. Configuración de PostgreSQL y Flexibilidad Cloud

La base de datos relacional es **PostgreSQL v17**. Inicialmente conectada mediante el Session Pooler IPv4 de **Supabase** (`sa-east-1`), la arquitectura está diseñada con **Prisma ORM**, lo que garantiza portabilidad absoluta hacia **AWS RDS (PostgreSQL)** cambiando únicamente la variable de entorno en `.env`, sin modificar código fuente.

### Archivo `.env` (Configuración de conexión)
```env
# Conexión PostgreSQL (Supabase Pooler o AWS RDS)
DATABASE_URL="postgresql://postgres.ghctgyzvbbxswicgobly:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
PORT=3001
```

> **Seguridad:** El archivo `.env` se encuentra explícitamente excluido en el `.gitignore` del proyecto. Las credenciales privadas y claves de acceso a la nube nunca se suben al repositorio.

---

## 6. Modelo y Tablas de la Base de Datos

### Diagrama Entidad-Relación

```
  USERS
  ─────────────────────────────────────
  id (UUID, PK)
  name (TEXT, NOT NULL)
  email (TEXT, UNIQUE)
  role (ENUM: student | tutor | admin)
  created_at (TIMESTAMP)
       │
       │ 1:N (un tutor puede tener muchos cursos)
       ▼
  COURSES
  ─────────────────────────────────────
  id (UUID, PK)
  title (TEXT, NOT NULL)
  description (TEXT)
  tutor_id (UUID, FK → users.id)
  created_at (TIMESTAMP)
       │
       │ 1:N (un curso puede tener muchas reservas)
       ▼
  BOOKINGS
  ─────────────────────────────────────
  id (UUID, PK)
  student_id (UUID, FK → users.id)
  course_id (UUID, FK → courses.id)
  scheduled_at (TIMESTAMP)
  status (ENUM: pending | confirmed | cancelled)
  created_at (TIMESTAMP)
```

---

## 7. Conexión mediante ORM (Prisma)

**Prisma ORM** permite interactuar con PostgreSQL desde TypeScript de forma tipada y segura, sin escribir SQL manualmente.

### Inicialización
```bash
npx prisma init
```

### Esquema: `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  role      Role
  createdAt DateTime  @default(now()) @map("created_at")
  courses   Course[]  @relation("TutorCourses")
  bookings  Booking[]

  @@map("users")
}

model Course {
  id          String    @id @default(uuid())
  title       String
  description String?
  tutorId     String?   @map("tutor_id")
  tutor       User?     @relation("TutorCourses", fields: [tutorId], references: [id])
  bookings    Booking[]
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("courses")
}

model Booking {
  id          String        @id @default(uuid())
  studentId   String        @map("student_id")
  courseId    String        @map("course_id")
  scheduledAt DateTime      @map("scheduled_at")
  status      BookingStatus @default(pending)
  createdAt   DateTime      @default(now()) @map("created_at")
  student     User          @relation(fields: [studentId], references: [id])
  course      Course        @relation(fields: [courseId], references: [id])

  @@map("bookings")
}

enum Role {
  student
  tutor
  admin
}

enum BookingStatus {
  pending
  confirmed
  cancelled
}
```

### Cliente Prisma (Singleton): `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

---

## 8. Migraciones

Las migraciones registran el historial de cambios en la estructura de la base de datos. Prisma las genera automáticamente desde el `schema.prisma`.

### Ejecutar la primera migración
```bash
npx prisma migrate dev --name init
```

Este comando:
1. Compara `schema.prisma` con el estado actual de la base de datos.
2. Genera el archivo SQL en `prisma/migrations/`.
3. Aplica los cambios directamente en Supabase.

### SQL generado automáticamente
```sql
CREATE TYPE "Role" AS ENUM ('student', 'tutor', 'admin');
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE "users" (
    "id"         TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "role"       "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courses" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "tutor_id"    TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookings" (
    "id"           TEXT NOT NULL,
    "student_id"   TEXT NOT NULL,
    "course_id"    TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status"       "BookingStatus" NOT NULL DEFAULT 'pending',
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

---

## 9. Operaciones CRUD

Ejemplo del controlador completo de **Usuarios** con todas las operaciones:

### `src/controllers/users.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// CREATE — POST /api/users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role } = req.body;
    const newUser = await prisma.user.create({ data: { name, email, role } });
    res.status(201).json(newUser);
  } catch (error) { next(error); }
};

// READ ALL — GET /api/users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) { next(error); }
};

// READ ONE — GET /api/users/:id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) { next(error); }
};

// UPDATE — PUT /api/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const updated = await prisma.user.update({ where: { id }, data: { name, email, role } });
    res.status(200).json(updated);
  } catch (error) { next(error); }
};

// DELETE — DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) { next(error); }
};
```

---

## 10. Validación de Datos

Se utiliza un middleware que valida los datos antes de que lleguen al controlador:

### `src/middlewares/validate.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, role } = req.body;
  const validRoles = ['student', 'tutor', 'admin'];

  if (!name || !email || !role) {
    return res.status(400).json({
      message: 'Los campos name, email y role son obligatorios.'
    });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      message: `Rol inválido. Debe ser: ${validRoles.join(', ')}.`
    });
  }
  next();
};

export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const { studentId, courseId, scheduledAt } = req.body;

  if (!studentId || !courseId || !scheduledAt) {
    return res.status(400).json({
      message: 'Los campos studentId, courseId y scheduledAt son obligatorios.'
    });
  }
  if (isNaN(new Date(scheduledAt).getTime())) {
    return res.status(400).json({
      message: 'scheduledAt debe ser una fecha válida (ej: 2026-10-20T10:00:00Z).'
    });
  }
  next();
};
```

---

## 11. Manejo de Errores

Un middleware centralizado captura todos los errores y responde de forma uniforme:

### `src/middlewares/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`);

  // Email duplicado (código Prisma P2002)
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Ya existe un registro con ese email.' });
  }

  // Recurso no encontrado (código Prisma P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'El recurso solicitado no fue encontrado.' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor.'
  });
};
```

---

## 12. Endpoints REST

### Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Código |
|---|---|---|---|
| `GET` | `/api/users` | Obtener todos los usuarios | `200` |
| `GET` | `/api/users/:id` | Obtener un usuario por ID | `200` |
| `POST` | `/api/users` | Crear un nuevo usuario | `201` |
| `PUT` | `/api/users/:id` | Actualizar un usuario | `200` |
| `DELETE` | `/api/users/:id` | Eliminar un usuario | `204` |

### Cursos (`/api/courses`)
| Método | Endpoint | Descripción | Código |
|---|---|---|---|
| `GET` | `/api/courses` | Obtener todos los cursos | `200` |
| `GET` | `/api/courses/:id` | Obtener un curso por ID | `200` |
| `POST` | `/api/courses` | Crear un nuevo curso | `201` |
| `PUT` | `/api/courses/:id` | Actualizar un curso | `200` |
| `DELETE` | `/api/courses/:id` | Eliminar un curso | `204` |

### Reservas (`/api/bookings`)
| Método | Endpoint | Descripción | Código |
|---|---|---|---|
| `GET` | `/api/bookings` | Obtener todas las reservas | `200` |
| `GET` | `/api/bookings/:id` | Obtener una reserva por ID | `200` |
| `POST` | `/api/bookings` | Crear una nueva reserva | `201` |
| `PUT` | `/api/bookings/:id` | Actualizar estado de reserva | `200` |
| `DELETE` | `/api/bookings/:id` | Eliminar una reserva | `204` |

---

## 13. JSON y Códigos HTTP

| Código | Nombre | Cuándo se usa |
|---|---|---|
| `200` | OK | Petición exitosa (GET, PUT) |
| `201` | Created | Recurso creado (POST) |
| `204` | No Content | Eliminación exitosa (DELETE) |
| `400` | Bad Request | Datos inválidos o faltantes |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Email duplicado u otro conflicto |
| `500` | Internal Server Error | Error inesperado del servidor |

### Ejemplo: Respuesta exitosa `POST /api/users`
```json
{
  "id": "a3f7c2e1-4b8d-4c2f-9e1a-123456789abc",
  "name": "Juan Pérez",
  "email": "juan@estudiante.edu",
  "role": "student",
  "createdAt": "2026-10-13T15:00:00.000Z"
}
```

### Ejemplo: Error `400 Bad Request`
```json
{
  "message": "Los campos name, email y role son obligatorios."
}
```

---

## 14. Documentación Básica de API

### Cómo ejecutar el proyecto localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git

# 2. Ir a la carpeta del backend
cd sistema-tutoriales-UPDS/backend

# 3. Instalar dependencias
npm install

# 4. Crear el archivo .env con las credenciales de Supabase
# DATABASE_URL="postgresql://..."

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar el servidor
npm run dev
# Disponible en: http://localhost:3001
```

### Scripts `package.json`
| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con recarga automática |
| `npm run build` | Compila TypeScript → JavaScript en `/dist` |
| `npm start` | Inicia el servidor compilado (producción) |
| `npx prisma studio` | Interfaz visual para explorar los datos |

### Herramientas de prueba recomendadas
- **Postman** o **Thunder Client** (extensión de VS Code) para probar los endpoints.
- **Prisma Studio** (`npx prisma studio`) para visualizar los datos en la base de datos.

---

## 15. Repositorio Actualizado

| Rama | Propósito |
|---|---|
| `main` | Rama principal estable (producción) |
| `develop` | Rama de desarrollo activo |
| `feature/actividad-2-backend-api` | Rama de entrega con API REST completa y conexión cloud |

**Enlace:** 👉 https://github.com/Marce0c0/Sistema-Tutorias-UPDS

El repositorio incluye:
- ✅ `.gitignore` actualizado (excluye `node_modules/`, `.env`, `dist/`)
- ✅ `README.md` con descripción, arquitectura y tecnologías
- ✅ Código del backend migrado a TypeScript
- ✅ Esquema de Prisma con los 3 modelos definidos (`User`, `Course`, `Booking`)
- ✅ Controladores tipados con Express 5 y validación por middlewares
- ✅ Soporte para despliegue en la nube
- ✅ Ramas activas en GitHub con control de versiones Git

---

## 16. Integración Cloud y Arquitectura Multi-Cloud: Amazon Web Services (AWS)

Como evolución hacia una infraestructura de producción moderna, escalable y de alta disponibilidad, el proyecto ha sido integrado exitosamente con los servicios de **Amazon Web Services (AWS)** bajo la modalidad de la **Nueva Experiencia de AWS**:

| Componente | Configuración en el Proyecto | Estado |
|---|---|---|
| **ID de Proyecto AWS** | `861358180738` | Vinculado |
| **Región de Cómputo** | `us-east-2` (Ohio) | Activa |
| **Herramientas de IA** | Agent Toolkit for AWS (24 skills oficiales) + AWS MCP Proxy | Instalado |
| **Política de Presupuesto** | **$0.00 USD (Estrictamente Capa Gratuita / Free Tier)** | Vigente |

### Servicios de AWS Implementados y Aprovisionados:

1. **Amazon S3 (Simple Storage Service):**
   - **Bucket:** `sistema-tutorias-upds-861358180738`
   - **ARN:** `arn:aws:s3:::sistema-tutorias-upds-861358180738`
   - **Región:** `us-east-2`
   - **Propósito:** Almacenamiento en la nube para materiales de estudio universitarios (guías, PDFs, diapositivas) y fotos de perfil de usuarios.
   - **Costo:** $0.00 (5 GB de almacenamiento Free Tier, 20,000 solicitudes GET y 2,000 PUT mensuales).

2. **Amazon RDS (PostgreSQL Administrado):**
   - **Identificador:** `tutorias-upds-db`
   - **Endpoint Público:** `tutorias-upds-db.c1guag0cedu9.us-east-2.rds.amazonaws.com:5432`
   - **Tipo de Instancia:** `db.t4g.micro` (AWS Graviton2)
   - **Motor:** PostgreSQL 16
   - **Almacenamiento:** 20 GB SSD gp3
   - **Seguridad:** Security Group `sg-0c661a90467974acd` con puerto 5432 habilitado
   - **Estado:** ✅ **Completamente funcional y sincronizado**
   - **Despliegue del Esquema:** Sincronizado mediante Prisma ORM (`npx prisma db push`).
   - **Datos de Prueba:** Poblado mediante script de Seed (`npm run prisma:seed`) con usuarios, tutores, cursos y reservas iniciales.

3. **Arquitectura Multi-Cloud Flexible:**
   - Gracias a la abstracción de **Prisma ORM**, la plataforma soporta alternancia instantánea entre **Supabase PostgreSQL** y **Amazon RDS PostgreSQL** simplemente alternando la variable de entorno `DATABASE_URL` en el archivo `.env`.

---

*Informe — Actividad 2 — Tecnología Web II — UPDS — Octubre 2026*

