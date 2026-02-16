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
import { playSound, stopSound } from '@/lib/audio';

const GameCanvas = () => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard state tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

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

  // === CANVAS SIZING (Full Screen filling) ===
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Fill the entire viewport
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  // === KEYBOARD INPUT ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const processMovement = useCallback(() => {
    const keys = keysPressed.current;
    const speed = 0.008; // Decreased for better control
    let move = 0;

    if (keys['a'] || keys['arrowleft']) move -= 1;
    if (keys['d'] || keys['arrowright']) move += 1;

    if (move !== 0) {
      gameStateRef.current.playerX = Math.max(0.05, Math.min(0.95, gameStateRef.current.playerX + move * speed));
    }
  }, []);

  // === AUDIO LIFECYCLE ===
  useEffect(() => {
    if (uiState.status === 'playing') {
      playSound('engine');
    } else {
      stopSound('engine');
    }
  }, [uiState.status]);

  // === GAME LOOP ===
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    processMovement();
    gameStateRef.current = update(gameStateRef.current, canvas.width, canvas.height);
    if (gameStateRef.current.gameStatus === 'playing') {
      playSound('engine');
    }
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
  }, [t, processMovement]);

  // === START / RESTART ===
  const startGame = useCallback(() => {
    // Unlock and start engine hum on first interaction
    playSound('engine');
    const hs = gameStateRef.current.highScore;
    gameStateRef.current = createInitialState();
    gameStateRef.current.highScore = hs;
    gameStateRef.current.gameStatus = 'playing';
    resetSpawnTimer();
  }, []);

  const retryGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // === LIFECYCLE (Canvas & Game Loop) ===
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameRef.current);
      stopSound('engine'); // Cleanup
    };
  }, [resizeCanvas, gameLoop]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-foreground overflow-hidden"
    >
      <SettingsButton />
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="block"
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
