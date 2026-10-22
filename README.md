# 🎓 Sistema de Tutorías UPDS
### Plataforma universitaria full stack para gestión académica de tutorías, cursos y recursos de estudio.

> **Repositorio oficial:** [github.com/Marce0c0/Sistema-Tutorias-UPDS](https://github.com/Marce0c0/Sistema-Tutorias-UPDS)  
> **Rama de entrega activa:** `feature/actividad-3-frontend-fullstack`  
> **Estado:** ✅ En desarrollo activo — Actividad 3 completada, Actividad 4 en planificación.

---

## 📋 ¿Qué es este proyecto?

**Sistema de Tutorías UPDS** es una plataforma web universitaria que conecta a **estudiantes**, **tutores** y **coordinadores académicos** de la Universidad Privada Domingo Savio (UPDS).

El sistema permite:
- 📚 Explorar el **catálogo de materias y cursos** con sus tutores asignados.
- 📅 Programar y **reservar sesiones de tutoría** presenciales o virtuales (Google Meet).
- ⭐ **Calificar y reseñar** a los tutores después de cada sesión (1–5 estrellas).
- 💬 Participar en **foros de dudas por materia** para resolver preguntas colectivamente.
- 📄 Acceder a **materiales de estudio y guías** alojados en Amazon S3.
- 🔔 Recibir **notificaciones y recordatorios** de reservas y actualizaciones.
- 👥 Administrar usuarios con tres roles diferenciados: **Estudiante**, **Tutor** y **Administrador**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Detalle |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | SPA (Single Page Application) modular sin frameworks |
| **Backend** | Node.js + TypeScript + Express 5 | API REST con arquitectura en capas (Router → Controller → Prisma) |
| **ORM** | Prisma 6 | Modelos relacionales + migraciones + seed automatizado |
| **Base de Datos** | PostgreSQL 17 | Instancia gratuita en **Supabase** (São Paulo, `sa-east-1`) |
| **Almacenamiento Cloud** | Amazon S3 | Bucket en la nube para almacenamiento de recursos y materiales |
| **Control de versiones** | Git + GitHub | Flujo `main ← develop ← feature/*` |
| **Despliegue** | Amazon S3 (hosting estático) | Script automatizado `frontend/deploy-s3.ps1` |

---

## 🗃️ Modelo de Datos — 8 Entidades Universitarias

El sistema está construido sobre **8 tablas relacionales** normalizadas en PostgreSQL:

```
users ──────────── courses ─────── tutorias ─── reviews
  │                   │                │
  ├── bookings ────────┘                └─── bookings
  ├── forum_messages ──────────────────────── courses
  ├── notifications
  ├── reviews (calificaciones ⭐)
  └── materials (recursos en S3 📄)
```

| # | Tabla SQL | Modelo | Descripción | Campos Clave |
|---|---|---|---|---|
| 1 | `users` | `User` | Personas del sistema (estudiantes, tutores, admins) | `role: student\|tutor\|admin`, `password` (opcional hasta Actividad 4) |
| 2 | `courses` | `Course` | Catálogo de materias universitarias | `title`, `tutorId → User` |
| 3 | `tutorias` | `Tutoria` | Sesiones de tutoría programadas | `date`, `maxStudents`, `modality: presencial\|virtual\|hibrida`, `location`, `meetingUrl` |
| 4 | `bookings` | `Booking` | Inscripciones y reservas de cupo | `status: pending\|confirmed\|cancelled`, relación a `Tutoria` y `Course` |
| 5 | `forum_messages` | `ForumMessage` | Dudas y consultas académicas por materia | `title`, `content`, autor y curso |
| 6 | `notifications` | `Notification` | Alertas y recordatorios | `type: info\|reminder\|booking_update\|forum_reply`, `isRead` |
| 7 | `reviews` | `Review` | Calificaciones de los estudiantes al tutor | `rating (1–5)`, `comment`, única por `(tutoriaId, studentId)` |
| 8 | `materials` | `Material` | Guías y documentos de estudio en S3 | `fileUrl`, `fileType: pdf\|slide\|doc\|link`, subido por tutor |

---

## 📁 Estructura del Repositorio

```
sistema-tutoriales-UPDS/
│
├── backend/                           ← API REST (Node.js + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma              ← 8 modelos + 5 enums
│   │   ├── seed.ts                    ← Datos iniciales (3 usuarios, 2 cursos, 2 tutorías...)
│   │   └── migrations/                ← Historial DDL versionado
│   ├── src/
│   │   ├── server.ts                  ← Punto de entrada Express (puerto 3001)
│   │   ├── controllers/               ← Lógica de negocio por entidad
│   │   │   ├── users.controller.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── tutorias.controller.ts
│   │   │   ├── bookings.controller.ts
│   │   │   ├── forums.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── reviews.controller.ts  ← ⭐ Calificaciones
│   │   │   └── materials.controller.ts← 📄 Recursos en S3
│   │   ├── routes/                    ← Routers Express (un archivo por entidad)
│   │   └── middlewares/
│   │       ├── validate.ts            ← Validación UUID, enums y esquemas de entrada
│   │       └── errorHandler.ts        ← Manejo centralizado de errores HTTP
│   ├── api.http                       ← Suite de pruebas REST Client (VS Code)
│   ├── .env.example                   ← Plantilla de variables de entorno
│   └── package.json
│
├── frontend/                          ← SPA (Vanilla HTML/CSS/JS)
│   ├── index.html                     ← Shell único de la aplicación
│   ├── css/styles.css                 ← Paleta UPDS (azul marino #002d62, rojo #e30613)
│   ├── img/upds-logo.png             ← Logo institucional oficial
│   ├── js/
│   │   ├── app.js                     ← Router del lado del cliente (hash-based)
│   │   ├── config/api.js             ← Base URL de la API
│   │   ├── state/store.js            ← Estado global del usuario activo
│   │   ├── components/
│   │   │   ├── Navbar.js             ← Navegación principal con logo UPDS
│   │   │   └── Modal.js              ← Modal reutilizable para formularios
│   │   ├── services/                  ← Capa de acceso a la API (fetch)
│   │   │   ├── usersService.js
│   │   │   ├── coursesService.js
│   │   │   ├── tutoriasService.js
│   │   │   ├── bookingsService.js
│   │   │   ├── forumsService.js
│   │   │   └── notificationsService.js
│   │   ├── utils/toast.js            ← Notificaciones tipo toast en pantalla
│   │   └── views/                    ← Vistas completas por sección
│   │       ├── DashboardView.js      ← Panel resumen con estadísticas
│   │       ├── UsersView.js          ← CRUD de usuarios con selector de rol
│   │       ├── CoursesView.js        ← CRUD de cursos y asignación de tutores
│   │       ├── TutoriasView.js       ← CRUD de tutorías + reserva rápida de cupos
│   │       ├── BookingsView.js       ← Gestión de reservas y cambio de estado
│   │       ├── ForumsView.js         ← Foro de dudas con filtrado por materia
│   │       └── NotificationsView.js  ← Bandeja de notificaciones con marca de leído
│   └── deploy-s3.ps1                 ← Script PowerShell de despliegue a AWS S3
│
├── CONTEXTO_PROYECTO.md              ← Documento técnico interno de referencia
├── Informe_Actividad3.md             ← Informe académico de la Actividad 3
└── .gitignore
```

---

## 🚀 Cómo Correr el Proyecto Localmente

### Pre-requisitos
- **Node.js** v18 o superior
- **npm** v9 o superior
- Una cuenta en [Supabase](https://supabase.com) (gratuita) con un proyecto PostgreSQL activo, o cualquier instancia PostgreSQL local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git
cd Sistema-Tutorias-UPDS
```

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar y completar las variables de entorno
cp .env.example .env
```

Editar `.env` y reemplazar con tus datos de Supabase (o base de datos local):

```env
PORT=3001
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
AWS_REGION="us-east-2"
AWS_S3_BUCKET_NAME="sistema-tutorias-upds"
```

### 3. Crear las tablas e insertar datos de prueba

```bash
# Aplica el esquema de 8 tablas a la base de datos
npx prisma db push

# Carga 3 usuarios + 2 cursos + 2 tutorías + reservas + reseñas + materiales
npm run prisma:seed
```

### 4. Arrancar el servidor backend

```bash
npm run dev
# → API disponible en http://localhost:3001
```

### 5. Servir el Frontend

En otra terminal (desde la raíz del repositorio):

```bash
# Con npx serve (no requiere instalación)
npx serve frontend -l 3000
# → SPA disponible en http://localhost:3000
```

---

## 🔌 Endpoints de la API (40 rutas en 8 recursos)

La API base es `http://localhost:3001/api/`. Todos los endpoints aceptan y devuelven JSON.

| Recurso | GET (listar) | GET (por ID) | POST (crear) | PUT (actualizar) | DELETE |
|---|---|---|---|---|---|
| `/api/users` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/courses` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/tutorias` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/bookings` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/forums` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/notifications` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/reviews` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/materials` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Filtros disponibles:**
- `GET /api/tutorias?courseId=<uuid>` — tutorías de un curso específico
- `GET /api/forums?courseId=<uuid>` — mensajes del foro de una materia
- `GET /api/notifications?userId=<uuid>` — notificaciones de un usuario
- `GET /api/reviews?tutoriaId=<uuid>` — reseñas de una tutoría
- `GET /api/materials?courseId=<uuid>` — materiales de un curso

Podés probar todos los endpoints desde VS Code usando el archivo `backend/api.http` con la extensión **REST Client**.

---

## 🏛️ Arquitectura del Sistema

```
                  [Navegador Web]
                        │
                [SPA Frontend :3000]
           HTML + CSS (paleta UPDS) + JS ES6+
            Router hash-based sin frameworks
                        │ fetch() / JSON
                        ▼
              [API REST Backend :3001]
              Express 5 + TypeScript
                        │
              [Middleware de Validación]
              UUID regex + enums + campos
                        │
              [Controladores Async]
              Lógica de negocio pura
                        │
               [Prisma ORM Client]
              Singleton global con pool
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
[Supabase PostgreSQL 17]       [Amazon S3 (us-east-2)]
  sa-east-1 São Paulo           Materiales de estudio
  8 tablas relacionales         + Hosting SPA estático
```

**Principios aplicados:**
- **Desacoplamiento total:** El frontend solo conoce la URL de la API. El backend no conoce HTML.
- **Arquitectura en capas:** Router → Middleware → Controller → Prisma. Sin acceso directo a la BD desde rutas.
- **Validación en frontera:** Todo UUID y enum se valida antes de llegar al controlador.
- **Cero dependencias externas en el frontend:** No se usa React, Vue, Angular ni ningún otro framework. Solo Web APIs nativas.

---

## ☁️ Infraestructura Cloud ($0.00 USD)

| Servicio | Proveedor | Costo | Descripción |
|---|---|---|---|
| **PostgreSQL 17** | Supabase (Free Tier) | **$0.00** | Base de datos relacional para desarrollo e integración |
| **S3 Static Hosting** | Amazon S3 (Free Tier) | **$0.00** | Hosting estático para el cliente SPA y recursos de estudio |
| **AWS CLI** | AWS SDK / CLI | **$0.00** | Herramientas de despliegue automatizado |

---

## 🗺️ Hoja de Ruta del Proyecto

| Actividad | Estado | Descripción |
|---|---|---|
| **Actividad 1** | ✅ Entregada | Planificación: casos de uso, DER, stack tecnológico |
| **Actividad 2** | ✅ Entregada | Backend API REST completa (30 endpoints, 6 entidades iniciales) |
| **Actividad 3** | ✅ Completada | Frontend SPA con CRUD completo consumiendo la API + deploy a S3 |
| **Actividad 4** | 🔜 Próxima | Autenticación y seguridad con JWT + bcrypt + login/registro |
| **Actividad 5** | 📋 Planificada | Vistas de Reviews y Materials + perfil de usuario |
| **Actividad 6** | 📋 Planificada | Despliegue productivo en AWS EC2 + CloudFront CDN + dominio HTTPS |

---

## 🧪 Datos de Prueba (incluidos en el Seed)

Al ejecutar `npm run prisma:seed` se insertan los siguientes registros:

| Tipo | Registro | Detalle |
|---|---|---|
| 👤 Estudiante | `juan@estudiante.com` | ID fijo para pruebas de reservas y reseñas |
| 👩‍🏫 Tutora | `maria@tutor.com` | Dicta ambos cursos y subió los materiales |
| 🔑 Admin | `admin@upds.edu.bo` | Coordinación Académica UPDS |
| 📚 Curso 1 | Matemáticas Aplicadas | Cálculo y álgebra lineal |
| 📚 Curso 2 | Programación Web II | Node.js + Express + TypeScript |
| 🗓️ Tutoría 1 | Taller APIs REST — Oct 22 | Presencial · Aula 302 Bloque B · con enlace Google Meet |
| 🗓️ Tutoría 2 | Resolución Cálculo I — Oct 24 | Virtual · enlace Google Meet |
| ✅ Reserva | Juan → Tutoría 1 | Estado: `confirmed` |
| ⭐ Reseña | Juan → Tutoría 1 | Rating: **5/5** · "Excelente explicación de los middlewares..." |
| 📄 Material 1 | Guía APIs RESTful (PDF) | Subido por María · Curso Web II · alojado en S3 |
| 📄 Material 2 | Formulario Integrales (PDF) | Subido por María · Matemáticas Aplicadas · alojado en S3 |

---

## 🤝 Contribuir / Flujo de Ramas

```
main          ← Versión estable y evaluada por el docente
  └── develop ← Integración de todas las features completadas
        └── feature/actividad-3-frontend-fullstack  ← Rama de trabajo actual
        └── feature/actividad-4-jwt-auth            ← (próxima)
```

Los commits siguen la convención **Conventional Commits**:  
`feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`

---

## 📄 Licencia

Proyecto académico — Universidad Privada Domingo Savio (UPDS).  
Desarrollado para la materia **Tecnología Web II**.
