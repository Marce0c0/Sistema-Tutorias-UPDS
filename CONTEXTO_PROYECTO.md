# 📚 Contexto Completo del Proyecto
# Sistema-Tutoriales-UPDS

> Documento de referencia para retomar el trabajo en cualquier sesión.  
> Última actualización: **Octubre 2026**

---

## 🧑‍💻 Información del Desarrollador

| Campo | Valor |
|---|---|
| **Nombre** | Sammy Marcelo Sivila Sanchez |
| **Usuario GitHub** | [Marce0c0](https://github.com/Marce0c0) |
| **Repositorio** | [Sistema-Tutorias-UPDS](https://github.com/Marce0c0/Sistema-Tutorias-UPDS) |
| **Materia** | Tecnología Web II — UPDS |

---

## 🎯 Descripción del Proyecto

**Sistema-Tutoriales-UPDS** es una plataforma web universitaria diseñada para:
- Conectar a **estudiantes** con **tutores** de manera organizada.
- Permitir la **reserva de sesiones de tutoría** en tiempo real.
- Gestionar un **catálogo de cursos y materias** con sus respectivos tutores.
- Ofrecer un **panel de seguimiento** para medir el avance y rendimiento académico.
- Enviar **notificaciones y recordatorios** de próximas sesiones.
- Tener **foros por materia** para resolver dudas colectivamente.

---

## 📦 Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Lenguaje Backend** | TypeScript | ^5.8 |
| **Runtime** | Node.js | v18+ |
| **Framework Backend** | Express | ^5.2 |
| **ORM** | Prisma | ^6.19 |
| **Base de Datos** | PostgreSQL | v17 |
| **Cloud DB** | Supabase | — |
| **Frontend** | HTML, CSS, JavaScript Vainilla | — |
| **Control de Versiones** | Git + GitHub | — |

---

## ☁️ Servicios y Credenciales

### Supabase
| Campo | Valor |
|---|---|
| **Proyecto** | Sistema-Tutoriales-UPDS |
| **Project ID** | `ghctgyzvbbxswicgobly` |
| **Organización** | `Marce0c0` (org slug: `bkpptoridfyczjlhauuj`) |
| **Región** | `sa-east-1` (South America - São Paulo) |
| **Host Pooler (IPv4)** | `aws-1-sa-east-1.pooler.supabase.com` |
| **Puerto Pooler** | `5432` (Session Mode) / `6543` (Transaction Mode) |
| **DB Versión** | PostgreSQL 17.11 |
| **Estado** | `ACTIVE_HEALTHY` ✅ |

> ⚠️ La `DATABASE_URL` completa con la contraseña se guarda SOLO en el archivo `.env` local (protegido por `.gitignore`, nunca en GitHub).

### AWS (Amazon Web Services — Nueva Experiencia)
| Campo | Valor |
|---|---|
| **Proyecto / Cuenta AWS** | `861358180738` |
| **Región seleccionada** | `us-east-2` (Ohio) |
| **Perfil CLI** | `default` |
| **Autenticación** | `aws login` (SSO / Browser OAuth — Rol `AccountFullAccessRole`) |
| **Herramientas de IA** | Agent Toolkit for AWS (24 skills) + AWS MCP Proxy |
| **Presupuesto / Límite de Gasto** | **$0.00 - Máx $0.01 USD** (Estrictamente Capa Gratuita / Free Tier) |

#### Recursos Activos en AWS:
1. **Amazon S3 (Simple Storage Service):**
   - **Nombre del Bucket:** `sistema-tutorias-upds-861358180738` ✅
   - **ARN:** `arn:aws:s3:::sistema-tutorias-upds-861358180738`
   - **Región:** `us-east-2`
   - **Propósito:** Almacenamiento en la nube para materiales de estudio de las materias (PDFs, diapositivas) y fotos de perfil de tutores y estudiantes.
   - **Capa Gratuita:** 5 GB de almacenamiento estándar, 20,000 solicitudes GET y 2,000 solicitudes PUT sin costo mensual.
   - **Integración:** `@aws-sdk/client-s3` y `multer` en el backend Express.
2. **Amazon RDS (PostgreSQL):**
   - **Identificador de Instancia:** `tutorias-upds-db` ✅ *(Activa y Sincronizada)*
   - **Endpoint Público:** `tutorias-upds-db.c1guag0cedu9.us-east-2.rds.amazonaws.com:5432`
   - **ARN:** `arn:aws:rds:us-east-2:861358180738:db:tutorias-upds-db`
   - **Tipo de Instancia:** `db.t4g.micro` (AWS Graviton2, Free Tier elegible)
   - **Motor:** PostgreSQL 16
   - **Almacenamiento:** 20 GB SSD gp3 (Límite máximo fijo en 20 GB sin autoescalado de costo)
   - **Security Group:** `sg-0c661a90467974acd` (`rds-postgres-tutorias-sg` - Puerto 5432 abierto)
   - **Usuario Administrador:** `postgres`
   - **Sincronización:** Esquema de Prisma (`prisma db push`) y Seed de datos iniciales (`npm run prisma:seed`) aplicados exitosamente.
   - **Estrategia Multi-Cloud:** 100% transparente con Prisma ORM (permite alternar entre Supabase y AWS RDS cambiando la variable `DATABASE_URL` en `.env`).
3. **AWS App Runner / EC2 (Planificado):**
   - **Propósito:** Alojamiento y ejecución del backend en contenedores o máquina virtual Linux.
4. **AWS CloudFront + S3 (Planificado):**
   - **Propósito:** Hosting estático para la SPA del frontend con distribución global (CDN) y certificado SSL gratuito (ACM).

> 🛑 **Regla de Oro Presupuestaria de AWS ($0.00 USD):**  
> Ningún agente o desarrollador puede aprovisionar recursos de pago. Cualquier recurso creado debe ser 100% elegible para el Free Tier o de configuración local. Ante cualquier duda de facturación, se debe solicitar confirmación previa del usuario.

### GitHub
| Campo | Valor |
|---|---|
| **URL** | https://github.com/Marce0c0/Sistema-Tutorias-UPDS |
| **Rama principal** | `main` |
| **Rama de desarrollo** | `develop` |
| **Rama de feature actual** | `feature/actividad-2-backend-api` |

---

## 📁 Estructura de Archivos Actual

```
sistema-tutoriales-UPDS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            ← Modelos de la BD (User, Course, Booking)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── users.controller.ts  ← CRUD de usuarios
│   │   │   ├── courses.controller.ts← CRUD de cursos
│   │   │   └── bookings.controller.ts← CRUD de reservas
│   │   ├── routes/
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   └── bookings.routes.ts
│   │   ├── middlewares/
│   │   │   ├── validate.ts          ← Validación de datos de entrada
│   │   │   └── errorHandler.ts      ← Manejo centralizado de errores
│   │   ├── lib/
│   │   │   └── prisma.ts            ← Cliente Prisma (singleton)
│   │   └── server.ts                ← Punto de entrada del servidor
│   ├── .env                         ← ⚠️ NO subir a GitHub (contiene credenciales)
│   ├── .env.example                 ← Plantilla del .env (sí va a GitHub)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                        ← Pendiente (Actividades 3-6)
├── CONTEXTO_PROYECTO.md             ← Este documento de referencia
├── .gitignore
└── README.md
```

---

## 🗃️ Modelo de Base de Datos

### Tabla `users`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `role` | ENUM | `student`, `tutor`, `admin` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### Tabla `courses`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | Opcional |
| `tutor_id` | UUID | FK → `users.id` (SET NULL on delete) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### Tabla `bookings`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `student_id` | UUID | FK → `users.id` (CASCADE on delete) |
| `course_id` | UUID | FK → `courses.id` (CASCADE on delete) |
| `scheduled_at` | TIMESTAMP | NOT NULL |
| `status` | ENUM | `pending`, `confirmed`, `cancelled` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### Relaciones
```
User (tutor) ──── 1:N ──── Course
User (student) ── 1:N ──── Booking
Course ─────────── 1:N ──── Booking
```

---

## 🌐 Endpoints de la API

**Base URL local:** `http://localhost:3001`

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Listar todos |
| GET | `/api/users/:id` | Obtener uno (incluye cursos y reservas) |
| POST | `/api/users` | Crear (requiere: name, email, role) |
| PUT | `/api/users/:id` | Actualizar (campos opcionales) |
| DELETE | `/api/users/:id` | Eliminar |

### Cursos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/courses` | Listar todos (incluye tutor) |
| GET | `/api/courses/:id` | Obtener uno (incluye tutor y reservas) |
| POST | `/api/courses` | Crear (requiere: title; opcional: description, tutorId) |
| PUT | `/api/courses/:id` | Actualizar |
| DELETE | `/api/courses/:id` | Eliminar |

### Reservas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/bookings` | Listar todas (ordenadas por fecha) |
| GET | `/api/bookings/:id` | Obtener una (incluye estudiante y curso) |
| POST | `/api/bookings` | Crear (requiere: studentId, courseId, scheduledAt) |
| PUT | `/api/bookings/:id` | Actualizar estado (requiere: status) |
| DELETE | `/api/bookings/:id` | Eliminar |

---

## ⚙️ Cómo Levantar el Proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git
cd sistema-tutoriales-UPDS/backend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env (copiar de .env.example y poner la contraseña real)
# En Windows PowerShell:
Copy-Item .env.example .env

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Sincronizar modelos con la base de datos de Supabase
npx prisma db push

# 6. Iniciar el servidor en modo desarrollo
npm run dev

# ✅ El servidor está en: http://localhost:3001
```

### Scripts disponibles
| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática (ts-node-dev) |
| `npm run build` | Compila TypeScript → `/dist` |
| `npm start` | Ejecuta el build compilado |
| `npx prisma studio` | Interfaz visual interactiva de la BD |
| `npx prisma db push` | Sincroniza el esquema con Supabase |

---

## 📋 Historial de Actividades de la Materia

| Actividad | Título | Estado | Entrega |
|---|---|---|---|
| **01** | Introducción a Node.js y Express (Rutas básicas) | ✅ Completada | 18/10/2026 |
| **02** | Backend, Base de Datos y API REST | ✅ Completada | 18/10/2026 |
| **03** | — | ⏳ Pendiente | — |
| **04** | — | ⏳ Pendiente | — |
| **05** | — | ⏳ Pendiente | — |
| **06** | — | ⏳ Pendiente | — |

---

*Documento de contexto — Sistema-Tutoriales-UPDS — UPDS — Octubre 2026*
