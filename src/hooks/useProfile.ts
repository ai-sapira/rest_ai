import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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

export interface CreateWorkExperienceData {
  company_name: string;
  position_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
}

export interface CreateEducationData {
  institution_name: string;
  degree_title: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
  certification_type: 'degree' | 'certification' | 'course' | 'workshop';
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch work experiences
  const fetchWorkExperiences = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', targetUserId)
        .order('display_order', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setWorkExperiences(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching work experiences');
    }
  };

  // Fetch education
  const fetchEducation = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', targetUserId)
        .order('display_order', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching education');
    }
  };

  // Create or update profile
  const upsertProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!user) {
      setError('User must be logged in');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: user.id,
            ...profileData,
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      await fetchProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
      return false;
    }
  };

  // Create work experience
  const createWorkExperience = async (data: CreateWorkExperienceData): Promise<boolean> => {
    if (!user) {
      setError('User must be logged in');
      return false;
    }

    try {
      // Normalize optional fields to avoid empty strings being sent to PostgREST
      const normalizedInsert: Record<string, any> = {
        user_id: user.id,
        company_name: data.company_name,
        position_title: data.position_title,
        start_date: data.start_date,
        is_current: data.is_current,
        display_order: workExperiences.length,
      };
      if (data.location && data.location.trim() !== '') {
        normalizedInsert.location = data.location;
      }
      if (!data.is_current && data.end_date && data.end_date.trim() !== '') {
        normalizedInsert.end_date = data.end_date;
      }
      if (data.description && data.description.trim() !== '') {
        normalizedInsert.description = data.description;
      }

      const { error } = await supabase
        .from('work_experiences')
        .insert([normalizedInsert]);

      if (error) throw error;

      await fetchWorkExperiences();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating work experience');
      return false;
    }
  };

  // Update work experience
  const updateWorkExperience = async (id: string, data: Partial<CreateWorkExperienceData>): Promise<boolean> => {
    try {
      // Allow clearing fields and ensure proper nulls for DB where applicable
      const normalizedUpdate: Record<string, any> = {};
      if (typeof data.company_name !== 'undefined') normalizedUpdate.company_name = data.company_name;
      if (typeof data.position_title !== 'undefined') normalizedUpdate.position_title = data.position_title;
      if (typeof data.start_date !== 'undefined') normalizedUpdate.start_date = data.start_date;
      if (typeof data.is_current !== 'undefined') normalizedUpdate.is_current = data.is_current;

      if (typeof data.location !== 'undefined') {
        normalizedUpdate.location = data.location && data.location.trim() !== '' ? data.location : null;
      }

      if (typeof data.description !== 'undefined') {
        normalizedUpdate.description = data.description && data.description.trim() !== '' ? data.description : null;
      }

      if (typeof data.end_date !== 'undefined' || typeof data.is_current !== 'undefined') {
        // If is_current true, force end_date to null; else keep provided value or null if empty
        if (data.is_current === true) {
          normalizedUpdate.end_date = null;
        } else if (typeof data.end_date !== 'undefined') {
          normalizedUpdate.end_date = data.end_date && data.end_date.trim() !== '' ? data.end_date : null;
        }
      }

      const { error } = await supabase
        .from('work_experiences')
        .update(normalizedUpdate)
        .eq('id', id);

      if (error) throw error;

      await fetchWorkExperiences();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating work experience');
      return false;
    }
  };

  // Delete work experience
  const deleteWorkExperience = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchWorkExperiences();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting work experience');
      return false;
    }
  };

  // Create education
  const createEducation = async (data: CreateEducationData): Promise<boolean> => {
    if (!user) {
      setError('User must be logged in');
      return false;
    }

    try {
      const { error } = await supabase
        .from('education')
        .insert([{
          user_id: user.id,
          ...data,
          display_order: education.length
        }]);

      if (error) throw error;

      await fetchEducation();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating education');
      return false;
    }
  };

  // Update education
  const updateEducation = async (id: string, data: Partial<CreateEducationData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('education')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchEducation();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating education');
      return false;
    }
  };

  // Delete education
  const deleteEducation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEducation();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting education');
      return false;
    }
  };

  // Get display name
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

  // Calculate total years of experience
  const calculateTotalExperience = (): number => {
    return workExperiences.reduce((total, exp) => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + Math.max(0, years);
    }, 0);
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchWorkExperiences();
      fetchEducation();
    }
  }, [targetUserId]);

  return {
    profile,
    workExperiences,
    education,
    loading,
    error,
    upsertProfile,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    createEducation,
    updateEducation,
    deleteEducation,
    getDisplayName,
    calculateTotalExperience,
    refreshProfile: fetchProfile,
    refreshWorkExperiences: fetchWorkExperiences,
    refreshEducation: fetchEducation
  };
}
