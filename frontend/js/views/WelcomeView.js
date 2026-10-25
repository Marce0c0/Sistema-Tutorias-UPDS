// Vista de Inicio y Acceso — Sistema-Tutoriales-UPDS
// Permite iniciar sesión con JWT o ingresar en Modo Invitado para ver cursos
import { store } from '../state/store.js';
import { api } from '../services/api.js';
import { Toast } from '../components/Toast.js';

export const WelcomeView = {
  render() {
    const state = store.getState();
    const coursesCount = state.courses.length || 0;
    const tutoriasCount = state.tutorias.length || 0;

    const container = document.createElement('div');
    container.className = 'view-content animate-fade-in welcome-view-container';

    container.innerHTML = `
      <div class="welcome-hero-card">
        <div class="welcome-header text-center">
          <div class="welcome-logo-badge">
            <img src="img/upds-logo.png" alt="UPDS" class="welcome-logo-img" />
          </div>
          <h1 class="welcome-title">Portal de Tutorías y Cursos Extracurriculares</h1>
          <p class="welcome-subtitle">Universidad Privada Domingo Savio — Extensión Universitaria y Apoyo Académico</p>
        </div>

        <div class="welcome-grid">
          <!-- Tarjeta 1: Autenticación con JWT -->
          <div class="welcome-panel auth-panel">
            <div class="panel-header">
              <span class="panel-icon">🔐</span>
              <div>
                <h2 class="panel-title">Iniciar Sesión</h2>
                <p class="panel-desc">Accede con tu cuenta institucional protegida con JWT</p>
              </div>
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

              <button type="submit" id="welcome-login-btn" class="btn btn-primary btn-block btn-lg" style="margin-top: 1rem; width:100%; justify-content:center;">
                🚀 Ingresar con JWT
              </button>
            </form>

            <div class="quick-credentials-box">
              <div class="quick-creds-title">⚡ Acceso Rápido de Prueba (Clave: <code>Upds2026</code>)</div>
              <div class="quick-creds-list">
                <button type="button" class="btn-quick-fill" data-email="admin@upds.edu.bo">
                  👑 <strong>Admin:</strong> admin@upds.edu.bo
                </button>
                <button type="button" class="btn-quick-fill" data-email="maria@tutor.com">
                  👨‍🏫 <strong>Tutor:</strong> maria@tutor.com
                </button>
                <button type="button" class="btn-quick-fill" data-email="juan@estudiante.com">
                  🎓 <strong>Estudiante:</strong> juan@estudiante.com
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Modo Invitado (Explorar Cursos sin Login) -->
          <div class="welcome-panel guest-panel">
            <div class="panel-header">
              <span class="panel-icon">🌐</span>
              <div>
                <h2 class="panel-title">Modo Invitado</h2>
                <p class="panel-desc">Explora cursos extracurriculares y tutorías sin iniciar sesión</p>
              </div>
            </div>

            <div class="guest-info-body">
              <p class="guest-text">
                Programas de formación complementaria, talleres prácticos y tutorías especializadas externos a las materias regulares del plan de estudios.
              </p>

              <div class="guest-metrics-row">
                <div class="guest-metric-pill">
                  <span class="pill-number">${coursesCount}</span>
                  <span class="pill-label">Cursos / Talleres</span>
                </div>
                <div class="guest-metric-pill">
                  <span class="pill-number">${tutoriasCount}</span>
                  <span class="pill-label">Sesiones de Tutoría</span>
                </div>
              </div>

              <ul class="guest-features-list">
                <li> Explora talleres técnicos, bootcamps y cursos de extensión.</li>
                <li> Consulta fechas, horarios y tutores docentes asignados.</li>
                <li>🏆 Convocatorias a Hackathons municipales y torneos tech en Cochabamba.</li>
                <li> Abierto para estudiantes, egresados e invitados interesados.</li>
              </ul>

              <button type="button" id="enter-guest-btn" class="btn btn-outline-primary btn-block btn-lg" style="width:100%; justify-content:center; margin-top:1.5rem;">
                👀 Explorar Cursos en Modo Invitado
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

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
      submitBtn.disabled = true;
      submitBtn.textContent = 'Autenticando...';

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
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Ingresar con JWT';
      }
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
