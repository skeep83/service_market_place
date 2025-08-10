import React, { useState } from 'react';
import { Gravatar } from '../lib/gravatar.tsx';

interface Notification {
  id: string;
  type: 'job_accepted' | 'tender_won' | 'new_job' | 'tender_available' | 'payment_received' | 'review_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar: string;
  jobId?: string;
  tenderId?: string;
  userEmail?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onNotificationClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    // Здесь можно добавить логику для обработки клика по уведомлению
    // Например, переход к соответствующей работе или тендеру
  };

  const markNotificationAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
    // Здесь можно добавить логику для отметки уведомления как прочитанного
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      job_accepted: '✅',
      tender_won: '🏆',
      new_job: '🔔',
      tender_available: '🎯',
      payment_received: '💰',
      review_received: '⭐'
    };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      job_accepted: 'bg-green-50 border-green-200',
      tender_won: 'bg-yellow-50 border-yellow-200',
      new_job: 'bg-blue-50 border-blue-200',
      tender_available: 'bg-purple-50 border-purple-200',
      payment_received: 'bg-emerald-50 border-emerald-200',
      review_received: 'bg-orange-50 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4M9 9h6m-6 4h6" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Уведомления</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} непрочитанных</p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>Нет уведомлений</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    onMarkAsRead(notification.id);
                    onNotificationClick(notification);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {notification.userEmail ? (
                      <div className="relative">
                        <Gravatar
                          email={notification.userEmail}
                          size={40}
                          defaultImage="identicon"
                          alt="User"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  notifications.forEach(n => onMarkAsRead(n.id));
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Отметить все как прочитанные
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}