import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Profile } from '../types/database';
import { NotificationCenter } from './NotificationCenter';
import { ChatModal } from './ChatModal';
import { PhotoUpload } from './PhotoUpload';

interface UserDashboardProps {
  user: Profile;
}

interface Job {
  id: string;
  title: string;
  category: string;
  status: 'new' | 'offered' | 'accepted' | 'in_progress' | 'done' | 'disputed' | 'cancelled';
  price_min: number;
  price_max: number;
  created_at: string;
  professional?: string;
  applications?: number;
}

interface Tender {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'bafo' | 'awarded' | 'cancelled' | 'expired';
  budget_hint: number;
  created_at: string;
  bids_count: number;
  best_bid?: number;
  winner?: string;
}

interface Notification {
  id: string;
  type: 'job_accepted' | 'tender_won' | 'new_job' | 'tender_available' | 'payment_received' | 'review_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  userEmail?: string;
}

export function UserDashboard({ user }: UserDashboardProps) {
  const { t, language } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'tenders' | 'messages' | 'settings'>('overview');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<Job | null>(null);
  const [selectedTenderForBids, setSelectedTenderForBids] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobPhotos, setJobPhotos] = useState<File[]>([]);
  const [tenderPhotos, setTenderPhotos] = useState<File[]>([]);
  const [jobFormData, setJobFormData] = useState({
    category: '',
    description: '',
    minBudget: '',
    maxBudget: '',
    preferredDateTime: ''
  });
  const [tenderFormData, setTenderFormData] = useState({
    category: '',
    description: '',
    budgetHint: '',
    availableFrom: '',
    availableUntil: ''
  });
  
  // Mock data для клиента
  const myJobs: Job[] = [
    {
      id: '1',
      title: t.jobs.fixLeakingTap,
      category: 'plumbing',
      status: 'accepted',
      price_min: 200,
      price_max: 500,
      created_at: '2025-01-14T10:00:00Z',
      professional: t.professionals.mikhailPetrov,
      applications: 3
    },
    {
      id: '2',
      title: t.jobs.generalCleaning,
      category: 'cleaning',
      status: 'done',
      price_min: 800,
      price_max: 1200,
      created_at: '2025-01-12T14:30:00Z',
      professional: t.professionals.annaVolkova,
      applications: 5
    },
    {
      id: '3',
      title: t.jobs.installOutlets,
      category: 'electrical',
      status: 'new',
      price_min: 300,
      price_max: 600,
      created_at: '2025-01-13T09:15:00Z',
      applications: 2
    }
  ];

  const myTenders: Tender[] = [
    {
      id: '1',
      title: t.tenders.housePainting,
      category: 'painting',
      status: 'awarded',
      budget_hint: 5000,
      created_at: '2025-01-10T16:00:00Z',
      bids_count: 8,
      best_bid: 4200,
      winner: t.professionals.elenaSmirnova
    },
    {
      id: '2',
      title: t.tenders.landscapeDesign,
      category: 'gardening',
      status: 'open',
      budget_hint: 8000,
      created_at: '2025-01-12T11:20:00Z',
      bids_count: 5,
      best_bid: 6800
    }
  ];

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'job_accepted',
      title: t.notifications.jobAccepted,
      message: t.notifications.jobAcceptedMessage,
      time: t.notifications.fiveMinutesAgo,
      read: false,
      userEmail: 'mikhail@example.com'
    },
    {
      id: '2',
      type: 'tender_won',
      title: t.notifications.tenderWon,
      message: t.notifications.tenderWonMessage,
      time: t.notifications.twoHoursAgo,
      read: false,
      userEmail: 'elena@example.com'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t.language === 'ro' ? 'ro-RO' : 'ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      offered: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-gray-100 text-gray-800',
      disputed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
      open: 'bg-green-100 text-green-800',
      bafo: 'bg-orange-100 text-orange-800',
      awarded: 'bg-purple-100 text-purple-800',
      expired: 'bg-gray-100 text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return t.common[status as keyof typeof t.common] || status;
  };

  const handleCreateJob = async (jobData: any) => {
    setLoading(true);
    try {
      const newJob: Job = {
        id: Date.now().toString(),
        title: `${jobFormData.category} - ${jobFormData.description.substring(0, 50)}...`,
        category: jobFormData.category,
        status: 'new',
        price_min: parseInt(jobFormData.minBudget) || 0,
        price_max: parseInt(jobFormData.maxBudget) || 0,
        created_at: new Date().toISOString(),
        applications: 0
      };
      
      console.log('Creating job:', newJob, 'Photos:', jobPhotos);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сброс формы
      setJobFormData({
        category: '',
        description: '',
        minBudget: '',
        maxBudget: '',
        preferredDateTime: ''
      });
      setJobPhotos([]);
      setShowJobModal(false);
      
      console.log('Job created successfully:', newJob);
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTender = async (tenderData: any) => {
    setLoading(true);
    try {
      const newTender: Tender = {
        id: Date.now().toString(),
        title: `${tenderFormData.category} - ${tenderFormData.description.substring(0, 50)}...`,
        category: tenderFormData.category,
        status: 'open',
        budget_hint: parseInt(tenderFormData.budgetHint) || 0,
        created_at: new Date().toISOString(),
        bids_count: 0
      };
      
      console.log('Creating tender:', newTender, 'Photos:', tenderPhotos);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сброс формы
      setTenderFormData({
        category: '',
        description: '',
        budgetHint: '',
        availableFrom: '',
        availableUntil: ''
      });
      setTenderPhotos([]);
      setShowTenderModal(false);
      
      console.log('Tender created successfully');
    } catch (error) {
      console.error('Error creating tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
  };

  const markNotificationAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
  };

  const handleViewApplications = (job: Job) => {
    console.log('Viewing applications for job:', job.id);
    setSelectedJobForApplications(job);
    setShowApplicationsModal(true);
  };

  const handleViewBids = (tender: Tender) => {
    console.log('Viewing bids for tender:', tender.id);
    setSelectedTenderForBids(tender);
    setShowBidsModal(true);
  };

  const handleContactProfessional = () => {
    console.log('Opening chat with professional');
    setShowChatModal(true);
  };

  const handleLeaveReview = (jobId: string) => {
    console.log('Opening review form for job:', jobId);
    // Здесь можно добавить модальное окно для отзыва
  };

  const handleViewJobDetails = (jobId: string) => {
    console.log('Viewing job details:', jobId);
    // Здесь можно добавить модальное окно с деталями работы
  };

  const handleViewTenderDetails = (tenderId: string) => {
    console.log('Viewing tender details:', tenderId);
    // Здесь можно добавить модальное окно с деталями тендера
  };

  const handleActivityClick = (activity: any) => {
    console.log('Activity clicked:', activity);
    if (activity.actionable) {
      // Здесь можно добавить специфичную логику для каждого типа активности
      switch (activity.type) {
        case 'job_application':
          console.log('Opening job applications');
          break;
        case 'tender_bid':
          console.log('Opening tender bids');
          break;
        default:
          console.log('Default activity action');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.welcomeBack}, {user.full_name}!</h1>
            <p className="text-gray-600 mt-2">{t.dashboard.manageRequests}</p>
            <div className="flex items-center mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                👤 {user.account_type === 'business' ? (language === 'ro' ? 'Business' : 'Бизнес') : t.auth.client}
              </span>
              <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  ⭐ {user.rating} {t.dashboard.rating}
                </span>
                <span className="flex items-center">
                  ✅ {t.dashboard.verified}
                </span>
              </div>
            </div>
          </div>
          <NotificationCenter 
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onNotificationClick={handleNotificationClick}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: language === 'ro' ? 'Prezentare generală' : 'Обзор', icon: '📊' },
            { key: 'jobs', label: language === 'ro' ? 'Lucrările Mele' : 'Мои Работы', icon: '🔧' },
            { key: 'tenders', label: language === 'ro' ? 'Licitațiile Mele' : 'Мои Тендеры', icon: '🎯' },
            { key: 'messages', label: language === 'ro' ? 'Mesaje' : 'Сообщения', icon: '💬' },
            { key: 'settings', label: language === 'ro' ? 'Setări' : 'Настройки', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ro' ? 'Rezervare Instantă' : 'Быстрый Заказ'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'ro' ? 'Conectează-te cu profesioniști disponibili imediat.' : 'Найдите доступных специалистов прямо сейчас.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowJobModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  position: 'relative'
                }}
              >
                {language === 'ro' ? 'Rezervă Acum' : 'Забронировать Сейчас'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ro' ? 'Creează Licitație' : 'Создать Тендер'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'ro' ? 'Lasă profesioniștii să concureze pentru proiectul tău.' : 'Позвольте специалистам конкурировать за ваш проект.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowTenderModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  position: 'relative'
                }}
              >
                {language === 'ro' ? 'Începe Licitația' : 'Создать Тендер'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{language === 'ro' ? 'Lucrări Active' : 'Активные Работы'}</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.filter(j => j.status !== 'done' && j.status !== 'cancelled').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{language === 'ro' ? 'Finalizate' : 'Завершенные'}</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.filter(j => j.status === 'done').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{language === 'ro' ? 'Licitații' : 'Тендеры'}</p>
                  <p className="text-2xl font-bold text-gray-900">{myTenders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{language === 'ro' ? 'Cheltuit' : 'Потрачено'}</p>
                  <p className="text-2xl font-bold text-gray-900">3,200 лей</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {language === 'ro' ? 'Activitate Recenta' : 'Недавняя активность'}
            </h3>
            <div className="space-y-4">
              {[
                {
                  type: 'job_application',
                  title: language === 'ro' ? 'Cerere primita pentru instalarea prizelor' : 'Получена заявка на установку розеток',
                  message: language === 'ro' ? 'Mihail Petrov s-a oferit sa instaleze prizele pentru 450 lei' : 'Михаил Петров предложил установить розетки за 450 лей',
                  details: language === 'ro' ? 'Disponibil astazi • Garantie 2 ani' : 'Доступен сегодня • Гарантия 2 года',
                  time: language === 'ro' ? '2 ore in urma' : '2 часа назад',
                  icon: '📧',
                  color: 'bg-blue-50 border-blue-200',
                  actionable: true
                },
                {
                  type: 'tender_bid',
                  title: language === 'ro' ? 'Oferta noua pentru licitatia de vopsire' : 'Новое предложение на тендер покраски',
                  message: language === 'ro' ? 'Elena Smirnova a oferit 4200 lei pentru vopsirea casei' : 'Елена Смирнова предложила 4200 лей за покраску дома',
                  details: language === 'ro' ? 'Garantie 3 ani • Materiale incluse' : 'Гарантия 3 года • Материалы включены',
                  time: language === 'ro' ? '4 ore in urma' : '4 часа назад',
                  icon: '🎯',
                  color: 'bg-purple-50 border-purple-200',
                  actionable: true
                },
                {
                  type: 'job_completed',
                  title: language === 'ro' ? 'Curatenie generala finalizata' : 'Генеральная уборка завершена',
                  message: language === 'ro' ? 'Ana Volkova a finalizat curatenia generala a apartamentului' : 'Анна Волкова завершила генеральную уборку квартиры',
                  details: language === 'ro' ? 'Evaluare: 5★ • Platit: 1000 lei' : 'Оценка: 5★ • Оплачено: 1000 лей',
                  time: language === 'ro' ? '1 zi in urma' : '1 день назад',
                  icon: '✅',
                  color: 'bg-green-50 border-green-200',
                  actionable: false
                },
                {
                  type: 'payment_processed',
                  title: language === 'ro' ? 'Plata procesata pentru instalatii electrice' : 'Платеж обработан за электромонтаж',
                  message: language === 'ro' ? 'Plata automata catre Dmitri Kozlov pentru instalatii electrice' : 'Автоматический платеж Дмитрию Козлову за электромонтаж',
                  details: language === 'ro' ? 'Suma: 720 lei • Card *4532' : 'Сумма: 720 лей • Карта *4532',
                  time: language === 'ro' ? '2 zile in urma' : '2 дня назад',
                  icon: '💳',
                  color: 'bg-gray-50 border-gray-200',
                  actionable: false
                }
              ].map((activity, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border transition-all duration-200 ${activity.color} ${
                    activity.actionable ? 'hover:shadow-md cursor-pointer' : ''
                  }`}
                  onClick={activity.actionable ? () => handleActivityClick(activity) : undefined}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                        {activity.actionable && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {language === 'ro' ? 'Necesita actiune' : 'Требует действия'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{activity.message}</p>
                      <p className="text-gray-500 text-xs mb-2">{activity.details}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        {activity.actionable && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityClick(activity);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                          >
                            {language === 'ro' ? 'Vezi detalii →' : 'Подробнее →'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t.userDashboard.myJobs}</h2>
            <button 
              onClick={() => setShowJobModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t.userDashboard.createRequest}
            </button>
          </div>

          <div className="grid gap-6">
            {myJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>💰 {job.price_min}-{job.price_max} {t.common.currency}</span>
                      <span>📅 {formatDate(job.created_at)}</span>
                      {job.applications && (
                        <span>👥 {job.applications} {t.common.applications}</span>
                      )}
                    </div>
                    {job.professional && (
                      <p className="text-sm text-gray-600">
                        {t.common.professional}: <span className="font-medium">{job.professional}</span>
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </div>

                <div className="flex space-x-3">
                  {job.status === 'new' && (
                    <button 
                      onClick={() => handleViewApplications(job)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.userDashboard.viewApplications}
                    </button>
                  )}
                  {job.status === 'accepted' && (
                    <button 
                      onClick={handleContactProfessional}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.userDashboard.contactProfessional}
                    </button>
                  )}
                  {job.status === 'done' && (
                    <button 
                      onClick={() => handleLeaveReview(job.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.userDashboard.leaveReview}
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewJobDetails(job.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.userDashboard.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenders Tab */}
      {activeTab === 'tenders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t.userDashboard.myAuctions}</h2>
            <button 
              onClick={() => setShowTenderModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t.userDashboard.createTender}
            </button>
          </div>

          <div className="grid gap-6">
            {myTenders.map((tender) => (
              <div key={tender.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tender.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>💰 ~{tender.budget_hint} {t.common.currency}</span>
                      <span>📅 {formatDate(tender.created_at)}</span>
                      <span>🎯 {tender.bids_count} {t.common.bids}</span>
                    </div>
                    {tender.best_bid && (
                      <p className="text-sm text-green-600 font-medium">
                        {t.common.bestBid}: {tender.best_bid} {t.common.currency}
                      </p>
                    )}
                    {tender.winner && (
                      <p className="text-sm text-gray-600">
                        {t.common.winner}: <span className="font-medium">{tender.winner}</span>
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tender.status)}`}>
                    {getStatusText(tender.status)}
                  </span>
                </div>

                <div className="flex space-x-3">
                  {tender.status === 'open' && (
                    <button 
                      onClick={() => handleViewBids(tender)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.userDashboard.viewBids}
                    </button>
                  )}
                  {tender.status === 'awarded' && (
                    <button 
                      onClick={handleContactProfessional}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.userDashboard.contactProfessional}
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewTenderDetails(tender.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.userDashboard.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t.userDashboard.messages}</h2>
            <button 
              onClick={() => setShowChatModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              💬 Открыть чаты
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Сообщения с специалистами</h3>
            <p className="text-gray-600 mb-4">
              Чаты создаются автоматически после принятия заявок или выбора победителей тендеров
            </p>
            <button 
              onClick={() => setShowChatModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Открыть чаты
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">{t.settings.profileSettings}</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Основная информация</h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                  <input
                    type="text"
                    defaultValue={user.full_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    defaultValue={user.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.address}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.settings.addressPlaceholder}
                />
              </div>

              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  {t.settings.saveChanges}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.settings.notifications}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.settings.emailNotifications}</h4>
                  <p className="text-sm text-gray-500">{t.settings.emailNotificationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.settings.smsNotifications}</h4>
                  <p className="text-sm text-gray-500">{t.settings.smsNotificationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.settings.pushNotifications}</h4>
                  <p className="text-sm text-gray-500">{t.settings.pushNotificationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Creation Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t.forms.createJobRequest}</h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateJob({}); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.serviceCategory}
                </label>
                <select 
                  value={jobFormData.category}
                  onChange={(e) => setJobFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.description}
                </label>
                <textarea
                  rows={4}
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.forms.describeWork}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.minBudget} ({t.common.currency})
                  </label>
                  <input
                    type="number"
                    value={jobFormData.minBudget}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, minBudget: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.maxBudget} ({t.common.currency})
                  </label>
                  <input
                    type="number"
                    value={jobFormData.maxBudget}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, maxBudget: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.preferredDateTime}
                </label>
                <input
                  type="datetime-local"
                  value={jobFormData.preferredDateTime}
                  onChange={(e) => setJobFormData(prev => ({ ...prev, preferredDateTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.problemPhotos}
                </label>
                <PhotoUpload
                  onUpload={setJobPhotos}
                  maxFiles={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? t.common.creating : t.forms.createRequest}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {t.userDashboard.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tender Creation Modal */}
      {showTenderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t.forms.createTender}</h2>
                <button
                  onClick={() => setShowTenderModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateTender({}); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.serviceCategory}
                </label>
                <select 
                  value={tenderFormData.category}
                  onChange={(e) => setTenderFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.projectDescription}
                </label>
                <textarea
                  rows={4}
                  value={tenderFormData.description}
                  onChange={(e) => setTenderFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={t.forms.describeProject}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.budgetHint} ({t.common.currency})
                </label>
                <input
                  type="number"
                  value={tenderFormData.budgetHint}
                  onChange={(e) => setTenderFormData(prev => ({ ...prev, budgetHint: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="5000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t.userDashboard.budgetHintNote}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.availableFrom}
                  </label>
                  <input
                    type="datetime-local"
                    value={tenderFormData.availableFrom}
                    onChange={(e) => setTenderFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.availableUntil}
                  </label>
                  <input
                    type="datetime-local"
                    value={tenderFormData.availableUntil}
                    onChange={(e) => setTenderFormData(prev => ({ ...prev, availableUntil: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.projectPhotos}
                </label>
                <PhotoUpload
                  onUpload={setTenderPhotos}
                  maxFiles={8}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? t.common.creating : t.userDashboard.createTender}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTenderModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {t.userDashboard.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal 
          user={user}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Applications Modal Placeholder */}
      {showApplicationsModal && selectedJobForApplications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Заявки специалистов</h2>
                <button
                  onClick={() => {
                    setShowApplicationsModal(false);
                    setSelectedJobForApplications(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Работа: {selectedJobForApplications.title}</p>
              <p className="text-gray-500">Здесь будут отображаться заявки от специалистов...</p>
            </div>
          </div>
        </div>
      )}

      {/* Bids Modal Placeholder */}
      {showBidsModal && selectedTenderForBids && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Предложения специалистов</h2>
                <button
                  onClick={() => {
                    setShowBidsModal(false);
                    setSelectedTenderForBids(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Тендер: {selectedTenderForBids.title}</p>
              <p className="text-gray-500">Здесь будут отображаться предложения от специалистов...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}