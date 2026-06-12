// endScreen.js
// Responsabilidad: renderizar la pantalla de fin de partida.
// Depende de: nada
// Es usado por: hud.js

class EndScreen {
  constructor(container) {
    this.container = container;
  }

  show(summary) {
    this.container.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('end-card');

    card.appendChild(this._buildHeader(summary));
    card.appendChild(this._buildStats(summary));

    if (summary.mode === 'pvp') {
      card.appendChild(this._buildPvPResult(summary));
    }

    if (summary.achievements && summary.achievements.length > 0) {
      card.appendChild(this._buildAchievements(summary.achievements));
    }

    card.appendChild(this._buildActions());

    this.container.appendChild(card);

    // Animar entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add('end-card--visible');
      });
    });
  }

  // -------------------------------------------------------------------------
  // _buildHeader(summary)
  // -------------------------------------------------------------------------
  _buildHeader(summary) {
    const header = document.createElement('div');
    header.classList.add('end-header');
    const { emoji, title, subtitle } = this._getHeaderContent(summary);
    header.innerHTML = `
      <div class="end-emoji">${emoji}</div>
      <h2 class="end-title">${title}</h2>
      <p class="end-subtitle">${subtitle}</p>
    `;
    return header;
  }

  _getHeaderContent(summary) {
    if (summary.mode === 'pvp') {
      if (summary.isDraw) return {
        emoji:    '🤝',
        title:    '¡Empate!',
        subtitle: 'Ambos jugadores encontraron los mismos pares.'
      };
      return {
        emoji:    '🏆',
        title:    `¡${summary.winner} gana!`,
        subtitle: 'Victoria en modo multijugador.'
      };
    }

    if (summary.mode === 'free') return {
      emoji:    '🎉',
      title:    '¡Tablero completado!',
      subtitle: `Buen trabajo, ${summary.playerName}.`
    };

    const accuracy = this._getAccuracy(summary.matchedPairs, summary.moves);
    if (accuracy === 100) return {
      emoji:    '💎',
      title:    '¡Partida perfecta!',
      subtitle: `Increíble, ${summary.playerName}. Sin un solo error.`
    };
    if (accuracy >= 70) return {
      emoji:    '⭐',
      title:    '¡Muy bien!',
      subtitle: `Buen trabajo, ${summary.playerName}.`
    };
    return {
      emoji:    '💪',
      title:    '¡Tablero completado!',
      subtitle: `Sigue practicando, ${summary.playerName}.`
    };
  }

  // -------------------------------------------------------------------------
  // _buildStats(summary)
  // -------------------------------------------------------------------------
  _buildStats(summary) {
    const section = document.createElement('div');
    section.classList.add('end-stats');

    this._getStats(summary).forEach(({ label, value }) => {
      const stat = document.createElement('div');
      stat.classList.add('end-stat');
      stat.innerHTML = `
        <span class="end-stat-value">${value}</span>
        <span class="end-stat-label">${label}</span>
      `;
      section.appendChild(stat);
    });

    return section;
  }

  _getStats(summary) {
    const accuracy = this._getAccuracy(summary.matchedPairs, summary.moves);
    const base = [
      { label: 'Movimientos',      value: summary.moves },
      { label: 'Pares',            value: `${summary.matchedPairs} / ${summary.totalPairs}` },
      { label: 'Tasa de aciertos', value: `${accuracy}%` }
    ];
    if (summary.mode === 'solo' && summary.time !== undefined) {
      base.unshift({ label: 'Tiempo', value: this._formatTime(summary.time) });
    }
    return base;
  }

  // -------------------------------------------------------------------------
  // _buildPvPResult(summary)
  // -------------------------------------------------------------------------
  _buildPvPResult(summary) {
    const section = document.createElement('div');
    section.classList.add('end-pvp');
    section.innerHTML = `<h3 class="end-pvp-title">Resultados</h3>`;

    summary.players.forEach((name, i) => {
      const isWinner = name === summary.winner;
      const row = document.createElement('div');
      row.classList.add('end-pvp-row');
      if (isWinner) row.classList.add('end-pvp-row--winner');
      row.innerHTML = `
        <span class="end-pvp-name">${isWinner ? '🏆 ' : ''}${name}</span>
        <span class="end-pvp-score">${summary.scores[i]} pares</span>
      `;
      section.appendChild(row);
    });

    return section;
  }

  // -------------------------------------------------------------------------
  // _buildAchievements(achievements)
  // -------------------------------------------------------------------------
  _buildAchievements(achievements) {
    const section = document.createElement('div');
    section.classList.add('end-achievements');

    const title = document.createElement('h3');
    title.classList.add('end-achievements-title');
    title.textContent = '🎖️ Logros desbloqueados';
    section.appendChild(title);

    const list = document.createElement('div');
    list.classList.add('end-achievements-list');

    achievements.forEach(a => {
      const badge = document.createElement('div');
      badge.classList.add('end-achievement-badge');
      badge.innerHTML = `
        <span class="badge-icon">${a.icon}</span>
        <span class="badge-title">${a.title}</span>
      `;
      list.appendChild(badge);
    });

    section.appendChild(list);
    return section;
  }

  // -------------------------------------------------------------------------
  // _buildActions()
  // -------------------------------------------------------------------------
  _buildActions() {
    const actions = document.createElement('div');
    actions.classList.add('end-actions');

    const btnRestart = document.createElement('button');
    btnRestart.classList.add('end-btn', 'end-btn--primary');
    btnRestart.textContent = '🔄 Jugar de nuevo';
    btnRestart.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('end-restart', { bubbles: true }));
    });

    const btnMenu = document.createElement('button');
    btnMenu.classList.add('end-btn', 'end-btn--secondary');
    btnMenu.textContent = '🏠 Volver al menú';
    btnMenu.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('end-menu', { bubbles: true }));
    });

    actions.appendChild(btnRestart);
    actions.appendChild(btnMenu);
    return actions;
  }

  // -------------------------------------------------------------------------
  // hide()
  // -------------------------------------------------------------------------
  hide() {
    this.container.style.display = 'none';
    this.container.innerHTML     = '';
  }

  // -------------------------------------------------------------------------
  // Utilidades
  // -------------------------------------------------------------------------
  _getAccuracy(matchedPairs, moves) {
    if (moves === 0) return 0;
    return Math.round((matchedPairs / moves) * 100);
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}