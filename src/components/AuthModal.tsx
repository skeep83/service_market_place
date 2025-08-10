import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface AuthModalProps {
  onClose: () => void;
  onLogin: () => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
}

export function AuthModal({ onClose, onLogin, signIn, signUp }: AuthModalProps) {
  const { t } = useTranslation();
  const [authType, setAuthType] = useState<'client' | 'business' | 'pro'>('client');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    business_id: '',
    contact_person: '',
    legal_address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        if (data.user) {
          onLogin();
        }
      } else {
        const userData = authType === 'business' ? {
          company_name: formData.full_name,
          idno: formData.business_id,
          contact_person: formData.contact_person,
          legal_address: formData.legal_address,
          phone: formData.phone,
          role: 'user',
          account_type: authType
        } : {
          full_name: formData.full_name,
          phone: formData.phone,
          role: authType === 'pro' ? 'pro' : 'user',
          account_type: authType
        };
        const { data, error } = await signUp(formData.email, formData.password, userData);
        if (error) throw error;
        if (data.user) {
          onLogin();
        }
      }
    } catch (err: any) {
      if (err.message?.includes('User already registered') || err.code === 'user_already_exists') {
        setError('Этот email уже зарегистрирован. Пожалуйста, войдите в систему.');
        setIsLogin(true);
      } else {
        setError(err.message || 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl max-w-md w-full relative hover-lift rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-100/80 rounded-full hover:bg-gray-200/80 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Auth Type Selector */}
        <div className="flex">
          <button
            onClick={() => setAuthType('client')}
            className={`flex-1 py-6 px-8 text-center transition-all duration-300 ${
              authType === 'client'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">{t.auth.client}</h3>
                <p className="text-sm opacity-80">{t.auth.clientDescription}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setAuthType('business')}
            className={`flex-1 py-6 px-8 text-center transition-all duration-300 ${
              authType === 'business'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">Бизнес</h3>
                <p className="text-sm opacity-80">Юридическое лицо</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setAuthType('pro')}
            className={`flex-1 py-6 px-8 text-center transition-all duration-300 ${
              authType === 'pro'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">{t.auth.professional}</h3>
                <p className="text-sm opacity-80">{t.auth.professionalDescription}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="p-8">
          <h2 className="font-display text-2xl font-black text-slate-900 mb-6 text-center">
            {isLogin ? t.auth.signin : t.auth.createAccount}
            <span className={`block text-lg font-medium mt-1 ${
              authType === 'client' ? 'text-blue-600' : 
              authType === 'business' ? 'text-green-600' : 'text-purple-600'
            }`}>
              {authType === 'client' ? t.auth.forClients : 
               authType === 'business' ? 'для Бизнеса' : t.auth.forProfessionals}
            </span>
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50/90 border border-red-200 text-red-800 rounded-2xl font-medium backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {authType === 'business' ? 'Название компании' : t.auth.fullName}
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium backdrop-blur-sm"
                    placeholder={authType === 'client' ? t.auth.fullNamePlaceholder : 
                                authType === 'business' ? 'ООО "Название компании"' : t.auth.businessNamePlaceholder}
                    required
                  />
                </div>

                {authType === 'business' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        IDNO (Код предприятия)
                      </label>
                      <input
                        type="text"
                        value={formData.business_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_id: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900 font-medium backdrop-blur-sm"
                        placeholder="1234567890123"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Контактное лицо
                      </label>
                      <input
                        type="text"
                        value={formData.contact_person || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900 font-medium backdrop-blur-sm"
                        placeholder="Иван Петров"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Юридический адрес
                      </label>
                      <input
                        type="text"
                        value={formData.legal_address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, legal_address: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900 font-medium backdrop-blur-sm"
                        placeholder="г. Кишинев, ул. Штефан чел Маре, 1"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t.auth.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium backdrop-blur-sm"
                    placeholder="+373 XX XXX XXX"
                  />
                </div>

                {authType === 'pro' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t.auth.specialization}
                    </label>
                    <select className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium backdrop-blur-sm">
                      <option value="">{t.auth.selectSpecialization}</option>
                      <option value="plumbing">{t.categories.plumbing}</option>
                      <option value="electrical">{t.categories.electrical}</option>
                      <option value="cleaning">{t.categories.cleaning}</option>
                      <option value="locksmith">{t.categories.locksmith}</option>
                      <option value="painting">{t.categories.painting}</option>
                      <option value="gardening">{t.categories.gardening}</option>
                      <option value="moving">{t.categories.moving}</option>
                      <option value="repair">{t.categories.repair}</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {t.auth.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium backdrop-blur-sm"
                placeholder={t.auth.emailPlaceholder}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {t.auth.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium backdrop-blur-sm"
                placeholder={t.auth.passwordPlaceholder}
                required
              />
            </div>

            {!isLogin && authType === 'pro' && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-purple-900 text-sm">{t.auth.proVerification}</h4>
                    <p className="text-purple-700 text-xs mt-1">{t.auth.proVerificationDesc}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none ${
                authType === 'client' || authType === 'business'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
              }`}
            >
              {loading ? t.auth.loading : (isLogin ? t.auth.signin : t.auth.createAccount)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`text-sm font-semibold transition-colors ${
                authType === 'client' || authType === 'business' ? 'text-blue-600 hover:text-blue-800' : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
            </button>
          </div>

          {authType === 'business' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Регистрируясь как бизнес, вы подтверждаете правильность указанных данных
              </p>
            </div>
          )}

          {authType === 'pro' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {t.auth.proTerms}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}