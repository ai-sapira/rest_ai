import { supabase } from '@/lib/supabase';

// Community interface
export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hashtag: string | null;
  is_public: boolean;
  avatar_url: string | null;
  member_count: number;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
  joined_at?: string | null; // For user's communities
}

// Communities service
export const communitiesService = {
  // Get user's communities (the ones they follow)
  getUserCommunities: async (userId: string): Promise<Community[]> => {
    console.log('🔍 communitiesService.getUserCommunities CALLED with userId:', userId);
    
    if (!userId) {
      console.log('🔍 communitiesService.getUserCommunities: No userId provided');
      return [];
    }

    console.log('🔍 communitiesService.getUserCommunities: Executing Supabase query...');
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        created_at,
        communities!inner (
          id, slug, name, description, hashtag, is_public,
          avatar_url, member_count, banner_url, created_at, updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('🔍 communitiesService.getUserCommunities ERROR:', error);
      return [];
    }

    console.log('🔍 communitiesService.getUserCommunities: Raw data from Supabase:', data);
    const result = (data || []).map(item => ({
      ...item.communities,
      joined_at: item.created_at,
    }));
    console.log('🔍 communitiesService.getUserCommunities: Returning', result.length, 'communities');
    
    return result;
  },

  // Get all public communities
  getAllCommunities: async (limit = 50): Promise<Community[]> => {
    const { data, error } = await supabase
      .from('communities')
      .select('id, slug, name, description, hashtag, is_public, avatar_url, member_count, banner_url, created_at, updated_at')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all communities:', error);
      return [];
    }

    return data || [];
  },

  // Get community by slug
  getCommunityBySlug: async (slug: string): Promise<Community | null> => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching community by slug:', error);
      return null;
    }

    return data;
  },

  // Join a community
  joinCommunity: async (userId: string, communityId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('community_members')
      .insert({
        user_id: userId,
        community_id: communityId,
      });

    if (error) {
      console.error('Error joining community:', error);
      return false;
    }

    // Update member count
    await supabase.rpc('increment_community_members', {
      community_id: communityId
    });

    return true;
  },

  // Leave a community
  leaveCommunity: async (userId: string, communityId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('user_id', userId)
      .eq('community_id', communityId);

    if (error) {
      console.error('Error leaving community:', error);
      return false;
    }

    // Update member count
    await supabase.rpc('decrement_community_members', {
      community_id: communityId
    });

    return true;
  },
};
