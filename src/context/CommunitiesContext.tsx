import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { communitiesService, type Community } from '@/services/communities.service';

// Communities context interface
interface CommunitiesContextType {
  userCommunities: Community[];
  allCommunities: Community[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  joinCommunity: (communityId: string) => Promise<boolean>;
  leaveCommunity: (communityId: string) => Promise<boolean>;
}

// Create context
const CommunitiesContext = createContext<CommunitiesContextType | undefined>(undefined);

// CommunitiesProvider component
export function CommunitiesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // 🔍 GLOBAL DEBUG: Track state changes
  console.log('🔍 CommunitiesContext STATE:', {
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
    console.log('🔍 CommunitiesContext fetchUserCommunities CALLED - user:', !!user, user?.id);
    
    if (!user) {
      console.log('🔍 CommunitiesContext fetchUserCommunities: No user, setting empty array');
      setUserCommunities([]);
      return;
    }

    try {
      console.log('🔍 CommunitiesContext fetchUserCommunities: Calling service for user:', user.id);
      const communities = await communitiesService.getUserCommunities(user.id);
      console.log('🔍 CommunitiesContext fetchUserCommunities: Got', communities.length, 'communities');
      setUserCommunities(communities);
    } catch (err: any) {
      console.error('🔍 CommunitiesContext fetchUserCommunities ERROR:', err);
      setError(err.message);
    }
  };

  // Fetch all communities
  const fetchAllCommunities = async () => {
    try {
      const communities = await communitiesService.getAllCommunities();
      setAllCommunities(communities);
    } catch (err: any) {
      console.error('CommunitiesContext Error fetching all communities:', err);
      setError(err.message);
    }
  };

  // Refresh both lists with debounce to prevent multiple calls
  const refresh = async () => {
    console.log('🔍 CommunitiesContext refresh CALLED - authLoading:', authLoading, 'user:', !!user);
    
    if (authLoading) {
      console.log('🔍 CommunitiesContext refresh: Auth still loading, skipping');
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      console.log('🔍 CommunitiesContext refresh: Cancelling previous refresh timeout');
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debounce refresh calls
    refreshTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 CommunitiesContext refresh: Starting fetch...');
        await Promise.all([
          fetchUserCommunities(),
          fetchAllCommunities(),
        ]);
        console.log('🔍 CommunitiesContext refresh: Fetch completed');
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
    console.log('🔍 CommunitiesContext useEffect TRIGGERED:', { authLoading, userId: user?.id });
    
    // Only proceed if auth is definitely not loading
    // Be more permissive - sometimes authLoading might flicker
    if (!authLoading) {
      console.log('🔄 CommunitiesContext: Auth ready, loading data');
      // Small delay to ensure auth is stable
      const stableDelay = setTimeout(() => {
        refresh();
      }, 50);
      
      return () => {
        clearTimeout(stableDelay);
        if (refreshTimeoutRef.current) {
          console.log('🔍 CommunitiesContext: Cleaning up refresh timeout');
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    } else {
      console.log('🔄 CommunitiesContext: Auth still loading, waiting...');
    }

    // Cleanup function for when auth is loading
    return () => {
      if (refreshTimeoutRef.current) {
        console.log('🔍 CommunitiesContext: Cleaning up refresh timeout (auth loading)');
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [authLoading, user?.id]); // Will trigger on auth changes AND initial mount

  const value: CommunitiesContextType = {
    userCommunities,
    allCommunities,
    loading,
    error,
    refresh,
    joinCommunity,
    leaveCommunity,
  };

  return (
    <CommunitiesContext.Provider value={value}>
      {children}
    </CommunitiesContext.Provider>
  );
}

// Custom hook to use communities context
export function useCommunities() {
  const context = useContext(CommunitiesContext);
  if (context === undefined) {
    throw new Error('useCommunities must be used within a CommunitiesProvider');
  }
  return context;
}
