import { useRef, useEffect, useCallback, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
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
import SettingsButton from './SettingsButton';

const GameCanvas = () => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [uiState, setUiState] = useState<{
    status: GameState['gameStatus'];
    score: number;
    lives: number;
    maxLives: number;
    difficulty: number;
    highScore: number;
    isBullMarket: boolean;
    combo: number;
  }>({
    status: 'menu',
    score: 0,
    lives: 3,
    maxLives: 3,
    difficulty: 1,
    highScore: gameStateRef.current.highScore,
    isBullMarket: false,
    combo: 0,
  });

  // === CANVAS SIZING (16:9, fills viewport) ===
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const ratio = 16 / 9;
    let w = cw;
    let h = cw / ratio;

    if (h > ch) {
      h = ch;
      w = ch * ratio;
    }

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  // === INPUT ===
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

    gameStateRef.current = update(gameStateRef.current, canvas.width, canvas.height);
    render(ctx, gameStateRef.current, canvas.width, canvas.height, t);

    const gs = gameStateRef.current;
    setUiState(prev => {
      if (
        prev.status !== gs.gameStatus ||
        prev.score !== gs.score ||
        prev.lives !== gs.lives ||
        prev.difficulty !== gs.difficulty ||
        prev.isBullMarket !== gs.isBullMarket ||
        prev.combo !== gs.combo
      ) {
        return {
          status: gs.gameStatus,
          score: gs.score,
          lives: gs.lives,
          maxLives: gs.maxLives,
          difficulty: gs.difficulty,
          highScore: gs.highScore,
          isBullMarket: gs.isBullMarket,
          combo: gs.combo,
        };
      }
      return prev;
    });

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [t]);

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
      className="fixed inset-0 flex items-center justify-center bg-foreground overflow-hidden"
    >
      <SettingsButton />
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          className="block cursor-none"
          style={{ touchAction: 'none' }}
        />

        {uiState.status === 'menu' && (
          <StartScreen highScore={uiState.highScore} onStart={startGame} />
        )}

        {uiState.status === 'playing' && (
          <GameHUD
            score={uiState.score}
            lives={uiState.lives}
            maxLives={uiState.maxLives}
            difficulty={uiState.difficulty}
            isBullMarket={uiState.isBullMarket}
            combo={uiState.combo}
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
