
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
    name: 'Admin User',
    email: 'admin@daviflow.com',
    role: 'admin',
    passwordHash: 'demo_hash_123456' // In real app, this would be a proper bcrypt hash
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@techcorp.com',
    role: 'client',
    clientId: 'techcorp',
    passwordHash: 'demo_hash_123456'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@startupxyz.com',
    role: 'client',
    clientId: 'startupxyz',
    passwordHash: 'demo_hash_123456'
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro@abccorp.com',
    role: 'client',
    clientId: 'abccorp',
    passwordHash: 'demo_hash_123456'
  }
];

// Simple password validation function (in real app, use bcrypt)
const validatePassword = (inputPassword: string, storedHash: string): boolean => {
  // For demo purposes, we'll check against the demo password
  // In a real application, you would use bcrypt.compare()
  return storedHash === 'demo_hash_123456' && inputPassword === '123456';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('daviflow_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate the saved user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('daviflow_user');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('daviflow_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Input validation
    if (!email || !password) {
      setIsLoading(false);
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      return false;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user and validate password
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && validatePassword(password, foundUser.passwordHash)) {
      const { passwordHash, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('daviflow_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('daviflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
