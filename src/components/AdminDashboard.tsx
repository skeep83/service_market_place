import React, { useState } from 'react';
import { Profile } from '../types/database';
import { useTranslation } from '../hooks/useTranslation';
import { Gravatar } from '../lib/gravatar.tsx';

interface AdminDashboardProps {
  user: Profile;
}

interface AdminStats {
  totalUsers: number;
  totalPros: number;
  totalJobs: number;
  totalTenders: number;
  totalRevenue: number;
  activeJobs: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'pro' | 'admin';
  rating: number;
  created_at: string;
  status: 'active' | 'suspended' | 'pending';
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'finances' | 'settings'>('overview');

  // Mock admin stats
  const stats: AdminStats = {
    totalUsers: 1247,
    totalPros: 389,
    totalJobs: 2156,
    totalTenders: 567,
    totalRevenue: 125000,
    activeJobs: 89
  };

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      full_name: 'John Smith',
      email: 'john@example.com',
      role: 'user',
      rating: 4.8,
      created_at: '2025-01-10T10:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      full_name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'pro',
      rating: 4.9,
      created_at: '2025-01-08T14:30:00Z',
      status: 'active'
    },
    {
      id: '3',
      full_name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'pro',
      rating: 4.7,
      created_at: '2025-01-05T09:15:00Z',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      user: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Админ Панель</h1>
        <p className="text-gray-600 mt-2">Управление платформой ServiceHub</p>
        <div className="flex items-center mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            👑 Администратор
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Обзор', icon: '📊' },
            { key: 'users', label: 'Пользователи', icon: '👥' },
            { key: 'jobs', label: 'Работы', icon: '🔧' },
            { key: 'finances', label: 'Финансы', icon: '💰' },
            { key: 'settings', label: 'Настройки', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600'
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего пользователей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Профессионалов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPros.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего работ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Аукционов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTenders.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Общий доход</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Активные работы</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
            <div className="space-y-4">
              {[
                { type: 'user_registered', user: 'John Smith', time: '5 минут назад', icon: '👤' },
                { type: 'job_completed', user: 'Mike Johnson', time: '15 минут назад', icon: '✅' },
                { type: 'payment_processed', user: 'Sarah Wilson', time: '1 час назад', icon: '💳' },
                { type: 'dispute_resolved', user: 'Admin', time: '2 часа назад', icon: '⚖️' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Управление пользователями</h2>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option value="">Все роли</option>
                <option value="user">Пользователи</option>
                <option value="pro">Профессионалы</option>
                <option value="admin">Администраторы</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Рейтинг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Gravatar
                          email={user.email}
                          size={40}
                          defaultImage="identicon"
                          alt={user.full_name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.rating} ⭐
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Редактировать</button>
                        <button className="text-red-600 hover:text-red-900">Заблокировать</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление работами</h3>
          <p className="text-gray-600">Здесь будет список всех работ и возможность управления ими.</p>
        </div>
      )}

      {/* Finances Tab */}
      {activeTab === 'finances' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансовая отчетность</h3>
          <p className="text-gray-600">Здесь будет финансовая статистика и отчеты.</p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Настройки платформы</h3>
          
          <div className="space-y-8">
            {/* Platform Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Основные настройки</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название платформы</label>
                  <input
                    type="text"
                    defaultValue="ServiceHub"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Комиссия платформы (%)</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Настройки платежей</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Автоматические выплаты</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Минимальная сумма вывода (лей)</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Период удержания (дни)</label>
                    <input
                      type="number"
                      defaultValue="7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Уведомления</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email уведомления администраторам</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">SMS уведомления о спорах</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Состояние системы</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-2xl text-green-600 mb-2">✅</div>
                <h4 className="font-medium text-gray-900">База данных</h4>
                <p className="text-sm text-green-600">Работает нормально</p>
              </div>
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-2xl text-green-600 mb-2">✅</div>
                <h4 className="font-medium text-gray-900">API</h4>
                <p className="text-sm text-green-600">Все сервисы доступны</p>
              </div>
              <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="text-2xl text-yellow-600 mb-2">⚠️</div>
                <h4 className="font-medium text-gray-900">Платежи</h4>
                <p className="text-sm text-yellow-600">Небольшая задержка</p>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Системные логи</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <div>[2025-01-15 14:30:25] INFO: User registration completed - ID: 12847</div>
              <div>[2025-01-15 14:29:18] INFO: Payment processed - Amount: 250 MDL</div>
              <div>[2025-01-15 14:28:45] WARN: High API usage detected - Rate: 95%</div>
              <div>[2025-01-15 14:27:32] INFO: Job completed - ID: 5634</div>
              <div>[2025-01-15 14:26:15] INFO: New professional verified - ID: 892</div>
              <div>[2025-01-15 14:25:03] ERROR: Failed payment attempt - Card declined</div>
              <div>[2025-01-15 14:24:21] INFO: Tender created - ID: 1247</div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Обслуживание</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Резервное копирование</h4>
                <p className="text-sm text-gray-600 mb-3">Последнее: 15.01.2025 в 03:00</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Создать резервную копию
                </button>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Очистка кэша</h4>
                <p className="text-sm text-gray-600 mb-3">Размер кэша: 2.4 GB</p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Очистить кэш
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}