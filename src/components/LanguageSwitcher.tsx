import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export function LanguageSwitcher() {
  const { language, switchLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20 min-w-[100px]">
      <button
        onClick={() => {
          console.log('🔴 RO clicked, current:', language);
          switchLanguage('ro');
        }}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
          language === 'ro'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        RO
      </button>
      <button
        onClick={() => {
          console.log('🔵 RU clicked, current:', language);
          switchLanguage('ru');
        }}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
          language === 'ru'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        RU
      </button>
    </div>
  );
}