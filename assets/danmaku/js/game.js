// game.js
// Responsabilidad: lógica central del juego.
// Depende de: Board, Card (board.js)
// Es usado por: modes.js, app.js

class GameState {
  constructor() {
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves        = 0;
    this.isLocked     = false;
    this.isStarted    = false;
    this.isFinished   = false;
  }

  reset() {
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves        = 0;
    this.isLocked     = false;
    this.isStarted    = false;
    this.isFinished   = false;
  }
}

class Game {
  constructor(board, callbacks) {
    this.board     = board;
    this.state     = new GameState();
    this.callbacks = callbacks || {};

    this.board.container.addEventListener('card-click', (e) => {
      this._handleCardClick(e.detail.cardId);
    });
  }

  start() {
    this.state.reset();
  }

  _handleCardClick(cardId) {
    const { state } = this;

    if (state.isLocked || state.isFinished) return;

    const card = this.board.getCardById(cardId);
    if (card.isMatched || card.isFlipped) return;

    if (!state.isStarted) {
      state.isStarted = true;
      this._trigger('onFirstFlip');
    }

    card.flip(true);
    state.flippedCards.push(card);

    if (state.flippedCards.length === 2) {
      state.isLocked = true;
      state.moves++;
      this._trigger('onMove', state.moves);
      this._evaluatePair();
    }
  }

  _evaluatePair() {
    const [cardA, cardB] = this.state.flippedCards;
    const isMatch = this._iconsMatch(cardA.icon, cardB.icon);

    if (isMatch) {
      this._handleMatch(cardA, cardB);
    } else {
      this._handleMismatch(cardA, cardB);
    }
  }

  // -------------------------------------------------------------------------
  // _iconsMatch(iconA, iconB)
  // Compara dos iconos correctamente tanto si son sprites como emojis.
  // -------------------------------------------------------------------------
  _iconsMatch(iconA, iconB) {
    // Sprite: { sheet, index }
    if (iconA && typeof iconA === 'object' && iconA.sheet) {
      return iconA.sheet.src === iconB.sheet.src &&
             iconA.index     === iconB.index;
    }
    // Emoji o string
    return iconA === iconB;
  }

  _handleMatch(cardA, cardB) {
    cardA.markMatched();
    cardB.markMatched();

    this.state.matchedPairs++;
    this.state.flippedCards = [];
    this.state.isLocked     = false;

    this._trigger('onMatch', [cardA, cardB], this.state.matchedPairs, this.board.totalPairs);

    if (this.state.matchedPairs === this.board.totalPairs) {
      this.state.isFinished = true;
      this._trigger('onGameEnd', this.state);
    }
  }

  _handleMismatch(cardA, cardB) {
    cardA.markWrong();
    cardB.markWrong();

    this._trigger('onMismatch', [cardA, cardB]);

    setTimeout(() => {
      cardA.flip(false);
      cardB.flip(false);
      this.state.flippedCards = [];
      this.state.isLocked     = false;
    }, 900);
  }

  _trigger(event, ...args) {
    if (typeof this.callbacks[event] === 'function') {
      this.callbacks[event](...args);
    }
  }
}