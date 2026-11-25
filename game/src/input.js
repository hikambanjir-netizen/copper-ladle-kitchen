// Keyboard and mouse, turned into game actions. The renderer owns the
// clickable rectangles; this file only remembers the latest pointer position
// and which keys were pressed since the last frame was read.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;
export const ACTION_MUTE = 16;
export const ACTION_RESTART = 32;

const KEY_ACTIONS = {
  ' ': ACTION_CONFIRM,
  Enter: ACTION_CONFIRM,
  p: ACTION_PAUSE,
  P: ACTION_PAUSE,
  Escape: ACTION_PAUSE,
  s: ACTION_SERVE,
  S: ACTION_SERVE,
  t: ACTION_TRASH,
  T: ACTION_TRASH,
  Backspace: ACTION_TRASH,
  Delete: ACTION_TRASH,
  m: ACTION_MUTE,
  M: ACTION_MUTE,
  r: ACTION_RESTART,
  R: ACTION_RESTART,
};

export function createInput(canvas) {
  let actions = 0;
  let click = null;
  let pointer = { x: -1, y: -1 };
  let ingredientKey = null;

  function toGameCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    pointer = toGameCoordinates(event);
    click = pointer;
  });
  canvas.addEventListener('pointermove', (event) => {
    pointer = toGameCoordinates(event);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const action = KEY_ACTIONS[event.key];
    if (action !== undefined) {
      actions |= action;
      event.preventDefault();
      return;
    }
    if (/^[1-6]$/.test(event.key)) ingredientKey = event.key;
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    takeIngredientKey() {
      const taken = ingredientKey;
      ingredientKey = null;
      return taken;
    },
    pointer() {
      return pointer;
    },
  };
}
