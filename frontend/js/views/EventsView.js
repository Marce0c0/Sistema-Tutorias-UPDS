// Vista de Hackathons y Eventos Tecnológicos Externos (Cochabamba) — Sistema-Tutoriales-UPDS
import { store } from '../state/store.js';
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export const EventsView = {
  render() {
    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in';

    const eventsData = [
      {
        id: 'hackathon-cbba-2026',
        title: 'Hackathon Cochabamba Innova Tech 2026',
        category: 'hackathon',
        organizer: 'Alcaldía de Cochabamba & Hub de Innovación Tech',
        badge: '🔥 Convocatoria Abierta',
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
        badge: '⚡ Clasificatoria Virtual',
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
        badge: '📅 Próximamente (Diciembre 2026)',
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

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2 class="view-title">🏆 Eventos & Hackathons Tecnológicos — Cochabamba</h2>
          <p class="view-subtitle">Convocatorias externas, desafíos de innovación Smart City y torneos impulsados por la Alcaldía de Cochabamba y aliados del ecosistema.</p>
        </div>
      </div>

      <div class="events-disclaimer-card">
        <span class="events-disclaimer-icon">🏛️</span>
        <div>
          <h3 class="events-disclaimer-title">Vinculación con el Ecosistema Tecnológico de Cochabamba</h3>
          <p class="events-disclaimer-desc">
            Iniciativas co-organizadas con la <strong>Alcaldía de Cochabamba</strong>, empresas y comunidades tech. La UPDS promueve la participación activa de sus estudiantes y postulantes externos en hackathons y competencias departamentales.
          </p>
        </div>
      </div>

      <div class="cards-grid">
        ${eventsData
          .map(
            (ev) => `
          <div class="card event-card">
            <div>
              <div class="event-card-header">
                <span class="event-badge-status">${ev.badge}</span>
                <span class="event-badge-location">📍 Cochabamba</span>
              </div>

              <h3 class="event-title">${ev.title}</h3>
              <p class="event-desc">${ev.description}</p>

              <div class="event-meta-box">
                <div class="event-meta-row">
                  <span class="event-meta-label">🏛️ Organizador:</span>
                  <span class="event-meta-val">${ev.organizer}</span>
                </div>
                <div class="event-meta-row">
                  <span class="event-meta-label">📅 Fechas:</span>
                  <span class="event-meta-val">${ev.date}</span>
                </div>
                <div class="event-meta-row">
                  <span class="event-meta-label">📍 Sede:</span>
                  <span class="event-meta-val">${ev.location}</span>
                </div>
                <div class="event-meta-row">
                  <span class="event-meta-label">👥 Modalidad:</span>
                  <span class="event-meta-val">${ev.modality}</span>
                </div>
              </div>

              <div class="event-topics-container">
                <span class="event-topics-label">Ejes Temáticos:</span>
                <div class="event-topics-pills">
                  ${ev.topics.map((t) => `<span class="event-topic-pill">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <div class="event-card-footer">
              <button class="btn btn-sm btn-primary btn-event-details" data-id="${ev.id}">
                📋 Ver Bases
              </button>
              <button class="btn btn-sm btn-outline btn-event-register" data-id="${ev.id}">
                🚀 Participar
              </button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

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
                <p><strong>Premios e Incentivos:</strong><br/><span style="color:#059669;font-weight:600;">🏆 ${ev.prizes}</span></p>
                <div style="background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;margin-top:12px;">
                  <strong>Requisitos de Participación:</strong>
                  <ul style="margin:4px 0 0 16px;padding:0;">
                    <li>Estudiantes universitarios de Cochabamba o egresados recientes.</li>
                    <li>Portar documento de identidad y equipo de cómputo portátil para el demoday.</li>
                    <li>Cumplir con el código de conducta ético del evento.</li>
                  </ul>
                </div>
              </div>
            `,
            confirmText: 'Entendido / Cerrar',
          });
        }
      });
    });

    container.querySelectorAll('.btn-event-register').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const ev = eventsData.find((e) => e.id === id);
        if (ev) {
          Toast.success(`¡Registro de interés guardado para: ${ev.title}! Te notificaremos convocatorias de equipo.`);
        }
      });
    });

    return container;
  },
};
