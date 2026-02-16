/**
 * Val&debt Game Engine
 * Core game loop, physics, collision detection, spawning, and rendering.
 */

// === TYPES ===
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'asset' | 'liability';
  speed: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  score: number;
  lives: number;
  playerX: number;
  playerY: number;
  objects: GameObject[];
  particles: Particle[];
  gameStatus: 'menu' | 'playing' | 'gameover';
  difficulty: number;
  highScore: number;
  screenShake: number;
  flashAlpha: number;
  gridOffset: number;
}

// === CONSTANTS ===
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 64;
const OBJECT_SIZE = 48;
const BASE_FALL_SPEED = 2;
const BASE_SPAWN_INTERVAL = 60; // frames
const DIFFICULTY_SCORE_STEP = 500;
const INITIAL_LIVES = 3;

// === COLORS (matching design system) ===
const COLORS = {
  cyberSky: '#D0F0FD',
  cyberGrid: '#00C2FF',
  deepByte: '#0A0047',
  turboLime: '#39FF14',
  glitchPink: '#FF00FF',
  white: '#FFFFFF',
};

// === STATE FACTORY ===
export function createInitialState(): GameState {
  const highScore = parseInt(localStorage.getItem('valdebt_highscore') || '0', 10);
  return {
    score: 0,
    lives: INITIAL_LIVES,
    playerX: 0.5,
    playerY: 0.85,
    objects: [],
    particles: [],
    gameStatus: 'menu',
    difficulty: 1,
    highScore,
    screenShake: 0,
    flashAlpha: 0,
    gridOffset: 0,
  };
}

// === SPAWNING ===
let spawnTimer = 0;

export function spawnObject(state: GameState, canvasWidth: number): GameObject | null {
  const interval = Math.max(20, BASE_SPAWN_INTERVAL - state.difficulty * 5);
  spawnTimer++;

  if (spawnTimer < interval) return null;
  spawnTimer = 0;

  const isAsset = Math.random() > 0.35; // 65% assets, 35% liabilities
  const margin = OBJECT_SIZE;
  const x = margin + Math.random() * (canvasWidth - margin * 2);

  return {
    x,
    y: -OBJECT_SIZE,
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    type: isAsset ? 'asset' : 'liability',
    speed: BASE_FALL_SPEED + state.difficulty * 0.5 + Math.random() * 0.5,
    rotation: 0,
  };
}

// === PARTICLES ===
export function createValueBurst(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: COLORS.turboLime,
      size: 3 + Math.random() * 4,
    });
  }
  return particles;
}

export function createDebtBurst(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const speed = 1.5 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 15,
      maxLife: 35,
      color: COLORS.glitchPink,
      size: 4 + Math.random() * 3,
    });
  }
  return particles;
}

// === COLLISION DETECTION (AABB) ===
export function checkCollision(
  px: number, py: number, pw: number, ph: number,
  ox: number, oy: number, ow: number, oh: number,
): boolean {
  return (
    px < ox + ow &&
    px + pw > ox &&
    py < oy + oh &&
    py + ph > oy
  );
}

// === DRAWING ===

/** Draw scrolling perspective grid background */
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  ctx.fillStyle = COLORS.cyberSky;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = COLORS.cyberGrid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;

  // Vertical perspective lines
  const cx = w / 2;
  const horizon = h * 0.3;
  const numLines = 20;
  for (let i = -numLines; i <= numLines; i++) {
    const x = cx + i * (w / numLines);
    ctx.beginPath();
    ctx.moveTo(cx + i * 20, horizon);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Horizontal grid lines with perspective
  const numHorizontal = 20;
  for (let i = 0; i <= numHorizontal; i++) {
    const t = (i + (offset % 1)) / numHorizontal;
    const y = horizon + t * t * (h - horizon);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

/** Draw the player "Portfolio Jetpack" */
function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Jetpack body
  ctx.fillStyle = COLORS.deepByte;
  ctx.strokeStyle = COLORS.cyberGrid;
  ctx.lineWidth = 3;

  // Main body
  const bx = x - PLAYER_WIDTH / 2;
  const by = y - PLAYER_HEIGHT / 2;
  ctx.fillRect(bx + 8, by, PLAYER_WIDTH - 16, PLAYER_HEIGHT - 10);
  ctx.strokeRect(bx + 8, by, PLAYER_WIDTH - 16, PLAYER_HEIGHT - 10);

  // Wings
  ctx.fillStyle = COLORS.cyberGrid;
  ctx.fillRect(bx, by + 10, 12, 30);
  ctx.fillRect(bx + PLAYER_WIDTH - 12, by + 10, 12, 30);

  // Cockpit
  ctx.fillStyle = COLORS.turboLime;
  ctx.fillRect(bx + 20, by + 8, PLAYER_WIDTH - 40, 16);

  // Thruster flames
  ctx.fillStyle = COLORS.turboLime;
  const flicker = Math.random() * 8;
  ctx.fillRect(bx + 16, by + PLAYER_HEIGHT - 10, 8, 10 + flicker);
  ctx.fillRect(bx + PLAYER_WIDTH - 24, by + PLAYER_HEIGHT - 10, 8, 10 + flicker);

  ctx.fillStyle = COLORS.glitchPink;
  ctx.fillRect(bx + 18, by + PLAYER_HEIGHT - 6, 4, 6 + flicker * 0.6);
  ctx.fillRect(bx + PLAYER_WIDTH - 22, by + PLAYER_HEIGHT - 6, 4, 6 + flicker * 0.6);
}

/** Draw a falling object */
function drawFallingObject(ctx: CanvasRenderingContext2D, obj: GameObject) {
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(obj.rotation);

  if (obj.type === 'asset') {
    // House shape
    ctx.fillStyle = COLORS.turboLime;
    ctx.strokeStyle = COLORS.deepByte;
    ctx.lineWidth = 3;

    // Body
    ctx.fillRect(-obj.width / 2 + 4, -4, obj.width - 8, obj.height / 2 + 4);
    ctx.strokeRect(-obj.width / 2 + 4, -4, obj.width - 8, obj.height / 2 + 4);

    // Roof (triangle)
    ctx.beginPath();
    ctx.moveTo(-obj.width / 2, -4);
    ctx.lineTo(0, -obj.height / 2);
    ctx.lineTo(obj.width / 2, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Door
    ctx.fillStyle = COLORS.deepByte;
    ctx.fillRect(-5, 6, 10, 18);

    // $ symbol
    ctx.fillStyle = COLORS.deepByte;
    ctx.font = 'bold 14px "Bungee", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, -16);
  } else {
    // Liability — spiky danger shape
    ctx.fillStyle = COLORS.glitchPink;
    ctx.strokeStyle = COLORS.deepByte;
    ctx.lineWidth = 3;

    // Draw spiky circle
    const spikes = 8;
    const outerR = obj.width / 2;
    const innerR = obj.width / 3.5;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Skull-like face
    ctx.fillStyle = COLORS.deepByte;
    ctx.font = 'bold 18px "Bungee", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0);
  }

  ctx.restore();
}

/** Draw particles */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// === MAIN RENDER ===
export function render(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number) {
  ctx.save();

  // Screen shake
  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    ctx.translate(shakeX, shakeY);
  }

  // Background grid
  drawGrid(ctx, w, h, state.gridOffset);

  // Falling objects
  for (const obj of state.objects) {
    drawFallingObject(ctx, obj);
  }

  // Player
  const px = state.playerX * w;
  const py = state.playerY * h;
  drawPlayer(ctx, px, py);

  // Particles
  drawParticles(ctx, state.particles);

  // Flash overlay
  if (state.flashAlpha > 0) {
    ctx.globalAlpha = state.flashAlpha;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// === UPDATE ===
export function update(state: GameState, canvasWidth: number, canvasHeight: number): GameState {
  if (state.gameStatus !== 'playing') return state;

  const newState = { ...state };

  // Update grid scroll
  newState.gridOffset = (state.gridOffset + 0.02 * state.difficulty) % 20;

  // Calculate difficulty
  newState.difficulty = 1 + Math.floor(state.score / DIFFICULTY_SCORE_STEP);

  // Spawn objects
  const newObj = spawnObject(newState, canvasWidth);
  if (newObj) {
    newState.objects = [...state.objects, newObj];
  } else {
    newState.objects = [...state.objects];
  }

  // Player bounds (pixel coords for collision)
  const px = state.playerX * canvasWidth - PLAYER_WIDTH / 2;
  const py = state.playerY * canvasHeight - PLAYER_HEIGHT / 2;

  // Update objects
  const survivingObjects: GameObject[] = [];
  let scoreChange = 0;
  let livesChange = 0;
  const newParticles: Particle[] = [...state.particles];
  let flash = state.flashAlpha;
  let shake = state.screenShake;

  for (const obj of newState.objects) {
    const updatedObj = {
      ...obj,
      y: obj.y + obj.speed,
      rotation: obj.rotation + (obj.type === 'liability' ? 0.05 : 0.02),
    };

    // Check collision with player
    if (checkCollision(
      px, py, PLAYER_WIDTH, PLAYER_HEIGHT,
      updatedObj.x, updatedObj.y, updatedObj.width, updatedObj.height,
    )) {
      if (updatedObj.type === 'asset') {
        scoreChange += 100;
        flash = 0.4; // White flash
        newParticles.push(...createValueBurst(
          updatedObj.x + updatedObj.width / 2,
          updatedObj.y + updatedObj.height / 2,
        ));
      } else {
        livesChange -= 1;
        shake = 10; // Screen shake intensity
        newParticles.push(...createDebtBurst(
          updatedObj.x + updatedObj.width / 2,
          updatedObj.y + updatedObj.height / 2,
        ));
      }
      continue; // Remove object
    }

    // Remove off-screen objects
    if (updatedObj.y > canvasHeight + OBJECT_SIZE) {
      continue;
    }

    survivingObjects.push(updatedObj);
  }

  newState.objects = survivingObjects;
  newState.score = state.score + scoreChange;
  newState.lives = Math.max(0, state.lives + livesChange);
  newState.flashAlpha = Math.max(0, flash - 0.02);
  newState.screenShake = Math.max(0, shake - 0.5);

  // Update particles
  newState.particles = newParticles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.1, // gravity
      life: p.life - 1,
    }))
    .filter(p => p.life > 0);

  // Check game over
  if (newState.lives <= 0) {
    newState.gameStatus = 'gameover';
    if (newState.score > newState.highScore) {
      newState.highScore = newState.score;
      localStorage.setItem('valdebt_highscore', String(newState.score));
    }
  }

  return newState;
}

// === RESET SPAWN TIMER ===
export function resetSpawnTimer() {
  spawnTimer = 0;
}
