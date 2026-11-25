// The Copper Ladle — tuning, recipes and layout constants.
// Every number that shapes play lives here so the other files stay about
// behaviour, not magic numbers. One day lasts DAY_SECONDS; orders keep
// arriving until the clock runs out, and the last RUSH_SECONDS turn into a
// service rush with faster orders.

export const VIEW = { width: 1280, height: 720 };

export const DAY_SECONDS = 120;
export const RUSH_SECONDS = 30;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const ORDER_PATIENCE = 45;
export const ORDER_SPAWN_EVERY = 11;
export const ORDER_SPAWN_RUSH = 7;
export const GRILL_SLOTS = 2;
export const COOK_SECONDS = 4;
export const BURN_AFTER_SECONDS = 3;
export const COMBO_CAP = 3;

export const STEP = 1 / 60;
export const BEST_KEY = 'copper-ladle-best';

// The six things a cook can reach for. cookable ones must visit the grill
// before they can go on a plate; the rest go straight from bin to plate.
export const INGREDIENTS = {
  bun: { id: 'bun', name: 'Bun', key: '1', cookable: false, color: '#e8a94e' },
  patty: { id: 'patty', name: 'Patty', key: '2', cookable: true, color: '#7a4a21' },
  cheese: { id: 'cheese', name: 'Cheese', key: '3', cookable: false, color: '#f7c948' },
  lettuce: { id: 'lettuce', name: 'Lettuce', key: '4', cookable: false, color: '#5da24a' },
  tomato: { id: 'tomato', name: 'Tomato', key: '5', cookable: false, color: '#d94f3d' },
  egg: { id: 'egg', name: 'Egg', key: '6', cookable: true, color: '#f2e6c8' },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'egg'];

// The menu: four dishes, each a set of ingredients. A plate serves only
// when its ingredients match an open order exactly, extras included.
export const RECIPES = [
  {
    id: 'classic',
    name: 'Classic Stack',
    price: 25,
    needs: ['bun', 'patty', 'lettuce'],
    blurb: 'Bun, grilled patty, crisp lettuce.',
  },
  {
    id: 'melt',
    name: 'Golden Melt',
    price: 35,
    needs: ['bun', 'patty', 'cheese', 'tomato'],
    blurb: 'Bun, patty, melted cheese, tomato.',
  },
  {
    id: 'garden',
    name: 'Garden Fresh',
    price: 30,
    needs: ['bun', 'lettuce', 'tomato', 'cheese'],
    blurb: 'No grill, all crunch: bun, lettuce, tomato, cheese.',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Special',
    price: 28,
    needs: ['bun', 'egg', 'cheese'],
    blurb: 'Bun, a fried egg, melted cheese.',
  },
];

// Where things sit on the 1280x720 canvas.
export const LAYOUT = {
  header: { x: 0, y: 0, width: 1280, height: 64 },
  board: { x: 24, y: 80, width: 1232, height: 118 },
  bins: { x: 24, y: 226, width: 1232, height: 128, gap: 12 },
  grill: { x: 24, y: 378, width: 400, height: 150 },
  plate: { x: 448, y: 378, width: 384, height: 150 },
  serve: { x: 856, y: 378, width: 400, height: 150 },
  footer: { x: 0, y: 556, width: 1280, height: 164 },
};

export const PALETTE = {
  wall: '#f6e3c2',
  wallTop: '#f9ecd4',
  floor: '#c98d5a',
  floorDark: '#b57a4a',
  counter: '#8a5a33',
  counterTop: '#a9743f',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  paper: '#fff8e7',
  ink: '#3a2a1a',
  inkSoft: '#6b543a',
  tomato: '#d94f3d',
  leaf: '#5da24a',
  gold: '#f7c948',
  copper: '#b87333',
  danger: '#c0392b',
};
