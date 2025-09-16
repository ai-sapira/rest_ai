/**
 * Centralized API service for Supabase queries
 * This replaces individual hooks with optimized, cached queries
 */

import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// ============================================================================
// USERS & PROFILES
// ============================================================================

export const userQueries = {
  // Get current user profile
  profile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get work experiences for user
  workExperiences: async (userId: string) => {
    const { data, error } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get education for user
  education: async (userId: string) => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get complete user data in one optimized call
  completeProfile: async (userId: string) => {
    const [profile, workExperiences, education] = await Promise.all([
      userQueries.profile(userId),
      userQueries.workExperiences(userId),
      userQueries.education(userId),
    ]);
    
    return {
      profile,
      workExperiences,
      education,
    };
  },
};

// ============================================================================
// COMMUNITIES
// ============================================================================

export const communityQueries = {
  // Get all communities with member count
  all: async (limit = 50) => {
    const { data, error } = await supabase
      .from('communities')
      .select('id, slug, name, description, hashtag, is_public, avatar_url, member_count')
      .range(0, limit - 1)
      .order('member_count', { ascending: false });
    
    if (error) throw error;
    
    // Deduplicate by id
    const uniqueCommunities = (data || []).filter((community, index, self) => 
      community && self.findIndex(c => c?.id === community.id) === index
    );
    
    return uniqueCommunities;
  },

  // Get user's communities
  mine: async (userId: string) => {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        community_id,
        joined_at,
        communities!inner (
          id,
          slug,
          name,
          description,
          hashtag,
          is_public,
          avatar_url,
          member_count
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item.communities,
      joined_at: item.joined_at,
    }));
  },

  // Get single community by slug
  bySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get community rules
  rules: async (communityId: string) => {
    const { data, error } = await supabase
      .from('community_rules')
      .select('*')
      .eq('community_id', communityId)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// POSTS
// ============================================================================

export const postQueries = {
  // Optimized posts query with minimal data for list view
  list: async (filters: {
    limit?: number;
    cursor?: string;
    communityIds?: string[];
    region?: string;
  } = {}) => {
    const { limit = 20, cursor, communityIds, region } = filters;
    
    let query = supabase
      .from('posts')
      .select(`
        id,
        community_id,
        topic_id, 
        actor_type,
        actor_user_id,
        actor_org_id,
        content,
        category,
        region,
        likes_count,
        comments_count,
        shares_count,
        visibility,
        is_pinned,
        created_at,
        updated_at
      `)
      .is('deleted_at', null)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 20));

    // Apply filters
    if (communityIds && communityIds.length > 0) {
      query = query.in('community_id', communityIds);
    }
    
    if (region) {
      query = query.eq('region', region);
    }
    
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  },

  // Get enriched posts with all related data
  enriched: async (postIds: string[], userId?: string) => {
    if (postIds.length === 0) return [];
    
    // Get unique IDs for related data
    const posts = await postQueries.list({ limit: 100 });
    const filteredPosts = posts.filter(p => postIds.includes(p.id));
    
    const userIds = [...new Set(filteredPosts.map(p => p.actor_user_id).filter(Boolean))];
    const orgIds = [...new Set(filteredPosts.map(p => p.actor_org_id).filter(Boolean))];
    const communityIds = [...new Set(filteredPosts.map(p => p.community_id).filter(Boolean))];
    const topicIds = [...new Set(filteredPosts.map(p => p.topic_id).filter(Boolean))];

    // Fetch related data in parallel
    const [profilesData, orgsData, communitiesData, topicsData, mediaData, reactionsData] = await Promise.all([
      // Profiles
      userIds.length > 0 ? supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, restaurant_name')
        .in('user_id', userIds) : Promise.resolve({ data: [] }),
      
      // Organizations  
      orgIds.length > 0 ? supabase
        .from('organizations')
        .select('id, name, logo_url')
        .in('id', orgIds) : Promise.resolve({ data: [] }),
      
      // Communities
      communityIds.length > 0 ? supabase
        .from('communities')
        .select('id, name, slug')
        .in('id', communityIds) : Promise.resolve({ data: [] }),
      
      // Topics
      topicIds.length > 0 ? supabase
        .from('topics')
        .select('id, name, color')
        .in('id', topicIds) : Promise.resolve({ data: [] }),
      
      // Post media
      supabase
        .from('post_media')
        .select('post_id, url, media_type, width, height')
        .in('post_id', postIds),
      
      // User reactions (if authenticated)
      userId ? supabase
        .from('reactions')
        .select('resource_id, reaction_type')
        .eq('user_id', userId)
        .eq('resource_type', 'post')
        .in('resource_id', postIds) : Promise.resolve({ data: [] })
    ]);

    // Create lookup maps for efficient data joining
    const profilesMap = new Map((profilesData.data || []).map(p => [p.user_id, p]));
    const orgsMap = new Map((orgsData.data || []).map(o => [o.id, o]));
    const communitiesMap = new Map((communitiesData.data || []).map(c => [c.id, c]));
    const topicsMap = new Map((topicsData.data || []).map(t => [t.id, t]));
    
    const mediaMap = new Map();
    (mediaData.data || []).forEach(media => {
      if (!mediaMap.has(media.post_id)) {
        mediaMap.set(media.post_id, []);
      }
      mediaMap.get(media.post_id).push(media);
    });
    
    const reactionsMap = new Map((reactionsData.data || []).map(r => [r.resource_id, r.reaction_type]));

    // Enrich posts with related data
    return filteredPosts.map(post => ({
      ...post,
      author: post.actor_user_id ? profilesMap.get(post.actor_user_id) : null,
      organization: post.actor_org_id ? orgsMap.get(post.actor_org_id) : null,
      community: post.community_id ? communitiesMap.get(post.community_id) : null,
      topic: post.topic_id ? topicsMap.get(post.topic_id) : null,
      media: mediaMap.get(post.id) || [],
      user_reaction: userId ? reactionsMap.get(post.id) : null,
      is_liked: userId ? reactionsMap.get(post.id) === 'like' : false,
    }));
  },
};

// ============================================================================
// ANUNCIOS
// ============================================================================

export const anuncioQueries = {
  // Get all active anuncios
  all: async () => {
    const { data, error } = await supabase
      .from('anuncios_with_provider')
      .select('*')
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user's anuncios
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('anuncios_with_provider')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single anuncio by ID
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('anuncios_with_provider')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get anuncios by category
  byCategory: async (categoria: string) => {
    const { data, error } = await supabase
      .from('anuncios_with_provider')
      .select('*')
      .eq('categoria', categoria)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// TRANSACTIONS & OFFERS
// ============================================================================

export const transactionQueries = {
  // Get user's transactions (as buyer or seller)
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user's offers (as buyer or seller)
  offersByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// MESSAGES
// ============================================================================

export const messageQueries = {
  // Get messages for transaction or offer
  byTransactionOrOffer: async (transactionId?: string, offerId?: string) => {
    if (!transactionId && !offerId) return [];

    let query = supabase
      .from('transaction_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (transactionId) {
      query = query.eq('transaction_id', transactionId);
    } else if (offerId) {
      query = query.eq('offer_id', offerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// QUERY KEYS - For React Query cache management
// ============================================================================

export const queryKeys = {
  // Users
  userProfile: (userId: string) => ['user', 'profile', userId],
  userWorkExperiences: (userId: string) => ['user', 'work-experiences', userId],
  userEducation: (userId: string) => ['user', 'education', userId],
  userComplete: (userId: string) => ['user', 'complete', userId],
  
  // Communities
  communities: ['communities'],
  communitiesAll: () => [...queryKeys.communities, 'all'],
  communitiesMine: (userId: string) => [...queryKeys.communities, 'mine', userId],
  community: (slug: string) => [...queryKeys.communities, 'detail', slug],
  communityRules: (communityId: string) => [...queryKeys.communities, 'rules', communityId],
  
  // Posts
  posts: ['posts'],
  postsList: (filters: any) => [...queryKeys.posts, 'list', filters],
  postsEnriched: (postIds: string[], userId?: string) => [...queryKeys.posts, 'enriched', postIds, userId],
  
  // Anuncios
  anuncios: ['anuncios'],
  anunciosAll: () => [...queryKeys.anuncios, 'all'],
  anunciosByUser: (userId: string) => [...queryKeys.anuncios, 'by-user', userId],
  anuncio: (id: string) => [...queryKeys.anuncios, 'detail', id],
  anunciosByCategory: (categoria: string) => [...queryKeys.anuncios, 'by-category', categoria],
  
  // Transactions
  transactions: ['transactions'],
  transactionsByUser: (userId: string) => [...queryKeys.transactions, 'by-user', userId],
  offersByUser: (userId: string) => ['offers', 'by-user', userId],
  
  // Messages
  messages: ['messages'],
  messagesByTransaction: (transactionId: string) => [...queryKeys.messages, 'transaction', transactionId],
  messagesByOffer: (offerId: string) => [...queryKeys.messages, 'offer', offerId],
};
