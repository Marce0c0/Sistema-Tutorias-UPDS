// Vista de Inicio y Acceso — Sistema-Tutoriales-UPDS
// Permite iniciar sesión con JWT o ingresar en Modo Invitado para ver cursos
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';
import { withButtonLoading } from '../utils/button.js';
import { Icons } from '../components/Icons.js';
import { getStoredEvents } from './EventsView.js';

export const WelcomeView = {
  render() {
    const state = store.getState();
    const computeCounts = (s) => ({
      courses: (s.courses || []).filter((c) => !c.title.toLowerCase().includes('hackathon') && !c.title.toLowerCase().includes('ctf')).length,
      tutorias: (s.tutorias || []).filter((t) => !t.title.toLowerCase().includes('hackathon') && !t.title.toLowerCase().includes('ctf')).length,
      events: (s.events && s.events.length > 0 ? s.events : getStoredEvents()).length,
    });

    const initialCounts = computeCounts(state);

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in welcome-view-container';

    container.innerHTML = `
      <div class="welcome-hero-card">
        <div class="welcome-grid">
          <!-- Tarjeta 1: Autenticación con JWT (con Logo UPDS en su interior) -->
          <div class="welcome-panel auth-panel">
            <div class="auth-panel-logo-box" style="text-align:center; margin-bottom:1.25rem;">
              <div style="display:inline-flex; align-items:center; justify-content:center; background:#ffffff; padding:6px 14px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:var(--shadow-sm); margin-bottom:0.65rem;">
                <img src="img/upds-logo.png" alt="Universidad Privada Domingo Savio" style="height:46px; width:auto; object-fit:contain; display:block;" />
              </div>
              <h2 class="panel-title" style="font-size:1.35rem; color:var(--primary-navy); margin-bottom:0.2rem;">Iniciar Sesión</h2>
              <p class="panel-desc">Accede con tu cuenta institucional protegida con JWT</p>
            </div>

            <form id="welcome-login-form" class="welcome-form" onsubmit="return false;">
              <div class="form-group">
                <label class="form-label" for="welcome-email">Correo Institucional:</label>
                <input type="email" id="welcome-email" class="form-control" placeholder="ej. admin@upds.edu.bo" required autocomplete="email" />
              </div>

              <div class="form-group">
                <label class="form-label" for="welcome-password">Contraseña:</label>
                <input type="password" id="welcome-password" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
              </div>

              <button type="submit" id="welcome-login-btn" class="btn btn-primary btn-block btn-lg" style="margin-top: 1rem; width:100%; justify-content:center; gap:0.5rem;">
                ${Icons.login('', 18)} <span>Ingresar con JWT</span>
              </button>
            </form>

            <div class="quick-credentials-box">
              <div class="quick-creds-title" style="display:flex; align-items:center; gap:0.4rem;">
                ${Icons.zap('', 15)} <span>Acceso Rápido de Prueba (Clave: <code>Upds2026</code>)</span>
              </div>
              <div class="quick-creds-list">
                <button type="button" class="btn-quick-fill" data-email="admin@upds.edu.bo" style="display:flex; align-items:center; gap:0.45rem;">
                  ${Icons.shield('', 14)} <span><strong>Admin:</strong> admin@upds.edu.bo</span>
                </button>
                <button type="button" class="btn-quick-fill" data-email="maria@tutor.com" style="display:flex; align-items:center; gap:0.45rem;">
                  ${Icons.cap('', 14)} <span><strong>Tutor:</strong> maria@tutor.com</span>
                </button>
                <button type="button" class="btn-quick-fill" data-email="juan@estudiante.com" style="display:flex; align-items:center; gap:0.45rem;">
                  ${Icons.user('', 14)} <span><strong>Estudiante:</strong> juan@estudiante.com</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Modo Invitado (Explorar Cursos sin Login) -->
          <div class="welcome-panel guest-panel">
            <div class="panel-header" style="margin-bottom:1.25rem;">
              <span class="panel-icon" style="color:var(--primary-navy); display:inline-flex;">
                ${Icons.globe('', 28)}
              </span>
              <div>
                <h2 class="panel-title">Modo Invitado</h2>
                <p class="panel-desc">Explora cursos extracurriculares y clases extra sin iniciar sesión</p>
              </div>
            </div>

            <div class="guest-info-body">
              <p class="guest-text">
                Programas de formación complementaria, talleres prácticos y clases extra especializadas impartidas por docentes universitarios, independientes a las materias regulares.
              </p>

              <!-- Métricas Reales Actualizadas (Cursos, Tutorías y Eventos) -->
              <div class="guest-metrics-row" style="grid-template-columns: repeat(3, 1fr); gap: 0.6rem;">
                <div class="guest-metric-pill">
                  <span class="pill-number" id="guest-pill-courses">${initialCounts.courses}</span>
                  <span class="pill-label">Cursos / Talleres</span>
                </div>
                <div class="guest-metric-pill">
                  <span class="pill-number" id="guest-pill-tutorias">${initialCounts.tutorias}</span>
                  <span class="pill-label">Clases & Tutorías</span>
                </div>
                <div class="guest-metric-pill">
                  <span class="pill-number" id="guest-pill-events">${initialCounts.events}</span>
                  <span class="pill-label">Eventos & Hackathons</span>
                </div>
              </div>

              <ul class="guest-features-list">
                <li><span style="color:#009640; display:inline-flex;">${Icons.check('', 14)}</span> Explora talleres técnicos, bootcamps y cursos de extensión.</li>
                <li><span style="color:#009640; display:inline-flex;">${Icons.check('', 14)}</span> Consulta fechas, horarios y docentes universitarios asignados.</li>
                <li><span style="color:#009640; display:inline-flex;">${Icons.check('', 14)}</span> Convocatorias a Hackathons municipales y torneos tech en Cochabamba.</li>
                <li><span style="color:#009640; display:inline-flex;">${Icons.check('', 14)}</span> Abierto para estudiantes, egresados e interesados en la oferta académica.</li>
              </ul>

              <button type="button" id="enter-guest-btn" class="btn btn-outline-primary btn-block btn-lg" style="width:100%; justify-content:center; margin-top:1.25rem; gap:0.5rem;">
                ${Icons.compass('', 18)} <span>Explorar en Modo Invitado</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Suscribirse para mantener las métricas 100% sincronizadas en tiempo real
    store.subscribe(() => {
      const liveCounts = computeCounts(store.getState());
      const pillC = container.querySelector('#guest-pill-courses');
      const pillT = container.querySelector('#guest-pill-tutorias');
      const pillE = container.querySelector('#guest-pill-events');
      if (pillC) pillC.textContent = liveCounts.courses;
      if (pillT) pillT.textContent = liveCounts.tutorias;
      if (pillE) pillE.textContent = liveCounts.events;
    });

    // ─── Eventos del Formulario de Login ─────────────────────────────────────
    const form = container.querySelector('#welcome-login-form');
    form.addEventListener('submit', async () => {
      const emailInput = container.querySelector('#welcome-email');
      const passInput = container.querySelector('#welcome-password');
      const email = emailInput?.value.trim();
      const password = passInput?.value;

      if (!email || !password) {
        Toast.warning('Por favor ingrese correo y contraseña.');
        return;
      }

      const submitBtn = container.querySelector('#welcome-login-btn');
      await withButtonLoading(submitBtn, async () => {
        try {
          const res = await api.auth.login({ email, password });
          if (res.token && res.user) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('authUser', JSON.stringify(res.user));
            localStorage.removeItem('guestMode');
            store.setActiveUser(res.user);
            store.setView('dashboard');
            Toast.success(`¡Bienvenido/a ${res.user.name}! Sesión JWT iniciada.`);
            // Cargar datos protegidos
            api.users.getAll().then((list) => store.setUsers(list)).catch(() => {});
            api.notifications.getAll().then((list) => store.setNotifications(list)).catch(() => {});
          }
        } catch (err) {
          Toast.error(err.message || 'Credenciales incorrectas.');
        }
      }, 'Autenticando...');
    });

    // Rellenar credenciales rápidas
    container.querySelectorAll('.btn-quick-fill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const emailInput = container.querySelector('#welcome-email');
        const passInput = container.querySelector('#welcome-password');
        if (emailInput && passInput) {
          emailInput.value = email;
          passInput.value = 'Upds2026';
          passInput.focus();
          Toast.info(`Credencial cargada: ${email}`);
        }
      });
    });

    // Entrar en Modo Invitado
    container.querySelector('#enter-guest-btn').addEventListener('click', () => {
      localStorage.setItem('guestMode', 'true');
      store.setActiveUser({
        id: 'guest',
        name: 'Invitado',
        email: 'invitado@upds.edu.bo',
        role: 'guest',
      });
      store.setView('courses');
      Toast.info('Accediendo en Modo Invitado: puedes consultar el catálogo de materias.');
    });

    return container;
  },
};
