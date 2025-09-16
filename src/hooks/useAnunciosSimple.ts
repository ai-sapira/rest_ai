/**
 * SIMPLE Anuncios Hook - React Query Direct Approach
 * Replaces complex useAnuncios with clean, maintainable code
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Types from original hook
export interface Anuncio {
  id: string;
  user_id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  moneda: string;
  ubicacion: string;
  estado_producto: string;
  condicion: string;
  marca?: string;
  modelo?: string;
  año?: number;
  dimensiones?: string;
  peso?: number;
  material?: string;
  color?: string;
  capacidad?: string;
  potencia?: string;
  voltaje?: string;
  imagenes: string[];
  contacto_telefono?: string;
  contacto_email?: string;
  envio: boolean;
  estado: 'activo' | 'pausado' | 'vendido' | 'eliminado';
  visualizaciones: number;
  contactos: number;
  fecha_vencimiento?: string;
  destacado: boolean;
  actor_type: 'user' | 'provider';
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnuncioData {
  titulo: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  ubicacion: string;
  estado_producto: string;
  condicion: string;
  marca?: string;
  modelo?: string;
  año?: number;
  dimensiones?: string;
  peso?: number;
  material?: string;
  color?: string;
  capacidad?: string;
  potencia?: string;
  voltaje?: string;
  imagenes: string[];
  contacto_telefono?: string;
  contacto_email?: string;
  envio: boolean;
  fecha_vencimiento?: string;
  destacado: boolean;
  actor_type: 'user' | 'provider';
  provider_id?: string;
}

// ============================================================================
// MAIN HOOK - SEPARATE QUERIES FOR DIFFERENT PURPOSES
// ============================================================================

export function useAnunciosSimple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ QUERY 1: All active anuncios (for browse/search)
  const {
    data: anuncios = [],
    isLoading: loadingAnuncios,
    error: errorAnuncios,
  } = useQuery({
    queryKey: ['anuncios', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Anuncio[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes cache - anuncios change frequently
  });

  // ✅ QUERY 2: My anuncios (only when user is logged in)
  const {
    data: misAnuncios = [],
    isLoading: loadingMisAnuncios,
    error: errorMisAnuncios,
  } = useQuery({
    queryKey: ['anuncios', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Anuncio[];
    },
    enabled: !!user, // Only run when user is logged in
    staleTime: 2 * 60 * 1000, // 2 minutes cache - user's own anuncios
  });

  // Combine loading states intelligently
  const loading = loadingAnuncios || loadingMisAnuncios;
  const error = errorAnuncios?.message || errorMisAnuncios?.message || null;

  // ============================================================================
  // MUTATIONS - SIMPLE AND DIRECT
  // ============================================================================

  const createAnuncio = useMutation({
    mutationFn: async (anuncioData: CreateAnuncioData) => {
      if (!user) throw new Error('Must be logged in to create anuncio');
      
      const { data, error } = await supabase
        .from('anuncios')
        .insert([{
          ...anuncioData,
          user_id: user.id,
          moneda: 'EUR', // Default currency
          visualizaciones: 0,
          contactos: 0,
          estado: 'activo' as const,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Anuncio;
    },
    onSuccess: () => {
      // ✅ Smart invalidation - refresh both lists
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'user', user?.id] });
    },
  });

  const updateAnuncio = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAnuncioData> }) => {
      const { data, error } = await supabase
        .from('anuncios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Anuncio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'user', user?.id] });
      // Also invalidate single anuncio cache if it exists
      queryClient.invalidateQueries({ queryKey: ['anuncio'] });
    },
  });

  const deleteAnuncio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'user', user?.id] });
    },
  });

  const changeAnuncioStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'activo' | 'pausado' | 'vendido' }) => {
      const { error } = await supabase
        .from('anuncios')
        .update({ estado: status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios', 'user', user?.id] });
    },
  });

  const incrementViews = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('increment_anuncio_views', { anuncio_id: id });
      if (error) throw error;
      return id;
    },
    // No need to invalidate cache for view counts - it's just a counter
  });

  // ============================================================================
  // RETURN - CLEAN API, SAME AS BEFORE
  // ============================================================================

  return {
    // Data
    anuncios,
    misAnuncios,
    loading,
    error,
    
    // Actions - simplified API
    createAnuncio: async (data: CreateAnuncioData) => {
      try {
        const anuncio = await createAnuncio.mutateAsync(data);
        return anuncio;
      } catch (err) {
        console.error('Error creating anuncio:', err);
        return null;
      }
    },
    
    updateAnuncio: async (id: string, updates: Partial<CreateAnuncioData>) => {
      try {
        const anuncio = await updateAnuncio.mutateAsync({ id, updates });
        return anuncio;
      } catch (err) {
        console.error('Error updating anuncio:', err);
        return null;
      }
    },
    
    deleteAnuncio: async (id: string) => {
      try {
        await deleteAnuncio.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting anuncio:', err);
        return false;
      }
    },
    
    changeAnuncioStatus: async (id: string, status: 'activo' | 'pausado' | 'vendido') => {
      try {
        await changeAnuncioStatus.mutateAsync({ id, status });
        return true;
      } catch (err) {
        console.error('Error changing anuncio status:', err);
        return false;
      }
    },
    
    incrementViews: async (id: string) => {
      try {
        await incrementViews.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error incrementing views:', err);
        return false;
      }
    },
    
    // Loading states for UI feedback
    isCreatingAnuncio: createAnuncio.isPending,
    isUpdatingAnuncio: updateAnuncio.isPending,
    isDeletingAnuncio: deleteAnuncio.isPending,
    isChangingStatus: changeAnuncioStatus.isPending,
    
    // Refresh functions (for compatibility - though not needed with React Query)
    refreshAnuncios: () => queryClient.invalidateQueries({ queryKey: ['anuncios', 'all'] }),
    refreshMisAnuncios: () => queryClient.invalidateQueries({ queryKey: ['anuncios', 'user', user?.id] }),
  };
}

// ============================================================================
// BONUS: HOOK FOR SINGLE ANUNCIO (for detail pages)
// ============================================================================

export function useAnuncio(id: string) {
  const queryClient = useQueryClient();

  const {
    data: anuncio,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['anuncio', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Anuncio;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for individual anuncio
  });

  return {
    anuncio,
    loading,
    error: error?.message || null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['anuncio', id] }),
  };
}

// ============================================================================
// BONUS: HOOK FOR ANUNCIOS BY CATEGORY (for category pages)
// ============================================================================

export function useAnunciosByCategory(categoria: string) {
  const {
    data: anuncios = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['anuncios', 'category', categoria],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios_with_provider')
        .select('*')
        .eq('categoria', categoria)
        .eq('estado', 'activo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Anuncio[];
    },
    enabled: !!categoria,
    staleTime: 3 * 60 * 1000, // 3 minutes cache
  });

  return {
    anuncios,
    loading,
    error: error?.message || null,
  };
}
