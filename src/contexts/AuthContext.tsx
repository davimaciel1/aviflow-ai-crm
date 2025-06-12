
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// User interface
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

// Auth context interface
interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile from database
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile && !error) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'admin' | 'client'
            });
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !error) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as 'admin' | 'client'
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Hardcoded admin user for testing
      if (email === 'davi@ippax.com' && password === 'admin123') {
        const adminUser: AppUser = {
          id: 'admin-hardcoded-id',
          name: 'Davi Admin',
          email: 'davi@ippax.com',
          role: 'admin'
        };
        setUser(adminUser);
        setLoading(false);
        return { success: true };
      }

      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Try to find user in database and use default password
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email);

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          const defaultPassword = profile.role === 'admin' ? 'admin123' : 'client123';
          
          if (password === defaultPassword) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'admin' | 'client'
            });
            setLoading(false);
            return { success: true };
          }
        }

        setLoading(false);
        return { success: false, error: error.message };
      }

      // If Supabase auth successful, fetch profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile && !profileError) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as 'admin' | 'client'
          });
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: 'client' as const
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);

          if (!insertError) {
            setUser(newProfile);
          }
        }
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Erro inesperado durante o login' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
