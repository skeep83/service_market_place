import { useState, useCallback, useEffect } from 'react';
import { translations, Translation } from '../i18n/translations';

type Language = 'ro' | 'ru';

// Глобальное состояние языка
let globalLanguage: Language = 'ro';
const listeners: Set<() => void> = new Set();

// Функция для уведомления всех слушателей
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Функция для изменения языка глобально
const setGlobalLanguage = (lang: Language) => {
  console.log('🌍 Setting global language to:', lang);
  globalLanguage = lang;
  localStorage.setItem('language', lang);
  notifyListeners();
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    const initial = (saved as Language) || 'ro';
    globalLanguage = initial;
    return initial;
  });

  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => {
      console.log('🔄 Language changed to:', globalLanguage);
      setLanguage(globalLanguage);
      forceUpdate({});
    };
    
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const switchLanguage = useCallback((lang: Language) => {
    console.log('🎯 Switch language called:', lang);
    setGlobalLanguage(lang);
  }, []);

  const t = translations[language];

  return {
    t,
    language,
    switchLanguage
  };
}