/**
 * Optimized anuncios hook using React Query
 * Replaces useAnuncios.ts with cached, efficient queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anuncioQueries, queryKeys } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { CreateAnuncioData } from '@/hooks/useAnuncios';

export function useOptimizedAnuncios() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all active anuncios
  const {
    data: anuncios = [],
    isLoading: loadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: queryKeys.anunciosAll(),
    queryFn: anuncioQueries.all,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
  });

  // Get user's anuncios
  const {
    data: misAnuncios = [],
    isLoading: loadingMine,
    error: errorMine,
  } = useQuery({
    queryKey: queryKeys.anunciosByUser(user?.id!),
    queryFn: () => anuncioQueries.byUser(user?.id!),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Create anuncio mutation
  const createAnuncioMutation = useMutation({
    mutationFn: async (anuncioData: CreateAnuncioData) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('anuncios')
        .insert([{
          ...anuncioData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosByUser(user?.id!) });
    },
  });

  // Update anuncio mutation
  const updateAnuncioMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAnuncioData> }) => {
      const { data, error } = await supabase
        .from('anuncios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosByUser(user?.id!) });
    },
  });

  // Delete anuncio mutation
  const deleteAnuncioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosByUser(user?.id!) });
    },
  });

  // Toggle anuncio status mutation
  const toggleAnuncioStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      // First get current status
      const anuncio = misAnuncios.find(a => a.id === id);
      if (!anuncio) throw new Error('Anuncio not found');
      
      const newStatus = anuncio.estado === 'activo' ? 'pausado' : 'activo';
      
      const { error } = await supabase
        .from('anuncios')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;
      return { id, newStatus };
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosByUser(user?.id!) });
    },
  });

  return {
    // Data
    anuncios,
    misAnuncios,
    loading: loadingAll || loadingMine,
    error: errorAll?.message || errorMine?.message || null,
    
    // Actions
    createAnuncio: async (anuncioData: CreateAnuncioData) => {
      try {
        const anuncio = await createAnuncioMutation.mutateAsync(anuncioData);
        return anuncio;
      } catch (err) {
        console.error('Error creating anuncio:', err);
        return null;
      }
    },
    
    updateAnuncio: async (id: string, updates: Partial<CreateAnuncioData>) => {
      try {
        const anuncio = await updateAnuncioMutation.mutateAsync({ id, updates });
        return anuncio;
      } catch (err) {
        console.error('Error updating anuncio:', err);
        return null;
      }
    },
    
    deleteAnuncio: async (id: string) => {
      try {
        await deleteAnuncioMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting anuncio:', err);
        return false;
      }
    },
    
    toggleAnuncioStatus: async (id: string) => {
      try {
        const result = await toggleAnuncioStatusMutation.mutateAsync(id);
        return result;
      } catch (err) {
        console.error('Error toggling anuncio status:', err);
        return null;
      }
    },
    
    // Loading states
    isCreatingAnuncio: createAnuncioMutation.isPending,
    isUpdatingAnuncio: updateAnuncioMutation.isPending,
    isDeletingAnuncio: deleteAnuncioMutation.isPending,
    isTogglingStatus: toggleAnuncioStatusMutation.isPending,
    
    // Refresh functions (for compatibility)
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.anunciosByUser(user?.id!) });
    },
  };
}

// Hook for single anuncio
export function useOptimizedAnuncio(id: string) {
  const queryClient = useQueryClient();

  const {
    data: anuncio,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.anuncio(id),
    queryFn: () => anuncioQueries.byId(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    anuncio,
    loading,
    error: error?.message || null,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.anuncio(id) }),
  };
}

// Hook for anuncios by category
export function useOptimizedAnunciosByCategory(categoria: string) {
  const {
    data: anuncios = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.anunciosByCategory(categoria),
    queryFn: () => anuncioQueries.byCategory(categoria),
    enabled: !!categoria,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
  });

  return {
    anuncios,
    loading,
    error: error?.message || null,
  };
}
