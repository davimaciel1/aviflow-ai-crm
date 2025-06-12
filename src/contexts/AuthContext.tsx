
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
      console.log('Login - Email ou senha vazios');
      setIsLoading(false);
      return false;
    }

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para simplicidade inicial, vamos verificar usuários hardcoded primeiro
      const hardcodedUsers: Record<string, { password: string; user: User }> = {
        'davi@ippax.com': {
          password: 'admin123',
          user: {
            id: 'admin-hardcoded-id',
            name: 'Davi Admin',
            email: 'davi@ippax.com',
            role: 'admin'
          }
        }
      };

      const hardcodedUser = hardcodedUsers[email.toLowerCase()];
      if (hardcodedUser && hardcodedUser.password === password) {
        console.log('Login - Usuário hardcoded encontrado:', hardcodedUser.user);
        setUser(hardcodedUser.user);
        localStorage.setItem('daviflow_current_user', JSON.stringify(hardcodedUser.user));
        setIsLoading(false);
        return true;
      }

      console.log('Login - Buscando usuário no banco:', email.toLowerCase());
      
      // Buscar usuário no Supabase profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      console.log('Login - Resultado da busca:', { profile, profileError });

      if (profileError || !profile) {
        console.log('Login - Usuário não encontrado no banco de dados');
        setIsLoading(false);
        return false;
      }

      // Para usuários do banco, usar senhas padrão baseadas no role
      const defaultPasswords: Record<string, string> = {
        'admin': 'admin123',
        'client': 'client123'
      };

      const expectedPassword = defaultPasswords[profile.role] || 'client123';
      if (expectedPassword !== password) {
        console.log('Login - Senha inválida para:', email);
        setIsLoading(false);
        return false;
      }

      const loggedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'client'
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

      // Criar perfil usando apenas os campos obrigatórios
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role
        }])
        .select()
        .single();

      if (profileError || !profile) {
        console.error('Erro ao criar perfil:', profileError);
        return false;
      }

      console.log('Usuário criado com sucesso:', profile);
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
