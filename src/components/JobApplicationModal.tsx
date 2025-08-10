import React, { useState } from 'react';
import { PhotoUpload } from './PhotoUpload';

interface JobApplicationModalProps {
  jobId: string;
  onClose: () => void;
  onSubmit: (applicationData: ApplicationData) => void;
}

interface ApplicationData {
  message: string;
  estimated_duration: string;
  photos: File[];
  availability: string;
}

export function JobApplicationModal({ jobId, onClose, onSubmit }: JobApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    estimated_duration: '',
    availability: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const applicationData: ApplicationData = {
      message: formData.message,
      estimated_duration: formData.estimated_duration,
      photos,
      availability: formData.availability
    };

    try {
      await onSubmit(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Откликнуться на работу</h2>
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
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сообщение клиенту *
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Здравствуйте! Я готов выполнить вашу работу качественно и в срок..."
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Примерное время выполнения *
            </label>
            <select
              required
              value={formData.estimated_duration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите время</option>
              <option value="1-2_hours">1-2 часа</option>
              <option value="half_day">Полдня</option>
              <option value="full_day">Полный день</option>
              <option value="2-3_days">2-3 дня</option>
              <option value="week">Неделя</option>
              <option value="more_week">Больше недели</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Когда можете приступить? *
            </label>
            <select
              required
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите время</option>
              <option value="immediately">Немедленно</option>
              <option value="today">Сегодня</option>
              <option value="tomorrow">Завтра</option>
              <option value="this_week">На этой неделе</option>
              <option value="next_week">На следующей неделе</option>
            </select>
          </div>

          {/* Portfolio Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фото ваших работ
            </label>
            <PhotoUpload
              onUpload={setPhotos}
              maxFiles={5}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
            <p className="text-xs text-gray-500 mt-2">
              Покажите примеры похожих работ, которые вы выполняли
            </p>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Как увеличить шансы на получение работы:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Напишите персональное сообщение</li>
              <li>• Покажите примеры ваших работ</li>
              <li>• Укажите реальные сроки выполнения</li>
              <li>• Будьте готовы начать быстро</li>
              <li>• Отвечайте на сообщения оперативно</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Откликнуться'}
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