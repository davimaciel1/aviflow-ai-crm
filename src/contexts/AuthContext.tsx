
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

// Cleanup function for auth state
const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing sessionStorage key:', key);
      sessionStorage.removeItem(key);
    }
  });
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
          console.log('User email from session:', session.user.email);
          
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
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
                console.log('No profile found for user, checking if user exists in auth.users');
                
                // Check if user exists but profile is missing
                console.log('User exists in auth but no profile found. Email:', session.user.email);
                setUser(null);
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
              if (mounted) {
                setUser(null);
              }
            }
          }, 0);
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
      console.log('Login attempt for email:', email);
      
      // Input validation
      if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return false;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Login failed: Invalid email format');
        return false;
      }

      // Clean up existing state before login
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        console.log('Attempting global sign out before login...');
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global sign out error (continuing):', err);
      }
      
      console.log('Attempting to sign in with Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }

      console.log('Supabase login successful:', data);
      console.log('User data:', data.user);
      console.log('Session data:', data.session);

      if (data.user && data.session) {
        // Session and user will be set by the auth state change listener
        console.log('Login successful, user authenticated');
        return true;
      }
      
      console.log('Login failed: No user or session returned');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated...');
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Global sign out successful');
      } catch (err) {
        console.error('Global sign out error:', err);
      }
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force page reload even if logout fails
      window.location.href = '/';
    }
  };

  console.log('AuthProvider render - isLoading:', isLoading, 'user:', !!user, 'session:', !!session);

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
