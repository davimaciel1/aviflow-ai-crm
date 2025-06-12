
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  status: 'prospect' | 'qualified' | 'client' | 'inactive';
  avatar?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    console.log('Loading clients from Supabase...');
    setIsLoading(true);
    try {
      // First, let's check the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('User error:', userError);

      // Then try to fetch clients
      const { data, error, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' });
      
      console.log('Supabase clients response:', { data, error, count });
      console.log('Number of clients found:', data?.length || 0);
      
      if (error) {
        console.error('Error loading clients:', error);
        console.error('Error details:', error.message, error.code);
        setClients([]);
      } else {
        // Type assertion to ensure status field matches our enum
        const typedData = (data || []).map(client => ({
          ...client,
          status: client.status as 'prospect' | 'qualified' | 'client' | 'inactive'
        }));
        console.log('Processed clients:', typedData);
        setClients(typedData);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Adding client to Supabase:', client);
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) {
        console.error('Error adding client:', error);
        return null;
      }

      console.log('Client added successfully:', data);
      const typedData = {
        ...data,
        status: data.status as 'prospect' | 'qualified' | 'client' | 'inactive'
      };
      setClients(prev => [...prev, typedData]);
      return typedData;
    } catch (error) {
      console.error('Error adding client:', error);
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    console.log('Updating client in Supabase:', { id, updates });
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating client:', error);
        return;
      }

      console.log('Client updated successfully');
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...updates } : client
      ));
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    console.log('Deleting client from Supabase:', id);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        return;
      }

      console.log('Client deleted successfully');
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    loadClients // Expose loadClients for manual refresh
  };
};
