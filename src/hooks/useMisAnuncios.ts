import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Anuncio, CreateAnuncioData } from './useAnuncios';

export function useMisAnuncios() {
  const [misAnuncios, setMisAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user's anuncios - sin useCallback para evitar bucles
  const fetchMisAnuncios = async () => {
    if (!user?.id) {
      setMisAnuncios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching mis anuncios for user:', user.id);
      
      // Intentar primero con la vista, si falla usar tabla básica
      let { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Si la vista no existe, usar tabla básica
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Vista anuncios_with_provider no existe, usando tabla anuncios');
        const fallbackResult = await supabase
          .from('anuncios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) throw error;
      
      console.log('Fetched mis anuncios:', data?.length || 0);
      setMisAnuncios(data || []);
    } catch (err) {
      console.error('Error fetching mis anuncios:', err);
      setError(err instanceof Error ? err.message : 'Error fetching mis anuncios');
      setMisAnuncios([]);
    } finally {
      setLoading(false);
    }
  };

  // Update anuncio
  const updateAnuncio = async (id: string, updates: Partial<CreateAnuncioData>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('anuncios')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      console.error('Error updating anuncio:', err);
      setError(err instanceof Error ? err.message : 'Error updating anuncio');
      return false;
    }
  };

  // Delete anuncio
  const deleteAnuncio = async (id: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      console.error('Error deleting anuncio:', err);
      setError(err instanceof Error ? err.message : 'Error deleting anuncio');
      return false;
    }
  };

  // Change anuncio status
  const changeAnuncioStatus = async (id: string, estado: 'activo' | 'pausado' | 'finalizado'): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ estado })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh mis anuncios
      await fetchMisAnuncios();
      
      return true;
    } catch (err) {
      console.error('Error changing anuncio status:', err);
      setError(err instanceof Error ? err.message : 'Error changing anuncio status');
      return false;
    }
  };

  // Initialize - simplificado para evitar bucles
  useEffect(() => {
    console.log('useMisAnuncios useEffect triggered', { userId: user?.id });
    
    if (user?.id) {
      fetchMisAnuncios();
    } else {
      setMisAnuncios([]);
      setError(null);
      setLoading(false);
    }
  }, [user?.id]); // Solo depende del user ID

  return {
    misAnuncios,
    loading,
    error,
    updateAnuncio,
    deleteAnuncio,
    changeAnuncioStatus,
    refresh: fetchMisAnuncios
  };
}
