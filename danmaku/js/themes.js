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
    const personajes = Array.from({ length: 32 }, (_, i) =>
      `assets/personajes/pj${i + 1}.jfif`
    );

    return [
      new Theme(
        'touhou',
        '🎴 Touhou',
        personajes,
        {
          '--color-bg':          '#0d0d1a',
          '--color-surface':     '#1a1a2e',
          '--color-primary':     '#e94560',
          '--color-accent':      '#ff6b9d',
          '--color-card-front':  '#16213e',
          '--color-card-back':   '#0f3460',
          '--color-card-border': '#e94560',
          '--color-matched':     '#4ade80',
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