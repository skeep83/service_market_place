import React, { useState } from 'react';
import { PhotoUpload } from './PhotoUpload';

interface BidModalProps {
  tenderId: string;
  onClose: () => void;
  onSubmit: (bidData: BidData) => void;
}

interface BidData {
  price: number;
  eta_slot: string;
  warranty_days: number;
  note: string;
  photos: File[];
}

export function BidModal({ tenderId, onClose, onSubmit }: BidModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    eta_slot: '',
    warranty_days: '30',
    note: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const bidData: BidData = {
      price: parseInt(formData.price),
      eta_slot: formData.eta_slot,
      warranty_days: parseInt(formData.warranty_days),
      note: formData.note,
      photos
    };

    try {
      await onSubmit(bidData);
    } catch (error) {
      console.error('Error submitting bid:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Подать заявку на тендер</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваша цена (лей) *
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1500"
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Когда можете начать? *
            </label>
            <select
              required
              value={formData.eta_slot}
              onChange={(e) => setFormData(prev => ({ ...prev, eta_slot: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите время</option>
              <option value="today">Сегодня</option>
              <option value="tomorrow">Завтра</option>
              <option value="this_week">На этой неделе</option>
              <option value="next_week">На следующей неделе</option>
              <option value="within_month">В течение месяца</option>
            </select>
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Гарантия (дни)
            </label>
            <input
              type="number"
              value={formData.warranty_days}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty_days: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание вашего предложения
            </label>
            <textarea
              rows={4}
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Опишите как вы планируете выполнить работу, ваш опыт и преимущества..."
            />
          </div>

          {/* Portfolio Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фото ваших работ (портфолио)
            </label>
            <PhotoUpload
              onUpload={setPhotos}
              maxFiles={8}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
            <p className="text-xs text-gray-500 mt-2">
              Добавьте фото похожих работ, которые вы выполняли ранее
            </p>
          </div>

          {/* Competitive Advantages */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Советы для выигрышной заявки:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Укажите конкурентную цену</li>
              <li>• Добавьте фото ваших лучших работ</li>
              <li>• Опишите ваш опыт и подход к работе</li>
              <li>• Предложите разумную гарантию</li>
              <li>• Будьте готовы начать быстро</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Подать заявку'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}