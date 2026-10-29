// Vista de Hackathons y Eventos Tecnológicos Externos (Cochabamba) — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { safeStorage } from '../config/env.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Icons } from '../components/Icons.js';
import { can } from '../utils/permissions.js';
import { Pagination } from '../components/Pagination.js';
import { Badge } from '../components/Badge.js';

export const DEFAULT_EVENTS = [
  {
    id: 'hackathon-upds-devsprint-today',
    title: 'Hackathon UPDS DevSprint & FinTech Challenge 2026',
    category: 'hackathon',
    organizer: 'Sociedad Científica UPDS Cochabamba & Banco FIE',
    badge: 'Inicia Hoy 12:00 PM',
    badgeColor: '#f59e0b',
    status: 'active',
    startDate: '2026-10-28T12:00:00-04:00',
    endDate: '2026-10-30T18:00:00-04:00',
    cancellationReason: null,
    cancelledAt: null,
    date: 'Hoy 28 de Octubre (12:00 PM) al 30 de Octubre, 2026',
    location: 'Laboratorios de Computación 3 y 4 · Campus UPDS Cochabamba',
    modality: 'Presencial (Equipos de 2 a 4 estudiantes)',
    description: 'Maratón intensiva de desarrollo tecnológico de 48 horas enfocada en billeteras digitales, pagos con código QR interoperable y soluciones financieras seguras para el comercio en Cochabamba. Mentorías técnicas en vivo y jurado evaluador.',
    topics: ['FinTech & Pagos QR', 'Microservicios Cloud', 'Billeteras Digitales', 'Ciberseguridad Transaccional'],
    prizes: 'Bs. 15,000 en capital semilla, pasantías técnicas directas y becas completas de certificación cloud.',
    link: 'https://cochabamba.bo/devsprint-upds-2026',
  },
  {
    id: 'hackathon-ia-cbba-2026',
    title: 'Hackathon Nacional de Inteligencia Artificial & GovTech 2026',
    category: 'hackathon',
    organizer: 'Alcaldía de Cochabamba & Hub de Innovación Tech',
    badge: 'Convocatoria Abierta',
    badgeColor: '#dc2626',
    status: 'active',
    startDate: '2026-10-28T11:00:00-04:00',
    endDate: '2026-11-17T23:59:59-04:00',
    cancellationReason: null,
    cancelledAt: null,
    date: '28 de Octubre (11:00 AM) al 17 de Noviembre, 2026',
    location: 'Campus Central UPDS & Recinto Ferial Alalay',
    modality: 'Híbrida (Presencial / Remoto)',
    description: 'Desafío intensivo de desarrollo de agentes de Inteligencia Artificial y soluciones GovTech para la digitalización y automatización de trámites ciudadanos en Cochabamba. 20 días de aceleración, mentorías y demoday final.',
    topics: ['Inteligencia Artificial', 'GovTech & Trámites', 'Machine Learning', 'Cloud Computing'],
    prizes: 'Bs. 25,000 en capital semilla, pasantías técnicas directas y becas completas de postgrado.',
    link: 'https://cochabamba.bo/hackathon-ia-2026',
  },
  {
    id: 'hackathon-nasa-space-apps-past',
    title: 'NASA Space Apps Challenge Cochabamba 2026',
    category: 'hackathon',
    organizer: 'NASA Space Apps & Comunidad Aeroespacial Bolivia',
    badge: 'Finalizado',
    badgeColor: '#64748b',
    status: 'active',
    startDate: '2026-10-18T09:00:00-04:00',
    endDate: '2026-10-19T18:00:00-04:00',
    cancellationReason: null,
    cancelledAt: null,
    date: '18 al 19 de Octubre, 2026',
    location: 'Auditorio Magna UPDS Cochabamba',
    modality: 'Presencial (Equipos de 3 a 5 estudiantes)',
    description: 'Hackathon internacional de 48 horas resolviendo retos de datos abiertos de la NASA con soluciones de software, simulación y ciencia de datos.',
    topics: ['Datos Abiertos NASA', 'Astrofísica', 'Earth Observation', 'Python'],
    prizes: 'Nominación global NASA y trofeos departamentales de honor.',
    link: 'https://spaceappschallenge.org',
  },
  {
    id: 'hackathon-cbba-2026',
    title: 'Hackathon Cochabamba Innova Tech 2026',
    category: 'hackathon',
    organizer: 'Alcaldía de Cochabamba & Hub de Innovación Tech',
    badge: 'Convocatoria Abierta',
    badgeColor: '#dc2626',
    status: 'active',
    startDate: '2026-11-05T08:00:00-04:00',
    endDate: '2026-11-07T18:00:00-04:00',
    cancellationReason: null,
    cancelledAt: null,
    date: '5 al 7 de Noviembre, 2026',
    location: 'Recinto Ferial Alalay — Pabellón Cochabamba Tech',
    modality: 'Presencial (Equipos de 3 a 5 estudiantes o profesionales)',
    description: 'Desafío de desarrollo de prototipos tecnológicos enfocado en soluciones Smart City para la llajta. Mentores de la industria guiarán a los equipos durante las 48 horas de competencia.',
    topics: ['Smart Cities & Tráfico', 'Gestión Ambiental y Reciclaje', 'Gobierno Digital', 'Inteligencia Artificial'],
    prizes: 'Premios en efectivo, capital semilla e incubación de proyectos por el municipio de Cochabamba.',
    link: 'https://cochabamba.bo/innova-tech-2026',
  },
  {
    id: 'ctf-cbba-2026',
    title: 'Torneo Departamental de Ciberseguridad & CTF Cochabamba',
    category: 'security',
    organizer: 'Comunidades Tech Cochabamba & Aliados Ciberseguridad',
    badge: 'Clasificatoria Virtual',
    badgeColor: '#2563eb',
    startDate: '2026-11-12T09:00:00-04:00',
    endDate: '2026-11-14T20:00:00-04:00',
    date: '12 al 14 de Noviembre, 2026',
    location: 'Plataforma CTFd / Discord Oficial Tech Cochabamba',
    modality: 'Virtual (Individual y Duplas)',
    description: 'Competencia estilo Capture The Flag donde pondrás a prueba habilidades de seguridad ofensiva, análisis forense, ingeniería inversa y criptografía.',
    topics: ['Web Application Security', 'Binary Exploitation', 'Cryptography & Steganography', 'Network Forensics'],
    prizes: 'Certificaciones internacionales, kits de hardware (Raspberry Pi) y menciones de honor.',
    link: 'https://discord.gg/tech-cochabamba',
  },
  {
    id: 'feria-llajta-tech',
    title: 'Feria de Innovación & Emprendimiento Digital "Llajta Tech"',
    category: 'feria',
    organizer: 'Secretaría de Desarrollo Productivo & Alcaldía de Cochabamba',
    badge: 'Próximamente (Diciembre 2026)',
    badgeColor: '#059669',
    startDate: '2026-12-01T09:00:00-04:00',
    endDate: '2026-12-03T19:00:00-04:00',
    date: '1 al 3 de Diciembre, 2026',
    location: 'Paseo de El Prado / Centro de Convenciones Cochabamba',
    modality: 'Exhibición Presencial y Networking Abierto',
    description: 'Encuentro anual del ecosistema de software y startups de Cochabamba. Muestra de proyectos universitarios destacados y ronda de vinculación laboral con empresas IT.',
    topics: ['Startups y FinTech', 'Software Factory Showcase', 'Networking con Empresas', 'Talleres Abiertos'],
    prizes: 'Acceso directo a rondas de inversión y pasantías técnicas en empresas aliadas.',
    link: 'https://cochabamba.bo/llajta-tech',
  },
];

export const getEventTiming = (ev) => {
  if (!ev) return { status: 'upcoming', label: 'Convocatoria' };
  if (ev.status === 'cancelled') return { status: 'cancelled', label: 'Cancelado' };

  const now = new Date();
  const start = ev.startDate ? new Date(ev.startDate) : null;
  const end = ev.endDate ? new Date(ev.endDate) : null;

  if (end && !isNaN(end.getTime()) && now > end) {
    return { status: 'finished', label: 'Finalizado' };
  }

  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) {
    return { status: 'live', label: 'EN VIVO' };
  }

  if (start && !isNaN(start.getTime()) && now < start) {
    const diffMs = start.getTime() - now.getTime();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    if (diffMs <= fortyEightHoursMs && diffMs > 0) {
      return {
        status: 'countdown',
        label: 'Inicia en:',
        diffMs,
        startTime: start.getTime(),
        parsedCountdown: formatCountdownParts(diffMs),
      };
    }
    return { status: 'upcoming', label: ev.badge || 'Convocatoria Abierta' };
  }

  if (ev.isLive) {
    return { status: 'live', label: 'EN VIVO' };
  }

  return { status: 'upcoming', label: ev.badge || 'Convocatoria Abierta' };
};

export const formatCountdownParts = (diffMs) => {
  if (diffMs <= 0) return { days: '0', hours: '00', minutes: '00', seconds: '00' };
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return {
    days: String(days),
    hours: String(remHours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

export const formatCountdown = (diffMs) => {
  if (diffMs <= 0) return '00h 00m 00s';
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${String(remHours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

export const toDateTimeLocalValue = (dateStr) => {
  return Badge.toBoliviaDateTimeLocal(dateStr);
};

export const parseBoliviaDateTime = (localVal) => {
  return Badge.parseBoliviaDateTime(localVal);
};

export const isEventLive = (ev) => {
  return getEventTiming(ev).status === 'live';
};

export const getStoredEvents = () => {
  let list = DEFAULT_EVENTS;
  const raw = safeStorage.getItem('upds_events_v3') || safeStorage.getItem('upds_events_v2');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map((e) => e.id));
        DEFAULT_EVENTS.forEach((de) => {
          if (!ids.has(de.id)) {
            parsed.unshift(de);
          }
        });
        list = parsed;
      }
    } catch {}
  }
  safeStorage.setItem('upds_events_v3', JSON.stringify(list));
  return list;
};

export const saveStoredEvents = (events) => {
  safeStorage.setItem('upds_events_v3', JSON.stringify(events));
  store.setEvents(events);
};

export const EVENTS_DATA = getStoredEvents();

export const EventsView = {
  render() {
    const state = store.getState();
    const canManage = can(state.activeUser?.role, 'events.manage');

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    let currentPage = 1;
    let currentFilter = 'all'; // 'all' | 'active' | 'finished'
    let countdownInterval = null;
    const PAGE_SIZE = 6;

    const renderView = () => {
      const allEvents = getStoredEvents();
      const finishedEvents = allEvents.filter((e) => getEventTiming(e).status === 'finished');
      const activeEvents = allEvents.filter((e) => getEventTiming(e).status !== 'finished');

      let displayList = allEvents;
      if (currentFilter === 'active') {
        displayList = activeEvents;
      } else if (currentFilter === 'finished') {
        displayList = finishedEvents;
      }

      const pagination = Pagination.paginate(displayList, currentPage, PAGE_SIZE);
      currentPage = pagination.currentPage;

      container.innerHTML = `
        <div class="view-header">
          <div>
            <h2 class="view-title" style="display:flex;align-items:center;gap:0.5rem;">
              ${Icons.trophy('', 22)} <span>Eventos & Hackathons Tecnológicos — Cochabamba</span>
            </h2>
            <p class="view-subtitle">Convocatorias externas, desafíos de innovación Smart City y torneos impulsados por la Alcaldía de Cochabamba y aliados del ecosistema.</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.65rem; flex-wrap:wrap;">
            <div class="bolivia-live-clock-badge" title="Reloj en vivo sincronizado con la hora oficial de Bolivia (UTC-4)">
              <span class="live-clock-pulse"></span>
              <span style="font-weight:700;">🇧🇴 Bolivia:</span>
              <span id="bolivia-live-clock-val" style="font-family:monospace; font-weight:800;">${Badge.getNowBoliviaString()}</span>
            </div>
            ${canManage ? `
              <div class="view-actions">
                <button id="btn-create-event" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.45rem;">
                  ${Icons.trophy('', 16)} <span>+ Publicar Hackathon / Evento</span>
                </button>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="events-disclaimer-card">
          <span class="events-disclaimer-icon" style="color:var(--primary-navy);display:inline-flex;">${Icons.building('', 26)}</span>
          <div>
            <h3 class="events-disclaimer-title">Vinculación con el Ecosistema Tecnológico de Cochabamba</h3>
            <p class="events-disclaimer-desc">
              Iniciativas co-organizadas con la <strong>Alcaldía de Cochabamba</strong>, empresas y comunidades tech. La UPDS promueve la participación activa de sus estudiantes y postulantes externos en hackathons y competencias departamentales.
            </p>
          </div>
        </div>

        <div class="events-filter-bar">
          <div class="events-filter-tabs">
            <button type="button" class="btn-events-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
              Todos <span class="tab-badge">${allEvents.length}</span>
            </button>
            <button type="button" class="btn-events-tab ${currentFilter === 'active' ? 'active' : ''}" data-filter="active">
              En Vivo & Próximos <span class="tab-badge">${activeEvents.length}</span>
            </button>
            <button type="button" class="btn-events-tab ${currentFilter === 'finished' ? 'active' : ''}" data-filter="finished" style="display:inline-flex; align-items:center; gap:0.35rem;">
              ${Icons.check('', 14)} <span>Finalizados</span> <span class="tab-badge">${finishedEvents.length}</span>
            </button>
          </div>
          ${canManage && currentFilter === 'finished' && finishedEvents.length > 0 ? `
            <div class="events-bulk-actions">
              <button id="btn-delete-all-finished" class="btn btn-sm btn-danger-outline" style="display:inline-flex; align-items:center; gap:0.4rem;" title="Eliminar permanentemente todos los eventos que ya han finalizado">
                ${Icons.trash('', 14)} <span>Borrar Todos los Finalizados (${finishedEvents.length})</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="cards-grid" id="events-cards-grid">
          ${pagination.items.length === 0 ? `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748b; background:#f8fafc; border-radius:10px; border:1px dashed #cbd5e1;">
              <p style="margin:0; font-weight:600; font-size:0.95rem;">No hay eventos en esta sección.</p>
              <small style="color:#94a3b8;">Cambia de pestaña o publica un nuevo evento tecnológico.</small>
            </div>
          ` : pagination.items
            .map((ev) => {
              const timing = getEventTiming(ev);
              const isCancelled = timing.status === 'cancelled';
              const isLive = timing.status === 'live';
              const isCountdown = timing.status === 'countdown';
              const isFinished = timing.status === 'finished';

              return `
            <div class="card event-card ${isCancelled ? 'is-cancelled-event' : ''} ${isFinished ? 'is-finished-event' : ''}">
              <div class="event-card-body-top">
                <div class="event-card-header">
                  <div class="event-header-badges-stack">
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      ${isCancelled ? `
                        <span class="event-badge-status badge-cancelled" style="background:#ef4444; color:#ffffff;">
                          Cancelado
                        </span>
                      ` : isLive ? `
                        <span class="event-live-badge" title="Este evento se encuentra en desarrollo en este momento">
                          <span class="live-dot-container">
                            <span class="live-dot-ping"></span>
                            <span class="live-dot"></span>
                          </span>
                          <span>EN VIVO</span>
                        </span>
                      ` : isCountdown ? `
                        <span class="event-countdown-pill" title="Inicia en menos de 48 horas" style="display:inline-flex; align-items:center; gap:0.3rem;">
                          ${Icons.clock('', 13)} <span>Inicio Inminente</span>
                        </span>
                      ` : isFinished ? `
                        <span class="event-finished-badge-prominent" title="Este evento ya ha finalizado oficialmente" style="display:inline-flex; align-items:center; gap:0.3rem;">
                          ${Icons.check('', 13)} <span>CONVOCATORIA FINALIZADA</span>
                        </span>
                      ` : `
                        <span class="event-badge-status">
                          ${ev.badge || 'Convocatoria'}
                        </span>
                      `}
                    </div>
                    <span class="event-badge-location" style="display:inline-flex;align-items:center;gap:0.3rem;">
                      ${Icons.pin('', 12)} Cochabamba ${isFinished ? '• Concluido' : ''}
                    </span>
                  </div>
                  ${canManage ? `
                    <div class="event-admin-actions" style="display:inline-flex; align-items:center; gap:0.3rem;">
                      <button class="btn btn-xs btn-outline btn-edit-event" data-id="${ev.id}" title="Editar Convocatoria" style="display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                        ${Icons.edit('', 12)}
                      </button>
                      ${!isCancelled && !isFinished ? `
                        <button class="btn btn-xs btn-outline btn-cancel-event" data-id="${ev.id}" title="Cancelar Evento con Motivo" style="color:#dc2626; border-color:#fca5a5; display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                          ${Icons.x('', 12)}
                        </button>
                      ` : isCancelled ? `
                        <button class="btn btn-xs btn-outline btn-reactivate-event" data-id="${ev.id}" title="Reactivar Convocatoria" style="color:#059669; border-color:#a7f3d0; display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                          ${Icons.check('', 12)}
                        </button>
                      ` : ''}
                      <button class="btn btn-xs btn-danger-outline btn-delete-event" data-id="${ev.id}" title="Eliminar Convocatoria" style="display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                        ${Icons.trash('', 12)}
                      </button>
                    </div>
                  ` : ''}
                </div>

                <h3 class="event-title" title="${ev.title}">${ev.title}</h3>

                ${isCountdown ? `
                  <div class="event-countdown-banner" data-start-time="${timing.startTime}" title="Inicia en menos de 48 horas">
                    <div class="countdown-banner-header">
                      <span class="countdown-pulse-dot"></span>
                      <span class="countdown-banner-label">CUENTA REGRESIVA · INICIA EN</span>
                    </div>
                    <div class="countdown-digits-row">
                      <div class="countdown-digit-box">
                        <span class="cd-number cd-days">${timing.parsedCountdown?.days ?? '0'}</span>
                        <span class="cd-unit">DÍAS</span>
                      </div>
                      <span class="cd-divider">:</span>
                      <div class="countdown-digit-box">
                        <span class="cd-number cd-hours">${timing.parsedCountdown?.hours ?? '00'}</span>
                        <span class="cd-unit">HRS</span>
                      </div>
                      <span class="cd-divider">:</span>
                      <div class="countdown-digit-box">
                        <span class="cd-number cd-mins">${timing.parsedCountdown?.minutes ?? '00'}</span>
                        <span class="cd-unit">MIN</span>
                      </div>
                      <span class="cd-divider">:</span>
                      <div class="countdown-digit-box">
                        <span class="cd-number cd-secs">${timing.parsedCountdown?.seconds ?? '00'}</span>
                        <span class="cd-unit">SEG</span>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${isCancelled ? `
                  <div class="event-cancellation-banner">
                    <div style="font-size:0.78rem; font-weight:800; color:#dc2626; display:flex; align-items:center; gap:0.35rem; margin-bottom:3px;">
                      ${Icons.x('', 13)} Convocatoria Cancelada
                    </div>
                    <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.45;">
                      <strong>Motivo:</strong> ${ev.cancellationReason || 'Cancelado por la administración universitaria.'}
                    </div>
                  </div>
                ` : ''}

                <p class="event-desc" title="${ev.description}">${ev.description}</p>

                <div class="event-meta-box">
                  <div class="event-meta-row">
                    <span class="event-meta-label">${Icons.building('', 13)} Organizador:</span>
                    <span class="event-meta-val" title="${ev.organizer}">${ev.organizer}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label">${Icons.calendar('', 13)} Fechas:</span>
                    <span class="event-meta-val" title="${ev.date}">${ev.date} ${isFinished ? '<span class="badge-finished-inline">Concluido</span>' : ''}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label">${Icons.pin('', 13)} Sede:</span>
                    <span class="event-meta-val" title="${ev.location}">${ev.location}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label">${Icons.users('', 13)} Modalidad:</span>
                    <span class="event-meta-val" title="${ev.modality}">${ev.modality}</span>
                  </div>
                </div>

                <div class="event-topics-slider-wrapper">
                  <div class="event-topics-slider-header">
                    <span class="event-topics-label">Ejes Temáticos:</span>
                    <span class="event-topics-hint" title="Desliza para ver más ejes">
                      Deslizar <span>→</span>
                    </span>
                  </div>
                  <div class="event-topics-track-box">
                    <button type="button" class="topics-nav-btn topics-nav-prev" aria-label="Ver anteriores" style="display:none;" title="Ver ejes anteriores">‹</button>
                    <div class="event-topics-pills-track">
                      ${(ev.topics || []).map((t) => `<span class="event-topic-pill" title="${t}">${t}</span>`).join('')}
                    </div>
                    <button type="button" class="topics-nav-btn topics-nav-next" aria-label="Ver más ejes" title="Deslizar y ver más ejes temáticos">›</button>
                  </div>
                </div>
              </div>

              <div class="event-card-footer">
                <button class="btn btn-sm btn-outline btn-event-details" data-id="${ev.id}" style="gap:0.4rem;">
                  ${Icons.fileText('', 14)} <span>${isCancelled ? 'Ver Motivo & Bases' : 'Ver Bases'}</span>
                </button>
                <button type="button" class="btn btn-sm btn-outline btn-event-forum" data-id="${ev.id}" title="Ir al foro de consultas y armado de equipos para este evento" style="gap:0.35rem; color:var(--primary-navy);">
                  ${Icons.chat('', 13)} <span>Foro</span>
                </button>
                ${isCancelled ? `
                  <span class="btn btn-sm btn-secondary" style="opacity:0.65; cursor:not-allowed; gap:0.35rem;" title="La convocatoria ha sido suspendida por la institución">
                    ${Icons.x('', 13)} <span>Suspendido</span>
                  </span>
                ` : isFinished ? `
                  <a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-finished-action" title="Ver memoria oficial o sitio del evento concluido" style="gap:0.4rem;">
                    ${Icons.external('', 13)} <span>Memoria / Sitio</span>
                  </a>
                ` : `
                  <a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" title="Abrir sitio web o red social de la convocatoria" style="gap:0.4rem;">
                    ${Icons.rocket('', 14)} <span>Ir a Convocatoria</span> ${Icons.external('', 12)}
                  </a>
                `}
              </div>
            </div>
          `;
            })
            .join('')}
        </div>

        ${Pagination.renderHTML(pagination)}
      `;

      // Enlazar paginación
      Pagination.bindEvents(container, (newPage) => {
        if (countdownInterval) clearInterval(countdownInterval);
        currentPage = newPage;
        renderView();
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // Ticker reactivo instantáneo: sincroniza reloj y contadores en el frame 0 sin retraso de 1 segundo
      if (countdownInterval) clearInterval(countdownInterval);
      const countdownBanners = container.querySelectorAll('.event-countdown-banner');

      const updateLiveTick = () => {
        // Actualizar reloj oficial de Bolivia
        const clockValEl = container.querySelector('#bolivia-live-clock-val');
        if (clockValEl) clockValEl.textContent = Badge.getNowBoliviaString();

        // Actualizar tarjetas en cuenta regresiva si existen
        if (countdownBanners.length > 0) {
          let anyExpired = false;
          const nowMs = Date.now();
          countdownBanners.forEach((bannerEl) => {
            const startMs = Number(bannerEl.getAttribute('data-start-time'));
            const diff = startMs - nowMs;
            if (diff <= 0) {
              anyExpired = true;
            } else {
              const parts = formatCountdownParts(diff);
              const daysEl = bannerEl.querySelector('.cd-days');
              const hrsEl = bannerEl.querySelector('.cd-hours');
              const minsEl = bannerEl.querySelector('.cd-mins');
              const secsEl = bannerEl.querySelector('.cd-secs');
              if (daysEl) daysEl.textContent = parts.days;
              if (hrsEl) hrsEl.textContent = parts.hours;
              if (minsEl) minsEl.textContent = parts.minutes;
              if (secsEl) secsEl.textContent = parts.seconds;
            }
          });
          if (anyExpired) {
            clearInterval(countdownInterval);
            renderView();
          }
        }
      };

      // Disparar sincronización inmediata en el instante 0 y luego cada segundo
      updateLiveTick();
      countdownInterval = setInterval(updateLiveTick, 1000);

      // Enlazar botón para ir al subforo del evento
      container.querySelectorAll('.btn-event-forum').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          window.__pendingForumNav = { channel: 'events', subId: id };
          window.location.hash = '#forums';
        });
      });

      // Enlazar pestañas de filtro (Todos, En Vivo & Próximos, Finalizados)
      container.querySelectorAll('.btn-events-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          if (countdownInterval) clearInterval(countdownInterval);
          currentFilter = tab.getAttribute('data-filter') || 'all';
          currentPage = 1;
          renderView();
        });
      });

      // Enlazar botón para borrar todos los eventos finalizados de golpe (solo admin en pestaña finalizados)
      container.querySelector('#btn-delete-all-finished')?.addEventListener('click', () => {
        const finishedItems = getStoredEvents().filter((e) => getEventTiming(e).status === 'finished');
        if (finishedItems.length === 0) {
          Toast.info('No hay eventos finalizados para borrar.');
          return;
        }

        Modal.confirm({
          title: 'Confirmación de Seguridad',
          message: `
            <div style="text-align:left; color:#1e293b;">
              <p style="margin:0 0 10px; font-weight:700; color:#b91c1c;">
                ⚠️ ¿Estás seguro de que deseas eliminar permanentemente los eventos finalizados?
              </p>
              <p style="margin:0 0 10px; font-size:0.88rem; color:#475569; line-height:1.5;">
                Esta acción eliminará de forma irreversible <strong>${finishedItems.length} ${finishedItems.length === 1 ? 'evento finalizado' : 'eventos finalizados'}</strong> del catálogo institucional.
              </p>
              <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:8px 12px; font-size:0.8rem; color:#991b1b;">
                <strong>Eventos afectados:</strong>
                <ul style="margin:6px 0 0 16px; padding:0;">
                  ${finishedItems.slice(0, 4).map((item) => `<li>${item.title}</li>`).join('')}
                  ${finishedItems.length > 4 ? `<li><em>...y ${finishedItems.length - 4} evento(s) más</em></li>` : ''}
                </ul>
              </div>
            </div>
          `,
          confirmText: 'Sí, Eliminar Definitivamente',
          cancelText: 'Cancelar',
          danger: true,
          onConfirm: async () => {
            const remaining = getStoredEvents().filter((e) => getEventTiming(e).status !== 'finished');
            saveStoredEvents(remaining);
            Toast.success(`Se eliminaron ${finishedItems.length} eventos finalizados.`);
            currentPage = 1;
            renderView();
          },
        });
      });

      // Enlazar botón de creación para admin
      container.querySelector('#btn-create-event')?.addEventListener('click', () => {
        EventsView.openEventModal(null, renderView);
      });

      // Enlazar botones de edición
      container.querySelectorAll('.btn-edit-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = getStoredEvents().find((item) => item.id === id);
          if (ev) EventsView.openEventModal(ev, renderView);
        });
      });

      // Enlazar botón cancelar convocatoria con motivo
      container.querySelectorAll('.btn-cancel-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = getStoredEvents().find((item) => item.id === id);
          if (ev) EventsView.openCancelModal(ev, renderView);
        });
      });

      // Enlazar botón reactivar convocatoria
      container.querySelectorAll('.btn-reactivate-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = getStoredEvents().find((item) => item.id === id);
          if (ev) EventsView.confirmReactivate(ev, renderView);
        });
      });

      // Enlazar botón borrar uno por uno
      container.querySelectorAll('.btn-delete-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = getStoredEvents().find((item) => item.id === id);
          if (ev) EventsView.confirmDelete(ev, renderView);
        });
      });

      // Enlazar modales de detalles de eventos
      container.querySelectorAll('.btn-event-details').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const ev = getStoredEvents().find((e) => e.id === id);
          if (ev) {
            const timing = getEventTiming(ev);
            const isCancelled = timing.status === 'cancelled';
            const isLive = timing.status === 'live';
            const isCountdown = timing.status === 'countdown';
            const isFinished = timing.status === 'finished';

            Modal.open({
              title: isCancelled ? `[Cancelado] Bases — ${ev.title}` : isFinished ? `[Finalizado] Bases — ${ev.title}` : `Bases del Evento — ${ev.title}`,
              content: `
                <div style="font-size:0.92rem;line-height:1.6;">
                  ${isLive ? `
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; gap:0.6rem;">
                      <span class="live-dot-container" style="width:10px; height:10px;">
                        <span class="live-dot-ping"></span>
                        <span class="live-dot" style="width:10px; height:10px;"></span>
                      </span>
                      <div>
                        <strong style="color:#b91c1c; font-size:0.92rem; text-transform:uppercase; letter-spacing:0.04em;">Evento en Desarrollo (EN VIVO)</strong>
                        <p style="margin:2px 0 0; font-size:0.8rem; color:#7f1d1d;">Este hackathon o competencia se está llevando a cabo en este momento de forma automática según su cronograma.</p>
                      </div>
                    </div>
                  ` : isCountdown ? `
                    <div style="background:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; gap:0.65rem;">
                      <span style="font-size:1.3rem;">⏳</span>
                      <div>
                        <strong style="color:#b45309; font-size:0.92rem; text-transform:uppercase; letter-spacing:0.04em;">Inicio Inminente (&lt; 48 Horas)</strong>
                        <p style="margin:2px 0 0; font-size:0.82rem; color:#92400e;">Faltan <strong>${formatCountdown(timing.diffMs)}</strong> para el inicio oficial. Apenas llegue a 0 pasará a EN VIVO automáticamente.</p>
                      </div>
                    </div>
                  ` : isFinished ? `
                    <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-left:4px solid #64748b; border-radius:8px; padding:10px 14px; margin-bottom:14px; color:#475569;">
                      <strong style="font-size:0.92rem; text-transform:uppercase; letter-spacing:0.04em; color:#334155;">🏁 Convocatoria Finalizada</strong>
                      <p style="margin:2px 0 0; font-size:0.82rem; color:#64748b;">Este evento o hackathon ya ha concluido su ciclo oficial de desarrollo.</p>
                    </div>
                  ` : ''}

                  ${isCancelled ? `
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #ef4444; border-radius:8px; padding:12px 14px; margin-bottom:14px; color:#991b1b;">
                      <h4 style="margin:0 0 6px; font-size:0.96rem; font-weight:800; display:flex; align-items:center; gap:0.4rem; color:#b91c1c;">
                        ${Icons.x('', 16)} Convocatoria Cancelada Oficialmente
                      </h4>
                      <p style="margin:0 0 4px; font-size:0.88rem; line-height:1.5; color:#7f1d1d;">
                        <strong>Motivo reportado a los estudiantes:</strong><br/>
                        ${ev.cancellationReason || 'Cancelado por fuerza mayor o reprogramación institucional.'}
                      </p>
                      ${ev.cancelledAt ? `<small style="display:block; color:#991b1b; font-size:0.75rem; margin-top:4px;">Fecha de cancelación: ${Badge.formatDate(ev.cancelledAt)}</small>` : ''}
                    </div>
                  ` : ''}

                  <p><strong>Organiza:</strong> ${ev.organizer}</p>
                  <p><strong>Fechas Programadas:</strong> ${ev.date}</p>
                  <p><strong>Ubicación / Sede:</strong> ${ev.location}</p>
                  <p><strong>Modalidad:</strong> ${ev.modality}</p>
                  <hr style="border:0;border-top:1px solid #e2e8f0;margin:10px 0;"/>
                  <p><strong>Descripción Detallada:</strong><br/>${ev.description}</p>
                  <p><strong>Premios e Incentivos:</strong><br/><span style="display:inline-flex; align-items:center; gap:0.35rem; color:#059669; font-weight:600;">${Icons.award('', 15)} <span>${ev.prizes || 'Menciones de honor y certificados'}</span></span></p>
                  <div style="background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;margin-top:12px;">
                    <strong>Requisitos de Participación:</strong>
                    <ul style="margin:4px 0 0 16px;padding:0;">
                      <li>Estudiantes universitarios de Cochabamba o egresados recientes.</li>
                      <li>Portar documento de identidad y equipo de cómputo portátil para el demoday.</li>
                      <li>Cumplir con el código de conducta ético del evento.</li>
                    </ul>
                  </div>
                  <div style="margin-top:12px;padding:8px 12px;background:#eff6ff;border-left:3px solid #0284c7;border-radius:4px;font-size:0.83rem;color:#1e3a8a;">
                    <strong>Difusión Informativa UPDS:</strong> Convocatoria tecnológica vinculada al ecosistema departamental. Las inscripciones se canalizan por los canales oficiales.
                  </div>
                </div>
              `,
              cancelText: 'Cerrar',
              confirmText: isCancelled ? null : isFinished ? 'Visitar Sitio del Evento ↗' : 'Ir al Sitio Oficial / Red Social ↗',
              onConfirm: isCancelled ? undefined : () => {
                window.open(ev.link, '_blank', 'noopener,noreferrer');
              },
            });
          }
        });
      });

      // Enlazar controles interactivos del slider de ejes temáticos
      container.querySelectorAll('.event-topics-track-box').forEach((box) => {
        const track = box.querySelector('.event-topics-pills-track');
        const prevBtn = box.querySelector('.topics-nav-prev');
        const nextBtn = box.querySelector('.topics-nav-next');
        if (!track) return;

        const updateArrows = () => {
          const maxScroll = track.scrollWidth - track.clientWidth;
          if (prevBtn) {
            prevBtn.style.display = track.scrollLeft > 6 ? 'inline-flex' : 'none';
          }
          if (nextBtn) {
            nextBtn.style.display = maxScroll > 6 && track.scrollLeft < maxScroll - 6 ? 'inline-flex' : 'none';
          }
        };

        setTimeout(updateArrows, 60);
        track.addEventListener('scroll', updateArrows, { passive: true });

        prevBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          track.scrollBy({ left: -140, behavior: 'smooth' });
        });

        nextBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          track.scrollBy({ left: 140, behavior: 'smooth' });
        });
      });
    };

    renderView();
    return container;
  },

  openEventModal(eventItem = null, onSaved = () => {}) {
    const isEdit = Boolean(eventItem);
    const title = isEdit ? 'Editar Evento / Hackathon' : 'Publicar Nuevo Evento o Hackathon';

    Modal.open({
      title,
      content: `
        <form id="event-modal-form" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="event-title-input">Título del Evento o Hackathon *</label>
            <input type="text" id="event-title-input" class="form-control" value="${eventItem?.title || ''}" placeholder="Ej. Hackathon Smart Cochabamba 2026" maxlength="90" required />
            <small class="form-help">Máximo 90 caracteres.</small>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="event-category-select">Categoría *</label>
              <select id="event-category-select" class="form-control" required>
                <option value="hackathon" ${eventItem?.category === 'hackathon' ? 'selected' : ''}>Hackathon / Prototipado</option>
                <option value="security" ${eventItem?.category === 'security' ? 'selected' : ''}>Torneo de Ciberseguridad / CTF</option>
                <option value="feria" ${eventItem?.category === 'feria' ? 'selected' : ''}>Feria / Emprendimiento Digital</option>
                <option value="taller" ${eventItem?.category === 'taller' ? 'selected' : ''}>Taller / Conferencia Tech</option>
              </select>
            </div>

            <div class="form-group col-6">
              <label class="form-label" for="event-badge-input">Estado / Convocatoria (Badge)</label>
              <input type="text" id="event-badge-input" class="form-control" value="${eventItem?.badge || 'Convocatoria Abierta'}" placeholder="Ej. Convocatoria Abierta" maxlength="35" />
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.9rem; margin-bottom:1rem;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.85rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="event-start-date-input">Fecha y Hora de Inicio (Bolivia) *</label>
                <input type="datetime-local" id="event-start-date-input" class="form-control" value="${toDateTimeLocalValue(eventItem?.startDate)}" required />
                <small class="form-help" style="margin-top:3px; display:block;">Hora oficial de Bolivia (UTC-4).</small>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="event-end-date-input">Fecha y Hora de Fin (Bolivia) *</label>
                <input type="datetime-local" id="event-end-date-input" class="form-control" value="${toDateTimeLocalValue(eventItem?.endDate)}" required />
                <small class="form-help" style="margin-top:3px; display:block;">Al cumplirse se marca como Finalizado.</small>
              </div>
            </div>

            <!-- Banner de Estado/Advertencia debajo a ancho completo 100% -->
            <div id="event-past-warning-box" style="display:none; width:100%; box-sizing:border-box; border-radius:8px; padding:0.65rem 0.85rem; margin-top:0.75rem; font-size:0.82rem; line-height:1.45;"></div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="event-organizer-input">Entidad Organizadora *</label>
              <input type="text" id="event-organizer-input" class="form-control" value="${eventItem?.organizer || ''}" placeholder="Ej. Alcaldía de Cochabamba & Hub Tech" maxlength="70" required />
            </div>

            <div class="form-group col-6">
              <label class="form-label" for="event-date-input">Texto Visible de Fechas *</label>
              <input type="text" id="event-date-input" class="form-control" value="${eventItem?.date || ''}" placeholder="Ej. 28 de Octubre (11:00 AM) al 17 de Noviembre, 2026" maxlength="80" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="event-location-input">Sede / Recinto Ferial *</label>
              <input type="text" id="event-location-input" class="form-control" value="${eventItem?.location || ''}" placeholder="Ej. Recinto Ferial Alalay / Virtual" maxlength="80" required />
            </div>

            <div class="form-group col-6">
              <label class="form-label" for="event-modality-select">Modalidad *</label>
              <select id="event-modality-select" class="form-control" required>
                <option value="Presencial" ${eventItem?.modality?.includes('Presencial') ? 'selected' : ''}>Presencial</option>
                <option value="Virtual" ${eventItem?.modality?.includes('Virtual') ? 'selected' : ''}>Virtual</option>
                <option value="Híbrida" ${eventItem?.modality?.includes('Híbrida') ? 'selected' : ''}>Híbrida</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="event-link-input">Enlace Oficial de Convocatoria / Red Social *</label>
            <input type="url" id="event-link-input" class="form-control" value="${eventItem?.link || ''}" placeholder="https://cochabamba.bo/evento" maxlength="250" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-prizes-input">Premios e Incentivos</label>
            <input type="text" id="event-prizes-input" class="form-control" value="${eventItem?.prizes || ''}" placeholder="Ej. Premios en efectivo, capital semilla e incubación." maxlength="140" />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-topics-input">Ejes Temáticos (separados por coma)</label>
            <input type="text" id="event-topics-input" class="form-control" value="${(eventItem?.topics || []).join(', ')}" placeholder="Ej. Inteligencia Artificial, Smart Cities, Criptografía" maxlength="160" />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-desc-input">Descripción Detallada *</label>
            <textarea id="event-desc-input" class="form-control" rows="3" placeholder="Detalla el objetivo del reto, bases y beneficios para los participantes." maxlength="700" required>${eventItem?.description || ''}</textarea>
            <small class="form-help">Máximo 700 caracteres.</small>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Publicar Convocatoria',
      onConfirm: async (dialog) => {
        const titleVal = dialog.querySelector('#event-title-input').value.trim();
        const categoryVal = dialog.querySelector('#event-category-select').value;
        const badgeVal = dialog.querySelector('#event-badge-input').value.trim();
        const startDateRaw = dialog.querySelector('#event-start-date-input').value;
        const endDateRaw = dialog.querySelector('#event-end-date-input').value;
        const organizerVal = dialog.querySelector('#event-organizer-input').value.trim();
        const dateVal = dialog.querySelector('#event-date-input').value.trim();
        const locationVal = dialog.querySelector('#event-location-input').value.trim();
        const modalityVal = dialog.querySelector('#event-modality-select').value;
        const linkVal = dialog.querySelector('#event-link-input').value.trim();
        const prizesVal = dialog.querySelector('#event-prizes-input').value.trim();
        const topicsRaw = dialog.querySelector('#event-topics-input').value;
        const descVal = dialog.querySelector('#event-desc-input').value.trim();

        if (!titleVal || !startDateRaw || !endDateRaw || !organizerVal || !dateVal || !locationVal || !linkVal || !descVal) {
          Toast.error('Por favor completa todos los campos obligatorios (*), incluyendo las fechas de inicio y fin.');
          return false;
        }

        const startIso = parseBoliviaDateTime(startDateRaw);
        const endIso = parseBoliviaDateTime(endDateRaw);

        if (new Date(endIso) <= new Date(startIso)) {
          Toast.warning('La fecha de fin debe ser posterior a la fecha de inicio.');
          return false;
        }

        const isAlreadyFinished = new Date(endIso).getTime() <= Date.now();

        const doSave = () => {
          const topics = topicsRaw
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          const currentEvents = getStoredEvents();
          if (isEdit) {
            const index = currentEvents.findIndex((e) => e.id === eventItem.id);
            if (index !== -1) {
              currentEvents[index] = {
                ...currentEvents[index],
                title: titleVal,
                category: categoryVal,
                badge: badgeVal || (isAlreadyFinished ? 'Finalizado' : 'Convocatoria Abierta'),
                startDate: startIso,
                endDate: endIso,
                organizer: organizerVal,
                date: dateVal,
                location: locationVal,
                modality: modalityVal,
                link: linkVal,
                prizes: prizesVal,
                topics: topics.length ? topics : ['Tecnología', 'Innovación'],
                description: descVal,
              };
            }
            saveStoredEvents(currentEvents);
            if (isAlreadyFinished) {
              Toast.warning('Evento guardado como "Finalizado" (la fecha de fin ya expiró en la hora de Bolivia).');
            } else {
              Toast.success('Evento tecnológico actualizado correctamente.');
            }
          } else {
            const newEvent = {
              id: `event-${Date.now()}`,
              title: titleVal,
              category: categoryVal,
              badge: badgeVal || (isAlreadyFinished ? 'Finalizado' : 'Convocatoria Abierta'),
              status: 'active',
              startDate: startIso,
              endDate: endIso,
              organizer: organizerVal,
              date: dateVal,
              location: locationVal,
              modality: modalityVal,
              link: linkVal,
              prizes: prizesVal || 'Reconocimientos y certificados de participación',
              topics: topics.length ? topics : ['Tecnología', 'Innovación'],
              description: descVal,
            };
            currentEvents.unshift(newEvent);
            saveStoredEvents(currentEvents);
            if (isAlreadyFinished) {
              Toast.warning('¡Convocatoria publicada directamente como "Finalizado" en el catálogo!');
            } else {
              Toast.success('¡Nueva Hackathon / Convocatoria publicada con éxito!');
              // Notificar automáticamente a los estudiantes sobre nueva hackathon/convocatoria
              try {
                const students = (store.getState().users || []).filter((u) => u.role === 'student');
                for (const student of students) {
                  api.notifications.create({
                    userId: student.id,
                    title: `Nueva Convocatoria: ${titleVal.slice(0, 30)}`,
                    message: `¡Se abrió la convocatoria para "${titleVal}"! Revisa las bases del reto tecnológico.`,
                    type: 'info',
                  }).catch(() => {});
                }
              } catch (errN) {
                console.warn('Error notificando evento a estudiantes:', errN);
              }
            }
          }

          onSaved();
          return true;
        };

        // Si el evento está finalizado, guardar limpiamente sin abrir confirmaciones que destruyan el modal
        if (isAlreadyFinished && !isEdit) {
          doSave();
          Toast.warning('Convocatoria publicada directamente como "Finalizado" en el catálogo.');
          return true;
        }

        return doSave();
      },
    });

    // Verificación reactiva en vivo mientras el usuario selecciona fechas
    setTimeout(() => {
      const endInput = document.getElementById('event-end-date-input');
      const warnBox = document.getElementById('event-past-warning-box');
      const warnClock = document.getElementById('warn-now-clock');

      const checkPastDate = () => {
        if (!endInput || !warnBox) return;
        const val = endInput.value;
        if (warnClock) warnClock.textContent = Badge.getNowBoliviaString();
        if (val) {
          const endIso = parseBoliviaDateTime(val);
          const endMs = new Date(endIso).getTime();
          if (endMs <= Date.now()) {
            warnBox.style.display = 'flex';
            warnBox.style.alignItems = 'flex-start';
            warnBox.style.gap = '0.65rem';

            const wasAlreadyPast = isEdit && (eventItem?.badge === 'Finalizado' || new Date(eventItem?.endDate || 0).getTime() <= Date.now());

            if (wasAlreadyPast) {
              warnBox.style.background = '#f0f9ff';
              warnBox.style.border = '1px solid #bae6fd';
              warnBox.style.borderLeft = '4px solid #0284c7';
              warnBox.style.color = '#0369a1';
              warnBox.innerHTML = `
                <span style="font-size:1.2rem; line-height:1; flex-shrink:0;">ℹ️</span>
                <div>
                  <strong style="color:#0284c7;">Evento Concluido / Histórico Oficial</strong>
                  <p style="margin:2px 0 0; line-height:1.45; color:#075985;">
                    Este evento ya concluyó en la fecha establecida (${Badge.formatDate(eventItem?.endDate)}). Puedes actualizar sus enlaces, descripción, premios o ejes temáticos libremente conservando su registro en el catálogo.
                  </p>
                </div>
              `;
            } else {
              warnBox.style.background = '#fff1f2';
              warnBox.style.border = '1px solid #fecdd3';
              warnBox.style.borderLeft = '4px solid #e11d48';
              warnBox.style.color = '#9f1239';
              warnBox.innerHTML = `
                <span style="font-size:1.2rem; line-height:1; flex-shrink:0;">⚠️</span>
                <div>
                  <strong style="color:#be123c;">Aviso: La fecha de finalización ya expiró</strong>
                  <p style="margin:2px 0 0; line-height:1.45; color:#881337;">
                    La fecha ingresada es anterior a la fecha y hora actual de Bolivia (${Badge.getNowBoliviaString()}).
                    Este evento se guardará en estado <strong>"FINALIZADO"</strong>. Si fue una equivocación, rectifica el día, mes o año.
                  </p>
                </div>
              `;
            }
          } else {
            warnBox.style.display = 'none';
          }
        } else {
          warnBox.style.display = 'none';
        }
      };

      endInput?.addEventListener('input', checkPastDate);
      endInput?.addEventListener('change', checkPastDate);
      checkPastDate();
    }, 60);
  },

  confirmDelete(eventItem, onDeleted = () => {}) {
    Modal.confirm({
      title: '¿Eliminar Convocatoria?',
      message: `¿Estás seguro de eliminar el evento <strong>${eventItem.title}</strong> del catálogo departamental?`,
      confirmText: 'Sí, Eliminar Convocatoria',
      onConfirm: async () => {
        const currentEvents = getStoredEvents().filter((e) => e.id !== eventItem.id);
        saveStoredEvents(currentEvents);
        Toast.success('Convocatoria eliminada correctamente.');
        onDeleted();
      },
    });
  },

  openCancelModal(eventItem, onCancelled = () => {}) {
    Modal.open({
      title: `Cancelar Convocatoria: ${eventItem.title}`,
      danger: true,
      content: `
        <form id="cancel-event-form" class="modal-form">
          <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #ef4444; border-radius:6px; padding:10px 12px; margin-bottom:1rem; color:#991b1b; font-size:0.85rem;">
            <strong>Aviso de Cancelación:</strong> Esta convocatoria pasará a estado <strong>"Cancelado"</strong> y el motivo será visible públicamente para los estudiantes.
          </div>

          <div class="form-group">
            <label class="form-label" for="cancel-reason-type">Motivo Principal de Cancelación *</label>
            <select id="cancel-reason-type" class="form-control" required>
              <option value="Fuerza mayor o reprogramación por la entidad organizadora">Fuerza mayor o reprogramación por el organizador</option>
              <option value="Cambio de cronograma departamental en Cochabamba">Cambio de cronograma departamental en Cochabamba</option>
              <option value="Cupos agotados o cierre anticipado de postulaciones">Cupos agotados o cierre anticipado</option>
              <option value="Suspensión oficial del evento por el municipio / entidad aliada">Suspensión oficial por el municipio o entidad aliada</option>
              <option value="custom">Otro motivo específico (personalizado)...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="cancel-reason-text">Explicación o Detalle para los Estudiantes *</label>
            <textarea id="cancel-reason-text" class="form-control" rows="3" placeholder="Explica a los estudiantes la razón de la cancelación..." maxlength="250" required>La convocatoria ha sido cancelada por la entidad organizadora debido a fuerza mayor o reprogramación. Estaremos notificando cualquier actualización oficial.</textarea>
            <small class="form-help">Mínimo 5 caracteres, máximo 250. Este texto se mostrará en la tarjeta del evento y en la vista de bases.</small>
          </div>
        </form>
      `,
      confirmText: 'Confirmar Cancelación',
      cancelText: 'Volver',
      onConfirm: async (dialog) => {
        const reasonText = dialog.querySelector('#cancel-reason-text').value.trim();
        if (reasonText.length < 5) {
          Toast.warning('El motivo debe tener al menos 5 caracteres.');
          return false;
        }

        const currentEvents = getStoredEvents();
        const index = currentEvents.findIndex((e) => e.id === eventItem.id);
        if (index !== -1) {
          currentEvents[index] = {
            ...currentEvents[index],
            status: 'cancelled',
            badge: 'Cancelado',
            badgeColor: '#ef4444',
            cancellationReason: reasonText,
            cancelledAt: new Date().toISOString(),
          };
          saveStoredEvents(currentEvents);
          Toast.warning('La convocatoria ha sido cancelada y el motivo ya se refleja a los estudiantes.');
          onCancelled();
          return true;
        }
        return false;
      },
    });

    const select = document.getElementById('cancel-reason-type');
    const textarea = document.getElementById('cancel-reason-text');
    select?.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        textarea.value = '';
        textarea.focus();
      } else {
        textarea.value = `La convocatoria ha sido cancelada por el siguiente motivo: ${e.target.value}.`;
      }
    });
  },

  confirmReactivate(eventItem, onReactivated = () => {}) {
    Modal.confirm({
      title: '¿Reactivar Convocatoria?',
      message: `¿Deseas reactivar la convocatoria de <strong>"${eventItem.title}"</strong>? Se restablecerá como abierta y el motivo de cancelación será retirado.`,
      confirmText: 'Sí, Reactivar Convocatoria',
      onConfirm: async () => {
        const currentEvents = getStoredEvents();
        const index = currentEvents.findIndex((e) => e.id === eventItem.id);
        if (index !== -1) {
          currentEvents[index] = {
            ...currentEvents[index],
            status: 'active',
            badge: 'Convocatoria Abierta',
            badgeColor: '#059669',
            cancellationReason: null,
            cancelledAt: null,
          };
          saveStoredEvents(currentEvents);
          Toast.success('Convocatoria reactivada exitosamente.');
          onReactivated();
        }
      },
    });
  },
};

