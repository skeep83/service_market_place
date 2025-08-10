import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { Gravatar } from '../lib/gravatar.tsx';

interface HeaderProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  const { t, language } = useTranslation();

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3" style={{ minWidth: '200px' }}>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-80"></div>
                  <div className="relative z-10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5L18 12l-7.5 7.5z" opacity="0.7" />
                    </svg>
                  </div>
                  <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full opacity-30 blur-sm"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="font-display text-3xl font-black text-white tracking-tight">
                    <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Service
                    </span>
                    <span className="bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
                      Hub
                    </span>
                  </h1>
                  <div className="text-xs text-white/60 font-medium tracking-wider uppercase">
                    Professional Services
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Gravatar
                      email={user.email || ''}
                      size={48}
                      defaultImage="identicon"
                      className="shadow-xl ring-4 ring-white/10"
                      alt={user.full_name || 'User Avatar'}
                    />
                    {user.role === 'pro' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white">{user.full_name}</p>
                    <p className="text-xs text-white/80 capitalize flex items-center font-medium">
                      {user.role === 'pro' && <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>}
                      {user.role === 'pro' ? (language === 'ro' ? 'Specialist' : 'Специалист') : 
                       user.account_type === 'business' ? (language === 'ro' ? 'Business' : 'Бизнес') : 
                       (language === 'ro' ? 'Client' : 'Клиент')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {t.signin}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}