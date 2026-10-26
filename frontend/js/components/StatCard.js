// Componente de Tarjetas de Métricas (KPIs) — Sistema-Tutoriales-UPDS

export const StatCard = ({ title, value, icon, subtitle, color = 'blue', onClick }) => {
  const card = document.createElement('div');
  card.className = `stat-card stat-card-${color} ${onClick ? 'cursor-pointer hover-lift' : ''}`;

  card.innerHTML = `
    <div class="stat-card-header">
      <span class="stat-card-title">${title}</span>
      <span class="stat-card-icon">${icon}</span>
    </div>
    <div class="stat-card-value">${value}</div>
    ${subtitle ? `<div class="stat-card-subtitle">${subtitle}</div>` : ''}
  `;

  if (onClick) {
    card.addEventListener('click', onClick);
  }

  return card;
};
