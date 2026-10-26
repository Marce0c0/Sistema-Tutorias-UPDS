// Componente Modal Reutilizable — Sistema-Tutoriales-UPDS
// Provee ventanas emergentes accesibles para formularios de creación, edición y confirmación

class ModalManager {
  constructor() {
    this.activeModal = null;
  }

  open({ title, content, confirmText = 'Guardar', cancelText = 'Cancelar', onConfirm, onCancel, size = 'md' }) {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';

    const dialog = document.createElement('div');
    dialog.className = `modal-dialog modal-${size} animate-scale-up`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    dialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
        ${confirmText ? `<button type="button" class="btn btn-primary modal-confirm-btn">${confirmText}</button>` : ''}
      </div>
    `;

    const bodyContainer = dialog.querySelector('.modal-body');
    if (typeof content === 'string') {
      bodyContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      bodyContainer.appendChild(content);
    }

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => {
        if (backdrop.parentElement) backdrop.remove();
        this.activeModal = null;
        document.body.classList.remove('modal-open');
      }, 200);
    };

    dialog.querySelector('.modal-close-btn').addEventListener('click', () => {
      if (onCancel) onCancel();
      close();
    });

    dialog.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      if (onCancel) onCancel();
      close();
    });

    const confirmBtn = dialog.querySelector('.modal-confirm-btn');
    if (confirmBtn && onConfirm) {
      confirmBtn.addEventListener('click', async (e) => {
        if (confirmBtn.disabled || confirmBtn.classList.contains('btn-loading')) return;
        const originalHtml = confirmBtn.innerHTML;
        confirmBtn.disabled = true;
        confirmBtn.classList.add('btn-loading');
        confirmBtn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> <span>Procesando...</span>`;
        try {
          const result = await onConfirm(dialog, e);
          if (result !== false) {
            close();
          }
        } catch (err) {
          console.error('[Modal Confirm Error]:', err);
        } finally {
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-loading');
            confirmBtn.innerHTML = originalHtml;
          }
        }
      });
    }

    // Cerrar al dar click fuera del modal
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        if (onCancel) onCancel();
        close();
      }
    });

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');

    this.activeModal = { backdrop, close };
    return this.activeModal;
  }

  confirm({ title = '¿Confirmar acción?', message = 'Esta acción no se puede deshacer.', confirmText = 'Eliminar', onConfirm, danger = true }) {
    return this.open({
      title,
      size: 'sm',
      content: `<p class="confirm-message">${message}</p>`,
      confirmText,
      cancelText: 'Cancelar',
      onConfirm: async (dialog) => {
        return await onConfirm(dialog);
      },
    });
  }

  close() {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }
}

export const Modal = new ModalManager();
