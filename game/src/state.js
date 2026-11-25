// The kitchen's state and rules: orders arrive, patties and eggs grill,
// ingredients stack on the plate, and a plate serves only when it matches
// an open order exactly. Pure logic — no drawing, no sound — so the
// screenshot scenes can drive it forward step by step.

import {
  BURN_AFTER_SECONDS,
  COMBO_CAP,
  COOK_SECONDS,
  DAY_SECONDS,
  GRILL_SLOTS,
  INGREDIENTS,
  INGREDIENT_ORDER,
  MAX_HEARTS,
  MAX_ORDERS,
  ORDER_PATIENCE,
  ORDER_SPAWN_EVERY,
  ORDER_SPAWN_RUSH,
  RECIPES,
  RUSH_SECONDS,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;
export const EVENT_BURNT = 8;
export const EVENT_COOKED = 16;
export const EVENT_WRONG = 32;

let orderCounter = 0;

function sameIngredients(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

function newOrder(random, patience) {
  orderCounter += 1;
  const recipe = random.pick(RECIPES);
  return {
    id: orderCounter,
    recipe,
    patience,
    patienceMax: patience,
    bornAt: 0,
    flash: 0,
  };
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      time: 0,
      timeLeft: DAY_SECONDS,
      rush: false,
      score: 0,
      coins: 0,
      served: 0,
      combo: 0,
      bestCombo: 0,
      hearts: MAX_HEARTS,
      orders: [],
      spawnIn: 3,
      grill: Array.from({ length: GRILL_SLOTS }, () => ({
        item: null,
        progress: 0,
        burnt: false,
      })),
      plate: [],
      hand: null,
      handCooked: false,
      message: '',
      messageTime: 0,
      shake: 0,
      over: false,
      won: false,
    };
  }

  function reset() {
    const kept = state;
    Object.assign(kept, freshState());
    kept.orders.push(newOrder(random, ORDER_PATIENCE));
    kept.orders.push(newOrder(random, ORDER_PATIENCE));
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    state.orders.push(newOrder(random, ORDER_PATIENCE));
  }

  function pickIngredient(id) {
    const ingredient = INGREDIENTS[id];
    if (!ingredient || state.over) return false;
    if (state.hand) return false;
    state.hand = id;
    state.handCooked = !ingredient.cookable;
    return true;
  }

  function grillSlotIndex() {
    return state.grill.findIndex((slot) => slot.item === null);
  }

  function startGrill() {
    if (!state.hand) return false;
    const ingredient = INGREDIENTS[state.hand];
    if (!ingredient || !ingredient.cookable || state.handCooked) return false;
    const slot = grillSlotIndex();
    if (slot < 0) return false;
    state.grill[slot] = { item: state.hand, progress: 0, burnt: false };
    state.hand = null;
    state.handCooked = false;
    return true;
  }

  function takeFromGrill(slotIndex) {
    const slot = state.grill[slotIndex];
    if (!slot || !slot.item || state.hand) return false;
    if (slot.progress < COOK_SECONDS) return false;
    if (slot.burnt) {
      state.grill[slotIndex] = { item: null, progress: 0, burnt: false };
      return 'burnt';
    }
    state.hand = slot.item;
    state.handCooked = true;
    state.grill[slotIndex] = { item: null, progress: 0, burnt: false };
    return true;
  }

  function placeOnPlate() {
    if (!state.hand || !state.handCooked) return false;
    if (state.plate.length >= 5) return false;
    state.plate.push(state.hand);
    state.hand = null;
    state.handCooked = false;
    return true;
  }

  function trashPlate() {
    if (state.plate.length === 0 && !state.hand) return false;
    state.plate = [];
    state.hand = null;
    state.handCooked = false;
    return true;
  }

  function matchingOrder() {
    for (const order of state.orders) {
      if (sameIngredients(state.plate, order.recipe.needs)) return order;
    }
    return null;
  }

  function serve() {
    if (state.plate.length === 0 || state.over) return false;
    const order = matchingOrder();
    if (!order) {
      state.combo = 0;
      state.message = 'No order wants that dish — check the board!';
      state.messageTime = 2;
      return 'wrong';
    }
    const tip = Math.round((order.patience / order.patienceMax) * 10);
    const multiplier = 1 + Math.min(state.combo, COMBO_CAP) * 0.25;
    const earned = Math.round((order.recipe.price + tip) * multiplier);
    state.score += earned;
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.orders = state.orders.filter((item) => item !== order);
    state.plate = [];
    state.message = `Served ${order.recipe.name}! +${earned} coins`;
    state.messageTime = 2;
    return true;
  }

  function step(dt, interactive) {
    if (state.over) return 0;
    let events = 0;
    state.time += dt;
    state.timeLeft = Math.max(0, DAY_SECONDS - state.time);
    state.rush = state.timeLeft <= RUSH_SECONDS && state.timeLeft > 0;
    if (state.messageTime > 0) state.messageTime -= dt;
    if (state.shake > 0) state.shake -= dt;

    for (const slot of state.grill) {
      if (!slot.item) continue;
      slot.progress += dt;
      if (slot.progress >= COOK_SECONDS + BURN_AFTER_SECONDS && !slot.burnt) {
        slot.burnt = true;
        events |= EVENT_BURNT;
      }
    }

    for (const order of state.orders) {
      order.patience -= dt;
      order.flash = Math.max(0, order.flash - dt);
    }
    const expired = state.orders.filter((order) => order.patience <= 0);
    if (expired.length > 0) {
      state.orders = state.orders.filter((order) => order.patience > 0);
      state.hearts -= expired.length;
      state.combo = 0;
      state.shake = 0.4;
      state.message = expired.length > 1
        ? `${expired.length} customers walked out!`
        : 'A customer walked out hungry!';
      state.messageTime = 2;
      events |= EVENT_EXPIRED;
      if (state.hearts <= 0) {
        state.hearts = 0;
        state.over = true;
        state.won = false;
        return events | EVENT_OVER;
      }
    }

    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder();
      state.spawnIn = state.rush ? ORDER_SPAWN_RUSH : ORDER_SPAWN_EVERY;
    }

    if (state.timeLeft <= 0) {
      state.over = true;
      state.won = state.hearts > 0;
      return events | EVENT_OVER;
    }
    return events;
  }

  return {
    state,
    reset,
    step,
    pickIngredient,
    startGrill,
    takeFromGrill,
    placeOnPlate,
    trashPlate,
    serve,
    matchingOrder,
    grillSlotIndex,
    ingredientIds: INGREDIENT_ORDER,
  };
}
