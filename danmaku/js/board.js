// board.js
// Responsabilidad: generar y manejar el tablero de cartas en el DOM.
// Depende de: nada
// Es usado por: game.js, app.js

const DEFAULT_ICONS = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
  '🐨','🐯','🦁','🐮','🐸','🐵','🐔','🐧',
  '🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗',
  '🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜'
];

class Card {
  constructor(id, icon) {
    this.id        = id;
    this.icon      = icon;
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
    back.textContent = this.icon;

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

  generate(size, icons) {
    this.size   = size || 4;
    icons       = icons || DEFAULT_ICONS;

    const totalCards    = this.size * this.size;
    this.totalPairs     = totalCards / 2;

    const deck = this._shuffle(
      icons.slice(0, this.totalPairs).concat(icons.slice(0, this.totalPairs))
    );

    this.reset();
    this.container.style.gridTemplateColumns = `repeat(${this.size}, 80px)`;

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

  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}