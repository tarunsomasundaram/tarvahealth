import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface AccessLog {
  id: string;
  caregiver_user_id: string;
  resource_type: string;
  action: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export function useAccessLogs(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["access-logs", user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("caregiver_access_logs")
        .select("id, caregiver_user_id, resource_type, action, created_at, metadata")
        .eq("patient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AccessLog[];
    },
    enabled: !!user?.id,
  });
}
