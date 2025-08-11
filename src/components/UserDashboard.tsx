import React, { useState } from 'react';
import { Profile } from '../types/database';
import { useTranslation } from '../hooks/useTranslation';
import { PhotoUpload } from './PhotoUpload';
import { ChatModal } from './ChatModal';
import { NotificationCenter } from './NotificationCenter';

interface UserDashboardProps {
  user: Profile;
}

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  status: 'new' | 'accepted' | 'in_progress' | 'done';
  professional?: string;
  created_at: string;
  scheduled_at?: string;
  applications_count?: number;
}

interface Tender {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_hint: number;
  status: 'open' | 'awarded' | 'cancelled';
  created_at: string;
  deadline: string;
  bids_count: number;
  winner?: string;
}

interface Application {
  id: string;
  professional_name: string;
  professional_email: string;
  message: string;
  estimated_duration: string;
  availability: string;
  rating: number;
  price?: number;
  created_at: string;
}

interface Bid {
  id: string;
  professional_name: string;
  professional_email: string;
  price: number;
  eta_slot: string;
  warranty_days: number;
  note: string;
  rating: number;
  created_at: string;
}

export function UserDashboard({ user }: UserDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'tenders' | 'messages' | 'settings'>('overview');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<Job | null>(null);
  const [selectedTenderForBids, setSelectedTenderForBids] = useState<Tender | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [selectedJobForReview, setSelectedJobForReview] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Mock data
  const myJobs: Job[] = [
    {
      id: '1',
      title: t.jobs.fixLeakingTap,
      category: 'plumbing',
      description: 'Кран на кухне протекает уже неделю, нужно срочно починить.',
      budget_min: 200,
      budget_max: 500,
      status: 'done',
      professional: t.professionals.mikhailPetrov,
      created_at: '2025-01-10T10:00:00Z',
      scheduled_at: '2025-01-12T14:00:00Z'
    },
    {
      id: '2',
      title: t.jobs.generalCleaning,
      category: 'cleaning',
      description: 'Нужна генеральная уборка квартиры 60 кв.м.',
      budget_min: 800,
      budget_max: 1200,
      status: 'in_progress',
      professional: t.professionals.annaVolkova,
      created_at: '2025-01-08T14:30:00Z',
      scheduled_at: '2025-01-15T10:00:00Z'
    },
    {
      id: '3',
      title: t.jobs.installOutlets,
      category: 'electrical',
      description: 'Установить 4 новые розетки в спальне.',
      budget_min: 300,
      budget_max: 600,
      status: 'new',
      created_at: '2025-01-14T09:15:00Z',
      applications_count: 3
    }
  ];

  const myTenders: Tender[] = [
    {
      id: '1',
      title: t.tenders.housePainting,
      category: 'painting',
      description: 'Покраска фасада дома 120 кв.м, включая подготовку поверхности.',
      budget_hint: 5000,
      status: 'awarded',
      created_at: '2025-01-05T16:00:00Z',
      deadline: '2025-01-20T23:59:59Z',
      bids_count: 7,
      winner: t.professionals.elenaSmirnova
    },
    {
      id: '2',
      title: t.tenders.landscapeDesign,
      category: 'gardening',
      description: 'Создание ландшафтного дизайна участка 10 соток.',
      budget_hint: 8000,
      status: 'open',
      created_at: '2025-01-12T11:20:00Z',
      deadline: '2025-01-25T23:59:59Z',
      bids_count: 12
    }
  ];

  const mockApplications: Application[] = [
    {
      id: '1',
      professional_name: 'Дмитрий Козлов',
      professional_email: 'dmitry@example.com',
      message: t.applications.electricianMessage,
      estimated_duration: '2-3 часа',
      availability: 'Сегодня',
      rating: 4.9,
      price: 450,
      created_at: '2025-01-14T10:30:00Z'
    },
    {
      id: '2',
      professional_name: 'Сергей Иванов',
      professional_email: 'sergey@example.com',
      message: t.applications.quickServiceMessage,
      estimated_duration: '1-2 часа',
      availability: 'Немедленно',
      rating: 4.7,
      price: 380,
      created_at: '2025-01-14T11:15:00Z'
    }
  ];

  const mockBids: Bid[] = [
    {
      id: '1',
      professional_name: 'Елена Смирнова',
      professional_email: 'elena@example.com',
      price: 4200,
      eta_slot: 'На следующей неделе',
      warranty_days: 365,
      note: 'Использую только качественные материалы. Гарантия 1 год.',
      rating: 4.8,
      created_at: '2025-01-13T09:00:00Z'
    },
    {
      id: '2',
      professional_name: 'Андрей Петров',
      professional_email: 'andrey@example.com',
      price: 3800,
      eta_slot: 'Через 2 недели',
      warranty_days: 180,
      note: 'Быстро и качественно. Опыт работы 10 лет.',
      rating: 4.6,
      created_at: '2025-01-13T14:20:00Z'
    }
  ];

  const notifications = [
    {
      id: '1',
      type: 'job_accepted' as const,
      title: t.notifications.jobAccepted,
      message: t.notifications.jobAcceptedMessage,
      time: t.notifications.fiveMinutesAgo,
      read: false,
      avatar: '👨‍🔧',
      userEmail: 'mikhail@example.com'
    },
    {
      id: '2',
      type: 'tender_won' as const,
      title: t.notifications.tenderWon,
      message: t.notifications.tenderWonMessage,
      time: t.notifications.twoHoursAgo,
      read: true,
      avatar: '🎨',
      userEmail: 'elena@example.com'
    }
  ];

  const handleCreateJob = async (jobData: any) => {
    setLoading(true);
    try {
      console.log('Creating job:', jobData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowJobModal(false);
      alert('Заявка создана успешно!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTender = async (tenderData: any) => {
    setLoading(true);
    try {
      console.log('Creating tender:', tenderData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowTenderModal(false);
      alert('Тендер создан успешно!');
    } catch (error) {
      console.error('Error creating tender:', error);
      alert('Ошибка при создании тендера');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobDetails = (job: Job) => {
    setSelectedJobForDetails(job);
    setShowJobDetailsModal(true);
  };

  const handleLeaveReview = (job: Job) => {
    setSelectedJobForReview(job);
    setShowReviewModal(true);
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJobForApplications(job);
    setShowApplicationsModal(true);
  };

  const handleViewBids = (tender: Tender) => {
    setSelectedTenderForBids(tender);
    setShowBidsModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedJobForReview) return;
    
    setLoading(true);
    try {
      console.log('Submitting review:', {
        jobId: selectedJobForReview.id,
        rating: reviewRating,
        comment: reviewComment
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      alert('Отзыв отправлен успешно!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      awarded: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      new: t.common.new,
      accepted: t.common.accepted,
      in_progress: t.common.inProgress,
      done: t.common.done,
      open: t.common.open,
      awarded: t.common.awarded,
      cancelled: t.common.cancelled
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.welcomeBack}, {user.full_name}!</h1>
          <p className="text-gray-600 mt-2">{t.dashboard.manageRequests}</p>
          <div className="flex items-center mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              👤 {user.account_type === 'business' ? 'Бизнес' : 'Клиент'}
            </span>
            <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                ⭐ {user.rating} {t.dashboard.rating}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationCenter 
            notifications={notifications}
            onMarkAsRead={(id) => console.log('Mark as read:', id)}
            onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">{t.userDashboard.instantBooking.title}</h3>
              <p className="text-blue-100 mb-4">{t.userDashboard.instantBooking.description}</p>
              <button 
                onClick={() => setShowJobModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                {t.userDashboard.instantBooking.bookNow}
              </button>
            </div>
            <div className="text-6xl opacity-20">🔧</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">{t.userDashboard.createAuction.title}</h3>
              <p className="text-purple-100 mb-4">{t.userDashboard.createAuction.description}</p>
              <button 
                onClick={() => setShowTenderModal(true)}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                {t.userDashboard.createAuction.startAuction}
              </button>
            </div>
            <div className="text-6xl opacity-20">🎯</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: t.userDashboard.overview, icon: '📊' },
            { key: 'jobs', label: t.userDashboard.myJobs, icon: '🔧' },
            { key: 'tenders', label: t.userDashboard.myAuctions, icon: '🎯' },
            { key: 'messages', label: t.userDashboard.messages, icon: '💬' },
            { key: 'settings', label: t.userDashboard.settings, icon: '⚙️' }
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
                  <p className="text-sm font-medium text-gray-500">{t.dashboard.activeJobs}</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.filter(j => j.status !== 'done').length}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t.dashboard.completed}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t.dashboard.tenders}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t.dashboard.spent}</p>
                  <p className="text-2xl font-bold text-gray-900">2,450 {t.common.currency}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.dashboard.recentActivity}</h3>
            <div className="space-y-4">
              {[
                { type: 'job_completed', message: t.common.activity.cleaningCompleted, time: t.common.activity.twoHoursAgo, icon: '✅' },
                { type: 'application_received', message: t.common.activity.applicationReceived, time: t.common.activity.fourHoursAgo, icon: '📝' },
                { type: 'tender_awarded', message: t.common.activity.tenderAwarded, time: t.common.activity.oneDayAgo, icon: '🏆' },
                { type: 'payment_made', message: t.common.activity.paymentReceived, time: t.common.activity.twoDaysAgo, icon: '💳' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
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
              + {t.userDashboard.createRequest}
            </button>
          </div>

          <div className="grid gap-6">
            {myJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 {job.budget_min}-{job.budget_max} {t.common.currency}</span>
                      <span>📅 {formatDate(job.created_at)}</span>
                      {job.professional && <span>👨‍🔧 {job.professional}</span>}
                      {job.applications_count && <span>📝 {job.applications_count} {t.common.applications}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleViewJobDetails(job)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    style={{ 
                      pointerEvents: 'auto',
                      zIndex: 9999,
                      position: 'relative'
                    }}
                  >
                    {t.userDashboard.viewDetails}
                  </button>
                  
                  {job.status === 'done' && (
                    <button 
                      onClick={() => handleLeaveReview(job)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border-2 border-yellow-400"
                      style={{ 
                        pointerEvents: 'auto',
                        zIndex: 9999,
                        position: 'relative'
                      }}
                    >
                      ⭐ {t.userDashboard.leaveReview}
                    </button>
                  )}
                  
                  {(job.status === 'accepted' || job.status === 'in_progress') && job.professional && (
                    <button 
                      onClick={() => setShowChatModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      style={{ 
                        pointerEvents: 'auto',
                        zIndex: 9999,
                        position: 'relative'
                      }}
                    >
                      💬 {t.userDashboard.contactProfessional}
                    </button>
                  )}
                  
                  {job.status === 'new' && job.applications_count && job.applications_count > 0 && (
                    <button 
                      onClick={() => handleViewApplications(job)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      style={{ 
                        pointerEvents: 'auto',
                        zIndex: 9999,
                        position: 'relative'
                      }}
                    >
                      📋 {t.userDashboard.viewApplications}
                    </button>
                  )}
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
              + {t.userDashboard.createTender}
            </button>
          </div>

          <div className="grid gap-6">
            {myTenders.map((tender) => (
              <div key={tender.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tender.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tender.status)}`}>
                        {getStatusText(tender.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{tender.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ~{tender.budget_hint} {t.common.currency}</span>
                      <span>📅 {formatDate(tender.created_at)}</span>
                      <span>⏰ {formatDate(tender.deadline)}</span>
                      <span>🎯 {tender.bids_count} {t.common.bids}</span>
                      {tender.winner && <span>🏆 {tender.winner}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {tender.status === 'open' && tender.bids_count > 0 && (
                    <button 
                      onClick={() => handleViewBids(tender)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {t.userDashboard.viewBids}
                    </button>
                  )}
                  {tender.status === 'open' && tender.bids_count > 0 && (
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      {t.userDashboard.selectWinner}
                    </button>
                  )}
                  {tender.status === 'awarded' && tender.winner && (
                    <button 
                      onClick={() => setShowChatModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      💬 Связаться с {tender.winner}
                    </button>
                  )}
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
              Чаты создаются автоматически после принятия заявок или выбора победителя тендера
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
          <h2 className="text-xl font-semibold text-gray-900">{t.userDashboard.settings}</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.userDashboard.profileSettings}</h3>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.settings.notifications}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.userDashboard.emailNotifications}</h4>
                  <p className="text-sm text-gray-500">Получать уведомления о новых предложениях</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.userDashboard.smsNotifications}</h4>
                  <p className="text-sm text-gray-500">SMS о важных обновлениях</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t.userDashboard.pushNotifications}</h4>
                  <p className="text-sm text-gray-500">Уведомления в браузере</p>
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
                <h2 className="text-2xl font-bold text-gray-900">{t.userDashboard.bookInstantService}</h2>
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

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateJob(Object.fromEntries(formData));
            }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.serviceCategory}
                </label>
                <select name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Выберите категорию</option>
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
                  name="description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.forms.describeWork}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.minBudget} ({t.common.currency})
                  </label>
                  <input
                    type="number"
                    name="budget_min"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.maxBudget} ({t.common.currency})
                  </label>
                  <input
                    type="number"
                    name="budget_max"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.preferredDateTime}
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_at"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.problemPhotos}
                </label>
                <PhotoUpload
                  onUpload={(files) => console.log('Photos uploaded:', files)}
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
                  {loading ? t.common.creating : t.userDashboard.bookService}
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
                <h2 className="text-2xl font-bold text-gray-900">{t.userDashboard.createTender}</h2>
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

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateTender(Object.fromEntries(formData));
            }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.serviceCategory}
                </label>
                <select name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <option value="">Выберите категорию</option>
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
                  name="description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={t.forms.describeProject}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.userDashboard.budgetHint} ({t.common.currency})
                </label>
                <input
                  type="number"
                  name="budget_hint"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="5000"
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
                    name="window_from"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userDashboard.availableUntil}
                  </label>
                  <input
                    type="datetime-local"
                    name="window_to"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.projectPhotos}
                </label>
                <PhotoUpload
                  onUpload={(files) => console.log('Photos uploaded:', files)}
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

      {/* Job Details Modal */}
      {showJobDetailsModal && selectedJobForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Детали работы</h2>
                <button
                  onClick={() => setShowJobDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedJobForDetails.title}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedJobForDetails.status)}`}>
                  {getStatusText(selectedJobForDetails.status)}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Описание:</h4>
                <p className="text-gray-600">{selectedJobForDetails.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Бюджет:</h4>
                  <p className="text-gray-900 font-semibold">
                    {selectedJobForDetails.budget_min}-{selectedJobForDetails.budget_max} {t.common.currency}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Создано:</h4>
                  <p className="text-gray-600">{formatDate(selectedJobForDetails.created_at)}</p>
                </div>
              </div>

              {selectedJobForDetails.professional && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Специалист:</h4>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👨‍🔧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedJobForDetails.professional}</p>
                      <p className="text-sm text-gray-600">Рейтинг: ⭐ 4.8</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedJobForDetails.scheduled_at && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Запланировано на:</h4>
                  <p className="text-gray-600">{formatDate(selectedJobForDetails.scheduled_at)}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                {selectedJobForDetails.professional && (
                  <button 
                    onClick={() => {
                      setShowJobDetailsModal(false);
                      setShowChatModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    💬 Связаться со специалистом
                  </button>
                )}
                <button
                  onClick={() => setShowJobDetailsModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedJobForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Оставить отзыв</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{selectedJobForReview.title}</h3>
                <p className="text-sm text-gray-600">Специалист: {selectedJobForReview.professional}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Оценка:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition-colors ${
                        star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Расскажите о качестве работы..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Отправка...' : 'Отправить отзыв'}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedJobForApplications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Заявки специалистов</h2>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedJobForApplications.title}</h3>
                <p className="text-gray-600">Получено заявок: {mockApplications.length}</p>
              </div>

              <div className="space-y-6">
                {mockApplications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👨‍🔧</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{application.professional_name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {application.rating}</span>
                            <span>•</span>
                            <span>💰 {application.price} лей</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(application.created_at)}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-3">{application.message}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Время выполнения:</span>
                          <span className="ml-2 text-gray-600">{application.estimated_duration}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Доступность:</span>
                          <span className="ml-2 text-gray-600">{application.availability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        ✅ Выбрать
                      </button>
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        💬 Написать
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        👤 Профиль
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bids Modal */}
      {showBidsModal && selectedTenderForBids && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Предложения по тендеру</h2>
                <button
                  onClick={() => setShowBidsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 z-[10000]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTenderForBids.title}</h3>
                <p className="text-gray-600">Получено предложений: {mockBids.length}</p>
              </div>

              <div className="space-y-6">
                {mockBids.map((bid) => (
                  <div key={bid.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎨</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{bid.professional_name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {bid.rating}</span>
                            <span>•</span>
                            <span className="font-bold text-purple-600">💰 {bid.price} лей</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(bid.created_at)}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-3">{bid.note}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Начало работ:</span>
                          <span className="ml-2 text-gray-600">{bid.eta_slot}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Гарантия:</span>
                          <span className="ml-2 text-gray-600">{bid.warranty_days} дней</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        🏆 Выбрать победителем
                      </button>
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        💬 Написать
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        👤 Профиль
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}