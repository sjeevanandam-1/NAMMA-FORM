import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    app_title: 'Namma Farm',
    tagline: 'Digital Agriculture Platform & Farmer to Buyer Marketplace',
    usp_what_to_grow: 'Decide WHAT to grow',
    usp_when_to_sell: 'Decide WHEN to sell',
    usp_where_to_sell: 'Decide WHERE to sell',
    usp_who_to_sell: 'Decide WHO to sell to',
    explore_marketplace: 'Explore Marketplace',
    farmer_portal: 'Farmer Dashboard',
    buyer_portal: 'Buyer Portal',
    crop_doctor: 'AI Crop Doctor',
    price_forecast: 'AI Price Forecast',
    profit_advisor: 'Profit Advisor',
    agri_ai: 'Namma Farm AI Assistant',
    weather_alerts: 'Agro Weather & Alerts',
    join_farmer: 'Join as Farmer',
    join_buyer: 'Join as Buyer',
    demo_mode: 'DEMO MODE',
  },
  ta: {
    app_title: 'நம்ம பார்ம் (Namma Farm)',
    tagline: 'டிஜிட்டல் விவசாய தளம் மற்றும் நேரடி சந்தை',
    usp_what_to_grow: 'என்ன பயிரிடுவது என்பதை தீர்மானிக்கவும்',
    usp_when_to_sell: 'எப்போது விற்பது என்பதை முடிவு செய்யுங்கள்',
    usp_where_to_sell: 'எங்கு விற்பது என்பதை தேர்வு செய்யுங்கள்',
    usp_who_to_sell: 'யாருக்கு விற்பது என்பதை கண்டறியுங்கள்',
    explore_marketplace: 'சந்தையை உலாவுக',
    farmer_portal: 'விவசாயி கட்டுப்பாட்டு அறை',
    buyer_portal: 'வாங்குபவர் தளம்',
    crop_doctor: 'AI பயிர் மருத்துவர்',
    price_forecast: 'விலை முன்னறிவிப்பு',
    profit_advisor: 'லாப ஆலோசகர்',
    agri_ai: 'நம்ம பார்ம் AI உதவியாளர்',
    weather_alerts: 'வானிலை மற்றும் எச்சரிக்கைகள்',
    join_farmer: 'விவசாயியாக இணையுங்கள்',
    join_buyer: 'வாங்குபவராக இணையுங்கள்',
    demo_mode: 'மாதிரி முறை (DEMO)',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('agriconnect_lang') as Language) || 'en';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agriconnect_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
