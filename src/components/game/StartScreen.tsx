import { useState } from 'react';
import { Play, TrendingUp, ShieldCheck, HelpCircle, ChevronLeft, ChevronRight, AlertTriangle, Wrench, Percent, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

// Replicating exactly the gameEngine logic in SVG/CSS
const ProceduralIcon = ({ kind, size = 24 }: { kind: string, size?: number }) => {
  if (kind === 'education') return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Mortarboard */}
      <div className="absolute top-1 left-0 w-full h-[40%] bg-[#1a1a1a] border border-white/20" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      {/* Tassel */}
      <div className="absolute top-[30%] right-[10%] w-[2px] h-[50%] bg-[#f1c40f]" />
      {/* Scroll */}
      <div className="absolute bottom-1 left-[20%] w-[60%] h-[20%] bg-white border border-black/40 rounded-full" />
    </div>
  );
  if (kind === 'family_home') return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* House Body */}
      <div className="absolute bottom-0 left-[10%] w-[80%] h-[60%] bg-[#e67e22] border border-black/40" />
      {/* Roof */}
      <div className="absolute top-0 left-0 w-full h-[45%] bg-[#e67e22] border border-black/40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    </div>
  );
  if (kind === 'commercial_plaza') return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Building */}
      <div className="absolute inset-0 bg-[#2ecc71] border border-black/40 rounded-sm" />
      {/* Windows */}
      <div className="grid grid-cols-2 gap-1 p-1 h-full">
        <div className="bg-white/30" /><div className="bg-white/30" />
        <div className="bg-white/30" /><div className="bg-white/30" />
      </div>
    </div>
  );
  if (kind === 'stocks') return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Certificate */}
      <div className="absolute inset-[10%] bg-[#f5f5dc] border border-[#f1c40f] border-2" />
      {/* Seal */}
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#f1c40f]" />
    </div>
  );
  return null;
};

const KeyboardKey3D = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center justify-center min-w-[32px] h-[32px] bg-white text-black font-mono font-black text-sm rounded-sm border-b-4 border-r-4 border-gray-400 active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 transition-all mx-1 px-2">
    {children}
  </div>
);

const Box3D = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-white/5 translate-x-1.5 translate-y-1.5 border border-white/10" />
    <div className="relative bg-black border border-white/25 p-5">
      {children}
    </div>
  </div>
);

const StartScreen = ({ onStart, highScore }: StartScreenProps) => {
  const { t } = useLanguage();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const glossaryItems = [
    { id: 'edu', kind: 'education', label: t('educationLabel'), desc: t('whyEducation') },
    { id: 'home', kind: 'family_home', label: t('familyHome'), desc: t('whyRealEstate') },
    { id: 'stock', kind: 'stocks', label: t('stocksLabel'), desc: t('whyStocks') },
    { id: 'plaza', kind: 'commercial_plaza', label: t('commPlaza'), desc: t('whyCommercial') },
    { id: 'main', kind: 'maintenance', label: t('maintenance'), desc: t('whyMaintenance'), isLiability: true },
    { id: 'int', kind: 'interest', label: t('interestHike'), desc: t('whyInterest'), isLiability: true },
    { id: 'crash', kind: 'crash', label: t('marketCrashLabel'), desc: t('whyCrash'), isLiability: true },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-black z-[100] overflow-y-auto pt-32 pb-20 custom-scrollbar">
      <div className="max-w-4xl w-full px-6 flex flex-col items-center text-center">

        {/* Title Section */}
        <div className="relative mb-12 flex flex-col items-center group">
          <TrendingUp className="text-turbo-lime mb-6 group-hover:scale-110 transition-transform" size={56} />
          <div className="relative">
            <h1 className="font-display text-7xl md:text-9xl text-white/5 absolute -top-1 -left-1 md:-top-2 md:-left-2 tracking-tighter uppercase whitespace-nowrap select-none">
              VAL&DEBT
            </h1>
            <h1 className="font-display text-7xl md:text-9xl text-white relative tracking-tighter uppercase whitespace-nowrap drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              VAL&DEBT
            </h1>
          </div>
          <div className="font-mono text-[11px] md:text-sm text-turbo-lime mt-4 tracking-[0.6em] uppercase font-black opacity-100 bg-white/5 px-4 py-1">
            {t('advancedWealthSimulator')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-12 items-start">

          {/* Left Column: Lore & Glossary */}
          <div className="space-y-6 text-left">
            <Box3D>
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-turbo-lime" size={20} />
                <h3 className="font-mono text-sm text-white uppercase font-black tracking-widest">{t('gameLoreTitle')}</h3>
              </div>
              <p className="font-mono text-xs text-white/70 leading-relaxed uppercase font-bold">
                {t('gameLoreIntro')}
              </p>
            </Box3D>

            <div className="space-y-4">
              <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black ml-2 px-1">Glosario Interactivo</h4>
              <div className="grid grid-cols-1 gap-2">
                {glossaryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border transition-all cursor-pointer ${expandedItem === item.id
                      ? 'bg-white/10 border-white/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {item.isLiability ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-red-950/20 border border-red-900/40">
                            {item.kind === 'maintenance' && <Wrench size={18} className="text-red-500" />}
                            {item.kind === 'interest' && <Percent size={18} className="text-red-500" />}
                            {item.kind === 'crash' && <Zap size={18} className="text-red-500" />}
                          </div>
                        ) : (
                          <ProceduralIcon kind={item.kind} size={32} />
                        )}
                        <div className="font-mono text-[10px] text-white font-black uppercase tracking-tighter">{item.label}</div>
                      </div>
                      {expandedItem === item.id ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                    </div>

                    {expandedItem === item.id && (
                      <p className="font-mono text-[10px] text-white/60 uppercase leading-relaxed mt-3 pt-3 border-t border-white/10 font-bold">
                        {item.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Controls & HighScore */}
          <div className="space-y-6">
            <Box3D>
              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <ShieldCheck className="text-turbo-lime" size={28} />
                <div className="text-left">
                  <h3 className="font-mono text-xs text-white/40 uppercase font-black tracking-widest leading-none mb-2">
                    {t('highScore')}
                  </h3>
                  <div className="font-display text-4xl text-white">
                    ${highScore.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="text-white/40" size={18} />
                  <h3 className="font-mono text-xs text-white/80 uppercase font-black tracking-widest">
                    {t('howToPlay')}
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* PC Controls */}
                  <div className="bg-white/5 p-4 border border-white/5">
                    <div className="font-mono text-[10px] text-white/40 uppercase mb-3 font-black">Teclado PC</div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <KeyboardKey3D>A</KeyboardKey3D>
                        <KeyboardKey3D><ChevronLeft size={16} /></KeyboardKey3D>
                        <span className="font-mono text-[11px] text-white font-bold uppercase ml-2">{t('controlsA')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <KeyboardKey3D>D</KeyboardKey3D>
                        <KeyboardKey3D><ChevronRight size={16} /></KeyboardKey3D>
                        <span className="font-mono text-[11px] text-white font-bold uppercase ml-2">{t('controlsD')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Touch/Mouse */}
                  <div className="bg-white/5 p-4 border border-white/5">
                    <div className="font-mono text-[10px] text-white/40 uppercase mb-1 font-black">Móvil / Ratón</div>
                    <p className="font-mono text-xs text-turbo-lime font-black uppercase tracking-tight">
                      {t('controlsMove').replace('🖱️ ', '').replace('📱 ', '')}
                    </p>
                  </div>
                </div>
              </div>
            </Box3D>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="arcade-btn w-full max-w-sm flex items-center justify-center gap-6 bg-white text-black hover:bg-turbo-lime transition-all px-10 py-7 group border-b-[10px] border-r-[10px] border-gray-400 active:translate-y-1 active:translate-x-1 active:border-b-[4px] active:border-r-[4px]"
        >
          <Play size={40} className="fill-current group-hover:scale-110 transition-transform" />
          <span className="font-mono text-3xl font-black tracking-[0.3em]">{t('play')}</span>
        </button>

        {/* Educational Disclaimer with High Contrast */}
        <p className="mt-16 font-mono text-[10px] text-turbo-lime font-black text-center uppercase tracking-[0.2em] max-w-sm leading-relaxed bg-black/80 px-4 py-2 border border-white/5">
          Simulador educativo de riesgo financiero. Desarrollado para el análisis de activos vs pasivos.
        </p>

      </div>
    </div>
  );
};

export default StartScreen;
