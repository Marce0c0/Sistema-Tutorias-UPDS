# Sistema de Gestión de Cursos, Talleres & Hackathons (UPDS Cochabamba)

Plataforma universitaria full stack moderna para la gestión académica de tutorías, talleres prácticos, convocatorias a hackathons, reservas de sesiones con código QR y recursos educativos.

[![CloudFront CDN](https://img.shields.io/badge/AWS%20CloudFront-d3i4klrqeo94p9.cloudfront.net-FF9900?logo=amazon-aws&logoColor=white)](https://d3i4klrqeo94p9.cloudfront.net/)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Multi--Stage-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Express%205%20%2B%20Prisma%206-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20SPA%20(No%20Framework)-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)

- **Despliegue Global en Producción:** [https://d3i4klrqeo94p9.cloudfront.net/](https://d3i4klrqeo94p9.cloudfront.net/)
- **Repositorio Oficial:** [github.com/Marce0c0/Sistema-Tutorias-UPDS](https://github.com/Marce0c0/Sistema-Tutorias-UPDS)
- **Desarrollador:** Sammy Marcelo Sivila Sanchez ([@Marce0c0](https://github.com/Marce0c0)) — Universidad Privada Domingo Savio (UPDS) Sede Cochabamba.

---

## 1. Descripción del Proyecto

El **Sistema de Tutorías y Cursos UPDS** es una solución web integral diseñada bajo estándares institucionales de la **Universidad Privada Domingo Savio**. Conecta a estudiantes, tutores y administradores en un entorno ágil y reactivo, facilitando el agendamiento de reforzamiento académico, la inscripción a cursos técnicos con emisión inmediata de credenciales QR, y la colaboración continua mediante foros de debate y notificaciones en tiempo real.

### ✨ Capacidades Principales

1. **Catálogo de Cursos, Talleres & Hackathons:**
   - Exploración y filtrado en tiempo real por modalidad (presencial, virtual, híbrida), categoría y precio (gratuitos o con arancel).
   - Búsqueda instantánea insensible a mayúsculas y acentos.
2. **Gestión Autónoma para Docentes/Tutores (RBAC Extendido):**
   - Los docentes pueden **crear, editar y eliminar sus propios cursos y talleres**.
   - Acceso exclusivo al detalle del curso para visualizar el **listado de estudiantes inscritos en tiempo real** con información de contacto y fecha de inscripción.
3. **Pase Digital y Entrada con Código QR:**
   - Emisión instantánea de credencial de asistencia con código QR único tras confirmar una inscripción.
   - Compatible con simulador de exportación a **Google Wallet** y **Apple Wallet**, más descarga en alta resolución.
4. **Directorio Universitario Segmentado por Pestañas:**
   - Visualización por roles institucionales con conteo en vivo: **Todos**, **Estudiantes**, **Docentes/Tutores** y **Administradores**.
   - Búsqueda reactiva por nombre, carrera o correo institucional.
5. **Comunidad Académica y Foros de Consulta:**
   - Espacio colaborativo estructurado por temas: Consultas académicas, formación técnica y convocatorias de Hackathons municipales.
   - Filtros dinámicos por categoría y contador interactivo de respuestas.
6. **Centro de Notificaciones Interactivo:**
   - Pestañas de filtrado (Todas, No Leídas, Sistema), marcación masiva y navegación contextual hacia la sesión o curso asociado.
7. **Diseño Institucional UPDS & Distintivos Cloud:**
   - Paleta corporativa UPDS: Azul Marino (`#002855`), Rojo Carmesí (`#d9272e`) y Verde Bosque (`#006837`).
   - Sello oficial **"Powered by AWS"** en pantalla de carga (Splash), módulo de Login y pie de página.
   - Pie de página institucional con tarjeta de estado de nube activa y perfil del desarrollador.

---

## 2. Arquitectura de Nube & Despliegue en AWS

El sistema está optimizado para una arquitectura desacoplada y de **costo cero ($0.00 USD)** bajo la capa gratuita (Free Tier) de AWS y Supabase:

```
[ Usuarios / Navegadores ]
            │ (HTTPS Global)
            ▼
┌───────────────────────────────────────────────┐
│       Amazon CloudFront CDN (Edge SSL)        │
│       d3i4klrqeo94p9.cloudfront.net           │
└───────────────────────┬───────────────────────┘
                        │ (Proxy Reverso / Origen)
                        ▼
┌───────────────────────────────────────────────┐
│        Amazon EC2 (Ubuntu 24.04 LTS)          │
│        Docker Compose Multi-Container         │
│  ┌──────────────────┐   ┌──────────────────┐  │
│  │ Frontend (Nginx) │   │ Backend (Node20) │  │
│  │ Puerto 80        │   │ Puerto 3001      │  │
│  └─────────┬────────┘   └────────┬─────────┘  │
└────────────┼─────────────────────┼────────────┘
             │                     │ (Conexión SSL Pooler IPv4)
             ▼                     ▼
┌───────────────────────────────────────────────┐
│          Amazon S3 / Supabase DB              │
│  - Assets S3: sistema-tutorias-upds           │
│  - PostgreSQL 17: Supabase sa-east-1          │
└───────────────────────────────────────────────┘
```

### Automatización de Despliegues:
El repositorio incluye un script para desplegar a producción en un solo comando:
```powershell
# Empaqueta, transfiere vía SSH, reconstruye Docker en EC2 e invalida la caché de CloudFront
.\scripts\deploy-ec2.ps1
```

Y para apagar o encender el servidor de prueba sin incurrir en consumo de cómputo:
```powershell
.\scripts\aws-control.ps1 -Action status   # Consulta el estado del servidor
.\scripts\aws-control.ps1 -Action stop     # Pausa la instancia (Costo $0.00 compute)
.\scripts\aws-control.ps1 -Action start    # Reanuda la instancia
```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Rol en el Sistema |
| :--- | :--- | :--- |
| **Frontend Web** | Vanilla JavaScript (ES6+), HTML5, CSS3 | Single Page Application (SPA) reactiva sin dependencias pesadas de frameworks |
| **Servidor Web Edge** | Nginx 1.27 Alpine | Servidor web con compresión Gzip, cabeceras de seguridad HTTP y soporte SPA |
| **Backend API** | Node.js 20 LTS, Express 5, TypeScript | API REST con arquitectura en capas, validación estricta y tipado estático |
| **ORM & Modelado** | Prisma ORM 6.19 | Mapeo objeto-relacional, migraciones DDL automáticas y cliente tipado |
| **Base de Datos** | PostgreSQL 17 (Supabase Cloud) | Persistencia relacional conectada mediante Session Pooler IPv4 y SSL forzado |
| **Autenticación** | JWT (JSON Web Tokens) & Bcrypt | Control de acceso basado en roles (RBAC: Admin, Tutor, Student, Guest) |
| **CDN & Caching** | AWS CloudFront | Distribución global de contenido con certificado SSL wildcard gratuito |
| **Contenedores** | Docker & Docker Compose | Ambientes reproducibles multi-etapa con imágenes ultraligeras Alpine |

---

## 4. Estructura del Proyecto

```
sistema-tutoriales-UPDS/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Migraciones DDL versionadas en SQL
│   │   ├── schema.prisma           # Esquema relacional Prisma (8 modelos)
│   │   └── seed.ts                 # Script de población de datos iniciales
│   ├── src/
│   │   ├── controllers/            # Controladores REST (Users, Courses, Bookings, Forums, etc.)
│   │   ├── middlewares/            # Validadores de esquemas y manejador global de errores
│   │   ├── routes/                 # Enrutadores Express tipados
│   │   ├── lib/prisma.ts           # Singleton del cliente Prisma
│   │   └── server.ts               # Servidor Express principal
│   ├── Dockerfile                  # Construcción multi-stage de producción
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   └── styles.css              # Sistema de diseño corporativo UPDS y responsive layout
│   ├── img/
│   │   ├── upds-logo.png           # Isotipo oficial UPDS
│   │   └── powered-by-aws.png      # Logo oficial de infraestructura AWS Cloud
│   ├── js/
│   │   ├── components/             # Navbar, Modal, TicketModal (QR), Toast, Badge, Pagination
│   │   ├── config/env.js           # Variables de entorno y almacenamiento seguro
│   │   ├── services/api.js         # Cliente HTTP modular con interceptor JWT
│   │   ├── state/store.js          # Gestor de estado reactivo global (Observer Pattern)
│   │   ├── utils/                  # Generador QR (qrcode.js), permisos RBAC, datos de foros
│   │   └── views/                  # Vistas SPA: Dashboard, Courses, Tutorias, Bookings, Forums, Users, Welcome
│   ├── index.html                  # Punto de entrada SPA y Splash Screen
│   ├── nginx.conf                  # Configuración optimizada de Nginx
│   └── Dockerfile                  # Contenedor frontend
│
└── scripts/
    ├── deploy-ec2.ps1              # Despliegue automatizado a EC2 + Invalidation CloudFront
    ├── aws-control.ps1             # Gestor de ciclo de vida EC2 (start/stop/status)
    └── test_forum_post.js          # Script de prueba rápida para la API de foros
```

---

## 5. Endpoints de la API REST

| Método | Endpoint | Acceso Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autenticación con correo y clave. Retorna token JWT y perfil. |
| `POST` | `/api/auth/register` | Público | Registro institucional de nuevos estudiantes. |
| `GET` | `/api/courses` | Público / Invitado | Listado de cursos activos. Admite `?buscar=termino`. |
| `POST` | `/api/courses` | Admin / Tutor | Creación de curso. Asigna automáticamente el tutor en sesión. |
| `PUT` | `/api/courses/:id` | Admin / Tutor (dueño)| Edición de curso propio o gestión global por Admin. |
| `DELETE` | `/api/courses/:id` | Admin / Tutor (dueño)| Eliminación controlada de curso. |
| `GET` | `/api/courses/:id/attendees`| Admin / Tutor (dueño)| Listado en tiempo real de inscritos en el curso. |
| `GET` | `/api/tutorias` | Público / Invitado | Catálogo de sesiones de tutoría y cupos disponibles. |
| `POST` | `/api/tutorias` | Admin / Tutor | Programación de nueva sesión académica presencial o virtual. |
| `GET` | `/api/bookings` | Estudiante / Admin | Reservas e inscripciones del usuario autenticado. |
| `POST` | `/api/bookings` | Estudiante | Reserva de cupo con validación de capacidad. |
| `PATCH` | `/api/bookings/:id/cancel` | Estudiante / Admin | Cancelación de reserva con motivo y auditoría. |
| `GET` | `/api/forums` | Público / Estudiante | Hilos y discusiones por materia o hackathon. |
| `POST` | `/api/forums` | Estudiante / Docente | Publicación de nueva consulta académica. |
| `GET` | `/api/users` | Público (Sanitizado) | Directorio universitario (excluye contraseñas por seguridad). |

---

## 6. Guía de Ejecución Local

### Prerrequisitos
- Node.js 20 LTS o superior
- Git
- Docker & Docker Compose (opcional para ejecución contenerizada)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git
cd Sistema-Tutorias-UPDS
```

### 2. Configurar y Levantar Backend
```bash
cd backend
npm install

# Crear archivo de entorno basado en la plantilla
cp .env.example .env

# Sincronizar esquema con la base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor en modo desarrollo
npm run dev
```
El servidor backend escuchará en `http://localhost:3001`.

### 3. Levantar Frontend Web
En otra terminal desde la raíz:
```bash
cd frontend
npx serve -p 3000 -s
```
Abre tu navegador en `http://localhost:3000`.

---

## 7. Cuentas de Demostración Rápida

La base de datos cuenta con perfiles de prueba preconfigurados con la contraseña `Upds2026`:

| Rol | Correo Electrónico | Permisos en la Plataforma |
| :--- | :--- | :--- |
| **Administrador** | `admin@upds.edu.bo` | Control total: gestión de usuarios, cursos, auditoría y cancelaciones. |
| **Docente / Tutor** | `maria@tutor.com` | Crear y gestionar sus propios cursos/talleres y ver inscritos. |
| **Estudiante** | `juan@estudiante.com` | Inscripción a cursos, emisión de pase QR y participación en foros. |
| **Modo Invitado** | *(Botón en pantalla inicial)* | Navegación de lectura pública sin necesidad de registro ni contraseña. |

---

## 8. Licencia & Créditos

Proyecto desarrollado con fines académicos y de producción para la **Universidad Privada Domingo Savio (UPDS) — Sede Cochabamba**.  
**Autor:** Sammy Marcelo Sivila Sanchez ([GitHub: Marce0c0](https://github.com/Marce0c0)).
