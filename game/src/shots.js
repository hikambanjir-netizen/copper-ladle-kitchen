// The screenshot scenes behind ?shot=title|assembly|serve|rush. Each one
// builds the exact kitchen a real game reaches — real orders, a real plate,
// a real grill — by setting the world's state directly, so the frame is
// what a short game really looks like and the same seed always gives the
// same frame. Nothing here is a mock: the renderer draws the live state.

import { DAY_SECONDS, ORDER_PATIENCE, RECIPES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function makeOrder(id, recipeId, patience) {
  const recipe = RECIPES.find((item) => item.id === recipeId);
  return {
    id,
    recipe,
    patience,
    patienceMax: ORDER_PATIENCE,
    bornAt: 0,
    flash: 0,
  };
}

function setClock(state, timeLeft) {
  state.time = DAY_SECONDS - timeLeft;
  state.timeLeft = timeLeft;
  state.rush = timeLeft <= 30 && timeLeft > 0;
}

export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'assembly') {
    // Mid-assembly: three orders on the board, a bun and a grilled patty
    // already on the plate, lettuce in hand, a second patty on the grill.
    setClock(state, 62);
    state.score = 45;
    state.coins = 45;
    state.served = 2;
    state.combo = 1;
    state.bestCombo = 1;
    state.orders = [
      makeOrder(3, 'melt', 34),
      makeOrder(4, 'classic', 22),
      makeOrder(5, 'sunrise', 41),
    ];
    state.grill[0] = { item: 'patty', progress: 2.4, burnt: false };
    state.grill[1] = { item: null, progress: 0, burnt: false };
    state.plate = ['bun', 'patty'];
    state.hand = 'lettuce';
    state.handCooked = true;
    state.message = 'Looking good — one more ingredient!';
    state.messageTime = 5;
    return { screen: SCREEN_PLAY, best: 45 };
  }
  if (name === 'serve') {
    // A Golden Melt finished on the plate, its order waiting, the serve
    // button glowing: the moment just before the ding.
    setClock(state, 45);
    state.score = 120;
    state.coins = 120;
    state.served = 4;
    state.combo = 2;
    state.bestCombo = 2;
    state.orders = [
      makeOrder(6, 'melt', 28),
      makeOrder(7, 'garden', 38),
      makeOrder(8, 'classic', 15),
    ];
    state.grill[0] = { item: 'egg', progress: 4, burnt: false };
    state.grill[1] = { item: null, progress: 0, burnt: false };
    state.plate = ['bun', 'patty', 'cheese', 'tomato'];
    state.hand = null;
    state.handCooked = false;
    state.message = 'Golden Melt ready — serve it!';
    state.messageTime = 5;
    return { screen: SCREEN_PLAY, best: 120 };
  }
  if (name === 'rush') {
    // Rush hour: four orders, one about to walk out, both grill slots
    // busy, a Sunrise Special half-built, eighteen seconds on the clock.
    setClock(state, 18);
    state.score = 210;
    state.coins = 210;
    state.served = 7;
    state.combo = 3;
    state.bestCombo = 3;
    state.hearts = 2;
    state.orders = [
      makeOrder(11, 'sunrise', 6),
      makeOrder(12, 'melt', 19),
      makeOrder(13, 'garden', 31),
      makeOrder(14, 'classic', 40),
    ];
    state.grill[0] = { item: 'patty', progress: 3.1, burnt: false };
    state.grill[1] = { item: 'egg', progress: 1.2, burnt: false };
    state.plate = ['bun', 'egg'];
    state.hand = 'cheese';
    state.handCooked = true;
    state.message = 'Rush hour! Keep the plates moving!';
    state.messageTime = 5;
    return { screen: SCREEN_PLAY, best: 210 };
  }
  // Anything else is the title screen over a fresh kitchen.
  setClock(state, DAY_SECONDS);
  state.orders = [makeOrder(1, 'classic', 40), makeOrder(2, 'garden', 44)];
  return { screen: SCREEN_TITLE, best: 0 };
}
