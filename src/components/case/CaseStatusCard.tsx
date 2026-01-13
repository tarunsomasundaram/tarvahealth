import { Battery, Bluetooth, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStatusCardProps {
  batteryLevel: number;
  isConnected: boolean;
  lastSync: string;
  onSync: () => void;
}

export function CaseStatusCard({
  batteryLevel,
  isConnected,
  lastSync,
  onSync,
}: CaseStatusCardProps) {
  const getBatteryColor = () => {
    if (batteryLevel <= 20) return "text-destructive";
    if (batteryLevel <= 40) return "text-warning";
    return "text-success";
  };

  return (
    <div className="card-tarva">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-section text-foreground">Case Status</h3>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Battery className={cn("h-6 w-6", getBatteryColor())} />
              <span className="text-2xl font-bold text-foreground">{batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bluetooth className={cn("h-4 w-4", isConnected ? "text-success" : "text-muted-foreground")} />
              <span className={cn(
                "badge-status",
                isConnected ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              )}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-small">Last sync: {lastSync}</p>
        </div>
      </div>
      <button onClick={onSync} className="btn-secondary mt-4 w-full">
        <RefreshCw className="h-4 w-4" />
        Sync Now
      </button>
    </div>
  );
}
