import React, { useState } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useTranslation } from './hooks/useTranslation';
import { getGravatarUrl } from './lib/gravatar';

function App() {
  const { t } = useTranslation();
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={profile} 
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <main>
        {profile ? (
          <Dashboard user={profile} />
        ) : (
          <div className="relative">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden min-h-screen flex items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 blob-shape mix-blend-multiply filter blur-3xl opacity-20 float"></div>
                <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 blob-shape mix-blend-multiply filter blur-3xl opacity-15 float" style={{animationDelay: '2s'}}></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 blob-shape mix-blend-multiply filter blur-3xl opacity-10 float" style={{animationDelay: '4s'}}></div>
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                  <div className="inline-flex items-center px-8 py-4 acrylic rounded-full text-sm font-semibold mb-8 hover:bg-white/15 transition-all duration-300">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <span className="text-white">{t.hero.verifiedSpecialists}</span>
                  </div>
                  
                  {/* Главный логотип на лендинге */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500">
                        {/* Внутренний градиент */}
                        <div className="absolute inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-80"></div>
                        
                        {/* Основная иконка */}
                        <div className="relative z-10 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white drop-shadow-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            {/* Дом */}
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            {/* Инструменты */}
                            <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.8"/>
                            <circle cx="9" cy="13" r="0.5" fill="currentColor" opacity="0.6"/>
                            <circle cx="15" cy="13" r="0.5" fill="currentColor" opacity="0.6"/>
                          </svg>
                        </div>
                        
                        {/* Блики */}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full opacity-20 blur-md"></div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full opacity-30"></div>
                      </div>
                      
                      {/* Орбитальные элементы */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                  </div>
                  
                  <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] text-white drop-shadow-2xl">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      Service
                    </span>
                    <span className="bg-gradient-to-r from-purple-200 via-white to-purple-100 bg-clip-text text-transparent">
                      Hub
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-4xl mx-auto leading-relaxed font-medium">
                    {t.hero.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="group bg-white text-slate-900 px-12 py-5 text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      <span className="flex items-center">
                        <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        {t.hero.findServices}
                      </span>
                    </button>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="group acrylic text-white px-12 py-5 text-lg font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="flex items-center">
                        <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        {t.hero.becomePro}
                      </span>
                    </button>
                  </div>
                  
                  {/* Stats */}
                  <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div className="text-center acrylic-card rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
                      <div className="text-4xl font-black text-white mb-2 font-display">24/7</div>
                      <div className="text-white/70 text-sm font-medium">{t.common.stats.support247}</div>
                    </div>
                    <div className="text-center acrylic-card rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
                      <div className="text-4xl font-black text-white mb-2 font-display">98%</div>
                      <div className="text-white/70 text-sm font-medium">{t.common.stats.satisfiedClients}</div>
                    </div>
                    <div className="text-center acrylic-card rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
                      <div className="text-4xl font-black text-white mb-2 font-display">5★</div>
                      <div className="text-white/70 text-sm font-medium">{t.common.stats.averageRating}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 blob-shape opacity-30 float"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-100 to-pink-100 blob-shape opacity-20 float" style={{animationDelay: '3s'}}></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <div className="inline-flex items-center px-8 py-4 acrylic-card rounded-full text-slate-800 text-sm font-bold mb-8 hover:bg-white/20 transition-all duration-300">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{t.howItWorks.title}</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
                    {t.howItWorks.title}
                  </h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                    {t.howItWorks.subtitle}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-16">
                  <div className="text-center group relative acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-black">1</span>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-6">{t.howItWorks.searchCompare.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                      {t.howItWorks.searchCompare.description}
                    </p>
                  </div>

                  <div className="text-center group relative acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                      </svg>
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-black">2</span>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-6">{t.howItWorks.getQuotes.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                      {t.howItWorks.getQuotes.description}
                    </p>
                  </div>

                  <div className="text-center group relative acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-black">3</span>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-6">{t.howItWorks.securePayment.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                      {t.howItWorks.securePayment.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="py-32 bg-white relative overflow-hidden" id="services">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 blob-shape opacity-20 float"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <div className="inline-flex items-center px-8 py-4 acrylic-card rounded-full text-slate-800 text-sm font-bold mb-8 hover:bg-white/20 transition-all duration-300">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>{t.popularServices.title}</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-6xl font-black text-slate-900 mb-8">
                    {t.popularServices.title}
                  </h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                    {t.popularServices.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                  {[
                    { name: t.categories.plumbing, icon: '🔧', gradient: 'from-blue-500 to-purple-600' },
                    { name: t.categories.electrical, icon: '⚡', gradient: 'from-yellow-500 to-orange-500' },
                    { name: t.categories.cleaning, icon: '🧹', gradient: 'from-purple-500 to-pink-500' },
                    { name: t.categories.locksmith, icon: '🔐', gradient: 'from-cyan-500 to-blue-500' },
                    { name: t.categories.painting, icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
                    { name: t.categories.gardening, icon: '🌱', gradient: 'from-green-500 to-emerald-500' },
                    { name: t.categories.moving, icon: '📦', gradient: 'from-orange-500 to-red-500' },
                    { name: t.categories.repair, icon: '🛠️', gradient: 'from-indigo-500 to-purple-500' }
                  ].map((category) => (
                    <div 
                      key={category.name}
                      className="group acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                      <div className="relative">
                        <div className="text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-500">{category.icon}</div>
                        <h3 className="font-display font-bold text-slate-900 text-xl group-hover:text-slate-800 transition-colors duration-300">{category.name}</h3>
                        <div className="mt-4 text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium">
                          {t.language === 'ro' ? 'Găsește specialist →' : 'Найти специалиста →'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Services Section */}
            <div className="py-32 bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-100 to-purple-100 blob-shape opacity-20 float"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <div className="inline-flex items-center px-8 py-4 acrylic-card rounded-full text-slate-800 text-sm font-bold mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <svg className="w-5 h-5 text-emerald-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{t.popularServices.title}</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-6xl font-black text-slate-900 mb-8">
                    {t.common.availableSpecialists}
                  </h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
                    {t.common.lookAtBest}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {(t.common.professionals || []).map((pro, index) => (
                    <div key={index} className="group acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-4 right-4">
                        {index !== 2 ? (
                          <div className="flex items-center space-x-1 acrylic text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>{t.common.available}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 acrylic text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                            <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                            <span>{t.common.busy}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center mb-6">
                        <div className="relative mx-auto mb-4 group-hover:scale-110 transition-all duration-500">
                          <img
                            src={getGravatarUrl(pro.name, 80, 'identicon')}
                            alt={pro.name}
                            className="w-20 h-20 rounded-full shadow-xl"
                          />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-lg">{['🔧', '🧹', '⚡', '🎨', '🔐', '🌱'][index]}</span>
                          </div>
                        </div>
                        <h3 className="font-display text-xl font-bold text-slate-900 mb-1">{pro.name}</h3>
                        <p className="text-slate-600 font-medium">{pro.category}</p>
                      </div>

                      <div className="flex items-center justify-center mb-4">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-slate-700 font-bold">{[4.9, 4.8, 4.9, 4.7, 4.8, 4.6][index]}</span>
                        <span className="text-slate-500 ml-1">({[127, 89, 156, 73, 94, 45][index]})</span>
                      </div>

                      <div className="space-y-2 mb-6">
                        {pro.specialties.map((specialty, i) => (
                          <div key={i} className="flex items-center text-sm text-slate-600">
                            <svg className="w-3 h-3 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {specialty}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-lg font-bold text-slate-900">{pro.price}</p>
                          <p className="text-xs text-slate-500">{t.common.response} {pro.responseTime}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowAuthModal(true)}
                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                          index !== 2
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={index === 2}
                      >
                        {index !== 2 ? t.common.contactNow : t.common.unavailable}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-5 text-lg font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <span className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                      {t.common.viewAllProfessionals}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Social Proof Section */}
            <div className="py-32 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-100 to-blue-100 blob-shape opacity-20 float"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <div className="inline-flex items-center px-8 py-4 acrylic-card rounded-full text-slate-800 text-sm font-bold mb-8 hover:bg-white/20 transition-all duration-300">
                    <svg className="w-5 h-5 text-cyan-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>{t.common.clientReviews}</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-6xl font-black text-slate-900 mb-8">
                    {t.common.whatClientsSay}
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {(t.common.reviews || []).map((review, index) => (
                    <div key={index} className="acrylic-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="flex items-center mb-4">
                        <img
                          src={getGravatarUrl(review.name, 48, 'identicon')}
                          alt={review.name}
                          className="w-12 h-12 rounded-full mr-4 shadow-lg"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{review.name}</h4>
                          <p className="text-sm text-slate-600">{review.service}</p>
                        </div>
                      </div>
                      
                      <div className="flex text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-slate-700 mb-4 leading-relaxed">"{review.text}"</p>
                      <p className="text-sm text-slate-500">{review.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 blob-shape opacity-20 float"></div>
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-display text-5xl md:text-6xl font-black mb-8 leading-tight">
                  {t.common.readyToFind}
                </h2>
                <p className="text-xl mb-12 text-white/80 leading-relaxed font-medium">
                  {t.common.joinThousands}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white text-slate-900 px-12 py-5 text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    <span className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                      {t.common.createAccountFree}
                    </span>
                  </button>
                </div>
                
                <div className="mt-12 flex items-center justify-center space-x-8 text-white/70">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-sm font-medium">{t.common.noHiddenFees}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span className="text-sm font-medium">{t.common.secure}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM21 21l-5.197-5.197" />
                    </svg>
                    <span className="text-sm font-medium">{t.common.fastSearch}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLoginSuccess}
          signIn={signIn}
          signUp={signUp}
        />
      )}
    </div>
  );
}

export default App;