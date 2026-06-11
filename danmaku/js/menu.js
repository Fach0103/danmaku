// menu.js
// Responsabilidad: construir y gestionar la pantalla de inicio.
// Depende de: ThemeManager (themes.js)
// Es usado por: app.js

class Menu {
  constructor(containerId, themeManager, onStart) {
    this.container    = document.getElementById(containerId);
    this.themeManager = themeManager;
    this.onStart      = onStart || null;
    this._els         = {};
    this._build();
  }

  _build() {
    this.container.innerHTML = '';

    const title = document.createElement('h1');
    title.classList.add('menu-title');
    title.textContent = 'Danmaku Memory';
    this.container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.classList.add('menu-subtitle');
    subtitle.textContent = 'Pon a prueba tu memoria';
    this.container.appendChild(subtitle);

    this.container.appendChild(this._buildModeSelector());
    this.container.appendChild(this._buildDifficultySelector());
    this.container.appendChild(this._buildThemeSelector());
    this.container.appendChild(this._buildPlayerInputs());
    this.container.appendChild(this._buildStartButton());
  }

  _buildModeSelector() {
    const group = this._createGroup('Modo de juego');
    const options = [
      { value: 'solo', label: '⏱️ Solitario', desc: 'Contra el reloj' },
      { value: 'pvp',  label: '⚔️ PvP',        desc: 'Dos jugadores'  },
      { value: 'free', label: '🎯 Libre',       desc: 'Sin presión'    }
    ];
    const selector = document.createElement('div');
    selector.classList.add('mode-selector');
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.classList.add('mode-btn');
      btn.dataset.value = opt.value;
      btn.innerHTML = `
        <span class="mode-btn-label">${opt.label}</span>
        <span class="mode-btn-desc">${opt.desc}</span>
      `;
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-btn--active'));
        btn.classList.add('mode-btn--active');
        this._els.selectedMode = opt.value;
        this._togglePlayer2(opt.value === 'pvp');
      });
      if (opt.value === 'solo') {
        btn.classList.add('mode-btn--active');
        this._els.selectedMode = 'solo';
      }
      selector.appendChild(btn);
    });
    group.appendChild(selector);
    return group;
  }

  _buildDifficultySelector() {
    const group = this._createGroup('Dificultad');
    const options = [
      { value: 4, label: 'Fácil',      desc: '4×4 — 16 cartas' },
      { value: 6, label: 'Intermedio', desc: '6×6 — 36 cartas' },
      { value: 8, label: 'Difícil',    desc: '8×8 — 64 cartas' }
    ];
    const selector = document.createElement('div');
    selector.classList.add('difficulty-selector');
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.classList.add('difficulty-btn');
      btn.dataset.value = opt.value;
      btn.innerHTML = `
        <span class="difficulty-btn-label">${opt.label}</span>
        <span class="difficulty-btn-desc">${opt.desc}</span>
      `;
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('difficulty-btn--active'));
        btn.classList.add('difficulty-btn--active');
        this._els.selectedDifficulty = opt.value;
      });
      if (opt.value === 4) {
        btn.classList.add('difficulty-btn--active');
        this._els.selectedDifficulty = 4;
      }
      selector.appendChild(btn);
    });
    group.appendChild(selector);
    return group;
  }

  _buildThemeSelector() {
    const group = this._createGroup('Temática');
    const selector = document.createElement('div');
    selector.classList.add('theme-selector');
    this.themeManager.getAllThemes().forEach((theme, index) => {
      const btn = document.createElement('button');
      btn.classList.add('theme-btn');
      btn.dataset.value = theme.id;
      const preview = theme.icons.slice(0, 4).join(' ');
      btn.innerHTML = `
        <span class="theme-btn-preview">${preview}</span>
        <span class="theme-btn-name">${theme.name}</span>
      `;
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('theme-btn--active'));
        btn.classList.add('theme-btn--active');
        this._els.selectedTheme = theme.id;
        this.themeManager.apply(theme.id);
      });
      if (index === 0) {
        btn.classList.add('theme-btn--active');
        this._els.selectedTheme = theme.id;
      }
      selector.appendChild(btn);
    });
    group.appendChild(selector);
    return group;
  }

  _buildPlayerInputs() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('players-wrapper');

    const group1 = this._createGroup('Jugador 1');
    const input1 = document.createElement('input');
    input1.type        = 'text';
    input1.placeholder = 'Tu nombre';
    input1.classList.add('menu-input');
    this._els.input1   = input1;
    group1.appendChild(input1);

    const group2 = this._createGroup('Jugador 2');
    group2.classList.add('player2-group');
    group2.style.display = 'none';
    const input2 = document.createElement('input');
    input2.type        = 'text';
    input2.placeholder = 'Nombre del segundo jugador';
    input2.classList.add('menu-input');
    this._els.input2 = input2;
    this._els.group2 = group2;
    group2.appendChild(input2);

    wrapper.appendChild(group1);
    wrapper.appendChild(group2);
    return wrapper;
  }

  _buildStartButton() {
    const btn = document.createElement('button');
    btn.classList.add('menu-start-btn');
    btn.textContent = 'Iniciar Juego';
    btn.addEventListener('click', () => {
      const config = this._readConfig();
      if (!this._validate(config)) return;
      if (typeof this.onStart === 'function') this.onStart(config);
    });
    this._els.startBtn = btn;
    return btn;
  }

  _readConfig() {
    const p1       = this._els.input1.value.trim() || 'Jugador 1';
    const p2       = this._els.input2.value.trim() || 'Jugador 2';
    const modeName = this._els.selectedMode || 'solo';
    return {
      size:     this._els.selectedDifficulty || 4,
      modeName,
      themeId:  this._els.selectedTheme || 'animals',
      players:  modeName === 'pvp' ? [p1, p2] : [p1]
    };
  }

  _validate(config) {
    this._clearErrors();
    if (config.modeName === 'pvp') {
      const p1 = this._els.input1.value.trim();
      const p2 = this._els.input2.value.trim();
      if (p1 && p2 && p1.toLowerCase() === p2.toLowerCase()) {
        this._showError('Los nombres de ambos jugadores deben ser diferentes.');
        return false;
      }
    }
    return true;
  }

  _showError(message) {
    let errorEl = this.container.querySelector('.menu-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.classList.add('menu-error');
      this._els.startBtn.before(errorEl);
    }
    errorEl.textContent    = message;
    errorEl.style.display  = 'block';
  }

  _clearErrors() {
    const errorEl = this.container.querySelector('.menu-error');
    if (errorEl) errorEl.style.display = 'none';
  }

  _togglePlayer2(show) {
    this._els.group2.style.display = show ? 'flex' : 'none';
  }

  show() { this.container.style.display = 'flex'; }
  hide() { this.container.style.display = 'none'; }

  _createGroup(label) {
    const group = document.createElement('div');
    group.classList.add('menu-group');
    const lbl = document.createElement('label');
    lbl.classList.add('menu-label');
    lbl.textContent = label;
    group.appendChild(lbl);
    return group;
  }
}