import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Provider {
  id: string;
  user_id: string;
  name: string;
  cif?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    region: string;
    postal_code: string;
  };
  logo_url?: string;
  verified: boolean;
  verification_date?: string;
  rating: number;
  total_sales: number;
  total_rentals: number;
  specialties: string[];
  service_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProviderData {
  name: string;
  cif?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    region: string;
    postal_code: string;
  };
  specialties?: string[];
  service_areas?: string[];
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [myProvider, setMyProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all verified providers
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching providers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's provider profile
  const fetchMyProvider = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMyProvider(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching provider profile');
    }
  };

  // Create provider profile
  const createProvider = async (providerData: CreateProviderData): Promise<Provider | null> => {
    if (!user) {
      setError('User must be logged in to create provider profile');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('providers')
        .insert([{
          ...providerData,
          user_id: user.id,
          verified: false,
          rating: 0,
          total_sales: 0,
          total_rentals: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setMyProvider(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating provider profile');
      return null;
    }
  };

  // Update provider profile
  const updateProvider = async (updates: Partial<CreateProviderData>): Promise<boolean> => {
    if (!user || !myProvider) {
      setError('No provider profile found to update');
      return false;
    }

    try {
      const { error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', myProvider.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh provider profile
      await fetchMyProvider();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating provider profile');
      return false;
    }
  };

  // Get provider by ID
  const getProviderById = async (providerId: string): Promise<Provider | null> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error('Error fetching provider:', err);
      return null;
    }
  };

  // Get provider by user ID
  const getProviderByUserId = async (userId: string): Promise<Provider | null> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error('Error fetching provider by user ID:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyProvider();
    }
  }, [user]);

  return {
    providers,
    myProvider,
    loading,
    error,
    createProvider,
    updateProvider,
    getProviderById,
    getProviderByUserId,
    refreshProviders: fetchProviders,
    refreshMyProvider: fetchMyProvider
  };
}
