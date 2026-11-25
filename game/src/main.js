// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between four screens:
// title, play, paused and day over.
//
// ?seed=N fixes the order shuffle. ?shot=title|assembly|serve|rush (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.

import { BEST_KEY, COOK_SECONDS, INGREDIENTS, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createWorld, EVENT_BURNT, EVENT_EXPIRED, EVENT_OVER, EVENT_WRONG } from './state.js';
import {
  ACTION_CONFIRM,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  ACTION_SERVE,
  ACTION_TRASH,
  createInput,
} from './input.js';
import { createRenderer, regions, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function inside(point, rect) {
  return point && point.x >= rect.x && point.x <= rect.x + rect.width
    && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, { x: -1, y: -1 });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Take the orders, grill the patties, serve before patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    audio.stopSizzle();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(world.state.won
      ? `Day complete. Score ${world.state.score}. Best ${best}.`
      : `Kitchen closed early. Score ${world.state.score}. Best ${best}.`);
  }

  function updateSizzle() {
    const cooking = world.state.grill.some((slot) => slot.item && !slot.burnt);
    if (cooking) audio.startSizzle();
    else audio.stopSizzle();
  }

  function handleClick(point) {
    if (!point) return;
    const hit = regions(world.state);
    if (screen === SCREEN_TITLE) {
      if (inside(point, hit.start)) startGame();
      return;
    }
    if (screen === SCREEN_OVER) {
      if (inside(point, hit.restart)) startGame();
      return;
    }
    if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    // Playing: bins first, then the grill, the plate, serve and trash.
    for (const id of Object.keys(hit.bins)) {
      if (inside(point, hit.bins[id])) {
        if (world.state.hand) {
          if (world.pickIngredient(id)) audio.pickup();
          return;
        }
        if (world.pickIngredient(id)) audio.pickup();
        return;
      }
    }
    for (let i = 0; i < hit.grillSlots.length; i += 1) {
      if (!inside(point, hit.grillSlots[i])) continue;
      const slot = world.state.grill[i];
      if (world.state.hand && INGREDIENTS[world.state.hand].cookable && !world.state.handCooked) {
        if (world.startGrill()) {
          audio.grillStart();
          updateSizzle();
        }
        return;
      }
      if (slot.item && slot.progress >= COOK_SECONDS) {
        const taken = world.takeFromGrill(i);
        if (taken === 'burnt') {
          audio.error();
          world.state.message = 'Burnt! That one went in the bin.';
          world.state.messageTime = 2;
        } else if (taken) audio.pickup();
        updateSizzle();
        return;
      }
      return;
    }
    if (inside(point, hit.plate)) {
      if (world.placeOnPlate()) audio.place();
      return;
    }
    if (inside(point, hit.serve)) {
      const result = world.serve();
      if (result === true) audio.serve();
      else if (result === 'wrong') audio.error();
      return;
    }
    if (inside(point, hit.trash)) {
      if (world.trashPlate()) audio.chop();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const key = input.takeIngredientKey();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      if (actions & (ACTION_CONFIRM | ACTION_RESTART)) startGame();
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        audio.stopSizzle();
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (key) {
      const id = Object.values(INGREDIENTS).find((item) => item.key === key)?.id;
      if (id && world.pickIngredient(id)) audio.pickup();
    }
    if (actions & ACTION_SERVE) {
      const result = world.serve();
      if (result === true) audio.serve();
      else if (result === 'wrong') audio.error();
    }
    if (actions & ACTION_TRASH) {
      if (world.trashPlate()) audio.chop();
    }
    if (actions & ACTION_CONFIRM) {
      // Space on the play screen serves, same as the button.
      const result = world.serve();
      if (result === true) audio.serve();
      else if (result === 'wrong') audio.error();
    }
  }

  function step() {
    const events = world.step(STEP, true);
    if (events & EVENT_BURNT) {
      world.state.message = 'Something is burning on the grill!';
      world.state.messageTime = 2;
      audio.error();
    }
    if (events & EVENT_EXPIRED) audio.expire();
    if (events & EVENT_WRONG) audio.error();
    updateSizzle();
    // A tick while any order is nearly out of patience.
    const urgent = world.state.orders.find((order) => order.patience <= 5);
    if (urgent) {
      const second = Math.ceil(urgent.patience);
      if (second !== lastTickSecond) {
        lastTickSecond = second;
        audio.tick();
      }
    }
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleClick(input.takeClick());
    handleActions();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) break;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, input.pointer());
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    }
  });

  announce('The Copper Ladle. Press Space or click to start cooking.');
  // A handle for automated play-tests (and nothing else): the live world.
  window.__ladle = {
    snapshot() {
      return {
        screen,
        timeLeft: Math.round(world.state.timeLeft),
        score: world.state.score,
        orders: world.state.orders.map((order) => order.recipe.id),
        plate: [...world.state.plate],
        hand: world.state.hand,
      };
    },
  };
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
