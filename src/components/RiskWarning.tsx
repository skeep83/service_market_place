import React, { useState, useEffect } from 'react';
import { Profile } from '../types/database';

interface RiskScore {
  actor: string;
  score: number;
  events: number;
  latest_event: string;
  risk_types: string[];
}

interface RiskWarningProps {
  user: Profile;
}

export function RiskWarning({ user }: RiskWarningProps) {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskScore();
  }, [user.id]);

  const loadRiskScore = async () => {
    setLoading(true);
    try {
      // Mock risk score data
      const mockRiskScore: RiskScore = {
        actor: user.id,
        score: 3,
        events: 2,
        latest_event: '2025-01-15T10:00:00Z',
        risk_types: ['offplatform_hint']
      };

      setRiskScore(mockRiskScore);
    } catch (error) {
      console.error('Error loading risk score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !riskScore || riskScore.score < 5) {
    return null;
  }

  const getRiskLevel = (score: number) => {
    if (score >= 10) return { level: 'high', color: 'red', text: 'Высокий' };
    if (score >= 5) return { level: 'medium', color: 'yellow', text: 'Средний' };
    return { level: 'low', color: 'green', text: 'Низкий' };
  };

  const risk = getRiskLevel(riskScore.score);

  const getRiskTypeText = (type: string) => {
    const types = {
      offplatform_hint: 'Попытки обмена контактами',
      repeat_pair: 'Повторные взаимодействия',
      bid_anomaly: 'Аномальные ставки',
      ip_device_match: 'Подозрительная активность',
      suspicious_behavior: 'Подозрительное поведение'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className={`mb-6 p-4 border rounded-lg ${
      risk.color === 'red' ? 'bg-red-50 border-red-200' :
      risk.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          risk.color === 'red' ? 'bg-red-100' :
          risk.color === 'yellow' ? 'bg-yellow-100' :
          'bg-green-100'
        }`}>
          {risk.color === 'red' ? '⚠️' : risk.color === 'yellow' ? '⚡' : '✅'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${
              risk.color === 'red' ? 'text-red-900' :
              risk.color === 'yellow' ? 'text-yellow-900' :
              'text-green-900'
            }`}>
              Уровень риска: {risk.text}
            </h4>
            <span className={`text-sm font-bold ${
              risk.color === 'red' ? 'text-red-700' :
              risk.color === 'yellow' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              {riskScore.score} баллов
            </span>
          </div>
          
          <div className={`text-sm mt-1 ${
            risk.color === 'red' ? 'text-red-800' :
            risk.color === 'yellow' ? 'text-yellow-800' :
            'text-green-800'
          }`}>
            <p>Обнаружено событий: {riskScore.events}</p>
            <p>Типы нарушений: {riskScore.risk_types.map(getRiskTypeText).join(', ')}</p>
          </div>

          {risk.level === 'high' && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                🚨 Требуется полная предоплата или модерация
              </p>
              <p className="text-xs text-red-700 mt-1">
                Из-за высокого уровня риска все транзакции требуют дополнительной проверки.
              </p>
            </div>
          )}

          {risk.level === 'medium' && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚡ Рекомендуется осторожность
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Соблюдайте правила платформы для снижения уровня риска.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}