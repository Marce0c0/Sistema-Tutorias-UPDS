// Utilidades y Gestor de Hilos de Discusión para Foros — Sistema-Tutoriales-UPDS
import { safeStorage } from '../config/env.js';

// SVG moderno de portada por defecto con signo de interrogación
export const DEFAULT_FORUM_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="600" height="240">
    <defs>
      <linearGradient id="updsBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B2A4A" />
        <stop offset="60%" stop-color="#111c33" />
        <stop offset="100%" stop-color="#0a1224" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#1B2A4A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="240" fill="url(#updsBg)" />
    <rect width="600" height="240" fill="url(#glow)" />
    <circle cx="300" cy="100" r="46" fill="#ffffff" fill-opacity="0.08" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.35" />
    <text x="300" y="122" font-family="system-ui, -apple-system, sans-serif" font-size="62" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <text x="300" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#93c5fd" letter-spacing="3" text-anchor="middle">FORO DE CONSULTAS &amp; DEBATE · UPDS</text>
  </svg>
`);

// Categorías del Foro
export const FORUM_CATEGORIES = [
  { id: 'pregunta', label: 'Pregunta / Duda', icon: '❓', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'recomendacion', label: 'Recomendación / Tip', icon: '💡', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  { id: 'equipo', label: 'Búsqueda de Equipo', icon: '🤝', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { id: 'debate', label: 'Aporte Académico', icon: '💬', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { id: 'soporte', label: 'Soporte / Trámite', icon: '🛠️', color: '#334155', bg: '#f8fafc', border: '#cbd5e1' },
];

export const getCategoryById = (catId) => {
  return FORUM_CATEGORIES.find((c) => c.id === catId) || FORUM_CATEGORIES[0];
};

const META_PREFIX = '<!--upds_meta:';
const META_SUFFIX = '-->';

/**
 * Serializa contenido con metadatos embebidos en comentario HTML
 */
export const formatForumContent = (text, meta = {}) => {
  const metaJson = JSON.stringify(meta);
  return `${META_PREFIX}${metaJson}${META_SUFFIX}\n${text.trim()}`;
};

/**
 * Parsea el contenido y extrae los metadatos de categoría, portada y canal
 */
export const parseForumContent = (rawContent = '') => {
  if (typeof rawContent !== 'string') {
    return { text: '', meta: { category: 'pregunta', coverImage: null, channel: 'general' } };
  }

  const startIdx = rawContent.indexOf(META_PREFIX);
  if (startIdx !== -1) {
    const endIdx = rawContent.indexOf(META_SUFFIX, startIdx);
    if (endIdx !== -1) {
      try {
        const jsonStr = rawContent.substring(startIdx + META_PREFIX.length, endIdx);
        const meta = JSON.parse(jsonStr);
        const text = (rawContent.substring(0, startIdx) + rawContent.substring(endIdx + META_SUFFIX.length)).trim();
        return { text, meta: { category: meta.category || 'pregunta', coverImage: meta.coverImage || null, channel: meta.channel || 'general' } };
      } catch {}
    }
  }

  // Heurística de detección si no tiene metadatos embebidos
  let category = 'pregunta';
  const lower = rawContent.toLowerCase();
  if (lower.includes('recomend') || lower.includes('consejo') || lower.includes('tip')) category = 'recomendacion';
  else if (lower.includes('equipo') || lower.includes('hackathon') || lower.includes('grupo')) category = 'equipo';
  else if (lower.includes('soporte') || lower.includes('trámite') || lower.includes('error')) category = 'soporte';

  return {
    text: rawContent.trim(),
    meta: {
      category,
      coverImage: null,
      channel: 'general',
    },
  };
};

// ─── Gestión de Comentarios / Respuestas a Consultas ────────────────────────
const REPLIES_STORAGE_KEY = 'upds_forum_replies_v2';

const SEED_REPLIES = {
  '550e8400-e29b-41d4-a716-446655440001': [
    {
      id: 'reply-seed-1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: '¿Es recomendable validar los UUIDs mediante middleware regex antes de consultar la base de datos con Prisma?',
      createdAt: '2026-10-25T19:15:00.000Z',
    },
    {
      id: 'reply-seed-1-ans',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: '¡Excelente pregunta Juan! Es una excelente práctica validar los UUIDs en el middleware con una expresión regular antes de llegar a Prisma. Esto evita consultas innecesarias a la base de datos y previene ataques o inyecciones.',
      createdAt: '2026-10-25T19:30:00.000Z',
    },
    {
      id: 'reply-seed-2',
      userId: '3b593672-04b3-469b-9ffb-149eb0f317b9',
      userName: 'Coordinación Académica UPDS',
      userRole: 'admin',
      content: 'Recordatorio para todos: la entrega de la práctica con middlewares debe incluir los tests unitarios correspondientes en Jest o Node test runner.',
      createdAt: '2026-10-26T10:15:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000010': [
    {
      id: 'reply-seed-aws-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: 'Ing. Maria, ¿las credenciales sandbox que nos darán en el Lab 4 tienen permisos para desplegar VPCs multi-AZ y clústeres ECS con Terraform?',
      createdAt: '2026-10-28T07:30:00.000Z',
    },
    {
      id: 'reply-seed-aws-ans1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Sí Juan, las sandboxes contarán con la política PowerUser restringida a la región us-east-2 para que puedan aprovisionar toda la infraestructura requerida sin costos para ustedes.',
      createdAt: '2026-10-28T07:50:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000011': [
    {
      id: 'reply-seed-ia-rag-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: '¿Qué versión de Python y librerías de embeddings utilizaremos para conectar LangChain con la base de datos vectorial ChromaDB?',
      createdAt: '2026-10-28T08:10:00.000Z',
    },
    {
      id: 'reply-seed-ia-rag-ans1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Trabajaremos con Python 3.11+, LangChain Core v0.3 y sentence-transformers para embeddings en español. En la primera sesión configuraremos el entorno virtual paso a paso.',
      createdAt: '2026-10-28T08:25:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000012': [
    {
      id: 'reply-seed-fullstack-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: '¿En la certificación veremos cómo sincronizar las sesiones de usuario con JWT y cookies HttpOnly entre Next.js 15 y los guards de NestJS?',
      createdAt: '2026-10-28T08:15:00.000Z',
    },
    {
      id: 'reply-seed-fullstack-ans1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Exactamente. El módulo 3 cubre seguridad web integral: firma asimétrica de tokens, rotación de refresh tokens y protección CSRF con SameSite strict.',
      createdAt: '2026-10-28T08:30:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000006': [
    {
      id: 'reply-seed-dock-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: 'En la práctica del laboratorio, al apagar los contenedores con docker compose down se borraban las tablas porque no declaré el volumen nombrado en la sección volumes de la raíz. ¿Hay alguna otra buena práctica para backups?',
      createdAt: '2026-10-27T20:15:00.000Z',
    },
    {
      id: 'reply-seed-dock-1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Exacto, si el volumen no se declara en la raíz de docker-compose.yml se considera anónimo y docker compose down -v lo descarta. Para backups periódicos en producción recomendamos scripts con pg_dump montados en un cron container.',
      createdAt: '2026-10-27T20:30:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000007': [
    {
      id: 'reply-seed-sec-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: '¿Cómo configuramos Fail2ban para que reconozca los logs de autenticación en aplicaciones Node.js detrás de Nginx?',
      createdAt: '2026-10-27T11:00:00.000Z',
    },
    {
      id: 'reply-seed-sec-ans1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Debes definir un filtro personalizado en `/etc/fail2ban/filter.d/express-auth.conf` con una regex que detecte los códigos 401/403 en los logs de Nginx con la cabecera X-Forwarded-For.',
      createdAt: '2026-10-27T11:20:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000008': [
    {
      id: 'reply-seed-math-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: 'Estimada docente, ¿en el segundo parcial entrarán problemas de aplicación física de la derivada o principalmente optimización?',
      createdAt: '2026-10-26T17:30:00.000Z',
    },
    {
      id: 'reply-seed-math-1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Muy buen aporte Juan. En la clase práctica del sábado resolveremos en pizarra los ejercicios 8 y 12 del compendio, cubriendo tanto cinemática como optimización de costos.',
      createdAt: '2026-10-26T18:00:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000009': [
    {
      id: 'reply-seed-devsprint-q1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: '¡Buenas a todos! Somos 2 estudiantes con experiencia en frontend y pagos QR y buscamos un compañero para backend o diseño. ¿Alguien disponible?',
      createdAt: '2026-10-28T07:35:00.000Z',
    },
    {
      id: 'reply-seed-devsprint-1',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: '¡Mucho éxito en el DevSprint! Los laboratorios 3 y 4 ya cuentan con conectividad Gigabit habilitada y monitores secundarios disponibles.',
      createdAt: '2026-10-28T07:45:00.000Z',
    },
  ],
  'a1000001-0000-4000-8000-000000000005': [
    {
      id: 'reply-seed-web-1',
      userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
      userName: 'Juan Perez',
      userRole: 'student',
      content: 'Ing. Maria, ¿el connection pooling de Supabase se debe usar tanto para Prisma como para las migraciones directas en producción?',
      createdAt: '2026-10-27T16:45:00.000Z',
    },
    {
      id: 'reply-seed-web-2',
      userId: 'dfacc15e-e3ae-4d1c-9a88-f5fc2f464914',
      userName: 'Maria Gomez',
      userRole: 'tutor',
      content: 'Para las migraciones (`prisma migrate deploy`) se recomienda la URL directa (puerto 5432 o Session Mode) y para las consultas habituales de Express el pool de conexiones en puerto 6543.',
      createdAt: '2026-10-27T17:10:00.000Z',
    },
  ],
};

export const getRepliesForMessage = (messageId) => {
  if (!messageId) return [];
  try {
    const raw = safeStorage.getItem(REPLIES_STORAGE_KEY);
    const storeMap = raw ? JSON.parse(raw) : {};
    const replies = storeMap[messageId] || SEED_REPLIES[messageId] || [];
    return replies;
  } catch {
    return SEED_REPLIES[messageId] || [];
  }
};

export const saveReplyForMessage = (messageId, reply) => {
  if (!messageId || !reply) return [];
  try {
    const raw = safeStorage.getItem(REPLIES_STORAGE_KEY);
    const storeMap = raw ? JSON.parse(raw) : { ...SEED_REPLIES };
    if (!storeMap[messageId]) {
      storeMap[messageId] = [...(SEED_REPLIES[messageId] || [])];
    }
    storeMap[messageId].push(reply);
    safeStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(storeMap));
    return storeMap[messageId];
  } catch (err) {
    console.error('Error guardando comentario en foro:', err);
    return [];
  }
};

// ─── Suscripción a Notificaciones por Hilo de Foro (Default: Activa) ────────
export const isThreadSubscribed = (messageId, userId) => {
  if (!messageId || !userId) return true;
  try {
    const raw = safeStorage.getItem(`upds_muted_threads_${userId}`);
    const mutedList = raw ? JSON.parse(raw) : [];
    return !mutedList.includes(messageId);
  } catch {
    return true;
  }
};

export const toggleThreadSubscription = (messageId, userId) => {
  if (!messageId || !userId) return true;
  try {
    const raw = safeStorage.getItem(`upds_muted_threads_${userId}`);
    let mutedList = raw ? JSON.parse(raw) : [];
    const isMuted = mutedList.includes(messageId);
    if (isMuted) {
      // Reactivar suscripción (desmutear)
      mutedList = mutedList.filter((id) => id !== messageId);
      safeStorage.setItem(`upds_muted_threads_${userId}`, JSON.stringify(mutedList));
      return true;
    } else {
      // Silenciar hilo (mutear)
      mutedList.push(messageId);
      safeStorage.setItem(`upds_muted_threads_${userId}`, JSON.stringify(mutedList));
      return false;
    }
  } catch {
    return true;
  }
};
