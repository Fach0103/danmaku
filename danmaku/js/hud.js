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
    this._hidePvPBoards();
    this._els.playerInfo.textContent = `👤 ${playerName}`;
    this._els.turnInfo.textContent   = '';
    this._els.timer.style.display    = 'inline';
    this._els.moves.textContent      = 'Movimientos: 0';
    this._els.pairs.textContent      = 'Pares: 0';
    this._els.timer.textContent      = '00:00';
  }

  setupFree(playerName) {
    this._showHUD();
    this._hidePvPBoards();
    this._els.playerInfo.textContent = `👤 ${playerName}`;
    this._els.turnInfo.textContent   = '';
    this._els.timer.style.display    = 'none';
    this._els.moves.textContent      = 'Movimientos: 0';
    this._els.pairs.textContent      = 'Pares: 0';
  }

  setupPvP(players, scores, currentTurn) {
    this._showHUD();
    this._showPvPBoards(players, scores);
    this._els.timer.style.display    = 'none';
    this._els.moves.style.display    = 'none';
    this._els.pairs.style.display    = 'none';
    this._els.playerInfo.textContent = '';
    this._els.turnInfo.textContent   = `Turno: ${players[currentTurn]}`;
    this.highlightActiveBoard(currentTurn);
  }

  _showPvPBoards(players, scores) {
    const existing = document.getElementById('pvp-boards');
    if (existing) existing.remove();

    const pvpBoards = document.createElement('div');
    pvpBoards.id = 'pvp-boards';
    pvpBoards.classList.add('pvp-boards');

    players.forEach((name, i) => {
      const panel = document.createElement('div');
      panel.classList.add('pvp-panel');
      panel.id = `pvp-panel-${i}`;
      panel.innerHTML = `
        <div class="pvp-panel-header">
          <span class="pvp-panel-name">👤 ${name}</span>
          <span class="pvp-panel-score" id="pvp-score-${i}">${scores[i]} pares</span>
        </div>
        <div class="pvp-panel-stats">
          <span id="pvp-moves-${i}">Movimientos: 0</span>
          <span id="pvp-pairs-${i}">Pares: 0 / 0</span>
        </div>
      `;
      pvpBoards.appendChild(panel);
    });

    const gameContainer = document.getElementById('game-container');
    gameContainer.before(pvpBoards);
    this._els.pvpBoards = pvpBoards;
  }

  _hidePvPBoards() {
    const existing = document.getElementById('pvp-boards');
    if (existing) existing.remove();
    if (this._els.moves) this._els.moves.style.display = 'inline';
    if (this._els.pairs) this._els.pairs.style.display = 'inline';
  }

  updateMoves(moves)          { this._els.moves.textContent = `Movimientos: ${moves}`; }
  updatePairs(matched, total) { this._els.pairs.textContent = `Pares: ${matched} / ${total}`; }
  updateTimer(formatted)      { this._els.timer.textContent = formatted; }

  updatePvPScore(players, scores, currentTurn) {
    scores.forEach((score, i) => {
      const el = document.getElementById(`pvp-score-${i}`);
      if (el) el.textContent = `${score} pares`;
    });
    this._els.turnInfo.textContent = `Turno: ${players[currentTurn]}`;
  }

  updatePvPMoves(playerIndex, moves) {
    const el = document.getElementById(`pvp-moves-${playerIndex}`);
    if (el) el.textContent = `Movimientos: ${moves}`;
  }

  updatePvPPairs(playerIndex, matched, total) {
    const el = document.getElementById(`pvp-pairs-${playerIndex}`);
    if (el) el.textContent = `Pares: ${matched} / ${total}`;
  }

  highlightActiveBoard(currentTurn) {
    [0, 1].forEach(i => {
      const panel = document.getElementById(`pvp-panel-${i}`);
      const board = document.getElementById(`board-${i}`);
      if (panel) panel.classList.toggle('pvp-panel--active', i === currentTurn);
      if (board) board.classList.toggle('board--inactive',   i !== currentTurn);
    });
  }

  markBoardFinished(playerIndex) {
    const panel = document.getElementById(`pvp-panel-${playerIndex}`);
    const board = document.getElementById(`board-${playerIndex}`);
    if (panel) panel.classList.add('pvp-panel--finished');
    if (board) board.classList.add('board--finished');
  }

  showEndScreen(summary) {
    console.log('HUD.showEndScreen llamado', summary);
    console.log('endScreenContainer:', this.endScreenContainer);

    this._hideHUD();

    const pvpBoards = document.getElementById('pvp-boards');
    if (pvpBoards) pvpBoards.remove();

    this.endScreenContainer.innerHTML     = '';
    this.endScreenContainer.style.display = 'flex';

    console.log('end-screen display seteado a flex');

    const endScreen = new EndScreen(this.endScreenContainer);
    endScreen.show(summary);
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