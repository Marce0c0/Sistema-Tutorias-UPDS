# Sistema de Tutorías y Cursos Universitarios (UPDS)

Plataforma universitaria full stack para la gestión académica de tutorías, cursos extracurriculares, reservas de sesiones y recursos educativos.

Repositorio oficial: [github.com/Marce0c0/Sistema-Tutorias-UPDS](https://github.com/Marce0c0/Sistema-Tutorias-UPDS)

---

## 1. Descripción del Proyecto

El **Sistema de Tutorías y Cursos UPDS** es una solución integral orientada a optimizar el acompañamiento académico entre estudiantes, docentes tutores y coordinadores universitarios. La plataforma unifica el agendamiento de clases de reforzamiento, el catálogo de cursos extracurriculares y talleres prácticos, la gestión de foros de consulta por materia y la evaluación de la calidad de tutoría mediante reseñas estudiantiles.

### Capacidades Principales
- **Catálogo de Cursos y Talleres:** Exploración, filtrado y búsqueda en tiempo real de programas académicos con búsqueda insensible a mayúsculas y control de disponibilidad.
- **Gestión y Reserva de Tutorías:** Programación de sesiones presenciales o virtuales (con enlace a Google Meet), control estricto de cupos máximos y prevención de solapamiento de horarios.
- **Autenticación y Control de Acceso (RBAC):** Sesiones seguras mediante tokens JWT con tres niveles de privilegios: Administrador, Tutor y Estudiante, más navegación en modo invitado para consulta pública.
- **Foros Académicos por Curso:** Espacio colaborativo de preguntas y respuestas entre alumnos y tutores para resolución de dudas.
- **Calificaciones y Reseñas:** Sistema de feedback estudiantil de 1 a 5 estrellas con comentarios para evaluar el desempeño docente.
- **Materiales de Estudio:** Enlaces y recursos académicos centralizados y protegidos en la nube.
- **Notificaciones del Sistema:** Bandeja interactiva de avisos sobre reservas confirmadas, actualizaciones de sesiones y respuestas en foros.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+ Modules) | Single Page Application (SPA) modular, reactiva sin dependencias de frameworks pesados |
| **Backend API** | Node.js 20 LTS, Express 5, TypeScript | API REST tipada bajo arquitectura por capas (Rutas, Controladores, Middlewares, ORM) |
| **ORM & Modelado** | Prisma ORM 6 | Mapeo objeto-relacional, validación de esquemas y generación de tipos TypeScript |
| **Base de Datos** | PostgreSQL 17 (Supabase Cloud) | Persistencia relacional con SSL forzado, índices y restricciones de integridad |
| **Seguridad** | JSON Web Tokens (JWT), Bcrypt | Autenticación basada en tokens, hashing seguro de contraseñas y autorización por roles |
| **Contenedores** | Docker & Docker Compose | Entorno reproducible multi-etapa para desarrollo y producción |
| **Hosting Cloud** | Amazon Web Services (AWS S3) | Alojamiento y despliegue del frontend estático bajo el Free Tier ($0.00 USD) |

---

## 3. Modelo de Datos Relacional

El sistema opera sobre **8 entidades normalizadas** en PostgreSQL:

```
users (estudiantes, tutores, admins)
  ├── courses (cursos y talleres) ─────────────── tutorias (sesiones presenciales / virtuales)
  │     ├── forum_messages (foros de dudas)        ├── bookings (reservas de cupo)
  │     └── materials (guías y recursos S3)        └── reviews (calificaciones 1-5 ⭐)
  └── notifications (avisos y recordatorios)
```

### Resumen de Entidades:
1. **users:** Cuentas institucionales con roles (`student`, `tutor`, `admin`), correo verificado y contraseña hasheada.
2. **courses:** Catálogo de cursos con título único normalizado, descripción, tutor asignado y estado `activo` (booleano).
3. **tutorias:** Clases extra y sesiones con fecha/hora, cupo límite, modalidad (`presencial`, `virtual`, `hibrida`) y enlace de reunión.
4. **bookings:** Inscripción de estudiantes a tutorías con estados (`pending`, `confirmed`, `cancelled`).
5. **forum_messages:** Hilos de discusión académica asociados a cada curso.
6. **reviews:** Evaluaciones estudiantiles únicas por sesión con puntaje y reseña cualitativa.
7. **materials:** Recursos bibliográficos y enlaces de descarga organizados por curso.
8. **notifications:** Bandeja de eventos y alertas automáticas por usuario.

---

## 4. Endpoints de la API REST

Todos los endpoints retornan respuestas estándar en formato JSON:

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de nuevos estudiantes.
- `POST /api/auth/login` - Inicio de sesión y generación de token JWT.
- `GET /api/auth/me` - Perfil del usuario autenticado.

### Cursos y Talleres (`/api/courses`)
- `GET /api/courses` - Listado general de cursos. Soporta búsqueda parametrizada opcional: `?buscar=nombre`.
- `GET /api/courses/:id` - Detalle de un curso específico por UUID.
- `POST /api/courses` - Creación de curso (Solo Admin). Valida título obligatorio, previene duplicados (`409 Conflict`) y asigna estado `activo: true` por defecto.
- `PUT /api/courses/:id` - Actualización de título, descripción o estado `activo` (Solo Admin).
- `DELETE /api/courses/:id` - Eliminación de curso y desvinculación de dependencias (Solo Admin).

### Tutorías y Sesiones (`/api/tutorias`)
- `GET /api/tutorias` - Listado de tutorías activas con filtrado por fecha, curso o modalidad.
- `GET /api/tutorias/:id` - Detalle de sesión y cupos disponibles en tiempo real.
- `POST /api/tutorias` - Programación de nueva tutoría (Admin y Tutor).
- `PUT /api/tutorias/:id` - Edición de horario o modalidad.
- `DELETE /api/tutorias/:id` - Cancelación de sesión.

### Reservas (`/api/bookings`)
- `GET /api/bookings` - Listado de reservas del usuario en sesión.
- `POST /api/bookings` - Solicitud de cupo para una tutoría con validación de capacidad.
- `PATCH /api/bookings/:id/status` - Cambio de estado de la reserva (`confirmed` / `cancelled`).

### Foros y Consultas (`/api/forums`)
- `GET /api/forums/course/:courseId` - Mensajes del foro de un curso específico.
- `POST /api/forums` - Publicación de nueva consulta académica.
- `DELETE /api/forums/:id` - Moderación de mensajes (Admin y autor).

---

## 5. Arquitectura y Seguridad

- **Consultas Parametrizadas:** Toda la interacción con PostgreSQL se ejecuta mediante el motor de Prisma ORM con sentencias preparadas nativas (`$1`, `$2`), eliminando cualquier riesgo de inyección SQL.
- **Normalización de Datos:** Limpieza estricta de cadenas mediante `.trim()` y comparaciones insensibles a mayúsculas (`mode: 'insensitive'`) para evitar registros duplicados redundantes.
- **Validación de Tipos en Tiempo de Ejecución:** Validación estricta de tipos de datos JSON (como booleanos nativos para estados) rechazando valores ambiguos con códigos HTTP apropiados (`400 Bad Request`).
- **Variables de Entorno Aisladas:** Secretos de infraestructura (`DATABASE_URL`, `JWT_SECRET`) protegidos localmente en `.env` y excluidos del repositorio mediante `.gitignore`.

---

## 6. Instalación y Ejecución Local

### Prerrequisitos
- Node.js 20 LTS o superior
- npm 10+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git
cd Sistema-Tutorias-UPDS
```

### 2. Configurar y levantar el Backend
```bash
cd backend
npm install

# Configurar variables de entorno basadas en la plantilla
cp .env.example .env

# Generar cliente de Prisma y sincronizar esquema
npx prisma generate
npx prisma db push

# Compilar TypeScript e iniciar servidor
npm run build
npm run dev
```
El backend iniciará en `http://localhost:3001`.

### 3. Levantar el Frontend
En otra terminal dentro de la raíz del proyecto:
```bash
cd frontend
npx serve -p 3000 -s
```
Accede a la plataforma web desde tu navegador en `http://localhost:3000`.

---

## 7. Despliegue con Docker Compose

Para ejecutar toda la infraestructura en contenedores aislados:
```bash
# En la raíz del repositorio:
docker compose up -d --build
```
Servicios levantados:
- **Frontend SPA:** `http://localhost:8080` (Nginx Alpine optimizado).
- **Backend API:** `http://localhost:3001` (Node.js 20 Alpine en TypeScript).
- **PostgreSQL Local:** puerto `5432` con volumen persistente para datos locales.

---

## 8. Despliegue Estático en AWS S3

El frontend estático cuenta con un script de sincronización automatizado hacia Amazon S3:
```powershell
./frontend/deploy-s3.ps1
```
El script sincroniza los archivos HTML, CSS, JS e imágenes hacia el bucket de AWS configurado con políticas de caché optimizadas y costo cero dentro del Free Tier.

---

## Licencia
Proyecto desarrollado con fines académicos para la Universidad Privada Domingo Savio (UPDS).
