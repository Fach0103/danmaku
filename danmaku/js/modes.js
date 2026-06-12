// modes.js
// Responsabilidad: reglas específicas de cada modo de juego.
// Depende de: Game (game.js)
// Es usado por: app.js

class BaseMode {
  constructor(game, players) {
    this.game    = game;
    this.players = players;
    this.stats   = {
      moves:        0,
      matchedPairs: 0,
      totalPairs:   game.board.totalPairs
    };
    this._bindCallbacks();
  }

  _bindCallbacks() {
    this.game.callbacks = {
      onFirstFlip: ()                           => this.onFirstFlip(),
      onMove:      (moves)                      => this.onMove(moves),
      onMatch:     (cards, matchedPairs, total) => this.onMatch(cards, matchedPairs, total),
      onMismatch:  (cards)                      => this.onMismatch(cards),
      onGameEnd:   (state)                      => this.onGameEnd(state)
    };
  }

  onFirstFlip() {}
  onMove(moves)                       { this.stats.moves = moves; }
  onMatch(cards, matchedPairs, total) { this.stats.matchedPairs = matchedPairs; }
  onMismatch(cards)                   {}
  onGameEnd(state)                    {}

  start() { this.game.start(); }
}

class SoloMode extends BaseMode {
  constructor(game, players, timer, hud, achievementManager) {
    super(game, players);
    this.timer              = timer;
    this.hud                = hud;
    this.achievementManager = achievementManager;
    this.playerName         = players[0];
  }

  onFirstFlip() {
    this.timer.start();
  }

  onMove(moves) {
    super.onMove(moves);
    this.hud.updateMoves(moves);
    this.achievementManager.onMove(moves);
  }

  onMatch(cards, matchedPairs, total) {
    super.onMatch(cards, matchedPairs, total);
    this.hud.updatePairs(matchedPairs, total);
    this.achievementManager.onMatch(matchedPairs);
  }

  onMismatch(cards) {
    this.achievementManager.onMismatch();
  }

  onGameEnd(state) {
    console.log('SoloMode.onGameEnd disparado', state);
    this.timer.stop();
    const summary = {
      mode:         'solo',
      playerName:   this.playerName,
      moves:        state.moves,
      matchedPairs: state.matchedPairs,
      totalPairs:   this.game.board.totalPairs,
      time:         this.timer.getElapsed(),
      achievements: this.achievementManager.getUnlocked()
    };
    console.log('summary armado', summary);
    this.hud.showEndScreen(summary);
  }

  start() {
    this.hud.setupSolo(this.playerName);
    super.start();
  }
}

class PvPMode {
  constructor(games, players, hud, achievementManager) {
    this.games              = games;
    this.players            = players;
    this.hud                = hud;
    this.achievementManager = achievementManager;
    this.scores             = [0, 0];
    this.moves              = [0, 0];
    this.currentTurn        = 0;
    this.isFinished         = false;
    this._bindCallbacks();
  }

  _bindCallbacks() {
    this.games.forEach((game, playerIndex) => {
      game.callbacks = {
        onFirstFlip: ()                           => this._onFirstFlip(playerIndex),
        onMove:      (moves)                      => this._onMove(playerIndex, moves),
        onMatch:     (cards, matchedPairs, total) => this._onMatch(playerIndex, cards, matchedPairs, total),
        onMismatch:  (cards)                      => this._onMismatch(playerIndex, cards),
        onGameEnd:   (state)                      => this._onGameEnd(playerIndex, state)
      };
    });
  }

  _onFirstFlip(playerIndex) {
    if (playerIndex !== this.currentTurn) return;
  }

  _onMove(playerIndex, moves) {
    if (playerIndex !== this.currentTurn) return;
    this.moves[playerIndex] = moves;
    this.hud.updatePvPMoves(playerIndex, moves);
    this.achievementManager.onMove(moves);
  }

  _onMatch(playerIndex, cards, matchedPairs, total) {
    if (playerIndex !== this.currentTurn) return;
    this.scores[playerIndex]++;
    this.hud.updatePvPScore(this.players, this.scores, this.currentTurn);
    this.hud.updatePvPPairs(playerIndex, matchedPairs, total);
    this.achievementManager.onMatch(matchedPairs);
  }

  _onMismatch(playerIndex, cards) {
    if (playerIndex !== this.currentTurn) return;
    this.achievementManager.onMismatch();
    setTimeout(() => {
      this._switchTurn();
    }, 950);
  }

  _onGameEnd(playerIndex, state) {
    console.log(`PvPMode._onGameEnd jugador ${playerIndex}`, state);
    this.games[playerIndex].state.isFinished = true;
    this.hud.markBoardFinished(playerIndex);

    const bothFinished = this.games.every(g => g.state.isFinished);
    if (bothFinished) {
      this._endGame();
      return;
    }

    if (playerIndex === this.currentTurn) {
      this._switchTurn();
    }
  }

  _switchTurn() {
    const nextTurn = this.currentTurn === 0 ? 1 : 0;
    if (this.games[nextTurn].state.isFinished) {
      this._endGame();
      return;
    }
    this.currentTurn = nextTurn;
    this.hud.updatePvPScore(this.players, this.scores, this.currentTurn);
    this._updateBoardsLock();
  }

  _updateBoardsLock() {
    this.games.forEach((game, index) => {
      if (!game.state.isFinished) {
        game.state.isLocked = index !== this.currentTurn;
      }
    });
    this.hud.highlightActiveBoard(this.currentTurn);
  }

  _endGame() {
    if (this.isFinished) return;
    this.isFinished = true;
    console.log('PvPMode._endGame disparado');

    const [s0, s1] = this.scores;
    const isDraw   = s0 === s1;
    const winner   = isDraw ? null : (s0 > s1 ? this.players[0] : this.players[1]);

    const summary = {
      mode:         'pvp',
      players:      this.players,
      scores:       this.scores,
      moves:        this.moves,
      matchedPairs: this.scores,
      totalPairs:   this.games.map(g => g.board.totalPairs),
      winner,
      isDraw,
      achievements: this.achievementManager.getUnlocked()
    };
    console.log('PvP summary', summary);
    this.hud.showEndScreen(summary);
  }

  start() {
    this.scores      = [0, 0];
    this.moves       = [0, 0];
    this.currentTurn = 0;
    this.isFinished  = false;
    this.games.forEach(game => game.start());
    this.hud.setupPvP(this.players, this.scores, this.currentTurn);
    this._updateBoardsLock();
  }
}

class FreeMode extends BaseMode {
  constructor(game, players, hud, achievementManager) {
    super(game, players);
    this.hud                = hud;
    this.achievementManager = achievementManager;
    this.playerName         = players[0];
  }

  onMove(moves) {
    super.onMove(moves);
    this.hud.updateMoves(moves);
    this.achievementManager.onMove(moves);
  }

  onMatch(cards, matchedPairs, total) {
    super.onMatch(cards, matchedPairs, total);
    this.hud.updatePairs(matchedPairs, total);
    this.achievementManager.onMatch(matchedPairs);
  }

  onMismatch(cards) {
    this.achievementManager.onMismatch();
  }

  onGameEnd(state) {
    console.log('FreeMode.onGameEnd disparado', state);
    const summary = {
      mode:         'free',
      playerName:   this.playerName,
      moves:        state.moves,
      matchedPairs: state.matchedPairs,
      totalPairs:   this.game.board.totalPairs,
      achievements: this.achievementManager.getUnlocked()
    };
    console.log('FreeMode summary', summary);
    this.hud.showEndScreen(summary);
  }

  start() {
    this.hud.setupFree(this.playerName);
    super.start();
  }
}