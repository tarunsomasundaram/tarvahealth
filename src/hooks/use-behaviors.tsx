import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export interface BehaviorCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface Behavior {
  id: string;
  category_id: string | null;
  name: string;
  prompt: string | null;
  tags: string[] | null;
  sort_order: number;
  is_active: boolean;
}

export interface UserBehavior {
  id: string;
  user_id: string;
  behavior_id: string;
  selected: boolean;
  selected_at: string;
}

export function useBehaviors() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<BehaviorCategory[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [userBehaviors, setUserBehaviors] = useState<UserBehavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBehaviors = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('behavior_categories')
        .select('*')
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData as BehaviorCategory[]);

      // Fetch behaviors
      const { data: behaviorsData, error: behaviorsError } = await supabase
        .from('behaviors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (behaviorsError) throw behaviorsError;
      setBehaviors(behaviorsData as Behavior[]);

      // Fetch user behaviors if logged in
      if (user) {
        const { data: userBehaviorsData, error: userBehaviorsError } = await supabase
          .from('user_behaviors')
          .select('*')
          .eq('user_id', user.id);

        if (userBehaviorsError) throw userBehaviorsError;
        setUserBehaviors(userBehaviorsData as UserBehavior[]);
      }

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching behaviors:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBehaviors();
  }, [fetchBehaviors]);

  const toggleBehavior = useCallback(async (behaviorId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const existing = userBehaviors.find(ub => ub.behavior_id === behaviorId);

      if (existing) {
        // Toggle existing
        if (existing.selected) {
          // Delete
          const { error } = await supabase
            .from('user_behaviors')
            .delete()
            .eq('id', existing.id);

          if (error) throw error;
          setUserBehaviors(prev => prev.filter(ub => ub.id !== existing.id));
        } else {
          // Update to selected
          const { error } = await supabase
            .from('user_behaviors')
            .update({ selected: true, selected_at: new Date().toISOString() })
            .eq('id', existing.id);

          if (error) throw error;
          setUserBehaviors(prev => 
            prev.map(ub => ub.id === existing.id ? { ...ub, selected: true } : ub)
          );
        }
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_behaviors')
          .insert({
            user_id: user.id,
            behavior_id: behaviorId,
            selected: true,
          })
          .select()
          .single();

        if (error) throw error;
        setUserBehaviors(prev => [...prev, data as UserBehavior]);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, userBehaviors]);

  const setSelectedBehaviors = useCallback(async (behaviorIds: string[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Delete all existing
      await supabase
        .from('user_behaviors')
        .delete()
        .eq('user_id', user.id);

      // Insert new selections
      if (behaviorIds.length > 0) {
        const inserts = behaviorIds.map(behavior_id => ({
          user_id: user.id,
          behavior_id,
          selected: true,
        }));

        const { data, error } = await supabase
          .from('user_behaviors')
          .insert(inserts)
          .select();

        if (error) throw error;
        setUserBehaviors(data as UserBehavior[]);
      } else {
        setUserBehaviors([]);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user]);

  const selectedBehaviorIds = userBehaviors
    .filter(ub => ub.selected)
    .map(ub => ub.behavior_id);

  const getBehaviorsByCategory = useCallback((categoryId: string): Behavior[] => {
    return behaviors.filter(b => b.category_id === categoryId);
  }, [behaviors]);

  return {
    categories,
    behaviors,
    userBehaviors,
    selectedBehaviorIds,
    loading,
    error,
    toggleBehavior,
    setSelectedBehaviors,
    getBehaviorsByCategory,
    refreshBehaviors: fetchBehaviors,
  };
}
