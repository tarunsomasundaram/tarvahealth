import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  phone: string | null;
  age: number | null;
  height_value: number | null;
  height_unit: string;
  weight_value: number | null;
  weight_unit: string;
  blood_group: string | null;
  allergies_text: string | null;
  condition_other_text: string | null;
  timezone: string;
  share_profile_in_forum: boolean;
  passcode_enabled: boolean;
  avatar_url: string | null;
  role: string;
}

export interface Condition {
  id: string;
  name: string;
  category: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [userConditionIds, setUserConditionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If profile exists but is missing name/avatar, sync from Google OAuth metadata
      if (profileData) {
        const googleMetadata = user.user_metadata;
        const needsSync = 
          (!profileData.full_name && googleMetadata?.full_name) ||
          (!profileData.avatar_url && googleMetadata?.avatar_url);

        if (needsSync) {
          const updates: Partial<UserProfile> = {};
          if (!profileData.full_name && googleMetadata?.full_name) {
            updates.full_name = googleMetadata.full_name;
          }
          if (!profileData.avatar_url && googleMetadata?.avatar_url) {
            updates.avatar_url = googleMetadata.avatar_url;
          }

          // Update the database with Google metadata
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', user.id);

          if (!updateError) {
            setProfile({ ...profileData, ...updates } as UserProfile);
          } else {
            setProfile(profileData as UserProfile);
          }
        } else {
          setProfile(profileData as UserProfile);
        }
      } else {
        // No profile exists yet, use Google metadata as fallback display
        const googleMetadata = user.user_metadata;
        if (googleMetadata) {
          setProfile({
            user_id: user.id,
            full_name: googleMetadata.full_name || googleMetadata.name || null,
            avatar_url: googleMetadata.avatar_url || googleMetadata.picture || null,
          } as UserProfile);
        }
      }

      // Fetch user conditions
      const { data: userConditionsData, error: conditionsError } = await supabase
        .from('user_conditions')
        .select('condition_id')
        .eq('user_id', user.id);

      if (conditionsError) throw conditionsError;

      setUserConditionIds(userConditionsData?.map(uc => uc.condition_id) || []);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchConditionsCatalog = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conditions_catalog')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setConditions(data as Condition[]);
    } catch (err) {
      console.error('Error fetching conditions catalog:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchConditionsCatalog();
  }, [fetchProfile, fetchConditionsCatalog]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const updateConditions = useCallback(async (conditionIds: string[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Delete existing conditions
      await supabase
        .from('user_conditions')
        .delete()
        .eq('user_id', user.id);

      // Insert new conditions
      if (conditionIds.length > 0) {
        const inserts = conditionIds.map(condition_id => ({
          user_id: user.id,
          condition_id
        }));

        const { error } = await supabase
          .from('user_conditions')
          .insert(inserts);

        if (error) throw error;
      }

      setUserConditionIds(conditionIds);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const getProfileCompletionPercentage = useCallback(() => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 5;
    
    if (profile.age) completed++;
    if (profile.height_value) completed++;
    if (profile.blood_group) completed++;
    if (userConditionIds.length > 0) completed++;
    if (profile.full_name) completed++;
    
    return Math.round((completed / total) * 100);
  }, [profile, userConditionIds]);

  return {
    profile,
    conditions,
    userConditionIds,
    loading,
    error,
    updateProfile,
    updateConditions,
    getProfileCompletionPercentage,
    refreshProfile: fetchProfile,
  };
}
