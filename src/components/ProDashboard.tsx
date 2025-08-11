import React, { useState } from 'react';
import { Profile } from '../types/database';
import { useTranslation } from '../hooks/useTranslation';
import { BidModal } from './BidModal';
import { JobApplicationModal } from './JobApplicationModal';
import { PhotoModal } from './PhotoModal';
import { ChatModal } from './ChatModal';

interface ProDashboardProps {
  user: Profile;
}

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  location: string;
  distance: string;
  created_at: string;
  urgent: boolean;
  photos?: string[];
}

interface Tender {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_hint: number;
  location: string;
  created_at: string;
  deadline: string;
  bids_count: number;
  photos?: string[];
}

interface MyJob {
  id: string;
  title: string;
  client: string;
  status: 'accepted' | 'in_progress' | 'done';
  price: number;
  created_at: string;
  deadline?: string;
}

export function ProDashboard({ user }: ProDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'tenders' | 'wallet' | 'profile'>('overview');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [photoModal, setPhotoModal] = useState<{ photos: string[]; currentIndex: number } | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Mock data для специалиста
  const availableJobs: Job[] = [
    {
      id: '1',
      title: t.language === 'ro' ? 'Repară robinetul care curge din bucătărie' : 'Починить протекающий кран на кухне',
      category: 'plumbing',
      description: t.language === 'ro' ? 'Robinetul din bucătărie curge de o săptămână, trebuie reparat urgent. Posibil să fie nevoie de înlocuirea garniturilor sau a robinetului.' : 'Кран на кухне протекает уже неделю, нужно срочно починить. Возможно потребуется замена прокладок или самого крана.',
      budget_min: 200,
      budget_max: 500,
      location: t.language === 'ro' ? 'Centru, Chișinău' : 'Центр, Кишинев',
      distance: t.language === 'ro' ? '2.3 km' : '2.3 км',
      created_at: '2025-01-14T10:00:00Z',
      urgent: true,
      photos: [
        'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      id: '2',
      title: t.language === 'ro' ? 'Curățenie generală apartament 2 camere' : 'Генеральная уборка 2-комнатной квартиры',
      category: 'cleaning',
      description: t.language === 'ro' ? 'Este necesară curățenie generală pentru apartament de 60 mp. Inclusiv spălarea geamurilor, curățenia bucătăriei și băii.' : 'Нужна генеральная уборка квартиры 60 кв.м. Включая мытье окон, уборку кухни и ванной.',
      budget_min: 800,
      budget_max: 1200,
      location: t.language === 'ro' ? 'Botanica, Chișinău' : 'Ботаника, Кишинев',
      distance: t.language === 'ro' ? '5.1 km' : '5.1 км',
      created_at: '2025-01-13T14:30:00Z',
      urgent: false,
      photos: [
        'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      id: '3',
      title: 'Установка новых розеток в спальне',
      category: 'electrical',
      description: 'Нужно установить 4 новые розетки в спальне. Проводка уже проложена, нужна только установка.',
      budget_min: 300,
      budget_max: 600,
      location: 'Рышкановка, Кишинев',
      distance: '7.8 км',
      created_at: '2025-01-12T09:15:00Z',
      urgent: false,
      photos: [
        'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ];

  const availableTenders: Tender[] = [
    {
      id: '1',
      title: 'Покраска фасада частного дома',
      category: 'painting',
      description: 'Покраска фасада дома 120 кв.м, включая подготовку поверхности, грунтовку и покраску в 2 слоя.',
      budget_hint: 5000,
      location: 'Дурлешты',
      created_at: '2025-01-12T16:00:00Z',
      deadline: '2025-01-20T23:59:59Z',
      bids_count: 7,
      photos: [
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      id: '2',
      title: 'Ландшафтный дизайн приусадебного участка',
      category: 'gardening',
      description: 'Создание ландшафтного дизайна участка 10 соток с посадкой растений, устройством газона и дорожек.',
      budget_hint: 8000,
      location: 'Ватра',
      created_at: '2025-01-10T11:20:00Z',
      deadline: '2025-01-25T23:59:59Z',
      bids_count: 12,
      photos: [
        'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ];

  const myJobs: MyJob[] = [
    {
      id: '1',
      title: 'Замена водонагревателя',
      client: 'Мария Петрова',
      status: 'in_progress',
      price: 800,
      created_at: '2025-01-13T10:00:00Z',
      deadline: '2025-01-16T18:00:00Z'
    },
    {
      id: '2',
      title: 'Установка смесителя в ванной',
      client: 'Андрей Козлов',
      status: 'done',
      price: 350,
      created_at: '2025-01-10T14:30:00Z'
    }
  ];

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
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      accepted: 'Принята',
      in_progress: 'В работе',
      done: 'Завершена'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      plumbing: '🔧',
      electrical: '⚡',
      cleaning: '🧹',
      locksmith: '🔐',
      painting: '🎨',
      gardening: '🌱',
      moving: '📦',
      repair: '🛠️'
    };
    return icons[category as keyof typeof icons] || '🔧';
  };

  const openPhotoModal = (photos: string[], index: number = 0) => {
    setPhotoModal({ photos, currentIndex: index });
  };

  const closePhotoModal = () => {
    setPhotoModal(null);
  };

  const nextPhoto = () => {
    if (photoModal) {
      setPhotoModal({
        ...photoModal,
        currentIndex: (photoModal.currentIndex + 1) % photoModal.photos.length
      });
    }
  };

  const prevPhoto = () => {
    if (photoModal) {
      setPhotoModal({
        ...photoModal,
        currentIndex: photoModal.currentIndex === 0 ? photoModal.photos.length - 1 : photoModal.currentIndex - 1
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.welcomeBack}, {user.full_name}!</h1>
        <p className="text-gray-600 mt-2">Находите новые заказы и управляйте своим бизнесом</p>
        <div className="flex items-center mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            🔧 Специалист
          </span>
          <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              ⭐ {user.rating} рейтинг
            </span>
            <span className="flex items-center">
              ✅ Проверен
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Обзор', icon: '📊' },
            { key: 'jobs', label: 'Доступные работы', icon: '🔧' },
            { key: 'tenders', label: 'Тендеры', icon: '🎯' },
            { key: 'messages', label: 'Сообщения', icon: '💬' },
            { key: 'wallet', label: 'Кошелек', icon: '💰' },
            { key: 'profile', label: 'Профиль', icon: '👤' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600'
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
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Активные работы</p>
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
                  <p className="text-sm font-medium text-gray-500">Завершено</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.filter(j => j.status === 'done').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Доступно работ</p>
                  <p className="text-2xl font-bold text-gray-900">{availableJobs.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Заработано</p>
                  <p className="text-2xl font-bold text-gray-900">3,200 лей</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Active Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои активные работы</h3>
            <div className="space-y-4">
              {myJobs.filter(job => job.status !== 'done').map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">Клиент: {job.client}</p>
                    <p className="text-sm text-gray-500">Создано: {formatDate(job.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                    {(job.status === 'accepted' || job.status === 'in_progress') && (
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        💬 Чат
                      </button>
                    )}
                    <span className="font-bold text-gray-900">{job.price} лей</span>
                  </div>
                </div>
              ))}
              {myJobs.filter(job => job.status !== 'done').length === 0 && (
                <p className="text-gray-500 text-center py-8">Нет активных работ</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
            <div className="space-y-4">
              {[
                { type: 'job_completed', message: 'Завершена установка смесителя', time: '2 часа назад', icon: '✅' },
                { type: 'bid_submitted', message: 'Подана заявка на тендер покраски', time: '4 часа назад', icon: '🎯' },
                { type: 'job_started', message: 'Начата замена водонагревателя', time: '1 день назад', icon: '🔧' },
                { type: 'payment_received', message: 'Получен платеж за сантехнические работы', time: '2 дня назад', icon: '💰' }
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

      {/* Available Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Доступные работы в вашем районе</h2>
            <div className="flex space-x-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <option value="">Все категории</option>
                <option value="plumbing">Сантехника</option>
                <option value="electrical">Электрика</option>
                <option value="cleaning">Уборка</option>
                <option value="painting">Покраска</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6">
            {availableJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(job.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      {job.urgent && (
                        <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">
                          СРОЧНО
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {job.location} ({job.distance})</span>
                      <span>📅 {formatDate(job.created_at)}</span>
                      <span className="font-medium text-green-600">💰 {job.budget_min}-{job.budget_max} лей</span>
                    </div>
                  </div>
                </div>

                {job.photos && job.photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Фото от клиента:</p>
                    <div className="flex space-x-2">
                      {job.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openPhotoModal(job.photos!, index)}
                          onError={(e) => {
                            console.error('Failed to load photo:', photo);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                      {job.photos.length > 3 && (
                        <div 
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => openPhotoModal(job.photos!, 3)}
                        >
                          +{job.photos.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplicationModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Откликнуться
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Подробности
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
            <h2 className="text-xl font-semibold text-gray-900">Доступные тендеры</h2>
            <p className="text-gray-600">Делайте ставки на проекты и выигрывайте больше работы</p>
          </div>

          <div className="grid gap-6">
            {availableTenders.map((tender) => (
              <div key={tender.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(tender.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{tender.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{tender.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {tender.location}</span>
                      <span>📅 {formatDate(tender.created_at)}</span>
                      <span>⏰ До {formatDate(tender.deadline)}</span>
                      <span className="font-medium text-purple-600">💰 ~{tender.budget_hint} лей</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{tender.bids_count} предложений</p>
                  </div>
                </div>

                {tender.photos && tender.photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Фото проекта:</p>
                    <div className="flex space-x-2">
                      {tender.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openPhotoModal(tender.photos!, index)}
                          onError={(e) => {
                            console.error('Failed to load photo:', photo);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                      {tender.photos.length > 3 && (
                        <div 
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => openPhotoModal(tender.photos!, 3)}
                        >
                          +{tender.photos.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedTender(tender);
                      setShowBidModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    style={{ 
                      pointerEvents: 'auto',
                      zIndex: 9999,
                      position: 'relative'
                    }}
                  >
                    Сделать предложение
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Подробности тендера: ${tender.title}\nБюджет: ~${tender.budget_hint} лей\nПредложений: ${tender.bids_count}\nДедлайн: ${formatDate(tender.deadline)}`);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    style={{ 
                      pointerEvents: 'auto',
                      zIndex: 9999,
                      position: 'relative'
                    }}
                  >
                    Подробности
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
            <h2 className="text-xl font-semibold text-gray-900">Сообщения с клиентами</h2>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Чаты с клиентами</h3>
            <p className="text-gray-600 mb-4">
              Чаты создаются автоматически после принятия заявок или выигрыша тендеров
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

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Кошелек</h2>
          
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Баланс кошелька</h3>
            <p className="text-3xl font-bold mb-4">2,450 лей</p>
            <div className="flex space-x-4">
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Вывести средства
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors border border-white/20">
                История
              </button>
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ожидающие доходы</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">От текущих работ</span>
              <span className="text-xl font-bold text-gray-900">800 лей</span>
            </div>
            <p className="text-sm text-gray-500">Средства будут доступны после завершения работы</p>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние транзакции</h3>
            <div className="space-y-4">
              {[
                { type: 'earning', description: 'Оплата за установку смесителя', amount: +350, date: '2025-01-10' },
                { type: 'fee', description: 'Комиссия платформы (5%)', amount: -17.5, date: '2025-01-10' },
                { type: 'earning', description: 'Оплата за сантехнические работы', amount: +600, date: '2025-01-08' },
                { type: 'withdrawal', description: 'Вывод средств на карту', amount: -1000, date: '2025-01-05' }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'earning' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'fee' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'earning' ? '💰' : 
                       transaction.type === 'fee' ? '📊' : '🏦'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} лей
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Профессиональный профиль</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Основная информация</h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                  <input
                    type="text"
                    defaultValue={user.full_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    defaultValue={user.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категории услуг</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'plumbing', label: 'Сантехника' },
                    { key: 'electrical', label: 'Электрика' },
                    { key: 'cleaning', label: 'Уборка' },
                    { key: 'painting', label: 'Покраска' },
                    { key: 'locksmith', label: 'Слесарь' },
                    { key: 'gardening', label: 'Садоводство' },
                    { key: 'moving', label: 'Переезд' },
                    { key: 'repair', label: 'Ремонт' }
                  ].map((category) => (
                    <label key={category.key} className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={category.key === 'plumbing'}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Радиус обслуживания (км)</label>
                <input
                  type="number"
                  defaultValue="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Максимальное расстояние, которое вы готовы преодолеть</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Профессиональная биография</label>
                <textarea
                  rows={4}
                  defaultValue="Опытный сантехник с 8-летним стажем. Специализируюсь на установке и ремонте сантехнического оборудования, устранении протечек, замене труб. Работаю качественно и в срок."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Расскажите клиентам о своем опыте и экспертизе..."
                />
              </div>

              <div className="flex space-x-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Обновить профиль
                </button>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Статус верификации</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Верификация личности</p>
                    <p className="text-sm text-green-700">Документы проверены</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Подтверждено</span>
              </div>

              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">Проверка биографии</p>
                    <p className="text-sm text-yellow-700">В процессе проверки</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-medium">В ожидании</span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Страхование</p>
                    <p className="text-sm text-gray-600">Не подключено</p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-800 font-medium">Подключить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showBidModal && selectedTender && (
        <BidModal
          tenderId={selectedTender.id}
          onClose={() => {
            setShowBidModal(false);
            setSelectedTender(null);
          }}
          onSubmit={(bidData) => {
            console.log('Submitting bid:', bidData);
            setShowBidModal(false);
            setSelectedTender(null);
          }}
        />
      )}

      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          jobId={selectedJob.id}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSubmit={(applicationData) => {
            console.log('Submitting application:', applicationData);
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      {photoModal && (
        <PhotoModal
          photos={photoModal.photos}
          currentIndex={photoModal.currentIndex}
          onClose={closePhotoModal}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
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