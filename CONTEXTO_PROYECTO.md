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
   - **Propósito:** Almacenamiento en la nube para materiales de estudio (PDFs, diapositivas) y futuro hosting estático del Frontend SPA.
   - **Capa Gratuita:** 5 GB de almacenamiento estándar, 20,000 solicitudes GET y 2,000 solicitudes PUT sin costo mensual.
   - **Configuración:** Versionado deshabilitado, tamaño 0 bytes (control total de acumulación).
2. **Amazon RDS (PostgreSQL):**
   - **Identificador de Instancia:** `tutorias-upds-db` ✅ *(Sincronizada con Free Tier)*
   - **Endpoint Público:** `tutorias-upds-db.c1guag0cedu9.us-east-2.rds.amazonaws.com:5432`
   - **ARN:** `arn:aws:rds:us-east-2:861358180738:db:tutorias-upds-db`
   - **Tipo de Instancia:** `db.t4g.micro` (AWS Graviton2, Free Tier elegible)
   - **Motor:** PostgreSQL 16
   - **Almacenamiento:** 20 GB SSD gp3 fijo (`AllocatedStorage: 20`, `MaxAllocatedStorage: 20`, autoescalado deshabilitado)
   - **Multi-AZ:** `false` (Instancia única dentro de cuota)
   - **Estrategia FinOps:** Operación bajo demanda. Puede detenerse temporalmente (`aws rds stop-db-instance`) cuando no se use activamente, utilizando Supabase como DB primaria en `.env`.

#### 🚀 Estrategia de Despliegue a Costo $0.00 USD:
- **Frontend (Actividades 3-6):** Alojamiento estático en el bucket existente **Amazon S3 (`sistema-tutorias-upds-861358180738`)** + **Amazon CloudFront CDN** (Always Free: 1 TB de salida/mes, 10M peticiones/mes y certificado SSL HTTPS gratuito mediante ACM). Costo: **$0.00 USD**.
- **Backend (API REST):**
  - *Desarrollo y Presentación Académica:* Ejecución en entorno local (`http://localhost:3001`).
  - *Cloud Serverless (Opcional):* Despliegue en **AWS Lambda** + **API Gateway HTTP** (Always Free: 1 millón de peticiones gratis/mes, $0.00 cuando no hay tráfico).
- **Base de Datos Dual Resiliente:**
  - **Supabase (`ghctgyzvbbxswicgobly`):** PostgreSQL 17 en la nube activo 24/7 sin consumo de cuotas horarias de AWS ni costos de IP pública IPv4.
  - **Amazon RDS (`tutorias-upds-db`):** PostgreSQL en AWS para sincronización y validación cloud, controlable mediante encendido/apagado programado.

---

> 🛑 **REGLA DE ORO PRESUPUESTARIA DE AWS ($0.00 USD - MÁX $0.01 USD):**  
> El proyecto tiene una política estricta de **PRESUPUESTO CERO**. Todo recurso debe ser 100% elegible para la Capa Gratuita (Free Tier) o ejecutarse localmente.

> ⛔ **LISTA NEGRA DE SERVICIOS PROHIBIDOS (RIESGO FINANCIERO / COSTOS FIJOS):**  
> Queda **TERMINANTEMENTE PROHIBIDO** a cualquier agente de IA, desarrollador o script aprovisionar:
> 1. **AWS App Runner:** NO posee Free Tier. Cobra por vCPU y memoria aprovisionada por segundo incluso con 0 tráfico (además con bloqueo explícito por Service Control Policy de la organización).
> 2. **AWS Fargate / ECS con IP pública:** Cobro continuo por ejecución de tareas de contenedores.
> 3. **Application / Network Load Balancers (ALB / NLB):** Cargo base fijo de ~$16 a $22 USD/mes + LCUs.
> 4. **NAT Gateways:** Cargo base fijo de ~$32 USD/mes + transferencia por GB.
> 5. **Direcciones IPv4 Públicas / Elastic IPs adicionales o desasociadas:** Cobro de $0.005 USD/hora por IPv4 pública no cubierta por la cuota de EC2.
> 6. **Amazon RDS Multi-AZ o Autoescalado de Disco:** Duplica el costo de cómputo y genera cargos por almacenamiento superior a 20 GB.
> 7. **Performance Insights con retención extendida (> 7 días) o Provisioned IOPS (io1/io2).**

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
│   │   ├── migrations/
│   │   │   └── 20261015000000_init_full_schema/
│   │   │       └── migration.sql      ← Script DDL versionado con 6 tablas y 4 enums
│   │   ├── schema.prisma              ← Modelos (User, Course, Tutoria, Booking, ForumMessage, Notification)
│   │   └── seed.ts                    ← Población automatizada de datos iniciales
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── users.controller.ts    ← CRUD de usuarios
│   │   │   ├── courses.controller.ts  ← CRUD de cursos
│   │   │   ├── tutorias.controller.ts ← CRUD de tutorías
│   │   │   ├── bookings.controller.ts ← CRUD de reservas
│   │   │   ├── forums.controller.ts   ← CRUD de foro
│   │   │   └── notifications.controller.ts ← CRUD de notificaciones
│   │   ├── routes/
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── tutorias.routes.ts
│   │   │   ├── bookings.routes.ts
│   │   │   ├── forums.routes.ts
│   │   │   └── notifications.routes.ts
│   │   ├── middlewares/
│   │   │   ├── validate.ts            ← Validación de UUIDs, enums y esquemas
│   │   │   └── errorHandler.ts        ← Manejo centralizado de errores
│   │   ├── lib/
│   │   │   └── prisma.ts              ← Cliente Prisma (singleton)
│   │   └── server.ts                  ← Punto de entrada del servidor Express
│   ├── api.http                       ← Suite de pruebas REST Client (VS Code)
│   ├── .env                           ← ⚠️ NO subir a GitHub (contiene credenciales)
│   ├── .env.example                   ← Plantilla del .env (sí va a GitHub)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                          ← Pendiente (Actividades 3-6)
├── CONTEXTO_PROYECTO.md               ← Este documento de referencia
├── Informe_Actividad2.md              ← Informe académico técnico oficial
├── .gitignore
└── README.md
```

---

## 🗃️ Modelo de Base de Datos (6 Entidades)

### 1. `users`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `role` | ENUM | `student`, `tutor`, `admin` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 2. `courses`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | Opcional |
| `tutor_id` | UUID | FK → `users.id` (SET NULL on delete) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 3. `tutorias`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `course_id` | UUID | FK → `courses.id` (CASCADE on delete) |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | Opcional |
| `date` | TIMESTAMP | NOT NULL |
| `max_students` | INT | NOT NULL DEFAULT 10 |
| `status` | ENUM | `active`, `completed`, `cancelled` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 4. `bookings`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `student_id` | UUID | FK → `users.id` (CASCADE on delete) |
| `course_id` | UUID | FK → `courses.id` (CASCADE on delete) |
| `tutoria_id` | UUID | FK → `tutorias.id` (SET NULL on delete, opcional) |
| `scheduled_at` | TIMESTAMP | NOT NULL |
| `status` | ENUM | `pending`, `confirmed`, `cancelled` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 5. `forum_messages`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `course_id` | UUID | FK → `courses.id` (CASCADE on delete) |
| `user_id` | UUID | FK → `users.id` (CASCADE on delete) |
| `title` | TEXT | NOT NULL |
| `content` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 6. `notifications`
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `user_id` | UUID | FK → `users.id` (CASCADE on delete) |
| `title` | TEXT | NOT NULL |
| `message` | TEXT | NOT NULL |
| `type` | ENUM | `info`, `reminder`, `booking_update`, `forum_reply` |
| `is_read` | BOOLEAN | NOT NULL DEFAULT false |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

---

## 🌐 Endpoints de la API (30 Endpoints)

**Base URL local:** `http://localhost:3001`

| Recurso | Método | Ruta | Descripción |
|---|---|---|---|
| **Users** | GET | `/api/users` | Listar todos los usuarios |
| | GET | `/api/users/:id` | Obtener usuario con cursos y reservas |
| | POST | `/api/users` | Registrar usuario (student/tutor/admin) |
| | PUT | `/api/users/:id` | Actualizar datos de usuario |
| | DELETE | `/api/users/:id` | Eliminar usuario |
| **Courses** | GET | `/api/courses` | Listar cursos con su tutor |
| | GET | `/api/courses/:id` | Obtener curso con sus reservas |
| | POST | `/api/courses` | Crear curso |
| | PUT | `/api/courses/:id` | Actualizar curso |
| | DELETE | `/api/courses/:id` | Eliminar curso |
| **Tutorias** | GET | `/api/tutorias` | Listar tutorías con contador de reservas |
| | GET | `/api/tutorias/:id` | Obtener tutoría con inscritos |
| | POST | `/api/tutorias` | Programar tutoría (fecha, cupo) |
| | PUT | `/api/tutorias/:id` | Actualizar datos o estado de tutoría |
| | DELETE | `/api/tutorias/:id` | Eliminar tutoría |
| **Bookings** | GET | `/api/bookings` | Listar reservas con estudiante y curso |
| | GET | `/api/bookings/:id` | Obtener detalle de reserva |
| | POST | `/api/bookings` | Registrar reserva |
| | PUT | `/api/bookings/:id` | Actualizar estado (`pending`, `confirmed`, `cancelled`) |
| | DELETE | `/api/bookings/:id` | Eliminar reserva |
| **Forums** | GET | `/api/forums` | Listar dudas (filtro: `?courseId=...`) |
| | GET | `/api/forums/:id` | Ver consulta de foro específica |
| | POST | `/api/forums` | Publicar consulta |
| | PUT | `/api/forums/:id` | Editar duda de foro |
| | DELETE | `/api/forums/:id` | Eliminar mensaje de foro |
| **Notifications** | GET | `/api/notifications` | Listar alertas (filtro: `?userId=...`) |
| | GET | `/api/notifications/:id` | Ver notificación específica |
| | POST | `/api/notifications` | Crear notificación |
| | PUT | `/api/notifications/:id` | Marcar como leída (`isRead: true`) |
| | DELETE | `/api/notifications/:id` | Eliminar notificación |


---

## 🛠️ Manual Operativo FinOps: Persistencia Dual (Supabase 24/7 vs AWS RDS Bajo Demanda)

Para mantener el proyecto en **estricto costo $0.00 USD**, se adoptó la siguiente operativa:

### 1. Base de Datos Primaria (24/7): Supabase PostgreSQL
- **Uso:** Desarrollo diario, pruebas continuas y ejecución estándar del backend.
- **Ventaja:** No consume horas de cómputo en AWS ni genera cobros por IPv4 pública ($0.005/hr).
- **Configuración en `backend/.env`:**
  ```env
  DATABASE_URL="postgresql://postgres.[TU_PROYECTO]:[TU_PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
  ```

### 2. Base de Datos Secundaria: Amazon RDS (`tutorias-upds-db`)
- **Uso:** Exclusivamente para defensas académicas o validación de infraestructura en AWS.
- **Estado Habitual:** En frío / Pausada (`stopped`).
- **Comandos de Gestión (PowerShell):**
  ```powershell
  # 🛑 Detener RDS (frena horas de cómputo y libera la IPv4 pública):
  aws rds stop-db-instance --db-instance-identifier tutorias-upds-db --region us-east-2

  # ▶️ Iniciar RDS (tarda ~2 a 3 minutos en pasar a 'available'):
  aws rds start-db-instance --db-instance-identifier tutorias-upds-db --region us-east-2

  # 🔍 Verificar Estado Actual:
  aws rds describe-db-instances --db-instance-identifier tutorias-upds-db --region us-east-2 --query "DBInstances[0].DBInstanceStatus"

  # 💰 Verificar Gastos Acumulados ($0.00 USD):
  aws ce get-cost-and-usage --time-period Start=2026-10-01,End=2026-10-31 --granularity MONTHLY --metrics "UnblendedCost" --region us-east-1
  ```

> ⚠️ **Regla de los 7 días de AWS RDS:**  
> AWS enciende automáticamente las instancias RDS que permanezcan en estado `stopped` por más de 7 días continuos. Si esto ocurre, basta con volver a ejecutar `aws rds stop-db-instance` para devolverla a costo cero.

---

## 🗺️ Mapa de Componentes: Dónde va Cada Cosa

| Tipo de Componente | Ubicación en el Repositorio | Responsabilidad |
|---|---|---|
| **Punto de Entrada** | `backend/src/server.ts` | Configura Express, registra las 6 rutas y el middleware de errores. |
| **Modelos de Datos** | `backend/prisma/schema.prisma` | Define las 6 tablas relacionales y 4 tipos ENUM en PostgreSQL. |
| **Migración DDL SQL** | `backend/prisma/migrations/20261015000000_init_full_schema/migration.sql` | Script SQL versionado con la creación física de tablas y claves foráneas. |
| **Poblador Inicial** | `backend/prisma/seed.ts` | Script que inserta usuarios, cursos, tutorías, reservas, foro y notificaciones de prueba. |
| **Cliente de BD** | `backend/src/lib/prisma.ts` | Patrón Singleton para reutilizar la conexión y evitar fugas de memoria. |
| **Controladores** | `backend/src/controllers/*.ts` | Funciones asíncronas con lógica de negocio y queries a Prisma (6 archivos). |
| **Enrutadores** | `backend/src/routes/*.ts` | Declaración de endpoints HTTP (GET, POST, PUT, DELETE) con validadores asociados. |
| **Validación** | `backend/src/middlewares/validate.ts` | Regex de UUIDs, chequeo de campos obligatorios, longitudes y enums válidos. |
| **Manejo de Errores** | `backend/src/middlewares/errorHandler.ts` | Captura centralizada de excepciones y traducción de códigos Prisma (P2002, P2025). |
| **Suite de Pruebas** | `backend/api.http` | 30 peticiones HTTP listas para probar con REST Client en VS Code. |
| **Configuración Local** | `backend/.env` | Credenciales de base de datos y AWS (nunca se sube a GitHub). |
| **Informe Académico** | `Informe_Actividad2.md` | Documento académico formal de entrega para el docente. |

---

## ⚙️ Cómo Levantar el Proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/Marce0c0/Sistema-Tutorias-UPDS.git
cd sistema-tutoriales-UPDS/backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (usar Supabase por defecto a costo $0)
# Copiar plantilla si no existe .env:
Copy-Item .env.example .env

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Sincronizar modelos y poblar datos iniciales
npx prisma db push
npm run prisma:seed

# 6. Iniciar el servidor en modo desarrollo
npm run dev

# ✅ El servidor estará escuchando en: http://localhost:3001
```

### Scripts Disponibles en `backend/package.json`
| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con recarga automática (`ts-node-dev`) |
| `npm run build` | Compila TypeScript a JavaScript estándar en `/dist` (`tsc`) |
| `npm start` | Inicia el servidor compilado de producción (`node dist/server.js`) |
| `npm run prisma:seed` | Puebla la base de datos con los datos de prueba de las 6 entidades |
| `npx prisma studio` | Abre una interfaz web interactiva para ver y editar registros |
| `npx prisma db push` | Sincroniza el esquema `schema.prisma` con la base de datos activa |

---

## 📋 Historial de Actividades de la Materia

| Actividad | Título | Estado | Entrega |
|---|---|---|---|
| **01** | Introducción a Node.js y Express (Rutas básicas) | ✅ Completada | 18/10/2026 |
| **02** | Backend, Base de Datos y API REST | ✅ Completada | 18/10/2026 |
| **03** | Frontend SPA (HTML, CSS, JS Vainilla en S3 + CloudFront) | ⏳ Siguiente paso | — |
| **04** | Autenticación, Seguridad y Roles (JWT / OAuth) | ⏳ Pendiente | — |
| **05** | Integración Fullstack y Almacenamiento S3 | ⏳ Pendiente | — |
| **06** | Proyecto Final y Despliegue Cloud en Producción | ⏳ Pendiente | — |

---

*Documento de contexto — Sistema-Tutoriales-UPDS — UPDS — Octubre 2026*

