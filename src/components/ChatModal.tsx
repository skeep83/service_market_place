import React, { useState, useEffect, useRef } from 'react';
import { Profile } from '../types/database';
import { Gravatar } from '../lib/gravatar';

interface Chat {
  id: string;
  job_id?: string;
  tender_id?: string;
  client_id: string;
  professional_id: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  created_at: string;
  // Дополнительные поля для отображения
  client_name?: string;
  professional_name?: string;
  job_title?: string;
  tender_title?: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  // Дополнительные поля
  sender_name?: string;
  sender_email?: string;
}

interface ChatModalProps {
  user: Profile;
  chatId?: string;
  onClose: () => void;
}

export function ChatModal({ user, chatId, onClose }: ChatModalProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data для демонстрации
  const mockChats: Chat[] = [
    {
      id: '1',
      job_id: 'job-1',
      client_id: 'client-1',
      professional_id: 'pro-1',
      status: 'active',
      last_message_at: '2025-01-15T14:30:00Z',
      created_at: '2025-01-14T10:00:00Z',
      client_name: 'Мария Петрова',
      professional_name: 'Михаил Иванов',
      job_title: 'Починить протекающий кран'
    },
    {
      id: '2',
      tender_id: 'tender-1',
      client_id: 'client-2',
      professional_id: 'pro-1',
      status: 'active',
      last_message_at: '2025-01-15T12:15:00Z',
      created_at: '2025-01-13T16:00:00Z',
      client_name: 'Андрей Козлов',
      professional_name: 'Михаил Иванов',
      tender_title: 'Покраска фасада дома'
    }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      chat_id: '1',
      sender_id: 'system',
      message_type: 'system',
      content: 'Чат создан. Заявка принята специалистом.',
      is_read: true,
      created_at: '2025-01-14T10:00:00Z'
    },
    {
      id: '2',
      chat_id: '1',
      sender_id: 'pro-1',
      message_type: 'text',
      content: 'Здравствуйте! Я готов приехать завтра утром для ремонта крана. Во сколько вам удобно?',
      is_read: true,
      created_at: '2025-01-14T10:05:00Z',
      sender_name: 'Михаил Иванов',
      sender_email: 'mikhail@example.com'
    },
    {
      id: '3',
      chat_id: '1',
      sender_id: 'client-1',
      message_type: 'text',
      content: 'Добрый день! Завтра с 9:00 до 12:00 буду дома. Подойдет ли вам 10:00?',
      is_read: true,
      created_at: '2025-01-14T11:20:00Z',
      sender_name: 'Мария Петрова',
      sender_email: 'maria@example.com'
    },
    {
      id: '4',
      chat_id: '1',
      sender_id: 'pro-1',
      message_type: 'text',
      content: 'Отлично! Буду у вас завтра в 10:00. Все необходимые инструменты и запчасти у меня есть.',
      is_read: false,
      created_at: '2025-01-15T14:30:00Z',
      sender_name: 'Михаил Иванов',
      sender_email: 'mikhail@example.com'
    }
  ];

  useEffect(() => {
    loadChats();
    if (chatId) {
      const chat = mockChats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
        loadMessages(chatId);
      }
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет запрос к Supabase
      const userChats = mockChats.filter(chat => 
        chat.client_id === user.id || chat.professional_id === user.id
      );
      setChats(userChats);
      
      if (!selectedChat && userChats.length > 0) {
        setSelectedChat(userChats[0]);
        loadMessages(userChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // В реальном приложении здесь будет запрос к Supabase
      const chatMessages = mockMessages.filter(msg => msg.chat_id === chatId);
      setMessages(chatMessages);
      
      // Отмечаем сообщения как прочитанные
      markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    // В реальном приложении здесь будет обновление в Supabase
    console.log('Marking messages as read for chat:', chatId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chat_id: selectedChat.id,
        sender_id: user.id,
        message_type: 'text',
        content: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
        sender_name: user.full_name || 'Пользователь',
        sender_email: user.email || ''
      };

      // В реальном приложении здесь будет отправка в Supabase через chatService.sendMessage
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Обновляем время последнего сообщения в чате
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, last_message_at: message.created_at }
          : chat
      ));
      
      // Автоматически прокручиваем к новому сообщению
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    const isClient = chat.client_id === user.id;
    return {
      name: isClient ? chat.professional_name : chat.client_name,
      id: isClient ? chat.professional_id : chat.client_id,
      email: isClient ? 'pro@example.com' : 'client@example.com'
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Загрузка чатов...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden shadow-2xl">
        {/* Список чатов */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Сообщения</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Нет активных чатов</p>
                <p className="text-sm mt-1">Чаты создаются автоматически после одобрения заявок</p>
              </div>
            ) : (
              chats.map((chat) => {
                const participant = getOtherParticipant(chat);
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      loadMessages(chat.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Gravatar
                        email={participant.email}
                        size={48}
                        defaultImage="identicon"
                        alt={participant.name}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {participant.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(chat.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.job_title || chat.tender_title}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            chat.job_id ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {chat.job_id ? '🔧 Заявка' : '🎯 Тендер'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Gravatar
                    email={getOtherParticipant(selectedChat).email}
                    size={40}
                    defaultImage="identicon"
                    alt={getOtherParticipant(selectedChat).name}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedChat).name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.job_title || selectedChat.tender_title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user.id;
                  const isSystem = message.message_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={message.id} className="text-center">
                        <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                          {message.content}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-2 rounded-2xl ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.created_at)}
                          {isOwn && (
                            <span className="ml-1">
                              {message.is_read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isOwn && (
                        <div className="order-1 mr-3">
                          <Gravatar
                            email={message.sender_email || ''}
                            size={32}
                            defaultImage="identicon"
                            alt={message.sender_name}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Форма отправки сообщения */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">Выберите чат</p>
                <p className="text-sm">Выберите чат из списка слева для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}