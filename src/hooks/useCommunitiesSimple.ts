/**
 * SIMPLE Communities Hook - React Query Direct Approach
 * Replaces complex useCommunities with clean, maintainable code
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Types from original hook
export interface CommunityRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hashtag: string | null;
  is_public: boolean;
  avatar_url: string | null;
  member_count: number;
  banner_url?: string | null;
  created_at?: string;
  updated_at?: string;
  joined_at?: string; // For myCommunities, when user joined
}

export interface CreateCommunityData {
  name: string;
  description: string;
  hashtag: string;
  is_public: boolean;
}

// ============================================================================
// MAIN HOOK - SEPARATE OPTIMIZED QUERIES
// ============================================================================

export function useCommunitiesSimple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ QUERY 1: All communities (for browse/explore)
  const {
    data: allCommunities = [],
    isLoading: loadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ['communities', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('id, slug, name, description, hashtag, is_public, avatar_url, member_count, banner_url, created_at, updated_at')
        .range(0, 49)
        .order('member_count', { ascending: false });

      if (error) throw error;
      
      // Deduplicate by id (defensive programming)
      const uniqueCommunities = (data || []).filter((community, index, self) => 
        community && self.findIndex(c => c?.id === community.id) === index
      ) as CommunityRow[];
      
      return uniqueCommunities;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache - community list doesn't change often
  });

  // ✅ QUERY 2: My communities (only when user is logged in)
  const {
    data: myCommunities = [],
    isLoading: loadingMine,
    error: errorMine,
  } = useQuery({
    queryKey: ['communities', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get community memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select('community_id, created_at')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      // Then get the actual communities
      const communityIds = memberships.map(m => m.community_id);
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, slug, name, description, hashtag, is_public, avatar_url, member_count, banner_url, created_at, updated_at')
        .in('id', communityIds);

      if (communitiesError) throw communitiesError;

      // Combine the data with joined_at info (using created_at from membership)
      const communitiesWithJoinedAt = (communities || []).map(community => {
        const membership = memberships.find(m => m.community_id === community.id);
        return {
          ...community,
          joined_at: membership?.created_at, // Use created_at as joined_at
        };
      }) as CommunityRow[];

      // Sort by joined_at descending (most recently joined first)
      communitiesWithJoinedAt.sort((a, b) => {
        if (!a.joined_at || !b.joined_at) return 0;
        return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
      });

      return communitiesWithJoinedAt;
    },
    enabled: !!user, // Only run when user is logged in
    staleTime: 2 * 60 * 1000, // 2 minutes cache - user's communities change more frequently
  });

  // Combine loading states intelligently
  const loading = loadingAll || loadingMine;
  const error = errorAll?.message || errorMine?.message || null;

  // ============================================================================
  // MUTATIONS - COMPLETE CRUD OPERATIONS
  // ============================================================================

  const joinCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('Must be logged in to join community');
      
      const { error } = await supabase
        .from('community_members')
        .insert([{
          user_id: user.id,
          community_id: communityId,
          role: 'member', // Default role
        }]);
      
      if (error) throw error;
      return communityId;
    },
    onSuccess: () => {
      // ✅ Smart invalidation - update both community lists and member counts
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'user', user?.id] });
    },
  });

  const leaveCommunity = useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('Must be logged in to leave community');
      
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);
      
      if (error) throw error;
      return communityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'user', user?.id] });
    },
  });

  const createCommunity = useMutation({
    mutationFn: async (communityData: CreateCommunityData) => {
      if (!user) throw new Error('Must be logged in to create community');
      
      // Generate slug from name
      const slug = communityData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Create community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert([{
          ...communityData,
          slug,
          created_by: user.id,
          member_count: 1, // Creator is first member
        }])
        .select()
        .single();
      
      if (communityError) throw communityError;
      
      // Auto-join the creator as admin
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([{
          user_id: user.id,
          community_id: community.id,
          role: 'admin',
        }]);
      
      if (memberError) throw memberError;
      
      return community as CommunityRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'user', user?.id] });
    },
  });

  const updateCommunity = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CommunityRow> }) => {
      const { data, error } = await supabase
        .from('communities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CommunityRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'user', user?.id] });
    },
  });

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isUserMember = (communityId: string): boolean => {
    return myCommunities.some(community => community.id === communityId);
  };

  const getCommunityBySlug = (slug: string): CommunityRow | undefined => {
    return allCommunities.find(community => community.slug === slug);
  };

  const getCommunityById = (id: string): CommunityRow | undefined => {
    return allCommunities.find(community => community.id === id);
  };

  // ============================================================================
  // RETURN - CLEAN API, ENHANCED FROM ORIGINAL
  // ============================================================================

  return {
    // Data
    allCommunities,
    myCommunities,
    loading,
    error,
    
    // Utility functions
    isUserMember,
    getCommunityBySlug,
    getCommunityById,
    
    // Actions - simplified API
    joinCommunity: async (communityId: string) => {
      try {
        await joinCommunity.mutateAsync(communityId);
        return true;
      } catch (err) {
        console.error('Error joining community:', err);
        return false;
      }
    },
    
    leaveCommunity: async (communityId: string) => {
      try {
        await leaveCommunity.mutateAsync(communityId);
        return true;
      } catch (err) {
        console.error('Error leaving community:', err);
        return false;
      }
    },
    
    createCommunity: async (data: CreateCommunityData) => {
      try {
        const community = await createCommunity.mutateAsync(data);
        return community;
      } catch (err) {
        console.error('Error creating community:', err);
        return null;
      }
    },
    
    updateCommunity: async (id: string, updates: Partial<CommunityRow>) => {
      try {
        const community = await updateCommunity.mutateAsync({ id, updates });
        return community;
      } catch (err) {
        console.error('Error updating community:', err);
        return null;
      }
    },
    
    // Loading states for UI feedback
    isJoiningCommunity: joinCommunity.isPending,
    isLeavingCommunity: leaveCommunity.isPending,
    isCreatingCommunity: createCommunity.isPending,
    isUpdatingCommunity: updateCommunity.isPending,
    
    // Individual loading states (bonus)
    loadingAll,
    loadingMine,
    
    // Refresh functions (for compatibility - though not needed with React Query)
    refetchAll: () => queryClient.invalidateQueries({ queryKey: ['communities', 'all'] }),
    refetchMine: () => queryClient.invalidateQueries({ queryKey: ['communities', 'user', user?.id] }),
  };
}

// ============================================================================
// BONUS: HOOK FOR SINGLE COMMUNITY (for detail pages)
// ============================================================================

export function useCommunity(slug: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: community,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as CommunityRow;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for individual community
  });

  // Check if user is member of this community
  const {
    data: membershipInfo,
    isLoading: loadingMembership,
  } = useQuery({
    queryKey: ['community', slug, 'membership', user?.id],
    queryFn: async () => {
      if (!user || !community) return null;
      
      const { data, error } = await supabase
        .from('community_members')
        .select('role, created_at')
        .eq('user_id', user.id)
        .eq('community_id', community.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!community,
    staleTime: 5 * 60 * 1000,
  });

  const isUserMember = !!membershipInfo;
  const userRole = membershipInfo?.role || null;
  const isUserAdmin = userRole === 'admin' || userRole === 'moderator';

  return {
    community,
    loading: loading || loadingMembership,
    error: error?.message || null,
    isUserMember,
    userRole,
    isUserAdmin,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
      queryClient.invalidateQueries({ queryKey: ['community', slug, 'membership', user?.id] });
    },
  };
}
