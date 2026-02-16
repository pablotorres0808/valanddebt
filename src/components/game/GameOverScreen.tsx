import { useEffect } from 'react';
import { RotateCcw, TrendingUp, TrendingDown, AlertTriangle, Wrench, Percent, Zap, Info } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { playSound } from '@/lib/audio';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  totalGains: number;
  totalLosses: number;
  educationCount: number;
  homeCount: number;
  plazaCount: number;
  stockCount: number;
  maintenanceCount: number;
  interestCount: number;
  crashCount: number;
  onRetry: () => void;
}

// Procedural Mini-Assets for the List
const MiniAsset = ({ kind }: { kind: string }) => {
  if (kind === 'education') return (
    <div className="w-5 h-5 relative">
      <div className="absolute top-1 left-0 w-full h-2 bg-black border border-white/40 rotate-12" />
      <div className="absolute top-2 left-1 w-3 h-2 bg-black border border-white/40" />
      <div className="absolute bottom-0 left-1 w-3 h-1 bg-white" />
    </div>
  );
  if (kind === 'home') return <div className="w-5 h-5 bg-orange-500 border border-black" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />;
  if (kind === 'plaza') return <div className="w-5 h-5 bg-green-500 border border-black rounded-sm" />;
  if (kind === 'stocks') return <div className="w-5 h-5 bg-yellow-200 border border-yellow-700 rounded-px" />;
  if (kind === 'maintenance') return <Wrench size={16} className="text-red-500" />;
  if (kind === 'interest') return <Percent size={16} className="text-red-600" />;
  if (kind === 'crash') return <Zap size={16} className="text-purple-600" />;
  return null;
};

const GameOverScreen = ({
  score,
  highScore,
  totalGains,
  totalLosses,
  educationCount,
  homeCount,
  plazaCount,
  stockCount,
  maintenanceCount,
  interestCount,
  crashCount,
  onRetry
}: GameOverScreenProps) => {
  const { t } = useLanguage();
  const isNewHighScore = score >= highScore && score > 0;
  const isPositivePerformance = totalGains > totalLosses;

  // Matching values from gameEngine.ts
  const ASSET_VALUES = { ed: 150, home: 600, plaza: 2000, stock: 1000 };
  const LIA_VALUES = { main: 250, int: 750, crash: 5000 };

  useEffect(() => {
    playSound('crash');
  }, []);

  // 3D Box Container Utility
  const Box3D = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative ${className}`}>
      {/* Bottom layer (Depth) */}
      <div className="absolute inset-0 bg-white/5 translate-x-1.5 translate-y-1.5 border border-white/10" />
      {/* Top layer (Surface) */}
      <div className="relative bg-black border border-white/20 p-5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto custom-scrollbar flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 py-16 flex flex-col items-center">

        {/* 3D Impact Title */}
        <div className="relative mb-16 flex flex-col items-center">
          <TrendingDown className="text-red-600 mb-8" size={64} />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-8xl text-red-950 absolute top-1.5 left-1.5 md:top-3 md:left-3 tracking-tighter uppercase whitespace-nowrap select-none">
              {t('marketCrash')}
            </h2>
            <h2 className="font-display text-5xl md:text-8xl text-red-600 relative tracking-tighter uppercase whitespace-nowrap">
              {t('marketCrash')}
            </h2>
          </div>
        </div>

        {/* Narrative / Context */}
        <div className="max-w-3xl text-center mb-16 px-4">
          <p className="font-mono text-sm md:text-lg text-white/60 leading-relaxed uppercase tracking-[0.15em] italic">
            "{t('marketCollapseNarrative')}"
          </p>
        </div>

        {/* The Grid: Breakdown & Education */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 w-full mb-16">

          {/* Column 1: Financial Performance Breakdown */}
          <div className="space-y-8">
            <Box3D>
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <TrendingUp className="text-turbo-lime" size={24} />
                <h3 className="font-mono text-base text-white uppercase font-black tracking-[0.3em]">
                  {t('assetBreakdown')}
                </h3>
              </div>

              {/* Assets List */}
              <div className="space-y-4 font-mono mb-10">
                {[
                  { kind: 'education', label: t('educationLabel'), count: educationCount, val: educationCount * ASSET_VALUES.ed, color: 'text-blue-400' },
                  { kind: 'home', label: t('familyHome'), count: homeCount, val: homeCount * ASSET_VALUES.home, color: 'text-orange-400' },
                  { kind: 'plaza', label: t('commPlaza'), count: plazaCount, val: plazaCount * ASSET_VALUES.plaza, color: 'text-green-400' },
                  { kind: 'stocks', label: t('stocksLabel'), count: stockCount, val: stockCount * ASSET_VALUES.stock, color: 'text-yellow-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs md:text-sm border-b border-white/5 pb-3">
                    <div className="flex items-center gap-4">
                      <MiniAsset kind={item.kind} />
                      <span className="text-white/80 font-bold">{item.label} <span className="text-white/40 ml-1">x{item.count}</span></span>
                    </div>
                    <span className={`font-black ${item.color}`}>+${item.val.toLocaleString()} USD</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 mt-12">
                <AlertTriangle className="text-glitch-pink" size={24} />
                <h3 className="font-mono text-base text-white uppercase font-black tracking-[0.3em]">
                  {t('liabilityBreakdown')}
                </h3>
              </div>

              {/* Liabilities List */}
              <div className="space-y-4 font-mono mb-6">
                {[
                  { kind: 'maintenance', label: t('maintenance'), count: maintenanceCount, val: maintenanceCount * LIA_VALUES.main },
                  { kind: 'interest', label: t('interestHike'), count: interestCount, val: interestCount * LIA_VALUES.int },
                  { kind: 'crash', label: t('marketCrashLabel'), count: crashCount, val: crashCount * LIA_VALUES.crash },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs md:text-sm border-b border-white/5 pb-3">
                    <div className="flex items-center gap-4">
                      <MiniAsset kind={item.kind} />
                      <span className="text-white/80 font-bold">{item.label} <span className="text-white/40 ml-1">x{item.count}</span></span>
                    </div>
                    <span className="font-black text-glitch-pink">-${item.val.toLocaleString()} USD</span>
                  </div>
                ))}
              </div>

              {/* Performance Summary Totals */}
              <div className="mt-12 pt-8 border-t-2 border-dashed border-white/20 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[10px] text-white/40 uppercase mb-2 font-black">{t('totalGains')}</div>
                  <div className="text-3xl md:text-4xl text-turbo-lime font-display">${totalGains.toLocaleString()} USD</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40 uppercase mb-2 font-black">{t('totalLosses')}</div>
                  <div className="text-3xl md:text-4xl text-glitch-pink font-display">-${totalLosses.toLocaleString()} USD</div>
                </div>
              </div>
            </Box3D>

            <div className={`p-8 border-l-8 ${isPositivePerformance ? 'bg-turbo-lime/10 border-turbo-lime' : 'bg-glitch-pink/10 border-glitch-pink'}`}>
              <div className="flex gap-6 items-center">
                {isPositivePerformance ? <TrendingUp className="text-turbo-lime" size={32} /> : <AlertTriangle className="text-glitch-pink" size={32} />}
                <p className="font-mono text-xs md:text-sm text-white leading-tight uppercase font-black tracking-wider">
                  {isPositivePerformance ? t('performanceAnalysisPositive') : t('performanceAnalysisNegative')}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Educational Insights (Inversión Inteligente) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3 px-2">
              <Info className="text-white" size={20} />
              <h3 className="font-mono text-sm text-white uppercase tracking-[0.4em] font-black">{t('smartInvesting')}</h3>
            </div>

            <div className="space-y-8">
              {/* Assets Section */}
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] text-turbo-lime uppercase tracking-widest font-black ml-1">{t('assetBreakdown')}</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: t('educationLabel'), text: t('whyEducation'), color: 'border-blue-900/40 bg-blue-900/10' },
                    { title: t('stocksLabel'), text: t('whyStocks'), color: 'border-yellow-900/40 bg-yellow-900/10' },
                    { title: t('familyHome'), text: t('whyRealEstate'), color: 'border-orange-900/40 bg-orange-900/10' },
                    { title: t('commPlaza'), text: t('whyCommercial'), color: 'border-green-900/40 bg-green-900/10' },
                  ].map((card, i) => (
                    <Box3D key={i} className="hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex flex-col gap-2">
                        <h4 className="font-display text-sm text-white uppercase tracking-tighter border-b border-white/10 pb-2">{card.title}</h4>
                        <p className="font-mono text-[10px] md:text-xs text-white/50 leading-relaxed uppercase font-bold">{card.text}</p>
                      </div>
                    </Box3D>
                  ))}
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] text-glitch-pink uppercase tracking-widest font-black ml-1">{t('liabilityBreakdown')}</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: t('maintenance'), text: t('whyMaintenance'), color: 'border-red-900/40 bg-red-900/10' },
                    { title: t('interestHike'), text: t('whyInterest'), color: 'border-red-900/40 bg-red-900/10' },
                    { title: t('marketCrashLabel'), text: t('whyCrash'), color: 'border-purple-900/40 bg-purple-900/10' },
                  ].map((card, i) => (
                    <Box3D key={i} className="hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex flex-col gap-2">
                        <h4 className="font-display text-sm text-white uppercase tracking-tighter border-b border-white/10 pb-2">{card.title}</h4>
                        <p className="font-mono text-[10px] md:text-xs text-white/50 leading-relaxed uppercase font-bold">{card.text}</p>
                      </div>
                    </Box3D>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Portfolio Score & Retry Button */}
        <div className="flex flex-col items-center gap-10 w-full max-w-4xl mt-12 pb-20">
          <div className="text-center w-full relative">
            <div className="absolute inset-0 bg-white/5 translate-x-2 translate-y-2 border border-white/10" />
            <div className="relative bg-black border border-white/20">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-turbo-lime/40 to-transparent" />
              <div className="py-16 px-8">
                <div className="font-mono text-[11px] text-white/30 uppercase tracking-[0.5em] mb-4 font-black">{t('finalPortfolio')}</div>
                <div className="font-display text-7xl md:text-[10rem] text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.25)] leading-none">
                  ${score.toLocaleString()}
                </div>
                <div className="font-mono text-sm text-white/40 mt-4 font-bold uppercase tracking-[0.8em]">USD</div>
                {isNewHighScore && (
                  <div className="mt-10">
                    <span className="font-mono text-sm bg-turbo-lime text-black px-8 py-3 rounded-full font-black animate-bounce inline-block uppercase tracking-widest shadow-[0_0_20px_rgba(46,204,113,0.4)]">
                      {t('newHighScore')}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-turbo-lime/40 to-transparent" />
            </div>
          </div>

          <button
            onClick={onRetry}
            className="arcade-btn w-full max-w-lg flex items-center justify-center gap-6 bg-white text-black hover:bg-turbo-lime transition-all px-12 py-10 group border-b-[16px] border-r-[16px] border-gray-300 active:translate-y-2 active:border-b-[4px] active:border-r-[4px]"
          >
            <RotateCcw size={48} className="group-hover:rotate-180 transition-transform duration-700" />
            <span className="font-mono text-2xl md:text-4xl font-black tracking-[0.2em] uppercase">{t('retry')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default GameOverScreen;
