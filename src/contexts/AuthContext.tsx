
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  createUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - Verificando usuário salvo');
    const savedUser = localStorage.getItem('daviflow_current_user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthProvider - Usuário encontrado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthProvider - Erro ao analisar usuário salvo:', error);
        localStorage.removeItem('daviflow_current_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login - Tentativa com:', email);
    setIsLoading(true);
    
    if (!email || !password) {
      setIsLoading(false);
      return false;
    }

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuário no Supabase
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError || !profiles) {
        console.log('Login - Usuário não encontrado');
        setIsLoading(false);
        return false;
      }

      // Verificar senha no user_auth
      const { data: authData, error: authError } = await supabase
        .from('user_auth')
        .select('password_hash')
        .eq('profile_id', profiles.id)
        .single();

      if (authError || !authData || authData.password_hash !== password) {
        console.log('Login - Senha inválida');
        setIsLoading(false);
        return false;
      }

      const loggedUser: User = {
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
        role: profiles.role as 'admin' | 'client'
      };

      console.log('Login - Usuário logado com sucesso:', loggedUser);
      setUser(loggedUser);
      localStorage.setItem('daviflow_current_user', JSON.stringify(loggedUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login - Erro:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout executado');
    setUser(null);
    localStorage.removeItem('daviflow_current_user');
  };

  const createUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      return false;
    }

    try {
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email.toLowerCase())
        .single();

      if (existingUser) {
        return false; // Email já existe
      }

      // Criar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role
        })
        .select()
        .single();

      if (profileError || !profile) {
        console.error('Erro ao criar perfil:', profileError);
        return false;
      }

      // Criar autenticação
      const { error: authError } = await supabase
        .from('user_auth')
        .insert({
          profile_id: profile.id,
          password_hash: userData.password
        });

      if (authError) {
        console.error('Erro ao criar autenticação:', authError);
        // Remover perfil se falhou ao criar auth
        await supabase.from('profiles').delete().eq('id', profile.id);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'client'
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  };

  const contextValue = {
    user,
    login,
    logout,
    isLoading,
    createUser,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
