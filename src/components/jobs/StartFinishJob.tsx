import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { PhotoUpload } from '../PhotoUpload';

interface StartFinishJobProps {
  job: {
    id: string;
    title: string;
    status: string;
    start_otp?: string;
    finish_otp?: string;
    started_at?: string;
    finished_at?: string;
  };
  onJobUpdate?: (job: any) => void;
}

export function StartFinishJob({ job, onJobUpdate }: StartFinishJobProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'start' | 'finish'>('start');
  const [startOtp, setStartOtp] = useState('');
  const [finishOtp, setFinishOtp] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = job.status === 'accepted' && !job.started_at;
  const canFinish = job.status === 'in_progress' && job.started_at && !job.finished_at;

  const handleStartJob = async () => {
    if (!startOtp.trim()) {
      setError('Введите OTP код для начала работы');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/functions/v1/start-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          job_id: job.id,
          otp: startOtp.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start job');
      }

      if (data.success) {
        onJobUpdate?.({ ...job, status: 'in_progress', started_at: data.started_at });
        alert('Работа успешно начата!');
        setStartOtp('');
      }
    } catch (err) {
      console.error('Start job error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishJob = async () => {
    if (!finishOtp.trim()) {
      setError('Введите OTP код для завершения работы');
      return;
    }

    if (evidencePhotos.length === 0) {
      setError('Загрузите хотя бы одно фото выполненной работы');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload evidence photos first (mock URLs for now)
      const evidenceUrls = evidencePhotos.map((_, index) => 
        `https://example.com/evidence/${job.id}_${index + 1}.jpg`
      );

      const response = await fetch('/functions/v1/finish-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          job_id: job.id,
          otp: finishOtp.trim(),
          evidence_urls: evidenceUrls,
          notes: notes.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finish job');
      }

      if (data.success) {
        onJobUpdate?.({ 
          ...job, 
          status: 'done', 
          finished_at: data.finished_at,
          evidence_urls: data.evidence_urls
        });
        alert('Работа успешно завершена! Эскроу автоматически освобожден.');
        setFinishOtp('');
        setNotes('');
        setEvidencePhotos([]);
      }
    } catch (err) {
      console.error('Finish job error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (otp: string) => {
    // Simple QR code generation (in real app, use proper QR library)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otp)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Управление работой</h3>

      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{job.title}</h4>
            <p className="text-sm text-gray-600">
              Статус: <span className="font-medium">{job.status}</span>
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {job.started_at && (
              <p>Начато: {new Date(job.started_at).toLocaleString('ru-RU')}</p>
            )}
            {job.finished_at && (
              <p>Завершено: {new Date(job.finished_at).toLocaleString('ru-RU')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('start')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'start'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Начать работу
        </button>
        <button
          onClick={() => setActiveTab('finish')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'finish'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Завершить работу
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Start Job Tab */}
      {activeTab === 'start' && (
        <div className="space-y-6">
          {canStart ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP код для начала работы
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={startOtp}
                    onChange={(e) => setStartOtp(e.target.value)}
                    placeholder="Введите 6-значный код"
                    maxLength={6}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                  />
                  <button
                    onClick={handleStartJob}
                    disabled={loading || !startOtp.trim()}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Проверка...' : 'Начать'}
                  </button>
                </div>
              </div>

              {job.start_otp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">QR код для клиента:</h4>
                  <div className="flex items-center space-x-4">
                    <img
                      src={generateQRCode(job.start_otp)}
                      alt="Start OTP QR Code"
                      className="w-24 h-24 border border-gray-200 rounded"
                    />
                    <div>
                      <p className="text-sm text-blue-800">
                        Покажите этот QR код клиенту или сообщите код:
                      </p>
                      <p className="text-2xl font-mono font-bold text-blue-900 mt-1">
                        {job.start_otp}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {job.started_at ? (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-green-600">Работа уже начата</p>
                  <p className="text-sm">Начато: {new Date(job.started_at).toLocaleString('ru-RU')}</p>
                </div>
              ) : (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p>Работа должна быть принята для начала</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Finish Job Tab */}
      {activeTab === 'finish' && (
        <div className="space-y-6">
          {canFinish ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP код для завершения работы
                </label>
                <input
                  type="text"
                  value={finishOtp}
                  onChange={(e) => setFinishOtp(e.target.value)}
                  placeholder="Введите 6-значный код"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фото выполненной работы *
                </label>
                <PhotoUpload
                  onUpload={setEvidencePhotos}
                  maxFiles={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Обязательно загрузите фото результата работы
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарии к работе
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Опишите выполненную работу, использованные материалы..."
                />
              </div>

              {job.finish_otp && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">QR код для завершения:</h4>
                  <div className="flex items-center space-x-4">
                    <img
                      src={generateQRCode(job.finish_otp)}
                      alt="Finish OTP QR Code"
                      className="w-24 h-24 border border-gray-200 rounded"
                    />
                    <div>
                      <p className="text-sm text-green-800">
                        Код для завершения работы:
                      </p>
                      <p className="text-2xl font-mono font-bold text-green-900 mt-1">
                        {job.finish_otp}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleFinishJob}
                disabled={loading || !finishOtp.trim() || evidencePhotos.length === 0}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Завершение...' : 'Завершить работу'}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {job.finished_at ? (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-green-600">Работа завершена</p>
                  <p className="text-sm">Завершено: {new Date(job.finished_at).toLocaleString('ru-RU')}</p>
                </div>
              ) : !job.started_at ? (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Сначала нужно начать работу</p>
                </div>
              ) : (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Работа в процессе выполнения</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}