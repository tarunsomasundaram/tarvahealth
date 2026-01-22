import { motion } from "framer-motion";
import { Shield, Eye, Calendar, BarChart3, Pill, Clock } from "lucide-react";
import { useAccessLogs } from "@/hooks/use-access-logs";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/common/Skeleton";

const resourceTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  dose_logs: { icon: Pill, label: "Dose History", color: "text-primary" },
  medications: { icon: Pill, label: "Medications", color: "text-primary" },
  calendar: { icon: Calendar, label: "Calendar", color: "text-success" },
  stats: { icon: BarChart3, label: "Statistics", color: "text-warning" },
  home: { icon: Eye, label: "Dashboard", color: "text-muted-foreground" },
};

export function PrivacyAccessCard() {
  const { data: logs, isLoading } = useAccessLogs(5);

  const getResourceConfig = (resourceType: string) => {
    return resourceTypeConfig[resourceType] || { 
      icon: Eye, 
      label: resourceType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      color: "text-muted-foreground"
    };
  };

  return (
    <motion.div
      className="card-tarva"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
          <Shield className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Privacy & Access</h3>
          <p className="text-xs text-muted-foreground">Recent caregiver activity</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : logs && logs.length > 0 ? (
          logs.map((log) => {
            const config = getResourceConfig(log.resource_type);
            const Icon = config.icon;
            
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-background ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Viewed {config.label}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <Shield className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent caregiver activity</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
