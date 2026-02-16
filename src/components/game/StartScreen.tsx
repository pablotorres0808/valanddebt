import { Trophy, MousePointer2, Smartphone, Home, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

const StartScreen = ({ highScore, onStart }: StartScreenProps) => {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
      {/* Logo Text */}
      <div className="mb-8 text-center relative z-10">
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
        className="arcade-btn text-xl md:text-2xl animate-pulse-glow mb-12"
      >
        {t('startGame')}
      </button>

      {/* Premium High-Contrast Controls Info */}
      <div className="arcade-border bg-black/90 p-8 space-y-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-turbo-lime/30">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-turbo-lime">
            <MousePointer2 size={32} className="drop-shadow-glow" />
            <span className="text-white/40 font-mono text-xl">|</span>
            <Smartphone size={32} className="drop-shadow-glow" />
          </div>
          <span className="font-mono text-lg md:text-xl text-white uppercase tracking-tighter text-center font-bold">
            {t('controlsMove').replace('🖱️ ', '').replace('📱 ', '')}
          </span>
        </div>

        <div className="flex flex-col gap-4 font-mono text-xs md:text-sm uppercase text-center border-t border-white/10 pt-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-turbo-lime/10 rounded-sm border border-turbo-lime/20">
                <Home size={20} className="text-turbo-lime" />
              </div>
              <span className="text-white text-base font-bold tracking-tight">
                {t('controlsGoals').split(' • ')[0].replace('Atrapa 🏠 ', '').replace('Catch 🏠 ', '')}
              </span>
            </div>

            <div className="text-white/20 px-2">•</div>

            <div className="flex items-center gap-3">
              <span className="text-white text-base font-bold tracking-tight">
                {t('controlsGoals').split(' • ')[1].replace('Esquiva ⚡ ', '').replace('Dodge ⚡ ', '')}
              </span>
              <div className="p-2 bg-glitch-pink/10 rounded-sm border border-glitch-pink/20">
                <Zap size={20} className="text-glitch-pink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
