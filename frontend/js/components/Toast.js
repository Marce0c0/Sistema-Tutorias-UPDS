// Componente de Notificaciones Toast — Sistema-Tutoriales-UPDS
// Provee retroalimentación visual no invasiva de éxito, error e información

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 4000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
      <div class="toast-message">${this.escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  success(msg) {
    this.show(msg, 'success');
  }

  error(msg) {
    this.show(msg, 'error', 6000);
  }

  warning(msg) {
    this.show(msg, 'warning');
  }

  info(msg) {
    this.show(msg, 'info');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const Toast = new ToastManager();
