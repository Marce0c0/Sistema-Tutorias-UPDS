// Utilidad para Prevención de Doble Clic y Estados de Carga con Spinner Circular
// Sistema-Tutoriales-UPDS — Taste Skill

/**
 * Ejecuta una acción asíncrona bloqueando el botón, previniendo doble clic
 * y mostrando un spinner circular hasta que la promesa termine o falle.
 *
 * @param {HTMLButtonElement} button - El botón a proteger
 * @param {Function} asyncFn - Función asíncrona a ejecutar
 * @param {string|null} loadingText - Texto opcional durante la carga
 * @returns {Promise<any>}
 */
export async function withButtonLoading(button, asyncFn, loadingText = null) {
  if (!button || button.disabled || button.classList.contains('btn-loading')) {
    return;
  }

  const originalHtml = button.innerHTML;
  const originalDisabled = button.disabled;

  button.disabled = true;
  button.classList.add('btn-loading');

  const text = loadingText !== null ? loadingText : (button.textContent.trim() || 'Procesando...');
  button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> <span>${text}</span>`;

  try {
    return await asyncFn();
  } finally {
    if (button) {
      button.disabled = originalDisabled;
      button.classList.remove('btn-loading');
      button.innerHTML = originalHtml;
    }
  }
}
