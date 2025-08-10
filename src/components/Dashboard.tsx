import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Profile } from '../types/database';
import { UserDashboard } from './UserDashboard';
import { ProDashboard } from './ProDashboard';
import { AdminDashboard } from './AdminDashboard';

interface DashboardProps {
  user: Profile;
}

export function Dashboard({ user }: DashboardProps) {
  const { t } = useTranslation();
  
  // Отладочная информация
  console.log('Dashboard user:', user);
  console.log('User role:', user.role);
  console.log('User account_type:', user.account_type);

  // Определяем тип пользователя
  const isAdmin = user.role === 'admin';
  const isPro = user.role === 'pro' || user.account_type === 'pro';
  const isClient = !isAdmin && !isPro;

  console.log('Dashboard routing:', { isAdmin, isPro, isClient });

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? (
        <AdminDashboard user={user} />
      ) : isPro ? (
        <ProDashboard user={user} />
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  );
}