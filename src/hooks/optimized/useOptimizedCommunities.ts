/**
 * Optimized communities hook using React Query
 * Replaces useCommunities.ts with cached, efficient queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityQueries, queryKeys } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useOptimizedCommunities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all communities
  const {
    data: allCommunities = [],
    isLoading: loadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: queryKeys.communitiesAll(),
    queryFn: () => communityQueries.all(50),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get user's communities
  const {
    data: myCommunities = [],
    isLoading: loadingMine,
    error: errorMine,
  } = useQuery({
    queryKey: queryKeys.communitiesMine(user?.id!),
    queryFn: () => communityQueries.mine(user?.id!),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('community_members')
        .insert([{ user_id: user.id, community_id: communityId }]);
      
      if (error) throw error;
      return communityId;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesMine(user?.id!) });
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);
      
      if (error) throw error;
      return communityId;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesMine(user?.id!) });
    },
  });

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (communityData: {
      name: string;
      description: string;
      hashtag: string;
      is_public: boolean;
    }) => {
      if (!user) throw new Error('User must be logged in');
      
      // Create community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert([{
          ...communityData,
          slug: communityData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          created_by: user.id,
        }])
        .select()
        .single();
      
      if (communityError) throw communityError;
      
      // Auto-join the creator
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([{
          user_id: user.id,
          community_id: community.id,
          role: 'admin',
        }]);
      
      if (memberError) throw memberError;
      
      return community;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.communitiesMine(user?.id!) });
    },
  });

  return {
    // Data
    allCommunities,
    myCommunities,
    loading: loadingAll || loadingMine,
    error: errorAll?.message || errorMine?.message || null,
    
    // Actions
    joinCommunity: async (communityId: string) => {
      try {
        await joinCommunityMutation.mutateAsync(communityId);
        return true;
      } catch (err) {
        console.error('Error joining community:', err);
        return false;
      }
    },
    
    leaveCommunity: async (communityId: string) => {
      try {
        await leaveCommunityMutation.mutateAsync(communityId);
        return true;
      } catch (err) {
        console.error('Error leaving community:', err);
        return false;
      }
    },
    
    createCommunity: async (communityData: any) => {
      try {
        const community = await createCommunityMutation.mutateAsync(communityData);
        return community;
      } catch (err) {
        console.error('Error creating community:', err);
        return null;
      }
    },
    
    // Loading states
    isJoiningCommunity: joinCommunityMutation.isPending,
    isLeavingCommunity: leaveCommunityMutation.isPending,
    isCreatingCommunity: createCommunityMutation.isPending,
    
    // Refresh functions (for compatibility)
    refetchAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.communitiesAll() }),
    refetchMine: () => queryClient.invalidateQueries({ queryKey: queryKeys.communitiesMine(user?.id!) }),
  };
}

// Hook for single community
export function useOptimizedCommunity(slug: string) {
  const queryClient = useQueryClient();

  const {
    data: community,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.community(slug),
    queryFn: () => communityQueries.bySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get community rules
  const {
    data: rules = [],
    isLoading: loadingRules,
  } = useQuery({
    queryKey: queryKeys.communityRules(community?.id!),
    queryFn: () => communityQueries.rules(community?.id!),
    enabled: !!community?.id,
    staleTime: 10 * 60 * 1000, // Cache rules for 10 minutes
  });

  // Add community rule mutation
  const addRuleMutation = useMutation({
    mutationFn: async (ruleData: { title: string; description: string }) => {
      if (!community) throw new Error('Community not found');
      
      const { error } = await supabase
        .from('community_rules')
        .insert([{
          community_id: community.id,
          ...ruleData,
          display_order: rules.length,
        }]);
      
      if (error) throw error;
      return ruleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityRules(community?.id!) });
    },
  });

  // Update community rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      const { error } = await supabase
        .from('community_rules')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityRules(community?.id!) });
    },
  });

  // Delete community rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityRules(community?.id!) });
    },
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async (bannerUrl: string) => {
      if (!community) throw new Error('Community not found');
      
      const { error } = await supabase
        .from('communities')
        .update({ banner_url: bannerUrl })
        .eq('id', community.id);
      
      if (error) throw error;
      return bannerUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community(slug) });
    },
  });

  return {
    // Data
    community,
    rules,
    loading: loading || loadingRules,
    error: error?.message || null,
    
    // Rule management
    addRule: async (ruleData: { title: string; description: string }) => {
      try {
        await addRuleMutation.mutateAsync(ruleData);
        return true;
      } catch (err) {
        console.error('Error adding rule:', err);
        return false;
      }
    },
    
    updateRule: async (id: string, data: Partial<any>) => {
      try {
        await updateRuleMutation.mutateAsync({ id, data });
        return true;
      } catch (err) {
        console.error('Error updating rule:', err);
        return false;
      }
    },
    
    deleteRule: async (id: string) => {
      try {
        await deleteRuleMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting rule:', err);
        return false;
      }
    },
    
    updateBanner: async (bannerUrl: string) => {
      try {
        await updateBannerMutation.mutateAsync(bannerUrl);
        return true;
      } catch (err) {
        console.error('Error updating banner:', err);
        return false;
      }
    },
    
    // Loading states
    isAddingRule: addRuleMutation.isPending,
    isUpdatingRule: updateRuleMutation.isPending,
    isDeletingRule: deleteRuleMutation.isPending,
    isUpdatingBanner: updateBannerMutation.isPending,
  };
}
