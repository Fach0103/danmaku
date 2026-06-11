// hud.js
// Responsabilidad: renderizar y actualizar la interfaz de seguimiento.
// Depende de: nada
// Es usado por: modes.js

class HUD {
  constructor(hudId, endScreenId) {
    this.container          = document.getElementById(hudId);
    this.endScreenContainer = document.getElementById(endScreenId);
    this._els               = {};
    this._buildHUD();
  }

  _buildHUD() {
    this.container.innerHTML = '';

    const left   = this._createSection('hud-left');
    const center = this._createSection('hud-center');
    const right  = this._createSection('hud-right');

    this._els.playerInfo = this._createEl('div',    'hud-players', left);
    this._els.turnInfo   = this._createEl('div',    'hud-turn',    left);
    this._els.moves      = this._createEl('span',   'hud-moves',   center, 'Movimientos: 0');
    this._els.pairs      = this._createEl('span',   'hud-pairs',   center, 'Pares: 0');
    this._els.timer      = this._createEl('span',   'hud-timer',   right,  '00:00');
    this._els.restartBtn = this._createEl('button', 'hud-restart', right,  'Reiniciar');
    this._els.exitBtn    = this._createEl('button', 'hud-exit',    right,  'Salir');

    this._els.restartBtn.addEventListener('click', () => {
      this.container.dispatchEvent(new CustomEvent('hud-restart', { bubbles: true }));
    });

    this._els.exitBtn.addEventListener('click', () => {
      this._showExitConfirm();
    });

    this.container.appendChild(left);
    this.container.appendChild(center);
    this.container.appendChild(right);
  }

  setupSolo(playerName) {
    this._showHUD();
    this._els.playerInfo.textContent = `👤 ${playerName}`;
    this._els.turnInfo.textContent   = '';
    this._els.timer.style.display    = 'inline';
    this._els.moves.textContent      = 'Movimientos: 0';
    this._els.pairs.textContent      = 'Pares: 0';
    this._els.timer.textContent      = '00:00';
  }

  setupPvP(players, scores, currentTurn) {
    this._showHUD();
    this._els.timer.style.display = 'none';
    this._els.moves.textContent   = 'Movimientos: 0';
    this._els.pairs.textContent   = 'Pares: 0';
    this.updatePvP(players, scores, currentTurn);
  }

  setupFree(playerName) {
    this._showHUD();
    this._els.playerInfo.textContent = `👤 ${playerName}`;
    this._els.turnInfo.textContent   = '';
    this._els.timer.style.display    = 'none';
    this._els.moves.textContent      = 'Movimientos: 0';
    this._els.pairs.textContent      = 'Pares: 0';
  }

  updateMoves(moves)          { this._els.moves.textContent = `Movimientos: ${moves}`; }
  updatePairs(matched, total) { this._els.pairs.textContent = `Pares: ${matched} / ${total}`; }
  updateTimer(formatted)      { this._els.timer.textContent = formatted; }

  updatePvP(players, scores, currentTurn) {
    this._els.playerInfo.innerHTML = players.map((name, i) => {
      const isActive = i === currentTurn;
      return `<span class="pvp-player ${isActive ? 'active-player' : ''}">
                ${isActive ? '▶' : ''} ${name}: ${scores[i]} pts
              </span>`;
    }).join('');
    this._els.turnInfo.textContent = `Turno: ${players[currentTurn]}`;
  }

  showEndScreen(summary) {
    this._hideHUD();
    if (typeof EndScreen !== 'undefined') {
      const endScreen = new EndScreen(this.endScreenContainer);
      endScreen.show(summary);
      return;
    }
    // Fallback mínimo
    this.endScreenContainer.style.display = 'flex';
    this.endScreenContainer.innerHTML = `
      <div class="end-card">
        <h2>¡Partida terminada!</h2>
        <p>Movimientos: ${summary.moves}</p>
        <p>Pares: ${summary.matchedPairs} / ${summary.totalPairs}</p>
        ${summary.time !== undefined ? `<p>Tiempo: ${this._formatTime(summary.time)}</p>` : ''}
        ${summary.isDraw  ? '<p>¡Empate!</p>'                      : ''}
        ${summary.winner  ? `<p>🏆 Ganador: ${summary.winner}</p>` : ''}
        <button id="end-restart">Jugar de nuevo</button>
        <button id="end-menu">Volver al menú</button>
      </div>
    `;
    document.getElementById('end-restart').addEventListener('click', () => {
      this.endScreenContainer.dispatchEvent(new CustomEvent('end-restart', { bubbles: true }));
    });
    document.getElementById('end-menu').addEventListener('click', () => {
      this.endScreenContainer.dispatchEvent(new CustomEvent('end-menu', { bubbles: true }));
    });
  }

  _showExitConfirm() {
    const existing = document.getElementById('exit-confirm');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'exit-confirm';
    overlay.classList.add('exit-confirm-overlay');
    overlay.innerHTML = `
      <div class="exit-confirm-box">
        <p class="exit-confirm-msg">¿Seguro que quieres salir? <br> Se perderá el progreso actual.</p>
        <div class="exit-confirm-actions">
          <button class="exit-btn-cancel">Cancelar</button>
          <button class="exit-btn-confirm">Salir</button>
        </div>
      </div>
    `;

    overlay.querySelector('.exit-btn-cancel').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('.exit-btn-confirm').addEventListener('click', () => {
      overlay.remove();
      document.dispatchEvent(new CustomEvent('end-menu', { bubbles: true }));
    });

    document.body.appendChild(overlay);
  }

  _showHUD() { this.container.style.display = 'flex'; }
  _hideHUD() { this.container.style.display = 'none'; }

  _createSection(id) {
    const section = document.createElement('div');
    section.id = id;
    section.classList.add('hud-section');
    return section;
  }

  _createEl(tag, className, parent, text) {
    const el = document.createElement(tag);
    el.classList.add(className);
    if (text)   el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}