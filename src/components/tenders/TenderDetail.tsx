import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Profile } from '../../types/database';
import { BidModal } from '../BidModal';
import { DepositButton } from '../payments/DepositButton';

interface Tender {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_hint: number;
  location: string;
  created_at: string;
  deadline: string;
  bids_locked: boolean;
  winner_bid_id?: string;
  pay_price?: number;
  status: string;
  user_id: string;
}

interface Bid {
  id: string;
  pro_id: string;
  price: number;
  warranty_days: number;
  note: string;
  weighted_score?: number;
  is_winner: boolean;
  professional: {
    full_name: string;
    rating: number;
    completed_jobs: number;
  };
}

interface TenderDetailProps {
  tender: Tender;
  user: Profile;
  onClose: () => void;
}

export function TenderDetail({ tender, user, onClose }: TenderDetailProps) {
  const { t } = useTranslation();
  const [bids, setBids] = useState<Bid[]>([]);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);

  const isOwner = tender.user_id === user.id;
  const isProfessional = user.role === 'pro' || user.account_type === 'pro';
  const canViewAllBids = isOwner && tender.bids_locked;
  const canPlaceBid = isProfessional && !tender.bids_locked && tender.status === 'open';
  const canPickWinner = isOwner && tender.bids_locked && !tender.winner_bid_id && bids.length > 0;

  useEffect(() => {
    loadBids();
    checkDepositStatus();
  }, [tender.id]);

  const loadBids = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockBids: Bid[] = [
        {
          id: '1',
          pro_id: 'pro-1',
          price: 4500,
          warranty_days: 365,
          note: 'I have 10 years of experience in house painting. Will use premium materials.',
          weighted_score: 85.5,
          is_winner: false,
          professional: {
            full_name: 'Михаил Петров',
            rating: 4.9,
            completed_jobs: 87
          }
        },
        {
          id: '2',
          pro_id: 'pro-2',
          price: 4200,
          warranty_days: 180,
          note: 'Quick and quality work. Can start immediately.',
          weighted_score: 78.2,
          is_winner: false,
          professional: {
            full_name: 'Анна Волкова',
            rating: 4.7,
            completed_jobs: 45
          }
        }
      ];

      if (canViewAllBids) {
        setBids(mockBids);
      } else if (isProfessional) {
        // Professional can only see their own bid
        const userBid = mockBids.find(bid => bid.pro_id === user.id);
        if (userBid) {
          setMyBid(userBid);
        }
      }
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDepositStatus = async () => {
    // Mock check for deposit
    setHasDeposit(false);
  };

  const handlePickWinner = async () => {
    if (!canPickWinner) return;

    setLoading(true);
    try {
      const response = await fetch('/functions/v1/pick-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          tender_id: tender.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pick winner');
      }

      if (data.success) {
        alert(`Победитель выбран: ${data.winner.professional_name}. Цена к оплате: ${data.winner.pay_price} лей (Vickrey pricing)`);
        loadBids(); // Reload to show updated winner status
      }
    } catch (error) {
      console.error('Error picking winner:', error);
      alert('Ошибка при выборе победителя');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (bidData: any) => {
    try {
      // Mock bid submission
      console.log('Submitting bid:', bidData);
      alert('Заявка успешно подана!');
      setShowBidModal(false);
      loadBids();
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Ошибка при подаче заявки');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      bafo: 'bg-yellow-100 text-yellow-800',
      awarded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📍 {tender.location}</span>
                <span>💰 ~{tender.budget_hint} лей</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 z-[10000]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tender Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание проекта</h3>
            <p className="text-gray-700 leading-relaxed">{tender.description}</p>
          </div>

          {/* Tender Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Категория:</span>
                <span className="font-medium">{tender.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Создано:</span>
                <span className="font-medium">{formatDate(tender.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Дедлайн:</span>
                <span className="font-medium">{formatDate(tender.deadline)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Заявки заблокированы:</span>
                <span className={`font-medium ${tender.bids_locked ? 'text-red-600' : 'text-green-600'}`}>
                  {tender.bids_locked ? 'Да' : 'Нет'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Получено заявок:</span>
                <span className="font-medium">{bids.length}</span>
              </div>
              {tender.winner_bid_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Цена к оплате:</span>
                  <span className="font-medium text-green-600">{tender.pay_price} лей</span>
                </div>
              )}
            </div>
          </div>

          {/* Sealed Bid Notice */}
          {!tender.bids_locked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-900">Закрытые заявки</h4>
                  <p className="text-sm text-yellow-800">
                    Заявки скрыты до окончания срока подачи. Специалисты видят только свои заявки.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Professional Actions */}
          {isProfessional && (
            <div className="space-y-4">
              {canPlaceBid && (
                <button
                  onClick={() => setShowBidModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Подать заявку
                </button>
              )}

              {myBid && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Ваша заявка</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Цена:</span>
                      <span className="font-medium">{myBid.price} лей</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Гарантия:</span>
                      <span className="font-medium">{myBid.warranty_days} дней</span>
                    </div>
                    {myBid.weighted_score && (
                      <div className="flex justify-between">
                        <span>Оценка:</span>
                        <span className="font-medium">{myBid.weighted_score}/100</span>
                      </div>
                    )}
                    {myBid.is_winner && (
                      <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-green-800 font-medium text-center">
                        🏆 Вы победили в тендере!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="space-y-4">
              {canPickWinner && (
                <button
                  onClick={handlePickWinner}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Выбор победителя...' : 'Выбрать победителя (Vickrey)'}
                </button>
              )}

              {tender.winner_bid_id && !hasDeposit && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Победитель выбран!</h4>
                    <p className="text-sm text-green-800">
                      Для получения контактов специалиста необходимо внести депозит.
                    </p>
                  </div>
                  <DepositButton
                    subject="tender"
                    subjectId={tender.id}
                    amount={tender.pay_price || tender.budget_hint}
                    onSuccess={() => setHasDeposit(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Bids List (for owner after lock) */}
          {canViewAllBids && bids.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Все заявки ({bids.length})
              </h3>
              <div className="space-y-4">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`border rounded-lg p-4 ${
                      bid.is_winner 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          bid.is_winner ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {bid.is_winner ? '🏆' : index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {hasDeposit ? bid.professional.full_name : '[Скрыто до депозита]'}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {bid.professional.rating}</span>
                            <span>• {bid.professional.completed_jobs} работ</span>
                            {bid.weighted_score && (
                              <span>• Оценка: {bid.weighted_score}/100</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{bid.price} лей</div>
                        <div className="text-sm text-gray-600">Гарантия: {bid.warranty_days} дней</div>
                      </div>
                    </div>
                    
                    {bid.note && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{bid.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Unlock Info */}
          {!hasDeposit && (isOwner || isProfessional) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900">Контакты скрыты</h4>
                  <p className="text-sm text-blue-800">
                    Контактные данные специалистов будут доступны после внесения депозита.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <BidModal
          tenderId={tender.id}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
}