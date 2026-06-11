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
      onFirstFlip: ()                              => this.onFirstFlip(),
      onMove:      (moves)                         => this.onMove(moves),
      onMatch:     (cards, matchedPairs, total)    => this.onMatch(cards, matchedPairs, total),
      onMismatch:  (cards)                         => this.onMismatch(cards),
      onGameEnd:   (state)                         => this.onGameEnd(state)
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
    this.hud.showEndScreen(summary);
  }

  start() {
    this.hud.setupSolo(this.playerName);
    super.start();
  }
}

class PvPMode extends BaseMode {
  constructor(game, players, hud, achievementManager) {
    super(game, players);
    this.hud                = hud;
    this.achievementManager = achievementManager;
    this.scores             = [0, 0];
    this.currentTurn        = 0;
  }

  onMove(moves) {
    super.onMove(moves);
    this.hud.updateMoves(moves);
    this.achievementManager.onMove(moves);
  }

  onMatch(cards, matchedPairs, total) {
    super.onMatch(cards, matchedPairs, total);
    this.scores[this.currentTurn]++;
    this.hud.updatePvP(this.players, this.scores, this.currentTurn);
    this.hud.updatePairs(matchedPairs, total);
    this.achievementManager.onMatch(matchedPairs);
  }

  onMismatch(cards) {
    this.achievementManager.onMismatch();
    setTimeout(() => {
      this.currentTurn = this.currentTurn === 0 ? 1 : 0;
      this.hud.updatePvP(this.players, this.scores, this.currentTurn);
    }, 950);
  }

  onGameEnd(state) {
    const [s0, s1] = this.scores;
    const isDraw   = s0 === s1;
    const winner   = isDraw ? null : (s0 > s1 ? this.players[0] : this.players[1]);

    const summary = {
      mode:         'pvp',
      players:      this.players,
      scores:       this.scores,
      moves:        state.moves,
      matchedPairs: state.matchedPairs,
      totalPairs:   this.game.board.totalPairs,
      winner,
      isDraw,
      achievements: this.achievementManager.getUnlocked()
    };
    this.hud.showEndScreen(summary);
  }

  start() {
    this.currentTurn = 0;
    this.scores      = [0, 0];
    this.hud.setupPvP(this.players, this.scores, this.currentTurn);
    super.start();
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
    const summary = {
      mode:         'free',
      playerName:   this.playerName,
      moves:        state.moves,
      matchedPairs: state.matchedPairs,
      totalPairs:   this.game.board.totalPairs,
      achievements: this.achievementManager.getUnlocked()
    };
    this.hud.showEndScreen(summary);
  }

  start() {
    this.hud.setupFree(this.playerName);
    super.start();
  }
}