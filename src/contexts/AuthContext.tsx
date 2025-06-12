
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users database with hashed password references
const mockUsers: (User & { passwordHash: string })[] = [
  {
    id: '1',
    name: 'Davi Admin',
    email: 'davi@ippax.com',
    role: 'admin',
    passwordHash: 'admin123' // Senha simples para teste
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@techcorp.com',
    role: 'client',
    clientId: 'techcorp',
    passwordHash: '123456'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@startupxyz.com',
    role: 'client',
    clientId: 'startupxyz',
    passwordHash: '123456'
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro@abccorp.com',
    role: 'client',
    clientId: 'abccorp',
    passwordHash: '123456'
  }
];

// Simple password validation function
const validatePassword = (inputPassword: string, storedHash: string): boolean => {
  console.log('validatePassword - input:', inputPassword, 'stored:', storedHash);
  return inputPassword === storedHash;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - useEffect iniciado');
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('daviflow_user');
    console.log('AuthProvider - savedUser from localStorage:', savedUser);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthProvider - parsedUser:', parsedUser);
        
        // Validate the saved user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          console.log('AuthProvider - Setting user from localStorage:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('AuthProvider - Invalid saved user data, removing from localStorage');
          localStorage.removeItem('daviflow_user');
        }
      } catch (error) {
        console.error('AuthProvider - Error parsing saved user data:', error);
        localStorage.removeItem('daviflow_user');
      }
    } else {
      console.log('AuthProvider - No saved user in localStorage');
    }
    
    setIsLoading(false);
    console.log('AuthProvider - useEffect finalizado, isLoading set to false');
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('login - iniciado com email:', email, 'password:', password);
    setIsLoading(true);
    
    // Input validation
    if (!email || !password) {
      console.log('login - Email ou senha vazio');
      setIsLoading(false);
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('login - Formato de email inválido');
      setIsLoading(false);
      return false;
    }
    
    console.log('login - Procurando usuário...');
    console.log('login - Usuários disponíveis:', mockUsers.map(u => ({ email: u.email, password: u.passwordHash })));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user and validate password
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    console.log('login - Usuário encontrado:', foundUser);
    
    if (foundUser) {
      console.log('login - Validando senha...');
      const isPasswordValid = validatePassword(password, foundUser.passwordHash);
      console.log('login - Senha válida:', isPasswordValid);
      
      if (isPasswordValid) {
        const { passwordHash, ...userWithoutPassword } = foundUser;
        console.log('login - Login bem-sucedido, setando usuário:', userWithoutPassword);
        setUser(userWithoutPassword);
        localStorage.setItem('daviflow_user', JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return true;
      } else {
        console.log('login - Senha incorreta');
      }
    } else {
      console.log('login - Usuário não encontrado');
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    console.log('logout - executado');
    setUser(null);
    localStorage.removeItem('daviflow_user');
  };

  const contextValue = {
    user,
    login,
    logout,
    isLoading
  };

  console.log('AuthProvider - renderizando com contextValue:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
