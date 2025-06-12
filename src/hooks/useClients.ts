
import { useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  status: 'prospect' | 'qualified' | 'client' | 'inactive';
}

// Mock data - isso deveria vir do Supabase em uma implementação real
const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techcorp.com',
    company: 'TechCorp',
    phone: '+55 11 99999-9999',
    status: 'qualified'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@startupxyz.com',
    company: 'StartupXYZ',
    phone: '+55 21 88888-8888',
    status: 'client'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@abccorp.com',
    company: 'ABC Corp',
    phone: '+55 31 77777-7777',
    status: 'prospect'
  }
];

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados
    const loadClients = async () => {
      setIsLoading(true);
      // Aqui você faria a chamada para o Supabase
      // const { data, error } = await supabase.from('clients').select('*');
      
      // Por enquanto, usando dados mock
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      setClients(mockClients);
      setIsLoading(false);
    };

    loadClients();
  }, []);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = {
      ...client,
      id: Date.now().toString()
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient
  };
};
