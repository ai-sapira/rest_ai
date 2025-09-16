/**
 * Optimized profile hook using React Query
 * Replaces the problematic useProfile.ts with cached, efficient queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userQueries, queryKeys } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { CreateWorkExperienceData, CreateEducationData } from '@/hooks/useProfile';

export function useOptimizedProfile(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  // Get complete profile data in one optimized query
  const {
    data: profileData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.userComplete(targetUserId!),
    queryFn: () => userQueries.completeProfile(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Individual data pieces
  const profile = profileData?.profile;
  const workExperiences = profileData?.workExperiences || [];
  const education = profileData?.education || [];

  // Utility functions
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

  // Mutations for profile updates
  const upsertProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          { user_id: user.id, ...profileData },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;
      return profileData;
    },
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  // Work Experience mutations
  const createWorkExperienceMutation = useMutation({
    mutationFn: async (data: CreateWorkExperienceData) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('work_experiences')
        .insert([{
          user_id: user.id,
          ...data,
          display_order: workExperiences.length
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  const updateWorkExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWorkExperienceData> }) => {
      const { error } = await supabase
        .from('work_experiences')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  const deleteWorkExperienceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_experiences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  // Education mutations
  const createEducationMutation = useMutation({
    mutationFn: async (data: CreateEducationData) => {
      if (!user) throw new Error('User must be logged in');
      
      const { error } = await supabase
        .from('education')
        .insert([{
          user_id: user.id,
          ...data,
          display_order: education.length
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEducationData> }) => {
      const { error } = await supabase
        .from('education')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userComplete(targetUserId!) });
    },
  });

  return {
    // Data
    profile,
    workExperiences,
    education,
    loading,
    error: error?.message || null,
    
    // Utility functions
    getDisplayName,
    calculateTotalExperience,
    
    // Profile mutations
    upsertProfile: async (data: any) => {
      try {
        await upsertProfileMutation.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error updating profile:', err);
        return false;
      }
    },
    
    // Work experience mutations
    createWorkExperience: async (data: CreateWorkExperienceData) => {
      try {
        await createWorkExperienceMutation.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error creating work experience:', err);
        return false;
      }
    },
    
    updateWorkExperience: async (id: string, data: Partial<CreateWorkExperienceData>) => {
      try {
        await updateWorkExperienceMutation.mutateAsync({ id, data });
        return true;
      } catch (err) {
        console.error('Error updating work experience:', err);
        return false;
      }
    },
    
    deleteWorkExperience: async (id: string) => {
      try {
        await deleteWorkExperienceMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting work experience:', err);
        return false;
      }
    },
    
    // Education mutations
    createEducation: async (data: CreateEducationData) => {
      try {
        await createEducationMutation.mutateAsync(data);
        return true;
      } catch (err) {
        console.error('Error creating education:', err);
        return false;
      }
    },
    
    updateEducation: async (id: string, data: Partial<CreateEducationData>) => {
      try {
        await updateEducationMutation.mutateAsync({ id, data });
        return true;
      } catch (err) {
        console.error('Error updating education:', err);
        return false;
      }
    },
    
    deleteEducation: async (id: string) => {
      try {
        await deleteEducationMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting education:', err);
        return false;
      }
    },
    
    // Loading states for mutations
    isUpdatingProfile: upsertProfileMutation.isPending,
    isCreatingWorkExperience: createWorkExperienceMutation.isPending,
    isUpdatingWorkExperience: updateWorkExperienceMutation.isPending,
    isDeletingWorkExperience: deleteWorkExperienceMutation.isPending,
    isCreatingEducation: createEducationMutation.isPending,
    isUpdatingEducation: updateEducationMutation.isPending,
    isDeletingEducation: deleteEducationMutation.isPending,
  };
}
