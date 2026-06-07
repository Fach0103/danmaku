// app.js
// Responsabilidad: punto de entrada y coordinación general.
// Depende de: board.js, game.js, modes.js, timer.js, hud.js

class App {
  constructor() {
    this.board  = null;
    this.game   = null;
    this.mode   = null;
    this.timer  = null;
    this.hud    = null;
    this.config = {
      size:     4,
      modeName: 'solo',
      players:  ['Jugador 1']
    };
    this._init();
  }

  _init() {
    this.board = new Board('board');
    this.hud   = new HUD('hud', 'end-screen');
    this.timer = new Timer((elapsed) => {
      this.hud.updateTimer(this._formatTime(elapsed));
    });
    this.game  = new Game(this.board, {});
    this._bindGlobalEvents();
  }

  _bindGlobalEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      this._readConfig();
      this.startGame();
    });

    document.addEventListener('hud-restart', () => {
      this.startGame();
    });

    document.addEventListener('end-restart', () => {
      document.getElementById('end-screen').style.display = 'none';
      this.startGame();
    });

    document.addEventListener('end-menu', () => {
      document.getElementById('end-screen').style.display = 'none';
      this._showMenu();
    });

    document.getElementById('select-mode').addEventListener('change', (e) => {
      const isPvP = e.target.value === 'pvp';
      document.getElementById('player2-label').style.display = isPvP ? 'flex' : 'none';
    });
  }

  _readConfig() {
    const size     = parseInt(document.getElementById('select-difficulty').value);
    const modeName = document.getElementById('select-mode').value;
    const p1       = document.getElementById('input-player1').value.trim() || 'Jugador 1';
    const p2       = document.getElementById('input-player2').value.trim() || 'Jugador 2';

    this.config = {
      size,
      modeName,
      players: modeName === 'pvp' ? [p1, p2] : [p1]
    };
  }

  startGame() {
    const { size, modeName, players } = this.config;
    this._hideMenu();
    this.timer.reset();
    this.board.generate(size);
    this.mode = this._createMode(modeName, players);
    this.mode.start();
  }

  _createMode(modeName, players) {
    switch (modeName) {
      case 'solo': return new SoloMode(this.game, players, this.timer, this.hud);
      case 'pvp':  return new PvPMode(this.game, players, this.hud);
      case 'free': return new FreeMode(this.game, players, this.hud);
      default:
        console.warn(`Modo desconocido: ${modeName}. Usando SoloMode.`);
        return new SoloMode(this.game, players, this.timer, this.hud);
    }
  }

  _showMenu() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    this.board.reset();
    this.timer.reset();
  }

  _hideMenu() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});