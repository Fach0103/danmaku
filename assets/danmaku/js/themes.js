// themes.js
// Responsabilidad: catálogo de temáticas visuales.
// Depende de: nada
// Es usado por: app.js, menu.js

// ---------------------------------------------------------------------------
// SpriteSheet
// Representa una tira de sprites con sus dimensiones originales.
// ---------------------------------------------------------------------------
class SpriteSheet {
  constructor(src, totalSprites, spriteWidth, spriteHeight) {
    this.src           = src;
    this.totalSprites  = totalSprites;
    this.spriteWidth   = spriteWidth;
    this.spriteHeight  = spriteHeight;
  }
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
class Theme {
  constructor(id, name, sheets, colors) {
    this.id     = id;
    this.name   = name;
    this.sheets = sheets;  // Array de SpriteSheet
    this.colors = colors;
  }

  // Genera el array completo de sprites como objetos { sheet, index }
  getIcons() {
    const icons = [];
    this.sheets.forEach(sheet => {
      for (let i = 0; i < sheet.totalSprites; i++) {
        icons.push({ sheet, index: i });
      }
    });
    return icons;
  }
}

// ---------------------------------------------------------------------------
// ThemeManager
// ---------------------------------------------------------------------------
class ThemeManager {
  constructor() {
    this.themes      = this._buildCatalog();
    this.activeTheme = this.themes[0];
  }

  _buildCatalog() {
    return [
      new Theme(
        'touhou',
        '🎴 Touhou',
        [
          new SpriteSheet('assets/ima1.png', 16, 15.9, 19),
          new SpriteSheet('assets/ima2.png',  7, 37.4, 34),
          new SpriteSheet('assets/ima3.png', 16, 16.2, 38),
          new SpriteSheet('assets/ima4.png',  8, 33.1, 35),
          new SpriteSheet('assets/ima5.png',  8, 33.6, 34)
        ],
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
    return this.activeTheme.getIcons();
  }

  getAllThemes() {
    return this.themes;
  }
}