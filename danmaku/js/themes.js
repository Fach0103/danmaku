// themes.js
// Responsabilidad: catálogo de temáticas visuales.
// Depende de: nada
// Es usado por: app.js, menu.js

class Theme {
  constructor(id, name, icons, colors) {
    this.id     = id;
    this.name   = name;
    this.icons  = icons;
    this.colors = colors;
  }
}

class ThemeManager {
  constructor() {
    this.themes      = this._buildCatalog();
    this.activeTheme = this.themes[0];
  }

  _buildCatalog() {
    return [

      new Theme(
        'animals',
        '🐾 Animales',
        [
          '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
          '🐨','🐯','🦁','🐮','🐸','🐵','🐔','🐧',
          '🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗',
          '🐴','🦄','🐝','🦋','🐌','🐞','🐜','🦎'
        ],
        {
          '--color-bg':          '#1a2e1a',
          '--color-surface':     '#1e3d1e',
          '--color-primary':     '#4ade80',
          '--color-accent':      '#86efac',
          '--color-card-front':  '#14532d',
          '--color-card-back':   '#166534',
          '--color-card-border': '#4ade80',
          '--color-matched':     '#bbf7d0',
          '--color-wrong':       '#f87171'
        }
      ),

      new Theme(
        'space',
        '🚀 Espacio',
        [
          '🚀','🛸','🌙','⭐','🌟','💫','☄️','🪐',
          '🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌕',
          '🌖','🌗','🌘','🌌','🔭','👨‍🚀','👩‍🚀','🛰️',
          '🌠','🌃','🌉','💥','🔆','🌀','⚡','🌈'
        ],
        {
          '--color-bg':          '#0a0a1a',
          '--color-surface':     '#0d0d2b',
          '--color-primary':     '#818cf8',
          '--color-accent':      '#c7d2fe',
          '--color-card-front':  '#1e1b4b',
          '--color-card-back':   '#312e81',
          '--color-card-border': '#818cf8',
          '--color-matched':     '#e0e7ff',
          '--color-wrong':       '#f87171'
        }
      ),

      new Theme(
        'food',
        '🍕 Comida',
        [
          '🍕','🍔','🌮','🍜','🍣','🍩','🎂','🍦',
          '🍓','🍉','🍇','🍋','🍑','🍒','🥝','🥑',
          '🌽','🥕','🧄','🥦','🍄','🧅','🥜','🌰',
          '🍺','🧃','🥤','🍵','☕','🧁','🍪','🥐'
        ],
        {
          '--color-bg':          '#2d1a0e',
          '--color-surface':     '#3d2010',
          '--color-primary':     '#fb923c',
          '--color-accent':      '#fed7aa',
          '--color-card-front':  '#7c2d12',
          '--color-card-back':   '#9a3412',
          '--color-card-border': '#fb923c',
          '--color-matched':     '#ffedd5',
          '--color-wrong':       '#f87171'
        }
      )

    ];
  }

  getThemeById(id) {
    return this.themes.find(t => t.id === id) || this.themes[0];
  }

  apply(themeId) {
    const theme = this.getThemeById(themeId);
    this.activeTheme = theme;
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }

  getActiveIcons() {
    return this.activeTheme.icons;
  }

  getAllThemes() {
    return this.themes;
  }
}