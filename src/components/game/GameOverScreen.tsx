import { TrendingDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRetry: () => void;
}

const GameOverScreen = ({ score, highScore, onRetry }: GameOverScreenProps) => {
  const { t } = useLanguage();
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-foreground/70">
      {/* Market Crash Title */}
      <div className="mb-2">
        <TrendingDown className="text-turbo-lime mx-auto mb-4" size={64} />
        <h2 className="font-display text-5xl md:text-7xl text-turbo-lime neon-text text-center">
          {t('marketCrash')}
        </h2>
      </div>

      {/* Score Card */}
      <div className="arcade-border bg-foreground/90 px-8 py-6 my-8 text-center">
        {isNewHighScore && (
          <div className="font-display text-lg text-turbo-lime neon-green mb-2">
            {t('newHighScore')}
          </div>
        )}
        <div className="font-tech text-xs text-cyber-grid uppercase tracking-widest mb-1">
          {t('finalPortfolio')}
        </div>
        <div className="font-display text-5xl text-primary-foreground">
          ${score.toLocaleString()}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onRetry} className="arcade-btn flex items-center gap-3">
          <RotateCcw size={24} />
          {t('retry')}
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
