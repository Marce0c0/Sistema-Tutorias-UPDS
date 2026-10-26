// Vista de Hackathons y Eventos Tecnológicos Externos (Cochabamba) — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { Icons } from '../components/Icons.js';
import { can } from '../utils/permissions.js';

export const DEFAULT_EVENTS = [
  {
    id: 'hackathon-cbba-2026',
    title: 'Hackathon Cochabamba Innova Tech 2026',
    category: 'hackathon',
    organizer: 'Alcaldía de Cochabamba & Hub de Innovación Tech',
    badge: 'Convocatoria Abierta',
    badgeColor: '#dc2626',
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
    date: '1 al 3 de Diciembre, 2026',
    location: 'Paseo de El Prado / Centro de Convenciones Cochabamba',
    modality: 'Exhibición Presencial y Networking Abierto',
    description: 'Encuentro anual del ecosistema de software y startups de Cochabamba. Muestra de proyectos universitarios destacados y ronda de vinculación laboral con empresas IT.',
    topics: ['Startups y FinTech', 'Software Factory Showcase', 'Networking con Empresas', 'Talleres Abiertos'],
    prizes: 'Acceso directo a rondas de inversión y pasantías técnicas en empresas aliadas.',
    link: 'https://cochabamba.bo/llajta-tech',
  },
];

export const getStoredEvents = () => {
  try {
    const raw = localStorage.getItem('upds_events_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_EVENTS;
};

export const saveStoredEvents = (events) => {
  try {
    localStorage.setItem('upds_events_v1', JSON.stringify(events));
  } catch {}
  store.setEvents(events);
};

export const EVENTS_DATA = getStoredEvents();

export const EventsView = {
  render() {
    const state = store.getState();
    const canManage = can(state.activeUser?.role, 'events.manage');
    let eventsData = getStoredEvents();

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const renderView = () => {
      eventsData = getStoredEvents();
      container.innerHTML = `
        <div class="view-header">
          <div>
            <h2 class="view-title" style="display:flex;align-items:center;gap:0.5rem;">
              ${Icons.trophy('', 22)} <span>Eventos & Hackathons Tecnológicos — Cochabamba</span>
            </h2>
            <p class="view-subtitle">Convocatorias externas, desafíos de innovación Smart City y torneos impulsados por la Alcaldía de Cochabamba y aliados del ecosistema.</p>
          </div>
          ${canManage ? `
            <div class="view-actions">
              <button id="btn-create-event" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.45rem;">
                ${Icons.trophy('', 16)} <span>+ Publicar Hackathon / Evento</span>
              </button>
            </div>
          ` : ''}
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

        <div class="cards-grid" id="events-cards-grid">
          ${eventsData
            .map(
              (ev) => `
            <div class="card event-card">
              <div>
                <div class="event-card-header" style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                  <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                    <span class="event-badge-status">${ev.badge || 'Convocatoria'}</span>
                    <span class="event-badge-location" style="display:inline-flex;align-items:center;gap:0.3rem;">${Icons.pin('', 12)} Cochabamba</span>
                  </div>
                  ${canManage ? `
                    <div class="event-admin-actions" style="display:inline-flex; align-items:center; gap:0.3rem;">
                      <button class="btn btn-xs btn-outline btn-edit-event" data-id="${ev.id}" title="Editar Convocatoria" style="display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                        ${Icons.edit('', 12)}
                      </button>
                      <button class="btn btn-xs btn-danger-outline btn-delete-event" data-id="${ev.id}" title="Eliminar Convocatoria" style="display:inline-flex; align-items:center; justify-content:center; padding:4px 7px;">
                        ${Icons.trash('', 12)}
                      </button>
                    </div>
                  ` : ''}
                </div>

                <h3 class="event-title" style="margin-top:0.6rem;">${ev.title}</h3>
                <p class="event-desc">${ev.description}</p>

                <div class="event-meta-box">
                  <div class="event-meta-row">
                    <span class="event-meta-label" style="display:inline-flex;align-items:center;gap:0.35rem;">${Icons.building('', 13)} Organizador:</span>
                    <span class="event-meta-val">${ev.organizer}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label" style="display:inline-flex;align-items:center;gap:0.35rem;">${Icons.calendar('', 13)} Fechas:</span>
                    <span class="event-meta-val">${ev.date}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label" style="display:inline-flex;align-items:center;gap:0.35rem;">${Icons.pin('', 13)} Sede:</span>
                    <span class="event-meta-val">${ev.location}</span>
                  </div>
                  <div class="event-meta-row">
                    <span class="event-meta-label" style="display:inline-flex;align-items:center;gap:0.35rem;">${Icons.users('', 13)} Modalidad:</span>
                    <span class="event-meta-val">${ev.modality}</span>
                  </div>
                </div>

                <div class="event-topics-container">
                  <span class="event-topics-label">Ejes Temáticos:</span>
                  <div class="event-topics-pills">
                    ${(ev.topics || []).map((t) => `<span class="event-topic-pill">${t}</span>`).join('')}
                  </div>
                </div>
              </div>

              <div class="event-card-footer">
                <button class="btn btn-sm btn-outline btn-event-details" data-id="${ev.id}" style="gap:0.4rem;">
                  ${Icons.fileText('', 14)} <span>Ver Bases</span>
                </button>
                <a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" title="Abrir sitio web o red social de la convocatoria" style="gap:0.4rem;">
                  ${Icons.rocket('', 14)} <span>Ir a Convocatoria</span> ${Icons.external('', 12)}
                </a>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;

      // Enlazar botón de creación para admin
      container.querySelector('#btn-create-event')?.addEventListener('click', () => {
        EventsView.openEventModal(null, renderView);
      });

      // Enlazar botones de edición y eliminación
      container.querySelectorAll('.btn-edit-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = eventsData.find((item) => item.id === id);
          if (ev) EventsView.openEventModal(ev, renderView);
        });
      });

      container.querySelectorAll('.btn-delete-event').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const ev = eventsData.find((item) => item.id === id);
          if (ev) EventsView.confirmDelete(ev, renderView);
        });
      });

      // Enlazar modales de detalles de eventos
      container.querySelectorAll('.btn-event-details').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const ev = eventsData.find((e) => e.id === id);
          if (ev) {
            Modal.open({
              title: `Bases del Evento — ${ev.title}`,
              content: `
                <div style="font-size:0.92rem;line-height:1.6;">
                  <p><strong>Organiza:</strong> ${ev.organizer}</p>
                  <p><strong>Ubicación:</strong> ${ev.location}</p>
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
                    <strong>Difusión Informativa UPDS:</strong> Convocatoria externa a la universidad. La inscripción se formaliza directamente en la web o red social del organizador.
                  </div>
                </div>
              `,
              cancelText: 'Cerrar',
              confirmText: 'Ir al Sitio Oficial / Red Social ↗',
              onConfirm: () => {
                window.open(ev.link, '_blank', 'noopener,noreferrer');
              },
            });
          }
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
            <input type="text" id="event-title-input" class="form-control" value="${eventItem?.title || ''}" placeholder="Ej. Hackathon Smart Cochabamba 2026" required />
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
              <label class="form-label" for="event-badge-input">Estado de Convocatoria (Badge) *</label>
              <input type="text" id="event-badge-input" class="form-control" value="${eventItem?.badge || 'Convocatoria Abierta'}" placeholder="Ej. Convocatoria Abierta" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="event-organizer-input">Entidad Organizadora *</label>
              <input type="text" id="event-organizer-input" class="form-control" value="${eventItem?.organizer || ''}" placeholder="Ej. Alcaldía de Cochabamba & Hub Tech" required />
            </div>

            <div class="form-group col-6">
              <label class="form-label" for="event-date-input">Fechas del Evento *</label>
              <input type="text" id="event-date-input" class="form-control" value="${eventItem?.date || ''}" placeholder="Ej. 10 al 12 de Noviembre, 2026" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label" for="event-location-input">Sede / Recinto Ferial *</label>
              <input type="text" id="event-location-input" class="form-control" value="${eventItem?.location || ''}" placeholder="Ej. Recinto Ferial Alalay / Virtual" required />
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
            <input type="url" id="event-link-input" class="form-control" value="${eventItem?.link || ''}" placeholder="https://cochabamba.bo/evento" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-prizes-input">Premios e Incentivos</label>
            <input type="text" id="event-prizes-input" class="form-control" value="${eventItem?.prizes || ''}" placeholder="Ej. Premios en efectivo, capital semilla e incubación." />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-topics-input">Ejes Temáticos (separados por coma)</label>
            <input type="text" id="event-topics-input" class="form-control" value="${(eventItem?.topics || []).join(', ')}" placeholder="Ej. Inteligencia Artificial, Smart Cities, Criptografía" />
          </div>

          <div class="form-group">
            <label class="form-label" for="event-desc-input">Descripción Detallada *</label>
            <textarea id="event-desc-input" class="form-control" rows="3" placeholder="Detalla el objetivo del reto, bases y beneficios para los participantes." required>${eventItem?.description || ''}</textarea>
          </div>
        </form>
      `,
      confirmText: isEdit ? 'Guardar Cambios' : 'Publicar Convocatoria',
      onConfirm: async (dialog) => {
        const titleVal = dialog.querySelector('#event-title-input').value.trim();
        const categoryVal = dialog.querySelector('#event-category-select').value;
        const badgeVal = dialog.querySelector('#event-badge-input').value.trim();
        const organizerVal = dialog.querySelector('#event-organizer-input').value.trim();
        const dateVal = dialog.querySelector('#event-date-input').value.trim();
        const locationVal = dialog.querySelector('#event-location-input').value.trim();
        const modalityVal = dialog.querySelector('#event-modality-select').value;
        const linkVal = dialog.querySelector('#event-link-input').value.trim();
        const prizesVal = dialog.querySelector('#event-prizes-input').value.trim();
        const topicsRaw = dialog.querySelector('#event-topics-input').value;
        const descVal = dialog.querySelector('#event-desc-input').value.trim();

        if (!titleVal || !organizerVal || !dateVal || !locationVal || !linkVal || !descVal) {
          Toast.error('Por favor completa todos los campos obligatorios (*).');
          return false;
        }

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
              badge: badgeVal || 'Convocatoria Abierta',
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
          Toast.success('Evento tecnológico actualizado correctamente.');
        } else {
          const newEvent = {
            id: `event-${Date.now()}`,
            title: titleVal,
            category: categoryVal,
            badge: badgeVal || 'Convocatoria Abierta',
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
          Toast.success('¡Nueva Hackathon / Convocatoria publicada con éxito!');
        }

        onSaved();
        return true;
      },
    });
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
};

