import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface DepositButtonProps {
  subject: 'job' | 'tender';
  subjectId: string;
  amount: number;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function DepositButton({ 
  subject, 
  subjectId, 
  amount, 
  onSuccess, 
  disabled = false,
  className = '' 
}: DepositButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDeposit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/functions/v1/create-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          subject,
          subject_id: subjectId,
          amount_cents: amount * 100 // Convert to cents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deposit');
      }

      if (data.success) {
        onSuccess?.();
        // Show success message
        alert(`Депозит ${amount} лей успешно внесен! Контакты специалиста теперь доступны.`);
      }
    } catch (err) {
      console.error('Deposit creation error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCreateDeposit}
        disabled={disabled || loading}
        className={`
          flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
          ${disabled || loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }
          ${className}
        `}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Обработка...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Внести депозит ({amount} лей)</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>🔒 Безопасная оплата через эскроу-сервис</p>
        <p>💰 Средства будут переданы специалисту после завершения работы</p>
        <p>📞 После депозита откроются контакты специалиста</p>
      </div>
    </div>
  );
}