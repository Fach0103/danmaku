// timer.js
// Responsabilidad: manejar el cronómetro de la partida.
// Depende de: nada
// Es usado por: SoloMode (modes.js), app.js

class Timer {
  constructor(onTick) {
    this.onTick      = onTick || null;
    this.elapsed     = 0;
    this._interval   = null;
    this._isRunning  = false;
  }

  start() {
    if (this._isRunning) this.stop();
    this.elapsed    = 0;
    this._isRunning = true;
    this._interval  = setInterval(() => {
      this.elapsed++;
      if (typeof this.onTick === 'function') this.onTick(this.elapsed);
    }, 1000);
  }

  stop() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    this._isRunning = false;
  }

  pause() {
    if (!this._isRunning) return;
    clearInterval(this._interval);
    this._interval  = null;
    this._isRunning = false;
  }

  resume() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._interval  = setInterval(() => {
      this.elapsed++;
      if (typeof this.onTick === 'function') this.onTick(this.elapsed);
    }, 1000);
  }

  reset() {
    this.stop();
    this.elapsed = 0;
  }

  getElapsed()   { return this.elapsed; }
  isRunning()    { return this._isRunning; }

  getFormatted() {
    const mins = Math.floor(this.elapsed / 60).toString().padStart(2, '0');
    const secs = (this.elapsed % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}