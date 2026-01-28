import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface AccessLog {
  id: string;
  caregiver_user_id: string;
  caregiver_name: string | null;
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

      // Fetch access logs
      const { data: logs, error: logsError } = await supabase
        .from("caregiver_access_logs")
        .select("id, caregiver_user_id, resource_type, action, created_at, metadata")
        .eq("patient_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (logsError) throw logsError;
      if (!logs || logs.length === 0) return [];

      // Get unique caregiver IDs
      const caregiverIds = [...new Set(logs.map(log => log.caregiver_user_id))];

      // Fetch caregiver profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name")
        .in("user_id", caregiverIds);

      // Create a map of caregiver_id to name
      const nameMap = new Map(
        profiles?.map(p => [p.user_id, p.full_name]) || []
      );

      // Merge names into logs
      return logs.map(log => ({
        ...log,
        caregiver_name: nameMap.get(log.caregiver_user_id) || null,
      })) as AccessLog[];
    },
    enabled: !!user?.id,
  });
}
