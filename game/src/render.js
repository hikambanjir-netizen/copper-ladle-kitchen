// Everything the player sees, painted on one canvas: the kitchen, the
// order board, the ingredient bins, the grill, the plate, the serve pass,
// and the title, pause and day-end screens. The hit rectangles live here
// too, so a click lands exactly on what is drawn.

import {
  COOK_SECONDS,
  DAY_SECONDS,
  INGREDIENTS,
  LAYOUT,
  PALETTE,
  VIEW,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

// One ingredient, drawn as a flat little icon. `cooked` matters for the
// grill items: a raw patty is pink-red, a cooked one browned; a raw egg is
// still in its shell.
export function drawIngredient(ctx, id, x, y, size, cooked = true) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, -half * 0.15, half * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a2e';
    ctx.fillRect(-half * 0.95, -half * 0.15, half * 1.9, half * 0.3);
    ctx.fillStyle = '#f7d38a';
    ctx.fillRect(-half * 0.95, half * 0.15, half * 1.9, half * 0.32);
    ctx.fillStyle = '#fff3d6';
    for (const dot of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      ctx.arc(dot * half, -half * 0.55, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = cooked ? '#7a4a21' : '#c96a5e';
    roundRect(ctx, -half, -half * 0.7, size, half * 1.4, half * 0.45);
    ctx.fill();
    ctx.strokeStyle = cooked ? '#5a3413' : '#a34a40';
    ctx.lineWidth = size * 0.05;
    for (const line of [-0.4, 0, 0.4]) {
      ctx.beginPath();
      ctx.moveTo(line * half, -half * 0.5);
      ctx.lineTo(line * half, half * 0.5);
      ctx.stroke();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(-half, half * 0.6);
    ctx.lineTo(half, half * 0.6);
    ctx.lineTo(0, -half * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a91c';
    for (const [dx, dy] of [[-0.35, 0.15], [0.25, 0.05], [0, 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx * half, dy * half, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const px = -half + (i * size) / 6;
      const py = i % 2 === 0 ? -half * 0.25 : half * 0.25;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(half, half * 0.6);
    ctx.lineTo(-half, half * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3f7a33';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-half * 0.6, 0);
    ctx.lineTo(half * 0.6, 0);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.arc(0, half * 0.1, half * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    ctx.moveTo(0, -half * 0.55);
    ctx.lineTo(-half * 0.3, -half * 0.95);
    ctx.lineTo(half * 0.3, -half * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-half * 0.35, -half * 0.25, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'egg') {
    if (!cooked) {
      ctx.fillStyle = '#f2e6c8';
      ctx.beginPath();
      ctx.ellipse(0, 0, half * 0.8, half, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9c69a';
      ctx.beginPath();
      ctx.arc(half * 0.25, -half * 0.3, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fffdf2';
      ctx.beginPath();
      ctx.ellipse(0, 0, half, half * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7b733';
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd970';
      ctx.beginPath();
      ctx.arc(-half * 0.12, -half * 0.12, half * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// The clickable rectangles, in the same coordinates as the drawing.
export function regions(state) {
  const bins = LAYOUT.bins;
  const binWidth = (bins.width - 5 * bins.gap) / 6;
  const out = {
    bins: {},
    grillSlots: [],
    plate: LAYOUT.plate,
    serve: { x: LAYOUT.serve.x + 40, y: LAYOUT.serve.y + 74, width: 180, height: 56 },
    trash: { x: LAYOUT.serve.x + 236, y: LAYOUT.serve.y + 74, width: 124, height: 56 },
    start: { x: 490, y: 470, width: 300, height: 64 },
    restart: { x: 490, y: 460, width: 300, height: 64 },
  };
  const ids = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'egg'];
  ids.forEach((id, index) => {
    out.bins[id] = {
      x: bins.x + index * (binWidth + bins.gap),
      y: bins.y,
      width: binWidth,
      height: bins.height,
    };
  });
  for (let i = 0; i < 2; i += 1) {
    out.grillSlots.push({
      x: LAYOUT.grill.x + 24 + i * 186,
      y: LAYOUT.grill.y + 52,
      width: 160,
      height: 82,
    });
  }
  return out;
}

function drawKitchen(ctx, state) {
  // Walls and tiled floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 360);
  wall.addColorStop(0, PALETTE.wallTop);
  wall.addColorStop(1, PALETTE.wall);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, VIEW.width, 360);
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 560, VIEW.width, 160);
  ctx.fillStyle = PALETTE.floorDark;
  for (let x = 0; x < VIEW.width; x += 80) {
    ctx.fillRect(x, 560, 2, 160);
    ctx.fillRect(x, 640, 2, 80);
  }
  ctx.fillRect(0, 640, VIEW.width, 2);
  // Copper pots hanging on the wall.
  for (let i = 0; i < 5; i += 1) {
    const x = 90 + i * 260;
    ctx.fillStyle = PALETTE.copper;
    ctx.beginPath();
    ctx.arc(x, 40, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a22';
    ctx.beginPath();
    ctx.arc(x, 40, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.copper;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x, 4);
    ctx.stroke();
  }
  // Window with a sunny street.
  ctx.fillStyle = '#bfe3f2';
  roundRect(ctx, 1080, 12, 150, 52, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd970';
  ctx.beginPath();
  ctx.arc(1130, 34, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fb069';
  ctx.fillRect(1180, 46, 44, 18);
}

function drawHeader(ctx, state) {
  const header = LAYOUT.header;
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(header.x, header.y, header.width, header.height);
  text(ctx, 'THE COPPER LADLE', 24, 42, 30, '#f7c948', 800);
  text(ctx, 'a tiny kitchen, a big lunch rush', 330, 40, 15, '#d8c3a5', 600);
  // Day timer: a bar you can feel plus the clock.
  const timerX = 640;
  const timerWidth = 260;
  const left = state.timeLeft / DAY_SECONDS;
  ctx.fillStyle = '#5a4632';
  roundRect(ctx, timerX, 18, timerWidth, 28, 14);
  ctx.fill();
  ctx.fillStyle = state.rush ? PALETTE.danger : PALETTE.gold;
  if (left > 0) {
    roundRect(ctx, timerX + 3, 21, (timerWidth - 6) * left, 22, 11);
    ctx.fill();
  }
  text(ctx, `⏱ ${formatTime(state.timeLeft)}`, timerX + timerWidth / 2, 40, 20, '#ffffff', 800, 'center');
  text(ctx, `SCORE ${state.score}`, 940, 40, 20, '#ffffff', 800);
  text(ctx, `🪙 ${state.coins}`, 1090, 40, 20, PALETTE.gold, 800);
  for (let i = 0; i < 3; i += 1) {
    text(ctx, i < state.hearts ? '♥' : '♡', 1196 + i * 26, 40, 22, i < state.hearts ? '#ff6b6b' : '#7a6a58', 800);
  }
  if (state.combo > 1) {
    text(ctx, `COMBO ×${(1 + Math.min(state.combo, 3) * 0.25).toFixed(2)}`, 940, 58, 13, '#ff9f43', 800);
  }
}

function drawBoard(ctx, state) {
  const board = LAYOUT.board;
  ctx.fillStyle = '#6b4a2a';
  roundRect(ctx, board.x - 6, board.y - 6, board.width + 12, board.height + 12, 12);
  ctx.fill();
  ctx.fillStyle = '#2f2113';
  roundRect(ctx, board.x, board.y, board.width, board.height, 8);
  ctx.fill();
  text(ctx, 'ORDER BOARD', board.x + 14, board.y + 26, 15, '#f7c948', 800);
  text(ctx, 'serve the dish an order asks for — exact ingredients, no extras', board.x + 150, board.y + 26, 13, '#c9b18c', 600);
  const ticketWidth = 282;
  const ticketGap = 14;
  for (let i = 0; i < 4; i += 1) {
    const x = board.x + 14 + i * (ticketWidth + ticketGap);
    const y = board.y + 36;
    const order = state.orders[i];
    ctx.fillStyle = order ? PALETTE.paper : 'rgba(255,248,231,0.08)';
    roundRect(ctx, x, y, ticketWidth, 72, 8);
    ctx.fill();
    if (!order) {
      text(ctx, '— waiting for the next order —', x + ticketWidth / 2, y + 42, 13, '#8a7a63', 600, 'center');
      continue;
    }
    const low = order.patience < 12;
    if (low && Math.floor(order.patience * 2) % 2 === 0) {
      ctx.fillStyle = 'rgba(217,79,61,0.15)';
      roundRect(ctx, x, y, ticketWidth, 72, 8);
      ctx.fill();
    }
    text(ctx, `#${order.id} ${order.recipe.name}`, x + 12, y + 24, 16, PALETTE.ink, 800);
    text(ctx, `$${order.recipe.price}`, x + ticketWidth - 12, y + 24, 16, '#8a6d1f', 800, 'right');
    order.recipe.needs.forEach((id, index) => {
      drawIngredient(ctx, id, x + 26 + index * 34, y + 46, 26, true);
    });
    text(ctx, order.recipe.needs.map((id) => INGREDIENTS[id].name).join(' + '), x + 12, y + 64, 11, PALETTE.inkSoft, 600);
    const barWidth = ticketWidth - 24;
    ctx.fillStyle = '#e8dcc3';
    ctx.fillRect(x + 12, y + 66, barWidth, 5);
    ctx.fillStyle = low ? PALETTE.danger : PALETTE.leaf;
    ctx.fillRect(x + 12, y + 66, barWidth * Math.max(0, order.patience / order.patienceMax), 5);
  }
}

function drawBins(ctx, state, hover) {
  const bins = LAYOUT.bins;
  const hit = regions(state).bins;
  text(ctx, 'INGREDIENTS — click a bin or press its key', bins.x, bins.y - 8, 14, PALETTE.ink, 800);
  for (const id of ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'egg']) {
    const rect = hit[id];
    const ingredient = INGREDIENTS[id];
    const isHover = hover && hover.x >= rect.x && hover.x <= rect.x + rect.width
      && hover.y >= rect.y && hover.y <= rect.y + rect.height;
    const held = state.hand === id;
    ctx.fillStyle = held ? '#ffe9b0' : isHover ? '#f3e2bd' : PALETTE.paper;
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12);
    ctx.fill();
    ctx.strokeStyle = held ? PALETTE.copper : '#d9c9a3';
    ctx.lineWidth = held ? 4 : 2;
    ctx.stroke();
    drawIngredient(ctx, id, rect.x + rect.width / 2, rect.y + 52, 56, !ingredient.cookable);
    text(ctx, ingredient.name, rect.x + rect.width / 2, rect.y + 102, 16, PALETTE.ink, 800, 'center');
    const hint = ingredient.cookable ? 'grill it first' : 'ready to plate';
    text(ctx, `${hint}  ·  key ${ingredient.key}`, rect.x + rect.width / 2, rect.y + 120, 11, PALETTE.inkSoft, 600, 'center');
    if (ingredient.cookable) {
      text(ctx, '🔥', rect.x + rect.width - 24, rect.y + 24, 16, PALETTE.tomato, 800);
    }
  }
}

function drawGrill(ctx, state) {
  const grill = LAYOUT.grill;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, grill.x, grill.y, grill.width, grill.height, 12);
  ctx.fill();
  ctx.fillStyle = '#2e2e34';
  roundRect(ctx, grill.x + 12, grill.y + 40, grill.width - 24, 96, 8);
  ctx.fill();
  text(ctx, '🔥 GRILL', grill.x + 18, grill.y + 28, 16, '#ffb347', 800);
  text(ctx, 'raw patties & eggs cook here — grab them before they burn', grill.x + 110, grill.y + 28, 12, '#b9b3a8', 600);
  const hit = regions(state).grillSlots;
  state.grill.forEach((slot, i) => {
    const rect = hit[i];
    ctx.fillStyle = '#1d1d22';
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10);
    ctx.fill();
    ctx.strokeStyle = '#5a5a64';
    ctx.lineWidth = 2;
    for (let line = 1; line <= 3; line += 1) {
      ctx.beginPath();
      ctx.moveTo(rect.x + 10, rect.y + (line * rect.height) / 4);
      ctx.lineTo(rect.x + rect.width - 10, rect.y + (line * rect.height) / 4);
      ctx.stroke();
    }
    if (!slot.item) {
      text(ctx, 'empty', rect.x + rect.width / 2, rect.y + rect.height / 2 + 5, 13, '#6a6a74', 600, 'center');
      return;
    }
    drawIngredient(ctx, slot.item, rect.x + rect.width / 2, rect.y + 34, 44, slot.progress >= COOK_SECONDS);
    const progress = Math.min(1, slot.progress / COOK_SECONDS);
    ctx.fillStyle = '#3a3a42';
    roundRect(ctx, rect.x + 16, rect.y + 62, rect.width - 32, 10, 5);
    ctx.fill();
    ctx.fillStyle = slot.burnt ? PALETTE.danger : progress >= 1 ? PALETTE.leaf : '#ff9f43';
    roundRect(ctx, rect.x + 16, rect.y + 62, (rect.width - 32) * progress, 10, 5);
    ctx.fill();
    text(
      ctx,
      slot.burnt ? 'BURNT! click to bin it' : progress >= 1 ? 'READY — click to take it' : 'cooking…',
      rect.x + rect.width / 2,
      rect.y + 80,
      11,
      slot.burnt ? '#ff8a7a' : '#d8d2c6',
      700,
      'center',
    );
  });
}

function drawPlate(ctx, state) {
  const plate = LAYOUT.plate;
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, plate.x, plate.y, plate.width, plate.height, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, plate.x, plate.y, plate.width, 10, 5);
  ctx.fill();
  text(ctx, '🍽  PLATE', plate.x + 18, plate.y + 28, 16, '#fff3d6', 800);
  const match = state.plate.length > 0 && state.orders.some((order) =>
    order.recipe.needs.length === state.plate.length
    && order.recipe.needs.every((id) => state.plate.includes(id)));
  text(ctx, match ? 'matches an order!' : 'build the dish here', plate.x + 110, plate.y + 28, 12, match ? '#b8f5a0' : '#e8d3ae', 700);
  // The plate itself, with the stacked ingredients.
  const cx = plate.x + plate.width / 2;
  const cy = plate.y + 100;
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 120, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9d4c5';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f2ede0';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (state.plate.length === 0) {
    text(ctx, 'empty plate', cx, cy + 5, 13, '#a89a80', 600, 'center');
  } else {
    // Each layer sits a little higher and a little to one side, so every
    // ingredient in the stack stays visible instead of hiding behind the
    // one above it.
    state.plate.forEach((id, index) => {
      const y = cy - 4 - index * 20;
      const x = cx + (index % 2 === 0 ? -10 : 10);
      drawIngredient(ctx, id, x, y, 46, true);
    });
  }
  text(ctx, state.plate.length === 0 ? 'click a bin, then the plate' : `${state.plate.length} item${state.plate.length > 1 ? 's' : ''} on the plate`, plate.x + plate.width / 2, plate.y + 142, 12, '#e8d3ae', 600, 'center');
}

function drawServe(ctx, state) {
  const serveArea = LAYOUT.serve;
  ctx.fillStyle = '#2f5d3a';
  roundRect(ctx, serveArea.x, serveArea.y, serveArea.width, serveArea.height, 12);
  ctx.fill();
  text(ctx, '🛎  SERVE', serveArea.x + 18, serveArea.y + 28, 16, '#d8f5c8', 800);
  text(ctx, 'hand the finished dish to its customer', serveArea.x + 110, serveArea.y + 28, 12, '#a8d8a0', 600);
  const hit = regions(state);
  const canServe = state.plate.length > 0 && state.orders.some((order) =>
    order.recipe.needs.length === state.plate.length
    && order.recipe.needs.every((id) => state.plate.includes(id)));
  const glow = canServe && Math.floor(Date.now() / 400) % 2 === 0;
  ctx.fillStyle = canServe ? (glow ? '#7ed957' : '#5da24a') : '#4a6a50';
  roundRect(ctx, hit.serve.x, hit.serve.y, hit.serve.width, hit.serve.height, 12);
  ctx.fill();
  ctx.strokeStyle = canServe ? '#d8f5c8' : '#7a9a80';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, canServe ? 'SERVE IT!  (Space)' : 'SERVE  (Space)', hit.serve.x + hit.serve.width / 2, hit.serve.y + 36, 18, '#ffffff', 800, 'center');
  ctx.fillStyle = '#7a4a3a';
  roundRect(ctx, hit.trash.x, hit.trash.y, hit.trash.width, hit.trash.height, 12);
  ctx.fill();
  text(ctx, '🗑 TRASH (T)', hit.trash.x + hit.trash.width / 2, hit.trash.y + 36, 15, '#ffe9d6', 800, 'center');
  const next = state.orders[0];
  text(ctx, next ? `Next up: ${next.recipe.name} — ${next.recipe.blurb}` : 'No orders waiting. Breathe.', serveArea.x + 18, serveArea.y + 142, 13, '#d8f5c8', 600);
}

function drawFooter(ctx, state, pointer) {
  const footer = LAYOUT.footer;
  ctx.fillStyle = 'rgba(58,42,26,0.92)';
  ctx.fillRect(footer.x, footer.y, footer.width, footer.height);
  text(ctx, 'HOW TO PLAY', 24, footer.y + 30, 14, PALETTE.gold, 800);
  text(ctx, '1 · Click a bin (or press 1–6) to pick up an ingredient. Patties & eggs must grill first.', 24, footer.y + 56, 14, '#f2e6d0', 600);
  text(ctx, '2 · Click the grill to cook, click again when ready, then click the plate to stack it.', 24, footer.y + 80, 14, '#f2e6d0', 600);
  text(ctx, '3 · Match an order exactly, then SERVE (Space). Tips shrink as patience runs out — don\'t keep them waiting!', 24, footer.y + 104, 14, '#f2e6d0', 600);
  text(ctx, 'P pause · M mute · T trash plate · R restart', 24, footer.y + 132, 13, '#c9b18c', 600);
  // In-hand display.
  const handX = 980;
  text(ctx, 'IN HAND', handX, footer.y + 30, 14, PALETTE.gold, 800);
  if (state.hand) {
    drawIngredient(ctx, state.hand, handX + 40, footer.y + 78, 56, state.handCooked);
    text(ctx, INGREDIENTS[state.hand].name, handX + 84, footer.y + 70, 16, '#ffffff', 800);
    text(ctx, state.handCooked ? 'ready to plate' : 'needs the grill', handX + 84, footer.y + 94, 13, '#c9b18c', 600);
  } else {
    text(ctx, 'nothing — grab an ingredient', handX + 4, footer.y + 78, 14, '#8a7a63', 600);
  }
  if (state.message && state.messageTime > 0) {
    ctx.fillStyle = 'rgba(247,201,72,0.95)';
    roundRect(ctx, 400, footer.y + 8, 560, 34, 17);
    ctx.fill();
    text(ctx, state.message, 680, footer.y + 31, 15, PALETTE.ink, 800, 'center');
  }
  // The held ingredient follows the pointer while playing.
  if (state.hand && pointer && pointer.x >= 0 && screen === SCREEN_PLAY) {
    drawIngredient(ctx, state.hand, pointer.x, pointer.y - 24, 40, state.handCooked);
  }
}

let screen = SCREEN_PLAY;

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(20,14,8,${alpha})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function drawTitle(ctx, state, best) {
  overlay(ctx, 0.55);
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, 240, 80, 800, 500, 20);
  ctx.fill();
  ctx.strokeStyle = PALETTE.copper;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'THE COPPER LADLE', 640, 150, 44, PALETTE.ink, 800, 'center');
  text(ctx, 'a tiny kitchen, a big lunch rush', 640, 185, 18, PALETTE.inkSoft, 600, 'center');
  // A little drawn kitchen scene: the four dishes on a counter.
  const dishNames = { classic: 'Classic Stack', melt: 'Golden Melt', garden: 'Garden Fresh', sunrise: 'Sunrise Special' };
  const dishNeeds = {
    classic: ['bun', 'patty', 'lettuce'],
    melt: ['bun', 'patty', 'cheese', 'tomato'],
    garden: ['bun', 'lettuce', 'tomato', 'cheese'],
    sunrise: ['bun', 'egg', 'cheese'],
  };
  ['classic', 'melt', 'garden', 'sunrise'].forEach((dish, i) => {
    const x = 340 + i * 200;
    ctx.fillStyle = '#fdfdf8';
    ctx.beginPath();
    ctx.ellipse(x, 285, 62, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9d4c5';
    ctx.lineWidth = 2;
    ctx.stroke();
    dishNeeds[dish].forEach((id, j) => drawIngredient(ctx, id, x, 281 - j * 11, 40, true));
    text(ctx, dishNames[dish], x, 330, 14, PALETTE.ink, 800, 'center');
  });
  text(ctx, 'Take orders, grill patties, stack plates, serve before patience runs out.', 640, 385, 16, PALETTE.ink, 600, 'center');
  text(ctx, 'Three strikes and the kitchen closes early. Survive the 2-minute day!', 640, 413, 16, PALETTE.ink, 600, 'center');
  if (best > 0) text(ctx, `Best score: ${best}`, 640, 447, 16, '#8a6d1f', 800, 'center');
  const hit = regions(state).start;
  ctx.fillStyle = PALETTE.leaf;
  roundRect(ctx, hit.x, hit.y, hit.width, hit.height, 14);
  ctx.fill();
  text(ctx, 'START COOKING  ▶', 640, hit.y + 41, 22, '#ffffff', 800, 'center');
  text(ctx, 'click or press Space · 1–6 pick ingredients · Space serves · P pauses', 640, 560, 13, PALETTE.inkSoft, 600, 'center');
}

function drawPaused(ctx) {
  overlay(ctx, 0.6);
  text(ctx, 'PAUSED', 640, 330, 56, '#ffffff', 800, 'center');
  text(ctx, 'press P or click to keep cooking', 640, 380, 18, '#f2e6d0', 600, 'center');
}

function drawOver(ctx, state, best) {
  overlay(ctx, 0.62);
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, 340, 150, 600, 390, 20);
  ctx.fill();
  ctx.strokeStyle = PALETTE.copper;
  ctx.lineWidth = 4;
  ctx.stroke();
  const won = state.won;
  text(ctx, won ? 'DAY COMPLETE!' : 'THE KITCHEN CLOSED EARLY', 640, 220, 32, PALETTE.ink, 800, 'center');
  text(ctx, won ? 'You survived the lunch rush!' : 'Too many customers walked out hungry.', 640, 258, 16, PALETTE.inkSoft, 600, 'center');
  const rows = [
    ['Dishes served', String(state.served)],
    ['Best combo', `×${state.bestCombo}`],
    ['Coins earned', `🪙 ${state.coins}`],
    ['Score', String(state.score)],
    ['Best score', String(Math.max(best, state.score))],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 420, 310 + i * 34, 17, PALETTE.ink, 600);
    text(ctx, value, 860, 310 + i * 34, 17, PALETTE.ink, 800, 'right');
  });
  const hit = regions(state).restart;
  ctx.fillStyle = PALETTE.leaf;
  roundRect(ctx, hit.x, hit.y, hit.width, hit.height, 14);
  ctx.fill();
  text(ctx, 'COOK AGAIN  ↻', 640, hit.y + 41, 22, '#ffffff', 800, 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;

  function draw(state, currentScreen, best, pointer) {
    screen = currentScreen;
    ctx.save();
    if (state.shake > 0) {
      const magnitude = state.shake * 14;
      ctx.translate((Math.random() - 0.5) * magnitude, (Math.random() - 0.5) * magnitude);
    }
    drawKitchen(ctx, state);
    drawHeader(ctx, state);
    drawBoard(ctx, state);
    drawBins(ctx, state, pointer);
    drawGrill(ctx, state);
    drawPlate(ctx, state);
    drawServe(ctx, state);
    drawFooter(ctx, state, pointer);
    if (state.rush && currentScreen === SCREEN_PLAY) {
      ctx.fillStyle = PALETTE.danger;
      roundRect(ctx, 440, 200, 400, 26, 13);
      ctx.fill();
      text(ctx, '⚡ RUSH HOUR — orders are coming fast!', 640, 219, 16, '#ffffff', 800, 'center');
    }
    if (currentScreen === SCREEN_TITLE) drawTitle(ctx, state, best);
    else if (currentScreen === SCREEN_PAUSED) drawPaused(ctx);
    else if (currentScreen === SCREEN_OVER) drawOver(ctx, state, best);
    ctx.restore();
  }

  return { draw };
}
