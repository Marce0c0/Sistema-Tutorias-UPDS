// Componente de Paginación Institucional — Sistema-Tutoriales-UPDS
export const Pagination = {
  /**
   * Divide una lista de elementos en páginas seguras
   */
  paginate(items = [], currentPage = 1, pageSize = 6) {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    const sliced = items.slice(start, end);

    return {
      items: sliced,
      currentPage: safePage,
      pageSize,
      totalItems,
      totalPages,
      startItem: totalItems === 0 ? 0 : start + 1,
      endItem: end,
    };
  },

  /**
   * Genera el HTML de la barra de paginación (siempre visible)
   */
  renderHTML({ currentPage, totalPages, startItem, endItem, totalItems }) {
    let pagesHtml = '';

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) {
        const isActive = p === currentPage;
        pagesHtml += `
          <button type="button" class="pagination-page-btn ${isActive ? 'active' : ''}" data-page="${p}" ${isActive ? 'aria-current="page"' : ''}>
            ${p}
          </button>
        `;
      }
    } else {
      // Ventana inteligente con elipsis para muchas páginas
      const pages = [];
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const startRange = Math.max(2, currentPage - 1);
      const endRange = Math.min(totalPages - 1, currentPage + 1);
      for (let p = startRange; p <= endRange; p++) pages.push(p);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);

      pagesHtml = pages
        .map((p) => {
          if (p === '...') {
            return `<span class="pagination-ellipsis">…</span>`;
          }
          const isActive = p === currentPage;
          return `
            <button type="button" class="pagination-page-btn ${isActive ? 'active' : ''}" data-page="${p}" ${isActive ? 'aria-current="page"' : ''}>
              ${p}
            </button>
          `;
        })
        .join('');
    }

    const infoText = totalItems === 0
      ? 'Mostrando <strong>0</strong> registros'
      : `Mostrando <strong>${startItem}–${endItem}</strong> de <strong>${totalItems}</strong> registros`;

    return `
      <div class="pagination-container" role="navigation" aria-label="Paginación de resultados">
        <div class="pagination-info">
          ${infoText}
        </div>
        <div class="pagination-controls">
          <button type="button" class="pagination-nav-btn btn-prev-page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''} aria-label="Página anterior">
            &laquo; Anterior
          </button>
          <div class="pagination-pages">
            ${pagesHtml}
          </div>
          <button type="button" class="pagination-nav-btn btn-next-page" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''} aria-label="Página siguiente">
            Siguiente &raquo;
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Vincula los clics en los botones de página y navegación
   */
  bindEvents(parentEl, onPageChange) {
    if (!parentEl) return;
    const paginationEl = parentEl.querySelector('.pagination-container');
    if (!paginationEl) return;

    paginationEl.querySelectorAll('.pagination-page-btn:not(.active), .pagination-nav-btn:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(page) && page >= 1) {
          onPageChange(page);
        }
      });
    });
  },
};
