// app.js
// Responsabilidad: punto de entrada y coordinación general.
// Depende de: todos los demás archivos

class App {
  constructor() {
    this.board              = null;
    this.game               = null;
    this.mode               = null;
    this.timer              = null;
    this.hud                = null;
    this.menu               = null;
    this.themeManager       = null;
    this.achievementManager = null;
    this.notifier           = null;
    this.config             = {
      size:     4,
      modeName: 'solo',
      themeId:  'animals',
      players:  ['Jugador 1']
    };
    this._init();
  }

  _init() {
    // Instanciar núcleo
    this.themeManager = new ThemeManager();
    this.themeManager.apply('animals');

    this.board = new Board('board');
    this.hud   = new HUD('hud', 'end-screen');
    this.game  = new Game(this.board, {});

    this.timer = new Timer((elapsed) => {
      this.hud.updateTimer(this._formatTime(elapsed));
      this.achievementManager.onTick(elapsed);
    });

    // Notificador de logros
    this.notifier = new AchievementNotifier('achievement-container');

    // Manager de logros con callback al notificador
    this.achievementManager = new AchievementManager((achievement) => {
      this.notifier.notify(achievement);
    });

    // Menú — recibe config y arranca la partida
    this.menu = new Menu('menu', this.themeManager, (config) => {
      this.config = config;
      this.startGame();
    });

    // Escuchar eventos globales
    this._bindGlobalEvents();
  }

  _bindGlobalEvents() {
    // Reiniciar desde el HUD
    document.addEventListener('hud-restart', () => {
      this.startGame();
    });

    // Jugar de nuevo desde pantalla de fin
    document.addEventListener('end-restart', () => {
      document.getElementById('end-screen').style.display = 'none';
      this.startGame();
    });

    // Volver al menú desde pantalla de fin
    document.addEventListener('end-menu', () => {
      document.getElementById('end-screen').style.display = 'none';
      this._showMenu();
    });
  }

  startGame() {
    const { size, modeName, themeId, players } = this.config;

    this.menu.hide();
    this._showGame();

    // Aplicar temática e iconos
    this.themeManager.apply(themeId);

    // Resetear timer
    this.timer.reset();

    // Preparar logros
    this.achievementManager.setup(modeName, size, (size * size) / 2);

    // Generar tablero con iconos de la temática activa
    this.board.generate(size, this.themeManager.getActiveIcons());

    // Instanciar modo y arrancar
    this.mode = this._createMode(modeName, players);
    this.mode.start();
  }

  _createMode(modeName, players) {
    switch (modeName) {
      case 'solo':
        return new SoloMode(this.game, players, this.timer, this.hud, this.achievementManager);
      case 'pvp':
        return new PvPMode(this.game, players, this.hud, this.achievementManager);
      case 'free':
        return new FreeMode(this.game, players, this.hud, this.achievementManager);
      default:
        console.warn(`Modo desconocido: ${modeName}. Usando SoloMode.`);
        return new SoloMode(this.game, players, this.timer, this.hud, this.achievementManager);
    }
  }

  _showMenu() {
    document.getElementById('game-container').style.display = 'none';
    this.board.reset();
    this.timer.reset();
    this.menu.show();
  }

  _showGame() {
    document.getElementById('game-container').style.display = 'flex';
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