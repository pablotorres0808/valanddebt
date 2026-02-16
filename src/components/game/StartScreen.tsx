import { Trophy } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

const StartScreen = ({ highScore, onStart }: StartScreenProps) => {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-6xl md:text-8xl text-foreground neon-text tracking-wider">
          VAL<span className="text-turbo-lime neon-green">&</span>DEBT
        </h1>
        <p className="font-tech text-sm md:text-base text-secondary mt-2 tracking-widest uppercase">
          {t('tagline')}
        </p>
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <div className="mb-8 arcade-border bg-foreground/90 px-6 py-3 flex items-center gap-3">
          <Trophy className="text-turbo-lime" size={24} />
          <span className="font-display text-2xl text-turbo-lime">
            {highScore.toLocaleString()}
          </span>
          <span className="font-tech text-xs text-cyber-grid uppercase">
            {t('highScore')}
          </span>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        className="arcade-btn text-xl md:text-2xl animate-pulse-glow"
      >
        {t('startGame')}
      </button>

      {/* Controls info */}
      <div className="mt-8 font-tech text-xs text-muted-foreground text-center space-y-1">
        <p>{t('controlsMove')}</p>
        <p>{t('controlsGoals')}</p>
      </div>
    </div>
  );
};

export default StartScreen;
