// Componente de Estado Vacío (Empty State) — Sistema-Tutoriales-UPDS
import { Icons } from './Icons.js';

export const EmptyState = ({ icon, title = 'No hay registros', description = 'Aún no se ha agregado ningún elemento.', actionText, onAction }) => {
  const container = document.createElement('div');
  container.className = 'empty-state-box animate-fade-in';

  const renderedIcon = icon || Icons.inbox('', 42);

  container.innerHTML = `
    <div class="empty-state-icon" style="display:flex; justify-content:center; align-items:center; color:var(--text-muted); margin-bottom:0.75rem;">${renderedIcon}</div>
    <h3 class="empty-state-title">${title}</h3>
    <p class="empty-state-desc">${description}</p>
    ${actionText ? `<button class="btn btn-primary empty-state-btn">${actionText}</button>` : ''}
  `;

  if (actionText && onAction) {
    const btn = container.querySelector('.empty-state-btn');
    if (btn) btn.addEventListener('click', onAction);
  }

  return container;
};
