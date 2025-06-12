
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  clientId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  createUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin único do sistema
const ADMIN_USER = {
  id: '1',
  name: 'Davi Admin',
  email: 'davi@ippax.com',
  role: 'admin' as const,
  passwordHash: 'admin123'
};

// Usuários criados pelo admin (salvos no localStorage)
const getStoredUsers = () => {
  const stored = localStorage.getItem('daviflow_users');
  return stored ? JSON.parse(stored) : [];
};

const saveUsers = (users: any[]) => {
  localStorage.setItem('daviflow_users', JSON.stringify(users));
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

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se é o admin
    if (email.toLowerCase() === ADMIN_USER.email.toLowerCase() && password === ADMIN_USER.passwordHash) {
      const { passwordHash, ...userWithoutPassword } = ADMIN_USER;
      console.log('Login - Admin logado com sucesso');
      setUser(userWithoutPassword);
      localStorage.setItem('daviflow_current_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    // Verificar usuários criados pelo admin
    const storedUsers = getStoredUsers();
    const foundUser = storedUsers.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );
    
    if (foundUser) {
      const { passwordHash, ...userWithoutPassword } = foundUser;
      console.log('Login - Usuário logado com sucesso:', userWithoutPassword);
      setUser(userWithoutPassword);
      localStorage.setItem('daviflow_current_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    console.log('Login - Credenciais inválidas');
    setIsLoading(false);
    return false;
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

    const storedUsers = getStoredUsers();
    
    // Verificar se email já existe
    const emailExists = storedUsers.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase()) ||
                      userData.email.toLowerCase() === ADMIN_USER.email.toLowerCase();
    
    if (emailExists) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      clientId: userData.clientId,
      passwordHash: userData.password // Em produção, use hash real
    };

    const updatedUsers = [...storedUsers, newUser];
    saveUsers(updatedUsers);
    
    return true;
  };

  const getAllUsers = (): User[] => {
    const storedUsers = getStoredUsers();
    const { passwordHash, ...adminWithoutPassword } = ADMIN_USER;
    
    return [
      adminWithoutPassword,
      ...storedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        clientId: u.clientId
      }))
    ];
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
