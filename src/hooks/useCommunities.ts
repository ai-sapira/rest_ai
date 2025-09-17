import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { communitiesService, type Community } from '@/services/communities.service';

// Hook for managing communities
export function useCommunities() {
  const { user, loading: authLoading } = useAuth();
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // 🔍 DEEP DEBUG: Track all state changes
  console.log('🔍 useCommunities STATE:', {
    authLoading,
    userExists: !!user,
    userId: user?.id,
    userCommunitiesCount: userCommunities.length,
    allCommunitiesCount: allCommunities.length,
    loading,
    error
  });

  // Fetch user's communities
  const fetchUserCommunities = async () => {
    console.log('🔍 fetchUserCommunities CALLED - user:', !!user, user?.id);
    
    if (!user) {
      console.log('🔍 fetchUserCommunities: No user, setting empty array');
      setUserCommunities([]);
      return;
    }

    try {
      console.log('🔍 fetchUserCommunities: Calling service for user:', user.id);
      const communities = await communitiesService.getUserCommunities(user.id);
      console.log('🔍 fetchUserCommunities: Got', communities.length, 'communities');
      setUserCommunities(communities);
    } catch (err: any) {
      console.error('🔍 fetchUserCommunities ERROR:', err);
      setError(err.message);
    }
  };

  // Fetch all communities
  const fetchAllCommunities = async () => {
    try {
      const communities = await communitiesService.getAllCommunities();
      setAllCommunities(communities);
    } catch (err: any) {
      console.error('Error fetching all communities:', err);
      setError(err.message);
    }
  };

  // Refresh both lists with debounce to prevent multiple calls
  const refresh = async () => {
    console.log('🔍 refresh CALLED - authLoading:', authLoading, 'user:', !!user);
    
    if (authLoading) {
      console.log('🔍 refresh: Auth still loading, skipping');
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      console.log('🔍 refresh: Cancelling previous refresh timeout');
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debounce refresh calls
    refreshTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 refresh: Starting fetch...');
        await Promise.all([
          fetchUserCommunities(),
          fetchAllCommunities(),
        ]);
        console.log('🔍 refresh: Fetch completed');
      } finally {
        setLoading(false);
      }
    }, 100); // 100ms debounce
  };

  // Join a community
  const joinCommunity = async (communityId: string) => {
    if (!user) return false;
    
    const success = await communitiesService.joinCommunity(user.id, communityId);
    if (success) {
      await refresh(); // Refresh lists after joining
    }
    return success;
  };

  // Leave a community
  const leaveCommunity = async (communityId: string) => {
    if (!user) return false;
    
    const success = await communitiesService.leaveCommunity(user.id, communityId);
    if (success) {
      await refresh(); // Refresh lists after leaving
    }
    return success;
  };

  // Single useEffect that handles both auth state and initial mount
  useEffect(() => {
    console.log('🔍 useCommunities useEffect TRIGGERED:', { authLoading, userId: user?.id });
    
    // Only proceed if auth is not loading
    if (!authLoading) {
      console.log('🔄 useCommunities: Auth ready, loading data');
      refresh();
    } else {
      console.log('🔄 useCommunities: Auth still loading, waiting...');
    }

    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current) {
        console.log('🔍 useCommunities: Cleaning up refresh timeout');
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [authLoading, user?.id]); // Will trigger on auth changes AND initial mount

  return {
    // Data
    userCommunities,     // Communities the user follows
    allCommunities,      // All public communities
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    joinCommunity,
    leaveCommunity,
  };
}