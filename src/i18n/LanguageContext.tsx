import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLanguage, LanguageOption } from './translations';
import { SUPPORTED_LANGUAGES, translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultValue?: string) => string;
  currentLanguageOption: LanguageOption;
  allLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('persona_lang');
    if (saved && saved in translations) {
      return saved as SupportedLanguage;
    }
    // Detect browser language if possible
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang && browserLang in translations) {
      return browserLang as SupportedLanguage;
    }
    return 'es'; // Default
  });

  const setLanguage = (lang: SupportedLanguage) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('persona_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultValue?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to Spanish or English
    const fallbackDict = translations['es'] || translations['en'];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return defaultValue || key;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        allLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
