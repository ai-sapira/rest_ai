/**
 * SIMPLE Profile Hook - React Query Direct Approach
 * Replaces complex useProfile with clean, maintainable code
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Types from original hook
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  professional_title?: string;
  professional_summary?: string;
  years_experience?: number;
  specialties?: string[];
  is_verified: boolean;
  profile_picture?: string;
  phone?: string;
  location?: {
    city: string;
    region: string;
    country: string;
  };
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy_settings: {
    profile_public: boolean;
    show_phone: boolean;
    show_email: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  institution_name: string;
  degree_title: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
  certification_type: 'degree' | 'certification' | 'course' | 'workshop';
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MAIN HOOK - ONE QUERY, ALL DATA
// ============================================================================

export function useProfileSimple(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  // ✅ ONE QUERY FOR EVERYTHING - Promise.all makes it parallel
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID provided');

      // 🚀 PARALLEL QUERIES - 3x faster than sequential
      const [profileResult, workExperiencesResult, educationResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single(),
        
        supabase
          .from('work_experiences')
          .select('*')
          .eq('user_id', targetUserId)
          .order('display_order', { ascending: false })
          .order('start_date', { ascending: false }),
        
        supabase
          .from('education')
          .select('*')
          .eq('user_id', targetUserId)
          .order('display_order', { ascending: false })
          .order('start_date', { ascending: false })
      ]);

      // Handle profile not found (common case)
      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw profileResult.error;
      }
      
      if (workExperiencesResult.error) throw workExperiencesResult.error;
      if (educationResult.error) throw educationResult.error;

      return {
        profile: profileResult.data,
        workExperiences: workExperiencesResult.data || [],
        education: educationResult.data || [],
      };
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache - balance between fresh data and performance
  });

  // Extract data with safe defaults
  const profile = data?.profile;
  const workExperiences = data?.workExperiences || [];
  const education = data?.education || [];

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const calculateTotalExperience = (): number => {
    return workExperiences.reduce((total, exp) => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + Math.max(0, years);
    }, 0);
  };

  // ============================================================================
  // MUTATIONS - SIMPLE AND DIRECT
  // ============================================================================

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
      
      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      // ✅ Smart cache invalidation - only this user's profile
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const createWorkExperience = useMutation({
    mutationFn: async (data: Omit<WorkExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('work_experiences')
        .insert([{ ...data, user_id: user.id, display_order: workExperiences.length }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const updateWorkExperience = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkExperience> }) => {
      const { error } = await supabase
        .from('work_experiences')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const deleteWorkExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_experiences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const createEducation = useMutation({
    mutationFn: async (data: Omit<Education, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('education')
        .insert([{ ...data, user_id: user.id, display_order: education.length }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const updateEducation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Education> }) => {
      const { error } = await supabase
        .from('education')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  // ============================================================================
  // RETURN - CLEAN API, SAME AS BEFORE
  // ============================================================================

  return {
    // Data
    profile,
    workExperiences,
    education,
    loading,
    error: error?.message || null,
    
    // Utilities
    getDisplayName,
    calculateTotalExperience,
    
    // Actions - simplified API
    upsertProfile: async (data: Partial<UserProfile>) => {
      try {
        await updateProfile.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error updating profile:', err);
        return false;
      }
    },
    
    createWorkExperience: async (data: any) => {
      try {
        await createWorkExperience.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error creating work experience:', err);
        return false;
      }
    },
    
    updateWorkExperience: async (id: string, data: any) => {
      try {
        await updateWorkExperience.mutateAsync({ id, data });
        return true;
      } catch (err) {
        console.error('Error updating work experience:', err);
        return false;
      }
    },
    
    deleteWorkExperience: async (id: string) => {
      try {
        await deleteWorkExperience.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting work experience:', err);
        return false;
      }
    },
    
    createEducation: async (data: any) => {
      try {
        await createEducation.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error creating education:', err);
        return false;
      }
    },
    
    updateEducation: async (id: string, data: any) => {
      try {
        await updateEducation.mutateAsync({ id, data });
        return true;
      } catch (err) {
        console.error('Error updating education:', err);
        return false;
      }
    },
    
    deleteEducation: async (id: string) => {
      try {
        await deleteEducation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting education:', err);
        return false;
      }
    },
    
    // Loading states for UI feedback
    isUpdatingProfile: updateProfile.isPending,
    isCreatingWorkExperience: createWorkExperience.isPending,
    isUpdatingWorkExperience: updateWorkExperience.isPending,
    isDeletingWorkExperience: deleteWorkExperience.isPending,
    isCreatingEducation: createEducation.isPending,
    isUpdatingEducation: updateEducation.isPending,
    isDeletingEducation: deleteEducation.isPending,
  };
}
