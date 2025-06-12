
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Starting initialization');
    let mounted = true;
    let sessionInitialized = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
        
        if (!mounted) {
          console.log('Component unmounted, ignoring auth event');
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id);
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!mounted) return;

            if (error) {
              console.error('Error fetching profile:', error);
              setUser(null);
            } else if (profile) {
              console.log('Profile loaded:', profile);
              setUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as 'admin' | 'client',
                status: profile.status as 'pending' | 'approved' | 'rejected'
              });
            } else {
              console.log('No profile found for user');
              setUser(null);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          console.log('No session, clearing user');
          if (mounted) {
            setUser(null);
          }
        }
        
        // Only set loading to false after we've processed the initial session
        if (mounted && !sessionInitialized) {
          console.log('Session initialized, setting loading to false');
          sessionInitialized = true;
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        console.log('Initial session retrieved:', !!session, 'User ID:', session?.user?.id);
        
        // If no session, we can stop loading immediately
        if (!session && mounted) {
          console.log('No initial session found, stopping loading');
          sessionInitialized = true;
          setIsLoading(false);
        }
        // If there is a session, the onAuthStateChange will handle it
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          console.log('Error getting session, stopping loading');
          sessionInitialized = true;
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Fallback: if nothing happens within 3 seconds, stop loading
    const fallbackTimer = setTimeout(() => {
      if (mounted && !sessionInitialized) {
        console.log('Fallback: Stopping loading after 3 seconds');
        sessionInitialized = true;
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      console.log('AuthProvider: Cleaning up');
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Input validation
      if (!email || !password) {
        return false;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        // Session and user will be set by the auth state change listener
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // Session and user will be cleared by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  console.log('AuthProvider render - isLoading:', isLoading, 'user:', !!user, 'session:', !!session);

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
