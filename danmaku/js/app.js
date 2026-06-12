// app.js
// Responsabilidad: punto de entrada y coordinación general.
// Depende de: todos los demás archivos

class App {
  constructor() {
    this.boards             = [];
    this.games              = [];
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
      themeId:  'touhou',
      players:  ['Jugador 1']
    };
    this._init();
  }

  _init() {
    this.themeManager = new ThemeManager();
    this.themeManager.apply('touhou');

    this.hud = new HUD('hud', 'end-screen');

    this.timer = new Timer((elapsed) => {
      this.hud.updateTimer(this._formatTime(elapsed));
      if (this.achievementManager) this.achievementManager.onTick(elapsed);
    });

    this.notifier = new AchievementNotifier('achievement-container');

    this.achievementManager = new AchievementManager((achievement) => {
      this.notifier.notify(achievement);
    });

    this.menu = new Menu('menu', this.themeManager, (config) => {
      this.config = config;
      this.startGame();
    });

    this._bindGlobalEvents();
  }

  _bindGlobalEvents() {
    document.addEventListener('hud-restart', () => {
      this.startGame();
    });

    document.addEventListener('end-restart', () => {
      const endScreen = document.getElementById('end-screen');
      endScreen.style.display = 'none';
      endScreen.innerHTML     = '';
      this.startGame();
    });

    document.addEventListener('end-menu', () => {
      const endScreen = document.getElementById('end-screen');
      endScreen.style.display = 'none';
      endScreen.innerHTML     = '';
      this._showMenu();
    });
  }

  startGame() {
    const { size, modeName, themeId, players } = this.config;

    this.menu.hide();
    this._cleanUp();
    this._showGame();

    this.themeManager.apply(themeId);
    this.timer.reset();
    this.achievementManager.setup(modeName, size, (size * size) / 2);

    if (modeName === 'pvp') {
      this._startPvP(size, players);
    } else {
      this._startSinglePlayer(size, modeName, players);
    }
  }

  // -------------------------------------------------------------------------
  // _startSinglePlayer(size, modeName, players)
  // -------------------------------------------------------------------------
  _startSinglePlayer(size, modeName, players) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('game-container--split');

    // Limpiar boards-wrapper si existe
    const existingWrapper = document.getElementById('boards-wrapper');
    if (existingWrapper) existingWrapper.remove();

    // Crear board-0 centrado
    let boardEl = document.createElement('div');
    boardEl.id = 'board-0';
    boardEl.classList.add('board');
    gameContainer.appendChild(boardEl);

    const board = new Board('board-0');
    board.generate(size, this.themeManager.getActiveIcons());
    this.boards = [board];

    const game = new Game(board, {});
    this.games = [game];

    this.mode = this._createSingleMode(modeName, players, game);
    this.mode.start();
  }

  // -------------------------------------------------------------------------
  // _startPvP(size, players)
  // -------------------------------------------------------------------------
  _startPvP(size, players) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('game-container--split');

    // Limpiar board solitario si existe
    const board0Solo = document.getElementById('board-0');
    if (board0Solo) board0Solo.remove();

    const icons      = this.themeManager.getActiveIcons();
    const shuffled   = this._shuffle(icons.slice());
    const totalPairs = (size * size) / 2;
    const half       = totalPairs / 2;
    const icons0     = shuffled.slice(0, half);
    const icons1     = shuffled.slice(half, half * 2);

    // Crear wrapper horizontal para los dos tableros
    let boardsWrapper = document.getElementById('boards-wrapper');
    if (boardsWrapper) boardsWrapper.remove();

    boardsWrapper = document.createElement('div');
    boardsWrapper.id = 'boards-wrapper';
    boardsWrapper.classList.add('boards-wrapper');
    gameContainer.appendChild(boardsWrapper);

    this.boards = [];
    this.games  = [];

    [0, 1].forEach(i => {
      // Wrapper individual por jugador
      const playerWrapper = document.createElement('div');
      playerWrapper.classList.add('player-board-wrapper');

      const boardEl = document.createElement('div');
      boardEl.id = `board-${i}`;
      boardEl.classList.add('board');

      playerWrapper.appendChild(boardEl);
      boardsWrapper.appendChild(playerWrapper);

      const board = new Board(`board-${i}`);
      board.generate(size, i === 0 ? icons0 : icons1);
      this.boards.push(board);

      const game = new Game(board, {});
      this.games.push(game);
    });

    this.mode = new PvPMode(this.games, players, this.hud, this.achievementManager);
    this.mode.start();
  }

  // -------------------------------------------------------------------------
  // _createSingleMode(modeName, players, game)
  // -------------------------------------------------------------------------
  _createSingleMode(modeName, players, game) {
    switch (modeName) {
      case 'solo':
        return new SoloMode(game, players, this.timer, this.hud, this.achievementManager);
      case 'free':
        return new FreeMode(game, players, this.hud, this.achievementManager);
      default:
        return new SoloMode(game, players, this.timer, this.hud, this.achievementManager);
    }
  }

  // -------------------------------------------------------------------------
  // _cleanUp()
  // -------------------------------------------------------------------------
  _cleanUp() {
    if (this.timer) this.timer.reset();
    this.boards.forEach(b => b.reset());
    this.boards = [];
    this.games  = [];
    this.mode   = null;

    // Limpiar tableros del DOM
    const boardsWrapper = document.getElementById('boards-wrapper');
    if (boardsWrapper) boardsWrapper.remove();

    const board0 = document.getElementById('board-0');
    if (board0) board0.remove();

    const board1 = document.getElementById('board-1');
    if (board1) board1.remove();
  }

  // -------------------------------------------------------------------------
  // _showMenu()
  // -------------------------------------------------------------------------
  _showMenu() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none';
    gameContainer.classList.remove('game-container--split');
    gameContainer.innerHTML = '<div id="hud"></div>';

    const pvpBoards = document.getElementById('pvp-boards');
    if (pvpBoards) pvpBoards.remove();

    const endScreen = document.getElementById('end-screen');
    endScreen.style.display = 'none';
    endScreen.innerHTML     = '';

    this._cleanUp();

    this.hud = new HUD('hud', 'end-screen');

    this.timer = new Timer((elapsed) => {
      this.hud.updateTimer(this._formatTime(elapsed));
      if (this.achievementManager) this.achievementManager.onTick(elapsed);
    });

    this.menu.show();
  }

  // -------------------------------------------------------------------------
  // _showGame()
  // -------------------------------------------------------------------------
  _showGame() {
    document.getElementById('game-container').style.display = 'flex';
  }

  // -------------------------------------------------------------------------
  // Utilidades
  // -------------------------------------------------------------------------
  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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