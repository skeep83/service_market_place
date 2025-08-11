import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Proactively clean up invalid session data before creating client
const cleanupInvalidSession = () => {
  try {
    const authKey = `sb-${supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedAuth = localStorage.getItem(authKey);
    
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      // Check if refresh token exists and is valid format
      if (!authData.refresh_token || 
          typeof authData.refresh_token !== 'string' || 
          authData.refresh_token.length < 10) {
        localStorage.removeItem(authKey);
      }
    }
  } catch (error) {
    // If any error occurs during cleanup, clear all auth-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Check if Supabase credentials are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here';

// Clean up invalid session data before creating client
if (isSupabaseConfigured) {
  cleanupInvalidSession();
}

// Create client only if properly configured, otherwise use mock
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock functions for development when Supabase is not configured
const createMockUser = (email: string, userData?: any) => ({
  id: `mock-${Date.now()}`,
  email,
  user_metadata: userData || {},
  created_at: new Date().toISOString()
});

export const authService = {
  async signUp(email: string, password: string, userData?: any) {
    if (!supabase) {
      // Mock successful signup for development
      return {
        data: {
          user: createMockUser(email, userData),
          session: {
            access_token: 'mock-token',
            user: createMockUser(email, userData)
          }
        },
        error: null
      };
    }

    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
    } catch (error) {
      console.error('Supabase signup error:', error);
      return {
        data: { user: null, session: null },
        error: { message: 'Network error. Please try again.' }
      };
    }
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      // Mock successful signin for development
      return {
        data: {
          user: createMockUser(email),
          session: {
            access_token: 'mock-token',
            user: createMockUser(email)
          }
        },
        error: null
      };
    }

    try {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    } catch (error) {
      console.error('Supabase signin error:', error);
      return {
        data: { user: null, session: null },
        error: { message: 'Network error. Please try again.' }
      };
    }
  },

  async signOut() {
    if (!supabase) {
      return { error: null };
    }

    try {
      // Clear local storage before signing out
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signout error:', error);
      return { error: null };
    }
  },

  async getSession() {
    if (!supabase) {
      return { data: { session: null }, error: null };
    }

    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Supabase session error:', error);
      // Clear invalid session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      return { data: { session: null }, error: null };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Supabase auth state change error:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};