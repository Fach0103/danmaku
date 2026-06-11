// board.js
// Responsabilidad: generar y manejar el tablero de cartas en el DOM.
// Depende de: nada
// Es usado por: game.js, app.js

// Tamaño visual de la carta en px (debe coincidir con el CSS)
const CARD_SIZE = 80;

class Card {
  constructor(id, icon) {
    this.id        = id;
    this.icon      = icon;   // { sheet: SpriteSheet, index: number } o string emoji
    this.isFlipped = false;
    this.isMatched = false;
    this.element   = this._createElement();
  }

  _createElement() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = this.id;

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    const front = document.createElement('div');
    front.classList.add('card-front');
    front.textContent = '?';

    const back = document.createElement('div');
    back.classList.add('card-back');

    // Sprite o emoji
    if (this.icon && typeof this.icon === 'object' && this.icon.sheet) {
      back.appendChild(this._createSprite(this.icon));
    } else {
      back.textContent = this.icon;
    }

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', () => {
      card.dispatchEvent(new CustomEvent('card-click', {
        bubbles: true,
        detail: { cardId: this.id }
      }));
    });

    return card;
  }

  // -------------------------------------------------------------------------
  // _createSprite({ sheet, index })
  // Crea un div que muestra el sprite correcto escalado a CARD_SIZE.
  // -------------------------------------------------------------------------
  _createSprite({ sheet, index }) {
    const sprite = document.createElement('div');
    sprite.classList.add('card-sprite');

    // Escala: queremos que el sprite ocupe CARD_SIZE px
    const scaleX = CARD_SIZE / sheet.spriteWidth;
    const scaleY = CARD_SIZE / sheet.spriteHeight;

    // Ancho total de la imagen escalada
    const scaledTotal = sheet.totalSprites * CARD_SIZE;

    // Posición X del sprite dentro de la imagen escalada
    const posX = -(index * CARD_SIZE);

    sprite.style.width           = `${CARD_SIZE}px`;
    sprite.style.height          = `${CARD_SIZE}px`;
    sprite.style.backgroundImage = `url('${sheet.src}')`;
    sprite.style.backgroundSize  = `${scaledTotal}px ${CARD_SIZE}px`;
    sprite.style.backgroundPosition = `${posX}px 0px`;
    sprite.style.backgroundRepeat   = 'no-repeat';

    return sprite;
  }

  flip(flipped) {
    this.isFlipped = flipped;
    this.element.classList.toggle('flipped', flipped);
    if (!flipped) this.element.classList.remove('wrong');
  }

  markMatched() {
    this.isMatched = true;
    this.element.classList.add('matched');
    this.element.style.cursor = 'default';
  }

  markWrong() {
    this.element.classList.add('wrong');
  }
}

class Board {
  constructor(containerId) {
    this.container  = document.getElementById(containerId);
    this.cards      = [];
    this.size       = 4;
    this.totalPairs = 0;
  }

  // icons: array de { sheet, index } mezclados aleatoriamente desde ThemeManager
  generate(size, icons) {
    this.size   = size || 4;
    icons       = icons || [];

    const totalCards    = this.size * this.size;
    this.totalPairs     = totalCards / 2;

    // Tomar aleatoriamente los pares necesarios del pool de icons
    const selected = this._pickRandom(icons, this.totalPairs);

    // Duplicar y mezclar
    const deck = this._shuffle(selected.concat(selected));

    this.reset();
    this.container.style.gridTemplateColumns = `repeat(${this.size}, ${CARD_SIZE}px)`;

    deck.forEach((icon, index) => {
      const card = new Card(index, icon);
      this.cards.push(card);
      this.container.appendChild(card.element);
    });
  }

  getCardById(id) {
    return this.cards[id];
  }

  reset() {
    this.container.innerHTML = '';
    this.cards      = [];
    this.totalPairs = 0;
  }

  // -------------------------------------------------------------------------
  // _pickRandom(arr, n)
  // Toma n elementos aleatorios únicos del array.
  // -------------------------------------------------------------------------
  _pickRandom(arr, n) {
    const shuffled = this._shuffle(arr.slice());
    return shuffled.slice(0, n);
  }

  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}