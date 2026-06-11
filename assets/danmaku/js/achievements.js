// achievements.js
// Responsabilidad: definición, verificación y notificación de logros.
// Depende de: nada
// Es usado por: modes.js, app.js

class Achievement {
  constructor(id, icon, title, description, condition) {
    this.id          = id;
    this.icon        = icon;
    this.title       = title;
    this.description = description;
    this.condition   = condition;
    this.unlocked    = false;
  }

  tryUnlock(context) {
    if (this.unlocked) return false;
    if (this.condition(context)) { this.unlocked = true; return true; }
    return false;
  }

  reset() { this.unlocked = false; }
}

class AchievementContext {
  constructor() {
    this.moves            = 0;
    this.matchedPairs     = 0;
    this.totalPairs       = 0;
    this.consecutiveHits  = 0;
    this.elapsedSeconds   = 0;
    this.lastMoveWasMatch = false;
    this.mode             = '';
    this.difficulty       = 4;
  }

  reset() {
    this.moves            = 0;
    this.matchedPairs     = 0;
    this.totalPairs       = 0;
    this.consecutiveHits  = 0;
    this.elapsedSeconds   = 0;
    this.lastMoveWasMatch = false;
    this.mode             = '';
    this.difficulty       = 4;
  }
}

class AchievementManager {
  constructor(onUnlock) {
    this.onUnlock     = onUnlock || null;
    this.context      = new AchievementContext();
    this.achievements = this._buildCatalog();
  }

  _buildCatalog() {
    return [
      new Achievement('first_pair',    '🥇', 'Primer paso',
        'Encuentra tu primer par.',
        (ctx) => ctx.matchedPairs >= 1),

      new Achievement('hot_streak',    '🔥', 'Racha caliente',
        'Encuentra 3 pares consecutivos sin fallar.',
        (ctx) => ctx.consecutiveHits >= 3),

      new Achievement('speedster',     '⚡', 'Velocista',
        'Completa el modo fácil en menos de 30 segundos.',
        (ctx) => ctx.mode === 'solo' && ctx.difficulty === 4 &&
                 ctx.matchedPairs === ctx.totalPairs && ctx.elapsedSeconds < 30),

      new Achievement('no_hesitation', '🎯', 'Sin titubeos',
        'Encuentra un par en tu primer intento.',
        (ctx) => ctx.moves === 1 && ctx.matchedPairs === 1),

      new Achievement('halfway',       '🌗', 'A mitad de camino',
        'Encuentra la mitad de los pares del tablero.',
        (ctx) => ctx.totalPairs > 0 && ctx.matchedPairs === Math.floor(ctx.totalPairs / 2)),

      new Achievement('perfect_game',  '💎', 'Partida perfecta',
        'Completa el tablero con 100% de aciertos.',
        (ctx) => ctx.matchedPairs === ctx.totalPairs && ctx.moves === ctx.totalPairs),

      new Achievement('completionist', '🏆', 'Coleccionista',
        'Completa un tablero difícil (8×8).',
        (ctx) => ctx.difficulty === 8 && ctx.matchedPairs === ctx.totalPairs),

      new Achievement('persistent',    '💪', 'Persistente',
        'Realiza más de 40 movimientos en una sola partida.',
        (ctx) => ctx.moves > 40)
    ];
  }

  setup(mode, difficulty, totalPairs) {
    this.context.reset();
    this.context.mode       = mode;
    this.context.difficulty = difficulty;
    this.context.totalPairs = totalPairs;
    this.achievements.forEach(a => a.reset());
  }

  onMove(moves) {
    this.context.moves = moves;
    this._evaluate();
  }

  onMatch(matchedPairs) {
    this.context.matchedPairs    = matchedPairs;
    this.context.consecutiveHits++;
    this.context.lastMoveWasMatch = true;
    this._evaluate();
  }

  onMismatch() {
    this.context.consecutiveHits  = 0;
    this.context.lastMoveWasMatch = false;
  }

  onTick(elapsed) {
    this.context.elapsedSeconds = elapsed;
  }

  _evaluate() {
    this.achievements.forEach(a => {
      const justUnlocked = a.tryUnlock(this.context);
      if (justUnlocked && typeof this.onUnlock === 'function') {
        this.onUnlock(a);
      }
    });
  }

  getUnlocked() {
    return this.achievements.filter(a => a.unlocked);
  }
}

class AchievementNotifier {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this._queue    = [];
    this._showing  = false;
  }

  notify(achievement) {
    this._queue.push(achievement);
    if (!this._showing) this._showNext();
  }

  _showNext() {
    if (this._queue.length === 0) { this._showing = false; return; }

    this._showing       = true;
    const achievement   = this._queue.shift();

    const toast = document.createElement('div');
    toast.classList.add('achievement-toast');
    toast.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <div class="achievement-info">
        <strong>${achievement.title}</strong>
        <small>${achievement.description}</small>
      </div>
    `;

    this.container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('achievement-toast--visible'));

    setTimeout(() => {
      toast.classList.remove('achievement-toast--visible');
      toast.classList.add('achievement-toast--hiding');
      toast.addEventListener('transitionend', () => {
        toast.remove();
        this._showNext();
      }, { once: true });
    }, 2800);
  }
}