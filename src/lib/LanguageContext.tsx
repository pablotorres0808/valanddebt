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
  tagline: {
    en: 'Catch Assets. Dodge Debt. Build Wealth.',
    es: 'Atrapa Activos. Esquiva Deudas. Crea Riqueza.',
  },
  highScore: {
    en: 'High Score',
    es: 'Record',
  },
  startGame: {
    en: 'START GAME',
    es: 'INICIAR JUEGO',
  },
  controlsMove: {
    en: '🖱️ Mouse / 📱 Touch to move',
    es: '🖱️ Ratón / 📱 Tocar para mover',
  },
  controlsGoals: {
    en: 'Catch 🏠 Assets • Dodge ⚡ Debt',
    es: 'Atrapa 🏠 Activos • Esquiva ⚡ Deuda',
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
  studioApt: { en: 'Studio Apt', es: 'Estudio' },
  familyHome: { en: 'Family Home', es: 'Casa' },
  commPlaza: { en: 'Comm. Plaza', es: 'Plaza Com.' },
  maintenance: { en: 'Maintenance', es: 'Mantenimiento' },
  interestHike: { en: 'Interest Hike', es: 'Subida Tasas' },
  marketCrashLabel: { en: 'Market Crash', es: 'Colapso' },
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
