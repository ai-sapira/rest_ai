import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { communitiesService, type Community } from '@/services/communities.service';

// Hook for managing communities
export function useCommunities() {
  const { user, loading: authLoading } = useAuth();
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Refresh both lists
  const refresh = async () => {
    console.log('🔍 refresh CALLED - authLoading:', authLoading, 'user:', !!user);
    
    if (authLoading) {
      console.log('🔍 refresh: Auth still loading, skipping');
      return;
    }
    
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

  // Initial fetch when auth is ready
  useEffect(() => {
    console.log('🔍 useEffect [authLoading, user?.id] TRIGGERED:', { authLoading, userId: user?.id });
    if (!authLoading) {
      console.log('🔄 useCommunities: Auth ready, triggering refresh');
      refresh();
    } else {
      console.log('🔄 useCommunities: Auth still loading, waiting...');
    }
  }, [authLoading, user?.id]);

  // Initial load when component mounts - single call only
  useEffect(() => {
    console.log('🔍 useCommunities: Component mounted');
    // Only refresh if auth is already ready to avoid duplicate calls
    if (!authLoading && user !== undefined) {
      console.log('🔄 useCommunities: Auth ready on mount, loading data');
      refresh();
    }
  }, []); // Run once on mount

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