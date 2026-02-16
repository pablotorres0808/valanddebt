import { Heart } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface GameHUDProps {
  score: number;
  lives: number;
  maxLives: number;
  difficulty: number;
  isBullMarket: boolean;
  combo: number;
}

const GameHUD = ({ score, lives, maxLives, difficulty, isBullMarket, combo }: GameHUDProps) => {
  const { t } = useLanguage();
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
              className={i < lives ? 'text-turbo-lime' : 'text-muted-foreground/30'}
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
              backgroundColor: healthPercent > 50 ? 'hsl(var(--turbo-lime))' : healthPercent > 25 ? '#FFD700' : '#FF00FF',
            }}
          />
        </div>
        <div className="font-mono text-[11px] md:text-xs text-white uppercase tracking-tighter font-bold drop-shadow-sm">
          {t('portfolioHealth')}
        </div>
      </div>

      {/* Score & Combo - Offset for Settings Button */}
      <div className="arcade-border bg-black/90 px-6 py-3 text-right space-y-1 mr-16 border-turbo-lime/20 shadow-lg">
        <div className="font-display text-4xl md:text-5xl text-turbo-lime neon-green leading-none">
          ${score.toLocaleString()}
        </div>
        <div className="font-mono text-[11px] md:text-xs text-cyber-grid uppercase tracking-widest font-bold">
          {t('level')} {difficulty}
        </div>
        {combo >= 2 && (
          <div className="font-display text-base text-accent neon-green">
            {t('combo')} x{combo}
          </div>
        )}
        {isBullMarket && (
          <div className="font-display text-base text-turbo-lime neon-green animate-pulse">
            🐂 {t('bullMarket')} x2
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHUD;
