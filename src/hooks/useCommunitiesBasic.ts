// Temporary compatibility export - redirect to new useCommunities
import { useCommunities } from './useCommunities';

export function useCommunitiesBasic() {
  const { userCommunities, loading, error, refresh } = useCommunities();
  
  return {
    myCommunities: userCommunities,
    allCommunities: [],
    loading,
    error,
    refresh,
  };
}