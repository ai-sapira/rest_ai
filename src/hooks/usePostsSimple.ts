/**
 * SIMPLE Posts Hook - React Query Direct Approach
 * Replaces complex usePosts with clean, maintainable code
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Types from original hook
export interface Post {
  id: string;
  community_id?: string;
  topic_id?: number;
  actor_type: 'user' | 'org';
  actor_user_id?: string;
  actor_org_id?: string;
  content: string;
  category?: string;
  region?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  profiles?: {
    full_name: string;
    avatar_url: string;
    restaurant_name: string;
  };
  organizations?: {
    name: string;
    logo_url: string;
  };
  communities?: {
    name: string;
    slug: string;
  };
  topics?: {
    name: string;
    color: string;
  };
  post_media?: Array<{
    url: string;
    media_type: string;
    width?: number;
    height?: number;
  }>;
  user_reaction?: Array<{
    reaction_type: string;
  }>;
}

interface UsePostsFilters {
  communityId?: string;
  topicId?: number;
  region?: string;
  limit?: number;
  onlyUserCommunities?: boolean; // For "Mi Red" tab
}

interface CreatePostData {
  content: string;
  communityId?: string;
  topicId?: number;
  actorType: 'user' | 'org';
  actorOrgId?: string;
  region?: string;
  category?: string;
}

// ============================================================================
// MAIN HOOK - INFINITE QUERY FOR PAGINATION
// ============================================================================

export function usePostsSimple(filters: UsePostsFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // ✅ CRITICAL: Removed circular dependency - fetch user communities directly here when needed

  // ✅ INFINITE QUERY for pagination (replaces complex pagination logic)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', {
      userId: user?.id || null,
      communityId: filters.communityId || null,
      topicId: filters.topicId || null,
      region: filters.region || null,
      limit: filters.limit || 20,
      onlyUserCommunities: filters.onlyUserCommunities || false,
    }],
    queryFn: async ({ pageParam }) => {
      // ✅ OPTIMIZED: Removed excessive logging
      const limit = filters.limit || 20;
      
      // ✅ CRITICAL: Get user communities directly (avoid circular dependency)
      let userCommunityIds: string[] = [];
      if (user && filters.onlyUserCommunities) {
        const { data: userCommunities } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);
        
        userCommunityIds = userCommunities?.map(c => c.community_id) || [];
      }

      // ✅ Build main query - simple and reliable (no joins)
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
        .limit(limit);

      // ✅ Apply filters
      // ✅ OPTIMIZED: Removed logging
      
      if (filters.communityId) {
        // Specific community filter
        query = query.eq('community_id', filters.communityId);
        // ✅ OPTIMIZED: Removed logging
      } else if (filters.onlyUserCommunities && user && userCommunityIds.length > 0) {
        // Only for "Mi Red" tab - show posts from user's communities
        query = query.in('community_id', userCommunityIds);
        // ✅ OPTIMIZED: Removed logging
      } else {
        // ✅ OPTIMIZED: Removed logging
      }
      // For "recientes" and "popular" tabs, show ALL public posts (no community filter)

      if (filters.topicId) {
        query = query.eq('topic_id', filters.topicId);
      }

      if (filters.region) {
        query = query.eq('region', filters.region);
      }

      // ✅ Pagination cursor
      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      // ✅ ROBUST: Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout

      // ✅ FIXED: Declare posts variable outside try-catch for proper scope
      let posts;
      
      try {
        const { data: postsData, error } = await query.abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) {
          console.error('❌ usePostsSimple: Query error:', error);
          throw new Error(`Error cargando posts: ${error.message}`);
        }
        
        if (!postsData || postsData.length === 0) {
          // ✅ OPTIMIZED: Removed logging
          return { posts: [], nextCursor: null };
        }

        posts = postsData; // ✅ Assign to outer scope variable
        // ✅ OPTIMIZED: Removed logging
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('La consulta tardó demasiado tiempo. Por favor, inténtalo de nuevo.');
        }
        throw error;
      }

      // ✅ Get ESSENTIAL data in parallel - maximum 2 queries for performance
      const userIds = [...new Set(posts.filter(p => p.actor_user_id).map(p => p.actor_user_id))];
      const communityIds = [...new Set(posts.filter(p => p.community_id).map(p => p.community_id))];
      const postIds = posts.map(p => p.id);

      const [profilesData, communitiesData] = await Promise.all([
        // Profiles - CRITICAL data needed for display
        userIds.length > 0 
          ? supabase.from('profiles').select('user_id, full_name, avatar_url, restaurant_name').in('user_id', userIds)
          : { data: [] },
        
        // Communities - CRITICAL data needed for display
        communityIds.length > 0 
          ? supabase.from('communities').select('id, name, slug').in('id', communityIds)
          : { data: [] }
      ]);

      // ✅ Create lookup maps for essential data
      const profilesMap = new Map(profilesData.data?.map(p => [p.user_id, p]) || []);
      const communitiesMap = new Map(communitiesData.data?.map(c => [c.id, c]) || []);

      // ✅ Join essential data efficiently
      const processedPosts = posts.map(post => ({
        ...post,
        profiles: post.actor_user_id ? profilesMap.get(post.actor_user_id) : undefined,
        communities: post.community_id ? communitiesMap.get(post.community_id) : undefined,
        // Optional data will be loaded lazily or on-demand
        organizations: undefined, // Could be loaded later if needed
        topics: undefined, // Could be loaded later if needed
        post_media: [], // Could be loaded later if needed
        user_reaction: [], // Will be loaded separately for performance
      }));

      // ✅ OPTIMIZED: Removed logging

      // ✅ Load user reactions separately if needed (non-blocking)
      if (user) {
        // Non-blocking query for user reactions
        supabase
          .from('reactions')
          .select('resource_id, reaction_type')
          .eq('user_id', user.id)
          .eq('resource_type', 'post')
          .in('resource_id', postIds)
          .then(({ data: reactionsData }) => {
            // Update cache with reactions (optional enhancement)
            if (reactionsData) {
              const reactionsMap = new Map(reactionsData.map(r => [r.resource_id, r]));
              // This could update the React Query cache if needed
            }
          })
          .catch(() => {
            // Ignore errors for non-critical data
          });
      }

      return {
        posts: processedPosts,
        nextCursor: processedPosts.length === limit 
          ? processedPosts[processedPosts.length - 1]?.created_at 
          : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true, // Always enabled, but conditional logic inside
    staleTime: 0, // ✅ CRITICAL: NO CACHE - Always fetch fresh 
    gcTime: 0, // ✅ CRITICAL: NO CACHE - Immediate cleanup
    retry: (failureCount, error) => {
      console.error(`❌ usePostsSimple: Query failed (attempt ${failureCount}):`, error);
      return failureCount < 2; // ✅ CRITICAL: Reduced retries to fail faster
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // ✅ CRITICAL: Exponential backoff with max 3s
    onError: (error) => {
      console.error('❌ usePostsSimple: Query error:', error);
    },
    onSuccess: (data) => {
      // ✅ OPTIMIZED: Removed logging
    }
  });

  // ✅ Flatten pages into single posts array
  const posts = data?.pages.flatMap(page => page.posts) || [];
  const hasMore = hasNextPage;
  const loading = isLoading;
  
  // ✅ OPTIMIZED: Removed excessive logging that impacts performance
  // Only log on errors or in development
  if (error && process.env.NODE_ENV === 'development') {
    console.error('🔍 usePostsSimple error:', error.message);
  }

  // ============================================================================
  // MUTATIONS - CREATE POST AND TOGGLE LIKE
  // ============================================================================

  const createPost = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      if (!user) throw new Error('Must be logged in to create post');

      const insertData = {
        content: postData.content,
        community_id: postData.communityId && postData.communityId !== 'general' ? postData.communityId : null,
        topic_id: postData.topicId || null,
        actor_type: postData.actorType,
        actor_user_id: postData.actorType === 'user' ? user.id : null,
        actor_org_id: postData.actorOrgId || null,
        region: postData.region || null,
        category: postData.category || null,
        visibility: 'public',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_pinned: false,
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      // ✅ Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in to like post');

      // Check if already liked
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', user.id)
        .eq('resource_type', 'post')
        .eq('resource_id', postId)
        .single();

      if (existingReaction) {
        // Remove like
        await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_type', 'post')
          .eq('resource_id', postId);
        
        return { action: 'removed', postId };
      } else {
        // Add like
        await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            resource_type: 'post',
            resource_id: postId,
            reaction_type: 'like',
          });
        
        return { action: 'added', postId };
      }
    },
    onMutate: async (postId) => {
      // ✅ Optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousData = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              if (post.id === postId) {
                const hasReaction = post.user_reaction && post.user_reaction.length > 0;
                return {
                  ...post,
                  likes_count: hasReaction 
                    ? Math.max(0, post.likes_count - 1)
                    : post.likes_count + 1,
                  user_reaction: hasReaction ? [] : [{ reaction_type: 'like' }],
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      // ✅ Revert optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      }
    },
    onSettled: () => {
      // ✅ Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // ============================================================================
  // RETURN - COMPATIBLE API WITH ORIGINAL usePosts
  // ============================================================================

  return {
    // Data
    posts,
    loading,
    hasMore,
    
    // Actions - simplified API
    createPost: async (postData: CreatePostData) => {
      try {
        const post = await createPost.mutateAsync(postData);
        return { data: post, error: null };
      } catch (error) {
        console.error('Error creating post:', error);
        return { data: null, error };
      }
    },
    
    toggleLike: async (postId: string) => {
      try {
        await toggleLike.mutateAsync(postId);
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    
    loadMore: () => {
      if (hasMore && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    
    refresh: () => refetch(),
    
    // Loading states for UI feedback
    isCreatingPost: createPost.isPending,
    isTogglingLike: toggleLike.isPending,
    isLoadingMore: isFetchingNextPage,
    
    // Error states
    error: error?.message || null,
    createPostError: createPost.error?.message || null,
    toggleLikeError: toggleLike.error?.message || null,
  };
}

// ============================================================================
// BONUS: HOOK FOR SINGLE POST (for detail pages)
// ============================================================================

export function usePost(postId: string) {
  const { user } = useAuth();

  const {
    data: post,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      // ✅ VALIDATION: Ensure postId is valid
      if (!postId || typeof postId !== 'string' || postId.trim() === '') {
        throw new Error('Invalid post ID provided');
      }

      // ✅ OPTIMIZED: Removed logging

      // ✅ STEP 1: Get main post data with error handling
      const { data: post, error: postError } = await supabase
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
          updated_at,
          deleted_at
        `)
        .eq('id', postId.trim())
        .is('deleted_at', null) // Only non-deleted posts
        .single();

      if (postError) {
        console.error('❌ usePost: Post fetch error:', postError);
        throw new Error(`Failed to fetch post: ${postError.message}`);
      }

      if (!post) {
        console.warn('⚠️ usePost: Post not found:', postId);
        throw new Error('Post not found');
      }

      // ✅ OPTIMIZED: Removed logging

      // ✅ STEP 2: Get related data in parallel with robust error handling
      const promises = [];

      // Profile data (if user post)
      if (post.actor_user_id) {
        promises.push(
          supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url, restaurant_name')
            .eq('user_id', post.actor_user_id)
            .single()
            .then(result => ({ type: 'profile', data: result.data, error: result.error }))
        );
      } else {
        promises.push(Promise.resolve({ type: 'profile', data: null, error: null }));
      }

      // Community data (if community post)
      if (post.community_id) {
        promises.push(
          supabase
            .from('communities')
            .select('id, name, slug, avatar_url')
            .eq('id', post.community_id)
            .single()
            .then(result => ({ type: 'community', data: result.data, error: result.error }))
        );
      } else {
        promises.push(Promise.resolve({ type: 'community', data: null, error: null }));
      }

      // Organization data (if org post)
      if (post.actor_org_id) {
        promises.push(
          supabase
            .from('organizations')
            .select('id, name, logo_url')
            .eq('id', post.actor_org_id)
            .single()
            .then(result => ({ type: 'organization', data: result.data, error: result.error }))
        );
      } else {
        promises.push(Promise.resolve({ type: 'organization', data: null, error: null }));
      }

      // ✅ CRITICAL: User reactions (if logged in)
      if (user) {
        promises.push(
          supabase
            .from('reactions')
            .select('reaction_type')
            .eq('user_id', user.id)
            .eq('resource_type', 'post')
            .eq('resource_id', post.id)
            .then(result => ({ type: 'reactions', data: result.data || [], error: result.error }))
        );
      } else {
        promises.push(Promise.resolve({ type: 'reactions', data: [], error: null }));
      }

      // ✅ CRITICAL: Post media
      promises.push(
        supabase
          .from('post_media')
          .select('url, media_type, width, height')
          .eq('post_id', post.id)
          .then(result => ({ type: 'media', data: result.data || [], error: result.error }))
      );

      // Execute all queries in parallel
      const results = await Promise.all(promises);

      // ✅ OPTIMIZED: Removed logging

      // ✅ STEP 3: Process results with error tolerance
      let profileData = null;
      let communityData = null;
      let organizationData = null;
      let reactionsData = [];
      let mediaData = [];

      results.forEach(result => {
        if (result.error) {
          console.warn(`⚠️ usePost: ${result.type} fetch warning:`, result.error);
        }
        
        switch (result.type) {
          case 'profile':
            profileData = result.data;
            break;
          case 'community':
            communityData = result.data;
            break;
          case 'organization':
            organizationData = result.data;
            break;
          case 'reactions':
            reactionsData = result.data || [];
            break;
          case 'media':
            mediaData = result.data || [];
            break;
        }
      });

      // ✅ STEP 4: Construct robust post object
      const enrichedPost = {
        ...post,
        // Essential data that's always present
        profiles: profileData,
        communities: communityData,
        organizations: organizationData,
        
        // ✅ CRITICAL: Data that was missing before
        post_media: mediaData,
        user_reaction: reactionsData,
        
        // Optional data
        topics: null,
        
        // Computed fields
        author_name: profileData?.full_name || profileData?.restaurant_name || 'Usuario anónimo',
        community_name: communityData?.name || 'General',
        
        // Fallback values
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
      };

      // ✅ OPTIMIZED: Removed logging
      return enrichedPost;
    },
    enabled: !!postId && postId.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      console.warn(`🔄 usePost: Retry attempt ${failureCount} for post ${postId}:`, error);
      return failureCount < 3; // Max 3 retries
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });

  // ✅ MUTATION for handling post reactions (solves the setPost issue)
  const queryClient = useQueryClient();
  
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !post) throw new Error('User or post not available');
      
      const hasLiked = post.user_reaction?.length > 0;
      
      if (hasLiked) {
        // Remove like
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_type', 'post')
          .eq('resource_id', post.id);
        if (error) throw error;
        return 'removed';
      } else {
        // Add like
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            resource_type: 'post',
            resource_id: post.id,
            reaction_type: 'like'
          });
        if (error) throw error;
        return 'added';
      }
    },
    onMutate: async () => {
      // ✅ Optimistic update
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      const previousData = queryClient.getQueryData(['post', postId]);
      
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old;
        
        const hasReaction = old.user_reaction && old.user_reaction.length > 0;
        
        return {
          ...old,
          likes_count: hasReaction 
            ? Math.max(0, old.likes_count - 1)
            : old.likes_count + 1,
          user_reaction: hasReaction ? [] : [{ reaction_type: 'like' }],
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // ✅ Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(['post', postId], context.previousData);
      }
      console.error('Error toggling like:', err);
    },
    onSettled: () => {
      // ✅ Ensure consistency
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  return {
    post: post || null,
    loading,
    error: error?.message || null,
    
    // ✅ NEW: Robust like toggle function
    toggleLike: () => toggleLikeMutation.mutate(),
    isTogglingLike: toggleLikeMutation.isPending,
  };
}
