/**
 * Val&debt Game Engine v2
 * Strategic Portfolio Simulation with entity variety, combos, and floating text.
 *
 * - **Visual & Audio Polish**:
 *   - **Premium Portfolio Skin**: Replaced the player with a high-detail, blue "open-lid" briefcase based on your reference image, featuring a skyscraper emblem and realistic shading.
 *   - **Professional UI Icons**: Upgraded the start screen by replacing emojis with high-quality Lucide icons (Mouse, Smartphone, Home, Zap) and premium Mono Space typography.
 *   - **Tech Ambience**: Refined the background hum into a high-tech "data stream" texture to match the portfolio theme.
 */
import { playSound } from './audio';

// === ENTITY DEFINITIONS ===
export type EntityKind =
  | 'studio_apt'
  | 'family_home'
  | 'commercial_plaza'
  | 'stocks'
  | 'maintenance'
  | 'interest_hike'
  | 'market_crash';

export interface EntityDef {
  kind: EntityKind;
  type: 'asset' | 'liability';
  label: string;
  points: number;
  speed: number;       // base px/frame
  size: number;        // px
  spawnWeight: number;  // relative spawn chance
  color: string;
  flash: boolean;      // flashing effect
}

const ENTITY_DEFS: EntityDef[] = [
  // GOOD ASSETS - Professional Palette
  { kind: 'education', type: 'asset', label: 'educationLabel', points: 150, speed: 2.8, size: 40, spawnWeight: 35, color: '#3498db', flash: false },
  { kind: 'family_home', type: 'asset', label: 'familyHome', points: 600, speed: 2.2, size: 52, spawnWeight: 20, color: '#e67e22', flash: false },
  { kind: 'commercial_plaza', type: 'asset', label: 'commPlaza', points: 2000, speed: 1.6, size: 68, spawnWeight: 5, color: '#2ecc71', flash: false },
  { kind: 'stocks', type: 'asset', label: 'stocksLabel', points: 1000, speed: 2.5, size: 44, spawnWeight: 15, color: '#f1c40f', flash: false },
  // BAD LIABILITIES - High Contrast Danger
  { kind: 'maintenance', type: 'liability', label: 'maintenance', points: -250, speed: 2.4, size: 42, spawnWeight: 30, color: '#e74c3c', flash: false },
  { kind: 'interest_hike', type: 'liability', label: 'interestHike', points: -750, speed: 3.4, size: 44, spawnWeight: 15, color: '#c0392b', flash: false },
  { kind: 'market_crash', type: 'liability', label: 'marketCrashLabel', points: -5000, speed: 1.8, size: 75, spawnWeight: 3, color: '#8e44ad', flash: true },
];

// === TYPES ===
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'asset' | 'liability';
  kind: EntityKind;
  label: string;
  points: number;
  speed: number;
  rotation: number;
  flash: boolean;
  color: string;
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

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface GameState {
  score: number;
  lives: number;
  maxLives: number;
  playerX: number;
  playerY: number;
  objects: GameObject[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  gameStatus: 'menu' | 'playing' | 'gameover';
  difficulty: number;
  highScore: number;
  screenShake: number;
  flashAlpha: number;
  gridOffset: number;
  // Combo system
  combo: number;
  comboTimer: number;     // frames remaining for bull market
  isBullMarket: boolean;
  // Milestone tracking
  nextMilestone: number;
  speedMultiplier: number;
  totalGains: number;
  totalLosses: number;
  // Asset counters for breakdown
  educationCount: number;
  homeCount: number;
  plazaCount: number;
  stockCount: number;
  // Liability counters for breakdown
  maintenanceCount: number;
  interestCount: number;
  crashCount: number;
}

// === CONSTANTS ===
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 64;
const INITIAL_LIVES = 3;
const COMBO_THRESHOLD = 3;
const BULL_MARKET_DURATION = 300; // 5 seconds at 60fps
const MILESTONE_STEP = 5000;

// === COLORS ===
const COLORS = {
  cyberSky: '#D0F0FD',
  cyberGrid: '#00C2FF',
  deepByte: '#0A0047',
  turboLime: '#FF3333', // Cool Red
  glitchPink: '#FF00FF',
  white: '#FFFFFF',
  gold: '#FFD700',
};

// === STATE FACTORY ===
export function createInitialState(): GameState {
  const highScore = parseInt(localStorage.getItem('valdebt_highscore') || '0', 10);
  return {
    score: 0,
    lives: INITIAL_LIVES,
    maxLives: INITIAL_LIVES,
    playerX: 0.5,
    playerY: 0.85,
    objects: [],
    particles: [],
    floatingTexts: [],
    gameStatus: 'menu',
    difficulty: 1,
    highScore,
    screenShake: 0,
    flashAlpha: 0,
    gridOffset: 0,
    combo: 0,
    comboTimer: 0,
    isBullMarket: false,
    nextMilestone: MILESTONE_STEP,
    speedMultiplier: 1.0,
    totalGains: 0,
    totalLosses: 0,
    educationCount: 0,
    homeCount: 0,
    plazaCount: 0,
    stockCount: 0,
    maintenanceCount: 0,
    interestCount: 0,
    crashCount: 0,
  };
}

// === WEIGHTED RANDOM SPAWN ===
function pickEntityDef(score: number): EntityDef {
  // Increase debt density as score rises
  const debtBias = Math.min(score / 30000, 0.6); // up to 60% bias at 30k

  const defs = ENTITY_DEFS.map(d => {
    let w = d.spawnWeight;
    if (d.type === 'liability') w *= (1 + debtBias * 3);
    if (d.type === 'asset') w *= (1 - debtBias * 0.5);
    return { def: d, weight: Math.max(w, 0.5) };
  });

  const totalWeight = defs.reduce((s, d) => s + d.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { def, weight } of defs) {
    roll -= weight;
    if (roll <= 0) return def;
  }
  return defs[0].def;
}

// === SPAWNING ===
let spawnTimer = 0;
let nextSpawnInterval = 60; // Initial calm start

export function resetSpawnTimer() {
  spawnTimer = 0;
  nextSpawnInterval = 60;
}

function spawnObject(state: GameState, canvasWidth: number): GameObject | null {
  spawnTimer++;

  if (spawnTimer < nextSpawnInterval) return null;
  spawnTimer = 0;

  // Calculate next interval with randomness
  // Difficulty reduces base interval, but we add a random factor
  const baseInterval = Math.max(20, 70 - state.difficulty * 4);
  const randomness = Math.random() * 30; // 0 to 30 frames of randomness
  nextSpawnInterval = baseInterval + randomness;

  const def = pickEntityDef(state.score);
  const margin = def.size;
  const x = margin + Math.random() * (canvasWidth - margin * 2);

  return {
    x,
    y: -def.size,
    width: def.size,
    height: def.size,
    type: def.type,
    kind: def.kind,
    label: def.label,
    points: def.points,
    speed: def.speed * state.speedMultiplier,
    rotation: 0,
    flash: def.flash,
    color: def.color,
  };
}

// === PARTICLES ===
function createBurst(x: number, y: number, color: string, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: 3 + Math.random() * 4,
    });
  }
  return particles;
}

// === COLLISION DETECTION (AABB) ===
function checkCollision(
  px: number, py: number, pw: number, ph: number,
  ox: number, oy: number, ow: number, oh: number,
): boolean {
  return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
}

// === DRAWING HELPERS ===

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  ctx.fillStyle = COLORS.cyberSky;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = COLORS.cyberGrid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;

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

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const w = PLAYER_WIDTH + 10; // Slightly wider for executive feel
  const h = PLAYER_HEIGHT - 10;
  const bx = x - w / 2;
  const by = y - h / 2;

  ctx.save();

  // Executive Palette
  const leatherBlue = '#2c3e50';
  const accentNavy = '#1a252f';
  const silverEmblem = '#bdc3c7';
  const paperWhite = '#ecf0f1';
  const stitchColor = 'rgba(255, 255, 255, 0.1)';

  // 1. Bottom Chassis (The base)
  ctx.fillStyle = accentNavy;
  ctx.beginPath();
  ctx.roundRect(bx, by + h * 0.45, w, h * 0.55, 6);
  ctx.fill();

  // 2. Interior Documents (Peeking out)
  ctx.fillStyle = paperWhite;
  ctx.beginPath();
  ctx.moveTo(bx + 8, by + h * 0.5);
  ctx.lineTo(bx + w - 8, by + h * 0.5);
  ctx.lineTo(bx + w - 12, by + h * 0.7);
  ctx.lineTo(bx + 12, by + h * 0.7);
  ctx.closePath();
  ctx.fill();

  // 3. Main Lid (The front flap)
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = leatherBlue;
  ctx.beginPath();
  ctx.roundRect(bx, by + 4, w, h * 0.65, 8);
  ctx.fill();
  ctx.restore();

  // 4. Stitched Border (Executive detail)
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = stitchColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx + 4, by + 8, w - 8, h * 0.65 - 8, 4);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // 5. Silver Handle
  ctx.strokeStyle = silverEmblem;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx + w * 0.38, by + 6);
  ctx.lineTo(bx + w * 0.38, by - 4);
  ctx.lineTo(bx + w * 0.62, by - 4);
  ctx.lineTo(bx + w * 0.62, by + 6);
  ctx.stroke();

  // 6. Skyscraper Emblem (High-detail silver relief)
  const cx = bx + w / 2;
  const cy = by + h * 0.35;
  const sw = 18;
  const sh = 22;

  ctx.strokeStyle = silverEmblem;
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Modern geometric building
  ctx.moveTo(cx - sw / 2, cy + sh / 2);
  ctx.lineTo(cx - sw / 2, cy - sh / 6);
  ctx.lineTo(cx, cy - sh / 2);
  ctx.lineTo(cx + sw / 2, cy - sh / 6);
  ctx.lineTo(cx + sw / 2, cy + sh / 2);
  ctx.stroke();

  // Internal lines for "windows"
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 4, cy - sh / 4);
    ctx.lineTo(cx + i * 4, cy + sh / 2);
    ctx.stroke();
  }

  // 7. Subtle Active Glow
  const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
  ctx.shadowColor = '#ccff00';
  ctx.shadowBlur = 10 * pulse;
  ctx.strokeStyle = '#ccff00';
  ctx.globalAlpha = 0.4 * pulse;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawFallingObject(ctx: CanvasRenderingContext2D, obj: GameObject, frameCount: number, t: (key: string) => string) {
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const w = obj.width;
  const h = obj.height;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(obj.rotation);

  if (obj.flash && Math.floor(frameCount / 6) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  if (obj.type === 'asset') {
    // PREMIUM ASSET: Detailed Architecture
    ctx.fillStyle = obj.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const hw = w / 2;
    const hh = h / 2;

    // 1. Base Structure & Color Coordination
    ctx.beginPath();
    if (obj.kind === 'education') {
      // Graduation Cap (Black/Gold)
      ctx.fillStyle = '#1a1a1a';
      // Mortarboard square
      ctx.beginPath();
      ctx.moveTo(-hw, -hh + 5);
      ctx.lineTo(0, -hh);
      ctx.lineTo(hw, -hh + 5);
      ctx.lineTo(0, -hh + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tassel
      ctx.strokeStyle = '#f1c40f'; // Gold
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hw - 2, -hh + 5);
      ctx.lineTo(hw + 4, hh - 10);
      ctx.stroke();

      // Bottom flat part
      ctx.fillStyle = '#1a1a1a';
      ctx.roundRect(-hw + 8, -hh + 8, w - 16, h - 8, 2);
      ctx.fill();
      ctx.stroke();

      // Degree Scroll
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(-hw + 12, hh - 12, w - 24, 6, 1);
      ctx.fill();
      ctx.stroke();
    } else if (obj.kind === 'family_home') {
      // Warm Family Home (Orange)
      ctx.fillStyle = '#e67e22';
      ctx.moveTo(-hw, hh);
      ctx.lineTo(-hw, -2);
      ctx.lineTo(0, -hh);
      ctx.lineTo(hw, -2);
      ctx.lineTo(hw, hh);
      ctx.closePath();
    } else if (obj.kind === 'commercial_plaza') {
      // Corporate Plaza (Green)
      ctx.fillStyle = '#2ecc71';
      ctx.roundRect(-hw, -hh + 5, w, h - 5, 2);
    } else if (obj.kind === 'stocks') {
      // Stock Certificate (Paper/Gold)
      ctx.fillStyle = '#f5f5dc'; // Beige paper
      ctx.roundRect(-hw + 5, -hh + 5, w - 10, h - 10, 2);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Specific Details per Asset
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    if (obj.kind === 'studio_apt') {
      // Dual window columns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let y = -hh + 14; y < hh - 4; y += 8) {
        ctx.fillRect(-hw + 10, y, 6, 5);
        ctx.fillRect(hw - 16, y, 6, 5);
      }
    } else if (obj.kind === 'family_home') {
      // Roof detail & Windows
      ctx.fillStyle = '#a04000'; // Darker orange roof
      ctx.beginPath();
      ctx.moveTo(-hw - 2, -2);
      ctx.lineTo(0, -hh - 2);
      ctx.lineTo(hw + 2, -2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-hw + 10, 4, 8, 8);
      ctx.fillRect(hw - 18, 4, 8, 8);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-3, hh - 12, 6, 12); // Door
    } else if (obj.kind === 'commercial_plaza') {
      // Glass panes & Logo
      const windowPulse = (Math.sin(Date.now() / 400) + 1) / 2;
      ctx.fillStyle = `rgba(200, 255, 255, ${0.3 + windowPulse * 0.3})`;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
          ctx.fillRect(-hw + 8 + i * (w / 3), -hh + 12 + j * 9, w / 3 - 16, 6);
        }
      }
      ctx.fillStyle = '#27ae60';
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.fillText('V&D', -hw + 5, -hh + 15);

      // Upward Growth Ticker
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hw - 10, hh - 10);
      ctx.lineTo(hw - 5, hh - 15);
      ctx.lineTo(hw - 15, hh - 15);
      ctx.stroke();
    } else if (obj.kind === 'stocks') {
      // Certificate lines & Seal
      ctx.strokeStyle = 'rgba(44, 62, 80, 0.4)';
      ctx.beginPath();
      for (let i = -10; i <= 10; i += 5) {
        ctx.moveTo(-hw + 10, i);
        ctx.lineTo(hw - 10, i);
      }
      ctx.stroke();

      // Stock Chart line - Vibrant Green
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(-hw + 12, 12);
      ctx.lineTo(-hw + 25, 2);
      ctx.lineTo(0, 8);
      ctx.lineTo(hw - 12, -12);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wax Seal - Embossed
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(hw - 14, hh - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#922b21';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

  } else {
    // PREMIUM LIABILITY: High-Contrast Debt Symbols
    const pulse = (Math.sin(Date.now() / 200) + 1) / 2;

    ctx.fillStyle = obj.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    if (obj.kind === 'market_crash') {
      // Destructive Spiky Shape
      const spikes = 16;
      const outerR = w / 2;
      const innerR = w / 3;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI * i) / spikes;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // CRASH symbol (X lines)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-w / 4, -w / 4); ctx.lineTo(w / 4, w / 4);
      ctx.moveTo(w / 4, -w / 4); ctx.lineTo(-w / 4, w / 4);
      ctx.stroke();
    } else {
      // Interest/Maintenance: Sharp Danger Warning
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Negative bar / Warning line
      ctx.fillStyle = '#FFFFFF';
      if (obj.kind === 'interest_hike') {
        ctx.fillRect(-w / 6, -h / 4, w / 3, 4);
        ctx.fillRect(-w / 6, 2, w / 3, 4);
      } else {
        ctx.fillRect(-2, -h / 4, 4, h / 2);
      }
    }

    // Danger Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = obj.color;
    ctx.stroke();
  }

  ctx.restore();

  // Label below the object in Space Mono — High Contrast
  ctx.save();
  ctx.fillStyle = COLORS.deepByte;
  ctx.font = `bold ${Math.max(10, Math.min(12, obj.width * 0.22))}px "Space Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Text shadow for readability
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 2;

  ctx.fillText(t(obj.label), cx, obj.y + obj.height + 4);
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (const ft of texts) {
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 18px "Bungee", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}

function drawBullMarketBanner(ctx: CanvasRenderingContext2D, w: number, timer: number, text: string) {
  const alpha = Math.min(1, timer / 30); // fade in/out
  ctx.globalAlpha = alpha * (0.8 + Math.sin(Date.now() / 150) * 0.2);
  ctx.fillStyle = COLORS.turboLime;
  ctx.font = 'bold 36px "Bungee", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = COLORS.deepByte;
  ctx.lineWidth = 4;
  const bannerText = `🐂 ${text} x2 🐂`;
  ctx.strokeText(bannerText, w / 2, 80);
  ctx.fillText(bannerText, w / 2, 80);
  ctx.globalAlpha = 1;
}

// === FRAME COUNTER (for flash effects) ===
let frameCount = 0;

// === MAIN RENDER ===
export function render(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number, t: (key: string) => string) {
  frameCount++;
  ctx.save();

  if (state.screenShake > 0) {
    const sx = (Math.random() - 0.5) * state.screenShake * 2;
    const sy = (Math.random() - 0.5) * state.screenShake * 2;
    ctx.translate(sx, sy);
  }

  drawGrid(ctx, w, h, state.gridOffset);

  for (const obj of state.objects) {
    drawFallingObject(ctx, obj, frameCount, t);
  }

  const px = state.playerX * w;
  const py = state.playerY * h;
  drawPlayer(ctx, px, py);

  drawParticles(ctx, state.particles);
  drawFloatingTexts(ctx, state.floatingTexts);

  // Bull market banner
  if (state.isBullMarket) {
    drawBullMarketBanner(ctx, w, state.comboTimer, t('bullMarket'));
  }

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

  const ns = { ...state };

  // Grid scroll
  ns.gridOffset = (state.gridOffset + 0.02 * state.difficulty) % 20;

  // Difficulty from milestone
  ns.difficulty = 1 + Math.floor(state.score / 2000);

  // Check milestone for speed increase
  if (state.score >= state.nextMilestone) {
    ns.speedMultiplier = state.speedMultiplier * 1.1;
    ns.nextMilestone = state.nextMilestone + MILESTONE_STEP;
  }

  // Combo timer
  if (state.comboTimer > 0) {
    ns.comboTimer = state.comboTimer - 1;
    if (ns.comboTimer <= 0) {
      ns.isBullMarket = false;
    }
  }

  // Spawn
  const newObj = spawnObject(ns, canvasWidth);
  ns.objects = newObj ? [...state.objects, newObj] : [...state.objects];

  // Player bounds
  const px = state.playerX * canvasWidth - PLAYER_WIDTH / 2;
  const py = state.playerY * canvasHeight - PLAYER_HEIGHT / 2;

  // Update objects & collisions
  const surviving: GameObject[] = [];
  let scoreChange = 0;
  let livesChange = 0;
  let sessionGains = 0;
  let sessionLosses = 0;
  const newParticles: Particle[] = [...state.particles];
  const newFloats: FloatingText[] = [...state.floatingTexts];
  let flash = state.flashAlpha;
  let shake = state.screenShake;
  let combo = state.combo;
  let comboTimer = ns.comboTimer;
  let isBullMarket = ns.isBullMarket;
  let isInstaDeath = false;

  for (const obj of ns.objects) {
    const updated = {
      ...obj,
      y: obj.y + obj.speed,
      rotation: obj.rotation + (obj.type === 'liability' ? 0.05 : 0.015),
    };

    if (checkCollision(px, py, PLAYER_WIDTH, PLAYER_HEIGHT, updated.x, updated.y, updated.width, updated.height)) {
      const hitX = updated.x + updated.width / 2;
      const hitY = updated.y + updated.height / 2;

      if (updated.type === 'asset') {
        let pts = updated.points;
        if (isBullMarket) pts *= 2;
        scoreChange += pts;
        sessionGains += pts;
        flash = 0.3;
        combo++;

        // Increment specific asset counters
        if (updated.kind === 'education') ns.educationCount++;
        else if (updated.kind === 'family_home') ns.homeCount++;
        else if (updated.kind === 'commercial_plaza') ns.plazaCount++;
        else if (updated.kind === 'stocks') ns.stockCount++;

        newParticles.push(...createBurst(hitX, hitY, COLORS.turboLime, 12));
        newFloats.push({
          x: hitX, y: hitY,
          text: `+$${pts.toLocaleString()} USD`,
          color: '#2ecc71', // Assets = Green
          life: 60, maxLife: 60,
        });

        // Check combo threshold
        if (combo >= COMBO_THRESHOLD && !isBullMarket) {
          isBullMarket = true;
          comboTimer = BULL_MARKET_DURATION;
        }

        playSound('coin');
      } else {
        playSound('explosion');
        // Market crash = insta-death
        if (updated.kind === 'market_crash') {
          isInstaDeath = true;
          scoreChange += updated.points;
          sessionLosses += Math.abs(updated.points);
          ns.crashCount++;
        } else {
          livesChange -= 1;
          scoreChange += updated.points; // negative
          sessionLosses += Math.abs(updated.points);
          if (updated.kind === 'maintenance') ns.maintenanceCount++;
          else if (updated.kind === 'interest_hike') ns.interestCount++;
        }
        combo = 0;
        isBullMarket = false;
        comboTimer = 0;
        shake = 12;
        newParticles.push(...createBurst(hitX, hitY, COLORS.glitchPink, 10));
        newFloats.push({
          x: hitX, y: hitY,
          text: `-$${Math.abs(updated.points).toLocaleString()} USD`,
          color: '#e74c3c', // Liabilities = Red
          life: 60, maxLife: 60,
        });
      }
      continue;
    }

    if (updated.y > canvasHeight + updated.height + 20) continue;
    surviving.push(updated);
  }

  ns.objects = surviving;
  ns.score = Math.max(0, state.score + scoreChange);
  ns.totalGains = state.totalGains + sessionGains;
  ns.totalLosses = state.totalLosses + sessionLosses;
  ns.lives = isInstaDeath ? 0 : Math.max(0, state.lives + livesChange);
  ns.flashAlpha = Math.max(0, flash - 0.015);
  ns.screenShake = Math.max(0, shake - 0.5);
  ns.combo = combo;
  ns.comboTimer = comboTimer;
  ns.isBullMarket = isBullMarket;

  // Update floating texts
  ns.floatingTexts = newFloats
    .map(ft => ({ ...ft, y: ft.y - 1.5, life: ft.life - 1 }))
    .filter(ft => ft.life > 0);

  // Update particles
  ns.particles = newParticles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1, life: p.life - 1 }))
    .filter(p => p.life > 0);

  if (ns.lives <= 0 && state.gameStatus === 'playing') {
    ns.gameStatus = 'gameover';
    if (ns.score > ns.highScore) {
      ns.highScore = ns.score;
      localStorage.setItem('valdebt_highscore', String(ns.score));
    }
  }

  return ns;
}
