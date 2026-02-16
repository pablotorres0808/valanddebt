import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

export const translations: Translations = {
  title: {
    en: 'VAL & DEBT',
    es: 'VAL & DEUDA',
  },
  advancedWealthSimulator: {
    en: 'Advanced Wealth Simulator',
    es: 'Simulador Avanzado de Riqueza',
  },
  tagline: {
    en: 'Catch Assets. Dodge Debt. Build Wealth.',
    es: 'Atrapa Activos. Esquiva Deudas. Crea Riqueza.',
  },
  highScore: {
    en: 'High Score',
    es: 'Récord',
  },
  howToPlay: {
    en: 'How to Play',
    es: 'Cómo Jugar',
  },
  controlsLabel: {
    en: 'Controls',
    es: 'Controles',
  },
  play: {
    en: 'PLAY',
    es: 'JUGAR',
  },
  controlsA: { en: 'Move Left', es: 'Mover Izquierda' },
  controlsD: { en: 'Move Right', es: 'Mover Derecha' },
  controlsArrows: { en: 'Arrow Keys', es: 'Flechas' },
  gameLoreTitle: {
    en: 'Financial Strategy',
    es: 'Estrategia Financiera',
  },
  gameLoreIntro: {
    en: 'Balance your portfolio by capturing high-value assets while avoiding debt traps. Your goals is to maximize wealth before the market collapses.',
    es: 'Equilibra tu cartera capturando activos de alto valor y evitando trampas de deuda. Tu objetivo es maximizar la riqueza antes del colapso.',
  },
  startGame: {
    en: 'START GAME',
    es: 'INICIAR JUEGO',
  },
  controlsMove: {
    en: 'Mouse / Touch to move',
    es: 'Ratón / Tocar para mover',
  },
  controlsGoals: {
    en: 'Catch Assets • Dodge Debt',
    es: 'Atrapa Activos • Esquiva Deuda',
  },
  portfolioHealth: {
    en: 'Portfolio Health',
    es: 'Salud de Cartera',
  },
  level: {
    en: 'LVL',
    es: 'NIVEL',
  },
  combo: {
    en: 'COMBO',
    es: 'COMBO',
  },
  bullMarket: {
    en: 'BULL MARKET',
    es: 'MERCADO ALCISTA',
  },
  marketCrash: {
    en: 'MARKET CRASH',
    es: 'COLAPSO DEL MERCADO',
  },
  newHighScore: {
    en: '★ NEW HIGH SCORE ★',
    es: '★ NUEVO RÉCORD ★',
  },
  finalPortfolio: {
    en: 'Final Portfolio',
    es: 'Cartera Final',
  },
  retry: {
    en: 'RETRY',
    es: 'REINTENTAR',
  },
  // Game entities labels
  educationLabel: { en: 'Education', es: 'Educación' },
  familyHome: { en: 'Family Home', es: 'Vivienda' },
  commPlaza: { en: 'Comm. Plaza', es: 'Plaza Comercial' },
  stocksLabel: { en: 'Stocks', es: 'Acciones' },
  maintenance: { en: 'Maintenance', es: 'Mantenimiento' },
  interestHike: { en: 'Interest Hike', es: 'Alza de Tasas' },
  marketCrashLabel: { en: 'Market Crash', es: 'Colapso' },
  mute: { en: 'Mute', es: 'Silenciar' },
  unmute: { en: 'Unmute', es: 'Activar Sonido' },
  // Educational & Summary
  marketCollapseNarrative: {
    en: 'The market collapsed due to high volatility and risky investment decisions. Understanding the balance between assets and liabilities is key to long-term survival.',
    es: 'El mercado ha colapsado debido a decisiones de inversión arriesgadas y alta volatilidad. Entender el balance entre activos y pasivos es clave para la supervivencia financiera.',
  },
  investmentSummary: {
    en: 'Investment Summary',
    es: 'Resumen de Inversión',
  },
  assetBreakdown: {
    en: 'Asset Breakdown',
    es: 'Desglose de Activos',
  },
  liabilityBreakdown: {
    en: 'Liability Breakdown',
    es: 'Desglose de Pasivos',
  },
  totalGains: {
    en: 'Total Gains',
    es: 'Ganancias Totales',
  },
  totalLosses: {
    en: 'Total Losses',
    es: 'Pérdidas Totales',
  },
  performanceAnalysisPositive: {
    en: 'Excellent! Your gains far outweigh your losses. You showed great ability to pick valuable assets.',
    es: '¡Excelente! Tus ganancias superan por mucho las pérdidas. Has demostrado gran capacidad para identificar activos de valor.',
  },
  performanceAnalysisNegative: {
    en: 'Your losses exceeded your gains this period. Risk management is fundamental for long-term growth.',
    es: 'Tus pérdidas superaron tus ganancias en este periodo. La gestión de riesgo es fundamental para el crecimiento a largo plazo.',
  },
  smartInvesting: {
    en: 'Smart Investing',
    es: 'Inversión Inteligente',
  },
  // Educational Insights
  whyStocks: {
    en: 'Stocks represent ownership in a company. They offer high growth potential through value appreciation and dividends, though they come with market volatility.',
    es: 'Las acciones representan la propiedad en una empresa. Ofrecen un alto potencial de crecimiento y dividendos, aunque conllevan volatilidad de mercado.',
  },
  whyRealEstate: {
    en: 'Real Estate provides physical security and consistent rental income. It is an excellent hedge against inflation and tends to appreciate over the long term.',
    es: 'Los bienes raíces brindan seguridad física e ingresos constantes por rentas. Son una excelente protección contra la inflación y tienden a valorizarse a largo plazo.',
  },
  whyEducation: {
    en: 'Education is an investment in human capital. It increases your long-term earning potential and provides technical skills that are essential for high-value careers.',
    es: 'La educación es una inversión en capital humano. Aumenta tu potencial de ingresos a largo plazo y brinda habilidades técnicas esenciales.',
  },
  whyCommercial: {
    en: 'Commercial buildings offer higher rental yields and longer leases than residential property, providing professional-grade cash flow and stability.',
    es: 'Los edificios comerciales ofrecen mayores rendimientos y contratos más largos que la vivienda, brindando estabilidad y flujo de caja profesional.',
  },
  whyMaintenance: {
    en: 'Ongoing maintenance is a recurring liability. Neglecting it leads to asset depreciation and unexpected costly repairs over time.',
    es: 'El mantenimiento es un pasivo recurrente. Descuidarlo provoca que tus activos pierdan valor y genera reparaciones costosas e inesperadas.',
  },
  whyInterest: {
    en: 'Interest hikes increase the cost of debt. High interest rates drain your cash flow and can turn profitable investments into financial burdens.',
    es: 'Las alzas de tasas aumentan el costo de la deuda. Los intereses altos consumen tu flujo de caja y pueden volver pesada una buena inversión.',
  },
  whyCrash: {
    en: 'A total market crash represents systemic risk. It can wipe out unprotected equity and requires emergency cash reserves to survive.',
    es: 'Un colapso total representa un riesgo sistémico. Puede borrar el patrimonio no protegido y requiere reservas de emergencia para sobrevivir.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es'); // Default to Spanish as requested

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
