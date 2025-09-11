import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Post {
  id: string
  community_id?: string
  topic_id?: number
  actor_type: 'user' | 'org'
  actor_user_id?: string
  actor_org_id?: string
  content: string
  category?: string
  region?: string
  likes_count: number
  comments_count: number
  shares_count: number
  visibility: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  
  // Joined data
  profiles?: {
    full_name: string
    avatar_url: string
    restaurant_name: string
  }
  organizations?: {
    name: string
    logo_url: string
  }
  communities?: {
    name: string
    slug: string
  }
  topics?: {
    name: string
    color: string
  }
  post_media?: Array<{
    url: string
    media_type: string
    width?: number
    height?: number
  }>
  user_reaction?: Array<{
    reaction_type: string
  }>
}

interface UsePostsFilters {
  communityId?: string
  topicId?: number
  region?: string
  limit?: number
}

export function usePosts(filters: UsePostsFilters = {}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastFetchKey, setLastFetchKey] = useState<string>('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const { user } = useAuth()

  const fetchPosts = useCallback(async (cursor?: string, replace = false) => {
    try {
      // Cancel previous request if exists
      if (abortController) {
        abortController.abort();
      }

      // Create new abort controller
      const newAbortController = new AbortController();
      setAbortController(newAbortController);

      // Add timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        newAbortController.abort();
      }, 10000); // 10 second timeout

      // First get user's communities if authenticated
      let userCommunityIds: string[] = []
      if (user) {
        const { data: userCommunities } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id)
        
        userCommunityIds = userCommunities?.map(c => c.community_id) || []
      }

      let query = supabase
        .from('posts')
        // Fetch only necessary columns for initial paint
        .select('id, community_id, topic_id, actor_type, actor_user_id, actor_org_id, content, category, region, likes_count, comments_count, shares_count, visibility, is_pinned, created_at, updated_at')
        .is('deleted_at', null)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(Math.min(filters.limit || 20, 20))

      // Filter to show posts from communities user is member of OR public posts (no community)
      if (user && userCommunityIds.length > 0) {
        // Use a different approach: filter in application after fetching
        console.log('usePosts userCommunityIds:', userCommunityIds)
        // Note: We'll filter posts after fetching to avoid complex OR queries
      } else {
        // If not authenticated, show only public posts (no community)
        query = query.is('community_id', null)
      }

      // Apply filters
      if (filters.communityId) {
        query = query.eq('community_id', filters.communityId)
      }
      if (filters.topicId) {
        query = query.eq('topic_id', filters.topicId)
      }
      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      
      // Handle pagination
      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      // Filter user reactions if authenticated
      // Temporarily commented out to debug
      // if (user) {
      //   query = query.eq('reactions.user_id', user.id)
      // }

      const { data, error } = await query

      console.log('usePosts query result:', { data, error })

      if (!error && data) {
        let newPosts = data as Post[]
        
        if (newPosts.length > 0) {
          // Fast path: if user is not authenticated, skip costly enrichment queries
          if (!user) {
            console.log('usePosts: unauthenticated fast path, posts:', newPosts.length)
            setHasMore(newPosts.length === (filters.limit || 20))
            if (replace || !cursor) {
              setPosts(newPosts)
            } else {
              setPosts(prev => {
                const existingIds = new Set(prev.map(p => p.id))
                const uniqueNew = newPosts.filter(p => !existingIds.has(p.id))
                return [...prev, ...uniqueNew]
              })
            }
            clearTimeout(timeoutId)
            setAbortController(null)
            return
          }

          // Get unique user IDs, org IDs, community IDs
          const userIds = [...new Set(newPosts.map(p => p.actor_user_id).filter(Boolean))]
          const orgIds = [...new Set(newPosts.map(p => p.actor_org_id).filter(Boolean))]
          const communityIds = [...new Set(newPosts.map(p => p.community_id).filter(Boolean))]
          const topicIds = [...new Set(newPosts.map(p => p.topic_id).filter(Boolean))]
          const postIds = newPosts.map(p => p.id)

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
            user ? supabase
              .from('reactions')
              .select('resource_id, reaction_type')
              .eq('user_id', user.id)
              .eq('resource_type', 'post')
              .in('resource_id', postIds) : Promise.resolve({ data: [] })
          ])

          // Create lookup maps
          const profilesMap = new Map((profilesData.data || []).map(p => [p.user_id, p]))
          const orgsMap = new Map((orgsData.data || []).map(o => [o.id, o]))
          const communitiesMap = new Map((communitiesData.data || []).map(c => [c.id, c]))
          const topicsMap = new Map((topicsData.data || []).map(t => [t.id, t]))
          const mediaMap = new Map()
          const reactionsMap = new Map()

          // Group media by post_id
          ;(mediaData.data || []).forEach(media => {
            const postId = media.post_id
            if (!mediaMap.has(postId)) mediaMap.set(postId, [])
            mediaMap.get(postId).push(media)
          })

          // Group reactions by resource_id
          ;(reactionsData.data || []).forEach(reaction => {
            const postId = reaction.resource_id
            if (!reactionsMap.has(postId)) reactionsMap.set(postId, [])
            reactionsMap.get(postId).push(reaction)
          })

          // Enrich posts with related data
          newPosts = newPosts.map(post => ({
            ...post,
            profiles: post.actor_user_id ? profilesMap.get(post.actor_user_id) : undefined,
            organizations: post.actor_org_id ? orgsMap.get(post.actor_org_id) : undefined,
            communities: post.community_id ? communitiesMap.get(post.community_id) : undefined,
            topics: post.topic_id ? topicsMap.get(post.topic_id) : undefined,
            post_media: mediaMap.get(post.id) || [],
            user_reaction: reactionsMap.get(post.id) || []
          }))

          // Filter posts based on user's community membership
          if (user && userCommunityIds.length > 0) {
            newPosts = newPosts.filter(post => {
              // Show posts with no community (general posts) OR posts from user's communities
              return !post.community_id || userCommunityIds.includes(post.community_id)
            })
            console.log(`usePosts: Filtered to ${newPosts.length} posts from user's communities`)
          }
        }
        
        console.log('usePosts newPosts:', newPosts.length, newPosts)
        
        if (replace || !cursor) {
          setPosts(newPosts)
        } else {
          // Merge posts and remove duplicates
          setPosts(prev => {
            const existingIds = new Set(prev.map(post => post.id))
            const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id))
            return [...prev, ...uniqueNewPosts]
          })
        }
        
        setHasMore(newPosts.length === (filters.limit || 20))
      } else if (error) {
        console.error('usePosts error:', error)
      }

      // Clear timeout and abort controller
      clearTimeout(timeoutId);
      setAbortController(null);
      
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);
      setAbortController(null);
      
      // Only log error if it's not an abort
      if (error.name !== 'AbortError') {
        console.error('Error fetching posts:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [user, filters.communityId, filters.topicId, filters.region, filters.limit, abortController])

  const createPost = async (postData: {
    content: string
    communityId?: string
    topicId?: number
    actorType: 'user' | 'org'
    actorOrgId?: string
    region?: string
    category?: string
  }) => {
    if (!user) {
      console.error('User not authenticated')
      return { error: new Error('User not authenticated') }
    }

    console.log('Creating post with data:', postData)

    try {
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
        is_pinned: false
      }

      console.log('Inserting post data:', insertData)

      const { data: post, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single()

      console.log('Post creation result:', { post, error })

      if (error) {
        console.error('Supabase error creating post:', error)
        return { data: null, error }
      }

      if (post) {
        console.log('Post created successfully, refreshing posts...')
        // Refresh posts to show the new one
        await fetchPosts(undefined, true)
        return { data: post, error: null }
      }

      return { data: null, error: new Error('No post returned') }
    } catch (error) {
      console.error('Error creating post:', error)
      return { data: null, error }
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return

    try {
      // Check if already liked
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', user.id)
        .eq('resource_type', 'post')
        .eq('resource_id', postId)
        .single()

      if (existingReaction) {
        // Remove like
        await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_type', 'post')
          .eq('resource_id', postId)
      } else {
        // Add like
        await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            resource_type: 'post',
            resource_id: postId,
            reaction_type: 'like'
          })
      }

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: existingReaction 
                ? Math.max(0, post.likes_count - 1)
                : post.likes_count + 1,
              user_reaction: existingReaction ? [] : [{ reaction_type: 'like' }]
            }
          : post
      ))

    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const loadMore = useCallback(() => {
    if (hasMore && posts.length > 0 && !loading) {
      const lastPost = posts[posts.length - 1]
      fetchPosts(lastPost.created_at, false)
    }
  }, [hasMore, posts, loading, fetchPosts])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchPosts(undefined, true)
  }, [fetchPosts])

  useEffect(() => {
    // Create a key based on the actual filtering criteria
    const currentFetchKey = JSON.stringify({
      userId: user?.id || null,
      communityId: filters.communityId || null,
      topicId: filters.topicId || null,
      region: filters.region || null,
      limit: filters.limit || 20
    });

    // Only fetch if the key has actually changed
    if (currentFetchKey !== lastFetchKey) {
      console.log('usePosts: Fetch key changed, fetching posts:', currentFetchKey);
      setLastFetchKey(currentFetchKey);
      setPosts([]);
      setHasMore(true);
      setLoading(true);
      fetchPosts();
    }
  }, [user?.id, filters.communityId, filters.topicId, filters.region, filters.limit, lastFetchKey, fetchPosts])

  return {
    posts,
    loading,
    hasMore,
    createPost,
    toggleLike,
    loadMore,
    refresh,
  }
}
