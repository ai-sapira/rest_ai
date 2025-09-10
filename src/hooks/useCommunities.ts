import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface CommunityRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hashtag: string | null;
  is_public: boolean;
  avatar_url: string | null;
  member_count: number;
}

export function useCommunities() {
  const [allCommunities, setAllCommunities] = useState<CommunityRow[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("communities")
        .select("id, slug, name, description, hashtag, is_public, avatar_url, member_count")
        .order("member_count", { ascending: false });

      if (error) throw error;
      
      // Deduplicate by id just in case
      const uniqueCommunities = (data || []).filter((community, index, self) => 
        community && self.findIndex(c => c?.id === community.id) === index
      ) as CommunityRow[];
      
      console.log('fetchAll: Got', (data || []).length, 'total,', uniqueCommunities.length, 'unique communities');
      setAllCommunities(uniqueCommunities);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMine = async () => {
    try {
      setLoading(true);
      
      // Get current user first
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.log('No authenticated user, clearing my communities');
        setMyCommunities([]);
        return;
      }

      const { data, error } = await supabase
        .from("community_members")
        .select("communities(id, slug, name, description, hashtag, is_public, avatar_url, member_count)")
        .eq('user_id', userData.user.id);

      if (error) throw error;
      
      // Map and deduplicate by community id
      const mapped = (data || []).map((row: any) => row.communities) as CommunityRow[];
      const uniqueCommunities = mapped.filter((community, index, self) => 
        community && self.findIndex(c => c?.id === community.id) === index
      );
      
      console.log('fetchMine: Got', mapped.length, 'total,', uniqueCommunities.length, 'unique communities');
      setMyCommunities(uniqueCommunities);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchMine();
  }, []);

  return { allCommunities, myCommunities, loading, error, refetchAll: fetchAll, refetchMine: fetchMine };
}

