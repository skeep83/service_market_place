import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../lib/supabase';
import { Profile } from '../types/database';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any invalid session data on mount
    const clearInvalidSession = () => {
      try {
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          // Check if session is expired or invalid
          if (!parsed.refresh_token || !parsed.access_token) {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          }
        }
      } catch (error) {
        // Clear corrupted session data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    };

    clearInvalidSession();

    // Get initial session
    authService.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear invalid session data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        createMockProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            // Clear all session data on sign out
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          }
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await createMockProfile(session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createMockProfile = async (user: User) => {
    try {
      console.log('Creating profile for user:', user);
      console.log('User metadata:', user.user_metadata);

      // Определяем роль и тип аккаунта из метаданных
      const userRole = user.user_metadata?.role || 'user';
      const accountType = user.user_metadata?.account_type || 'client';

      console.log('Determined role:', userRole, 'account_type:', accountType);

      // Create mock profile for development
      const mockProfile: Profile = {
        id: user.id,
        role: userRole as 'user' | 'pro' | 'admin',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || null,
        phone: user.user_metadata?.phone || null,
        account_type: accountType as 'client' | 'business' | 'pro',
        business_id: user.user_metadata?.business_id || null,
        contact_person: user.user_metadata?.contact_person || null,
        legal_address: user.user_metadata?.legal_address || null,
        rating: 4.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Created mock profile:', mockProfile);
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error creating mock profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('SignUp with userData:', userData);
      const result = await authService.signUp(email, password, userData);
      return result;
    } catch (err) {
      console.error('SignUp error:', err);
      return { data: null, error: err as any };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.signIn(email, password);
      return result;
    } catch (err) {
      console.error('SignIn error:', err);
      return { data: null, error: err as any };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const result = await authService.signOut();
    return result;
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  };
}