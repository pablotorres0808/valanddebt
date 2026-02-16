import { useRef, useEffect, useCallback, useState } from 'react';
import {
  GameState,
  createInitialState,
  update,
  render,
  resetSpawnTimer,
} from '@/lib/gameEngine';
import StartScreen from './StartScreen';
import GameHUD from './GameHUD';
import GameOverScreen from './GameOverScreen';

/**
 * GameCanvas — Main game component
 * Manages the HTML5 Canvas, game loop, and input handling.
 * Maintains a 16:9 aspect ratio container.
 */
const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // React state for UI overlays (synced from game state)
  const [uiState, setUiState] = useState<{
    status: GameState['gameStatus'];
    score: number;
    lives: number;
    difficulty: number;
    highScore: number;
  }>({
    status: 'menu',
    score: 0,
    lives: 3,
    difficulty: 1,
    highScore: gameStateRef.current.highScore,
  });

  // === CANVAS SIZING (16:9 responsive) ===
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Fit 16:9 within container
    const targetRatio = 16 / 9;
    let w = containerWidth;
    let h = containerWidth / targetRatio;

    if (h > containerHeight) {
      h = containerHeight;
      w = containerHeight * targetRatio;
    }

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  // === INPUT HANDLING ===
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    gameStateRef.current.playerX = Math.max(0.05, Math.min(0.95, x));
  }, []);

  // === GAME LOOP ===
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Update state
    gameStateRef.current = update(gameStateRef.current, w, h);

    // Render
    render(ctx, gameStateRef.current, w, h);

    // Sync UI state (throttled — only when changed)
    const gs = gameStateRef.current;
    setUiState(prev => {
      if (
        prev.status !== gs.gameStatus ||
        prev.score !== gs.score ||
        prev.lives !== gs.lives ||
        prev.difficulty !== gs.difficulty
      ) {
        return {
          status: gs.gameStatus,
          score: gs.score,
          lives: gs.lives,
          difficulty: gs.difficulty,
          highScore: gs.highScore,
        };
      }
      return prev;
    });

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // === START / RESTART ===
  const startGame = useCallback(() => {
    const hs = gameStateRef.current.highScore;
    gameStateRef.current = createInitialState();
    gameStateRef.current.highScore = hs;
    gameStateRef.current.gameStatus = 'playing';
    resetSpawnTimer();
  }, []);

  const retryGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // === LIFECYCLE ===
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resizeCanvas, gameLoop]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center bg-foreground overflow-hidden"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          className={`block cursor-none ${
            uiState.status === 'playing' && gameStateRef.current.screenShake > 0
              ? 'animate-screen-shake'
              : ''
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* UI Overlays */}
        {uiState.status === 'menu' && (
          <StartScreen highScore={uiState.highScore} onStart={startGame} />
        )}

        {uiState.status === 'playing' && (
          <GameHUD
            score={uiState.score}
            lives={uiState.lives}
            difficulty={uiState.difficulty}
          />
        )}

        {uiState.status === 'gameover' && (
          <GameOverScreen
            score={uiState.score}
            highScore={uiState.highScore}
            onRetry={retryGame}
          />
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
