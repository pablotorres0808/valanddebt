import { Heart } from 'lucide-react';

interface GameHUDProps {
  score: number;
  lives: number;
  maxLives: number;
  difficulty: number;
  isBullMarket: boolean;
  combo: number;
}

const GameHUD = ({ score, lives, maxLives, difficulty, isBullMarket, combo }: GameHUDProps) => {
  const healthPercent = (lives / maxLives) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 pointer-events-none">
      {/* Portfolio Health */}
      <div className="arcade-border bg-foreground/80 px-4 py-2 space-y-1">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxLives }).map((_, i) => (
            <Heart
              key={i}
              size={24}
              className={i < lives ? 'text-glitch-pink' : 'text-muted-foreground/30'}
              fill={i < lives ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        {/* Health Bar */}
        <div className="w-28 h-2 bg-foreground border border-muted-foreground/30">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: `${healthPercent}%`,
              backgroundColor: healthPercent > 50 ? '#39FF14' : healthPercent > 25 ? '#FFD700' : '#FF00FF',
            }}
          />
        </div>
        <div className="font-tech text-[9px] text-muted-foreground uppercase tracking-wider">
          Portfolio Health
        </div>
      </div>

      {/* Score & Combo */}
      <div className="arcade-border bg-foreground/80 px-6 py-2 text-right space-y-1">
        <div className="font-display text-3xl md:text-4xl text-turbo-lime neon-green">
          ${score.toLocaleString()}
        </div>
        <div className="font-tech text-[10px] text-cyber-grid uppercase tracking-wider">
          LVL {difficulty}
        </div>
        {combo >= 2 && (
          <div className="font-display text-sm text-accent neon-green">
            COMBO x{combo}
          </div>
        )}
        {isBullMarket && (
          <div className="font-display text-sm text-destructive neon-pink animate-pulse">
            🐂 BULL MARKET x2
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHUD;
